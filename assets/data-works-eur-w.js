/* ============================================================
 * 数据层 B-4：欧洲西部 —— 法国、比利时、英国、爱尔兰、北欧
 * 说明：中文说明字段一律纯中文；英文只出现在 kw 与 demo
 * ============================================================ */

const WORKS_EUR_W = [

  /* ---------- 法国与比利时 ---------- */
  { id:"W-F01", zh:"丁丁历险记", romaji:"The Adventures of Tintin", grp:"欧洲·法国比利时", year:1991, studio:"Ellipse / Nelvana",
    kw:["tintin animated series","ligne claire style","uniform thin outlines","flat unmodeled colors","detailed european cars","herge"],
    desc:"清晰线条派的活标本：人物轮廓的粗细完全一致，色块平涂到几乎没有明暗，身后的街景与老爷车却画得像工程图纸一样准确。人物极简，环境极繁。",
    demo:"young reporter with quiff hairstyle running down european harbor street, ligne claire animation style, uniform thin outlines, flat colors, meticulously detailed cars behind" },

  { id:"W-F02", zh:"美丽城三重奏", romaji:"The Triplets of Belleville", grp:"欧洲·法国比利时", year:2003, studio:"Les Armateurs",
    kw:["triplets of belleville","sylvain chomet","caricature thin pointed faces","hand drawn pencil grit","muted sepia palette","exaggerated french silhouettes"],
    desc:"法国讽刺漫画的动画化：脸被拉长到扭曲，鼻子像鸟喙，配色压成褐黄与灰蓝的旧照片调。画面留着铅笔的毛边与反复描摹的痕迹。",
    demo:"three lanky elderly singers with pointed caricature faces on dim stage, triplets of belleville style, hand drawn pencil grit, muted sepia and slate palette" },

  { id:"W-F03", zh:"魔术师", romaji:"The Illusionist", grp:"欧洲·法国比利时", year:2010, studio:"Django Films",
    kw:["the illusionist 2010","almost wordless storytelling","hand sketched line movement","dusty northern europe light","1950s scotland pubs","gentle melancholy"],
    desc:"几乎没有对白的叙事：线条在纸上轻微地呼吸，酒馆的雾气、舞台的灰尘都被画成半透明的层。全片是克制的灰蓝与暖褐。",
    demo:"aging magician performing in smoky scottish pub, hand sketched trembling line movement, dusty muted light, gentle melancholy atmosphere, european animated film" },

  { id:"W-F04", zh:"我在伊朗长大", romaji:"Persepolis", grp:"欧洲·法国比利时", year:2007, studio:"Celluloid Dreams",
    kw:["persepolis style","high contrast monochrome","flat black silhouettes","engraved woodcut texture","revolution era street","geometric headscarf shapes"],
    desc:"全片只有黑白：大面积的纯黑剪影，像木刻版画一样的粗粝纹理，几何化的服装构成醒目块面。政治叙事与个人回忆共用同一套极简语言。",
    demo:"teenage girl in angular black headscarf among flat black silhouette crowd, persepolis animation style, high contrast monochrome, woodcut engraved texture, poster framing" },

  { id:"W-F05", zh:"奇幻星球", romaji:"Fantastic Planet", grp:"欧洲·法国比利时", year:1973, studio:"Studio Bertrand",
    kw:["fantastic planet","psychedelic 1970s animation","surreal alien flora","cutout paper animation","harsh primary color blocks","dreamlike scale play"],
    desc:"七十年代的迷幻科幻：植物像流动的颜料一样变形，生物由剪贴纸片拼成，远近关系被随意打乱。整体是一套令人不安的超现实生态。",
    demo:"tiny humans fleeing across alien plain beneath enormous pale blue giants, fantastic planet psychedelic style, cutout paper animation, shifting flora, flat color blocks" },

  { id:"W-F06", zh:"时间之主", romaji:"Les Maitres du Temps", grp:"欧洲·法国比利时", year:1982, studio:"TF1 Films",
    kw:["les maitres du temps","moebius art direction","ligne claire science fiction","flat pastel desert planets","wireframe spaceships","elegant minimal scenery"],
    desc:"墨比斯担纲美术的科幻：线条均匀到近乎制图，星球的沙漠被处理成粉与薄荷绿的平涂色带，飞船是细瘦的线框。整体干净、空旷、克制。",
    demo:"slim figure crossing pale pink desert planet with tall thin spires, moebius ligne claire science fiction, flat pastel color bands, wireframe spacecraft overhead" },

  { id:"W-F07", zh:"叽哩咕与女巫", romaji:"Kirikou and the Sorceress", grp:"欧洲·法国比利时", year:1998, studio:"Les Armateurs",
    kw:["kirikou and the sorceress","african inspired flat design","bold silhouette against savanna","decorative patterned foliage","warm ochre and terracotta","side view staging"],
    desc:"西非视觉传统的动画化：人物常被压成剪影贴在赭红的大地上，植物与布料布满装饰纹样，配色取自陶土与阳光。拒绝透视，靠层叠表示远近。",
    demo:"tiny boy silhouette facing baobab tree on ochre savanna, kirikou african flat design style, decorative patterned foliage, warm terracotta palette, side view staging" },

  { id:"W-F08", zh:"阿祖尔与阿斯马尔", romaji:"Azur and Asmar", grp:"欧洲·法国比利时", year:2006, studio:"Nord-Ouest Films",
    kw:["azur and asmar","middle eastern ornament","islamic geometric patterns","luminous interior courtyards","cut paper layered depth","turquoise and gold"],
    desc:"中东与欧式装饰的百科：地砖、拱门、灯笼、幔帐全部填满几何纹样，画面几乎没有留白。层叠的剪纸同时做前景与中景，形成通透的纵深。",
    demo:"two boys in ornate courtyard of turquoise tilework and hanging lanterns, islamic geometric patterns, luminous layered cut paper depth, gold accents, flat decorative design" },

  { id:"W-F09", zh:"机械心", romaji:"Jack and the Cuckoo-Heart", grp:"欧洲·法国比利时", year:2013, studio:"EuropaCorp",
    kw:["jack and the cuckoo heart","gothic fairytale animation","clockwork chest mechanism","lean angular silhouettes","cold blue and burgundy","snow covered rooftops"],
    desc:"哥特童话的法国版本：瘦长的身形、尖顶的房屋、胸腔里露出齿轮的时钟机构。全片偏冷的蓝紫与深酒红，雪与雾给画面加了一层柔光。",
    demo:"slim boy with clockwork mechanism visible in chest on snowy rooftop, gothic fairytale animation, cold blue and burgundy palette, steep pointed village roofs" },

  { id:"W-F10", zh:"明月守护者", romaji:"Mune: Guardian of the Moon", grp:"欧洲·法国比利时", year:2014, studio:"Onyx Films",
    kw:["mune guardian of the moon","stylized 3d european animation","mythic symbolic lighting","glowing night creatures","saturated fantasy palette","sculpted organic shapes"],
    desc:"欧洲三维的一支少见路线：形体被雕塑成柔和的有机曲面，月亮与太阳的领地各自拥有一套光色系统。饱和度极高，几乎没有灰调。",
    demo:"small faun carrying glowing moon through fantastical forest clearing, european stylized 3d animation, sculpted organic shapes, luminous night creatures, saturated fantasy colors" },

  { id:"W-F11", zh:"蓝精灵", romaji:"The Smurfs", grp:"欧洲·法国比利时", year:1981, studio:"Hanna-Barbera / Peyo",
    kw:["smurfs","tiny blue mushroom village","uniform simple characters","white phrygian caps","clean 1980s cartoon lines","sunny storybook forest"],
    desc:"源自比利时漫画家佩约：除了帽子与服装的差异，所有角色的身体几乎完全相同。蘑菇屋、圆润轮廓与明亮平坦的底色构成安全舒适的童趣。",
    demo:"tiny blue creatures with white caps among mushroom houses in sunny forest clearing, classic 1980s cartoon style, simple uniform body shapes, clean flat colors" },

  { id:"W-F12", zh:"我失去了身体", romaji:"I Lost My Body", grp:"欧洲·法国比利时", year:2019, studio:"Xilam",
    kw:["i lost my body","severed hand point of view","adult european animation","gritty realistic paris","desaturated urban palette","quiet melancholy"],
    desc:"以一只断手的主观视角拍摄巴黎：粗糙的城市质感、低饱和的水泥色调、路人永远面无表情。法国成人动画中少见的冷静观察者路线。",
    demo:"severed hand crawling across gritty paris rooftop at dawn, adult european animation style, desaturated concrete palette, low angle gritty realism, quiet melancholy" },

  /* ---------- 英国与爱尔兰 ---------- */
  { id:"W-F13", zh:"超级无敌掌门狗", romaji:"Wallace and Gromit", grp:"欧洲·英国爱尔兰", year:1989, studio:"Aardman Animations",
    kw:["wallace and gromit","claymation","clay fingerprint texture","hand knitted props","english suburban interiors","practical miniature lighting"],
    desc:"黏土定格的世界标准：表面留有指纹与手掌压痕，毛衣是一针一线织出来的道具，房间是实体搭建的微缩模型。光来自真实的摄影棚灯，而不是渲染。",
    demo:"clay inventor beside his dog in tiny english kitchen, wallace and gromit claymation, visible fingerprints on clay surface, hand knitted props, warm practical set lighting" },

  { id:"W-F14", zh:"小鸡快跑", romaji:"Chicken Run", grp:"欧洲·英国爱尔兰", year:2000, studio:"Aardman Animations",
    kw:["chicken run","massed clay crowd","sculpted feather detailing","escape film lighting","green tinged dramatic shadows","miniature barbed wire sets"],
    desc:"把战争片的语汇套在黏土上：铁丝网的剪影、大俯拍的群体调度、冷绿的轮廓光。羽毛是被逐层塑出来的，边缘保留着工具刀痕。",
    demo:"flock of clay hens silhouetted against barbed wire under moonlight, chicken run claymation, sculpted feather detail, green dramatic rim light, massive miniature set" },

  { id:"W-F15", zh:"小羊肖恩", romaji:"Shaun the Sheep", grp:"欧洲·英国爱尔兰", year:2007, studio:"Aardman Animations",
    kw:["shaun the sheep","wordless slapstick claymation","fluffy sculpted wool","minimal facial expression","bright english farm sets","stop motion timing"],
    desc:"没有台词的喜剧：羊毛的蓬松是用指尖捏出来的体积，五官几乎只有眼睛的变化。节奏依赖逐格动画特有的微小跳帧，刻意不做平滑。",
    demo:"fluffy clay sheep grinning mischievously beside green english barn, stop motion claymation, sculpted wool texture, minimal facial features, bright countryside lighting" },

  { id:"W-F16", zh:"黄色潜水艇", romaji:"Yellow Submarine", grp:"欧洲·英国爱尔兰", year:1968, studio:"Apple Films / TVC London",
    kw:["yellow submarine","psychedelic pop art","kaleidoscopic flat shapes","1960s poster design","irregular wobbling outlines","hand painted collage texture"],
    desc:"波普艺术的动画巅峰：轮廓永远在抖动，色块被切成不规则的碎片往画面外溢，文字与图像像海报一样叠印。六十年代迷幻视觉的总集。",
    demo:"vibrant psychedelic seascape with wobbling irregular shapes and kaleidoscopic color fields, 1968 pop art animation, hand painted collage texture, vintage print grain" },

  { id:"W-F17", zh:"动物农场", romaji:"Animal Farm", grp:"欧洲·英国爱尔兰", year:1954, studio:"Halas and Batchelor",
    kw:["animal farm 1954","british hand drawn animation","heavy ink farmyard drawing","cold muted palette","political allegory","1950s limited animation"],
    desc:"英国的第一部动画长片：农庄场景用沉重的墨线画出，牲畜既写实又带着拟人化的歪斜。整体冷灰，与同期美国动画的甜美截然相反。",
    demo:"animals gathered before weathered barn in cold grey farmland, 1950s british hand drawn animation, heavy ink outlines, muted desaturated palette, political allegory mood" },

  { id:"W-F18", zh:"凯尔经的秘密", romaji:"The Secret of Kells", grp:"欧洲·英国爱尔兰", year:2009, studio:"Cartoon Saloon",
    kw:["secret of kells","illuminated manuscript style","gold lettering spirals","flat geometric characters","celtic knot borders","deep forest ink blues"],
    desc:"爱尔兰手抄本的设计语言被直接搬进画面：角色压成扁平几何块，边框爬满凯尔特结与插画，金色螺旋符号不断出现在背景里。",
    demo:"young monk beside towering forest rendered as flat geometric shapes, celtic knot borders, illuminated manuscript gold spirals, deep ink blue palette, decorative flat design" },

  { id:"W-F19", zh:"海洋之歌", romaji:"Song of the Sea", grp:"欧洲·英国爱尔兰", year:2014, studio:"Cartoon Saloon",
    kw:["song of the sea","irish selkie folklore","watercolor wash textures","circular symbolic motifs","soft teal and lavender","lighthouse coastal scenes"],
    desc:"把凯尔特神话画进水的透明度里：背景是层层晕开的水彩，符号以同心圆与螺旋反复出现，灯塔与礁石构成主要的海岸构图。",
    demo:"girl in white seal coat on misty coast beneath lighthouse, irish folklore animation, watercolor wash textures, circular symbolic motifs, soft teal and lavender palette" },

  { id:"W-F20", zh:"狼行者", romaji:"Wolfwalkers", grp:"欧洲·英国爱尔兰", year:2020, studio:"Cartoon Saloon",
    kw:["wolfwalkers","rough sketchbook linework","hatched woodcut textures","warm fire and cold moon contrast","medieval irish town blocks","wide screen composition"],
    desc:"刻意保留的手稿感：线条像炭笔速写一样毛糙，木刻式的排线用来做暗部。镇子是一整块石材的颜色，森林则是流动的银灰与暖橘。",
    demo:"wild girl running as wolf through medieval stone town at dusk, rough sketchbook linework, hatched woodcut shading, warm fire against cold moonlight, wide composition" },

  { id:"W-F21", zh:"养家之人", romaji:"The Breadwinner", grp:"欧洲·英国爱尔兰", year:2017, studio:"Cartoon Saloon / Aircraft Pictures",
    kw:["the breadwinner","middle eastern dusty town","hand drawn texture over flat shapes","sandstorm ochre palette","patterned market stalls","embedded storybook layer"],
    desc:"现实与传说的双层叙事：现实层是尘土飞扬的土黄市场，传说层切换成明亮装饰性的水彩插画。两层共用同一套角色造型，靠配色与笔触区分。",
    demo:"girl in market of dusty ochre stalls with glowing decorative storybook layer unfolding behind, hand drawn texture, warm sand palette, flat character shapes" },

  /* ---------- 北欧 ---------- */
  { id:"W-F22", zh:"噜噜米（姆明）", romaji:"Moomin", grp:"欧洲·北欧", year:1990, studio:"Telescreen / Yleisradio",
    kw:["moomin","tove jansson","round pale snouted creatures","soft finnish watercolor backgrounds","northern summer night light","simple gentle ink lines"],
    desc:"托芙·扬松的北欧世界：白色的圆润形体、几乎没有高光的哑光质感，夏夜的光是柔和的淡青与米白。线条简单到接近绘本插画。",
    demo:"round pale snouted creatures outside blue wooden house in northern summer night, moomin style, soft watercolor backgrounds, pale nordic light, gentle simple outlines" },

  { id:"W-F23", zh:"逃亡", romaji:"Flee", grp:"欧洲·北欧", year:2021, studio:"Final Cut for Real",
    kw:["flee animated documentary","rough trembling linework","muted desaturated interiors","memory sequence monochrome","adult refugee drama","grainy film texture"],
    desc:"动画纪录片的代表：线条粗糙得像在颤抖，回忆段落切换成几乎无色的灰调，现实层反而保留暖光。用写实的画法处理严肃题材是它的核心。",
    demo:"young man sitting in sparse northern room, animated documentary style, rough trembling linework, muted desaturated interior, grainy film texture, restrained warmth" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { WORKS_EUR_W };
