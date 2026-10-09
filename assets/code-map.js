/* ============================================================
 * code-map.js · 编码迁移表（旧码 ↔ 新码）
 * ============================================================
 * 为什么需要这一层：
 *   段码体系从「按字母猜含义」改成「前缀自解释」后，
 *   旧码（W-J-001、A1-001）会失效。但组合串可能已经被人存下来了。
 *
 * 做法：不做「一次性替换」，而是把旧码登记成新码的别名。
 *   解析时新旧都能命中，输出时只给新码。
 *   迁移无损，且不占用新码空间——新码一旦发布，旧码永远只读。
 *
 * 与 codes.js 的分工：
 *   codes.js  推导规则（纯函数，管新码怎么生成）
 *   本文件    历史对照（管旧码怎么找到新码）
 *   两者互不依赖，改一边不影响另一边。
 *
 * 硬约定：本文件只增不删。新条目没有旧码，不需要动它。
 * ============================================================ */
var CODE_MAP = (function () {

  /* ---------- 段码改名表 ----------
     只列「需要改的」。节点层的 13 个段码不改名，
     所以它们不出现在这里——不是漏了，是原样保留。 */
  var SEG_ALIAS = {
    /* 条目层 · 作品：十个地区段合并为 WK */
    "W-J": "WK", "W-C": "WK", "W-K": "WK", "W-W": "WK", "W-F": "WK",
    "W-R": "WK", "W-I": "WK", "W-N": "WK", "W-L": "WK", "W-G": "WK",
    /* 条目层 · 画风五维：数字段改自解释前缀 */
    "A1": "ST",   /* 技法 Style technique */
    "A2": "ER",   /* 年代 Era */
    "A3": "SB",   /* 工作室 Studio */
    "A4": "RG",   /* 地区 Region */
    "A5": "MV",   /* 全球流派 Movement */
    /* 条目层 · 题材 */
    "G": "TH",    /* 主题 Theme */
    /* 工具层：单字母改双字母，与条目层的 N/S 彻底分开 */
    "T": "TP", "N": "NG", "S": "SY"
  };

  /* 作品段的地区排序。决定 WK 段的新号。
     顺序一旦定下就不能改——改了所有人的 WK-001 会指向另一部作品。 */
  var REGION_RANK = {
    "W-J": 1,  /* 日本 */
    "W-C": 2,  /* 中国 */
    "W-K": 3,  /* 韩国 */
    "W-W": 4,  /* 西方欧美 */
    "W-F": 5,  /* 法国比利时 */
    "W-R": 6,  /* 俄罗斯苏联 */
    "W-I": 7,  /* 印度 */
    "W-N": 8,  /* 北欧 */
    "W-L": 9,  /* 拉美 */
    "W-G": 10  /* 全球 */
  };

  var LEGACY = {};   // 旧码 → 新码
  var WORK_ORDER = [];  // 作品旧号，按出品顺序

  /* ---------- 作品顺序冻结名单 ----------
     为什么必须有一份写死的名单：

     WK 号由「地区排序 + 段内序号」的位置决定。作品分布在十个地区段，
     排序时 J 段（日本，112 条）在最前、G 段（全球，12 条）在最后。
     这意味着：给韩国段补一部新作品（W-K07），它按排序插在
     中国段之后、欧美段之前——**后面 100 部作品的 WK 号全体 +1**。
     中国段补一部更狠，后面 120 部全体挪动。

     「新增只往后追加，永不重排旧号」这条硬约定，
     靠排序是实现不了的——排序天然允许往中间插。
     所以顺序必须冻结：下面这份名单就是已发布的 WK-001..233
     与旧号的对应关系，任何情况下不再重排。

     规则（tools/check_ids.js 逐条盯着）：
     1. 名单里的 id 保持在原位——即使它从数据里被删了，
        也只是该号悬空（体检会大声报），绝不挪动后面的号。
     2. 数据里新出现的作品 id **只追加在名单末尾**，
        追加顺序仍按 (地区排序, 段内序号)，保证追加之间也确定。
     3. 新作品入库后跑 check_ids，它会给出可直接粘贴的追加行；
        把新 id 粘进本名单，编号变更才算「发布」。
     4. 别手动「排序整理」这份名单——它看起来乱（按地区分块）
        恰恰是发布顺序本身，重排等于改号。 */
  var WORK_ORDER_FROZEN = [
    "W-J-001", "W-J-002", "W-J-003", "W-J-004", "W-J-005", "W-J-006",
    "W-J-007", "W-J-008", "W-J-009", "W-J-010", "W-J-011", "W-J-012",
    "W-J-013", "W-J-014", "W-J-015", "W-J-016", "W-J-017", "W-J-018",
    "W-J-019", "W-J-020", "W-J-021", "W-J-022", "W-J-023", "W-J-024",
    "W-J-025", "W-J-026", "W-J-027", "W-J-028", "W-J-029", "W-J-030",
    "W-J-031", "W-J-032", "W-J-033", "W-J-034", "W-J-035", "W-J-036",
    "W-J-037", "W-J-038", "W-J-039", "W-J-040", "W-J-041", "W-J-042",
    "W-J-043", "W-J-044", "W-J-045", "W-J-046", "W-J-047", "W-J-048",
    "W-J-049", "W-J-050", "W-J-051", "W-J-052", "W-J-053", "W-J-054",
    "W-J-055", "W-J-056", "W-J-057", "W-J-058", "W-J-059", "W-J-060",
    "W-J-061", "W-J-062", "W-J-063", "W-J-064", "W-J-065", "W-J-066",
    "W-J-067", "W-J-068", "W-J-069", "W-J-070", "W-J-071", "W-J-072",
    "W-J-073", "W-J-074", "W-J-075", "W-J-076", "W-J-077", "W-J-078",
    "W-J-079", "W-J-080", "W-J-081", "W-J-082", "W-J-083", "W-J-084",
    "W-J-085", "W-J-086", "W-J-087", "W-J-088", "W-J-089", "W-J-090",
    "W-J-091", "W-J-092", "W-J-093", "W-J-094", "W-J-095", "W-J-096",
    "W-J-097", "W-J-098", "W-J-099", "W-J-100", "W-J-101", "W-J-102",
    "W-J-103", "W-J-104", "W-J-105", "W-J-106", "W-J-107", "W-J-108",
    "W-J-109", "W-J-110", "W-J-111", "W-J-112", "W-C-001", "W-C-002",
    "W-C-003", "W-C-004", "W-C-005", "W-C-006", "W-C-007", "W-C-008",
    "W-C-009", "W-C-010", "W-C-011", "W-C-012", "W-C-013", "W-C-014",
    "W-C-015", "W-C-016", "W-C-017", "W-C-018", "W-C-019", "W-C-020",
    "W-C-021", "W-K-001", "W-K-002", "W-K-003", "W-K-004", "W-K-005",
    "W-K-006", "W-W-001", "W-W-002", "W-W-003", "W-W-004", "W-W-005",
    "W-W-006", "W-W-007", "W-W-008", "W-W-009", "W-W-010", "W-W-011",
    "W-W-012", "W-W-013", "W-W-014", "W-W-015", "W-W-016", "W-W-017",
    "W-W-018", "W-W-019", "W-W-020", "W-F-001", "W-F-002", "W-F-003",
    "W-F-004", "W-F-005", "W-F-006", "W-F-007", "W-F-008", "W-F-009",
    "W-F-010", "W-F-011", "W-F-012", "W-F-013", "W-F-014", "W-F-015",
    "W-F-016", "W-F-017", "W-F-018", "W-F-019", "W-F-020", "W-F-021",
    "W-F-022", "W-F-023", "W-R-001", "W-R-002", "W-R-003", "W-R-004",
    "W-R-005", "W-R-006", "W-R-007", "W-R-008", "W-R-009", "W-R-010",
    "W-R-011", "W-R-012", "W-I-001", "W-I-002", "W-I-003", "W-I-004",
    "W-I-005", "W-N-001", "W-N-002", "W-N-003", "W-N-004", "W-N-005",
    "W-N-006", "W-N-007", "W-N-008", "W-N-009", "W-N-010", "W-N-011",
    "W-N-012", "W-N-013", "W-N-014", "W-N-015", "W-N-016", "W-N-017",
    "W-L-001", "W-L-002", "W-L-003", "W-L-004", "W-L-005", "W-G-001",
    "W-G-002", "W-G-003", "W-G-004", "W-G-005", "W-G-006", "W-G-007",
    "W-G-008", "W-G-009", "W-G-010", "W-G-011", "W-G-012"
  ];

  /* 排序比较器：先地区（REGION_RANK），再段内序号。
     只用于两处：首次建表（名单为空时），以及给新作品定追加顺序。
     已发布部分的顺序由冻结名单决定，排序器碰不到它们。 */
  function byRegionSeq(a, b) {
    var ra = REGION_RANK[regionOf(a)] || 99;
    var rb = REGION_RANK[regionOf(b)] || 99;
    if (ra !== rb) return ra - rb;
    return seqOf(a) - seqOf(b);
  }

  function pad2(n) {
    var s = String(n);
    while (s.length < 2) s = "0" + s;
    return s;
  }
  function pad3(n) {
    var s = String(n);
    while (s.length < 3) s = "0" + s;
    return s;
  }
  function regionOf(oldId) { var m = String(oldId).match(/^(W-[A-Z])/); return m ? m[1] : ""; }
  /* 两种写法都要吃：数据源原样 W-J01（无连字符）与规范旧码 W-J-001。
     冻结名单用的是后者——这里若只认前一种，
     名单里 233 个 id 会全部解析成序号 0（实测踩过：forward 全线返回 null）。 */
  function seqOf(oldId) { var m = String(oldId).match(/^W-[A-Z]-?(\d{1,3})$/); return m ? parseInt(m[1], 10) : 0; }
  /* 作品 id 归一化：统一成「地区-三位序号」的规范旧码形态。
     冻结名单的比对、排序、登记全部走归一化后的值——
     数据源 W-J01 与名单 W-J-001 才能认出是同一部作品。 */
  function normWorkId(oldId) {
    var seg = regionOf(oldId), seq = seqOf(oldId);
    return (seg && seq) ? seg + "-" + pad3(seq) : String(oldId).toUpperCase();
  }

  /* 作品旧号 → 规范旧码。两位与三位两种写法都可能被抄过，统一到三位。 */
  function legacyWorkCode(oldId) {
    var seg = regionOf(oldId);
    return seg ? seg + "-" + pad3(seqOf(oldId)) : "";
  }

  /* 作品旧号 → 新码。位置由 WORK_ORDER 决定。 */
  function workCode(oldId) {
    var i = WORK_ORDER.indexOf(oldId);
    return i < 0 ? null : "WK-" + pad3(i + 1);
  }

  /* ---------- 地理编码（派生层，不是发布码） ----------

     需求：配图按国家/地区自动排序归类（CN-001、JP-001…）。
     但正式 code **不能**按地区分——codes.js 头部注释记录了合并动机：
     作品曾按地区切十个段，规模差 22 倍，合并成 WK 才让追加不撑爆某一段。
     把地区字母换回正式编码等于把刚修完的重排隐患请回来。

     所以「国家前缀」作为**派生字段**存在：
       - 由作品旧号的地区字母现算，不写进数据源、不替换 WK 码；
       - 组内序号取该作品在 WORK_ORDER（冻结名单）中同地区的位次——
         冻结名单本身追加稳定，地理编码因此同样追加稳定：
         新日番追加在名单末尾，就是日本组的下一个号（JP-113），旧号全不动；
       - 每次建表现算，没有第二处要同步维护；
       - 前缀对照表覆盖全部十个地区字母，新字母没登记时 geoOf 返回 null，
         check_ids 第 10 组会红，逼着先补表再上数据。 */
  var GEO_PREFIX = {
    "W-C": { p: "CN", zh: "中国" },
    "W-J": { p: "JP", zh: "日本" },
    "W-K": { p: "KR", zh: "韩国" },
    "W-I": { p: "IN", zh: "印度·东南亚" },
    "W-N": { p: "NA", zh: "北美" },
    "W-L": { p: "LA", zh: "拉美" },
    "W-F": { p: "EW", zh: "欧洲·西部北部（法国比利时/英爱/北欧）" },
    "W-R": { p: "EE", zh: "欧洲·东部中欧（苏联东欧/德国西班牙）" },
    "W-W": { p: "XW", zh: "欧美综合" },
    "W-G": { p: "GM", zh: "游戏原作（按媒介归组，非地区）" }
  };
  /* 与 WORK_ORDER 对齐：geoList()[i] 就是 workOrder()[i] 的地理编码 */
  var GEO_LIST = [];

  function geoCodeOf(oldId) {
    /* 入参可能是数据源原样 W-J01，先归一化——
       WORK_ORDER 里存的是规范形态 W-J-001，不归一就永远匹配不上。
       workCode 没踩这个坑是因为 forward() 先走 LEGACY（四种写法都登记过），
       而新作品在登记前就被直接调 geoOf，没有这层兜底。 */
    var nid = normWorkId(oldId);
    var seg = regionOf(nid);
    var g = GEO_PREFIX[seg];
    if (!g) return null;
    var n = 0;
    for (var i = 0; i < WORK_ORDER.length; i++) {
      if (regionOf(WORK_ORDER[i]) === seg) {
        n++;
        if (WORK_ORDER[i] === nid) return g.p + "-" + pad3(n);
      }
    }
    return null;
  }

  /* ---------- 构建 ---------- */

  /* 排一次作品顺序。必须传全部作品旧号，否则序号会错。

     追加式建表（见 WORK_ORDER_FROZEN 的注释）：
     - 名单非空时，已发布部分严格按名单取位——
       数据里改地区、改序号、删条目都不会挪动任何已发布号码；
     - 数据里新出现的 id 追加在名单之后，追加顺序仍按 (地区, 序号) 排，
       保证多次追加之间也是确定的；
     - 名单为空（理论上只在首建时发生）才整体按排序建表。
       若这个分支在发布后被触发，check_ids 会红——
       那说明名单被误删了，而重排即将静默发生。 */
  function buildWorks(oldIds) {
    /* 先归一化再去重：数据源 W-J01 与名单 W-J-001 是同一部作品，
       不归一的话它会被当成「新作品」追加一个重复号。 */
    var seen = {};
    var incoming = [];
    (oldIds || []).forEach(function (id) {
      var nid = normWorkId(id);
      if (seen[nid]) return;
      seen[nid] = 1;
      incoming.push(nid);
    });
    if (WORK_ORDER_FROZEN.length) {
      var inFrozen = {};
      WORK_ORDER_FROZEN.forEach(function (id) { inFrozen[normWorkId(id)] = 1; });
      var fresh = incoming.filter(function (id) { return !inFrozen[id]; })
        .sort(byRegionSeq);
      WORK_ORDER = WORK_ORDER_FROZEN.map(normWorkId).concat(fresh);
    } else {
      WORK_ORDER = incoming.sort(byRegionSeq);
    }
    WORK_ORDER.forEach(function (oldId, i) {
      /* 一条旧作品号要登记**四种**写法，少一种就等于该写法永久失效。
       *
       * 数据源里的旧 id 长这样：W-J01（无连字符、两位）。
       * 用户手里可能抄到任何一种，四种都指向同一条：
       *   W-J01    数据源原样，最常见
       *   W-J001   补成三位
       *   W-J-01   加连字符仍保持两位
       *   W-J-001  加连字符且三位（唯一一种原先被登记的）
       *
       * 这里曾只登记后两种，于是 W-J01 / W-J001 都 forward() 返回 null。
       * 症状极隐蔽：页面照常打开、组合串照样能生成，
       * 只有用户照着自己抄的编号检索时查不到——
       * 而「拿编号检索」正是编号体系存在的唯一理由。
       *
       * pad2 对序号 ≥100 会返回三位，所以 W-J100 的「两位写法」
       * 本来就等于三位，无需额外登记；两条分支已能覆盖全部。
       */
      var seg = regionOf(oldId), seq = seqOf(oldId);
      var wk = "WK-" + pad3(i + 1);
      LEGACY[seg + "-" + pad3(seq)] = wk;/* W-J-001 */
      LEGACY[seg + pad3(seq)] = wk;        /* W-J001  */
      LEGACY[seg + "-" + pad2(seq)] = wk;   /* W-J-01  */
      LEGACY[seg + pad2(seq)] = wk;         /* W-J01   */
    });
    /* 建表后现算一轮地理编码，与 WORK_ORDER 保持对齐。
       某条算出 null（新地区字母没进 GEO_PREFIX）不在这里抛——
       交给 check_ids 第 10 组大声报，避免建表路径多一条静默失败分支。 */
    GEO_LIST = WORK_ORDER.map(geoCodeOf);
    return WORK_ORDER.length;
  }

  /* 非作品的条目段：序号不变，只换前缀。
     同样必须登记四种写法（理由见 buildWorks 的注释）。
     A1 段的数据源原样写法是 A101 —— 无连字符、无补零，
     只登记 A1-001 / A1-01 的话，用户从数据源里抄到的号反而查不到。 */
  function ensure(oldSeg, count) {
    /* 没改名不等于不需要别名。
       LT / PL / 以及十三个节点段码都没进 SEG_ALIAS（本来就不用改），
       以前这里直接 return 0，于是它们的旧号一个都没登记——
       结果 LT-01 / PL-01 查不到，而它们明明是数据源里的原样写法。
       「不改名」就等于「新旧同名」，此时ns 就是它自己。 */
    var ns = SEG_ALIAS[oldSeg] || oldSeg;
    if (ns === "WK") return 0;
    for (var i = 1; i <= count; i++) {
      var code = ns + "-" + pad3(i);
      LEGACY[oldSeg + "-" + pad3(i)] = code;
      LEGACY[oldSeg + "-" + pad2(i)] = code;
      LEGACY[oldSeg + pad3(i)] = code;
      LEGACY[oldSeg + pad2(i)] = code;
    }
    return count;
  }

  /* 登记全部非作品段。
     countOf 形如 { A1: 22, A2: 14, ... }（数据源里该段的真实条数）。
     为什么以前没有这段：靠人手逐段调 ensure()，结果一次都没调过——
     LEGACY 里只有 buildWorks 写的作品键，非作品段全靠forward() 的
     形态解析兜底，而形态解析不认「无连字符」写法，于是 A101 查不到。
     补上之后 forward() 有真源可查，形态解析退回兜底职责。 */
  function ensureAll(countOf) {
    var n = 0;
    Object.keys(countOf || {}).forEach(function (seg) {
      n += ensure(seg, countOf[seg]);
    });
    return n;
  }

  /* 任意旧码 → 新码。解析器的别名入口调它。 */
  function forward(oldCode) {
    var s = String(oldCode == null ? "" : oldCode).trim().toUpperCase();
    if (!s) return null;
    if (LEGACY[s]) return LEGACY[s];
    /* 没登记过的旧码再试一次形态解析：
       万一某段扩容过、或用户写了个不存在的号。 */
    var m = s.match(/^(W-[A-Z]|A[1-5]|G|T|N|S)-(\d{1,3})$/);
    if (!m) return null;
    var seg = m[1], seq = parseInt(m[2], 10);
    if (seg.indexOf("W-") === 0) return workCode(seg + pad2(seq));
    var ns = SEG_ALIAS[seg];
    return ns ? ns + "-" + pad3(seq) : null;
  }

  /* 新码 → 旧码（仅用于查文档，不用于输出）。
     作品段因合并后无法反推，所以返回空串。 */
  function backward(newCode) {
    var s = String(newCode == null ? "" : newCode).trim().toUpperCase();
    for (var k in LEGACY) {
      if (LEGACY[k] === s) return k;
    }
    return "";
  }

  return {
    SEG_ALIAS: SEG_ALIAS,
    REGION_RANK: REGION_RANK,
    GEO_PREFIX: GEO_PREFIX,
    WORK_ORDER_FROZEN: WORK_ORDER_FROZEN,
    workOrder: function () { return WORK_ORDER.slice(); },
    geoOf: geoCodeOf,
    geoList: function () { return GEO_LIST.slice(); },
    LEGACY: LEGACY,
    buildWorks: buildWorks,
    workCode: workCode,
    legacyWorkCode: legacyWorkCode,
    forward: forward,
    backward: backward,
    ensure: ensure,
    ensureAll: ensureAll,
    count: function () { return Object.keys(LEGACY).length; }
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { CODE_MAP: CODE_MAP };