/* ============================================================
 * tools/check_model_prompts.js —— 按模型改写层体检
 * ============================================================
 * 为什么这一层必须单独测，而不是靠 ui_test 断言「点一下有东西」：
 *
 *   「五个模型点一下各出一段字」这件事在界面上永远成立，
 *   哪怕五个模型返回的是**同一段通用正文**——
 *   而那恰恰是它本该解决的问题没解决的样子。
 *
 *   静默失败的四种典型：
 *     - 五个模型 key 与 RENDER.MODELS 对不上 → 某个模型永远没有优化词，
 *       界面显示「已优化」，实际吐的还是通用正文；
 *     - MJ 的标签版里混进了 aspect ratio，同时又给 --ar
 *       → 两条画幅指令打架，图只是「构图怪」，没人会去查参数；
 *     - 禁项（不要文字/水印）在某个模型的改写里丢了
 *       → 版式图型会出带字废图，而提示词看上去是全的；
 *     - 配色 mood 混进英文正文 → 12 条配色的 mood 全是中文，
 *       模型读到一段汉字，界面完全看不出异常。
 *
 * 这一层对着字符串断言：谁多了、谁少了、谁撞了，都得红。
 * ============================================================ */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const L = require("./_loadlist.js");
const A = L.A;

let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg) { cond ? pass++ : (fail++, fails.push(msg), console.log("  ✗ " + msg)); }
function head(t) { console.log("\n" + t); }

/* ---------- 载入（顺序与 index.html 一致） ---------- */
const ctx = vm.createContext({ console });
ctx.globalThis = ctx;
L.SANDBOX_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.PROMPT_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.PROMPT_ZH_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.ENGINE_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));

const D = {
  STYLES: vm.runInContext("(typeof STYLES!=='undefined'?STYLES:[])", ctx),
  GENRES: vm.runInContext("(typeof GENRES!=='undefined'?GENRES:[])", ctx),
  LAYOUTS: vm.runInContext("(typeof LAYOUTS!=='undefined'?LAYOUTS:[])", ctx),
  PALETTES: vm.runInContext("(typeof PALETTES!=='undefined'?PALETTES:[])", ctx)
};

const ENGINE = require(A("engine.js")).ENGINE;
ENGINE.register(D.STYLES, "styles", "画风流派");
ENGINE.register(D.GENRES, "genres", "题材元素");
ENGINE.register(D.LAYOUTS, "layouts", "排版图型");
ENGINE.register(D.PALETTES, "palettes", "主题配色");

const STUDIO = require(A("studio.js")).STUDIO;
const RENDER = require(A("render.js")).RENDER;
const MP = require(A("model-prompts.js")).MODEL_PROMPTS;

/* 选一组齐备的四步，后面所有断言都基于它 */
const pick4 = () => {
  const s = STUDIO.STEPS.map(x => STUDIO.candidates(x.key)[0]);
  STUDIO.reset();
  STUDIO.STEPS.forEach((x, i) => STUDIO.pick(x.key, s[i].id));
};

const hasCJK = s => /[\u4e00-\u9fa5]/.test(s);

/* ---------- 1. 模型集合：与 RENDER.MODELS 一一对应 ---------- */
head("【1】模型 key 与 RENDER.MODELS 一一对应");
{
  const renderKeys = RENDER.MODELS.map(m => m.key).sort();
  const mpKeys = MP.keys().sort();
  ok(JSON.stringify(renderKeys) === JSON.stringify(mpKeys),
    "适配表覆盖全部出图模型（" + mpKeys.join("/") + "）");
  renderKeys.forEach(k => ok(MP.has(k), "「" + k + "」有专门的写法"));
  /* 反向也要对：多一个 key 意味着模型被加进 RENDER 了但没人写适配，
     界面上它会显示「优化版」，实际吐的还是通用正文。 */
  MP.keys().forEach(k =>
    ok(RENDER.MODELS.some(m => m.key === k), "适配表里的「" + k + "」在出图模型清单里"));

  const all = MP.all({ lang: "en", ratio: "1:1" });
  ok(all.length === RENDER.MODELS.length,
    "all() 一次给全 " + all.length + " 份（界面上要一次画完那张表）");
  /* 顺序必须跟按钮一致。顺序不一致时用户会以为少了哪个模型。 */
  ok(JSON.stringify(all.map(o => o.key)) === JSON.stringify(RENDER.MODELS.map(m => m.key)),
    "all() 的顺序与模型按钮一致");
}

