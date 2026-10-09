/* ============================================================
 * 数据层 A2：画风流派增补 —— 全球动画史中缺失的重要流派
 * 通过 STYLES.push 追加到主数组，不修改原文件
 * ============================================================ */

const STYLES_MORE = [
  { id:"A5-01", zh:"橡胶管动画（1930s）", en:"Rubber Hose Animation", cat:"全球流派",
    kw:["rubber hose","1930s cartoon","circus-like limbs","white gloves","pie eyes","black and white vintage"],
    desc:"动画史第一个程式：四肢像橡胶管任意弯曲不断，白手套、眯缝眼、爵士年代的音乐影响。2010 年代后因游戏改编而大规模复活。",
    note:"配 film grain 与 monochrome 可复刻黑白时期；配 vibrant colors 则是现代致敬版",
    demo:"cartoon character with noodle-like arms dancing, 1930s rubber hose animation, white gloves, pie-cut eyes, vintage film grain, bouncy motion, black and white" },

  { id:"A5-02", zh:"Cuphead 手绘水彩风", en:"Cuphead / Hand-Painted Watercolor", cat:"全球流派",
    kw:["cuphead style","1930s rubber hose","hand-painted watercolor cel","visible pencil lines","warm sepia vintage palette","analog paper texture"],
    desc:"把三十年代的橡皮管动画用真正的水彩逐帧画出来：纸纹可见、颜料浓淡不匀、铅笔稿线残留边缘。近年最被模仿的复古流派之一。",
    note:"关键在「纸与水的质感」，务必加 paper texture 与 visible pencil lines",
    demo:"cup-headed cartoon character running, cuphead style, hand-painted watercolor on paper, visible pencil construction lines, sepia aged palette, 1930s rubber hose limbs" },

  { id:"A5-03", zh:"清晰线条派（丁丁线）", en:"Ligne Claire / Clear Line", cat:"全球流派",
    kw:["ligne claire","clear line style","uniform line weight","flat unmodeled color","herge tintin","detailed realistic background"],
    desc:"埃尔热在《丁丁历险记》确立的欧漫学派：线条粗细完全均匀、色块平涂几乎无阴影，而背景却画得极其写实。人物简、环境繁，是它最大的反差点。",
    note:"不要加 soft shading 或 gradient，会破坏这个流派的核心——均匀线与平涂",
    demo:"young reporter with spiky hair and dog on european street, ligne claire style, uniform thin outlines, flat unmodeled colors, highly detailed realistic architecture behind" },

  { id:"A5-04", zh:"爱尔兰手绘装饰风", en:"Cartoon Saloon / Irish Ornament", cat:"全球流派",
    kw:["cartoon saloon style","irish ornament","geometric decorative flat shapes","hand-drawn chalk texture","warm earth and teal palette","celtic knot motifs"],
    desc:"爱尔兰 Cartoon Saloon 的视觉语言：角色被压成扁平几何块面，背景布满凯尔特纹样与装饰花草，配色取自中世纪手抄本。",
    note:"重点是「角色扁平、背景繁复」，写 ornamental background patterns 最有效",
    demo:"girl with wolf companion in irish forest, cartoon saloon style, flat geometric character shapes, ornate celtic decorative foliage, warm earth and teal palette, hand-drawn texture" },

  { id:"A5-05", zh:"欧式绘本水彩", en:"European Picture Book Watercolor", cat:"全球流派",
    kw:["european illustration style","loose watercolor and ink","dry brush lines","muted literate palette","whimsical proportions"],
    desc:"法国比利时一脉的童书插画：墨线松动、水彩色块溢出了轮廓，配色含蓄带灰，形体夸张但不追求精致。与日式那种一尘不染的干净正好相反。",
    note:"要有意识地让颜色「溢出」线外，写成 loose watercolor bleed",
    demo:"small figure walking through old european village in rain, european illustration style, loose ink lines with watercolor bleeding outside outlines, muted grey-blue palette" },

  { id:"A5-06", zh:"黏土定格动画", en:"Claymation / Stop Motion", cat:"全球流派",
    kw:["claymation","stop motion","clay fingerprints texture","sculpted prop proportions","practical miniature lighting","tiny set details"],
    desc:"把黏土雕像逐格拍摄：表面留下指纹与工具痕，道具比例略显笨拙，光照是真实的摄影棚光。微型场景的实体感是它区别于 CG 的根本。",
    note:"必加 practical lighting 与 miniature set，让画面呈现「实拍灯光」而非渲染光",
    demo:"clay-sculpted figure standing in tiny handmade room, claymation stop motion, visible fingerprints on clay surface, practical warm set lighting, detailed miniature props" },

  { id:"A5-07", zh:"剪影与剪纸动画", en:"Silhouette & Papercut Animation", cat:"全球流派",
    kw:["silhouette animation","paper cutout animation","lotter reiniger style","jointed paper puppets","translucent backlit layers","flat black shapes"],
    desc:"德国先驱洛特·莱尼格确立的技法：角色是铰链式黑色剪影，背景用半透明的剪纸分层背光打亮。被视为欧洲艺术动画的源头之一。",
    note:"背光是关键：写 backlit paper layers 才能出现那种通透的层叠感",
    demo:"black paper silhouette figure with jointed limbs in ancient tale scene, lotte reiniger style, translucent backlit papercut background layers, warm amber glow" },

  { id:"A5-08", zh:"有限动画现代主义", en:"UPA / Limited Animation Modernism", cat:"全球流派",
    kw:["upa style","limited animation","graphic simplified shapes","bold flat areas","modernist poster layout","distorted perspective"],
    desc:"一九五〇年代美国 UPA 工作室的反写实运动：把形体压到最少的线条、平面图形成像海报、用极少的帧表达动作。设计先于写实。",
    note:"这是后无数扁平风格的总源头，写 poster-like composition 能快速对齐",
    demo:"stylized figure leaning against off-kilter wall, upa limited animation style, simplified graphic shapes, bold flat color areas, modernist poster composition, tilted perspective" },

  { id:"A5-09", zh:"拼贴与混合媒介", en:"Collage & Mixed Media", cat:"全球流派",
    kw:["collage animation","cut paper pieces","photomontage elements","assembled textures","torn edges","unreal layered depth"],
    desc:"把报刊、布料、实景照片撕贴进画面：材质之间的接缝与撕边都保留，制造出真实与虚构交错的质感。实验动画与独立 MV 常用。",
    note:"指定 torn edges 与 mismatched textures，别追求整洁，杂乱本身就是语言",
    demo:"portrait assembled from torn magazine pieces and fabric scraps, collage animation style, visible torn edges, mismatched printed textures, surreal layered composition" },

  { id:"A5-10", zh:"孔版印刷质感", en:"Risograph Print Indie", cat:"全球流派",
    kw:["risograph print","riso print","two spot colors","misregistration offset","halftone dots texture","indie zine aesthetic"],
    desc:"孔版机印刷的独立出版物美学：只用两三个专色叠印，故意错位的套印偏移，网点与油墨不匀。近年独立动画与社媒视觉的常客。",
    note:"限定 2~3 个专色，并写 misregistration 才会有那股套印不准的味道",
    demo:"two-color illustration of figure in doorway, risograph print style, limited spot colors only, slight misregistration offset, halftone dot texture, indie zine feel" },

  { id:"A5-11", zh:"童书绘本插画", en:"Picture Book Illustration", cat:"全球流派",
    kw:["children's book illustration","soft friendly shapes","gentle hand-drawn lines","warm storybook palette","simple readable composition","cute animal characters"],
    desc:"为低龄阅读而生的画法：轮廓柔和无害、配色温暖、构图清楚到一眼看懂。与日式萌系区别在于线条更松弛、更偏手绘童趣而非工业精致。",
    note:"想做亲子绘本、教具、儿童封面时，这一层比市面上任何 anime 标签都合适",
    demo:"little fox reading under mushroom in sunny meadow, children's book illustration style, soft friendly rounded shapes, gentle ink lines, warm storybook palette" },

  { id:"A5-12", zh:"转描现实主义", en:"Rotoscoping", cat:"全球流派",
    kw:["rotoscoping","traced live action feel","oddly realistic motion","uncanny human movement","ink outline over footage","documentary texture"],
    desc:"逐帧描摹真人影像：动作格外流畅真实，却因偶尔的形变而透出隐隐的不安。常用于成人动画与实验作品。",
    note:"它自带恐怖谷感，想表达日常就配合暖色，想表达惊悚就配冷灰",
    demo:"figure walking down street drawn from live footage, rotoscoping style, uncannily fluid realistic motion, thin even ink outline, desaturated documentary palette" },

  { id:"A5-13", zh:"苏联 · 东欧手绘", en:"Soviet & Eastern European Hand-Drawn", cat:"全球流派",
    kw:["soviet animation","oil paint on glass","textured gouache","slavic folk motifs","melancholic fairy tale","multiplane depth"],
    desc:"以尤里·诺尔施泰因为代表的一脉：玻璃油画的层叠、明显厚涂的水粉背景、斯拉夫民间服饰与民歌节奏。情绪常是诗意而忧伤的童话。",
    note:"必须写 detailed oil-on-glass layers，这是它区别于日本水彩背景的核心工艺",
    demo:"small animal wandering misty autumn forest at dusk, soviet animation style, oil paint on glass layers, textured gouache trees, melancholic fairy tale mood, soft golden light" },

  { id:"A5-14", zh:"花窗玻璃与马赛克", en:"Stained Glass & Mosaic", cat:"全球流派",
    kw:["stained glass","church window","lead lines","mosaic tiles","gold leaf accents","translucent colored light"],
    desc:"中世纪教堂玻璃窗的语言：黑色铅线分割大块彩色玻璃、光从背后穿透。常用于神圣题材、历史回忆、以及宗教主题的海报构图。",
    note:"写 backlit translucent light 才有那种「透光的色」；黑线是结构线不能省",
    demo:"saintly figure rendered as church stained glass window, bold black lead lines dividing colored glass panels, backlit translucent glow, gold leaf accents, vertical arched composition" }
];

