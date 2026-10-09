/* ============================================================
 * tools/_loadlist.js —— 测试脚本清单的唯一真源
 * ============================================================
 * 为什么必须有这个文件：
 *   原来每个测试脚本各自抄一份 assets 加载顺序
 *   （check_codes / smoke / check_rights / tier_audit 四份）。
 *   结果已经漂移过一次：tier_audit 少抄了 data-misc.js，
 *   一直没人发现，因为两份清单都不会报错——
 *   少加载一个文件只是让部分断言拿到空数组，
 *   那些断言「恰好没有覆盖到」就静默通过了。
 *
 * 这类故障的特点是：**清单错了不报错，测试照样绿。**
 * 所以清单只允许有一份，各测试从这里取。
 *
 * 清单本体从 index.html 的 <script src> 顺序派生，
 * 不再手抄第二遍——index.html 才是页面真正的加载顺序。
 * 派生方式：正则抓 assets/xxx.js，按出现顺序去重。
 * index.html 里 registry.js 在末尾单独加载（它必须最后执行），
 * 这里只取 assets/data-*.js、assets/lib-*.js 等数据与库层，
 * 工具层由各测试自己追加（顺序敏感，不能混）。
 * ============================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const A = f => path.join(ROOT, "assets", f);

/* 需要在 vm / 沙箱里跑的纯数据与库文件（无 DOM 依赖）。
   顺序必须与 index.html 一致：data-* 先于 lib-*，
   prompt-kit 夹在中间（它自己会 push PROMPT_SETS）。 */
const SANDBOX_FILES = [
  "data-core.js", "data-core-more.js", "data-styles-en.js",
  "data-studio-alias.js", "prompt-kit.js",
  "data-genres.js",
  "data-works-jp.js", "data-works-global.js",
  "data-works-more-a.js", "data-works-eur-w.js",
  "data-works-eur-e.js", "data-works-namer.js",
  "data-misc.js",
  "data-layout.js", "data-palette.js",
  "schema.js",
  "lib-form.js", "lib-visual.js", "lib-visual2.js",
  "lib-creature.js", "lib-creature2.js", "lib-creature3.js",
  "lib-world.js", "lib-world2.js", "lib-story.js",
  "lib-lens.js", "lib-voice.js", "lib-prod.js",
  "lib-morph.js", "lib-retrieve.js"
];

/* 提示词正文文件（PROMPTS_*）。与沙箱文件分开列：
   有测试需要它们（查正文），有的不需要，粒度不同。 */
const PROMPT_FILES = [
  "data-prompts-st1.js", "data-prompts-st2.js", "data-prompts-st3.js",
  "data-prompts-gn1.js", "data-prompts-gn2.js",
  "data-prompts-jp1.js", "data-prompts-jp2.js",
  "data-prompts-jp3.js", "data-prompts-jp4.js",
  "data-prompts-cn1.js", "data-prompts-ww1.js", "data-prompts-gk1.js",
  "data-prompts-if1.js", "data-prompts-fr1.js", "data-prompts-ln1.js"
];

/* 中文正文文件。与英文正文分开成组，理由见 makeContext 里的说明：
   两版是独立交付物（一版喂 GPT-Image，一版给国内用户改字），
   混在一组会让「中文版缺失」被英文版的正常状态掩盖。 */
const PROMPT_ZH_FILES = [
  "data-prompts-zh-st1.js", "data-prompts-zh-st2.js", "data-prompts-zh-st3.js",
  "data-prompts-zh-gn1.js", "data-prompts-zh-gn2.js"
];

/* 引擎与工具层。放在库层之后。
   studio.js 排最后：它依赖 engine / prompt-kit / rights / prompts-zh / prompts，
   任何一项没就位它都会退化成空候选或标签串而不报错。

   prompts.js 必须在 prompts-zh.js 之后 ——
   prompts.js 的规范码反查复用 PROMPT_ZH.segOf()，
   PROMPT_ZH 不在时它自己兜底建映射，但兜底路径没经过同样多的实测。 */
const ENGINE_FILES = [
  "codes.js", "code-map.js", "rights.js",
  "resolver.js", "engine.js", "examples.js",
  "prompts-zh.js", "prompts.js", "studio.js",
  /* render-net 依赖 render，gacha 依赖 studio，model-prompts 依赖 studio —— 顺序不能颠倒。
     三个都是「能被单独 require 出来做确定性断言」的模块，
     界面层（studio-ui / gacha-ui）不进这份清单：它们要 DOM。 */
  "render.js", "render-net.js", "gacha.js", "model-prompts.js", "registry.js"
];

/* 顶层变量名 → 数据数组。vm 里 const 不挂 ctx 属性，
   所以要把它们显式收进一个对象再取。
   新增数据文件必须在这里登记，否则该文件在测试里等于没加载。

   ⚠ STYLES 与 STYLES_MORE 不得 concat 后当「全部条目」用：
   浏览器下 data-core-more.js 会在载入时把 STYLES_MORE 去重合并进 STYLES
   （59 条画风已含 A5），Node require 下两数组保持独立（45 + 14）。
   两种环境各自正确，但 vm 加载全部文件后再逐数组 concat 会把 A5 的
   14 条算两遍（412 ≠ 398）。真实消费者各按各的口径取数——
   build_md 手工 concat，浏览器走合并后的 STYLES，别发明第三种。 */
