/* GPU Atlas — shared formatting and spec definitions (used by the browser app and the static page builder). */
(function (root) {
  "use strict";
  function make(D) {
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtInt = (n) => Number(n).toLocaleString("en-US");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function fmtDate(s) {
    if (!s) return "—";
    let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) return `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}`;
    m = /^(\d{4})-(\d{2})$/.exec(s);
    if (m) return `${MONTHS[+m[2] - 1]} ${m[1]}`;
    return s;
  }
  function dateKey(s) {
    if (!s) return 0;
    let m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(s);
    if (m) return +m[1] * 10000 + +m[2] * 100 + (+m[3] || 15);
    m = /(Q[1-4])\s*(\d{4})/.exec(s);
    if (m) return +m[2] * 10000 + ({ Q1: 2, Q2: 5, Q3: 8, Q4: 11 }[m[1]]) * 100;
    m = /(H[12])\s*(\d{4})/.exec(s);
    if (m) return +m[2] * 10000 + (m[1] === "H1" ? 4 : 10) * 100;
    m = /([A-Z][a-z]{2})\s+(\d{4})/.exec(s);
    if (m && MONTHS.includes(m[1])) return +m[2] * 10000 + (MONTHS.indexOf(m[1]) + 1) * 100;
    m = /(\d{4})/.exec(s);
    return m ? +m[1] * 10000 + 600 : 99999999;
  }
  function fmtMem(g) {
    const s = g.specs;
    if (s.mem == null) return s.memType ? `<span class="dim">${esc(s.memType.split(" (")[0])}</span>` : "—";
    if (typeof s.mem === "string") return esc(s.mem);
    const v = s.mem >= 1000 ? `${(s.mem / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} TB` : `${s.mem} GB`;
    return v;
  }
  function fmtBw(v) {
    if (v == null) return "—";
    if (v >= 1e6) return `${(v / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })} PB/s`;
    if (v >= 10000) return `${(v / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} TB/s`;
    return `${fmtInt(v)} GB/s`;
  }
  function fmtPower(s) {
    if (s.power != null) return typeof s.power === "number" ? `${fmtInt(s.power)} W` : esc(s.power);
    if (s.powerRange) return esc(s.powerRange);
    return "—";
  }
  const COUNTRY = (c) => D.COUNTRIES.find((x) => x.code === c) || D.COUNTRIES[0];
  const SYM = { USD: "$", INR: "₹", GBP: "£", EUR: "€", JPY: "¥", CNY: "CN¥", AUD: "A$", CAD: "C$" };
  function money(v, code) {
    const c = COUNTRY(code);
    const n = Number(v).toLocaleString(c.cur === "INR" ? "en-IN" : "en-US", { maximumFractionDigits: 2 });
    return (SYM[c.cur] || c.cur + " ") + n;
  }
  const priceIn = (g, code) => (g.prices && g.prices[code] != null ? g.prices[code] : null);
  const cores = (g) => g.specs.cuda || g.specs.sp || g.specs.shaders || null;
  const gpuCores = (g) => g.specs.gcores || null;
  const coreLabel = (g) => (g.specs.cuda ? "CUDA" : g.specs.sp ? "Stream proc." : g.specs.shaders ? "Shader ALUs" : "");
  const isNum = (v) => /^[\d$~≈<>.,]/.test(String(v).trim());
  const cls = (v) => (isNum(v) ? "num" : "txt");
  const badge = (st) => `<span class="badge ${esc(st)}">${esc(D.STATUS[st] || st)}</span>`;

  const PER_SM = { Blackwell: 4, "Ada Lovelace": 4, Ampere: 4, Turing: 8 };
  function derived(g) {
    const s = g.specs, out = {};
    const consumer = ["desktop", "laptop", "pro"].includes(g.seg);
    if (consumer && s.sm && !s.noRT && PER_SM[g.arch]) {
      if (s.tensor == null) out.tensor = s.sm * PER_SM[g.arch];
      if (s.rt == null) out.rt = s.sm;
    }
    if (g.brand === "NVIDIA" && g.seg === "desktop" && s.cuda && s.boost && s.fp32 == null) {
      out.fp32 = Math.round((s.cuda * 2 * s.boost) / 1e5) / 10;
    }
    return out;
  }
  const specVal = (g, k) => (g.specs[k] != null ? g.specs[k] : derived(g)[k]);

  // ---------- spec field definitions ----------
  const FIELDS = [
    ["GPU", [
      ["chip", "GPU / chip"], ["process", "Process"], ["transistors", "Transistors", (v) => typeof v === "number" ? `${v} billion` : v],
      ["die", "Die size", (v) => `${v} mm²`], ["gpus", "Configuration"], ["sm", "Streaming multiprocessors"], ["cu", "Compute units"],
      ["cuda", "CUDA cores", fmtInt], ["sp", "Stream processors", fmtInt], ["tensor", "Tensor Cores", fmtInt], ["rt", "RT cores", fmtInt],
      ["rta", "Ray accelerators", fmtInt], ["aia", "AI accelerators", fmtInt],
      ["xe", "Xe-cores"], ["gcores", "GPU cores (max)", fmtInt], ["shaders", "Shader ALUs", fmtInt], ["xmx", "XMX engines", fmtInt], ["rtu", "Ray-tracing units", fmtInt], ["rops", "ROPs", fmtInt],
      ["base", "Base clock", (v) => `${fmtInt(v)} MHz`], ["gclk", "Graphics clock", (v) => `${fmtInt(v)} MHz`], ["boost", "Boost clock", (v) => `${fmtInt(v)} MHz`],
      ["boostRange", "Boost clock range", (v) => `${v} MHz`], ["l2", "L2 / last-level cache", (v) => `${v} MB`], ["ic", "Infinity Cache", (v) => `${v} MB`], ["cpu", "CPU"]
    ]],
    ["Memory", [
      ["mem", "Capacity", (v) => typeof v === "number" ? (v >= 1000 ? `${(v / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} TB` : `${v} GB`) : v],
      ["memType", "Type"], ["bus", "Bus width", (v) => `${v}-bit`], ["speed", "Data rate", (v) => `${v} Gbps`], ["bw", "Bandwidth", fmtBw]
    ]],
    ["Performance", [
      ["fp32", "FP32 (shader)", (v) => `${v} TFLOPS`], ["ai", "AI TOPS (vendor figure)", fmtInt], ["ne", "Neural Engine"], ["fp4", "FP4"], ["fp8", "FP8"], ["fp16", "FP16 / BF16"], ["fp64", "FP64"]
    ]],
    ["Board & platform", [
      ["power", "Power", (v) => typeof v === "number" ? `${fmtInt(v)} W` : v], ["powerRange", "Power range"], ["connector", "Power connector"],
      ["pcie", "Host interface"], ["outputs", "Display outputs"], ["nvenc", "NVENC"], ["nvlink", "NVLink / interconnect"], ["net", "Networking"],
      ["mig", "Multi-Instance GPU"], ["form", "Form factor"], ["platform", "Platform"]
    ]]
  ];
  const LABEL = {};
  FIELDS.forEach(([, f]) => f.forEach(([k, l, fn]) => (LABEL[k] = { l, fn })));
  const fmtField = (k, v) => (LABEL[k] && LABEL[k].fn ? LABEL[k].fn(v) : v);
  function keyStats(g) {
    const s = g.specs, d = derived(g), out = [];
    const push = (k, v, u) => v != null && v !== "" && out.length < 4 && out.push({ k, v, u });
    if (s.cuda) push("CUDA cores", fmtInt(s.cuda));
    else if (s.sp) push("Stream processors", fmtInt(s.sp));
    else if (s.shaders) push("Shader ALUs", fmtInt(s.shaders));
    else if (s.gcores) push("GPU cores", fmtInt(s.gcores));
    if (s.mem != null) {
      if (typeof s.mem === "number") push("Memory", s.mem >= 1000 ? (s.mem / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) : s.mem, `${s.mem >= 1000 ? "TB" : "GB"} ${s.memType ? s.memType.split(" ")[0] : ""}`);
      else push("Memory", s.mem);
    }
    if (s.bw) { const t = fmtBw(s.bw).split(" "); push("Bandwidth", t[0], t[1]); }
    if (s.fp4) push("FP4", s.fp4.split(" · ")[0].replace(/ \(.*\)/, ""));
    if (s.ai && !s.fp4) push("AI TOPS", fmtInt(s.ai));
    if (typeof s.power === "number") push("Power", fmtInt(s.power), "W");
    else if (s.powerRange) push("Power", s.powerRange);
    else if (s.power) push("Power", s.power);
    if (d.fp32 || s.fp32) push("FP32", s.fp32 || d.fp32, "TFLOPS");
    if (s.cpu && out.length < 4) push("CPU", s.cpu);
    return out;
  }


    return { esc, fmtInt, MONTHS, fmtDate, dateKey, fmtMem, fmtBw, fmtPower, COUNTRY, SYM, money, priceIn, cores, coreLabel, isNum, cls, badge, PER_SM, derived, specVal, FIELDS, LABEL, fmtField, keyStats };
  }
  root.GPU_SHARED = { make };
  if (typeof module !== "undefined") module.exports = { make };
})(typeof window !== "undefined" ? window : globalThis);
