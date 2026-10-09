/* ============================================================
 * 抽卡引擎 · assets/gacha.js
 * ============================================================
 * 抽卡 = 从库存里随机抽一组组合，连着铺开若干张图。
 * 它不是「同一提示词换 seed」——那是同一张图看六遍，
 * 而是**每个槽各抽一条**，所以抽出来的东西才是「没见过的组合」。
 *
 * ------------------------------------------------------------
 * 这一层的核心设计目标只有一个：**库升级时抽卡不用改**。
 * ------------------------------------------------------------
 *
 * 做法是「槽位声明式派生」，而不是在抽卡代码里写死画风/题材/版式/配色：
 *
 *   ① 槽来源 = STUDIO.STEPS（工作流有几步，抽卡就有几个槽）。
 *      以后在 studio.js 里加一步（比如「笔触」「字体」），
 *      这里一行都不用动：候选数、组合空间、界面上那几行全部自动跟上。
 *
 *   ② 不在 STEPS 里的维度走 GACHA.register()。
 *      库以后多出一层不属于「四步工作流」的东西时（比如「镜头」独立成层），
 *      在这里注册一条即可，抽卡逻辑与界面同样不用改。
 *
 *   ③ 池规模**每次现算**，不缓存在任何地方。
 *      缓存下来就会在库升级后显示一个旧数字，
 *      而「数字停在旧规模上」看起来完全正常，只是它在说谎。
 *
 * ------------------------------------------------------------
 * 三条不能让步的约定
 * ------------------------------------------------------------
 *
 * 1. **不改全局 S**。抽卡要同时持有多组组合，把 ids 写进 STUDIO.S
 *    再读回来会把用户当前的画风/题材冲掉。compose 一律走
 *    STUDIO.composeWith()（它内部 try/finally 还原）。
 *
 * 2. **候选为 0 的槽必须自报**，不能静默跳过。
 *    少一层约束的提示词照样能出图，只是出的不是你要的东西 ——
 *    这类「不报错、只是效果不对」的失败最难查。
 *    所以 roll() 返回 missing[]，pool() 标 empty。
 *
 * 3. **不做加权、不排除已选**。抽卡的意义是看到没见过的组合；
 *    按「排除当前已选」过滤会在只选了两步时把范围压得极窄，
 *    抽出来的东西越抽越像，那就失去抽卡的意义了。
 *
 * file:// 直接打开也可用，不使用 fetch 与 ES module。
 * 浏览器与 Node 双跑（Node 下 require studio.js 取同一份实例）。
 * ============================================================ */

