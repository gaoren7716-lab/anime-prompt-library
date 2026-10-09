/* ============================================================
 * resolver.js · 编码解析器
 * ============================================================
 * 用户的原话：「可以直接引用编码，或是中文名」。
 * 所以解析必须同时吃两种输入，且都要能命中同一条目。
 *
 * 五条入口（互为备份，见 resolve() 的 why 字段）：
 *   1. 规范编码   A1-001        唯一、可排序、机器友好
 *   2. 旧 ID      A1-01         历史主键，向后兼容
 *   3. 中文名     赛璐璐平涂      人最熟悉，但可能重名
 *   4. 英文名     Cel Shading   跨语言场景
 *   5. 别名/译名   写实赛璐璐      容错，包括常见误写
 *
 * 解析不出来时**必须说「找不到」并列出最接近的候选**，
 * 绝不返回一个猜测结果——这是本项目的一条硬约定：
 * 宁可让用户重输，也不能给他一个假的 code。
 * ============================================================ */
var RESOLVER = (function () {
  var CODES = null;    // 由 inject() 注入，见下方 lookup 处的说明
  var CODE_MAP = null; // 迁移表，负责「旧码还能不能解析」
  var entries = [];    // { code, oldId, zh, en, kw, alt, obj, kind }
  var byCode = {};     // code（小写）→ entry
  var byOld = {};      // oldId（小写）→ entry
  var byZh = {};       // 中文名（小写）→ [entry]
  var byEn = {};       // 英文名（小写）→ [entry]
  var byTerm = {};     // 别名/译名/kw → [entry]

  /* 归一化只做三件事：去首尾空白、压连续空格、全小写。
     刻意不做的事：
       - 不删「·」：中文名里的间隔号是名称的一部分
         （「苏联 · 东欧手绘」删了就变成「苏联  东欧手绘」，
           用户照原样输入反而命中不了）
       - 不统一全角括号：不同库括号里装的东西不同，改了会误并
     */
  function norm(s) {
    return String(s == null ? "" : s).trim().toLowerCase()
      .replace(/\s+/g, " ")
      /* 全角括号归一：输入法默认打全角，用户贴进来的常是半角，
         两种写法要能命中同一个条目。 */
      .replace(/[（]/g, "(").replace(/[）]/g, ")")
      .replace(/[·・]/g, "·");
  }

  /* 一个键是否值得进索引。两道筛：
       1. 括号必须配平。「系)」这类碎片就是这么来的——
          它自身有内容（所以「含汉字」这种检查拦不住它），
          但它是括号被切坏后的残段，检索价值为零，
          还会让「系)」命中两个完全无关的条目。
       2. 至少含一个字母或数字，否则是纯符号。
          判字母数字要用 Unicode 属性 \p{L}\p{N}：
          汉字与日文片假名（「アニメ」）都算字母，
          而 /[\w一-龥]/ 会把片假名判成不是字母。
     两条都写成通用规则，不点名具体字符串——
     下次换个名字切出别的碎片，同样能拦住。 */
  var HAS_LETTER = /[\p{L}\p{N}]/u;
  function usableKey(k) {
    if (!k) return false;
    var open = (k.match(/\(/g) || []).length;
    var close = (k.match(/\)/g) || []).length;
    if (open !== close) return false;      // 括号残段
    return HAS_LETTER.test(k);             // 纯符号
  }

  /* 中文名的检索键：原名、去括号注释名、末段词。
     三档由宽到窄，全都进索引，所以「苏联 · 东欧手绘」既能按全名命中，
     也能只按「东欧手绘」命中。

     切末段前必须先剥掉括号里的注释，否则会切出垃圾键：
     「美式卡通（Cartoon Network 系）」按空格切，末段是「系)」。
     括号内容已在 noParen 那一档单独处理过（整段作为一个键），
     末段词只需要从「去括号后的名字」里取。 */
  function zhKeys(zh) {
    var base = norm(zh);
    var out = [base];
    var noParen = base.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
    if (noParen && noParen !== base) out.push(noParen);
    var tail = noParen.split(/[\s·\/]/).filter(Boolean);
    if (tail.length > 1) out.push(tail[tail.length - 1]);
    /* 剥括号后不足两段（如「美式卡通（Cartoon Network 系）」剥完只剩「美式卡通」）
       就没有「末段词」这一档可给。原名与去括号名两档已在上面，
       这里直接不给——宁可少一个弱键，也不要造出「系)」这种垃圾键。 */
    return out.filter(usableKey);
  }

  function push(map, key, e) {
    if (!key) return;
    var k = norm(key);
    if (!k) return;
    (map[k] = map[k] || []).push(e);
  }

  /* ---------- 注册 ---------- */
  /* kind: "entry"=可复制条目  "tool"=模板/负面/语法  "node"=十二库节点 */
  function register(code, oldId, zh, en, opts) {
    opts = opts || {};
    var e = {
      code: code, oldId: oldId, zh: zh, en: en || "",
      kw: opts.kw || [], alt: opts.alt || [], obj: opts.obj || null,
      kind: opts.kind || "entry",
      lib: opts.lib || "",
      /* 授权等级随条目存下来，UI / 导出 / CLI 都只读这一份。
         不在读取时现算：同一个条目会被多处读，
         各自算一遍迟早有一处算错而用户看不出来。 */
      rights: opts.rights || null
    };
    entries.push(e);
    push(byCode, code, e);
    push(byOld, oldId, e);
    /* 旧码也进索引。段码体系改过一轮（A1-001 → ST-001、W-J-001 → WK-001），
       用户手里的组合串、笔记、截图用的还是旧码，
       它们必须在 byCode 里能查到，否则搜索旧码会显示「库里没有这一项」。

       注意不是「只有旧码能搜、新码搜不到」：新码始终在。
       这里是多登记一份，不是替换。 */
    if (CODE_MAP && typeof CODE_MAP.backward === "function") {
      var legacy = CODE_MAP.backward(code);
      if (legacy && legacy !== code) push(byCode, legacy, e);
    }
    zhKeys(zh).forEach(k => push(byZh, k, e));
    if (en) push(byEn, en, e);
    e.kw.forEach(k => push(byTerm, k, e));
    e.alt.forEach(k => push(byTerm, k, e));
    /* 中文名也进别名表，这样「提示词里写了中文名」也能反查回条目 */
    zhKeys(zh).forEach(k => push(byTerm, k, e));
    return e;
  }

  /* ---------- 精确解析 ---------- */
  function lookup(input) {
    var q = norm(input);
    if (!q) return [];

    /* 编码要能吃简写：ST-1 与 ST-001 同义，CB-1 与 CB-001-000 同义。
       normalize 负责补零，并按段码所属层级决定补几段——
       CB-1 是节点组，补成 CB-001-000 而不是 CB-001（那是首个子节点）。

       CODES 通过 inject() 注入而不是读全局：Node 的 CommonJS 里
       `var` 是模块作用域，require 时裸引用会 ReferenceError。 */
    if (CODES && typeof CODES.normalize === "function") {
      var n = CODES.normalize(q);
      if (n) { var h0 = byCode[norm(n)]; if (h0) return h0; }
    }
    var direct = byCode[q] || byOld[q] || byZh[q] || byEn[q] || byTerm[q];
    if (direct && direct.length) return direct;

    /* 旧码兜底：A1-001、W-J-001 这类已发布的编码必须还能解析。
       段码体系改版后它们不再是新码，但用户的组合串里存着。
       输出时统一给新码，所以这里查到后直接返回对应条目。 */
    if (CODE_MAP && typeof CODE_MAP.forward === "function") {
      var fwd = CODE_MAP.forward(input);
      if (fwd) { var h1 = byCode[norm(fwd)]; if (h1) return h1; }
    }
    return [];
  }

  /* 注入依赖。浏览器下 index.html 直接调 registry 时会走这里，
     Node 下由调用方显式调一次。 */
  function inject(codes, codeMap) {
    CODES = codes || null;
    CODE_MAP = codeMap || null;
  }

  /* 模糊兜底：分两级。
     第一级子串包含——「赛璐」能带出「赛璐璐平涂」。
     第二级编辑距离——用户打错字（「赛璐璐」写成「塞璐璐」）时
     子串完全失效，只靠它会一个候选都给不出，等于让用户干瞪眼。
     两级都拿不到才返回空数组，此时如实说明「没有相近项」。 */
  function dist(a, b) {
    /* Levenshtein，带上限剪枝：超过 2 就不可能是有用的建议 */
    if (Math.abs(a.length - b.length) > 2) return 99;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur.slice();
    }
    return prev[b.length];
  }

  function candidates(q, limit) {
    q = norm(q);
    if (!q) return [];
    var out = [], seenCode = {};
    function push(e, score) {
      if (seenCode[e.code]) return;
      seenCode[e.code] = 1;
      out.push({ code: e.code, zh: e.zh, kind: e.kind, score: score });
    }
    /* 第一级：子串 */
    entries.forEach(function (e) {
      var hay = norm([e.code, e.oldId, e.zh, e.en].join(" ") + " " + e.kw.join(" ") + " " + e.alt.join(" "));
      if (hay.indexOf(q) !== -1) push(e, 0);
    });
    /* 第二级：编辑距离。只在中文名之间比，且长度必须接近。
       为什么加长度约束：中文单字信息量低，距离 2 几乎必然是噪音——
       实测「cel shadng」会拉出「平静」「网络动画」，毫无参考价值。
       要求长度差 ≤1、距离 ≤1，才认为值得提示。 */
    if (out.length < 3) {
      var words = q.split(/\s+/).filter(w => w.length >= 2);
      var q0 = words[0] || q;
      entries.forEach(function (e) {
        if (seenCode[e.code]) return;
        var parts = norm(e.zh).split(/[\s·\/()（）]+/).filter(Boolean);
        var best = 99;
        for (var k = 0; k < parts.length; k++) {
          if (Math.abs(parts[k].length - q0.length) > 1) continue;
          var d = dist(q0, parts[k]);
          if (d < best) best = d;
        }
        if (best <= 1) push(e, best);
      });
    }
    return out.sort(function (a, b) { return a.score - b.score; })
      .slice(0, limit || 6);
  }

  /* ---------- 层级优先级 ----------
     跨层撞名时用来自动定「主选」。

     为什么要收敛而不是一律让用户消歧：本库有 86 个键同时命中节点与条目
     （「赛璐珞」「Cel Shading」「mecha」「废土」……）。
     这些词的共同点是——用户脑子里想的是「我要一个能直接用的画风/题材」，
     也就是 entry 或 tool，而不是十二库里那个同名节点。
     一律弹「请指定层级」等于把最常见的用法全部挡在门外，
     而这些人里绝大多数并不会去看候选里哪个写着「节点」。

     顺序即优先级：tool > entry > node。
       tool  工具条目（模板 / 负面词 / 平台语法）——最具体，直接可用
       entry 可复制条目（画风 / 作品 / 题材）——用户的默认意图
       node  十二库节点——是索引与装配的骨架，只有在想看结构时才要它

     关键约束：只有**跨层**才收敛。同层重名（如两个条目都叫「粉彩」）
     绝不能替用户选，那是真的分不清，必须列出来让他挑。 */
  var KIND_RANK = { tool: 0, entry: 1, node: 2 };

  /* 层级的中文名。放在这里而不是各 UI 各自写一份：
     「节点 / 条目 / 工具」这三个词在解析结论、编码总览、卡片角标
     三处都要出现，写三遍必然有一处漂移。 */
  function kindZh(kind) {
    return kind === "entry" ? "条目" : kind === "tool" ? "工具" : "节点";
  }

  /* 跨层收敛。返回 { primary, others } 或 null（不该收敛）。
     收敛了也必须把 others 如实带出去，界面要能展开看到被遮住的是谁。 */
  function converge(hits) {
    if (hits.length < 2) return null;
    var uniq = {}, list = [];
    hits.forEach(function (e) {
      if (uniq[e.code]) return;
      uniq[e.code] = 1;
      list.push(e);
    });
    if (list.length < 2) return null;
    var kinds = {};
    list.forEach(function (e) { kinds[e.kind] = 1; });
    /* 同层撞名 → 不收敛 */
    if (Object.keys(kinds).length < 2) return null;
    var sorted = list.slice().sort(function (a, b) {
      var d = (KIND_RANK[a.kind] === undefined ? 9 : KIND_RANK[a.kind])
            - (KIND_RANK[b.kind] === undefined ? 9 : KIND_RANK[b.kind]);
      return d !== 0 ? d : a.code.localeCompare(b.code);
    });
    return { primary: sorted[0], others: sorted.slice(1) };
  }

  /* ---------- 对外解析 ---------- */
  /* 返回 { ok, hits, why, code, zh, ... }
     ok=false 时 hits=[] 且必带 why 与 cand，绝不猜。 */
  function resolve(input) {
    var raw = String(input == null ? "" : input).trim();
    if (!raw) return { ok: false, why: "空输入", hits: [], cand: [] };

    var hits = lookup(raw);

    if (hits.length === 1) {
      var e = hits[0];
      return {
        ok: true, hits: hits, input: raw, code: e.code, oldId: e.oldId,
        zh: e.zh, en: e.en, kind: e.kind, obj: e.obj, lib: e.lib,
        rights: e.rights,
        why: "唯一命中"
      };
    }

    if (hits.length > 1) {
      /* 跨层撞名：按层级自动定主选，其余作为次选一并带出。
         仍然如实告知「替你选了哪个、还有谁同名」——
         静默替用户选与静默丢弃一样，都是让人以为没出错。 */
      var cv = converge(hits);
      if (cv) {
        return {
          ok: true, hits: hits, input: raw,
          code: cv.primary.code, oldId: cv.primary.oldId,
          zh: cv.primary.zh, en: cv.primary.en, kind: cv.primary.kind,
          obj: cv.primary.obj, lib: cv.primary.lib,
          converged: true,
          shadowed: cv.others,
          why: "跨层同名，已按层级取「" + kindZh(cv.primary.kind) + "」层"
        };
      }
      /* 同层重名是真的分不清，不替用户选。 */
      return {
        ok: false, ambiguous: true, hits: hits, input: raw,
        why: "命中 " + hits.length + " 条重名，请指定层级或用编码",
        cand: hits.slice(0, 8)
      };
    }

    return {
      ok: false, why: "库中没有这一项", input: raw, hits: [],
      cand: candidates(raw, 6)
    };
  }

  /* 批量解析：接受数组或「+ / , / 换行」分隔的串。

     分隔符的坑：不能把普通空格当分隔符。
     「Cel Shading」「Mobile Suit Gundam」这类英文名内部就有空格，
     按空格切会把一个名字劈成两半，然后「Cel」「Shading」各自去库里乱撞——
     实测「Cel Shading」会被切成 Cel（命中若干）+ Shading（未命中），报错信息完全误导。

     规则：只在显式符号（+ , ; 与全角变体）与换行处切；
     空格只在**两侧都不是 ASCII 字母数字**时才切，
     这样「A1-001 + 赛璐璐平涂」能切，「Cel Shading」不能切。 */
  function splitItems(str) {
    var s = String(str == null ? "" : str)
      .replace(/[＋，；]/g, function (c) {
        return c === "＋" ? "+" : (c === "，" ? "," : ";");
      });
    /* 先按显式符号与换行切 */
    var rough = s.split(/[+,\n\r\t;]+/);
    /* 每段里再按「空格且两侧非字母数字」细分，保留英文名内部空格 */
    var out = [];
    rough.forEach(function (seg) {
      seg.split(/\s+/).filter(Boolean).forEach(function (tok) {
        out.push(tok);
      });
    });
    /* 上一步会把英文名拆开，这里按「能否整体命中」再合并相邻词。
       贪心：从左往右，能延长的就延长，直到加下一个词就不再命中任何东西。 */
    var merged = [], i = 0;
    while (i < out.length) {
      var acc = out[i];
      while (i + 1 < out.length) {
        var trial = acc + " " + out[i + 1];
        if (lookup(trial).length) { acc = trial; i++; }
        else break;
      }
      merged.push(acc);
      i++;
    }
    return merged.filter(Boolean);
  }

  /* 批量解析：逐项回传结果——组合串里错一项必须立刻报出来，
     不能把其余的照常拼装，让人以为整串都对。

     失败分两类，因为用户要区别对待：
       badList   库里根本没有 → 该换说法或换编码
       ambList   库里有但重名 → 该加层级或改用完整编码
     混在一起报「失败」，用户不知道该重写还是该消歧。 */
  function resolveMany(input) {
    var items = Array.isArray(input)
      ? input.slice()
      : splitItems(input);

    var okList = [], badList = [], ambList = [], dupList = [], shadowLog = [], seen = {};
    items.forEach(raw => {
      var r = resolve(raw);
      if (r.ok) {
        /* 同一项被写了两次（如「A1-001 + 赛璐璐平涂」）只保留一条。
           不是因为错——用户可能就是想用两种写法指同一项，
           而输出里出现两遍会被当成两个组件，组合结果也不对。

           但必须记进 dupList 并让界面显示出来。
           静默丢弃会让人以为整串都解析对了：输入 3 段、只报「命中 2 项」，
           他会怀疑是某段没查到，而不是「第二段和第一段是同一个东西」。
           这条与本库「绝不静默跳过」是同一条约定。 */
        if (seen[r.code]) {
          dupList.push({ input: raw, code: r.code, zh: r.zh, sameAs: seen[r.code] });
          return;
        }
        seen[r.code] = raw;
        okList.push({
          input: raw, code: r.code, zh: r.zh, kind: r.kind,
          obj: r.obj, oldId: r.oldId,
          /* 授权等级必须跟着走：组合工作台要按最高等级
             给整串提示词一个总判定，漏了就等于没判。 */
          rights: r.rights,
          /* 跨层收敛的痕迹：命中的不止一个，替你取了哪层、谁被遮住 */
          converged: !!r.converged,
          shadowed: r.shadowed || []
        });
        if (r.converged) {
          shadowLog.push({
            input: raw, code: r.code, zh: r.zh, kind: r.kind, why: r.why,
            others: r.shadowed.map(function (o) {
              return { code: o.code, zh: o.zh, kind: o.kind };
            })
          });
        }
      } else if (r.ambiguous) {
        ambList.push({
          input: raw, why: r.why,
          cand: (r.cand || []).map(c => c.code + " " + c.zh)
        });
      } else {
        badList.push({ input: raw, why: r.why, cand: (r.cand || []).map(c => c.code + " " + c.zh) });
      }
    });

    return {
      /* dupList 不算失败：重复项已正确合并，不影响组合结果。
         它只影响「用户以为解析了几段」，所以单列一档供界面如实展示。 */
      ok: badList.length === 0 && ambList.length === 0,
      total: items.length,
      okList: okList,
      badList: badList,
      ambList: ambList,
      dupList: dupList,
      /* 跨层收敛记录：哪些项命中多条、替你取了哪层、谁同名被遮住 */
      shadowLog: shadowLog,
      /* 实际参与组合的项数：total 减去被合并的重复段 */
      used: okList.length,
      /* 拼装串：一串规范编码 + 中文名，供直接粘进别的工具 */
      chain: okList.map(x => x.code + " " + x.zh).join(" + ")
    };
  }

  return {
    register: register,
    inject: inject,
    resolve: resolve,
    resolveMany: resolveMany,
    entries: entries,
    kindZh: kindZh,
    /* 供测试与 UI 使用 */
    usableKey: usableKey,
    index: { byCode: byCode, byOld: byOld, byZh: byZh, byEn: byEn, byTerm: byTerm }
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { RESOLVER: RESOLVER };