# TMD Hosting SSH — Fast Start Talking (FST)

SSH, SFTP, and PostgreSQL access for **FST** on TMD shared hosting (`faststar@s3838`, `195.250.26.111`). Keys live in `fst/secrets/` (gitignored) and `~/.ssh/tmdconnect`.

## Access the server from your Mac (SSH / SFTP)

This is **full server access** — shell, files, deploy — **not** the same as **Remote Database Access** in cPanel (PostgreSQL whitelist for local Prisma only; see [Remote PostgreSQL (Mac dev only)](#remote-postgresql-mac-dev-only)).

| Method | How |
|--------|-----|
| **SSH shell** | Load key: `ssh-add --apple-use-keychain ~/.ssh/tmdconnect` → connect: `ssh tmd` |
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
| `ssh tmd` (BatchMode) | **`Permission denied (publickey)`** — fix key authorize + agent (below) |
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
| **`tmdconnect`** | SSH **key pair** name (`~/.ssh/tmdconnect`) |
| **`faststar`** | cPanel / SSH user; prefixes `faststar_fst`, `faststar_tmdconnect` |
| **`faststar_tmdconnect`** | PostgreSQL user (separate from SSH key password) |

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

1. Copy `fst/secrets/tmdconnect` → `~/.ssh/tmdconnect` (`chmod 600`).
2. cPanel → **SSH Access → Manage SSH Keys** — import `tmdconnect.pub`, **Authorize**.
3. Load key for non-interactive use (passphrase keys):

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/tmdconnect
   ```

4. `~/.ssh/config` aliases:
   - **`tmd`** — shell
   - **`tmd-psql`** — `LocalForward 5433 127.0.0.1:5432`

```bash
ssh -o BatchMode=yes -o ConnectTimeout=15 tmd echo connected
```

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

1. Confirm pubkey fingerprint matches authorized key in cPanel:

   ```bash
   ssh-keygen -lf ~/.ssh/tmdconnect.pub
   # expect SHA256:3jaDUmNedUlYusquw5whLwxNvecKKUFIndDYdoB4u3w
   ```

2. Re-import `fst/secrets/tmdconnect.pub` → **Authorize**.
3. `ssh-add --apple-use-keychain ~/.ssh/tmdconnect` (BatchMode needs agent or empty passphrase).
4. `HostName` must be `195.250.26.111`, not `127.0.0.1`.

### Can't reach `195.250.26.111:5432`

1. Whitelist **your Mac IP** (`curl ifconfig.me`) in Remote PostgreSQL — **not** server IPs `.111`, `.108`, or `.83`.
2. Or use `ssh -N tmd-psql` + `@127.0.0.1:5433` in `.env.local` (no Remote PG needed).
3. Confirm user/db names and URL-encoded password.
4. If Remote PG UI is MySQL-only on your plan, use the SSH tunnel (Option A).

### `npm run build` fails with P1001

Next.js collects page data against the DB. Fix connectivity (tunnel or remote PG) before build, or adjust app to skip DB at build time (separate change).

## Security — rotate exposed credentials

If database passwords, `ADMIN_PASSWORD`, or SSH-related secrets appeared in screenshots or shared logs, rotate them in cPanel (**PostgreSQL Databases**, server `.env`, cPanel Node env vars) and choose a new admin password. Update [TMD_DEPLOY.md](./TMD_DEPLOY.md) checklist env vars after rotation. Do not paste real passwords into docs or tickets.
