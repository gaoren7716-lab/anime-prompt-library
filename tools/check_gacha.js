/* ============================================================
 * tools/check_gacha.js —— 抽卡层体检
 * ============================================================
 * 为什么单独测，而不是靠 ui_test 点一下：
 *
 *   抽卡的失败方式全是**静默**的，而且几乎都长成「能用但不对」：
 *     - 槽位漏了一层 → 抽出来的图少一层约束，照样能出图；
 *     - 池规模被缓存 → 补库之后界面还在显示旧数字，看起来完全正常；
 *     - roll() 顺手改了全局 S → 用户当前的画风被一次抽卡换掉；
 *     - 空间不足时死循环 → 页面卡住，但控制台没有任何错误。
 *   这四种 ui_test 都看不见（它只看「点下去有没有东西」）。
 *
 * 所以这一层对着数据断言：槽、空间、锁定、去重、空槽、污染。
 * ============================================================ */
const fs = require("fs");
const vm = require("vm");
const L = require("./_loadlist.js");
const A = L.A;

let pass = 0, fail = 0;
function ok(cond, msg) { cond ? pass++ : (fail++, console.log("  ✗ " + msg)); }
function head(t) { console.log("\n" + t); }

/* ---------- 载入（顺序与 index.html 一致） ---------- */
const ctx = vm.createContext({ console });
ctx.globalThis = ctx;
L.SANDBOX_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.PROMPT_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.PROMPT_ZH_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.ENGINE_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));

const D = {
  STYLES: vm.runInContext("(typeof STYLES!=='undefined'?STYLES:[])", ctx),
  GENRES: vm.runInContext("(typeof GENRES!=='undefined'?GENRES:[])", ctx),
  LAYOUTS: vm.runInContext("(typeof LAYOUTS!=='undefined'?LAYOUTS:[])", ctx),
  PALETTES: vm.runInContext("(typeof PALETTES!=='undefined'?PALETTES:[])", ctx)
};

const ENGINE = require(A("engine.js")).ENGINE;
ENGINE.register(D.STYLES, "styles", "画风流派");
ENGINE.register(D.GENRES, "genres", "题材元素");
ENGINE.register(D.LAYOUTS, "layouts", "排版图型");
ENGINE.register(D.PALETTES, "palettes", "主题配色");

const STUDIO = require(A("studio.js")).STUDIO;
const GACHA = require(A("gacha.js")).GACHA;
const RENDER_NET = require(A("render-net.js")).RENDER_NET;

/* ---------- 1. 槽位从工作流派生 ---------- */
head("【1】槽位从 STUDIO.STEPS 派生（库加一步，抽卡自动多一槽）");
{
  const slots = GACHA.slots();
  ok(slots.length === STUDIO.STEPS.length,
    "槽位数 = 工作流步数（" + slots.length + " = " + STUDIO.STEPS.length + "）");
  STUDIO.STEPS.forEach((s, i) => {
    ok(slots[i].key === s.key, "第 " + (i + 1) + " 槽 = 工作流第 " + (i + 1) + " 步「" + s.zh + "」");
    ok(slots[i].label === s.zh, "槽名取自步骤中文名：" + slots[i].label);
    ok(slots[i].count > 0, "「" + s.zh + "」候选不为空（" + slots[i].count + " 条）");
    ok(slots[i].source === "studio", "「" + s.zh + "」标记为派生槽，不是硬编码");
  });
  ok(slots.every(s => Array.isArray(s.entries) && s.entries.length === s.count),
    "每个槽都带 entries（候选明细），供界面直接渲染");
}

/* ---------- 2. 池规模现算 ---------- */
head("【2】池规模每次现算，等于各槽候选数之积");
{
  const p = GACHA.pool();
  const byHand = GACHA.slots().reduce((a, s) => a * Math.max(s.count, 1), 1);
  ok(p.space === byHand, "空间 " + p.space + " = 各槽乘积 " + byHand);
  ok(p.slots.length === STUDIO.STEPS.length, "池报告里每个槽一行");
  ok(p.empty.length === 0, "当前没有空槽");
  ok(p.usable === p.slots.length, "可用槽数与槽数一致（" + p.usable + "）");
  ok(p.spaceZh.indexOf("亿") >= 0 || p.spaceZh.indexOf("万") >= 0 || p.spaceZh.indexOf(",") >= 0,
    "空间有口语化写法：" + p.spaceZh);

  /* 现算的直接证据：注册一个新槽，空间必须立刻变大。
     如果实现里偷偷缓存过 pool()，这里会失败。 */
  const before = GACHA.pool().space;
  ok(GACHA.register({ key: "__probe", label: "探针", seg: "PR", list: ["A1-01", "A1-02", "A1-03"] }) === true,
    "register() 接受一个带函数/数组候选的额外槽");
  const after = GACHA.pool().space;
  ok(after === before * 3, "注册 3 个候选的槽后空间 ×3（" + before + " → " + after + "），说明是现算不是缓存");
  ok(GACHA.pool().slots.some(s => s.key === "__probe"), "新槽出现在池报告里");
  ok(GACHA.summary().indexOf("探针") >= 0, "池构成说明里也有新槽");
}

