/* ============================================================
 * 请求执行层 · assets/render-net.js
 * ============================================================
 * 「把一段提示词发出去、把图收回来」这件事只在这里实现一次。
 *
 * 为什么必须单独成文件：
 *   单张出图与「一键抽卡」都要发请求，两边各写一套的后果是
 *   **限流退避只会修在其中一边** —— 表现成「单张能出、抽卡就 402」，
 *   而两段代码看起来几乎一样，排查时会怀疑到通道本身上去。
 *   这类「同一件事有两个实现」的问题不是靠小心避免的，
 *   是靠只留一个实现避免的。
 *
 * 通道差异全部由 RENDER.reqOf() 归一：
 *   kind = "img"     匿名通道，<img> 就能取（不带凭据）
 *          "json"    要 key 的通道，必须 fetch + Authorization 头
 *          "manual"  没有 HTTP 接口（Midjourney），只能复制过去
 *          "needkey" 选了这一路但没填 key —— 这不是错误，是缺输入
 *
 * 两条不能让步的：
 *   ① **key 绝不进 URL**。keyed 通道走 POST + Authorization 头；
 *      放进 URL 等于把它写进浏览器历史、截图和 Referer。
 *   ② **必须有兜底超时**。onload/onerror 都可能都不来（连接被挂住），
 *      没有兜底的话界面上会永远停在「出图中…」，比报错更难判断。
 *
 * 浏览器与 Node 双跑：Node 里没有 fetch/Image，取不到时走 onErr，
 * 不抛异常 —— 测试要能 require 这个文件而不需要浏览器环境。
 * ============================================================ */

var RENDER_NET = (function () {

  /* 退避参数。匿名通道实测不是干净的 15 秒窗口：
     3/15/25/35/60 秒间隔顺序请求都出现过 402，加长间隔不提高成功率。
     所以重试是必要的，而退避只是「别把重试砸在同一个瞬间」。 */
  var RETRY = { max: 3, baseMs: 16000, timeoutMs: 60000 };

  function R() {
    if (typeof module !== "undefined" && module.exports && typeof require === "function") {
      try { var m = require("./render.js"); if (m && m.RENDER) return m.RENDER; } catch (e) {}
    }
    var w = (typeof window !== "undefined") ? window
          : (typeof globalThis !== "undefined") ? globalThis : this;
    return w ? w.RENDER : null;
  }

  /* 通道自带的说明文案。界面与 CLI 都用这一份，
     免得「为什么不能出图」在三个地方有三种说法。 */
  function whyOf(kind) {
    if (kind === "manual") return "这一项没有出图 API，只能复制过去（Midjourney 不开放接口）";
    if (kind === "needkey") return "选了要 API key 的模型，但还没填 key。"
      + "在上面的输入框里贴一个（enter.pollinations.ai/keys 免费申请），"
      + "或者切到「Sana · 免 key」先试构图";
    return "";
  }

  /* ------------------------------------------------------------
   * 发一次请求
   * ------------------------------------------------------------
   * prompt 可以是整段正文，opts 里带 ratio / tier / model / seed / key。
   * onOk(url) / onErr(why)。
   * ------------------------------------------------------------ */
  function fetchOnce(prompt, opts, onOk, onErr) {
    var RENDER = R();
    if (!RENDER) { onErr("出图通道未加载（assets/render.js 不在页面里）"); return; }

    var r = RENDER.reqOf(prompt, opts || {});
    if (r.kind === "manual" || r.kind === "needkey") { onErr(whyOf(r.kind)); return; }

    /* ---- 要 key 的通道：POST + Authorization ---- */
    if (r.kind === "json") {
      if (typeof fetch !== "function") { onErr("当前环境不支持 fetch"); return; }
      fetch(r.url, { method: "POST", headers: r.headers, body: JSON.stringify(r.body) })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (j) {
          var d = j && j.data && j.data[0];
          var u = d && (d.url || (d.b64_json ? "data:image/png;base64," + d.b64_json : ""));
          if (!u) throw new Error("返回里没有图片");
          onOk(u, r);
        })
        .catch(function (e) { onErr("请求失败：" + (e && e.message ? e.message : "未知错误"), r); });
      return;
    }

    /* ---- 匿名通道：先用探测图确认拿到手，再显示 ----
       直接塞进 src 的话，出不来时界面上是一块破图，
       用户分不清是超时、被限流还是提示词被拒。 */
    if (typeof Image !== "function") { onErr("当前环境不支持 Image"); return; }
    var probe = new Image();
    var settled = false;
    probe.onload = function () {
      if (settled) return; settled = true;
      onOk(r.url, r);
    };
    probe.onerror = function () {
      if (settled) return; settled = true;
      onErr("没拿到图（匿名通道约一半请求会被限流挡掉）", r);
    };
    probe.referrerPolicy = "no-referrer";
    probe.src = r.url;
    setTimeout(function () {
      if (settled) return; settled = true;
      onErr("等待超过 " + Math.round(RETRY.timeoutMs / 1000) + " 秒还没拿到图", r);
    }, RETRY.timeoutMs);
  }

  /* ------------------------------------------------------------
   * 发到成功或放弃：带退避的自动重试
   * ------------------------------------------------------------
   * onTick(text)  —— 每次状态变化，界面拿它更新卡片文案
   * onDone(res)   —— res = { url, error, tries, why }
   *
   * 最多 3 次。超过就不试了：一条通道连拒三次，
   * 多半是配额真用完了，再等只是让用户盯着一个转圈。
   * ------------------------------------------------------------ */
  function fetchRetry(prompt, opts, onTick, onDone) {
    var tries = 0;
    (function once(first) {
      tries++;
      onTick((first ? "" : "重试第 " + (tries - 1) + " 次 · ") + "生成中…", tries);
      fetchOnce(prompt, opts, function (url) {
        onDone({ url: url, error: false, tries: tries });
      }, function (why) {
        if (tries >= RETRY.max) {
          onDone({ url: "", error: true, tries: tries, why: why });
          return;
        }
        var wait = RETRY.baseMs * Math.pow(2, tries - 1);
        onTick("被限流挡了，" + Math.round(wait / 1000) + " 秒后再试（第 " + tries + "/"
               + RETRY.max + " 次）", tries);
        setTimeout(function () { once(false); }, wait);
      });
    })(true);
  }

  return { RETRY: RETRY, whyOf: whyOf, fetchOnce: fetchOnce, fetchRetry: fetchRetry };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { RENDER_NET: RENDER_NET };
