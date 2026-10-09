/* ============================================================
 * tools/check_ids.js · 编号漂移体检
 * ============================================================
 * 编号是这个库对外承诺的稳定资产：「code 一旦发布不可改」。
 * 但有四类漂移**运行时全都不报错**，只有用户拿着编号来查时才炸：
 *
 *   A. WK 号重排 —— 作品号由「地区排序+段内序号」的位置决定，
 *      给中间地区段补一部新作品，后面全部作品号整体挪动。
 *      现由 code-map.js 的冻结名单（WORK_ORDER_FROZEN）挡住，
 *      本文件第 1、2 组盯名单本身与追加行为。
 *   B. 旧码写法漏登记 —— 每个旧号有四种写法（两位/三位 ×
 *      有无连字符），少登记一种，抄那种写法的用户就查不到。
 *   C. 引用悬空 —— 文档、画廊、正文里写着的编号，
 *      数据源里未必真有那条（写错号、删了条目没改文档）。
 *   D. 三源分叉 —— derive（codes.js 纯函数）/ forward（迁移表）/
 *      OLD_OF（登记表）是三条独立路径，逻辑漂移时各说各话。
 *   E. 地理编码失守 —— CN/JP 前缀表与数据脱节、组内序号不连续、
 *      与发布段码撞名、追加时挪旧号（第 10 组）。
 *
 * 每组断言对应一类。全绿代表：库里出现的每一个编号，
 * 无论新旧、无论写在哪个文件里，都指向同一个真实条目。
 *
 * 运行：node tools/check_ids.js
 * ============================================================ */
const fs = require("fs"), vm = require("vm"), path = require("path");
const L = require("./_loadlist.js");
const A = L.A;

let pass = 0, fail = 0;
function ok(cond, msg) { cond ? pass++ : (fail++, console.log("  ✗ " + msg)); }
function head(t) { console.log("\n" + t); }
function pad2(n) { let s = String(n); while (s.length < 2) s = "0" + s; return s; }
function pad3(n) { let s = String(n); while (s.length < 3) s = "0" + s; return s; }

/* ---------- 沙箱：与 check_codes.js 同一套载法 ---------- */
const ctx = vm.createContext({ console });
ctx.globalThis = ctx;
L.SANDBOX_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.PROMPT_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
L.PROMPT_ZH_FILES.forEach(f => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f }));
const dExpr = "globalThis.__d={" + L.DATA_NAMES.map(n => n + ":(typeof " + n + "!=='undefined'?" + n + ":[])").join(",") + "};";
vm.runInContext(dExpr, ctx);
vm.runInContext(fs.readFileSync(A("codes.js"), "utf8"), ctx, { filename: "codes.js" });
vm.runInContext(fs.readFileSync(A("code-map.js"), "utf8"), ctx, { filename: "code-map.js" });
vm.runInContext(fs.readFileSync(A("resolver.js"), "utf8"), ctx, { filename: "resolver.js" });
vm.runInContext(fs.readFileSync(A("registry.js"), "utf8"), ctx, { filename: "registry.js" });

const nodeFiles = fs.readdirSync(A(".")).filter(f => /^lib-.*\.js$/.test(f)).sort();
const NODES = [];
nodeFiles.forEach(f => {
  const m = require(A(f));
  Object.keys(m).forEach(k => { if (Array.isArray(m[k])) NODES.push(...m[k]); });
});

const D = ctx.__d;
const ENTRIES = [].concat(D.STYLES, D.WORKS_JP, D.WORKS_GLOBAL,
  D.WORKS_MORE_A, D.WORKS_EUR_W, D.WORKS_EUR_E, D.WORKS_NAMER,
  D.GENRES, D.LAYOUTS, D.PALETTES);
const TOOLS = [].concat(D.TEMPLATES, D.NEGATIVES, D.SYNTAX);

