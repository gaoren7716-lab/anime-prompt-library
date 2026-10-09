/* ============================================================
 * data-layout.js —— 排版图型层（段码 LT）
 * ============================================================
 * 为什么单独一层：
 *   画风回答「长什么样」，排版回答「怎么摆」。
 *   两者是正交的——同一张图可以套任意版式。
 *   没有这一层，用户拿到「赛璐璐」这个风格后，
 *   面对一张空白画布仍然不知道信息怎么分布。
 *
 * 边界（与技法层同一条纪律）：
 *   排版 ≠ 风格。版式只管「元素放在哪、留多少空白」，
 *   不管笔触怎么画。混进来就会出现「水彩风格的信息图」这种
 *   看似合理、实际两边都不到位的结果。
 *
 * 字段：
 *   id / zh / en / cat  基本标识
 *   ratio             建议画幅（竖版 3:4、横版 16:9、正方 1:1…）
 *   kw                标签速用版的英文特征词
 *   gpt / gptZh       自然语言正文（出图用），gpt 是喂 GPT-Image 的英文段，
 *                     gptZh 是同义中文段——中文模型与出中文海报时用后者
 *   desc / note       说明与注意事项
 *   demo              标签速用版（MJ / SD / Flux 吃逗号标签）
 *
 * 授权：本文件全部为原创版式描述，不含任何作品名或创作者署名，
 *       结构性属于 R0，可直接商用。
 * ============================================================ */

