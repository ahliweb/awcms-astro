/**
 * The browser accessibility gate (ADR-0056): axe-core in a real Chromium,
 * against the production build served by `server/penyaji.mjs`, so the strict CSP
 * of ADR-0019 applies exactly as in production.
 *
 * ## The rule
 *
 * Any violation under the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and
 * `wcag22aa` fails the test — all impacts, no exclusions, no `disableRules`. A
 * real finding is fixed in the code; it is never added to a list here.
 *
 * ## Why every case also checks the page is really in the state it names
 *
 * A gate that passes because the page never reached the state under test is the
 * failure this repo keeps writing rules against. So each case asserts the
 * attribute the reading-preferences panel sets (ADR-0055), or that the search
 * results arrived, BEFORE axe runs.
 *
 * ## What axe cannot see
 *
 * Roughly a third of WCAG needs a human: meaningful alt text, a sensible focus
 * order, whether a label makes sense. A green run here is "no automatable
 * violation", never "accessible", and nothing in this repo may claim otherwise.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const TAG_WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const KUNCI = "awcms-a11y";

const MATI = {
  v: 1,
  text: "normal",
  contrast: false,
  mono: false,
  dyslexia: false,
  underline: false,
  highlight: false,
  motion: false
};

/** Every reading-preferences mode, and the `<html>` attribute it must set. */
const MODE = [
  ["teks besar", { text: "large" }, "data-a11y-text", "large"],
  ["teks sangat besar", { text: "x-large" }, "data-a11y-text", "x-large"],
  ["kontras tinggi", { contrast: true }, "data-a11y-contrast", null],
  ["monokrom", { mono: true }, "data-a11y-mono", null],
  ["ramah disleksia", { dyslexia: true }, "data-a11y-dyslexia", null],
  ["garis bawah tautan", { underline: true }, "data-a11y-underline", null],
  ["sorot tautan", { highlight: true }, "data-a11y-highlight", null],
  ["kurangi gerakan", { motion: true }, "data-a11y-motion", "reduce"]
];

const SEMUA = {
  v: 1,
  text: "x-large",
  contrast: true,
  mono: true,
  dyslexia: true,
  underline: true,
  highlight: true,
  motion: true
};

const HALAMAN = [
  ["beranda", "/"],
  ["beranda (en)", "/en/"],
  ["daftar tab", "/panduan/"],
  ["artikel", "/panduan/paspor/"],
  ["artikel (en)", "/en/panduan/paspor/"],
  ["arsip kategori", "/kategori/dokumen/"],
  ["arsip tag", "/tag/gratis/"],
  ["pencarian kosong", "/cari/"],
  ["pencarian dengan hasil", "/cari/?q=paspor"],
  ["privasi", "/privasi/"],
  ["peta situs", "/sitemap/"]
];

async function periksa(page) {
  const hasil = await new AxeBuilder({ page }).withTags(TAG_WCAG).analyze();

  // The message lists every violation with its nodes: a bare count tells nobody
  // what to fix.
  const ringkas = hasil.violations.map((v) => ({
    id: v.id,
    dampak: v.impact,
    bantuan: v.helpUrl,
    node: v.nodes.map((n) => n.target.join(" ")).slice(0, 5)
  }));

  expect(ringkas, JSON.stringify(ringkas, null, 2)).toEqual([]);
}

async function buka(page, jalur, { tema = "light", preferensi = null } = {}) {
  await page.addInitScript(
    ([kunci, nilai, temaDipilih]) => {
      try {
        if (nilai) localStorage.setItem(kunci, JSON.stringify(nilai));
        localStorage.setItem("theme", temaDipilih);
      } catch {
        /* storage blocked: the case's own assertion below will say so */
      }
    },
    [KUNCI, preferensi, tema]
  );

  const respons = await page.goto(jalur);
  expect(respons?.status(), `${jalur} harus menjawab 200`).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("data-theme", tema);
  await expect(page.locator("html")).toHaveAttribute("data-a11y-ready", /.*/);

  if (jalur.startsWith("/cari/?q=")) {
    await expect(page.locator("[data-cari-hasil] > *").first()).toBeVisible();
  }

  // Fonts and every FINITE animation settle before contrast is measured. axe
  // reads the colour the element has at this instant, so a fade-in caught half
  // way reports a contrast that no reader ever sees for more than a moment, and
  // the same page passes or fails depending on the machine's speed.
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined))
    );
  });
}

for (const tema of ["light", "dark"]) {
  test.describe(`halaman, ${tema}`, () => {
    for (const [nama, jalur] of HALAMAN) {
      test(nama, async ({ page }) => {
        await buka(page, jalur, { tema });
        await expect(page.locator("main")).toBeVisible();
        await periksa(page);
      });
    }
  });

  test.describe(`beranda dengan satu mode panel aktif, ${tema}`, () => {
    for (const [nama, ubah, atribut, nilai] of MODE) {
      test(nama, async ({ page }) => {
        await buka(page, "/", { tema, preferensi: { ...MATI, ...ubah } });
        const html = page.locator("html");

        if (nilai === null) await expect(html).toHaveAttribute(atribut, /.*/);
        else await expect(html).toHaveAttribute(atribut, nilai);

        await periksa(page);
      });
    }

    test("semua mode sekaligus", async ({ page }) => {
      await buka(page, "/", { tema, preferensi: SEMUA });
      await expect(page.locator("html")).toHaveAttribute("data-a11y-text", "x-large");
      await expect(page.locator("html")).toHaveAttribute("data-a11y-contrast", /.*/);
      await periksa(page);
    });
  });
}

test.describe("semua mode aktif, lebar 360 px", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  for (const [nama, jalur] of [
    ["artikel", "/panduan/paspor/"],
    ["pencarian dengan hasil", "/cari/?q=paspor"],
    ["beranda", "/"]
  ]) {
    test(nama, async ({ page }) => {
      await buka(page, jalur, { preferensi: SEMUA });
      await expect(page.locator("html")).toHaveAttribute("data-a11y-text", "x-large");
      await periksa(page);

      // No horizontal scroll at the 360 px floor, even with every preference on.
      const meluap = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(meluap, "halaman meluap ke samping di 360 px").toBe(false);
    });
  }
});

for (const [nama, preferensi] of [
  ["bawaan", null],
  ["semua mode", SEMUA]
]) {
  test(`panel preferensi terbuka, ${nama}`, async ({ page }) => {
    await buka(page, "/", { preferensi });
    await page.locator("[data-a11y-button]").click();

    await expect(page.locator("[data-a11y-panel]")).toBeVisible();
    await expect(page.locator("[data-a11y-button]")).toHaveAttribute("aria-expanded", "true");

    await periksa(page);
  });
}