const CODES = ctx.CODES, CODE_MAP = ctx.CODE_MAP, RESOLVER = ctx.RESOLVER;
const REG = ctx.REGISTRY.boot({
  CODES: CODES, RESOLVER: RESOLVER, ENGINE: require(A("engine.js")).ENGINE,
  CODE_MAP: CODE_MAP, data: { entries: ENTRIES, tools: TOOLS }
});

/* 常用集合 */
const ALL = ENTRIES.concat(TOOLS);
const byId = {};
ALL.forEach(d => { if (d && d.id && !byId[d.id]) byId[d.id] = d; });
const dataIds = Object.keys(byId);
const works = dataIds.filter(id => /^W-[A-Z]\d{1,3}$/i.test(id));
const normWork = id => {
  const m = String(id).toUpperCase().match(/^W-([A-Z])-?(\d{1,3})$/);
  return m ? "W-" + m[1] + "-" + pad3(parseInt(m[2], 10)) : String(id).toUpperCase();
};
const codeOf = id => CODES.OLD_OF[id] || null;
const registeredCodes = new Set(RESOLVER.entries.map(e => e.code));

/* ---------- 【1】冻结名单 ↔ 数据一致 ---------- */
head("【1】WK 冻结名单与数据一致");
{
  const frozen = CODE_MAP.WORK_ORDER_FROZEN.map(normWork);
  const dataWorks = works.map(normWork);

  ok(frozen.length > 0, "冻结名单非空（" + frozen.length + " 条）");
  ok(frozen.every(id => /^W-[A-Z]-\d{3}$/.test(id)), "名单形态统一为 W-<地区>-三位");

  const dupF = frozen.filter((id, i) => frozen.indexOf(id) !== i);
  ok(dupF.length === 0, "名单无重复" + (dupF.length ? "（" + dupF.slice(0, 4).join(" ") + "）" : ""));

  const fSet = new Set(frozen), dSet = new Set(dataWorks);
  const missing = dataWorks.filter(id => !fSet.has(id));
  ok(missing.length === 0, missing.length === 0
    ? "数据里没有名单之外的作品（追加已发布）"
    : "名单外新作品 " + missing.length + " 部——把下面的行粘进 code-map.js 的 WORK_ORDER_FROZEN 末尾再发布：\n"
      + missing.map(id => '        "' + id + '",').join("\n"));

  const retired = frozen.filter(id => !dSet.has(id));
  ok(retired.length === 0, retired.length === 0
    ? "名单里的作品都在数据里（无悬空号）"
    : "名单里 " + retired.length + " 部已不在数据中（号悬空）："
      + retired.slice(0, 6).join(" ") + "——删除作品不会挪别人的号，但必须人工确认");

  /* 段内序号连续：ensureAll 按 1..max 整段登记，
     数据里有空缺的话，空缺号会拿到指向不存在条目的假映射。 */
  const bySeg = {};
  dataWorks.forEach(id => {
    const m = id.match(/^W-([A-Z])-(\d{3})$/);
    (bySeg[m[1]] = bySeg[m[1]] || []).push(parseInt(m[2], 10));
  });
  const gapped = [];
  Object.keys(bySeg).forEach(seg => {
    const seqs = bySeg[seg].sort((a, b) => a - b);
    for (let i = 1; i <= seqs[seqs.length - 1]; i++)
      if (seqs.indexOf(i) < 0) gapped.push(seg + pad3(i));
  });
  ok(gapped.length === 0, "各地区段序号连续无空缺"
    + (gapped.length ? "（空缺：" + gapped.slice(0, 8).join(" ") + "）" : ""));
}

