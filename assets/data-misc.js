/* ============================================================
 * 数据层 E：组合模板  +  F：负面提示词  +  G：平台语法差异
 * ============================================================ */

const TEMPLATES = [
  { id:"T-01", zh:"单人角色插画", en:"Single Character Illustration", use:"最常见的用途：一张完整的角色图",
    pos:"1girl, {角色特征}, {发型}, {服装}, {表情}, {姿势}, {背景}, {画风层}, {镜头}, {光影}, {画质词}",
    neg:"lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, jpeg artifacts, signature, watermark, username, blurry",
    params:"MJ 追加 --ar 2:3 --niji 6；SDXL 用 832x1216",
    tip:"填的顺序就是权重顺序：越靠前越被重视。先写主体，再写服装，最后是风格与画质。" },

  { id:"T-02", zh:"全身角色立绘", en:"Full Body Character Sheet", use:"角色设定、游戏卡牌、资料图",
    pos:"full body, standing, looking at viewer, 1girl, {服装}, {发型}, {道具}, simple background, white background, {画风层}, masterpiece, best quality, high resolution",
    neg:"lowres, bad anatomy, bad hands, missing fingers, extra limbs, cropped, mutation, deformed, worst quality, jpeg artifacts, watermark, multiple views",
    params:"MJ 追加 --ar 2:3 --niji 6；SDXL 用 832x1216",
    tip:"加 simple background 或 white background，背景干净便于后期抠图。想要转身学制层要求极强的模型，建议先出正面再重绘。" },

  { id:"T-03", zh:"角色三视图 / 设定稿", en:"Character Turnaround", use:"给画师或三维建模用的多角度参考",
    pos:"character design sheet, multiple views, front view, side view, back view, full body, standing, 1girl, {服装}, white background, clean lineart, reference sheet layout",
    neg:"lowres, bad anatomy, bad hands, extra limbs, distorted proportions, complex background, worst quality, watermark, single view only",
    params:"SDXL / Flux 建议 1216x832 横版",
    tip:"三视图对模型要求很高，容易出现不一致。建议分三次出图后用排版软件拼接，比一次生成更稳。" },

  { id:"T-04", zh:"双人互动构图", en:"Two Character Scene", use:"CP 图、伙伴、对手对照",
    pos:"2girls, {角色A特征}, {角色B特征}, {互动：eye contact / back to back / holding hands}, {环境}, {画风层}, {光影}, masterpiece, best quality",
    neg:"lowres, bad anatomy, bad hands, extra limbs, extra person, fused bodies, deformed, worst quality, jpeg artifacts, watermark",
    params:"MJ 追加 --ar 16:9 --niji 6",
    tip:"两个角色要用对比色区分发色与服装，否则模型会把两人画成同一个人。" },

  { id:"T-05", zh:"场景背景美术", en:"Background Art", use:"纯背景、游戏背景、速写参考",
    pos:"background art, no humans, {场景类型}, {时间段}, {天气}, {画风层}, detailed background painting, cinematic composition, wide shot, masterpiece",
    neg:"lowres, people, human, character, bad anatomy, text, watermark, cropped, worst quality, jpeg artifacts, blurry",
    params:"MJ 追加 --ar 16:9；SDXL 用 1216x832",
    tip:"写 no humans 或 empty scene 才能真正排除人物。想要吉卜力式的精度就强调 detailed background painting。" },

  { id:"T-06", zh:"宽屏壁纸（16:9）", en:"Desktop Wallpaper 16:9", use:"桌面壁纸、视频封面、横幅",
    pos:"{主体}, {环境}, {画风层}, wide shot, cinematic composition, dramatic lighting, detailed background, masterpiece, best quality, ultra-detailed, 8k",
    neg:"lowres, bad anatomy, text, watermark, username, cropped, worst quality, jpeg artifacts, signature, out of frame",
    params:"MJ 追加 --ar 16:9；SDXL 用 1216x832；Flux 用 1360x768",
    tip:"宽屏要写 wide shot 让模型把画面撑开，否则主体会居中挤成一团。两侧留白方便放图标。" },

  { id:"T-07", zh:"手机竖屏壁纸（9:16）", en:"Mobile Wallpaper 9:16", use:"手机锁屏、短视频封面",
    pos:"{主体}, centered composition, {环境}, {画风层}, vertical framing, detailed background, rim light, masterpiece, best quality",
    neg:"lowres, text, watermark, cropped, worst quality, jpeg artifacts, distorted, too many elements",
    params:"MJ 追加 --ar 9:16 --niji 6；SDXL 用 832x1216",
    tip:"竖屏构图的关键是 centered composition 与上下留白，主体放在画面中上部，底部留给时间与日期。" },

  { id:"T-08", zh:"头像素材 / 头像框", en:"Icon / Avatar", use:"社交头像、论坛、角色图标",
    pos:"portrait, close-up, upper body, 1girl, {角色特征}, simple background, gradient background, {画风层}, soft lighting, masterpiece, best quality",
    neg:"lowres, bad hands, text, watermark, cropped, complex background, full body, worst quality, jpeg artifacts",
    params:"MJ 追加 --ar 1:1 --niji 6；SDXL 用 1024x1024",
    tip:"头像会缩到很小，所以构图要紧凑：用 portrait / close-up，背景保持简单，五官要够大够清楚。" },

  { id:"T-09", zh:"表情包 / 贴纸组", en:"Sticker Pack", use:"聊天表情、社群贴纸",
    pos:"sticker, chibi, white outline, simple background, {主题}, {表情}, cute simplified face, clean flat colors, vector-like, {画风层}",
    neg:"lowres, complex background, realistic, text, watermark, jpeg artifacts, blurry, bad hands, worst quality",
    params:"MJ 追加 --ar 1:1 --style raw；SD 系可用 sdxl 1:1",
    tip:"写 white outline 会自动生成描白边，这是表情包的灵魂。搭配 chibi 与夸张表情效果最好。" },

  { id:"T-10", zh:"漫画分镜页", en:"Manga Page Layout", use:"漫画、条漫、合作本",
    pos:"manga panel, comic page, monochrome, screentone, black and white, {分格数}, {内容}, heavy inking, dramatic speech bubbles, printing grain",
    neg:"lowres, color, colored, text garble, watermark, blurry, worst quality, jpeg artifacts",
    params:"SDXL 用 832x1216；建议生成后自行加对白",
    tip:"模型生成的文字几乎全是乱码。正确做法是留气泡空白，出图后用排版软件单独补字。" },

  { id:"T-11", zh:"影视海报", en:"Movie Poster", use:"作品海报、活动主视觉",
    pos:"anime movie poster, poster design, {主体}, {副主体}, centered composition, dramatic contrast, negative space, {配色}, title safe space at bottom, masterpiece",
    neg:"lowres, text garble, watermark, cluttered background, bad anatomy, worst quality, jpeg artifacts, logos",
    params:"MJ 追加 --ar 2:3；SDXL 用 832x1216",
    tip:"海报要有留白：negative space 加上 title safe space，方便后期把标题压上去。" },

  { id:"T-12", zh:"轻小说封面", en:"Light Novel Cover", use:"小说封面、电子书封面",
    pos:"light novel cover illustration, front cover composition, {主角}, {第二位角色}, {背景}, vertical japanese title space on right, detailed background, {画风层}, masterpiece, best quality",
    neg:"lowres, bad anatomy, bad hands, extra limbs, watermark, cropped, worst quality, jpeg artifacts, cluttered composition",
    params:"MJ 追加 --ar 2:3；SDXL 用 832x1216",
    tip:"封面讲究「一眼看懂」：一个清晰的主色、两个以内的角色、右侧留出竖排标题的位置。" },

  { id:"T-13", zh:"机械 / 道具设定稿", en:"Mecha & Prop Design Sheet", use:"机设、武器、装甲设定",
    pos:"weapon design sheet, hard surface modeling, mechanical panel lines, orthographic view, white background, technical details, clean rendering, callout lines space, masterpiece",
    neg:"lowres, bad anatomy, human face, blurry, deformed, worst quality, jpeg artifacts, watermark, sketch dirty lines",
    params:"SDXL / Flux 用 1216x832 横版",
    tip:"硬表面题材务必写 hard surface modeling 与 panel lines，背景保持纯白，便于后期标注。" },

  { id:"T-14", zh:"概念设计图", en:"Concept Art", use:"世界观、建筑、地狱概念图",
    pos:"concept art, environment design, wide establishing shot, {环境}, scale reference figures, atmospheric perspective, {画风层}, cinematic lighting, detailed background masterpiece",
    neg:"lowres, bad anatomy, close up portrait, watermark, cropped, worst quality, jpeg artifacts, blurry foreground",
    params:"MJ 追加 --ar 16:9；SDXL 用 1216x832",
    tip:"概念图的重点是体量对比：加入模糊的人形作为尺度参照，空间感立刻成立。" },

  { id:"T-15", zh:"三渲二混合风格", en:"2.5D Hybrid Render", use:"前述法国海底混合风格、游戏最终画面",
    pos:"{主体}, 3d render with ink outlines, cel shading over 3d model, halftone print texture overlay, crisp rim light, pop color separation, {画风层}",
    neg:"lowres, pure flat 2d look, photorealistic skin, blurry, worst quality, jpeg artifacts, watermark, deformed hands",
    params:"MJ 追加 --ar 16:9；SDXL 用 1216x832",
    tip:"这是画风层 A4-06 的直接应用。三个要素缺一不可：网点、三维渲染、手绘描线。" },

  { id:"T-16", zh:"动画截图（不确定辈）", en:"Anime Screencap Fake", use:"做假截图、社媒发猫糊",
    pos:"{场景}, anime screencap, anime cel, tv anime still, broadcast quality, slight film grain, letterbox implied framing, cinematic composition, {画风层}",
    neg:"lowres, 3d render, photorealistic, oil painting, watermark, text garble, worst quality, jpeg artifacts, illustration frame",
    params:"MJ 追加 --ar 16:9；SDXL 用 1216x832",
    tip:"去掉一切插画感：不要写 wallpaper、poster、frame，只保留截图词与一层薄薄颗粒。" }
];

