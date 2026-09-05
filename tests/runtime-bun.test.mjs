/**
 * Gerbang ADR-0050: Bun adalah satu-satunya runtime yang boleh menjalankan
 * repo ini, dan sampai berkas ini ada, tidak ada yang memeriksanya.
 *
 * ## The rule was already true, and that is exactly the trap
 *
 * An audit of this repo found the rule already held in substance: every
 * `scripts` entry in `package.json` invokes `bun`, CI carries no
 * `actions/setup-node` and no `node-version`, `Dockerfile` builds and runs on
 * nothing but `oven/bun` images, and `server/penyaji.mjs` opens with
 * `#!/usr/bin/env bun`. Every one of those facts is also exactly the shape
 * [ADR-0030](../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) warns
 * about: true today, unguarded, and therefore one Dependabot bump, one copied
 * CI snippet, or one `bun add` of the wrong helper package away from being
 * false tomorrow with every other gate still green. A `node` step added to
 * `ci.yml` to "just quickly run a script" does not fail `check`, does not fail
 * `bun test`, and does not fail any audit script — it fails nothing, which is
 * this repo's definition of a defect worth gating.
 *
 * ## Two distinctions this file must get right, or it lies about what it guards
 *
 * 1. **`node:fs`, `node:path`, `node:http`, `node:child_process`, `node:crypto`,
 *    `node:assert` and the rest are NOT a Node.js dependency here.** Bun
 *    implements this surface itself; importing `node:http` in
 *    `server/penyaji.mjs` runs Bun's own HTTP stack, not a Node.js process.
 *    They are the portable API this repo is written against, and nothing below
 *    forbids them — the assertions never even look at an import statement.
 * 2. **`@astrojs/node` and `compression` in `dependencies` are not a runtime
 *    creeping back in either — both are executed BY Bun.** `@astrojs/node`
 *    owns URL-to-file-path resolution (`server/penyaji.mjs`'s own docblock
 *    names the defect class it refuses to reimplement: `..`, a
 *    double-encoded path, a symlink). `compression` negotiates Brotli, ~15-20%
 *    smaller than gzip for HTML per
 *    `docs/awcms-astro/standar-performa-dan-keamanan.md`, and pulls in
 *    `negotiator` (`Accept-Encoding` q-value parsing) and `compressible` (a
 *    curated MIME table) that this repo would otherwise have to reimplement
 *    and keep current by hand. Both are kept ON PURPOSE, and this file checks
 *    that its own package-class reasoning agrees with that purpose: see the
 *    last describe block below.
 *
 * What IS forbidden, and the only thing forbidden: a genuine Node.js RUNTIME
 * re-entering — a `node`/`npm`/`npx`/`yarn`/`pnpm` invocation, a
 * `setup-node` action, a `node-version` key, an `engines.node` field, a
 * non-Bun base image, a `#!/usr/bin/env node` shebang, an `.nvmrc`/
 * `.node-version` file, or a lockfile belonging to another package manager.
 *
 * ## What this file does NOT, and cannot, prove
 *
 * Every assertion below is a static read of files already in this repo. It
 * cannot see whether a transitive dependency spawns a `node` binary at
 * runtime (a build tool invoked from inside a package's own `postinstall`,
 * say) — that would need running the tree, not reading it, and this repo's
 * gates run without a build and without a network wherever they can
 * (`AGENTS.md` §Definition of Done). It also cannot see anything that never
 * touches a tracked file, such as a maintainer running `npm install` by hand
 * on their own machine outside CI. What it closes is the class this repo has
 * actually seen elsewhere: a written rule with nothing that turns red when it
 * breaks.
 */
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const dockerfile = readFileSync("Dockerfile", "utf8");

/** A Node.js-runtime binary name, matched only as a whole word/command. */
const RUNTIME_BINARIES = ["node", "npm", "npx", "yarn", "pnpm"];

