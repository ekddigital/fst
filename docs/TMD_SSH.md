# TMD Hosting SSH — Fast Start Talking (FST)

SSH, SFTP, and PostgreSQL access for **FST** on TMD shared hosting (`faststar@s3838`, `195.250.26.111`). Keys live in `fst/secrets/` (gitignored) and `~/.ssh/tmdconnect_nopass` (recommended for dev; no `ssh-add` required).

## Access the server from your Mac (SSH / SFTP)

This is **full server access** — shell, files, deploy — **not** the same as **Remote Database Access** in cPanel (PostgreSQL whitelist for local Prisma only; see [Remote PostgreSQL (Mac dev only)](#remote-postgresql-mac-dev-only)).

| Method | How |
|--------|-----|
| **SSH shell** | `ssh tmd` — uses `IdentityFile ~/.ssh/tmdconnect_nopass` (no agent / passphrase) |
| **SFTP** | Same key; host `195.250.26.111`, user `faststar`, port `22` (FileZilla, Cyberduck, etc.) |
| **VS Code Remote SSH** | Optional — same `tmd` host alias in `~/.ssh/config` |

Do **not** confuse server SSH/SFTP with cPanel **Remote PostgreSQL** / **Remote Database Access** — the latter only opens PostgreSQL port access from a whitelisted client IP for local dev.

## Safety on shared hosting (read first)

This cPanel account hosts **many existing sites** under `~/` (e.g. `jinanicf.com`, `public_html`, `teacherjoe.faststarttalking.com`). **FST local dev and Prisma only talk to the PostgreSQL database `faststar_fst`.** They do not modify, delete, or deploy to those directories unless you explicitly deploy FST to a new path/subdomain later.

| Action | Touches existing sites? |
|--------|-------------------------|
| `prisma db push` / `db:seed` on `faststar_fst` | **No** — database only |
| SSH tunnel (`tmd-psql`) | **No** — forwards port 5432 only |
| cPanel Remote PostgreSQL (whitelist IP) | **No** — firewall rule for PG only |
| Future FST deploy to new subdomain/folder | **Only if you choose to** |

Never commit `.env`, `secrets/`, or private keys.

## Connectivity snapshot (dev machine, Aug 2026)

| Test | Result |
|------|--------|
| Mac public IP (`curl ifconfig.me` on **your Mac**) | Add **this** IP in cPanel **Remote PostgreSQL** — e.g. `31.97.41.230` (yours will differ) |
| cPanel Remote DB hosts already listed | `195.250.26.108`, `195.250.26.83` — **server IPs, not your Mac** — do not add these for local dev |
| `nc` → `195.250.26.111:5432` | **No response / unreachable** until your Mac IP is whitelisted (Remote PG) or you use an SSH tunnel |
| `ssh tmd` (BatchMode) | **`Permission denied (publickey)`** until **`tmdconnect_nopass`** is imported and **Authorized** in cPanel; then should print `connected` / `ok` without `ssh-add` |
| SSH tunnel → `127.0.0.1:5433` | **Not up** until SSH works |
| `npm run db:push` (direct `.env` URL) | **P1001** — can't reach `195.250.26.111:5432` without Remote PG or tunnel |
| `npx tsc --noEmit` | **Pass** |
| `npm run build` | **Fails at page data** — build hits DB while unreachable |

**On the server** (cPanel Terminal, SSH, Node env vars, server `.env`): always `127.0.0.1:5432` — see [TMD_DEPLOY.md](./TMD_DEPLOY.md).

## Recommended path for local Prisma dev

**Option A — SSH tunnel (recommended on shared hosting)**  
No cPanel Remote PostgreSQL entry required. Traffic goes over SSH to localhost PostgreSQL on the server.

1. Fix SSH (see [Troubleshooting](#permission-denied-publickey)).
2. Terminal A (keep open):

   ```bash
   ssh -N tmd-psql
   # forwards Mac 127.0.0.1:5433 → server 127.0.0.1:5432
   ```

3. **Dev-only** URL (do not commit — use `.env.local` or temporary edit with comment):

   ```bash
   # DEV ONLY — requires: ssh -N tmd-psql
   DATABASE_URL="postgresql://faststar_tmdconnect:DB_PASSWORD@127.0.0.1:5433/faststar_fst?sslmode=disable"
   ```

4. From `fst/`:

   ```bash
   npm run db:push
   npm run db:seed
   npx tsc --noEmit && npm run build
   ```

Keep a separate **Mac dev** `.env.local` with `@127.0.0.1:5433` (tunnel) or `@195.250.26.111:5432` (Remote PG). **Never** use `195.250.26.111` in server-side `.env` or cPanel Node env vars — use `127.0.0.1:5432` on the server.

**Option B — Remote PostgreSQL (direct IP, Mac dev only)**  
Add your **Mac public IP** in cPanel → **Remote PostgreSQL** / **Manage Access Hosts**:

```bash
curl ifconfig.me   # run on your Mac — whitelist this IP, NOT 195.250.26.111/.108/.83
```

**Note:** On some cPanel hosts, **Remote Database Access** applies to MySQL only; PostgreSQL may not appear in that UI. If Remote PG is unavailable, use Option A (SSH tunnel). When running Prisma **on the server**, always use `127.0.0.1:5432` regardless.

After whitelisting your Mac IP, verify:

```bash
nc -G 3 -zv 195.250.26.111 5432
psql "postgresql://faststar_tmdconnect:PASS@195.250.26.111:5432/faststar_fst?sslmode=disable" -c "SELECT 1"
```

Primary `.env` shape (never commit real password):

```bash
DATABASE_URL="postgresql://faststar_tmdconnect:DB_PASSWORD@195.250.26.111:5432/faststar_fst?sslmode=disable"
```

URL-encode password special characters (`#` → `%23`, etc.).

**Option C — Server-side only (production deploy)**  
SSH in, use an isolated app directory (not `public_html` unless intended), run `npm run db:push` there with server-local `DATABASE_URL` at **`127.0.0.1:5432`** on the host. Full cPanel Git + Node.js steps: **[TMD_DEPLOY.md](./TMD_DEPLOY.md)**.

## Remote PostgreSQL (Mac dev only)

| Purpose | Whitelist IP | Connection host in `DATABASE_URL` |
|---------|--------------|-----------------------------------|
| Local Prisma from Mac | Your Mac (`curl ifconfig.me`) | `195.250.26.111:5432` |
| App / Terminal **on server** | *(none needed)* | `127.0.0.1:5432` |

**Not** the same as SSH/SFTP server access — see [Access the server from your Mac](#access-the-server-from-your-mac-ssh--sftp).

## FST (TMD) vs FOM (VPS)

| | **FOM** | **FST** |
|---|---------|---------|
| Host | `31.97.41.230` | `195.250.26.111` |
| Engine | MySQL `:9909` | PostgreSQL `:5432` |
| Remote access | Open on VPS | cPanel whitelist or SSH tunnel |

## Names on TMD (do not confuse)

| Artifact | Meaning |
|----------|---------|
| **`tmdconnect_nopass`** | **Recommended** SSH key pair (`~/.ssh/tmdconnect_nopass`) — authorized in cPanel under this name |
| **`tmdconnect`** | Legacy passphrase key (`~/.ssh/tmdconnect`); superseded by **`tmdconnect_nopass`** for Mac dev |
| **`faststar`** | cPanel / SSH user; prefixes `faststar_fst`, `faststar_tmdconnect` |
| **`faststar_tmdconnect`** | PostgreSQL DB user only — **not** an SSH login; SSH user stays **`faststar`** |
| **`nikolatrTMD`** | Second authorized key in cPanel; no matching private key in this repo — use **`tmdconnect_nopass`** from Mac |

## Server

| Setting | Value |
|--------|--------|
| HostName | `195.250.26.111` |
| SSH user | `faststar` |
| SSH port | `22` |
| PostgreSQL DB | `faststar_fst` |
| PostgreSQL user | `faststar_tmdconnect` |

Passwords: cPanel → **PostgreSQL Databases** only.

## SSH setup (Mac)

### Recommended: passphrase-free key (`tmdconnect_nopass`)

Use a dedicated key **without** a passphrase so `ssh tmd`, SFTP, and `BatchMode` work without `ssh-add` or Keychain prompts.

1. **Create the key pair** (skip if you already have `~/.ssh/tmdconnect_nopass`):

   ```bash
   ssh-keygen -t rsa -b 2048 -f ~/.ssh/tmdconnect_nopass -C "faststar-mac" -N ""
   chmod 600 ~/.ssh/tmdconnect_nopass
   ```

   Confirm fingerprint:

   ```bash
   ssh-keygen -lf ~/.ssh/tmdconnect_nopass.pub
   # expect SHA256:asjr8XWzMNf/04/9BH6YiniK57rrxfq0Yn2AMf7ht7Q
   ```

2. **cPanel → SSH Access → Manage SSH Keys → Import Key**
   - **Name:** `tmdconnect_nopass`
   - Paste **only** the single `ssh-rsa …` line from `~/.ssh/tmdconnect_nopass.pub` (or `cat ~/.ssh/tmdconnect_nopass.pub`).
   - Click **Import**, then **Manage** → **Authorize** for `tmdconnect_nopass`.
   - Do **not** re-authorize the old **`tmdconnect`** key unless you still need the passphrase key elsewhere.

3. **`~/.ssh/config`** — `Host tmd`, `tmd-mysql`, and `tmd-psql` must use:

   ```
   IdentityFile ~/.ssh/tmdconnect_nopass
   IdentitiesOnly yes
   ```

4. **Connect** (no `ssh-add`):

   ```bash
   ssh tmd
   ssh -o BatchMode=yes -o ConnectTimeout=15 tmd echo connected
   ```

   Aliases:
   - **`tmd`** — shell
   - **`tmd-psql`** — `LocalForward 5433 127.0.0.1:5432`

### Legacy: passphrase key (`tmdconnect`)

Team copy under `fst/secrets/tmdconnect` (gitignored). Requires `ssh-add --apple-use-keychain ~/.ssh/tmdconnect` before non-interactive SSH. Prefer **`tmdconnect_nopass`** for day-to-day Mac dev.

## Verify PostgreSQL on server (after SSH works)

Read-only checks; safe for shared hosting:

```bash
ssh tmd "which psql; psql --version"
ssh tmd "psql -U faststar_tmdconnect -d faststar_fst -c 'SELECT 1 AS ok'"
# List DBs only if your host allows — avoid touching other users' data
ssh tmd "psql -U faststar_tmdconnect -d faststar_fst -c '\conninfo'"
```

## `.env` (local, not in git)

Redacted shape:

```bash
DATABASE_URL="postgresql://faststar_tmdconnect:***@195.250.26.111:5432/faststar_fst?sslmode=disable"
```

Use `@127.0.0.1:5433` only while tunnel is running (dev).

## Troubleshooting

### `Permission denied (publickey)`

**SSH username:** always **`faststar`**. cPanel does not let you SSH as `faststar_tmdconnect` — that name is only the PostgreSQL user in `DATABASE_URL`.

**Two different failures** (use verbose logs):

```bash
ssh -vvv -o BatchMode=yes tmd echo ok 2>&1 | tail -40
```

| Log pattern | Meaning | Fix |
|-------------|---------|-----|
| Offering key … then **no** `Server accepts key` | Pubkey not authorized on server | Import **`tmdconnect_nopass.pub`** in cPanel (name **`tmdconnect_nopass`**) → **Authorize** (see fingerprint below). |
| `Server accepts key` then `Passphrase not found in the keychain` / `agent contains no identities` | Server trusts the pubkey; Mac cannot **sign** with the private key | You are still using the **passphrase** key **`tmdconnect`** instead of **`tmdconnect_nopass`**, or the agent has no loaded key. Fix: set `IdentityFile ~/.ssh/tmdconnect_nopass` in `~/.ssh/config`, authorize **`tmdconnect_nopass`** in cPanel, and use `ssh tmd` without `ssh-add`. (Legacy: load `tmdconnect` with `ssh-add --apple-use-keychain ~/.ssh/tmdconnect`.) |
| Wrong key offered | `IdentityFile` mismatch | `~/.ssh/config` **`Host tmd`** (and `tmd-mysql`, `tmd-psql`) must use `User faststar` and `IdentityFile ~/.ssh/tmdconnect_nopass`. |

1. Confirm pubkey fingerprint matches authorized **`tmdconnect_nopass`** key in cPanel (not **`tmdconnect`** or **`nikolatrTMD`** unless intentional):

   ```bash
   ssh-keygen -lf ~/.ssh/tmdconnect_nopass.pub
   # expect SHA256:asjr8XWzMNf/04/9BH6YiniK57rrxfq0Yn2AMf7ht7Q
   ```

2. If cPanel still has only the old **`tmdconnect`** pubkey, import and authorize **`tmdconnect_nopass.pub`** as described in [SSH setup](#ssh-setup-mac).
3. **`nikolatrTMD`:** only helps if you have that key’s **private** half locally; default Mac key is **`tmdconnect_nopass`**.
4. **`HostName`** must be `195.250.26.111`, not `127.0.0.1`.
5. **Until SSH works:** use cPanel **Terminal** (same `faststar` shell) for server commands; use SSH tunnel / Remote PG steps above for DB from Mac.

**If you must rotate keys:** generate a new pair (e.g. `ssh-keygen -t rsa -b 2048 -f ~/.ssh/tmdconnect_nopass -N ""`), import and authorize the new `.pub` in cPanel as **`tmdconnect_nopass`**, update `IdentityFile` in `~/.ssh/config`. Never commit private keys.

### Can't reach `195.250.26.111:5432`

1. Whitelist **your Mac IP** (`curl ifconfig.me`) in Remote PostgreSQL — **not** server IPs `.111`, `.108`, or `.83`.
2. Or use `ssh -N tmd-psql` + `@127.0.0.1:5433` in `.env.local` (no Remote PG needed).
3. Confirm user/db names and URL-encoded password.
4. If Remote PG UI is MySQL-only on your plan, use the SSH tunnel (Option A).

### `npm run build` fails with P1001

Next.js collects page data against the DB. Fix connectivity (tunnel or remote PG) before build, or adjust app to skip DB at build time (separate change).

## Security — rotate exposed credentials

If database passwords, `ADMIN_PASSWORD`, or SSH-related secrets appeared in screenshots or shared logs, rotate them in cPanel (**PostgreSQL Databases**, server `~/coding/fst/.env`) and choose a new admin password. See [TMD_DEPLOY.md](./TMD_DEPLOY.md) → **Managing environment variables**. Do not paste real passwords into docs or tickets.
