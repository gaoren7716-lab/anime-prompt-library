/* ============================================================
 * smoke.js — index.html 的运行时冒烟测试
 * 用最小 DOM 桩在 vm 中执行内联脚本，检查是否存在运行时错误
 * 用法：node tools/smoke.js
 * ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');

// 提取所有内联 <script>（不带 src 的）
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!scripts.length) { console.error('未找到内联脚本'); process.exit(1); }

function fakeEl() {
  const store = {};
  return new Proxy(store, {
    get(t, k) {
      if (k === 'innerHTML' || k === 'textContent' || k === 'value') return t[k] || '';
      if (k === 'classList') return { add(){}, remove(){}, toggle(){}, contains(){ return false; } };
      if (k === 'dataset') return t.__ds || (t.__ds = {});
      if (k === 'style') return {};
      if (k === 'querySelectorAll') return () => [];
      if (k === 'querySelector') return () => fakeEl();
      if (k === 'addEventListener') return () => {};
      if (k === 'appendChild' || k === 'remove' || k === 'select') return () => {};
      if (k === 'closest') return () => null;
      if (k === 'focus' || k === 'blur' || k === 'click') return () => {};
      if (k === 'setSelectionRange') return () => {};
      if (k === 'onclick') return t.__click;
      return undefined;
    },
    set(t, k, v) { if (k === 'onclick') t.__click = v; else t[k] = v; return true; }
  });
}

const els = {};
const sandbox = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  document: {
    getElementById: id => (els[id] = els[id] || fakeEl()),
    createElement: () => fakeEl(),
    addEventListener: () => {},
    head: fakeEl(),
    body: fakeEl()
  },
  navigator: {},
  __els: els
};
sandbox.window = sandbox;

Object.assign(sandbox, { STYLES: null, PROMPT_SETS: [] });

const ctx = vm.createContext(sandbox);

// 注入数据源（模拟 <script src>，顺序必须与 index.html 一致）
[
  'data-core.js', 'data-core-more.js', 'prompt-kit.js',
  'data-genres.js',
  'data-works-jp.js', 'data-works-global.js',
  'data-works-more-a.js', 'data-works-eur-w.js', 'data-works-eur-e.js', 'data-works-namer.js',
  'data-misc.js',
  'data-layout.js', 'data-palette.js',
  'data-prompts-st1.js', 'data-prompts-st2.js', 'data-prompts-st3.js',
  'data-prompts-gn1.js', 'data-prompts-gn2.js',
  'data-prompts-jp1.js', 'data-prompts-jp2.js', 'data-prompts-jp3.js', 'data-prompts-jp4.js',
  'data-prompts-cn1.js', 'data-prompts-ww1.js', 'data-prompts-gk1.js',
  'data-prompts-if1.js', 'data-prompts-fr1.js', 'data-prompts-ln1.js',
  // 开放式知识库
  'schema.js',
  'lib-form.js', 'lib-visual.js', 'lib-visual2.js',
  'lib-creature.js', 'lib-creature2.js', 'lib-creature3.js',
  'lib-world.js', 'lib-world2.js',
  'lib-story.js', 'lib-lens.js', 'lib-voice.js', 'lib-prod.js',
  'lib-morph.js', 'lib-retrieve.js',
  /* 顺序与 index.html 完全一致，顺序错了会重现线上的 ReferenceError：
     codes → resolver → engine → open-ui → code-ui → registry（必须最后，
     它依赖前面的全部数据与内联合并好的 WORKS/STYLES/GENRES）。 */
  'codes.js', 'code-map.js', 'rights.js', 'resolver.js', 'engine.js', 'open-ui.js', 'code-ui.js'
].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets', f), 'utf-8'), ctx, { filename: f });
});

