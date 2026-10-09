// 11 组合与变形库
// 节点约定：{ id, lib, up, path, zh, en, kw, alt, desc, slot }
// 本库是「操作层」：已知内容可检索，未收录内容可拆解，新需求可通过模块组合与受控变形构建。
// 注意：zh / desc / path 必须是纯中文，英文只允许出现在 kw / en / alt。

var LIB_MORPH = [
// ── MX-01 槽位装配 ────────────────────────────────────
{ id:"MX-01", lib:"11", up:null, path:"组合与变形 › 槽位装配", zh:"槽位装配", en:"Slot Assembly", alt:["组合","装配"],
  desc:"任何提示词都由九个槽位装配而成。缺哪个槽，就从哪个库补。" },
{ id:"MX-01-1", lib:"11", up:"MX-01", path:"组合与变形 › 槽位装配 › 目标槽", zh:"目标槽", en:"Slot Target", slot:"target",
  kw:["purpose slot","deliverable intent"], alt:["目标"], desc:"这张图是干什么用的。来自 10 库。" },
{ id:"MX-01-2", lib:"11", up:"MX-01", path:"组合与变形 › 槽位装配 › 媒介槽", zh:"媒介槽", en:"Slot Medium", slot:"medium",
  kw:["medium slot","production technique"], alt:["媒介"], desc:"用什么手段实现：动画、漫画、三维、实拍混合等。" },
{ id:"MX-01-3", lib:"11", up:"MX-01", path:"组合与变形 › 槽位装配 › 主体槽", zh:"主体槽", en:"Slot Subject", slot:"subject",
  kw:["subject slot","who is in frame"], alt:["主体"], desc:"画面主角是谁。来自 05 库。" },
{ id:"MX-01-4", lib:"11", up:"MX-01", path:"组合与变形 › 槽位装配 › 内容槽", zh:"内容槽", en:"Slot Content", slot:"content",
  kw:["content slot","action and setting"], alt:["内容"], desc:"在做什么、在哪里。来自 06 与 07 库。" },
{ id:"MX-01-5", lib:"11", up:"MX-01", path:"组合与变形 › 槽位装配 › 风格槽", zh:"风格槽", en:"Slot Style", slot:"style",
  kw:["style slot","visual treatment"], alt:["风格"], desc:"怎么画。来自 04 库，注意不要塞入地域标签。" },
{ id:"MX-01-6", lib:"11", up:"MX-01", path:"组合与变形 › 槽位装配 › 画面槽", zh:"画面槽", en:"Slot Frame", slot:"frame",
  kw:["frame slot","shot size and angle"], alt:["画面"], desc:"取景与构图。来自 08 库。" },
{ id:"MX-01-7", lib:"11", up:"MX-01", path:"组合与变形 › 槽位装配 › 动态槽", zh:"动态槽", en:"Slot Motion", slot:"motion",
  kw:["motion slot","time expression"], alt:["动态"], desc:"时间与运动状态。来自 08 库。" },
{ id:"MX-01-8", lib:"11", up:"MX-01", path:"组合与变形 › 槽位装配 › 规格槽", zh:"规格槽", en:"Slot Spec", slot:"spec",
  kw:["spec slot","aspect ratio and detail"], alt:["规格"], desc:"比例、精度、批量要求。来自 10 库。" },
{ id:"MX-01-9", lib:"11", up:"MX-01", path:"组合与变形 › 槽位装配 › 约束槽", zh:"约束槽", en:"Slot Limit", slot:"limit",
  kw:["limit slot","negative constraints"], alt:["约束"], desc:"禁止什么。来自 10 库。" },

// ── MX-02 兼容评级 ────────────────────────────────────
{ id:"MX-02", lib:"11", up:null, path:"组合与变形 › 兼容评级", zh:"兼容评级", en:"Compatibility Grade", alt:["评级"],
  desc:"组合不是随便配。每次装配都给出评级，用户才知道要不要改。" },
{ id:"MX-02-1", lib:"11", up:"MX-02", path:"组合与变形 › 兼容评级 › 可直接出图", zh:"可直接出图", en:"Grade Ok", slot:"target",
  kw:["grade ok","safe combination"], alt:["可用"], desc:"全部槽位语义一致，无已知冲突。" },
{ id:"MX-02-2", lib:"11", up:"MX-02", path:"组合与变形 › 兼容评级 › 需要微调", zh:"需要微调", en:"Grade Tune", slot:"target",
  kw:["grade tune","needs adjustment"], alt:["待调"], desc:"有轻微张力，调整措辞或顺序即可。" },
{ id:"MX-02-3", lib:"11", up:"MX-02", path:"组合与变形 › 兼容评级 › 存在冲突", zh:"存在冲突", en:"Grade Conflict", slot:"target",
  kw:["grade conflict","contradictory elements"], alt:["冲突"], desc:"语义互斥，必须删掉一方。" },
{ id:"MX-02-4", lib:"11", up:"MX-02", path:"组合与变形 › 兼容评级 › 证据不足", zh:"证据不足", en:"Grade Unknown", slot:"target",
  kw:["grade unknown","unverified combination"], alt:["未知"], desc:"从未实测，标注为尚未验证，先小批量试。" },

// ── MX-03 变形操作 ────────────────────────────────────
{ id:"MX-03", lib:"11", up:null, path:"组合与变形 › 变形操作", zh:"变形操作", en:"Morph Operation", alt:["变形"],
  desc:"变形必须写明保留项与变化项。只说「改成某种风格」是不可执行指令。" },
{ id:"MX-03-1", lib:"11", up:"MX-03", path:"组合与变形 › 变形操作 › 风格迁移", zh:"风格迁移", en:"Style Transfer", slot:"target",
  kw:["style transfer","restyle same content"], alt:["换风格"], desc:"保留主体与构图，只换风格槽。" },
{ id:"MX-03-2", lib:"11", up:"MX-03", path:"组合与变形 › 变形操作 › 媒介迁移", zh:"媒介迁移", en:"Medium Shift", slot:"medium",
  kw:["medium shift","translate medium"], alt:["换媒介"], desc:"二维转三维、插画转动画截帧等跨媒介改写。" },
{ id:"MX-03-3", lib:"11", up:"MX-03", path:"组合与变形 › 变形操作 › 年龄与状态迁移", zh:"年龄与状态迁移", en:"State Shift", slot:"subject",
  kw:["age shift","damage state","seasonal variant"], alt:["改状态"], desc:"同一角色的不同时间点或不同版本。" },
{ id:"MX-03-4", lib:"11", up:"MX-03", path:"组合与变形 › 变形操作 › 世界观迁移", zh:"世界观迁移", en:"World Shift", slot:"content",
  kw:["reimagine in another setting","genre shift"], alt:["改设定"], desc:"保留角色内核，替换环境与制度。" },
{ id:"MX-03-5", lib:"11", up:"MX-03", path:"组合与变形 › 变形操作 › 局部替换", zh:"局部替换", en:"Local Replace", slot:"content",
  kw:["swap prop","change costume element"], alt:["换配件"], desc:"只动一个模块，其余全部锁死。" },
{ id:"MX-03-6", lib:"11", up:"MX-03", path:"组合与变形 › 变形操作 › 叠加混搭", zh:"叠加混搭", en:"Hybrid Blend", slot:"target",
  kw:["hybrid blend","mix two sources","crossover"], alt:["混搭"], desc:"两套模块按比例融合，需明确主导方。" },

// ── MX-04 强度分级 ────────────────────────────────────
{ id:"MX-04", lib:"11", up:null, path:"组合与变形 › 强度分级", zh:"强度分级", en:"Morph Strength", alt:["强度"],
  desc:"强度描述「改多少」，与「改成什么」是两个独立变量。" },
{ id:"MX-04-1", lib:"11", up:"MX-04", path:"组合与变形 › 强度分级 › 轻度", zh:"轻度", en:"Light", slot:"target",
  kw:["light change","subtle shift"," barely altered"], alt:["微改"], desc:"一眼能认出原型，只动表层。" },
{ id:"MX-04-2", lib:"11", up:"MX-04", path:"组合与变形 › 强度分级 › 中度", zh:"中度", en:"Medium", slot:"target",
  kw:["moderate restyle","balanced reinterpretation"], alt:["中等"], desc:"保留识别特征，整体语言已换。" },
{ id:"MX-04-3", lib:"11", up:"MX-04", path:"组合与变形 › 强度分级 › 重构", zh:"重构", en:"Rebuild", slot:"target",
  kw:["complete rebuild","reimagined concept"], alt:["重做"], desc:"只保留名字与概念，视觉全部重做。" },

// ── MX-05 冲突与消解 ──────────────────────────────────
{ id:"MX-05", lib:"11", up:null, path:"组合与变形 › 冲突消解", zh:"冲突消解", en:"Conflict Resolution", alt:["冲突处理"],
  desc:"发现冲突时按固定顺序处理，避免凭感觉乱删。" },
{ id:"MX-05-1", lib:"11", up:"MX-05", path:"组合与变形 › 冲突消解 › 优先级法则", zh:"优先级法则", en:"Priority Rule", slot:"target",
  kw:["priority order","resolve by slot order"], alt:["优先级"],
  desc:"目标优先于规格，规格优先于风格，风格优先于装饰。" },
{ id:"MX-05-2", lib:"11", up:"MX-05", path:"组合与变形 › 冲突消解 › 降级处理", zh:"降级处理", en:"Downgrade", slot:"target",
  kw:["downgrade to subtle","soften conflicting element"], alt:["弱化"], desc:"不删除冲突项，而是把它降为次要位置。" },
{ id:"MX-05-3", lib:"11", up:"MX-05", path:"组合与变形 › 冲突消解 › 拆分多次生成", zh:"拆分多次生成", en:"Split Run", slot:"target",
  kw:["split into parts","multi stage generation"], alt:["分步"], desc:"无法同存的，拆成两张分别生成再合成。" },
{ id:"MX-05-4", lib:"11", up:"MX-05", path:"组合与变形 › 冲突消解 › 已知限制登记", zh:"已知限制登记", en:"Known Limitation", slot:"limit",
  kw:["known limitation","documented failure mode"], alt:["限制"], desc:"踩过的坑要写回记录，不能只在口头。" },

// ── MX-06 组合模板 ────────────────────────────────────
{ id:"MX-06", lib:"11", up:null, path:"组合与变形 › 组合模板", zh:"组合模板", en:"Recipe Template", alt:["模板","配方"],
  desc:"常用组合固化成模板，可直接填入方块，也可以再拆开改。" },
{ id:"MX-06-1", lib:"11", up:"MX-06", path:"组合与变形 › 组合模板 › 角色立绘模板", zh:"角色立绘模板", en:"Character Recipe", slot:"target",
  kw:["character portrait recipe","single figure template"], alt:["立绘"], desc:"主体加服装加表情加半身景别的固定组合。" },
{ id:"MX-06-2", lib:"11", up:"MX-06", path:"组合与变形 › 组合模板 › 场景概念模板", zh:"场景概念模板", en:"Environment Recipe", slot:"target",
  kw:["environment concept recipe","setting design template"], alt:["场景"], desc:"地形加建筑加气候加时间加广角的组合。" },
{ id:"MX-06-3", lib:"11", up:"MX-06", path:"组合与变形 › 组合模板 › 叙事单格模板", zh:"叙事单格模板", en:"Narrative Recipe", slot:"target",
  kw:["single panel story recipe","storytelling frame"], alt:["叙事格"], desc:"关系加表演加构图加留白的组合。" },
{ id:"MX-06-4", lib:"11", up:"MX-06", path:"组合与变形 › 组合模板 › 设定三视图模板", zh:"设定三视图模板", en:"Turnaround Recipe", slot:"target",
  kw:["turnaround recipe","three view template"], alt:["三视图"], desc:"正面侧面背面加同一风格槽强制一致。" },
{ id:"MX-06-5", lib:"11", up:"MX-06", path:"组合与变形 › 组合模板 › 物料海报模板", zh:"物料海报模板", en:"Poster Recipe", slot:"target",
  kw:["poster recipe","key visual layout"], alt:["海报"], desc:"竖幅加主体居中加留白版式加高精度。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_MORPH };
