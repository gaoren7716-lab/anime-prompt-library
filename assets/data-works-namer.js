/* ============================================================
 * 数据层 B-6：北美动画史源流、国民卡通与成人动画
 * 说明：中文说明字段一律纯中文；英文只出现在 kw 与 demo
 * ============================================================ */

const WORKS_NAMER = [

  /* ---------- 动画史源流 ---------- */
  { id:"W-N01", zh:"威利号汽船", romaji:"Steamboat Willie", grp:"北美·动画史源流", year:1928, studio:"Disney",
    kw:["steamboat willie","1928 black and white cartoon","rubber hose limbs","white four fingered gloves","bouncing on beat motion","heavy vintage film grain"],
    desc:"史上第一部声画同步的动画：四肢是可以任意弯曲的橡皮管，白色手套从此成为惯例，动作严格跟着音乐节拍弹跳。全片黑白，布满跳动的颗粒。",
    demo:"black and white mouse steering paddle steamer whistling, 1928 rubber hose cartoon, noodle limbs, white gloves, bouncy music timed motion, heavy vintage film grain" },

  { id:"W-N02", zh:"菲力猫", romaji:"Felix the Cat", grp:"北美·动画史源流", year:1919, studio:"Pat Sullivan Studio",
    kw:["felix the cat","1919 silent cartoon","black figure on white void","detached walking hands","surreal transformation gags","vintage projector flicker"],
    desc:"默片时代的第一个动画明星：纯黑的身体在白底上移动，尾巴与手脚会脱离身体变成道具，情绪全靠四肢的弧度表达，几乎不用表情。",
    demo:"black cat with detached walking hands on empty white background, silent era cartoon, simple bold shapes, surreal transformation gag, projector flicker" },

  { id:"W-N03", zh:"贝蒂娃娃", romaji:"Betty Boop", grp:"北美·动画史源流", year:1930, studio:"Fleischer Studios",
    kw:["betty boop","fleischer studios","1930s jazz age","round faced flapper","inkwell surreal gags","wobbly rubber hose"],
    desc:"爵士年代的产物：圆脸、短裙、袜带勾勒出的都市女郎，一切都能变成游戏的道具。线条持续地抖动、流水般地变形，是橡皮管动画最放纵的一支。",
    demo:"round faced 1930s flapper singing beside wobbling objects coming alive, fleischer rubber hose animation, jazz age styling, surreal inkwell gags, vintage grain" },

  { id:"W-N04", zh:"猫和老鼠", romaji:"Tom and Jerry", grp:"北美·动画史源流", year:1940, studio:"MGM",
    kw:["tom and jerry","1940s theatrical cartoon","exaggerated squash and stretch","impact dust clouds","elaborate trap props","detailed painted room backgrounds"],
    desc:"挤压拉伸的物理课本：被压成手风琴的身体、弹回时的过冲、炸开后悬浮的尘埃云。背景反而画得相当扎实，与角色的疯狂变形形成对比。",
    demo:"cat flattened into accordion shape by falling piano, theatrical cartoon style, extreme squash and stretch, dust impact cloud, detailed painted room background" },

  { id:"W-N05", zh:"乐一通", romaji:"Looney Tunes", grp:"北美·动画史源流", year:1930, studio:"Warner Bros",
    kw:["looney tunes","warner bros cartoon","wild take popping eyes","slow suspended fall","desert cliff scenery","bold flat western palette"],
    desc:"美式动画的狂暴美学：眼睛可以弹出眼眶，身体能在空中悬停一瞬才坠落，角色性情全写在轮廓上。沙漠与悬崖是最经典的舞台。",
    demo:"wide eyed rabbit taking wild surprised leap above desert cliff road, theatrical cartoon style, exaggerated wild take, bold flat western palette, anvil gag" },

  { id:"W-N06", zh:"白雪公主与七个小矮人", romaji:"Snow White and the Seven Dwarfs", grp:"北美·动画史源流", year:1937, studio:"Disney",
    kw:["snow white 1937","multiplane camera depth","hand painted storybook backgrounds","soft rounded proportions","warm fairy tale palette","woodland cottage detail"],
    desc:"世界第一部彩色动画长片：多层摄影机带来真正的景深，背景是一笔笔画出来的故事书森林。女性角色面容柔圆，配色温暖而阴影克制。",
    demo:"maiden beside woodland cottage surrounded by forest animals, 1937 storybook animation, multiplane painted depth, soft rounded forms, warm fairy tale colors" },

  { id:"W-N07", zh:"马鸪先生", romaji:"Mr. Magoo", grp:"北美·动画史源流", year:1949, studio:"UPA",
    kw:["mr magoo","upa limited animation","modernist flat backgrounds","abstract color fields","minimal line character","poster composition"],
    desc:"有限动画与现代主义的交汇：人物被压缩成一个椭圆加一顶帽子，背景却是真正的平面构成。设计感彻底压过了写实。",
    demo:"tiny round man squinting before angular modernist color field backdrop, limited animation, minimal line figure, flat poster composition, bold abstract shapes" },

  { id:"W-N08", zh:"花生漫画", romaji:"Peanuts", grp:"北美·动画史源流", year:1965, studio:"Bill Melendez Productions",
    kw:["peanuts special","charles schulz line","thin wobbly ink lines","flat pale backgrounds","winter holiday nostalgia","simple round head profiles"],
    desc:"舒尔茨的线条：细、抖、不均匀，背景經常是极简的单色甚至纯白。头部几乎就是一个圆，角色之间的差异只在鼻子的弧度。",
    demo:"round headed boy and beagle sitting on snowy hill, thin wobbly ink lines, flat pale background, quiet winter nostalgia, minimal children illustration" },

  /* ---------- 国民卡通 ---------- */
  { id:"W-N09", zh:"海绵宝宝", romaji:"SpongeBob SquarePants", grp:"北美·国民卡通", year:1999, studio:"Nickelodeon",
    kw:["spongebob squarepants","bright loud cartoon","rectangular porous body","hawaiian flower cloud backgrounds","extreme warped expressions","saturated undersea colors"],
    desc:"极度饱和的卡通：方形的身体布满孔洞，背景是夏威夷花纹的云。表情可以瞬间扭曲成超现实的形状，配色几乎是故意刺眼。",
    demo:"rectangular porous sea creature grinning widely with hawaiian flower clouds behind, loud saturated cartoon colors, exaggerated warped face, clean bold outlines" },

  { id:"W-N10", zh:"德克斯特的实验室", romaji:"Dexter's Laboratory", grp:"北美·国民卡通", year:1996, studio:"Cartoon Network",
    kw:["dexters laboratory","genndy tartakovsky","clean bold geometric shapes","thick black outlines","1960s retro modern interiors","high contrast primary colors"],
    desc:"九十年代卡通频道的模板：厚重的黑线、干净的几何剪影、六十年代复古未来的室内设计。形体像剪纸，动作却是整块的位移。",
    demo:"tiny boy genius in thick outlined lab coat before retro modern control desk, clean bold geometric shapes, high contrast primary colors, flat minimal shading" },

  { id:"W-N11", zh:"胆小狗英雄", romaji:"Courage the Cowardly Dog", grp:"北美·国民卡通", year:1999, studio:"Cartoon Network",
    kw:["courage the cowardly dog","uneasy horror comedy","melting terrified expressions","grimy shimmering textures","sickly green lighting","crooked distorted architecture"],
    desc:"儿童向的恐怖喜剧：房屋永远是歪的，墙面与其他表面有不断变化的污渍纹理，光源常常是病态的绿或不健康的紫。表情夸张到接近惊悚。",
    demo:"trembling pink dog in crooked farmhouse corridor lit sickly green, warped unsettling architecture, grimy shimmering textures, distorted terrified expression" },

  { id:"W-N12", zh:"恶搞之家", romaji:"Family Guy", grp:"北美·国民卡通", year:1999, studio:"Fox",
    kw:["family guy","flat television animation","identical face template","cutaway gag staging","clean untextured backgrounds","basic flat color fills"],
    desc:"最工业化的电视动画模板：所有角色共用同一张脸，只有头发与衣服不同，背景干净到几乎只剩色块，动画帧数被刻意压到最低。",
    demo:"rounded suburban family standing in flat simple living room, television animation style, identical simple face template, clean untextured flat backgrounds" },

  /* ---------- 成人动画 ---------- */
  { id:"W-N13", zh:"辛普森一家", romaji:"The Simpsons", grp:"北美·成人动画", year:1989, studio:"20th Century Fox",
    kw:["the simpsons","yellow four fingered characters","bulging overbite eyes","hand drawn flat backgrounds","suburban town establishing shot","thick clean outlines"],
    desc:"成人情景喜剧动画的样板：黄色皮肤、四根手指、突出的大眼与外凸的下颌。背景是手绘而非矢量，永远带着一点点歪。",
    demo:"yellow skinned family with bulging eyes on suburban street, four fingered hands, hand drawn flat television backgrounds, thick clean outlines, sitcom framing" },

  { id:"W-N14", zh:"南方公园", romaji:"South Park", grp:"北美·成人动画", year:1997, studio:"Comedy Central",
    kw:["south park","construction paper cutout","torn coarse paper edges","jerky stop motion timing","crayon scribble backgrounds","snowy colorado town"],
    desc:"剪纸模拟的极致：一切用彩色卡纸与蜡笔涂鸦拼出，运动故意做成一顿一顿的抽帧感，边缘保留剪刀留下的不齐。",
    demo:"four crude paper cutout boys standing in snowy small town, torn construction paper texture, crayon scribble background, jerky stop motion timing, coarse edges" },

  { id:"W-N15", zh:"飞出个未来", romaji:"Futurama", grp:"北美·成人动画", year:1999, studio:"The Curiosity Company",
    kw:["futurama","retro futurism satellite","1950s vision of tomorrow","chrome and pastel rockets","neon metropolitan sprawl","clean satirical science fiction"],
    desc:"把五十年代的老式未来主义重新搬运：镀铬的火箭、奶白与粉红的配色、以及霓虹的都市远景。讽刺的剧本配干净认真的构图。",
    demo:"chrome finned rocket over sprawling retro futurist neon city, 1950s vision of tomorrow, pastel and chrome palette, clean satirical science fiction cartoon" },

  { id:"W-N16", zh:"马男波杰克", romaji:"BoJack Horseman", grp:"北美·成人动画", year:2014, studio:"Tornante Company",
    kw:["bojack horseman","anthropomorphic hollywood drama","vibrant painterly los angeles","surreal comedic full frame gags","flat bold comedic shapes","grainy purple sunsets"],
    desc:"拟人动物的表面下是扎实的颜色剧本：城市的紫金色黄昏带有明显的笔触，笑点常以整幅画面的超现实形式呈现。造型扁平而背景讲究。",
    demo:"anthropomorphic horse on hillside overlooking city at purple golden hour, painterly vibrant sunset, flat bold comedic character shapes, grainy haze" },

  { id:"W-N17", zh:"原始狩猎", romaji:"Primal", grp:"北美·成人动画", year:2019, studio:"Cartoon Network Studios",
    kw:["primal genndy tartakovsky","dialogue free storytelling","painted oil background","prehistoric brutality","color coded emotional scenes","heavy atmospheric haze"],
    desc:"没有对白的叙事实验：背景是一幅幅厚涂的油画，风、雨、血都被画成明确的笔触。情绪靠整幅画面的色相切换表达，极少给角色特写。",
    demo:"lone caveman and dinosaur silhouetted against painted blood red sunset, visible painterly brushwork, heavy atmospheric haze, epic wide shot, color coded mood" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { WORKS_NAMER };
