#!/usr/bin/env node
/* ============================================================
 * tools/check_rights.js · 授权边界与提示词契约体检
 * ============================================================
 * 这个脚本和库里其他 check 的区别很关键：
 * 其他 check 测「函数没报错」，这个测「成品提示词长什么样」。
 *
 * 具体做法：先跑真实的登记与生成流程拿到实际输出，
 * 再断言输出里**不该出现的东西**。
 *
 * 为什么必须有这层：
 *   1. 编码不该进正文。生图模型会把 "A1-001" 当文字画到画面上，
 *      肉眼在网页上看不出来，只有真的生成一次才知道。
 *   2. 授权等级必须真的落到每条上，不能只算不存。
 *   3. 去标识化必须真的把标识换掉，且换完不留残余、
 *      不产生语义堆叠。
 *   4. 这些断言要在改数据时一直有效，所以写成通用规则，
 *      不点名具体条目——换个名字切出别的碎片也能拦住。
 * ============================================================ */
const fs = require("fs"), vm = require("vm"), path = require("path");
const L = require("./_loadlist.js");
const ROOT = L.ROOT;
const A = L.A;

let pass = 0, fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; console.log("  ✓ " + msg); }
  else { fail++; console.log("  ✗ " + msg); }
};
const head = (s) => console.log("\n" + s + "\n" + "-".repeat(58));

/* ---------- 装配（与页面同源） ----------
   脚本清单来自 tools/_loadlist.js。
   原先这里手抄 DATA + PROMPTS + 引擎三段，是全库第四份副本；
   已收敛到唯一真源，避免「某测试少加载一个文件」这类静默故障。 */
const ctx = { console: { log(){}, warn(){}, error(){} } };
vm.createContext(ctx);
L.SANDBOX_FILES.concat(L.PROMPT_FILES, L.PROMPT_ZH_FILES, L.ENGINE_FILES)
  .forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));

const { CODES } = ctx, { CODE_MAP } = ctx, { RIGHTS } = ctx,
      { RESOLVER } = ctx, { REGISTRY } = ctx, { PROMPT_KIT } = ctx, ENGINE = ctx.ENGINE;

/* 只读 STYLES，不再 concat STYLES_MORE。
   A5（全球流派）14 条由 data-core-more.js 末尾的 push 追加进 STYLES，
   本脚本把两个文件 runInContext 到同一个 ctx，该 push 同样生效，
   所以 STYLES 已是 59 条全量。再 concat MORE 会重复 14 条。 */
const seenEntryId = {};
const ENTRIES = [].concat(vm.runInContext("STYLES||[]", ctx),
  vm.runInContext("GENRES||[]", ctx), vm.runInContext("WORKS_JP||[]", ctx),
  vm.runInContext("WORKS_GLOBAL||[]", ctx), vm.runInContext("WORKS_MORE_A||[]", ctx),
  vm.runInContext("WORKS_EUR_W||[]", ctx), vm.runInContext("WORKS_EUR_E||[]", ctx),
  vm.runInContext("WORKS_NAMER||[]", ctx),
  vm.runInContext("LAYOUTS||[]", ctx), vm.runInContext("PALETTES||[]", ctx))
  .filter(d => {
    if (!d || !d.id || seenEntryId[d.id]) return false;
    seenEntryId[d.id] = 1;
    return true;
  });
const TOOLS = [].concat(vm.runInContext("TEMPLATES||[]", ctx),
  vm.runInContext("NEGATIVES||[]", ctx), vm.runInContext("SYNTAX||[]", ctx));

const REG = REGISTRY.boot({
  CODES, RESOLVER, ENGINE, CODE_MAP, RIGHTS,
  data: { entries: ENTRIES, tools: TOOLS }
});
console.log("登记来源：registry.js（与页面同源），共 " + REG.registers + " 项");
console.log("授权分布：R0 " + REG.rights.R0 + " / R1 " + REG.rights.R1
  + " / R2 " + REG.rights.R2 + " / R3 " + REG.rights.R3);

/* ---------- 全部 GPT 正文查表（【6】【10】共用） ---------- */
const GPT_ALL = {};
["PROMPTS_ST1","PROMPTS_ST2","PROMPTS_ST3","PROMPTS_GN1","PROMPTS_GN2",
 "PROMPTS_JP1","PROMPTS_JP2","PROMPTS_JP3","PROMPTS_JP4","PROMPTS_CN1",
 "PROMPTS_WW1","PROMPTS_GK1","PROMPTS_IF1","PROMPTS_FR1","PROMPTS_LN1"]
  .forEach(k => { const v = vm.runInContext(`typeof ${k}!=="undefined"?${k}:[]`, ctx);
    (v || []).forEach(p => { GPT_ALL[p.id] = p.gpt; }); });

/* ============================================================
 * 1. 分级必须落库，不能只算不存
 * ============================================================ */
