/* ============================================================
 * 开放式知识库 · 界面层
 * 依赖（由 index.html 内联脚本提供的全局）：esc / copy / toast / el / state
 * 依赖数据：ENGINE（务必在本文件之前加载 assets/engine.js）
 * 四个视图：十二库浏览 / 统一检索 / 组合工作台 / 变形工作台
 * file:// 直接打开也可用，不使用 fetch 与 ES module。
 * ============================================================ */

var OPEN_VIEWS = [
  /*画廊排第一：它是全库唯一的「图 → 词」入口，
     打开页面先看到真东西，再决定要不要进工作流。
     纯文字的检索和总览放在最后——那些是查细节用的，不是起点。 */
  { key: "opengallery", name: "示例画廊", desc: "提示词 × 实际出图对照" },
  { key: "openstudio",  name: "出图工作流", desc: "四步选完，直接出可复制的提示词" },
  { key: "opengacha",   name: "一键抽卡",   desc: "从库存里随机抽组合，连着出图" },
  { key: "opencode",  name: "编码工作台", desc: "用编码或中文名直接组串" },
  { key: "opentable", name: "编码总览",   desc: "各段编码范围与数量" },
  { key: "openrights", name: "授权与商用", desc: "R0–R3 分档与去标识化" },
  { key: "openlibs",    name: "十二库浏览", desc: "按库逐层查看全部节点" },
  { key: "openfind",    name: "统一检索",   desc: "名称 / 别名 / 跨语言 / 描述式" },
  { key: "opencompose", name: "组合工作台", desc: "九个槽位装配出一条提示词" },
  { key: "openmorph",   name: "变形工作台", desc: "保留项 / 变化项 / 强度" }
];

var OP = {
  lib: "01",
  parentFilter: "全部",
  slotFilter: "全部",
  picks: {},
  basePicks: {},
  change: {},
  keep: [],
  strength: "medium",
  findQ: "",
  openPicker: null
};

/* ---------- 注入本视图专用样式 ---------- */
(function injectOpenCss() {
  var s = document.createElement("style");
  s.textContent = [
    ".ov-wrap{grid-column:1/-1;display:flex;flex-direction:column;gap:12px}",
    ".ov-bar{display:flex;gap:7px;flex-wrap:wrap;align-items:center}",
    ".ov-bar .lbl{font-size:11px;color:var(--dim2);letter-spacing:.8px;margin-right:2px}",
    ".ov-title{font-size:15px;font-weight:600}",
    ".ov-sub{font-size:12px;color:var(--dim2);line-height:1.6}",
    ".ov-panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:9px}",
    ".ov-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}",
    ".ov-node{background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 11px;display:flex;flex-direction:column;gap:5px}",
    ".ov-node.on{border-color:var(--accent);background:rgba(124,92,255,.10)}",
    ".ov-node h4{font-size:13px;font-weight:600;display:flex;justify-content:space-between;gap:8px;align-items:baseline}",
    ".ov-node h4 em{font-style:normal;font-size:10px;color:var(--dim2);font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".ov-node p{font-size:11.5px;color:var(--dim);line-height:1.6}",
    ".ov-node .path{font-size:10px;color:var(--dim2)}",
    ".ov-kws{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}",
    ".ov-kw{background:#0b0d12;border:1px solid var(--line);color:#b9c0d0;font-size:10px;padding:2px 6px;border-radius:4px;font-family:ui-monospace,Menlo,Consolas,monospace;cursor:pointer}",
    ".ov-kw:hover{border-color:var(--accent2);color:var(--accent2)}",
    ".ov-slot{border:1px solid var(--line);border-radius:8px;padding:9px 11px;background:var(--panel2)}",
    ".ov-slot .hd{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;font-weight:600}",
    ".ov-slot .hd i{font-style:normal;font-size:10.5px;color:var(--dim2);font-weight:400}",
    ".ov-pick{max-height:150px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}",
    ".ov-pick.off{display:none}",
    ".ov-code{background:#0b0d12;border:1px solid var(--line);border-radius:6px;padding:10px 11px;font-size:11px;line-height:1.7;color:#c6cddf;font-family:ui-monospace,Menlo,Consolas,monospace;word-break:break-word;white-space:pre-wrap}",
    ".ov-grade{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;padding:3px 10px;border-radius:20px;border:1px solid}",
    ".g-ok{color:#34d399;border-color:#34d399;background:rgba(52,211,153,.10)}",
    ".g-tune{color:#fbbf24;border-color:#fbbf24;background:rgba(251,191,36,.10)}",
    ".g-conflict{color:#f87171;border-color:#f87171;background:rgba(248,113,113,.10)}",
    ".g-unknown{color:#99a1b3;border-color:#4a5364;background:rgba(153,161,179,.08)}",
    ".ov-warn{font-size:11.5px;color:#fca5a5;background:rgba(248,113,113,.08);border-left:2px solid #f87171;padding:6px 10px;border-radius:0 4px 4px 0;line-height:1.6}",
    ".ov-note{font-size:11.5px;color:var(--warn);background:rgba(251,191,36,.07);border-left:2px solid var(--warn);padding:6px 10px;border-radius:0 4px 4px 0;line-height:1.6}",
    ".ov-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
    "@media(max-width:900px){.ov-two{grid-template-columns:1fr}}",
    ".ov-badge{font-size:10px;color:var(--accent2);background:rgba(34,211,238,.10);border:1px solid rgba(34,211,238,.35);padding:1px 6px;border-radius:4px}",

    /* ---- 示例画廊 ---- */
    ".gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}",
    ".gal-card{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}",
    ".gal-card img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;cursor:zoom-in;background:#0b0d12}",
    ".gal-body{padding:11px 13px 13px;display:flex;flex-direction:column;gap:8px;flex:1}",
    ".gal-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px}",
    ".gal-head .t{font-size:14px;font-weight:600}",
    ".gal-head .t i{font-style:normal;font-size:10.5px;color:var(--dim2);margin-left:6px}",
    ".gal-meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center}",
    ".gal-code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10.5px;color:var(--accent2);border:1px solid rgba(34,211,238,.35);background:rgba(34,211,238,.08);padding:1px 7px;border-radius:4px;cursor:pointer}",
    ".gal-code:hover{background:rgba(34,211,238,.2)}",
    ".gal-tier{font-size:10px;padding:1px 7px;border-radius:4px;border:1px solid}",
    ".gal-tier.R0{color:#34d399;border-color:rgba(52,211,153,.4);background:rgba(52,211,153,.08)}",
    ".gal-tier.R1{color:#60a5fa;border-color:rgba(96,165,250,.4);background:rgba(96,165,250,.08)}",
    ".gal-tier.R2{color:#fbbf24;border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.08)}",
    ".gal-tier.R3{color:#f87171;border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.08)}",
    ".gal-note{font-size:11.5px;line-height:1.7;color:var(--dim);background:var(--panel2);border-left:2px solid var(--accent);padding:6px 10px;border-radius:0 4px 4px 0}",
    ".gal-prompt{font-size:11.5px;line-height:1.7;color:#c6cddf;background:#0b0d12;border:1px solid var(--line);border-radius:8px;padding:9px 11px;max-height:150px;overflow-y:auto}",
    ".gal-foot{display:flex;gap:7px;margin-top:auto;flex-wrap:wrap}",
    ".gal-foot .btn{font-size:11px;padding:4px 10px}",

    /* ---- 配图进度（长期补图的进度条，不是装饰） ---- */
    ".gal-plan{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:12px 0;display:flex;flex-direction:column;gap:8px}",
    ".gal-plan-h{font-size:12.5px;font-weight:600;color:var(--txt)}",
    ".gal-bar{height:6px;border-radius:3px;background:var(--panel2);overflow:hidden}",
    ".gal-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2))}",
    ".gal-plan-n{font-size:11.5px;color:var(--dim)}",
    ".gal-plan-n b{color:var(--accent2);font-weight:600}",
    ".gal-plan-l{display:flex;gap:6px;flex-wrap:wrap}",
    ".gal-tag{font-size:10.5px;padding:2px 8px;border-radius:10px;border:1px solid var(--line);color:var(--dim2);background:var(--panel2)}",
    ".gal-tag.gal-ok{color:#34d399;border-color:rgba(52,211,153,.4);background:rgba(52,211,153,.08)}",
    ".gal-tag.gal-warn{color:#fbbf24;border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.08)}",
    ".gal-plan-s{font-size:11px;color:var(--dim2);line-height:1.7}",
    ".gal-plan-s code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10.5px;background:var(--panel2);padding:1px 5px;border-radius:3px}"
  ].join("\n");
  document.head.appendChild(s);
})();

