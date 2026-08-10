# TMD cPanel Deployment — Fast Start Talking (FST)

Deploy FST to **TMD shared hosting** (`faststar@s3838`, `195.250.26.111`) via **cPanel Git Version Control** and **Setup Node.js App**. The app lives at an isolated path — **not** `public_html`.

Related docs:

- [TMD_SSH.md](./TMD_SSH.md) — SSH keys, PostgreSQL connectivity, tunnel workflow
- [OWNER_SETUP.md](../OWNER_SETUP.md) — owner checklist
- GitHub repo: [github.com/ekddigital/fst](https://github.com/ekddigital/fst) (`main` branch)
- cPanel Git docs: [Git Version Control](https://docs.cpanel.net/cpanel/files/git-version-control/) · [Deployment guide](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/)

---

## Safety on shared hosting

This cPanel account hosts **many existing sites** under `~/`:

| Path / domain | Notes |
|---------------|-------|
| `~/public_html/` | WordPress / primary site — **do not deploy FST here** |
| `~/teacherjoe.faststarttalking.com/` | Existing subdomain site |
| `~/jinanicf.com/` | Existing site |
| **`~/coding/fst/`** | **FST only** — safe, isolated clone path |

| Action | Touches existing sites? |
|--------|-------------------------|
| Clone FST to `~/coding/fst/` | **No** — new folder only |
| Create subdomain for FST (e.g. `app.faststarttalking.com`) | **No** — new vhost |
| `npm run db:push` / `db:seed` on `faststar_fst` | **No** — database only |
| cPanel Git **Pull** + **Deploy HEAD Commit** | **No** — only updates `~/coding/fst/` |

Never commit `secrets/`, `.env`, `.env.local`, or private keys. Create `.env` **manually on the server** after clone.

---

## Deploy settings (reference)

| Setting | Value |
|---------|-------|
| Clone URL | `https://github.com/ekddigital/fst.git` |
| Repository path | `/home/faststar/coding/fst` |
| Branch | `main` |
| Node.js app root | `coding/fst` |
| Subdomain (example) | `app.faststarttalking.com` or `teacherjoe.faststarttalking.com` |
| PostgreSQL database | `faststar_fst` |
| PostgreSQL user | `faststar_tmdconnect` |
| Server-side DB host | `127.0.0.1:5432` |

The repo is **public** on GitHub today, so HTTPS clone works without credentials. If the repo becomes **private**, add a **deploy key** in cPanel → **SSH Access → Manage SSH Keys** and use the SSH clone URL instead.

---

## Phase 1 — Clone (cPanel UI)

You are doing this step now.

1. cPanel → **Git Version Control** → **Create**
2. Fill in:

   | Field | Value |
   |-------|-------|
   | Clone URL | `https://github.com/ekddigital/fst.git` |
   | Repository Path | `/home/faststar/coding/fst` |
   | Name | `fst` |
   | Branch | `main` |

3. Click **Create**
4. Wait for the clone to finish — confirm `package.json`, `prisma/`, `src/`, and `.cpanel.yml` are present

**Do not** clone into `public_html` or any existing site folder.

---

## Phase 2 — First-time setup on server (Terminal)

After clone completes, open cPanel **Terminal** or SSH (`ssh tmd`) and run:

```bash
cd ~/coding/fst

# Create .env (NOT in git — never commit this file):
# DATABASE_URL="postgresql://faststar_tmdconnect:PASSWORD@127.0.0.1:5432/faststar_fst?sslmode=disable"
# NEXT_PUBLIC_SITE_URL="https://faststarttalking.com"
# ADMIN_PASSWORD="choose-a-strong-password"

cp .env.example .env
nano .env   # paste real values; URL-encode special chars in password (# → %23)
chmod 600 .env

node -v    # expect 18+ or 20+
npm -v

npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run build
```

| Command | Purpose |
|---------|---------|
| `npm install` | First install (use `npm ci` on later deploys — see `.cpanel.yml`) |
| `npx prisma generate` | Generate Prisma client |
| `npm run db:push` | Sync schema → `faststar_fst` |
| `npm run db:seed` | Seed categories, resources, articles, assessments |
| `npm run build` | `prisma generate && next build` — **requires working `DATABASE_URL`** |

**Why `127.0.0.1:5432` on the server?** PostgreSQL runs locally on the shared host. No Remote PostgreSQL whitelist or SSH tunnel is needed for deploy-time commands on the server.

Verify `.next/` exists after build. Optional manual smoke test:

```bash
npm run start
# Ctrl+C to stop — use cPanel Node.js App for production
```

---

## Phase 3 — Setup Node.js App (cPanel)

If your plan includes **Setup Node.js App** (or **Application Manager**):

1. cPanel → **Setup Node.js App** → **Create Application**
2. Configure:

   | Field | Value |
   |-------|-------|
   | Node.js version | 18.x or 20.x (LTS) |
   | Application mode | Production |
   | Application root | `coding/fst` → `/home/faststar/coding/fst` |
   | Application URL | Subdomain, e.g. `app.faststarttalking.com` — **not** `public_html` |
   | Startup command | `npm run start` |

   Alternative startup (if the panel wants a file):

   ```bash
   node node_modules/next/dist/bin/next start -p $PORT
   ```

3. **Environment variables** — add the same values as `.env` (belt-and-suspenders):

   - `NODE_ENV=production`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `ADMIN_PASSWORD` (and/or `ADMIN_API_KEY`)

4. **Create** → **Run NPM Install** (if offered) → **Start** / **Restart**

cPanel configures a reverse proxy from your subdomain to the Node port. No `.htaccess` changes in `public_html` are needed.

### Smoke test

- Home page loads on your subdomain
- `/programs`, `/articles` — DB-backed pages
- `/admin/login` — admin dashboard
- Contact / assessment forms submit

---

## Phase 4 — Ongoing workflow

### Daily development (Mac)

1. Work in `/Users/ekd/Documents/coding/web/andgroupco/fst`
2. Verify locally: `npx tsc --noEmit && npm run build`
3. Push to GitHub:

   ```bash
   git push origin main
   ```

### Deploy on TMD

1. cPanel → **Git Version Control** → select `fst`
2. **Pull or Deploy** → **Update from Remote** (pull latest `main`)
3. **Deploy HEAD Commit** — runs `.cpanel.yml` automatically:

   ```yaml
   # .cpanel.yml (in repo root)
   deployment:
     tasks:
       - export DEPLOYPATH=/home/faststar/coding/fst
       - export NODE_ENV=production
       - npm ci + prisma generate + npm run build (in $DEPLOYPATH)
   ```

4. cPanel → **Setup Node.js App** → **Restart** the FST application

**Schema changes only:** after editing `prisma/schema.prisma`, SSH in and run `npm run db:push` before or after deploy. `.cpanel.yml` does **not** run `db:push` or `db:seed` on every deploy (by design).

Optional one-liner after pull (if you skip **Deploy HEAD Commit**):

```bash
cd ~/coding/fst && npm ci && npx prisma generate && npm run build
```

```mermaid
flowchart LR
  Mac[Mac: develop] -->|git push| GH[GitHub main]
  GH -->|cPanel Pull| Server[~/coding/fst]
  Server -->|Deploy HEAD Commit| Build[npm ci + build]
  Build --> Node[cPanel Node.js App]
  Node --> Sub[subdomain]
  Server --> PG[(faststar_fst)]
```

---

## `.cpanel.yml` — automated deploy tasks

The repo includes `.cpanel.yml` at the root. cPanel runs these shell commands when you click **Deploy HEAD Commit**:

- `npm ci` — reproducible install from `package-lock.json`
- `npx prisma generate` — refresh Prisma client after schema/pull changes
- `npm run build` — production Next.js build

**Prerequisites before first Deploy HEAD Commit:**

- `.env` must exist on the server with a working `DATABASE_URL` (build queries the DB)
- Node.js version on server must be 18+ (Next.js 16 requirement)

**After every Deploy HEAD Commit:** restart the Node.js app in cPanel.

For static-site deploys, cPanel docs use `cp` to copy files into `public_html`. FST is a **dynamic Next.js app** — the repo path **is** the app root; build in place instead of copying.

---

## Database reference

| Item | Value |
|------|-------|
| Database | `faststar_fst` |
| User | `faststar_tmdconnect` |
| On server | `127.0.0.1:5432` |
| From Mac (if Remote PG enabled) | `195.250.26.111:5432` |

See [TMD_SSH.md](./TMD_SSH.md) for local dev connectivity (SSH tunnel or Remote PostgreSQL).

---

## Troubleshooting

### `npm run build` fails with P1001

Database unreachable at build time. On server, confirm `.env` uses `@127.0.0.1:5432` and the password is correct (URL-encoded).

### Deploy HEAD Commit disabled or fails

- Confirm `.cpanel.yml` is in the repo root on `main`
- Working tree must be clean (no uncommitted changes on server clone)
- Check deploy log: `~/.cpanel/logs/vc_*_git_deploy.log`

### Node.js app shows 503 / blank page

- Confirm `npm run build` completed (`.next/` exists)
- Restart the Node.js app after env or code changes
- Verify `NEXT_PUBLIC_SITE_URL` matches the live subdomain

### Git pull and `.env`

`.env` is gitignored and should persist across pulls. Keep a backup in a password manager.

### Private GitHub repo

Generate a deploy key in cPanel → **SSH Access**, add the public key to GitHub → repo **Settings → Deploy keys**, and switch the clone URL to `git@github.com:ekddigital/fst.git`.

---

## First deploy checklist

- [ ] Git cloned to `/home/faststar/coding/fst`
- [ ] `.env` created on server (`127.0.0.1:5432`, production URL, admin password)
- [ ] `npm install && npx prisma generate && npm run db:push && npm run db:seed && npm run build`
- [ ] cPanel Node.js App created for `coding/fst`, env vars set, app started
- [ ] Smoke test: home, programs, articles, admin login, forms
- [ ] Push to `main` → cPanel Pull → Deploy HEAD Commit → restart Node app verified

---

## Optional: Launchpad deploy (alternative)

[OWNER_SETUP.md](../OWNER_SETUP.md) also documents **Launchpad** as an alternative host. TMD cPanel deploy keeps app and database on the same TMD account.
