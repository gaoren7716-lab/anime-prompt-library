/* ============================================================
 * 一键抽卡 · 界面层 · assets/gacha-ui.js
 * ============================================================
 * 这是**独立的一屏**，不再挂在出图工作流的出图面板里。
 * 分开的理由不是「放不下」，是两者的使用节奏不同：
 *
 *   出图工作流：你已经想好要什么 → 四步选完 → 出一张 → 精修
 *   一键抽卡：你还不知道要什么 → 随机铺开一组 → 挑一张 → 回去精修
 *
 * 混在一屏的后果是抽卡把工作流的「当前选择」当成了自己的输入，
 * 而抽卡恰恰是要改掉那个选择的。分开之后两边各自的语义都干净了：
 * 抽卡负责探索，工作流负责收敛，中间用「去精修」一跳连起来。
 *
 * ------------------------------------------------------------
 * 「只关联库」是什么意思
 * ------------------------------------------------------------
 * 这一屏的**全部内容输入都来自库本身**，不读出图工作流的当前选择：
 *
 *   · 随机 → 从库的候选里抽（GACHA.pool / roll）
 *   · 锁定 → 下拉里直接列库的候选，选一条就固定这一层
 *     （早前的做法是「先去出图工作流选好，回来点锁定」——
 *      那让抽卡页依赖另一个屏的状态，而两屏的状态各自都可能被改）
 *   · 卡片上的组合信息 → 每一层给出编码 + 中文名，也是库里的
 *
 * 与工作流共享的只剩「出图设置」（模型 / 比例 / key）——
 * 那不是内容，是发到哪去，两屏本来就该是同一份。
 * 唯一往外的动作是卡片上的「去精修」，那是把选中的组合**导出**，
 * 不是依赖。
 *
 * ------------------------------------------------------------
 * 与库升级的关系（这一屏为什么不会过期）
 * ------------------------------------------------------------
 * 槽位、候选数、组合空间全部来自 GACHA.pool()（现算，不缓存）。
 * 库里补了新画风/新题材/新版式/新配色，这一屏：
 *   - 候选数自动变大
 *   - 可组合空间自动变大
 *   - 能抽到的东西自动变多
 * 一行代码都不用改。以后新增**整层**维度时，只需在工作流里加一步
 * （或 GACHA.register 一条），这一屏同样自动多出一行。
 *
 * 所以这一屏里**不出现任何写死的数量**——写死就会出现
 * 「界面说 59 种画风、实际能抽到 71 种」这种自己跟自己矛盾的画面。
 * ============================================================ */

/* 抽卡自己的运行态。模型 / 比例 / key 走 RND（与出图工作流共享），
   那是「出图设置」，在哪一屏改都该是同一份；
   下面这些是「这一批抽卡的过程」，不该串到工作流那边去。 */
var GCH = {
  n: 6,
  cards: null,
  busy: false,
  stop: false,
  msg: "",
  lock: {}
};

/* ---------- 取共享设置 ----------
   出图工作流那一屏定义了 RND（模型 / 比例 / key / 自定义尺寸）。
   这里直接复用而不是另起一份：两屏各存一份「发到哪去」的话，
   用户在抽卡页选了 9:16、切回工作流又变回 1:1，
   而两处都「记得」自己是对的。

   注意 RND 里**没有内容选择**（画风/题材/版式/配色）——
   那些是库的事，这一屏只从库取，不读工作流的当前选择。 */
function gchWin() {
  return (typeof window !== "undefined") ? window
       : (typeof globalThis !== "undefined") ? globalThis : null;
}

function gchRnd() {
  var w = gchWin();
  if (!w) return null;
  if (!w.RND) {
    /* 出图工作流那一层没加载时的兜底：抽卡至少不该整屏报错。
       默认值取 RENDER 的常量，不写死字符串——
       默认模型改了这里会跟着改。 */
    var R = w.RENDER || {};
    w.RND = { model: R.DEFAULT_MODEL || "sana", ratio: R.DEFAULT_RATIO || "1:1",
              custom: "", seed: "", key: "" };
  }
  return w.RND;
}

/* 切到另一屏。走 index.html 里的 goSec —— 那是「切板块」的唯一入口，
   各视图自己拼 state.sec + buildNav + render 的话，
   漏掉 buildFilters 会让筛选条停在上一屏的 chip 上。 */
function gchGo(sec) {
  var w = gchWin();
  if (w && typeof w.goSec === "function") { w.goSec(sec); return true; }
  return false;
}