/* ---------- 【2】WK 追加稳定（本文件最要紧的一组） ---------- */
head("【2】追加新作品不挪旧号（回归钉）");
{
  /* 在干净沙箱里单独跑 code-map.js，模拟「给中间地区段补新作品」：
     中国段 +1、韩国段 +1、全球段 +1。已发布的 233 个号一个都不许动。 */
  const c2 = vm.createContext({ console });
  c2.globalThis = c2;
  vm.runInContext(fs.readFileSync(A("code-map.js"), "utf8"), c2);
  const CM2 = c2.CODE_MAP;

  const srcIds = works.slice();                 // 数据源形态（W-J01）
  CM2.buildWorks(srcIds);
  const before = {};
  srcIds.forEach(id => { before[id] = CM2.forward(id); });
  const frozenBefore = CM2.workOrder().slice(0, CM2.WORK_ORDER_FROZEN.length).join(",");

  const fakes = ["W-C22", "W-K07", "W-G13"];    // 三个地区的追加
  CM2.buildWorks(srcIds.concat(fakes));

  let moved = [];
  srcIds.forEach(id => { if (CM2.forward(id) !== before[id]) moved.push(id); });
  ok(moved.length === 0, moved.length === 0
    ? "追加 " + fakes.join("/") + " 后，原有 " + srcIds.length + " 部作品的号全部未动"
    : "有 " + moved.length + " 部被挪号！如 " + moved.slice(0, 6).join(" ")
      + "（冻结名单可能被绕过或被重排）");

  ok(CM2.workOrder().slice(0, CM2.WORK_ORDER_FROZEN.length).join(",") === frozenBefore,
    "名单前缀顺序逐位未变");

  /* 追加号连续、且按地区排序给出确定顺序：C( rank2 ) < K( rank3 ) < G( rank10 ) */
  const got = fakes.map(f => CM2.forward(f));
  ok(got.every(Boolean), "新作品全部拿到号：" + fakes.map((f, i) => f + "→" + got[i]).join(" "));
  const seqs = got.filter(Boolean).map(c => parseInt(c.slice(3), 10));
  const contiguous = seqs.every((v, i) => v === works.length + 1 + i);
  ok(contiguous, "追加号从 " + (works.length + 1) + " 起连续（" + seqs.join(",") + "）");
}

/* ---------- 【3】旧号四写法全覆盖 ---------- */
head("【3】每个旧号的四种写法都能解析到本条");
{
  /* 两位/三位 × 有无连字符。序号 ≥100 时两位写法与三位相同，去重即可。 */
  let missing = [];
  ALL.forEach(d => {
    const id = String(d.id).toUpperCase();
    const m = id.match(/^(A[1-5]|G|LT|PL|T|N|S|W-[A-Z])-?(\d{1,3})$/);
    if (!m || !codeOf(d.id)) return;
    const seg = m[1], seq = parseInt(m[2], 10);
    const want = codeOf(d.id);
    [seg + "-" + pad3(seq), seg + "-" + pad2(seq), seg + pad3(seq), seg + pad2(seq)]
      .forEach(v => {
        if (CODE_MAP.forward(v) !== want) missing.push(v + " ≠ " + want);
      });
  });
  ok(missing.length === 0, missing.length === 0
    ? ALL.filter(d => codeOf(d.id)).length + " 个旧号 × 四写法全部命中"
    : missing.length + " 个写法解析错位，如：" + missing.slice(0, 6).join("; "));
}

/* ---------- 【4】迁移表无悬空 ---------- */
head("【4】迁移表每个值都指向真实存在的码");
{
  const dangling = [];
  Object.keys(CODE_MAP.LEGACY).forEach(k => {
    if (!registeredCodes.has(CODE_MAP.LEGACY[k])) dangling.push(k + "→" + CODE_MAP.LEGACY[k]);
  });
  ok(dangling.length === 0, dangling.length === 0
    ? "LEGACY " + CODE_MAP.count() + " 键全部指向已登记条目"
    : dangling.length + " 个悬空映射，如：" + dangling.slice(0, 6).join("; "));
}