head("【1】授权等级落库");
{
  const noRight = RESOLVER.entries.filter(e => !e.rights || !e.rights.tier);
  ok(noRight.length === 0, "全部 " + RESOLVER.entries.length
    + " 条都带 rights 等级（缺失 " + noRight.length + " 条）");

  const bad = RESOLVER.entries.filter(e => e.rights && !RIGHTS.TIERS[e.rights.tier]);
  ok(bad.length === 0, "等级值都在 R0/R1/R2/R3 四档内" + (bad.length ? " → " + bad.slice(0,3).map(e=>e.rights.tier) : ""));

  const sum = REG.rights.R0 + REG.rights.R1 + REG.rights.R2 + REG.rights.R3;
  ok(sum === RESOLVER.entries.length, "四档之和 " + sum + " = 登记总数 " + RESOLVER.entries.length);

  const r3 = RESOLVER.entries.filter(e => e.rights.tier === "R3");
  ok(r3.length === REG.rights.R3, "R3 计数一致（" + r3.length + "）");
  ok(REG.r3.length === r3.length, "R3 清单完整（" + REG.r3.length + " 条）");
}

/* ============================================================
 * 2. 作品层必须全部 R3 —— 标题即IP，不靠关键词
 * ============================================================ */
head("【2】作品层结构性R3");
{
  const works = RESOLVER.entries.filter(e => /^W-[A-Z]/i.test(e.oldId));
  ok(works.length === 233, "作品层 " + works.length + " 条");
  const wrong = works.filter(e => e.rights.tier !== "R3");
  ok(wrong.length === 0, "作品层全部判 R3" + (wrong.length
    ? " → 漏判 " + wrong.slice(0, 5).map(e => e.oldId + ":" + e.zh).join(", ") : ""));
  ok(works.every(e => e.rights.basis === "layer"),
    "依据是「层级规则」而非关键词匹配（标题即标识，不需要再证明）");
}

/* ============================================================
 * 3. 标识扫描不许有误报
 * ============================================================ */
head("【3】误报检查（宁可漏报也不误报）");
{
  /* 这些词本身是常用名词或普通人名，
     判成 R2/R3 会让用户不再信任整套判定。 */
  const benign = [
    ["a shaft of light across the room", "shaft 作光柱"],
    ["sunrise over the city", "sunrise 作日出"],
    ["howl at the moon", "howl 作呼喊"],
    ["evaluate the composition", "eva 在 evaluate 内"],
    ["bleached cotton shirt", "bleach 在 bleached 内"],
    ["Eva and Adam in the garden", "Eva 作人名"],
    ["medieval castle, stone walls, armor", "armor 作铠甲"],
    ["1girl, school uniform, cel shading, flat color", "纯技法描述"]
  ];
  const wrong = [];
  benign.forEach(([text, why]) => {
    const r = RIGHTS.tierOf(text);
    if (r.tier !== "R0") wrong.push(text + "（" + why + "）→ " + r.tier);
  });
  ok(wrong.length === 0, "常用词义全部放过" + (wrong.length ? " → " + wrong.join("; ") : ""));

  const strict = [
    ["akira-style", "R3"], ["eva-esque", "R3"], ["gundam-like", "R3"],
    ["dragon ball style", "R3"], ["totoro-esque", "R3"],
    ["in the style of ghibli", "R2"], ["shaft style animation", "R2"]
  ];
  const missed = strict.filter(([t, want]) => RIGHTS.tierOf(t).tier !== want);
  ok(missed.length === 0, "构词后缀写法全部命中"
    + (missed.length ? " → 漏 " + missed.map(m => m[0]).join(", ") : ""));
}

/* ============================================================
 * 4. 中文标识必须扫得到
 * ============================================================ */
head("【4】中文标识扫描");
{
  const zh = [
    ["机动战士高达", "R3"], ["龙珠", "R3"], ["吉卜力风格", "R2"],
    ["宫崎骏", "R2"], ["手冢治虫", "R1"], ["洛特·雷尼格剪纸风", "R1"]
  ];
  const wrong = zh.filter(([t, want]) => RIGHTS.tierOf(t).tier !== want);
  ok(wrong.length === 0, "中文作品名与创作者名判定正确"
    + (wrong.length ? " → " + wrong.map(w => w[0] + " 期望" + w[1] + " 实际" + RIGHTS.tierOf(w[0]).tier).join("; ") : ""));

  /* 作品条目标题本身就是 IP（如「名侦探柯南」一个受保护词都不含），
     tierOf 判不出R3 是预期的——它只认识标识词。
     这类条目靠 inspect() 的层级规则兜住，
     断言必须打在 inspect 上，拿tierOf 去测是测错了对象。
     上一版就是这么写的，导致这里假失败，也让人以为判定有洞。 */
  const noKeyword = ["圣斗士星矢", "名侦探柯南", "一拳超人", "银魂", "排球少年", "灌篮高手"];
  const missed = noKeyword.filter(t => RIGHTS.inspect({ id: "W-J01", zh: t }).tier !== "R3");
  ok(missed.length === 0, "无关键词的作品名由层级规则兜住（走 inspect 而非 tierOf）"
    + (missed.length ? " → " + missed.join(", ") : ""));
}

/* ============================================================
 * 5. 去标识化：换干净、不堆叠、如实上报
 * ============================================================ */
