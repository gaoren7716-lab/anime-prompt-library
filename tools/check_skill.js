#!/usr/bin/env node
/* ============================================================
 * 技能包体检 —— tools/check_skill.js
 * ============================================================
 *
 * 这个技能包有两套合成实现：
 *   A) 仓库模式  → assets/studio.js（真实引擎，含授权扫描与画质分档）
 *   B) bundle 模式 → references/data.json + forge.js 里的 bundleCompose
 * 两者必须逐字相同。改了一处忘了另一处，症状是
 * 「在我机器上跑得好好的，装成技能就变了」——
 * 而这种不一致不会让任何现有测试变红。
 *
 * 所以这个测试的核心断言是 A/B 对拍，不是各跑一遍看是否不报错。
 * ============================================================ */
"use strict";

const path = require("path");
const fs = require("fs");
const vm = require("vm");
const { execFileSync } = require("child_process");

/* tools/check_skill.js → 仓库根是上两级，不是三级 */
const ROOT = path.resolve(__dirname, "..");
const SKILL = path.join(ROOT, "codex-skill", "anime-prompt-forge");
const FORGE = path.join(SKILL, "scripts", "forge.js");

let pass = 0, fail = 0, skipped = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log("  ✓ " + msg); }
  else { fail++; console.log("  ✗ " + msg); }
}

/* 受限环境（沙箱、无执行权限的 CI）里可能根本不允许创建子进程，
   Windows 上表现为 EBUSY。那时候所有 CLI 断言会一起变红，
   而代码是好的 —— **一片红比不报还糟**：
   真出问题时没人能从 31 条同样的失败里看出差别。
   所以先探一次，探不通就把 CLI 段整体标成「跳过」，并大声写出来。 */
let spawnOK = true, spawnWhy = "";
try {
  /* 探测必须用**和下面 run() 一样的管道模式**（encoding 会开 stdout/stderr 管道）。
     用 stdio:"ignore" 探会探通：受限环境拦的正是给子进程建管道，
     不建管道就能起进程 —— 那样探测说「能用」，
     后面 31 条断言照样全红，等于白探。 */
  execFileSync(process.execPath, ["-e", "0"], { encoding: "utf8" });
} catch (e) {
  if (e.code === "EBUSY" || e.code === "EPERM" || e.code === "EACCES") {
    spawnOK = false;
    spawnWhy = e.code;
  }
}
/* CLI 段落专用的断言：环境不支持子进程时计「跳过」而不是「失败」。 */
function okc(cond, msg) {
  if (!spawnOK) { skipped++; console.log("  – 跳过 · " + msg); return; }
  ok(cond, msg);
}
/* 只读源码的断言 —— 不需要子进程，所以**不**受 spawnOK 影响。
   早前第 13 节整段用 okc，结果 11 条本机一条都验不到：
   「跳过」的语义是「环境跑不了」，不是「不需要跑」，
   两者混用会让真正的断言悄悄消失。 */
function oks(cond, msg) { ok(cond, msg); }
function head(t) { console.log("\n【" + t + "】"); }

/* ---------- 载入仓库模式 ---------- */
const _loadlist = require(path.join(ROOT, "tools", "_loadlist.js"));
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

const D = {};
["STYLES", "GENRES", "LAYOUTS", "PALETTES"].forEach(n => {
  D[n] = vm.runInContext("(typeof " + n + "!=='undefined'?" + n + ":[])", ctx);
});
const ENGINE = require(_loadlist.A("engine.js")).ENGINE;
ENGINE.register(D.STYLES, "styles", "画风流派");
ENGINE.register(D.GENRES, "genres", "题材元素");
ENGINE.register(D.LAYOUTS, "layouts", "排版图型");
ENGINE.register(D.PALETTES, "palettes", "主题配色");
const STUDIO = require(_loadlist.A("studio.js")).STUDIO;

/* ---------- 1. 文件齐备 ---------- */
head("【1】技能包文件齐备");
["SKILL.md", "INSTALL.md", "references/CATALOG.md", "references/RIGHTS.md",
 "references/MODELS.md", "references/data.json", "scripts/forge.js",
 "scripts/build_catalog.js", "scripts/build_bundle.js",
 /* 引擎副本：命令行出图与抽卡靠它们，
     独立安装时仓库的 assets/ 不在旁边，缺了就只剩提示词没有出图 */
 "scripts/render-core.js", "scripts/gacha-core.js"].forEach(f => {
  const p = path.join(SKILL, f);
  ok(fs.existsSync(p) && fs.statSync(p).size > 0, f + " 存在且非空");
});