/* ---------- 样式 ---------- */
(function injectGachaCss() {
  if (typeof document === "undefined") return;
  var s = document.createElement("style");
  s.textContent = [
    /* 抽卡这一屏整体用出图面板同一套视觉（.st-go），
       但它自己这几块（池构成 / 槽位行）单独定义。 */
    ".gc-pool{display:flex;gap:6px;flex-wrap:wrap;align-items:center}",
    ".gc-pool .pc{font-size:11px;border:1px solid var(--line);border-radius:12px;padding:3px 10px;",
    "background:var(--panel2);color:#c6cddf}",
    ".gc-pool .pc b{color:#e6eaf2;font-weight:600}",
    ".gc-pool .pc.on{border-color:var(--accent);background:rgba(124,92,255,.14)}",
    ".gc-pool .sp{font-size:11.5px;color:var(--dim2)}",
    ".gc-pool .sp b{color:var(--accent2);font-weight:700;font-size:13px;font-family:ui-monospace,Menlo,Consolas,monospace}",

    ".gc-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:7px}",
    ".gc-slot{display:flex;gap:8px;align-items:center;border:1px solid var(--line);border-radius:8px;",
    "padding:6px 9px;background:var(--panel2);flex-wrap:nowrap}",
    ".gc-slot.on{border-color:var(--accent);background:rgba(124,92,255,.13)}",
    ".gc-slot.bad{border-color:rgba(252,165,165,.5)}",
    ".gc-slot .lb{font-size:12px;font-weight:600;flex:0 0 auto}",
    /* seg 与 ct 都允许被压缩并省略：
       画风那一槽的段码是 5 个（ST / ER / SB / RG / MV），
       不给收缩的话它会把下拉挤到第二行，
       四张槽位卡高度不一致，看起来像布局坏了。 */
    ".gc-slot .sg{font-size:9.5px;color:var(--dim2);font-family:ui-monospace,Menlo,Consolas,monospace;",
    "flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".gc-slot .ct{font-size:10px;color:var(--dim2);white-space:nowrap;flex:0 0 auto}",
    ".gc-slot .ct b{color:#c6cddf;font-weight:600}",

    /* 锁定下拉。宽一点：里面的文字是「ST-001 赛璐璐平涂」这种长串，
       窄了会把中文截掉，只留下编码——而用户认的是中文名。
       候选多的时候靠浏览器原生下拉滚动，不做自定义控件。 */
    ".gc-slot select.gc-pick{flex:1 1 auto;min-width:0;background:#0b0d12;border:1px solid var(--line);",
    "border-radius:7px;color:#dfe4ee;font-size:10.5px;padding:3px 6px;",
    "font-family:ui-monospace,Menlo,Consolas,monospace}",
    ".gc-slot select.gc-pick:focus{outline:none;border-color:var(--accent2)}",
    ".gc-slot.on select.gc-pick{border-color:var(--accent);color:#e6eaf2}",

    /* ---- 卡片 ---- */
    ".gc-view .st-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(238px,1fr));gap:10px}",
    ".gc-view .st-card{border:1px solid var(--line);border-radius:9px;overflow:hidden;",
    "background:#0b0d12;display:flex;flex-direction:column}",
    ".gc-view .st-card.done{border-color:rgba(52,211,153,.4)}",
    ".gc-view .st-card.bad{border-color:rgba(252,165,165,.45)}",
    ".gc-view .st-card .ph{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;",
    "color:var(--dim2);font-size:10.5px;text-align:center;padding:10px;line-height:1.6;background:#07090d}",
    ".gc-view .st-card img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#07090d}",

    /* 组合信息：每一层一行「层名 · 编码 · 中文名」。
       只给一串编码是不够的——编码是给机器用的，
       用户要判断「这组我想不想出图」只能看中文名。 */
    ".gc-view .st-card .cm{border-top:1px solid var(--line);padding:6px 8px;display:flex;",
    "flex-direction:column;gap:2px}",
    ".gc-view .st-card .cm-r{display:flex;gap:5px;align-items:baseline;font-size:10px;line-height:1.5}",
    ".gc-view .st-card .cm-k{flex:0 0 26px;color:var(--dim2)}",
    ".gc-view .st-card .cm-c{flex:0 0 auto;font-family:ui-monospace,Menlo,Consolas,monospace;",
    "color:#8f9bb3;font-size:9.5px}",
    ".gc-view .st-card .cm-z{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;",
    "white-space:nowrap;color:#c6cddf}",
    ".gc-view .st-card .cm-r.na .cm-z{color:#fca5a5}",

    ".gc-view .st-card .cf{display:flex;gap:5px;align-items:center;padding:6px 8px;",
    "border-top:1px solid var(--line)}",
    ".gc-view .st-card .cf .cc{font-size:9.5px;font-family:ui-monospace,Menlo,Consolas,monospace;",
    "color:var(--dim2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
    "flex:1 1 auto;min-width:0;cursor:copy}",
    ".gc-view .st-card .cf .cc:hover{color:var(--accent2)}",
    ".gc-view .st-card .cf .mini{padding:1px 7px;font-size:9.5px;flex:0 0 auto;white-space:nowrap}",
    ".gc-view .st-card .ph b{display:block;color:#c6cddf;font-size:11px;margin-bottom:4px}",
    ".gc-view .st-card .ph em{font-style:normal;display:block;margin-top:5px;color:var(--dim2)}",

    /* 空槽警告：少一层约束的图照样能出，只是出的不是你要的东西。
       不显式写出来，用户只会觉得「这次抽的都不太对」。 */
    ".gc-empty{border-left:2px solid #f87171;background:rgba(248,113,113,.09);color:#fca5a5;",
    "font-size:11px;line-height:1.7;padding:7px 11px;border-radius:0 7px 7px 0}",
    ".gc-big{font-size:13px;font-weight:700;color:#e6eaf2}",
    ".gc-sum{font-size:11px;color:var(--dim2);line-height:1.7}"
  ].join("\n");
  document.head.appendChild(s);
})();

