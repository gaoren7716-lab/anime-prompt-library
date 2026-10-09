#!/usr/bin/env node
/* 生成 references/CATALOG.md —— 条目分类速查。
 *
 * 为什么要生成而不是手写：
 *   条目数会变（现在 133 条可出图），
 *   手写速查表第一次加条目就过期，
 *   而过期的速查表比没有更糟 —— Agent 会照着不存在的编码去找。
 *   派生规则只有一个真源，就是本脚本读的那几个数据文件。 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const core = require(path.join(ROOT, "assets/data-core.js"));
const coreM = require(path.join(ROOT, "assets/data-core-more.js"));
const genres = require(path.join(ROOT, "assets/data-genres.js"));
const layout = require(path.join(ROOT, "assets/data-layout.js"));
const palette = require(path.join(ROOT, "assets/data-palette.js"));
const en = require(path.join(ROOT, "assets/data-styles-en.js")).STYLE_DESC_EN;
const { CODES } = require(path.join(ROOT, "assets/codes.js"));

const STYLES = [].concat(core.STYLES, coreM.STYLES_MORE);
const code = id => CODES.derive(id);
const esc = s => String(s == null ? "" : s).replace(/\|/g, "\\|");

function group(list, field) {
  const g = {};
  list.forEach(x => { (g[x[field] || "其他"] = g[x[field] || "其他"] || []).push(x); });
  return g;
}

const out = [];
out.push("# 条目分类速查");
out.push("");
out.push("全部 133 条可直接出图的条目。规范码是喂给 `forge.js build` 的参数。");
out.push("画幅与主色是出图时必须真的照设的参数，不是元数据。");
out.push("");
out.push("| 层 | 条目数 | 决定 |");
out.push("|---|---|---|");
out.push("| 画风 style | " + STYLES.length + " | 怎么画 |");
out.push("| 题材 theme | " + genres.GENRES.length + " | 画什么 |");
out.push("| 版式 layout | " + layout.LAYOUTS.length + " | 怎么摆 |");
out.push("| 配色 palette | " + palette.PALETTES.length + " | 什么色 |");
out.push("");

out.push("---");
out.push("");
out.push("## 一、画风 style（" + STYLES.length + "）");
out.push("");
out.push("决定笔触、上色逻辑、材质与年代质感。**不含场景**——场景交给题材层。");
out.push("");

Object.entries(group(STYLES, "cat")).forEach(([k, list]) => {
  out.push("### " + k + "（" + list.length + "）");
  out.push("");
  out.push("| 码 | 中文 | English | 技法要点 |");
  out.push("|---|---|---|---|");
  list.forEach(x => {
    const d = (en[x.id] || x.desc || "").slice(0, 76);
    out.push("| `" + code(x.id) + "` | " + esc(x.zh) + " | " + esc(x.en) + " | " + esc(d) + "… |");
  });
  out.push("");
});

out.push("---");
out.push("");
out.push("## 二、题材 theme（" + genres.GENRES.length + "）");
out.push("");
out.push("决定画面内容与情境。正文自带完整场景，**这里不要再叠一个场景**。");
out.push("");

Object.entries(group(genres.GENRES, "cat")).forEach(([k, list]) => {
  out.push("### " + k + "（" + list.length + "）");
  out.push("");
  out.push("| 码 | 中文 | English | 核心要求 |");
  out.push("|---|---|---|---|");
  list.forEach(x => {
    const d = (x.scene || x.desc || "").slice(0, 70);
    out.push("| `" + code(x.id) + "` | " + esc(x.zh) + " | " + esc(x.en) + " | " + esc(d) + "… |");
  });
  out.push("");
});

out.push("---");
out.push("");
out.push("## 三、版式 layout（" + layout.LAYOUTS.length + "）");
out.push("");
out.push("决定元素怎么分布。**画幅必须照设**，比例不同出的是两张图。");
out.push("");

Object.entries(group(layout.LAYOUTS, "cat")).forEach(([k, list]) => {
  out.push("### " + k + "（" + list.length + "）");
  out.push("");
  out.push("| 码 | 名称 | 画幅 | 结构 | 注意 |");
  out.push("|---|---|---|---|---|");
  list.forEach(x => {
    out.push("| `" + code(x.id) + "` | " + esc(x.zh) + " | `" + (x.ratio || "—") + "` | "
      + esc((x.desc || "").slice(0, 44)) + " | " + esc((x.note || "").slice(0, 40)) + " |");
  });
  out.push("");
});

out.push("---");
out.push("");
out.push("## 四、配色 palette（" + palette.PALETTES.length + "）");
out.push("");
out.push("整幅图的统一色调。HEX 直接进提示词，不用模型猜。");
out.push("");
out.push("| 码 | 名称 | 主色 | 点缀 | 适用 |");
out.push("|---|---|---|---|---|");
palette.PALETTES.forEach(x => {
  out.push("| `" + code(x.id) + "` | " + esc(x.zh) + " | `" + (x.hex || "—") + "` | `"
    + (x.accent || "—") + "` | " + esc((x.mood || "").slice(0, 40)) + " |");
});
out.push("");

const dest = path.join(__dirname, "..", "references", "CATALOG.md");
fs.writeFileSync(dest, out.join("\n"), "utf8");
console.log("已生成 " + dest);
console.log("  画风 " + STYLES.length + " · 题材 " + genres.GENRES.length
  + " · 版式 " + layout.LAYOUTS.length + " · 配色 " + palette.PALETTES.length
  + " = " + (STYLES.length + genres.GENRES.length + layout.LAYOUTS.length + palette.PALETTES.length) + " 条");