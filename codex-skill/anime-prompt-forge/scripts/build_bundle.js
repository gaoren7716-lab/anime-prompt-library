#!/usr/bin/env node
/* 导出 references/data.json —— 独立安装时的数据源。
 *
 * 技能包被复制到 ~/.codex/skills/ 之后，仓库的 assets/ 就不在旁边了，
 * scripts/forge.js 会自动改读这个 JSON。
 *
 * 只导工作流需要的四层（画风/题材/版式/配色），
 * 不导作品层（233 条，R3，不进工作流）与十二库节点（537 条，
 * 那是网页端的检索/组合引擎用的，Codex 侧没有对应能力）。
 *
 * 派生规则只有一处真源：正文一律从已建好的查表取，
 * 英文技法描述从 data-styles-en.js 取，
 * 不在这里重新拼正文 —— 两处拼装迟早漂移。 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const core = require(path.join(ROOT, "assets/data-core.js"));
const coreM = require(path.join(ROOT, "assets/data-core-more.js"));
const genres = require(path.join(ROOT, "assets/data-genres.js"));
const layout = require(path.join(ROOT, "assets/data-layout.js"));
const palette = require(path.join(ROOT, "assets/data-palette.js"));
const en = require(path.join(ROOT, "assets/data-styles-en.js")).STYLE_DESC_EN;
const { PROMPT_EN } = require(path.join(ROOT, "assets/prompts.js"));
const { PROMPT_ZH } = require(path.join(ROOT, "assets/prompts-zh.js"));
const { RIGHTS } = require(path.join(ROOT, "assets/rights.js"));
const { CODES } = require(path.join(ROOT, "assets/codes.js"));
const alias = require(path.join(ROOT, "assets/data-studio-alias.js")).STUDIO_LOOKALIAS;

function tier(e) {
  try {
    const r = RIGHTS.inspect(e);
    return r ? r.tier : "R0";
  } catch (err) { return "R0"; }
}

/* 条目本体上没有 gpt / gptZh 字段 —— 正文存在两处独立查表里
   （PROMPT_EN 存英文、PROMPT_ZH 存中文），
   那是刻意的分离：正文是派生物，不写回数据源。
   所以导出时必须主动查表填进来，漏了就是空正文 ——
   而空正文不会报错，只会在 bundle 模式下退化成标签串。 */
function pick(e, extra) {
  const o = {
    id: e.id, code: CODES.derive(e.id), zh: e.zh, en: e.en || "",
    cat: e.cat || "", tier: tier(e)
  };
  /* kw 必须导出：标签速用版每一层都靠它，
     漏了的话配色层在标签版里整层消失（palette.kw 为 undefined，
     flat() 返回空数组，push 一个都不执行），
     而症状只是标签版短了几个词，不报错。 */
  ["kw", "ratio", "hex", "accent", "mood", "desc", "note", "demo", "scene"]
    .forEach(k => { if (e[k] !== undefined) o[k] = e[k]; });
  /* 工作室层要带去标识后的显示名与特征词。
     条目名叫「吉卜力（宫崎骏）」是检索索引，但进工作流后
     用户会以为可以直接用那个名字出图；kw 里也混着 "studio ghibli"。
     所以另存 look / tagsKw，工作流只用这两个。 */
  if (e.cat === "工作室" && alias[e.id]) {
    o.look = alias[e.id].look;
    o.lookEn = alias[e.id].lookEn;
    o.tagsKw = alias[e.id].tagsKw;
  }
  /* 正文优先取条目自带（排版与配色就是自带），
     没有再查表（画风与题材在表里）。 */
  if (e.gpt) o.gpt = e.gpt;
  else { const t = PROMPT_EN.get(e.id); if (t) o.gpt = t; }
  if (e.gptZh) o.gptZh = e.gptZh;
  else { const t = PROMPT_ZH.get(e.id); if (t) o.gptZh = t; }
  if (extra) Object.keys(extra).forEach(k => {
    if (extra[k] !== undefined) o[k] = extra[k];
  });
  return o;
}

/* 画风：craftEn / craftZh 是纯技法描述（不含场景），
   完整正文留在 gpt / gptZh 里供单条查看。
   工作流合成只取 craft*，两者混用会与题材层的场景对冲。 */
const STYLES = [].concat(core.STYLES, coreM.STYLES_MORE).map(e => {
  const o = pick(e);
  o.craftEn = en[e.id] || "";
  o.craftZh = e.desc || "";
  o.noteEn = e.noteEn || "";
  return o;
});