const DATA_NAMES = [
  "STYLES", "STYLES_MORE", "GENRES",
  "WORKS_JP", "WORKS_GLOBAL", "WORKS_MORE_A",
  "WORKS_EUR_W", "WORKS_EUR_E", "WORKS_NAMER",
  "TEMPLATES", "NEGATIVES", "SYNTAX",
  "LAYOUTS", "PALETTES"
];

/* 提示词正文变量名 */
/* 中文正文变量名。与英文分开，是为了能单独校验中文版。 */
const PROMPT_ZH_NAMES = [
  "PROMPTS_ZH_ST1", "PROMPTS_ZH_ST2", "PROMPTS_ZH_ST3",
  "PROMPTS_ZH_GN1", "PROMPTS_ZH_GN2"
];

const PROMPT_NAMES = [
  "PROMPTS_ST1", "PROMPTS_ST2", "PROMPTS_ST3",
  "PROMPTS_GN1", "PROMPTS_GN2",
  "PROMPTS_JP1", "PROMPTS_JP2", "PROMPTS_JP3", "PROMPTS_JP4",
  "PROMPTS_CN1", "PROMPTS_WW1", "PROMPTS_GK1",
  "PROMPTS_IF1", "PROMPTS_FR1", "PROMPTS_LN1"
];

/* 建一个隔离上下文并按顺序载入。
   opts.data       是否载入数据层（默认 true）
   opts.prompts    是否载入正文（默认 false）
   opts.engine     是否载入引擎与工具层（默认 false）
   返回 { ctx, run }，run 是取全局变量的辅助函数。 */
function makeContext(opts) {
  opts = opts || {};
  const vm = require("vm");
  const ctx = { console: { log() {}, warn() {}, error() {} } };
  vm.createContext(ctx);

  const run = f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f });

  if (opts.data !== false) SANDBOX_FILES.forEach(run);
  /* 正文分两组，分别控制。
     prompts    只加载英文正文（PROMPT_FILES）
     promptsZh  只加载中文正文（PROMPT_ZH_FILES）
     两组要分开而不是合在一起：中文正文是为「中文出图」单独准备的，
     验英文版时不必把它也读进来，两边的断言才不会互相掩盖。 */
  if (opts.prompts) PROMPT_FILES.forEach(run);
  if (opts.promptsZh) PROMPT_ZH_FILES.forEach(run);
  if (opts.engine) ENGINE_FILES.forEach(run);

  /* 把顶层 const 收进 __v。逐个用 try 包住：
     不存在的变量直接 eval 会抛 ReferenceError，
     而「某个文件没加载」正是我们要能继续跑完的情况。 */
  const build = names =>
    "(function(){var __v={};" +
    names.map(n => "try{__v['" + n + "']=eval('" + n + "');}catch(e){}").join("") +
    "return __v;})()";

  ctx.__d = ctx.__d || {};
  ctx.__v = vm.runInContext(build(DATA_NAMES), ctx);
  if (opts.prompts) {
    const p = vm.runInContext(build(PROMPT_NAMES), ctx);
    Object.keys(p).forEach(k => { ctx.__v[k] = p[k]; });
  }
  if (opts.promptsZh) {
    const p = vm.runInContext(build(PROMPT_ZH_NAMES), ctx);
    Object.keys(p).forEach(k => { ctx.__v[k] = p[k]; });
  }
  return { ctx: ctx, run: run };
}

/* 与 index.html 的一致性检查。
   页面漏加载某个数据文件时，页面能开（那个变量只是 undefined），
   但工作流里那一层会静默变空——所以这个检查必须常驻。
   比对的是「清单里有的，页面是否也加载了」+「页面加载的清单里有没有的」，
   正文文件（PROMPT_FILES）算在已知集合内，不算多加载。

   引擎层文件（ENGINE_FILES）也要查：studio.js 少加载会退化成空候选，
   prompts-zh.js 少加载会让中文正文整块查不到，两者都不报错。 */
function checkAgainstIndex() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const known = SANDBOX_FILES.concat(PROMPT_FILES, PROMPT_ZH_FILES, ENGINE_FILES);
  const missing = SANDBOX_FILES
    .concat(PROMPT_ZH_FILES, ENGINE_FILES)
    .filter(f => !html.includes("assets/" + f));
  const extra = [];
  const re = /assets\/(data-[a-z0-9\-]+\.js|lib-[a-z0-9]+\.js)/g;
  let m;
  while ((m = re.exec(html))) {
    if (known.indexOf(m[1]) < 0) extra.push(m[1]);
  }
  return { missing: missing, extra: extra };
}

module.exports = {
  ROOT: ROOT, A: A,
  SANDBOX_FILES: SANDBOX_FILES,
  PROMPT_FILES: PROMPT_FILES,
  PROMPT_ZH_FILES: PROMPT_ZH_FILES,
  ENGINE_FILES: ENGINE_FILES,
  DATA_NAMES: DATA_NAMES,
  PROMPT_NAMES: PROMPT_NAMES,
  PROMPT_ZH_NAMES: PROMPT_ZH_NAMES,
  makeContext: makeContext,
  checkAgainstIndex: checkAgainstIndex
};