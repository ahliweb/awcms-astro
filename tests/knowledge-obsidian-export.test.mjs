/**
 * End-to-end behaviour of `scripts/knowledge-obsidian-export.mjs` — the
 * staging -> validate -> allowlist-sync wrapper around `graphify export
 * obsidian` (issue #113).
 *
 * ## Why this runs the REAL script
 *
 * `tests/obsidian-safety.test.mjs` already proves the pure decision function
 * returns the right verdict for a given literal input. It proves nothing
 * about whether the wrapper script actually WALKS a real directory tree with
 * real `lstatSync`, actually creates a real symlink, actually aborts before
 * writing a single byte, and actually leaves `knowledge/curated/` untouched —
 * all filesystem behaviour that only exists once the script runs for real.
 * So this file drives `Bun.spawnSync(["bun", SCRIPT], …)` against a disposable
 * `mkdtempSync` fixture tree, with `KNOWLEDGE_GRAPH_ROOT` pointed at it so the
 * script never touches this repo's own `knowledge/`.
 *
 * `graphify` itself is not installed in CI (see AGENTS.md and the script's own
 * docblock), so every case supplies a tiny fake `graphify` — a shell script
 * placed in its own temp bin dir and prepended to `PATH` — that does nothing
 * but write whatever the case needs into the `--dir` staging directory it was
 * given. This exercises the wrapper's real staging/validate/sync logic without
 * needing the real exporter at all.
 *
 * ## What this file proves
 *
 *   - A clean export syncs only `.md`/`.canvas` files, and reports how many
 *     housekeeping entries (`.obsidian/**`, the export manifest) it skipped.
 *   - A staged symlink aborts the ENTIRE sync with exit 1 — nothing at all is
 *     written to `knowledge/generated/graphify/`, not even the other,
 *     otherwise-valid entries in the same run. A partial sync that silently
 *     dropped the bad entry would be worse than one that wrote nothing and
 *     said why.
 *   - A staged file with a disallowed extension aborts the same way.
 *   - A staged name colliding with a file already in `knowledge/curated/`
 *     aborts the same way, and `knowledge/curated/` itself is provably
 *     byte-for-byte unchanged afterwards — this is an explicit acceptance
 *     criterion of issue #113, not an implementation detail.
 *   - A stale note left over from a previous run (a node the CURRENT export no
 *     longer produces) is cleared on a fresh, successful sync.
 *   - `.obsidian/` staged state is never synced, on a run that otherwise
 *     succeeds.
 *   - The script exits 1 with a clear, actionable message when
 *     `graphify-out/graph.json` does not exist yet, without even attempting
 *     to invoke `graphify`.
 *
 * ## What this file deliberately does NOT prove
 *
 * The real `graphify export obsidian` command's own behaviour, output shape,
 * or CLI flags — the fake binary here is a stand-in whose only job is to put
 * files where the wrapper expects them, not a model of graphify itself. Nor
 * does it prove anything about `scripts/lib/obsidian-safety.mjs`'s verdicts in
 * isolation — that is `tests/obsidian-safety.test.mjs`'s job; this file only
 * proves the wrapper script wires those verdicts into real filesystem
 * consequences correctly.
 */
import { afterEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..");
const EXPORT_SCRIPT = join(REPO_ROOT, "scripts/knowledge-obsidian-export.mjs");

/** @type {string[]} */
const cleanup = [];
afterEach(() => {
  while (cleanup.length) rmSync(cleanup.pop(), { recursive: true, force: true });
});

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function fakeGraph(nodeCount = 1) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `n${i}`,
    community: 0,
    community_name: "Fixture Community",
    source_file: `src/thing${i}.ts`
  }));
  return JSON.stringify({ built_at_commit: "0".repeat(40), directed: false, nodes, links: [] });
}

/**
 * Writes a fake `graphify` executable into `dir` whose `export obsidian --dir
 * X` subcommand runs the given shell body against `X`. The body receives `$1`
 * as the resolved staging directory.
 */
function fakeGraphifyBin(dir, stageBody) {
  const binPath = join(dir, "graphify");
  write(
    binPath,
    `#!/usr/bin/env bash
set -euo pipefail
cmd="$1"; shift
if [ "$cmd" = "export" ] && [ "$1" = "obsidian" ]; then
  shift
  dir=""
  while [ "$#" -gt 0 ]; do
    if [ "$1" = "--dir" ]; then dir="$2"; shift 2; else shift; fi
  done
  ${stageBody.replaceAll("$STAGE", '"$dir"')}
  exit 0
else
  echo "fake graphify: unsupported command: $cmd $*" >&2
  exit 1
fi
`
  );
  chmodSync(binPath, 0o755);
}