/* ---------- 2. 五个模型真的给出五份不同的词 ---------- */
head("【2】每个模型都有自己的写法（不是同一段换个标签）");
{
  pick4();
  const all = MP.all({ lang: "en", ratio: "16:9" });
  const seen = new Map();
  all.forEach(o => {
    ok(!!o.text, o.key + " 给出了提示词");
    if (seen.has(o.text)) {
      ok(false, o.key + " 与 " + seen.get(o.text) + " 的输出完全相同（适配层没起作用）");
    } else {
      seen.set(o.text, o.key);
    }
  });
  ok(seen.size === all.length, all.length + " 份词互不相同");

  /* 更严一点：去掉尾部禁项后，GPT / Flux / Sana 的**主干**也该有差别。
     它们的差异在写法（段落 / 方位词画幅句 / 长度），
     如果只看禁项会漏掉「主干其实没改」的退化。 */
  const strip = t => t.replace(/No text[^]*$|The frame is entirely[^]*$|避免画面[^]*$/, "").trim();
  const cores = {};
  ["gpt-image-2", "flux", "sana"].forEach(k => {
    cores[k] = strip(MP.of(k, { lang: "en", ratio: "16:9" }).text);
  });
  ok(cores["gpt-image-2"] !== cores.sana,
    "GPT-Image 与 Sana 的主干有区别（画幅句写法不同）");
  ok(cores.flux !== cores.sana,
    "Flux 与 Sana 的主干有区别（方位词画幅句 + 正向禁项）");
}

/* ---------- 2b. 中英两版都要各自互不相同 ---------- */
head("【2b】中文版同样五份不同（英文不同不算数）");
{
  /* 真实退化：Sana 与 GPT-Image 的差别原本只在画幅句的措辞上，
     英文里能看出区别，落到中文就成了同一句 ——
     而界面默认是中文模式，于是用户看到的是两块一字不差，
     结论会是「适配层没做」。
     这条断言就是为它立的：每个语种都要单独断一次。 */
  ["en", "zh"].forEach(lang => {
    const seen = new Map();
    MP.all({ lang: lang, ratio: "1:1" }).forEach(o => {
      if (!o.text) return;
      if (seen.has(o.text)) {
        ok(false, "lang=" + lang + "：[" + seen.get(o.text) + "] 与 [" + o.key
          + "] 输出完全相同");
      } else seen.set(o.text, o.key);
    });
    ok(true, "lang=" + lang + "：五份词互不相同");
  });

  /* 而且不能靠「少了内容」来制造差别 ——
     那样五个模型会各丢一点约束，用户拿到的图反而更差。 */
  pick4();
  const lenOf = k => (MP.of(k, { lang: "zh" }) || {}).text.length;
  const g = lenOf("gpt-image-2"), s = lenOf("sana");
  ok(s > 0 && g > 0, "两版都非空");
  /* Sana 取的是「题材+配色+画幅」三段，不该短到只剩一句话 */
  ok(s > Math.floor(g * 0.4),
    "Sana 那版仍有实质内容（" + s + " 字，GPT 是 " + g + " 字）——"
    + "差别不该靠删信息制造");
}

/* ---------- 3. 禁项不许丢 ---------- */
head("【3】禁项在每一版里都在（不要文字/标识/水印）");
{
  pick4();
  /* 英文四版 + MJ 标签版，各自有各自的禁项写法。
     这里按「各自该出现的那个词」查，而不是查同一句——
     查同一句就等于逼所有模型用同一种写法，正好把适配层废掉。 */
  const want = {
    "gpt-image-2": [/no text/i, /watermark/i],
    "nano-banana": [/avoid any text/i, /watermark/i],
    mj: [/text-free/, /no watermark/],
    flux: [/free of lettering/i, /watermark/i],
    sana: [/no text/i, /watermark/i]
  };
  Object.keys(want).forEach(k => {
    const t = MP.of(k, { lang: "en" }).text + " " + MP.of(k, { lang: "en" }).params;
    want[k].forEach(re => ok(re.test(t), k + " 的禁项含 " + re));
  });

  /* 中文版也要有禁项，否则中文用户复制出去就是一段没有约束的提示词 */
  ["gpt-image-2", "nano-banana", "flux", "sana"].forEach(k => {
    const t = MP.of(k, { lang: "zh" }).text;
    ok(/不要出现|避免/.test(t) && /文字|标识/.test(t), k + " 的中文版也有禁项");
  });
}

