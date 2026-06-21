"""score.py — DETERMINISTIC scoring + report rendering. No LLM in this path.

Compares judge verdicts to the by-construction ground truth and emits metrics.json + report.md:
  - per-family false-positive-pass rate (headline) and false-fail rate (specificity tension)
  - false-pass by defect type
  - N×N self-enhancement matrix (generator family × judge family); diagonal = judging own output
  - cross-family K-of-N agreement sweep (fail-closed): the fix that drops the false-pass rate
  - graduation verdict (sensitivity at a fixed specificity floor) per family + ensemble
"""
import argparse
import json

from common import read_jsonl, log

REAL_FAMILIES_ORDER = ["claude", "codex", "grok", "gemini"]


def pct(x):
    return "n/a" if x is None else f"{100*x:.0f}%"


def rate(num, den):
    return None if den == 0 else num / den


# ----------------------------------------------------------------------------- core aggregation
def build(items, verdicts, families):
    by_id = {it["id"]: it for it in items}
    bad_ids = [it["id"] for it in items if it["gt_label"] == "bad"]
    clean_ids = [it["id"] for it in items if it["gt_label"] == "clean"]

    def v(item_id, fam):
        return verdicts.get((item_id, fam), {}).get("verdict", "ERROR")

    # per-family false-pass / false-fail / sensitivity / specificity
    per_family = {}
    for fam in families:
        fp_n = sum(1 for i in bad_ids if v(i, fam) == "PASS")
        fp_d = sum(1 for i in bad_ids if v(i, fam) in ("PASS", "FAIL"))
        ff_n = sum(1 for i in clean_ids if v(i, fam) == "FAIL")
        ff_d = sum(1 for i in clean_ids if v(i, fam) in ("PASS", "FAIL"))
        err = sum(1 for i in bad_ids + clean_ids if v(i, fam) == "ERROR")
        fpr = rate(fp_n, fp_d)
        ffr = rate(ff_n, ff_d)
        per_family[fam] = {
            "false_pass_rate": fpr, "false_fail_rate": ffr,
            "sensitivity": None if fpr is None else 1 - fpr,
            "specificity": None if ffr is None else 1 - ffr,
            "n_bad_judged": fp_d, "n_clean_judged": ff_d, "n_error": err,
        }

    # false-pass by defect type × family
    defects = sorted({by_id[i]["defect_type"] for i in bad_ids if by_id[i]["defect_type"]})
    by_defect = {}
    for dft in defects:
        ids = [i for i in bad_ids if by_id[i]["defect_type"] == dft]
        by_defect[dft] = {}
        for fam in families:
            n = sum(1 for i in ids if v(i, fam) == "PASS")
            d = sum(1 for i in ids if v(i, fam) in ("PASS", "FAIL"))
            by_defect[dft][fam] = {"false_pass_rate": rate(n, d), "n": d}

    # N×N self-enhancement matrix (real generators only)
    gens = [g for g in REAL_FAMILIES_ORDER
            if any(by_id[i]["generator"] == g for i in bad_ids)]
    matrix = {}
    diag, offdiag = [], []
    for g in gens:
        ids = [i for i in bad_ids if by_id[i]["generator"] == g]
        matrix[g] = {}
        for j in families:
            n = sum(1 for i in ids if v(i, j) == "PASS")
            d = sum(1 for i in ids if v(i, j) in ("PASS", "FAIL"))
            r = rate(n, d)
            matrix[g][j] = {"false_pass_rate": r, "n": d}
            if r is not None:
                (diag if g == j else offdiag).append(r)
    self_enh = {
        "diagonal_mean": rate(sum(diag), len(diag)) if diag else None,
        "offdiagonal_mean": rate(sum(offdiag), len(offdiag)) if offdiag else None,
    }
    if self_enh["diagonal_mean"] is not None and self_enh["offdiagonal_mean"] is not None:
        self_enh["bias_delta"] = self_enh["diagonal_mean"] - self_enh["offdiagonal_mean"]
    else:
        self_enh["bias_delta"] = None

    # cross-family K-of-N agreement sweep (fail-closed: PASS iff >=K families vote PASS)
    N = len(families)
    sweep = []
    complete_bad = [i for i in bad_ids if all(v(i, f) in ("PASS", "FAIL") for f in families)]
    complete_clean = [i for i in clean_ids if all(v(i, f) in ("PASS", "FAIL") for f in families)]
    for K in range(1, N + 1):
        def ensemble_pass(i):
            return sum(1 for f in families if v(i, f) == "PASS") >= K
        fp = rate(sum(1 for i in complete_bad if ensemble_pass(i)), len(complete_bad))
        ff = rate(sum(1 for i in complete_clean if not ensemble_pass(i)), len(complete_clean))
        sweep.append({"K": K, "N": N, "false_pass_rate": fp, "false_fail_rate": ff,
                      "sensitivity": None if fp is None else 1 - fp,
                      "specificity": None if ff is None else 1 - ff})
    ballots = {"complete_bad": len(complete_bad), "complete_clean": len(complete_clean)}

    return {
        "per_family": per_family, "by_defect": by_defect, "defects": defects,
        "matrix": matrix, "generators": gens, "self_enhancement": self_enh,
        "kofn_sweep": sweep, "ballots": ballots, "families": families,
        "counts": {"total": len(items), "bad": len(bad_ids), "clean": len(clean_ids)},
    }


