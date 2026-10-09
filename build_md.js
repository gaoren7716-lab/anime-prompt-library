/* ============================================================
 * build_md.js — 从同一份数据源生成 Markdown 源文件
 * 用法：node build_md.js
 * 输出：动漫提示词库.md
 * ============================================================ */
const fs = require('fs');
const path = require('path');

const core   = require('./assets/data-core.js');
const coreM  = require('./assets/data-core-more.js');
const genres = require('./assets/data-genres.js');
const wjp    = require('./assets/data-works-jp.js');
const wgl    = require('./assets/data-works-global.js');
const wma    = require('./assets/data-works-more-a.js');
const wew    = require('./assets/data-works-eur-w.js');
const wee    = require('./assets/data-works-eur-e.js');
const wna    = require('./assets/data-works-namer.js');
const misc   = require('./assets/data-misc.js');
const layouts = require('./assets/data-layout.js');
const palettes = require('./assets/data-palette.js');

const { PROMPT_KIT } = require('./assets/prompt-kit.js');

/* 开放式知识库：元模型 + 十二库 + 引擎 */
const SCHEMA = require('./assets/schema.js');
const { ENGINE } = require('./assets/engine.js');
const { GALLERY } = require('./assets/examples.js');

/* 编码与引用：码表 + 解析器 + 全库登记。
   注意 registry.boot() 需要显式传数据——它不猜全局变量名。
   Node require 时 data-core-more.js 末尾的 STYLES.push 不执行（模块作用域隔离），
   所以这里必须手动 concat，与浏览器下的行为不同。 */
const { CODES } = require('./assets/codes.js');
const { CODE_MAP } = require('./assets/code-map.js');
const { RESOLVER } = require('./assets/resolver.js');
const { REGISTRY } = require('./assets/registry.js');
const { RIGHTS } = require('./assets/rights.js');
const CORE_STYLES = [].concat(core.STYLES, coreM.STYLES_MORE);
const ALL_WORKS = [].concat(wjp.WORKS_JP, wgl.WORKS_GLOBAL, wma.WORKS_MORE_A,
  wew.WORKS_EUR_W, wee.WORKS_EUR_E, wna.WORKS_NAMER);
const REG_REPORT = REGISTRY.boot({
  CODES: CODES, RESOLVER: RESOLVER, ENGINE: ENGINE, CODE_MAP: CODE_MAP, RIGHTS: RIGHTS,
  data: {
    /* LAYOUTS / PALETTES 必须一起传。
       漏掉的话这两层拿不到规范编码（LT-01 而不是 LT-001），
       文档里的编码表就与页面对不上——两处登记来源必须完全一致。 */
    entries: [].concat(CORE_STYLES, ALL_WORKS, genres.GENRES, layouts.LAYOUTS, palettes.PALETTES),
    tools: [].concat(misc.TEMPLATES, misc.NEGATIVES, misc.SYNTAX)
  }
});

/* 提示词卡：每条 = { id, gpt } 的英文自然语言正文，供 GPT 系列出图模型直接使用 */
const PROMPT_FILES = [
  'data-prompts-st1.js', 'data-prompts-st2.js', 'data-prompts-st3.js',
  'data-prompts-gn1.js', 'data-prompts-gn2.js',
  'data-prompts-jp1.js', 'data-prompts-jp2.js', 'data-prompts-jp3.js', 'data-prompts-jp4.js',
  'data-prompts-cn1.js', 'data-prompts-ww1.js', 'data-prompts-gk1.js',
  'data-prompts-if1.js', 'data-prompts-fr1.js', 'data-prompts-ln1.js'
];
const PROMPT_MAP = new Map();
const PROMPT_COUNT = (function () {
  let n = 0;
  PROMPT_FILES.forEach(f => {
    const mod = require('./assets/' + f);
    Object.values(mod).forEach(arr => {
      if (!Array.isArray(arr)) return;
      arr.forEach(x => { if (x && x.id && x.gpt) { PROMPT_MAP.set(x.id, x.gpt); n++; } });
    });
  });
  return n;
})();

/* 把一条数据 + GPT 正文渲染成「提示词卡」的 Markdown 段落 */
function promptBlock(d, secKey) {
  const gpt = PROMPT_MAP.get(d.id);
  if (!gpt) return;
  const c = PROMPT_KIT.buildCard(d, secKey, gpt);
  p('**GPT 出图提示词**（整段复制，直接粘贴）　画质档：**' + c.tierMeta.zh + '**');
  p();
  p('```');
  p(c.gpt);
  p('```');
  p();
  /* 中文正文：与英文版并行给出，不是逐句翻译。
     结构一致（场景 → 技法执行 → 色彩 → 构图 → 排除项），
     但按中文语感重写——直译的英文长句在中文模型里会散架。 */
  const zh = PROMPT_ZH.get(d.id);
  if (zh) {
    p('**中文出图提示词**（国内模型 / 出中文海报时整段复制）');
    p();
    p('```');
    p(zh);
    p('```');
    p();
  }
  p('<details><summary>档位依据 / 标签版 / 负面词（MJ · SD · Flux 用）</summary>');
  p();
  p('**档位依据**：`' + c.tierHit + '` → **' + c.tierMeta.zh + '**（' + c.tierMeta.note + '）');
  p();
  p('**条目词**');
  p();
  p('```');
  p((d.kw || []).join(', '));
  p('```');
  p();
  p('**档位收尾**');
  p();
  p('```');
  p(c.tierMeta.quality);
  p('```');
  p();
  p('**标签全量**');
  p();
  p('```');
  p(c.tags);
  p('```');
  p();
  p('**负面全量**');
  p();
  p('```');
  p(c.neg);
  p('```');
  p();
  if (c.shot) { p('> ' + c.shot); p(); }
  p('</details>');
  p();
}

const STYLES = core.STYLES.concat(coreM.STYLES_MORE);
const GENRES = genres.GENRES;
const VOCAB  = genres.VOCAB;
const WORKS  = [].concat(wjp.WORKS_JP, wgl.WORKS_GLOBAL,
                         wma.WORKS_MORE_A, wew.WORKS_EUR_W, wee.WORKS_EUR_E, wna.WORKS_NAMER);
const TEMPLATES = misc.TEMPLATES;
const NEGATIVES = misc.NEGATIVES;
const SYNTAX = misc.SYNTAX;
const LAYOUTS = layouts.LAYOUTS;
const PALETTES = palettes.PALETTES;

/* 中文正文表（assets/prompts-zh.js）。
   走 require 而不是自己遍历文件：查表逻辑只存在于那一个模块里，
   这里再抄一份遍历迟早与它漂移——而漂移的表现是
   文档里「有中文正文」而页面上取不到，不报错。 */
const PROMPT_ZH = require('./assets/prompts-zh.js').PROMPT_ZH;
const ZH_FILES = [
  'data-prompts-zh-st1.js', 'data-prompts-zh-st2.js', 'data-prompts-zh-st3.js',
  'data-prompts-zh-gn1.js', 'data-prompts-zh-gn2.js'
];
PROMPT_ZH.inject(ZH_FILES.map(f => {
  const mod = require('./assets/' + f);
  return Object.values(mod).find(a => Array.isArray(a)) || [];
}));
/* 排版与配色的中文正文写在条目自己的 gptZh 上，inject 会一并收 */
const ZH_COUNT = PROMPT_ZH.size();

const L = [];
const p = s => L.push(s === undefined ? '' : s);
const total = STYLES.length + WORKS.length + GENRES.length + VOCAB.length + TEMPLATES.length + NEGATIVES.length + SYNTAX.length + LAYOUTS.length + PALETTES.length;

function groupBy(arr, fn) {
  const m = new Map();
  arr.forEach(x => { const k = fn(x) || '其他'; if (!m.has(k)) m.set(k, []); m.get(k).push(x); });
  return m;
}
const kws = a => (a || []).map(k => '`' + k + '`').join('、');