/* ============================================================
 * 渲染
 * ============================================================ */
function openRenderGacha() {
  if (typeof GACHA === "undefined" || typeof RENDER === "undefined") {
    el("grid").innerHTML = '<div class="ov-wrap"><div class="ov-warn">'
      + '抽卡未加载（assets/gacha.js 或 assets/render.js 未进入 index.html），此视图不可用。</div></div>';
    el("filters").innerHTML = "";
    return;
  }

  var rnd = gchRnd() || {};
  var model = RENDER.modelById(rnd.model) || RENDER.modelById(RENDER.DEFAULT_MODEL);
  var ch = RENDER.CHANNELS[model.channel];
  var canDraw = model.channel === "anon";       /* 只有免 key 通道开放抽卡 */
  var p = GACHA.pool(GCH.lock);
  var spec = rnd.ratio === "custom" ? (rnd.custom || "") : rnd.ratio;
  var size = RENDER.pxOf(spec, RENDER.DEFAULT_TIER);

  /* ---------- 顶部：这一屏是什么 + 池有多大 ---------- */
  var poolChips = '<div class="gc-pool">'
    + p.slots.map(function (s) {
        return '<span class="pc' + (GCH.lock[s.key] ? " on" : "") + '">'
          + esc(s.label) + ' <b>' + s.count + '</b></span>';
      }).join("")
    + '<span class="sp">→ 可组合 <b>' + p.spaceZh + '</b> 种</span>'
    + '</div>';

  var intro = '<div class="ov-panel">'
    + '<div class="ov-title">一键抽卡</div>'
    + '<div class="ov-sub">从库里<b>随机抽一组组合</b>连着出图 —— 每一张的四步都是重新抽的，'
    + '不是同一段提示词换 seed（那是同一张图看六遍）。'
    + '每张卡下面写着它用的是库里哪几条（层名 · 编码 · 中文名），'
    + '挑中哪组点「去精修」，那组会带进<b>出图工作流</b>再慢慢调。</div>'
    + poolChips
    + '<div class="gc-sum">上面每一个数字都是<b>照着库现算的</b>。'
    + '库以后补了新的画风 / 题材 / 版式 / 配色，这里的候选数与可组合空间会自动变大，'
    + '抽卡逻辑一行都不用改——所以这个数字不是写死的，它不会过期。</div>'
    + '</div>';

  /* ---------- 控制条 ---------- */
  var head = '<div class="gh">'
    + '<span class="gt">抽卡设置</span>'
    + '<span class="gs">' + size.w + "×" + size.h + '</span>'
    + '<span class="grow">'
    +   (GCH.busy
          ? '<button class="btn" data-gc-stop>停止</button>'
          : '<button class="btn act" data-gc-run' + (canDraw ? "" : " disabled") + '>开始抽卡</button>')
    + '</span></div>';

  var mdlRow = '<span class="opt"><span class="ol">模型</span>'
    + RENDER.MODELS.map(function (m) {
        return '<button class="mini chan-' + m.channel + (rnd.model === m.key ? " on" : "")
          + '" data-gc-model="' + m.key + '" title="' + esc(m.tip) + '">'
          + '<span class="bd"></span>' + esc(m.zh) + '</button>';
      }).join("") + '</span>';

  var ratioRow = '<span class="opt"><span class="ol">出图比例</span>'
    + RENDER.RATIOS.map(function (r) {
        return '<button class="mini' + (rnd.ratio === r ? " on" : "") + '" data-gc-ratio="' + r
          + '">' + r + '</button>';
      }).join("")
    + '<button class="mini' + (rnd.ratio === "custom" ? " on" : "") + '" data-gc-ratio="custom"'
    +   ' title="自己填像素，如 1024x1536">自定义</button>'
    + (rnd.ratio === "custom"
        ? '<input class="st-size' + (size.known ? "" : " bad") + '" data-gc-size placeholder="1024x1536"'
          + ' value="' + esc(rnd.custom || "") + '">'
        : "")
    + '</span>';

  var nRow = '<span class="opt"><span class="ol">张数</span>'
    + [4, 6, 9, 12].map(function (n) {
        return '<button class="mini' + (GCH.n === n ? " on" : "") + '" data-gc-n="' + n
          + '">' + n + ' 张</button>';
      }).join("")
    + '</span>';

  var opts = '<div class="opts">' + mdlRow + '</div>'
    + '<div class="opts">' + ratioRow + '</div>'
    + '<div class="opts">' + nRow + '</div>';

  /* key 只在需要它的通道出现 —— 与出图工作流同一个判定 */
  if (ch.needKey) {
    opts += '<div class="keyrow">'
      + '<span class="ol" style="font-size:10.5px;color:var(--dim2)">API key</span>'
      + '<input class="st-key" data-gc-key type="password" placeholder="粘贴到 gen.pollinations.ai 的 key"'
      +   ' value="' + esc(rnd.key || "") + '">'
      + '<span class="tip">只存在这一页的内存里，不写硬盘、不进 URL。</span>'
      + '</div>';
  }

  /* ---------- 槽位：每一槽都能从库里挑一条固定住 ---------- */
  var slotRows = p.slots.map(function (s) {
    var locked = !!GCH.lock[s.key];
    /* 段码多于一个时只显示「N 段」，完整列表放 title。
       画风那一槽是 ST / ER / SB / RG / MV 五个，
       原样铺开会把这一行撑到两行高，几行卡对不齐。 */
    var segTxt = s.seg
      ? (s.seg.indexOf(" / ") >= 0 ? s.seg.split(" / ").length + " 段" : s.seg)
      : "";

    /* 锁定值直接从库的候选里挑，**不读工作流的当前选择**。
       早前是「先去出图工作流选好，回来点锁定」——
       那等于让这一屏依赖另一屏的状态，而两边都能被单独改，
       最后一定会出现「锁的是 A、工作流里显示 B」这种对不上的画面。

       候选用原生 <select>：画风有 59 条，自定义控件要自己处理
       滚动、键盘与移动端，收益是零。 */
    var pick = '<select class="gc-pick" data-gc-pick="' + s.key + '"'
      + (s.empty ? " disabled" : "")
      + ' title="' + esc(locked
            ? "已锁定：「" + (s.lockZh || locked) + "」固定，其余层继续随机。"
            : "从库里挑一条把这一层固定住，其余层继续随机。")
      + '">'
      + '<option value=""' + (locked ? "" : " selected") + '>随机（每次从库里抽）</option>'
      + s.entries.map(function (e) {
          return '<option value="' + esc(e.id) + '"' + (locked === e.id ? " selected" : "") + '>'
            + esc((e.code ? e.code + " " : "") + e.zh) + '</option>';
        }).join("")
      + '</select>';

    return '<div class="gc-slot' + (locked ? " on" : "") + (s.empty ? " bad" : "") + '">'
      + '<span class="lb">' + esc(s.label) + '</span>'
      + (segTxt ? '<span class="sg" title="' + esc(s.seg) + '">' + esc(segTxt) + '</span>' : "")
      + pick
      + '<span class="ct">' + (s.empty ? '<b style="color:#fca5a5">这一层是空的</b>'
                                       : '<b>' + s.count + '</b> 条') + '</span>'
      + '</div>';
  }).join("");

  var slotsBlock = '<div class="opts" style="flex-direction:column;align-items:stretch;gap:6px">'
    + '<div class="gc-sum">抽卡池的每一行对应库里的一层。'
    + '<b>下拉里就是库的候选</b>——挑一条这一层就固定住，其余层继续随机'
    + '（比如「画风固定成赛璐璐，只抽题材和配色」）。'
    + '选回「随机」即解锁。这里的选项全部来自库本身，与出图工作流当前选了什么无关。</div>'
    + '<div class="gc-slots">' + slotRows + '</div>'
    + (Object.keys(GCH.lock).length
        ? '<div class="gc-sum"><button class="mini" data-gc-unlock>全部解锁</button>'
          + ' 当前锁了 ' + Object.keys(GCH.lock).length + ' 层，可组合空间收窄到 '
          + p.spaceZh + ' 种。</div>'
        : "")
    + '</div>';

  /* 空槽必须显式警告：少一层约束的提示词照样能出图，
     只是出的不是你要的东西，而用户只会觉得「这次抽的都不太对」。 */
  var emptyWarn = p.empty.length
    ? '<div class="gc-empty">有 ' + p.empty.length + ' 层库<b>当前是空的</b>（'
      + p.empty.join(" / ") + '）：抽出来的组合会少这几层约束。'
      + '这是数据层的问题，不是抽卡坏了 —— 补上那几层的条目即可，抽卡会自动恢复。</div>'
    : "";

  /* 通道限制说清楚，并且给一条能立刻走的路 */
  var chanBlock = "";
  if (!canDraw) {
    chanBlock = '<div class="notice">'
      + (model.channel === "keyed"
          ? '<b>要 key 的通道不开放抽卡</b>：它按 token 计费，一次铺 6 张等于你没看见就花了六份钱。'
            + '用下面的按钮一键切到免 key 通道抽，抽到中意的再切回来精修那一张。'
          : '<b>Midjourney 没有公开出图 API</b>，抽不出图。'
            + '用免 key 通道抽组合，再把「去精修」拿到的提示词粘到 MJ 里。')
      + '</div>'
      + '<div class="sf"><button class="btn k" data-gc-tosana>切到 Sana · 免 key 抽卡</button></div>';
  }

  /* 当前模型按什么语法写词 —— 抽卡出的每张图都用这一版。
     取值走 MODEL_PROMPTS（不改写，只显示它给这一版配的说明），
     界面上不自己复述一遍「MJ 只吃标签」——
     复述就意味着两处说法可能不一致，而不一致时用户无从判断该信哪个。 */
  var syntaxNote = "";
  if (typeof MODEL_PROMPTS !== "undefined") {
    var o = MODEL_PROMPTS.of(model.key, { lang: "en", ratio: spec });
    if (o && o.note) {
      syntaxNote = '<div class="gc-sum">这一批提示词按 <b>' + esc(model.zh)
        + '</b> 的语法写：' + esc(o.note) + '</div>';
    }
  }

  /* ---------- 卡片 ---------- */
  /* 这批卡是按哪个模型的语法写的。
     必须在界面上写出来：MJ 那批是标签、Flux 那批是散文，
     用户拿 MJ 的标签去粘 Flux 是无效输入 —— 而卡片长得一模一样，
     不说的话他会以为抽卡给错了。 */
  var curModel = RENDER.modelById((gchRnd() || {}).model) || RENDER.modelById(RENDER.DEFAULT_MODEL);
  var mName = curModel ? curModel.zh : "";

  var body;
  if (!GCH.cards) {
    body = '<div class="shot wait">还没有抽。<br>点「开始抽卡」会随机铺开 '
      + GCH.n + ' 组不同组合，一串一串地出图。</div>';
  } else {
    body = '<div class="st-cards">' + GCH.cards.map(function (c, i) {
      var inner;
      if (c.url) {
        inner = '<a href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer"'
          + ' referrerpolicy="no-referrer" title="点开看原图"><img src="' + esc(c.url)
          + '" alt="第 ' + (i + 1) + ' 张" referrerpolicy="no-referrer"></a>';
      } else {
        inner = '<div class="ph"><b>第 ' + (i + 1) + ' 张</b>' + esc(c.status || "") + '</div>';
      }

      /* ---- 组合信息：这张图用的是库里哪几条 ----
         一行一层：层名 · 编码 · 中文名。
         只给一串编码是不够的 —— 编码是给机器（与复制粘贴）用的，
         用户判断「这组我想不想出图」只能靠中文名。
         两样都给，才叫「方便选取」。
         某一层库是空的时写明，不要留空行：
         空的看起来像加载失败，实际是这一层没数据。 */
      var cm = '<div class="cm">' + (c.rows || []).map(function (r) {
        return '<div class="cm-r' + (r.empty ? " na" : "") + '"'
          + ' title="' + esc(r.label + " · " + (r.empty ? "（空）" : (r.code || r.id)) + " · "
                             + (r.empty ? "库里这一层没有条目" : r.zh)) + '">'
          + '<span class="cm-k">' + esc(r.label) + '</span>'
          + '<span class="cm-c">' + esc(r.empty ? "—" : (r.code || r.id)) + '</span>'
          + '<span class="cm-z">' + esc(r.empty ? "库里这一层是空的" : r.zh) + '</span>'
          + '</div>';
      }).join("") + '</div>';

      var retry = (c.error && !GCH.busy)
        ? '<button class="mini" data-gc-retry="' + i + '">重抽</button>' : "";
      var tried = (c.tries > 1)
        ? '<span class="mini" style="border:0;color:var(--dim2);cursor:default">试' + c.tries + '次</span>'
        : "";
      return '<div class="st-card ' + (c.url ? "done" : (c.error ? "bad" : "")) + '">'
        + inner
        + cm
        + '<div class="cf">'
        +   /* data-gc-chain 是给机器读的原始组合串（测试、以后可能的「导出这批」
               都用它）；title 是给人看的，带一句提示语。
               两者混在一个属性里，代码取到的就会是「提示语 + 编码」，
               看起来像数据错了。 */
            '<span class="cc" data-gc-copy="' + i + '" data-gc-chain="' + esc(c.chain) + '"'
        +     ' title="点一下复制组合串：' + esc(c.chain) + '">' + esc(c.chain) + '</span>'
        +   tried + retry
        +   '<button class="mini" data-gc-prompt="' + i + '"'
        +     ' title="复制这张图实际用的那版提示词（按 ' + esc(mName) + ' 的语法写的）">复制提示词</button>'
        +   '<button class="mini" data-gc-adopt="' + i + '" style="margin-left:auto"'
        +     ' title="把这组组合带进「出图工作流」，在那边慢慢调">去精修</button>'
        + '</div></div>';
    }).join("") + '</div>';
  }

  var distNote = GCH.cards && GCH.distinctNote
    ? '<div class="gc-sum">' + esc(GCH.distinctNote) + '</div>' : "";

  var msg = GCH.msg
    ? '<div class="msg' + (/失败|超时|挡掉|空的|不给|没有/.test(GCH.msg) ? " err" : "") + '">'
      + esc(GCH.msg) + '</div>' : "";

  var bound = '<div class="bound">'
    + '<b>三条边界，抽之前请先知道：</b><br>'
    + '① 提示词会<b>离开你的电脑</b>，发到 ' + esc(ch.host || "第三方通道") + '。'
    + '介意就别用这个按钮，复制正文去你自己的模型里跑。<br>'
    + '② 抽出来的图<b>带通道水印</b>，商用前自己裁掉。'
    + '免 key 通道还有配额限制：约一半请求会被挡回来，'
    + '所以每张会自动重试最多 ' + RENDER_NET.RETRY.max + ' 次（退避 '
    + (RENDER_NET.RETRY.baseMs / 1000) + '/' + (RENDER_NET.RETRY.baseMs * 2 / 1000)
    + '/' + (RENDER_NET.RETRY.baseMs * 4 / 1000) + ' 秒）——<b>整批等几分钟是正常的</b>。<br>'
    + '③ 图里的文字仍然是乱码，版式留白区留给后期排字。'
    + '</div>';

  el("grid").innerHTML = '<div class="ov-wrap">' + intro
    + '<div class="st-go gc-view">' + head + opts + chanBlock + syntaxNote + emptyWarn
    + slotsBlock + msg + distNote + body + bound + '</div></div>';

  bindGacha();
  el("filters").innerHTML = "";
}