/* ---------- 小工具 ---------- */
function ovGradeCls(g) { return { ok: "g-ok", tune: "g-tune", conflict: "g-conflict", unknown: "g-unknown" }[g] || "g-unknown"; }
function ovGradeZh(g) { return { ok: "可直接出图", tune: "需要微调", conflict: "存在冲突", unknown: "证据不足" }[g] || "未知"; }
function ovSlotZh(k) { return (ENGINE.SLOT_META[k] && ENGINE.SLOT_META[k].zh) || k; }
function ovSlotHint(k) { return (ENGINE.SLOT_META[k] && ENGINE.SLOT_META[k].hint) || ""; }

/* 旧 id → 规范编码。码表不可用时回退显示旧 id，
   宁可显示旧形态，也不要让标题右侧空着（那会像加载失败）。

   条目与节点都能用：两者在 CODES.OLD_OF 里都是键。
   早前检索结果的条目分支直接输出 h.id，导致同一页里
   节点显示 A1-001、条目却显示 A1-01，两套标识混排。 */
function nodeCode(id) {
  return (typeof CODES !== "undefined" && CODES.OLD_OF[id]) || id;
}

function ovNodeHtml(n, selected) {
  /* 节点标题右上角显示规范编码（旧 ID 降为次要）——
     编码是引用时要用的那个，节点树里的 n.id 只适合内部定位。 */
  return '<div class="ov-node' + (selected ? " on" : "") + '" data-node="' + esc(n.id) + '">'
    + '<h4>' + esc(n.zh) + '<em>' + esc(nodeCode(n.id)) + '</em></h4>'
    + '<div class="path">' + esc(n.path || "") + '</div>'
    + (n.desc ? '<p>' + esc(n.desc) + '</p>' : "")
    + (n.kw && n.kw.length
        ? '<div class="ov-kws">' + n.kw.map(function (k) {
            return '<span class="ov-kw" data-cp="' + esc(k) + '" title="点击复制">' + esc(k) + '</span>';
          }).join("") + '</div>'
        : "")
    + (n.slot ? '<div><span class="ov-badge">可作 ' + esc(ovSlotZh(n.slot)) + '</span></div>' : "")
    + '</div>';
}

