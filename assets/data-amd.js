/* GPU Atlas — AMD dataset and regional launch prices.
 * Loaded after data.js. Units as in data.js. AMD "sp" = stream processors, "cu" = compute units,
 * "ic" = Infinity Cache (MB), "rta" = ray accelerators, "aia" = AI accelerators.
 */
(function () {
  const D = window.GPU_ATLAS;
  const L = D.list;

  Object.assign(D.SOURCES, {
    "amd-qrg": { t: "AMD — Radeon RX 9000 Series desktop quick reference guide (July 2026)", u: "https://www.amd.com/content/dam/amd/en/documents/corporate/events/radeon-9000-series-qrg-competitive.pdf" },
    "amd-rdna4": { t: "AMD — RDNA 4 and Radeon RX 9070 series announcement", u: "https://newsroom.amd.com/news/amd-unveils-next-generation-amd-rdna-4-architectu/" },
    "th-9060xt": { t: "Tom's Hardware — RX 9060 XT launches from $299", u: "https://www.tomshardware.com/pc-components/gpus/amd-radeon-rx-9060-xt-launches-on-june-5-starting-at-usd299" },
    "wccf-9060": { t: "Wccftech — RX 9060 (non-XT): 1,792 SPs, 8 GB", u: "https://wccftech.com/amd-officially-announces-radeon-rx-9060/" },
    "wccf-9070gre": { t: "Wccftech — RX 9070 GRE 12 GB launched at $549", u: "https://wccftech.com/amd-radeon-rx-9070-gre-12-gb-launched-22-percent-faster-vs-5060-ti-549-us-price/amp/" },
    "ti-9070gre": { t: "Tech Insider — RX 9070 GRE global launch", u: "https://tech-insider.org/rx-9070-gre-global-launch-2026/" },
    "guru3d-9050": { t: "Guru3D — Radeon RX 9050 price and specifications", u: "https://www.guru3d.com/story/amds-radeon-rx-9050-price-sits-uncomfortably-close-to-rx-9060-xt/" },
    "nc-9050": { t: "Notebookcheck — RX 9050 launches at $279", u: "https://www.notebookcheck.net/AMD-launches-Radeon-RX-9050-at-279-with-OEM-only-variant.1354375.0.html" },
    "nc-9000m": { t: "Notebookcheck — RX 9000M laptop GPU leak", u: "https://www.notebookcheck.net/Major-RX-9000-RDNA-4-laptop-GPU-leak-reveals-specs-of-RX-9080M-RX-9070M-XT-and-more.1007213.0.html" },
    "tt-9080m": { t: "TweakTown — RX 9080M leak", u: "https://www.tweaktown.com/news/104825/amd-radeon-rx-9080m-teased-flagship-rdna-4-laptop-gpu-has-64-compute-units-16gb-gddr6-memory/index.html" },
    "th-r9700": { t: "Tom's Hardware — Radeon AI PRO R9700 launch", u: "https://www.tomshardware.com/pc-components/gpus/amd-launches-radeon-ai-pro-r9700-to-challenge-nvidias-ai-market-dominance" },
    "cgm-r9700": { t: "CGMagazine — Radeon AI PRO R9700 priced at $1,299", u: "https://tech.yahoo.com/computing/articles/amd-unveils-pricing-radeon-ai-190353250.html" },
    "tpu-r9600d": { t: "TechPowerUp — Radeon AI PRO R9700S and R9600D", u: "https://www.techpowerup.com/343977/amd-unveils-radeon-ai-pro-r9700s-and-r9600d-gpus" },
    "amd-mi400": { t: "AMD — Instinct MI400 Series and Helios", u: "https://www.amd.com/en/products/accelerators/instinct/mi400.html" },
    "amd-mi455x": { t: "AMD — Instinct MI455X specifications", u: "https://www.amd.com/en/products/accelerators/instinct/mi400/mi455x.html" },
    "amd-mi450x": { t: "AMD — Instinct MI450X specifications", u: "https://www.amd.com/en/products/accelerators/instinct/mi400/mi450x.html" },
    "amd-helios": { t: "AMD — Helios rack brochure", u: "https://www.amd.com/content/dam/amd/en/documents/solutions/ai/amd-helios-bro.pdf" },
    "tpu-mi400": { t: "TechPowerUp — Instinct MI400 and Helios debut", u: "https://www.techpowerup.com/351006/" },
    "jpr-mi400": { t: "Jon Peddie Research — AMD widens MI400 family", u: "https://www.jonpeddie.com/news/amd-widens-mi400-family-for-helios/" },
    "amd-mi355x": { t: "AMD — Instinct MI355X specifications", u: "https://www.amd.com/en/products/accelerators/instinct/mi350/mi355x.html" },
    "amd-mi350x": { t: "AMD — Instinct MI350X specifications", u: "https://www.amd.com/en/products/accelerators/instinct/mi350/mi350x.html" },
    "th-mi355x": { t: "Tom's Hardware — MI355X at 1,400 W", u: "https://www.tomshardware.com/pc-components/gpus/amds-instinct-mi355x-accelerator-will-consume-1-400-watts" },
    "amd-mi325x": { t: "AMD — Instinct MI325X specifications", u: "https://amd.com/en/products/accelerators/instinct/mi300/mi325x.html" },
    "amd-mi300": { t: "AMD — Instinct MI300 Series", u: "https://amd.com/en/products/accelerators/instinct/mi300.html" },
    "th-strixhalo": { t: "Tom's Hardware — Ryzen AI Max (Strix Halo) debut", u: "https://www.tomshardware.com/pc-components/cpus/amds-beastly-strix-halo-ryzen-ai-max-debuts-with-radical-new-memory-tech-to-feed-rdna-3-5-graphics-and-zen-5-cpu-cores" },
    "th-gorgon": { t: "Tom's Hardware — Ryzen AI Max 400 (Gorgon Halo)", u: "https://www.tomshardware.com/pc-components/cpus/amd-ryzen-ai-max-400-gorgon-halo-packs-up-to-192gb-of-unified-memory-refreshed-apu-uses-zen-5-and-rdna-3-5-and-can-clock-up-to-5-2-ghz" },
    // regional pricing
    "p-in": { t: "Indian Video Gamer — RTX 50 Series India prices", u: "https://www.indianvideogamer.com/?p=33874" },
    "p-uk": { t: "PC Gamer — RTX 50 FE prices in the UK (launch and revised)", u: "https://pcgamer.com/hardware/graphics-cards/nvidia-has-cut-the-msrp-of-rtx-50-series-fe-cards-in-the-uk-and-europe-and-that-means-not-a-whole-lot-right-now" },
    "p-eu": { t: "KitGuru — RTX 50 price changes across Europe", u: "https://www.kitguru.net/page/74/!https:/www.kitguru.net/components/graphic-cards/matthew-wilson/nvidia-reveals-new-price-cuts-for-rtx-5090-rtx-5080-and-rtx-5070-across-europe/" },
    "p-eu2": { t: "PCGamesN — RTX 50 prices in Germany", u: "https://www.pcgamesn.com/nvidia/rtx-5000-europe-price-cut" },
    "p-au": { t: "Stevivor — RTX 50 Australian prices", u: "https://stevivor.com/news/nvidia-geforce-rtx-5000-series-starts-at-1109-ends-at-4039-aud/" },
    "p-jp": { t: "GAME Watch — RTX 50 Japanese prices", u: "https://game.watch.impress.co.jp/docs/news/1652669.html" },
    "p-cn": { t: "TweakTown — RTX 5090 D V2 launched at 16,499 yuan", u: "https://www.tweaktown.com/news/106995/" },
    "p-ca": { t: "Tech Insider Canada — RTX 5090 Canadian launch price", u: "https://tech-insider.org/ca/rtx-5090-price-surge-canada-2026/" },
    "p-5060ti-uk": { t: "OC3D — RTX 5060 Ti UK MSRPs", u: "https://overclock3d.net/news/gpu-displays/nvidia-confirms-the-uk-msrps-for-their-rtx-5060-ti/" },
    "p-5060ti-au": { t: "TechSpot — RX 9070 XT pricing by region (incl. RTX 5060 Ti AU MSRP)", u: "https://www.techspot.com/article/2987-ai-video-narrative-potential/" },
    "p-9070xt-uk": { t: "TweakTown — RX 9070 XT UK MSRP £569", u: "https://www.tweaktown.com/news/111797/amd-radeon-rx-9070-xt-pricing-falls-near-msrp-in-the-uk-reaching-record-lows-in-japan/images/applenews.png" }
  });

  // Brand-neutral segment names now that the database covers two vendors
  Object.assign(D.SEGMENTS, {
    desktop: "Desktop graphics",
    laptop: "Laptop graphics",
    pro: "Workstation",
    datacenter: "Data center",
    systems: "AI PCs & systems",
    edge: "Edge & automotive"
  });
  L.forEach((g) => { if (!g.brand) g.brand = "NVIDIA"; });

  const add = (o) => { o.brand = "AMD"; L.push(o); return o; };
  function a(seg, id, name, series, arch, chip, status, launch, msrp, specs, extra) {
    return add(Object.assign({ id, name, seg, series, arch, status, launch, msrp, specs: Object.assign(chip ? { chip } : {}, specs), sources: ["launch"] }, extra || {}));
  }

  // ===== Radeon RX 9000 — RDNA 4 (TSMC N4P) =====
  const n48 = { process: "TSMC N4P", transistors: 53.9, die: 357 };
  const n44 = { process: "TSMC N4P", transistors: 29.7, die: 199 };
  const o9 = { outputs: "DisplayPort 2.1a, HDMI 2.1b" };
  const s9 = ["amd-qrg", "amd-rdna4"];

  a("desktop", "rx-9070-xt", "Radeon RX 9070 XT", "RX 9000", "RDNA 4", "Navi 48", "current", "2025-03-06", 599,
    Object.assign({}, n48, { cu: 64, sp: 4096, rta: 64, aia: 128, boost: 2970, mem: 16, memType: "GDDR6", bus: 256, speed: 20, bw: 640, ic: 64, power: 304, pcie: "PCIe 5.0 ×16" }, o9),
    { summary: "AMD's fastest RDNA 4 card. Full Navi 48 with 16 GB, aimed at 1440p and 4K against the RTX 5070 Ti.", sources: s9 });
  a("desktop", "rx-9070", "Radeon RX 9070", "RX 9000", "RDNA 4", "Navi 48", "current", "2025-03-06", 549,
    Object.assign({}, n48, { cu: 56, sp: 3584, rta: 56, aia: 112, boost: 2520, mem: 16, memType: "GDDR6", bus: 256, speed: 20, bw: 640, ic: 64, power: 220, pcie: "PCIe 5.0 ×16" }, o9),
    { summary: "Cut-down Navi 48 at 220 W with the same 16 GB as the XT.", sources: s9 });
  a("desktop", "rx-9070-gre", "Radeon RX 9070 GRE", "RX 9000", "RDNA 4", "Navi 48", "current", "2026-06-02", 549,
    Object.assign({}, n48, { cu: 48, sp: 3072, rta: 48, aia: 96, boost: 2790, mem: 12, memType: "GDDR6", bus: 192, ic: 48, power: 220, pcie: "PCIe 5.0 ×16" }, o9),
    { summary: "12 GB Navi 48 variant. Launched in China in May 2025, then globally at Computex 2026.", priceNote: "Global price. Launched in China in 2025 at CN¥4,199.", sources: ["amd-qrg", "wccf-9070gre", "ti-9070gre"] });
  a("desktop", "rx-9060-xt", "Radeon RX 9060 XT", "RX 9000", "RDNA 4", "Navi 44", "current", "2025-06-05", 349,
    Object.assign({}, n44, { cu: 32, sp: 2048, rta: 32, aia: 64, boost: 3130, mem: 16, memType: "GDDR6", bus: 128, speed: 20, bw: 320, ic: 32, power: 160, pcie: "PCIe 5.0 ×16" }, o9),
    { summary: "Full Navi 44 with the highest clocks in the RDNA 4 range. Sold in 16 GB and 8 GB versions.",
      variants: [{ name: "RX 9060 XT 8 GB", diff: "Same GPU with 8 GB; 150 W; launched at $299." }], priceNote: "16 GB version. The 8 GB version launched at $299.", sources: ["amd-qrg", "th-9060xt"] });
  a("desktop", "rx-9060", "Radeon RX 9060", "RX 9000", "RDNA 4", "Navi 44", "current", "2025", null,
    Object.assign({}, n44, { cu: 28, sp: 1792, mem: 8, memType: "GDDR6", bus: 128, power: 132 }, o9),
    { summary: "Cut-down Navi 44 sold only in pre-built systems. No retail price was published.", sources: ["wccf-9060"] });
  a("desktop", "rx-9050", "Radeon RX 9050", "RX 9000", "RDNA 4", "Navi 44", "current", "2026-07-28", 279,
    Object.assign({}, n44, { cu: 16, sp: 1024, rta: 16, aia: 32, boost: 2600, mem: 8, memType: "GDDR6", bus: 128, speed: 18, bw: 288, ic: 32, power: 92 }, o9),
    { summary: "Entry RDNA 4 card with half the shaders of the RX 9060 XT. Launched first in Asia-Pacific, Japan and Latin America.",
      variants: [{ name: "RX 9050 4 GB", diff: "OEM-only version with a 64-bit bus." }], sources: ["amd-qrg", "guru3d-9050", "nc-9050"] });

  // ===== RX 7000 — RDNA 3 =====
  const n31 = { process: "TSMC N5 + N6 (chiplets)", transistors: 57.7, die: 529 };
  const n32 = { process: "TSMC N5 + N6 (chiplets)", transistors: 28.1, die: 346 };
  const n33 = { process: "TSMC N6", transistors: 13.3, die: 204 };
  const o7 = { outputs: "DisplayPort 2.1, HDMI 2.1" };
  a("desktop", "rx-7900-xtx", "Radeon RX 7900 XTX", "RX 7000", "RDNA 3", "Navi 31", "previous", "2022-12-13", 999, Object.assign({}, n31, { cu: 96, sp: 6144, boost: 2500, mem: 24, memType: "GDDR6", bus: 384, speed: 20, bw: 960, ic: 96, power: 355, pcie: "PCIe 4.0 ×16" }, o7), { summary: "AMD's first chiplet GPU and RDNA 3 flagship." });
  a("desktop", "rx-7900-xt", "Radeon RX 7900 XT", "RX 7000", "RDNA 3", "Navi 31", "previous", "2022-12-13", 899, Object.assign({}, n31, { cu: 84, sp: 5376, boost: 2400, mem: 20, memType: "GDDR6", bus: 320, speed: 20, bw: 800, ic: 80, power: 315, pcie: "PCIe 4.0 ×16" }, o7), { summary: "Cut-down Navi 31 with 20 GB." });
  a("desktop", "rx-7900-gre", "Radeon RX 7900 GRE", "RX 7000", "RDNA 3", "Navi 31", "previous", "2024-02-27", 549, Object.assign({}, n31, { cu: 80, sp: 5120, boost: 2245, mem: 16, memType: "GDDR6", bus: 256, speed: 18, bw: 576, ic: 64, power: 260, pcie: "PCIe 4.0 ×16" }, o7), { summary: "Launched in China in 2023, then worldwide in 2024.", priceNote: "Global launch price." });
  a("desktop", "rx-7800-xt", "Radeon RX 7800 XT", "RX 7000", "RDNA 3", "Navi 32", "previous", "2023-09-06", 499, Object.assign({}, n32, { cu: 60, sp: 3840, boost: 2430, mem: 16, memType: "GDDR6", bus: 256, speed: 19.5, bw: 624, ic: 64, power: 263, pcie: "PCIe 4.0 ×16" }, o7), { summary: "Full Navi 32; a long-running 1440p value pick." });
  a("desktop", "rx-7700-xt", "Radeon RX 7700 XT", "RX 7000", "RDNA 3", "Navi 32", "previous", "2023-09-06", 449, Object.assign({}, n32, { cu: 54, sp: 3456, boost: 2544, mem: 12, memType: "GDDR6", bus: 192, speed: 18, bw: 432, ic: 48, power: 245, pcie: "PCIe 4.0 ×16" }, o7), { summary: "Cut-down Navi 32 with 12 GB." });
  a("desktop", "rx-7600-xt", "Radeon RX 7600 XT", "RX 7000", "RDNA 3", "Navi 33", "previous", "2024-01-24", 329, Object.assign({}, n33, { cu: 32, sp: 2048, boost: 2755, mem: 16, memType: "GDDR6", bus: 128, speed: 18, bw: 288, ic: 32, power: 190, pcie: "PCIe 4.0 ×8" }, o7), { summary: "RX 7600 with 16 GB and higher clocks." });
  a("desktop", "rx-7600", "Radeon RX 7600", "RX 7000", "RDNA 3", "Navi 33", "previous", "2023-05-25", 269, Object.assign({}, n33, { cu: 32, sp: 2048, boost: 2655, mem: 8, memType: "GDDR6", bus: 128, speed: 18, bw: 288, ic: 32, power: 165, pcie: "PCIe 4.0 ×8" }, o7), { summary: "Monolithic 6 nm entry RDNA 3 card." });

  // ===== RX 6000 — RDNA 2 (TSMC N7) =====
  const n21 = { process: "TSMC N7", transistors: 26.8, die: 520 };
  const n22 = { process: "TSMC N7", transistors: 17.2, die: 335 };
  const n23 = { process: "TSMC N7", transistors: 11.1, die: 237 };
  const n24 = { process: "TSMC N6", transistors: 5.4, die: 107 };
  a("desktop", "rx-6950-xt", "Radeon RX 6950 XT", "RX 6000", "RDNA 2", "Navi 21", "legacy", "2022-05-10", 1099, Object.assign({}, n21, { cu: 80, sp: 5120, boost: 2310, mem: 16, memType: "GDDR6", bus: 256, speed: 18, bw: 576, ic: 128, power: 335, pcie: "PCIe 4.0 ×16" }), { summary: "Faster-memory refresh of the RX 6900 XT." });
  a("desktop", "rx-6900-xt", "Radeon RX 6900 XT", "RX 6000", "RDNA 2", "Navi 21", "legacy", "2020-12-08", 999, Object.assign({}, n21, { cu: 80, sp: 5120, boost: 2250, mem: 16, memType: "GDDR6", bus: 256, speed: 16, bw: 512, ic: 128, power: 300, pcie: "PCIe 4.0 ×16" }), { summary: "Full Navi 21; introduced Infinity Cache." });
  a("desktop", "rx-6800-xt", "Radeon RX 6800 XT", "RX 6000", "RDNA 2", "Navi 21", "legacy", "2020-11-18", 649, Object.assign({}, n21, { cu: 72, sp: 4608, boost: 2250, mem: 16, memType: "GDDR6", bus: 256, speed: 16, bw: 512, ic: 128, power: 300, pcie: "PCIe 4.0 ×16" }), { summary: "AMD's first hardware ray-tracing generation." });
  a("desktop", "rx-6800", "Radeon RX 6800", "RX 6000", "RDNA 2", "Navi 21", "legacy", "2020-11-18", 579, Object.assign({}, n21, { cu: 60, sp: 3840, boost: 2105, mem: 16, memType: "GDDR6", bus: 256, speed: 16, bw: 512, ic: 128, power: 250, pcie: "PCIe 4.0 ×16" }), { summary: "" });
  a("desktop", "rx-6750-xt", "Radeon RX 6750 XT", "RX 6000", "RDNA 2", "Navi 22", "legacy", "2022-05-10", 549, Object.assign({}, n22, { cu: 40, sp: 2560, boost: 2600, mem: 12, memType: "GDDR6", bus: 192, speed: 18, bw: 432, ic: 96, power: 250, pcie: "PCIe 4.0 ×16" }), { summary: "Refresh of the RX 6700 XT." });
  a("desktop", "rx-6700-xt", "Radeon RX 6700 XT", "RX 6000", "RDNA 2", "Navi 22", "legacy", "2021-03-18", 479, Object.assign({}, n22, { cu: 40, sp: 2560, boost: 2581, mem: 12, memType: "GDDR6", bus: 192, speed: 16, bw: 384, ic: 96, power: 230, pcie: "PCIe 4.0 ×16" }), { summary: "", variants: [{ name: "RX 6700 (10 GB)", diff: "36 CUs, 10 GB on a 160-bit bus, 175 W; sold mainly through partners without an AMD MSRP." }] });
  a("desktop", "rx-6650-xt", "Radeon RX 6650 XT", "RX 6000", "RDNA 2", "Navi 23", "legacy", "2022-05-10", 399, Object.assign({}, n23, { cu: 32, sp: 2048, boost: 2635, mem: 8, memType: "GDDR6", bus: 128, speed: 17.5, bw: 280, ic: 32, power: 180, pcie: "PCIe 4.0 ×8" }), { summary: "" });
  a("desktop", "rx-6600-xt", "Radeon RX 6600 XT", "RX 6000", "RDNA 2", "Navi 23", "legacy", "2021-08-11", 379, Object.assign({}, n23, { cu: 32, sp: 2048, boost: 2589, mem: 8, memType: "GDDR6", bus: 128, speed: 16, bw: 256, ic: 32, power: 160, pcie: "PCIe 4.0 ×8" }), { summary: "" });
  a("desktop", "rx-6600", "Radeon RX 6600", "RX 6000", "RDNA 2", "Navi 23", "legacy", "2021-10-13", 329, Object.assign({}, n23, { cu: 28, sp: 1792, boost: 2491, mem: 8, memType: "GDDR6", bus: 128, speed: 14, bw: 224, ic: 32, power: 132, pcie: "PCIe 4.0 ×8" }), { summary: "Efficient 1080p card that stayed on sale for years." });
  a("desktop", "rx-6500-xt", "Radeon RX 6500 XT", "RX 6000", "RDNA 2", "Navi 24", "legacy", "2022-01-19", 199, Object.assign({}, n24, { cu: 16, sp: 1024, boost: 2815, mem: 4, memType: "GDDR6", bus: 64, speed: 18, bw: 144, ic: 16, power: 107, pcie: "PCIe 4.0 ×4" }), { summary: "Laptop-derived chip with only four PCIe lanes and no AV1 or H.264 encode.", variants: [{ name: "RX 6400", diff: "12 CUs, 4 GB, 53 W, low profile; launched at $159." }] });

  // ===== RX 5000 — RDNA (TSMC N7) =====
  a("desktop", "rx-5700-xt", "Radeon RX 5700 XT", "RX 5000", "RDNA", "Navi 10", "legacy", "2019-07-07", 399, { process: "TSMC N7", transistors: 10.3, die: 251, cu: 40, sp: 2560, boost: 1905, mem: 8, memType: "GDDR6", bus: 256, speed: 14, bw: 448, power: 225, pcie: "PCIe 4.0 ×16" }, { summary: "First RDNA card and the first consumer GPU with PCIe 4.0." });
  a("desktop", "rx-5700", "Radeon RX 5700", "RX 5000", "RDNA", "Navi 10", "legacy", "2019-07-07", 349, { process: "TSMC N7", transistors: 10.3, die: 251, cu: 36, sp: 2304, boost: 1725, mem: 8, memType: "GDDR6", bus: 256, speed: 14, bw: 448, power: 180, pcie: "PCIe 4.0 ×16" }, { summary: "" });
  a("desktop", "rx-5600-xt", "Radeon RX 5600 XT", "RX 5000", "RDNA", "Navi 10", "legacy", "2020-01-21", 279, { process: "TSMC N7", transistors: 10.3, die: 251, cu: 36, sp: 2304, mem: 6, memType: "GDDR6", bus: 192, speed: 14, bw: 336, power: 150, pcie: "PCIe 4.0 ×16" }, { summary: "Memory speed was raised from 12 to 14 Gbps by a launch-week BIOS update." });
  a("desktop", "rx-5500-xt", "Radeon RX 5500 XT", "RX 5000", "RDNA", "Navi 14", "legacy", "2019-12-12", 169, { process: "TSMC N7", transistors: 6.4, die: 158, cu: 22, sp: 1408, mem: 4, memType: "GDDR6", bus: 128, speed: 14, bw: 224, power: 130, pcie: "PCIe 4.0 ×8" }, { summary: "", variants: [{ name: "RX 5500 XT 8 GB", diff: "Same GPU with 8 GB; launched at $199." }], priceNote: "4 GB version." });

  // ===== Laptop =====
  a("laptop", "rx-9000m", "Radeon RX 9000M series (unconfirmed)", "RX 9000M", "RDNA 4", "Navi 48 / Navi 44 (reported)", "rumored", "Not announced", null, {},
    { summary: "RDNA 4 laptop GPUs have been widely leaked but AMD has not announced them.",
      variants: [
        { name: "RX 9080M (reported)", diff: "64 CUs, 16 GB GDDR6." },
        { name: "RX 9070M XT (reported)", diff: "48 CUs, 12 GB GDDR6." },
        { name: "RX 9070M / 9070S (reported)", diff: "32 CUs, 8 GB." },
        { name: "RX 9060M / 9060S (reported)", diff: "28 CUs, 8 GB." }
      ], sources: ["nc-9000m", "tt-9080m"] });
  a("laptop", "rx-7900m", "Radeon RX 7900M", "RX 7000M", "RDNA 3", "Navi 31", "previous", "Oct 2023", null, { cu: 72, sp: 4608, mem: 16, memType: "GDDR6", bus: 256, bw: 576, ic: 64, powerRange: "up to 180 W" }, { summary: "AMD's fastest laptop GPU, first in the Alienware m18." });
  a("laptop", "rx-7800m", "Radeon RX 7800M", "RX 7000M", "RDNA 3", "Navi 32", "previous", "2024", null, { cu: 60, sp: 3840, mem: 12, memType: "GDDR6", bus: 192, bw: 432, ic: 48, powerRange: "up to 180 W" }, { summary: "" });
  a("laptop", "rx-7700s", "Radeon RX 7700S", "RX 7000M", "RDNA 3", "Navi 33", "previous", "Jan 2023", null, { cu: 32, sp: 2048, mem: 8, memType: "GDDR6", bus: 128, ic: 32, powerRange: "75–100 W" }, { summary: "Efficiency-focused version for thin laptops." });
  a("laptop", "rx-7600m-xt", "Radeon RX 7600M XT", "RX 7000M", "RDNA 3", "Navi 33", "previous", "Jan 2023", null, { cu: 32, sp: 2048, mem: 8, memType: "GDDR6", bus: 128, ic: 32, powerRange: "75–120 W" }, { summary: "", variants: [{ name: "RX 7600M", diff: "28 CUs, 8 GB, 50–90 W." }, { name: "RX 7600S", diff: "28 CUs, 8 GB, 50–75 W." }] });

  // ===== Workstation =====
  a("pro", "radeon-ai-pro-r9700", "Radeon AI PRO R9700", "Radeon AI PRO", "RDNA 4", "Navi 48", "current", "2025-07-23", 1299,
    Object.assign({}, n48, { cu: 64, sp: 4096, aia: 128, mem: 32, memType: "GDDR6", bus: 256, bw: 640, power: 300, fp16: "96 TFLOPS", ai: 1531 }),
    { summary: "An RX 9070 XT with 32 GB, aimed at local AI inference and development with ROCm.",
      variants: [{ name: "Radeon AI PRO R9700S", diff: "Same specifications with a passive heatsink for servers." }], sources: ["th-r9700", "cgm-r9700", "tpu-r9600d"] });
  a("pro", "radeon-ai-pro-r9600d", "Radeon AI PRO R9600D", "Radeon AI PRO", "RDNA 4", "Navi 48", "current", "Dec 2025", null,
    Object.assign({}, n48, { cu: 48, sp: 3072, rops: 96, boost: 2020, mem: 32, memType: "GDDR6", bus: 256, bw: 640, power: 150, form: "Passive" }),
    { summary: "Cut-down Navi 48 with 32 GB at 150 W, passively cooled.", sources: ["tpu-r9600d"] });
  a("pro", "radeon-pro-w7900", "Radeon PRO W7900", "Radeon PRO W7000", "RDNA 3", "Navi 31", "previous", "2023-04", 3999, Object.assign({}, n31, { cu: 96, sp: 6144, mem: 48, memType: "GDDR6 ECC", bus: 384, bw: 864, power: 295 }), { summary: "RDNA 3 workstation flagship with 48 GB." });
  a("pro", "radeon-pro-w7800", "Radeon PRO W7800", "Radeon PRO W7000", "RDNA 3", "Navi 31", "previous", "2023-04", 2499, Object.assign({}, n31, { cu: 70, sp: 4480, mem: 32, memType: "GDDR6 ECC", bus: 256, bw: 576, power: 260 }), { summary: "", variants: [{ name: "Radeon PRO W7800 48 GB", diff: "2024 version with 48 GB." }] });
  a("pro", "radeon-pro-w7700", "Radeon PRO W7700", "Radeon PRO W7000", "RDNA 3", "Navi 32", "previous", "2023-11", 999, Object.assign({}, n32, { cu: 48, sp: 3072, mem: 16, memType: "GDDR6 ECC", bus: 256, bw: 576, power: 190 }), { summary: "" });
  a("pro", "radeon-pro-w7600", "Radeon PRO W7600", "Radeon PRO W7000", "RDNA 3", "Navi 33", "previous", "2023-08", 599, Object.assign({}, n33, { cu: 32, sp: 2048, mem: 8, memType: "GDDR6", bus: 128, bw: 288, power: 130 }), { summary: "", variants: [{ name: "Radeon PRO W7500", diff: "28 CUs, 8 GB, 70 W, single slot; launched at $429." }] });

  // ===== Data center — Instinct =====
  a("datacenter", "helios", "AMD Helios (MI455X rack)", "Instinct MI400", "CDNA 5", null, "current", "2026", null,
    { gpus: "72 Instinct MI455X GPUs, EPYC Venice CPUs", mem: 31000, memType: "HBM4", bw: 1670000, fp4: "2.9 EF (MXFP4)", fp8: "1.4 EF", nvlink: "260 TB/s scale-up; up to 43 TB/s scale-out", form: "Rack-scale system" },
    { summary: "AMD's answer to Vera Rubin NVL72: a 72-GPU rack built around the MI455X.", sources: ["amd-mi400", "amd-helios", "jpr-mi400"] });
  a("datacenter", "mi455x", "Instinct MI455X", "Instinct MI400", "CDNA 5", null, "current", "2026-07-23", null,
    { process: "TSMC 2 nm + 3 nm", transistors: 320, mem: 432, memType: "HBM4 (12 stacks)", bw: 19600, fp4: "40 PF", fp8: "20 PF", form: "Helios compute tray" },
    { summary: "Flagship CDNA 5 GPU: 8 compute dies, 2 I/O dies and 2 fabric dies with 432 GB of HBM4. AMD's spec pages differ on bandwidth (19.6 TB/s in the Helios brochure, 23.3 TB/s elsewhere).", sources: ["amd-mi455x", "amd-helios", "tpu-mi400"] });
  a("datacenter", "mi450x", "Instinct MI450X", "Instinct MI400", "CDNA 5", null, "announced", "2026-11-12", null,
    { transistors: 320, mem: 288, memType: "HBM4 (8 stacks)", l2: 192, fp16: "10.1 PF (BF16, sparse)" },
    { summary: "Lower-memory Helios option with the same compute and bandwidth as MI455X.", sources: ["amd-mi450x", "jpr-mi400"],
      variants: [{ name: "Instinct MI430X", diff: "HPC-focused MI400 with native FP64 and 432 GB of HBM4." }] });
  a("datacenter", "mi355x", "Instinct MI355X", "Instinct MI350", "CDNA 4", null, "current", "2025-06-12", null,
    { process: "TSMC 3 nm + 6 nm", cu: 256, sp: 16384, mem: 288, memType: "HBM3E", bus: 8192, bw: 8000, l2: 256, fp4: "~20 PF", power: "1,400 W", form: "OAM module, liquid-cooled" },
    { summary: "Top CDNA 4 accelerator; FP6 runs at FP4 rates.", sources: ["amd-mi355x", "th-mi355x"],
      variants: [{ name: "Instinct MI350X", diff: "Same silicon and memory at 1,000 W for air-cooled servers; ~18.45 PF FP4." }] });
  a("datacenter", "mi325x", "Instinct MI325X", "Instinct MI300", "CDNA 3", null, "previous", "2024-10-10", null,
    { process: "TSMC 5 nm + 6 nm", transistors: 153, cu: 304, sp: 19456, mem: 256, memType: "HBM3E", bus: 8192, bw: 6000, l2: 256, fp8: "2.6 PF", fp16: "1.3 PF", power: "1,000 W" },
    { summary: "MI300X compute with HBM3E.", sources: ["amd-mi325x"] });
  a("datacenter", "mi300x", "Instinct MI300X", "Instinct MI300", "CDNA 3", null, "previous", "2023-12-06", null,
    { process: "TSMC 5 nm + 6 nm", transistors: 153, cu: 304, sp: 19456, mem: 192, memType: "HBM3", bw: 5300, power: "750 W" },
    { summary: "The accelerator that made AMD a serious AI data-center supplier.", sources: ["amd-mi300"],
      variants: [{ name: "Instinct MI300A", diff: "APU combining 228 CUs with 24 Zen 4 CPU cores and 128 GB of unified HBM3; powers El Capitan." }] });

  // ===== AI PCs =====
  a("systems", "ryzen-ai-max-395", "Ryzen AI Max+ 395 (Radeon 8060S)", "Ryzen AI Max", "RDNA 3.5", "Strix Halo", "current", "2025-01", null,
    { cpu: "16-core Zen 5", cu: 40, mem: "Up to 128 GB unified", memType: "LPDDR5X-8000", bus: 256, powerRange: "45–120 W", ai: 50, platform: "Windows / Linux laptops and mini PCs" },
    { summary: "APU with a 40-CU integrated GPU and up to 128 GB of shared memory, a common choice for local AI mini PCs.",
      variants: [{ name: "Ryzen AI Max+ 392 / 388", diff: "2026 versions with 12 or 8 CPU cores and the full 40-CU GPU." }], sources: ["th-strixhalo"] });
  a("systems", "ryzen-ai-max-495", "Ryzen AI Max+ 495 (Gorgon Halo)", "Ryzen AI Max", "RDNA 3.5", "Gorgon Halo", "announced", "2026", null,
    { cpu: "16-core Zen 5, up to 5.2 GHz", cu: 40, mem: "Up to 192 GB unified", powerRange: "up to 120 W", platform: "Ryzen AI Halo developer system and OEM PCs" },
    { summary: "Refresh of Strix Halo with support for up to 192 GB of memory. AMD's Ryzen AI Halo developer box starts at $3,999.", sources: ["th-gorgon"] });

  // ===================================================================
  // REGIONAL LAUNCH PRICES (official launch prices only; local currency)
  // ===================================================================
  D.COUNTRIES = [
    { code: "US", name: "United States", cur: "USD", locale: "en-US" },
    { code: "IN", name: "India", cur: "INR", locale: "en-IN" },
    { code: "GB", name: "United Kingdom", cur: "GBP", locale: "en-GB" },
    { code: "EU", name: "Eurozone (Germany)", cur: "EUR", locale: "de-DE" },
    { code: "JP", name: "Japan", cur: "JPY", locale: "ja-JP" },
    { code: "CN", name: "China", cur: "CNY", locale: "zh-CN" },
    { code: "AU", name: "Australia", cur: "AUD", locale: "en-AU" },
    { code: "CA", name: "Canada", cur: "CAD", locale: "en-CA" }
  ];

  const P = {
    "rtx-5090": { IN: 214000, GB: 1939, EU: 2329, JP: 393800, AU: 4039, CA: 2899, CN: 16499 },
    "rtx-5080": { IN: 107000, GB: 979, EU: 1169, JP: 198800, AU: 2019 },
    "rtx-5070-ti": { IN: 80000, GB: 729, JP: 148800, AU: 1509 },
    "rtx-5070": { IN: 59000, GB: 539, EU: 649, JP: 108800, AU: 1109 },
    "rtx-5060-ti": { GB: 399, AU: 819 },
    "rx-9070-xt": { GB: 569 },
    "rx-9070-gre": { CN: 4199 }
  };
  const PNOTE = {
    "rtx-5090": "China price is for the RTX 5090 D / D v2 (CN¥16,499). NVIDIA later cut Founders Edition prices to £1,799 in the UK and €2,099 in Germany.",
    "rtx-5080": "NVIDIA later cut Founders Edition prices to £909 in the UK and €1,059 in Germany.",
    "rtx-5070": "NVIDIA later cut Founders Edition prices to £499 in the UK and €589 in Germany.",
    "rtx-5060-ti": "16 GB version. The 8 GB version launched at £349 in the UK."
  };
  const PSRC = {
    "rtx-5090": ["p-in", "p-uk", "p-eu", "p-eu2", "p-jp", "p-au", "p-ca", "p-cn"],
    "rtx-5080": ["p-in", "p-uk", "p-eu", "p-eu2", "p-jp", "p-au"],
    "rtx-5070-ti": ["p-in", "p-uk", "p-jp", "p-au"],
    "rtx-5070": ["p-in", "p-uk", "p-eu", "p-eu2", "p-jp", "p-au"],
    "rtx-5060-ti": ["p-5060ti-uk", "p-5060ti-au"],
    "rx-9070-xt": ["p-9070xt-uk"],
    "rx-9070-gre": ["wccf-9070gre"]
  };
  L.forEach((g) => {
    g.prices = Object.assign({}, g.msrp ? { US: g.msrp } : {}, P[g.id] || {});
    if (PNOTE[g.id]) g.regionNote = PNOTE[g.id];
    if (PSRC[g.id]) g.sources = (g.sources || []).concat(PSRC[g.id].filter((s) => !(g.sources || []).includes(s)));
  });

  // Architectures
  D.ARCHS.push(
    { brand: "AMD", name: "RDNA", year: "2019", process: "TSMC 7 nm", namesake: "—", products: "RX 5000", key: "New compute-unit design replacing GCN; PCIe 4.0." },
    { brand: "AMD", name: "RDNA 2", year: "2020", process: "TSMC 7 / 6 nm", namesake: "—", products: "RX 6000, PlayStation 5, Xbox Series", key: "Hardware ray tracing and Infinity Cache." },
    { brand: "AMD", name: "RDNA 3", year: "2022", process: "TSMC 5 nm + 6 nm", namesake: "—", products: "RX 7000, Radeon PRO W7000", key: "First chiplet consumer GPUs; AI accelerators per CU." },
    { brand: "AMD", name: "RDNA 3.5", year: "2024–26", process: "TSMC 4 nm", namesake: "—", products: "Ryzen AI and Ryzen AI Max integrated graphics", key: "Power-optimised RDNA 3 for APUs." },
    { brand: "AMD", name: "RDNA 4", year: "2025", process: "TSMC N4P", namesake: "—", products: "RX 9000, Radeon AI PRO", key: "Much faster ray tracing, FP8/FP4 AI accelerators for FSR 4." },
    { brand: "AMD", name: "CDNA 3", year: "2023–24", process: "TSMC 5 nm + 6 nm", namesake: "—", products: "Instinct MI300X, MI300A, MI325X", key: "3D-stacked chiplets; up to 256 GB HBM3E." },
    { brand: "AMD", name: "CDNA 4", year: "2025", process: "TSMC 3 nm + 6 nm", namesake: "—", products: "Instinct MI350X, MI355X", key: "FP4 and FP6 support; 288 GB HBM3E." },
    { brand: "AMD", name: "CDNA 5", year: "2026", process: "TSMC 2 nm + 3 nm", namesake: "—", products: "Instinct MI455X, MI450X, MI430X, Helios", key: "HBM4 up to 432 GB; rack-scale Helios." }
  );
  D.ARCHS.forEach((x) => { if (!x.brand) x.brand = "NVIDIA"; });

  D.GLOSSARY.push(
    ["Stream processors / CUs (AMD)", "AMD's shader ALUs, grouped into compute units of 64. RDNA 3 and 4 can dual-issue, so AMD's FP32 figures are roughly double a simple core × clock count."],
    ["Infinity Cache", "AMD's large on-die last-level cache, which raises effective memory bandwidth."],
    ["Regional launch price", "The price NVIDIA or AMD published for a country at launch, including local sales tax where that market quotes it. Prices differ from a straight currency conversion because of tax, import duty and warranty rules."]
  );
})();