/* ---------- 2. SKILL.md frontmatter ---------- */
head("【2】SKILL.md 可被 Agent 识别");
{
  const md = fs.readFileSync(path.join(SKILL, "SKILL.md"), "utf8");
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  okc(!!m, "有 YAML frontmatter");
  if (m) {
    const fm = m[1];
    okc(/^name:\s*\S+/m.test(fm), "有 name 字段");
    okc(/^description:\s*\S+/m.test(fm), "有 description 字段");
    const desc = (fm.match(/^description:\s*(.+)$/m) || [])[1] || "";
    okc(desc.length > 40, "description 足够具体（" + desc.length + " 字符）");
    okc(desc.length < 1024, "description 不超长");
  }
  /* 内容完整性：Skill 里写到的命令必须真存在 */
  okc(/forge\.js build/.test(md), "SKILL.md 写了 build 用法");
  okc(/forge\.js list/.test(md), "SKILL.md 写了 list 用法");
  okc(/forge\.js presets/.test(md), "SKILL.md 写了 presets 用法");
  okc(/forge\.js draw/.test(md), "SKILL.md 写了 draw 用法（Codex 侧的抽卡）");
  okc(/forge\.js render/.test(md), "SKILL.md 写了 render 用法（Codex 侧的出图）");
  okc(/退出码 2/.test(md), "SKILL.md 说明了授权闸门");
}

