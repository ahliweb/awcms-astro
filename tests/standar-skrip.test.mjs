/**
 * The gate over the shared script helpers — `scripts/lib/`.
 *
 * ## Why this file exists
 *
 * ADR-0030: a rule that is only written down gets broken sooner or later. The
 * refactor that created `scripts/lib/git.mjs`, `reporter.mjs`, `files.mjs` and
 * `lockfile.mjs` established four rules, and every one of them is the kind that
 * decays by ADDITION — nothing breaks when someone writes a second copy, so
 * nothing tells them not to.
 *
 * Each rule below is asserted in the direction it actually fails:
 *
 *   1. **No shell for git.** This is the only security assertion here, and it
 *      is not hypothetical. `scripts/rilis.mjs` used `execSync` with git's own
 *      output spliced into the command string; a git tag may contain `$`, a
 *      backtick, `;`, `&` and `|`, so a tag named `v9.9.9$(...)` executed its
 *      payload on the machine of whoever ran `bun run release`. Reproduced
 *      before the fix, and refused after it. The assertion is on the CALL
 *      SHAPE, because that is what makes the class impossible rather than
 *      merely absent today.
 *   2. **One finding/report apparatus.** Three gates used to carry byte
 *      identical printers. The cost of the copies was never today's output — it
 *      was that changing gate output means changing it three times, and the
 *      third is the one that gets missed.
 *   3. **One JSONC scanner.** Its two copies had ASYMMETRIC coverage: only
 *      `sbom.mjs`'s was exported and therefore tested, so a fix applied there
 *      left `cek-lockfile.mjs` on the old behaviour.
 *   4. **One `readFileIfPresent`.** Its copies sat in the checker and the
 *      stamper of the SAME policy, which is where drift is quietest: the
 *      stamper writes a tree the checker reads differently.
 *
 * Written in English per `AGENTS.md` §Language, matching `scripts/lib/`.
 */
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { formatReport } from "../scripts/lib/reporter.mjs";

const SCRIPT_DIR = "scripts";

/** Every `.mjs` directly under `scripts/`, i.e. the executable gates. */
const scripts = readdirSync(SCRIPT_DIR)
  .filter((name) => name.endsWith(".mjs"))
  .map((name) => ({ name, text: readFileSync(join(SCRIPT_DIR, name), "utf8") }));

/**
 * Comments and string literals removed, so a pattern named in a docblock is not
 * mistaken for the code it warns about. Without this every assertion here is
 * reddened by the very comments explaining why the rule exists.
 */
function codeOnly(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");
}

