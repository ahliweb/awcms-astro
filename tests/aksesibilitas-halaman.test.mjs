/**
 * Gate for the pre-existing public-page accessibility defects axe found
 * (issue #179, WCAG 2.2 AA). Static by design: this repo has no browser test
 * runner (see `tests/aksesibilitas.test.mjs`), so what is proven here is what
 * can be proven without one — the contrast of the real tokens in
 * `src/styles/global.css`, and the markup that carried each defect. The axe
 * run itself (WCAG 2.2 AA tags, light and dark, 360 and 1280 px) is recorded in
 * the PR; a browser gate remains a follow-up.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const css = read("src/styles/global.css");
const home = read("src/components/views/Home.astro");
const layout = read("src/layouts/BaseLayout.astro");
const buletin = read("src/components/FormBuletin.astro");
const lang = read("src/components/LangSwitcher.astro");

/** Token value declared inside the first block opened by `selector`. */
function token(selector, name) {
  const start = css.indexOf(`${selector} {`);
  expect(start).not.toBe(-1);
  const block = css.slice(start, css.indexOf("}", start));
  const match = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  expect(match).not.toBeNull();
  return match[1];
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The rule body of `.selector { ... }` inside a component or stylesheet. */
function rule(source, selector) {
  const start = source.indexOf(`${selector} {`);
  expect(start).not.toBe(-1);
  return source.slice(start, source.indexOf("}", start));
}

const themes = [
  [":root", "light"],
  ['[data-theme="dark"]', "dark"]
];

describe("1.4.3 contrast of the text colours these rules actually use", () => {
  test("`.seksi-tautan` uses --accent-hover, not --accent-primary", () => {
    expect(rule(home, ".seksi-tautan")).toContain("color: var(--accent-hover)");
  });

  test("`.prinsip-nomor` uses --accent-hover on --accent-subtle", () => {
    const body = rule(home, ".prinsip-nomor");
    expect(body).toContain("background: var(--accent-subtle)");
    expect(body).toContain("color: var(--accent-hover)");
  });

  for (const [selector, name] of themes) {
    test(`${name}: --accent-hover reaches 4.5:1 on every surface it is drawn on`, () => {
      const text = token(selector, "--accent-hover");
      for (const surface of ["--bg-primary", "--accent-subtle"]) {
        const ratio = contrast(text, token(selector, surface));
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

describe("name of `.cari-tautan` (4.1.2 / 2.4.4)", () => {
  test("the narrow-screen rule hides the label visually, never with display:none", () => {
    const narrow = css.slice(css.indexOf("@media (max-width: 480px)"));
    const body = rule(narrow, ".cari-tautan span");
    expect(body).not.toMatch(/display:\s*none/);
    expect(body).toContain("clip-path");
  });
});

describe("2.5.3 label in name on the language <summary>", () => {
  test("the aria-label contains the visible ISO code", () => {
    const summary = lang.match(/<summary class[\s\S]*?>/)[0];
    expect(summary).toContain("localeMeta[locale].iso.toUpperCase()");
    expect(summary).toMatch(/aria-label=\{`\$\{t\(locale, 'lang\.switch\.label'\)\}: /);
  });
});

describe("heading order of the footer (1.3.1)", () => {
  test("footer column titles are <h2>, never <h4> under a missing <h3>", () => {
    for (const source of [layout, buletin]) {
      expect(source).not.toMatch(/<h4 class="footer-judul/);
      expect(source).toMatch(/<h2 class="footer-judul/);
    }
  });

  test("`.footer-judul` cancels the global h2 top margin", () => {
    expect(rule(layout, ".footer-judul")).toContain("margin-top: 0");
  });
});
