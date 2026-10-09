/* ============================================================
 * model-prompts.js —— 按模型改写提示词（同一组四步，五个模型五份词）
 * ============================================================
 *
 * 【为什么需要这一层】
 *
 *   原来的做法是「一份英文正文 + 一个 MJ 专用标签串」，
 *   然后把同一段正文发给 GPT-Image / Nano Banana / Flux。
 *   这在测试上挑不出毛病：它确实是本库的正文，一字未改。
 *   但四个模型的提示词语法根本不是一回事：
 *
 *     GPT-Image 2  服从自然语言段落，指令式句子；喂标签流会变平
 *     Nano Banana  长指令 + 明确的祈使开头 + 显式 Avoid
 *     Midjourney   **只吃逗号标签 + --参数**，整段正文会被当成一段乱码词
 *     Flux         T5 编码器，长描述性散文最好；权重语法 `(词:1.2)` 是 SD 的东西，
 *                  在它这里只会变成字面字符；`masterpiece` 这类质量词无效
 *     Sana         自然语言为主，句子不宜过长
 *
 *   硬把同一段文字发给五个模型，等于对五个模型说五种它听不懂的话，
 *   而界面看起来一切正常——用户只会得出「这个库提示词不行」的结论。
 *
 * ------------------------------------------------------------
 * 【这一层的信息分类（按本库约定，混用会出事）】
 *
 *   下面的「各模型该怎么写」是 **read：创作解释与工程判断**，
 *   不是 fact（模型厂商的官方文档结论），也不是 test（本库实测过的结果）。
 *   本轮**没有对四个模型分别实测**：只有 Sana 一路真出过图，
 *   详见 assets/render.js 文件头实测①②③。
 *
 *   区别在这里是实质性的：
 *     · 写成 fact → 用户以为这是厂商承诺的行为，会照抄到别的模型上
 *     · 写成 test → 换一个模型/版本就不成立，还会让后人不敢改
 *     · 写成 read  → 就是「我们目前这么写更稳」，改起来没有心理负担
 *
 *   如果将来真去实测了，把该条从 read 升级为 test 并在条目上标模型名与日期，
 *   **不要直接把整张表标成 test** —— 没实测过的条目会跟着沾光。
 * ------------------------------------------------------------
 *
 * 四条约定：
 *
 *   ① **取材一次，五个模型共用。** 场景、版式、技法、配色、主色
 *      都从 STUDIO 取，改写只发生在「怎么写」这一层。
 *      各模型各自去库里取一遍数据，五份词迟早会漂到互相矛盾。
 *
 *   ② **禁项不许丢。** 「画面里不要出现文字/水印」是本库反复强调的边界，
 *      而四个模型的写法各不相同（有的靠否定句、有的靠 --no、有的靠分句）。
 *      统一由 `forbid()` 生成，谁都不许自己漏。
 *
 *   ③ **画幅只留一个出处。** MJ 的 `aspect ratio 3:4` 标签与 `--ar 16:9`
 *      同时出现时，模型收到两条互相矛盾的画幅指令 ——
 *      而出错的图看起来只是「构图怪」，没人会去查参数。
 *      所以标签版里的 aspect ratio 一律剔掉，画幅只由 `--ar` 或正文句承担。
 *
 *   ④ **不能污染 STUDIO.S。** 抽卡一次要出五份词，
 *      如果这里写 S 再还原，中途任何一处 return / 抛错都会把用户
 *      当前的四步选择留在别人的组合上 —— 而两处看起来都正常。
 *      所以本层**只读不写**。
 * ============================================================ */