/* ---------- 【5】非作品段序号连续（无假映射） ---------- */
head("【5】非作品段序号连续，整段登记无假号");
{
  const LEGACY_SEGS = ["A1", "A2", "A3", "A4", "A5", "G", "LT", "PL", "T", "N", "S"];
  const gapped = [];
  LEGACY_SEGS.forEach(seg => {
    const seqs = [];
    dataIds.forEach(id => {
      const m = id.toUpperCase().match(new RegExp("^" + seg + "-?(\\d{1,3})$"));
      if (m) seqs.push(parseInt(m[1], 10));
    });
    if (!seqs.length) return;
    const max = Math.max.apply(null, seqs);
    for (let i = 1; i <= max; i++) if (seqs.indexOf(i) < 0) gapped.push(seg + "-" + pad2(i));
  });
  ok(gapped.length === 0, gapped.length === 0
    ? LEGACY_SEGS.join("/") + " 各段连续"
    : "有空缺（空缺号会拿到指向空条的映射）：" + gapped.slice(0, 8).join(" "));
}

/* ---------- 【6】三源一致：derive / forward / OLD_OF ---------- */
head("【6】三条编号路径逐条互证");
{
  let bad = [];
  dataIds.forEach(id => {
    const a = codeOf(id);
    const b = CODES.derive(id);
    const c = CODE_MAP.forward(id);
    if (!a) { bad.push(id + ": OLD_OF 缺"); return; }
    if (a !== b) bad.push(id + ": derive=" + b + " ≠ OLD_OF=" + a);
    if (a !== c) bad.push(id + ": forward=" + c + " ≠ OLD_OF=" + a);
  });
  ok(bad.length === 0, bad.length === 0
    ? dataIds.length + " 条 三源一致"
    : bad.length + " 条分叉，如：" + bad.slice(0, 6).join("; "));

  /* nodeCode() 的静默兜底（OLD_OF[id] || id）靠这条兜底前先保证全覆盖 */
  const noOld = dataIds.filter(id => !CODES.OLD_OF[id]);
  ok(noOld.length === 0, "OLD_OF 全覆盖（" + dataIds.length + " 条）"
    + (noOld.length ? "，缺：" + noOld.slice(0, 5).join(" ") : ""));
}

