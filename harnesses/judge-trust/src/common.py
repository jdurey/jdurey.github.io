"""Shared helpers for judge-trust-poc.

Pure, dependency-free. The functions here that touch labels (canonicalize_feedback,
normalize) are DETERMINISTIC by design — no LLM ever runs in the labeling path. That is
the methodological crux of this POC (see README: "ground truth by construction").
"""
import json
import re
import sys

DEFECT_TYPES = ["ARF", "GDF", "FOM", "KEY-LEN", "FRQ-LEAK"]

CORRECT_PREFIX = "Correct:"
INCORRECT_PREFIX = "Incorrect:"


def normalize(text):
    """Lowercase, strip punctuation, collapse whitespace — for robust text comparison."""
    if text is None:
        return ""
    t = text.lower()
    t = re.sub(r"[^\w\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def read_jsonl(path):
    items = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                items.append(json.loads(line))
    return items


def write_jsonl(path, items):
    with open(path, "w") as f:
        for it in items:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")


def canonicalize_item(item):
    """DETERMINISTIC normalization stamped in Python — never trusted from the LLM.

    For MCQ: strip any leading polarity words the generator may have added, then stamp the
    canonical polarity prefix on each option's feedback based on correct_index. This makes
    the FOM (feedback-option mismatch) defect both injectable and detectable by construction,
    independent of whether the LLM followed instructions.
    """
    if item.get("type") != "mcq":
        return item
    fb = item.get("option_feedback") or []
    ci = item.get("correct_index")
    cleaned = []
    for i, f in enumerate(fb):
        # remove any leading "correct:"/"incorrect:"/"right"/"wrong" the LLM may have prepended
        body = re.sub(r"^\s*(correct|incorrect|right|wrong)\s*[:\-—,]\s*", "", f, flags=re.I).strip()
        prefix = CORRECT_PREFIX if i == ci else INCORRECT_PREFIX
        cleaned.append(f"{prefix} {body}")
    item["option_feedback"] = cleaned
    return item


def feedback_polarity_index(item):
    """Return the option index whose feedback carries the CORRECT polarity prefix.

    Returns a list of indices marked Correct (should be exactly [correct_index] when clean).
    """
    out = []
    for i, f in enumerate(item.get("option_feedback") or []):
        if f.strip().lower().startswith(CORRECT_PREFIX.lower()):
            out.append(i)
    return out


def log(msg):
    print(msg, file=sys.stderr, flush=True)
