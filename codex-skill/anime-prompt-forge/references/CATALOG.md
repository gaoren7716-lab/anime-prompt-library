# 条目分类速查

全部 133 条可直接出图的条目。规范码是喂给 `forge.js build` 的参数。
画幅与主色是出图时必须真的照设的参数，不是元数据。

| 层 | 条目数 | 决定 |
|---|---|---|
| 画风 style | 59 | 怎么画 |
| 题材 theme | 32 | 画什么 |
| 版式 layout | 30 | 怎么摆 |
| 配色 palette | 12 | 什么色 |

---

## 一、画风 style（59）

决定笔触、上色逻辑、材质与年代质感。**不含场景**——场景交给题材层。

### 技法（15）

| 码 | 中文 | English | 技法要点 |
|---|---|---|---|
| `ST-001` | 赛璐璐平涂 | Cel Shading | The classic Japanese cel logic: one flat tone for the lit side, one for the … |
| `ST-002` | 现代数码柔光 | Modern Digital Soft Shading | The dominant commercial illustration finish since roughly 2015: flat base sh… |
| `ST-003` | 厚涂 / 油绘感 | Thick Paint / Painterly | Keeps the brushstroke visible and builds volume through heavy opaque layerin… |
| `ST-004` | 透明水彩 | Transparent Watercolor | Low-saturation and highly transparent, with pigment edges blooming naturally… |
| `ST-005` | 粗描线稿 / 线稿至上 | Bold Lineart Focus | Line weight drives the whole image — the line itself is the modelling langua… |
| `ST-006` | 半写实 / 真人向动画 | Semi-Realistic Anime | Sits between anime and photoreal: facial proportions close to a real person … |
| `ST-007` | Q 版 / 二头身 | Chibi / Super Deformed | Head-to-body ratio compressed to about two or three heads, hands and feet si… |
| `ST-008` | 黑白漫画页 | Monochrome Manga | Pure black and white plus screentone dots and concentrated line, reproducing… |
| `ST-009` | 水墨 / 墨绘 | Sumi-e / Ink Wash | Emphasises single-stroke brushwork, reserved white space, and the wet-to-dry… |
| `ST-010` | 浮世绘 / 木版画 | Ukiyo-e Woodblock | Flat colour areas, heavy black contour, and washi paper texture, with strong… |
| `ST-011` | 像素画 | Pixel Art | Low-resolution grid, limited palette, ordered dithering for transitions. Eve… |
| `ST-012` | 剪影 / 负空间 | Silhouette & Negative Space | The subject is compressed into a single solid black or single-hue mass, read… |
| `ST-013` | 手绘草稿质感 | Pencil Sketch / Draft | Keeps the construction lines, repeated strokes and speckle of an unfinished … |
| `ST-014` | 高对比霓虹 / 夜景摄影感 | Neon Night / Cyber Palette | Cyan and magenta carry the key light, supported by wet-ground reflection and… |
| `RG-009` | 动画截图感 | Anime Screencap Simulation | Expressionistic overpainting: violent brush direction and clashing colour ap… |

### 年代（7）

| 码 | 中文 | English | 技法要点 |
|---|---|---|---|
| `ER-001` | 70 年代复古机器人动画 | Retro 70s Mecha Anime | The late-70s mecha television era: orange-red biased palette, visible film g… |
| `ER-002` | 80 年代黄金赛璐璐 | 80s Golden Age Cel | The peak of hand-drawn production from OVA boom to the end of the century: t… |
| `ER-003` | 90 年代电视动画质感 | 90s TV Anime Cel | The 90s television look: slight fade and colour bleed from 16mm transferred … |
| `ER-004` | 00 年代过渡期数码 | Early 2000s Digital | The awkward and appealing hybrid period: characters still fully cel-shaded w… |
| `ER-005` | 10 年代高清电视动画 | 2010s Modern TV Anime | The standard look after 1080p became the norm: extremely crisp linework, bri… |
| `ER-006` | 20 年代 UHD 特效流 | 2020s High-Fidelity FX | The current top-tier television standard: heavy use of digital particles, le… |
| `ER-007` | 录像带 VHS 噪波 | VHS / Analog Tape | Analogue videotape rendering: chroma bleeding between channels, horizontal t… |

### 工作室（14）

