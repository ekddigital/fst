# Fast Start Talking (FST)

Next.js site for [faststarttalking.com](https://faststarttalking.com).

## Development

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL when ready
npm run dev                    # http://localhost:3000
```

Verify: `npx tsc --noEmit && npm run build`

## Layout

| Path | Purpose |
|------|---------|
| `src/` | Next.js app (pages, components, API routes) |
| `public/` | Static assets; symlinks into `site-data/assets/` |
| `prisma/` | Database schema |
| `site-data/` | Scraped WordPress mirror (gitignored) — see `site-data/README.md` |
| `scrape.py` | Script to populate `site-data/` from faststarttalking.com |

The scraped content in `site-data/pages/` is read at build/runtime by `src/lib/content.ts` for articles and program copy. Images are served via `public/images` → `site-data/assets/images`.

Fresh clones do not include scraped content. Run `python scrape.py` (see `site-data/README.md`) or copy `site-data/` locally before building.

Owner setup checklist: [OWNER_SETUP.md](./OWNER_SETUP.md)
