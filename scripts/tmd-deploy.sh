#!/usr/bin/env bash
# FST zero-downtime deploy on TMD (cPanel Terminal, SSH, or .cpanel.yml "Deploy HEAD Commit").
#
# Builds in ~/coding/fst-releases/<timestamp>/ while the live app at ~/coding/fst
# keeps serving the previous .next + node_modules. On BUILD_OK, atomically swaps
# artifacts into the live tree (lpad-style canary → swap, adapted for Passenger).
#
# Environment:
#   TMD_SKIP_GIT_PULL=1  — skip git pull (set by .cpanel.yml; cPanel already checked out HEAD)
#   TMD_SKIP_SEED=1      — skip npm run db:seed (recommended for routine deploys)
#   TMD_SWAP_NODE_MODULES_ONLY=1 — install deps in staging and swap node_modules only (keep live .next)
#   TMD_RELEASES_KEEP=3  — retain this many timestamped release dirs (default 3)
#   DEPLOYPATH           — live app root (default: /home/faststar/coding/fst)
#   RELEASES_DIR         — staging releases (default: /home/faststar/coding/fst-releases)
#   ENV_FILE             — path to .env (default: $DEPLOYPATH/.env)
set -euo pipefail

DEPLOYPATH="${DEPLOYPATH:-/home/faststar/coding/fst}"
RELEASES_DIR="${RELEASES_DIR:-/home/faststar/coding/fst-releases}"
ENV_FILE="${ENV_FILE:-$DEPLOYPATH/.env}"
NODE_BIN="/home/faststar/nodevenv/coding/fst/22/bin"
NODE_MODULES="/home/faststar/nodevenv/coding/fst/22/lib/node_modules"
TMD_SKIP_GIT_PULL="${TMD_SKIP_GIT_PULL:-0}"
TMD_SKIP_SEED="${TMD_SKIP_SEED:-0}"
TMD_SWAP_NODE_MODULES_ONLY="${TMD_SWAP_NODE_MODULES_ONLY:-0}"
TMD_RELEASES_KEEP="${TMD_RELEASES_KEEP:-3}"

LOCK_FILE="${RELEASES_DIR}/.deploy.lock"
RELEASE_ID="$(date +%Y%m%d-%H%M%S)"
STAGING="${RELEASES_DIR}/${RELEASE_ID}"
LOG_FILE="${RELEASES_DIR}/deploy-${RELEASE_ID}.log"

mkdir -p "$RELEASES_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

acquire_lock() {
  if [[ -f "$LOCK_FILE" ]]; then
    local pid
    pid="$(cat "$LOCK_FILE" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      log "Another deploy is running (pid ${pid}). Wait for it to finish."
      exit 9
    fi
    log "Removing stale deploy lock (pid ${pid:-unknown} not running)."
    rm -f "$LOCK_FILE"
  fi
  echo "$$" >"$LOCK_FILE"
}

release_lock() {
  rm -f "$LOCK_FILE"
}

cleanup_failed_staging() {
  if [[ -d "$STAGING" ]]; then
    log "Build failed — removing incomplete staging release ${RELEASE_ID}."
    rm -rf "$STAGING"
  fi
}

trap 'release_lock' EXIT

acquire_lock
log "=== FST zero-downtime deploy ${RELEASE_ID} ==="
log "Live app: ${DEPLOYPATH}"
log "Staging:  ${STAGING}"

cd "$DEPLOYPATH"

if [[ "$TMD_SKIP_GIT_PULL" != "1" ]]; then
  if [[ -f server.js ]] && ! git ls-files --error-unmatch server.js >/dev/null 2>&1; then
    log "Removing untracked server.js so git pull can proceed..."
    rm -f server.js
  fi
  git pull origin main
fi

export PATH="${NODE_BIN}:$PATH"
export NODE_PATH="${NODE_MODULES}"
export NPM_CONFIG_PRODUCTION=false

if [[ ! -f "$ENV_FILE" ]]; then
  log "Missing ${ENV_FILE} — create it before deploying." >&2
  exit 1
fi

mkdir -p "$STAGING"