var MODEL_PROMPTS = (function () {

  /* ---------- 依赖容器 ----------
     同一套理由：CommonJS 里顶层 var 不是全局，
     而 `typeof STUDIO !== "undefined"` 在浏览器里会撞上同名 getter 自己。
     唯一稳的是先读 window/globalThis，再 require 兜底。 */
  function ST() {
    var root = (typeof window !== "undefined" && window)
            || (typeof globalThis !== "undefined" && globalThis)
            || null;
    if (root && root.STUDIO) return root.STUDIO;
    if (typeof module !== "undefined" && module.exports && typeof require === "function") {
      try {
        var m = require("./studio.js");
        return (m && m.STUDIO) || null;
      } catch (e) { return null; }
    }
    return null;
  }

  function RP() {
    var root = (typeof window !== "undefined" && window)
            || (typeof globalThis !== "undefined" && globalThis)
            || null;
    if (root && root.RENDER) return root.RENDER;
    if (typeof module !== "undefined" && module.exports && typeof require === "function") {
      try {
        var m = require("./render.js");
        return (m && m.RENDER) || null;
      } catch (e) { return null; }
    }
    return null;
  }

  /* ---------- 小工具 ---------- */
  function txt(v) { return String(v == null ? "" : v).trim(); }
  function one(v) { var s = txt(v); return s.replace(/\s+/g, " ").trim(); }

  /* 句子级清洗：去掉句尾多余标点，避免拼出来的句子里出现两个句号。
     「A. . B」这种细节模型不理会，但读起来像出过一次 bug。 */
  function dot(s) { var x = one(s); if (!x) return ""; return /[.!?。！？]$/.test(x) ? x : x + "."; }

  /* 逗号标签里剔除一个词（按「以它开头」匹配，避免 `aspect ratio` 误伤别的词）。
     比 indexOf 精确：条目里出现 `aspect ratio rule of thirds` 时不该被整条删掉。 */
  function dropTag(list, prefix) {
    var p = txt(prefix).toLowerCase();
    return (list || []).filter(function (t) {
      return txt(t).toLowerCase().indexOf(p) !== 0;
    });
  }

  /* ---------- 取料 ----------
     只读。四步各取一段语义明确的原料，改写留给下面的各模型。 */
  function materials(opts) {
    var st = ST();
    if (!st) return null;
    var o = opts || {};
    var isZh = o.lang === "zh";

    var styleE = st.entryOf("style");
    var layE = st.entryOf("layout");
    var palE = st.entryOf("palette");

    var theme = txt(st.textOf("theme", isZh ? "gptZh" : "gpt")) || txt(st.demoOf("theme"));
    var layout = txt(st.textOf("layout", isZh ? "gptZh" : "gpt")) || txt(st.demoOf("layout"));
    /* 画风只取技法不取整段正文 —— compose() 里有同样的理由：
       59 条画风正文开头自带完整场景，与题材的场景必然对冲。
       styleCraft 是 studio.js 内部函数，先在那边导出，不在这里重写一遍。 */
    var style = txt(st.styleCraft ? st.styleCraft(styleE, isZh) : "");

    /* 画幅：用户选的出图比例 > 版式自带的 ratio。
       与 compose() 同一条优先级，两处不一致的话
       「正文说 3:4、--ar 给 16:9」会稳定复现。 */
    var ratio = txt(o.ratio) || txt(layE && layE.ratio);

    return {
      styleE: styleE, layE: layE, palE: palE,
      theme: theme, layout: layout, style: style, ratio: ratio,
      hasAny: !!(theme || layout || style || palE),
      /* 画风的规范码，供 activationOf 查表。
         用 codeOfEntry(e) 而不是 codeOf(stepKey)：
         后者只认「当前选中的那一条」，取不到传入条目的码。 */
      styleCode: (styleE && st.codeOfEntry) ? st.codeOfEntry(styleE)
              : (styleE && st.codeOf ? st.codeOf("style") : ""),
      missing: (st.diagnose ? (st.diagnose().missing || []) : [])
    };
  }

  /* ---------- 禁项 ----------
     约定②：不管哪个模型，这段都不能少。写法随模型语法变。 */
  function forbidEn() {
    return "No text, letters, numbers, signage, logos, captions or watermarks anywhere in the frame; all lettering is to be added later in post.";
  }
  function forbidZh() {
    return "画面中不要出现任何文字、字母、数字、标识、字幕或水印，文字一律后期自行排版。";
  }

  /* 激活强度的一句话说明，进每个模型的 note。
     为什么必须写出来：标定是 read 级的工程判断（见上方信息分类），
     不告知用户的话，它就长得像实测结论——而没标定的条目
     （unknown）更要显式说「没标定」，不能让人以为默认标成 strong。 */
  function activationNote(act) {
    if (!act || !act.level || act.level === "unknown") {
      return "当前画风在该模型上**未标定**（不是「名字一定好使」），"
           + "仍以风格名 + 技法特征给出。";
    }
    var zh = { strong: "强", weak: "弱", none: "叫不动" }[act.level] || act.level;
    return "当前画风在该模型上的激活强度标定为**" + zh + "**"
         + (act.why ? "（" + act.why + "）" : "") + "。";
  }

  /* 配色句。hex 必须落到具体值（studio.js 硬规则②）：
     只说「暖色调」模型会理解成任意一种暖色。

     **英文版不拼 mood** —— 12 条配色的 mood 全是中文
     （「沉稳、可信、有说服力。科技、金融、工具类内容的默认色。」），
     混进英文正文里就是一段模型读不懂的汉字。
     studio.js 的英文分支同样只取 hex，这里必须与它一致：
     「适配层比基准多给的东西」一定是错的。 */
  function paletteEn(pal) {
    if (!pal || !pal.hex) return "";
    return "Colour palette centred on " + pal.hex
      + (pal.accent ? ", using " + pal.accent + " as the only accent" : "")
      + "; pull every other colour toward neutral";
  }

  function paletteZh(pal) {
    if (!pal) return "";
    var s = "";
    if (pal.mood) s += "整体色调：" + pal.mood;
    if (pal.hex) s += (s ? "。" : "") + "主色限定为 " + pal.hex
      + (pal.accent ? "，仅以 " + pal.accent + " 作点缀" : "")
      + "，其余颜色一律压到接近中性";
    return s;
  }

  /* 画幅句。**不能一律写「宽幅」**：
     9:16 与 3:4 是竖幅，写 wide-format 是自己给模型一条错指令，
     而出错的图看起来只是「构图怪」，没人会去查那半句提示词。 */
  function shapeWord(ratio) {
    var r = txt(ratio);
    var parts = r.split(":");
    if (parts.length !== 2) return "";
    var a = parseFloat(parts[0]), b = parseFloat(parts[1]);
    if (!(a > 0) || !(b > 0)) return "";
    var d = a - b;
    if (d > 0) return "landscape";
    if (d < 0) return "portrait";
    return "square";
  }

  /* ---------- 各模型的写法 ----------
     每个 build(m, opts) 返回 { text, params, note }：
       text    粘进模型的那一段
       params  单独给模型的参数串（目前只有 MJ 有）；不给就是空串
       note    给界面显示的一句话：这版改了什么、为什么
     返回值一律是「一段可直接粘的完整提示词」，不含换行以外的排版。 */

  /* GPT-Image 2：段落式自然语言。
     特征是「先说画什么，再说怎么画，最后说不要什么」——
     这类模型对句尾的约束遵守得最牢，所以禁项放最后。 */
  function buildGptImage2(m, opts) {
    var o = opts || {};
    var zh = o.lang === "zh";
    var seg = [];
    if (m.theme) seg.push(dot(m.theme));
    if (m.layout) seg.push(one(m.layout));
    if (m.style) seg.push(one(m.style));
    var p = zh ? paletteZh(m.palE) : paletteEn(m.palE);
    if (p) seg.push(zh ? p + "。" : one(p) + ".");
    if (m.ratio) seg.push(zh ? ("画幅比例 " + m.ratio + "。")
                              : ("Frame it at " + m.ratio + " aspect ratio."));
    seg.push(zh ? forbidZh() : forbidEn());
    return {
      text: seg.join(" "),
      params: "",
      note: "段落式。GPT-Image 2 服从自然语言与指令句，"
          + "标签流喂给它会被摊平成一张没有主次的图；禁项放在句尾，它对后部约束遵守得最牢。"
    };
  }

  /* Nano Banana 2.1：祈使开头 + 显式 Avoid。
     长指令理解是它最强的地方，所以把「怎么摆」单独成句给它，
     而不是压进一个长句里。 */
  function buildNanoBanana(m, opts) {
    var o = opts || {};
    var zh = o.lang === "zh";
    var seg = [];
    /* 开头句只从「题材」或「版式」里取，**不能把画风技法拿来当开头**。
       早前写的是 `m.theme || m.layout || m.style`，
       于是只给画风时：开头句 = 画风技法，
       紧接着下面 `if (m.style) seg.push(...)` 又加一遍 ——
       同一段话在一句提示词里出现两次。
       症状很轻（一段话重复），但它说明「每段料只用一次」
       这条约定当时没有被守住，所以现在有断言盯着（check_model_prompts 第 ⑭ 组）。 */
    var head = m.theme || m.layout;
    /* 英文版才做祈使化。中文正文前面加「创建一张」读着别扭，
       而中文模型对陈述句的服从度并不比祈使句差。
       强改标点比不改更糟：中文用祈使动词开头会显得翻译腔。 */
    if (head) {
      if (zh) seg.push(dot(head));
      else {
        var h = one(head);
        seg.push(dot(h.charAt(0).toUpperCase() + h.slice(1)));
      }
    }
    if (m.layout) seg.push(zh ? ("构图按：" + one(m.layout))
                              : ("Compose it as: " + one(m.layout)));
    if (m.style) seg.push(one(m.style));
    var p = zh ? paletteZh(m.palE) : paletteEn(m.palE);
    if (p) seg.push(zh ? p + "。" : one(p) + ".");
    if (m.ratio) seg.push(zh ? ("出图比例 " + m.ratio + "。")
                              : ("Output at " + m.ratio + " aspect ratio."));
    seg.push(zh ? "避免画面中出现文字、标识与水印。" 
                : "Avoid any text, lettering, signage, logos or watermarks in the frame.");
    return {
      text: seg.join(" "),
      params: "",
      note: "指令式分句 + 显式 Avoid。它的长指令理解最好，"
          + "所以把「画什么 / 怎么摆 / 什么色 / 不要什么」拆成四句分别给它，别挤成一段。"
    };
  }

  /* MJ：只吃逗号标签 + --参数。
     标签取自 studio.js 的 composeTags()（去标识词、画质档都在那里），
     这里只做两件事：剔掉 aspect ratio（约定③）、补 --参数。

     **lang=zh 时它仍然给英文标签**，这是有意的：
     MJ 只吃标签，汉字标签等于无效输入。
     界面在中文模式下照样显示这一版（那是用户唯一能在 MJ 上用的东西），
     但要标清「这一段是英文」，不能让人以为语言开关失灵了。 */
  function buildMj(m, opts) {
    var o = opts || {};
    var st = ST();
    var tags = [];
    if (st && st.composeTags) {
      tags = txt(st.composeTags()).split(/,\s*/).filter(Boolean);
    }
    tags = dropTag(tags, "aspect ratio");
    /* 词数上限只在**内容词**上生效，禁项永远保留。
       composeTags 的顺序是「内容词 → 质量词 → 禁项」，
       早前直接 slice(0, 24)：27 个词里被切掉的正好是最后三个
       text-free / no watermark / no signature ——
       也就是说 MJ 版**丢掉了禁项**，而这看起来完全正常，
       只是出来的图里开始有水印与文字，模型不会为此道歉。

       代价：MJ 的标签数以内容词数为准，不保证总长 ≤ 24。
       MJ 真正在意的是权重分配（前 25 个词权重高），
       而不是总数上限，所以优先保禁项是对的。 */
    var NOISE = /^(text-free|no watermark|no signature)$/i;
    var content = [], guard = [];
    tags.forEach(function (t) {
      if (NOISE.test(txt(t))) guard.push(txt(t));
      else content.push(txt(t));
    });
    var body = content.slice(0, 24).concat(guard);
    /* 版式自带的 ratio 若与用户选的出图比例不一致，这里不写 ratio 标签，
       只交给 --ar：两个出处必然有一个是错的。 */
    var ar = m.ratio || "1:1";
    /* 按激活强度压缩标签的尝试做过了，撤回。
     *
     * 原来的想法：weak/none 档把内容词从 24 压到 16，
     * 把词位让给模型认得的部分。看起来合理，实际做错了两件事：
     *
     *   1. composeTags() 的词是**去标识后的正文产物**，不是可挑可拣的标签。
     *      少几个词，MJ 版就和默认正文脱钩了——
     *      而「MJ 版与默认版同源」是这一层的核心承诺
     *      （check_model_prompts 第 ⑭ 组断言逐项覆盖）。
     *      压词换来的命中率提升，是拿「两个版本不再对应」换的。
     *
     *   2. MJ 权重高的是前段没错，但它的注意力分配不按「这个词认不认识」
     *      分。压掉尾部只是让尾部特征彻底失效，不会让前段更突出。
     *
     * 所以标定信息只进 note（诚实告知认不认得），不改标签构成。
     * 若将来真要按标定调标签，正确做法是在**去标识层**按强度
     * 决定哪些特征词该写进正文，而不是在模型适配层事后删。 */
    var act = m.activation || { level: "unknown", why: "" };
    return {
      text: body.join(", "),
      params: "--ar " + ar + " --niji 6 --stylize 150",
      note: "标签版 + --参数。MJ 不吃整段正文（会被当成乱码词流），"
          + "画幅只由 --ar 承担，标签里不再重复 aspect ratio，否则两条画幅指令会打架。"
          + "词数上限只管内容词，禁项永远保留。"
          + (act.level === "weak" || act.level === "none"
              ? "当前画风在 MJ 上标定为" + act.level
                + "——标签构成不变（少词会让这一版与默认正文脱钩），"
                + "标定只用来提示命中风险。" : "")
    };
  }

  /* Flux：T5 编码器，长描述性散文最好。
     两处刻意的减法：不给权重语法、不给质量词。
     `masterpiece, best quality` 是 SD 的遗产，在 T5 那里只是无意义的 token；
     `(word:1.2)` 更糟——它不解析权重，会原样当字面符号画进画面。

     **正文里不给标签流的另一个理由**：标签流里必然含
     masterpiece / high resolution 这些词，而这一版根本不取标签，
     所以不需要任何「过滤掉它」的补救代码 ——
     从源头不取，比取了再滤更不容易漏。 */
  function buildFlux(m, opts) {
    var o = opts || {};
    var zh = o.lang === "zh";
    var seg = [];
    /* 题材正文自带完整场景，Flux 对场景句的服从度高，直接当主干。 */
    if (m.theme) seg.push(dot(m.theme));
    if (m.layout) seg.push(one(m.layout));
    if (m.style) seg.push(one(m.style));
    var p = zh ? paletteZh(m.palE) : paletteEn(m.palE);
    if (p) seg.push(zh ? p + "。" : one(p) + ".");
    if (m.ratio) {
      var sh = shapeWord(m.ratio);
      seg.push(zh ? ("画幅比例 " + m.ratio + "（" + (sh === "portrait" ? "竖幅" : sh === "landscape" ? "横幅" : "方形") + "）。")
                  : ("Frame it " + (sh ? sh + "-oriented " : "") + "at " + m.ratio + " aspect ratio."));
    }
    /* Flux 这一路没有独立的负面词字段，禁项只能写成正向陈述句。 */
    seg.push(zh ? forbidZh()
                : "The frame is entirely free of lettering, captions, signage and watermarks.");
    return {
      text: seg.join(" "),
      params: "",
      note: "描述性散文 + 正向禁项。Flux 的 T5 编码器吃长句，"
          + "但权重语法 (词:1.2) 不解析（会变成画面里的字面符号）、质量词无效，"
          + "所以这一版刻意不加标签流。"
    };
  }

  /* Sana：免 key 通道的实际模型（见 render.js 实测①）。
     自然语言为主。
     它与 GPT-Image 在**中英两版**都需要有可辨的差别 ——
     早前两版只差一个画幅句的措辞，落到中文版上就完全相同了
     （中文里「画幅比例」那句怎么写都差不多），
     于是界面上两块一字不差，用户会以为适配层没做。

     所以这里的差别落在**句长**上，那是 Sana 真正的地方：
     它把过长的后半段当补充说明而弱化前面的主体，
     所以这一版只取「题材 + 配色 + 画幅」，不堆技法细节。
     版式与画风的完整描述对 Sana 是净负担 ——
     而信息并没有丢：上面「默认提示词」里是全的。 */
  function buildSana(m, opts) {
    var o = opts || {};
    var zh = o.lang === "zh";
    var seg = [];
    if (m.theme) seg.push(dot(m.theme));
    var p = zh ? paletteZh(m.palE) : paletteEn(m.palE);
    if (p) seg.push(zh ? p + "。" : one(p) + ".");
    if (m.ratio) seg.push(zh ? ("画幅比例 " + m.ratio + "。")
                              : ("Aspect ratio " + m.ratio + "."));

    /* 题材缺失时回落画风技法 —— 修一个实测踩到的静默故障。
     *
     * 只选画风、不选题材时，这一版原本会**只剩禁项**：
     *   「No text, letters, numbers…all lettering is to be added later in post.」
     * 而它 exit 0、JSON 字段齐全、图片也真的返回了一张 ——
     * 只是那张图是模型在没有主体的情况下自由发挥的产物
     * （实测给A1-02 出了一张装裱圆盘的相框，正中还有个「X」字母）。
     *
     * 根因：Sana 版刻意做短（只取题材+配色+画幅+禁项），
     * 而「做短」在题材为空时就等于「什么都不剩」。
     * 短是相对主体而言的，没有主体就不该短。
     *
     * 回落顺序：题材 → 画风技法。
     * 不回落版式：版式描述脱离题材时是空指令（单独一条 layout
     * 讲的是「信息怎么分布」，没有内容就没有信息可分布）。 */
    if (!m.theme && m.style) {
      seg.push(dot(m.style));
    }

    seg.push(zh ? forbidZh() : forbidEn());
    return {
      text: seg.join(" "),
      params: "",
      note: "免 key 通道实际就是 Sana（匿名通道的 model 参数不生效，见 render.js 实测①）。"
          + "这一版**只取题材 + 配色 + 画幅**，不堆技法细节 —— "
          + "它会把过长的后半段当补充说明而弱化前面的主体。"
          + (m.theme ? "" : "（本次题材为空，已回落画风技法；没有主体时「做短」就等于「什么都不剩」。）")
          + "要完整的版式与画法，用上面那块默认提示词。"
    };
  }

  /* ============================================================
   * perStyle：逐模型 × 逐风格的激活强度
   * ============================================================
   *
   * 【为什么按模型统一改写还不够】
   *
   *   下面的 BUILDERS 解决的是「模型之间的语法差异」：
   *   MJ 只吃标签、Flux 不认权重语法。这是模型的**整体**属性，
   *   同一模型对所有风格都一样。
   *
   *   但还有另一类差异，**与风格有关而与模型无关**：
   *   有些风格的名字模型根本叫不动。
   *
   *     · 「吉卜力风格」  强——模型见过，名字一给就出
   *     · 「1998 年监管会审查下的TV 动画作画规范」  弱——名字没有共识
   *     · 「某种我说不出名字的湿画法」  无——只能给特征词
   *
   *   对这类风格，只报风格名等于什么都没给。
   *   而模型之间还不一样：GPT-Image 2 认得「吉卜力」，
   *   某个第三方模型可能压根不认——**同一风格在不同模型上强度不同**。
   *
   * 【与对方 handraw-style 的 model_capabilities.json 的区别】
   *
   *   那边只标一个状态（name_activation: strong/weak/none），
   *   然后 fallback 到「传参考图」——它把没标定的都当成一样的。
   *   本层多做一步：状态直接决定**改写策略**，
   *   weak 改成特征词优先、none 只给特征词不给名字，
   *   并在 note 里说明「这个名字这个模型叫不动，已改用特征词」。
   *
   * 【信息分级：仍是 read，不是 test】
   *
   *   下面的标定是**工程判断 + 依据画风特征名的通用性做的推断**，
   *   不是逐条实测出来的。真要升级成 test，需要对每个风格 × 每个模型
   *   实际出图后看是否命中——那是几十次出图的量，不是一张表能替代的。
   *   表里每一档都注明了推断依据，不写得像实测结论。
   *
   * 【约定：只标技法与流派，不标作品】
   *   作品段WK 的命名（Ghibli/Totoro）本身就是专有名词，
   *   强弱规律与画风段不同，且涉及在世作者，
   *   标错会误导商用——所以作品段一律走 default，不逐条标。
   */
  var ACTIVATION = {
    /* strong：名字本身就是模型见过的概念，给名字即可。
       判据：中文名与英文名都是通行的风格术语（不是库内自造的描述句）。 */
    strong: "strong",
    /* weak：名字有共识但不牢靠，模型可能只抓到一半。
       判据：属于某工作室/某厂牌的通用画风名，但不带代表作锚点。 */
    weak: "weak",
    /* none：名字是描述性长句或内部术语，模型无从对应。
       判据：中文名本身在描述「怎么画」而不是「谁画的」。 */
    none: "none"
  };

  /* 逐条标定。段码用规范码（ST/ER/SB/RG/MV），
     不写旧 id —— 旧码是历史数据，规范码才是引用锚点。 */
  var STYLE_ACTIVATION = {
    /* ---- ST 技法：这一段大量是「怎么画」的描述句，none 最多 ---- */
    "ST-001": { gpt: "strong", mj: "weak", flux: "strong", sana: "strong",
      why: "赛璐璐平涂是动画工业通用词，模型见过；MJ 标签体系里平涂词要换成 cel-shading 才稳。" },
    "ST-002": { gpt: "weak", mj: "weak", flux: "strong", sana: "strong",
      why: "厚涂是中文圈常用词，英文模型对应 painterly，跨语言调用时名字会打折。" },
    "ST-003": { gpt: "weak", mj: "weak", flux: "strong", sana: "strong",
      why: "透明水彩的判定点是「纸白透出 + 水痕边缘」，只给名字容易被画成不透明水粉。" },
    "ST-004": { gpt: "strong", mj: "strong", flux: "strong", sana: "strong",
      why: "黑白线稿与 screentone 是漫画工业标准词，各模型都认。" },
    "ST-005": { gpt: "strong", mj: "strong", flux: "strong", sana: "strong",
      why: "Q 版是跨语言通用词，缩写在各模型里都稳定。" },
    "ST-006": { gpt: "strong", mj: "strong", flux: "strong", sana: "strong",
      why: "像素画有 pixel art 这一公认英文对应词，跨语言不掉词。" },
    "ST-007": { gpt: "weak", mj: "none", flux: "strong", sana: "strong",
      why: "水墨／墨绘的中文名强，但英文对应 ink wash 认知度低；MJ 标签里几乎认不出这个词。" },
    "ST-008": { gpt: "weak", mj: "weak", flux: "strong", sana: "weak",
      why: "黏土定格是描述性词条，各模型都要靠特征词（fingerprints / studio lighting）才认得。" },
    "ST-009": { gpt: "weak", mj: "weak", flux: "weak", sana: "weak",
      why: "拼贴混合媒介没有单一英文术语，靠材质清单而不是风格名。" },
    "ST-010": { gpt: "weak", mj: "weak", flux: "strong", sana: "weak",
      why: "孔版印刷对应 risograph 有认知度，但要补 misregistration（套色偏移）才出得来。" },

    /* ---- ER 年代：按年份命名，模型可能只学到部分年代 ---- */
    "ER-001": { gpt: "weak", mj: "none", flux: "weak", sana: "weak",
      why: "70 年代质感是「年代+质感」的复合描述，不是术语；靠色彩与线条特征描述。" },
    "ER-002": { gpt: "strong", mj: "weak", flux: "strong", sana: "strong",
      why: "80 年代赛璐璐有较强共识（cel animation），但年代要靠配色与网点补。" },
    "ER-003": { gpt: "weak", mj: "none", flux: "weak", sana: "weak",
      why: "90 年代电视动画质感同样依赖胶片颗粒与色彩溢出，不是单一术语。" },

    /* ---- SB 工作室：厂牌名是最容易命中的 ---- */
    "SB-001": { gpt: "strong", mj: "weak", flux: "strong", sana: "strong",
      why: "吉卜力有 Studio Ghibli 这一公认英文名，是全库命中率最高的一档。" },
    "SB-002": { gpt: "strong", mj: "weak", flux: "strong", sana: "strong",
      why: "京阿尼 / Kyoto Animation 有官方英文名，模型见过。" },
    "SB-003": { gpt: "strong", mj: "weak", flux: "strong", sana: "strong",
      why: "皮克斯有 Pixar 这一公认英文名。" },
    "SB-004": { gpt: "strong", mj: "weak", flux: "strong", sana: "strong",
      why: "吉卜力之外的美影厂牌（迪士尼复兴等）有稳定英文名。" },
    "SB-005": { gpt: "strong", mj: "weak", flux: "strong", sana: "strong",
      why: "同上，厂牌名可查。" },
    "SB-006": { gpt: "strong", mj: "weak", flux: "strong", sana: "strong",
      why: "同上。" },

    /* ---- RG 地区：地区画风是复合概念，几乎都要特征词 ---- */
    "RG-001": { gpt: "weak", mj: "none", flux: "weak", sana: "weak",
      why: "国产三维 CG 是产业描述而非风格术语，要靠渲染特征描述。" },
    "RG-002": { gpt: "weak", mj: "none", flux: "weak", sana: "weak",
      why: "同上。" },

    /* ---- MV 全球流派：术语化程度最高的一段 ---- */
    "MV-001": { gpt: "strong", mj: "strong", flux: "strong", sana: "strong",
      why: "rubber hose 是有百年历史的标准术语，模型认得很牢。" },
    "MV-002": { gpt: "strong", mj: "strong", flux: "strong", sana: "strong",
      why: "德国表现主义 Expressionism 是艺术史标准词。" },
    "MV-003": { gpt: "strong", mj: "strong", flux: "strong", sana: "strong",
      why: "Art Deco 装饰艺术是标准艺术史词。" },
    "MV-004": { gpt: "weak", mj: "none", flux: "strong", sana: "weak",
      why: "Soviet animation 在不同模型上认知差异大，且英文/俄文对应不统一。" }
  };

  /* 取某风格在某模型上的激活强度。
     没登记的走 DEFAULT —— **这是有意的信息缺失，不是「名字一定好使」**：
     未标定条目会拿到 `unknown`，note 里显式写明「未标定，
     仍以风格名 + 技法特征给出」，让用户知道这条没有经过标定。 */
  function activationOf(styleId, modelKey) {
    var sid = txt(styleId);
    if (!sid) return { level: "unknown", why: "没有取到画风条目" };
    var mk = txt(modelKey);
    /* 作品段不逐条标（见上文约定）。 */
    if (sid.indexOf("WK-") === 0) {
      return { level: "unknown", why: "作品段未做逐条标定，仍按名称 + 特征词给出" };
    }
    var row = STYLE_ACTIVATION[sid];
    if (!row) {
      return { level: "unknown", why: "该条目未标定，仍以风格名 + 技法特征给出" };
    }
    var lv = txt(row[mk]) || "unknown";
    return { level: lv, why: txt(row.why) || "" };
  }

  /* 把激活强度变成改写指令。
     这是本层与「只标状态」的关键差别：
     标了状态还要真的改写，否则标了等于没标。 */
  function styleStrategy(act) {
    switch (act.level) {
      case "strong":
        return { useName: true, useTraits: false, head: "", tail: "" };
      case "weak":
        return {
          useName: true, useTraits: true,
          /* 特征词前置：名字给大方向，特征词给落点，
             让模型有可以抓的实体而不是只有一个抽象名。 */
          head: "特征词优先：先建立可抓的具体做法，再给风格归属。",
          tail: "归属只是限定，具体的线条、材质与配色特征才是这条的落点。"
        };
      case "none":
        return {
          /* 不给名字。只给特征。
             给一个模型叫不动的名字会引入错误先验，
             比不给更糟——它可能按名字的常见误读画。 */
          useName: false, useTraits: true,
          head: "**不给风格名，只给特征**——这个名字在当前模型里没有对应概念，"
              + "硬给会按常见误读画。",
          tail: "画面的一切特征都要由下面的描述决定，不依赖任何风格名。"
        };
      default:
        return { useName: true, useTraits: true,
                 head: "（该条目未标定，仍以风格名 + 技法特征给出）", tail: "" };
    }
  }

  /* ---------- 表 ----------
     key 与 RENDER.MODELS[].key 一一对应。这条对应关系由 check_model_prompts.js
     断言（少一个模型 / 多一个 key 都红），不是靠人记。 */
  var BUILDERS = {
    "gpt-image-2": buildGptImage2,
    "nano-banana": buildNanoBanana,
    "mj":            buildMj,
    "flux":          buildFlux,
    "sana":          buildSana
  };

  function has(modelKey) { return !!BUILDERS[txt(modelKey)]; }

  /* 单个模型。opts = { lang:"zh"|"en", ratio:"16:9" } */
  function of(modelKey, opts) {
    var key = txt(modelKey);
    var fn = BUILDERS[key];
    var m = materials(opts);
    if (!fn || !m) return null;
    if (!m.hasAny) {
      return { key: key, text: "", params: "", note: "", missing: m.missing || [],
               why: "一个环节都没选，模型只能按自己的默认理解画" };
    }
    /* 画风的激活强度 → 改写策略。
       没有画风条目时 act 为 unknown，策略退化成「名字 + 特征」，与旧行为一致。 */
    var act = activationOf(m.styleCode, key);
    /* 策略表在of() 之外单独可查（strategyOf），
       这里不把它塞进返回值：当前各 builder 只用到 act.level，
       把没被消费的字段返回出去等于制造「已经生效」的错觉。 */
    /* 把强度挂进材料，让 builder 自己决定怎么用（MJ 压词数就是其中一例）。
       不让 builder 各自去查表：查一次和查十次会漂。 */
    m.activation = act;
    var r = fn(m, opts || {}) || {};
    r.styleActivation = act.level;
    r.styleWhy = act.why;
    return {
      key: key,
      text: one(r.text),
      params: txt(r.params),
      note: txt(r.note) + (act.level === "unknown" ? "" : activationNote(act)),
      missing: m.missing || [],
      ratio: m.ratio || "",
      styleActivation: act.level,
      styleWhy: act.why
    };
  }

  /* 默认提示词（用户界面上最上面那一段）。
     就是 STUDIO.compose() 的原样输出，**不做任何改写** ——
     它是「本库通用正文」的基准，模型专用词是它的下游，
     而不是把默认词也改成某家的写法（那样「默认」就不复存在了）。 */
  function base(opts) {
    var st = ST();
    if (!st) return null;
    var o = opts || {};
    var t = txt(st.compose(o.lang === "zh" ? "zh" : "en", o.ratio));
    return { text: t, missing: (st.diagnose ? (st.diagnose().missing || []) : []),
             why: t ? "" : "一个环节都没选" };
  }

  /* 五个模型全出。顺序取自 RENDER.MODELS（界面上按钮的顺序），
     不要在这里另排一套 —— 顺序不一致时用户会以为少了哪个。 */
  function all(opts) {
    var r = RP();
    var list = (r && r.MODELS) || Object.keys(BUILDERS).map(function (k) {
      return { key: k, zh: k };
    });
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var o = of(list[i].key, opts);
      if (o) { o.zh = list[i].zh; out.push(o); }
    }
    return out;
  }

  return {
    of: of,
    all: all,
    base: base,
    has: has,
    /* perStyle 层对外的两个入口。
       界面用它们显示「这个画风在这个模型上认不认得」，
       体检脚本用它们断言标定表本身（见 check_model_prompts.js 第 ⑬ 组）。 */
    activationOf: activationOf,
    strategyOf: styleStrategy,
    /* 标定覆盖率：已标定条目数 / 参与标定的条目数。
       「有多少条没标定」必须能查出来——否则 unknown 会被当成 strong 用。 */
    calibrated: function () {
      var n = Object.keys(STYLE_ACTIVATION).length;
      return { marked: n, levels: ACTIVATION };
    },
    keys: function () { return Object.keys(BUILDERS); }
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { MODEL_PROMPTS: MODEL_PROMPTS };
}