/**
 * Strips `#` line comments from Dockerfile/YAML text, the same trick
 * `tests/standar-skrip.test.mjs`'s `codeOnly()` applies to JS: a comment
 * explaining that a binary is NOT used ("we removed npm ci here") must not be
 * mistaken for the invocation it is explaining. Neither this repo's workflows
 * nor its Dockerfile quote a literal `#` inside a string, so slicing at the
 * first one is exact here — a corpus that did would need a real parser
 * instead.
 */
function withoutHashComments(text) {
  return text
    .split("\n")
    .map((line) => {
      const i = line.indexOf("#");
      return i === -1 ? line : line.slice(0, i);
    })
    .join("\n");
}

describe("package.json scripts invoke Bun, never a Node.js runtime binary (ADR-0050)", () => {
  test("every scripts entry runs only bun/bunx commands", () => {
    for (const [name, cmd] of Object.entries(pkg.scripts ?? {})) {
      // A chain such as `bun run check && bun --bun astro build` is several
      // commands in one string; each one must open on `bun`/`bunx` on its own,
      // because `a && node b.js` is a script that passes a glance at its first
      // word and still hands a Node.js process a live invocation.
      const segments = cmd.split(/&&|\|\||;|\|/).map((s) => s.trim()).filter(Boolean);

      assert.ok(segments.length > 0, `package.json scripts.${name} is empty`);

      for (const segment of segments) {
        const first = segment.match(/^(\S+)/)?.[1] ?? "";
        assert.match(
          first,
          /^bunx?$/,
          `package.json scripts.${name} runs "${segment}", whose command is ` +
            `"${first}" — every command a script runs must be "bun" or ` +
            `"bunx". A Node.js runtime binary invoked from a script is exactly ` +
            "the regression ADR-0050 gates: every other check here stays green " +
            "while a derived site's build quietly needs a Node.js install this " +
            "repo never asked for."
        );
      }
    }
  });

  test("no scripts entry names a Node.js-runtime binary anywhere in its command", () => {
    // Belt-and-braces over the test above: this one is not limited to the
    // FIRST word of a segment, so it also catches a binary named as an
    // argument (`bun run x --exec npm`) rather than only as the command
    // itself. `node_modules`, `node:*`, and `@astrojs/node` must survive this
    // — none of them are a runtime binary invocation, and the pattern below is
    // anchored on a word boundary specifically so an underscore- or
    // colon-joined neighbour does not count as one.
    for (const [name, cmd] of Object.entries(pkg.scripts ?? {})) {
      for (const bin of RUNTIME_BINARIES) {
        assert.doesNotMatch(
          cmd,
          new RegExp(`\\b${bin}\\b`),
          `package.json scripts.${name} ("${cmd}") names "${bin}"`
        );
      }
    }
  });

  test("package.json has no engines.node", () => {
    // `engines.bun` is required (gated by tests/versi-toolchain.test.mjs);
    // `engines.node` is a promise to accept a Node.js version this repo never
    // runs on, and its mere presence is what a package manager reads to decide
    // whether to warn or refuse — a promise nothing here backs.
    assert.equal(
      pkg.engines?.node,
      undefined,
      `package.json declares engines.node = "${pkg.engines?.node}". This repo ` +
        "runs on Bun only (ADR-0015); an engines.node entry states otherwise " +
        "even if nothing currently reads it."
    );
  });
});

describe("no lockfile or version pin from another package manager sits at the repo root (ADR-0050)", () => {
  // Each of these existing is itself the regression: `npm i` regenerating
  // `package-lock.json` beside `bun.lock`, or an editor's Node version manager
  // dropping `.nvmrc`, both happen with every other gate in this repo still
  // green — nothing here reads either file, so nothing would notice without
  // this test.
  const FOREIGN_MARKERS = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".nvmrc",
    ".node-version"
  ];

  for (const name of FOREIGN_MARKERS) {
    test(`${name} does not exist at the repo root`, () => {
      assert.equal(
        existsSync(name),
        false,
        `${name} exists at the repo root. Its presence alone signals another ` +
          "package manager or Node.js version manager was run against this " +
          "repo; bun.lock is the only lockfile ADR-0050 permits here."
      );
    });
  }
});

