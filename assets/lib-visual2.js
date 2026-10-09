/* ============================================================
 * lib-visual2.js —— 04 视觉风格库（材质 / 空间 / 光影 / 色彩 / 完成度 / 时间质感）
 * 与 lib-visual.js 同属 04 库，因单文件写入过长会增加污染率而拆分
 * ============================================================ */

var LIB_VISUAL2 = [

/* ── 画面材质 ── */
{ id:"VS-06", lib:"04", up:"", path:"视觉风格 › 画面材质", zh:"画面材质", en:"Surface Texture", desc:"承载画面的那一层物质感。" },
{ id:"VS-06-1", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 纸张", zh:"纸张", en:"Paper", slot:"style",
  kw:["paper texture","visible fiber grain","absorbent surface"], desc:"纸纹透出，边缘自然吃色。" },
{ id:"VS-06-2", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 墨迹", zh:"墨迹", en:"Ink", slot:"style",
  kw:["wet ink pooling","ink bleed","ink density variation"], desc:"墨的浓淡与渗润。" },
{ id:"VS-06-3", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 颗粒", zh:"颗粒", en:"Grain", slot:"style",
  kw:["film grain","analog grain","noisy texture"], desc:"胶片或噪点颗粒叠加。" },
{ id:"VS-06-4", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 油彩", zh:"油彩", en:"Oil Paint", slot:"style",
  kw:["oil paint","canvas tooth","glossy paint surface"], desc:"油颜料的厚度与反光。" },
{ id:"VS-06-5", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 粉彩", zh:"粉彩粉笔", en:"Pastel / Chalk", slot:"style",
  alt:["粉彩","粉笔质感","pastel texture"],
  kw:["chalk pastel texture","dry pigment dust","soft smudged edges"], desc:"干粉颗粒，边缘可被蹭开。" },
{ id:"VS-06-6", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 版画", zh:"版画", en:"Printmaking", slot:"style",
  kw:["woodblock texture","misregistered blocks","limited ink layers"], desc:"套版不准与有限的墨层。" },
{ id:"VS-06-7", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 像素", zh:"像素", en:"Pixel", slot:"style",
  kw:["pixel art","limited palette","dithering pattern"], desc:"每个像素是硬决策，禁止抗锯齿。" },
{ id:"VS-06-8", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 塑料", zh:"塑料", en:"Plastic / 3D Toy", slot:"style",
  kw:["glossy plastic surface","single specular lobe","toy like material"], desc:"高光集中成一点，没有次级反射。" },
{ id:"VS-06-9", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 黏土", zh:"黏土", en:"Clay", slot:"style",
  kw:["clay surface","fingerprint texture","matte sculpted material"], desc:"指纹与哑光，是手工的痕迹。" },
{ id:"VS-06-10", lib:"04", up:"VS-06", path:"视觉风格 › 画面材质 › 织物", zh:"织物", en:"Fabric", slot:"style",
  kw:["woven textile","visible thread weave","cloth fiber"], desc:"织纹与线纱可见。" },

/* ── 空间表现 ── */
{ id:"VS-07", lib:"04", up:"", path:"视觉风格 › 空间表现", zh:"空间表现", en:"Spatial Treatment", desc:"如何处理深度。" },
{ id:"VS-07-1", lib:"04", up:"VS-07", path:"视觉风格 › 空间表现 › 平面", zh:"平面", en:"Flat", slot:"style",
  kw:["flat composition","no perspective","decorative layering"], desc:"完全放弃深度错觉。" },
{ id:"VS-07-2", lib:"04", up:"VS-07", path:"视觉风格 › 空间表现 › 浅空间", zh:"浅空间", en:"Shallow Space", slot:"style",
  kw:["shallow depth","compressed layers","limited recession"], desc:"只留两三层。适合正面叙事。" },
{ id:"VS-07-3", lib:"04", up:"VS-07", path:"视觉风格 › 空间表现 › 透视空间", zh:"透视空间", en:"Perspective Space", slot:"style",
  kw:["deep perspective","one point perspective","architectural recession"], desc:"严格的消失点系统。" },
{ id:"VS-07-4", lib:"04", up:"VS-07", path:"视觉风格 › 空间表现 › 等距视角", zh:"等距视角", en:"Isometric", slot:"style",
  kw:["isometric view","parallel projection","no vanishing point"], desc:"无消失点，平行线保持平行。" },
{ id:"VS-07-5", lib:"04", up:"VS-07", path:"视觉风格 › 空间表现 › 舞台式", zh:"舞台式", en:"Stage-like", slot:"style",
  kw:["proscenium framing","theatrical staging","side wing lighting"], desc:"像看戏一样正面观看。" },
{ id:"VS-07-6", lib:"04", up:"VS-07", path:"视觉风格 › 空间表现 › 多层景深", zh:"多层景深", en:"Layered Depth", slot:"style",
  kw:["multiplane depth","separated foreground layer","atmospheric separation"], desc:"前景中景远景各自独立推进。" },

/* ── 光影表现 ── */
{ id:"VS-08", lib:"04", up:"", path:"视觉风格 › 光影表现", zh:"光影表现", en:"Light & Shadow", desc:"明暗的组织方式。" },
{ id:"VS-08-1", lib:"04", up:"VS-08", path:"视觉风格 › 光影表现 › 无明显阴影", zh:"无明显阴影", en:"Shadowless", slot:"style",
  kw:["no cast shadow","flat even light","unshaded"], desc:"完全不塑造体积。" },
{ id:"VS-08-2", lib:"04", up:"VS-08", path:"视觉风格 › 光影表现 › 硬边阴影", zh:"硬边阴影", en:"Hard Shadow", slot:"style",
  kw:["hard edged shadow","graphic shadow shapes","strong sun shadow"], desc:"阴影也是一种形状，而非渐变。" },
{ id:"VS-08-3", lib:"04", up:"VS-08", path:"视觉风格 › 光影表现 › 柔和光影", zh:"柔和光影", en:"Soft Light", slot:"style",
  kw:["soft diffused light","gentle shadow falloff"], desc:"大面积散射，过渡平缓。" },
{ id:"VS-08-4", lib:"04", up:"VS-08", path:"视觉风格 › 光影表现 › 强对比", zh:"强对比", en:"High Contrast", slot:"style",
  kw:["high contrast lighting","deep shadow masses","chiaroscuro"], desc:"亮暗之间没有中间地带。" },
{ id:"VS-08-5", lib:"04", up:"VS-08", path:"视觉风格 › 光影表现 › 体积光", zh:"体积光", en:"Volumetric Light", slot:"style",
  kw:["volumetric light rays","god rays through dust","visible light shaft"], desc:"光有了体积，空气有了密度。" },
{ id:"VS-08-6", lib:"04", up:"VS-08", path:"视觉风格 › 光影表现 › 轮廓光", zh:"轮廓光", en:"Rim Light", slot:"style",
  kw:["rim light","backlit silhouette edge","rim lit hair"], desc:"逆光把边缘勾出来。" },
{ id:"VS-08-7", lib:"04", up:"VS-08", path:"视觉风格 › 光影表现 › 环境光", zh:"环境光", en:"Ambient Light", slot:"style",
  kw:["ambient bounce light","indirect occlusion","soft ambient fill"], desc:"来自各处的间接光。" },

/* ── 色彩体系 ── */
{ id:"VS-09", lib:"04", up:"", path:"视觉风格 › 色彩体系", zh:"色彩体系", en:"Color Scheme", desc:"整套颜色的组织策略。" },
{ id:"VS-09-1", lib:"04", up:"VS-09", path:"视觉风格 › 色彩体系 › 无彩色", zh:"无彩色", en:"Achromatic", slot:"style",
  kw:["black and white","grayscale rendering"], desc:"只有明度。" },
{ id:"VS-09-2", lib:"04", up:"VS-09", path:"视觉风格 › 色彩体系 › 单色", zh:"单色", en:"Monochrome Hue", slot:"style",
  kw:["single hue scheme","monochromatic palette"], desc:"一个色相的不同明度。" },
{ id:"VS-09-3", lib:"04", up:"VS-09", path:"视觉风格 › 色彩体系 › 有限色", zh:"有限色", en:"Limited Palette", slot:"style",
  kw:["limited palette","three color scheme","restrained hue range"], desc:"刻意限制可用色数。" },
{ id:"VS-09-4", lib:"04", up:"VS-09", path:"视觉风格 › 色彩体系 › 低饱和", zh:"低饱和", en:"Desaturated", slot:"style",
  kw:["desaturated palette","muted colors","low saturation"], desc:"色彩被灰调压制。" },
{ id:"VS-09-5", lib:"04", up:"VS-09", path:"视觉风格 › 色彩体系 › 高饱和", zh:"高饱和", en:"Vivid", slot:"style",
  kw:["vivid saturated colors","high chroma","punchy commercial palette"], desc:"纯度拉满。" },
{ id:"VS-09-6", lib:"04", up:"VS-09", path:"视觉风格 › 色彩体系 › 粉彩", zh:"粉彩", en:"Pastel", slot:"style",
  kw:["pastel palette","soft pink and lilac","gentle color harmony"], desc:"高明度低纯度。" },
{ id:"VS-09-7", lib:"04", up:"VS-09", path:"视觉风格 › 色彩体系 › 霓虹", zh:"霓虹", en:"Neon", slot:"style",
  kw:["neon color scheme","magenta cyan contrast","night neon glow"], desc:"靠人工光源染色。" },
{ id:"VS-09-8", lib:"04", up:"VS-09", path:"视觉风格 › 色彩体系 › 复古配色", zh:"复古配色", en:"Retro Palette", slot:"style",
  kw:["retro color palette","faded vintage hues","era accurate colors"], desc:"按某个年代的印刷或染料特征。" },

/* ── 完成状态 ── */
{ id:"VS-10", lib:"04", up:"", path:"视觉风格 › 完成状态", zh:"完成状态", en:"Finish Level",
  desc:"交付到什么程度。这与「画得好不好」无关，与「用途」有关。" },
{ id:"VS-10-1", lib:"04", up:"VS-10", path:"视觉风格 › 完成状态 › 草稿", zh:"草稿", en:"Draft", slot:"style",
  kw:["rough draft","construction lines visible","unfinished"], desc:"结构探索阶段。" },
{ id:"VS-10-2", lib:"04", up:"VS-10", path:"视觉风格 › 完成状态 › 线稿", zh:"线稿", en:"Lineart", slot:"style",
  kw:["clean lineart","monochrome line drawing","no color"], desc:"线条完成，等待上色。" },
{ id:"VS-10-3", lib:"04", up:"VS-10", path:"视觉风格 › 完成状态 › 色稿", zh:"色稿", en:"Color Rough", slot:"style",
  kw:["color rough","loose color study","unrendered blocking"], desc:"铺大关系，不精修。" },
{ id:"VS-10-4", lib:"04", up:"VS-10", path:"视觉风格 › 完成状态 › 设定稿", zh:"设定稿", en:"Design Sheet", slot:"style",
  kw:["character design sheet","spec annotations","multiple angle views"], desc:"服务于制作而非观赏。" },
{ id:"VS-10-5", lib:"04", up:"VS-10", path:"视觉风格 › 完成状态 › 完成插画", zh:"完成插画", en:"Finished Illustration", slot:"style",
  kw:["finished illustration","fully rendered","complete polish"], desc:"作为最终成品呈现。" },
{ id:"VS-10-6", lib:"04", up:"VS-10", path:"视觉风格 › 完成状态 › 动画截帧", zh:"动画截帧", en:"Animation Frame", slot:"style",
  kw:["anime screencap","broadcast frame","tv aspect composition"], desc:"按放映帧呈现，画质服从动画的制作成本与档期。" },
{ id:"VS-10-7", lib:"04", up:"VS-10", path:"视觉风格 › 完成状态 › 印刷成品", zh:"印刷成品", en:"Print-ready", slot:"style",
  kw:["print ready artwork","cmyk friendly palette","high detail print"], desc:"考虑印刷工艺约束。" },

/* ── 时间质感 ── */
{ id:"VS-11", lib:"04", up:"", path:"视觉风格 › 时间质感", zh:"时间质感", en:"Temporal Texture",
  desc:"画面上留下的时间痕迹。它属于物理结果，不是滤镜。" },
{ id:"VS-11-1", lib:"04", up:"VS-11", path:"视觉风格 › 时间质感 › 模拟胶片", zh:"模拟胶片", en:"Film Simulation", slot:"style",
  kw:["cel photo grain","photographed animation cel","slight registration drift"], desc:"相机拍摄赛璐璐片产生的物理痕迹。" },
{ id:"VS-11-2", lib:"04", up:"VS-11", path:"视觉风格 › 时间质感 › 模拟录像", zh:"模拟录像", en:"VHS Simulation", slot:"style",
  kw:["vhs tape look","chroma bleed","tracking distortion","scanlines"], desc:"磁带时代的信号损失。" },
{ id:"VS-11-3", lib:"04", up:"VS-11", path:"视觉风格 › 时间质感 › 数字洁净", zh:"数字洁净感", en:"Clean Digital", slot:"style",
  kw:["clean digital finish","no grain","crisp antialiased lines"], desc:"完全无噪点的现代流水线。" },
{ id:"VS-11-4", lib:"04", up:"VS-11", path:"视觉风格 › 时间质感 › 年代老化", zh:"年代老化", en:"Aged Print", slot:"style",
  kw:["aged paper","yellowed print","faded ink"], desc:"材料随时间退化。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_VISUAL2 };