// const 声明不会挂到 global object，追加一行把内部符号导出到 __api（仅测试期注入）
const EXPORT_LINE = '\nglobalThis.__api = { state, SECTIONS, WORKS, STYLES, render, buildFilters, buildPrompt, renderRecipe, card, el, PROMPT_MAP, promptCard, PROMPT_KIT, ENGINE, OPEN_VIEWS, OP };';
let failed = false;
let api = null;
scripts.forEach((code, i) => {
  try {
    /* 页面时序：内联脚本 #1（含 WORKS/STYLES/GENRES 合并）→ registry.js → 内联脚本 #2（调 boot）。
       照抄这个顺序，否则要么 REGISTRY 未定义，要么 boot 时读不到数据。 */
    if (i === 1) {
      vm.runInContext(fs.readFileSync(path.join(root, 'assets', 'registry.js'), 'utf-8'), ctx, { filename: 'registry.js' });
      console.log('  ✓ registry.js 执行成功（在两个内联脚本之间，与页面一致）');
    }
    vm.runInContext(code + EXPORT_LINE, ctx, { filename: 'inline-' + i + '.js' });
    api = sandbox.__api;
    console.log('  ✓ 内联脚本 #' + (i + 1) + ' 执行成功');
  } catch (e) {
    failed = true;
    console.error('  ✗ 内联脚本 #' + (i + 1) + ' 报错：' + e.message);
    console.error(e.stack.split('\n').slice(0, 4).join('\n'));
  }
});
if (!api) { console.error('无法获取内部接口，后续检查跳过'); process.exit(1); }

// ---- 逐切换每个板块并渲染，确认渲染逻辑不抛错 ----
const secs = ['styles','works','genres','vocab','templates','negatives','syntax','tpl'];
secs.forEach(s => {
  try {
    ctx.__api.state.sec = s; ctx.__api.state.facet = '全部';
    ctx.__api.buildFilters(); ctx.__api.render();
    console.log('  ✓ 板块渲染 ' + s);
  } catch (e) {
    failed = true;
    console.error('  ✗ 板块 ' + s + ' 渲染失败：' + e.message);
  }
});

// ---- 开放式知识库：四个视图逐一渲染 ----
try {
  const st = ctx.__api.state;
  ['openlibs','openfind','opencompose','openmorph'].forEach(v => {
    st.sec = v; st.facet = '全部'; ctx.__api.render();
  });
  console.log('  ✓ 知识库视图渲染 4 个（十二库 / 统一检索 / 组合 / 变形）');
} catch (e) { failed = true; console.error('  ✗ 知识库视图渲染失败：' + e.message); }

// ---- 开放式知识库：数据规模与引擎可用性 ----
try {
  const E = ctx.__api.ENGINE;
  if (!E) throw new Error('ENGINE 未挂载');
  const st = E.stats();
  if (st.nodes < 300) throw new Error('节点太少：' + st.nodes);
  if (st.entries < 324) throw new Error('已有条目不足：' + st.entries);
  if (st.slots !== 9) throw new Error('槽位数不对：' + st.slots);
  const r = E.retrieve('赛璐璐平涂');
  if (!r.hits.length) throw new Error('检索无结果');
  const c = E.compose({ subject: ['CB-01-1'], style: ['VS-04-1'], frame: ['LN-01-3'] });
  if (!c.gpt) throw new Error('组合未产出正文');
  console.log('  ✓ 知识库引擎：节点 ' + st.nodes + ' / 已有条目 ' + st.entries + ' / 槽位 ' + st.slots);
} catch (e) { failed = true; console.error('  ✗ 知识库引擎检查失败：' + e.message); }

// ---- 逐个筛选条件 ----
try {
  ctx.__api.state.sec = 'works';
  const grps = [...new Set(ctx.__api.WORKS.map(w => w.grp))];
  grps.forEach(g => { ctx.__api.state.facet = g; ctx.__api.render(); });
  console.log('  ✓ 作品分组筛选 ' + grps.length + ' 组');
} catch (e) { failed = true; console.error('  ✗ 分组筛选失败：' + e.message); }

// ---- 搜索（含新增的全球词条） ----
try {
  const qs = ['京阿尼', 'ghibli', '机甲', '赛博朋克', 'eva', '新海诚',
              'ligne claire', 'claymation', 'soviet', 'Moomin', '鬼灭', 'day of the dead'];
  qs.forEach(q => { ctx.__api.state.q = q; ctx.__api.render(); });
  ctx.__api.state.q = '';
  console.log('  ✓ 关键词搜索 ' + qs.length + ' 组');
} catch (e) { failed = true; console.error('  ✗ 搜索失败：' + e.message); }

