# -*- coding: utf-8 -*-
"""扫描数据文件中的异常字符（非 ASCII / 非中日文 / 非常见标点），用于定位文本污染行。"""
import sys, os, io

ALLOWED_EXTRA = set('—～·《》「」『』【】、。，；：？！（）－…　→←↑↓★☆●■□▲△×‖§°±')

def is_ok(ch):
    o = ord(ch)
    if ch in '\t' or ch in ALLOWED_EXTRA:
        return True
    if 0x20 <= o < 0x7F:
        return True
    if 0x4E00 <= o <= 0x9FFF:      # CJK 汉字
        return True
    if 0x3000 <= o <= 0x303F:      # CJK 标点
        return True
    if 0x3040 <= o <= 0x30FF:      # 平假名 / 片假名
        return True
    if 0xFF00 <= o <= 0xFFEF:      # 全角字符
        return True
    return False

def scan(path):
    with io.open(path, encoding='utf-8') as f:
        lines = f.read().split('\n')
    hits = []
    for i, line in enumerate(lines, 1):
        bad = []
        for ch in line:
            if not is_ok(ch):
                bad.append('%s(U+%04X)' % (ch, ord(ch)))
        if bad:
            hits.append((i, line.strip()[:100], bad[:6]))
    print('==== %s : %d 行异常 ====' % (os.path.basename(path), len(hits)))
    for i, txt, bad in hits:
        print('L%-4d %s' % (i, txt))
        print('      >> %s' % ', '.join(bad))
    print()

for p in sys.argv[1:]:
    scan(p)
