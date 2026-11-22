#!/usr/bin/env node
/* GPU Atlas static build.
 * Generates one HTML page per product, guide pages, social preview images, sitemap.xml and robots.txt into dist/.
 *
 *   node scripts/build.cjs
 *
 * Environment:
 *   SITE_URL      Absolute site URL used for canonical links and the sitemap (default: https://gpuatlas.in)
 *   LINK_SUFFIX   Appended to internal directory links, e.g. "index.html" for hosts without directory indexes
 *   BUILD_DATE    YYYY-MM-DD used for sitemap lastmod (default: today)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const OUT = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : path.join(ROOT, "dist");
const SITE = (process.env.SITE_URL || "https://gpuatlas.in").replace(/\/$/, "");
const SUF = process.env.LINK_SUFFIX || "";
const BUILD_DATE = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

// ---------- load data in a sandbox that looks like a browser window ----------
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ["data.js", "data-amd.js", "data-meta.js", "data-apple.js", "shared.js"]) {
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
const BRAND_COLOR = { NVIDIA: "#3f6b0a", AMD: "#a3171b", Intel: "#0b5ca8", Apple: "#3a3a3c" };
// Content hash of CSS/JS so browsers fetch fresh files after each change
const ASSET_V = require("crypto").createHash("sha1").update(fs.readdirSync(path.join(ROOT, "assets")).filter((f) => /\.(css|js)$/.test(f)).sort().map((f) => fs.readFileSync(path.join(ROOT, "assets", f))).join("")).digest("hex").slice(0, 10);
const INDEXNOW_KEY = "5f3c9a1e7b2d4c8a9e6f0b1d2c3a4e5f";
const pct = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null);
const memText = (g) => { const m = g.specs.mem; if (m == null) return null; if (typeof m === "string") return m; return m >= 1000 ? `${(m / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} TB` : `${m} GB`; };

function hasOg(id) { return fs.existsSync(path.join(OUT, "og", `${id}.png`)); }

function layout({ title, desc, canonical, depth, body, og, jsonld, active }) {
  const p = up(depth);
  const nav = [["Database", dir(p) || "./", "database"], ["Compare", `${dir(p)}#compare`, "compare"], ["GPU finder", dir(`${p}gpu-finder/`), "finder"], ["Guides", dir(`${p}guides/`), "guides"], ["Architectures", dir(`${p}architectures/`), "architectures"], ["Glossary", dir(`${p}glossary/`), "glossary"], ["About", dir(`${p}about/`), "methodology"]];
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
  <meta name="theme-color" content="#f5f6f4">
  <link rel="icon" href="${p}assets/brand/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="${p}assets/brand/icon-32.png">
  <link rel="apple-touch-icon" href="${p}assets/brand/icon-180.png">
  <link rel="manifest" href="${p}assets/brand/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${p}assets/styles.css?v=${ASSET_V}">
  <script>try{var t=localStorage.getItem("gpuatlas:theme");t=t?JSON.parse(t):(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
${jsonld ? `  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>\n` : ""}</head>
<body>
  <header class="site-header">
    <div class="container">
      <a class="brand" href="${dir(p) || "./"}"><img class="brand-logo on-light" src="${p}assets/brand/logo-light.png" alt="GPU Atlas" width="163" height="30"><img class="brand-logo on-dark" src="${p}assets/brand/logo-dark.png" alt="" aria-hidden="true" width="162" height="30"><span class="brand-sub">NVIDIA, AMD, Intel &amp; Apple GPU reference</span></a>
      <nav class="nav" aria-label="Main">${nav.map(([l, h, k]) => `<a href="${h}"${k === active ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
      <button class="icon-btn" id="themeBtn" type="button">Theme</button>
    </div>
  </header>
  <main><div class="container">
${body}
  </div></main>
  <footer class="site-footer">
    <div class="container">
      <span>GPU Atlas is an independent reference and is not affiliated with NVIDIA, AMD, Intel or Apple. Product names are trademarks of their owners.</span>
      <span>Data updated ${esc(D.updated)} · <a href="${dir(p + "about/")}">About</a> · <a href="${esc(D.REPO)}" rel="noopener">GitHub</a></span>
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
    ["Brand", g.brand], ["Segment", D.SEGMENTS[g.seg]], ["Series", seriesFor(g) ? `<a href="${dir(p + "series/" + seriesFor(g).slug + "/")}">${esc(g.series)}</a>` : esc(g.series), true], ["Architecture", archFor(g) ? `<a href="${dir(p + "architectures/" + archFor(g).slug + "/")}">${esc(g.arch)}</a>` : esc(g.arch), true], ["Status", D.STATUS[g.status]], ["Launch", fmtDate(g.launch)],
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
    }).join("")}</tbody></table><p class="sub" style="margin-top:8px">Street prices are dated snapshots of the lowest new-card price reported by the named source. They change daily and are refreshed monthly.</p>${streetChart(g)}</section>` : "";

  const variants = g.variants && g.variants.length ? `<section class="spec-group"><h3>Variants &amp; versions</h3>${g.variants.map((v) => `<div class="variant"><b>${esc(v.name)}</b><span>${esc(v.diff)}</span></div>`).join("")}</section>` : "";
  const sources = (g.sources || []).map((k) => D.SOURCES[k]).filter(Boolean);
  const issue = `${D.REPO}/issues/new?title=${encodeURIComponent("Spec error: " + g.name)}&body=${encodeURIComponent(`Page: ${canonical}\n\nWhat is wrong:\n\nCorrect value:\n\nSource (link to an official page if possible):\n`)}`;
  const ks = keyStats(g);

  const body = `
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${dir(p) || "./"}">Database</a> / <a href="${dir(p + "brands/" + brandSlug(g.brand) + "/")}">${esc(g.brand)}</a> / ${esc(D.SEGMENTS[g.seg])} / ${esc(g.series)}</nav>
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
          ${ladderChart(g, link)}
          ${regional}
          ${street}
          ${groups}
          ${variants}
          ${(() => { const f = faqFor(g); return f.length ? `<section class="spec-group faq"><h3>Common questions</h3>${f.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>` : ""; })()}
        </div>
        <aside>
          ${siblings.length > 1 ? `<div class="panel"><h3>${esc(g.series)} family</h3><ul>${siblings.map((x) => `<li class="${x === g ? "here" : ""}">${x === g ? esc(x.name) : `<a href="${link(x)}">${esc(x.name)}</a>`}</li>`).join("")}</ul></div>` : ""}
          ${similar.length ? `<div class="panel"><h3>Similar launch price</h3><ul>${similar.map((x) => `<li><a href="${link(x)}">${esc(x.name)}</a> <span class="sub">${esc(money(x.msrp, "US"))}</span></li>`).join("")}</ul></div>` : ""}
          ${vsFor(g).length ? `<div class="panel"><h3>Head-to-head</h3><ul>${vsFor(g).map((v) => `<li><a href="${dir(p + "compare/" + v.slug + "/")}">${esc(vsName(v))}</a></li>`).join("")}</ul></div>` : ""}
          ${g.reviews && g.reviews.length ? `<div class="panel"><h3>Independent reviews</h3><ul>${g.reviews.map((r) => `<li class="src"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.outlet)}</a></li>`).join("")}</ul><p class="sub" style="margin-top:6px">For performance, read these rather than spec sheets. GPU Atlas does not copy benchmark results.</p></div>` : ""}
          <div class="panel"><h3>Sources</h3><ul>${sources.length ? sources.map((src) => `<li class="src">${src.u ? `<a href="${esc(src.u)}" target="_blank" rel="noopener">${esc(src.t)}</a>` : esc(src.t)}</li>`).join("") : "<li class='src'>Launch specifications</li>"}</ul></div>
        </aside>
      </div>
      <nav class="pager">
        <span>${prev ? `<a href="${link(prev)}"><span class="dir">Previous</span>${esc(prev.name)}</a>` : ""}</span>
        <span style="text-align:right">${next ? `<a href="${link(next)}"><span class="dir">Next</span>${esc(next.name)}</a>` : ""}</span>
      </nav>`;

  const jsonld = [
    { "@context": "https://schema.org", "@type": "WebPage", name: `${g.name} specifications`, description: g.summary || describe(g), url: canonical, dateModified: g.checked || BUILD_DATE, about: { "@type": "Thing", name: g.name, description: `${g.brand} ${D.SEGMENTS[g.seg]}` }, ...(hasOg(g.id) ? { primaryImageOfPage: `${SITE}/og/${g.id}.png` } : {}) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "GPU database", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: g.brand, item: `${SITE}/brands/${brandSlug(g.brand)}/` },
      { "@type": "ListItem", position: 3, name: g.name, item: canonical }
    ] },
    ...(faqFor(g).length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqFor(g).map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : [])
  ];
  return layout({ title: priceIn(g, "IN") != null ? `${g.name}: specs, price in India & ${Object.keys(g.prices).length - 1} more countries — GPU Atlas` : `${g.name} specs, price & variants — GPU Atlas`, desc: describe(g), canonical, depth, body, og: hasOg(g.id) ? g.id : null, jsonld, active: "database" });
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


// ---------- charts (static SVG, themed through CSS variables in styles.css) ----------
const shortName = (n) => n.replace(/^(NVIDIA |GeForce |Radeon |Intel |AMD |Apple )+/, "");
const barPath = (x, y, w, h, r = 4) => { r = Math.min(r, w / 2, h / 2); return w <= 0 ? "" : `M${x},${y}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 -${r},${r}h-${w - r}z`; };
const niceMax = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p; return 10 * p; };

// Price ladder: US launch prices of the product's family, the current product highlighted.
function ladderChart(g, link) {
  const fam = LIST.filter((x) => x.brand === g.brand && x.series === g.series && x.seg === g.seg && x.msrp).sort((a, b) => b.msrp - a.msrp);
  if (fam.length < 2 || !g.msrp) return "";
  const W = 640, L = 170, R = 70, rowH = 26, barH = 16, top = 8, H = top + fam.length * rowH + 22;
  const max = niceMax(Math.max(...fam.map((x) => x.msrp))), sx = (v) => (v / max) * (W - L - R);
  const ticks = [0, max / 2, max];
  const rows = fam.map((x, i) => {
    const y = top + i * rowH, here = x === g, w = sx(x.msrp);
    const mark = `<path d="${barPath(L, y + (rowH - barH) / 2, w, barH)}" class="${here ? "m-hi" : "m-lo"}"/>`;
    const lbl = `<text x="${L - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" class="${here ? "t1 b" : "t2"}">${esc(shortName(x.name))}</text>`;
    const val = `<text x="${L + w + 8}" y="${y + rowH / 2 + 4}" class="${here ? "t1 b" : "t2"} num">${esc(money(x.msrp, "US"))}</text>`;
    const hit = `<rect x="0" y="${y}" width="${W}" height="${rowH}" class="hit"/>`;
    const body = `<g class="row"><title>${esc(x.name)}: ${esc(money(x.msrp, "US"))} US launch price (${esc(fmtDate(x.launch))})</title>${hit}${mark}${lbl}${val}</g>`;
    return here ? body : `<a href="${link(x)}">${body}</a>`;
  }).join("");
  const axis = ticks.map((t) => `<line x1="${L + sx(t)}" x2="${L + sx(t)}" y1="${top}" y2="${H - 20}" class="grid"/><text x="${L + sx(t)}" y="${H - 4}" text-anchor="middle" class="t3 num">${esc(money(t, "US"))}</text>`).join("");
  return `<section class="spec-group"><h3>Price ladder: ${esc(g.series)} family</h3>
    <figure class="viz"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="US launch prices of the ${esc(g.series)} family, ${esc(g.name)} highlighted">${axis}${rows}</svg>
    <figcaption class="sub">US launch prices (official MSRP at release). Select a bar to open that spec sheet.</figcaption></figure></section>`;
}

// Street price as change from launch price (0 = launch), so different currencies share one axis.
function streetChart(g) {
  const rows = (g.street || []).map((r) => ({ r, lp: priceIn(g, r.c), c: COUNTRIES.find((x) => x.code === r.c) })).filter((x) => x.lp);
  if (!rows.length) return "";
  const W = 640, L = 130, R = 70, rowH = 30, barH = 16, top = 8, H = top + rows.length * rowH + 24;
  const ch = rows.map((x) => ((x.r.v - x.lp) / x.lp) * 100);
  const hi = niceMax(Math.max(10, ...ch)), lo = Math.min(0, ...ch) < 0 ? -niceMax(-Math.min(...ch)) : 0;
  const sx = (v) => L + ((v - lo) / (hi - lo)) * (W - L - R);
  const step = niceMax(hi / 3), ticks = []; for (let v = 0; v <= hi + 1e-9; v += step) ticks.push(v); if (lo < 0) ticks.unshift(lo);
  const bars = rows.map((x, i) => {
    const y = top + i * rowH, v = ch[i], c = Math.round(v), x0 = sx(Math.min(0, v)), w = Math.abs(sx(v) - sx(0));
    const d = v >= 0 ? barPath(x0, y + (rowH - barH) / 2, w, barH) : `M${x0 + w},${y + (rowH - barH) / 2}h-${Math.max(w - 4, 0)}a4,4 0 0 0 -4,4v${barH - 8}a4,4 0 0 0 4,4h${Math.max(w - 4, 0)}z`;
    return `<g class="row"><title>${esc(x.c ? x.c.name : x.r.c)}: ${esc(money(x.r.v, x.r.c))} street vs ${esc(money(x.lp, x.r.c))} launch (${c > 0 ? "+" : ""}${c}%), ${esc(fmtDate(x.r.date))}</title>
      <rect x="0" y="${y}" width="${W}" height="${rowH}" class="hit"/><path d="${d}" class="m-hi"/>
      <text x="${L - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" class="t2">${esc(x.c ? x.c.name : x.r.c)}</text>
      <text x="${(v >= 0 ? sx(v) + 8 : sx(0) + 8)}" y="${y + rowH / 2 + 4}" class="t1 num">${c > 0 ? "+" : ""}${c}%</text></g>`;
  }).join("");
  const axis = ticks.map((t) => `<line x1="${sx(t)}" x2="${sx(t)}" y1="${top}" y2="${H - 22}" class="${t === 0 ? "ref" : "grid"}"/><text x="${sx(t)}" y="${H - 6}" text-anchor="middle" class="t3 num">${t === 0 ? "Launch price" : (t > 0 ? "+" : "") + Math.round(t) + "%"}</text>`).join("");
  return `<figure class="viz" style="margin-top:14px"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Change from launch price to reported street price, by country">${axis}${bars}</svg>
    <figcaption class="sub">Change from the launch price to the reported street price, each in its own currency. Exact prices are in the table above.</figcaption></figure>`;
}

// Launch price over time: every desktop card with a US launch price, by brand (log scale).
const BRAND_SERIES = [["NVIDIA", "s1", "circle"], ["AMD", "s2", "square"], ["Intel", "s3", "triangle"]];
function shape(kind, x, y, cls) {
  if (kind === "square") return `<rect x="${x - 4.5}" y="${y - 4.5}" width="9" height="9" rx="1.5" class="${cls}"/>`;
  if (kind === "triangle") return `<path d="M${x},${y - 5.5}L${x + 5.5},${y + 4.5}L${x - 5.5},${y + 4.5}z" class="${cls}"/>`;
  return `<circle cx="${x}" cy="${y}" r="4.5" class="${cls}"/>`;
}
function timelineChart(depth) {
  const p = up(depth);
  const pts = LIST.filter((g) => g.seg === "desktop" && g.msrp && /^\d{4}-\d{2}/.test(g.launch || "") && !["rumored", "roadmap"].includes(g.status));
  const t = (g) => { const [y, m] = g.launch.split("-").map(Number); return y + (m - 0.5) / 12; };
  const W = 900, H = 460, L = 64, R = 20, T = 16, B = 40;
  const x0 = Math.floor(Math.min(...pts.map(t))), x1 = Math.ceil(Math.max(...pts.map(t)));
  const yTicks = [50, 100, 200, 500, 1000, 2000].filter((v) => v <= niceMax(Math.max(...pts.map((g) => g.msrp))) * 1.2);
  const y0 = Math.log10(Math.min(50, ...pts.map((g) => g.msrp))), y1 = Math.log10(Math.max(...yTicks, ...pts.map((g) => g.msrp)));
  const sx = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R), sy = (v) => T + (1 - (Math.log10(v) - y0) / (y1 - y0)) * (H - T - B);
  const grid = yTicks.map((v) => `<line x1="${L}" x2="${W - R}" y1="${sy(v)}" y2="${sy(v)}" class="grid"/><text x="${L - 8}" y="${sy(v) + 4}" text-anchor="end" class="t3 num">$${fmtInt(v)}</text>`).join("")
    + Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).map((yr) => `<text x="${sx(yr)}" y="${H - B + 20}" text-anchor="middle" class="t3 num">${yr}</text><line x1="${sx(yr)}" x2="${sx(yr)}" y1="${H - B}" y2="${H - B + 5}" class="grid"/>`).join("");
  const marks = BRAND_SERIES.map(([b, c, k]) => pts.filter((g) => g.brand === b).map((g) =>
    `<a href="${p}gpu/${g.id}/${SUF}"><g class="pt"><title>${esc(g.name)} — ${esc(money(g.msrp, "US"))}, ${esc(fmtDate(g.launch))}</title><circle cx="${sx(t(g))}" cy="${sy(g.msrp)}" r="11" class="hit"/>${shape(k, sx(t(g)), sy(g.msrp), "m-" + c)}</g></a>`).join("")).join("");
  const legend = `<div class="viz-legend">${BRAND_SERIES.map(([b, c, k]) => `<span><svg width="14" height="14" viewBox="-7 -7 14 14" aria-hidden="true">${shape(k, 0, 0, "m-" + c)}</svg>${b}</span>`).join("")}</div>`;
  const table = `<details class="viz-table"><summary>Show the data as a table</summary>${tableRows(pts.slice().sort((a, b) => a.launch < b.launch ? -1 : 1), [colModel, colLaunch, colUS], depth)}</details>`;
  return `<figure class="viz">${legend}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="US launch price of desktop graphics cards by launch date and brand, logarithmic price scale"><line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" class="axis"/>${grid}${marks}</svg>
    <figcaption class="sub">Each mark is one desktop card at its official US launch price; the price axis is logarithmic so budget and flagship cards are both readable. Hover a mark for details, or select it to open the spec sheet. Apple chips are not included because Apple does not sell its GPUs separately.</figcaption>${table}</figure>`;
}


// ---------- SEO: head-to-head comparison pages ----------
const memNum = (g) => { const m = g.specs.mem; if (typeof m === "number") return m; const x = String(m || "").match(/(\d+)\s*GB/); return x ? Number(x[1]) : null; };
const VS = (() => {
  const pool = LIST.filter((g) => g.seg === "desktop" && g.msrp && ["current", "previous"].includes(g.status));
  const seen = new Set(), pairs = [];
  const add = (a, b) => { const [x, y] = [a, b].sort((p, q) => (p.brand + p.id < q.brand + q.id ? -1 : 1)); const k = `${x.id}-vs-${y.id}`; if (!seen.has(k)) { seen.add(k); pairs.push({ slug: k, a: x, b: y }); } };
  for (const g of pool.filter((x) => x.status === "current")) {
    // closest-priced current card from each other brand, and the next card up/down in its own family
    for (const b of ["NVIDIA", "AMD", "Intel"].filter((x) => x !== g.brand)) {
      const r = pool.filter((x) => x.brand === b && x.status === "current").sort((p, q) => Math.abs(p.msrp - g.msrp) - Math.abs(q.msrp - g.msrp))[0];
      if (r && Math.abs(r.msrp - g.msrp) / g.msrp <= 0.35) add(g, r);
    }
    const fam = pool.filter((x) => x.series === g.series && x.brand === g.brand && x !== g).sort((p, q) => Math.abs(p.msrp - g.msrp) - Math.abs(q.msrp - g.msrp));
    if (fam[0]) add(g, fam[0]);
    // its predecessor: same brand, previous status, closest price
    const prev = pool.filter((x) => x.brand === g.brand && x.status === "previous").sort((p, q) => Math.abs(p.msrp - g.msrp) - Math.abs(q.msrp - g.msrp))[0];
    if (prev && Math.abs(prev.msrp - g.msrp) / g.msrp <= 0.25) add(g, prev);
  }
  return pairs;
})();
const vsFor = (g) => VS.filter((v) => v.a === g || v.b === g);
const vsName = (v) => `${shortName(v.a.name)} vs ${shortName(v.b.name)}`;

function vsPage(v) {
  const { a, b } = v, depth = 2, p = up(depth), canonical = `${SITE}/compare/${v.slug}/`;
  const link = (x) => `${p}gpu/${x.id}/${SUF}`;
  const keys = [["Architecture", (g) => g.arch], ["Launch", (g) => fmtDate(g.launch)], ["US launch price", (g) => g.msrp ? money(g.msrp, "US") : "—"],
    ...FIELDS.flatMap(([, f]) => f).filter(([k]) => [a, b].some((g) => specVal(g, k) != null && specVal(g, k) !== "")).map(([k, l]) => [l, (g) => { const x = specVal(g, k); return x == null || x === "" ? "—" : fmtField(k, x); }])];
  const rows = keys.map(([l, f]) => { const va = String(f(a)), vb = String(f(b)); const d = va !== vb && va !== "—" && vb !== "—" ? " diff" : ""; return `<tr><th scope="row">${esc(l)}</th><td class="${cls(va)}${d}">${esc(va)}</td><td class="${cls(vb)}${d}">${esc(vb)}</td></tr>`; }).join("");
  const priceRows = COUNTRIES.filter((c) => priceIn(a, c.code) != null || priceIn(b, c.code) != null).map((c) => `<tr><th scope="row">${esc(c.name)}</th><td class="num">${priceCell(a, c.code)}</td><td class="num">${priceCell(b, c.code)}</td></tr>`).join("");
  const facts = [];
  const ma = memNum(a), mb = memNum(b);
  if (a.msrp && b.msrp && a.msrp !== b.msrp) { const [c, e] = a.msrp < b.msrp ? [a, b] : [b, a]; facts.push(`${shortName(c.name)} launched at ${money(c.msrp, "US")} in the US, ${money(e.msrp - c.msrp, "US")} less than the ${shortName(e.name)} (${money(e.msrp, "US")}).`); }
  if (ma && mb && ma !== mb) { const [m, n] = ma > mb ? [a, b] : [b, a]; facts.push(`${shortName(m.name)} has more graphics memory: ${memNum(m)} GB against ${memNum(n)} GB. More memory helps at higher resolutions, with ray tracing and for local AI models.`); }
  if (a.specs.bw && b.specs.bw && a.specs.bw !== b.specs.bw) { const [m, n] = a.specs.bw > b.specs.bw ? [a, b] : [b, a]; facts.push(`${shortName(m.name)} has ${Math.round((m.specs.bw / n.specs.bw - 1) * 100)}% more memory bandwidth (${fmtBw(m.specs.bw)} vs ${fmtBw(n.specs.bw)}).`); }
  if (typeof a.specs.power === "number" && typeof b.specs.power === "number" && a.specs.power !== b.specs.power) { const [m, n] = a.specs.power > b.specs.power ? [a, b] : [b, a]; facts.push(`${shortName(m.name)} is rated for more power: ${m.specs.power} W against ${n.specs.power} W.`); }
  if (a.brand !== b.brand) facts.push(`Core counts are not comparable across brands (${coreLabel(a) || "cores"} vs ${coreLabel(b) || "cores"}), so use the independent reviews below for gaming and application performance.`);
  const rev = (g) => (g.reviews || []).map((r) => `<li class="src"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.outlet)}: ${esc(shortName(g.name))} review</a></li>`).join("");
  const more = VS.filter((x) => x !== v && (x.a === a || x.b === a || x.a === b || x.b === b)).slice(0, 8);
  const title = `${vsName(v)}: specs and price compared`;
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><a href="${dir(p) || "./"}">Database</a> / <a href="${dir(p + "compare/")}">Comparisons</a></nav>
    <div class="page-head"><p class="eyebrow">Head-to-head</p><h1>${esc(a.name)} vs ${esc(b.name)}</h1><div class="meta"><span>Updated ${esc(D.updated)}</span><span>Specifications from official sources</span></div></div>
    <div class="section"><h2>Key differences</h2><ul class="facts">${facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>
    <div class="section"><h2>Specifications</h2><div class="table-wrap"><table class="data vs"><thead><tr><th></th><th><a href="${link(a)}">${esc(a.name)}</a></th><th><a href="${link(b)}">${esc(b.name)}</a></th></tr></thead><tbody>${rows}</tbody></table></div><p class="sub" style="margin-top:8px">Values in bold differ between the two. A dash means the spec does not apply to that brand.</p></div>
    ${priceRows ? `<div class="section"><h2>Launch price by country</h2><div class="table-wrap"><table class="data vs"><thead><tr><th></th><th>${esc(shortName(a.name))}</th><th>${esc(shortName(b.name))}</th></tr></thead><tbody>${priceRows}</tbody></table></div></div>` : ""}
    ${rev(a) || rev(b) ? `<div class="section"><h2>Independent reviews</h2><ul class="plain">${rev(a)}${rev(b)}</ul></div>` : ""}
    <div class="section"><p>Not sure which to pick? Try the <a href="${dir(p + "gpu-finder/")}">GPU finder</a>. Full spec sheets: <a href="${link(a)}">${esc(a.name)}</a> · <a href="${link(b)}">${esc(b.name)}</a>.</p>
    ${more.length ? `<p class="sub">More comparisons: ${more.map((x) => `<a href="${dir(p + "compare/" + x.slug + "/")}">${esc(vsName(x))}</a>`).join(" · ")}</p>` : ""}</div>`;
  return layout({ title: `${title} — GPU Atlas`, desc: `${a.name} vs ${b.name}: side-by-side specifications, memory, bandwidth, power and official launch prices by country, with links to independent reviews.`, canonical, depth, body, og: null, active: "compare",
    jsonld: [{ "@context": "https://schema.org", "@type": "WebPage", name: title, dateModified: BUILD_DATE, url: canonical },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "GPU database", item: `${SITE}/` }, { "@type": "ListItem", position: 2, name: "Comparisons", item: `${SITE}/compare/` }, { "@type": "ListItem", position: 3, name: vsName(v), item: canonical }] }] });
}
function vsIndex() {
  const depth = 1, p = up(depth);
  const byBrand = {}; VS.forEach((v) => { const k = v.a.brand === v.b.brand ? `${v.a.brand} vs ${v.a.brand}` : `${v.a.brand} vs ${v.b.brand}`; (byBrand[k] = byBrand[k] || []).push(v); });
  const body = `<div class="page-head"><p class="eyebrow">Comparisons</p><h1>Graphics card head-to-heads</h1><p class="lead">Side-by-side specifications and launch prices for cards people most often compare: rivals at a similar price, neighbours in the same family, and each card's predecessor. To compare any combination, use the <a href="${dir(p) || "./"}#compare">compare tool</a>.</p></div>
    ${Object.entries(byBrand).map(([k, list]) => `<div class="section"><h2>${esc(k)}</h2><ul class="guide-list">${list.map((v) => `<li><a href="${dir(p + "compare/" + v.slug + "/")}">${esc(vsName(v))}</a><span class="sub">${esc(money(v.a.msrp, "US"))} vs ${esc(money(v.b.msrp, "US"))}</span></li>`).join("")}</ul></div>`).join("")}`;
  return layout({ title: "GPU comparisons: NVIDIA vs AMD vs Intel head-to-heads — GPU Atlas", desc: "Head-to-head comparisons of current graphics cards: specs, memory, power and launch prices side by side.", canonical: `${SITE}/compare/`, depth, body, og: null, active: "compare" });
}

// ---------- SEO: brand hubs ----------
const BRANDS = ["NVIDIA", "AMD", "Intel", "Apple"];
const brandSlug = (b) => b.toLowerCase();
function brandPage(b) {
  const depth = 2, p = up(depth), canonical = `${SITE}/brands/${brandSlug(b)}/`;
  const list = LIST.filter((g) => g.brand === b);
  const segs = [...new Set(list.map((g) => g.seg))];
  const intro = { NVIDIA: "GeForce gaming cards, RTX PRO workstation cards, data-center accelerators, DGX systems and Jetson edge modules.", AMD: "Radeon RX gaming cards, Radeon PRO and Radeon AI PRO workstation cards, Instinct accelerators and Ryzen AI Max processors.", Intel: "Arc desktop graphics cards and Arc Pro workstation cards.", Apple: "M-series chips, whose GPUs are built into the chip and shared with the CPU through unified memory. Apple does not sell GPUs separately." }[b];
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><a href="${dir(p) || "./"}">Database</a> / Brands</nav>
    <div class="page-head"><p class="eyebrow">Brand</p><h1>Every ${esc(b)} GPU: specs and prices</h1><p class="lead">${list.length} ${esc(b)} products in the database: ${esc(intro)}</p><div class="meta">${BRANDS.filter((x) => x !== b).map((x) => `<a href="${dir(p + "brands/" + brandSlug(x) + "/")}">${x}</a>`).join("")}</div></div>
    ${segs.map((sg) => `<div class="section"><h2>${esc(D.SEGMENTS[sg])}</h2>${tableRows(list.filter((g) => g.seg === sg).sort((x, y) => (y.launch || "").localeCompare(x.launch || "") || (y.msrp || 0) - (x.msrp || 0)), [colModel, colLaunch, colMem, colBw, colPower, colUS], depth)}</div>`).join("")}`;
  return layout({ title: `${b} GPU list: every ${b} graphics card and chip with specs & prices — GPU Atlas`, desc: `All ${list.length} ${b} GPUs in GPU Atlas, by segment: launch dates, memory, bandwidth, power and official launch prices.`, canonical, depth, body, og: null, active: "database",
    jsonld: { "@context": "https://schema.org", "@type": "ItemList", name: `${b} GPUs`, numberOfItems: list.length, itemListElement: list.slice(0, 100).map((g, i) => ({ "@type": "ListItem", position: i + 1, url: gpuUrl(g.id), name: g.name })) } });
}


// ---------- GPU finder (interactive buying guide) ----------
function finderPage() {
  const depth = 1, p = up(depth), canonical = `${SITE}/gpu-finder/`;
  const pick = LIST.filter((g) => g.status === "current" && ((g.seg === "desktop" && g.msrp) || (g.seg === "pro" && Object.keys(g.prices || {}).length) || g.brand === "Apple"));
  const data = pick.map((g) => ({
    id: g.id, n: g.name, b: g.brand, seg: g.seg, mem: memNum(g), bw: typeof g.specs.bw === "number" ? g.specs.bw : null,
    w: typeof g.specs.power === "number" ? g.specs.power : null, us: g.msrp || null, pr: g.prices || {},
    st: Object.fromEntries((g.street || []).map((r) => [r.c, [r.v, fmtDate(r.date)]])), rv: (g.reviews || []).slice(0, 3).map((r) => [r.outlet, r.url]),
    gc: g.specs.gcores || null, plat: g.specs.platform || "", u: `${p}gpu/${g.id}/${SUF}`,
    vs: vsFor(g).slice(0, 2).map((v) => [vsName(v), `${p}compare/${v.slug}/${SUF}`])
  }));
  const countries = COUNTRIES.map((c) => ({ c: c.code, n: c.name, sym: money(0, c.code).replace(/0$/, ""), loc: c.cur === "INR" ? "en-IN" : "en-US" }));
  const tile = (v, t, d) => `<button type="button" class="opt" data-v="${v}"><b>${t}</b><span>${d}</span></button>`;
  const step = (n, title, inner, cls = "") => `<li class="step ${cls}"><span class="step-n" aria-hidden="true">${n}</span><div class="step-body"><h2>${title}</h2>${inner}</div></li>`;
  const body = `<div class="finder-hero"><h1>Find the right graphics card</h1>
    <p class="lead">Tell us what you'll do with it and what you can spend. You'll get a shortlist of current cards, the reasons for each, and reviews to read before you buy.</p></div>
  <div class="finder">
    <ol class="steps">
      ${step(1, "What will you use it for?", `<div class="opts" data-k="use">${tile("g1080", "1080p gaming", "High frame rates on a Full HD monitor")}${tile("g1440", "1440p gaming", "The sweet spot for most players")}${tile("g4k", "4K gaming", "Maximum detail on a big screen")}${tile("create", "Editing &amp; 3D", "Video, photo and 3D rendering")}${tile("ai", "Local AI", "Running LLMs and image models yourself")}</div>`)}
      ${step(2, "Which computer is it for?", `<div class="opts two" data-k="plat">${tile("pc", "Windows or Linux PC", "You'll buy a graphics card")}${tile("mac", "Mac", "The GPU comes with the chip you choose")}</div>`)}
      ${step(3, "How much can you spend?", `<div class="fbudget">
          <div class="fbudget-top"><select id="fcc" aria-label="Country">${countries.map((c) => `<option value="${c.c}">${esc(c.n)}</option>`).join("")}</select>
            <output id="fbudout" for="frange" class="fbudget-out">No limit</output></div>
          <input id="frange" type="range" min="0" step="10" aria-label="Budget">
          <div class="fbudget-foot"><span id="ffit" class="sub"></span><label class="sub exact">Exact amount <span class="money-in"><span id="fsym">$</span><input id="fbud" type="number" min="0" inputmode="numeric" placeholder="Any"></span></label></div>
          <label class="check"><input type="checkbox" id="fstreet" checked> Compare with today's street price where we have one</label></div>`, "pc-only")}
      ${step(4, "Any brand preference?", `<div class="seg" data-k="brand"><button type="button" data-v="any">No preference</button><button type="button" data-v="NVIDIA">NVIDIA</button><button type="button" data-v="AMD">AMD</button><button type="button" data-v="Intel">Intel</button></div>`, "pc-only")}
      ${step(5, "What power supply do you have?", `<div class="seg" data-k="psu"><button type="button" data-v="">Not sure</button>${[450, 550, 650, 750, 850, 1000].map((w) => `<button type="button" data-v="${w}">${w} W</button>`).join("")}</div>
          <p class="sub hint">We allow about 250 W for the rest of the PC. Check the card maker's recommended supply before you buy.</p>`, "pc-only")}
    </ol>
    <aside class="shortlist" aria-labelledby="slh"><div class="sl-head"><h2 id="slh">Your shortlist</h2><p id="fsum" class="sub"></p></div><div id="fres" aria-live="polite"></div></aside>
  </div>
  <div class="section finder-method"><h2>How the finder chooses</h2><ul class="facts">
    <li><b>Memory first.</b> We look for at least 8 GB for 1080p, 12 GB for 1440p and editing, and 16 GB for 4K and local AI. Cards with less are flagged, not hidden.</li>
    <li><b>Then the highest tier you can afford.</b> Within a brand's lineup, a higher launch price means a faster card. Across brands we don't claim which is faster, because GPU Atlas doesn't copy benchmarks; each pick links to independent reviews.</li>
    <li><b>No overspending on lower resolutions.</b> Above about $400 at launch for 1080p and $700 for 1440p, a pricier card adds little you would notice at that resolution, so the finder ranks it lower.</li>
    <li><b>Local AI</b> ranks by memory, then memory bandwidth, and includes workstation cards. <b>Editing</b> gives NVIDIA a small lift because more creative apps support CUDA.</li>
    <li><b>Prices</b> are the official launch price in your country, or the dated street price when that box is ticked. Check a retailer before buying.</li></ul></div>
  <script type="application/json" id="fdata">${JSON.stringify({ cards: data, countries }).replace(/</g, "\\u003c")}</script>
  <script>
  (function(){
    var D=JSON.parse(document.getElementById("fdata").textContent), C={}; D.countries.forEach(function(c){C[c.c]=c;});
    var st={use:"g1440",plat:"pc",brand:"any",cc:"US",bud:"",street:true,psu:""};
    try{var h=new URLSearchParams(location.hash.slice(1));h.forEach(function(v,k){if(k in st)st[k]=(k==="street")?v!=="0":v;});}catch(e){}
    var $=function(id){return document.getElementById(id);};
    var NEED={g1080:8,g1440:12,g4k:16,create:12,ai:16}, USE={g1080:"1080p gaming",g1440:"1440p gaming",g4k:"4K gaming",create:"editing and 3D",ai:"local AI"};
    var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches, lastTop=null;
    function fmt(v,cc){var c=C[cc||st.cc];return c.sym+Number(v).toLocaleString(c.loc,{maximumFractionDigits:0});}
    function esc(s){return String(s).replace(/[&<>"]/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m];});}
    function bwTxt(v){return v>=1000?(v/1000).toLocaleString("en-US",{maximumFractionDigits:2})+" TB/s":v+" GB/s";}
    function price(g){var s=st.street&&g.st[st.cc];if(s)return{v:s[0],kind:"Street price, "+s[1]};var l=g.pr[st.cc];return l!=null?{v:l,kind:"Launch price in "+C[st.cc].n}:null;}
    var CAP={g1080:400,g1440:700};
    function tier(us){var c=CAP[st.use];return!c||us<=c?us:c-(us-c)*0.1;}
    function score(g){var m=g.mem||0,sc=st.use==="ai"?m*1000+(g.bw||0):tier(g.us||0)*(st.use==="create"&&g.b==="NVIDIA"?1.15:1);return m<NEED[st.use]?sc*0.5:sc;}
    function pool(){return D.cards.filter(function(g){return g.b!=="Apple"&&(g.seg==="desktop"||(st.use==="ai"&&g.seg==="pro"))&&(st.brand==="any"||g.b===st.brand);});}
    function fitsPsu(g){var psu=Number(st.psu)||0;return!psu||!g.w||g.w+250<=psu;}
    function rangeMax(){var ps=pool().map(price).filter(Boolean).map(function(x){return x.v;});var m=ps.length?Math.max.apply(null,ps):1000;var stepv=st.cc==="IN"||st.cc==="JP"?1000:10;return Math.ceil(m/stepv)*stepv;}
    function meter(label,val,max,mark,txt,bad){var pct=Math.max(2,Math.min(100,val/max*100));return'<div class="meter'+(bad?" bad":"")+'"><span class="m-l">'+label+'</span><span class="m-bar"><i style="width:'+pct+'%"></i>'+(mark!=null?'<em style="left:'+Math.min(100,mark/max*100)+'%"></em>':"")+'</span><span class="m-v">'+txt+'</span></div>';}
    function card(g,rank,pr,extra){
      var need=NEED[st.use],bud=Number(st.bud)||0,psu=Number(st.psu)||0,m=g.mem||0,ms=[];
      if(m)ms.push(meter("Memory",m,Math.max(32,m,need*2),need,m+" GB",m<need));
      if(pr&&bud)ms.push(meter("Budget",pr.v,bud,null,Math.round(pr.v/bud*100)+"% of budget",false));
      if(g.w&&psu)ms.push(meter("Power",g.w+250,psu,null,"~"+(g.w+250)+" of "+psu+" W",g.w+250>psu));
      if(g.bw&&st.use==="ai")ms.push(meter("Bandwidth",g.bw,Math.max(1800,g.bw),null,bwTxt(g.bw),false));
      return'<article class="pick'+(rank===0?" top":"")+'" data-id="'+g.id+'"><div class="pick-head"><div><span class="pick-rank">'+(rank===0?"Best match":"Also consider")+'</span><h3><a href="'+g.u+'">'+esc(g.n)+'</a></h3></div>'
        +(pr?'<div class="pick-price"><b>'+fmt(pr.v)+'</b><span>'+esc(pr.kind)+'</span></div>':"")+'</div>'
        +(ms.length?'<div class="meters">'+ms.join("")+'</div>':"")
        +(m&&m<need?'<p class="pick-warn">'+m+' GB is below the '+need+' GB we suggest for '+USE[st.use]+'.</p>':"")
        +(extra.length?'<ul class="why">'+extra.map(function(w){return"<li>"+w+"</li>";}).join("")+'</ul>':"")
        +'<div class="pick-links"><a href="'+g.u+'">Full specs</a>'+g.vs.map(function(v){return'<a href="'+v[1]+'">'+esc(v[0])+'</a>';}).join("")+(g.rv.length?'<span class="rv">Reviews: '+g.rv.map(function(r){return'<a href="'+r[1]+'" target="_blank" rel="noopener">'+esc(r[0])+'</a>';}).join(", ")+'</span>':"")+'</div></article>';}
    function sync(){
      document.querySelectorAll("[data-k]").forEach(function(c){var k=c.getAttribute("data-k");c.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-v")===String(st[k]));});});
      document.querySelectorAll(".pc-only").forEach(function(f){f.hidden=st.plat==="mac";});
      var mx=rangeMax(),r=$("frange");r.max=mx;r.step=st.cc==="IN"||st.cc==="JP"?1000:10;r.value=st.bud?Math.min(Number(st.bud),mx):mx;
      r.style.setProperty("--fill",(r.value/mx*100)+"%");
      $("fbudout").textContent=st.bud?fmt(st.bud):"No limit";
      $("fcc").value=st.cc;if(document.activeElement!==$("fbud"))$("fbud").value=st.bud;$("fstreet").checked=st.street;$("fsym").textContent=C[st.cc].sym;
      try{history.replaceState(null,"","#"+new URLSearchParams({use:st.use,plat:st.plat,brand:st.brand,cc:st.cc,bud:st.bud,street:st.street?"1":"0",psu:st.psu}).toString());}catch(e){}
      render();}
    function flash(){var t=document.querySelector(".pick.top");if(!t)return;var id=t.getAttribute("data-id");if(id!==lastTop&&lastTop!==null&&!reduce){t.classList.add("flash");}lastTop=id;}
    function render(){
      var out=$("fres"),sum=$("fsum");
      if(st.plat==="mac"){
        var macs=D.cards.filter(function(g){return g.b==="Apple";});
        var pickId={g1080:"apple-m5",g1440:"apple-m5-pro",g4k:"apple-m5-max",create:"apple-m5-max",ai:"apple-m5-ultra"}[st.use];
        var order=macs.filter(function(g){return g.id===pickId;}).concat(macs.filter(function(g){return g.id!==pickId;}).sort(function(a,b){return Math.abs((a.mem||0)-NEED[st.use]*4)-Math.abs((b.mem||0)-NEED[st.use]*4);})).slice(0,3);
        sum.textContent="Mac chips for "+USE[st.use]+". On a Mac you pick the GPU when you pick the chip.";
        out.innerHTML=(st.use.charAt(0)==="g"?'<p class="note">Fewer games run on macOS than on Windows, so check your games first.</p>':"")+order.map(function(g,i){return card(g,i,null,[g.gc+"-core GPU, up to "+g.mem+" GB of unified memory shared with the CPU",bwTxt(g.bw)+" memory bandwidth","In: "+esc(g.plat)]);}).join("");
        flash();return;}
      var bud=Number(st.bud)||0,need=NEED[st.use],P=pool();
      var noPrice=P.filter(function(g){return!price(g);}).length, priced=P.filter(function(g){return price(g);});
      var inBud=priced.filter(function(g){return(!bud||price(g).v<=bud)&&fitsPsu(g);}).sort(function(a,b){return score(b)-score(a)||price(a).v-price(b).v;});
      $("ffit").innerHTML="<b>"+inBud.length+"</b> of "+priced.length+" current cards fit";
      sum.textContent="For "+USE[st.use]+(bud?", up to "+fmt(bud):"")+(st.brand!=="any"?", "+st.brand+" only":"")+(st.psu?", "+st.psu+" W supply":"")+".";
      var notes=[];
      if(noPrice&&st.cc!=="US")notes.push(noPrice+" card"+(noPrice>1?"s have":" has")+" no official "+esc(C[st.cc].n)+" price yet and "+(noPrice>1?"are":"is")+" left out. Choose United States to include them.");
      var top=inBud.slice(0,3);
      if(!top.length){var cheap=priced.slice().sort(function(a,b){return price(a).v-price(b).v;})[0];
        out.innerHTML='<div class="empty"><b>Nothing fits yet.</b><p>No current card comes in under '+fmt(bud)+(st.psu?" on a "+st.psu+" W supply":"")+'.'+(cheap?' The lowest-priced option is the <a href="'+cheap.u+'">'+esc(cheap.n)+'</a> at '+fmt(price(cheap).v)+'. Raise your budget, or try another brand.':"")+'</p></div>';lastTop=null;return;}
      var html=top.map(function(g,i){var pr=price(g),ex=[];
        if(st.use==="create"&&g.b==="NVIDIA")ex.push("CUDA acceleration in Blender, Premiere Pro and DaVinci Resolve.");
        if(st.use==="ai"&&g.bw)ex.push("Bandwidth sets how quickly a model generates text.");
        if(g.w&&!st.psu)ex.push("Rated "+g.w+" W; plan for a "+(Math.ceil((g.w+250)/50)*50)+" W or larger supply.");
        if(g.seg==="pro")ex.push("Workstation card: certified drivers and more memory, at a higher price.");
        return card(g,i,pr,ex);}).join("");
      var t=top[0],upc=priced.filter(function(g){return fitsPsu(g)&&bud&&price(g).v>bud&&price(g).v<=bud*1.25&&score(g)>score(t);}).sort(function(a,b){return price(a).v-price(b).v;})[0];
      if(upc)notes.push('Stretch to '+fmt(price(upc).v)+' and the <a href="'+upc.u+'">'+esc(upc.n)+'</a> is the next step up'+(upc.mem>t.mem?", with "+upc.mem+" GB of memory":"")+'.');
      out.innerHTML=html+notes.map(function(n){return'<p class="note">'+n+'</p>';}).join("");flash();}
    document.querySelectorAll("[data-k]").forEach(function(c){c.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;st[c.getAttribute("data-k")]=b.getAttribute("data-v");sync();});});
    $("fcc").addEventListener("change",function(){st.cc=this.value;st.bud="";sync();});
    $("frange").addEventListener("input",function(){st.bud=Number(this.value)>=Number(this.max)?"":this.value;sync();});
    $("fbud").addEventListener("input",function(){st.bud=this.value;sync();});
    $("fstreet").addEventListener("change",function(){st.street=this.checked;sync();});
    sync();
  })();
  </script>`;
  return layout({ title: "Which graphics card should I buy? GPU finder for 2026 — GPU Atlas", desc: "Answer five quick questions — use, budget in your currency, brand and power supply — and get a shortlist of current NVIDIA, AMD and Intel graphics cards, or the right Apple chip for a Mac.", canonical, depth, body, og: null, active: "finder",
    jsonld: { "@context": "https://schema.org", "@type": "WebApplication", name: "GPU finder", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", url: canonical, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } } });
}

const isCurrentDesktop = (g) => g.seg === "desktop" && ["current"].includes(g.status);
const GUIDES = [
  {
    slug: "graphics-card-launch-prices-over-time",
    title: "Graphics card launch prices over time, 2016–2026",
    short: "Chart of every NVIDIA, AMD and Intel desktop card's US launch price by release date.",
    build() {
      return `<p class="lead">How launch prices have moved across ten years of desktop graphics cards. Flagship prices have climbed steadily while the budget end has stayed roughly flat; for what cards actually sell for in 2026, see the <a href="${dir("../launch-price-vs-street-price-2026/")}">price check</a>.</p><div class="section">${timelineChart(2)}</div>`;
    }
  },
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
const LOGO_URI = "data:image/png;base64," + fs.readFileSync(path.join(ROOT, "assets/brand/logo-light.png")).toString("base64");
function ogSvg(g) {
  const color = BRAND_COLOR[g.brand] || "#0d6b7d";
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
  <image x="80" y="553" width="190" height="35" href="${LOGO_URI}"/>
  <text x="292" y="580" font-family="Inter" font-size="24" fill="#77726b">Spec sheet · prices by country · sources</text>
  <text x="1120" y="580" text-anchor="end" font-family="Inter" font-size="24" fill="#4a4743">${xml(launch)}</text>
</svg>`;
}
function defaultSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f5f6f4"/><rect width="1200" height="12" fill="#0d6b7d"/>
  <image x="80" y="140" width="652" height="120" href="${LOGO_URI}"/>
  <text x="80" y="310" font-family="Inter" font-size="40" fill="#4a4743">NVIDIA, AMD, Intel &amp; Apple GPU reference</text>
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
  html = html.replace(/(href|src)="assets\/([\w-]+\.(?:css|js))"/g, (m, a, f) => `${a}="assets/${f}?v=${ASSET_V}"`);
  if (SUF) html = html.replace('href="guides/"', `href="guides/${SUF}"`).replace('href="gpu-finder/"', `href="gpu-finder/${SUF}"`);
  // crawlable index of every spec sheet
  const groups = BRANDS.map((b) => `<div><h3><a href="brands/${brandSlug(b)}/${SUF}">${b}</a></h3><p>${LIST.filter((g) => g.brand === b).map((g) => `<a href="gpu/${g.id}/${SUF}">${esc(g.name)}</a>`).join(" · ")}</p></div>`).join("");
  const allIndex = `  <section class="container all-index" aria-label="All spec sheets"><h2>All spec sheets</h2>${groups}<p><a href="gpu-finder/${SUF}">GPU finder</a> · <a href="guides/${SUF}">Guides</a> · <a href="compare/${SUF}">Head-to-head comparisons</a> · <a href="architectures/${SUF}">Architectures</a> · <a href="glossary/${SUF}">Glossary</a> · <a href="about/${SUF}">About</a></p><h3>Series</h3><p>${SERIES.map((x) => `<a href="series/${x.slug}/${SUF}">${esc(x.brand === "Apple" ? "Apple " + x.series : x.series)}${x.seg === "laptop" && !/laptop/i.test(x.series) ? " laptop" : ""}</a>`).join(" · ")}</p></section>\n`;
  html = html.replace("  <div class=\"tray\"", allIndex + "  <div class=\"tray\"");
  return html;
}

// ---------- SEO: static architecture, series, glossary, about and VRAM pages ----------
const slug = (x) => String(x).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const archSlug = (name, brand) => slug(name.startsWith(brand) || brand === "Apple" ? name : `${brand} ${name}`);
const ARCH_LIST = D.ARCHS.map((a) => ({ ...a, slug: archSlug(a.name, a.brand), items: LIST.filter((g) => g.arch === a.name && (g.brand === a.brand || (a.brand === "NVIDIA" && g.brand === "NVIDIA"))) })).filter((a) => a.items.length);
const archFor = (g) => ARCH_LIST.find((a) => a.items.includes(g));
const SERIES = (() => { const m = new Map(); LIST.forEach((g) => { const k = `${g.brand}|${g.series}|${g.seg}`; if (!m.has(k)) m.set(k, { brand: g.brand, series: g.series, seg: g.seg, items: [] }); m.get(k).items.push(g); });
  const out = [...m.values()].filter((x) => x.items.length >= 2); const used = new Set();
  out.forEach((x) => { let sl = slug(`${x.series.toLowerCase().startsWith(x.brand.toLowerCase()) ? "" : x.brand + " "}${x.series}${["laptop"].includes(x.seg) && !/laptop/i.test(x.series) ? " laptop" : ""}`); while (used.has(sl)) sl += "-" + x.seg; used.add(sl); x.slug = sl; }); return out; })();
const seriesFor = (g) => SERIES.find((x) => x.items.includes(g));
const crumbsLd = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: u })) });

function seriesPage(x) {
  const depth = 2, p = up(depth), canonical = `${SITE}/series/${x.slug}/`;
  const items = x.items.slice().sort((a, b) => (b.msrp || 0) - (a.msrp || 0) || (b.launch || "").localeCompare(a.launch || ""));
  const dates = items.map((g) => g.launch).filter((d) => /^\d{4}/.test(d || "")).sort();
  const prices = items.map((g) => g.msrp).filter(Boolean);
  const mems = items.map(memNum).filter(Boolean);
  const name = x.brand === "Apple" ? `Apple ${x.series} chips` : `${x.brand} ${x.series.replace(new RegExp("^" + x.brand + " ", "i"), "")} ${D.SEGMENTS[x.seg].toLowerCase()}`;
  const lead = `The ${name} family has ${items.length} models${dates.length ? `, launched ${fmtDate(dates[0])}${dates.length > 1 && dates[0] !== dates[dates.length - 1] ? ` to ${fmtDate(dates[dates.length - 1])}` : ""}` : ""}${prices.length > 1 ? `, at US launch prices from ${money(Math.min(...prices), "US")} to ${money(Math.max(...prices), "US")}` : ""}${mems.length > 1 && Math.min(...mems) !== Math.max(...mems) ? `, with ${Math.min(...mems)} GB to ${Math.max(...mems)} GB of memory` : ""}.`;
  const arch = archFor(items[0]);
  const link = (g) => `${p}gpu/${g.id}/${SUF}`;
  const ladder = items[0].msrp ? ladderChart(items.find((g) => g.msrp), link).replace(/<h3>Price ladder:[^<]*<\/h3>/, "<h3>US launch prices</h3>").replace(/class="m-hi"/g, 'class="m-s1"').replace(/class="t1 b"/g, 'class="t1"').replace(/<g class="row">/, '<a href="' + link(items.find((g) => g.msrp)) + '"><g class="row">').replace(/(<\/g>)(<a href|<\/svg>)/, "$1</a>$2").replace('<figure class="viz">', '<figure class="viz" style="max-width:760px">') : "";
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><a href="${dir(p) || "./"}">Database</a> / <a href="${dir(p + "brands/" + brandSlug(x.brand) + "/")}">${esc(x.brand)}</a> / Series</nav>
    <div class="page-head"><h1>${esc(name)}: every model compared</h1><p class="lead">${esc(lead)}${arch ? ` Architecture: <a href="${dir(p + "architectures/" + arch.slug + "/")}">${esc(arch.name)}</a>.` : ""}</p></div>
    <div class="section">${tableRows(items, [colModel, colLaunch, colCores, colMem, colBw, colPower, colUS], depth)}</div>
    ${ladder ? `<div class="section">${ladder}</div>` : ""}
    <p class="sub">Not sure which to buy? Try the <a href="${dir(p + "gpu-finder/")}">GPU finder</a>.</p>`;
  return layout({ title: `${name}: specs and prices of all ${items.length} models — GPU Atlas`, desc: `${lead} Compare specs, memory, power and launch prices side by side.`, canonical, depth, body, og: null, active: "database",
    jsonld: [{ "@context": "https://schema.org", "@type": "ItemList", name, numberOfItems: items.length, itemListElement: items.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: gpuUrl(g.id), name: g.name })) },
      crumbsLd([["GPU database", `${SITE}/`], [x.brand, `${SITE}/brands/${brandSlug(x.brand)}/`], [name, canonical]])] });
}

function archPage(a) {
  const depth = 2, p = up(depth), canonical = `${SITE}/architectures/${a.slug}/`;
  const items = a.items.slice().sort((x, y) => (y.launch || "").localeCompare(x.launch || "") || (y.msrp || 0) - (x.msrp || 0));
  const segs = [...new Set(items.map((g) => g.seg))];
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><a href="${dir(p) || "./"}">Database</a> / <a href="${dir(p + "architectures/")}">Architectures</a></nav>
    <div class="page-head"><h1>${esc(a.brand === "Apple" || a.name.startsWith(a.brand) ? a.name : a.brand + " " + a.name)} architecture</h1>
    <p class="lead">${esc(a.key)}</p>
    <dl class="arch-facts"><div><dt>Introduced</dt><dd>${esc(a.year)}</dd></div><div><dt>Process</dt><dd>${esc(a.process)}</dd></div>${a.namesake && a.namesake !== "—" ? `<div><dt>Named after</dt><dd>${esc(a.namesake)}</dd></div>` : ""}<div><dt>Products in database</dt><dd>${items.length}</dd></div></dl></div>
    ${segs.map((sg) => `<div class="section"><h2>${esc(D.SEGMENTS[sg])}</h2>${tableRows(items.filter((g) => g.seg === sg), [colModel, colLaunch, colCores, colMem, colBw, colPower, colUS], depth)}</div>`).join("")}`;
  const title = `${a.brand === "Apple" || a.name.startsWith(a.brand) ? a.name : a.brand + " " + a.name} architecture: GPUs, specs and launch dates`;
  return layout({ title: `${title} — GPU Atlas`, desc: `${a.key} All ${items.length} ${a.name} products with specifications and launch prices.`, canonical, depth, body, og: null, active: "architectures",
    jsonld: crumbsLd([["GPU database", `${SITE}/`], ["Architectures", `${SITE}/architectures/`], [a.name, canonical]]) });
}
function archIndex() {
  const depth = 1, p = up(depth);
  const brands = [...new Set(ARCH_LIST.map((a) => a.brand))];
  const body = `<div class="page-head"><h1>GPU architectures</h1><p class="lead">Every GPU architecture in the database, newest first, with what changed in each generation.</p></div>
    ${brands.map((b) => `<div class="section"><h2>${esc(b)}</h2><ul class="guide-list">${ARCH_LIST.filter((a) => a.brand === b).sort((x, y) => String(y.year).localeCompare(String(x.year))).map((a) => `<li><a href="${dir(p + "architectures/" + a.slug + "/")}">${esc(a.name)}</a><span class="sub">${esc(a.year)} · ${esc(a.process)} · ${a.items.length} products. ${esc(a.key)}</span></li>`).join("")}</ul></div>`).join("")}`;
  return layout({ title: "GPU architectures: NVIDIA, AMD, Intel and Apple generations — GPU Atlas", desc: "NVIDIA Blackwell, Ada and Ampere, AMD RDNA and CDNA, Intel Xe and Apple M-series GPU architectures, with every product in each.", canonical: `${SITE}/architectures/`, depth, body, og: null, active: "architectures" });
}

function glossaryPage() {
  const depth = 1;
  const items = D.GLOSSARY.map(([t, d]) => ({ t, d, id: slug(t) }));
  const body = `<div class="page-head"><h1>GPU glossary</h1><p class="lead">Plain-language definitions of the terms used on spec sheets, from CUDA cores and Infinity Cache to memory bandwidth and TOPS.</p></div>
    <nav class="toc">${items.map((x) => `<a href="#${x.id}">${esc(x.t)}</a>`).join("")}</nav>
    <dl class="glossary">${items.map((x) => `<div id="${x.id}"><dt>${esc(x.t)}</dt><dd>${esc(x.d)}</dd></div>`).join("")}</dl>`;
  return layout({ title: "GPU glossary: CUDA cores, Tensor Cores, VRAM, bandwidth and more — GPU Atlas", desc: "What GPU spec-sheet terms mean: CUDA cores, stream processors, Tensor Cores, RT cores, Infinity Cache, memory bandwidth, TOPS and more.", canonical: `${SITE}/glossary/`, depth, body, og: null, active: "glossary",
    jsonld: { "@context": "https://schema.org", "@type": "DefinedTermSet", name: "GPU glossary", hasDefinedTerm: items.map((x) => ({ "@type": "DefinedTerm", name: x.t, description: x.d, url: `${SITE}/glossary/#${x.id}` })) } });
}

function aboutPage() {
  const depth = 1, p = up(depth);
  const nSrc = Object.values(D.SOURCES).filter((x) => x.u).length, nChecked = LIST.filter((g) => g.checked).length;
  const body = `<div class="page-head"><h1>About GPU Atlas</h1><p class="lead">GPU Atlas is an independent reference for graphics processors: what each one is, what it cost at launch in your country, and what it sells for now.</p></div>
    <div class="prose">
    <h2>Who runs it</h2><p>GPU Atlas was founded by Gaurav Kumar in India. It is not owned, funded or sponsored by NVIDIA, AMD, Intel, Apple or any retailer. If that ever changes, it will be stated on this page and on any affected page.</p>
    <h2>Where the numbers come from</h2><p>Specifications come from manufacturers' own spec pages, datasheets and press releases wherever they exist, and from named reviews or launch coverage when the official page is gone. Each spec sheet lists its sources and the date its figures were last checked; ${nChecked} of ${LIST.length} products have been checked against a source, and the site links to ${nSrc} sources in all.</p>
    <h2>Prices</h2><p>Launch prices are the official prices a manufacturer announced for a country; we never convert currencies. Street prices are dated snapshots of the lowest new-card price reported by a named tracker and are refreshed monthly. Apple does not sell its GPUs separately, so Apple chips have no price.</p>
    <h2>Performance</h2><p>GPU Atlas does not run benchmarks or copy other sites' benchmark results. Spec sheets link to independent reviews instead, and the <a href="${dir(p + "gpu-finder/")}">GPU finder</a> explains exactly how it ranks cards.</p>
    <h2>Corrections</h2><p>Every spec sheet has a "Report an error" link that opens a public issue on <a href="${esc(D.REPO)}/issues" rel="noopener">GitHub</a>. Corrections are made as soon as they are confirmed against a source, and the change history is public in the <a href="${esc(D.REPO)}/commits/main" rel="noopener">repository</a>.</p>
    </div>`;
  return layout({ title: "About GPU Atlas: independent sources, prices and corrections — GPU Atlas", desc: "Who runs GPU Atlas, where its specifications and prices come from, how street prices are tracked, and how to report an error.", canonical: `${SITE}/about/`, depth, body, og: null, active: "methodology",
    jsonld: { "@context": "https://schema.org", "@type": "AboutPage", url: `${SITE}/about/`, name: "About GPU Atlas", publisher: { "@type": "Organization", name: "GPU Atlas", url: `${SITE}/`, logo: `${SITE}/assets/brand/icon-512.png`, founder: { "@type": "Person", name: "Gaurav Kumar" } } } });
}

// LLM memory guide: weights + ~20% for context cache and runtime (rule of thumb, stated on the page)
const LLM_SIZES = [[3, "3B"], [8, "7–8B"], [14, "13–14B"], [32, "27–32B"], [70, "70B"], [120, "~120B"], [405, "405B"]];
const LLM_FORMATS = [["4-bit (Q4)", 0.56], ["8-bit", 1.06], ["16-bit (FP16/BF16)", 2.0]];
const llmGB = (b, bytes) => Math.ceil(b * bytes * 1.2);
function vramCards(minGB) {
  const pool = LIST.filter((g) => g.status === "current" && ["desktop", "pro", "systems"].includes(g.seg) && !/laptop/i.test(g.name) && memNum(g) && memNum(g) >= minGB).sort((a, b) => memNum(a) - memNum(b) || (a.msrp || 1e9) - (b.msrp || 1e9));
  return pool.slice(0, 4);
}
GUIDES.push({
  slug: "how-much-vram-do-i-need",
  title: "How much VRAM do you need in 2026? Gaming, editing and AI",
  short: "Graphics memory needed for 1080p, 1440p and 4K gaming, video editing and local AI, with current cards at each level.",
  build() {
    const tier = (gb, label, why) => { const c = LIST.filter((g) => g.status === "current" && g.seg === "desktop" && memNum(g) === gb && g.msrp).sort((a, b) => a.msrp - b.msrp);
      return `<tr><td><b>${gb} GB</b></td><td style="white-space:normal">${label}</td><td style="white-space:normal" class="sub">${why}</td><td style="white-space:normal">${c.slice(0, 4).map((g) => `<a href="../../gpu/${g.id}/${SUF}">${esc(shortName(g.name))}</a>`).join(", ") || "—"}</td></tr>`; };
    return `<p class="lead">Graphics memory (VRAM) holds textures, the frame being drawn and, for AI, the model itself. Running out causes stutter in games and stops AI models from loading at all, so it is the first spec to check.</p>
      <div class="section"><h2>Quick answer</h2><div class="table-wrap"><table class="data"><thead><tr><th>Memory</th><th>Good for</th><th>Why</th><th>Current cards</th></tr></thead><tbody>
      ${tier(8, "1080p gaming at medium to high settings; esports", "Several 2025–26 games exceed 8 GB at high settings, causing stutter or blurry textures.")}
      ${tier(12, "1080p maxed out and 1440p gaming; photo and 1080p video editing", "Comfortable headroom at 1440p today; ray tracing and frame generation add to memory use.")}
      ${tier(16, "1440p with ray tracing, 4K gaming, 4K video editing, small AI models", "The safe choice for a card you want to keep for several years.")}
      ${tier(24, "4K with everything on, 3D rendering, 13–30B AI models", "Mostly previous-generation flagships and workstation cards.")}
      ${tier(32, "8K video, large 3D scenes, 30B+ AI models at higher quality", "Flagship and workstation territory.")}
      </tbody></table></div></div>
      <div class="section"><h2>Running AI models locally</h2><p>For local language models, memory decides which model you can run. See the <a href="../vram-for-local-llms/${SUF}">VRAM guide for local LLMs</a> for model-by-model numbers.</p></div>
      <div class="section"><h2>Find a card</h2><p>The <a href="../../gpu-finder/${SUF}">GPU finder</a> applies these memory levels automatically and flags cards that fall short.</p></div>`;
  }
});
GUIDES.push({
  slug: "vram-for-local-llms",
  title: "How much VRAM do you need to run LLMs locally?",
  short: "Estimated GPU memory for 3B to 405B language models at 4-bit, 8-bit and 16-bit precision, with current GPUs and Macs that fit.",
  build() {
    const head = `<tr><th>Model size</th>${LLM_FORMATS.map(([f]) => `<th>${f}</th>`).join("")}</tr>`;
    const rows = LLM_SIZES.map(([b, l]) => `<tr><td><b>${l}</b></td>${LLM_FORMATS.map(([, by]) => `<td class="num">~${llmGB(b, by)} GB</td>`).join("")}</tr>`).join("");
    const fit = LLM_SIZES.slice(0, 6).map(([b, l]) => { const need = llmGB(b, 0.56); const c = vramCards(need);
      return `<tr><td><b>${l}</b> at 4-bit</td><td class="num">~${need} GB</td><td style="white-space:normal">${c.map((g) => `<a href="../../gpu/${g.id}/${SUF}">${esc(shortName(g.name))}</a> <span class="sub">${memNum(g)} GB</span>`).join(", ") || "Multiple GPUs or a server"}</td></tr>`; }).join("");
    return `<p class="lead">A language model has to fit in memory to run at full speed. The rule of thumb: <b>memory ≈ parameters × bytes per parameter, plus about 20%</b> for the context cache and runtime. Longer contexts need more.</p>
      <div class="section"><h2>Estimated memory by model size</h2><div class="table-wrap"><table class="data"><thead>${head}</thead><tbody>${rows}</tbody></table></div>
      <p class="sub" style="margin-top:8px">Estimates: 4-bit uses about 0.56 bytes per parameter (typical Q4 formats), 8-bit about 1.06, 16-bit 2. Mixture-of-experts models must still fit all their parameters in memory, even though only some are active per token.</p></div>
      <div class="section"><h2>Current GPUs and Macs that fit</h2><div class="table-wrap"><table class="data"><thead><tr><th>Model</th><th>Needs</th><th>Smallest current options</th></tr></thead><tbody>${fit}</tbody></table></div>
      <p class="sub" style="margin-top:8px">Apple Macs share one pool of unified memory between CPU and GPU, so a large share of it is available to models; leave room for the system. Memory bandwidth decides how fast text is generated: compare it on each spec sheet.</p></div>
      <div class="section"><p>Want a shortlist for your budget? Choose "Local AI" in the <a href="../../gpu-finder/${SUF}">GPU finder</a>.</p></div>`;
  }
});

// Visible FAQ for each spec sheet (answers built only from the data on the page)
function faqFor(g) {
  const q = [], s = g.specs, nm = g.name, mem = memText(g);
  if (mem) q.push([`How much memory does the ${nm} have?`, `The ${nm} has ${mem}${typeof s.mem === "number" && s.memType ? ` of ${s.memType.split(" (")[0]}` : ""}${s.bus ? ` on a ${s.bus}-bit bus` : ""}${typeof s.bw === "number" ? `, giving ${fmtBw(s.bw)} of bandwidth` : ""}.`]);
  if (priceIn(g, "IN") != null) q.push([`What is the ${nm} price in India?`, `The official launch price in India was ${money(priceIn(g, "IN"), "IN")}. Retail prices change; check a current listing before buying.`]);
  if (g.msrp) { const others = COUNTRIES.filter((c) => c.code !== "US" && priceIn(g, c.code) != null).map((c) => `${money(priceIn(g, c.code), c.code)} in ${c.name}`);
    q.push([`What was the ${nm} launch price?`, `${money(g.msrp, "US")} in the United States${others.length ? `, ${others.slice(0, 4).join(", ")}` : ""}.`]); }
  const us = (g.street || []).find((r) => r.c === "US");
  if (us) q.push([`How much does the ${nm} cost now?`, `The lowest new price reported on ${fmtDate(us.date)} was ${money(us.v, "US")} in the US${g.msrp ? `, ${pct(us.v, g.msrp) > 0 ? "+" : ""}${pct(us.v, g.msrp)}% from launch` : ""}.`]);
  if (typeof s.power === "number" && g.seg === "desktop") q.push([`What power supply do I need for the ${nm}?`, `The ${nm} is rated at ${s.power} W. As a rule of thumb, allow about 250 W for the rest of the PC, so a ${Math.ceil((s.power + 250) / 50) * 50} W or larger supply; follow the card maker's recommendation for your specific model.`]);
  if (g.launch && /^\d{4}/.test(g.launch)) q.push([`When was the ${nm} released?`, `${fmtDate(g.launch)}.`]);
  return q.slice(0, 5);
}

// ---------- build ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
fs.copyFileSync(path.join(ROOT, "assets/brand/favicon.ico"), path.join(OUT, "favicon.ico"));
// Site-ownership files (Google Search Console, Bing) dropped in the repo root are published as-is.
for (const f of fs.readdirSync(ROOT)) if (/^google[0-9a-f]+\.html$|^BingSiteAuth\.xml$|^yandex_[0-9a-f]+\.html$/.test(f)) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
const pngs = process.env.SKIP_IMAGES ? 0 : renderPngs();
write("index.html", indexHtml());
for (const g of LIST) write(`gpu/${g.id}/index.html`, productPage(g));
write("gpu/index.html", `<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../${SUF}"><link rel="canonical" href="${SITE}/"><title>GPU Atlas</title><a href="../${SUF}">GPU database</a>`);
write("guides/index.html", guidesIndex());
write("compare/index.html", vsIndex());
for (const v of VS) write(`compare/${v.slug}/index.html`, vsPage(v));
for (const b of BRANDS) write(`brands/${brandSlug(b)}/index.html`, brandPage(b));
write("gpu-finder/index.html", finderPage());
write("architectures/index.html", archIndex());
for (const a of ARCH_LIST) write(`architectures/${a.slug}/index.html`, archPage(a));
for (const x of SERIES) write(`series/${x.slug}/index.html`, seriesPage(x));
write("glossary/index.html", glossaryPage());
write("about/index.html", aboutPage());
write(`${INDEXNOW_KEY}.txt`, INDEXNOW_KEY);
for (const gd of GUIDES) write(`guides/${gd.slug}/index.html`, guidePage(gd));
write("404.html", layout({ title: "Page not found — GPU Atlas", desc: "This page does not exist.", canonical: `${SITE}/`, depth: 0, body: `<div class="page-head"><h1>Page not found</h1><p class="lead">That page doesn't exist. Try the <a href="${SITE}/">GPU database</a> or the <a href="${SITE}/guides/">guides</a>.</p></div>`, active: "" })
  .replace(/href="assets\//g, `href="${SITE}/assets/`).replace(/href="\.\/"/g, `href="${SITE}/"`).replace(/href="#/g, `href="${SITE}/#`).replace(/href="guides\//g, `href="${SITE}/guides/`));

const urls = [
  { loc: `${SITE}/`, lastmod: BUILD_DATE, pr: "1.0" },
  { loc: `${SITE}/guides/`, lastmod: BUILD_DATE, pr: "0.8" },
  ...GUIDES.map((g) => ({ loc: `${SITE}/guides/${g.slug}/`, lastmod: BUILD_DATE, pr: "0.8" })),
  { loc: `${SITE}/gpu-finder/`, lastmod: BUILD_DATE, pr: "0.9" },
  { loc: `${SITE}/compare/`, lastmod: BUILD_DATE, pr: "0.7" },
  ...VS.map((v) => ({ loc: `${SITE}/compare/${v.slug}/`, lastmod: BUILD_DATE, pr: "0.7" })),
  ...BRANDS.map((b) => ({ loc: `${SITE}/brands/${brandSlug(b)}/`, lastmod: BUILD_DATE, pr: "0.8" })),
  { loc: `${SITE}/architectures/`, lastmod: BUILD_DATE, pr: "0.6" },
  ...ARCH_LIST.map((a) => ({ loc: `${SITE}/architectures/${a.slug}/`, lastmod: BUILD_DATE, pr: "0.6" })),
  ...SERIES.map((x) => ({ loc: `${SITE}/series/${x.slug}/`, lastmod: BUILD_DATE, pr: "0.7" })),
  { loc: `${SITE}/glossary/`, lastmod: BUILD_DATE, pr: "0.5" },
  { loc: `${SITE}/about/`, lastmod: BUILD_DATE, pr: "0.5" },
  ...LIST.map((g) => ({ loc: gpuUrl(g.id), lastmod: g.checked || BUILD_DATE, pr: g.status === "current" ? "0.9" : "0.6" }))
];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${xml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pr}</priority></url>`).join("\n")}\n</urlset>\n`);
write("CNAME", SITE.replace(/^https?:\/\//, "") + "\n");
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Built ${LIST.length} product pages, ${GUIDES.length} guides, ${VS.length} comparisons, ${BRANDS.length} brand pages, ${SERIES.length} series, ${ARCH_LIST.length} architectures, GPU finder, ${pngs} preview images, ${urls.length} sitemap URLs → dist/ (site: ${SITE}${SUF ? `, link suffix "${SUF}"` : ""})`);
