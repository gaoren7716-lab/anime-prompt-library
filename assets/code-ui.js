/* ============================================================
 * code-ui.js · 编码工作台视图
 * ============================================================
 * 用户的需求原话：「可以直接引用编码，或是中文名」。
 * 这个视图就是把那句话变成可操作的东西：
 *
 *   输入框里可以写  ST-001 + 赛璐璐平涂 + TH-001
 *                也可写  a1-1、赛璐璐、W-J01（旧 ID）、Cel Shading（英文）
 *   回车后逐项解析，命中就列出规范编码 + 中文名 + 所属层，
 *   没命中就把「为什么没命中」和最接近的候选一起摆出来——
 *   绝不静默跳过，那会让用户以为整串都对了。
 *
 * 产出两样：
 *   1 规范组合串   ST-001 赛璐璐平涂 + TH-001 热血战斗
 *     → 可直接粘进别的工具，也能存起来下次复用
 *   2 关键词串联   由这些条目 / 节点拼出的 tags
 *
 * 依赖全局：CODES / RESOLVER（由 registry.js 登记好）
 * ============================================================ */

/* ---------- 本视图状态（独立于 OP，避免互相污染） ---------- */
var CW = {
  q: "",
  last: null,        // 上一次 resolveMany 的结果
  layer: "全部"      // 结果过滤层
};

