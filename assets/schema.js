/* ============================================================
 * schema.js —— 开放式提示词知识库的「元模型」
 *
 * 这个库的目标不是「收录全球所有动漫词条」，而是：
 *   已知内容可检索 · 未收录内容可拆解 · 新需求可通过模块组合与受控变形构建
 *
 * 因此必须先把四类东西分开存，绝不混在一个分类里：
 *   ① 地域 ≠ 风格      地理来源 vs 视觉表现
 *   ② 题材 ≠ 画风      讲什么 vs 长什么样
 *   ③ 作品名 ≠ 技法    检索入口 vs 可观察的制作方式
 *   ④ 模型参数 ≠ 通用提示词  平台语法 vs 与模型无关的创作描述
 *
 * 浏览器 / Node 双用。顶层一律用 var（const 不挂 global object）
 * ============================================================ */

var LIBS = [
  { num:"01", id:"FD", zh:"领域与形式库",     en:"Domain & Forms",           role:"回答「要生成哪种形式」：动画、漫画、插画设定、游戏相关、虚拟角色、互动沉浸、粉丝创作、衍生实体、跨媒介转换" },
  { num:"02", id:"GC", zh:"全球文化与历史库", en:"Global Culture & History", role:"回答「来自什么文化传统与语境」：地域、传统、历史时期、产业语境、流派、跨文化混合" },
  { num:"03", id:"EN", zh:"作品与实体库",     en:"Works & Entities",         role:"回答「参考谁」：作品、系列、角色、创作者、工作室、机构，以及它们之间的归属/版本/创作/叙事/权利关系" },
  { num:"04", id:"VS", zh:"视觉风格库",       en:"Visual Style",             role:"回答「看起来是什么样」：造型、比例、面部、线条、上色、材质、空间、光影、色彩、完成度、时间质感" },
  { num:"05", id:"CB", zh:"角色与生物库",     en:"Characters & Beings",      role:"回答「画谁」：人类、动物、拟人、幻想生物、机械体、群体，含外观原子属性与关系" },
  { num:"06", id:"WA", zh:"世界与资产库",     en:"World & Assets",           role:"回答「在什么里」：世界观、地点、建筑、自然环境、服装、道具、载具、机械、特效" },
  { num:"07", id:"SP", zh:"故事与表演库",     en:"Story & Performance",      role:"回答「发生什么、怎么演」：题材、目标、冲突、情节、关系、对白、表情、肢体、表演" },
  { num:"08", id:"CS", zh:"镜头与时空库",     en:"Camera & Space-time",      role:"回答「怎么看、怎么看时间」：构图、景别、机位、运镜、主体/环境运动、节奏、转场、连续性" },
  { num:"09", id:"AU", zh:"声音与语言库",     en:"Sound & Language",         role:"回答「听什么」：声线、语气、对白、旁白、音乐、音效、环境声、声画关系" },
  { num:"10", id:"PD", zh:"生产与交付库",     en:"Production & Delivery",    role:"回答「交付成什么」：前期、资产、动画制作、后期、成品用途、规格、修订、检查、一致性控制" },
  { num:"11", id:"MX", zh:"组合与变形库",     en:"Composition & Morphing",   role:"回答「怎么变出来」：模块组合规则、属性替换、比例重构、风格重绘、媒介转换、世界观迁移、系列化" },
  { num:"12", id:"RX", zh:"检索与验证库",     en:"Retrieval & Validation",   role:"回答「怎么找到、怎么验证」：别名、翻译、标签关系、模型适配、示例、测试记录、来源与权利" }
];

