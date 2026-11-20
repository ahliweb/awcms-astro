/**
 * Gate for the reading-preferences panel (ADR-0055).
 *
 * Three layers, because the panel fails in three different places:
 *
 *   1. The pure logic in `src/lib/aksesibilitas.ts` — storage parsing, OS
 *      defaults, attributes. Plain functions over plain values.
 *   2. PARITY between that module and `public/aksesibilitas.js`. The early
 *      script cannot import the module (it must be a classic blocking file), so
 *      it carries a hand-written copy of the same rules. Nothing else would
 *      notice the copies drifting: both are valid, and the page still works —
 *      it just applies a different preference on first paint than the panel
 *      shows once it opens.
 *   3. The shape of the stylesheet and of the BUILD OUTPUT: the button is
 *      rendered `hidden`, the early script is a same-origin file, nothing is
 *      inline, and no rule puts a filter anywhere but on <html>.
 *
 * What this file cannot prove, and does not pretend to: focus handling, the
 * Esc and outside-click behaviour, and contrast with the panel open all need a
 * real browser. This repo has no Playwright or axe; adding them is a recorded
 * follow-up, not part of this change.
 *
 * Layer 3's output half skips itself, and says so, when `dist/client` does not
 * exist — see `tests/keluaran-csp.test.mjs` for why a silent skip is not proof.
 */
import { describe, expect, test } from "bun:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";

import {
  DEFAULT_PREFERENCES,
  PREFERENCE_ATTRIBUTES,
  READY_ATTRIBUTE,
  STORAGE_KEY,
  SWITCHES,
  applyAttributes,
  attributesFor,
  clearAttributes,
  clearPreferences,
  parsePreferences,
  readOsDefaults,
  readPreferences,
  resolvePreferences,
  serializePreferences,
  writePreferences
} from "../src/lib/aksesibilitas.ts";

const VALID = {
  v: 1,
  text: "large",
  contrast: true,
  mono: false,
  dyslexia: true,
  underline: false,
  highlight: true,
  motion: false
};

/** A `Storage` stand-in that remembers what it is given. */
function memoryStorage(initial) {
  const map = new Map(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
    map
  };
}

/** A `Storage` stand-in whose every call throws, like blocked site data. */
const THROWING_STORAGE = {
  getItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new Error("blocked");
  },
  removeItem() {
    throw new Error("blocked");
  }
};

/** An element stand-in that records attributes. */
function fakeRoot() {
  const attributes = new Map();
  return {
    attributes,
    setAttribute: (name, value) => void attributes.set(name, String(value)),
    removeAttribute: (name) => void attributes.delete(name)
  };
}

const matchMediaFor = (...active) => (query) => ({ matches: active.includes(query) });
const CONTRAST_MORE = "(prefers-contrast: more)";
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

describe("parsePreferences — anything but the exact v1 shape is 'no stored preference'", () => {
  test("a valid stored object round-trips", () => {
    assert.deepEqual(parsePreferences(JSON.stringify(VALID)), VALID);
    assert.deepEqual(parsePreferences(serializePreferences(VALID)), VALID);
  });

  test("a valid object (not a string) is accepted, for callers that already parsed", () => {
    assert.deepEqual(parsePreferences(VALID), VALID);
  });

  test("invalid JSON, empty, and non-object values are null", () => {
    for (const raw of ["{", "", "null", "[]", "42", '"large"', null, undefined, 7, true]) {
      assert.equal(parsePreferences(raw), null, `raw=${JSON.stringify(raw)}`);
    }
  });

  test("a wrong or missing version is null", () => {
    for (const v of [0, 2, "1", null, undefined]) {
      assert.equal(parsePreferences({ ...VALID, v }), null, `v=${String(v)}`);
    }
    const { v: _omitted, ...withoutVersion } = VALID;
    assert.equal(parsePreferences(withoutVersion), null);
  });

  test("an unknown text size is null", () => {
    for (const text of ["huge", "Large", "", null, 1, undefined]) {
      assert.equal(parsePreferences({ ...VALID, text }), null, `text=${String(text)}`);
    }
  });

  test("a missing or non-boolean switch is null, never a half-valid object", () => {
    for (const key of SWITCHES) {
      assert.equal(parsePreferences({ ...VALID, [key]: "true" }), null, `${key}="true"`);
      assert.equal(parsePreferences({ ...VALID, [key]: 1 }), null, `${key}=1`);
      const copy = { ...VALID };
      delete copy[key];
      assert.equal(parsePreferences(copy), null, `${key} missing`);
    }
  });

  test("extra keys are dropped rather than carried into storage", () => {
    const parsed = parsePreferences({ ...VALID, tracking: "x" });
    assert.deepEqual(parsed, VALID);
    assert.equal("tracking" in parsed, false);
  });
});

