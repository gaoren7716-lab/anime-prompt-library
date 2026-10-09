/* ============================================================
 * studio-ui.js —— 出图工作流的界面层
 * ============================================================
 * 定位：这是「照着就能出图」的那一屏。
 *
 * 前面那些视图（十二库浏览 / 统一检索 / 组合工作台 / 变形工作台）
 * 都是查工具：用户得先知道库里有什么、再决定怎么拼。
 * 这一屏反过来——用户先说「我要一张什么图」，
 * 四步选完直接拿走可粘贴的提示词，不需要知道任何内部概念。
 *
 * 依赖（由 index.html 提供的全局）：esc / copy / toast / el / state / nodeCode
 * 依赖数据：STUDIO（assets/studio.js）
 *
 * 四条界面纪律：
 *   ① **缺步要说人话**。没选题型时显示「缺哪一项、缺了会怎样」，
 *      而不是给一段看着完整、实际少一层约束的提示词。
 *   ② **正文默认中文，英文并排给出**。国内用户直接改字，
 *      喂 GPT-Image / Midjourney / Flux 时切英文版。
 *   ③ **复制点跟字段一一对应**。每段文本旁边就是它的复制按钮，
 *      不设「一键复制全部」——全部复制会把画幅、授权、缺失提示
 *      一起粘进提示词框，那是废图而不是错图，更难排查。
 *   ④ **色卡用真实色值渲染**。配色层的意义就是颜色本身，
 *      只显示名字等于没显示。
 *
 *   ⑤ **「一键出图」必须说清它连的是谁、能不能真出图**。
 *      这一屏能真的出图，但走的是第三方通道：图会发到外部服务器，
 *      模型与水印都不受本库控制。不写这一句，用户会以为图是
 *      「按本库的授权规则生成的」——而授权只管提示词文本，
 *      管不了模型推理阶段强加的水印。
 *      同理，**做不到的项标做不到**：Midjourney 没有公开 API 就不给按钮，
 *      免 key 通道实际只出 Sana 就照实叫 Sana。见下方出图面板。
 *
 *   ⑥ **一屏只做一件事，且不留半截入口**。
 *      「一键抽卡」是完全独立的一屏（assets/gacha-ui.js）：
 *      它和这里的使用节奏相反——这一屏是「已经想好要什么」，
 *      抽卡是「还不知道要什么」。
 *      早前这里还留着一个「去抽卡」的盒子，那是个坏折中：
 *      用户在这一屏看到随机功能，就会以为抽卡是在「按当前四步换 seed」，
 *      而这恰恰是错的。**抽卡相关内容在这一屏一个字都不出现**，
 *      要去抽卡从侧栏走。
 *
 *   ⑦ **清晰度不是用户选项**。出图尺寸固定走 RENDER.DEFAULT_TIER
 *      （标准档，长边 768）。早前给过两档按钮，但这一屏真正需要用户
 *      决定的是「画什么」（四步）与「发到哪」 （模型与比例）；
 *      尺寸是一个中途谁也不会回来改的参数，摆在那里只会让人多按一次。
 *      要改默认档只改 RENDER.DEFAULT_TIER 一处，不要在这里加回按钮。
 * ============================================================ */

/* ---------- 视图状态 ---------- */
/* 搜索词按步骤分开存：四栏各自过滤，互不影响。
   放在这里而不是 STUDIO 里，因为它只服务于这一屏。 */
var SUP = { q: { style: "", theme: "", layout: "", palette: "" }, cat: {} };

/* 读常量而不是写死字符串：默认模型改了这里要跟着变，
   写死 "gpt-image-2" 的话换默认模型时会静默留在旧模型上。
   注意这两个常量必须声明在 RND 之前 —— var 虽然会提升，
   但提升只给 undefined，RND.model 会静默变成 undefined。 */
var RENDER_DEFAULT_MODEL = "gpt-image-2";
var RENDER_DEFAULT_RATIO = "1:1";

/* 出图设置 + 出图工作流自己的运行态。
   ratio 用用户在这一屏选的比例（不是版式的ratio）——两件事分开：
   版式决定画面里东西怎么摆，出图比例决定画布什么形状。
   混在一起时「我选了 16:9」与「版式说 3:4」会打架，模型只能二选一。
   key 只存内存，不写 localStorage：它是一个凭据，
   留在磁盘上就等于留在任何能读这个目录的人手里。

   **这里没有 tier**。清晰度不再是用户选项，出图尺寸由
   RENDER.DEFAULT_TIER 决定（见文件头纪律⑦）。
   保留一个永远等于默认值的字段只会让人以为它还能被改。

   **这里也没有抽卡状态**。抽卡已经独立成一屏，且那一屏不读这里的
   任何内容选择（见 assets/gacha-ui.js）。 */
var RND = {
  model: RENDER_DEFAULT_MODEL,
  ratio: RENDER_DEFAULT_RATIO,
  custom: "",
  seed: "",
  key: "",
  busy: false, url: "", msg: ""
};

function supReset() {
  SUP.q = { style: "", theme: "", layout: "", palette: "" };
  SUP.cat = {};
  RND.busy = false;
  RND.url = "";
  RND.msg = "";
}

