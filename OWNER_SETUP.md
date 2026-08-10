# Owner Setup Checklist — Fast Start Talking (FST)

> **Human owner tasks only.** AI handles code and config wiring. Check items off as you complete them. **Never commit real secrets** — paste values in Launchpad env or local `.env.local` only.

Env var reference: `.env.example` in this directory.

---

## GitHub Repository

- [ ] **Create GitHub repository** — [github.com/new](https://github.com/new) or org `ekddigital` → **Private**; name e.g. `fst` — (one-time)
- [ ] **Initialize git in `fst/`** — this folder is not yet a git repo; run `git init`, add remote, push initial code — (one-time)
- [ ] **Connect Launchpad to GitHub** — root directory: `fst/` (folder with `package.json`) — (one-time)

---

## Database (MySQL)

- [ ] **Provision MySQL database** — EKD infra / DBA — obtain host + credentials
- [ ] **Set `DATABASE_URL`** — format: `mysql://user:password@host:3306/fst` → Launchpad env + local `.env.local`
- [ ] **Sync schema** — run `npm run db:generate && npm run db:push` after `DATABASE_URL` is set

Without `DATABASE_URL`, the site builds and runs but contact/assessment forms return a friendly unavailable message.

---

## Local Development

- [ ] **Copy env template** — `cp .env.example .env.local` and set values locally
- [ ] **Install dependencies** — `npm install`
- [ ] **Run dev server** — `npm run dev` → http://localhost:3000
- [ ] **Verify build** — `npx tsc --noEmit && npm run build`

---

## Assets & Archive

- [ ] **Scraped site-data present** — `site-data/` contains `pages/`, `assets/`, `content-index.json` (gitignored; run `python scrape.py` or copy locally — see `site-data/README.md`)
- [ ] **Public symlinks** — `public/images` → `site-data/assets/images`, `public/other` → `site-data/assets/other`, `public/videos` → `site-data/assets/videos`
- [ ] **Videos (optional)** — video embeds currently point to faststarttalking.com CDN; download to `site-data/assets/videos/` and update `src/lib/brand.ts` `VIDEOS` if self-hosting

---

## Launchpad (Deploy)

- [ ] **Create Launchpad project** — [lpad.ekddigital.com](https://lpad.ekddigital.com) → New Project — (one-time)
- [ ] **Upload env vars** — `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` (production URL)
- [ ] **Custom domain + DNS** — point domain to Launchpad; set `NEXT_PUBLIC_SITE_URL` to production URL

---

## EKDSend (Optional — future)

Skip unless contact form should email Teacher Joe on submission.

- [ ] **EKDSend API key** — `EKDSEND_API_KEY` → Launchpad env
- [ ] **Verified sender** — `EKDSEND_FROM` → Launchpad env

---

## First Deploy Checklist

- [ ] All env vars pasted in Launchpad
- [ ] Database reachable from Launchpad host
- [ ] `npm run db:push` run against production DB (once)
- [ ] Push to `main` → confirm Launchpad deploy success
- [ ] Smoke test: home, programs, articles, contact form, assessment form

---

## Notes

<!-- Owner: add project-specific reminders here. Do not paste secrets. -->

- Brand color: sky blue ~#75BEE2 (hue 200) — tokens in `src/app/globals.css` and `src/lib/brand.ts`
- Contact email on site: teacherjoejinan@gmail.com
