#!/usr/bin/env bash
# Manual FST deploy on TMD (cPanel Terminal or SSH).
# Uses env -i for db:seed/build so cPanel Node env pollution cannot break Prisma.
set -euo pipefail

DEPLOYPATH="${DEPLOYPATH:-/home/faststar/coding/fst}"
NODEVENV_ACTIVATE="${NODEVENV_ACTIVATE:-/home/faststar/nodevenv/coding/fst/22/bin/activate}"
ENV_FILE="${ENV_FILE:-$DEPLOYPATH/.env}"
NODE_BIN="/home/faststar/nodevenv/coding/fst/22/bin"

cd "$DEPLOYPATH"

# Untracked server.js (legacy cPanel copy) blocks `git pull` now that server.js is tracked on main.
if [[ -f server.js ]] && ! git ls-files --error-unmatch server.js >/dev/null 2>&1; then
  echo "Removing untracked server.js so git pull can proceed..."
  rm -f server.js
fi

git pull origin main

# shellcheck source=/dev/null
source "$NODEVENV_ACTIVATE"
export PATH="${NODE_BIN}:$PATH"
export NPM_CONFIG_PRODUCTION=false

npm install
npx prisma generate

load_env_var() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -1 || true)"
  if [[ -z "$line" ]]; then
    echo "Missing ${key} in ${ENV_FILE}" >&2
    return 1
  fi
  local val="${line#*=}"
  val="${val#\"}"
  val="${val%\"}"
  val="${val#\'}"
  val="${val%\'}"
  printf '%s' "$val"
}

DATABASE_URL="$(load_env_var DATABASE_URL)"
ADMIN_PASSWORD="$(load_env_var ADMIN_PASSWORD)"
NEXT_PUBLIC_SITE_URL="$(load_env_var NEXT_PUBLIC_SITE_URL)"

# Defensive: cPanel sometimes stores VALUE as "DATABASE_URL=postgresql://..."
DATABASE_URL="${DATABASE_URL#DATABASE_URL=}"

run_clean() {
  env -i \
    HOME="${HOME:-/home/faststar}" \
    PATH="${NODE_BIN}:/usr/bin:/bin" \
    NODE_ENV=production \
    DATABASE_URL="${DATABASE_URL}" \
    ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
    NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}" \
    "$@"
}

if ! run_clean npm run db:seed; then
  echo "npm run db:seed failed; retrying with npx tsx..."
  run_clean npx tsx prisma/seed.ts
fi

run_clean npm run build

if [[ -f .next/BUILD_ID ]]; then
  echo "BUILD_OK — restart Setup Node.js App in cPanel."
else
  echo "BUILD_FAILED — .next/BUILD_ID missing." >&2
  exit 1
fi
