# -*- coding: utf-8 -*-
"""
repair_text.py —— 按显式映射修复中文字段中被注入的英文词/错字
不用模型再生成一遍，避免引入新的污染。每条替换都可审计。
"""
import io, sys, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# (文件, 原串, 新串)
FIXES = [
    # ---------- data-core-more.js ----------
    ("data-core-more.js", "四肢像橡胶管任意弯曲不断 Students，白手套、眯缝眼、爵士年代的音椁影响",
                          "四肢像橡胶管任意弯曲不断，白手套、眯缝眼、爵士年代的音乐影响"),
    ("data-core-more.js", "把三十年代 rubber hose 用真正的水彩逐帧画出来",
                          "把三十年代的橡皮管动画用真正的水彩逐帧画出来"),
    ("data-core-more.js", "与日式的「一次SES exactitude 干净」正相反",
                          "与日式那种一尘不染的干净正好相反"),
    ("data-core-more.js", "平面图形成像海报、用 MOVEMENT 少量帧表达动作",
                          "平面图形成像海报、用极少的帧表达动作"),
    ("data-core-more.js", "玻璃油画的层叠、 Clearly 厚涂水粉的背景",
                          "玻璃油画的层叠、明显厚涂的水粉背景"),

    # ---------- data-core.js ----------
    ("data-core.js", "代表是 Trigger、米山舞前的老派作画",
                     "代表是扳机社成立之前、米山舞之前的老派作画"),
    ("data-core.js", "适合怀旧游戏、地标.UI 资源",
                     "适合怀旧游戏、地标与界面美术资源"),
    ("data-core.js", "机器人造型敦实方正，作画帧数少（limited animation）",
                     "机器人造型敦实方正，作画帧数很少（有限动画）"),
    ("data-core.js", "已经开始出现 bloom 泛光与 3D 辅助背景",
                     "已经开始出现泛光效果与三维辅助背景"),
    ("data-core.js", "近年 lo-fi / vaporwave 视觉的标配",
                     "近年低保真与蒸汽波视觉的标配"),
    ("data-core.js", "天元突破、Kill la Kill、赛博朋克边缘行者",
                     "天元突破、斩服少女、赛博朋克边缘行者"),
    ("data-core.js", "肌肉线条强调到失真，pose 极度戏剧化",
                     "肌肉线条强调到失真，姿势极度戏剧化"),
    ("data-core.js", "背景自带 storybook 绘画感",
                     "背景自带故事书插画的绘画感"),
    ("data-core.js", "手绘轮廓、故障 glitch、亮色分层直接贴到 3D 渲染",
                     "手绘轮廓、故障效果、亮色分层直接贴到三维渲染"),
    ("data-core.js", "廉价感的 3D 铬金属字、故障与时码 UI",
                     "廉价感的铬金属立体字、故障与时间码界面"),

    # ---------- data-genres.js ----------
    ("data-genres.js", "Jump 系主流动漫的视觉语言：决定性 pose、集中线",
                       "少年漫画主流战斗作品的视觉语言：决定性姿势、集中线"),
    ("data-genres.js", "变身 bank + 蕾丝层次 + 星月符号 + 粉彩配色",
                       "变身段落 + 蕾丝层次 + 星月符号 + 粉彩配色"),
    ("data-genres.js", "夏目友人帐式温柔 vs 千与千寻式诡谲两条路",
                       "夏目友人帐式的温柔与千与千寻式的诡谲两条路"),
    ("data-genres.js", "《孤独摇滚》《BOCCHI》一类", "《孤独摇滚》一类"),
    ("data-genres.js", "违和的日常空间（liminal space）、影子里的手",
                       "违和的日常空间（阈限空间）、影子里的手"),
    ("data-genres.js", "zh:\"竞速 / 机战 vehicles\"", "zh:\"竞速 / 机战载具\""),

    # ---------- data-misc.js ----------
    ("data-misc.js", "纯背景、.Game 背景、速写参考", "纯背景、游戏背景、速写参考"),
    ("data-misc.js", "前述法国海底 uniune 混合风格、游戏最终画面",
                     "前述法国海底混合风格、游戏最终画面"),
    ("data-misc.js", "这是 STYLE 层 A4-06 的直接应用", "这是画风层 A4-06 的直接应用"),

    # ---------- data-works-global.js ----------
    ("data-works-global.js", "火焰 treads 与莲花图腾融合", "火焰纹样与莲花图腾融合"),
    ("data-works-global.js", "黑红配色的魔道 main_CONTENT、江氏樊楼水榭",
                             "黑红配色的魔道世界、江氏樊楼水榭"),
    ("data-works-global.js", "钢铁氈土、 police mechanaughts、时代感婚纱。线条更 angular",
                             "钢铁都市、警察机甲、时代感婚纱。线条更加硬朗"),
    ("data-works-global.js", "橡皮管四肢与极简几何 Forms：", "橡皮管四肢与极简几何块面："),
    ("data-works-global.js", "重点是「像 declined 手 Milwaukee 的收视节目」",
                             "重点是故意画出那种粗制滥造的地方节目感"),
    ("data-works-global.js", "木屋小镇、 indexing 森林秘景", "木屋小镇、层层叠叠的森林秘景"),
    ("data-works-global.js", "大面积的纯色 field、几乎没有中间色", "大面积的纯色块、几乎没有中间色"),
    ("data-works-global.js", "哥谭的装饰艺术建筑、 Contrast 极强的投影",
                             "哥谭的装饰艺术建筑、反差极强的投影"),
    ("data-works-global.js", "八十年代的商业动画模板：方正的机器人方块、原色配色、印刷感强的 cel 上色。机械变形的分件连 amador。",
                             "八十年代商业动画的样板：方正的机甲块面、原色配色、印刷感很强的赛璐璐上色。机械变形的分件衔接清楚。"),
    ("data-works-global.js", "变形能力与 Energy 的表现：", "变形能力与能量释放的表现："),
    ("data-works-global.js", "浮世绘的木纹版肌理、 selective 单色倾向（蓝眼保留色彩）、受不了 films 的仪式感",
                             "浮世绘的木版画肌理、选择性的单色处理（只有蓝眼保留色彩）、以及电影般的仪式感"),
    ("data-works-global.js", "平涂 + 粗直线、美式郊区 everyday life、 sudden 极血腥。 Marionette 相当写实",
                             "平涂加粗直线、美式郊区日常，以及突然降临的极度血腥。人偶式的机械造型相当写实"),
    ("data-works-global.js", "塑料质感的方块 geometry、元素旋风的 frequently 粒子。整体是设备渲染的干净 CG。",
                             "塑料质感的方块几何、频繁出现的元素旋风粒子。整体是干净清爽的三维渲染。"),
    ("data-works-global.js", "战术人形：军事装备与 nomenclatura 严谨差距、冷工业光",
                             "战术人形：军事装备的严谨考据、冷调工业光"),

    # ---------- data-works-jp.js ----------
    ("data-works-jp.js", "眼中星形高光<｜hy_placeholderno813｜>是舞台谎言的符号",
                         "眼中的星形高光是舞台谎言的符号"),

    # ---------- data-works-more-a.js ----------
    ("data-works-more-a.js", "八十年代的硬派筋肉兄弟 Adaptation：肌肉被画到几乎撑破轮廓线，暗部是大块的纯黑，废墟背景压 low 饱和。",
                             "八十年代的硬派肌肉叙事：肌肉被画到几乎撑破轮廓线，暗部是大块的纯黑，废墟背景压低饱和。"),
    ("data-works-more-a.js", "一脉的代表： alpine 牧场的水彩式背景", "一脉的代表：高山牧场的水彩式背景"),
    ("data-works-more-a.js", "罗圈眼与鸣人的 whisker 脸纹", "罗圈眼与鸣人须状的脸纹"),
    ("data-works-more-a.js", "战斗 Often 用大面积黑与单一点缀色形成强对比", "战斗常用大面积黑与单一点缀色形成强对比"),
    ("data-works-more-a.js", "红色 beads 项链、御神木", "红色念珠项链、御神木"),
    ("data-works-more-a.js", "进化 Bridge 是它的核心视觉", "进化段落是它的核心视觉"),
    ("data-works-more-a.js", "以及大量극端视角", "以及大量极端视角"),
    ("data-works-more-a.js", "稀疏邮局的斜 Yahoo 光", "稀疏邮局的斜射日光"),
    ("data-works-more-a.js", "拒绝对 polymorphisms 角色过分夸张", "拒绝对兽化角色过分夸张"),
    ("data-works-more-a.js", "涂装磨损、液压 visible。", "涂装磨损、液压清晰可见。"),
    ("data-works-more-a.js", "近年最冒险的主流公路 feel之一", "近年最具冒险性的主流作品之一"),
    ("data-works-more-a.js", 'zh:"阿尔斯 no 巨神", romaji:"Knights of Sidonia"',
                             'zh:"银河骑士传", romaji:"Knights of Sidonia"'),
    ("data-works-more-a.js", "清晰的工业轮廓与 flat shadow，没有贴图质感", "清晰的工业轮廓与平涂阴影，没有贴图质感"),
    ("data-works-more-a.js", "几乎没有 aggressive 阴影", "几乎没有生硬的阴影"),
    ("data-works-more-a.js", "以及几乎不留 Step Avoidance 的搞笑节奏", "以及几乎不间断的搞笑节奏"),
    ("data-works-more-a.js", "紫色的灵质光晕与霓虹 Night 灯并存", "紫色的灵质光晕与霓虹夜灯并存"),
    ("data-works-more-a.js", "全身服装的金属质感与日式二维 warring 明显不同", "全身服装的金属质感与日式二维作品明显不同"),
    ("data-works-more-a.js", "突破шан 的蓝色水流是主要能量形态", "突破关隘的蓝色水流是主要能量形态"),
    ("data-works-more-a.js", "粉紫与橙红的电影海报用色，Rose 是全片的视觉母题", "粉紫与橙红的电影海报用色，玫瑰是全片的视觉母题"),
    ("data-works-more-a.js", 'studio:"Cinéestaan - Gitanjali Rao"', 'studio:"Gitanjali Rao 工作室"'),
]

# 全局字符级清理：仍可能在别处残留
CHAR_CLEAN = ["\u0301", "\u2581", "\u200b", "\u0327"]


def main():
    base = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
    applied, missed = 0, []
    for fname, old, new in FIXES:
        p = os.path.join(base, fname)
        src = open(p, encoding="utf-8").read()
        if old in src:
            src = src.replace(old, new, 1)
            open(p, "w", encoding="utf-8", newline="").write(src)
            applied += 1
        else:
            missed.append((fname, old[:30]))

    for c in CHAR_CLEAN:
        for f in sorted(os.listdir(base)):
            if not f.endswith(".js"):
                continue
            p = os.path.join(base, f)
            s = open(p, encoding="utf-8").read()
            if c in s:
                s = s.replace(c, "")
                open(p, "w", encoding="utf-8", newline="").write(s)
                print("清理不可见字符 %r -> %s" % (c, f))

    print("已替换 %d / %d 条" % (applied, len(FIXES)))
    for m in missed:
        print("  !! 未命中：%s | %s" % m)


if __name__ == "__main__":
    main()
