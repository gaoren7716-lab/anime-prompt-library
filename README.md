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