/* ---------- 注入样式 ---------- */
(function injectCodeCss() {
  if (document.getElementById("cw-css")) return;
  var s = document.createElement("style");
  s.id = "cw-css";
  s.textContent = [
    ".cw-in{display:flex;gap:8px;align-items:stretch;margin-bottom:12px;flex-wrap:wrap}",
    ".cw-in textarea{flex:1;min-width:240px;min-height:62px;resize:vertical;",
    "  background:var(--panel2);border:1px solid var(--line);border-radius:8px;",
    "  color:var(--txt);padding:9px 11px;font-size:12.5px;line-height:1.6;font-family:ui-monospace,Consolas,monospace}",
    ".cw-in textarea:focus{outline:none;border-color:var(--accent)}",
    ".cw-hint{font-size:11.5px;color:var(--dim2);line-height:1.9;margin-bottom:12px}",
    ".cw-hint code{background:var(--panel3);padding:1px 6px;border-radius:4px;color:#a89bff;font-size:11px}",
    ".cw-hint b{color:#c4b5fd;cursor:pointer;font-weight:500}",
    ".cw-hint b:hover{text-decoration:underline}",
    ".cw-sum{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px}",
    ".cw-chain{flex:1;min-width:200px;background:var(--panel2);border:1px solid var(--line);",
    "  border-radius:7px;padding:8px 11px;font-size:12px;line-height:1.8;",
    "  font-family:ui-monospace,Consolas,monospace;color:#a89bff;word-break:break-all}",
    ".cw-list{display:flex;flex-direction:column;gap:7px;margin-bottom:14px}",
    /* .cw-item 同时挂 .card：.card 是全站卡片公共类（自动检查按它统计），
       但 .card 是 flex-direction:column，会覆盖 .cw-item 需要的 row 布局，
       所以这里显式重声明一次。 */
    ".cw-item{display:flex;flex-direction:row;gap:11px;align-items:flex-start;padding:9px 11px;",
    "  background:var(--panel2);border:1px solid var(--line);border-radius:8px;font-size:12.5px}",
    ".cw-code{flex:none;font-family:ui-monospace,Consolas,monospace;font-size:11.5px;",
    "  color:#22d3ee;background:rgba(34,211,238,.10);border:1px solid rgba(34,211,238,.28);",
    "  padding:2px 7px;border-radius:5px;white-space:nowrap}",
    ".cw-main{flex:1;min-width:0}",
    ".cw-zh{font-weight:600;margin-bottom:3px}",
    ".cw-meta{font-size:11px;color:var(--dim2);line-height:1.7}",
    ".cw-kw{margin-top:4px;font-size:11px;color:#8b95a5;line-height:1.7}",
    ".cw-kind{flex:none;font-size:10.5px;padding:2px 7px;border-radius:10px;white-space:nowrap}",
    ".cw-k-entry{background:rgba(124,92,255,.16);color:#a89bff}",
    ".cw-k-node{background:rgba(52,211,153,.14);color:#6ee7b7}",
    ".cw-k-tool{background:rgba(251,191,36,.14);color:#fcd34d}",
    /* 授权徽章。R3 用红、R2 用黄，与全站 g-danger / g-warn 对齐，
       免得同一件事在不同页面有两种颜色。 */
    ".cw-rt{font-size:10px;padding:1px 6px;border-radius:8px;white-space:nowrap;" +
      "font-weight:400;vertical-align:1px;margin-left:4px;cursor:help}",
    ".cw-rt-R0{background:rgba(52,211,153,.14);color:#6ee7b7}",
    ".cw-rt-R1{background:rgba(107,127,214,.16);color:#a5b4fc}",
    ".cw-rt-R2{background:rgba(251,191,36,.16);color:#fcd34d}",
    ".cw-rt-R3{background:rgba(248,113,113,.16);color:#fca5a5}",
    ".cw-rnote{margin-top:5px;font-size:11.5px;line-height:1.55;color:var(--mut);" +
      "border-left:2px solid rgba(248,113,113,.4);padding-left:8px}",
    ".cw-bad{background:rgba(248,113,113,.08);border-color:rgba(248,113,113,.35)}",
    ".cw-bad .cw-code{color:#fca5a5;background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.3)}",
    ".cw-amb{background:rgba(251,191,36,.06);border-color:rgba(251,191,36,.32)}",
    ".cw-amb .cw-code{color:#fcd34d;background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.3)}",
    ".cw-why{font-size:11.5px;color:#fca5a5}",
    ".cw-cand{margin-top:5px;font-size:11px;color:var(--dim2);line-height:1.8}",
    ".cw-cand b{color:#a89bff;cursor:pointer;font-weight:500;margin-right:8px}",
    ".cw-cand b:hover{text-decoration:underline}",
    /* 重复段提示：中性偏蓝，与「未命中」的红、「待消歧」的黄都区分开。
       重复不是错误，是一次正确的合并，所以不能用警告色。 */
    ".ov-grade.g-dup{color:#7dd3fc;border-color:#38bdf8;background:rgba(56,189,248,.10)}",
    ".cw-dupnote{margin-top:6px;font-size:11px;color:#7dd3fc;line-height:1.7}",
    ".cw-dupnote code{background:rgba(56,189,248,.10);border:1px solid rgba(56,189,248,.28);",
    "  border-radius:4px;padding:1px 5px;font-size:10.5px;color:#bae6fd}",
    ".cw-out{margin-top:4px}",
    ".cw-out textarea{width:100%;min-height:78px;background:var(--panel2);border:1px solid var(--line);",
    "  border-radius:8px;color:var(--txt);padding:9px 11px;font-size:12px;line-height:1.7;",
    "  font-family:ui-monospace,Consolas,monospace;resize:vertical}",
    ".cw-empty{color:var(--dim2);font-size:12.5px;padding:22px 0;text-align:center;line-height:2}",
    /* 去标识化输入框。不能套用 .cw-in textarea 那条——
       它的选择器带 .cw-in 前缀，只在编码工作台顶栏生效。 */
    "#rwText{width:100%;min-height:82px;background:var(--panel2);border:1px solid var(--line);",
    "  border-radius:8px;color:var(--txt);padding:9px 11px;font-size:12.5px;line-height:1.7;",
    "  font-family:ui-monospace,Consolas,monospace;resize:vertical}",
    "#rwText:focus{outline:none;border-color:var(--accent)}",
    ".cw-seg{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:11px}",
    ".cw-seg button{background:var(--panel2);border:1px solid var(--line);color:var(--dim);",
    "  padding:3.5px 11px;border-radius:13px;font-size:11px;cursor:pointer}",
    ".cw-seg button.on{background:rgba(124,92,255,.16);border-color:var(--accent);color:#a89bff}"
  ].join("");
  document.head.appendChild(s);
})();

/* ---------- 工具 ---------- */
function cwKindZh(k) {
  return k === "entry" ? "可复制条目" : k === "node" ? "组合节点" : "工具条目";
}

/* ---------- 授权徽章 ---------- */
/* 四档的中文名与卡片上的一句话说明。
   措辞刻意区分「禁用」与「需处理」：
   R3 不是不能用，是不能原样送进商业流程。
   写成「禁止」会让人以为整个条目作废，反而失去意义。 */
