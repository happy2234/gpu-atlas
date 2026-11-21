# GPU Atlas

An independent reference to NVIDIA, AMD and Intel GPUs: full spec sheets for desktop and laptop graphics, workstation cards, data-center accelerators, AI PCs and edge modules, with variants, official launch prices by country, dated street-price snapshots, side-by-side comparison and per-product sources.

Live site: https://gpuatlas.in/ (also reachable at https://happy2234.github.io/gpu-atlas/, which redirects)

## How it works

The data lives in plain JavaScript files. A small build script turns it into a static site:

- `/` — searchable database with brand, architecture, status, price and memory filters, plus compare
- `/gpu/<id>/` — one real page per product, with its own title, description, social preview image and structured data
- `/guides/` — guides generated from the data
- `/sitemap.xml`, `/robots.txt`

GitHub Actions runs the build and deploys to GitHub Pages on every push to `main`.

## Structure

```
index.html              Database / compare app shell
assets/data.js          NVIDIA products
assets/data-amd.js      AMD products and official launch prices by country
assets/data-meta.js     Corrections, Intel Arc, extra prices, street-price snapshots, "last checked" dates
assets/shared.js        Spec fields and formatting shared by the app and the build
assets/app.js           Database, compare and reference views
assets/styles.css       Styles (light and dark)
scripts/build.cjs       Static page, guide, image and sitemap generator
scripts/fonts/          Fonts used to render preview images
```

## Build locally

```
npm install
node scripts/build.cjs          # writes dist/
cd dist && python3 -m http.server 8000
```

Options: `SITE_URL` (canonical/sitemap base), `LINK_SUFFIX=index.html` (for hosts without directory indexes), `SKIP_IMAGES=1`, `OUT_DIR`.

## Editing data

- Add or fix a product in the relevant data file. Leave values out rather than guessing; empty fields are hidden.
- Official regional launch prices go in `prices` (local currency). Street prices go in `street` with a date and a source key — they are snapshots, so update or remove them when they go stale.
- When you verify a product's specs against an official page, set `checked` to the date and add the source.

## Search engines

The site is served at the root of https://gpuatlas.in, so `robots.txt` and `sitemap.xml` are found automatically. Also submit `https://gpuatlas.in/sitemap.xml` in Google Search Console (Domain property `gpuatlas.in`) and Bing Webmaster Tools.

## Disclaimer

Not affiliated with or endorsed by NVIDIA, AMD, Intel or Apple. Product names are trademarks of their respective owners.