function buildFixture(nodeCount = 1) {
  const root = mkdtempSync(join(tmpdir(), "knowledge-obsidian-export-"));
  cleanup.push(root);
  write(join(root, "graphify-out/graph.json"), fakeGraph(nodeCount));
  return root;
}

function makeFakeBinDir() {
  const dir = mkdtempSync(join(tmpdir(), "fake-graphify-"));
  cleanup.push(dir);
  return dir;
}

function runExport(fixtureRoot, fakeBinDir) {
  const result = Bun.spawnSync(["bun", EXPORT_SCRIPT], {
    cwd: fixtureRoot,
    env: { ...process.env, PATH: `${fakeBinDir}:${process.env.PATH}`, KNOWLEDGE_GRAPH_ROOT: fixtureRoot },
    stdout: "pipe",
    stderr: "pipe"
  });
  return { code: result.exitCode, output: result.stdout.toString() + result.stderr.toString() };
}

describe("a clean export", () => {
  test("syncs only .md/.canvas and reports the housekeeping it skipped", () => {
    const fixtureRoot = buildFixture(1);
    const binDir = makeFakeBinDir();
    fakeGraphifyBin(
      binDir,
      `mkdir -p $STAGE/.obsidian
printf '# note\\n' > $STAGE/thing0.md
printf '{}' > $STAGE/graph.canvas
printf '{}' > $STAGE/.obsidian/workspace.json
printf '{"files":[]}' > $STAGE/.graphify_obsidian_manifest.json`
    );

    const { code, output } = runExport(fixtureRoot, binDir);

    assert.equal(code, 0, output);
    assert.match(output, /2 file\(s\) synced/);
    assert.match(output, /2 housekeeping entr/);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify/thing0.md")), true);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify/graph.canvas")), true);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify/.obsidian")), false);
    assert.equal(
      existsSync(join(fixtureRoot, "knowledge/generated/graphify/.graphify_obsidian_manifest.json")),
      false
    );
  });
});

describe("a staged symlink aborts the entire sync", () => {
  test("exit 1, nothing written, even alongside an otherwise-valid entry", () => {
    const fixtureRoot = buildFixture(1);
    const binDir = makeFakeBinDir();
    fakeGraphifyBin(
      binDir,
      `printf '# good\\n' > $STAGE/good.md
ln -s /etc/passwd $STAGE/escape.md`
    );

    const { code, output } = runExport(fixtureRoot, binDir);

    assert.equal(code, 1);
    assert.match(output, /symlink/);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify")), false);
  });
});

describe("a staged disallowed extension aborts the entire sync", () => {
  test("exit 1, nothing written", () => {
    const fixtureRoot = buildFixture(1);
    const binDir = makeFakeBinDir();
    fakeGraphifyBin(
      binDir,
      `printf '# good\\n' > $STAGE/good.md
printf '#!/bin/sh\\n' > $STAGE/payload.sh`
    );

    const { code, output } = runExport(fixtureRoot, binDir);

    assert.equal(code, 1);
    assert.match(output, /unexpected extension/);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify")), false);
  });
});

describe("a curated-name collision aborts the entire sync", () => {
  test("exit 1, nothing written, and knowledge/curated/ is untouched", () => {
    const fixtureRoot = buildFixture(1);
    const curatedPath = join(fixtureRoot, "knowledge/curated/ownership-boundaries.md");
    const curatedContent = "# Ownership boundaries\n\nhand-written, never touched by automation.\n";
    write(curatedPath, curatedContent);

    const binDir = makeFakeBinDir();
    fakeGraphifyBin(
      binDir,
      `printf '# generated\\n' > $STAGE/ownership-boundaries.md`
    );

    const { code, output } = runExport(fixtureRoot, binDir);

    assert.equal(code, 1);
    assert.match(output, /collides/);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify")), false);
    // Explicit acceptance criterion: curated/ is byte-for-byte unchanged.
    assert.equal(readFileSync(curatedPath, "utf8"), curatedContent);
  });
});

describe("knowledge/curated/ survives a successful export unchanged", () => {
  test("byte-for-byte, on a full run that also syncs generated output", () => {
    const fixtureRoot = buildFixture(1);
    const curatedPath = join(fixtureRoot, "knowledge/curated/hand-written.md");
    const curatedContent = "# Hand-written\n\nnever a sync target.\n";
    write(curatedPath, curatedContent);

    const binDir = makeFakeBinDir();
    fakeGraphifyBin(binDir, `printf '# generated\\n' > $STAGE/generated-note.md`);

    const { code } = runExport(fixtureRoot, binDir);

    assert.equal(code, 0);
    assert.equal(readFileSync(curatedPath, "utf8"), curatedContent);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify/generated-note.md")), true);
  });
});

