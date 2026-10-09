# 示例画廊 · 待补清单

> 生成于 2026-10-09。下面的数字是**当时的实况快照**，不是历史问题记录——
> 补一张图数字就会变，动手前先用命令重新核对：
> 已配 13 张 · R0 候选池 94 条 · 当前覆盖 12%（以此对不上本表，就说明本表过期了）。

本文件由命令逐段导出，不是手工维护的表格：

```bash
node codex-skill/anime-prompt-forge/scripts/forge.js gallery --todo <段码>
```

段码共八个：`ST ER SB RG MV TH LT PL`。漏掉任何一段，
汇总数就会与 `gallery` 的候选池对不上——这正是本文件存在的原因。

## 现状

| 段 | 层 | 本段条目 | 已配图 | R0 待补 | 覆盖率 |
| --- | --- | --: | --: | --: | --: |
| ST | 画风流派 | 14 | 13 | 0 | 93% |
| ER | 年代 | 7 | 0 | 5 | 0% |
| SB | 工作室 | 14 | 0 | 1 | 0% |
| RG | 地区 | 10 | 0 | 7 | 0% |
| MV | 全球流派 | 14 | 0 | 11 | 0% |
| TH | 题材元素 | 32 | 0 | 28 | 0% |
| LT | 排版图型 | 30 | 0 | 30 | 0% |
| PL | 主题配色 | 12 | 0 | 12 | 0% |
| **合计** | | **133** | **13** | **94** | **10%** |

图片文件名用旧 id（`A1-01.png`），落到 `examples/`，并在 `assets/examples.js` 登记。

## 待办：同输入换风格对比组（需 keyed 通道）

方案：固定题材 TH-020 + 配色 PL-001 + 画幅 3:4，只换画风（建议 ST-001 / 002 / 003 /
004 / 008 / 009，覆盖平涂 / 柔光 / 厚涂 / 水彩 / 线稿 / 水墨六种机制），
做成 README 对比段——帮用户看清风格区别。

**2026-10-09 实测：免 key Sana 通道做不了这件事。** 固定 seed 时通道按 seed 出图、
正文后段不参与（六张视觉全同）；换 seed 或画风前置，画风层也不显形
（诊断图与逐项实验记录见当日工作日志）。
**对比组必须等 keyed 模型（GPT-Image / Flux）可用后受控制作**——
同一输入、同一模型版本、同一设置、只画风不同，且逐张人工核对画风确实显形后才可发布。

## 授权受限，不可直接配图（26 条）

这些条目**没有**计入上表的R0 待补。它们命中在世创作者姓名、工作室名、品牌名
或作品名，按 `assets/rights.js` 强制判R2/R3。要补图必须先做去标识化改写，
或走署名流程——直接把待补清单当成可执行任务，等于给出补不了的活儿。

| 编码 | 中文名 | 档位 | 依据 |
| --- | --- | --: | --- |
| ER-003 | 90 年代电视动画质感 | R3 | 命中 1 处受保护标识 |
| ER-006 | 20 年代 UHD 特效流 | R3 | 命中 2 处受保护标识 |
| MV-002 | Cuphead 手绘水彩风 | R3 | 命中 4 处受保护标识 |
| MV-004 | 爱尔兰手绘装饰风 | R2 | 命中 4 处受保护标识 |
| MV-007 | 剪影与剪纸动画 | R1 | 命中 2 处受保护标识 |
| RG-003 | 美式卡通（Cartoon Network 系） | R2 | 命中 2 处受保护标识 |
| RG-004 | 迪士尼复兴+手绘经典 | R2 | 命中 5 处受保护标识 |
| RG-005 | 成人动画 / Adult Swim 系 | R3 | 命中 5 处受保护标识 |
| SB-001 | 吉卜力（宫崎骏） | R2 | 命中 9 处受保护标识 |
| SB-002 | 京都动画（京阿尼） | R2 | 命中 3 处受保护标识 |
| SB-003 | SHAFT（新房昭之） | R2 | 命中 3 处受保护标识 |
| SB-004 | Ufotable（飞碟社） | R3 | 命中 8 处受保护标识 |
| SB-005 | TRIGGER（扳机社） | R2 | 命中 6 处受保护标识 |
| SB-006 | 骨头社 BONES | R3 | 命中 5 处受保护标识 |
| SB-007 | MADHOUSE（今敏写实路线） | R2 | 命中 5 处受保护标识 |
| SB-008 | MAPPA / WIT 现代暗调 | R3 | 命中 5 处受保护标识 |
| SB-009 | David Production（JOJO 线） | R3 | 命中 3 处受保护标识 |
| SB-010 | Science SARU（汤浅政明） | R2 | 命中 5 处受保护标识 |
| SB-011 | Production I.G（押井守路线） | R3 | 命中 2 处受保护标识 |
| SB-012 | 日升 SUNRISE（机甲谱系） | R3 | 命中 1 处受保护标识 |
| SB-013 | A-1 / CloverWorks 轻改流 | R2 | 命中 4 处受保护标识 |
| ST-006 | 半写实 / 真人向动画 | R2 | 命中 1 处受保护标识 |
| TH-002 | 机甲 / 机器人 | R3 | 命中 1 处受保护标识 |
| TH-009 | 魔法少女 | R3 | 命中 1 处受保护标识 |
| TH-010 | 妖怪 / 百鬼夜行 | R3 | 命中 1 处受保护标识 |
| TH-027 | 运动热血 | R3 | 命中 4 处受保护标识 |

