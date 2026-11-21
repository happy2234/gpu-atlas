/* GPU Atlas — corrections, Intel Arc, extra regional prices, street prices and verification dates.
 * Loaded last. Keep edits here small and dated so the history is easy to follow.
 */
(function () {
  const D = window.GPU_ATLAS;
  const L = D.list;
  const byId = (id) => L.find((g) => g.id === id);

  Object.assign(D.SOURCES, {
    "nv-compare": { t: "NVIDIA — Compare GeForce graphics cards (RTX 50, 40, 30, 20, GTX 16)", u: "https://www.nvidia.com/en-us/geforce/graphics-cards/compare" },
    "nv-10compare": { t: "NVIDIA — Compare 10 Series GPUs", u: "https://www.nvidia.com/en-sg/geforce/products/10series/compare/" },
    "amd-6000qrg": { t: "AMD — Radeon RX 6000 Series quick reference", u: "https://www.amd.com/content/dam/amd/en/documents/partner-hub/radeon/amd-radeon-rx-6000-series-quick-reference-competitive.pdf" },
    "amd-7800xt": { t: "AMD — Radeon RX 7800 XT specifications", u: "https://amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7800-xt.html" },
    "amd-7600": { t: "AMD — Radeon RX 7600 partner brief", u: "https://www.amd.com/content/dam/amd/en/documents/partner-hub/radeon/amd-radeon-rx-7600-how-to-sell-non-comp.pdf" },
    "amd-7000m": { t: "AMD — Radeon RX 7000 Series laptops quick reference", u: "https://www.amd.com/content/dam/amd/en/documents/partner-hub/radeon/amd-radeon-rx-7000-series-laptops-quick-reference.pdf" },
    "intel-b580": { t: "Intel — Arc B580 specifications", u: "https://www.intel.com/content/www/us/en/products/sku/241598/specifications.html" },
    "th-b580": { t: "Tom's Hardware — Arc B580 and B570 announced", u: "https://tomshardware.com/pc-components/gpus/intel-announces-the-arc-b580-and-arc-b570-gpus" },
    "kg-b570": { t: "KitGuru — Arc B570 review (Arc spec table)", u: "https://www.kitguru.net/components/graphic-cards/dominic-moass/intel-arc-b570-review-ft-asrock/" },
    "ts-b70": { t: "TechSpot — Arc Pro B70 review", u: "https://www.techspot.com/review/3141-intel-arc-b70-pro/?rand=98523" },
    "fps-b70": { t: "The FPS Review — Arc Pro B70 and B65 launched", u: "https://www.thefpsreview.com/?p=149296" },
    "onmsft-b70": { t: "OnMSFT — Arc Pro B70 and B65 details", u: "https://onmsft.com/?p=58199" },
    "th-b50": { t: "Tom's Hardware — Arc Pro B50 and B60 launched", u: "https://www.tomshardware.com/pc-components/gpus/intel-launches-usd299-arc-pro-b50-with-16gb-of-memory-project-battlematrix-workstations-with-24gb-arc-pro-b60-gpus" },
    "eve-b770": { t: "Evetech — what happened to the Arc B770", u: "https://www.evetech.co.za/intel-arc-b770-south-africa/x/3357" },
    "tt-b770": { t: "TweakTown — partners confirm no Arc B770", u: "https://www.tweaktown.com/news/109721/intel-partners-confirm-that-there-still-no-arc-b770-big-battlemage-gpu/index.html" },
    // prices
    "p-5060-in": { t: "FoneArena — RTX 5060 and 5060 Ti India prices", u: "https://www.fonearena.com/blog/451376/nvidia-geforce-rtx-5060-5060-ti-price-india-features.html" },
    "p-5050-eu": { t: "Notebookcheck — RTX 5050 German RRP €259", u: "https://www.notebookcheck.net/Nvidia-confirms-overpriced-GeForce-RTX-5050-for-the-EU.1046386.0.html" },
    "p-9060xt-uk": { t: "OC3D — RX 9060 XT UK MSRPs", u: "https://overclock3d.net/news/gpu-displays/is-amds-msrp-real-amd-rx-9060-xt-pricing-rundown/" },
    "s-pcg": { t: "PC Gamer — Graphics card price watch (retrieved 21 Nov 2026)", u: "https://www.pcgamer.com/cheap-graphics-card-deals-today-uk" },
    "s-th": { t: "Tech Insider — Tom's Hardware GPU price tracker snapshot (3 Nov 2026)", u: "https://tech-insider.org/?p=52610" },
    "s-au": { t: "Glukhov — RTX 5090 and 5080 prices in Australia (29 Oct 2026)", u: "https://www.glukhov.org/ko/hardware/gpu/rtx-5090-price-australia/" },
    "s-ca": { t: "GPU Prix — RTX 5090 price history in Canada (22 Oct 2026)", u: "https://gpuprix.com/gpus/geforce-rtx-5090?show=listings" },
    "s-jp": { t: "BornCity — RTX 5090 prices in Japan (mid-November 2026)", u: "https://borncity.com/news/rtx-5090-in-japan-preis-faellt-um-22-prozent-unter-die-million-yen-marke/" }
  });

  // ---------- Corrections from the official NVIDIA comparison table ----------
  const fix = (id, specs, extra) => { const g = byId(id); if (!g) return; Object.assign(g.specs, specs); if (extra) Object.assign(g, extra); };
  fix("rtx-2080-ti", { boost: 1635, power: 260 }, { priceNote: "Founders Edition: $1,199. NVIDIA lists Founders Edition clocks and power; reference partner cards: 1,545 MHz boost, 250 W, $999." });
  fix("rtx-2080", { boost: 1800, power: 225 }, { priceNote: "Founders Edition: $799. NVIDIA lists Founders Edition clocks and power; reference partner cards: 1,710 MHz boost, 215 W, $699." });
  fix("rtx-2070", { boost: 1710, power: 185 }, { priceNote: "Founders Edition: $599. NVIDIA lists Founders Edition clocks and power; reference partner cards: 1,620 MHz boost, 175 W, $499." });
  const g3050 = byId("rtx-3050"); if (g3050) (g3050.variants = g3050.variants || []).push({ name: "RTX 3050 (OEM)", diff: "Pre-built version with 2,304 CUDA cores, 1,510 MHz base and 1,760 MHz boost." });
  const g1650 = byId("gtx-1650"); if (g1650) (g1650.variants = g1650.variants || []).push({ name: "GTX 1650 (GDDR6)", diff: "Later version with GDDR6: 1,410 MHz base, 1,590 MHz boost." });
  fix("rx-7900m", { powerRange: "130–180 W" });

  // GTX 1630 was missing
  const i1650 = L.indexOf(g1650);
  L.splice(i1650 + 1, 0, {
    id: "gtx-1630", name: "GeForce GTX 1630", seg: "desktop", series: "GTX 16", arch: "Turing", status: "legacy", launch: "2022-06", msrp: null, brand: "NVIDIA",
    specs: { chip: "TU117", process: "TSMC 12FFN", cuda: 512, base: 1740, boost: 1785, mem: 4, memType: "GDDR6", bus: 64, speed: 12, bw: 96, power: 75, pcie: "PCIe 3.0 ×16", noRT: true },
    summary: "Entry Turing card with a 64-bit bus, released in 2022 with no NVIDIA MSRP.", sources: ["nv-compare"], prices: {}
  });

  // ---------- Intel Arc ----------
  const bmg21 = { process: "TSMC N5", transistors: 19.6, die: 272 };
  const acm10 = { process: "TSMC N6", transistors: 21.7, die: 406 };
  function intel(o) { o.brand = "Intel"; o.prices = o.msrp ? { US: o.msrp } : {}; L.push(o); return o; }
  intel({ id: "arc-b770", name: "Intel Arc B770 (unconfirmed)", seg: "desktop", series: "Arc B", arch: "Xe2 (Battlemage)", status: "rumored", launch: "Not announced", msrp: null,
    specs: { chip: "BMG-G31 (reported)" }, summary: "A gaming card on the larger BMG-G31 chip was widely reported but never launched. The chip shipped instead in the Arc Pro B70 and B65 workstation cards in 2026.",
    variants: [{ name: "Reported specification", diff: "32 Xe2 cores, 16 GB GDDR6 on a 256-bit bus, ~300 W." }], sources: ["eve-b770", "tt-b770"] });
  intel({ id: "arc-b580", name: "Intel Arc B580", seg: "desktop", series: "Arc B", arch: "Xe2 (Battlemage)", status: "current", launch: "2024-12-12", msrp: 249,
    specs: Object.assign({ chip: "BMG-G21" }, bmg21, { xe: 20, shaders: 2560, xmx: 160, rtu: 20, gclk: 2670, mem: 12, memType: "GDDR6", bus: 192, speed: 19, bw: 456, power: 190, pcie: "PCIe 4.0 ×8", ai: 233 }),
    summary: "Intel's second-generation gaming card: 12 GB for $249, aimed at 1080p and 1440p. Intel's AI figure is INT8 TOPS.", sources: ["intel-b580", "th-b580"] });
  intel({ id: "arc-b570", name: "Intel Arc B570", seg: "desktop", series: "Arc B", arch: "Xe2 (Battlemage)", status: "current", launch: "2025-01-16", msrp: 219,
    specs: Object.assign({ chip: "BMG-G21" }, bmg21, { xe: 18, shaders: 2304, xmx: 144, rtu: 18, gclk: 2500, mem: 10, memType: "GDDR6", bus: 160, speed: 19, bw: 380, power: 150, pcie: "PCIe 4.0 ×8", ai: 203 }),
    summary: "Cut-down B580 with 10 GB.", sources: ["th-b580", "kg-b570"] });
  intel({ id: "arc-a770", name: "Intel Arc A770", seg: "desktop", series: "Arc A", arch: "Xe-HPG (Alchemist)", status: "previous", launch: "2022-10-12", msrp: 349,
    specs: Object.assign({ chip: "ACM-G10" }, acm10, { xe: 32, shaders: 4096, xmx: 512, rtu: 32, gclk: 2100, mem: 16, memType: "GDDR6", bus: 256, speed: 17.5, bw: 560, power: 225, pcie: "PCIe 4.0 ×16" }),
    summary: "Intel's first-generation flagship.", variants: [{ name: "Arc A770 8 GB", diff: "8 GB at 16 Gbps (512 GB/s); launched at $329." }], priceNote: "16 GB Limited Edition.", sources: ["kg-b570"] });
  intel({ id: "arc-a750", name: "Intel Arc A750", seg: "desktop", series: "Arc A", arch: "Xe-HPG (Alchemist)", status: "previous", launch: "2022-10-12", msrp: 289,
    specs: Object.assign({ chip: "ACM-G10" }, acm10, { xe: 28, shaders: 3584, xmx: 448, rtu: 28, gclk: 2050, mem: 8, memType: "GDDR6", bus: 256, speed: 16, bw: 512, power: 225, pcie: "PCIe 4.0 ×16" }),
    summary: "", sources: ["kg-b570"] });
  intel({ id: "arc-a580", name: "Intel Arc A580", seg: "desktop", series: "Arc A", arch: "Xe-HPG (Alchemist)", status: "previous", launch: "2023-10-10", msrp: 179,
    specs: Object.assign({ chip: "ACM-G10" }, acm10, { xe: 24, shaders: 3072, xmx: 384, rtu: 24, gclk: 1700, mem: 8, memType: "GDDR6", bus: 256, speed: 16, bw: 512, power: 185, pcie: "PCIe 4.0 ×16" }),
    summary: "", sources: ["kg-b570"] });
  intel({ id: "arc-pro-b70", name: "Intel Arc Pro B70", seg: "pro", series: "Arc Pro B", arch: "Xe2 (Battlemage)", status: "current", launch: "2026-03-25", msrp: 949,
    specs: { chip: "BMG-G31", process: "TSMC N5", xe: 32, xmx: 256, rtu: 32, gclk: 2800, mem: 32, memType: "GDDR6", bus: 256, bw: 608, power: 230, powerRange: "160–290 W (partner cards)", ai: 367 },
    summary: "The full BMG-G31 chip as a 32 GB workstation and local-AI card.", sources: ["fps-b70", "onmsft-b70", "ts-b70"] });
  intel({ id: "arc-pro-b65", name: "Intel Arc Pro B65", seg: "pro", series: "Arc Pro B", arch: "Xe2 (Battlemage)", status: "current", launch: "2026-03", msrp: null,
    specs: { chip: "BMG-G31", process: "TSMC N5", xe: 20, xmx: 160, gclk: 2400, mem: 32, memType: "GDDR6", bus: 256, bw: 608, power: 200, ai: 197 },
    summary: "Cut-down BMG-G31 that keeps the full 32 GB and bandwidth, for memory-bound inference.", sources: ["fps-b70", "onmsft-b70"] });
  intel({ id: "arc-pro-b60", name: "Intel Arc Pro B60", seg: "pro", series: "Arc Pro B", arch: "Xe2 (Battlemage)", status: "current", launch: "Q3 2025", msrp: null,
    specs: Object.assign({ chip: "BMG-G21" }, bmg21, { xe: 20, xmx: 160, mem: 24, memType: "GDDR6", bus: 192, bw: 456, ai: 197 }),
    summary: "24 GB card for multi-GPU 'Project Battlematrix' AI workstations.", priceNote: "Intel quoted roughly $500 per card; sold mainly in complete systems.", sources: ["th-b50"] });
  intel({ id: "arc-pro-b50", name: "Intel Arc Pro B50", seg: "pro", series: "Arc Pro B", arch: "Xe2 (Battlemage)", status: "current", launch: "2025-07", msrp: 299,
    specs: { chip: "BMG-G21", process: "TSMC N5", xe: 16, xmx: 128, mem: 16, memType: "GDDR6", bus: 128, bw: 224, power: 70, ai: 170, form: "Low profile, dual slot" },
    summary: "Compact 70 W workstation card with 16 GB.", sources: ["th-b50"] });

  D.SEGMENTS.desktop = "Desktop graphics";
  D.ARCHS.push(
    { brand: "Intel", name: "Xe-HPG (Alchemist)", year: "2022", process: "TSMC N6", namesake: "—", products: "Arc A-series", key: "Intel's first discrete gaming GPUs; XMX matrix engines and AV1 encode." },
    { brand: "Intel", name: "Xe2 (Battlemage)", year: "2024–26", process: "TSMC N5", namesake: "—", products: "Arc B580, B570, Arc Pro B-series", key: "Large per-core gains; 12–32 GB configurations." }
  );
  D.GLOSSARY.push(["Xe-cores and XMX (Intel)", "Intel groups its shader ALUs into Xe-cores of 128; XMX engines are its matrix units for AI and XeSS. Intel quotes AI throughput as INT8 TOPS."]);

  // ---------- Additional official regional launch prices ----------
  const addP = (id, p, src, note) => { const g = byId(id); if (!g) return; Object.assign(g.prices, p); g.sources = (g.sources || []).concat(src.filter((s) => !(g.sources || []).includes(s))); if (note) g.regionNote = (g.regionNote ? g.regionNote + " " : "") + note; };
  addP("rtx-5060", { IN: 33000 }, ["p-5060-in"]);
  addP("rtx-5060-ti", { IN: 42000 }, ["p-5060-in"], "India price is the starting price for the 8 GB version.");
  addP("rtx-5050", { EU: 259 }, ["p-5050-eu"]);
  addP("rx-9060-xt", { GB: 314.99 }, ["p-9060xt-uk"], "The 8 GB version launched at £269.99 in the UK.");

  // ---------- Reported street prices (dated snapshots) ----------
  // Lowest new-card price reported by the named source on the given date. Not live.
  const S = {
    "rtx-5090": [["US", 6919, "2026-11-03", "s-th", "Best US price"], ["AU", 12249, "2026-10-29", "s-au", "Average of cheapest in-stock listings"], ["CA", 10101, "2026-10-22", "s-ca", "Lowest tracked listing"], ["JP", 999800, "2026-11-15", "s-jp", "Akihabara listing, mid-November"]],
    "rtx-5080": [["US", 1550, "2026-11-21", "s-pcg"], ["AU", 2832, "2026-10-29", "s-au", "Average of cheapest in-stock listings"]],
    "rtx-5070-ti": [["US", 1150, "2026-11-21", "s-pcg"]],
    "rtx-5070": [["US", 800, "2026-11-21", "s-pcg"]],
    "rtx-5060-ti": [["US", 773, "2026-11-21", "s-pcg", "16 GB"]],
    "rtx-5060": [["US", 359, "2026-11-21", "s-pcg"]],
    "rtx-5050": [["US", 299, "2026-11-21", "s-pcg"]],
    "rx-9070-xt": [["US", 730, "2026-11-21", "s-pcg"]],
    "rx-9070": [["US", 630, "2026-11-21", "s-pcg"]],
    "rx-9070-gre": [["US", 530, "2026-11-21", "s-pcg"]],
    "rx-9060-xt": [["US", 460, "2026-11-21", "s-pcg", "16 GB"]],
    "rx-7600": [["US", 389, "2026-11-03", "s-th"]],
    "arc-b580": [["US", 310, "2026-11-21", "s-pcg"]],
    "arc-b570": [["US", 260, "2026-11-21", "s-pcg"]]
  };
  Object.entries(S).forEach(([id, rows]) => {
    const g = byId(id); if (!g) return;
    g.street = rows.map(([c, v, date, src, note]) => ({ c, v, date, src, note }));
    rows.forEach((r) => { if (!g.sources.includes(r[3])) g.sources.push(r[3]); });
  });

  // ---------- Verification status ----------
  // "checked": date the core specs were last compared against an official vendor page or a sourced spec table.
  const CHECKED = "2026-11-21";
  const verifiedSeries = new Set(["RTX 50", "RTX 40", "RTX 30", "RTX 20", "GTX 16", "GTX 10", "RX 9000", "RX 7000", "RX 6000", "RX 7000M", "Radeon AI PRO",
    "Instinct MI400", "Instinct MI350", "Instinct MI300", "Vera Rubin", "Blackwell Ultra", "Blackwell", "Rubin Ultra", "Feynman", "RTX PRO Blackwell", "RTX PRO Blackwell Laptop",
    "RTX Spark", "DGX", "Jetson Thor", "Ryzen AI Max", "Arc B", "Arc A", "Arc Pro B"]);
  const unverifiedIds = new Set(["titan-xp", "gt-1030", "rtx-6700", "rx-7800m", "gb200-nvl72", "dgx-station", "rx-6700-xt", "rx-6750-xt", "rx-6650-xt", "rx-6950-xt"]);
  const partial = { "gtx-1080-ti": 1, "gtx-1080": 1, "gtx-1070-ti": 1, "gtx-1070": 1, "gtx-1060-6gb": 1, "gtx-1050-ti": 1, "gtx-1050": 1 };
  // sources used for each verified family
  const famSrc = { "RTX 50": "nv-compare", "RTX 40": "nv-compare", "RTX 30": "nv-compare", "RTX 20": "nv-compare", "GTX 16": "nv-compare", "GTX 10": "nv-10compare", "RX 6000": "amd-6000qrg", "RX 7000M": "amd-7000m" };
  L.forEach((g) => {
    if (verifiedSeries.has(g.series) && !unverifiedIds.has(g.id) && g.seg !== "laptop" || ["rtx-5090-laptop", "rtx-5080-laptop", "rtx-5070-ti-laptop", "rtx-5070-laptop", "rtx-5060-laptop", "rtx-5050-laptop"].includes(g.id) || (g.series === "RX 7000M" && g.id !== "rx-7800m")) {
      g.checked = CHECKED;
      if (partial[g.id]) g.checkNote = "Core count and clocks checked against NVIDIA's 10-series comparison; other values from launch specifications.";
      const fs = famSrc[g.series]; if (fs && !g.sources.includes(fs)) g.sources.unshift(fs);
    }
    if (g.id === "rx-7800-xt" && !g.sources.includes("amd-7800xt")) g.sources.unshift("amd-7800xt");
    if (g.id === "rx-7600" && !g.sources.includes("amd-7600")) g.sources.unshift("amd-7600");
  });

  // ---------- Second verification pass (21 Nov 2026): the 40 products not covered above ----------
  Object.assign(D.SOURCES, {
    "nv-laptop-compare": { t: "NVIDIA — Compare gaming laptop GPUs (RTX 40 Series laptop table)", u: "https://www.nvidia.com/en-eu/geforce/laptops/compare/" },
    "nv-rtx6000ada": { t: "NVIDIA — RTX 6000 Ada Generation specifications", u: "https://nvidia.com/en-us/products/workstations/rtx-6000" },
    "nv-rtx4500ada-ds": { t: "NVIDIA — RTX 4500 Ada Generation datasheet", u: "https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/nvidia-rtx-4500-datasheet.pdf" },
    "ada-pro-table": { t: "Bechtle — NVIDIA RTX Ada workstation lineup table", u: "https://www.bechtle.com/de-en/brand/nvidia/ada-lovelace-gpus" },
    "cgc-ada-pro": { t: "CG Channel — NVIDIA unveils RTX 4000, 4500 and 5000 Ada", u: "https://www.cgchannel.com/2023/08/nvidia-unveils-rtx-4000-4500-and-5000-workstation-gpus" },
    "ck-ada-pro": { t: "Caseking — RTX Ada graphics cards (power and form factor)", u: "https://www.caseking.de/en/pc-components/graphics-cards/nvidia/rtx-pro/rtx-pro-ada-lovelace" },
    "nv-h100": { t: "NVIDIA — H100 specifications", u: "https://www.nvidia.com/en-us/data-center/h100/" },
    "nv-h200": { t: "NVIDIA — H200 specifications", u: "https://www.nvidia.com/h200" },
    "nv-gh200-ds": { t: "NVIDIA — GH200 Grace Hopper Superchip datasheet", u: "https://dam-cdn.nvd.orangelogic.com/AssetLink/tkno03fa645gb7f33w60rf200d330420.pdf" },
    "nv-l40s": { t: "NVIDIA — L40S specifications", u: "https://www.nvidia.com/en-eu/data-center/l40s/" },
    "nv-l4": { t: "NVIDIA — L4 specifications", u: "https://www.nvidia.com/en-zz/data-center/l4/" },
    "smc-a100": { t: "Supermicro — L40S / A100 / H100 NVL comparison datasheet", u: "https://www.supermicro.com/datasheet/datasheet_NVIDIA_L40S_Systems.pdf" },
    "nv-v100-ds": { t: "NVIDIA — V100 datasheet", u: "https://images.nvidia.com/content/technologies/volta/pdf/tesla-volta-v100-datasheet.pdf" },
    "nv-jetson-orin": { t: "NVIDIA — Jetson Orin modules and developer kits", u: "https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-agx-orin/" },
    "nv-gt1030": { t: "NVIDIA — GeForce GT 1030 specifications", u: "https://www.nvidia.com/en-us/geforce/graphics-cards/gt-1030/specifications/" },
    "pny-gt1030": { t: "PNY — GeForce GT 1030 product sheet", u: "https://www.pny.com/file%20library/company/support/product%20brochures/geforce%20graphics/portuguese/pny-nvidia-geforce-gt-1030.pdf" },
    "at-titanxp": { t: "AnandTech — NVIDIA announces Titan Xp", u: "https://www.anandtech.com/show/11253" },
    "amd-7800m": { t: "AMD — Radeon RX 7800M specifications", u: "https://www.amd.com/en/products/graphics/laptops/radeon/7000-series/amd-radeon-rx-7800m.html" },
    "amd-6x50": { t: "AMD — Press release: Radeon RX 6950 XT, 6750 XT and 6650 XT", u: "https://ir.amd.com/news-events/press-releases/detail/1064/amd-announces-three-new-radeon-rx-6000-series-graphics" },
    "kg-6x50": { t: "KitGuru — RX 6950 XT, 6750 XT and 6650 XT review (RX 6000 spec table)", u: "https://www.kitguru.net/components/graphic-cards/dominic-moass/amd-rx-6950-xt-6750-xt-6650-xt-review-ft-sapphire/all/1" },
    "th-5700": { t: "Tom's Hardware — AMD announces Radeon RX 5700 XT and RX 5700", u: "https://www.tomshardware.com/news/amd-navi-radeon_rx_5700_xt-rx_5700-details,39608.html" },
    "amd-5600": { t: "AMD — Press release: Radeon RX 5600 series", u: "https://www.amd.com/en/newsroom/press-releases/2020-1-6-amd-unveils-four-new-desktop-and-mobile-gpus-incl.html" },
    "at-5600": { t: "AnandTech — AMD announces Radeon RX 5600 series (RX 5000 spec table)", u: "https://www.anandtech.com/show/15298" },
    "amd-w7900-ds": { t: "AMD — Radeon PRO W7900 datasheet", u: "https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w7900-datasheet.pdf" },
    "amd-w7800-ds": { t: "AMD — Radeon PRO W7800 datasheet", u: "https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w7800-datasheet.pdf" },
    "amd-w7700-ds": { t: "AMD — Radeon PRO W7700 datasheet", u: "https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w7700-datasheet.pdf" },
    "amd-w7600-ds": { t: "AMD — Radeon PRO W7600 datasheet", u: "https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w7600-datasheet.pdf" },
  });

  const edit = (id, f) => { const g = byId(id); if (g) f(g, g.specs); };
  // RTX 40 laptops: NVIDIA's table matches; add the official boost-clock ranges.
  const lpBoost = { "rtx-4090-laptop": "1455–2040", "rtx-4080-laptop": "1350–2280", "rtx-4070-laptop": "1230–2175", "rtx-4060-laptop": "1470–2370", "rtx-4050-laptop": "1605–2370" };
  Object.entries(lpBoost).forEach(([id, r]) => edit(id, (g, s) => { s.boostRange = r; }));
  // RX 5600 XT: AMD's launch specification was 12 Gbps / 1560 MHz; the 14 Gbps BIOS is a variant.
  edit("rx-5600-xt", (g, s) => {
    s.speed = 12; s.bw = 288; s.boost = 1560;
    g.variants = [{ name: "Updated-BIOS cards", diff: "Most partner cards shipped with a launch-week BIOS raising memory to 14 Gbps (336 GB/s) and clocks above AMD's reference figures." }];
  });
  edit("rx-5500-xt", (g, s) => { s.boost = 1845; });
  edit("rx-7800m", (g, s) => { s.gclk = 2145; });
  // Titan Xp: NVIDIA published only the boost clock; drop the unofficial base clock.
  edit("titan-xp", (g, s) => { delete s.base; s.bw = 547.7; });
  // L4: NVIDIA does not publish a CUDA core count; third-party figures disagree, so leave it blank.
  edit("l4", (g, s) => { delete s.cuda; g.checkNote = "NVIDIA does not publish a CUDA core count for L4, so none is shown."; });
  edit("gh200", (g, s) => { s.bw = 4900; g.checkNote = "Bandwidth is for the 144 GB HBM3e version; the 96 GB HBM3 version is up to 4 TB/s."; s.power = "450–1000 W configurable (CPU + GPU + memory)"; });
  edit("gb200-nvl72", (g, s) => { s.gpus = "72 Blackwell GPUs, 36 Grace CPUs"; s.form = "Liquid-cooled rack"; });
  // GT 1030: GDDR5 is the reference card; the DDR4 card is a separate, slower variant on NVIDIA's own spec page.
  edit("gt-1030", (g) => {
    g.variants = [{ name: "GT 1030 DDR4", diff: "Same 384 cores, 1379 MHz boost and 2.1 Gbps DDR4 (about 17 GB/s): far slower than the GDDR5 card." }];
  });

  const pass2 = {
    "rtx-4090-laptop": ["nv-laptop-compare"], "rtx-4080-laptop": ["nv-laptop-compare"], "rtx-4070-laptop": ["nv-laptop-compare"],
    "rtx-4060-laptop": ["nv-laptop-compare"], "rtx-4050-laptop": ["nv-laptop-compare"],
    "rtx-6000-ada": ["nv-rtx6000ada", "ada-pro-table"], "rtx-5000-ada": ["ada-pro-table", "cgc-ada-pro"], "rtx-4500-ada": ["nv-rtx4500ada-ds", "ada-pro-table"],
    "rtx-4000-ada": ["ada-pro-table", "cgc-ada-pro"], "rtx-4000-sff-ada": ["ada-pro-table", "cgc-ada-pro"], "rtx-2000-ada": ["ada-pro-table", "ck-ada-pro"],
    "h100-sxm": ["nv-h100"], "h200": ["nv-h200"], "gh200": ["nv-gh200-ds"], "l40s": ["nv-l40s"], "l4": ["nv-l4"], "a100": ["smc-a100"], "v100": ["nv-v100-ds"],
    "jetson-agx-orin": ["nv-jetson-orin"], "jetson-orin-nano-super": ["nv-jetson-orin"],
    "gt-1030": ["nv-gt1030", "pny-gt1030"], "titan-xp": ["at-titanxp"],
    "rx-6950-xt": ["amd-6x50", "kg-6x50"], "rx-6750-xt": ["amd-6x50", "kg-6x50"], "rx-6650-xt": ["amd-6x50", "kg-6x50"], "rx-6700-xt": ["kg-6x50"],
    "rx-5700-xt": ["th-5700"], "rx-5700": ["th-5700"], "rx-5600-xt": ["amd-5600", "at-5600"], "rx-5500-xt": ["at-5600"],
    "rx-7800m": ["amd-7800m"],
    "radeon-pro-w7900": ["amd-w7900-ds"], "radeon-pro-w7800": ["amd-w7800-ds"], "radeon-pro-w7700": ["amd-w7700-ds"], "radeon-pro-w7600": ["amd-w7600-ds"],
    // descriptive entries (no numeric specs beyond what the vendor states)
    "gb200-nvl72": [], "dgx-station": [], "drive-agx-thor": [], "igx-thor": [],
  };
  Object.entries(pass2).forEach(([id, srcs]) => edit(id, (g) => {
    g.checked = CHECKED;
    g.sources = [...srcs, ...g.sources.filter((k) => !srcs.includes(k) && k !== "launch")];
    if (!g.sources.length) g.sources = ["launch"];
  }));
  edit("titan-xp", (g) => { g.checkNote = "NVIDIA published the boost clock (1582 MHz) but not a base clock, so none is shown."; });
  edit("rx-6700-xt", (g) => { g.checkNote = "Checked against a review spec table; AMD's own RX 6700 XT page is no longer online."; });
  edit("rx-5500-xt", (g) => { g.checkNote = "Checked against launch coverage; AMD's original RX 5500 XT page is no longer online."; });

  // ---------- Independent reviews (links only; no benchmark numbers are copied) ----------
  const R = (outlet, url) => ({ outlet, url });
  const REVIEWS = {
    "rtx-5090": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/nvidia-geforce-rtx-5090-review"), R("TechPowerUp", "https://www.techpowerup.com/review/nvidia-geforce-rtx-5090-founders-edition/"), R("Gamers Nexus", "https://gamersnexus.net/gpus/nvidia-geforce-rtx-5090-founders-edition-review-benchmarks-gaming-thermals-power"), R("KitGuru", "https://www.kitguru.net/components/graphic-cards/dominic-moass/nvidia-rtx-5090-review-ray-tracing-dlss-4-and-raw-power-explored/all/1/")],
    "rtx-5080": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/nvidia-geforce-rtx-5080-review"), R("TechSpot", "https://www.techspot.com/review/2947-nvidia-geforce-rtx-5080/"), R("Gamers Nexus", "https://gamersnexus.net/gpus/nvidia-geforce-rtx-5080-founders-edition-review-benchmarks-vs-5090-7900-xtx-4080-more"), R("KitGuru", "https://www.kitguru.net/components/graphic-cards/dominic-moass/nvidia-rtx-5080-review-efficiency-gains-but-a-performance-letdown/all/1/")],
    "rtx-5070-ti": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/nvidia-geforce-rtx-5070-ti-review-asus"), R("KitGuru", "https://www.kitguru.net/components/graphic-cards/dominic-moass/msi-rtx-5070-ti-ventus-3x-oc-review/all/1/"), R("PC Gamer", "https://www.pcgamer.com/hardware/graphics-cards/nvidia-rtx-5070-ti-review-msi-ventus-3x/")],
    "rtx-5070": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/nvidia-geforce-rtx-5070-review-founders-edition"), R("TechPowerUp", "https://www.techpowerup.com/review/nvidia-geforce-rtx-5070-founders-edition/"), R("PC Gamer", "https://www.pcgamer.com/hardware/graphics-cards/nvidia-rtx-5070-founders-edition-review/")],
    "rtx-5060-ti": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/nvidia-geforce-rtx-5060-ti-16gb-review"), R("TechSpot", "https://www.techspot.com/review/2979-nvidia-geforce-rtx-5060-ti-16gb/"), R("KitGuru", "https://www.kitguru.net/components/graphic-cards/dominic-moass/nvidia-rtx-5060-ti-16gb-review-ft-gigabyte-palit/all/1/")],
    "rtx-5060": [R("TechSpot", "https://www.techspot.com/review/2992-nvidia-geforce-rtx-5060/"), R("TechPowerUp", "https://www.techpowerup.com/review/zotac-geforce-rtx-5060-solo-8-gb/")],
    "rtx-5050": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/nvidia-geforce-rtx-5050-review"), R("TechPowerUp", "https://www.techpowerup.com/review/gigabyte-geforce-rtx-5050-gaming-oc/"), R("TechSpot", "https://www.techspot.com/review/3011-nvidia-geforce-rtx-5050/")],
    "rx-9070-xt": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/amd-radeon-rx-9070-xt-review"), R("KitGuru", "https://www.kitguru.net/components/graphic-cards/dominic-moass/amd-rx-9070-xt-review-ft-asrock/all/1/"), R("PC Gamer", "https://www.pcgamer.com/hardware/graphics-cards/amd-radeon-rx-9700-xt-review-asus-prime-oc/")],
    "rx-9070": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/amd-radeon-rx-9070-xt-review"), R("TechSpot", "https://www.techspot.com/review/2962-amd-radeon-9070/")],
    "rx-9060-xt": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/amd-radeon-rx-9060-xt-16gb-review"), R("TechSpot", "https://www.techspot.com/review/2996-amd-radeon-9060-xt/")],
    "arc-b580": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/intel-arc-b580-review-the-new-usd249-gpu-champion-has-arrived"), R("TechPowerUp", "https://www.techpowerup.com/review/intel-arc-b580/"), R("TechSpot", "https://www.techspot.com/review/2935-intel-arc-b580/"), R("KitGuru", "https://www.kitguru.net/components/graphic-cards/dominic-moass/intel-arc-b580-limited-edition-review/all/1/")],
    "arc-b570": [R("Tom's Hardware", "https://www.tomshardware.com/pc-components/gpus/intel-arc-b570-review-asrock-challenger-oc-tested"), R("TechSpot", "https://www.techspot.com/review/2943-intel-arc-b570/")],
    "rx-6950-xt": [R("Tom's Hardware", "https://www.tomshardware.com/reviews/amd-radeon-rx-6950-xt-review"), R("KitGuru", "https://www.kitguru.net/components/graphic-cards/dominic-moass/amd-rx-6950-xt-6750-xt-6650-xt-review-ft-sapphire/all/1")],
    "rx-6750-xt": [R("KitGuru", "https://www.kitguru.net/components/graphic-cards/dominic-moass/amd-rx-6950-xt-6750-xt-6650-xt-review-ft-sapphire/all/1")],
    "rx-6650-xt": [R("KitGuru", "https://www.kitguru.net/components/graphic-cards/dominic-moass/amd-rx-6950-xt-6750-xt-6650-xt-review-ft-sapphire/all/1")],
    "rx-5700-xt": [R("Tom's Hardware", "https://www.tomshardware.com/uk/reviews/amd-radeon-rx_5700-rx_5700_xt,6216.html"), R("AnandTech", "https://anandtech.com/show/14618/13")],
    "rx-5700": [R("Tom's Hardware", "https://www.tomshardware.com/uk/reviews/amd-radeon-rx_5700-rx_5700_xt,6216.html"), R("AnandTech", "https://anandtech.com/show/14618/13")],
    "titan-xp": [R("Tom's Hardware", "https://www.tomshardware.com/reviews/nvidia-titan-xp,5066.html"), R("Gamers Nexus", "https://gamersnexus.net/hwreviews/2892-nvidia-titan-xp-review-vs-1080-ti-benchmark?showall=1")],
    "l4": [R("StorageReview", "https://www.storagereview.com/pl/review/nvidia-l4-gpu-review-low-power-inferencing-wizard")],
  };
  Object.entries(REVIEWS).forEach(([id, list]) => edit(id, (g) => { g.reviews = list; }));

  D.updated = "21 November 2026";
  D.REPO = "https://github.com/happy2234/gpu-atlas";
})();