/* ---------- 3. CLI 真实可跑 ---------- */
head("【3】CLI 四类命令都能跑");
function run(args) {
  try {
    return { out: execFileSync(process.execPath, [FORGE].concat(args), { encoding: "utf8" }), code: 0 };
  } catch (e) {
    return { out: (e.stdout || "") + (e.stderr || ""), code: e.status };
  }
}
{
  const h = run(["help"]);
  okc(h.code === 0 && /用法/.test(h.out), "help 返回用法");

  const ls = run(["list", "layout"]);
  okc(ls.code === 0 && /LT-001/.test(ls.out), "list layout 输出规范码");
  okc(/3:4/.test(ls.out), "list layout 输出画幅");

  const lp = run(["list", "palette"]);
  okc(lp.code === 0 && /PL-001/.test(lp.out) && /#[0-9A-F]{6}/i.test(lp.out), "list palette 输出主色 HEX");

  const lg = run(["list", "theme", "--grep", "机甲"]);
  okc(lg.code === 0 && /TH-/.test(lg.out), "list theme --grep 过滤生效");

  const pr = run(["presets"]);
  okc(pr.code === 0 && /--style/.test(pr.out), "presets 给出可直接用的命令行");
}

/* ---------- 4. build 输出结构 ---------- */
head("【4】build 输出七段齐全");
{
  const b = run(["build", "--style", "ST-001", "--theme", "TH-020",
                 "--layout", "LT-001", "--palette", "PL-001"]);
  okc(b.code === 0, "R0 组合退出码 0（实测 " + b.code + "）");
  ["中文出图提示词", "English prompt", "标签速用版", "负面词", "建议画幅", "授权", "组合"]
    .forEach(k => okc(b.out.includes(k), "输出含「" + k + "」"));
  okc(b.out.indexOf("中文出图提示词") < b.out.indexOf("English prompt"), "中文在英文之前");
  okc(/3:4/.test(b.out), "画幅写进输出");

  const only = run(["build", "--style", "ST-001", "--lang", "en"]);
  okc(only.code === 0 && !/中文出图提示词/.test(only.out), "--lang en 只出英文");

  const j = run(["build", "--style", "ST-001", "--theme", "TH-020", "--json"]);
  let parsed = null;
  try { parsed = JSON.parse(j.out); } catch (e) { parsed = null; }
  okc(!!parsed, "--json 输出可解析");
  okc(parsed && typeof parsed.zh === "string" && parsed.zh.length > 200, "json.zh 是完整正文");
  okc(parsed && typeof parsed.en === "string" && parsed.en.length > 200, "json.en 是完整正文");
}

/* ---------- 5. 缺步诊断 ---------- */
head("【5】缺步必须显式报出");
{
  const d = run(["build", "--style", "ST-001", "--lang", "zh"]);
  okc(d.code === 0, "只给画风也能出（退出码 0）");
  okc(/缺步提示/.test(d.out), "输出缺步提示段");
  okc(/没有题材/.test(d.out) && /没有版式/.test(d.out) && /没有配色/.test(d.out),
    "逐项说明缺哪三层");
  okc(/不能|只能|不会有/.test(d.out), "每项都说了缺了的后果");

  const empty = run(["build"]);
  okc(empty.code === 1, "完全没给参数时退出码 1（实测 " + empty.code + "）");
  okc(/至少要给一步/.test(empty.out), "并给出修正指引");
}

/* ---------- 6. 授权闸门 ---------- */
head("【6】授权闸门是真拦截");
{
  /* 作品层 R3 不在工作流里，所以这里直接查 bundle 里的 R2/R3 条目 */
  const data = JSON.parse(fs.readFileSync(path.join(SKILL, "references", "data.json"), "utf8"));
  const r2 = [].concat(data.styles, data.genres, data.layouts, data.palettes)
    .filter(e => e.tier === "R2" || e.tier === "R3");
  okc(r2.length > 0, "bundle 里有 " + r2.length + " 条 R2/R3 条目");

  /* 全部 R0 的组合必须放行 */
  const r0 = [].concat(data.styles, data.genres)
    .filter(e => e.tier === "R0").map(e => e.code);
  const b = run(["build", "--style", r0[0], "--theme", r0.find(x => x.startsWith("TH-"))]);
  okc(b.code === 0, "R0 + R0 组合放行（实测 " + b.code + "）");

  /* 用含 R2 的画风构造一个组合，必须被拦住 */
  const r2style = r2.find(e => /^ST-/.test(e.code));
  if (r2style) {
    const g = run(["build", "--style", r2style.code]);
    okc(g.code === 2, "含 R2 的组合退出码 2（实测 " + g.code + "，条目 " + r2style.code + "）");
    okc(/不可直接用于商业出图/.test(g.out + g.err), "并打印了禁止性提示");
    okc(/RIGHTS\.md/.test(g.out + g.err), "并指向处理办法文档");
  } else {
    okc(true, "当前无 R2 画风条目，跳过 R2 拦截断言");
  }
}

/* ---------- 7. 场景不冲突（本轮修的核心问题） ---------- */
head("【7】画风层不带场景，主体不冲突");
{
  const data = JSON.parse(fs.readFileSync(path.join(SKILL, "references", "data.json"), "utf8"));
  /* craft* 是纯技法；gpt 是带场景的完整正文。合成时只能取 craft*。 */
  let leaked = [];
  data.styles.forEach(e => {
    if (!e.craftEn) return;
    /* craftEn 里出现具体人物动作就算泄漏 */
    if (/\b(a|an)\s+(teenage|young|man|woman|girl|boy|student|soldier|samurai|ninja|adventurer|figure)s?\b/i.test(e.craftEn))
      leaked.push(e.code);
  });
  ok(leaked.length === 0, "英文技法描述里没有具体人物"
    + (leaked.length ? " → " + leaked.slice(0, 5).join(", ") : ""));

  /* 真跑一次，看合成结果里画风段是否与题材段争夺主体 */
  STUDIO.reset();
  STUDIO.pick("style", "A1-01"); STUDIO.pick("theme", "G-20");
  STUDIO.pick("layout", "LT-01"); STUDIO.pick("palette", "PL-01");
  const zh = STUDIO.compose("zh");
  const en = STUDIO.compose("en");
  /* G-20 题材的主体是「学生」，A1-01 画风不该再引入「女生/教室」 */
  ok(/画法：/.test(zh), "中文正文用「画法：」段而非画风完整正文");
  ok(/Rendering approach:/.test(en), "英文正文用 Rendering approach 段");
  ok(!/空教室里/.test(zh), "画风层没有重复题材的场景（无「空教室里」）");
  ok(!/navy sailor uniform/.test(en), "英文画风层没有自带制服设定");
}

/* 递归复制目录。
   不用 fs.cpSync：在本机它会让 node **无声退出**（退出码 127，没有任何输出，
   临时目录留在原地）。一个静默 127 是没法排查的，所以这里手写一份 ——
   每层都看得见，出错就抛正常的 ENOENT/EACCES。 */
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from, { withFileTypes: true }).forEach(d => {
    const a = path.join(from, d.name), b = path.join(to, d.name);
    if (d.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  });
}