/* ---------- 样式 ---------- */
(function injectStudioCss() {
  if (typeof document === "undefined") return;
  var s = document.createElement("style");
  s.textContent = [
    ".st-flow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:14px;align-items:start}",
    "@media(max-width:1080px){.st-flow{grid-template-columns:1fr}}",

    /* --- 步骤卡 --- */
    ".st-step{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 13px;display:flex;flex-direction:column;gap:9px}",
    ".st-step.done{border-color:rgba(52,211,153,.45)}",
    ".st-hd{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}",
    ".st-hd .no{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10.5px;color:#0b0d12;background:var(--accent2);border-radius:4px;padding:1px 6px;font-weight:700}",
    ".st-hd .zh{font-size:14px;font-weight:600}",
    ".st-hd .req{font-size:10px;color:#fca5a5;border:1px solid rgba(248,113,113,.4);border-radius:4px;padding:0 5px}",
    ".st-hint{font-size:11px;color:var(--dim2);line-height:1.6}",
    ".st-cur{font-size:11.5px;color:#c6cddf;display:flex;align-items:center;gap:7px;flex-wrap:wrap;min-height:20px}",
    ".st-cur .nm{font-weight:600;color:#fff}",
    ".st-cur .none{color:var(--dim2)}",
    ".st-q{width:100%;background:#0b0d12;border:1px solid var(--line);border-radius:7px;color:#dfe4ee;font-size:12px;padding:6px 9px;font-family:inherit}",
    ".st-q:focus{outline:none;border-color:var(--accent2)}",
    ".st-cats{display:flex;flex-wrap:wrap;gap:4px}",
    ".st-cats .c{font-size:10.5px;padding:2px 8px;border-radius:12px;border:1px solid var(--line);color:var(--dim);cursor:pointer;background:var(--panel2)}",
    ".st-cats .c.on{border-color:var(--accent);color:#a89bff;background:rgba(124,92,255,.12)}",
    ".st-list{display:flex;flex-wrap:wrap;gap:5px;max-height:132px;overflow-y:auto}",
    ".st-it{font-size:11.5px;padding:3px 9px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:#c6cddf;cursor:pointer}",
    ".st-it:hover{border-color:var(--accent2);color:var(--accent2)}",
    ".st-it.on{border-color:var(--accent);background:rgba(124,92,255,.18);color:#fff;font-weight:600}",
    ".st-it i{font-style:normal;opacity:.55;margin-left:4px;font-size:10px;font-family:ui-monospace,Menlo,Consolas,monospace}",
    ".st-more{font-size:11px;color:var(--dim2);padding:2px 0}",

    /* --- 配色色卡 --- */
    ".st-pl{display:flex;flex-direction:column;gap:8px}",
    ".st-sw{display:flex;align-items:center;gap:9px;border:1px solid var(--line);background:var(--panel2);border-radius:8px;padding:7px 9px;cursor:pointer}",
    ".st-sw:hover{border-color:var(--accent2)}",
    ".st-sw.on{border-color:var(--accent);background:rgba(124,92,255,.16)}",
    ".st-sw .chip{width:34px;height:34px;border-radius:7px;border:1px solid rgba(255,255,255,.18);flex:0 0 auto;position:relative;overflow:hidden}",
    ".st-sw .chip b{position:absolute;right:0;bottom:0;width:13px;height:13px;border-top-left-radius:6px;border-top:1px solid rgba(255,255,255,.25);border-left:1px solid rgba(255,255,255,.25)}",
    ".st-sw .meta{display:flex;flex-direction:column;gap:2px;min-width:0}",
    ".st-sw .meta .n{font-size:12px;font-weight:600;color:#e6eaf2}",
    ".st-sw .meta .h{font-size:10px;color:var(--dim2);font-family:ui-monospace,Menlo,Consolas,monospace}",

    /* --- 结果区 --- */
    ".st-out{display:flex;flex-direction:column;gap:12px;position:sticky;top:0}",
    ".st-outhead{display:flex;gap:7px;flex-wrap:wrap;align-items:center}",
    ".st-lang{display:flex;gap:0;border:1px solid var(--line);border-radius:7px;overflow:hidden}",
    ".st-lang button{font-size:11.5px;padding:4px 13px;border:0;background:transparent;color:var(--dim);cursor:pointer;font-family:inherit}",
    ".st-lang button.on{background:var(--accent);color:#fff;font-weight:600}",
    ".st-block{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}",
    ".st-bh{display:flex;justify-content:space-between;align-items:center;gap:9px;padding:8px 12px;background:var(--panel2);border-bottom:1px solid var(--line);flex-wrap:wrap}",
    ".st-bh .t{font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:7px}",
    ".st-bh .t em{font-style:normal;font-size:10px;color:var(--dim2);font-weight:400}",
    ".st-bh .btn{font-size:10.5px;padding:3px 9px}",
    ".st-bb{font-size:11.5px;line-height:1.85;color:#d5dbe8;padding:11px 13px;max-height:230px;overflow-y:auto;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Menlo,Consolas,monospace}",
    ".st-bb.tight{max-height:110px}",
    ".st-kv{display:flex;gap:9px;padding:9px 13px;font-size:11.5px;line-height:1.7;border-bottom:1px solid var(--line);align-items:flex-start}",
    ".st-kv:last-child{border-bottom:0}",
    ".st-kv .k{flex:0 0 82px;color:var(--dim2);font-size:11px;padding-top:1px}",
    ".st-kv .v{color:#d5dbe8;min-width:0;word-break:break-word}",
    ".st-kv .v code{background:#0b0d12;border:1px solid var(--line);border-radius:4px;padding:1px 5px;font-size:10.5px;font-family:ui-monospace,Menlo,Consolas,monospace}",
    ".st-warn{border-left:2px solid #f87171;background:rgba(248,113,113,.08);color:#fca5a5;font-size:11.5px;line-height:1.7;padding:8px 12px;border-radius:0 8px 8px 0}",
    ".st-warn + .st-warn{margin-top:6px}",
    ".st-warn b{color:#fff}",
    ".st-note{border-left:2px solid var(--warn);background:rgba(251,191,36,.07);color:#fcd34d;font-size:11.5px;line-height:1.7;padding:8px 12px;border-radius:0 8px 8px 0}",
    ".st-ok{border-left:2px solid #34d399;background:rgba(52,211,153,.08);color:#6ee7b7;font-size:11.5px;line-height:1.7;padding:8px 12px;border-radius:0 8px 8px 0}",
    ".st-emptyp{font-size:12px;color:var(--dim2);line-height:1.9;text-align:center;padding:26px 16px}",
    ".st-sum{display:flex;gap:6px;flex-wrap:wrap}",
    ".st-sum .s{font-size:10.5px;border:1px solid var(--line);border-radius:12px;padding:2px 9px;color:var(--dim);background:var(--panel2)}",
    ".st-sum .s.on{border-color:rgba(52,211,153,.5);color:#6ee7b7}",
    ".st-sum .s b{color:#e6eaf2;font-weight:600}",

    /* --- 一键出图 --- */
    ".st-go{border:1px solid rgba(34,211,238,.34);background:rgba(34,211,238,.07);border-radius:10px;padding:11px 13px;display:flex;flex-direction:column;gap:9px}",
    ".st-go .gh{display:flex;align-items:center;gap:9px;flex-wrap:wrap}",
    ".st-go .gh .gt{font-size:12.5px;font-weight:600;color:#e6eaf2}",
    ".st-go .gh .gs{font-size:10.5px;color:var(--dim2);font-family:ui-monospace,Menlo,Consolas,monospace}",
    ".st-go .grow{margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap}",
    ".st-go .opts{display:flex;gap:12px;flex-wrap:wrap;align-items:center}",
    ".st-go .opt{display:flex;gap:5px;align-items:center}",
    ".st-go .opt .ol{font-size:10.5px;color:var(--dim2)}",
    ".st-go .mini{font-size:10.5px;padding:2px 9px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--dim);cursor:pointer;font-family:inherit}",
    ".st-go .mini.on{border-color:var(--accent2);color:#0b0d12;background:var(--accent2);font-weight:600}",
    ".st-go .mini:disabled{opacity:.5;cursor:not-allowed}",
    ".st-go .st-seed{width:112px;background:#0b0d12;border:1px solid var(--line);border-radius:12px;color:#dfe4ee;font-size:10.5px;padding:2px 9px;font-family:ui-monospace,Menlo,Consolas,monospace}",
    ".st-go .st-seed:focus{outline:none;border-color:var(--accent2)}",
    ".st-go .act{font-size:12px;padding:6px 15px}",
    ".st-go .msg{font-size:11px;line-height:1.65;color:#fcd34d}",
    ".st-go .msg.err{color:#fca5a5}",
    ".st-go .shot{position:relative;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#0b0d12;display:flex;align-items:center;justify-content:center;min-height:150px}",
    ".st-go .shot img{display:block;width:100%;height:auto}",
    ".st-go .shot.wait{color:var(--dim2);font-size:12px;padding:40px 16px;text-align:center;line-height:1.8}",
    ".st-go .sf{display:flex;gap:7px;flex-wrap:wrap;align-items:center}",
    ".st-go .bound{font-size:10.5px;line-height:1.7;color:var(--dim2);border-top:1px dashed var(--line);padding-top:8px}",
    /* ---------- 按模型优化的提示词 ----------
       五个模型各一块，竖排。默认提示词在最上面独立一块 ——
       它不属于任何一家模型，混进模型列表里就分不清了。

       .mp-card 用 data-mp-text 取复制内容，所以正文框不能是
       「标题+正文+按钮」拼在一起的那个节点：
       那样复制出来会带上按钮文案，粘进模型就是一段噪声。 */
    ".mp-wrap{display:flex;flex-direction:column;gap:9px;margin-top:10px}",
    ".mp-hd{font-size:11.5px;color:var(--dim2);line-height:1.7}",
    ".mp-hd b{color:#e6eaf2;font-size:12.5px;display:block;margin-bottom:2px}",
    ".mp-base{border:1px solid var(--line);border-radius:9px;background:var(--panel2);padding:8px 9px}",
    ".mp-bh{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}",
    ".mp-bh .t{font-size:12px;font-weight:600;color:#e6eaf2}",
    ".mp-bh .t em{font-style:normal;font-weight:400;font-size:10.5px;color:var(--dim2);margin-left:7px}",
    ".mp-bh .btn{margin-left:auto}",
    ".mp-list{display:flex;flex-direction:column;gap:8px}",
    /* 当前模型高亮：用户要知道「现在出图用的是哪一版」。
       用左侧色条而不是整块换背景色 —— 五块都是长文本，
       换背景色会让整屏都在闪。 */
    ".mp-card{border:1px solid var(--line);border-left:3px solid var(--line);border-radius:9px;background:var(--panel2);padding:8px 9px;display:flex;flex-direction:column;gap:6px}",
    ".mp-card.on{border-left-color:var(--accent);background:rgba(124,92,255,.08)}",
    ".mp-ch{display:flex;align-items:center;gap:7px;flex-wrap:wrap}",
    /* 画风名激活强度徽标。三档 + unknown（unknown 必须有自己的样式，
       否则「未标定」和「强」长得一样，就等于把不知道说成了知道）。 */
    ".mp-act{font-size:10px;padding:1px 6px;border-radius:4px;border:1px solid;white-space:nowrap}",
    ".mp-act.strong{color:#34d399;border-color:rgba(52,211,153,.4);background:rgba(52,211,153,.08)}",
    ".mp-act.weak{color:#fbbf24;border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.08)}",
    ".mp-act.none{color:#f87171;border-color:rgba(248,113,113,.45);background:rgba(248,113,113,.09)}",
    ".mp-act.unknown{color:var(--dim2);border-color:var(--line);background:transparent;border-style:dashed}",
    ".mp-ch .ct{font-size:12px;font-weight:600;color:#e6eaf2;white-space:nowrap}",
    ".mp-ch .cs{font-size:10.5px;color:var(--dim2);flex:1 1 auto;min-width:0}",
    ".mp-ch .crow{margin-left:auto;flex:0 0 auto}",
    /* 通道圆点与模型按钮那套一致：绿=要 key、黄=免 key、紫=无 API */
    ".mp-ch .bd{width:6px;height:6px;border-radius:50%;background:var(--dim2);flex:0 0 auto}",
    ".mp-ch .bd.chan-keyed{background:#34d399;box-shadow:0 0 0 2px rgba(52,211,153,.16)}",
    ".mp-ch .bd.chan-anon{background:#fbbf24;box-shadow:0 0 0 2px rgba(251,191,36,.16)}",
    ".mp-ch .bd.chan-manual{background:#a78bfa;box-shadow:0 0 0 2px rgba(167,139,250,.16)}",
    /* 这段话是「为什么这么写」，不是提示词本身。
       放在正文**上面**：先说清这版为什么不同，用户才知道该不该信它。 */
    ".mp-note{font-size:10.5px;line-height:1.7;color:var(--dim2);border-left:2px solid var(--line);padding-left:7px}",
    ".mp-bb{font-size:11px;line-height:1.75;color:#d4dae6;background:#07090d;border:1px solid var(--line);border-radius:7px;padding:8px 9px;word-break:break-word;white-space:pre-wrap;font-family:ui-monospace,Menlo,Consolas,monospace;max-height:190px;overflow:auto}",
    ".mp-bb.empty{color:var(--dim2);font-family:inherit;text-align:center;padding:14px 9px}",
    /* 参数串与标签分开：MJ 只要标签里混进参数之外的符号就废。 */
    ".mp-bb.params{color:#c6cddf;background:#0b0d12;border-color:rgba(167,139,250,.3);margin-top:5px}",
    ".mp-foot{display:flex;align-items:center;gap:7px;flex-wrap:wrap}",
    ".mp-warn{font-size:10.5px;line-height:1.6;color:#fbbf24;flex:1 1 200px;min-width:0}",
    /* 模型按钮：channel 不同，可点性不同。
       免 key 那条要一眼能认出来，否则用户会以为四个都能直接出图。 */
    ".st-go .mini .bd{display:inline-block;width:5px;height:5px;border-radius:50%;margin-right:5px;vertical-align:1px;background:var(--dim2)}",
    ".st-go .mini.chan-keyed .bd{background:#34d399}",
    ".st-go .mini.chan-anon .bd{background:#fbbf24}",
    ".st-go .mini.chan-manual .bd{background:#a78bfa}",
    ".st-go .notice{font-size:10.5px;line-height:1.7;color:#fcd34d;border-left:2px solid var(--warn);background:rgba(251,191,36,.07);padding:7px 10px;border-radius:0 6px 6px 0}",
    ".st-go .tip{font-size:10.5px;line-height:1.7;color:var(--dim2)}",
    ".st-go .keyrow{display:flex;gap:6px;align-items:center;flex-wrap:wrap}",
    ".st-go .st-key{flex:1 1 220px;min-width:180px;background:#0b0d12;border:1px solid var(--line);border-radius:8px;color:#dfe4ee;font-size:11px;padding:5px 10px;font-family:ui-monospace,Menlo,Consolas,monospace}",
    ".st-go .st-key:focus{outline:none;border-color:var(--accent2)}",
    ".st-go .st-size{width:96px;background:#0b0d12;border:1px solid var(--line);border-radius:8px;color:#dfe4ee;font-size:10.5px;padding:3px 9px;font-family:ui-monospace,Menlo,Consolas,monospace}",
    ".st-go .st-size:focus{outline:none;border-color:var(--accent2)}",
    ".st-go .st-size.bad{border-color:#fca5a5;color:#fca5a5}"
  ].join("\n");
  document.head.appendChild(s);
})();