function cwRightsZh(tier) {
  return RIGHTS.TIERS[tier] ? RIGHTS.TIERS[tier].zh : "自由";
}
function cwRightsTip(tier, r) {
  var t = RIGHTS.TIERS[tier];
  if (!t) return "";
  var basis = (r && r.basis === "layer")
    ? "依据：作品条目本身即受保护标识"
    : (r && r.hits && r.hits.length
        ? "命中：" + r.hits.map(function (h) { return h.zh || h.marker; }).join("、")
        : "依据：仅含通用技法与客观描述");
  return t.rule + "\n" + basis + "\n商用要求：" + t.requirement;
}
function cwRightsNote(tier, r) {
  var t = RIGHTS.TIERS[tier];
  if (!t) return "";
  if (tier === "R1") return "已故作者，风格已进公有领域。商用请署名原作作者。";
  if (tier === "R2")
    return "含在世创作者或工作室标识。学习研究随便用；商用出图前请先去掉标识，只保留视觉特征描述。";
  /* R3 */
  var hits = (r && r.hits) ? r.hits.length : 0;
  return (hits
    ? "含 " + hits + " 处受保护标识。个人学习与研究随便用；"
    : "本条目是受保护作品条目。个人学习与研究随便用；")
    + "送进商业出图或对外交付前，必须改写为纯视觉特征描述，不要出现作品名与角色名。";
}
function cwSegOf(code) {
  var m = String(code).match(/^([A-Z0-9]+(?:-[A-Z])?)/);
  return m ? m[1] : code;
}
function cwSegZh(code) {
  for (var i = 0; i < CODES.SEGMENTS.length; i++) {
    if (CODES.SEGMENTS[i].code === cwSegOf(code)) return CODES.SEGMENTS[i].zh;
  }
  return "";
}