describe("CI workflows never reintroduce a Node.js toolchain (ADR-0050)", () => {
  const WORKFLOW_DIR = ".github/workflows";
  const workflows = readdirSync(WORKFLOW_DIR)
    .filter((name) => name.endsWith(".yml"))
    .map((name) => ({
      name,
      text: readFileSync(join(WORKFLOW_DIR, name), "utf8")
    }));

  test("at least one workflow file was actually read", () => {
    // Without this, a typo in WORKFLOW_DIR would make every test below pass
    // vacuously over an empty array — green because nothing ran, not because
    // nothing was wrong.
    assert.ok(workflows.length > 0, `no *.yml files found under ${WORKFLOW_DIR}`);
  });

  for (const { name, text } of workflows) {
    const stripped = withoutHashComments(text);

    test(`${name}: no actions/setup-node`, () => {
      assert.doesNotMatch(
        stripped,
        /actions\/setup-node/,
        `${name} references actions/setup-node — a Node.js toolchain step in a ` +
          "workflow that otherwise only ever sets up Bun (oven-sh/setup-bun)."
      );
    });

    test(`${name}: no node-version: key`, () => {
      assert.doesNotMatch(
        stripped,
        /\bnode-version\s*:/,
        `${name} declares a node-version: key. This repo pins bun-version in ` +
          "five places (ADR-0015/ADR-0030); a node-version key is a sixth " +
          "toolchain this repo does not otherwise have."
      );
    });

    test(`${name}: no bare node/npm/npx/yarn/pnpm run-step`, () => {
      // Scans trimmed lines for a shell command that OPENS on one of these
      // binaries — the shape a `run:` step (inline or block-scalar) actually
      // takes on disk — while skipping comment lines outright, so a comment
      // such as codeql.yml's mention of `node_modules` is read as prose, not
      // as a step. `\s` after the binary name is what keeps `node_modules`,
      // `node:fs`, and `@astrojs/node` (none followed by a space) from ever
      // matching.
      const offending = stripped
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !line.startsWith("#"))
        .filter((line) => {
          const inline = line.match(/^run:\s*(\S+)/);
          const bare = line.match(/^(\S+)\s/) ?? line.match(/^(\S+)$/);
          const first = (inline ?? bare)?.[1] ?? "";
          return RUNTIME_BINARIES.includes(first);
        });

      assert.deepEqual(
        offending,
        [],
        `${name} runs a step whose command opens on a Node.js-runtime binary: ` +
          `${JSON.stringify(offending)}`
      );
    });
  }
});

describe("Dockerfile builds and runs on nothing but oven/bun (ADR-0050)", () => {
  test("every FROM line references an oven/bun image", () => {
    const froms = [...dockerfile.matchAll(/^FROM\s+(\S+)/gm)].map((m) => m[1]);

    assert.ok(froms.length > 0, "no FROM line found in Dockerfile");

    for (const ref of froms) {
      assert.match(
        ref,
        /^oven\/bun:/,
        `Dockerfile FROM references "${ref}", not an oven/bun image. A base ` +
          "image swapped for a generic node/debian/alpine image is a Node.js " +
          "(or no-runtime-at-all) container built and shipped with every other " +
          "gate in this repo still green."
      );
    }
  });

  test("CMD/ENTRYPOINT invoke bun, in either exec or shell form", () => {
    const instructions = [...dockerfile.matchAll(/^(CMD|ENTRYPOINT)\s+(.+)$/gm)];

    assert.ok(
      instructions.length > 0,
      "no CMD or ENTRYPOINT instruction found in Dockerfile"
    );

    for (const [, kind, value] of instructions) {
      const trimmed = value.trim();
      const command = trimmed.startsWith("[")
        ? JSON.parse(trimmed)[0] // exec form: `["bun", "dist/server/penyaji.mjs"]`
        : trimmed.match(/^(\S+)/)?.[1]; // shell form: `bun dist/server/penyaji.mjs`

      assert.equal(
        command,
        "bun",
        `Dockerfile ${kind} ${trimmed} does not invoke bun as its first ` +
          "argument. The image's whole point (ADR-0016) is a Bun process " +
          "serving the build output; a container that starts anything else " +
          "is not this repo's release artefact any more."
      );
    }
  });
});