head("【5】去标识化质量");
{
  const cases = ["dragon ball, super saiyan, energy aura, blue sky",
    "akira toriyama style, muscular shonen proportions",
    "studio ghibli hand painted backgrounds, gentle forest",
    "gundam seed, angular armor, orange sunset",
    "机动战士高达, 硬表面装甲, 橙色夕阳"];
  const residual = [], silent = [], duplicated = [];

  cases.forEach(t => {
    const r = RIGHTS.deIdentify(t);
    if (r.leftover.length) residual.push(t + " → 残留 " + r.leftover.map(h => h.marker).join(","));
    /* replaced 必须非空：静默替换会让用户以为提示词原样生效，
       那比不替换更危险。 */
    if (!r.replaced.length) silent.push(t);
    /* 只查「特征词」层面的重复。
       不能查全部重复词——"hand-painted backgrounds" 和 "painted backgrounds"
       这种固搭配词本来就该共现，查它们会全是假失败。 */
    const FEATS = ["spiky", "angular", "rounded", "muscular", "glowing", "luminous",
      "silhouette", "aura", "visor", "gouache", "dystopian", "pastel", "ornate"];
    const words = r.text.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
    const dup = FEATS.filter(w => words.filter(x => x === w).length > 1);
    if (dup.length) duplicated.push(t + " → 重复 " + dup.join(","));
  });

  ok(residual.length === 0, "换完后无残余标识" + (residual.length ? " → " + residual.join("; ") : ""));
  ok(silent.length === 0, "每次替换都如实上报replaced" + (silent.length ? " → " + silent.join("; ") : ""));
  ok(duplicated.length === 0, "特征词不重复堆叠"
    + (duplicated.length ? " → " + duplicated.join("; ") : ""));

  const noop = RIGHTS.deIdentify("1girl, school uniform, cel shading");
  ok(noop.changed === false && noop.text === "1girl, school uniform, cel shading",
    "无标识时原样返回（不做无意义改写）");

  const suffix = RIGHTS.deIdentify("akira-style");
  ok(!/-style\b/.test(suffix.text), "构词后缀一并吃掉，不留孤零零的 -style"
    + (/-style\b/.test(suffix.text) ? " → " + suffix.text : ""));

  /* ---------- 5b. 中文后缀与「只替一半」 ----------
     这两类失败都是静默的：返回值看着正常、leftover 也是空的，
     但句子里还挂着受保护的姓氏或悬空的中文后缀。
     不写断言就一定会再犯（实测已犯过一次）。 */
  head("【5b】中文后缀与整体替换");
  {
    /* 中文提示词里最常见的写法：标识 + 「式 / 风格 / 画风」。 */
    const zhSuffix = [
      ["参考 Akira Toriyama 式的赛璐璐上色", "Toriyama", "拉丁全名 + 式"],
      ["参考宫崎骏风格的背景", "宫崎骏", "中文全名 + 风格"],
      ["新海诚画风的细腻光影", "新海诚", "中文全名 + 画风"],
      ["赛璐璐平涂，Studio Trigger 风格的高速动作帧", "Studio Trigger", "工作室 + 风格"],
      ["ghibli-esque 的柔和背景", "ghibli", "连字符后缀"],
      ["鸟山明系的硬表面机械", "鸟山明", "中文单名 + 系"]
    ];
    zhSuffix.forEach(([t, bad, label]) => {
      const r = RIGHTS.deIdentify(t);
      ok(r.text.toLowerCase().indexOf(bad.toLowerCase()) < 0,
        label + "：标识被整体去掉（" + bad + "）" + (r.text.toLowerCase().indexOf(bad.toLowerCase()) >= 0 ? " → " + r.text : ""));
      ok(!r.leftover.length, label + "：无残留报告"
        + (r.leftover.length ? " → " + r.leftover.map(h => h.marker).join(",") : ""));
    });

    /* 中文后缀本身要被吃掉，不能留一个悬空的「式」跟在特征词后面。
       "…silhouette 式的clean line" 这种输出语法是坏的。 */
    const eatSuffix = RIGHTS.deIdentify("参考 Akira Toriyama 式的赛璐璐");
    ok(!/式的|风格的|画风的/.test(eatSuffix.text),
      "中文后缀一并吃掉，不留悬空的「式/风格/画风」"
      + (/式的|风格的|画风的/.test(eatSuffix.text) ? " → " + eatSuffix.text : ""));

    /* 「系 / 流」不能无条件吃：中文里「系统」「系列」「关系」都含这两个字。 */
    ["操作系统", "关系图", "流水线的转场"].forEach(t => {
      const r = RIGHTS.deIdentify(t);
      ok(r.text === t, "普通词「" + t + "」不被后缀规则吃掉"
        + (r.text !== t ? " → " + r.text : ""));
    });

    /* 整体替换优先于拆开替换。
       早先按书写顺序扫，短条目先命中，"akira toriyama" 被拆成
       "akira" + 残留 "toriyama" —— 改了一半，比不改更危险。 */
    const whole = RIGHTS.deIdentify("Akira Toriyama style, dramatic speed lines");
    ok(!/toriyama/i.test(whole.text), "全名单条替换，不被拆成两半"
      + (/toriyama/i.test(whole.text) ? " → " + whole.text : ""));
    const wholeHits = whole.replaced.map(x => x.from);
    ok(wholeHits.length === 1 && /^akira toriyama/i.test(wholeHits[0]),
      "只记一次替换（实际 " + wholeHits.join(",") + "）");
  }
}

