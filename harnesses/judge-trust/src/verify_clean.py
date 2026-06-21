"""verify_clean.py — DETERMINISTIC clean-baseline guard.

Run every detector against each item labeled `clean`; drop any that trip a predicate. This
guarantees the clean baseline is genuinely free of the specific defects under test, so a
judge's FAIL on a clean item is a meaningful false-fail (not us shipping an accidentally-broken
"clean" item). Bad items are passed through untouched.
"""
import argparse

from common import read_jsonl, write_jsonl, log
from inject import any_detector_fires


def run(items):
    kept, dropped = [], []
    for it in items:
        if it.get("gt_label") == "clean":
            fired = any_detector_fires(it)
            if fired:
                dropped.append((it.get("id"), fired))
                continue
        kept.append(it)
    return kept, dropped


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--out", dest="out", required=True)
    a = ap.parse_args()
    items = read_jsonl(a.inp)
    kept, dropped = run(items)
    write_jsonl(a.out, kept)
    log(f"verify_clean: kept {len(kept)}, dropped {len(dropped)} accidental-defect clean item(s)")
    for cid, fired in dropped:
        log(f"  dropped {cid}: tripped {fired}")


if __name__ == "__main__":
    main()
