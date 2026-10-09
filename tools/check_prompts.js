/* ============================================================
 * check_prompts.js — 提示词卡体检
 * 用法：node tools/check_prompts.js
 * 检查：1) gpt 正文是否混入非 ASCII（中文字污染）
 *       2) ID 是否重复 / 是否对应真实条目
 *       3) 正文字数是否在合理区间
 * ============================================================ */
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const L = require('./_loadlist.js');
const A = L.A;

const sandbox = { console };
sandbox.window = sandbox;
const ctx = vm.createContext(sandbox);

/* 数据与脚本清单来自 tools/_loadlist.js（唯一真源）。
   原先这里又手抄一份，且只抄了 STYLES 没抄 STYLES_MORE——
   于是 A5 全流派被误报「在源数据中不存在」。
   抄清单这件事每多一处就多一个静默故障点，所以只保留一份。 */
L.SANDBOX_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), 'utf8'), ctx, { filename: f }));
vm.runInContext('\nglobalThis.__data = {' + L.DATA_NAMES.map(n =>
  n + ': (typeof ' + n + ' !== "undefined" ? ' + n + ' : null)').join(', ') + '};', ctx);
const D = ctx.__data;

const entries = [];
L.DATA_NAMES.forEach(k => { if (Array.isArray(D[k])) Array.prototype.push.apply(entries, D[k]); });
const known = {};
entries.forEach(d => { if (d && d.id) known[d.id] = d; });

const files = L.PROMPT_FILES;
let bad = 0, total = 0;
const seen = {};

files.forEach(f => {
  const txt = fs.readFileSync(A(f), 'utf8');
  const re = /\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?gpt:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?\}/g;
  let m, n = 0;
  while ((m = re.exec(txt))) {
    const id = m[1], gpt = m[2];
    n++; total++;
    if (!(id in known)) { console.log('  ✗ [' + f + '] ' + id + ' 在源数据中不存在'); bad++; }
    if (seen[id]) { console.log('  ✗ [' + f + '] ' + id + ' 重复（已见于 ' + seen[id] + '）'); bad++; }
    seen[id] = f;
    const nan = gpt.match(/[^\x00-\x7F]/g);
    if (nan) {
      console.log('  ✗ [' + f + '] ' + id + ' 正文含非 ASCII：' + Array.from(new Set(nan)).join(' '));
      bad++;
    }
    const words = gpt.trim().split(/\s+/).length;
    if (words < 60) { console.log('  ! [' + f + '] ' + id + ' 正文偏短 ' + words + ' 词'); }
    if (!/\.$/.test(gpt.trim())) { console.log('  ! [' + f + '] ' + id + ' 正文未以句号结尾'); }
  }
  console.log('  ' + f + ' → ' + n + ' 条');
});

console.log('\n共 ' + total + ' 条提示词，对应 ' + Object.keys(known).length + ' 个条目，覆盖率 ' +
  ((total / Object.keys(known).length) * 100).toFixed(1) + '%');
console.log(bad ? '\n体检：发现 ' + bad + ' 处问题' : '\n体检：全部通过');
process.exit(bad ? 1 : 0);