| 码 | 中文 | English | 技法要点 |
|---|---|---|---|
| `SB-001` | 吉卜力（宫崎骏） | Studio Ghibli Style | Extremes of value contrast: near-black masses beside near-white, heavy black… |
| `SB-002` | 京都动画（京阿尼） | Kyoto Animation Style | Energetic painted backgrounds with strong perspective and extensive atmosphe… |
| `SB-003` | SHAFT（新房昭之） | Shaft / Akiyuki Shinbo | Soft, atmospheric, low-contrast rendering with an abundance of blown highlig… |
| `SB-004` | Ufotable（飞碟社） | Ufotable Style | Dense fine linework carrying most of the description, with narrow tonal rang… |
| `SB-005` | TRIGGER（扳机社） | Studio Trigger Style | Rounded, simplified figure construction with large heads and simplified limb… |
| `SB-006` | 骨头社 BONES | Studio BONES | A flat, poster-like finish with strong geometric blocking, bold areas of unm… |
| `SB-007` | MADHOUSE（今敏写实路线） | Madhouse Realism | Heavy black outlines, flat fills, and a deliberately narrow, slightly desatu… |
| `SB-008` | MAPPA / WIT 现代暗调 | MAPPA / WIT Dark Cinematic | Dense tonal realism: full gradation, material rendering with distinct surfac… |
| `SB-009` | David Production（JOJO 线） | David Production / Hirohiko Araki | Diagonal-dominant composition, extreme perspective, and speed expressed thro… |
| `SB-010` | Science SARU（汤浅政明） | Science SARU / Masaaki Yuasa | Rounded forms with soft gradient shading and a bright, high-key palette; com… |
| `SB-011` | Production I.G（押井守路线） | Production I.G / Oshii | Distinctive silhouette-first design, exaggerated proportion, and small separ… |
| `SB-012` | 日升 SUNRISE（机甲谱系） | Sunrise Mecha Lineage | A cool, restrained palette with a dominant single hue, low overall saturatio… |
| `SB-013` | A-1 / CloverWorks 轻改流 | A-1 Pictures / CloverWorks | Painterly backgrounds carrying elaborate real-world detail while figures sta… |
| `SB-014` | Studio Colorido（3D 融合） | Studio Colorido | Smooth, glossy, high-finish rendering with a bright palette, evenly distribu… |

### 地区（9）

| 码 | 中文 | English | 技法要点 |
|---|---|---|---|
| `RG-001` | 国产二维动画风 | Chinese 2D Anime (Donghua) | Ornate, high-density decorative treatment with abundant pattern and gilt-ton… |
| `RG-002` | 国产三维动漫 CG | Chinese 3D CG Donghua | Monumental, precisely constructed forms with disciplined colour and hard edg… |
| `RG-003` | 美式卡通（Cartoon Network 系） | Western Cartoon / CN Style | A palette of damp earth colours and mossy greens with low-key interior illum… |
| `RG-004` | 迪士尼复兴+手绘经典 | Disney Renaissance | A soft, grainy charcoal-and-chalk rendering with compressed midtones and vis… |
| `RG-005` | 成人动画 / Adult Swim 系 | Adult Swim TV Animation | Precisionist clarity with luminous colour, immaculate surface finish and har… |
| `RG-006` | 蜘蛛侠平行宇宙（2D+3D 混合） | Spider-Verse Hybrid 2D/3D | Mural-scale composition with monumental figures, layered spatial recession a… |
| `RG-007` | 韩漫 / Webtoon 条漫 | Webtoon / Manhwa | Ukiyo-e conventions: flat colour areas, heavy contour, asymmetry, and a low … |
| `RG-008` | VTuber / 虚拟主播立绘 | VTuber Character Art | Restrained two-ink construction with generous reserved white, a limited pigm… |
| `RG-010` | Vaporwave / 复古未来主义 | Vaporwave Retro-Futurism | Realist-inflected drawing with measured tonal gradation and warm, low-chroma… |

### 全球流派（14）

