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

## Database (MySQL)

FST uses **MySQL** via Prisma. Connection string format:

```
mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/fst
```

Set as `DATABASE_URL` in `.env.local` (local) and Launchpad env (production). **Never commit real passwords or connection strings.**

### Find or create the database on outline-vpn

SSH in, then inspect common locations:

```bash
ssh outline-vpn

# Check if MySQL/MariaDB is running
systemctl status mysql mariadb 2>/dev/null
docker ps | grep -i mysql

# Look for existing app env files (placeholders only — do not copy into git)
find /var/www -maxdepth 4 -name ".env*" -type f 2>/dev/null
grep -r DATABASE_URL /var/www --include=".env*" 2>/dev/null | head

# If MySQL CLI is available
mysql -e "SHOW DATABASES;"
```

### Create a new database (if needed)

```bash
mysql -u root -p
```

```sql
CREATE DATABASE fst CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fst_app'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON fst.* TO 'fst_app'@'localhost';
FLUSH PRIVILEGES;
```

For remote access (Launchpad host → VPS MySQL), you may need `'fst_app'@'%'` and firewall rules — restrict to Launchpad egress IP when possible.

### Local `.env.local`

```bash
cp .env.example .env.local
# Edit DATABASE_URL with values from the server (never commit this file)
```

### Sync schema

After `DATABASE_URL` is set:

```bash
npm run db:generate && npm run db:push
```

Without `DATABASE_URL`, the site builds and runs but contact/assessment forms return a friendly unavailable message.

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
- [ ] **Videos (optional)** — video embeds currently point to faststarttalking.com CDN; download to `site-data/assets/videos/` and update `src/lib/brand.ts` `VIDEOS` if self-hosting

---

## Launchpad (Deploy)

- [ ] **Create Launchpad project** — [lpad.ekddigital.com](https://lpad.ekddigital.com) → New Project — (one-time)
- [ ] **Upload env vars** — `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` (production URL)
- [ ] **Custom domain + DNS** — point domain to Launchpad; set `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] **Database reachable from Launchpad** — ensure MySQL on outline-vpn accepts connections from Launchpad host
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
