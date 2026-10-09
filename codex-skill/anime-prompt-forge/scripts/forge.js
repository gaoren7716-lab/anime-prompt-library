#!/usr/bin/env node
/* ============================================================
 * anime-prompt-forge CLI —— 给 Agent（Codex / Claude / WorkBuddy）用
 * ============================================================
 *
 * 为什么要有这个脚本，而不是让模型直接读 JSON：
 *
 *   1. 授权闸门必须是硬拦截，不能靠模型「记得提醒」。
 *      本命令在 R2/R3 时会以非零退出码返回，
 *      Agent 的工具调用失败会被直接看见 ——
 *      比在提示词里写一句「请注意版权」可靠得多。
 *   2. 组合逻辑只有一份真源。四步顺序、缺步诊断、
 *      负面词拼装都在 assets/studio.js 里，脚本只做转发。
 *      两边各写一套拼装迟早漂移。
 *   3. 输出是纯文本，可以直接粘进任何支持文件读取的 Agent。
 *
 * 用法见 --help，或 SKILL.md 的调用表。
 * ============================================================ */

"use strict";

const path = require("path");
const fs = require("fs");

/* 技能包可能被安装到任意路径，两种布局都要能找到 assets/：
     A) 仓库内自用       <skill>/scripts/forge.js → ../../../assets
     B) 独立安装到skills  ~/.codex/skills/anime-prompt-forge/scripts/forge.js
                          → 数据随包走 references/data.json
   先试 A 再试 B。 */
const SKILL_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(SKILL_ROOT, "..", "..");

let STUDIO = null;
let DATA = null;
let loadMode = "";

function loadFromRepo() {
  const a = path.join(REPO_ROOT, "assets", "studio.js");
  if (!fs.existsSync(a)) return false;
  /* studio.js 依赖 vm 沙箱里的全局 PROMPT_SETS / PROMPT_ZH，
     直接 require 会取不到正文。check_studio.js 里那套载法是可行的，
     这里复用同样的思路：数据文件先进一个 vm 上下文，再 require 引擎。 */
  const vm = require("vm");
  /* _loadlist.js 直接 module.exports，无外层包装 */
  const _loadlist = require(path.join(REPO_ROOT, "tools", "_loadlist.js"));
  const ctx = vm.createContext({ console: console });
  ctx.globalThis = ctx;

  _loadlist.SANDBOX_FILES.forEach(f =>
    vm.runInContext(fs.readFileSync(_loadlist.A(f), "utf8"), ctx, { filename: f }));
  _loadlist.PROMPT_FILES.forEach(f =>
    vm.runInContext(fs.readFileSync(_loadlist.A(f), "utf8"), ctx, { filename: f }));
  _loadlist.PROMPT_ZH_FILES.forEach(f =>
    vm.runInContext(fs.readFileSync(_loadlist.A(f), "utf8"), ctx, { filename: f }));
  _loadlist.ENGINE_FILES.forEach(f =>
    vm.runInContext(fs.readFileSync(_loadlist.A(f), "utf8"), ctx, { filename: f }));

  const names = ["STYLES", "GENRES", "LAYOUTS", "PALETTES"];
  const d = {};
  names.forEach(n => {
    d[n] = vm.runInContext("(typeof " + n + "!=='undefined'?" + n + ":[])", ctx);
  });

  const ENGINE = require(_loadlist.A("engine.js")).ENGINE;
  ENGINE.register(d.STYLES, "styles", "画风流派");
  ENGINE.register(d.GENRES, "genres", "题材元素");
  ENGINE.register(d.LAYOUTS, "layouts", "排版图型");
  ENGINE.register(d.PALETTES, "palettes", "主题配色");

  STUDIO = require(_loadlist.A("studio.js")).STUDIO;
  loadMode = "repo";
  return true;
}

function loadFromBundle() {
  const p = path.join(SKILL_ROOT, "references", "data.json");
  if (!fs.existsSync(p)) return false;
  DATA = JSON.parse(fs.readFileSync(p, "utf8"));
  loadMode = "bundle";
  return true;
}

if (!loadFromRepo() && !loadFromBundle()) {
  console.error("[forge] 找不到数据源。两种布局都试过了：");
  console.error("  A) 仓库 assets/studio.js（应位于 <repo>/codex-skill/<skill>/scripts/）");
  console.error("  B) 随包数据 references/data.json");
  process.exit(3);
}

/* ============================================================
 * 引擎装载：出图（RENDER）与抽卡（GACHA）
 * ============================================================
 * 这两种能力在网页端是 assets/render.js 与 assets/gacha.js。
 * 命令行**不另写一套**，而是直接加载同一段代码：
 *
 *   仓库模式 → assets/render.js、assets/gacha.js（真源）
 *   bundle 模式 → scripts/render-core.js、scripts/gacha-core.js
 *                 （build_bundle.js 逐字复制的副本，check_skill.js 有断言卡住）
 *
 * 为什么不能各写一套：
 *   「URL 怎么拼」「画幅怎么换算」「槽位怎么抽」都是会被断言的确定性规则，
 *   两套手写实现只在某些分支上悄悄不同 —— 表现成
 *   「网页上出的是方图、命令行出的是竖图」这种谁都不会先怀疑两边实现不同的问题。
 *
 * gacha.js 需要 STUDIO。仓库模式下它自己 require 得到；
 * bundle 模式下没有 studio.js，所以这里用 data.json 拼一个**同名接口的替身**
 * （见 bundleStudio）挂到 globalThis 上 —— gacha.js 一行都不用改。
 * ============================================================ */
function loadRender() {
  const cands = loadMode === "repo"
    ? [path.join(REPO_ROOT, "assets", "render.js")]
    : [path.join(SKILL_ROOT, "scripts", "render-core.js")];
  for (const p of cands) {
    if (!fs.existsSync(p)) continue;
    try { const m = require(p); if (m && m.RENDER) return m.RENDER; } catch (e) {}
  }
  return null;
}

let RENDER = loadRender();
let GACHA = null;
let MODEL_PROMPTS = null;

function loadGacha() {
  const p = loadMode === "repo"
    ? path.join(REPO_ROOT, "assets", "gacha.js")
    : path.join(SKILL_ROOT, "scripts", "gacha-core.js");
  if (!fs.existsSync(p)) return null;
  try { const m = require(p); return (m && m.GACHA) || null; } catch (e) { return null; }
}

/* 按模型改写提示词的那一层。
   与 render/gacha 同一个套路：仓库内跑取真实引擎，
   独立安装取随包副本。
   取不到也不报错 —— 命令退回通用正文，
   「没有优化」远好过「整条命令都用不了」。 */
function loadModelPrompts() {
  const cands = loadMode === "repo"
    ? [path.join(REPO_ROOT, "assets", "model-prompts.js")]
    : [path.join(SKILL_ROOT, "scripts", "model-prompts-core.js")];
  for (const p of cands) {
    if (!fs.existsSync(p)) continue;
    try { const m = require(p); if (m && m.MODEL_PROMPTS) return m.MODEL_PROMPTS; } catch (e) {}
  }
  return null;
}

/* 某个模型优化后的提示词。
   ratio / ids 缺省时用「当前四步」，也就是 build 已经 pick 好的那组。
   三种情况都会退到通用英文正文：
     · 适配层没随包带上（bundle 模式且副本缺失）
     · 模型名不在清单里
     · 一个环节都没选
   这三种都不该让命令失败 —— 命令的价值是给出提示词，
   而不是替用户判断模型名写得对不对。 */
function modelPromptOf(modelKey, ratio) {
  const generic = () => globalThis.STUDIO.composeWith(
    idsOfCurrentSelection(), "en", ratio);
  if (!MODEL_PROMPTS || !modelKey) return generic();
  try {
    const o = MODEL_PROMPTS.of(modelKey, { lang: "en", ratio: ratio });
    if (!o || !o.text) return generic();
    /* 只返回正文，不拼 --参数。
       JSON 输出里 modelPrompt 与 modelParams 是两个字段，
       params 拼进正文会让 MJ 的画幅指令出现两份
       （正文尾部一份、modelParams 一份），改哪份都会打架。
       需要一条能直接粘的完整串的场合（纯文本输出），
       由调用方显式拼接，见 render 命令的打印分支。 */
    return o.text;
  } catch (e) { return generic(); }
}

