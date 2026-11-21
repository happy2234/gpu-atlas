/* GPU Atlas — Apple silicon (M-series) GPUs.
 * Apple's GPUs are part of the system-on-chip and are not sold separately, so there is no
 * launch price per chip: the "Available in" field names the Macs that use it.
 * GPU core counts are the maximum configuration; lower-binned versions are listed as variants.
 */
(function () {
  const D = window.GPU_ATLAS;
  const L = D.list;
  const CHECKED = "2026-11-21";

  Object.assign(D.SOURCES, {
    "ap-m5ultra": { t: "Apple Newsroom — Mac Studio with M5 Max and M5 Ultra (25 Aug 2026)", u: "https://www.apple.com/bw/newsroom/2026/08/apple-introduces-mac-studio-with-m5-max-and-m5-ultra/" },
    "ap-studio-specs": { t: "Apple Support — Mac Studio (M5 Max or M5 Ultra) tech specs", u: "https://support.apple.com/he-il/128107" },
    "mr-m5ultra": { t: "MacRumors — Mac Studio with M5 Max and M5 Ultra", u: "https://macrumors.com/2026/08/25/apple-announces-new-mac-studio-with-m5-ultra-chip/" },
    "ap-m5promax": { t: "Apple Newsroom — M5 Pro and M5 Max (3 Mar 2026)", u: "https://www.apple.com/newsroom/2026/03/apple-debuts-m5-pro-and-m5-max-to-supercharge-the-most-demanding-pro-workflows/" },
    "mr-m5promax": { t: "MacRumors — Apple debuts M5 Pro and M5 Max", u: "https://www.macrumors.com/2026/03/03/apple-debuts-m5-pro-and-m5-max-chips/" },
    "ap-m5": { t: "Apple Newsroom — Apple unleashes M5 (15 Oct 2025)", u: "https://www.apple.com/newsroom/2025/10/apple-unleashes-m5-the-next-big-leap-in-ai-performance-for-apple-silicon" },
    "ap-m4promax": { t: "Apple Newsroom — Apple introduces M4 Pro and M4 Max (30 Oct 2024)", u: "https://www.apple.com/ca/newsroom/2024/10/apple-introduces-m4-pro-and-m4-max/" },
    "ap-m3ultra": { t: "Apple Newsroom — Apple reveals M3 Ultra (5 Mar 2025)", u: "https://apple.com/newsroom/2025/03/apple-reveals-m3-ultra-taking-apple-silicon-to-a-new-extreme" },
    "mr-m3ultra": { t: "MacRumors — Apple introduces M3 Ultra (819 GB/s)", u: "https://www.macrumors.com/2025/03/05/apple-introduces-m3-ultra-chip/" },
    "ap-m3": { t: "Apple Newsroom — M3, M3 Pro and M3 Max (30 Oct 2023)", u: "https://www.apple.com/newsroom/2023/10/apple-unveils-m3-m3-pro-and-m3-max-the-most-advanced-chips-for-a-personal-computer/" },
    "at-m3": { t: "AnandTech — Apple announces M3 family (spec table)", u: "https://anandtech.com/show/21116" },
    "ap-m2ultra": { t: "Apple Newsroom — Apple introduces M2 Ultra (5 Jun 2023)", u: "https://www.apple.com/newsroom/2023/06/apple-introduces-m2-ultra/" },
    "ap-m2promax": { t: "Apple Newsroom — M2 Pro and M2 Max (17 Jan 2023)", u: "https://www.apple.com/newsroom/2023/01/apple-unveils-m2-pro-and-m2-max-next-generation-chips-for-next-level-workflows/" },
    "ap-m2": { t: "Apple Newsroom — Apple unveils M2 (6 Jun 2022)", u: "https://www.apple.com/newsroom/2022/06/apple-unveils-m2-with-breakthrough-performance-and-capabilities/" },
    "ap-m1ultra": { t: "Apple Newsroom — Apple unveils M1 Ultra (8 Mar 2022)", u: "https://www.apple.com/newsroom/2022/03/apple-unveils-m1-ultra-the-worlds-most-powerful-chip-for-a-personal-computer/" },
    "ap-m1promax": { t: "Apple Newsroom — Introducing M1 Pro and M1 Max (18 Oct 2021)", u: "https://www.apple.com/newsroom/2021/10/introducing-m1-pro-and-m1-max-the-most-powerful-chips-apple-has-ever-built/" },
    "ap-m1": { t: "Apple Newsroom — Apple unleashes M1 (10 Nov 2020)", u: "https://www.apple.com/newsroom/2020/11/apple-unleashes-m1/" },
  });

  // a(id, name, series, arch, status, launch, specs, extra)
  const a = (id, name, series, arch, status, launch, specs, extra) => L.push(Object.assign({
    id, name, seg: "systems", series, arch, status, launch, msrp: null, brand: "Apple", specs, sources: [], prices: {}, variants: [],
    priceNote: "Not sold separately; see the Macs it ships in."
  }, extra));

  // ---- M5 family (third-generation 3 nm) ----
  a("apple-m5-ultra", "Apple M5 Ultra", "M5", "Apple M5 GPU", "current", "2026-09",
    { gcores: 80, process: "TSMC 3 nm (third generation)", cpu: "36-core (12 super + 24 performance)", mem: "Up to 512 GB unified", bw: 1200, ne: "32-core", gpus: "Four dies: two M5 Max chips joined by UltraFusion", platform: "Mac Studio" },
    { summary: "Apple's largest chip: two dual-die M5 Max chips joined into one processor, with a Neural Accelerator in every GPU core. Mac Studio with M5 Ultra started at $5,499.",
      variants: [{ name: "M5 Ultra 30-core CPU", diff: "Entry configuration with 10 super cores and a smaller GPU (per launch coverage)." }], sources: ["ap-m5ultra", "ap-studio-specs", "mr-m5ultra"], checked: CHECKED,
      checkNote: "Bandwidth is Apple's figure for the 36-core CPU / 80-core GPU version (1.2 TB/s)." });
  a("apple-m5-max", "Apple M5 Max", "M5", "Apple M5 GPU", "current", "2026-03",
    { gcores: 40, process: "TSMC 3 nm (third generation)", cpu: "18-core (6 super + 12 performance)", mem: "Up to 128 GB unified", bw: 614, ne: "16-core", platform: "MacBook Pro 14/16-inch, Mac Studio" },
    { summary: "Fusion Architecture chip with up to 40 GPU cores, each with a Neural Accelerator. Mac Studio with M5 Max started at $2,499.",
      variants: [{ name: "M5 Max 32-core GPU", diff: "Entry configuration with 32 GPU cores." }], sources: ["ap-m5promax", "mr-m5promax", "ap-studio-specs"], checked: CHECKED });
  a("apple-m5-pro", "Apple M5 Pro", "M5", "Apple M5 GPU", "current", "2026-03",
    { gcores: 20, process: "TSMC 3 nm (third generation)", cpu: "Up to 18-core (6 super + 12 performance)", mem: "Up to 64 GB unified", bw: 307, ne: "16-core", platform: "MacBook Pro 14/16-inch" },
    { summary: "Mid-range pro chip with up to 20 GPU cores and 307 GB/s of unified memory bandwidth.",
      variants: [{ name: "M5 Pro 16-core GPU", diff: "15-core CPU (5 super + 10 performance) with 16 GPU cores." }], sources: ["ap-m5promax", "mr-m5promax"], checked: CHECKED });
  a("apple-m5", "Apple M5", "M5", "Apple M5 GPU", "current", "2025-10",
    { gcores: 10, process: "TSMC 3 nm (third generation)", cpu: "Up to 10-core (4 performance + 6 efficiency)", mem: "Up to 32 GB unified", bw: 153, ne: "16-core", platform: "MacBook Pro 14-inch, MacBook Air, iPad Pro, Apple Vision Pro" },
    { summary: "First Apple chip with a Neural Accelerator in every GPU core, plus third-generation ray tracing.",
      variants: [{ name: "M5 9-core CPU", diff: "iPad Pro 256/512 GB models use a 9-core CPU with the same 10-core GPU." }], sources: ["ap-m5"], checked: CHECKED });

  // ---- M4 family (second-generation 3 nm) ----
  a("apple-m4-max", "Apple M4 Max", "M4", "Apple M4 GPU", "previous", "2024-11",
    { gcores: 40, process: "TSMC 3 nm (second generation)", cpu: "Up to 16-core (12 performance + 4 efficiency)", mem: "Up to 128 GB unified", bw: 546, ne: "16-core", platform: "MacBook Pro, Mac Studio (2025)" },
    { summary: "Up to 40 GPU cores with a 2x faster ray-tracing engine than M3. Bandwidth is 410 GB/s on the 32-core version.",
      variants: [{ name: "M4 Max 32-core GPU", diff: "14-core CPU, 410 GB/s memory bandwidth." }], sources: ["ap-m4promax"], checked: CHECKED });
  a("apple-m4-pro", "Apple M4 Pro", "M4", "Apple M4 GPU", "previous", "2024-11",
    { gcores: 20, process: "TSMC 3 nm (second generation)", cpu: "Up to 14-core (10 performance + 4 efficiency)", mem: "Up to 64 GB unified", bw: 273, ne: "16-core", platform: "MacBook Pro, Mac mini" },
    { summary: "Up to 20 GPU cores and 273 GB/s of bandwidth, 75% more than M3 Pro.",
      variants: [{ name: "M4 Pro 16-core GPU", diff: "12-core CPU version." }], sources: ["ap-m4promax"], checked: CHECKED });
  a("apple-m4", "Apple M4", "M4", "Apple M4 GPU", "previous", "2024-05",
    { gcores: 10, process: "TSMC 3 nm (second generation)", cpu: "Up to 10-core (4 performance + 6 efficiency)", mem: "Up to 32 GB unified", bw: 120, ne: "16-core", platform: "iPad Pro, MacBook Air, MacBook Pro, iMac, Mac mini" },
    { summary: "Debuted in the iPad Pro, then came to the Mac in late 2024.",
      variants: [{ name: "M4 8-core GPU", diff: "Used in some base MacBook Air and iMac models." }], sources: ["ap-m4promax"], checked: CHECKED });

  // ---- M3 family (first-generation 3 nm) ----
  a("apple-m3-ultra", "Apple M3 Ultra", "M3", "Apple M3 GPU", "previous", "2025-03",
    { gcores: 80, process: "TSMC 3 nm", transistors: 184, cpu: "Up to 32-core (24 performance + 8 efficiency)", mem: "Up to 512 GB unified", bw: 819, ne: "32-core", gpus: "Two M3 Max dies joined by UltraFusion", platform: "Mac Studio (2025)" },
    { summary: "Released in 2025 alongside M4 Max; the first Mac chip to support 512 GB of unified memory.",
      variants: [{ name: "M3 Ultra 60-core GPU", diff: "28-core CPU version, up to 256 GB memory." }], sources: ["ap-m3ultra", "mr-m3ultra"], checked: CHECKED });
  a("apple-m3-max", "Apple M3 Max", "M3", "Apple M3 GPU", "legacy", "2023-11",
    { gcores: 40, process: "TSMC 3 nm (N3B)", transistors: 92, cpu: "Up to 16-core (12 performance + 4 efficiency)", mem: "Up to 128 GB unified", memType: "LPDDR5-6400", bus: 512, bw: 400, ne: "16-core, 18 TOPS", platform: "MacBook Pro" },
    { summary: "Introduced Dynamic Caching, mesh shading and hardware ray tracing on the Mac.",
      variants: [{ name: "M3 Max 30-core GPU", diff: "14-core CPU, 300 GB/s memory bandwidth." }], sources: ["ap-m3", "at-m3"], checked: CHECKED });
  a("apple-m3-pro", "Apple M3 Pro", "M3", "Apple M3 GPU", "legacy", "2023-11",
    { gcores: 18, process: "TSMC 3 nm (N3B)", transistors: 37, cpu: "Up to 12-core (6 performance + 6 efficiency)", mem: "Up to 36 GB unified", memType: "LPDDR5-6400", bus: 192, bw: 150, ne: "16-core, 18 TOPS", platform: "MacBook Pro" },
    { summary: "Narrower 192-bit memory bus than M2 Pro, so bandwidth fell to 150 GB/s.",
      variants: [{ name: "M3 Pro 14-core GPU", diff: "11-core CPU version." }], sources: ["ap-m3", "at-m3"], checked: CHECKED });
  a("apple-m3", "Apple M3", "M3", "Apple M3 GPU", "legacy", "2023-11",
    { gcores: 10, process: "TSMC 3 nm (N3B)", cpu: "8-core (4 performance + 4 efficiency)", mem: "Up to 24 GB unified", memType: "LPDDR5-6400", bus: 128, bw: 100, ne: "16-core, 18 TOPS", platform: "MacBook Pro, iMac, MacBook Air" },
    { summary: "Base M3 with the new GPU architecture.", variants: [{ name: "M3 8-core GPU", diff: "Used in base MacBook Air and iMac models." }], sources: ["ap-m3", "at-m3"], checked: CHECKED });

  // ---- M2 family (second-generation 5 nm) ----
  a("apple-m2-ultra", "Apple M2 Ultra", "M2", "Apple M2 GPU", "legacy", "2023-06",
    { gcores: 76, process: "TSMC 5 nm (second generation)", transistors: 134, cpu: "24-core (16 performance + 8 efficiency)", mem: "Up to 192 GB unified", bw: 800, ne: "32-core", gpus: "Two M2 Max dies joined by UltraFusion", platform: "Mac Studio, Mac Pro (2023)" },
    { summary: "Two M2 Max dies; up to 30% faster GPU than M1 Ultra.", variants: [{ name: "M2 Ultra 60-core GPU", diff: "Lower GPU configuration." }], sources: ["ap-m2ultra"], checked: CHECKED });
  a("apple-m2-max", "Apple M2 Max", "M2", "Apple M2 GPU", "legacy", "2023-01",
    { gcores: 38, process: "TSMC 5 nm (second generation)", transistors: 67, cpu: "12-core (8 performance + 4 efficiency)", mem: "Up to 96 GB unified", bw: 400, ne: "16-core", platform: "MacBook Pro, Mac Studio" },
    { summary: "Up to 38 GPU cores and 96 GB of memory.", variants: [{ name: "M2 Max 30-core GPU", diff: "Lower GPU configuration." }], sources: ["ap-m2promax"] });
  a("apple-m2-pro", "Apple M2 Pro", "M2", "Apple M2 GPU", "legacy", "2023-01",
    { gcores: 19, process: "TSMC 5 nm (second generation)", transistors: 40, cpu: "Up to 12-core (8 performance + 4 efficiency)", mem: "Up to 32 GB unified", bw: 200, ne: "16-core", platform: "MacBook Pro, Mac mini" },
    { summary: "Up to 19 GPU cores.", variants: [{ name: "M2 Pro 16-core GPU", diff: "10-core CPU version." }], sources: ["ap-m2promax"] });
  a("apple-m2", "Apple M2", "M2", "Apple M2 GPU", "legacy", "2022-06",
    { gcores: 10, process: "TSMC 5 nm (second generation)", transistors: 20, cpu: "8-core (4 performance + 4 efficiency)", mem: "Up to 24 GB unified", bw: 100, ne: "16-core, 15.8 TOPS", platform: "MacBook Air, MacBook Pro 13-inch, Mac mini, iPad Pro" },
    { summary: "Second-generation base chip.", variants: [{ name: "M2 8-core GPU", diff: "Used in base MacBook Air models." }], sources: ["ap-m2"] });

  // ---- M1 family (5 nm) ----
  a("apple-m1-ultra", "Apple M1 Ultra", "M1", "Apple M1 GPU", "legacy", "2022-03",
    { gcores: 64, process: "TSMC 5 nm", transistors: 114, cpu: "20-core (16 performance + 4 efficiency)", mem: "Up to 128 GB unified", bw: 800, ne: "32-core", gpus: "Two M1 Max dies joined by UltraFusion", platform: "Mac Studio (2022)" },
    { summary: "The first UltraFusion chip.", variants: [{ name: "M1 Ultra 48-core GPU", diff: "Lower GPU configuration." }], sources: ["ap-m1ultra"] });
  a("apple-m1-max", "Apple M1 Max", "M1", "Apple M1 GPU", "legacy", "2021-10",
    { gcores: 32, process: "TSMC 5 nm", transistors: 57, cpu: "10-core (8 performance + 2 efficiency)", mem: "Up to 64 GB unified", bw: 400, ne: "16-core", platform: "MacBook Pro, Mac Studio" },
    { summary: "Apple's first high-end laptop chip.", variants: [{ name: "M1 Max 24-core GPU", diff: "Lower GPU configuration." }], sources: ["ap-m1promax"] });
  a("apple-m1-pro", "Apple M1 Pro", "M1", "Apple M1 GPU", "legacy", "2021-10",
    { gcores: 16, process: "TSMC 5 nm", transistors: 33.7, cpu: "Up to 10-core (8 performance + 2 efficiency)", mem: "Up to 32 GB unified", bw: 200, ne: "16-core", platform: "MacBook Pro" },
    { summary: "Mid-range M1 for the 2021 MacBook Pro.", variants: [{ name: "M1 Pro 14-core GPU", diff: "8-core CPU version." }], sources: ["ap-m1promax"] });
  a("apple-m1", "Apple M1", "M1", "Apple M1 GPU", "legacy", "2020-11",
    { gcores: 8, process: "TSMC 5 nm", transistors: 16, cpu: "8-core (4 performance + 4 efficiency)", mem: "Up to 16 GB unified", bw: 68.25, ne: "16-core, 11 TOPS", platform: "MacBook Air, MacBook Pro 13-inch, Mac mini, iMac, iPad Pro" },
    { summary: "Apple's first Mac chip.", variants: [{ name: "M1 7-core GPU", diff: "Used in the base MacBook Air and iMac." }], sources: ["ap-m1"] });

  D.ARCHS.push(
    { brand: "Apple", name: "Apple M1 GPU", year: "2020", process: "TSMC 5 nm", namesake: "—", products: "M1, M1 Pro, M1 Max, M1 Ultra", key: "Tile-based deferred rendering GPU sharing one unified memory pool with the CPU." },
    { brand: "Apple", name: "Apple M2 GPU", year: "2022", process: "TSMC 5 nm (2nd gen)", namesake: "—", products: "M2 family", key: "More cores and bandwidth; up to 192 GB unified memory on M2 Ultra." },
    { brand: "Apple", name: "Apple M3 GPU", year: "2023", process: "TSMC 3 nm", namesake: "—", products: "M3 family, M3 Ultra", key: "Dynamic Caching, mesh shading and hardware ray tracing." },
    { brand: "Apple", name: "Apple M4 GPU", year: "2024", process: "TSMC 3 nm (2nd gen)", namesake: "—", products: "M4 family", key: "Faster ray-tracing engine; Thunderbolt 5 on Pro and Max." },
    { brand: "Apple", name: "Apple M5 GPU", year: "2025–26", process: "TSMC 3 nm (3rd gen)", namesake: "—", products: "M5 family, M5 Ultra", key: "A Neural Accelerator in every GPU core for AI workloads." }
  );
})();
