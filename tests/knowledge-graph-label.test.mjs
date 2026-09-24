/**
 * End-to-end behaviour of `scripts/knowledge-graph-label.mjs` — the step that
 * applies curated community names to an EXISTING partition without
 * re-clustering (issue #113).
 *
 * ## The concrete defect this guards
 *
 * The upstream naming loop — edit `.graphify_labels.json`, then re-run
 * `graphify cluster-only .` to apply it — cannot converge on this repo: three
 * consecutive `cluster-only` runs over a byte-identical graph (1404 nodes,
 * 2717 edges) produced 92, then 90, then 91 communities. Community detection
 * here is not deterministic, so re-clustering in order to apply a name
 * re-partitions the very thing being named. Because labels are keyed by
 * community id, a partition that moves under a stable id silently re-attaches
 * every curated name to a DIFFERENT community — that is how 60 of 101 labels
 * in this repo once landed on the wrong community, inside perfectly valid
 * JSON, with every other gate green.
 *
 * `knowledge-graph-label.mjs` exists to make that impossible in a different
 * way: it never invokes `graphify`, never re-clusters, and — its central
 * safety claim — never writes `node.community`. It only ever writes
 * `community_name`, `GRAPH_REPORT.md` headings, and a `.sig` membership
 * fingerprint, and only after EVERY community in the graph has an accepted
 * name; a single rejected name must leave every output file byte-for-byte
 * untouched, because a partial application is indistinguishable on its face
 * from a complete one.
 *
 * This file drives the real script with `Bun.spawnSync` over disposable
 * `mkdtempSync` fixture trees, passing the fixture root as the script's
 * documented optional first CLI argument — real disk, real JSON, real
 * `node:crypto`, the same pattern established by `tests/audit-graf.test.mjs`
 * and `tests/knowledge-obsidian-export.test.mjs`. It never touches this
 * repo's own `graphify-out/`, which is frozen and hand-curated.
 *
 * ## What this file does NOT prove
 *
 * It cannot and does not prove that a curated name is a GOOD description of
 * what its community actually contains — that judgement is human, made while
 * reading `GRAPH_REPORT.md`, and no test can stand in for it. What is proved
 * here is narrower and mechanical: that the name a curator wrote for
 * community N ends up on community N, and nowhere else, and never on a
 * different N than the one they read.
 */
import { afterEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..");
const SCRIPT = join(REPO_ROOT, "scripts/knowledge-graph-label.mjs");

/** @type {string[]} */
const cleanup = [];
afterEach(() => {
  while (cleanup.length) rmSync(cleanup.pop(), { recursive: true, force: true });
});

function write(path, content) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, typeof content === "string" ? content : JSON.stringify(content));
}

/** Fixture tree: `{ "graphify-out/graph.json": "...", ... }` -> a real directory. */
function tree(files) {
  const root = mkdtempSync(join(tmpdir(), "knowledge-graph-label-"));
  cleanup.push(root);
  for (const [path, content] of Object.entries(files)) write(join(root, path), content);
  return root;
}

function node(id, community, community_name, source_file = "src/a.ts") {
  return { id, label: id, community, community_name, source_file };
}

// Written exactly as graphify itself writes `graph.json` — `null, 2`, giving
// the `": "` key/value separator the production script's `COMMUNITY_NAME_FIELD`
// regex expects. A compact `JSON.stringify` (no third argument) emits
// `"community_name":"..."` with no space, which the regex would not match at
// all — that mismatch is exactly why the fixtures needed repairing after the
// script stopped re-serialising and started editing the file as text.
function graphOf(nodes, extra = {}) {
  return JSON.stringify({ nodes, links: [], built_at_commit: "0".repeat(40), ...extra }, null, 2);
}

function reportOf({ headings = [] } = {}) {
  return [
    "# Graph Report - fixture",
    "",
    "## Summary",
    `- ${headings.length} placeholder line, not read by this script`,
    "",
    ...headings.map(([id, name]) => `### Community ${id} - "${name}"`),
    ""
  ].join("\n");
}

function run(root) {
  const result = Bun.spawnSync(["bun", SCRIPT, root]);
  return { code: result.exitCode, output: result.stdout.toString() + result.stderr.toString() };
}

const GRAPH_PATH = "graphify-out/graph.json";
const REPORT_PATH = "graphify-out/GRAPH_REPORT.md";
const SIG_PATH = "graphify-out/.graphify_labels.json.sig";
const LABELS_PATH = "graphify-out/.graphify_labels.json";

