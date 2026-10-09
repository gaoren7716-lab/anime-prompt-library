/* ============================================================
 * check_codes.js · 编码体系验证
 * ============================================================
 * 七组断言，覆盖「能不能引用」这件事的全部要害：
 *   1 编码唯一        2 编码长度恒定     3 全库无漏编
 *   4 编码↔旧 ID 双向   5 中文名可解析     6 简写可解析
 *   7 组合串逐项报错
 * ============================================================ */
const fs = require("fs"), vm = require("vm"), path = require("path");
const L = require("./_loadlist.js");
const A = L.A;

/* ---------- 载入数据与引擎 ----------
   脚本清单来自 tools/_loadlist.js（唯一真源）。
   原先这里手抄一份，tier_audit.js 又抄了一份，
   已经漂移出过一次少抄 data-misc.js 的问题——
   清单错了不报错，测试照样绿，所以必须收敛成一份。 */
const ctx = vm.createContext({ console });
ctx.globalThis = ctx;

L.SANDBOX_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
vm.runInContext(
  "globalThis.__d={STYLES:(typeof STYLES!=='undefined'?STYLES:[]),STYLES_MORE:(typeof STYLES_MORE!=='undefined'?STYLES_MORE:[]),GENRES:(typeof GENRES!=='undefined'?GENRES:[]),WORKS_JP:(typeof WORKS_JP!=='undefined'?WORKS_JP:[]),WORKS_GLOBAL:(typeof WORKS_GLOBAL!=='undefined'?WORKS_GLOBAL:[]),WORKS_MORE_A:(typeof WORKS_MORE_A!=='undefined'?WORKS_MORE_A:[]),WORKS_EUR_W:(typeof WORKS_EUR_W!=='undefined'?WORKS_EUR_W:[]),WORKS_EUR_E:(typeof WORKS_EUR_E!=='undefined'?WORKS_EUR_E:[]),WORKS_NAMER:(typeof WORKS_NAMER!=='undefined'?WORKS_NAMER:[]),TEMPLATES:(typeof TEMPLATES!=='undefined'?TEMPLATES:[]),NEGATIVES:(typeof NEGATIVES!=='undefined'?NEGATIVES:[]),SYNTAX:(typeof SYNTAX!=='undefined'?SYNTAX:[]),LAYOUTS:(typeof LAYOUTS!=='undefined'?LAYOUTS:[]),PALETTES:(typeof PALETTES!=='undefined'?PALETTES:[])};",
  ctx);

vm.runInContext(fs.readFileSync(A("codes.js"), "utf8"), ctx, { filename: "codes.js" });
vm.runInContext(fs.readFileSync(A("code-map.js"), "utf8"), ctx, { filename: "code-map.js" });
vm.runInContext(fs.readFileSync(A("resolver.js"), "utf8"), ctx, { filename: "resolver.js" });

/* ---------- 节点 ---------- */
const nodeFiles = fs.readdirSync(A(".")).filter(f => /^lib-.*\.js$/.test(f))
  .sort();
const NODES = [];
nodeFiles.forEach(f => {
  const m = require(A(f));
  Object.keys(m).forEach(k => { if (Array.isArray(m[k])) NODES.push(...m[k]); });
});

const D = ctx.__d;
/* 登记来源必须与 index.html 的 REGISTRY.boot 完全一致。
   两处必须注意：
   ① STYLES_MORE 要单独 concat。A5（全球流派）14 条只存在于该文件，
      data-core.js 里没有（它只到 A4）。
   ② 漏掉的数据会让「登记数 == 条目+工具+节点」那条断言自洽通过——
      拿同一份数组当两边，被比较的两边同时变小。
      那条断言现已改成与「去重后的唯一 id 数」比，
      数据再漏就会被抓住。 */
