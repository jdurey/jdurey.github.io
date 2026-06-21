"""inject.py — THE DETERMINISTIC SPINE.

For a fraction of clean items, apply exactly one structural defect injector and stamp a
ground-truth label that is TRUE BY THE OPERATION. Every injector ships with a matching
deterministic detector predicate. No LLM is ever consulted to create or confirm a label.

  inject:   clean item --(pure structural transform)--> bad item, gt_label stamped
  detect:   item ------(pure structural predicate)----> bool (defect present?)

Invariant proven by --selftest:  detect_X(inject_X(clean)) == True  AND  detect_X(clean) == False.

Defect taxonomy (mirrors the real ed-content QC failure modes this POC studies):
  ARF      answer revealed in a wrong option's feedback
  GDF      ghost distractor — a wrong option duplicates the correct answer
  FOM      feedback-option mismatch — per-option feedback rotated off its option
  KEY-LEN  key-length cueing — correct option made uniquely longest by a margin
  FRQ-LEAK rubric's required points leaked verbatim into the FRQ prompt
"""
import argparse
import copy
import sys

from common import (
    DEFECT_TYPES, normalize, read_jsonl, write_jsonl, canonicalize_item,
    feedback_polarity_index, CORRECT_PREFIX, log,
)

KEYLEN_MARGIN = 10          # chars: correct option must exceed every other by >= this to count as cued
MIN_MATCH_WORDS = 2         # normalized-substring matches shorter than this are ignored (noise guard)
KEYLEN_CLAUSE = ", as applied across the region"   # subtle, natural padding (not a flashing cue)

MCQ_DEFECTS = ["ARF", "GDF", "FOM", "KEY-LEN"]
FRQ_DEFECTS = ["FRQ-LEAK"]


# ----------------------------------------------------------------------------- helpers
def _norm_words(text):
    return normalize(text).split()


def _contains_phrase(haystack, needle):
    """True if normalized `needle` (>= MIN_MATCH_WORDS words) occurs in normalized `haystack`."""
    nw = _norm_words(needle)
    if len(nw) < MIN_MATCH_WORDS:
        return False
    return " ".join(nw) in normalize(haystack)


# ----------------------------------------------------------------------------- injectors
def inject_ARF(item):
    it = copy.deepcopy(item)
    ci = it["correct_index"]
    correct_text = it["options"][ci]
    wrong = next(i for i in range(len(it["options"])) if i != ci)
    # subtle framing: the correct answer's exact text appears verbatim (still a true ARF by
    # construction, detector fires) but woven into plausible feedback rather than flagged.
    it["option_feedback"][wrong] = it["option_feedback"][wrong].rstrip(". ") + \
        f"; a closer fit to the question is {correct_text}."
    return _stamp(it, "ARF", f"correct text injected into option {wrong} feedback")


def inject_GDF(item):
    it = copy.deepcopy(item)
    ci = it["correct_index"]
    correct_text = it["options"][ci]
    wrong = next(i for i in range(len(it["options"])) if i != ci)
    it["options"][wrong] = correct_text
    return _stamp(it, "GDF", f"option {wrong} overwritten with the correct answer text")


def inject_FOM(item):
    it = copy.deepcopy(item)
    fb = it["option_feedback"]
    it["option_feedback"] = [fb[-1]] + fb[:-1]      # rotate right by 1
    return _stamp(it, "FOM", "per-option feedback rotated by 1")


def inject_KEYLEN(item):
    it = copy.deepcopy(item)
    ci = it["correct_index"]
    others = max(len(o) for i, o in enumerate(it["options"]) if i != ci)
    target = others + KEYLEN_MARGIN + 2
    text = it["options"][ci].rstrip(". ")
    if len(text) < target:
        text = text + KEYLEN_CLAUSE
    while len(text) < target:        # ensure it clears the detection margin even if the clause is short
        text = text + " in practice"
    it["options"][ci] = text
    return _stamp(it, "KEY-LEN", "correct option padded to be uniquely longest by margin")


def inject_FRQ_LEAK(item):
    it = copy.deepcopy(item)
    pts = " ".join(it["rubric_points"])
    it["prompt"] = it["prompt"].rstrip() + "\n\nBe sure to address: " + pts
    return _stamp(it, "FRQ-LEAK", "rubric points concatenated verbatim into prompt")


def _stamp(it, defect, note):
    it["gt_label"] = "bad"
    it["defect_type"] = defect
    it["mutation_note"] = note
    return it


INJECTORS = {
    "ARF": inject_ARF, "GDF": inject_GDF, "FOM": inject_FOM,
    "KEY-LEN": inject_KEYLEN, "FRQ-LEAK": inject_FRQ_LEAK,
}


# ----------------------------------------------------------------------------- detectors
def detect_ARF(item):
    if item.get("type") != "mcq":
        return False
    ci = item["correct_index"]
    correct_text = item["options"][ci]
    for i, f in enumerate(item.get("option_feedback") or []):
        if i != ci and _contains_phrase(f, correct_text):
            return True
    # also flag if the correct answer text is leaked into the stem
    return _contains_phrase(item.get("stem", ""), correct_text)


def detect_GDF(item):
    if item.get("type") != "mcq":
        return False
    ci = item["correct_index"]
    norm = [normalize(o) for o in item["options"]]
    for i in range(len(norm)):
        if i != ci and norm[i] == norm[ci]:
            return True
    # any duplicate pair at all is a structural defect
    return len(set(norm)) != len(norm)


def detect_FOM(item):
    if item.get("type") != "mcq":
        return False
    return feedback_polarity_index(item) != [item["correct_index"]]


