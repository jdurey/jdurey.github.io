"""generate.py — produce fictional CLEAN items, round-robin across the four vendor families.

Each family authors a roughly equal share of the items (tagged with `generator`), which is
what enables the full N×N self-enhancement matrix downstream. All content is about BUILT-IN
FICTIONAL topics (fake countries / elements / events) so no judge can lean on memorized
facts — this is the knowledge-leakage control.

Robust-by-design for unattended runs: a family that flakes is retried once, then any shortfall
is backfilled with deterministic `synthetic` items so the pipeline always has enough to run.
Synthetic items are judged/scored normally but excluded from the generator matrix.
"""
import argparse
import json

from common import canonicalize_item, write_jsonl, log
from models import call_model, extract_json, FAMILIES

# Built-in fictional topic pool — provably absent from any training corpus.
TOPICS = [
    "the Zorathi Compact (a fictional 14th-century trade league)",
    "the element Velorium (fictional, atomic number 119)",
    "the Maridian Civil Reforms (fictional 1820s legal overhaul)",
    "the floating city-state of Caelpha (fictional)",
    "the Thandel Migration (fictional mass resettlement)",
    "the mineral Orrenite and its fictional industrial uses",
    "the Sundering of Vael (a fictional political schism)",
    "the Hexarch Council of Bryn-Tor (fictional governance body)",
    "the Lunar Tariff Accords of Selavia (fictional)",
    "the fictional river-empire of Quassir",
]

MCQ_INSTR = """You are writing high-quality multiple-choice quiz items for a course.
Write {k} DISTINCT multiple-choice questions about the following FICTIONAL topics (invent
plausible internal details; they are not real, that is intentional):
{topics}

Rules for EACH item:
- Exactly 4 answer options, exactly ONE correct.
- The four options should be of ROUGHLY EQUAL LENGTH (do not make the correct one longest).
- All four options must be DIFFERENT from each other.
- Per-option feedback that does NOT state or quote the correct answer's text in a wrong option.
- Plain factual feedback (one short sentence per option).

Return ONLY a JSON array, no prose. Each element:
{{"stem": "...", "options": ["..","..","..",".."], "correct_index": 0,
  "option_feedback": ["..","..","..",".."]}}"""

FRQ_INSTR = """You are writing free-response (open-ended) quiz items for a course.
Write {k} DISTINCT free-response questions about these FICTIONAL topics:
{topics}

Rules for EACH item:
- A prompt that asks the student to explain/analyze (do NOT list the required points in the prompt).
- A rubric of 3 short required points the answer must hit.
- A brief model answer.

Return ONLY a JSON array, no prose. Each element:
{{"prompt": "...", "rubric_points": ["..","..",".."], "model_answer": "..."}}"""


def _topic_block(seed_offset, n=4):
    return "\n".join(f"- {TOPICS[(seed_offset + i) % len(TOPICS)]}" for i in range(n))


def _valid_mcq(d):
    return (isinstance(d, dict) and isinstance(d.get("stem"), str)
            and isinstance(d.get("options"), list) and len(d["options"]) == 4
            and all(isinstance(o, str) and o.strip() for o in d["options"])
            and isinstance(d.get("correct_index"), int) and 0 <= d["correct_index"] < 4
            and isinstance(d.get("option_feedback"), list) and len(d["option_feedback"]) == 4
            and all(isinstance(f, str) for f in d["option_feedback"]))


def _valid_frq(d):
    return (isinstance(d, dict) and isinstance(d.get("prompt"), str)
            and isinstance(d.get("rubric_points"), list) and 2 <= len(d["rubric_points"]) <= 5
            and all(isinstance(p, str) and p.strip() for p in d["rubric_points"])
            and isinstance(d.get("model_answer"), str))


def _ask(family, instr, validate, want, seed_offset):
    """One generation call (with a single retry). Returns a list of validated raw dicts."""
    prompt = instr.format(k=want, topics=_topic_block(seed_offset))
    for attempt in (1, 2):
        raw = call_model(family, prompt)
        j = extract_json(raw)
        if isinstance(j, dict):      # a lone object instead of an array — accept it
            j = [j]
        if isinstance(j, list):
            good = [d for d in j if validate(d)]
            if good:
                log(f"  {family}: got {len(good)}/{len(j)} valid (attempt {attempt})")
                return good
        log(f"  {family}: no valid items (attempt {attempt}, {len(raw)} bytes)")
    return []


