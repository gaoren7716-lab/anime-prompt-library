/* ============================================================
 * prompts-zh.js —— 中文正文的统一查表入口
 * ============================================================
 * 为什么要单独一层，而不是像英文正文那样让各文件 push 进 PROMPT_SETS：
 *   PROMPT_SETS 是「英文正文」的集合，里面每条只有 gpt 字段。
 *   中文正文如果也 push 进去，同一个 id 会出现两条记录
 *   （一条 gpt、一条 gptZh），后读的会覆盖先读的——
 *   表现是「中文版莫名其妙变成了英文」或者反过来。
 *   两版是并行交付物，必须分表，不能合并。
 *
 * 用法：
 *   PROMPT_ZH.get("ST-001")  → 中文正文（没有则返回 undefined）
 *   PROMPT_ZH.has("ST-001")  → 是否有中文版
 *
 * 覆盖范围（刻意不含作品层）：
 *   技法 59 + 题材 32 = 91 条，这 91 条就是「可直接出图」的部分。
 *   作品层 233 条不给中文正文——它们按授权分级是 R3，
 *   本来就不能直接商用，为它们做正文等于鼓励误用。
 *   这一点必须写在这里：将来有人问「为什么有些条目没有中文版」，
 *   答案是授权边界，不是遗漏。
 * ============================================================ */
