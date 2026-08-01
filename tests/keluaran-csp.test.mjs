/**
 * Gerbang CSP atas KELUARAN build.
 *
 * Aturan ini tidak bisa dijaga dengan membaca `src/`. Yang menentukan adalah
 * apa yang benar-benar terbit di `dist/client/`, dan ada dua jalur yang
 * memasukkan gaya inline ke sana tanpa satu pun `style=` tertulis di komponen:
 *
 *   1. **Astro menyisipkan stylesheet kecil** sebagai `<style>` di dalam HTML.
 *      Bawaannya (`inlineStylesheets: 'auto'`) melakukan itu untuk setiap
 *      stylesheet di bawah ~4 kB — perilaku yang bergantung pada UKURAN, jadi
 *      sebuah situs bisa patuh hari ini dan berhenti patuh besok karena
 *      CSS-nya mengecil. `astro.config.mjs` menyetelnya `'never'`; tes ini yang
 *      membuktikan setelan itu masih berlaku.
 *   2. **Komponen baru membawa `style=""`** di markup-nya.
 *
 * Keduanya gagal dengan cara yang sama di belakang CSP ketat
 * (`style-src 'self'` tanpa `'unsafe-inline'`, postur yang dipakai `awcms`
 * sendiri): browser memblokir gayanya, halaman kehilangan tata letaknya, dan
 * **tidak ada satu pun error di build**. Situsnya tetap terbit.
 *
 * Yang TIDAK diperiksa di sini: `<script is:inline>`. Repo ini masih memakai
 * satu untuk pengalih tema dan satu lagi untuk JSON-LD, jadi `script-src`
 * ketat belum bisa diklaim. Menyebutnya terus terang lebih baik daripada
 * membiarkan berkas ini tampak menjamin seluruh CSP.
 */
import { test, describe, expect } from "bun:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const KELUARAN = "dist/client";
const ada = existsSync(KELUARAN);

if (!ada) {
  console.log(
    `[csp] Gerbang keluaran DILEWATI: ${KELUARAN} belum ada.\n` +
      "      Ia lahir dari `bun run build`, yang butuh sumber konten awcms.\n" +
      "      Di repo template ini itu normal; di sebuah SITUS, jalankan\n" +
      "      `bun test` lagi setelah build agar gerbang ini benar-benar jalan."
  );
}

describe.skipIf(!ada)("keluaran build siap untuk CSP ketat", () => {
  const halaman = ada
    ? [...new Bun.Glob("**/*.html").scanSync(KELUARAN)].map((nama) => ({
        nama,
        isi: readFileSync(`${KELUARAN}/${nama}`, "utf8")
      }))
    : [];

  test("build menghasilkan halaman untuk diperiksa", () => {
    // Tanpa ini, sebuah build yang menghasilkan nol halaman akan membuat kedua
    // tes di bawah "lulus" — gerbang yang paling meyakinkan justru saat ia
    // tidak memeriksa apa pun.
    expect(halaman.length).toBeGreaterThan(0);
  });

  test("tidak ada satu pun atribut style= di HTML", () => {
    const pelanggar = halaman
      .map(({ nama, isi }) => ({
        nama,
        jumlah: (isi.match(/\sstyle=(["'])/g) ?? []).length
      }))
      .filter(({ jumlah }) => jumlah > 0);

    assert.deepEqual(
      pelanggar,
      [],
      "atribut gaya inline diblokir style-src 'self' — pindahkan ke kelas"
    );
  });

  test("tidak ada satu pun blok <style> di HTML", () => {
    const pelanggar = halaman
      .filter(({ isi }) => /<style[\s>]/i.test(isi))
      .map(({ nama }) => nama);

    assert.deepEqual(
      pelanggar,
      [],
      "stylesheet tersisip ke dalam HTML — periksa build.inlineStylesheets di astro.config.mjs"
    );
  });

  test("CSS-nya memang ada, bukan hilang bersama gaya inlinenya", () => {
    // Nol `style=` juga bisa berarti seluruh gayanya lenyap. Setiap halaman
    // wajib menautkan stylesheet eksternal.
    const tanpaCss = halaman
      .filter(({ isi }) => !/<link[^>]+rel=["']stylesheet["']/i.test(isi))
      .map(({ nama }) => nama);

    assert.deepEqual(tanpaCss, [], "halaman tanpa stylesheet eksternal");
  });
});