/* ---------- 组合插槽：一条可执行方案 = 各插槽各取若干模块 ---------- */
/* order 用于自动排序与 GPT 正文的句子顺序 */
var SLOTS = [
  { key:"target",  zh:"生成目标",   en:"Target",      color:"#f472b6", hint:"要产出什么：三视图 / 封面 / 漫画页 / 关键帧 / 概念图…" },
  { key:"medium",  zh:"媒介形式",   en:"Medium",      color:"#22d3ee", hint:"属于哪种形式：动画截帧 / 漫画分格 / 游戏立绘 / 黏土定格…" },
  { key:"subject", zh:"基础对象",   en:"Subject",     color:"#34d399", hint:"画面主体：角色 / 生物 / 建筑 / 载具 / 道具" },
  { key:"content", zh:"内容与情境", en:"Content",     color:"#fbbf24", hint:"讲什么：题材、冲突、时间、天气、事件状态" },
  { key:"style",   zh:"视觉表现",   en:"Visual",      color:"#7c5cff", hint:"长什么样：造型、线条、上色、材质、色彩、光影" },
  { key:"frame",   zh:"画面控制",   en:"Framing",     color:"#60a5fa", hint:"构图、景别、机位、透视、空间表现" },
  { key:"motion",  zh:"动态控制",   en:"Motion",      color:"#fb923c", hint:"主体运动、环境运动、摄影机运动、节奏" },
  { key:"spec",    zh:"输出规格",   en:"Output Spec", color:"#a3e635", hint:"画幅、分辨率、时长、透明背景、分层要求" },
  { key:"limit",   zh:"保留与排除", en:"Constraints", color:"#f87171", hint:"必须保留的辨识特征、必须排除的元素" }
];

/* ---------- 兼容判定：不是所有搭配都有效，必须能标出来 ---------- */
var GRADES = [
  { key:"ok",      zh:"兼容",     en:"compatible",            color:"#34d399", note:"可直接组合使用" },
  { key:"tune",    zh:"需调整",   en:"needs tuning",          color:"#fbbf24", note:"能组合，但要删改若干词，否则画面会打架" },
  { key:"conflict",zh:"不适用",   en:"not applicable",        color:"#f87171", note:"两者互斥，必须二选一" },
  { key:"unknown", zh:"尚未验证", en:"not yet validated",     color:"#94a3b8", note:"框架允许存在，但没有实测结果，标为推测方案" }
];

/* ---------- 证据类型：区分「观察到」和「我以为」 ---------- */
var EVIDENCE = [
  { key:"observed", zh:"观察到的特征", en:"observed",   note:"可从参考作品中实际辨认出的视觉事实" },
  { key:"fact",     zh:"历史事实",     en:"historical", note:"年代、作者、制作方式等可核查的信息" },
  { key:"subject",  zh:"主观描述",     en:"subjective", note:"氛围、感觉类的描述，不假装是客观参数" },
  { key:"bench",    zh:"模型实测结果", en:"benchmark",  note:"在具体模型版本上跑出来的表现，会随版本失效" }
];

/* ---------- 变形强度 ---------- */
var STRENGTHS = [
  { key:"light",   zh:"轻度", en:"light",   note:"只替换表层的材料/配色/笔触，改完仍能一眼认出原作" },
  { key:"medium",  zh:"中度", en:"medium",  note:"改动占到一半，需要明确列出保留项才能守住辨识度" },
  { key:"rebuild", zh:"重构", en:"rebuild", note:"推倒重来式改编，只保留功能与关系，不再追求相似" }
];

/* ---------- 通用条目字段：一条内容不是一段提示词，是一条可复测的记录 ---------- */
var NODE_FIELDS = [
  { g:"基本信息", items:["条目 ID","名称","简介","所属主库","版本","创建时间","更新时间"] },
  { g:"分类标签", items:["来源地域","媒介形式","制作技法","视觉风格","题材","受众","年代"] },
  { g:"生成目标", items:["输出类型","用途","数量","画幅","尺寸","时长"] },
  { g:"固定资产", items:["角色身份","外观特征","服装","标志物","场景与道具设定"] },
  { g:"可变内容", items:["动作","表情","场景变化","时间","天气","镜头"] },
  { g:"画面控制", items:["构图","透视","光影","色彩","材质","线条","上色"] },
  { g:"动态控制", items:["主体运动","环境运动","摄影机运动","节奏","镜头连接"] },
  { g:"文本模块", items:["通用描述","正向提示词","排除项","可替换变量"] },
  { g:"模型适配", items:["模型与版本","自然语言版","标签版","参数","参考图输入"] },
  { g:"示例与测试", items:["示例结果","测试日期","复现条件","已知问题","人工评价"] },
  { g:"参考与权利", items:["来源","参考对象","授权信息","使用限制","待核查标记"] },
  { g:"多语言",   items:["中文名称","英文名称","当地原文","别名","检索词"] }
];

