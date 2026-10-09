/* ============================================================
 * tools/check_studio.js —— 出图工作流体检
 * ============================================================
 * 这一层为什么必须单独测，而不是靠 ui_test 顺带看一眼：
 *
 *   工作流的失败方式全是**静默**的。
 *   段前缀写错（slice(0,2) 把 G-01 切成「G-」）→ 题材栏 0 条；
 *   漏 ENGINE.register(LAYOUTS) → 版式栏 0 条；
 *   PROMPT_ZH 在 Node 侧取不到 → 中文正文悄悄回退成英文标签串。
 *   三种都不抛异常，页面照样打开，ui_test 的「点下去有内容」也照样通过。
 *   所以必须对着**数据**逐项断言，不看渲染。
 * ============================================================ */
const fs = require("fs");
const vm = require("vm");
const L = require("./_loadlist.js");
const A = L.A;

let pass = 0, fail = 0;
function ok(cond, msg) { cond ? pass++ : (fail++, console.log("  ✗ " + msg)); }
function head(t) { console.log("\n" + t); }
/* "3:4" → 0.75。只用于断言像素比守恒，不参与任何出图决策。 */
function parseRatio(r) { const p = String(r).split(":"); return parseInt(p[0], 10) / parseInt(p[1], 10); }

/* ---------- 载入 ----------
   顺序与 index.html 一致：数据 → 正文 → 引擎与工具。
   studio.js 依赖 engine / prompt-kit / rights / prompts-zh，
   少一个它就退化成空候选而不报错。 */
const ctx = vm.createContext({ console });
ctx.globalThis = ctx;
L.SANDBOX_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.PROMPT_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.PROMPT_ZH_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.ENGINE_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));

const D = ctx.__d || (function () {
  const names = ["STYLES", "STYLES_MORE", "GENRES", "LAYOUTS", "PALETTES"];
  ctx.__d = {};
  names.forEach(n => {
    ctx.__d[n] = vm.runInContext("(typeof " + n + "!=='undefined'?" + n + ":[])", ctx);
  });
  return ctx.__d;
})();

const ENGINE = require(A("engine.js")).ENGINE;
ENGINE.register(D.STYLES, "styles", "画风流派");
ENGINE.register(D.GENRES, "genres", "题材元素");
ENGINE.register(D.LAYOUTS, "layouts", "排版图型");
ENGINE.register(D.PALETTES, "palettes", "主题配色");

const STUDIO = require(A("studio.js")).STUDIO;
const PROMPT_ZH = require(A("prompts-zh.js")).PROMPT_ZH;
const RENDER = require(A("render.js")).RENDER;

/* ---------- 1. 候选数量 ---------- */
head("【1】四步候选不为空");
const EXPECT = { style: 59, theme: 32, layout: 30, palette: 12 };
const COUNT = {};
Object.keys(EXPECT).forEach(k => {
  const n = STUDIO.candidates(k).length;
  COUNT[k] = n;
  ok(n === EXPECT[k], k + " 候选 " + n + " 条（期望 " + EXPECT[k] + "）");
});
ok(Object.values(COUNT).reduce((a, b) => a + b, 0) === 133,
  "四步合计 " + Object.values(COUNT).reduce((a, b) => a + b, 0) + " 条 = 可直接出图条目 133 条");

/* 段前缀解析：G-01 的段是「G」不是「G-」 */
head("【2】旧 ID 段前缀解析");
[["G-01", "G"], ["A1-01", "A1"], ["A5-14", "A5"], ["LT-01", "LT"], ["PL-01", "PL"],
 ["W-J-001", "W"]].forEach(([id, seg]) => {
  ok(STUDIO.segOf(id) === seg, id + " → 段「" + seg + "」（实得 " + STUDIO.segOf(id) + "）");
});

/* ---------- 3. 空选择时不给「看似完整」的提示词 ---------- */
head("【3】缺步诊断");
STUDIO.reset();
{
  const d = STUDIO.diagnose();
  ok(d.missing.length === 4, "全空时缺 4 步（实得 " + d.missing.length + "）");
  ok(d.grade === "conflict", "全空评级 conflict");
  ok(d.ready === false, "全空时不可出图");
  ok(STUDIO.compose("zh") === "" && STUDIO.compose("en") === "",
    "全空时正文为空串——不给一段看着完整、实际什么都没约束的提示词");
  /* 每条缺失都要说清「缺了会怎样」，不能只标个名 */
  ok(d.missing.every(m => m.why && m.why.length > 15),
    "每条缺失都给出后果说明");
}
STUDIO.pick("style", "A1-01");
{
  const d = STUDIO.diagnose();
  ok(d.missing.length === 3 && d.ready, "选 1 步后可出图，但缺 3 项");
  ok(d.missing.some(m => m.step === "style") === false, "已选项不再报缺失");
  ok(d.missing.every(m => m.step !== "style"), "已选画风不出现在缺失列表");
}
STUDIO.applyPreset(STUDIO.PRESETS[0]);
{
  const d = STUDIO.diagnose();
  ok(d.complete && d.grade === "ok", "四步齐备时 complete 且评级 ok");
  ok(d.missing.length === 0, "齐备时无缺失");
}

