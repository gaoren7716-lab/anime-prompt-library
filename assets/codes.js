/* ============================================================
 * codes.js · 全库统一编码表
 * ============================================================
 * 为什么需要这一层：
 *   原有 id 是「历史数据的主键」，格式不统一——
 *     条目层  A1-01（2位） / W-J01（2位） / W-J100（3位）
 *     节点层  CB-01-1（末段1位） / VS-06-10（末段2位）
 *   而 data-misc.js 里的 T-01 / N-01 / S-01 又是另一套。
 *   直接改 id 会砸掉 324 条已验证的 GPT 提示词映射，所以不动原字段，
 *   另建一层「规范编码 code」，专门用于组合引用与检索。
 *
 * 编码文法（唯一真源，改这里就够）：
 *
 *   条目层  <两字母前缀>-<三位序号>            ST-001   WK-233
 *   工具层  <两字母前缀>-<三位序号>            TP-001
 *   节点层  <两字母库号>-<三位组>-<三位项>    CB-001-002
 *
 *   前缀自解释：看到 ST 就知道是技法，不用查表。
 *   三位序号：为后续追加留余量（999 条/段，够用）。
 *   节点层多一段：节点天然有两级（组 / 组内条目），
 *   组本身用 -000，把 001 留给它的第一个子节点。
 *
 *   为什么条目层不再按地区分段：
 *     作品曾按地区切成 W-J…W-G 十个段，规模从 5 条到 112 条差 22 倍，
 *     而地区本就是属性（每条作品自带 grp 字段）。合并成 WK 后
 *     编号连续，地区下沉为字段，追加新作品不会再撑爆某一段。
 *
 * 三条硬约定（改代码前先读）：
 *   1. code 一旦发布不可改。改它等于让用户手里的组合串失效。
 *      新增条目只会往后追加序号，不会重排旧号。
 *   2. code 是「引用锚点」，不是内容。改中文名不影响 code 解析，
 *      因为解析走的是本文件的映射表 + 别名表，不读数据源的 zh。
 *   3. 旧码（W-J-001、A1-001）永久可解析。迁移逻辑在 code-map.js，
 *      本文件不读它——改迁移表不影响新码生成，改本文件不影响迁移。
 * ============================================================ */
