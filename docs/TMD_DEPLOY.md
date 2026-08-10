# TMD cPanel Deployment — Fast Start Talking (FST)

Deploy FST to **TMD shared hosting** (`faststar@s3838`, `195.250.26.111`) via **cPanel Git Version Control** and **Setup Node.js App**. The app lives at an isolated path — **not** `public_html`.

Related docs:

- [TMD_SSH.md](./TMD_SSH.md) — SSH keys, PostgreSQL connectivity, tunnel workflow
- [OWNER_SETUP.md](../OWNER_SETUP.md) — owner checklist
- GitHub repo: [github.com/ekddigital/fst](https://github.com/ekddigital/fst) (`main` branch)
- cPanel Git docs: [Git Version Control](https://docs.cpanel.net/cpanel/files/git-version-control/) · [Deployment guide](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/)

---

## Private repo + cPanel Git (HTTPS error)

If **Create** fails with:

```text
fatal: could not read Username for 'https://github.com': No such device or address
```

GitHub is **private** and cPanel cannot prompt for HTTPS credentials. Use **SSH + deploy key** (recommended), make the repo public, or embed a PAT in the URL (not recommended).

| Option | Summary | When to use |
|--------|---------|-------------|
| **A — SSH deploy key** | Server key → GitHub Deploy keys; clone `git@github.com:ekddigital/fst.git` | **Recommended** — read-only, no password in UI |
| **B — Public repo** | Settings → Change visibility → Public; keep HTTPS clone URL | Only if you accept a public codebase |
| **C — PAT in HTTPS URL** | `https://TOKEN@github.com/ekddigital/fst.git` | Avoid — token visible in cPanel/logs |

**Repo visibility:** If the repo is **private**, unauthenticated HTTPS clone fails as above — use Option A or B. If you already made `ekddigital/fst` **public**, HTTPS clone in cPanel works without credentials. Verify: GitHub → repo **Settings**, or `gh repo view ekddigital/fst --json visibility`.

Official cPanel: [Set Up Access to Private Repositories](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-set-up-access-to-private-repositories/).

### Option A — SSH deploy key (recommended)

**1. cPanel Terminal** (or `ssh tmd`):

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
ssh-keygen -t ed25519 -f ~/.ssh/github_fst_deploy -C "fst-cpanel-deploy" -N ""
cat ~/.ssh/github_fst_deploy.pub
```

**2. GitHub** → [ekddigital/fst](https://github.com/ekddigital/fst) → **Settings → Deploy keys → Add deploy key**

- Title: `TMD cPanel fst`
- Key: paste `github_fst_deploy.pub`
- **Allow write access:** off (read-only is enough for clone/pull)

**3. SSH config on server** — copy from [templates/github_fst_deploy_ssh_config.example](./templates/github_fst_deploy_ssh_config.example):

```bash
cat >> ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_fst_deploy
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
EOF
chmod 600 ~/.ssh/config ~/.ssh/github_fst_deploy
```

**4. Test:**

```bash
ssh -T git@github.com
# Hi ekddigital/fst! You've successfully authenticated...
git ls-remote git@github.com:ekddigital/fst.git HEAD
```

**5. cPanel → Git Version Control**

- **Create** (first time) **or** edit repository → change clone URL to SSH
- If UI already failed on HTTPS, delete the broken repo entry or use **Clone a Repository** with SSH URL only after the test above passes

| Field | Value |
|-------|-------|
| Clone URL | `git@github.com:ekddigital/fst.git` |
| Repository Path | `/home/faststar/coding/fst` |
| Name | `fst` |
| Branch | `main` |

Alternative: clone in Terminal first, then **Add Existing Repository** in cPanel (see [Immediate steps](#immediate-steps-cpanel-terminal) below).

### Option B — Make repo public

GitHub → **Settings → General → Danger Zone → Change repository visibility → Public**. Then cPanel **Create** with `https://github.com/ekddigital/fst.git` works without credentials. Re-evaluate if the repo should stay public.

### Option C — Personal access token in clone URL

Not recommended: token may appear in cPanel settings and deploy logs. Prefer Option A.

### Immediate steps (cPanel Terminal)

Do this **right now** if you have Terminal access and can add the deploy key to GitHub:

```bash
cd ~
mkdir -p coding
cd coding
# After deploy key + ~/.ssh/config (Option A):
git clone git@github.com:ekddigital/fst.git fst
ls -la fst/package.json fst/.cpanel.yml
```

Then in cPanel → **Git Version Control** → **Add Existing Repository** (wording may vary):

| Field | Value |
|-------|-------|
| Repository Path | `/home/faststar/coding/fst` |
| Remote URL | `git@github.com:ekddigital/fst.git` |
| Branch | `main` |

Continue with [Phase 2 — First-time setup on server](#phase-2--first-time-setup-on-server-terminal).

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
| Clone URL (private repo) | `git@github.com:ekddigital/fst.git` |
| Clone URL (if repo public) | `https://github.com/ekddigital/fst.git` |
| Repository path | `/home/faststar/coding/fst` |
| Branch | `main` |
| Node.js app root | `coding/fst` |
| Subdomain (example) | `app.faststarttalking.com` or `teacherjoe.faststarttalking.com` |
| PostgreSQL database | `faststar_fst` |
| PostgreSQL user | `faststar_tmdconnect` |
| Server-side DB host | `127.0.0.1:5432` |

The repo may be **public** (HTTPS clone works) or **private** (use [SSH deploy key](#option-a--ssh-deploy-key-recommended)). If HTTPS clone fails with a username prompt error, see [Private repo + cPanel Git](#private-repo--cpanel-git-https-error).

---

## Phase 1 — Clone (cPanel UI)

Complete [Option A — SSH deploy key](#option-a--ssh-deploy-key-recommended) on the server before using the SSH URL below.

1. cPanel → **Git Version Control** → **Create** (or **Add Existing Repository** if you cloned via Terminal)
2. Fill in:

   | Field | Value |
   |-------|-------|
   | Clone URL | `git@github.com:ekddigital/fst.git` |
   | Repository Path | `/home/faststar/coding/fst` |
   | Name | `fst` |
   | Branch | `main` |

3. Click **Create**
4. Wait for the clone to finish — confirm `package.json`, `prisma/`, `src/`, and `.cpanel.yml` are present

5. Continue with **[Post-clone checklist](#post-clone-checklist-start-here-after-clone-succeeds)** (`.env`, `npm install`, DB, build, Node.js app).

If you see the HTTPS username error, you used `https://github.com/...` — switch to SSH or follow [Private repo + cPanel Git](#private-repo--cpanel-git-https-error).

**Do not** clone into `public_html` or any existing site folder.

---


---

## Post-clone checklist (start here after clone succeeds)

Use this when cPanel Git **Create** finished successfully — e.g. path `/home/faststar/coding/fst`, branch `main`.

**Clone / HTTPS error (already fixed?):** If cPanel showed `could not read Username for 'https://github.com'`, either **make the repo public** (GitHub → Settings → Change visibility) and use `https://github.com/ekddigital/fst.git`, or keep the repo private and use an **SSH deploy key** — see [Private repo + cPanel Git (HTTPS error)](#private-repo--cpanel-git-https-error).

**PostgreSQL on the server:** Use **`127.0.0.1:5432`** in `DATABASE_URL` when running commands **on TMD** (cPanel Terminal or SSH). Do **not** use `195.250.26.111` in server-side `.env` — that IP is for connecting **from your Mac** when Remote PostgreSQL is enabled. See [Database reference](#database-reference).

### 1. Confirm files

In cPanel **Terminal** (or `ssh tmd`):

```bash
cd ~/coding/fst
git rev-parse --short HEAD   # e.g. 09ec427 on main
ls -la package.json prisma/schema.prisma .cpanel.yml
```

### 2. Create `.env`, install, DB, build

Replace `YOUR_PASSWORD` and `your-admin-password` with real values. URL-encode special characters in the DB password (e.g. `#` → `%23`).

```bash
cd ~/coding/fst
cat > .env << 'EOF'
DATABASE_URL=postgresql://faststar_tmdconnect:YOUR_PASSWORD@127.0.0.1:5432/faststar_fst
ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_SITE_URL=https://faststarttalking.com
EOF
chmod 600 .env

node -v    # expect 18+ or 20+
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run build
```

Optional: add `?sslmode=disable` to `DATABASE_URL` if Prisma connection errors mention SSL on localhost.

Equivalent using the template file: `cp .env.example .env` then `nano .env` — same three variables.

| Step | If it fails |
|------|-------------|
| `npm install` | Node too old — use cPanel **Setup Node.js App** or `nvm` if available; need Node 18+ |
| `db:push` / `db:seed` | Wrong password, wrong host (`127.0.0.1` not `195.250.26.111`), or DB/user not created in cPanel |
| `npm run build` | Often P1001 — DB unreachable; fix `DATABASE_URL` and ensure PostgreSQL is running locally |

Verify `.next/` exists after build.

### 3. Setup Node.js App (cPanel)

If not done yet: cPanel → **Setup Node.js App** → **Create Application** — application root `coding/fst`, startup `npm run start`, production URL on a **subdomain** (not `public_html`). Copy the same env vars as `.env`. See [Phase 3 — Setup Node.js App](#phase-3--setup-nodejs-app-cpanel).

### 4. Ongoing deploys

On your Mac: develop → `npx tsc --noEmit && npm run build` → `git push origin main`.

On TMD: cPanel → **Git Version Control** → `fst` → **Update from Remote** → **Deploy HEAD Commit** → **Setup Node.js App** → **Restart**.

Schema changes: SSH in and run `npm run db:push` (deploy does not run push/seed every time).

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

### `could not read Username for 'https://github.com'`

Private repo + HTTPS clone. Full steps: [Private repo + cPanel Git](#private-repo--cpanel-git-https-error). Retry cPanel with Clone URL `git@github.com:ekddigital/fst.git` after deploy key + `~/.ssh/config`.

### `Permission denied (publickey)` when cloning via SSH

- Confirm deploy key is added under GitHub **Deploy keys** (not only cPanel **Authorized Keys** for shell login — both can coexist)
- `chmod 600 ~/.ssh/github_fst_deploy ~/.ssh/config`
- Test: `ssh -T git@github.com` and `git ls-remote git@github.com:ekddigital/fst.git HEAD`

### Private GitHub repo (summary)

See [Option A — SSH deploy key](#option-a--ssh-deploy-key-recommended) and [templates/github_fst_deploy_ssh_config.example](./templates/github_fst_deploy_ssh_config.example).

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
