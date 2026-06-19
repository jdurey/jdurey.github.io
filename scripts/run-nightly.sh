#!/bin/bash
# run-nightly.sh — launchd entrypoint for the portfolio nightly engine.
# Sets a deterministic PATH (launchd has almost none), points the engine at the
# lab artifacts on THIS machine, and runs one nightly cycle with logging.
set -uo pipefail

export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
REPO="$HOME/portfolio"
cd "$REPO" || exit 1

# Where new lab artifacts to watch live on this machine (colon-separated for multiple).
# Edit if the lab moves; resolve via the federation machine-map rather than hardcoding elsewhere.
export FORGE_SOURCES="${FORGE_SOURCES:-$HOME/Library/Mobile Documents/com~apple~CloudDocs/Sync/forge-sources}"

# Publish unattended (firewall-gated). Set GEN_ENABLED=1 only after you've seen a sample
# auto-draft — a draft that trips the firewall will (correctly) block all publishing until cleared.
export PUBLISH="${PUBLISH:-1}"
export GEN_ENABLED="${GEN_ENABLED:-0}"

mkdir -p runs
LOG="runs/nightly-$(date +%Y-%m-%d).log"
{
  echo "=== run-nightly $(date) ==="
  echo "node: $(command -v node)  PUBLISH=$PUBLISH GEN_ENABLED=$GEN_ENABLED"
  node scripts/nightly.mjs
  echo "=== exit $? ==="
} >>"$LOG" 2>&1
