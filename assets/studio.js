/* ============================================================
 * studio.js —— 出图工作流（画风 × 题材 × 版式 × 配色 → 可复制提示词）
 * ============================================================
 * 为什么要有这个：
 *   库里技法、题材、排版、配色各有各的条目，但用户真正的流程是
 *   「我想画一张 XX 图」——一句话要能直接变成能粘贴的提示词。
 *   原来的检索 + 组合是「查工具」，不是「完成一张图」。
 *
 * 四步，每步都能跳过但有推荐值：
 *   ① 画风  —— 决定「怎么画」   条目层 ST/ER/SB/RG/MV
 *   ② 题材  —— 决定「画什么」   条目层 TH
 *   ③ 版式  —— 决定「怎么摆」   排版层 LT
 *   ④ 配色  —— 决定「什么色」   配色层 PL
 *   → 拼出：中文正文 / 英文正文 / 标签速用版 / 负面词 / 建议画幅 / 授权提示
 *
 * 三条硬规则：
 *   ① **不静默丢步**。用户没选题型时，结果里要说明「缺哪一项」，
 *      而不是给一段看起来完整、实际少一层约束的提示词——
 *      少一层约束的提示词照样能出图，但出的是错的东西。
 *   ② **配色与版式必须落到具体值**。palette 的 hex、layout 的 ratio
 *      直接进提示词，不给模型解释的机会。
 *   ③ **授权提示随选择走**。选了 R2 的画风却在出商业图，
 *      界面上必须当场说清，而不是等用户拿到提示词才发现。
 *
 * ------------------------------------------------------------
 * 依赖解析（浏览器 / Node 双跑）
 *   下面每个依赖都走 g()：先读 window/globalThis，再 require 兜底。
 *   直接裸写 `ENGINE.xxx` 在 Node 的 CommonJS 里会 ReferenceError——
 *   顶层 var 是模块作用域不是全局。
 *   反过来写 `typeof ENGINE !== "undefined"` 在浏览器里也不安全：
 *   全局对象上存在同名 getter 时会撞上自己，递归到爆栈。
 *   唯一稳的是走容器。项目里 engine.js / prompts-zh.js 都按这个约定写。
 * ============================================================ */

