# TMD Hosting SSH — Fast Start Talking

SSH and database access for [faststarttalking.com](https://faststarttalking.com) on **TMD Hosting**. Keys stay in `fst/secrets/` (gitignored) and `~/.ssh/tmdconnect`.

## Server

| Setting | Value |
|--------|--------|
| Site | faststarttalking.com |
| HostName (IP) | `195.250.26.111` |
| SSH user | `faststar` (confirm in TMD **SSH Access**) |
| SSH port | `22` |

`fst/secrets/.secret` currently only stores `ssh-keygen` output from the server; it does **not** list IP or MySQL passwords. Use cPanel for DB credentials.

## SSH setup (Mac)

Private key: copy `fst/secrets/tmdconnect` → `~/.ssh/tmdconnect` (`chmod 600`).

In TMD panel: **SSH Access → Manage SSH Keys** — import `tmdconnect.pub`, then **Authorize**.

`~/.ssh/config` aliases:

- **`tmd`** / **`fst-tmd`** — shell only
- **`tmd-tunnel`** — includes `LocalForward 3307 → localhost:3306` and `5433 → localhost:5432`

```bash
ssh tmd
ssh -o BatchMode=yes -o ConnectTimeout=10 tmd echo ok   # expect: ok
```

## MySQL (Prisma `DATABASE_URL`)

On typical TMD shared hosting, MySQL listens on **127.0.0.1:3306 on the server**, not on the public IP. Use an SSH tunnel from your Mac.

**Terminal A — keep open:**

```bash
ssh -L 3307:127.0.0.1:3306 tmd
# or: ssh tmd-tunnel
```

**Terminal B — app / Prisma** — in `fst/.env` (gitignored):

```bash
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@127.0.0.1:3307/fst?ssl=false&connect_timeout=60&pool_timeout=60&timeout=60"
```

Replace `DB_USER`, `DB_PASSWORD`, and database name from **cPanel → MySQL Databases**. URL-encode special characters in the password (e.g. `!` → `%21`).

If remote MySQL is enabled for your IP in cPanel, you may use `@195.250.26.111:3306` instead of the tunnel (see commented lines in `.env.example`).

## PostgreSQL (future)

```bash
ssh -L 5433:127.0.0.1:5432 tmd
# or use ssh tmd-tunnel
# Connect clients to 127.0.0.1:5433
```

## Security

- Never commit `secrets/`, private keys, or `.env` with real credentials.
- `secrets/` and `.env` are in `fst/.gitignore`.
