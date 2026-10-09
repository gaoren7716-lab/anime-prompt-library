/* ============================================================
 * 数据层 B-2：国产动画 / 欧美动画 / 二次元游戏 IP
 * ============================================================ */

const WORKS_GLOBAL = [

  /* ---------- 国产动画：上海美术电影制片厂谱系 ---------- */
  { id:"W-C01", zh:"大闹天宫", romaji:"Havoc in Heaven", grp:"国产经典", year:1961, studio:"上海美术电影制片厂",
    kw:["chinese animation classic","peking opera influence","ink and gouache","gold and vermilion clouds","flat decorative lines"],
    desc:"中国动画的奠基之作。京剧脸谱与动作程式直接进入角色设计，云纹与建筑装饰高度图案化，配色以朱红、石青、描金为主。",
    demo:"monkey king leaping among stylized chinese clouds, peking opera inspired pose, ink outline with flat gouache colors, gold and vermilion palette, decorative cloud patterns, classic chinese animation" },

  { id:"W-C02", zh:"哪吒闹海", romaji:"Nezha Conquers the Dragon King", grp:"国产经典", year:1979, studio:"上海美术电影制片厂",
    kw:["chinese animation classic","mythology retelling","bold ink lines","traditional costume","ocean palace"],
    desc:"水墨重彩与装饰性线条的极致：龙宫的琉璃世界、红绫与火尖枪的动势，人物的愤怒与悲壮都靠写意的线条传达。",
    demo:"young deity with red ribbon sash facing dragon king palace under sea, chinese animation classic style, bold ink outlines, flat gouache coloring, swirling water patterns" },

  { id:"W-C03", zh:"葫芦兄弟", romaji:"Calabash Brothers", grp:"国产经典", year:1986, studio:"上海美术电影制片厂",
    kw:["chinese paper-cut animation","flat bright colors","simple geometric shapes","folklore style","bold silhouettes"],
    desc:"剪纸动画的代表：形体被压成平面的几何块面，边缘带剪刀痕迹，色彩纯粹且对比强烈。动作节奏短促有木偶感。",
    demo:"seven small calabash brothers in flat paper-cut shapes, vivid pure colors, simple geometric silhouettes, chinese folk art style, bold outlines, minimal shading" },

  { id:"W-C04", zh:"宝莲灯", romaji:"Lotus Lantern", grp:"国产经典", year:1999, studio:"上海美术电影制片厂",
    kw:["chinese animation","mythology retelling","hand painted background","warm lantern light","soft detailed scenery"],
    desc:"上美影向现代商业动画过渡的作品：背景仍是厚重的传统手绘，光影处理开始吸收西方动画的柔和体积。",
    demo:"young hero holding glowing lotus lantern on misty mountain path, chinese animation style, hand painted detailed landscape, warm golden light, flowing robes" },

  /* ---------- 国产动画电影（近年） ---------- */
  { id:"W-C05", zh:"哪吒之魔童降世", romaji:"Ne Zha", grp:"国产动画电影", year:2019, studio:"彩条屋影业",
    kw:["ne zha","chinese 3d animation","fire and lotus motifs","dark eyebrows heavy makeup","vivid red and cyan magic"],
    desc:"三维国漫的票房里程碑。红黑眼妆、火焰纹样与莲花图腾融合，魔法能量以红蓝双色对比呈现，造型俏皮又凶悍。",
    demo:"rebellious boy deity with two buns and fiery red sash, glowing fire wheels under feet, chinese 3d animation style, dramatic red and cyan energy, epic sky, detailed cg render" },

  { id:"W-C06", zh:"哪吒之魔童闹海", romaji:"Ne Zha 2", grp:"国产动画电影", year:2025, studio:"彩条屋影业",
    kw:["ne zha 2","chinese 3d animation","underwater dragon palace","scale crowd battle","six-armed combat form"],
    desc:"视觉规模大幅升级：海底龙宫的玉宇琼楼、成千上万角色的同屏海战、五行能量分色。注意避免与日本动漫混淆，走国产 CG 路线。",
    demo:"vast undersea dragon army swirling above ornate chinese palace, lone fire-wreathed hero with six arms, chinese 3d animation style, highly detailed cg render, epic symmetrical battle scene" },

  { id:"W-C07", zh:"深海", romaji:"Deep Sea", grp:"国产动画电影", year:2023, studio:"十月文化",
    kw:["deep sea","particle watercolor style","psychedelic ocean colors","chinese animation","dreamlike light"],
    desc:"把粒子化三点式水墨泼进画面：色彩像流动的颜料在水中炸开，梦境与现实用截然不同的笔触区分。国产少见的视觉实验。",
    demo:"girl drifting through psychedelic deep ocean with flowing particle watercolor colors, chinese animation style, dreamlike glowing light, painterly vibrant chaos" },

  { id:"W-C08", zh:"大鱼海棠", romaji:"Big Fish & Begonia", grp:"国产动画电影", year:2016, studio:"彼岸天文化",
    kw:["big fish begonia","chinese mythology","traditional tulou houses","red hanfu","soft eastern fantasy light"],
    desc:"福建土楼、海棠花与巨大的红鱼构成东方奇幻。服饰偏宋制汉风，整体色调偏暖红与青灰，柔光很多。",
    demo:"girl in red hanfu beside giant glowing fish above circular tulou village at night, chinese animation style, eastern fantasy, lantern lights, soft mist, painterly background" },

  { id:"W-C09", zh:"白蛇：缘起", romaji:"White Snake", grp:"国产动画电影", year:2019, studio:"追光动画",
    kw:["white snake","chinese fantasy","ink wash influence","mist covered mountains","ancient dynastic setting"],
    desc:"追光动画的代表：工笔与水墨结合的角色线条，山岚雾气根据叙事情绪浓淡变化，是国产 CG 中最接近水墨气韵的一支。",
    demo:"white snake spirit with flowing robes among mist-covered chinese mountains, ink wash inspired soft outlines, cg chinese animation, ethereal atmosphere, delicate facial features" },

  { id:"W-C10", zh:"长安三万里", romaji:"Chang An", grp:"国产动画电影", year:2023, studio:"追光动画",
    kw:["chang an","tang dynasty poetry","majestic chinese landscape","calligraphy and hanfu","warm historical palette"],
    desc:"以唐诗串联的盛唐长卷：长安城的坊市、舞榭歌台、黄河与雪山，构图常取大远景。配色素雅，接近唐代壁画。",
    demo:"poets drinking on tower overlooking tang dynasty changan city at sunset, chinese animation style, majestic mountain backdrop, flowing hanfu, warm historical palette, poetic wide composition" },

  { id:"W-C11", zh:"中国奇谭", romaji:"Yao-Chinese Folktales", grp:"国产动画", year:2023, studio:"上海美术电影制片厂",
    kw:["yao chinese folktales","ink wash animation","shadow puppet aesthetic","dark whimsical folklore","wasabi deep colors"],
    desc:"短篇合集，每集一套画法：水墨、剪纸、皮影、素描。整体气质志怪而荒诞，比商业动画更接近传统美术实验。",
    demo:"small ink-brush spirit jumping through misty chinese village at night, yao chinese folktales style, washi paper texture, dark whimsical folklore, minimalist negative space" },

  /* ---------- 国产番剧 / 二维二维 ---------- */
  { id:"W-C12", zh:"雾山五行", romaji:"Fog Hill of Five Elements", grp:"国产番剧", year:2020, studio:"好传动画",
    kw:["fog hill of five elements","chinese ink wash animation","dynamic combat motion","elemental powers","classical six dynasties setting"],
    desc:"以水墨写意画战斗：笔锋飞白画出飘动的丝带与泼洒的血墨，动作是连续不停的运动线。国产二维的动作天花板。",
    demo:"warrior unleashing elemental strike with splashing ink strokes and flying ribbons, chinese ink wash animation, dynamic motion, six dynasties village, dramatic brush texture" },

  { id:"W-C13", zh:"大理寺日志", romaji:"White Cat Legend", grp:"国产番剧", year:2020, studio:"好传动画",
    kw:["white cat legend","tang dynasty comedy","flat bright colors","chibi comedy contrast","detailed chinese architecture"],
    desc:"唐代公案喜剧：饱和度高的平面色块、搞笑时用 Q 版变形，严肃时又能画得起厚重的建筑与透视。",
    demo:"white cat magistrate in tang dynasty court robes interrogating suspects, chinese animation comedy style, flat bright colors, detailed tang architecture, expressive wide eyes" },

  { id:"W-C14", zh:"时光代理人", romaji:"Link Click", grp:"国产番剧", year:2021, studio:"澜映画",
    kw:["link click","modern chinese city","photo leap effect","clean modern anime","dramatic twist lighting"],
    desc:"都市超能力悬疑：现代中国街道的写实背景，进入照片时整幅画面的颜色反转。画风清爽，但必须写明是现代中国城市才准。",
    demo:"two young men in modern chinese city street with photo glowing in hand, time leap visual effect, clean modern animation, city neon, dramatic color inversion lighting" },

  { id:"W-C15", zh:"一人之下", romaji:"The Outcast", grp:"国产番剧", year:2016, studio:"Chinese Mirror Animation",
    kw:["the outcast","chinese modern occult","dark comedy","traditional martial arts","gritty urban supernatural"],
    desc:"把中国的术数、八卦与都市异能结合，线条带着混不吝的粗鲁感，比日式更土气也更真实。",
    demo:"laid-back young daoist facing rival in modern chinese ruins, dark urban supernatural atmosphere, martial stance, gritty linework, chinese modern occult symbols glow" },

  { id:"W-C16", zh:"天官赐福", romaji:"Heaven Official's Blessing", grp:"国产番剧", year:2020, studio:"PaymentPaper Studio",
    kw:["heaven official blessing","elegant chinese xianxia","flowing white robes","silver butterflies","soft romantic palette"],
    desc:"女性向国风的最高美术：飘逸的白衣、发丝分层、银蝶点缀。配色淡雅，整体追求「仙」而非「武」。",
    demo:"tall martial god in flowing white robes with red ribbon, glowing silver butterflies around, chinese xianxia animation, soft romantic light, elegant delicate features, misty mountains" },

  { id:"W-C17", zh:"魔道祖师", romaji:"Mo Dao Zu Shi", grp:"国产番剧", year:2018, studio:"PaymentPaper Studio",
    kw:["mo dao zu shi","jianghu wuxia romance","black and red flute","cloud and mist aesthetics","elegant hanfu"],
    desc:"江湖权重与群像悲剧：黑红配色的魔道世界、江氏樊楼水榭、愁中带柔的光影。人设修长，服饰细致。",
    demo:"black-robed cultivator playing dark flute on misty lotus lake pier, chinese wuxia animation, elegant flowing hanfu, moonlit romantic atmosphere, red ribbon accent" },

  { id:"W-C18", zh:"刺客伍六七", romaji:"Killer Seven", grp:"国产番剧", year:2018, studio:"小疯映画",
    kw:["killer seven","chinese comedy action","flat simple lines","small island town","absurd humor with serious fights"],
    desc:"极简到近乎涂鸦的线条、南方小岛的市井街景、搞笑与严肃的瞬间切换。用最简单的元素表达最有效的动作。",
    demo:"small barefoot barber with kitchen knife standing on sunny chinese island street, flat simple lineart, comedic innocent face, then dramatic action stance, minimal background" },

  /* ---------- 国产三维动画番剧 ---------- */
  { id:"W-C19", zh:"凡人修仙传", romaji:"A Record of a Mortal's Journey to Immortality", grp:"国产三维", year:2020, studio:"B.CMay PICTURES",
    kw:["mortal's journey immortality","chinese 3d xianxia","motion capture acting","sweeping cangwu mountains","realistic fabric simulation"],
    desc:"国产三维修仙的标杆：动作捕捉让角色表情接近真人，剑气粒子与布料模拟都很重。整体偏真实、偏详尽。",
    demo:"cultivator riding flying sword over endless chinese mountain ranges at dawn, chinese 3d animation style, realistic cloth simulation, glowing sword aura, dramatic sunrise, detailed terrain" },

  { id:"W-C20", zh:"灵笼", romaji:"Ling Cage", grp:"国产三维", year:2019, studio:"艺画开天",
    kw:["ling cage","post apocalyptic chinese cg","bio-organic monsters","floating airship city","dark gritty cg render"],
    desc:"末日题材的三维重工业：骨骼状生物兵器、空中堡垒、锈蚀的废墟。整体 CG 质感偏写实、偏暗、偏重。",
    demo:"armored survivors fighting grotesque bio-organic monster on ruined cliff edge, floating fortress airship above, chinese 3d cg style, dark gritty rendering, heavy volumetric dust" },

  { id:"W-C21", zh:"吞噬星空", romaji:"Swallowed Star", grp:"国产三维", year:2020, studio:"Poplar Entertainment",
    kw:["swallowed star","chinese 3d sci-fi","mecha exoskeleton","universe scale battle","alien creature design"],
    desc:"科幻升级流的三维代表：机械外骨骼、外星巨兽、行星级战场。风格硬派，模型细节与光效都很密集。",
    demo:"armored warrior in powered exoskeleton facing colossal alien beast across cratered battlefield, chinese 3d animation style, hard surface mecha suit, intense blue energy, cosmic scale" },

  /* ---------- 欧美动画 ---------- */
  { id:"W-W01", zh:"降世神通：最后的气宗", romaji:"Avatar: The Last Airbender", grp:"欧美动画", year:2005, studio:"Nickelodeon",
    kw:["avatar last airbender","asian-inspired fantasy","elemental bending motion","flat clean lineart","temple architecture"],
    desc:"东方美学与美式动画的结合：四国的建筑、服饰与习俗各不相同，斗法动作的运线流畅，很有禅意。",
    demo:"young airbender monk gliding on swirling air currents above eastern temple, bending motion trail of wind elements, clean flat cartoon lineart, serene mountain background" },

  { id:"W-W02", zh:"科拉传奇", romaji:"The Legend of Korra", grp:"欧美动画", year:2012, studio:"Nickelodeon",
    kw:["legend of korra","1920s deco future","republic city","metal bending","clean angular animation"],
    desc:"把神通世界推到 1920 年代装饰艺术风格的都市：钢铁都市、警察机甲、时代感婚纱。线条更加硬朗。",
    demo:"young waterbender in deco-era republic city street, art deco architecture mixed with eastern temple details, bending icy water ribbons, angular clean cartoon style" },

  { id:"W-W03", zh:"探险活宝", romaji:"Adventure Time", grp:"欧美动画", year:2010, studio:"Cartoon Network",
    kw:["adventure time","rubber hose limbs","simple geometric shapes","pastel candy land","hand-drawn wobble"],
    desc:"橡皮管四肢与极简几何块面：角色的手就是棒状，背景是糖果色的大地。线需要带着不稳的手绘抖动。",
    demo:"boy with white dog-shaped hat exploring pastel candy landscape, adventure time style, rubber hose arms, simple geometric shapes, wobbly hand-drawn lines, bright flat colors" },

  { id:"W-W04", zh:"宇宙小子", romaji:"Steven Universe", grp:"欧美动画", year:2013, studio:"Cartoon Network",
    kw:["steven universe","soft rounded character design","glowing gem powers","watercolor backgrounds","emotional warmth"],
    desc:"角色都是柔和的圆润体块，宝石魔法发出莹光。背景用明显的笔触水彩，整体在「温柔」与「伤感」之间。",
    demo:"young gem warrior glowing softly among friends on beach at sunset, steven universe style, rounded simple character shapes, watercolor painted background, warm emotional light" },

  { id:"W-W05", zh:"瑞克和莫蒂", romaji:"Rick and Morty", grp:"欧美动画", year:2013, studio:"Adult Swim",
    kw:["rick and morty style","crude loose lineart","sickly muted palette","awkward proportions","flat simple backgrounds"],
    desc:"刻意画得不精致：比例尴尬、线条抖动不稳、配色发灰发绿。重点是故意画出那种粗制滥造的地方节目感。",
    demo:"mad scientist and nervous grandson standing before glowing portal, adult swim animation style, awkward proportions, crude loose outlines, sickly green and grey palette, flat background" },

  { id:"W-W06", zh:"怪诞小镇", romaji:"Gravity Falls", grp:"欧美动画", year:2012, studio:"Disney XD",
    kw:["gravity falls","mystery forest town","warm nostalgic summer","hidden cryptid symbols","clean disney lineart"],
    desc:"夏日的公路奇遇：木屋小镇、层层叠叠的森林秘景、隐藏符号分布在每幅背景里。色调暖褐，怀旧感强。",
    demo:"two kids uncovering glowing cryptid runes in misty pine forest at dusk, gravity falls style, warm nostalgic summer palette, clean disney cartoon lineart, mysterious forest town" },

  { id:"W-W07", zh:"武士杰克", romaji:"Samurai Jack", grp:"欧美动画", year:2001, studio:"Cartoon Network",
    kw:["samurai jack","minimalist silhouette composition","flat color fields","lone wanderer","cinematic wide framing"],
    desc:"极简几何的语言：夸张的剪影、大面积的纯色块、几乎没有中间色。构图有强烈的电影宽幕感与留白。",
    demo:"lone samurai silhouette against huge flat colored sky, distant futuristic skyline, minimalist composition, jagged geometric shapes, dramatic negative space, cinematic wide frame" },

  { id:"W-W08", zh:"飞天小女警", romaji:"The Powerpuff Girls", grp:"欧美动画", year:1998, studio:"Cartoon Network",
    kw:["powerpuff girls","big round eyes circles","minimal geometric characters","midtown cityscape","flat retro colors"],
    desc:"用圆与三角组成角色：极大的圆形眼睛、没有手指的手。背景是简化立裁的都市，配色是 50 年代的复古。",
    demo:"three tiny girls with huge circular eyes flying above simplified retro city, geometric minimal character shapes, flat primary colors, thick black outlines" },

  { id:"W-W09", zh:"蝙蝠侠：动画系列", romaji:"Batman: The Animated Series", grp:"欧美动画", year:1992, studio:"Warner Bros",
    kw:["batman tas","dark deco gotham","noir shadows","art deco architecture","limited color palette"],
    desc:"黑色电影的动画化：哥谭的装饰艺术建筑、反差极强的投影、老式复古电影颗粒。几乎不用饱和色。",
    demo:"dark caped hero crouching on gothic gargoyle above art deco city at night, heavy noir shadows, limited muted palette, classic western animation, dramatic rain and searchlights" },

  { id:"W-W10", zh:"变形金刚 G1", romaji:"The Transformers", grp:"欧美动画", year:1984, studio:"Toei / Sunbow",
    kw:["transformers g1","1980s robot anime misco","chunky transforming robots","cel painted action","primary color heroes"],
    desc:"八十年代商业动画的样板：方正的机甲块面、原色配色、印刷感很强的赛璐璐上色。机械变形的分件衔接清楚。",
    demo:"chunky red and blue transforming robot standing amid 1980s cel-painted cityscape, boxy mechanical design, thick outlines, flat primary colors, dramatic action pose" },

  { id:"W-W11", zh:"小马宝莉：友谊是魔法", romaji:"My Little Pony: Friendship is Magic", grp:"欧美动画", year:2010, studio:"DHX Media",
    kw:["my little pony fim","vector bright shapes","pastel rainbow palette","big anime eyes","clean vector lineart"],
    desc:"矢量化的明亮风格：圆润的体型、彩虹般的粉彩系，借用了日式的大眼画法。线条干净，几乎无粗细变化。",
    demo:"group of colorful ponies with large expressive eyes in pastel field, clean vector outlines, bright rainbow color scheme, simple flat shapes, cheerful group pose" },

  { id:"W-W12", zh:"恶魔城", romaji:"Castlevania", grp:"欧美动画", year:2017, studio:"Powerhouse Animation",
    kw:["castlevania","dark gothic western anime","japanese anime influence","gothic cathedral","brutal action shadows"],
    desc:"西方团队做的日式暗黑动画：哥特教堂彩窗、厚重的黑影与粗粝线条。暴力与宗教意象并置。",
    demo:"vampire hunter with whip before gothic cathedral stained glass, western anime style with japanese influence, deep shadow contrast, warm candlelight against cold stone, dramatic pose" },

  { id:"W-W13", zh:"双城之战", romaji:"Arcane", grp:"欧美动画", year:2021, studio:"Fortiche / Riot Games",
    kw:["arcane","league of legends","painterly 2d on 3d","steampunk city contrast","deliberate brush texture"],
    desc:"把二维笔触画在三维渲染之上：上城的金白与底城的毒绿两相对照。每一帧都像厚涂油画，笔触可辨。",
    demo:"two sisters facing off between gilded upper city and neon green undercity, arcane style, painterly brush texture over 3d render, dramatic rim light, thick oil-like strokes" },

  { id:"W-W14", zh:"蜘蛛侠：纵横宇宙", romaji:"Spider-Man: Across the Spider-Verse", grp:"欧美动画", year:2023, studio:"Sony Pictures Animation",
    kw:["spider-verse","halftone comic dots","3d render with ink outlines","vibrant pop colors","chromatic aberration"],
    desc:"把漫画网点、手绘轮廓、故障色差值直接贴到三维角色上。不同宇宙用不同的画风叠加，是当代最被模仿的技法。",
    demo:"web slinger swinging between skyscrapers, vivid halftone comic print texture, ink outlines over 3d cel shading, chromatic aberration, bright pop color bursts, dynamic diagonal motion" },

  { id:"W-W15", zh:"妮莫娜", romaji:"Nimona", grp:"欧美动画", year:2023, studio:"Annapurna / Netflix",
    kw:["nimona","shape-shifting comedy","medieval futuristic mix","bold flat color","energetic loose animation"],
    desc:"变形能力与能量释放的表现：中世纪与科幻混搭的都市，粉色短发的主角可以随时变成任何生物。线条松散有力。",
    demo:"punk shapeshifter girl turning into giant beast in medieval-futuristic city, bold flat colors, energetic loose animation style, dynamic comedic expressions" },

  { id:"W-W16", zh:"蓝眼武士", romaji:"Blue Eye Samurai", grp:"欧美动画", year:2023, studio:"Netflix Animation",
    kw:["blue eye samurai","edo period japan","ukiyo-e inspired","selective color","french new wave action"],
    desc:"西方团队的江户剧：浮世绘的木版画肌理、选择性的单色处理（只有蓝眼保留色彩）、以及电影般的仪式感。",
    demo:"blue-eyed swordsman in snowy edo period landscape, ukiyo-e woodblock texture influence, selective desaturated palette with vivid blue eyes, falling snow, cinematic french grading" },

  { id:"W-W17", zh:"无敌小子", romaji:"Invincible", grp:"欧美动画", year:2021, studio:"Skybound / Amazon",
    kw:["invincible","modern dark superhero","graphic violence","flat comic lineart","retro americana suburbs"],
    desc:"九十年代漫畫感的成人向超英：平涂加粗直线、美式郊区日常，以及突然降临的极度血腥。人偶式的机械造型相当写实。",
    demo:"young superhero in blue and yellow suit hovering above suburban houses, heavy flat comic lineart, american suburban backdrop, sudden brutal action contrast, cinematic low light" },

  { id:"W-W18", zh:"地狱客栈", romaji:"Hazbin Hotel", grp:"欧美动画", year:2024, studio:"A24 / SpindleHorse",
    kw:["hazbin hotel","vibrant reddest hell","1930s rubber hose influence","theatrical demon designs","high contrast pink red"],
    desc:"复古橡皮管美学与恶魔题材的结合：粉、红、黑的高对比，剧院式的角色造型，个体体型差异极大。线条活泼。",
    demo:"smiling red-eyed demon running a hotel in vivid crimson hellscape, 1930s rubber hose cartoon influence, high contrast pink and red palette, theatrical expressive pose" },

  { id:"W-W19", zh:"猫头鹰之屋", romaji:"The Owl House", grp:"欧美动画", year:2020, studio:"Disney Television",
    kw:["owl house","boiling isles fantasy","witch magic glow","clean disney tv lines","warm autumn palette"],
    desc:"迪士尼电视动画的现代样貌：充满骨骼与怪诞生物的幻想世界、魔法荧光曲线。主色为秋橙与紫。",
    demo:"young witch casting glowing spell circle among bizarre magical creatures in autumn forest, clean modern disney tv lineart, warm purple and orange palette, expressive round eyes" },

  { id:"W-W20", zh:"幻影忍者", romaji:"Ninjago", grp:"欧美动画", year:2011, studio:"The Lego Group",
    kw:["ninjago","lego minifigure aesthetic","elemental spinjitzu vortex","cg blocky shapes","modern ninja futuristic"],
    desc:"积木化的角色与忍术：塑料质感的方块几何、频繁出现的元素旋风粒子。整体是干净清爽的三维渲染。",
    demo:"robed ninja spinning elemental vortex of fire energy, blocky plastic character proportions, clean cg render, futuristic temple background, lego minifigure aesthetic" },

  /* ---------- 二次元游戏 IP ---------- */
  { id:"W-G01", zh:"原神", romaji:"Genshin Impact", grp:"二次元游戏", year:2020, studio:"miHoYo / HoYoverse",
    kw:["genshin impact","HoYoverse anime style","anime rpg art","element glow","soft western anime fantasy"],
    desc:"开放世界的二次元标杆：角色服饰结构极复杂，元素能力以发光宝石呈现。整体明亮、干净、偏西幻。",
    demo:"anime fantasy traveler with glowing elemental vision, lush open world landscape behind, hoyoverse anime style, glossy detailed clothing trims, soft rim light, detailed gradients" },

  { id:"W-G02", zh:"崩坏：星穹铁道", romaji:"Honkai: Star Rail", grp:"二次元游戏", year:2023, studio:"miHoYo / HoYoverse",
    kw:["honkai star rail","space fantasy anime","glossy detailed eyework","translucent ui overlay","vivid commercial colors"],
    desc:"科幻版的米哈游：能量质感服饰、星空列车、发光回路。相比原神更强调时装感与冷色调。",
    demo:"space-faring anime hero with glowing weapon standing on cosmic train platform, translucent sci-fi ui elements, glossy detailed hair and eyes, vibrant commercial animation palette" },

  { id:"W-G03", zh:"明日方舟", romaji:"Arknights", grp:"二次元游戏", year:2019, studio:"Hypergryph",
    kw:["arknights","dark military fantasy","animal-eared operators","gritty tactical ui","muted grey and amber"],
    desc:"军事工业感的暗色二次元：厚重制服、兽耳角色、崩坏之后的废墟都市。配色以灰烬与琥珀为主。",
    demo:"animal-eared operator in tactical military gear on ruined industrial rooftop, arknights style, muted grey amber palette, detailed equipment straps, glowing skill indicators" },

  { id:"W-G04", zh:"蔚蓝档案", romaji:"Blue Archive", grp:"二次元游戏", year:2021, studio:"Nexon / Yostar",
    kw:["blue archive","gun-wielding schoolgirls","halo above head","bright pastel academy city","soft clean shading"],
    desc:"枪械与学院的搭配：头顶悬浮光环、繁复的服饰细节、工整漂亮的城市街景。色调明亮洁净。",
    demo:"schoolgirl with floating halo above head holding rifle in pastel academy courtyard, blue archive style, soft clean cel shading, bright city skyline, glossy detailed eyes" },

  { id:"W-G05", zh:"Fate/Grand Order", romaji:"Fate/Grand Order", grp:"二次元游戏", year:2015, studio:"TYPE-MOON / Aniplex",
    kw:["fate grand order","historical servant redesign","ornate armor details","gold and black palette","card game art style"],
    desc:"历史人物再设计的宝库：繁复的盔甲与金黑主调，每位从者的造型都可当作独立的角色设计参考。",
    demo:"historical hero spirit reimagined with ornate black and gold armor, glowing magical runes, fate grand order card art style, detailed ornamental costume, dramatic dark background" },

  { id:"W-G06", zh:"碧蓝航线", romaji:"Azur Lane", grp:"二次元游戏", year:2017, studio:"Manjuu / Yostar",
    kw:["azur lane","anthropomorphic warships","naval rigging equipment","glossy detailed outfits","bright naval palette"],
    desc:"军舰拟人化：舰装与人体的复杂平衡，服饰光泽极强。整体体态成熟，机械与人体结合紧密。",
    demo:"anthropomorphic ship girl with large naval rigging equipment and towering smokestacks, detailed glossy uniform, bright sky and sea backdrop, clean modern anime rendering" },

  { id:"W-G07", zh:"少女前线", romaji:"Girls' Frontline", grp:"二次元游戏", year:2016, studio:"SUNBORN Network",
    kw:["girls frontline","tactical doll designs","muted military realism","cold industrial light","desaturated battlefield"],
    desc:"战术人形：军事装备的严谨考据、冷调工业光。整体比同类更冷更硬，饱和低。",
    demo:"tactical doll soldier holding rifle in desaturated industrial facility, girls frontline style, detailed military gear, cold fluorescent light, muted realism, serious atmosphere" },

  { id:"W-G08", zh:"阴阳师", romaji:"Onmyoji", grp:"二次元游戏", year:2016, studio:"NetEase",
    kw:["onmyoji","heian period japan","traditional kimono and paper talismans","glowing spirit magic","elegant japanese palette"],
    desc:"平安京的和风幻想：十二单与狩衣、符咒与式神的组合。色彩继承日本传统色，优雅而略带幽暗。",
    demo:"heian era onmyoji in layered white robes casting paper talisman magic with spirit fox beside, traditional japanese color palette, elegant flowing garments, soft magical glow" },

  { id:"W-G09", zh:"重返未来：1999", romaji:"Reverse: 1999", grp:"二次元游戏", year:2023, studio:"Bluepoch",
    kw:["reverse 1999","1960s retro occult","vintage poster aesthetics","arcanist magic","muted film-like tones"],
    desc:"复古神秘学：六十年代尘封时代的视觉语言、海报式排版与秘法符号。色调像泛黄旧胶片。",
    demo:"retro 1960s occult arcanist casting spell with vintage poster framing, muted film-like color grading, geometric typography elements, mysterious mist, stylized vintage composition" },

  { id:"W-G10", zh:"鸣潮", romaji:"Wuthering Waves", grp:"二次元游戏", year:2024, studio:"Kuro Games",
    kw:["wuthering waves","post apocalyptic anime rpg","desaturated natural tones","glossy modern rendering","ruined fantasy terrain"],
    desc:"灾后世界的开放歌剧：冷调自然场景、光滑的现代渲染。相比明快的同类作品，整体更沉更低饱和。",
    demo:"anime traveler standing on windy cliff overlooking ruined fantasy landscape, wuthering waves style, desaturated cool natural tones, glossy modern rendering, dramatic overcast light" },

  { id:"W-G11", zh:"尼尔：机械纪元", romaji:"NieR Automata", grp:"二次元游戏", year:2017, studio:"PlatinumGames / Square Enix",
    kw:["nier automata","muted desaturated rpg","gothic lolita design","ruined world melancholy","soft natural light"],
    desc:"末世抒情：哥特萝莉式的服装、眼罩、以及被自然接管的废墟。光线柔和，整体是衰败中的平静。",
    demo:"blindfolded white-haired android walking through overgrown ruined city, muted desaturated palette, gothic style dress details, soft overcast daylight, quiet melancholic atmosphere" },

  { id:"W-G12", zh:"崩坏 3", romaji:"Honkai Impact 3rd", grp:"二次元游戏", year:2016, studio:"miHoYo",
    kw:["honkai impact","mecha infused valkyrie suit","high gloss armor","violet energy effects","dynamic action shounen"],
    desc:"高速战斗的二次元动作：瓦尔基里战甲的高反光金属、紫色的破坏能量。镜头运动与动作幅度都很强。",
    demo:"valkyrie in high gloss mechanical battle suit unleashing violet energy slash, dynamic mid-air attack pose, detailed armor plating, glowing particle trails, dramatic speed lines" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { WORKS_GLOBAL };
