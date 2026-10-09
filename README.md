# 动漫提示词库 · Anime Prompt Library

面向 **Midjourney / Stable Diffusion / SDXL / Illustrious / Flux / NovelAI** 的动漫风格系统化词库，共 **412 条**，单一数据源同时产出**可检索网页**与 **Markdown 源文件**。

> 本文所有数字（412 条 · 537 节点 · 画廊 13 张等）都是**提交时的实况快照**：
> 口径由 `tools/inventory.js` 与 `codex-skill … gallery --todo` 现算，条目增删后会变，引用前先跑命令核对。

**五层内容**（画风流派 59 · 作品 IP 233 · 题材元素 32 · 排版图型 30 · 主题配色 12）**每一条都配了提示词卡**，其中 GPT 正文 **324/324 全覆盖**，整段复制即可出图。

覆盖范围：**日本 · 中国 · 韩国 · 印度东南亚 · 法国比利时 · 英国爱尔兰 · 北欧 · 苏联东欧 · 德国西班牙 · 拉美 · 北美**，兼顾主流作品与各地的**动画史风格流派**。

**在线使用（无需克隆仓库）**：**https://gaoren7716-lab.github.io/anime-prompt-library/**

打开就是三个入口，不需要先理解检索、组合、编码这些内部概念：

| 我想… | 入口 | 你会得到 |
| --- | --- | --- |
| 先看效果 | **示例画廊** | 真图与提示词对照，点开复制整段 GPT 正文 |
| 从零创作 | **出图工作流** | 画风 → 题材 → 版式 → 配色四步选型，**五个模型各出一份按其语法优化的提示词** |
| 还没想好 | **一键抽卡** | 随机抽一组组合，可直接出图 |

每一步都**能搜到风格**：中文名、别名、跨语言、描述式搜索都认。
每份结果都自带**效果说明**——四步各自决定什么、画风在你选的模型上叫不叫得动、
恒定保留什么（禁项）、哪些话没经过实测。说得清变化，而不是只甩一段英文。

本地使用：克隆后直接打开 `index.html`（与在线版同源）。
不克隆仓库、只想快速上手见 [`docs/quick-start.md`](docs/quick-start.md)；
在 Codex / WorkBuddy 等 Agent 里调用见 [`SKILL.md`](codex-skill/anime-prompt-forge/SKILL.md)；
不确定从哪开始，先看 [`INDEX.md`](INDEX.md) —— 一页索引，告诉你每个问题该查哪张表。

在此基础上还有一层**开放式知识库**：十二个库、**537 个节点**、九个组合槽位，外加检索 / 组合 / 变形三套引擎。它的目标是——

> **已知内容可检索，未收录内容可拆解，新的创作需求可通过模块组合与受控变形构建。**

也就是说：有的直接复制，没有的组合出来，组合之外还能再变形，生成空间不再受限于已收录的数据。

<!-- GALLERY-EMBED:START -->
## 示例画廊 · 提示词与成品对照

以下 **13 张**全部为 R0 条目（本库授权分级中的最低档：未命中在世创作者姓名、工作室名、品牌或作品名，按 `assets/rights.js` 的内部规则判定可自由配图。这是内部分级判定，不构成法律意见——商用前请自行复核），每张图由该条目的 **GPT 正文**直接生成——复制折叠区里的提示词，喂给任意出图模型就能得到同风格的结果。可交互的完整画廊在 `index.html`。

<table>
<tr>
<td valign="top" width="50%">

<img src="examples/A1-01.png" width="430" alt="A1-01" />

**A1-01 · 赛璐璐平涂**（Cel Shading）

看点：看点：暗部只有一层、边界锐利无渐变，背景压成纯色块——hard shadow 与 flat color 的教科书验证。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Classic Japanese cel-shaded anime illustration: a teenage girl in a navy sailor uniform standing in an empty classroom filled with afternoon sunlight. Shade her strictly with the traditional two-tone cel method, one flat base tone for every lit surface succeeded by a single crisp second shadow whose boundary stays razor sharp with no gradient anywhere between them. Surround every form with even-weight dark brown lineart and reduce background desks and window frames to large flat unmodulated color blocks. Restrict the scheme to warm skin, deep navy uniform cloth, muted chalkboard green and pale sunlit wood. Compose a waist-up portrait under flat even lighting free of rim light, bloom or photographic artifacts. Keep the frame clean with no text, logos, watermarks or UI elements.
```

</details>

</td>
<td valign="top" width="50%">

<img src="examples/A1-02.jpg" width="430" alt="A1-02" />

**A1-02 · 现代数码柔光**（Modern Digital Soft Shading）

看点：看点：光从窗口斜射进来，亮部过渡是连续渐变而不是分层色块，阴影里仍有通透感——这正是「数码柔光」与赛璐璐平涂的分界。右下角有通道水印，商用须裁掉。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Contemporary digital anime illustration finished with soft airbrush shading: a young woman with long silver hair and glossy eyes seated by a window at golden hour. Build the rendering from many layered gradients instead of hard cel boundaries, blending every transition until it disappears, and layer broad blurred highlight rings through the hair along with a translucent glow across the cheekbones. Give the irises several overlapping highlight discs and a soft bounce light along the lower lid. Soften the background into natural bokeh with slow drifting dust particles for commercial polish. Compose a chest-up portrait lit warmly and gently. Include no text, logos, watermarks or signature anywhere in the image.
```

</details>

</td>
</tr>
<tr>
<td valign="top" width="50%">

<img src="examples/A1-03.png" width="430" alt="A1-03" />

**A1-03 · 厚涂 / 油绘感**（Thick Paint / Painterly）

看点：看点：笔触有物理厚度、刀刮的脊线在火光下起边，暗部是暖棕底层而非纯黑——厚涂与 CG 渲染的分界就在这里。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Painterly anime illustration executed in thick impasto oil technique: a battered knight seated beside a dying campfire at dusk. Apply pigment in visible directional strokes rather than smooth fills so that ridges of paint physically catch the firelight along armor bevels, and construct every shadow from dense warm brown underlayers. Maintain an old-master value structure with deep integrated shadow masses and one dominant warm key light blooming off the front plate. Let edges stay broken and searching rather than slick, with coarse canvas tooth faintly visible through the dark background. Compose a three-quarter view with focus falling off sharply into the trees behind. Include no text, logos or watermarks.
```

</details>

</td>
<td valign="top" width="50%">

<img src="examples/A1-04.png" width="430" alt="A1-04" />

**A1-04 · 透明水彩**（Transparent Watercolor）

看点：看点：最亮处就是纸本身的白，颜色在湿纸上自然洇开、边缘留水痕——透明水彩区别于不透明水粉的核心证据。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Transparent watercolor anime illustration: a girl in a straw hat walking along a puddled seaside path just after rain. Use nothing but transparent washes, allowing the white of the paper itself to serve as the brightest highlight and building every tone by layering diluted pigment so colors mix optically on the sheet instead of being premixed on a palette. Let wet-on-wet blooms soften the horizon line and pool unevenly at the hem of the skirt while granulation settles quietly into the shadows. Keep a light graphite under-drawing visible beneath the wash. Leave generous untouched paper around the figure and add no border or frame. No text, logos or watermarks.
```

</details>

</td>
</tr>
<tr>
<td valign="top" width="50%">

<img src="examples/A1-05.png" width="430" alt="A1-05" />

**A1-05 · 粗描线稿 / 线稿至上**（Bold Lineart Focus）

看点：看点：纯黑白、近处线条粗黑厚重而远处迅速收细，几乎不用灰调——线重变化是手绘感的第一来源。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Bold lineart-driven anime illustration with almost no applied color: a swordsman caught mid-draw in one explosive moment. Make the drawing itself the subject by varying line weight decisively, loading heavy black strokes onto the forms closest to the viewer and thinning them as shapes recede, and leaving deliberate open gaps and slight overshoot where a hand would naturally break the contour. Add rough searching pencil strokes in a few places and one passing of light hatching in the deepest shadows only, plus a single flat gray tone as spot accent. Stage it diagonally against a nearly empty background. Include no text, speech bubbles, logos or watermarks.
```

</details>

</td>
<td valign="top" width="50%">

<img src="examples/A1-07.png" width="430" alt="A1-07" />

**A1-07 · Q 版 / 二头身**（Chibi / Super Deformed）

看点：看点：二头身、贴纸式白边、大面积粉彩——Q 版的比例逻辑与正常头身完全不同。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Chibi super-deformed anime character design: a cheerful cat-eared girl holding an ice cream cone taller than her own body. Compress the proportions to roughly two head-lengths in total with an enormous rounded head, small stubby limbs and simplified mitten hands, keeping the eyes huge, sparkling and set low on the face beside a small bright mouth. Render everything with simple clean shapes, minimal shading and bright saturated toy-like colors so the silhouette reads instantly even at icon size. Center her against a plain pastel circle on open ground with no additional props. Include no background clutter, no text, logos, watermarks or UI frames.
```

</details>

</td>
</tr>
<tr>
<td valign="top" width="50%">