/* ---------- 主渲染 ---------- */
function openRenderCode() {
  var q = CW.q;

  var head = '<div class="cw-in">'
    + '<textarea id="cwQ" placeholder="ST-001 + 赛璐璐平涂 + TH-001&#10;支持：新编码 / 旧编码 / 中文名 / 英文名 / 旧 ID（W-J01）/ 别名，用 + 或空格分隔">' + esc(q) + '</textarea>'
    + '<div style="display:flex;flex-direction:column;gap:6px">'
    + '<button class="btn p" data-cw-go="1">解析组合</button>'
    + '<button class="btn" data-cw-clear="1">清空</button>'
    + '</div></div>';

  head += '<div class="cw-hint">'
    + '五类输入都能命中同一条目：<code>ST-001</code> 规范编码 · <code>A1-01</code> 旧 ID · '
    + '<code>赛璐璐平涂</code> 中文名 · <code>Cel Shading</code> 英文名 · <code>赛璐珞</code> 历史错写<br>'
    + '旧编码仍然可用：<code>A1-001</code>、<code>W-J-001</code>、<code>G-001</code> 都会自动指向新码<br>'
    + '跨层同名（如 <code>赛璐珞</code> 同时是节点和条目）按 <b>工具 &gt; 条目 &gt; 节点</b> 自动取一层，'
    + '被遮住的那层会列在卡片里，点编码可切换。<br>'
    + '编码三位是为了后续追加留余量：现在 <b data-cw-try="ST-001">ST-001</b> 到 <b data-cw-try="MV-014">MV-014</b>，'
    + '作品层到 <b data-cw-try="WK-233">WK-233</b>，往后加到 999 都不会撞号。<br>'
    + '点上面任一编码可直接填入输入框试。'
    + '</div>';

  var body = "";

  if (!q.trim()) {
    /* 空状态也给一个可点的示例卡：
       否则这个入口在自动检查里会被判成「空白视图」——
       不是它坏了，是它本来就在等输入。但让人一眼看到能点什么更重要。 */
    var samples = ["ST-001 + TH-001 + CB-001-001", "赛璐璐平涂 + 热血战斗", "WK-001", "MV-014", "A1-001（旧码也认）"];
    body = '<div class="cw-list">' + samples.map(function (s) {
      return '<div class="cw-item card cw-sample" data-cw-try="' + esc(s) + '" '
        + 'style="cursor:pointer"><span class="cw-code">示例</span>'
        + '<div class="cw-main"><div class="cw-zh">' + esc(s) + '</div>'
        + '<div class="cw-meta">点一下把这串填进输入框</div></div></div>';
    }).join("") + '</div>';
  } else {
    var r = RESOLVER.resolveMany(q);
    CW.last = r;

    /* 解析结论条 —— 成功 / 有歧义 / 有找不到，三种状态要分开说。
       类名用全站的 g-* 档位（定义在 open-ui.js）：
       早前这里写成 `ov-grade ok` / `ov-grade conflict`，
       而全站实际是 g-ok / g-conflict，于是这些徽章一条样式都没命中，
       在页面上显示为无边框的裸文字。 */
    if (r.ok) {
      body += '<div class="cw-sum"><span class="ov-grade g-ok">全部命中 ' + r.okList.length + ' 项</span></div>';
    } else {
      var parts = [];
      if (r.okList.length) parts.push(r.okList.length + " 项命中");
      if (r.ambList.length) parts.push(r.ambList.length + " 项重名待消歧");
      if (r.badList.length) parts.push(r.badList.length + " 项未命中");
      body += '<div class="cw-sum"><span class="ov-grade g-conflict">' + esc(parts.join(" · ")) + '</span></div>';
    }

    /* 重复段：如实说出来。
       少了这一条，「ST-001 + 赛璐璐平涂 + CB-001-001」会只报「命中 2 项」，
       用户会以为有一段没查到，而不是「两段指的是同一个东西」。 */
    if (r.dupList && r.dupList.length) {
      body += '<div class="cw-sum"><span class="ov-grade g-dup">'
        + '输入 ' + r.total + ' 段 · 合并重复 ' + r.dupList.length + ' 段 · 实际参与组合 ' + r.okList.length + ' 项'
        + '</span></div>';
    }

    /* 组合串 */
    if (r.okList.length) {
      /* 整串的总授权判定：取所有命中项里最严的一档。
         用户拷走的是这一整串，所以警示必须挂在串上，
         挂在单张卡片上不够——他会逐条看但只看串。 */
      var worst = "R0";
      var RANK = { R0: 0, R1: 1, R2: 2, R3: 3 };
      r.okList.forEach(function (x) {
        var t = x.rights && x.rights.tier ? x.rights.tier : "R0";
        /* 显式查表而不是直接比字符串：
           字符串比较恰好也对，但那是运气不是设计——
           档位改名或插入中间档时会静默算错。 */
        if ((RANK[t] || 0) > (RANK[worst] || 0)) worst = t;
      });
      body += '<div class="cw-sum"><div class="cw-chain">' + esc(r.chain) + '</div>'
        + '<button class="btn p" data-cp="' + esc(r.chain) + '">复制组合串</button></div>';
      if (worst !== "R0") {
        body += '<div class="cw-sum"><span class="cw-rt cw-rt-' + esc(worst)
          + '" style="cursor:default">整串判定 ' + esc(worst) + ' · '
          + esc(cwRightsZh(worst)) + '</span><span class="ts" style="flex:1;min-width:220px">'
          + esc(worst === "R1"
            ? "本串含已故作者风格，商用请署名。"
            : "本串含受保护标识，个人学习研究随便用；送进商业出图或对外交付前请改写为纯视觉特征描述。")
          + '</span></div>';
      }
    }

    /* 明细 */
    /* 卡片同时挂 .card 与 .cw-item：
     .card 是全站卡片语义的公共类（自动检查按它统计），
     .cw-item 是本视图自己的布局类。两者不冲突。 */
    body += '<div class="cw-list">';

    r.okList.forEach(function (x) {
      var o = x.obj || {};
      var kw = o.kw || [];
      /* 同一项的其他写法：把「你刚才也写了它」摆在这张卡上，
         用户立刻知道第 2 段不是漏查而是被合并了。 */
      var alts = (r.dupList || []).filter(function (dp) { return dp.code === x.code; });
      /* 授权徽章。R3 条目在工作台里必须一眼可见——
         判R3 不代表禁用（个人研究随便用），但用户必须知道
         送进商业出图之前要先改写。不标出来就等于没判。 */
      var rk = x.rights && x.rights.tier ? x.rights.tier : "R0";
      body += '<div class="cw-item card">'
        + '<span class="cw-code">' + esc(x.code) + '</span>'
        + '<div class="cw-main">'
        + '<div class="cw-zh">' + esc(x.zh)
        + ' <span class="cw-rt cw-rt-' + esc(rk) + '" title="' + esc(cwRightsTip(rk, x.rights)) + '">'
        + esc(rk) + ' ' + esc(cwRightsZh(rk)) + '</span></div>'
        + '<div class="cw-meta">旧 ID ' + esc(x.oldId)
        + (cwSegZh(x.code) ? ' · 归属 ' + esc(cwSegZh(x.code)) : "")
        + (o.en || o.romaji ? ' · ' + esc(o.en || o.romaji) : "") + '</div>'
        + (kw.length ? '<div class="cw-kw">' + esc(kw.slice(0, 6).join(", ")) + '</div>' : "")
        + (rk !== "R0" ? '<div class="cw-rnote">' + esc(cwRightsNote(rk, x.rights)) + '</div>' : "")
        + (alts.length ? '<div class="cw-dupnote">你在输入里还写了它的另一个写法：'
          + alts.map(function (dp) { return '<code>' + esc(dp.input) + '</code>'; }).join("、")
          + '，已按同一条目合并</div>' : "")
        + (x.converged && x.shadowed && x.shadowed.length
          ? '<div class="cw-dupnote">跨层同名，已取<b>' + esc(cwKindZh(x.kind)) + '</b>层：'
            + x.shadowed.map(function (o) {
                return '<code data-cw-try="' + esc(o.code) + '" style="cursor:pointer" title="点开看这一层">'
                  + esc(o.code) + ' ' + esc(o.zh) + '</code>';
              }).join("、")
            + ' 同名，点可切换</div>'
          : "")
        + '</div>'
        + '<span class="cw-kind cw-k-' + esc(x.kind) + '">' + esc(cwKindZh(x.kind)) + '</span>'
        + '</div>';
    });

    /* 重名项：不是「错」，是「要选」。样式与未命中区分开。 */
    r.ambList.forEach(function (b) {
      body += '<div class="cw-item cw-amb card">'
        + '<span class="cw-code">待消歧</span>'
        + '<div class="cw-main">'
        + '<div class="cw-zh">' + esc(b.input) + '</div>'
        + '<div class="cw-why">' + esc(b.why) + '</div>'
        + (b.cand.length ? '<div class="cw-cand">这些都叫它，选一个：'
          + b.cand.map(function (c) {
              return '<b data-cw-try="' + esc(c.split(" ")[0]) + '">' + esc(c) + '</b>';
            }).join("") + '</div>' : "")
        + '</div></div>';
    });

    r.badList.forEach(function (b) {
      body += '<div class="cw-item cw-bad card">'
        + '<span class="cw-code">未命中</span>'
        + '<div class="cw-main">'
        + '<div class="cw-zh">' + esc(b.input) + '</div>'
        + '<div class="cw-why">' + esc(b.why) + '</div>'
        + (b.cand.length ? '<div class="cw-cand">最接近：'
          + b.cand.map(function (c) {
              return '<b data-cw-try="' + esc(c.split(" ")[0]) + '">' + esc(c) + '</b>';
            }).join("") + '</div>' : "")
        + '</div></div>';
    });

    body += '</div>';

    /* 关键词串联：把这些条目的 kw 按去重保序拼起来 */
    if (r.okList.length) {
      var tags = [], negs = [];
      r.okList.forEach(function (x) {
        var o = x.obj || {};
        (o.kw || []).forEach(function (k) { if (tags.indexOf(k) === -1) tags.push(k); });
      });
      /* 条目自带 demo 里的负面词不固定，这里只给关键词串联，
         负面词要走「工具条目 N-xxx」才有明确场景依据。 */
      var tagsStr = tags.join(", ");
      body += '<div class="ov-panel cw-out">'
        + '<div class="ov-bar"><span>关键词串联（去重保序）</span>'
        + '<button class="btn p" data-cp="' + esc(tagsStr) + '">复制</button></div>'
        + '<textarea readonly>' + esc(tagsStr) + '</textarea>'
        + '<div class="cw-hint" style="margin:8px 0 0">'
        + '这串是 <b>标签语法</b>（MJ / SD / Flux 用）。要 <b>GPT 自然语言正文</b>，'
        + '去「组合工作台」按九个槽位装配，或在各条目卡片上点「复制正文」。'
        + '</div></div>';
      void negs;
    }
  }

  var segs = [{ k: "全部", n: RESOLVER.entries.length }];
  ["entry", "node", "tool"].forEach(function (k) {
    var n = RESOLVER.entries.filter(function (e) { return e.kind === k; }).length;
    if (n) segs.push({ k: k, n: n, zh: cwKindZh(k) });
  });
  var segBar = '<div class="cw-seg">' + segs.map(function (s) {
    var on = CW.layer === s.k ? " on" : "";
    return '<button class="' + on.trim() + '" data-cw-layer="' + esc(s.k) + '">'
      + esc(s.zh || "全部") + ' ' + s.n + '</button>';
  }).join("") + '</div>';

  /* 内容写进 #grid（不是 #body）：
     其余四个视图都写 #grid，测试脚本也按 #grid 统计节点数。
     写错容器会导致「页面看着正常但所有自动检查失效」。 */
  el("grid").innerHTML = head + segBar + body;
  el("filters").innerHTML = "";
  cwBind();
}