/* ============================================================
 * 事件
 * ============================================================ */
function bindGacha() {
  var g = el("grid");
  var rnd = gchRnd() || {};

  function rerun() { openRenderGacha(); }
  function clearCards() { GCH.cards = null; GCH.msg = ""; GCH.distinctNote = ""; }

  g.querySelectorAll("[data-gc-n]").forEach(function (b) {
    b.onclick = function () {
      GCH.n = +b.dataset.gcN;
      clearCards();
      rerun();
    };
  });
  g.querySelectorAll("[data-gc-model]").forEach(function (b) {
    b.onclick = function () {
      rnd.model = b.dataset.gcModel;
      /* 换通道就作废上一批：不同通道抽出来的图混在一屏，
         用户没法判断哪张是哪条路出来的。 */
      clearCards();
      rerun();
    };
  });
  g.querySelectorAll("[data-gc-ratio]").forEach(function (b) {
    b.onclick = function () {
      rnd.ratio = b.dataset.gcRatio;
      rnd.seed = "";
      clearCards();
      rerun();
    };
  });
  g.querySelectorAll("[data-gc-tosana]").forEach(function (b) {
    b.onclick = function () { rnd.model = "sana"; clearCards(); rerun(); };
  });

  /* 锁定 = 从库里挑一条。
     下拉里第一项是「随机（每次从库里抽）」，选它就等于解锁 ——
     用同一个控件完成锁与解锁，比「下拉 + 一个取消按钮」少一个要维护的状态。

     值直接取自选项的 value（条目 id），不经过工作流。
     换锁要清上一批卡片：卡片上写着组合，锁定改了而卡片还留着旧组合，
     两者会对不上，而画面看起来完全正常。 */
  g.querySelectorAll("[data-gc-pick]").forEach(function (sel) {
    sel.onchange = function () {
      var key = sel.dataset.gcPick;
      var v = sel.value;
      if (v) GCH.lock[key] = v; else delete GCH.lock[key];
      clearCards();
      rerun();
    };
  });
  g.querySelectorAll("[data-gc-unlock]").forEach(function (b) {
    b.onclick = function () { GCH.lock = {}; clearCards(); rerun(); };
  });
  g.querySelectorAll("[data-gc-copy]").forEach(function (b) {
    b.onclick = function () {
      var c = (GCH.cards || [])[+b.dataset.gcCopy];
      if (c) { copy(c.chain); }
    };
  });
  /* 复制这张图**实际用的**那版提示词。
     与「复制组合串」分开：组合串是四步编码（给人记、给库用），
     提示词是发出去的那段文字（给模型）。两者混在一起时
     用户会拿一串 ST-003 + TH-012 去粘模型，那不是提示词。 */
  g.querySelectorAll("[data-gc-prompt]").forEach(function (b) {
    b.onclick = function () {
      var c = (GCH.cards || [])[+b.dataset.gcPrompt];
      if (c && c.prompt) copy(c.prompt);
    };
  });
  g.querySelectorAll("[data-gc-adopt]").forEach(function (b) {
    b.onclick = function () {
      var c = (GCH.cards || [])[+b.dataset.gcAdopt];
      if (!c) return;
      GACHA.adopt(c.ids);
      toast("已把这组组合带进出图工作流");
      gchGo("openstudio");
    };
  });
  g.querySelectorAll("[data-gc-stop]").forEach(function (b) {
    b.onclick = function () { GCH.stop = true; };
  });
  g.querySelectorAll("[data-gc-retry]").forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.gcRetry;
      var c = (GCH.cards || [])[i];
      if (!c || GCH.busy) return;
      fetchCard(c, i, function () {});
    };
  });
  g.querySelectorAll("[data-gc-run]").forEach(function (b) {
    b.onclick = function () { runGacha(); };
  });

  /* 只存值不重渲染：逐字重渲染会把正在输入的内容清掉 */
  g.querySelectorAll("[data-gc-key]").forEach(function (inp) {
    inp.addEventListener("input", function () { rnd.key = inp.value; });
  });
  g.querySelectorAll("[data-gc-size]").forEach(function (inp) {
    inp.addEventListener("input", function () { rnd.custom = inp.value; });
    inp.addEventListener("blur", function () { clearCards(); rerun(); });
  });
}