| 码 | 中文 | English | 技法要点 |
|---|---|---|---|
| `MV-001` | 橡胶管动画（1930s） | Rubber Hose Animation | Chinese ink-wash animation conventions: brush-driven line, ink wash gradatio… |
| `MV-002` | Cuphead 手绘水彩风 | Cuphead / Hand-Painted Watercolor | Western television animation conventions with confident elastic posing, smea… |
| `MV-003` | 清晰线条派（丁丁线） | Ligne Claire / Clear Line | Hand-painted background art conventions: gouache texture, layered atmospheri… |
| `MV-004` | 爱尔兰手绘装饰风 | Cartoon Saloon / Irish Ornament | Neon-noir animation conventions: near-monochrome base with two saturated acc… |
| `MV-005` | 欧式绘本水彩 | European Picture Book Watercolor | Mecha design conventions: layered mechanical plate armour, hard-surface pane… |
| `MV-006` | 黏土定格动画 | Claymation / Stop Motion | Fantasy-race illustration conventions with decorative costume pattern, cool … |
| `MV-007` | 剪影与剪纸动画 | Silhouette & Papercut Animation | Contemporary webtoon illustration conventions: vertical scroll rhythm, gener… |
| `MV-008` | 有限动画现代主义 | UPA / Limited Animation Modernism | Retro printmaking conventions: limited spot colour, visible halftone or misr… |
| `MV-009` | 拼贴与混合媒介 | Collage & Mixed Media | Stained-glass and mosaic animation conventions: every shape bounded by a hea… |
| `MV-010` | 孔版印刷质感 | Risograph Print Indie | Paper-cut and silhouette-stop-motion animation conventions: layered cut pape… |
| `MV-011` | 童书绘本插画 | Picture Book Illustration | Mid-century advertising illustration conventions: confident single-weight co… |
| `MV-012` | 转描现实主义 | Rotoscoping | Contemporary digital concept-art conventions: broad value masses establishin… |
| `MV-013` | 苏联 · 东欧手绘 | Soviet & Eastern European Hand-Drawn | Screen-print poster conventions: two or three flat inks, hard-edged registra… |
| `MV-014` | 花窗玻璃与马赛克 | Stained Glass & Mosaic | Leaded-glass animation conventions: heavy black leading bounding every eleme… |

---

## 二、题材 theme（32）

决定画面内容与情境。正文自带完整场景，**这里不要再叠一个场景**。

### 战斗动作（6）

| 码 | 中文 | English | 核心要求 |
|---|---|---|---|
| `TH-001` | 热血战斗 | Battle Shonen | 低角度仰拍强化表现力，背景配放射线或爆炸云；服装加磨损与污渍增加说服力。… |
| `TH-002` | 机甲 / 机器人 | Mecha | 机库 Hangar / 战场废墟；常写 low angle looking up 表现体量压迫感。… |
| `TH-003` | 忍者 / 武士 | Ninja & Samurai | 竹林、道场、月下屋顶、樱花庭园；横向构图最适合表现拔刀的瞬间。… |
| `TH-004` | 特摄战队 / 变身英雄 | Sentai & Tokusatsu | 巨大化战斗、经典的变身变奏长镜头；建议 16:9 画幅，保留特摄的舞台感。… |
| `TH-005` | 军事 / 战争题材 | Military & War | 战场远景 + 冷色调；角色动作姿态要避免过于潇洒，以免失真。… |
| `TH-006` | 巨型怪兽 / 巨物感 | Kaiju & Colossal Scale | 低机位 + 巨大阴影笼罩；加浅景深，让人与巨兽形成清晰的体量对比。… |

### 幻想（6）

| 码 | 中文 | English | 核心要求 |
|---|---|---|---|
| `TH-007` | 剑与魔法（西幻） | High Fantasy | 哥特教堂、古代遗迹、地下城；光源由魔法泛光主导。… |
| `TH-008` | 异世界转生 | Isekai | 冒险者公会、中世纪街道、地牢入口；强化现代角色与环境之间的反差感。… |
| `TH-009` | 魔法少女 | Magical Girl | 星空背景、花瓣 / 泡泡、变身光带；正面偶像式站姿最稳。… |
| `TH-010` | 妖怪 / 百鬼夜行 | Yokai & Hyakki Yagyo | 神社鸟居、提灯长廊、百鬼夜行队列；暖橙灯光 + 冷夜色对比最强。… |
| `TH-011` | 神话改编 | Mythology Retelling | 神殿、星空、浮雕墙面；对称构图最能出神性。… |
| `TH-012` | 恶役千金 / 反转重生 | Villainess Reincarnation | 宫廷舞厅、玫瑰园、贵族学园；灯光偏暖蜡烛。… |

### 科幻（7）

