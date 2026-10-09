#!/usr/bin/env node
/* ============================================================
 * add_gallery.js — 画廊补图一键入库
 *
 * 用法：
 *   node tools/add_gallery.js <条目id> <图片路径> --note "看点：……"
 *
 * 例：
 *   node tools/add_gallery.js A2-01 ~/Downloads/robot.png --note "看点：仰视角……"
 *
 * 做什么：
 *   1. 校验条目在画廊里、当前是待配图（img:null）、授权为 R0；
 *   2. 把图片复制为 examples/<id>.<原扩展名>（文件名必须等于旧 id，
 *      这是 check_ids 的断言：重排不至于让图与词条错位）；
 *   3. 把该条目的 img 填上、note 整句替换为 --note；
 *   4. 重跑 embed_gallery.js 刷新 README 嵌入段。
 *
 * 不做什么：
 *   - 不自动生成「看点」。图上真看得见的东西只有看图的人能写，
 *     所以 --note 必填；不给就报错退出，绝不拿验证点文本冒充看图结论。
 *   - 不压缩图片。大于 3MB 会打警告并给出压缩建议，由人决定。
 *   - 不自动 commit / push。收尾打印命令，由人确认后执行。
 * ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

/* ---------- 参数 ---------- */
const args = process.argv.slice(2);
const id = args[0];
const src = args[1];
const noteIdx = args.indexOf("--note");
const note = noteIdx >= 0 ? args[noteIdx + 1] : null;

if (!id || !src || !note) {
  console.error('用法: node tools/add_gallery.js <条目id> <图片路径> --note "看点：……"');
  console.error("  --note 必填：看点必须是图上真看得见的描述，工具不会替你看图。");
  process.exit(1);
}
if (!/^看点/.test(note.trim())) {
  console.error("✗ --note 必须以「看点：」开头（已配图与待配图的措辞边界，check_rights 有守卫断言）。");
  process.exit(1);
}
if (!fs.existsSync(src)) {
  console.error("✗ 图片不存在: " + src);
  process.exit(1);
}
const ext = path.extname(src).toLowerCase();
if (!/^\.(png|jpg|jpeg)$/.test(ext)) {
  console.error("✗ 只支持 png/jpg/jpeg，收到: " + ext);
  process.exit(1);
}

/* ---------- 加载画廊与授权层（与体检脚本同一套 require 链） ---------- */
const GALLERY = require(path.join(ROOT, "assets", "examples.js")).GALLERY;
const entry = GALLERY.find(g => g.id === id);
if (!entry) {
  console.error("✗ 画廊里没有 " + id + "。先用 `node codex-skill/anime-prompt-forge/scripts/forge.js gallery --todo` 查候选，或按 examples.js 头部约定先登记待配图条目。");
  process.exit(1);
}
if (entry.img) {
  console.error("✗ " + id + " 已配图（" + entry.img + "）。要换图请手动替换文件并改看点。");
  process.exit(1);
}

/* R0 校验：授权层不达标直接拒绝，画廊是门面 */
const dataFiles = ["data-core.js", "data-core-more.js", "data-genres.js", "data-layout.js", "data-palette.js"];
let all = [];
for (const f of dataFiles) {
  const d = require(path.join(ROOT, "assets", f));
  Object.keys(d).forEach(k => { if (Array.isArray(d[k])) all = all.concat(d[k]); });
}
const ent = all.find(e => e.id === id);
if (!ent) { console.error("✗ 数据层查无条目 " + id); process.exit(1); }
const RIGHTS = require(path.join(ROOT, "assets", "rights.js")).RIGHTS || require(path.join(ROOT, "assets", "rights.js"));
const tier = RIGHTS.inspect(ent);
if (tier.tier !== "R0") {
  console.error("✗ " + id + " 授权层判定 " + tier.tier + "（" + (tier.basis || "") + "），非 R0 不得进画廊。");
  process.exit(1);
}

/* ---------- 落图 ---------- */
const destRel = "examples/" + id + ext;
const destAbs = path.join(ROOT, destRel);
fs.copyFileSync(src, destAbs);
const kb = Math.round(fs.statSync(destAbs).size / 1024);
if (kb > 3072) {
  console.warn("⚠ " + destRel + " 有 " + kb + " KB，偏重（库内现有图 300–3000 KB）。建议压到 88% 质量 JPG 后重跑本命令。");
}
console.log("✓ 已复制 " + path.basename(src) + " → " + destRel + "（" + kb + " KB）");

/* ---------- 改 examples.js ---------- */
const exPath = path.join(ROOT, "assets", "examples.js");
let text = fs.readFileSync(exPath, "utf8");
const entryRe = new RegExp(
  '(\\{ id: "' + id + '", img: )null,\\s*\\n\\s*note: "[^"]*" \\}'
);
if (!entryRe.test(text)) {
  console.error("✗ 在 examples.js 里没匹配到 " + id + " 的待配图块（img:null + 单行 note）。请手动检查格式。");
  process.exit(1);
}
text = text.replace(entryRe,
  '$1"' + destRel + '",\n    note: "' + note.trim().replace(/\\n/g, " ") + '" }');
fs.writeFileSync(exPath, text, "utf8");
console.log("✓ examples.js 已更新（img + 看点）");

/* ---------- 刷新 README 嵌入段 ---------- */
execSync("node \"" + path.join(ROOT, "tools", "embed_gallery.js") + "\"", { stdio: "inherit" });

/* ---------- 收尾提示 ---------- */
console.log(" ");
console.log("下一步（人工确认后执行）：");
console.log("  git add -A && git commit -m \"gallery: " + id + " 配图\" && git push");
console.log("  提交前建议跑: node tools/check_rights.js && node tools/check_ids.js");