/* ---------- 一张卡：抽 → 出图 → 落到卡上 ---------- */
function fetchCard(c, i, done) {
  var rnd = gchRnd() || {};
  var spec = rnd.ratio === "custom" ? (rnd.custom || "") : rnd.ratio;
  RENDER_NET.fetchRetry(c.prompt,
    { ratio: spec, tier: RENDER.DEFAULT_TIER, model: rnd.model, seed: RENDER.randSeed(), key: rnd.key },
    function (text, tries) {
      c.status = text; c.tries = tries;
      openRenderGacha();
    },
    function (res) {
      c.tries = res.tries;
      if (res.error) {
        c.error = true; c.url = "";
        c.status = "试了 " + res.tries + " 次都没拿到（" + (res.why || "")
          + "），可以稍后点「重抽」";
      } else {
        c.error = false; c.url = res.url; c.status = "";
      }
      openRenderGacha();
      done(res);
    });
}

/* ---------- 一批：串行推进 ----------
   串行不是保守，是必须：免 key 通道本来就一并发就 402。
   而且**下一张的计时从上一张收完开始**，不是从发出开始 ——
   按发出时间排的话，一张要 5–40 秒，第 2 张会在第 1 张还没回来时发出去，
   两个请求重叠，后到的那个撞上限流（实测 4 张只成 1 张）。 */
