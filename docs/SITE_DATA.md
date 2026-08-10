# Site Data (local dev reference only)

The `site-data/` folder holds scraped content and media from [faststarttalking.com](https://faststarttalking.com). It is **local development reference only** — used to inform design and content for the new Next.js site. **Never commit `site-data/` to git.**

## Populate locally

From the `fst/` project root:

```bash
python3 -m venv site-data/.venv
source site-data/.venv/bin/activate
pip install requests beautifulsoup4 html2text lxml
python scrape.py
```

Or copy an existing `site-data/` tree from another machine.

## Expected layout

```
site-data/
├── pages/<slug>/       ← markdown + metadata from scrape
├── assets/
│   ├── images/
│   ├── videos/
│   └── other/
├── content-index.json
├── sitemap.json
└── .venv/              ← Python venv for scrape.py (optional)
```

The Next.js app reads `site-data/pages/` via `src/lib/content.ts`. Static assets are served through symlinks in `public/`:

- `public/images` → `site-data/assets/images`
- `public/videos` → `site-data/assets/videos`
- `public/other` → `site-data/assets/other`

After scraping, run `npm run dev` or `npm run build` to verify the site.

Fresh clones do not include scraped content. Run `python scrape.py` locally before building.