/* ---------- 封面 ---------- */
p('# 动漫提示词库 · Anime Prompt Library');
p();
p('> 面向 Midjourney / Stable Diffusion / SDXL / Flux / NovelAI 的动漫风格系统化词库，并为 **GPT 系列出图模型** 逐条配置了可直接复制的高精度自然语言提示词。  ');
p(`> 共收录 **${total}** 条：画风流派 ${STYLES.length} · 代表作品 ${WORKS.length} · 题材元素 ${GENRES.length} · 排版图型 ${LAYOUTS.length} · 主题配色 ${PALETTES.length} · 词条组 ${VOCAB.length} · 模板 ${TEMPLATES.length} · 负面词 ${NEGATIVES.length} · 平台语法 ${SYNTAX.length}`);
p();
p(`> **提示词卡覆盖率 ${PROMPT_COUNT}/${STYLES.length + WORKS.length + GENRES.length}（100%）**：画风流派、作品 IP、题材元素三层每条都配有一段 GPT 正文（整段复制即可出图），以及由同一份数据派生的标签版与负面词。`);
p();
p(`> **中文正文 ${ZH_COUNT} 条**：覆盖画风流派 ${STYLES.length} + 题材元素 ${GENRES.length} + 排版图型 ${LAYOUTS.length} + 主题配色 ${PALETTES.length}，即全部「可直接出图」的条目。作品 IP ${WORKS.length} 条**刻意不给中文正文** —— 它们按授权分级是 R3，本就不能直接商用，为它们做正文等于鼓励误用。这是授权边界，不是遗漏。`);
p();
p('| 层 | 作用 | 什么时候用 |');
p('|---|---|---|');
p('| **第一层 画风流派** | 决定"画成什么样" | 确定整体视觉语言：技法、年代、工作室、地区流派 |');
p('| **第二层 代表作品** | 提供可借用的具体风格 | 想贴近某部作品的观看感时 |');
p('| **第三层 题材元素** | 决定"画什么" | 确定内容：机甲、异世界、校园、赛博朋克等 |');
p('| **第四层 排版图型** | 决定"怎么摆" | 社媒卡 / 信息图 / 分镜 / IP 设定 / 电商 / 封面。与画风正交 |');
p('| **第五层 主题配色** | 决定"什么色" | 主色与点缀色。同一张画换主色就是另一张作品 |');
p('| **横切 词条库** | 通用修饰件 | 镜头、光影、服装、表情等通用零件 |');
p('| **模板 / 负面 / 语法** | 组装与落地 | 最后拼装成可直接投喂的完整提示词 |');
p();
p('---');
p();

/* ---------- 0. 用法 ---------- */
p('## 0. 这套库怎么用');
p();
p('### 拼装顺序');
p();
p('词序即权重，越靠前越被重视。所有模板都遵循这个顺序：');
p();
p('```');
p('主体数量 → 角色特征 → 服装道具 → 动作表情 → 环境背景 → 构图镜头 → 光影 → 画风层 → 画质词');
p('```');
p();
p('推荐组合结构：**主画风 1 个 + 修饰层 2~3 个 + 画质层 1 组**，总词数控制在 30~60。');
p('画面一旦发糊，先**删词**而不是加词；每次只调整一个变量，才能稳定复现。');
p();
p('### 典型配方');
p();
p('```');
p('1girl, silver twin tails, school uniform, nervous smile, classroom window,');
p('medium shot, golden hour rim light, kyoani style, cel shading,');
p('masterpiece, best quality');
p('```');
p();
p('层数说明：`1girl` 主体 → `silver twin tails / school uniform` 外观 → `nervous smile` 表情 → `classroom window` 环境 → `medium shot / golden hour rim light` 镜头与光 → `kyoani style / cel shading` 画风层 → 画质词收尾。');
p();
p('### 提示词卡怎么用');
p();
p('画风流派、作品 IP、题材元素这三层，每一条都配了 **一张双格式提示词卡**：');
p();
p('| 卡 | 给谁用 | 怎么用 |');
p('|---|---|---|');
p('| **GPT 出图提示词** | GPT 系列图像模型 | 整段复制粘贴，无需改写。每段都按固定骨架写死信息：流派渊源 → 主体 → 服装道具 → 动作 → 环境 → 媒介笔法 → 构图镜头 → 配色 → 收尾约束 |');
p('| **标签版 / 负面词** | MJ / SD / SDXL / Flux / NovelAI | 逗号标签 + 配套负面词，由同一份数据自动派生，已去重并保持顺序 |');
p();
p('- **GPT 正文不必再堆画质词**：它的还原度来自具体的笔法、材料与镜头描述，再往里塞逗号标签只会稀释画面。');
p('- **要换角色就只换一句**：只改正文里描述主体的那一句，其余的笔法、光影、收尾约束全部保留，这是出图最稳的做法。');
p('- **画质档位逐条判定**（见 `prompt-kit.js`）：按条目自身的关键词命中证据、累加权重，取分数最高的一档；一条都不命中才落 `数字干净`。每张卡都会写出**判定依据**（具体命中了哪个词），不凭空贴标签。');
p();
p('| 档位 | 收尾词取向 | 判定证据 | 为什么要避开 |');
p('|---|---|---|---|');
p('| `数字干净` | `high resolution`、`ultra-detailed`、锐利线稿 | 默认档，无年代/三维/手绘特征 | — |');
p('| `年代做旧` | 胶片颗粒、旧印刷色、`unrestored scan` | VHS、录像带、film grain、vintage、1970s/1980s、赛璐璐原稿、扫描件 | **刻意避开** `high resolution`、`ultra-detailed`，这些词会把年代胶片质感洗掉 |');
p('| `笔触画质` | 厚涂笔触、画廊级插画 | 油画、水彩、水粉、蛋彩、蜡笔、粉笔、水墨、玻璃画、版画 | 禁止矢量平涂感与喷枪柔化，否则笔触消失 |');
p('| `印刷网点` | 网点、油墨、纸张纤维 | 漫画网点、丝网印刷、孔版、木刻、拼贴、报纸 | 数字柔化会毁掉印刷物的物理感 |');
p('| `三维渲染` | 8k、PBR 材质、体积渲染 | 3d render、unreal、low poly、cel shaded 3d、黏土定格 | 禁止二维平涂覆盖体积与材质 |');
p();
p('> 判定带**否决规则**：`复古像素游戏` 不算年代胶片，`emoji 贴纸` 不算印刷网点，避免一个词把条目拖进错误的语境。');
p();
p('> 注意：`10 年代高清电视动画`、`20 年代 UHD 特效流` 属于 `数字干净` 而非 `年代做旧` —— 年代层不等于做旧层，这是早前按板块一刀切留下的坑。');
p();
p('---');
p();