function ovBindCopy(root) {
  root.querySelectorAll("[data-cp]").forEach(function (b) {
    b.onclick = function (e) { e.stopPropagation(); copy(b.dataset.cp); };
  });
}

/* ============================================================
 * 视图一：十二库浏览
 * ============================================================ */
function openRenderLibs() {
  var libs = ENGINE.LIBS;
  var lib = libs.filter(function (l) { return l.num === OP.lib; })[0] || libs[0];
  var all = ENGINE.NODES.filter(function (n) { return n.lib === lib.num; });
  var tops = all.filter(function (n) { return !n.up; });
  var list = OP.parentFilter === "全部"
    ? all
    : all.filter(function (n) { return n.up === OP.parentFilter || n.id === OP.parentFilter; });

  var bar = '<div class="ov-bar"><span class="lbl">选择库</span>' + libs.map(function (l) {
      return '<button class="chip' + (l.num === OP.lib ? " on" : "") + '" data-lib="' + l.num + '">'
        + esc(l.num + " " + l.zh) + '</button>';
    }).join("") + '</div>';

  var sub = '<div class="ov-bar"><span class="lbl">分支</span>'
    + '<button class="chip' + (OP.parentFilter === "全部" ? " on" : "") + '" data-par="全部">全部 ' + all.length + '</button>'
    + tops.map(function (t) {
        return '<button class="chip' + (OP.parentFilter === t.id ? " on" : "") + '" data-par="' + esc(t.id) + '">'
          + esc(t.zh) + '</button>';
      }).join("") + '</div>';

  var body = '<div class="ov-panel">'
    + '<div class="ov-title">' + esc(lib.zh) + ' <span class="ov-sub" style="font-weight:400">'
    + esc(lib.en) + ' · ' + all.length + ' 个节点</span></div>'
    + '<div class="ov-sub">' + esc(lib.role) + '</div>'
    + '</div>'
    + (list.length
        ? '<div class="ov-grid">' + list.map(function (n) { return ovNodeHtml(n, false); }).join("") + '</div>'
        : '<div class="empty">该分支暂无节点</div>');

  el("grid").innerHTML = '<div class="ov-wrap">' + bar + sub + body + '</div>';

  el("grid").querySelectorAll("[data-lib]").forEach(function (b) {
    b.onclick = function () { OP.lib = b.dataset.lib; OP.parentFilter = "全部"; openRenderLibs(); };
  });
  el("grid").querySelectorAll("[data-par]").forEach(function (b) {
    b.onclick = function () { OP.parentFilter = b.dataset.par; openRenderLibs(); };
  });
  ovBindCopy(el("grid"));
  el("filters").innerHTML = "";
  ovStat("库 " + lib.num + " · " + list.length + " / " + all.length + " 节点");
}

function ovStat(txt) { el("stat").innerHTML = txt; }

/* ============================================================
 * 视图二：统一检索
 * ============================================================ */
function openRenderFind() {
  var q = OP.findQ;
  var box = '<div class="ov-panel">'
    + '<div class="ov-title">统一检索</div>'
    + '<div class="ov-sub">六个入口互为备份：名称、别名、跨语言、描述式、以图入口、空结果兜底。'
    + '找不到往往不是没有，是入口选错了。</div>'
    + '<input id="ovQ" class="search" style="width:100%" placeholder="输入作品名 / 别名 / 英文关键词 / 一句描述…" value="' + esc(q) + '">'
    + '<div class="ov-bar"><span class="lbl">试试</span>'
    + ["赛璐璐平涂", "机动战士高达 0079", "cel shading", "黄昏", "对手"]
      .map(function (t) { return '<button class="chip" data-seed="' + esc(t) + '">' + esc(t) + '</button>'; }).join("")
    + '</div></div>';

  if (!q.trim()) {
    el("grid").innerHTML = '<div class="ov-wrap">' + box
      + '<div class="empty">输入关键词开始检索</div></div>';
    el("filters").innerHTML = "";
    ovStat("请输入关键词");
    wireFindBox();
    return;
  }

  var r = ENGINE.retrieve(q);
  var entries = r.hits.filter(function (h) { return h.kind === "entry"; });
  var nodes = r.hits.filter(function (h) { return h.kind === "node"; });

  var readyHtml = entries.length
    ? '<div class="ov-panel"><div class="ov-title">已有提示词卡 · ' + entries.length + ' 条<span class="ov-sub" style="font-weight:400"> 直接可复制</span></div>'
      + '<div class="ov-grid">' + entries.slice(0, 24).map(function (h) {
          return '<div class="ov-node" data-goto="' + esc(h.id) + '">'
            + '<h4>' + esc(h.title) + '<em>' + esc(nodeCode(h.id)) + '</em></h4>'
            + '<div class="path">' + esc(h.sub) + ' · ' + esc(h.why) + ' · 得分 ' + h.score + '</div>'
            + '<div><span class="ov-badge">点此查看完整提示词卡</span></div></div>';
        }).join("") + '</div></div>'
    : '<div class="ov-panel"><div class="ov-title">已有提示词卡 · 0 条</div>'
      + '<div class="ov-note">没有命中已收录条目。这不代表做不出来 —— 请改用下方「知识库节点」参与组合，'
      + '或去「组合工作台」按九个槽位装配。</div></div>';

  var nodeHtml = nodes.length
    ? '<div class="ov-panel"><div class="ov-title">知识库节点 · ' + nodes.length + ' 个<span class="ov-sub" style="font-weight:400"> 可参与组合</span></div>'
      + '<div class="ov-grid">' + nodes.slice(0, 40).map(function (h) {
          var n = ENGINE.node(h.id) || { desc: "", kw: [], path: h.sub, zh: h.title };
          return ovNodeHtml(n, false);
        }).join("") + '</div></div>'
    : "";

  var tipHtml = r.empty
    ? '<div class="ov-panel"><div class="ov-title">空结果兜底</div><div class="ov-note">' + esc(r.hint) + '</div>'
      + '<div class="ov-sub">' + ENGINE.SLOT_ORDER.map(function (s) {
          return '<b style="color:#7c5cff">' + esc(ovSlotZh(s)) + '</b>：' + esc(ovSlotHint(s));
        }).join('<br>') + '</div></div>'
    : "";

  el("grid").innerHTML = '<div class="ov-wrap">' + box + readyHtml + nodeHtml + tipHtml + '</div>';

  el("grid").querySelectorAll("[data-seed]").forEach(function (b) {
    b.onclick = function () { OP.findQ = b.dataset.seed; openRenderFind(); };
  });
  el("grid").querySelectorAll("[data-goto]").forEach(function (b) {
    b.onclick = function () {
      state.q = b.dataset.goto;
      el("q").value = b.dataset.goto;
      state.sec = "styles";
      buildNav(); render();
    };
  });
  ovBindCopy(el("grid"));
  el("filters").innerHTML = "";
  ovStat("命中 " + entries.length + " 条可直接复制 · " + nodes.length + " 个节点");
  wireFindBox();
}

