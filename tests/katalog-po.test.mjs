/**
 * Gerbang katalog string antarmuka.
 *
 * AGENTS.md menjanjikan bahwa "key yang belum diterjemahkan jatuh ke locale
 * default lalu ke key-nya — jadi katalog yang tertinggal menghasilkan halaman
 * terbaca, bukan nama key di layar". Kalimat itu benar tentang MEKANISMENYA dan
 * salah tentang akibatnya: rantai fallback memang bekerja, tetapi ujungnya
 * adalah nama key, dan nama key DI LAYAR persis yang dijanjikan tidak terjadi.
 *
 * Repo ini menerbitkan tiga kelas kegagalan itu sekaligus sebelum tes ini ada,
 * seluruhnya dengan build hijau dan `astro check` bersih:
 *
 *   - `translation.notice.label` / `.body` / `.aria` dipakai komponen, sementara
 *     katalog hanya punya `translation.notice`. Setiap artikel yang belum
 *     diterjemahkan memasang kotak bertuliskan "translation.notice.label".
 *   - `biaya.jenis.pnbp` dan tiga saudaranya tidak pernah ditulis sama sekali.
 *     Setiap baris tabel biaya memasang lencana bertuliskan nama key-nya.
 *   - `disclaimer.gakkum.*` dan `artikel.variasiWilayah` dipakai komponen yang
 *     tidak pernah bisa tampil di template ini — key hantu untuk kode hantu.
 *
 * Tidak satu pun terlihat oleh typecheck: `t()` menerima string apa pun.
 *
 * ## Apa yang TIDAK diperiksa, dan kenapa
 *
 * Key yang dirangkai template literal (`tab.${tab}.h1`) tidak bisa dibaca
 * pemindai statis. Ia ditangani dari sisi lain: setiap key dinamis WAJIB
 * dipanggil dengan argumen fallback yang layak dibaca, dan tes di bawah
 * memeriksa key yang dibangkitkan konfigurasi tab secara eksplisit.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { parsePo } from "../src/lib/po-parse.ts";
import { tabs, locales, defaultLocale } from "../src/config/site.ts";

const LOCALES_DIR = "src/locales";

const katalog = Object.fromEntries(
  locales.map((locale) => [
    locale,
    parsePo(readFileSync(join(LOCALES_DIR, locale, "messages.po"), "utf8"))
  ])
);

/** Setiap berkas sumber di `src/`, isinya sebagai string. */
function sumber(dir = "src", hasil = []) {
  for (const nama of readdirSync(dir)) {
    const jalur = join(dir, nama);
    if (statSync(jalur).isDirectory()) sumber(jalur, hasil);
    else if (/\.(astro|ts)$/.test(nama)) {
      hasil.push({ jalur, isi: readFileSync(jalur, "utf8") });
    }
  }
  return hasil;
}

/**
 * Pemanggilan `t()` berkey LITERAL, beserta ada-tidaknya argumen fallback.
 *
 * Sengaja hanya key berkutip tunggal/ganda — key bertanda backtick berisi
 * interpolasi dan tidak bisa diselesaikan tanpa menjalankan kodenya.
 */