/* ---------- 【7】画廊引用 ---------- */
head("【7】示例画廊引用的条目真实存在");
{
  const GALLERY = require(A("examples.js")).GALLERY || [];
  const noEnt = GALLERY.filter(g => !byId[g.id]);
  ok(GALLERY.length > 0 && noEnt.length === 0, noEnt.length === 0
    ? "画廊 " + GALLERY.length + " 条引用全部命中"
    : "画廊引用了不存在的条目：" + noEnt.map(g => g.id).join(" "));
  /* 图文件名必须用旧 id（重排不至于让图与词条错位的那条约定）。
     img 为 null 的待配图条目无文件名可查，跳过。 */
  const badImg = GALLERY.filter(g => {
    if (!g.img) return false;
    const base = String(g.img).replace(/^examples\//, "").replace(/\.(png|jpg|jpeg)$/i, "");
    return base !== g.id;
  });
  ok(badImg.length === 0, "图文件名与旧 id 一致"
    + (badImg.length ? "（" + badImg.map(g => g.img).join(" ") + "）" : ""));
}

/* ---------- 【8】GPT 正文 id 无孤儿、无同 id 异文 ---------- */
head("【8】GPT 正文引用与数据源对齐");
{
  const sets = ctx.PROMPT_SETS || [];
  const seen = {};
  const orphan = [], conflict = [];
  let total = 0;
  sets.forEach(set => (set || []).forEach(p => {
    if (!p || !p.id) return;
    total++;
    if (!byId[p.id]) { orphan.push(p.id); return; }
    if (seen[p.id] && seen[p.id].gpt !== p.gpt) conflict.push(p.id);
    seen[p.id] = p;
  }));
  ok(orphan.length === 0, orphan.length === 0
    ? "正文 " + total + " 条的 id 全部存在于数据源"
    : "正文引用了不存在的条目：" + [...new Set(orphan)].slice(0, 6).join(" "));
  ok(conflict.length === 0, conflict.length === 0
    ? "同一 id 的多份正文内容一致（" + Object.keys(seen).length + " 个 id）"
    : "同 id 不同文（改了一份忘了另一份）：" + conflict.slice(0, 6).join(" "));
}

/* ---------- 【9】全库文本里的编号引用都能解析 ---------- */
head("【9】全库文本引用扫描");
{
  /* 合法引用全集：条目/工具的 id、规范码、四写法；节点的 id、规范码、组码。 */
  const valid = new Set();
  dataIds.forEach(id => {
    valid.add(id.toUpperCase());
    const c = codeOf(id);
    if (c) {
      valid.add(c.toUpperCase());
      const m = id.toUpperCase().match(/^(A[1-5]|G|LT|PL|T|N|S|W-[A-Z])-?(\d{1,3})$/);
      if (m) {
        [pad3(+m[2]), pad2(+m[2])].forEach(p => {
          valid.add((m[1] + "-" + p).toUpperCase());
          valid.add((m[1] + p).toUpperCase());
        });
      }
    }
  });
  NODES.forEach(n => {
    if (!n || !n.id) return;
    valid.add(String(n.id).toUpperCase());
    const c = CODES.OLD_OF[n.id];
    if (c) {
      valid.add(c.toUpperCase());
      const parts = c.split("-");
      if (parts.length >= 3) valid.add((parts[0] + "-" + parts[1] + "-000").toUpperCase());
    }
  });

  const TOKEN = /\b(?:W-(?:[A-Z]-?\d{1,3}|[A-Z]\d{1,3})|A[1-5]-?\d{1,3}|A[1-5]\d{1,3}|G-?\d{1,3}|G\d{1,3}|T-?\d{1,3}|N-?\d{1,3}|S-?\d{1,3}|(?:ST|ER|SB|RG|MV|TH|LT|PL|WK|TP|NG|SY|FD|GC|EN|VS|VX|CB|WD|SN|LN|MX|PR|RX|RC)-\d{1,3}(?:-\d{1,3}){0,2})\b/gi;

  /* 白名单：编号确实解析不了、但必须保留原文的地方。
     ALLOWED      —— 全局豁免的裸词（真实世界的术语，恰好长得像编号）；
     ALLOWED_FILE —— 只在某文件里豁免（键 = 相对路径，值 = 正则数组）。
     每一条都必须写明原因，没有原因的豁免等于给漂移开后门。 */
  const ALLOWED = {
    "T5": "Flux 的 T5 编码器，机器学习术语，恰好形似 TP-005 的裸写法",
    "A24": "制片公司 A24（《地狱客栈》出品方），恰好形似 ER-024 的裸写法"
  };
  const ALLOWED_FILE = {
    "assets/code-map.js": [/^W-K07$/],          /* 注释里「给韩国段补一部 W-K07」的追加示例 */
    "assets/data-prompts-ln1.js": [/^N17$/],    /* 「W-N01~N17」范围记法的后半段 */
    "assets/studio.js": [/^G2$/],               /* 局部变量名 var g2 */
    "tools/check_gacha.js": [/^T0$/],           /* 计时变量名 t0 */
    "tools/ui_test.js": [/^T169$/, /^G2$/],     /* 变量名 t169 / 解构参数 g2 */
    "tools/check_model_prompts.js": [/^ST-999$/], /* 故意的「未知编码」负向用例 */
    "codex-skill/anime-prompt-forge/scripts/forge.js": [/^TH-020-2$/], /* 文件名「组合串-2」后缀示例 */
    /* check_skill 里的 /ST-01[0-4]/ 之类是正则前缀片段，被词边界截断 */
    "tools/check_skill.js": [/^(ST|TH|LT|PL)-0?0?$/],
    /* codes.js 注释在复述一个历史 bug：「LT-001 曾被误补成 LT-001-000」，
       引用这个错误形态恰恰是为了防止它复发 */
    "assets/codes.js": [/^LT-001-000$/]
  };

  const files = [];
  const walk = (dir, rel) => {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      const r = rel ? rel + "/" + f : f;
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        if (/^(node_modules|\.workbuddy|shots|examples|\.tmp)$/i.test(f)) return;
        walk(p, r);
      } else if (/\.(md|html|js)$/i.test(f)) {
        if (/^tools[\\/]check_ids\.js$/.test(r)) return;         // 本文件自身
        if (/^codex-skill[\\/]anime-prompt-forge[\\/]references[\\/]/.test(r)) return; // 构建产物
        if (/\.work-order\.tmp/.test(f)) return;
        files.push([p, r]);
      }
    });
  };
  walk(path.join(__dirname, ".."), "");

  /* 判定有两级，缺一不可：
     1) 字符串集合 —— 全部登记形态的快速通道；
     2) RESOLVER.resolve —— 简写（ST-1）、节点组（CB-001）、
        以及 kw 命中（"transformers g1" → WK-149）这类派生形态。
        不能只靠 resolve：G1/T5 这类裸词可能撞上真实词条，
        也可能撞不上；集合负责「该在的都在」，resolve 负责「派生形态也算」，
        两者都查不到才算引用悬空。 */
  const bad = [];
  let checked = 0;
  files.forEach(([p, r]) => {
    const lines = fs.readFileSync(p, "utf8").split("\n");
    lines.forEach((ln, i) => {
      let m;
      TOKEN.lastIndex = 0;
      while ((m = TOKEN.exec(ln))) {
        checked++;
        const tok = m[0].toUpperCase();
        if (valid.has(tok)) continue;
        if (RESOLVER.resolve(m[0]).ok) continue;
        if (ALLOWED[tok]) continue;
        if ((ALLOWED_FILE[r] || []).some(re => re.test(tok))) continue;
        bad.push(r + ":" + (i + 1) + " " + m[0]
          + "  ┃ " + ln.trim().replace(/\s+/g, " ").slice(0, 90));
      }
    });
  });
  ok(bad.length === 0, bad.length === 0
    ? "扫描 " + files.length + " 个文件，所有编号引用均可解析"
    : bad.length + " 处引用解析不了（写错号或条目已删）：\n    "
      + bad.slice(0, 100).join("\n    ") + (bad.length > 100 ? "\n    …共 " + bad.length + " 处" : ""));
}