/* ---------- 8. A/B 双模式对拍 ---------- */
head("【8】bundle 模式与仓库模式逐字一致");
{
  /* 复制一份技能包到临时目录，让它找不到 assets/，只能走 bundle */
  const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "forge-bundle-"));
  const dst = path.join(tmp, "anime-prompt-forge");
  /* **整包**复制，不是只拷 forge.js + data.json。
     真实安装就是整包复制，而 forge.js 现在还要从包里取
     scripts/render-core.js 与 scripts/gacha-core.js（出图与抽卡引擎的副本）。
     只拷两个文件的话 draw 会因为找不到引擎而失败 ——
     那不是「两种模式不一致」，是测试自己搭的环境不对。 */
  copyDir(SKILL, dst);
  const bundleForge = path.join(dst, "scripts", "forge.js");

  /* bundle 模式的调用统一走这里：同样的管道模式、同样的容错 */
  function runBundle(args) {
    try {
      return { out: execFileSync(process.execPath, [bundleForge].concat(args),
                                 { encoding: "utf8", maxBuffer: 1 << 26 }), code: 0 };
    } catch (e) {
      return { out: (e.stdout || "") + (e.stderr || ""), code: e.status };
    }
  }

  /* bundle 版要能看到仓库 assets/ 才会走错模式，
     所以放在 temp 下，向上两级找不到 anime-prompt-library/assets。 */
  /* 用例必须挑 R0 组合。
     R2/R3 组合以退出码 2 结束、JSON 只输出到授权提示之前就 process.exit，
     拿它对拍会得到「一侧不是合法 JSON」的假失败，
     把真正的不一致盖掉 —— 授权闸门本身由【6】单独测。 */
  const bdata = JSON.parse(fs.readFileSync(path.join(SKILL, "references", "data.json"), "utf8"));
  const r0 = k => bdata[k].filter(e => e.tier === "R0");
  const st = r0("styles"), gn = r0("genres"), ly = r0("layouts"), pl = r0("palettes");
  okc(st.length > 5 && gn.length > 5 && ly.length > 5 && pl.length > 5,
    "R0 条目够组用例（画风 " + st.length + " 题材 " + gn.length
    + " 版式 " + ly.length + " 配色 " + pl.length + "）");

  const pickBy = (arr, re, i) => arr.find(e => re.test(e.code)) || arr[i];
  const cases = [
    [st[0], gn[0], ly[0], pl[0]],
    [pickBy(st, /^ST-01[0-4]/, 10), pickBy(gn, /^TH-0(0[2-9]|1[0-9])/, 10),
     pickBy(ly, /^LT-01[0-9]/, 10), pickBy(pl, /^PL-0(0[6-9]|1[0-2])/, 6)],
    [pickBy(st, /^ST-00[5-9]/, 5), pickBy(gn, /^TH-0(2[0-9])/, 20),
     pickBy(ly, /^LT-0(2[0-9])/, 20), pickBy(pl, /^PL-00[2-5]/, 2)]
  ].map(c => ["--style", c[0].code, "--theme", c[1].code,
               "--layout", c[2].code, "--palette", c[3].code]);
  let mismatch = [];
  cases.forEach(args => {
    if (!spawnOK) return;                  // 环境不支持子进程，谈不上对拍
    const A = run(["build"].concat(args, ["--json"]));
    const B = runBundle(["build"].concat(args, ["--json"]));

    let a, b;
    try { a = JSON.parse(A.out); } catch (e) { a = null; }
    try { b = JSON.parse(B.out); } catch (e) { b = null; }
    if (!a || !b) {
      mismatch.push(args.join(" ") + " （有一侧不是合法 JSON：A 退出码 "
        + A.code + " / B 退出码 " + B.code + "）");
      return;
    }
    /* 只比对合成结果。诊断字段（tier / reason / requirement）两模式来源不同，
       bundle 里没有 rights.js 的推理过程，不该要求逐字相同。 */
    ["zh", "en", "tags", "ratio"].forEach(k => {
      if (String(a[k]) !== String(b[k])) {
        const x = String(a[k] || ""), y = String(b[k] || "");
        let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++;
        mismatch.push(args.join(" ") + " → " + k + " 在第 " + i + " 字符分叉\n"
          + "       A " + JSON.stringify(x.slice(Math.max(0, i - 30), i + 50)) + "\n"
          + "       B " + JSON.stringify(y.slice(Math.max(0, i - 30), i + 50)));
      }
    });
  });
  okc(mismatch.length === 0, "三组用例的合成结果逐字一致"
    + (mismatch.length ? "\n     " + mismatch.join("\n     ") : ""));

  /* ---- draw 也要对拍 ----
     draw 是随机的，所以必须带 --seed：
     同一个 seed 下两个模式抽到的必须是同一组。
     不带 seed 的话这条断言只能比「都是四层」，那等于什么都没测 ——
     而「命令行抽出来的和网页抽出来的不一样」是会真实发生的漂移方式。 */
  const drawCases = [
    ["--n", "1", "--seed", "42"],
    ["--n", "3", "--seed", "7"],
    ["--n", "6", "--seed", "2026"],
    ["--n", "2", "--lock", "style=ST-001", "--seed", "5"]
  ];
  const dMismatch = [];
  drawCases.forEach(args => {
    if (!spawnOK) return;
    const A = run(["draw"].concat(args, ["--json"]));
    const B = runBundle(["draw"].concat(args, ["--json"]));
    let a, b;
    try { a = JSON.parse(A.out); } catch (e) { a = null; }
    try { b = JSON.parse(B.out); } catch (e) { b = null; }
    if (!a || !b) {
      dMismatch.push(args.join(" ") + "（有一侧不是合法 JSON：A 退出码 " + A.code
        + " / B 退出码 " + B.code + "）");
      return;
    }
    const sig = j => j.cards.map(c =>
      c.chain + "｜" + c.rows.map(r => r.code + r.zh).join(",")).join(" ‖ ");
    if (sig(a) !== sig(b)) dMismatch.push(args.join(" ") + "\n       A " + sig(a) + "\n       B " + sig(b));
    if (a.space !== b.space) dMismatch.push(args.join(" ") + " 可组合空间不一致："
      + a.space + " vs " + b.space);
    if (a.cards[0].prompt !== b.cards[0].prompt) dMismatch.push(args.join(" ") + " 英文正文不一致");
    if (a.cards[0].promptZh !== b.cards[0].promptZh) dMismatch.push(args.join(" ") + " 中文正文不一致");
  });
  okc(dMismatch.length === 0, "同一个 seed 下抽到的组合逐项一致（含组合信息与中英正文）"
    + (dMismatch.length ? "\n     " + dMismatch.join("\n     ") : ""));

  fs.rmSync(tmp, { recursive: true, force: true });
}

