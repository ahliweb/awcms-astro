#!/usr/bin/env bun
/**
 * knowledge-graph-update.mjs — `bun run knowledge:graph:update`.
 *
 * Rebuilds this repo's OWN Graphify graph at `graphify-out/`. There is
 * exactly one graph here — no subtree, no combine/federation step (see the
 * reference implementation this was ported from for that machinery; it does
 * not apply here, D1).
 *
 * Two real `graphify` calls, mirroring the reference implementation's
 * choice, both verified against the installed toolchain (0.9.35):
 *
 *   1. `graphify extract . --code-only` — structural AST extraction only.
 *      No LLM call, no provider API key read, for any file, ever: the flag
 *      itself indexes code (local AST, no API key) and skips doc/paper/
 *      image files. Semantic extraction must be OFF by default and opted
 *      into by hand, never run by this repo's own scripts.
 *   2. `graphify cluster-only .` — re-clusters and names communities.
 *      With no `GEMINI_API_KEY`/`GOOGLE_API_KEY`/other backend configured,
 *      this makes no network call either — it reuses any saved, human-chosen
 *      labels whose community membership is unchanged
 *      (`graphify-out/.graphify_labels.json` + its `.sig` sidecar) and falls
 *      back to deterministic, free hub-based naming for anything new. A hub
 *      name is not an acceptable final label — `bun run audit:graf` rejects
 *      one — so a run that introduces a genuinely new community needs a
 *      human to rename it by hand afterwards.
 *
 * Prints `graphify-out/graph.json`'s node/edge/community counts before and
 * after the run, read directly from the artefact rather than trusted from
 * graphify's own stdout — so a run that silently produced an empty or
 * unreadable graph is visible immediately rather than discovered later by
 * `bun run audit:graf`.
 *
 * `KNOWLEDGE_GRAPH_ROOT` overrides the repo root this script operates on —
 * for tests only, so a script meta-test can run this file for real against a
 * disposable fixture tree without ever touching this repo's own
 * `graphify-out/`. Unset in every real invocation.
 *
 * Needs the real `graphify` binary on `PATH` (a local Python tool, not
 * installed in CI). Fails closed with a clear message when it is missing —
 * `Bun.spawnSync` throws synchronously in that case, not a non-zero exit, so
 * that case is caught explicitly rather than falling into the "exited
 * non-zero" branch with a confusing message. Not part of `bun test`.
 *
 * Unlike the reference implementation this was ported from, this script does
 * NOT hand-write `graphify-out/cost.json` itself: in this repo that file is
 * already graphify's own native accounting artefact (its entries carry
 * `files`, not a hand-rolled `mode` field), populated by graphify's earlier
 * semantic-extraction runs. Overwriting its shape here would be this script
 * inventing a second, incompatible bookkeeping format for the same file.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = process.env.KNOWLEDGE_GRAPH_ROOT ?? resolve(import.meta.dirname, "..");
const GRAPH_PATH = join(ROOT, "graphify-out/graph.json");

function fail(message) {
  console.error(`knowledge:graph:update FAILED — ${message}`);
  process.exit(1);
}

/** Node/edge/community counts read straight from `graphify-out/graph.json`, or `null` when it does not exist yet or is unreadable. */
function readCounts() {
  if (!existsSync(GRAPH_PATH)) return null;

  let graph;
  try {
    graph = JSON.parse(readFileSync(GRAPH_PATH, "utf8"));
  } catch {
    return null;
  }

  if (!Array.isArray(graph.nodes)) return null;

  return {
    nodes: graph.nodes.length,
    edges: (graph.links ?? []).length,
    communities: new Set(
      graph.nodes.map((node) => node.community).filter((community) => community !== undefined && community !== null)
    ).size
  };
}

function formatCounts(counts) {
  if (counts === null) return "(no graph yet)";
  return `${counts.nodes} nodes, ${counts.edges} edges, ${counts.communities} communities`;
}

function run(args) {
  console.log(`$ graphify ${args.join(" ")}`);

  let proc;
  try {
    proc = Bun.spawnSync(["graphify", ...args], { cwd: ROOT, stdout: "inherit", stderr: "inherit" });
  } catch {
    fail(
      "`graphify` is not on PATH. Install it before running this script — " +
        "see knowledge/README.md. `graphify` is deliberately absent from CI, " +
        "so this command is a local/developer-run step, never a build dependency."
    );
    return;
  }

  if (proc.exitCode !== 0) {
    fail(`\`graphify ${args.join(" ")}\` exited ${proc.exitCode}`);
  }
}

const before = readCounts();
console.log(`Before: ${formatCounts(before)}`);

run(["extract", ".", "--code-only"]);
run(["cluster-only", "."]);

const after = readCounts();
console.log(`After:  ${formatCounts(after)}`);

console.log(
  `knowledge:graph:update OK — graphify-out/graph.json rebuilt (code-only, 0 tokens). ` +
    `Review graphify-out/GRAPH_REPORT.md for any community still named by its hub filename — ` +
    "bun run audit:graf rejects one; give it a chosen name and re-run `graphify cluster-only .` " +
    "(see knowledge/README.md)."
);
