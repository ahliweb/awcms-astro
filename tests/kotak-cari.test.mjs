/**
 * Gerbang atas separuh DOM kotak pencarian — `src/components/views/HalamanCari.astro`.
 *
 * ## Kenapa gerbang SUMBER dan bukan gerbang peramban
 *
 * Repo ini tidak memuat peramban, dan menambah satu dependensi hanya untuk
 * menjalankan skrip ini akan ditolak `tests/tanpa-backend.test.mjs` dengan
 * alasan yang benar. Yang bisa dilakukan tanpa peramban ternyata bukan sedikit:
 * setiap kelas cacat di bawah TERBACA di sumber, dan tiga di antaranya adalah
 * kelas yang gagalnya terjadi di peramban seorang asing — tempat yang tidak
 * punya log dan tidak punya penonton.
 *
 *   1. **Satu header saja pada `fetch`** mengubah permintaan sederhana menjadi
 *      permintaan ber-preflight. `awcms` sengaja tidak menyajikan `OPTIONS`
 *      (ADR-0107 di sana), jadi yang terjadi bukan penurunan mutu melainkan
 *      kegagalan total — di peramban pembaca.
 *   2. **`credentials: "include"`** membuat responsnya tidak bisa dibaca sama
 *      sekali: grant-nya tidak membawa `Access-Control-Allow-Credentials`.
 *   3. **`innerHTML`** membuka jalur HTML-mentah dari CMS yang `AGENTS.md`
 *      §Keamanan tutup — dan ia akan bekerja dengan benar hari ini, karena
 *      `awcms` memang meng-escape lebih dulu. Cacatnya baru muncul pada field
 *      berikutnya, dari endpoint berikutnya, lewat jalur yang sudah ada.
 *
 * Selain itu satu kelas yang sepenuhnya remeh dan sepenuhnya senyap: sebuah
 * SELEKTOR yang salah ketik. `querySelector('[data-cari-hasl]')` mengembalikan
 * `null`, `!` membungkamnya di typecheck, dan halamannya terbit dengan kotak
 * yang menerima ketikan lalu tidak pernah menjawab.
 *
 * Perilaku sungguhannya diverifikasi terhadap Chrome nyata di luar repo saat
 * perubahan ini dibuat (kotak terbuka, snippet tersorot tanpa `innerHTML`,
 * chip menulis bilah alamat, saran terisi, nol pelanggaran CSP). Berkas ini
 * yang menjaganya tidak diam-diam berubah sesudahnya.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const BERKAS = "src/components/views/HalamanCari.astro";
const isi = readFileSync(BERKAS, "utf8");

/** Bagian `<script>` komponen — satu-satunya bagian yang berjalan di peramban. */
const skrip = (() => {
  const mulai = isi.indexOf("<script>");
  const selesai = isi.indexOf("</script>");
  assert.ok(mulai >= 0 && selesai > mulai, `blok <script> tidak ditemukan di ${BERKAS}`);
  return isi.slice(mulai, selesai);
})();

/** Bagian markup — segalanya SEBELUM `<script>`. */
const markup = isi.slice(0, isi.indexOf("<script>"));