/* ---------- 4. 预设引用的 ID 必须真实存在 ---------- */
head("【4】预设引用的条目全部存在");
const ALL = [].concat(D.STYLES, D.GENRES, D.LAYOUTS, D.PALETTES);
const KNOWN = {};
ALL.forEach(e => { KNOWN[e.id] = e; });
STUDIO.PRESETS.forEach((p, i) => {
  const bad = Object.keys(p.s).filter(k => !KNOWN[p.s[k]]);
  ok(bad.length === 0, "预设「" + p.name + "」引用的条目都存在"
    + (bad.length ? " → 缺：" + bad.map(k => p.s[k]).join(", ") : ""));
  ok(Object.keys(p.s).length === 4, "预设「" + p.name + "」四步齐全");
});

/* ---------- 5. 正文两版都要有且真的不同 ---------- */
head("【5】中英正文");
STUDIO.applyPreset(STUDIO.PRESETS[0]);
const zh = STUDIO.compose("zh");
const en = STUDIO.compose("en");
ok(zh.length > 200, "中文正文非空：" + zh.length + " 字符");
ok(en.length > 200, "英文正文非空：" + en.length + " 字符");
ok(zh !== en, "中英两版内容不同");
/* 中文版必须是中文，不能是英文标签串的回落。
   这一条正是 PROMPT_ZH 在 Node 侧取不到时的实际症状：
   get() 返回 undefined → 回退到条目 demo（英文逗号标签），
   于是"中文正文"变成了中英混杂的标签堆，不报任何错。 */
const hanRatio = (zh.match(/[\u4e00-\u9fa5]/g) || []).length / Math.max(1, zh.length);
ok(hanRatio > 0.5, "中文正文汉字占比 " + (hanRatio * 100).toFixed(0) + "%（应 >50%）");
ok(!/[a-z]{4,}\s*,\s*[a-z]{4,}/.test(zh), "中文正文里没有整段英文标签串回落");

/* 版式的 ratio 与配色的 hex 必须真的进了正文——
   它们是提示词的一部分，不是元数据。 */
const lay = STUDIO.entryOf("layout"), pal = STUDIO.entryOf("palette");
ok(lay && en.indexOf(lay.ratio) >= 0, "英文正文含版式画幅 " + (lay && lay.ratio));
ok(zh.indexOf(lay.ratio) >= 0, "中文正文含版式画幅 " + (lay && lay.ratio));
ok(pal && en.indexOf(pal.hex) >= 0, "英文正文含配色主色 " + (pal && pal.hex));
ok(zh.indexOf(pal.hex) >= 0, "中文正文含配色主色 " + (pal && pal.hex));

/* 每种预设都要能出两版正文，不能只有第一个预设能跑 */
let allPresetOk = true;
STUDIO.PRESETS.forEach(p => {
  STUDIO.applyPreset(p);
  const a = STUDIO.compose("zh"), b = STUDIO.compose("en");
  if (!(a.length > 200 && b.length > 200 && a !== b)) {
    allPresetOk = false;
    console.log("    · " + p.name + " → zh " + a.length + " / en " + b.length);
  }
});
ok(allPresetOk, STUDIO.PRESETS.length + " 个预设都能产出中英两版正文");

/* ---------- 6. 标签版与负面词 ---------- */
head("【6】标签速用版与负面词");
STUDIO.applyPreset(STUDIO.PRESETS[0]);
const tags = STUDIO.composeTags();
ok(tags.length > 80, "标签版非空：" + tags.length + " 字符");
{
  const parts = tags.split(", ").map(s => s.trim()).filter(Boolean);
  ok(new Set(parts).size === parts.length, "标签版已去重（" + parts.length + " 项）");
  ok(parts.every(p => p.length > 0), "无空标签项");
  ok(/text-free/.test(tags) && /no watermark/.test(tags),
    "标签版含文字与水印抑制词（MJ/SD 只吃负面词，正文那句不参与）");
  ok(tags.indexOf(pal.hex) >= 0, "标签版含配色主色");
  ok(tags.indexOf(lay.ratio) >= 0, "标签版含画幅");
}
const neg = STUDIO.negatives();
ok(neg.length > 100, "负面词非空：" + neg.length + " 字符");
{
  const K = require(A("prompt-kit.js")).PROMPT_KIT;
  ok(neg === K.buildCard(STUDIO.entryOf("style"), "styles").neg,
    "负面词直接取自 PROMPT_KIT（不另编一套，避免与全库漂移）");
  const parts = neg.split(", ").map(s => s.trim()).filter(Boolean);
  ok(new Set(parts).size === parts.length, "负面词已去重");
  ok(parts.some(p => /^text$/i.test(p)), "负面词含 text");
  ok(parts.some(p => /^watermark$/i.test(p)), "负面词含 watermark");
}
/* 画质档依据：界面要能解释「为什么是这个档」 */
const tier = STUDIO.tierOf();
ok(tier && tier.tier && tier.zh, "画质档可解析：" + (tier ? tier.zh + "（" + tier.hit + "）" : "无"));
ok(tier && tier.note && tier.note.length > 10, "画质档带注意事项说明");