/* ---------- 3. register 的健壮性 ---------- */
head("【3】register 校验（扩展点写错不该让整页抽不了卡）");
{
  ok(GACHA.register({ key: "__probe", label: "重复", list: [] }) === false, "重复 key 拒绝注册");
  ok(GACHA.register({ label: "无 key", list: [] }) === false, "缺 key 拒绝注册");
  ok(GACHA.register({ key: "__n", label: "无候选", list: null }) === false, "缺候选来源拒绝注册");
  let threw = false;
  try { GACHA.register(null); GACHA.register("x"); GACHA.register({ key: "y", list: 5 }); }
  catch (e) { threw = true; }
  ok(!threw, "传垃圾参数不抛异常（扩展点是可选增强，不该让主流程崩）");
  ok(GACHA.register({ key: "style", label: "重名工作流槽", list: ["A1-01"] }) === false
     || GACHA.pool().slots.filter(s => s.key === "style").length === 1,
    "与工作流同名的注册槽不会让同一维出现两次");
}

/* ---------- 4. 抽一组 ---------- */
head("【4】roll()：四步给齐、能出图、不动用户当前选择");
{
  STUDIO.reset();
  STUDIO.pick("style", "A1-01"); STUDIO.pick("theme", "G-20");
  const snapshot = JSON.stringify(STUDIO.S);

  const r = GACHA.roll({ ratio: "1:1" });
  /* 槽数取 GACHA.slots() 而不是 STEPS.length：
     前面的用例注册过额外槽，那是「库升级」的模拟，本来就该多出来。 */
  ok(r.rows.length === GACHA.slots().length, "一行一槽（" + r.rows.length + "）");
  ok(r.rows.every(x => x.id), "每一槽都抽到条目：" + r.rows.map(x => x.id).join(" / "));
  ok(r.codes.length === r.rows.filter(x => x.id && !x.empty).length,
    "能出图的槽都有规范码：" + r.codes.join(" + "));
  ok(r.chain === r.codes.join(" + "), "组合串 = 规范码顺序拼接");
  ok(r.prompt.length > 100, "每张都有完整英文正文（" + r.prompt.length + " 字符）");
  ok(/Aspect ratio 1:1/.test(r.prompt), "正文带上了出图比例（不与请求打架）");
  ok(/Rendering approach:/.test(r.prompt), "正文里有画法段（说明画风层进去了）");
  ok(r.missing.length === 0, "没有空槽时报 missing 为空");
  ok(JSON.stringify(STUDIO.S) === snapshot,
    "抽卡**没有**改动用户当前的四步选择 —— 抽完还是 " + JSON.stringify(STUDIO.S));

  /* 换比例：请求与正文必须同时改，不能只改一边 */
  const r2 = GACHA.roll({ ratio: "16:9" });
  ok(/Aspect ratio 16:9/.test(r2.prompt), "换 16:9 时正文里的画幅句也跟着换成 16:9");
}