> `SB`（工作室）整段 14 条里只有 1 条是真 R0。这是设计如此，不是数据缺失：
> 工作室名本身就受保护，所以这一段几乎不可能靠配图补齐。

## 逐段待补明细

### ST · 画风流派（0 条）

本段已全部配图。

### ER · 年代（5 条）

| 编码 | 中文名 | 文件名 |
| --- | --- | --- |
| ER-001 | 70 年代复古机器人动画 | `examples/A2-01.png` |
| ER-002 | 80 年代黄金赛璐璐 | `examples/A2-02.png` |
| ER-004 | 00 年代过渡期数码 | `examples/A2-04.png` |
| ER-005 | 10 年代高清电视动画 | `examples/A2-05.png` |
| ER-007 | 录像带 VHS 噪波 | `examples/A2-07.png` |

### SB · 工作室（1 条）

| 编码 | 中文名 | 文件名 |
| --- | --- | --- |
| SB-014 | Studio Colorido（3D 融合） | `examples/A3-14.png` |

### RG · 地区（7 条）

| 编码 | 中文名 | 文件名 |
| --- | --- | --- |
| RG-001 | 国产二维动画风 | `examples/A4-01.png` |
| RG-002 | 国产三维动漫 CG | `examples/A4-02.png` |
| RG-006 | 蜘蛛侠平行宇宙（2D+3D 混合） | `examples/A4-06.png` |
| RG-007 | 韩漫 / Webtoon 条漫 | `examples/A4-07.png` |
| RG-008 | VTuber / 虚拟主播立绘 | `examples/A4-08.png` |
| RG-009 | 动画截图感 | `examples/A4-09.png` |
| RG-010 | Vaporwave / 复古未来主义 | `examples/A4-10.png` |

### MV · 全球流派（11 条）

| 编码 | 中文名 | 文件名 |
| --- | --- | --- |
| MV-001 | 橡胶管动画（1930s） | `examples/A5-01.png` |
| MV-003 | 清晰线条派（丁丁线） | `examples/A5-03.png` |
| MV-005 | 欧式绘本水彩 | `examples/A5-05.png` |
| MV-006 | 黏土定格动画 | `examples/A5-06.png` |
| MV-008 | 有限动画现代主义 | `examples/A5-08.png` |
| MV-009 | 拼贴与混合媒介 | `examples/A5-09.png` |
| MV-010 | 孔版印刷质感 | `examples/A5-10.png` |
| MV-011 | 童书绘本插画 | `examples/A5-11.png` |
| MV-012 | 转描现实主义 | `examples/A5-12.png` |
| MV-013 | 苏联 · 东欧手绘 | `examples/A5-13.png` |
| MV-014 | 花窗玻璃与马赛克 | `examples/A5-14.png` |

### TH · 题材元素（28 条）