/* ---------- 小工具 ---------- */
function supGradeZh(g) {
  return { ok: "四步齐备，可直接出图", tune: "可以出图，但有缺项", conflict: "缺项过多，建议先补" }[g] || "未知";
}
function supGradeCls(g) {
  return { ok: "g-ok", tune: "g-tune", conflict: "g-conflict" }[g] || "g-unknown";
}

/* 候选过滤：搜索词 + 类别同时生效。
   两个都要真过滤而不是只做高亮——候选有 59 条，
   全铺出来用户找不到自己要的。 */
function supPool(step) {
  var list = STUDIO.candidates(step.key);
  var q = (SUP.q[step.key] || "").trim().toLowerCase();
  var cat = SUP.cat[step.key] || "全部";
  return list.filter(function (e) {
    if (cat !== "全部" && e.cat !== cat) return false;
    if (!q) return true;
    var hay = [e.zh, e.en, e.id, e.cat, e.desc, e.scene, e.note,
               (e.alt || []).join(" "), (e.kw || []).join(" ")].join(" ").toLowerCase();
    return hay.indexOf(q) >= 0;
  });
}

/* ---------- 单步选择卡 ---------- */
function supStepHtml(step, idx) {
  var picked = STUDIO.S[step.key] || "";
  var cur = picked ? STUDIO.entryOf(step.key) : null;
  var code = cur ? STUDIO.codeOf(step.key) : "";
  var pool = supPool(step);
  var all = STUDIO.candidates(step.key);

  /* 类别切换 */
  var cats = [];
  all.forEach(function (e) { if (e.cat && cats.indexOf(e.cat) < 0) cats.push(e.cat); });
  var catHtml = cats.length > 1
    ? '<div class="st-cats"><span class="c' + (SUP.cat[step.key] === "全部" ? " on" : "") +
        '" data-st-cat="' + step.key + '">全部 ' + all.length + '</span>' +
      cats.map(function (c) {
        var n = all.filter(function (e) { return e.cat === c; }).length;
        return '<span class="c' + (SUP.cat[step.key] === c ? " on" : "") +
          '" data-st-cat="' + step.key + '|' + esc(c) + '">' + esc(c) + " " + n + '</span>';
      }).join("") + '</div>'
    : "";

  /* 当前值 */
  var curHtml = '<div class="st-cur">' + (cur
    ? '<span class="nm">' + esc(cur.zh) + '</span>'
      + (cur.en ? '<span style="color:var(--dim2);font-size:10.5px">' + esc(cur.en) + '</span>' : "")
      + (code ? '<span class="ov-badge">' + esc(code) + '</span>' : "")
      + (picked ? '<span class="ov-kw" data-st-clear="' + step.key + '" style="border-color:#f87171;color:#fca5a5" title="点击取消">×</span>' : "")
    : '<span class="none">尚未选择 —— ' + esc(step.hint) + '</span>') + '</div>';

  /* 配色层用色卡，不用文字按钮 */
  var body;
  if (step.key === "palette") {
    body = pool.length ? '<div class="st-pl">' + pool.map(function (e) {
      var on = picked === e.id;
      return '<div class="st-sw' + (on ? " on" : "") + '" data-st-pick="' + step.key + '|' + esc(e.id) + '">'
        + '<span class="chip" style="background:' + esc(e.hex || "#333") + '">'
        +   (e.accent ? '<b style="background:' + esc(e.accent) + '"></b>' : "") + '</span>'
        + '<span class="meta"><span class="n">' + esc(e.zh)
        +   (on ? ' <em style="font-style:normal;font-size:10px;color:var(--dim2);font-family:ui-monospace,Menlo,Consolas,monospace">' + esc(nodeCode(e.id)) + '</em>' : '')
        + '</span>'
        + '<span class="h">' + esc(e.hex || "") + (e.accent ? " / " + esc(e.accent) : "") + '</span></span></div>';
    }).join("") + '</div>'
      : '<div class="st-more">没有匹配的配色</div>';
  } else {
    var shown = pool.slice(0, 60);
    body = shown.length
      ? '<div class="st-list">' + shown.map(function (e) {
          var on = picked === e.id;
          return '<span class="st-it' + (on ? " on" : "") + '" data-st-pick="' + step.key + '|' + esc(e.id) + '"'
            + ' title="' + esc((e.desc || "").slice(0, 90)) + '">' + esc(e.zh)
            + '<i>' + esc(nodeCode(e.id)) + '</i></span>';
        }).join("") + '</div>'
        + (pool.length > shown.length
            ? '<div class="st-more">还有 ' + (pool.length - shown.length) + ' 条，请输入关键词缩小范围</div>'
            : "")
      : '<div class="st-more">没有匹配项，请换个关键词</div>';
  }

  return '<div class="st-step' + (cur ? " done" : "") + '">'
    + '<div class="st-hd"><span class="no">' + (idx + 1) + '</span>'
    +   '<span class="zh">' + esc(step.zh) + '</span>'
    +   (step.required ? '<span class="req">必备</span>' : '<span class="ov-badge" style="color:var(--dim2);border-color:var(--line)">可选</span>')
    + '</div>'
    + '<div class="st-hint">' + esc(step.hint) + '</div>'
    + curHtml
    + '<input class="st-q" data-st-q="' + step.key + '" placeholder="搜索' + esc(step.zh) + '：名称 / 英文 / 特征词…" value="'
    +   esc(SUP.q[step.key] || "") + '">'
    + catHtml
    + body
    + '</div>';
}