/* ---------- 效果说明（说得清变化） ----------
   光给一段英文正文，用户不知道系统替他做了什么决定、换模型会差多少、
   哪些话经过实测哪些只是工程判断。这一层把三件已经存在的事实暴露出去，
   **不新编任何创作判断**：
     ① 四步各自的贡献 —— STEP_ROLE 与数据层各步的 hint 同源；
     ② 画风 × 模型的激活标定 —— model-prompts.js 的 STYLE_ACTIVATION，
        改写层已经按它调整过写法，这里只是把同一事实告诉调用方；
     ③ 测试状态 —— model-prompts.js 头部如实声明的「仅 Sana 实测」，
        必须跟着每次输出走，否则 read 会在下游被当成 test 引用。 */
const STEP_ROLE = {
  style:  "决定整幅怎么画：线条、上色、质感与光影的全部取向",
  theme:  "决定画什么：主体、场景与叙事内容",
  layout: "决定怎么摆：构图、画幅与版面结构",
  palette:"决定什么颜色：主色、辅色与落色范围"
};
const FIT_ZH = {
  strong: "强（风格名一给就出）",
  weak:   "弱（改写层已切到特征词优先）",
  none:   "叫不动（已隐去风格名、只给特征）",
  unknown:"未标定（按名字 + 特征给出）"
};
function buildExplain(chosen, styleCode) {
  const ex = {
    changed: (chosen || []).map(c => ({
      step: c.step, code: c.code, zh: c.zh, role: STEP_ROLE[c.step] || ""
    })),
    keepAlways: [
      "无文字 / 无水印 / 无 UI 元素 —— 每一版提示词都自带禁项，不需要手动追加"
    ],
    styleFit: null,
    limits: [
      "出图实测：目前只有 Sana（免 key 通道）真出过图；其余模型是按其语法改写，"
      + "未逐条实测——适配层的判断属 read 级（工程推断），不是 test 级（实测结论）。",
      "Midjourney 没有公开出图 API：MJ 版给的是标签串 + --参数，"
      + "需到官网 / Discord 自行粘贴。"
    ]
  };
  if (styleCode && MODEL_PROMPTS && MODEL_PROMPTS.activationOf) {
    ex.styleFit = MODEL_PROMPTS.keys().map(k => {
      const a = MODEL_PROMPTS.activationOf(styleCode, k);
      const r = (RENDER && RENDER.modelById && RENDER.modelById(k)) || {};
      return { model: k, zh: r.zh || k, fit: a.level, why: FIT_ZH[a.level] || a.level };
    });
  }
  return ex;
}

function idsOfCurrentSelection() {
  const ids = {};
  const st = globalThis.STUDIO;
  if (!st || !st.STEPS) return ids;
  st.STEPS.forEach(s => { ids[s.key] = st.S[s.key]; });
  return ids;
}

/* bundle 模式下的 STUDIO 替身。
   只实现 gacha.js 真正用到的那几个成员，签名与 studio.js 一致：
   STEPS / S / candidates / byId / codeOf / codeOfEntry / composeWith / reset / toOldId。

   **层次与顺序从 data.json 的 steps 读**，不写死「画风题材版式配色」——
   写死的话工作流加一层，命令行抽出来的组合就少一层约束，而它照样能出图。
   composeWith 转调 bundleCompose（那份镜像已经被 check_skill 的 A/B 对拍盯着）。 */
function bundleStudio() {
  const byId = {};
  (DATA.steps || []).forEach(st => {
    (DATA[st.list] || []).forEach(e => { byId[e.id] = e; if (e.code) byId[e.code] = e; });
  });
  const STEPS = (DATA.steps || []).map(st => ({
    key: st.key, zh: st.zh, hint: st.hint || "", required: !!st.required
  }));
  const S = {};
  STEPS.forEach(st => { S[st.key] = ""; });

  function one(id) { return byId[id] || null; }
  function codeOfEntry(e) { return (e && (e.code || e.id)) || ""; }
  /* 工作室层显示去标识后的特征名（data.json 里的 look）。
     与 studio.js 的 labelOfEntry 同一规则 —— 摘要里露出创作者名，
     Agent 极可能顺手写进正文。 */
  function labelOfEntry(e) { return (e && (e.look || e.zh)) || ""; }
  function listOf(stepKey) {
    const st = (DATA.steps || []).find(s => s.key === stepKey);
    return (st && Array.isArray(DATA[st.list])) ? DATA[st.list] : [];
  }
  function entryOf(stepKey) { return one(S[stepKey]); }

  /* 画风只取技法描述，不取整段正文。
     与 studio.js 的 styleCraft 同一规则：59 条画风正文开头自带完整场景，
     与题材的场景必然对冲，所以这里只拿 desc/note。
     data.json 里画风条目的 desc / descEn 就是那层「纯技法描述」，
     缺了就退回正文 —— 宁可给全文，也不能给空。 */
  function styleCraft(e, isZh) {
    if (!e) return "";
    const parts = [];
    if (isZh) {
      if (e.desc) parts.push("画法：" + e.desc);
      if (e.note) parts.push(e.note);
    } else {
      if (e.craftEn || e.descEn) parts.push("Rendering approach: " + (e.craftEn || e.descEn));
      if (e.noteEn) parts.push(e.noteEn);
    }
    if (parts.length) return parts.join(" ");
    /* 签名与 studio.js 一致：demoOf 收的是 **stepKey**，不是条目本身。
       model-prompts.js 按 studio.js 的签名调用，两边不一致时
       这里会拿到字符串而不是条目，然后一路静默返回空。 */
    return demoOf(e.id);
  }

  /* 条目的正文。data.json 里正文直接写在条目上（gpt / gptZh），
     与 studio.js 的 textOf 同一取值顺序。 */
  function textOf(stepKey, field) {
    const e = entryOf(stepKey);
    if (!e) return "";
    return e[field] || "";
  }

  /* demoOf 收 stepKey —— 与 studio.js 同签名。
     顺便也接受条目 id：适配层两种传法都用得上，
     而取不到就返回空串，不抛错。 */
  function demoOf(stepKey) {
    const e = byId[stepKey] || entryOf(stepKey);
    if (!e) return "";
    if (e.demo) return e.demo;
    return (e.kw || []).slice(0, 8).join(", ");
  }

  /* 标签版与负面词：适配层的 MJ 版取材自 composeTags，
     所以这里必须给一份**去标识**的 —— 直接拼 e.kw 会把
     「studio ghibli」这类标识词写进 MJ 的提示词。 */
  function tagsOf(stepKey) {
    const e = entryOf(stepKey);
    if (!e) return [];
    if (e.cat === "工作室" && e.tagsKw) return [e.tagsKw];
    return e.kw || [];
  }
  function composeTags() {
    const segs = [];
    const push = w => { w = String(w || "").trim(); if (w && segs.indexOf(w) < 0) segs.push(w); };
    ["theme", "layout", "style"].forEach(k => {
      const kw = tagsOf(k);
      const flat = [];
      kw.forEach(x => String(x).split(/[,/]/).forEach(y => { y = y.trim(); if (y) flat.push(y); }));
      /* 每层 6 词上限必须与 assets/studio.js 的 composeTags 逐字对齐——
         早前替身漏了这个 slice：题材层 7 个词时（如 G-20 校园日常），
         第 7 个词「warm sunlight」在仓库模式被裁、bundle 模式保留，
         两种模式的 MJ 版从第 7 个词起全串错位。
         这类分歧不报错，只有逐字对拍才看得见（check_skill 第 10 组）。 */
      flat.slice(0, 6).forEach(push);
    });
    const pal = entryOf("palette");
    if (pal) {
      (pal.kw || []).slice(0, 4).forEach(push);
      if (pal.hex) push(pal.hex + " dominant palette");
    }
    const lay = entryOf("layout");
    if (lay && lay.ratio) push("aspect ratio " + lay.ratio);
    ["masterpiece", "best quality", "high resolution"]
      .forEach(w => { if (segs.length < 24) push(w); });
    ["text-free", "no watermark", "no signature"].forEach(push);
    return segs.join(", ");
  }
  function negatives() {
    const e = entryOf("style") || entryOf("theme");
    if (e && e.neg) return e.neg;
    return "watermark, logo, signature, text, letters, lettering, typography, caption, subtitle, annotation, label";
  }

  return {
    STEPS: STEPS, S: S,
    candidates: listOf,
    byId: one,
    entryOf: entryOf,
    styleCraft: styleCraft,
    textOf: textOf,
    demoOf: demoOf,
    tagsOf: tagsOf,
    composeTags: composeTags,
    negatives: negatives,
    codeOfEntry: codeOfEntry,
    labelOfEntry: labelOfEntry,
    codeOf: k => codeOfEntry(one(S[k])),
    toOldId: id => { const e = one(id); return e ? e.id : String(id == null ? "" : id); },
    reset: () => STEPS.forEach(st => { S[st.key] = ""; }),
    diagnose: () => ({ missing: [] }),
    composeWith: (ids, lang, ratioOverride) => {
      const sel = {};
      STEPS.forEach(st => { const e = one(ids && ids[st.key]); if (e) sel[st.key] = codeOfEntry(e); });
      return bundleCompose(sel).compose(lang, ratioOverride);
    }
  };
}

