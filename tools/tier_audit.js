/* tools/tier_audit.js —— 画质档位分布盘点 */
const path = require("path");
const fs = require("fs");
const vm = require("vm");
const L = require("./_loadlist.js");
const ROOT = L.ROOT;
const A = L.A;

/* 清单来自 _loadlist.js。原先这里手抄一份且漏了 data-misc.js，
   已随脚本清单收敛到唯一真源（见 tools/_loadlist.js 的说明）。 */
const NAMES = L.DATA_NAMES;

const ctx = vm.createContext({ module: undefined, console });
vm.runInContext("var PROMPT_KIT;" + fs.readFileSync(A("prompt-kit.js"), "utf8")
  .replace(/^var PROMPT_KIT/, "PROMPT_KIT"), ctx);
L.SANDBOX_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
vm.runInContext("globalThis.__d={" + NAMES.map(n => n + ":(typeof " + n + "!=='undefined'?" + n + ":[])").join(",") + "};", ctx);
const D = ctx.__d;
const K = ctx.PROMPT_KIT;

/* 只读 STYLES，不再 concat STYLES_MORE。
   A5（全球流派）14 条的追加由 data-core-more.js 末尾的 push 完成，
   它在本脚本的 vm 上下文里同样生效（两个文件都 runInContext 到同一个 ctx，
   且都是 var/顶层声明，STYLES 全局可见），所以 STYLES 已是 59 条全量。
   再 concat STYLES_MORE 会得到 73 条——14 条重复。 */
const seenId = {};
const all = [].concat(D.STYLES, D.WORKS_JP, D.WORKS_GLOBAL,
  D.WORKS_MORE_A, D.WORKS_EUR_W, D.WORKS_EUR_E, D.WORKS_NAMER,
  D.GENRES, D.LAYOUTS, D.PALETTES).filter(d => {
    if (!d || !d.id || seenId[d.id]) return false;
    seenId[d.id] = 1;
    return true;
  });

const cnt = {};
all.forEach(d => { cnt[d.id] = (cnt[d.id] || 0) + 1; });
const dupIds = Object.keys(cnt).filter(k => cnt[k] > 1);
console.log("总条目 " + all.length + " · 唯一 ID " + Object.keys(cnt).length +
  (dupIds.length ? " · ⚠ 重复 ID " + dupIds.length + " 个：" + dupIds.join(",") : " · 无重复"));

const h = { clean: 0, retro: 0, painter: 0, cg: 0, print: 0 };
all.forEach(d => { h[K.qualityTier(d).tier]++; });
console.log("总条目 " + all.length + "  " + JSON.stringify(h));
["retro", "print", "painter", "cg"].forEach(t => {
  const list = all.filter(d => K.qualityTier(d).tier === t);
  console.log("\n--- " + t + " 命中 " + list.length + " 条（前 8）---");
  list.slice(0, 8).forEach(d => {
    const r = K.qualityTier(d);
    console.log("  " + d.id + " " + d.zh + "  ← " + r.hit + "（权重 " + r.score + "）");
  });
});
console.log("\n--- clean 前 8 ---");
all.filter(d => K.qualityTier(d).tier === "clean").slice(0, 8)
  .forEach(d => console.log("  " + d.id + " " + d.zh + "  | " + (d.kw || []).slice(0, 3).join(", ")));

/* 按板块看档位分布：确认没有某个板块整片落在同一档

   「画风流派」只取 STYLES，不能再 concat STYLES_MORE——
   STYLES 已经是 59 条全量（追加在 data-core-more.js 末尾完成），
   再 concat 就是 73 条、A5 那 14 条各算两遍。
   上一版下面这行正是 `[].concat(D.STYLES, D.SYLES_MORE)`，
   与本文件开头第 21–25 行的注释自相矛盾：
   注释说「只读 STYLES」，代码却 concat 了。
   这类不一致只影响统计口径，不报红，所以一直没被发现——
   报告里「画风流派 73 条」看着像数据多了，实际是重复计数。 */
console.log("\n=== 分板块档位分布 ===");
const groups = {
  "画风流派": D.STYLES,
  "作品 IP": [].concat(D.WORKS_JP, D.WORKS_GLOBAL, D.WORKS_MORE_A, D.WORKS_EUR_W, D.WORKS_EUR_E, D.WORKS_NAMER),
  "题材元素": D.GENRES,
  /* 排版与配色层也要纳入：它们同样会出图、同样吃画质档。
     漏掉的话一旦这两层的 kw 里出现年代/印刷特征，永远不会被体检到。 */
  "排版图型": D.LAYOUTS,
  "主题配色": D.PALETTES
};
/* 每组内部按 ID 去重，避免同一条被重复计数（与 all 的口径保持一致） */
function uniqById(list) {
  const seen = {};
  return list.filter(d => {
    if (!d || !d.id || seen[d.id]) return false;
    seen[d.id] = 1;
    return true;
  });
}
Object.keys(groups).forEach(g => {
  const list = uniqById(groups[g]);
  groups[g] = list;
  const hh = {};
  list.forEach(d => { const t = K.qualityTier(d).tier; hh[t] = (hh[t] || 0) + 1; });
  const n = Object.keys(hh).length;
  console.log("  " + g + "（" + list.length + " 条 / " + n + " 档）：" +
    Object.entries(hh).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + " " + v).join("  "));
  if (n === 1) console.log("    ⚠ 整块只有一档，判定规则可能过宽或过窄");
});

/* 配色层整块 clean 是正常的，不该按「规则失效」报警。
   画质档判的是**画面性质**（年代胶片 / 印刷网点 / 手绘笔触 / 三维渲染），
   而配色层描述的是**颜色本身**——一条配色里出现 halftone 或 impasto
   才说明数据串了层。所以这里只做一次反向确认，不报警。 */
console.log("  注：配色层整块 clean 属预期——画质档判的是画面性质，"
  + "配色条目只描述颜色，不含年代/笔触/三维信号。");
{
  const bad = groups["主题配色"].filter(d => {
    const t = K.qualityTier(d).tier;
    return t !== "clean";
  });
  console.log("  反向确认：配色层误入非 clean 档的 " + bad.length + " 条"
    + (bad.length ? " → " + bad.map(d => d.id + "(" + d.zh + ")/" + K.qualityTier(d).tier).join(", ") : " ✓"));
}

/* 抽查：现代高清条目不应被判成年代做旧 */
console.log("\n=== 反向抽查（这些必须是 clean）===");
["A2-05", "A2-06", "A1-01", "A1-02"].forEach(id => {
  const d = all.find(x => x.id === id);
  if (!d) { console.log("  " + id + " 未找到"); return; }
  const r = K.qualityTier(d);
  console.log("  " + id + " " + d.zh + " → " + r.tier + (r.tier === "clean" ? " ✓" : " ✗ 应为 clean"));
});
