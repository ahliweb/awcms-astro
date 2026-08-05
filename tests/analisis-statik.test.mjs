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

  // Blok langkah ringkasan, dari namanya sampai akhir berkas — bukan seluruh
  // berkas: review adversarial menunjukkan asersi atas seluruh berkas tetap
  // hijau ketika kalimat batas `.astro` dihapus dari LANGKAHNYA, karena string
  // `.astro` juga hidup di komentar header workflow.
  const blokRingkasan = codeql.slice(codeql.indexOf("Nyatakan cakupan"));

  test("cakupan DINYATAKAN di ringkasan run — syarat penutupan celah 7", () => {
    assert.ok(
      blokRingkasan.length > 0 && blokRingkasan !== codeql.slice(-1),
      "langkah `Nyatakan cakupan` tidak ditemukan di codeql.yml"
    );
    assert.match(blokRingkasan, /GITHUB_STEP_SUMMARY/);
    assert.match(
      blokRingkasan,
      /TIDAK dianalisis.*\.astro|\.astro.*TIDAK dianalisis/s,
      "ringkasan berhenti menyatakan bahwa berkas .astro TIDAK dianalisis — " +
        "itu syarat literal yang membuat celah 7 boleh ditutup"
    );
  });

  test("dihitung langsung dari berkas TERLACAK, bukan daftar direktori tulisan tangan", () => {
    // Draf pertama memakai `find` atas lima direktori dan melewatkan
    // `astro.config.mjs` di akar — daftar direktori adalah bentuk lain dari
    // angka yang ditulis tangan. `git ls-files` menghitung persis korpus yang
    // ekstraktor baca, apa pun letak berkas barunya.
    assert.match(
      blokRingkasan,
      /git ls-files '\*\.astro'/,
      "jumlah .astro harus dihitung git ls-files, bukan konstanta atau daftar direktori"
    );
    assert.match(blokRingkasan, /git ls-files '\*\.ts' '\*\.mjs' '\*\.js'/);
  });
});
