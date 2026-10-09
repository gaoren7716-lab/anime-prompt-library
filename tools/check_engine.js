/* 引擎冒烟测试：组合 / 变形 / 检索 三条主链路是否可用 */
const { ENGINE } = require('../assets/engine.js');

let fail = 0;
function ok(cond, msg) {
  console.log((cond ? "  ✓ " : "  ✗ ") + msg);
  if (!cond) fail++;
}

console.log("==== 统计 ====");
const st = ENGINE.stats();
console.log("  十二库声明数：" + st.libs + "，节点总数：" + st.nodes + "，已有提示词条目：" + st.entries + "，槽位数：" + st.slots);
Object.keys(st.byLib).sort().forEach(k => console.log("    库 " + k + "：" + st.byLib[k] + " 节点"));
ok(st.nodes > 300, "节点总数 > 300");
ok(st.entries >= 324, "已有可复制条目 >= 324");
ok(st.slots === 9, "槽位数 = 9");
ok(Object.keys(st.byLib).length === 12, "十二个库全部有数据");

console.log("\n==== 检索：名称命中 ====");
let r = ENGINE.retrieve("赛璐璐平涂");
ok(r.hits.length > 0 && r.ready, "中文名能直接命中可复制条目：" + (r.hits[0] ? r.hits[0].title : "无"));

r = ENGINE.retrieve("cel shading");
ok(r.hits.length > 0, "英文关键词命中：" + (r.hits[0] ? r.hits[0].title + " / " + r.hits[0].why : "无"));

r = ENGINE.retrieve("机动战士高达 0079");
ok(r.hits.length > 0, "作品名命中：" + (r.hits[0] ? r.hits[0].title : "无"));

console.log("\n==== 检索：描述式 ====");
r = ENGINE.retrieve("黄昏");
ok(r.hits.length > 0, "描述式「黄昏」命中 " + r.hits.length + " 项，首项：" + (r.hits[0] ? r.hits[0].title : "无"));

console.log("\n==== 检索：空结果兜底 ====");
r = ENGINE.retrieve("zzqqxx不存在的东西");
ok(r.empty === true && !!r.hint, "空结果能给出兜底提示，而不是假装找到");

console.log("\n==== 组合 ====");
const c = ENGINE.compose({
  target:  ["PR-01-3"],
  subject: ["CB-01-1", "CB-03-2"],
  content: ["CB-06-2", "WD-01-7"],
  style:   ["VS-04-1", "WD-03-3"],
  frame:   ["LN-01-3", "LN-02-1"],
  motion:  ["LN-05-1"],
  spec:    ["LN-06-1"],
  limit:   ["VX-03-4"]
});
ok(c.slots.length === 12, "装配出 " + c.slots.length + " 个槽位项");
ok(c.tags.length > 40, "生成英文标签串，长度 " + c.tags.length);
ok(c.gpt.indexOf("Purpose of the image") === 0, "生成 GPT 散文段落");
ok(c.grade === "ok", "评级 = " + c.grade);
console.log("  --- 摘要 ---\n  " + c.summary);
console.log("  --- GPT ---\n  " + c.gpt);

console.log("\n==== 冲突检测 ====");
const bad = ENGINE.compose({
  target:  ["PR-01-5"],
  style:   ["VS-11-4"],
  limit:   ["VX-03-4"],
  content: ["VX-01-2"]
});
ok(bad.grade === "conflict", "冲突组合被识别为 conflict（实际：" + bad.grade + "）");
ok(bad.conflicts.length >= 2, "报出 " + bad.conflicts.length + " 条冲突");
bad.conflicts.forEach(cf => console.log("     · [" + cf.type + "] " + cf.reason));

const dup = ENGINE.compose({ frame: ["LN-01-1", "LN-01-5"] });
ok(dup.conflicts.some(x => x.type === "组内互斥"), "同组多选（大远景 + 大特写）被拦下");

console.log("\n==== 变形 ====");
const m = ENGINE.morph({
  base: { subject: ["CB-01-1"], style: ["VS-04-1"], frame: ["LN-01-3"] },
  change: { style: ["VS-11-2"] },
  keep: ["CB-01-1"],
  strength: "medium"
});
console.log("  变化项：" + m.changed.map(x => x.slot + "→" + x.node).join("，"));
console.log("  强度：" + m.strengthText);
ok(m.changed.length === 1, "记录 1 项变化");
ok(m.result.slots.some(s => s.node.id === "CB-01-1"), "保留项 CB-01-1 仍然在装配里");
ok(m.result.slots.some(s => s.node.id === "VS-11-2"), "目标风格已替换进去");

console.log("\n==== 描述式拆解 ====");
const d = ENGINE.decompose("想要一张竖屏的赛璐璐少女特写，黄昏街道，无文字");
console.log("  已识别槽位：" + d.advice.filter(a => a.filled).map(a => a.zh).join("、"));
console.log("  待补槽位：" + d.missing.join("、"));
ok(d.advice.filter(a => a.filled).length >= 4, "至少识别出 4 个槽位");

console.log("\n==== 以图检索清单 ====");
const ic = ENGINE.imageChecklist();
ok(ic.length === 7, "以图检索拆出 " + ic.length + " 个问诊问题");

console.log("\n" + (fail === 0 ? "全部通过 ✓" : "失败 " + fail + " 项 ✗"));
process.exit(fail === 0 ? 0 : 1);
