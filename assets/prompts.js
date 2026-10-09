/* ============================================================
 * PROMPT_EN —— 英文出图正文统一查表
 * ============================================================
 *
 * 为什么不直接读 PROMPT_SETS：
 *
 *   PROMPT_SETS 是 prompt-kit.js 里的一个聚合数组，
 *   靠「每个正文文件加载时 push 进去」攒起来。
 *   浏览器里 <script> 共用同一个全局对象，push 有效；
 *   但在 Node / 测试沙箱里，正文文件常被 vm.runInContext 加载，
 *   push 进的是**另一个上下文**的数组，
 *   而 require('./prompt-kit.js') 拿到的是模块自己那份空数组。
 *   两份不是同一个对象，于是：
 *
 *     studio.js 的 gptCache() 恒为空
 *       → 英文正文取不到
 *       → 静默回退到条目自带的 demo 字段（逗号标签串）
 *       → 不报错、不空框，只是「英文那几段特别短」
 *
 *   中文侧有 prompts-zh.js 独立兜底，所以只有英文变差。
 *   中英详略不对等很容易被当成「本来就是标签版」放过。
 *
 * 所以这里显式列举 15 个正文文件，自己攒一份表，
 * 不依赖任何 push 时序。浏览器与 Node 走同一份逻辑。
 *
 * 与 prompts-zh.js 的区别：
 *   prompts-zh.js  收 5 个中文正文文件 + LAYOUTS + PALETTES
 *   prompts.js（本文件）收 15 个英文正文文件
 *
 * 【命名约定】文件名与变量名严格对应：
 *   data-prompts-st1.js → PROMPTS_ST1
 *   data-prompts-jp4.js → PROMPTS_JP4
 * 变量名由文件名去掉 data-prompts- 前缀后大写得出，
 * 新增文件时照此办理即可，不需要再手工登记这张表。
 * ============================================================ */