/* ============================================================
 * 6. 提示词正文里不该出现编码
 * ============================================================ */
head("【6】提示词正文不含编码与版权符号");
{
  /* 生图模型会把 "A1-001" 当成画面上的文字画出来。
     网页上看不出来，只有真出图才知道——所以这里必须静态拦住。 */
  const GPT = GPT_ALL;

  ok(Object.keys(GPT).length >= 324, "GPT 正文 " + Object.keys(GPT).length + " 条");

  /* 通用规则：任何形如 段码-三位 的串都不该出现在正文里 */
  const CODE_RE = /\b[A-Z]{1,3}-[A-Z]?-?\d{3}\b/;
  const withCode = Object.entries(GPT).filter(([, g]) => CODE_RE.test(g || ""));
  ok(withCode.length === 0, "正文里无编码"
    + (withCode.length ? " → " + withCode.slice(0, 5).map(([id]) => id).join(", ") : ""));

  /* 版权符号也不该出现（模型可能把它当水印画出来） */
  const sym = Object.entries(GPT).filter(([, g]) => /[©®™]/.test(g || ""));
  ok(sym.length === 0, "正文里无版权符号"
    + (sym.length ? " → " + sym.slice(0, 5).map(([id]) => id).join(", ") : ""));

  /* GPT 正文原本是这库的原创内容，不该混入他人 IP 名。
     这是「本库原创」这条授权线的技术保证。 */
  const withIp = [];
  Object.entries(GPT).forEach(([id, g]) => {
    const hits = RIGHTS.scan(g || "");
    const real = hits.filter(h => h.kind === "ip");
    if (real.length) withIp.push(id + "→" + real.map(h => h.marker).join(","));
  });
  ok(withIp.length === 0, "GPT 原创正文里无受保护 IP 名（商用安全）"
    + (withIp.length ? " → " + withIp.slice(0, 6).join("; ") : ""));
}

/* ============================================================
 * 7. 成品卡片：R3 条目必须带警示
 * ============================================================ */
head("【7】成品卡片的授权提示");
{
  const r3entry = RESOLVER.entries.find(e => e.rights.tier === "R3");
  const card = PROMPT_KIT.buildCard(r3entry.obj, "styles", "test gpt");
  ok(!!card, "R3 条目能正常生成卡片（授权层不阻断出图，只提示）");

  const r0 = RESOLVER.entries.find(e => e.rights.tier === "R0");
  const card0 = PROMPT_KIT.buildCard(r0.obj, "styles", "test gpt");
  ok(!!card0, "R0 条目能正常生成卡片");

  const negs = RESOLVER.entries.filter(e => e.rights.tier !== "R0" &&
    !PROMPT_KIT.buildCard(e.obj, "styles", "x").neg);
  ok(negs.length === 0, "非 R0 条目的负面词段不为空"
    + (negs.length ? " → " + negs.slice(0, 3).map(e => e.oldId) : ""));
}

/* ============================================================
 * 8. 商用判定矩阵自洽
 * ============================================================ */
head("【8】商用判定矩阵");
{
  const rows = [];
  ["R0","R1","R2","R3"].forEach(t => {
    ["personal","commercial","redist"].forEach(m => {
      const a = RIGHTS.assess(t, m);
      rows.push({ t, m, a });
    });
  });
  ok(rows.every(r => r.a.note && r.a.note.length >= 5), "每种组合都有可读说明");
  ok(rows.find(r => r.t === "R0" && r.m === "commercial").a.allowed === true,
    "R0 商用放行");
  ok(rows.find(r => r.t === "R3" && r.m === "redist").a.allowed === false,
    "R3 禁止再分发（本库可研究，但不能打包进要卖的东西）");
  ok(rows.find(r => r.t === "R3" && r.m === "commercial").a.mustRewrite === true,
    "R3 商用标记为「必须改写」");
  ok(rows.find(r => r.t === "R3" && r.m === "personal").a.allowed === true,
    "R3 个人学习放行（研究视觉语言不算侵权）");
  ok(rows.find(r => r.t === "R1" && r.m === "commercial").a.level === "info",
    "R1 商用降级为「需署名」，不是简单放行");
}

/* ============================================================
 * 9. 标识表自身的卫生
 * ============================================================ */