/* ---------- 9. bundle 数据完整性 ---------- */
head("【9】bundle 数据自检");
{
  const data = JSON.parse(fs.readFileSync(path.join(SKILL, "references", "data.json"), "utf8"));
  ok(data.counts.total === data.styles.length + data.genres.length
     + data.layouts.length + data.palettes.length, "counts.total 与实际条数吻合");
  ok(data.styles.length === 59, "画风 59 条");
  ok(data.genres.length === 32, "题材 32 条");
  ok(data.layouts.length === 30, "版式 30 条");
  ok(data.palettes.length === 12, "配色 12 条");

  const all = [].concat(data.styles, data.genres, data.layouts, data.palettes);
  const noCode = all.filter(e => !e.code || !/^[A-Z]{2}-\d{3}$/.test(e.code));
  ok(noCode.length === 0, "每条都有规范码"
    + (noCode.length ? " → " + noCode.slice(0, 4).map(e => e.id).join(", ") : ""));
  const noTier = all.filter(e => !/^R[0-3]$/.test(e.tier));
  ok(noTier.length === 0, "每条都有授权档");
  const ids = all.map(e => e.id);
  ok(new Set(ids).size === ids.length, "无重复 id");
  const noCraft = data.styles.filter(e => !e.craftEn || !e.craftZh);
  ok(noCraft.length === 0, "画风都有双语技法描述");
  const noRatio = data.layouts.filter(e => !e.ratio);
  ok(noRatio.length === 0, "版式都有画幅");
  const noHex = data.palettes.filter(e => !e.hex);
  ok(noHex.length === 0, "配色都有主色");

  /* 预设引用的条目必须真实存在 */
  const codeSet = new Set(all.map(e => e.code));
  const badPreset = [];
  data.presets.forEach(p => {
    Object.keys(p.s).forEach(k => { if (!codeSet.has(p.s[k])) badPreset.push(p.name + "." + k + "=" + p.s[k]); });
  });
  ok(badPreset.length === 0, "预设引用的条目都存在"
    + (badPreset.length ? " → " + badPreset.join(", ") : ""));
}

