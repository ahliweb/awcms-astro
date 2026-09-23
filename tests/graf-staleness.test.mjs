/**
 * Unit tests for `scripts/lib/graf-staleness.mjs`'s `diffManifestStaleness` —
 * the bounded content-staleness diff behind `audit:graf`'s `staleness` check
 * (issue #113).
 *
 * ## What this file proves
 *
 * Every case is driven with plain literal objects and an injected
 * `readFileBytes` stub — no real files, no `graphify-out/manifest.json` on
 * disk, no git. That is the whole point of `readFileBytes` being a parameter
 * rather than a real filesystem read: this module is pure, and this file
 * exercises exactly that purity.
 *
 *   - A candidate whose current bytes hash to the SAME value as the
 *     manifest's recorded `ast_hash` is neither `changed` nor `added` nor
 *     `removed` — an unchanged file must never count as drift.
 *   - A candidate whose current bytes hash DIFFERENTLY is `changed`.
 *   - A candidate path absent from the manifest entirely is `added`.
 *   - A manifest entry absent from the candidate set is `removed` — there is
 *     no separate existence check for this; the caller's `candidatePaths`
 *     already encodes "still tracked and still in scope", so a manifest path
 *     missing from it IS the removal, by construction.
 *   - The three counts are independent and additive: a single diff can
 *     contain a changed file, an added file, and a removed file all at once,
 *     and each only reflects its own condition.
 *   - A candidate that cannot be read at all (`readFileBytes` returns `null`)
 *     counts as `changed`, not silently ignored and not `removed` — an
 *     unreadable file is exactly the kind of thing this check exists to
 *     surface, not swallow.
 *   - Every returned array is sorted, regardless of input order.
 *
 * ## What this file deliberately does NOT prove
 *
 * The `MAX_STALE_FILES` bound, the violation message text, or the wiring that
 * decides WHICH paths are candidates in the first place (git-tracked, an
 * extension already indexed by the manifest, outside `graphify-out/**`,
 * `knowledge/generated/**`, `.changesets/**`, and not a `*.id.md` mirror) —
 * that decision belongs to `scripts/audit-graf.mjs`'s own
 * `kandidatDalamCakupan`/`auditKesegaranTerbatas`, and is proven by
 * `tests/audit-graf.test.mjs` against a real fixture tree and real `git`, not
 * here. This file also does not verify graphify's own MD5 choice — that
 * cross-check against the installed binary was done by hand once (see this
 * module's own docblock) and is not repeated by any automated test, since
 * `graphify` is not on CI's `PATH` at all.
 */
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { diffManifestStaleness } from "../scripts/lib/graf-staleness.mjs";

function md5(bytes) {
  return createHash("md5").update(bytes).digest("hex");
}

/** A `readFileBytes` stub driven by a plain path -> content map; a path absent from `map` reads as unreadable (`null`). */
function reader(map) {
  return (filePath) => (filePath in map ? map[filePath] : null);
}

describe("a matching hash", () => {
  test("counts as neither changed nor added nor removed", () => {
    const bytes = "unchanged content";
    const manifest = { "src/a.ts": { ast_hash: md5(bytes) } };

    const diff = diffManifestStaleness({
      manifest,
      candidatePaths: ["src/a.ts"],
      readFileBytes: reader({ "src/a.ts": bytes })
    });

    assert.deepEqual(diff, { changed: [], added: [], removed: [] });
  });
});

describe("a differing hash", () => {
  test("counts as changed", () => {
    const manifest = { "src/a.ts": { ast_hash: md5("original") } };

    const diff = diffManifestStaleness({
      manifest,
      candidatePaths: ["src/a.ts"],
      readFileBytes: reader({ "src/a.ts": "edited" })
    });

    assert.deepEqual(diff.changed, ["src/a.ts"]);
    assert.deepEqual(diff.added, []);
    assert.deepEqual(diff.removed, []);
  });

  test("an unreadable candidate (readFileBytes returns null) also counts as changed, not removed", () => {
    const manifest = { "src/a.ts": { ast_hash: md5("original") } };

    const diff = diffManifestStaleness({
      manifest,
      candidatePaths: ["src/a.ts"],
      readFileBytes: reader({})
    });

    assert.deepEqual(diff.changed, ["src/a.ts"]);
    assert.deepEqual(diff.removed, []);
  });
});

describe("a candidate absent from the manifest", () => {
  test("counts as added", () => {
    const manifest = { "src/a.ts": { ast_hash: md5("a") } };

    const diff = diffManifestStaleness({
      manifest,
      candidatePaths: ["src/a.ts", "src/new.ts"],
      readFileBytes: reader({ "src/a.ts": "a", "src/new.ts": "brand new" })
    });

    assert.deepEqual(diff.added, ["src/new.ts"]);
    assert.deepEqual(diff.changed, []);
    assert.deepEqual(diff.removed, []);
  });
});

describe("a manifest entry absent from the candidate set", () => {
  test("counts as removed, with no separate existence check needed", () => {
    const manifest = {
      "src/a.ts": { ast_hash: md5("a") },
      "src/gone.ts": { ast_hash: md5("gone") }
    };

    const diff = diffManifestStaleness({
      manifest,
      candidatePaths: ["src/a.ts"], // src/gone.ts is not a candidate any more
      readFileBytes: reader({ "src/a.ts": "a" })
    });

    assert.deepEqual(diff.removed, ["src/gone.ts"]);
    assert.deepEqual(diff.changed, []);
  });
});

describe("counts are independent and additive", () => {
  test("a changed, an added, and a removed file can all appear in one diff", () => {
    const manifest = {
      "src/a.ts": { ast_hash: md5("original-a") }, // will be changed
      "src/gone.ts": { ast_hash: md5("gone") } // will be removed
    };

    const diff = diffManifestStaleness({
      manifest,
      candidatePaths: ["src/a.ts", "src/new.ts"], // src/new.ts will be added
      readFileBytes: reader({ "src/a.ts": "edited-a", "src/new.ts": "brand new" })
    });

    assert.deepEqual(diff, {
      changed: ["src/a.ts"],
      added: ["src/new.ts"],
      removed: ["src/gone.ts"]
    });
  });

  test("every returned array is sorted regardless of input order", () => {
    const manifest = {
      "src/z.ts": { ast_hash: md5("z") },
      "src/gone-z.ts": { ast_hash: md5("gz") },
      "src/gone-a.ts": { ast_hash: md5("ga") }
    };

    const diff = diffManifestStaleness({
      manifest,
      candidatePaths: ["src/z.ts", "src/new-z.ts", "src/new-a.ts"],
      readFileBytes: reader({
        "src/z.ts": "edited",
        "src/new-z.ts": "n",
        "src/new-a.ts": "n"
      })
    });

    assert.deepEqual(diff.changed, ["src/z.ts"]);
    assert.deepEqual(diff.added, ["src/new-a.ts", "src/new-z.ts"]);
    assert.deepEqual(diff.removed, ["src/gone-a.ts", "src/gone-z.ts"]);
  });

  test("an empty manifest and an empty candidate set yield an empty diff", () => {
    const diff = diffManifestStaleness({ manifest: {}, candidatePaths: [], readFileBytes: reader({}) });
    assert.deepEqual(diff, { changed: [], added: [], removed: [] });
  });
});
