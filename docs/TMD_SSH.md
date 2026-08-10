# TMD Hosting SSH — Fast Start Talking

SSH and database access for [faststarttalking.com](https://faststarttalking.com) on **TMD Hosting**. Keys stay in `fst/secrets/` (gitignored) and `~/.ssh/tmdconnect`.

## FST (TMD) vs FOM (VPS) — same direct-IP pattern

Both projects use the **server IP in `DATABASE_URL`** — no localhost in `.env`.

| | **FOM** (`fom/.env`) | **FST** (`fst/.env`) |
|---|---------------------|----------------------|
| **Host** | `31.97.41.230` (EKD VPS) | `195.250.26.111` (TMD shared hosting) |
| **Database** | MySQL `:9909` | PostgreSQL `:5432` |
| **Pattern** | Direct IP — no SSH tunnel | Direct IP — no SSH tunnel |
| **Prisma URL shape** | `mysql://USER:PASS@31.97.41.230:9909/fom?...` | `postgresql://faststar_tmdconnect:PASS@195.250.26.111:5432/faststar_fst?sslmode=disable` |
| **SSH role** | Ops only — **not** used for DB | Ops only — **not** used for DB (tunnel is fallback) |

**Primary `DATABASE_URL` (`.env`):**

```bash
DATABASE_URL="postgresql://faststar_tmdconnect:DB_PASSWORD@195.250.26.111:5432/faststar_fst?sslmode=disable"
```

**Password encoding:** URL-encode special characters (e.g. `#` → `%23`, `!` → `%21`, `@` → `%40`).

## Remote PostgreSQL required on TMD

TMD shared hosting binds PostgreSQL to localhost on the server. Port **5432 is not open** on `195.250.26.111` until you enable remote access in cPanel.

**Tested from dev machine (Aug 2026):**

- `31.97.41.230:9909` (FOM) — MySQL responds.
- `195.250.26.111:5432` (FST) — connection timeout until cPanel **Remote PostgreSQL** whitelists your IP.

**Enable remote access:**

1. cPanel → **Remote PostgreSQL** (or **Manage Access Hosts**)
2. Add your public IP (and Launchpad egress IP for production)
3. Verify:

```bash
nc -zv 195.250.26.111 5432
psql "postgresql://faststar_tmdconnect:DB_PASSWORD@195.250.26.111:5432/faststar_fst?sslmode=disable" -c "SELECT 1"
```

4. Set real password in `fst/.env` (never commit)

**Keep `@195.250.26.111:5432` in `.env` even while waiting for cPanel** — same as FOM uses `@31.97.41.230`. Do not switch to `127.0.0.1` unless you deliberately use the tunnel fallback below.

## Names on TMD (do not confuse)

|cPanel / SSH artifact|What it is|Example / where to find|
|----------------------|----------|-------------------------|
|**`tmdconnect`**|SSH **key pair** name (public + private)|cPanel → SSH Access → Manage SSH Keys; local file `~/.ssh/tmdconnect`|
|**`faststar`**|SSH **shell login** user and **cPanel account prefix**|Prefixes DB names/users: `faststar_fst`, `faststar_tmdconnect`|
|**PostgreSQL user**|Database user for Prisma / `DATABASE_URL`|**cPanel → PostgreSQL Databases** — e.g. `faststar_tmdconnect`|

The `faststar_` prefix on database and user names is **normal cPanel behavior** — not an error.

Using `faststar_tmdconnect` as the PostgreSQL username is fine. It shares a name with the SSH key (`tmdconnect`) by coincidence; they are separate credentials in cPanel.

## Server

| Setting | Value |
|--------|--------|
| Site | faststarttalking.com |
| HostName (IP) | `195.250.26.111` |
| SSH user | `faststar` (confirm in TMD **SSH Access**) |
| SSH port | `22` |
| PostgreSQL database | `faststar_fst` |
| PostgreSQL user | `faststar_tmdconnect` |

Use cPanel → **PostgreSQL Databases** for passwords (not stored in git).

## SSH setup (Mac)

Private key: copy `fst/secrets/tmdconnect` → `~/.ssh/tmdconnect` (`chmod 600`).

In TMD panel: **SSH Access → Manage SSH Keys** — import `tmdconnect.pub`, then **Authorize**.

`~/.ssh/config` aliases:

- **`tmd`** — interactive shell
- **`tmd-psql`** — PostgreSQL tunnel fallback (`LocalForward 5433 → 127.0.0.1:5432`)

```bash
ssh tmd
ssh -o BatchMode=yes -o ConnectTimeout=15 tmd echo connected   # expect: connected
```

## PostgreSQL tunnel fallback (optional)

Use only if **Remote PostgreSQL** is not enabled and you need local dev before cPanel is configured. This is **not** the primary config — `.env` should still use `@195.250.26.111:5432` when possible.

**Terminal A — keep open:**

```bash
ssh -N tmd-psql
# or: ssh -L 5433:127.0.0.1:5432 tmd
```

**Temporary local override** (do not commit):

```bash
DATABASE_URL="postgresql://faststar_tmdconnect:DB_PASSWORD@127.0.0.1:5433/faststar_fst?sslmode=disable"
```

The `127.0.0.1:5433` address exists only on your Mac while the tunnel runs. The tunnel forwards to `127.0.0.1:5432` **on the remote server** — not the same as putting localhost in production `.env`.

## Security

- Never commit `secrets/`, private keys, or `.env` with real credentials.
- `secrets/` and `.env` are in `fst/.gitignore`.

## Troubleshooting

### `Permission denied (publickey)`

1. cPanel → **SSH Access** → **Manage SSH Keys**
2. **Import** `fst/secrets/tmdconnect.pub` → **Authorize**
3. Retry: `ssh -o BatchMode=yes -o ConnectTimeout=15 tmd echo ok`

Confirm **HostName** in `~/.ssh/config` is `195.250.26.111`, not `127.0.0.1`.

### Can't reach database at `195.250.26.111:5432`

1. Test port: `nc -zv -w 5 195.250.26.111 5432`
2. If timeout → enable cPanel **Remote PostgreSQL** for your IP
3. Confirm user/database: `faststar_tmdconnect`, `faststar_fst`
4. URL-encode password special characters in `DATABASE_URL`
5. Tunnel fallback: `ssh -N tmd-psql` + temporary `@127.0.0.1:5433` URL (local only)
