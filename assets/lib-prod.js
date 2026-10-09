// 10 生产与交付库
// 节点约定：{ id, lib, up, path, zh, en, kw, alt, desc, slot }
// 边界提醒：模型参数不等于通用提示词。本库只登记「目标与约束」，不绑定某次出图的随机种子。
// 注意：zh / desc / path 必须是纯中文，英文只允许出现在 kw / en / alt。

var LIB_PROD = [
// ── PR-01 交付用途 ────────────────────────────────────
{ id:"PR-01", lib:"10", up:null, path:"生产与交付 › 交付用途", zh:"交付用途", en:"Deliverable Purpose", alt:["用途"],
  desc:"先问这张图要去哪里。用途决定尺寸、密度与是否允许文字。" },
{ id:"PR-01-1", lib:"10", up:"PR-01", path:"生产与交付 › 交付用途 › 概念草图", zh:"概念草图", en:"Concept Sketch", slot:"target",
  kw:["concept sketch","rough exploration","thumbnail study"], alt:["草稿"], desc:"追求方案数量，允许粗糙与未完成。" },
{ id:"PR-01-2", lib:"10", up:"PR-01", path:"生产与交付 › 交付用途 › 角色设计定的", zh:"角色设计定稿", en:"Character Sheet", slot:"target",
  kw:["character sheet","turnaround view","orthographic-like views"], alt:["三视图","设定稿"],
  desc:"正侧背三面加关键细节，风格统一压过表现力。" },
{ id:"PR-01-3", lib:"10", up:"PR-01", path:"生产与交付 › 交付用途 › 场景关键帧", zh:"场景关键帧", en:"Key Visual", slot:"target",
  kw:["key visual","scene illustration","main artwork"], alt:["主视觉"], desc:"单张承担全部信息，完成度要求最高。" },
{ id:"PR-01-4", lib:"10", up:"PR-01", path:"生产与交付 › 交付用途 › 分镜与演出稿", zh:"分镜与演出稿", en:"Storyboard", slot:"target",
  kw:["storyboard panel","shot layout","rough timing"], alt:["演出"], desc:"清晰度服务于沟通，不追求画面完成度。" },
{ id:"PR-01-5", lib:"10", up:"PR-01", path:"生产与交付 › 交付用途 › 印刷物料", zh:"印刷物料", en:"Print Output", slot:"target",
  kw:["print output","poster layout","high detail for print"], alt:["印刷"], desc:"分辨率与出血是硬指标。" },
{ id:"PR-01-6", lib:"10", up:"PR-01", path:"生产与交付 › 交付用途 › 社交与竖屏物料", zh:"社交与竖屏物料", en:"Social Asset", slot:"target",
  kw:["social media asset","vertical poster","thumbnail banner"], alt:["社媒"], desc:"小尺观看，识别度比细节重要。" },
{ id:"PR-01-7", lib:"10", up:"PR-01", path:"生产与交付 › 交付用途 › 游戏资产", zh:"游戏资产", en:"Game Asset", slot:"target",
  kw:["game asset","icon sprite","ui friendly composition"], alt:["游戏"], desc:"需要可裁切、可平铺或可抠图的干净边缘。" },

// ── PR-02 输出规格 ────────────────────────────────────
{ id:"PR-02", lib:"10", up:null, path:"生产与交付 › 输出规格", zh:"输出规格", en:"Output Spec", alt:["规格"],
  desc:"规格是硬约束。它不属于风格，也不应在风格槽里指定。" },
{ id:"PR-02-1", lib:"10", up:"PR-02", path:"生产与交付 › 输出规格 › 宽高比", zh:"宽高比", en:"Aspect Ratio", slot:"spec",
  kw:["aspect ratio","16:9","9:16","1:1"], alt:["比例"], desc:"先定比例，再构图。" },
{ id:"PR-02-2", lib:"10", up:"PR-02", path:"生产与交付 › 输出规格 › 细节层级", zh:"细节层级", en:"Detail Level", slot:"spec",
  kw:["high detail","clean simple shapes","limited detail"], alt:["精度"], desc:"按用途选择，过度细节在小图上会变脏。" },
{ id:"PR-02-3", lib:"10", up:"PR-02", path:"生产与交付 › 输出规格 › 数量与一致性", zh:"数量与一致性", en:"Batch Consistency", slot:"spec",
  kw:["consistent batch","same character across shots","uniform palette"], alt:["一致性"], desc:"多张之间的稳定比单张出彩更难。" },
{ id:"PR-02-4", lib:"10", up:"PR-02", path:"生产与交付 › 输出规格 › 可编辑性", zh:"可编辑性", en:"Editability", slot:"spec",
  kw:["clean background","isolated subject","removable backdrop"], alt:["可后期"], desc:"为抠图与二改留余地。" },

// ── PR-03 模型与格式适配 ──────────────────────────────
{ id:"PR-03", lib:"10", up:null, path:"生产与交付 › 模型适配", zh:"模型适配", en:"Model Adaptation", alt:["适配"],
  desc:"同一意图在不同模型里需要不同表达。这是方言问题，不是内容问题。" },
{ id:"PR-03-1", lib:"10", up:"PR-03", path:"生产与交付 › 模型适配 › 整段自然语言", zh:"整段自然语言", en:"Prose Dialect", slot:"target",
  kw:["natural language prompt","full sentence description"], alt:["散文式"],
  desc:"适合对话式图像模型，按对象到顺序完整叙述。" },
{ id:"PR-03-2", lib:"10", up:"PR-03", path:"生产与交付 › 模型适配 › 逗号标签", zh:"逗号标签", en:"Tag Dialect", slot:"target",
  kw:["comma separated tags","danbooru style tags"], alt:["标签式"], desc:"适合扩散式模型，权重靠位置与重复。" },
{ id:"PR-03-3", lib:"10", up:"PR-03", path:"生产与交付 › 模型适配 › 负向约束", zh:"负向约束", en:"Negative Constraint", slot:"limit",
  kw:["negative prompt","avoid low quality","no watermark"], alt:["反向词"], desc:"排除项，而非描述项。" },
{ id:"PR-03-4", lib:"10", up:"PR-03", path:"生产与交付 › 模型适配 › 方言转换原则", zh:"方言转换原则", en:"Dialect Conversion", slot:"target",
  kw:["dialect conversion","semantics preserved"], alt:["转换"],
  desc:"换模型只换表达方式，语义层完全一致，这点必须守住。" },

// ── PR-04 生产阶段 ────────────────────────────────────
{ id:"PR-04", lib:"10", up:null, path:"生产与交付 › 生产阶段", zh:"生产阶段", en:"Pipeline Stage", alt:["流程"],
  desc:"阶段决定画面的完成状态，是独立变量，不要与风格混写。" },
{ id:"PR-04-1", lib:"10", up:"PR-04", path:"生产与交付 › 生产阶段 › 草稿与线稿", zh:"草稿与线稿", en:"Line Art Stage", slot:"target",
  kw:["lineart","pencil sketch","uncolored drawing"], alt:["线稿"], desc:"只有线条，不上色。" },
{ id:"PR-04-2", lib:"10", up:"PR-04", path:"生产与交付 › 生产阶段 › 灰稿与色指定", zh:"灰稿与色指定", en:"Greyscale and Color Key", slot:"target",
  kw:["greyscale","color key","grey card"], alt:["色指定"], desc:"先定明度关系，再铺颜色。" },
{ id:"PR-04-3", lib:"10", up:"PR-04", path:"生产与交付 › 生产阶段 › 半成品与铺色", zh:"半成品与铺色", en:"Work in Progress", slot:"target",
  kw:["flat color","under painting","unfinished"], alt:["铺色"], desc:"大色块已定，细节尚未推进。" },
{ id:"PR-04-4", lib:"10", up:"PR-04", path:"生产与交付 › 生产阶段 › 完成品", zh:"完成品", en:"Final Render", slot:"target",
  kw:["fully rendered","finished artwork","polished final"], alt:["完稿"], desc:"所有层级收口，可直接交付。" },

// ── PR-05 质量检查 ────────────────────────────────────
{ id:"PR-05", lib:"10", up:null, path:"生产与交付 › 质量检查", zh:"质量检查", en:"QA Checklist", alt:["验收"],
  desc:"生成后必须过一遍，否则「看起来差不多」会一直掩盖结构错误。" },
{ id:"PR-05-1", lib:"10", up:"PR-05", path:"生产与交付 › 质量检查 › 结构检查", zh:"结构检查", en:"Anatomy Check", slot:"limit",
  kw:["anatomically coherent","consistent proportions","clean silhouette"], alt:["结构"], desc:"手指、关节、透视消失点是重灾区。" },
{ id:"PR-05-2", lib:"10", up:"PR-05", path:"生产与交付 › 质量检查 › 一致性检查", zh:"一致性检查", en:"Consistency Check", slot:"limit",
  kw:["consistent character design","stable palette","repeatable result"], alt:["稳定"], desc:"同一描述多次生成是否落回同一结果。" },
{ id:"PR-05-3", lib:"10", up:"PR-05", path:"生产与交付 › 质量检查 › 杂讯与伪影", zh:"杂讯与伪影", en:"Artifact Check", slot:"limit",
  kw:["no artifacts","clean edges","no duplicated limbs"], alt:["瑕疵"], desc:"多肢、粘连、伪文字都是常见失效。" },
{ id:"PR-05-4", lib:"10", up:"PR-05", path:"生产与交付 › 质量检查 › 复用性检查", zh:"复用性检查", en:"Reproducibility Check", slot:"limit",
  kw:["reproducible prompt","reusable recipe"], alt:["复用"], desc:"他人照抄能否得到相近结果，是知识库的合格线。" },

// ── PR-06 权利与边界 ──────────────────────────────────
{ id:"PR-06", lib:"10", up:null, path:"生产与交付 › 权利边界", zh:"权利边界", en:"Rights Boundary", alt:["版权"],
  desc:"⚠ 提示词知识库只处理「怎么画」，不处理「能不能用」。商用前请自行确认授权。" },
{ id:"PR-06-1", lib:"10", up:"PR-06", path:"生产与交付 › 权利边界 › 风格参照", zh:"风格参照", en:"Style Reference", slot:"limit",
  kw:["inspired by style","stylistic homage"], alt:["致敬"], desc:"参照视觉语言，不复制具体作品画面。" },
{ id:"PR-06-2", lib:"10", up:"PR-06", path:"生产与交付 › 权利边界 › 作品名使用", zh:"作品名使用", en:"Title Usage", slot:"limit",
  kw:["named work reference","title based retrieval"], alt:["指名"],
  desc:"作品名是检索入口，不是技法，也不代表授权。" },
{ id:"PR-06-3", lib:"10", up:"PR-06", path:"生产与交付 › 权利边界 › 真实人物与商标", zh:"真实人物与商标", en:"Likeness and Trademark", slot:"limit",
  kw:["avoid real likeness","no real logo","fictional substitute"], alt:["肖像"], desc:"避免生成可识别的真人与商标。" },
{ id:"PR-06-4", lib:"10", up:"PR-06", path:"生产与交付 › 权利边界 › 文化敏感项", zh:"文化敏感项", en:"Cultural Sensitivity", slot:"limit",
  kw:["cultural sensitivity","respectful depiction"], alt:["敏感"], desc:"宗教符号、民族服饰、历史创伤题材需先查证。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_PROD };