describe("serializePreferences — one fixed shape", () => {
  test("writes exactly the documented keys, in order", () => {
    assert.equal(
      serializePreferences(VALID),
      '{"v":1,"text":"large","contrast":true,"mono":false,"dyslexia":true,"underline":false,"highlight":true,"motion":false}'
    );
  });

  test("the defaults are all-off at normal size", () => {
    assert.deepEqual(DEFAULT_PREFERENCES, {
      v: 1,
      text: "normal",
      contrast: false,
      mono: false,
      dyslexia: false,
      underline: false,
      highlight: false,
      motion: false
    });
  });
});

describe("storage helpers never throw", () => {
  test("read: absent, invalid, valid, and throwing storage", () => {
    assert.equal(readPreferences(memoryStorage()), null);
    assert.equal(readPreferences(memoryStorage("{not json")), null);
    assert.deepEqual(readPreferences(memoryStorage(JSON.stringify(VALID))), VALID);
    assert.equal(readPreferences(THROWING_STORAGE), null);
    assert.equal(readPreferences(null), null);
  });

  test("write stores the whole object under awcms-a11y and reports success", () => {
    const storage = memoryStorage();
    assert.equal(STORAGE_KEY, "awcms-a11y");
    assert.equal(writePreferences(storage, VALID), true);
    assert.equal(storage.map.get("awcms-a11y"), serializePreferences(VALID));
  });

  test("write reports failure on blocked or missing storage instead of throwing", () => {
    assert.equal(writePreferences(THROWING_STORAGE, VALID), false);
    assert.equal(writePreferences(null, VALID), false);
  });

  test("clear removes the key; blocked or missing storage does not throw", () => {
    const storage = memoryStorage(JSON.stringify(VALID));
    assert.equal(clearPreferences(storage), true);
    assert.equal(storage.map.has("awcms-a11y"), false);
    assert.equal(clearPreferences(THROWING_STORAGE), false);
    assert.equal(clearPreferences(null), false);
  });
});

describe("OS defaults", () => {
  test("readOsDefaults reads the two media queries", () => {
    assert.deepEqual(readOsDefaults(matchMediaFor()), { moreContrast: false, reduceMotion: false });
    assert.deepEqual(readOsDefaults(matchMediaFor(CONTRAST_MORE)), {
      moreContrast: true,
      reduceMotion: false
    });
    assert.deepEqual(readOsDefaults(matchMediaFor(REDUCE_MOTION)), {
      moreContrast: false,
      reduceMotion: true
    });
  });

  test("a missing or throwing matchMedia means no preference", () => {
    const none = { moreContrast: false, reduceMotion: false };
    assert.deepEqual(readOsDefaults(undefined), none);
    assert.deepEqual(
      readOsDefaults(() => {
        throw new Error("no matchMedia");
      }),
      none
    );
  });

  test("with nothing stored, contrast and motion follow the OS and the rest are off", () => {
    const resolved = resolvePreferences(null, { moreContrast: true, reduceMotion: true });
    assert.deepEqual(resolved, { ...DEFAULT_PREFERENCES, contrast: true, motion: true });
    assert.deepEqual(
      resolvePreferences(null, { moreContrast: false, reduceMotion: false }),
      DEFAULT_PREFERENCES
    );
  });

  test("a stored object wins outright — including a stored 'off' the OS disagrees with", () => {
    const stored = { ...DEFAULT_PREFERENCES, contrast: false, motion: false };
    assert.deepEqual(resolvePreferences(stored, { moreContrast: true, reduceMotion: true }), stored);
  });
});