const ENTRIES = [].concat(D.STYLES, D.WORKS_JP, D.WORKS_GLOBAL,
  D.WORKS_MORE_A, D.WORKS_EUR_W, D.WORKS_EUR_E, D.WORKS_NAMER,
  D.GENRES, D.LAYOUTS, D.PALETTES);
const TOOLS = [].concat(D.TEMPLATES, D.NEGATIVES, D.SYNTAX);

/* ---------- 登记 ---------- */
const CODES = ctx.CODES, CODE_MAP = ctx.CODE_MAP, RESOLVER = ctx.RESOLVER;

/* 登记走 registry.js —— 与页面同一个入口。
   不要在这里手工 register：两套登记逻辑迟早会漂移，
   而漂移表现为「测试全绿但页面解析不了」，是最难查的一类。 */
vm.runInContext(fs.readFileSync(A("registry.js"), "utf8"), ctx, { filename: "registry.js" });
const ENGINE = require(A("engine.js")).ENGINE;
const REG = ctx.REGISTRY.boot({
  CODES: CODES, RESOLVER: RESOLVER, ENGINE: ENGINE, CODE_MAP: CODE_MAP,
  data: { entries: ENTRIES, tools: TOOLS }
});
console.log("登记来源：registry.js（与页面同源），共 " + REG.registers + " 项"
  + "（其中作品 " + REG.works + " 条并入 WK 段）");
if (REG.uncoded.length)  console.error("  未编码：" + REG.uncoded.join("; "));
if (REG.collided.length) console.error("  撞码：" + REG.collided.join("; "));
if (REG.missing.length)  console.error("  未传入：" + REG.missing.join("; "));

/* ---------- 断言 ---------- */
let pass = 0, fail = 0;
function ok(cond, msg) { cond ? pass++ : (fail++, console.log("  ✗ " + msg)); }
function head(t) { console.log("\n" + t); }

console.log("数据规模：条目 " + ENTRIES.length + " / 工具 " + TOOLS.length + " / 节点 " + NODES.length +
  " / 合计登记 " + RESOLVER.entries.length);

/* 1 编码唯一 */
head("【1】编码唯一性");
{
  const seen = {};
  let dup = 0, dupList = [];
  RESOLVER.entries.forEach(e => {
    if (seen[e.code]) { dup++; if (dupList.length < 5) dupList.push(e.code + " ← " + seen[e.code] + " / " + e.oldId); }
    else seen[e.code] = e.oldId;
  });
  ok(dup === 0, "无撞码 " + (dup ? dupList.join("; ") : ""));

  /* 源数据里同一个 id 出现两次——这类重复会被 pushEntry 的
     「已存在就跳过」静默吞掉，页面看不出异常，
     但两份数据从此各改各的，改一份不生效，是最难查的一类。
     曾经的真实案例：data-core-more.js 与 data-core.js 存了同一批
     A5-01~A5-14，内容一字不差，靠去重挡着从未暴露。 */
  const byId = {};
  const idDup = [];
  ENTRIES.concat(TOOLS).forEach(d => {
    if (byId[d.id]) idDup.push(d.id);
    else byId[d.id] = 1;
  });
  ok(idDup.length === 0, "源数据无重复 id"
    + (idDup.length ? "（重复 " + idDup.length + " 条：" + idDup.slice(0, 6).join(", ") + "）" : ""));

  /* 登记数校验必须与「源数据去重后的条数」比，
     不能与「喂进去的数组长度」比——后者是同一份数据，
     无论是否重复都会自洽，等于没验证。 */
  const uniqEntries = Object.keys(byId).length;
  ok(RESOLVER.entries.length === uniqEntries + NODES.length,
    "登记数 == 去重后条目+工具+节点（" + RESOLVER.entries.length + " vs "
    + uniqEntries + "+" + NODES.length + "）");
}