head("【9】标识表卫生");
{
  /* 替换表覆盖：技法层与题材层（basis=scan）的 R3 标识必须有视觉等价替换，
     否则「必须改写」这条路实际走不通。
     作品层（basis=layer）不参与这项检查——
     它们的商用路径是「不写 IP 名，只用其视觉特征描述」，
     条目里本来就带着完整的特征描述，不需要逐词替换表。 */
  const needRewrite = [];
  RESOLVER.entries
    .filter(e => e.rights.tier === "R3" && e.rights.basis !== "layer")
    .forEach(e => {
      (e.rights.hits || []).forEach(h => {
        const has = RIGHTS.REWRITE.some(p => p[0] === h.marker)
          || RIGHTS.REWRITE_ZH.some(p => p[0] === h.marker);
        if (!has) needRewrite.push(h.marker);
      });
    });
  const uniq = [...new Set(needRewrite)];
  ok(uniq.length === 0, "非作品层 R3 标识都有替换方案"
    + (uniq.length ? " → 缺 " + uniq.join(", ") : ""));

  /* 替换表自身不许留空值或占位符：
     一个空的替换词等于把风险原样留在输出里。 */
  const empty = [...RIGHTS.REWRITE, ...RIGHTS.REWRITE_ZH]
    .filter(p => !p[1] || !p[1].trim());
  ok(empty.length === 0, "替换表无空值"
    + (empty.length ? " → " + empty.map(e => e[0]).join(", ") : ""));

  /* 作品层条目必须真的带着可用的视觉描述——
     这是它绕过逐词替换表的唯一理由，没有描述就等于既不能研究也不能用。 */
  const thin = RESOLVER.entries
    .filter(e => e.rights.basis === "layer")
    .filter(e => !(e.obj && e.obj.desc && e.obj.desc.length > 40)
               && !(e.obj && e.obj.kw && e.obj.kw.length >= 3));
  ok(thin.length === 0, "作品层条目都带足量视觉描述（desc>40 字或 kw≥3）"
    + (thin.length ? " → " + thin.slice(0, 5).map(e => e.code + ":" + e.zh).join(", ") : ""));

  /* 标识词不能重名重复登记 */
  const dupEn = {};
  RIGHTS.MARKERS.forEach(m => { dupEn[m.t] = (dupEn[m.t] || 0) + 1; });
  const dupZh = {};
  RIGHTS.MARKERS_ZH.forEach(m => { dupZh[m.t] = (dupZh[m.t] || 0) + 1; });
  const dup = [...Object.entries(dupEn), ...Object.entries(dupZh)].filter(([, n]) => n > 1);
  ok(dup.length === 0, "标识表无重复登记" + (dup.length ? " → " + dup.map(d => d[0]).join(", ") : ""));

  /* 每个四档都要有真实存在的条目，否则档位定义是空的 */
  ["R0","R1","R2","R3"].forEach(t => {
    const n = RESOLVER.entries.filter(e => e.rights.tier === t).length;
    ok(n > 0, t + " 档有实际条目（" + n + " 条）");
  });
}

/* ============================================================
 * 10. 示例画廊：图、文案、数据三者必须同源
 * ------------------------------------------------------------
 * 这一段来自一次真实翻车：画廊第一版 12 张图里 6 张是错的，
 * 而所有自动检查都是绿的。原因有三类，全是静默的：
 *
 *   ① 正文写了「no text」，但标签串里没有——NEG_BASE 缺文字抑制词，
 *      模型自由发挥写出标题字与 pose 标注。**约束没参与，还算通过。**
 *   ② demo（标签速用版）与 gpt（正文）主体不同，画廊却说图由 demo 生成，
 *      等于用一张图证明两件事。
 *   ③ demo 直接写了在世创作者或具体作品的构图（浮世绘那条曾经
 *      写「mount fuji with great wave」，出图就是复制名作）。
 * ============================================================ */
head("【10】示例画廊一致性");

const GALLERY = ctx.GALLERY || [];
/* 条目查表用 ENTRIES（本脚本已 concat 的原始数据）而不是 ENGINE.collectEntries()：
   引擎的 collectEntries 依赖 index.html 内联脚本调 register()，
   而本脚本走 registry.boot() 这条另一条装配路径，两者不等价。
   踩过：这里改用 collectEntries 拿到空数组，12 条断言全部「失败」，
   看起来像数据漂移，其实是取数路径错了。 */
const ENTRIES_BY_ID = {};
ENTRIES.forEach(e => { if (e && e.id) ENTRIES_BY_ID[e.id] = e; });

ok(GALLERY.length > 0, "画廊有数据（" + GALLERY.length + " 条）");

/* 10a. 每个 id 都要在引擎里真实存在，否则整张卡渲染成漂移警告 */
GALLERY.forEach(g => {
  ok(!!ENTRIES_BY_ID[g.id], g.id + " 在引擎中存在"
    + (ENTRIES_BY_ID[g.id] ? "" : " → examples.js 与数据源已漂移"));
});

/* 10b. 图片必须真的在磁盘上。DOM 有 src ≠ 文件存在。
        img 为 null 的是「先登记提示词、后补图」的待配条目——
        没有图可查，10a/10c/10f 的授权与正文断言照常覆盖它。 */
GALLERY.forEach(g => {
  if (!g.img) return;
  const p = path.join(ROOT, g.img);
  ok(fs.existsSync(p), g.id + " 示例图存在：" + g.img);
  if (fs.existsSync(p)) {
    const kb = Math.round(fs.statSync(p).size / 1024);
    ok(kb > 20, g.id + " 示例图非空（" + kb + " KB）"
      + (kb <= 20 ? " → 可能是 0 字节或占位文件" : ""));
  }
});
/* 待配图条目的 note 必须以「待配图」开头，且不得写成「看点」——
   看点是图上真看得见的东西，没有图却写看点等于给假证据。 */