/* STUDIO 必须挂到 globalThis 上，两种模式都一样。
   理由：gacha.js 内部是按「容器查找」取 STUDIO 的
   （先 require("./studio.js")，失败则读 globalThis），
   仓库模式下那条 require 侥幸能成，bundle 模式下靠的就是这里的挂载。
   只给 bundle 模式挂、仓库模式不挂的话，两者行为不一致 ——
   表现是仓库模式下中文正文取不到（st 为 null 被静默跳过），
   而英文正文正常，看起来像「中文库没加载」。 */
if (loadMode === "bundle") globalThis.STUDIO = bundleStudio();
else globalThis.STUDIO = STUDIO;

GACHA = loadGacha();
MODEL_PROMPTS = loadModelPrompts();

/* ---------- 可复现随机源 ----------
   两个模式各用各的 Math.random 会让同一条命令在两处抽出不同结果，
   而这不是「随机本来就不同」——是没法对拍、也没法复现用户报的问题。
   mulberry32 只有五行，同一个 seed 在任何环境给出同一串数。 */
function rndOf(seed) {
  if (seed === "" || seed == null) return Math.random;
  let a = (Number(seed) >>> 0) || 1;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


/* ---------- bundle 模式的轻量实现 ----------
   独立安装时没有 assets/，改读导出的 JSON。
   四步拼装顺序与缺步诊断与 studio.js 保持一致 ——
   改一处必须改两处，所以 tools/check_skill.js 里有一组断言（【8】）
   专门比对两种模式在同一组入参下的输出是否逐字相同。 */
function bundleCompose(sel) {
  const D = DATA;
  const byId = {};
  ["styles", "genres", "layouts", "palettes"].forEach(k =>
    (D[k] || []).forEach(e => { byId[e.id] = e; byId[e.code] = e; }));

  const pick = k => (sel[k] && byId[sel[k]]) || null;
  const style = pick("style"), theme = pick("theme");
  const layout = pick("layout"), palette = pick("palette");

  const MISS = {
    style:   "没有画风：模型会按题材自己挑默认画法，同一个题材连出十张差别很大。",
    theme:   "没有题材：画风与版式没有承载对象，只能画成一张泛用的插画。",
    layout:  "没有版式：画面会居中平铺，信息没有分布，社媒图与信息图基本不可用。",
    palette: "没有配色：颜色由题材与画风偶然决定，整幅不会有统一的色调。"
  };
  const missing = [];
  ["style", "theme", "layout", "palette"].forEach(k => {
    if (!sel[k]) missing.push({ step: k, why: MISS[k] });
  });

  function body(lang, e) {
    if (!e) return "";
    if (lang === "zh") return e.gptZh || e.gpt || "";
    return e.gpt || e.gptZh || "";
  }

  /* 画风层只出技法，不出场景。
     59 条画风正文开头都自带完整场景（人物 + 动作 + 场景），
     与题材层拼接必然对冲：题材说「学生坐在窗边」，画风说「女生站在空教室」，
     模型拿到两个矛盾主体，结果是四不像。
     所以这里取 craftEn / craftZh（纯技法），场景统一由题材层决定。 */
  function craft(lang, e) {
    if (!e) return "";
    if (lang === "zh") {
      const p = [];
      if (e.craftZh) p.push("画法：" + e.craftZh);
      if (e.note) p.push(e.note);
      if (p.length) return p.join(" ");
    } else {
      const p = [];
      if (e.craftEn) p.push("Rendering approach: " + e.craftEn);
      if (e.noteEn) p.push(e.noteEn);
      if (p.length) return p.join(" ");
    }
    return body(lang, e);
  }

  /* ratioOverride：用户直接指定了出图比例时，正文里的画幅句必须跟着改写。
     不改的后果是「正文说 3:4、请求发 16:9」——模型两套指令都收到，
     出的是哪一张不由用户决定。与 studio.js 的 compose(lang, ratio) 同一规则。 */
  function compose(lang, ratioOverride) {
    const parts = [];
    if (theme) parts.push(body(lang, theme));
    if (layout) parts.push(body(lang, layout));
    if (style) parts.push(craft(lang, style) || (style.demo || ""));
    if (palette) {
      const hex = palette.hex || "";
      if (lang === "zh") {
        if (palette.mood) parts.push("整体色调：" + palette.mood);
        if (hex) parts.push("主色限定为 " + hex
          + (palette.accent ? "，仅以 " + palette.accent + " 作点缀" : "")
          + "，其余颜色一律压到接近中性");
      } else {
        parts.push("Colour palette centred on " + hex
          + (palette.accent ? ", using " + palette.accent + " as the only accent" : "")
          + "; pull every other colour toward neutral");
      }
    }
    var ar = ratioOverride || (layout && layout.ratio) || "";
    if (ar) {
      parts.push(lang === "zh"
        ? "画幅比例 " + ar + "。"
        : "Aspect ratio " + ar + ".");
    }
    parts.push(lang === "zh"
      ? "画面中不要出现任何文字、字母、标识或水印，文字一律后期自行排版。"
      : "No text, letters, signage, logos or watermarks anywhere in the frame; all lettering is to be added later in post.");
    return parts.filter(Boolean).join(" ");
  }

  /* 标签速用版。必须与 studio.js 的 composeTags() 同规则：
     顺序 theme → layout → style → palette → 画幅 → 画质基线 → 禁止项，
     每层最多取若干词、去重、全局不超过 24 个。
     两边规则不一致时对拍测试会红（zh/en 一致但 tags 不一致）。 */
  function tags() {
    const segs = [];
    /* 上限只加在画质基线那三步上，与 studio.js 一致。
       放在 push 里统一判断看似更严，实际会让最后三条禁止项
       （text-free / no watermark / no signature）被 24 上限挤掉 ——
       而这三���恰恰是最不能丢的。 */
    function push(w) {
      w = String(w || "").trim();
      if (w && segs.indexOf(w) < 0) segs.push(w);
    }
    function flat(e) {
      const out = [];
      const kw = (e.tagsKw && [e.tagsKw]) || e.kw || [];
      kw.forEach(x => String(x).split(/[,/]/).forEach(y => { y = y.trim(); if (y) out.push(y); }));
      return out;
    }
    [theme, layout, style].forEach(e => {
      if (e) flat(e).slice(0, 6).forEach(push);
    });
    if (palette) {
      flat(palette).slice(0, 4).forEach(push);
      if (palette.hex) push(palette.hex + " dominant palette");
    }
    if (layout && layout.ratio) push("aspect ratio " + layout.ratio);
    ["masterpiece", "best quality", "high resolution"].forEach(w => { if (segs.length < 24) push(w); });
    ["text-free", "no watermark", "no signature"].forEach(push);
    return segs.join(", ");
  }

  return { compose: compose, missing: missing, style: style, theme: theme,
           layout: layout, palette: palette, tags: tags() };
}

/* ---------- 命令 ---------- */

const argv = process.argv.slice(2);
const cmd = argv[0] || "help";

function arg(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : "";
}
function flag(f) { return argv.indexOf(f) >= 0; }
/* 可重复的选项（--lock 可以给好几次）。arg() 只取第一个，
   用它读 --lock 会让「同时锁画风和题材」静默只生效一个。 */
function argAll(f) {
  const out = [];
  argv.forEach((a, i) => { if (a === f && argv[i + 1] !== undefined) out.push(argv[i + 1]); });
  return out;
}

function usage() {
  console.log([
    "anime-prompt-forge —— 动漫出图提示词合成器",
    "",
    "用法：",
    "  forge.js list <style|theme|layout|palette> [--grep 关键词]",
    "      列出候选条目（含规范编码与授权档）",
    "",
    "  forge.js build --style <id> --theme <id> --layout <id> --palette <id>",
    "      [--lang zh|en|both] [--model <key>] [--json]",
    "      四步合成一条完整提示词，输出中英双版 + 负面词 + 画幅 + 授权",
    "",
    "      --model  按那个模型的语法再给一份优化版（五个模型语法不同，不能互换）：",
    "               gpt-image-2  段落式    nano-banana  指令式 + 显式 Avoid",
    "               mj           标签 + --参数（分两个字段，标签里不能混参数）",
    "               flux         散文（不加权重语法与质量词）  sana  短一档",
    "      不给 --model 就只有通用正文（基准，永远在，不被覆盖）",
    "",
    "  forge.js draw [--n 4] [--lock style=ST-001] [--ratio 3:4] [--seed 7]",
    "      [--prompt] [--json] [--render]",
    "      从库里随机抽若干组组合（还不知道要什么的时候用这个）。",
    "      每组给出「层名 · 编码 · 中文名」，方便挑一组。",
    "      --lock 可重复，用来固定某一层（--lock style=ST-001 --lock theme=TH-020）。",
    "      --seed 让抽取可复现；--render 抽完直接出图。",
    "",
    "  forge.js render [--style <id> --theme <id> ...] [--draw N]",
    "      [--model sana] [--ratio 3:4] [--seed 7] [--key <key>]",
    "      [--out 目录] [--tries 3] [--wait 10] [--json]",
    "      真的出图：把提示词发到出图通道，图存到本地并打印路径。",
    "      不给 --key 时只有 --model sana（免 key 通道）能出图。",
    "      这条通道约一半请求会被限流挡掉，所以默认重试 3 次。",
    "      --model 同时决定两件事：走哪条通道 + 提示词按谁的语法写。",
    "      文件名是「模型__组合串」，所以同一组换模型不会互相覆盖。",
    "",
    "  forge.js entry <id>",
    "      看单条详情：中文正文、英文正文、授权档、画质档",
    "",
    "  forge.js presets",
    "      列出内置预设组合",
    "",
    "  forge.js diagnose --style <id> --theme <id> ...",
    "      只报缺哪一步、缺了会怎样，不出提示词",
    "",
    "id 可用旧 ID（A1-01 / G-20 / LT-01 / PL-01）",
    "也可���规范编码（ST-001 / TH-020 / LT-001 / PL-001）。",
    "",
    "退出码：0 正常｜ 1 参数不足或出图失败｜ 2 组合含 R2/R3，需先处理授权｜ 3 数据源缺失"
  ].join("\n"));
}

if (cmd === "help" || cmd === "--help" || cmd === "-h") { usage(); process.exit(0); }

/* ============================================================
 * draw —— 随机抽组合（网页端「一键抽卡」的命令行版）
 * ============================================================
 * 网页端那一屏能做的事，命令行这边要能同样做：
 * 用户还不知道要什么的时候，随机的价值比「自己一个个查」高得多。
 *
 * 抽的逻辑**不在这里**，一律走 assets/gacha.js（bundle 模式下是它的副本）：
 * 槽位从工作流派生、锁定、组间去重、空槽自报全都在那一层。
 * 这里只负责把结果打成命令行看得懂的样子。
 *
 * 与网页端一致的两条：
 *   ① 抽卡不改用户的任何状态 —— gacha.js 内部用 composeWith，
 *      不会把组合写回 STUDIO.S。
 *   ② 某一层库是空的时候要说出来。少一层约束的提示词照样能出图，
 *      不写出来就只是「这张好像不太对」，查不出来。
 * ============================================================ */
function parseLocks() {
  const lock = {};
  argAll("--lock").forEach(kv => {
    const i = kv.indexOf("=");
    if (i <= 0) {
      console.error("[forge] --lock 要写成 层=条目，例如 --lock style=ST-001");
      process.exit(1);
    }
    lock[kv.slice(0, i)] = kv.slice(i + 1);
  });
  return lock;
}

function runDraw() {
  if (!GACHA) {
    console.error("[forge] 抽卡引擎没加载（gacha.js / gacha-core.js 不在包里）");
    return 3;
  }
  const nRaw = arg("--n");
  const n = nRaw === "" ? 4 : parseInt(nRaw, 10);
  const lock = parseLocks();
  const ratio = arg("--ratio");
  const rnd = rndOf(arg("--seed"));

  /* 先按 lock 校验一遍：写错层名或写错条目都要当场说，
     不能静默当成「没锁」——那会让人以为锁定功能坏了。
     顺便把规范码（ST-001）翻成抽卡内部用的旧 ID：
     不翻的话 --lock style=ST-001 会匹配不到候选，静默降级成不锁。 */
  const p0 = GACHA.pool({});
  const badLock = [];
  Object.keys(lock).forEach(k => {
    const sl = p0.slots.find(s => s.key === k);
    if (!sl) { badLock.push("没有「" + k + "」这一层"); return; }
    const e = sl.entries.find(x => x.id === lock[k] || x.code === lock[k]);
    if (!e) { badLock.push("「" + sl.label + "」里没有 " + lock[k]); return; }
    lock[k] = e.id;
  });
  if (badLock.length) {
    console.error("[forge] --lock 有问题：");
    badLock.forEach(b => console.error("  · " + b));
    console.error("  可用条目见：forge.js list <style|theme|layout|palette>");
    return 1;
  }

  const batch = GACHA.rollBatch(n, { lock: lock, ratio: ratio, rnd: rnd });

  if (flag("--json")) {
    const st = globalThis.STUDIO;
    console.log(JSON.stringify({
      asked: batch.asked, distinct: batch.distinct, repeated: batch.repeated,
      space: batch.space, spaceZh: batch.spaceZh, note: batch.note,
      missing: batch.missing,
      /* 中文正文要拿**这一组自己的 ids** 重新合成，不能靠再抽一次 ——
         再抽一次是另一组组合，拼出来的中英正文不属于同一张图。 */
      cards: batch.cards.map((c, i) => ({
        n: i + 1,
        chain: c.chain,
        codes: c.codes,
        rows: c.rows,
        repeat: !!c.repeat,
        prompt: c.prompt,
        promptZh: (st && st.composeWith) ? st.composeWith(c.ids, "zh", ratio) : ""
      }))
    }, null, 2));
    return 0;
  }

  /* 池规模只印一次，而且印的是 GACHA.summary() ——
     它自己带「画风 59 · 题材 32 · … → 可组合 679,680 种」，
     再在外面拼一句「库里可组合 X 种」就会同一个数字出现两遍。 */
  console.log("抽了 " + batch.cards.length + " 组"
    + (batch.repeated ? "（其中 " + batch.repeated + " 组是重复组合）" : "")
    + "　" + (GACHA.summary(lock) || ""));
  if (batch.note) console.log("⚠ " + batch.note);
  if (batch.missing.length) {
    console.log("⚠ 这几层当前是空的，抽出来的组合会少这几层约束：" + batch.missing.join(" / ")
      + "（补上条目即可，抽卡会自动恢复）");
  }
  console.log("");

  batch.cards.forEach((c, i) => {
    console.log("#" + (i + 1) + "  " + c.rows.map(r =>
      (r.code || "—") + " " + (r.empty ? "（这一层是空的）" : r.zh)).join("　·　")
      + (c.repeat ? "　（重复组合）" : ""));
    console.log("     组合串：" + c.chain);
  });

  if (flag("--prompt")) {
    const st = globalThis.STUDIO;
    batch.cards.forEach((c, i) => {
      console.log("\n=== #" + (i + 1) + " 英文正文 ===");
      console.log(c.prompt);
      console.log("\n=== #" + (i + 1) + " 中文正文 ===");
      console.log(st && st.composeWith ? st.composeWith(c.ids, "zh", ratio) : "（取不到中文正文）");
    });
  }
  console.log("\n要出图：forge.js draw --n " + batch.cards.length + " --render"
    + "　要接着调：把上面某一组的组合串喂给 forge.js build");
  return 0;
}

if (cmd === "draw") { process.exit(runDraw()); }

/* ============================================================
 * render —— 真的出图，存成本地文件
 * ============================================================
 * Codex 里没有网页，所以「看到图」这件事只能落到磁盘上：
 * 这里把提示词发出去、把图收回来、写成文件，然后打印路径。
 *
 * 通道与 URL 一律走 assets/render.js 的 reqOf()，不在这里拼串。
 * 免费通道实测约一半请求被挡回来（限流不是干净的时间窗口），
 * 所以默认重试 3 次。
 *
 * 三条边界照抄网页端，命令行的用户同样要知道：
 *   ① 提示词离开本机，发到第三方；② 图带水印，商用前自己裁；
 *   ③ 图里的文字是乱码，排版留给后期。
 * ============================================================ */
const CT_EXT = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp" };

/* 发一次、把字节收回来。
   返回 { bytes, ext } 或 { error }。
   **必须看 content-type**：限流与出错时返回的是文本/HTML，
   直接写盘会得到一个后缀是 .png 的 HTML 文件 ——
   它在文件管理器里显示为一张破图，比直接报错更难查。 */
async function grabOnce(prompt, opts) {
  if (!RENDER) return { error: "出图通道没加载（render.js / render-core.js 不在包里）" };
  const r = RENDER.reqOf(prompt, opts);

  if (r.kind === "manual") return { error: "这一项没有出图 API（Midjourney），只能用 build 出标签版自己粘过去" };
  if (r.kind === "needkey") return { error: "选了要 API key 的模型，但没给 key。加 --key，或换 --model sana 先用免 key 通道" };

  try {
    if (!globalThis.fetch) return { error: "当前 Node 不支持 fetch（需要 Node 18+）" };
    let res, j;
    if (r.kind === "json") {
      res = await fetch(r.url, { method: "POST", headers: r.headers, body: JSON.stringify(r.body) });
      if (!res.ok) return { error: "HTTP " + res.status + "（要 key 的通道）" };
      j = await res.json();
      const d = (j && j.data && j.data[0]) || null;
      if (!d) return { error: "返回里没有图片" };
      if (d.b64_json) {
        return { bytes: Buffer.from(d.b64_json, "base64"), ext: ".png" };
      }
      if (!d.url) return { error: "返回里既没有 url 也没有 b64_json" };
      const img = await fetch(d.url, { headers: { "Referer": "" } });
      if (!img.ok) return { error: "取图失败 HTTP " + img.status };
      return { bytes: Buffer.from(await img.arrayBuffer()),
               ext: CT_EXT[String(img.headers.get("content-type") || "").split(";")[0]] || ".png" };
    }
    /* 免 key 通道：直接 GET */
    res = await fetch(r.url);
    const ct = String(res.headers.get("content-type") || "").split(";")[0];
    if (!res.ok || ct.indexOf("image/") !== 0) {
      return { error: "HTTP " + res.status + " " + (ct || "无 content-type")
               + "（免 key 通道约一半请求会被限流挡掉）" };
    }
    return { bytes: Buffer.from(await res.arrayBuffer()), ext: CT_EXT[ct] || ".png", req: r };
  } catch (e) {
    return { error: "请求失败：" + ((e && e.message) || e) };
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* 出图任务：要么来自 build 式的四步选择，要么来自 --draw N 抽出来的组合。
   两条路都返回 [{ chain, prompt, rows }]，后面统一出图。 */
function renderTargets() {
  const drawN = arg("--draw");
  const mdl = arg("--model") || (RENDER ? RENDER.DEFAULT_MODEL : "");
  if (drawN !== "") {
    if (!GACHA) { console.error("[forge] --draw 需要抽卡引擎"); process.exit(3); }
    const n = parseInt(drawN, 10);
    /* model 传给抽卡引擎：每张按那个模型改写。
       抽卡引擎取不到适配层时它自己退回通用正文，两边都不会崩。 */
    const batch = GACHA.rollBatch(n, { lock: parseLocks(), ratio: arg("--ratio"),
                                       model: mdl, rnd: rndOf(arg("--seed")) });
    return batch.cards.map(c => ({ chain: c.chain, prompt: c.prompt, rows: c.rows,
                                   model: mdl }));
  }
  const sel = { style: arg("--style"), theme: arg("--theme"),
                layout: arg("--layout"), palette: arg("--palette") };
  if (!Object.keys(sel).some(k => sel[k])) {
    console.error("[forge] render 要给四步，或用 --draw N 先抽一组。");
    console.error("  例：forge.js render --style ST-001 --theme TH-020");
    console.error("  例：forge.js draw --n 3 --render");
    process.exit(1);
  }
  let prompt, chain, rows;
  if (loadMode === "bundle") {
    const b = bundleCompose(sel);
    /* 先把组合写进替身 STUDIO，适配层才能按这组取料
       （它读的是「当前四步」，与 studio.js 的语义一致）。 */
    globalThis.STUDIO.STEPS.forEach(s => {
      if (sel[s.key]) globalThis.STUDIO.S[s.key] = globalThis.STUDIO.toOldId(sel[s.key]);
    });
    rows = [["style", "画风", b.style], ["theme", "题材", b.theme],
            ["layout", "版式", b.layout], ["palette", "配色", b.palette]]
      .filter(([, , e]) => e)
      .map(([key, label, e]) => ({ key, label, id: e.id, code: e.code || e.id,
                                   zh: e.look || e.zh }));
    chain = rows.map(r => r.code).join(" + ");
    prompt = modelPromptOf(mdl, arg("--ratio"));
  } else {
    ["style", "theme", "layout", "palette"].forEach(k => { if (sel[k]) STUDIO.pick(k, sel[k]); });
    const ids = {};
    STUDIO.STEPS.forEach(s => { ids[s.key] = STUDIO.S[s.key]; });
    prompt = modelPromptOf(mdl, arg("--ratio"));
    rows = STUDIO.STEPS.map(s => {
      const e = STUDIO.entryOf(s.key);
      /* zh 用 labelOf（不是 entry.zh）：工作室层要把创作者名换成特征名。
         这一屏输出的是**摘要**，Agent 会照着它写提示词正文。 */
      return e ? { key: s.key, label: s.zh, id: e.id, code: STUDIO.codeOf(s.key),
                   zh: STUDIO.labelOfEntry(e) } : null;
    }).filter(Boolean);
    chain = rows.map(r => r.code).join(" + ");
  }
  return [{ chain, prompt, rows, model: mdl }];
}

async function runRender() {
  const outDir = path.resolve(process.cwd(), arg("--out") || "forge-out");
  const model = arg("--model") || (RENDER ? RENDER.DEFAULT_MODEL : "sana");
  const ratio = arg("--ratio") || "";
  const seed = arg("--seed");
  const key = arg("--key") || process.env.POLLINATIONS_KEY || "";
  const tries = Math.max(1, parseInt(arg("--tries") || "3", 10));
  /* 重试间隔固定，不做指数退避。
     实测（见 assets/render.js 文件头）免 key 通道的成功率与间隔基本无关，
     3/15/25/35/60 秒都出现过连续 402。既然拉长间隔不提高成功率，
     指数退避只会让用户多等，不如固定一个短间隔多试几次。 */
  const wait = Math.max(0, parseInt(arg("--wait") || "10", 10)) * 1000;

  const targets = renderTargets();
  const opts = { model: model, key: key, ratio: ratio, seed: seed === "" ? undefined : seed };

  /* 先探一次通道：manual / needkey 这类「根本不会发出去」的情况，
     在发第一个请求之前就说清楚，不要等跑完 N 张才发现一张都没出。 */
  if (RENDER) {
    const probe = RENDER.reqOf(targets[0] ? targets[0].prompt : "", opts);
    if (probe.kind === "manual" || probe.kind === "needkey") {
      const r = await grabOnce(targets[0] ? targets[0].prompt : "", opts);
      console.error("✗ " + r.error);
      return 1;
    }
    console.log("通道：" + probe.channel + " · " + probe.w + "×" + probe.h
      + (probe.known ? "" : "（比例 " + (ratio || "?") + " 不认识，按 1:1 出）")
      + "　重试上限 " + tries + " 次");
  }

  fs.mkdirSync(outDir, { recursive: true });
  const results = [];
  let ok = 0;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    console.log("\n[" + (i + 1) + "/" + targets.length + "] " + t.chain);
    let got = null, last = "";
    for (let k = 1; k <= tries; k++) {
      /* 每张换一个 seed，否则同一组组合重复出图会拿到同一张（命中缓存） */
      const o = Object.assign({}, opts, { seed: opts.seed === undefined ? undefined : Number(opts.seed) + k - 1 });
      got = await grabOnce(t.prompt, o);
      if (!got.error) break;
      last = got.error;
      if (k < tries) {
        console.log("    " + got.error + " → " + (wait / 1000) + " 秒后重试（" + k + "/" + tries + "）");
        await sleep(wait);
      }
    }
    if (got && !got.error) {
      /* 文件名 = 模型 + 组合串（把 " + " 压成 "+"）。
         带模型名的理由：同一组四步换个模型出的是两张完全不同的图，
         而文件名只带组合时，第二张会变成「ST-001+TH-020-2.jpg」——
         看文件名分不出它是哪一版的，而「这张是什么」
         恰恰是回头再看时唯一想知道的事。 */
      const base = (t.model ? t.model + "__" : "")
        + (t.chain.replace(/\s*\+\s*/g, "+").replace(/[^\w+.-]+/g, "_")
           || ("forge-" + Date.now()));
      let file = path.join(outDir, base + got.ext);
      for (let s = 2; fs.existsSync(file); s++) {
        file = path.join(outDir, base + "-" + s + got.ext);
      }
      fs.writeFileSync(file, got.bytes);
      ok++;
      console.log("    ✓ " + file + "  (" + (got.bytes.length / 1024).toFixed(0) + " KB)");
      results.push({ chain: t.chain, rows: t.rows, model: t.model || "",
                     file: file, bytes: got.bytes.length, error: "" });
    } else {
      console.log("    ✗ 试了 " + tries + " 次都没拿到：" + last);
      results.push({ chain: t.chain, rows: t.rows, model: t.model || "",
                     file: "", bytes: 0, error: last });
    }
    /* 串行 + 间隔：免 key 通道一并发就 402（网页端同样处理） */
    if (i < targets.length - 1 && wait) await sleep(Math.max(wait, RENDER ? RENDER.gapMs(model) : 0));
  }

  console.log("\n" + (ok ? "出图 " + ok + "/" + targets.length + " 张，存到 " + outDir
                       : "一张都没出。免 key 通道的配额可能暂时用完了，隔几分钟再来。"));
  console.log("边界：① 提示词已发到第三方；② 图带通道水印，商用前自己裁；"
    + "③ 图里的文字是乱码，排版留给后期。");
  if (flag("--json")) console.log(JSON.stringify(results, null, 2));
  return ok ? 0 : 1;
}

if (cmd === "render") {
  /* 出图是异步的，而下面的命令分派是同步的 ——
     这里必须让出控制流，否则会一路落到 build 分支，
     在出图还没完成时先打一堆「用法」然后以错误码退出。
     CommonJS 模块被 Node 包在函数里，所以顶层 return 合法。 */
  runRender().then(c => process.exit(c),
    e => { console.error("[forge] 出图出错：" + ((e && e.stack) || e)); process.exit(1); });
  return;
}

if (cmd === "presets") {
  if (loadMode === "bundle") {
    console.log(JSON.stringify(DATA.presets || [], null, 2));
  } else {
    STUDIO.PRESETS.forEach((p, i) => {
      const s = p.s || {};
      console.log("#" + (i + 1) + " " + p.name + (p.tip ? "  —— " + p.tip : ""));
      console.log("   --style " + s.style + " --theme " + s.theme
        + " --layout " + s.layout + " --palette " + s.palette);
    });
  }
  process.exit(0);
}

if (cmd === "list") {
  const step = argv[1];
  const grep = arg("--grep");
  if (!["style", "theme", "layout", "palette"].includes(step)) {
    console.error("[forge] list 需要一个层名：style / theme / layout / palette");
    process.exit(1);
  }
  let rows;
  if (loadMode === "bundle") {
    const map = { style: "styles", theme: "genres", layout: "layouts", palette: "palettes" };
    rows = (DATA[map[step]] || []).map(e => ({
      id: e.id, code: e.code || e.id, zh: e.zh, cat: e.cat || "",
      ratio: e.ratio || "", hex: e.hex || "", tier: e.tier || "R0"
    }));
  } else {
    rows = STUDIO.candidates(step).map(e => ({
      id: e.id, code: STUDIO.codeOfEntry(e), zh: e.zh, cat: e.cat || "",
      ratio: e.ratio || "", hex: e.hex || "", tier: "R0"
    }));
  }
  if (grep) {
    const q = grep.toLowerCase();
    rows = rows.filter(r => (r.zh + " " + r.id + " " + (r.cat || "")).toLowerCase().includes(q));
  }
  rows.forEach(r => {
    const bits = [r.code, r.zh];
    if (r.cat) bits.push("[" + r.cat + "]");
    if (r.ratio) bits.push(r.ratio);
    if (r.hex) bits.push(r.hex);
    if (r.tier && r.tier !== "R0") bits.push(r.tier);
    console.log(bits.join("  "));
  });
  console.log("\n共 " + rows.length + " 条" + (grep ? "（已按 “" + grep + "” 过滤）" : ""));
  process.exit(0);
}

/* ---------- gallery：示例画廊 ----------
   Agent 在终端里看不到界面，所以它需要一条能问「哪些条目有配图」的路径。
   以前只有网页能看图，Agent 完全不知道 examples/ 的存在——
   于是它只能凭文字描述猜画面，或者干脆不提这件事。

   两种查法：
     gallery              列出全部已配图条目 + 覆盖率
     gallery --todo 段码   列出该段里还没配图的 R0 条目（补图时按段推进）
   --json 给机器读。 */
if (cmd === "gallery") {
  const fs = require("fs");
  const path = require("path");
  const ROOT = path.join(__dirname, "..", "..", "..");
  const EX = path.join(ROOT, "examples");
  /* 画廊数据源在仓库里；bundle 模式不带图片文件，如实报 0 而不是假装有。 */
  let G = [];
  try {
    G = require(path.join(ROOT, "assets", "examples.js")).GALLERY || [];
  } catch (e) { G = []; }
  const shot = {};
  G.forEach(g => { shot[g.id] = g; });

  /* 待补清单按段统计。段码从规范码取首段，
     「旧 id → 规范码」这条路必须走映射表，不能靠字符串猜。 */
  let entries = [];
  try {
    if (loadMode === "bundle") {
      entries = [].concat(DATA.styles || [], DATA.genres || [],
        DATA.layouts || [], DATA.palettes || []);
    } else {
      entries = STUDIO.allEntries();
    }
  } catch (e) { entries = []; }

  const codeOf = e => {
    if (e.code) return e.code;
    if (loadMode !== "bundle" && STUDIO.codeOfEntry) {
      try { return STUDIO.codeOfEntry(e) || ""; } catch (x) { return ""; }
    }
    return e.id || "";
  };
  /* tier 只取两个**真实存在**的来源：
     bundle 模式下 data.json 每条自带 tier 字段；
     仓库模式下按条目走 RIGHTS.inspect。
     不去摸全局 RIGHTS —— CLI 这边没有加载它，
     引用一个不存在的变量会直接抛 ReferenceError（实测踩过）。 */
  /* 必须用 inspect(entry)，不能用 STUDIO.tierOf(id)：
     tierOf() 不接参数，它读的是 STUDIO 里的全局选中态
     （画风或题材取其一），传id 进去会被忽略。
     在 gallery 这种「遍历全部条目」的场合，
     拿到的基本是 null——而 null 被兜成 "R0"，
     于是 R1/R2/R3 条目全被当成「可直接配图的自由条目」列进待补清单。
     后果不是显示难看，是给出补不了的活儿：
     SB（工作室）整段 14 条实际只有 1 条真 R0，
     其余 13 条按 rights.js 的规则强制 R2/R3。 */
  let RIGHTS = null;
  if (loadMode !== "bundle") {
    try { RIGHTS = require(path.join(REPO_ROOT, "assets", "rights.js")).RIGHTS; }
    catch (e) { RIGHTS = null; }
  }
  /* 地理编码（CN-001/JP-001…）：作品段的派生归类字段，
     仓库模式下从 code-map.js 现算。bundle 模式没有这层，
     geo 为空串——待补清单按国家分组时以仓库模式为准。 */
  let CODE_MAP = null;
  if (loadMode !== "bundle") {
    try { CODE_MAP = require(path.join(REPO_ROOT, "assets", "code-map.js")).CODE_MAP; }
    catch (e) { CODE_MAP = null; }
  }
  const geoOf = e => {
    if (!CODE_MAP || typeof CODE_MAP.geoOf !== "function") return "";
    if (!/^W-[A-Z]/i.test(e.id || "")) return "";   /* 只有作品段带地理编码 */
    try {
      if (!CODE_MAP.workOrder().length)
        CODE_MAP.buildWorks(CODE_MAP.WORK_ORDER_FROZEN.slice());
      return CODE_MAP.geoOf(e.id) || "";
    } catch (x) { return ""; }
  };
  const tierOf = e => {
    if (e.tier) return e.tier;
    if (RIGHTS && typeof RIGHTS.inspect === "function") {
      try { return RIGHTS.inspect(e).tier; } catch (x) { return "R?"; }
    }
    /* 判不出档位时不能默认 R0 —— 那等于把未知的当成「可商用」。
       标成 R? 让它不进 R0 待补清单，比错报更安全。 */
    return "R?";
  };

  const todoSeg = arg("--todo");
  const rows = entries.map(e => ({
    id: e.id, code: codeOf(e), zh: e.zh || "", tier: tierOf(e), geo: geoOf(e), img: shot[e.id] || null
  }));

  if (todoSeg) {
    /* 补图清单只给 R0：R1 起要么署名要么改写，
       配图前要先过授权层，直接列出来等于给出补不了的活儿。 */
    const want = String(todoSeg).toUpperCase();
    const pending = rows.filter(r => !r.img && r.code
      && r.code.split("-")[0] === want && r.tier === "R0");
    if (flag("--json")) {
      console.log(JSON.stringify({
        seg: want, total: pending.length,
        pending: pending.map(r => ({ id: r.id, code: r.code, zh: r.zh, geo: r.geo }))
      }, null, 2));
    } else {
      pending.forEach(r => console.log([r.code, r.geo, r.zh, r.id].filter(Boolean).join("  ")));
      console.log("\n" + want + " 段待补 " + pending.length + " 条（R0）");
      console.log("图片文件名用旧 id：" + (pending[0] ? pending[0].id + ".png" : "<id>.png")
        + "，写到 examples/ 下，并在 assets/examples.js 登记。");
    }
    process.exit(0);
  }

  const done = rows.filter(r => r.img);
  const pool = rows.filter(r => !r.img && r.tier === "R0");
  const pct = pool.length + done.length > 0
    ? Math.round((done.length / (pool.length + done.length)) * 100) : 0;

  if (flag("--json")) {
    console.log(JSON.stringify({
      shot: done.length, pendingR0: pool.length, coveragePct: pct,
      entries: done.map(r => ({ id: r.id, code: r.code, zh: r.zh,
        img: r.img.img, note: r.img.note || "" }))
    }, null, 2));
  } else {
    done.forEach(r => console.log([r.code, r.zh, r.id, r.img.img].join("  ")));
    console.log("\n已配 " + done.length + " 张 · R0 候选池 " + pool.length
      + " 条 · 当前覆盖 " + pct + "%");
    console.log("查某段待补清单：forge gallery --todo ST");
  }
  process.exit(0);
}

if (cmd === "entry") {
  const id = argv[1];
  if (!id) { console.error("[forge] entry 需要一个 id"); process.exit(1); }
  if (loadMode === "bundle") {
    const all = [].concat(DATA.styles || [], DATA.genres || [],
                        DATA.layouts || [], DATA.palettes || []);
    const e = all.find(x => x.id === id || x.code === id);
    if (!e) { console.error("[forge] 没找到 " + id); process.exit(1); }
    console.log(e.code || e.id + "  " + e.zh);
    console.log("\n【中文正文】\n" + (e.gptZh || "（无）"));
    console.log("\n【英文正文】\n" + (e.gpt || "（无）"));
    if (e.ratio) console.log("\n【建议画幅】" + e.ratio);
    process.exit(e.tier && e.tier !== "R0" ? 2 : 0);
  }
  const e = STUDIO.byId(id);
  if (!e) { console.error("[forge] 没找到 " + id); process.exit(1); }
  console.log(e.id + "  " + e.zh + (e.cat ? "  [" + e.cat + "]" : ""));
  console.log("\n【中文正文】\n" + (STUDIO.textOf("style", "gptZh") || "（见下方通用查表）"));
  process.exit(0);
}

/* build / diagnose 共用 */
const sel = {
  style: arg("--style"), theme: arg("--theme"),
  layout: arg("--layout"), palette: arg("--palette")
};
const hasAny = Object.keys(sel).some(k => sel[k]);

if (cmd === "diagnose") {
  if (!hasAny) {
    console.log(JSON.stringify({
      complete: false, missing: ["style", "theme", "layout", "palette"],
      note: "四步全未指定。至少给出 --style 与 --theme 才有可出图的提示词。"
    }, null, 2));
    process.exit(1);
  }
  let dg;
  if (loadMode === "bundle") {
    dg = bundleCompose(sel);
  } else {
    Object.keys(sel).forEach(k => { if (sel[k]) STUDIO.pick(k, sel[k]); });
    dg = STUDIO.diagnose();
  }
  console.log(JSON.stringify(dg, null, 2));
  process.exit(0);
}

if (cmd !== "build") { usage(); process.exit(1); }

if (!hasAny) {
  console.error("[forge] build 至少要给一步，例如 --style ST-001");
  console.error("[forge] 四步齐了效果最好：--style --theme --layout --palette");
  process.exit(1);
}

const lang = arg("--lang") || "both";
let out;
let highest = "R0";

if (loadMode === "bundle") {
  const b = bundleCompose(sel);
  /* 四个 id 都查不到就当场说。
     少了这一段时用户会拿到一段「什么都没选」的正文，
     而且命令正常退出 —— 与仓库模式的报错行为不一致。 */
  if (!b.style && !b.theme && !b.layout && !b.palette) {
    console.error("[forge] 四个 id 都查不到对应条目。");
    console.error("[forge] 合法取值见：forge.js list style");
    process.exit(1);
  }
  /* 把组合写进替身 STUDIO 的 S。
     不写的话 model-prompts 读到的「当前四步」全是空 ——
     于是 --model 会静默退回通用正文（materials() 的 hasAny 为 false），
     而命令行看起来一切正常，只是优化版根本没生效。
     与仓库分支的 STUDIO.pick() 语义对齐：适配层只认「当前四步」。 */
  globalThis.STUDIO.STEPS.forEach(st => {
    globalThis.STUDIO.S[st.key] = sel[st.key]
      ? globalThis.STUDIO.toOldId(sel[st.key]) : "";
  });
  out = {
    zh: b.compose("zh"), en: b.compose("en"), tags: b.tags,
    missing: b.missing,
    ratio: b.layout ? b.layout.ratio : "",
    rights: ["style", "theme"].map(k => b[k]).filter(Boolean)
      .map(e => ({ id: e.id, zh: e.look || e.zh, tier: e.tier || "R0" })),
    /* 与仓库分支的 chosen 同构：效果说明（explain）两种模式都要吃这份摘要。 */
    chosen: ["style", "theme", "layout", "palette"].map(k => {
      const e = b[k];
      return e ? { step: k, id: e.id, code: e.code || e.id,
                   zh: e.look || e.zh } : null;
    }).filter(Boolean)
  };
  (out.rights || []).forEach(r => {
    const order = { R0: 0, R1: 1, R2: 2, R3: 3 };
    if (order[r.tier] > order[highest]) highest = r.tier;
  });
} else {
  Object.keys(sel).forEach(k => { if (sel[k]) STUDIO.pick(k, sel[k]); });
  const dg = STUDIO.diagnose();
  const rs = STUDIO.rightsSummary();
  rs.forEach(r => {
    const order = { R0: 0, R1: 1, R2: 2, R3: 3 };
    if (order[r.tier] > order[highest]) highest = r.tier;
  });
  /* missing 统一提到顶层。
     仓库模式的 diagnose() 结果原本挂在 out.diagnose.missing，
     而 bundle 模式直接是 out.missing，文本输出只读后者，
     于是仓库模式下缺步提示整段不打印 —— 而 SKILL.md 里
     把「缺步必须说」写成了硬规则，规则失效比没有规则更糟。 */
  out = {
    zh: STUDIO.compose("zh"),
    en: STUDIO.compose("en"),
    tags: STUDIO.composeTags(),
    negatives: STUDIO.negatives(),
    ratio: (STUDIO.entryOf("layout") || {}).ratio || "",
    tier: STUDIO.tierOf(),
    rights: rs,
    missing: dg.missing || [],
    diagnose: dg,
    chosen: ["style", "theme", "layout", "palette"].map(k => {
      const e = STUDIO.entryOf(k);
      /* 与 draw / render 一致：摘要里用去标识后的显示名，
         不用条目自己的 zh（工作室层那个名字带创作者名）。 */
      return e ? { step: k, id: e.id, code: STUDIO.codeOf(k),
                   zh: STUDIO.labelOfEntry(e) } : null;
    }).filter(Boolean)
  };
}

/* 效果说明两种模式都挂：JSON 里是 explain 字段，
   文本输出里是「这张图会怎么变」段（见下方打印分支）。 */
const _styleSel = (out.chosen || []).find(c => c.step === "style");
out.explain = buildExplain(out.chosen, _styleSel ? _styleSel.code : "");

if (flag("--json")) {
  /* --model 给的是「按那个模型改写过的提示词」，
     不给就只有通用正文。
     两个字段分开而不是互相覆盖：
     en 是本库的通用正文（基准，永远在），
     modelPrompt 是某个模型的专用写法（换模型就换）——
     覆盖掉 en 的话，用户就没法比较「默认」与「优化后」的差别了。 */
  if (arg("--model")) {
    out.model = arg("--model");
    out.modelPrompt = modelPromptOf(out.model, arg("--ratio"));
    const mo = MODEL_PROMPTS && MODEL_PROMPTS.of(out.model, { lang: "en", ratio: arg("--ratio") });
    out.modelParams = (mo && mo.params) || "";
    out.modelNote = (mo && mo.note) || "";
  }
  console.log(JSON.stringify(out, null, 2));
} else {
  /* 缺步在两种模式下结构不同：
     仓库模式  STUDIO.diagnose().missing = ["theme", "layout", ...]（只有步名）
     bundle 模式 bundleCompose().missing      = [{step, why}, ...]（带原因）
   两边共用这一个打印器，所以要先归一化 ——
   直接读 m.step 会得到一堆 undefined，表现为「缺步提示段打印出来了但每行都是 undefined: undefined」。
   归一化放在这里而不是改 diagnose()，是因为 diagnose 的结构是页面 UI 的契约，
   为了 CLI 去改它会牵动 studio-ui.js。 */
  const STEP_ZH = { style: "画风", theme: "题材", layout: "版式", palette: "配色" };
  const MISS_WHY = {
    style:   "没有画风：模型会按题材自己挑默认画法，同一个题材连出十张差别很大。",
    theme:   "没有题材：画风与版式没有承载对象，只能画成一张泛用的插画。",
    layout:  "没有版式：画面会居中平铺，信息没有分布，社媒图与信息图基本不可用。",
    palette: "没有配色：颜色由题材与画风偶然决定，整幅不会有统一的色调。"
  };
  function normMissing(list) {
    return (list || []).map(m =>
      (typeof m === "string")
        ? { step: m, why: MISS_WHY[m] || "" }
        : m);
  }

  if (out.missing && out.missing.length) {
    console.log("⚠ 缺步提示（缺了会这样）：");
    normMissing(out.missing).forEach(m =>
      console.log("  · " + (STEP_ZH[m.step] || m.step) + "：" + m.why));
    console.log("");
  }
  if (lang === "zh" || lang === "both") {
    console.log("=== 中文出图提示词 ===");
    console.log(out.zh);
    console.log("");
  }
  if (lang === "en" || lang === "both") {
    console.log("=== English prompt ===");
    console.log(out.en);
    console.log("");
  }

  /* --model：按该模型语法优化过的版本。
     打印在通用正文之后，这样 Agent 一眼能看出「改了什么」——
     只给优化版的话，读者无从判断它是不是少了什么约束。 */
  if (arg("--model")) {
    const mk = arg("--model");
    const mo = MODEL_PROMPTS && MODEL_PROMPTS.of(mk, { lang: "en", ratio: arg("--ratio") });
    const mname = (RENDER && RENDER.modelById(mk) || {}).zh || mk;
    console.log("=== " + mname + " 优化版（--model " + mk + "） ===");
    if (mo && mo.note) console.log("· " + mo.note);
    /* 纯文本输出拼上 --参数：这里给的是「一条能直接粘进 MJ」的完整串。
       JSON 输出仍保持正文 / 参数两个字段分离（见 modelPromptOf 的注释）。 */
    console.log(modelPromptOf(mk, arg("--ratio"))
      + (mo && mo.params ? " " + mo.params : ""));
    console.log("");
  }
  if (out.tags) {
    console.log("=== 标签速用版（MJ / SD / Flux / niji）===");
    console.log(out.tags);
    console.log("");
  }
  if (out.negatives) {
    console.log("=== 负面词 ===");
    console.log(out.negatives);
    console.log("");
  }
  if (out.ratio) { console.log("=== 建议画幅 ===\n" + out.ratio + "\n"); }
  if (out.chosen && out.chosen.length) {
    console.log("=== 组合 ===");
    out.chosen.forEach(c => console.log("  " + c.step + "\t" + c.code + "\t" + c.zh));
    console.log("");
  }
  /* 效果说明紧跟组合：组合列出「选了什么」，这一段说清「所以画面会怎么变」。
     顺序不能颠倒——先有选择、后有推论，读起来才是同一条因果链。 */
  if (out.explain) {
    const STEP_ZH2 = { style: "画风", theme: "题材", layout: "版式", palette: "配色" };
    console.log("=== 效果说明（这张图会怎么变） ===");
    out.explain.changed.forEach(c =>
      console.log("  " + (STEP_ZH2[c.step] || c.step) + " · " + c.code
        + " " + c.zh + " —— " + c.role));
    out.explain.keepAlways.forEach(k => console.log("  恒定保留：" + k));
    if (out.explain.styleFit && out.explain.styleFit.length) {
      console.log("  画风名在各模型上叫不叫得动（改写层已按此调整写法）：");
      out.explain.styleFit.forEach(f =>
        console.log("    " + f.zh + "：" + f.why));
    }
    console.log("  测试状态与限制：");
    out.explain.limits.forEach(l => console.log("    · " + l));
    console.log("");
  }
  if (out.rights && out.rights.length) {
    console.log("=== 授权 ===");
    out.rights.forEach(r => console.log("  " + r.tier + " " + (r.zh || r.id)
      + (r.reason ? "：" + r.reason : "") + (r.requirement ? "。" + r.requirement : "")));
  }
}

if (highest === "R2" || highest === "R3") {
  console.error("");
  console.error("✗ 组合含 " + highest + " 条目，不可直接用于商业出图。");
  console.error("  处理办法见 references/RIGHTS.md —— 先去标识化或改写，不要直接投喂。");
  process.exit(2);
}
process.exit(0);