def graduation(per_family, sweep, spec_floor, sens_target):
    """A judge 'graduates' if it meets the specificity floor AND the sensitivity target."""
    out = {"spec_floor": spec_floor, "sens_target": sens_target, "family": {}, "ensemble": None}
    for fam, m in per_family.items():
        sens, spec = m["sensitivity"], m["specificity"]
        grad = (sens is not None and spec is not None and spec >= spec_floor and sens >= sens_target)
        out["family"][fam] = {"sensitivity": sens, "specificity": spec, "graduated": grad}
    # ensemble: among K meeting the specificity floor, take max sensitivity
    elig = [s for s in sweep if s["specificity"] is not None and s["specificity"] >= spec_floor
            and s["sensitivity"] is not None]
    best = max(elig, key=lambda s: s["sensitivity"]) if elig else None
    if best is None:  # floor unmet anywhere — fall back to strictest K (max specificity)
        cand = [s for s in sweep if s["specificity"] is not None]
        best = max(cand, key=lambda s: s["specificity"]) if cand else None
    if best:
        out["ensemble"] = {"K": best["K"], "N": best["N"], "sensitivity": best["sensitivity"],
                           "specificity": best["specificity"], "false_pass_rate": best["false_pass_rate"],
                           "graduated": (best["specificity"] is not None and best["specificity"] >= spec_floor
                                         and best["sensitivity"] is not None and best["sensitivity"] >= sens_target)}
    return out