describe("every shebang under scripts/ and server/ names bun, not node (ADR-0050)", () => {
  // Files with NO shebang (a handful of scripts/*.mjs are only ever invoked
  // as `bun scripts/x.mjs`, never executed directly) are outside this rule —
  // only a file that DECLARES an interpreter can declare the wrong one.
  const candidateDirs = ["scripts", "server"];
  const firstLines = candidateDirs.flatMap((dir) =>
    readdirSync(dir)
      .filter((name) => name.endsWith(".mjs"))
      .map((name) => {
        const path = join(dir, name);
        const firstLine = readFileSync(path, "utf8").split("\n", 1)[0];
        return { path, firstLine };
      })
  );

  test("at least one shebang line was actually found", () => {
    // Guards the loop below against a directory rename making every case
    // below pass vacuously.
    const withShebang = firstLines.filter(({ firstLine }) => firstLine.startsWith("#!"));
    assert.ok(
      withShebang.length > 0,
      "no shebang line found under scripts/ or server/ at all"
    );
  });

  for (const { path, firstLine } of firstLines) {
    if (!firstLine.startsWith("#!")) continue; // no interpreter declared — not this rule's concern

    test(`${path}: shebang names bun`, () => {
      assert.equal(
        firstLine,
        "#!/usr/bin/env bun",
        `${path} opens with "${firstLine}", not "#!/usr/bin/env bun". A ` +
          "script executed directly (outside `bun run`) would launch under " +
          "whatever interpreter its shebang names — `env node` here would " +
          "run this file as a Node.js script the moment someone chmod +x's it."
      );
    });
  }
});

/**
 * The two deliberate keeps, checked from the other direction.
 *
 * Every assertion above is a denylist: it never once inspects an import
 * statement or a dependency name, so `@astrojs/node`, `compression`, and every
 * `node:*` builtin pass through it without being named. That silence is
 * correct, but silence alone does not distinguish "this gate permits it" from
 * "this gate forgot to check it" — and ADR-0050 is explicit that both
 * packages are KEPT ON PURPOSE, not merely un-noticed. These two assertions
 * make that purpose fail loudly if either package disappears without the
 * decision that would have to accompany removing it.
 */
describe("the two deliberate non-removals stay declared (ADR-0050)", () => {
  test("@astrojs/node remains a dependency", () => {
    assert.ok(
      pkg.dependencies?.["@astrojs/node"],
      "@astrojs/node is no longer in dependencies. It is kept on purpose " +
        "(ADR-0050): it owns URL-to-file-path resolution — the `..`, " +
        "double-encoded-path, and symlink defect class server/penyaji.mjs's " +
        "own docblock says it will not reimplement. If removing it is " +
        "deliberate, that reimplementation has to land WITH its removal, and " +
        "ADR-0050 needs a superseding decision, not a quiet dependency bump."
    );
  });

  test("compression remains a dependency", () => {
    assert.ok(
      pkg.dependencies?.compression,
      "compression is no longer in dependencies. It is kept on purpose " +
        "(ADR-0050): it negotiates Brotli — ~15-20% smaller than gzip for " +
        "HTML per docs/awcms-astro/standar-performa-dan-keamanan.md — and " +
        "carries negotiator (Accept-Encoding q-values) and compressible (a " +
        "curated MIME table) so this repo does not reimplement either. If " +
        "removing it is deliberate, ADR-0050 needs a superseding decision."
    );
  });
});
