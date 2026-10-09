/* ============================================================
 * data-palette.js —— 主题配色层（段码 PL）
 * ============================================================
 * 为什么单独一层：
 *   画风管「怎么画」，配色管「画面被什么色统领」。
 *   后者是一件独立的事——同一张赛璐璐插画，
 *   换成克莱因蓝主导和换成柿子橙主导，是两张完全不同的作品。
 *   混进画风描述里，模型只会平均处理，不会真正换色调。
 *
 * 字段：
 *   hex      主色十六进制（唯一真源，UI 色卡直接取它）
 *   accent   点缀色（可空）
 *   mood     色彩情绪，写给人看，不进提示词
 *   kw       标签速用版的英文特征词
 *   gpt / gptZh  自然语言正文
 *   desc / note   说明与注意事项
 *   demo         标签速用版
 *
 * 授权：原创配色定义，结构性 R0。
 * ============================================================ */

const PALETTES = [
  {
    id: "PL-01", zh: "经典蓝", en: "Classic Blue", hex: "#1B4FD8", accent: "#F0C419",
    mood: "沉稳、可信、有说服力。科技、金融、工具类内容的默认色。",
    alt: ["克莱因蓝变体", "经典蓝"],
    kw: ["classic blue palette", "deep saturated blue", "blue dominant", "clean neutral backdrop", "single accent contrast"],
    desc: "一种饱和度较高的正蓝作为画面主导色，其余全部压到接近无彩。最常见的专业感配色。",
    note: "蓝主导时肤色会偏冷，需要一点暖光或暖色点缀救回来，否则人物显得像塑料",
    demo: "classic blue palette, deep saturated blue as the dominant color, near-neutral desaturated surroundings, one warm accent for contrast, clean studio lighting",
    gpt: "A classic blue palette: one deep, saturated blue carries the entire image while everything around it is pulled down to near-neutral, nearly colorless. Keep exactly one warm accent small and deliberate so the blue has something to push against. Because a blue-dominant scene cools every skin tone in it, add a subtle warm rim or warm practical light so figures do not turn plastic. No lettering.",
    gptZh: "经典蓝配色：用一个深而饱和的蓝撑起整幅画面，周围一切都被压到接近无彩的近中性色。只留一个暖色点缀，小而刻意，让这个蓝有可以对照的东西。因为蓝色主导会给整个场景的肤色降温，要加一点微妙的暖轮廓光或暖实用光源，否则人物会显得像塑料。不要写字。"
  },
  {
    id: "PL-02", zh: "柿子橙", en: "Persimmon Orange", hex: "#E2662A", accent: "#1F3A5F",
    mood: "温热、有食欲、有人味。适合生活、美食、节气、故事。",
    alt: ["柿橙", "暖橙"],
    kw: ["persimmon orange palette", "warm dominant orange", "earthy secondary tones", "soft cream background", "appetizing warmth"],
    desc: "偏红的暖橙作主导，配奶油白或土黄做底。是最不容易出错的暖色方案。",
    note: "橙色主导时务必留一块低饱和的底色，否则整幅画面会吵",
    demo: "persimmon orange palette, warm red-leaning orange dominating, cream and earthy tan supporting tones, soft warm light, cozy approachable mood",
    gpt: "A persimmon orange palette with a red-leaning warm orange as the dominant, supported by cream and earthy tan. Keep one clearly lower-saturation area in the frame so the orange has somewhere to breathe — fully saturated orange everywhere reads as noise. Soft warm light, cozy and approachable. No lettering.",
    gptZh: "柿子橙配色：以偏红的暖橙为主导，配奶油白与土黄辅助。画面里要保留一块明确低饱和度的区域，让这个橙有喘息的地方——处处满饱和的橙读起来是噪音。用柔和暖光，氛围温馨亲近。不要写字。"
  },
  {
    id: "PL-03", zh: "鼠尾草绿", en: "Sage Green", hex: "#8A9A7B", accent: "#D9CDB0",
    mood: "安静、自然、不刺激。适合护肤、家居、植物、疗愈。",
    alt: ["灰绿", "鼠尾草"],
    kw: ["sage green palette", "muted grey green", "low saturation natural tones", "soft cream neutral", "calm botanical mood"],
    desc: "带灰的低饱和绿，自带安静气质。是最不容易出错的高级感配色之一。",
    note: "低饱和意味着对比弱，必须靠明度拉开层次，否则画面会糊成一片",
    demo: "sage green palette, muted grey-leaning green, low saturation natural tones, soft cream neutrals, gentle diffuse light, calm understated elegance",
    gpt: "A sage green palette: a muted, grey-leaning green at low saturation, grounded in soft cream neutrals, lit by gentle diffuse light. Because the saturation is low, the image must be structured by value contrast rather than by hue — separate every layer with a clear step in lightness, or the whole frame will flatten into one mass. Calm, understated elegance. No lettering.",
    gptZh: "鼠尾草绿配色：偏灰的低饱和绿，落在柔和奶油中性色上，用温和的漫射光照明。因为饱和度低，画面必须靠明度对比而不是靠色相来建立结构——每一层之间要有清晰的亮度台阶，否则整幅会摊成一团。安静、不张扬的高级感。不要写字。"
  },
  {
    id: "PL-04", zh: "普鲁士蓝", en: "Prussian Blue", hex: "#12314F", accent: "#C9A227",
    mood: "厚重、考究、有收藏感。适合经典、复古、文艺、历史。",
    alt: ["深普蓝", "普蓝"],
    kw: ["prussian blue palette", "deep dark teal blue", "muted gold accent", "aged paper tone", "classic scholarly mood"],
    desc: "极深的蓝黑，配一点点暗金或旧纸色。有博物馆与古籍的质感。",
    note: "深色主导时要留一处亮，否则整幅会闷成一团黑",
    demo: "prussian blue palette, very deep dark teal blue dominant, muted antique gold accent, aged paper undertones, dramatic low-key lighting, scholarly classic mood",
    gpt: "A Prussian blue palette: a very deep, dark teal-leaning blue dominates, lifted by a muted antique gold accent and the faintest undertone of aged paper. Low-key dramatic lighting. Because such a dark scheme swallows detail, place exactly one small bright element in the frame to give the eye a place to land and to stop the image from going muddy. Scholarly, classic, collected. No lettering.",
    gptZh: "普鲁士蓝配色：极深的、偏青的暗蓝占主导，用一点哑光的古金提亮，并带最淡的陈纸底色。用低调的戏剧性布光。因为这么深的调子会吞掉细节，画面里要恰好放一个小的亮元素，给眼睛一个落点，避免整幅糊成一片。考究、经典、有收藏感。不要写字。"
  },
  {
    id: "PL-05", zh: "胭脂红", en: "Rouge Red", hex: "#C0273A", accent: "#1C1C1C",
    mood: "强烈、有主张、有攻击性。适合节庆、促销、态度表达。",
    alt: ["大红", "胭脂"],
    kw: ["rouge red palette", "saturated crimson red", "bold dominant color", "deep neutral contrast", "assertive striking mood"],
    desc: "高饱和的正红作为唯一主角，其他全部退成中性灰或黑。",
    note: "红色是高风险主色，用错会显得廉价；饱和度宁低勿高",
    demo: "rouge red palette, saturated crimson as the single dominant color, everything else pulled to deep neutral grey and near-black, one restrained contrast, assertive mood",
    gpt: "A rouge red palette with a saturated crimson as the single dominant color, and everything else pulled back to deep neutral grey or near-black. Red is a high-risk dominant: if it is too bright or too saturated the whole image reads as cheap. Err on the side of slightly lower saturation, and hold the accent areas restrained. Assertive, opinionated. No lettering.",
    gptZh: "胭脂红配色：高饱和的深红作为唯一主导色，其余一切退到深中性灰或近黑。红是高风险主色，太亮或太饱和整幅就会读成廉价。宁可比标准稍低饱和一点，点缀区也要克制。有主张、有攻击性。不要写字。"
  },
  {
    id: "PL-06", zh: "奶油黄", en: "Cream Yellow", hex: "#F2D9A0", accent: "#7A5C3E",
    mood: "明亮、温和、有食欲。适合儿童、餐饮、春天、日系生活。",
    alt: ["奶黄", "奶油"],
    kw: ["cream yellow palette", "warm pale yellow dominant", "soft caramel accent", "gentle warm light", "bright friendly mood"],
    desc: "柔和的暖黄打底，配焦糖色。可爱但不腻，是日系生活画的常用底色。",
    note: "黄色本身亮度高，主体需要用深色轮廓压住，否则会糊",
    demo: "cream yellow palette, soft warm pale yellow dominating, caramel brown accent, gentle warm daylight, bright friendly approachable mood",
    gpt: "A cream yellow palette: a soft warm pale yellow dominates, grounded by a caramel brown accent under gentle warm daylight. Because yellow is intrinsically high in value, every subject needs a darker contour or a deeper shadow somewhere to keep the forms from washing into the background. Bright, friendly and approachable without turning cloying. No lettering.",
    gptZh: "奶油黄配色：柔和的暖调淡黄占主导，用焦糖棕压住，在温暖日光下成立。因为黄色本身明度就高，每个主体都必须有一处更深的轮廓或更重的暗部，才能把形体从背景里压出来。明亮、友好、亲近，又不腻。不要写字。"
  },
  {
    id: "PL-07", zh: "墨黑金", en: "Ink & Gold", hex: "#141414", accent: "#D4AF37",
    mood: "奢侈、庄重、有仪式感。适合美妆、腕表、黑金主题。",
    alt: ["黑金", "墨金"],
    kw: ["ink black and gold palette", "near black dominant", "metallic gold accent", "dramatic specular highlights", "luxurious mood"],
    desc: "接近纯黑的底色，只有金属高光与金调点缀。高级感最强的组合之一。",
    note: "黑底要把高光做够，否则材质会看不出区别；金属件要有一处明确反射",
    demo: "ink black and gold palette, near black dominant, metallic gold accent with crisp specular highlights, dramatic single key light, luxurious elegant mood",
    gpt: "An ink-black-and-gold palette: a near-black ground carries the image and metallic gold appears only in highlights and accents. On a black ground, specular highlights are the only thing that separates materials from one another — so they must be crisp and sufficient, and every metallic element needs one clear reflection. A single dramatic key light. Luxurious, ceremonial. No lettering.",
    gptZh: "墨黑金配色：接近纯黑的底色撑起画面，金属金只出现在高光与点缀里。在黑底上，高光是把不同材质区分开来的唯一东西——所以高光必须锐利且足够，每件金属物都要有一处明确的反射。用一个戏剧性的主光。奢华、有仪式感。不要写字。"
  },
  {
    id: "PL-08", zh: "灰粉", en: "Dusty Pink", hex: "#D9A7A0", accent: "#6E5B58",
    mood: "柔和、微暖、有质感。适合美妆、服饰、生活方式。",
    alt: ["豆沙粉", "灰粉"],
    kw: ["dusty pink palette", "low saturation muted pink", "warm grey secondary", "soft diffused light", "gentle refined mood"],
    desc: "带灰的低饱和粉，避开粉红甜腻的坑。是「高级粉」的正解。",
    note: "粉色主导时肤色会撞色，需要把人物肤色往灰里压一点",
    demo: "dusty pink palette, low saturation muted pink dominant, warm grey secondary tones, soft diffused light, gentle refined feminine mood",
    gpt: "A dusty pink palette with a low-saturation muted pink dominant over warm grey secondaries, lit by soft diffused light. Because pink competes with skin tone, desaturate the figures slightly and push their skin toward grey — otherwise faces and background merge into one pink mass. Gentle, refined, feminine without sweetness. No lettering.",
    gptZh: "灰粉配色：低饱和的豆沙粉占主导，配暖灰辅助色，柔和漫射光。因为粉色会与肤色相撞，把人物略降饱和并把肤色往灰里推，否则脸和背景会糊成同一团粉色。柔和、有质感、有女性气质但不发甜。不要写字。"
  },
  {
    id: "PL-09", zh: "赭石", en: "Raw Sienna", hex: "#A0522D", accent: "#2F2A26",
    mood: "质朴、厚重、有土感。适合复古、乡村、陶器、手作。",
    alt: ["赭红", "土黄"],
    kw: ["raw sienna palette", "earthy terracotta tone", "warm brown secondary", "natural material feel", "rustic grounded mood"],
    desc: "红棕偏橙的土色，像陶土与旧木。适合手工与复古题材。",
    note: "土色系最容易显脏，画面里要有一处干净的高光或纯色来提气",
    demo: "raw sienna palette, earthy terracotta and rust brown dominant, deep charcoal brown secondary, natural material textures, one clean light area to lift the tone",
    gpt: "A raw sienna palette of earthy terracotta and rust brown over deep charcoal brown, on natural material textures. Earth tones are the easiest to make look dirty, so the frame needs one clean, lighter area — a pale wall, a clear sky, a piece of unweathered material — to lift the whole image and give it air. Rustic, grounded. No lettering.",
    gptZh: "赭石配色：红棕与铁锈色的土色为主，压深炭棕辅助，放在自然材质肌理上。土色系最容易显脏，所以画面里必须有一块干净的亮区——一面浅墙、一片晴空、一件没被风化的材料——把整幅提起来、给它空气。质朴、有根。不要写字。"
  },
  {
    id: "PL-10", zh: "青灰", en: "Slate Teal", hex: "#4A6B70", accent: "#D9D2C3",
    mood: "冷淡、克制、有距离感。适合都市、科技、冬季、纪实。",
    alt: ["灰青", "石青"],
    kw: ["slate teal palette", "muted blue green dominant", "cool neutral secondary", "overcast diffuse lighting", "restrained urban mood"],
    desc: "带蓝的灰绿，气质清冷。是都市题材最合适的底色之一。",
    note: "青灰主导时需要一个暖点缀，否则整个画面会像没有情绪",
    demo: "slate teal palette, muted blue green dominant, cool neutral secondaries, overcast diffuse lighting, one small warm accent, restrained urban mood",
    gpt: "A slate teal palette of muted blue-green over cool neutral secondaries, lit by flat overcast diffusion. Because this scheme is inherently emotionally cool, it needs exactly one small warm accent — a lit window, a sodium street lamp, a piece of worn leather — or the whole image reads as having no mood at all. Restrained, urban, slightly cold. No lettering.",
    gptZh: "青灰配色：低饱和的蓝绿为主，压冷中性色辅助，用阴天平漫射光。因为这套调子本来就情绪偏冷，它需要一个恰好大小的暖点缀——一扇亮着的窗、一盏钠灯、一块磨旧的皮革——否则整幅会读成完全没有情绪。克制、都市、微冷。不要写字。"
  },
  {
    id: "PL-11", zh: "薰衣草", en: "Lavender Mist", hex: "#A79BC4", accent: "#E8E3F0",
    mood: "梦幻、柔和、有雾气。适合夜景、回忆、童话、抒情。",
    alt: ["紫雾", "薰衣草紫"],
    kw: ["lavender mist palette", "soft muted violet", "pale lilac secondary", "diffused dreamy lighting", "ethereal nostalgic mood"],
    desc: "带灰的淡紫，介于冷与暖之间。有雾感，适合表达回忆与梦境。",
    note: "紫色在暗部容易发黑，要保证暗部也带一点紫而不是纯黑",
    demo: "lavender mist palette, soft muted violet dominant, pale lilac and cream secondaries, diffused dreamy lighting, hazy low contrast, ethereal nostalgic mood",
    gpt: "A lavender mist palette: a soft muted violet dominant over pale lilac and cream, lit with diffused dreamy light at hazy low contrast. Violet turns muddy black in the shadows if you let it — keep the shadow side of every form tinted violet rather than neutral grey. Ethereal, nostalgic, on the edge of waking. No lettering.",
    gptZh: "薰衣草配色：柔和的低饱和紫为主导，配淡紫与奶油色，用梦幻的漫射光，压低对比做出雾感。紫色在暗部不控制就会发黑发浑——每个形体的暗面都要带紫，而不是中性灰。梦幻、怀旧、像在清醒边缘。不要写字。"
  },
  {
    id: "PL-12", zh: "柠檬绿", en: "Lemon Lime", hex: "#C6D92E", accent: "#2A2E22",
    mood: "明快、有反差、有点怪趣。适合潮流、年轻、创意。",
    alt: ["柠檬黄绿", "亮绿"],
    kw: ["lemon lime palette", "bright yellow green accent color", "dark neutral backdrop", "high contrast pop", "youthful energetic mood"],
    desc: "极亮的黄绿色，用深中性色压住。冲击力强但需要克制的背景。",
    note: "黄绿亮度极高，只能做点缀或小面积主体，大面积用会刺眼",
    demo: "lemon lime palette, bright yellow green used sparingly as a pop color against a deep neutral backdrop, high contrast, sharp edges, youthful energetic mood",
    gpt: "A lemon lime palette: a bright yellow-green used deliberately sparingly as a pop color against a deep neutral backdrop. Because of its extreme value it must stay limited in area — used broadly it becomes harsh and tiring. Reserve it for one or two focal points and let everything else stay dark and quiet. Youthful, energetic, slightly odd. No lettering.",
    gptZh: "柠檬绿配色：明亮的黄绿作为点缀色，刻意少面积地用在深中性背景上。因为明度极高，它必须控制面积——大面积使用会刺眼又疲劳。只留一两个焦点给它，其余部分保持安静深暗。年轻、有能量、带一点古怪。不要写字。"
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PALETTES: PALETTES };
}