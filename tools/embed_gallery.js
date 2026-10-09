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

/* 英文正文分散在 st1/st2/st3 等文件，按文件名模式全部收齐 */
const gpt = {};
fs.readdirSync(A(".")).filter(f => /^data-prompts-st\d*\.js$/.test(f)).forEach(f => {
  const m = require(A(f));
  const arr = m.PROMPTS || m.PROMPTS_ST || Object.values(m).find(Array.isArray);
  (arr || []).forEach(p => { if (p && p.id && p.gpt) gpt[p.id] = p.gpt; });
});

let missing = 0;
const cell = (e) => {
  const ent = STYLES.find(s => s.id === e.id);
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
for (let i = 0; i < gallery.length; i += 2) {
  rows.push("<tr>\n" + cell(gallery[i]) + "\n" + (gallery[i + 1] ? cell(gallery[i + 1]) : "<td></td>") + "\n</tr>");
}

const sec = [];
sec.push("## 示例画廊 · 提示词与成品对照");
sec.push("");
sec.push(`以下 **${gallery.length} 张**全部为 R0 条目（授权层允许自由商用的内容），` +
  `每张图由该条目的 **GPT 正文**直接生成——复制折叠区里的提示词，` +
  `喂给任意出图模型就能得到同风格的结果。可交互的完整画廊在 \`index.html\`。`);
sec.push("");
sec.push("<table>");
sec.push(...rows);
sec.push("</table>");
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
console.log(`已嵌入 ${gallery.length} 张画廊示例（缺正文 ${missing} 条）`);
