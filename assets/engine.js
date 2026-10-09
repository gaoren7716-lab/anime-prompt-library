/* ============================================================
 * 开放式提示词知识库 · 引擎层
 * ------------------------------------------------------------
 * 三件事：
 *   1) retrieve —— 已知内容可检索（名称 / 别名 / 跨语言 / 描述式 / 以图入口 / 空结果兜底）
 *   2) compose —— 未收录内容可拆解，用九个槽位装配
 *   3) morph   —— 受控变形：保留项 / 变化项 / 强度 / 联动 / 冲突 / 检查标准
 *
 * 边界（不得违反）：
 *   地域 ≠ 风格，题材 ≠ 画风，作品名 ≠ 技法，模型参数 ≠ 通用提示词。
 *
 * 兼容：浏览器（<script src>，取全局变量）与 Node（require）双通道。
 * 注意：本文件顶层变量一律用 var，因为在 vm.runInContext 里 const 不会挂到全局。
 * ============================================================ */
var ENGINE = (function () {

  /* ---------- 0. 通用取值：浏览器优先取全局，Node 退回到 require ---------- */
  function grab(name, file) {
    if (typeof globalThis[name] !== "undefined") return globalThis[name];
    if (typeof module !== "undefined" && module.exports && typeof require === "function") {
      try { return require(file)[name]; } catch (e) { return []; }
    }
    return [];
  }

  var SCHEMA   = (typeof globalThis.SCHEMA !== "undefined") ? globalThis.SCHEMA
               : (function(){ try { return require("./schema.js"); } catch(e){ return {}; } })();
  var LIBS     = SCHEMA.LIBS || [];
  var SLOTS    = SCHEMA.SLOTS || [];

  /* ---------- 1. 载入十二库全部节点 ---------- */
  var LIB_FILES = [
    ["LIB_FORM",      "./lib-form.js"],
    ["LIB_VISUAL",    "./lib-visual.js"],
    ["LIB_VISUAL2",   "./lib-visual2.js"],
    ["LIB_CREATURE",  "./lib-creature.js"],
    ["LIB_CREATURE2", "./lib-creature2.js"],
    ["LIB_CREATURE3", "./lib-creature3.js"],
    ["LIB_WORLD",     "./lib-world.js"],
    ["LIB_WORLD2",    "./lib-world2.js"],
    ["LIB_STORY",     "./lib-story.js"],
    ["LIB_LENS",      "./lib-lens.js"],
    ["LIB_VOICE",     "./lib-voice.js"],
    ["LIB_PROD",      "./lib-prod.js"],
    ["LIB_MORPH",     "./lib-morph.js"],
    ["LIB_RETRIEVE",  "./lib-retrieve.js"]
  ];

  var NODES = [];
  LIB_FILES.forEach(function (pair) {
    var arr = grab(pair[0], pair[1]);
    if (Array.isArray(arr)) NODES = NODES.concat(arr);
  });

  /* ---------- 2. 索引 ---------- */
  var BY_ID = Object.create(null);
  NODES.forEach(function (n) {
    if (!n || !n.id) return;
    BY_ID[n.id] = n;
    n.kw = n.kw || [];
    n.alt = n.alt || [];
  });

  function childrenOf(id) { return NODES.filter(function (n) { return n.up === id; }); }
  function parentOf(id)   { var n = BY_ID[id]; return n && n.up ? (BY_ID[n.up] || null) : null; }
  function node(id)       { return BY_ID[id] || null; }

  /* ---------- 3. 已有条目索引（324 条可直接复制的提示词卡） ---------- */
  var ENTRY_SETS = [
    ["STYLES", "./data-core.js", "styles", "画风流派"],
    ["WORKS",  null,             "works",  "作品 IP"],
    ["GENRES", "./data-genres.js","genres","题材元素"]
  ];

  var ENTRIES = [];
  var ENTRY_BY_ID = Object.create(null);

  function collectEntries() {
    if (ENTRIES.length) return ENTRIES;
    // 浏览器：WORKS 是拼好的大数组
    if (typeof globalThis.WORKS !== "undefined" && Array.isArray(globalThis.WORKS)) {
      globalThis.WORKS.forEach(function (d) { pushEntry(d, "works", "作品 IP"); });
    }
    [["STYLES", "./data-core.js", "styles", "画风流派"],
     ["STYLES_MORE", "./data-core-more.js", "styles", "画风流派"],
     ["GENRES", "./data-genres.js", "genres", "题材元素"],
     ["LAYOUTS", "./data-layout.js", "layouts", "排版图型"],
     ["PALETTES", "./data-palette.js", "palettes", "主题配色"]].forEach(function (row) {
      var arr = grab(row[0], row[1]);
      if (Array.isArray(arr)) arr.forEach(function (d) { pushEntry(d, row[2], row[3]); });
    });
    // Node：各作品集分开存
    [["WORKS_JP","./data-works-jp.js"],["WORKS_GLOBAL","./data-works-global.js"],
     ["WORKS_MORE_A","./data-works-more-a.js"],["WORKS_EUR_W","./data-works-eur-w.js"],
     ["WORKS_EUR_E","./data-works-eur-e.js"],["WORKS_NAMER","./data-works-namer.js"]].forEach(function (row) {
      var arr = grab(row[0], row[1]);
      if (Array.isArray(arr)) arr.forEach(function (d) { pushEntry(d, "works", "作品 IP"); });
    });
    return ENTRIES;
  }

  /* 浏览器里 STYLES / WORKS 是顶层 const，不在 globalThis 上，
     所以由 index.html 显式注册，不依赖全局查找。 */
  function register(list, sec, secName) {
    (list || []).forEach(function (d) { pushEntry(d, sec, secName); });
    return ENTRIES.length;
  }

  /* 条目字段透传。
     新增的 gpt / gptZh / ratio / hex / mood / alt 必须带进来：
     出图工作流直接读这些字段拼提示词，
     pushEntry 里丢一个就是「数据在库里、界面拿不到」的空转，
     而且不报错——只能靠这里显式列出清单来防。 */
  var ENTRY_FIELDS = ["gpt", "gptZh", "ratio", "hex", "accent", "mood", "alt",
                      "note", "tip", "use"];

  function pushEntry(d, sec, secName) {
    if (!d || !d.id || ENTRY_BY_ID[d.id]) return;
    var e = {
      id: d.id, kind: "entry", sec: sec, secName: secName,
      zh: d.zh || "", en: d.en || d.romaji || "",
      cat: d.cat || d.grp || "", year: d.year || "", studio: d.studio || "",
      kw: d.kw || [], desc: d.desc || "", demo: d.demo || ""
    };
    ENTRY_FIELDS.forEach(function (f) { if (d[f] !== undefined) e[f] = d[f]; });
    ENTRIES.push(e);
    ENTRY_BY_ID[d.id] = e;
  }

  /* ---------- 4. 槽位顺序 ---------- */
  var SLOT_ORDER = SLOTS.map(function (s) { return s.key; });
  var SLOT_META  = Object.create(null);
  SLOTS.forEach(function (s) { SLOT_META[s.key] = s; });

  function nodesForSlot(slot) {
    return NODES.filter(function (n) { return n.slot === slot; });
  }

  /* ---------- 5. 独占组：同组多选即为冲突 ---------- */
  var EXCLUSIVE = [
    "CB-02", "CB-03",
    "WD-02", "WD-03", "WD-08",
    "LN-01", "LN-02", "LN-04", "LN-05", "LN-06",
    "SN-04", "VX-03",
    "PR-01", "PR-04",
    "MX-04", "RX-02", "RX-03"
  ];

  /* ---------- 6. 跨组冲突表：写在表里才叫规则，不能凭感觉 ---------- */
  var CROSS_CONFLICT = [
    // 要求无文字，却又要求出现拟声词 / 气泡 / 徽标
    { a: "VX-03-4", b: ["VX-01-1", "VX-01-2", "VX-01-3", "VX-04-1", "VX-04-2"],
      reason: "约束槽要求画面无字，文字槽却又要求出现可读文字，二者互斥。" },
    // 老化 / 未修复时代质感，与印刷级高精度物料冲突
    { a: "VS-11-4", b: ["PR-01-5", "PR-02-2"],
      reason: "年代老化会主动降低画质，与印刷物料的高精度要求相反。" },
    { a: "VS-11-1", b: ["PR-01-5"],
      reason: "赛璐璐拍摄痕迹属于放映质感，不适合作为高精度印刷成品。" },
    { a: "VS-10-6", b: ["PR-01-5"],
      reason: "动画截帧的画质上限受制于制作流程，难以满足印刷精度。" },
    // 吉祥物与壮硕体格互相拆台
    { a: "CB-08-1", b: ["CB-02-3", "CB-02-5"],
      reason: "吉祥物型角色依赖短小可爱比例，壮硕或高大破坏识别前提。" },
    // 设定三视图强调多视角一致，单幅定格强调单一瞬间
    { a: "PR-01-2", b: ["SN-01-1", "LN-05-2"],
      reason: "设定稿要求多视角信息完整，与单幅定格、强烈动势相互干扰。" },
    // 抽象概念化身 + 写实结构要求
    { a: "CB-08-7", b: ["VS-01-1"],
      reason: "抽象概念化身通常不服从写实解剖，强行写实会丢失寓意。" }
  ];

  function inGroup(n, gid) { return n && (n.id === gid || n.up === gid); }

  /* ============================================================
   * 7) 组合：compose
   *    picks = { target:["PR-01-3"], subject:["CB-01-1"], style:["VS-04-1"], ... }
   * ============================================================ */
  function compose(picks) {
    picks = picks || {};
    var used = [], notes = [], conflicts = [], tags = [], order = [];

    SLOT_ORDER.forEach(function (slotKey) {
      var ids = picks[slotKey] || [];
      if (!Array.isArray(ids)) ids = [ids];
      ids.forEach(function (id) {
        var n = BY_ID[id];
        if (!n) { notes.push("未找到节点 " + id + "，已跳过。"); return; }
        used.push(n);
        order.push({ slot: slotKey, node: n });
        n.kw.forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
      });
    });

    // 7a 同组独占检查
    EXCLUSIVE.forEach(function (gid) {
      var hit = used.filter(function (n) { return inGroup(n, gid); });
      if (hit.length > 1) {
        var box = BY_ID[gid];
        conflicts.push({
          type: "组内互斥",
          ids: hit.map(function (n) { return n.id; }),
          group: gid,
          reason: "「" + (box ? box.zh : gid) + "」同一组内只能选一个，当前选了 " +
                  hit.length + " 个：" + hit.map(function (n) { return n.zh; }).join("、") + "。"
        });
      }
    });

    // 7b 跨组冲突
    CROSS_CONFLICT.forEach(function (rule) {
      var hasA = used.some(function (n) { return n.id === rule.a; });
      if (!hasA) return;
      var hits = used.filter(function (n) { return rule.b.indexOf(n.id) !== -1; });
      if (hits.length) {
        conflicts.push({ type: "跨组冲突", ids: [rule.a].concat(hits.map(function (n) { return n.id; })), reason: rule.reason });
      }
    });

    // 7c 评级
    var grade = "ok";
    if (conflicts.length) grade = "conflict";
    else if (used.length === 0) grade = "unknown";
    else grade = used.length >= SLOT_ORDER.length * 0.4 ? "ok" : "tune";

    if (grade === "tune") notes.push("槽位偏少，画面会有大量默认填补，建议至少补齐目标、主体、内容、风格四项。");

    return {
      picks: used,
      slots: order,
      tags: tags.join(", "),
      gpt: toProse(order),
      neg: buildNegatives(used),
      grade: grade,
      conflicts: conflicts,
      notes: notes,
      summary: summarize(order)
    };
  }

  /* 组装成 GPT 可直接吃的一整段英文叙述 */
  function toProse(order) {
    if (!order.length) return "";
    var bySlot = Object.create(null);
    order.forEach(function (o) { (bySlot[o.slot] = bySlot[o.slot] || []).push(o.node); });

    var subject = (bySlot.subject || []).map(names).join(", ");
    var content = (bySlot.content || []).map(names).join(", ");
    var style   = (bySlot.style   || []).map(names).join(", ");
    var frame   = (bySlot.frame   || []).map(names).join(", ");
    var motion  = (bySlot.motion  || []).map(names).join(", ");
    var medium  = (bySlot.medium  || []).map(names).join(", ");
    var target  = (bySlot.target  || []).map(function (n) { return n.en.toLowerCase(); }).join("; ");
    var spec    = (bySlot.spec    || []).map(names).join(", ");
    var limit   = (bySlot.limit   || []).map(names).join(", ");

    var out = [];
    if (target) out.push("Purpose of the image: " + target + ".");
    var main = [];
    if (subject) main.push(subject);
    if (content) main.push("with " + content);
    if (main.length) out.push("Show " + main.join(" ") + ".");
    if (medium) out.push("Rendered as " + medium + ".");
    if (style)  out.push("Visual treatment: " + style + ".");
    if (frame)  out.push("Framing and composition: " + frame + ".");
    if (motion) out.push("Sense of motion and time: " + motion + ".");
    if (spec)   out.push("Technical specification: " + spec + ".");
    if (limit)  out.push("Constraints: " + limit + ".");
    out.push("No text, logos or watermarks unless a text slot explicitly asks for them.");
    return out.join(" ");
  }

  function names(n) { return n.kw.length ? n.kw.join(", ") : n.en.toLowerCase(); }

  function buildNegatives(used) {
    var base = ["lowres", "bad anatomy", "extra limbs", "blurry", "jpeg artifacts", "watermark", "text"];
    var extras = [];
    used.forEach(function (n) {
      if (n.slot === "limit") {
        // 约束槽里的 kw 本身就是排除项，放进负向
        (n.kw || []).forEach(function (t) {
          if (["no text", "no letters", "text free"].indexOf(t) !== -1) t = "text";
          if (extras.indexOf(t) === -1 && base.indexOf(t) === -1) extras.push(t);
        });
      }
    });
    return extras.length ? base.join(", ") + ", " + extras.join(", ") : base.join(", ");
  }

  function summarize(order) {
    return order.map(function (o) {
      var s = SLOT_META[o.slot];
      return (s ? s.zh : o.slot) + "：" + o.node.zh;
    }).join(" ／ ");
  }

  /* ============================================================
   * 8) 变形：morph
   *    opts = { base:{...picks}, change:{style:["VS-11-2"], ...}, strength:"light|medium|rebuild", keep:["..."] }
   * ============================================================ */
  var STRENGTH_TEXT = {
    light:   "轻度：一眼能认出原型，只改表层。",
    medium:  "中度：保留识别特征，整体语言已换。",
    rebuild: "重构：只保留名字与概念，视觉全部重做。"
  };

  function morph(opts) {
    opts = opts || {};
    var base = JSON.parse(JSON.stringify(opts.base || {}));
    var change = opts.change || {};
    var strength = opts.strength || "medium";
    var keep = opts.keep || [];

    var changed = [], kept = [], notes = [];

    Object.keys(change).forEach(function (slot) {
      var add = change[slot] || [];
      var old = base[slot] || [];
      var drop = opts.drop && opts.drop[slot] ? opts.drop[slot] : null;
      if (drop) base[slot] = old.filter(function (id) { return drop.indexOf(id) === -1; });
      else base[slot] = [];                     // 未显式指定保留，则该槽整体替换
      base[slot] = base[slot].concat(add);
      old.forEach(function (id) {
        var n = BY_ID[id];
        if (keep.indexOf(id) !== -1 && base[slot].indexOf(id) === -1) base[slot].push(id);
        kept.push(n ? n.zh : id);
      });
      add.forEach(function (id) {
        var n = BY_ID[id];
        changed.push({ slot: slot, node: n ? n.zh : id });
      });
    });

    keep.forEach(function (id) {
      var n = BY_ID[id];
      if (n && n.slot && base[n.slot] && base[n.slot].indexOf(id) === -1) base[n.slot].push(id);
    });

    var result = compose(base);

    if (strength === "light")   notes.push("轻度变形：原方案保留九成以上，只替换明确点名的槽位。");
    if (strength === "medium")  notes.push("中度变形：允许整体语言更换，但角色身份锚点不得丢失。");
    if (strength === "rebuild") notes.push("重构变形：仅保留概念名，视觉全部重做，需要重新走验证流程。");

    return {
      strength: strength,
      strengthText: STRENGTH_TEXT[strength] || "",
      kept: kept,
      changed: changed,
      result: result,
      notes: notes,
      checklist: [
        "主角是否仍可辨认（身份锚点：配色、标志物、剪影）",
        "变形后是否引入组内互斥",
        "是否出现乱码伪文字、多肢或粘连残肢",
        "换风格后再跑一次，检查形变保持是否成立"
      ]
    };
  }

  /* ============================================================
   * 9) 检索：retrieve
   *    返回统一结构：{ hits:[{kind,id,title,score,why,slot,lib}], completed:Boolean, fallback:Boolean }
   * ============================================================ */
  function norm(s) { return String(s || "").toLowerCase().trim(); }

  function scoreNode(n, q) {
    var id = norm(n.id), zh = norm(n.zh), en = norm(n.en), path = norm(n.path), desc = norm(n.desc);
    var best = 0, why = "";
    if (id === q) return { s: 100, why: "编号精确命中" };
    if (zh === q) return { s: 98, why: "中文名精确命中" };
    if (n.alt.some(function (a) { return norm(a) === q; })) return { s: 92, why: "别名精确命中" };
    if (en === q) return { s: 90, why: "英文名精确命中" };
    if (zh.indexOf(q) !== -1) { best = 72; why = "中文名包含"; }
    if (en.indexOf(q) !== -1 && best < 66) { best = 66; why = "英文名包含"; }
    n.kw.forEach(function (t) {
      var k = norm(t);
      if (k === q && best < 80) { best = 80; why = "落地关键词精确命中"; }
      else if (k.indexOf(q) !== -1 && best < 58) { best = 58; why = "关键词包含"; }
    });
    n.alt.forEach(function (a) {
      if (norm(a).indexOf(q) !== -1 && best < 54) { best = 54; why = "别名包含"; }
    });
    if (path.indexOf(q) !== -1 && best < 40) { best = 40; why = "所属路径包含"; }
    if (desc.indexOf(q) !== -1 && best < 26) { best = 26; why = "描述匹配"; }
    return best ? { s: best, why: why } : null;
  }

  function scoreEntry(e, q) {
    var id = norm(e.id), zh = norm(e.zh), en = norm(e.en);
    if (id === q) return { s: 99, why: "条目编号精确命中" };
    if (zh === q) return { s: 97, why: "条目标题精确命中" };
    if (en === q) return { s: 89, why: "条目外文名精确命中" };
    var best = 0, why = "";
    if (zh.indexOf(q) !== -1) { best = 70; why = "条目标题包含"; }
    if (en.indexOf(q) !== -1 && best < 64) { best = 64; why = "条目外文名包含"; }
    e.kw.forEach(function (t) {
      var k = norm(t);
      if (k === q && best < 78) { best = 78; why = "条目关键词精确命中"; }
      else if (k.indexOf(q) !== -1 && best < 56) { best = 56; why = "条目关键词包含"; }
    });
    if (norm(e.cat).indexOf(q) !== -1 && best < 34) { best = 34; why = "条目分类包含"; }
    if (norm(e.studio).indexOf(q) !== -1 && best < 32) { best = 32; why = "制作方匹配"; }
    return best ? { s: best, why: why } : null;
  }

  function retrieve(q, options) {
    options = options || {};
    var key = norm(q);
    if (!key) return { hits: [], fallback: true, empty: true, hint: "请输入关键词。" };

    var hits = [];

    if (!options.libsOnly) {
      collectEntries().forEach(function (e) {
        var r = scoreEntry(e, key);
        if (r) hits.push({ kind: "entry", id: e.id, title: e.zh, sub: e.secName,
                           score: r.s, why: r.why, sec: e.sec, copyable: true });
      });
    }

    NODES.forEach(function (n) {
      var r = scoreNode(n, key);
      if (r) hits.push({ kind: "node", id: n.id, title: n.zh, sub: n.path,
                         score: r.s, why: r.why, slot: n.slot || null, lib: n.lib });
    });

    hits.sort(function (a, b) { return b.score - a.score || a.id.localeCompare(b.id); });
    var top = hits.slice(0, options.limit || 40);

    if (!top.length) {
      return { hits: [], fallback: true, empty: true, hint: fallbackHint(key) };
    }

    var bestEntry = top.filter(function (h) { return h.kind === "entry"; })[0];
    return {
      hits: top,
      empty: false,
      fallback: !bestEntry,
      // copyable = true 表示这条已有实测提示词卡，可直接复制
      ready: !!bestEntry
    };
  }

  function fallbackHint(key) {
    return "没有命中任何已有条目。这不代表做不出来 —— 请改用描述式检索，" +
           "把需求拆到九个槽位：目标、媒介、主体、内容、风格、画面、动态、规格、约束。";
  }

  /* ---------- 10. 描述式拆解：把一句话需求映射到槽位建议 ---------- */
  var SLOT_KEYWORDS = {
    target:  ["海报", "封面", "三视图", "设定", "分镜", "模型", "立绘", "icon", "poster", "cover", "sheet", "storyboard"],
    medium:  ["动画", "漫画", "插画", "三维", "cg", "3d", "水彩", "油画", "animate", "manga", "illustration"],
    subject: ["角色", "少年", "少女", "老人", "怪物", "机器人", "女孩", "男孩", "character", "girl", "boy", "robot"],
    content: ["场景", "街道", "森林", "雨", "雪", "战斗", "城市", "street", "forest", "rain", "battle"],
    style:   ["赛璐璐", "厚涂", "水彩", "写实", "扁平", "复古", "cel", "painterly", "flat", "retro"],
    frame:   ["特写", "全景", "俯视", "仰视", "对称", "留白", "close", "wide", "low angle", "symmetry"],
    motion:  ["奔跑", "动态", "静止", "慢动作", "run", "motion", "still", "slow"],
    spec:    ["竖屏", "宽屏", "方形", "高清", "9:16", "16:9", "4k"],
    limit:   ["无字", "干净背景", "不要", "no text", "clean background"]
  };

  function decompose(text) {
    var key = norm(text);
    var out = Object.create(null);
    SLOT_ORDER.forEach(function (s) {
      var words = SLOT_KEYWORDS[s] || [];
      var hit = words.filter(function (w) { return key.indexOf(norm(w)) !== -1; });
      if (hit.length) out[s] = hit;
    });
    var advice = SLOT_ORDER.map(function (s) {
      var meta = SLOT_META[s];
      var has = out[s];
      return { slot: s, zh: meta ? meta.zh : s, hint: meta ? meta.hint : "", filled: !!has, words: has || [] };
    });
    var missing = advice.filter(function (a) { return !a.filled; }).map(function (a) { return a.zh; });
    return { advice: advice, missing: missing, text: text };
  }

  /* ---------- 11. 以图检索的拆解清单（入口） ---------- */
  function imageChecklist() {
    return [
      { slot: "subject", q: "画面主体是谁？几个？处于什么年龄段与体格？" },
      { slot: "content", q: "主体在做什么？发生在什么地点、天气、时段？" },
      { slot: "style",   q: "线条是粗是细？上色是平涂、渐变还是厚涂？有无颗粒或纸纹？" },
      { slot: "frame",   q: "景别多大？机位平视、仰视还是俯视？构图居中还是三分？" },
      { slot: "motion",  q: "是凝固瞬间还是有拖影？有没有速度线？" },
      { slot: "spec",    q: "宽高比多少？细节密度高还是低？" },
      { slot: "limit",   q: "画面里有没有文字、商标、乱码？是否必须避开？" }
    ];
  }

  /* ---------- 12. 统计 ---------- */
  function stats() {
    collectEntries();
    var byLib = Object.create(null);
    NODES.forEach(function (n) { byLib[n.lib] = (byLib[n.lib] || 0) + 1; });
    return {
      libs: LIBS.length,
      nodes: NODES.length,
      byLib: byLib,
      entries: ENTRIES.length,
      slots: SLOT_ORDER.length
    };
  }

  return {
    NODES: NODES, LIBS: LIBS, SLOTS: SLOTS, SLOT_ORDER: SLOT_ORDER, SLOT_META: SLOT_META,
    ENTRIES: ENTRIES,
    register: register,
    node: node, children: childrenOf, parent: parentOf, nodesForSlot: nodesForSlot,
    compose: compose, morph: morph, retrieve: retrieve, decompose: decompose,
    imageChecklist: imageChecklist, collectEntries: collectEntries, stats: stats
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { ENGINE: ENGINE };