/* ============================================================
 * A5（全球流派）14 条的**唯一真源**就是本文件。
 * data-core.js 只到 A4（45 条），本文件补上 A5（14 条），
 * 两者相加 = 59 条画风，浏览器与 Node 取到的都是这个数。
 *
 * 这里是浏览器侧的追加入口（需 data-core.js 先加载）。
 * Node 侧 CommonJS 有模块作用域隔离，这条 push 不执行——
 * 所以 Node 侧取数时必须自己 concat。
 *
 * 【关键坑】两种加载方式的对称性
 *   浏览器：run data-core.js → STYLES 45 条；run 本文件 → push 后 59 条。
 *           若再自行 concat STYLES_MORE，会变成 73 条（14 条重复）。
 *   Node：  require 本文件只拿到 STYLES_MORE；必须 concat 才够 59 条。
 *   两边都必须拿到 59，重复登记会撞码、
 *   让编码解析报「命中 2 条重名」。
 *   正确姿势：浏览器只读 STYLES，Node 读 STYLES+concat(STYLES_MORE)。
 *
 * 【曾经的误判】曾以为 data-core.js 也存了这 14 条，于是删掉这条 push，
 *   结果 A5 整段消失——分组变空、14 条提示词全部变孤儿。
 *   判断依据只能是 `STYLES.filter(x=>/^A5/.test(x.id)).length === 0`，
 *   靠印象一定会搞反。
 * ============================================================ */

if (typeof module !== "undefined" && module.exports) module.exports = { STYLES_MORE };

/* 浏览器环境下直接追加到主数组（需保证 data-core.js 先加载）。
   已有同名 id 时不重复追加：万一将来两边都存了同一条，
   这里跳过而不是塞第二份——重复登记会在编码层炸出「命中 2 条重名」，
   报错点离原因很远，很难查。 */
if (typeof STYLES !== "undefined" && Array.isArray(STYLES)) {
  var __have = {};
  STYLES.forEach(function (d) { if (d && d.id) __have[d.id] = 1; });
  STYLES_MORE.forEach(function (d) {
    if (!d || !d.id || __have[d.id]) return;
    STYLES.push(d);
    __have[d.id] = 1;
  });
}
