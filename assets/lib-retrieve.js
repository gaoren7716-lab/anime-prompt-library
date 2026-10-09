// 12 检索与验证库
// 节点约定：{ id, lib, up, path, zh, en, kw, alt, desc, slot }
// 检索的目标不是「找到一根现成提示词」，而是「找到可使用的知识单元」。
// 注意：zh / desc / path 必须是纯中文，英文只允许出现在 kw / en / alt。

var LIB_RETRIEVE = [
// ── RX-01 检索入口 ────────────────────────────────────
{ id:"RX-01", lib:"12", up:null, path:"检索与验证 › 检索入口", zh:"检索入口", en:"Retrieval Entry", alt:["检索"],
  desc:"六种入口互为备份。找不到往往不是没有，是入口选错了。" },
{ id:"RX-01-1", lib:"12", up:"RX-01", path:"检索与验证 › 检索入口 › 名称检索", zh:"名称检索", en:"Name Lookup", slot:"target",
  kw:["exact name lookup","title search"], alt:["指名检索"],
  desc:"用作品名、工作室名、流派名精确命中。作品名是入口，不是技法。" },
{ id:"RX-01-2", lib:"12", up:"RX-01", path:"检索与验证 › 检索入口 › 别名检索", zh:"别名检索", en:"Alias Lookup", slot:"target",
  kw:["alias search","alternative name"], alt:["别称"], desc:"处理译名分歧、简称与常见误写。" },
{ id:"RX-01-3", lib:"12", up:"RX-01", path:"检索与验证 › 检索入口 › 跨语言检索", zh:"跨语言检索", en:"Cross-language Lookup", slot:"target",
  kw:["cross language search","translation mapping"], alt:["翻译检索"], desc:"中文、日文、英文指同一对象时应互达。" },
{ id:"RX-01-4", lib:"12", up:"RX-01", path:"检索与验证 › 检索入口 › 描述式检索", zh:"描述式检索", en:"Descriptive Search", slot:"target",
  kw:["descriptive search","query by description"], alt:["描述检索"],
  desc:"没有名字，只有「我要那种感觉」时的主路径，落到槽位。" },
{ id:"RX-01-5", lib:"12", up:"RX-01", path:"检索与验证 › 检索入口 › 以图检索", zh:"以图检索", en:"Image-first Retrieval", slot:"target",
  kw:["image based search","reverse lookup from image"], alt:["以图搜图"],
  desc:"先拆解参考图属于哪些槽，再回溯对应模块。" },
{ id:"RX-01-6", lib:"12", up:"RX-01", path:"检索与验证 › 检索入口 › 空结果处理", zh:"空结果处理", en:"Empty Result", slot:"target",
  kw:["no result fallback","compose from modules"], alt:["查不到"],
  desc:"无匹配时返回可组合的模块清单，并明确标注尚未实测。" },

// ── RX-02 结果形态 ────────────────────────────────────
{ id:"RX-02", lib:"12", up:null, path:"检索与验证 › 结果形态", zh:"结果形态", en:"Result Kind", alt:["结果"],
  desc:"不同结果形态可信度不同，必须标注清楚，不能一律当作定论。" },
{ id:"RX-02-1", lib:"12", up:"RX-02", path:"检索与验证 › 结果形态 › 完整记录", zh:"完整记录", en:"Full Record", slot:"target",
  kw:["complete record","verified entry"], alt:["收录"], desc:"十二组字段齐全，已有实测，可直接复制。" },
{ id:"RX-02-2", lib:"12", up:"RX-02", path:"检索与验证 › 结果形态 › 组合方案", zh:"组合方案", en:"Composed Proposal", slot:"target",
  kw:["composed proposal","assembled recipe"], alt:["组合"], desc:"由模块拼出，标注为组合方案，尚未实测。" },
{ id:"RX-02-3", lib:"12", up:"RX-02", path:"检索与验证 › 结果形态 › 拆解结果", zh:"拆解结果", en:"Decomposition", slot:"target",
  kw:["decomposed parts","slot breakdown"], alt:["拆解"], desc:"把需求拆成槽位清单，供用户自行选取。" },
{ id:"RX-02-4", lib:"12", up:"RX-02", path:"检索与验证 › 结果形态 › 相似推荐", zh:"相似推荐", en:"Nearest Neighbor", slot:"target",
  kw:["similar entry","nearest match"], alt:["近似"], desc:"给最接近的已知项，并说明差在哪。" },

// ── RX-03 证据与可信度 ────────────────────────────────
{ id:"RX-03", lib:"12", up:null, path:"检索与验证 › 证据等级", zh:"证据等级", en:"Evidence Level", alt:["可信度"],
  desc:"知识库的价值取决于它敢不敢说自己不确定。" },
{ id:"RX-03-1", lib:"12", up:"RX-03", path:"检索与验证 › 证据等级 › 实测记录", zh:"实测记录", en:"Benchmarked", slot:"target",
  kw:["benchmarked result","tested prompt"], alt:["已测"], desc:"有实际生成结果留档，可复现。" },
{ id:"RX-03-2", lib:"12", up:"RX-03", path:"检索与验证 › 证据等级 › 客观事实", zh:"客观事实", en:"Fact", slot:"target",
  kw:["documented fact","verifiable source"], alt:["事实"], desc:"可查证的年代、作者、技法定义。" },
{ id:"RX-03-3", lib:"12", up:"RX-03", path:"检索与验证 › 证据等级 › 主观判断", zh:"主观判断", en:"Subjective", slot:"target",
  kw:["subjective judgment","community consensus"], alt:["主观"], desc:"风格命名与俗称，可能随时间漂移。" },
{ id:"RX-03-4", lib:"12", up:"RX-03", path:"检索与验证 › 证据等级 › 观察归纳", zh:"观察归纳", en:"Observed", slot:"target",
  kw:["observed pattern","inductive guess"], alt:["归纳"], desc:"从样本归纳的趋势，非保证。" },

// ── RX-04 验证流程 ────────────────────────────────────
{ id:"RX-04", lib:"12", up:null, path:"检索与验证 › 验证流程", zh:"验证流程", en:"Validation Flow", alt:["验证"],
  desc:"新加入的组合在标称可用之前，必须走完这四步。" },
{ id:"RX-04-1", lib:"12", up:"RX-04", path:"检索与验证 › 验证流程 › 单次生成", zh:"单次生成", en:"Single Run", slot:"target",
  kw:["single generation test"], alt:["单次"], desc:"先看能不能出图，不看好不好。" },
{ id:"RX-04-2", lib:"12", up:"RX-04", path:"检索与验证 › 验证流程 › 重复稳定性", zh:"重复稳定性", en:"Repeatability", slot:"target",
  kw:["repeat run stability","same seed range"], alt:["多次"], desc:"多次生成是否落在同一结果区间。" },
{ id:"RX-04-3", lib:"12", up:"RX-04", path:"检索与验证 › 验证流程 › 形变保持", zh:"形变保持", en:"Morph Robustness", slot:"target",
  kw:["robust under morphing","holds after restyle"], alt:["变形后"], desc:"换个风格或构图还能不能认出来。" },
{ id:"RX-04-4", lib:"12", up:"RX-04", path:"检索与验证 › 验证流程 › 他人复现", zh:"他人复现", en:"Peer Reproduce", slot:"target",
  kw:["peer reproduction","other person can copy"], alt:["复现"], desc:"换个人照抄能否得到相近结果。" },

// ── RX-05 维护规则 ────────────────────────────────────
{ id:"RX-05", lib:"12", up:null, path:"检索与验证 › 维护规则", zh:"维护规则", en:"Maintenance Rule", alt:["维护"],
  desc:"开放系统的代价是必须长期维护。规则先定好，后来者才不会乱。" },
{ id:"RX-05-1", lib:"12", up:"RX-05", path:"检索与验证 › 维护规则 › 单一数据源", zh:"单一数据源", en:"Single Source", slot:"target",
  kw:["single source of truth"], alt:["同源"], desc:"网页与文档同源生成，不做两份。" },
{ id:"RX-05-2", lib:"12", up:"RX-05", path:"检索与验证 › 维护规则 › 分层不可混写", zh:"分层不可混写", en:"No Layer Mixing", slot:"target",
  kw:["keep dimensions separate"], alt:["分层"],
  desc:"地域不等于风格，题材不等于画风，作品名不等于技法。" },
{ id:"RX-05-3", lib:"12", up:"RX-05", path:"检索与验证 › 维护规则 › 未收录仍可用", zh:"未收录仍可用", en:"Open Extension", slot:"target",
  kw:["extensible by composition"], alt:["可扩展"], desc:"没收录不等于做不出来，走组合路径。" },
{ id:"RX-05-4", lib:"12", up:"RX-05", path:"检索与验证 › 维护规则 › 模型参数不入通用层", zh:"模型参数不入通用层", en:"No Params in Core", slot:"limit",
  kw:["no model parameters in core record"], alt:["参数隔离"],
  desc:"种子、步数、采样器是属于单次运行的，不属于条目本身。" },
{ id:"RX-05-5", lib:"12", up:"RX-05", path:"检索与验证 › 维护规则 › 缺项如实标注", zh:"缺项如实标注", en:"Mark Gaps", slot:"target",
  kw:["explicitly mark gaps","under documented"], alt:["标注缺口"],
  desc:"非洲、南美、东南亚等地区仍在补录，如实写明而不是凑数。" },
{ id:"RX-05-6", lib:"12", up:"RX-05", path:"检索与验证 › 维护规则 › 争议项并列呈现", zh:"争议项并列呈现", en:"Show Dispute", slot:"target",
  kw:["present competing views"], alt:["并列"], desc:"命名或归属有分歧时，两种说法都保留。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_RETRIEVE };