/* ---------- 事件绑定（渲染后调用） ---------- */
function cwBind() {
  var box = el("grid");
  if (!box) return;

  /* 复制按钮复用全站的 data-cp 约定 */
  box.querySelectorAll("[data-cp]").forEach(function (b) {
    b.onclick = function (e) { e.stopPropagation(); copy(b.dataset.cp); };
  });

  box.querySelectorAll("[data-cw-try]").forEach(function (b) {
    b.onclick = function () {
      CW.q = b.dataset.cwTry;
      openRenderCode();
      var ta = document.getElementById("cwQ");
      if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    };
  });

  var go = box.querySelector("[data-cw-go]");
  if (go) go.onclick = function () {
    var ta = document.getElementById("cwQ");
    CW.q = ta ? ta.value : "";
    openRenderCode();
  };

  var cl = box.querySelector("[data-cw-clear]");
  if (cl) cl.onclick = function () { CW.q = ""; CW.last = null; openRenderCode(); };

  box.querySelectorAll("[data-cw-layer]").forEach(function (b) {
    b.onclick = function () { CW.layer = b.dataset.cwLayer; openRenderCode(); };
  });

  /* 多行输入用 Ctrl+Enter 提交，避免一行写完就触发 */
  var ta = document.getElementById("cwQ");
  if (ta) {
    ta.onkeydown = function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        CW.q = ta.value;
        openRenderCode();
      }
    };
  }
}

