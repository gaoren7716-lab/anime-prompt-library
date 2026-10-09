// 05 角色与生物库（下）CB-09 ~ CB-10
// 注意：zh / desc / path 必须是纯中文，英文只允许出现在 kw / en / alt。

var LIB_CREATURE3 = [
// ── CB-09 生物与怪物 ──────────────────────────────────
{ id:"CB-09", lib:"05", up:null, path:"角色与生物 › 生物怪物", zh:"生物怪物", en:"Creature and Monster", alt:["怪物"],
  desc:"从真实动物改造而来。先确定原型动物，再叠加变形量，比凭空设计更稳定。" },
{ id:"CB-09-1", lib:"05", up:"CB-09", path:"角色与生物 › 生物怪物 › 写实动物", zh:"写实动物", en:"Realistic Animal", slot:"subject",
  kw:["realistic animal","accurate anatomy","wildlife"], alt:["动物"],
  desc:"按真实解剖绘制，需要确认物种与栖息姿态。" },
{ id:"CB-09-2", lib:"05", up:"CB-09", path:"角色与生物 › 生物怪物 › 拟真野兽", zh:"拟真野兽", en:"Stylized Beast", slot:"subject",
  kw:["stylized beast","fantasy animal","heroic creature"], alt:["奇幻动物"], desc:"保留真实结构但强化体量与威慑感。" },
{ id:"CB-09-3", lib:"05", up:"CB-09", path:"角色与生物 › 生物怪物 › 复合型怪物", zh:"复合型怪物", en:"Chimera", slot:"subject",
  kw:["chimera","composite creature","hybrid beast"], alt:["合成兽"],
  desc:"多个动物部件拼接，接缝处要明确交代，否则读作噪点。" },
{ id:"CB-09-4", lib:"05", up:"CB-09", path:"角色与生物 › 生物怪物 › 巨大生物", zh:"巨大生物", en:"Colossal Creature", slot:"subject",
  kw:["colossal creature","kaiju scale","giant beast"], alt:["巨兽"],
  desc:"靠与建筑、人物的比例差建立体量，细节密度需随距离下降。" },
{ id:"CB-09-5", lib:"05", up:"CB-09", path:"角色与生物 › 生物怪物 › 群体小怪", zh:"群体小怪", en:"Swarm Creature", slot:"subject",
  kw:["small monster swarm","mob enemy","creature crowd"], alt:["小怪群"],
  desc:"单个简化，靠数量与运动轨迹形成威胁感。" },
{ id:"CB-09-6", lib:"05", up:"CB-09", path:"角色与生物 › 生物怪物 › 亡灵类", zh:"亡灵类", en:"Undead", slot:"subject",
  kw:["undead","skeleton","zombie"], alt:["丧尸","骷髅"],
  desc:"以缺损、暴露结构与失色皮肤表现生命状态的反转。" },
{ id:"CB-09-7", lib:"05", up:"CB-09", path:"角色与生物 › 生物怪物 › 植物型生物", zh:"植物型生物", en:"Plant Creature", slot:"subject",
  kw:["plant creature","mandrake","vine monster"], alt:["植物怪"],
  desc:"以茎叶的重复生长逻辑构成体块，缺少对称骨骼。" },

// ── CB-10 机械体与仿生 ────────────────────────────────
{ id:"CB-10", lib:"05", up:null, path:"角色与生物 › 机械仿生", zh:"机械仿生", en:"Mechanical and Synthetic", alt:["机器人"],
  desc:"机械角色的关键是「功能可见」，每个分块都应看起来有作用。" },
{ id:"CB-10-1", lib:"05", up:"CB-10", path:"角色与生物 › 机械仿生 › 人形机器人", zh:"人形机器人", en:"Humanoid Robot", slot:"subject",
  kw:["humanoid robot","android","mech pilot suit"], alt:["机器人"],
  desc:"保持人的体块比例，关节与缝隙是主要辨识点。" },
{ id:"CB-10-2", lib:"05", up:"CB-10", path:"角色与生物 › 机械仿生 › 载具型机械", zh:"载具型机械", en:"Vehicle Mech", slot:"subject",
  kw:["mecha","transforming vehicle","armored walker"], alt:["机甲"],
  desc:"可变形或可乘坐的大型机械，需交代驾驶方式与开口结构。" },
{ id:"CB-10-3", lib:"05", up:"CB-10", path:"角色与生物 › 机械仿生 › 义体改造", zh:"义体改造", en:"Cyborg", slot:"subject",
  kw:["cyborg","prosthetic limb","cybernetic implant"], alt:["改造人"],
  desc:"有机体与机械的混合，交界处的过渡比机械本体更关键。" },
{ id:"CB-10-4", lib:"05", up:"CB-10", path:"角色与生物 › 机械仿生 › 自律机械小体", zh:"自律机械小体", en:"Drone Unit", slot:"subject",
  kw:["drone","small robot unit","autonomous machine"], alt:["无人机"],
  desc:"体积小、无表情，靠运动方式与光点表达状态。" },
{ id:"CB-10-5", lib:"05", up:"CB-10", path:"角色与生物 › 机械仿生 › 仿生假体人偶", zh:"仿生假体人偶", en:"Android Doll", slot:"subject",
  kw:["android doll","porcelain synthetic","marionette body"], alt:["人偶"],
  desc:"接近人但材质非人，恐怖感来自「像而不像」。" },
{ id:"CB-10-6", lib:"05", up:"CB-10", path:"角色与生物 › 机械仿生 › 损伤与老化状态", zh:"损伤与老化状态", en:"Damage and Wear", slot:"subject",
  kw:["battle damage","rusted metal"," cracked plating"], alt:["战损"],
  desc:"划痕、锈迹、缺失零件。给机械加历史的最快方式。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_CREATURE3 };