describe("scripts/lib/git.mjs — git never travels through a shell", () => {
  test("no script interpolates a value into an execSync command string", () => {
    for (const { name, text } of scripts) {
      const matches = [...codeOnly(text).matchAll(/execSync\(``/g)];
      // A template literal survives codeOnly() as ``. Any execSync taking one
      // had something interpolated into it — a constant command needs no
      // template literal at all.
      assert.equal(
        matches.length,
        0,
        `${name}: execSync with a template literal. A value interpolated into a ` +
          `shell command is the release-script injection all over again — use ` +
          `scripts/lib/git.mjs, which spawns an argv array.`
      );
    }
  });

  test("git is spawned only inside scripts/lib/git.mjs", () => {
    for (const { name, text } of scripts) {
      const code = codeOnly(text);
      assert.ok(
        !/spawnSync\(\s*\[\s*""/.test(code) || !/git/.test(code),
        `${name}: spawns a command array directly. Route it through ` +
          `scripts/lib/git.mjs so the null-on-failure contract stays in one place.`
      );
      assert.ok(
        !/execFileSync\(/.test(code),
        `${name}: uses execFileSync. Two gates used to crash with a raw ` +
          `node:child_process stack outside a git repo while a third reported ` +
          `SKIPPED; scripts/lib/git.mjs is what made all three agree.`
      );
    }
  });
});

describe("scripts/lib/reporter.mjs — one finding apparatus", () => {
  const gates = ["audit-konten.mjs", "audit-dokumen.mjs", "audit-graf.mjs"];

  test("every audit gate builds its report through createReporter", () => {
    for (const gate of gates) {
      const text = readFileSync(join(SCRIPT_DIR, gate), "utf8");
      assert.match(
        text,
        /import \{ createReporter \} from "\.\/lib\/reporter\.mjs"/,
        `${gate} no longer imports the shared reporter.`
      );
    }
  });

  test("no gate declares a second printer", () => {
    for (const gate of gates) {
      const code = codeOnly(readFileSync(join(SCRIPT_DIR, gate), "utf8"));
      assert.ok(
        !/const perGerbang = new Map\(\)/.test(code),
        `${gate}: re-declares the by-gate grouping. That block was byte ` +
          `identical in three files; it lives in scripts/lib/reporter.mjs now.`
      );
      assert.ok(
        !/const temuan = \[\]/.test(code),
        `${gate}: re-declares its own findings array instead of the reporter's.`
      );
    }
  });

  test("notes print whatever the outcome — a silent gate is a false tick", () => {
    const green = formatReport(["locale default \"id\"", "gambar: 0 berkas"], []);
    assert.equal(green.exitCode, 0);
    assert.match(green.text, /locale default/);
    assert.match(green.text, /gambar: 0 berkas/);
    assert.match(green.text, /✓ Tidak ada pelanggaran\./);

    // The red path must keep them too: the notes are what say which checks ran
    // at all, and that is exactly what a reader needs when something failed.
    const red = formatReport(["dilewati: dist/client belum ada"], [
      { gate: "seo", file: "a.html", message: "tanpa judul" }
    ]);
    assert.equal(red.exitCode, 1);
    assert.match(red.text, /dilewati: dist\/client belum ada/);
  });

  test("findings group by gate, and the count is the finding count", () => {
    const { text, exitCode } = formatReport([], [
      { gate: "label", file: "graph.json", message: "komunitas 0 tanpa nama" },
      { gate: "terlacak", file: "cache/x", message: "terlacak padahal cache" },
      { gate: "label", file: "graph.json", message: "komunitas 4 placeholder" }
    ]);

    assert.equal(exitCode, 1);
    assert.match(text, /✗ 3 pelanggaran:/);
    assert.match(text, /\[label\] 2/);
    assert.match(text, /\[terlacak\] 1/);
    // Grouped, so the two `label` findings are adjacent rather than split by
    // the `terlacak` one that was reported between them.
    assert.ok(
      text.indexOf("komunitas 4 placeholder") < text.indexOf("terlacak padahal cache"),
      "findings are not grouped by gate"
    );
  });
});

describe("scripts/lib/ — no helper is declared twice", () => {
  test("the JSONC scanner exists once", () => {
    const copies = scripts.filter(({ text }) =>
      /function buangTrailingComma\s*\(/.test(codeOnly(text))
    );
    assert.deepEqual(
      copies.map((c) => c.name),
      [],
      "buangTrailingComma is declared in a gate again. Its two copies had " +
        "asymmetric test coverage — only one was exported — so a fix to the " +
        "tested copy silently left the other behind."
    );
  });

  test("readFileIfPresent exists once", () => {
    const copies = scripts.filter(({ text }) =>
      /function readFileIfPresent\s*\(/.test(codeOnly(text))
    );
    assert.deepEqual(
      copies.map((c) => c.name),
      [],
      "readFileIfPresent is declared in a script again. Its copies sat in the " +
        "checker and the stamper of the same translation policy."
    );
  });

  test("scripts/lib/ modules are side-effect free — importing one runs nothing", () => {
    for (const name of readdirSync(join(SCRIPT_DIR, "lib"))) {
      const code = codeOnly(readFileSync(join(SCRIPT_DIR, "lib", name), "utf8"));

      // Column 0 only. `reporter.mjs` exits INSIDE `finish()` on purpose — that
      // is a gate delivering its verdict, and it runs when a caller asks. What
      // this refuses is an exit at MODULE level, which is the shape that made
      // `sbom.mjs` copy the JSONC scanner rather than import it: importing a
      // module that can exit means importing a decision you did not make.
      assert.ok(
        !/^process\.exit\(/m.test(code),
        `scripts/lib/${name}: exits at import time. The duplication this ` +
          `directory removed was justified for years by exactly that fear.`
      );

      // Nor may it print on import: the reporter's header is printed by
      // createReporter(), i.e. when a gate starts, never by the import itself.
      assert.ok(
        !/^console\.(log|error)\(/m.test(code),
        `scripts/lib/${name}: writes to stdout at import time.`
      );
    }
  });
});