/* ---------- 10. 速查表与数据一致 ---------- */
head("【10】CATALOG.md 与数据一致");
{
  const cat = fs.readFileSync(path.join(SKILL, "references", "CATALOG.md"), "utf8");
  const data = JSON.parse(fs.readFileSync(path.join(SKILL, "references", "data.json"), "utf8"));
  ok(cat.includes("画风 style | " + data.styles.length), "画风条数一致");
  ok(cat.includes("题材 theme | " + data.genres.length), "题材条数一致");
  ok(cat.includes("版式 layout | " + data.layouts.length), "版式条数一致");
  ok(cat.includes("配色 palette | " + data.palettes.length), "配色条数一致");
  const missing = data.styles.filter(e => cat.indexOf("`" + e.code + "`") < 0);
  ok(missing.length === 0, "每条画风的规范码都在速查表里"
    + (missing.length ? " → 缺 " + missing.length + " 条" : ""));
}

/* ---------- 11. 引擎副本：包里那份必须与真源逐字相同 ---------- */
head("【11】包内引擎副本与 assets/ 真源逐字一致");
{
  /* 命令行不另写一套出图与抽卡实现，而是把 assets/render.js 与
     assets/gacha.js 逐字复制进包里（build_bundle.js 负责复制）。
     复制本身不会错，这一条防的是**以后**：
     改了 assets/ 却没重跑 build_bundle.js。
     那种情况下仓库里跑得好好的，装到 Codex 里是旧行为，
     而两边都不会报错 —— 只会在某个通道上悄悄不同。 */
  const COPIES = [["assets/render.js", "scripts/render-core.js"],
                  ["assets/gacha.js", "scripts/gacha-core.js"],
                  /* model-prompts 的副本改了名（-core），
                     因为它内部的 require 是 "./studio.js" ——
                     保持原名会让人以为包里漏装了 studio.js。 */
                  ["assets/model-prompts.js", "scripts/model-prompts-core.js"]];
  COPIES.forEach(([src, dst]) => {
    const a = path.join(ROOT, src);
    const b = path.join(SKILL, dst);
    if (!fs.existsSync(b)) { ok(false, dst + " 不存在（跑一次 build_bundle.js）"); return; }
    const sa = fs.readFileSync(a, "utf8");
    const sb = fs.readFileSync(b, "utf8");
    if (sa === sb) { ok(true, dst + " 与 " + src + " 逐字相同（" + (sa.length / 1024).toFixed(1) + " KB）"); return; }
    let i = 0; while (i < sa.length && i < sb.length && sa[i] === sb[i]) i++;
    ok(false, dst + " 与 " + src + " 不一致：第 " + i + " 字符起分叉\n"
      + "       assets  " + JSON.stringify(sa.slice(Math.max(0, i - 30), i + 50)) + "\n"
      + "       包内    " + JSON.stringify(sb.slice(Math.max(0, i - 30), i + 50))
      + "\n       → 跑 node codex-skill/anime-prompt-forge/scripts/build_bundle.js");
  });
}

