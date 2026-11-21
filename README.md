# GPU Atlas

An independent reference to NVIDIA and AMD GPUs: full specifications for desktop and laptop graphics, workstation cards, data-center accelerators, AI PCs and edge modules, with variants, official launch prices by country, side-by-side comparison and per-product sources.

Static site. No build step, no dependencies.

## Structure

```
index.html          Page shell
assets/data.js      NVIDIA dataset
assets/data-amd.js  AMD dataset and launch prices by country
assets/app.js       Database, spec-sheet, compare and reference views
assets/styles.css   Styles (light and dark themes)
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Deploy on GitHub Pages

1. Push these files to the root of a public repository.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. The site is published at `https://<username>.github.io/<repository>/`.

## Editing data

Each product in `assets/data.js` has an `id`, segment, series, architecture, status, launch date, launch price, `specs`, optional `variants` and a list of `sources` keys. Leave a value out rather than guessing; the spec sheet hides empty fields.

## Disclaimer

Not affiliated with or endorsed by NVIDIA or AMD. Product names are trademarks of their respective owners.
