#!/usr/bin/env bash
# run.sh — one command, two stages: probe (calls the model) then score (deterministic).
#
#   ./run.sh                 # 30 reps/subject at temp 0.7 (config.json)
#   N=50 TEMP=1.0 ./run.sh   # override
#   ./run.sh --force         # re-probe instead of reusing the cached verdicts
#
# Needs ollama running locally with llama3.2:3b. Scoring needs nothing but the saved verdicts, so the
# published numbers re-derive with `node score.mjs` on any machine, no model and no network.
set -euo pipefail
cd "$(dirname "$0")"

FORCE=""
for a in "$@"; do [ "$a" = "--force" ] && FORCE="--force"; done

ARGS=()
[ -n "${N:-}" ] && ARGS+=(--n "$N")
[ -n "${TEMP:-}" ] && ARGS+=(--temp "$TEMP")

echo "== [1/2] probe (identical input, repeated) =="
node probe.mjs ${ARGS[@]+"${ARGS[@]}"} $FORCE

echo "== [2/2] score (deterministic, no model) =="
node score.mjs

echo
echo "[run] DONE -> report.md  (scores: results/scores.json)"