| 码 | 中文 | English | 核心要求 |
|---|---|---|---|
| `TH-013` | 赛博朋克 | Cyberpunk | 狭窄巷道、雨夜屋顶、密密麻麻的霓虹广告；必加 reflections on wet ground。… |
| `TH-014` | VR / 游戏世界 | VRMMO & Game World | 悬浮 UI + 虚化的环境背景；注意别让 UI 挡住脸。… |
| `TH-015` | 宇宙歌剧 / 太空 | Space Opera | 舰桥、舷窗远景星球、陨石带；没有浊气，一切要 crisp。… |
| `TH-016` | 时间穿越 / 循环 | Time Travel & Loop | 教学楼天台、空无一人的街道、雨；用 double exposure 表达叠加。… |
| `TH-017` | 蒸汽朋克 | Steampunk | 砖砌工厂、飞艇码头、齿轮机械室；暖色 + 金属质感。… |
| `TH-018` | 末世 / 废土 | Post-Apocalyptic | 废弃城市、荒野公路、被藤蔓覆盖的校舍；强烈夕照或雾。… |
| `TH-019` | 生化感染 / 幸存 | Zombie & Outbreak | 封锁带、废弃校舍、夜里发光的孢子；低饱和冷色。… |

### 日常情感（7）

| 码 | 中文 | English | 核心要求 |
|---|---|---|---|
| `TH-020` | 校园日常 | School Life | 教室窗边 or 屋顶水塔；夕阳光 + 长影最有效。… |
| `TH-021` | 治愈慢生活 | Healing Slice of Life | 农村老家、咖啡店、被炉、雨 awning；自然光优先。… |
| `TH-022` | 恋爱 / 青春 | Romance | 樱花道、天台、烟花大会、车站；黄昏或夜晚最出味。… |
| `TH-023` | 美食 / 料理 | Food & Cooking | 木质厨桌、居酒屋、家庭厨房；暖光 + 浅景深。… |
| `TH-024` | 音乐 / 乐队 | Music & Band | Live House、天台排练；顶光 + 薄雾最出效果。… |
| `TH-025` | 偶像 / 演艺 | Idol | 舞台中央、车站广告牌、后台；多用彩虹色光斑与高光。… |
| `TH-026` | 职场 / 社畜 | Working Adult | 办公室隔断、居酒屋、深夜电车；荧光灯的冷光。… |

### 运动竞技（2）

| 码 | 中文 | English | 核心要求 |
|---|---|---|---|
| `TH-027` | 运动热血 | Sports | 体育馆（背光灯）+ 球场透视线；用 low angle + motion blur。… |
| `TH-028` | 竞速 / 机战载具 | Racing & Machines | 山道、夜隧道、环道；必须写 motion blur + light trails。… |

### 悬疑黑暗（3）

| 码 | 中文 | English | 核心要求 |
|---|---|---|---|
| `TH-029` | 推理 / 悬疑 | Mystery & Detective | 雨夜霓虹街、审讯室、旧馆library；低照度 + 单光源。… |
| `TH-030` | 恐怖 / 灵异 | Horror & Occult | 长廊、无人教室、深夜便利店；用 heavy grain 与低饱和。… |
| `TH-031` | 都市怪谈 / 里世界 | Urban Legend / Backrooms | 黄褐色调的办公室、无限延伸的商场、VHS 画质；讲究「不合理空间」本身。… |

### 东方国风（1）

| 码 | 中文 | English | 核心要求 |
|---|---|---|---|
| `TH-032` | 仙侠 / 武侠国风 | Xianxia & Wuxia | 云海山巅、竹林、宫殿飞檐；建议配合水墨感与留白构图。… |

---

## 三、版式 layout（30）

决定元素怎么分布。**画幅必须照设**，比例不同出的是两张图。

### 社媒卡（6）

| 码 | 名称 | 画幅 | 结构 | 注意 |
|---|---|---|---|---|
| `LT-001` | 上下图文卡 | `3:4` | 上半部整块画面，下半部整块文字，中间留一条明确分界。适合金句、观点、结论先行的小红书图。 | 文字占比不要超过画面 40%，否则模型会把字画糊；正文要短 |
| `LT-002` | 文案主导卡 | `3:4` | 背景近乎空白，一个极简元素点缀，大面积留给文字。适合金句、语录、态度表达。 | 极简版式对模型最友好——元素越少越不容易出错，也最不容易出废图 |
| `LT-003` | 对偶双栏卡 | `1:1` | 画面竖直一分为二，左右各一个内容，用于对比、前后、两种做法。 | 两个主体的画风、景别、光线必须一致，否则模型会当成两张不同的画 |
| `LT-004` | 签名角落卡 | `1:1` | 主体偏置，某个角落留出固定位置放署名或账号。适合个人 IP 的固定图型。 | 留空位置要写进提示词，否则模型会自己写一个假签名上去 |
| `LT-005` | 全出血沉浸卡 | `9:16` | 画面顶天立地铺满，不留任何边框。适合手机全屏浏览的短视频封面。 | 满出血构图里主体必须偏离正中心，否则裁切时会正好切到脸 |
| `LT-006` | 竖向长条卡 | `9:16` | 极窄的竖长条，内容自上而下堆叠。适合手机滚动阅读的信息流。 | 元素要按从上到下的顺序排，读起来才是一条线而不是一堆散块 |

