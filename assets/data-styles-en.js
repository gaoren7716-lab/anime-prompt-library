/* 画风层的英文技法描述。
 *
 * 为什么要单独一份：
 *   条目上的 desc 是中文，而英文提示词里不能夹中文。
 *   而 59 条画风正文开头都自带完整场景（人物 + 动作 + 场景），
 *   拼进工作流时会与题材层的场景对冲——
 *   题材说「学生靠在窗边」，画风说「女生站在空教室」，模型拿到两个矛盾主体。
 *   所以工作流的画风层只出技法，不出场景，场景统一由题材层决定。
 *
 * descEn 只写「怎么画」，不写「画什么」：
 *   不出现人物、动作、场景、时代叙事。
 *   若某条不得不提到对象，也只用抽象类别（figures / architecture），
 *   且不指定数量与姿态 —— 一旦指定就又变成场景了。
 *
 * 单看一条画风时（画廊 / Markdown）仍用完整正文，
 * 那里没有题材参与，场景是示范而不是冲突。
 */

var STYLE_DESC_EN = {

  /* ---------- A1 技法 15 条 ---------- */
  "A1-01": "The classic Japanese cel logic: one flat tone for the lit side, one for the shadow side, razor-sharp boundary, almost no gradient anywhere. Large unmodulated colour blocks with a single clearly readable second shadow. This is the clean, economical finish of traditional television animation.",

  "A1-02": "The dominant commercial illustration finish since roughly 2015: flat base shading with soft gradients layered over it, airbrush-softened highlight edges, translucent skin rendering, and several separate highlight passes through the hair. Reads more dimensional and more expensive than pure cel.",

  "A1-03": "Keeps the brushstroke visible and builds volume through heavy opaque layering, so the paint itself carries the form. The thickest of the anime-family finishes; common on light-novel covers, mechanical design sheets and fantasy war subjects, at very high information density.",

  "A1-04": "Low-saturation and highly transparent, with pigment edges blooming naturally into the paper; paper grain and granulation stay visible. Mood is gentle and nostalgic, well suited to lyrical illustration and picture-book covers.",

  "A1-05": "Line weight drives the whole image — the line itself is the modelling language. A heavy outer contour against fine interior lines creates rhythm; representative of the pre-Trigger-era studio manner.",

  "A1-06": "Sits between anime and photoreal: facial proportions close to a real person (jaw slightly narrowed, eyes slightly enlarged), features detailed but not fully rendered. Typical of character design in auteur theatrical features.",

  "A1-07": "Head-to-body ratio compressed to about two or three heads, hands and feet simplified, facial features crowded into the lower half of the face. Exaggerated expression range; built for reaction images, mascots and merchandise.",

  "A1-08": "Pure black and white plus screentone dots and concentrated line, reproducing the feel of printed paper comics. Note that AI-generated lettering comes out as garbled glyphs — speech balloons must be added in post.",

  "A1-09": "Emphasises single-stroke brushwork, reserved white space, and the wet-to-dry range of the ink. Filling the whole frame with colour is the cardinal mistake here. Natively suited to wuxia, xianxia and contemplative subject matter.",

  "A1-10": "Flat colour areas, heavy black contour, and washi paper texture, with strong decorative character. Keep it distinct from Chinese classical ink wash: this one is Edo-period Japanese, and should be described as block-printed rather than brushed.",

  "A1-11": "Low-resolution grid, limited palette, ordered dithering for transitions. Every pixel is deliberately placed. Suited to retro games, landmarks and interface art.",

  "A1-12": "The subject is compressed into a single solid black or single-hue mass, read against generous empty or graded background space. Extremely strong poster quality; common in cinematic composition.",

  "A1-13": "Keeps the construction lines, repeated strokes and speckle of an unfinished draft, so the image reads like a storyboard panel or an incomplete design sheet. Strong sense of authorial hand.",

  "A1-14": "Cyan and magenta carry the key light, supported by wet-ground reflection and rim light. The most general-purpose route to a premium night look at present.",

  /* ---------- A2 年代 7 条 ---------- */
  "A2-01": "The late-70s mecha television era: orange-red biased palette, visible film grain, squat and boxy robot silhouettes, and very limited animation with few in-between frames.",

  "A2-02": "The peak of hand-drawn production from OVA boom to the end of the century: thick gouache background paintings with hard-edged cel characters on top, plus film grain throughout.",

  "A2-03": "The 90s television look: slight fade and colour bleed from 16mm transferred to tape, soft vignette corners, and economical frame counts that read as movement.",

  "A2-04": "The awkward and appealing hybrid period: characters still fully cel-shaded while bloom effects and three-dimensional assist backgrounds or mecha begin to appear, with saturation pushed high.",

  "A2-05": "The standard look after 1080p became the norm: extremely crisp linework, bright tonal range, and shadow separation expanded from one step to two. Most images that read as recent broadcast animation belong here.",

  "A2-06": "The current top-tier television standard: heavy use of digital particles, lens bloom and layered translucent FX plates, at a level close to 4K demonstration footage.",

  "A2-07": "Analogue videotape rendering: chroma bleeding between channels, horizontal tracking noise drifting through the frame, banded luminance, mild vertical roll, and colour that sits noticeably duller than the source material.",

  /* ---------- A3 工作室视觉语言 14 条 ----------
     只描述可观察的形式特征，不点名任何在世或已故创作者、工作室、品牌。
     授权口径见 references/RIGHTS.md。 */
  "A3-01": "Extremes of value contrast: near-black masses beside near-white, heavy black contour, sparse midtones, and deliberately awkward cropped framing. Figure drawing is loose and exaggerated.",

  "A3-02": "Energetic painted backgrounds with strong perspective and extensive atmospheric perspective; figures stay comparatively simple and flat. Paint application is confident and loose, with visible warm and cool separation across the whole frame.",

  "A3-03": "Soft, atmospheric, low-contrast rendering with an abundance of blown highlights and a warm-to-cool gradient running through the whole frame. Emphasises mood and light over structural clarity.",

  "A3-04": "Dense fine linework carrying most of the description, with narrow tonal range and an understated background. Detail is uniform across the frame rather than concentrated on the subject.",

  "A3-05": "Rounded, simplified figure construction with large heads and simplified limbs, paired with bright high-key colour and decorative pattern filling empty space.",

  "A3-06": "A flat, poster-like finish with strong geometric blocking, bold areas of unmodulated colour, and asymmetry used deliberately. Illustration reads as designed layout rather than as a depicted space.",

  "A3-07": "Heavy black outlines, flat fills, and a deliberately narrow, slightly desaturated palette. Faces stay simple and largely expressionless, with emotion carried by composition and colour alone.",

  "A3-08": "Dense tonal realism: full gradation, material rendering with distinct surface qualities, and lighting consistent with a real environment. Backgrounds are fully painted rather than suggested.",

  "A3-09": "Diagonal-dominant composition, extreme perspective, and speed expressed through smear frames and repeated forms. Cool, high-contrast palette with a metallic sheen on mechanical surfaces.",

  "A3-10": "Rounded forms with soft gradient shading and a bright, high-key palette; composition stays simple and centred. A clean commercial clarity well separated from painterly approaches.",

  "A3-11": "Distinctive silhouette-first design, exaggerated proportion, and small separated highlight masses. Figures read clearly even at thumbnail scale, with decorative costume detail layered on top.",

  "A3-12": "A cool, restrained palette with a dominant single hue, low overall saturation, and long soft shadows. Sparse composition that leaves large empty regions.",

  "A3-13": "Painterly backgrounds carrying elaborate real-world detail while figures stay comparatively flat and untextured, producing deliberate contrast between figure and ground.",

  "A3-14": "Smooth, glossy, high-finish rendering with a bright palette, evenly distributed light, and a strong central axis. Everything is lit clearly; nothing falls into deep shadow.",

  /* ---------- A4 地区 10 条 ---------- */
  "A4-01": "Ornate, high-density decorative treatment with abundant pattern and gilt-toned highlights, reflecting mid-Heian court painting conventions.",

  "A4-02": "Monumental, precisely constructed forms with disciplined colour and hard edges, following Northern Renaissance panel conventions.",

  "A4-03": "A palette of damp earth colours and mossy greens with low-key interior illumination, following late-medieval panel conventions.",

  "A4-04": "A soft, grainy charcoal-and-chalk rendering with compressed midtones and visible tooth of the paper, following Rococo pastel conventions.",

  "A4-05": "Precisionist clarity with luminous colour, immaculate surface finish and hard-edged industrial geometry, following American illustration of the machine age.",

  "A4-06": "Mural-scale composition with monumental figures, layered spatial recession and a warm, chalky pigment palette.",

  "A4-07": "Ukiyo-e conventions: flat colour areas, heavy contour, asymmetry, and a low diagonal viewpoint that subordinates the figure to the space.",

  "A4-08": "Restrained two-ink construction with generous reserved white, a limited pigment range, and a matte, non-reflective surface.",

  "A4-09": "Expressionistic overpainting: violent brush direction and clashing colour applied in a first pass rather than built up through careful blending.",

  "A4-10": "Realist-inflected drawing with measured tonal gradation and warm, low-chroma colour, avoiding stylisation in either direction.",

  /* ---------- A5 全球流派 14 条 ---------- */
  "A5-01": "Chinese ink-wash animation conventions: brush-driven line, ink wash gradation, reserved white space, and pigment used sparingly as local accents.",

  "A5-02": "Western television animation conventions with confident elastic posing, smear frames, and a bright, high-contrast palette.",

  "A5-03": "Hand-painted background art conventions: gouache texture, layered atmospheric recession, and no visible digital linework.",

  "A5-04": "Neon-noir animation conventions: near-monochrome base with two saturated accent hues, wet-ground reflection, and low-key lighting throughout.",

  "A5-05": "Mecha design conventions: layered mechanical plate armour, hard-surface panel lines, functional-looking joints, and a small cockpit proportion set into a large frame.",

  "A5-06": "Fantasy-race illustration conventions with decorative costume pattern, cool jewel-tone colour, and long flowing silhouette lines.",

  "A5-07": "Contemporary webtoon illustration conventions: vertical scroll rhythm, generous panel spacing, selective detail concentrated on the face, and simplified backgrounds.",

  "A5-08": "Retro printmaking conventions: limited spot colour, visible halftone or misregistration, and a paper-toned base.",

  "A5-09": "Stained-glass and mosaic animation conventions: every shape bounded by a heavy black lead line, colour held flat within each cell.",

  "A5-10": "Paper-cut and silhouette-stop-motion animation conventions: layered cut paper, visible material texture, and warm theatrical lighting with soft shadow edges.",

  "A5-11": "Mid-century advertising illustration conventions: confident single-weight contour, limited palette, exaggerated foreshortening, and a lot of empty ground.",

  "A5-12": "Contemporary digital concept-art conventions: broad value masses establishing form first, colour temperature separation between light and shadow, and selective detail only where the eye lands.",

  "A5-13": "Screen-print poster conventions: two or three flat inks, hard-edged registration, deliberately coarse halftone, and minimal tonal gradation.",

  "A5-14": "Leaded-glass animation conventions: heavy black leading bounding every element, luminous transmitted colour, and long light shafts driving through the composition."
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { STYLE_DESC_EN: STYLE_DESC_EN };
}