/* 2 编码长度恒定 */
head("【2】编码文法统一");
{
  /* 条目与工具层：两段，形如 <两字母>-<三位> */
  const flat = RESOLVER.entries.filter(e => e.kind !== "node");
  const badFlat = flat.filter(e => !/^[A-Z]{2}-\d{3}$/.test(e.code));
  ok(badFlat.length === 0, "条目与工具层恒为「两字母-三位」（" + badFlat.length + " 条违例"
    + (badFlat.length ? "，如 " + badFlat.slice(0, 4).map(e => e.code).join(" ") : "") + "）");

  /* 节点层：三段或四段。
     三段 = <段码>-<三位组>-<三位项>（CB-001-002）
     四段 = <段码>-<三位组>-<三位项>-<三位细分>（FD-001-001-001）
     只有库 01 需要第四段——「动画 → 发行形式 → 电视系列」这样的三级归属，
     压成两段会把它们并成同一个条目。 */
  const node = RESOLVER.entries.filter(e => e.kind === "node");
  const badNode = node.filter(e => !/^[A-Z]{2}-\d{3}(-\d{3}){1,2}$/.test(e.code));
  ok(badNode.length === 0, "节点层恒为「两字母-三位(-三位)*」（" + badNode.length + " 条违例"
    + (badNode.length ? "，如 " + badNode.slice(0, 4).map(e => e.code).join(" ") : "") + "）");
  const deep = node.filter(e => e.code.split("-").length === 4);
  ok(deep.length > 0 && deep.every(e => e.code.split("-")[3].length === 3),
    "四段编码的第 4 段恒为 3 位（" + deep.length + " 条，全部来自库 01）");

  /* 前缀不得含数字：A1 那种「字母+数字」的段码正是这次要消掉的 */
  const digitSeg = RESOLVER.entries.filter(e => /^[A-Z]*\d/.test(e.code));
  ok(digitSeg.length === 0, "段码不含数字（" + digitSeg.length + " 条违例"
    + (digitSeg.length ? "，如 " + digitSeg.slice(0, 4).map(e => e.code).join(" ") : "") + "）");

  /* 段码必须唯一：一个前缀只能管一件事。
     旧体系里 N 出现在 6 个段、G 有两种含义，这里逐段核对登记表。 */
  const segCount = {};
  RESOLVER.entries.forEach(e => {
    const s = e.code.split("-")[0];
    segCount[s] = (segCount[s] || 0) + 1;
  });
  const declared = CODES.SEGMENTS.map(s => s.code);
  const undeclared = Object.keys(segCount).filter(s => declared.indexOf(s) < 0);
  ok(undeclared.length === 0, "所有段码都在登记表里"
    + (undeclared.length ? "→ " + undeclared.join(" ") : ""));

  /* 登记了却没内容的段：允许，但必须显式标出，不能默默空着 */
  const empty = declared.filter(s => !segCount[s]);
  ok(empty.length <= 1 && empty.every(s => {
    const seg = CODES.SEGMENTS.find(x => x.code === s);
    return seg && /0 条|预留/.test(seg.desc);
  }), "空段已显式标注预留" + (empty.length ? "（" + empty.join(" ") + "）" : ""));
}

/* 3 无漏编 */
head("【3】全库无漏编");
{
  ok(CODES.UNCODED.length === 0, "无未编码项 " +
    (CODES.UNCODED.length ? "→ " + CODES.UNCODED.slice(0, 6).join("; ") : ""));
  const noCode = RESOLVER.entries.filter(e => !e.code);
  ok(noCode.length === 0, "每条都有编码");
}

/* 4 双向解析 */
head("【4】编码 ↔ 旧 ID 双向解析");
{
  let bad = [];
  RESOLVER.entries.forEach(e => {
    const a = RESOLVER.resolve(e.code);
    const b = RESOLVER.resolve(e.oldId);
    if (!a.ok || a.oldId !== e.oldId) bad.push("code→" + e.code + "(" + (a.ok ? a.oldId : a.why) + ")");
    if (!b.ok || b.code !== e.code) bad.push("id→" + e.oldId + "(" + (b.ok ? b.code : b.why) + ")");
  });
  ok(bad.length === 0, RESOLVER.entries.length + " 条双向可解析 " +
    (bad.length ? "→ " + bad.slice(0, 5).join("; ") : ""));
}

