#!/bin/bash
# enable-nightly.sh — install + load the portfolio nightly LaunchAgent.
# Idempotent: safe to re-run. Disable with: scripts/enable-nightly.sh --off
set -euo pipefail
LABEL="com.jdurey.portfolio-nightly"
REPO="$HOME/portfolio"
DEST="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ "${1:-}" = "--off" ]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
  rm -f "$DEST"
  echo "nightly disabled + plist removed."
  exit 0
fi

# 1. Make sure git can push non-interactively (gh as credential helper).
gh auth setup-git

# 2. Materialize the plist with this machine's $HOME and install it.
mkdir -p "$HOME/Library/LaunchAgents" "$REPO/runs"
sed "s#REPLACE_HOME#$HOME#g" "$REPO/deploy/$LABEL.plist" > "$DEST"

# 3. (Re)load it.
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$DEST"
launchctl enable "gui/$(id -u)/$LABEL"

echo "nightly enabled — runs daily 02:30. Logs: $REPO/runs/"
echo "Dry-run it now without waiting:  (cd $REPO && PUBLISH=0 bash scripts/run-nightly.sh && tail runs/nightly-*.log)"
