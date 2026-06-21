"""judge.py — grade every item with all four independent vendor families.

A single fixed QC rubric prompt (state-once, identical across vendors) asks each judge for a
PASS/FAIL verdict. The judge NEVER sees the by-construction label, the defect_type, or the
mutation note — only the item as a student would. Verdicts are cached per (item, family) so the
run is fully resumable: a crash, timeout, or Ctrl-C loses nothing and a re-run only fills gaps.

Independence is at the vendor/training level (Anthropic/OpenAI/xAI/Google) — the basis of the
cross-family K-of-N result in score.py.
"""
import argparse
import json
import os

from common import read_jsonl, log
from models import call_model, extract_json, FAMILIES

RUBRIC = """You are a quality-control reviewer for quiz items. For EACH item, decide PASS (the
item is fair and ready to use with students) or FAIL (it has a quality problem that should be
fixed first). A good item gives nothing away, has distinct and parallel answer options, has
feedback that correctly fits each option, and — for free-response — asks the student to do the
thinking rather than handing them the answer. Use your judgment.

Return ONLY a JSON array, one object per item, no prose:
[{"id": "<item id>", "verdict": "PASS" or "FAIL", "defect_type": "<short label or null>",
  "reason": "<one short sentence>"}]

ITEMS:
"""


def _public_view(it):
    """Strip every label/ground-truth field — the judge sees only what a student would."""
    keys = ["id", "type", "stem", "options", "correct_index", "option_feedback",
            "prompt", "rubric_points", "model_answer"]
    return {k: it[k] for k in keys if k in it}


def _norm_verdict(v):
    s = str(v).strip().lower()
    if any(w in s for w in ("fail", "bad", "reject", "defect")):
        return "FAIL"
    if any(w in s for w in ("pass", "clean", "ok", "good", "ship")):
        return "PASS"
    return "ERROR"


def _load_cache(path):
    done = {}
    if os.path.exists(path):
        for rec in read_jsonl(path):
            done[(rec["item_id"], rec["family"])] = rec
    return done


def _append(path, rec):
    with open(path, "a") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def _grade_batch(family, batch):
    prompt = RUBRIC + json.dumps([_public_view(it) for it in batch], ensure_ascii=False, indent=1)
    raw = call_model(family, prompt)
    j = extract_json(raw)
    by_id = {}
    if isinstance(j, list):
        for d in j:
            if isinstance(d, dict) and "id" in d:
                by_id[str(d["id"])] = d
    return by_id, raw


def run(items, families, batch_size, out_path, raw_dir):
    os.makedirs(raw_dir, exist_ok=True)
    cache = _load_cache(out_path)
    n_new = 0
    for family in families:
        pending = [it for it in items if (it["id"], family) not in cache]
        if not pending:
            log(f"judge {family}: all {len(items)} cached, skipping")
            continue
        log(f"judge {family}: {len(pending)} to grade in batches of {batch_size}")
        for b in range(0, len(pending), batch_size):
            batch = pending[b:b + batch_size]
            by_id, raw = _grade_batch(family, batch)
            if not by_id:  # one retry on a parse miss
                by_id, raw = _grade_batch(family, batch)
            with open(os.path.join(raw_dir, f"{family}_{b:04d}.txt"), "w") as f:
                f.write(raw or "")
            for it in batch:
                d = by_id.get(it["id"], {})
                rec = {
                    "item_id": it["id"], "family": family,
                    "verdict": _norm_verdict(d.get("verdict", "ERROR")),
                    "judge_defect": d.get("defect_type"),
                    "reason": (d.get("reason") or "")[:300],
                }
                cache[(it["id"], family)] = rec
                _append(out_path, rec)
                n_new += 1
            done = min(b + batch_size, len(pending))
            log(f"  {family}: {done}/{len(pending)}")
    log(f"judge: {n_new} new verdicts -> {out_path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--raw-dir", required=True)
    ap.add_argument("--families", default=",".join(FAMILIES))
    ap.add_argument("--batch-size", type=int, default=8)
    a = ap.parse_args()
    items = read_jsonl(a.inp)
    families = [f for f in a.families.split(",") if f]
    run(items, families, a.batch_size, a.out, a.raw_dir)


if __name__ == "__main__":
    main()