var GACHA = (function () {

  /* 池结构版本。以后槽的语义有破坏性变更时 +1，
     导出的数据里带着它，下游能判断手里的池是老结构还是新结构。 */
  var SCHEMA = 1;

  /* ============================================================
   * 取依赖
   * ============================================================
   * 必须走容器取值：浏览器里 STUDIO 是 studio.js 顶层的 var（隐式挂 global），
   * Node 里它是模块作用域的，只有 module.exports 那一份。
   * 不能写 typeof STUDIO !== "undefined" 之类的判断 ——
   * 同名 getter 会让它命中自己，递归到爆栈。
   * ============================================================ */
  function G(name) {
    if (typeof module !== "undefined" && module.exports && typeof require === "function") {
      try {
        var m = require("./studio.js");
        if (m && m[name]) return m[name];
      } catch (e) { /* 浏览器里没有 require，落到下面的容器 */ }
    }
    var w = (typeof window !== "undefined") ? window
          : (typeof globalThis !== "undefined") ? globalThis : this;
    return w ? w[name] : null;
  }

  function S() { return G("STUDIO"); }

  /* model-prompts.js 与 studio.js 是平级的：它俩互不 require，
     谁先加载都可能。这里按需取，取不到就退回通用正文
     （宁可没优化，也不能让抽卡整条路断掉）。 */
  function MPF() {
    var root = (typeof window !== "undefined" && window)
            || (typeof globalThis !== "undefined" && globalThis)
            || null;
    if (root && root.MODEL_PROMPTS) return root.MODEL_PROMPTS;
    if (typeof module !== "undefined" && module.exports && typeof require === "function") {
      try {
        var m = require("./model-prompts.js");
        return (m && m.MODEL_PROMPTS) || null;
      } catch (e) { return null; }
    }
    return null;
  }

  /* ============================================================
   * 槽位
   * ============================================================
   * 一个槽 = 组合里的一维。抽卡时每个槽各抽一条，拼成一组。
   *
   * 派生槽（source:"studio"）来自 STUDIO.STEPS，库加一步就自动多一槽。
   * 注册槽（source:"extra"）来自 register()，给不属于工作流的维度留的口子。
   * ============================================================ */
  var EXTRA = [];

  /* 从工作流步骤派生。candidates 走 STUDIO.candidates() ——
     那是「旧 ID 段前缀」的唯一解析入口，这里不自己拼前缀：
     自己按 code（ST/TH/LT/PL）去 match 旧 ID 会一条都取不到，
     而且不报错（这个坑 studio.js 里已经踩过一次，G-01 vs G-）。 */
  function deriveSlot(step) {
    var st = S();
    var list = st && st.candidates ? st.candidates(step.key) : [];
    return {
      key: step.key,
      label: step.zh || step.key,
      hint: step.hint || "",
      seg: (step.code || []).join(" / "),
      required: !!step.required,
      source: "studio",
      count: list.length,
      entries: list.map(function (e) {
        /* 显示名走 labelOfEntry —— 工作室层会换成去标识后的特征名。
           卡片上的组合信息是**摘要**，在摘要里露出创作者名，
           读到的 Agent 极可能顺手把它写进正文（SKILL.md 的硬规则二）。
           候选列表（网页的筛选栏、CLI 的 list）不换：
           那里要按原名搜得到。 */
        return {
          id: e.id,
          zh: (st && st.labelOfEntry) ? st.labelOfEntry(e) : (e.zh || e.id),
          code: (st && st.codeOfEntry) ? st.codeOfEntry(e) : ""
        };
      })
    };
  }

  function deriveSlotFromExtra(sl) {
    var st = S();
    var raw = typeof sl.list === "function" ? sl.list() : (sl.list || []);
    var entries = [];
    var nm = function (e, fallback) {
      if (e && st && st.labelOfEntry) return st.labelOfEntry(e);
      return (e && e.zh) || fallback;
    };
    for (var i = 0; i < raw.length; i++) {
      var it = raw[i];
      if (it && typeof it === "object" && it.id) {
        entries.push({ id: it.id, zh: it.zh || it.id, code: it.code || "" });
        continue;
      }
      var e = st && st.byId ? st.byId(it) : null;
      entries.push({ id: String(it), zh: nm(e, String(it)),
                     code: (e && st && st.codeOfEntry) ? st.codeOfEntry(e) : "" });
    }
    return {
      key: sl.key, label: sl.label || sl.key, hint: sl.hint || "",
      seg: sl.seg || "", required: !!sl.required, source: "extra",
      count: entries.length, entries: entries
    };
  }

  /* 全部槽（每次现算，不缓存）。
     缓存的问题不是慢，是库升级后界面还在显示旧规模，
     而旧规模看起来完全正常 —— 只是与实际能抽到的东西不符。 */
  function slots() {
    var st = S();
    var out = [];
    var steps = (st && st.STEPS) || [];
    for (var i = 0; i < steps.length; i++) out.push(deriveSlot(steps[i]));
    for (var j = 0; j < EXTRA.length; j++) {
      /* 与工作流同名的注册槽忽略：同一维出现两次会让组合空间翻倍，
         而界面上看不出来（只显示总数），属于静默算错。 */
      var dup = false;
      for (var k = 0; k < out.length; k++) if (out[k].key === EXTRA[j].key) dup = true;
      if (!dup) out.push(deriveSlotFromExtra(EXTRA[j]));
    }
    return out;
  }

  /* ------------------------------------------------------------
   * 注册一个额外槽（库升级时挂新维度的地方）
   * ------------------------------------------------------------
   * sl = { key:"lens", label:"镜头", seg:"LC", required:false,
   *        list:[id...] }            // 或 list: function(){ return [id...] }
   *
   * 用函数而不是数组，是为了让「候选随库增长」成立：
   * 传函数时每次抽卡现取，库里补了新条目立刻就能抽到。
   * 传数组的话那份快照会一直停在注册那一刻。
   *
   * 返回 true/false，不抛异常：注册是可选增强，
   * 一个写错的扩展项不该让整页抽不了卡。
   * ------------------------------------------------------------ */
  function register(sl) {
    if (!sl || !sl.key || typeof sl.key !== "string") return false;
    if (sl.list == null) return false;
    if (sl.list && typeof sl.list !== "function" && !(sl.list instanceof Array)) return false;
    for (var i = 0; i < EXTRA.length; i++) if (EXTRA[i].key === sl.key) return false;
    EXTRA.push({
      key: sl.key, label: sl.label || sl.key, hint: sl.hint || "",
      seg: sl.seg || "", required: !!sl.required, list: sl.list
    });
    return true;
  }

  function registered() {
    return EXTRA.map(function (e) { return e.key; });
  }

  /* ============================================================
   * 池规模
   * ============================================================
   * 可组合空间 = 各槽候选数的乘积（锁定的槽按 1 算）。
   *
   * 这个数字是给用户看的「库存有多大」，也是库升级是否
   * 真的生效的肉眼判据：补了 20 条画风，这里的数字必须跟着变大。
   * 所以它每次都现算。
   * ============================================================ */
  function pool(lock) {
    lock = lock || {};
    var list = slots();
    var total = 1;
    var empty = [];
    var free = 0;
    var rows = [];

    list.forEach(function (sl) {
      var locked = lock[sl.key] || "";
      var lockedEntry = null;
      if (locked) {
        for (var i = 0; i < sl.entries.length; i++) if (sl.entries[i].id === locked) lockedEntry = sl.entries[i];
        /* 锁的值不在候选里（库删了条目、或换了一版数据）：
           当作没锁处理，但记下来。静默按锁定算的话，
           这一槽会一直抽同一个不存在的 id，正文里那一层直接空掉。 */
        if (!lockedEntry) locked = "";
      }
      var n = locked ? 1 : sl.count;
      if (!locked && sl.count === 0) { empty.push(sl.key); n = 1; }
      total *= Math.max(n, 1);
      if (!locked && sl.count > 0) free++;
      /* entries 一起带出来。界面要靠它渲染「锁定这一层」的候选下拉，
         而那个下拉里的每一条都必须来自同一个 slots() ——
         界面自己再调一次 GACHA.slots() 拼起来，
         就会出现「池报告说 59 条、下拉里只有 57 条」这种
         两个来源各自算一次的分歧。 */
      rows.push({
        key: sl.key, label: sl.label, seg: sl.seg, hint: sl.hint,
        count: sl.count, required: sl.required, source: sl.source,
        entries: sl.entries,
        locked: locked, lockZh: lockedEntry ? lockedEntry.zh : "",
        empty: !locked && sl.count === 0
      });
    });

    return {
      schema: SCHEMA,
      slots: rows,
      space: total,
      spaceZh: formatSpace(total),
      empty: empty,
      lockedCount: list.length - free - empty.length,
      freeCount: free,
      /* 抽一次能凑齐几个槽 —— 与 slots 长度不一致时界面必须写明，
         否则用户会以为「库里就这些」，而实际是某一层空了。 */
      usable: rows.filter(function (r) { return !r.empty; }).length
    };
  }

  /* 组合空间的口语化写法。
     **100 万以下一律给精确值**（679,680 而不是「68 万」）：
     这个数字是「库有多大」的判据，补了 20 条画风它就该变，
     四舍五入到「万」会把 11 万和 14 万显示成同一个数，
     而「数字没动」正是维护者判断升级有没有生效的唯一依据。
     不用 toLocaleString：它受运行环境 locale 影响，
     同一个数字在不同机器上渲染成不同的分隔符，测试没法断言。 */
  function formatSpace(n) {
    n = Number(n) || 0;
    if (n >= 1e8) return (n / 1e8).toFixed(n >= 1e9 ? 0 : 2).replace(/\.?0+$/, "") + " 亿";
    if (n >= 1e6) return (n / 1e4).toFixed(0) + " 万";
    var s = String(Math.round(n)), out = "", c = 0;
    for (var i = s.length - 1; i >= 0; i--) {
      out = s[i] + out;
      if (++c % 3 === 0 && i > 0) out = "," + out;
    }
    return out;
  }

  /* 池构成的一句话说明（界面与文档共用同一份措辞，
     免得两处各写一遍，改了一处另一处就成了旧说法）。 */
  function summary(lock) {
    var p = pool(lock);
    var parts = p.slots.map(function (s) { return s.label + " " + s.count; });
    return parts.join(" · ") + " → 可组合 " + p.spaceZh + " 种";
  }

  /* ============================================================
   * 抽一组
   * ============================================================
 * opts = { lock:{key:id}, ratio:"1:1", compose:true, rnd:function }
 * 返回 { ids, rows, codes, names, chain, prompt, missing }
 *
 * rnd 可注入随机源，默认 Math.random。它存在的意义不是「可配置」，
 * 是**可复现**：报问题时说「用 seed 7 抽一组」就能拿到同一组，
 * 命令行侧也靠它做到两种数据源布局（仓库 / 随包）结果一致。
 * ============================================================ */
function roll(opts) {
    opts = opts || {};
    var st = S();
    if (!st) return { ids: {}, rows: [], codes: [], names: [], chain: "", prompt: "", missing: [] };
    var rf = (typeof opts.rnd === "function") ? opts.rnd : Math.random;

    var list = slots();
    var ids = {}, rows = [], missing = [];

    list.forEach(function (sl) {
      var want = (opts.lock && opts.lock[sl.key]) || "";
      var entry = null;
      var i;
      if (want) for (i = 0; i < sl.entries.length; i++) if (sl.entries[i].id === want) entry = sl.entries[i];
      if (!entry) {
        if (!sl.entries.length) {
          /* 这一槽空了。不静默跳过 —— 记进 missing，由界面写明
             「这一层库是空的，这张图少一层约束」。 */
          missing.push(sl.key);
          ids[sl.key] = "";
          rows.push({ key: sl.key, label: sl.label, id: "", code: "", zh: "", empty: true });
          return;
        }
        entry = sl.entries[Math.floor(rf() * sl.entries.length)];
      }
      ids[sl.key] = entry.id;
      rows.push({ key: sl.key, label: sl.label, id: entry.id,
                  code: entry.code || entry.id, zh: entry.zh || entry.id, empty: false });
    });

    var codes = rows.filter(function (r) { return r.code; }).map(function (r) { return r.code; });
    var names = rows.filter(function (r) { return r.zh; }).map(function (r) { return r.zh; });

    return {
      ids: ids,
      rows: rows,
      codes: codes,
      names: names,
      chain: codes.join(" + "),
      /* 一点提醒：ids 里那一项是空串，composeWith 会跳过它 ——
         这正是「少一层约束」的样子，所以 missing 必须一起带走。 */
      prompt: promptOf(st, ids, opts),
      missing: missing
    };
  }

  /* 按模型取该组的提示词。
   *
   * 为什么抽卡层也要走 model-prompts：抽卡页同样有模型选择，
   * 而早前它发出去的是通用英文正文 —— 于是同一个库里
   * 「出图工作流出图」与「抽卡出图」是两个语法，
   * 用户在两个界面之间来回换模型时感觉不到任何区别，
   * 而图确实不一样了。
   *
   * **只读不写**：这里不碰 STUDIO.S 的长期状态，
   * 写入与还原都在下面的 try/finally 里成对出现 ——
   * 少一个 finally，抽一批卡就会把用户正在用的四步
   * 留在抽出来的某张卡上，而抽卡页看起来完全正常。
   *
   * 适配层不可用或缺项时退回通用正文，
   * 宁可给一份没优化的，也不能让抽卡这条整路断掉。 */
  function promptFor(modelKey, ids, ratio) {
    var st = S();
    var fallback = st && ids ? st.composeWith(ids, "en", ratio) : "";
    var MP = MPF();
    if (!MP || !ids) return fallback;
    /* 适配层按「当前四步」取料，所以要用 composeWith 的同一套语义：
       把这组 ids 临时设成当前选择，调完还原。 */
    var bak = {};
    st.STEPS.forEach(function (s) { bak[s.key] = st.S[s.key]; });
    st.STEPS.forEach(function (s) { st.S[s.key] = ids[s.key] || ""; });
    try {
      var o = MP.of(modelKey, { lang: "en", ratio: ratio });
      if (!o || !o.text) return fallback;
      return o.params ? (o.text + " " + o.params) : o.text;
    } catch (e) {
      return fallback;
    } finally {
      st.STEPS.forEach(function (s) { st.S[s.key] = bak[s.key]; });
    }
  }

  /* 一组组合该配哪段提示词。
     opts.model 给定时按那个模型改写（MJ 给标签+参数、Flux 给散文…），
     不给或给不了就退回通用英文正文。

     改写发生在**抽卡引擎里**而不是界面里，是因为抽卡一次要出 N 张，
     每张一个组合、一个模型；而模型是抽卡页上的一个选择 ——
     如果让界面自己去改写，就得把「第 i 张配的是哪一组」
     这份对应关系在界面里再维护一遍，两处迟早对不上，
     而表现是「第 3 张配了错的词」，肉眼看不出错。 */
  function promptOf(st, ids, opts) {
    if (opts.compose === false) return "";
    if (opts.model) {
      var t = promptFor(opts.model, ids, opts.ratio);
      if (t) return t;
    }
    return st.composeWith(ids, "en", opts.ratio);
  }

  /* ------------------------------------------------------------
   * 抽一批（张数 n）
   * ------------------------------------------------------------
   * 组间**尽量不重复**：抽 6 张出来两张一模一样，
   * 用户会以为功能坏了或者以为是缓存。空间本来就小于 n 时不硬凑 ——
   * 那种情况下重复是必然的，硬凑只会变成一个停不下来的循环。
   * ------------------------------------------------------------ */
  function rollBatch(n, opts) {
    opts = opts || {};
    /* 非法张数一律走默认值，不夹到 1：
       「要 0 张」通常是把输入框清空了，回 1 张会让人以为程序在自作主张，
       回默认 6 张更符合「什么都没填就按常规来」。上限 24 是硬边界 ——
       一次发几十个请求会把免 key 通道的配额一次性用光。 */
    var v = parseInt(n, 10);
    if (!isFinite(v) || v <= 0) v = 6;
    n = Math.max(1, Math.min(24, v));

    var p = pool(opts.lock);
    var cards = [];
    var seen = {};
    var missing = [];
    /* 重试上限：空间远大于 n 时几乎立刻凑齐；
       空间小于 n 时这个上限让循环很快停下，然后由下面的补位填满。
       不设上限的话「空间=1、要 6 张」会一直抽到系统卡住。 */
    var limit = Math.max(8, Math.min(n * 40, Math.max(p.space, 1) * 2));
    var tries = 0;

    while (cards.length < n && tries < limit) {
      tries++;
      var one = roll(opts);
      var sig = one.rows.map(function (r) { return r.code || r.id || "-"; }).join("|");
      if (seen[sig]) continue;
      seen[sig] = 1;
      cards.push(one);
    }
    /* 空间不够时补满到 n 张。补出来的这些**明确标 repeat** ——
       它们不是「又抽到一个很像的」，是「空间里已经没有别的了」，
       两者对用户的含义完全不同，界面要分开说。 */
    var repeated = 0;
    while (cards.length < n) {
      var more = roll(opts);
      more.repeat = true;
      cards.push(more);
      repeated++;
    }

    cards.forEach(function (c) {
      (c.missing || []).forEach(function (k) { if (missing.indexOf(k) < 0) missing.push(k); });
    });

    var spaced = p.space < n;
    return {
      cards: cards,
      asked: n,
      distinct: Object.keys(seen).length,
      repeated: repeated,
      space: p.space,
      spaceZh: p.spaceZh,
      /* 空间不足时的说明。硬凑出来的重复必须写出来， */
      note: spaced
        ? "当前可组合空间只有 " + p.spaceZh + " 种，少于要抽的 " + n + " 张，"
          + "有 " + repeated + " 张是重复组合。补库之后这里会自动变宽。"
        : "",
      missing: missing
    };
  }

  /* 把一组组合写回工作流（「去精修」用）。
     不改 STUDIO.S 之外的任何东西，也不渲染 —— 界面层的事。 */
  function adopt(ids) {
    var st = S();
    if (!st || !ids) return false;
    st.reset();
    st.STEPS.forEach(function (s) { st.S[s.key] = ids[s.key] || ""; });
    return true;
  }

  return {
    SCHEMA: SCHEMA,
    slots: slots,
    register: register,
    registered: registered,
    pool: pool,
    summary: summary,
    formatSpace: formatSpace,
    roll: roll,
    rollBatch: rollBatch,
    promptFor: promptFor,
    adopt: adopt
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { GACHA: GACHA };
