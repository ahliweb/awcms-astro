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
 * Skrip mengikuti pola yang sama persis, dan dengan dua jalur yang sama:
 *
 *   1. **Astro menyisipkan bundel kecil** sebagai `<script type="module">` di
 *      dalam HTML — untuk chunk tanpa impor yang lebih kecil dari
 *      `assetsInlineLimit` (4 kB secara bawaan). `ShareButtons.astro` tidak
 *      menulis satu pun skrip inline di sumbernya dan tetap menerbitkannya di
 *      setiap halaman sampai `astro.config.mjs` menyetel limitnya 0.
 *   2. **Komponen menulis `<script is:inline>`** dengan kodenya di dalam HTML.
 *
 * Yang SENGAJA dibiarkan: `<script type="application/ld+json">`. Ia bukan
 * skrip melainkan blok data — tipe yang bukan MIME JavaScript membuat browser
 * berhenti sebelum langkah mana pun yang mengeksekusi kode, jadi `script-src`
 * tidak berlaku atasnya. Memindahkannya ke berkas eksternal hanya akan membuat
 * mesin pencari berhenti membacanya. Gerbang di bawah mengizinkan tepat tipe
 * itu dan menolak sisanya.
 *
 * Sejak kedua jalur di atas tertutup, `server/penyaji.mjs` benar-benar
 * mengirim `Content-Security-Policy` dengan `script-src 'self'` — jadi
 * kegagalan gerbang ini bukan lagi soal kesiapan teoretis: ia berarti sebuah
 * halaman akan kehilangan fungsinya di produksi.
 */
import { test, describe, expect } from "bun:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const KELUARAN = "dist/client";
const ada = existsSync(KELUARAN);

/**
 * Tipe yang membuat sebuah `<script>` berhenti menjadi skrip.
 *
 * Hanya JSON-LD yang diizinkan, bukan seluruh MIME non-JavaScript: sebuah
 * `type="text/template"` berisi markup adalah hal lain sama sekali, dan
 * mengizinkannya diam-diam akan melewatkan blok yang memang perlu dilihat.
 */
const DATA_BLOCK = /^application\/ld\+json$/i;

/**
 * Setiap tag `<script>` pembuka di sebuah halaman, beserta `src` dan `type`-nya.
 *
 * Sengaja hanya tag pembukanya yang dibaca: yang menentukan diblokir atau tidak
 * adalah atribut, bukan isi. Membaca isinya butuh parser HTML sungguhan, dan
 * gerbang yang bergantung pada parser adalah gerbang yang bisa gagal karena
 * parsernya.
 *
 * @param {string} isi
 * @returns {Array<{ src?: string, type?: string }>}
 */
function skripDi(isi) {
  return [...isi.matchAll(/<script\b([^>]*)>/gi)].map(([, atribut]) => ({
    src: atribut.match(/\ssrc=["']([^"']*)["']/i)?.[1],
    type: atribut.match(/\stype=["']([^"']*)["']/i)?.[1]
  }));
}

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

  test("tidak ada skrip inline yang dieksekusi", () => {
    // Blok data JSON-LD dikecualikan — lihat penjelasan di puncak berkas.
    const pelanggar = halaman
      .flatMap(({ nama, isi }) =>
        skripDi(isi)
          .filter((tag) => !tag.src && !DATA_BLOCK.test(tag.type ?? ""))
          .map((tag) => `${nama}: <script${tag.type ? ` type="${tag.type}"` : ""}>`)
      )
      .filter((baris, i, semua) => semua.indexOf(baris) === i);

    assert.deepEqual(
      pelanggar,
      [],
      "skrip inline diblokir script-src 'self' — pindahkan ke berkas, " +
        "dan periksa vite.build.assetsInlineLimit di astro.config.mjs"
    );
  });

  test("setiap skrip dan stylesheet berasal dari origin sendiri", () => {
    // `'self'` juga menolak host lain dan `data:`. Sebuah komponen yang menarik
    // pustaka dari CDN gagal di produksi saja — di dev ia bekerja sempurna.
    const asing = halaman
      .flatMap(({ nama, isi }) => [
        ...skripDi(isi).map((tag) => tag.src),
        ...(isi.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) ?? []).map(
          (tag) => tag.match(/\shref=["']([^"']*)["']/i)?.[1]
        )
      ])
      .filter((url) => url && !url.startsWith("/"))
      .filter((url, i, semua) => semua.indexOf(url) === i);

    assert.deepEqual(asing, [], "sumber lintas-origin atau data: URI");
  });

  test("JavaScript-nya memang ada, bukan hilang bersama skrip inlinenya", () => {
    // Nol skrip inline juga bisa berarti seluruh JS-nya lenyap tanpa jejak.
    // Dua hal yang wajib benar-benar terbit sebagai berkas:
    //
    //   - `/tema.js` di SETIAP halaman — ia yang memasang `data-theme` sebelum
    //     paint pertama, dan tanpanya pilihan tema pembaca tidak pernah dibaca;
    //   - satu bundel `/_astro/*.js`, yaitu skrip tombol salin milik
    //     ShareButtons yang dulu tersisip ke dalam HTML.
    const tanpaTema = halaman
      .filter(({ isi }) => !skripDi(isi).some((tag) => tag.src === "/tema.js"))
      .map(({ nama }) => nama);

    assert.deepEqual(tanpaTema, [], "halaman tanpa /tema.js");

    const adaBundel = halaman.some(({ isi }) =>
      skripDi(isi).some((tag) => tag.src?.startsWith("/_astro/"))
    );

    assert.ok(
      adaBundel,
      "tidak satu pun halaman memuat bundel /_astro/*.js — skrip tombol salin hilang"
    );
  });
});