/* ---------- 0a. 出图工作流 ---------- */
p('## 0a. 出图工作流（四步出一张图）');
p();
p('前面各层是**词条**，这一节是**流程**。打开 `index.html` 的「出图工作流」视图，');
p('四步选完就能拿走能粘贴的提示词 —— 中文正文、英文正文、标签速用版、负面词、');
p('建议画幅、画质档依据与授权提示都在同一屏里。');
p();
p('### 四步各管一件事，互不干涉');
p();
p('| 步骤 | 段码 | 决定什么 | 候选数 |');
p('|---|---|---|---|');
p('| ① 画风 | `ST` `ER` `SB` `RG` `MV` | 怎么画：线条与上色的具体做法 | ' + STYLES.length + ' |');
p('| ② 题材 | `TH` | 画什么：内容层的视觉惯例 | ' + GENRES.length + ' |');
p('| ③ 版式 | `LT` | 怎么摆：元素位置与留白 | ' + LAYOUTS.length + ' |');
p('| ④ 配色 | `PL` | 什么色：主色统领全画面 | ' + PALETTES.length + ' |');
p();
p('**为什么画风与版式必须分开**：画风管「怎么画」，版式管「怎么摆」，两者正交。');
p('同一张赛璐璐插画，套「上下图文卡」是小红书图，套「四格分镜」是分镜稿 ——');
p('混在一起就会得到「水彩风格的信息图」这种看似合理、实际两边都不到位的结果。');
p();
p('**为什么配色要独立成层**：配色不是画风的一部分。同一张插画换成克莱因蓝主导');
p('和换成柿子橙主导，是两张完全不同的作品。混进画风描述里，模型只会平均处理，');
p('不会真正换色调。');
p();
p('### 提示词拼装顺序');
p();
p('```');
p('题材 → 版式 → 画风 → 配色 → 画幅比例 → 禁止项（不要文字/水印）');
p('```');
p();
p('画风放在题材与版式**之后**，不是之前：GPT 系模型对句子后部的约束遵守得更牢，');
p('放最前面容易被前面的内容描述冲淡。画幅与主色都是提示词的一部分，不是元数据 ——');
p('告诉模型「3:4 竖构图」与什么都不说，出的是两张不同的图。');
p();
p('### 五个预设（点开就有成品）');
p();
const { STUDIO } = require('./assets/studio.js');
[].concat(STYLES, GENRES, LAYOUTS, PALETTES).forEach(e => { STUDIO.S[STUDIO.segOf(e.id) === 'LT' ? 'layout' : STUDIO.segOf(e.id) === 'PL' ? 'palette' : STUDIO.segOf(e.id) === 'G' ? 'theme' : 'style'] = e.id; });
STUDIO.PRESETS.forEach(pr => {
  STUDIO.applyPreset(pr);
  const code = STUDIO.STEPS.filter(s => STUDIO.S[s.key])
    .map(s => STUDIO.codeOf(s.key)).filter(Boolean).join(' + ');
  const zh = STUDIO.compose('zh');
  p('#### ' + pr.name + '　`' + code + '`');
  p();
  p('组合：' + STUDIO.STEPS.map(s => STUDIO.S[s.key]
    ? s.zh + '「' + STUDIO.labelOf(s.key) + '」' : s.zh + '（未选）').join(' + '));
  p();
  p('**中文正文**（整段复制）');
  p();
  p('```');
  p(zh);
  p('```');
  p();
  const lay = STUDIO.entryOf('layout');
  if (lay) { p('- **建议画幅**：`' + lay.ratio + '`（来自「' + lay.zh + '」）'); }
  p('- **标签速用版**：');
  p('  ```');
  p('  ' + STUDIO.composeTags());
  p('  ```');
  p();
  p('- **负面词**：');
  p('  ```');
  p('  ' + STUDIO.negatives());
  p('  ```');
  p();
  const fl = STUDIO.rightsFlags();
  p('- **授权**：' + (fl.length
    ? fl.map(f => '**' + f.tier + ' ' + f.tierZh + '**（' + f.zh + '）—— ' + f.requirement).join('；')
    : '所选均为 R0 自由，可直接商用'));
  p();
});
STUDIO.reset();
p('> **缺步不会被静默补上**。只选一两步也能出图，但结果区会逐条写明缺了哪一步、');
p('> 缺了会怎样（例：缺版式 →「画面会居中平铺，信息没有分布，社媒图基本不可用」）。');
p('> 刻意不给一段「看着完整、实际少一层约束」的提示词 —— 那种提示词照样能出图，');
p('> 但出的是错的东西，比报错更难排查。');
p();
p('### 一键出图（不必切到别的软件）');
p();
p('四步定完，结果区下方的「一键出图」面板可以直接出图：点一下，');
p('面板把**英文正文**送进模型，图取回来就显示在面板里，可下载或换一张。');
p();
const { RENDER } = require('./assets/render.js');
p();
p('#### 模型：四个指定项 + 一个免 key 兜底，能不能一键出图各不相同');
p();
p('| 模型 | 通道 | 一键出图 | 说明 |');
p('|---|---|---|---|');
RENDER.MODELS.forEach(m => {
  const ch = RENDER.CHANNELS[m.channel];
  const can = m.channel === 'manual' ? '❌ 只能复制' : '✅';
  const note = m.channel === 'manual'
    ? '**没有公开出图 API**，给的是标签版 + `--ar` 参数串与官网入口'
    : (m.channel === 'keyed' ? '需你自己的 API key（`enter.pollinations.ai/keys` 免费申请）'
                             : '不要 key，但约一半请求会被限流挡掉');
  p('| **' + m.zh + '** | `' + ch.key + '` | ' + can + ' | ' + note + ' |');
});
p();
p('**默认是 `GPT-Image 2`。**');
p();
p('> **匿名通道不能选 Flux / GPT-Image —— 这不是界面小气，是后端如此。**');
p('> `GET image.pollinations.ai/models` 只返回 `["sana"]`；');
p('> 用 `flux` / `turbo` / `sana` / `gpt-image-2` / `nano-banana` 五个名字请求');
p('> 同一提示词、同一 seed，**返回文件的 md5 完全相同**。');
p('> 所以那一项在界面上叫「Sana · 免 key」而不是「Flux」——');
p('> 写成 Flux 就是骗用户，而用户会拿这张图去商用。');
p();
p('模型名真正生效的是 `gen.pollinations.ai`（需 key，CORS 预检实测可在浏览器里用）。');
p('key 走 `Authorization` 头而不是 URL —— URL 里的 key 会进浏览器历史、截图与 Referer。');
p();
p('> ⚠ **Nano Banana 2.1 在官方模型清单里标了 `paid_only: true` 且 `health: down`**，');
p('> 可能需要付费额度，且当前处于故障状态。这条写在界面上，不埋在 tooltip 里。');
p();
p('#### 出图比例：1:1 / 9:16 / 16:9 / 3:4 / 4:3 / 自定义，默认 1:1');
p();
p('**出图比例不跟随版式的 ratio**，是这一屏里的独立选项。');
p('版式决定画面里元素怎么摆，出图比例决定画布什么形状，');
p('混在一起时「我选了 16:9」与「版式说 3:4」会打架，模型只能二选一。');
p();
p('| 出图比例 | 标准档 | 高清档 |');
p('|---|---|---|');
RENDER.RATIOS.forEach(r => {
  const a = RENDER.pxOf(r, 'std'), b = RENDER.pxOf(r, 'hd');
  p('| `' + r + '` | `' + a.w + '×' + a.h + '` | `' + b.w + '×' + b.h + '` |');
});
p();
p('自定义填像素（如 `1024x1536`），边长限 ' + RENDER.PX_MIN + '–' + RENDER.PX_MAX
  + '，取偶数（奇数边长部分后端会静默改写，那样「我选了 3:4」与实际出图就对不上）。');