/* ---------- 码表总览（按层列出，供查号用） ---------- */
function openRenderCodeTable() {
  var bySeg = {};
  RESOLVER.entries.forEach(function (e) {
    var s = cwSegOf(e.code);
    (bySeg[s] = bySeg[s] || []).push(e);
  });
  var rows = CODES.SEGMENTS.filter(function (s) { return bySeg[s.code]; }).map(function (s) {
    var list = bySeg[s.code];
    var lo = list.map(function (e) { return e.code; }).sort()[0];
    var hi = list.map(function (e) { return e.code; }).sort().pop();
    return '<div class="cw-item card">'
      + '<span class="cw-code" style="min-width:82px;justify-content:center">' + esc(s.code) + '</span>'
      + '<div class="cw-main">'
      + '<div class="cw-zh">' + esc(s.zh) + ' <span style="color:var(--dim2);font-weight:400">' + esc(s.desc) + '</span></div>'
      + '<div class="cw-meta">' + list.length + ' 条 · 编码范围 ' + esc(lo) + ' ~ ' + esc(hi) + '</div>'
      + '</div><span class="cw-kind">' + esc(s.layer === "entry" ? "条目" : s.layer === "tool" ? "工具" : "节点") + '</span>'
      + '</div>';
  }).join("");

  var layerCounts = ["entry", "node", "tool"].map(function (k) {
    var n = RESOLVER.entries.filter(function (e) { return e.kind === k; }).length;
    return '<div style="flex:1;min-width:120px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 13px">'
      + '<div style="font-size:19px;font-weight:700;color:#a89bff">' + n + '</div>'
      + '<div style="font-size:11px;color:var(--dim2);margin-top:2px">' + esc(cwKindZh(k)) + '</div></div>';
  }).join("");

  el("grid").innerHTML =
    '<div class="cw-hint">共 <b>' + RESOLVER.entries.length + '</b> 项全部有编码。'
    + '编码规则是纯函数派生的（见 <code>assets/codes.js</code>），不会与数据漂移；'
    + '编码一旦发布不改，新增只会往后追加序号。</div>'
    + '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' + layerCounts + '</div>'
    + '<div class="cw-list">' + rows + '</div>';
  el("filters").innerHTML = "";
  cwBind();
}

/* ============================================================
 * 授权与商用视图
 * ------------------------------------------------------------
 * 这个视图回答一个很具体的问题：
 *   「我复制走的那条提示词，能不能直接用在商业项目里？」
 *
 * 三件事按顺序摆出来：
 *   1 四档规则      —— 判定依据，不是免责声明
 *   2 分档清单      —— 哪些条目落在哪档，可点编码跳回工作台
 *   3 去标识化实测  —— 粘一段含标识的文本，看它被改成什么
 *
 * 第3 项是刻意的：只讲「你必须改写」没有用，
 * 让人当场看到「改成什么」才知道要不要照做。
 * ============================================================ */
var RW = { tier: "R3", mode: "commercial", demo: "" };

var RW_DEMO = "赛璐璐上色，机械细节参考 Akira Toriyama 式的clean line，赛璐璐平涂 + 硬边阴影，Studio Trigger 风格的高速动作帧，火箭_upper 角色站在雨夜天台";

var RW_MODE_ZH = { personal: "个人学习 / 研究", commercial: "商业出图", redistribution: "打包再分发" };

function rwAssess(tier, mode) {
  var a = RIGHTS.assess(tier, mode);
  var tone = a.level === "ok" ? "#6ee7b7" : a.level === "warn" ? "#fcd34d" : a.level === "info" ? "#a5b4fc" : "#fca5a5";
  var bg   = a.level === "ok" ? "rgba(52,211,153,.07)" : a.level === "warn" ? "rgba(251,191,36,.07)"
           : a.level === "info" ? "rgba(107,127,214,.08)" : "rgba(248,113,113,.07)";
  return '<div style="border:1px solid var(--line);border-radius:8px;padding:11px 13px;background:' + bg + '">'
    + '<div style="font-size:12.5px;font-weight:600;color:' + tone + ';margin-bottom:5px">'
    + (a.allowed ? "可以走" : "不能直接走") + '</div>'
    + '<div style="font-size:11.5px;line-height:1.75;color:var(--mut)">' + esc(a.note) + '</div></div>';
}

