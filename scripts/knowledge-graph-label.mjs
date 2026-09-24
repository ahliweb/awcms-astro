#!/usr/bin/env bun
/**
 * knowledge-graph-label.mjs — `bun run knowledge:graph:label`.
 *
 * Applies the curated community names in `graphify-out/.graphify_labels.json`
 * to the graph that already exists, and **does not re-cluster**.
 *
 * ## The defect this step exists to remove
 *
 * The naming loop documented upstream — edit `.graphify_labels.json`, then
 * re-run `graphify cluster-only .` to apply it — cannot converge on this
 * repo, and that is measured rather than suspected. Run against a graph whose
 * nodes and edges did not move by one byte (1404 nodes, 2717 edges), three
 * consecutive `cluster-only` runs produced **92, then 90, then 91**
 * communities. Community detection here is not deterministic, so every run
 * that applies labels also re-partitions the thing being labelled.
 *
 * The consequence is not a nuisance, it is the exact defect
 * `scripts/audit-graf.mjs` was written after: labels are keyed by community
 * id, so a partition that moves under a stable set of ids silently re-attaches
 * every curated name to a DIFFERENT community. That is how 60 of 101 labels in
 * this repo once came to sit on the wrong community inside perfectly valid
 * JSON, with every other gate green. Re-clustering in order to apply a name is
 * therefore not a neutral step — it is the very act that invalidates the name.
 *
 * So this script separates the two operations that upstream fuses:
 *
 *   - `bun run knowledge:graph:update` decides the PARTITION (it extracts and
 *     clusters). It is allowed to move communities, because that is its job.
 *   - `bun run knowledge:graph:label` decides the NAMES, over whatever
 *     partition is on disk right now. It reads `graph.json`, never rewrites
 *     `node.community`, and never invokes `graphify` at all.
 *
 * Between the two, a human reads `graphify-out/GRAPH_REPORT.md`, looks at what
 * each community actually contains, and writes names into the sidecar. That
 * ordering is what makes a curated name mean something: it is chosen against a
 * membership that is still there when the name lands.
 *
 * ## What it writes
 *
 *   1. `graph.json` — every node's `community_name`, from its own community's
 *      curated label. `community` itself is never touched; this script cannot
 *      move a node between communities even if the sidecar is nonsense.
 *   2. `GRAPH_REPORT.md` — the `### Community N - "label"` headings, so the
 *      report and the graph cannot disagree about what a community is called.
 *      `audit:graf` check 3 compares exactly these two, and a disagreement is
 *      how a reader learns one of them is stale without being told which.
 *   3. `graphify-out/.graphify_labels.json.sig` — per-community membership
 *      fingerprints for the partition the names were chosen against, in
 *      graphify's own format (`sha256` over each member id followed by a NUL
 *      byte, sorted, truncated to 16 hex characters — `graphify` 0.9.35's
 *      `cluster.py::community_member_sigs`, reproduced here in `node:crypto`).
 *      Written LAST, and only once every name has been accepted, so a refused
 *      run never leaves a signature claiming that a partition was curated when
 *      it was not.
 *
 * ## Fail-closed
 *
 * Nothing is written unless every community in `graph.json` has a name that
 * `audit:graf` would accept: present, non-empty, not a bare filename, not a
 * `Community N` placeholder, and unique across the whole graph. A partial
 * application is the one outcome worth avoiding entirely — it produces a graph
 * where some names were chosen and some were inherited, and nothing on its
 * face says which is which.
 *
 * This is a LOCAL step. It needs no `graphify`, no Python, and no network, but
 * it is not run by CI or by `bun test`: CI reads the committed artefacts, and
 * `bun run audit:graf` is what judges the result.
 *
 * The optional first argument is the root to operate on (default `.`), which
 * is what lets `tests/knowledge-graph-label.test.mjs` drive it over a fixture
 * tree and prove each refusal really refuses.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.argv[2] ?? ".");
const GRAPH = join(ROOT, "graphify-out/graph.json");
const REPORT = join(ROOT, "graphify-out/GRAPH_REPORT.md");
const LABELS = join(ROOT, "graphify-out/.graphify_labels.json");
const SIG = join(ROOT, "graphify-out/.graphify_labels.json.sig");

/**
 * Same shape-test `scripts/audit-graf.mjs` applies to a community name: a
 * label that ends in a source-file extension is `label_communities_by_hub`'s
 * output, which never read the community it named.
 */
const FILENAME_SUFFIX = /\.(astro|css|cjs|js|json|jsonc|md|mdx|mjs|svg|ts|tsx|txt|yml|yaml)$/i;
const PLACEHOLDER = /^Community\s+\d+$/i;

/**
 * A curated name goes into `GRAPH_REPORT.md` inside a quoted heading
 * (`### Community 7 - "..."`), so a name carrying a double quote or a
 * backslash would have to be escaped on the way in. Refusing both instead is
 * strictly safer than escaping them: an escape written by hand here is exactly
 * the half-done kind CodeQL flags as `js/incomplete-sanitization` — escaping
 * the quote but not the backslash emits a heading that no longer parses as a
 * quoted string, and this script's own `audit:graf` counterpart then reads a
 * name that disagrees with `graph.json`. No community in this repo has ever
 * needed either character, so nothing expressible is lost.
 */