const GENRES = genres.GENRES.map(e => pick(e));
const LAYOUTS = layout.LAYOUTS.map(e => pick(e));
const PALETTES = palette.PALETTES.map(e => pick(e));

/* 预设与 assets/studio.js 的 PRESETS 一致。
   这里手写一份而不是 import：studio.js 依赖 vm 沙箱里的全局，
   在纯 Node 里 import 不到数据。代价是两边要同步 ——
   所以下面的自检会核对两边条目数是否一致。 */
const PRESETS = [
  { name: "小红书观点卡", tip: "赛璐璐人物 · 上下图文卡 · 经典蓝",
    s: { style: "ST-001", theme: "TH-020", layout: "LT-001", palette: "PL-001" } },
  { name: "电影分镜", tip: "数码柔光 · 对角切割分镜 · 普鲁士蓝",
    s: { style: "ST-002", theme: "TH-013", layout: "LT-015", palette: "PL-004" } },
  { name: "电商主图", tip: "厚涂质感 · 单品主图 · 奶油黄",
    s: { style: "ST-003", theme: "TH-023", layout: "LT-023", palette: "PL-006" } },
  { name: "角色设定页", tip: "半写实 · 角色三视图 · 青灰",
    s: { style: "ST-006", theme: "TH-002", layout: "LT-019", palette: "PL-010" } },
  { name: "活动海报", tip: "浮世绘木版画 · 隐喻主视觉 · 墨黑金",
    s: { style: "ST-010", theme: "TH-032", layout: "LT-028", palette: "PL-007" } }
];

/* 预设的规范码必须与 assets/studio.js 的 PRESETS 逐项一致。
   两边手写同一份预设是必然的漂移点（studio.js 依赖 vm 沙箱里的全局，
   没法在纯 Node 里 import 它的数据），所以这里逐项核对：
   任何一边改了编码而另一边没跟上，这一条立刻红。 */
{
  const ST = require(path.join(ROOT, "assets/studio.js")).STUDIO;
  const drift = [];
  ST.PRESETS.forEach((p, i) => {
    const q = PRESETS[i];
    if (!q) { drift.push("第 " + (i + 1) + " 个预设在 bundle 侧缺失"); return; }
    if (p.name !== q.name) drift.push("#" + (i + 1) + " 名称不一致：" + p.name + " vs " + q.name);
    ["style", "theme", "layout", "palette"].forEach(k => {
      const a = CODES.derive(p.s[k]) || p.s[k];
      if (a !== q.s[k]) drift.push("#" + (i + 1) + "." + k + "：" + a + " vs " + q.s[k]);
    });
  });
  if (ST.PRESETS.length !== PRESETS.length)
    drift.push("预设数量不一致：" + ST.PRESETS.length + " vs " + PRESETS.length);
  if (drift.length) {
    console.error("✗ 预设与 assets/studio.js 不一致：");
    drift.forEach(d => console.error("  · " + d));
    process.exit(1);
  }
}

/* ---------- 步骤声明 ----------
   工作流有哪几步、每步从哪个数据层取，**从 STUDIO.STEPS 生成**。
   这里只补一个 key → 数组名的映射，不重复写层名与顺序。

   映射漏了一个 key（工作流加了新的一步而这里没跟上）会直接报错退出，
   不静默少一层 —— 少一层的症状是抽出来的组合缺约束，照样能出图。 */
const LIST_OF = { style: "styles", theme: "genres", layout: "layouts", palette: "palettes" };
const STEPS = [];
{
  const { STUDIO } = require(path.join(ROOT, "assets/studio.js"));
  const missing = [];
  STUDIO.STEPS.forEach(s => {
    const list = LIST_OF[s.key] || "";
    if (!list) missing.push(s.key + "（" + s.zh + "）");
    STEPS.push({ key: s.key, zh: s.zh, hint: s.hint || "",
                 required: !!s.required, list: list });
  });
  if (missing.length) {
    console.error("✗ 工作流里出现了 bundle 不认识的一步：");
    missing.forEach(m => console.error("  · " + m));
    console.error("  → 在 build_bundle.js 的 LIST_OF 里补上它的数据层，并把这个层导进 data.json。");
    process.exit(1);
  }
}

