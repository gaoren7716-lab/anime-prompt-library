// 09 声音与语言库
// 节点约定：{ id, lib, up, path, zh, en, kw, alt, desc, slot }
// 声音不可直接生成，但会以「文字、符号、气泡、口型与肢体」的形式进入画面。
// 注意：zh / desc / path 必须是纯中文，英文只允许出现在 kw / en / alt。

var LIB_VOICE = [
{ id:"VX-01", lib:"09", up:null, path:"声音与语言 › 拟声语言", zh:"拟声语言", en:"Onomatopoeia", alt:["拟声词","音效字"],
  desc:"把听觉转写成可见文字。日语、韩语、英语各有自己的拟声体系，不可互译。" },
{ id:"VX-01-1", lib:"09", up:"VX-01", path:"声音与语言 › 拟声语言 › 日式拟声拟态", zh:"日式拟声拟态", en:"Japanese Onomatopoeia", slot:"content",
  kw:["japanese onomatopoeia","manga sound effect text","furigana style sfx"], alt:["日语拟声"],
  desc:"区分拟声与拟态两类，写法与摆放位置都有约定。" },
{ id:"VX-01-2", lib:"09", up:"VX-01", path:"声音与语言 › 拟声语言 › 拉丁字母拟声", zh:"拉丁字母拟声", en:"Latin Sfx", slot:"content",
  kw:["comic sound effect lettering","bold sfx font","impact lettering"], alt:["英文音效字"],
  desc:"欧美漫画传统，字母本身承担形状与力度。" },
{ id:"VX-01-3", lib:"09", up:"VX-01", path:"声音与语言 › 拟声语言 › 中文拟声与环境声", zh:"中文拟声与环境声", en:"Chinese Sfx", slot:"content",
  kw:["chinese onomatopoeia","chinese sfx lettering"], alt:["中文拟声"], desc:"以汉字直接入画，字形笔画参与构图。" },
{ id:"VX-01-4", lib:"09", up:"VX-01", path:"声音与语言 › 拟声语言 › 无声留白", zh:"无声留白", en:"Silence", slot:"content",
  kw:["silent panel","no sound effect","quiet pause"], alt:["静默"], desc:"刻意不加声音符号，用留白制造压迫。" },

{ id:"VX-02", lib:"09", up:null, path:"声音与语言 › 漫符表情语言", zh:"漫符表情语言", en:"Manga Symbol Language", alt:["漫符"],
  desc:"一套约定俗成的记号系统。理解它的规则，就能跨语言使用。" },
{ id:"VX-02-1", lib:"09", up:"VX-02", path:"声音与语言 › 漫符表情语言 › 汗滴与青筋", zh:"汗滴与青筋", en:"Sweat and Vein Marks", slot:"content",
  kw:["sweat drop","anger vein mark","nervous sweat"], alt:["汗"], desc:"尴尬、紧张与愤怒的通用符号。" },
{ id:"VX-02-2", lib:"09", up:"VX-02", path:"声音与语言 › 漫符表情语言 › 集中线与闪光线", zh:"集中线与闪光线", en:"Speed and Focus Lines", slot:"style",
  kw:["speed lines","focus lines","flash lines"], alt:["集中线"], desc:"放射或平行线条，同时表达速度与注意力。" },
{ id:"VX-02-3", lib:"09", up:"VX-02", path:"声音与语言 › 漫符表情语言 › 效果线网", zh:"效果线网", en:"Screentone Effect", slot:"style",
  kw:["screentone","halftone pattern","gradient tone"], alt:["网点"], desc:"网点承担灰阶与情绪双重功能。" },
{ id:"VX-02-4", lib:"09", up:"VX-02", path:"声音与语言 › 漫符表情语言 › 情绪符号", zh:"情绪符号", en:"Emotion Mark", slot:"content",
  kw:["emotion symbol","cross popping veins","heart marks"], alt:["符号"], desc:"心形、井字、十字等符号叠加在面部。" },

{ id:"VX-03", lib:"09", up:null, path:"声音与语言 › 台词字幕", zh:"台词字幕", en:"Dialogue Subtitle", alt:["字幕"],
  desc:"文字进画会显著提升「漫画感」，但也会干扰纯插画用途，需按交付目的开关。" },
{ id:"VX-03-1", lib:"09", up:"VX-03", path:"声音与语言 › 台词字幕 › 对话框", zh:"对话框", en:"Speech Balloon", slot:"content",
  kw:["speech balloon","dialogue bubble","comic word balloon"], alt:["气泡"], desc:"形状传递语气：圆为常态，尖为愤怒，虚线为内心。" },
{ id:"VX-03-2", lib:"09", up:"VX-03", path:"声音与语言 › 台词字幕 › 内心独白框", zh:"内心独白框", en:"Thought Box", slot:"content",
  kw:["thought box","inner monologue panel","narration box"], alt:["旁白框"], desc:"矩形或云形，承担不可言说的部分。" },
{ id:"VX-03-3", lib:"09", up:"VX-03", path:"声音与语言 › 台词字幕 › 影片字幕条", zh:"影片字幕条", en:"Subtitle Bar", slot:"content",
  kw:["subtitle bar","caption text","lower third"], alt:["字幕"], desc:"底部居中排布，服务于视频而非印刷。" },
{ id:"VX-03-4", lib:"09", up:"VX-03", path:"声音与语言 › 台词字幕 › 禁止文字", zh:"禁止文字", en:"No Text", slot:"limit",
  kw:["no text","no letters","text free"], alt:["无字"],
  desc:"绝大多数出图场景的默认约束，避免生成乱码字符。" },

{ id:"VX-04", lib:"09", up:null, path:"声音与语言 › 标题徽标", zh:"标题徽标", en:"Title Lockup", alt:["标题"],
  desc:"标题设计是独立工种。提示词里通常只预留位置，不生成真实字体。" },
{ id:"VX-04-1", lib:"09", up:"VX-04", path:"声音与语言 › 标题徽标 › 片名与书名", zh:"片名与书名", en:"Title Card", slot:"content",
  kw:["title card","logo lockup","title treatment"], alt:["标题字"], desc:"主标题加副标题的字组关系。" },
{ id:"VX-04-2", lib:"09", up:"VX-04", path:"声音与语言 › 标题徽标 › 识别徽记", zh:"识别徽记", en:"Emblem", slot:"content",
  kw:["emblem badge","crest symbol","insignia"], alt:["徽章"], desc:"组织、队伍、流派的标记。注意不要复制真实标志。" },
{ id:"VX-04-3", lib:"09", up:"VX-04", path:"声音与语言 › 标题徽标 › 排版留位", zh:"排版留位", en:"Copy Space", slot:"frame",
  kw:["copy space","text placement area","empty area for type"], alt:["留位"], desc:"为后期压字预留的干净区域。" },

{ id:"VX-05", lib:"09", up:null, path:"声音与语言 › 听觉转视觉", zh:"听觉转视觉", en:"Sound to Visual", alt:["通感"],
  desc:"把不可见的声音变成可见的调性、密度与动态。" },
{ id:"VX-05-1", lib:"09", up:"VX-05", path:"声音与语言 › 听觉转视觉 › 节奏与拍点", zh:"节奏与拍点", en:"Rhythm", slot:"motion",
  kw:["rhythmic composition","beat timing","pulse of motion"], alt:["节奏"], desc:"重复元素的间隔就是节奏。" },
{ id:"VX-05-2", lib:"09", up:"VX-05", path:"声音与语言 › 听觉转视觉 › 强弱对比", zh:"强弱对比", en:"Dynamics", slot:"style",
  kw:["dynamic contrast","loud and soft","intensity shift"], alt:["强弱"], desc:"明暗与疏密对应音量。" },
{ id:"VX-05-3", lib:"09", up:"VX-05", path:"声音与语言 › 听觉转视觉 › 音色转质感", zh:"音色转质感", en:"Timbre Mapping", slot:"style",
  kw:["texture as timbre","grain and noise","smooth vs rough"], alt:["音色"], desc:"粗糙颗粒对应噪声，平滑渐变对应纯净音色。" },
{ id:"VX-05-4", lib:"09", up:"VX-05", path:"声音与语言 › 听觉转视觉 › 口型与发声姿态", zh:"口型与发声姿态", en:"Mouth Shape", slot:"content",
  kw:["open mouth singing","shouting pose","whisper"], alt:["口型"], desc:"口部开合幅度与颈肩紧张度共同表达发声。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_VOICE };
