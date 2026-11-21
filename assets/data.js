/* GPU Atlas — dataset
 * Units: memory GB · bandwidth GB/s · power W · clocks MHz · L2 MB · transistors billions · die mm²
 * Launch prices are launch MSRPs in USD. Street prices in 2026 are much higher (see Methodology).
 * Values not published or not confirmed are left out rather than estimated.
 */
(function () {
  const SOURCES = {
    "nv-gf50": { t: "NVIDIA — GeForce RTX 50 Series", u: "https://www.nvidia.com/en-us/geforce/products/" },
    "nv-laptop50": { t: "NVIDIA — GeForce RTX 50 Series Laptops", u: "https://www.nvidia.com/en-in/geforce/laptops/50-series/" },
    "nv-laptop-compare": { t: "NVIDIA — Compare GeForce laptop GPUs", u: "https://nvidia.com/en-us/geforce/laptops/compare/" },
    "nv-pro-desktop": { t: "NVIDIA — RTX PRO desktop GPUs", u: "https://www.nvidia.com/desktop-graphics/" },
    "nv-pro-laptop": { t: "NVIDIA — RTX PRO laptop GPU comparison", u: "https://www.nvidia.com/en-gb/products/workstations/professional-laptops/compare/" },
    "nv-pro6000": { t: "NVIDIA — RTX PRO 6000 Blackwell Workstation Edition", u: "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000.md" },
    "th-rtxpro": { t: "Tom's Hardware — RTX PRO 6000 up close (Blackwell PRO spec table)", u: "https://www.tomshardware.com/pc-components/gpus/nvidia-rtx-pro-6000-up-close-blackwell-rtx-workstation-max-q-workstation-and-server-variants-shown" },
    "nc-pro5500": { t: "Notebookcheck — RTX PRO 5500 Blackwell with 84 GB", u: "https://www.notebookcheck.net/Nvidia-launches-new-Blackwell-workstation-GPU-with-84-GB-VRAM.1398858.0.html" },
    "tt-pro5500": { t: "TweakTown — RTX PRO 5500 Blackwell details", u: "https://www.tweaktown.com/rss/click/news/113531/?c=news-mf" },
    "nv-pro5500": { t: "NVIDIA — RTX PRO 5500 Blackwell Workstation Edition", u: "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5500/" },
    "reg-gb10": { t: "The Register — GB10 workstations arrive", u: "https://theregister.com/2025/10/13/nvidia_gb10_spark" },
    "nv-vr": { t: "NVIDIA — Vera Rubin NVL72 specifications", u: "https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72.md" },
    "th-b300": { t: "Tom's Hardware — Blackwell Ultra B300 announced", u: "https://www.tomshardware.com/pc-components/gpus/nvidia-announces-blackwell-ultra-b300-1-5x-faster-than-b200-with-288gb-hbm3e-and-15-pflops-dense-fp4" },
    "th-bwu": { t: "Tom's Hardware — Blackwell vs Blackwell Ultra", u: "https://www.tomshardware.com/pc-components/gpus/nvidia-shares-blackwell-ultras-secrets-nvfp4-boost-detailed-and-pcie-6-0-support" },
    "nv-bwu": { t: "NVIDIA Developer — Inside Blackwell Ultra", u: "https://developer.nvidia.com/blog/inside-nvidia-blackwell-ultra-the-chip-powering-the-ai-factory-era" },
    "nv-bwu-reasoning": { t: "NVIDIA Developer — Blackwell Ultra for AI reasoning", u: "https://developer.nvidia.com/blog/nvidia-blackwell-ultra-for-the-era-of-ai-reasoning" },
    "th-roadmap": { t: "Tom's Hardware — Roadmap: Rosa CPU, Feynman, Groq LPUs (GTC 2026)", u: "https://www.tomshardware.com/pc-components/gpus/nvidia-updates-data-center-roadmap-with-rosa-cpu-and-stacked-feynman-gpus-optical-nvlink-groq-lpus-with-nvfp4-and-nvlink-also-on-deck" },
    "th-rubin-plan": { t: "Tom's Hardware — Enterprise roadmap: Rubin, Rubin Ultra, Feynman", u: "https://www.tomshardware.com/tech-industry/semiconductors/nvidia-enterprise-roadmap-rubin-rubin-ultra-feynman-and-silicon-photonics" },
    "hpc-kyber": { t: "HPCwire — Huang shares roadmap: Kyber, NVL1152", u: "https://www.hpcwire.com/2026/03/17/huang-shares-nvidia-roadmap-showing-more-chips-nvl1152-scale-up-cpo/" },
    "dcd-nvl576": { t: "DatacenterDynamics — Rubin Ultra NVL576 ~600 kW", u: "https://datacenterdynamics.com/en/news/nvidias-rubin-ultra-nvl576-rack-expected-to-be-600kw-coming-second-half-of-2027" },
    "wccf-feynman": { t: "Wccftech — Feynman: 3D stacking, custom HBM, Rosa CPU", u: "https://wccftech.com/nvidia-feynman-gpu-gets-3d-die-stacking-custom-hbm-next-gen-rosa-cpu/amp/" },
    "jpr-gtc26": { t: "Jon Peddie Research — GTC 2026 keynote", u: "https://www.jonpeddie.com/news/nvidia-gtc-2026-keynote/" },
    "ts-vr": { t: "TechSpot — Vera Rubin Superchip shown at GTC Washington", u: "https://www.techspot.com/news/110072-nvidia-showcases-vera-rubin-ai-superchip-88-cpu.html" },
    "nv-thor": { t: "NVIDIA — Jetson Thor", u: "https://nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-thor/" },
    "nv-thor-blog": { t: "NVIDIA Developer — Introducing Jetson Thor", u: "https://developer.nvidia.com/blog/introducing-nvidia-jetson-thor-the-ultimate-platform-for-physical-ai/" },
    "itm-thor": { t: "MONOist — Jetson AGX Thor launch and module pricing", u: "https://monoist.itmedia.co.jp/mn/spv/2508/26/news058_2.html" },
    "th-spark": { t: "Tom's Hardware — RTX Spark Superchip at Computex 2026", u: "https://www.tomshardware.com/laptops/nvidia-unveils-rtx-spark-superchip-at-computex-2026-new-platform-promises-to-turn-windows-into-an-agentic-ai-os-with-arm-cpu-blackwell-gpu-and-128gb-unified-memory" },
    "imp-spark": { t: "Implicator — RTX Spark configurations", u: "https://www.implicator.ai/nvidia-sets-october-launch-for-rtx-spark-n1x-without-naming-a-price/" },
    "mixed-spark": { t: "Mixed News — RTX Spark pre-orders and availability", u: "https://mixed-news.com/en/?p=35981" },
    "ti-spark-price": { t: "Tech Insider — RTX Spark laptops from $2,599", u: "https://tech-insider.org/nvidia-rtx-spark-laptops-launch-2599-2026/" },
    "th-spark-roadmap": { t: "Tom's Hardware — Spark roadmap (Computex 2026)", u: "https://www.tomshardware.com/pc-components/cpus/nvidia-unveils-dgx-sparrk-roadmap-for-laptops-and-desktop-pcs-at-computex-2026-three-generations-outlined-rubin-followed-by-rosa-feynman" },
    "th-dgxspark-price": { t: "Tom's Hardware — DGX Spark price increase to $4,699", u: "https://www.tomshardware.com/desktops/mini-pcs/nvidia-dgx-spark-gets-18-percent-price-increase-as-memory-shortages-bite-founders-edition-now-usd4-699-up-from-usd3-999" },
    "reg-spark64": { t: "The Register — $4,999 DGX Spark 64 GB; 128 GB at $6,950", u: "https://www.theregister.com/a/5300622" },
    "eenews-ces26": { t: "eeNews Europe — CES 2026 roundup", u: "https://www.eenewseurope.com/en/nvidia-ces-2026-announcements-roundup" },
    "techzine-station": { t: "Techzine — DGX Station for Windows", u: "https://www.techzine.eu/news/devices/141718/nvidias-plans-for-vera-rubin-dgx-station-agents-and-robots/" },
    "nv-dlss5": { t: "NVIDIA — DLSS 5 with 3D-Guided Neural Rendering", u: "https://nvidia.com/en-us/geforce/news/dlss-5-3d-guided-neural-rendering/" },
    "th-super": { t: "Tom's Hardware — Report: no new RTX gaming GPUs in 2026", u: "https://www.tomshardware.com/pc-components/gpus/report-claims-nvidia-will-not-be-releasing-any-new-rtx-gaming-gpus-in-2026-rtx-60-series-likely-debuting-in-2028" },
    "tt-super": { t: "TweakTown — RTX 50 SUPER delayed indefinitely", u: "https://www.tweaktown.com/news/109694/geforce-rtx-50-super-series-delayed-indefinitely-as-nvidia-informs-its-partners/" },
    "ti-prices": { t: "Tech Insider — RTX 50 retail prices up to 39% (2026)", u: "https://tech-insider.org/nvidia-gpu-price-hike-rtx-50-series-2026/" },
    "ee-gf50": { t: "EE — GeForce RTX 50 Series specifications", u: "https://ee.co.uk/nvidia" },
    "launch": { t: "NVIDIA launch specifications (as published at each product's launch)", u: "" }
  };

  const SEGMENTS = {
    desktop: "GeForce Desktop",
    laptop: "GeForce Laptop",
    pro: "RTX PRO Workstation",
    datacenter: "Data Center",
    systems: "AI PCs & Systems",
    edge: "Edge & Automotive"
  };

  const STATUS = {
    current: "Current",
    previous: "Previous generation",
    legacy: "Legacy",
    announced: "Announced",
    roadmap: "Roadmap",
    rumored: "Unconfirmed"
  };

  // Shorthand builders ---------------------------------------------------
  const L = [];
  const add = (o) => { L.push(o); return o; };

  // GeForce desktop builder
  function gf(id, name, series, arch, chip, status, launch, msrp, s, extra) {
    return add(Object.assign({ id, name, seg: "desktop", series, arch, status, launch, msrp, specs: Object.assign({ chip }, s), sources: ["launch"] }, extra || {}));
  }

  // ===================================================================
  // GEFORCE RTX 50 — Blackwell (TSMC 4N)
  // ===================================================================
  const bw = (die) => ({
    GB202: { process: "TSMC 4N", transistors: 92.2, die: 750 },
    GB203: { process: "TSMC 4N", transistors: 45.6, die: 378 },
    GB205: { process: "TSMC 4N", transistors: 31.1, die: 263 },
    GB206: { process: "TSMC 4N", transistors: 21.9, die: 181 },
    GB207: { process: "TSMC 4N", transistors: 16.9, die: 149 }
  }[die]);
  const o50 = { outputs: "3× DisplayPort 2.1b, 1× HDMI 2.1b" };

  gf("rtx-5090", "GeForce RTX 5090", "RTX 50", "Blackwell", "GB202", "current", "2025-01-30", 1999,
    Object.assign(bw("GB202"), { sm: 170, cuda: 21760, rops: 176, base: 2017, boost: 2407, l2: 96, mem: 32, memType: "GDDR7", bus: 512, speed: 28, bw: 1792, power: 575, connector: "16-pin 12V-2×6", pcie: "PCIe 5.0 ×16", ai: 3352, nvenc: "3× 9th gen" }, o50),
    { summary: "The fastest GeForce card. A heavily enabled GB202 with a 512-bit GDDR7 bus and 32 GB, aimed at 4K path tracing, creators and local AI.",
      variants: [
        { name: "RTX 5090 D", diff: "China-market version. Same 21,760 CUDA cores and 32 GB; AI throughput limited (2,375 AI TOPS) to meet US export rules." },
        { name: "RTX 5090 D v2", diff: "Later China-market version with 24 GB GDDR7." }
      ], sources: ["nv-gf50", "ee-gf50", "launch"] });

  gf("rtx-5080", "GeForce RTX 5080", "RTX 50", "Blackwell", "GB203", "current", "2025-01-30", 999,
    Object.assign(bw("GB203"), { sm: 84, cuda: 10752, rops: 112, base: 2295, boost: 2617, l2: 64, mem: 16, memType: "GDDR7", bus: 256, speed: 30, bw: 960, power: 360, connector: "16-pin 12V-2×6", pcie: "PCIe 5.0 ×16", ai: 1801, nvenc: "2× 9th gen" }, o50),
    { summary: "Full GB203 die with the fastest GDDR7 in the range (30 Gbps). Positioned for high-refresh 4K with DLSS.", sources: ["nv-gf50", "ee-gf50", "launch"] });

  gf("rtx-5070-ti", "GeForce RTX 5070 Ti", "RTX 50", "Blackwell", "GB203", "current", "2025-02-20", 749,
    Object.assign(bw("GB203"), { sm: 70, cuda: 8960, rops: 96, base: 2295, boost: 2452, l2: 48, mem: 16, memType: "GDDR7", bus: 256, speed: 28, bw: 896, power: 300, connector: "16-pin 12V-2×6", pcie: "PCIe 5.0 ×16", ai: 1406, nvenc: "2× 9th gen" }, o50),
    { summary: "Cut-down GB203 with the same 256-bit bus and 16 GB as the 5080. No Founders Edition; partner boards only.", sources: ["nv-gf50", "ee-gf50", "launch"] });

  gf("rtx-5070", "GeForce RTX 5070", "RTX 50", "Blackwell", "GB205", "current", "2025-03-05", 549,
    Object.assign(bw("GB205"), { sm: 48, cuda: 6144, rops: 64, base: 2325, boost: 2512, l2: 48, mem: 12, memType: "GDDR7", bus: 192, speed: 28, bw: 672, power: 250, connector: "16-pin 12V-2×6", pcie: "PCIe 5.0 ×16", ai: 988, nvenc: "1× 9th gen" }, o50),
    { summary: "Mainstream 1440p card on GB205 with 12 GB over a 192-bit bus.", sources: ["nv-gf50", "ee-gf50", "launch"] });

  gf("rtx-5060-ti", "GeForce RTX 5060 Ti", "RTX 50", "Blackwell", "GB206", "current", "2025-04-16", 429,
    Object.assign(bw("GB206"), { sm: 36, cuda: 4608, rops: 48, base: 2407, boost: 2572, l2: 32, mem: 16, memType: "GDDR7", bus: 128, speed: 28, bw: 448, power: 180, pcie: "PCIe 5.0 ×8", ai: 759, nvenc: "1× 9th gen" }, o50),
    { summary: "Full GB206 on a 128-bit bus, sold in 16 GB and 8 GB versions with otherwise identical specs.",
      variants: [{ name: "RTX 5060 Ti 8 GB", diff: "Same GPU configuration with 8 GB GDDR7. Launch MSRP $379." }],
      priceNote: "16 GB version. The 8 GB version launched at $379.", sources: ["nv-gf50", "launch"] });

  gf("rtx-5060", "GeForce RTX 5060", "RTX 50", "Blackwell", "GB206", "current", "2025-05-19", 299,
    Object.assign(bw("GB206"), { sm: 30, cuda: 3840, rops: 48, base: 2280, boost: 2497, l2: 32, mem: 8, memType: "GDDR7", bus: 128, speed: 28, bw: 448, power: 145, pcie: "PCIe 5.0 ×8", ai: 614, nvenc: "1× 9th gen" }, o50),
    { summary: "Volume 1080p card. Cut-down GB206 with 8 GB GDDR7.", sources: ["nv-gf50", "launch"] });

  gf("rtx-5050", "GeForce RTX 5050", "RTX 50", "Blackwell", "GB207", "current", "2025-07", 249,
    Object.assign(bw("GB207"), { sm: 20, cuda: 2560, rops: 32, base: 2317, boost: 2572, l2: 32, mem: 8, memType: "GDDR6", bus: 128, speed: 20, bw: 320, power: 130, pcie: "PCIe 5.0 ×8", ai: 421, nvenc: "1× 9th gen" }, o50),
    { summary: "Entry Blackwell card and the only RTX 50 desktop model on GDDR6.", sources: ["nv-gf50", "launch"] });

  add({ id: "rtx-50-super", name: "GeForce RTX 50 SUPER (unconfirmed)", seg: "desktop", series: "RTX 50", arch: "Blackwell", status: "rumored", launch: "Not announced",
    summary: "A refresh using 3 GB GDDR7 modules for roughly 50% more memory has been widely reported but never announced by NVIDIA. Reports in 2026 say it has been delayed or deprioritised because of the memory shortage.",
    specs: { chip: "GB203 / GB205 (reported)" },
    variants: [
      { name: "RTX 5080 SUPER (reported)", diff: "24 GB GDDR7, ~415 W TGP according to leaks." },
      { name: "RTX 5070 Ti SUPER (reported)", diff: "24 GB GDDR7." },
      { name: "RTX 5070 SUPER (reported)", diff: "18 GB GDDR7." }
    ], sources: ["th-super", "tt-super"] });

  // ===================================================================
  // GEFORCE RTX 40 — Ada Lovelace (TSMC 4N)
  // ===================================================================
  const ad = (die) => ({
    AD102: { process: "TSMC 4N", transistors: 76.3, die: 608 },
    AD103: { process: "TSMC 4N", transistors: 45.9, die: 379 },
    AD104: { process: "TSMC 4N", transistors: 35.8, die: 295 },
    AD106: { process: "TSMC 4N", transistors: 22.9, die: 188 },
    AD107: { process: "TSMC 4N", transistors: 18.9, die: 159 }
  }[die]);
  const o40 = { outputs: "3× DisplayPort 1.4a, 1× HDMI 2.1" };

  gf("rtx-4090", "GeForce RTX 4090", "RTX 40", "Ada Lovelace", "AD102", "previous", "2022-10-12", 1599,
    Object.assign(ad("AD102"), { sm: 128, cuda: 16384, rops: 176, base: 2235, boost: 2520, l2: 72, mem: 24, memType: "GDDR6X", bus: 384, speed: 21, bw: 1008, power: 450, connector: "16-pin 12VHPWR", pcie: "PCIe 4.0 ×16", ai: 1321, nvenc: "2× 8th gen" }, o40),
    { summary: "Ada flagship. Introduced DLSS 3 Frame Generation and the 12VHPWR connector.",
      variants: [{ name: "RTX 4090 D", diff: "China-market version with 14,592 CUDA cores to comply with export rules." }] });

  gf("rtx-4080-super", "GeForce RTX 4080 SUPER", "RTX 40", "Ada Lovelace", "AD103", "previous", "2024-01-31", 999,
    Object.assign(ad("AD103"), { sm: 80, cuda: 10240, rops: 112, base: 2295, boost: 2550, l2: 64, mem: 16, memType: "GDDR6X", bus: 256, speed: 23, bw: 736, power: 320, connector: "16-pin 12VHPWR", pcie: "PCIe 4.0 ×16", ai: 836, nvenc: "2× 8th gen" }, o40),
    { summary: "Full AD103 refresh that replaced the RTX 4080 at a $200 lower price." });

  gf("rtx-4080", "GeForce RTX 4080", "RTX 40", "Ada Lovelace", "AD103", "previous", "2022-11-16", 1199,
    Object.assign(ad("AD103"), { sm: 76, cuda: 9728, rops: 112, base: 2205, boost: 2505, l2: 64, mem: 16, memType: "GDDR6X", bus: 256, speed: 22.4, bw: 717, power: 320, connector: "16-pin 12VHPWR", pcie: "PCIe 4.0 ×16", ai: 780, nvenc: "2× 8th gen" }, o40),
    { summary: "Originally announced alongside a 12 GB 'RTX 4080' that was withdrawn and relaunched as the RTX 4070 Ti." });

  gf("rtx-4070-ti-super", "GeForce RTX 4070 Ti SUPER", "RTX 40", "Ada Lovelace", "AD103", "previous", "2024-01-24", 799,
    Object.assign(ad("AD103"), { sm: 66, cuda: 8448, rops: 96, base: 2340, boost: 2610, l2: 48, mem: 16, memType: "GDDR6X", bus: 256, speed: 21, bw: 672, power: 285, connector: "16-pin 12VHPWR", pcie: "PCIe 4.0 ×16", ai: 706, nvenc: "2× 8th gen" }, o40),
    { summary: "Moved the 70 Ti tier to AD103 with a 256-bit bus and 16 GB." });

  gf("rtx-4070-ti", "GeForce RTX 4070 Ti", "RTX 40", "Ada Lovelace", "AD104", "previous", "2023-01-05", 799,
    Object.assign(ad("AD104"), { sm: 60, cuda: 7680, rops: 80, base: 2310, boost: 2610, l2: 48, mem: 12, memType: "GDDR6X", bus: 192, speed: 21, bw: 504, power: 285, connector: "16-pin 12VHPWR", pcie: "PCIe 4.0 ×16", ai: 641, nvenc: "2× 8th gen" }, o40),
    { summary: "Full AD104. The product first announced as the 'RTX 4080 12GB'." });

  gf("rtx-4070-super", "GeForce RTX 4070 SUPER", "RTX 40", "Ada Lovelace", "AD104", "previous", "2024-01-17", 599,
    Object.assign(ad("AD104"), { sm: 56, cuda: 7168, rops: 80, base: 1980, boost: 2475, l2: 48, mem: 12, memType: "GDDR6X", bus: 192, speed: 21, bw: 504, power: 220, pcie: "PCIe 4.0 ×16", ai: 568, nvenc: "1× 8th gen" }, o40),
    { summary: "Refresh with 22% more cores than the RTX 4070 at the same launch price." });

  gf("rtx-4070", "GeForce RTX 4070", "RTX 40", "Ada Lovelace", "AD104", "previous", "2023-04-13", 599,
    Object.assign(ad("AD104"), { sm: 46, cuda: 5888, rops: 64, base: 1920, boost: 2475, l2: 36, mem: 12, memType: "GDDR6X", bus: 192, speed: 21, bw: 504, power: 200, pcie: "PCIe 4.0 ×16", ai: 466, nvenc: "1× 8th gen" }, o40),
    { summary: "Mainstream Ada card. Price cut to $549 when the SUPER refresh arrived.",
      variants: [{ name: "RTX 4070 (GDDR6)", diff: "Later version with 20 Gbps GDDR6 instead of GDDR6X: 480 GB/s bandwidth." }] });

  gf("rtx-4060-ti", "GeForce RTX 4060 Ti", "RTX 40", "Ada Lovelace", "AD106", "previous", "2023-05-24", 399,
    Object.assign(ad("AD106"), { sm: 34, cuda: 4352, rops: 48, base: 2310, boost: 2535, l2: 32, mem: 8, memType: "GDDR6", bus: 128, speed: 18, bw: 288, power: 160, pcie: "PCIe 4.0 ×8", ai: 353, nvenc: "1× 8th gen" }, o40),
    { summary: "Full AD106 on a 128-bit bus, offered in 8 GB and 16 GB versions.",
      variants: [{ name: "RTX 4060 Ti 16 GB", diff: "Same GPU with 16 GB (clamshell). Launched 18 July 2023 at $499; 165 W." }],
      priceNote: "8 GB version. The 16 GB version launched at $499." });

  gf("rtx-4060", "GeForce RTX 4060", "RTX 40", "Ada Lovelace", "AD107", "previous", "2023-06-29", 299,
    Object.assign(ad("AD107"), { sm: 24, cuda: 3072, rops: 48, base: 1830, boost: 2460, l2: 24, mem: 8, memType: "GDDR6", bus: 128, speed: 17, bw: 272, power: 115, pcie: "PCIe 4.0 ×8", ai: 242, nvenc: "1× 8th gen" }, o40),
    { summary: "Entry Ada card with a 115 W board power." });

  // ===================================================================
  // GEFORCE RTX 30 — Ampere (Samsung 8N)
  // ===================================================================
  const ga = (die) => ({
    GA102: { process: "Samsung 8N", transistors: 28.3, die: 628 },
    GA104: { process: "Samsung 8N", transistors: 17.4, die: 392 },
    GA106: { process: "Samsung 8N", transistors: 12.0, die: 276 },
    GA107: { process: "Samsung 8N", transistors: 8.7, die: 200 }
  }[die]);
  const o30 = { outputs: "3× DisplayPort 1.4a, 1× HDMI 2.1" };

  gf("rtx-3090-ti", "GeForce RTX 3090 Ti", "RTX 30", "Ampere", "GA102", "legacy", "2022-03-29", 1999,
    Object.assign(ga("GA102"), { sm: 84, cuda: 10752, rops: 112, base: 1560, boost: 1860, l2: 6, mem: 24, memType: "GDDR6X", bus: 384, speed: 21, bw: 1008, power: 450, pcie: "PCIe 4.0 ×16", nvenc: "1× 7th gen" }, o30),
    { summary: "Full GA102 with 2 GB GDDR6X modules. The first GeForce card with the 16-pin connector." });

  gf("rtx-3090", "GeForce RTX 3090", "RTX 30", "Ampere", "GA102", "legacy", "2020-09-24", 1499,
    Object.assign(ga("GA102"), { sm: 82, cuda: 10496, rops: 112, base: 1395, boost: 1695, l2: 6, mem: 24, memType: "GDDR6X", bus: 384, speed: 19.5, bw: 936, power: 350, pcie: "PCIe 4.0 ×16", nvenc: "1× 7th gen" }, o30),
    { summary: "Titan-class card at launch, with 24 GB on a double-sided board. Last GeForce card with NVLink." });

  gf("rtx-3080-ti", "GeForce RTX 3080 Ti", "RTX 30", "Ampere", "GA102", "legacy", "2021-06-03", 1199,
    Object.assign(ga("GA102"), { sm: 80, cuda: 10240, rops: 112, base: 1365, boost: 1665, l2: 6, mem: 12, memType: "GDDR6X", bus: 384, speed: 19, bw: 912, power: 350, pcie: "PCIe 4.0 ×16", nvenc: "1× 7th gen" }, o30),
    { summary: "Near-3090 compute with half the memory. Launched with a hash-rate limiter." });

  gf("rtx-3080-12gb", "GeForce RTX 3080 12 GB", "RTX 30", "Ampere", "GA102", "legacy", "2022-01-11", null,
    Object.assign(ga("GA102"), { sm: 70, cuda: 8960, rops: 96, base: 1260, boost: 1710, l2: 6, mem: 12, memType: "GDDR6X", bus: 384, speed: 19, bw: 912, power: 350, pcie: "PCIe 4.0 ×16", nvenc: "1× 7th gen" }, o30),
    { summary: "Mid-cycle version with more SMs and the full 384-bit bus. NVIDIA published no MSRP.", priceNote: "No official MSRP." });

  gf("rtx-3080", "GeForce RTX 3080", "RTX 30", "Ampere", "GA102", "legacy", "2020-09-17", 699,
    Object.assign(ga("GA102"), { sm: 68, cuda: 8704, rops: 96, base: 1440, boost: 1710, l2: 5, mem: 10, memType: "GDDR6X", bus: 320, speed: 19, bw: 760, power: 320, pcie: "PCIe 4.0 ×16", nvenc: "1× 7th gen" }, o30),
    { summary: "The launch Ampere card. Widely unavailable at MSRP during the 2020–21 shortage." });

  gf("rtx-3070-ti", "GeForce RTX 3070 Ti", "RTX 30", "Ampere", "GA104", "legacy", "2021-06-10", 599,
    Object.assign(ga("GA104"), { sm: 48, cuda: 6144, rops: 96, base: 1575, boost: 1770, l2: 4, mem: 8, memType: "GDDR6X", bus: 256, speed: 19, bw: 608, power: 290, pcie: "PCIe 4.0 ×16", nvenc: "1× 7th gen" }, o30),
    { summary: "Full GA104 with GDDR6X." });

  gf("rtx-3070", "GeForce RTX 3070", "RTX 30", "Ampere", "GA104", "legacy", "2020-10-29", 499,
    Object.assign(ga("GA104"), { sm: 46, cuda: 5888, rops: 96, base: 1500, boost: 1725, l2: 4, mem: 8, memType: "GDDR6", bus: 256, speed: 14, bw: 448, power: 220, pcie: "PCIe 4.0 ×16", nvenc: "1× 7th gen" }, o30),
    { summary: "Marketed as matching the RTX 2080 Ti at less than half the price." });

  gf("rtx-3060-ti", "GeForce RTX 3060 Ti", "RTX 30", "Ampere", "GA104", "legacy", "2020-12-02", 399,
    Object.assign(ga("GA104"), { sm: 38, cuda: 4864, rops: 80, base: 1410, boost: 1665, l2: 4, mem: 8, memType: "GDDR6", bus: 256, speed: 14, bw: 448, power: 200, pcie: "PCIe 4.0 ×16", nvenc: "1× 7th gen" }, o30),
    { summary: "Cut-down GA104 with a full 256-bit bus.",
      variants: [{ name: "RTX 3060 Ti (GDDR6X)", diff: "Late-2022 version with 19 Gbps GDDR6X: 608 GB/s." }] });

  gf("rtx-3060", "GeForce RTX 3060", "RTX 30", "Ampere", "GA106", "legacy", "2021-02-25", 329,
    Object.assign(ga("GA106"), { sm: 28, cuda: 3584, rops: 48, base: 1320, boost: 1777, l2: 3, mem: 12, memType: "GDDR6", bus: 192, speed: 15, bw: 360, power: 170, pcie: "PCIe 4.0 ×16", nvenc: "1× 7th gen" }, o30),
    { summary: "Long-running mainstream card with 12 GB on a 192-bit bus.",
      variants: [{ name: "RTX 3060 8 GB", diff: "Late-2022 version with a 128-bit bus: 240 GB/s, noticeably slower." }],
      priceNote: "12 GB version." });

  gf("rtx-3050", "GeForce RTX 3050 8 GB", "RTX 30", "Ampere", "GA106 / GA107", "legacy", "2022-01-27", 249,
    { process: "Samsung 8N", sm: 20, cuda: 2560, rops: 32, base: 1552, boost: 1777, l2: 2, mem: 8, memType: "GDDR6", bus: 128, speed: 14, bw: 224, power: 130, pcie: "PCIe 4.0 ×8", nvenc: "1× 7th gen", outputs: "3× DisplayPort 1.4a, 1× HDMI 2.1" },
    { summary: "Entry Ampere card, built on either GA106 or GA107 depending on batch." });

  gf("rtx-3050-6gb", "GeForce RTX 3050 6 GB", "RTX 30", "Ampere", "GA107", "legacy", "2024-02", 169,
    Object.assign(ga("GA107"), { sm: 18, cuda: 2304, rops: 32, base: 1042, boost: 1470, l2: 2, mem: 6, memType: "GDDR6", bus: 96, speed: 14, bw: 168, power: 70, pcie: "PCIe 4.0 ×8", nvenc: "1× 7th gen" }),
    { summary: "Low-power 70 W version that needs no external power connector. Fewer cores and a narrower bus than the 8 GB card." });

  // ===================================================================
  // GEFORCE RTX 20 / GTX 16 — Turing (TSMC 12FFN)
  // ===================================================================
  const tu = (die) => ({
    TU102: { process: "TSMC 12FFN", transistors: 18.6, die: 754 },
    TU104: { process: "TSMC 12FFN", transistors: 13.6, die: 545 },
    TU106: { process: "TSMC 12FFN", transistors: 10.8, die: 445 },
    TU116: { process: "TSMC 12FFN", transistors: 6.6, die: 284 },
    TU117: { process: "TSMC 12FFN", transistors: 4.7, die: 200 }
  }[die]);

  gf("titan-rtx", "NVIDIA TITAN RTX", "RTX 20", "Turing", "TU102", "legacy", "2018-12-18", 2499,
    Object.assign(tu("TU102"), { sm: 72, cuda: 4608, rops: 96, base: 1350, boost: 1770, l2: 6, mem: 24, memType: "GDDR6", bus: 384, speed: 14, bw: 672, power: 280, pcie: "PCIe 3.0 ×16" }),
    { summary: "Full TU102 with 24 GB. The last TITAN-branded card." });

  gf("rtx-2080-ti", "GeForce RTX 2080 Ti", "RTX 20", "Turing", "TU102", "legacy", "2018-09-20", 999,
    Object.assign(tu("TU102"), { sm: 68, cuda: 4352, rops: 88, base: 1350, boost: 1545, l2: 5.5, mem: 11, memType: "GDDR6", bus: 352, speed: 14, bw: 616, power: 250, pcie: "PCIe 3.0 ×16" }),
    { summary: "The first consumer GPU with dedicated ray-tracing hardware.", priceNote: "Founders Edition launched at $1,199 with a 1,635 MHz boost." });

  gf("rtx-2080-super", "GeForce RTX 2080 SUPER", "RTX 20", "Turing", "TU104", "legacy", "2019-07-23", 699,
    Object.assign(tu("TU104"), { sm: 48, cuda: 3072, rops: 64, base: 1650, boost: 1815, l2: 4, mem: 8, memType: "GDDR6", bus: 256, speed: 15.5, bw: 496, power: 250, pcie: "PCIe 3.0 ×16" }),
    { summary: "Full TU104 with faster memory." });

  gf("rtx-2080", "GeForce RTX 2080", "RTX 20", "Turing", "TU104", "legacy", "2018-09-20", 699,
    Object.assign(tu("TU104"), { sm: 46, cuda: 2944, rops: 64, base: 1515, boost: 1710, l2: 4, mem: 8, memType: "GDDR6", bus: 256, speed: 14, bw: 448, power: 215, pcie: "PCIe 3.0 ×16" }),
    { summary: "Launch Turing card.", priceNote: "Founders Edition launched at $799." });

  gf("rtx-2070-super", "GeForce RTX 2070 SUPER", "RTX 20", "Turing", "TU104", "legacy", "2019-07-09", 499,
    Object.assign(tu("TU104"), { sm: 40, cuda: 2560, rops: 64, base: 1605, boost: 1770, l2: 4, mem: 8, memType: "GDDR6", bus: 256, speed: 14, bw: 448, power: 215, pcie: "PCIe 3.0 ×16" }),
    { summary: "Moved the 70 tier from TU106 to the larger TU104." });

  gf("rtx-2070", "GeForce RTX 2070", "RTX 20", "Turing", "TU106", "legacy", "2018-10-17", 499,
    Object.assign(tu("TU106"), { sm: 36, cuda: 2304, rops: 64, base: 1410, boost: 1620, l2: 4, mem: 8, memType: "GDDR6", bus: 256, speed: 14, bw: 448, power: 175, pcie: "PCIe 3.0 ×16" }),
    { summary: "Full TU106.", priceNote: "Founders Edition launched at $599." });

  gf("rtx-2060-super", "GeForce RTX 2060 SUPER", "RTX 20", "Turing", "TU106", "legacy", "2019-07-09", 399,
    Object.assign(tu("TU106"), { sm: 34, cuda: 2176, rops: 64, base: 1470, boost: 1650, l2: 4, mem: 8, memType: "GDDR6", bus: 256, speed: 14, bw: 448, power: 175, pcie: "PCIe 3.0 ×16" }),
    { summary: "8 GB, 256-bit refresh of the RTX 2060." });

  gf("rtx-2060", "GeForce RTX 2060", "RTX 20", "Turing", "TU106", "legacy", "2019-01-15", 349,
    Object.assign(tu("TU106"), { sm: 30, cuda: 1920, rops: 48, base: 1365, boost: 1680, l2: 3, mem: 6, memType: "GDDR6", bus: 192, speed: 14, bw: 336, power: 160, pcie: "PCIe 3.0 ×16" }),
    { summary: "Entry RTX card of the Turing generation.",
      variants: [{ name: "RTX 2060 12 GB", diff: "December 2021 re-release with 2,176 CUDA cores and 12 GB; 184 W." }] });

  gf("gtx-1660-ti", "GeForce GTX 1660 Ti", "GTX 16", "Turing", "TU116", "legacy", "2019-02-22", 279,
    Object.assign(tu("TU116"), { sm: 24, cuda: 1536, rops: 48, base: 1500, boost: 1770, l2: 1.5, mem: 6, memType: "GDDR6", bus: 192, speed: 12, bw: 288, power: 120, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "Turing without RT or Tensor cores." });

  gf("gtx-1660-super", "GeForce GTX 1660 SUPER", "GTX 16", "Turing", "TU116", "legacy", "2019-10-29", 229,
    Object.assign(tu("TU116"), { sm: 22, cuda: 1408, rops: 48, base: 1530, boost: 1785, l2: 1.5, mem: 6, memType: "GDDR6", bus: 192, speed: 14, bw: 336, power: 125, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "GTX 1660 with 14 Gbps GDDR6 instead of GDDR5." });

  gf("gtx-1660", "GeForce GTX 1660", "GTX 16", "Turing", "TU116", "legacy", "2019-03-14", 219,
    Object.assign(tu("TU116"), { sm: 22, cuda: 1408, rops: 48, base: 1530, boost: 1785, l2: 1.5, mem: 6, memType: "GDDR5", bus: 192, speed: 8, bw: 192, power: 120, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "GDDR5 version of the TU116 card." });

  gf("gtx-1650-super", "GeForce GTX 1650 SUPER", "GTX 16", "Turing", "TU116", "legacy", "2019-11-22", 159,
    Object.assign(tu("TU116"), { sm: 20, cuda: 1280, rops: 32, base: 1530, boost: 1725, l2: 1, mem: 4, memType: "GDDR6", bus: 128, speed: 12, bw: 192, power: 100, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "Uses the larger TU116 rather than TU117." });

  gf("gtx-1650", "GeForce GTX 1650", "GTX 16", "Turing", "TU117", "legacy", "2019-04-23", 149,
    Object.assign(tu("TU117"), { sm: 14, cuda: 896, rops: 32, base: 1485, boost: 1665, l2: 1, mem: 4, memType: "GDDR5", bus: 128, speed: 8, bw: 128, power: 75, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "75 W card that runs from slot power. GDDR6 versions followed in 2020." });

  // ===================================================================
  // GEFORCE GTX 10 — Pascal
  // ===================================================================
  const gp = (die) => ({
    GP102: { process: "TSMC 16FF", transistors: 11.8, die: 471 },
    GP104: { process: "TSMC 16FF", transistors: 7.2, die: 314 },
    GP106: { process: "TSMC 16FF", transistors: 4.4, die: 200 },
    GP107: { process: "Samsung 14LPP", transistors: 3.3, die: 132 },
    GP108: { process: "Samsung 14LPP", transistors: 1.8, die: 74 }
  }[die]);

  gf("titan-xp", "NVIDIA TITAN Xp", "GTX 10", "Pascal", "GP102", "legacy", "2017-04-06", 1199,
    Object.assign(gp("GP102"), { sm: 30, cuda: 3840, rops: 96, base: 1405, boost: 1582, l2: 3, mem: 12, memType: "GDDR5X", bus: 384, speed: 11.4, bw: 548, power: 250, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "Full GP102." });

  gf("gtx-1080-ti", "GeForce GTX 1080 Ti", "GTX 10", "Pascal", "GP102", "legacy", "2017-03-10", 699,
    Object.assign(gp("GP102"), { sm: 28, cuda: 3584, rops: 88, base: 1480, boost: 1582, l2: 2.75, mem: 11, memType: "GDDR5X", bus: 352, speed: 11, bw: 484, power: 250, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "Pascal flagship, matching the original TITAN X Pascal at $699." });

  gf("gtx-1080", "GeForce GTX 1080", "GTX 10", "Pascal", "GP104", "legacy", "2016-05-27", 599,
    Object.assign(gp("GP104"), { sm: 20, cuda: 2560, rops: 64, base: 1607, boost: 1733, l2: 2, mem: 8, memType: "GDDR5X", bus: 256, speed: 10, bw: 320, power: 180, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "First GDDR5X card.", priceNote: "Founders Edition launched at $699.",
      variants: [{ name: "GTX 1080 (11 Gbps)", diff: "2017 refresh with 11 Gbps memory: 352 GB/s." }] });

  gf("gtx-1070-ti", "GeForce GTX 1070 Ti", "GTX 10", "Pascal", "GP104", "legacy", "2017-11-02", 449,
    Object.assign(gp("GP104"), { sm: 19, cuda: 2432, rops: 64, base: 1607, boost: 1683, l2: 2, mem: 8, memType: "GDDR5", bus: 256, speed: 8, bw: 256, power: 180, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "One SM short of a full GTX 1080, with GDDR5." });

  gf("gtx-1070", "GeForce GTX 1070", "GTX 10", "Pascal", "GP104", "legacy", "2016-06-10", 379,
    Object.assign(gp("GP104"), { sm: 15, cuda: 1920, rops: 64, base: 1506, boost: 1683, l2: 2, mem: 8, memType: "GDDR5", bus: 256, speed: 8, bw: 256, power: 150, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "Pascal upper-mainstream card.", priceNote: "Founders Edition launched at $449." });

  gf("gtx-1060-6gb", "GeForce GTX 1060 6 GB", "GTX 10", "Pascal", "GP106", "legacy", "2016-07-19", 249,
    Object.assign(gp("GP106"), { sm: 10, cuda: 1280, rops: 48, base: 1506, boost: 1708, l2: 1.5, mem: 6, memType: "GDDR5", bus: 192, speed: 8, bw: 192, power: 120, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "For years the most common GPU in the Steam Hardware Survey.", priceNote: "Founders Edition launched at $299.",
      variants: [{ name: "GTX 1060 3 GB", diff: "1,152 CUDA cores (9 SMs) and 3 GB; launched at $199. Different GPU configuration despite the shared name." }] });

  gf("gtx-1050-ti", "GeForce GTX 1050 Ti", "GTX 10", "Pascal", "GP107", "legacy", "2016-10-25", 139,
    Object.assign(gp("GP107"), { sm: 6, cuda: 768, rops: 32, base: 1290, boost: 1392, l2: 1, mem: 4, memType: "GDDR5", bus: 128, speed: 7, bw: 112, power: 75, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "75 W, no power connector." });

  gf("gtx-1050", "GeForce GTX 1050", "GTX 10", "Pascal", "GP107", "legacy", "2016-10-25", 109,
    Object.assign(gp("GP107"), { sm: 5, cuda: 640, rops: 32, base: 1354, boost: 1455, l2: 1, mem: 2, memType: "GDDR5", bus: 128, speed: 7, bw: 112, power: 75, pcie: "PCIe 3.0 ×16", noRT: true }),
    { summary: "2 GB entry card. A 3 GB version with a 96-bit bus followed in 2018." });

  gf("gt-1030", "GeForce GT 1030", "GTX 10", "Pascal", "GP108", "legacy", "2017-05-17", 79,
    Object.assign(gp("GP108"), { sm: 3, cuda: 384, rops: 16, base: 1227, boost: 1468, l2: 0.5, mem: 2, memType: "GDDR5", bus: 64, speed: 6, bw: 48, power: 30, pcie: "PCIe 3.0 ×4", noRT: true }),
    { summary: "Low-profile display card. A much slower DDR4 version (20 W) was sold under the same name." });

  // ===================================================================
  // GEFORCE LAPTOP
  // ===================================================================
  function lp(id, name, series, arch, chip, status, launch, s, extra) {
    return add(Object.assign({ id, name, seg: "laptop", series, arch, status, launch, msrp: null, specs: Object.assign({ chip }, s), sources: ["launch"] }, extra || {}));
  }
  const l50 = ["nv-laptop50", "nv-laptop-compare"];
  lp("rtx-5090-laptop", "GeForce RTX 5090 Laptop GPU", "RTX 50", "Blackwell", "GB203", "current", "Q1 2025",
    { sm: 82, cuda: 10496, mem: 24, memType: "GDDR7", bus: 256, bw: 896, boostRange: "1,597–2,160", powerRange: "95–150 W", ai: 1824, nvenc: "3× 9th gen" },
    { summary: "Uses the desktop RTX 5080's GB203 die with 3 GB GDDR7 modules for 24 GB. Laptop makers choose the power limit, which has a large effect on performance.", sources: l50 });
  lp("rtx-5080-laptop", "GeForce RTX 5080 Laptop GPU", "RTX 50", "Blackwell", "GB203", "current", "Q1 2025",
    { sm: 60, cuda: 7680, mem: 16, memType: "GDDR7", bus: 256, bw: 896, boostRange: "1,500–2,287", powerRange: "80–150 W", ai: 1334, nvenc: "2× 9th gen" }, { summary: "Cut-down GB203 with 16 GB.", sources: l50 });
  lp("rtx-5070-ti-laptop", "GeForce RTX 5070 Ti Laptop GPU", "RTX 50", "Blackwell", "GB205", "current", "Q1 2025",
    { sm: 46, cuda: 5888, mem: 12, memType: "GDDR7", bus: 192, bw: 672, boostRange: "1,447–2,220", powerRange: "60–115 W", ai: 992 }, { summary: "GB205 with 12 GB on a 192-bit bus.", sources: l50 });
  lp("rtx-5070-laptop", "GeForce RTX 5070 Laptop GPU", "RTX 50", "Blackwell", "GB206", "current", "Q2 2025",
    { sm: 36, cuda: 4608, mem: 8, memType: "GDDR7", bus: 128, bw: 384, boostRange: "1,425–2,347", powerRange: "50–100 W", ai: 798 }, { summary: "Full GB206 with 8 GB.", sources: l50 });
  lp("rtx-5060-laptop", "GeForce RTX 5060 Laptop GPU", "RTX 50", "Blackwell", "GB206", "current", "Q2 2025",
    { sm: 26, cuda: 3328, mem: 8, memType: "GDDR7", bus: 128, bw: 384, boostRange: "1,455–2,497", powerRange: "45–100 W", ai: 572 }, { summary: "Cut-down GB206.", sources: l50 });
  lp("rtx-5050-laptop", "GeForce RTX 5050 Laptop GPU", "RTX 50", "Blackwell", "GB207", "current", "2025",
    { sm: 20, cuda: 2560, mem: 8, memType: "GDDR7", bus: 128, bw: 384, boostRange: "1,500–2,662", powerRange: "35–100 W", ai: 440 }, { summary: "Entry Blackwell laptop GPU. Uses GDDR7, unlike the desktop RTX 5050.", sources: l50 });

  const l40 = ["nv-laptop-compare", "launch"];
  lp("rtx-4090-laptop", "GeForce RTX 4090 Laptop GPU", "RTX 40", "Ada Lovelace", "AD103", "previous", "Feb 2023",
    { sm: 76, cuda: 9728, mem: 16, memType: "GDDR6", bus: 256, bw: 576, powerRange: "80–150 W" }, { summary: "AD103-based laptop flagship; roughly a desktop RTX 4080 at much lower power.", sources: l40 });
  lp("rtx-4080-laptop", "GeForce RTX 4080 Laptop GPU", "RTX 40", "Ada Lovelace", "AD104", "previous", "Feb 2023",
    { sm: 58, cuda: 7424, mem: 12, memType: "GDDR6", bus: 192, bw: 432, powerRange: "60–150 W" }, { summary: "AD104 with 12 GB.", sources: l40 });
  lp("rtx-4070-laptop", "GeForce RTX 4070 Laptop GPU", "RTX 40", "Ada Lovelace", "AD106", "previous", "Feb 2023",
    { sm: 36, cuda: 4608, mem: 8, memType: "GDDR6", bus: 128, bw: 256, powerRange: "35–115 W" }, { summary: "AD106 with 8 GB.", sources: l40 });
  lp("rtx-4060-laptop", "GeForce RTX 4060 Laptop GPU", "RTX 40", "Ada Lovelace", "AD107", "previous", "Feb 2023",
    { sm: 24, cuda: 3072, mem: 8, memType: "GDDR6", bus: 128, bw: 256, powerRange: "35–115 W" }, { summary: "Full AD107.", sources: l40 });
  lp("rtx-4050-laptop", "GeForce RTX 4050 Laptop GPU", "RTX 40", "Ada Lovelace", "AD107", "previous", "Feb 2023",
    { sm: 20, cuda: 2560, mem: 6, memType: "GDDR6", bus: 96, bw: 192, powerRange: "35–115 W" }, { summary: "Entry Ada laptop GPU with 6 GB.", sources: l40 });

  // ===================================================================
  // RTX PRO — Blackwell workstation
  // ===================================================================
  function pro(id, name, series, arch, chip, status, launch, s, extra) {
    return add(Object.assign({ id, name, seg: "pro", series, arch, status, launch, msrp: null, specs: Object.assign({ chip }, s), sources: ["nv-pro-desktop"] }, extra || {}));
  }
  pro("rtx-pro-6000", "RTX PRO 6000 Blackwell Workstation Edition", "RTX PRO Blackwell", "Blackwell", "GB202", "current", "2025",
    Object.assign(bw("GB202"), { sm: 188, cuda: 24064, tensor: 752, rt: 188, mem: 96, memType: "GDDR7 ECC", bus: 512, bw: 1792, power: 600, fp32: 125, ai: 4000, outputs: "4× DisplayPort 2.1b", form: "Dual slot, double flow-through", mig: "Yes" }),
    { summary: "The most capable desktop graphics card NVIDIA sells: 188 of GB202's 192 SMs, 10% more than the RTX 5090, with three times the memory. Supports Multi-Instance GPU.",
      priceNote: "Not sold at a fixed MSRP. Reported at more than $8,000 per card at launch.",
      variants: [
        { name: "RTX PRO 6000 Blackwell Max-Q Workstation Edition", diff: "Same GPU and 96 GB at 300 W with a blower cooler, for dense multi-GPU workstations." },
        { name: "RTX PRO 6000 Blackwell Server Edition", diff: "Passively cooled data-center version used in RTX PRO Servers." }
      ], sources: ["nv-pro6000", "th-rtxpro", "nv-pro-desktop", "reg-gb10"] });
  pro("rtx-pro-5500", "RTX PRO 5500 Blackwell Workstation Edition", "RTX PRO Blackwell", "Blackwell", "GB202", "announced", "Sep 2026",
    Object.assign(bw("GB202"), { sm: 170, cuda: 21760, mem: 84, memType: "GDDR7 ECC", bus: 416, bw: 1398, power: 600, outputs: "Up to 4× DisplayPort 2.1b", nvenc: "3× 9th gen", form: "Dual slot; liquid-cooled RXM option", mig: "Yes (2× 42 GB)" }),
    { summary: "RTX 5090-class core count with 84 GB of ECC memory on an unusual 416-bit bus. Built for rack-mounted workstation deployments. Listed by NVIDIA as coming soon.",
      sources: ["nv-pro5500", "nc-pro5500", "tt-pro5500", "nv-pro-desktop"] });
  pro("rtx-pro-5000", "RTX PRO 5000 Blackwell", "RTX PRO Blackwell", "Blackwell", "GB202", "current", "2025",
    Object.assign(bw("GB202"), { sm: 110, cuda: 14080, tensor: 440, rt: 110, mem: 48, memType: "GDDR7 ECC", bus: 384, bw: 1344, power: 300, outputs: "4× DisplayPort 2.1b", nvenc: "2× 9th gen", form: "Dual slot" }),
    { summary: "Cut-down GB202 with 48 GB.", variants: [{ name: "RTX PRO 5000 Blackwell 72 GB", diff: "Higher-capacity version added later for larger AI models." }], sources: ["th-rtxpro", "nv-pro-desktop"] });
  pro("rtx-pro-4500", "RTX PRO 4500 Blackwell", "RTX PRO Blackwell", "Blackwell", "GB203", "current", "2025",
    Object.assign(bw("GB203"), { sm: 82, cuda: 10496, tensor: 328, rt: 82, mem: 32, memType: "GDDR7 ECC", bus: 256, bw: 896, power: 200, outputs: "4× DisplayPort 2.1b", nvenc: "2× 9th gen", form: "Dual slot" }),
    { summary: "Near-complete GB203 (82 of 84 SMs) with 32 GB in clamshell, at only 200 W.", variants: [{ name: "RTX PRO 4500 Blackwell Server Edition", diff: "Data-center version shown at GTC 2026." }], sources: ["th-rtxpro", "nv-pro-desktop"] });
  pro("rtx-pro-4000", "RTX PRO 4000 Blackwell", "RTX PRO Blackwell", "Blackwell", "GB203", "current", "2025",
    Object.assign(bw("GB203"), { sm: 70, cuda: 8960, tensor: 280, rt: 70, mem: 24, memType: "GDDR7 ECC", bus: 192, bw: 672, power: 145, outputs: "4× DisplayPort 2.1b", form: "Single slot" }),
    { summary: "Single-slot card with 24 GB.", sources: ["th-rtxpro", "nv-pro-desktop"] });
  pro("rtx-pro-4000-sff", "RTX PRO 4000 Blackwell SFF Edition", "RTX PRO Blackwell", "Blackwell", "—", "current", "2025",
    { mem: 24, memType: "GDDR7 ECC", power: 70, outputs: "4× Mini DisplayPort 2.1b", form: "Low profile, dual slot" },
    { summary: "Low-profile 70 W card for small-form-factor workstations." });
  pro("rtx-pro-2000", "RTX PRO 2000 Blackwell", "RTX PRO Blackwell", "Blackwell", "—", "current", "2025",
    { mem: 16, memType: "GDDR7 ECC", power: 70, outputs: "4× Mini DisplayPort 2.1b", form: "Low profile, dual slot" },
    { summary: "Entry Blackwell workstation card at 70 W." });

  const pl = ["nv-pro-laptop"];
  pro("rtx-pro-5000-laptop", "RTX PRO 5000 Blackwell Laptop GPU", "RTX PRO Blackwell Laptop", "Blackwell", "—", "current", "2025", { cuda: 10496, mem: 24, memType: "GDDR7 ECC", bus: 256, bw: 896, powerRange: "95–175 W", fp32: 49.8, ai: 1824 }, { summary: "Top mobile workstation GPU.", sources: pl });
  pro("rtx-pro-4000-laptop", "RTX PRO 4000 Blackwell Laptop GPU", "RTX PRO Blackwell Laptop", "Blackwell", "—", "current", "2025", { cuda: 7680, mem: 16, memType: "GDDR7 ECC", bus: 256, bw: 896, powerRange: "80–175 W", fp32: 38.7, ai: 1334 }, { summary: "", sources: pl });
  pro("rtx-pro-3000-laptop", "RTX PRO 3000 Blackwell Laptop GPU", "RTX PRO Blackwell Laptop", "Blackwell", "—", "current", "2025", { cuda: 5888, mem: 12, memType: "GDDR7 ECC", bus: 192, bw: 672, powerRange: "60–140 W", fp32: 29.1, ai: 992 }, { summary: "", sources: pl });
  pro("rtx-pro-2000-laptop", "RTX PRO 2000 Blackwell Laptop GPU", "RTX PRO Blackwell Laptop", "Blackwell", "—", "current", "2025", { cuda: 3328, mem: 8, memType: "GDDR7", bus: 128, bw: 384, powerRange: "45–115 W", fp32: 17.7, ai: 572 }, { summary: "", sources: pl });
  pro("rtx-pro-1000-laptop", "RTX PRO 1000 Blackwell Laptop GPU", "RTX PRO Blackwell Laptop", "Blackwell", "—", "current", "2025", { cuda: 2560, mem: 8, memType: "GDDR7", bus: 128, bw: 384, powerRange: "35–115 W", fp32: 13.6, ai: 440 }, { summary: "", sources: pl });
  pro("rtx-pro-500-laptop", "RTX PRO 500 Blackwell Laptop GPU", "RTX PRO Blackwell Laptop", "Blackwell", "—", "current", "2025", { cuda: 1792, mem: 6, memType: "GDDR7", bus: 96, bw: 288, powerRange: "35–75 W", fp32: 9.2, ai: 294 }, { summary: "Entry mobile workstation GPU.", sources: pl });

  // RTX Ada Generation (previous)
  const ada = ["launch"];
  pro("rtx-6000-ada", "RTX 6000 Ada Generation", "RTX Ada", "Ada Lovelace", "AD102", "previous", "Dec 2022", Object.assign(ad("AD102"), { sm: 142, cuda: 18176, mem: 48, memType: "GDDR6 ECC", bus: 384, bw: 960, power: 300 }), { msrp: 6800, summary: "Previous workstation flagship.", sources: ada });
  pro("rtx-5000-ada", "RTX 5000 Ada Generation", "RTX Ada", "Ada Lovelace", "AD102", "previous", "Aug 2023", Object.assign(ad("AD102"), { sm: 100, cuda: 12800, mem: 32, memType: "GDDR6 ECC", bus: 256, bw: 576, power: 250 }), { msrp: 4000, summary: "", sources: ada });
  pro("rtx-4500-ada", "RTX 4500 Ada Generation", "RTX Ada", "Ada Lovelace", "AD104", "previous", "Aug 2023", Object.assign(ad("AD104"), { sm: 60, cuda: 7680, mem: 24, memType: "GDDR6 ECC", bus: 192, bw: 432, power: 210 }), { msrp: 2250, summary: "", sources: ada });
  pro("rtx-4000-ada", "RTX 4000 Ada Generation", "RTX Ada", "Ada Lovelace", "AD104", "previous", "Aug 2023", Object.assign(ad("AD104"), { sm: 48, cuda: 6144, mem: 20, memType: "GDDR6 ECC", bus: 160, bw: 360, power: 130 }), { msrp: 1250, summary: "Single-slot.", sources: ada });
  pro("rtx-4000-sff-ada", "RTX 4000 SFF Ada Generation", "RTX Ada", "Ada Lovelace", "AD104", "previous", "Mar 2023", Object.assign(ad("AD104"), { sm: 48, cuda: 6144, mem: 20, memType: "GDDR6 ECC", bus: 160, bw: 280, power: 70 }), { msrp: 1250, summary: "Low-profile 70 W.", sources: ada });
  pro("rtx-2000-ada", "RTX 2000 Ada Generation", "RTX Ada", "Ada Lovelace", "AD107", "previous", "Feb 2024", Object.assign(ad("AD107"), { sm: 22, cuda: 2816, mem: 16, memType: "GDDR6 ECC", bus: 128, bw: 224, power: 70 }), { msrp: 625, summary: "Low-profile 70 W.", sources: ada });

  // ===================================================================
  // DATA CENTER
  // ===================================================================
  function dc(id, name, series, arch, status, launch, s, extra) {
    return add(Object.assign({ id, name, seg: "datacenter", series, arch, status, launch, msrp: null, specs: s, sources: ["launch"] }, extra || {}));
  }

  // Roadmap
  dc("feynman", "Feynman (with Rosa CPU)", "Feynman", "Feynman", "roadmap", "2028",
    { form: "Kyber racks, scaling to NVL1152", memType: "Custom HBM", cpu: "Rosa", nvlink: "NVLink 8, co-packaged optics" },
    { summary: "Next architecture after Rubin. NVIDIA has disclosed 3D die stacking, custom HBM, a new Rosa CPU, Groq-derived LP40 LPUs and optical NVLink. Performance figures have not been published.", sources: ["wccf-feynman", "th-roadmap", "jpr-gtc26", "hpc-kyber"] });
  dc("rubin-ultra-nvl576", "Vera Rubin Ultra NVL576 (Kyber)", "Rubin Ultra", "Rubin", "roadmap", "H2 2027",
    { form: "Kyber rack, vertical compute blades, liquid-cooled", power: "~600 kW per rack (stated)", nvlink: "NVLink 7" },
    { summary: "The largest Rubin Ultra configuration: 576 GPU dies in a single NVLink domain. Kyber will also be offered as NVL72 and NVL144.", sources: ["hpc-kyber", "dcd-nvl576", "th-roadmap"] });
  dc("rubin-ultra", "Rubin Ultra", "Rubin Ultra", "Rubin", "roadmap", "2027",
    { mem: 1024, memType: "HBM4E", form: "Four compute chiplets per package" },
    { summary: "2027 successor to Rubin with four reticle-sized compute chiplets and about 1 TB of HBM4E per package. Pairs with Groq LP35 LPUs.", sources: ["th-roadmap", "th-rubin-plan"] });

  // Rubin (2026)
  dc("vera-rubin-nvl72", "Vera Rubin NVL72", "Vera Rubin", "Rubin", "current", "H2 2026",
    { gpus: "72 Rubin GPUs, 36 Vera CPUs", mem: 20700, memType: "HBM4", bw: 1580000, fp4: "3,600 PF inference · 2,520 PF training", fp8: "1,260 PF", fp16: "288 PF", fp64: "2,400 TF", nvlink: "NVLink 6 — 260 TB/s", cpu: "3,168 Olympus cores, 54 TB LPDDR5X", form: "MGX Oberon rack, liquid-cooled" },
    { summary: "NVIDIA's 2026 rack-scale system, in full production and shipping. Earlier roadmaps called this configuration 'NVL144' because it counts GPU dies; NVIDIA's product name is NVL72. NVIDIA claims up to 10× more tokens per megawatt than GB200 NVL72.", sources: ["nv-vr"] });
  dc("vera-rubin-superchip", "Vera Rubin Superchip", "Vera Rubin", "Rubin", "current", "H2 2026",
    { gpus: "2 Rubin GPUs, 1 Vera CPU", mem: 576, memType: "HBM4", bw: 44000, fp4: "100 PF inference · 70 PF training", fp8: "35 PF", fp64: "67 TF", nvlink: "7.2 TB/s; NVLink-C2C 1.8 TB/s", cpu: "88 Olympus cores, 1.5 TB LPDDR5X" },
    { summary: "The board-level building block of Vera Rubin systems.", sources: ["nv-vr", "ts-vr"] });
  dc("rubin", "Rubin GPU", "Vera Rubin", "Rubin", "current", "H2 2026",
    { process: "TSMC 3 nm class", transistors: 336, mem: 288, memType: "HBM4", bw: 22000, fp4: "50 PF inference · 35 PF training", fp8: "17.5 PF", fp16: "4 PF", fp32: 130, fp64: "33 TF", nvlink: "NVLink 6 — 3.6 TB/s", form: "Two reticle-sized dies per package" },
    { summary: "Successor to Blackwell for data centers, with HBM4 and a new NVFP4 Transformer Engine.",
      variants: [{ name: "Rubin CPX", diff: "Announced GDDR7-based inference variant for long-context prefill. No longer shown on NVIDIA's 2026 roadmap, which now pairs Rubin with Groq LPUs instead." }],
      sources: ["nv-vr", "th-roadmap"] });
  dc("groq-3-lpx", "Groq 3 LPX (LPU rack)", "Vera Rubin", "Groq LPU", "current", "2026",
    { gpus: "256 LPUs per rack", mem: 128, memType: "SRAM", bw: 40000000, nvlink: "640 TB/s scale-up per rack" },
    { summary: "A low-latency inference rack built on Groq LPUs, designed to sit alongside Vera Rubin NVL72. Not a GPU, but part of the same platform.", sources: ["nv-vr", "th-roadmap"] });

  // Blackwell Ultra
  dc("gb300-nvl72", "GB300 NVL72", "Blackwell Ultra", "Blackwell", "current", "H2 2025",
    { gpus: "72 Blackwell Ultra GPUs, 36 Grace CPUs", mem: 20000, memType: "HBM3e (up to 40 TB total fast memory)", fp4: "~1.1 EF dense", form: "Liquid-cooled rack" },
    { summary: "Blackwell Ultra rack, about 1.5× the FP4 throughput of GB200 NVL72.", sources: ["nv-bwu-reasoning", "th-b300", "th-rubin-plan"] });
  dc("b300", "B300 (Blackwell Ultra)", "Blackwell Ultra", "Blackwell", "current", "H2 2025",
    { process: "TSMC 4NP", transistors: 208, sm: 160, tensor: 640, mem: 288, memType: "HBM3e (12-high)", bw: 8000, fp4: "15 PF dense · 30 PF sparse", fp64: "~1.2–1.4 TF", power: "up to 1,400 W", pcie: "PCIe 6.0", form: "Two reticle-sized dies" },
    { summary: "Blackwell Ultra trades almost all FP64 throughput for 50% more NVFP4 compute and 50% more memory than B200.", sources: ["nv-bwu", "th-b300", "th-bwu"] });

  // Blackwell
  dc("gb200-nvl72", "GB200 NVL72", "Blackwell", "Blackwell", "current", "Late 2024",
    { gpus: "72 B200 GPUs, 36 Grace CPUs", memType: "HBM3e", form: "Liquid-cooled rack, ~120 kW class" },
    { summary: "The rack-scale system that defined Blackwell deployments: 72 GPUs in one NVLink domain acting as a single large accelerator." });
  dc("b200", "B200", "Blackwell", "Blackwell", "current", "Late 2024",
    { process: "TSMC 4NP", transistors: 208, mem: 192, memType: "HBM3e", bw: 8000, fp4: "10 PF dense · 20 PF sparse", fp64: "40 TF", power: "up to 1,200 W", pcie: "PCIe 5.0", nvlink: "NVLink 5 — 1.8 TB/s", form: "Two reticle-sized dies" },
    { summary: "The first dual-die NVIDIA data-center GPU. Sold on 8-GPU HGX B200 boards and inside GB200 systems.", sources: ["th-bwu", "th-b300"] });

  // Hopper
  dc("h200", "H200", "Hopper", "Hopper", "previous", "2024",
    { process: "TSMC 4N", transistors: 80, mem: 141, memType: "HBM3e", bw: 4800, power: "up to 700 W", nvlink: "900 GB/s" },
    { summary: "H100 compute with more and faster memory." });
  dc("h100-sxm", "H100 SXM", "Hopper", "Hopper", "previous", "2022",
    { process: "TSMC 4N", transistors: 80, die: 814, sm: 132, cuda: 16896, mem: 80, memType: "HBM3", bw: 3350, fp8: "~2 PF dense", power: "up to 700 W", nvlink: "900 GB/s" },
    { summary: "The GPU behind the 2023–24 generative AI build-out.",
      variants: [
        { name: "H100 PCIe", diff: "114 SMs, 80 GB HBM2e at about 2 TB/s, 350 W." },
        { name: "H100 NVL", diff: "94 GB HBM3 at about 3.9 TB/s, PCIe card sold in bridged pairs." },
        { name: "H800 / H20", diff: "Export-compliant versions for China with reduced interconnect or compute." }
      ] });
  dc("gh200", "GH200 Grace Hopper", "Hopper", "Hopper", "previous", "2023",
    { gpus: "1 H100-class GPU + 72-core Grace CPU", memType: "96 GB HBM3 or 144 GB HBM3e", nvlink: "NVLink-C2C 900 GB/s" },
    { summary: "NVIDIA's first CPU-plus-GPU Superchip." });

  // Ada / Ampere / Volta data center
  dc("l40s", "L40S", "Ada data center", "Ada Lovelace", "previous", "2023",
    { process: "TSMC 4N", cuda: 18176, mem: 48, memType: "GDDR6 ECC", bw: 864, power: "350 W", form: "PCIe, dual slot, passive" },
    { summary: "PCIe card for inference, graphics and video workloads.", variants: [{ name: "L40", diff: "Same GPU at 300 W, aimed at graphics and Omniverse." }] });
  dc("l4", "L4", "Ada data center", "Ada Lovelace", "previous", "2023",
    { process: "TSMC 4N", cuda: 7424, mem: 24, memType: "GDDR6", bw: 300, power: "72 W", form: "PCIe, low profile, single slot" },
    { summary: "Low-power inference and video card." });
  dc("a100", "A100", "Ampere data center", "Ampere", "legacy", "2020",
    { process: "TSMC 7N", transistors: 54.2, die: 826, sm: 108, cuda: 6912, mem: 80, memType: "HBM2e", bw: 2039, fp16: "312 TF dense", fp64: "9.7 TF (19.5 TF Tensor)", power: "up to 400 W (SXM)" },
    { summary: "Ampere data-center GPU; introduced Multi-Instance GPU partitioning.", variants: [{ name: "A100 40 GB", diff: "HBM2 at about 1.55 TB/s." }] });
  dc("v100", "V100", "Volta", "Volta", "legacy", "2017",
    { process: "TSMC 12FFN", transistors: 21.1, die: 815, sm: 80, cuda: 5120, tensor: 640, mem: 32, memType: "HBM2", bw: 900, power: "300 W (SXM2)" },
    { summary: "The first GPU with Tensor Cores.", variants: [{ name: "V100 16 GB", diff: "Original 16 GB configuration." }] });

  // ===================================================================
  // AI PCs & SYSTEMS
  // ===================================================================
  function sys(id, name, series, arch, status, launch, msrp, s, extra) {
    return add(Object.assign({ id, name, seg: "systems", series, arch, status, launch, msrp, specs: s, sources: ["launch"] }, extra || {}));
  }
  sys("rtx-spark-n1x", "RTX Spark Superchip (20-core)", "RTX Spark", "Grace Blackwell", "current", "2026-10-16", null,
    { cpu: "20-core NVIDIA Grace (Arm)", cuda: 6144, mem: "24–128 GB unified", fp4: "~1 PF (sparse)", platform: "Windows on Arm", form: "14–16-inch laptops and compact desktops" },
    { summary: "NVIDIA's first CPU-and-GPU chip for Windows PCs, developed with MediaTek (codename N1X). More than 30 laptops and about 10 compact desktops were announced from ASUS, Dell, HP, Lenovo, Microsoft Surface and MSI.",
      priceNote: "NVIDIA publishes no chip price. Launch laptops start at $2,599.",
      sources: ["th-spark", "imp-spark", "mixed-spark", "ti-spark-price"] });
  sys("rtx-spark-18", "RTX Spark Superchip (18-core)", "RTX Spark", "Grace Blackwell", "current", "2026-10-16", null,
    { cpu: "18-core Grace (Arm)", cuda: 5120, mem: "24 or 32 GB unified", platform: "Windows on Arm", form: "Laptops only at launch" },
    { summary: "The second RTX Spark configuration, for thinner and lower-cost laptops.", sources: ["imp-spark"] });
  sys("dgx-spark", "DGX Spark (128 GB)", "DGX", "Grace Blackwell", "current", "2025-10-15", 3999,
    { chip: "GB10 Grace Blackwell", cpu: "20-core Arm", cuda: 6144, mem: 128, memType: "LPDDR5X unified", bw: 273, fp4: "1 PF (sparse)", net: "ConnectX-7, 200 Gb/s", platform: "DGX OS (Linux)" },
    { summary: "Desktop AI developer system, formerly Project DIGITS. Two units can be linked. OEM versions are sold by ASUS, Dell, HP, Lenovo and MSI.",
      priceNote: "Launched at $3,999; raised to $4,699 in February 2026 and listed at $6,950 by late 2026 because of memory costs.",
      variants: [{ name: "DGX Spark 64 GB", diff: "Lower-memory version introduced in 2026 at $4,999; same chip and 273 GB/s bandwidth." }],
      sources: ["reg-gb10", "th-dgxspark-price", "reg-spark64"] });
  sys("dgx-station", "DGX Station (GB300)", "DGX", "Blackwell Ultra", "current", "2025–26", null,
    { chip: "GB300 Grace Blackwell Ultra Desktop Superchip", platform: "Linux; Windows version announced", form: "Deskside workstation" },
    { summary: "Deskside system built on Blackwell Ultra, positioned for models up to about 1 trillion parameters. A DGX Station for Windows was announced at Computex 2026, with an optional RTX PRO 6000 for graphics.",
      sources: ["eenews-ces26", "techzine-station"] });

  // ===================================================================
  // EDGE & AUTOMOTIVE
  // ===================================================================
  function edge(id, name, series, arch, status, launch, msrp, s, extra) {
    return add(Object.assign({ id, name, seg: "edge", series, arch, status, launch, msrp, specs: s, sources: ["launch"] }, extra || {}));
  }
  edge("jetson-t5000", "Jetson T5000 / AGX Thor", "Jetson Thor", "Blackwell", "current", "2025-08-25", 2999,
    { cuda: 2560, tensor: 96, cpu: "14-core Arm Neoverse", mem: 128, memType: "LPDDR5X", fp4: "2,070 TFLOPS (sparse)", powerRange: "40–130 W", mig: "Yes (10 TPCs)" },
    { summary: "Robotics and physical-AI module. NVIDIA rates it at 7.5× the AI compute of AGX Orin.",
      priceNote: "Module price. The Jetson AGX Thor Developer Kit is sold separately.",
      sources: ["nv-thor", "nv-thor-blog", "itm-thor"] });
  edge("jetson-t4000", "Jetson T4000", "Jetson Thor", "Blackwell", "current", "Q4 2025", 1999,
    { cpu: "12-core Arm Neoverse", mem: 64, memType: "LPDDR5X", fp4: "1,200 TFLOPS (sparse)", powerRange: "up to 70 W" },
    { summary: "Lower-power Thor module, pin-compatible with T5000.", sources: ["nv-thor", "itm-thor"] });
  edge("jetson-agx-orin", "Jetson AGX Orin 64 GB", "Jetson Orin", "Ampere", "current", "2022", null,
    { cuda: 2048, tensor: 64, cpu: "12-core Arm Cortex-A78AE", mem: 64, memType: "LPDDR5", bw: 204.8, ai: 275, powerRange: "15–60 W" },
    { summary: "Previous flagship robotics module.", variants: [{ name: "Jetson AGX Orin 32 GB", diff: "Smaller GPU and CPU, 200 TOPS, 15–40 W." }] });
  edge("jetson-orin-nano-super", "Jetson Orin Nano Super Developer Kit", "Jetson Orin", "Ampere", "current", "Dec 2024", 249,
    { cuda: 1024, tensor: 32, cpu: "6-core Arm Cortex-A78AE", mem: 8, memType: "LPDDR5", bw: 102, ai: 67, powerRange: "7–25 W" },
    { summary: "Low-cost developer kit for edge generative AI.", variants: [{ name: "Jetson Orin NX 16 GB / 8 GB", diff: "Production modules with 157 / 117 TOPS in Super mode." }] });
  edge("drive-agx-thor", "DRIVE AGX Thor", "DRIVE", "Blackwell", "current", "2025", null,
    { form: "Centralized in-vehicle computer", platform: "DRIVE OS; DRIVE Hyperion reference design" },
    { summary: "Automotive computer at the core of NVIDIA's DRIVE Hyperion level-4 reference architecture.", sources: ["eenews-ces26"] });
  edge("igx-thor", "IGX Thor", "IGX", "Blackwell", "current", "2025–26", null,
    { form: "Industrial and medical edge platform with functional safety" },
    { summary: "Thor-based platform for regulated edge deployments such as surgical robotics. Some IGX Thor and Jetson Orin implementations are qualified for use in space.", sources: ["eenews-ces26"] });

  // ===================================================================
  // ARCHITECTURES
  // ===================================================================
  const ARCHS = [
    { name: "Pascal", year: "2016", process: "TSMC 16 nm / Samsung 14 nm", namesake: "Blaise Pascal", products: "GTX 10, TITAN Xp, Tesla P100", key: "GDDR5X and HBM2; large efficiency gain over Maxwell." },
    { name: "Volta", year: "2017", process: "TSMC 12 nm", namesake: "Alessandro Volta", products: "V100, TITAN V", key: "First Tensor Cores." },
    { name: "Turing", year: "2018", process: "TSMC 12 nm", namesake: "Alan Turing", products: "RTX 20, GTX 16, TITAN RTX", key: "First RT cores; DLSS 1.0." },
    { name: "Ampere", year: "2020", process: "Samsung 8 nm / TSMC 7 nm", namesake: "André-Marie Ampère", products: "RTX 30, A100, Jetson Orin", key: "2nd-gen RT, 3rd-gen Tensor, GDDR6X, MIG." },
    { name: "Hopper", year: "2022", process: "TSMC 4N", namesake: "Grace Hopper", products: "H100, H200, GH200", key: "Transformer Engine with FP8." },
    { name: "Ada Lovelace", year: "2022", process: "TSMC 4N", namesake: "Ada Lovelace", products: "RTX 40, RTX Ada, L40S, L4", key: "DLSS 3 Frame Generation; very large L2 cache." },
    { name: "Blackwell", year: "2024–25", process: "TSMC 4NP / 4N", namesake: "David Blackwell", products: "RTX 50, RTX PRO, B200, GB200, B300, DGX Spark, RTX Spark, Jetson Thor", key: "FP4 Tensor Cores, GDDR7, dual-die data-center GPUs, DLSS 4 Multi Frame Generation and DLSS 5." },
    { name: "Rubin", year: "2026–27", process: "TSMC 3 nm class", namesake: "Vera Rubin", products: "Rubin, Vera Rubin NVL72, Rubin Ultra", key: "HBM4, NVLink 6, Vera CPU with custom Olympus cores." },
    { name: "Feynman", year: "2028", process: "Not disclosed", namesake: "Richard Feynman", products: "Feynman GPU, Rosa CPU", key: "3D die stacking, custom HBM, optical NVLink." }
  ];

  const GLOSSARY = [
    ["CUDA cores", "NVIDIA's name for its FP32 shader ALUs. Counts are only comparable within one architecture."],
    ["SM (Streaming Multiprocessor)", "The repeating compute block in an NVIDIA GPU. Since Ampere each SM has 128 CUDA cores, 4 Tensor Cores and 1 RT core."],
    ["Tensor Cores", "Matrix-math units used for AI and DLSS. Blackwell's 5th-generation Tensor Cores add FP4."],
    ["RT cores", "Fixed-function units that accelerate ray-triangle intersection for ray and path tracing."],
    ["AI TOPS", "NVIDIA's headline AI figure for GeForce and RTX PRO. For RTX 50 it is FP4 with sparsity; for RTX 40 it is FP8 with sparsity. Do not compare across generations."],
    ["TGP / TBP", "Total graphics (or board) power: the power limit of the card. For laptops the range is set by the laptop maker."],
    ["Memory bandwidth", "Bus width × per-pin data rate ÷ 8. A 256-bit bus at 28 Gbps gives 896 GB/s."],
    ["GDDR7 / GDDR6X / HBM", "Graphics memory types. HBM (High Bandwidth Memory) is stacked beside the GPU and used in data-center parts."],
    ["NVFP4", "NVIDIA's 4-bit floating-point format for AI inference, introduced with Blackwell."],
    ["NVLink", "NVIDIA's GPU-to-GPU interconnect. NVL72 means 72 GPU packages share one NVLink domain."],
    ["Superchip", "A board or package combining NVIDIA's own CPU (Grace or Vera) with one or more GPUs over NVLink-C2C."],
    ["MIG", "Multi-Instance GPU: splitting one GPU into isolated partitions."],
    ["DLSS", "Deep Learning Super Sampling. DLSS 4 added Multi Frame Generation; DLSS 4.5 added Dynamic MFG; DLSS 5 (2026) adds 3D-Guided Neural Rendering on RTX 50."]
  ];

  window.GPU_ATLAS = { list: L, SOURCES, SEGMENTS, STATUS, ARCHS, GLOSSARY, updated: "21 November 2026" };
})();