/** Minimal clean fixture: two communities, both nameable, no report headings yet. */
function cleanFixture() {
  const nodes = [
    node("a", 0, "Community 0", "src/a.ts"),
    node("b", 0, "Community 0", "src/b.ts"),
    node("c", 1, "Community 0", "src/c.ts")
  ];
  const root = tree({
    [GRAPH_PATH]: graphOf(nodes),
    [REPORT_PATH]: reportOf({ headings: [[0, "Community 0"], [1, "Community 0"]] }),
    [LABELS_PATH]: { 0: "Content Rendering Pipeline", 1: "Release Tooling" }
  });
  return { root, nodes };
}

// ---------------------------------------------------------------------------
// 1. A clean run applies every name, exit 0.
// ---------------------------------------------------------------------------

describe("a clean run", () => {
  test("rewrites every node's community_name to its community's curated label, exit 0", () => {
    const { root } = cleanFixture();

    const { code, output } = run(root);

    assert.equal(code, 0, output);
    const graph = JSON.parse(readFileSync(join(root, GRAPH_PATH), "utf8"));
    const byId = Object.fromEntries(graph.nodes.map((n) => [n.id, n.community_name]));
    assert.deepEqual(byId, {
      a: "Content Rendering Pipeline",
      b: "Content Rendering Pipeline",
      c: "Release Tooling"
    });
  });

  test("rewrites the GRAPH_REPORT.md headings to match", () => {
    const { root } = cleanFixture();

    run(root);

    const report = readFileSync(join(root, REPORT_PATH), "utf8");
    assert.match(report, /### Community 0 - "Content Rendering Pipeline"/);
    assert.match(report, /### Community 1 - "Release Tooling"/);
    assert.doesNotMatch(report, /### Community 0 - "Community 0"/);
  });
});

// ---------------------------------------------------------------------------
// 2. node.community is NEVER modified — the script's central safety claim.
// ---------------------------------------------------------------------------

describe("node.community is never touched", () => {
  test("the partition is byte-identical before and after a successful run", () => {
    const { root, nodes } = cleanFixture();
    const before = nodes.map((n) => ({ id: n.id, community: n.community }));

    const { code } = run(root);

    assert.equal(code, 0);
    const graph = JSON.parse(readFileSync(join(root, GRAPH_PATH), "utf8"));
    const after = graph.nodes.map((n) => ({ id: n.id, community: n.community }));
    assert.deepEqual(after, before);
  });
});

// ---------------------------------------------------------------------------
// 3. Fail-closed: exit 1, and NOTHING written — every output file byte-for-
//    byte identical to before the run.
// ---------------------------------------------------------------------------

describe("fail-closed refusals leave every output untouched", () => {
  /** Runs the fixture, asserts exit 1 and that outputs did not change at all. */
  function assertRefusedWithoutWriting(root, matchOutput) {
    const before = {};
    for (const p of [GRAPH_PATH, REPORT_PATH]) {
      before[p] = readFileSync(join(root, p), "utf8");
    }
    const sigExistedBefore = (() => {
      try {
        return readFileSync(join(root, SIG_PATH), "utf8");
      } catch {
        return undefined;
      }
    })();

    const { code, output } = run(root);

    assert.equal(code, 1);
    if (matchOutput) assert.match(output, matchOutput);
    for (const p of [GRAPH_PATH, REPORT_PATH]) {
      assert.equal(readFileSync(join(root, p), "utf8"), before[p], `${p} was modified on a refused run`);
    }
    const sigAfter = (() => {
      try {
        return readFileSync(join(root, SIG_PATH), "utf8");
      } catch {
        return undefined;
      }
    })();
    assert.equal(sigAfter, sigExistedBefore, ".sig was written on a refused run");
  }

  test("a community present in graph.json with no entry in the labels sidecar", () => {
    const nodes = [node("a", 0, "x"), node("b", 1, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "Content Rendering Pipeline" } // community 1 missing
    });

    assertRefusedWithoutWriting(root, /community 1 has no name/);
  });

  test("a name that is a bare filename", () => {
    const nodes = [node("a", 0, "x"), node("b", 1, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "BaseLayout.astro", 1: "Release Tooling" }
    });

    assertRefusedWithoutWriting(root, /BaseLayout\.astro/);
  });

  test("a bare-filename name is caught for other extensions too (content.ts)", () => {
    const nodes = [node("a", 0, "x"), node("b", 1, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "content.ts", 1: "Release Tooling" }
    });

    assertRefusedWithoutWriting(root, /content\.ts/);
  });

  test('a "Community 7" placeholder name', () => {
    const nodes = [node("a", 0, "x"), node("b", 1, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "Community 7", 1: "Release Tooling" }
    });

    assertRefusedWithoutWriting(root, /placeholder/);
  });

  test("two communities sharing one name", () => {
    const nodes = [node("a", 0, "x"), node("b", 1, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "Shared Name", 1: "Shared Name" }
    });

    assertRefusedWithoutWriting(root, /both named "Shared Name"/);
  });

  // A name reaches GRAPH_REPORT.md inside a quoted heading, so a `"` or a `\`
  // in it would have to be escaped on the way in. Both are refused instead:
  // the hand-written escape that would otherwise be needed here is exactly the
  // half-done kind CodeQL reports as js/incomplete-sanitization — escape the
  // quote, forget the backslash, and the heading stops parsing as a quoted
  // string while `audit:graf` then reads a name that disagrees with
  // `graph.json`. Refusing the two characters costs nothing expressible.
  test("a name containing a double quote", () => {
    const nodes = [node("a", 0, "x"), node("b", 1, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: 'The "Nine" Gates', 1: "Release Tooling" }
    });

    assertRefusedWithoutWriting(root, /neither a double quote nor a backslash/);
  });

  test("a name containing a backslash — the character an escape pass would miss", () => {
    const nodes = [node("a", 0, "x"), node("b", 1, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "Windows\\Paths", 1: "Release Tooling" }
    });

    assertRefusedWithoutWriting(root, /neither a double quote nor a backslash/);
  });

  test("an empty-string / whitespace-only name", () => {
    const nodes = [node("a", 0, "x"), node("b", 1, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "   ", 1: "Release Tooling" }
    });

    assertRefusedWithoutWriting(root, /has no name/);
  });
});

