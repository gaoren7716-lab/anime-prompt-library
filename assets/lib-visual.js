/* ============================================================
 * lib-visual.js —— 04 视觉风格库
 * 回答「看起来是什么样」。十一个维度各自独立，可交叉指定。
 * 关键边界：风格 ≠ 地域，风格 ≠ 题材。同一地域可以有完全不同的风格。
 * ============================================================ */

var LIB_VISUAL = [

/* ── 造型方向 ── */
{ id:"VS-01", lib:"04", up:"", path:"视觉风格 › 造型方向", zh:"造型方向", en:"Form Direction", desc:"形体距离真实有多远。" },
{ id:"VS-01-1", lib:"04", up:"VS-01", path:"视觉风格 › 造型方向 › 写实", zh:"写实", en:"Realistic", slot:"style",
  kw:["realistic proportions","accurate anatomy","observational drawing"], alt:["写实"],
  desc:"按观察到的结构与比例作画，不主动理想化。" },
{ id:"VS-01-2", lib:"04", up:"VS-01", path:"视觉风格 › 造型方向 › 半写实", zh:"半写实", en:"Semi-realistic", slot:"style",
  kw:["semi-realistic","believable anatomy","stylized refinement"],
  desc:"保留可信结构，面部与轮廓做适度整理。" },
{ id:"VS-01-3", lib:"04", up:"VS-01", path:"视觉风格 › 造型方向 › 风格化", zh:"风格化", en:"Stylized", slot:"style",
  kw:["stylized forms","designed shapes","consistent design language"],
  desc:"主动简化与夸张，但内部规则自洽。" },
{ id:"VS-01-4", lib:"04", up:"VS-01", path:"视觉风格 › 造型方向 › 卡通", zh:"卡通", en:"Cartoon", slot:"style",
  kw:["cartoon proportions","simple read shapes","broad comic posing"],
  desc:"为清晰度牺牲物理正确性。" },
{ id:"VS-01-5", lib:"04", up:"VS-01", path:"视觉风格 › 造型方向 › 夸张变形", zh:"夸张变形", en:"Exaggerated Distortion", slot:"style",
  kw:["exaggerated perspective","impossible stretching","wild foreshortening"],
  desc:"故意超出物理可行范围，用形式本身制造力度。" },
{ id:"VS-01-6", lib:"04", up:"VS-01", path:"视觉风格 › 造型方向 › 极简", zh:"极简", en:"Minimal", slot:"style",
  kw:["minimal shapes","reduced detail","flat geometric figure"],
  desc:"删到不能再删，靠轮廓与比例维持识别。" },
{ id:"VS-01-7", lib:"04", up:"VS-01", path:"视觉风格 › 造型方向 › 抽象", zh:"抽象", en:"Abstract", slot:"style",
  kw:["abstract forms","non representational"],
  desc:"不再指向具体对象。" },

/* ── 身体比例 ── */
{ id:"VS-02", lib:"04", up:"", path:"视觉风格 › 身体比例", zh:"身体比例", en:"Body Proportion", desc:"头身比直接影响观感年龄与题材适配。" },
{ id:"VS-02-1", lib:"04", up:"VS-02", path:"视觉风格 › 身体比例 › 写实比例", zh:"写实比例", en:"Realistic Proportion", slot:"style",
  kw:["realistic body proportion","natural head to body ratio"], desc:"约七头身上下。" },
{ id:"VS-02-2", lib:"04", up:"VS-02", path:"视觉风格 › 身体比例 › 修长比例", zh:"修长比例", en:"Elongated", slot:"style",
  kw:["elongated proportions","long limbs","fashion illustration figure"], desc:"八头身以上，适合时装与幻想题材。" },
{ id:"VS-02-3", lib:"04", up:"VS-02", path:"视觉风格 › 身体比例 › 矮壮比例", zh:"矮壮比例", en:"Stocky", slot:"style",
  kw:["stocky build","compact powerful body"], desc:"重心低、体块厚，适合力量型角色。" },
{ id:"VS-02-4", lib:"04", up:"VS-02", path:"视觉风格 › 身体比例 › Q版", zh:"Q 版", en:"Chibi", slot:"style",
  kw:["chibi","super deformed","big head small body"], alt:["SD","二头身","三头身"],
  desc:"二到三头身，头部占绝对主导。" },
{ id:"VS-02-5", lib:"04", up:"VS-02", path:"视觉风格 › 身体比例 › 超级变形", zh:"超级变形", en:"Extreme Deformation", slot:"style",
  kw:["extreme chibi","squashed comedic proportions"], desc:"比 Q 版更极端，多用于喜剧效果。" },
{ id:"VS-02-6", lib:"04", up:"VS-02", path:"视觉风格 › 身体比例 › 非人比例", zh:"非人比例", en:"Non-human Proportion", slot:"style",
  kw:["non human proportion","digitigrade legs","extra limb structure"], desc:"按另一套骨骼逻辑设计肢体。" },

/* ── 面部设计 ── */
{ id:"VS-03", lib:"04", up:"", path:"视觉风格 › 面部设计", zh:"面部设计", en:"Facial Design", desc:"表情能力的上限由这一层决定。" },
{ id:"VS-03-1", lib:"04", up:"VS-03", path:"视觉风格 › 面部设计 › 写实五官", zh:"写实五官", en:"Realistic Features", slot:"style",
  kw:["natural facial features","subtle asymmetry"], desc:"不强调眼睛，靠整体结构传达。" },
{ id:"VS-03-2", lib:"04", up:"VS-03", path:"视觉风格 › 面部设计 › 简化五官", zh:"简化五官", en:"Simplified Features", slot:"style",
  kw:["simplified facial features","minimal nose and mouth"], desc:"嘴鼻弱化为线条或省略。" },
{ id:"VS-03-3", lib:"04", up:"VS-03", path:"视觉风格 › 面部设计 › 大眼", zh:"大眼", en:"Large Eyes", slot:"style",
  kw:["large expressive eyes","detailed iris highlights","layered eyelashes"], alt:["大眼睛"],
  desc:"眼睛成为情绪主载体，需要眼内的层次来支撑。" },
{ id:"VS-03-4", lib:"04", up:"VS-03", path:"视觉风格 › 面部设计 › 小眼", zh:"小眼", en:"Small Eyes", slot:"style",
  kw:["small narrow eyes","thin slit eyes"], desc:"压低眼睛占比，靠姿态与轮廓传达。" },
{ id:"VS-03-5", lib:"04", up:"VS-03", path:"视觉风格 › 面部设计 › 几何面部", zh:"几何面部", en:"Geometric Face", slot:"style",
  kw:["geometric face design","angular features"], desc:"五官被整理成明确的几何块面，转折处成角。" },
{ id:"VS-03-6", lib:"04", up:"VS-03", path:"视觉风格 › 面部设计 › 符号化面部", zh:"符号化面部", en:"Symbolic Face", slot:"style",
  kw:["dot eyes","single line mouth","icon-like face"], desc:"减到符号级别，靠配件区分角色。" },

/* ── 线条形式 ── */
{ id:"VS-04", lib:"04", up:"", path:"视觉风格 › 线条形式", zh:"线条形式", en:"Linework", desc:"轮廓处理是最快被识别的风格信号。" },
{ id:"VS-04-1", lib:"04", up:"VS-04", path:"视觉风格 › 线条形式 › 无轮廓", zh:"无轮廓", en:"No Outline", slot:"style",
  kw:["no lineart","painterly edges","color field separation"], desc:"靠色块边界而非线条区分形体。" },
{ id:"VS-04-2", lib:"04", up:"VS-04", path:"视觉风格 › 线条形式 › 细线", zh:"细线", en:"Fine Line", slot:"style",
  kw:["fine thin lineart","delicate line weight"], desc:"线细但不代表简单，密度往往更高。" },
{ id:"VS-04-3", lib:"04", up:"VS-04", path:"视觉风格 › 线条形式 › 粗线", zh:"粗线", en:"Bold Line", slot:"style",
  kw:["bold thick outline","heavy contour"], desc:"厚重的均匀轮廓，压缩感强。" },
{ id:"VS-04-4", lib:"04", up:"VS-04", path:"视觉风格 › 线条形式 › 粗细变化", zh:"粗细变化", en:"Variable Weight", slot:"style",
  kw:["tapered lineart","varying line weight","calligraphic contour"], alt:["线宽变化"],
  desc:"线的粗细随位置变化，体现体积与笔压。" },
{ id:"VS-04-5", lib:"04", up:"VS-04", path:"视觉风格 › 线条形式 › 毛笔线", zh:"毛笔线", en:"Brush Line", slot:"style",
  kw:["ink brush linework","sumi-e contour","dry brush edges"], desc:"毛笔的特性：起收笔、枯笔、飞白。" },
{ id:"VS-04-6", lib:"04", up:"VS-04", path:"视觉风格 › 线条形式 › 铅笔线", zh:"铅笔线", en:"Pencil Line", slot:"style",
  kw:["pencil lineart","graphite texture","sketch quality line"], desc:"带石墨颗粒与叠涂。" },
{ id:"VS-04-7", lib:"04", up:"VS-04", path:"视觉风格 › 线条形式 › 草绘线", zh:"草绘线", en:"Sketchy Line", slot:"style",
  kw:["loose sketchy linework","searching contour lines","unstable outline"],
  desc:"刻意保留找寻的过程痕迹。" },
{ id:"VS-04-8", lib:"04", up:"VS-04", path:"视觉风格 › 线条形式 › 刻线", zh:"刻线", en:"Engraved Line", slot:"style",
  kw:["woodcut line","engraving hatch","printmaking marks"], desc:"版画味，由刀而非笔产生。" },

/* ── 上色方式 ── */
{ id:"VS-05", lib:"04", up:"", path:"视觉风格 › 上色方式", zh:"上色方式", en:"Coloring Method", desc:"明暗如何过渡到暗部。" },
{ id:"VS-05-1", lib:"04", up:"VS-05", path:"视觉风格 › 上色方式 › 黑白", zh:"黑白", en:"Monochrome", slot:"style",
  kw:["monochrome","black and white ink","no color"], desc:"只有明暗，没有色相信息。" },
{ id:"VS-05-2", lib:"04", up:"VS-05", path:"视觉风格 › 上色方式 › 网点", zh:"网点", en:"Screentone", slot:"style",
  kw:["screentone shading","halftone dot pattern","printed manga tone"], alt:["网纸"],
  desc:"用网点密度表达灰阶，是印刷的产物。" },
{ id:"VS-05-3", lib:"04", up:"VS-05", path:"视觉风格 › 上色方式 › 平涂", zh:"平涂", en:"Flat Color", slot:"style",
  kw:["flat color","unshaded fill","poster like color"], desc:"每个色域一个值，不做过渡。" },
{ id:"VS-05-4", lib:"04", up:"VS-05", path:"视觉风格 › 上色方式 › 赛璐璐", zh:"赛璐璐", en:"Cel Shading", slot:"style",
  /* 「赛璐珞」是历史错写，全库其余 21 处均为「赛璐璐」。
     保留为别名，让照旧错字检索的用户仍能命中。 */
  alt:["赛璐珞","赛璐珞平涂","cel"],
  kw:["cel shading","two-tone shadow","hard shadow boundary"],
  desc:"亮部一层、暗部一层，边界清晰。" },
{ id:"VS-05-5", lib:"04", up:"VS-05", path:"视觉风格 › 上色方式 › 渐变", zh:"渐变", en:"Gradient Shading", slot:"style",
  kw:["soft airbrush shading","smooth gradient transition"], desc:"过渡连续无色阶。" },
{ id:"VS-05-6", lib:"04", up:"VS-05", path:"视觉风格 › 上色方式 › 厚涂", zh:"厚涂", en:"Impasto / Thick Paint", slot:"style",
  kw:["thick paint","visible brush strokes","painterly rendering"], alt:["厚绘"],
  desc:"笔触本身就是表面，暗部靠叠加而非平铺。" },
{ id:"VS-05-7", lib:"04", up:"VS-05", path:"视觉风格 › 上色方式 › 水彩", zh:"水彩", en:"Watercolor", slot:"style",
  kw:["transparent watercolor","pigment bleed","wet on wet"], desc:"透明叠加，纸白作为最亮部。" },
{ id:"VS-05-8", lib:"04", up:"VS-05", path:"视觉风格 › 上色方式 › 混合上色", zh:"混合上色", en:"Mixed Coloring", slot:"style",
  kw:["mixed painting technique","hybrid rendering"], desc:"同一幅内混用多种上色逻辑。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_VISUAL };