/* ---------- 结果区 ---------- */
function supBlock(title, note, text, copyLabel, tight) {
  if (!text) return "";
  return '<div class="st-block">'
    + '<div class="st-bh"><span class="t">' + esc(title)
    +   (note ? '<em>' + esc(note) + '</em>' : '') + '</span>'
    +   '<button class="btn p" data-st-copy="' + esc(title) + '">' + esc(copyLabel || "复制") + '</button></div>'
    + '<div class="st-bb' + (tight ? " tight" : "") + '" data-st-text="' + esc(title) + '">' + esc(text) + '</div>'
    + '</div>';
}

function supOutHtml(lang) {
  var d = STUDIO.diagnose();
  var gpt = STUDIO.compose(lang);
  var isZh = lang === "zh";

  var head = '<div class="st-panel" style="background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 13px;display:flex;flex-direction:column;gap:9px">'
    + '<div class="st-outhead">'
    +   '<span class="ov-grade ' + supGradeCls(d.grade) + '">' + esc(supGradeZh(d.grade)) + '</span>'
    +   '<div class="st-lang">'
    +     '<button class="' + (isZh ? "on" : "") + '" data-st-lang="zh">中文正文</button>'
    +     '<button class="' + (!isZh ? "on" : "") + '" data-st-lang="en">英文正文</button>'
    +   '</div>'
    + '</div>'
    + '<div class="st-sum">' + STUDIO.STEPS.map(function (s) {
        var on = !!STUDIO.S[s.key];
        return '<span class="s' + (on ? " on" : "") + '">' + esc(s.zh)
          + (on ? ' <b>' + esc(STUDIO.labelOf(s.key)) + '</b>' : " 未选") + '</span>';
      }).join("") + '</div>';

  /* 缺失诊断：说清缺哪一项、缺了会怎样 */
  if (d.missing.length) {
    head += '<div>' + d.missing.map(function (m) {
      return '<div class="st-warn"><b>缺' + esc(m.zh) + '：</b>' + esc(m.why) + '</div>';
    }).join("") + '</div>';
  } else {
    head += '<div class="st-ok">四步齐备。下面这段可以直接粘进 GPT-Image、Midjourney、Flux 或 Stable Diffusion。</div>';
  }

  /* 授权提示随选择走。
     注意：一个都没选时**不能**显示「当前所选均为 R0」。
     那时候根本没有所选，说成 R0 等于凭空给了一张「可商用」的假通行证——
     用户会带着这个误解去用别的条目。
     所以先分「未选 / 全 R0 / 有待处理」三种情况。 */
  var flags = STUDIO.rightsFlags();
  var hasAny = STUDIO.partsReady().count > 0;
  if (!hasAny) {
    head += '<div class="st-note">选入画风或题材后，这里会显示该条目的授权等级与商用要求。'
      + '本库不预设「随便用都安全」——等级随条目变，作品层一律 R3。</div>';
  } else if (flags.length) {
    head += '<div>' + flags.map(function (r) {
        return '<div class="st-note"><b>' + esc(r.tier + " " + r.tierZh) + '·' + esc(r.zh) + '：</b>'
          + esc(r.reason) + '。' + esc(r.requirement || "") + '</div>';
      }).join("") + '</div>';
  } else {
    head += '<div class="st-note" style="border-left-color:#34d399;background:rgba(52,211,153,.07);color:#6ee7b7">'
      + '当前所选均为 R0 自由条目，可直接商用，无需署名或改写。</div>';
  }

  head += '</div>';

  if (!d.ready) {
    /* 一键出图的面板照样给出来，只是按钮禁用。
       整块藏起来的话，用户是「点完四步才发现多了个按钮」，
       而按钮一直在、只是灰着，才能让人提前知道出图这件事存在。 */
    return head + '<div class="st-emptyp">先在左侧选一个<b>画风</b>或<b>题材</b>，这里就会给出可复制的提示词。<br>'
      + '四步全部选完最稳；只选一两步也能出图，但上面会写明缺了什么。</div>'
      + supGoHtml(lang);
  }

  var tags = STUDIO.composeTags();
  var neg = STUDIO.negatives();
  var tier = STUDIO.tierOf();
  var lay = STUDIO.entryOf("layout");
  var pal = STUDIO.entryOf("palette");

  /* 「版式建议的画幅」与「出图工作流里选的出图比例」是两个值，
     这里写清楚这一点。不写的话同一屏上会出现 16:9（这里）和 1:1（下面），
     用户会以为下面那个按钮坏了。
     两者一致时不啰嗦，不一致时才点明差在哪。 */
  var layRatio = lay && lay.ratio ? lay.ratio : "";
  var goRatio = RND.ratio === "custom" ? (RND.custom || "自定义") : RND.ratio;
  var ratioRow = layRatio
    ? "<code>" + esc(layRatio) + "</code>（来自版式「" + esc(lay.zh) + "」）"
      + (layRatio === goRatio
          ? "，与下面的出图比例一致"
          : '，<span style="color:#fcd34d">下面的出图比例是 ' + esc(goRatio)
            + "，两者不同——实际出图按下面的走</span>")
    : "未选版式，无画幅建议；出图比例由上面的「出图比例」决定";
  if (RND.ratio === "custom") {
    ratioRow = ratioRow.replace("出图比例是 自定义", "出图比例是自定义 " + esc(RND.custom || "（未填）"));
  }

  var kv = '<div class="st-block">'
    + '<div class="st-bh"><span class="t">出图参数</span></div>'
    + '<div class="st-kv"><span class="k">建议画幅</span><span class="v">'
    +   ratioRow
    + '</span></div>'
    + (tier ? '<div class="st-kv"><span class="k">画质档依据</span><span class="v">'
      +   esc(tier.zh || tier.tier) + '档 · 命中「' + esc(tier.hit || "—") + '」。' + esc(tier.note || "")
      + '</span></div>' : "")
    + (pal ? '<div class="st-kv"><span class="k">主色</span><span class="v">'
      +   "<code>" + esc(pal.hex) + '</code>' + (pal.accent ? ' 点缀 <code>' + esc(pal.accent) + '</code>' : "")
      +   (pal.mood ? '<br><span style="color:var(--dim2)">' + esc(pal.mood) + '</span>' : "")
      + '</span></div>' : "")
    + '<div class="st-kv"><span class="k">对应编码</span><span class="v">'
    +   STUDIO.STEPS.filter(function (s) { return STUDIO.S[s.key]; })
            .map(function (s) { return "<code>" + esc(STUDIO.codeOf(s.key) || STUDIO.S[s.key]) + "</code>"; }).join(" ")
    + '</span></div>'
    + '</div>';

  /* 组合串：四步的规范编码拼起来，可直接存下来复用 */
  var chain = STUDIO.STEPS.filter(function (s) { return STUDIO.S[s.key]; })
    .map(function (s) { return STUDIO.codeOf(s.key) || STUDIO.S[s.key]; }).join(" + ");

  return head
    + supBlock(isZh ? "中文正文" : "英文正文",
               isZh ? "国内模型 / 出中文海报直接用" : "GPT-Image · Midjourney · Flux · SD", gpt, "复制正文")
    + supBlock("标签速用版", "MJ / SD / Flux 吃逗号标签", tags, "复制标签版", true)
    + supBlock("负面词", "直接粘进 SD 的 negative prompt", neg, "复制负面词", true)
    + supGoHtml(lang)
    + kv
    + (chain ? supBlock("组合串", "四步的规范编码，可存下来复用", chain, "复制组合串", true) : "");
}

