/* ============================================================
 * render.js —— 出图通道（把正文变成真图 / 或诚实地告诉你做不到）
 * ============================================================
 * 定位：studio.js 负责「拼出一段能粘贴的提示词」，
 *        render.js 负责「把这段提示词送进模型并把图取回来」。
 *        两者严格分开：拼装层不碰网络，出图层不改一个字。
 *
 * 为什么放在独立文件而不是塞进 studio-ui.js：
 *   URL 拼装、画幅换算、模型与通道的对应关系是**会被断言的确定性规则**，
 *   必须能在 Node 里 require 出来单独校验。
 *   界面层只负责点按钮与显示结果，不重复实现这套规则。
 *
 * ------------------------------------------------------------
 * 【实测结论，2026-10-08。改代码前先读完这一段】
 *
 *   ① **匿名通道的 model 参数是失效的。**
 *      GET https://image.pollinations.ai/models 只返回 ["sana"]。
 *      用flux / turbo / sana / gpt-image-2 / nano-banana 五个名字
 *      请求同一提示词、同一 seed，返回文件的 md5 完全相同。
 *      所以匿名通道只能叫「匿名通道（实际是 Sana）」，
 *      写成「Flux」是骗用户 —— 而用户会拿这张图去商用。
 *
 *   ② **真正的多模型要走 gen 通道，且需要 API key。**
 *      POST https://gen.pollinations.ai/v1/images/generations
 *      无 key 返回 401。带 key 时模型名才有意义
 *      （openai/gpt-image-2 / google/gemini-nano-banana-2.1 / black-forest-labs/flux.1.1-pro …）。
 *      CORS 预检实测通过：Access-Control-Allow-Origin: *，
 *      Access-Control-Allow-Headers 含 authorization、content-type。
 *      → 所以 key 放请求头，不进 URL。URL 里出现 key 会被浏览器历史、
 *        截图、Referer 头一起泄露出去。
 *
 *   ③ **免 key 通道的限流不是干净的时间窗口。**
 *      官方文档写「匿名用户每 15 秒 1 个请求」，但实测（同一 IP 顺序请求）：
 *        间隔 3s  → 200 402 402 402
 *        间隔 15s → 402 402 200
 *        间隔 25s → 402 200 402 200
 *        间隔 35s → 402 200 402 200
 *        间隔 60s → 402 200 200
 *      **加长间隔并不提高成功率**，成功与否和间隔基本无关，
 *      约一半请求被拒。更像一个共享配额池。
 *      两条推论：
 *        · 「一键抽卡」必须**串行 + 自动重试**，只发一次的话
 *          4 张里必有 2 张是灰卡片，用户看到的是一个一半坏掉的功能。
 *        · 界面上不能写「约 15 秒 1 张」——那是文档里的数，
 *          不是实测行为，照抄等于对用户撒谎。
 *
 *   ④ **Midjourney 没有公开 HTTP 出图 API。**
 *      只能在网页版 / Discord 里粘贴。这一项标 manual：
 *      界面给「复制 MJ 参数串 + 打开官网」，不给假的出图按钮。
 *
 * 五条约定：
 *   ① **只发英文正文**。中文正文是给国内模型改字用的，
 *      这两路通道上中文命中率明显低于英文。
 *   ② **提示词一个字都不改**。改写是创作判断，属于 studio.js。
 *   ③ **画幅必须请求与正文一致**。正文写了 3:4、请求发 1:1，
 *      模型有概率按训练分布出方图 —— 所以尺寸由选定的比例算出，
 *      并把这个比例原样带进 URL。
 *   ④ **做不到的事标做不到**。manual 通道不给按钮，
 *      给「复制过去」的路径和官网链接。
 *   ⑤ **尺寸取偶数**。部分后端对奇数边长直接报错或静默改尺寸，
 *      那样「我选了 3:4」与实际出图就对不上。
 * ============================================================ */

