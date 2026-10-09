/* 工作室层的「视觉特征名」与去标识关键词。
 *
 * 为什么要另立一套名字：
 *   条目本体叫「吉卜力（宫崎骏）」「Production I.G（押井守路线）」，
 *   那是检索索引 —— 用户搜「吉卜力」要能搜到，检索性不能丢。
 *   但这一层一旦进入出图工作流，标题里的名字就会造成误导：
 *   用户选完直接出图，看到「宫崎骏」就以为可以直接商用。
 *
 *   R2 档的处理办法是「先改写」，而改写的对象是提示词正文，
 *   不是标题。所以工作流里显示的必须是**去掉标识后的特征名**，
 *   让用户在按下出图按钮之前看到的就是安全的那个名字。
 *
 *   alt 保留工作室名与创作者名，检索仍能命中；
 *   tagsKw 是去标识后的纯特征词，可以进标签版。
 *
 * 与 rights.js 的口径一致：名称可留，正文不写标识。
 * 这里是「工作流显示名」这一层的额外收紧。
 */

var STUDIO_LOOKALIAS = {

  "A3-01": {
    look: "田园手绘背景",
    lookEn: "Pastoral Hand-Painted Background",
    tagsKw: "painterly background art, lush green fields, soft pastoral light, hand-painted scenery, warm natural palette"
  },
  "A3-02": {
    look: "柔和圆润人物",
    lookEn: "Soft Round Character Rendering",
    tagsKw: "soft round face, delicate eyes, warm pastel lighting, subtle blush, clean friendly linework"
  },
  "A3-03": {
    look: "贴片背景与文本屏",
    lookEn: "Flat Pasted Backgrounds & Text-Heavy Screens",
    tagsKw: "flat pasted backgrounds, text-heavy screen layout, extreme wide shot, head tilt, surreal composition"
  },
  "A3-04": {
    look: "体积光与数码特效",
    lookEn: "Volumetric Light & Digital FX",
    tagsKw: "digital effects, volumetric light shafts, blooming gradients, dark base with neon accents"
  },
  "A3-05": {
    look: "粗线高对比动势",
    lookEn: "Bold Line High-Contrast Action",
    tagsKw: "bold thick lines, exaggerated perspective, high contrast, limited color palette, dynamic pose"
  },
  "A3-06": {
    look: "干净机械设计",
    lookEn: "Clean Mechanical Design",
    tagsKw: "clean mechanical design, fluid animation frames, balanced lighting, crisp action lines"
  },
  "A3-07": {
    look: "电影式写实",
    lookEn: "Cinematic Realism",
    tagsKw: "cinematic realism, psychological framing, detailed urban background, measured camera"
  },
  "A3-08": {
    look: "现代暗调 gritty",
    lookEn: "Modern Dark Cinematic Grit",
    tagsKw: "dark cinematic tones, heavy grain, gritty texture, dramatic lighting, deep blacks"
  },
  "A3-09": {
    look: "重墨阴影与夸张肌肉",
    lookEn: "Heavy Ink Shadow & Exaggerated Anatomy",
    tagsKw: "heavy black shadows, thick ink lines, exaggerated muscular anatomy, gold accents, graphic pose"
  },
  "A3-10": {
    look: "橡皮管线与抽象色块",
    lookEn: "Rubber-Hose Line & Abstract Colour Blocks",
    tagsKw: "loose rubber-hose lines, abstract color blocks, fluid morphing shapes, limited rigid perspective"
  },
  "A3-11": {
    look: "冷调写实建筑",
    lookEn: "Cold Realism & Architecture",
    tagsKw: "cold realism, muted desaturated palette, architectural detail, political sci-fi, precise line work"
  },
  "A3-12": {
    look: "硬表面机甲",
    lookEn: "Hard-Surface Mecha Design",
    tagsKw: "hard surface mecha design, military color palette, mechanical detail, real-robot proportion"
  },
  "A3-13": {
    look: "现代轻改精致",
    lookEn: "Modern Light-Novel Polish",
    tagsKw: "modern light novel look, glossy hair, sharp eyes, clean commercial polish, high-key lighting"
  },
  "A3-14": {
    look: "3D 背景融合",
    lookEn: "3D Background Integration",
    tagsKw: "3DCG background integration, soft realistic lighting, warm everyday tones, depth of field"
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { STUDIO_LOOKALIAS: STUDIO_LOOKALIAS };
}