const LAYOUTS = [

  /* ================= 一、社媒卡（6 种） ================= */
  {
    id: "LT-01", zh: "上下图文卡", en: "Top-Bottom Text Card", cat: "社媒卡",
    ratio: "3:4",
    alt: ["上下图文", "上图下文"],
    kw: ["vertical layout", "illustration on top", "text block below", "clean separation", "poster layout"],
    desc: "上半部整块画面，下半部整块文字，中间留一条明确分界。适合金句、观点、结论先行的小红书图。",
    note: "文字占比不要超过画面 40%，否则模型会把字画糊；正文要短",
    demo: "vertical poster layout, illustration occupying the upper two thirds, clean text block below, generous margins, single strong focal subject",
    gpt: "Social card in a strict top-bottom split: the upper two thirds carry one full illustration with a single strong focal subject, the lower third is reserved as a clean empty band for a short line of text. Separate the two zones with whitespace rather than a hard rule, keep the margins wide on all four sides, and leave every text area as flat empty ground so the type stays crisp. Do not letter anything; the space is reserved, not filled.",
    gptZh: "严格上下分栏的社媒卡：上方三分之二是一整幅插画，只有一个明确的主体；下方三分之一留成干净的空白带，专门放一行短文字。两个区域用留白分隔而不是画一条硬线，四边留足页边距，所有文字区保持为空底，方便后期排字。画面里不要写任何字，那块空白是预留的，不是要填满的。"
  },
  {
    id: "LT-02", zh: "文案主导卡", en: "Copy-Led Card", cat: "社媒卡",
    ratio: "3:4",
    alt: ["纯文字卡", "语录卡"],
    kw: ["minimal background", "large negative space", "single accent element", "quote card", "very low detail"],
    desc: "背景近乎空白，一个极简元素点缀，大面积留给文字。适合金句、语录、态度表达。",
    note: "极简版式对模型最友好——元素越少越不容易出错，也最不容易出废图",
    demo: "minimal quote card, almost entirely empty background, vast clean negative space, one small subtle accent element in a corner, extremely low visual detail",
    gpt: "Copy-led card. The background is almost entirely empty — a calm flat field with no imagery competing for attention. Place one small, restrained accent element off-center near a corner: a single brush mark, a thin rule, one leaf. Keep total visual information extremely low so that a headline can occupy the middle third without fighting anything. No lettering, no watermark.",
    gptZh: "文案主导的卡片。背景几乎全空，只是一片平静的纯色底，不要有具体物象跟文字抢注意力。在偏心的角落放一个克制的小点缀元素——一笔笔触、一条细线、一片叶子。整体视觉信息量压到极低，让主标题能占据中间三分之一而不打架。画面里不要写字，不要水印。"
  },
  {
    id: "LT-03", zh: "对偶双栏卡", en: "Side-by-Side Compare", cat: "社媒卡",
    ratio: "1:1",
    alt: ["左右对比", "双栏对比"],
    kw: ["split layout", "two panels side by side", "diptych", "comparison", "vertical divider"],
    desc: "画面竖直一分为二，左右各一个内容，用于对比、前后、两种做法。",
    note: "两个主体的画风、景别、光线必须一致，否则模型会当成两张不同的画",
    demo: "vertical split layout, two panels side by side of equal width, matching style and lighting across both halves, thin gutter between them, comparative diptych",
    gpt: "A side-by-side diptych divided by a single thin vertical gutter. Both halves must share one identical style, one identical lighting direction, one identical camera height and one identical scale — the only thing that differs is the subject on each side. Keep the two halves tonally balanced so neither reads as more important. Do not letter either panel.",
    gptZh: "左右对照的对照式构图，用一条细竖缝分成两半。两边必须是完全一致的画风、完全一致的光线方向、完全一致的机位高度和完全一致的尺度，唯一的差别是各自的主体。两个区域的影调要平衡，不要让任何一边显得更重要。两边都不要写字。"
  },
  {
    id: "LT-04", zh: "签名角落卡", en: "Signed Corner Card", cat: "社媒卡",
    ratio: "1:1",
    alt: ["角落签名"],
    kw: ["small signature area", "corner placement", "portrait oriented", "generous empty space", "author card"],
    desc: "主体偏置，某个角落留出固定位置放署名或账号。适合个人 IP 的固定图型。",
    note: "留空位置要写进提示词，否则模型会自己写一个假签名上去",
    demo: "portrait-oriented card with the subject pushed off-center, one corner deliberately left empty as a reserved signature space, calm flat background, generous margins",
    gpt: "A card with the subject pushed off-center so that one corner falls free. Treat that corner as a deliberately reserved signature space — keep it as clean flat ground and do not let the illustration drift into it. The rest of the frame stays calm and open. Do not render a name, initials or any lettering; the space is held open on purpose.",
    gptZh: "主体偏置的卡片，留出一个角作为预留的署名位。把那个角当成刻意留空的地方，保持干净的空底，不要让画面元素漂进去。其余部分保持平静开阔。不要渲染姓名、缩写或任何文字，那块空间是故意留着的。"
  },
  {
    id: "LT-05", zh: "全出血沉浸卡", en: "Full-Bleed Immersive", cat: "社媒卡",
    ratio: "9:16",
    alt: ["满屏", "出血"],
    kw: ["full bleed", "edge to edge illustration", "no margins", "immersive", "vertical full screen"],
    desc: "画面顶天立地铺满，不留任何边框。适合手机全屏浏览的短视频封面。",
    note: "满出血构图里主体必须偏离正中心，否则裁切时会正好切到脸",
    demo: "full bleed vertical composition, artwork running edge to edge with no border or margin, immersive atmosphere, subject placed off-center to survive cropping",
    gpt: "A full-bleed vertical composition: the artwork runs edge to edge with no border, no frame and no margin anywhere. Place the subject well off-centre so the image survives cropping to different aspect ratios. Let the atmosphere carry the image rather than a single hard focal point. No text, no watermark, no border line.",
    gptZh: "满出血的竖幅构图：画面顶天立地铺满，四边没有边框、没有留白、没有边线。主体要明显偏离正中心，这样裁成不同比例时才不会被切到脸。让氛围撑起画面，而不是靠一个生硬的视觉焦点。不要文字，不要水印，不要描边。"
  },
  {
    id: "LT-06", zh: "竖向长条卡", en: "Vertical Story Sliver", cat: "社媒卡",
    ratio: "9:16",
    alt: ["长条卡", "竖条"],
    kw: ["tall vertical strip", "stacked panels", "sequential reading order", "narrow format", "mobile scroll"],
    desc: "极窄的竖长条，内容自上而下堆叠。适合手机滚动阅读的信息流。",
    note: "元素要按从上到下的顺序排，读起来才是一条线而不是一堆散块",
    demo: "tall narrow vertical strip, content stacked top to bottom in clear reading order, narrow format, repeated rhythm, low width-to-height ratio",
    gpt: "A tall narrow vertical strip designed for a scrolling phone feed. Stack the content from top to bottom in an unambiguous reading order, repeating one visual rhythm across the strip so the eye travels downward without interruption. Keep the width-to-height ratio extreme. Do not letter anything.",
    gptZh: "为手机滚动信息流设计的极窄竖长条。内容自上而下堆叠，阅读顺序必须毫无歧义，整条重复同一个视觉节奏，让视线能顺畅地往下走而不被打断。宽高比要极端。不要写任何文字。"
  },

  /* ================= 二、信息图（6 种） ================= */
  {
    id: "LT-07", zh: "金字塔层级图", en: "Pyramid Hierarchy", cat: "信息图",
    ratio: "1:1",
    alt: ["金字塔", "层级图"],
    kw: ["pyramid diagram", "layered tiers", "stacked levels", "hierarchy infographic", "three tiers"],
    desc: "自上而下三层或四层的金字塔，用来表达「上位概念包含下位概念」。",
    note: "层数别超过四层，再多就读不出来了；层宽差要明显",
    demo: "clean pyramid infographic diagram, three clearly separated stacked tiers, each tier visibly wider than the one above, flat solid fills, generous spacing between levels, minimal decoration",
    gpt: "A clean pyramid infographic with three clearly separated stacked tiers. Each tier must be visibly wider than the one above so the hierarchy reads instantly. Use flat solid fills with clear edges and generous spacing between levels; drop shadows, gradients and 3D bevels all fight the clarity a diagram needs. No lettering.",
    gptZh: "干净的金字塔信息图，分成三层清晰隔开的层级。每一层要比上一层明显更宽，让层级关系一眼就读出来。用纯色平涂配清晰的边缘，层与层之间留足间距；阴影、渐变、立体斜角全都会削弱图示需要的清晰度。不要写字。"
  },
  {
    id: "LT-08", zh: "中心主图标注图", en: "Center-Figure Annotated", cat: "信息图",
    ratio: "1:1",
    alt: ["中心图", "标注图"],
    kw: ["central figure", "radiating callouts", "annotation lines", "hub and spoke", "annotated diagram"],
    desc: "中心一个主体，四周引出标注线指向各部分。适合解剖、构成、部件说明。",
    note: "标注线要与主体真实相交，不能凭空连到空气里",
    demo: "annotated infographic with one large central figure, thin leader lines radiating outward to empty label positions around it, clean flat background, precise technical illustration feel",
    gpt: "An annotated infographic built around one large central figure. Thin leader lines radiate outward from real parts of that figure to empty label positions placed in the surrounding margin. Every line must terminate on something that is actually in the drawing. Keep the background flat and uncluttered and give the whole thing a precise technical-illustration feel. No lettering.",
    gptZh: "以一个大主体为核心的标注式信息图。细引线从主体的真实部位出发，指向四周留好的空白标签位。每一根线都必须落在图里真实存在的东西上。背景保持干净不杂，整体带精确的技术插画感。不要写字。"
  },
  {
    id: "LT-09", zh: "并列对比图", en: "Multi-Column Comparison", cat: "信息图",
    ratio: "16:9",
    alt: ["多列对比", "对比表"],
    kw: ["multi column layout", "row grid", "aligned cells", "comparison table layout", "structured rows"],
    desc: "多行多列的网格，每格一个单元。适合清单、参数、选项对比。",
    note: "格子之间留白要一致，格子大小不一致会让画面显得乱",
    demo: "multi column comparison layout, evenly spaced row grid, uniform cell sizes, consistent internal padding, flat distinct fills per row, structured and even",
    gpt: "A multi-column comparison laid out as evenly spaced rows. Every cell must be the same size and share the same internal padding, because mismatched cells read as sloppiness rather than variety. Use one flat distinct fill per row, keep the gutters generous and uniform, and let the structure carry the layout with no ornament. No lettering.",
    gptZh: "多列对比布局，排成间距均匀的若干行。每个格子必须同样大小、内部留白一致——格子不统一会显得潦草，而不是显得多样。每一行用一种平涂色块，留足且统一的间隙，让结构本身撑起版面，不加任何装饰。不要写字。"
  },
  {
    id: "LT-10", zh: "时间轴流程图", en: "Timeline Flow", cat: "信息图",
    ratio: "16:9",
    alt: ["时间轴", "流程"],
    kw: ["horizontal timeline", "sequential steps", "connected nodes", "left to right flow", "milestone markers"],
    desc: "横向从左到右的节点串联。适合步骤、流程、演进过程。",
    note: "节点数量控制在 5 个以内，再多连线会交叉成乱麻",
    demo: "horizontal timeline infographic, four evenly spaced milestone nodes connected left to right, one clear directional flow, flat shapes, consistent node sizing, uncluttered",
    gpt: "A horizontal timeline infographic with four evenly spaced milestone nodes connected left to right. Keep one unambiguous direction of travel, size every node identically, and route the connectors so they never cross. Flat shapes, consistent spacing, nothing decorative competing with the sequence. No lettering.",
    gptZh: "横向时间轴信息图，四个等距的里程碑节点从左到右连接。保持一个不含糊的流向，每个节点同样大小，连接线要走成不交叉的路线。用平涂形状，间距一致，不放任何跟序列抢注意力的装饰。不要写字。"
  },
  {
    id: "LT-11", zh: "分步步骤图", en: "Step Sequence", cat: "信息图",
    ratio: "3:4",
    alt: ["步骤图", "howto"],
    kw: ["step by step", "numbered stages", "vertical progression", "instructional layout", "sequential panels"],
    desc: "步骤式纵向排布，每一步一个独立小画面。适合教程、做法、指南。",
    note: "每一步要能独立看懂，不能依赖上一步才成立",
    demo: "vertical step-by-step instructional layout, four equal stacked stages each self-contained, repeated identical framing per step, clear top to bottom progression",
    gpt: "A vertical step-by-step instructional layout with four equal stacked stages, each one complete and legible on its own. Repeat the identical framing, scale and lighting in every stage so the reader sees the same subject changing rather than four different images. Keep the progression strictly top to bottom. No lettering.",
    gptZh: "纵向的分步教程布局，四个等大的独立阶段，每一步都能独立看懂。每一步重复完全相同的取景、尺度与光线，让读者看到的是同一个东西在变化，而不是四张不同的图。顺序严格自上而下。不要写字。"
  },
  {
    id: "LT-12", zh: "手帐拼贴图", en: "Journal Collage", cat: "信息图",
    ratio: "1:1",
    alt: ["拼贴", "手帐"],
    kw: ["journal collage", "taped polaroid elements", "layered paper", "scrapbook layout", "handmade feel"],
    desc: "照片、明信片、便签、胶带层层叠贴。适合清单、旅行、生活记录。",
    note: "每个元素要有明确边界，不要糊成一团；胶带要半透明才像真的贴上去",
    demo: "journal scrapbook collage, several small rectangular paper elements layered with slight rotation, visible translucent tape strips, thin photo borders, warm off-white paper background",
    gpt: "A journal scrapbook collage: several small rectangular paper elements layered with slight individual rotation, held by visible strips of translucent tape that let the paper beneath show through. Give each element a crisp thin border so it stays legible as a separate piece. Warm off-white paper background. No lettering.",
    gptZh: "手帐拼贴风：几块小矩形纸片各自略微旋转地叠在一起，用半透明胶带固定，胶带要能透出下面的纸。每一块都要有清晰细边框，让它作为独立元素读得出来。背景是温暖的米白纸色。不要写字。"
  },

  /* ================= 三、漫画分镜（6 种） ================= */
  {
    id: "LT-13", zh: "规则四格", en: "Regular 4-Panel Strip", cat: "分镜",
    ratio: "4:3",
    alt: ["四格", "四格漫画"],
    kw: ["four panel comic strip", "equal panels", "sequential order", "gutter spacing", "storyboard sequence"],
    desc: "四格等分，顺序推进，最经典的漫画格式。",
    note: "四格之间要有明确留白沟槽，格子贴一起会分不清边界",
    demo: "four panel comic strip, equal rectangular panels in clear left-to-right reading order, generous white gutters between panels, clean black panel borders, consistent style across all four",
    gpt: "A four-panel comic strip with equal rectangular panels read left to right. Leave generous white gutters so each panel reads as a separate beat. Use clean black panel borders of identical weight, and hold one identical style, line weight and character design across all four panels so only the action changes. Leave speech balloons empty or absent. No lettering.",
    gptZh: "四格漫画，格子等大，从左到右阅读。留足白色沟槽，让每一格读起来是一个独立节拍。用粗细一致的干净黑框，四个格子保持完全相同的画风、线重与角色设定，只有动作在变。对白框留空或干脆不要。不要写字。"
  },
  {
    id: "LT-14", zh: "起承转合四格", en: "Setup-Turn-Resolve 4-Panel", cat: "分镜",
    ratio: "4:3",
    alt: ["起承转合", "叙事四格"],
    kw: ["narrative arc", "four panel structure", "setup development turn resolution", "story progression", "dramatic beat"],
    desc: "四格分别承担铺垫、发展、转折、收束，读完是一个完整小故事。",
    note: "转折格要跟前两格明显不同，一眼能看出转折点在哪",
    demo: "four panel narrative strip with a clear arc, calm setup panel then rising panel then a sharp turn panel then a resolution panel, escalating drama, consistent character design",
    gpt: "A four-panel narrative strip carrying a complete arc: panel one calm and establishing, panel two rising, panel three a sharp visual turn that could not be predicted from panel two, panel four a resolution that resolves what panel three opened. Keep the character design identical across all four so only staging, scale and expression change. No lettering.",
    gptZh: "四格叙事条，承载一个完整弧线：第一格平静铺陈，第二格升温，第三格是一个从第二格无法预测的急转，第四格收束第三格打开的悬念。四格角色设定必须完全一致，变化的只有调度、尺度与表情。不要写字。"
  },
  {
    id: "LT-15", zh: "对角切割分镜", en: "Diagonal Split Panel", cat: "分镜",
    ratio: "16:9",
    alt: ["斜切", "对角分镜"],
    kw: ["diagonal split", "angled panel border", "dynamic composition", "off axis division", "tension framing"],
    desc: "用斜线把画面切开，两侧内容不同。适合表现对立、速度、失衡。",
    note: "斜切后两侧的地面透视要一致，否则会像两张图硬拼",
    demo: "diagonally split panel layout, one strong angled division running corner to corner, contrasting content on each side, shared ground plane and lighting across the divide",
    gpt: "A diagonally split panel with one strong angled division running corner to corner, contrasting content on each side. Crucially, both sides must share the same ground plane, the same lighting direction and the same rendering style — otherwise the split reads as two unrelated images pasted together rather than one dynamic frame. No lettering.",
    gptZh: "斜切式分镜，用一道从角到角的强斜线切开分出对比内容。关键是两侧必须共用同一地面透视、同一光线方向、同一渲染风格——否则那道斜线会让画面读成两张无关图硬拼，而不是一个动态的单帧。不要写字。"
  },
  {
    id: "LT-16", zh: "大格冲击页", en: "Full-Bleed Splash Panel", cat: "分镜",
    ratio: "3:4",
    alt: ["大格", "整幅跨页"],
    kw: ["full bleed splash panel", "single dramatic moment", "impact frame", "wide unbroken image", "cinematic still"],
    desc: "一整幅不切分的画面，承担整页的高潮时刻。适合名场面、情绪爆点。",
    note: "不分割意味着细节要求更高，出图后要在后期加网点或留白强化戏剧感",
    demo: "single full-bleed splash panel, one unbroken dramatic moment filling the entire frame, high impact moment, cinematic still, no internal borders, strong focal subject",
    gpt: "A single full-bleed splash panel: one unbroken dramatic moment filling the entire frame with no internal borders anywhere. Concentrate the action at one clear focal point and let the surrounding energy radiate outward from it. Because nothing is subdivided, the whole image can carry one continuous atmosphere. No lettering, no speech balloons.",
    gptZh: "单幅满出血大格：一整页不切分的戏剧瞬间铺满画面，内部没有任何分格。把动作集中在一个明确的焦点上，让周围的能量从那里向外扩散。正因为不分割，整幅图能承载一个连贯的氛围。不要写字，不要对白框。"
  },
  {
    id: "LT-17", zh: "情绪递进条", en: "Emotion Ladder Strip", cat: "分镜",
    ratio: "16:9",
    alt: ["情绪条", "递进"],
    kw: ["emotional progression", "increasing intensity", "repeating frame motif", "escalating drama", "vertical repetition"],
    desc: "同一构图重复多次，情绪逐格增强。适合表现积累到爆发的过程。",
    note: "构图必须一样，只有表情/姿态变，否则递进关系不成立",
    demo: "four repeating identical frames escalating in intensity, same composition each time, progressive increase in drama, locked camera position, one variable changing per frame",
    gpt: "Four frames repeating the identical composition while escalating in intensity. Lock the camera position, framing and subject placement exactly the same in each, and let only one variable change per frame — expression, then posture, then lighting, then scale. Because everything else stays fixed, the escalation becomes unmistakable. No lettering.",
    gptZh: "四帧重复完全相同的构图，强度逐级上升。机位、取景、主体位置在每一帧里严格锁定，每帧只改变一个变量——先表情，再姿态，再光线，再尺度。正因为其他一切不变，递进关系才不容置疑。不要写字。"
  },
  {
    id: "LT-18", zh: "网格蒙太奇", en: "Grid Montage", cat: "分镜",
    ratio: "1:1",
    alt: ["蒙太奇", "网格"],
    kw: ["grid montage", "many small panels", "rhythm across cells", "variety within system", "sequential cells"],
    desc: "密集小格网，每格一个片段，整体形成节奏与密度。适合表现量、时间跨度、群像。",
    note: "格子多了容易出现人物漂移，同一个人要在多格里保持一致",
    demo: "dense grid montage, twelve equal small panels in even rows and columns, one continuous subject matter across all cells, rhythmic visual variety, consistent style throughout",
    gpt: "A dense grid montage of twelve equal small panels arranged in even rows and columns. Keep one continuous subject matter across all cells so they read as fragments of the same thing, not twelve unrelated images. Vary the framing within each cell for rhythm, but hold the style constant. No lettering in any cell.",
    gptZh: "十二个小格均匀排成行列的密集蒙太奇。所有格子保持同一个连续的题材内容，让它们读起来是同一件事的碎片，而不是十二张无关的图。每格内部变换取景来形成节奏，但画风保持一致。任何一格都不要写字。"
  },

  /* ================= 四、IP 设计（4 种） ================= */
  {
    id: "LT-19", zh: "角色三视图", en: "Character Turnaround", cat: "IP设计",
    ratio: "16:9",
    alt: ["三视图", "转面图"],
    kw: ["character turnaround sheet", "front side and back views", "orthographic", "model sheet", "consistent proportions"],
    desc: "正面、侧面、背面三视图并列。适合角色设定、标准件。",
    note: "三视图必须用正交视角，不能有透视变形，否则建模会崩",
    demo: "character turnaround model sheet, front side and back views aligned in a row, orthographic projection with no perspective distortion, identical proportions and scale across views, plain neutral background",
    gpt: "A character turnaround model sheet showing front, side and back views aligned in one row on a plain neutral background. Use orthographic projection throughout — any perspective distortion breaks the purpose of a turnaround. Every view must share identical proportions, identical scale, identical height and identical costume detail. No lettering, no labels.",
    gptZh: "角色三视图设定图，在纯净中性背景上把正面、侧面、背面排成一行。整张用正交投影——任何透视变形都会让三视图失去作用。三个视角必须共用完全一致的比例、尺度、身高与服装细节。不要写字，不要标注。"
  },
  {
    id: "LT-20", zh: "表情差分表", en: "Expression Sheet", cat: "IP设计",
    ratio: "16:9",
    alt: ["表情表", "差分"],
    kw: ["expression sheet", "grid of faces", "consistent head angle", "varied emotion", "character reference"],
    desc: "同一张脸的多格表情差分。适合角色资产、表情包生产。",
    note: "头部角度要固定，只变表情；否则模型会连头型一起改",
    demo: "character expression sheet, eight head studies in a neat grid, identical head angle and identical face proportions in every cell, only the expression changes, clean flat background",
    gpt: "A character expression sheet with eight head studies in a neat grid. Lock the head angle, the face proportions, the line weight and the hair silhouette identically in every cell so that the only thing changing is the expression itself. Clean flat background, even spacing, no lettering or emotion labels.",
    gptZh: "角色表情差分表，八个头部特写在规整网格里排列。每一格锁定相同的头部角度、脸部比例、线重与发型轮廓，保证变化的只有表情本身。背景干净平坦，间距均匀，不要写字或情绪标签。"
  },
  {
    id: "LT-21", zh: "吉祥物设定页", en: "Mascot Spec Sheet", cat: "IP设计",
    ratio: "1:1",
    alt: ["吉祥物", "设定页"],
    kw: ["mascot design sheet", "character turnaround", "brand character", "simplified silhouette", "commercial character"],
    desc: "吉祥物的主视觉 + 多角度 + 要素拆解。适合品牌与衍生周边。",
    note: "剪影要能单独认出来——缩到指甲盖大小还认得出才算合格",
    demo: "mascot character specification sheet, one large hero pose plus two smaller supporting views, distinct readable silhouette, simplified bold shapes, plain flat background, commercial character design clarity",
    gpt: "A mascot character specification sheet: one large hero pose plus two smaller supporting views on a plain flat background. The silhouette must stay distinct and readable when shrunk small — that is the real test of a mascot. Simplify the shapes into bold confident forms and keep every view consistent with the hero pose. No lettering.",
    gptZh: "吉祥物角色设定页：在纯净平底上一个大号主姿态加两个较小的辅助视角。剪影必须在小尺寸下依然清晰可辨——这才是检验吉祥物是否成立的标准。把形状简化成大胆有力的块面，所有视角与主姿态保持一致。不要写字。"
  },
  {
    id: "LT-22", zh: "配色情绪板", en: "Mood Board", cat: "IP设计",
    ratio: "1:1",
    alt: ["情绪板", "moodboard"],
    kw: ["mood board", "material swatches", "texture samples", "color chips", "visual reference board"],
    desc: "材质样、色块、纹理拼贴成情绪板。适合定调、提案。",
    note: "色块要给出可用的十六进制值，否则无法落地到具体设计",
    demo: "visual mood board, flat color swatches and small texture samples arranged in a loose grid, limited cohesive palette, material references, tactile surface detail",
    gpt: "A visual mood board: flat color swatches and small texture samples arranged in a loose grid, held together by one limited cohesive palette. Include tactile material references — a paper edge, a fabric weave, a metal sheen — so the board communicates surface quality and not just hue. Keep the arrangement informal and breathing. No lettering.",
    gptZh: "视觉情绪板：平涂色块与小尺寸纹理样本松散排布在网格里，用一套受限且协调的配色把它们统住。要包含材质参照——一道纸边、一段织物纹理、一处金属光泽——让情绪板传达表面质感而不只是色相。排布要随意、有呼吸感。不要写字。"
  },

  /* ================= 五、电商（4 种） ================= */
  {
    id: "LT-23", zh: "单品主图", en: "Product Hero Shot", cat: "电商",
    ratio: "1:1",
    alt: ["主图", "白底图"],
    kw: ["product hero shot", "clean background", "single product centered", "studio lighting", "e-commerce main image"],
    desc: "单一商品居中，背景干净。适合电商主图与详情页首图。",
    note: "背景不能纯白到失去轮廓，要有一点层次让商品边界清楚",
    demo: "single product centered on a clean graduated backdrop, controlled studio lighting with one clear key light and soft fill, sharp product edges, generous even margins, e-commerce main image quality",
    gpt: "A single product centered on a clean graduated backdrop under controlled studio lighting — one clear key light plus soft fill so the form reads without harsh shadow. Keep the background light enough to feel bright but not so flat that the product loses its silhouette. Preserve sharp product edges and leave generous, even margins. No lettering.",
    gptZh: "单一商品居中于干净渐变背景上，用可控的影棚布光——一个明确的主光加柔和补光，让形体读得出来又不产生生硬阴影。背景要够亮但不能平到让商品失去轮廓。保持商品边缘锐利，四周留足均匀的页边距。不要写字。"
  },
  {
    id: "LT-24", zh: "多视角展示", en: "Multi-Angle View", cat: "电商",
    ratio: "16:9",
    alt: ["多视角", "多角度"],
    kw: ["multiple angles", "angle variations", "product turnaround", "consistent scale", "catalog view"],
    desc: "同一商品多个角度并列。适合需要看细节的商品。",
    note: "多视角之间商品的相对大小要一致，否则看起来像不同商品",
    demo: "multiple angle catalog view of one product, four viewpoints arranged in even columns, identical scale and lighting across all views, seamless clean background",
    gpt: "A multiple-angle catalog view of one product: four viewpoints arranged in even columns on a seamless clean background. Every view must share identical scale and identical lighting so they read as the same object rather than four different products. Align the baselines across views so the arrangement looks deliberate. No lettering.",
    gptZh: "同一商品的多视角目录图：四个视角均匀排成列，背景无缝干净。每个视角必须共用相同尺度与相同光线，读起来是同一个东西而不是四个不同商品。把各视角的基线对齐，让排布显得是刻意安排的。不要写字。"
  },
  {
    id: "LT-25", zh: "卖点标注图", en: "Feature Callout", cat: "电商",
    ratio: "1:1",
    alt: ["卖点图", "标注"],
    kw: ["feature callout", "annotated product", "detail highlight", "close up detail", "benefit diagram"],
    desc: "商品局部放大 + 指示标注。适合讲卖点、材质、参数。",
    note: "标注线要指向真正想说的那个细节，不能乱指",
    demo: "product feature callout diagram, one enlarged detail region as the focus, thin leader lines pointing from real structural details to empty label positions, context shot kept smaller, clean flat background",
    gpt: "A product feature callout diagram. One enlarged detail region is the focus; thin leader lines run from genuine structural details inside that region to empty label positions around the margin. Keep a smaller context view so the reader knows where the detail came from. Precise and technical, never decorative. No lettering.",
    gptZh: "商品卖点标注图。一处放大的细节区域作为焦点，细引线从该区域内真实的结构细节出发，指向四周留好的空白标签位。旁边保留一个较小的上下文视图，让读者知道这个细节来自哪里。整体精确、技术性，不要装饰感。不要写字。"
  },
  {
    id: "LT-26", zh: "使用场景图", en: "Lifestyle Context Shot", cat: "电商",
    ratio: "3:4",
    alt: ["场景图", "使用图"],
    kw: ["lifestyle shot", "in use context", "natural environment", "product in scene", "aspirational setting"],
    desc: "商品放在真实使用环境里。适合建立使用欲望而非陈列参数。",
    note: "环境要真的像有人用，而不是把商品 P 到风景上",
    demo: "lifestyle context shot, the product naturally in use within a believable lived-in environment, human presence implied rather than staged, warm natural light, candid composition",
    gpt: "A lifestyle context shot with the product naturally in use inside a believable, lived-in environment. Imply human presence — a hand, a seat, a cup left behind — rather than staging a model. Use warm natural light and a candid, slightly unposed composition. The goal is to make the reader want the product, not to list its specifications. No lettering.",
    gptZh: "使用场景图：商品自然地使用在一个可信的、有人生活过的环境里。要暗示人的存在——一只手、一把坐过的椅子、一只喝剩的杯——而不是摆拍一个模特。用温暖的自然光和略带随手感、没有刻意摆好的构图。目标是让读者想要这个商品，而不是罗列参数。不要写字。"
  },

  /* ================= 六、封面与海报（4 种） ================= */
  {
    id: "LT-27", zh: "大字标题封面", en: "Big-Type Cover", cat: "封面",
    ratio: "16:9",
    alt: ["标题封面", "大字报"],
    kw: ["poster cover", "large headline area", "bold composition", "editorial cover", "strong visual hierarchy"],
    desc: "画面为一个大标题服务，标题区占显著位置。适合公众号、博客封面。",
    note: "标题留空区必须干净，模型很容易在留空处自己写字",
    demo: "editorial poster cover with one bold focal image and a large clearly reserved headline area, strong visual hierarchy, flat clean zone for type, dramatic composition",
    gpt: "An editorial poster cover built around one bold focal image plus a large, clearly reserved headline area. The type zone must stay a clean flat field — models fill empty space with invented lettering, so state that the space is reserved and remain unlettered. Keep one dominant focal point and let it carry the hierarchy. No text.",
    gptZh: "一张围绕「一个大视觉焦点 + 一块明确预留的大标题区」构建的编辑类封面。文字区必须保持干净的平底——模型会往空白处自己写字，所以要明确声明这块空间是预留的，保持不写字。维持一个主导焦点，让它撑起视觉层级。不要文字。"
  },
  {
    id: "LT-28", zh: "隐喻主视觉", en: "Metaphorical Key Visual", cat: "封面",
    ratio: "16:9",
    alt: ["主视觉", "隐喻"],
    kw: ["metaphorical composition", "conceptual imagery", "symbolic representation", "concept cover", "visual metaphor"],
    desc: "用一个具象画面表达一个抽象概念。适合观点、趋势、思考类封面。",
    note: "隐喻要能从画面直接读出来，不要设计成需要解释的谜语",
    demo: "conceptual cover using one literal image to stand for an abstract idea, clear symbolic relationship, single strong metaphor, restrained composition, dramatic scale contrast",
    gpt: "A conceptual cover that uses one literal, concrete image to stand for an abstract idea. The symbolic relationship must be readable immediately without explanation — build it through scale contrast, repetition or an unexpected material pairing rather than through allegory. Keep the composition restrained with one dominant element. No lettering.",
    gptZh: "一张用单一具象画面表达抽象概念的封面。象征关系必须一眼可读、不需要解释——靠尺度对比、重复出现或出意料的材质搭配来建立，而不是靠寓言。构图保持克制，以一个主导元素为中心。不要写字。"
  },
  {
    id: "LT-29", zh: "对比冲击封面", en: "Contrast Punch Cover", cat: "封面",
    ratio: "16:9",
    alt: ["对比封面", "冲击"],
    kw: ["high contrast cover", "bold contrast", "striking visual contrast", "attention grabbing cover", "scale contrast"],
    desc: "靠强烈对比抓注意力：尺度、密度、明暗或色温的极端反差。",
    note: "对比只在两个元素之间成立，元素多了互相削弱就没有冲击力了",
    demo: "high contrast cover built on one extreme juxtaposition, vast scale difference between two elements, stark tonal contrast, minimal supporting detail, immediate visual impact",
    gpt: "A high-contrast cover built on one extreme juxtaposition — a vast difference in scale, a stark tonal split, or an opposing temperature. Contrast only works between two elements; add a third and they weaken each other into mush. Keep supporting detail minimal so the opposition reads instantly at thumbnail size. No lettering.",
    gptZh: "靠一组极端并置建立的高对比封面：巨大的尺度差、硬性的影调分割，或对立的色温。对比只在两个元素之间成立——加入第三个，它们就会互相削弱成一团。把辅助细节压到最少，让这种对立在缩略图尺寸下也能立刻读出来。不要写字。"
  },
  {
    id: "LT-30", zh: "竖版故事封面", en: "Vertical Story Cover", cat: "封面",
    ratio: "3:4",
    alt: ["故事封面", "竖版封面"],
    kw: ["vertical narrative cover", "story establishing image", "atmospheric depth", "chapter opening image", "portrait book cover"],
    desc: "竖版、有氛围铺陈的画面。适合短篇、章节开场、竖屏内容。",
    note: "竖版画面上下跨度大，主体要放在中段，避免被裁掉",
    demo: "vertical narrative cover with atmospheric depth, layered recession from foreground to distance, subject placed in the middle vertical third, cinematic lighting, portrait orientation",
    gpt: "A vertical narrative cover with real atmospheric depth: build layers receding from foreground to distance so the eye travels inward. Place the subject in the middle vertical third, because a portrait frame gives you far more vertical room than horizontal and an off-centre subject will be cropped. Cinematic lighting, portrait orientation. No lettering.",
    gptZh: "有真实空气纵深的竖版叙事封面：从前景到远景层层递进，让视线向内走。主体放在竖向中段三分之一处——竖画幅给的纵向空间远大于横向，主体偏中心就会被裁掉。用电影感光线，竖构图。不要写字。"
  }
];

/* 浏览器顶层 const 不挂 global object，Node 用 module.exports。
   两边都要能拿到，见项目记忆里的「双跑取全局必须走容器」约定。 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { LAYOUTS: LAYOUTS };
}