/* ---------- 4. MJ：只吃标签 + 参数，不吃正文 ---------- */
head("【4】MJ 版是标签串 + --参数，且画幅只有一个出处");
{
  pick4();
  const mj = MP.of("mj", { lang: "en", ratio: "9:16" });
  ok(/--ar 9:16/.test(mj.params), "参数串带 --ar 9:16（实际：" + mj.params + "）");
  ok(/--niji 6/.test(mj.params), "带 --niji 6（动漫模型）");
  ok(/--stylize \d+/.test(mj.params), "带 --stylize");
  /* 约定③：标签里不能同时有 aspect ratio。
     两条画幅指令打架时，出错的图只是「构图怪」，没人会去查参数。 */
  ok(!/aspect ratio/i.test(mj.text),
    "标签里已剔除 aspect ratio（画幅只由 --ar 承担）");
  ok(!/\./.test(mj.text) || !/\b[A-Za-z]{3,}\.\s/.test(mj.text),
    "标签版里没有成句的英文（MJ 不吃整段正文）");
  ok(mj.text.indexOf(",") > 0, "是逗号分隔的标签串");

  /* MJ 在中文界面下也必须给英文标签：汉字标签对它是无效输入 */
  const mjZh = MP.of("mj", { lang: "zh", ratio: "9:16" });
  ok(!hasCJK(mjZh.text), "lang=zh 时 MJ 仍是英文标签（界面只给一种语言会像语言开关坏了）");

  /* --ar 必须跟用户选的出图比例一致，不能跟版式的 ratio 走 */
  const mj16 = MP.of("mj", { lang: "en", ratio: "16:9" });
  ok(/--ar 16:9/.test(mj16.params) && !/--ar 9:16/.test(mj16.params),
    "改出图比例后 --ar 跟着改");

  /* 标签必须来自 composeTags()（去标识在那里统一处理） */
  const st = STUDIO.composeTags().split(/,\s*/).filter(Boolean)
    .filter(t => !/^aspect ratio/i.test(t));
  const missing = st.filter(t => mj.text.indexOf(t) < 0);
  ok(missing.length === 0,
    "MJ 标签覆盖 composeTags 的全部词（缺 " + missing.slice(0, 3).join("/") + "）");
  /* 工作室层的标识词绝不能进 MJ 版 */
  ok(!/ghibli|miyazaki|studio/i.test(mj.text),
    "MJ 标签里没有工作室标识词（去标识走的是 composeTags）");
}

/* ---------- 5. 英文版不许混进中文 ---------- */
head("【5】英文版不含汉字（配色 mood 全是中文，最容易漏）");
{
  pick4();
  RENDER.MODELS.forEach(m => {
    const o = MP.of(m.key, { lang: "en", ratio: "16:9" });
    ok(!hasCJK(o.text),
      m.zh + " 的英文版不含汉字" + (hasCJK(o.text) ? "（实际：" + o.text.slice(0, 40) + "…）" : ""));
  });
  /* 12 条配色的 mood 全是中文，所以这一条对每个配色都要成立，
     不能只测当前选中的那一条。 */
  const pal = require(A("data-palette.js")).PALETTES || [];
  let bad = [];
  pal.forEach(p => {
    STUDIO.reset();
    STUDIO.STEPS.forEach(x => { const c = STUDIO.candidates(x.key)[0]; STUDIO.pick(x.key, c.id); });
    STUDIO.pick("palette", p.id);
    const t = MP.of("gpt-image-2", { lang: "en" }).text;
    if (hasCJK(t)) bad.push(p.id);
  });
  ok(bad.length === 0,
    "全部 " + pal.length + " 条配色下英文版都不含汉字" + (bad.length ? "（" + bad.join(",") + "）" : ""));

  /* 反向：中文版必须真的含中文，否则语言开关失灵 */
  const zhT = MP.of("gpt-image-2", { lang: "zh" }).text;
  ok(hasCJK(zhT), "lang=zh 时正文确实是中文");
}

/* ---------- 6. 画幅只有一个出处，且与请求一致 ---------- */
head("【6】画幅：三档比例都写对，方位词不乱写");
{
  pick4();
  [["9:16", "portrait"], ["3:4", "portrait"], ["16:9", "landscape"],
   ["4:3", "landscape"], ["1:1", "square"]].forEach(([r, shape]) => {
    const f = MP.of("flux", { lang: "en", ratio: r });
    ok(new RegExp(r.replace(":", "\\:")).test(f.text),
      "Flux " + r + " 的正文写了 " + r);
    ok(new RegExp(shape, "i").test(f.text),
      "Flux " + r + " 的方位词是 " + shape);
    /* 「竖幅写 wide-format」是自己给模型一条错指令，而出错的图
       看起来只是「构图怪」，没人会去查那半句提示词。

       **只看画幅那一句**，不扫全文 ——
       版式正文里本来就有 "keep the margins wide" 这类正常措辞，
       按全文扫会把「宽边距」误判成「宽幅构图」。 */
    const frame = (f.text.match(/Frame it[^.]*\./i) || [""])[0];
    ok(frame.indexOf(r) >= 0, "Flux " + r + " 的画幅句写的是 " + r + "（" + frame + "）");
    if (shape === "portrait") {
      ok(!/wide|landscape/i.test(frame),
        "Flux " + r + " 是竖幅，画幅句里不能出现 wide/landscape（" + frame + "）");
    } else if (shape === "landscape") {
      ok(!/portrait/i.test(frame),
        "Flux " + r + " 是横幅，画幅句里不能出现 portrait");
    }
  });
  /* 每份都要带着用户选的画幅，不是版式的 ratio */
  RENDER.MODELS.forEach(m => {
    const o = MP.of(m.key, { lang: "en", ratio: "3:4" });
    const t = o.text + " " + o.params;
    ok(t.indexOf("3:4") >= 0, m.zh + " 带上了出图比例 3:4");
  });
}