<img src="examples/A1-08.png" width="430" alt="A1-08" />

**A1-08 · 黑白漫画页**（Monochrome Manga）

看点：看点：三格分镜、网点纸灰阶、集中线、下三分之一整幅出血——对白框留空，文字一律后期排版。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Black-and-white manga page layout: three stacked rectangular panels narrating one wordless beat of a rooftop confrontation. Execute entirely in ink using solid black fills, precise cross-hatching, blown highlight shapes and mechanical screentone gradients for mid-values, with converging speed lines driving the eye toward the action. Separate the panels with clean black borders and generous gutters, and open one full-bleed borderless splash moment across the lower third. Keep composition readable from top to bottom and rely on silhouette separation so black masses never muddy into one another. Leave any speech balloons empty. Include no dialogue, logos, watermarks or color.
```

</details>

</td>
<td valign="top" width="50%">

<img src="examples/A1-09.png" width="430" alt="A1-09" />

**A1-09 · 水墨 / 墨绘**（Sumi-e / Ink Wash）

看点：看点：鹤与苇一笔成形、远岸洇成淡灰，大片留白当作水与雾——负空间是水墨语言，不是没画完。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Sumi-e ink wash painting: a lone crane standing in shallow water beside wind-bent reeds. Work almost entirely in black ink modulated only by water, drawing the reed stems and crane legs as unhesitating single strokes that taper from loaded bristle to dry tip, and washing the far bank into soft gray bleed. Allow absorbent rice paper to drink the pigment so every edge feathers naturally, and leave vast regions of untouched white standing in for mist and open water so that negative space carries nearly a third of the composition. Place one small red seal square in a corner. No modern text, logos or photographic effects.
```

</details>

</td>
</tr>
<tr>
<td valign="top" width="50%">

<img src="examples/A1-10.png" width="430" alt="A1-10" />

**A1-10 · 浮世绘 / 木版画**（Ukiyo-e Woodblock）

看点：看点：粗轮廓线勾边、色块平涂、天空横向渐层、和纸纤维透出——木版画的工艺痕迹要留在画面里。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Ukiyo-e woodblock print: a lone fisherman standing on a rocky outcrop at dawn, with a calm bay and distant hills behind him. Confine yourself to flat blocks of hand-mixed mineral color, indigo, soft vegetable yellow and muted red, each bounded by a confident black key line with no modeling or soft edges anywhere in the image. Let the fibrous tooth of washi paper show through the ink, add faint horizontal bokashi banding across the sky, and admit slight misregistration where a second block landed off its mark. Compose with a dominant diagonal, heavy asymmetry and an empty horizontal band at the horizon. Include one small empty cartouche. No readable characters, logos or watermarks.
```

</details>

</td>
<td valign="top" width="50%">

<img src="examples/A1-11.png" width="430" alt="A1-11" />

**A1-11 · 像素画**（Pixel Art）

看点：看点：像素格子清晰、色板受限、抖动过渡，缩到图标大小仍认得出剪影——16-bit 不是「模糊的小图」。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Pixel art game sprite scene: a small armored hero standing in a torchlit cave, rendered at true one-to-one pixel resolution. Restrict the palette to roughly sixteen deliberate colors with no anti-aliasing blended between them, and place every individual pixel by hand, using ordered dithering to grade the torch light falloff across the cavern walls and cluster dithering for ambient shadow. Give the sprite a dark outline, exactly three shades of value per material, and a silhouette that stays readable at thumbnail size. Keep all elements aligned to one consistent pixel grid. Add no blurring, no filters, no text, logos or watermarks.
```

</details>

</td>
</tr>
<tr>
<td valign="top" width="50%">

<img src="examples/A1-12.png" width="430" alt="A1-12" />

**A1-12 · 剪影 / 负空间**（Silhouette & Negative Space）

看点：看点：主体几乎全黑、只留一线轮廓光，人占画面极小而空处极大——负空间是被主动经营的构图。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Silhouette and negative-space anime composition: a girl standing alone on a rain-slicked city crossing at night, rendered almost entirely as a black shape. Backlight her with warm shopfront glow that picks out only a thin rim of hair and shoulder while every interior detail dissolves, and let the surrounding space carry the information through smeared pavement reflections, drifting rain streaks and distant lit windows. Limit the scheme to deep blue-black plus a single accent color. Compose so the figure occupies a small part of a very large empty frame, honoring the negative space intentionally. No text, logos or watermarks.
```

</details>

</td>
<td valign="top" width="50%">

<img src="examples/A1-13.png" width="430" alt="A1-13" />

**A1-13 · 手绘草稿质感**（Pencil Sketch / Draft）

看点：看点：颅骨圆、中心线、胸腔块面都留在纸上，肩线有重复描摹的搜索痕迹，下半身未画完——过程感就是内容。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
Pencil sketch anime drawing left deliberately in draft state: a seated girl resting her chin on one hand, drawn on toned paper. Keep the construction legible, a light circle for the cranium, a center line, a blocked chest cage, and duplicated searching contour lines where the hand corrected the near shoulder. Vary graphite pressure so weight gathers on the underside of forms, smudge a few core shadows with a blending stump, and abandon the far arm and lower sheet unfinished as raw white paper. Add faint kneaded-eraser highlights lifted from the hair. Include no color, no inked lines, no text, logos or watermarks.
```

</details>

</td>
</tr>
<tr>
<td valign="top" width="50%">

<img src="examples/A1-14.png" width="430" alt="A1-14" />

**A1-14 · 高对比霓虹 / 夜景摄影感**（Neon Night / Cyber Palette）

看点：看点：品红与青分别从两侧打光、湿地反光被拉成竖向光带，暗部压向纯黑——霓虹夜景靠光源颜色说话，不靠滤镜。

<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>

```text
High-contrast neon night anime illustration with photographic camera feel: a courier standing at the mouth of a rain-soaked alley in a dense city. Light the scene almost entirely from practical signage, magenta from one wall and cyan from the other, rimming her shoulders and catching the eyelashes, with almost no ambient fill so shadow areas crush toward black. Make every wet surface a broken mirror holding smeared colored reflections, and add gentle lens bloom with slight chromatic fringing toward the frame edges. Compose with strong perspective convergence and heavy atmospheric depth. Put no readable text on the signs, no logos, watermarks or UI overlays.
```

</details>

</td>
<td></td>
</tr>
</table>

<!-- GALLERY-EMBED:END -->

## ⚠️ 商用前必读：授权边界

**本库的代码、结构设计、以及 324 条 GPT 出图正文是原创的，可以商用。**
**但库里引用的作品名与在世创作者姓名不是你的，不能直接用于商业出图。**

这两件事必须分开看，混成一句「本库采用某许可」是最容易吃官司的一句话。

全库 935 项按四档标注（数字由 `assets/rights.js` 实时统计，不是估计值）：

| 档 | 名称 | 数量 | 商用 | 说明 |
|---|---|---|---|---|
| `R0` | 自由 | 674 | 可直接 | 通用技法与客观描述，不含任何他人标识 |
| `R1` | 署名 | 1 | 可，**需署名** | 已故创作者，风格已进公有领域 |
| `R2` | 仅参考 | 13 | 可，**先改写** | 在世创作者姓名、工作室名、品牌名 |
| `R3` | 禁止直接商用 | 247 | **需先改写** | 作品名称与角色设定，标题本身即标识 |

**R3 不是禁用，是「必须改写后使用」。** 个人学习与研究随便用（这正是保留 233 条作品条目的意义），但送进商业出图或对外交付前，必须改成纯视觉特征描述。

```
❌ gundam seed, angular armor, orange sunset
✅ hard surface, luminous eye visor, orthographic stance, angular armor, orange sunset
```

`RIGHTS.deIdentify()` 做的就是这件事——把标识换成视觉等价描述，不是弱化版。前者是标识，后者是真正能落到画面上的特征，模型认的是后者。

**再分发是另一回事**：R2/R3 条目不得随产品打包出售。库内可以研究，不能卖。

三档判定与改写质量由 `node tools/check_rights.js` 静态校验（38 项），改数据后请跑一遍。完整口径见《动漫提示词库》第 11.5 节。

## 目录结构

