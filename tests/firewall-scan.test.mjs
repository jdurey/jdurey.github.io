#!/usr/bin/env node
// Regression tests for the firewall scanner. Each fix from the adversarial harden
// pass should add a case here. Run: node tests/firewall-scan.test.mjs
import { scanLine, loadDenylist } from "../scripts/firewall-scan.mjs";

const dl = loadDenylist();
let pass = 0,
  fail = 0;

function expect(name, line, shouldBlock) {
  const hits = scanLine(line, dl);
  const blocked = hits.length > 0;
  const ok = blocked === shouldBlock;
  if (ok) pass++;
  else {
    fail++;
    console.error(`FAIL: ${name}\n  line: ${JSON.stringify(line)}\n  expected block=${shouldBlock}, got hits=${JSON.stringify(hits.map((h) => h.term))}`);
  }
}

// --- must BLOCK (leaks) ---
expect("employer name", "I worked at Alpha School on curriculum.", true);
expect("employer spaced variant", "two hour learning was the program.", true);
expect("email domain", "reach me at joshua.durey@alpha.school", true);
expect("person name", "per Bernhard's direction", true);
expect("internal codename forge", "we ran it through the incompressible forge", true);
expect("internal taxonomy", "the ARF flaw class", true);
expect("dri token", "the SS DRI workspace", true);
expect("home path leak", "/Users/user/Library/secret", true);
expect("vault name", "synced to my second brain", true);
expect("bare alpha standalone", "the alpha cohort results", true);

// --- must NOT block (legitimate) ---
expect("alpha release phrase", "this shipped as an alpha release in 2024", false);
expect("alphanumeric", "an alphanumeric token", false);
expect("alphafold", "comparable to AlphaFold's approach", false);
expect("public substrate naep", "scored against NAEP reading items", false);
expect("public substrate staar", "we used public STAAR passages", false);
expect("greek-ish word alphabet", "the alphabet of failure modes", false);
expect("plain eval text", "all four models faced identical inputs simultaneously", false);
expect("plain systems text", "a local Whisper model handles transcription", false);
expect("normal sentence", "reproducible or it did not happen", false);
// regression: over-broad rules must not brick legitimate English (caught on first build)
expect("single source of truth phrase", "one file is the single source of truth", false);
expect("qc log phrase", "the QC log showed three regressions", false);
expect("drive watch phrase", "a drive watch folder for inbound files", false);
// ...but the internal file-token form must still block
expect("source_of_truth file token", "see SOURCE_OF_TRUTH.md for the canon", true);
expect("qc_log file token", "appended to QC_LOG.md", true);

console.log(`\nfirewall-scan tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