var CODES = (function () {

  /* ---------- 1. 段码登记表 ----------
     每个段码登记：中文段名、归属层、旧段码、以及它在 README 里的说明。
     old 字段指向 code-map.js 里的别名键，仅供查文档用，解析不走这里。 */
  var SEGMENTS = [
    /* 条目层 · 视觉与内容（可复制出图） */
    { code: "ST", old: "A1", layer: "entry", zh: "技法",       desc: "上色与线条的具体做法" },
    { code: "ER", old: "A2", layer: "entry", zh: "年代",       desc: "按制作年代区分的质感" },
    { code: "SB", old: "A3", layer: "entry", zh: "工作室",     desc: "可辨识的厂牌视觉语言" },
    { code: "RG", old: "A4", layer: "entry", zh: "地区",       desc: "地区产业形态与出品质感" },
    { code: "MV", old: "A5", layer: "entry", zh: "全球流派",   desc: "跨国动画运动与历史风格" },
    { code: "TH", old: "G",  layer: "entry", zh: "题材元素",   desc: "内容层可复用的视觉惯例" },
    { code: "LT", old: "LT", layer: "entry", zh: "排版图型",   desc: "元素怎么摆：社媒卡 / 信息图 / 分镜 / IP / 电商 / 封面" },
    { code: "PL", old: "PL", layer: "entry", zh: "主题配色",   desc: "画面被什么色统领，含主色与点缀色" },
    { code: "WK", old: "W-*",layer: "entry", zh: "作品",       desc: "动画与漫画作品 IP，出品地区见 grp 字段" },
    /* 工具层：可直接套用的成品件 */
    { code: "TP", old: "T",  layer: "tool",  zh: "组合模板",   desc: "整段提示词骨架" },
    { code: "NG", old: "N",  layer: "tool",  zh: "负面提示词", desc: "按场景的排除项" },
    { code: "SY", old: "S",  layer: "tool",  zh: "平台语法",   desc: "各模型的参数与权重写法" },
    /* 节点层：十二库的原子模块。前缀取自各库既有字母缩写，13 段不改名。 */
    { code: "FD", old: "FD", layer: "node", zh: "领域与形式",   desc: "库 01" },
    { code: "GC", old: "GC", layer: "node", zh: "文化与历史",   desc: "库 02" },
    { code: "EN", old: "EN", layer: "node", zh: "作品与实体",   desc: "库 03" },
    { code: "VS", old: "VS", layer: "node", zh: "视觉风格",     desc: "库 04" },
    { code: "VX", old: "VX", layer: "node", zh: "视觉风格·补", desc: "库 04 分卷" },
    { code: "CB", old: "CB", layer: "node", zh: "角色与生物",   desc: "库 05" },
    { code: "WD", old: "WD", layer: "node", zh: "世界与资产",   desc: "库 06" },
    { code: "SN", old: "SN", layer: "node", zh: "故事与表演",   desc: "库 07" },
    { code: "LN", old: "LN", layer: "node", zh: "镜头与时空",   desc: "库 08" },
    { code: "MX", old: "MX", layer: "node", zh: "形态与材质",   desc: "库 09 视觉执行" },
    { code: "PR", old: "PR", layer: "node", zh: "制作流程",     desc: "库 10" },
    { code: "RX", old: "RX", layer: "node", zh: "变形规则",     desc: "库 11" },
    { code: "RC", old: "RC", layer: "node", zh: "检索规则",     desc: "库 12（当前 0 条，段码已预留）" }
  ];

  /* 旧前缀 → 新前缀。只列需要改名的，节点层原样保留。
     与 code-map.js 的 SEG_ALIAS 内容一致但用途不同：
     这里是派生入口（读得早），那里是对外迁移查询（读得晚）。
     两处必须同步——check_codes.js 有断言盯着。 */
  var OLD_SEG = {
    "A1": "ST", "A2": "ER", "A3": "SB", "A4": "RG", "A5": "MV",
    "G": "TH", "T": "TP", "N": "NG", "S": "SY"
  };

  /* ---------- 2. 旧 id → 规范 code 的派生规则 ----------
     说明：这是纯函数，不读数据源，所以永远不会和数据漂移。
     若某条目的 id 不符合下列任一形态，派生返回 null，
     由 add() 汇总成「未编码清单」，交人工处理，不静默丢弃。

     形态 E（作品 W-J01）是唯一需要外部输入的：
     十个地区段合并成 WK 后，新号取决于它在作品全集里的位置，
     所以必须先由 setWorkIndex() 注入有序清单。
     没注入就派生，返回 null 而不是猜一个号——
     猜出来的号会让两个人的 WK-001 指向不同作品，比没有编码更糟。 */

  /* 补零到恰好三位。
     注意不能用 `n < 100 ? "00" + n : n` —— 那会把 84 补成 0084（四位），
     编码长度就不再固定，无法用排序或字符串截取判断大小。 */
  function pad3(n) {
    var s = String(n);
    while (s.length < 3) s = "0" + s;
    return s;
  }

  /* 作品旧号 → WK 序号。外部注入，默认为空表。 */
  var WORK_INDEX = {};

  function setWorkIndex(map) { WORK_INDEX = map || {}; }

  /* 段码 → 层级。normalize 靠它判断该补几段：
     ST-1 是条目，补成 ST-001；CB-1 是节点组，补成 CB-001-000。
     同样两个字符，段数不同——只能靠段码查层级来区分。 */
  var SEG_LAYER = {};
  SEGMENTS.forEach(function (s) { SEG_LAYER[s.code] = s.layer; });

  /* 已登记编码的查找键。normalize 用它判「已经是完整码」。
     add() 每登记一条就往里塞一条键。 */
  var CODE_KEYS = {};

  /* 归一化查找键：去首尾空白、压连续空格、小写。与 resolver.norm 同规则。 */
  function normKey(s) { return String(s == null ? "" : s).trim().toLowerCase().replace(/\s+/g, " "); }

  /* 省略前导零：`ST-1` 与 `ST-001` 等义。
     规范编码也吃简写，不只是旧 ID——用户从旧体系过来会习惯这么写。
     认法与登记形态一致：两段、三段、四段都试。 */
  function normalize(code) {
    var s = String(code == null ? "" : code).trim().toUpperCase();
    if (!s) return null;
    if (CODE_KEYS[normKey(s)]) return CODE_KEYS[normKey(s)];
    var parts = s.split("-");
    if (parts.length < 2) return null;
    var layer = SEG_LAYER[parts[0]];
    /* 节点段只给两段时，认定是「组」，补成 -000：
       CB-1 与 CB-001-000 同义，与 CB-001（首个子节点）区分开。 */
    if (layer === "node" && parts.length === 2) return parts[0] + "-" + pad3(parts[1]) + "-000";
    return parts.map(function (p, i) { return i === 0 ? p : pad3(p); }).join("-");
  }

  function derive(oldId) {
    var s = String(oldId).trim().toUpperCase();

    /* 形态 A：已登记的新段码直接归位。
       必须放在最前面，否则 LT-01 / PL-01 这类**纯字母**段码会掉到形态 D，
       被当成「节点组」补成 LT-001-000（实测踩过：三段码，条目层应两段）。

       为什么会掉：形态 B 的前缀只收「字母 + 可选一位数字」（为了吃下
       旧体系里的 A1 这类混合前缀），LT / PL 是两个纯字母，不匹配；
       形态 D 的 `[A-Z]{2,3}` 却能匹配，于是被误判成节点组。

       判据用 SEG_LAYER 而不是硬编码前缀列表：
       段码表是唯一真源，新增段码只要在 SEGMENTS 里声明层级，
       派生逻辑自动跟上，不需要在这里再登记一次。 */
    var known = s.match(/^([A-Z]{2})-(\d{1,3})$/);
    if (known && SEG_LAYER[known[1]]) {
      var kl = SEG_LAYER[known[1]];
      var base = known[1] + "-" + pad3(parseInt(known[2], 10));
      /* 节点段给两段时是「组」，补 -000 与首个子节点区分；
         条目与工具层本来就是完整编码，不补。 */
      return kl === "node" ? base + "-000" : base;
    }

    /* 形态 E：W-J01 —— 作品层，十个地区段合并为 WK。
       新号来自注入的索引表，不再由地区段 + 序号拼接。 */
    var e = s.match(/^(W-[A-Z])(\d{1,3})$/);
    if (e) return WORK_INDEX[e[1] + pad3(parseInt(e[2], 10))] || null;

    /* 形态 B：ST-001 / TP-001 —— 条目与工具层，前缀 + 三位序号。
       旧前缀（A1…A5 / G / T / N / S）先查 OLD_SEG 换成新前缀。
       前缀要能吃下旧体系里的「字母+数字」（A1），所以段码字段本身允许数字。 */
    var b = s.match(/^([A-Z]\d?)-(\d{1,3})$/);
    if (b) {
      var seg = OLD_SEG[b[1]] || b[1];
      return seg + "-" + pad3(parseInt(b[2], 10));
    }

    /* 形态 C：节点层。
       实际存在两级（CB-01-1）与三级（FD-01-1-1）两种深度——
       库 01「领域与形式」需要区分「动画 → 发行形式 → 电视系列」这样的三级归属，
       硬压成两级会把它们并成同一个条目。
       所以这里逐段补零，段数由旧 ID 实际有几段决定，不做截断。 */
    var c = s.match(/^([A-Z]{2,3}(?:-\d{2})?)(-\d{1,3})(-\d{1,3})(-\d{1,3})?$/);
    if (c) {
      /* 第一段可能是「段码」（CB）也可能是「段码-组号」（FD-01）。
         两种都要各自补零，所以先把组号拆出来再拼。 */
      var seg = c[1];
      var m2 = seg.match(/^([A-Z]{2,3})-(\d{1,3})$/);
      if (m2) seg = m2[1] + "-" + pad3(parseInt(m2[2], 10));
      return seg
        + "-" + pad3(parseInt(c[2].slice(1), 10))
        + "-" + pad3(parseInt(c[3].slice(1), 10))
        + (c[4] ? "-" + pad3(parseInt(c[4].slice(1), 10)) : "");
    }

    /* 形态 D：EN-00 / GC-00 —— 节点层两段，本身是「组」。
       组编码用 -000，与首个子节点的 -001 区分开。
       注意这条必须在形态 C 之后：CB-01 会被形态 C 当成「缺第三段」匹配掉吗？
       不会——形态 C 的第三段是必需的，CB-01 只有两段，匹配失败，落到这里。 */
    var d = s.match(/^([A-Z]{2,3})-(\d{1,3})$/);
    if (d) return d[1] + "-" + pad3(parseInt(d[2], 10)) + "-000";

    return null;
  }

  /* ---------- 3. 码表构建 ---------- */
  var CODE_OF = {};      // 规范 code → 旧 id
  var OLD_OF = {};       // 旧 id → 规范 code
  var UNCODED = [];      // 派生失败的条目，交人工处理

  function add(oldId) {
    if (!oldId || OLD_OF[oldId]) return OLD_OF[oldId] || null;
    var code = derive(oldId);
    if (!code) { UNCODED.push(oldId); return null; }
    if (CODE_OF[code]) {                       // 冲突：绝不覆盖，报出来
      UNCODED.push(oldId + "（与 " + CODE_OF[code] + " 撞码）");
      return null;
    }
    CODE_OF[code] = oldId;
    OLD_OF[oldId] = code;
    CODE_KEYS[normKey(code)] = code;           // 供 normalize 判「已完整」
    return code;
  }

  return {
    SEGMENTS: SEGMENTS,
    OLD_SEG: OLD_SEG,
    derive: derive,
    normalize: normalize,
    setWorkIndex: setWorkIndex,
    add: add,
    CODE_OF: CODE_OF,
    OLD_OF: OLD_OF,
    UNCODED: UNCODED
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { CODES: CODES };