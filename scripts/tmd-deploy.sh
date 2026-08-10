#!/usr/bin/env bash
# Manual FST deploy on TMD (cPanel Terminal or SSH). Safe when Git deploy or SSH is flaky.
set -euo pipefail

DEPLOYPATH="${DEPLOYPATH:-/home/faststar/coding/fst}"
NODEVENV_ACTIVATE="${NODEVENV_ACTIVATE:-/home/faststar/nodevenv/coding/fst/22/bin/activate}"

cd "$DEPLOYPATH"

# Untracked server.js (legacy cPanel copy) blocks `git pull` now that server.js is tracked on main.
if [[ -f server.js ]] && ! git ls-files --error-unmatch server.js >/dev/null 2>&1; then
  echo "Removing untracked server.js so git pull can proceed..."
  rm -f server.js
fi

git pull origin main

# shellcheck source=/dev/null
source "$NODEVENV_ACTIVATE"
export PATH="/home/faststar/nodevenv/coding/fst/22/bin:$PATH"
export NPM_CONFIG_PRODUCTION=false

npm install
npx prisma generate

if ! npm run db:seed; then
  echo "npm run db:seed failed; retrying with npx tsx..."
  npx tsx prisma/seed.ts
fi

npm run build

test -f .next/BUILD_ID && echo "BUILD_OK — restart Setup Node.js App in cPanel."