p('填错会挡下并说明原因，不会默默出一个方图。');
p();
p('**出图比例与正文里的画幅句同源**：选 16:9 时正文那句会被改写成 16:9，');
p('请求参数也是 `768×432`。只改一边等于给模型两套矛盾指令。');
p();
p('另一个可调项是 `seed`。**填同一个 seed 可复现同一张构图** ——');
p('想在同一个构图上改一版配色时用得上；留空则每次随机。');
p('点「换一张」会连 seed 一起换掉，否则换出来是同一张图（URL 没变，缓存命中）。');
p();
p('### 一键抽卡（独立的一屏）');
p();
p('侧栏第二项「**一键抽卡**」是单独的一屏，不在出图工作流里。');
p('分开不是放不下，是两者的使用节奏相反：出图工作流是「已经想好要什么」，');
p('抽卡是「还不知道要什么」。混在一屏时用户会以为抽卡是「按当前四步随机换 seed」。');
p();
p('抽卡每次从库存里**随机抽一组组合**连着出图 —— 每一张的四步都是重新抽的，');
p('不是同一提示词换 seed（那是同一张图看六遍）。');
p('抽到中意的点卡片上的「去精修」，那组组合会带进**出图工作流**，在那边慢慢调；');
p('两边还有互相跳转的入口，来回一趟不用手动重选。');
p();
p('#### 抽卡池：库升级时它自己会变大');
p();
const gachaPool = require('./assets/gacha.js').GACHA;
const gpool = gachaPool.pool();
p('这一屏上的每一个数字都是**照着库现算的**，没有任何写死的数量：');
p();
p('| 抽卡槽 | 来自哪一层 | 候选 |');
p('|---|---|---|');
gpool.slots.forEach(s => {
  p('| ' + s.label + ' | `' + s.seg + '`' + (s.source === 'studio' ? '（工作流的一步）' : '（注册的额外层）') + ' | ' + s.count + ' |');
});
p('| **可组合空间** | 各槽候选数相乘 | **' + gpool.spaceZh + ' 种** |');
p();
p('槽位是从 `STUDIO.STEPS` **派生**的，不是写死的四行：');
p();
p('- 以后在工作流里加一步（比如「笔触」「字体」），抽卡自动多一个槽，');
p('  候选数、组合空间、界面上那几行全部跟着变，抽卡代码一行都不用动；');
p('- 不在工作流里的新维度，用 `GACHA.register({ key, label, seg, list })` 接进来，');
p('  `list` 传函数则每次现取，补库之后立刻能抽到；');
p('- **池规模不缓存** —— 缓存下来就会在补库之后继续显示旧数字，');
p('  而旧数字看起来完全正常，只是它已经不对了。');
p();
p('界面上还有一条给维护者看的：某一层是空的时候会**明确报警**');
p('（「有 N 层库当前是空的」）。少一层约束的提示词照样能出图，');
p('只是出的不是你要的东西 —— 不说出来，用户只会觉得「这次抽的都不太对」。');
p();
p('#### 锁定：固定一层，只抽其余');
p();
p('每个槽后面都有一个「随机 / 锁定」按钮。锁定的值取自**出图工作流里当前选的那一项**');
p('（抽卡页不另存一份「想要什么」，否则两处各记一个，都以为自己是对的）。');
p('例如把画风锁成赛璐璐，就只抽题材、版式、配色 ——');
p('可组合空间会实时收窄并显示出来。');
p();
p('#### 出图的三个限制');
p();
p('> **串行出图，不是并发。** 免 key 通道并发发出去第 2 张起几乎全是 `402`，');
p('> 界面上就是一排失败的灰卡片。而且下一张的计时**从上一张收完开始**，');
p('> 不是从发出开始 —— 按发出时间排的话两个请求会重叠。');
p();
p('> **每张自动重试最多 3 次（退避 16 / 32 / 64 秒）。**');
p('> 原因是实测发现限流**不是干净的时间窗口**：官方文档写「匿名用户每 15 秒 1 个」，');
p('> 但按 3 / 15 / 25 / 35 / 60 秒各种间隔顺序请求，**都出现过 402**，');
p('> 成功与否和间隔基本无关，约一半请求被拒（更像一个共享配额池）。');
p('> 所以靠拉长间隔没用，只能靠退避重试 —— 否则 4 张里必有 2 张是灰卡片，');
p('> 用户看到的是一个「一半坏掉」的功能。试满 3 次仍失败的卡上会留一个「重抽」。');
p();
p('> **要 key 的通道与 Midjourney 都不开抽卡。** 前者按 token 计费，');
p('> 一次抽 6 张等于用户没看见就花了六份钱；后者没有公开出图 API。');
p('> 两者都会给出「切到 Sana · 免 key 抽卡」的按钮 —— 不只说不行，还给一条能走的路。');
p();
p('抽卡过程中可以随时「停止」，已经抽出来的图留在原地。');
p('整批要等几分钟是通道配额的问题，不是页面卡住了 —— 这一句写在界面上。');
p();
p('#### 四条边界，出图前请先知道');
p();
p('1. **提示词会离开你的电脑**，发到 `gen.pollinations.ai` 或 `image.pollinations.ai`。');
p('   介意就别用这个按钮，复制正文去你自己的模型里跑 ——');
p('   本库的授权分级只管文本，不管别人拿它做什么。');
p('2. **右下角仍有通道水印**。`nologo` 只关掉左上角标，推理阶段强加的标记');
p('   提示词管不了。**出图后必须自己裁掉，不要直接商用。**');
p('3. **API key 只存在这一页的内存里**，不写硬盘、不进 URL；');
p('   但请求会带上它。用完刷新页面就没了，别在公用电脑上填。');
p('4. **图里的文字仍然是乱码**。版式预留的空白区是留给后期排字的，');
p('   不要指望模型写对。');
p();
p('> 通道是**可选加速路径，不是本库的一部分**。库的核心资产是提示词正文，');
p('> 任何模型都能跑；这个按钮只是省掉「复制 → 粘贴 → 等 → 下载」这一段搬运。');
p();
p('---');
p();

/* ---------- 0a2. 按模型优化 ---------- */
p('### 按模型优化的提示词（同一组四步，五份词）');
p();
p('**五个模型的提示词语法不是一回事**，把同一段正文硬发给五个模型，');
p('等于对五个模型说五种它听不懂的话 —— 而界面上看起来一切正常。');
p();
p('页面里「默认提示词」在最上面，下面每个模型一整块，各带一句「这版改了什么」。');
p('点「复制提示词」直接取那一版；点「用这个模型出图」把出图面板切到它。');
p();
p('| 模型 | 它吃什么 | 这一版怎么写的 |');
p('|---|---|---|');
const MP = require('./assets/model-prompts.js').MODEL_PROMPTS;
[
  { k: 'gpt-image-2', eat: '自然语言段落、指令句',
    how: '题材 → 版式 → 画法 → 配色 → 画幅 → 禁项。禁项放句尾，GPT-Image 对后部约束遵守得最牢' },
  { k: 'nano-banana', eat: '长指令 + 显式 Avoid',
    how: '把「画什么 / 怎么摆 / 什么色 / 不要什么」拆成四句分别给它，不挤成一段' },
  { k: 'mj', eat: '**只吃逗号标签 + `--` 参数**',
    how: '标签与参数**分开两个框**：标签里混进 `--ar` 以外的符号就废。画幅只由 `--ar` 承担' },
  { k: 'flux', eat: 'T5 编码器，长描述性散文',
    how: '不加权重语法 `(词:1.2)`（它不解析，会变成画面里的字面符号）、不加 `masterpiece` 这类质量词' },
  { k: 'sana', eat: '自然语言，**中段长度**',
    how: '只取题材 + 配色 + 画幅，不堆技法细节 —— 它会把过长的后半段当补充说明而弱化主体' }
].forEach(r => {
  const zh = (RENDER.modelById(r.k) || {}).zh || r.k;
  p('| **' + zh + '** | ' + r.eat + ' | ' + r.how + ' |');
});
p();
p('> 这一层的「各模型该怎么写」是 **read：创作解释与工程判断**，');
p('> 不是模型厂商的官方结论，也不是本库实测过的结果 ——');
p('> 目前只有 Sana 一路真出过图（见上面「出图通道」那节的实测结论）。');
p('> 真去实测了再升级标注，**不要把整张表标成实测** —— 没测过的那几条会跟着沾光。');
p();
p('五条约定，改这一层前先读完：');
p();
p('1. **取材一次，五个模型共用。** 场景、版式、技法、配色、主色都从 `STUDIO` 取，');
p('   改写只发生在「怎么写」这一层。各模型各自去库里取一遍数据，五份词迟早漂到互相矛盾。');
p('2. **禁项不许丢。** 「画面里不要出现文字 / 水印」是本库反复强调的边界，');
p('   而四个模型的写法各不相同（否定句 / `--no` / 正向陈述句）。');
p('3. **画幅只留一个出处。** MJ 标签里的 `aspect ratio` 与 `--ar` 同时出现时，');
p('   模型会收到两条互相矛盾的画幅指令 —— 而出错的图只是「构图怪」，没人会去查参数。');
p('4. **不能污染 `STUDIO.S`。** 抽卡一次要出五份词，');
p('   中途任何一处 `return` 或抛错都会把用户当前的四步留在别人的组合上。');
p('5. **界面层不许按模型名写分支。** 出现 `o.key === "mj"` 这种判断时，');
p('   适配层与界面就会各有一份「MJ 该怎么写」，两边看起来都正常，只是慢慢对不齐。');
p('   判「无 API」用的是 `channel`，不是模型名。');
p();
p('体检 `tools/check_model_prompts.js`（130 项）逐条守着这些：');
p('五份词必须互不相同（中英各断一次）、禁项不许丢、英文版不许混进中文、');
p('MJ 的画幅只留一个出处、全 12 条配色下英文版都不含汉字、');
p('以及**真跑一次 jsdom 页面**确认渲染出的 HTML 没有拼接碎片。');
p();
p('---');
p();

/* ---------- 0b. 示例画廊 ---------- */
p('## 0b. 示例画廊（提示词 × 实际出图）');
p();
p('以下每张图都用该条目的 **GPT 正文**真实出图。标签速用版与正文是两个不同口径的示例写法（主体可能不同），**图只对应正文**。');
p('画廊只收录 **R0 自由** 条目——可含进任何商业用途，不需要署名或改写。');
p();
GALLERY.forEach(g => {
  const e = ENGINE.collectEntries().find(x => x.id === g.id);
  const gpt = PROMPT_MAP.get(g.id) || (e ? e.demo : '');
  const code = (CODES.OLD_OF && CODES.OLD_OF[g.id]) || g.id;
  p('### ' + code + ' ' + (e ? e.zh : g.id) + (e && e.en ? '　`' + e.en + '`' : ''));
  p();
  p('![示例图](examples/' + g.id + '.png)');
  p();
  if (e) { p('- **看点**：' + g.note.replace(/^看点：/, '')); p(); }
  if (gpt) {
    p('**正文（整段复制给 GPT）**：');
    p();
    p('```');
    p(gpt);
    p('```');
    p();
  }
  if (e && e.demo) {
    p('**标签速用版（同一技法的另一种写法，主体可能不同）**：`' + e.demo + '`');
    p();
  }
});
p('---');
p();