describe("attributes", () => {
  test("an all-off preference set produces no attribute at all", () => {
    for (const value of Object.values(attributesFor(DEFAULT_PREFERENCES))) {
      assert.equal(value, null);
    }
    const root = fakeRoot();
    applyAttributes(root, DEFAULT_PREFERENCES);
    assert.equal(root.attributes.size, 0);
  });

  test("every preference maps to its documented attribute", () => {
    assert.deepEqual(attributesFor({ ...VALID, text: "x-large", mono: true, underline: true, motion: true }), {
      "data-a11y-text": "x-large",
      "data-a11y-contrast": "",
      "data-a11y-mono": "",
      "data-a11y-dyslexia": "",
      "data-a11y-underline": "",
      "data-a11y-highlight": "",
      "data-a11y-motion": "reduce"
    });
    assert.equal(attributesFor({ ...DEFAULT_PREFERENCES, text: "large" })["data-a11y-text"], "large");
  });

  test("applyAttributes sets and removes, and clearAttributes keeps the ready marker", () => {
    const root = fakeRoot();
    root.setAttribute(READY_ATTRIBUTE, "");
    applyAttributes(root, VALID);
    assert.equal(root.attributes.get("data-a11y-text"), "large");
    assert.equal(root.attributes.get("data-a11y-contrast"), "");
    assert.equal(root.attributes.has("data-a11y-mono"), false);

    applyAttributes(root, { ...VALID, contrast: false, text: "normal" });
    assert.equal(root.attributes.has("data-a11y-contrast"), false);
    assert.equal(root.attributes.has("data-a11y-text"), false);

    clearAttributes(root);
    for (const name of PREFERENCE_ATTRIBUTES) assert.equal(root.attributes.has(name), false, name);
    assert.equal(root.attributes.has(READY_ATTRIBUTE), true, "reset must not unmark ready");
  });
});

/* ----------------------------------------------------- parity with the early script */

const EARLY_SCRIPT = readFileSync("public/aksesibilitas.js", "utf8");

/**
 * Run `public/aksesibilitas.js` against a fake page and return the attributes
 * it set. `storage` is what `localStorage` is: a stand-in, a throwing
 * stand-in, or `"missing"` for a browser where merely reading
 * `window.localStorage` throws.
 */
function runEarlyScript({ storage, os = [], matchMedia = true }) {
  const root = fakeRoot();
  const window = {};
  if (matchMedia) window.matchMedia = matchMediaFor(...os);
  const context = {
    document: { documentElement: root },
    window
  };
  if (storage === "missing") {
    Object.defineProperty(context, "localStorage", {
      get() {
        throw new Error("blocked");
      }
    });
  } else {
    context.localStorage = storage;
  }
  vm.runInNewContext(EARLY_SCRIPT, context);
  return root.attributes;
}

/** What the module says the same situation should produce. */
function expectedAttributes({ storage, os = [] }) {
  const stored = storage === "missing" ? null : readPreferences(storage);
  const resolved = resolvePreferences(stored, readOsDefaults(matchMediaFor(...os)));
  const root = fakeRoot();
  applyAttributes(root, resolved);
  root.setAttribute(READY_ATTRIBUTE, "");
  return root.attributes;
}