/* ---------- 【10】地理编码（派生层） ---------- */
head("【10】地理编码 CN/JP/KR… 与发布码互不干扰");
{
  /* 地理编码是给配图排序归类用的派生字段（CN-001、JP-001…），
     不是发布码。四件事必须钉住：
     a) 前缀表与数据的地区字母双向对齐——新字母没进表会静默返回 null；
     b) 组内序号唯一且连续——geo 码出现重复/空缺就没有归类价值；
     c) 前缀绝不与任何已发布段码撞名——否则两套号在用户眼里无法区分；
     d) 追加稳定——新作品拿组内下一个号，旧 geo 一个不动。 */
  const worksNorm = CODE_MAP.workOrder();
  const geoAll = CODE_MAP.geoList();

  /* a) 双向对齐 + 与 WORK_ORDER 等长无空 */
  const lettersInData = new Set(worksNorm.map(id => id.match(/^W-([A-Z])/)[1]));
  const lettersInTable = new Set(Object.keys(CODE_MAP.GEO_PREFIX).map(k => k.match(/^W-([A-Z])/)[1]));
  const untabled = [...lettersInData].filter(l => !lettersInTable.has(l));
  const deadKey = [...lettersInTable].filter(l => !lettersInData.has(l));
  ok(untabled.length === 0 && deadKey.length === 0,
    (untabled.length ? "数据里有字母没进 GEO_PREFIX：" + untabled.join(",") + "；" : "")
    + (deadKey.length ? "表里有键已无对应数据：" + deadKey.join(",") : "")
    || "前缀表与数据的地区字母双向对齐（" + lettersInData.size + " 个字母）");
  ok(geoAll.length === worksNorm.length && geoAll.every(Boolean),
    "geoList 与 WORK_ORDER 等长（" + geoAll.length + "）且无空值");

  /* b) 全局唯一 + 组内连续 */
  const dup = geoAll.length !== new Set(geoAll).size;
  const byGeoSeg = {};
  geoAll.forEach(g => {
    const m = g.match(/^([A-Z]{2})-(\d{3})$/);
    (byGeoSeg[m[1]] = byGeoSeg[m[1]] || []).push(parseInt(m[2], 10));
  });
  const gapOrDup = [];
  Object.keys(byGeoSeg).forEach(p => {
    const seqs = byGeoSeg[p].sort((a, b) => a - b);
    for (let i = 1; i <= seqs.length; i++)
      if (seqs[i - 1] !== i) { gapOrDup.push(p + "-" + pad3(i)); break; }
  });
  ok(!dup && gapOrDup.length === 0,
    (dup ? "geo 码有重复；" : "") + (gapOrDup.length ? "组内不连续：" + gapOrDup.join(",") : "")
    || Object.keys(byGeoSeg).length + " 个地区组，序号各自从 1 连续（"
    + Object.keys(byGeoSeg).map(p => p + "×" + byGeoSeg[p].length).join(" ") + "）");

  /* c) 前缀不与已发布段码撞名 */
  const pubSegs = new Set(Object.keys(CODES.CODE_OF).map(c => c.split("-")[0]));
  const clash = Object.keys(CODE_MAP.GEO_PREFIX)
    .map(k => CODE_MAP.GEO_PREFIX[k].p)
    .filter(p => pubSegs.has(p));
  ok(clash.length === 0, clash.length === 0
    ? "geo 前缀（" + [...new Set(Object.values(CODE_MAP.GEO_PREFIX).map(g => g.p))].join(",") + "）不与任何发布段码撞名"
    : "geo 前缀撞上发布段：" + clash.join(",") + "——两套号用户无法区分，必须换前缀");

  /* d) 追加稳定（与第 2 组同一手法，geo 版回归钉） */
  const c10 = vm.createContext({ console });
  c10.globalThis = c10;
  vm.runInContext(fs.readFileSync(A("code-map.js"), "utf8"), c10);
  const CM10 = c10.CODE_MAP;
  CM10.buildWorks(CM10.WORK_ORDER_FROZEN.slice());
  const before10 = {};
  CM10.workOrder().forEach(id => { before10[id] = CM10.geoOf(id); });
  const fakes10 = ["W-K07", "W-C22", "W-J113"];
  CM10.buildWorks(CM10.WORK_ORDER_FROZEN.concat(fakes10));
  let moved10 = 0;
  CM10.workOrder().slice(0, CM10.WORK_ORDER_FROZEN.length)
    .forEach(id => { if (CM10.geoOf(id) !== before10[id]) moved10++; });
  ok(moved10 === 0, moved10 === 0
    ? "追加 " + fakes10.join("/") + " 后，原 " + CM10.WORK_ORDER_FROZEN.length + " 个 geo 码全部未动"
    : moved10 + " 个 geo 码被挪动——派生层也必须追加稳定");
  const got10 = fakes10.map(f => CM10.geoOf(f));
  ok(got10.join(",") === "KR-007,CN-022,JP-113",
    "新作品拿到组内下一个号：" + fakes10.map((f, i) => f + "→" + (got10[i] || "null")).join(" "));
}

/* ---------- 汇总 ---------- */
console.log("\n" + (fail === 0 ? "全绿：" : "有失败：") + pass + " 通过 / " + fail + " 失败");
process.exit(fail === 0 ? 0 : 1);