/* ============================================================
 * 一键出图面板
 * ============================================================
 * 整个库唯一一处会真的发起网络请求的地方，所以四条边界写死在界面上：
 *
 *   ① **只用英文正文**。中文正文是给国内模型改字用的，
 *      这两路通道对中文的理解明显更弱。这里显式取 en，
 *      用户在看中文正文时也不能被「看起来是同一段」骗过去。
 *   ② **keyed 通道的水印与配额不由本库控制**。API key 通道有额度，
 *      匿名通道的 nologo 也去不掉右下角标记（实测）。
 *   ③ **图与提示词都会离开你的电脑**。选完即出图等于把提示词传出去了，
 *      本库的授权分级只管文本，管不了别人拿它做什么。
 *   ④ **Midjourney 真的没有 API**。这一项不给假按钮，
 *      给的是标签版 + --ar 参数串与官网入口。
 *
 * 出图比例由用户在这一屏直接选，**不跟随版式的 ratio**：
 * 版式管的是画面里元素怎么摆，出图比例管的是画布什么形状。
 * 两者混在一起时「我选了 16:9」与「版式说 3:4」会打架，
 * 模型只能二选一，而用户看到的是一张比例不对的图却不知道为什么。
 *
 * 尺寸档位则**不给选项**：固定 RENDER.DEFAULT_TIER。
 * 详见文件头纪律⑦——摆一个没人会回头改的按钮只是多一次点击。
 */
function supGoHtml(lang) {
  var d = STUDIO.diagnose();
  var model = RENDER.modelById(RND.model) || RENDER.modelById(RENDER.DEFAULT_MODEL);
  var ch = RENDER.CHANNELS[model.channel];
  var spec = RND.ratio === "custom" ? (RND.custom || "") : RND.ratio;
  var size = RENDER.pxOf(spec, RENDER.DEFAULT_TIER);

  /* 自定义尺寸在标题栏只显示像素，不重复一遍 —— 自定义没有「比例」可显示，
     把 1024x1536 原样再写一次只是噪声。 */
  var sizeNote;
  if (!size.known && RND.ratio === "custom") {
    sizeNote = '（' + esc(size.why || "尺寸不合法") + "，按 " + size.w + "×" + size.h + " 出图）";
  } else if (RND.ratio === "custom") {
    sizeNote = "（自定义）";
  } else {
    sizeNote = "（" + size.ratio + "）";
  }

  /* 面板外层在这里开、末尾统一关。
     早前 head 里开的、缺步分支里提前 return 又没关，
     加上 opts 多带一个 </div>，面板的 div 层级对不上：
     浏览器不报错，只是后面的内容（通道说明、边界）被挪出面板，
     页面看上去「模型能选，但说明全不见了」。 */
  var open = '<div class="st-go">';

  var head = open + '<div class="gh">'
    + '<span class="gt">一键出图</span>'
    + '<span class="gs">' + size.w + "×" + size.h + sizeNote + '</span>'
    + '<span class="grow">'
    +   (model.channel === "manual"
          ? '<a class="btn k" href="' + esc(model.site || "") + '" target="_blank"'
            + ' rel="noopener noreferrer">去官网粘贴</a>'
          : '<button class="btn act" data-st-go' + (d.ready ? "" : " disabled") + '>'
            + (RND.busy ? "出图中…" : (RND.url ? "重新出图" : "立即出图")) + '</button>')
    + '</span></div>';

  /* 缺步时不给按钮，但也把「为什么不给」说清，
     否则用户以为功能坏了或以为自己已经选完了。
     MJ 那条不受影响：它是「复制过去」，不需要先选四步。 */
  if (!d.ready && model.channel !== "manual") {
    return head
      + '<div class="msg err">先在上面选一个<b>画风</b>或<b>题材</b>再出图。'
      +   '一个环节都没选时模型只能按自己的默认理解画，出的是随机结果，不是本库的提示词。</div>'
      + '</div>';
  }

  /* ---- 模型选择 ----
     按钮上的圆点标通道：绿=要 key、黄=免 key、紫=无 API。
     不标的话四个按钮看起来一样，用户会以为 MJ 也能一键出图。 */
  var mdl = '<span class="opt"><span class="ol">模型</span>'
    + RENDER.MODELS.map(function (m) {
        return '<button class="mini chan-' + m.channel + (RND.model === m.key ? " on" : "")
          + '" data-st-md="' + m.key + '" title="' + esc(m.tip + (m.notice ? "\n⚠ " + m.notice : ""))
          + '"><span class="bd"></span>' + esc(m.zh) + '</button>';
      }).join("") + '</span>';

  /* ---- 出图比例 + 自定义 ---- */
  var ratioRow = '<span class="opt"><span class="ol">出图比例</span>'
    + RENDER.RATIOS.map(function (r) {
        return '<button class="mini' + (RND.ratio === r ? " on" : "") + '" data-st-ratio="' + r
          + '">' + r + '</button>';
      }).join("")
    + '<button class="mini' + (RND.ratio === "custom" ? " on" : "") + '" data-st-ratio="custom"'
    +   ' title="自己填像素，如 1024x1536">自定义</button>'
    + (RND.ratio === "custom"
        ? '<input class="st-size' + (size.known ? "" : " bad") + '" data-st-size placeholder="1024x1536"'
          + ' value="' + esc(RND.custom || "") + '">'
        : "")
    + '</span>';

  /* seed 单独一行。
     它原来跟「清晰度」挤在同一行里，清晰度撤掉后如果就地删掉那几个按钮，
     这一行会只剩一个孤零零的输入框，看起来像是没做完。
     所以连行一起重写：一个标签 + 一个框，说明写在 placeholder 与 title 里。

     这一行**不带收尾的 </div>**：外层 opts 字符串统一收。
     多一个 </div> 会把外层 .st-go 提前关掉，
     后面所有块（key 框、通道说明、结果、边界）都被挪出面板 ——
     浏览器不报错，只是那些内容从面板里消失了。 */
  var seedRow = '<span class="opt"><span class="ol">seed</span>'
    + '<input class="st-seed" data-st-seed placeholder="留空=随机" value="' + esc(RND.seed || "")
    + '" title="填同一个数字可复现同一张构图；留空则每次随机。'
    + '「换一张」会清掉它，否则缓存命中，拿回的会是同一张图。"></span>';

  /* ---- 出图设置：模型 / 比例 / seed 三行 ----
     这几行的 class 是 .opts 而不是 .st-go.opts：
     外层 .st-go 是整块面板（head 已经把它打开了，末尾才关），
     内层再套一个 .st-go 会让「面板」这个概念出现两次——
     后果是 querySelector(".st-go") 命中第一行（只有模型按钮），
     通道说明、边界全都不在匹配范围里。
     浏览器不会报错，只是内容悄悄不见了。 */
  var opts = '<div class="opts">' + mdl + '</div>'
    + '<div class="opts">' + ratioRow + '</div>'
    + '<div class="opts">' + seedRow + '</div>';

  /* key 只在需要它的通道出现 */
  if (ch.needKey) {
    opts += '<div class="keyrow">'
      + '<span class="ol" style="font-size:10.5px;color:var(--dim2)">API key</span>'
      + '<input class="st-key" data-st-key type="password" placeholder="粘贴到 gen.pollinations.ai 的 key"'
      +   ' value="' + esc(RND.key || "") + '">'
      + '<span class="tip">只存在这一页的内存里，不写硬盘、不进 URL。在 '
      +   '<code>enter.pollinations.ai/keys</code> 免费申请。</span>'
      + '</div>';
  }

  /* ---- 模型自带的提醒（付费/故障/无 API）必须出现在按钮下面 ----
     埋在 tip 里等于没有：用户点之前看不到，出事之后才发现。 */
  var notice = model.notice ? '<div class="notice">⚠ ' + esc(model.notice) + '</div>' : "";

  var chanTip = '<div class="tip">通道：' + esc(ch.zh) + '——' + esc(ch.tip) + '</div>';

  /* ---- 结果区 ---- */
  var shot;
  if (model.channel === "manual") {
    /* MJ 没有 API，所以这一块不给「出图」按钮。
       词不在这里给：同一份 MJ 词在下面那张模型卡里已经有了，
       在这儿再给一份就必然出现两处拼法（原先就是 tags + params 拼一起，
       而适配层给的是分开的），两份对不齐时用户会抄到旧的那份。

       这里只留「为什么不能一键出图」与入口。 */
    shot = '<div class="msg">Midjourney 没有公开出图 API，这一项不能一键出图。'
      + '它的<b>标签版与参数</b>在下面「按模型优化的提示词」里已经分开给好了，'
      + '复制过去粘到官网或 Discord 即可。</div>'
      + '<div class="sf">'
      +   '<a class="btn k" href="' + esc(model.site || "") + '" target="_blank"'
      +     ' rel="noopener noreferrer">打开官网</a>'
      + '</div>';
  } else if (RND.busy) {
    shot = '<div class="shot wait">正在生成，通常 5–40 秒。<br>高清档与需要 key 的通道偶尔会超时。</div>';
  } else if (RND.url) {
    shot = '<div class="shot"><img src="' + esc(RND.url) + '" alt="按当前组合出的图" referrerpolicy="no-referrer"></div>'
      + '<div class="sf">'
      +   '<a class="btn k" href="' + esc(RND.url) + '" download="anime-' + Date.now() + '.jpg"'
      +     ' referrerpolicy="no-referrer">下载这张图</a>'
      +   '<button class="btn" data-st-go="again">换一张</button>'
      +   '<button class="btn" data-st-copyurl>复制图片地址</button>'
      + '</div>';
  } else {
    shot = '<div class="shot wait">选好四步后点「立即出图」。<br>出的是当前组合的一张真实预览，不是示意图。</div>';
  }

  var msg = RND.msg ? '<div class="msg' + (/失败|超时|错误|无法|需要|缺少/.test(RND.msg) ? " err" : "") + '">'
    + esc(RND.msg) + '</div>' : "";

  var bound = '<div class="bound">'
    + '<b>四条边界，出图前请先知道：</b><br>'
    + '① 提示词会<b>离开你的电脑</b>，发到 ' + esc(ch.host || "midjourney.com")
    + '。介意就别用这按钮，复制正文去你自己的模型里跑。<br>'
    + '② 右下角<b>仍会有通道水印</b>——<code>nologo</code> 只关掉左上角标，'
    + '推理阶段强加的标记提示词管不了。出图后自己裁掉，别直接商用。<br>'
    + '③ API key 只在这一页的内存里，但<b>请求会带上它</b>。'
    + '用完刷新页面就没了，别在公用电脑上填。<br>'
    + '④ 图里的文字仍然是乱码，版式预留的空白区留给后期排字。'
    + '</div>';

  return head + opts + notice + chanTip + msg + shot + bound + '</div>';
}