/* ---------- 7. 授权随选择走 ---------- */
head("【7】授权提示随选择走");
{
  STUDIO.reset();
  ok(STUDIO.rightsSummary().length === 0, "未选择时无授权条目");
  ok(STUDIO.rightsFlags().length === 0, "未选择时无待处理档位");

  /* 选一条 R0 技法：应当明确说「可直接商用」 */
  STUDIO.pick("style", "A1-01");
  let rs = STUDIO.rightsSummary();
  ok(rs.length === 1 && rs[0].tier === "R0", "A1-01 判为 R0（实得 " + (rs[0] || {}).tier + "）");
  ok(rs[0] && rs[0].requirement && rs[0].requirement.length > 2,
    "R0 给出商用要求说明：" + (rs[0] ? rs[0].requirement : "无"));

  /* 换一条含受保护标识的条目：必须被 flag 出来。
     工作室层（A3）按名称命名，是最容易踩 R 档的一层。 */
  const a3 = D.STYLES.filter(e => /^A3-/.test(e.id));
  const flagged = [];
  a3.forEach(e => {
    STUDIO.pick("style", e.id);
    const f = STUDIO.rightsFlags();
    if (f.length) flagged.push(e.id + "=" + f[0].tier);
  });
  ok(flagged.length > 0, "工作室层存在需提示的条目：" + flagged.join(", "));
  /* 所有非 R0 都必须带可执行的处理要求，不能只给一个标签 */
  const noReq = [];
  a3.forEach(e => {
    STUDIO.pick("style", e.id);
    STUDIO.rightsFlags().forEach(f => {
      if (!f.requirement || f.requirement.length < 4) noReq.push(f.id);
    });
  });
  ok(noReq.length === 0, "所有非 R0 都带处理要求" + (noReq.length ? " → 缺：" + noReq.join(",") : ""));
}

/* ---------- 8. 取消选择 ---------- */
head("【8】选择与取消");
{
  STUDIO.reset();
  STUDIO.pick("style", "A1-01");
  ok(STUDIO.S.style === "A1-01", "选中生效");
  STUDIO.pick("style", "A1-01");
  ok(STUDIO.S.style === "", "再点同一条取消选择");
  STUDIO.pick("style", "A1-01");
  STUDIO.pick("theme", "G-01");
  STUDIO.reset();
  ok(!STUDIO.S.style && !STUDIO.S.theme && !STUDIO.S.layout && !STUDIO.S.palette, "reset 清空四步");
}

/* ---------- 9. 跨层同名不串 ---------- */
head("【9】四步取值互不串层");
{
  STUDIO.reset();
  STUDIO.applyPreset(STUDIO.PRESETS[0]);
  const st = STUDIO.entryOf("style"), th = STUDIO.entryOf("theme"),
        lo = STUDIO.entryOf("layout"), pa = STUDIO.entryOf("palette");
  ok(/^A[1-5]-/.test(st.id), "画风槽取到 A 段条目：" + st.id);
  ok(/^G-/.test(th.id), "题材槽取到 G 段条目：" + th.id);
  ok(/^LT-/.test(lo.id), "版式槽取到 LT 段条目：" + lo.id);
  ok(/^PL-/.test(pa.id), "配色槽取到 PL 段条目：" + pa.id);
  ok(st.id !== th.id && th.id !== lo.id && lo.id !== pa.id, "四槽条目互不相同");
  ok(STUDIO.textOf("style", "gptZh") !== STUDIO.textOf("theme", "gptZh"),
    "画风与题材正文不同（没有取到同一条）");
}

/* ---------- 10. 覆盖完整性：每个候选都能出两版正文 ---------- */
head("【10】每个候选都能出图");
{
  const noOut = [];
  ["style", "theme", "layout", "palette"].forEach(k => {
    STUDIO.reset();
    STUDIO.candidates(k).forEach(e => {
      STUDIO.pick(k, e.id);
      const d = STUDIO.diagnose();
      if (!d.ready) return;                     /* 单选一层不算完整，不强求 */
      const a = STUDIO.compose("zh"), b = STUDIO.compose("en");
      if (!a || !b) noOut.push(k + ":" + e.id);
    });
  });
  ok(noOut.length === 0, "四层每一条单独选中都能出正文"
    + (noOut.length ? " → 缺：" + noOut.slice(0, 8).join(",") : ""));
}

/* ---------- 11. 中文正文查表：旧 ID 与规范码双向 ---------- */
head("【11】中文正文查表双向可用");
{
  ok(PROMPT_ZH.size() === 133, "中文正文表 " + PROMPT_ZH.size() + " 条（应 133）");
  const byOld = D.STYLES.concat(D.GENRES, D.LAYOUTS, D.PALETTES)
    .filter(e => PROMPT_ZH.get(e.id));
  ok(byOld.length === 133, "按旧 id 可查 " + byOld.length + " / 133");
  /* 规范码反查：此前 injectCodes 从未在页面调用过，
     导致浏览器里按 ST-001 查中文正文永远取不到（按 A1-01 却是好的），
     两条查询路径结果不一致很难被察觉。 */
  const CD = require(A("codes.js")).CODES;
  CD.SEGMENTS.forEach(() => {});
  const badCode = [];
  D.STYLES.forEach(e => {
    const code = CD.derive(e.id);
    if (code && !PROMPT_ZH.get(code)) badCode.push(e.id + "→" + code);
  });
  D.GENRES.forEach(e => {
    const code = CD.derive(e.id);
    if (code && !PROMPT_ZH.get(code)) badCode.push(e.id + "→" + code);
  });
  ok(badCode.length === 0, "按规范码可查（画风+题材 91 条）"
    + (badCode.length ? " → 失败：" + badCode.slice(0, 6).join(", ") : ""));
}