var PROMPT_EN = (function () {
  "use strict";

  /* 英文正文批次。顺序只影响 ids() 的输出顺序，不影响查表。
     变量名与文件名对应关系见文件头说明。 */
  var SOURCES = [
    ["PROMPTS_ST1", "./data-prompts-st1.js"],
    ["PROMPTS_ST2", "./data-prompts-st2.js"],
    ["PROMPTS_ST3", "./data-prompts-st3.js"],
    ["PROMPTS_JP1", "./data-prompts-jp1.js"],
    ["PROMPTS_JP2", "./data-prompts-jp2.js"],
    ["PROMPTS_JP3", "./data-prompts-jp3.js"],
    ["PROMPTS_JP4", "./data-prompts-jp4.js"],
    ["PROMPTS_GN1", "./data-prompts-gn1.js"],
    ["PROMPTS_GN2", "./data-prompts-gn2.js"],
    ["PROMPTS_CN1", "./data-prompts-cn1.js"],
    ["PROMPTS_WW1", "./data-prompts-ww1.js"],
    ["PROMPTS_FR1", "./data-prompts-fr1.js"],
    ["PROMPTS_GK1", "./data-prompts-gk1.js"],
    ["PROMPTS_LN1", "./data-prompts-ln1.js"],
    ["PROMPTS_IF1", "./data-prompts-if1.js"]
  ];

  /* 与 tools/_loadlist.js 的 PROMPT_FILES 一致。
     双跑取全局必须走容器，不能写 typeof X !== "undefined"——
     碰到同名 getter 会撞上自己，递归到爆栈。 */
  function g(name, file, prop) {
    var root = (typeof window !== "undefined" && window) ||
               (typeof globalThis !== "undefined" && globalThis) || null;
    if (root && root[name] !== undefined && root[name] !== null) return root[name];
    if (typeof module !== "undefined" && module.exports && typeof require === "function") {
      try {
        var m = require(file);
        return prop ? m[prop] : m;
      } catch (e) { return null; }
    }
    return null;
  }

  /* 一个来源两条通道：
     先试 eval 裸标识符（浏览器里顶层 var 已挂全局），
     失败再按 require 路径取（Node 侧）。
     两条都不通就跳过——这正是「某个文件没加载」应有的表现：
     静默少几批，而不是整页崩掉。 */
  function readOne(name, file) {
    var arr = null;
    try { arr = eval(name); } catch (e) { arr = null; }
    if (!Array.isArray(arr)) {
      var m = g(name, file, name);
      if (Array.isArray(m)) arr = m;
    }
    return Array.isArray(arr) ? arr : null;
  }

  function collect() {
    var m = new Map(), order = [], dup = [];
    function put(arr) {
      (arr || []).forEach(function (p) {
        if (!p || !p.id) return;
        if (m.has(p.id)) dup.push(p.id);
        m.set(p.id, p.gpt || "");
        order.push(p.id);
      });
    }
    SOURCES.forEach(function (s) { put(readOne(s[0], s[1])); });
    return { map: m, order: order, dup: dup };
  }

  var C = null;
  function cache() { if (!C) C = collect(); return C; }

  var API = {
    /* 取英文正文。旧 ID 与规范码都能查。 */
    get: function (id) {
      if (!id) return "";
      var c = cache();
      var key = String(id);
      if (c.map.has(key)) return c.map.get(key);
      var seg = segOf(key);
      if (seg) {
        /* 规范码反推：段码 + 一位/两位/三位序号都试一遍。
           旧 ID 的序号位数不固定（A1-01 两位、W-J84 混合），
           只补零到三位会查不到。
           seg.seg 是旧前缀；PROMPT_ZH 缺失时 segOf 返回的对象里
           没有 seg 字段（那是 prompts-zh.js 的内部结构），此时退回
           seg.code 拼——至少 ST-001 这种同形段能命中。 */
        var prefix = seg.seg || seg.code;
        var cands = [];
        [1, 2, 3].forEach(function (w) {
          var s = String(seg.num);
          while (s.length < w) s = "0" + s;
          while (s.length > w) s = s.slice(-w);
          cands.push(prefix + "-" + s);
        });
        for (var i = 0; i < cands.length; i++) {
          if (c.map.has(cands[i])) return c.map.get(cands[i]);
        }
      }
      return "";
    },

    has: function (id) { return API.get(id) !== ""; },
    size: function () { return cache().map.size; },
    ids: function () { return cache().order.slice(); },

    /* 重复 ID 自查。同一个 id 在两批里各存一份正文时，
       后写的会覆盖先写的 —— 那是静默的数据丢失，不是覆盖。 */
    duplicates: function () { return cache().dup.slice(); },

    /* 供 tests / 体检脚本用：直接注入一批，替换整表。 */
    inject: function (sets) {
      var m = new Map(), order = [];
      (sets || []).forEach(function (arr) {
        (arr || []).forEach(function (p) {
          if (!p || !p.id) return;
          m.set(p.id, p.gpt || "");
          order.push(p.id);
        });
      });
      C = { map: m, order: order, dup: [] };
      return m;
    },

    /* 取规范段码映射（供规范码反查用）。
       CODES 缺失时返回 null，get() 自动退化为只能按旧 ID 查 —— 不报错。 */
    segOf: segOf,
    /* 测试用：强制重取，例如换了 require 环境之后 */
    reset: function () { C = null; }
  };

  function segOf(key) {
    /* 复用 prompts-zh.js 的段码反查，不再自己写一份。
       段码→旧前缀的映射与「数字位补出所有宽度」的规则只有一处真源；
       两处各写一份的风险是：改了一处忘了另一处，
       于是「按旧 ID 查得到、按规范码查不到」——
       两条查询路径结果不一致，最难察觉的一种失效。 */
    var PZH = g("PROMPT_ZH", "./prompts-zh.js", "PROMPT_ZH");
    if (PZH && typeof PZH.segOf === "function") {
      var s = PZH.segOf(key);
      if (s) return s;
      return null;
    }
    /* PROMPT_ZH 未加载时的本地兜底：直接从 CODES 建映射。 */
    var m = String(key).match(/^([A-Z]{2})-(\d{1,3})$/);
    if (!m) return null;
    var codes = g("CODES", "./codes.js", "CODES");
    if (!codes || !codes.SEGMENTS) return null;
    for (var i = 0; i < codes.SEGMENTS.length; i++) {
      var sg = codes.SEGMENTS[i];
      if (sg.code !== m[1]) continue;
      /* old 可能是 W-* 这种通配（作品段没有单一旧前缀），不参与逆推。 */
      if (!sg.old || sg.old.indexOf("*") >= 0) return null;
      return { code: m[1], seg: sg.old, num: parseInt(m[2], 10) };
    }
    return null;
  }

  return API;
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PROMPT_EN: PROMPT_EN };
}