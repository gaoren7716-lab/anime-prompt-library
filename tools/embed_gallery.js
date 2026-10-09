/* embed_gallery.js —— 把示例画廊嵌入 README
 *
 * 从真源现算，不手工复制（与 examples.js 同一约定）：
 *   GALLERY      —— assets/examples.js（id/img/note）
 *   条目名        —— assets/data-core.js STYLES + data-core-more.js STYLES_MORE
 *   GPT 正文      —— assets/data-prompts-st*.js 的 {id, gpt}
 *
 * 用法：node tools/embed_gallery.js
 * 在 README.md 里以
 *   <!-- GALLERY-EMBED:START --> … <!-- GALLERY-EMBED:END -->
 * 为界整段替换；没有标记就在「## 快速开始」前插入并打上标记。
 * 新增画廊图后重跑本脚本即可刷新 README，不要手改标记内内容。 */
const fs = require("fs");
const path = require("path");
const A = f => path.join(__dirname, "..", "assets", f);

const gallery = require(A("examples.js")).GALLERY ||
  (() => { const m = require(A("examples.js")); return m.GALLERY || m; })();

const core = require(A("data-core.js"));
const coreM = require(A("data-core-more.js"));
const STYLES = core.STYLES.concat(coreM.STYLES_MORE);

/* 英文正文分散在 st（画风）/ gn gk（题材）等所有 data-prompts-*.js 里，
   按文件名模式全部收齐——只收 st 会漏掉题材/年代等段的正文 */
const gpt = {};
fs.readdirSync(A(".")).filter(f => /^data-prompts-[a-z]+\d*\.js$/.test(f)).forEach(f => {
  const m = require(A(f));
  const arr = m.PROMPTS || m.PROMPTS_ST || Object.values(m).find(Array.isArray);
  (arr || []).forEach(p => { if (p && p.id && p.gpt) gpt[p.id] = p.gpt; });
});

let missing = 0;
/* 条目名从全量数据源查（题材/年代/工作室等不在 STYLES 里，只查 STYLES 会让 G 条目全挂） */
const ALL_ENT = {};
["data-core.js", "data-core-more.js", "data-genres.js", "data-layout.js", "data-palette.js"].forEach(f => {
  try {
    const d = require(A(f));
    Object.keys(d).forEach(k => { if (Array.isArray(d[k])) d[k].forEach(e => { if (e && e.id) ALL_ENT[e.id] = e; }); });
  } catch (x) { /* 缺文件就退回 STYLES */ }
});

/* 已配图 / 待配图分流：README 的对照表只放真图；
   待配条目（img: null）单独列成折叠清单——提示词已就绪但没图，
   混进对照表会出现破图或假证据。 */
const done = gallery.filter(e => e.img);
const pending = gallery.filter(e => !e.img);
const cell = (e) => {
  const ent = ALL_ENT[e.id] || STYLES.find(s => s.id === e.id);
  const body = gpt[e.id];
  if (!ent || !body) { missing++; return ""; }
  const esc = s => String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\|/g, "\\|");
  return `<td valign="top" width="50%">\n\n` +
    `<img src="${e.img}" width="430" alt="${esc(e.id)}" />\n\n` +
    `**${esc(e.id)} · ${esc(ent.zh)}**（${esc(ent.en || "")}）\n\n` +
    `看点：${esc(e.note)}\n\n` +
    `<details><summary>📋 完整提示词（GPT 正文，复制即用）</summary>\n\n` +
    "```text\n" + body + "\n```\n\n" +
    `</details>\n\n</td>`;
};

const rows = [];
for (let i = 0; i < done.length; i += 2) {
  rows.push("<tr>\n" + cell(done[i]) + "\n" + (done[i + 1] ? cell(done[i + 1]) : "<td></td>") + "\n</tr>");
}

/* 待配条目清单：中文条目名复用上面的 ALL_ENT 全量查表 */

const sec = [];
sec.push("## 示例画廊 · 提示词与成品对照");
sec.push("");
sec.push(`共 **${gallery.length} 条**，全部为 R0 条目（本库授权分级中的最低档：` +
  `未命中在世创作者姓名、工作室名、品牌或作品名，按 \`assets/rights.js\` 的内部规则判定可自由配图。` +
  `这是内部分级判定，不构成法律意见——商用前请自行复核）。` +
  `其中 **${done.length} 张已配图**，每张由该条目的 **GPT 正文**直接生成——复制折叠区里的提示词，` +
  `喂给任意出图模型就能得到同风格的结果；另有 ${pending.length} 条**提示词已就绪、待配图**（见下方清单）。` +
  `可交互的完整画廊在 \`index.html\`。`);
sec.push("");
sec.push("<table>");
sec.push(...rows);
sec.push("</table>");
if (pending.length) {
  sec.push("");
  sec.push(`<details><summary>📝 已登记提示词、待配图的条目（${pending.length} 条）</summary>`);
  sec.push("");
  sec.push("| 条目 | 名称 | 验证点（配图时必须演示） |");
  sec.push("| --- | --- | --- |");
  pending.forEach(e => {
    const ent = ALL_ENT[e.id];
    const esc = s => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
    sec.push(`| ${e.id} | ${esc(ent ? ent.zh : e.id)} | ${esc((e.note || "").replace(/^待配图 · 验证点：/, ""))} |`);
  });
  sec.push("");
  sec.push("</details>");
}
sec.push("");
const block = "<!-- GALLERY-EMBED:START -->\n" + sec.join("\n") + "\n<!-- GALLERY-EMBED:END -->";

const readmePath = path.join(__dirname, "..", "README.md");
let readme = fs.readFileSync(readmePath, "utf8");
if (/<\/table>\n\n<\/td>/.test(readme) || readme.includes("GALLERY-EMBED:START")) {
  readme = readme.replace(/<!-- GALLERY-EMBED:START -->[\s\S]*?<!-- GALLERY-EMBED:END -->/, block);
} else {
  /* 首次插入：放在第一个二级标题之前（紧跟开篇介绍） */
  const h2 = readme.search(/^## /m);
  const pos = h2 < 0 ? readme.length : h2;
  readme = readme.slice(0, pos) + block + "\n\n" + readme.slice(pos);
}
fs.writeFileSync(readmePath, readme, "utf8");
console.log(`已嵌入画廊：${done.length} 张配图对照 + ${pending.length} 条待配图清单` +
  (missing ? `（缺正文 ${missing} 条）` : ""));
