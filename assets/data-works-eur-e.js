/* ============================================================
 * 数据层 B-5：苏联与东欧 / 德语区与南欧 / 拉丁美洲
 * 说明：中文说明字段一律纯中文；英文只出现在 kw 与 demo
 * ============================================================ */

const WORKS_EUR_E = [

  /* ---------- 苏联与俄罗斯 ---------- */
  { id:"W-R01", zh:"雾中刺猬", romaji:"Hedgehog in the Fog", grp:"欧洲·苏联东欧", year:1975, studio:"Soyuzmultfilm",
    kw:["hedgehog in the fog","yuri norstein","layered gouache mist","oil paint on glass","soft autumn forest depth","quiet poetic atmosphere"],
    desc:"玻璃油画流派的代表：雾是层层叠叠的水粉涂层，每揭开一层就多一分深度。小马与刺猬都被画成毛茸茸的剪影，在几乎透明的白雾里说话。",
    demo:"small hedgehog walking through luminous white mist past a horse silhouette, layered gouache fog, oil paint on glass depth, quiet poetic mood, soft autumn forest" },

  { id:"W-R02", zh:"故事中的故事", romaji:"Tale of Tales", grp:"欧洲·苏联东欧", year:1979, studio:"Soyuzmultfilm",
    kw:["tale of tales 1979","painterly soviet animation","little grey wolf puppet","dense forest brushwork","seamless flowing transitions","melancholy wartime memory"],
    desc:"影史最受推崇的短片之一：画面靠笔触的浓淡自己完成转场，小灰狼像布偶一样扁平，森林的暗部是厚涂的赭褐。记忆与战后的忧伤混在同一层光里。",
    demo:"small grey wolf pup by warm lamp in dense painterly forest, thick gouache brushwork, seamlessly flowing transitions, nostalgic wartime melancholy, soft flickering light" },

  { id:"W-R03", zh:"雪之女王", romaji:"The Snow Queen", grp:"欧洲·苏联东欧", year:1957, studio:"Soyuzmultfilm",
    kw:["snow queen 1957","classic soviet cel animation","ice crystal palace","ornate slavic folk costume","hand painted winter scenery","deep saturated blues"],
    desc:"苏联时期的经典长片：人物服饰的斯拉夫纹样精细，冰雪宫殿用厚重的白色画出体量。动作流畅，接近美国同期的圆润，笔触却更沉稳。",
    demo:"girl facing towering ice palace of faceted frozen spires, ornate slavic folk costume, hand painted deep winter blues, crisp snow light, classic cel animation" },

  { id:"W-R04", zh:"老人与海", romaji:"The Old Man and the Sea", grp:"欧洲·苏联东欧", year:1999, studio:"Aleksandr Petrov Studio",
    kw:["the old man and the sea animated","paint on glass animation","thick impasto visible brush strokes","ocean light reflections","flowing pigment transitions"],
    desc:"直接在玻璃上用油彩作画：每一帧的笔触都厚到能看见颜料的走向，海面的反光是刮出来的，画面在时间中不断融化又重组成新的形象。",
    demo:"weathered fisherman alone in small boat at sea, paint on glass animation, thick impasto brush strokes, shifting ocean light reflections, flowing pigment transitions" },

  /* ---------- 捷克与东欧 ---------- */
  { id:"W-R05", zh:"鼹鼠的故事", romaji:"The Mole (Krtek)", grp:"欧洲·苏联东欧", year:1957, studio:"Prague Short Film Studio",
    kw:["krtek mole","czech hand drawn animation","round black silhouette mole","almost no dialogue","simple pastel backgrounds","gentle slapstick"],
    desc:"捷克的国民角色：一只黑色圆滚滚的剪影鼹鼠，几乎没有台词，靠拟声与表情推进。背景是淡淡的粉彩，线条圆润，情绪永远温和。",
    demo:"round black mole with tiny pink hands digging in soft pastel garden, czech animation style, minimal simple background, gentle slow slapstick" },

  { id:"W-R06", zh:"爱丽丝", romaji:"Alice (Jan Svankmajer)", grp:"欧洲·苏联东欧", year:1988, studio:"Studio Jiriho Trnky",
    kw:["alice jan svankmajer","surreal czech stop motion","sawdust filled decaying puppets","grimy tactile surfaces","extreme close up textures","desaturated Czech gloom"],
    desc:"捷克超现实定格：兔子的肚子里塞着会动的木屑，裙子是用碎布拼缝的，所有道具都带腐朽与污渍。镜头几乎总在极近处抚摸材质。",
    demo:"grimy white puppet rabbit tearing sawdust from its belly in decaying room, surreal stop motion, extreme close up tactile textures, desaturated decay" },

  { id:"W-R07", zh:"皇帝的夜莺", romaji:"The Emperor's Nightingale", grp:"欧洲·苏联东欧", year:1949, studio:"Studio Jiriho Trnky",
    kw:["emperor's nightingale","jiri trnka puppet animation","carved wooden puppets","decorated palace court sets","jointed hand crafted figures","theatrical side lighting"],
    desc:"木偶动画的大师之作：角色是雕刻打磨的木头人偶，关节的活动有分量感，宫廷道具像舞台布景一样华美。光是从侧面打来的剧场光。",
    demo:"carved wooden puppet emperor listening to clockwork bird in decorated court, jointed hand crafted figures, carved palace set, theatrical side lighting, stop motion" },

  { id:"W-R08", zh:"代用品", romaji:"Surogat", grp:"欧洲·苏联东欧", year:1961, studio:"Zagreb Film",
    kw:["surogat 1961","zagreb film school","extreme geometric simplification","black line on white void","minimal empty background","modernist graphic animation"],
    desc:"萨格勒布学派的宣言：背景几乎一片空白，人与物都被压成几条黑线组成的几何符号。整部片子里没有一处写实的细节。",
    demo:"stick thin figure inflating into geometric balloon shape on empty white void, modernist graphic animation, extreme simplification, minimal black line, flat shapes" },

  { id:"W-R09", zh:"大教堂", romaji:"The Cathedral", grp:"欧洲·苏联东欧", year:2002, studio:"Platige Image",
    kw:["the cathedral 2002","dark gothic science fiction","monolithic black architecture","cold volumetric light shafts","bonelike surface textures","slavic melancholy render"],
    desc:"波兰的暗黑科幻：巨构建筑是纯黑的体量，光从高处切成一束束冷白色的光柱。建筑表面爬着骨骼般的纹路，整体拒绝任何暖色。",
    demo:"lone figure approaching monolithic black gothic structure, cold volumetric light shafts, bonelike surface detail, desaturated darkness, dark slavic science fiction" },

  { id:"W-R10", zh:"草地上的早餐", romaji:"Breakfast on the Grass", grp:"欧洲·苏联东欧", year:1987, studio:"Tallinnfilm",
    kw:["breakfast on the grass","estonian surreal animation","grotesque ink distortion","chaotic metamorphosis","dense acidic line hatching","absurd political satire"],
    desc:"爱沙尼亚的讽刺超现实：形体不断互相吞噬变形，线条密集成近乎黑色的阴影，荒诞的政治隐喻藏在每个细节里。画面让人不安又忍不住细看。",
    demo:"grotesque figures metamorphosing into one another at a chaotic picnic, dense acidic line hatching, ink distortion, absurd satirical detail, chaotic composition" },

  /* ---------- 德语区与南欧 ---------- */
  { id:"W-R11", zh:"阿基米德王子历险记", romaji:"The Adventures of Prince Achmed", grp:"欧洲·德国西班牙", year:1926, studio:"Lotte Reiniger Studio",
    kw:["prince achmed","lotte reiniger","black silhouette animation","jointed cutout puppets","translucent backlit paper layers","hand cut palace details"],
    desc:"世界现存最古的动画长片：所有角色都是铰接的黑色剪影，背景是半透明的剪纸分层背光打亮。每一处镂空都是手工剪出来的花纹。",
    demo:"black silhouette prince riding winged horse above hand cut palace, lotte reiniger silhouette animation, translucent backlit paper layers, warm amber glow behind" },

  { id:"W-R12", zh:"皱纹", romaji:"Wrinkles", grp:"欧洲·德国西班牙", year:2011, studio:"Perro Verde Films",
    kw:["wrinkles arrugas","spanish adult animation","aged wrinkled skin detail","muted institutional palette","gentle observational linework","quiet emotional drama"],
    desc:"西班牙的老年题材成人动画：皮肤的褶皱被耐心地画出来，养老院的配色是褪色的米黄与浅绿。线条松弛克制，从不煽情。",
    demo:"elderly man in faded institutional corridor, spanish adult animation style, detailed wrinkled skin linework, muted faded palette, quiet dignified mood" },

  /* ---------- 拉丁美洲 ---------- */
  { id:"W-L01", zh:"男孩和世界", romaji:"The Boy and the World", grp:"拉美动画", year:2013, studio:"Filme de Papel",
    kw:["boy and the world","crayon and collage textures","childlike drawn shapes","vivid brazilian folk colors","musical abstract sequences","paper and textile patterns"],
    desc:"巴西混媒介的代表：蜡笔、报纸剪贴、布料与色粉同处一屏，画面随音乐抽象地变形。几乎没有对白，靠色彩推进叙事。",
    demo:"child with crayon drawn round body walking through shifting collage landscape, mixed paper and textile textures, vivid brazilian folk colors, musical abstraction" },

  { id:"W-L02", zh:"狼屋", romaji:"The Wolf House", grp:"拉美动画", year:2018, studio:"Diluvio / Globo Rojo",
    kw:["la casa lobo","chilean stop motion horror","melting clay and paint puppets","decaying wall surfaces","unsettling shifting anatomy","dim oppressive interiors"],
    desc:"智利的定格噩梦：木屋的墙面在呼吸，人物像被颜料和黏土捏出来又不断融化的玩偶。浑浊的油彩与昏黄的光让人分不清实体与幻觉。",
    demo:"figure assembled from melting clay and paint inside decaying wooden room, shifting unsettling anatomy, peeling wall surfaces, dim yellow dread, stop motion texture" },

  { id:"W-L03", zh:"桌面足球", romaji:"Metegol", grp:"拉美动画", year:2013, studio:"Illusion Studios",
    kw:["metegol foosball","argentine 3d animation","tabletop foosball figures","dramatic stadium lighting","warm crowd colors","rounded toy faces"],
    desc:"阿根廷的三维动画：角色直接借用桌面足球人偶的比例，接合点明显，面部圆润。球场灯光与观众席被处理得像一场真正的盛大比赛。",
    demo:"small foosball figure hero scoring under dramatic stadium floodlights, rounded toy face, warm crowd colors, glossy plastic shading, stadium wide shot" },

  { id:"W-L04", zh:"生命之书", romaji:"The Book of Life", grp:"拉美动画", year:2014, studio:"Reel FX",
    kw:["book of life","day of the dead visuals","marigold orange and magenta","painted sugar skull faces","carved folk puppet proportions","layered paper cut textures"],
    desc:"亡灵节的视觉大典：骷髅脸上绘满糖画纹样，万寿菊的橙色铺满全片，人物比例接近墨西哥民间木偶。所有材质都带着手工雕刻与剪纸的痕迹。",
    demo:"skeletal musician with painted sugar skull face among falling marigold petals, day of the dead color palette, carved folk puppet proportions, layered paper textures" },

  { id:"W-L05", zh:"玛法达", romaji:"Mafalda", grp:"拉美动画", year:1972, studio:"Catu Studios",
    kw:["mafalda","argentine comic adaptation","round faced little girl","1960s latin american satire","minimal flat backgrounds","thin clean line drawing"],
    desc:"阿根廷国民漫画的动画版：圆脸小女孩，线条简单到几笔成形，背景常常只有一张桌子或一面墙。文字的重量远大于画面。",
    demo:"round faced little girl with dark bob hair sitting at table thinking, simple clean line drawing, minimal flat single color background, vintage newspaper comic look" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { WORKS_EUR_E };