```
anime-prompt-library/
├── index.html              可检索网页（双击打开，离线可用）
├── INDEX.md                一页索引：我想干的事 → 该查哪张表
├── AGENTS.md               Agent 在本库上工作的硬规矩
├── 动漫提示词库.md          Markdown 源文件（自动生成，二次编辑友好）
├── build_md.js             从数据源生成 Markdown
├── examples/               示例画廊的图（按旧 id 命名）
├── assets/                 ★ 唯一数据源，改这里
│   ├── prompt-kit.js          提示词卡派生引擎（画质分档 + 标签/负面词派生）
│   ├── data-core.js            第一层：画风流派 45 条（技法/年代/工作室/地区）
│   ├── data-core-more.js       第一层：全球流派 14 条 ★ 见下方说明
│   ├── data-works-jp.js        第二层：日本动画作品 85 条
│   ├── data-works-global.js    第二层：国产 + 欧美 + 游戏 IP 53 条
│   ├── data-works-more-a.js    第二层：日本补遗 27 + 韩国 6 + 印度东南亚 5
│   ├── data-works-eur-w.js     第二层：欧洲西部 23 条（法比/英爱/北欧）
│   ├── data-works-eur-e.js     第二层：苏联东欧 10 + 德西 2 + 拉美 5
│   ├── data-works-namer.js     第二层：北美 17 条（源流/国民卡通/成人动画）
│   ├── data-genres.js          第三层：题材元素 32 + 横切词条库 14 组
│   ├── data-layout.js          第四层：排版图型 30 条（社媒卡/信息图/分镜/IP/电商/封面）
│   ├── data-palette.js         第五层：主题配色 12 条（主色 + 点缀色）
│   ├── data-misc.js            模板 16 + 负面词 8 + 平台语法 8
│   ├── data-prompts-*.js       15 个文件 · 324 条英文 GPT 出图正文 ★ 见下方说明
│   ├── data-prompts-zh-*.js    5 个文件 · 91 条中文正文（画风 + 题材）
│   │
│   ├── schema.js            开放式知识库的元模型（十二库 / 九槽位 / 评级 / 证据 / 规则）
│   ├── lib-form.js          库 01·02·03 领域形式 / 全球文化 / 作品实体
│   ├── lib-visual.js        库 04 视觉风格（上）造型 · 比例 · 面部 · 线条 · 上色
│   ├── lib-visual2.js       库 04 视觉风格（下）材质 · 空间 · 光影 · 色彩 · 完成度 · 时间质感
│   ├── lib-creature.js      库 05 角色与生物（上）身份 · 体格 · 年龄 · 毛发 · 表情
│   ├── lib-creature2.js     库 05 角色与生物（中）服装 · 体态 · 非人角色
│   ├── lib-creature3.js     库 05 角色与生物（下）生物怪物 · 机械仿生
│   ├── lib-world.js         库 06 世界与资产（上）地形 · 气候 · 时间 · 建筑
│   ├── lib-world2.js        库 06 世界与资产（下）室内 · 道具 · 载具 · 世界观尺度
│   ├── lib-story.js         库 07 故事与表演
│   ├── lib-lens.js          库 08 镜头与时空
│   ├── lib-voice.js         库 09 声音与语言
│   ├── lib-prod.js          库 10 生产与交付
│   ├── lib-morph.js         库 11 组合与变形
│   ├── lib-retrieve.js      库 12 检索与验证
│   ├── engine.js            引擎：retrieve / compose / morph
│   ├── codes.js              编码规则唯一真源：旧 id → 规范 code（纯函数）
│   ├── rights.js             授权分级唯一真源：四档 / 标识表 / 去标识化 / 商用判定
│   ├── code-map.js           编码迁移表：旧码永久可解析（只增不删）
│   ├── resolver.js           六类输入解析：编码 / 旧编码 / 旧 ID / 中文名 / 英文名 / 别名
│   ├── registry.js           全库登记：935 项进码表与解析器
│   ├── prompts-zh.js         中文正文统一查表（旧 ID 与规范码双向可查）
│   ├── studio.js             出图工作流核心：四步选择 → 拼装正文 / 标签 / 负面词
│   ├── render.js             出图通道：模型 / 比例 / 自定义尺寸 / 请求构造
│   ├── render-net.js         请求执行层：单张与抽卡共用（含退避重试）★
│   ├── model-prompts.js      按模型改写提示词：同一组四步，五个模型五份词★
│   ├── gacha.js              抽卡池：槽位从工作流派生、规模现算、可扩展★
│   ├── studio-ui.js          网页端「出图工作流」视图 + 出图面板 + 模型卡
│   ├── gacha-ui.js           网页端「一键抽卡」独立视图
│   ├── code-ui.js            网页端「编码工作台」与「编码总览」两个视图
│   └── open-ui.js            网页端另外四个知识库视图（画廊 / 检索 / 组合 / 变形）
└── tools/
    ├── _loadlist.js          测试脚本清单的唯一真源（★ 见下方说明）
    ├── check_text.py         字符污染扫描（非 ASCII / 非中日文）
    ├── detect_latin.py       中文字段混拉丁词扫描（比 check_text 更严）
    ├── check_prompts.js      提示词卡体检（覆盖率 / 重复 / 非 ASCII / 字数）
    ├── check_studio.js       出图工作流体检（四栏候选 / 中英正文 / 缺步诊断 / 授权 / 出图通道）★
    ├── inventory.js          提示词覆盖度盘点，导出 tools/_missing.json
    ├── repair_text.py        按显式映射修复污染词条
    ├── check_han.py          繁体 / 日式汉字泄漏扫描（简繁同形字已排除）
    ├── check_engine.js       知识库引擎冒烟（十二库 / 检索 / 组合 / 变形 / 冲突）
    ├── check_codes.js        编码体系验证（唯一 / 长度 / 无漏编 / 五类输入 / 组合串）
    ├── check_ids.js          编号漂移体检（WK 冻结名单 / 追加稳定 / 四写法 / 三源互证 / 全库引用扫描）★
    ├── check_rights.js        授权契约验证：分级落库 / 误报 / 正文IP 扫描 / 去标识化 / 中文正文
    ├── ui_test.js            真实 DOM 测试（jsdom）：侧栏逐点 + 出图工作流 + 遮挡回归 ★
    ├── tier_audit.js         画质档位分布盘点（分板块 / 反向抽查）
    ├── shot_studio.js        用无头 Chrome 截出出图工作流那一屏，人工核对
    └── smoke.js              网页运行时冒烟测试（含提示词卡覆盖率 + 知识库视图）
```

> `ui_test.js` 需要 jsdom：`npm install jsdom`（装在 `C:/Users/A/.workbuddy/binaries/node/workspace`）。

> **`tools/_loadlist.js` 为什么必须存在**：早前每个测试脚本各自抄一份 `assets` 加载顺序，
> 已经漂移出过一次——`tier_audit` 少抄了 `data-misc.js`，而两份清单都不会报错，
> 少加载只是让部分断言拿到空数组，那些断言「恰好没覆盖到」就静默通过了。
> **清单错了不报错，测试照样绿。** 所以清单只允许有一份，各测试从这里取，
> 并由 `check_codes.js` 第【9】组断言比对 `index.html`，防止页面漏加载。

## 编码与引用

全库 **935 项**（366 条目 + 32 工具 + 537 节点）每一项都有规范编码，可直接用于组合引用。

### 为什么另建一层编码，不直接改 `id`

原有 `id` 是历史数据主键，格式并不统一：条目层 `A1-01`（2 位）与 `W-J112`（3 位）并存，
节点层 `CB-01-1`（末段 1 位）与 `VS-06-10`（末段 2 位）并存，工具层 `T-01`/`N-01`/`S-01` 又是另一套。
直接改 `id` 会砸掉 324 条已验证的 GPT 提示词映射，所以**保留原字段，另建一层规范编码**。

#### 编码文法

```
条目层  <两字母前缀>-<三位序号>            ST-001   WK-233
工具层  <两字母前缀>-<三位序号>            TP-001
节点层  <两字母库号>-<三位组>-<三位项>    CB-001-002
        库 01 另有第四段                   FD-001-001-001
```

前缀自解释——看到 `ST` 就知道是技法，不用查表。**段码从 32 个收敛到 24 个**：

| 旧段码 | 新段码 | 为什么改 |
|---|---|---|
| `A1`…`A5` | `ST` `ER` `SB` `RG` `MV` | 五个并列维度曾被压进一个字母加数字，看到 `A3-007` 无法推断含义 |
| `G`（题材元素） | `TH` | `G` 一个字母曾同时表示「题材」和 `W-G` 的「全球」，极易记错 |
| `W-J`…`W-G`（10 个地区段） | `WK`（单一 233 条段） | 地区是属性（每条作品自带 `grp` 字段），不该升格成段码 |
| `T` `N` `S` | `TP` `NG` `SY` | 单字母与条目层的 `N`/`S` 撞车 |
| `FD`…`RC`（13 个节点段） | 不变 | 已是两字母、三位组、三位项，无需重排 |

**为什么作品段要合并**：233 个作品 IP 曾按地区切成 10 个段，规模从 5 条（拉美）到 112 条（日本）差 22 倍。
合并成 `WK-001`…`WK-233` 后编号连续，地区下沉为字段，追加新作品不会再出现「W-L 只有 5 条、W-J 已经 112 条」这种悬殊。

| 层 | 旧 id | 规范编码 | 说明 |
|---|---|---|---|
| 条目 | `A1-01` | `ST-001` | 前缀由 `A1` 改为 `ST` |
| 条目 | `G-01` | `TH-001` | 题材元素 |
| 条目 | `LT-01` | `LT-001` | 排版图型（新增层，两字母段不参与三段节点派生） |
| 条目 | `PL-01` | `PL-001` | 主题配色（同上） |
| 条目 | `W-J84` | `WK-084` | 作品，地区段合并 |
| 工具 | `T-01` | `TP-001` | 单字母改双字母 |
| 节点 | `CB-01-1` | `CB-001-001` | 组号与项号各三位 |
| 节点 | `CB-01` | `CB-001-000` | 组节点用 `-000`，把 `-001` 让给首个子节点 |
| 节点 | `FD-01-1-1` | `FD-001-001-001` | 库 01 有三级归属，压成两段会并成同一条 |

