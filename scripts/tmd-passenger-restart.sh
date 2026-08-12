#!/usr/bin/env bash
# Best-effort Passenger restart for cPanel Node.js apps (non-fatal on failure).
#
# Methods (tried in order):
#   1. touch $DEPLOYPATH/tmp/restart.txt — standard mod_passenger reload signal
#   2. cloudlinux-selector restart — CloudLinux Node.js Selector on some cPanel hosts
set -euo pipefail

DEPLOYPATH="${DEPLOYPATH:-/home/faststar/coding/fst}"
TMD_CPANEL_USER="${TMD_CPANEL_USER:-faststar}"
TMD_RESTART_LOG_FILE="${TMD_RESTART_LOG_FILE:-}"

log_msg() {
  local msg="$1"
  if [[ -n "$TMD_RESTART_LOG_FILE" ]]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $msg" >>"$TMD_RESTART_LOG_FILE"
  fi
  echo "$msg"
}

restart_file="${DEPLOYPATH}/tmp/restart.txt"
method_ok=0

log_msg "Attempting Passenger auto-restart..."

if mkdir -p "${DEPLOYPATH}/tmp" 2>/dev/null && touch "$restart_file" 2>/dev/null; then
  log_msg "Passenger restart: touched ${restart_file} (mod_passenger reloads on next request)"
  method_ok=1
else
  log_msg "WARNING: could not touch ${restart_file} (non-fatal)"
fi

if command -v cloudlinux-selector >/dev/null 2>&1; then
  if cloudlinux-selector restart --json --interpreter nodejs \
    --user "$TMD_CPANEL_USER" --app-root "$DEPLOYPATH" >>"${TMD_RESTART_LOG_FILE:-/dev/null}" 2>&1; then
    log_msg "Passenger restart: cloudlinux-selector restart succeeded"
    method_ok=1
  else
    log_msg "WARNING: cloudlinux-selector restart failed or not applicable (non-fatal)"
  fi
fi

if [[ "$method_ok" -eq 1 ]]; then
  log_msg "Passenger auto-restart signal sent."
else
  log_msg "WARNING: auto-restart may not have applied — Restart in cPanel → Setup Node.js App if the site serves stale content."
fi

exit 0