/* ---------- 12. 步骤声明：bundle 的层必须等于工作流的层 ---------- */
head("【12】bundle 的 steps 与 STUDIO.STEPS 一致");
{
  /* bundle 的 draw 靠 data.json 里的 steps 决定「抽哪几层」。
     层数对不上时抽出来的组合只是少一层约束 —— 照样能出图，
     而且没有任何报错，属于最难查的一类。 */
  const data = JSON.parse(fs.readFileSync(path.join(SKILL, "references", "data.json"), "utf8"));
  const bs = data.steps || [];
  ok(bs.length === STUDIO.STEPS.length,
    "层数一致（bundle " + bs.length + " / 工作流 " + STUDIO.STEPS.length + "）");
  const drift = [];
  STUDIO.STEPS.forEach((s, i) => {
    const b = bs[i];
    if (!b) { drift.push("缺第 " + (i + 1) + " 层「" + s.zh + "」"); return; }
    if (b.key !== s.key) drift.push("#" + (i + 1) + " key：" + b.key + " vs " + s.key);
    if (b.zh !== s.zh) drift.push("#" + (i + 1) + " 名称：" + b.zh + " vs " + s.zh);
    if (!b.list || !Array.isArray(data[b.list]) || !data[b.list].length)
      drift.push("#" + (i + 1) + " 的数据层为空（list=" + b.list + "）");
  });
  ok(drift.length === 0, "每层的 key / 名称 / 数据层都对得上"
    + (drift.length ? " → " + drift.join("；") : ""));

  /* 工作流里出现的层，命令行的抽卡也必须能覆盖 ——
     用 draw 的槽位数直接对一次。 */
  const repo = require(path.join(ROOT, "assets", "gacha.js")).GACHA;
  ok(repo.slots().length === bs.length,
    "抽卡槽位数 = bundle 的层数（" + repo.slots().length + " = " + bs.length + "）");

  /* ---- 替身层的映射逐条对拍 ----
     bundle 模式下 gacha.js 读的 STUDIO 是 forge.js 用 data.json 拼的替身，
     替身最容易错的地方是「哪一层取哪个数组」和「显示名怎么来」。
     这两个都能在**本进程内**验，不需要子进程 ——
     而子进程在本机是禁用的，靠它兜底等于这条断言长期不跑。 */
  const slotsRepo = repo.slots();
  const mapDrift = [];
  bs.forEach((b, i) => {
    const sl = slotsRepo[i];
    if (!sl) { mapDrift.push("槽 " + i + " 缺失"); return; }
    const wantCodes = (data[b.list] || []).map(e => e.code).sort().join(",");
    const gotCodes = sl.entries.map(e => e.code).sort().join(",");
    if (wantCodes !== gotCodes)
      mapDrift.push("「" + b.zh + "」候选集合不同（bundle "
        + (data[b.list] || []).length + " 条 / 抽卡 " + sl.entries.length + " 条）");
    /* 显示名必须是**去标识后**的那个：工作室层的条目名带创作者名，
       而组合摘要是 Agent 会照着写提示词的地方。 */
    const rawStudio = (data[b.list] || []).filter(e => e.look);
    const leaked = sl.entries.filter(e => {
      const src = (data[b.list] || []).find(x => x.code === e.code);
      return src && src.look && e.zh !== src.look;
    });
    if (leaked.length)
      mapDrift.push("「" + b.zh + "」有 " + leaked.length + " 条的显示名没去掉标识："
        + leaked.slice(0, 2).map(e => e.zh).join(" / "));
    if (rawStudio.length) ok(true, "「" + b.zh + "」有 " + rawStudio.length
      + " 条需要去标识，显示名已换成特征名");
  });
  ok(mapDrift.length === 0, "替身层的候选映射与显示名都对得上"
    + (mapDrift.length ? " → " + mapDrift.join("；") : ""));
}

