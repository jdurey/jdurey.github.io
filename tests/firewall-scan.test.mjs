#!/usr/bin/env node
// Regression tests for the firewall scanner. Every adversarial finding (Grok + Codex,
// 2026-06-19) has a case here. A fix without a test is how the next leak gets through.
// Run: node tests/firewall-scan.test.mjs
import { scanLine, loadDenylist } from "../scripts/firewall-scan.mjs";

const dl = loadDenylist();
let pass = 0,
  fail = 0;

function expect(name, line, shouldBlock) {
  const hits = scanLine(line, dl);
  const blocked = hits.length > 0;
  if (blocked === shouldBlock) pass++;
  else {
    fail++;
    console.error(`FAIL: ${name}\n  line: ${JSON.stringify(line)}\n  expected block=${shouldBlock}, got hits=${JSON.stringify(hits.map((h) => `${h.rule}:${h.term}`))}`);
  }
}

// ===== MUST BLOCK — baseline leaks =====
expect("employer name", "I worked at Alpha School on curriculum.", true);
expect("employer spaced", "two hour learning was the program.", true);
expect("email domain", "reach me at joshua.durey@alpha.school", true);
expect("email other localpart", "contact: jane@alpha.school", true);
expect("person bernhard", "per Bernhard's direction", true);
expect("person bill brooks", "reporting to Bill Brooks on academics", true);
expect("codename forge", "we ran it through the incompressible forge", true);
expect("dri token ss", "the SS DRI workspace", true);
expect("home path leak", "/Users/user/Library/secret", true);
expect("bare alpha employer", "the alpha cohort results", true);

// ===== MUST BLOCK — adversarial bypasses (Grok + Codex) =====
expect("FN1 allowlist substring ride", "At Alpha we alpha tested the FRQ harness.", true);
expect("FN2 greek homoglyph", "I led curriculum at Αlpha School for two years.", true);
expect("FN2b cyrillic homoglyph", "worked at аlpha school last year", true);
expect("FN3 zero-width split", "I worked at al​pha school on eval.", true);
expect("FN4 html entity dec", "Employer: &#97;lpha School (confidential).", true);
expect("FN4b html entity dec 65", "Case study: &#65;lpha School pilot.", true);
expect("FN4c html entity hex", "at &#x61;lpha school", true);
expect("FN5 tag split", "At <span>A</span>lpha School I led eval.", true);
expect("FN5b multi-tag split", "<span>Al</span><span>pha</span> School pilot.", true);
expect("FN6 hyphen employer", "Built systems at 2-hour-learning.", true);
expect("FN6b two-hour learning", "a 2-hour learning model using public data", true);
expect("FN7 spaced file token", "Canon lives in SOURCE OF TRUTH.md", true);
expect("FN7b underscore file token", "see SOURCE_OF_TRUTH.md for canon", true);
expect("FN7c qc_log file", "appended to QC_LOG.md", true);
expect("FN9 fullwidth digit", "２hr Learning program.", true);
expect("FN10 leetspeak", "Prior role: 4lpha School curriculum lead.", true);
expect("FN11 spaced codename", "My soft landing job search pipeline.", true);
expect("FN12 base64 employer", "Note: YWxwaGEgc2Nob29s", true);
expect("FN16 percent-encoded email", '<a href="mailto:joshua.durey%40%61lpha.school">x</a>', true);
expect("FN21 spaced federation name", "Part of the AI OS federation layer.", true);
expect("DRI in QC context", "DRI distractor leakage in the rubric", true);

// ===== MUST NOT BLOCK — legitimate clean-room prose =====
expect("alpha release", "this shipped as an alpha release in 2024", false);
expect("alphanumeric", "an alphanumeric token", false);
expect("alphafold", "comparable to AlphaFold's approach", false);
expect("public NAEP", "scored against NAEP reading items", false);
expect("public STAAR", "we used public STAAR passages", false);
expect("alphabet metaphor", "the alphabet of failure modes", false);
expect("plain eval text", "all four models faced identical inputs simultaneously", false);
expect("plain systems text", "a local Whisper model handles transcription", false);
expect("normal sentence", "reproducible or it did not happen", false);
expect("single source of truth", "one file is the single source of truth", false);
expect("qc log prose", "the QC log showed three regressions", false);
expect("drive watch prose", "a drive watch folder for inbound files", false);
expect("FP13 strategy alpha", "We measured strategy alpha against the S&P benchmark.", false);
expect("FP13b cronbach alpha", "We report Cronbach's alpha for rubric reliability.", false);
expect("FP13c significance alpha", "we set the significance alpha = 0.05 threshold", false);
expect("FP14 FOM acronym", "Retail investors cite FOM as a bias.", false);
expect("FP15 DRI driver", "Updated the DRI driver on Linux.", false);
expect("FP15b DRI owner", "each scenario names a DRI owner and rollback step", false);
// arf/gdf/fom are the feedback-integrity harness's PUBLISHED method taxonomy (reviewed 2026-06-20) —
// they must publish even in QC context. 'dri' stays gated (above). See denylist _doc_contextGated.
expect("FP19 ARF published taxonomy", "the ARF flaw class in the feedback ledger", false);
expect("FP20 GDF published taxonomy", "a GDF ghost-distractor in the rubric feedback", false);
expect("FP21 FOM published taxonomy", "FOM means the feedback explains a different option", false);
expect("FP16 fantasy trilogy", "A classic fantasy trilogy structure.", false);
expect("FP17 forge metaphor", "the CI runner is the forge where prompts are tested", false);
expect("FP18 target tracker", "Built a target tracker for outreach campaigns.", false);
expect("FP19 alpha-numeric hyphen", "alpha-numeric tokenization in the parser.", false);
expect("FP20 second brain PKM", "Tiago Forte's second brain method is public PKM.", false);

// ===== MUST BLOCK — leaked credentials (so no one can use Josh's agents from the repo) =====
expect("openai key", "OPENAI_API_KEY=sk-abcdefghijklmnopqrstuvwxyz0123456789", true);
expect("anthropic key", "key: sk-ant-api03-AAaa11bbCCdd22eeFFgg33hh", true);
expect("github token", "token ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", true);
expect("github pat", "github_pat_11ABCDEFG0aaaaaaaaaaaa_bbbbbbbbbbbbbbbbbbbbbb", true);
expect("xai key", "XAI_API_KEY=xai-ABCDEFGHIJKLMNOPQRSTUV", true);
expect("google key", "GEMINI: AIzaSyD-ABCDEFGHIJKLMNOPQRSTUVWXYZ012", true);
expect("aws key id", "aws AKIAIOSFODNN7EXAMPLE here", true);
expect("private key header", "-----BEGIN OPENSSH PRIVATE KEY-----", true);
// ...but ordinary text with these letters must not block
expect("sk- prose", "the task was sketched out", false);
expect("token prose", "tokens are for judgment, not plumbing", false);

console.log(`\nfirewall-scan tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