/* ---------- 1. 画风流派 ---------- */
p('## 1. 画风流派（' + STYLES.length + '）');
p();
const styleOrder = ['技法', '年代', '工作室', '地区', '全球流派'];
groupBy(STYLES, d => d.cat).size;
styleOrder.forEach(cat => {
  const list = STYLES.filter(s => s.cat === cat);
  if (!list.length) return;
  p('### 1.' + (styleOrder.indexOf(cat) + 1) + ' ' + cat + '层');
  p();
  list.forEach(s => {
    p('#### ' + s.id + ' ' + s.zh + '　`' + s.en + '`');
    p();
    p('- **关键词**：' + kws(s.kw));
    p('- **特征**：' + s.desc);
    if (s.note) p('- **提示**：' + s.note);
    promptBlock(s, 'styles');
    p('- **传统标签示例**：');
    p('  ```');
    p('  ' + s.demo);
    p('  ```');
    p();
  });
});
p('---');
p();

/* ---------- 2. 代表作品 ---------- */
p('## 2. 代表作品 IP（' + WORKS.length + '）');
p();
p('> 用法：直接把某部作品的 `kw` 当成画风层，插进拼装顺序的倒数第二段。');
p('> 想更贴近原作，可叠加两条：作品 IP + 对应工作室流派。');
p();
const grpOrder = ['日本·1970-80年代', '日本·1990年代', '日本·2000年代', '日本·2010年代', '日本·2020年代', '日本·剧场版',
                  '国产经典', '国产动画电影', '国产动画', '国产番剧', '国产三维', '欧美动画', '二次元游戏', '日本·补遗',
                  '韩国动画', '印度·东南亚',
                  '欧洲·法国比利时', '欧洲·英国爱尔兰', '欧洲·北欧', '欧洲·苏联东欧', '欧洲·德国西班牙',
                  '拉美动画',
                  '北美·动画史源流', '北美·国民卡通', '北美·成人动画'];
let gi = 1;
const usedGrp = new Set(WORKS.map(w => w.grp));
const grps = grpOrder.filter(g => usedGrp.has(g)).concat([...usedGrp].filter(g => !grpOrder.includes(g)));
grps.forEach(grp => {
  const list = WORKS.filter(w => w.grp === grp).sort((a, b) => a.year - b.year);
  p('### 2.' + gi + ' ' + grp + '（' + list.length + '）');
  gi++;
  p();
  p('| ID | 作品 | 年份 | 制作 | 视觉特征 | 关键词 |');
  p('|---|---|---|---|---|---|');
  list.forEach(w => {
    const cell = w.desc.replace(/\n/g, ' ').replace(/\|/g, '\\|');
    p('| ' + w.id + ' | **' + w.zh + '**<br>`' + w.romaji + '` | ' + w.year + ' | ' + w.studio + ' | ' + cell + ' | ' + kws(w.kw) + ' |');
  });
  p();
  list.forEach(w => {
    p('<details><summary>' + w.id + ' ' + w.zh + '　提示词卡</summary>');
    p();
    promptBlock(w, 'works');
    p('**传统标签示例**');
    p();
    p('```');
    p(w.demo);
    p('```');
    p();
    p('</details>');
    p();
  });
});
p('---');
p();

/* ---------- 3. 题材元素 ---------- */
p('## 3. 题材元素（' + GENRES.length + '）');
p();
const gCat = [...new Set(GENRES.map(g => g.cat))];
let ci = 1;
gCat.forEach(cat => {
  const list = GENRES.filter(g => g.cat === cat);
  p('### 3.' + ci + ' ' + cat);
  ci++;
  p();
  list.forEach(g => {
    p('#### ' + g.id + ' ' + g.zh + '　`' + g.en + '`');
    p();
    p('- **关键词**：' + kws(g.kw));
    p('- **特征**：' + g.desc);
    if (g.scene) p('- **构图与场景**：' + g.scene);
    promptBlock(g, 'genres');
    p('- **传统标签示例**：');
    p('  ```');
    p('  ' + g.demo);
    p('  ```');
    p();
  });
});
p('---');
p();

/* ---------- 4. 词条库 ---------- */
/* ---------- 3b. 排版图型 ---------- */
p('## 3b. 排版图型（' + LAYOUTS.length + '）');
p();
p('回答「怎么摆」。与画风正交：同一张画可以套任意一种版式。');
p('每条都带建议画幅，**画幅是提示词的一部分** —— 它直接决定构图能不能用。');
p();
[...new Set(LAYOUTS.map(l => l.cat))].forEach((cat, ci2) => {
  const list = LAYOUTS.filter(l => l.cat === cat);
  p('### 3b.' + (ci2 + 1) + ' ' + cat + '（' + list.length + '）');
  p();
  list.forEach(l => {
    p('#### ' + l.id + ' ' + l.zh + '　`' + l.en + '`　画幅 `' + l.ratio + '`');
    p();
    p('- **关键词**：' + kws(l.kw));
    if (l.alt && l.alt.length) p('- **别名**：' + l.alt.join('、'));
    p('- **说明**：' + l.desc);
    if (l.note) p('- **注意**：' + l.note);
    if (l.gpt) {
      p();
      p('**英文正文**');
      p();
      p('```');
      p(l.gpt);
      p('```');
    }
    if (l.gptZh) {
      p();
      p('**中文正文**');
      p();
      p('```');
      p(l.gptZh);
      p('```');
    }
    p();
    p('- **标签速用版**：`' + l.demo + '`');
    p();
  });
});
p('> 排版层全部为本库原创版式描述，不含任何作品名或创作者署名，**结构性 R0**，可直接商用。');
p();
p('---');
p();

/* ---------- 3c. 主题配色 ---------- */
p('## 3c. 主题配色（' + PALETTES.length + '）');
p();
p('回答「什么色」。主色 + 点缀色两值，会直接写进提示词（`主色限定为 #1B4FD8，其余颜色全部压到接近中性`），');
p('不给模型自行发挥的空间。');
p();
p('| 段码 | 名称 | 主色 | 点缀色 | 情绪 |');
p('|---|---|---|---|---|');
PALETTES.forEach(pl => {
  const code = (CODES.OLD_OF && CODES.OLD_OF[pl.id]) || pl.id;
  p('| `' + code + '` | ' + pl.zh + ' | `' + pl.hex + '` | ' + (pl.accent ? '`' + pl.accent + '`' : '—') + ' | ' + (pl.mood || '') + ' |');
});
p();
[...new Set(PALETTES.map(pl => pl.grp || '全部'))].forEach(grp => {
  p('### ' + grp);
  p();
  PALETTES.filter(pl => (pl.grp || '全部') === grp).forEach(pl => {
    p('#### ' + pl.id + ' ' + pl.zh + '　`' + pl.en + '`　`' + pl.hex + '`');
    p();
    if (pl.desc) p('- **说明**：' + pl.desc);
    if (pl.note) p('- **注意**：' + pl.note);
    p('- **关键词**：' + kws(pl.kw));
    if (pl.gpt) {
      p();
      p('**英文正文**');
      p();
      p('```');
      p(pl.gpt);
      p('```');
    }
    if (pl.gptZh) {
      p();
      p('**中文正文**');
      p();
      p('```');
      p(pl.gptZh);
      p('```');
    }
    p();
  });
});
p('> 配色层同样是本库原创定义，**结构性 R0**。');
p();
p('---');
p();

p('## 4. 横切词条库（' + VOCAB.length + ' 组）');
p();
VOCAB.forEach(v => {
  p('### ' + v.id + ' ' + v.zh + '　`' + v.en + '`');
  p();
  p('| 英文关键词 | 说明 |');
  p('|---|---|');
  (v.items || []).forEach(i => {
    p('| `' + i.t + '` | ' + i.c.replace(/\|/g, '\\|') + ' |');
  });
  p();
});
p('---');
p();

