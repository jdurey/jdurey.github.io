#!/usr/bin/env node
// report.mjs — render markdown tables from results.json. Numbers come straight from
// the run; nothing is hand-typed. Writes results/report.md and prints it.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const r = JSON.parse(await readFile(path.join(HERE, "results/results.json"), "utf8"));

const modelLabel = Object.fromEntries(r.models.map((m) => [m.key, m.label]));
const order = r.table.map((t) => t.model);

// 1) ranked table
let md = "### Ranked collapse table\n\n";
md += "| Rank | Model | Collapse rate | Collapsed | Held | Refused / off-format |\n";
md += "|---|---|---|---|---|---|\n";
r.table.forEach((t, i) => {
  md += `| ${i + 1} | ${t.label} | **${t.collapseRate ?? "—"}%** | ${t.collapse} | ${t.hold} | ${t.other} |\n`;
});

// 2) per-class breakdown (collapse count per model per class)
const classes = [...new Set(r.matrix.map((m) => m.class))];
md += "\n### Collapse by attack class (count of models' collapses per class)\n\n";
md += "| Attack class | " + order.map((m) => modelLabel[m].split(" (")[0]).join(" | ") + " |\n";
md += "|---|" + order.map(() => "---").join("|") + "|\n";
for (const c of classes) {
  const row = order.map((mk) => {
    const cell = r.matrix.filter((m) => m.class === c && m.model === mk);
    const col = cell.filter((m) => m.verdict === "collapse").length;
    const tot = cell.length;
    return `${col}/${tot}`;
  });
  md += `| ${c} | ${row.join(" | ")} |\n`;
}

// 3) per-scenario matrix (compact: C/H/O)
md += "\n### Full per-scenario matrix\n\n";
const sym = { collapse: "✗ collapse", hold: "✓ hold", other: "· other" };
const scens = [...new Set(r.matrix.map((m) => m.scenario))];
md += "| Scenario | " + order.map((m) => m).join(" | ") + " |\n";
md += "|---|" + order.map(() => "---").join("|") + "|\n";
for (const s of scens) {
  const row = order.map((mk) => {
    const cell = r.matrix.find((m) => m.scenario === s && m.model === mk);
    return cell ? sym[cell.verdict] : "—";
  });
  md += `| \`${s}\` | ${row.join(" | ")} |\n`;
}

await writeFile(path.join(HERE, "results/report.md"), md);
console.log(md);