const data = {
  version: "1.0.0",
  generatedFrom: "anime-prompt-library",
  counts: {
    styles: STYLES.length, genres: GENRES.length,
    layouts: LAYOUTS.length, palettes: PALETTES.length,
    total: STYLES.length + GENRES.length + LAYOUTS.length + PALETTES.length
  },
  /* steps 是**从 STUDIO.STEPS 生成**的，不是手写的层次清单。
     forge.js 的 draw 靠它决定「抽哪几层、每层从哪个数组取」——
     手写一份的话，工作流以后加了一层，bundle 侧还是四层，
     而抽出来的组合只是少一层约束，不报错。 */
  steps: STEPS,
  styles: STYLES, genres: GENRES, layouts: LAYOUTS, palettes: PALETTES,
  presets: PRESETS
};

/* ---------- 自检：导出的条目必须都能出图 ---------- */
const problems = [];
GENRES.forEach(e => { if (!e.gpt) problems.push(e.id + " 缺英文正文"); if (!e.gptZh) problems.push(e.id + " 缺中文正文"); });
STYLES.forEach(e => { if (!e.craftEn) problems.push(e.id + " 缺英文技法描述"); if (!e.craftZh) problems.push(e.id + " 缺中文技法描述"); });
LAYOUTS.forEach(e => { if (!e.gpt) problems.push(e.id + " 缺英文正文"); if (!e.ratio) problems.push(e.id + " 缺画幅"); });
PALETTES.forEach(e => { if (!e.hex) problems.push(e.id + " 缺主色"); });
STEPS.forEach(s => {
  const n = (data[s.list] || []).length;
  if (!n) problems.push("步骤「" + s.zh + "」在 data.json 里是空的（list=" + s.list + "）");
});
const dup = [];
const seen = {};
[].concat(STYLES, GENRES, LAYOUTS, PALETTES).forEach(e => {
  if (seen[e.id]) dup.push(e.id); seen[e.id] = 1;
});
if (dup.length) problems.push("重复 id：" + dup.join(", "));

if (problems.length) {
  console.error("✗ 导出前自检未通过：");
  problems.forEach(p => console.error("  · " + p));
  process.exit(1);
}

const dest = path.join(__dirname, "..", "references", "data.json");
fs.writeFileSync(dest, JSON.stringify(data), "utf8");
console.log("已生成 " + dest);
console.log("  " + data.counts.total + " 条（画风 " + data.counts.styles
  + " · 题材 " + data.counts.genres + " · 版式 " + data.counts.layouts
  + " · 配色 " + data.counts.palettes + "）");
console.log("  步骤声明 " + STEPS.length + " 层：" + STEPS.map(s => s.zh).join(" → "));
console.log("  自检通过：每条都有正文、画风都有双语技法、版式都有画幅、配色都有主色");
console.log("  " + (fs.statSync(dest).size / 1024).toFixed(0) + " KB");

/* ---------- 引擎副本：出图与抽卡 ----------
 * bundle 模式下仓库的 assets/ 不在旁边，而「URL 怎么拼」「画幅怎么算」
 * 「槽位怎么抽」都是**会被断言的确定性规则** —— 在 forge.js 里手写一套
 * 就等于留下第二份真源，两边只在某些通道上悄悄不同。
 * 所以直接把这两个文件逐字复制进包里，两种布局 require 的是同一段代码。
 *
 * 为什么是复制而不是 require 仓库路径：独立安装（~/.codex/skills/...）
 * 时仓库根本不存在，包必须自带。
 *
 * 复制完立刻比对一次：复制本身不会错，这一步防的是**以后** ——
 * 有人改了 assets/ 却忘了重跑这个脚本。
 * tools/check_skill.js 里另有一条常驻断言做同样的事。 */
const COPIES = [
  ["assets/render.js", "render-core.js"],
  ["assets/gacha.js", "gacha-core.js"],
  /* model-prompts 的副本叫 model-prompts-core.js，
     因为它的 require 是 "./studio.js" —— 改成原名的话，
     包里那个不存在的路径会让人误以为漏装了文件。
     它在包内取不到 STUDIO 时会返回 null，命令退回通用正文，
     而 gacha-core 里的 MPF() 也是这么找它的。 */
  ["assets/model-prompts.js", "model-prompts-core.js"]
];
COPIES.forEach(([src, name]) => {
  const from = path.join(ROOT, src);
  const to = path.join(__dirname, name);
  const body = fs.readFileSync(from, "utf8");
  fs.writeFileSync(to, body, "utf8");
  const back = fs.readFileSync(to, "utf8");
  if (back !== body) {
    console.error("✗ 复制 " + name + " 后回读不一致，已中止");
    process.exit(1);
  }
  console.log("  已同步 " + name + " ← " + src
    + "（" + (body.length / 1024).toFixed(1) + " KB，逐字相同）");
});