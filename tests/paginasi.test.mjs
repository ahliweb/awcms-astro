/**
 * Gerbang arsip berbatas (`awcms` #597 butir 2, PRD FR-DSC-006).
 *
 * ## Apa yang dipertaruhkan
 *
 * Setiap halaman seksi di template ini merender SELURUH sejarahnya ke dalam
 * satu dokumen. Dengan seksi yang dibawa template itu tak terlihat; dengan
 * target migrasi 23.906 artikel yang disebut issue itu, ia adalah satu respons
 * HTML berisi setiap judul yang pernah diterbitkan sebuah redaksi.
 *
 * Yang diuji di sini bukan aritmetikanya — melainkan tiga keputusan yang salah
 * DALAM DIAM, karena masing-masing menghasilkan situs yang tetap terbangun,
 * tetap hijau, dan tetap salah:
 *
 *   1. **Halaman 1 tidak punya kembaran `/halaman/1/`.** Menerbitkan keduanya
 *      memberi satu halaman dua URL dan memindahkan alamat yang sudah
 *      terindeks — karena ada orang menerbitkan artikel ke-13.
 *   2. **Setiap halaman kanonik ke DIRINYA.** Mengarahkan halaman 2..N ke
 *      halaman 1 adalah kebiasaan umum, dan ia akan menyembunyikan seluruh
 *      arsip dari indeks: untuk 23.906 artikel, setiap URL setelah dua belas
 *      yang pertama menjadi tak terjangkau kecuali dengan mengklik.
 *   3. **Seksi kosong adalah halaman 1 dari 1**, bukan 1 dari 0.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  jalurHalaman,
  jumlahHalaman,
  nomorHalamanTambahan,
  potongHalaman
} from "../src/lib/paginasi.ts";
import { SEGMEN_HALAMAN, artikelPerFeed, artikelPerHalaman } from "../src/config/site.ts";

const angka = (n) => Array.from({ length: n }, (_, i) => i + 1);

describe("berapa halaman", () => {
  test("seksi kosong tetap satu halaman", () => {
    // "Halaman 1 dari 0" adalah angka yang tidak bisa dimengerti pembaca mana
    // pun, dan seksi tanpa artikel adalah keadaan yang wajar di template.
    assert.equal(jumlahHalaman(0, 12), 1);
  });

  test("kelipatan pas tidak menghasilkan halaman kosong di ujung", () => {
    assert.equal(jumlahHalaman(12, 12), 1);
    assert.equal(jumlahHalaman(24, 12), 2);
    assert.equal(jumlahHalaman(25, 12), 3);
  });

  test("volume migrasi", () => {
    // Angka yang membuat issue-nya mendesak, dihitung dan bukan ditebak.
    assert.equal(jumlahHalaman(23906, 12), 1993);
  });
});

describe("rute yang DIBANGKITKAN mulai dari 2", () => {
  test("halaman 1 tidak pernah punya kembaran", () => {
    // Ini gerbang utama berkas ini. `/panduan/halaman/1/` adalah URL kedua
    // untuk halaman yang sudah punya satu.
    assert.deepEqual(nomorHalamanTambahan(12, 12), []);
    assert.deepEqual(nomorHalamanTambahan(25, 12), [2, 3]);
    assert.equal(nomorHalamanTambahan(23906, 12).includes(1), false);
  });

  test("seksi kosong atau satu halaman tidak membangkitkan rute sama sekali", () => {
    // Keadaan template itu sendiri.
    assert.deepEqual(nomorHalamanTambahan(0, 12), []);
    assert.deepEqual(nomorHalamanTambahan(1, 12), []);
  });
});

describe("potongan halaman", () => {
  test("butirnya adalah irisan yang benar, urutannya tidak diubah", () => {
    const h2 = potongHalaman(angka(25), 2, 12);

    assert.deepEqual(h2.butir, angka(24).slice(12));
    assert.equal(h2.nomor, 2);
    assert.equal(h2.total, 3);
    assert.equal(h2.sebelumnya, 1);
    assert.equal(h2.berikutnya, 2 + 1);
  });

  test("ujung arsip tidak menunjuk ke mana-mana", () => {
    const pertama = potongHalaman(angka(25), 1, 12);
    const terakhir = potongHalaman(angka(25), 3, 12);

    assert.equal(pertama.sebelumnya, null);
    assert.equal(terakhir.berikutnya, null);
    assert.deepEqual(terakhir.butir, [25]);
  });

  test("nomor di luar rentang DIJEPIT, bukan menghasilkan grid kosong", () => {
    // Seksi yang kehilangan seluruh artikelnya dan seksi yang URL-nya salah
    // ketik terlihat sama bagi pembaca; yang pertama adalah kabar buruk, yang
    // kedua bukan apa-apa.
    assert.equal(potongHalaman(angka(25), 0, 12).nomor, 1);
    assert.equal(potongHalaman(angka(25), 99, 12).nomor, 3);
    assert.equal(potongHalaman([], 5, 12).nomor, 1);
    assert.deepEqual(potongHalaman([], 5, 12).butir, []);
  });
});

describe("jalur halaman", () => {
  test("halaman 1 adalah jalur seksinya sendiri, tanpa segmen", () => {
    assert.equal(jalurHalaman("id", "panduan", 1), "/panduan/");
    // Nol dan negatif ikut, karena keduanya berarti "halaman pertama".
    assert.equal(jalurHalaman("id", "panduan", 0), "/panduan/");
  });

  test("halaman 2..N membawa segmen, dan prefiks locale-nya", () => {
    assert.equal(jalurHalaman("id", "panduan", 2), `/panduan/${SEGMEN_HALAMAN}/2/`);
    assert.equal(jalurHalaman("en", "panduan", 2), `/en/panduan/${SEGMEN_HALAMAN}/2/`);
    assert.equal(jalurHalaman("en", "panduan", 1), "/en/panduan/");
  });
});

describe("keputusan yang hanya bisa dibaca dari sumber", () => {
  const TAB_INDEX = readFileSync("src/components/views/TabIndex.astro", "utf8");

  test("setiap halaman kanonik ke DIRINYA, bukan ke halaman 1", () => {
    // Mengarahkan 2..N ke halaman 1 menyembunyikan seluruh arsip dari indeks.
    // Ia tidak menggagalkan apa pun dan tidak terlihat di halaman.
    assert.ok(TAB_INDEX.includes("jalurHalaman(locale, tab, halaman.nomor)"));
  });

  test("judul halaman 2..N berbeda dari halaman 1", () => {
    // Judul identik di seluruh arsip adalah duplikat bagi perayap, dan
    // satu-satunya pembeda yang terbawa ke hasil pencarian.
    assert.ok(TAB_INDEX.includes("halaman.nomor > 1"));
  });

  test("navigasinya TAUTAN, bukan tombol ber-JavaScript", () => {
    // Seluruh situs harus terbaca tanpa JavaScript; arsip yang hanya bisa
    // ditelusuri skrip juga tidak bisa ditelusuri perayap.
    assert.ok(TAB_INDEX.includes('rel="prev"'));
    assert.ok(TAB_INDEX.includes('rel="next"'));
    assert.equal(TAB_INDEX.includes("addEventListener"), false);
  });

  test("syarat feed dibaca dari SEKSI, bukan dari halaman yang sedang dirender", () => {
    // Membacanya dari halaman membuat pengumuman feed lenyap di halaman 2.
    assert.ok(TAB_INDEX.includes("seksiPunyaFeed(urutanSeksiTab(tab), semuaArtikel.length)"));
  });
});

describe("feed juga dibatasi", () => {
  test("isiFeed memotong pada artikelPerFeed", () => {
    // Cacat yang sama dilihat dari sisi mesin: tanpa batas ini seksi target
    // migrasi memancarkan 23.906 entry pada setiap build, dan setiap pembaca
    // feed mengunduh ulang seluruhnya pada setiap polling.
    const sumber = readFileSync("src/lib/feed-seksi.ts", "utf8");
    assert.ok(sumber.includes("articles.slice(0, artikelPerFeed)"));
  });

  test("batas feed dan batas halaman adalah dua angka", () => {
    // Menyatukannya berarti situs yang menampilkan 6 kartu per halaman juga
    // melupakan segalanya yang lebih tua dari 6 posting terakhirnya di antara
    // dua polling.
    assert.equal(typeof artikelPerFeed, "number");
    assert.equal(typeof artikelPerHalaman, "number");
    assert.ok(artikelPerFeed >= artikelPerHalaman);
  });
});
