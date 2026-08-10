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

`~/.ssh/config` aliases (in `~/.ssh/config` on your Mac):

- **`tmd`** — interactive shell
- **`tmd-mysql`** — MySQL tunnel only (`LocalForward 3307 → 127.0.0.1:3306`)
- **`tmd-psql`** — PostgreSQL tunnel only (`LocalForward 5433 → 127.0.0.1:5432`)

```bash
ssh tmd
ssh -o BatchMode=yes -o ConnectTimeout=15 tmd echo connected   # expect: connected

# DB tunnels (keep running in a terminal)
ssh -N tmd-mysql
ssh -N tmd-psql
```


## Why you see 127.0.0.1 (and where 195.250.26.111 belongs)

Three different places use different addresses — only one of them should be the public server IP.

| What | Address | Meaning |
|------|---------|--------|
| **`ssh tmd`** | `HostName 195.250.26.111` in `~/.ssh/config` | Your Mac connects to TMD over the internet. This must **not** be `127.0.0.1`. |
| **`DATABASE_URL` in `.env`** | `127.0.0.1:3307` on your Mac | **Correct** when `ssh -N tmd-mysql` is running. Port 3307 is the tunnel’s local end; traffic is forwarded to the server. |
| **`LocalForward 3307 127.0.0.1:3306`** | `127.0.0.1` on the **remote** server | MySQL on shared hosting usually binds to localhost on the box, not to the public IP. SSH connects to `195.250.26.111`, then asks **that** machine’s `127.0.0.1:3306` for MySQL. |

**Summary:** Seeing `127.0.0.1` in `.env` or in `LocalForward` is expected. Seeing `127.0.0.1` as **`HostName`** for `Host tmd` would be wrong — fix it to `195.250.26.111`.

**Without a tunnel:** If cPanel **Remote MySQL** allows your IP, you can point Prisma at the server directly:

```bash
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@195.250.26.111:3306/fst?ssl=false&connect_timeout=60&pool_timeout=60&timeout=60"
```

Otherwise keep the tunnel and `@127.0.0.1:3307`.

## MySQL (Prisma `DATABASE_URL`)

On typical TMD shared hosting, MySQL listens on **127.0.0.1:3306 on the server**, not on the public IP. Use an SSH tunnel from your Mac.

**Terminal A — keep open:**

```bash
ssh -N tmd-mysql
# or: ssh -L 3307:127.0.0.1:3306 tmd
```

**Terminal B — app / Prisma** — in `fst/.env` (gitignored):

```bash
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@127.0.0.1:3307/fst?ssl=false&connect_timeout=60&pool_timeout=60&timeout=60"
```

Replace `DB_USER`, `DB_PASSWORD`, and database name from **cPanel → MySQL Databases**. URL-encode special characters in the password (e.g. `!` → `%21`).

If remote MySQL is enabled for your IP in cPanel, you may use `@195.250.26.111:3306` instead of the tunnel (see commented lines in `.env.example`).

## PostgreSQL (future)

```bash
ssh -N tmd-psql
# Connect clients to 127.0.0.1:5433
```

## Security

- Never commit `secrets/`, private keys, or `.env` with real credentials.
- `secrets/` and `.env` are in `fst/.gitignore`.

## Troubleshooting

### `Permission denied (publickey)`

The client reaches `195.250.26.111` and offers `~/.ssh/tmdconnect`, but the server rejects the key until it is **authorized** in TMD:

1. cPanel → **SSH Access** → **Manage SSH Keys**
2. **Import** the public key from `fst/secrets/tmdconnect.pub` (or paste its single line)
3. Click **Manage** → **Authorize** for that key
4. Retry: `ssh -o BatchMode=yes -o ConnectTimeout=15 tmd echo ok`

Confirm **HostName** in `~/.ssh/config` is the site A record (`dig +short faststarttalking.com`), not `127.0.0.1` or `localhost`. `LocalForward` targets `127.0.0.1:3306` on the **remote** host only.
