# TMD cPanel Deployment — Fast Start Talking (FST)

Deploy the FST Next.js app to **TMD shared hosting** (`faststar@s3838`, `195.250.26.111`) via **cPanel Git Version Control**, without touching existing sites.

Related docs:

- [TMD_SSH.md](./TMD_SSH.md) — SSH keys, PostgreSQL connectivity, tunnel workflow
- [OWNER_SETUP.md](../OWNER_SETUP.md) — owner checklist
- GitHub repo: [github.com/ekddigital/fst](https://github.com/ekddigital/fst) (`main` branch)

---

## Safety on shared hosting (read first)

This cPanel account hosts **many existing sites** under `~/`:

| Path / domain | Notes |
|---------------|-------|
| `~/public_html/` | May contain WordPress or primary site — **do not deploy FST here** |
| `~/teacherjoe.faststarttalking.com/` | Existing subdomain site |
| `~/jinanicf.com/` | Existing site |
| Other domain folders | Leave untouched |

**FST deploy only affects:**

- A **new directory** you choose (e.g. `~/fst-app/`)
- A **new subdomain** you create (e.g. `app.faststarttalking.com`)
- The PostgreSQL database **`faststar_fst`** (isolated from other sites' files)

| Action | Touches existing sites? |
|--------|-------------------------|
| Clone FST to `~/fst-app/` | **No** — new folder only |
| Create subdomain `app.faststarttalking.com` | **No** — new vhost/docroot |
| `npm run db:push` / `db:seed` on `faststar_fst` | **No** — database only |
| cPanel Git **Pull/Deploy** on FST repo | **No** — only updates FST clone path |
| Editing `public_html` or other domain folders | **Yes** — **avoid** |

Never commit `secrets/`, `.env`, `.env.local`, or private keys. Create `.env` **manually on the server** after clone.

---

## Recommended deploy path

**Primary recommendation:** clone to an isolated app directory and serve via **cPanel Setup Node.js App** on a **new subdomain**.

| Setting | Recommended value |
|---------|-------------------|
| Git clone path | `/home/faststar/fst-app` |
| Subdomain | `app.faststarttalking.com` (or `fst.faststarttalking.com`) |
| Subdomain docroot | Point to Node.js app (cPanel sets this) or `~/fst-app` |
| Do **not** use | `~/public_html`, `~/teacherjoe.faststarttalking.com`, or any existing site folder |

**Why a new subdomain?**

- Keeps WordPress and legacy sites in their current folders
- Lets cPanel manage Node.js process, port, and reverse proxy
- Clean DNS cutover when ready (`NEXT_PUBLIC_SITE_URL` matches subdomain)

**Alternative (subfolder only, no subdomain):** deploy under `~/fst-app/` and access via a path on an existing domain only if you understand reverse-proxy rules — subdomain is simpler and safer.

---

## Prerequisites

Complete these before first deploy:

1. **SSH access** — see [TMD_SSH.md](./TMD_SSH.md): import `tmdconnect.pub`, authorize, test `ssh tmd echo ok`
2. **PostgreSQL database** — cPanel → **PostgreSQL Databases**:
   - Database: `faststar_fst`
   - User: `faststar_tmdconnect`
   - User has **ALL PRIVILEGES** on `faststar_fst`
3. **Node.js** — cPanel → **Setup Node.js App** (or **Application Manager**) available on your plan
4. **GitHub repo** — [github.com/ekddigital/fst](https://github.com/ekddigital/fst) is public or deploy key configured

### Connectivity snapshot (Aug 2026 dev machine tests)

These results inform local vs server-side database work:

| Test | Result |
|------|--------|
| Mac public IP | **`31.97.41.230`** — add in cPanel **Remote PostgreSQL** for direct Mac → DB |
| `195.250.26.111:5432` from Mac | **Unreachable** (IP not whitelisted) |
| `ssh tmd` | **`Permission denied (publickey)`** until key is authorized + loaded in agent |
| `npm run db:push` from Mac (direct URL) | **P1001** — can't reach server |
| Prisma / DB on **server** via `127.0.0.1:5432` | **Works** — use this for deploy-time schema sync |
| `npx tsc --noEmit` | **Pass** |
| `npm run build` without DB | **Fails** at page data collection (Next.js queries DB at build) |

**Implication:** run `db:push`, `db:seed`, and `npm run build` **on the server** (or fix Mac connectivity first via SSH tunnel or Remote PostgreSQL).

---

## Step 1 — Create subdomain (cPanel)

1. cPanel → **Domains** → **Create A New Domain** (or **Subdomains**)
2. Subdomain: `app.faststarttalking.com`
3. **Document root:** use cPanel's default for the subdomain (e.g. `~/app.faststarttalking.com`) — the Node.js app will override the actual serving path
4. Do **not** point this subdomain at `public_html` or an existing site's folder

DNS: if `faststarttalking.com` DNS is already on TMD, the subdomain may auto-resolve. Otherwise add an **A record** for `app` → `195.250.26.111`.

---

## Step 2 — Clone via cPanel Git Version Control

1. cPanel → **Git Version Control**
2. Click **Create**
3. Fill in:

   | Field | Value |
   |-------|-------|
   | Clone URL | `https://github.com/ekddigital/fst.git` |
   | Repository Path | `/home/faststar/fst-app` |
   | Branch | `main` |

4. Click **Create**
5. Confirm the repo cloned — you should see `package.json`, `prisma/`, `src/`, etc.

**Important:** choose `/home/faststar/fst-app` (or similar **new** path). Do not clone into `public_html` or any existing site directory.

### Updating after clone (Pull / Deploy)

When you push changes to GitHub from your Mac:

1. cPanel → **Git Version Control**
2. Select the `fst-app` repository
3. Click **Pull or Deploy** (wording varies by cPanel version)
4. Re-run build steps on the server (see [Post-pull deploy](#post-pull-deploy-on-server))

Some TMD/cPanel installs support **webhook auto-deploy** (Settings → Webhook URL). Copy the URL into GitHub → repo **Settings → Webhooks** if you want push-to-deploy. Manual pull is fine to start.

---

## Step 3 — Create `.env` on the server (never in git)

SSH in or use cPanel **Terminal**:

```bash
ssh tmd
cd ~/fst-app
cp .env.example .env
nano .env   # or use cPanel File Manager
```

**Server `.env` format** — PostgreSQL on localhost (no tunnel, no remote whitelist needed **on the server**):

```bash
# Production — SERVER ONLY (create manually, never commit)
DATABASE_URL="postgresql://faststar_tmdconnect:DB_PASSWORD@127.0.0.1:5432/faststar_fst?sslmode=disable"

NEXT_PUBLIC_SITE_URL="https://app.faststarttalking.com"

ADMIN_PASSWORD="choose-a-strong-password"
# ADMIN_API_KEY=""   # optional alternative to ADMIN_PASSWORD
```

Replace `DB_PASSWORD` with the password from cPanel → **PostgreSQL Databases**. URL-encode special characters (`#` → `%23`, `!` → `%21`, `@` → `%40`).

Set file permissions:

```bash
chmod 600 ~/fst-app/.env
```

---

## Step 4 — First-time build on server

From SSH (`ssh tmd`) or cPanel **Terminal**:

```bash
cd ~/fst-app

# Use Node version cPanel Node.js app expects (18+ or 20+ recommended for Next.js 16)
node -v
npm -v

npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run build
```

| Script | Purpose |
|--------|---------|
| `npm install` | Install dependencies |
| `npm run db:generate` | `prisma generate` — client from schema |
| `npm run db:push` | Sync Prisma schema → `faststar_fst` |
| `npm run db:seed` | Seed categories, resources, articles, assessments |
| `npm run build` | `prisma generate && next build` — **requires working DATABASE_URL** |

Verify build output exists: `.next/` directory.

Test start (manual, before Node.js app config):

```bash
npm run start
# default port 3000 — stop with Ctrl+C after smoke test
```

---

## Step 5 — cPanel Setup Node.js App

1. cPanel → **Setup Node.js App** (or **Application Manager**)
2. **Create Application**

   | Field | Value |
   |-------|-------|
   | Node.js version | 18.x or 20.x (latest LTS available) |
   | Application mode | Production |
   | Application root | `fst-app` (maps to `/home/faststar/fst-app`) |
   | Application URL | `app.faststarttalking.com` |
   | Application startup file | `node_modules/next/dist/bin/next` or use npm script (see below) |

3. **Environment variables** — add the same values as `.env` in the cPanel UI (belt-and-suspenders; Next.js also reads `.env`):

   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `ADMIN_PASSWORD` (and/or `ADMIN_API_KEY`)

4. **Start script** — many cPanel Node setups use:

   ```bash
   npm run start
   ```

   Or directly:

   ```bash
   node node_modules/next/dist/bin/next start -p $PORT
   ```

   cPanel sets `$PORT`; if the UI asks for a startup command, use whatever matches your panel's docs.

5. Click **Create** / **Save**, then **Start** / **Restart** the application

6. cPanel usually configures Apache/nginx reverse proxy from your subdomain to the Node port — no manual `.htaccess` in `public_html` needed.

### Smoke test

- `https://app.faststarttalking.com` — home page loads
- `/programs`, `/articles` — DB-backed pages
- `/admin/login` — admin dashboard (use `ADMIN_PASSWORD`)
- Contact / assessment forms submit

---

## Post-pull deploy on server

After each **Pull or Deploy** from cPanel Git:

```bash
cd ~/fst-app
npm install
npm run db:generate
npm run db:push      # only if schema changed
npm run build
```

Then in cPanel → **Setup Node.js App** → **Restart** the application.

Optional one-liner (after SSH in):

```bash
cd ~/fst-app && npm install && npm run db:generate && npm run db:push && npm run build
# restart app from cPanel UI
```

---

## Local dev + server deploy workflow

```mermaid
flowchart LR
  Mac[Mac: develop locally] -->|git push| GH[GitHub main]
  GH -->|cPanel Pull/Deploy| Server[~/fst-app on TMD]
  Server -->|npm install + build| Node[cPanel Node.js App]
  Node --> Sub[app.faststarttalking.com]
  Server --> PG[(faststar_fst PostgreSQL)]
```

### On your Mac (daily development)

1. Work in local clone: `/Users/ekd/Documents/coding/web/andgroupco/fst`
2. Copy env: `cp .env.example .env.local`
3. Connect to PostgreSQL (pick one — see [TMD_SSH.md](./TMD_SSH.md)):

   **Option A — SSH tunnel (recommended, no cPanel firewall change):**

   ```bash
   # Terminal A — keep open
   ssh -N tmd-psql
   ```

   In `.env.local`:

   ```bash
   # DEV ONLY — requires: ssh -N tmd-psql
   DATABASE_URL="postgresql://faststar_tmdconnect:DB_PASSWORD@127.0.0.1:5433/faststar_fst?sslmode=disable"
   ```

   **Option B — Remote PostgreSQL (direct IP):**

   Add **`31.97.41.230`** in cPanel → **Remote PostgreSQL**, then:

   ```bash
   DATABASE_URL="postgresql://faststar_tmdconnect:DB_PASSWORD@195.250.26.111:5432/faststar_fst?sslmode=disable"
   ```

4. Dev loop:

   ```bash
   npm install
   npm run dev          # http://localhost:3000
   npx tsc --noEmit && npm run build   # verify before push
   ```

5. Push to GitHub:

   ```bash
   git add …
   git commit -m "…"
   git push origin main
   ```

### On the server (deploy)

1. cPanel → Git Version Control → **Pull or Deploy**
2. SSH: `cd ~/fst-app && npm install && npm run db:generate && npm run db:push && npm run build`
3. cPanel → Node.js App → **Restart**

### Who uses which `DATABASE_URL`?

| Environment | Host in `DATABASE_URL` | Why |
|-------------|------------------------|-----|
| Mac + SSH tunnel | `127.0.0.1:5433` | Tunnel forwards to server PG |
| Mac + Remote PG | `195.250.26.111:5432` | Direct if IP whitelisted |
| **TMD server** | **`127.0.0.1:5432`** | PostgreSQL is local on shared host |

---

## Database reference

| Item | Value |
|------|-------|
| Database | `faststar_fst` |
| User | `faststar_tmdconnect` |
| Server (from Mac, if remote enabled) | `195.250.26.111:5432` |
| Server (on TMD host) | `127.0.0.1:5432` |
| cPanel account prefix | `faststar_` |

Prisma commands (from `package.json`):

```bash
npm run db:generate   # prisma generate
npm run db:push       # prisma db push
npm run db:seed       # npx tsx prisma/seed.ts
```

**Re-seeding:** seed uses `upsert` by slug — safe to run again after content fixes.

**Schema changes:** after editing `prisma/schema.prisma`, run `db:push` on the server (or from Mac if connected), then rebuild.

---

## Assets and `site-data/`

- `site-data/` is **gitignored** — scraped locally for dev reference ([SITE_DATA.md](./SITE_DATA.md))
- Production content lives in PostgreSQL (seed + admin dashboard)
- Self-hosted videos: ensure `public/videos/` symlinks or assets exist on server if you rely on local files; otherwise URLs are managed in admin/seed

For a minimal first deploy, seeded DB content is enough; full asset mirror is optional follow-up.

---

## Troubleshooting

### SSH `Permission denied (publickey)`

See [TMD_SSH.md — Troubleshooting](./TMD_SSH.md#permission-denied-publickey). Re-authorize `tmdconnect.pub` in cPanel, then:

```bash
ssh-add --apple-use-keychain ~/.ssh/tmdconnect
ssh tmd echo ok
```

### `npm run build` fails with P1001

Database unreachable at build time. On server, confirm `.env` uses `@127.0.0.1:5432`. From Mac, start SSH tunnel or whitelist your IP.

### Node.js app shows 503 / blank page

- Check cPanel Node.js app logs
- Confirm `npm run build` completed (`.next/` exists)
- Restart the application after env changes
- Verify `NEXT_PUBLIC_SITE_URL` matches the live subdomain

### Git pull overwrote `.env`

`.env` is gitignored and should not be in the repo. If missing after pull, recreate from `.env.example`. cPanel Git pull should not delete untracked `.env`, but keep a backup in a password manager.

### Accidentally cloned to wrong path

Do **not** delete existing site folders. Remove only the mistaken clone directory (if empty/wrong), then re-clone to `~/fst-app`.

---

## First deploy checklist

- [ ] Subdomain `app.faststarttalking.com` created (not `public_html`)
- [ ] Git cloned to `/home/faststar/fst-app`
- [ ] `.env` created on server (`127.0.0.1:5432`, production URL, admin password)
- [ ] `npm install && npm run db:generate && npm run db:push && npm run db:seed && npm run build`
- [ ] cPanel Node.js App created, env vars set, app started
- [ ] Smoke test: home, programs, articles, admin login, forms
- [ ] Mac dev: SSH tunnel or Remote PG working for local Prisma
- [ ] Push to `main` → cPanel Pull → rebuild → restart verified

---

## Optional: Launchpad deploy (alternative)

[OWNER_SETUP.md](../OWNER_SETUP.md) also documents **Launchpad** (`lpad.ekddigital.com`) as an alternative host. TMD cPanel deploy keeps app and database on the same TMD account; Launchpad is a separate path if you prefer managed Node hosting elsewhere.

For TMD-native hosting, follow this doc end-to-end.