function wireFindBox() {
  var input = el("ovQ");
  if (!input) return;
  var timer;
  input.addEventListener("input", function (e) {
    clearTimeout(timer);
    var v = e.target.value;
    timer = setTimeout(function () { OP.findQ = v; openRenderFind(); }, 220);
  });
  input.focus();
  if (input.setSelectionRange) input.setSelectionRange(input.value.length, input.value.length);
}

/* ============================================================
 * 视图三：组合工作台
 * ============================================================ */
function openRenderCompose() {
  var out = ENGINE.compose(OP.picks);

  var rows = ENGINE.SLOT_ORDER.map(function (s) {
    var sel = OP.picks[s] || [];
    var pool = ENGINE.nodesForSlot(s);
    var open = OP.openPicker === s;
    return '<div class="ov-slot">'
      + '<div class="hd"><span>' + esc(ovSlotZh(s)) + ' <i>' + esc(s) + '</i></span>'
      + '<span><i>' + esc(ovSlotHint(s)) + '</i> '
      + '<span class="ov-badge">已选 ' + sel.length + '</span> '
      + '<button class="btn" data-toggle="' + esc(s) + '">' + (open ? "收起" : "添加 / 修改") + '</button></span></div>'
      + (sel.length ? '<div class="ov-kws">' + sel.map(function (id) {
          var n = ENGINE.node(id);
          return '<span class="ov-kw" data-unpick="' + esc(s) + '|' + esc(id) + '" style="border-color:#f87171;color:#fca5a5" title="点击移除">'
            + esc(n ? n.zh : id) + ' ×</span>';
        }).join("") + '</div>' : "")
      + '<div class="ov-pick' + (open ? "" : " off") + '">' + pool.map(function (n) {
          var on = sel.indexOf(n.id) !== -1;
          return '<span class="ov-kw" data-pick="' + esc(s) + '|' + esc(n.id) + '" '
            + (on ? 'style="border-color:var(--accent);color:#a89bff"' : '') + '>' + esc(n.zh) + '</span>';
        }).join("") + '</div>'
      + '</div>';
  }).join("");

  var result = '<div class="ov-panel">'
    + '<div class="ov-bar"><span class="ov-grade ' + ovGradeCls(out.grade) + '">' + esc(ovGradeZh(out.grade)) + '</span>'
    + '<button class="btn p" data-cp="' + esc(out.gpt) + '">复制 GPT 正文</button>'
    + '<button class="btn k" data-cp="' + esc(out.tags) + '">复制标签版</button>'
    + '<button class="btn k" data-cp="' + esc(out.neg) + '">复制负面词</button>'
    + '<button class="btn" data-reset="1">清空重来</button></div>'
    + (out.conflicts.length
        ? out.conflicts.map(function (c) {
            return '<div class="ov-warn"><b>[' + esc(c.type) + ']</b> ' + esc(c.reason)
              + '<br><span style="color:#b9c0d0">涉及：' + esc(c.ids.join("、")) + '</span></div>';
          }).join("")
        : '<div class="ov-sub">未检测到语义冲突。</div>')
    + (out.notes.length ? out.notes.map(function (n) { return '<div class="ov-note">' + esc(n) + '</div>'; }).join("") : "")
    + '<div class="ov-sub"><b style="color:#7c5cff">装配摘要</b><br>' + esc(out.summary || "尚未选择任何模块") + '</div>'
    + '<div class="ov-sub"><b style="color:#7c5cff">GPT 正文</b></div>'
    + '<div class="ov-code">' + esc(out.gpt || "（先在左侧选择模块）") + '</div>'
    + '<div class="ov-sub"><b style="color:#22d3ee">标签版（MJ / SD / Flux）</b></div>'
    + '<div class="ov-code">' + esc(out.tags || "—") + '</div>'
    + '<div class="ov-sub"><b style="color:#f472b6">负面词</b></div>'
    + '<div class="ov-code">' + esc(out.neg) + '</div>'
    + '</div>';

  el("grid").innerHTML = '<div class="ov-wrap">'
    + '<div class="ov-panel"><div class="ov-title">组合工作台</div>'
    + '<div class="ov-sub">任何提示词都由九个槽位装配而成。缺哪个槽，就从哪个库补。'
    + '地域不等于风格，题材不等于画风，请不要把地域标签塞进风格槽。</div>'
    + '<div class="ov-bar">' + OP_PRESETS.map(function (p, i) {
        return '<button class="chip" data-preset="' + i + '">' + esc(p.name) + '</button>';
      }).join("") + '</div></div>'
    + '<div class="ov-two"><div style="display:flex;flex-direction:column;gap:10px">' + rows + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px">' + result + '</div></div>'
    + '</div>';

  el("grid").querySelectorAll("[data-toggle]").forEach(function (b) {
    b.onclick = function () { OP.openPicker = OP.openPicker === b.dataset.toggle ? null : b.dataset.toggle; openRenderCompose(); };
  });
  el("grid").querySelectorAll("[data-pick]").forEach(function (b) {
    b.onclick = function () {
      var parts = b.dataset.pick.split("|");
      var slot = parts[0], id = parts[1];
      OP.picks[slot] = OP.picks[slot] || [];
      var i = OP.picks[slot].indexOf(id);
      if (i >= 0) OP.picks[slot].splice(i, 1); else OP.picks[slot].push(id);
      openRenderCompose();
    };
  });
  el("grid").querySelectorAll("[data-unpick]").forEach(function (b) {
    b.onclick = function () {
      var parts = b.dataset.unpick.split("|");
      OP.picks[parts[0]] = (OP.picks[parts[0]] || []).filter(function (x) { return x !== parts[1]; });
      openRenderCompose();
    };
  });
  el("grid").querySelectorAll("[data-preset]").forEach(function (b) {
    b.onclick = function () {
      OP.picks = JSON.parse(JSON.stringify(OP_PRESETS[+b.dataset.preset].picks));
      openRenderCompose();
      toast("已套用预设");
    };
  });
  el("grid").querySelectorAll("[data-reset]").forEach(function (b) {
    b.onclick = function () { OP.picks = {}; openRenderCompose(); };
  });
  ovBindCopy(el("grid"));
  el("filters").innerHTML = "";
  var used = out.slots.length;
  ovStat("已装配 " + used + " 项 · 评级 " + ovGradeZh(out.grade));
}

