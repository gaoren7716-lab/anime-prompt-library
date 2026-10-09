/* ============================================================
 * inventory.js — 提示词覆盖度盘点
 * 用法：node tools/inventory.js [> 输出文件]
 * 说明：数据文件顶层用 const，不会挂到 vm 全局对象，
 *       因此必须追加一行显式导出才能取到。
 * ============================================================ */
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const A = p => path.join(ROOT, p);

const sandbox = { console };
sandbox.window = sandbox;
const ctx = vm.createContext(sandbox);

const DATA_FILES = [
  'data-core.js', 'data-core-more.js',
  'data-genres.js',
  'data-works-jp.js', 'data-works-global.js',
  'data-works-more-a.js', 'data-works-eur-w.js', 'data-works-eur-e.js', 'data-works-namer.js',
  'data-misc.js'
];
const NAMES = ['STYLES', 'GENRES', 'WORKS_JP', 'WORKS_GLOBAL',
  'WORKS_MORE_A', 'WORKS_EUR_W', 'WORKS_EUR_E', 'WORKS_NAMER'];

for (const f of DATA_FILES) {
  vm.runInContext(fs.readFileSync(A('assets/' + f), 'utf8'), ctx, { filename: f });
}
const EXPORT_LINE = '\nglobalThis.__data = {' + NAMES.map(n =>
  n + ': (typeof ' + n + ' !== "undefined" ? ' + n + ' : null)').join(', ') + '};';
vm.runInContext(EXPORT_LINE, ctx, { filename: 'export.js' });
const D = ctx.__data;

const all = [];
function collect(list, sec) {
  if (!Array.isArray(list)) return;
  list.forEach(d => {
    if (!d || typeof d !== 'object' || !d.id) return;
    all.push({
      sec, id: d.id, zh: d.zh || '', en: d.en || d.romaji || '',
      cat: d.cat || '', grp: d.grp || '', year: d.year || '', studio: d.studio || '',
      kw: Array.isArray(d.kw) ? d.kw.slice() : [],
      desc: d.desc || '', note: d.note || ''
    });
  });
}
collect(D.STYLES, 'styles');
collect(D.GENRES, 'genres');
for (const k of ['WORKS_JP', 'WORKS_GLOBAL', 'WORKS_MORE_A', 'WORKS_EUR_W', 'WORKS_EUR_E', 'WORKS_NAMER']) {
  collect(D[k], 'works');
}

const done = new Set();
const re = new RegExp('id:\\s*"([^"]+)"', 'g');
fs.readdirSync(A('assets')).filter(f => /^data-prompts-/.test(f)).sort().forEach(f => {
  const txt = fs.readFileSync(A('assets/' + f), 'utf8');
  let m;
  while ((m = re.exec(txt))) done.add(m[1]);
});

const ids = new Set(all.map(d => d.id));
const orphan = Array.from(done).filter(x => !ids.has(x));

const bySec = {};
all.forEach(d => {
  bySec[d.sec] = bySec[d.sec] || { total: 0, done: 0, missing: [] };
  bySec[d.sec].total++;
  if (done.has(d.id)) bySec[d.sec].done++;
  else bySec[d.sec].missing.push(d);
});

console.log('=== 总数 ' + all.length + '，已写 ' + done.size + '，缺 ' + (all.length - Array.from(done).filter(x => ids.has(x)).length) + ' ===');
for (const k in bySec) console.log('  ' + k + ': ' + bySec[k].done + '/' + bySec[k].total);
if (orphan.length) console.log('\n[警告] 孤儿 ID：' + orphan.join(', '));

fs.writeFileSync(A('tools/_missing.json'),
  JSON.stringify(Array.prototype.concat.apply([], Object.keys(bySec).map(k => bySec[k].missing)), null, 1), 'utf8');
console.log('\n缺漏明细已写入 tools/_missing.json (' + Object.keys(bySec).reduce((a, k) => a + bySec[k].missing.length, 0) + ' 条)');