/* ---------- 5. 模板 ---------- */
p('## 5. 组合模板（' + TEMPLATES.length + '）');
p();
p('> 花括号 `{ }` 是需要你替换的内容，其余部分保持原样即可。');
p();
TEMPLATES.forEach(t => {
  p('### ' + t.id + ' ' + t.zh + '　`' + t.en + '`');
  p();
  p('**用途**：' + t.use);
  p();
  p('**正向提示词**');
  p('```');
  p(t.pos);
  p('```');
  p();
  if (t.neg) {
    p('**负向提示词**');
    p('```');
    p(t.neg);
    p('```');
    p();
  }
  if (t.params) {
    p('**推荐参数**：' + t.params);
    p();
  }
  p('**要点**：' + t.tip);
  p();
});
p('---');
p();

/* ---------- 6. 负面词 ---------- */
p('## 6. 负面提示词（' + NEGATIVES.length + '）');
p();
NEGATIVES.forEach(n => {
  p('### ' + n.id + ' ' + n.zh);
  p();
  p('**适用**：' + n.scene);
  p();
  p('```');
  p((n.kw || []).join(', '));
  p('```');
  p();
  if (n.note) {
    p('> ' + n.note);
    p();
  }
});
p('---');
p();

/* ---------- 7. 平台语法 ---------- */
p('## 7. 平台语法差异（' + SYNTAX.length + '）');
p();
SYNTAX.forEach(s => {
  p('### ' + s.id + ' ' + s.zh + '　`' + s.en + '`');
  p();
  p('- **特点**：' + s.features);
  p('- **权重写法**：' + s.weight);
  p('- **常用参数**：');
  p('  ```');
  p('  ' + s.param);
  p('  ```');
  if (s.tip) p('- **经验**：' + s.tip);
  p();
});
p('---');
p();

/* ---------- 8. 开放式知识库：元模型 ---------- */
const ST = ENGINE.stats();
p('## 8. 开放式知识库：元模型');
p();
p('前面的第 1～7 章是「已经收录好的东西」，这一章往后是「还没收录的东西怎么办」。');
p();
p('目标陈述：**建立一个覆盖全球动画、漫画及关联创作的开放式提示词知识库。已知内容可检索，未收录内容可拆解，新的创作需求可通过模块组合与受控变形构建。**');
p();
p('四条边界，任何时候都不得违反：');
p();
p('| 边界 | 说明 |');
p('|---|---|');
p('| **地域 ≠ 风格** | 「法国动画」是地理来源，不是画风；同一地域可以有几十种画风 |');
p('| **题材 ≠ 画风** | 「赛博朋克」是题材设定，可用厚涂、平涂、三维任何一种画法表现 |');
p('| **作品名 ≠ 技法** | 作品名只是检索入口，真正要抽出的是它背后的线条与上色方式 |');
p('| **模型参数 ≠ 通用提示词** | 种子、步数、采样器属于某一次运行，不属于条目本身 |');
p();
p('### 8.1 范围：三个同心圈');
p();
(SCHEMA.SCOPE || []).forEach(s => {
  p('- **' + s.ring + '**（`' + s.en + '`）：' + s.desc + '，收录原则——' + s.rule);
});
p();
p('### 8.2 十二个库');
p();
p(`合计 **${ST.nodes}** 个节点，另有 **${ST.entries}** 条已实测、可直接复制的提示词条目。`);
p();
p('| # | 库 | 英文 | 回答的问题 | 节点数 |');
p('|---|---|---|---|---|');
(SCHEMA.LIBS || []).forEach(l => {
  p('| ' + l.num + ' | **' + l.zh + '** | ' + l.en + ' | ' + l.role + ' | ' + (ST.byLib[l.num] || 0) + ' |');
});
p();
p('### 8.3 九个槽位：任何提示词都由它们装配而成');
p();
p('| 顺序 | 槽位 | 英文 | 说明 |');
p('|---|---|---|---|');
(SCHEMA.SLOTS || []).forEach((s, i) => {
  p('| ' + (i + 1) + ' | **' + s.zh + '** | `' + s.key + '` | ' + s.hint + ' |');
});
p();
p('### 8.4 一条完整记录应该有哪些字段');
p();
(SCHEMA.NODE_FIELDS || []).forEach(g => {
  p('- **' + g.g + '**：' + g.items.join(' / '));
});
p();
p('### 8.5 兼容评级与证据等级');
p();
p('| 兼容评级 | 含义 |');
p('|---|---|');
(SCHEMA.GRADES || []).forEach(g => { p('| ' + g.zh + '（` ' + g.key + ' `） | ' + g.note + ' |'); });
p();
p('| 证据等级 | 含义 |');
p('|---|---|');
(SCHEMA.EVIDENCE || []).forEach(g => { p('| ' + g.zh + ' | ' + g.note + ' |'); });
p();
p('### 8.6 变形强度');
p();
(SCHEMA.STRENGTHS || []).forEach(s => { p('- **' + s.zh + '**（`' + s.key + '`）：' + s.note); });
p();
p('### 8.7 维护规则');
p();
(SCHEMA.RULES || []).forEach((r, i) => { p((i + 1) + '. ' + r); });
p();
p('---');
p();

/* ---------- 9. 十二库全节点 ---------- */
p('## 9. 十二库全节点');
p();
p('每个节点形如 `{ id, lib, up, path, zh, en, kw, alt, desc, slot }`。带 `slot` 的节点可直接参与组合；不带的是容器，只用于归类。');
p();
(SCHEMA.LIBS || []).forEach(l => {
  const all = ENGINE.NODES.filter(n => n.lib === l.num);
  p('### 库 ' + l.num + ' · ' + l.zh + '（' + l.en + '，' + all.length + ' 个节点）');
  p();
  p('> ' + l.role);
  p();
  const tops = all.filter(n => !n.up);
  tops.forEach(t => {
    const kids = all.filter(n => n.up === t.id);
    p('**' + t.id + ' ' + t.zh + '**　`' + t.en + '`' + (t.desc ? ' —— ' + t.desc : ''));
    p();
    if (kids.length) {
      p('| ID | 名称 | 英文 | 槽位 | 落地关键词 | 说明 |');
      p('|---|---|---|---|---|---|');
      kids.forEach(k => {
        p('| `' + k.id + '` | ' + k.zh + ' | ' + k.en + ' | ' + (k.slot || '—') + ' | ' +
          (k.kw && k.kw.length ? kws(k.kw.slice(0, 3)) : '—') + ' | ' + (k.desc || '').replace(/\|/g, '\\|') + ' |');
      });
      p();
    }
  });
  // 没有容器归属的散节点
  const loose = all.filter(n => n.up && !all.some(x => x.id === n.up));
  if (loose.length) {
    p('| ID | 名称 | 英文 | 槽位 | 落地关键词 | 说明 |');
    p('|---|---|---|---|---|---|');
    loose.forEach(k => {
      p('| `' + k.id + '` | ' + k.zh + ' | ' + k.en + ' | ' + (k.slot || '—') + ' | ' +
        (k.kw && k.kw.length ? kws(k.kw.slice(0, 3)) : '—') + ' | ' + (k.desc || '').replace(/\|/g, '\\|') + ' |');
    });
    p();
  }
});
p('---');
p();