var PROMPT_ZH = (function () {

  /* 各批中文正文变量。与 tools/_loadlist.js 的 PROMPT_ZH_NAMES 对应，
     两处必须同步——漏一个就是「文件加载了但没进表」，
     而那类失效不报错，只是中文版静默变空。

     读取方式说明：不能用 globalThis[name]。
     浏览器里 <script> 顶层的 const 不会挂到 globalThis 上
     （只有顶层 var 才会），所以这里逐个 try 直接引用标识符。
     读不到就跳过，不抛错——这正是「某个文件没加载」应有的表现：
     静默少几批，而不是整页白屏。

     但光靠标识符引用在 Node 侧不够：require 本文件时模块作用域里
     根本没有那些 const，eval 全部落空 → size() 为 0。
     而这一层失效的表现特别隐蔽：查表返回 undefined，
     调用方按「没有中文版」的分支回退到条目 demo（英文标签串），
     于是中文正文变成了中英混杂的标签堆，还不报错。
     所以每个来源都配一个 require 路径作为第二条通道。 */
  var SOURCES = [
    ["PROMPTS_ZH_ST1", "./data-prompts-zh-st1.js"],
    ["PROMPTS_ZH_ST2", "./data-prompts-zh-st2.js"],
    ["PROMPTS_ZH_ST3", "./data-prompts-zh-st3.js"],
    ["PROMPTS_ZH_GN1", "./data-prompts-zh-gn1.js"],
    ["PROMPTS_ZH_GN2", "./data-prompts-zh-gn2.js"]
  ];

  /* 排版与配色层不另开正文文件，中文正文直接写在条目自己的 gptZh 上 */
  var OWN_FIELD = [
    ["LAYOUTS", "./data-layout.js"],
    ["PALETTES", "./data-palette.js"]
  ];

  var MAP = new Map();
  var ORDER = [];

  /* 逐名取值。try 是必要的：某个变量在该环境下不存在时
     直接引用会抛 ReferenceError，把整个查表打断。
     读不到就跳过——静默少几批，而不是整页白屏。

     除了 PROMPTS_ZH_* 独立文件，还要收 LT / PL 两个数据源——
     排版与配色层是后加的，中文正文直接写在条目自己的 gptZh 字段上，
     没有另开正文文件。漏掉它们的表现是：排版配色在工作流里
     「查不到中文版」，而且不报错。 */
  /* 两级取值：先在当前作用域 eval 标识符（浏览器 / vm 场景成立），
     再退回 require 指定文件（Node 场景成立）。
     两级都拿不到才跳过——绝不因为「读不到」就静默产生空表。 */
  function pick(name, file) {
    var arr;
    try { arr = eval(name); } catch (e) { arr = null; }
    if (Array.isArray(arr)) return arr;
    if (file && typeof module !== "undefined" && module.exports && typeof require === "function") {
      try {
        var m = require(file);
        arr = m ? m[name] : null;
        if (Array.isArray(arr)) return arr;
      } catch (e) { return null; }
    }
    return null;
  }

  function collect() {
    var m = new Map(), order = [];
    function put(arr) {
      if (!Array.isArray(arr)) return;
      arr.forEach(function (p) {
        if (!p || !p.id) return;
        m.set(p.id, p.gptZh || "");
        order.push(p.id);
      });
    }
    SOURCES.forEach(function (row) { put(pick(row[0], row[1])); });
    OWN_FIELD.forEach(function (row) { put(pick(row[0], row[1])); });
    return { map: m, order: order };
  }

  /* 规范码 → 旧 id 的反查表。
     正文按旧 id（A1-01 / G-01）存储，与英文正文保持一致——
     同一套内容只记一份 id，避免两版正文各存各的 id 后对不上。
     但界面与工作流拿到的一般是规范码（ST-001 / TH-001），
     所以这里由 CODES 现场派生映射，两边都能查到。

     CODES 通过 inject 传入而不是读全局：Node 的 CommonJS 里
     `var` 是模块作用域，裸引用会 ReferenceError。 */
  var CODES = null;

  /* 规范码 → 旧 id 的反查。
     正文一律按旧 id（A1-01 / G-01）存，界面拿到的多是规范码（ST-001），
     这里做一次段码逆推。逆推来源是 CODES.OLD_SEG（新段 → 旧前缀）
     与 SEGMENTS（段 → 层级），都是 codes.js 里的**静态表**——
     不依赖 registry 装配过。

     为什么不用 CODES.CODE_OF / OLD_OF：
       那两张表要 CODES.add() 跑过才有内容，也就是要 registry 装配过。
       页面里没问题，但本模块单独 require 时全表取不到且不报错。
     为什么不用 CODES.derive()：
       derive 是「旧 id → 新码」方向，返回的是新码，拿不到旧 id。 */
  var OLD_BY_NEW = {};   /* 新段码 → 旧前缀（取第一个，够用了） */

  function buildSegMap() {
    if (builtSeg && Object.keys(OLD_BY_NEW).length) return;
    /* CODES 优先用注入的；没注入就自己去取。
       页面此前只在测试里调 injectCodes()，浏览器侧从未调用——
       于是这里 CODES 恒为 null，buildSegMap 直接 return，
       「按规范码 ST-001 查中文正文」在页面上永远取不到。
       而按旧 id（A1-01）查是好的，所以这个失效很难被察觉：
       两条查询路径给出的结果不一样，只有逐条比对才发现。 */
    if (!CODES) CODES = grabCodes();
    if (!CODES || !CODES.SEGMENTS) return;
    OLD_BY_NEW = {};
    builtSeg = true;
    CODES.SEGMENTS.forEach(function (s) {
      var old = s.old;
      /* old 可能是 W-* 这种通配（作品段没有单一旧前缀），
         那种不参与逆推——作品层本来也没有中文正文。 */
      if (!old || old.indexOf("*") >= 0) return;
      if (OLD_BY_NEW[s.code] === undefined) OLD_BY_NEW[s.code] = old;
    });
  }

  var builtSeg = false;

  /* 双通道取 CODES：浏览器读全局（顶层 var，会挂 window），
     Node 退到 require。与 studio.js / engine.js 同一个约定。 */
  function grabCodes() {
    var root = (typeof window !== "undefined" && window) || (typeof globalThis !== "undefined" && globalThis) || null;
    if (root && root.CODES) return root.CODES;
    if (typeof module !== "undefined" && module.exports && typeof require === "function") {
      try { return require("./codes.js").CODES; } catch (e) { return null; }
    }
    return null;
  }

  function idOf(code) {
    if (!code) return null;
    /* 先按旧 id 直查（常见情况，免一次转换） */
    if (collected.map.has(code)) return code;

    buildSegMap();
    var up = String(code).toUpperCase();
    var m = up.match(/^([A-Z]{2})-(\d{1,3})$/);
    if (!m || !OLD_BY_NEW[m[1]]) return null;

    /* 旧 id 的数字位可能是一位、两位或三位，而规范码恒为三位。
       ST-001 的序号是 "001"，直接拼出来是 A1-001；
       而正文里存的是 A1-01（两位）。
       所以不能只按原样拼，必须先去掉前导零、再补出所有位数：
         "001" → 数字 1 → 试 A1-1 / A1-01 / A1-001
       之前写成「原样 + 补零」两档，实际两档都是三位，
       永远命中不了两位那条——不报错，只是静默取不到。 */
    var seg = OLD_BY_NEW[m[1]];
    var num = parseInt(m[2], 10);
    if (isNaN(num)) return null;
    var cands = [];
    [1, 2, 3].forEach(function (w) {
      var s = String(num);
      while (s.length < w) s = "0" + s;
      while (s.length > w) s = s.slice(-w);
      cands.push(seg + "-" + s);
    });
    for (var i = 0; i < cands.length; i++) {
      if (collected.map.has(cands[i])) return cands[i];
    }
    return null;
  }

  /* CODES 需要从外部注入。index.html 的 registry.boot 之后调一次。 */
  function injectCodes(codes) { CODES = codes || null; }

  var collected = null;
  function build() {
    if (!collected) collected = collect();
    return collected.map;
  }

  function buildOrder() { build(); return collected.order.slice(); }

  /* Node 的 CommonJS 里顶层 const 同样不挂 globalThis，
     所以 require 场景由调用方显式 inject 一遍。
     inject 必须复刻 collect 的全部来源（PROMPTS_ZH_* + LAYOUTS + PALETTES），
     只传 PROMPTS_ZH_* 会让排版配色在 Node 侧查不到——
     而页面与 Node 表现不一致是最难查的一类 bug。 */
  function inject(sets) {
    var m = new Map(), order = [];
    function put(arr) {
      (arr || []).forEach(function (p) {
        if (!p || !p.id) return;
        m.set(p.id, p.gptZh || "");
        order.push(p.id);
      });
    }
    (sets || []).forEach(put);
    if (!Array.isArray(sets)) return m;   /* 没传数组就没有别的来源 */
    OWN_FIELD.forEach(function (row) { put(pick(row[0], row[1])); });
    collected = { map: m, order: order };
    return m;
  }

  return {
    /* 传旧 id（A1-01）或规范码（ST-001）都能取到。
       两种键都支持，是因为界面与工作流拿到的一般是规范码，
       而正文一律按旧 id 存——只认一种就会静默取不到。 */
    get: function (id) { build(); var k = idOf(id); return k ? collected.map.get(k) : undefined; },
    has: function (id) { build(); return !!idOf(id); },
    size: function () { return build().size; },
    ids: buildOrder,
    inject: inject,
    injectCodes: injectCodes
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { PROMPT_ZH: PROMPT_ZH };