/* ---------- 13. 按模型优化：替身接口与两模式一致性 ---------- */
head("【13】bundle 模式的替身 STUDIO 满足适配层的取料需要");
{
  /* model-prompts.js 会调 STUDIO 的 entryOf / styleCraft / textOf / demoOf /
     tagsOf / composeTags。bundle 模式没有真的 studio.js，
     用的是 forge.js 里的同名替身 ——
     替身少一个方法，适配层就取不到料，--model 静默退回通用正文。

     而「静默退回」正是最难查的一种：命令正常退出、
     JSON 字段照样有值、只是那个值等于没优化的通用正文。
     所以这里逐个方法断存在性。 */
  const src = fs.readFileSync(FORGE, "utf8");
  const stub = src.slice(src.indexOf("function bundleStudio()"),
                         src.indexOf("globalThis.STUDIO = bundleStudio()"));
  /* 这 11 条只读源码，不跑子进程 ——
   所以它们不属于「CLI 断言」，不能被 spawnOK 一起跳掉。
   早前整段裹在 if (spawnOK) 里，结果本机一条都验不到。 */
  oks(new RegExp("\\bentryOf\\s*:|function entryOf\\b").test(stub),
    "替身 STUDIO 提供 entryOf()");
  ["styleCraft", "textOf", "demoOf", "tagsOf", "composeTags",
   "negatives", "diagnose"].forEach(m =>
    oks(new RegExp("\\b" + m + "\\s*:|function " + m + "\\b").test(stub),
      "替身 STUDIO 提供 " + m + "()"));
  oks(/MODEL_PROMPTS\s*=\s*loadModelPrompts\(\)/.test(src),
    "forge.js 加载了按模型改写的那一层");
  oks(/model-prompts-core\.js/.test(src),
    "bundle 模式从包内副本取那一层（独立安装也能用）");

  const RENDER_KEYS = ["gpt-image-2", "nano-banana", "mj", "flux", "sana"];
  oks(JSON.stringify(require(path.join(ROOT, "assets", "render.js"))
        .RENDER.MODELS.map(m => m.key)) === JSON.stringify(RENDER_KEYS),
    "断言里的模型清单与 render.js 一致（清单变了这里会红）");

  /* 真正需要子进程的对拍在这里，与上面的源码断言分开。 */
  if (spawnOK) {
    /* group 8 的临时副本在它自己的对拍结束后就删了（上方 rmSync），
       这里**不能**复用那个 bundleForge——spawn 一个已删除的路径
       会拿到空输出，五个模型全部报「有一侧没给出优化词」，
       真正的词面分歧反而被盖住（实测踩过：MJ 少了每层 6 词上限，
       两种模式从第 7 个词起全串错位，这条断言却只报「没给出优化词」）。
       本组自建副本、自管清理。 */
    const tmpM = fs.mkdtempSync(path.join(require("os").tmpdir(), "forge-model-"));
    const dstM = path.join(tmpM, "anime-prompt-forge");
    copyDir(SKILL, dstM);
    const bundleForgeM = path.join(dstM, "scripts", "forge.js");
    const diff = [];
    RENDER_KEYS.forEach(k => {
      const args = ["build", "--style", "ST-001", "--theme", "TH-020",
                    "--layout", "LT-001", "--palette", "PL-001",
                    "--model", k, "--json"];
      const A = run(args);
      let B;
      try {
        B = execFileSync(process.execPath, [bundleForgeM].concat(args),
                         { encoding: "utf8", maxBuffer: 1 << 26 });
      } catch (e) { B = (e.stdout || "") + (e.stderr || ""); }
      let ja, jb, whyA = "", whyB = "";
      try { ja = JSON.parse(A.out); } catch (e) { whyA = "JSON 解析失败：" + String(e.message).slice(0, 80) + "；原文前 120 字符 " + JSON.stringify(A.out.slice(0, 120)); }
      try { jb = JSON.parse(B); } catch (e) { whyB = "JSON 解析失败：" + String(e.message).slice(0, 80) + "；原文前 120 字符 " + JSON.stringify(B.slice(0, 120)); }
      if (!ja || !jb || !ja.modelPrompt || !jb.modelPrompt) {
        diff.push(k + " （有一侧没给出优化词）\n"
          + "       repo   code=" + A.code + " " + (ja ? (ja.modelPrompt ? "有 modelPrompt" : "缺 modelPrompt，keys=" + Object.keys(ja).join(",")) : whyA) + "\n"
          + "       bundle code=" + (B.code || 0) + " " + (jb ? (jb.modelPrompt ? "有 modelPrompt" : "缺 modelPrompt，keys=" + Object.keys(jb).join(",")) : whyB));
        return;
      }
      if (ja.modelPrompt !== jb.modelPrompt) {
        diff.push(k + " → modelPrompt 不一致\n"
          + "       repo   " + JSON.stringify(ja.modelPrompt.slice(0, 90))
          + "\n       bundle " + JSON.stringify(jb.modelPrompt.slice(0, 90)));
      }
      if ((ja.modelParams || "") !== (jb.modelParams || "")) {
        diff.push(k + " → modelParams 不一致（"
          + ja.modelParams + " vs " + jb.modelParams + "）");
      }
      /* MJ 那一项必须是标签 + 参数，不能是一整段正文 */
      if (k === "mj") {
        okc(/--ar/.test(ja.modelParams) && !/--ar/.test(ja.modelPrompt),
          "MJ 的优化版：参数在 modelParams、标签里没有 --ar");
        okc(!/[\u4e00-\u9fa5]/.test(ja.modelPrompt),
          "MJ 的标签是英文（汉字标签对它是无效输入）");
      } else {
        okc(!(ja.modelParams || ""), k + " 不需要参数串");
        okc(!/--ar|--niji/.test(ja.modelPrompt),
          k + " 的正文里没有 MJ 参数串");
      }
      /* 通用正文必须仍然在，且与优化版不同 —— 否则「基准」这个词是空的 */
      okc(!!ja.en && ja.en !== ja.modelPrompt,
        k + " 的通用正文与优化版都在且不同");
    });
    okc(diff.length === 0,
      "五个模型的优化词在两种模式下逐字一致"
      + (diff.length ? "\n     " + diff.join("\n     ") : ""));
    fs.rmSync(tmpM, { recursive: true, force: true });
  }
}

console.log("\n" + (fail ? "✗ " : "✓ ") + "技能包体检：" + pass + " 通过 / " + fail + " 失败"
  + (skipped ? " / " + skipped + " 跳过" : ""));
if (skipped) {
  console.log("  ⚠ 跳过的都是 CLI 断言：当前环境不允许创建子进程（" + spawnWhy + "）。"
    + "这些断言在本地与正常 CI 上会照常运行，别把它当成「已经验过了」。");
}
process.exit(fail ? 1 : 0);