**为什么补到三位而不是两位**：`TH-001` 已到 `TH-032`，两位撑到 99 就撞号；三位可到 999，
后续加条目只需往后追加，不动已有编码。

**三条硬约定**（写在 `codes.js` 文件头）：

1. **编码一旦发布不可改** —— 改了等于让用户手里的组合串失效。新增只往后追加序号，不重排旧号。
2. **编码是引用锚点不是内容** —— 改中文名不影响解析，因为解析走映射表与别名表，不读数据源的 `zh`。
3. **旧编码永久可解析** —— 见下方迁移表。

**WK 作品段的追加保证**：作品号由「地区排序 + 段内序号」的位置决定，
若每次都重新排序，给中间地区段（如韩国、中国）补一部新作品，
后面上百部作品的号会整体挪动——排序天然做不到「只往后追加」。
所以作品顺序冻结在 `code-map.js` 的 `WORK_ORDER_FROZEN` 名单里：
已发布的 233 个号永远取名单位置，数据里改地区、改序号、删条目都不挪号；
新作品只追加在名单末尾，追加顺序按 (地区， 序号) 确定。
**新作品入库后必须跑 `node tools/check_ids.js`**——
它会给出可直接粘贴进名单的追加行，粘进去、提交，编号变更才算发布。
另外四个地区段序号里塞真实世界术语要小心：`T5`（Flux 编码器）、
`A24`（制片公司）、`G1`（变形金刚）都形似库编号的裸写法，
文档里出现时由 `check_ids` 第 9 组白名单盯防。

**地理编码（派生层，不是发布码）**：按国家/地区归类配图与引用时用
`CODE_MAP.geoOf(旧号)` 现算的语义码——中国 `CN-001` 起、日本 `JP-001` 起、
韩国 `KR-001` 起，其余见 `GEO_PREFIX` 对照表（北美 `NA`、拉美 `LA`、
欧洲西部 `EW`、欧洲东部 `EE`、印度东南亚 `IN`、欧美综合 `XW`、游戏原作 `GM`）。
三条规则：**它不由发布码承担**——作品段若按国家分段，就回到
「往中间地区补作品挪动上百个号」的老问题；组内序号取冻结名单里的
同地区位次，因此**与 WK 码同样追加稳定**（新日番就是 JP-113，旧号全不动）；
前缀经 `check_ids` 第 10 组断言**不与任何发布段码撞名**。
`forge gallery --todo WK --json` 的每条待补都带 `geo` 字段，可直接按前缀分组。

### 旧编码迁移（无损）

段码体系改过一轮，旧码全部登记为别名。**解析时新旧都命中，输出时只给新码**，
所以你手里存过的组合串、笔记、截图全部照常可用：

| 输入 | 解析结果 |
|---|---|
| `ST-001` | 赛璐璐平涂（新码） |
| `A1-001` | 赛璐璐平涂（旧码，永久可用） |
| `A1-01` | 赛璐璐平涂（旧 ID，永久可用） |
| `赛璐璐平涂` | 赛璐璐平涂（中文名） |
| `Cel Shading` | 赛璐璐平涂（英文名，含空格也能整体解析） |
| `赛璐珞` | 赛璐璐平涂（历史错写） |

编码可省略前导零（`ST-1` ≡ `ST-001`、`CB-1` ≡ `CB-001-000`），大小写与前后空格都不敏感。

### 组合串

多项用 `+`、`,`、`;` 或换行分隔，每项都可以是编码或中文名，可以混写：

```
ST-001 + 赛璐璐平涂 + TH-001
赛璐璐平涂 热血战斗
```

解析结果分四类，因为用户要区别对待：

- **命中** —— 输出规范编码 + 中文名，产出可直接复制的组合串；
- **跨层同名已收敛** —— 同一个词在多层存在时（如 `Cel Shading` 既是画风条目 `ST-001`
  又是上色节点 `VS-005-004`），按 **工具 &gt; 条目 &gt; 节点** 自动取一层。
  取了哪层、谁被遮住都会写在卡片里，遮住的那层**点编码即可切换**。
  依据：用户脑子里想的是「要一个能直接用的画风」，也就是条目层，
  把 86 个常用词（`赛璐珞`/`Cel Shading`/`mecha`/`废土`/`赛博朋克`…）全都挡在门外不划算。
- **同层重名待消歧** —— 同一层内确实分不清时（如两个条目都叫「粉彩」），
  列出候选让人选，**不静默替你决定**。跨层可以收敛，同层不可以。
- **未命中** —— 给出原因与最接近的候选，**绝不返回一个猜测结果**。

> **重复段也要说出来**。`ST-001 + 赛璐璐平涂` 指的是同一条目，
> 输出里只保留一条（出现两遍会被当成两个组件，组合结果就不对了），
> 但界面会显示「输入 2 段 · 合并重复 1 段」，并在卡片上标出另一个写法。
> 静默丢弃和静默替选是同一类错误：都让人以为整串都对了。

### 网页用法

1. 左侧「**编码工作台**」输入组合串，回车或点「解析组合」。
2. 每张卡片右上角显示**规范编码**（可点复制），下方小字保留旧 ID 便于对照旧文档。
3. 顶部搜索框可直接搜编码：`ST-001`、`A1-001`（旧码）与 `A1-01`（旧 ID）都等效。
4. 左侧「**编码总览**」查各段的编码范围与数量。

> **分隔符的一个坑**：空格不能当通用分隔符。`Cel Shading`、`Mobile Suit Gundam` 这类
> 英文名内部就有空格，按空格切会把名字劈成两半，再让两半各自去库里乱撞，
> 报错信息完全误导。实现见 `resolver.js` 的 `splitItems()`——按显式符号切，
> 英文名靠「贪心合并能命中的相邻词」保住。
> **它和 `smoke.js` 的分工**：`smoke.js` 用 vm + 假 DOM，只证明函数不崩；`ui_test.js` 用 jsdom 跑真实 DOM 与事件，能抓到「点了按钮页面一片空白」这类问题 —— 四个知识库视图曾经全空白，根因是 `buildFilters()` 抛 `TypeError` 打断了点击链，假 DOM 不会报这个。

> `data-core-more.js` 会 `STYLES.push(...STYLES_MORE)`，所以它**必须在 `data-core.js` 之后加载**。
> 由此产生一个易错点：**浏览器里 `STYLES` 已是全量 59 条**（push 生效），不要再 `register(STYLES_MORE)` 或 `concat(STYLES_MORE)`，否则 A5 全球流派 14 条会变成两遍。但 **Node `require` 时那条 push 不执行**（模块作用域隔离），所以 `build_md.js` 与工具脚本侧**必须**自己 concat。
> `prompt-kit.js` 必须在所有 `data-prompts-*.js` **之前**加载 —— 它声明全局收集容器 `PROMPT_SETS`，各正文文件通过 `PROMPT_SETS.push(...)` 自我注册。
> 新增同类文件时，记得同时改三处：`index.html` 的 `<script src>`、`build_md.js` 的 `PROMPT_FILES`、`tools/smoke.js` 的注入列表。

> **`registry.js` 必须最后加载**：它依赖全部 `lib-*` 节点数据与内联合并好的 `WORKS`/`STYLES`/`GENRES`。
> 它不猜全局变量名也不 `eval`——数据与依赖都由调用方显式传入：
> ```js
> REGISTRY.boot({ CODES, RESOLVER, ENGINE, data: { entries: [...], tools: [...] } })
> ```
> 传漏了会在 `REG.missing` 里报出来，而不是让码表静默空着。
> 登记完成后需 `render()` 重渲染一次，否则首屏卡片（渲染在登记之前）不显示编码。

> ⚠️ `prompt-kit.js` 里用 **`var`** 而不是 `const` 声明 `PROMPT_KIT`：浏览器 `<script>` 与 `vm` 沙箱中的顶层 `const` 都不会挂到 global object，会导致 `PROMPT_KIT is not defined`。

## 五层结构

| 层 | 内容 | 作用 |
|---|---|---|
| **第一层 画风流派** | 技法 14 · 年代 7 · 工作室 14 · 地区 10 · **全球流派 14** | 决定"画成什么样" |
| **第二层 代表作品** | 日本 112 · 国产 21 · 欧美 21 · 游戏 12 · 韩国 6 · 欧洲 35 · 拉美 5 · 北美 17 · 印度东南亚 5 | 借用具体作品的视觉语言 |
| **第三层 题材元素** | 7 大类 32 个题材 | 决定"画什么" |
| **第四层 排版图型** | 6 大类 30 种 | 决定"怎么摆" |
| **第五层 主题配色** | 12 套（主色 + 点缀色） | 决定"什么色" |
| **横切词条库** | 14 组约 150 个高频词 | 镜头、光影、服装等通用零件 |
| **实战工具** | 模板 / 负面词 / 平台语法 | 组装落地 |