const QUOTE_OR_BACKSLASH = /["\\]/;

/**
 * Serialise `graph.json` the way `graphify` itself does, byte for byte.
 *
 * This is not cosmetic. `graph.json` is TRACKED, so its formatting decides
 * whether a future rebuild produces a readable diff or an unreviewable one:
 * writing it compact turned a 46,646-line file into a single line, which reads
 * as 47,042 deletions and makes every subsequent change to the graph
 * impossible to review. Worse, it would flip back and forth on every
 * alternation between this script and `graphify`, so the noise would be
 * permanent rather than one-off.
 *
 * `graphify` writes through Python's `json.dump` with `indent=2` and the
 * default `ensure_ascii=True`, and appends no trailing newline. The first two
 * match `JSON.stringify(value, null, 2)` exactly; the third does not, because
 * JavaScript emits non-ASCII literally where Python escapes it — and this
 * repo's community names are full of em dashes, so without the escape pass
 * every label line would show as changed.
 *
 * @param {unknown} value
 * @returns {string}
 */
function serialiseLikeGraphify(value) {
  return JSON.stringify(value, null, 2).replace(/[\u007f-￿]/g, (character) =>
    `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`
  );
}

function fail(reasons) {
  console.error("knowledge:graph:label FAILED — nothing written:");
  for (const reason of reasons) console.error(`  - ${reason}`);
  process.exit(1);
}

for (const [path, what] of [
  [GRAPH, "graphify-out/graph.json"],
  [LABELS, "graphify-out/.graphify_labels.json"]
]) {
  if (!existsSync(path)) {
    fail([`${what} does not exist — run \`bun run knowledge:graph:update\` first.`]);
  }
}

const graph = JSON.parse(readFileSync(GRAPH, "utf8"));
const labels = JSON.parse(readFileSync(LABELS, "utf8"));

/** @type {Map<number, string[]>} community id -> member node ids */
const members = new Map();
for (const node of graph.nodes) {
  const cid = node.community;
  if (cid === undefined || cid === null) continue;
  const bucket = members.get(cid);
  if (bucket === undefined) members.set(cid, [String(node.id)]);
  else bucket.push(String(node.id));
}

const problems = [];
const byName = new Map();

for (const cid of [...members.keys()].sort((a, b) => a - b)) {
  const name = Object.hasOwn(labels, String(cid)) ? labels[String(cid)] : undefined;

  if (typeof name !== "string" || name.trim() === "") {
    problems.push(`community ${cid} has no name in .graphify_labels.json — ${members.get(cid).length} node(s) would stay unnamed`);
    continue;
  }
  if (FILENAME_SUFFIX.test(name)) {
    problems.push(`community ${cid} is named "${name}" — that is a filename, the output of hub naming, which never reads the community it names`);
    continue;
  }
  if (PLACEHOLDER.test(name)) {
    problems.push(`community ${cid} is named "${name}" — that is the placeholder, not a chosen name`);
    continue;
  }
  if (QUOTE_OR_BACKSLASH.test(name)) {
    problems.push(
      `community ${cid} is named ${JSON.stringify(name)} — a name may contain neither a double quote nor a backslash, because GRAPH_REPORT.md carries it inside a quoted heading`
    );
    continue;
  }

  const taken = byName.get(name);
  if (taken !== undefined) {
    problems.push(`communities ${taken} and ${cid} are both named "${name}" — twin names make both indistinguishable to every downstream consumer`);
    continue;
  }
  byName.set(name, cid);
}

if (problems.length > 0) {
  problems.push(
    `read graphify-out/GRAPH_REPORT.md for what each community actually contains, name it there, and run this again — do NOT run \`graphify cluster-only\` to fix it, that re-partitions the graph you just named`
  );
  fail(problems);
}

// ---------------------------------------------------------------------------
// Apply. Past this line every name is accepted, so no write is partial.
// ---------------------------------------------------------------------------

for (const node of graph.nodes) {
  if (node.community === undefined || node.community === null) continue;
  node.community_name = labels[String(node.community)];
}
writeFileSync(GRAPH, serialiseLikeGraphify(graph));

let headingsRewritten = 0;
if (existsSync(REPORT)) {
  const report = readFileSync(REPORT, "utf8").replace(
    /^(### Community (\d+) - )"(?:[^"\\]|\\.)*"/gm,
    (whole, prefix, cid) => {
      const name = labels[cid];
      if (typeof name !== "string") return whole;
      headingsRewritten += 1;
      // No escaping here, and deliberately none: a name containing `"` or `\`
      // was already refused above, so there is nothing left to escape. An
      // escape pass at this point could only ever be an incomplete one — the
      // obvious `.replace(/"/g, '\\"')` leaves a backslash in the name
      // un-escaped and emits a heading that no longer parses as a quoted
      // string, which is what CodeQL's js/incomplete-sanitization names.
      return `${prefix}"${name}"`;
    }
  );
  writeFileSync(REPORT, report);
}

// Membership fingerprints LAST: a signature is a claim that these names were
// chosen against this partition, and it must not outlive a refused run.
const sigs = {};
for (const [cid, ids] of members) {
  const hash = createHash("sha256");
  for (const id of [...ids].sort()) {
    hash.update(id, "utf8");
    hash.update(Buffer.from([0]));
  }
  sigs[String(cid)] = hash.digest("hex").slice(0, 16);
}
writeFileSync(SIG, JSON.stringify(sigs));

console.log(
  `knowledge:graph:label OK — ${members.size} community name(s) applied to ${graph.nodes.length} node(s), ` +
    `${headingsRewritten} report heading(s) rewritten, ${Object.keys(sigs).length} membership signature(s) recorded. ` +
    `The partition was not touched. Verify with \`bun run audit:graf\`.`
);
