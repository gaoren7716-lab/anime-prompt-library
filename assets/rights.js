/* ============================================================
 * rights.js · 授权分级与商用边界（唯一真源）
 * ============================================================
 * 为什么要这一层：
 *   本库 338 条目里有两类性质完全不同的内容——
 *     一类是通用技法与画风描述（赛璐璐平涂、构图法则、色彩心理），
 *       这类是人类共通的知识沉淀，不指向任何人的著作权；
 *     另一类直接引用了他人的作品与创作者（机动战士高达、akira toriyama style、
 *       宫崎骏、押井守…），这些名称本身就是受保护标识。
 *   两者混在一张表里、不做标记，等于把「知识」和「他人标识」当同一种东西授权出去。
 *
 * 四档分级（不是布尔「能不能商用」，因为法律判断随场景变）：
 *
 *   R0  自由          通用技法与客观描述，不含他人标识。可直接商用。
 *   R1  署名          指向已故创作者或明确进入公有领域的作者风格。
 *                     可商用，但署名是道德义务而非可选。
 *   R2  仅参考        在世创作者姓名、工作室名、品牌名、仍在版权期内的作品名。
 *                     学习和研究随便用，商用出图必须先去掉标识。
 *   R3  禁止直接商用  明确受保护的 IP 名称。
 *                     库内保留是为了「研究这套视觉语言」，
 *                     但绝不建议直接送进商业出图流程。
 *
 * 一条不能含糊的规矩：
 *   **等级只管标识，不管画法。**
 *   「像高达那样画」和「画一个白色巨型机器人」在法律上完全不同——
 *   前者指向受保护的角色设定与作品标识，后者只是通用描述。
 *   所以 R3 条目不是禁用的，是**必须改写后使用**的。
 *   deIdentify() 就是这条路径的官方实现。
 *
 * 判定依据必须可查：每条等级都要有 reason，
 * 不允许「凭感觉标个 R2」这种无法复核的判断。
 * ============================================================ */

