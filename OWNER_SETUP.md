# Owner Setup Checklist — Fast Start Talking (FST)

> **Human owner tasks only.** AI handles code and config wiring. Check items off as you complete them. **Never commit real secrets** — paste values in Launchpad env or local `.env.local` only.

Env var reference: `.env.example` in this directory.

---

## GitHub Repository

- [x] **Create GitHub repository** — [github.com/ekddigital/fst](https://github.com/ekddigital/fst) — (one-time)
- [x] **Initialize git in `fst/`** — pushed initial code — (one-time)
- [ ] **Connect Launchpad to GitHub** — root directory: `fst/` (folder with `package.json`) — (one-time)

---

## VPS Access (outline-vpn)

SSH config alias (in `~/.ssh/config`):

```
Host outline-vpn
    HostName 74.208.9.102
    User root
    Port 22
    IdentityFile ~/.ssh/enoch_lab_ed25519
```

Connect:

```bash
ssh outline-vpn
```

---

## TMD Hosting — cPanel deploy (recommended for production)

Deploy FST to TMD via **cPanel Git Version Control** on a **new subdomain** (e.g. `app.faststarttalking.com`) and isolated path (`~/coding/fst/`). **Do not deploy to `public_html` or existing site folders.**

Full step-by-step (clone → `.env` → build → Node.js app → ongoing Pull/Deploy): **[docs/TMD_DEPLOY.md](docs/TMD_DEPLOY.md)**

- [ ] **Clone repo in cPanel Git** — `https://github.com/ekddigital/fst.git` → `/home/faststar/coding/fst` (name: `fst`)
- [ ] **Create `.env` on server** — `DATABASE_URL` with `@127.0.0.1:5432`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD` (never commit)
- [ ] **First build on server** — `npm install`, `prisma generate`, `db:push`, `db:seed`, `build`
- [ ] **Create subdomain** — e.g. `app.faststarttalking.com` (new docroot, not `public_html`)
- [ ] **Setup Node.js App** in cPanel — application root `coding/fst`, restart after each deploy
- [ ] **Deploy loop** — push to GitHub → auto-deploy via GitHub Actions SSH (recommended) → restart Node app
- [ ] **GitHub Actions SSH deploy** (recommended when cPanel webhook unavailable) — see [docs/TMD_DEPLOY.md § GitHub Actions SSH deploy](docs/TMD_DEPLOY.md#github-actions-ssh-deploy-recommended)
  - [ ] Generate deploy key: `ssh-keygen -t ed25519 -f github_actions_fst -N ""`
  - [ ] cPanel → **SSH Access** → **Manage SSH Keys** → import public key → **Authorize** for user `faststar`
  - [ ] GitHub → Settings → Secrets and variables → Actions:
    - `TMD_SSH_PRIVATE_KEY` — full private key contents
    - `TMD_SSH_HOST` — e.g. `195.250.26.111` or `faststarttalking.com`
    - `TMD_SSH_USER` — `faststar`
    - `TMD_SSH_PORT` — optional, default `22`
  - [ ] **Remove** `CPANEL_DEPLOY_WEBHOOK_URL` if it is a cPanel login URL (contains `cpsess`)
  - [ ] After each deploy: cPanel → **Setup Node.js App** → **Restart** (Passenger limitation)
- [ ] **Auto-deploy webhook (fallback)** — only if SSH deploy is not used; cPanel Git → Manage → Pull or Deploy → copy **Webhook URL** → GitHub secret `CPANEL_DEPLOY_WEBHOOK_URL` — see [docs/TMD_DEPLOY.md § Automatic deploy](docs/TMD_DEPLOY.md#automatic-deploy-on-github-push-cpanel-webhook-fallback)

SSH and PostgreSQL dev access: [docs/TMD_SSH.md](docs/TMD_SSH.md).

- [ ] **Authorize SSH public key in TMD panel** — import `tmdconnect.pub`, authorize for SSH user
- [ ] **Test login** — `ssh tmd` (alias in `~/.ssh/config`)

Quick reference:

```bash
ssh tmd
ssh -N tmd-psql    # optional tunnel fallback only (see docs/TMD_SSH.md)
```

---

## Database (PostgreSQL on TMD)

FST uses **PostgreSQL** via Prisma on TMD cPanel. cPanel prefixes database names and users with the account username (`faststar`):

- Database: `faststar_fst`
- User: `faststar_tmdconnect`
- Server: `195.250.26.111:5432`

**Primary connection string** (same direct-IP pattern as FOM):

```
postgresql://faststar_tmdconnect:DB_PASSWORD@195.250.26.111:5432/faststar_fst?sslmode=disable
```

Set as `DATABASE_URL` in `.env.local` (local) and Launchpad env (production). **Never commit real passwords or connection strings.**

- [ ] **Enable cPanel Remote PostgreSQL** — add your dev IP and Launchpad egress IP so `195.250.26.111:5432` accepts connections
- [ ] **Test connectivity** — `nc -zv 195.250.26.111 5432`

### Sync schema

After `DATABASE_URL` is set with real password:

```bash
npm run db:generate && npm run db:push && npm run db:seed
```

See [docs/TMD_SSH.md](docs/TMD_SSH.md) for SSH setup and tunnel fallback (if Remote PostgreSQL is not yet enabled).

### Local `.env.local`

```bash
cp .env.example .env.local
# Set DATABASE_URL with @195.250.26.111:5432 and password from cPanel → PostgreSQL Databases
```

Without a working `DATABASE_URL`, the site builds but pages that query the DB may fail at build/runtime.

### Admin dashboard

Set at least one of these in `.env.local` / Launchpad (never commit real values):

- `ADMIN_PASSWORD` — sign in at `/admin/login` to manage categories, resources, articles, assessments, and submissions
- `ADMIN_API_KEY` — `Authorization: Bearer <key>` or `X-Admin-Api-Key` header for `/api/admin/*`

Run `npm run db:seed` once after first deploy to populate resources, assessments, and articles.

**Re-seeding an existing database:** Seed uses `upsert` by slug for articles, resources, categories, and assessments — safe to run again. To apply seed changes (e.g. corrected video URLs) without wiping data:

```bash
npm run db:seed
```

---

## Local Development

- [ ] **Copy env template** — `cp .env.example .env.local` and set values locally
- [ ] **Install dependencies** — `npm install`
- [ ] **Scrape site-data locally** — see [docs/SITE_DATA.md](./docs/SITE_DATA.md) (`python scrape.py`)
- [ ] **Public symlinks** — `public/images` → `site-data/assets/images`, `public/other` → `site-data/assets/other`, `public/videos` → `site-data/assets/videos`
- [ ] **Run dev server** — `npm run dev` → http://localhost:3000
- [ ] **Verify build** — `npx tsc --noEmit && npm run build`

---

## Assets & Archive

- [ ] **Scraped site-data present locally** — `site-data/` contains `pages/`, `assets/`, `content-index.json` (gitignored; run `python scrape.py` — see [docs/SITE_DATA.md](./docs/SITE_DATA.md))
- [ ] **Videos** — self-hosted in `public/videos/` (symlink from `site-data/assets/videos/`). Resource video URLs are managed in the admin dashboard and seeded via `npm run db:seed`.

---

## Launchpad (Deploy)

- [ ] **Create Launchpad project** — [lpad.ekddigital.com](https://lpad.ekddigital.com) → New Project — (one-time)
- [ ] **Upload env vars** — `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD` or `ADMIN_API_KEY` (production URL)
- [ ] **Custom domain + DNS** — point domain to Launchpad; set `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] **Database reachable from Launchpad** — enable cPanel Remote PostgreSQL for Launchpad egress IP, or confirm direct `@195.250.26.111:5432` works
- [ ] **Push to `main`** → confirm Launchpad deploy success

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
- `site-data/` is local dev reference only — never committed (see [docs/SITE_DATA.md](./docs/SITE_DATA.md))