var STUDIO = (function () {

  /* ---------- 依赖容器 ---------- */
  function g(name, file, prop) {
    var root = (typeof window !== "undefined" && window) || (typeof globalThis !== "undefined" && globalThis) || null;
    if (root && root[name] !== undefined && root[name] !== null) return root[name];
    if (typeof module !== "undefined" && module.exports && typeof require === "function") {
      try {
        var m = require(file);
        return prop ? m[prop] : m;
      } catch (e) { return null; }
    }
    return null;
  }

  /* ENGINE 是 require 出来的单例，直接缓存住，避免每次调用都走一遍解析 */
  var ENGINE = g("ENGINE", "./engine.js", "ENGINE");

  function PZK()  { return g("PROMPT_KIT", "./prompt-kit.js", "PROMPT_KIT"); }
  function PZH()  { return g("PROMPT_ZH", "./prompts-zh.js", "PROMPT_ZH"); }
  function RT()    { return g("RIGHTS", "./rights.js", "RIGHTS"); }
  function CD()    { return g("CODES", "./codes.js", "CODES"); }

  /* ---------- 旧 id 的段前缀 ----------
     必须用正则取到第一个连字符为止，不能用 slice(0, 2)：
     段前缀长度不固定——G-01 的段是「G」（1 个字符），
     A1-01 的是「A1」，LT-01 的是「LT」。
     slice(0,2) 会把 G-01 切成「G-」，与配置里的「G」比不上，
     结果题材栏 0 条，而且不报错。 */
  function segOf(id) {
    var m = String(id || "").match(/^([A-Z]+\d*)-/);
    return m ? m[1] : "";
  }

  /* 各步要筛的段。
     old 是旧 id 前缀（引擎里的实际 id），code 是规范段码（展示用）。
     两者不能混：按 code 去 match 旧 id，一个候选都取不到。 */
  var STEPS = [
    { key: "style", zh: "画风", hint: "决定怎么画：线条与上色的具体做法", required: true,
      old: ["A1", "A2", "A3", "A4", "A5"], code: ["ST", "ER", "SB", "RG", "MV"] },
    { key: "theme", zh: "题材", hint: "决定画什么：内容层的视觉惯例", required: true,
      old: ["G"], code: ["TH"] },
    { key: "layout", zh: "版式", hint: "决定怎么摆：元素位置与留白", required: false,
      old: ["LT"], code: ["LT"] },
    { key: "palette", zh: "配色", hint: "决定什么色：主色统领全画面", required: false,
      old: ["PL"], code: ["PL"] }
  ];

  /* 每个旧前缀对应的板块 key。buildCard 用它决定镜头建议，
     传错的话 genres 的构图建议会套到画风上。 */
  var SEC_OF = { A1: "styles", A2: "styles", A3: "styles", A4: "styles", A5: "styles",
                 G: "genres", LT: "layouts", PL: "palettes" };

  function stepOf(key) {
    var hit = null;
    STEPS.forEach(function (s) { if (s.key === key) hit = s; });
    return hit;
  }

  /* 当前选择。key 是 STEP.key，值是条目 id（旧 id，如 A1-01 / LT-01）。
     用旧 id 而不是规范码存，因为引擎里的 id 就是旧 id，取数据时零转换；
     展示时再转规范码。 */
  var S = { style: "", theme: "", layout: "", palette: "" };

  function reset() { S.style = ""; S.theme = ""; S.layout = ""; S.palette = ""; }

  /* 入参可以是旧 ID（A1-01）也可以是规范码（ST-001）。
     内部一律存旧 ID —— ENGINE 的条目 id 是旧 ID，
     拿规范码去比对会一条都匹配不上，而且不报错，
     表现是「选了画风但正文整块空」。
     所以这里先把规范码翻回旧 ID 再存。 */
  function toOldId(id) {
    if (!id) return "";
    var s = String(id);
    if (s.indexOf("-") < 0) return s;
    var m = s.match(/^([A-Z]{2})-(\d{1,3})$/);
    if (!m) return s;                    /* A1-01 / LT-01 这类旧 ID，原样返回 */
    var found = byId(s);                 /* 先按条目自身的 code 字段试 */
    if (found) return found.id;
    return s;                            /* 翻不出来就保留原值，由 byId 报未命中 */
  }

  function pick(key, id) {
    if (!stepOf(key)) return;
    var old = toOldId(id);
    S[key] = (S[key] === old) ? "" : old;   /* 再点一次取消 */
  }

  /* ---------- 取条目 ---------- */
  function allEntries() {
    if (!ENGINE) return [];
    /* collectEntries 是懒加载的：require 之后 ENTRIES 可能还是空的。
       不先调它就会拿到 0 条而不报错，表现就是「工作流里每栏都空」。 */
    if (typeof ENGINE.collectEntries === "function") ENGINE.collectEntries();
    return (ENGINE && ENGINE.ENTRIES) || [];
  }

  function candidates(stepKey) {
    var step = stepOf(stepKey);
    if (!step) return [];
    return allEntries().filter(function (e) {
      return e && e.id && step.old.indexOf(segOf(e.id)) >= 0;
    });
  }

  function entryOf(stepKey) {
    var id = S[stepKey];
    if (!id) return null;
    return byId(id);
  }

  /* 按 id 查条目。同时接受旧 ID（A1-01）与规范码（ST-001）。
     规范码经 CD().OLD_OF 反查旧 ID —— 那是 codes.js 的唯一真源，
     不在这里重新派生一套，否则编码规则一改这里就静默失效。 */
  function byId(id) {
    if (!id) return null;
    var list = allEntries();
    var i;
    for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    var c = CD();
    if (c && c.OLD_OF && c.OLD_OF[id]) {
      var old = c.OLD_OF[id];
      for (i = 0; i < list.length; i++) if (list[i].id === old) return list[i];
    }
    /* 段码 → 旧前缀 + 序号补零全宽度。
       codes.js 的 OLD_OF 只收真实存在的条目，
       传「不存在但格式对」的编码时靠这条兜底，
       免得 CLI 拼错一位就静默返回空。 */
    var m = String(id).match(/^([A-Z]{2})-(\d{1,3})$/);
    if (m && c && c.SEGMENTS) {
      for (i = 0; i < c.SEGMENTS.length; i++) {
        var sg = c.SEGMENTS[i];
        if (sg.code !== m[1] || !sg.old || sg.old.indexOf("*") >= 0) continue;
        var num = parseInt(m[2], 10);
        for (var w = 1; w <= 3; w++) {
          var s = String(num);
          while (s.length < w) s = "0" + s;
          while (s.length > w) s = s.slice(-w);
          var cand = sg.old + "-" + s;
          for (var j = 0; j < list.length; j++) if (list[j].id === cand) return list[j];
        }
      }
    }
    return null;
  }

  /* 分类聚合，用于把几十条候选按类别折叠 */
  function groupBy(list, field) {
    var g2 = {};
    list.forEach(function (e) {
      var k = (e && e[field]) || "其他";
      (g2[k] = g2[k] || []).push(e);
    });
    return g2;
  }

  /* ---------- 正文取值 ----------
     中文与英文是两个独立来源，顺序不能反：
       英文 → PROMPT_SETS（各 data-prompts-*.js push 进来的集合）
       中文 → PROMPT_ZH.get()（独立查表，见 prompts-zh.js 的说明）
     排版与配色不走查表，中英文正文直接写在条目自己的 gpt / gptZh 上。 */
/* 英文正文统一走 PROMPT_EN 独立查表（assets/prompts.js）。
   不读 PROMPT_SETS —— 见 prompts.js 文件头：
   PROMPT_SETS 靠各正文文件 push 攒起来，浏览器里同一个全局对象没问题，
   但 Node / 测试沙箱里正文文件被 vm 加载时 push 的是另一个上下文的对象，
   require 回来的 prompt-kit.js 那份始终是空数组。
   后果是取不到正文 → 静默回退到条目 demo 标签串 →
   英文那几段特别短而中文正常，不对称到容易被当成设计。
   PROMPT_EN 缺失时（文件没加载）退回聚合数组，行为退化但不报错。 */
  function gptOf(id) {
    var P = g("PROMPT_EN", "./prompts.js", "PROMPT_EN");
    if (P && typeof P.get === "function") return P.get(id);
    var sets = g("PROMPT_SETS", "./prompt-kit.js", "PROMPT_SETS");
    if (Array.isArray(sets)) {
      for (var i = 0; i < sets.length; i++) {
        var arr = sets[i] || [];
        for (var j = 0; j < arr.length; j++) {
          if (arr[j] && arr[j].id === id) return arr[j].gpt || "";
        }
      }
    }
    return "";
  }

  function textOf(stepKey, field) {
    var e = entryOf(stepKey);
    if (!e) return "";
    var isZh = field === "gptZh";
    var own = e[field] || "";
    if (isZh) {
      if (own) return own;
      var p = PZH();
      if (p && typeof p.get === "function") return p.get(e.id) || "";
      return "";
    }
    if (own) return own;
    return gptOf(e.id);
  }

  /* 标签速用版：条目自带的 demo */
  function demoOf(stepKey) {
    var e = entryOf(stepKey);
    if (!e) return "";
    if (e.demo) return e.demo;
    return (e.kw || []).slice(0, 8).join(", ");
  }

  /* 取条目对应的规范码（ST-001 / LT-001 / PL-001）。
     传条目本身，不是 stepKey —— 原来的 codeOf(stepKey) 只能报「当前选中的那一条」，
     list 场景下没选中任何条目，全返回空串，
     表现是「列出来的候选只有中文名没有编码」，
     而编码恰恰是 Agent 拼命令时唯一需要的东西。 */
  function codeOfEntry(e) {
    if (!e || !e.id) return "";
    var c = CD();
    if (!c) return e.id;
    /* 先查已登记的映射表（工作索引里有条目时准）。
       查不到就用 derive() 现场派生 —— 它是 codes.js 里的纯函数，
       旧 ID → 规范码的规则只有那一处真源，
       在这里另写一套「补零到三位」的规则迟早与它不一致。 */
    if (c.OLD_OF && c.OLD_OF[e.id]) return c.OLD_OF[e.id];
    if (typeof c.derive === "function") {
      try { return c.derive(e.id) || e.id; } catch (err) { return e.id; }
    }
    return e.id;
  }

  function codeOf(stepKey) {
    var e = entryOf(stepKey);
    return e ? codeOfEntry(e) : "";
  }

  /* 显示名：工作室层换成去标识后的特征名。
     抽卡卡片的「这一组用了库里哪几条」也要走这一条 ——
     卡片是**摘要**，和「已选」那一栏同类；
     而在摘要里露出创作者名，读到的 Agent 极可能顺手把它写进正文，
     那正是本库反复挡的那件事。
     （候选列表不换：那里要按原名搜得到，「吉卜力」必须能命中。） */
  function labelOfEntry(e) {
    if (!e) return "";
    if (e.cat === "工作室") {
      var A = g("STUDIO_LOOKALIAS", "./data-studio-alias.js", "STUDIO_LOOKALIAS");
      var a = A && A[e.id];
      if (a && a.look) return a.look;
    }
    return e.zh || e.id;
  }

  /* 工作流里显示的名字。
     工作室层（cat === "工作室"）的条目名叫「吉卜力（宫崎骏）」这类，
     那是检索索引 —— 搜「吉卜力」要能命中，检索性不能丢。
     但进了出图工作流，用户会以为选中它就可以直接用那个名字出图。
     R2 档的处理办法是「先改写」，而改写的对象是正文，不是标题，
     所以这里必须显示去掉标识后的特征名。

     其它层（技法 / 年代 / 地区 / 全球流派 / 题材 / 版式 / 配色）
     条目名本身就是通用描述，直接用。 */
  function labelOf(stepKey) {
    return labelOfEntry(entryOf(stepKey));
  }

  /* 标签速用版里该用的词。
     工作室层的原始 kw 混着工作室名与创作者名（如 "studio ghibli"、
     "miyazaki style"），直接进提示词就是把 R2 标识写进正文。
     有别名表就用去标识后的词，没有就退回原 kw。 */
  function tagsOf(stepKey) {
    var e = entryOf(stepKey);
    if (!e) return [];
    if (e.cat === "工作室") {
      var A = g("STUDIO_LOOKALIAS", "./data-studio-alias.js", "STUDIO_LOOKALIAS");
      var a = A && A[e.id];
      if (a && a.tagsKw) return [a.tagsKw];
    }
    return e.kw || [];
  }

  /* ---------- 拼装 ---------- */

  /* 画风层为什么要单独处理，不能直接拼正文：
   *
   * 59 条画风正文的开头都自带一个完整场景——
   *   A1-01「a teenage girl in a navy sailor uniform standing in an empty classroom」
   *   A1-06「a young man in a tailored wool coat waiting on a rainy city street」
   * 题材正文同样自带场景。两者直接拼接必然对冲：
   *   题材说「学生靠在窗边自行车上」，画风说「女生站在空教室」，
   *   模型拿到两个互相矛盾的主体，结果是四不像。
   *
   * 条目上的 desc 字段本来就是纯技法描述（不含任何人物与场景），
   * note 是注意事项，两者拼起来才是「画风」这一层该给的东西。
   * 所以工作流里画风只出技法，场景统一交给题材层决定。
   *
   * 单看一条画风正文时（画廊、Markdown）仍用完整正文——
   * 那里没有题材参与，场景不是冲突而是示范。
   */
  function styleCraft(e, isZh) {
    if (!e) return "";
    var parts = [];
    if (isZh) {
      if (e.desc) parts.push("画法：" + e.desc);
      if (e.note) parts.push(e.note);
    } else {
      var en = g("STYLE_DESC_EN", "./data-styles-en.js", "STYLE_DESC_EN");
      var d = (en && en[e.id]) || e.descEn || "";
      if (d) parts.push("Rendering approach: " + d);
      if (e.noteEn) parts.push(e.noteEn);
    }
    if (parts.length) return parts.join(" ");
    /* desc 与 note 都空才退回正文。
       走到这里说明条目数据缺字段，宁可给全文也不能给空——
       空串会让工作流看起来少了一层，用户以为是自己没选。 */
    return textOf("style", isZh ? "gptZh" : "gpt") || demoOf("style");
  }

  /* 提示词正文。
     顺序有讲究：题材 → 版式 → 画风 → 配色 → 画幅 → 禁止项。
     画风放后面而不是前面，因为 GPT 系模型对句子后部的约束
     遵守得更牢；放最前面容易被后面的内容描述冲淡。

     ratioOverride：出图工作流里用户直接选了出图比例，
     这时正文里的画幅句必须跟着改写。
     不改的后果是「正文说 3:4、请求发 16:9」——
     模型两套指令都收到，出的是哪一张不由用户决定。 */
  function compose(lang, ratioOverride) {
    var isZh = (lang === "zh");
    var f = isZh ? "gptZh" : "gpt";

    var styleE = entryOf("style");
    var style  = styleCraft(styleE, isZh) || demoOf("style");
    var theme  = textOf("theme", f) || demoOf("theme");
    var layout = entryOf("layout");
    var pal= entryOf("palette");

    var parts = [];
    if (theme) parts.push(theme);
    if (layout) parts.push(textOf("layout", f) || demoOf("layout"));
    if (style) parts.push(style);

    if (pal) {
      var hex = pal.hex || "";
      if (isZh) {
        parts.push(pal.mood ? ("整体色调：" + pal.mood) : "");
        parts.push(hex ? ("主色限定为 " + hex
          + (pal.accent ? "，仅以 " + pal.accent + " 作点缀" : "")
          + "，其余颜色一律压到接近中性") : "");
      } else {
        parts.push(hex ? ("Colour palette centred on " + hex
          + (pal.accent ? ", using " + pal.accent + " as the only accent" : "")
          + "; pull every other colour toward neutral") : "");
      }
    }

    var out = parts.filter(Boolean).join(" ");
    if (!out) return "";

    /* 画幅：默认来自版式；用户在这一屏直接选过比例时以用户的为准。
       ratio 是提示词的一部分，不是元数据——
       告诉模型「3:4 竖构图」与什么都不说，出的是两张不同的图。 */
    var ar = ratioOverride || (layout && layout.ratio) || "";
    if (ar) {
      out += isZh ? (" 画幅比例 " + ar + "。")
                  : (" Aspect ratio " + ar + ".");
    }

    /* 禁止项。版面类图型出了字基本就是废图，
       而标签版里正文那句 no text 根本不参与（MJ/SD 只吃负面词），
       所以这里必须在正文里再写一遍。 */
    var tail = [];
    tail.push(isZh
      ? "画面中不要出现任何文字、字母、标识或水印，文字一律后期自行排版。"
      : "No text, letters, signage, logos or watermarks anywhere in the frame; all lettering is to be added later in post.");
    out += " " + tail.join(" ");

    return out.trim();
  }

  /* 标签速用版：给 MJ / SD / Flux 吃逗号标签的地方。
     与正文是两个口径——标签版只取特征词，不写句子。 */
  function composeTags() {
    var segs = [];
    function push(w) {
      w = String(w || "").trim();
      if (w && segs.indexOf(w) < 0) segs.push(w);
    }
    ["theme", "layout", "style"].forEach(function (k) {
      var e = entryOf(k);
      if (!e) return;
      /* 走 tagsOf 而不是 e.kw：工作室层的原始 kw 里混着
         「studio ghibli」「miyazaki style」这类标识词，
         直接进标签版等于把 R2 标识写进正文。
         tagsOf 会换成去标识后的纯特征词。 */
      var kw = tagsOf(k);
      var flat = [];
      kw.forEach(function (x) {
        String(x).split(/[,/]/).forEach(function (y) {
          y = y.trim(); if (y) flat.push(y);
        });
      });
      flat.slice(0, 6).forEach(push);
    });
    var pal = entryOf("palette");
    if (pal) {
      (pal.kw || []).slice(0, 4).forEach(push);
      if (pal.hex) push(pal.hex + " dominant palette");
    }
    var lay = entryOf("layout");
    if (lay && lay.ratio) push("aspect ratio " + lay.ratio);
    ["masterpiece", "best quality", "high resolution"]
      .forEach(function (w) { if (segs.length < 24) push(w); });
    ["text-free", "no watermark", "no signature"].forEach(push);
    return segs.join(", ");
  }

  /* ---------- 负面词 ----------
     直接调 PROMPT_KIT.buildCard()——那是全库唯一的负面词出口，
     里面已经做了「基底 + 画质档追加 + 去重」三步。
     自己另编一套必然与它漂移（之前就发生过：
     NEG_BASE 缺文字抑制词，标签版全库出废图）。
     画风与题材都选中时取画风的档位——同一次出图只能有一个画质档，
     取第二个会让档位与实际画面性质对不上。 */
  function negatives() {
    var e = entryOf("style") || entryOf("theme");
    var k = PZK();
    if (e && k && typeof k.buildCard === "function") {
      try {
        var r = k.buildCard(e, SEC_OF[segOf(e.id)] || "styles");
        if (r && r.neg) return r.neg;
      } catch (e2) { /* 基底不可用时用下面的兜底 */ }
    }
    if (k && k.NEG_BASE) return k.NEG_BASE;
    return "watermark, logo, signature, text, letters, lettering, typography, caption, subtitle, annotation, label";
  }

  /* 画质档信息：界面要显示「为什么是这个档」，
     否则用户判断不出画面性质，就会觉得负面词是乱加的。 */
  function tierOf() {
    var e = entryOf("style") || entryOf("theme");
    var k = PZK();
    if (e && k && typeof k.buildCard === "function") {
      try {
        var r = k.buildCard(e, SEC_OF[segOf(e.id)] || "styles");
        return r ? { tier: r.tier, zh: r.tierMeta && r.tierMeta.zh, hit: r.tierHit,
                     note: r.tierMeta && r.tierMeta.note,
                     quality: r.tierMeta && r.tierMeta.quality } : null;
      } catch (e2) { return null; }
    }
    return null;
  }

  /* ---------- 完整性诊断 ----------
     缺哪一步、缺了会怎样。这里必须说人话，
     不能只标一个「不完整」让人自己猜。 */
  var WHY = {
    style:   "没有画风：模型会按题材自己挑默认画法，同一个题材连出十张差别很大。",
    theme:   "没有题材：画风与版式没有承载对象，只能画成一张泛用的插画。",
    layout:  "没有版式：画面会居中平铺，信息没有分布，社媒图与信息图基本不可用。",
    palette: "没有配色：颜色由题材与画风偶然决定，整幅不会有统一的色调。"
  };

  function diagnose() {
    var miss = [];
    STEPS.forEach(function (s) {
      if (!S[s.key]) miss.push({ step: s.key, zh: s.zh, why: WHY[s.key], required: !!s.required });
    });
    /* 两级就够：少一两步是「需要微调」，缺一半以上是「不成立」。
       分三档以上会让用户以为每种缺法要分别处理，实际上处理方式一样。 */
    var grade = miss.length === 0 ? "ok" : (miss.length <= 2 ? "tune" : "conflict");
    var ready = partsReady();
    return {
      missing: miss, grade: grade, complete: miss.length === 0,
      ready: ready.count > 0, readyCount: ready.count, total: STEPS.length
    };
  }

  /* 能不能出图：至少要有一个环节选中。
     全空时 compose() 返回空串，界面必须显示引导而不是一块空白框。 */
  function partsReady() {
    var n = 0;
    STEPS.forEach(function (s) { if (S[s.key]) n++; });
    return { count: n, total: STEPS.length };
  }

  /* ---------- 授权 ---------- */
  /* 只查画风与题材两层的授权：版式与配色是本库原创描述，
     结构性 R0，不需要提示。作品层不在工作流里（R3，另开一栏说明）。 */
  function rightsSummary() {
    var out = [];
    var rt = RT();
    if (!rt || typeof rt.inspect !== "function") return out;
    ["style", "theme"].forEach(function (k) {
      var e = entryOf(k);
      if (!e) return;
      var r = rt.inspect(e);
      if (!r) return;
      var T = rt.TIERS && rt.TIERS[r.tier];
      out.push({ step: k, id: e.id, zh: e.zh, tier: r.tier,
                 tierZh: T ? T.zh : "", reason: r.reason,
                 rule: T ? T.rule : "", requirement: T ? T.requirement : "" });
    });
    return out;
  }

  /* 当前选择里有没有需要处理的档位。
     R2/R3 必须在界面上说清「要先做什么」，不能只给一个标签。 */
  function rightsFlags() {
    return rightsSummary().filter(function (r) { return r.tier !== "R0"; });
  }

  /* ---------- 预设 ----------
     四步各给一个常用组合，让用户第一次进来就能看到完整成品，
     而不是面对四个空下拉框。 */
  var PRESETS = [
    { name: "小红书观点卡", tip: "赛璐璐人物 · 上下图文卡 · 经典蓝",
      s: { style: "A1-01", theme: "G-20", layout: "LT-01", palette: "PL-01" } },
    { name: "电影分镜", tip: "数码柔光 · 对角切割分镜 · 普鲁士蓝",
      s: { style: "A1-02", theme: "G-13", layout: "LT-15", palette: "PL-04" } },
    { name: "电商主图", tip: "厚涂质感 · 单品主图 · 奶油黄",
      s: { style: "A1-03", theme: "G-23", layout: "LT-23", palette: "PL-06" } },
    { name: "角色设定页", tip: "半写实 · 角色三视图 · 青灰",
      s: { style: "A1-06", theme: "G-02", layout: "LT-19", palette: "PL-10" } },
    { name: "活动海报", tip: "浮世绘木版画 · 隐喻主视觉 · 墨黑金",
      s: { style: "A1-10", theme: "G-32", layout: "LT-28", palette: "PL-07" } }
  ];

  function applyPreset(p) {
    if (!p || !p.s) return;
    STEPS.forEach(function (s) { S[s.key] = p.s[s.key] || ""; });
  }

  /* ---------- 随机组合已搬走 ----------
     原来这里有一套 rollIds/rollOne，用来给抽卡随机四步。
     现在抽卡是独立的一屏（assets/gacha.js），那套逻辑整体搬了过去，
     **这里不再保留第二份**：两套随机逻辑的差异不会报错，
     只会在「抽到组合的重复率」「锁定行为」这些地方慢慢分叉，
     而两边看起来都正常。

     composeWith 留在这里：它是「用指定组合出正文」，
     属于工作流自己的能力（抽卡也要用它），不是抽卡的专属逻辑。 */

  /* 用一组临时选择调 compose，然后还原 S。
     不用「先写 S 再还原」以外的办法：compose 内部有十几处 entryOf/tagsOf，
     另写一套按 ids 取值的分支必然漏掉去标识、画幅、画质档这几处，
     而漏掉的那几处都是「不报错只是效果不对」的地方。 */
  function composeWith(ids, lang, ratioOverride) {
    if (!ids) return "";
    var bak = { style: S.style, theme: S.theme, layout: S.layout, palette: S.palette };
    STEPS.forEach(function (s) { S[s.key] = toOldId(ids[s.key] || ""); });
    try {
      return compose(lang, ratioOverride);
    } finally {
      S.style = bak.style; S.theme = bak.theme;
      S.layout = bak.layout; S.palette = bak.palette;
    }
  }

  return {
    STEPS: STEPS,
    S: S,
    PRESETS: PRESETS,
    reset: reset,
    pick: pick,
    applyPreset: applyPreset,
    /* styleCraft 导出给 assets/model-prompts.js：
       它内部处理了「只取技法不取场景」「desc/note 拼装」「缺字段兜底」
       三件事。适配层要画风的**技法描述**，如果它自己写一遍，
       漏掉任一处都不会报错 —— 只是那一层画风在五个模型里悄悄变空。 */
    styleCraft: styleCraft,
    composeWith: composeWith,
    candidates: candidates,
    groupBy: groupBy,
    allEntries: allEntries,
    entryOf: entryOf,
    byId: byId,
    codeOf: codeOf,
    codeOfEntry: codeOfEntry,
    labelOf: labelOf,
    labelOfEntry: labelOfEntry,
    tagsOf: tagsOf,
    demoOf: demoOf,
    textOf: textOf,
    compose: compose,
    composeTags: composeTags,
    negatives: negatives,
    tierOf: tierOf,
    diagnose: diagnose,
    partsReady: partsReady,
    rightsSummary: rightsSummary,
    rightsFlags: rightsFlags,
    segOf: segOf
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { STUDIO: STUDIO };