# ----------------------------------------------------------------------------- report rendering
def render(m, grad, meta):
    fams = m["families"]
    pf = m["per_family"]
    naive_fps = [pf[f]["false_pass_rate"] for f in fams if pf[f]["false_pass_rate"] is not None]
    naive = rate(sum(naive_fps), len(naive_fps)) if naive_fps else None
    se = m["self_enhancement"]
    ens = grad["ensemble"]
    M = ens["false_pass_rate"] if ens else None

    L = []
    L.append("# Judge-Trust POC — Results\n")
    L.append(f"_Generated {meta['timestamp']} · seed {meta['seed']} · "
             f"{m['counts']['total']} items ({m['counts']['bad']} deliberately broken, "
             f"{m['counts']['clean']} clean) · {len(fams)} vendor families: {', '.join(fams)}_\n")

    # headline
    head = (f"A naive single LLM judge passes **{pct(naive)}** of items I deliberately broke")
    if se["bias_delta"] is not None:
        head += (f", and the rate is **{pct(se['diagonal_mean'])}** when a model grades its *own* "
                 f"output vs **{pct(se['offdiagonal_mean'])}** on others' "
                 f"(self-enhancement gap **{se['bias_delta']*100:+.0f} pts**)")
    if M is not None and ens:
        head += (f". A cross-family, fictional-content harness ({ens['K']}-of-{ens['N']} agreement, "
                 f"fail-closed) drops the false-pass rate to **{pct(M)}**")
    L.append("> " + head + ".\n")

    # method
    L.append("## Method (one paragraph)\n")
    L.append("Ground truth is **by construction**: a deterministic injector applies one structural "
             "defect (ARF / GDF / FOM / KEY-LEN / FRQ-LEAK) and stamps the label that is true by the "
             "operation; clean items are admitted only after every structural detector confirms none "
             "fire. **No LLM ever touches the labeling path.** All content is about fictional topics so "
             "judges cannot lean on memorized facts. Four independent vendor families grade every item "
             "against one fixed PASS/FAIL rubric, blind to the labels.\n")

    # table 1
    L.append("## 1 · Per-family judge accuracy\n")
    L.append("| Family | False-pass (bad→PASS) | False-fail (clean→FAIL) | Sensitivity | Specificity | Errors |")
    L.append("|---|---|---|---|---|---|")
    for f in fams:
        x = pf[f]
        L.append(f"| {f} | {pct(x['false_pass_rate'])} | {pct(x['false_fail_rate'])} | "
                 f"{pct(x['sensitivity'])} | {pct(x['specificity'])} | {x['n_error']} |")
    L.append("\n_False-pass = rubber-stamping a broken item (the dangerous error). "
             "A judge that FAILs everything scores 0% false-pass but high false-fail — read both._\n")

    # table 2
    L.append("## 2 · False-pass rate by defect type\n")
    L.append("| Defect | " + " | ".join(fams) + " |")
    L.append("|---|" + "---|" * len(fams))
    for dft in m["defects"]:
        row = [dft]
        for f in fams:
            c = m["by_defect"][dft][f]
            row.append(f"{pct(c['false_pass_rate'])} (n={c['n']})")
        L.append("| " + " | ".join(row) + " |")
    L.append("")

    # table 3
    L.append("## 3 · Self-enhancement matrix (false-pass; generator ↓ × judge →)\n")
    if m["generators"]:
        L.append("| Generator \\ Judge | " + " | ".join(fams) + " |")
        L.append("|---|" + "---|" * len(fams))
        for g in m["generators"]:
            row = [g]
            for j in fams:
                c = m["matrix"][g][j]
                mark = " ◆" if g == j else ""
                row.append(f"{pct(c['false_pass_rate'])}{mark}")
            L.append("| " + " | ".join(row) + " |")
        L.append(f"\n◆ = judging own output. Diagonal mean **{pct(se['diagonal_mean'])}** vs "
                 f"off-diagonal mean **{pct(se['offdiagonal_mean'])}**"
                 + (f" → self-enhancement bias **{se['bias_delta']*100:+.0f} pts**.\n"
                    if se["bias_delta"] is not None else ".\n"))
    else:
        L.append("_No real-family-generated bad items available for the matrix._\n")

    # table 4
    L.append("## 4 · Cross-family K-of-N agreement (fail-closed)\n")
    L.append(f"_Over {m['ballots']['complete_bad']} bad + {m['ballots']['complete_clean']} clean items "
             "with a complete ballot from all families. PASS requires ≥K families to vote PASS._\n")
    L.append("| K of N | False-pass | False-fail | Sensitivity | Specificity |")
    L.append("|---|---|---|---|---|")
    for s in m["kofn_sweep"]:
        L.append(f"| {s['K']} of {s['N']} | {pct(s['false_pass_rate'])} | {pct(s['false_fail_rate'])} | "
                 f"{pct(s['sensitivity'])} | {pct(s['specificity'])} |")
    L.append("")

    # graduation
    L.append("## 5 · Graduation verdict\n")
    L.append(f"_Graduated = specificity ≥ {pct(grad['spec_floor'])} AND sensitivity ≥ "
             f"{pct(grad['sens_target'])} (trustworthy enough to run unattended)._\n")
    L.append("| Judge | Sensitivity | Specificity | Graduated? |")
    L.append("|---|---|---|---|")
    for f in fams:
        g = grad["family"][f]
        L.append(f"| {f} | {pct(g['sensitivity'])} | {pct(g['specificity'])} | "
                 f"{'✅ yes' if g['graduated'] else '❌ no'} |")
    if ens:
        L.append(f"| **cross-family {ens['K']}-of-{ens['N']}** | {pct(ens['sensitivity'])} | "
                 f"{pct(ens['specificity'])} | {'✅ yes' if ens['graduated'] else '❌ no'} |")
    L.append("")

    # honesty
    L.append("## Honesty notes (the guardrails that *are* the credibility)\n")
    L.append("- **What this measures:** a reproducible, fully-automated false-positive-pass rate for "
             "*structurally-defined* defects, with ground truth sound because the defects are synthetic.\n"
             "- **What it does NOT claim:** that a human golden set is eliminated in general. "
             "By-construction GT works *because* the content is synthetic; on real content, ground-truth "
             "sourcing is still the open frontier.\n"
             "- **No LLM in the labeling path** — labels come only from deterministic mutations and detectors, "
             "so the experiment is not circular.\n"
             f"- **Sample size:** {m['counts']['bad']} bad + {m['counts']['clean']} clean items; per-defect and "
             "per-matrix-cell N is small (single digits), so the self-enhancement delta is *directional evidence*, "
             "not a significance claim. Scale `n_mcq`/`n_frq` in config.yaml to tighten the estimates.\n")
    L.append(f"\n_Reproducibility: seed {meta['seed']}, families responded "
             f"{meta.get('families_live', fams)}, synthetic backfill {meta.get('synthetic', 'n/a')} items. "
             "Re-run `./run.sh` to regenerate._\n")
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--items", required=True)
    ap.add_argument("--verdicts", required=True)
    ap.add_argument("--metrics-out", required=True)
    ap.add_argument("--report-out", required=True)
    ap.add_argument("--families", required=True)
    ap.add_argument("--spec-floor", type=float, default=0.8)
    ap.add_argument("--sens-target", type=float, default=0.9)
    ap.add_argument("--timestamp", default="(unstamped)")
    ap.add_argument("--seed", type=int, default=42)
    a = ap.parse_args()

    items = read_jsonl(a.items)
    vrecs = read_jsonl(a.verdicts)
    verdicts = {(r["item_id"], r["family"]): r for r in vrecs}
    families = [f for f in a.families.split(",") if f]
    # only score families that actually returned at least one verdict
    live = [f for f in families if any(k[1] == f for k in verdicts)]

    m = build(items, verdicts, live)
    grad = graduation(m["per_family"], m["kofn_sweep"], a.spec_floor, a.sens_target)
    synth = sum(1 for it in items if it.get("generator") == "synthetic")
    meta = {"timestamp": a.timestamp, "seed": a.seed, "families_live": live, "synthetic": synth}

    out = {"metrics": m, "graduation": grad, "meta": meta}
    with open(a.metrics_out, "w") as f:
        json.dump(out, f, indent=2)
    with open(a.report_out, "w") as f:
        f.write(render(m, grad, meta))
    log(f"score: wrote {a.metrics_out} + {a.report_out} (families scored: {live})")


if __name__ == "__main__":
    main()