def detect_KEYLEN(item):
    if item.get("type") != "mcq":
        return False
    ci = item["correct_index"]
    others = [len(o) for i, o in enumerate(item["options"]) if i != ci]
    if not others:
        return False
    return len(item["options"][ci]) - max(others) >= KEYLEN_MARGIN


def detect_FRQ_LEAK(item):
    if item.get("type") != "frq":
        return False
    prompt = item.get("prompt", "")
    return any(_contains_phrase(prompt, pt) for pt in item.get("rubric_points", []))


DETECTORS = {
    "ARF": detect_ARF, "GDF": detect_GDF, "FOM": detect_FOM,
    "KEY-LEN": detect_KEYLEN, "FRQ-LEAK": detect_FRQ_LEAK,
}


def any_detector_fires(item):
    """Return the list of defect types whose detector fires on this item."""
    return [d for d, fn in DETECTORS.items() if fn(item)]


# ----------------------------------------------------------------------------- main inject pass
def run_inject(items, seed, defect_frac):
    rng = _Lcg(seed)
    mcq = [i for i, it in enumerate(items) if it.get("type") == "mcq"]
    frq = [i for i, it in enumerate(items) if it.get("type") == "frq"]
    out = [copy.deepcopy(it) for it in items]
    for it in out:
        it.setdefault("gt_label", "clean")
        it.setdefault("defect_type", None)
        it.setdefault("mutation_note", None)

    def assign(indices, defect_pool):
        rng.shuffle(indices)
        n_bad = int(round(len(indices) * defect_frac))
        for k, idx in enumerate(indices[:n_bad]):
            defect = defect_pool[k % len(defect_pool)]
            out[idx] = INJECTORS[defect](out[idx])

    assign(mcq, MCQ_DEFECTS)
    assign(frq, FRQ_DEFECTS)
    return out


class _Lcg:
    """Tiny seeded PRNG so shuffling is reproducible without importing random's global state."""
    def __init__(self, seed):
        self.state = (seed * 2654435761 + 1) & 0xFFFFFFFF

    def _next(self):
        self.state = (1103515245 * self.state + 12345) & 0x7FFFFFFF
        return self.state

    def shuffle(self, lst):
        for i in range(len(lst) - 1, 0, -1):
            j = self._next() % (i + 1)
            lst[i], lst[j] = lst[j], lst[i]


# ----------------------------------------------------------------------------- self-test
def _sample_clean_mcq(n=4):
    items = []
    for k in range(n):
        it = canonicalize_item({
            "id": f"smcq_{k}", "type": "mcq", "topic": "Test", "generator": "selftest",
            "stem": f"In the fictional polity Zorath-{k}, which body ratifies treaties?",
            "options": ["The Outer Council", "The Hexarch alone", "The Lunar Assembly", "The Reeve's Court"],
            "correct_index": 2,
            "option_feedback": [
                "the outer council only advises",
                "the hexarch may propose but not ratify",
                "this chamber holds ratification power",
                "the reeve's court handles disputes, not treaties",
            ],
        })
        items.append(it)
    return items


def _sample_clean_frq(n=2):
    items = []
    for k in range(n):
        items.append({
            "id": f"sfrq_{k}", "type": "frq", "topic": "Test", "generator": "selftest",
            "prompt": f"Explain how the Zorath-{k} trade compact altered regional alliances.",
            "rubric_points": [
                "names the shift from tribute to reciprocal tariffs",
                "identifies the Lunar Assembly as broker",
                "notes the collapse of the older bilateral pacts",
            ],
            "model_answer": "A strong answer would trace the tariff reform and the brokered realignment.",
        })
    return items


def selftest():
    failures = []
    mcq = _sample_clean_mcq()
    frq = _sample_clean_frq()

    # 1. clean items trip NO detector
    for it in mcq + frq:
        fired = any_detector_fires(it)
        if fired:
            failures.append(f"CLEAN item {it['id']} unexpectedly tripped {fired}")

    # 2. detect_X(inject_X(clean)) == True and label stamped; other items unaffected
    for defect in DEFECT_TYPES:
        base = frq[0] if defect == "FRQ-LEAK" else mcq[0]
        bad = INJECTORS[defect](base)
        if not DETECTORS[defect](bad):
            failures.append(f"{defect}: detector did NOT fire on its own injection")
        if bad.get("gt_label") != "bad" or bad.get("defect_type") != defect:
            failures.append(f"{defect}: label not stamped correctly ({bad.get('gt_label')}/{bad.get('defect_type')})")
        if DETECTORS[defect](base):
            failures.append(f"{defect}: detector fires on the CLEAN original (false positive)")

    if failures:
        for f in failures:
            log("SELFTEST FAIL: " + f)
        log(f"SELFTEST: {len(failures)} failure(s)")
        return 1
    log("SELFTEST OK: all injectors round-trip (detect∘inject == label; detect(clean)==False)")
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp")
    ap.add_argument("--out", dest="out")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--defect-frac", type=float, default=0.5)
    ap.add_argument("--selftest", action="store_true")
    a = ap.parse_args()
    if a.selftest:
        sys.exit(selftest())
    items = read_jsonl(a.inp)
    labeled = run_inject(items, a.seed, a.defect_frac)
    write_jsonl(a.out, labeled)
    n_bad = sum(1 for it in labeled if it["gt_label"] == "bad")
    log(f"inject: {len(labeled)} items -> {n_bad} bad / {len(labeled) - n_bad} clean (seed={a.seed})")


if __name__ == "__main__":
    main()