### 信息图（6）

| 码 | 名称 | 画幅 | 结构 | 注意 |
|---|---|---|---|---|
| `LT-007` | 金字塔层级图 | `1:1` | 自上而下三层或四层的金字塔，用来表达「上位概念包含下位概念」。 | 层数别超过四层，再多就读不出来了；层宽差要明显 |
| `LT-008` | 中心主图标注图 | `1:1` | 中心一个主体，四周引出标注线指向各部分。适合解剖、构成、部件说明。 | 标注线要与主体真实相交，不能凭空连到空气里 |
| `LT-009` | 并列对比图 | `16:9` | 多行多列的网格，每格一个单元。适合清单、参数、选项对比。 | 格子之间留白要一致，格子大小不一致会让画面显得乱 |
| `LT-010` | 时间轴流程图 | `16:9` | 横向从左到右的节点串联。适合步骤、流程、演进过程。 | 节点数量控制在 5 个以内，再多连线会交叉成乱麻 |
| `LT-011` | 分步步骤图 | `3:4` | 步骤式纵向排布，每一步一个独立小画面。适合教程、做法、指南。 | 每一步要能独立看懂，不能依赖上一步才成立 |
| `LT-012` | 手帐拼贴图 | `1:1` | 照片、明信片、便签、胶带层层叠贴。适合清单、旅行、生活记录。 | 每个元素要有明确边界，不要糊成一团；胶带要半透明才像真的贴上去 |

### 分镜（6）

| 码 | 名称 | 画幅 | 结构 | 注意 |
|---|---|---|---|---|
| `LT-013` | 规则四格 | `4:3` | 四格等分，顺序推进，最经典的漫画格式。 | 四格之间要有明确留白沟槽，格子贴一起会分不清边界 |
| `LT-014` | 起承转合四格 | `4:3` | 四格分别承担铺垫、发展、转折、收束，读完是一个完整小故事。 | 转折格要跟前两格明显不同，一眼能看出转折点在哪 |
| `LT-015` | 对角切割分镜 | `16:9` | 用斜线把画面切开，两侧内容不同。适合表现对立、速度、失衡。 | 斜切后两侧的地面透视要一致，否则会像两张图硬拼 |
| `LT-016` | 大格冲击页 | `3:4` | 一整幅不切分的画面，承担整页的高潮时刻。适合名场面、情绪爆点。 | 不分割意味着细节要求更高，出图后要在后期加网点或留白强化戏剧感 |
| `LT-017` | 情绪递进条 | `16:9` | 同一构图重复多次，情绪逐格增强。适合表现积累到爆发的过程。 | 构图必须一样，只有表情/姿态变，否则递进关系不成立 |
| `LT-018` | 网格蒙太奇 | `1:1` | 密集小格网，每格一个片段，整体形成节奏与密度。适合表现量、时间跨度、群像。 | 格子多了容易出现人物漂移，同一个人要在多格里保持一致 |

### IP设计（4）

| 码 | 名称 | 画幅 | 结构 | 注意 |
|---|---|---|---|---|
| `LT-019` | 角色三视图 | `16:9` | 正面、侧面、背面三视图并列。适合角色设定、标准件。 | 三视图必须用正交视角，不能有透视变形，否则建模会崩 |
| `LT-020` | 表情差分表 | `16:9` | 同一张脸的多格表情差分。适合角色资产、表情包生产。 | 头部角度要固定，只变表情；否则模型会连头型一起改 |
| `LT-021` | 吉祥物设定页 | `1:1` | 吉祥物的主视觉 + 多角度 + 要素拆解。适合品牌与衍生周边。 | 剪影要能单独认出来——缩到指甲盖大小还认得出才算合格 |
| `LT-022` | 配色情绪板 | `1:1` | 材质样、色块、纹理拼贴成情绪板。适合定调、提案。 | 色块要给出可用的十六进制值，否则无法落地到具体设计 |