/* ---------- 5. 锁定 ---------- */
head("【5】锁定：指定槽固定，其余照抽");
{
  const lock = { style: "A1-01" };
  const p0 = GACHA.pool();
  const p1 = GACHA.pool(lock);
  const styleSlot = p0.slots.find(s => s.key === "style");
  ok(p1.space === Math.round(p0.space / Math.max(styleSlot.count, 1)),
    "锁一层后空间收窄到其余槽的乘积（" + p0.space + " → " + p1.space + "）");
  ok(p1.slots.find(s => s.key === "style").locked === "A1-01", "池报告里标出了锁定值");

  let allLocked = true;
  for (let i = 0; i < 30; i++) {
    const r = GACHA.roll({ lock: lock });
    const row = r.rows.find(x => x.key === "style");
    if (!row || row.id !== "A1-01") allLocked = false;
  }
  ok(allLocked, "连续 30 次抽，锁定槽一直是 A1-01");

  /* 锁一个候选里不存在的值（库删过条目 / 换了一版数据）：
     必须当作没锁，而不是一直抽那个不存在的 id。 */
  const pBad = GACHA.pool({ style: "不存在的id" });
  ok(!pBad.slots.find(s => s.key === "style").locked,
    "锁的值不在候选里时按「没锁」处理（否则那一层会一直空着）");
  ok(pBad.space === p0.space, "无效锁定不会把空间错算成 1");
}

/* ---------- 6. 抽一批 + 去重 ---------- */
head("【6】rollBatch：组间不重复、空间不足不死循环");
{
  const b = GACHA.rollBatch(6, {});
  ok(b.cards.length === 6, "要 6 张给 6 张");
  ok(b.distinct === 6, "6 张互不相同（" + b.distinct + "）");
  const sigs = b.cards.map(c => c.chain);
  ok(new Set(sigs).size === 6, "组合串也互不相同：" + sigs.slice(0, 2).join(" | ") + " …");
  ok(b.note === "", "空间远大于张数时不给重复提示");
  ok(b.cards.every(c => c.prompt.length > 100), "每一张都带完整正文");

  /* 把空间压到 1 种：锁死全部槽 */
  const lockAll = {};
  GACHA.slots().forEach(s => { lockAll[s.key] = s.entries[0].id; });
  const p = GACHA.pool(lockAll);
  ok(p.space === 1, "全部锁定后空间 = 1 种（" + p.space + "）");
  const t0 = Date.now();
  const b2 = GACHA.rollBatch(4, { lock: lockAll });
  const cost = Date.now() - t0;
  ok(b2.cards.length === 4, "空间只有 1 种时仍然返回 4 张（不挂死）");
  ok(b2.cards.filter(c => c.repeat === true).length === 3,
    "补位的 3 张被标了 repeat（界面据此说明，不当成抽到了好签）");
  ok(b2.repeated === 3, "重复张数如实报告（repeated=" + b2.repeated + "）");
  ok(!b2.cards[0].repeat, "第一张不算重复 —— 它就是那唯一一种组合");
  ok(/重复组合/.test(b2.note), "空间不足时给出注释：" + b2.note.slice(0, 40) + "…");
  ok(cost < 5000, "没有死循环（耗时 " + cost + "ms）");

  /* 张数夹取：给 0 / 999 都不该崩 */
  ok(GACHA.rollBatch(0, {}).cards.length === 6, "张数 0 走默认值 6（清空输入框的常见后果）");
  ok(GACHA.rollBatch(999, {}).cards.length === 24, "张数 999 夹到 24（防止一次发几百个请求）");
  ok(GACHA.rollBatch("abc", {}).cards.length === 6, "非法张数走默认值，不抛异常");
  ok(GACHA.rollBatch(-3, {}).cards.length === 6, "负数走默认值");
}

/* ---------- 7. 空槽必须自报 ---------- */
head("【7】空槽自报（少一层约束的图照样能出，所以必须说出来）");
{
  /* 模拟「库升级过程中某一层被清空」：注册一个候选为空的槽 */
  ok(GACHA.register({ key: "__empty", label: "空层", seg: "EM", list: [] }), "注册一个候选为空的槽成功");
  const p = GACHA.pool();
  ok(p.empty.indexOf("__empty") >= 0, "pool() 把空槽列进 empty：" + p.empty.join(","));
  ok(p.usable === p.slots.length - p.empty.length, "usable 扣掉了空槽（" + p.usable + "）");
  ok(p.slots.find(s => s.key === "__empty").empty === true, "空槽在报告里标了 empty");

  const r = GACHA.roll({});
  ok(r.missing.indexOf("__empty") >= 0, "roll() 的 missing 里有空槽 —— 界面据此提醒「这张少一层」");
  ok(r.rows.find(x => x.key === "__empty").empty === true, "空槽那一行标记为 empty");
  ok(r.codes.length === r.rows.filter(x => x.id && !x.empty).length && r.codes.indexOf("") < 0,
    "空槽不占用规范码（码是给能出图的东西的）");

  const b = GACHA.rollBatch(3, {});
  ok(b.missing.indexOf("__empty") >= 0, "批量抽卡也会把空槽带出来");
}

