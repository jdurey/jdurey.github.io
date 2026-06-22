# Verdict-Integrity Probe

**Is your AI grader a function?** People treat an LLM-as-judge as if the same answer always gets the
same verdict. This is a tiny instrument that checks. It submits one fixed answer to a grader many times
and counts how often the verdict flips. A sound grader returns the same call every time. This one does
not.

One command produces [`report.md`](report.md):

```bash
./run.sh                 # 30 reps/answer at temp 0.7 (config.json)
TEMP=1.3 N=30 ./run.sh   # the settings used for the committed numbers below
./run.sh --force         # re-probe instead of reusing the saved verdicts
```

The subject is the reproducible local baseline (Llama 3.2 3B via ollama). The same probe runs against any
hosted grading endpoint by swapping the one model call in `probe.mjs`.

---

## The method, in one sentence

Hold the input fixed, repeat the call, tally the verdicts. The flip is the defect.

That is the whole idea, and it matters because single-shot QC is structurally blind to it. You run the
grader once, the verdict looks fine, you move on. The instability only appears under repetition, which is
exactly what a one-shot review never does.

## Why the content is fictional

The item lives in an invented country (Vendari, with a Hearth / Province / Crown government). That is
load-bearing. A grader that knows real civics can lean on memorized facts instead of reading the rubric in
front of it. With invented content the only thing it can do is apply the criteria, which is the behavior
under test. Same discipline as the sibling harnesses in this folder.

## Ground truth is by construction, never by model

I wrote the items, so I know which answers a sound grader must pass. Those labels live in
[`golden/labels.json`](golden/labels.json). No model ever produces a label. The scorer compares the
grader's verdicts to my by-construction labels, and it never asks a model what the right answer is. The
scoring stage has no model in it at all.

## The defect classes this names

| Class | What it is | Where it lives |
|---|---|---|
| **NDV** (nondeterministic verdict) | same input, different verdict across repeats | the model call (stochastic) |
| **VTD** (verdict-time drift) | the pass-rate moves over minutes/hours on the same input | the serving stack (stochastic) |
| **CFR** (confabulated feedback) | the feedback invents a reason to fit whichever verdict landed | downstream of the flip |
| **ALR** (accept-list rigidity) | a valid answer fails for not being on the example list | the rubric (deterministic) |

The split matters because the fixes are different. NDV/VTD/CFR are stochastic and live in the call. ALR is
deterministic and lives in the rubric. The common instinct, "add more accepted answers," only touches ALR
and does nothing for the instability. This probe focuses on NDV, the one that reproduces cleanly on a
laptop. VTD needs a hosted endpoint observed over time and is characterized in the case study, not claimed
from a single local run.

## What this run found

`ollama:llama3.2:3b`, temperature 1.3, 30 identical submissions per answer:

| Answer | Valid by rubric | Pass | Fail | Pass-rate | Flipped |
|---|---|---|---|---|---|
| `gold` (verbatim accepted example) | yes | 30 | 0 | 100% | no |
| `gibberish` (off task) | no | 0 | 30 | 0% | no |
| `ndv` ("The Crown mints the realm's coin") | yes | 19 | 11 | 63% | **yes, 37% minority** |
| `ndv2` ("The Hearth keeps the wells") | yes | 20 | 10 | 67% | **yes** |
| `noservice` ("I would choose the Crown") | no | 13 | 17 | 43% | **yes** |

The controls separate cleanly, so the flips are signal, not a broken setup. `ndv` is the result that
matters: its service ("mints the realm's coin") is drawn from the accepted examples, so it is already
list-aligned, and it **still** flips on more than a third of identical submissions. Enriching the
accept-list cannot fix a verdict that moves on list-aligned input. The `noservice` row is the same defect
pointed the other way: an answer that names no service, which the rubric says to reject, passes almost half
the time.

## Reproducing the numbers without a model

The probe writes every raw response to `results/raw_probe/` and the structured verdicts to
`results/verdicts.json`. Scoring is deterministic, so anyone can re-derive `report.md` from the saved
verdicts with no model and no network:

```bash
node score.mjs
```

## Honesty / scope

- **DO claim:** a reproducible instrument that quantifies verdict nondeterminism for an LLM grader on
  identical input, with by-construction ground truth and no model in the labeling or scoring path.
- **DO NOT claim:** that every grader is this unstable, or that a 3B local model is a stand-in for a
  frontier grader. The point is the measurement and the failure mode, not this one model's numbers. The
  flip rate depends on the model, the temperature, and the item. The instrument is what transfers.
- **Temperature is set on purpose.** Many production graders never pin temperature to 0, and even at 0 a
  hosted model is not bit-deterministic. The probe runs at a temperature a real deployment might use and
  says so. A grader you trust should survive repetition at its own settings.