**第四、五层为什么必须独立，不能混进画风**：

- **排版 ≠ 风格**。版式只管元素放在哪、留多少空白，不管笔触怎么画。
  混在一起就会出现「水彩风格的信息图」这种看似合理、实际两边都不到位的结果。
  同一张赛璐璐插画，套「上下图文卡」是小红书图，套「四格分镜」是分镜稿。
- **配色 ≠ 风格**。同一张插画换成克莱因蓝主导与换成柿子橙主导，是两张完全不同的作品。
  混进画风描述里，模型只会把颜色平均处理，不会真正换色调。
  所以配色层的主色会**以十六进制值直接写进提示词**，不给模型解释的机会。

两层各带建议画幅与注意事项，画幅本身就是提示词的一部分——
告诉模型「3:4 竖构图」与什么都不说，出的是两张不同的图。

### 全球流派层（A5-\*）的价值

这一层收录的不是某个国家，而是**动画史上被反复复刻的技术流派**，用来表达"日美中三线之外"的画面：

| ID | 流派 | 一句话要点 |
|---|---|---|
| A5-01 | 橡胶管动画 | 四肢任意弯曲、白手套，1930 年代美国 |
| A5-02 | Cuphead 水彩 | 真正的手绘水彩加纸纹与铅笔稿线 |
| A5-03 | 清晰线条派 | 线粗细均匀、色块平涂，背景却极写实（《丁丁》） |
| A5-04 | 爱尔兰装饰风 | 角色扁平、背景布满凯尔特纹样 |
| A5-05 | 欧式绘本水彩 | 墨线松动，颜料故意溢出轮廓 |
| A5-06 | 黏土定格 | 指纹、工具痕、真实摄影棚光 |
| A5-07 | 剪影剪纸 | 铰接影子加半透明背光分层 |
| A5-08 | 有限动画现代主义 | 极少线条加海报式构图 |
| A5-09 | 拼贴混合媒介 | 撕边、错配的材质、杂乱本身就是语言 |
| A5-10 | 孔版印刷 | 两三个专色、套印偏移、网点 |
| A5-11 | 童书绘本 | 无害轮廓、温暖配色、一眼看懂 |
| A5-12 | 转描 | 过于真实的运动自带恐怖谷 |
| A5-13 | 苏联东欧手绘 | 玻璃油画层叠、厚涂水粉、斯拉夫民间主题 |
| A5-14 | 花窗玻璃马赛克 | 黑色铅线分割彩色玻璃、背后透光 |

## 提示词卡：每一条都能直接出图

### 出图工作流：四步出一张图

打开 `index.html` → 左侧第一个「**出图工作流**」（侧栏最上方的「从这里开始」组）。
这是本库的主入口，其余视图是给你查细节用的。

| 步骤 | 段码 | 决定什么 | 候选 |
|---|---|---|---|
| ① 画风 | `ST` `ER` `SB` `RG` `MV` | 怎么画 | 59 |
| ② 题材 | `TH` | 画什么 | 32 |
| ③ 版式 | `LT` | 怎么摆 | 30 |
| ④ 配色 | `PL` | 什么色 | 12 |

四步选完，右边同时给出**中文正文 / 英文正文 / 标签速用版 / 负面词 / 建议画幅 /
画质档依据 / 授权提示**，每段旁边各有复制按钮。另有 5 个预设（小红书观点卡、电影分镜、
电商主图、角色设定页、活动海报），点开就是成品。

再往下是「**一键出图**」面板：点一下就把英文正文送进模型，图直接显示在面板里，
可下载或换一张 —— 省掉「复制 → 粘贴 → 等 → 下载」这一段搬运。

**模型**（默认 `GPT-Image 2`）：

| 模型 | 一键出图 | 说明 |
|---|---|---|
| **GPT-Image 2** | ✅ 需自己的 API key | 默认项。版面内文字渲染最好 |
| **Nano Banana 2.1** | ✅ 需 key | 官方清单标了 `paid_only` 且 `health: down`，可能要付费额度且当前故障 |
| **Midjourney** | ❌ | **没有公开出图 API**。给的是标签版 + `--ar` 参数串与官网入口 |
| **Flux** | ✅ 需 key | 写实与光影最好 |
| **Sana · 免 key** | ✅ 不要钱 | 约一半请求会被限流挡掉，自动重试 |

> **免 key 那条不能选 Flux / GPT-Image，这不是界面小气。**
> `image.pollinations.ai/models` 只返回 `["sana"]`；用五个不同模型名请求
> 同一提示词同一 seed，**返回文件的 md5 完全相同**。所以它叫「Sana」而不是「Flux」——
> 写成 Flux 就是骗用户，而用户会拿这张图去商用。

**出图比例**是这一屏里的独立选项，**不跟随版式的 `ratio`**：
`1:1`（默认）/ `9:16` / `16:9` / `3:4` / `4:3` / 自定义（如 `1024x1536`），
两档清晰度（长边 768 / 1024）。版式决定元素怎么摆，出图比例决定画布什么形状，
混在一起用户就没法控制自己拿到的是横图还是竖图。

### 免 key 通道的实测边界

实测结论（证据链见 `gallery-todo.md`）：**免 key Sana 通道对画风层基本不敏感**——
固定 seed 时仅画风不同的请求返回视觉相同的图；换 seed、画风前置，构图会变但画风仍不显形。

所以：免 key 通道适合**试构图与题材**，不能用来证明画风效果。
示例画廊 13 张画风正确的图走的是 keyed 通道；
「同一输入，六种画风」对比组需 keyed 模型受控制作，已列入 `gallery-todo.md` 待办。

### 一键抽卡：独立的一屏

侧栏第二项「**一键抽卡**」不在出图工作流里，是单独的一屏。
分开不是放不下，是两者的节奏相反：出图工作流是「已经想好要什么」，
抽卡是「还不知道要什么」—— 而抽卡恰恰要改掉工作流的四步选择，
混在一屏时用户会以为抽卡是「按当前四步随机换 seed」。

抽卡每次从库存里**随机抽一组组合**连着出图，每张的四步都是重新抽的
（不是同一提示词换 seed —— 那不叫抽卡，叫同一张图看六遍）。
抽到中意的点「**去精修**」，那组组合会带进**出图工作流**继续调；
两屏之间还有互相跳转的入口。

**抽卡池是照着库现算的，所以库升级它自己会变大。** 界面上没有任何写死的数量：

| 抽卡槽 | 来自哪一层 | 候选 |
|---|---|---|
| 画风 | `ST` `ER` `SB` `RG` `MV`（工作流的一步） | 59 |
| 题材 | `TH`（工作流的一步） | 32 |
| 版式 | `LT`（工作流的一步） | 30 |
| 配色 | `PL`（工作流的一步） | 12 |
| **可组合空间** | 各槽候选数相乘 | **679,680 种** |

- 槽位是从 `STUDIO.STEPS` **派生**的。以后在工作流里加一步，
  抽卡自动多一个槽，候选数、组合空间、界面那几行全都跟着变，**抽卡代码一行都不用改**。
- 不在工作流里的新维度，用 `GACHA.register({ key, label, seg, list })` 接进来；
  `list` 传函数则每次现取，补库之后立刻能抽到。
- **池规模不缓存**。缓存下来就会在补库后继续显示旧数字，而旧数字看起来完全正常，
  只是它已经不对了 —— 所以界面上的数字是每次现算的。
- 某一层为空时会**明确报警**。少一层约束的提示词照样能出图，只是出的不是你要的东西。

**可以锁定某一层**：每个槽后面的「随机 / 锁定」按钮把那一槽固定成
出图工作流里当前选的那一项（例如锁住画风，只抽题材、版式、配色），
可组合空间实时收窄并显示出来。

**出图的三个限制**：

- **串行出图，不是并发**，而且下一张的计时**从上一张收完开始**。
  免 key 通道并发发出去第 2 张起几乎全是 `402`，界面上就是一排失败灰卡片。
- **每张自动重试最多 3 次（退避 16/32/64 秒）**。实测发现限流不是干净的时间窗口：
  官方文档写「每 15 秒 1 个」，但按 3 / 15 / 25 / 35 / 60 秒各种间隔顺序请求
  **都出现过 402**，成功率与间隔基本无关（约一半被拒）。靠拉长间隔没用，只能退避重试。
  试满 3 次仍失败的卡上留一个「重抽」。
- **要 key 的通道与 Midjourney 都不开抽卡**：前者按 token 计费，
  一次抽 6 张等于用户没看见就花了六份钱；后者没有公开出图 API。
  两者都会给一个「切到 Sana · 免 key 抽卡」的按钮 —— 不只说不行，还给一条能走的路。

抽卡过程中可以随时「停止」，已抽出来的图留在原地。

### 按模型优化：同一组四步，五份词