// ---- 全球新增数据是否真正接进来 ----
try {
  const need = [
    { name: '全球流派', ok: ctx.__api.STYLES.some(s => s.cat === '全球流派') },
    { name: '韩国动画', ok: ctx.__api.WORKS.some(w => w.grp === '韩国动画') },
    { name: '欧洲·苏联东欧', ok: ctx.__api.WORKS.some(w => w.grp === '欧洲·苏联东欧') },
    { name: '拉美动画', ok: ctx.__api.WORKS.some(w => w.grp === '拉美动画') },
    { name: '北美·动画史源流', ok: ctx.__api.WORKS.some(w => w.grp === '北美·动画史源流') },
    { name: '印度·东南亚', ok: ctx.__api.WORKS.some(w => w.grp === '印度·东南亚') }
  ];
  const miss = need.filter(n => !n.ok).map(n => n.name);
  if (miss.length) throw new Error('缺失分组：' + miss.join('、'));
  console.log('  ✓ 全球新增分组 ' + need.length + ' 组全部就位');
} catch (e) { failed = true; console.error('  ✗ 新增数据检查失败：' + e.message); }

// ---- 配方合成 ----
try {
  ctx.__api.state.recipe = [];
  ['A3-02','G-13','W-J65','V-04'].forEach(id => {
    const all = ctx.__api.SECTIONS.flatMap(s => s.data);
    const d = all.find(x => x.id === id);
    if (d) ctx.__api.state.recipe.push({ id, zh: d.zh, kw: d.kw || (d.items ? d.items.map(x => x.t) : []) });
  });
  const out = ctx.__api.buildPrompt();
  ctx.__api.renderRecipe();
  console.log('  ✓ 配方合成：' + out.slice(0, 90) + '…');
  if (!/masterpiece/.test(out)) throw new Error('缺少画质收尾词');
} catch (e) { failed = true; console.error('  ✗ 配方合成失败：' + e.message); }

// ---- 提示词卡覆盖率 ----
try {
  const api = ctx.__api;
  // 只校验三个主板块；vocab / templates / negatives / syntax 为工具区，本就不配提示词卡
  const all = api.SECTIONS.filter(s => ['styles', 'works', 'genres'].includes(s.key))
    .flatMap(s => s.data);
  if (!all.length) throw new Error('主板块为空');
  const MAP = api.PROMPT_MAP;                 // 注意是 Map，必须用 get() 而非中括号
  const miss = all.filter(d => !MAP.get(d.id)).map(d => d.id);
  const seenIds = new Set(), dup = new Set();
  sandbox.PROMPT_SETS.forEach(set => set.forEach(p => {
    if (seenIds.has(p.id)) dup.add(p.id); else seenIds.add(p.id);
  }));
  if (miss.length) throw new Error('缺提示词 ' + miss.length + ' 条：' + miss.slice(0, 10).join(', ') + (miss.length > 10 ? '…' : ''));
  if (dup.length) throw new Error('提示词 ID 重复：' + dup.join(', '));
  const noAscii = Array.from(MAP.entries()).filter(([, g]) => /[^\x00-\x7F]/.test(g)).map(([k]) => k);
  if (noAscii.length) throw new Error('正文含非 ASCII 字符：' + noAscii.slice(0, 8).join(', '));
  const tiers = {};
  all.forEach(d => { const t = api.PROMPT_KIT.buildCard(d, d.cat || d.grp || '').tier; tiers[t] = (tiers[t] || 0) + 1; });
  console.log('  ✓ 提示词卡全覆盖 ' + all.length + '/' + all.length +
    '（画质档位 ' + Object.entries(tiers).map(([k, v]) => k + ' ' + v).join(' / ') + '）');
} catch (e) { failed = true; console.error('  ✗ 提示词卡检查失败：' + e.message); }

// ---- 数据完整性 ----
try {
  const sec = ctx.__api.SECTIONS.filter(s => s.data.length);
  const n = sec.reduce((a, s) => a + s.data.length, 0);
  const ids = sec.flatMap(s => s.data.map(d => d.id));
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) throw new Error('ID 重复：' + [...new Set(dup)].join(', '));
  console.log('  ✓ 数据完整性：' + sec.length + ' 板块 / ' + n + ' 条 / ID 无重复');
} catch (e) { failed = true; console.error('  ✗ 数据检查失败：' + e.message); }

console.log(failed ? '\n冒烟测试：失败' : '\n冒烟测试：全部通过');
process.exit(failed ? 1 : 0);