/* ---------- 标签关系：必须分得清，不能混为一谈 ---------- */
var REL_KINDS = [
  { key:"syn",  zh:"同义词", en:"synonym",      note:"叫法不同，指向同一概念" },
  { key:"up",   zh:"上位类", en:"hypernym",     note:"更宽泛的类别" },
  { key:"down", zh:"下位类", en:"hyponym",      note:"更具体的细分类别" },
  { key:"rel",  zh:"相关词", en:"related",      note:"常一起出现，但互不包含" },
  { key:"anti", zh:"反义词", en:"antonym",      note:"方向相反，可用于对照筛选" }
];

/* ---------- 实体关系：把「有哪些名字」升级成「它们怎么连」 ---------- */
var ENTITY_RELS = [
  { key:"belong", zh:"归属", en:"belongs to",   note:"角色属于作品；作品属于系列；资产属于角色或世界" },
  { key:"version",zh:"版本", en:"version of",   note:"同一实体的不同年龄、服装、时期、媒介版本" },
  { key:"credit", zh:"创作", en:"credited to",  note:"创作者或机构参与具体作品，记录职责与时期" },
  { key:"narrative", zh:"叙事", en:"narrative", note:"角色之间的亲属、同伴、对手、组织关系" },
  { key:"visual", zh:"视觉", en:"visual evidence", note:"哪个参考体现了哪些可观察特征" },
  { key:"makeup", zh:"制作", en:"used in",      note:"哪个资产被哪些场景、镜头或章节使用" },
  { key:"morph",  zh:"变体", en:"derived from", note:"哪个新版本由哪个原始版本转换而来" },
  { key:"right",  zh:"权利", en:"rights",       note:"来源、授权、使用限制、待核查状态" }
];

/* ---------- 收录边界：三圈，防止库膨胀成万能词表 ---------- */
var SCOPE = [
  { ring:"核心圈", en:"core",        rule:"全面收录",       desc:"动画、漫画及其创作生产" },
  { ring:"关联圈", en:"adjacent",    rule:"按明确关联收录", desc:"动漫化游戏视觉、角色插画、虚拟角色、绘本、衍生设计、同人创作" },
  { ring:"转换圈", en:"transform",   rule:"只收方法不收领域", desc:"真人照片、现实建筑、产品、传统艺术、其他视觉媒介——只收录「转成动漫」或「从动漫转出」的转换方法" }
];

/* ---------- 扩展维护规则：写进代码，避免以后被稀释 ---------- */
var RULES = [
  "一个内容可以属于多个维度，不强迫它只能进入一个文件夹。",
  "每个标签有稳定 ID，名称和翻译可以更新，ID 不随改名变动。",
  "必须区分同义词、上位类、下位类、相关词，四者不能混为一谈。",
  "必须区分观察到的特征、历史事实、主观描述、模型实测结果。",
  "地域、风格、作品、角色、技法、用途分别存储，不互相代替。",
  "通用创作描述与模型专用语法分别存储，不写死在某个平台上。",
  "新增形式先判断：是新实体、新属性、新组合，还是新变形规则。",
  "找不到完整条目时，返回可组合模块，并标明「组合方案，尚未实测」。",
  "对模型无法可靠完成的任务要明确限制，不把「有提示词」当成「能稳定生成」。",
  "敏感文化元素、既有角色与参考作品必须保留来源与使用边界。"
];

/* 浏览器与 vm 环境没有模块化，必须显式挂一个全局对象，
   否则 engine.js 取不到 LIBS / SLOTS（const 在 vm 里不会挂到全局）。 */
var SCHEMA = { LIBS: LIBS, SLOTS: SLOTS, GRADES: GRADES, EVIDENCE: EVIDENCE,
               STRENGTHS: STRENGTHS, NODE_FIELDS: NODE_FIELDS, REL_KINDS: REL_KINDS,
               ENTITY_RELS: ENTITY_RELS, SCOPE: SCOPE, RULES: RULES };

if (typeof module !== "undefined" && module.exports) {
  module.exports = SCHEMA;
}