/* ---------- 12. 清单一致性 ---------- */
head("【12】脚本清单与 index.html 一致");
{
  const chk = L.checkAgainstIndex();
  ok(chk.missing.length === 0, "清单中的文件都已进入 index.html"
    + (chk.missing.length ? " → 缺：" + chk.missing.join(", ") : ""));
  ok(chk.extra.length === 0, "index.html 没有未登记的数据文件"
    + (chk.extra.length ? " → 多：" + chk.extra.join(", ") : ""));
  /* studio-ui.js 不在 _loadlist 里（它不进 vm 沙箱，只在页面跑），
     但页面必须加载它，否则工作流视图是空的——单独断一次。 */
  const html = fs.readFileSync(L.ROOT + "/index.html", "utf8");
  ok(html.includes("assets/studio-ui.js"), "index.html 加载了 studio-ui.js");
  ok(html.includes("assets/studio.js"), "index.html 加载了 studio.js");
  ok(/ENGINE\.register\(LAYOUTS/.test(html), "index.html 把 LAYOUTS 注册进引擎");
  ok(/ENGINE\.register\(PALETTES/.test(html), "index.html 把 PALETTES 注册进引擎");
}

/* ---------- 13. 英文正文不许静默退化成标签堆 ----------
   这条是为了钉死一个已经发生过的失效：
   STUDIO 取英文正文时读的是 PROMPT_SETS（靠 push 攒起来的聚合数组），
   而在 Node / vm 沙箱里正文文件被 vm 加载、push 进的是另一个上下文的数组，
   require 回来的 prompt-kit.js 那份始终为空 ——
   于是取不到正文就回退到条目自带的 demo 标签串。

   症状极隐蔽：不报错、不空框、测试全绿，
   只是英文那几段从 400 字正文缩成 60 字标签串，
   而中文侧有 PROMPT_ZH 独立兜底所以照常正常 ——
   「中英不对等」很容易被当成本来就该这样。

   所以断的是「英文正文长度与句子数」，不是「英文非空」。 */
head("【13】英文正文不退化为标签堆");
{
  const P = ctx.PROMPT_EN;
  ok(!!P, "PROMPT_EN 已加载（prompts.js 在清单里）");
  ok(P && P.size() >= 320, "英文正文条目数 ≥320（实测 " + (P ? P.size() : 0) + "）");
  ok(P && P.duplicates().length === 0, "英文正文无重复 ID"
    + (P && P.duplicates().length ? " → 重复：" + P.duplicates().join(", ") : ""));

  /* 逐条比对：英文正文应当是完整段落，不是标签串。
     标签串的特征是「几乎没句号 + 逗号很多」。 */
  let thin = [], tagish = [];
  (P ? P.ids() : []).forEach(id => {
    const t = P.get(id);
    const sents = (t.match(/\./g) || []).length;
    const commas = (t.match(/,/g) || []).length;
    if (t.length < 200) thin.push(id + "(" + t.length + ")");
    if (sents <= 1 && commas >= 4) tagish.push(id);
  });
  ok(thin.length === 0, "没有过短的英文正文"
    + (thin.length ? " → " + thin.slice(0, 6).join(", ") : ""));
  ok(tagish.length === 0, "没有标签串形态的英文正文（句号≤1 且逗号≥4）"
    + (tagish.length ? " → " + tagish.slice(0, 6).join(", ") : ""));

  /* 中英长度比：英文正文通常比中文长（信息密度更高）。
     若英文明显更短，说明取词链路退化了。

     这里断的是 STUDIO 的实际输出，而不是「PROMPT_EN 有没有被注入」——
     STUDIO 的 g() 在 vm 沙箱里会先命中 ctx.PROMPT_SETS（15 批，数据是对的），
     所以即使把 PROMPT_EN 依赖掐断，兜底路径仍能出全文，测不出退化。
     真正的失效模式是「两条路都拿不到」，
     那种情况下英文会静默缩成条目 demo 的标签串 —— 断长度才抓得到。 */
  STUDIO.reset();
  STUDIO.pick("style", "A1-01"); STUDIO.pick("theme", "G-20");
  STUDIO.pick("layout", "LT-01"); STUDIO.pick("palette", "PL-01");
  const en = STUDIO.compose("en"), zh = STUDIO.compose("zh");
  ok(en.length > zh.length, "英文正文不短于中文（实测 EN " + en.length
    + " / ZH " + zh.length + "）——EN 更短说明取词退化成标签串");
  ok(!/^(1girl|1boy)/.test(en.trim()), "英文正文开头不是 Danbooru 标签串");
  /* 逐槽断：题材与画风这两槽的英文正文最长，
     一旦退化成 demo 标签串，长度会掉到 60 字符上下。 */
  ["style", "theme"].forEach(k => {
    const t = STUDIO.textOf(k, "gpt");
    ok(t.length >= 200, k + " 槽英文正文 ≥200 字符（实测 " + t.length + "）");
    ok((t.match(/\./g) || []).length >= 3, k + " 槽英文正文有完整句子（句号 "
      + (t.match(/\./g) || []).length + " 个）");
  });
}

/* ---------- 14. 一键出图通道 ----------
   为什么单独测这一段：
     出图 URL 是**唯一**一处拼进外部地址的地方。
     「URL 里带一条被本地化函数污染的查询参数」这种问题在页面上
     完全看不出来 —— 图照常出来，只是画幅没跟着版式走，
     而用户正是按「我选了 3:4」才去验收的。

   失败方式同样是静默的：比例算错、model 名拼错、
   seed 被 URL 编码掉、提示词里换行没压掉导致请求 414。 */
head("【14】一键出图通道");
{
  /* 14a. 画幅换算：比例必须真的落到像素，而不是照抄 ratio 字符串 */
  const SIZE = [
    ["3:4", "std", 576, 768], ["4:3", "std", 768, 576],
    ["1:1", "std", 768, 768], ["9:16", "std", 432, 768],
    ["16:9", "std", 768, 432],
    ["3:4", "hd", 768, 1024], ["16:9", "hd", 1024, 576]
  ];
  SIZE.forEach(([ratio, tier, w, h]) => {
    const s = RENDER.sizeOf(ratio, tier);
    ok(s.w === w && s.h === h,
      ratio + " @ " + tier + " → " + s.w + "×" + s.h + "（期望 " + w + "×" + h + "）");
    /* 比例必须守恒：拿到 3:4 却算出接近方图，等于没换算 */
    ok(Math.abs(s.w / s.h - parseRatio(ratio)) < 0.02,
      ratio + " 实际像素比 " + (s.w / s.h).toFixed(3) + " 守恒");
    ok(s.w % 2 === 0 && s.h % 2 === 0, ratio + " 尺寸取偶数（奇数边长会被后端改写）");
  });

  /* 14b. 未选版式时必须回退 1:1 并**自报**，不能静默套一个尺寸 */
  const fb = RENDER.sizeOf("", "std");
  ok(fb.known === false, "未选版式时 known=false（界面据此显示「按 1:1」）");
  ok(fb.w === fb.h, "未选版式回退正方：" + fb.w + "×" + fb.h);
  ok(RENDER.sizeOf("21:9", "std").known === false, "库外的比例也走回退，不产生离谱尺寸");

  /* 14c. model 白名单：URL 是要发到外部的，不能接受任意字符串 */
  ok(RENDER.modelOf("flux") === "flux", "白名单内的 model 原样返回");
  ok(RENDER.modelOf("'; DROP TABLE") === "gpt-image-2", "非法 model 回落默认（默认即 gpt-image-2）");
  ok(RENDER.modelOf(undefined) === "gpt-image-2", "未给 model 也回落默认");
  ok(RENDER.modelOf("flux") === RENDER.modelById("flux").key,
    "modelOf 与 modelById 一致（两处各写一份必然漂）");

  /* 14c-2. 四个指定模型必须在清单里，且通道标注正确。
     用户点名要这四个，少一个就是交付缺口。 */
  ["gpt-image-2", "nano-banana", "mj", "flux"].forEach(k => {
    const m = RENDER.modelById(k);
    ok(!!m, "模型在清单里：" + k);
    if (m) ok(!!RENDER.CHANNELS[m.channel], k + " 的通道已定义：" + m.channel);
  });
  ok(RENDER.modelById("gpt-image-2").remote === "openai/gpt-image-2",
    "gpt-image-2 送出的 remote 名与官方 models 清单一致");
  ok(/flux/.test(RENDER.modelById("flux").remote), "flux 的 remote 名里带 flux");
  /* remote 名必须来自官方清单（带 publisher 前缀），
     写一个清单里没有的名字不会报错，只会静默回落或 4xx。 */
  ok(RENDER.modelById("gpt-image-2").remote.indexOf("/") > 0
     && RENDER.modelById("flux").remote.indexOf("/") > 0,
    "remote 用「发布方/模型名」的完整形式，不写裸名");
  /* MJ 必须标 manual：没有公开 API，给它 img 通道就是骗用户 */
  ok(RENDER.modelById("mj").channel === "manual", "Midjourney 标为 manual（真的没有出图 API）");
  ok(RENDER.CHANNELS.manual.method === "COPY", "manual 通道的方法是 COPY，不给 img");
  ok(!!RENDER.modelById("nano-banana").notice, "Nano Banana 带风险提示（付费/故障）");

  /* 默认值必须与用户要求一致 */
  ok(RENDER.DEFAULT_MODEL === "gpt-image-2", "默认模型是 gpt-image-2");
  ok(RENDER.DEFAULT_RATIO === "1:1", "默认出图比例是 1:1");

  /* 14d. URL 结构：提示词完整编码，参数齐全。
     注意 model 用 sana（anon 通道）而不是 flux ——
     flux 现在是 keyed 通道，它的请求是 JSON 而不是 GET URL。 */
  const u = RENDER.urlOf("a red apple,  no text\n\n studio light ", {
    ratio: "3:4", tier: "std", model: "sana", seed: 42
  });
  ok(u.url.indexOf("https://image.pollinations.ai/prompt/") === 0, "指向匿名通道");
  ok(u.url.indexOf("width=576") >= 0 && u.url.indexOf("height=768") >= 0,
    "尺寸参数与 ratio=3:4 一致");
  ok(u.url.indexOf("model=sana") >= 0, "model 参数存在");
  ok(u.url.indexOf("seed=42") >= 0, "固定 seed 可复现");
  ok(u.url.indexOf("nologo=true") >= 0, "带 nologo（但界面仍须声明水印去不掉）");
  ok(u.url.indexOf("%2C") >= 0 && u.url.indexOf(",") < 0, "提示词里的逗号已编码");
  ok(u.url.indexOf("%0A") < 0, "换行已压掉（不清掉会让 URL 超长被拒）");
  ok(u.url.indexOf("no%20text%20%20%20") < 0 && /no%20text/.test(u.url),
    "连续空格已压成单空格");
  /* 未给 seed 时必须生成一个，不能留 seed=undefined */
  const u2 = RENDER.urlOf("test", { ratio: "1:1", model: "sana" });
  ok(/seed=\d{1,6}$/.test(u2.url), "未给 seed 时自动随机：" + u2.url.slice(-12));
  ok(RENDER.randSeed() !== RENDER.randSeed() || true, "randSeed 可调用（不要求两次不同）");

  /* 14d-2. 出图比例：五个预设 + 自定义。默认 1:1。 */
  ok(JSON.stringify(RENDER.RATIOS) === JSON.stringify(["1:1", "9:16", "16:9", "3:4", "4:3"]),
    "比例清单就是用户指定的五个，顺序不差：" + RENDER.RATIOS.join(" "));
  RENDER.RATIOS.forEach(r => {
    const s = RENDER.pxOf(r, "std");
    ok(s.known === true, r + " 被承认为合法比例");
    ok(Math.abs(s.w / s.h - parseRatio(r)) < 0.02, r + " 像素比守恒（" + s.w + "×" + s.h + "）");
  });
  ok(RENDER.pxOf("1:1", "std").w === 768 && RENDER.pxOf("1:1", "std").h === 768,
    "默认 1:1 → 768×768");

  /* 自定义尺寸：合法、越界、格式错，三种都要有话说 */
  const cs = RENDER.parseSize("1024x1536");
  ok(cs.ok === true && cs.w === 1024 && cs.h === 1536, "自定义 1024x1536 原样通过");
  ok(RENDER.parseSize("1024×1536").ok === true, "中文乘号 × 也认");
  ok(RENDER.parseSize(" 1024 X 1536 ").ok === true, "空格与大写 X 也认");
  ok(RENDER.parseSize("1000x1500").w % 2 === 0 && RENDER.parseSize("1000x1500").h % 2 === 0,
    "奇数边长被抬成偶数（后端会静默改写奇数尺寸）");
  ok(RENDER.parseSize("100x100").ok === false && !!RENDER.parseSize("100x100").why,
    "小于下限要报错并说清原因，不能静默套一个尺寸");
  ok(RENDER.parseSize("4096x4096").ok === false, "大于上限拒绝");
  ok(RENDER.parseSize("abc").ok === false, "格式错拒绝");
  ok(RENDER.parseSize("").ok === false, "空值拒绝");
  ok(RENDER.pxOf("100x100", "std").known === false && !!RENDER.pxOf("100x100", "std").why,
    "pxOf 对非法自定义保留 why，界面据此显示红框");
  /* 自定义不设防时必须回到 1:1 并自报，不能默默出一个方图 */
  const noc = RENDER.pxOf("", "std");
  ok(noc.known === false && noc.w === noc.h, "自定义留空回退正方");

  /* 14d-3. keyed 通道的请求：key 必须进 header，不能进 URL */
  const rk = RENDER.reqOf("a red apple", { ratio: "3:4", model: "gpt-image-2", key: "SECRET123" });
  ok(rk.kind === "json", "gpt-image-2（有 key）走 JSON 通道");
  ok(rk.headers.Authorization === "Bearer SECRET123", "key 进 Authorization 头");
  ok(rk.url.indexOf("SECRET123") < 0, "key 不出现在 URL 里（历史/截图/Referer 会泄露）");
  ok(JSON.stringify(rk.body).indexOf("SECRET123") < 0, "key 不出现在请求体里");
  ok(rk.body.model === "openai/gpt-image-2", "请求体用官方 remote 名");
  ok(rk.body.width === 576 && rk.body.height === 768, "请求体尺寸跟着比例走");
  ok(rk.body.prompt.indexOf("\n") < 0, "请求体里的提示词已压成单行");
  const nokey = RENDER.reqOf("x", { model: "gpt-image-2" });
  ok(nokey.kind === "needkey", "keyed 通道缺 key 时 kind=needkey，界面据此说明而不是发一个空请求");
  const rj = RENDER.reqOf("x", { model: "mj" });
  ok(rj.kind === "manual", "MJ 的 kind=manual，不给 img 也不给 json");
  const ra = RENDER.reqOf("x", { model: "sana", seed: 7 });
  ok(ra.kind === "img" && /image\.pollinations\.ai/.test(ra.url), "Sana 走匿名 img 通道");
  ok(RENDER.reqOf("x", { model: "不存在的模型" }).kind !== undefined, "未知模型不抛错，回落默认");

  /* 14d-4. 抽卡间隔：这是「别撞得太密」的下限，不是「保证成功」的保证。
     免key 通道实测 3/15/25/35/60 秒间隔都出现过 402（见 render.js 文件头），
     成功率与间隔基本无关 —— 界面因此不能写「约 15 秒 1 张」，
     抽卡也必须靠重试而不是靠拉长间隔。 */
  ok(RENDER.gapMs("sana") >= 15000, "匿名通道抽卡间隔 ≥15 秒（别撞得太密）");
  ok(RENDER.gapMs("gpt-image-2") > 0 && RENDER.gapMs("gpt-image-2") < 15000,
    "keyed 通道间隔更短（不至于让抽卡卡到没法用）");
  ok(RENDER.gapMs("mj") === 0, "manual 通道无间隔（不发请求）");
  ok(/一半/.test(RENDER.CHANNELS.anon.tip) && !/15 秒 1 张/.test(RENDER.CHANNELS.anon.tip),
    "匿名通道的说明写「约一半被限流」而不是照抄文档的「15 秒 1 张」");
  ok(!/限流约 15 秒 1 张|15 秒 1 张/.test(RENDER.MODELS.map(m => m.tip).join(" ")),
    "模型 tip 里不出现「15 秒 1 张」（实测不成立）");

  /* 14e. 出图用的必须是英文正文。
     中文正文是给 GPT-Image 改字用的，这两路通道吃中文明显更差；
     这里断的是「送进通道的文本语言」，不是 URL 通不通。 */
  STUDIO.reset();
  STUDIO.pick("style", "A1-01"); STUDIO.pick("theme", "G-20");
  STUDIO.pick("layout", "LT-01"); STUDIO.pick("palette", "PL-01");
  const en = STUDIO.compose("en"), zh = STUDIO.compose("zh");
  const han = (zh.match(/[\u4e00-\u9fa5]/g) || []).length;
  ok(han > 20, "中文正文确实是中文（" + han + " 字）");
  const uEn = RENDER.urlOf(en, { ratio: "3:4", model: "sana", seed: 1 });
  const decoded = decodeURIComponent(uEn.url);
  /* 断的是「四步拼装的英文正文整段进了 URL」，
     不是某一句技法词的措辞——措辞属于创作层，改数据就会漂。
     这里用「画法段标记 + 完整长度」两头夹住：
     少了任一头都说明 URL 里被截断或退化成片段。 */
  ok(/Rendering approach:/.test(en) && decoded.indexOf("Rendering approach:") >= 0,
    "通道里带的是四步拼装后的英文正文（含画法段）");
  ok(decoded.length >= en.trim().length,
    "URL 里解出来的文本长度不短于正文（" + decoded.length
    + " ≥ " + en.trim().length + "）——没被截断");
  ok(!/[\u4e00-\u9fa5]/.test(decoded),
    "通道 URL 里不含中文——界面里写的是「送英文正文」");
  /* 画幅必须与请求一致：请求 3:4，URL 就必须是 3:4 的像素 */
  const uLay = RENDER.urlOf(en, { ratio: "3:4", model: "sana", seed: 1 });
  const sz = RENDER.sizeOf("3:4", "std");
  ok(uLay.url.indexOf("width=" + sz.w) >= 0 && uLay.url.indexOf("height=" + sz.h) >= 0,
    "URL 尺寸跟随出图比例 3:4 → " + sz.w + "×" + sz.h);

  /* 14e-2. 出图比例必须同时改写正文里的画幅句。
     只改请求不改正文 = 模型收到两套互相矛盾的指令
     （正文说 3:4、请求发 16:9），出哪一张不由用户决定。 */
  const layRatio = STUDIO.entryOf("layout").ratio;
  ok(/Aspect ratio/.test(STUDIO.compose("en")), "默认正文带画幅句（来自版式）");
  ok(new RegExp("Aspect ratio " + layRatio.replace(":", ":")).test(STUDIO.compose("en")),
    "默认画幅句用的是版式的 " + layRatio);
  const over = STUDIO.compose("en", "16:9");
  ok(/Aspect ratio 16:9/.test(over), "传 ratioOverride 时正文画幅句被改写成 16:9");
  ok(over.indexOf("Aspect ratio " + layRatio + ".") < 0,
    "改写后正文里不再残留版式原来的画幅（" + layRatio + "）——两句并存等于没改");
  /* 正文与请求必须说的是同一件事。
     断 URL 里的画幅句要按编码后的形态断：
     "Aspect ratio 9:16" 编码后是 "Aspect%20ratio%209%3A16"，
     直接拿原文正则去匹 URL 会永远失败——
     而这条断言恰恰是为了防「改了正文没改请求」这种漂移，不能自己先写错。 */
  const reqOv = RENDER.reqOf(STUDIO.compose("en", "9:16"), { ratio: "9:16", model: "sana", seed: 3 });
  ok(reqOv.h > reqOv.w, "选 9:16 时请求是竖构图（" + reqOv.w + "×" + reqOv.h + "）");
  ok(/Aspect%20ratio%209%3A16/.test(reqOv.url),
    "选 9:16 时正文里的画幅句也是 9:16（请求与正文说的是同一件事）");
  ok(reqOv.w === 432 && reqOv.h === 768,
    "9:16 的像素与比例表一致：" + reqOv.w + "×" + reqOv.h);

  /* 14e-3. 随机组合（抽卡）已经独立成 assets/gacha.js。
     这里**不再**验一遍抽卡逻辑（见 tools/check_gacha.js，100+ 项），
     只留一条「没留下第二份实现」的断言：
     studio.js 里再长出一套 rollOne/rollIds 的话，
     两边的随机策略、去重、锁定迟早各走各的，而两处看起来都对。 */
  ok(typeof STUDIO.rollOne === "undefined" && typeof STUDIO.rollIds === "undefined",
    "studio.js 里没有第二套随机组合实现（抽卡只在 gacha.js 里）");

  /* composeWith 同样不能污染 S */
  const keep = JSON.stringify(STUDIO.S);
  const cw = STUDIO.composeWith({ style: "A1-02", theme: "G-13" }, "en", "4:3");
  ok(cw.length > 50 && /Aspect ratio 4:3/.test(cw), "composeWith 能按指定组合出正文");
  ok(JSON.stringify(STUDIO.S) === keep, "composeWith 用完还原 S");

  /* 14f. 四步齐备时不得出图失败：正文非空 → URL 非空 */
  ok(en.trim().length > 100, "英文正文非空（" + en.trim().length + " 字符）");
  ok(uEn.url.length > 200 && uEn.url.length < 4000,
    "URL 长度在可用范围内（" + uEn.url.length + " 字符）");

  /* 14g. 缺步时也能拿到 URL（由界面拦下），但空正文拼出来的 URL
     不该被当成有效出图 —— 界面判据是 partsReady，不是 URL 长度。 */
  STUDIO.reset();
  ok(STUDIO.partsReady().count === 0, "全空时 0 步，界面据此禁用按钮");
}

/* ---------- 15. 适配层与 studio.js 的接口约定 ---------- */
head("【15】按模型改写层与 studio.js 的接口约定");
{
  /* 这一层是本轮新加的，最大的风险不是它算错，
     而是**它与 studio.js 的接口悄悄错开**：
     少一个方法 → 取不到料 → 静默退回通用正文，
     而用户看到的是「优化版和默认版一样」。

     具体的适配逻辑由 tools/check_model_prompts.js 断（130 项），
     这里只断**两边接缝处**的约定。 */
  ok(typeof STUDIO.styleCraft === "function",
    "studio.js 导出 styleCraft()（适配层要画风的技法描述，不能自己重写）");
  ok(typeof STUDIO.textOf === "function" && typeof STUDIO.demoOf === "function",
    "studio.js 导出 textOf() / demoOf()");
  ok(typeof STUDIO.tagsOf === "function" && typeof STUDIO.composeTags === "function",
    "studio.js 导出 tagsOf() / composeTags()（MJ 版的取材源）");

  const MP = require(A("model-prompts.js")).MODEL_PROMPTS;
  ok(typeof MP.of === "function" && typeof MP.all === "function" && typeof MP.base === "function",
    "适配层暴露 of() / all() / base()");
  ok(MP.keys().length === RENDER.MODELS.length,
    "适配层覆盖全部 " + RENDER.MODELS.length + " 个出图模型");

  /* 最重要的一条：**出图发出去的提示词必须与模型卡上显示的一致。**
     两者分叉时，用户照着卡片调半天，出来的图跟那一版没关系，
     而界面上完全看不出异常。
     网页端由 supPrompt() 走 MODEL_PROMPTS，命令行由 modelPromptOf()，
     这里验的是「同一组四步 + 同一模型，两条路给出同一段」。 */
  STUDIO.reset();
  STUDIO.STEPS.forEach(s => {
    const c = STUDIO.candidates(s.key)[0];
    STUDIO.pick(s.key, c.id);
  });
  const ids = {};
  STUDIO.STEPS.forEach(s => { ids[s.key] = STUDIO.S[s.key]; });
  RENDER.MODELS.forEach(m => {
    const o = MP.of(m.key, { lang: "en", ratio: "16:9" });
    const viaCompose = STUDIO.composeWith(ids, "en", "16:9");
    ok(!!o && !!o.text, m.zh + " 能取到优化词");
    /* 非 MJ 的四家里，正文主干应与通用正文同源（题材/版式/画法/配色），
       差别只在写法层。这里断的是「优化版不是凭空另写的」——
       完全无关的内容会让用户以为拼错组合了。 */
    if (m.key !== "mj" && o && o.text) {
      const genericHead = viaCompose.slice(0, 40).trim();
      ok(o.text.indexOf(genericHead) >= 0,
        m.zh + " 的优化版与通用正文同源（题材段一致）");
    }
  });
  /* MJ 那一项反例：它必须与通用正文完全不同（标签 vs 正文） */
  const mj = MP.of("mj", { lang: "en", ratio: "16:9" });
  ok(mj && mj.text !== STUDIO.composeWith(ids, "en", "16:9"),
    "MJ 的标签版与通用正文是两回事（一个是标签，一个是正文）");
  ok(mj && /--ar 16:9/.test(mj.params), "MJ 的 --ar 跟着出图比例走");
}

console.log("\n全绿：" + pass + " 通过 / " + fail + " 失败");
process.exit(fail ? 1 : 0);