/* ============================================================
 * 各模型的优化提示词
 * ============================================================
 * 为什么单独一块，而不是把默认正文直接发给模型：
 *
 *   五个模型的提示词语法不是一回事（详见 assets/model-prompts.js 文件头）。
 *   把同一段正文硬发给五个模型，等于对五个模型说五种它听不懂的话，
 *   而界面上看起来一切正常 —— 用户只会得出「这个库提示词不行」。
 *
 * 这一块**只渲染，不做改写**：
 * 改写全在 MODEL_PROMPTS 里，这里一处按模型名的 if 都不该有
 * （tools/check_model_prompts.js 第 11 条就在盯这件事）。
 * 界面上出现 model === "mj" 这种分支，适配层与界面就会各有一份
 * 「MJ 该怎么写」，两边看起来都正常，只是慢慢对不齐。
 *
 * 它取代了原先的 supMjHtml()：那个函数只服务 MJ，
 * 于是「MJ 怎么写」写在界面里、「GPT/Flux 怎么写」根本不存在。
 * 现在四个模型也各有各的写法，且都在同一个文件里。
 *
 * 布局取竖排卡片而不是横向五个标签：
 * 每份提示词都是几百字，横向排列会把它们挤成看不见的一行，
 * 而「点一下复制」的前提是用户能先看见复制的是什么。
 * ============================================================ */