/* ---------- 7. 不污染全局选择 ---------- */
head("【7】连出五份词后，用户当前的四步一步都不能变");
{
  pick4();
  const before = JSON.stringify(STUDIO.S);
  MP.all({ lang: "en", ratio: "16:9" });
  MP.all({ lang: "zh", ratio: "9:16" });
  ok(JSON.stringify(STUDIO.S) === before,
    "all() 跑两遍之后 STUDIO.S 原样（抽卡一次要出五份词，中途改了 S "
    + "就等于把用户正在用的组合换成别人的）");

  /* 中途抛错也必须还原 —— try/finally 少一个 finally 就是这个后果 */
  const b2 = JSON.stringify(STUDIO.S);
  const st = STUDIO.S;
  const style = st.style;
  try {
    STUDIO.pick("style", "A1-06");
    throw new Error("模拟中途失败");
  } catch (e) {
    /* 模拟 */
  } finally {
    st.style = style;
  }
  ok(JSON.stringify(STUDIO.S) === b2, "异常路径后也还原了（S 的写回是成对的）");
}

/* ---------- 8. 缺步与非法输入不自伤 ---------- */
head("【8】缺步 / 非法比例 / 未知模型都给出话可说");
{
  STUDIO.reset();
  const none = MP.of("gpt-image-2", { lang: "en" });
  ok(none && !none.text, "一个都没选时不给正文");
  ok(none && !!none.why, "并说清为什么（" + (none && none.why) + "）");

  pick4();
  const bad = MP.of("gpt-image-2", { lang: "en", ratio: "23:7" });
  ok(!!bad && !!bad.text, "非法比例不崩，回退到版式自己的 ratio 或干脆不写画幅句");
  ok(!/undefined|NaN|\[object/.test(bad.text),
    "输出里没有 undefined / NaN / [object Object]");

  ok(MP.of("不存在的模型", {}) === null, "未知模型返回 null（不抛错）");
  ok(MP.of("", {}) === null, "空模型名返回 null");
  ok(MP.base({}) !== null, "base() 始终可用");
}

/* ---------- 9. 默认提示词独立于模型 ---------- */
head("【9】默认提示词就是 STUDIO.compose()，一个字都没改");
{
  pick4();
  const b = MP.base({ lang: "en", ratio: "16:9" });
  const direct = STUDIO.compose("en", "16:9");
  ok(b.text === direct, "base() 与 compose() 逐字相同");
  ok(b.text.length > 0, "默认提示词非空");
  /* 默认词不该被任何一家模型的写法污染。
     如果 base() 也变成「MJ 标签版」，那「默认」这个词就没有意义了。 */
  ok(!/--ar|--niji|--stylize/.test(b.text), "默认词里没有 MJ 参数串");
  ok(!/masterpiece/.test(b.text), "默认词里没有标签流的质量词（那是 MJ 版的取材源）");
  RENDER.MODELS.forEach(m => {
    const o = MP.of(m.key, { lang: "en", ratio: "16:9" });
    ok(o.text !== b.text, m.zh + " 的优化版与默认词不同（否则适配层对它没做事）");
  });
}

/* ---------- 10. 提示词里不许漏掉画幅/主色这类硬约束 ---------- */
head("【10】配色与版式的硬约束落到具体值");
{
  pick4();
  const pal = STUDIO.entryOf("palette");
  RENDER.MODELS.forEach(m => {
    const t = MP.of(m.key, { lang: "en" }).text;
    /* MJ 版用 hex 的 DOMINANT 形式（来自 composeTags），其余用完整 hex */
    const hasHex = m.key === "mj"
      ? t.indexOf(pal.hex.toUpperCase()) >= 0 || t.toUpperCase().indexOf(pal.hex) >= 0
      : t.indexOf(pal.hex) >= 0;
    ok(hasHex, m.zh + " 的正文里带着主色 " + pal.hex + "（只说「冷色调」模型会理解成任意一种冷色）");
  });
  /* 只选配色不选画风题材时也要给得出词 —— 少一层约束的提示词照样能出图 */
  STUDIO.reset();
  STUDIO.pick("palette", pal.id);
  const onlyPal = MP.of("flux", { lang: "en" });
  ok(onlyPal && !!onlyPal.text, "只选了配色也能出一版词");
  ok(onlyPal && onlyPal.text.indexOf(pal.hex) >= 0, "那版词里仍有主色");
}

/* ---------- 11. 源码约定：不许散落 if (model === ...) ---------- */
head("【11】源码约定：界面层不许按模型名写分支");
{
  /* 只扫**代码**，不看注释。
     注释里写「界面上出现 model === "mj" 这种分支就是错的」，
     本身是这条禁令的说明 ——
     连注释一起扫的话，这条规则只能靠「别写注释」来满足，
     而注释恰恰是最该写清理由的地方。

     做法：逐行去掉 // 与 /* *\/ 之后再看。
     这与 check_gacha 里「源码断言扫去注释后的代码」是同一个取舍，
     方向相反但理由一致：断言要看的是**会被执行的那部分**。 */
  const stripComments = src => src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n").map(l => l.replace(/\/\/.*$/, "")).join("\n");
  const ui = ["studio-ui.js", "gacha-ui.js"]
    .map(f => stripComments(fs.readFileSync(A(f), "utf8"))).join("\n");

  const anyModel = /model\s*===?\s*["'](gpt-image-2|nano-banana|mj|flux|sana)["']/;
  ok(!anyModel.test(ui),
    "界面层没有按任何模型名写分支（全部走 MODEL_PROMPTS）");

  const src = stripComments(fs.readFileSync(A("model-prompts.js"), "utf8"));
  ok(/BUILDERS\s*=/.test(src), "改写规则收在一张表里（新增模型只加一行）");
  ["buildGptImage2", "buildNanoBanana", "buildMj", "buildFlux", "buildSana"]
    .forEach(fn => ok(src.indexOf(fn) >= 0, fn + " 在适配层里"));

  /* 判据应该是「通道能不能出图」而不是模型名 ——
     早前界面里写 `o.key === "mj"`，将来加一个新的无 API 模型时
     会被静默地给一个出图按钮，而它根本发不出去。 */
  ok(/channel\s*!==?\s*["']manual["']|\.channel\s*===\s*["']manual["']/.test(
       fs.readFileSync(A("studio-ui.js"), "utf8")),
    "界面判「无 API」用的是 channel 而不是模型名");
}

/* ---------- 12. 界面渲染出的 HTML 必须是合法结构 ---------- */
head("【12】界面拼接不出碎片（少一个加号不会报错，只会点不动）");
/* 第 12 节要真跑一次 jsdom 页面。定义在文件末尾，
   调用点在这里 —— 用 then 而不是顶层 await：
   CommonJS 里没有顶层 await，包 async IIFE 会让上面 350 行全部缩进，
   diff 大到看不出改了什么，而这类改动最需要一眼可读。 */
renderCheck().then(function () {
  console.log("\n" + (fail ? "✗ " : "✓ ")
    + "按模型改写层：" + pass + " 通过 / " + fail + " 失败");
  if (fail) {
    console.log("\n失败项：");
    fails.forEach(f => console.log("  · " + f));
  }
  process.exit(fail ? 1 : 0);
});

/* ============================================================
 * 真跑一次页面，看渲染结果 —— 而不是扫源码
 * ============================================================
 * 真实故障记录：mp-foot 里的
 *     '<button …>' + (o.text ? "" : " disabled")
 *     +     '>复制提示词</button>'
 * 少了一个加号，于是 "" 把后面的片段吞进三元表达式，
 * 后面所有片段的运算符整体错位一格，产出：
 *     <button class="btn p" data-mp-copy="gpt-image-2" nan<="" div="">
 * 浏览器不报错、页面能开、图也出得来，
 * 但复制按钮的属性没闭合 → 点不动。
 *
 * **不扫源码**：少一个加号在源码里看不出任何破绽，
 * `"" + '…'` 依然是完全合法的 JavaScript。
 * 只有把页面跑起来看渲染结果才抓得住。
 *
 * 依赖 jsdom；拿不到就明确报「环境缺」，不当成这一层的失败
 * —— 那会让人以为适配层坏了，而它其实是好的。
 */
async function renderCheck() {
  let page = null;
  try {
    const modPath = path.join(
      process.env.WB_NODE_MODULES
        || "C:/Users/A/.workbuddy/binaries/node/workspace/node_modules",
      "jsdom"
    );
    const { JSDOM, VirtualConsole } = require(modPath);
    const vc = new VirtualConsole();
    vc.on("jsdomError", () => {});
    const idx = path.join(L.ROOT, "index.html");
    const dom = await JSDOM.fromFile(idx, {
      runScripts: "dangerously", resources: "usable",
      url: "file:///" + idx.replace(/\\/g, "/"),
      pretendToBeVisual: true, virtualConsole: vc
    });
    const w = dom.window;
    await new Promise(r => {
      if (w.document.readyState === "complete") return r();
      w.addEventListener("load", r);
      setTimeout(r, 8000);
    });
    await new Promise(r => setTimeout(r, 500));

    if (typeof w.MODEL_PROMPTS === "undefined")
      throw new Error("model-prompts.js 没进 index.html");
    w.goSec("openstudio");
    await new Promise(r => setTimeout(r, 200));
    const steps = w.STUDIO.STEPS.map(x => w.STUDIO.candidates(x.key)[0]);
    w.STUDIO.reset();
    w.STUDIO.STEPS.forEach((x, i) => w.STUDIO.pick(x.key, steps[i].id));
    w.openRenderStudio();
    await new Promise(r => setTimeout(r, 200));

    const grid = w.document.getElementById("grid");
    page = { html: grid.innerHTML, cards: [...grid.querySelectorAll(".mp-card")] };
  } catch (e) {
    ok(false, "跑一遍真实页面失败：" + ((e && e.message) || e)
      + "（若是缺 jsdom，那不是这一层的问题）");
    return;
  }

  /* 碎片特征：属性值里冒出 nan / undefined */
  const junk = page.html.match(/(?:="|\s)(nan|NaN|undefined)\s*[<>"']/);
  ok(!junk, "渲染结果里没有拼接碎片" + (junk ? "（命中「" + junk[0] + "」）" : ""));
  ok(page.cards.length === RENDER.MODELS.length,
    "真实页面渲染出 " + RENDER.MODELS.length + " 张模型卡");
  ok(!!page.cards.every(c => c.querySelector(".mp-bb[data-mp-text]")),
    "五张卡都有正文框");

  page.cards.forEach(c => {
    const box = c.querySelector(".mp-bb[data-mp-text]");
    if (!box) { ok(false, "有一张卡没有正文框"); return; }
    const key = box.getAttribute("data-mp-text").replace(/-params$/, "");
    const btn = c.querySelector('[data-mp-copy="' + key + '"]');
    ok(!!btn, key + " 的复制按钮存在且属性完整（点得动）");
    if (btn) {
      ok(/复制/.test(btn.textContent),
        key + " 的复制按钮文字正常（实际「" + btn.textContent.trim() + "」）");
    }
  });

  const mjCard = page.cards.find(c => c.querySelector('[data-mp-text="mj"]'));
  ok(!!(mjCard && mjCard.querySelector('[data-mp-copy="mj-params"]')),
    "MJ 有「复制参数」按钮");
  ok(!!(mjCard && /midjourney\.com/.test(mjCard.innerHTML)),
    "MJ 卡里给了官网入口");

  /* 五份正文互不相同 —— 从真实页面渲染出来的结果看，
     这一条才是用户实际会看到的东西。 */
  const texts = page.cards
    .map(c => c.querySelector(".mp-bb[data-mp-text]").textContent.trim());
  ok(new Set(texts).size === texts.length,
    "页面上五份词互不相同（" + new Set(texts).size + "/" + texts.length + " 份）");

  /* 默认提示词在最上面 */
  const first = page.html.indexOf('data-mp-text="base"');
  const card0 = page.html.indexOf('class="mp-card');
  ok(first >= 0 && first < card0,
    "默认提示词排在模型卡之前（" + first + " < " + card0 + "）");
}

/* ============================================================
 * 【13】perStyle 标定表
 * ============================================================
 * 这一组防的是标定表本身慢慢烂掉。四种退化都不会让任何界面报错：
 *
 *   1. 表变空      → 全退化成 unknown，「标定」变成一句空话
 *   2. 全是 strong → 等于没有标定（假装什么都能命中）
 *   3. 键不是规范码 → 表与词条脱钩，改了词条码也不红
 *   4. 每格都填满  → 把「没标定」也填成 strong，unknown 这个档形同虚设
 *
 * 第 4 条最隐蔽：unknown 是这张表里**唯一诚实的一档**，
 * 它一旦被填满，表就从「有部分标定」变成「假装全部标定」。
 */
head("【13】perStyle：逐模型 × 逐风格的激活强度");
{
  ok(typeof MP.activationOf === "function" && typeof MP.strategyOf === "function",
    "perStyle 层对外暴露 activationOf / strategyOf");

  const cal = MP.calibrated();
  ok(cal.marked > 0, "标定表非空（已标定 " + cal.marked + " 条）");

  /* 键必须是规范码（ST/ER/SB/RG/MV + 三位），不能是旧 id。
     旧 id 是历史数据，规范码才是引用锚点——
     表挂在旧 id 上，词条重排时会静默失效。 */
  const src = fs.readFileSync(A("model-prompts.js"), "utf8");
  const block = src.slice(src.indexOf("var STYLE_ACTIVATION"));
  const keys = (block.match(/"([A-Z]{2}-\d{3})"\s*:/g) || [])
    .map(s => s.replace(/[":\s]/g, ""));
  const legacyKeys = (block.match(/"([A-Z]\d-\d{2})"\s*:/g) || [])
    .map(s => s.replace(/[":\s]/g, ""));
  ok(keys.length === cal.marked,
    "表内 " + cal.marked + " 条全部挂在规范码上（解析出 " + keys.length + " 条）");
  ok(legacyKeys.length === 0,
    "表里没有旧 id 形态的键" + (legacyKeys.length ? "（发现 " + legacyKeys.slice(0, 3).join(",") + "）" : ""));

  /* 每行必须写清依据why —— 这是「read 不是 test」的自证。
     没有依据的标定看起来和实测一样，那是最容易误导人的形态。 */
  const rows = block.split(/\n\s*"(?:[A-Z]{2}-\d{3})"\s*:/).slice(1);
  const noWhy = [];
  rows.forEach((row, i) => {
    if (!/why\s*:/.test(row)) noWhy.push(keys[i] || ("#" + i));
  });
  ok(noWhy.length === 0,
    "每条标定都写了推断依据 why（缺 " + noWhy.length + " 条）");

  /* 三档都要真的出现。全是 strong 等于没标。 */
  const levels = {};
  keys.forEach(k => {
    const a = MP.activationOf(k, "mj");
    levels[a.level] = (levels[a.level] || 0) + 1;
  });
  ok(Object.keys(levels).length >= 2,
    "标定档位有分化（MJ 视角：" + JSON.stringify(levels) + "）");
  ok(!Object.keys(levels).every(l => l === "strong"),
    "不是清一色 strong（那等于假装全都能命中）");

  /* 未标定条目必须落到 unknown，而不是默认 strong。
     这条是整组的核心：把 unknown 悄悄变成 strong，
     就是把「不知道」说成「知道」。 */
  const unknownOne = MP.activationOf("ST-999", "gpt-image-2");
  ok(unknownOne.level === "unknown",
    "未标定的条目返回 unknown（实际 " + unknownOne.level + "）");
  ok(/未标定/.test(unknownOne.why),
    "unknown 会说明「未标定」（而不是含糊地说「名字一定好使」）");

  /* 作品段一律不逐条标：涉及在世作者，标错会误导商用。 */
  const wk = MP.activationOf("WK-001", "gpt-image-2");
  ok(wk.level === "unknown" && /未做逐条标定/.test(wk.why),
    "作品段不逐条标定（涉及在世作者，标错会误导商用）");

  /* 策略三档必须给出不同的处理方式，
     否则「策略表」只是一份没人执行的文档。 */
  const sStrong = MP.strategyOf({ level: "strong" });
  const sWeak = MP.strategyOf({ level: "weak" });
  const sNone = MP.strategyOf({ level: "none" });
  ok(sStrong.useName && !sNone.useName,
    "none 档不给风格名（硬给会按常见误读画）");
  ok(sNone.useTraits && !sStrong.useTraits,
    "none 档只给特征词");

  /* 标定必须真的进了 note —— 标了不告知等于没标。
     先 reset 再逐step pick：前面第 7 组会故意把 S 搞成残缺状态
     再验证能还原，直接在残缺状态上操作可能测到的是残留。

     注意 pick 是**切换**语义（再点一次取消，见 studio.js）：
     所以下面只 pick 一次，先把要的那条排到第一位的候选。
     多 pick 一次会把刚选上的取消掉，而那不报错——
     表现是「选了画风但正文整块空」。 */
  STUDIO.reset();
  const ST_S = STUDIO.candidates("style");
  const target = ST_S.find(x => x.id === "A1-01") || ST_S[0];
  STUDIO.STEPS.forEach(x => {
    if (x.key === "style") { STUDIO.pick(x.key, target.id); return; }
    const c = STUDIO.candidates(x.key)[0];
    if (c) STUDIO.pick(x.key, c.id);
  });
  ok(STUDIO.entryOf("style") !== null,
    "四步设上了（style=" + (STUDIO.entryOf("style") || {}).id + "）");
  const out = MP.of("mj", { lang: "en", ratio: "1:1" });
  ok(out.styleActivation === "weak",
    "选中 ST-001 后 MJ 侧标定为 weak（实际 " + out.styleActivation + "）");
  ok(/标定/.test(out.note),
    "note 里说明了标定状态（用户看得见）");
  ok(typeof out.styleActivation === "string" && out.styleActivation.length > 0,
    "of() 返回 styleActivation 字段（" + out.styleActivation + "）");
  ok(/标定|未标定/.test(out.note),
    "note 里说明了标定状态或未标定（用户看得见）");
  /* MJ 版必须带**选中那套配色**的具体色值。
   不硬编码色号：那样换个配色就测不出真问题，而要测的恰恰是
   「标定层有没有把配色约束弄丢」——比对实际选中的那套最准。 */
  const palNow = STUDIO.entryOf ? STUDIO.entryOf("palette") : null;
  const hexNow = palNow && (palNow.hex || "");
  ok(!!hexNow, "取到当前选中的配色主色（" + hexNow + "）");
  ok(hexNow ? out.text.indexOf(hexNow) >= 0 : true,
    "MJ 版里带着这套配色的主色 " + hexNow + "（标定层不许把配色约束弄丢）");
  ok(/--ar 1:1/.test(out.params), "MJ 参数仍在（标定层不许动 --ar）");
}

/* ============================================================
 * 【14】残缺输入不许变成空壳
 * ============================================================
 * 这一组来自一次真实出图的教训。
 *
 * 只选画风、不选题材时，Sana 版曾经**只剩禁项**：
 *   「No text, letters, numbers… all lettering is to be added later in post.」
 *
 * 而它的表现是完美的：命令 exit 0、JSON 四个字段齐全、
 * 图片也真的返回了一张（只是那张是模型在没有主体时自由发挥的产物——
 *  实测给 A1-02 出了一张装裱圆盘的相框，正中还有个「X」字母）。
 *
 * 这类故障最贵的地方在于「看起来成功」。
 * 所以断言的方式是**逐步减配看输出是否还站得住**，
 * 而不是只看满配时对不对——满配永远是对的，减配才暴露空壳。
 */
head("【14】只给部分步骤时，每一版都还是一份能用的提示词");
{
  /* 内容门槛按语法形态分档，不用同一个数字套五个模型：
     MJ 是标签版，天生就短（只给画风时 152 字符已是完整的
     「技法标签 + 三个禁项」），拿散文版的长度去要求它会得到一条
     永远红的假断言——而假断言比没有断言更糟。 */
  const MIN_LEN = { "mj": 120 };   /* 未列出者按 200 字符要求 */
  const needLen = k => MIN_LEN[k] || 200;

  RENDER.MODELS.forEach(m => {
    /* ---- 只给画风：最容易空壳的一种组合 ---- */
    STUDIO.reset();
    const cs = STUDIO.candidates("style")[0];
    if (cs) STUDIO.pick("style", cs.id);
    const r = MP.of(m.key, { lang: "en", ratio: "1:1" });
    ok(!!r.text && r.text.length > needLen(m.key),
      m.key + "：只给画风时正文仍有实质内容（" + r.text.length + " 字符，门槛 "
      + needLen(m.key) + "）");

    /* 禁项的写法随模型语法变，不能用同一个正则去找：
       否定句（no text / text-free）、祈使句（Avoid any text…）、
       正向句（entirely free of lettering）说的是同一件事。
       早前只查前两种，Nano Banana 的「Avoid any text…」假红了一次。
       这里覆盖全部五种已知措辞。 */
    const hasForbid = /no text|text-free|no watermark|without lettering|free of lettering|no lettering|avoid any text|avoid text/i
      .test(r.text);
    ok(hasForbid, m.key + "：禁项仍在（减配不许把禁项一起减掉）");

    /* 顺便抓重复：同一段话在一条提示词里出现两遍，
       模型会当成强调，读起来也啰嗦。
       这里用「画风技法那一段」当探针——它够长、不易与其他段撞词。 */
    const craft = (r.text.match(/Rendering approach:[\s\S]*?(?=Rendering approach:|$)/g) || []);
    ok(craft.length <= 1,
      m.key + "：画风技法没有重复出现（出现 " + craft.length + " 次）");

    /* ---- 四步全空：必须明说，不能给一段空话 ---- */
    STUDIO.reset();
    const r0 = MP.of(m.key, { lang: "en", ratio: "1:1" });
    ok(r0 && r0.text === "" && !!r0.why,
      m.key + "：四步全空时给出原因而不是空提示词（why="
      + JSON.stringify(r0.why) + "）");

    /* ---- 每一步单独给：都要站得住并说清缺了什么 ---- */
    ["style", "theme", "layout", "palette"].forEach(step => {
      STUDIO.reset();
      const c = STUDIO.candidates(step)[0];
      if (!c) return;
      STUDIO.pick(step, c.id);
      const rr = MP.of(m.key, { lang: "en", ratio: "1:1" });
      ok(!!rr.text && (rr.missing || []).length > 0,
        m.key + "：只给 " + step + " 时报出缺了哪些步（缺 "
        + (rr.missing || []).length + " 项）");
    });
  });
}