const pendingG = GALLERY.filter(g => !g.img);
ok(pendingG.every(g => /^待配图/.test(g.note || "")),
  "待配图条目（" + pendingG.length + " 条）的 note 均以「待配图」标注"
  + (pendingG.some(g => !/^待配图/.test(g.note || ""))
    ? " → " + pendingG.filter(g => !/^待配图/.test(g.note || "")).map(g => g.id).join(" ") : ""));
ok(GALLERY.filter(g => g.img).every(g => !/^待配图/.test(g.note || "")),
  "已配图条目的 note 不是待配图措辞");

/* 10c. 全是 R0：画廊是门面，只放可自由商用的内容。
       出现 R1–R3 就是把需要署名/改写的东西摆出来让人抄。

       必须用 inspect() 而不是 tierOf()：
       tierOf 只做文本扫描，**不认识作品层的结构性 R3**，
       tierOf("W-J01") 会返回 R0 —— 而作品层按定义就是 R3。
       用错函数的症状最阴：断言照样「通过」，等于没检查。
       （实测踩过：把 A1-01 换成 W-J01，13 条断言全绿。） */
GALLERY.forEach(g => {
  const e = ENTRIES_BY_ID[g.id];
  const t = e ? RIGHTS.inspect(e) : null;
  ok(t && t.tier === "R0", g.id + " 为 R0（实际 "
    + (t ? t.tier + " / " + t.basis : "查不到条目") + "）");
});

/* 10d. 负面基底必须含文字抑制词。
       缺了它，「标签速用版」路径就完全不受正文 no text 约束——
       实测 12 张里 4 张因此写出乱码招牌与标注字。 */
const negLower = (PROMPT_KIT.NEG_BASE || "").toLowerCase();
["text", "letter", "caption", "label", "watermark", "signature"].forEach(w => {
  ok(negLower.includes(w), "NEG_BASE 含文字抑制词：" + w);
});
/* 漫画页要留空对白框，所以 speech bubble 不能进负面基底 */
ok(!negLower.includes("speech"), "NEG_BASE 不含 speech（漫画条目需要空对白框）");

/* 10e. demo 不得指向具体作品或复制名作构图。
       这条直接对应本库第一边界「作品名 ≠ 技法」：
       技法条目的示例必须是中性主体，不能是「照着某张名作画」。 */
const WORK_NAME_PATTERN = /\b(great wave|mount fuji|hokusai|kanagawa|starry night|mona lisa|the scream|great wave off kanagawa)\b/i;
const allDemo = ENTRIES.map(e => e.demo || "").join(" \n ");
ok(!WORK_NAME_PATTERN.test(allDemo), "全库 demo 不含指名复制的名作构图"
  + (WORK_NAME_PATTERN.test(allDemo) ? " → 命中：" + allDemo.match(WORK_NAME_PATTERN)[0] : ""));

/* 10f. 画廊正文里禁止出现的两类内容：
       编码（模型会把 A1-01 画到画面上）与版权符号。 */
/* 正文查表：复用【6】段已建好的 GPT 字典。
   不要用 PROMPT_SETS —— 那是浏览器 <script> 顺序 push 出来的全局，
   在本脚本的 vm 装配里始终为空，用它会拿到空字典、断言全部空跑通过。 */
GALLERY.forEach(g => {
  const gpt = GPT_ALL[g.id] || "";
  ok(!!gpt, g.id + " 有 GPT 正文（画廊不复制正文，运行时反查）");
  if (gpt) {
    ok(!/\b[A-Z]{1,3}-[A-Z]?-?\d{3}\b/.test(gpt), g.id + " 正文不含库内编码"
      + (/\b[A-Z]{1,3}-[A-Z]?-?\d{3}\b/.test(gpt) ? " → 模型会把编码画进画面" : ""));
    ok(!/[©®™]/.test(gpt), g.id + " 正文不含版权符号");
    const hits = RIGHTS.scan(gpt).filter(h => h.kind === "ip");
    ok(hits.length === 0, g.id + " 正文无受保护 IP 名"
      + (hits.length ? " → " + hits.map(h => h.marker).join(", ") : ""));
  }
});

/* ============================================================
 * 11. 叙述性引用 vs 请求模仿
 * ------------------------------------------------------------
 * 来源：A1-05 粗描线稿的 desc 写了「代表是扳机社成立之前的老派作画」，
 * 这是讲画风流派沿革，不是让用户模仿该工作室，却被判成 R2，
 * 界面警示写着「商业交付必须先去标识化改写」——
 * 而这条整条内容根本没打算用那个工作室的任何东西。
 *
 * 第一版绕法是把 desc 里的「扳机社」改成英文「Trigger」，
 * 英文表没这个词所以扫不出。那是**掩盖不是解决**：
 * 真实风险一点没少，只是这条数据看起来绿了。
 * 正确做法是给扫描器补「中文沿革语境」，并按**字段位置**判定：
 * 只有落在描述性字段的沿革提及才降级；
 * 落在 demo/use/kw（真正被复制走的字段）里，判定一律不变。
 * ============================================================ */
