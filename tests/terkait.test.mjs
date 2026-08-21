/**
 * Gerbang blok "lainnya di seksi ini" (`awcms` #597 butir 5).
 *
 * ## Apa yang dipertaruhkan
 *
 * Sebuah artikel yang selesai dibaca tidak menawarkan apa pun berikutnya, dan
 * pembacanya keluar. Yang membuat butir ini butuh gerbang alih-alih review
 * adalah dua kesalahan yang menghasilkan blok yang TAMPAK benar:
 *
 *   1. **Menawarkan artikel yang sedang dibuka.** Terlihat seperti daftar yang
 *      wajar sampai seseorang mengkliknya dan tidak ke mana-mana.
 *   2. **Tetangga yang salah di seksi manual.** Menghitung posisi setelah
 *      artikelnya dibuang menggeser setiap indeks sesudahnya satu langkah, jadi
 *      "langkah berikutnya" menjadi langkah yang salah — pada panduan
 *      berurutan, itu instruksi yang keliru dan bukan sekadar tautan keliru.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { MAKS_LAINNYA, artikelLainnya } from "../src/lib/terkait.ts";

/** Seksi dalam urutan yang sudah ditetapkan `getArticles`. */
const seksi = (...slug) => slug.map((s) => ({ slug: s }));

describe("artikel yang sedang dibuka tidak pernah ditawarkan", () => {
  test("dibuang menurut SLUG, di kedua jenis seksi", () => {
    for (const urutan of ["terbaru", "manual"]) {
      const hasil = artikelLainnya(seksi("a", "b", "c"), "b", urutan);
      assert.equal(hasil.some((x) => x.slug === "b"), false, urutan);
    }
  });

  test("seksi berisi satu artikel tidak menawarkan apa pun", () => {
    // Blok itu sendiri tidak dirender sama sekali — daftar kosong berjudul
    // "lainnya di seksi ini" adalah janji yang tidak ditepati.
    assert.deepEqual(artikelLainnya(seksi("a"), "a", "terbaru"), []);
    assert.deepEqual(artikelLainnya([], "a", "manual"), []);
  });
});

describe("seksi berita menawarkan yang TERBARU", () => {
  test("mengikuti urutan seksi apa adanya, tanpa mengurutkan ulang", () => {
    // `getArticles` sudah mengurutkan seksi; mengurutkan lagi di sini adalah
    // dua tempat yang memutuskan satu hal.
    const hasil = artikelLainnya(seksi("baru", "sedang", "lama"), "sedang", "terbaru");
    assert.deepEqual(hasil.map((x) => x.slug), ["baru", "lama"]);
  });

  test("dibatasi MAKS_LAINNYA", () => {
    const hasil = artikelLainnya(seksi("a", "b", "c", "d", "e"), "e", "terbaru");
    assert.equal(hasil.length, MAKS_LAINNYA);
  });
});

describe("seksi manual menawarkan TETANGGA", () => {
  test("sesudah lebih dulu — langkah berikutnya adalah yang sedang dicari pembaca", () => {
    const hasil = artikelLainnya(seksi("l1", "l2", "l3", "l4", "l5"), "l3", "manual");
    assert.deepEqual(hasil.map((x) => x.slug), ["l4", "l5", "l2"]);
  });

  test("langkah terakhir menoleh ke belakang", () => {
    const hasil = artikelLainnya(seksi("l1", "l2", "l3"), "l3", "manual");
    assert.deepEqual(hasil.map((x) => x.slug), ["l2", "l1"]);
  });

  test("posisi dihitung terhadap seksi UTUH, bukan terhadap sisanya", () => {
    // Cacat yang ditutup di sini: menghitung indeks setelah artikelnya dibuang
    // menggeser setiap indeks sesudahnya satu langkah, sehingga "berikutnya"
    // melompati satu artikel. Pada panduan berurutan itu instruksi yang keliru.
    const hasil = artikelLainnya(seksi("l1", "l2", "l3", "l4"), "l2", "manual");
    assert.equal(hasil[0].slug, "l3");
  });

  test("slug yang bukan anggota seksinya tidak mengembalikan potongan dari indeks -1", () => {
    // Terjadi pada artikel yang `kategori`-nya menamai tab yang sudah diganti
    // nama. `slice(-1 + 1)` akan menawarkan SELURUH seksi mulai dari awal, yang
    // kebetulan terlihat masuk akal — dan bukan itu yang dimaksud.
    const hasil = artikelLainnya(seksi("l1", "l2", "l3"), "entah", "manual");
    assert.deepEqual(hasil.map((x) => x.slug), ["l1", "l2", "l3"]);
  });
});

describe("keputusan yang hanya bisa dibaca dari sumber", () => {
  test("blok itu TIDAK menambah permintaan ke awcms", () => {
    // Ia diturunkan dari feed yang sudah ditarik build (`getArticles`
    // dimemoisasi), bukan dari permukaan baru — yang akan menuntut tarian
    // kontrak lintas-repo untuk sebuah daftar tiga tautan.
    const sumber = readFileSync("src/layouts/ArtikelLayout.astro", "utf8");
    assert.ok(sumber.includes("artikelLainnya("));
    assert.ok(sumber.includes("await getArticles("));
    assert.equal(sumber.includes("awcmsGet"), false);
  });

  test("judulnya tidak mengklaim keterkaitan yang belum ada", () => {
    // Keterkaitan sungguhan butuh taksonomi, yang belum diresolusi repo ini
    // (butir 1 issue yang sama). Judul "artikel terkait" di atas daftar
    // teman-seksi adalah janji yang dibaca pembaca dan tidak dipenuhi.
    for (const berkas of ["src/locales/id/messages.po", "src/locales/en/messages.po"]) {
      const isi = readFileSync(berkas, "utf8");
      const baris = isi.split("\n");
      const i = baris.findIndex((b) => b === 'msgid "lainnya.judul"');
      assert.ok(i >= 0, `${berkas} tidak punya lainnya.judul`);
      assert.match(baris[i + 1], /seksi ini|this section/i);
    }
  });
});