var OP_PRESETS = [
  { name: "角色立绘", picks: { target: ["PR-01-3"], subject: ["CB-01-1", "CB-03-2"], content: ["CB-06-2"], frame: ["LN-01-3"], style: ["VS-04-1"], limit: ["VX-03-4"] } },
  { name: "场景概念", picks: { target: ["PR-01-3"], content: ["WD-01-2", "WD-03-3"], style: ["WD-02-1"], frame: ["LN-01-1", "LN-03-3"] } },
  { name: "设定三视图", picks: { target: ["PR-01-2"], subject: ["CB-01-1"], style: ["VS-04-1"], spec: ["PR-02-3"], limit: ["VX-03-4"] } },
  { name: "叙事单格", picks: { target: ["PR-01-3"], subject: ["CB-01-1"], content: ["SN-03-1"], style: ["VS-04-1"], frame: ["LN-01-2", "LN-02-2"], motion: ["LN-05-2"] } },
  { name: "海报物料", picks: { target: ["PR-01-6"], subject: ["CB-01-1"], content: ["WD-03-4"], style: ["VS-05-1"], frame: ["LN-03-6"], spec: ["PR-02-2"], limit: ["VX-04-3"] } }
];

/* ============================================================
 * 视图四：变形工作台
 * ============================================================ */