// ---------------------------------------------------------------------------
// 4. The .sig file: written only on success, matches graphify's own format,
//    and is independent of node order.
// ---------------------------------------------------------------------------

describe(".graphify_labels.json.sig", () => {
  /** graphify's own `community_member_sigs` format, reproduced independently. */
  function expectedSig(ids) {
    const hash = createHash("sha256");
    for (const id of [...ids].sort()) {
      hash.update(id, "utf8");
      hash.update(Buffer.from([0]));
    }
    return hash.digest("hex").slice(0, 16);
  }

  test("is written only on a successful run", () => {
    const { root } = cleanFixture();
    const { code } = run(root);
    assert.equal(code, 0);
    // Must exist and be readable JSON.
    const sig = JSON.parse(readFileSync(join(root, SIG_PATH), "utf8"));
    assert.equal(typeof sig, "object");
  });

  test("is NOT written on a refused run (already proven above, re-asserted for a fresh fixture)", () => {
    const nodes = [node("a", 0, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: {} // community 0 has no name
    });

    run(root);
    assert.throws(() => readFileSync(join(root, SIG_PATH), "utf8"));
  });

  test("matches sha256-over-sorted-ids-NUL-separated, truncated to 16 hex chars", () => {
    const nodes = [
      node("z", 0, "x"),
      node("a", 0, "x"),
      node("m", 0, "x"),
      node("only", 1, "x")
    ];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "Content Rendering Pipeline", 1: "Release Tooling" }
    });

    const { code } = run(root);
    assert.equal(code, 0);

    const sig = JSON.parse(readFileSync(join(root, SIG_PATH), "utf8"));
    assert.equal(sig["0"], expectedSig(["z", "a", "m"]));
    assert.equal(sig["1"], expectedSig(["only"]));
    assert.equal(sig["0"].length, 16);
  });

  test("is independent of node order in the fixture", () => {
    const nodesInOrder = [
      node("a", 0, "x"),
      node("b", 0, "x"),
      node("c", 0, "x")
    ];
    const shuffled = [nodesInOrder[2], nodesInOrder[0], nodesInOrder[1]];

    const rootA = tree({
      [GRAPH_PATH]: graphOf(nodesInOrder),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "Content Rendering Pipeline" }
    });
    const rootB = tree({
      [GRAPH_PATH]: graphOf(shuffled),
      [REPORT_PATH]: reportOf(),
      [LABELS_PATH]: { 0: "Content Rendering Pipeline" }
    });

    assert.equal(run(rootA).code, 0);
    assert.equal(run(rootB).code, 0);

    const sigA = JSON.parse(readFileSync(join(rootA, SIG_PATH), "utf8"));
    const sigB = JSON.parse(readFileSync(join(rootB, SIG_PATH), "utf8"));
    assert.equal(sigA["0"], sigB["0"]);
  });
});

// ---------------------------------------------------------------------------
// 5. Missing graph.json / missing labels sidecar: exit 1, naming
//    knowledge:graph:update.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 6. Text-editing regression: everything except `community_name` fields
//    survives byte-for-byte — the defect that made `"confidence_score": 1.0`
//    become `1` on 5,372 lines when the script used to JSON.parse + re-
//    JSON.stringify the whole file.
// ---------------------------------------------------------------------------

