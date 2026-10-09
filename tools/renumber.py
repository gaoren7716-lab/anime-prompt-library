# -*- coding: utf-8 -*-
"""把 data-works-more-a.js 中日本补遗的 W-J01..W-J27 顺延为 W-J86..W-J112
起因：data-works-jp.js 已占用 W-J01..W-J85，补遗必须接在后面。
降序替换，避免 W-J01 把 W-J10 的前缀吃掉。
"""
import os

p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                 "assets", "data-works-more-a.js")
s = open(p, encoding="utf-8").read()
n = 0
for i in range(27, 0, -1):
    old = 'id:"W-J%02d"' % i
    new = 'id:"W-J%d"' % (i + 85)
    if old in s:
        s = s.replace(old, new)
        n += 1
open(p, "w", encoding="utf-8", newline="").write(s)
print("已重编号 %d 条" % n)
