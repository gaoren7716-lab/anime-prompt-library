// 05 角色与生物库（上）CB-01 ~ CB-05
// 节点约定：{ id, lib, up, path, zh, en, kw, alt, desc, slot }
// slot = "subject" 表示可作为「主体」槽位参与组合；容器节点不带 slot。
// 注意：zh / desc / path 必须是纯中文，英文只允许出现在 kw / en / alt。

var LIB_CREATURE = [
// ── CB-01 角色类型与身份 ──────────────────────────────
{ id:"CB-01", lib:"05", up:null, path:"角色与生物 › 身份原型", zh:"身份原型", en:"Character Archetype", alt:["角色原型","人物原型"],
  desc:"按叙事功能区分的角色类型。与画风无关，同一原型可用任何风格绘制。" },
{ id:"CB-01-1", lib:"05", up:"CB-01", path:"角色与生物 › 身份原型 › 主人公", zh:"主人公", en:"Protagonist", slot:"subject",
  kw:["protagonist","main character","lead"], alt:["主角"], desc:"叙事视点的承担者，观众认同的第一落点。" },
{ id:"CB-01-2", lib:"05", up:"CB-01", path:"角色与生物 › 身份原型 › 对手", zh:"对手", en:"Antagonist", slot:"subject",
  kw:["antagonist","rival","villain"], alt:["反派","敌人"], desc:"与主人公目标对立的力量化身，可以是人、组织或抽象存在。" },
{ id:"CB-01-3", lib:"05", up:"CB-01", path:"角色与生物 › 身份原型 › 伙伴", zh:"伙伴", en:"Companion", slot:"subject",
  kw:["companion","sidekick","supporting friend"], alt:["配角同伴"], desc:"陪伴主人公行动，承担补足与对照。" },
{ id:"CB-01-4", lib:"05", up:"CB-01", path:"角色与生物 › 身份原型 › 引路人", zh:"引路人", en:"Mentor", slot:"subject",
  kw:["mentor","guide figure","old master"], alt:["导师"], desc:"传递知识或规则，常以年龄与器物标识。" },
{ id:"CB-01-5", lib:"05", up:"CB-01", path:"角色与生物 › 身份原型 › 群像角色", zh:"群像角色", en:"Ensemble Cast", slot:"subject",
  kw:["ensemble cast","group of characters"], alt:["群像"], desc:"多人并列，无单一中心，靠差异互相定义。" },
{ id:"CB-01-6", lib:"05", up:"CB-01", path:"角色与生物 › 身份原型 › 吉祥物型角色", zh:"吉祥物型角色", en:"Mascot Character", slot:"subject",
  kw:["mascot character","chibi companion","cute side creature"], alt:["吉祥物","看板娘"], desc:"为识别度而存在的小型角色，比例夸张，便于衍生。" },

// ── CB-02 体型与体格 ──────────────────────────────────
{ id:"CB-02", lib:"05", up:null, path:"角色与生物 › 体型体格", zh:"体型体格", en:"Body Build", alt:["体格"],
  desc:"骨架与肌肉的量感差异。是造型的基础变量，决定剪影可读性。" },
{ id:"CB-02-1", lib:"05", up:"CB-02", path:"角色与生物 › 体型体格 › 纤细", zh:"纤细", en:"Slender", slot:"subject",
  kw:["slender build","thin frame","delicate figure"], alt:["瘦弱"], desc:"骨点与关节清晰，脂肪和肌肉都少。" },
{ id:"CB-02-2", lib:"05", up:"CB-02", path:"角色与生物 › 体型体格 › 匀称", zh:"匀称", en:"Athletic", slot:"subject",
  kw:["athletic build","balanced proportions","toned"], alt:["标准体格"], desc:"肌肉与体脂比例适中，动作适应面最广。" },
{ id:"CB-02-3", lib:"05", up:"CB-02", path:"角色与生物 › 体型体格 › 壮硕", zh:"壮硕", en:"Muscular", slot:"subject",
  kw:["muscular build","heavy frame","broad shoulders"], alt:["肌肉型"], desc:"肩背厚实，体块转折明显，剪影沉重。" },
{ id:"CB-02-4", lib:"05", up:"CB-02", path:"角色与生物 › 体型体格 › 圆润", zh:"圆润", en:"Chubby", slot:"subject",
  kw:["chubby","round build","soft body"], alt:["丰满"], desc:"轮廓以弧线为主，缺乏硬转折。" },
{ id:"CB-02-5", lib:"05", up:"CB-02", path:"角色与生物 › 体型体格 › 高大", zh:"高大", en:"Tall", slot:"subject",
  kw:["tall figure","long limbs","imposing height"], alt:["高个子"], desc:"四肢修长，在群体构图里天然成为高点。" },
{ id:"CB-02-6", lib:"05", up:"CB-02", path:"角色与生物 › 体型体格 › 矮小", zh:"矮小", en:"Petite", slot:"subject",
  kw:["petite figure","short stature","small build"], alt:["娇小"], desc:"体积小，常借道具或构图补偿存在感。" },

// ── CB-03 年龄阶段 ────────────────────────────────────
{ id:"CB-03", lib:"05", up:null, path:"角色与生物 › 年龄阶段", zh:"年龄阶段", en:"Age Stage", alt:["年龄段"],
  desc:"年龄改变的是头身比、皮肤状态与姿态习惯，不只是数字。" },
{ id:"CB-03-1", lib:"05", up:"CB-03", path:"角色与生物 › 年龄阶段 › 幼童", zh:"幼童", en:"Toddler", slot:"subject",
  kw:["toddler","small child","round face baby"], alt:["幼儿"], desc:"头大身短，重心不稳，动作幅度夸张。" },
{ id:"CB-03-2", lib:"05", up:"CB-03", path:"角色与生物 › 年龄阶段 › 少年", zh:"少年", en:"Teen", slot:"subject",
  kw:["teenager","adolescent","school age"], alt:["青少年"], desc:"处于生长期，四肢略显不协调，服装常带校服或便服混搭。" },
{ id:"CB-03-3", lib:"05", up:"CB-03", path:"角色与生物 › 年龄阶段 › 青年", zh:"青年", en:"Young Adult", slot:"subject",
  kw:["young adult","twenties figure"], alt:["成年"], desc:"身体发育完成，是多数商业作品的默认年龄。" },
{ id:"CB-03-4", lib:"05", up:"CB-03", path:"角色与生物 › 年龄阶段 › 中年", zh:"中年", en:"Middle-aged", slot:"subject",
  kw:["middle aged","mature adult","lined face"], alt:["中老年"], desc:"面部出现结构纹，体态开始下垂或发福。" },
{ id:"CB-03-5", lib:"05", up:"CB-03", path:"角色与生物 › 年龄阶段 › 高龄", zh:"高龄", en:"Elderly", slot:"subject",
  kw:["elderly","aged figure","stooped posture"], alt:["老人"], desc:"身高缩短、脊柱弯曲，皮肤松弛有老年斑。" },

// ── CB-04 头部与毛发 ──────────────────────────────────
{ id:"CB-04", lib:"05", up:null, path:"角色与生物 › 头部与毛发", zh:"头部与毛发", en:"Head and Hair", alt:["发型"],
  desc:"辨识度的主要来源。发型的体块分区比发丝数量更能决定识别度。" },
{ id:"CB-04-1", lib:"05", up:"CB-04", path:"角色与生物 › 头部与毛发 › 短发", zh:"短发", en:"Short Hair", slot:"subject",
  kw:["short hair","cropped hair","boyish cut"], alt:["短发类中"], desc:"露出颈部与耳朵轮廓，头部形状清晰。" },
{ id:"CB-04-2", lib:"05", up:"CB-04", path:"角色与生物 › 头部与毛发 › 长直发", zh:"长直发", en:"Long Straight Hair", slot:"subject",
  kw:["long straight hair","flowing hair","silky locks"], alt:["长直"], desc:"发束成片下垂，适合表现风与重力。" },
{ id:"CB-04-3", lib:"05", up:"CB-04", path:"角色与生物 › 头部与毛发 › 卷发", zh:"卷发", en:"Curly Hair", slot:"subject",
  kw:["curly hair","wavy hair","ringlets"], alt:["波浪卷"], desc:"以重复弧线构成体块，外轮廓蓬松。" },
{ id:"CB-04-4", lib:"05", up:"CB-04", path:"角色与生物 › 头部与毛发 › 束发", zh:"束发", en:"Tied Hair", slot:"subject",
  kw:["ponytail","braided hair","bun hair"], alt:["马尾","辫子"], desc:"扎起部分留束尾，动势集中在尾端。" },
{ id:"CB-04-5", lib:"05", up:"CB-04", path:"角色与生物 › 头部与毛发 › 光头与特殊覆盖", zh:"光头与特殊覆盖", en:"Bald and Covered", slot:"subject",
  kw:["bald head","shaved head","hooded head"], alt:["光头","兜帽"], desc:"去除头发或以布料、头盔、羽毛等替代。" },
{ id:"CB-04-6", lib:"05", up:"CB-04", path:"角色与生物 › 头部与毛发 › 毛发质感", zh:"毛发质感", en:"Hair Texture", slot:"subject",
  kw:["hair strands","fur texture","glossy highlight"], alt:["毛发"],
  desc:"描写光泽、分缕与绒感。动物角色与毛茸茸造型的核心变量。" },

// ── CB-05 表情与眼神 ──────────────────────────────────
{ id:"CB-05", lib:"05", up:null, path:"角色与生物 › 表情情绪", zh:"表情情绪", en:"Expression", alt:["表情"],
  desc:"面部是可读的情绪界面。眉眼嘴三处的位移决定情绪指向。" },
{ id:"CB-05-1", lib:"05", up:"CB-05", path:"角色与生物 › 表情情绪 › 平静", zh:"平静", en:"Calm", slot:"subject",
  kw:["calm expression","neutral face","relaxed"], alt:["面无表情"], desc:"基准状态，五官对称放松。" },
{ id:"CB-05-2", lib:"05", up:"CB-05", path:"角色与生物 › 表情情绪 › 喜悦", zh:"喜悦", en:"Joy", slot:"subject",
  kw:["smiling","joyful expression","bright eyes"], alt:["笑"], desc:"眼尾下弯或眯起，口角上扬。" },
{ id:"CB-05-3", lib:"05", up:"CB-05", path:"角色与生物 › 表情情绪 › 愤怒", zh:"愤怒", en:"Anger", slot:"subject",
  kw:["angry expression","furrowed brows","gritted teeth"], alt:["生气"], desc:"眉毛内压，嘴角下沉，常配面部阴影。" },
{ id:"CB-05-4", lib:"05", up:"CB-05", path:"角色与生物 › 表情情绪 › 悲伤", zh:"悲伤", en:"Sadness", slot:"subject",
  kw:["sad expression","teary eyes","downcast eyes"], alt:["难过"], desc:"眉梢下垂，视线低垂，可能带泪。" },
{ id:"CB-05-5", lib:"05", up:"CB-05", path:"角色与生物 › 表情情绪 › 惊讶", zh:"惊讶", en:"Surprise", slot:"subject",
  kw:["surprised face","wide eyes","open mouth"], alt:["震惊"], desc:"眼与口同时张开，眉上抬。" },
{ id:"CB-05-6", lib:"05", up:"CB-05", path:"角色与生物 › 表情情绪 › 恐惧", zh:"恐惧", en:"Fear", slot:"subject",
  kw:["fearful expression","trembling","pale face"], alt:["害怕"], desc:"瞳孔缩小，面部失血色，肌肉僵硬。" },
{ id:"CB-05-7", lib:"05", up:"CB-05", path:"角色与生物 › 表情情绪 › 轻蔑与复杂情绪", zh:"轻蔑与复杂情绪", en:"Contempt and Mixed Emotion", slot:"subject",
  kw:["smirk","side glance","ambivalent expression"], alt:["冷笑","阴沉"],
  desc:"情绪混合，靠眼神偏移与单侧嘴角表达，比单一情绪更耐读。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_CREATURE };
