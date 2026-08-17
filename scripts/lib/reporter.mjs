/**
 * reporter.mjs — the finding/diagnostic apparatus the audit gates share.
 *
 * ## Why this file exists
 *
 * Three gates — `audit-konten.mjs`, `audit-dokumen.mjs`, `audit-graf.mjs` —
 * each carried their own copy of the same twenty lines: a `temuan` array, a
 * `catatan` array, a `langgar()` push, and a printer that groups findings by
 * gate name and exits 1. `diff` proved two of the three printer blocks byte
 * identical and the third different by a single JSDoc line.
 *
 * The cost is not the duplication itself, which is small and was stable. It is
 * that any change to gate OUTPUT has to be made three times and re-made three
 * times: a `--format=json` mode for CI annotations, a stable summary line for
 * the `awcms-astro-gerbang` skill to read, a machine-readable count. Three
 * copies means the third one is the one that does not get changed, and a gate
 * whose output shape differs from its siblings is a gate whose consumers
 * special-case it forever.
 *
 * ## What is preserved exactly, and why
 *
 * The printed output is unchanged, byte for byte, including the Indonesian
 * summary lines. That is deliberate and is not an oversight against
 * `AGENTS.md` §Language: **this change is structural, and mixing a structural
 * refactor with a user-visible message change makes both unreviewable.** The
 * message language is tracked separately, as is the fact that the rule
 * currently has no checker.
 *
 * Two behaviours are load bearing and were kept on purpose:
 *
 *   - **Notes print whatever the outcome.** The Definition of Done depends on
 *     it: a gate that runs zero checks and says nothing is indistinguishable
 *     from a gate that ran and found nothing. Every `catat()` line survives to
 *     stdout even on the green path.
 *   - **The header prints on construction**, before any audit runs. Two of the
 *     three gates used to print it last, so a crash mid-audit produced a stack
 *     trace with nothing above it naming which gate died. Printing first costs
 *     nothing and is the only difference in output ORDER this module
 *     introduces — the sequence header → notes → verdict is what all three
 *     already emitted.
 *
 * ## What is deliberately NOT here
 *
 *   - **No severity levels.** These gates are binary by design: a finding
 *     reddens the gate. A severity axis invites a "warning" tier, and a warning
 *     that never fails anything is a line nobody reads.
 *   - **No `process.exitCode` assignment.** `finish()` exits, so a gate cannot
 *     accidentally continue past its own verdict and overwrite it.
 */

/** @typedef {{ gate: string, file: string, message: string }} Finding */

/**
 * Render a gate's result. Pure, so the format has a checker that does not need
 * to spawn a subprocess and read stdout.
 *
 * @param {string[]} notes - printed whatever the outcome
 * @param {Finding[]} findings
 * @returns {{ text: string, exitCode: number }}
 */
export function formatReport(notes, findings) {
  const lines = notes.map((note) => `  ${note}`);

  if (findings.length === 0) {
    lines.push("", "✓ Tidak ada pelanggaran.");
    return { text: lines.join("\n"), exitCode: 0 };
  }

  lines.push("", `✗ ${findings.length} pelanggaran:`, "");

  // Grouped by gate so a single cause reads as one block rather than as N
  // findings scattered among its siblings. Insertion order is the order the
  // gates ran, which is the order the file declares them.
  /** @type {Map<string, Finding[]>} */
  const byGate = new Map();
  for (const finding of findings) {
    const existing = byGate.get(finding.gate);
    if (existing) existing.push(finding);
    else byGate.set(finding.gate, [finding]);
  }

  for (const [gate, list] of byGate) {
    lines.push(`  [${gate}] ${list.length}`);
    for (const { file, message } of list) lines.push(`    ${file}: ${message}`);
    lines.push("");
  }

  return { text: lines.join("\n"), exitCode: 1 };
}

/**
 * Start a gate's report. Prints the header immediately.
 *
 * @param {string} name - the gate's name, e.g. `"audit graf"`
 * @returns {{
 *   violation: (gate: string, file: string, message: string) => void,
 *   note: (line: string) => void,
 *   count: () => number,
 *   finish: () => never
 * }}
 */
export function createReporter(name) {
  console.log(`── ${name} ──`);

  /** @type {Finding[]} */
  const findings = [];
  /** @type {string[]} */
  const notes = [];

  return {
    violation(gate, file, message) {
      findings.push({ gate, file, message });
    },

    note(line) {
      notes.push(line);
    },

    count() {
      return findings.length;
    },

    /**
     * Print and exit. Never returns, so nothing can run after a verdict and
     * change it.
     */
    finish() {
      const { text, exitCode } = formatReport(notes, findings);
      console.log(text);
      process.exit(exitCode);
    }
  };
}
