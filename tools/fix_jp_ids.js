/* 用后立即失效的一次性脚本：修正日本作品提示词卡的 ID 错位
 * 背景：宝可梦/宠物小精灵、航海王/海贼王在源数据里是同一条，
 *       之前误按两条计数，导致 W-J15 之后的 ID 全部错位。
 * 规则：批次1 保留 28 条 → W-J01..W-J28；批次2 保留 30 条 → W-J29..W-J58
 */
const fs = require('fs');

const pathmod = require('path');
const ROOT = pathmod.join(__dirname, '..');
const A = p => pathmod.join(ROOT, p);

const p1 = require(A('assets/data-prompts-jp1.js')).PROMPTS_JP1;
const p2 = require(A('assets/data-prompts-jp2.js')).PROMPTS_JP2;

// 需要剔除的下标（0 基）：宠物小精灵替代版、海贼王替代版
const DROP1 = [14, 21];
const b1 = p1.filter((_, i) => !DROP1.includes(i));
const b2 = p2.slice();

if (b1.length !== 28 || b2.length !== 30) {
  console.error('条数不符，终止：b1=' + b1.length + ' b2=' + b2.length);
  process.exit(1);
}

function emit(file, arr, idFrom) {
  const lines = arr.map((p, i) =>
    '{ id:"W-J' + String(idFrom + i).padStart(2, '0') + '", gpt:"' + p.gpt.replace(/"/g, '\\"') + '" }');
  return lines;
}

const conf = [
  [A('assets/data-prompts-jp1.js'), b1, 1, 'PROMPTS_JP1'],
  [A('assets/data-prompts-jp2.js'), b2, 29, 'PROMPTS_JP2']
];

conf.forEach(([path, arr, from, varName, to]) => {
  const body = emit(null, arr, from).join(',\n\n');
  const out =
    '/* ============================================================\n' +
    ' * 提示词卡 · 日本作品（源文件 ' + path.split('/').pop() + '）\n' +
    ' * 每条 = { id, gpt }：可直接粘贴给 GPT 出图的英文自然语言正文\n' +
    ' * ID 经 tools/fix_jp_ids.js 按源数据顺序校正，勿再手改\n' +
    ' * ============================================================ */\n\n' +
    'const ' + varName + ' = [\n\n' + body + '\n];\n\n' +
    'if (typeof module !== "undefined" && module.exports) module.exports = { ' + varName + ' };\n' +
    'if (typeof PROMPT_SETS !== "undefined") PROMPT_SETS.push(' + varName + ');\n';
  fs.writeFileSync(path, out, 'utf-8');
  console.log(path + ' → ' + arr.length + ' 条，W-J' + String(from).padStart(2, '0') +
              ' ~ W-J' + String(from + arr.length - 1).padStart(2, '0'));
});