/* 5 中文名 */
head("【5】中文名可解析");
{
  let bad = [], amb = 0;
  RESOLVER.entries.forEach(e => {
    const r = RESOLVER.resolve(e.zh);
    if (r.ambiguous) { amb++; return; }
    if (!r.ok) bad.push(e.zh + "(" + r.why + ")");
  });
  ok(bad.length === 0, "中文名全部可解析 " + (bad.length ? "→ " + bad.slice(0, 5).join("; ") : ""));
  console.log("  · 同层重名（会返回候选列表让用户选，不算失败）：" + amb + " 条");

  /* 检索键里不该出现括号残段或纯符号。
     「美式卡通（Cartoon Network 系）」曾被切出「系)」这种键，
     白占索引，还让「系)」命中两个完全无关的条目。

     判据直接复用 resolver 自己的 usableKey —— 同一个真源，
     免得测试里另写一份正则，改了实现忘了改测试（或者反过来）。
     注意不能只查「含不含汉字」：「系)」自身就含汉字，
     也不能用 /[\w一-龥]/ 查字母——它把日文片假名判成不是字母。 */
  const junk = [];
  ["byCode", "byOld", "byZh", "byEn", "byTerm"].forEach(idx => {
    Object.keys(RESOLVER.index[idx]).forEach(k => {
      if (!RESOLVER.usableKey(k)) junk.push(idx + ":" + JSON.stringify(k));
    });
  });
  ok(junk.length === 0, "无残缺检索键" + (junk.length ? " → " + junk.slice(0, 5).join(", ") : ""));

  /* 反向确认：这两类键必须仍在索引里，别把正常检索能力一起滤掉 */
  ok(RESOLVER.usableKey("动画"), "汉字键保留");
  ok(RESOLVER.usableKey("アニメ"), "片假名键保留（\\w 不含片假名，容易误杀）");
  ok(RESOLVER.usableKey("cel shading"), "带空格的英文键保留");
  ok(!RESOLVER.usableKey("系)"), "括号残段被拦");
  ok(!RESOLVER.usableKey("·"), "纯符号被拦");

  /* 括号注释仍要能整体命中，不能为了去掉碎片把检索能力弄丢 */
  const cn = RESOLVER.resolve("美式卡通");
  ok(cn.ok && cn.code === "RG-003", "去括号后仍可命中条目 RG-003（" + (cn.ok ? cn.code : cn.why) + "）");
}

/* 6 简写与容错 */
head("【6】编码简写与大小写容错");
{
  const t = [
    ["st-001", "小写编码"], ["ST-1", "省略前导零"], ["A1-01", "旧 ID 两位"],
    [" th-001 ", "前后空格"], ["CB-001-001", "节点编码"], ["wk-001", "作品段全小写"]
  ];
  t.forEach(([q, why]) => {
    const r = RESOLVER.resolve(q);
    ok(r.ok, why + " 「" + q + "」→ " + (r.ok ? r.code + " " + r.zh : r.why));
  });
  const miss = RESOLVER.resolve("不存在的画风xyz");
  ok(miss.ok === false, "查不到时不假装命中：" + miss.why);
  console.log("  · 兜底候选：" + (miss.cand || []).slice(0, 3).map(c => c.code + " " + c.zh).join(" / "));
}