const NEGATIVES = [
  { id:"N-01", zh:"通用劣质排除（SD 系）", scene:"所有 SD / SDXL / Illustrious 出图都要加",
    kw:["lowres","bad anatomy","bad hands","text","error","missing fingers","extra digit","fewer digits","cropped","worst quality","low quality","normal quality","jpeg artifacts","signature","watermark","username","blurry"],
    note:"这是最基础的一句，直接整段复制即可。lowres 与 worst quality 建议永远放在最前面。" },

  { id:"N-02", zh:"解剖与手部专项", scene:"人物图、手部特写必加",
    kw:["bad hands","missing fingers","extra fingers","extra limbs","fused fingers","too many fingers","mutated hands","disfigured","bad proportions","extra arms","extra legs","long neck","cross-eyed"],
    note:"手部问题是生成模型最普遍的硬伤。加上这里面的词能显著改善，但仍建议出图后用修手流程处理。" },

  { id:"N-03", zh:"避免三维 / 真人化", scene:"想要纯二维动画质感时使用",
    kw:["photorealistic","realistic","3d render","octane render","blender","unreal engine","photograph","real life","stock photo","cgi"],
    note:"如果你的目标是「动画截图」，这组必须加。反过来，做国产三维或混合渲染时则要把它们从负面词里删掉。" },

  { id:"N-04", zh:"画面脏乱排除", scene:"厚重 / 概念 art 类容易养乱时使用",
    kw:["messy","cluttered background","too many colors","oversaturated","artifacts","duplicate","grain too heavy","noisy","banding","compression artifacts"],
    note:"出现颜色糊成一团时，往往是因为画质词堆得太多。此时应减少 ultra-detailed，增加这组负面词。" },

  { id:"N-05", zh:"Midjourney 简易负面", scene:"MJ v6 / niji 使用 --no 参数",
    kw:["--no text, watermark, signature, blur, deformed hands, extra fingers, realistic, 3d render, frame, border"],
    note:"MJ 的负面写在 --no 后面，用逗号分隔。不要写太多，否则会压制整体画质。" },

  { id:"N-06", zh:"Flux 简易负面", scene:"Flux 系列模型（对负面词不敏感）",
    kw:["blurry","low quality","watermark","text","deformed hands","extra fingers","jpeg artifacts"],
    note:"Flux 倾向于过度学习负面词会导致画面变差，因此负面词宜短不宜长，靠正面描述驱动。" },

  { id:"N-07", zh:"特定：避免文字与标识", scene:"任何不需要落字出现的图",
    kw:["text","letters","alphabet","logo","watermark","signature","username","timestamp","ui overlay","subtitles"],
    note:"模型一定会造出假文字。如果图上必须出现标题，建议后期用设计软件补。" },

  { id:"N-08", zh:"特定：避免特定生物特征", scene:"画和风或日式年中行事时的反向控制",
    kw:["western face","caucasian face","slanted eyes","korean style makeup","realistic nose"],
    note:"这是反向约束，用于模型把日式角色画成欧美人时纠正。中文题材可用 chinese face 作为正面替换。" }
];

