/* GPU Atlas — application */
(function () {
  "use strict";
  const D = window.GPU_ATLAS;
  const LIST = D.list;
  const BY_ID = Object.fromEntries(LIST.map((g) => [g.id, g]));
  const app = document.getElementById("app");

  // ---------- storage (optional, per-viewer) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem("gpuatlas:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("gpuatlas:" + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  // ---------- state ----------
  const state = {
    seg: store.get("seg", "desktop"),
    q: "",
    arch: "",
    status: "",
    sortKey: null,
    sortDir: -1,
    compare: store.get("compare", []).filter((id) => BY_ID[id])
  };

  // ---------- helpers ----------
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
  const fmtPrice = (g) => (g.msrp ? `$${fmtInt(g.msrp)}` : "—");
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
    if (g.seg === "desktop" && s.cuda && s.boost && s.fp32 == null) {
      out.fp32 = Math.round((s.cuda * 2 * s.boost) / 1e5) / 10;
    }
    return out;
  }
  const specVal = (g, k) => (g.specs[k] != null ? g.specs[k] : derived(g)[k]);

  // ---------- spec field definitions ----------
  const FIELDS = [
    ["GPU", [
      ["chip", "GPU / chip"], ["process", "Process"], ["transistors", "Transistors", (v) => typeof v === "number" ? `${v} billion` : v],
      ["die", "Die size", (v) => `${v} mm²`], ["gpus", "Configuration"], ["sm", "Streaming multiprocessors"],
      ["cuda", "CUDA cores", fmtInt], ["tensor", "Tensor Cores", fmtInt], ["rt", "RT cores", fmtInt], ["rops", "ROPs", fmtInt],
      ["base", "Base clock", (v) => `${fmtInt(v)} MHz`], ["boost", "Boost clock", (v) => `${fmtInt(v)} MHz`],
      ["boostRange", "Boost clock range", (v) => `${v} MHz`], ["l2", "L2 cache", (v) => `${v} MB`], ["cpu", "CPU"]
    ]],
    ["Memory", [
      ["mem", "Capacity", (v) => typeof v === "number" ? (v >= 1000 ? `${(v / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} TB` : `${v} GB`) : v],
      ["memType", "Type"], ["bus", "Bus width", (v) => `${v}-bit`], ["speed", "Data rate", (v) => `${v} Gbps`], ["bw", "Bandwidth", fmtBw]
    ]],
    ["Performance", [
      ["fp32", "FP32 (shader)", (v) => `${v} TFLOPS`], ["ai", "AI TOPS", fmtInt], ["fp4", "FP4"], ["fp8", "FP8"], ["fp16", "FP16 / BF16"], ["fp64", "FP64"]
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

  // ---------- table columns ----------
  const COL = {
    model: { h: "Model", sort: (g) => g.name, cell: (g) => `<a class="model-link" href="#${g.id}">${esc(g.name)}</a>${g.status === "rumored" || g.status === "roadmap" || g.status === "announced" ? " " + badge(g.status) : ""}<div class="sub">${esc(g.series)}</div>` },
    seg: { h: "Segment", sort: (g) => D.SEGMENTS[g.seg], cell: (g) => esc(D.SEGMENTS[g.seg]) },
    arch: { h: "Architecture", sort: (g) => g.arch, cell: (g) => `${esc(g.arch)}${g.specs.chip && g.specs.chip !== "—" ? `<div class="sub">${esc(g.specs.chip)}</div>` : ""}` },
    cuda: { h: "CUDA cores", n: 1, sort: (g) => g.specs.cuda || -1, cell: (g) => (g.specs.cuda ? fmtInt(g.specs.cuda) : "—") },
    mem: { h: "Memory", n: 1, sort: (g) => (typeof g.specs.mem === "number" ? g.specs.mem : -1), cell: (g) => `${fmtMem(g)}${typeof g.specs.mem === "number" && g.specs.memType ? `<div class="sub">${esc(g.specs.memType.split(" (")[0])}</div>` : ""}` },
    bw: { h: "Bandwidth", n: 1, sort: (g) => g.specs.bw || -1, cell: (g) => fmtBw(g.specs.bw) },
    power: { h: "Power", n: 1, w: 1, sort: (g) => (typeof g.specs.power === "number" ? g.specs.power : parseInt(String(g.specs.power || g.specs.powerRange || "").replace(/[^\d–-].*$/, "").split(/[–-]/).pop()) || -1), cell: (g) => fmtPower(g.specs) },
    ai: { h: "AI TOPS", n: 1, sort: (g) => g.specs.ai || -1, cell: (g) => (g.specs.ai ? fmtInt(g.specs.ai) : "—") },
    fp4: { h: "FP4", w: 1, sort: (g) => g.specs.fp4 || "", cell: (g) => esc(g.specs.fp4 ? g.specs.fp4.split(" · ")[0] : "—") },
    cpu: { h: "CPU", w: 1, sort: (g) => g.specs.cpu || "", cell: (g) => esc(g.specs.cpu || "—") },
    launch: { h: "Launch", n: 1, sort: (g) => dateKey(g.launch), cell: (g) => esc(fmtDate(g.launch)) },
    price: { h: "Launch price", n: 1, sort: (g) => g.msrp || -1, cell: (g) => fmtPrice(g) }
  };
  const SEG_COLS = {
    all: ["model", "seg", "arch", "mem", "bw", "power", "launch"],
    desktop: ["model", "arch", "cuda", "mem", "bw", "power", "ai", "launch", "price"],
    laptop: ["model", "arch", "cuda", "mem", "bw", "power", "ai", "launch"],
    pro: ["model", "arch", "cuda", "mem", "bw", "power", "launch"],
    datacenter: ["model", "arch", "mem", "bw", "fp4", "power", "launch"],
    systems: ["model", "arch", "cpu", "mem", "fp4", "launch", "price"],
    edge: ["model", "arch", "cpu", "mem", "power", "launch", "price"]
  };

  // ---------- views ----------
  function setTitle(t) { document.title = t ? `${t} — GPU Atlas` : "GPU Atlas — NVIDIA GPU reference"; }
  function setNav(name) {
    document.querySelectorAll(".nav a").forEach((a) => {
      if (a.dataset.route === name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  function viewDatabase() {
    setTitle(""); setNav("database");
    const counts = { all: LIST.length };
    Object.keys(D.SEGMENTS).forEach((k) => (counts[k] = LIST.filter((g) => g.seg === k).length));
    const archs = [...new Set(LIST.map((g) => g.arch))].sort();

    app.innerHTML = `
      <div class="page-head">
        <p class="eyebrow">Reference</p>
        <h1>NVIDIA GPU database</h1>
        <p class="lead">Specifications for every current and recent NVIDIA GPU and accelerator: GeForce desktop and laptop, RTX PRO workstation, data-center, AI PCs and edge modules. Each model has its own spec sheet with variants and sources.</p>
        <div class="meta"><span>${LIST.length} products and configurations</span><span>Updated ${esc(D.updated)}</span><a href="#methodology">How this data is compiled</a></div>
      </div>
      <div class="devs">
        <a class="dev" href="#rtx-spark-n1x"><time>16 Oct 2026</time><p><strong>RTX Spark laptops ship.</strong> NVIDIA's first CPU-and-GPU chip for Windows PCs.</p></a>
        <a class="dev" href="#vera-rubin-nvl72"><time>H2 2026</time><p><strong>Vera Rubin in production.</strong> 288 GB HBM4 at 22 TB/s per GPU.</p></a>
        <a class="dev" href="#rtx-pro-5500"><time>Sep 2026</time><p><strong>RTX PRO 5500 announced.</strong> 21,760 cores and 84 GB on a 416-bit bus.</p></a>
      </div>
      <div class="tabs" role="tablist">
        ${["desktop", "laptop", "pro", "datacenter", "systems", "edge", "all"].map((k) => `<button class="tab" role="tab" data-seg="${k}" aria-selected="${state.seg === k}">${k === "all" ? "All" : esc(D.SEGMENTS[k])}<span class="count">${counts[k]}</span></button>`).join("")}
      </div>
      <div class="toolbar">
        <input class="field search" type="search" id="q" placeholder="Search models, chips, series" value="${esc(state.q)}" aria-label="Search">
        <select class="field" id="arch" aria-label="Architecture"><option value="">All architectures</option>${archs.map((a) => `<option ${state.arch === a ? "selected" : ""}>${esc(a)}</option>`).join("")}</select>
        <select class="field" id="status" aria-label="Status"><option value="">Any status</option>${Object.entries(D.STATUS).map(([k, v]) => `<option value="${k}" ${state.status === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>
        <span class="spacer"></span>
        <span class="result-count" id="count"></span>
      </div>
      <div class="table-wrap"><table class="data" id="tbl"></table></div>
      <p class="sub" style="margin-top:12px">Launch prices are US launch MSRPs. Retail prices for RTX 50 cards rose sharply through 2026 because of the memory shortage. AI TOPS are NVIDIA's figures and are not comparable across generations.</p>
    `;

    app.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
      state.seg = b.dataset.seg; state.sortKey = null; store.set("seg", state.seg);
      app.querySelectorAll(".tab").forEach((x) => x.setAttribute("aria-selected", x === b));
      renderTable();
    }));
    app.querySelector("#q").addEventListener("input", (e) => { state.q = e.target.value; renderTable(); });
    app.querySelector("#arch").addEventListener("change", (e) => { state.arch = e.target.value; renderTable(); });
    app.querySelector("#status").addEventListener("change", (e) => { state.status = e.target.value; renderTable(); });
    renderTable();
  }

  function renderTable() {
    const cols = SEG_COLS[state.seg];
    const q = state.q.trim().toLowerCase();
    let rows = LIST.filter((g) =>
      (state.seg === "all" || g.seg === state.seg) &&
      (!state.arch || g.arch === state.arch) &&
      (!state.status || g.status === state.status) &&
      (!q || [g.name, g.series, g.arch, g.specs.chip, g.id, (g.variants || []).map((v) => v.name).join(" ")].join(" ").toLowerCase().includes(q))
    );
    if (state.sortKey) {
      const f = COL[state.sortKey].sort;
      rows = rows.slice().sort((a, b) => {
        const x = f(a), y = f(b);
        return (typeof x === "string" ? x.localeCompare(y) : x - y) * state.sortDir;
      });
    } else {
      // Default: curated order (newest series first, flagship first within a series)
    }
    const tbl = document.getElementById("tbl");
    tbl.innerHTML = `
      <thead><tr>${cols.map((c) => {
        const sorted = state.sortKey === c;
        return `<th class="${COL[c].n ? "n" : ""}" ${sorted ? `aria-sort="${state.sortDir > 0 ? "ascending" : "descending"}"` : ""}><button data-sort="${c}">${esc(COL[c].h)}${sorted ? (state.sortDir > 0 ? " ↑" : " ↓") : ""}</button></th>`;
      }).join("")}</tr></thead>
      <tbody>${rows.length ? rows.map((g) => `<tr data-id="${g.id}">${cols.map((c) => `<td class="${COL[c].n ? "n" : ""} ${COL[c].w ? "w" : ""}">${COL[c].cell(g)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${cols.length}" class="empty">No products match these filters.</td></tr>`}</tbody>`;
    document.getElementById("count").textContent = `${rows.length} ${rows.length === 1 ? "result" : "results"}`;
    tbl.querySelectorAll("th button").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.sort;
      if (state.sortKey === k) state.sortDir *= -1; else { state.sortKey = k; state.sortDir = COL[k].n ? -1 : 1; }
      renderTable();
    }));
    tbl.querySelectorAll("tbody tr[data-id]").forEach((tr) => tr.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      location.hash = tr.dataset.id;
    }));
  }

  function keyStats(g) {
    const s = g.specs, d = derived(g), out = [];
    const push = (k, v, u) => v != null && v !== "" && out.length < 4 && out.push({ k, v, u });
    if (s.cuda) push("CUDA cores", fmtInt(s.cuda));
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

  function viewDetail(g) {
    setTitle(g.name); setNav("database");
    const s = g.specs, d = derived(g);
    const siblings = LIST.filter((x) => x.seg === g.seg && x.series === g.series);
    const segList = LIST.filter((x) => x.seg === g.seg);
    const i = segList.indexOf(g);
    const prev = segList[i - 1], next = segList[i + 1];
    const inCmp = state.compare.includes(g.id);

    const overview = [
      ["Segment", D.SEGMENTS[g.seg]], ["Series", g.series], ["Architecture", g.arch],
      ["Status", D.STATUS[g.status]], ["Launch", fmtDate(g.launch)],
      ["Launch price", (g.msrp ? `$${fmtInt(g.msrp)}` : "—") + (g.priceNote ? `<span class="note">${esc(g.priceNote)}</span>` : "")]
    ];

    const groups = FIELDS.map(([title, fields]) => {
      const rows = fields.filter(([k]) => specVal(g, k) != null && specVal(g, k) !== "").map(([k, l]) => {
        const v = specVal(g, k);
        const calc = s[k] == null && d[k] != null;
        return `<dt>${esc(l)}</dt><dd class="${cls(fmtField(k, v))}">${esc(fmtField(k, v))}${calc ? `<span class="note">${k === "fp32" ? "calculated from cores × boost clock" : "derived from SM count"}</span>` : ""}</dd>`;
      }).join("");
      return rows ? `<section class="spec-group"><h3>${esc(title)}</h3><dl class="specs">${rows}</dl></section>` : "";
    }).join("");

    const sources = (g.sources || []).map((k) => D.SOURCES[k]).filter(Boolean);

    app.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#database">Database</a> / <a href="#database" data-seg="${g.seg}">${esc(D.SEGMENTS[g.seg])}</a> / ${esc(g.series)}</nav>
      <div class="detail-head">
        <div>
          <p class="eyebrow">${esc(D.SEGMENTS[g.seg])} · ${esc(g.arch)}</p>
          <h1>${esc(g.name)}</h1>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${badge(g.status)}<span class="sub">${esc(fmtDate(g.launch))}${g.msrp ? ` · $${fmtInt(g.msrp)} at launch` : ""}</span></div>
        </div>
        <div class="actions">
          <button class="btn ${inCmp ? "" : "primary"}" id="cmpBtn" ${!inCmp && state.compare.length >= 4 ? "disabled" : ""}>${inCmp ? "Remove from compare" : "Add to compare"}</button>
        </div>
      </div>
      ${g.summary ? `<p class="lead" style="margin-top:18px">${esc(g.summary)}</p>` : ""}
      ${g.status === "rumored" ? `<div class="callout">NVIDIA has not announced this product. Details come from press reports and leaks and may be wrong.</div>` : ""}
      ${g.status === "roadmap" ? `<div class="callout">Roadmap item. Specifications are preliminary and may change before release.</div>` : ""}
      ${keyStats(g).length ? `<div class="keystats">${keyStats(g).map((x) => `<div class="keystat"><div class="k">${esc(x.k)}</div><div class="v">${esc(x.v)}${x.u ? `<small>${esc(x.u)}</small>` : ""}</div></div>`).join("")}</div>` : ""}
      <div class="detail-grid">
        <div>
          <section class="spec-group"><h3>Overview</h3><dl class="specs">${overview.map(([k, v]) => `<dt>${esc(k)}</dt><dd class="${["Launch", "Launch price"].includes(k) ? "num" : "txt"}">${k === "Launch price" ? v : esc(v)}</dd>`).join("")}</dl></section>
          ${groups}
          ${g.variants && g.variants.length ? `<section class="spec-group"><h3>Variants &amp; versions</h3>${g.variants.map((v) => `<div class="variant"><b>${esc(v.name)}</b><span>${esc(v.diff)}</span></div>`).join("")}</section>` : ""}
        </div>
        <aside>
          ${siblings.length > 1 ? `<div class="panel"><h3>${esc(g.series)} family</h3><ul>${siblings.map((x) => `<li class="${x === g ? "here" : ""}">${x === g ? esc(x.name) : `<a href="#${x.id}">${esc(x.name)}</a>`}</li>`).join("")}</ul></div>` : ""}
          <div class="panel"><h3>Sources</h3><ul>${sources.length ? sources.map((src) => `<li class="src">${src.u ? `<a href="${esc(src.u)}" target="_blank" rel="noopener">${esc(src.t)}</a>` : esc(src.t)}</li>`).join("") : "<li class='src'>NVIDIA launch specifications</li>"}</ul></div>
        </aside>
      </div>
      <nav class="pager">
        <span>${prev ? `<a href="#${prev.id}"><span class="dir">Previous</span>${esc(prev.name)}</a>` : ""}</span>
        <span style="text-align:right">${next ? `<a href="#${next.id}"><span class="dir">Next</span>${esc(next.name)}</a>` : ""}</span>
      </nav>`;

    app.querySelector(".crumbs a[data-seg]").addEventListener("click", () => { state.seg = g.seg; store.set("seg", g.seg); });
    app.querySelector("#cmpBtn").addEventListener("click", () => { toggleCompare(g.id); viewDetail(g); });
    window.scrollTo(0, 0);
  }

  function toggleCompare(id) {
    const i = state.compare.indexOf(id);
    if (i >= 0) state.compare.splice(i, 1); else if (state.compare.length < 4) state.compare.push(id);
    store.set("compare", state.compare);
    renderTray();
  }

  function renderTray() {
    const t = document.getElementById("tray");
    const onCompare = (location.hash || "").replace("#", "") === "compare";
    if (!state.compare.length || onCompare) { t.hidden = true; return; }
    t.hidden = false;
    t.innerHTML = `<span>${state.compare.length} selected for comparison</span><a href="#compare">Compare</a><button id="trayClear">Clear</button>`;
    t.querySelector("#trayClear").addEventListener("click", () => { state.compare = []; store.set("compare", []); renderTray(); route(); });
  }

  const HIGHER_BETTER = new Set(["cuda", "tensor", "rt", "rops", "boost", "l2", "mem", "bw", "ai", "fp32", "sm"]);

  function viewCompare() {
    setTitle("Compare"); setNav("compare");
    const picks = state.compare.map((id) => BY_ID[id]).filter(Boolean);
    const opts = Object.entries(D.SEGMENTS).map(([k, label]) => `<optgroup label="${esc(label)}">${LIST.filter((g) => g.seg === k && !state.compare.includes(g.id)).map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join("")}</optgroup>`).join("");

    let table = `<div class="empty table-wrap">Choose two to four products to compare. You can also add products from any spec sheet.</div>`;
    if (picks.length) {
      const head = `<thead><tr><th></th>${picks.map((g) => `<th><a class="model-link" href="#${g.id}">${esc(g.name)}</a><div class="sub">${esc(D.SEGMENTS[g.seg])}</div></th>`).join("")}</tr></thead>`;
      let body = `<tr class="group"><th colspan="${picks.length + 1}">Overview</th></tr>`;
      body += [["Architecture", (g) => g.arch], ["Status", (g) => D.STATUS[g.status]], ["Launch", (g) => fmtDate(g.launch)], ["Launch price", (g) => fmtPrice(g)]]
        .map(([l, f]) => `<tr><th>${esc(l)}</th>${picks.map((g) => `<td class="${cls(f(g))}">${f(g)}</td>`).join("")}</tr>`).join("");
      FIELDS.forEach(([title, fields]) => {
        const rows = fields.filter(([k]) => picks.some((g) => specVal(g, k) != null));
        if (!rows.length) return;
        body += `<tr class="group"><th colspan="${picks.length + 1}">${esc(title)}</th></tr>`;
        rows.forEach(([k, l]) => {
          const vals = picks.map((g) => specVal(g, k));
          let best = null;
          if (HIGHER_BETTER.has(k) && picks.length > 1) {
            const nums = vals.filter((v) => typeof v === "number");
            if (nums.length > 1) best = Math.max(...nums);
          }
          body += `<tr><th>${esc(l)}</th>${vals.map((v) => `<td class="${v == null ? "" : cls(fmtField(k, v))} ${best != null && v === best ? "best" : ""}">${v == null ? '<span class="dim">—</span>' : esc(fmtField(k, v))}</td>`).join("")}</tr>`;
        });
      });
      table = `<div class="table-wrap"><table class="cmp">${head}<tbody>${body}</tbody></table></div><p class="sub" style="margin-top:10px">Highlighted values are the highest in each row. Core counts and AI TOPS are only directly comparable within the same architecture.</p>`;
    }

    app.innerHTML = `
      <div class="page-head"><p class="eyebrow">Tool</p><h1>Compare</h1><p class="lead">Line up to four products side by side, across any segment.</p></div>
      <div class="compare-pick">
        <select class="field" id="addSel" ${picks.length >= 4 ? "disabled" : ""}><option value="">${picks.length >= 4 ? "Maximum of four products" : "Add a product…"}</option>${opts}</select>
        ${picks.length ? `<button class="btn" id="clearAll">Clear all</button>` : ""}
      </div>
      ${picks.length ? `<div class="chips">${picks.map((g) => `<span class="chip">${esc(g.name)}<button aria-label="Remove ${esc(g.name)}" data-rm="${g.id}">×</button></span>`).join("")}</div>` : ""}
      ${table}`;
    const sel = app.querySelector("#addSel");
    sel.addEventListener("change", () => { if (sel.value) { toggleCompare(sel.value); viewCompare(); } });
    app.querySelectorAll("[data-rm]").forEach((b) => b.addEventListener("click", () => { toggleCompare(b.dataset.rm); viewCompare(); }));
    const c = app.querySelector("#clearAll");
    if (c) c.addEventListener("click", () => { state.compare = []; store.set("compare", []); viewCompare(); });
  }

  function viewArchitectures() {
    setTitle("Architectures"); setNav("architectures");
    app.innerHTML = `
      <div class="page-head"><p class="eyebrow">Background</p><h1>Architectures</h1><p class="lead">Each NVIDIA generation is named after a scientist. One architecture usually spans gaming, workstation and data-center products, though since 2022 data-center and consumer designs have sometimes diverged.</p></div>
      <div class="table-wrap"><table class="data cols-table"><thead><tr><th>Architecture</th><th>Year</th><th>Process</th><th>Named after</th><th>Key changes</th><th>Products</th><th class="n">In database</th></tr></thead>
      <tbody>${D.ARCHS.slice().reverse().map((a) => {
        const n = LIST.filter((g) => g.arch === a.name || (a.name === "Blackwell" && g.arch === "Grace Blackwell") || (a.name === "Blackwell" && g.arch === "Blackwell Ultra")).length;
        return `<tr style="cursor:default"><td><b>${esc(a.name)}</b></td><td class="mono">${esc(a.year)}</td><td>${esc(a.process)}</td><td>${esc(a.namesake)}</td><td style="white-space:normal;min-width:260px">${esc(a.key)}</td><td style="white-space:normal;min-width:220px" class="dim">${esc(a.products)}</td><td class="n">${n}</td></tr>`;
      }).join("")}</tbody></table></div>`;
  }

  function viewGlossary() {
    setTitle("Glossary"); setNav("glossary");
    app.innerHTML = `
      <div class="page-head"><p class="eyebrow">Background</p><h1>Glossary</h1><p class="lead">The terms used on spec sheets, and what they do and don't tell you.</p></div>
      <div class="prose"><dl class="specs" style="grid-template-columns:minmax(180px,30%) 1fr">${D.GLOSSARY.map(([k, v]) => `<dt><b>${esc(k)}</b></dt><dd style="font-family:var(--sans);font-size:14px;color:var(--text-2)">${esc(v)}</dd>`).join("")}</dl></div>`;
  }

  function viewMethodology() {
    setTitle("Methodology & sources"); setNav("methodology");
    const all = Object.entries(D.SOURCES).filter(([, s]) => s.u);
    app.innerHTML = `
      <div class="page-head"><p class="eyebrow">About</p><h1>Methodology &amp; sources</h1></div>
      <div class="prose">
        <p>GPU Atlas is an independent reference. It is not affiliated with or endorsed by NVIDIA. NVIDIA, GeForce, RTX, CUDA, DGX, Jetson and related names are trademarks of NVIDIA Corporation.</p>
        <h2>What the numbers mean</h2>
        <ul>
          <li><b>Specifications</b> are NVIDIA's reference values at launch. Partner (AIB) cards often ship with higher clocks and power limits.</li>
          <li><b>Launch price</b> is the US MSRP at launch. Retail prices for RTX 50 cards rose sharply in 2026 because of the global memory shortage: Newegg medians rose as much as 39% between June and August 2026, and some RTX 5090 listings passed $5,000.</li>
          <li><b>Calculated values</b> are labelled on each spec sheet. FP32 TFLOPS for GeForce desktop cards is CUDA cores × 2 × boost clock. Tensor and RT core counts for GeForce and RTX PRO are derived from the SM count where NVIDIA did not list them.</li>
          <li><b>AI TOPS</b> use different precisions by generation (FP4 with sparsity for RTX 50, FP8 with sparsity for RTX 40). They are not comparable across generations.</li>
          <li><b>Status:</b> <i>Current</i> is on sale now; <i>Announced</i> is announced but not yet broadly available; <i>Roadmap</i> is disclosed by NVIDIA for a future year; <i>Unconfirmed</i> is reported in the press but not announced by NVIDIA.</li>
          <li>Values that NVIDIA has not published are left blank rather than estimated.</li>
        </ul>
        <h2>Corrections</h2>
        <p>Spec errors happen. Each spec sheet lists the sources used for that product; where a source and this page disagree, the source is authoritative.</p>
        <h2>Sources</h2>
        <ul>${all.map(([, s]) => `<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join("")}</ul>
        <p class="sub">Specifications for products launched between 2016 and 2024 are compiled from NVIDIA's launch specifications.</p>
      </div>`;
  }

  // ---------- router ----------
  function route() {
    const h = decodeURIComponent((location.hash || "").slice(1));
    if (!h || h === "database") viewDatabase();
    else if (h === "compare") viewCompare();
    else if (h === "architectures") viewArchitectures();
    else if (h === "glossary") viewGlossary();
    else if (h === "methodology") viewMethodology();
    else if (BY_ID[h]) viewDetail(BY_ID[h]);
    else viewDatabase();
    renderTray();
  }
  window.addEventListener("hashchange", () => { route(); if (!BY_ID[(location.hash || "").slice(1)]) window.scrollTo(0, 0); });

  // ---------- theme ----------
  const themeBtn = document.getElementById("themeBtn");
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    themeBtn.textContent = t === "dark" ? "Light" : "Dark";
    themeBtn.setAttribute("aria-label", `Switch to ${t === "dark" ? "light" : "dark"} theme`);
  }
  let theme = store.get("theme", null);
  if (!theme) { try { theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } catch (e) { theme = "light"; } }
  applyTheme(theme);
  themeBtn.addEventListener("click", () => { theme = theme === "dark" ? "light" : "dark"; store.set("theme", theme); applyTheme(theme); });

  document.getElementById("year").textContent = D.updated;
  route();
})();
