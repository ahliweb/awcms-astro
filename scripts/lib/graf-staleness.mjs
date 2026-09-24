/**
 * graf-staleness.mjs — pure diff behind `audit:graf`'s bounded content
 * staleness check.
 *
 * ## What question this answers
 *
 * `graphify extract`'s own incremental-update state (`manifest.json`)
 * records one `ast_hash` per file it indexed. That hash is a plain MD5 of
 * the file's RAW BYTES — `hashlib.md5(usedforsecurity=False)` in graphify
 * itself, verified directly against the installed `graphify` 0.9.35 by
 * hand-checking a tracked file's `md5sum` against its own recorded
 * `ast_hash` (they matched, 195/219 on the tree this module was written
 * against). It is therefore reproducible in plain Node/Bun with
 * `node:crypto`, with no `graphify` install, no Python, and no network —
 * exactly what `audit:graf` needs, since `graphify` is not on CI's `PATH`.
 *
 * `diffManifestStaleness` compares the manifest's recorded hashes against
 * the CURRENT tree and reports what moved:
 *
 *   - **changed** — a candidate the manifest already knows about, whose
 *     current bytes hash differently (or could not be read at all, which is
 *     treated as changed rather than silently ignored).
 *   - **added** — a candidate not yet in the manifest at all.
 *   - **removed** — a manifest entry that is no longer a candidate: deleted,
 *     moved out of scope, no longer git-tracked, or newly excluded. There is
 *     no separate existence check for this — the caller's `candidatePaths`
 *     already encodes "still tracked and still in scope", so a manifest path
 *     missing from it IS the removal.
 *
 * ## Why this is pure
 *
 * The only filesystem access is `readFileBytes`, supplied by the caller
 * (`scripts/audit-graf.mjs`'s runner). That keeps this module testable with
 * plain objects and a stub callback — `tests/graf-staleness.test.mjs` drives
 * every case as a literal, with no fixture tree on disk. Deciding WHICH
 * paths are candidates (git-tracked, extension already seen in the manifest,
 * outside `graphify-out/**`, `knowledge/generated/**`, `.changesets/**`, and
 * `*.id.md`) is `scripts/audit-graf.mjs`'s job, not this module's — this
 * function only ever sees the finished candidate set.
 */
import { createHash } from "node:crypto";

/** @typedef {{ changed: string[], added: string[], removed: string[] }} StalenessDiff */

/**
 * @param {object} args
 * @param {Record<string, { ast_hash?: string }>} args.manifest - parsed
 *   `graphify-out/manifest.json`, a flat object keyed by repo-relative path
 * @param {readonly string[]} args.candidatePaths - every path this gate
 *   currently considers a staleness candidate (already filtered by the
 *   caller: git-tracked, in scope, extension the manifest already indexes)
 * @param {(filePath: string) => Buffer | Uint8Array | string | null} args.readFileBytes -
 *   raw bytes of a candidate path, or `null` when it cannot be read (e.g. a
 *   working-tree deletion `git ls-files` has not caught up to)
 * @returns {StalenessDiff} each array sorted
 */
export function diffManifestStaleness({ manifest, candidatePaths, readFileBytes }) {
  const candidateSet = new Set(candidatePaths);

  const changed = [];
  const removed = [];

  for (const filePath of Object.keys(manifest)) {
    if (!candidateSet.has(filePath)) {
      removed.push(filePath);
      continue;
    }

    const bytes = readFileBytes(filePath);
    const hash = bytes === null || bytes === undefined ? null : createHash("md5").update(bytes).digest("hex");

    if (hash === null || hash !== manifest[filePath]?.ast_hash) {
      changed.push(filePath);
    }
  }

  // `Object.hasOwn`, not `in`: `manifest` is parsed JSON and therefore carries
  // Object.prototype, so `"constructor" in manifest` is true for a file this
  // manifest has never seen — an added file silently counted as known.
  const added = candidatePaths.filter((filePath) => !Object.hasOwn(manifest, filePath));

  return { changed: changed.sort(), added: [...added].sort(), removed: removed.sort() };
}
