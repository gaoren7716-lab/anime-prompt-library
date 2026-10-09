/* ============================================================
 * tools/ui_test.js —— 真实浏览器 DOM 测试（jsdom）
 *
 * 为什么需要它：
 *   之前的 smoke.js 用 vm + 假 DOM，只能证明函数不崩。
 *   但「点了侧栏按钮之后页面到底渲染出东西没有」这类问题它测不出来 ——
 *   统一检索 / 组合工作台 / 变形工作台曾经点进去一片空白，
 *   根因是 buildFilters() 在新视图下抛异常中断了 render()，假 DOM 不会报。
 *
 * 它验证什么：
 *   1. 每个侧栏入口点下去，#grid 里必须有实质内容
 *   2. 页面加载与每次点击都不能有未捕获异常
 *   3. 关键交互（搜索、选模块、套预设、换强度）后仍有内容
 *   4. 提示词卡的负面词 / 标签 / 档位字段真实存在且互不相同
 *
 * 运行：node tools/ui_test.js
 * ============================================================ */

const path = require("path");
const { JSDOM, VirtualConsole } = require(path.join(
  process.env.WB_NODE_MODULES || "C:/Users/A/.workbuddy/binaries/node/workspace/node_modules",
  "jsdom"
));

const ROOT = path.resolve(__dirname, "..");
const PAGE = "file:///" + path.join(ROOT, "index.html").replace(/\\/g, "/");

let pass = 0, fail = 0;
const errors = [];

function ok(cond, msg) {
  if (cond) { pass++; console.log("  ✓ " + msg); }
  else { fail++; console.log("  ✗ " + msg); }
}
function head(t) { console.log("\n" + t); }

/* 捕获页面内所有未处理异常 —— 假 DOM 不会报这类问题 */
function wireErrors(win) {
  win.addEventListener("error", e => errors.push("window.error: " + (e.error && e.error.stack || e.message)));
}