function runGacha() {
  if (GCH.busy) return;
  var rnd = gchRnd() || {};
  var model = RENDER.modelById(rnd.model) || RENDER.modelById(RENDER.DEFAULT_MODEL);
  if (model.channel !== "anon") {
    GCH.msg = RENDER_NET.whyOf(model.channel === "keyed" ? "needkey" : "manual")
            || "这条通道不开放抽卡。";
    openRenderGacha();
    return;
  }

  var spec = rnd.ratio === "custom" ? (rnd.custom || "") : rnd.ratio;
  var size = RENDER.pxOf(spec, RENDER.DEFAULT_TIER);
  if (!size.known) {
    GCH.msg = "自定义尺寸不合法：" + (size.why || "看不懂") + "。边长要 "
            + RENDER.PX_MIN + "–" + RENDER.PX_MAX + " 之间，写成 1024x1536 这样。";
    openRenderGacha();
    return;
  }

  /* model 一起传下去：抽出来的每张都按当前模型改写提示词
     （MJ 给标签+参数、Flux 给散文、Sana 给自然语言）。
     不传的话这里发出去的是通用英文正文 ——
     于是抽卡页选出的是 MJ，出的却不是能粘进 MJ 的那版词，
     而界面上没有任何地方能看出这件事。 */
  var batch = GACHA.rollBatch(GCH.n, { lock: GCH.lock, ratio: spec, model: rnd.model });
  var cards = batch.cards.map(function (c, i) {
    return { ids: c.ids, rows: c.rows, codes: c.codes, names: c.names,
             chain: c.chain, prompt: c.prompt, url: "", error: false, tries: 0,
             status: i === 0 ? "生成中…" : "等前一张" };
  });
  GCH.cards = cards;
  GCH.busy = true;
  GCH.stop = false;
  GCH.distinctNote = batch.note || "";
  GCH.msg = "正在串行出图（" + size.w + "×" + size.h + "）。"
          + "这张通道约一半请求会被挡回来，每张最多自动重试 "
          + RENDER_NET.RETRY.max + " 次，整批可能要等几分钟 —— 这是配额问题，不是页面卡住了。";
  openRenderGacha();

  var idx = 0;
  function step() {
    if (GCH.stop) {
      GCH.busy = false;
      GCH.msg = "已停止。已经抽出来的 " + cards.filter(function (c) { return c.url; }).length
              + " 张留在下面，可以继续「去精修」。";
      openRenderGacha();
      return;
    }
    if (idx >= cards.length) {
      GCH.busy = false;
      var ok = cards.filter(function (c) { return c.url; }).length;
      var retried = cards.filter(function (c) { return c.url && c.tries > 1; }).length;
      if (ok === 0) {
        GCH.msg = "一张都没拿到——这条通道的配额多半是暂时用完了。"
                + "隔几分钟再试，或去「出图工作流」用要 key 的通道出一张（那边按你自己的额度走）。";
      } else {
        GCH.msg = "抽完了，" + ok + "/" + cards.length + " 张成功"
                + (retried ? "（其中 " + retried + " 张是重试后才拿到的）" : "")
                + (ok < cards.length ? "。没拿到的卡片可以点「重抽」单独补。" : "。")
                + "点「去精修」把中意的那组带进出图工作流。";
      }
      openRenderGacha();
      return;
    }
    var i = idx++;
    GCH.msg = "第 " + (i + 1) + "/" + cards.length + " 张…";
    fetchCard(cards[i], i, function () {
      /* 从这一张**收完**开始算间隔，而不是从发出开始 */
      setTimeout(step, RENDER.gapMs("sana"));
    });
  }
  step();
}
