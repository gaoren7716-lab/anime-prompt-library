/* ============================================================
 * prompt-kit.js —— 提示词卡的派生引擎（浏览器 / Node 双用）
 *
 * 为什么要有这一层：
 *   GPT 系出图不接受逗号标签堆，需要完整自然语言；MJ/SD 系反而吃标签。
 *   人工同时维护两套容易写歪、口径不一致，因此：
 *     - 「GPT 正文」由人写，保证每个条目的画面信息密度与还原度
 *     - 「标签版 / 负面词」由这里按确定性规则派生，保证全库一致、可复现
 *
 * 双用约定：浏览器里直接 <script src>；Node 里 require
 * ============================================================ */

/* 全局收集容器：各 data-prompts-*.js 会把自己的数组推进来，须在它们之前加载 */
var PROMPT_SETS = [];

/* 注意：这里用 var 而非 const —— 浏览器 <script> 顶层的 const 不会挂到 global object，
   冒烟测试的 vm 沙箱同样取不到，会报 PROMPT_KIT is not defined */
var PROMPT_KIT = (function () {

  /* ---------- 画质收尾词：按画面性质分档 ----------
     早前只有 4 档，且 /^a2-/ 把整个年代板块一律判成做旧，
     导致「10 年代高清」「20 年代 UHD」被错标 —— 现在改为逐条按证据判定。 */
  const TIERS = {
    clean: {
      zh: "数字干净", en: "Clean Digital",
      order: 4,
      quality: "masterpiece, best quality, high resolution, ultra-detailed, official art, sharp clean lineart",
      negative: "overly smooth airbrush gradient, double outline, duplicate characters",
      note: "现代高清动画与商业插画的标准收尾，无年代倾向。",
      evidence: "默认档。当条目既无年代做旧信号，也无三维或手绘信号时落在这里。"
    },
    retro: {
      zh: "年代做旧", en: "Period Accurate",
      order: 3,
      quality: "authentic period animation cels, vintage print texture, film grain, era-accurate palette, unrestored scan",
      negative: "modern digital smooth gradients, HDR bloom, oversaturated neon, plastic 3d shading",
      note: "必须避开现代锐化词，否则胶片颗粒与旧印刷色会被洗掉。",
      evidence: "年代片、胶片、录像带、赛璐璐原稿、旧印刷、扫描件。"
    },
    painter: {
      zh: "笔触画质", en: "Painterly",
      order: 2,
      quality: "masterpiece, best quality, painterly brushwork, rich impasto texture, gallery grade illustration",
      negative: "clean vector look, flat cel shading, airbrush smoothness, photographic texture",
      note: "手绘与厚涂需要保住笔触，禁止被矢量平涂感洗掉。",
      evidence: "油画、水彩、水粉、蛋彩、蜡笔、粉笔、版画、玻璃画。"
    },
    cg: {
      zh: "三维渲染", en: "Rendered CG",
      order: 1,
      quality: "masterpiece, best quality, 8k, highly detailed 3d render, physically based materials, refined shading",
      negative: "flat 2d cel look, hand drawn line wobble, clay sculpt noise",
      note: "三维与定格需要保住体积与材质，禁止被二维平涂感覆盖。",
      evidence: "三维渲染、引擎渲染、黏土定格、低多边形、赛璐璐三维。"
    },
    print: {
      zh: "印刷网点", en: "Print & Tone",
      order: 3,
      quality: "screen printed texture, halftone dots, ink on paper, flat printed color separation, visible paper fiber",
      negative: "smooth digital gradient, airbrush softness, photographic depth of field",
      note: "漫画与版画靠网点与油墨吃饭，数字柔化会毁掉它。",
      evidence: "漫画网点、丝网印刷、木刻版画、橡皮章、拼贴、版画纸。"
    }
  };

  /* 判定证据：命中即加分，取最高分档。全部为 0 时落 clean。
     刻意不用「年代板块一律做旧」这种板块级兜底 —— A2-05、A2-06 是现代高清，
     它们和 A2-07 录像带噪波必须分开。 */
  const EVIDENCE = [
    { tier: "retro", re: /\b(vhs|vidtape|analog tape|tracking error|film grain|grainy film|vintage|aged print|yellowed|sepia|unrestored scan|archive print|period accurate|1970s|1980s|early cel|animation cel|cel scan|retro (?:style|palette|color))\b/i, w: 3 },
    { tier: "print", re: /\b(halftone|screentone|screen tone|print texture|printed|ink on paper|woodcut|linocut|engraving|etching|silkscreen|riso|risograph|collage|block print|woodblock|newspaper|manga page|monochrome print)\b/i, w: 3 },
    { tier: "painter", re: /\b(oil paint|oil painting|impasto|watercolou?r|gouache|tempera|egg tempera|crayon|colored pencil|chalk pastel|pastel|charcoal|ink wash|glass painting|oil on glass|bronze|batik|enamel|painterly|brush stroke|brushwork|illustrat(?:ion|ed) style|storybook|plate print)\b/i, w: 2 },
    { tier: "cg", re: /\b(3d render|3d model|cg render|cg donghua|unreal engine|octane render|blender|physically based|pbr render|ray traced|raytraced|low polygon|low poly|polygon picture|cel shaded 3d|3d with ink|claymation|clay sculpture|stop motion|clay fingerprint|realtime render|game engine render|volumetric render)\b/i, w: 3 }
  ];

  /* 排除项：命中则本条不算该档。比如「复古像素游戏」不是年代胶片，
     「现代水彩插画」不该被水彩二字拖进 painter 的年代语境。 */
  const VETO = {
    retro: /\b(pixel art|pixelart|8 bit|16 bit|arcade|chiptune|dense readable text|modern illustration|contemporary)\b/i,
    print: /\b(sticker sheet|emoji|ui mockup)\b/i
  };

  /* 判定：这条该走哪个画质档，并给出判定依据（供界面展示，避免「凭空标个档」） */
  function qualityTier(d) {
    const hay = [d.kw || [], [d.en], [d.zh], [d.cat], [d.grp], [d.scene]]
      .flat().filter(Boolean).join(" ");
    let best = null, bestW = 0;
    EVIDENCE.forEach(function (r) {
      if (VETO[r.tier] && VETO[r.tier].test(hay)) return;
      const m = hay.match(r.re);
      if (!m) return;
      const w = r.w + Math.min(2, (hay.match(new RegExp(r.re.source, "gi")) || []).length - 1);
      if (w > bestW) { bestW = w; best = { tier: r.tier, hit: m[0] }; }
    });
    if (!best) return { tier: "clean", hit: "无年代/三维/手绘特征", score: 0 };
    return { tier: best.tier, hit: best.hit, score: bestW };
  }

  /* 只取档位名，保持与旧调用点（字符串比较）兼容 */
  function tierKey(d) { return qualityTier(d).tier; }

  /* ---------- 负面词：基础层 + 按档追加 ----------
     文字类必须进负面基底，不能只写在 GPT 正文里。
     早前的漏项：基底只有 watermark / logo / signature，没有 text / letters，
     于是「标签速用版」直接出图时正文那句 no text 根本不参与——
     模型自由发挥写出招牌字、标题字、pose 标注字。
     漫画页要留空对白框，所以刻意**不写** speech bubble / speech balloon：
     黑白漫画页条目本来就靠气泡表达，去掉反而画出无框空白格。 */
  const NEG_BASE = "photorealistic, live-action photography, deformed hands, extra fingers, bad anatomy, mutated limbs, cross-eyed, blurry, low resolution, jpeg artifacts, text, letters, lettering, typography, caption, subtitle, annotation, label, watermark, logo, signature, cropped, framed border";

  /* ---------- GPT 正文的负向收尾句（写进正文内部，比外部负面词更可靠） ---------- */
  const CONSTRAINT_COMMON = "Keep the linework confident and intentional; no text, no logos, no watermark anywhere in the frame.";

  /* ---------- 构图建议：按板块给默认镜头，避免每次都居中 ---------- */
  function shotAdvice(d, secKey) {
    if (secKey === "genres") return "Compose it with a strong focal subject in the lower third and readable negative space around it.";
    if (secKey === "styles") return "Use this as the look for a single clearly readable subject so the technique reads at a glance.";
    return "";
  }

  /* ---------- 主函数：生成一张完整的提示词卡 ---------- */
  function buildCard(entry, secKey, gptRaw) {
    const t = qualityTier(entry);
    const T = TIERS[t.tier];
    const gpt = (gptRaw || "").trim()
      || ((entry.kw || []).slice(0, 8).join(", ") + " — 该条目尚未补写 GPT 正文，暂用标签兜底。");

    const tags = [].concat(entry.kw || []).concat(T.quality.split(", "));
    // 去重并保持顺序
    const seen = new Set();
    const tagsDedup = tags.filter(x => { const k = x.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });

    // 负面词也去重：NEG_BASE 与档位追加项可能撞车（如 watermark / logo）
    const negSeen = new Set();
    const neg = (NEG_BASE + ", " + T.negative).split(", ")
      .map(x => x.trim()).filter(x => x && !negSeen.has(x.toLowerCase()) && negSeen.add(x.toLowerCase()) !== undefined)
      .join(", ");

    return {
      tier: t.tier,            // 档位 key，字符串，便于旧调用点比较
      tierMeta: T,             // 档位完整元信息：名称、依据、注意事项
      tierHit: t.hit,          // 判定依据的具体命中词，界面上要显示给用户看
      tierScore: t.score,
      gpt: gpt,
      tags: tagsDedup.join(", "),
      neg: neg,
      shot: shotAdvice(entry, secKey)
    };
  }

  return { TIERS, EVIDENCE, NEG_BASE, CONSTRAINT_COMMON, qualityTier, tierKey, buildCard };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { PROMPT_KIT };