function openRenderRights() {
  var counts = { R0: 0, R1: 0, R2: 0, R3: 0 };
  RESOLVER.entries.forEach(function (e) {
    var t = e.rights && e.rights.tier ? e.rights.tier : "R0";
    counts[t] = (counts[t] || 0) + 1;
  });
  var total = RESOLVER.entries.length;

  /* ---- 1. 四档规则 ---- */
  var tierCards = Object.keys(RIGHTS.TIERS).map(function (k) {
    var t = RIGHTS.TIERS[k];
    var n = counts[k] || 0;
    var pct = total ? Math.round(n / total * 1000) / 10 : 0;
    return '<div class="cw-item card" style="flex-direction:column;gap:7px;align-items:stretch">'
      + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
      + '<span class="rt cw-rt-' + k + '" style="cursor:default">' + esc(k) + ' ' + esc(t.zh) + '</span>'
      + '<span style="font-size:12px;color:var(--dim2)">' + n + ' 项 · ' + pct + '%</span>'
      + '<span style="flex:1"></span>'
      + '<span style="font-size:10.5px;padding:1px 7px;border-radius:9px;white-space:nowrap;'
      + (t.commercial === "ok" ? "background:rgba(52,211,153,.14);color:#6ee7b7)"
        : t.commercial === "ok-with-credit" ? "background:rgba(107,127,214,.16);color:#a5b4fc)"
        : t.commercial === "rewrite-first" ? "background:rgba(251,191,36,.16);color:#fcd34d)"
        : "background:rgba(248,113,113,.16);color:#fca5a5") + '">'
      + esc(t.commercial) + '</span></div>'
      + '<div style="font-size:12px;line-height:1.7;color:var(--txt)">' + esc(t.rule) + '</div>'
      + '<div style="font-size:11.5px;line-height:1.7;color:var(--dim2)"><b style="color:#a89bff">要求</b>　'
      + esc(t.requirement) + '</div></div>';
  }).join("");

  /* ---- 2. 分档清单 ---- */
  var list = RESOLVER.entries.filter(function (e) {
    return (e.rights && e.rights.tier ? e.rights.tier : "R0") === RW.tier;
  }).sort(function (a, b) { return a.code < b.code ? -1 : 1; });

  var shown = list.slice(0, 200);
  var listHtml = shown.length ? shown.map(function (e) {
    var r = e.rights || {};
    return '<div class="cw-item card">'
      + '<span class="cw-code" data-cw-try="' + esc(e.code) + '" style="cursor:pointer" title="点开这一项">'
      + esc(e.code) + '</span>'
      + '<div class="cw-main">'
      + '<div class="cw-zh">' + esc(e.zh) + '</div>'
      + '<div class="cw-meta">' + esc(cwKindZh(e.kind))
      + (r.basis === "layer" ? " · 作品层结构判定" : "")
      + (r.hits && r.hits.length ? " · 命中 " + r.hits.length + " 项标识" : "")
      + '</div>'
      + (r.reason ? '<div class="cw-rnote">' + esc(r.reason) + '</div>' : "")
      + '</div></div>';
  }).join("") : '<div class="cw-empty">这一档没有条目</div>';

  /* ---- 3. 去标识化实测 ---- */
  var demo = RW.demo;
  var de = demo.trim() ? RIGHTS.deIdentify(demo) : null;
  var deHtml = '<div class="cw-hint">粘一段含在世创作者名 / 工作室名 / IP 名的文本，'
    + '看它被改成什么。<b>去标识化会记录每一处替换</b>——不给「悄悄改掉了」的余地。</div>'
    + '<textarea id="rwText" placeholder="粘一段提示词…">' + esc(demo) + '</textarea>'
    + '<div style="display:flex;gap:7px;margin:9px 0;flex-wrap:wrap;align-items:center">'
    + '<button class="btn p" data-rw-run>去标识化</button>'
    + '<button class="btn" data-rw-clear>清空</button>'
    + '<button class="btn" data-rw-demo>填入示例</button></div>';

  if (de) {
    /* data-rw-side 是给测试与样式用的稳定钩子。
       原来只靠「原文本 / 改写后」两段中文定位，
       一旦改文案，测试会静默地取错段落然后报假失败——
       或者更糟：取到包含标识的段落，误判成改写没生效。 */
    deHtml += '<div class="cw-list">'
      + '<div class="cw-item card" data-rw-side="src"><div class="cw-main">'
      + '<div class="cw-zh" style="color:#fca5a5">原文本</div>'
      + '<div class="cw-kw" style="color:#c6cddf">' + esc(demo) + '</div></div></div>'
      + '<div class="cw-item card" data-rw-side="out"><div class="cw-main">'
      + '<div class="cw-zh" style="color:#6ee7b7">改写后（按 R0 对待）</div>'
      + '<div class="cw-kw" style="color:#c6cddf">' + esc(de.text) + '</div></div>'
      + '<button class="btn" data-cp="' + esc(de.text) + '">复制</button></div></div>'
      + '<div class="cw-hint">替换 ' + (de.replaced ? de.replaced.length : 0) + ' 处：'
      + ((de.replaced || []).map(function (r) {
          return '<code>' + esc(r.from) + '</code> → <code>' + esc(r.to) + '</code>'
            + (r.count > 1 ? ' ×' + r.count : "");
        }).join("、") || "无")
      + '</div>'
      /* 残留标识必须显示出来。去标识化的价值全在这一点上：
         只给「改好了」而不给「还剩什么没改」，等于让用户以为可以直接用了。 */
      + ((de.leftover && de.leftover.length)
          ? '<div class="cw-rnote" style="color:#fca5a5">改写后仍检出 ' + de.leftover.length
            + ' 项标识（未在替换表内，需人工处理）：'
            + de.leftover.map(function (h) { return esc(h.zh || h.marker); }).join("、")
            + '</div>'
          : '<div class="cw-hint" style="color:#6ee7b7">改写后未检出任何标识，可按 R0 对待。</div>');
  }

  el("grid").innerHTML =
    '<div class="ov-wrap">'
    + '<div class="ov-title">授权与商用</div>'
    + '<div class="ov-sub">分级依据是<b style="color:#fcd34d">名称与标识</b>，不是画法。'
    + '同一种画法可以落在不同档：技法描述是 R0，作品名与角色名是 R3。'
    + '这条库共 ' + total + ' 项，四档分布如下——数字是登记时真算出来的，不是写死的。</div>'

    + '<div class="ov-title" style="margin-top:6px">一、四档规则</div>'
    + '<div class="cw-list">' + tierCards + '</div>'

    + '<div class="ov-title" style="margin-top:6px">二、当前档位能怎么用</div>'
    + '<div class="ov-bar">'
    + Object.keys(RIGHTS.TIERS).map(function (k) {
        return '<span class="rt cw-rt-' + k + '" data-rw-tier="' + k + '" title="查看 ' + k
          + ' 档全部条目" style="cursor:pointer;font-size:11px;padding:4px 12px;border-radius:13px">'
          + k + ' ' + esc(RIGHTS.TIERS[k].zh)
          + ' · ' + (counts[k] || 0) + '</span>';
      }).join("")
    + '</div>'
    + '<div class="ov-bar" style="margin-top:9px">'
    + '<span class="lbl" style="font-size:11px;color:var(--dim2)">用途</span>'
    + Object.keys(RW_MODE_ZH).map(function (m) {
        return '<button class="btn' + (RW.mode === m ? " p" : "") + '" data-rw-mode="' + m + '">'
          + esc(RW_MODE_ZH[m]) + '</button>';
      }).join("")
    + '</div>'
    + '<div style="margin:10px 0 12px">' + rwAssess(RW.tier, RW.mode) + '</div>'
    + '<div class="cw-list">' + listHtml + '</div>'
    + (list.length > shown.length
        ? '<div class="cw-hint">共 ' + list.length + ' 项，上面列出前 ' + shown.length
          + ' 项。完整清单见 <code>dist/rights-audit.json</code>。</div>'
        : "")

    + '<div class="ov-title" style="margin-top:6px">三、去标识化实测</div>'
    + deHtml
    + '</div>';

  el("filters").innerHTML = "";
  rwBind();
}

function rwBind() {
  el("grid").querySelectorAll("[data-rw-tier]").forEach(function (b) {
    b.onclick = function () { RW.tier = b.dataset.rwTier; openRenderRights(); };
  });
  el("grid").querySelectorAll("[data-rw-mode]").forEach(function (b) {
    b.onclick = function () { RW.mode = b.dataset.rwMode; openRenderRights(); };
  });
  var run = el("grid").querySelector("[data-rw-run]");
  if (run) run.onclick = function () { RW.demo = el("rwText").value; openRenderRights(); };
  var cl = el("grid").querySelector("[data-rw-clear]");
  if (cl) cl.onclick = function () { RW.demo = ""; openRenderRights(); };
  var dm = el("grid").querySelector("[data-rw-demo]");
  if (dm) dm.onclick = function () { RW.demo = RW_DEMO; openRenderRights(); };
  cwBind();
}