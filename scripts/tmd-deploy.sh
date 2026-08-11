#!/usr/bin/env bash
# FST deploy on TMD (cPanel Terminal, SSH, or .cpanel.yml "Deploy HEAD Commit").
# Uses env -i for db:seed/build so cPanel Node env pollution cannot break Prisma.
#
# Environment:
#   TMD_SKIP_GIT_PULL=1  — skip git pull (set by .cpanel.yml; cPanel already checked out HEAD)
#   TMD_SKIP_SEED=1      — skip npm run db:seed (recommended for routine deploys)
#   DEPLOYPATH           — app root (default: /home/faststar/coding/fst)
#   ENV_FILE             — path to .env (default: $DEPLOYPATH/.env)
set -euo pipefail

DEPLOYPATH="${DEPLOYPATH:-/home/faststar/coding/fst}"
ENV_FILE="${ENV_FILE:-$DEPLOYPATH/.env}"
NODE_BIN="/home/faststar/nodevenv/coding/fst/22/bin"
NODE_MODULES="/home/faststar/nodevenv/coding/fst/22/lib/node_modules"
TMD_SKIP_GIT_PULL="${TMD_SKIP_GIT_PULL:-0}"
TMD_SKIP_SEED="${TMD_SKIP_SEED:-0}"

cd "$DEPLOYPATH"

if [[ "$TMD_SKIP_GIT_PULL" != "1" ]]; then
  # Untracked server.js (legacy cPanel copy) blocks `git pull` now that server.js is tracked on main.
  if [[ -f server.js ]] && ! git ls-files --error-unmatch server.js >/dev/null 2>&1; then
    echo "Removing untracked server.js so git pull can proceed..."
    rm -f server.js
  fi

  git pull origin main
fi

export PATH="${NODE_BIN}:$PATH"
export NODE_PATH="${NODE_MODULES}"
export NPM_CONFIG_PRODUCTION=false

# Skip postinstall (prisma generate) during install — avoids duplicate/hung generate on LVE hosts.
if [[ -f package-lock.json ]]; then
  npm ci --ignore-scripts --no-audit --progress=false
else
  npm install --ignore-scripts --no-audit --progress=false
fi

npm run db:generate

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
NEXT_IMAGE_UNOPTIMIZED="$(grep -E "^NEXT_IMAGE_UNOPTIMIZED=" "$ENV_FILE" | tail -1 | cut -d= -f2- || echo true)"


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
    NEXT_IMAGE_UNOPTIMIZED="${NEXT_IMAGE_UNOPTIMIZED}" \
    NEXT_BUILD_CPUS=1 \
    "$@"
}


if [[ "$TMD_SKIP_SEED" != "1" ]]; then
  if ! run_clean npm run db:seed; then
    echo "npm run db:seed failed; retrying with node_modules/.bin/tsx..."
    run_clean ./node_modules/.bin/tsx prisma/seed.ts
  fi
else
  echo "Skipping db:seed (TMD_SKIP_SEED=1)."
fi

run_clean npm run build

if [[ -f .next/BUILD_ID ]]; then
  echo "BUILD_OK — restart Setup Node.js App in cPanel."
else
  echo "BUILD_FAILED — .next/BUILD_ID missing." >&2
  exit 1
fi
