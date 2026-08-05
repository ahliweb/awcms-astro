/**
 * Gerbang analisis statik (celah 7 ADR-0028, ditutup ADR-0032): workflow
 * CodeQL ada, terjadwal, dipin ke SHA, dan MENYATAKAN cakupannya.
 *
 * ## Kenapa yang dijaga adalah pernyataan cakupan, bukan hasil analisisnya
 *
 * Hasil analisis milik tab Security di GitHub — tidak ada yang bisa diasersi
 * dari sini. Yang bisa hilang diam-diam justru dua hal lain, dan keduanya
 * pernah terjadi di repo ini dalam bentuk lain:
 *
 *   1. **Langkah "Nyatakan cakupan" dihapus** saat seseorang merapikan
 *      workflow. Tanpa langkah itu, "repo ini dianalisis statik" menjadi klaim
 *      yang lebih besar daripada kenyataannya — CodeQL tidak mengurai
 *      `.astro`, dan menyatakan batas itu adalah SYARAT yang membuat celah 7
 *      boleh ditutup.
 *   2. **Pin SHA diganti tag** saat seseorang menaikkan versi dengan tangan.
 *      Tag bisa dipindahkan; action berjalan dengan akses ke token workflow
 *      (ADR-0030).
 *
 * Pola berkas ini sama dengan `tests/versi-toolchain.test.mjs`: asersi
 * struktural atas berkas workflow, karena berkas itulah yang menua.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const codeql = readFileSync(".github/workflows/codeql.yml", "utf8");

describe("workflow CodeQL — celah 7 ADR-0028", () => {
  test("setiap action dipin ke SHA commit dengan komentar versi", () => {
    const dipakai = [...codeql.matchAll(/uses:\s*(\S+)(.*)$/gm)];
    assert.ok(dipakai.length >= 3, "diharapkan minimal checkout + init + analyze");

    for (const [, rujukan, sisa] of dipakai) {
      assert.match(
        rujukan,
        /@[0-9a-f]{40}$/,
        `${rujukan} tidak dipin ke SHA commit (ADR-0030 — tag bisa dipindahkan)`
      );
      assert.match(
        sisa,
        /#\s*v\d/,
        `${rujukan} tanpa komentar versi yang Dependabot baca`
      );
    }
  });

  test("terjadwal — query CodeQL diperbarui GitHub, kode diam pun dipindai ulang", () => {
    assert.match(codeql, /schedule:\s*\n\s*-\s*cron:/);
  });

  test("bahasanya javascript-typescript — satu-satunya yang punya ekstraktor di sini", () => {
    assert.match(codeql, /languages:\s*javascript-typescript/);
  });

  test("izin unggah hasil dinyatakan, tidak diwarisi", () => {
    assert.match(codeql, /security-events:\s*write/);
  });

  test("cakupan DINYATAKAN di ringkasan run — syarat penutupan celah 7", () => {
    // Yang diasersi bukan kalimatnya melainkan dua penandanya: langkah itu ada,
    // dan ia menyebut `.astro` — batas yang membuat celah ini lama terbuka.
    // Langkah tanpa sebutan `.astro` adalah ringkasan yang berhenti mengatakan
    // bagian yang paling penting.
    assert.match(codeql, /Nyatakan cakupan/);
    assert.match(codeql, /GITHUB_STEP_SUMMARY/);
    assert.match(codeql, /\.astro/);
  });

  test("dihitung langsung, bukan ditulis tangan — angka tak bisa membusuk", () => {
    assert.match(
      codeql,
      /find src .*-name '\*\.astro'/,
      "jumlah berkas .astro di ringkasan harus dihitung find, bukan konstanta"
    );
  });
});
