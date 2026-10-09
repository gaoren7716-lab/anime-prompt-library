/* ============================================================
 * 数据层 C：题材元素 GENRES  +  数据层 D：词条库 VOCAB BANK
 * ============================================================ */

const GENRES = [
  /* ---------- 战斗 / 动作 ---------- */
  { id:"G-01", zh:"热血战斗", en:"Battle Shonen", cat:"战斗动作",
    kw:["shonen battle","dynamic action pose","impact frame","speed lines","aura effects","determined expression"],
    desc:"少年漫画主流战斗作品的视觉语言：决定性姿势、集中线、冲击帧、能量气场与面部坚毅表情。构图一定有「攻击方向」。",
    scene:"低角度仰拍强化表现力，背景配放射线或爆炸云；服装加磨损与污渍增加说服力。",
    demo:"1boy, battle shonen, dynamic jumping pose, energy aura, speed lines surrounding, intense expression, dramatic low angle" },

  { id:"G-02", zh:"机甲 / 机器人", en:"Mecha", cat:"战斗动作",
    kw:["mecha","hard surface modeling","mechanical panel lines","hydraulic pistons","cockpit glass","military color scheme"],
    desc:"分写实系（高达：装甲分块、铆钉、军绿配色）与超级系（魔神 Z：夸张胸甲与角）两条路，共同点是硬表面细节。",
    scene:"机库 Hangar / 战场废墟；常写 low angle looking up 表现体量压迫感。",
    demo:"real robot standing in hangar, hard surface armor panels, detailed hydraulic details, olive and gray military palette, dramatic dawn light, low angle" },

  { id:"G-03", zh:"忍者 / 武士", en:"Ninja & Samurai", cat:"战斗动作",
    kw:["ninja","samurai","katana","hakama","headband","bamboo forest","iaijutsu stance"],
    desc:"以日本甲胄 / 和装为核心的东方武斗系。分两派：写实克制刀法的时代剧，与刀光剑气夸张的少年漫。",
    scene:"竹林、道场、月下屋顶、樱花庭园；横向构图最适合表现拔刀的瞬间。",
    demo:"samurai in dark hakama, katana drawn, bamboo forest background, moonlight rim light, ink-influenced atmosphere, dynamic slash motion" },

  { id:"G-04", zh:"特摄战队 / 变身英雄", en:"Sentai & Tokusatsu", cat:"战斗动作",
    kw:["sentai","henshin sequence","hero suit","visor helmets","toku effects","practical suit material"],
    desc:"不是动画却胜似动画：皮套质感、面具目镜、变身定格的光带与烟火爆点。重点是材质的皮革与塑料反光。",
    scene:"巨大化战斗、经典的变身变奏长镜头；建议 16:9 画幅，保留特摄的舞台感。",
    demo:"five colored hero suits posing together, sentai lineup, glossy helmet visors, stage smoke, dynamic cool angles, retro tokusatsu poster" },

  { id:"G-05", zh:"军事 / 战争题材", en:"Military & War", cat:"战斗动作",
    kw:["military uniform","tactical gear","dog tags","smoke and dust","battlefield ruins","desaturated palette"],
    desc:"强调制服细节、枪械 / 战车、硝烟，色彩低饱和，画面常追求「平静中的残酷」。",
    scene:"战场远景 + 冷色调；角色动作姿态要避免过于潇洒，以免失真。",
    demo:"young soldier sitting in ruined trench, detailed military uniform, dust particles, cold morning light, desaturated earth tones, cinematic wide shot" },

  { id:"G-06", zh:"巨型怪兽 / 巨物感", en:"Kaiju & Colossal Scale", cat:"战斗动作",
    kw:["kaiju","giant monster","scale comparison","tiny human silhouette","destruction wave","ominous clouds"],
    desc:"靠「参照物」制造体量：城市尺度、远景中极小的人影、笼罩全身的暗影。刻意省略细节反而更可怕。",
    scene:"低机位 + 巨大阴影笼罩；加浅景深，让人与巨兽形成清晰的体量对比。",
    demo:"gigantic creature emerging from smoke above city, tiny human silhouettes below, scale contrast, dark clouds, dramatic rim light, epic wide shot" },

  /* ---------- 幻想 ---------- */
  { id:"G-07", zh:"剑与魔法（西幻）", en:"High Fantasy", cat:"幻想",
    kw:["fantasy adventure","plate armor","magic staff","ancient ruins","elven architecture","glowing runes"],
    desc:"JRPG 与《指环王》谱系：骑士板甲、法师长袍、精灵建筑、巨石废墟。核心词是「厚重的历史感与泛光魔法」。",
    scene:"哥特教堂、古代遗迹、地下城；光源由魔法泛光主导。",
    demo:"elven mage casting spell in ancient ruins, plate armor details, glowing runes particles, volumetric god rays, fantasy landscape background" },

  { id:"G-08", zh:"异世界转生", en:"Isekai", cat:"幻想",
    kw:["isekai"," summoned hero","fantasy town","adventurer guild","magic circle","modern object in fantasy world"],
    desc:"近十年最大题材：现代人来到奇幻世界。视觉公式是「现代感角色 + 剑与魔法背景」。",
    scene:"冒险者公会、中世纪街道、地牢入口；强化现代角色与环境之间的反差感。",
    demo:"modern boy reincarnated as knight, fantasy medieval town background, adventurer gear, summoning magic circle remnants, bright adventure palette" },

  { id:"G-09", zh:"魔法少女", en:"Magical Girl", cat:"幻想",
    kw:["magical girl","transformation sequence","frilly dress","wand","star motifs","pastel palette","ribbon"],
    desc:"变身段落 + 蕾丝层次 + 星月符号 + 粉彩配色。从美少女战士的复古到小圆的暗黑都可由此分支。",
    scene:"星空背景、花瓣 / 泡泡、变身光带；正面偶像式站姿最稳。",
    demo:"magical girl mid-transformation, frilly pink dress with ribbons, glowing wand, floating stars and bubbles, pastel palette, cheerful pose" },

  { id:"G-10", zh:"妖怪 / 百鬼夜行", en:"Yokai & Hyakki Yagyo", cat:"幻想",
    kw:["yokai","paper lanterns","night parade","kitsune mask","torii gate","sumi-e influence","floating spirits"],
    desc:"日本特有妖怪谱系，氛围在「可爱」与「诡异」间摇摆。夏目友人帐式的温柔与千与千寻式的诡谲两条路。",
    scene:"神社鸟居、提灯长廊、百鬼夜行队列；暖橙灯光 + 冷夜色对比最强。",
    demo:"fox-masked girl among paper lanterns, yokai night parade, torii gate background, warm lantern glow against dark blue night, mystical atmosphere" },

  { id:"G-11", zh:"神话改编", en:"Mythology Retelling", cat:"幻想",
    kw:["greek mythology","norse mythology","constellation motifs","marble columns","gold ornament","divine light"],
    desc:"希腊 / 北欧 / 埃及神话视觉。关键是大量鎏金装饰与大理石建材，加上「神性光」与符号性构图。",
    scene:"神殿、星空、浮雕墙面；对称构图最能出神性。",
    demo:"goddess statue coming to life, greek marble temple, golden ornaments, constellation halo, symmetrical divine composition, dramatic light" },

  { id:"G-12", zh:"恶役千金 / 反转重生", en:"Villainess Reincarnation", cat:"幻想",
    kw:["villainess","regency dress","royal ballroom","chandelier","tea party","dramatic lighting","elegant frills"],
    desc:"女性向转生的标配：欧式宫廷裙、水晶灯舞会、茶会。关键词是「华丽但带一点算计的眼神」。",
    scene:"宫廷舞厅、玫瑰园、贵族学园；灯光偏暖蜡烛。",
    demo:"villainess in elaborate regency ballgown, royal ballroom with chandelier, confident smirk, candlelight glow, detailed lace and frills" },

  /* ---------- 科幻 / 未来 ---------- */
  { id:"G-13", zh:"赛博朋克", en:"Cyberpunk", cat:"科幻",
    kw:["cyberpunk","neon signs","rain-slicked streets","chrome prosthetics","holographic ads","dense cityscape","cyan magenta palette"],
    desc:"高密度都市 + 霓虹 + 阴雨天反光。几乎到了「发霉的半成品美学」：技术越先进，环境越脏。",
    scene:"狭窄巷道、雨夜屋顶、密密麻麻的霓虹广告；必加 reflections on wet ground。",
    demo:"cyberpunk street at night, dense neon signage, reflections on wet asphalt, lone figure with coat, cyan and magenta lights, light rain, cinematic" },

  { id:"G-14", zh:"VR / 游戏世界", en:"VRMMO & Game World", cat:"科幻",
    kw:["vrmmo","floating UI elements","hp bar","game hud","pixel interface","level up effects","stylized game assets"],
    desc:"把游戏 UI 拉进画面的玩法：半透明状态栏、技能栏、掉落提示。近年 UI 元素已成为独立审美。",
    scene:"悬浮 UI + 虚化的环境背景；注意别让 UI 挡住脸。",
    demo:"gamer avatar in fantasy field, translucent game UI overlay, hp bar and skill icons, level up particles, crisp modern anime colors" },

  { id:"G-15", zh:"宇宙歌剧 / 太空", en:"Space Opera", cat:"科幻",
    kw:["space opera","starship interior","nebula","starfield","zero gravity","spacesuit","bridge crew"],
    desc:"浩瀚尺度 + 舰船 + 星际政治叙事。核心是「深黑背景 + 冰冷的硬质感机械光源」。",
    scene:"舰桥、舷窗远景星球、陨石带；没有浊气，一切要 crisp。",
    demo:"starship bridge with huge viewport, lone figure watching nebula, cold blue instrument lights, crisp hard surface interior, vast starfield" },

  { id:"G-16", zh:"时间穿越 / 循环", en:"Time Travel & Loop", cat:"科幻",
    kw:["time travel","clock motifs","fractured clock face","chronostasis","split timeline","soft temporal glow"],
    desc:"时间是视觉符号：钟面、停滞的雨滴、双重曝光、位置上叠加的「过去的自己」。",
    scene:"教学楼天台、空无一人的街道、雨；用 double exposure 表达叠加。",
    demo:"girl on empty street with frozen raindrops, cracked clock face halo, double exposure of past self, nostalgic golden light, time loop atmosphere" },

  { id:"G-17", zh:"蒸汽朋克", en:"Steampunk", cat:"科幻",
    kw:["steampunk","brass gears","steam pipes","goggles","victorian dress","coal soot","warm sepia tones"],
    desc:"维多利亚时期的工业想象：黄铜齿轮、蒸汽、皮革护目镜、铆接结构。整体偏暖褐。",
    scene:"砖砌工厂、飞艇码头、齿轮机械室；暖色 + 金属质感。",
    demo:"inventor girl with brass goggles, steampunk workshop, detailed copper gears, steam vents, warm sepia industrial light, victorian clothing" },

  { id:"G-18", zh:"末世 / 废土", en:"Post-Apocalyptic", cat:"科幻",
    kw:["post-apocalyptic","overgrown ruins","rusted metal","dust haze","tattered clothing","abandoned city","survival gear"],
    desc:"文明崩坏后的世界：自然重新接管建筑。强调「锈蚀 + 植被 + 独行者」。",
    scene:"废弃城市、荒野公路、被藤蔓覆盖的校舍；强烈夕照或雾。",
    demo:"lone traveler on overgrown highway, rusted car wrecks, vines reclaiming asphalt, hazy golden sunset, dust particles, melancholic mood" },

  { id:"G-19", zh:"生化感染 / 幸存", en:"Zombie & Outbreak", cat:"科幻",
    kw:["zombie","infection","quarantine zone","bioluminescent spores","horde silhouette","desaturated cold palette"],
    desc:"《学园默示录》一脉。核心张力在「日常的残骸」：破败校舍 + 制服幸存者。",
    scene:"封锁带、废弃校舍、夜里发光的孢子；低饱和冷色。",
    demo:"two survivors in abandoned school hallway, tattered uniforms, glowing green spores drifting, cold desaturated light, barricade silhouettes" },

  /* ---------- 日常 / 情感 ---------- */
  { id:"G-20", zh:"校园日常", en:"School Life", cat:"日常情感",
    kw:["school life","classroom afternoon","sakura petals","school uniform","bicycle","rooftop","warm sunlight"],
    desc:"时间永远停在放学前的教室。必备元素：夕照教室、窗边座位、屋顶、单车、樱花。",
    scene:"教室窗边 or 屋顶水塔；夕阳光 + 长影最有效。",
    demo:"student napping by classroom window, warm afternoon sunset light, long shadows, chalk dust floating, school uniform, nostalgic calm mood" },

  { id:"G-21", zh:"治愈慢生活", en:"Healing Slice of Life", cat:"日常情感",
    kw:["slice of life","cozy interior","soft daylight","countryside","gentle expression","quiet composition"],
    desc:"低信息密度、低对比、大量空镜与柔和光影。画面应该能「呼吸」。",
    scene:"农村老家、咖啡店、被炉、雨 awning；自然光优先。",
    demo:"girl reading in sunlit tatami room, cozy cluttered interior, soft diffused daylight, potted plants, warm relaxed atmosphere, wide quiet composition" },

  { id:"G-22", zh:"恋爱 / 青春", en:"Romance", cat:"日常情感",
    kw:["romance","blushing","eye contact","shared umbrella","confession scene","cherry blossoms","soft focus background"],
    desc:"关键是「视线」与「距离」：对视、耳红、共享伞、指尖触碰。背景虚化。",
    scene:"樱花道、天台、烟花大会、车站；黄昏或夜晚最出味。",
    demo:"two students sharing umbrella in rain, blushing eye contact, soft focus bokeh streetlights, pink cheeks, gentle romantic atmosphere" },

  { id:"G-23", zh:"美食 / 料理", en:"Food & Cooking", cat:"日常情感",
    kw:["food art","steam rising","glossy sauce texture","kitchen interior","apron","gourmet closeup","appetizing colors"],
    desc:"食物是 AI 出图最容易崩的题材之一。关键在高光：酱汁反光、蒸汽、食材纹理。",
    scene:"木质厨桌、居酒屋、家庭厨房；暖光 + 浅景深。",
    demo:"steaming bowl of ramen on wooden counter, glossy broth highlight, rising steam, warm lantern light, appetizing closeup angle, detailed ingredients" },

  { id:"G-24", zh:"音乐 / 乐队", en:"Music & Band", cat:"日常情感",
    kw:["band performance","spotlight","stage lights","guitar","sheet music flying","crowd silhouette","energetic pose"],
    desc:"《孤独摇滚》一类：舞台灯、乐器细节、飞散乐谱、观众剪影。重点是「光的颗粒感」。",
    scene:"Live House、天台排练；顶光 + 薄雾最出效果。",
    demo:"guitarist mid-performance on small stage, sharp spotlights through haze, flying sheet music, crowd silhouettes below, energetic dynamic angle" },

  { id:"G-25", zh:"偶像 / 演艺", en:"Idol", cat:"日常情感",
    kw:["idol","frilly stage costume","confetti","cheerful smile","spiral spotlights","glitter particles","stick lights"],
    desc:"甜蜜感与华丽度拉到最大：荧光棒海洋、彩带、闪粉。色彩要饱和且明亮。",
    scene:"舞台中央、车站广告牌、后台；多用彩虹色光斑与高光。",
    demo:"idol group on bright stage, colorful frilly costumes, confetti and glitter particles, crowd light sticks sea, cheerful expressions, vivid pop lighting" },

  { id:"G-26", zh:"职场 / 社畜", en:"Working Adult", cat:"日常情感",
    kw:["office worker","business suit","neon konbini","late night train","desk clutter","tired expression","mug of coffee"],
    desc:"成年人的现实童话：西装、便利店夜光、末班车、堆积的文件。反差萌的来源。",
    scene:"办公室隔断、居酒屋、深夜电车；荧光灯的冷光。",
    demo:"tired office worker at cluttered desk late at night, blue monitor glow, empty coffee cups, city night through window, quiet melancholy" },

  /* ---------- 运动 / 竞技 ---------- */
  { id:"G-27", zh:"运动热血", en:"Sports", cat:"运动竞技",
    kw:["sports anime","sweat droplets","dynamic running pose","court or field","jersey number","dust kick-up","intense focus"],
    desc:"《排球少年》《灌篮高手》《蓝色监狱》：汗珠、护具、球场地胶、飞扬尘土，强调肌肉线条与「决定性一瞬」。",
    scene:"体育馆（背光灯）+ 球场透视线；用 low angle + motion blur。",
    demo:"volleyball player mid-spike above net, sweat droplets flying, indoor court with rim lights, dramatic low angle, motion blur on limbs, intense eyes" },

  { id:"G-28", zh:"竞速 / 机战载具", en:"Racing & Machines", cat:"运动竞技",
    kw:["racing","speed blur","road tunnel","vehicle bending light","helmet reflections","light trails"],
    desc:"速度 = 拉伸的背景 + 车灯光轨 + 头盔倒影。《头文字 D》《MF Ghost》。",
    scene:"山道、夜隧道、环道；必须写 motion blur + light trails。",
    demo:"sports car drifting through mountain pass at night, motion blur, streaking headlight trails, helmet reflections, dynamic angle, energetic composition" },

  /* ---------- 悬疑 / 黑暗 ---------- */
  { id:"G-29", zh:"推理 / 悬疑", en:"Mystery & Detective", cat:"悬疑黑暗",
    kw:["detective","raincoat","magnifying glass","evidence board","dutch angle","harsh shadows","noir lighting"],
    desc:"皱巴巴的西装 / 风衣 + 暗街 + 雨天黑色电影光。构图爱用倾斜与百叶窗式的条纹投影。",
    scene:"雨夜霓虹街、审讯室、旧馆library；低照度 + 单光源。",
    demo:"detective in trench coat under streetlamp, harsh shadows across face, rain, noir city background, dutch angle, muted cool palette" },

  { id:"G-30", zh:"恐怖 / 灵异", en:"Horror & Occult", cat:"悬疑黑暗",
    kw:["horror anime","liminal space","pale skin","unnatural shadows","dark hallway","subtle distortion","film grain"],
    desc:"日式恐怖靠氛围不靠血浆：违和的日常空间（阈限空间）、影子里的手、微妙失衡的比例。",
    scene:"长廊、无人教室、深夜便利店；用 heavy grain 与低饱和。",
    demo:"empty school hallway at night, liminal space feeling, single flickering fluorescent tube, long unnatural shadow, film grain, dread atmosphere" },

  { id:"G-31", zh:"都市怪谈 / 里世界", en:"Urban Legend / Backrooms", cat:"悬疑黑暗",
    kw:["urban legend","liminal space","backrooms","endless corridor","fluorescent hum","analog camera look","wrong proportions"],
    desc:"近年兴起的网络怪谈美学：无限走廊、黄色荧光灯、模拟摄像机质感、略微出错的尺度感。",
    scene:"黄褐色调的办公室、无限延伸的商场、VHS 画质；讲究「不合理空间」本身。",
    demo:"endless yellow office corridor, liminal space, buzzing fluorescent lights, worn carpet pattern, slightly wrong proportions, analog grain, unsettling" },

  /* ---------- 东方 / 国风 ---------- */
  { id:"G-32", zh:"仙侠 / 武侠国风", en:"Xianxia & Wuxia", cat:"东方国风",
    kw:["xianxia","hanfu","flying sword","cloud sea","mountain peaks","ink wash influence","daoist symbols"],
    desc:"国创主力题材：汉服、飞剑、符箓。独特之处在于「留白 + 云海 + 山水」的东方空间观，而不像西幻那样把画面填满。",
    scene:"云海山巅、竹林、宫殿飞檐；建议配合水墨感与留白构图。",
    demo:"cultivator standing on cloud sea peak, flowing white hanfu, flying sword beside, distant mountain ranges in mist, ink-influenced palette, epic vertical composition" }
];