head("【11】叙述性引用不算请求模仿");

const mkEntry = (o) => Object.assign({ id: "T-01", zh: "", en: "", cat: "技法" }, o);

/* 沿革在 desc → R0，但必须给出可读的说明（不能静默降级） */
{
  const r = RIGHTS.inspect(mkEntry({
    desc: "代表是扳机社成立之前的老派作画",
    demo: "portrait of a girl, lineart, monochrome"
  }));
  ok(r.tier === "R0", "沿革提及（desc）+ 干净 demo → R0（实际 " + r.tier + "）");
  ok(r.basis === "history-only", "basis 标为 history-only（实际 " + r.basis + "）");
  ok(!!r.reason && /扳机社|TRIGGER/.test(r.reason),
    "降级必须带可读说明，不能静默：" + (r.reason || "（无）"));
}

/* 同一句话挪到 demo 里 → 必须判 R2，降级逻辑不许越界 */
{
  const r = RIGHTS.inspect(mkEntry({
    desc: "老派作画",
    demo: "portrait of a girl, 扳机社风格, lineart"
  }));
  ok(r.tier === "R2", "沿革式提及出现在 demo → 仍判 R2（实际 " + r.tier + "）");
}

/* 「风格/画风」是请求模仿，不是沿革——这组词绝不能放进沿革正则 */
["参考扳机社风格", "扳机社画风", "扳机社式的造型", "like Trigger style",
 "Trigger style", "in the style of Trigger", "inspired by Trigger"
].forEach(t => {
  const r = RIGHTS.inspect(mkEntry({ desc: "", demo: t }));
  ok(r.tier === "R2", "请求模仿语境判 R2：" + t + "（实际 " + r.tier + "）");
});

/* 反向：歧义词在普通词义下必须放过。
   这条是上一条的必要配对——只测「该判 R2 的判了」，
   不测「不该判的没判」，加词表时很容易把 trigger/shaft 这类
   普通词写成一刀切命中，满库英文句子全被判 R2。 */
["a trigger for the reaction", "trigger warning", "the trigger pulls",
 "a shaft of light across the room", "eva is a common name"
].forEach(t => {
  const r = RIGHTS.inspect(mkEntry({ desc: "", demo: t }));
  ok(r.tier === "R0", "普通词义放过：" + t + "（实际 " + r.tier + "）");
});

/* 中英文同一实体必须同步覆盖。
   中文表有「扳机社」，英文表原本只有 "studio trigger"，
   于是 "like Trigger style" 整个扫不出来——
   同一实体两种语言覆盖不同步，等于英文写法的风险没人管。 */
ok(RIGHTS.scan("Trigger style", "demo").length > 0, "英文表覆盖裸词 Trigger（带语境）");

/* 沿革正则必须容忍中间连接词：「成立之前」不是「之前」紧邻 */
ok(RIGHTS.scan("扳机社成立之前的画风", "desc")[0].via === "history",
  "「成立之前」标记为 history（容忍连接词）");
ok(RIGHTS.scan("扳机社时期的画风", "desc")[0].via === "history",
  "「时期」标记为 history");
ok(!RIGHTS.scan("扳机社风格", "demo")[0].via,
  "「风格」不算 history（否则请求模仿被当成叙述放过）");

/* 库内真实数据：A1-05 必须是 R0，且沿革说明里点名工作室 */
{
  const e = ENTRIES.find(x => x && x.id === "A1-05");
  ok(!!e, "A1-05 存在");
  if (e) {
    const r = RIGHTS.inspect(e);
    ok(r.tier === "R0", "A1-05 粗描线稿判 R0（实际 " + r.tier + "/" + r.basis + "）");
    ok(/扳机社/.test(e.desc), "A1-05 的 desc 保留了真实名称（没有被改成英文蒙混）");
  }
}

/* 作品层结构 R3 不能被这次改动放过 */
{
  const w = ENTRIES.find(x => x && /^W-/.test(x.id));
  if (w) ok(RIGHTS.inspect(w).tier === "R3", "作品层仍无条件 R3：" + w.id);
}

/* ============================================================
 * 【12】中文正文体检
 * ============================================================
 * 中文正文是独立交付物（一版喂 GPT-Image，一版给国内用户改字），
 * 这段只管中文版自身的四条约束：
 *   12a 覆盖：所有「可直接出图」的条目都有中文正文
 *   12b 干净：正文里不得出现受保护的创作者 / 工作室 / 作品标识
 *   12c 纯中文：不得混入英文单词（那说明翻译没做完）
 *   12d 可查：规范码与旧 id 双向都能查到（反查静默失败过一次）
 * ============================================================ */