describe("kotak pencarian — kontrak lintas-origin (awcms ADR-0107)", () => {
  test("setiap `fetch` dipanggil TANPA argumen kedua", () => {
    // Bukan gaya penulisan. Argumen kedua adalah satu-satunya tempat sebuah
    // header atau `credentials` bisa masuk, dan keduanya mematikan permintaan
    // ini di peramban pembaca tanpa jejak di sisi mana pun.
    const panggilan = [...skrip.matchAll(/\bfetch\(/g)];
    assert.ok(panggilan.length > 0, "tidak ada `fetch` sama sekali — gerbang ini kosong");

    for (const cocok of panggilan) {
      // Baca dari kurung buka sampai kurung tutup yang sepadan, lalu pastikan
      // tidak ada koma di kedalaman 1 — itulah pemisah argumen.
      let dalam = 0;
      let koma = false;
      for (let i = cocok.index + "fetch".length; i < skrip.length; i += 1) {
        const c = skrip[i];
        if (c === "(") dalam += 1;
        else if (c === ")") {
          dalam -= 1;
          if (dalam === 0) break;
        } else if (c === "," && dalam === 1) koma = true;
      }
      assert.equal(koma, false, "`fetch` membawa argumen kedua — header atau kredensial");
    }
  });

  test("kata `credentials` tidak muncul sama sekali", () => {
    // Lapis kedua di atas gerbang sebelumnya, dan sengaja lebih kasar: sebuah
    // objek opsi yang dirakit ke dalam variabel lebih dulu akan lolos pemeriksa
    // argumen di atas.
    assert.equal(/\bcredentials\b/.test(skrip), false);
  });

  test("kedua jalur `awcms` dibangun lewat `src/lib/pencarian.ts`, bukan dirangkai di sini", () => {
    // Yang menjaga daftar permukaan di `tests/kontrak-awcms.test.mjs` tetap
    // benar adalah jalurnya tinggal di SATU berkas. Sebuah string `/api/v1/…`
    // yang dirangkai di komponen akan menambah permukaan tanpa siapa pun
    // memutuskannya.
    assert.equal(/["'`]\/api\/v1\//.test(skrip), false);
    assert.ok(skrip.includes("alamatKueri"));
    assert.ok(skrip.includes("alamatSaran"));
  });
});

describe("kotak pencarian — tidak ada jalur HTML-mentah", () => {
  test("tidak ada `innerHTML`, `outerHTML`, `insertAdjacentHTML`, atau `document.write`", () => {
    for (const terlarang of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write"]) {
      assert.equal(
        skrip.includes(terlarang),
        false,
        `${terlarang} membuka jalur HTML-mentah dari CMS yang AGENTS.md §Keamanan tutup`
      );
    }
  });

  test("setiap bentuk yang bisa muncul di layar ditulis sebagai `<template>` di markup", () => {
    // Kalau bentuknya dirakit di JavaScript, setiap kata di dalamnya berhenti
    // datang dari katalog PO — dan menjadi satu-satunya teks di situs ini yang
    // tidak pernah diterjemahkan.
    for (const tpl of ["data-tpl-hasil", "data-tpl-sorot", "data-tpl-facet-grup", "data-tpl-facet-chip", "data-tpl-saran"]) {
      assert.ok(markup.includes(`<template ${tpl}>`), `template ${tpl} tidak ada di markup`);
    }
  });
});

describe("kotak pencarian — selektor yang dipakai skrip benar-benar ada", () => {
  test("setiap `[data-…]` yang di-query ditemukan di markup berkas yang sama", () => {
    // `querySelector` yang salah ketik mengembalikan `null`, `!` membungkamnya
    // di typecheck, dan halamannya terbit dengan kotak yang tidak pernah
    // menjawab. Tidak ada gerbang lain di repo ini yang bisa melihatnya.
    const selektor = [...skrip.matchAll(/querySelector(?:All)?<[^>]*>\('\[([a-z-]+)\]'\)/g)].map(
      (m) => m[1]
    );

    assert.ok(selektor.length >= 10, `hanya ${selektor.length} selektor terbaca — regexnya usang`);

    for (const nama of new Set(selektor)) {
      assert.ok(
        markup.includes(nama),
        `skrip mencari [${nama}] dan markup tidak pernah memasangnya`
      );
    }
  });
});

describe("kotak pencarian — kontrol yang belum berfungsi tidak ditampilkan", () => {
  test("form ditulis `hidden` di sumber", () => {
    // Situs ini statis: tanpa JavaScript tidak ada yang bisa mengambil hasil.
    // Form yang tampil tanpa JS adalah kontrol yang diam saat dipakai.
    assert.match(markup, /<form[^>]*data-cari-form[^>]*\shidden/);
  });

  test("`global.css` membuat `hidden` menang atas aturan `display`", () => {
    // `hidden` bekerja lewat aturan `display: none` bawaan peramban, yang KALAH
    // dari aturan penulis mana pun pada selektor yang sama — termasuk
    // `.chip { display: inline-flex }`, yang dipakai tombol "muat lebih banyak"
    // di halaman ini. Tanpa baris ini kedua kontrol itu terlihat dan bisa
    // diklik sebelum skripnya menyalakan.
    const css = readFileSync("src/styles/global.css", "utf8");
    assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  });

  test("`<noscript>` mengatakan apa yang dibutuhkan, alih-alih membiarkan halaman kosong", () => {
    assert.ok(markup.includes("<noscript>"));
    assert.ok(markup.includes("cari.noscript"));
  });
});
