/* ============================================================
 * 数据层 B-1：日本动画代表作品 IP
 * 字段：zh 中文名 / romaji / grp 分组 / year / studio / kw 英文关键词 / desc 中文视觉特征 / demo 英文示例
 * ============================================================ */

const WORKS_JP = [
  /* ---------- 1970s-1980s 手绘黄金期 ---------- */
  { id:"W-J01", zh:"机动战士高达 0079", romaji:"Mobile Suit Gundam", grp:"日本·1970-80年代", year:1979, studio:"SUNRISE",
    kw:["real robot","mobile suit","federation and zeon","hard surface armor","analog film grain"],
    desc:"写实机器人谱系的开山之作。量产机具备明显的工业产品感，配色为军绿与沙黄，胶片颗粒极重，是电视动画在高清化之前的典型质感。",
    demo:"mobile suit standing in desert battlefield, real robot design, olive and tan military colors, 1970s anime cel style, heavy film grain, epic low angle" },

  { id:"W-J02", zh:"鲁邦三世", romaji:"Lupin III", grp:"日本·1970-80年代", year:1971, studio:"TMS",
    kw:["lupin iii","monkey punch style","thin angular faces","1970s anime","car chase"],
    desc:" Monkey Punch 的原创画风：瘦长脸、尖下巴、随性抖动的线条，人物五官常带笑语。色彩以水彩感的原色平涂为主，背景常简化。",
    demo:"thief in green jacket and red tie, monkey punch style, thin angular face, classic car in background, 1970s anime cel, vivid flat colors" },

  { id:"W-J03", zh:"宇宙战舰大和号", romaji:"Space Battleship Yamato", grp:"日本·1970-80年代", year:1974, studio:"Office Academy",
    kw:["space battleship","retro mecha design","deep space","analog cel painting","1970s sci-fi"],
    desc:"带有蒸汽味的宇宙战舰：舰桥、炮塔、舰首波动炮，轮廓修长。整体偏向手绘上色的厚重感，配合强烈的胶片怀旧基调。",
    demo:"giant battleship cruising between stars, retro 1970s mecha design, deep space, analog cel painting, orange sun flare, dramatic composition" },

  { id:"W-J04", zh:"超时空要塞", romaji:"Macross", grp:"日本·1970-80年代", year:1982, studio:"Studio Nue / Tatsunoko",
    kw:["variable fighter","vf-1 valkyrie","transforming mecha","missile salvo","idol singer"],
    desc:"可变战机加歌姬加战争的三角组合。VF-1 的三种形态是十年间最经典的机设，导弹齐射的光轨与演唱会灯光都极具辨识度。",
    demo:"variable fighter transforming mid-air, macross style valkyrie, missile salvo light trails, cityscape below, 1980s detailed cel animation" },

  { id:"W-J05", zh:"龙珠", romaji:"Dragon Ball", grp:"日本·1970-80年代", year:1986, studio:"Toei Animation",
    kw:["dragon ball","akira toriyama style","super saiyan","ki aura","muscular shonen proportions"],
    desc:"鸟山明的造型语言：圆润的肌肉块、尖刺般的头发、方下巴。超级赛亚人的金发与能量气场，是全球辨识度最高的动漫视觉之一。",
    demo:"super saiyan warrior powering up, spiky golden hair, intense ki aura particles, akira toriyama style angular face, desert background, energy glow" },

  { id:"W-J06", zh:"圣斗士星矢", romaji:"Saint Seiya", grp:"日本·1970-80年代", year:1986, studio:"Toei Animation",
    kw:["bronze saint","cloth armor","constellation motif","burning cosmo","1980s dramatic shading"],
    desc:"车田正美式的华丽：星座主题圣衣的金属反光、戏剧化的明暗对比、近乎舞台剧的站姿。主色为深蓝与鎏金，配合火焰般的能量。",
    demo:"bronze saint in shining cloth armor, cosmos energy flames rising, dramatic 1980s cel shading, starry constellation background, heroic pose" },

  { id:"W-J07", zh:"城市猎人", romaji:"City Hunter", grp:"日本·1970-80年代", year:1987, studio:"Sunrise",
    kw:["city hunter","1980s noir anime","neon shinjuku","trench coat","handgun","gouache background"],
    desc:"八十年代都市黑色电影的日式版本：湿润的霓虹街道、风衣与枪火、写字楼夜景。城市背景为全手绘水粉，颗粒厚重。",
    demo:"man in trench coat aiming pistol, 1980s anime noir, neon reflections on wet shinjuku street, detailed gouache background, film grain" },

  { id:"W-J08", zh:"龙猫", romaji:"My Neighbor Totoro", grp:"日本·1970-80年代", year:1988, studio:"Studio Ghibli",
    kw:["totoro","ghibli style","lush summer countryside","cumulus clouds","hand-painted background"],
    desc:"吉卜力最温柔的一面：饱和度极高的夏日绿意、厚涂的天空积云、仿佛能听见蝉鸣的空气。常用儿童视角的低机位与自然的大构图。",
    demo:"two sisters waiting at bus stop with large fuzzy creature, ghibli style, lush green countryside, towering camphor tree, detailed cloudscape, warm summer light" },

  { id:"W-J09", zh:"AKIRA", romaji:"Akira", grp:"日本·1970-80年代", year:1988, studio:"Tokyo Movie Shinsha",
    kw:["akira","cyberpunk neo tokyo","bio glow","hyper detailed mechanical design","red motorcycle"],
    desc:"动画赛博朋克的视觉原点：超高密度的机械与城市细节、荧光红的生物能量、极其精确的逐帧手绘。至今仍是画面信息量的天花板。",
    demo:"red motorcycle drifting through neon ruins of neo tokyo, akira style, hyper detailed mechanical debris, glowing red bio-energy, apocalyptic sky, dramatic light trails" },

  { id:"W-J10", zh:"银河英雄传说", romaji:"Legend of the Galactic Heroes", grp:"日本·1970-80年代", year:1988, studio:"Kitty Films / Magic Bus",
    kw:["space fleet battle","ornate military uniform","baroque interior","classical mood","cosmic scale"],
    desc:"宇宙战争中的古典主义：繁复的欧式军服、巴洛克式宫殿内景、数百艘舰列的对峙构图。色调沉稳庄重，几乎没有滑稽元素。",
    demo:"two massive space fleets facing off, ornate european military uniforms on bridge, baroque golden interior, starfield background, epic symmetrical composition" },

  /* ---------- 1990s ---------------------------- */
  { id:"W-J11", zh:"美少女战士", romaji:"Sailor Moon", grp:"日本·1990年代", year:1992, studio:"Toei Animation",
    kw:["sailor moon","1990s anime","big sparkling eyes","star hair ornaments","transformation sequence","pastel glitter"],
    desc:"九十年代少女动画的图标：超大宝石闪眼、月星发饰、变身花屑与闪光。主色为粉、紫、银，水手服的蝴蝶结与红色高跟靴是标志。",
    demo:"sailor senshi mid-transformation, big sparkling eyes, crescent moon hair ornament, floating stars and pink petals, 1990s anime cel, glitter effects" },

  { id:"W-J12", zh:"幽游白书", romaji:"Yu Yu Hakusho", grp:"日本·1990年代", year:1992, studio:"Studio Pierrot",
    kw:["yu yu hakusho","spirit gun","demon energy","90s shonen","strong jawline"],
    desc:"九十年代《少年 Jump》的粗野派：浓眉大眼、厚重的阴影块、方形下颌。灵丸的蓝色能量球构成主要战斗视觉。",
    demo:"delinquent teen firing spirit gun, blue demon energy gathering in palm, 1990s anime shonen style, strong jawline, night city rooftop, dramatic grain" },

  { id:"W-J13", zh:"灌篮高手", romaji:"Slam Dunk", grp:"日本·1990年代", year:1993, studio:"Toei Animation",
    kw:["slam dunk","basketball anime","sweat and determination","90s sports style","extreme foreshortening"],
    desc:"井上雄彦的写实与夸张并存：肌肉的极端透视缩短、汗珠与青筋都画得实在。构图力量感强，尤其是定格收球的瞬间。",
    demo:"basketball player mid-dunk, extreme perspective foreshortening, sweat flying, intense determined eyes, 1990s sports anime cel, dramatic low angle" },

  { id:"W-J14", zh:"宝可梦 / 宠物小精灵", romaji:"Pokemon", grp:"日本·1990年代", year:1997, studio:"OLM",
    kw:["pokemon","rounded creature design","bright primary colors","soft cel shading","child friendly proportions"],
    desc:"圆润的吉祥物设计加高亮度原色：轮廓简单到孩子能用蜡笔复现。整体采用柔和的赛璐璐明暗与明快的户外场景。",
    demo:"electric yellow mouse creature with red cheeks on boy's shoulder, rounded friendly design, bright anime cel colors, sunny forest path, cheerful mood" },

  { id:"W-J15", zh:"名侦探柯南", romaji:"Detective Conan", grp:"日本·1990年代", year:1996, studio:"TMS / V1 Studio",
    kw:["detective conan","child detective","glasses and bow tie","mystery scene","clean commercial tv anime"],
    desc:"超长寿命的电视动画模板：轮廓简洁、线条稳定、表情幅度收窄，方便长期量产。画风随年代缓慢演进，是观察电视动画演变的标尺。",
    demo:"small boy detective in blue suit with bow tie pointing forward, clean tv anime lineart, city street background, dramatic reveal lighting" },

  { id:"W-J16", zh:"新世纪福音战士", romaji:"Neon Genesis Evangelion", grp:"日本·1990年代", year:1995, studio:"Gainax",
    kw:["evangelion","eva unit-01","purple green mecha design","geometric apostle","english text overlay","psychological imagery"],
    desc:"紫绿配色的 EVA 装甲、几何定理般的使徒、庵野秀明惯用的字幕与黑屏文字。整体混合了机械理性与心理压迫感。",
    demo:"purple and green humanoid mecha roaring against red alert sky, evangelion style, geometric floating enemy above, bold english subtitles overlay, dramatic silhouette" },

  { id:"W-J17", zh:"攻壳机动队", romaji:"Ghost in the Shell", grp:"日本·1990年代", year:1995, studio:"Production I.G",
    kw:["ghost in the shell","cybernetic","thermoptic camouflage","major motoko","rainy asian megacity","cold blue palette"],
    desc:"押井守的冷峻科幻：角色面孔偏成熟成人，雨城建筑的细节密度极高。整体为蓝绿冷调，充满监视与机械的沉默感。",
    demo:"cybernetic woman in rain-soaked megacity, ghost in the shell style, cool blue thermal imaging glow, detailed futuristic architecture, noir atmosphere, film grain" },

  { id:"W-J18", zh:"幽灵公主", romaji:"Princess Mononoke", grp:"日本·1990年代", year:1997, studio:"Studio Ghibli",
    kw:["princess mononoke","ancient forest","kodama spirits","hand-painted ink influence","dark green palette"],
    desc:"吉卜力最黑暗的一作：苔藓深绿的日式森林、木灵等自然神灵、强调手绘笔触的群山。战斗场面血腥程度也远高于其他作品。",
    demo:"girl with ash-stained face mask riding giant wolf through misty ancient forest, ghibli style, glowing kodama spirits in trees, dark green palette, detailed foliage" },

  { id:"W-J19", zh:"星际牛仔", romaji:"Cowboy Bebop", grp:"日本·1990年代", year:1998, studio:"Sunrise",
    kw:["cowboy bebop","jazz noir","1970s retro future","spaceship swordfish","tobacco smoke","desaturated warm tones"],
    desc:"爵士乐驱动的怀旧未来主义：脏色调的七〇年代科幻、烟雾弥漫的酒馆与飞船。整体偏暖褐，是慢节奏与留白的名作。",
    demo:"bounty hunter in blue suit smoking under neon jazz bar sign, cowboy bebop style, smoky desaturated warm palette, 1970s retro future spaceships above" },

  { id:"W-J20", zh:"航海王 / 海贼王", romaji:"One Piece", grp:"日本·1990年代", year:1999, studio:"Toei Animation",
    kw:["one piece","eiichiro oda style","straw hat","exaggerated cartoon expressions","vivid pirate colors"],
    desc:"尾田荣一郎极具弹性的画功：橡皮般的夸张变形与极端复杂的背景道具并存。色彩饱和，人物轮廓粗黑，适合表现夸张情绪。",
    demo:"straw hat pirate grinning on ship deck, one piece style, exaggerated cartoon expressions, vivid saturated colors, billowing sails, epic blue sea" },

  { id:"W-J21", zh:"全职猎人", romaji:"Hunter x Hunter", grp:"日本·1990年代", year:1999, studio:"Nippon Animation / Madhouse",
    kw:["hunter x hunter","nen energy","spiky green hair","clean 90s shonen lines","small card-like characters"],
    desc:"富坚义博的尖锐线条：头身偏低，五官集中在下半脸，服饰简约。念能力的紫色气场构成了绝大多数战斗场面。",
    demo:"spiky haired boy with fishing rod, purple nen energy aura around body, clean 90s shonen lineart, simple background, dynamic confident pose" },

  { id:"W-J22", zh:"少女革命", romaji:"Revolutionary Girl Utena", grp:"日本·1990年代", year:1997, studio:"J.C.Staff",
    kw:["revolutionary girl utena","theatrical symbolism","rose motifs","flat silhouette shadows","vertical framing"],
    desc:"几原邦彦的舞台剧式美学：象征化的玫瑰与城堡剪影、平面的影人、垂直压缩的构图。隐喻密度极高，几乎每一帧都在做符号。",
    demo:"tomboy girl in pink princely uniform dueling with rose sword, utena style, symbolic theatrical background, flat silhouette shadows, rose petals, dramatic vertical frame" },

  { id:"W-J23", zh:"浪客剑心", romaji:"Rurouni Kenshin", grp:"日本·1990年代", year:1996, studio:"Studio Gallop / DEEN",
    kw:["rurouni kenshin","reverse-blade sword","battoujutsu","crimson cross scar","meiji era setting"],
    desc:"明治浪漫加上清爽线条。逆刃刀、脸上的十字疤、风吹起的红发构成主要记忆点，背景多为和风街道与荒野。",
    demo:"wandering swordsman with red cross scar, reverse-blade katana drawn, meiji era japanese town, cherry blossoms falling, dramatic historical anime composition" },

  /* ---------- 2000s ---------------------------- */
  { id:"W-J24", zh:"千与千寻", romaji:"Spirited Away", grp:"日本·2000年代", year:2001, studio:"Studio Ghibli",
    kw:["spirited away","bathhouse","yokai and spirits","detailed traditional architecture","lantern reflections"],
    desc:"日式汤屋建筑、层叠的神灵与细致的木质结构。红色与暖灯的逆光倒影是核心，夜间的水面反光尤其出彩。",
    demo:"girl running across wooden bathhouse bridge at dusk, paper lanterns lighting up, numerous yokai silhouettes, spirited away style, detailed traditional architecture, warm reflection on water" },

  { id:"W-J25", zh:"哈尔的移动城堡", romaji:"Howl's Moving Castle", grp:"日本·2000年代", year:2004, studio:"Studio Ghibli",
    kw:["howl's moving castle","walking steampunk house","rolling green hills","soft european town","warm golden interiors"],
    desc:"欧式田园与蒸汽机械的混搭：会行走的废铁城堡、连绵绿丘、温暖的内景。机械与自然的处理最为轻盈。",
    demo:"walking castle made of scrap metal crossing green hills, howl's moving castle style, rolling countryside, gentle steam clouds, european village below, warm afternoon light" },

  { id:"W-J26", zh:"机动战士高达 SEED", romaji:"Mobile Suit Gundam SEED", grp:"日本·2000年代", year:2002, studio:"Sunrise",
    kw:["gundam seed","early 2000s anime","phase shift armor","glossy bishonen characters","CG-assisted mecha"],
    desc:"零零年代初期华丽化的代表：人物长发美型、发丝多层高光，机体初步引入三维辅助。整体高饱和，宇宙战的爆破高光很多。",
    demo:"white and blue gundam silhouetted against earth orbit, gundam seed style, glossy clean mecha lines, early 2000s digital anime grain, space backdrop, dramatic single light" },

  { id:"W-J27", zh:"攻壳机动队 SAC", romaji:"Ghost in the Shell: Stand Alone Complex", grp:"日本·2000年代", year:2002, studio:"Production I.G",
    kw:["gitS SAC","tachikoma spider tanks","hard surface future city","muted realistic palette","technical ui screens"],
    desc:"比九五版剧场更平实工业化：塔奇克马的圆润造型与重型机械形成平衡，配色克制，界面与监视器大量入画。",
    demo:"blue spider-like robot tank in high tech hangar, section 9 operative beside it, hard surface detailed industrial future, muted realistic palette, technical UI screens" },

  { id:"W-J28", zh:"虫师", romaji:"Mushishi", grp:"日本·2000年代", year:2005, studio:"Artland",
    kw:["mushishi","primordial lifeforms","japanese rural landscape","muted earth tones","quiet contemplative composition"],
    desc:"极简而玄奥：低饱和土色、山野雾气、几乎没有夸张表情。用光晕与半透明线条表现看不见的生命体。",
    demo:"wandering man in misty japanese mountain village at dusk, mushishi style, glowing primitive lifeforms in air, muted earth palette, quiet contemplative mood, detailed nature background" },

  { id:"W-J29", zh:"怪物 Monster", romaji:"Monster", grp:"日本·2000年代", year:2004, studio:"Madhouse",
    kw:["naoki urasawa realism","mature adult characters","1990s germany setting","detailed muted backgrounds","psychological tension"],
    desc:"浦泽直树的成人向写实：中年人的面部褶皱、阴冷的欧洲建筑、几乎不用夸张表演。动画中少见的成熟压抑气质。",
    demo:"mature surgeon standing in cold european hospital corridor, naoki urasawa realism, heavy detailed faces, muted grey palette, psychological tension, cinematic framing" },

  { id:"W-J30", zh:"交响诗篇", romaji:"Eureka Seven", grp:"日本·2000年代", year:2005, studio:"Bones",
    kw:["eureka seven","surfing mecha","trapar waves","soft pastel skies","bright adventure mood"],
    desc:"滑板机器人的浪漫设定：在天空波浪上滑行、粉彩色云海、开阔的构图。整体明亮，带有少年成长与旅行的气息。",
    demo:"lfo mecha surfing glowing sky waves above clouds, eureka seven style, soft pastel gradient sky, adventure mood, board-like flying machines, expansive open composition" },

  { id:"W-J31", zh:"钢之炼金术师", romaji:"Fullmetal Alchemist", grp:"日本·2000年代", year:2003, studio:"Bones",
    kw:["fullmetal alchemist","automail arm","alchemy transmutation circle","european industrial fantasy","clean crisp lineart"],
    desc:"荒川弘的厚重加上骨头社的清晰：机械铠的分件与铆钉、炼成阵的几何符号、欧洲工业革命时期的砖石城镇。",
    demo:"short blond alchemist with metal arm clapping hands, glowing blue alchemy circle beneath, european industrial town, crisp clean lineart, golden light, dramatic pose" },

  { id:"W-J32", zh:"死亡笔记", romaji:"Death Note", grp:"日本·2000年代", year:2006, studio:"Madhouse",
    kw:["death note","apple-eating shinigami","dark academia chic","red blue contrast lighting","detailed gothic props"],
    desc:"小畑健的时尚写实：细长犀利的眼型、哥特式装饰的死神、强烈的红蓝对比光。整体是学院派的黑暗精致。",
    demo:"pale gothic death god eating apple beside dark winged student, death note style, sharp elegant features, harsh red and blue contrast lighting, detailed leather notebook" },

  { id:"W-J33", zh:"叛逆的鲁路修", romaji:"Code Geass", grp:"日本·2000年代", year:2006, studio:"Sunrise",
    kw:["code geass","clamp character designs","geass eye glow","knightmare frame mecha","imperial uniform"],
    desc:"CLAMP 的人设：细长四肢、长睫毛、纤细到近乎不真实的腰身。白色镶金的帝国军服与能量翼装置辨识度极高。",
    demo:"black-haired prince in ornate white and gold military uniform, glowing red eye geass effect, knightmare mecha silhouette behind, code geass style, elegant slender proportions" },

  { id:"W-J34", zh:"凉宫春日的忧郁", romaji:"The Melancholy of Haruhi Suzumiya", grp:"日本·2000年代", year:2006, studio:"Kyoto Animation",
    kw:["haruhi suzumiya","band performance","school club room","bright energetic lighting","kyoto animation gloss"],
    desc:"京阿尼早期的代表作：圆润的脸上放着很大的高光眼，校服贴身平整，社团部室与乐队演出场景光感活泼。",
    demo:"energetic schoolgirl playing guitar in club room, haruhi style, bright studio lighting, energetic anime expressions, glossy detailed hair, warm cheerful mood" },

  { id:"W-J35", zh:"幸运星", romaji:"Lucky Star", grp:"日本·2000年代", year:2007, studio:"Kyoto Animation",
    kw:["lucky star","otaku culture references","flat comedic timing","simple backgrounds","purple twin tails"],
    desc:"萌文化的自我幽默：扁平的喜剧节奏、简化到近乎符号的人物、紫色双马尾。背景常被简化成固定暖色光源。",
    demo:"purple twin-tailed girl arguing with blue-haired friend at desk, lucky star style, comedic chibi-leaning expressions, simple warm classroom, bright flat colors" },

  { id:"W-J36", zh:"CLANNAD", romaji:"CLANNAD", grp:"日本·2000年代", year:2007, studio:"Kyoto Animation",
    kw:["clannad","key visual","pastel school route","cherry blossom path","gentle emotional light"],
    desc:"Key 社与京都动画融合的峰值：头身偏大、身体娇小、极度柔焦的光晕、樱花街道。整体以治愈与泪点为取向。",
    demo:"girl standing under cherry blossom path with dandelion fluff floating, clannad style, soft pastel lighting, big glossy eyes, emotional gentle composition" },

  { id:"W-J37", zh:"秒速 5 厘米", romaji:"5 Centimeters per Second", grp:"日本·剧场版", year:2007, studio:"CoMix Wave Films",
    kw:["makoto shinkai","hyper detailed background","photo-real clouds","melancholic light","seasonal transition"],
    desc:"新海诚的成名作：近乎摄影写实的城市街景、层次丰富的云、电线杆与信号灯。情绪是距离与错过的犹豫。",
    demo:"boy and girl parting at snowy train crossing, makoto shinkai style, hyper detailed realistic background, dramatic layered clouds, melancholic golden sunset, falling snow" },

  { id:"W-J38", zh:"穿越时空的少女", romaji:"The Girl Who Leapt Through Time", grp:"日本·剧场版", year:2006, studio:"Madhouse",
    kw:["time leap sequence","retro showa summer","blue cumulus sky","fluid hand-drawn motion","red hair ribbon"],
    desc:"细田守与贞本义行的组合：昭和气息的夏日小镇、巨大的蓝色积云、流畅的手绘运动。时间跳跃时的画面扭曲是名场面。",
    demo:"high school girl flying leap through time over summer town, blue huge cumulus sky, tomato-red hair ribbon, fluid hand-drawn motion, warm nostalgic light" },

  { id:"W-J39", zh:"天元突破", romaji:"Gurren Lagann", grp:"日本·2000年代", year:2007, studio:"Gainax",
    kw:["gurren lagann","drill motifs","oversized mecha scale","sunglasses pilot","spiral energy trails"],
    desc:"把钻头与热血推到荒谬程度的作品：机体尺寸从手掌一路膨胀到星系级，螺旋能量的光轨与粗犷轮廓是标志。",
    demo:"gigantic drill robot punching through space with spiral energy trails, gurren lagann style, huge exaggerated scale, sunglasses-wearing pilot, dramatic dynamic composition" },

  { id:"W-J40", zh:"化物语", romaji:"Bakemonogatari", grp:"日本·2000年代", year:2009, studio:"Shaft",
    kw:["bakemonogatari","shaft head tilt","flat pasted background","text-heavy screen","red hairclip","black and red contrast"],
    desc:"新房昭之的图形美学：四十五度歪头、背景突然压平成贴纸、屏幕上烧录文字。系列主色为黑与红。",
    demo:"schoolgirl with long black hair and red hairclip doing 45 degree head tilt, bakemonogatari style, flat pasted abstract background, floating text fragments, stark red and black contrast" },

  { id:"W-J41", zh:"银魂", romaji:"Gintama", grp:"日本·2000年代", year:2006, studio:"Sunrise / BN Pictures",
    kw:["gintama","silver curly hair","edo period aliens","comedic parody expressions","wooden sword"],
    desc:"空知英秋的恶搞世界：江户町、外星人与现代梗并存。人物在美型与搞笑之间随时切换，表情落差极大。",
    demo:"lazy samurai with silver curly hair and wooden sword in edo-period alien town, gintama style, expressive comedic face, lantern-lit street, warm comedic palette" },

  { id:"W-J42", zh:"NANA", romaji:"NANA", grp:"日本·2000年代", year:2006, studio:"Madhouse",
    kw:["nana","punk rock fashion","smoky eye makeup","city lights tokyo","mature elegant lineart"],
    desc:"矢泽爱的高时尚写实：长睫毛、烟熏妆、朋克皮革与蕾丝、东京夜霓虹。画风远离萌系，更接近时装插画。",
    demo:"two stylish young women side by side in tokyo night, nana style, smoky eye makeup, punk leather and gothic lace fashion, elegant long limbs, city neon bokeh" },

  /* ---------- 2010s ---------------------------- */
  { id:"W-J43", zh:"魔法少女小圆", romaji:"Puella Magi Madoka Magica", grp:"日本·2010年代", year:2011, studio:"Shaft",
    kw:["madoka magica","desaturated magical girl","grief seed","painted labyrinth background","surreal witch labyrinth"],
    desc:"童话外衣下的黑暗：背景采用拼贴式素材，魔女结界是超现实纸片剧场。粉白配色背后藏着压抑与绝望。",
    demo:"pink-haired magical girl in white and pink frilly dress, madoka style, dark desaturated magical atmosphere, surreal collage background art, floating grief seed, foreboding light" },

  { id:"W-J44", zh:"进击的巨人", romaji:"Attack on Titan", grp:"日本·2010年代", year:2013, studio:"Wit Studio / MAPPA",
    kw:["attack on titan","walled city","3d maneuver gear","colossal titan scale","gritty desaturated tones"],
    desc:"巨人与城墙的恐惧：立体机动装置的钢索纵横画面、体量差异带来压迫感、土褐色调粗粝。后期转为更暗的沉郁影像。",
    demo:"soldier flying between buildings with 3d maneuver gear cables, giant humanoid titan peering over huge stone wall, desaturated dusty palette, dynamic vertical composition, dramatic light" },

  { id:"W-J45", zh:"刀剑神域", romaji:"Sword Art Online", grp:"日本·2010年代", year:2012, studio:"A-1 Pictures",
    kw:["sword art online","aincrad floating castle","black and red coat","translucent game ui","light novel anime look"],
    desc:"轻小说改编的工业样板：黑衣剑士、悬浮城堡艾恩葛朗特、半透明的游戏界面。发丝分层高光是典型的美型处理。",
    demo:"black-coated swordsman standing on floating castle terrace, sword art online style, translucent blue game ui elements, glossy hair, vast sky above clouds, modern light novel anime look" },

  { id:"W-J46", zh:"Re:从零开始的异世界生活", romaji:"Re:Zero", grp:"日本·2010年代", year:2016, studio:"White Fox",
    kw:["rezero","returns by death motif","silver half-elf","fantasy royal town","ominous underlying shadows"],
    desc:"银发精灵与中世纪王都，画面对比强烈。每次轮回死亡后，色调会朝着更沉的方向偏移，温暖与不安共存。",
    demo:"silver-haired half-elf girl in white mansion courtyard, rezero style, medieval fantasy city behind, warm sunlight with underlying ominous shadows, detailed elegant robes" },

  { id:"W-J47", zh:"一拳超人", romaji:"One Punch Man", grp:"日本·2010年代", year:2015, studio:"Madhouse / J.C.Staff",
    kw:["one punch man","bald caped hero","hyper detailed action lines","flat comedic face","dynamic impact frames"],
    desc:"反差是核心：极度精细的力量线与爆炸，配上完全平面、毫无表情的秃头主角。严肃与搞笑在同一格切换。",
    demo:"bald hero in yellow cape with white gloves throwing serious punch, one punch man style, extreme detailed action lines, flat comedic calm face, explosion behind, high contrast" },

  { id:"W-J48", zh:"JOJO的奇妙冒险", romaji:"JoJo's Bizarre Adventure", grp:"日本·2010年代", year:2012, studio:"David Production",
    kw:["jojo bizarre adventure","araki hirohiko","stand spirit avatars","jojo pose","bold gold and purple"],
    desc:"荒木飞吕彦的夸张造型：替身灵体、浓重的黑色投影、螓金装饰。角色的站姿本身就是作品符号，配色极度大胆。",
    demo:"muscular man in dramatic twisted jojo pose with glowing spectral figure behind, araki hirohiko style, heavy black shadows, gold ornament details, vibrant purple and gold palette" },

  { id:"W-J49", zh:"你的名字", romaji:"Your Name", grp:"日本·剧场版", year:2016, studio:"CoMix Wave Films",
    kw:["your name","shinkai photography-style light","comet streak sky","tokyo cityscape","hyper detailed lens flare"],
    desc:"新海诚的巅峰：摄影式构图配合彗星轨迹与强烈逆光。黄昏时分的错位远景与逆光剪影最为经典。",
    demo:"two teenagers standing on opposite hilltops at dusk, your name style, comet streaking across layered clouds, hyper detailed lens flare, golden hour lighting, emotional distance" },

  { id:"W-J50", zh:"紫罗兰永恒花园", romaji:"Violet Evergarden", grp:"日本·2010年代", year:2018, studio:"Kyoto Animation",
    kw:["violet evergarden","prosthetic arms","1900s european post-war","gorgeous detailed backgrounds","soft golden light"],
    desc:"京都动画的技术天花板：二十世纪初欧洲街道与室内极致精细，义手的金属与皮肤材质对比强烈，金色柔光贯穿全片。",
    demo:"golden-haired girl with delicate metal prosthetic hands writing letter in sunlit european post office, violet evergarden style, gorgeous detailed interior, soft warm golden light" },

  { id:"W-J51", zh:"排球少年", romaji:"Haikyu!!", grp:"日本·2010年代", year:2014, studio:"Production I.G",
    kw:["haikyu","volleyball dynamic","indoor court rim light","orange court floor","sweat and motion"],
    desc:"滞空瞬间的透视夸张：运动员在半空弓身拉伸，场馆边缘光勾出轮廓，木地板反射橘色。汗水与肌肉线条是重点。",
    demo:"short spiky-haired player mid-spike above net, haikyu style, indoor gymnasium rim lights, orange court floor reflection, sweat droplets, dynamic low camera angle" },

  { id:"W-J52", zh:"我的英雄学院", romaji:"My Hero Academia", grp:"日本·2010年代", year:2016, studio:"Bones",
    kw:["my hero academia","superhero school","quirk effects","muscular heroic form","bold comic lines"],
    desc:"美式英雄与日式校园的混合：英雄服带有护目镜与配件细节，个性能力以发光与能量形式呈现，粗直线很有力量。",
    demo:"green-haired teen unleashing glowing green lightning energy from fist, hero costume with utility belt, dynamic action lines, bones style crisp lines, dramatic school stadium background" },

  { id:"W-J53", zh:"灵能百分百", romaji:"Mob Psycho 100", grp:"日本·2010年代", year:2016, studio:"Bones",
    kw:["mob psycho 100","psychic aura","bowl-cut protagonist","explosive psychic effects","loose energetic linework"],
    desc:"把压抑的能量一次性释放：崩坏的构图、飞散的物品、肆意的色粉与漩涡。画风在极简与极乱之间反复跳跃。",
    demo:"plain bowl-cut student releasing explosive psychic shockwave around body, mob psycho style, chaotic vibrant energy effects, distorted background and objects flying, intense layered particles" },

  { id:"W-J54", zh:"小林家的龙女仆", romaji:"Miss Kobayashi's Dragon Maid", grp:"日本·2010年代", year:2017, studio:"Kyoto Animation",
    kw:["kobayashi dragon maid","dragon girl maid outfit","cozy daily comedy","soft round faces","warm interior lighting"],
    desc:"京都动画的日常喜剧：巨乳龙女仆配日式家居，龙角、尾巴与厚重的女仆裙并存。光源永远温暖柔和。",
    demo:"smiling dragon maid with horns and tail serving tea in cozy living room, kobayashi style, soft round faces, warm interior lamp light, detailed domestic background, comfortable comedy mood" },

  { id:"W-J55", zh:"来自深渊", romaji:"Made in Abyss", grp:"日本·2010年代", year:2017, studio:"Kinema Citrus",
    kw:["made in abyss","layered abyss strata","cute contrast dark themes","detailed organic cavern","god rays from above"],
    desc:"极端反差：孩童般的圆润角色，配上细致到残酷的生态环境与黑暗主题。竖向深渊的分层构图制造眩晕。",
    demo:"two small adventurers gazing up at enormous layered abyss chasm, made in abyss style, detailed organic cavern walls, beams of light from above, vast scale, wonder and dread" },

  { id:"W-J56", zh:"少女终末旅行", romaji:"Girls' Last Tour", grp:"日本·2010年代", year:2017, studio:"WHITE FOX",
    kw:["girls last tour","ruined industrial cityscape","desaturated grey tones","kettenkrad vehicle","quiet melancholy"],
    desc:"极简的末日：两个孩子穿越灰色的废土工业遗迹，大量的雾、雪与静默。构图留白，色调统一低饱和。",
    demo:"two small girls on tiny tracked vehicle crossing vast grey ruined industrial landscape, girls last tour style, desaturated muted tones, fog, quiet melancholic wide composition" },

  { id:"W-J57", zh:"约定的梦幻岛", romaji:"The Promised Neverland", grp:"日本·2010年代", year:2019, studio:"CloverWorks",
    kw:["promised neverland","ornate orphanage","shifting horror light","kaleidoscope eyes","european estate architecture"],
    desc:"悬疑切换的代表：欧式孤儿院的温暖日光与突然压下来的黑影，角色眼瞳的多层高光在恐惧时变化明显。",
    demo:"children smiling in sunlit ornate orphanage with long shadow creeping, promised neverland style, european estate architecture, subtle horror undertone, high contrast window light" },

  { id:"W-J58", zh:"OVERLORD", romaji:"Overlord", grp:"日本·2010年代", year:2015, studio:"Madhouse",
    kw:["overlord","undead skeletal overlord","dark fantasy mmo","ornate black gold armor","gothic throne room"],
    desc:"黑暗奇幻的君主：骷髅魔法咏唱者配黑金铠甲，纳萨力克地下城的哥特式内饰。对称威压构图，紫焰常做点缀。",
    demo:"skeletal undead overlord in ornate black and gold armor on dark throne, purple magical flames in eye sockets, gothic nazarick interior, imposing symmetrical composition, dramatic dark light" },

  { id:"W-J59", zh:"辉夜大小姐想让我告白", romaji:"Kaguya-sama: Love is War", grp:"日本·2010年代", year:2019, studio:"A-1 Pictures",
    kw:["kaguya sama","student council comedy","chibi reaction faces","vivid red and black","sharp expressive eyes"],
    desc:"高速心理战：锐利的眼型与红黑校服，角色在俊美的智斗与 Q 版变颜之间瞬间切换，喜剧反差强烈。",
    demo:"black-haired elegant girl with intense sharp eyes plotting in student council room, chibi exaggerated reaction beside her, vivid red and black palette, comedic dramatic lighting" },

  { id:"W-J60", zh:"关于我转生变成史莱姆那件事", romaji:"That Time I Got Reincarnated as a Slime", grp:"日本·2010年代", year:2018, studio:"8bit",
    kw:["tensei slime","cute blue slime creature","bright fantasy town","friendly monster designs","cheerful vivid colors"],
    desc:"圆润可爱的异世界：蓝色果冻状主角、讨喜的怪物群像、明亮的市集与街道。几乎没有阴影压力，适合轻松题材。",
    demo:"small round blue slime creature with tiny arms among friendly monster crowd in bright fantasy town, vivid cheerful colors, soft rounded shapes, sunny marketplace background" },

  { id:"W-J61", zh:"盾之勇者成名录", romaji:"Rise of the Shield Hero", grp:"日本·2010年代", year:2019, studio:"Kinema Citrus",
    kw:["shield hero","green shield","betrayal dark tone","fantasy rpg gear","determined lone hero"],
    desc:"冷处理的异世界：绿盾、背叛叙事、灰暗的战斗环境。装备磨损与尘土让画面比同类作品更沉重。",
    demo:"lone hero with large green shield protecting small companion, fantasy battlefield with waves of monsters, dark determined expression, rpg armor details, dramatic dust cloud" },

  { id:"W-J62", zh:"佐贺偶像是传奇", romaji:"Zombieland Saga", grp:"日本·2010年代", year:2018, studio:"MAPPA",
    kw:["zombieland saga","zombie idols","local kyushu color","visible stitches details","comedic idol contrast"],
    desc:"僵尸偶像的反差：缝线与尸斑等细节写实，舞台灯光却极度闪耀。地方色彩与荒诞喜剧并存。",
    demo:"group of zombie girls performing on stage, visible stitches and decomposing patches, bright idol spotlight and glitter, energetic performance pose, comedic horror contrast" },

  { id:"W-J63", zh:"天气之子", romaji:"Weathering with You", grp:"日本·剧场版", year:2019, studio:"CoMix Wave Films",
    kw:["weathering with you","hyper detailed tokyo rainstorm","luminous rain","shinto rooftop shrine","dramatic cloudscape"],
    desc:"以雨为主角：每一滴雨都被光点亮，巨型积雨云压在城市之上。废弃神社屋面上的祈祷场景最为有名。",
    demo:"girl praying on abandoned rooftop shrine with hands together, torrential luminous rain, towering storm clouds above tokyo, shinkai style detailed city, dramatic sideways light" },

  { id:"W-J64", zh:"Fate/Zero", romaji:"Fate/Zero", grp:"日本·2010年代", year:2011, studio:"Ufotable",
    kw:["fate zero","dark heroic spirit battles","ufotable effects","golden ornate armor","grim dark tones"],
    desc:"厚重的黑暗圣杯战争：鎏金铠甲的英灵、深色调背景配高亮特效。暗底加亮光是飞碟社一贯的公式。",
    demo:"tall golden-armored hero spirit materializing in dark burning city, fate zero style, glowing red magical runes, ufotable dark lighting with bright effects, dramatic symbols circle" },

  /* ---------- 2020s ---------------------------- */
  { id:"W-J65", zh:"鬼灭之刃", romaji:"Demon Slayer", grp:"日本·2020年代", year:2019, studio:"Ufotable",
    kw:["demon slayer","breathing technique effects","taisho era japan","fire and water particles","dark base neon accents"],
    desc:"呼吸特效把日式浮世绘波浪与火焰数字化：水纹、火粉与刀光叠成厚重华丽的一层。暗底配高亮是最重要的公式。",
    demo:"swordsman unleashing breathing technique with flowing water and flame particles, demon slayer style, taisho era night mountain, cyan and orange effects against dark scene, dramatic dynamic frame" },

  { id:"W-J66", zh:"咒术回战", romaji:"Jujutsu Kaisen", grp:"日本·2020年代", year:2020, studio:"MAPPA",
    kw:["jujutsu kaisen","cursed energy blue purple","domain expansion","hooded eyepatch teen","gritty modern occult"],
    desc:"现代咒灵的处理：紫蓝色咒力、领域展开的黑色空间、粗颗粒噪点。角色常有眼罩与遮眼布。",
    demo:"hooded teen with flowing dark hair releasing purple cursed energy, shattered concrete domain around him, jujutsu kaisen style, gritty grain, dramatic modern occult city" },

  { id:"W-J67", zh:"电锯人", romaji:"Chainsaw Man", grp:"日本·2020年代", year:2022, studio:"MAPPA",
    kw:["chainsaw man","chainsaw head transformation","gritty film grain","bold flat red and black","cinematic action framing"],
    desc:"藤本树的粗野感：大面积平涂的红与黑、粗颗粒、接近电影的分镜。暴力被处理得平静而直接。",
    demo:"young man with chainsaw blades erupting from head and arms, blood spray in flat bold red, chainsaw man style, heavy film grain, cinematic low angle, gritty urban night" },

  { id:"W-J68", zh:"间谍过家家", romaji:"Spy x Family", grp:"日本·2020年代", year:2022, studio:"Wit Studio / CloverWorks",
    kw:["spy x family","1960s retro european chic","telepathic blonde child","slapstick comedy","warm pastel palette"],
    desc:"复古六十年代的欧风：笔挺的西装、洋装与古城街道，加上读心小女儿的喜剧表情。构图工整，配色讨喜。",
    demo:"suave spy in green suit walking with elegant black-haired assassin wife and small pink-haired telepathic daughter, retro 1960s european town, warm pastel commercial palette" },

  { id:"W-J69", zh:"葬送的芙莉莲", romaji:"Frieren: Beyond Journey's End", grp:"日本·2020年代", year:2023, studio:"Madhouse",
    kw:["frieren","elven mage pointy ears","quiet fantasy landscapes","nostalgic muted greens","gentle time passage"],
    desc:"长寿精灵的回望：旅行的静默、柔和的青绿草原、低饱和的回忆光影。整体是事后的余韵，几乎没有紧张感。",
    demo:"white-haired elven mage in simple pointed hat walking through quiet flower field, distant companions silhouettes, frieren style, nostalgic muted green landscape, soft gentle light" },

  { id:"W-J70", zh:"迷宫饭", romaji:"Delicious in Dungeon", grp:"日本·2020年代", year:2024, studio:"Studio Trigger",
    kw:["delicious in dungeon","monster cuisine","dungeon crawling party","trigger playful linework","warm food closeups"],
    desc:"把怪物料理画到让人食指大动：火光下的炖锅特写、油亮汤汁、夸张的反应表情。线条活泼。",
    demo:"adventuring party cooking monster stew in torch-lit dungeon, delicious food glisten, trigger style playful thick lines, warm firelight, funny expressive reactions" },

  { id:"W-J71", zh:"【我推的孩子】", romaji:"Oshi no Ko", grp:"日本·2020年代", year:2023, studio:"Doga Kobo",
    kw:["oshi no ko","idol stage glitter","star-shaped eyes","dark industry secrets","harsh contrast lighting"],
    desc:"偶像批判的双面：眼中的星形高光是舞台谎言的符号，后台却是冷光与暗影。舞台与现实的明暗反差极强。",
    demo:"idol girl with glowing star-shaped eyes performing on glittering stage, oshi no ko style, harsh contrast between stage glow and dark backstage, vivid pink lighting, crowd light sticks" },

  { id:"W-J72", zh:"孤独摇滚", romaji:"Bocchi the Rock!", grp:"日本·2020年代", year:2022, studio:"CloverWorks",
    kw:["bocchi the rock","pink anxious guitarist","live house lighting","exaggerated expression comedy","flying symbolic objects"],
    desc:"社恐与爆发的两极：极度变形的惊恐脸配搭 Live House 的光尘。常出现飞散的象征性物件与抽象处理。",
    demo:"shy pink-haired guitarist frozen in panic then exploding with energy on live stage, dramatic spotlight through haze, surreal exaggerated comedy face, flying symbolic objects" },

  { id:"W-J73", zh:"更衣人偶坠入爱河", romaji:"My Dress-Up Darling", grp:"日本·2020年代", year:2022, studio:"CloverWorks",
    kw:["my dress up darling","cosplay costume detail","glossy long dark hair","blushy romantic comedy","detailed fabric textures"],
    desc:"极度重视材质的光泽：布料、蕾丝、金属扣与皮肤的高光层层分明。角色体态成熟，摄影式用光。",
    demo:"glamorous gyaru with long dark hair in elaborate cosplay costume, detailed fabric lace and accessories, soft blush cheeks, bright photography-style lighting, dressing room mirror background" },

  { id:"W-J74", zh:"赛博朋克：边缘行者", romaji:"Cyberpunk: Edgerunners", grp:"日本·2020年代", year:2022, studio:"Studio Trigger",
    kw:["cyberpunk edgerunners","gunhead cyberpsychosis","turquoise and magenta","retrowave night city","extreme perspective"],
    desc:"扳机社与游戏团队的合体：青色与洋红的霓虹故障、极端透视、夸张突破口。夜之城的脏、亮、快三件套。",
    demo:"chrome-armed runner sprinting through night city with glowing implants, cyberpunk edgerunners style, turquoise and magenta neon glitch effects, extreme perspective, chaotic energy" },

  { id:"W-J75", zh:"Lycoris Recoil", romaji:"Lycoris Recoil", grp:"日本·2020年代", year:2022, studio:"A-1 Pictures",
    kw:["lycoris recoil","red ribbon uniform","gunfu action","bright cheerful contrast","clean commercial anime"],
    desc:"明亮的间谍少女：红丝带制服、双枪动作、阳光充足的街道。欢声笑语的画风底下是另一个色调的叙事。",
    demo:"smiling twin-tailed girl in red ribbon uniform dual-wielding pistols in action, lycoris recoil style, bright cheerful sunlight, crisp clean lineart, dynamic urban scene" },

  { id:"W-J76", zh:"蓝色监狱", romaji:"Blue Lock", grp:"日本·2020年代", year:2022, studio:"8bit",
    kw:["blue lock","egoist football","muscular intense players","speed lines and aura","abstract target frame"],
    desc:"把足球画成格斗：肌肉拉扯到夸张、速度线与自我气场环绕，球场常化为抽象白空间加瞄准框。",
    demo:"intense soccer player running with glowing egoist aura and speed lines, abstract white space background with target frame, blue lock style, sharp determined eyes, dramatic motion" },

  { id:"W-J77", zh:"药师少女的独语", romaji:"The Apothecary Diaries", grp:"日本·2020年代", year:2023, studio:"Toho Animation / OLM",
    kw:["the apothecary diaries","ancient chinese palace","intricate hanfu ornaments","green-tinged freckles","detailed court intrigue"],
    desc:"以中国宫廷推理为骨架：繁复的汉服纹样、发饰与廊柱装饰，女主脸颊的点状雀斑是记忆点。色调偏玉暖。",
    demo:"freckled apothecary girl in intricate chinese palace hanfu examining herbs among detailed court architecture, warm lantern and jade tones, ornate accessories, curious sharp eyes" },

  { id:"W-J78", zh:"怪兽 8 号", romaji:"Kaiju No. 8", grp:"日本·2020年代", year:2024, studio:"Production I.G",
    kw:["kaiju no 8","defense force kaiju battle","transforming protagonist","urban destruction scale","clean modern action lines"],
    desc:"主角即是怪物：防卫队制服、肌肉外侧覆盖生物甲的开裂变化。城市废墟与怪兽体量的对比干净利落。",
    demo:"muscular transforming protagonist with cracking kaiju armor revealed, defense force battle against giant monster in ruined city, clean modern anime lineart, dust and debris, epic scale" },

  { id:"W-J79", zh:"胆大党", romaji:"Dandadan", grp:"日本·2020年代", year:2024, studio:"Science SARU",
    kw:["dandadan","occult meets aliens","turbo granny","frantic action comedy","psychedelic effects"],
    desc:"妖怪与外星人的混战：狂躁的动作、迷幻的色块与变形线条。画面永远处在过载状态。",
    demo:"teens fighting bizarre yokai-alien hybrid in psychedelic action scene, dandadan style, wild fluid linework, vivid unnatural colors, frantic energy, dynamic impact effects" },

  { id:"W-J80", zh:"机动战士高达：水星的魔女", romaji:"Gundam: The Witch from Mercury", grp:"日本·2020年代", year:2022, studio:"Sunrise",
    kw:["gundam witch from mercury","gund-bit drones","glossy white purple gundam","school duel arena","corporate space future"],
    desc:"机体造型走向光滑流线：白配紫的曲面装甲、浮空的远程遥控机、学园决斗场地。整体干净而现代。",
    demo:"sleek white and purple gundam with floating remote drone bits in school duel arena, glossy curved armor, futuristic corporate space setting, dramatic dual stance" },

  { id:"W-J81", zh:"铃芽之旅", romaji:"Suzume", grp:"日本·剧场版", year:2022, studio:"CoMix Wave Films",
    kw:["suzume","doorways to another world","abandoned japanese ruins","cat-sized stool companion","otherworldly sky"],
    desc:"灾害后的公路片：废弃校舍与温泉街、立在荒野中的孤门、超现实常世星空。现实景物严谨，异界极度夸张。",
    demo:"teenage girl reaching toward glowing doorway standing alone in abandoned overgrown ruins, otherworldly star-filled sky above, huge surreal fish shadows, nostalgic warm colors" },

  { id:"W-J82", zh:"无职转生", romaji:"Mushoku Tensei", grp:"日本·2020年代", year:2021, studio:"Studio Bind",
    kw:["mushoku tensei","detailed fantasy world","gorgeous background paintings","textured historical landscapes","soft atmospheric light"],
    desc:"以背景美术见长：乡镇建筑、林道与远山的层次丰富，笔触厚实。异世界转生题材里画面质量最高的代表。",
    demo:"young mage wand in hand overlooking sweeping fantasy valley village, mushoku tensei style, richly painted detailed european fantasy landscape, soft atmospheric light, layered depth" },

  { id:"W-J83", zh:"圣女魔力无所不能", romaji:"The Saint's Magic Power is Omnipotent", grp:"日本·2020年代", year:2021, studio:"diomedea",
    kw:["saints magic","herb crafting","pastel isekai court","soft romantic palette","clean elegant dresses"],
    desc:"女性向异世界的柔和派：药草、宫廷长袍、柔光。与战斗向相反，画面以安稳与明亮为主。",
    demo:"young saintess in elegant pastel court dress brewing herbs with soft magical glow, ornate palace room, gentle romantic light, detailed botanical details, calm isekai mood" },

  { id:"W-J84", zh:"王者天下", romaji:"Kingdom", grp:"日本·2020年代", year:2012, studio:"Studio Signpost / Pierrot",
    kw:["kingdom","warring states china","army banners and dust","harsh war-torn terrain","gritty mature lineart"],
    desc:"战国时代的大场面：黄土沙暴、成排军旗、成千上万的士卒。线条粗犷成熟，明显偏向历史写实而非美型。",
    demo:"ancient chinese general with great blade leading charge through dust battlefield, massive army banners billowing, harsh war-torn yellow terrain, gritty mature lineart, epic historical scale" },

  { id:"W-J85", zh:"鬼灭之刃：柱训练篇", romaji:"Demon Slayer: Hashira Training Arc", grp:"日本·2020年代", year:2024, studio:"Ufotable",
    kw:["hashira training arc","ufotable composite effects","night fog ambience","layered bloom highlights","high fidelity still"],
    desc:"在原有暗底上把合成特效推到极限：夜雾、层数极多的辉光、刀光与雨雪的复合。三色黑红白对比更硬。",
    demo:"hashira silhouette warrior standing in mist with glowing blade slash arcs, ufotable composite effects, night fog, layered bloom highlights, high fidelity anime still, dramatic tension" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { WORKS_JP };
