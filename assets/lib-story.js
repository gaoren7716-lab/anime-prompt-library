// 07 故事与表演库
// 节点约定：{ id, lib, up, path, zh, en, kw, alt, desc, slot }
// 本库处理「画面在讲什么、怎么讲」，与画风完全分离。
// 注意：zh / desc / path 必须是纯中文，英文只允许出现在 kw / en / alt。

var LIB_STORY = [
// ── SN-01 叙事层级 ────────────────────────────────────
{ id:"SN-01", lib:"07", up:null, path:"故事与表演 › 叙事层级", zh:"叙事层级", en:"Narrative Layer", alt:["叙事"],
  desc:"先决定这张图承担哪一层叙事任务，再决定放多少信息。" },
{ id:"SN-01-1", lib:"07", up:"SN-01", path:"故事与表演 › 叙事层级 › 单幅定格", zh:"单幅定格", en:"Single Frame", slot:"content",
  kw:["single frame","decisive moment","one shot story"], alt:["单张"], desc:"一张图讲完一件事，必须有明确的时间点。" },
{ id:"SN-01-2", lib:"07", up:"SN-01", path:"故事与表演 › 叙事层级 › 序列分镜", zh:"序列分镜", en:"Sequence", slot:"content",
  kw:["storyboard sequence","shot breakdown","panel flow"], alt:["分镜"], desc:"多张连续，靠视线方向与动作延续串联。" },
{ id:"SN-01-3", lib:"07", up:"SN-01", path:"故事与表演 › 叙事层级 › 设定说明式", zh:"设定说明式", en:"Expository", slot:"content",
  kw:["expository illustration","layout sheet","spec sheet"], alt:["设定图"], desc:"信息优先于情绪，可读性压过美感。" },
{ id:"SN-01-4", lib:"07", up:"SN-01", path:"故事与表演 › 叙事层级 › 氛围无事件", zh:"氛围无事件", en:"Ambient", slot:"content",
  kw:["ambient scene","no event","quiet moment"], alt:["空气感"], desc:"刻意不安排冲突，让空间与光线成为主角。" },
{ id:"SN-01-5", lib:"07", up:"SN-01", path:"故事与表演 › 叙事层级 › 前后对比叙事", zh:"前后对比叙事", en:"Before and After", slot:"content",
  kw:["before after","transformation pair","parallel composition"], alt:["对比"], desc:"两幅并列，差异本身就是叙事。" },

// ── SN-02 表演 ────────────────────────────────────────
{ id:"SN-02", lib:"07", up:null, path:"故事与表演 › 表演", zh:"表演", en:"Performance", alt:["演技"],
  desc:"画风决定怎么画，表演决定角色在做什么。两者正交。" },
{ id:"SN-02-1", lib:"07", up:"SN-02", path:"故事与表演 › 表演 › 克制表演", zh:"克制表演", en:"Understated", slot:"content",
  kw:["subtle acting","restrained emotion","quiet gesture"], alt:["内敛"], desc:"情绪藏在细节里，靠观众补全。" },
{ id:"SN-02-2", lib:"07", up:"SN-02", path:"故事与表演 › 表演 › 夸张演出", zh:"夸张演出", en:"Exaggerated", slot:"content",
  kw:["exaggerated acting","theatrical pose","comic timing"], alt:["夸张"], desc:"形变、拖影、符号化特效齐上，喜剧与热血常见。" },
{ id:"SN-02-3", lib:"07", up:"SN-02", path:"故事与表演 › 表演 › 动作演技", zh:"动作演技", en:"Physical Acting", slot:"content",
  kw:["action pose","dynamic motion","impact frame"], alt:["打戏"], desc:"以整个身体参与表达，剪影清晰度优先。" },
{ id:"SN-02-4", lib:"07", up:"SN-02", path:"故事与表演 › 表演 › 对话与反应", zh:"对话与反应", en:"Reaction", slot:"content",
  kw:["reaction shot","listening pose","turn toward"], alt:["反应镜头"], desc:"听比说更难画，重点在微表情与偏移。" },
{ id:"SN-02-5", lib:"07", up:"SN-02", path:"故事与表演 › 表演 › 疲惫与松弛", zh:"疲惫与松弛", en:"Weary", slot:"content",
  kw:["weary pose","slumped","exhausted"], alt:["慵懒"], desc:"重力显现，肌肉失去张力，是最容易被忽略的表演。" },

// ── SN-03 人物关系 ────────────────────────────────────
{ id:"SN-03", lib:"07", up:null, path:"故事与表演 › 人物关系", zh:"人物关系", en:"Character Relation", alt:["互动"],
  desc:"两个人以上的画面，关系是靠距离、朝向与遮挡写出来的。" },
{ id:"SN-03-1", lib:"07", up:"SN-03", path:"故事与表演 › 人物关系 › 对峙", zh:"对峙", en:"Confrontation", slot:"content",
  kw:["standoff","opposing stance","two shot tension"], alt:["对立"], desc:"中轴线分割，双方体量与视线对撞。" },
{ id:"SN-03-2", lib:"07", up:"SN-03", path:"故事与表演 › 人物关系 › 协作", zh:"协作", en:"Cooperation", slot:"content",
  kw:["teamwork pose","shoulder to shoulder","synchronized action"], alt:["并肩"], desc:"朝向一致、动作互补，形成整体剪影。" },
{ id:"SN-03-3", lib:"07", up:"SN-03", path:"故事与表演 › 人物关系 › 亲密", zh:"亲密", en:"Intimacy", slot:"content",
  kw:["intimate moment","close proximity","tender gesture"], alt:["亲近"], desc:"距离打破社交线，肢体接触面积大。" },
{ id:"SN-03-4", lib:"07", up:"SN-03", path:"故事与表演 › 人物关系 › 保护与照拂", zh:"保护与照拂", en:"Protection", slot:"content",
  kw:["protective stance","carrying","shielding gesture"], alt:["守护"], desc:"一方在前构成屏障，另一方处于被遮蔽位。" },
{ id:"SN-03-5", lib:"07", up:"SN-03", path:"故事与表演 › 人物关系 › 疏离与独处", zh:"疏离与独处", en:"Alienation", slot:"content",
  kw:["isolation","distance between figures","solitary figure"], alt:["孤独"], desc:"用环境与画幅制造留白，把人推到边缘。" },

// ── SN-04 情绪基调 ────────────────────────────────────
{ id:"SN-04", lib:"07", up:null, path:"故事与表演 › 情绪基调", zh:"情绪基调", en:"Mood", alt:["氛围"],
  desc:"基调是全片统一的情绪底色。混用基调会让画面互相抵消。" },
{ id:"SN-04-1", lib:"07", up:"SN-04", path:"故事与表演 › 情绪基调 › 温暖治愈", zh:"温暖治愈", en:"Warm Healing", slot:"content",
  kw:["warm healing mood","cozy atmosphere","gentle light"], alt:["治愈"], desc:"柔和光、低冲突、生活细节密集。" },
{ id:"SN-04-2", lib:"07", up:"SN-04", path:"故事与表演 › 情绪基调 › 紧张压迫", zh:"紧张压迫", en:"Tension", slot:"content",
  kw:["tense atmosphere","looming threat","high contrast dread"], alt:["悬疑"], desc:"暗部占比高，光源少且冷。" },
{ id:"SN-04-3", lib:"07", up:"SN-04", path:"故事与表演 › 情绪基调 › 悲怆壮烈", zh:"悲怆壮烈", en:"Tragic Grandeur", slot:"content",
  kw:["tragic mood","heroic sacrifice","epic scale"], alt:["悲壮"], desc:"大尺度场景 + 微小人物，制造不可逆感。" },
{ id:"SN-04-4", lib:"07", up:"SN-04", path:"故事与表演 › 情绪基调 › 诙谐荒诞", zh:"诙谐荒诞", en:"Comic Absurd", slot:"content",
  kw:["comic mood","absurd humor","slapstick"], alt:["搞笑"], desc:"比例失真与逻辑错位是主要手段。" },
{ id:"SN-04-5", lib:"07", up:"SN-04", path:"故事与表演 › 情绪基调 › 静谧物哀", zh:"静谧物哀", en:"Quiet Melancholy", slot:"content",
  kw:["melancholic calm","mono no aware","fading beauty"], alt:["物哀"], desc:"以衰败与流逝为主题，情绪克制不爆发。" },
{ id:"SN-04-6", lib:"07", up:"SN-04", path:"故事与表演 › 情绪基调 › 崇高与敬畏", zh:"崇高与敬畏", en:"Sublime", slot:"content",
  kw:["sublime awe","vast scale wonder","sacred silence"], alt:["宏大"], desc:"体量碾压个体，观者产生敬畏而非恐惧。" },

// ── SN-05 叙事符号 ────────────────────────────────────
{ id:"SN-05", lib:"07", up:null, path:"故事与表演 › 叙事符号", zh:"叙事符号", en:"Visual Motif", alt:["意象"],
  desc:"重复出现的视觉元素，用来在不动声色间建立主题。" },
{ id:"SN-05-1", lib:"07", up:"SN-05", path:"故事与表演 › 叙事符号 › 植物意象", zh:"植物意象", en:"Botanical Motif", slot:"content",
  kw:["flower symbolism","cherry blossom","wilting plant"], alt:["花"], desc:"以花期与枯荣映射时间与生命。" },
{ id:"SN-05-2", lib:"07", up:"SN-05", path:"故事与表演 › 叙事符号 › 气候意象", zh:"气候意象", en:"Weather Motif", slot:"content",
  kw:["rain as motif","snow symbolism","wind motif"], alt:["雨意象"], desc:"天气承担情绪外化功能。" },
{ id:"SN-05-3", lib:"07", up:"SN-05", path:"故事与表演 › 叙事符号 › 物件意象", zh:"物件意象", en:"Object Motif", slot:"content",
  kw:["keepsake object","broken item","recurring prop"], alt:["信物"], desc:"一件反复出现的小物串联全部情感线。" },
{ id:"SN-05-4", lib:"07", up:"SN-05", path:"故事与表演 › 叙事符号 › 色彩意象", zh:"色彩意象", en:"Color Motif", slot:"style",
  kw:["color symbolism","recurring hue","accent color"], alt:["色彩"], desc:"固定某颜色给某角色或概念，形成条件反射。" },
{ id:"SN-05-5", lib:"07", up:"SN-05", path:"故事与表演 › 叙事符号 › 构图重复", zh:"构图重复", en:"Repetition Motif", slot:"content",
  kw:["repeated framing","echoed composition","rhythmic shapes"], alt:["重复"], desc:"同一构图反复出现，形成视觉节奏。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_STORY };