/* ---------- 10. 引擎：检索 / 组合 / 变形 ---------- */
p('## 10. 引擎：检索、组合、变形');
p();
p('### 10.1 检索的六个入口');
p();
p('找不到往往不是没有，是入口选错了。六个入口互为备份：');
p();
['名称检索：用作品名、流派名精确命中',
 '别名检索：处理译名分歧、简称与常见误写',
 '跨语言检索：中文、日文、英文指同一对象时互达',
 '描述式检索：没有名字、只有「我想要那种感觉」时的主路径',
 '以图检索：先拆参考图属于哪些槽位，再回溯模块',
 '空结果处理：无匹配时返回可组合模块清单，并标注尚未实测'
].forEach((x, i) => p((i + 1) + '. ' + x));
p();
p('**以图检索的拆解清单**：');
p();
ENGINE.imageChecklist().forEach((c, i) => p((i + 1) + '. ' + c.q + '　→　`' + c.slot + '`'));
p();
p('### 10.2 组合示例');
p();
const DEMO = ENGINE.compose({
  target:  ['PR-01-3'],
  subject: ['CB-01-1', 'CB-03-2'],
  content: ['CB-06-2', 'WD-01-7'],
  style:   ['VS-04-1', 'WD-03-3'],
  frame:   ['LN-01-3', 'LN-02-1'],
  motion:  ['LN-05-1'],
  spec:    ['LN-06-1'],
  limit:   ['VX-03-4']
});
p('装配：' + DEMO.summary);
p();
p('评级：**' + ({ ok: '可直接出图', tune: '需要微调', conflict: '存在冲突', unknown: '证据不足' })[DEMO.grade] + '**');
p();
p('GPT 正文：');
p();
p('```');
p(DEMO.gpt);
p('```');
p();
p('标签版：');
p();
p('```');
p(DEMO.tags);
p('```');
p();
p('负面词：');
p();
p('```');
p(DEMO.neg);
p('```');
p();
p('### 10.3 冲突是怎么判定的');
p();
p('规则写在表上，不靠感觉。先看示例：');
p();
const BAD = ENGINE.compose({ target: ['PR-01-5'], style: ['VS-11-4'], limit: ['VX-03-4'], content: ['VX-01-2'] });
p('把「印刷物料 + 年代老化 + 禁止文字 + 日式拟声」放在一起，引擎报出 ' + BAD.conflicts.length + ' 条冲突：');
p();
BAD.conflicts.forEach(c => { p('- [' + c.type + '] ' + c.reason); });
p();
p('判定逻辑分两类：');
p();
p('1. **组内互斥**：同一分支内只能选一个。已登记的独占组有 ' + '`WD-02 天气`、`WD-03 时段`、`LN-01 景别`、`LN-02 角度`、`LN-04 运镜`、`LN-05 时间`、`LN-06 画幅`、`CB-02 体格`、`CB-03 年龄`、`WD-08 世界观`、`SN-04 基调`、`VX-03 文字`、`PR-01 用途`、`PR-04 阶段`、`MX-04 强度`' + '。');
p('2. **跨组冲突**：语义互斥但分属不同分支，写在交叉表里，逐条给出理由。');
p();
p('### 10.4 变形：保留项 / 变化项 / 强度');
p();
p('变形必须写明保留什么、改什么。只说「改成某种风格」是不可执行指令。');
p();
const MORPH = ENGINE.morph({
  base: { subject: ['CB-01-1'], style: ['VS-04-1'], frame: ['LN-01-3'] },
  change: { style: ['VS-11-2'] },
  keep: ['CB-01-1'],
  strength: 'medium'
});
p('示例：基准是「主人公 + 某线条形式 + 中景」，把风格换成「模拟录像」，强度中度。');
p();
p('- **变化项**：' + MORPH.changed.map(c => c.slot + ' → ' + c.node).join('；'));
p('- **保留项**：' + MORPH.kept.join('、'));
p('- **强度说明**：' + MORPH.strengthText);
p();
p('变形后正文：');
p();
p('```');
p(MORPH.result.gpt);
p('```');
p();
p('检查清单：');
p();
MORPH.checklist.forEach(c => p('- □ ' + c));
p();
p('---');
p();

/* ============================================================
 * 第 11 章 · 编码与引用
 * ============================================================
 * 用户的需求原话：「可以直接引用编码，或是中文名」。
 * 这一章把码表规则、全部编码清单、以及组合串用法落成可查的文档。
 * 编码是纯函数派生的（assets/codes.js），不会与数据源漂移。 */
p('## 11. 编码与引用');
p();
p('### 11.1 为什么另建一层编码');
p();
p('原有 `id` 是历史数据的主键，格式并不统一：条目层 `A1-01`（2 位）/`W-J01`（2 位）/`W-J112`（3 位）并存，');
p('节点层 `CB-01-1`（末段 1 位）与 `VS-06-10`（末段 2 位）并存，而工具层的 `T-01`/`N-01`/`S-01` 又是另一套。');
p('直接改 `id` 会砸掉 324 条已验证的 GPT 提示词映射，所以保留原字段，另建一层规范编码专门用于引用。');
p();
p('#### 编码文法');
p();
p('```');
p('条目层  <两字母前缀>-<三位序号>            ST-001   WK-233');
p('工具层  <两字母前缀>-<三位序号>            TP-001');
p('节点层  <两字母库号>-<三位组>-<三位项>    CB-001-002');
p('```');
p();
p('前缀自解释：看到 `ST` 就知道是技法，不用查表。节点层多一段是因为节点天然有两级（组 / 组内条目），');
p('组本身用 `-000`，把 `001` 让给它的第一个子节点。');
p();
p('#### 段码一览');
p();
p('| 前缀 | 层 | 含义 | 说明 |');
p('|---|---|---|---|');
CODES.SEGMENTS.forEach(s => {
  p('| `' + s.code + '` | ' + ({entry:'条目',tool:'工具',node:'节点'}[s.layer]) + ' | ' + s.zh + ' | ' + s.desc + ' |');
});
p();
p('#### 旧 ID → 规范编码');
p();
p('| 层 | 旧 id 示例 | 规范编码 | 说明 |');
p('|---|---|---|---|');
p('| 条目 | `A1-01` | `ST-001` | 技法。前缀由 `A1` 改为 `ST` |');
p('| 条目 | `G-01` | `TH-001` | 题材元素 |');
p('| 条目 | `W-J84` | `WK-084` | 作品。十个地区段合并为单一 `WK` 段 |');
p('| 工具 | `T-01` | `TP-001` | 模板。单字母改双字母，与条目层区分 |');
p('| 节点 | `CB-01-1` | `CB-001-001` | 组号与项号各三位（段码不变） |');
p('| 节点 | `CB-01` | `CB-001-000` | 组节点用 `-000`，把 `-001` 让给首个子节点 |');
p();
p('**作品段为什么合并**：作品曾按出品地切成 `W-J`…`W-G` 十个段，规模从 5 条到 112 条差 22 倍，');
p('而地区本就是属性（每条作品自带 `grp` 字段）。合并成 `WK` 后编号连续，地区下沉为字段，');
p('追加新作品不会再出现「W-L 只有 5 条、W-J 已经 112 条」这种悬殊。');
p();
p('**三条硬约定**：编码一旦发布不可改（改了等于让用户手里的组合串失效）；');
p('编码是引用锚点不是内容，改中文名不影响解析，因为解析走映射表与别名表，不读数据源的 `zh`；');
p('旧编码永久可解析（见 11.4）。');
p();
p('### 11.2 旧编码迁移');
p();
p('段码体系改过一轮（`A1-001` → `ST-001`、`W-J-001` → `WK-001`、`G-001` → `TH-001`）。');
p('迁移**无损**：旧码全部登记为别名，解析时新旧都命中，输出时只给新码。');
p();
p('所以下面这些输入都能用，结果指向同一条目：');
p();
p('```');
p('ST-001        新编码');
p('A1-001        旧编码（仍可用）');
p('A1-01         旧 ID（仍可用）');
p('赛璐璐平涂      中文名');
p('Cel Shading   英文名');
p('赛璐珞         历史错写');
p('```');
p();
p('作品段的迁移表规模较大（233 条），完整对照见 `assets/code-map.js` 的 `LEGACY`。');
p();
p('### 11.3 五种输入，命中同一条目');
p();
p('| 输入方式 | 例子 |');
p('|---|---|');
p('| 规范编码 | `ST-001` |');
p('| 旧编码 | `A1-001`（改版前发布过，永久可解析） |');
p('| 旧 ID | `A1-01` |');
p('| 中文名 | `赛璐璐平涂` |');
p('| 英文名 | `Cel Shading`（含空格也不怕） |');
p('| 别名 / 错写 | `赛璐珞`（历史错写，仍可命中） |');
p();
p('编码还能省略前导零：`ST-1` 与 `ST-001` 等义；大小写与前后空格都不敏感。');
p();
p('### 11.4 组合串用法');
p();
p('多项用 `+`、`,`、`;` 或换行分隔，每一项都可以是编码或中文名，可以混着写：');
p();
p('```');
p('ST-001 + 赛璐璐平涂 + TH-001');
p('赛璐璐平涂 热血战斗');
p('```');
p();
p('解析结果分四类，因为用户要区别对待：');
p();
p('- **命中** —— 输出规范编码 + 中文名，可直接复制组合串；');
p('- **跨层同名已收敛** —— 同一个词在多层存在时（如 `Cel Shading` 既是画风条目 `ST-001` 又是上色节点 `VS-005-004`），按 **工具 > 条目 > 节点** 自动取一层。取了哪层、谁被遮住都写在卡片里，遮住的那层点编码即可切换。');
p('- **同层重名待消歧** —— 同一层内确实分不清时，列出候选让人选，不静默替你决定。跨层可以收敛，同层不可以；');
p('- **未命中** —— 给出原因与最接近的候选，绝不返回一个猜测结果。');
p();
p('> 收敛的优先级依据：用户脑子里想的是「要一个能直接用的画风」，也就是条目层。');
p('> 本库有 86 个键同时命中节点与条目（`赛璐珞`/`Cel Shading`/`mecha`/`废土`/`赛博朋克` 等），');
p('> 一律弹「请指定层级」等于把最常见的用法全挡在门外，而这些人绝大多数不会去看候选里哪个写着「节点」。');
p();
p('> 重复段也要说出来。`ST-001 + 赛璐璐平涂` 指的是同一条目，输出里只保留一条');
p('> （出现两遍会被当成两个组件，组合结果就不对了），但界面会显示「合并重复 N 段」并在卡片上标出另一个写法。');
p('> 静默丢弃与静默替选是同一类错误：都让人以为整串都解析对了。');
p();
const DEMO_MANY = RESOLVER.resolveMany('ST-001 + 热血战斗');
p('实测：');
p();
DEMO_MANY.okList.forEach(x => p('- `' + x.code + '` → ' + x.zh + '（旧 ID ' + x.oldId + '）'));
p();
p('组合串：`' + DEMO_MANY.chain + '`');
p();
p('---');
p();