var RIGHTS = (function () {

  /* ---------- 1. 四档定义 ---------- */
  var TIERS = {
    R0: {
      id: "R0",
      zh: "自由",
      commercial: "ok",
      tone: "ok",
      rule: "通用技法、构图、色彩、材质描述，不含任何他人标识。可直接商用。",
      requirement: "无需条件。"
    },
    R1: {
      id: "R1",
      zh: "署名",
      commercial: "ok-with-credit",
      tone: "info",
      rule: "指向已故创作者的风格特征，或已进入公有领域的历史流派。",
      requirement: "商用时必须署名原作者。库内默认已在署名层登记。"
    },
    R2: {
      id: "R2",
      zh: "仅参考",
      commercial: "rewrite-first",
      tone: "warn",
      rule: "在世创作者姓名、工作室名、品牌名。可学习研究，商用出图前必须先去掉标识。",
      requirement: "走 deIdentify() 改写后再用；或确认该名称已不构成商标性使用（需自行判断）。"
    },
    R3: {
      id: "R3",
      zh: "禁止直接商用",
      commercial: "blocked",
      tone: "danger",
      rule: "明确受保护的 IP 名称与角色设定。保留用于研究视觉语言，商用必须改写。",
      requirement: "必须走 deIdentify()；商业交付物中不得出现原 IP 名与角色名。"
    }
  };

  /* ---------- 2. 标识清单：出现即触发降级 ---------- */
  /* 第一层是「按词判定」而不是「按条目判定」。
     因为同一条目里可能既有自由描述也有他人标识（desc 说技法，demo 写高达），
     条目级打标会漏掉另一半。逐词扫描才不会漏。

     kind 说明：
       creator  在世创作者姓名      → 强制 R2
       deceased 已故创作者          → 强制 R1
       studio   工作室 / 公司名     → 强制 R2
       brand    品牌 / 平台名       → 强制 R2
       ip       作品 IP / 角色名    → 强制 R3

     nounOnly 标记：这个词本身也是常用英文名词（shaft=光柱、eva=夏娃、armor=铠甲）。
     命中常用义时不降级，只有出现在创作语境（紧邻 style / 像某某作品）才算标识。
     不加这个标记，"a shaft of light across the room" 会被判成 R2——
     这种误报比漏报更糟，它会让用户不再信任整套判定。 */
  var MARKERS = [
    /* --- 在世创作者（中英双写） --- */
    { t: "akira toriyama", kind: "creator", zh: "鸟山明" },
    { t: "eiichiro oda", kind: "creator", zh: "尾田荣一郎" },
    { t: "satoshi kon", kind: "creator", zh: "今敏" },
    { t: "miyazaki", kind: "creator", zh: "宫崎骏" },
    { t: "monkey punch", kind: "creator", zh: "MONKEY PUNCH" },
    { t: "hayao miyazaki", kind: "creator", zh: "宫崎骏" },
    { t: "mamoru oshii", kind: "creator", zh: "押井守" },
    { t: "hideaki anno", kind: "creator", zh: "庵野秀明" },
    { t: "makoto shinkai", kind: "creator", zh: "新海诚" },
    { t: "guy edwards", kind: "creator", zh: "盖·爱德华兹" },
    { t: "lotte reiniger", kind: "creator", zh: "洛特·雷尼格", deceased: true },
    { t: "lotter reiniger", kind: "creator", zh: "洛特·雷尼格（错写）", deceased: true },

    /* --- 已故创作者：进公有领域，署名即可 --- */
    { t: "osamu tezuka", kind: "creator", zh: "手冢治虫", deceased: true },
    { t: "leonardo da vinci", kind: "creator", zh: "达·芬奇", deceased: true },

    /* --- 工作室 / 公司 --- */
    { t: "studio ghibli", kind: "studio", zh: "吉卜力工作室" },
    { t: "ghibli", kind: "studio", zh: "吉卜力" },
    { t: "kyoani", kind: "studio", zh: "京阿尼" },
    /* shaft 也是普通名词（光柱），需要创作语境才判R2 */
    { t: "shaft", kind: "studio", zh: "Shaft", needCtx: true },
    { t: "madhouse", kind: "studio", zh: "Madhouse", needCtx: true },
    { t: "ufotable", kind: "studio", zh: "ufotable" },
    { t: "studio trigger", kind: "studio", zh: "Trigger" },
    /* 裸词 trigger 必须带语境要求：
       它也是极常见的普通英文词（trigger a reaction / the trigger），
       无条件命中会把满库英文句子判成 R2。
       中文表有「扳机社」而英文表只有 "studio trigger" 时，
       "like Trigger style" 会整个扫不出来 —— 同一实体两种语言
       覆盖不同步，等于英文写法的风险没人管（实测踩过）。
       needCtx 让 "Trigger style/风格" 这类才命中。 */
    { t: "trigger", kind: "studio", zh: "Trigger", needCtx: true },
    { t: "studio bones", kind: "studio", zh: "BONES" },
    { t: "mappa", kind: "studio", zh: "MAPPA", needCtx: true },
    { t: "cloverworks", kind: "studio", zh: "CloverWorks" },
    { t: "science saru", kind: "studio", zh: "Science SARU" },
    { t: "cartoon saloon", kind: "studio", zh: "Cartoon Saloon" },
    /* sunrise 极常用（sunrise lighting），必须要求创作语境 */
    { t: "sunrise", kind: "studio", zh: "SUNRISE", needCtx: true },
    { t: "toei animation", kind: "studio", zh: "东映动画" },
    { t: "tatsunoko", kind: "studio", zh: "龙之子" },

    /* --- 品牌 / 平台 --- */
    { t: "hoyoverse", kind: "brand", zh: "米哈游 HoYoverse" },
    { t: "cartoon network", kind: "brand", zh: "Cartoon Network" },
    { t: "disney", kind: "brand", zh: "迪士尼" },
    { t: "adult swim", kind: "brand", zh: "Adult Swim" },
    { t: "pixar", kind: "brand", zh: "皮克斯" },
    { t: "ghibli-esque", kind: "brand", zh: "吉卜力风" },

    /* --- 作品 IP 与角色（只列提示词里真正会写出来的） --- */
    /* akira 兼作人名，但那是日语人名用法，在AI 绘画提示词里几乎不出现。
       保留 needCtx 会让 "akira-style" 这类最典型的致敬写法反而漏判（实测踩过），
       所以不设 needCtx——宁可对真人人名多判一次，那不在本库的威胁范围内。 */
    { t: "akira", kind: "ip", zh: "阿基拉" },
    { t: "gundam", kind: "ip", zh: "机动战士高达" },
    { t: "evangelion", kind: "ip", zh: "新世纪福音战士" },
    /* eva 是西语女名「夏娃」，akira 是常见日文男名。
       只有带创作后缀（-style / -esque / like）时才当标识。 */
    { t: "eva", kind: "ip", zh: "EVA", needCtx: true },
    { t: "dragon ball", kind: "ip", zh: "龙珠" },
    { t: "one piece", kind: "ip", zh: "海贼王" },
    { t: "naruto", kind: "ip", zh: "火影忍者" },
    { t: "bleach", kind: "ip", zh: "死神" },
    { t: "macross", kind: "ip", zh: "超时空要塞" },
    { t: "cowboy bebop", kind: "ip", zh: "星际牛仔" },
    { t: "spirited away", kind: "ip", zh: "千与千寻" },
    { t: "totoro", kind: "ip", zh: "龙猫" },
    { t: "howl", kind: "ip", zh: "哈尔的移动城堡", needCtx: true },
    { t: "death note", kind: "ip", zh: "死亡笔记" },
    { t: "eureka seven", kind: "ip", zh: "Eureka Seven" },
    { t: "mushishi", kind: "ip", zh: "虫师" },
    { t: "utena", kind: "ip", zh: "少女革命", needCtx: true },
    { t: "in the shell", kind: "ip", zh: "攻壳机动队" },
    { t: "demon slayer", kind: "ip", zh: "鬼灭之刃" },
    { t: "jojo", kind: "ip", zh: "JOJO" },
    { t: "rick and morty", kind: "ip", zh: "瑞克和莫蒂" },
    { t: "cuphead", kind: "ip", zh: "茶杯头" },
    { t: "sailor moon", kind: "ip", zh: "美少女战士" },
    { t: "pokemon", kind: "ip", zh: "宝可梦" },
    { t: "dragon ball z", kind: "ip", zh: "龙珠Z" },
    { t: "gundam seed", kind: "ip", zh: "高达SEED" },
    { t: "mob psycho", kind: "ip", zh: "灵能百分百" },
    { t: "shingeki", kind: "ip", zh: "进击的巨人" },
    { t: "chainsaw man", kind: "ip", zh: "电锯人" },
    { t: "sword art online", kind: "ip", zh: "刀剑神域" },
    { t: "love live", kind: "ip", zh: "Love Live" },
    { t: "idolmaster", kind: "ip", zh: "偶像大师" },
    { t: "initial d", kind: "ip", zh: "头文字D" },
    { t: "slam dunk", kind: "ip", zh: "灌篮高手" },
    { t: "ghost in the shell", kind: "ip", zh: "攻壳机动队" },
    /* 不再单列 "totoro-like" / "akira" 这类构词形态：
       scan 的后缀分支（-style / -esque / -like）已经能识别，
       在标识表里重复登记会让同一段文本报出两条命中，
       体检脚本的「无重复登记」断言就是被它触发的。 */
  ];

  /* ---------- 3. 去标识化替换表 ---------- */
  /* 只给「视觉等价描述」，不给弱化版。
     「akira toriyama style」→「muscular shonen proportions」不是缩水：
     前者是标识，后者是真正能落到画面上的特征，模型认的是后者。

     顺序重要：先替长短语再替单词，
     否则 "dragon ball z" 会先被 "dragon ball" 吃掉，留下一个孤零零的 "z"。 */
  var REWRITE = [
    ["akira toriyama style", "muscular shonen proportions, rounded jaw, spiky upward hair silhouette"],
    ["eiichiro oda style", "long flowing coat over slim proportions, expressive adventure-worn look"],
    ["satoshi kon style", "painted background realism with shallow-focus live action framing"],
    ["miyazaki style", "hand-painted soft gouache backgrounds, rounded gentle character shapes"],
    ["hayao miyazaki style", "hand-painted soft gouache backgrounds, rounded gentle character shapes"],
    ["monkey punch style", "thin angular faces, loose jittery linework, sparse watercolor flats"],
    ["lotte reiniger style", "silhouette animation with flat cut-paper shapes and crisp internal contours"],
    ["lotter reiniger style", "silhouette animation with flat cut-paper shapes and crisp internal contours"],
    ["osamu tezuka style", "large expressive round eyes, simplified rounded forms, elastic gesture"],
    ["studio ghibli", "hand-painted soft gouache backgrounds, rounded gentle character shapes"],
    ["ghibli-esque", "hand-painted soft gouache backgrounds, rounded gentle character shapes"],
    ["ghibli", "hand-painted soft gouache backgrounds, rounded gentle character shapes"],
    ["kyoani", "clean geometric layouts, flat pastel fills, rounded simplified figures"],
    ["science saru", "eccentric wide-angle distortion, muddy textured gouache"],
    ["shaft", "sharp angular linework, dense symbolic overlays, high-contrast neon accents"],
    ["madhouse", "detailed dense linework, muted urban palette, restrained shading"],
    ["ufotable", "high-density action staging with motion-smear trails and rim lighting"],
    ["studio trigger", "thick geometric shapes, explosive radial compositions, aggressive silhouettes"],
    ["studio bones", "clean skeletal linework, high-contrast limited palette, dynamic posing"],
    ["mappa", "aggressive thick outlines, heavy shadow masses, energetic angular staging"],
    ["cloverworks", "soft rounded character forms, layered pastel backgrounds, delicate line quality"],
    ["cartoon saloon", "flat vector shapes, limited muted palette, folk-art hatching"],
    ["sunrise", "hard surface mechanical detail, orthographic lineup presentation"],
    ["toei animation", "vivid flat cel color, thick confident outlines, dynamic action poses"],
    ["tatsunoko", "vivid flat cel color, thick confident outlines, dynamic action poses"],
    ["hoyoverse", "clean luminous rendering, symmetrical ornament, soft bloom highlights"],
    ["cartoon network", "bold flat shapes, thick outlines, exaggerated squash-and-stretch"],
    ["disney renaissance", "soft airbrush shading, luminous eyes, warm cinematic lighting"],
    ["adult swim", "flat limited palette, deadpan staging, sparse backgrounds"],
    ["pixar", "soft rounded 3D forms, luminous eyes, warm cinematic lighting"],
    ["dragon ball z", "muscular shonen proportions, spiky upward hair silhouette, energy aura"],
    ["dragon ball", "muscular shonen proportions, spiky upward hair silhouette, energy aura"],
    ["gundam seed", "hard surface angular armor, luminous eye visor, orthographic stance"],
    ["gundam", "hard surface angular armor, luminous eye visor, orthographic stance"],
    ["evangelion", "long limbed angular mech silhouette, extreme black and violet contrast"],
    ["eva", "long limbed angular mech silhouette, extreme black and violet contrast"],
    ["cowboy bebop", "muted noir palette, hard rim light, smoky atmospheric haze"],
    ["spirited away", "dense ornate folk ornament, warm lantern glow, painted spirit creatures"],
    ["howl", "ornate flowing silhouettes, warm hearth glow, dense decorative patterning"],
    ["totoro-like", "large rounded creature silhouette, soft mossy texture, dappled forest light"],
    ["totoro", "large rounded creature silhouette, soft mossy texture, dappled forest light"],
    /* 构词后缀写法：先剥掉后缀再替换主体，
       否则 "akira-style" 会被当成完整短语匹配不到。 */
    ["akira", "dense urban dystopian detail, heavy industrial signage"],
    ["death note", "stark monochrome composition, sharp vertical figure, cold room light"],
    ["macross", "transforming variable silhouette swept hard-suit panels, missile light trails"],
    ["demon slayer", "dark patterned haori against hard-edged blade forms, ember-lit night"],
    ["one piece", "rubber-limbed elastic action silhouette, bright saturated adventure palette"],
    ["naruto", "spiky hair silhouette with swirling orange energy ribbons"],
    ["bleach", "sword-bearing lean silhouette with stark black and white contrast"],
    ["eureka seven", "luminous coral-palette mecha with layered mechanical surface detail"],
    ["mushishi", "muted earthy palette, soft organic shapes, dense mossy texture"],
    ["utena", "abstract geometric staging, steep perspective, saturated primary contrast"],
    ["in the shell", "cybernetic silhouette in dark industrial palette, neon rim light"],
    ["rick and morty", "flat smeared pastel palette, lanky asymmetric character shapes"],
    ["cuphead", "1930s rubber-hose character construction, sepia-and-cream palette"],
    ["jojo bizarre adventure", "high fashion angular silhouette, dramatic pose, saturated contrast"],
    ["jojo", "high fashion angular silhouette, dramatic pose, saturated contrast"],
    ["slam dunk", "90s sports manga kinetic lines, saturated warm court palette"],
    ["shingeki", "colossal segmented armor silhouette, hard shadow, military staging"],
    ["chainsaw man", "diagonal high-contrast manga staging, single heavy shadow"],
    ["idolmaster", "clean idol-staged composition, bright idol palette, symmetric staging"],
    /* ---- 以下为全库体检后补齐的缺口 ---- */
    ["miyazaki", "hand-painted soft gouache backgrounds, rounded gentle character shapes"],
    ["monkey punch", "thin angular faces, loose jittery linework, sparse watercolor flats"],
    ["satoshi kon", "painted background realism with shallow-focus live action framing"],
    ["lotte reiniger", "silhouette animation with flat cut-paper shapes and crisp internal contours"],
    ["lotter reiniger", "silhouette animation with flat cut-paper shapes and crisp internal contours"],
    ["disney", "soft airbrush shading, luminous eyes, warm cinematic lighting"],
    ["osamu tezuka", "large expressive round eyes, simplified rounded forms, elastic gesture"],
    ["makoto shinkai", "luminous atmospheric perspective, soft volumetric light, detailed skies"],
    ["sailor moon", "magical-girl transformation sparkle, ribboned sailor collar, pastel cosmic accents"],
    ["pokemon", "creature-collecting adventure styling, rounded mascot shapes, vivid type-colored accents"],
    ["ghost in the shell", "cybernetic silhouette in dark industrial palette, neon rim light"],
    ["sword art online", "dark fantasy armor detail, glowing interface overlays, floating medieval-fantasy props"],
    ["mob psycho", "soft pastel psychic aura, simplified expressive forms, suburban grotesque staging"],
    ["sailor moon-like", "magical-girl transformation sparkle, ribboned sailor collar, pastel cosmic accents"],

    /* ---- 4. 裸姓氏 / 裸名 ----
       为什么必须有这一段：去标识化是按表逐条匹配的，
       表里只有 "akira toriyama" 时，遇到 "Akira Toriyama 式"
       （中文后缀，整条匹配不上）会退而命中更短的 "akira"，
       结果 "Toriyama" 原地留下 —— 句子看着改完了，标识还在。

       这类残留比不替换更危险：不替换会触发 leftover 警告，
       残留则安静通过，用户据此认为可以商用。
       所以凡是 MARKERS 里出现的全名，这里都要有对应的姓氏条目。

       姓氏条目放在全名单词的后面：先替全名再替姓氏，
       "akira toriyama" 才不会被拆成 "特征词 toriyama"。 */
    ["toriyama", "muscular shonen proportions, rounded jaw, spiky upward hair silhouette"],
    /* 全名的裸形式。表里原本只有 "akira toriyama style" 这种带 style 的写法，
       遇到「Akira Toriyama 式」（中文后缀）整条匹配不上，
       只能退而命中更短的 "akira"，于是 "Toriyama 式" 留在原地。
       裸全名必须单列，否则中文写法永远只能替一半。 */
    ["akira toriyama", "muscular shonen proportions, rounded jaw, spiky upward hair silhouette"],
    ["eiichiro oda", "long flowing coat over slim proportions, expressive adventure-worn look"],
    ["satoshi kon", "painted background realism with shallow-focus live action framing"],
    ["hayao miyazaki", "hand-painted soft gouache backgrounds, rounded gentle character shapes"],
    ["mamoru oshii", "precise mechanical background detail, cool observational framing"],
    ["hideaki anno", "high contrast shadow shapes, rotational action staging, dense symbolic overlays"],
    ["makoto shinkai", "luminous atmospheric perspective, soft volumetric light, detailed skies"],
    ["guy edwards", "distorted wide-angle space, deep perspective interiors"],
    ["osamu tezuka", "large expressive round eyes, simplified rounded forms, elastic gesture"],
    ["lotte reiniger", "silhouette animation with flat cut-paper shapes and crisp internal contours"],
    ["lotter reiniger", "silhouette animation with flat cut-paper shapes and crisp internal contours"],
    ["leonardo da vinci", "soft sfumato modeling, warm translucent glazing, quiet tonal balance"],
    ["oda", "long flowing coat over slim proportions, expressive adventure-worn look"],
    ["kon", "painted background realism with shallow-focus live action framing"],
    ["oshii", "precise mechanical background detail, cool observational framing"],
    ["anno", "high contrast shadow shapes, rotational action staging, dense symbolic overlays"],
    ["shinkai", "luminous atmospheric perspective, soft volumetric light, detailed skies"],
    ["edwards", "distorted wide-angle space, deep perspective interiors"],
    ["tezuka", "large expressive round eyes, simplified rounded forms, elastic gesture"],
    ["miyazaki", "hand-painted soft gouache backgrounds, rounded gentle character shapes"],
    /* 迪士尼的 "Walt"：disney 被替掉后 Walt 会孤零零挂着。
       视觉上 Walt 不构成标识，但留着会让人以为漏改了。 */
    ["walt disney", "soft airbrush shading, luminous eyes, warm cinematic lighting"],
    ["walt", "soft airbrush shading, luminous eyes, warm cinematic lighting"],
    ["reiniger", "silhouette animation with flat cut-paper shapes and crisp internal contours"],
    ["monkey punch", "thin angular faces, loose jittery linework, sparse watercolor flats"],
    ["punch", "thin angular faces, loose jittery linework, sparse watercolor flats"]
  ];

  /* ---------- 2b. 中文标识表 ---------- */
  /* 为什么必须单列：
     英文扫描扫不到中文 IP 名。全库体检时发现 WORKS 层 233 条里
     有 193 条被判R0——因为「机动战士高达」「龙珠」这类名称只在 zh / desc 里，
     而当时只扫了英文。结果是「作品层几乎全绿」这个假象。

     中文没有词边界问题（没有空格），子串匹配即可，
     但要注意「死神」这类词在中文里也有普通含义（死神=grim reaper），
     所以标成 needCtx 要求紧邻「风格/系/流/画风」等创作语境。 */
  var MARKERS_ZH = [
    /* 在世创作者 */
    { t: "鸟山明", kind: "creator", zh: "鸟山明" },
    { t: "尾田荣一郎", kind: "creator", zh: "尾田荣一郎" },
    { t: "宫崎骏", kind: "creator", zh: "宫崎骏" },
    { t: "今敏", kind: "creator", zh: "今敏" },
    { t: "押井守", kind: "creator", zh: "押井守" },
    { t: "新海诚", kind: "creator", zh: "新海诚" },
    { t: "新房昭之", kind: "creator", zh: "新房昭之" },
    { t: "汤浅政明", kind: "creator", zh: "汤浅政明" },
    { t: "手冢治虫", kind: "creator", zh: "手冢治虫", deceased: true },

    /* 已故创作者 */
    { t: "洛特·雷尼格", kind: "creator", zh: "洛特·雷尼格", deceased: true },

    /* 工作室 / 品牌 */
    { t: "吉卜力", kind: "studio", zh: "吉卜力工作室" },
    { t: "京阿尼", kind: "studio", zh: "京都动画" },
    { t: "飞碟社", kind: "studio", zh: "ufotable" },
    { t: "扳机社", kind: "studio", zh: "TRIGGER" },
    { t: "骨头社", kind: "studio", zh: "BONES" },
    { t: "卡牌", kind: "studio", zh: "" },
    { t: "迪士尼", kind: "brand", zh: "迪士尼" },
    { t: "皮克斯", kind: "brand", zh: "皮克斯" },

    /* 作品 IP（中文） */
    { t: "机动战士", kind: "ip", zh: "机动战士高达" },
    { t: "高达", kind: "ip", zh: "高达" },
    { t: "龙珠", kind: "ip", zh: "龙珠" },
    { t: "海贼王", kind: "ip", zh: "海贼王" },
    { t: "火影", kind: "ip", zh: "火影忍者" },
    { t: "死神", kind: "ip", zh: "死神", needCtx: true },
    { t: "超时空要塞", kind: "ip", zh: "超时空要塞" },
    { t: "星际牛仔", kind: "ip", zh: "星际牛仔" },
    { t: "千与千寻", kind: "ip", zh: "千与千寻" },
    { t: "哈尔的移动城堡", kind: "ip", zh: "哈尔的移动城堡" },
    { t: "死亡笔记", kind: "ip", zh: "死亡笔记" },
    { t: "攻壳机动队", kind: "ip", zh: "攻壳机动队" },
    { t: "鬼灭之刃", kind: "ip", zh: "鬼灭之刃" },
    { t: "灌篮高手", kind: "ip", zh: "灌篮高手" },
    { t: "猫眼三姐妹", kind: "ip", zh: "猫眼三姐妹" },
    { t: "阿童木", kind: "ip", zh: "铁臂阿童木" },
    { t: "哆啦a梦", kind: "ip", zh: "哆啦A梦" },
    { t: "数码宝贝", kind: "ip", zh: "数码宝贝" },
    { t: "精灵旅", kind: "ip", zh: "精灵旅三人组" },
    { t: "新世纪福音战士", kind: "ip", zh: "EVA" },
    { t: "福音战士", kind: "ip", zh: "EVA" },
    { t: "进击的巨人", kind: "ip", zh: "进击的巨人" },
    { t: "电锯人", kind: "ip", zh: "电锯人" },
    { t: "剑与远征", kind: "ip", zh: "" },
    { t: "宝可梦", kind: "ip", zh: "宝可梦" },
    { t: "美少女战士", kind: "ip", zh: "美少女战士" },
    { t: "七龙珠", kind: "ip", zh: "龙珠" },
    { t: "浪客剑心", kind: "ip", zh: "浪客剑心" },
    { t: "排球少年", kind: "ip", zh: "排球少年" },
    { t: "蓝色监狱", kind: "ip", zh: "蓝色监狱" },
    { t: "咒术回战", kind: "ip", zh: "咒术回战" },
    { t: "间谍过家家", kind: "ip", zh: "间谍过家家" },
    { t: "鬼灭", kind: "ip", zh: "鬼灭之刃" },
    { t: "鲁邦三世", kind: "ip", zh: "鲁邦三世" },
    { t: "宇宙战舰", kind: "ip", zh: "宇宙战舰大和" },
    { t: "头文字d", kind: "ip", zh: "头文字D" },
    { t: "灌篮", kind: "ip", zh: "灌篮高手" },
    { t: "足球小将", kind: "ip", zh: "足球小将" },
    { t: "蜡笔小新", kind: "ip", zh: "蜡笔小新" },
    { t: "樱桃小丸子", kind: "ip", zh: "樱桃小丸子" },
    { t: "钢之炼金术师", kind: "ip", zh: "钢之炼金术师" },
    { t: "进击", kind: "ip", zh: "进击的巨人" }
  ];

  /* 中文创作语境后缀：跟在标识后面才判定为「引用」而非普通词。 */
  var CTX_ZH = /^(风格|系|流|画风|式|版|制作|动画|的|、|，|：|\s|\-|—)/;

  /* ---------- 2c. 中文去标识化替换 ---------- */
  /* 只给视觉等价描述。中文档名替换后要接得通句子，
     所以这里给的是可以直接顶替名词位置的短语。 */
  var REWRITE_ZH = [
    ["鸟山明", "夸张肌肉块与尖刺上扬发型"],
    ["尾田荣一郎", "修长身形与飘扬长外套"],
    ["宫崎骏", "手绘柔彩背景与圆润温和造型"],
    ["今敏", "实景级景深背景与写实取景"],
    ["押井守", "冷静机械质感与高对比暗部"],
    ["新海诚", "通透大气透视与柔和体积光"],
    ["新房昭之", "锐利棱线与霓虹高对比"],
    ["汤浅政明", "夸张广角畸变与粗粝质感"],
    ["手冢治虫", "大而富于表现力的圆眼与弹性造型"],
    ["洛特·雷尼格", "剪纸平面轮廓与清晰内缘"],
    ["吉卜力", "手绘柔彩背景与圆润温和造型"],
    ["京阿尼", "干净几何构图与淡彩平涂"],
    ["飞碟社", "高密度动作编排与运动拖影"],
    ["扳机社", "厚重几何造型与爆发式放射构图"],
    ["骨头社", "干净骨架线稿与高对比限色"],
    ["迪士尼", "柔化喷枪上色与电影感暖光"],
    ["皮克斯", "圆润立体造型与温暖电影光"],
    ["机动战士高达", "硬表面棱角装甲与平视机械站姿"],
    ["高达", "硬表面棱角装甲与平视机械站姿"],
    ["龙珠", "夸张肌肉块与尖刺上扬发型"],
    ["七龙珠", "夸张肌肉块与尖刺上扬发型"],
    ["海贼王", "橡胶感弹性动作与明亮饱和冒险配色"],
    ["火影忍者", "尖刺发型与橙色能量漩涡"],
    ["火影", "尖刺发型与橙色能量漩涡"],
    ["超时空要塞", "可变变形硬质装甲与导弹光轨"],
    ["星际牛仔", "低饱和黑色电影配色与硬边缘光"],
    ["千与千寻", "浓重民俗纹样与暖色灯笼光"],
    ["哈尔的移动城堡", "繁复飘动轮廓与暖色炉火光"],
    ["死亡笔记", " stark黑白构图与冷调室内光"],
    ["攻壳机动队", "暗色工业配色下的机械轮廓与霓虹边光"],
    ["鬼灭之刃", "夜色暖光下的繁复羽织纹样与硬边刀身"],
    /* "鬼灭" 是 "鬼灭之刃" 的前缀，必须同表登记。
       替换表按长→短执行（这一条排在鬼灭之刃之后，正好命中短的那个），
       否则中文档名会出现"鬼灭之刃" 被吃掉、句尾留一个孤零零的"鬼灭"。 */
    ["鬼灭", "夜色暖光下的繁复羽织纹样与硬边刀身"],
    ["灌篮高手", "运动线与暖色球馆配色"],
    ["阿童木", "圆润简化造型与弹性手势"],
    ["哆啦a梦", "圆润机械造型与明亮糖果色"],
    ["数码宝贝", "发光数码纹样与深色冒险者剪影"],
    ["新世纪福音战士", "长肢棱角机械剪影与黑紫极端对比"],
    ["福音战士", "长肢棱角机械剪影与黑紫极端对比"],
    ["进击的巨人", "巨型分段装甲剪影与硬投影"],
    ["电锯人", "强对比漫画式斜线构图与单块重阴影"],
    ["宝可梦", "圆润吉祥物造型与鲜明属性色点缀"],
    ["美少女战士", "变身闪光与缎带水手领"],
    ["咒术回战", "暗色都市背景下的咒力特效与紧绷肢体"],
    ["钢之炼金术师", "暖黄铜色调的炼金阵纹样与兄弟并肩构图"],
    ["进击", "巨型分段装甲剪影与破墙烟尘"],
    ["排球少年", "运动线与体育馆暖色地胶反光"],
    ["蓝色监狱", "高对比冷蓝球场与动态剪影"],
    ["灌篮", "运动线与暖色球馆配色"]
  ];

  /* ---------- 4. 逐词判定 ---------- */
  function norm(s) {
    return String(s == null ? "" : s).toLowerCase();
  }

  /* 找出文本里出现的全部标识。

     边界与语境是配套的一条规则，不能分开看：
       连字符（akira-style、eva-esque）恰恰是最典型的致敬写法，必须识别；
       但 akira / eva 本身又是常见人名，裸用（"akira drew this"）不该判R3。

     所以规则是「后缀即语境」：
       标识后面紧跟 -style / -esque / -like / -ish / inspired / reminiscent
       → 无论边界如何都算命中；
       否则要求严格词边界（左右不得为字母数字或连字符），
       且 needCtx 的词还要有上述后缀才算。

     早先版本把连字符一律当词内字符，结果 "akira-style" 反而不命中——
     边界规则和语境规则互相挡死。这种组合错误只有拿真数据跑才暴露得出来。 */
  var CTX_SUFFIX = /^[\s-]*(style|esque|like|ish|inspired|reminiscent)/;

  /* 前置语境：引用句式写在标识**前面**时的判据。
     "in the style of X" / "inspired by X" / "after X" / "reminiscent of X"
     都是明确引用；而 "a trigger for the reaction" 这种普通名词用法
     不含这些词，会被 needCtx 正常放过。 */
  var CTX_PREFIX = /(?:style of|styles of|in the style|inspired by|reminiscent of|after)\s*$/;

  /* 中文语境后缀：描述「沿革 / 之前 / 时期」这类**叙述性引用**。

     为什么必须有：中文里最容易误报的就是这一句
     「代表是扳机社成立之前的老派作画」——它是在讲历史，
     不是要用户模仿该工作室。可库里没有 `扳机社-style` 那种后缀，
     扫描器只能按裸命中处理，于是把技法条目判成 R2。
     早期绕法是把 desc 里的「扳机社」改成英文「Trigger」，
     英文表里没有这个词所以扫不出——**那是掩盖不是解决**：
     真实风险（用户在别处写「TRIGGER 风格」）一点没少，
     只是这一条数据看起来绿了。

     加中文语境后，这条数据可以写回它本来该写的名字，
     同时扫描器也认得「叙述」与「请求模仿」的区别。
     与英文后缀同义：致敬/沿革语境仍然算命中、照常判级，
     所以不放松任何边界，只是让 inspect() 能据此区分处置方式。

     注意别把「风格/画风/技法」放进这组词——那恰恰是**请求模仿**
     （「参考扳机社风格」= 明确要照着画），必须继续判 R2。
     这里只收「时间先后」类词：之前 / 时期 / 沿革 …

     中间必须容忍连接词：真实句子写的是「扳机社成立之前」，
     标识之后的 tail 是「成立之前的老派作画」，不是「之前的…」。
     写成 /之前/ 这种紧邻匹配，最常见的那种写法反而扫不出来
     （实测踩过：正则匹配失败 → via 为空 → 判级退回 R2）。 */
  var CTX_SUFFIX_ZH = /^\s*(?:的)?(?:画风|风格)?\s*(?:成立|出现|诞生|入行|成名)?\s*(?:之前|以前|前|时期|时代|年代|沿革|源流|脉络|传统|早期)/;

  /* 中文扫描：没有词边界问题，但需要创作语境排除普通词义。
     field：这条命中来自条目的哪个字段。inspect() 靠它区分
     「描述里提了一嘴」与「复制内容里真的要用户用」。 */
  function scanZh(text, field) {
    var s = String(text == null ? "" : text);
    var hits = [];
    MARKERS_ZH.forEach(function (m) {
      var from = 0, idx;
      while ((idx = s.indexOf(m.t, from)) >= 0) {
        from = idx + m.t.length;
        var tail = s.slice(idx + m.t.length, idx + m.t.length + 12);
        if (m.needCtx) {
          if (!CTX_ZH.test(tail)) continue;
        }
        /* 沿革语境：算命中（判定等级不变），但标注 via="history"，
           供 inspect() 判断这是叙述而非请求。 */
        hits.push({ marker: m.t, kind: m.kind, zh: m.zh, at: idx, lang: "zh",
                   via: CTX_SUFFIX_ZH.test(tail) ? "history" : undefined,
                   field: field, deceased: !!m.deceased });
      }
    });
    return hits;
  }

  function scan(text, field) {
    var low = norm(text);
    var hits = [];
    MARKERS.forEach(function (m) {
      var needle = norm(m.t);
      var from = 0, idx;
      while ((idx = low.indexOf(needle, from)) >= 0) {
        from = idx + needle.length;
        var tail = low.slice(idx + needle.length, idx + needle.length + 16);
        var hasCtx = CTX_SUFFIX.test(tail);

        /* 无论边界如何，带致敬后缀一律命中——这是明确的创作引用 */
        if (hasCtx) {
          hits.push({ marker: m.t, kind: m.kind, zh: m.zh, at: idx, via: "suffix", field: field, deceased: !!m.deceased });
          continue;
        }

        /* 歧义词没有致敬后缀就放过（akira / eva / shaft 裸用是普通词） */
        if (m.needCtx) {
          /* 语境也可能写在**前面**：
             "in the style of Trigger" / "inspired by Madhouse" 都很常见，
             只看后缀的话这类写法会整个漏掉——扫不出等于没检查。
             前置语境一律要求「明确的引用句式」，
             不放开普通名词用法（"a trigger for the reaction" 必须放过）。 */
          var head = idx >= 12 ? low.slice(Math.max(0, idx - 12), idx) : low.slice(0, idx);
          if (!CTX_PREFIX.test(head)) continue;
          hits.push({ marker: m.t, kind: m.kind, zh: m.zh, at: idx, via: "prefix",
                      field: field, deceased: !!m.deceased });
          continue;
        }

        /* 严格词边界：左右不得为字母数字或下划线。
           这里放行连字符，因为 "xxx-style" 的 xxx 才是被引用的主体，
           而尾部 style 已经由 hasCtx 分支处理或被 needCtx 拦掉。 */
        if (/^[a-z ]+$/.test(needle)) {
          var before = idx > 0 ? low[idx - 1] : " ";
          var after = tail.charAt(0);
          if (/[a-z0-9_]/.test(before) || /[a-z0-9_]/.test(after)) continue;
        }
        /* deceased 必须在 hits 里带出来：R1（署名可用）与 R2（在世创作者）
     的唯一区别就是这个标记，scan 阶段丢了它，tierOf 就永远判不出 R1。 */
        hits.push({ marker: m.t, kind: m.kind, zh: m.zh, at: idx, field: field, deceased: !!m.deceased });
      }
    });
    /* 中英文标识合并返回。分开扫描再合并，而不是一次正则——
       两套表的边界规则完全不同（英文靠词边界，中文靠创作语境），
       混在一个正则里会互相干扰。 */
    return hits.concat(scanZh(text, field));
  }

  /* 单条目的最高等级。
     多个标识同时出现时取最严的那个——
     一段文字里同时有 R3 的作品名和 R2 的作者名，整体按 R3 走。 */
  function tierOf(text) {
    return tierOfFrom(scan(text));
  }

  /* 已扫描出的命中 → 等级。inspect() 逐字段扫描后直接喂 hits，
     免得再拼一次文本（拼了就丢字段信息）。 */
  function tierOfFrom(hits) {
    if (!hits.length) return { tier: "R0", hits: [] };
    var tier = "R0";
    hits.forEach(function (h) {
      if (h.kind === "ip") tier = "R3";
      else if (tier !== "R3") {
        if (h.kind === "creator" && !h.deceased) tier = "R2";
        else if (h.kind === "studio" || h.kind === "brand") tier = "R2";
        else if (h.kind === "creator" && h.deceased && tier !== "R2") tier = "R1";
      }
    });
    return { tier: tier, hits: hits };
  }

  /* ---------- 5. 去标识化 ---------- */
  /* 三件事必须同时做，缺一件输出就是坏的：

     1. 替换标识 → 视觉等价描述（不是弱化版）
     2. 去重：替换词与原句已有词重叠时删掉重复项
     3. 如实报告：replaced 必须给出，绝不静默

     第 2 步是踩过坑才加的。实测 "dragon ball, super saiyan, energy aura"
     替成 "muscular shonen proportions, spiky upward hair silhouette, ..."，
     原句里的 spiky hair / energy aura 还在——同一特征说两遍，
     提示词变啰嗦，模型还可能过度加权某个特征。
     所以替换词的特征如果原句已经覆盖，就不再重复插入。 */

  /* 特征词集合：用于判断替换词是否与原句已有内容重叠。
     只收视觉特征词，不收 "and" "with" 这类连接词。 */
  var TRAIT_WORDS = [
    "angular", "rounded", "soft", "hard", "clean", "flat", "dense", "sparse",
    "bold", "thin", "thick", "muted", "vivid", "bright", "dark", "pale",
    "proportions", "silhouette", "palette", "outline", "outlines", "lineart",
    "shading", "texture", "hair", "eyes", "gouache", "watercolor", "cel",
    "luminous", "neon", "pastel", "monochrome", "hatching", "grain",
    /* 下面这批是实测补的：去重表漏了它们，
       导致 "dragon ball"（替换词含 energy aura）撞上原句已有的 "energy aura"，
       "gundam seed"（替换词含 angular armor）撞上原句已有的 "angular armor"。
       漏一个词就去重失效一次，所以宁可多列。 */
    "aura", "armor", "armour", "visor", "mech", "sword", "blade", "cape",
    "sleeve", "hood", "collar", "ribbon", "wings", "horns", "tail", "claws",
    "shine", "shadow", "highlight", "contrast", "ink", "paper", "fold",
    "curl", "wave", "ripple", "glow", "dust", "smoke", "steam", "rain"
  ];

  /* 把一段描述切成特征词集合，用于重叠检测。 */
  function traitSet(s) {
    var set = {};
    String(s).toLowerCase().split(/[^a-z]+/).forEach(function (w) {
      if (w.length > 2 && TRAIT_WORDS.indexOf(w) >= 0) set[w] = 1;
    });
    return set;
  }

  /* 从替换词里剔除原句已覆盖的特征。
     算法按「词」而不是按「逗号分片」处理。

     早先按分片取舍出过问题：
     替换词 "hard surface angular armor, luminous eye visor"
     在原句已有 "angular armor" 时，本该只留 "hard surface" 与 "eye visor"，
     但因为 "hard"、"surface" 不在 TRAIT_WORDS 里，
     「这一片是否已被覆盖」的判断被hard 拖成false，整片原样留下，
     于是 "angular armor" 出现两次。

     所以这里改成：先把 TRAIT_WORDS 逐个剔掉，
     剩下的修饰词（hard / surface / soft 这类通用词）当作非特征保留。
     剔完一个词都不剩时，才整段丢弃。 */
  function dedupeTrait(to, originalText) {
    var have = traitSet(originalText);
    var parts = to.split(/,\s*/).filter(Boolean);
    var kept = [];

    parts.forEach(function (part) {
      var words = part.split(/\s+/).filter(Boolean);
      var remain = [];
      words.forEach(function (w) {
        var key = w.toLowerCase().replace(/[^a-z]/g, "");
        /* 是特征词，且原句已经覆盖 → 丢掉 */
        if (key && TRAIT_WORDS.indexOf(key) >= 0 && have[key]) return;
        remain.push(w);
      });
      /* 逐片判定，规则一句话：
         片段原本含特征词、剔完一个不剩 → 说明原句已描述完整该特征，整片丢掉；
         片段原本就不含特征词（如 "rigid stance"）→ 保留，它不是被剔掉的。
     这样既不会留下 "energy" 这种悬空残词，
     也不会误伤本来就靠普通词表达形态的片段。 */
      var hadTrait = words.some(function (w) {
        var k = w.toLowerCase().replace(/[^a-z]/g, "");
        return k && TRAIT_WORDS.indexOf(k) >= 0;
      });
      var hasTrait = remain.some(function (w) {
        var k = w.toLowerCase().replace(/[^a-z]/g, "");
        return k && TRAIT_WORDS.indexOf(k) >= 0;
      });
      var isEmpty = !remain.some(function (w) { return /[a-z一-龥]/i.test(w); });

      if (!isEmpty && (!hadTrait || hasTrait)) kept.push(remain.join(" "));
    });
    return kept.join(", ");
  }

  /* 单条标识的正则。
     连字符后缀一并吃掉：akira-style 整体替换，否则句尾会留一个孤零零的
     "-style"（实测踩过）。

     后缀必须同时包含英文与中文两套：中文提示词写的是「XX式」「XX风格」
     「XX画风」，只认英文后缀的话，"参考 Akira Toriyama 式的赛璐璐"
     这类最常见的写法整条匹配不上（实测踩过）。

     「系 / 流」额外收紧：中文里「系统」「系列」「关系」都带这两个字，
     无条件吃掉会把正常句子拆坏，所以要求后面不再接汉字。
     「式 / 风格 / 画风」不设这个限制 ——「XX式的」后面必然跟汉字，
     一旦也要求「后接非汉字」，最常见的「XX式的构图」就会被漏掉。
     这是两批词，必须分开，不能合并成一个前瞻。

     后缀整体可选（+ 而不是 *）：不带后缀的裸名也要能命中，
     否则 "Akira Toriyama" 本身反而匹配不上。 */
  var SUFFIX = "(?:[-\\s]+(?:style|esque|like|ish)|(?:式|风格|画风)"
    + "|(?:系|流)(?![\\u4e00-\\u9fa5]))";
  function buildRe(from) {
    var body = String(from).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    /* 中文后缀要紧跟主体（中间不能有空格）：
       "Akira Toriyama 式" 带空格，而 "Akira Toriyama式" 不带，两种都得吃到。
       所以拉丁主体后允许一个可选空格再接中文后缀。 */
    return new RegExp("\\b" + body + "(?:[-\\s]+(?:style|esque|like|ish))?"
      + "[\\s]*(?:式|风格|画风|(?:系|流)(?![\\u4e00-\\u9fa5]))?", "gi");
  }

  /* 执行一条替换，返回改写后的文本；null 表示这一条没能改动任何东西。
     调用方据此跳出循环，否则会拿同一条反复尝试，死循环。

     注意 out 是字符串（不可变），必须把 replace 的结果返回给调用方赋值，
     写成 out.replace(...) 而不接返回值是最容易犯的一种 ——
     replace 有副作用的说法只对数组成立，字符串不会原地改。 */
  function applyOne(from, to, re, out, replaced) {
    var count = (out.match(re) || []).length;
    if (!count) return null;

    /* 先算这一处的上下文（去掉旧标识后的句子），
       再决定插入哪些特征，避免与相邻词重复。 */
    var others = out.replace(re, " ");
    var finalTo = dedupeTrait(to, others);
    if (!finalTo) {
      /* 原句已完整覆盖该特征，只去掉标识不插新词 */
      replaced.push({ from: from, to: "（原句已描述该特征，仅移除标识）", count: count });
    } else {
      replaced.push({ from: from, to: finalTo, count: count });
    }
    return out.replace(re, function () { return finalTo || ""; });
  }

  function deIdentify(text) {
    var out = String(text == null ? "" : text);
    var original = out;
    var replaced = [];

    /* 每一轮都取当前文本里能命中的最长一条。
       早先按 REWRITE 的书写顺序逐条扫，结果是短条目先命中：
       表里明明有 "akira toriyama"，但前面排着 "akira"，
       于是 "Akira Toriyama 式" 被拆成两次替换，姓氏原地残留。

       靠人工把长条目排到前面是治不好的 ——
       这种表迟早有人加错一行，而症状是「静默地只改了一半」。
       改成「每轮取最长命中」，顺序就无关了：
       能整体替换的永远整体替换，实在没有更长的条目时才退到短的那条。 */
    var guard = 0;
    while (guard++ < 200) {
      var best = null, bestRe = null, bestLen = -1;
      for (var i = 0; i < REWRITE.length; i++) {
        var from = REWRITE[i][0];
        if (out.toLowerCase().indexOf(from.toLowerCase()) < 0) continue;
        if (from.length <= bestLen) continue;
        /* 正则必须真的在 out 里匹配到（不只是子串存在），
           否则 "\b" 边界或中文后缀前瞻会让它匹配不上却仍被选中。 */
        var re = buildRe(from);
        if (!re.test(out)) continue;
        best = REWRITE[i]; bestRe = re; bestLen = from.length;
      }
      if (!best) break;
      var next = applyOne(best[0], best[1], bestRe, out, replaced);
      if (next === null || next === out) break;
      out = next;
    }

    /* 中文替换在后：中文档名大多本身就是作品条目标题，
       英文表先替完不会影响它，但反过来先替中文会在英文描述里留残字，
       所以中文这一遍必须在英文之后跑完再做残留扫描。 */
    REWRITE_ZH.forEach(function (pair) {
      var from = pair[0], to = pair[1];
      var cnt = out.split(from).length - 1;
      if (!cnt) return;
      replaced.push({ from: from, to: to, count: cnt });
      out = out.split(from).join(to);
    });

    /* 清掉替换后残留的空片段：" , " 或 ", ," 或开头多余逗号 */
    out = out
      .replace(/\s*,\s*(?=,)/g, "")
      .replace(/,\s*,/g, ",")
      .replace(/^\s*[,，]\s*/, "")
      .replace(/\s{2,}/g, " ")
      .replace(/,\s*$/, "")
      .trim();

    /* 第二轮：清掉没在表里的残余标识。
       宁可标出来让人知道，也不要留一个漏网的 IP 名。 */
    var leftover = scan(out);
    return {
      text: out,
      replaced: replaced,
      leftover: leftover,
      changed: out !== original
    };
  }

  /* ---------- 6. 条目层级规则（结构判定，优先于逐词扫描） ---------- */
  /* 为什么必须有一条结构规则：
     逐词扫描对技法层很有效（那些条目本来就该R0），
     但对作品层是错的——「圣斗士星矢」「名侦探柯南」「一拳超人」
     的中文名本身就是作品标题，一个关键词都不含，
     逐词扫��必然判成 R0，全库体检时 233 条里有 171 条是这样。

     而作品条目的定义就是「一个受版权保护的作品的视觉特征」。
     标题即标识，不需要再证明一遍。
     所以：WORKS 层的条目直接给 R3，这不是启发式，是定义。 */
  var LAYER_RULE = {
    /* id 前缀 → 层级。作品层前缀见 codes.js 的 WK 段说明，
       这里用旧 ID 形态判定，因为 registry 尚未装配。 */
    works: { test: function (id) { return /^W-[A-Z]/i.test(String(id)); }, tier: "R3",
             why: "作品条目本身即受版权保护的作品标识" },
    /* 工具层不涉及他人标识，但需要检查 demo 里是否写了作品名。
       这里不强制，只给出建议。 */
    tool:  { test: function (id) { return /^[TNS]-\d+$/i.test(String(id)); }, tier: null }
  };

  function layerTier(oldId) {
    var k = Object.keys(LAYER_RULE);
    for (var i = 0; i < k.length; i++) {
      if (LAYER_RULE[k[i]].test(oldId)) return LAYER_RULE[k[i]];
    }
    return null;
  }

  /* ---------- 7. 商用可行性判定 ---------- */
  /* 三种使用场景给三种结论，因为法律判断随场景变：
       personal    自学、个人练习、发朋友圈
       commercial  商业出图、商用交付物、带货、广告
       redist      把本库内容再分发 / 做成付费产品 */
  function assess(tier, mode) {
    var t = TIERS[tier] || TIERS.R0;
    if (mode === "personal") {
      return {
        allowed: true,
        level: "ok",
        note: "个人学习与练习可自由使用，R2/R3 的标识仅供研究视觉语言。"
      };
    }
    if (mode === "redist") {
      if (tier === "R0") return { allowed: true, level: "ok", note: "纯通用知识，可自由再分发。" };
      if (tier === "R1") return {
        allowed: true, level: "info",
        note: "再分发时须保留原作著名单位，库内署名层已登记。"
      };
      return {
        allowed: false, level: "danger",
        note: "R2/R3 条目不得随产品再分发。库内可研究，但你不能把它打包进要卖的东西里。"
      };
    }
    /* commercial */
    if (tier === "R0") return { allowed: true, level: "ok", note: "可直接商用。" };
    if (tier === "R1") return {
      allowed: true, level: "info",
      note: "可商用，但必须署名原作作者。这是道德义务也是多数著作权的合理使用条件。"
    };
    if (tier === "R2") return {
      allowed: true, level: "warn",
      note: "先走 deIdentify() 去掉在世创作者姓名 / 工作室名，再商用。改写后的版本按 R0 对待。"
    };
    return {
      allowed: true, level: "danger",
      note: "必须先 deIdentify()。直接送进商业出图流程属于高风险用法。",
      mustRewrite: true
    };
  }

  return {
    TIERS: TIERS,
    MARKERS: MARKERS,
    MARKERS_ZH: MARKERS_ZH,
    REWRITE_ZH: REWRITE_ZH,
    scanZh: scanZh,
    REWRITE: REWRITE,
    scan: scan,
    tierOf: tierOf,
    deIdentify: deIdentify,
    assess: assess,
    /* 单条目的完整报告，UI 与体检脚本共用 */
    inspect: function (entry) {
      var FIELDS = ["zh","en","desc","note","demo","use","tip","kw","alt","pos","neg","params"];
      /* 逐字段扫描，不把整条拼成一大段再扫。
         原因很实际：只有知道「命中在哪个字段」，
         才能区分「描述里讲沿革」和「复制内容里真的要用户用」——
         拼成一段的话 field 信息就没了，A1-05 那种误判无法避免。 */
      var allHits = [];
      FIELDS.forEach(function (k) {
        var v = entry[k];
        if (!v) return;
        /* 数组字段统一先转字符串。
           kw 是数组，join 时用空格而不是逗号——逗号会被 scan 当成句子结构，
           反而影响语境判断（沿革词要接在标识后面才成立）。 */
        if (Array.isArray(v)) v = v.join(" ");
        allHits = allHits.concat(scan(String(v), k));
      });
      var r = tierOfFrom(allHits);

      /* 结构判定优先：作品层无条件 R3，
         逐词结果只用来补充说明「命中了哪些标识」。 */
      var layer = layerTier(entry.id);
      if (layer && layer.tier) {
        return {
          tier: layer.tier,
          hits: r.hits,
          basis: "layer",
          reason: layer.why,
          fields: []
        };
      }

      /* 叙述性引用不算「请求模仿」。
         判据是**位置**而不是「像不像在讲历史」：

           「代表是扳机社成立之前的老派作画」→ 在 desc 里，
             是技法沿革的说明；用户复制 demo 出图时，
             demo 与 demo 里根本没有这个名字，图和它无关。
           「参考扳机社风格」→ 在 demo/use 里，
             是真的在请求模仿，必须判 R2。

         早前没有这一层，把 A1-05（粗描线稿）判成 R2，
         警示文案写着「商业交付必须先去标识化改写」——
         可这条整条内容里根本没打算用那个工作室的任何东西，
         用户看到只会怀疑整套判级都在乱判。
         （绕法是把 desc 里的「扳机社」改成英文「Trigger」——
           英文表没有这个词所以扫不出。那是掩盖不是解决，
           风险一点没少，只是这条数据看起来绿了。）

         只降「仅出现在描述性字段」的命中；
         只要出现在 demo / use / kw 这些真正被复制走的字段里，
         判定不变。宁可少降，不可错降。 */
      var DESC_ONLY = { desc: 1, note: 1, tip: 1 };
      var actionable = r.hits.filter(function (h) {
        if (h.via !== "history") return true;
        var f = h.field;
        return !(f && DESC_ONLY[f]);
      });
      var noted = r.hits.filter(function (h) { return !actionable.includes(h); });
      if (noted.length && !actionable.length) {
        return {
          tier: "R0",
          hits: r.hits,
          basis: "history-only",
          reason: "提及 " + noted.map(function (h) { return h.zh || h.marker; }).join("、")
            + " 但仅出现在描述性字段（沿革说明），提示词与复制内容里都没有它",
          historyNote: noted.map(function (h) { return h.zh || h.marker; }),
          fields: []
        };
      }

      return {
        tier: r.tier,
        hits: r.hits,
        basis: r.hits.length ? "scan" : "default",
        reason: r.hits.length
          ? "命中 " + r.hits.length + " 处受保护标识"
          : "仅含通用技法与客观描述",
        fields: (function () {
          var out = [];
          ["zh","en","desc","note","demo","use","tip","kw","alt","pos","neg","params"].forEach(function (k) {
            var v = entry[k];
            if (!v) return;
            if (Array.isArray(v)) v = v.join(" ");
            if (typeof v !== "string") return;
            var h = scan(v);
            if (h.length) out.push({ field: k, hits: h });
          });
          return out;
        })()
      };
    },
    layerTier: layerTier,
    LAYER_RULE: LAYER_RULE
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { RIGHTS: RIGHTS };
}