/* 一次性截图脚本：把主入口那几屏拍下来人工核对。
   用法：node tools/shot_studio.js <输出png绝对路径> [预设序号] [画布高度] [go|gacha] [model]

   预设留空 = 拍初始空态
   go       = 在出图工作流里再点一次「立即出图」
   gacha    = 切到独立的一屏「一键抽卡」并点「开始抽卡」
   model    = 先切到哪个模型（默认 sana）

   model 与 gacha 两参数是一起加的，原因见文件下方「为什么截图要这么绕」——
   简短版：默认模型是要 key 的 gpt-image-2，不切到免 key 那一路，
   页面上只可能出现一条提示，拍不到任何真实返回的图。*/
const path = require("path");
const { execFileSync } = require("child_process");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const out = process.argv[2] || path.join(ROOT, "shots", "studio.png");
const preset = process.argv[3];
const height = process.argv[4] || "2100";
const act = process.argv[5] || "";
const go = act === "go";
const gacha = act === "gacha";
const model = process.argv[6] || "sana";

fs.mkdirSync(path.dirname(out), { recursive: true });

/* 用注入脚本的方式驱动页面：Chrome 的 --screenshot 不带交互，
   所以先把要点的按钮点掉，再让它截图。

   **为什么截图要这么绕（三条，都是踩过的坑）**

   ① **选择器必须用单引号包在注入串里。** 写成
      "document.querySelector("[data-sec=x]")" 会得到嵌套双引号，
      注入的是一段语法错误的 JS —— 页面照常打开、照常渲染默认板块，
      截图看起来像「点击没生效」，其实是脚本压根没执行，
      而且页面上没有任何报错提示这种可能。

   ② **必须先切模型再点。** 默认模型 gpt-image-2 走 keyed 通道，
      没填 key 时点「立即出图」只会得到一条红字提示。
      截图脚本要能拍到真实返回的图，就得先切到免 key 的那一路。

   ③ **抽卡的时间预算必须按张数给足。** 免 key 通道限流约 15 秒 1 张，
      抽 4 张串行要 60 秒以上。virtual-time-budget 给 9 秒的话，
      拍到的永远是四个「排队中…」的灰卡片，看起来像抽卡功能坏了。 */
function buildInject(preset, model, go, gacha) {
  /* 抽卡已经从出图工作流里搬走，所以它走的是另一屏、另一组选择器。
     这里的 section key 必须跟着变 —— 继续点 [data-st-gacha]
     会静默取到 null（那个属性已经不存在了），
     截图拍到的就是一张没点过任何按钮的出图工作流。 */
  const q = "document.querySelector('[data-sec=\""
    + (gacha ? "opengacha" : "openstudio") + "\"]').click();";
  const mdSel = gacha ? "data-gc-model" : "data-st-md";
  const pick = (preset && !gacha)
    ? "var b=document.querySelector('[data-st-preset=\"" + preset + "\"]');if(b)b.click();"
    : "";
  const md = model
    ? "var m=document.querySelector('[" + mdSel + "=\"" + model + "\"]');if(m)m.click();"
    : "";
  let act2 = "";
  if (go) {
    act2 = "setTimeout(function(){var g=document.querySelector('[data-st-go]:not([disabled])');if(g)g.click();},600);";
  } else if (gacha) {
    act2 = "setTimeout(function(){"
      + "var c=document.querySelector('[data-gc-n=\"4\"]');if(c)c.click();"
      + "setTimeout(function(){var b=document.querySelector('[data-gc-run]:not([disabled])');if(b)b.click();},400);"
      + "},600);";
  }
  /* 滚到「按模型优化的提示词」那一块。
     它在出图工作流的最下方，画布一截就看不到 ——
     而那一块正是本轮新增的东西，截图不给它等于没验。
     用 scrollIntoView 而不是 scrollTop：后者在 jsdom 里不生效，
     而这里跑的是真浏览器，两者都能用，scrollIntoView 更贴近用户动作。

     SHOT_SCROLL_MP=<模型 key> 可以滚到指定那一块
     （默认 gpt-image-2）。MJ 那块最值得单独看 ——
     它的标签与参数是两个框，合在一起就废了。 */
  let scroll = "";
  if (process.env.SHOT_SCROLL_MP) {
    const key = process.env.SHOT_SCROLL_MP === "1"
      ? "gpt-image-2" : process.env.SHOT_SCROLL_MP;
    scroll = "setTimeout(function(){"
      + "var w=document.querySelector('.mp-card [data-mp-text=\"" + key + "\"]');"
      + "if(w)w.closest('.mp-card').scrollIntoView();"
      + "},1600);";
  }
  return q + "setTimeout(function(){" + pick + md + act2 + "},300);" + scroll;
}

const inject = buildInject(preset, model, go, gacha);

/* 抽 4 张串行 + 每张最多 3 次重试（退避 16/32/64 秒）。
   免key 通道约一半请求会被限流挡掉，所以时间预算必须按
   「全部走满重试」来给：4 张 × (16+32+64) 秒 ≈ 7.5 分钟。
   给少了拍到的永远是「重试中…」的灰卡片。 */
const budget = gacha ? 900000 : (go ? 60000 : 9000);

/* 生成一个临时包装页。
   必须落在项目根目录，不能放到 shots/ 里：
   index.html 里的资源路径全是相对的（assets/xxx.js），
   挪到子目录后全部 404，页面照样打开但一屏空白，
   截图只有几十 KB——看起来像「渲染失败」，其实是路径问题。 */
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const tmp = path.join(ROOT, "_shot_tmp.html");
fs.writeFileSync(tmp, html.replace("</body>",
  `<script>window.addEventListener('load',function(){setTimeout(function(){${inject}},200);});</script></body>`));

const profile = path.join(require("os").tmpdir(), "wb_shot_prof");
try {
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--window-size=1500," + height,
    "--user-data-dir=" + profile,
    "--virtual-time-budget=" + budget,
    "--screenshot=" + out,
    "file:///" + tmp.replace(/\\/g, "/")
  ], { stdio: "inherit", timeout: 1000000 });
} finally {
  try { fs.unlinkSync(tmp); } catch (e) {}
}
console.log("已保存 " + out);