function openRenderMorph() {
  var res = ENGINE.morph({
    base: OP.basePicks,
    change: OP.change,
    keep: OP.keep,
    strength: OP.strength
  });
  var grades = ["light", "medium", "rebuild"];
  var gradeZh = { light: "轻度", medium: "中度", rebuild: "重构" };
  var STRENGTH_TEXT_ZH = {
    light:   "轻度变形：原方案保留九成以上，只替换明确点名的槽位。",
    medium:  "中度变形：允许整体语言更换，但角色身份锚点不得丢失。",
    rebuild: "重构变形：仅保留概念名，视觉全部重做，需要重新走验证流程。"
  };

  var left = ENGINE.SLOT_ORDER.map(function (s) {
    var sel = OP.change[s] || [];
    var pool = ENGINE.nodesForSlot(s);
    var open = OP.openPicker === s;
    return '<div class="ov-slot">'
      + '<div class="hd"><span>变形后 · ' + esc(ovSlotZh(s)) + ' <i>' + esc(s) + '</i></span>'
      + '<span><button class="btn" data-toggle="' + esc(s) + '">' + (open ? "收起" : "选择变化项") + '</button></span></div>'
      + (sel.length ? '<div class="ov-kws">' + sel.map(function (id) {
          var n = ENGINE.node(id);
          return '<span class="ov-kw" data-unch="' + esc(s) + '|' + esc(id) + '" style="border-color:#f87171;color:#fca5a5">'
            + esc(n ? n.zh : id) + ' ×</span>';
        }).join("") + '</div>' : "")
      + '<div class="ov-pick' + (open ? "" : " off") + '">' + pool.map(function (n) {
          var on = sel.indexOf(n.id) !== -1;
          return '<span class="ov-kw" data-ch="' + esc(s) + '|' + esc(n.id) + '" '
            + (on ? 'style="border-color:var(--accent);color:#a89bff"' : '') + '>' + esc(n.zh) + '</span>';
        }).join("") + '</div>'
      + '</div>';
  }).join("");

  var right = '<div class="ov-panel">'
    + '<div class="ov-bar"><span class="lbl">强度</span>' + grades.map(function (g) {
        return '<button class="chip' + (OP.strength === g ? " on" : "") + '" data-str="' + g + '">' + gradeZh[g] + '</button>';
      }).join("") + '</div>'
    + '<div class="ov-sub">' + esc(STRENGTH_TEXT_ZH[OP.strength]) + '</div>'
    + '<div class="ov-bar"><span class="ov-grade ' + ovGradeCls(res.result.grade) + '">' + esc(ovGradeZh(res.result.grade)) + '</span>'
    + '<button class="btn p" data-cp="' + esc(res.result.gpt) + '">复制 GPT 正文</button>'
    + '<button class="btn k" data-cp="' + esc(res.result.tags) + '">复制标签版</button></div>'
    + '<div class="ov-sub"><b style="color:#7c5cff">变化项</b><br>'
    + (res.changed.length ? esc(res.changed.map(function (c) { return ovSlotZh(c.slot) + "：" + c.node; }).join(" ／ ")) : "尚未指定") + '</div>'
    + '<div class="ov-sub"><b style="color:#7c5cff">保留项</b><br>'
    + (res.kept.length ? esc(res.kept.join("、")) : "尚未指定") + '</div>'
    + (res.result.conflicts.length
        ? res.result.conflicts.map(function (c) { return '<div class="ov-warn"><b>[' + esc(c.type) + ']</b> ' + esc(c.reason) + '</div>'; }).join("")
        : '<div class="ov-sub">变形后未检测到冲突。</div>')
    + res.notes.map(function (n) { return '<div class="ov-note">' + esc(n) + '</div>'; }).join("")
    + '<div class="ov-sub"><b style="color:#7c5cff">变形结果</b></div>'
    + '<div class="ov-code">' + esc(res.result.gpt || "（先在左侧指定变化项）") + '</div>'
    + '<div class="ov-sub"><b style="color:#22d3ee">检查清单</b><br>' + res.checklist.map(function (c) { return "□ " + esc(c); }).join("<br>") + '</div>'
    + '</div>';

  el("grid").innerHTML = '<div class="ov-wrap">'
    + '<div class="ov-panel"><div class="ov-title">变形工作台</div>'
    + '<div class="ov-sub">变形必须写明保留项与变化项。只说「改成某种风格」是不可执行指令。'
    + '基准组合沿用「组合工作台」当前的选择。</div>'
    + '<div class="ov-bar"><button class="chip" data-takebase="1">把组合工作台的结果作为基准</button>'
    + '<button class="chip" data-reset="1">清空全部</button></div>'
    + '<div class="ov-code">' + esc(JSON.stringify(OP.basePicks)) + '</div>'
    + '</div>'
    + '<div class="ov-two"><div style="display:flex;flex-direction:column;gap:10px">' + left + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px">' + right + '</div></div>'
    + '</div>';

  el("grid").querySelectorAll("[data-toggle]").forEach(function (b) {
    b.onclick = function () { OP.openPicker = OP.openPicker === b.dataset.toggle ? null : b.dataset.toggle; openRenderMorph(); };
  });
  el("grid").querySelectorAll("[data-ch]").forEach(function (b) {
    b.onclick = function () {
      var p = b.dataset.ch.split("|");
      OP.change[p[0]] = OP.change[p[0]] || [];
      var i = OP.change[p[0]].indexOf(p[1]);
      if (i >= 0) OP.change[p[0]].splice(i, 1); else OP.change[p[0]].push(p[1]);
      openRenderMorph();
    };
  });
  el("grid").querySelectorAll("[data-unch]").forEach(function (b) {
    b.onclick = function () {
      var p = b.dataset.unch.split("|");
      OP.change[p[0]] = (OP.change[p[0]] || []).filter(function (x) { return x !== p[1]; });
      openRenderMorph();
    };
  });
  el("grid").querySelectorAll("[data-str]").forEach(function (b) {
    b.onclick = function () { OP.strength = b.dataset.str; openRenderMorph(); };
  });
  el("grid").querySelectorAll("[data-takebase]").forEach(function (b) {
    b.onclick = function () {
      OP.basePicks = JSON.parse(JSON.stringify(OP.picks));
      if (!Object.keys(OP.basePicks).length) { toast("组合工作台还是空的"); return; }
      OP.change = {}; OP.keep = [];
      openRenderMorph(); toast("已载入基准组合");
    };
  });
  el("grid").querySelectorAll("[data-reset]").forEach(function (b) {
    b.onclick = function () { OP.basePicks = {}; OP.change = {}; OP.keep = []; openRenderMorph(); };
  });
  ovBindCopy(el("grid"));
  el("filters").innerHTML = "";
  ovStat("变化 " + res.changed.length + " 项 · 强度 " + gradeZh[OP.strength]);
}