/* 7 组合串 */
head("【7】组合串逐项解析");
{
  /* 注意：这里刻意避开与已选项重复的项，否则会被去重，测的就不是「切分」了。
     去重单独在下面一组断言里测。 */
  const r = RESOLVER.resolveMany("ST-001 + CB-001-001 + WK-001 + TP-001");
  ok(r.ok, "四种层级混合的组合串全部命中");
  ok(r.okList.length === 4, "命中 4 项（实际 " + r.okList.length + "）");
  ok(r.chain.indexOf("ST-001 赛璐璐平涂") === 0, "输出链可粘回工具：" + r.chain.slice(0, 46) + "…");
  ok(new Set(r.okList.map(x => x.kind)).size === 3, "跨三个层级（条目 / 节点 / 工具）");

  const bad = RESOLVER.resolveMany("ST-001 + 乱写的东西 + TH-001");
  ok(bad.ok === false, "串里有错项时整体报失败，不放行");
  ok(bad.badList.length === 1 && bad.badList[0].input === "乱写的东西",
    "精确指出是哪一项错了：" + JSON.stringify(bad.badList[0] && bad.badList[0].input));
  ok(bad.okList.length === 2, "正确项仍单独返回，可继续用");

  /* 跨层同名不再一律挡回去。
     「Cel Shading」同时命中节点 VS-005-004 与条目 ST-001，
     用户的实际意图几乎总是「要一个能直接用的画风」，也就是条目层。
     所以按 工具 > 条目 > 节点 收敛取主选，但被遮住的那层必须如实带出。 */
  const amb = RESOLVER.resolveMany("Cel Shading");
  ok(amb.total === 1, "「Cel Shading」被当成 1 项而非 2 项（实际 " + amb.total + "）");
  ok(amb.badList.length === 0, "跨层同名不算「找不到」");
  ok(amb.ambList.length === 0, "跨层同名已收敛，不再要求用户消歧");
  ok(amb.ok === true, "收敛后整体放行");
  ok(amb.okList.length === 1 && amb.okList[0].code === "ST-001",
    "取条目层 ST-001（实际 " + (amb.okList[0] && amb.okList[0].code) + "）");
  ok(amb.okList[0].kind === "entry", "主选层级是 entry");
  ok(!!amb.okList[0].converged, "带 converged 标记");
  ok(amb.okList[0].shadowed.some(o => o.code === "VS-005-004"),
    "被遮住的节点层如实列出：" + amb.okList[0].shadowed.map(o => o.code).join(" / "));
  ok(amb.shadowLog.length === 1 && amb.shadowLog[0].others.length === 1,
    "批量结果另有一份收敛记录，供界面提示");

  /* 同层重名仍必须让用户选：那是真的分不清，替用户选就是替他做决定。 */
  const sameLayer = (function () {
    const byZh = {};
    RESOLVER.entries.forEach(e => { (byZh[e.zh] = byZh[e.zh] || []).push(e.kind); });
    const keys = Object.keys(byZh).filter(k =>
      byZh[k].length > 1 && new Set(byZh[k]).size === 1);
    return keys;
  })();
  if (sameLayer.length) {
    const sr = RESOLVER.resolveMany(sameLayer[0]);
    ok(sr.ambList.length === 1, "同层重名仍归入 ambList（" + sameLayer[0] + "）");
    ok(sr.ok === false, "同层重名时整体不放行");
  } else {
    ok(true, "当前无同层重名条目，收敛规则不会被误触");
  }

  /* 混合符号切分 */
  const multi = RESOLVER.resolveMany("ST-001, TH-001; 赛璐璐平涂");
  ok(multi.total === 3 && multi.ok, "混合符号正确切分（" + multi.total + " 项）");
  const sp = RESOLVER.resolveMany("赛璐璐平涂 热血战斗");
  ok(sp.total === 2 && sp.ok, "中文之间用空格分隔仍能切开（" + sp.total + " 项）");

  /* 同一项写了两次只算一次：输出里出现两遍会被当成两个组件。
     但去重必须「有痕」——否则输入 3 段只报「命中 1 项」，
     用户会以为有两段没查到。dupList 就是这个痕。 */
  const dup = RESOLVER.resolveMany("ST-001 + A1-001 + 赛璐璐平涂");
  ok(dup.total === 3 && dup.okList.length === 1,
    "三种写法指同一项 → 去重后 1 条（total " + dup.total + "，去重 " + dup.okList.length + "）");
  ok(dup.chain === "ST-001 赛璐璐平涂", "组合串本身不重复：" + dup.chain);
  ok(dup.dupList.length === 2, "被合并的 2 段如实上报（实际 " + dup.dupList.length + "）");
  ok(dup.dupList.map(d => d.input).join(",") === "A1-001,赛璐璐平涂",
    "记录了是哪两段被合并：" + dup.dupList.map(d => d.input).join(" / "));
  ok(dup.dupList.every(d => d.code === "ST-001"), "每段都指明合并到了哪一条");
  ok(dup.used === 1, "used 报实际参与组合的项数");
  ok(dup.ok === true, "重复不算失败——已正确合并，不影响组合结果");
}

