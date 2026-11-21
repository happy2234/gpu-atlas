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
    brand: store.get("brand", ""),
    country: store.get("country", "US"),
    maxPrice: "",
    minMem: "",
    q: "",
    arch: "",
    status: "",
    sortKey: null,
    sortDir: -1,
    compare: store.get("compare", []).filter((id) => BY_ID[id])
  };

  // ---------- helpers ----------
  const S = window.GPU_SHARED.make(D);
  const SUF = window.GPU_ATLAS_LINK_SUFFIX || "";
  const page = (id) => `gpu/${id}/${SUF}`;
  const { esc, fmtInt, MONTHS, fmtDate, dateKey, fmtMem, fmtBw, fmtPower, COUNTRY, SYM, money, priceIn, cores, coreLabel, isNum, cls, badge, PER_SM, derived, specVal, FIELDS, LABEL, fmtField, keyStats } = S;
  const fmtPrice = (g, code) => { const v = priceIn(g, code || state.country); return v == null ? "—" : money(v, code || state.country); };

  // ---------- table columns ----------
  const COL = {
    model: { h: "Model", sort: (g) => g.name, cell: (g) => `<a class="model-link" href="${page(g.id)}">${esc(g.name)}</a>${g.status === "rumored" || g.status === "roadmap" || g.status === "announced" ? " " + badge(g.status) : ""}<div class="sub"><span class="brand-tag ${g.brand.toLowerCase()}">${esc(g.brand)}</span> ${esc(g.series)}</div>` },
    seg: { h: "Segment", sort: (g) => D.SEGMENTS[g.seg], cell: (g) => esc(D.SEGMENTS[g.seg]) },
    arch: { h: "Architecture", sort: (g) => g.arch, cell: (g) => `${esc(g.arch)}${g.specs.chip && g.specs.chip !== "—" ? `<div class="sub">${esc(g.specs.chip)}</div>` : ""}` },
    cuda: { h: "Shader cores", n: 1, sort: (g) => cores(g) || -1, cell: (g) => (cores(g) ? `${fmtInt(cores(g))}<div class="sub">${coreLabel(g)}</div>` : "—") },
    mem: { h: "Memory", n: 1, sort: (g) => (typeof g.specs.mem === "number" ? g.specs.mem : -1), cell: (g) => `${fmtMem(g)}${typeof g.specs.mem === "number" && g.specs.memType ? `<div class="sub">${esc(g.specs.memType.split(" (")[0])}</div>` : ""}` },
    bw: { h: "Bandwidth", n: 1, sort: (g) => g.specs.bw || -1, cell: (g) => fmtBw(g.specs.bw) },
    power: { h: "Power", n: 1, w: 1, sort: (g) => (typeof g.specs.power === "number" ? g.specs.power : parseInt(String(g.specs.power || g.specs.powerRange || "").replace(/[^\d–-].*$/, "").split(/[–-]/).pop()) || -1), cell: (g) => fmtPower(g.specs) },
    ai: { h: "AI TOPS", n: 1, sort: (g) => g.specs.ai || -1, cell: (g) => (g.specs.ai ? fmtInt(g.specs.ai) : "—") },
    fp4: { h: "FP4", w: 1, sort: (g) => g.specs.fp4 || "", cell: (g) => esc(g.specs.fp4 ? g.specs.fp4.split(" · ")[0] : "—") },
    cpu: { h: "CPU", w: 1, sort: (g) => g.specs.cpu || "", cell: (g) => esc(g.specs.cpu || "—") },
    launch: { h: "Launch", n: 1, sort: (g) => dateKey(g.launch), cell: (g) => esc(fmtDate(g.launch)) },
    price: { h: "Launch price", n: 1, sort: (g) => priceIn(g, state.country) || -1, cell: (g) => fmtPrice(g) }
  };
  const SEG_COLS = {
    all: ["model", "seg", "arch", "mem", "bw", "power", "launch", "price"],
    desktop: ["model", "arch", "cuda", "mem", "bw", "power", "ai", "launch", "price"],
    laptop: ["model", "arch", "cuda", "mem", "bw", "power", "launch"],
    pro: ["model", "arch", "cuda", "mem", "bw", "power", "launch", "price"],
    datacenter: ["model", "arch", "mem", "bw", "fp4", "power", "launch"],
    systems: ["model", "arch", "cpu", "mem", "fp4", "launch", "price"],
    edge: ["model", "arch", "cpu", "mem", "power", "launch", "price"]
  };

  // ---------- views ----------
  function setTitle(t) { document.title = t ? `${t} — GPU Atlas` : "GPU Atlas — NVIDIA, AMD, Intel & Apple GPU reference"; }
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
        <h1>GPU database</h1>
        <p class="lead">Specifications for current and recent NVIDIA, AMD, Intel and Apple GPUs and accelerators: desktop and laptop graphics, workstation cards, data-center accelerators, AI PCs and edge modules. Each model has its own spec sheet with variants, launch prices by country and sources.</p>
        <div class="meta"><span>${LIST.length} products and configurations</span><span>Updated ${esc(D.updated)}</span><a href="#methodology">How this data is compiled</a></div>
      </div>
      <div class="devs">
        <a class="dev" href="${page("rtx-spark-n1x")}"><time>16 Oct 2026</time><p><strong>RTX Spark laptops ship.</strong> NVIDIA's first CPU-and-GPU chip for Windows PCs.</p></a>
        <a class="dev" href="${page("vera-rubin-nvl72")}"><time>H2 2026</time><p><strong>Vera Rubin in production.</strong> 288 GB HBM4 at 22 TB/s per GPU.</p></a>
        <a class="dev" href="${page("mi450x")}"><time>12 Nov 2026</time><p><strong>AMD Instinct MI450X announced.</strong> A 288 GB HBM4 option for Helios racks.</p></a>
      </div>
      <div class="tabs" role="tablist">
        ${["desktop", "laptop", "pro", "datacenter", "systems", "edge", "all"].map((k) => `<button class="tab" role="tab" data-seg="${k}" aria-selected="${state.seg === k}">${k === "all" ? "All" : esc(D.SEGMENTS[k])}<span class="count">${counts[k]}</span></button>`).join("")}
      </div>
      <div class="toolbar">
        <input class="field search" type="search" id="q" placeholder="Search models, chips, series" value="${esc(state.q)}" aria-label="Search">
        <div class="seg-ctl" role="group" aria-label="Brand">${["", "NVIDIA", "AMD", "Intel", "Apple"].map((b) => `<button class="seg-btn" data-brand="${b}" aria-pressed="${state.brand === b}">${b || "All brands"}</button>`).join("")}</div>
        <select class="field" id="arch" aria-label="Architecture"><option value="">All architectures</option>${archs.map((a) => `<option ${state.arch === a ? "selected" : ""}>${esc(a)}</option>`).join("")}</select>
        <select class="field" id="status" aria-label="Status"><option value="">Any status</option>${Object.entries(D.STATUS).map(([k, v]) => `<option value="${k}" ${state.status === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>
        <label class="budget"><span>Max launch price</span><span class="cur">${esc(SYM[COUNTRY(state.country).cur])}</span><input class="field" id="maxPrice" type="number" min="0" inputmode="numeric" placeholder="Any" value="${esc(state.maxPrice)}"></label>
        <select class="field" id="minMem" aria-label="Minimum memory"><option value="">Any memory</option>${[8, 12, 16, 24, 32, 48, 96].map((m) => `<option value="${m}" ${String(state.minMem) === String(m) ? "selected" : ""}>${m} GB or more</option>`).join("")}</select>
        <span class="spacer"></span>
        <span class="result-count" id="count"></span>
      </div>
      <div class="table-wrap"><table class="data" id="tbl"></table></div>
      <p class="sub" style="margin-top:12px">Launch prices are the official prices NVIDIA, AMD or Intel published (Apple does not sell its GPUs separately, so Apple chips have none) for the selected country (change it at the top of the page). A dash means no official price was published there, and the price filter only includes products with a price for that country. Each spec sheet also shows a dated street-price snapshot where one is available. Retail prices rose sharply through 2026 because of the memory shortage. AI TOPS are vendor figures and are not comparable across brands or generations.</p>
    `;

    app.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
      state.seg = b.dataset.seg; state.sortKey = null; store.set("seg", state.seg);
      app.querySelectorAll(".tab").forEach((x) => x.setAttribute("aria-selected", x === b));
      renderTable();
    }));
    app.querySelectorAll(".seg-btn").forEach((b) => b.addEventListener("click", () => {
      state.brand = b.dataset.brand; store.set("brand", state.brand);
      app.querySelectorAll(".seg-btn").forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderTable();
    }));
    app.querySelector("#q").addEventListener("input", (e) => { state.q = e.target.value; renderTable(); });
    app.querySelector("#arch").addEventListener("change", (e) => { state.arch = e.target.value; renderTable(); });
    app.querySelector("#status").addEventListener("change", (e) => { state.status = e.target.value; renderTable(); });
    app.querySelector("#maxPrice").addEventListener("input", (e) => { state.maxPrice = e.target.value; renderTable(); });
    app.querySelector("#minMem").addEventListener("change", (e) => { state.minMem = e.target.value; renderTable(); });
    renderTable();
  }

  function renderTable() {
    const cols = SEG_COLS[state.seg];
    const q = state.q.trim().toLowerCase();
    let rows = LIST.filter((g) =>
      (state.seg === "all" || g.seg === state.seg) &&
      (!state.brand || g.brand === state.brand) &&
      (!state.maxPrice || (priceIn(g, state.country) != null && priceIn(g, state.country) <= Number(state.maxPrice))) &&
      (!state.minMem || (typeof g.specs.mem === "number" && g.specs.mem >= Number(state.minMem))) &&
      (!state.arch || g.arch === state.arch) &&
      (!state.status || g.status === state.status) &&
      (!q || [g.name, g.brand, g.series, g.arch, g.specs.chip, g.id, (g.variants || []).map((v) => v.name).join(" ")].join(" ").toLowerCase().includes(q))
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
        return `<th class="${COL[c].n ? "n" : ""}" ${sorted ? `aria-sort="${state.sortDir > 0 ? "ascending" : "descending"}"` : ""}><button data-sort="${c}">${esc(c === "price" ? `Launch price (${COUNTRY(state.country).cur})` : COL[c].h)}${sorted ? (state.sortDir > 0 ? " ↑" : " ↓") : ""}</button></th>`;
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
      location.href = page(tr.dataset.id);
    }));
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
      ["Brand", g.brand],
      ["Launch price (US)", (g.msrp ? money(g.msrp, "US") : "—") + (g.priceNote ? `<span class="note">${esc(g.priceNote)}</span>` : "")]
    ];
    const anyRegional = g.prices && Object.keys(g.prices).length;
    const regional = anyRegional ? `<section class="spec-group"><h3>Launch price by country</h3><dl class="specs">${D.COUNTRIES.map((c) => {
      const v = priceIn(g, c.code);
      return `<dt>${c.code === state.country ? `<b>${esc(c.name)}</b>` : esc(c.name)}</dt><dd class="${v == null ? "txt dim" : "num"}">${v == null ? "Not published" : esc(money(v, c.code))}</dd>`;
    }).join("")}</dl>${g.regionNote ? `<p class="sub" style="margin-top:8px">${esc(g.regionNote)}</p>` : ""}</section>` : "";

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
          <p class="eyebrow">${esc(g.brand)} · ${esc(D.SEGMENTS[g.seg])} · ${esc(g.arch)}</p>
          <h1>${esc(g.name)}</h1>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${badge(g.status)}<span class="sub">${esc(fmtDate(g.launch))}${priceIn(g, state.country) != null ? ` · ${esc(fmtPrice(g))} at launch (${esc(COUNTRY(state.country).name)})` : g.msrp ? ` · ${esc(money(g.msrp, "US"))} at launch (US)` : ""}</span></div>
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
          <section class="spec-group"><h3>Overview</h3><dl class="specs">${overview.map(([k, v]) => `<dt>${esc(k)}</dt><dd class="${["Launch", "Launch price (US)"].includes(k) ? "num" : "txt"}">${k === "Launch price (US)" ? v : esc(v)}</dd>`).join("")}</dl></section>
          ${regional}
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

  const HIGHER_BETTER = new Set(["cuda", "sp", "shaders", "xe", "xmx", "cu", "tensor", "rt", "rops", "boost", "l2", "ic", "mem", "bw", "ai", "fp32", "sm"]);

  function viewCompare() {
    setTitle("Compare"); setNav("compare");
    const picks = state.compare.map((id) => BY_ID[id]).filter(Boolean);
    const opts = Object.entries(D.SEGMENTS).map(([k, label]) => `<optgroup label="${esc(label)}">${LIST.filter((g) => g.seg === k && !state.compare.includes(g.id)).map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join("")}</optgroup>`).join("");

    let table = `<div class="empty table-wrap">Choose two to four products to compare. You can also add products from any spec sheet.</div>`;
    if (picks.length) {
      const head = `<thead><tr><th></th>${picks.map((g) => `<th><a class="model-link" href="${page(g.id)}">${esc(g.name)}</a><div class="sub">${esc(D.SEGMENTS[g.seg])}</div></th>`).join("")}</tr></thead>`;
      let body = `<tr class="group"><th colspan="${picks.length + 1}">Overview</th></tr>`;
      body += [["Brand", (g) => g.brand], ["Architecture", (g) => g.arch], ["Status", (g) => D.STATUS[g.status]], ["Launch", (g) => fmtDate(g.launch)], [`Launch price (${COUNTRY(state.country).name})`, (g) => fmtPrice(g)]]
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
      table = `<div class="table-wrap"><table class="cmp">${head}<tbody>${body}</tbody></table></div><p class="sub" style="margin-top:10px">Highlighted values are the highest in each row. Core counts and AI TOPS are only directly comparable within the same brand and architecture: NVIDIA CUDA cores, AMD stream processors and Intel shader ALUs are not equivalent.</p>`;
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
      <div class="page-head"><p class="eyebrow">Background</p><h1>Architectures</h1><p class="lead">NVIDIA names each generation after a scientist and uses one family for gaming, workstation and data-center products. AMD splits its designs: RDNA for graphics and CDNA for data-center compute. Intel's Arc cards use its Xe architectures.</p></div>
      <div class="table-wrap"><table class="data cols-table"><thead><tr><th>Architecture</th><th>Brand</th><th>Year</th><th>Process</th><th>Named after</th><th>Key changes</th><th>Products</th><th class="n">In database</th></tr></thead>
      <tbody>${D.ARCHS.slice().sort((x, y) => parseInt(y.year) - parseInt(x.year)).map((a) => {
        const n = LIST.filter((g) => g.arch === a.name || (a.name === "Blackwell" && g.arch === "Grace Blackwell") || (a.name === "Blackwell" && g.arch === "Blackwell Ultra")).length;
        return `<tr style="cursor:default"><td><b>${esc(a.name)}</b></td><td><span class="brand-tag ${a.brand.toLowerCase()}">${esc(a.brand)}</span></td><td class="mono">${esc(a.year)}</td><td>${esc(a.process)}</td><td>${esc(a.namesake)}</td><td style="white-space:normal;min-width:260px">${esc(a.key)}</td><td style="white-space:normal;min-width:220px" class="dim">${esc(a.products)}</td><td class="n">${n}</td></tr>`;
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
        <p>GPU Atlas is an independent reference. It is not affiliated with or endorsed by NVIDIA, AMD, Intel or Apple. NVIDIA, GeForce, RTX, CUDA, DGX and Jetson are trademarks of NVIDIA Corporation. AMD, Radeon, Ryzen, Instinct, RDNA and CDNA are trademarks of Advanced Micro Devices, Inc. Intel and Arc are trademarks of Intel Corporation. Apple, Apple silicon and Mac are trademarks of Apple Inc.</p>
        <h2>What the numbers mean</h2>
        <ul>
          <li><b>Specifications</b> are NVIDIA's reference values at launch. Partner (AIB) cards often ship with higher clocks and power limits.</li>
          <li><b>Launch prices by country</b> are the official prices NVIDIA or AMD announced for that market at launch, in local currency and usually including local sales tax. Where no official price was published, the site shows a dash rather than a currency conversion. Regional prices are currently collected for the latest generation; older products show the US price only.</li>
          <li><b>Street prices</b> are dated snapshots of the lowest new-card price reported by a named tracker or publication. They are not live and are not updated automatically; each one shows its date and source.</li>
          <li><b>Last checked</b> on each spec sheet is the date its core specifications were compared with an official vendor page or a sourced spec table. Products marked "not yet re-checked" still rely on launch specifications compiled earlier.</li>
          <li><b>US launch price</b> is the US MSRP at launch, before sales tax. Retail prices for RTX 50 cards rose sharply in 2026 because of the global memory shortage: Newegg medians rose as much as 39% between June and August 2026, and some RTX 5090 listings passed $5,000.</li>
          <li><b>Calculated values</b> are labelled on each spec sheet. FP32 TFLOPS for GeForce desktop cards is CUDA cores × 2 × boost clock. Tensor and RT core counts for GeForce and RTX PRO are derived from the SM count where NVIDIA did not list them.</li>
          <li><b>AI TOPS</b> use different precisions by generation (FP4 with sparsity for RTX 50, FP8 with sparsity for RTX 40). They are not comparable across generations.</li>
          <li><b>Status:</b> <i>Current</i> is on sale now; <i>Announced</i> is announced but not yet broadly available; <i>Roadmap</i> is disclosed by NVIDIA for a future year; <i>Unconfirmed</i> is reported in the press but not announced by NVIDIA.</li>
          <li>Values that NVIDIA has not published are left blank rather than estimated.</li>
        </ul>
        <h2>Corrections</h2>
        <p>Spec errors happen. Each spec sheet lists the sources used for that product; where a source and this page disagree, the source is authoritative. Use the "Report an error" link on any spec sheet to open an issue on <a href="${esc(D.REPO)}/issues" target="_blank" rel="noopener">GitHub</a>.</p>
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
    else if (BY_ID[h]) { location.replace(page(h)); return; }
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

  const csel = document.getElementById("country");
  csel.innerHTML = D.COUNTRIES.map((c) => `<option value="${c.code}" ${c.code === state.country ? "selected" : ""}>${c.cur} · ${esc(c.name)}</option>`).join("");
  csel.addEventListener("change", () => { state.country = csel.value; store.set("country", state.country); route(); });
  document.getElementById("year").textContent = D.updated;
  route();
})();