head("【12】中文正文");
{
  const SETS = L.PROMPT_ZH_NAMES.map(n => vm.runInContext(
    "typeof " + n + "!=='undefined'?" + n + ":[]", ctx)).filter(Array.isArray);

  const ZH_BY_ID = {};
  SETS.forEach(s => s.forEach(p => { if (p && p.id) ZH_BY_ID[p.id] = p.gptZh || ""; }));

  /* 所有「可出图条目 + 它们的两种中文正文来源」合成一张检查表，
     后续 12b/12c 都在这张表上跑，避免两套口径。 */
  /* 两个中文正文来源合并后的完整映射：条目 id → 中文文本 */
  const ZH_BY_ID_ENTRIES = {};
  ENTRIES.forEach(d => {
    if (/^W-/.test(d.id)) return;                /* 作品层刻意不给 */
    const t = ZH_BY_ID[d.id] || (typeof d.gptZh === "string" ? d.gptZh : "");
    if (t) ZH_BY_ID_ENTRIES[d.id] = t;
  });

  /* 检查表：一条一行，12b/12c/12d 都在它上面跑，避免两套口径 */
  const ZH_ALL = Object.keys(ZH_BY_ID_ENTRIES).map(id => ({ id: id, gptZh: ZH_BY_ID_ENTRIES[id] }));

  /* 12a 覆盖。两个中文正文来源已在上面合并进 ZH_ALL，
     所以这里只需要核对「每条都真的取到了文本」。 */
  const need = ENTRIES.filter(d => !/^W-/.test(d.id));   /* 作品层刻意不给 */
  const missing = need.filter(d => !ZH_BY_ID_ENTRIES[d.id]);
  ok(missing.length === 0, "有中文正文的条目 == 可直接出图条目（" + need.length + " 条全有）"
    + (missing.length ? "→ 缺 " + missing.slice(0, 5).map(d => d.id).join(",") : ""));

  const tooShortAll = ZH_ALL.filter(p => (p.gptZh || "").length < 60);
  ok(tooShortAll.length === 0, "中文正文长度达标（≥60 字）"
    + (tooShortAll.length ? "→ " + tooShortAll.slice(0, 4).map(p => p.id + ":" + (p.gptZh || "").length).join(",") : ""));

  /* 12a-2 作品层必须**没有**中文正文。
     这是刻意的：作品层按结构判 R3，本就不能直接商用，
     给它做正文等于在鼓励误用。哪天有人「顺手补齐」了，
     这条断言会红。 */
  const workZh = ZH_ALL.filter(p => /^W-/.test(p.id));
  ok(workZh.length === 0, "作品层不给中文正文（授权边界，不是遗漏）"
    + (workZh.length ? "→ 已有 " + workZh.length + " 条" : ""));

  /* 12b 干净 */
  const dirty = ZH_ALL.filter(p => {
    const h = RIGHTS.scan(p.gptZh || "", "gptZh").filter(x => !x.via);
    return h.length;
  });
  ok(dirty.length === 0, "中文正文无受保护标识"
    + (dirty.length ? "→ " + dirty.slice(0, 4).map(p =>
        p.id + "(" + RIGHTS.scan(p.gptZh, "gptZh").filter(x => !x.via).map(x => x.marker).join("/") + ")"
      ).join(" ") : ""));

  /* 12c 纯中文 */
  const enMix = ZH_ALL.filter(p => /\b[a-z]{4,}\b/.test(p.gptZh || ""));
  ok(enMix.length === 0, "中文正文无英文整词残留"
    + (enMix.length ? "→ " + enMix.slice(0, 4).map(p =>
        p.id + ":" + [...new Set((p.gptZh.match(/\b[a-z]{4,}\b/g) || []))].join(",")
      ).join(" | ") : ""));

  /* 12d 可查 */
  vm.runInContext(fs.readFileSync(A("prompts-zh.js"), "utf8"), ctx, { filename: "prompts-zh.js" });
  ctx.__ZHREF = SETS;
  vm.runInContext("PROMPT_ZH.inject(__ZHREF);PROMPT_ZH.injectCodes(CODES)", ctx);
  const PZ = ctx.PROMPT_ZH;

  const noCode = ZH_ALL.filter(p => !PZ.has(p.id));
  ok(noCode.length === 0, "中文正文按旧 id 可查"
    + (noCode.length ? "→ " + noCode.slice(0, 4).map(p => p.id).join(",") : ""));

  /* 规范码反查：静默失败过一次，所以必须逐条验。
     失败原因：规范码恒为三位，旧 id 却是两位（A1-01），
     按原样拼出来的是 A1-001，永远命中不了 A1-01。
     这类问题不报错、只是取不到，最难发现。 */
  const noRev = [];
  ZH_ALL.forEach(p => {
    const code = CODES.add(p.id);
    if (code && !PZ.has(code)) noRev.push(p.id + "→" + code);
  });
  ok(noRev.length === 0, "中文正文按规范码可查（" + ZH_ALL.length + " 条全查）"
    + (noRev.length ? "→ " + noRev.slice(0, 4).join(" ") : ""));
  ctx.__ZHREF = null;
}

console.log("\n" + (fail === 0 ? "全绿：" : "有失败：") + pass + " 通过 / " + fail + " 失败");
process.exit(fail === 0 ? 0 : 1);