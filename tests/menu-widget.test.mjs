/**
 * Gerbang navigasi CMS dan widget (`awcms` #597 butir 6, ADR-0105 di `awcms`).
 *
 * ## Apa yang dipertaruhkan
 *
 * `awcms` sudah memegang menu dan widget sejak issue #542, lengkap dengan layar
 * admin, dan tidak ada yang pernah merendernya. Seorang editor menambahkan
 * tautan footer, CMS menyimpannya, dan tidak ada pembaca yang melihatnya.
 *
 * Yang diuji di sini adalah RESOLUSINYA, karena setiap kesalahan resolusi
 * menghasilkan halaman yang tetap terbangun:
 *
 *   1. **Item `page` yang dirender** menjadi tautan mati di setiap halaman
 *      situs — template ini sama sekali tidak punya rute page.
 *   2. **Target `post` yang tidak terbit** sama, dan itu keadaan NORMAL:
 *      `awcms` sengaja tidak memeriksa `targetId` saat tulis.
 *   3. **URL non-http yang lolos** menjadi `<a href>` yang dapat dieksekusi di
 *      footer setiap halaman.
 *   4. **Widget nonaktif yang lolos** menerbitkan teks yang tidak dinyalakan
 *      siapa pun — dan `awcms` MENGEMBALIKAN yang nonaktif dengan sengaja,
 *      supaya "dimatikan" dan "dihapus" bukan jawaban yang sama.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  menuDenganKey,
  pesanTerbuang,
  susunMenu
} from "../src/lib/menu.ts";
import {
  bacaMenu,
  bacaWidget,
  peringatkanSekali,
  resetNavigasiCacheForTests
} from "../src/lib/awcms/navigasi.ts";

const POST = new Map([
  ["p-1", { tab: "panduan", slug: "artikel-satu" }],
  ["p-2", { tab: "informasi", slug: "artikel-dua" }]
]);

function item(over = {}) {
  return {
    id: "i-1",
    parentItemId: null,
    label: "Item",
    linkType: "url",
    targetId: null,
    url: "https://example.test/",
    sortOrder: 1,
    ...over
  };
}

function menu(items) {
  return { id: "m-1", key: "footer", name: "Tautan", items };
}

describe("resolusi item menu", () => {
  test("`url` dipakai apa adanya", () => {
    const hasil = susunMenu(menu([item()]), POST, "id");

    assert.deepEqual(hasil.tautan, [
      { label: "Item", href: "https://example.test/", anak: [] }
    ]);
    assert.deepEqual(hasil.terbuang, []);
  });

  test("`post` meresolusi ke halaman artikelnya, dengan prefiks locale", () => {
    const menuPost = menu([
      item({ linkType: "post", targetId: "p-1", url: null })
    ]);

    assert.equal(susmenuHref(susunMenu(menuPost, POST, "id")), "/panduan/artikel-satu/");
    assert.equal(
      susmenuHref(susunMenu(menuPost, POST, "en")),
      "/en/panduan/artikel-satu/"
    );
  });

  test("`page` DIBUANG, dan pembuangannya dilaporkan", () => {
    // Gerbang utama berkas ini. Template ini tidak punya rute page sama sekali,
    // jadi item ini akan menjadi tautan mati di setiap halaman situs.
    const hasil = susunMenu(
      menu([item({ linkType: "page", targetId: "hal-1", url: null })]),
      POST,
      "id"
    );

    assert.deepEqual(hasil.tautan, []);
    assert.deepEqual(hasil.terbuang, [{ label: "Item", sebab: "page" }]);
  });

  test("`post` yang tidak terbit dibuang — itu keadaan normal, bukan error", () => {
    const hasil = susunMenu(
      menu([item({ linkType: "post", targetId: "belum-ada", url: null })]),
      POST,
      "id"
    );

    assert.deepEqual(hasil.tautan, []);
    assert.equal(hasil.terbuang[0].sebab, "post-tak-ditemukan");
  });

  test("URL non-http DITOLAK meski `awcms` seharusnya sudah menolaknya", () => {
    // Baris yang ditulis sebelum validator `awcms` yang sekarang tetaplah
    // baris, dan ini dirender sebagai `<a href>` di setiap halaman.
    for (const jahat of [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "  javascript:alert(1)",
      "/relatif/saja"
    ]) {
      const hasil = susunMenu(menu([item({ url: jahat })]), POST, "id");
      assert.deepEqual(hasil.tautan, [], `lolos: ${jahat}`);
    }
  });

  test("item tanpa target sama sekali dibuang", () => {
    const hasil = susunMenu(menu([item({ url: null })]), POST, "id");
    assert.equal(hasil.terbuang[0].sebab, "target-kosong");
  });
});

function susmenuHref(hasil) {
  return hasil.tautan[0]?.href;
}

describe("sarang satu tingkat", () => {
  test("anak menempel pada induknya", () => {
    const hasil = susunMenu(
      menu([
        item({ id: "induk", label: "Induk" }),
        item({
          id: "anak",
          parentItemId: "induk",
          label: "Anak",
          url: "https://example.test/anak",
          sortOrder: 2
        })
      ]),
      POST,
      "id"
    );

    assert.equal(hasil.tautan.length, 1);
    assert.deepEqual(hasil.tautan[0].anak, [
      { label: "Anak", href: "https://example.test/anak", anak: [] }
    ]);
  });

  test("anak yang INDUKNYA terbuang ikut terbuang, tidak dinaikkan", () => {
    // Menaikkannya akan mengubah menu yang disusun editor menjadi menu lain
    // yang tampak disengaja, dan pembacanya tidak punya cara tahu bedanya.
    const hasil = susunMenu(
      menu([
        item({ id: "induk", label: "Induk", linkType: "page", url: null }),
        item({
          id: "anak",
          parentItemId: "induk",
          label: "Anak",
          url: "https://example.test/anak"
        })
      ]),
      POST,
      "id"
    );

    assert.deepEqual(hasil.tautan, []);
    assert.equal(hasil.terbuang.length, 2);
  });
});

describe("membaca payload `awcms`", () => {
  test("menu tanpa `key` dibuang — `key` yang stabil, bukan `name`", () => {
    const hasil = bacaMenu([
      { id: "m-1", key: "footer", name: "Tautan", items: [] },
      { id: "m-2", name: "Tanpa key", items: [] },
      { id: "m-3", key: "   ", name: "Kosong", items: [] }
    ]);

    assert.deepEqual(
      hasil.map((m) => m.key),
      ["footer"]
    );
  });

  test("`name` yang hilang jatuh ke `key`, bukan ke string kosong", () => {
    const hasil = bacaMenu([{ id: "m-1", key: "footer", items: [] }]);
    assert.equal(hasil[0].name, "footer");
  });

  test("item bertipe tautan tak dikenal dibuang", () => {
    const hasil = bacaMenu([
      {
        id: "m-1",
        key: "footer",
        items: [
          { id: "a", label: "Baik", linkType: "url", sortOrder: 1 },
          { id: "b", label: "Aneh", linkType: "iframe", sortOrder: 2 }
        ]
      }
    ]);

    assert.deepEqual(
      hasil[0].items.map((i) => i.label),
      ["Baik"]
    );
  });

  test("item diurutkan DI SINI, bukan dipercaya dari urutan API", () => {
    const hasil = bacaMenu([
      {
        id: "m-1",
        key: "footer",
        items: [
          { id: "c", label: "C", linkType: "url", sortOrder: 3 },
          { id: "a", label: "A", linkType: "url", sortOrder: 1 },
          { id: "b", label: "B", linkType: "url", sortOrder: 2 }
        ]
      }
    ]);

    assert.deepEqual(
      hasil[0].items.map((i) => i.label),
      ["A", "B", "C"]
    );
  });

  test("payload yang bukan array menghasilkan daftar kosong, bukan lemparan", () => {
    assert.deepEqual(bacaMenu(null), []);
    assert.deepEqual(bacaMenu({}), []);
    assert.deepEqual(bacaWidget("bukan array"), []);
  });
});

describe("widget", () => {
  test("`isActive` yang bukan boolean diperlakukan NONAKTIF", () => {
    // Widget yang muncul karena field-nya hilang adalah teks yang terbit tanpa
    // ada yang menyalakannya; kebalikannya hanya teks yang tidak terbit.
    const hasil = bacaWidget([
      { id: "w-1", position: "footer", title: "A", isActive: true },
      { id: "w-2", position: "footer", title: "B" },
      { id: "w-3", position: "footer", title: "C", isActive: "true" }
    ]);

    assert.deepEqual(
      hasil.filter((w) => w.isActive).map((w) => w.title),
      ["A"]
    );
  });

  test("posisi tak dikenal dibuang", () => {
    const hasil = bacaWidget([
      { id: "w-1", position: "footer", title: "A", isActive: true },
      { id: "w-2", position: "popup", title: "B", isActive: true }
    ]);

    assert.deepEqual(
      hasil.map((w) => w.title),
      ["A"]
    );
  });

  test("nonaktif TETAP dibaca — penyaringannya milik pemanggil", () => {
    // `awcms` mengembalikan keduanya dengan sengaja, supaya "dimatikan" dan
    // "dihapus" bukan jawaban yang sama. Membuangnya di sini akan menghapus
    // pembedaan itu satu lapis lebih dalam.
    const hasil = bacaWidget([
      { id: "w-1", position: "footer", title: "Mati", isActive: false }
    ]);

    assert.equal(hasil.length, 1);
    assert.equal(hasil[0].isActive, false);
  });
});

describe("pemilihan menu dan pesan", () => {
  test("menu dipilih menurut `key`", () => {
    const daftar = [
      { id: "1", key: "main", name: "Utama", items: [] },
      { id: "2", key: "footer", name: "Bawah", items: [] }
    ];

    assert.equal(menuDenganKey(daftar, "footer")?.id, "2");
    assert.equal(menuDenganKey(daftar, "tidak-ada"), undefined);
  });

  test("tanpa item terbuang tidak ada pesan sama sekali", () => {
    assert.equal(pesanTerbuang("footer", []), null);
  });

  test("pesannya menyebut LABEL itemnya, bukan jumlahnya saja", () => {
    // Editor yang membaca "1 item dibuang" tidak tahu item mana.
    const pesan = pesanTerbuang("footer", [
      { label: "Tentang Kami", sebab: "page" }
    ]);

    assert.ok(pesan.includes("Tentang Kami"));
    assert.ok(pesan.includes("awcms PAGE"));
  });

  test("peringatan dicetak SEKALI per build, bukan sekali per halaman", () => {
    // Apa yang terbuang diketahui saat render, dan sebuah situs merender
    // ratusan halaman. Diukur pada build verifikasi: 108 halaman, 108 salinan
    // pesan yang identik — yang menenggelamkan log build, satu-satunya tempat
    // pesan ini sampai ke editor yang bisa memperbaikinya.
    resetNavigasiCacheForTests();

    const asli = console.warn;
    let jumlah = 0;
    console.warn = () => {
      jumlah += 1;
    };

    try {
      for (let i = 0; i < 108; i += 1) {
        peringatkanSekali("footer", "pesan");
      }
      // Menu LAIN tetap punya peringatannya sendiri.
      peringatkanSekali("main", "pesan lain");
    } finally {
      console.warn = asli;
    }

    assert.equal(jumlah, 2);
  });
});

describe("keputusan yang hanya bisa dibaca dari sumber", () => {
  const LAYOUT = readFileSync("src/layouts/BaseLayout.astro", "utf8");

  test("bilah tab TIDAK diganti menu CMS", () => {
    // Item menu `awcms` membawa satu label tanpa varian per-locale, jadi
    // navigasi utama yang digerakkan CMS akan mengembalikan antarmuka primer
    // situs ini ke satu bahasa.
    assert.ok(LAYOUT.includes("<TabNav currentTab={currentTab} />"));
    assert.ok(LAYOUT.includes("menuDenganKey(await daftarMenu(), 'footer')"));
  });

  test("`bodyText` dirender sebagai TEKS, tidak pernah lewat set:html", () => {
    assert.equal(LAYOUT.includes("set:html={widget"), false);
    assert.ok(LAYOUT.includes("{widget.bodyText}"));
  });

  test("widget nonaktif disaring sebelum dirender", () => {
    assert.ok(LAYOUT.includes("filter((widget) => widget.isActive)"));
  });
});