/* ============================================================
 * 示例画廊：提示词 × 实际出图对照
 * 数据在 assets/examples.js（GALLERY），正文不复制进画廊——
 * 运行时从 PROMPT_SETS 反查，标签版从条目 demo 字段取。
 * ============================================================ */
/* ---------- 画廊的覆盖率与待补清单 ----------
   为什么必须写出来而不是只报「共 13 张」：
   补图是长期任务（目标覆盖率 50% 以上），只报当前张数，
   看不出离目标多远，下一批该补哪几条也无从下手。
   而且「有多少条能补」和「有多少条必须先脱敏」是两个数——
   R2/R3 条目要先过 rights 层改成去标识化表述才配图，
   把它们混在待补清单里，等于给出补不了的活儿。 */
function galleryStats(list) {
  /* 已配图 = img 有值的条目。img 为 null 的是「提示词已就绪、待补图」，
     不算已配——它们继续留在 R0 候选池里，覆盖进度才不会虚高。 */
  var shot = (typeof GALLERY !== "undefined" ? GALLERY : [])
    .filter(function (g) { return !!g.img; })
    .map(function (g) { return g.id; });
  var shotSet = {};
  shot.forEach(function (id) { shotSet[id] = 1; });

  /* 候选池只算**画廊能出图的那八段**。
     collectEntries() 会把作品层、负面词、模板一并返回（366 条），
     它们不是「画风/题材/版式/配色」类条目，配图也没有意义。
     不筛的话233 部作品会混进待补清单，
     覆盖率的分母从 133 变成 366，数字直接失去意义。 */
  var DRAWABLE = { ST: 1, ER: 1, SB: 1, RG: 1, MV: 1, TH: 1, LT: 1, PL: 1 };
  list = list.filter(function (e) {
    var c = nodeCode(e.id);
    return !!(c && DRAWABLE[c.split("-")[0]]);
  });

  /* 候选池 = 全部条目里授权等级允许配图的。
     R0 直接可配；R1 起需要署名或改写，配图要在图注里写清条件，
     所以单列出来，不混进「随手就能补」的那一档。 */
  var free = [], needCare = [], noShot = [];
  list.forEach(function (e) {
    if (shotSet[e.id]) return;
    /* 必须用 inspect(entry)，不能用 RIGHTS.tierOf(e.id)：
       tierOf() 收的是**文本**，不是 id。
       传 "A3-01" 进去只会扫这个字符串本身，永远扫不到任何标识，
       于是每个条目都判成 R0——SB（工作室）整段 14 条会全部
       落进「随手就能补」那一档，而它们实际是 R2/R3。
       静默错判比报错更糟：清单看起来可执行，配图时才发现过不了授权。 */
    var t = (typeof RIGHTS !== "undefined" && RIGHTS.inspect) ? RIGHTS.inspect(e) : null;
    var tier = t && t.tier ? t.tier : "";
    if (tier === "R0") free.push(e);
    else if (tier) needCare.push(e);
    else noShot.push(e);
  });
  return { shot: shot.length, free: free, needCare: needCare, noShot: noShot };
}

function galleryPendingHtml(s) {
  /* 待补清单只列前若干条并给出总数：
     全列出来会让这一屏变成一张 366 行的表，
     而补图时按分段（ST→ER→SB→MV）推进比按数量更有用。 */
  function segOf(e) { var c = nodeCode(e.id); return c ? c.split("-")[0] : "?"; }
  function group(list) {
    var by = {};
    list.forEach(function (e) {
      var g = segOf(e);
      (by[g] = by[g] || []).push(e);
    });
    return Object.keys(by).sort().map(function (g) {
      return g + ' ' + by[g].length;
    }).join(" · ");
  }
  var total = s.free.length + s.needCare.length + s.noShot.length;
  var pct = s.free.length + s.needCare.length > 0
    ? Math.round((s.shot / (s.shot + s.free.length + s.needCare.length)) * 100)
    : 0;

  return '<div class="gal-plan">'
    + '<div class="gal-plan-h">配图进度</div>'
    + '<div class="gal-bar"><i style="width:' + Math.min(100, pct) + '%"></i></div>'
    + '<div class="gal-plan-n">'
      + '已配 <b>' + s.shot + '</b> 张 · 候选池内 <b>' + total + '</b> 条'
      + ' · 当前覆盖 <b>' + pct + '%</b>（目标 50% 以上）'
    + '</div>'
    + '<div class="gal-plan-l">'
      + '<span class="gal-tag gal-ok">R0 随手可补 ' + s.free.length + '</span>'
      + (s.needCare.length
          ? '<span class="gal-tag gal-warn">R1/R2 需先过授权 ' + s.needCare.length + '</span>' : "")
      + (s.noShot.length
          ? '<span class="gal-tag">未标授权 ' + s.noShot.length + '</span>' : "")
    + '</div>'
    + (s.free.length
        ? '<div class="gal-plan-s">待补 R0 按段分布：' + esc(group(s.free)) + '</div>'
        : '<div class="gal-plan-s">R0 条目已全部配图。</div>')
    + '<div class="gal-plan-s">图片文件名一律用<b>条目旧 id</b>（如 <code>A1-01.png</code>），'
      + '旧 id 永久可解析到规范码，因此图与词条的对应关系不会因重排而错位。</div>'
    + '</div>';
}