/* 8 旧码迁移 */
head("【8】旧编码迁移（旧码永久可解析）");
{
  /* 段码体系改过一轮：作品十个地区段合并为 WK、画风五维改自解释前缀、
     工具层单字母改双字母。已发布的旧码必须永久可用——
     用户的组合串、笔记、截图里全是旧码，改号等于让它们全部失效。 */

  const cases = [
    ["A1-001", "ST-001", "画风·技法（数字段改前缀）"],
    ["A2-001", "ER-001", "画风·年代"],
    ["A3-001", "SB-001", "画风·工作室"],
    ["A4-003", "RG-003", "画风·地区"],
    ["A5-014", "MV-014", "画风·全球流派"],
    ["G-001", "TH-001", "题材元素"],
    ["T-001", "TP-001", "组合模板"],
    ["N-001", "NG-001", "负面提示词"],
    ["S-001", "SY-001", "平台语法"],
    ["W-J-001", "WK-001", "作品（日本段，合并后是首条）"],
    ["W-G-001", "WK-222", "作品（全球段，合并后靠后）"]
  ];
  cases.forEach(([legacy, now, why]) => {
    const r = RESOLVER.resolve(legacy);
    ok(r.ok && r.code === now,
      legacy + " → " + now + "（" + why + "，实际 " + (r.ok ? r.code : r.why) + "）");
  });

  /* 旧 ID 也仍可用，且与旧码指向同一条目 */
  ["A1-01", "A1-1", "G-01", "T-01"].forEach(id => {
    const r = RESOLVER.resolve(id);
    ok(r.ok, "旧 ID " + id + " → " + (r.ok ? r.code + " " + r.zh : r.why));
  });

  /* 旧码与新码混写一个组合串：应命中同一批条目，不报歧义、不报未命中 */
  const mixed = RESOLVER.resolveMany("ST-001 + A1-001 + 赛璐璐平涂");
  ok(mixed.ok && mixed.okList.length === 1 && mixed.chain === "ST-001 赛璐璐平涂",
    "新旧混写收敛到一条：" + mixed.chain);
  ok(mixed.dupList.length === 2, "被合并的两段如实上报");

  /* 旧码必须能按编码检索命中，而不只是解析命中 */
  const byCode = RESOLVER.resolve("A1-001");
  ok(byCode.ok, "旧码在编码索引里（可被统一检索到）");

  /* 迁移表与码表段码必须一致。两处各写一份 SEG_ALIAS，
     忘了同步就会有一批旧码解析不了——这里盯着。 */
  const mapSegs = Object.keys(CODE_MAP.SEG_ALIAS);
  const codeSegs = Object.keys(CODES.OLD_SEG);
  const mapOnly = mapSegs.filter(s => codeSegs.indexOf(s) < 0 && s.indexOf("W-") !== 0);
  const codeOnly = codeSegs.filter(s => mapSegs.indexOf(s) < 0);
  ok(mapOnly.length === 0 && codeOnly.length === 0,
    "两处段码改发表一致" + (mapOnly.length || codeOnly.length
      ? "（仅 code-map: " + mapOnly.join(" ") + " / 仅 codes: " + codeOnly.join(" ") + "）" : ""));

  /* WK 序号必须唯一且连续——两位不同的人查 WK-100 必须得到同一部作品 */
  const wk = RESOLVER.entries.filter(e => e.code.indexOf("WK-") === 0)
    .map(e => e.code).sort();
  const seqs = wk.map(c => parseInt(c.slice(3), 10));
  ok(new Set(seqs).size === seqs.length, "WK 序号无重复");
  ok(seqs[0] === 1 && seqs[seqs.length - 1] === seqs.length && seqs.length === REG.works,
    "WK 序号连续 1.." + seqs.length + "（实际 1.." + seqs[seqs.length - 1] + "，作品 " + REG.works + " 条）");
}

