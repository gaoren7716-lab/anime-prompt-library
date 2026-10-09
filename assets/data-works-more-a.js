/* ============================================================
 * 数据层 B-3：补遗作品 —— 日本补遗 / 韩国 / 印度与东南亚
 * 说明：中文说明字段一律纯中文；英文只出现在 kw 与 demo
 * ============================================================ */

const WORKS_MORE_A = [

  /* ================= 日本·补遗：奠基与国民级 ================= */
  { id:"W-J86", zh:"铁臂阿童木", romaji:"Astro Boy", grp:"日本·补遗", year:1963, studio:"虫制作公司",
    kw:["astro boy","retro anime 1960s","limited animation","rounded black silhouette hair","simple bold outlines","osamu tezuka"],
    desc:"日本电视动画的起点。手冢治虫用极少的帧数建立起一整套工业规范：圆润的黑色发型剪影、夸张的大眼、粗而匀的轮廓线。造型简洁到近乎符号。",
    demo:"boy robot with rounded black hair silhouette flying over city, osamu tezuka anime style, bold simple outlines, vintage 1960s anime, flat color, limited animation feel" },

  { id:"W-J87", zh:"哆啦A梦", romaji:"Doraemon", grp:"日本·补遗", year:1979, studio:"SHIN-EI 动画",
    kw:["doraemon","round blue robot cat","no ears","4th dimension pocket","simple rounded shapes","family anime","flat pastel colors"],
    desc:"圆到极致的造型：没有耳朵的蓝猫、几乎由圆形与胶囊构成的身体、扁平的粉彩底色。配色安静，线条圆润无锋，是典型的家庭向低龄设计语言。",
    demo:"round blue robot cat with no ears standing in sunny suburban yard, simple rounded shapes, soft flat pastel colors, clean thick outlines, gentle family anime" },

  { id:"W-J88", zh:"樱桃小丸子", romaji:"Chibi Maruko-chan", grp:"日本·补遗", year:1990, studio:"日本 animation",
    kw:["chibi maruko chan","simple childish drawing","crayon-like rough lines","1970s japan nostalgia","minimal background","comedy slice of life"],
    desc:"刻意保留的稚拙感：线条像蜡笔一样毛糙，人物头大身小，背景常常简化到只剩几笔。昭和年代的小镇日常是它的核心氛围。",
    demo:"small girl with bob haircut in 1970s japanese town street, deliberately childish rough crayon lines, minimal simple background, warm nostalgic slice of life colors" },

  { id:"W-J89", zh:"蜡笔小新", romaji:"Crayon Shin-chan", grp:"日本·补遗", year:1992, studio:"SHIN-EI 动画",
    kw:["crayon shin chan","crude crayon outlines","thick black eyebrows","off-model comedy faces","flat cheap coloring","suburban japan"],
    desc:"把廉价感做成了风格：轮廓像被蜡笔涂出了边界，眉毛粗重，角色常常故意画出崩坏的搞笑表情。整部作品都在刻意反精致。",
    demo:"mischievous five year old boy with thick black eyebrows doing silly face, crayon shin chan style, crude crayon-like outlines outside the lines, flat cheap coloring, comedy anime" },

  { id:"W-J90", zh:"足球小将", romaji:"Captain Tsubasa", grp:"日本·补遗", year:1983, studio:"土田制作公司",
    kw:["captain tsubasa","1980s sports anime","giant sparkling eyes","dramatic speed lines","stretched limbs","shonen football"],
    desc:"八十年代运动番的视觉语法：巨大的星星眼、拉伸变形的四肢、满屏的速度线、比分牌式的夸张定格。动作幅度远超物理常识。",
    demo:"young footballer leaping for bicycle kick, 1980s sports anime style, huge sparkling star eyes, dramatic speed lines, stretched heroic limbs, sunset pitch" },

  { id:"W-J91", zh:"北斗神拳", romaji:"Fist of the North Star", grp:"日本·补遗", year:1984, studio:"东映动画",
    kw:["fist of the north star","1980s macho anime","bulging muscular anatomy","post apocalyptic ruins","heavy black shadows","visceral impact"],
    desc:"八十年代的硬派肌肉叙事：肌肉被画到几乎撑破轮廓线，暗部是大块的纯黑，废墟背景压低饱和。冲击力优先于美观。",
    demo:"broad-shouldered fighter in post-apocalyptic ruins, fist of the north star style, exaggerated bulging muscles, heavy black shadow blocks, desaturated dusty desert palette" },

  { id:"W-J92", zh:"银河铁道 999", romaji:"Galaxy Express 999", grp:"日本·补遗", year:1978, studio:"东映动画",
    kw:["galaxy express 999","retro sci fi anime","steam locomotive in space","leiji matsumoto style","melancholy slim figures","starry void"],
    desc:"松本零士的谱系：纤细忧郁的人物、旧式蒸汽机车行驶在星海之中、车站像十九世纪的欧洲建筑。浪漫主义与太空歌剧的混合。",
    demo:"slim melancholic boy beside vintage steam train on cosmic rail, leiji matsumoto anime style, dense starfield, antique european station architecture, retro science fiction" },

  { id:"W-J93", zh:"阿尔卑斯少女海蒂", romaji:"Heidi, Girl of the Alps", grp:"日本·补遗", year:1974, studio:"瑞鹰 enterprize",
    kw:["heidi girl of the alps","world masterpiece theater","hand painted european landscape","soft pastel nature","gentle pastoral anime","watercolor mountains"],
    desc:"世界名作剧场一脉的代表：高山牧场的水彩式背景一笔一笔手工画出，人物线条柔和。与后来的数码动画相比，它的风景更厚、更慢。",
    demo:"barefoot girl running through alpine meadow with goats, hand painted pastoral background, soft watercolor mountains, gentle warm sunlight, classic european storybook anime" },

  /* ================= 日本·补遗：少年漫画三巨头 ================= */
  { id:"W-J94", zh:"火影忍者", romaji:"Naruto", grp:"日本·补遗", year:2002, studio:"studio pierrot",
    kw:["naruto","ninja headband","spiky blond hair","orange and blue tracksuit","rasengan spiral energy","whirlpool village logo"],
    desc:"三大民工漫之一：护额金属牌、橙色与蓝色配色的运动服、螺旋能量丸、罗圈眼与鸣人须状的脸纹。手指结印是它最有辨识度的动作。",
    demo:"ninja with spiky blond hair and metal headband forming hand seal, glowing blue spiral energy sphere in palm, orange and blue tracksuit, dynamic battle pose" },

  { id:"W-J95", zh:"死神 BLEACH", romaji:"Bleach", grp:"日本·补遗", year:2004, studio:"studio pierrot",
    kw:["bleach anime","shinigami black kimono","oversized katana","orange hair","hollow white mask","high contrast ink palette"],
    desc:"角色服饰以黑色和服与长刀构成极简剪影，其余全靠留白。战斗常用大面积黑与单一点缀色形成强对比，人物比例修长。",
    demo:"tall shinigami in black kimono with oversized katana, hollow white bone mask fragments, high contrast limited palette, long lean proportions, ink splash accents" },

  { id:"W-J96", zh:"犬夜叉", romaji:"Inuyasha", grp:"日本·补遗", year:2000, studio:"SUNRISE",
    kw:["inuyasha","rumiko takahashi style","sengoku period","silver white hair dog ears","beads of subjugation","sacred tree of ages"],
    desc:"高桥留美子的战国奇幻：银白发配狗耳、红色念珠项链、御神木与时代的和风村落。整体是九十年代赛璐璐的清亮配色。",
    demo:"half demon with silver hair and dog ears holding giant fang blade, rumiko takahashi anime style, sengoku era japanese village, red prayer beads, bright cel animation colors" },

  { id:"W-J97", zh:"魔卡少女樱", romaji:"Cardcaptor Sakura", grp:"日本·补遗", year:1998, studio:"MADHOUSE",
    kw:["cardcaptor sakura","clamp","magical girl 1990s","elaborate frilly battle costumes","glowing star wand","soft pastel dream palette"],
    desc:"世纪末魔法少女的顶点：每一套战斗服都精心设计到近乎服装画稿，蕾丝、缎带、分层裙摆极多。柔粉与奶白的梦境色是主调。",
    demo:"young magical girl in elaborate frilly layered costume casting star wand, cardcaptor sakura style, glowing pink sparkles, soft pastel dream palette, detailed garment design" },

  { id:"W-J98", zh:"数码宝贝", romaji:"Digimon Adventure", grp:"日本·补遗", year:1999, studio:"东映动画",
    kw:["digimon","creature evolution sequence","digivice glowing","digital distortion particles","glowing evolution silhouette","90s anime toyline"],
    desc:"进化段落是它的核心视觉：高光白柱、剪影的分阶段变形、数据流粒子围绕。数码世界的背景带强烈的早期电脑图形味道。",
    demo:"glowing evolution column with creature silhouettes rising through light beams, streaming digital data particles, dramatic backlight, 1990s digital world aesthetic" },

  { id:"W-J99", zh:"游戏王", romaji:"Yu-Gi-Oh! Duel Monsters", grp:"日本·补遗", year:2000, studio:"studio gallop",
    kw:["yu gi oh","millennium puzzle","spiky tri color hair","holographic summon monsters","dark glowing arena","duel disk"],
    desc:"决斗盘的全息召唤是该 IP 最强的画面记忆：半透明的怪兽影像、环形光阵、以及大量极端视角。主角发型的多色尖刺辨识度极高。",
    demo:"duelist with tri-colored spiky hair summoning translucent holographic monster above glowing arena, dramatic low angle, shimmering summoning light circle" },

  { id:"W-J100", zh:"棋魂", romaji:"Hikaru no Go", grp:"日本·补遗", year:2001, studio:"studio pierrot",
    kw:["hikaru no go","heian era noble ghost","flowing white robes","go board close up","elegant calm composition","ultramarine accent"],
    desc:"平安贵族的幽灵与现代少年的组合：狩衣的层叠白袍、长发与贵族面相，配合棋盘的特写，整体清雅克制，极少用高饱和。",
    demo:"elegant heian era noble ghost in layered white court robes beside modern boy at go board, calm refined composition, flowing long black hair, ultramarine accent" },

  /* ================= 日本·补遗：剧场与作者电影 ================= */
  { id:"W-J101", zh:"未麻的部屋", romaji:"Perfect Blue", grp:"日本·补遗", year:1997, studio:"MADHOUSE",
    kw:["perfect blue","satoshi kon","psychological thriller anime","unreality frame bleeding","harsh indoor lighting","mirror reflection dread"],
    desc:"今敏的心理惊悚起点：现实与舞台、电视画面互相渗透，画面常在同一格中悄然换景。室内光偏冷且硬，镜面与反射是主要的压迫手段。",
    demo:"pop idol alone in dim apartment facing mirror reflection of stage self, satoshi kon psychological thriller style, harsh cold indoor lighting, reality bleeding into frame" },

  { id:"W-J102", zh:"千年女优", romaji:"Millennium Actress", grp:"日本·补遗", year:2001, studio:"MADHOUSE",
    kw:["millennium actress","century spanning japan history","seamless scene transitions","aged and young same frame","film grain warmth","golden dust motes"],
    desc:"今敏最擅长的无缝转场：同一个角色在数十年间连续变形，电影胶片、时代布景与回忆在同一镜头里接连塌陷又重建。色调偏琥珀与暖金。",
    demo:"actress transforming across decades within one continuous shot, seamless scene transitions through japanese eras, warm amber film grain, floating dust motes, cinematic anime" },

  { id:"W-J103", zh:"红辣椒", romaji:"Paprika", grp:"日本·补遗", year:2006, studio:"MADHOUSE",
    kw:["paprika 2006","dream logic parade","surreal carnival objects","red vest dream detective","kaleidoscopic shifting scenes","hyper saturated"],
    desc:"梦境逻辑的视觉狂欢：冰箱、电话、人偶组成游行的队伍，场景不断以不可能的方式生长。高饱和的红与金，像一场不肯醒的梦。",
    demo:"surreal dream parade of marching objects and waving dolls down neon street, paprika style, kaleidoscopic shifting scenes, hyper saturated reds and golds, dream logic" },

  { id:"W-J104", zh:"夏日大作战", romaji:"Summer Wars", grp:"日本·补遗", year:2009, studio:"MADHOUSE",
    kw:["summer wars","oz virtual world","low polygon avatars","traditional japanese mansion","bright summer sky","hanafuda playing cards"],
    desc:"细田守的代表结构：虚拟世界是几何色块的低多边形，现实世界则是阳光充足的日式大宅。两者共用一套明快的蓝白配色。",
    demo:"white low polygon rabbit avatar against vast glowing blue virtual world grid, summer wars style, bright summer sky with cumulus clouds, old japanese estate below" },

  { id:"W-J105", zh:"狼的孩子雨和雪", romaji:"Wolf Children", grp:"日本·补遗", year:2012, studio:"studio chizu",
    kw:["wolf children","rural mountain japan","seasonal light change","soft loose linework","gentle domestic anime","transforming wolf children"],
    desc:"细田守的乡土抒情：远山的四季、稀疏邮局的斜射日光、角色线条松软自由。拒绝对兽化角色过分夸张，保持生活气息。",
    demo:"two wolf children playing in tall summer grass before wooded mountains, wolf children style, soft loose linework, warm seasonal sunlight, rural japanese house" },

  { id:"W-J106", zh:"怪物之子", romaji:"The Boy and the Beast", grp:"日本·补遗", year:2015, studio:"studio chizu",
    kw:["the boy and the beast","bakemono no ko","hidden beast city","sumo beast forms","crowded festival streets","warm paper lantern glow"],
    desc:"兽之国的街道层叠在悬崖之上，灯节、相扑式兽形战斗、以及密集出现的市民群像。构图常在高处俯瞰，色温偏暖。",
    demo:"crowded lantern-lit festival street of animal people built into cliff walls, beast forms in sumo stance, warm paper lantern glow, high overlook composition" },

  { id:"W-J107", zh:"机动警察", romaji:"Patlabor", grp:"日本·补遗", year:1989, studio:"Production I.G",
    kw:["patlabor","industrial labor mecha","realistic heavy machinery","oshi mamoru","muted morning haze","functional military design"],
    desc:"押井守式的机甲现实主义：机器人是工程器械而非英雄道具，涂装磨损、液压清晰可见。整体笼罩在清晨的灰蓝雾气里。",
    demo:"heavy industrial police mecha standing in grey dawn construction site, functional mechanical design, chipped paint and hydraulic detail, muted morning haze, realistic lighting" },

  { id:"W-J108", zh:"乒乓", romaji:"Ping Pong The Animation", grp:"日本·补遗", year:2014, studio:"龙之子",
    kw:["ping pong the animation","masaaki yuasa style","loose wobbling linework","unconventional silhouettes","bold calligraphy title cards","abstract motion streaks"],
    desc:"汤浅政明的线条每天都在抖：人物轮廓歪斜不稳，比例忽长忽短，运动靠抽象的笔触而非运动线。是近年最具冒险性的主流作品之一。",
    demo:"table tennis player mid dive with wildly distorted limbs, masaaki yuasa animation style, loose wobbling outlines, abstract motion brush streaks, offbeat silhouettes" },

  { id:"W-J109", zh:"银河骑士传", romaji:"Knights of Sidonia", grp:"日本·补遗", year:2014, studio:"Polygon Pictures",
    kw:["knights of sidonia","polygon pictures","cel shaded mecha 3d","flat toon shading","clean mechanical shapes","space colony"],
    desc:"日本 CG 动画的代表路线：三维建模配二维平涂着色，机甲有清晰的工业轮廓与平涂阴影，没有贴图质感。与国产 CG 的写实渲染截然不同。",
    demo:"sleek white piloted mecha drifting in space above huge seed ship, polygon pictures style, cel shaded 3d anime, flat toon shading, clean hard mechanical silhouettes" },

  /* ================= 日本·补遗：京都动画日常系 ================= */
  { id:"W-J110", zh:"轻音少女", romaji:"K-ON!", grp:"日本·补遗", year:2009, studio:"京都动画",
    kw:["k on","cute girls doing music","round soft faces","warm sakura classroom","big head small body","detailed sound equipment"],
    desc:"京都动画定型萌系的关键作：大头小身、面部线条圆润、几乎没有生硬的阴影。背景中的乐器与茶点绘制极精细，与人物形成反差。",
    demo:"four schoolgirls with instruments in warm afternoon club room, kyoani cute slice of life style, round soft faces, detailed guitar and tea set, gentle golden light" },

  { id:"W-J111", zh:"冰菓", romaji:"Hyouka", grp:"日本·补遗", year:2012, studio:"京都动画",
    kw:["hyouka","mystery school anime","glossy large eyes","delicate eyelashes","lush green campus","dusty sunbeams"],
    desc:"京都动画的另一支：光泽极强的大眼睛、细密的睫毛、发丝的高光分层。校园场景绿意浓密，室内常有斜射的尘雾光柱。",
    demo:"curious student with glossy large eyes and delicate lashes reading by window, hyouka kyoani style, lush green campus outside, dusty sunbeam through glass" },

  { id:"W-J112", zh:"吹响！上低音号", romaji:"Hibike! Euphonium", grp:"日本·补遗", year:2015, studio:"京都动画",
    kw:["hibike euphonium","concert band anime","highly rendered brass instruments","glowing stage light","uniformed ensemble rows","bokeh night festival"],
    desc:"乐器作画是该作的技术标杆：铜管的反光、按键结构、按键手指动作都逐帧考究。夜晚的路灯大光斑与舞台灯是标志性氛围。",
    demo:"rows of school band players holding polished brass instruments under stage lights, hibike euphonium kyoani style, glowing bokeh street lamps at night, detailed instrument rendering" },

  /* ================= 韩国动画 ================= */
  { id:"W-K01", zh:"小企鹅 Pororo", romaji:"Pororo the Little Penguin", grp:"韩国动画", year:2003, studio:"ICONIX",
    kw:["pororo the little penguin","korean preschool animation","simple rounded cgi masses","primary color blocks","soft toy-like materials","snow village"],
    desc:"韩国最成功的儿童 IP：形体几乎是积木质感的基础几何体，材质像柔软的塑料玩具，背景永远是一条雪村。配色素净而明快。",
    demo:"tiny blue penguin in aviator goggles standing in snowy village, simple rounded cgi preschool style, soft toy-like plastic materials, clean primary color accents" },

  { id:"W-K02", zh:"臭虫兄弟", romaji:"Larva", grp:"韩国动画", year:2011, studio:"TUBA",
    kw:["larva tv series","squash and stretch cgi","glossy simple cgi","bug eyed comedy","slapstick deformation","bright rubber materials"],
    desc:"无语言的挤压拉伸喜剧：两根幼虫的橡胶质 CGI、夸张到变形的五官、以及几乎不间断的搞笑节奏。材质像玩具塑料。",
    demo:"two glossy caterpillar larvae with bulging eyes doing slapstick squash and stretch, bright rubber toy cgi materials, clean sewer background, comedy posing" },

  { id:"W-K03", zh:"神秘公寓", romaji:"The Haunted House / Shinbi Apartment", grp:"韩国动画", year:2016, studio:"CJ ENM",
    kw:["shinbi apartment","korean kids horror comedy","goblin yokai designs","neon purple spirit energy","modern korean apartment","stylized big head characters"],
    desc:"韩国都市怪谈谱系：把本土精灵与鬼怪塞进现代公寓，紫色的灵质光晕与霓虹夜灯并存。人物头身比夸张，服饰紧跟当下时尚。",
    demo:"two kids facing glowing purple ghost in modern korean apartment corridor, shinbi apartment style, neon spirit energy, stylized big head characters, night lighting" },

  { id:"W-K04", zh:"晴空战士", romaji:"Wonderful Days", grp:"韩国动画", year:2003, studio:"Tin House",
    kw:["wonderful days 2003","korean sci fi anime","hand drawn characters over 3d","oil stained industrial dystopia","sepia and toxic green","glider airships"],
    desc:"韩国二维加三维的开山作：手绘人物压在厚重的三维工业场景上，油污与锈色铺满全片。整体是灰绿与褐黄拼接的废墟未来。",
    demo:"slender hero flying glider above rusted industrial wasteland arcology, hand drawn anime character over 3d painted background, sepia and toxic green palette, hazy air" },

  { id:"W-K05", zh:"我独自升级", romaji:"Solo Leveling", grp:"韩国动画", year:2024, studio:"A-1 Pictures",
    kw:["solo leveling anime","korean webtoon adaptation","shadow soldiers summoned","blue black aura particles","high gloss dark armor","modern urban dungeon gates"],
    desc:"韩漫改编的现象级作品：暗紫黑的能量烟雾、从影中登场的士兵军团、反光的黑铠与手套。全身服装的金属质感与日式二维作品明显不同。",
    demo:"lone hunter in high gloss black armor summoning shadow soldiers from spreading dark aura, solo leveling webtoon anime style, violet black particles, urban gate background" },

  { id:"W-K06", zh:"神之塔", romaji:"Tower of God", grp:"韩国动画", year:2020, studio:"Telecom Animation Film",
    kw:["tower of god anime","korean webtoon","ornate tower interiors","shinsu blue water energy","elaborate layered costumes","vast impossible architecture"],
    desc:"韩漫条漫的典型：服装层次与纹饰极繁、建筑大得不合逻辑、突破关隘的蓝色水流是主要能量形态。整体比日式更硬、更偏写实线条。",
    demo:"young climber in elaborate layered outfit facing colossal tower interior, tower of god webtoon style, swirling blue shinsu energy, vast impossible architecture" },

  /* ================= 印度与东南亚 ================= */
  { id:"W-I01", zh:"罗摩衍那：罗摩王传说", romaji:"Ramayana: The Legend of Prince Rama", grp:"印度·东南亚", year:1992, studio:"Nippon Ramayana Film",
    kw:["ramayana legend of prince rama","indian epic anime","temple mural composition","ornate gold jewelry","saffron and peacock blue","decorative arch framing"],
    desc:"印度史诗的动画化：华丽的神庙浮雕构图、金饰与孔雀蓝的配色、服饰接近古典壁画。整体装饰性远强于写实性。",
    demo:"prince archer with ornate gold crown against temple carved backdrop, indian epic anime style, mural frontal composition, saffron and peacock blue, decorative stone arch" },

  { id:"W-I02", zh:"孟买玫瑰", romaji:"Bombay Rose", grp:"印度·东南亚", year:2019, studio:"Gitanjali Rao 工作室",
    kw:["bombay rose","indian miniature painting style","dense patterned surfaces","bollywood poster colors","flat frontal perspective","red rose motif"],
    desc:"以印度细密画为骨：每个平面都填满图案，远景与近景同等密度，透视被彻底放弃。粉紫与橙红的电影海报用色，玫瑰是全片的视觉母题。",
    demo:"two lovers framed by dense patterned textile and rose vines, indian miniature painting animation style, flat frontal perspective, bollywood poster saturated colors" },

  { id:"W-I03", zh:"小英雄 Bhim", romaji:"Chhota Bheem", grp:"印度·东南亚", year:2008, studio:"Green Gold Animations",
    kw:["chhota bheem","indian children animation","simple rounded cgi","bright kurta and turban","village of dholakpur","clean cartoon shading"],
    desc:"印度国民级儿童 IP：圆润的低度三维造型、整洁的卡通上色、以及头巾与南亚式服装。场景是一座阳光充足的村镇。",
    demo:"strong village boy in blue kurta and orange turban lifting boulder, indian children cgi animation style, rounded simple shapes, clean flat shading, sunny courtyard" },

  { id:"W-I04", zh:"守护者 Trese", romaji:"Trese", grp:"印度·东南亚", year:2021, studio:"BASE Entertainment",
    kw:["trese netflix","filipino folklore noir","anime noir shading","manila night cityscape","aswang creatures","heavy black shadow blocks"],
    desc:"菲律宾神话的黑色电影改编：马尼拉的霓虹夜景、饱和度极低的灯光、以及大片纯黑阴影。精灵怪物取自本土传说，与日式妖怪明显不同。",
    demo:"lone detective walking rainy manila street under flickering neon, trese anime noir style, heavy black shadow blocks, aswang silhouette in alley, desaturated night palette" },

  { id:"W-I05", zh:"乌宾与怡冰", romaji:"Upin & Ipin", grp:"印度·东南亚", year:2007, studio:"Les Copaque Production",
    kw:["upin and ipin","malaysian animation","round glossy cgi twins","kampong village rooftops","clean bright cartoon colors","simple toy shapes"],
    desc:"马来西亚的国民动画：两个光头顶着呆毛的圆润双胞胎、柔光的高光塑料材质、以及高脚屋构成的甘榜村。整体明快、干净、绝不恐怖。",
    demo:"two round glossy twins with single cowlick standing before wooden kampong stilt house, malaysian cgi children animation, clean bright greens and blues, sunny afternoon" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { WORKS_MORE_A };
