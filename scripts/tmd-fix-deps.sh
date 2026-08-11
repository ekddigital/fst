#!/usr/bin/env bash
# Emergency: rebuild node_modules in staging and swap into live (keep existing .next).
# Use when live node_modules is corrupted but .next/BUILD_ID still exists.
set -euo pipefail

export TMD_SKIP_SEED=1
export TMD_SWAP_NODE_MODULES_ONLY=1
exec bash "$(dirname "$0")/tmd-deploy.sh"