**五个模型的提示词语法不是一回事。** 把同一段正文硬发给五个模型，
等于对五个模型说五种它听不懂的话 —— 而界面上看起来一切正常，
用户只会得出「这个库提示词不行」。

出图工作流里，**「默认提示词」在最上面**，下面每个模型一整块，
各带一句「这版改了什么」。点「**复制提示词**」直接取那一版；
点「**用这个模型出图**」把出图面板切到它。
抽卡页的每张卡也有「复制提示词」，取的是那张图实际用的那一版。

| 模型 | 它吃什么 | 这一版怎么写的 |
|---|---|---|
| GPT-Image 2 | 自然语言段落、指令句 | 禁项放句尾 —— 它对后部约束遵守得最牢 |
| Nano Banana 2.1 | 长指令 + 显式 `Avoid` | 「画什么 / 怎么摆 / 什么色 / 不要什么」拆成四句 |
| Midjourney | **只吃逗号标签 + `--` 参数** | 标签与参数**分开两个框**，画幅只由 `--ar` 承担 |
| Flux | T5 编码器，长描述性散文 | 不加权重语法 `(词:1.2)`（它不解析，会变成画面里的字面符号）、不加质量词 |
| Sana · 免 key | 自然语言，**中段长度** | 只取题材 + 配色 + 画幅 —— 过长的后半段会弱化主体 |

抽卡出图与单张出图发出去的都是**当前模型那一版**，不是通用正文 ——
否则界面上写「按 Flux 优化」，实际发的是通用正文，图不一样而界面看不出异常。

> 这一层的「各模型该怎么写」是**创作解释与工程判断**（`read`），
> 不是厂商的官方结论，也不是本库实测过的结果 ——
> 目前只有 Sana 一路真出过图。要实测了就升级单条标注，
> 不要把整张表标成实测，没测过的那几条会跟着沾光。

五条约定：取材一次五家共用 · 禁项不许丢 · 画幅只留一个出处 ·
不污染 `STUDIO.S` · 界面层不许按模型名写分支（判「无 API」用 `channel`）。
`tools/check_model_prompts.js`（130 项）逐条守着，
其中一条**真跑一次 jsdom 页面**确认渲染出的 HTML 没有拼接碎片 ——
少一个 `+` 号不会报错，只会让复制按钮点不动。

**出图前必须知道的四条边界**：

1. **提示词会离开你的电脑**，发到 `gen.pollinations.ai` 或 `image.pollinations.ai`。
   介意就别用这个按钮，复制正文去你自己的模型里跑 ——
   本库的授权分级只管文本，不管别人拿它做什么。
2. **右下角仍有通道水印**。`nologo` 只关掉左上角标，推理阶段强加的标记提示词管不了。
   **出图后必须自己裁掉，不要直接商用。**
3. **API key 只存在这一页的内存里**，不写硬盘、不进 URL；但请求会带上它。
   用完刷新页面就没了，别在公用电脑上填。
4. **图里的文字仍然是乱码**。版式预留的空白区留给后期排字。

> 通道只是可选加速路径，不是本库的一部分。核心资产是提示词正文，任何模型都能跑。

**四条设计纪律**：

1. **缺步不静默补**。只选一两步也能出图，但结果区会逐条写明缺了哪一步、缺了会怎样。
   刻意不给一段「看着完整、实际少一层约束」的提示词——那种提示词照样能出图，
   但出的是错的东西，比报错更难排查。同理，一个都没选时出图按钮是**禁用态**而不是
   「点了才告诉你没选」。
2. **配色与画幅落到具体值**。`#1B4FD8`、`3:4` 直接进正文，不交给模型推测。
   出图比例与正文里的画幅句**同源**：选 16:9 时正文那句会被改写成 16:9，
   请求参数也是 `768×432`。只改一边等于给模型两套矛盾指令。
3. **授权随选择走**。选了 R2 的画风却在出商业图，界面上当场说清要先做什么。
   一个都没选时**不显示**「当前所选均为 R0」——那时候根本没有所选，
   说成 R0 等于凭空发一张「可商用」的假通行证。
4. **做不到的事标做不到**。Midjourney 没有公开 API，就不给假的出图按钮；
   免 key 通道实际只出 Sana，就照实叫 Sana。风险写在按钮下方的黄条里，
   不埋在 tooltip 里——tooltip 是点开才看的东西，而用户是先点了才发现。

逻辑在 `assets/studio.js`，出图通道在 `assets/render.js`，请求执行在 `assets/render-net.js`
（单张出图与抽卡共用一份 —— 各写一套的话限流退避只会修在其中一边），
按模型改写在 `assets/model-prompts.js`，
抽卡池在 `assets/gacha.js`，界面在 `assets/studio-ui.js` 与 `assets/gacha-ui.js`。
体检：`tools/check_studio.js`（216 项）、`tools/check_gacha.js`（123 项）、
`tools/check_model_prompts.js`（190 项）、`tools/ui_test.js`（315 项）。

### perStyle：逐模型 × 逐风格的激活强度

按模型统一改写解决的是**模型之间的差异**（MJ 只吃标签、Flux 不认权重语法）。
但还有一类差异**与风格有关**：

>有些风格的名字模型根本叫不动。

「吉卜力」强（模型见过），「1998 年监管会审查下的 TV 动画作画规范」弱（名字没有共识），
「某种我说不出名字的湿画法」无——只能给特征词。

`assets/model-prompts.js` 的 `STYLE_ACTIVATION` 表为**每个模型 × 每个画风**标
`strong` / `weak` / `none`，界面上是一枚徽标（画风名 强 / 弱 / 叫不动 / 未标定），
`note` 里附一句推断依据。

**三档的差别不只是标签**：

| 档 | 含义 | 处理 |
| --- | --- | --- |
| `strong` | 名字是模型见过的概念 | 给名字即可 |
| `weak` | 有共识但不牢靠 | 名字给方向，特征词给落点 |
| `none` | **名字在当前模型里没有对应概念** | 不给名字，只给特征 |

`none` 档不给名字是有理由的：硬给一个模型叫不动的名字会引入错误先验，
它可能按名字的常见误读画——**比不给更糟**。

当前标定 25 条（ST/ER/SB/RG/MV 四段）。**作品段（WK）一律不逐条标**：
命名本身就是专有名词且涉及在世作者，标错会误导商用。

三条必须守住的：

1. **这是 `read`（工程判断），不是 `test`（实测）。** 标定依据是画风特征名的通用性推断，
   真要升级成实测需对每个风格 × 每个模型实际出图看命中——那是几十次出图的量。
2. **`unknown` 必须显式说「未标定」**，不能默认当成 strong。
   把「不知道」说成「知道」，是这张表唯一真正危险的失效方式。
   `unknown` 有自己的视觉样式（虚线框），和「强」长得不一样。
3. **标定不删标签。** 曾试过按强度压缩 MJ 的内容词（weak 压到 16 个），
   结果 MJ 版与默认正文脱钩——而「同源」是这一层的核心承诺。
   撤回：标定只进 `note`，标签构成不变。

### 中文正文：133 条

`data-prompts-zh-st1~3.js` 与 `data-prompts-zh-gn1~2.js` 共 91 条，
加上排版 30 条与配色 12 条自带 `gptZh`，**全部「可直接出图」的条目都有中文正文**。

| | 英文正文 | 中文正文 |
|---|---|---|
| 文件 | 15 个 `data-prompts-*.js` | 5 个 `data-prompts-zh-*.js` |
| 条数 | 324 | 91（+ 排版配色自带 42） |
| 覆盖 | 含作品层 | **不含作品层** |
| 查表 | `PROMPT_SETS` | `PROMPT_ZH.get(id)` |

**中文版不是逐句翻译。** 保持「场景 → 技法执行 → 色彩 → 构图 → 排除项」的结构，
但按中文语感重写——直译的英文长句在中文模型里会散架。

**作品层 233 条刻意不给中文正文**：它们按授权分级是 R3，本就不能直接商用，
为它们做正文等于鼓励误用。这是授权边界，不是遗漏。

两版**分表不合并**：中文正文如果也 `push` 进 `PROMPT_SETS`，同一个 id 会出现两条记录，
后读的覆盖先读的，表现是「中文版莫名变成英文」。所以 `PROMPT_ZH` 是独立查表。

排版与配色的正文按同一条授权纪律处理：**只写可观察的视觉特征，不点名工作室与创作者**。
名称与徽章保留，但正文可以安全用于出图（14 条工作室层正文经 `RIGHTS.scan()` 全部 clean）。

### 英文正文

三层 + 作品共 324 条，**每一条都有手写的 GPT 英文正文**，不是标签堆。当前用量分布：