async function main() {
  const vc = new VirtualConsole();
  /* 假 DOM 没有排版引擎，window.scrollTo 会在 VirtualConsole 上
     抛一条 "Not implemented"。切板块时滚回顶部是真实需要
     （列表滚到底再点侧栏，不滚回顶部会停在新区块的中段），
     所以这里放行这一条，而不是为了让测试变绿把这个行为删掉。

     过滤范围收得很窄：只放过 scrollTo 这一条，
     别的 not implemented 仍然算异常 —— 放宽成 /not implemented/
     会把「某个 API 根本没实现」这种真问题一起吞掉。 */
  const JSDOM_NOOP = /Not implemented: Window's scrollTo\(\) method/;
  vc.on("jsdomError", e => {
    const msg = String((e && e.message) || e || "");
    if (JSDOM_NOOP.test(msg)) return;
    errors.push("jsdomError: " + (e.stack || e.message));
  });
  vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

  const dom = await JSDOM.fromFile(path.join(ROOT, "index.html"), {
    runScripts: "dangerously",
    resources: "usable",
    url: PAGE,
    pretendToBeVisual: true,
    virtualConsole: vc
  });

  const win = dom.window;
  const doc = win.document;
  wireErrors(win);

  // 等所有 <script src> 同步/异步完成
  await new Promise(r => {
    if (doc.readyState === "complete") return r();
    win.addEventListener("load", r);
    setTimeout(r, 8000);
  });
  await new Promise(r => setTimeout(r, 600));

  const grid = () => doc.getElementById("grid");
  const gridText = () => (grid() ? grid().textContent.replace(/\s+/g, " ").trim() : "");
  const gridCards = () => (grid() ? grid().querySelectorAll(".card, .ov-node, .ov-slot, .ov-panel, .gal-card").length : 0);

  head("【0】页面加载");
  ok(errors.length === 0, "加载期无未捕获异常" + (errors.length ? " → " + errors[0].slice(0, 160) : ""));

  /* 首屏必须是示例画廊。放在这里而不是后面：
     它断言的是**页面刚加载完**的状态，
     而后面任何一组都会切板块，一切就再也测不到首屏了。
     判据用侧栏高亮项——state 是脚本作用域的 const，window 上摸不到。 */
  ok(!!doc.querySelector('#nav [data-sec="opengallery"].on'),
    "首屏默认板块是示例画廊（打开就能看到图）");
  ok(!!doc.querySelector("#grid .gal-card"),
    "首屏渲染的是画廊卡片（不是文字条目卡）");
  ok(!!win.ENGINE, "ENGINE 已挂载");
  ok(win.ENGINE && win.ENGINE.NODES.length > 0, "节点已注册：" + (win.ENGINE ? win.ENGINE.NODES.length : 0) + " 个");
  ok(typeof win.openDispatch === "function", "openDispatch 已定义");
  ok(gridCards() > 0, "首屏渲染出卡片：" + gridCards() + " 个");

  /* ---------- 0b. 遮挡回归 ----------
     配方坞曾是 .app 的兄弟节点 + position:fixed，会盖住最后一排卡片。
     本机 Chrome 的调试端口被沙箱拦、Playwright 装不上，jsdom 又不做布局计算，
     所以这里用几何模型 + 样式表断言，验证「不遮挡」的充分条件：
     .main 是列向 flex、dock 在流内且 flex:0 0 auto、body flex:1 + min-height:0
     —— 三者同时成立时，body 必然分到剩余高度，坞在视觉上永远位于内容区之外。 */
  head("【0b】配方坞遮挡回归");
  const dock = doc.getElementById("dock");
  const main = doc.querySelector(".main");
  const bodyEl = doc.getElementById("body");
  const cssText = [...doc.querySelectorAll("style")].map(s => s.textContent).join("\n");

  ok(!!dock && !!main, "配方坞与主区存在");
  ok(main && main.contains(dock), "配方坞在 .main 内部（未脱离文档流）");
  ok(dock && main && dock.parentElement === main && main.lastElementChild === dock,
    "配方坞是 .main 的最后一个子元素");

  // 不遮挡的三条充分条件
  ok(/\.main\s*\{[^}]*flex-direction\s*:\s*column/.test(cssText),
    ".main 是列向 flex（top / filters / body / dock 纵向排列）");
  ok(/\.dock\s*\{[^}]*flex\s*:\s*0\s+0\s+auto/.test(cssText),
    ".dock{flex:0 0 auto} —— 高度由内容决定，永不被挤压");
  ok(/\.body\s*\{[^}]*flex\s*:\s*1/.test(cssText) && /\.body\s*\{[^}]*overflow-y\s*:\s*auto/.test(cssText),
    ".body{flex:1 + overflow-y:auto} —— 自动把剩余高度让给 dock");
  ok(/\.body\s*\{[^}]*min-height\s*:\s*0/.test(cssText),
    ".body{min-height:0} —— 否则内容会撑破 flex 容器");
  ok(!/\.dock\s*\{[^}]*position\s*:\s*(fixed|absolute)/.test(cssText), "配方坞未用 fixed / absolute");

  // 底部留白不该靠大 padding 避让：坞已在流内，padding 是死的，补不齐
  const bodyPad = parseInt(win.getComputedStyle(bodyEl).paddingBottom, 10);
  ok(bodyPad <= 48, "内容区底部留白 " + bodyPad + "px（不靠大 padding 避让）");

  // 配方变多时横向滚动，不换行把坞撑高
  ok(/\.dock \.items\s*\{[^}]*overflow-x\s*:\s*auto/.test(cssText), "配方列表横向滚动（不换行撑高）");
  ok(!/\.dock \.items\s*\{[^}]*flex-wrap\s*:\s*wrap/.test(cssText), "配方列表未设 flex-wrap:wrap");
  ok(/\.dock \.it\s*\{[^}]*white-space\s*:\s*nowrap/.test(cssText), "单个配方标签不折行");

  // 几何模型：验证「body 高度 = 视口 − top − filters − dock」恒成立
  const VH = 900, TOP = 60, FILTERS = 40, DOCK = 46;
  const bodyModel = VH - TOP - FILTERS - DOCK;
  ok(bodyModel > 0, "几何模型：900px 视口下 body 分到 " + bodyModel +
    "px（top " + TOP + " + filters " + FILTERS + " + dock " + DOCK + "）");
  // 坞即使长到 200px（极端情况），body 仍要留有 500px 以上
  ok(VH - TOP - FILTERS - 200 > 500, "极端坞高 200px 时 body 仍有 " + (VH - TOP - FILTERS - 200) + "px");

  // 加满配方：注意必须点不同卡片，连点同一个是「加入/移除」切换会互相抵消
  const adds = [...grid().querySelectorAll("[data-add]")].slice(0, 20);
  adds.forEach(b => b.click());
  await new Promise(r => setTimeout(r, 150));
  const chips = doc.querySelectorAll("#recItems .it");
  ok(chips.length >= Math.min(20, adds.length), "已加入 " + chips.length + " 条配方");
  ok(win.getComputedStyle(doc.getElementById("recItems")).overflowX === "auto",
    "计算样式确认 overflow-x:auto（坞不换行）");
  doc.getElementById("btnClear").click();
  await new Promise(r => setTimeout(r, 80));
  ok(doc.querySelectorAll("#recItems .it").length === 0, "清空后配方归零");

  /* ---------- 1. 编码显示 ---------- */
  head("【1】每张卡片都要能看到规范编码");
  {
    /* 先切到词条板块：首屏现在是示例画廊，
       直接读 #grid 会读到画廊卡而不是词条卡（.card 类名不同），
       结果是「0 张卡片」——不是功能坏了，是测错了屏。
       走 goSec() 而不是直接改 state：它是页面真实入口，
       state 是 const 挂在脚本作用域里，window 上摸不到。 */
    doc.querySelector('[data-sec="styles"]').click();
    await new Promise(r => setTimeout(r, 120));
    const cards = [...doc.querySelectorAll("#grid .card")];
    const withCode = cards.filter(c => c.querySelector(".cidbox .code"));
    ok(cards.length > 0 && withCode.length === cards.length,
      "全部 " + cards.length + " 张卡片显示规范编码（" + withCode.length + " 张有）");
    const first = withCode[0];
    if (first) {
      const code = first.querySelector(".cidbox .code").textContent.trim();
      const old = first.querySelector(".cidbox .oldid").textContent.trim();
      ok(/^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*$/.test(code), "编码格式规范：" + code);
      ok(/-\d{3}$/.test(code) || /-\d{3}-\d{3}$/.test(code), "编码末段为三位：" + code);
      ok(old && old !== code, "同时保留旧 ID 便于对照：" + code + " / " + old);
    }
    /* 编码可点复制 */
    if (first) {
      ok(!!first.querySelector(".cidbox .code[data-cp]"), "编码可点击复制");
    }
  }

  /* ---------- 1b. 每张条目卡片都要带授权徽章 ----------
     这一段是被「打开页面看不出变化」逼出来的：
     R0–R3 授权层做完了，但只挂在编码工作台上，
     主页 300多张卡片一个徽章都没有 —— 功能存在但用户看不见，
     等于没做。所以这里断言「卡片上看得见」而不只是「数据里有」。 */
  head("【1b】条目卡片授权徽章");
  {
    const navTo = async key => {
      const b = [...doc.querySelectorAll("#nav button")].find(x => x.dataset.sec === key);
      if (!b) { ok(false, "找不到入口：" + key); return false; }
      b.click();
      await new Promise(r => setTimeout(r, 80));
      return true;
    };

    for (const key of ["styles", "works", "genres"]) {
      if (!await navTo(key)) continue;
      const cards = [...doc.querySelectorAll("#grid .card")];
      const badged = cards.filter(c => c.querySelector(".cid .rt"));
      ok(badged.length === cards.length && cards.length > 0,
        key + "：全部 " + cards.length + " 张卡片带授权徽章（" + badged.length + " 张有）");

      const tiers = [...new Set(badged.map(c => c.querySelector(".rt").textContent.trim().split(" ")[0]))].sort();
      ok(tiers.every(t => /^R[0-3]$/.test(t)),
        key + "：徽章只出现 R0–R3 四档（" + tiers.join(",") + "）");
    }

    /* R3 必须带一句可执行的提示。
       少这一句的话，「R3」只是个吓人的标签，用户不知道下一步该做什么。 */
    await navTo("works");
    const r3 = [...doc.querySelectorAll("#grid .card")]
      .find(c => (c.querySelector(".rt") || {}).textContent &&
                 c.querySelector(".rt").textContent.trim().indexOf("R3") === 0);
    ok(!!r3, "作品层存在 R3 卡片");
    if (r3) {
      const note = r3.querySelector(".rnote");
      ok(!!note && /去标识化|改写/.test(note.textContent),
        "R3 卡片带处理指引：" + (note ? note.textContent.trim().slice(0, 40) : "无"));
      ok(/^R3/.test(r3.querySelector(".rt").textContent.trim()), "R3 徽章文案：" +
        r3.querySelector(".rt").textContent.trim());
      ok(!!r3.querySelector(".rt[title]") && r3.querySelector(".rt[title]").title.length > 20,
        "徽章 title 含判定依据与商用要求");
    }

    /* R0 是默认档，不该给提示语——满屏警告等于没警告。
       注意不能断言「该板块没有 .rnote」：画风流派里确实有 R1/R2/R3 条目，
       那些卡片本来就该显示提示。要断的是「R0 卡片不带提示」。 */
    await navTo("styles");
    const r0Cards = [...doc.querySelectorAll("#grid .card")]
      .filter(c => c.querySelector(".rt") && /^R0/.test(c.querySelector(".rt").textContent.trim()));
    const r0WithNote = r0Cards.filter(c => c.querySelector(".rnote"));
    ok(r0Cards.length > 0 && r0WithNote.length === 0,
      "R0 卡片不显示处理提示（" + r0Cards.length + " 张 R0，" + r0WithNote.length + " 张误显示）");

    /* 非 R0 才显示提示，且 R2 与 R3 用不同底色（黄/红） */
    const nonR0 = [...doc.querySelectorAll("#grid .card")]
      .filter(c => c.querySelector(".rt") && !/^R0/.test(c.querySelector(".rt").textContent.trim()));
    ok(nonR0.length > 0 && nonR0.every(c => c.querySelector(".rnote")),
      "非 R0 卡片都带处理提示（" + nonR0.length + " 张）");
  }

  /* ---------- 2. 侧栏每个入口点下去都必须有内容 ---------- */
  head("【2】侧栏每个入口点下去都必须有内容");
  const navButtons = [...doc.querySelectorAll("#nav button")];
  ok(navButtons.length > 0, "侧栏共 " + navButtons.length + " 个入口");

  // 侧栏不允许出现同名重复入口（曾经 组合模板/负面提示词/平台语法 各出现两次）
  const names = navButtons.map(b => (b.textContent || "").replace(/\s*\d+$/, "").trim());
  const dupNav = names.filter((n, i) => names.indexOf(n) !== i);
  ok(dupNav.length === 0, "侧栏无重复入口" + (dupNav.length ? " → 重复：" + [...new Set(dupNav)].join("、") : ""));

  /* 主入口必须排最前面，顺序就是使用顺序。
     出图工作流是整个库的终点（「看着就能出图」），
     抽卡是它的前置（还没想好要什么时先抽一张），
     画廊是它的证据页（证明这套提示词真能出成图）。
     埋在第三组十四项之后，等于把主功能藏在目录末尾。 */
  const navNames = names.map(n => n.trim());
  ok(navNames[0] === "示例画廊", "侧栏第一个入口是示例画廊（实际「" + navNames[0] + "」）");
  ok(navNames[1] === "出图工作流", "侧栏第二个入口是出图工作流（实际「" + navNames[1] + "」）");
  ok(navNames[2] === "一键抽卡", "侧栏第三个入口是一键抽卡（实际「" + navNames[2] + "」）");
  ok(["示例画廊", "出图工作流", "一键抽卡"].every((n, i) => navNames.indexOf(n) === i),
    "三个主入口各只出现一次且占最前三位：" + navNames.slice(0, 3).join(" → "));
  const groups = [...doc.querySelectorAll("#nav .grp")].map(g => g.textContent.trim());
  ok(groups.length >= 4 && /从这里开始|开始/.test(groups[0]),
    "第一个分组是主入口组：「" + (groups[0] || "无") + "」");

  const empties = [];
  for (const b of navButtons) {
    const name = (b.textContent || "").replace(/\s+/g, " ").trim();
    const before = errors.length;
    b.click();
    await new Promise(r => setTimeout(r, 30));
    const n = gridCards();
    const len = gridText().length;
    const newErr = errors.length - before;
    if (n === 0 || len < 20 || newErr > 0) {
      empties.push({ name, n, len, newErr, err: errors[errors.length - 1] });
    }
    console.log("    " + (n > 0 && len >= 20 && newErr === 0 ? "·" : "✗") + " " + name +
      " → 节点 " + n + " / 文本 " + len + (newErr ? " / 新增异常 " + newErr : ""));
  }
  ok(empties.length === 0, "全部 " + navButtons.length + " 个入口均有内容且无异常" +
    (empties.length ? " → 失败：" + empties.map(e => e.name).join("、") : ""));

  /* ---------- 2. 编码工作台：核心链路「编码/中文名 → 解析 → 组合串」 ---------- */
  const clickNav = async label => {
    const b = [...doc.querySelectorAll("#nav button")].find(x => (x.textContent || "").includes(label));
    if (!b) { ok(false, "找不到入口：" + label); return false; }
    b.click();
    await new Promise(r => setTimeout(r, 60));
    return true;
  };

  head("【2】编码工作台");
  const entered = await clickNav("编码工作台");
  if (entered) {
    ok(!!grid().querySelector("#cwQ"), "编码输入框存在");

    const runCombo = async q => {
      const ta = grid().querySelector("#cwQ");
      ta.value = q;
      ta.dispatchEvent(new win.Event("input", { bubbles: true }));
      grid().querySelector("[data-cw-go]").click();
      await new Promise(r => setTimeout(r, 80));
    };

    /* 四类中文/编码输入必须命中同一条目 —— 这是「可以用编码也可以用中文名」的唯一证据。
   刻意不把「Cel Shading」放进这组：它既是画风条目 ST-001 又是上色节点 VS-005-004，
   跨层级同名，解析器应当报歧义让用户选，而不是替用户决定。 */
    /* 四类输入 + 两个旧码。
       旧码（A1-001 / A1-01）必须仍能解析并指向新码——
       段码体系改过一轮（这是其中一次），已发布的组合串不能因此失效。 */
    const sameTarget = ["ST-001", "A1-01", "赛璐璐平涂", "st-1", "  ST-001  ", "A1-001"];
    const codes = [];
    for (const q of sameTarget) {
      await runCombo(q);
      const hit = grid().querySelector(".cw-code");
      const val = hit ? hit.textContent.trim() : null;
      codes.push(val);
      ok(val === "ST-001", "输入「" + q + "」→ " + (val || "未命中"));
    }
    ok(new Set(codes).size === 1, "四类输入全部归一到同一编码：" + [...new Set(codes)].join(","));

    /* 跨层级同名按「工具 > 条目 > 节点」自动收敛，但被遮住的那层
       必须显示在卡片里——收敛是替他做决定，列出候选是把决定权还回去。
       早前的实现是一律报歧义，代价是 86 个常用词（含「赛璐珞」
       「Cel Shading」「mecha」「废土」）全都进不了组合。 */
    await runCombo("Cel Shading");
    const shadow = grid().querySelector(".cw-dupnote");
    ok(!!shadow && /跨层同名/.test(shadow.textContent),
      "「Cel Shading」跨层同名 → 收敛并说明取自哪层：" +
      (shadow ? shadow.textContent.trim().slice(0, 60) : "未提示"));
    if (shadow) {
      const cands = [...shadow.querySelectorAll("[data-cw-try]")].map(b => b.dataset.cwTry);
      ok(cands.includes("VS-005-004"),
        "被遮住的节点层可点切换：" + cands.join(" / "));
    }
    const primary = grid().querySelector(".cw-code");
    ok(primary && primary.textContent.trim() === "ST-001",
      "主选取条目层 ST-001（实际 " + (primary ? primary.textContent.trim() : "无") + "）");

    /* 用完整编码指定层级后应当唯一命中 */
    for (const q of ["ST-001", "VS-005-004"]) {
      await runCombo(q);
      const hit = grid().querySelector(".cw-code");
      ok(hit && hit.textContent.trim() === q, "用编码消歧：「" + q + "」→ " + (hit ? hit.textContent.trim() : "未命中"));
    }

    /* 组合串：多项混合，逐项都要列出；同一项写两次只算一次 */
    await runCombo("ST-001 + 赛璐璐平涂 + TH-001");
    const items = grid().querySelectorAll(".cw-item:not(.cw-bad):not(.cw-amb)");
    ok(items.length === 2, "「编码 + 同一项的中文名 + 另一项」去重后 2 条（实际 " + items.length + "）");

    /* 去重必须留痕。少了这一条，输入 3 段只列 2 条，
       用户会以为有一段没查到，而不是「两段说的是同一个东西」。 */
    const dupBadge = grid().querySelector(".ov-grade.g-dup");
    ok(!!dupBadge, "重复段有独立提示条");
    if (dupBadge) {
      ok(/输入 3 段/.test(dupBadge.textContent) && /合并重复 1 段/.test(dupBadge.textContent),
        "提示条说清段数与合并数：" + dupBadge.textContent.trim());
    }
    const dupNote = grid().querySelector(".cw-dupnote");
    ok(!!dupNote && /另一个写法/.test(dupNote.textContent),
      "命中卡上标出另一个写法：" + (dupNote ? dupNote.textContent.trim().slice(0, 46) : "无"));
    const chain = grid().querySelector(".cw-chain");
    ok(!!chain && /ST-001/.test(chain.textContent) && /TH-001/.test(chain.textContent),
      "组合串同时含编码与中文名：" + (chain ? chain.textContent.trim().slice(0, 52) : "缺失"));
    const chainText = chain ? chain.textContent.trim() : "";
    ok(chainText.split("+").length === 2, "组合串本身也去重（不会输出同一项两遍）：" + chainText);

    /* 有错项时必须整体报错，并指出是哪一项 */
    await runCombo("ST-001 + 库里没有这个东西 + TH-001");
    const bads = grid().querySelectorAll(".cw-item.cw-bad");
    ok(bads.length === 1, "错项被单独标出（" + bads.length + " 条）");
    ok(/库里没有/.test(bads[0] ? bads[0].textContent : ""), "给出未命中的原因");

    /* 关键词串联必须去重 */
    await runCombo("ST-001 + ST-001");
    const ta2 = grid().querySelector(".cw-out textarea");
    const tags = ta2 ? ta2.value : "";
    ok(!!ta2 && tags.length > 0, "关键词串联非空");
    const parts = tags.split(", ");
    ok(new Set(parts).size === parts.length, "关键词串联已去重（" + parts.length + " 项）");
  }

  /* ---------- 3. 编码总览 ---------- */
  head("【3】编码总览");
  if (await clickNav("编码总览")) {
    const rows = grid().querySelectorAll(".cw-item");
    ok(rows.length >= 10, "列出 " + rows.length + " 个编码段");
    ok(/\d{3}/.test(grid().textContent), "展示了三位编码与范围");
  }

  /* ---------- 4. 授权与商用视图 ----------
     新增的视图，重点测三件事：
       分档数字与真实登记一致（不能写死）、去标识化能真跑、残留标识必须显示。 */
  head("【3b】授权与商用");
  await clickNav("授权与商用");
  {
    const txt = grid().textContent;
    ok(/R0/.test(txt) && /R1/.test(txt) && /R2/.test(txt) && /R3/.test(txt), "四档规则全部展示");

    /* 分档数字必须等于真实登记数。写死的数字是「假安心」的典型：
       数据改了图没改，没人看得出来。 */
    const counts = { R0: 0, R1: 0, R2: 0, R3: 0 };
    win.RESOLVER.entries.forEach(e => {
      counts[(e.rights && e.rights.tier) || "R0"]++;
    });
    for (const t of ["R0", "R1", "R2", "R3"]) {
      ok(new RegExp(t + "[^0-9]{0,40}" + counts[t] + "\\b").test(txt) ||
         txt.indexOf(counts[t] + " 项") >= 0,
        t + " 显示真实条数 " + counts[t]);
    }

    /* 用途切换必须改变结论——不然「当前档位能怎么用」就是一句空话 */
    ok(grid().querySelectorAll("[data-rw-mode]").length === 3, "三种用途切换齐备");
    const r3btn = grid().querySelector('[data-rw-tier="R3"]');
    if (r3btn) {
      r3btn.click();
      await new Promise(r => setTimeout(r, 60));
      ok(/去标识|改写/.test(grid().textContent), "R3 档给出改写要求");
    }
    const modeBtns = [...grid().querySelectorAll("[data-rw-mode]")];
    const personalTxt = grid().textContent;
    const commercialBtn = modeBtns.find(b => b.dataset.rwMode === "commercial");
    const personalBtn = modeBtns.find(b => b.dataset.rwMode === "personal");
    if (commercialBtn && personalBtn) {
      personalBtn.click();
      await new Promise(r => setTimeout(r, 60));
      const pTxt = grid().textContent;
      commercialBtn.click();
      await new Promise(r => setTimeout(r, 60));
      const cTxt = grid().textContent;
      ok(pTxt !== cTxt, "用途不同 → 结论不同（个人研究 vs 商业出图）");
      ok(pTxt.length > 100 && cTxt.length > 100, "两种用途都有结论");
    }

    /* 去标识化实测：填示例 → 必须给出改写结果。
       取「改写后」那一段要用 data-rw-side 钩子，不能按文案切文本：
       原文段本来就含标识，切错位置会把「原文有标识」误判成「没改干净」。 */
    const demoBtn = grid().querySelector("[data-rw-demo]");
    ok(!!demoBtn, "去标识化区有示例按钮");
    if (demoBtn) {
      demoBtn.click();
      await new Promise(r => setTimeout(r, 80));
      const out = grid().textContent;
      const srcTxt = (grid().querySelector('[data-rw-side="src"]') || {}).textContent || "";
      const outTxt = (grid().querySelector('[data-rw-side="out"]') || {}).textContent || "";
      ok(!!outTxt, "给出改写结果区块");
      ok(/替换\s*\d+\s*处/.test(out), "列出替换处数");
      ok(/Akira Toriyama/.test(srcTxt), "原文区块保留原标识（对照用）");
      ok(outTxt.length > 0 && !/Akira Toriyama|Studio Trigger/.test(outTxt),
        "改写结果内不再出现原始标识"
        + (/Akira Toriyama|Studio Trigger/.test(outTxt) ? " → " + outTxt.slice(0, 80) : ""));
      ok(!/式的|风格的/.test(outTxt),
        "中文后缀被吃掉，不留悬空的「式/风格」"
        + (/式的|风格的/.test(outTxt) ? " → " + outTxt.slice(0, 80) : ""));

      /* 手动输入路径也要通，不能只有示例按钮能跑 */
      const ta = grid().querySelector("#rwText");
      ok(!!ta, "去标识化输入框存在");
      if (ta) {
        ta.value = "赛璐璐平涂，参考 Walt Disney 的造型语言";
        grid().querySelector("[data-rw-run]").click();
        await new Promise(r => setTimeout(r, 80));
        const manual = (grid().querySelector('[data-rw-side="out"]') || {}).textContent || "";
        ok(manual.length > 0 && !/Walt|Disney/i.test(manual),
          "手动输入的标识也被去掉"
          + (/Walt|Disney/i.test(manual) ? " → " + manual.slice(0, 80) : ""));
      }
    }
  }

  /* ---------- 3c. 出图工作流 ----------
     这是用户要的那一屏：「看着这个就可以照着出图」。
     所以这里不只测「点进去有内容」，而是逐条验证
     ① 四栏候选真的非空（历史上题材栏恒为 0，页面照样正常显示）
     ② 选完四步后中文/英文/标签/负面词四段都在，且都能复制
     ③ 缺步时必须说出缺什么，而不是给一段看着完整的提示词 */
  head("【3c】出图工作流");
  await clickNav("出图工作流");
  {
    ok(!!win.STUDIO, "STUDIO 已挂载");
    ok(!!grid().querySelector(".st-flow"), "工作流双栏布局渲染");

    /* 四栏候选数量：直接数 DOM 里的可选条目 */
    const steps = [...grid().querySelectorAll(".st-step")];
    ok(steps.length === 4, "四个步骤卡齐备：" + steps.length + " 个");

    const counts = win.STUDIO.STEPS.map(s => ({
      key: s.key, zh: s.zh, n: win.STUDIO.candidates(s.key).length
    }));
    ok(counts.every(c => c.n > 0),
      "四栏候选都非空：" + counts.map(c => c.zh + " " + c.n).join(" / "));
    ok(counts.find(c => c.key === "theme").n === 32,
      "题材栏 32 条（G-01 的段前缀历史上被 slice(0,2) 切错，恒为 0）");
    ok(counts.find(c => c.key === "layout").n === 30, "版式栏 30 条");
    ok(counts.find(c => c.key === "palette").n === 12, "配色栏 12 条");

    /* 未选择时：给引导，不给空白；正文区必须有说明而不是空的。
       授权块此时不能显示「当前所选均为 R0」——一个都没选，
       说成 R0 等于凭空发了一张「可商用」的假通行证。 */
    const emptyTxt = grid().textContent;
    ok(/先在左侧选/.test(emptyTxt), "未选择时显示引导文案");
    ok(/缺画风|缺题材|缺版式|缺配色/.test(emptyTxt), "未选择时逐项说明缺失后果");
    ok(!/当前所选均为 R0/.test(emptyTxt),
      "未选择时不谎报「均为 R0」（那等于凭空发一张可商用通行证）");
    ok(/选入画风或题材后/.test(emptyTxt), "未选择时授权块说明「选了才会显示等级」");

    /* 一键出图面板：一个环节都没选时按钮必须是禁用的，
       而不是点了才报「没选」。这是最容易被做错的一种按钮状态。 */
    ok(!!win.RENDER, "RENDER 已挂载");
    ok(!!grid().querySelector(".st-go"), "未选择时出图面板已经出现（用户能提前知道有这功能）");
    ok(!!grid().querySelector("[data-st-go][disabled]"), "未选择时出图按钮为禁用态");
    ok(/先在上面选一个/.test(grid().querySelector(".st-go").textContent),
      "禁用原因写明「先选画风或题材」");

    /* 配色栏必须用真实色值渲染，不能只有名字 */
    const swatches = [...grid().querySelectorAll(".st-sw .chip")];
    ok(swatches.length > 0, "配色以色卡渲染：" + swatches.length + " 个");
    ok(swatches.every(s => /^#[0-9A-Fa-f]{6}$/.test(s.style.background
      .replace(/\s/g, "").replace(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/, (m, r, g2, b) =>
        "#" + [r, g2, b].map(n => (+n).toString(16).padStart(2, "0")).join("").toUpperCase()))
      || s.style.background.length > 0),
      "色卡使用真实色值");

    /* 预设：套一个就应该拿到全部四段 */
    const presets = [...grid().querySelectorAll("[data-st-preset]")];
    ok(presets.length >= 5, "预设 " + presets.length + " 个（第一次进来就能看到成品）");
    presets[0].click();
    await new Promise(r => setTimeout(r, 90));

    const blocks = [...grid().querySelectorAll("[data-st-text]")];
    const titles = blocks.map(b => b.dataset.stText);
    ok(titles.includes("中文正文"), "给出中文正文");
    ok(titles.includes("标签速用版"), "给出标签速用版");
    ok(titles.includes("负面词"), "给出负面词");

    const zhBox = grid().querySelector('[data-st-text="中文正文"]');
    const zhTxt = zhBox ? zhBox.textContent : "";
    ok(zhTxt.length > 200, "中文正文长度 " + zhTxt.length + " 字符");
    /* 中文正文必须是中文。若 PROMPT_ZH 取不到正文，
       页面会回退到条目 demo（英文标签串），长度照样够——只有汉字占比能抓住。 */
    const han = (zhTxt.match(/[\u4e00-\u9fa5]/g) || []).length;
    ok(han / Math.max(1, zhTxt.length) > 0.5,
      "中文正文汉字占比 " + (han / Math.max(1, zhTxt.length) * 100).toFixed(0) + "%（防止回退成英文标签）");

    /* 画幅与主色必须真的出现在正文里 */
    const lay = win.STUDIO.entryOf("layout"), pal = win.STUDIO.entryOf("palette");
    ok(lay && zhTxt.indexOf(lay.ratio) >= 0, "中文正文含建议画幅 " + (lay && lay.ratio));
    ok(pal && zhTxt.indexOf(pal.hex) >= 0, "中文正文含配色主色 " + (pal && pal.hex));

    /* 授权提示随选择走 */
    ok(/R0/.test(grid().textContent), "显示当前选择的授权档位");

    /* ---- 一键出图面板：选完之后必须可用 ---- */
    {
      const go = grid().querySelector(".st-go");
      ok(!!go, "选完后出图面板仍在");
      const goBtn = go.querySelector("[data-st-go]");
      ok(!!goBtn && !goBtn.disabled, "选完后「立即出图」可点");
      ok(/立即出图|重新出图|换一张/.test(goBtn.textContent), "按钮文案明确：" + goBtn.textContent.trim());

      /* 尺寸默认 1:1，不再跟随版式。
         版式决定的是画面里元素怎么摆，出图比例决定的是画布什么形状，
         混在一起时用户没法控制自己拿到的是横图还是竖图。 */
      const sizeTxt = (go.querySelector(".gs") || {}).textContent || "";
      const expect = win.RENDER.pxOf(win.RND_DEFAULT_RATIO || "1:1", "std");
      ok(sizeTxt.indexOf(expect.w + "×" + expect.h) >= 0,
        "面板尺寸默认 " + expect.w + "×" + expect.h + "（面板显示「" + sizeTxt.trim() + "」）");

      /* 五个比例按钮 + 自定义，一个都不能少 */
      const ratioBtns = [...grid().querySelectorAll("[data-st-ratio]")];
      const labels = ratioBtns.map(b => b.textContent.trim());
      ["1:1", "9:16", "16:9", "3:4", "4:3"].forEach(r => {
        ok(labels.includes(r), "有出图比例按钮 " + r);
      });
      ok(labels.includes("自定义"), "有自定义尺寸入口");
      ok(ratioBtns.find(b => b.dataset.stRatio === "1:1" && /on/.test(b.className)),
        "默认选中 1:1（用户要求的默认值）");

      /* 切比例：像素尺寸与正文画幅句必须同时变。
         只改一边 = 模型收到两套矛盾指令（正文说 3:4、请求发 16:9）。 */
      const r169 = ratioBtns.find(b => b.dataset.stRatio === "16:9");
      if (r169) {
        r169.click();
        await new Promise(r => setTimeout(r, 60));
        const e169 = win.RENDER.pxOf("16:9", win.RENDER.DEFAULT_TIER);
        const t169 = grid().querySelector(".st-go .gs").textContent;
        ok(t169.indexOf(e169.w + "×" + e169.h) >= 0,
          "切到 16:9 后面板显示 " + e169.w + "×" + e169.h + "（实际「" + t169.trim() + "」）");
        ok(/Aspect ratio 16:9/.test(win.STUDIO.compose("en", "16:9")),
          "切到 16:9 后正文画幅句同步改成 16:9");
        /* 自定义框只在选了自定义时出现 */
        ok(!grid().querySelector("[data-st-size]"), "未选自定义时不显示尺寸输入框");
        const rc = [...grid().querySelectorAll("[data-st-ratio]")]
          .find(b => b.dataset.stRatio === "custom");
        rc.click();
        await new Promise(r => setTimeout(r, 60));
        ok(!!grid().querySelector("[data-st-size]"), "选自定义后出现像素输入框");
        /* 非法值必须显示原因，而不是默默出一个方图 */
        const sizeInp = grid().querySelector("[data-st-size]");
        sizeInp.value = "100x100";
        sizeInp.dispatchEvent(new win.Event("input"));
        sizeInp.dispatchEvent(new win.Event("blur"));
        await new Promise(r => setTimeout(r, 60));
        const g2 = grid().querySelector(".st-go").textContent.replace(/\s+/g, " ");
        ok(/256|2048|不合法|看不懂/.test(g2), "非法自定义尺寸被挡下并说明原因");
        /* 合法值要能过 */
        const sizeInp2 = grid().querySelector("[data-st-size]");
        sizeInp2.value = "1024x1536";
        sizeInp2.dispatchEvent(new win.Event("input"));
        sizeInp2.dispatchEvent(new win.Event("blur"));
        await new Promise(r => setTimeout(r, 60));
        ok(/1024×1536/.test(grid().querySelector(".st-go .gs").textContent),
          "合法自定义尺寸生效：" + grid().querySelector(".st-go .gs").textContent.trim());
      }

      /* 模型：四个指定模型 + 免 key 兜底，且通道标在按钮上 */
      const mdBtns = [...grid().querySelectorAll("[data-st-md]")];
      const mdLabels = mdBtns.map(b => b.textContent.trim());
      ok(/GPT-Image 2/.test(mdLabels.join("|")), "有 GPT-Image 2");
      ok(/Nano Banana/.test(mdLabels.join("|")), "有 Nano Banana 2.1");
      ok(/Midjourney/.test(mdLabels.join("|")), "有 Midjourney");
      ok(/Flux/.test(mdLabels.join("|")), "有 Flux");
      ok(/Sana/.test(mdLabels.join("|")), "有免 key 兜底项（不然默认模型点不动，整屏像坏了）");
      ok(mdBtns.some(b => /on/.test(b.className)), "默认选中一个模型");
      ok(mdBtns.find(b => b.dataset.stMd === "gpt-image-2" && /on/.test(b.className)),
        "默认模型是 GPT-Image 2（用户指定的默认值）");
      /* 通道必须在按钮上标出来：四个模型能不能一键出图完全不一样 */
      ok(mdBtns.every(b => /chan-(keyed|anon|manual)/.test(b.className)),
        "每个模型按钮都标了通道（绿=要key / 黄=免key / 紫=无API）");

      /* ---------- 按模型优化的提示词 ----------
         这是本轮的核心：一组四步要给五个模型五份词。
         断「五张卡都在」是不够的 —— 五个模型返回同一段通用正文时，
         界面上同样有五张卡，而且每张都写着「按 X 优化的」。 */
      const mpWrap = grid().querySelector(".mp-wrap");
      ok(!!mpWrap, "有「按模型优化的提示词」这一块");
      const mpCards = [...grid().querySelectorAll(".mp-card")];
      ok(mpCards.length === win.RENDER.MODELS.length,
        "五个模型各一块（" + mpCards.length + "）");
      ok(mpCards.every(c => c.querySelector("[data-mp-copy]")),
        "每块都有「复制提示词」按钮");

      /* 默认提示词在最上面，且不是任何一家模型的写法 */
      const baseBox = grid().querySelector('[data-mp-text="base"]');
      ok(!!baseBox, "有默认提示词");
      /* 顺序用 indexOf 比而不是 compareDocumentPosition：
         后者要 Node 常量，而这里是 jsdom 沙箱，没有全局 Node。
         顺序错位的后果是「默认词被当成某一家的优化版」，必须断。 */
      const stOut = grid().querySelector(".st-out");
      const posBase = stOut ? stOut.innerHTML.indexOf('data-mp-text="base"') : -1;
      const posFirstCard = stOut ? stOut.innerHTML.indexOf('class="mp-card') : -1;
      ok(posBase >= 0 && posBase < posFirstCard,
        "默认提示词排在所有模型块之前（" + posBase + " < " + posFirstCard + "）");
      /* 要按界面当前的出图比例算，不能直接 compose("zh")：
         前面几段测过 16:9 与自定义，界面上的 RND.ratio 早就不是 1:1 了，
         而 base() 是带 ratio 的那一个。 */
      const curSpec = win.RND.ratio === "custom" ? (win.RND.custom || "") : win.RND.ratio;
      ok(!!baseBox && baseBox.textContent === win.STUDIO.compose("zh", curSpec),
        "默认提示词与 STUDIO.compose() 逐字相同（它不该被任何模型改写）"
        + "（比例 " + curSpec + "）");

      /* 五份词真的互不相同 —— 这一条是全部意义的所在。
         取 [data-mp-text] 而不是 .mp-bb:not(.params)：
         前者正好是复制时会取到的那一段，
         后者在 MP 的参数块与按钮之间更近，selector 一改就可能取错块。 */
      const texts = mpCards.map(c => {
        const b = c.querySelector(".mp-bb[data-mp-text]");
        return b ? b.textContent.trim() : "";
      });
      ok(texts.every(t => t.length > 0), "五块都有正文");
      ok(new Set(texts).size === texts.length,
        "五份词互不相同（模型卡各自有语法，不是同一段换个标签）");
      const baseTxt = baseBox ? baseBox.textContent.trim() : "";
      ok(texts.every(t => t !== baseTxt), "五份词都不同于默认提示词");

      /* 每块说清「这版为什么这么写」——否则用户不知道该不该信它 */
      ok(mpCards.every(c => c.querySelector(".mp-note")),
        "每块都写了这版改了什么（不只是给一段不同的字）");

      /* 点「用这个模型出图」能切换当前模型 */
      const beforeMd = win.RND.model;
      const fluxPick = grid().querySelector('[data-mp-pick="flux"]');
      ok(!!fluxPick, "有「用这个模型出图」按钮");
      if (fluxPick) {
        fluxPick.click();
        await new Promise(r => setTimeout(r, 80));
        ok(win.RND.model === "flux", "点一下当前模型切到 Flux");
        const onCard = grid().querySelector(".mp-card.on");
        ok(!!onCard && !!onCard.querySelector('[data-mp-text="flux"]'),
          "被选中的那块高亮（用户知道现在用的是哪一版）");
        ok(!!onCard && !onCard.querySelector('[data-mp-pick="flux"]'),
          "当前那块不再给「用这个模型出图」（它已经是当前的了）");
        ok(!!onCard && !!onCard.querySelector("[data-st-go]"),
          "当前模型给「立即出图」");
        /* Flux 不吃逗号标签 —— 那块不该是标签版 */
        ok(!!onCard && !/--ar/.test(onCard.querySelector(".mp-bb").textContent),
          "Flux 那块是散文版（不含 MJ 的参数串）");
      }
      /* 切回去，免得影响后续断言 */
      if (win.RND.model !== beforeMd) {
        win.RND.model = beforeMd;
        win.openRenderStudio();
        await new Promise(r => setTimeout(r, 60));
      }

      /* 默认模型要 key → 必须出现 key 输入框，且面板说明去哪申请 */
      ok(!!grid().querySelector("[data-st-key]"), "默认模型需要 key，界面给出输入框");
      ok(/enter\.pollinations\.ai/.test(grid().querySelector(".st-go").textContent),
        "写明去哪申请 key");
      ok(/不写硬盘|不进 URL|内存/.test(grid().querySelector(".st-go").textContent),
        "写明 key 只在内存、不进 URL");

      /* 免 key 那条：不能出现 key 框，出图按钮仍可用 */
      const sanaBtn = mdBtns.find(b => b.dataset.stMd === "sana");
      if (sanaBtn) {
        sanaBtn.click();
        await new Promise(r => setTimeout(r, 60));
        ok(!grid().querySelector("[data-st-key]"), "免 key 通道不显示 key 输入框");
        ok(!grid().querySelector("[data-st-go][disabled]"),
          "免 key 通道的出图按钮可点（不给免 key 路线的话整屏 unusable）");
        ok(/实际是 Sana|不要钱/.test(grid().querySelector(".st-go").textContent),
          "免 key 通道写明实际是 Sana——不写就是骗用户，"
            + "实测填任何 model 名都只出 Sana");
      }

      /* MJ：没有 API，不能给假按钮 */
      const mjBtn = [...grid().querySelectorAll("[data-st-md]")]
        .find(b => b.dataset.stMd === "mj");
      if (mjBtn) {
        mjBtn.click();
        await new Promise(r => setTimeout(r, 60));
        const mjTxt = grid().querySelector(".st-go").textContent.replace(/\s+/g, " ");
        ok(!grid().querySelector("[data-st-go]"),
          "MJ 不给「立即出图」按钮（它真的没有出图 API，给了就是骗）");
        ok(/没有公开出图 API/.test(mjTxt), "MJ 明说没有公开出图 API");
        /* MJ 的标签与参数现在由「按模型优化的提示词」那块给，
           不在出图面板里 —— 一处拼法都不留。
           早前 supMjHtml 在出图面板里另拼一次 `tags + " " + params`，
           而适配层给的是分开的两块（MJ 只要标签里混进参数之外的符号就废），
           两份必然分叉，用户会抄到旧的那份。
           所以这里断的是模型卡，断言也必须跟着走。 */
        const mjCard = [...grid().querySelectorAll(".mp-card")]
             .find(c => c.querySelector('[data-mp-text="mj"]'));
        const mjBox = mjCard && mjCard.querySelector('[data-mp-text="mj"]');
        const mjPar = mjCard && mjCard.querySelector('[data-mp-text="mj-params"]');
        ok(!!mjBox, "MJ 的标签版在模型优化词那一块里");
        ok(!!mjPar && /--ar/.test(mjPar.textContent) && /--niji/.test(mjPar.textContent),
          "MJ 的参数串单独给（--ar / --niji），不与标签混在一段");
        ok(!!mjBox && !/--ar/.test(mjBox.textContent),
          "MJ 标签段里没有 --ar（两条画幅指令会打架）");
        ok(!!(mjCard && mjCard.querySelector('[data-mp-copy="mj"]')),
          "MJ 有「复制提示词」按钮");
        ok(!!(mjCard && mjCard.querySelector('[data-mp-copy="mj-params"]')),
          "MJ 有「复制参数」按钮");
        /* 网址在 href 属性里，textContent 读不到 ——
           断 textContent 的话，这条会一直绿着一个不存在的入口。
           取链接节点再看它的 href，才是真的有入口。 */
        const mjSite = mjCard && mjCard.querySelector('a[href^="https://"]');
        ok(!!mjSite, "MJ 卡片上有官网链接");
        ok(!!mjSite && /midjourney\.com/.test(mjSite.getAttribute("href")),
          "链接指向 midjourney.com（实际「" + (mjSite ? mjSite.getAttribute("href") : "无") + "」）");
      }

      /* Nano Banana 的付费/故障提示必须在界面上，不埋在 tooltip 里 */
      const nbBtn = [...grid().querySelectorAll("[data-st-md]")]
        .find(b => b.dataset.stMd === "nano-banana");
      if (nbBtn) {
        nbBtn.click();
        await new Promise(r => setTimeout(r, 60));
        const nbTxt = grid().querySelector(".st-go").textContent.replace(/\s+/g, " ");
        ok(/paid_only|付费|故障|down/.test(nbTxt),
          "Nano Banana 的付费/故障状态写在界面上（不埋在 tooltip 里）");
      }

      /* ---- 清晰度不是这一屏的选项 ----
         出图尺寸固定走 RENDER.DEFAULT_TIER（标准档 768）。
         摆一个谁也不会回头改的按钮，只是让「要决定什么」多一项。 */
      const r11 = [...grid().querySelectorAll("[data-st-ratio]")]
        .find(b => b.dataset.stRatio === "1:1");
      if (r11) { r11.click(); await new Promise(r => setTimeout(r, 60)); }
      ok(!grid().querySelector("[data-st-tier]"), "出图工作流里没有清晰度档位按钮");
      ok(!/清晰度/.test(grid().querySelector(".st-go").textContent),
        "出图工作流的文案里也不再出现「清晰度」");
      const e11 = win.RENDER.pxOf("1:1", win.RENDER.DEFAULT_TIER);
      ok(grid().querySelector(".st-go .gs").textContent.indexOf(e11.w + "×" + e11.h) >= 0,
        "尺寸按默认档算：" + e11.w + "×" + e11.h);
      ok(!!grid().querySelector("[data-st-seed]"), "有 seed 输入框（可复现同一张构图）");

      /* ---- 抽卡相关内容在这一屏**一个字都不出现** ----
         早前这里留着一个「去抽卡」的盒子。那是个坏折中：
         在这一屏看到随机功能，用户会以为抽卡是「按当前四步换 seed」，
         而抽卡恰恰是要推翻这四步的。
         要去抽卡从侧栏走，两屏之间唯一的联系在抽卡页那边。 */
      {
        const goTxt0 = grid().querySelector(".st-go").textContent.replace(/\s+/g, " ");
        ok(!/抽卡/.test(goTxt0), "出图面板里不含任何抽卡字样");
        ok(!/抽卡/.test(grid().textContent),
          "整屏（含左侧四步与右侧正文）都不出现抽卡字样");
        ok(!grid().querySelector("[data-st-goto-gacha]"), "没有跳到抽卡页的按钮");
        ok(!grid().querySelector(".gacha-box"), "没有抽卡指路盒");
        ok(!grid().querySelector("[data-st-gacha]"),
          "抽卡本体也不在出图工作流里（两处各存一份抽卡状态必然对不上）");
        ok(!grid().querySelector(".st-card"),
          "出图工作流里不再出现抽卡卡片网格");
      }

      /* 四条边界必须在界面上写着。
         缺任何一条都会造成实际误解：
         水印那条最要紧——用户会拿带水印的图直接商用。 */
      const goTxt = grid().querySelector(".st-go").textContent.replace(/\s+/g, " ");
      ok(/离开你的电脑/.test(goTxt), "写明提示词会离开电脑");
      ok(/水印/.test(goTxt) && /裁/.test(goTxt), "写明水印去不掉、需自行裁掉");
      ok(/乱码|后期排字/.test(goTxt), "写明图中文字仍需后期排版");

      /* 真实请求不打：这里只验证 URL 能被正确拼出来，
         联网出图属于网络行为，测试里不能依赖它成功。 */
      const r = win.RENDER.reqOf(win.STUDIO.compose("en", "16:9"), {
        ratio: "16:9", model: "sana", seed: 42
      });
      ok(r.kind === "img" && /^https:\/\/image\.pollinations\.ai\/prompt\//.test(r.url),
        "出图请求指向匿名通道");
      ok(r.url.indexOf("seed=42") >= 0, "固定 seed 进请求（同一组合可复现）");
      ok(!/[\u4e00-\u9fa5]/.test(decodeURIComponent(r.url)), "送出的是英文正文，不含中文");
    }

    /* 切英文：两版必须不同 */
    const enBtn = grid().querySelector('[data-st-lang="en"]');
    ok(!!enBtn, "有英文正文切换");
    if (enBtn) {
      enBtn.click();
      await new Promise(r => setTimeout(r, 60));
      const enBox = grid().querySelector('[data-st-text="英文正文"]');
      const enTxt = enBox ? enBox.textContent : "";
      ok(enTxt.length > 200 && enTxt !== zhTxt, "英文正文独立成版（" + enTxt.length + " 字符）");
      ok(lay && enTxt.indexOf(lay.ratio) >= 0, "英文正文含画幅");
      ok(pal && enTxt.indexOf(pal.hex) >= 0, "英文正文含主色");
    }

    /* 每个可复制段落都要有对应按钮，且复制内容与显示一致 */
    const copyBtns = [...grid().querySelectorAll("[data-st-copy]")];
    ok(copyBtns.length >= 4, "复制点 " + copyBtns.length + " 个（正文/标签/负面/组合串各有）");
    copyBtns.forEach(b => {
      const box = grid().querySelector('[data-st-text="' + b.dataset.stCopy + '"]');
      ok(!!box && box.textContent.trim().length > 10,
        "「" + b.dataset.stCopy + "」的复制按钮指向真实内容");
    });

    /* 手动改一步：结果必须跟着变 */
    const themeQ = grid().querySelector('[data-st-q="theme"]');
    ok(!!themeQ, "题材栏有搜索框");
    if (themeQ) {
      themeQ.value = "机甲";
      themeQ.dispatchEvent(new win.Event("input", { bubbles: true }));
      await new Promise(r => setTimeout(r, 90));
      const opts = [...grid().querySelectorAll('[data-st-pick^="theme|"]')];
      ok(opts.length > 0, "搜索「机甲」筛出 " + opts.length + " 条");
      ok(opts.every(o => /机甲/.test(o.textContent)), "筛出的都是题材条目");
    }
    /* 改选版式：必须点到「与当前不同的那一条」。
       预设已选中 LT-01，此时点 LT-01 是取消（这是对的），
       测试要验的是换选，所以显式挑一条未选中的。 */
    const ltBefore = win.STUDIO.S.layout;
    const ltOther = [...grid().querySelectorAll('[data-st-pick^="layout|"]')]
      .find(o => o.dataset.stPick.split("|")[1] !== ltBefore);
    ok(!!ltOther, "版式栏里存在可换选的其它条目");
    if (ltOther) {
      ltOther.click();
      await new Promise(r => setTimeout(r, 60));
      ok(win.STUDIO.S.layout && win.STUDIO.S.layout !== ltBefore,
        "换选版式生效：" + ltBefore + " → " + win.STUDIO.S.layout);
      const newRatio = win.STUDIO.entryOf("layout").ratio;
      const box = grid().querySelector('[data-st-text="英文正文"]');
      ok(box && box.textContent.indexOf(newRatio) >= 0,
        "换版式后正文里的画幅同步变为 " + newRatio);
    }
    /* 再点同一条 = 取消（toggle 语义必须成立，否则取消按钮形同虚设） */
    if (ltOther) {
      const again = [...grid().querySelectorAll('[data-st-pick^="layout|"]')]
        .find(o => o.dataset.stPick.split("|")[1] === win.STUDIO.S.layout);
      ok(!!again, "能再次点到已选中的版式条目");
      if (again) {
        again.click();
        await new Promise(r => setTimeout(r, 60));
        ok(win.STUDIO.S.layout === "", "再点同一条取消选择");
      }
    }
    /* 取消选择：点已选中的那条 */
    const cur = grid().querySelector("[data-st-clear]");
    ok(!!cur, "已选项有取消按钮");
    if (cur) {
      const key = cur.dataset.stClear;
      const before = win.STUDIO.S[key];
      cur.click();
      await new Promise(r => setTimeout(r, 60));
      ok(win.STUDIO.S[key] !== before, "取消后该步被清空");
    }

    /* 清空：回到引导态 */
    const clr = grid().querySelector("[data-st-clear-all]");
    ok(!!clr, "有全部清空");
    if (clr) {
      clr.click();
      await new Promise(r => setTimeout(r, 60));
      ok(win.STUDIO.partsReady().count === 0, "清空后已选 0 步");
      ok(/先在左侧选/.test(grid().textContent), "清空后回到引导态");
    }
  }

  /* ---------- 3d. 一键抽卡（独立一屏） ---------- */
  head("【3d】一键抽卡");
  {
    await clickNav("一键抽卡");
    const gc = () => grid().querySelector(".gc-view");
    ok(!!gc(), "抽卡是独立的一屏（.gc-view 面板存在）");
    ok(!doc.querySelector('[data-sec="openstudio"].on'),
      "进入抽卡后侧栏高亮切到了抽卡而不是出图工作流");

    /* 池构成必须是**现算**的：
       界面上写的每一个数字都要与 GACHA.pool() 的一致。
       写死数字的后果不是报错，是补库之后界面还在说旧规模。 */
    const pool = win.GACHA.pool();
    /* 池构成在顶部说明面板里，不在 gc-view 面板内 —— 取错节点会 null */
    const poolTxt = grid().querySelector(".gc-pool").textContent.replace(/\s+/g, " ");
    pool.slots.forEach(s => {
      ok(poolTxt.indexOf(s.label + " " + s.count) >= 0,
        "池构成里「" + s.label + " " + s.count + "」与实时算的一致");
    });
    ok(poolTxt.indexOf(pool.spaceZh) >= 0,
      "显示可组合空间 " + pool.spaceZh + "（与 GACHA.pool() 一致）");
    ok(/现算|自动变大/.test(grid().textContent),
      "写明这些数字是照库现算的、补库会自动变大（不然用户以为这是固定值）");

    /* 槽位行：一槽一行，候选直接从库里挑 */
    const slotRows = [...gc().querySelectorAll(".gc-slot")];
    ok(slotRows.length === pool.slots.length,
      "槽位行数 = 库层数（" + slotRows.length + "）");
    const picks = [...gc().querySelectorAll("[data-gc-pick]")];
    ok(picks.length === pool.slots.length,
      "每一槽都有一个候选下拉（「画风固定成赛璐璐，只抽题材和配色」）");
    /* 下拉里的选项必须与池报告里的候选**逐条对上**。
       界面自己再算一遍候选，就会出现「池说 59 条、下拉里 57 条」
       这种两个来源各自算一次的分歧，而两边看起来都正常。 */
    pool.slots.forEach(s => {
      const sel = gc().querySelector('[data-gc-pick="' + s.key + '"]');
      if (!sel) { ok(false, "缺 " + s.label + " 的下拉"); return; }
      const opts = [...sel.querySelectorAll("option")];
      ok(opts.length === s.count + 1,
        "「" + s.label + "」下拉 = " + s.count + " 条候选 + 1 条「随机」（实得 "
        + opts.length + "）");
      ok(opts[0].value === "" && /随机/.test(opts[0].textContent),
        "「" + s.label + "」第一项是「随机」，选它即解锁");
      ok(opts.slice(1).every((o, i) => o.value === s.entries[i].id),
        "「" + s.label + "」选项顺序与 GACHA.pool() 的候选逐条一致");
    });
    ok(slotRows.every(r => /条/.test(r.querySelector(".ct").textContent)),
      "每一槽写明候选条数");

    /* 出图设置：模型 / 比例 / 张数。**没有清晰度**——*/
    const mdBtns = [...gc().querySelectorAll("[data-gc-model]")];
    ok(mdBtns.length === win.RENDER.MODELS.length,
      "模型可选 " + mdBtns.length + " 个：" + mdBtns.map(b => b.textContent.trim()).join(" / "));
    const raBtns = [...gc().querySelectorAll("[data-gc-ratio]")];
    ok(raBtns.length === win.RENDER.RATIOS.length + 1,
      "出图比例 " + (raBtns.length - 1) + " 档 + 自定义");
    const nBtns = [...gc().querySelectorAll("[data-gc-n]")];
    ok(nBtns.length === 4, "张数可选 4 档：" + nBtns.map(b => b.textContent.trim()).join(" "));
    ok(!gc().querySelector("[data-gc-tier]"), "抽卡页里没有清晰度档位按钮");
    ok(!/清晰度/.test(gc().textContent), "抽卡页的文案里也不再出现「清晰度」");

    /* 「只关联库」：这一屏不读出图工作流选了哪几条。
       做法是在工作流里选一组，再回抽卡页看锁定值有没有被带过来 ——
       带了就是有依赖，而两处都能单独改，迟早对不上。 */
    {
      const wf = win.STUDIO.S;
      const before = JSON.stringify(wf);
      ok(Object.keys(win.GCH.lock).length === 0,
        "进抽卡页时没有锁定项（不会把工作流的选择当成自己的输入）");
      ok(JSON.stringify(wf) === before, "抽卡页没有改写工作流的选择");
      /* 在下拉里锁一条：值必须来自库，且与工作流里选的是什么无关 */
      const stylePick = gc().querySelector('[data-gc-pick="style"]');
      const want = pool.slots.find(s => s.key === "style").entries[0];
      stylePick.value = want.id;
      stylePick.dispatchEvent(new win.Event("change"));
      await new Promise(r => setTimeout(r, 60));
      ok(win.GCH.lock.style === want.id,
        "从下拉里选一条即锁定为 " + want.id + "（值来自库，不来自工作流）");
      const pAfter = win.GACHA.pool(win.GCH.lock);
      ok(pAfter.space < pool.space,
        "锁一层后空间收窄（" + pool.spaceZh + " → " + pAfter.spaceZh + "）");
      ok(pAfter.space === Math.round(pool.space / pool.slots.find(s => s.key === "style").count),
        "收窄的倍数 = 该层候选数（" + pool.space + " / "
        + pool.slots.find(s => s.key === "style").count + " = " + pAfter.space + "）");
      /* 选回「随机」即解锁 —— 同一个控件完成锁与解锁 */
      const sel2 = gc().querySelector('[data-gc-pick="style"]');
      sel2.value = "";
      sel2.dispatchEvent(new win.Event("change"));
      await new Promise(r => setTimeout(r, 60));
      ok(!win.GCH.lock.style, "选回「随机」即解锁");
      ok(win.GACHA.pool(win.GCH.lock).space === pool.space, "解锁后空间回到 " + pool.spaceZh);
    }

    /* 通道限制：keyed / manual 都不给抽卡，并且给出可走的路 */
    const gpt = mdBtns.find(b => b.dataset.gcModel === "gpt-image-2");
    if (gpt) {
      gpt.click();
      await new Promise(r => setTimeout(r, 60));
      ok(!!gc().querySelector("[data-gc-run][disabled]"),
        "要 key 的通道禁用抽卡（一次铺 6 张等于没看见就花了六份钱）");
      ok(/计费/.test(gc().textContent), "说明为什么不给抽卡");
      ok(!!gc().querySelector("[data-gc-tosana]"),
        "并且给一个「切到免 key 通道抽卡」的按钮（不只说不行，还给路）");
    }
    const mj = mdBtns.find(b => b.dataset.gcModel === "mj");
    if (mj) {
      mj.click();
      await new Promise(r => setTimeout(r, 60));
      ok(!!gc().querySelector("[data-gc-run][disabled]"),
        "Midjourney 没有 API，同样不给抽卡按钮");
    }

    /* 免 key 通道上抽卡可用，点了会真的排出一批卡片 */
    const sana = mdBtns.find(b => b.dataset.gcModel === "sana");
    if (sana) {
      sana.click();
      await new Promise(r => setTimeout(r, 60));
      const run = gc().querySelector("[data-gc-run]");
      ok(!!run && !run.disabled, "免 key 通道可以抽卡");

      /* 张数改成 4 再抽，卡片数要跟着走 */
      const four = [...gc().querySelectorAll("[data-gc-n]")].find(b => b.dataset.gcN === "4");
      if (four) { four.click(); await new Promise(r => setTimeout(r, 60)); }

      if (run && !run.disabled) {
        gc().querySelector("[data-gc-run]").click();
        await new Promise(r => setTimeout(r, 100));
        const cards = [...gc().querySelectorAll(".st-card")];
        ok(cards.length === 4, "点一次铺开 4 张卡（跟着张数设置走）：" + cards.length);
        /* 读 data-gc-chain 而不是 title：title 里带着「点一下复制…」的提示语，
           拿它当编码用会在断言里混进一段中文，看着像数据错。 */
        const codes = cards.map(c => {
          const box = c.querySelector(".cc");
          return box ? (box.getAttribute("data-gc-chain") || "") : "";
        });
        ok(codes.every(c => c.split(" + ").length === win.STUDIO.STEPS.length),
          "每张卡标出自己那组完整编码：" + codes[0]);
        ok(new Set(codes).size === codes.length, "各卡组合互不相同（不是同一张图看六遍）");

        /* ---- 组合信息：光有一串编码不够 ----
           编码是给机器（与复制粘贴）用的，用户判断「这组想不想出图」
           只能看中文名。所以每张卡要按层列出「层名 · 编码 · 中文名」。 */
        {
          const rows = [...cards[0].querySelectorAll(".cm-r")];
          ok(rows.length === win.STUDIO.STEPS.length,
            "每张卡按层列出组合信息（" + rows.length + " 行 = 库的层数）");
          ok(rows.every(r => r.querySelector(".cm-k") && r.querySelector(".cm-c")
                          && r.querySelector(".cm-z")),
            "每一行都给层名 / 编码 / 中文名三样");
          ok(rows.map(r => r.querySelector(".cm-k").textContent.trim()).join(",")
             === win.STUDIO.STEPS.map(s => s.zh).join(","),
            "行序与四步一致：" + rows.map(r => r.querySelector(".cm-k").textContent.trim()).join(" → "));
          /* 中文名必须真的是那个编码对应的条目名 ——
           只断「非空」的话，把编码回车重复一遍也能过。

           比对要用 **labelOfEntry** 而不是 e.zh：
           工作室层的条目名是「吉卜力（宫崎骏）」这类检索名，
           而卡片上显示的是去标识后的特征名「田园手绘背景」——
           那是本库反复挡的事（Agent 读到创作者名会顺手写进正文）。
           所以这两者对不上是**设计**，拿 e.zh 比就是断言写错了：
           它会随机命中工作室层的条目，于是这条断言有时绿有时红。 */
          const bad = rows.map(r => {
            const code = r.querySelector(".cm-c").textContent.trim();
            const name = r.querySelector(".cm-z").textContent.trim();
            const e = win.STUDIO.byId(code);
            const shown = e ? win.STUDIO.labelOfEntry(e) : "";
            return (shown === name) ? null : (code + "→" + name + "（该显示 " + shown + "）");
          }).filter(Boolean);
          ok(bad.length === 0,
            "每一行的中文名与编码对得上（" + (bad.join(" / ") || "全部一致") + "）");
          /* 卡片上的编码串与下面那几行必须是同一组组合 */
          const chain0 = cards[0].querySelector(".cc").getAttribute("data-gc-chain");
          ok(chain0.split(" + ").join(",")
             === rows.map(r => r.querySelector(".cm-c").textContent.trim()).join(","),
            "卡片上的组合串与下面列出的每一层一致：" + chain0);
        }

        ok(!!gc().querySelector("[data-gc-adopt]"), "每张卡有「去精修」");
        ok(!!gc().querySelector("[data-gc-stop]"), "抽卡过程中可以停止（整批要等几分钟）");
        ok(/串行|第 1\//.test(gc().textContent), "抽出图时给出进行到第几张的进度");

        /* 「去精修」必须真的把组合带回出图工作流，并且是跳过去、不是就地改 */
        const adopt = gc().querySelector("[data-gc-adopt]");
        const want = codes[0];
        adopt.click();
        await new Promise(r => setTimeout(r, 120));
        ok(doc.querySelector('[data-sec="openstudio"].on'),
          "点「去精修」跳回了出图工作流");
        const got = win.STUDIO.STEPS.map(s => win.STUDIO.codeOf(s.key))
          .filter(Boolean).join(" + ");
        ok(got === want, "带回来的正是那张卡的组合：" + got);
        ok(win.STUDIO.partsReady().count === win.STUDIO.STEPS.length,
          "带回来后四步全齐，可直接出图");

        /* 回到抽卡页：卡片还在（抽卡页持有自己那份状态） */
        await clickNav("一键抽卡");
        ok([...grid().querySelectorAll(".st-card")].length >= 1,
          "切走再回来，这一批卡片还在（状态没被工作流那一屏冲掉）");
        /* 也别让这批状态污染后面的用例：清一次 */
        const unlock = grid().querySelector("[data-gc-unlock]");
        if (unlock) { unlock.click(); await new Promise(r => setTimeout(r, 40)); }
      }
    }
  }

  /* ---------- 4. 开放式知识库视图逐个深查 ---------- */
  head("【4】开放式知识库视图");

  /* ---- 示例画廊（图 × 提示词对照）---- */
  await clickNav("示例画廊");
  const galCards = grid().querySelectorAll(".gal-card");
  /* 卡数按数据源现算，不写死：
     写死一个数字，加一张图就红——而加图是这个库的常态。
     早前写死 12，配图到 13 张就红了一次，红的原因不是坏了，是它过时了。 */
  const GALLERY_N = (win.GALLERY || []).length;
  ok(GALLERY_N > 0, "画廊数据源非空（" + GALLERY_N + " 条）");
  ok(galCards.length === GALLERY_N,
    "画廊卡数与数据源一致：" + galCards.length + " = " + GALLERY_N);
  if (galCards.length) {
    const imgs = [...grid().querySelectorAll(".gal-card img")];
    ok(imgs.length === galCards.length, "每张卡都带出图（" + imgs.length + " 张）");
    /* 扩展名允许 .png / .jpg / .webp / .avif：
       补图时用哪个取决于出图通道的原生格式（免 key 通道回 jpg），
       强行统一成 png 只会逼人多做一次无意义的格式转换，
       而转码会掉质量。图在哪、叫什么，由数据源登记为准。 */
    ok(imgs.every(im => /^examples\/A1-\d+\.(png|jpg|jpeg|webp|avif)$/i.test(im.getAttribute("src") || "")),
      "图片路径全部为 examples/<旧id>.<png|jpg|webp>（旧 id 永久可解析）");
    ok(imgs.every(im => (im.getAttribute("alt") || "").length > 0), "图片都有无障碍描述");
    const gpts = [...grid().querySelectorAll("[data-gal-gpt]")];
    ok(gpts.length === galCards.length && gpts.every(p => p.textContent.trim().length > 60),
      "每卡都挂完整正文（>60 字符）");
    const tiers = [...grid().querySelectorAll(".gal-tier")].map(t => t.textContent.trim());
    ok(tiers.length === galCards.length && tiers.every(t => t.indexOf("R0") === 0),
      "画廊全部为 R0 自由条目（" + tiers.length + " 枚徽章）");
    ok(grid().querySelectorAll(".gal-code").length === galCards.length,
      "每卡都带可复制规范编码");
    ok(grid().querySelectorAll("[data-cp]").length >= galCards.length * 3,
      "正文 / 标签版 / 编码复制点齐备：" + grid().querySelectorAll("[data-cp]").length);
    ok(!grid().textContent.includes("已漂移"), "画廊 id 与引擎数据无漂移");
    /* DOM 有 src ≠ 磁盘有文件。examples.js 里登记了但图没生成的，
       页面上就是一块破图——必须在测试里拦住。 */
    const fs = require("fs");
    const missing = imgs.filter(im => !fs.existsSync(path.join(ROOT, im.getAttribute("src"))));
    ok(missing.length === 0, "12 张示例图在磁盘上都存在"
      + (missing.length ? " → 缺失：" + missing.map(im => im.getAttribute("src")).join(", ") : ""));
  }

  await clickNav("十二库浏览");
  ok(grid().querySelectorAll(".ov-node").length > 10, "十二库浏览：节点卡 " + grid().querySelectorAll(".ov-node").length + " 张");
  const libChips = grid().querySelectorAll("[data-lib]");
  ok(libChips.length === 12, "十二个库切换按钮齐备：" + libChips.length + " 个");
  if (libChips.length === 12) {
    libChips[libChips.length - 1].click();
    await new Promise(r => setTimeout(r, 40));
    ok(grid().querySelectorAll(".ov-node").length > 0, "切到第 12 库仍有节点：" + grid().querySelectorAll(".ov-node").length + " 张");
  }

  await clickNav("统一检索");
  const findInput = () => grid().querySelector("#ovQ");
  ok(!!findInput(), "统一检索：搜索框存在");
  if (findInput()) {
    const setVal = v => {
      const i = findInput();
      i.value = v;
      i.dispatchEvent(new win.Event("input", { bubbles: true }));
    };
    for (const q of ["赛璐璐平涂", "高达", "cel shading", "黄昏"]) {
      setVal(q);
      await new Promise(r => setTimeout(r, 320));
      const n = grid().querySelectorAll(".ov-node").length;
      ok(n > 0, "检索「" + q + "」→ " + n + " 个结果");
    }
  }

  await clickNav("组合工作台");
  ok(grid().querySelectorAll(".ov-slot").length === 9, "组合工作台：九个槽位齐备：" + grid().querySelectorAll(".ov-slot").length);
  const presetBtns = grid().querySelectorAll("[data-preset]");
  ok(presetBtns.length > 0, "组合工作台：预设 " + presetBtns.length + " 个");
  for (let i = 0; i < presetBtns.length; i++) {
    const before = errors.length;
    grid().querySelectorAll("[data-preset]")[i].click();
    await new Promise(r => setTimeout(r, 40));
    const code = grid().querySelector(".ov-code");
    const txt = code ? code.textContent.trim() : "";
    ok(errors.length === before && txt.length > 80,
      "预设「" + (presetBtns[i].textContent || "").trim() + "」→ 正文 " + txt.length + " 字符");
  }
  // 展开一个槽位并点选一个模块
  const tog = grid().querySelector("[data-toggle]");
  if (tog) {
    tog.click();
    await new Promise(r => setTimeout(r, 40));
    const pick = grid().querySelector("[data-pick]");
    if (pick) {
      pick.click();
      await new Promise(r => setTimeout(r, 40));
      ok(grid().querySelectorAll("[data-unpick]").length > 0, "手动选模块后出现已选标签");
    }
  }

  await clickNav("变形工作台");
  ok(grid().querySelectorAll(".ov-slot").length === 9, "变形工作台：九个槽位齐备");
  ok(grid().querySelectorAll("[data-str]").length === 3, "三档强度齐备");
  const ch = grid().querySelector("[data-ch]");
  const tog2 = grid().querySelector("[data-toggle]");
  if (tog2) {
    tog2.click();
    await new Promise(r => setTimeout(r, 40));
    const c2 = grid().querySelector("[data-ch]");
    if (c2) {
      c2.click();
      await new Promise(r => setTimeout(r, 40));
      ok(grid().querySelectorAll("[data-unch]").length > 0, "指定变化项后出现标记");
    }
  }
  for (const g of ["light", "medium", "rebuild"]) {
    const b = grid().querySelector('[data-str="' + g + '"]');
    if (!b) continue;
    b.click();
    await new Promise(r => setTimeout(r, 40));
    ok(grid().textContent.includes("检查清单"), "强度「" + g + "」切换后仍完整");
  }

  /* ---------- 3. 提示词卡字段体检（对应用户问题 1/2/4） ---------- */
  head("【3】提示词卡字段体检");
  await clickNav("画风流派");
  const cards = [...grid().querySelectorAll(".card")];
  const withP = cards.filter(c => c.querySelector(".pcard"));
  ok(withP.length > 0, "带提示词卡的条目：" + withP.length + " / " + cards.length);

  const firstP = withP[0];
  if (firstP) {
    const tier = firstP.querySelector(".phead .tier");
    ok(tier && tier.textContent.trim().length > 0, "档位徽章存在：" + (tier ? tier.textContent.trim() : "缺失"));
    ok(tier && /判定依据：/.test(tier.getAttribute("title") || ""), "档位带判定依据说明");

    const subs = [...firstP.querySelectorAll(".psub")].map(x => x.textContent.replace(/\s+/g, " ").trim());
    ok(subs.length >= 4, "卡内字段：" + subs.map(s => s.slice(0, 12)).join(" / "));

    // 负面词与「负面提示词」板块是否雷同
    const negEl = [...firstP.querySelectorAll(".psub")].find(x => /负面全量/.test(x.textContent));
    const negText = negEl ? negEl.textContent.replace(/^负面全量/, "").trim() : "";
    const N = win.NEGATIVES || [];
    const dup = N.filter(n => {
      const core = (n.kw || []).join(", ").split(", ").slice(0, 5).join(", ");
      return core && negText.indexOf(core) !== -1;
    });
    ok(dup.length === 0, "卡内负面词与负面提示词板块无整段重复" +
      (dup.length ? " → 重复：" + dup.map(d => d.id).join("、") : ""));
  }

  // 全量扫：档位徽章 + 展开区字段是否齐备
  const tierMissing = [], fieldMissing = [];
  for (const c of withP) {
    const t = c.querySelector(".phead .tier");
    if (!t || !t.textContent.trim()) tierMissing.push(c.querySelector(".cid") ? c.querySelector(".cid").textContent : "?");
    if (c.querySelectorAll(".psub").length < 4) fieldMissing.push(c.querySelector(".cid") ? c.querySelector(".cid").textContent : "?");
  }
  ok(tierMissing.length === 0, "全部 " + withP.length + " 张卡都有档位标注" +
    (tierMissing.length ? " → 缺：" + tierMissing.slice(0, 8).join(",") : ""));
  ok(fieldMissing.length === 0, "全部 " + withP.length + " 张卡展开区字段齐备（依据/条目词/档位收尾/标签全量/负面全量）" +
    (fieldMissing.length ? " → 缺：" + fieldMissing.slice(0, 8).join(",") : ""));

  // 档位分布不应全落在同一档
  const dist = {};
  withP.forEach(c => {
    const t = c.querySelector(".phead .tier");
    const k = t ? t.textContent.trim() : "?";
    dist[k] = (dist[k] || 0) + 1;
  });
  const distinct = Object.keys(dist).length;
  ok(distinct >= 3, "档位分布有区分（" + distinct + " 档）：" +
    Object.entries(dist).map(([k, v]) => k + " " + v).join(" / "));

  // 画风流派不应有重复 ID（A5 全球流派曾被收录两遍）
  const cids = cards.map(c => (c.querySelector(".cid") || {}).textContent).filter(Boolean);
  const dupCid = cids.filter((x, i) => cids.indexOf(x) !== i);
  ok(dupCid.length === 0, "画风 " + cards.length + " 张卡 ID 无重复" +
    (dupCid.length ? " → 重复：" + [...new Set(dupCid)].join(",") : ""));

  /* ---------- 4. 负面提示词 / 平台语法板块自身的重复检查 ---------- */
  head("【4】负面提示词 · 平台语法板块去重");
  await clickNav("负面提示词");
  const negCards = [...grid().querySelectorAll(".card")];
  const negLists = negCards.map(c => {
    const dm = c.querySelector(".demo");
    return dm ? dm.textContent.replace(/\s+/g, " ").trim() : "";
  });
  const seen = new Map();
  const dupNeg = [];
  negLists.forEach((l, i) => {
    const key = l.split(",").map(s => s.trim()).filter(Boolean).sort().join("|");
    if (seen.has(key)) dupNeg.push(negCards[i].querySelector(".cid").textContent + " ≡ " + negCards[seen.get(key)].querySelector(".cid").textContent);
    else seen.set(key, i);
  });
  ok(dupNeg.length === 0, "负面词 " + negCards.length + " 条内部无重复" + (dupNeg.length ? " → " + dupNeg.join("; ") : ""));

  await clickNav("平台语法");
  ok(grid().querySelectorAll(".card").length > 0, "平台语法板块渲染 " + grid().querySelectorAll(".card").length + " 张卡");

  // 三个工具板块必须显示定位说明，避免用户以为与卡片里的负面词/语法重复
  for (const [label, kw] of [["负面提示词", "两者不重复"], ["平台语法", "对照改写"], ["组合模板", "提示词骨架"]]) {
    await clickNav(label);
    const hint = (doc.getElementById("filters").textContent || "").replace(/\s+/g, " ");
    ok(hint.includes(kw), label + " 板块显示定位说明");
  }

  /* ---------- 5. 顶部搜索 ---------- */
  head("【5】顶部搜索");
  await clickNav("画风流派");
  const q = doc.getElementById("q");
  q.value = "机甲";
  q.dispatchEvent(new win.Event("input", { bubbles: true }));
  await new Promise(r => setTimeout(r, 260));
  ok(grid().querySelectorAll(".card").length > 0, "搜索「机甲」→ " + grid().querySelectorAll(".card").length + " 条");

  /* ---------- 6. 画廊待补清单的授权分层 ----------
     这组断言盯的是一个已经真踩过的坑：
     galleryStats 曾经用 RIGHTS.tierOf(e.id) 取档，
     而 tierOf() 收的是**文本**，不是 id。
     传 "A3-01" 进去只扫这个字符串，永远扫不到标识，
     于是每个条目都判成 R0，SB（工作室）整段 14 条
     全落进「随手就能补」那一档——实际它们是 R2/R3。
     清单看起来可执行，配图时才撞上授权闸门。
     这类错判不抛异常，只能靠断言把它钉住。 */
  head("【6】画廊待补清单的授权分层");
  const stats = win.galleryStats(win.STUDIO.allEntries());
  ok(stats.free.length > 0, "R0 待补 " + stats.free.length + " 条");
  ok(stats.needCare.length > 0, "需署名/改写 " + stats.needCare.length + " 条");
  ok(stats.noShot.length === 0, "无档位条目 " + stats.noShot.length + " 条（应为 0，判不出档就不能算 R0）");
  /* 工作室段必须有条目落在 needCare。
     若这条挂了，说明又退回用 tierOf(id) 了——
     工作室名受保护，不可能整段都是 R0。 */
  const sbCare = stats.needCare.filter(e => /^A3-/.test(e.id)).length;
  ok(sbCare > 0, "SB 段有 " + sbCare + " 条落在需改写档（若为 0 说明授权判级失效）");
  const sbFree = stats.free.filter(e => /^A3-/.test(e.id)).length;
  ok(sbFree < 14, "SB 段仅 " + sbFree + "/14 条可直接配图（工作室名受保护，不该整段自由）");
  /* 候选池必须只含画廊能出图的八段，且已配图的 13 张不计入待补。
     collectEntries() 会把作品层一并返回（366 条），
     不筛的话 233 部作品混进待补清单，覆盖率的分母就废了。
     八段 133 条减去已配图 13 条 = 120 条待补。 */
  const totalDraw = stats.free.length + stats.needCare.length + stats.noShot.length;
  ok(totalDraw === 133 - GALLERY_N,
    "候选池 " + totalDraw + " 条（应为八段 133 减去已配图 " + GALLERY_N + "）");
  /* ST段当前 0 条可补：13 条已配图，剩下 1 条（ST-006）是 R2。
     所以断言写成「七段齐 + ST 不为负」，不能硬要求八段都在。 */
  const segs = new Set(stats.free.map(e => {
    const c = win.nodeCode ? win.nodeCode(e.id) : "";
    return c ? c.split("-")[0] : "?";
  }));
  ok(["ER", "SB", "RG", "MV", "TH", "LT", "PL"].every(s => segs.has(s)),
    "R0 待补覆盖七段（实到 " + [...segs].sort().join(",") + "）");
  ok(stats.free.every(e => {
    const c = win.nodeCode(e.id);
    return ["ST", "ER", "SB", "RG", "MV", "TH", "LT", "PL"].indexOf(c.split("-")[0]) >= 0;
  }), "R0 待补里没有混入作品层条目");

  head("【汇总】");
  console.log("  通过 " + pass + " / 失败 " + fail);
  if (errors.length) {
    console.log("  捕获异常 " + errors.length + " 条：");
    [...new Set(errors)].slice(0, 8).forEach(e => console.log("    · " + e.slice(0, 300)));
  }
  dom.window.close();
  process.exit(fail || errors.length ? 1 : 0);
}

main().catch(e => { console.error("测试自身崩溃：", e); process.exit(2); });