describe("graph.json is edited as TEXT, not re-serialised (the 5,372-line regression)", () => {
  test("a whole-valued float survives untouched — JSON.stringify has no way to emit 1.0", () => {
    // Hand-write graph.json instead of going through `graphOf` (which itself
    // uses JSON.stringify) so this test does not depend on JS's own
    // stringifier ever being able to reproduce a bare `1.0` — it cannot, and
    // that impossibility is exactly why the production script switched to
    // text-editing in the first place.
    const root = tree({});
    const graphText =
      "{\n" +
      '  "nodes": [\n' +
      "    {\n" +
      '      "id": "a",\n' +
      '      "community": 0,\n' +
      '      "community_name": "Community 0",\n' +
      '      "confidence_score": 1.0,\n' +
      '      "weight": 0.85,\n' +
      '      "source_file": "src/a.ts"\n' +
      "    }\n" +
      "  ],\n" +
      '  "links": [],\n' +
      '  "built_at_commit": "' + "0".repeat(40) + '"\n' +
      "}\n";
    write(join(root, GRAPH_PATH), graphText);
    write(join(root, REPORT_PATH), reportOf({ headings: [[0, "Community 0"]] }));
    write(join(root, LABELS_PATH), { 0: "Content Rendering Pipeline" });

    const { code, output } = run(root);
    assert.equal(code, 0, output);

    const after = readFileSync(join(root, GRAPH_PATH), "utf8");
    // The exact bytes of the untouched fields must still be there — a
    // JSON.parse/JSON.stringify round-trip would have silently rewritten
    // `1.0` to `1`, which is precisely the defect this test guards against.
    assert.match(after, /"confidence_score": 1\.0,/);
    assert.match(after, /"weight": 0\.85,/);

    // Stronger than substring matching: every line except the one rewritten
    // field must be byte-identical to the original, in the same order.
    const beforeLines = graphText.split("\n");
    const afterLines = after.split("\n");
    assert.equal(afterLines.length, beforeLines.length);
    for (let i = 0; i < beforeLines.length; i++) {
      if (beforeLines[i].includes('"community_name"')) {
        assert.match(afterLines[i], /"community_name": "Content Rendering Pipeline"/);
      } else {
        assert.equal(afterLines[i], beforeLines[i], `line ${i} changed: ${JSON.stringify(beforeLines[i])} -> ${JSON.stringify(afterLines[i])}`);
      }
    }
  });

  test("a community_name field COUNT that disagrees with the node count is refused, nothing written", () => {
    // Hand-craft a graph.json where the node array says 2 nodes but the text
    // only contains one "community_name" field (as if the document shape
    // changed under the script, or a node object was assembled without one).
    // The script asserts this correspondence explicitly and must refuse
    // rather than write the Nth field onto the wrong node.
    const root = tree({});
    const graphText =
      "{\n" +
      '  "nodes": [\n' +
      '    { "id": "a", "community": 0, "community_name": "Community 0", "source_file": "src/a.ts" },\n' +
      '    { "id": "b", "community": 1, "source_file": "src/b.ts" }\n' +
      "  ],\n" +
      '  "links": [],\n' +
      '  "built_at_commit": "' + "0".repeat(40) + '"\n' +
      "}\n";
    write(join(root, GRAPH_PATH), graphText);
    write(join(root, REPORT_PATH), reportOf());
    write(join(root, LABELS_PATH), { 0: "Content Rendering Pipeline", 1: "Release Tooling" });

    const before = graphText;
    const { code, output } = run(root);

    assert.equal(code, 1);
    assert.match(output, /has 1 "community_name" field\(s\) but 2 node\(s\)/);
    assert.equal(readFileSync(join(root, GRAPH_PATH), "utf8"), before, "graph.json was modified on a refused run");
    assert.throws(() => readFileSync(join(root, SIG_PATH), "utf8"));
  });
});

describe("missing prerequisites", () => {
  test("missing graphify-out/graph.json exits 1 naming knowledge:graph:update", () => {
    const root = tree({
      [LABELS_PATH]: { 0: "Content Rendering Pipeline" }
    });

    const { code, output } = run(root);

    assert.equal(code, 1);
    assert.match(output, /graphify-out\/graph\.json/);
    assert.match(output, /knowledge:graph:update/);
  });

  test("missing labels sidecar exits 1 naming knowledge:graph:update", () => {
    const nodes = [node("a", 0, "x")];
    const root = tree({
      [GRAPH_PATH]: graphOf(nodes),
      [REPORT_PATH]: reportOf()
      // no .graphify_labels.json
    });

    const { code, output } = run(root);

    assert.equal(code, 1);
    assert.match(output, /\.graphify_labels\.json/);
    assert.match(output, /knowledge:graph:update/);
  });
});