function supModelPromptsHtml(lang) {
  if (typeof MODEL_PROMPTS === "undefined") return "";
  var d = STUDIO.diagnose();
  var isZh = lang === "zh";

  /* 出图比例与出图面板共用同一份状态：
     两处各存一份的话，用户在工作流里选了 16:9、
     在模型词块里看到的还是版式的 3:4，而两边都「记得」自己是对的。 */
  var spec = RND.ratio === "custom" ? (RND.custom || "") : RND.ratio;
  var opts = { lang: isZh ? "zh" : "en", ratio: spec };

  /* ---- 默认提示词置顶 ----
     它是「本库通用正文」的基准，不属于任何一家模型，
     所以排在所有模型块上面。用户只想拿一段通用词时不必往下翻。 */
  var base = MODEL_PROMPTS.base(opts);
  var baseBlock = '<div class="mp-base">'
    + '<div class="mp-bh">'
    +   '<span class="t">默认提示词'
    +     '<em>本库的通用正文，不针对任何模型改写。中英双版与标签速用版在上面那块。</em></span>'
    +   (base && base.text
        ? '<button class="btn p" data-mp-copy="base">复制默认提示词</button>' : "")
    + '</div>'
    + (base && base.text
        ? '<div class="mp-bb" data-mp-text="base">' + esc(base.text) + '</div>'
        : '<div class="mp-bb empty">先在上面选一个<b>画风</b>或<b>题材</b>，这里就会出现默认提示词。</div>')
    + '</div>';

  /* ---- 每个模型一整块 ---- */
  var cards = MODEL_PROMPTS.all(opts).map(function (o) {
    var m = RENDER.modelById(o.key) || {};
    var isCur = RND.model === o.key;

    var body;
    if (!o.text) {
      body = '<div class="mp-bb empty">还没选够环节，这一版暂时出不来。</div>';
    } else if (o.params) {
      /* MJ 这类要「标签 + 参数」的，两块分开摆。
         拼成一段复制的话参数串会跟标签混在一起，
         而 MJ 只要有一段不纯的标签，整个提示词就废了。 */
      body = '<div class="mp-bb" data-mp-text="' + esc(o.key) + '">' + esc(o.text) + '</div>'
        + '<div class="mp-bb params" data-mp-text="' + esc(o.key) + '-params">' + esc(o.params) + '</div>';
    } else {
      body = '<div class="mp-bb" data-mp-text="' + esc(o.key) + '">' + esc(o.text) + '</div>';
    }

    /* 当前模型给「立即出图」/「去官网」，其余模型给「用这个模型出图」。
       两者的区别必须在按钮上写出来：用户点之前就该知道
       点了之后出图面板会不会跟着变。

       **判据是「这一路通道能不能出图」，不是「模型名是不是 mj」。**
       早前这里写的是 `o.key === "mj"`，有两个问题：
         ① 模型与通道的关系是数据（RENDER.MODELS[].channel），
            在界面里硬编码模型名等于把这份数据复制一份 ——
            将来加一个「无 API 的新模型」时，
            这里会静默地给它一个出图按钮，而它根本发不出去；
         ② tools/check_model_prompts.js 第 11 条专门盯这件事。 */
    var canDraw = m.channel !== "manual";
    var act = isCur
      ? (canDraw
          ? '<button class="btn act" data-st-go' + (d.ready ? "" : " disabled")
            + '>' + (RND.busy ? "出图中…" : (RND.url ? "重新出图" : "立即出图")) + '</button>'
          /* 无 API 的通道：给官网入口，不给假出图按钮 */
          : '<a class="btn k" href="https://www.midjourney.com/imagine" target="_blank"'
            + ' rel="noopener noreferrer">当前模型 · 去官网粘贴</a>')
      : '<button class="btn" data-mp-pick="' + esc(o.key) + '"'
        + ' title="把出图模型切到这一版对应的 ' + esc(o.zh || o.key) + '">用这个模型出图</button>';

    /* 画风在这个模型上的激活强度徽标。
       这不是装饰：note 里那句话是让人读的，这个是让人扫一眼就知道
       「这一版能不能指望风格名」。weak / none 出现得多，
       说明大部分画风名在各模型上并没有共识——
       这件事不说出来，用户只会以为「换了模型就该出对」。 */
    var actLv = String(o.styleActivation || "").trim();
    var actZh = { strong: "强", weak: "弱", none: "叫不动" }[actLv] || "";
    var actBadge = actZh
      ? '<span class="mp-act ' + esc(actLv) + '" title="这个画风的名字在当前模型上的激活强度：'
        + esc(actZh) + '。标定属工程判断（read），不是逐条实测。">画风名 '
        + esc(actZh) + '</span>'
      : '<span class="mp-act unknown" title="该画风未做激活强度标定——'
        + '「未标定」不等于「名字一定好使」。">画风名 未标定</span>';

    return '<div class="mp-card' + (isCur ? " on" : "") + '">'
      + '<div class="mp-ch">'
      +   '<span class="bd chan-' + (m.channel || "keyed") + '"></span>'
      +   '<span class="ct">' + esc(o.zh || o.key) + '</span>'
      +   actBadge
      +   '<span class="cs">' + esc(m.tip || "") + '</span>'
      +   '<span class="crow">' + act + '</span>'
      + '</div>'
      + (o.note ? '<div class="mp-note">' + esc(o.note) + '</div>' : "")
      + body
      + '<div class="mp-foot">'
      +   /* 下面这段拼接里，每一段都必须以 + 收尾。
           少一个 + 时，"" 会把后面的片段吞进三元表达式，
           后面所有片段整体错位一格 ——
           浏览器不报错、页面能开，只是每个按钮后面多出 nan / <="" 之类的碎片，
           复制按钮因为属性没闭合而点不动。 */
        '<button class="btn p" data-mp-copy="' + esc(o.key) + '"'
      +   (o.text ? "" : " disabled") + '>复制提示词</button>'
      +   (o.params ? '<button class="btn p" data-mp-copy="' + esc(o.key) + '-params"'
          + ' title="MJ 的标签与参数要分开粘">复制参数</button>' : "")
      /* 无 API 的通道：官网入口给在**每一张**这种卡上，
         不只在「当前模型是它」的时候。
         顺序反了会这样：用户先复制了 MJ 的词，
         才想起来要切模型 —— 而切过去之前他根本不知道要去哪儿粘。 */
      +   (canDraw ? "" : '<a class="btn k" href="' + esc(m.site || "") + '" target="_blank"'
          + ' rel="noopener noreferrer">去官网粘贴</a>')
      +   (m.notice ? '<span class="mp-warn">⚠ ' + esc(m.notice) + '</span>' : "")
      + '</div>'
      + '</div>';
  }).join("");

  return '<div class="mp-wrap">'
    + '<div class="mp-hd"><b>按模型优化的提示词</b>'
    +   '<span>同一组四步，五个模型五份词 —— 它们的语法不同，不能互相替代。'
    +   '点<b>「复制提示词」</b>取这一版；点<b>「用这个模型出图」</b>把出图面板切到它。</span>'
    + '</div>'
    + baseBlock
    + '<div class="mp-list">' + cards + '</div>'
    + '</div>';
}

/* ============================================================
 * 主渲染
 * ============================================================ */
