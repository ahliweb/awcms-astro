/**
 * Unit tests for `scripts/lib/obsidian-safety.mjs` — the pure validation
 * behind `knowledge:obsidian:export`'s staging -> validate -> allowlist-sync
 * boundary (issue #113).
 *
 * ## What this file proves
 *
 *   - `classifyEntry`: a symlink is REJECTED (escape vector — its target may
 *     resolve outside staging and this boundary never follows one); anything
 *     under a `.obsidian/` path segment is SKIPPED, not synced, not fatal
 *     (Obsidian's own app workspace/session state, which graphify legitimately
 *     writes); `.graphify_obsidian_manifest.json` is SKIPPED the same way
 *     (graphify's own export bookkeeping); an unexpected extension — no
 *     extension at all, `.json`, `.png` — is REJECTED, because this is an
 *     ALLOWLIST and anything unrecognised must be a hard failure rather than
 *     silently dropped or silently synced; a `.md` or `.canvas` file is
 *     allowlisted for SYNC, case-insensitively.
 *   - `resolveWithin`: the zip-slip / traversal guard — a `../` segment that
 *     escapes the root is rejected, an absolute-like escape is rejected, and
 *     an ordinary relative name (including one nested a level deep) resolves
 *     inside the root and is accepted.
 *   - `checkCuratedCollision`: a generated basename that matches a
 *     hand-written file already in `knowledge/curated/` is rejected (curated
 *     content is never overwritten by automation); anything else, including
 *     against an empty curated set, passes.
 *
 * ## What this file deliberately does NOT prove
 *
 * Every case here is driven as a literal value — a relative path string, a
 * boolean, a `Set` of basenames. No real staging tree, no real symlink on
 * disk, and no `graphify` binary are involved; that end-to-end wiring
 * (walking a real fixture tree, calling the real script, an actual `lstat`
 * telling a real symlink apart from a regular file) is
 * `tests/knowledge-obsidian-export.test.mjs`'s job, not this one's. This file
 * only proves the pure decision function returns the right verdict for a
 * given input — it says nothing about whether the caller ever supplies that
 * input correctly.
 */
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import {
  checkCuratedCollision,
  classifyEntry,
  resolveWithin
} from "../scripts/lib/obsidian-safety.mjs";

describe("classifyEntry", () => {
  test("a symlink is rejected regardless of its extension", () => {
    const verdict = classifyEntry("thing.md", true);
    assert.equal(verdict.action, "reject");
    assert.match(verdict.reason, /symlink/);
  });

  test("anything under a .obsidian/ segment is skipped, not rejected", () => {
    const verdict = classifyEntry(".obsidian/workspace.json", false);
    assert.equal(verdict.action, "skip");
    assert.match(verdict.reason, /workspace\/session state/);
  });

  test("a nested .obsidian/ segment is also skipped", () => {
    const verdict = classifyEntry("sub/.obsidian/plugins/x.json", false);
    assert.equal(verdict.action, "skip");
  });

  test("graphify's own export manifest is skipped, not a failure", () => {
    const verdict = classifyEntry(".graphify_obsidian_manifest.json", false);
    assert.equal(verdict.action, "skip");
    assert.match(verdict.reason, /bookkeeping/);
  });

  test("a .json file that is NOT the known manifest is rejected", () => {
    const verdict = classifyEntry("something-else.json", false);
    assert.equal(verdict.action, "reject");
    assert.match(verdict.reason, /unexpected extension/);
  });

  test("a .png file is rejected", () => {
    const verdict = classifyEntry("banner.png", false);
    assert.equal(verdict.action, "reject");
    assert.match(verdict.reason, /unexpected extension/);
  });

  test("a file with no extension at all is rejected", () => {
    const verdict = classifyEntry("Makefile", false);
    assert.equal(verdict.action, "reject");
    assert.match(verdict.reason, /\(none\)/);
  });

  test("a .md note is allowlisted for sync", () => {
    assert.equal(classifyEntry("note.md", false).action, "sync");
  });

  test("a .canvas file is allowlisted for sync", () => {
    assert.equal(classifyEntry("graph.canvas", false).action, "sync");
  });

  test("extension matching is case-insensitive", () => {
    assert.equal(classifyEntry("NOTE.MD", false).action, "sync");
  });
});

describe("resolveWithin — path traversal / output-outside-root guard", () => {
  const root = "/repo/graphify-out/obsidian-staging";

  test("an ordinary relative name resolves inside root", () => {
    const result = resolveWithin(root, "note.md");
    assert.equal(result.ok, true);
    assert.equal(result.absolute, "/repo/graphify-out/obsidian-staging/note.md");
  });

  test("a nested relative name still resolves inside root", () => {
    const result = resolveWithin(root, "sub/dir/note.md");
    assert.equal(result.ok, true);
    assert.equal(result.absolute, "/repo/graphify-out/obsidian-staging/sub/dir/note.md");
  });

  test("a ../ traversal that escapes root is rejected", () => {
    const result = resolveWithin(root, "../../etc/passwd");
    assert.equal(result.ok, false);
    assert.match(result.reason, /path traversal/);
  });

  test("a traversal that lands exactly on root itself is rejected", () => {
    const result = resolveWithin(root, ".");
    assert.equal(result.ok, false);
  });

  test("an absolute POSIX path outside root is rejected", () => {
    const result = resolveWithin(root, "/etc/passwd");
    assert.equal(result.ok, false);
  });

  test("a Windows-style absolute-looking escape is rejected", () => {
    // resolveWithin is exercised on this platform's own path semantics, but
    // the isAbsoluteLike() guard exists specifically for a relative() result
    // that LOOKS like a drive-qualified absolute path — assert it directly.
    const result = resolveWithin("C:\\vault", "..\\..\\Windows\\System32");
    assert.equal(result.ok, false);
  });
});

describe("checkCuratedCollision", () => {
  test("a generated basename colliding with a curated one is rejected", () => {
    const curated = new Set(["ownership-boundaries.md", "monorepo-map.md"]);
    const result = checkCuratedCollision("ownership-boundaries.md", curated);
    assert.equal(result.ok, false);
    assert.match(result.reason, /collides/);
  });

  test("a generated basename with no collision passes", () => {
    const curated = new Set(["ownership-boundaries.md"]);
    const result = checkCuratedCollision("some-generated-note.md", curated);
    assert.equal(result.ok, true);
  });

  test("an empty curated set never collides", () => {
    assert.equal(checkCuratedCollision("anything.md", new Set()).ok, true);
  });
});