describe("public/aksesibilitas.js agrees with src/lib/aksesibilitas.ts", () => {
  const raws = {
    "nothing stored": undefined,
    "valid, all on": JSON.stringify({
      ...VALID,
      text: "x-large",
      mono: true,
      underline: true,
      motion: true
    }),
    "valid, all off": serializePreferences(DEFAULT_PREFERENCES),
    "invalid JSON": "{oops",
    "wrong version": JSON.stringify({ ...VALID, v: 2 }),
    "unknown text size": JSON.stringify({ ...VALID, text: "huge" }),
    "non-boolean switch": JSON.stringify({ ...VALID, mono: "yes" })
  };
  const environments = {
    "no OS preference": [],
    "OS asks for more contrast": [CONTRAST_MORE],
    "OS asks for reduced motion": [REDUCE_MOTION],
    "OS asks for both": [CONTRAST_MORE, REDUCE_MOTION]
  };

  for (const [rawName, raw] of Object.entries(raws)) {
    for (const [osName, os] of Object.entries(environments)) {
      test(`${rawName} / ${osName}`, () => {
        const storage = memoryStorage(raw);
        assert.deepEqual(
          [...runEarlyScript({ storage, os })].sort(),
          [...expectedAttributes({ storage, os })].sort()
        );
      });
    }
  }

  test("storage whose methods throw falls back to the OS defaults", () => {
    const os = [CONTRAST_MORE];
    assert.deepEqual(
      [...runEarlyScript({ storage: THROWING_STORAGE, os })].sort(),
      [...expectedAttributes({ storage: THROWING_STORAGE, os })].sort()
    );
  });

  test("a localStorage that throws on access does not stop the script", () => {
    const attributes = runEarlyScript({ storage: "missing", os: [REDUCE_MOTION] });
    assert.equal(attributes.get("data-a11y-motion"), "reduce");
    assert.equal(attributes.has(READY_ATTRIBUTE), true);
  });

  test("a missing matchMedia does not stop the script", () => {
    const attributes = runEarlyScript({ storage: memoryStorage(), matchMedia: false });
    assert.equal(attributes.size, 1);
    assert.equal(attributes.has(READY_ATTRIBUTE), true);
  });
});

/* ------------------------------------------------------------- the stylesheet */

const CSS = readFileSync("src/styles/aksesibilitas.css", "utf8");
const CSS_NO_COMMENTS = CSS.replace(/\/\*[\s\S]*?\*\//g, "");

describe("src/styles/aksesibilitas.css", () => {
  test("every attribute the panel can set has a rule scoped under it", () => {
    for (const name of PREFERENCE_ATTRIBUTES) {
      assert.ok(
        CSS_NO_COMMENTS.includes(`html[${name}`),
        `no rule keyed on html[${name}] — the panel would set an attribute that changes nothing`
      );
    }
  });

  test("monochrome is a filter on <html> and nowhere else", () => {
    // A filter on any other element makes it the containing block of its
    // `position: fixed` descendants: the floating button would scroll away.
    const filters = [...CSS_NO_COMMENTS.matchAll(/([^{}]+)\{[^{}]*\bfilter\s*:[^{}]*\}/g)].map(
      (m) => m[1].trim()
    );
    assert.deepEqual(filters, ["html[data-a11y-mono]"]);
  });

  test("the high-contrast palette is never applied under forced colours", () => {
    // The attribute palette sits inside `@media (forced-colors: none)` and the
    // OS-driven one inside a query that also requires `forced-colors: none`.
    const sansForced = CSS_NO_COMMENTS.replace(
      /@media[^{]*forced-colors:\s*none[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g,
      ""
    );
    assert.equal(
      /--text-primary\s*:/.test(sansForced),
      false,
      "a --text-primary override sits outside every `forced-colors: none` query"
    );
  });

  test("the floating button is fixed, so it cannot shift layout", () => {
    const block = CSS_NO_COMMENTS.match(/\.a11y-button\s*\{([^}]*)\}/)?.[1] ?? "";
    assert.match(block, /position:\s*fixed/);
  });

  test("the panel and button are not printed", () => {
    assert.match(CSS_NO_COMMENTS, /@media print\s*\{[^}]*\.a11y-button[^}]*\.a11y-panel[^}]*display:\s*none/s);
  });

  test("the panel stylesheet loads after global.css, which it overrides", () => {
    const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
    const global = layout.indexOf("'../styles/global.css'");
    const panel = layout.indexOf("'../styles/aksesibilitas.css'");
    assert.ok(global !== -1 && panel !== -1, "BaseLayout imports both stylesheets");
    assert.ok(panel > global, "aksesibilitas.css must be imported AFTER global.css");
  });
});

/* ------------------------------------------------------------- the source layout */

