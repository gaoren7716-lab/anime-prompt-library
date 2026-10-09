// 06 世界与资产库（下）WD-05 ~ WD-08
// 注意：zh / desc / path 必须是纯中文，英文只允许出现在 kw / en / alt。

var LIB_WORLD2 = [
// ── WD-05 室内空间 ────────────────────────────────────
{ id:"WD-05", lib:"06", up:null, path:"世界与资产 › 室内空间", zh:"室内空间", en:"Interior", alt:["室内"],
  desc:"室内是密度最高的场景，物品堆叠顺序比物品本身更重要。" },
{ id:"WD-05-1", lib:"06", up:"WD-05", path:"世界与资产 › 室内空间 › 居住空间", zh:"居住空间", en:"Living Space", slot:"content",
  kw:["living room","cozy interior","residential detail"], alt:["家"], desc:"私人物品与个人痕迹构成使用者画像。" },
{ id:"WD-05-2", lib:"06", up:"WD-05", path:"世界与资产 › 室内空间 › 工作与作坊", zh:"工作与作坊", en:"Workshop", slot:"content",
  kw:["workshop interior","tools scattered","artisan bench"], alt:["工作室"], desc:"工具摆放方式直接交代职业。" },
{ id:"WD-05-3", lib:"06", up:"WD-05", path:"世界与资产 › 室内空间 › 商业空间", zh:"商业空间", en:"Commercial Space", slot:"content",
  kw:["shop interior","market stalls","cafe counter"], alt:["店铺"], desc:"陈列密度高，招牌与货品形成重复节奏。" },
{ id:"WD-05-4", lib:"06", up:"WD-05", path:"世界与资产 › 室内空间 › 公共大空间", zh:"公共大空间", en:"Public Hall", slot:"content",
  kw:["station concourse","grand hall","airport terminal"], alt:["大厅"], desc:"大跨度高举架，个体显得渺小。" },
{ id:"WD-05-5", lib:"06", up:"WD-05", path:"世界与资产 › 室内空间 › 密闭狭窄空间", zh:"密闭狭窄空间", en:"Confined Space", slot:"content",
  kw:["narrow corridor","cramped room","confined interior"], alt:["狭窄"], desc:"空间压迫感来自距离而非黑暗，配广角更强。" },
{ id:"WD-05-6", lib:"06", up:"WD-05", path:"世界与资产 › 室内空间 › 神圣空间", zh:"神圣空间", en:"Sacred Space", slot:"content",
  kw:["shrine interior","cathedral nave","altar space"], alt:["神殿"],
  desc:"⚠ 现实宗教场所建议以建筑语言参考，不虚构仪式细节。" },

// ── WD-06 道具与器物 ──────────────────────────────────
{ id:"WD-06", lib:"06", up:null, path:"世界与资产 › 道具器物", zh:"道具器物", en:"Props", alt:["道具"],
  desc:"道具是最小成本的信息增量。给角色一件合适的物件胜过加一层滤镜。" },
{ id:"WD-06-1", lib:"06", up:"WD-06", path:"世界与资产 › 道具器物 › 武器", zh:"武器", en:"Weapon", slot:"content",
  kw:["sword","rifle","fantasy weapon"], alt:["兵器"],
  desc:"区分形制与地域来源，刃纹、护手、握法是主要差异点。" },
{ id:"WD-06-2", lib:"06", up:"WD-06", path:"世界与资产 › 道具器物 › 日常随身物", zh:"日常随身物", en:"Everyday Carry", slot:"content",
  kw:["backpack","phone","water bottle"], alt:["随身物"], desc:"现代角色的身份锚点，往往比服装更有效。" },
{ id:"WD-06-3", lib:"06", up:"WD-06", path:"世界与资产 › 道具器物 › 书籍与信息载体", zh:"书籍与信息载体", en:"Book and Media", slot:"content",
  kw:["open book","scroll","holographic panel"], alt:["书"], desc:"知识类道具，形态随世界观技术水平变化。" },
{ id:"WD-06-4", lib:"06", up:"WD-06", path:"世界与资产 › 道具器物 › 食器与食物", zh:"食器与食物", en:"Food and Tableware", slot:"content",
  kw:["food spread","traditional tableware","steaming dish"], alt:["食物"], desc:"高亲和度道具，能有效软化气氛。" },
{ id:"WD-06-5", lib:"06", up:"WD-06", path:"世界与资产 › 道具器物 › 仪式与象征物", zh:"仪式与象征物", en:"Ritual Object", slot:"content",
  kw:["ceremonial object","talisman","symbolic relic"], alt:["法器"],
  desc:"⚠ 涉及现实宗教法器时只作造型参考，剥离其神圣语义。" },
{ id:"WD-06-6", lib:"06", up:"WD-06", path:"世界与资产 › 道具器物 › 机械装置与仪器", zh:"机械装置与仪器", en:"Apparatus", slot:"content",
  kw:["machinery","control panel","mechanical device"], alt:["装置"], desc:"管线、按钮、仪表构成可操作性的暗示。" },

// ── WD-07 交通工具 ────────────────────────────────────
{ id:"WD-07", lib:"06", up:null, path:"世界与资产 › 交通工具", zh:"交通工具", en:"Vehicle", alt:["载具"],
  desc:"载具是移动的场景。确定动力方式与使用年代，形态自然收束。" },
{ id:"WD-07-1", lib:"06", up:"WD-07", path:"世界与资产 › 交通工具 › 陆行载具", zh:"陆行载具", en:"Ground Vehicle", slot:"content",
  kw:["car","motorcycle","military truck"], alt:["车"], desc:"轮胎、悬挂与离地高度体现用途。" },
{ id:"WD-07-2", lib:"06", up:"WD-07", path:"世界与资产 › 交通工具 › 轨道载具", zh:"轨道载具", en:"Rail Vehicle", slot:"content",
  kw:["train","subway car","tram interior"], alt:["列车"], desc:"受限行进线 + 重复性车窗，适合对话场景。" },
{ id:"WD-07-3", lib:"06", up:"WD-07", path:"世界与资产 › 交通工具 › 船只与水上载具", zh:"船只与水上载具", en:"Watercraft", slot:"content",
  kw:["ship","small boat","sailing vessel"], alt:["船"], desc:"水线、吃水、缆绳与桅的最高处决定类型。" },
{ id:"WD-07-4", lib:"06", up:"WD-07", path:"世界与资产 › 交通工具 › 飞行载具", zh:"飞行载具", en:"Aircraft", slot:"content",
  kw:["aircraft","airship","flying vehicle"], alt:["飞机","飞空艇"], desc:"需交代升力来源，否则读作漂浮物。" },
{ id:"WD-07-5", lib:"06", up:"WD-07", path:"世界与资产 › 交通工具 › 航天与轨道器物", zh:"航天与轨道器物", en:"Spacecraft", slot:"content",
  kw:["spacecraft","space station","orbital craft"], alt:["飞船"], desc:"无修辞硬表面结构，热控层与太阳能板是特征。" },
{ id:"WD-07-6", lib:"06", up:"WD-07", path:"世界与资产 › 交通工具 › 幻想移动装置", zh:"幻想移动装置", en:"Fantasy Conveyance", slot:"content",
  kw:["magic carriage","floating island","phantom steed"], alt:["魔幻载具"], desc:"动力来自魔法或生物，形态不必服从工程逻辑。" },

// ── WD-08 世界观尺度 ──────────────────────────────────
{ id:"WD-08", lib:"06", up:null, path:"世界与资产 › 世界观尺度", zh:"世界观尺度", en:"World Scale", alt:["世界观"],
  desc:"先定尺度层级，再选具体场景，避免元素相互打架。" },
{ id:"WD-08-1", lib:"06", up:"WD-08", path:"世界与资产 › 世界观尺度 › 日常现实尺度", zh:"日常现实尺度", en:"Everyday Scale", slot:"content",
  kw:["everyday setting","ordinary town","slice of life"], alt:["日常"], desc:"距离读者最近，靠细节密度取胜。" },
{ id:"WD-08-2", lib:"06", up:"WD-08", path:"世界与资产 › 世界观尺度 › 历史重构尺度", zh:"历史重构尺度", en:"Historical Reconstruction", slot:"content",
  kw:["historical setting","period accurate","reconstructed era"], alt:["历史"],
  desc:"⚠ 需标注参考时期与地区，不接受笼统的「古代」。" },
{ id:"WD-08-3", lib:"06", up:"WD-08", path:"世界与资产 › 世界观尺度 › 高幻想尺度", zh:"高幻想尺度", en:"High Fantasy", slot:"content",
  kw:["high fantasy world","magic society","mythic landscape"], alt:["西幻"], desc:"魔法作为基础规则存在，影响建筑与经济。" },
{ id:"WD-08-4", lib:"06", up:"WD-08", path:"世界与资产 › 世界观尺度 › 近未来与赛博尺度", zh:"近未来与赛博尺度", en:"Cyberpunk", slot:"content",
  kw:["cyberpunk city","near future","dystopian megacity"], alt:["赛博朋克"], desc:"技术高度发达，社会分层显著，垂直落差大。" },
{ id:"WD-08-5", lib:"06", up:"WD-08", path:"世界与资产 › 世界观尺度 › 末世与废土尺度", zh:"末世与废土尺度", en:"Post-apocalyptic", slot:"content",
  kw:["post apocalyptic","wasteland","survival settlement"], alt:["废土"], desc:"资源稀缺主导设计，一切以再利用为主。" },
{ id:"WD-08-6", lib:"06", up:"WD-08", path:"世界与资产 › 世界观尺度 › 宇宙与星际尺度", zh:"宇宙与星际尺度", en:"Space Opera", slot:"content",
  kw:["space opera","alien planet","interstellar setting"], alt:["太空"], desc:"尺度极大，需要用比例参照物避免画面失控。" },
{ id:"WD-08-7", lib:"06", up:"WD-08", path:"世界与资产 › 世界观尺度 › 微观与异空间尺度", zh:"微观与异空间尺度", en:"Micro and Pocket Dimension", slot:"content",
  kw:["pocket dimension","micro world","dream logic space"], alt:["异空间"], desc:"尺度规则失效，可打破重力与连续性。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_WORLD2 };
