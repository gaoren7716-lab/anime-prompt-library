/* ============================================================
 * 动漫提示词库 · 数据层 A：画风流派 ART STYLES
 * 单一数据源（single source of truth），网页与 Markdown 均由本文件生成
 * ============================================================ */

const STYLES = [
  /* ---------------- A1 技法 / 材质层 ---------------- */
  {
    id: "A1-01", zh: "赛璐璐平涂", en: "Cel Shading", cat: "技法",
    /* 「赛璐珞」是长期存在的错写（库里另有节点 VS-05-4 曾用错字）。
       挂在别名表里，照旧错字检索的用户也能命中这一条。 */
    alt: ["赛璐珞", "赛璐珞平涂", "赛璐璐上色"],
    kw: ["cel shading", "flat color", "hard shadow", "clean lineart", "two-tone shading"],
    desc: "最经典的日式动画上色逻辑：亮部一层、暗部一层，边界锐利，几乎无渐变。特征是大面积纯色块 + 明确的第二阴影，适合还原传统电视动画的干净质感。",
    note: "想接近手绘动画截图时，务必同时加 anime screencap / anime cel>",
    demo: "1girl, solo, school uniform, cel shading, flat color, hard shadow, clean lineart, white background, anime screencap, masterpiece"
  },
  {
    id: "A1-02", zh: "现代数码柔光", en: "Modern Digital Soft Shading", cat: "技法",
    kw: ["soft shading", "gradient shading", "airbrush highlight", "digital painting", "smooth blending"],
    desc: "2015 年后主流商业插画的画法：在平涂基础上叠加柔和渐变，高光用喷枪柔边处理，皮肤通透，头发会有多层高光环。视觉比纯赛璐璐更立体、更「贵」。",
    note: "这是当前二次元商业插画的默认画法，适合角色立绘与卡面",
    demo: "1girl, long silver hair, soft shading, gradient skin, glossy eyes, blurred background bokeh, digital painting, masterpiece, best quality"
  },
  {
    id: "A1-03", zh: "厚涂 / 油绘感", en: "Thick Paint / Painterly", cat: "技法",
    kw: ["thick paint", "oily brush strokes", "painterly", "impasto", "visible brushwork", "dense colors"],
    desc: "保留明显笔触，用厚重叠加的颜料感塑造体积，是二次元里最厚重的一支。常见于轻小说封面、机设稿与幻想战争题材，画面信息密度极高。",
    note: "厚涂对模型要求高，SD1.5 出图容易脏，建议 SDXL / Flux 以上",
    demo: "1girl, fantasy armor, thick paint, oily brush strokes, strong lighting, detailed background, oil painting texture, dramatic shadows"
  },
  {
    id: "A1-04", zh: "透明水彩", en: "Transparent Watercolor", cat: "技法",
    kw: ["watercolor", "transparent watercolor", "pigment bleed", "wet-on-wet", "paper texture", "soft edges"],
    desc: "低饱和、高透明度，颜料在纸上自然晕开的边缘，能看见纸纹和颗粒。情绪偏温柔怀旧，非常适合抒情系插画、绘本封面。",
    note: "叠加 watercolor (medium) 或 watercolor (style)，两种写法都能显著强化效果",
    demo: "landscape, sakura, transparent watercolor, pigment bleed, wet-on-wet, paper texture, soft pastel palette, gentle light, illustration"
  },
  {
    id: "A1-05", zh: "粗描线稿 / 线稿至上", en: "Bold Lineart Focus", cat: "技法",
    kw: ["bold lineart", "rough sketch lines", "varying line weight", "line art only", "monochrome lineart"],
    desc: "以线的粗细变化主导画面，线本身就是造型语言。粗轮廓 + 细部线形成节奏，代表是扳机社成立之前的老派作画。",
    note: "配合 lineart, monochrome 可直接生成线稿，适合后期自己上色",
    demo: "portrait of a girl, lineart, monochrome, white background, varying line weight, clean lines, high resolution"
  },
  {
    id: "A1-06", zh: "半写实 / 真人向动画", en: "Semi-Realistic Anime", cat: "技法",
    kw: ["semi-realistic", "anime realism", "detailed skin", "accurate anatomy", "painterly realism"],
    desc: "介于动漫与写实之间：人脸比例接近真人（略微收下颌、放大眼），五官有细节但不完全写实。代表今敏、细田守剧场版的角色处理。",
    note: "控制不好会掉进 uncanny valley，建议把 anime 权重压低而不是删除",
    demo: "portrait, semi-realistic, anime style, detailed face, subtle skin texture, cinematic lighting, realistic proportions"
  },
  {
    id: "A1-07", zh: "Q 版 / 二头身", en: "Chibi / Super Deformed", cat: "技法",
    kw: ["chibi", "super deformed", "2-head-tall", "big head", "tiny limbs", "cute simplified face"],
    desc: "头身比压缩到 2～3 头身，手足简化，五官集中在下半脸。表情幅度夸张，适合表情包、吉祥物、周边设计。",
    note: "sd character / chibi 在 SD 系 + NAI 权重都很吃；MJ 里用 tiny cute character 更稳",
    demo: "chibi catgirl, super deformed, big head, tiny arms, simple background, pastel colors, sticker style, white outline"
  },
  {
    id: "A1-08", zh: "黑白漫画页", en: "Monochrome Manga", cat: "技法",
    kw: ["monochrome", "manga panel", "screentone", "black and white", "ink drawing", "speech bubble"],
    desc: "纯黑白 + 网点纸（screentone）+ 集中线，还原纸质漫画印刷感。注意 AI 生成的文字是乱码，对话气泡要后期加。",
    note: "文字一律后期用排版软件补，不要在 prompt 里指望生成正确日文",
    demo: "two characters arguing, manga panel, monochrome, screentone, heavy inking, dramatic speed lines, black and white, comic page"
  },
  {
    id: "A1-09", zh: "水墨 / 墨绘", en: "Sumi-e / Ink Wash", cat: "技法",
    kw: ["sumi-e", "ink wash painting", "black ink", "rice paper texture", "single-stroke brushwork"],
    desc: "强调一笔成形的运笔、留白与浓淡干湿，最忌满幅填色。与武侠、仙侠、禅意题材天然契合。",
    note: "留白是精髓，构图里务必写 simple composition, negative space",
    demo: "lone crane in shallow water, wind-bent reeds, sumi-e, ink wash painting, black ink on rice paper, negative space, one red seal square, minimal colors"
  },
  {
    id: "A1-10", zh: "浮世绘 / 木版画", en: "Ukiyo-e Woodblock", cat: "技法",
    kw: ["ukiyo-e", "woodblock print", "flat color blocks", "bold outlines", "washi paper texture", "kento marks"],
    desc: "平涂色块 + 粗黑轮廓 + 和纸质感，装饰性强。注意：这是日本江户艺术，与中国古代水墨要区分开来写。",
    note: "想做国风请改用「水墨/国画」，浮世绘整套色感偏装饰 poster 化",
    demo: "lone fisherman on rocky outcrop at dawn, ukiyo-e, woodblock print, bold outlines, flat colors, bokashi sky gradient, washi paper texture, vertical composition"
  },
  {
    id: "A1-11", zh: "像素画", en: "Pixel Art", cat: "技法",
    kw: ["pixel art", "16-bit", "pixelated", "limited palette", "dithering", "sprite"],
    desc: "低分辨率网格 + 有限色板 + 抖动过渡。讲究每个像素都手摆，适合怀旧游戏、地标与界面美术资源。",
    note: "生成后用最近邻放大，别用双线性插值，否则像素糊成一团",
    demo: "fantasy village, pixel art, 16-bit style, limited color palette, dithering, top-down view, crisp pixels"
  },
  {
    id: "A1-12", zh: "剪影 / 负空间", en: "Silhouette & Negative Space", cat: "技法",
    kw: ["silhouette", "backlit", "negative space", "minimal composition", "single accent color"],
    desc: "主体压成纯黑（或单色）色块，靠背景大面积留白/渐变衬托轮廓。海报感极强，常用于电影式构图。",
    note: "轮廓要干净，主体加 rim light / 关节处留光才不会糊成一坨",
    demo: "samurai silhouette against giant red sun, negative space, backlit, rim light, minimal composition, poster style"
  },
  {
    id: "A1-13", zh: "手绘草稿质感", en: "Pencil Sketch / Draft", cat: "技法",
    kw: ["pencil sketch", "rough draft", "construction lines", "graphite texture", "unfinished lines"],
    desc: "保留草图阶段的辅助线、复线、噪点，画面像分镜稿或设定集未完成稿。很有「作者性」。",
    note: "与 clean lineart 互斥，选一个方向，别同时要",
    demo: "character design sheet, pencil sketch, sketchpad paper texture, multiple rough attempts, graphite shading"
  },
  {
    id: "A1-14", zh: "高对比霓虹 / 夜景摄影感", en: "Neon Night / Cyber Palette", cat: "技法",
    kw: ["neon lighting", "night city", "rim light", "chromatic aberration", "cyberpunk palette", "reflections on wet ground"],
    desc: "以青紫洋红为主光源，配合湿地反光与边缘光。这是近年最通用的「高级感配方」，几乎万能。",
    note: "控制霓虹占比，光源超过两种画面就会脏",
    demo: "girl standing in rainy alley, neon signs, cyan and magenta rim light, reflections on wet asphalt, cinematic, detailed background"
  },

  /* ---------------- A2 年代层 ---------------- */
  {
    id: "A2-01", zh: "70 年代复古机器人动画", en: "Retro 70s Mecha Anime", cat: "年代",
    kw: ["1970s anime style", "retro mecha", "grainy film", "limited animation", "super robot", "chunky robot design"],
    desc: "盖塔、魔神 Z 一代：色偏橘红、纸质感颗粒、机器人造型敦实方正，作画帧数很少（有限动画），人物脸部容易被某些模型误判成老外。",
    note: "叠一句 limited animation 能明显压出当年的「三帧省成法」手感",
    demo: "super robot, 1970s anime style, retro mecha design, grainy film texture, orange sky, cel painted, limited animation"
  },
  {
    id: "A2-02", zh: "80 年代黄金赛璐璐", en: "80s Golden Age Cel", cat: "年代",
    kw: ["1980s anime", "classic cel animation", "grainy film still", "analog film grain", "vivid primary colors", "hand-painted background"],
    desc: "OVA 兴起到世纪末的巅峰手绘背景：水粉厚涂的背景美术 + 强对比赛璐璐角色 + 胶片颗粒。阿基拉、攻壳前夕、城市猎人这一脉。",
    note: "背景美术单独强调 detailed background painting, gouache background 效果最好",
    demo: "1980s anime, detective in trench coat, neon city, detailed gouache background, grainy film still, analog colors, strong contrast"
  },
  {
    id: "A2-03", zh: "90 年代电视动画质感", en: "90s TV Anime Cel", cat: "年代",
    kw: ["1990s anime style", "anime cel", "film grain", "slightly desaturated", "VHS softness", "classic anime"],
    desc: "少女革命、EVA、美少女战士、口袋妖怪那个年代：16mm 胶转磁的轻微退色、柔和的暗角、为了省钱的低帧。怀旧杀器。",
    note: "90 年代 tag 要配合低饱和，纯 bright colorful 会跑偏成现代数码",
    demo: "1girl, magical girl outfit, 1990s anime style, anime cel, film grain, VHS softness, slightly muted colors, classic anime eyes"
  },
  {
    id: "A2-04", zh: "00 年代过渡期数码", en: "Early 2000s Digital", cat: "年代",
    kw: ["2000s anime style", "early digital anime", "slight glow bloom", "CG mecha", "transitional style"],
    desc: "手绘与数码混血的尴尬又迷人的阶段：人物还是赛璐璐，已经开始出现泛光效果与三维辅助背景/机甲，色彩饱和度偏高。",
    note: "00 年代的「油光感」来自后期 bloom，别再加 film grain 抢戏",
    demo: "1girl, 2000s anime style, digital composite, subtle bloom, glossy hair highlight, mid-frame studio lighting"
  },
  {
    id: "A2-05", zh: "10 年代高清电视动画", en: "2010s Modern TV Anime", cat: "年代",
    kw: ["modern anime", "crisp digital lines", "vibrant colors", "sharp lineart", "layered cel shading"],
    desc: "1080p 制式普及后的标准样貌：线条极锐利、色彩明度高，阴影分层从一层增加为两层。绝大多数「看起来像新番」的图都属此类。",
    note: "这是最安全不踩雷的基础层，先锁定它再加其他变量",
    demo: "1girl, modern anime style, crisp digital lineart, two-layer cel shading, vibrant colors, clean composition"
  },
  {
    id: "A2-06", zh: "20 年代 UHD 特效流", en: "2020s High-Fidelity FX", cat: "年代",
    kw: ["high fidelity anime", "Ufotable effects", "particle effects", "lens flare", "HDR-like highlights", "detailed digital composite"],
    desc: "鬼灭之后一线电视动画的新标准：大量数码粒子、镜头光晕、复合半透明图层素材，画面接近 4K 演示片。",
    note: "特效吃算力也吃模型，SD1.5 基本出不来，建议 SDXL / Flux / Illustrious 等新模型",
    demo: "swordsman mid-attack, high fidelity anime, particle effects, volumetric light rays, HDR highlights, digital composite"
  },
  {
    id: "A2-07", zh: "录像带 VHS 噪波", en: "VHS / Analog Tape", cat: "年代",
    kw: ["VHS", "VHS tracking error", "analog tape", "chroma bleed", "lo-fi scanlines", "CRT distortion"],
    desc: "故意做旧的播放介质损伤：磁迹失真、色度溢出、扫描线、底部跳动的噪声带。近年低保真与蒸汽波视觉的标配。",
    note: "这是「画质负优化」词，一定要放在 prompt 靠后位置，别让它盖住画质词",
    demo: "anime screenshot of city street, VHS tracking error, chroma bleed, CRT scanlines, lo-fi, dated look, 1990s"
  },

  /* ---------------- A3 工作室 / 导演辨识层 ---------------- */
  {
    id: "A3-01", zh: "吉卜力（宫崎骏）", en: "Studio Ghibli Style", cat: "工作室",
    kw: ["studio ghibli", "miyazaki style", "painterly background", "lush green fields", "soft pastoral light", "hand-drawn background art"],
    desc: "背景美术是最大招牌：厚涂水粉的云、草坡与天空，透视极大，人物小而环境大。人物线条简化，脸偏圆、配色温润。",
    note: "重点是「背景压过角色」，写 wide shot, detailed background, character small in frame",
    demo: "girl flying over green hills, studio ghibli style, painterly sky with cumulus clouds, detailed background painting, wide shot, soft daylight"
  },
  {
    id: "A3-02", zh: "京都动画（京阿尼）", en: "Kyoto Animation Style", cat: "工作室",
    kw: ["kyoto animation", "kyoani style", "soft round face", "delicate eyes", "warm pastel lighting", "subtle blush"],
    desc: "俗称「京都脸」：脸型圆润、眼睛水润高光丰富、头发柔顺分层，打光偏暖，整体有一种温吞、干净、日常呼吸感。",
    note: "关键字是 delicate detailed eyes + soft blush，别用 hard shadows",
    demo: "1girl, school hallway, kyoani style, soft round face, detailed glossy eyes, warm rim light, gentle blush, slice of life"
  },
  {
    id: "A3-03", zh: "SHAFT（新房昭之）", en: "Shaft / Akiyuki Shinbo", cat: "工作室",
    kw: ["shaft style", "head tilt", "extreme wide shot", "flat pasted backgrounds", "text-heavy screen", "surreal composition"],
    desc: "辨识度极高：倾斜镜头、夸张的线条构图、背景突然被压平成扁平贴纸、屏幕上糊满文字，常用单一高对比色（如《物语》系列的粉与黑）。",
    note: "倾斜构图写 dutch angle / low angle extreme wide shot 触发最快",
    demo: "1girl, shaft style head tilt, hard black shadows, flat pasted background, abstract shapes, high contrast pink and black"
  },
  {
    id: "A3-04", zh: "Ufotable（飞碟社）", en: "Ufotable Style", cat: "工作室",
    kw: ["ufotable style", "digital effects", "volumetric light", "blooming gradients", "dark base with neon accents"],
    desc: "底色压暗，靠高质量数码光效提亮：爆炸火花、水/呼吸特效、镜头炫光。鬼灭之刃是其视觉代表。",
    note: "「暗底 + 亮特效」是它的底层公式，务必压暗整体曝光",
    demo: "demon slayer style, katana slash with water breath effect, ufotable, volumetric light, dark palette with cyan flames, digital effects"
  },
  {
    id: "A3-05", zh: "TRIGGER（扳机社）", en: "Studio Trigger Style", cat: "工作室",
    kw: ["studio trigger", "bold thick lines", "exaggerated perspective", "high contrast", "limited color palette", "dynamic pose"],
    desc: "粗线 + 极端透视 + 有限高饱和配色，画面冲击力优先。天元突破、斩服少女、赛博朋克边缘行者。",
    note: "夸张透视用 extreme perspective / fisheye foreground 强化",
    demo: "cyberpunk girl with giant scissors, studio trigger style, bold thick outlines, extreme perspective, purple and yellow palette, dynamic angle"
  },
  {
    id: "A3-06", zh: "骨头社 BONES", en: "Studio BONES", cat: "工作室",
    kw: ["studio bones", "clean mechanical design", "fluid animation frames", "balanced lighting", "crisp action lines"],
    desc: "人与机械都做得漂亮的那一类：《钢之炼金术师》《我的英雄学院》《交响诗篇》。特点是动作原画张数多、机体设计硬朗干净。",
    note: "偏硬派，少软萌少厚涂，走 clean shape + strong silhouette 路线",
    demo: "hero mid-punch, industrial city, studio bones style, crisp action lines, fluid motion blur, clean mechanical background"
  },
  {
    id: "A3-07", zh: "MADHOUSE（今敏写实路线）", en: "Madhouse Realism", cat: "工作室",
    kw: ["madhouse style", "satoshi kon style", "cinematic realism", "psychological framing", "detailed urban background"],
    desc: "今敏一脉：高度写实的都市细节、镜子与屏风式的构图、现实与幻想的边界不断溶解。背景信息密度极高。",
    note: "加了 cinematic realism 后模型会往真人跑，务必保留 anime style 把画风拉回来",
    demo: "urban apartment at dusk, madhouse style, highly detailed realistic background, cinematic framing, tilted composition, muted colors"
  },
  {
    id: "A3-08", zh: "MAPPA / WIT 现代暗调", en: "MAPPA / WIT Dark Cinematic", cat: "工作室",
    kw: ["mappa style", "wit studio", "dark cinematic tones", "heavy grain", "gritty texture", "dramatic lighting"],
    desc: "《进击的巨人》终章、《咒术回战》、《电锯人》：大面积黑影、粗颗粒噪点、崩坏的废墟场景，物体解剖感强，整体氛围压抑。",
    note: "关键在于 heavy grain + low key lighting，画面要敢黑下去",
    demo: "battle in ruined city, dark cinematic tones, heavy grain, low key lighting, gritty texture, dramatic rim light, detailed destruction"
  },
  {
    id: "A3-09", zh: "David Production（JOJO 线）", en: "David Production / Hirohiko Araki", cat: "工作室",
    kw: ["jojo style", "araki hirohiko", "heavy black shadows", "thick ink lines", "exaggerated muscular anatomy", "gold accents"],
    desc: "荒木线：极粗的墨线、眉骨高耸、鼻影浓重、肌肉线条强调到失真，姿势极度戏剧化，配色大胆跳脱。",
    note: "别写实，要写 exaggerated muscular anatomy — 失真正是风格本体",
    demo: "standing man in dramatic pose, jojo bizarre adventure style, araki hirohiko, heavy black shadows, thick ink lines, gold ornament"
  },
  {
    id: "A3-10", zh: "Science SARU（汤浅政明）", en: "Science SARU / Masaaki Yuasa", cat: "工作室",
    kw: ["science saru", "masaaki yuasa", "loose rubber-hose lines", "abstract color blocks", "fluid morphing shapes", "limited rigid perspective"],
    desc: "线条像橡胶一样自由扭曲，背景常被抽象色块或条纹图案替代，人物可以随时形变。最不「工业化」的一支。",
    note: "越失控越对：不要加 clean lines / correct proportions",
    demo: "two characters floating in abstract space, science saru style, loose wobbly lines, flat bold color blocks, psychedelic patterns"
  },
  {
    id: "A3-11", zh: "Production I.G（押井守路线）", en: "Production I.G / Oshii", cat: "工作室",
    kw: ["production i.g", "oshii mamoru", "cold realism", "muted desaturated palette", "architectural detail", "political sci-fi"],
    desc: "攻壳机动队、机动警察：冷色调、低饱和、大量建筑与器械硬表面细节，氛围沉静理性，几乎没有可爱元素。",
    note: "走真实建筑比例，少曲线，多直线与对称构图",
    demo: "cybernetic operative in rain, production i.g style, cold desaturated palette, highly detailed urban architecture, symmetrical composition"
  },
  {
    id: "A3-12", zh: "日升 SUNRISE（机甲谱系）", en: "Sunrise Mecha Lineage", cat: "工作室",
    kw: ["sunrise studio", "real robot", "hard surface mecha design", "military color palette", "mechanical detail"],
    desc: "高达一脉的「写实机器人」：外装甲分块、铆钉/管路等硬表面细节、军绿/沙黄低调配色，机器人当作重工业产品来设计。",
    note: "强化 hard surface modeling / mechanical panel lines，别把它画成圆润的卡通机器人",
    demo: "real robot in hangar, hard surface mechanical design, military olive palette, detailed panel lines, industrial lighting, wide shot"
  },
  {
    id: "A3-13", zh: "A-1 / CloverWorks 轻改流", en: "A-1 Pictures / CloverWorks", cat: "工作室",
    kw: ["cloverworks", "a-1 pictures", "modern light novel look", "glossy hair", "sharp eyes", "clean commercial polish"],
    desc: "轻小说改编的标准工业脸：角色美型度高、头发多层高光与分缕处理、制服笔挺、配色商业且讨喜。《刀剑神域》《辉夜大小姐》《更衣人偶》属此类。",
    note: "这一流派最接近 MJ niji 的默认外观，想反其道而行时要明确加别的风格层",
    demo: "1girl, high school uniform, cloverworks style, glossy hair strands, sharp detailed eyes, bokeh cafe background, bright commercial palette"
  },
  {
    id: "A3-14", zh: "Studio Colorido（3D 融合）", en: "Studio Colorido", cat: "工作室",
    kw: ["studio colorido", "3DCG background integration", "soft realistic lighting", "warm everyday tones", "depth of field"],
    desc: "以 3D 背景 + 2D 人物的融合著称（漂流家园、想哭的我），背景透视精确、光源统一，人物带有轻微 CG 照明过渡。",
    note: "关键是统一人物与背景的光源方向：写 consistent light direction 能显著减少违和",
    demo: "two kids on rooftop at sunset, studio colorido style, 3D rendered background integration, warm golden light, soft shadows, wide city view"
  },

  /* ---------------- A4 地区 / 衍生潮流层 ---------------- */
  {
    id: "A4-01", zh: "国产二维动画风", en: "Chinese 2D Anime (Donghua)", cat: "地区",
    kw: ["chinese anime", "donghua style", "2d chinese animation", "elegant line work", "traditional chinese elements"],
    desc: "近年国产二维（《大理寺日志》《雾山五行》《天官赐福》）分两条路：偏厚涂的华丽装饰路线，与偏传统线描的水墨线条路线。整体比日式更强调装饰性与东方符号。",
    note: "别写成 Japanese anime，国风要用 chinese traditional costume + ink-influenced lines",
    demo: "tang dynasty street scene, chinese 2d animation style, elegant flowing robes, warm lantern light, detailed architecture, eastern palette"
  },
  {
    id: "A4-02", zh: "国产三维动漫 CG", en: "Chinese 3D CG Donghua", cat: "地区",
    kw: ["3d chinese animation", "cg donghua", "unreal engine render", "xianxia costume fantasy", "semi-realistic 3d characters"],
    desc: "《凡人修仙传》《灵笼》《吞噬星空》等：UE 渲染的角色与场景，材质偏真实（布料/金属/皮肤次表面散射），近年来反而成为一种独有的国潮视觉。",
    note: "这是唯一可以直接写 3d render, unreal engine 5 的动漫流派",
    demo: "xianxia cultivator on mountain peak, 3d chinese animation, unreal engine render, flowing hanfu with silk material, dramatic clouds, volumetric light"
  },
  {
    id: "A4-03", zh: "美式卡通（Cartoon Network 系）", en: "Western Cartoon / CN Style", cat: "地区",
    kw: ["western cartoon", "cartoon network style", "rubber hose limbs", "thick outline", "flat bright colors", "expressionist"],
    desc: "探险活宝、宇宙小子、夏令营岛屿：橡皮管四肢、粗均匀描线、极高饱和平涂，表演夸张不受物理约束。",
    note: "与日式的区别在于「简化的几何造型」，别加 anime details",
    demo: "two cartoon kids in forest, western cartoon style, rubber hose arms, thick outlines, flat bright colors, comedic expression"
  },
  {
    id: "A4-04", zh: "迪士尼复兴+手绘经典", en: "Disney Renaissance", cat: "地区",
    kw: ["disney renaissance", "hand-drawn disney", "theatrical lighting", "classical animation", "storybook illustration"],
    desc: "小美人鱼到狮子王再到魔发奇缘：五官比例偏古典、轮廓清晰、背景自带故事书插画的绘画感，整体比日式更「舞台化处理」。",
    note: "写 storybook illustration / theatrical lighting 比重 copy IP 名更容易出味",
    demo: "princess on castle balcony, disney renaissance style, hand-drawn animation, elegant proportions, storybook background, warm golden hour"
  },
  {
    id: "A4-05", zh: "成人动画 / Adult Swim 系", en: "Adult Swim TV Animation", cat: "地区",
    kw: ["adult swim style", "rick and morty style", "crude lineart", "muted sickly palette", "awkward proportions"],
    desc: "刻意粗糙的线、病态低饱和配色、人物比例尴尬但又自洽。《瑞克和莫蒂》《太空终界》这条线，反讽感恰恰来自「画得不精致」。",
    note: "别写 high quality / masterpiece — 精致度会毁掉这个流派的调性",
    demo: "two scientists in garage, adult swim animation style, crude loose lineart, muted sickly green palette, flat backgrounds, awkward proportions"
  },
  {
    id: "A4-06", zh: "蜘蛛侠平行宇宙（2D+3D 混合）", en: "Spider-Verse Hybrid 2D/3D", cat: "地区",
    kw: ["spider-verse style", "comic halftone dots", "3d cel shading hybrid", "ink outlines on 3d model", "vibrant pop colors", "motion smear"],
    desc: "把漫画网点、手绘轮廓、故障效果、亮色分层直接贴到三维渲染的角色上，形成强烈的「会动的漫画」效果。近年最被模仿的技术流派。",
    note: "核心三个词：halftone dots + ink outlines on 3d render + chromatic aberration",
    demo: "superhero swinging between buildings, spider-verse style, halftone dots overlay, 3d render with ink outlines, pop colors, chromatic aberration"
  },
  {
    id: "A4-07", zh: "韩漫 / Webtoon 条漫", en: "Webtoon / Manhwa", cat: "地区",
    kw: ["webtoon style", "manhwa", "vertical scroll composition", "soft airbrush shading", "ultra-detailed eyes", "fashionable styling"],
    desc: "竖屏条漫进化出的画法：服装与时髦道具极度精细、发丝飘逸分层、眼妆与高光明暗对比强烈，整体偏时尚画报审美。",
    note: "服装细节是关键特征，写 elaborate fashionable outfit 比单纯堆画质词更有效",
    demo: "1girl in modern fantasy outfit, manhwa style, ultra-detailed eyes, glossy layered hair, soft airbrush skin, fashionable accessories"
  },
  {
    id: "A4-08", zh: "VTuber / 虚拟主播立绘", en: "VTuber Character Art", cat: "地区",
    kw: ["vtuber style", "live2d character", "eye-catching color scheme", "accessory-heavy design", "front-facing pose", "clean background"],
    desc: "为 Live2D 而生的设计：正面构图居多、配饰与记忆点强烈、配色鲜明、背景干净或纯透明。强调「剪影一眼可辨」。",
    note: "透明背景用途下写 simple background, white background，便于后期抠图",
    demo: "vtuber original character, front facing, distinctive hair ornament, high contrast color scheme, clean simple background, live2d ready"
  },
  {
    id: "A4-09", zh: "动画截图感", en: "Anime Screencap Simulation", cat: "技法",
    kw: ["anime screencap", "anime cel", "tv anime still", "slight film grain", "broadcast quality"],
    desc: "骗 AI 交出「官方截图」的关键层：一层薄胶片颗粒 + 广播级的轻微压缩感，能立刻让画面脱离 AI 插画的长相。",
    note: "几乎所有怀旧向图的收尾都建议加它；但要放在发光/特效词之后",
    demo: "school classroom afternoon, anime screencap, anime cel, soft morning light, slight film grain, cinematic composition"
  },
  {
    id: "A4-10", zh: "Vaporwave / 复古未来主义", en: "Vaporwave Retro-Futurism", cat: "地区",
    kw: ["vaporwave", "retro futurism", "80s computer graphics", "chrome text", "grid landscape", "pastel pink teal"],
    desc: "80 年代对未来幻想的遗骸：粉青配色、透视网格地面、廉价感的铬金属立体字、故障与时间码界面。强装饰性。",
    note: "它是「美学流派」不是角色画法，通常与背景/海报构图搭配",
    demo: "vaporwave landscape, infinite grid floor, chrome statue, pastel pink and teal sky, retro 80s computer graphics aesthetic, glitch artifacts"
  }
];

if (typeof module !== "undefined" && module.exports) module.exports = { STYLES };
