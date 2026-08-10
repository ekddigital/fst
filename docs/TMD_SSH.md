# TMD Hosting SSH — Fast Start Talking (FST)

SSH and PostgreSQL access for **FST** on TMD shared hosting (`faststar@s3838`, `195.250.26.111`). Keys live in `fst/secrets/` (gitignored) and `~/.ssh/tmdconnect`.

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
| Mac public IP (`curl ifconfig.me`) | **`31.97.41.230`** — add this in cPanel **Remote PostgreSQL** if you want direct `:5432` from your Mac |
| cPanel Remote DB hosts already listed | `195.250.26.108`, `195.250.26.83` (not your Mac) |
| `nc` → `195.250.26.111:5432` | **No response / unreachable** (PG not exposed to your IP) |
| `ssh tmd` (BatchMode) | **`Permission denied (publickey)`** — fix key authorize + agent (below) |
| SSH tunnel → `127.0.0.1:5433` | **Not up** until SSH works |
| `npm run db:push` (direct `.env` URL) | **P1001** — can't reach `195.250.26.111:5432` |
| `npx tsc --noEmit` | **Pass** |
| `npm run build` | **Fails at page data** — build hits DB at `195.250.26.111:5432` while unreachable |

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

Keep production-style `.env` as `@195.250.26.111:5432` when remote access is enabled, or set server-side env on deploy.

**Option B — Remote PostgreSQL (direct IP, like FOM pattern)**  
Add **`31.97.41.230`** in cPanel → **Remote PostgreSQL** / **Manage Access Hosts**, then verify:

```bash
nc -G 3 -zv 195.250.26.111 5432
psql "postgresql://faststar_tmdconnect:PASS@195.250.26.111:5432/faststar_fst?sslmode=disable" -c "SELECT 1"
```

Primary `.env` shape (never commit real password):

```bash
DATABASE_URL="postgresql://faststar_tmdconnect:DB_PASSWORD@195.250.26.111:5432/faststar_fst?sslmode=disable"
```

URL-encode password special characters (`#` → `%23`, etc.).

**Option C — Server-side only (future deploy)**  
SSH in, use an isolated app directory (not `public_html` unless intended), run `npm run db:push` there with server-local `DATABASE_URL` (often `127.0.0.1:5432` on the host). Good for CI/deploy; not required for day-one Mac dev once A or B works.

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

1. Whitelist **`31.97.41.230`** in Remote PostgreSQL, **or** use `ssh -N tmd-psql` + `@127.0.0.1:5433`.
2. Confirm user/db names and URL-encoded password.

### `npm run build` fails with P1001

Next.js collects page data against the DB. Fix connectivity (tunnel or remote PG) before build, or adjust app to skip DB at build time (separate change).