function openRenderGallery() {
  var list = ENGINE.collectEntries();
  var byId = {};
  list.forEach(function (e) { byId[e.id] = e; });

  /* gpt 正文查表：与 index.html 的 PROMPT_MAP 同源，
     这里单独建一份局部表，避免依赖内联脚本的 const（Node 测试环境拿不到） */
  var gptMap = {};
  if (typeof PROMPT_SETS !== "undefined" && Array.isArray(PROMPT_SETS)) {
    PROMPT_SETS.forEach(function (set) {
      (set || []).forEach(function (p) { gptMap[p.id] = p.gpt; });
    });
  }

  var cards = (typeof GALLERY !== "undefined" ? GALLERY : []).map(function (g) {
    var e = byId[g.id];
    if (!e) {
      /* 数据漂移报警：examples.js 里的 id 在引擎里查不到。
         宁可显示残卡让人发现，也不要静默跳过。 */
      return '<div class="gal-card"><div class="gal-body">'
        + '<div class="gal-note" style="border-left-color:#f87171">'
        + '画廊条目 ' + esc(g.id) + ' 在引擎中不存在——examples.js 与数据源已漂移，请修正。</div></div></div>';
    }
    var gpt = gptMap[g.id] || e.demo || "";
    var code = nodeCode(g.id);
    var tier = "", tierCls = "R0";
    /* 同 galleryStats：tierOf 收文本不收 id，必须走 inspect(entry)。
       这里原来传的是 g.id，等于拿 "A1-01" 去扫——
       卡面档位永远显示 R0，跟真实授权无关。 */
    if (typeof RIGHTS !== "undefined" && RIGHTS.inspect) {
      var t = RIGHTS.inspect(e);
      if (t && t.tier) { tier = t.tier; tierCls = t.tier; }
    }
    var tierZh = (typeof RIGHTS !== "undefined" && RIGHTS.TIERS && RIGHTS.TIERS[tier])
      ? RIGHTS.TIERS[tier].zh : "";
    /* img 为 null 是「提示词已就绪、待补图」条目：
       占位块替代破图，提示词照常可复制——提示词不因没图而不可用。 */
    var media = g.img
      ? '<a href="' + esc(g.img) + '" target="_blank" rel="noopener" title="点击看大图">'
        + '<img src="' + esc(g.img) + '" alt="' + esc(e.zh) + ' 出图示例" loading="lazy">'
        + '</a>'
      : '<div style="display:flex;align-items:center;justify-content:center;'
        + 'min-height:180px;border:1px dashed var(--line,#c9c2b8);border-radius:8px;'
        + 'color:var(--muted,#8a8577);font-size:13px;text-align:center;padding:12px;">'
        + '📝 提示词已就绪 · 待配图<br>复制下方正文即可先出图</div>';
    return '<div class="gal-card">'
    + media
    + '<div class="gal-body">'
    +   '<div class="gal-head"><span class="t">' + esc(e.zh) + '<i>' + esc(e.en || "") + '</i></span></div>'
    +   '<div class="gal-meta">'
    +     '<span class="gal-code" data-cp="' + esc(code) + '" title="点击复制编码">' + esc(code) + '</span>'
    +     '<span class="gal-tier ' + esc(tierCls) + '" title="授权等级">' + esc(tier + " " + tierZh) + '</span>'
    +   '</div>'
    +   '<div class="gal-note">' + esc(g.note) + '</div>'
    +   '<div class="gal-prompt" data-gal-gpt>' + esc(gpt) + '</div>'
    +   '<div class="gal-foot">'
    +     '<button class="btn" data-cp="' + esc(gpt) + '">复制正文</button>'
    +     (e.demo ? '<button class="btn" data-cp="' + esc(e.demo) + '" title="同一技法的标签写法，主体与正文可能不同；左侧图对应正文">复制标签版</button>' : "")
    +   '</div>'
    + '</div></div>';
  }).join("");

  var st = galleryStats(list);
  el("grid").innerHTML =
    '<div class="ov-wrap">'
    + '<div class="ov-sub">每张图都用该条目的 <b>GPT 正文</b>真实出图，正文与标签速用版都可一键复制。'
    + '标签版与正文是两个不同口径的示例写法（主体可能不同），<b>图只对应正文</b>。'
    + '画廊只收录 <b>R0 自由</b> 条目——可含进任何商业用途，不需要署名或改写。</div>'
    + galleryPendingHtml(st)
    + '<div class="gal-grid">' + cards + '</div>'
    + '</div>';
  el("filters").innerHTML = "";
  ovStat("示例画廊 · " + st.shot + " 张 · 全部 R0");
  ovBindCopy(el("grid"));
}

/* ============================================================
 * 分发
 * ============================================================ */
function openIsOpen() {
  return OPEN_VIEWS.some(function (v) { return v.key === state.sec; });
}

function openDispatch() {
  if (state.sec === "openstudio")   { openRenderStudio();   return true; }
  if (state.sec === "opengacha")    { openRenderGacha();    return true; }
  if (state.sec === "opengallery") { openRenderGallery(); return true; }
  if (state.sec === "opencode")    { openRenderCode();    return true; }
  if (state.sec === "opentable")   { openRenderCodeTable(); return true; }
  if (state.sec === "openrights")  { openRenderRights();  return true; }
  if (state.sec === "openlibs")    { openRenderLibs();    return true; }
  if (state.sec === "openfind")    { openRenderFind();    return true; }
  if (state.sec === "opencompose") { openRenderCompose(); return true; }
  if (state.sec === "openmorph")   { openRenderMorph();   return true; }
  return false;
}
openDispatch.isOpen = openIsOpen;
