#!/usr/bin/env bun
/**
 * check-docs-translation.mjs — documentation translation gates (ADR-0039).
 *
 * ENGLISH at the bare path is the source; Indonesian at `<name>.id.md` is the
 * mirror, and the mirror records the hash of the English it was translated from.
 * The mechanism is `awcms` ADR-0097's, adopted whole; what differs here is the
 * scope (see `isInScope` in `lib/docs-i18n-checks.mjs`) and the ledger below.
 *
 * Two questions, kept separate on purpose (see `lib/docs-i18n-checks.mjs`):
 * whether an existing mirror is CURRENT, and which documents have NO mirror yet.
 *
 * Pure logic lives in `scripts/lib/docs-i18n-checks.mjs`; this file does I/O and
 * exit codes. Run: `bun run audit:translation`.
 *
 * The script name is English while its three siblings are not (`audit:konten`,
 * `audit:dokumen`, `audit:graf`). That is deliberate rather than careless: code
 * written after ADR-0039 is written in English, and naming this one `terjemahan`
 * would add a fourth entry to the debt the same ADR schedules for removal.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import {
  checkMirrorCoverage,
  checkTranslationPair,
  deriveSourcePath,
  isInScope
} from "./lib/docs-i18n-checks.mjs";

const ROOT = resolve(import.meta.dirname, "..");

/** @typedef {import("./lib/docs-i18n-checks.mjs").Problem} Problem */

/**
 * Documents still awaiting their Indonesian mirror.
 *
 * **This list may only SHRINK.** Removing an entry is how the migration records
 * progress; the gate rejects an entry whose mirror now exists, so the ledger
 * cannot overstate the debt and quietly stop being believed. Nothing new may be
 * added: a document written after ADR-0039 is written in English and mirrored in
 * the same change — ADR-0039 itself is the first, and it is deliberately not on
 * this list.
 *
 * It starts at 52 — every document in scope on the day the policy landed, since
 * this repo had no mirrored pair before it.
 */
export const DOCS_AWAITING_MIRROR = [];

/**
 * Every tracked-or-new markdown path, from git.
 *
 * `--others --exclude-standard` so a document added in THIS change is judged
 * before it is committed. Plain `git ls-files` sees only tracked files, so a
 * brand-new document would pass unexamined and fail for whoever ran the gate
 * next.
 *
 * @param {string} pattern
 * @returns {string[]}
 */
function gitList(pattern) {
  return execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", pattern],
    { cwd: ROOT, encoding: "utf8" }
  )
    .split("\n")
    .filter(Boolean);
}

/** @returns {string[]} English documents in scope. */
function listSources() {
  return gitList("*.md").filter(isInScope);
}

/**
 * @returns {string[]} `.id.md` mirrors present on disk.
 *
 * Untracked mirrors included, for the same reason as `listSources`: a pair
 * created in this change must be judged now. Enumerating sources one way and
 * mirrors the other would be worse than either — the coverage check would then
 * report a brand-new document as unmirrored while its mirror sat right there.
 */
function listMirrors() {
  return gitList("*.id.md");
}

/**
 * Read a file, or return null when it is not there.
 *
 * Deliberately not `existsSync` + `readFileSync`: that pair is a
 * time-of-check/time-of-use race, and this gate runs over a tree that git, an
 * editor, and `docs-i18n-stamp.mjs` may all be touching.
 *
 * @param {string} path
 * @returns {string | null}
 */
function readFileIfPresent(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      /** @type {NodeJS.ErrnoException} */ (error).code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

/** @returns {Problem[]} */
export function runChecks() {
  /** @type {Problem[]} */
  const problems = [];
  const mirrors = listMirrors();

  for (const mirrorPath of mirrors) {
    const sourcePath = deriveSourcePath(mirrorPath);
    if (!sourcePath) continue;

    const mirrorContent = readFileIfPresent(join(ROOT, mirrorPath));
    if (mirrorContent === null) continue;

    problems.push(
      ...checkTranslationPair(
        sourcePath,
        readFileIfPresent(join(ROOT, sourcePath)),
        mirrorPath,
        mirrorContent
      )
    );
  }

  problems.push(
    ...checkMirrorCoverage(listSources(), new Set(mirrors), DOCS_AWAITING_MIRROR)
  );

  return problems;
}

if (import.meta.main) {
  const problems = runChecks();

  if (problems.length > 0) {
    console.error(`audit:translation FAILED — ${problems.length} finding(s):`);
    for (const p of problems) console.error(`  - ${p.file}: ${p.message}`);
    process.exit(1);
  }

  const mirrored = listMirrors().length;
  console.log(
    `audit:translation OK — ${mirrored} mirror(s) current against their English ` +
      `source; ${DOCS_AWAITING_MIRROR.length} document(s) on the shrink-only ` +
      `translation ledger.`
  );
}