/* ============================================================
 * 数据层 D：横切词条库
 * ============================================================ */
const VOCAB = [
  { id:"V-01", zh:"画质 / 渲染层级", en:"Quality & Resolution",
    items:[
      {t:"masterpiece", c:"神作，SD 系最通用的画质提升词"},
      {t:"best quality", c:"最高画质"},
      {t:"high resolution", c:"高分辨率"},
      {t:"ultra-detailed", c:"超精细，注意过度使用会让画面变脏"},
      {t:"absurdres", c:"超越画幅的细节度"},
      {t:"official art", c:"官方美术稿质感"},
      {t:"detailed background", c:"背景精细，避免背景被糊掉"},
      {t:"8k wallpaper", c:"壁纸向，适合做桌面大图"},
      {t:"newest", c:"SDXL / Illustrious 系专用，锁定较新的画风取向"},
      {t:"year 2024", c:"较新的视觉偏好（Illustrious / SDXL 适用）"}
    ]},

  { id:"V-02", zh:"镜头角度", en:"Camera Angle",
    items:[
      {t:"from below", c:"仰拍，制造压迫与英雄感"},
      {t:"from above", c:"俯拍，制造渺小与被窥视感"},
      {t:"dutch angle", c:"倾斜镜头，不安/动感"},
      {t:"over-the-shoulder", c:"过肩视角，叙事感强"},
      {t:"first-person view", c:"第一人称 POV"},
      {t:"bird's-eye view", c:"正俯视，类似地图视角"},
      {t:"worm's-eye view", c:"极端仰视，突出体量"},
      {t:"close-up", c:"特写，情绪强化"},
      {t:"extreme close-up", c:"极特写，眼瞳专用"},
      {t:"medium shot", c:"半身，最稳的默认景别"},
      {t:"full body", c:"全身"},
      {t:"establishing shot", c:"环境交代大远景"}
    ]},

  { id:"V-03", zh:"构图法则", en:"Composition",
    items:[
      {t:"rule of thirds", c:"三分法构图"},
      {t:"centered composition", c:"中心构图，权威/静止感"},
      {t:"symmetrical", c:"对称构图，神性与仪式感"},
      {t:"leading lines", c:"引导线，把视线引向主体"},
      {t:"negative space", c:"大量留白，海报感"},
      {t:"foreground framing", c:"前景框景，增加层次"},
      {t:"dynamic angle", c:"动态角度"},
      {t:"wide shot", c:"远景，强调环境"},
      {t:"dutch angle", c:"倾斜，不安定"},
      {t:"flat perspective", c:"扁平透视，装饰性强"}
    ]},

  { id:"V-04", zh:"光影处理", en:"Lighting",
    items:[
      {t:"rim light", c:"边缘光，分离主体与背景的万能词"},
      {t:"backlight", c:"逆光，氛围感首选"},
      {t:"volumetric lighting", c:"体积光/耶稣光"},
      {t:"god rays", c:"丁达尔光束"},
      {t:"soft light", c:"柔光，弱化瑕疵"},
      {t:"harsh shadows", c:"硬阴影，戏剧性强"},
      {t:"low key lighting", c:"暗调，画面整体压暗"},
      {t:"high key lighting", c:"高调，明亮通透"},
      {t:"golden hour", c:"黄金时刻，黄昏暖光"},
      {t:"blue hour", c:"蓝调时刻，日落后冷光"},
      {t:"candlelight", c:"烛光，暖且局促"},
      {t:"bioluminescence", c:"生物光，科幻/奇幻用"}
    ]},

  { id:"V-05", zh:"色调 / 氛围", en:"Color & Mood",
    items:[
      {t:"pastel palette", c:"粉彩低饱和，治愈系"},
      {t:"muted colors", c:"低饱和，写实/严肃向"},
      {t:"vivid colors", c:"高饱和，商业讨喜"},
      {t:"monochrome", c:"单色/黑白"},
      {t:"duotone", c:"双色调，海报感"},
      {t:"teal and orange", c:"青橙互补，电影工业标配"},
      {t:"warm palette", c:"暖色调"},
      {t:"cold palette", c:"冷色调"},
      {t:"desaturated", c:"褪色感，怀旧/末世"},
      {t:"high contrast", c:"强对比，冲击力"}
    ]},

  { id:"V-06", zh:"服装与道具", en:"Outfit & Props",
    items:[
      {t:"school uniform", c:"学生制服（泛指）"},
      {t:"sailor uniform", c:"水手服"},
      {t:"blazer", c:"西装外套/学院外套"},
      {t:"japanese school swimsuit", c:"死库水，慎用"},
      {t:"maid outfit", c:"女仆装"},
      {t:"nun costume", c:"修女服"},
      {t:"kimono", c:"和服"},
      {t:"hanfu", c:"汉服，国风核心词"},
      {t:"cheongsam / qipao", c:"旗袍"},
      {t:"armor", c:"铠甲"},
      {t:"military uniform", c:"军装"},
      {t:"hoodie", c:"连帽衫，现代休闲"},
      {t:"elaborate headdress", c:"华丽头饰，提升华丽度"},
      {t:"ribbon", c:"蝴蝶结"},
      {t:"goggles", c:"护目镜，蒸汽/机修"},
      {t:"frills", c:"荷叶边"}
    ]},

  { id:"V-07", zh:"表情与情绪", en:"Expression & Emotion",
    items:[
      {t:"smile", c:"微笑"},
      {t:"closed eyes", c:"闭眼笑，治愈感"},
      {t:"blush", c:"脸红"},
      {t:"tears", c:"流泪"},
      {t:"crying", c:"大哭"},
      {t:"angry", c:"愤怒"},
      {t:"smirk", c:"坏笑，腹黑/自信"},
      {t:"surprised", c:"惊讶"},
      {t:"scared", c:"恐惧"},
      {t:"determined look", c:"坚毅眼神，战斗系必备"},
      {t:"empty eyes", c:"无神，「发病」情绪"},
      {t:"looking at viewer", c:"直视观众，互动感"},
      {t:"looking away", c:"视线移开，羞涩/疏离"}
    ]},

  { id:"V-08", zh:"发型与发色", en:"Hair",
    items:[
      {t:"long hair", c:"长发"},
      {t:"short hair", c:"短发"},
      {t:"twintails", c:"双马尾"},
      {t:"drill hair", c:"钻头卷发"},
      {t:"ponytail", c:"马尾"},
      {t:"braid", c:"辫子"},
      {t:"bob cut", c:"波波头"},
      {t:"hime cut", c:"公主切"},
      {t:"blonde / silver / pink / blue / black hair", c:"常见发色"},
      {t:"gradient hair", c:"渐变发色"},
      {t:"hair ornament", c:"发饰"},
      {t:"floating hair", c:"头发飘动，增加空气感"}
    ]},

  { id:"V-09", zh:"眼部刻画", en:"Eyes",
    items:[
      {t:"detailed eyes", c:"眼睛精绘，通用提升点"},
      {t:"glossy eyes", c:"水润高光"},
      {t:"large eyes", c:"大眼"},
      {t:"sharp eyes", c:"锐利眼"},
      {t:"heterochromia", c:"异色瞳"},
      {t:"closed eyes", c:"闭眼"},
      {t:"wink", c:"眨眼"},
      {t:"eye reflection", c:"眼中倒影，增强真实感"},
      {t:"red / blue / green / golden eyes", c:"常见瞳色"},
      {t:"eyelashes", c:"睫毛细节"}
    ]},

  { id:"V-10", zh:"场景背景", en:"Background & Scene",
    items:[
      {t:"classroom", c:"教室"},
      {t:"rooftop", c:"天台"},
      {t:"shrine / torii", c:"神社/鸟居"},
      {t:"cherry blossom path", c:"樱花道"},
      {t:"rainy street", c:"雨街"},
      {t:"neon alley", c:"霓虹小巷"},
      {t:"cyberpunk cityscape", c:"赛博都市"},
      {t:"countryside", c:"田园"},
      {t:"bamboo forest", c:"竹林"},
      {t:"library", c:"图书馆"},
      {t:"train interior", c:"电车车厢"},
      {t:"ruined city", c:"废墟都市"},
      {t:"space station", c:"太空站"},
      {t:"underground dungeon", c:"地下城"},
      {t:"simple background", c:"纯简背景，抠图友好"},
      {t:"white background", c:"白底"},
      {t:"gradient background", c:"渐变背景"}
    ]},

  { id:"V-11", zh:"天气与时间", en:"Weather & Time",
    items:[
      {t:"sunny", c:"晴天"},
      {t:"cloudy", c:"阴天"},
      {t:"rain", c:"雨天"},
      {t:"snow", c:"雪天"},
      {t:"mist / fog", c:"雾"},
      {t:"sunset", c:"黄昏"},
      {t:"sunrise", c:"清晨"},
      {t:"night", c:"夜晚"},
      {t:"golden hour", c:"黄昏暖光时段"},
      {t:"blue hour", c:"日落后蓝调"},
      {t:"thunderstorm", c:"雷雨"},
      {t:"haru / summer", c:"季节暗示"}
    ]},

  { id:"V-12", zh:"特效与粒子", en:"FX & Particles",
    items:[
      {t:"particle effects", c:"粒子特效，万能提升词"},
      {t:"glowing particles", c:"发光粒子"},
      {t:"sakura petals", c:"樱花花瓣"},
      {t:"floating feathers", c:"飘落羽毛"},
      {t:"bubbles", c:"泡泡"},
      {t:"confetti", c:"彩带"},
      {t:"dust particles", c:"尘埃"},
      {t:"speed lines", c:"集中线/速度线"},
      {t:"impact frame", c:"冲击描红帧"},
      {t:"energy aura", c:"能量气场"},
      {t:"lens flare", c:"镜头光晕"},
      {t:"bokeh", c:"背景虚化光斑"},
      {t:"chromatic aberration", c:"色散，赛博必备"},
      {t:"motion blur", c:"运动模糊"},
      {t:"film grain", c:"胶片颗粒"}
    ]},

  { id:"V-13", zh:"姿势与动态", en:"Pose & Motion",
    items:[
      {t:"standing", c:"站立"},
      {t:"sitting", c:"坐姿"},
      {t:"walking", c:"行走"},
      {t:"running", c:"奔跑"},
      {t:"jumping", c:"跳跃"},
      {t:"dynamic pose", c:"动态姿势"},
      {t:"contrapposto", c:"对立式平衡站姿"},
      {t:"arms crossed", c:"抱臂"},
      {t:"hand on hip", c:"叉腰"},
      {t:"looking back over shoulder", c:"回眸"},
      {t:"mid-air", c:"滞空"}
    ]},

  { id:"V-14", zh:"画幅与格式", en:"Aspect & Format",
    items:[
      {t:"--ar 16:9", c:"MJ / Niji：宽屏壁纸与视频向"},
      {t:"--ar 2:3", c:"MJ：竖版插画通用"},
      {t:"--ar 3:4", c:"MJ：竖版偏方"},
      {t:"--ar 9:16", c:"MJ：手机壁纸 / 竖屏短视频"},
      {t:"--niji 6", c:"MJ：二次元专用模型"},
      {t:"--style raw", c:"MJ v6：减弱默认美化"},
      {t:"--sref", c:"MJ：风格参考（后接 URL）"},
      {t:"--cref", c:"MJ：角色一致性参考"},
      {t:"--c / --chaos", c:"MJ：多样性控制"},
      {t:"1216x832", c:"SDXL 常用宽屏分辨率"},
      {t:"832x1216", c:"SDXL 常用竖版分辨率"},
      {t:"1024x1024", c:"Flux / SDXL 正方裸比例"}
    ]}
];

if (typeof module !== "undefined" && module.exports) module.exports = { GENRES, VOCAB };