sync_source_to_staging() {
  log "Syncing source to staging (live .next/node_modules untouched)..."
  if command -v rsync >/dev/null 2>&1; then
    rsync -a \
      --exclude 'node_modules/' \
      --exclude '.next/' \
      --exclude '.env' \
      --exclude 'fst-releases/' \
      --exclude '.git/' \
      "$DEPLOYPATH/" "$STAGING/"
  else
    tar -C "$DEPLOYPATH" \
      --exclude='node_modules' \
      --exclude='.next' \
      --exclude='.env' \
      --exclude='fst-releases' \
      --exclude='.git' \
      -cf - . | tar -C "$STAGING" -xf -
  fi
  cp -a "$ENV_FILE" "$STAGING/.env"
}

install_staging_deps() {
  cd "$STAGING"
  export NPM_CONFIG_JOBS="${NPM_CONFIG_JOBS:-1}"
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}"

  rm -rf node_modules

  local live_modules="${DEPLOYPATH}/node_modules"
  if [[ -x "$live_modules/.bin/prisma" && -x "$live_modules/.bin/next" ]]; then
    log "Seeding staging node_modules from healthy live tree, then npm install..."
    if command -v rsync >/dev/null 2>&1; then
      rsync -a "$live_modules/" node_modules/
    else
      cp -a "$live_modules" node_modules
    fi
    if ! npm install --ignore-scripts --no-audit --progress=false; then
      log "Incremental npm install failed — retrying clean npm ci..."
      rm -rf node_modules
      if ! npm_ci_with_retry; then
        return 1
      fi
    fi
  else
    log "Clean npm ci in staging (live node_modules unavailable)..."
    if ! npm_ci_with_retry; then
      return 1
    fi
  fi

  if [[ ! -x node_modules/.bin/prisma ]]; then
    log "prisma CLI still missing — installing prisma packages..."
    if ! npm install prisma@6.19.3 @prisma/client@6.19.3 --ignore-scripts --no-audit --progress=false; then
      log "Failed to install prisma in staging." >&2
      return 1
    fi
  fi

  if [[ ! -x node_modules/.bin/next ]]; then
    log "next CLI missing after install — staging deps incomplete." >&2
    return 1
  fi

  return 0
}

npm_ci_with_retry() {
  local attempt
  for attempt in 1 2; do
    if [[ "$attempt" -gt 1 ]]; then
      log "npm ci retry ${attempt}/2 after rm -rf node_modules..."
      rm -rf node_modules
      sleep 5
    fi
    if [[ -f package-lock.json ]]; then
      if npm ci --ignore-scripts --no-audit --progress=false; then
        return 0
      fi
    elif npm install --ignore-scripts --no-audit --progress=false; then
      return 0
    fi
    log "npm ci/install attempt ${attempt} failed."
  done
  return 1
}

install_and_build() {
  cd "$STAGING"

  if ! install_staging_deps; then
    return 1
  fi

  npm run db:generate

  local DATABASE_URL ADMIN_PASSWORD NEXT_PUBLIC_SITE_URL NEXT_IMAGE_UNOPTIMIZED
  DATABASE_URL="$(load_env_var DATABASE_URL)"
  ADMIN_PASSWORD="$(load_env_var ADMIN_PASSWORD)"
  NEXT_PUBLIC_SITE_URL="$(load_env_var NEXT_PUBLIC_SITE_URL)"
  NEXT_IMAGE_UNOPTIMIZED="$(grep -E "^NEXT_IMAGE_UNOPTIMIZED=" "$ENV_FILE" | tail -1 | cut -d= -f2- || echo true)"
  DATABASE_URL="${DATABASE_URL#DATABASE_URL=}"

  if [[ "$TMD_SKIP_SEED" != "1" ]]; then
    if ! run_clean "$DATABASE_URL" "$ADMIN_PASSWORD" "$NEXT_PUBLIC_SITE_URL" "$NEXT_IMAGE_UNOPTIMIZED" npm run db:seed; then
      log "npm run db:seed failed; retrying with node_modules/.bin/tsx..."
      run_clean "$DATABASE_URL" "$ADMIN_PASSWORD" "$NEXT_PUBLIC_SITE_URL" "$NEXT_IMAGE_UNOPTIMIZED" ./node_modules/.bin/tsx prisma/seed.ts
    fi
  else
    log "Skipping db:seed (TMD_SKIP_SEED=1)."
  fi

  if [[ "$TMD_SWAP_NODE_MODULES_ONLY" == "1" ]]; then
    log "TMD_SWAP_NODE_MODULES_ONLY=1 — skipping build; live .next preserved."
    return 0
  fi

  run_clean "$DATABASE_URL" "$ADMIN_PASSWORD" "$NEXT_PUBLIC_SITE_URL" "$NEXT_IMAGE_UNOPTIMIZED" npm run build

  if [[ ! -f .next/BUILD_ID && "$TMD_SWAP_NODE_MODULES_ONLY" != "1" ]]; then
    log "BUILD_FAILED — .next/BUILD_ID missing in staging." >&2
    return 1
  fi
}

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