describe("the .canvas gap: curated collision check now covers every allowlisted extension", () => {
  test("a hand-written knowledge/curated/notes.canvas colliding with a staged notes.canvas aborts the whole sync", () => {
    // Before fix 3, `checkCuratedCollision`'s basename set was built only
    // from `.md` files in knowledge/curated/, so a hand-written `.canvas`
    // file there was invisible to the check entirely — a generated canvas of
    // the same name would silently overwrite it. `.canvas` is a real
    // syncable output (`graphify export obsidian` really emits
    // `graph.canvas`), so this is not a hypothetical extension.
    const fixtureRoot = buildFixture(1);
    const curatedPath = join(fixtureRoot, "knowledge/curated/notes.canvas");
    const curatedContent = '{"nodes":[],"edges":[],"__marker":"hand-written, never touched by automation"}';
    write(curatedPath, curatedContent);

    const binDir = makeFakeBinDir();
    fakeGraphifyBin(binDir, `printf '{"nodes":[],"edges":[]}' > $STAGE/notes.canvas`);

    const { code, output } = runExport(fixtureRoot, binDir);

    assert.equal(code, 1);
    assert.match(output, /collides/);
    assert.match(output, /notes\.canvas/);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify")), false);
    // Explicit acceptance criterion, same as the .md collision case: the
    // curated file itself must be byte-for-byte untouched.
    assert.equal(readFileSync(curatedPath, "utf8"), curatedContent);
  });
});

describe("a zero-output export is refused before the clear step (fix 4)", () => {
  test("graphify exiting 0 while staging nothing syncable is refused with exit 1, and pre-existing generated/ contents survive", () => {
    // Before fix 4, an export that staged only housekeeping (or nothing at
    // all) still passed the `graphify export obsidian` exit-code check, then
    // proceeded to CLEAR knowledge/generated/graphify/ before discovering
    // there was nothing to copy back — reporting "OK — 0 file(s) synced" and
    // leaving the vault empty. The fix moves that check before the clear
    // step. This test plants a pre-existing generated file first, so a
    // regression back to the old behaviour would delete it — the concrete,
    // observable consequence the fix exists to prevent.
    const fixtureRoot = buildFixture(1);
    const survivorPath = join(fixtureRoot, "knowledge/generated/graphify/survivor.md");
    const survivorContent = "# survivor\n\nmust still be here after a refused zero-output export.\n";
    write(survivorPath, survivorContent);

    const binDir = makeFakeBinDir();
    // The fake exporter stages only housekeeping — an .obsidian/ path and the
    // export manifest — exactly the "graphify exited 0 but produced no
    // syncable file" case fix 4 targets.
    fakeGraphifyBin(
      binDir,
      `mkdir -p $STAGE/.obsidian
printf '{}' > $STAGE/.obsidian/workspace.json
printf '{"files":[]}' > $STAGE/.graphify_obsidian_manifest.json`
    );

    const { code, output } = runExport(fixtureRoot, binDir);

    assert.equal(code, 1);
    assert.match(output, /produced no syncable file/);
    // The point of fix 4: the pre-existing vault content must still be there,
    // byte-for-byte — the old code would have cleared it before finding out
    // there was nothing to replace it with.
    assert.equal(existsSync(survivorPath), true);
    assert.equal(readFileSync(survivorPath, "utf8"), survivorContent);
  });
});

describe("a re-sync clears stale output", () => {
  test("a note for a node the current export no longer produces is removed", () => {
    const fixtureRoot = buildFixture(1);
    write(join(fixtureRoot, "knowledge/generated/graphify/stale-symbol.md"), "# stale\n");

    const binDir = makeFakeBinDir();
    fakeGraphifyBin(binDir, `printf '# fresh\\n' > $STAGE/fresh.md`);

    const { code } = runExport(fixtureRoot, binDir);

    assert.equal(code, 0);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify/stale-symbol.md")), false);
    assert.equal(existsSync(join(fixtureRoot, "knowledge/generated/graphify/fresh.md")), true);
  });
});

describe("missing graphify-out/graph.json", () => {
  test("exits 1 with a clear message, without needing graphify on PATH at all", () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), "knowledge-obsidian-export-"));
    cleanup.push(fixtureRoot);
    // No graphify-out/graph.json written, and no fake graphify binary on PATH.

    const result = Bun.spawnSync(["bun", EXPORT_SCRIPT], {
      cwd: fixtureRoot,
      env: { ...process.env, KNOWLEDGE_GRAPH_ROOT: fixtureRoot },
      stdout: "pipe",
      stderr: "pipe"
    });

    assert.equal(result.exitCode, 1);
    const output = result.stdout.toString() + result.stderr.toString();
    assert.match(output, /graphify-out\/graph\.json does not exist/);
    assert.match(output, /knowledge:graph:update/);
  });
});