/* 【9】脚本清单一致性
   新增 assets/*.js 数据文件时，如果只改了 index.html 而漏了测试脚本，
   那个文件在测试环境里等于没加载——断言照样全绿，因为
   「清单少一项」不会让任何一条已有断言变红。
   （真实经历：data-layout.js / data-palette.js 加入后，
     check_codes 一度把 LT/PL 判成「空段」，
     原因就是它根本没加载这两个文件。）

   所以这里做双向比对：
     清单里有、页面里没有 → 测试会验页面不存在的东西
     页面里有、清单里没有 → 页面能跑、测试却看不见
   两者都必须为空。 */
head("【9】脚本清单与 index.html 一致");
{
  const r = L.checkAgainstIndex();
  ok(r.missing.length === 0, "清单里的文件都已进 index.html"
    + (r.missing.length ? "→ 缺 " + r.missing.join(", ") : ""));
  ok(r.extra.length === 0, "index.html 里的数据文件都已登记进清单"
    + (r.extra.length ? "→ 未登记 " + r.extra.join(", ") : ""));

  /* 变量名也要真的取得到内容。
     文件在清单里但 DATA_NAMES 漏了它，或变量名拼错，
     vm 里取出来都是 null / undefined——不报错，检查直接空跑通过。
     （空跑通过比失败危险：它让人以为这块数据验过了。） */
  const nullNames = L.DATA_NAMES.filter(n => !ctx.__d[n] || !ctx.__d[n].length);
  ok(nullNames.length === 0, "DATA_NAMES 里没有取不到内容的变量"
    + (nullNames.length ? "→ " + nullNames.join(", ") : ""));

  /* 反向再验一次：每个数据文件产出的顶层数组都必须在 DATA_NAMES 里。
     上一条只能发现「登记了名字却取不到」，发现不了
     「文件加载了但名字没登记」——后者会让该文件的数据
     整体从体检里消失，而所有断言照样通过。
     （实测踩过：从 DATA_NAMES 删掉 PALETTES，正向断言仍全绿。） */
  const declared = L.DATA_NAMES;
  const fileVars = L.SANDBOX_FILES
    .filter(f => /^data-/.test(f))
    .map(f => {
      const txt = fs.readFileSync(A(f), "utf8");
      const m = txt.match(/^(?:const|var|let)\s+([A-Z_][A-Z0-9_]*)\s*=\s*\[/m)
           || txt.match(/module\.exports\s*=\s*\{\s*([A-Z_][A-Z0-9_]*)\s*(?:,|\})/);
      return m ? m[1] : null;
    })
    .filter(Boolean);
  const undeclared = fileVars.filter(n => declared.indexOf(n) < 0);
  ok(undeclared.length === 0, "每个数据文件都已在 DATA_NAMES 登记"
    + (undeclared.length ? "→ 未登记 " + undeclared.join(", ") : ""));
}

console.log("\n" + (fail === 0 ? "全绿：" : "有失败：") + pass + " 通过 / " + fail + " 失败");
process.exit(fail === 0 ? 0 : 1);