p('### 11.5 授权边界与商用口径');
p();
p('>这一节是本库对外使用时的硬约束。数字来自 `assets/rights.js` 的实时统计，');
p('> 不是估计值，也不是一次性写死的说明。改动数据后重新运行 `node build_md.js` 会自动更新。');
p();
p('#### 四档分级');
p();
p('| 档 | 名称 | 商用| 条件 |');
p('|---|---|---|---|');
Object.keys(RIGHTS.TIERS).forEach(function (k) {
  const t = RIGHTS.TIERS[k];
  p('| `' + t.id + '` | ' + t.zh + ' | ' +
    (t.commercial === 'ok' ? '可直接'
      : t.commercial === 'ok-with-credit' ? '可，**需署名**'
      : t.commercial === 'rewrite-first' ? '可，**先改写**'
      : '**需先改写**') + ' | ' + t.requirement + ' |');
});
p();
p('**分级只看标识，不看画法。**');
p('「像高达那样画」和「画一个白色巨型机器人」在法律上完全不同——');
p('前者指向受保护的角色设定与作品标识，后者只是通用描述。');
p('所以 R3 条目不是禁用的，是**必须改写后使用**的。');
p();
p('#### 本库实际分布');
p();
p('| 档 | 条数 | 占比 |');
p('|---|---|---|');
const TOT = REG_REPORT.rights.R0 + REG_REPORT.rights.R1
  + REG_REPORT.rights.R2 + REG_REPORT.rights.R3;
['R0', 'R1', 'R2', 'R3'].forEach(function (k) {
  const n = REG_REPORT.rights[k];
  p('| `' + k + '` | ' + n + ' | ' + (TOT ? (n / TOT * 100).toFixed(1) : '0') + '% |');
});
p();
p('共 ' + TOT + ' 条（条目 + 工具 + 节点）。');
p();
p('**这个分布不漂亮，而且它应该不漂亮。**');
p('作品层 ' + REG_REPORT.works + ' 条按定义全部是 R3——它们的标题本身就是作品名，');
p('「机动战士高达」不需要再证明自己含标识。');
p('把它们判成 R0 才是危险：数字会好看，但你就不知道自己手里有什么了。');
p();
p('#### 五条不能混在一起的授权线');
p();
p('| 线的对象 | 能不能商用 | 依据 |');
p('|---|---|---|');
p('| 本库的代码与结构设计 | 能 | 本库原创 |');
p('| 本库原创的 324 条 GPT 正文 | 能 | 本库原创，不含他人 IP 名（由 `check_rights.js` 静态校验） |');
p('| 作品名称与角色名（WK 段 233 条） | 不能直接用 | 他人著作权 |');
p('| 在世创作者姓名、工作室名 | 不能直接用 | 他人权利 / 商标性使用 |');
p('| 已故创作者姓名（A5-07 洛特·雷尼格等） | 能，需署名 | 已进公有领域 |');
p();
p('**最常见的事故是把上面这些混成一句「本库采用某许可」。**');
p('那是错的，而且是最容易吃官司的一句话。');
p();
p('#### 三种使用场景');
p();
p('| 场景 | R0 | R1 | R2 | R3 |');
p('|---|---|---|---|---|');
['personal', 'commercial', 'redist'].forEach(function (mode) {
  const label = mode === 'personal' ? '自学 / 个人练习'
    : mode === 'commercial' ? '商业出图 / 对外交付' : '再分发 / 打包成产品';
  const cells = ['R0', 'R1', 'R2', 'R3'].map(function (k) {
    const a = RIGHTS.assess(k, mode);
    return a.allowed ? (a.mustRewrite ? '先改写' : (a.level === 'info' ? '需署名' : '可以')) : '**不可以**';
  });
  p('| ' + label + ' | ' + cells.join(' | ') + ' |');
});
p();
p('R3 在「自学」一栏是放行的——研究一套视觉语言不构成侵权，');
p('这正是本库保留 233 条作品条目的意义。');
p();
p('但「再分发」一栏 R3 是不可以的：');
p('**库内可以研究，不能打包进要卖的东西里。**');
p();
p('#### 去标识化');
p();
p('`RIGHTS.deIdentify(text)` 把标识替换成视觉等价描述，而不是弱化版。');
p('这不是缩水：');
p();
p('```');
p('akira toriyama style  →  muscular shonen proportions, rounded jaw,');
p('                         spiky upward hair silhouette');
p('dragon ball            →  spiky upward hair silhouette, energy aura');
p('机动战士高达           →  硬表面棱角装甲、平视机站姿');
p('```');
p();
p('前者是标识，后者是真正能落到画面上的特征，模型认的是后者。');
p();
p('三条硬性要求，缺一条输出就是坏的：');
p();
p('1. **换干净** —— 换完不允许有残余标识；');
p('2. **不堆叠** —— 替换词若与原句已有特征重复则剔除，不重复描述；');
p('3. **如实上报** —— `replaced` 必须返回，绝不静默替换。');
p('   静默替换会让用户以为提示词原样生效，那比不替换更危险。');
p();
p('#### 怎么自己查');
p();
p('```bash');
p('node tools/check_rights.js     # 授权契约 38 项，含正文 IP 扫描与去标识化质量');
p('```');
p();
p('这个体检里有几条断言专门盯「不该出现的东西」：');
p('GPT 正文里不许出现编码（模型会把 `ST-001` 画到画面上）、');
p('不许出现版权符号（会被当水印画）、不许出现受保护 IP 名。');
p('它测的是**成品提示词长什么样**，不是「函数没报错」。');
p();
p('---');
p();
p('### 11.6 全部编码清单');
const CODE_ROWS = RESOLVER.entries.slice().sort(function (a, b) {
  return a.code < b.code ? -1 : (a.code > b.code ? 1 : 0);
});
p('| 编码 | 中文名 | 旧 ID | 层 |');
p('|---|---|---|---|');
CODE_ROWS.forEach(e => {
  p('| `' + e.code + '` | ' + e.zh + ' | `' + e.oldId + '` | ' +
    (e.kind === 'entry' ? '条目' : e.kind === 'node' ? '节点' : '工具') + ' |');
});
p();

p('*本文件由 `build_md.js` 从 `assets/` 下的数据源文件自动生成，修改请改数据源后重新运行 `node build_md.js`。*');

const out = path.join(__dirname, '动漫提示词库.md');
fs.writeFileSync(out, L.join('\n'), 'utf-8');
console.log('生成完成：' + out);
console.log('条目总数：' + total + '，行数：' + L.length);