### 电商（4）

| 码 | 名称 | 画幅 | 结构 | 注意 |
|---|---|---|---|---|
| `LT-023` | 单品主图 | `1:1` | 单一商品居中，背景干净。适合电商主图与详情页首图。 | 背景不能纯白到失去轮廓，要有一点层次让商品边界清楚 |
| `LT-024` | 多视角展示 | `16:9` | 同一商品多个角度并列。适合需要看细节的商品。 | 多视角之间商品的相对大小要一致，否则看起来像不同商品 |
| `LT-025` | 卖点标注图 | `1:1` | 商品局部放大 + 指示标注。适合讲卖点、材质、参数。 | 标注线要指向真正想说的那个细节，不能乱指 |
| `LT-026` | 使用场景图 | `3:4` | 商品放在真实使用环境里。适合建立使用欲望而非陈列参数。 | 环境要真的像有人用，而不是把商品 P 到风景上 |

### 封面（4）

| 码 | 名称 | 画幅 | 结构 | 注意 |
|---|---|---|---|---|
| `LT-027` | 大字标题封面 | `16:9` | 画面为一个大标题服务，标题区占显著位置。适合公众号、博客封面。 | 标题留空区必须干净，模型很容易在留空处自己写字 |
| `LT-028` | 隐喻主视觉 | `16:9` | 用一个具象画面表达一个抽象概念。适合观点、趋势、思考类封面。 | 隐喻要能从画面直接读出来，不要设计成需要解释的谜语 |
| `LT-029` | 对比冲击封面 | `16:9` | 靠强烈对比抓注意力：尺度、密度、明暗或色温的极端反差。 | 对比只在两个元素之间成立，元素多了互相削弱就没有冲击力了 |
| `LT-030` | 竖版故事封面 | `3:4` | 竖版、有氛围铺陈的画面。适合短篇、章节开场、竖屏内容。 | 竖版画面上下跨度大，主体要放在中段，避免被裁掉 |

---

## 四、配色 palette（12）

整幅图的统一色调。HEX 直接进提示词，不用模型猜。

| 码 | 名称 | 主色 | 点缀 | 适用 |
|---|---|---|---|---|
| `PL-001` | 经典蓝 | `#1B4FD8` | `#F0C419` | 沉稳、可信、有说服力。科技、金融、工具类内容的默认色。 |
| `PL-002` | 柿子橙 | `#E2662A` | `#1F3A5F` | 温热、有食欲、有人味。适合生活、美食、节气、故事。 |
| `PL-003` | 鼠尾草绿 | `#8A9A7B` | `#D9CDB0` | 安静、自然、不刺激。适合护肤、家居、植物、疗愈。 |
| `PL-004` | 普鲁士蓝 | `#12314F` | `#C9A227` | 厚重、考究、有收藏感。适合经典、复古、文艺、历史。 |
| `PL-005` | 胭脂红 | `#C0273A` | `#1C1C1C` | 强烈、有主张、有攻击性。适合节庆、促销、态度表达。 |
| `PL-006` | 奶油黄 | `#F2D9A0` | `#7A5C3E` | 明亮、温和、有食欲。适合儿童、餐饮、春天、日系生活。 |
| `PL-007` | 墨黑金 | `#141414` | `#D4AF37` | 奢侈、庄重、有仪式感。适合美妆、腕表、黑金主题。 |
| `PL-008` | 灰粉 | `#D9A7A0` | `#6E5B58` | 柔和、微暖、有质感。适合美妆、服饰、生活方式。 |
| `PL-009` | 赭石 | `#A0522D` | `#2F2A26` | 质朴、厚重、有土感。适合复古、乡村、陶器、手作。 |
| `PL-010` | 青灰 | `#4A6B70` | `#D9D2C3` | 冷淡、克制、有距离感。适合都市、科技、冬季、纪实。 |
| `PL-011` | 薰衣草 | `#A79BC4` | `#E8E3F0` | 梦幻、柔和、有雾气。适合夜景、回忆、童话、抒情。 |
| `PL-012` | 柠檬绿 | `#C6D92E` | `#2A2E22` | 明快、有反差、有点怪趣。适合潮流、年轻、创意。 |