function panggilanLiteral(isi) {
  const pola = /\bt\(\s*[A-Za-z_$][\w$]*\s*,\s*(['"])([^'"]+)\1\s*(,)?/g;
  const hasil = [];
  let m;
  while ((m = pola.exec(isi)) !== null) {
    hasil.push({ key: m[2], punyaFallback: Boolean(m[3]) });
  }
  return hasil;
}

describe("paritas katalog", () => {
  test("setiap locale punya kumpulan key yang sama persis", () => {
    // Butir Definition of Done di AGENTS.md: "String antarmuka baru masuk ke
    // SELURUH katalog locale". Katalog yang tertinggal tidak pernah gagal
    // sendiri — ia jatuh ke locale default dan tampak baik-baik saja sampai
    // seseorang membaca halamannya dalam bahasa itu.
    const acuan = Object.keys(katalog[defaultLocale]).sort();

    for (const locale of locales) {
      if (locale === defaultLocale) continue;
      const punya = new Set(Object.keys(katalog[locale]));
      const kurang = acuan.filter((key) => !punya.has(key));
      const berlebih = [...punya].filter((key) => !acuan.includes(key));

      assert.deepEqual(kurang, [], `katalog ${locale} kekurangan key`);
      assert.deepEqual(berlebih, [], `katalog ${locale} punya key yang tidak ada di ${defaultLocale}`);
    }
  });

  test("tidak ada msgstr kosong", () => {
    // `t()` memakai `||`, jadi msgstr kosong berperilaku persis seperti key
    // yang tidak ada — tetapi terlihat sudah diterjemahkan saat katalognya
    // dibaca manusia. Itu kelas cacat yang lebih buruk daripada key hilang.
    for (const locale of locales) {
      const kosong = Object.entries(katalog[locale])
        .filter(([, nilai]) => nilai.trim() === "")
        .map(([key]) => key);
      assert.deepEqual(kosong, [], `katalog ${locale} punya msgstr kosong`);
    }
  });
});

describe("key yang dipakai kode", () => {
  test("setiap key literal tanpa fallback ada di katalog locale default", () => {
    const gagal = [];

    for (const { jalur, isi } of sumber()) {
      for (const { key, punyaFallback } of panggilanLiteral(isi)) {
        // Dengan fallback, key yang tidak ada bukan cacat: itu justru pola yang
        // dianjurkan untuk key yang ditentukan konfigurasi atau redaksi.
        if (punyaFallback) continue;
        if (!(key in katalog[defaultLocale])) gagal.push(`${jalur}: "${key}"`);
      }
    }

    assert.deepEqual(gagal, [], "key dipakai kode tetapi tidak ada di katalog");
  });

  test("tidak ada key katalog yang tidak dipakai siapa pun", () => {
    // Key yatim bukan cacat yang dilihat pembaca, tetapi ia melebar-lebarkan
    // pekerjaan penerjemah dan menyamarkan komponen yang sudah dihapus. Repo
    // ini membawa `artikel.pelaksana` dan `translation.notice` seperti itu.
    const dipakai = new Set();
    const dinamis = [];

    for (const { isi } of sumber()) {
      for (const { key } of panggilanLiteral(isi)) dipakai.add(key);
      // Prefiks key dinamis: `t(locale, \`home.tab.${x}.title\`)` menandai
      // seluruh key berawalan `home.tab.` sebagai mungkin-dipakai.
      for (const m of isi.matchAll(/\bt\(\s*[A-Za-z_$][\w$]*\s*,\s*`([^`$]*)\$\{/g)) {
        dinamis.push(m[1]);
      }
      for (const m of isi.matchAll(/tabTitleKey\(/g)) {
        if (m) dinamis.push("home.tab.");
      }
    }

    const yatim = Object.keys(katalog[defaultLocale]).filter(
      (key) => !dipakai.has(key) && !dinamis.some((prefiks) => key.startsWith(prefiks))
    );

    assert.deepEqual(yatim, [], "key katalog tidak dipakai kode mana pun");
  });
});

describe("key yang dibangkitkan konfigurasi", () => {
  test("setiap tab punya judul dan keterangan di SETIAP locale", () => {
    // Tab adalah konfigurasi, jadi key-nya tidak pernah muncul sebagai literal
    // di kode dan pemindai di atas tidak bisa melihatnya. Tab yang ditambahkan
    // tanpa key katalog tetap membangun situs — dengan nama tab bahasa Inggris
    // di kartu, judul halaman, breadcrumb, dan navigasi utama sekaligus.
    const gagal = [];

    for (const locale of locales) {
      for (const tab of tabs) {
        for (const akhiran of ["title", "desc"]) {
          const key = `home.tab.${tab.slug}.${akhiran}`;
          if (!katalog[locale][key]) gagal.push(`${locale}: ${key}`);
        }
        for (const akhiran of ["h1", "lead", "pageTitle", "metaDesc"]) {
          const key = `tab.${tab.slug}.${akhiran}`;
          if (!katalog[locale][key]) gagal.push(`${locale}: ${key}`);
        }
      }
    }

    assert.deepEqual(gagal, [], "key tab tidak lengkap");
  });
});