/* ---------- 8. adopt：把组合写回工作流 ---------- */
head("【8】adopt()：把一组组合写回四步（「去精修」用）");
{
  STUDIO.reset();
  STUDIO.pick("theme", "G-01");
  const r = GACHA.roll({});
  ok(GACHA.adopt(r.ids) === true, "adopt 返回成功");
  STUDIO.STEPS.forEach(s => {
    ok(STUDIO.S[s.key] === r.ids[s.key], "「" + s.zh + "」被填成了 " + r.ids[s.key]);
  });
  const d = STUDIO.diagnose();
  ok(d.ready === true, "填完之后工作流可直接出图（不缺步）");
  ok(d.missing.length === 0, "填完之后没有缺步：" + d.missing.join(","));
  ok(GACHA.adopt(null) === false, "adopt(null) 返回 false，不抛异常");
}

/* ---------- 9. 源码层面：不许写死库规模 ---------- */
head("【9】源码约定：抽卡层不写死任何库规模数字");

/* 剥掉注释再扫。
   这条断言的本意是「**代码**里不许写死库规模」，而注释里写
   「界面说 59 种画风、实际能抽到 71 种」是在解释一个坑，
   不对任何运行行为产生影响。不剥注释的话，后来的人就只能把说明
   写成不敢写数字的空话 —— 那比放宽这条断言更糟。

   剥的时候必须跳过字符串字面量：CSS 片段里的 "padding:3px 10px"
   和 URL 里的 "https://…" 都含斜杠，当成注释切下去会把后面的
   真实代码一起删掉，于是断言永远通过、再也抓不到东西。
   正则字面量（/\.?0+$/）也跳过：里面出现 // 或 /* 的概率极低，
   但一旦出现，误判的方向是「多删」，正是上面那种失效方式。 */
function stripComments(src) {
  let out = "", i = 0, q = "";
  const reStart = /[=(,;:!&|?+\-*%~^<>\[\]{}]/;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (q) {
      out += c;
      if (c === "\\") { out += (d || ""); i += 2; continue; }
      if (c === q) q = "";
      i += 1; continue;
    }
    if (c === '"' || c === "'" || c === "`") { q = c; out += c; i += 1; continue; }
    if (c === "/" && d === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
      i += 2; out += " "; continue;
    }
    if (c === "/" && d === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }
    /* 行首或运算符之后的 / 当成正则字面量，跳到配对的斜杠 */
    if (c === "/") {
      const prev = out.replace(/\s+$/, "").slice(-1);
      if (prev === "" || reStart.test(prev)) {
        i += 1; out += "/";
        let inCls = false;
        while (i < src.length) {
          const x = src[i];
          if (x === "\\") { out += x + (src[i + 1] || ""); i += 2; continue; }
          if (x === "[") inCls = true;
          if (x === "]") inCls = false;
          if (x === "/" && !inCls) { out += "/"; i += 1; break; }
          if (x === "\n") break;
          out += x; i += 1;
        }
        continue;
      }
    }
    out += c; i += 1;
  }
  return out;
}

{
  /* 先验剥注释器本身：把「注释里的数字」剥掉、「代码里的数字」留下。
     不验它的话，剥错方向（多删或没删）会让下面几条断言
     永远通过 —— 那是最坏的一种测试。 */
  const probe = stripComments(
    '/* 假注释 133 */\nvar a = "59,32 / x"; /* 假注释 30 */\nvar b = 12; // 假注释 30\n');
  ok(probe.indexOf("133") < 0 && probe.indexOf("/*") < 0,
    "剥注释器：注释里的数字被剥掉");
  ok(probe.indexOf("59,32") >= 0, "剥注释器：字符串里的内容原样保留");
  ok(/(?<![\d.])12(?![\d.])/.test(probe), "剥注释器：代码里的数字保留");
}

/* 扫哪些文件、扫哪些数字，是分开的 —— 一刀切会误伤：
     gacha.js    引擎，必须与库规模完全无关，五个数字全扫。
     gacha-ui.js 界面，**排除 12**：12 恰好等于配色层条数，
                 同时它也是「12 张」这个界面选项的合法字面量。
                 真正要挡的是「界面把库规模写成常量」，
                 那一件事由行为断言兜得更死（池构成文字必须与
                 GACHA.pool() 逐项一致、每个下拉的选项数必须等于该槽候选数，
                 见 tools/ui_test.js【3d】）—— 比源码 grep 强得多。 */