var RENDER = (function () {

  /* ---------- 通道 ----------
     keyed 需要用户自己的 API key；anon 不要 key 但只有一个模型；
     manual 根本没有 HTTP 出图接口。 */
  var CHANNELS = {
    keyed: {
      key: "keyed", zh: "API key 通道", host: "https://gen.pollinations.ai",
      path: "/v1/images/generations", method: "POST", needKey: true,
      gapMs: 3000,
      tip: "模型名在这一路才真正生效。需要你自己的 key（CORS 已实测可用，key 只存本机）。"
    },
    anon: {
      key: "anon", zh: "匿名通道（实际是 Sana）", host: "https://image.pollinations.ai",
      path: "/prompt/", method: "GET", needKey: false,
      gapMs: 16000,
      tip: "不要钱，但 /models 只返回 [\"sana\"]：填任何 model 名都出Sana。"
          + "而且约一半请求会被限流挡掉，加长间隔也不管用（退避重试才有意义）。"
    },
    manual: {
      key: "manual", zh: "无 API，只能复制过去", host: "",
      path: "", method: "COPY", needKey: false,
      gapMs: 0,
      tip: "Midjourney 没有公开出图 API，只能在网页版或 Discord 里粘贴。"
    }
  };

  /* ---------- 模型 ----------
     remote 是 gen 通道真正认的模型名，写错会静默回落或 4xx，
     所以只用官方 models 清单里出现过的名字，不臆造。
     notice 会直接显示在界面上 —— 有雷必须说，不说就是害人。 */
  var MODELS = [
    { key: "gpt-image-2", zh: "GPT-Image 2", channel: "keyed",
      remote: "openai/gpt-image-2", alias: "gptimage",
      tip: "OpenAI 出图。版面内的文字渲染最好，适合信息图与海报。",
      notice: "" },
    { key: "nano-banana", zh: "Nano Banana 2.1", channel: "keyed",
      remote: "google/gemini-nano-banana-2.1", alias: "nanobanana",
      tip: "Google 出图，长指令理解好、图内文字强。",
      notice: "官方清单里标了 paid_only 与 health=down：可能要付费额度，且当前处于故障状态，请求可能超时或失败。" },
    { key: "mj", zh: "Midjourney", channel: "manual",
      remote: "", alias: "midjourney", site: "https://www.midjourney.com/imagine",
      tip: "风格化最强，但只吃逗号标签 + --参数，不吃整段正文。",
      notice: "没有公开出图 API。这一项给的是「复制标签版 + --ar 参数串」，请到官网或 Discord 粘贴。" },
    { key: "flux", zh: "Flux", channel: "keyed",
      remote: "black-forest-labs/flux.1.1-pro", alias: "flux",
      tip: "写实与光影最好，画质稳，适合角色与场景。",
      notice: "" },
    /* 第 5 项不是凑数：前四个都要 key。不给一条免 key 的路，
       用户打开页面看到的第一个按钮就是灰的，整屏像坏了。 */
    { key: "sana", zh: "Sana · 免 key", channel: "anon",
      remote: "sana", alias: "sana",
      tip: "不要 key 就能出图，适合先试构图。约一半请求会被限流挡掉。",
      notice: "" }
  ];

  var DEFAULT_MODEL = "gpt-image-2";

  /* ---------- 画幅 ----------
     用户在这一屏直接选比例，而不是被动接受版式给的 ratio。
     默认 1:1：竖构图是版式层的事，这里是出图请求的事，
     两者混在一起时「我选了 16:9」和「版式说 3:4」会打架。 */
  var RATIOS = ["1:1", "9:16", "16:9", "3:4", "4:3"];
  var DEFAULT_RATIO = "1:1";

  var BASE = { "1:1": 1, "3:4": 3 / 4, "4:3": 4 / 3, "9:16": 9 / 16, "16:9": 16 / 9 };

  /* 两档尺寸。标准档长边 768（快、稳），
     高清档长边 1024（细节更好但更慢、偶发超时）。 */
  var TIERS = [
    { key: "std", zh: "标准 · 长边 768", long: 768 },
    { key: "hd",  zh: "高清 · 长边 1024", long: 1024 }
  ];
  var DEFAULT_TIER = "std";

  /* 自定义尺寸的边界。低于 256 多数模型会糊，
     高于 2048 匿名通道直接拒（实测层面：长边 1024 已开始偶发超时）。 */
  var PX_MIN = 256;
  var PX_MAX = 2048;

  function tierLong(tierKey) {
    var long = 768;
    for (var i = 0; i < TIERS.length; i++) if (TIERS[i].key === tierKey) long = TIERS[i].long;
    return long;
  }

  /* 比例 → [w, h]。未知比例回退 1:1，
     并且必须让调用方知道它是回退值（界面要显示「按 1:1 出图」）。 */
  function sizeOf(ratio, tierKey) {
    var long = tierLong(tierKey);
    var r = BASE[String(ratio || "").trim()];
    var known = !!r;
    if (!known) r = 1;
    var w, h;
    if (r >= 1) { w = long; h = Math.round(long / r); }
    else { h = long; w = Math.round(long * r); }
    if (w % 2) w += 1;
    if (h % 2) h += 1;
    return { w: w, h: h, known: known, ratio: known ? String(ratio).trim() : "1:1" };
  }

  /* 解析自定义尺寸。
     接受 "1024x1536" 与 "1024×1536" 与 "1024*1536"。
     why 一定要给：非法输入静默回退到 1:1 的话，
     用户会拿到一张方图并以为是模型抽风。 */
  function parseSize(str) {
    /* 空白只用来分隔，不当成乘号：先补全角乘号，再删掉所有空白。
       把空格替换成 x 会把 "1024 X 1536" 变成 "1024xX1536"，
       正则直接不匹配——而界面上写的示例就是这种写法。 */
    var s = String(str == null ? "" : str).trim()
      .replace(/[×＊]/g, "x")
      .replace(/[，,]/g, "x")
      .replace(/\s+/g, "");
    if (!s) return { ok: false, why: "没填尺寸" };
    var m = s.match(/^(\d{2,4})x(\d{2,4})$/i);
    if (!m) return { ok: false, why: "格式看不懂，要写成 1024x1536 这样" };
    var w = parseInt(m[1], 10);
    var h = parseInt(m[2], 10);
    if (!(w >= PX_MIN && w <= PX_MAX) || !(h >= PX_MIN && h <= PX_MAX)) {
      return { ok: false, why: "边长要在 " + PX_MIN + "–" + PX_MAX + " 之间" };
    }
    return { ok: true, w: w % 2 ? w + 1 : w, h: h % 2 ? h + 1 : h, ratio: s };
  }

  /* 画幅规格 →像素。spec 可以是 "3:4"，也可以是 "1024x1536"。
     这是界面唯一的尺寸入口 —— 比例按钮与自定义框走同一个函数，
     免得两条路算出两套像素。

     known=false 时 why 必须有话可说：非法输入静默回退到 1:1 的话，
     用户会拿到一张方图并以为是模型抽风。 */
  function pxOf(spec, tierKey) {
    var s = String(spec == null ? "" : spec).trim();
    if (s.indexOf(":") >= 0) {
      var r = sizeOf(s, tierKey);
      if (!r.known) r.why = "库里没有这个比例，按 1:1 出图";
      return r;
    }
    if (/[x×*]/i.test(s)) {
      var p = parseSize(s);
      if (p.ok) return { w: p.w, h: p.h, known: true, ratio: s };
      var fb = sizeOf(DEFAULT_RATIO, tierKey);
      fb.known = false;          /* 非法输入不能报成「已知」 */
      fb.why = p.why;
      return fb;
    }
    var d = sizeOf(s, tierKey);
    if (!d.known) d.why = "库里没有这个比例，按 1:1 出图";
    return d;
  }

  /* ---------- 模型与通道 ---------- */
  function modelById(key) {
    var k = String(key || "");
    for (var i = 0; i < MODELS.length; i++) if (MODELS[i].key === k) return MODELS[i];
    return null;
  }

  /* 白名单校验：URL 与请求体都是要发到外部的，
     拼串前先确认它是清单里的一个 key，不接受任意字符串。 */
  function modelOf(key) {
    var m = modelById(key);
    return m ? m.key : DEFAULT_MODEL;
  }

  function channelOf(key) {
    var m = modelById(key);
    return CHANNELS[m ? m.channel : "keyed"];
  }

  /* 提示词里的换行与连续空格会让 URL 变长且无意义。
     压成单空格不是「改写提示词」，只是 URL 编码前的清洗。 */
  function flatten(p) {
    return String(p || "").replace(/\s+/g, " ").trim();
  }

  /* seed 只在「换一张」时由界面生成。
     固定 seed 可复现同一张图，用于对照修图。 */
  function randSeed() { return Math.floor(Math.random() * 1000000); }

  /* ---------- 匿名通道 URL ----------
     model 参数仍然带上：当前后端忽略它，但哪天开始支持了，
     老页面不至于因为少了参数而变慢。带上它不构成「假装支持」——
     因为界面上写明了这一路实际是Sana。 */
  function urlOf(prompt, opts) {
    opts = opts || {};
    var m = modelById(opts.model);
    var useKeyed = m && m.channel === "keyed";
    var size = useKeyed
      ? pxOf(opts.ratio || DEFAULT_RATIO, opts.tier || DEFAULT_TIER)
      : pxOf(opts.ratio || DEFAULT_RATIO, opts.tier || DEFAULT_TIER);
    var host = CHANNELS[useKeyed ? "keyed" : "anon"].host + CHANNELS.anon.path;
    var q = "width=" + size.w + "&height=" + size.h
          + "&model=" + (useKeyed ? encodeURIComponent(m.remote) : encodeURIComponent(m ? m.remote : "sana"))
          + "&nologo=" + (opts.nologo === false ? "false" : "true")
          + "&seed=" + (opts.seed == null ? randSeed() : opts.seed);
    return { url: host + encodeURIComponent(flatten(prompt)) + "?" + q,
             w: size.w, h: size.h, known: size.known, ratio: size.ratio };
  }

  /* ---------- 统一请求描述 ----------
     UI 只认这一个出口：拿到 kind 就知道该怎么办。
       kind=img     → 直接塞给 <img src>
       kind=json    → POST，取 data[0].url
       kind=manual  → 不能出图，给复制路径
     不在 UI 里散落 if (model==="mj") 这种判断——
     每散落一处就多一个能漏掉分支的地方。 */
  function reqOf(prompt, opts) {
    opts = opts || {};
    var m = modelById(opts.model) || modelById(DEFAULT_MODEL);
    var ch = CHANNELS[m.channel];
    var size = pxOf(opts.ratio || DEFAULT_RATIO, opts.tier || DEFAULT_TIER);
    var seed = opts.seed == null ? randSeed() : opts.seed;
    var base = { model: m.key, channel: m.channel, w: size.w, h: size.h,
                 known: size.known, ratio: size.ratio, seed: seed, why: size.why || "" };

    if (m.channel === "manual") {
      return Object.assign(base, { kind: "manual", notice: m.notice, tip: m.tip });
    }
    if (m.channel === "keyed") {
      var key = String(opts.key || "").trim();
      if (!key) {
        return Object.assign(base, { kind: "needkey", notice: m.notice, tip: m.tip,
          host: ch.host, path: ch.path });
      }
      /* key 进 Authorization 头，不进 URL。 */
      return Object.assign(base, {
        kind: "json", notice: m.notice, tip: m.tip,
        url: ch.host + ch.path,
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
        body: { model: m.remote, prompt: flatten(prompt),
                width: size.w, height: size.h, n: 1, seed: seed }
      });
    }
    return Object.assign(base, {
      kind: "img", notice: m.notice, tip: m.tip,
      url: CHANNELS.anon.host + CHANNELS.anon.path + encodeURIComponent(flatten(prompt))
        + "?width=" + size.w + "&height=" + size.h
        + "&model=" + encodeURIComponent(m.remote)
        + "&nologo=true&seed=" + seed
    });
  }

  /* ---------- 通道间隔 ----------
     抽卡排队用。**这个值不是「保证不撞限流」的那个数**，
     免key 通道的限流不是干净的时间窗口（见文件头实测③），
     16 秒只是「别撞得太密」的间隔下限，成不成功靠重试。
     间隔写 3 秒会拿到一串402；写 60 秒也不会变干净。 */
  function gapMs(modelKey) {
    var m = modelById(modelKey);
    return m ? CHANNELS[m.channel].gapMs : 3000;
  }

  return {
    CHANNELS: CHANNELS,
    MODELS: MODELS,
    TIERS: TIERS,
    RATIOS: RATIOS,
    PX_MIN: PX_MIN,
    PX_MAX: PX_MAX,
    DEFAULT_MODEL: DEFAULT_MODEL,
    DEFAULT_RATIO: DEFAULT_RATIO,
    DEFAULT_TIER: DEFAULT_TIER,
    sizeOf: sizeOf,
    pxOf: pxOf,
    parseSize: parseSize,
    modelOf: modelOf,
    modelById: modelById,
    channelOf: channelOf,
    urlOf: urlOf,
    reqOf: reqOf,
    gapMs: gapMs,
    randSeed: randSeed,
    flatten: flatten
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { RENDER: RENDER };