run_clean() {
  local DATABASE_URL="$1"
  local ADMIN_PASSWORD="$2"
  local NEXT_PUBLIC_SITE_URL="$3"
  local NEXT_IMAGE_UNOPTIMIZED="$4"
  shift 4
  env -i \
    HOME="${HOME:-/home/faststar}" \
    PATH="${NODE_BIN}:/usr/bin:/bin" \
    NODE_ENV=production \
    DATABASE_URL="${DATABASE_URL}" \
    ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
    NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}" \
    NEXT_IMAGE_UNOPTIMIZED="${NEXT_IMAGE_UNOPTIMIZED}" \
    NEXT_BUILD_CPUS=1 \
    RAYON_NUM_THREADS=1 \
    UV_THREADPOOL_SIZE=1 \
    NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}" \
    "$@" 
}

atomic_swap_dir() {
  local name="$1"
  local live="${DEPLOYPATH}/${name}"
  local incoming="${STAGING}/${name}"
  local backup="${RELEASES_DIR}/backup-${name}"

  if [[ ! -e "$incoming" ]]; then
    log "Nothing to swap for ${name} (missing in staging)."
    return 0
  fi

  rm -rf "$backup"
  if [[ -e "$live" ]]; then
    mv "$live" "$backup"
    log "Backed up live ${name} → ${backup}"
  fi

  mv "$incoming" "$live"
  log "Swapped ${name} into live app."
}

prune_old_releases() {
  local keep="$TMD_RELEASES_KEEP"
  local dirs=()
  local d name
  shopt -s nullglob
  for d in "${RELEASES_DIR}"/*/; do
    name="$(basename "$d")"
    [[ "$name" == backup-* ]] && continue
    dirs+=("${d%/}")
  done
  shopt -u nullglob
  if [[ ${#dirs[@]} -le keep ]]; then
    return 0
  fi
  # Sort by mtime newest first (portable)
  local sorted=()
  while IFS= read -r d; do
    sorted+=("$d")
  done < <(for d in "${dirs[@]}"; do stat -c '%Y %n' "$d" 2>/dev/null || stat -f '%m %N' "$d"; done | sort -rn | cut -d' ' -f2-)
  local i
  for ((i = keep; i < ${#sorted[@]}; i++)); do
    log "Pruning old release ${sorted[$i]}"
    rm -rf "${sorted[$i]}"
  done
}

passenger_restart_hint() {
  mkdir -p "${DEPLOYPATH}/tmp"
  touch "${DEPLOYPATH}/tmp/restart.txt" 2>/dev/null || true
}

if ! sync_source_to_staging; then
  cleanup_failed_staging
  exit 1
fi

if ! install_and_build; then
  cleanup_failed_staging
  exit 1
fi

log "BUILD_OK in staging — swapping artifacts into live (site served old build until restart)..."

atomic_swap_dir "node_modules"
if [[ "$TMD_SWAP_NODE_MODULES_ONLY" != "1" ]]; then
  atomic_swap_dir ".next"
else
  log "Skipped .next swap (node_modules-only recovery)."
fi

echo "$RELEASE_ID" >"${RELEASES_DIR}/current-release"
prune_old_releases
passenger_restart_hint

log "BUILD_OK — release ${RELEASE_ID} is live on disk."
log "Restart Setup Node.js App in cPanel (or: touch ~/coding/fst/tmp/restart.txt)."
log "Deploy log: ${LOG_FILE}"
log "Rollback: bash scripts/tmd-rollback.sh"
