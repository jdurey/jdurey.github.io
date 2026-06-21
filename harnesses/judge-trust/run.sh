#!/usr/bin/env bash
# run.sh — end-to-end, one command. Chains the 5 stages over a config file.
#
#   ./run.sh                      # uses config.yaml
#   ./run.sh config.smoke.yaml    # uses an alternate config
#   ./run.sh --force              # wipe data/ and regenerate from scratch
#
# Resumable: generation is cached (data/items_clean.jsonl) and judge verdicts are cached
# per (item, family), so a re-run only fills gaps. --force clears the cache.
set -euo pipefail
cd "$(dirname "$0")"

CONFIG="config.yaml"
FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    *.yaml|*.yml) CONFIG="$arg" ;;
  esac
done
[ -r "$CONFIG" ] || { echo "run.sh: config '$CONFIG' not readable" >&2; exit 2; }

# Parse YAML via Python (PyYAML present; yq not required) into shell vars.
eval "$(python3 - "$CONFIG" <<'PY'
import sys, yaml
c = yaml.safe_load(open(sys.argv[1]))
for k in ("n_mcq","n_frq","seed","defect_frac","families","batch_size","spec_floor","sens_target"):
    print(f'{k.upper()}="{c[k]}"')
PY
)"

mkdir -p data
if [ "$FORCE" -eq 1 ]; then echo "[run] --force: clearing data/"; rm -f data/*.jsonl; rm -rf data/judge_raw; fi

TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
export PYTHONPATH="src:${PYTHONPATH:-}"

echo "== [0/5] GT-integrity self-test =="
python3 src/inject.py --selftest    # aborts the run (set -e) if the spine is broken

echo "== [1/5] generate (fictional clean items, family round-robin) =="
if [ -s data/items_clean.jsonl ] && [ "$FORCE" -eq 0 ]; then
  echo "[run] data/items_clean.jsonl exists — reusing (use --force to regenerate)"
else
  python3 src/generate.py --out data/items_clean.jsonl \
    --n-mcq "$N_MCQ" --n-frq "$N_FRQ" --seed "$SEED" --families "$FAMILIES"
fi

echo "== [2/5] inject (deterministic defects + by-construction labels) =="
python3 src/inject.py --in data/items_clean.jsonl --out data/items_labeled.jsonl \
  --seed "$SEED" --defect-frac "$DEFECT_FRAC"

echo "== [3/5] verify_clean (drop accidental-defect clean items) =="
python3 src/verify_clean.py --in data/items_labeled.jsonl --out data/items_verified.jsonl

echo "== [4/5] judge (cross-family, batched, resumable) =="
python3 src/judge.py --in data/items_verified.jsonl --out data/verdicts.jsonl \
  --raw-dir data/judge_raw --families "$FAMILIES" --batch-size "$BATCH_SIZE"

echo "== [5/5] score (metrics + report) =="
python3 src/score.py --items data/items_verified.jsonl --verdicts data/verdicts.jsonl \
  --metrics-out data/metrics.json --report-out report.md \
  --families "$FAMILIES" --spec-floor "$SPEC_FLOOR" --sens-target "$SENS_TARGET" \
  --timestamp "$TS" --seed "$SEED"

echo
echo "[run] DONE -> report.md  (metrics: data/metrics.json)"
