/**
 * files.mjs — filesystem reads shared by the scripts.
 *
 * ## Why this file exists
 *
 * `readFileIfPresent` was written twice, byte identical, in
 * `check-docs-translation.mjs` and `docs-i18n-stamp.mjs` — the checker and the
 * stamper for the same translation policy. Both docblocks stated the same
 * load-bearing reason for the narrowing, which is the tell that it is one rule
 * and not two.
 *
 * The drift that duplication invites here is specific and quiet: the stamper
 * writes a tree the checker then reads differently, and the disagreement
 * surfaces as "nothing to do" from one and "stale mirror" from the other, with
 * neither message naming the fact that they disagree.
 *
 * It lives here rather than in `docs-i18n-checks.mjs` because that module's
 * docblock draws a boundary — pure logic, no I/O — and a file read is exactly
 * the thing it keeps out. Keeping that boundary is worth one more small module.
 */

import { readFileSync } from "node:fs";

/**
 * Read a file, or return null when it is not there.
 *
 * Deliberately not `existsSync` + `readFileSync`: that pair is a
 * time-of-check/time-of-use race, and the failure it invites here is silent —
 * the check passes, the file disappears, and the read throws in the middle of a
 * multi-file rewrite, leaving the tree half-stamped.
 *
 * Only ENOENT becomes null. A directory, a permission error or a bad symlink
 * rethrows, because each of those means something a caller must not paper over
 * by treating the document as absent.
 *
 * @param {string} path
 * @returns {string | null}
 */
export function readFileIfPresent(path) {
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