const SYNTAX = [
  { id:"S-01", zh:"Midjourney v6 / v6.1", en:"Midjourney",
    features:"擅自然语言长句，懂复杂构图；默认审美偏电影化",
    weight:"用双冒号控制权重，例如 vibrant colors::2, soft shading::-0.5",
    param:"--ar 16:9 | --stylize 250（默认 100，越高越艺术化）| --chaos 0~100 | --style raw 关闭默认美化 | --no 负面",
    tip:"MJ 会把提示词当文章读，所以写完整句子比堆单词更好。默认混音较重，想要原始热潮要加 --style raw。" },

  { id:"S-02", zh:"Midjourney niji（二次元专用）", en:"Niji Journey",
    features:"专为动漫训练，默认就是现代商业二次元质感，懂绝大多数动漫术语",
    weight:"与 MJ 相同用双冒号；--niji 6 为当前常用版本",
    param:"--niji 6 | --ar 2:3 | --style cute / expressive / scenic / original（画像モデルを切替）",
    tip:"niji 的四种 style 直接换画风：cute 偏向可爱画风，expressive 戏剧张力强，scenic 背景精细。不确定时用 default。" },

  { id:"S-03", zh:"Stable Diffusion 1.5", en:"SD 1.5",
    features:"生态最大、LoRA 与 ControlNet 最多；原生请用 512x512，放大需另行高清化",
    weight:"括号语法：(keyword:1.3) 加强，[keyword] 降低，( keyword:0.8 ) 微调",
    param:"建议 512x512 或 768x768（需模型支持）| Steps 20~30 | CFG 7~9 | 采样器 Euler a / DPM++ 2M Karras",
    tip:"SD1.5 出图建议分两步：先出 512 小图，再用放大或超分补细节。写太长的 prompt 反而会拖累画面。" },

  { id:"S-04", zh:"SDXL / Illustrious", en:"SDXL Base",
    features:"对自然语言理解大幅提升，构图更复杂，原生就是用 centimeters 1024 级别",
    weight:"支持 (tag:1.2) 加权；也支持自然语言短句混合使用",
    param:"常用 832x1216（竖）/ 1216x832（横）/ 1024x1024（方）| Steps 25~35 | CFG 5~7 | 采样器 DPM++ 2M SDE Karras",
    tip:"Illustrious 系额外认 newest、year 2024 等时效词。若要特定绘师，可用多个画师权重叠加。" },

  { id:"S-05", zh:"Flux.1", en:"Flux",
    features:"显式 12B 参数，理解能力最强，出新 niby default 写实，需要额外 prompt 拉回动漫；对负面词不敏感",
    weight:"未使用常规括号权重；多用自然语言，靠词序与描述精确表达",
    param:"建议 1024x1024 或 1360x768 | Steps 20~30 | CFG 1~3.5（低 CFG）| 推荐搭配 LoRA",
    tip:"由于 Flux 对负面词敏感度高，负面提示词写得越短越好；控制画风靠正面描述与 LoRA。" },

  { id:"S-06", zh:"NovelAI Diffusion V3 / V4", en:"NovelAI",
    features:"专为二次元插画训练，V3 起支持自然语言描述；对「画质词 + 角色」的输 CRISPR 最熟",
    weight:"用大括号 {} 或中括号 [] 加权，例如 {{{detailed eyes}}}，也可用 [tag::2] 形式",
    param:"推荐 832x1216 / 1216x832 | Steps 28 | CFG ~5 | Sampler Euler Ancestral | 支持 Undesired Content 框",
    tip:"NAI 的用法是「选项卡式」：先在风格栏选一个预设，再叠加少量关键词。不需要手动堆 masterpiece。" },

  { id:"S-07", zh:"通用：写好一首 prompt 的顺序", en:"Prompt Ordering",
    features:"无论哪个平台，词序都影响权重：越靠前权重越高",
    weight:"推荐顺序：主体数量 → 角色特征 → 服装道具 → 动作表情 → 环境背景 → 构图镜头 → 光影 → 画风层 → 画质词",
    param:"画质词与反面词永远放在最后；角色数（1girl / 2girls）永远放在最前",
    tip:"这是本库所有模板遵循的顺序。先主体后装饰，先内容后形式，是通用且稳定的写法。" },

  { id:"S-08", zh:"混搭与权重分配原则", en:"Weight & Blending",
    features:"一幅画同时只能有一个主导风格，多余的变量会互相打架",
    weight:"采用「主风格 1 + 修饰层 2~3 + 画质层 1」的结构，总词数控制在 30~60 之间",
    param:"想要混合两个流派时，用 0.6 / 0.4 的权重差，不要都对半",
    tip:"实战经验：词太多会自相矛盾。若画面糊，先删词而不是加词；每次只调整一个变量便于复现。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { TEMPLATES, NEGATIVES, SYNTAX };
