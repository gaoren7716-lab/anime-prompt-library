// 08 镜头与时空库
// 节点约定：{ id, lib, up, path, zh, en, kw, alt, desc, slot }
// slot = "frame"（画面控制）或 "motion"（动态控制）。
// 注意：zh / desc / path 必须是纯中文，英文只允许出现在 kw / en / alt。

var LIB_LENS = [
// ── LN-01 景别 ────────────────────────────────────────
{ id:"LN-01", lib:"08", up:null, path:"镜头与时空 › 景别", zh:"景别", en:"Shot Size", alt:["取景"],
  desc:"景别决定观众与对象的距离，也决定信息取舍。" },
{ id:"LN-01-1", lib:"08", up:"LN-01", path:"镜头与时空 › 景别 › 大远景", zh:"大远景", en:"Extreme Wide", slot:"frame",
  kw:["extreme wide shot","establishing shot","tiny figure vast land"], alt:["大全景"], desc:"环境压过人物，人物不超过画幅十分之一。" },
{ id:"LN-01-2", lib:"08", up:"LN-01", path:"镜头与时空 › 景别 › 全景", zh:"全景", en:"Full Shot", slot:"frame",
  kw:["full body shot","wide shot","whole figure visible"], alt:["全身"], desc:"完整人物加部分环境，交代动作关系。" },
{ id:"LN-01-3", lib:"08", up:"LN-01", path:"镜头与时空 › 景别 › 中景", zh:"中景", en:"Medium Shot", slot:"frame",
  kw:["medium shot","waist up","upper body framing"], alt:["半身"], desc:"腰部以上，兼顾姿态与表情，最常用。" },
{ id:"LN-01-4", lib:"08", up:"LN-01", path:"镜头与时空 › 景别 › 近景", zh:"近景", en:"Close Up", slot:"frame",
  kw:["close up","portrait framing","face detail"], alt:["特写"], desc:"头部为主，情绪压过环境信息。" },
{ id:"LN-01-5", lib:"08", up:"LN-01", path:"镜头与时空 › 景别 › 局部大特写", zh:"局部大特写", en:"Extreme Close Up", slot:"frame",
  kw:["extreme close up","eye detail","hands macro"], alt:["大特写"], desc:"只画眼睛或手，制造压迫与强调。" },

// ── LN-02 机位角度 ────────────────────────────────────
{ id:"LN-02", lib:"08", up:null, path:"镜头与时空 › 机位角度", zh:"机位角度", en:"Camera Angle", alt:["视角"],
  desc:"角度是态度。同一对象，换角度即换立场。" },
{ id:"LN-02-1", lib:"08", up:"LN-02", path:"镜头与时空 › 机位角度 › 平视", zh:"平视", en:"Eye Level", slot:"frame",
  kw:["eye level angle","neutral viewpoint"], alt:["水平"], desc:"最中立，观众与角色地位对等。" },
{ id:"LN-02-2", lib:"08", up:"LN-02", path:"镜头与时空 › 机位角度 › 仰视", zh:"仰视", en:"Low Angle", slot:"frame",
  kw:["low angle shot","looking up","hero angle"], alt:["仰角"], desc:"抬高对象，制造压迫或崇敬。" },
{ id:"LN-02-3", lib:"08", up:"LN-02", path:"镜头与时空 › 机位角度 › 俯视", zh:"俯视", en:"High Angle", slot:"frame",
  kw:["high angle","bird eye view","looking down"], alt:["俯角"], desc:"压低对象，暴露全貌或制造无力感。" },
{ id:"LN-02-4", lib:"08", up:"LN-02", path:"镜头与时空 › 机位角度 › 倾斜构图", zh:"倾斜构图", en:"Dutch Angle", slot:"frame",
  kw:["dutch angle","tilted horizon","unstable framing"], alt:["荷兰角"], desc:"地平线倾斜，暗示失衡与危机。" },
{ id:"LN-02-5", lib:"08", up:"LN-02", path:"镜头与时空 › 机位角度 › 主观视角", zh:"主观视角", en:"POV", slot:"frame",
  kw:["point of view shot","first person view","over shoulder"], alt:["第一人称"], desc:"观众借角色眼睛看，代入感强。" },

// ── LN-03 构图法则 ────────────────────────────────────
{ id:"LN-03", lib:"08", up:null, path:"镜头与时空 › 构图法则", zh:"构图法则", en:"Composition", alt:["构图"],
  desc:"构图是把视线引导到你应该看的地方，不是装饰。" },
{ id:"LN-03-1", lib:"08", up:"LN-03", path:"镜头与时空 › 构图法则 › 三分与井字", zh:"三分与井字", en:"Rule of Thirds", slot:"frame",
  kw:["rule of thirds","thirds composition"], alt:["九宫格"], desc:"主体落在交叉点，稳定但不呆板。" },
{ id:"LN-03-2", lib:"08", up:"LN-03", path:"镜头与时空 › 构图法则 › 中心对称", zh:"中心对称", en:"Centered Symmetry", slot:"frame",
  kw:["centered composition","symmetrical framing"], alt:["对称"], desc:"权威、庄重、仪式感的默认选择。" },
{ id:"LN-03-3", lib:"08", up:"LN-03", path:"镜头与时空 › 构图法则 › 引导线", zh:"引导线", en:"Leading Lines", slot:"frame",
  kw:["leading lines","perspective convergence"], alt:["透视线"], desc:"用道路、栏杆、视线把注意力推向主体。" },
{ id:"LN-03-4", lib:"08", up:"LN-03", path:"镜头与时空 › 构图法则 › 框架嵌套", zh:"框架嵌套", en:"Framing Device", slot:"frame",
  kw:["frame within frame","doorway framing","peek through"], alt:["框中框"], desc:"借门窗洞口做二次取景，增加纵深。" },
{ id:"LN-03-5", lib:"08", up:"LN-03", path:"镜头与时空 › 构图法则 › 前景遮挡", zh:"前景遮挡", en:"Foreground Occlusion", slot:"frame",
  kw:["foreground obstruction","depth layering","overlapping planes"], alt:["前景"], desc:"近中远三层叠压，画面立刻有厚度。" },
{ id:"LN-03-6", lib:"08", up:"LN-03", path:"镜头与时空 › 构图法则 › 大量留白", zh:"大量留白", en:"Negative Space", slot:"frame",
  kw:["negative space","minimal composition","open margin"], alt:["留白"], desc:"实体退到角落，空白承担呼吸与情绪。" },

// ── LN-04 镜头运动与运镜 ──────────────────────────────
{ id:"LN-04", lib:"08", up:null, path:"镜头与时空 › 运镜", zh:"运镜", en:"Camera Movement", alt:["镜头运动"],
  desc:"静态图用位移模糊、透视夸张与构图暗示运动。" },
{ id:"LN-04-1", lib:"08", up:"LN-04", path:"镜头与时空 › 运镜 › 推拉", zh:"推拉", en:"Dolly", slot:"motion",
  kw:["dolly in","push in","zoom effect"], alt:["推进"], desc:"靠透视压缩与放射构图表达。" },
{ id:"LN-04-2", lib:"08", up:"LN-04", path:"镜头与时空 › 运镜 › 摇移跟随", zh:"摇移跟随", en:"Pan Follow", slot:"motion",
  kw:["pan motion","tracking shot","motion streaks"], alt:["跟拍"], desc:"背景横向拉丝，主体相对清晰。" },
{ id:"LN-04-3", lib:"08", up:"LN-04", path:"镜头与时空 › 运镜 › 环绕", zh:"环绕", en:"Orbit", slot:"motion",
  kw:["orbit shot","circling camera","rotation blur"], alt:["旋转"], desc:"环境呈弧向流动，主体近似静止。" },
{ id:"LN-04-4", lib:"08", up:"LN-04", path:"镜头与时空 › 运镜 › 手持晃动", zh:"手持晃动", en:"Handheld", slot:"motion",
  kw:["handheld shake","shaky documentary feel"], alt:["手持"], desc:"轻微失衡与边缘抖动，增加临场感。" },
{ id:"LN-04-5", lib:"08", up:"LN-04", path:"镜头与时空 › 运镜 › 固定长镜", zh:"固定长镜", en:"Locked Shot", slot:"motion",
  kw:["locked off camera","static frame","no camera motion"], alt:["定镜"], desc:"机位不动，靠被摄体运动产生张力。" },

// ── LN-05 时间表现 ────────────────────────────────────
{ id:"LN-05", lib:"08", up:null, path:"镜头与时空 › 时间表现", zh:"时间表现", en:"Time Expression", alt:["时间"],
  desc:"静止图像里，时间靠符号而非真实流逝来表现。" },
{ id:"LN-05-1", lib:"08", up:"LN-05", path:"镜头与时空 › 时间表现 › 定格瞬间", zh:"定格瞬间", en:"Frozen Moment", slot:"motion",
  kw:["frozen moment","stopped motion","sharp impact"], alt:["静止"], desc:"一切清晰凝固，用来强调最高点。" },
{ id:"LN-05-2", lib:"08", up:"LN-05", path:"镜头与时空 › 时间表现 › 高速运动拖影", zh:"高速运动拖影", en:"Motion Blur", slot:"motion",
  kw:["motion blur","speed lines","dynamic smear"], alt:["动态模糊"], desc:"方向性拖影交代速度与轨迹。" },
{ id:"LN-05-3", lib:"08", up:"LN-05", path:"镜头与时空 › 时间表现 › 慢镜与延时", zh:"慢镜与延时", en:"Slow Motion", slot:"motion",
  kw:["slow motion feel","floating debris","time stretch"], alt:["慢动作"], desc:"悬浮碎屑与舒展姿态表达时间被拉长。" },
{ id:"LN-05-4", lib:"08", up:"LN-05", path:"镜头与时空 › 时间表现 › 多时间并置", zh:"多时间并置", en:"Time Overlay", slot:"motion",
  kw:["time overlay","multiple exposure","ghostly afterimage"], alt:["残影"], desc:"同一对象重复出现，暗示过程。" },
{ id:"LN-05-5", lib:"08", up:"LN-05", path:"镜头与时空 › 时间表现 › 长时沉积", zh:"长时沉积", en:"Weathered Time", slot:"motion",
  kw:["years of wear","accumulated grime","long exposure stillness"], alt:["岁月"], desc:"用磨损与积尘表现时间已流过。" },

// ── LN-06 画幅与版式 ──────────────────────────────────
{ id:"LN-06", lib:"08", up:null, path:"镜头与时空 › 画幅版式", zh:"画幅版式", en:"Format", alt:["比例"],
  desc:"画幅是硬约束，先定比例再构图，否则裁切一定出问题。" },
{ id:"LN-06-1", lib:"08", up:"LN-06", path:"镜头与时空 › 画幅版式 › 方构图", zh:"方构图", en:"Square", slot:"frame",
  kw:["square format","1:1 aspect","square crop"], alt:["方形"], desc:"稳定、居中友好，适合头像与社群发布。" },
{ id:"LN-06-2", lib:"08", up:"LN-06", path:"镜头与时空 › 画幅版式 › 横幅宽银幕", zh:"横幅宽银幕", en:"Widescreen", slot:"frame",
  kw:["widescreen 16:9","cinematic 2.39:1","letterbox"], alt:["宽银幕"], desc:"横向叙事，适合环境与双人。" },
{ id:"LN-06-3", lib:"08", up:"LN-06", path:"镜头与时空 › 画幅版式 › 竖幅移动端", zh:"竖幅移动端", en:"Vertical", slot:"frame",
  kw:["vertical composition","9:16 portrait","mobile format"], alt:["竖屏"], desc:"纵向纵深，适合单人全身与海报。" },
{ id:"LN-06-4", lib:"08", up:"LN-06", path:"镜头与时空 › 画幅版式 › 漫画分格版式", zh:"漫画分格版式", en:"Comic Panel Layout", slot:"frame",
  kw:["comic panel layout","manga page","panel gutter"], alt:["分格"], desc:"多格并置，阅读顺序由分格走向决定。" },
{ id:"LN-06-5", lib:"08", up:"LN-06", path:"镜头与时空 › 画幅版式 › 多联与安全边距", zh:"多联与安全边距", en:"Multi-panel and Safe Area", slot:"frame",
  kw:["safe area margin","grid layout","multi panel grid"], alt:["安全区"], desc:"为裁切、文字压印预留空间。" }
];

if (typeof module !== "undefined" && module.exports) module.exports = { LIB_LENS };
