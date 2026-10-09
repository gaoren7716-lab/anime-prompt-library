# anime-prompt-forge · 安装与验证

## 装到 Codex

```bash
# 1. 复制技能包（只需要 codex-skill/anime-prompt-forge 这一个目录）
cp -r codex-skill/anime-prompt-forge ~/.codex/skills/

# 2. 确认能跑
node ~/.codex/skills/anime-prompt-forge/scripts/forge.js presets
```

`forge.js` 会自动判断数据源：

- 在 `~/.codex/skills/anime-prompt-forge/` 下 → 读 `references/data.json`（bundle 模式）
- 在仓库 `codex-skill/anime-prompt-forge/` 下 → 读真实引擎（仓库模式）

两种布局产出**逐字相同**的结果，`tools/check_skill.js` 的【8】组断言专门对拍这一点。

## 装到 WorkBuddy / Claude Code

```bash
cp -r codex-skill/anime-prompt-forge ~/.workbuddy/skills/
```

frontmatter 是标准 `name` + `description`，两个宿主都认。

## 重新生成 bundle

数据源改了之后必须重跑，否则装出去的是旧数据：

```bash
node codex-skill/anime-prompt-forge/scripts/build_catalog.js   # → CATALOG.md
node codex-skill/anime-prompt-forge/scripts/build_bundle.js    # → data.json
```

`build_bundle.js` 导出前会自检（每条都有正文、画风都有双语技法、版式都有画幅、
配色都有主色、预设与 `assets/studio.js` 逐项一致），任一项不过就退出码 1，不写文件。

**先跑 `node codex-skill/anime-prompt-forge/scripts/build_bundle.js`，再跑体检。**
顺序反了会拿旧 bundle 做对拍，测的是过期数据。

## 体检

```bash
node tools/check_skill.js     # 72 项：文件 / frontmatter / CLI / 输出 / 授权 / A-B 对拍 / 数据
node tools/check_studio.js    # 90 项：工作流逻辑（含英文正文不退化）
```

`check_skill.js` 的核心是【8】组 A/B 对拍 ——
把技能包复制到临时目录让它只能走 bundle 模式，与仓库模式逐字比对 `zh`/`en`/`tags`/`ratio`。

两套实现手工维护，漂移是必然的；只有对拍能抓住。

## 用法速查

```bash
node scripts/forge.js list style                    # 列画风
node scripts/forge.js list theme --grep 机甲         # 筛题材
node scripts/forge.js build --style ST-001 --theme TH-020 --layout LT-001 --palette PL-001
node scripts/forge.js build --style ST-001 --json   # 程序化取
node scripts/forge.js diagnose --style ST-001       # 只报缺什么
node scripts/forge.js entry G-20                    # 单条详情
node scripts/forge.js presets                       # 五个调通的组合

# 按模型再给一份优化版（五个模型语法不同，不能互换）
node scripts/forge.js build --style ST-001 --theme TH-020 --model flux
node scripts/forge.js build --style ST-001 --theme TH-020 --model mj --json
#   --json 时多出：model / modelPrompt / modelParams / modelNote
#   通用正文 en 永远在，不被覆盖 —— 它是基准。

# 随机抽一组（还不知道要什么）
node scripts/forge.js draw --n 4
node scripts/forge.js draw --n 4 --lock style=ST-001    # 锁住画风

# 真的出图并存到本地
node scripts/forge.js render --draw 2 --model sana --out ./out
#   文件名是「模型__组合串」，同一组换模型不会互相覆盖。
#   免 key 通道约一半请求被限流挡掉，默认重试 3 次。
```

退出码：`0` 正常 · `2` 组合含 R2/R3 不可直接商用 · `1` 参数不足 · `3` 数据源缺失

## 维护约束

1. **合成规则只有一处真源**：`assets/studio.js` 的 `compose()` / `composeTags()`。
   bundle 侧是镜像实现，改一处必须改两处，靠【8】组对拍兜住。

2. **正文不写作品名与创作者名**。工作室层的条目名叫「吉卜力（宫崎骏）」是**检索索引**，
   工作流显示的是 `data-studio-alias.js` 里的特征名（如「田园手绘背景」）。
   改别名表时注意 `tagsKw` 也要去标识 —— 原始 `kw` 里混着 `studio ghibli`。

3. **画风层只出技法，不出场景**。59 条画风正文开头都自带完整场景，
   与题材层拼接必然主体对冲。工作流用 `craftEn` / `craftZh`（纯技法），
   单条查看才用完整 `gpt` / `gptZh`。

4. **`data.json` 是投影不是副本**。条目本体在 `assets/data-*.js`，
   那是唯一真源。不要直接编辑 `data.json`。