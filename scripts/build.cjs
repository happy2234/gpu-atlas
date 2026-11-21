#!/usr/bin/env node
/* GPU Atlas static build.
 * Generates one HTML page per product, guide pages, social preview images, sitemap.xml and robots.txt into dist/.
 *
 *   node scripts/build.cjs
 *
 * Environment:
 *   SITE_URL      Absolute site URL used for canonical links and the sitemap (default: GitHub Pages URL)
 *   LINK_SUFFIX   Appended to internal directory links, e.g. "index.html" for hosts without directory indexes
 *   BUILD_DATE    YYYY-MM-DD used for sitemap lastmod (default: today)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const OUT = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : path.join(ROOT, "dist");
const SITE = (process.env.SITE_URL || "https://happy2234.github.io/gpu-atlas").replace(/\/$/, "");
const SUF = process.env.LINK_SUFFIX || "";
const BUILD_DATE = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

// ---------- load data in a sandbox that looks like a browser window ----------
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ["data.js", "data-amd.js", "data-meta.js", "shared.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, "assets", f), "utf8"), ctx, { filename: f });
}
const D = ctx.window.GPU_ATLAS;
const S = ctx.window.GPU_SHARED.make(D);
const { esc, fmtInt, fmtDate, fmtBw, fmtPower, money, priceIn, cores, coreLabel, badge, FIELDS, specVal, derived, fmtField, cls, keyStats } = S;
const LIST = D.list;
const BY_ID = Object.fromEntries(LIST.map((g) => [g.id, g]));
const COUNTRIES = D.COUNTRIES;

// ---------- helpers ----------
const write = (rel, content) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };
const copyDir = (from, to) => { fs.mkdirSync(to, { recursive: true }); for (const e of fs.readdirSync(from, { withFileTypes: true })) { const a = path.join(from, e.name), b = path.join(to, e.name); e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b); } };
const up = (depth) => "../".repeat(depth);
const dir = (p) => p + SUF; // internal directory link
const gpuUrl = (id) => `${SITE}/gpu/${id}/`;
const BRAND_COLOR = { NVIDIA: "#3f6b0a", AMD: "#a3171b", Intel: "#0b5ca8" };
const pct = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null);
const memText = (g) => { const m = g.specs.mem; if (m == null) return null; if (typeof m === "string") return m; return m >= 1000 ? `${(m / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} TB` : `${m} GB`; };

function hasOg(id) { return fs.existsSync(path.join(OUT, "og", `${id}.png`)); }

function layout({ title, desc, canonical, depth, body, og, jsonld, active }) {
  const p = up(depth);
  const nav = [["Database", dir(p) || "./", "database"], ["Compare", `${dir(p)}#compare`, "compare"], ["Guides", dir(`${p}guides/`), "guides"], ["Architectures", `${dir(p)}#architectures`, "architectures"], ["Glossary", `${dir(p)}#glossary`, "glossary"], ["Sources", `${dir(p)}#methodology`, "methodology"]];
  const ogImg = og ? `${SITE}/og/${og}.png` : `${SITE}/og/default.png`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="GPU Atlas">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(ogImg)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#fafaf9">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%233f6b0a'/%3E%3Cpath d='M8 22V10h6a5 5 0 0 1 0 10h-2' fill='none' stroke='%23fff' stroke-width='3'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${p}assets/styles.css">
  <script>try{var t=localStorage.getItem("gpuatlas:theme");t=t?JSON.parse(t):(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
${jsonld ? `  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>\n` : ""}</head>
<body>
  <header class="site-header">
    <div class="container">
      <a class="brand" href="${dir(p) || "./"}"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">GPU Atlas</span><span class="brand-sub">NVIDIA, AMD &amp; Intel GPU reference</span></a>
      <nav class="nav" aria-label="Main">${nav.map(([l, h, k]) => `<a href="${h}"${k === active ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
      <button class="icon-btn" id="themeBtn" type="button">Theme</button>
    </div>
  </header>
  <main><div class="container">
${body}
  </div></main>
  <footer class="site-footer">
    <div class="container">
      <span>GPU Atlas is an independent reference and is not affiliated with NVIDIA, AMD or Intel. Product names are trademarks of their owners.</span>
      <span>Data updated ${esc(D.updated)} · <a href="${dir(p)}#methodology">Methodology</a> · <a href="${esc(D.REPO)}" rel="noopener">GitHub</a></span>
    </div>
  </footer>
  <script>
  (function(){
    var b=document.getElementById("themeBtn");
    function cur(){return document.documentElement.getAttribute("data-theme")||"light";}
    function label(){b.textContent=cur()==="dark"?"Light":"Dark";}
    label();
    b.addEventListener("click",function(){var n=cur()==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",n);try{localStorage.setItem("gpuatlas:theme",JSON.stringify(n))}catch(e){}label();});
    var c=document.getElementById("cmpBtn");
    if(c){c.addEventListener("click",function(){var id=c.getAttribute("data-id"),l=[];try{l=JSON.parse(localStorage.getItem("gpuatlas:compare")||"[]")}catch(e){}if(l.indexOf(id)<0&&l.length<4)l.push(id);try{localStorage.setItem("gpuatlas:compare",JSON.stringify(l))}catch(e){}location.href=c.getAttribute("data-href");});}
  })();
  </script>
</body>
</html>
`;
}

// ---------- product pages ----------
function describe(g) {
  const s = g.specs, bits = [];
  if (cores(g)) bits.push(`${fmtInt(cores(g))} ${coreLabel(g) === "CUDA" ? "CUDA cores" : coreLabel(g) === "Stream proc." ? "stream processors" : "shader ALUs"}`);
  if (memText(g)) bits.push(`${memText(g)}${typeof s.mem === "number" && s.memType ? " " + s.memType.split(" (")[0] : ""}`);
  if (s.bw) bits.push(fmtBw(s.bw));
  if (s.fp4 && !cores(g)) bits.push(`${s.fp4.split(" · ")[0]} FP4`);
  const pw = fmtPower(s); if (pw !== "—") bits.push(pw);
  let d = `${g.name} specs: ${bits.join(", ")}.`;
  if (g.launch && /\d{4}/.test(g.launch)) d += ` Launched ${fmtDate(g.launch)}${g.msrp ? ` at ${money(g.msrp, "US")}` : ""}.`;
  const n = Object.keys(g.prices || {}).length;
  d += n > 1 ? ` Official launch prices in ${n} countries, variants and sources.` : " Full spec sheet, variants and sources.";
  return d;
}

function productPage(g) {
  const depth = 2, p = up(depth), canonical = gpuUrl(g.id);
  const s = g.specs, d = derived(g);
  const siblings = LIST.filter((x) => x.seg === g.seg && x.series === g.series && x.brand === g.brand);
  const segList = LIST.filter((x) => x.seg === g.seg);
  const i = segList.indexOf(g);
  const prev = segList[i - 1], next = segList[i + 1];
  const link = (x) => `${p}gpu/${x.id}/${SUF}`;

  // similar products: same segment, closest US launch price, any brand
  const similar = g.msrp ? LIST.filter((x) => x !== g && x.seg === g.seg && x.msrp && !["rumored", "roadmap"].includes(x.status))
    .sort((a, b) => Math.abs(a.msrp - g.msrp) - Math.abs(b.msrp - g.msrp) || (b.launch > a.launch ? 1 : -1)).slice(0, 5) : [];

  const overview = [
    ["Brand", g.brand], ["Segment", D.SEGMENTS[g.seg]], ["Series", g.series], ["Architecture", g.arch], ["Status", D.STATUS[g.status]], ["Launch", fmtDate(g.launch)],
    ["Launch price (US)", (g.msrp ? esc(money(g.msrp, "US")) : "—") + (g.priceNote ? `<span class="note">${esc(g.priceNote)}</span>` : ""), true]
  ];
  const groups = FIELDS.map(([title, fields]) => {
    const rows = fields.filter(([k]) => specVal(g, k) != null && specVal(g, k) !== "").map(([k, l]) => {
      const v = fmtField(k, specVal(g, k));
      const calc = s[k] == null && d[k] != null;
      return `<dt>${esc(l)}</dt><dd class="${cls(v)}">${esc(v)}${calc ? `<span class="note">${k === "fp32" ? "calculated from cores × boost clock" : "derived from SM count"}</span>` : ""}</dd>`;
    }).join("");
    return rows ? `<section class="spec-group"><h3>${esc(title)}</h3><dl class="specs">${rows}</dl></section>` : "";
  }).join("");

  const hasRegional = Object.keys(g.prices || {}).length > 0;
  const regional = hasRegional ? `<section class="spec-group"><h3>Launch price by country</h3><dl class="specs">${COUNTRIES.map((c) => {
    const v = priceIn(g, c.code);
    return `<dt>${esc(c.name)}</dt><dd class="${v == null ? "txt dim" : "num"}">${v == null ? "Not published" : esc(money(v, c.code))}</dd>`;
  }).join("")}</dl>${g.regionNote ? `<p class="sub" style="margin-top:8px">${esc(g.regionNote)}</p>` : ""}</section>` : "";

  const street = g.street && g.street.length ? `<section class="spec-group"><h3>Price check: launch vs. street</h3>
    <table class="street"><thead><tr><th>Country</th><th>Launch price</th><th>Reported street price</th><th>Change</th><th>Checked</th></tr></thead><tbody>${g.street.map((r) => {
      const c = COUNTRIES.find((x) => x.code === r.c); const lp = priceIn(g, r.c); const ch = lp != null ? pct(r.v, lp) : null; const src = D.SOURCES[r.src];
      return `<tr><td>${esc(c ? c.name : r.c)}${r.note ? `<div class="sub">${esc(r.note)}</div>` : ""}</td><td class="num">${lp != null ? esc(money(lp, r.c)) : "—"}</td><td class="num">${esc(money(r.v, r.c))}</td><td>${ch != null ? `<span class="up">${ch > 0 ? "+" : ""}${ch}%</span>` : "—"}</td><td><span class="sub">${esc(fmtDate(r.date))}${src ? ` · <a href="${esc(src.u)}" rel="noopener" target="_blank">source</a>` : ""}</span></td></tr>`;
    }).join("")}</tbody></table><p class="sub" style="margin-top:8px">Street prices are dated snapshots of the lowest new-card price reported by the named source. They change daily and are not updated automatically.</p></section>` : "";

  const variants = g.variants && g.variants.length ? `<section class="spec-group"><h3>Variants &amp; versions</h3>${g.variants.map((v) => `<div class="variant"><b>${esc(v.name)}</b><span>${esc(v.diff)}</span></div>`).join("")}</section>` : "";
  const sources = (g.sources || []).map((k) => D.SOURCES[k]).filter(Boolean);
  const issue = `${D.REPO}/issues/new?title=${encodeURIComponent("Spec error: " + g.name)}&body=${encodeURIComponent(`Page: ${canonical}\n\nWhat is wrong:\n\nCorrect value:\n\nSource (link to an official page if possible):\n`)}`;
  const ks = keyStats(g);

  const body = `
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${dir(p) || "./"}">Database</a> / ${esc(D.SEGMENTS[g.seg])} / ${esc(g.series)}</nav>
      <div class="detail-head">
        <div>
          <p class="eyebrow">${esc(g.brand)} · ${esc(D.SEGMENTS[g.seg])} · ${esc(g.arch)}</p>
          <h1>${esc(g.name)}</h1>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${badge(g.status)}<span class="sub">${esc(fmtDate(g.launch))}${g.msrp ? ` · ${esc(money(g.msrp, "US"))} at launch (US)` : ""}</span></div>
          <div class="checked">${g.checked ? `<span class="ok">Specs last checked ${esc(fmtDate(g.checked))}</span>` : `<span class="warn">Not yet re-checked against the official spec page</span>`}${g.checkNote ? `<span>${esc(g.checkNote)}</span>` : ""}<a href="${esc(issue)}" rel="noopener" target="_blank">Report an error</a></div>
        </div>
        <div class="actions"><button class="btn primary" id="cmpBtn" data-id="${esc(g.id)}" data-href="${dir(p) || "./"}#compare">Add to compare</button></div>
      </div>
      ${g.summary ? `<p class="lead" style="margin-top:18px">${esc(g.summary)}</p>` : ""}
      ${g.status === "rumored" ? `<div class="callout">This product has not been announced. Details come from press reports and leaks and may be wrong.</div>` : ""}
      ${g.status === "roadmap" ? `<div class="callout">Roadmap item. Specifications are preliminary and may change before release.</div>` : ""}
      ${ks.length ? `<div class="keystats">${ks.map((x) => `<div class="keystat"><div class="k">${esc(x.k)}</div><div class="v">${esc(x.v)}${x.u ? `<small>${esc(x.u)}</small>` : ""}</div></div>`).join("")}</div>` : ""}
      <div class="detail-grid">
        <div>
          <section class="spec-group"><h3>Overview</h3><dl class="specs">${overview.map(([k, v, raw]) => `<dt>${esc(k)}</dt><dd class="${["Launch", "Launch price (US)"].includes(k) ? "num" : "txt"}">${raw ? v : esc(v)}</dd>`).join("")}</dl></section>
          ${regional}
          ${street}
          ${groups}
          ${variants}
        </div>
        <aside>
          ${siblings.length > 1 ? `<div class="panel"><h3>${esc(g.series)} family</h3><ul>${siblings.map((x) => `<li class="${x === g ? "here" : ""}">${x === g ? esc(x.name) : `<a href="${link(x)}">${esc(x.name)}</a>`}</li>`).join("")}</ul></div>` : ""}
          ${similar.length ? `<div class="panel"><h3>Similar launch price</h3><ul>${similar.map((x) => `<li><a href="${link(x)}">${esc(x.name)}</a> <span class="sub">${esc(money(x.msrp, "US"))}</span></li>`).join("")}</ul></div>` : ""}
          <div class="panel"><h3>Sources</h3><ul>${sources.length ? sources.map((src) => `<li class="src">${src.u ? `<a href="${esc(src.u)}" target="_blank" rel="noopener">${esc(src.t)}</a>` : esc(src.t)}</li>`).join("") : "<li class='src'>Launch specifications</li>"}</ul></div>
        </aside>
      </div>
      <nav class="pager">
        <span>${prev ? `<a href="${link(prev)}"><span class="dir">Previous</span>${esc(prev.name)}</a>` : ""}</span>
        <span style="text-align:right">${next ? `<a href="${link(next)}"><span class="dir">Next</span>${esc(next.name)}</a>` : ""}</span>
      </nav>`;

  const jsonld = [
    { "@context": "https://schema.org", "@type": "Product", name: g.name, brand: { "@type": "Brand", name: g.brand }, category: D.SEGMENTS[g.seg], description: g.summary || describe(g), url: canonical, ...(hasOg(g.id) ? { image: `${SITE}/og/${g.id}.png` } : {}) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "GPU database", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: g.name, item: canonical }
    ] }
  ];
  return layout({ title: `${g.name} specs, price & variants — GPU Atlas`, desc: describe(g), canonical, depth, body, og: hasOg(g.id) ? g.id : null, jsonld, active: "database" });
}

// ---------- guides ----------
function priceCell(g, code) { const v = priceIn(g, code); return v == null ? `<span class="dim">—</span>` : esc(money(v, code)); }
function tableRows(rows, cols, depth) {
  const p = up(depth);
  return `<div class="table-wrap"><table class="data"><thead><tr>${cols.map((c) => `<th class="${c.n ? "n" : ""}">${esc(c.h)}</th>`).join("")}</tr></thead><tbody>${rows.map((g) => `<tr style="cursor:default">${cols.map((c) => `<td class="${c.n ? "n" : ""}">${c.f(g, p)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const colModel = { h: "Model", f: (g, p) => `<a class="model-link" href="${p}gpu/${g.id}/${SUF}">${esc(g.name)}</a><div class="sub"><span class="brand-tag ${g.brand.toLowerCase()}">${esc(g.brand)}</span> ${esc(g.series)}</div>` };
const colMem = { h: "Memory", n: 1, f: (g) => `${esc(memText(g) || "—")}${typeof g.specs.mem === "number" && g.specs.memType ? `<div class="sub">${esc(g.specs.memType.split(" (")[0])}</div>` : ""}` };
const colBw = { h: "Bandwidth", n: 1, f: (g) => esc(fmtBw(g.specs.bw)) };
const colPower = { h: "Power", n: 1, f: (g) => esc(fmtPower(g.specs)) };
const colLaunch = { h: "Launch", n: 1, f: (g) => esc(fmtDate(g.launch)) };
const colUS = { h: "US launch", n: 1, f: (g) => priceCell(g, "US") };
const colIN = { h: "India launch", n: 1, f: (g) => priceCell(g, "IN") };
const colUK = { h: "UK launch", n: 1, f: (g) => priceCell(g, "GB") };
const colCores = { h: "Shader cores", n: 1, f: (g) => (cores(g) ? `${fmtInt(cores(g))}<div class="sub">${esc(coreLabel(g))}</div>` : "—") };

const isCurrentDesktop = (g) => g.seg === "desktop" && ["current"].includes(g.status);
const GUIDES = [
  {
    slug: "launch-price-vs-street-price-2026",
    title: "GPU prices in 2026: launch price vs. what cards sell for now",
    short: "How far street prices have moved from launch prices during the 2026 memory shortage.",
    build() {
      const rows = LIST.filter((g) => g.street && g.street.some((r) => r.c === "US")).sort((a, b) => (b.msrp || 0) - (a.msrp || 0));
      const usStreet = (g) => g.street.find((r) => r.c === "US");
      const others = LIST.filter((g) => g.street && g.street.some((r) => r.c !== "US"));
      return `<p class="lead">Memory shortages pushed graphics card prices well above launch prices during 2026. This table compares each card's US launch price with the lowest new-card price reported by a named tracker on the date shown. Snapshots are not live; check a retailer before buying.</p>
        <div class="section">${tableRows(rows, [colModel, colUS,
          { h: "Reported US street price", n: 1, f: (g) => esc(money(usStreet(g).v, "US")) },
          { h: "Change", n: 1, f: (g) => { const c = pct(usStreet(g).v, g.msrp); return c == null ? "—" : `<span class="up">${c > 0 ? "+" : ""}${c}%</span>`; } },
          { h: "Checked", n: 1, f: (g) => { const r = usStreet(g); const src = D.SOURCES[r.src]; return `<span class="sub">${esc(fmtDate(r.date))}${src ? ` · <a href="${esc(src.u)}" rel="noopener" target="_blank">source</a>` : ""}</span>`; } }], 2)}</div>
        ${others.length ? `<div class="section"><h2>Other countries</h2>${tableRows(others.flatMap((g) => g.street.filter((r) => r.c !== "US").map((r) => Object.assign(Object.create(g), { _r: r }))), [colModel,
          { h: "Country", f: (g) => esc((COUNTRIES.find((c) => c.code === g._r.c) || {}).name || g._r.c) },
          { h: "Launch price", n: 1, f: (g) => priceCell(g, g._r.c) },
          { h: "Reported street price", n: 1, f: (g) => esc(money(g._r.v, g._r.c)) + (g._r.note ? `<div class="sub">${esc(g._r.note)}</div>` : "") },
          { h: "Checked", n: 1, f: (g) => `<span class="sub">${esc(fmtDate(g._r.date))}</span>` }], 2)}</div>` : ""}`;
    }
  },
  {
    slug: "graphics-cards-with-16gb-or-more",
    title: "Every current desktop graphics card with 16 GB or more",
    short: "Current NVIDIA, AMD and Intel desktop cards with at least 16 GB of memory, by launch price.",
    build() {
      const rows = LIST.filter((g) => isCurrentDesktop(g) && typeof g.specs.mem === "number" && g.specs.mem >= 16).sort((a, b) => (a.msrp || 1e9) - (b.msrp || 1e9));
      return `<p class="lead">More memory matters for 4K textures, ray tracing and running AI models locally. These are the desktop cards on sale now with 16 GB or more, cheapest launch price first. Cards sold in both 8 GB and 16 GB versions are listed by their 16 GB version.</p><div class="section">${tableRows(rows, [colModel, colMem, colBw, colCores, colPower, colUS, colIN, colUK], 2)}</div>`;
    }
  },
  {
    slug: "graphics-cards-under-400-dollars",
    title: "Current desktop graphics cards that launched under $400",
    short: "Budget and mainstream cards from all three brands, with India and UK launch prices where published.",
    build() {
      const rows = LIST.filter((g) => isCurrentDesktop(g) && g.msrp && g.msrp < 400).sort((a, b) => a.msrp - b.msrp);
      return `<p class="lead">Current desktop cards with a US launch price below $400, cheapest first. Launch prices are the official prices at release; 2026 street prices are often higher (see the <a href="${dir("../launch-price-vs-street-price-2026/")}">price check</a>). For your own budget in your currency, use the price and memory filters in the <a href="${dir("../../")}">database</a>.</p><div class="section">${tableRows(rows, [colModel, colMem, colBw, colCores, colPower, colLaunch, colUS, colIN, colUK], 2)}</div>`;
    }
  },
  {
    slug: "ai-workstation-cards-32gb",
    title: "Workstation and AI cards with 32 GB or more",
    short: "Professional and local-AI cards from NVIDIA, AMD and Intel with at least 32 GB.",
    build() {
      const rows = LIST.filter((g) => g.seg === "pro" && typeof g.specs.mem === "number" && g.specs.mem >= 32 && !["rumored", "roadmap"].includes(g.status)).sort((a, b) => b.specs.mem - a.specs.mem || (b.msrp || 0) - (a.msrp || 0));
      return `<p class="lead">For running large language models locally, memory capacity usually matters more than raw speed. These workstation cards have 32 GB or more. Workstation cards are often sold through system builders without a public list price.</p><div class="section">${tableRows(rows, [colModel, colMem, colBw, colPower, colLaunch, colUS], 2)}</div>`;
    }
  },
  {
    slug: "nvidia-vs-amd-vs-intel-lineups",
    title: "NVIDIA vs. AMD vs. Intel: current desktop lineups side by side",
    short: "Each brand's current desktop cards grouped by launch price band.",
    build() {
      const bands = [[0, 300, "Under $300"], [300, 450, "$300–449"], [450, 650, "$450–649"], [650, 1000, "$650–999"], [1000, 1e9, "$1,000 and up"]];
      const brands = ["NVIDIA", "AMD", "Intel"];
      const cell = (list) => list.length ? list.map((g) => `<a class="model-link" href="../../gpu/${g.id}/${SUF}">${esc(g.name.replace(/^(GeForce|Radeon|Intel) /, ""))}</a> <span class="sub">${esc(money(g.msrp, "US"))} · ${esc(memText(g) || "")}</span>`).join("<br>") : `<span class="dim">—</span>`;
      const rows = bands.map(([lo, hi, label]) => `<tr style="cursor:default"><td><b>${label}</b></td>${brands.map((b) => `<td style="white-space:normal">${cell(LIST.filter((g) => isCurrentDesktop(g) && g.brand === b && g.msrp && g.msrp >= lo && g.msrp < hi).sort((x, y) => x.msrp - y.msrp))}</td>`).join("")}</tr>`).join("");
      return `<p class="lead">Current desktop graphics cards from each brand, grouped by US launch price. Core counts are not comparable across brands; use the linked spec sheets and independent reviews for performance.</p>
        <div class="section"><div class="table-wrap"><table class="data"><thead><tr><th>Launch price</th>${brands.map((b) => `<th>${b}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
    }
  }
];

function guidePage(gd) {
  const depth = 2, canonical = `${SITE}/guides/${gd.slug}/`;
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><a href="${dir("../../") }">Database</a> / <a href="${dir("../")}">Guides</a></nav>
    <div class="page-head"><p class="eyebrow">Guide</p><h1>${esc(gd.title)}</h1><div class="meta"><span>Updated ${esc(D.updated)}</span><span>Built from the GPU Atlas database</span></div></div>
    ${gd.build()}
    <p class="sub" style="margin-top:16px">Launch prices are official prices at release. Specifications link to each product's spec sheet and its sources.</p>`;
  return layout({ title: `${gd.title} — GPU Atlas`, desc: gd.short, canonical, depth, body, og: null, active: "guides",
    jsonld: { "@context": "https://schema.org", "@type": "Article", headline: gd.title, dateModified: BUILD_DATE, publisher: { "@type": "Organization", name: "GPU Atlas" }, mainEntityOfPage: canonical } });
}

function guidesIndex() {
  const canonical = `${SITE}/guides/`;
  const body = `<div class="page-head"><p class="eyebrow">Guides</p><h1>Buying and comparison guides</h1><p class="lead">Short, factual guides generated from the database. Every number links back to a spec sheet and its sources.</p></div>
    <ul class="guide-list">${GUIDES.map((g) => `<li><a href="${dir(g.slug + "/")}"><b>${esc(g.title)}</b><span>${esc(g.short)}</span></a></li>`).join("")}</ul>`;
  return layout({ title: "GPU buying and comparison guides — GPU Atlas", desc: "Guides built from the GPU Atlas database: launch vs. street prices, 16 GB cards, budget cards, AI workstation cards and brand lineups.", canonical, depth: 1, body, active: "guides" });
}

// ---------- social preview images ----------
function xml(s) { return String(s).replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c])); }
function wrap(text, max) { const words = text.split(" "); const lines = [""]; for (const w of words) { const l = lines[lines.length - 1]; if ((l + " " + w).trim().length > max && l) lines.push(w); else lines[lines.length - 1] = (l + " " + w).trim(); } return lines; }
function ogSvg(g) {
  const color = BRAND_COLOR[g.brand] || "#3f6b0a";
  const name = g.name.replace(/ \(unconfirmed\)$/, "");
  const size = name.length > 30 ? 58 : 72;
  const lines = wrap(name, name.length > 30 ? 26 : 22).slice(0, 2);
  const ks = keyStats(g).map((x) => {
    let v = String(x.v), u = x.u || "";
    if (v.length > 9) { const m = /^([~≈]?[\d.,]+)\s*([A-Za-z]{1,6})/.exec(v); if (!m) return null; v = m[1]; u = m[2]; }
    return { k: x.k, v, u };
  }).filter((x) => x && x.k !== "CPU").slice(0, 4);
  const w = ks.length ? Math.floor(1040 / ks.length) : 0;
  const baseY = 160 + lines.length * (size + 8);
  const stats = ks.map((x, i) => {
    const xPos = 80 + i * w;
    const val = x.v; const ls = x.k.length > 14 ? 17 : 20;
    return `<g><rect x="${xPos}" y="${baseY + 40}" width="${w - 20}" height="150" rx="14" fill="#ffffff" stroke="#e6e4e0"/>
      <text x="${xPos + 24}" y="${baseY + 84}" font-family="Inter" font-weight="600" font-size="${ls}" fill="#77726b" letter-spacing="1">${xml(x.k.toUpperCase())}</text>
      <text x="${xPos + 24}" y="${baseY + 150}" font-family="Inter" font-weight="700" font-size="46" fill="#1a1917">${xml(val)}<tspan dx="8" font-size="22" font-weight="600" fill="#77726b">${xml(x.u || "")}</tspan></text></g>`;
  }).join("");
  const launch = [fmtDate(g.launch), g.msrp ? `${money(g.msrp, "US")} at launch` : ""].filter(Boolean).join(" · ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fafaf9"/>
  <rect width="1200" height="12" fill="${color}"/>
  <text x="80" y="110" font-family="Inter" font-weight="600" font-size="26"><tspan fill="${color}">${xml(g.brand.toUpperCase())}</tspan><tspan dx="16" fill="#77726b">${xml((D.SEGMENTS[g.seg] + " · " + g.arch).toUpperCase())}</tspan></text>
  ${lines.map((l, i) => `<text x="80" y="${190 + i * (size + 8)}" font-family="Inter" font-weight="700" font-size="${size}" fill="#1a1917">${xml(l)}</text>`).join("")}
  ${stats}
  <text x="80" y="580" font-family="Inter" font-weight="700" font-size="26" fill="#1a1917">GPU Atlas</text>
  <text x="225" y="580" font-family="Inter" font-size="24" fill="#77726b">Spec sheet · prices by country · sources</text>
  <text x="1120" y="580" text-anchor="end" font-family="Inter" font-size="24" fill="#4a4743">${xml(launch)}</text>
</svg>`;
}
function defaultSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fafaf9"/><rect width="1200" height="12" fill="#3f6b0a"/>
  <text x="80" y="230" font-family="Inter" font-weight="700" font-size="96" fill="#1a1917">GPU Atlas</text>
  <text x="80" y="310" font-family="Inter" font-size="40" fill="#4a4743">NVIDIA, AMD &amp; Intel GPU reference</text>
  <text x="80" y="380" font-family="Inter" font-size="30" fill="#77726b">${LIST.length} spec sheets · launch prices by country · sources</text>
</svg>`;
}
function renderPngs() {
  let Resvg;
  try { ({ Resvg } = require("@resvg/resvg-js")); } catch (e) { console.warn("! @resvg/resvg-js not installed — skipping social images"); return 0; }
  const fontDir = path.join(__dirname, "fonts");
  const fontFiles = fs.existsSync(fontDir) ? fs.readdirSync(fontDir).filter((f) => /\.(ttf|otf)$/.test(f)).map((f) => path.join(fontDir, f)) : [];
  const opts = { font: { fontFiles, loadSystemFonts: fontFiles.length === 0, defaultFontFamily: "Inter" }, fitTo: { mode: "width", value: 1200 } };
  const render = (svg) => new Resvg(svg, opts).render().asPng();
  fs.mkdirSync(path.join(OUT, "og"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "og", "default.png"), render(defaultSvg()));
  let n = 0;
  for (const g of LIST) { fs.writeFileSync(path.join(OUT, "og", `${g.id}.png`), render(ogSvg(g))); n++; }
  return n;
}

// ---------- index (SPA) with SEO additions ----------
function indexHtml() {
  let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const head = `  <link rel="canonical" href="${SITE}/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/">
  <meta property="og:image" content="${SITE}/og/default.png">
  <meta name="twitter:card" content="summary_large_image">
${SUF ? `  <script>window.GPU_ATLAS_LINK_SUFFIX=${JSON.stringify(SUF)};</script>\n` : ""}`;
  html = html.replace("</head>", head + "</head>");
  if (SUF) html = html.replace('href="guides/"', `href="guides/${SUF}"`);
  // crawlable index of every spec sheet
  const groups = ["NVIDIA", "AMD", "Intel"].map((b) => `<div><h3>${b}</h3><p>${LIST.filter((g) => g.brand === b).map((g) => `<a href="gpu/${g.id}/${SUF}">${esc(g.name)}</a>`).join(" · ")}</p></div>`).join("");
  const allIndex = `  <section class="container all-index" aria-label="All spec sheets"><h2>All spec sheets</h2>${groups}<p><a href="guides/${SUF}">Guides</a></p></section>\n`;
  html = html.replace("  <div class=\"tray\"", allIndex + "  <div class=\"tray\"");
  return html;
}

// ---------- build ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
// Site-ownership files (Google Search Console, Bing) dropped in the repo root are published as-is.
for (const f of fs.readdirSync(ROOT)) if (/^google[0-9a-f]+\.html$|^BingSiteAuth\.xml$|^yandex_[0-9a-f]+\.html$/.test(f)) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
const pngs = process.env.SKIP_IMAGES ? 0 : renderPngs();
write("index.html", indexHtml());
for (const g of LIST) write(`gpu/${g.id}/index.html`, productPage(g));
write("gpu/index.html", `<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../${SUF}"><link rel="canonical" href="${SITE}/"><title>GPU Atlas</title><a href="../${SUF}">GPU database</a>`);
write("guides/index.html", guidesIndex());
for (const gd of GUIDES) write(`guides/${gd.slug}/index.html`, guidePage(gd));
write("404.html", layout({ title: "Page not found — GPU Atlas", desc: "This page does not exist.", canonical: `${SITE}/`, depth: 0, body: `<div class="page-head"><h1>Page not found</h1><p class="lead">That page doesn't exist. Try the <a href="${SITE}/">GPU database</a> or the <a href="${SITE}/guides/">guides</a>.</p></div>`, active: "" })
  .replace(/href="assets\//g, `href="${SITE}/assets/`).replace(/href="\.\/"/g, `href="${SITE}/"`).replace(/href="#/g, `href="${SITE}/#`).replace(/href="guides\//g, `href="${SITE}/guides/`));

const urls = [
  { loc: `${SITE}/`, lastmod: BUILD_DATE, pr: "1.0" },
  { loc: `${SITE}/guides/`, lastmod: BUILD_DATE, pr: "0.8" },
  ...GUIDES.map((g) => ({ loc: `${SITE}/guides/${g.slug}/`, lastmod: BUILD_DATE, pr: "0.8" })),
  ...LIST.map((g) => ({ loc: gpuUrl(g.id), lastmod: g.checked || BUILD_DATE, pr: g.status === "current" ? "0.9" : "0.6" }))
];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${xml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pr}</priority></url>`).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Built ${LIST.length} product pages, ${GUIDES.length} guides, ${pngs} preview images, ${urls.length} sitemap URLs → dist/ (site: ${SITE}${SUF ? `, link suffix "${SUF}"` : ""})`);