# ---------------------------------------------------------------- deterministic synthetic backfill
def _synth_mcq(idx):
    topic = TOPICS[idx % len(TOPICS)]
    ci = idx % 4
    base = ["the northern province", "the coastal league", "the inland council", "the river guild"]
    opts = [f"{b}" for b in base]
    fb = [f"Review the governance of {topic}." for _ in range(4)]
    return {"type": "mcq", "topic": topic, "generator": "synthetic",
            "stem": f"Within {topic}, which entity is described as holding ratifying authority?",
            "options": opts, "correct_index": ci, "option_feedback": fb}


def _synth_frq(idx):
    topic = TOPICS[idx % len(TOPICS)]
    return {"type": "frq", "topic": topic, "generator": "synthetic",
            "prompt": f"Analyze how {topic} reshaped its region's institutions.",
            "rubric_points": ["identifies the central reform",
                              "names the body that enacted it",
                              "explains one downstream consequence"],
            "model_answer": f"A strong answer traces the central reform of {topic} and its effects."}


def generate(n_mcq, n_frq, seed, skip_families=None):
    skip = set(skip_families or [])
    fams = [f for f in FAMILIES if f not in skip]
    items = []

    if fams:
        # MCQ — round-robin shares across families
        shares = _shares(n_mcq, len(fams))
        for fi, family in enumerate(fams):
            want = shares[fi]
            if want == 0:
                continue
            log(f"generate MCQ: {family} (target {want})")
            for d in _ask(family, MCQ_INSTR, _valid_mcq, want, seed + fi):
                d["type"] = "mcq"
                d["generator"] = family
                d.setdefault("topic", "fictional")
                items.append(d)

        # FRQ — round-robin shares across families
        shares = _shares(n_frq, len(fams))
        for fi, family in enumerate(fams):
            want = shares[fi]
            if want == 0:
                continue
            log(f"generate FRQ: {family} (target {want})")
            for d in _ask(family, FRQ_INSTR, _valid_frq, want, seed + fi + 100):
                d["type"] = "frq"
                d["generator"] = family
                d.setdefault("topic", "fictional")
                items.append(d)
    else:
        log("generate: no live families — using synthetic backfill only")

    # Backfill shortfalls deterministically so the run is always complete.
    have_mcq = sum(1 for it in items if it["type"] == "mcq")
    have_frq = sum(1 for it in items if it["type"] == "frq")
    nb = 0
    for k in range(max(0, n_mcq - have_mcq)):
        items.append(_synth_mcq(seed + k)); nb += 1
    for k in range(max(0, n_frq - have_frq)):
        items.append(_synth_frq(seed + k)); nb += 1
    if nb:
        log(f"generate: backfilled {nb} synthetic item(s) ({have_mcq}/{n_mcq} MCQ, {have_frq}/{n_frq} FRQ from families)")

    # finalize: ids + canonical polarity feedback
    final = []
    for i, it in enumerate(items):
        it["id"] = f"{it['type']}_{i:04d}"
        canonicalize_item(it)
        final.append(it)
    return final


def _shares(total, k):
    """Split `total` into k near-equal integer shares (round-robin)."""
    base = total // k
    rem = total % k
    return [base + (1 if i < rem else 0) for i in range(k)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--n-mcq", type=int, default=40)
    ap.add_argument("--n-frq", type=int, default=10)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--skip", default="")
    ap.add_argument("--families", default="", help="if set, only these families generate (overrides --skip)")
    a = ap.parse_args()
    if a.families.strip():
        want = [f for f in a.families.split(",") if f]
        skip = [f for f in FAMILIES if f not in want]
    else:
        skip = [s for s in a.skip.split(",") if s]
    items = generate(a.n_mcq, a.n_frq, a.seed, skip)
    write_jsonl(a.out, items)
    by_gen = {}
    for it in items:
        by_gen[it["generator"]] = by_gen.get(it["generator"], 0) + 1
    log(f"generate: wrote {len(items)} items -> {a.out}")
    log("  by generator: " + json.dumps(by_gen))


if __name__ == "__main__":
    main()
