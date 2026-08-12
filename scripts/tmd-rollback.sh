#!/usr/bin/env bash
# Roll back FST on TMD to the previous release backup (from last successful deploy).
#
# Usage:
#   bash scripts/tmd-rollback.sh
#
# Restores ~/coding/fst-releases/backup-.next and backup-node_modules if present.
set -euo pipefail

DEPLOYPATH="${DEPLOYPATH:-/home/faststar/coding/fst}"
RELEASES_DIR="${RELEASES_DIR:-/home/faststar/coding/fst-releases}"

rollback_dir() {
  local name="$1"
  local live="${DEPLOYPATH}/${name}"
  local backup="${RELEASES_DIR}/backup-${name}"

  if [[ ! -e "$backup" ]]; then
    echo "No backup for ${name} at ${backup}" >&2
    return 1
  fi

  rm -rf "$live"
  mv "$backup" "$live"
  echo "Restored ${name} from ${backup}"
}

rollback_dir "node_modules"
rollback_dir ".next"

DEPLOYPATH="$DEPLOYPATH" bash "$(dirname "$0")/tmd-passenger-restart.sh"

echo "Rollback complete — Passenger restart signal sent (verify app if needed)."
