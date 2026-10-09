/* ============================================================
 * registry.js · 全库注册
 * ============================================================
 * 单一职责：把 324 条条目 + 32 条工具 + 537 个节点
 * 全部登记到码表与解析器，让任意一个都能被编码或中文名引用。
 *
 * 加载顺序（谁先谁后不能错）：
 *   codes.js → schema.js → lib-*.js → data-*.js → registry.js
 * registry.js 必须最后执行，它依赖前面全部到位。
 *
 * 为什么单独一个文件而不是塞进 engine.js：
 *   engine.js 负责「组合与变形」的逻辑，
 *   这里只负责「登记」，两者变化频率不同，分开才不会互相拖。
 * ============================================================ */
/* 浏览器 / vm 下需要挂全局：CommonJS 里 `var` 是模块作用域不是全局，
   只写 module.exports 的话页面里 REGISTRY 会是 undefined。
   与 schema.js 同一个坑，登记处补齐。 */
var REGISTRY = (function () {

  var report = {
    entries: 0, tools: 0, nodes: 0,
    uncoded: [],        // 派生不出编码的
    collided: [],       // 撞码的
    dupZh: [],          // 中文名重名的
    registers: 0,
    works: 0,           // WK 段的作品条数
    /* 授权等级分布。R0/R1/R2/R3 四档。
       数字必须是真的——它是「本库有多少内容能直接商用」的唯一凭据，
       写死或估算等于给自己埋一颗假安心的雷。 */
    rights: { R0: 0, R1: 0, R2: 0, R3: 0 },
    r3: []              // R3 条目清单，供体检脚本与文档引用
  };

  /* 依赖通过参数传入，不依赖全局。
   原因：Node 的 CommonJS 里 `var` 是模块作用域，不是全局——
   浏览器下能跑、require 就 ReferenceError 的坑已经踩过一次。
   调用方（index.html / build_md.js）负责把 CODES / RESOLVER / ENGINE 传进来。 */
  function boot(sources) {
    sources = sources || {};
    var CODES = sources.CODES || null;
    var RESOLVER = sources.RESOLVER || null;
    var ENGINE = sources.ENGINE || null;
    var CODE_MAP = sources.CODE_MAP || null;
    var RIGHTS = sources.RIGHTS || null;
if (!CODES || !RESOLVER) return report;
if (RESOLVER.entries.length) return report;      // 已装配过，不重复登记
/* 解析器需要码表做简写归一（A1-1 → A1-001），这里顺手注入，
   调用方就不必各自记得调一次。 */
if (typeof RESOLVER.inject === "function") RESOLVER.inject(CODES, CODE_MAP);

    var data = sources.data || {};

    /* ---------- 0. 作品索引（必须最先建） ----------
       十个地区段合并成单一的 WK 段，新号取决于作品在全集里的位置。
       所以要先拿到全部作品旧号、排出顺序，再注入 CODES。
       顺序错一位，两个人的 WK-001 就会指向不同作品——
       这类错误运行时完全正常，只有对着编号表核才发现。 */
    var works = [].concat(data.entries || [], data.tools || [])
      .map(function (d) { return d.id; })
      .filter(function (id) { return /^W-[A-Z]\d{1,3}$/.test(String(id).toUpperCase()); });

    var workIndex = {};
    if (works.length && CODE_MAP && typeof CODE_MAP.buildWorks === "function") {
      CODE_MAP.buildWorks(works);
      /* 反查表：地区码+三位序号 → WK 序号。
         code-map.js 持有排序规则，registry 只取结果，
         这样「作品怎么排」只有一个真源。 */
      var order = CODE_MAP.LEGACY;
      Object.keys(order).forEach(function (legacyCode) {
        var m = legacyCode.match(/^(W-[A-Z])-(\d{3})$/);
        if (m) workIndex[m[1] + m[2]] = order[legacyCode];
      });
      report.works = works.length;
    }
    if (typeof CODES.setWorkIndex === "function") CODES.setWorkIndex(workIndex);

    /* ---------- 0b. 非作品段的旧码登记 ----------
       作品段的 buildWorks 已经把四种写法都登记了，
       非作品段却一直没有真源——以前靠人手逐段调ensure()，
       实际一次都没调过。结果 forward() 只能靠形态解析兜底，
       而形态解析不认「无连字符」写法，用户照数据源抄到的 A101 就查不到。

       条数从 data.entries 现算，不写死：写死的段条数一改就错，
       而这种错同样不报错（只是那个号的别名少登记了）。 */
    if (CODE_MAP && typeof CODE_MAP.ensureAll === "function") {
      var segCount = {};
      /* 按已知段前缀逐个剥，不用正则猜形态。
         正则写法（/[A-Z]\d-[A-Z]?/ 这类）已经试错两次：
         「字母+数字」段（A1）和「纯字母」段（G/T/N/S）的分隔符不同，
         一条正则兼顾不了，改一处漏一处，而且漏了不报错。
         段清单本身是有限的 11 个，写明比正则清楚。 */
      var LEGACY_SEGS = ["A1", "A2", "A3", "A4", "A5", "G", "LT", "PL", "T", "N", "S"];
      [].concat(data.entries || [], data.tools || []).forEach(function (d) {
        var id = String(d.id || "").toUpperCase();
        if (id.indexOf("W-") === 0) return;       /* 作品段由 buildWorks 处理 */
        for (var i = 0; i < LEGACY_SEGS.length; i++) {
          var seg = LEGACY_SEGS[i];
          if (id.indexOf(seg) !== 0) continue;
          /* 切掉段前缀，剩下的开头必须全是数字才算这一段。
             否则 LT-01 会被 L 之类的前缀误领（这里不猜，直接排除）。 */
          var rest = id.slice(seg.length).replace(/^-+/, "");
          if (!/^\d{1,3}$/.test(rest)) continue;
          segCount[seg] = Math.max(segCount[seg] || 0, parseInt(rest, 10));
          break;
        }
      });
      var registered = CODE_MAP.ensureAll(segCount);
      report.legacySegments = Object.keys(segCount).length;
      report.legacyKeys = registered;
      report.legacySegList = Object.keys(segCount).join(",");
    }

    /* ---------- 1. 十二库节点 ----------
       直接取 ENGINE.NODES，而不是自己 import 十几个 LIB_* 变量。
       原因：库文件名与导出名不对应（02/03 库在 lib-form.js 里，
       导出名是 LIB_FORM），手写映射必然有一天对不上。
       ENGINE.NODES 是引擎自己合并好的全集，天然是唯一真源。 */
    var nodes = (ENGINE && ENGINE.NODES) ? ENGINE.NODES : [];
    nodes.forEach(function (n) {
      var code = CODES.add(n.id);
      if (!code) {
        var msg = n.id + " " + n.zh;
        if (CODES.UNCODED.some(function (x) { return x.indexOf(n.id) === 0; })) report.collided.push(msg);
        else report.uncoded.push(msg);
        return;
      }
      RESOLVER.register(code, n.id, n.zh, n.en || "", {
        kw: n.kw || [], alt: n.alt || [],
        obj: n, kind: "node", lib: n.lib || "",
        rights: RIGHTS ? RIGHTS.inspect(n) : { tier: "R0", hits: [], basis: "default",
          reason: "未接入授权层" }
      });
      report.nodes++;
      if (RIGHTS) {
        var rt = RIGHTS.inspect(n).tier;
        report.rights[rt] = (report.rights[rt] || 0) + 1;
      }
    });

    /* ---------- 2. 可复制条目 + 工具条目 ---------- */
    /* 授权等级随登记一起落库，不在 UI 层现算：
       一条提示词会被很多地方读（卡片、组合、导出、CLI），
       每处各算一次迟早会出现某处算错而用户看不出来。
       算一次、存下来、只读，最省心也最安全。 */
    function regList(list, kind) {
      (list || []).forEach(function (d) {
        var code = CODES.add(d.id);
        if (!code) { report.uncoded.push(d.id + " " + d.zh); return; }
        var right = { tier: "R0", hits: [], basis: "default", reason: "未接入授权层" };
        if (RIGHTS) {
          var rep = RIGHTS.inspect(d);
          right = { tier: rep.tier, hits: rep.hits, basis: rep.basis,
                    reason: rep.reason, fields: rep.fields };
          report.rights[rep.tier] = (report.rights[rep.tier] || 0) + 1;
          if (rep.tier === "R3") report.r3.push(code + " " + d.zh);
        }
        RESOLVER.register(code, d.id, d.zh, d.en || d.romaji || "", {
          kw: d.kw || [], alt: d.alt || [],
          obj: d, kind: kind, rights: right
        });
        report[kind === "tool" ? "tools" : "entries"]++;
      });
    }

    /* 数据由调用方显式传入，不用 eval 去猜全局变量名。
       原因：eval 在严格 CSP 下会被直接拦掉，届时整个登记静默失败，
       表现为「码表空着但没有任何报错」——最难查的一类故障。
       registry.boot({ CODES, RESOLVER, ENGINE, RIGHTS, data: { entries, tools } })
       只认传进来的东西，传漏了在 report.missing 里能看见。 */
    regList(data.entries, "entry");
    regList(data.tools, "tool");

    report.missing = [];
    ["entries", "tools"].forEach(function (k) {
      if (!data[k] || !data[k].length) report.missing.push(k);
    });
    if (!nodes.length) report.missing.push("ENGINE.NODES");

    /* ---------- 3. 重名普查 ---------- */
    var zhCount = {};
    RESOLVER.entries.forEach(function (e) {
      zhCount[e.zh] = (zhCount[e.zh] || 0) + 1;
    });
    Object.keys(zhCount).forEach(function (z) {
      if (zhCount[z] > 1) report.dupZh.push(z + " ×" + zhCount[z]);
    });

    report.registers = RESOLVER.entries.length;
    return report;
  }

  return { boot: boot, report: report };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { REGISTRY: REGISTRY };