/**
 * lockfile.mjs — reading `bun.lock`, which is JSONC and not JSON.
 *
 * ## Why this file exists
 *
 * The scanner below lived twice — in `cek-lockfile.mjs` and in `sbom.mjs` —
 * with `diff` reporting exactly one differing line, the `export` keyword.
 *
 * The copy carried its reason in a docblock: importing the original would have
 * RUN the lockfile gate, because that script is top-level and can
 * `process.exit`. That premise has since collapsed twice over. `sbom.mjs`
 * guards its own driver with `if (import.meta.main)`, and since ADR-0039 this
 * repo has a side-effect-free `scripts/lib/` that two scripts already import.
 * A module that only declares functions cannot exit anything.
 *
 * What made the duplication worth removing rather than tolerating is that the
 * coverage was **asymmetric**: only `sbom.mjs`'s copy was exported, so only it
 * was reachable from `tests/sbom.test.mjs`. A fix to the scanner applied there
 * left `cek-lockfile.mjs` on the old behaviour, where the symptom is
 * `JSON.parse` failing and the gate reporting "Tidak bisa membaca bun.lock"
 * about a lockfile that is perfectly fine.
 *
 * `bacaJsonc` is deliberately NOT here. It exists only in `cek-lockfile.mjs`,
 * wrapped in that gate's own exit-1 error handling — `sbom.mjs` inlines its
 * read instead. One caller is not a shared rule.
 */

/**
 * Strip JSONC trailing commas so `JSON.parse` accepts the text.
 *
 * A regex is the wrong tool and was rejected: a comma inside a string literal
 * (`"a, b"`) matches the same shape as a structural one, so a naive
 * `,\s*([}\]])` replacement corrupts data it was never meant to touch. This
 * scanner tracks string and escape state, and drops a comma only when it is
 * genuinely outside a string and followed by `}` or `]`.
 *
 * @param {string} teks
 * @returns {string}
 */
export function buangTrailingComma(teks) {
  let hasil = "";
  let diDalamString = false;
  let terescape = false;

  for (let i = 0; i < teks.length; i += 1) {
    const c = teks[i];

    if (diDalamString) {
      hasil += c;
      if (terescape) terescape = false;
      else if (c === "\\") terescape = true;
      else if (c === '"') diDalamString = false;
      continue;
    }

    if (c === '"') {
      diDalamString = true;
      hasil += c;
      continue;
    }

    if (c === ",") {
      let j = i + 1;
      while (j < teks.length && /\s/.test(teks[j])) j += 1;
      if (teks[j] === "}" || teks[j] === "]") continue;
    }

    hasil += c;
  }

  return hasil;
}