describe("BaseLayout wiring", () => {
  const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");

  test("the early script is a classic file, after tema.js", () => {
    const tema = layout.indexOf('<script is:inline src="/tema.js"></script>');
    const a11y = layout.indexOf('<script is:inline src="/aksesibilitas.js"></script>');
    assert.ok(tema !== -1 && a11y !== -1, "both early scripts are present");
    assert.ok(a11y > tema, "aksesibilitas.js must come after tema.js: its palette keys on data-theme");
  });

  test("the panel is rendered by the layout, so every public page has it", () => {
    assert.match(layout, /<PanelAksesibilitas\b/);
  });
});

/* ---------------------------------------------------------- the build output */

const OUTPUT = "dist/client";
const hasOutput = existsSync(OUTPUT);

if (!hasOutput) {
  console.log(
    `[a11y] Output gate SKIPPED: ${OUTPUT} does not exist.\n` +
      "       It is born from `bun run build`, which needs an awcms content source.\n" +
      "       In a site, run `bun test` again after the build so this gate actually runs."
  );
}

describe.skipIf(!hasOutput)("build output carries the panel", () => {
  const pages = hasOutput
    ? [...new Bun.Glob("**/*.html").scanSync(OUTPUT)].map((name) => ({
        name,
        html: readFileSync(`${OUTPUT}/${name}`, "utf8")
      }))
    : [];

  test("there are pages to check", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  test("the early script is a file, and it is published", () => {
    assert.ok(existsSync(`${OUTPUT}/aksesibilitas.js`), "dist/client/aksesibilitas.js is missing");
    const without = pages.filter(({ html }) => !html.includes('<script src="/aksesibilitas.js">'));
    assert.deepEqual(
      without.map(({ name }) => name),
      [],
      "pages without the early reading-preferences script"
    );
  });

  test("the floating button is rendered hidden, with its name, state and target", () => {
    for (const { name, html } of pages) {
      const button = html.match(/<button\b[^>]*\bdata-a11y-button\b[^>]*>/)?.[0];
      assert.ok(button, `${name}: no floating button`);
      assert.match(button, /\shidden[\s>=]/, `${name}: the button must be hidden until the script reveals it`);
      assert.match(button, /aria-label="[^"]+"/, `${name}: no accessible name`);
      assert.match(button, /aria-expanded="false"/, `${name}: aria-expanded is not "false"`);
      assert.match(button, /aria-controls="a11y-panel"/, `${name}: aria-controls`);
    }
  });

  test("the panel is a hidden, non-modal dialog named by its heading", () => {
    for (const { name, html } of pages) {
      const panel = html.match(/<div\b[^>]*\bdata-a11y-panel\b[^>]*>/)?.[0];
      assert.ok(panel, `${name}: no panel`);
      assert.match(panel, /role="dialog"/, name);
      assert.match(panel, /aria-labelledby="a11y-title"/, name);
      assert.match(panel, /\shidden[\s>=]/, `${name}: the panel must start hidden`);
      assert.doesNotMatch(panel, /aria-modal/, `${name}: the panel is non-modal`);
      assert.match(html, /id="a11y-title"/, `${name}: the dialog's label target is missing`);
    }
  });

  test("the panel has its controls: three sizes, six switches, reset", () => {
    const { name, html } = pages[0];
    assert.equal(html.match(/name="a11y-text"/g)?.length, 3, `${name}: text size radios`);
    assert.equal(html.match(/role="switch"/g)?.length, 6, `${name}: switches`);
    assert.equal(html.match(/data-a11y-reset/g)?.length, 1, `${name}: reset`);
    for (const key of SWITCHES) {
      assert.match(html, new RegExp(`data-a11y-key="${key}"`), `${name}: switch ${key}`);
    }
  });

  test("the panel script is a same-origin bundle, never inline", () => {
    const { html } = pages[0];
    assert.match(
      html,
      /<script type="module" src="\/_astro\/PanelAksesibilitas[^"]*\.js"><\/script>/,
      "the panel bundle is not referenced as a file"
    );
  });
});