function openRenderStudio() {
  if (typeof STUDIO === "undefined") {
    el("grid").innerHTML = '<div class="ov-wrap"><div class="ov-warn">'
      + '出图工作流未加载（assets/studio.js 未进入 index.html），此视图不可用。</div></div>';
    el("filters").innerHTML = "";
    return;
  }

  var lang = SUP.lang || "zh";

  var presets = '<div class="ov-bar"><span class="lbl">先看成品</span>'
    + STUDIO.PRESETS.map(function (p, i) {
        return '<button class="chip" data-st-preset="' + i + '" title="' + esc(p.tip) + '">' + esc(p.name) + '</button>';
      }).join("")
    + '<button class="chip" data-st-clear-all="1">全部清空</button>'
    + '</div>';

  var intro = '<div class="ov-panel">'
    + '<div class="ov-title">出图工作流</div>'
    + '<div class="ov-sub">四步选完，直接拿走能粘贴的提示词：中文正文、英文正文、标签速用版、负面词、'
    + '建议画幅与授权提示都在右边。<b>画风</b>决定怎么画、<b>题材</b>决定画什么、'
    + '<b>版式</b>决定怎么摆、<b>配色</b>决定什么色——四件事互相独立，不用先懂库里的概念。'
    + '<br>四步定完可以直接点<b>「一键出图」</b>（选模型与出图比例，不必切到别的软件）。</div>'
    + presets + '</div>';

  var steps = '<div style="display:flex;flex-direction:column;gap:10px">'
    + STUDIO.STEPS.map(function (s, i) { return supStepHtml(s, i); }).join("")
    + '</div>';

  var out = '<div class="st-out">' + supOutHtml(lang) + supModelPromptsHtml(lang) + '</div>';

  el("grid").innerHTML = '<div class="ov-wrap">' + intro
    + '<div class="st-flow">' + steps + out + '</div></div>';

  /* ---- 事件 ---- */
  var g = el("grid");

  g.querySelectorAll("[data-st-preset]").forEach(function (b) {
    b.onclick = function () {
      STUDIO.applyPreset(STUDIO.PRESETS[+b.dataset.stPreset]);
      supReset(); openRenderStudio(); toast("已套用预设");
    };
  });
  g.querySelectorAll("[data-st-clear-all]").forEach(function (b) {
    b.onclick = function () { STUDIO.reset(); supReset(); openRenderStudio(); };
  });
  g.querySelectorAll("[data-st-pick]").forEach(function (b) {
    b.onclick = function () {
      var p = b.dataset.stPick.split("|");
      STUDIO.pick(p[0], p[1]);
      openRenderStudio();
    };
  });
  g.querySelectorAll("[data-st-clear]").forEach(function (b) {
    b.onclick = function () { STUDIO.pick(b.dataset.stClear, STUDIO.S[b.dataset.stClear]); openRenderStudio(); };
  });
  g.querySelectorAll("[data-st-cat]").forEach(function (b) {
    b.onclick = function () {
      var p = b.dataset.stCat.split("|");
      SUP.cat[p[0]] = p[1] || "全部";
      openRenderStudio();
    };
  });
  g.querySelectorAll("[data-st-lang]").forEach(function (b) {
    b.onclick = function () { SUP.lang = b.dataset.stLang; openRenderStudio(); };
  });
  g.querySelectorAll("[data-st-copy]").forEach(function (b) {
    b.onclick = function () {
      var box = g.querySelector('[data-st-text="' + b.dataset.stCopy + '"]');
      copy(box ? box.textContent : "");
    };
  });

  /* ---- 一键出图 ----
     出图是异步的，等图回来时必须重渲染才能把等待态换成结果图。
     代价是正文块回到顶部——但这一步本来就跨越了用户注意力
     （点了按钮 = 愿意等结果），整页重渲染换来的是状态不会自相矛盾。 */
  g.querySelectorAll("[data-st-md]").forEach(function (b) {
    b.onclick = function () {
      RND.model = b.dataset.stMd;
      /* 换模型清掉上一张图：留着的话用户会以为那是新模型出的。 */
      RND.url = ""; RND.msg = "";
      openRenderStudio();
    };
  });
  g.querySelectorAll("[data-st-ratio]").forEach(function (b) {
    b.onclick = function () {
      RND.ratio = b.dataset.stRatio;
      /* 比例变了，已出的那张图不再代表当前设置 —— 留着会让用户
         拿旧比例的图当成新比例的结果。换比例时清 seed 也对：
         同一seed 在不同比例下是两张完全不同的构图。 */
      RND.url = ""; RND.msg = ""; RND.seed = "";
      openRenderStudio();
    };
  });
  g.querySelectorAll("[data-st-copyurl]").forEach(function (b) {
    b.onclick = function () { if (RND.url) copy(RND.url); };
  });
  g.querySelectorAll("[data-st-copytags]").forEach(function (b) {
    b.onclick = function () { copy(STUDIO.composeTags()); };
  });

  /* ---- 按模型优化的提示词 ----
     复制走 [data-mp-text] 的 textContent：那一段就是「粘到模型里的东西」，
     不含标题与按钮文案。早前 MJ 那块是 tags + " " + params 拼一次给出去，
     而适配层给的是分开的两块（MJ 只要标签里混进 --ar 之外的符号就废），
     两处拼法必然分叉，所以复制口只能认适配层的内容，一处拼法都不留。 */
  g.querySelectorAll("[data-mp-copy]").forEach(function (b) {
    b.onclick = function () {
      var box = g.querySelector('[data-mp-text="' + b.dataset.mpCopy + '"]');
      copy(box ? box.textContent : "");
    };
  });
  g.querySelectorAll("[data-mp-pick]").forEach(function (b) {
    b.onclick = function () {
      RND.model = b.dataset.mpPick;
      /* 与上面换模型的按钮同一套清理：留着上一张图的话，
         用户会以为那是新模型出的图。 */
      RND.url = ""; RND.msg = "";
      openRenderStudio();
    };
  });

  /* 请求执行统一走 RENDER_NET（assets/render-net.js）——
     单张出图与抽卡共用同一份实现。各写一套的话，
     限流退避只会修在其中一边，表现成「单张能出、抽卡就 402」，
     而两段代码看起来几乎一样，排查时会先怀疑到通道本身上去。 */

  /* 当前出图设置 → 请求参数。三处调用（单张 / MJ 参数 / 换一张）共用，
     否则改了一处漏了两处，界面上「我选了 16:9」与实际发出去的不一致。

     tier 直接取 RENDER.DEFAULT_TIER —— 这里曾经是 RND.tier，
     那是个界面上的按钮；按钮撤掉之后字段也没了，改成从通道常量读，
     免得留下一个永远等于 "std" 的中间变量。 */
  function supOpts(seed) {
    var spec = RND.ratio === "custom" ? (RND.custom || "") : RND.ratio;
    return { ratio: spec, tier: RENDER.DEFAULT_TIER, model: RND.model,
             seed: seed, key: RND.key };
  }

  /* 出图用的正文必须带上用户选的出图比例。
     不传 override 时正文里写的是版式的 ratio，
     与请求的 width/height 对不上——模型两套指令都收到。

     **发出去的是按当前模型改写过的版本**，不是通用正文。
     界面上那张模型卡写的是 MJ 标签版 / Flux 散文版，
     而这里发的是通用英文正文 —— 用户照着卡片调半天，
     出来的图跟那一版没关系，而且界面完全看不出异常。
     两处必须是同一份内容，取值都走 MODEL_PROMPTS.of()。

     适配层不可用时退回通用正文：宁可给一份没优化的，
     也不能让出图这一整条路直接断掉。 */
  function supPrompt() {
    var spec = RND.ratio === "custom" ? "" : RND.ratio;
    if (typeof MODEL_PROMPTS !== "undefined") {
      var o = MODEL_PROMPTS.of(RND.model, { lang: "en", ratio: spec });
      if (o && o.text) {
        /* MJ 的标签与参数在界面上是分开两块的，
           但出图请求必须是一整段（虽然 MJ 这一路本来就发不出去，
           留在这里是为了将来接上通道时不必再改这一处）。 */
        return o.params ? (o.text + " " + o.params) : o.text;
      }
    }
    return STUDIO.compose("en", spec);
  }

  g.querySelectorAll("[data-st-go]").forEach(function (b) {
    b.onclick = function () {
      if (!STUDIO.partsReady().count) return;
      /* 「换一张」必须连用户填的 seed 一起换掉。
         保留 seed 的话点了按钮拿回同一张图，
         而 URL 里 seed 没变 —— 缓存命中，速度快得像卡住了。 */
      var again = b.dataset.stGo === "again";
      if (again) RND.seed = "";

      var spec = RND.ratio === "custom" ? (RND.custom || "") : RND.ratio;
      var sz = RENDER.pxOf(spec, RENDER.DEFAULT_TIER);
      if (!sz.known) {
        RND.msg = "自定义尺寸不合法：" + (sz.why || "看不懂") + "。边长要 "
                + RENDER.PX_MIN + "–" + RENDER.PX_MAX + " 之间，写成 1024x1536 这样。";
        openRenderStudio();
        return;
      }

      RND.busy = true;
      RND.msg = "正在请求 " + sz.w + "×" + sz.h + " 的图……";
      openRenderStudio();

      var seed = String(RND.seed || "").trim();
      RENDER_NET.fetchOnce(supPrompt(), supOpts(seed === "" ? RENDER.randSeed() : seed),
        function (url) {
          RND.busy = false;
          RND.url = url;
          RND.msg = "出好了。右下角仍有通道水印，商用前请自行裁掉。";
          openRenderStudio();
        },
        function (why) {
          RND.busy = false;
          RND.url = "";
          RND.msg = (why || "没拿到图") + "。可以改模型或点「换一张」重试，"
                  + "或把英文正文复制到你自己的模型里跑。";
          openRenderStudio();
        });
    };
  });

  /* 这里**没有**跳到抽卡页的按钮。
     曾经有一个「去抽卡」的盒子，看起来是贴心，实际是坏折中：
     在这一屏看到随机功能，用户会以为抽卡是「按当前四步换个 seed」，
     而抽卡恰恰是要推翻这四步的。要去抽卡从侧栏走，
     两屏之间唯一的联系是抽卡页上那个「去精修」（把组合带回来）。
     所以 selector 里也不该再出现 data-st-goto-gacha。 */

  /* key 框：只存值，不重渲染。逐字重渲染会清空用户正在输入的内容。
     存内存而不是 localStorage：刷新即失效，但凭据不留盘。 */
  g.querySelectorAll("[data-st-key]").forEach(function (inp) {
    inp.addEventListener("input", function () { RND.key = inp.value; });
  });

  /* 自定义尺寸框：同样只存值不重渲染。
     失焦时才重渲染一次，把解析结果（合法/不合法）显示出来——
     不然用户填了 1024x1536 不知道到底认没认。 */
  g.querySelectorAll("[data-st-size]").forEach(function (inp) {
    inp.addEventListener("input", function () { RND.custom = inp.value; });
    inp.addEventListener("blur", function () { RND.url = ""; RND.msg = ""; openRenderStudio(); });
  });

  /* seed 框：只存值，不重渲染。
     逐字重渲染会把用户正在输入的内容清掉 —— 输入框每打一个字符
     就被重建，是这一屏最难忍的一种卡顿。 */
  g.querySelectorAll("[data-st-seed]").forEach(function (inp) {
    inp.addEventListener("input", function () { RND.seed = inp.value; });
  });

  /* 搜索框：每次输入后重渲染并把焦点放回原处。
     不这么做的话，用户每打一个字焦点就没了，只能重新点一次。 */
  g.querySelectorAll("[data-st-q]").forEach(function (inp) {
    var key = inp.dataset.stQ;
    var pos = inp.selectionStart;
    inp.addEventListener("input", function () {
      SUP.q[key] = inp.value;
      openRenderStudio();
      var again = el("grid").querySelector('[data-st-q="' + key + '"]');
      if (again) {
        again.focus();
        try { again.setSelectionRange(pos, pos); } catch (e) {}
      }
    });
  });

  el("filters").innerHTML = "";
  var r = STUDIO.partsReady();
  ovStat("出图工作流 · 已选 " + r.count + " / " + r.total + " 步");
}