| 编码 | 中文名 | 文件名 |
| --- | --- | --- |
| TH-001 | 热血战斗 | `examples/G-01.png` |
| TH-003 | 忍者 / 武士 | `examples/G-03.png` |
| TH-004 | 特摄战队 / 变身英雄 | `examples/G-04.png` |
| TH-005 | 军事 / 战争题材 | `examples/G-05.png` |
| TH-006 | 巨型怪兽 / 巨物感 | `examples/G-06.png` |
| TH-007 | 剑与魔法（西幻） | `examples/G-07.png` |
| TH-008 | 异世界转生 | `examples/G-08.png` |
| TH-011 | 神话改编 | `examples/G-11.png` |
| TH-012 | 恶役千金 / 反转重生 | `examples/G-12.png` |
| TH-013 | 赛博朋克 | `examples/G-13.png` |
| TH-014 | VR / 游戏世界 | `examples/G-14.png` |
| TH-015 | 宇宙歌剧 / 太空 | `examples/G-15.png` |
| TH-016 | 时间穿越 / 循环 | `examples/G-16.png` |
| TH-017 | 蒸汽朋克 | `examples/G-17.png` |
| TH-018 | 末世 / 废土 | `examples/G-18.png` |
| TH-019 | 生化感染 / 幸存 | `examples/G-19.png` |
| TH-020 | 校园日常 | `examples/G-20.png` |
| TH-021 | 治愈慢生活 | `examples/G-21.png` |
| TH-022 | 恋爱 / 青春 | `examples/G-22.png` |
| TH-023 | 美食 / 料理 | `examples/G-23.png` |
| TH-024 | 音乐 / 乐队 | `examples/G-24.png` |
| TH-025 | 偶像 / 演艺 | `examples/G-25.png` |
| TH-026 | 职场 / 社畜 | `examples/G-26.png` |
| TH-028 | 竞速 / 机战载具 | `examples/G-28.png` |
| TH-029 | 推理 / 悬疑 | `examples/G-29.png` |
| TH-030 | 恐怖 / 灵异 | `examples/G-30.png` |
| TH-031 | 都市怪谈 / 里世界 | `examples/G-31.png` |
| TH-032 | 仙侠 / 武侠国风 | `examples/G-32.png` |

### LT · 排版图型（30 条）

| 编码 | 中文名 | 文件名 |
| --- | --- | --- |
| LT-001 | 上下图文卡 | `examples/LT-01.png` |
| LT-002 | 文案主导卡 | `examples/LT-02.png` |
| LT-003 | 对偶双栏卡 | `examples/LT-03.png` |
| LT-004 | 签名角落卡 | `examples/LT-04.png` |
| LT-005 | 全出血沉浸卡 | `examples/LT-05.png` |
| LT-006 | 竖向长条卡 | `examples/LT-06.png` |
| LT-007 | 金字塔层级图 | `examples/LT-07.png` |
| LT-008 | 中心主图标注图 | `examples/LT-08.png` |
| LT-009 | 并列对比图 | `examples/LT-09.png` |
| LT-010 | 时间轴流程图 | `examples/LT-10.png` |
| LT-011 | 分步步骤图 | `examples/LT-11.png` |
| LT-012 | 手帐拼贴图 | `examples/LT-12.png` |
| LT-013 | 规则四格 | `examples/LT-13.png` |
| LT-014 | 起承转合四格 | `examples/LT-14.png` |
| LT-015 | 对角切割分镜 | `examples/LT-15.png` |
| LT-016 | 大格冲击页 | `examples/LT-16.png` |
| LT-017 | 情绪递进条 | `examples/LT-17.png` |
| LT-018 | 网格蒙太奇 | `examples/LT-18.png` |
| LT-019 | 角色三视图 | `examples/LT-19.png` |
| LT-020 | 表情差分表 | `examples/LT-20.png` |
| LT-021 | 吉祥物设定页 | `examples/LT-21.png` |
| LT-022 | 配色情绪板 | `examples/LT-22.png` |
| LT-023 | 单品主图 | `examples/LT-23.png` |
| LT-024 | 多视角展示 | `examples/LT-24.png` |
| LT-025 | 卖点标注图 | `examples/LT-25.png` |
| LT-026 | 使用场景图 | `examples/LT-26.png` |
| LT-027 | 大字标题封面 | `examples/LT-27.png` |
| LT-028 | 隐喻主视觉 | `examples/LT-28.png` |
| LT-029 | 对比冲击封面 | `examples/LT-29.png` |
| LT-030 | 竖版故事封面 | `examples/LT-30.png` |

### PL · 主题配色（12 条）

| 编码 | 中文名 | 文件名 |
| --- | --- | --- |
| PL-001 | 经典蓝 | `examples/PL-01.png` |
| PL-002 | 柿子橙 | `examples/PL-02.png` |
| PL-003 | 鼠尾草绿 | `examples/PL-03.png` |
| PL-004 | 普鲁士蓝 | `examples/PL-04.png` |
| PL-005 | 胭脂红 | `examples/PL-05.png` |
| PL-006 | 奶油黄 | `examples/PL-06.png` |
| PL-007 | 墨黑金 | `examples/PL-07.png` |
| PL-008 | 灰粉 | `examples/PL-08.png` |
| PL-009 | 赭石 | `examples/PL-09.png` |
| PL-010 | 青灰 | `examples/PL-10.png` |
| PL-011 | 薰衣草 | `examples/PL-11.png` |
| PL-012 | 柠檬绿 | `examples/PL-12.png` |