| 文件 | 覆盖范围 | 条数 |
|---|---|---|
| `data-prompts-st1.js` | 画风流派 A1 技法 14 + A2 年代 7 | 21 |
| `data-prompts-st2.js` | 画风流派 A3 工作室 14 + A4 地区 10 | 24 |
| `data-prompts-st3.js` | 画风流派 A5 全球流派 14 | 14 |
| `data-prompts-gn1.js` | 题材元素 G-01~16（战斗 / 幻想 / 科幻） | 16 |
| `data-prompts-gn2.js` | 题材元素 G-17~32（日常 / 运动 / 悬疑 / 国风） | 16 |
| `data-prompts-jp1~4.js` | 日本作品 W-J01~112 | 85 + 27 |
| `data-prompts-cn1.js` | 国产 W-C01~21 | 21 |
| `data-prompts-ww1.js` | 欧美动画 W-W01~20 | 20 |
| `data-prompts-gk1.js` | 二次元游戏 W-G01~12 + 韩国 W-K01~06 | 18 |
| `data-prompts-if1.js` | 印度东南亚 W-I01~05 + 法比 W-F01~12 | 17 |
| `data-prompts-fr1.js` | 英爱北欧 W-F13~23 + 苏联东欧德西 W-R01~12 | 23 |
| `data-prompts-ln1.js` | 拉美 W-L01~05 + 北美 W-N01~17 | 22 |

### 示例画廊：提示词 × 实际出图

选了 13 条视觉差异最大的画风条目（赛璐璐、数码柔光、厚涂、水彩、线稿、Q 版、漫画页、水墨、浮世绘、像素、剪影、草稿、霓虹），每条用**真实出图**得到，放在 `examples/` 下、**按旧 id 命名**（`examples/A1-01.png`）。

旧 id 永久可解析到规范码（`code-map.js` 登记了四种写法），所以图与词条的对应关系不会因重排而错位。扩展名不统一——出图通道原生格式是 jpg 就用 jpg，转码会掉质量。

画廊只收录 **R0 自由** 条目——图和提示词都可以直接进任何商业用途。
**配图之前必须用 `RIGHTS.inspect(entry)` 查授权**，注意三个接口的签名不一样：

| 接口 | 收什么 | 传 id 会怎样 |
| --- | --- | --- |
| `RIGHTS.tierOf(text)` | **文本** | 扫 `"A3-01"` 本身，扫不到标识 → 静默判 R0 |
| `RIGHTS.inspect(entry)` | 整条条目 | 唯一正确用法 |
| `STUDIO.tierOf()` | **不接参数**，读全局选中态 | 传 id 被忽略，遍历时返回 null |

后两种误用都不报错，只是把 R1/R2/R3 静默当成「可商用」——
`A1-06` 就是这么被误判成 R0 的（`inspect()` 查出 R2，因为描述里写了「今敏」）。

**配图进度**（画廊顶部有进度条）：

```bash
node codex-skill/anime-prompt-forge/scripts/forge.js gallery           # 已配 + 覆盖率
node codex-skill/anime-prompt-forge/scripts/forge.js gallery --todo ST # 某段待补的 R0 条目
node codex-skill/anime-prompt-forge/scripts/forge.js gallery --json    # 机器可读
```

**段码共八个：`ST ER SB RG MV TH LT PL`**（画风/年代/工作室/地区/全球流派/题材/版式/配色）。
只跑其中四段，汇总数就会与候选池对不上。

当前 **13 张 · 覆盖 10%**，目标 50% 以上。R0 待补 94 条，另有 26 条授权受限不在其中。
完整清单见 [`gallery-todo.md`](gallery-todo.md)。

`--todo` 只列 R0：R1 起要么署名要么改写，配图前要先过授权层，
把它们混进待补清单等于给出补不了的活儿。
其中 SB（工作室）段 14 条里只有 1 条真 R0 —— 工作室名本身就受保护，
这一段几乎不可能靠配图补齐，这是设计如此而不是数据缺失。

网页端在侧栏第一个「**示例画廊**」视图查看：图 + 看点 + 可复制正文/标签版。
文档版见《动漫提示词库.md》第 0b 章。

### 正文的固定骨架

每条正文都按同一套信息顺序写死，这样**换任何一个词都不会破坏还原度**：

```
流派/年代/工作室渊源 → 主体与服装道具 → 动作 → 环境 → 媒介与笔法 → 构图镜头 → 配色 → 收尾约束句
```

收尾约束句永远是 `No text, logos or watermarks.`，保证画面干净。

### 画质档位：逐条判定，五档

`prompt-kit.js` 对每条**逐条**判定画质档 —— 把 `kw`、`en`、`zh`、`cat`、`grp` 拼成一条证据文本，按正则命中情况累加权重，取分数最高的一档；一条都不命中才落 `clean`。每张卡都会显示**判定依据**（具体命中了哪个词），不凭空贴标签。

| 档位 | 命中证据 | 追加的画质词 | 数量 |
|---|---|---|---|
| `clean` 数字干净 | 默认档，无年代/三维/手绘特征 | `high resolution, ultra-detailed, sharp clean lineart` | 232 |
| `painter` 笔触画质 | 油画、水彩、水粉、蛋彩、蜡笔、粉笔、水墨、玻璃画、版画 | `painterly brushwork, rich impasto texture` | 43 |
| `retro` 年代做旧 | VHS、录像带、film grain、vintage、1970s/1980s、赛璐璐原稿、扫描件 | `unrestored scan, era-accurate palette, film grain` | 30 |
| `print` 印刷网点 | 漫画网点、丝网印刷、孔版、木刻、拼贴、报纸 | `halftone dots, ink on paper, paper fiber` | 10 |
| `cg` 三维渲染 | 3d render、unreal、low poly、cel shaded 3d、黏土定格 | `8k, physically based materials, refined shading` | 9 |

两条设计约束：

- **年代层 ≠ 做旧层**。早前用 `/^a2-/` 把整个年代板块一律判成做旧，结果 `10 年代高清电视动画`、`20 年代 UHD 特效流` 被错标 —— 这两条明明是现代高清，正确的落点是 `clean`。
- **带否决规则**。`复古像素游戏` 不算年代胶片，`emoji 贴纸` 不算印刷网点，避免单个词把条目拖进错误语境。

> **做旧档仍是最关键的一条例外**：它**刻意避开** `high resolution` 与 `ultra-detailed`。给怀旧题材加这些词，模型会把胶片颗粒和褪色一起"修"掉，年代感就没了。印刷网点档同理 —— 数字柔化会毁掉油墨与纸张的物理感。

### 两种方言，一套数据

- **GPT 正文**手写，保证每个条目的信息密度与还原度。
- **标签版 / 负面词**由 `prompt-kit.js` **确定性派生**（`kw` + 对应档位的画质词，去重保序；负面词按档位追加），不手工维护第二份，所以两者永远不会写歪、永远一致。

### 卡内字段与「实战工具」板块的关系

两者不重复，分工不同：

| 位置 | 内容 | 什么时候用 |
|---|---|---|
| 卡片折叠区「条目词 / 档位收尾 / 标签全量 / 负面全量」 | **已按该条判定好档位的成品**，直接复制 | 常规出图，复制就走 |
| 侧栏「负面提示词」板块 | 8 组**通用负面词库**，按场景分组 | 需要按场景增减，或卡片里的不够用时 |
| 侧栏「平台语法」板块 | 8 条**平台权重语法与参数**差异 | 搬到 MJ / SD / Flux 时对照改写 |

进入这三个板块时，筛选条位置会显示该板块的定位说明，避免与卡片里的内容混淆。

## 布局：配方坞不许脱离文档流

**硬约束：配方坞（`.dock`）必须是 `.main` 的最后一个 flex 子项，且不能用 `position:fixed`。**

早前它是 `.app` 的兄弟节点 + `position:fixed`，完全脱离文档流，会盖住最后一排卡片。
靠给 `.body` 加 `padding-bottom` 避让是**补不住的** —— 坞的高度随配方数量增长，padding 是死值。

现在的结构与样式分工：

```
.app  (flex, row, 100vh)
├─ .side
└─ .main (flex, column)
   ├─ .top     (flex: 0 0 auto)
   ├─ .filters (flex: 0 0 auto)
   ├─ .body    (flex: 1 1 auto; min-height: 0; overflow-y: auto)  ← 唯一可伸缩的
   └─ .dock    (flex: 0 0 auto)                                   ← 高度随内容
```

四条缺一不可：

| 声明 | 作用 |
|---|---|
| `.main{flex-direction:column}` | 让 top / filters / body / dock 纵向排列 |
| `.body{flex:1 1 auto; min-height:0; overflow-y:auto}` | 分走全部剩余高度并独立滚动 |
| `.dock{flex:0 0 auto}` | 坞高度由内容决定，不被内容区挤压 |
| `.dock .items{overflow-x:auto}` 且**不设** `flex-wrap:wrap` | 配方变多时横向滚动，不换行把坞撑高 |

`.dock` 自身保留 `flex-wrap:wrap`，是为了窄屏时三个按钮能换行 —— 这是有意的，与 `.items` 的不换行是两件事。

## 网页用法

