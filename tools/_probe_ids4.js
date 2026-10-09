/* 临时探针4：验证修复后的旧码解析覆盖面 */
const path = require("path");
const { JSDOM, VirtualConsole } = require(path.join(
  process.env.WB_NODE_MODULES || "C:/Users/A/.workbuddy/binaries/node/workspace/node_modules",
  "jsdom"
));
const ROOT = path.resolve(__dirname, "..");

(async function () {
  const vc = new VirtualConsole();
  const dom = await JSDOM.fromFile(path.join(ROOT, "index.html"), {
    runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc
  });
  const win = dom.window;
  await new Promise(r => win.addEventListener("load", r));
  await new Promise(r => setTimeout(r, 500));

  const CM = win.CODE_MAP;
  console.log("LEGACY 总键数:", CM.count());
  console.log("");
  console.log("--- 用户手写形式抽查 ---");
  ["A1-01","A1-001","A101","A1001","A1-1","W-J01","W-J001","W-J-01","W-J-001","W-J11","W-C01","G-01","G-001","G01","LT-01","PL-01","T-01","N-01","S-01"].forEach(x=>{
    const r = CM.forward(x);
    console.log("  " + x.padEnd(9) + " → " + (r || "*** null ***"));
  });
  console.log("");
  const L = CM.LEGACY||{};
  const worksKeys = Object.keys(L).filter(k=>/^W-/.test(k));
  const otherKeys = Object.keys(L).filter(k=>!/^W-/.test(k));
  console.log("作品段键:", worksKeys.length, " 非作品段键:", otherKeys.length);
  console.log("非作品段前缀分布:", [...new Set(otherKeys.map(k=>k.replace(/[\d-]+$/,"")))].join(" "));
  dom.window.close();
})();