[["gacha.js", ["59", "32", "30", "12", "133"]],
 ["gacha-ui.js", ["59", "32", "30", "133"]]].forEach(([file, nums]) => {
  const code = stripComments(fs.readFileSync(A(file), "utf8"));
  /* 写死数量的后果不是报错，是「界面说 59 种画风、实际能抽到 71 种」，
     两个数字都来自本库，用户没法判断哪个是对的。 */
  nums.forEach(n => {
    const re = new RegExp("(?<![\\d.])" + n + "(?![\\d.])");
    ok(!re.test(code), file + " 的**代码**里不出现写死的库规模数字 " + n);
  });
});

{
  const src = fs.readFileSync(A("gacha.js"), "utf8");
  ok(src.indexOf("STUDIO") >= 0 && src.indexOf("STEPS") >= 0,
    "槽位来源写在源码里就是 STUDIO.STEPS（库加一步就多一槽）");
  ok(typeof GACHA.register === "function", "对外暴露 register() —— 新维度从这里接进来");
  ok(GACHA.registered().indexOf("__probe") >= 0, "registered() 能列出已注册的额外槽");
  ok(GACHA.SCHEMA >= 1, "池结构带版本号（" + GACHA.SCHEMA + "），结构变更时下游能判断");
}

/* ---------- 12. 组合信息里的名字必须已去标识 ---------- */
head("【10】组合信息用的是去标识后的显示名");
{
  /* 卡片上的「这一组用了库里哪几条」是**摘要**，
     而读它的 Agent 会照着这几行去写提示词正文。
     摘要里露出创作者名，等于亲手把「不许写进正文」这个规则绕过去 ——
     所以这一层必须换成 data-studio-alias.js 里的特征名。

     检索那一侧（网页筛选栏、CLI 的 list）保持原名：
     搜「吉卜力」要能命中，检索性不能丢。这是刻意的分叉，不是漏改。 */
  const ALIAS = require(A("data-studio-alias.js")).STUDIO_LOOKALIAS;
  const byId = {};
  STUDIO.allEntries().forEach(e => { byId[e.id] = e; });

  const need = [];
  GACHA.slots().forEach(sl => {
    sl.entries.forEach(en => {
      const src = byId[en.id];
      if (src && src.cat === "工作室" && ALIAS[en.id] && ALIAS[en.id].look) {
        need.push([sl.label, en, ALIAS[en.id].look, src.zh]);
      }
    });
  });
  ok(need.length > 0, "库里确实有需要去标识的层（" + need.length + " 条工作室条目）");

  const leaked = need.filter(([, en, look]) => en.zh !== look);
  ok(leaked.length === 0, "工作室层的显示名全部换成特征名"
    + (leaked.length ? " → 例如 " + leaked.slice(0, 3)
        .map(([lb, en, look]) => lb + "：" + en.zh + "（应为 " + look + "）").join("；") : ""));

  /* 反向确认：这些名字确实带着创作者标识（不是别名表本身是空的） */
  const stillNamed = need.filter(([, , , raw]) => /[（(]/.test(raw));
  ok(stillNamed.length > 0,
    "原名确实带标识（" + stillNamed.length + " 条形如「某某（创作者）」），"
    + "所以换名这一步是有意义的");

  /* 抽出来的组合里也不能漏 —— 上面查的是池，这里查的是实际产出的行 */
  const r = GACHA.roll({ rnd: () => 0.5 });
  const badRows = r.rows.filter(row => {
    const src = byId[row.id];
    return src && src.cat === "工作室" && ALIAS[row.id] && row.zh !== ALIAS[row.id].look;
  });
  ok(badRows.length === 0, "roll() 产出的每一行也都是去标识后的名字"
    + (badRows.length ? " → " + badRows.map(x => x.zh).join(" / ") : ""));
}

/* ---------- 13. rnd 可注入：抽卡要能复现 ---------- */
head("【11】可复现随机源（seed）");
{
  /* 注入随机源不是为了「可配置」，是为了**可复现**：
     命令行两种数据源布局靠它对齐结果，报问题时靠它复现同一组。
     派生出来的另一个用处是让上面那些断言有确定输入。 */
  const seedRnd = (s) => {
    let a = (Number(s) >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const a1 = GACHA.roll({ rnd: seedRnd(42) }).chain;
  const a2 = GACHA.roll({ rnd: seedRnd(42) }).chain;
  const b1 = GACHA.roll({ rnd: seedRnd(7) }).chain;
  ok(a1 === a2, "同一个 seed 抽到同一组：" + a1);
  ok(a1 !== b1, "不同 seed 抽到不同组（" + a1 + " vs " + b1 + "）");
  /* 不传 rnd 时仍然是真随机（不能因为加了 seed 就把默认值写死） */
  const many = {};
  for (let i = 0; i < 40; i++) many[GACHA.roll({}).chain] = 1;
  ok(Object.keys(many).length > 5,
    "不传 rnd 时仍是真随机（40 次抽出 " + Object.keys(many).length + " 种组合）");
}

/* ---------- 12. 请求层的共用与边界 ---------- */
head("【12】render-net：单张出图与抽卡共用同一份执行器");
{
  ok(typeof RENDER_NET.fetchOnce === "function" && typeof RENDER_NET.fetchRetry === "function",
    "对外提供 fetchOnce / fetchRetry");
  ok(RENDER_NET.RETRY.max >= 2, "重试次数 ≥2（匿名通道约一半请求被拒，不重试就是一半灰卡片）");
  ok(RENDER_NET.RETRY.baseMs >= 1000, "退避基数 ≥1 秒，不是「立刻重试」");
  ok(RENDER_NET.RETRY.timeoutMs >= 20000, "有兜底超时（onload/onerror 都可能都不来）");

  ok(/没有出图 API/.test(RENDER_NET.whyOf("manual")), "manual 通道的说明是「没有 API」而不是「失败」");
  ok(/key/.test(RENDER_NET.whyOf("needkey")), "needkey 的说明指向「去填 key」，是缺输入不是错误");
  ok(RENDER_NET.whyOf("img") === "", "正常通道没有多余的错误说明");

  /* 无 key 选 keyed 模型：必须走「缺输入」这条路，而不是发一个注定 401 的请求 */
  let why = null;
  RENDER_NET.fetchOnce("test prompt", { model: "gpt-image-2" }, () => {}, w => { why = w; });
  ok(why && /key/i.test(why), "选了要 key 的模型但没填 key → 直接告知去填 key，不发请求");

  /* 无 DOM 环境（Node）：不该抛异常，该走 onErr */
  let why2 = null, threw = false;
  try {
    RENDER_NET.fetchOnce("test prompt", { model: "sana" }, () => {}, w => { why2 = w; });
  } catch (e) { threw = true; }
  ok(!threw, "Node 环境（无 Image）下 fetchOnce 不抛异常");
  ok(typeof why2 === "string" && why2.length > 0,
    "取不到图片时通过 onErr 回话而不是静默：" + why2);

  /* 源码约定：key 绝不进 URL */
  const src = fs.readFileSync(A("render-net.js"), "utf8");
  ok(src.indexOf("Authorization") >= 0, "keyed 通道走 Authorization 头");
  ok(!/url\s*\+.*key|key.*\+\s*url/.test(src), "没有把 key 拼进 URL 的写法");
}

/* ---------- 11. 尺寸口语化 ---------- */
head("【13】formatSpace 边界");
{
  ok(GACHA.formatSpace(0) === "0", "0 → 0");
  ok(GACHA.formatSpace(999) === "999", "999 不缩写");
  ok(GACHA.formatSpace(1234) === "1,234", "1234 → 1,234");
  ok(GACHA.formatSpace(56789) === "56,789", "5.6 万这类中间规模给精确值（不四舍五入到「万」）");
  ok(GACHA.formatSpace(679680) === "679,680", "库当前规模 679,680 精确显示");
  ok(/万$/.test(GACHA.formatSpace(1234567)), "123 万以上才缩写成「万」");
  ok(/亿$/.test(GACHA.formatSpace(123456789)), "123456789 → 亿");
  ok(GACHA.formatSpace(undefined) === "0", "undefined 当 0，不抛异常");
  ok(GACHA.formatSpace(NaN) === "0", "NaN 当 0，不抛异常");
}

console.log("\n" + (fail ? "✗ " : "✓ ") + "抽卡体检：" + pass + " 通过 / " + fail + " 失败");
process.exit(fail ? 1 : 0);