1. 双击 `index.html`（无需联网、无需本地服务器）。
2. 左侧切换板块，上方筛选条按类别过滤，搜索框支持中英文与工作室名（如"京阿尼""ufotable""新海诚"）。
3. 每张卡片上方是 **GPT 出图提示词**区块，右上角显示**档位徽章**（悬停看判定依据），「复制正文」一次复制整段；点开折叠面板可拿到**判定依据 / 条目词 / 档位收尾 / 标签全量 / 负面全量**。
4. 每张卡片还可**点单个 keyword 复制**、**复制整组关键词**。
5. 点「＋ 加入配方」把多条目的词累积到底部配方坞，再点「合成 Prompt」按
   **题材 → 作品 → 画风 → 词条** 的顺序自动排序，并补上画质收尾词。
6. 左侧「开放式知识库」四个视图：十二库浏览、统一检索、组合工作台、变形工作台。

> 复制功能已做 `file://` 兼容降级，双击本地文件打开也能正常复制。

## 拼装黄金顺序

```
主体数量 → 角色特征 → 服装道具 → 动作表情 → 环境背景 → 构图镜头 → 光影 → 画风层 → 画质词
```

推荐结构：**主画风 1 个 + 修饰层 2~3 个 + 画质层 1 组**，总词数 30~60。
画面发糊时先**删词**，每次只调一个变量，才能稳定复现。

## 开放式知识库：从「查表」到「组合」

前面的三层是**已经收录好**的东西。这一层解决的是**没收录的怎么办**。

### 四条边界（任何时候都不得违反）

| 边界 | 说明 |
|---|---|
| **地域 ≠ 风格** | 「法国动画」是地理来源，不是画风；同一地域可以有几十种画风 |
| **题材 ≠ 画风** | 「赛博朋克」是题材，可用厚涂、平涂、三维任何一种画法表现 |
| **作品名 ≠ 技法** | 作品名只是检索入口，真正要抽出的是它背后的线条与上色方式 |
| **模型参数 ≠ 通用提示词** | 种子、步数、采样器属于某一次运行，不属于条目本身 |

### 十二个库 · 537 个节点

| # | 库 | 节点 | # | 库 | 节点 |
|---|---|---|---|---|---|
| 01 | 领域与形式库 | 69 | 07 | 故事与表演库 | 31 |
| 02 | 全球文化与历史库 | 40 | 08 | 镜头与时空库 | 37 |
| 03 | 作品与实体库 | 14 | 09 | 声音与语言库 | 24 |
| 04 | 视觉风格库 | 88 | 10 | 生产与交付库 | 33 |
| 05 | 角色与生物库 | 74 | 11 | 组合与变形库 | 37 |
| 06 | 世界与资产库 | 61 | 12 | 检索与验证库 | 29 |

节点结构：`{ id, lib, up, path, zh, en, kw, alt, desc, slot }`。
带 `slot` 的可直接参与组合，不带的是容器，只用于归类。

### 九个槽位：任何提示词都由它们装配而成

```
target 生成目标 → medium 媒介形式 → subject 基础对象 → content 内容与情境 → style 视觉表现
      → frame 画面控制 → motion 动态控制 → spec 输出规格 → limit 保留与排除
```

缺哪个槽，就从对应的库里补。组合引擎会给出评级：**可直接出图 / 需要微调 / 存在冲突 / 证据不足**。

冲突判定分两类，都写在代码里而不是靠感觉：

1. **组内互斥**：`WD-02 天气`、`LN-01 景别`、`LN-06 画幅`、`CB-03 年龄` 等 17 个分支同一组内只能选一个。
2. **跨组冲突**：如「禁止文字 + 日式拟声词」、「印刷物料 + 年代老化」，逐条给出理由。

### 变形：保留项 / 变化项 / 强度

只说「改成某种风格」是不可执行指令。变形必须写明保留什么、改什么：

```js
ENGINE.morph({
  base:   { subject:["CB-01-1"], style:["VS-04-1"], frame:["LN-01-3"] },
  change: { style:["VS-11-2"] },        // 只换风格槽
  keep:   ["CB-01-1"],                  // 身份锚点锁死
  strength: "medium"                    // 轻度 / 中度 / 重构
});
```

### 网页的四个新视图

左侧「开放式知识库」分组下：

- **十二库浏览** —— 按库逐层展开 537 个节点，可点关键词复制。
- **统一检索** —— 六个入口（名称 / 别名 / 跨语言 / 描述式 / 以图 / 空结果兜底），结果分成「已有提示词卡，可直接复制」与「知识库节点，可参与组合」两类。
- **组合工作台** —— 九个槽位勾选模块，右侧实时出评级、冲突、GPT 正文、标签版、负面词，五个预设可一键套用。
- **变形工作台** —— 载入组合结果作基准，指定变化项与强度，输出变化清单、保留清单与检查清单。

### 引擎 API

```js
ENGINE.retrieve("赛璐璐平涂")     // → { hits:[…], ready:true }  命中已有 324 条
ENGINE.retrieve("黄昏")           // → 落到知识库节点
ENGINE.retrieve("不存在的东西")   // → { empty:true, hint:"…" }  空结果给兜底而不是假装找到
ENGINE.compose({ subject:["CB-01-1"], style:["VS-04-1"], frame:["LN-01-3"] })
ENGINE.morph({ base, change, keep, strength })
ENGINE.decompose("竖屏赛璐璐少女特写，黄昏街道，无文字")  // → 逐槽位拆解
ENGINE.imageChecklist()           // → 以图检索的七个问诊问题
ENGINE.stats()                    // → { nodes, entries, slots, byLib }
```

## 扩展与维护

数据源每条的结构（以画风为例）：

```js
{
  id: "A3-02", zh: "京都动画（京阿尼）", en: "Kyoto Animation Style", cat: "工作室",
  kw: ["kyoto animation", "kyoani style", "soft round face", ...],  // 英文关键词
  desc: "中文视觉特征说明",                                          // 纯中文
  note: "踩坑提示",
  demo: "1girl, ..., kyoani style, ..."                             // 英文示例
}
```

新增一条 GPT 正文，只需在对应文件里加一项，无需改动任何渲染代码：

```js
{ id:"A1-01", gpt:"Classic Japanese cel-shaded anime illustration: a teenage girl ..." }
```

> **写数据的经验**：
> 1. 中文说明写成**纯中文**（不要在中句里夹英文单词），`kw` / `demo` / `gpt` 写成**纯英文**。两类字段分开放，可显著降低数据出错率。
> 2. **单次写入务必控制在 30 条以内**。实测一次性写 57 条会产生严重的中英混杂污染与结构损坏，而拆成 ≤30 条一批则零污染 —— 这是本项目踩过最大的坑。
> 3. 不要用什么正则去改 HTML/JS 源，容易把 `var x = \`...\`` 磨成裸字符串导致 `Unexpected token '<'`。用显式字符串替换。

改完数据源后执行：

```bash
node build_md.js            # 重新生成 Markdown（含十二库与引擎章节）
node tools/ui_test.js       # 真实 DOM 测试：侧栏逐点 + 出图工作流 + 提示词卡 + 遮挡回归（最优先跑）
node tools/smoke.js         # 冒烟测试（提示词卡 324/324 + 知识库视图 + 引擎）
node tools/check_studio.js  # 出图工作流体检（四栏候选 / 中英正文 / 缺步诊断 / 授权随选择走）
node tools/check_engine.js  # 引擎冒烟：十二库 / 检索 / 组合 / 变形 / 冲突判定
node tools/check_codes.js   # 编码体系：唯一 / 文法统一 / 无漏编 / 旧码迁移 / 组合串 / 清单一致
node tools/check_ids.js     # 编号漂移：WK 冻结名单 / 追加不挪号 / 四写法 / 三源互证 / 全库引用扫描
node tools/check_rights.js  # 授权契约：分级落库 / 误报 / 正文无IP / 去标识化 / 中文正文 / 商用矩阵
node tools/check_prompts.js # 提示词卡体检：重复 ID / 非 ASCII 污染 / 字数
node tools/tier_audit.js    # 画质档位分布：分板块统计 + 反向抽查
node tools/inventory.js     # 覆盖度盘点（新增条目后先看缺哪些）
python tools/detect_latin.py assets/*.js   # 中文字段混拉丁词扫描
python tools/check_han.py assets/*.js      # 繁体 / 日式汉字泄漏扫描
```

> **改 `index.html` / `open-ui.js` / `studio-ui.js` / 任何 CSS 后一定要跑 `ui_test.js`。**
> `smoke.js` 的假 DOM 抓不到渲染中断与布局遮挡类问题 —— 这两类都曾让页面整片失效/被盖住，
> 而所有旧检查都显示通过。
>
> 想肉眼核对出图工作流那一屏：`node tools/shot_studio.js shots/out.png 0`
> （第二个参数是预设序号，留空拍初始空态）——用无头 Chrome 截真图，不靠 jsdom 猜。

> **新增一个数据文件时，改三处**：`index.html` 的 `<script src>`、
> `tools/_loadlist.js` 的对应清单、`build_md.js` 的登记来源。
> `check_codes.js` 第【9】组会比对清单与页面，少一处会红——
> 之前 `tier_audit` 少抄 `data-misc.js` 一直没人发现，就是因为清单错了不报错。
> 节点数据同样遵守「单次写入 ≤30 条」的经验值。
