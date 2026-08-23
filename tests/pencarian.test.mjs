/**
 * Gerbang atas `src/lib/pencarian.ts` — separuh murni kotak pencarian pembaca
 * (`awcms` #607, `awcms` #597 butir 3).
 *
 * ## Kenapa berkas ini ada, dan kenapa isinya bukan "tes utilitas"
 *
 * Kotak pencarian adalah panggilan PERTAMA dari repo ini yang terjadi di
 * peramban seorang asing, bukan saat build. Itu memindahkan setiap kesalahan ke
 * tempat yang tidak bisa dilihat siapa pun di sisi server:
 *
 *   - Sebuah header tambahan mengubah permintaan sederhana menjadi permintaan
 *     ber-preflight. `awcms` sengaja tidak menyajikan `OPTIONS`, jadi yang
 *     terjadi bukan penurunan mutu melainkan kegagalan di peramban pembaca.
 *   - Sebuah parameter yang ikut terbawa dari bilah alamat mengirim nilai milik
 *     pembaca situs INI ke origin lain. `awcms` mengabaikan kunci yang tidak
 *     dikenalnya, jadi tidak ada yang gagal.
 *   - Sebuah snippet yang masuk lewat `innerHTML` membuka jalur HTML-mentah
 *     yang `AGENTS.md` §Keamanan tutup — dan ia akan bekerja dengan benar hari
 *     ini, karena `awcms` memang meng-escape lebih dulu.
 *
 * Ketiganya lolos typecheck, lolos `astro check`, dan menghasilkan halaman yang
 * tampak baik-baik saja. Jadi ketiganya diuji di sini.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";

import {
  FACET_TERM,
  JALUR_KUERI,
  JALUR_SARAN,
  PANJANG_KUERI_MAKS,
  alamatKueri,
  alamatSaran,
  asalPencarian,
  bacaFilter,
  dengan,
  jalurPencarian,
  potongSnippet
} from "../src/lib/pencarian.ts";

const ASAL = "https://cms.contoh.test";

function filter(ubah = {}) {
  return { kueri: "banjir", term: {}, ...ubah };
}

describe("asalPencarian", () => {
  test("mengembalikan ORIGIN saja, membuang path dan query", () => {
    // Nilai yang sama dipakai dua kali: sebagai basis permintaan di sini, dan
    // sebagai satu token di dalam direktif `connect-src` di
    // `server/penyaji.mjs`. Sebuah spasi atau titik koma yang lolos ke header
    // itu membuat peramban menolak SELURUH kebijakan, bersama setiap direktif
    // lain di dalamnya.
    assert.equal(asalPencarian("https://cms.contoh.test/api/v1/x?y=1"), ASAL);
    assert.equal(asalPencarian("https://cms.contoh.test:8443/"), "https://cms.contoh.test:8443");
  });

  test("nilai yang bukan URL http(s) diperlakukan sebagai TIDAK ADA", () => {
    // Bukan dilempar: situs tanpa `awcms` adalah keadaan yang sah di repo
    // template ini, dan hasilnya harus situs tanpa kotak pencarian — bukan
    // build yang gagal, dan bukan kotak yang memanggil sesuatu yang tak terduga.
    for (const buruk of ["", undefined, "bukan-url", "javascript:alert(1)", "ftp://cms.test"]) {
      assert.equal(asalPencarian(buruk), undefined, `${buruk} seharusnya ditolak`);
    }
  });
});

describe("bacaFilter", () => {
  test("hanya facet yang didaftar yang terbaca", () => {
    const params = new URLSearchParams(
      "q=banjir&channel=politik&utm_source=facebook&fbclid=abc&topic=pemilu"
    );
    const hasil = bacaFilter(params);

    assert.equal(hasil.kueri, "banjir");
    assert.deepEqual(hasil.term, { channel: "politik", topic: "pemilu" });
    assert.equal("utm_source" in hasil.term, false);
    assert.equal("fbclid" in hasil.term, false);
  });

  test("daftar facet-nya adalah yang dideklarasikan, bukan yang kebetulan ada", () => {
    // Menegaskan daftarnya itu sendiri: sebuah facet yang ditambahkan `awcms`
    // harus INERT di sini sampai baris ini menyebutnya. Arah itu disengaja —
    // parameter yang tidak dikenal yang sampai ke query string adalah probe atas
    // bentuk indeks, yang dijawab oleh jumlah hasilnya.
    assert.deepEqual([...FACET_TERM], ["channel", "topic", "institution", "region"]);
  });

  test("kueri dipangkas pada batas yang sama dengan yang ditolak awcms", () => {
    const panjang = "a".repeat(PANJANG_KUERI_MAKS + 50);
    assert.equal(bacaFilter(new URLSearchParams({ q: panjang })).kueri.length, PANJANG_KUERI_MAKS);
  });

  test("nilai kosong dan spasi tidak menjadi filter", () => {
    const hasil = bacaFilter(new URLSearchParams("q=%20&channel=&topic=%20%20"));
    assert.equal(hasil.kueri, "");
    assert.deepEqual(hasil.term, {});
    assert.equal(hasil.tipe, undefined);
  });
});

describe("alamatKueri", () => {
  test("jalur dan parameter tersusun di ORIGIN yang diberikan", () => {
    const url = new URL(
      alamatKueri(ASAL, filter({ tipe: "blog_post", term: { channel: "politik" } }), {
        locale: "id",
        cursor: "abc"
      })
    );

    assert.equal(url.origin, ASAL);
    assert.equal(url.pathname, JALUR_KUERI);
    assert.equal(url.searchParams.get("q"), "banjir");
    assert.equal(url.searchParams.get("type"), "blog_post");
    assert.equal(url.searchParams.get("channel"), "politik");
    assert.equal(url.searchParams.get("locale"), "id");
    assert.equal(url.searchParams.get("cursor"), "abc");
  });

  test("kueri tidak bisa memindahkan ORIGIN permintaan", () => {
    // Yang membedakan `new URL(jalur, asal)` dari penggabungan string. Sebuah
    // kueri berbentuk `//lain.test/` yang digabung setelah basis menghasilkan
    // permintaan ke host lain — dan di layar itu terbaca sebagai pencarian yang
    // tidak menemukan apa-apa.
    for (const jahat of ["//lain.test/", "https://lain.test/x", "../../../etc"]) {
      const url = new URL(alamatKueri(ASAL, filter({ kueri: jahat })));
      assert.equal(url.origin, ASAL, `${jahat} memindahkan origin`);
      assert.equal(url.pathname, JALUR_KUERI);
    }
  });

  test("facet yang tidak diisi tidak muncul sebagai parameter kosong", () => {
    const url = new URL(alamatKueri(ASAL, filter()));
    for (const kunci of FACET_TERM) {
      assert.equal(url.searchParams.has(kunci), false, `${kunci} seharusnya absen`);
    }
    assert.equal(url.searchParams.has("type"), false);
    assert.equal(url.searchParams.has("cursor"), false);
  });
});

describe("alamatSaran", () => {
  test("memakai jalur saran, dan memangkas kueri pada batas yang sama", () => {
    const url = new URL(alamatSaran(ASAL, "a".repeat(PANJANG_KUERI_MAKS + 10), "en"));
    assert.equal(url.pathname, JALUR_SARAN);
    assert.equal(url.searchParams.get("q").length, PANJANG_KUERI_MAKS);
    assert.equal(url.searchParams.get("locale"), "en");
  });
});

describe("jalurPencarian", () => {
  test("keadaan filter menjadi URL situs INI, bisa ditandai dan dibagikan", () => {
    assert.equal(
      jalurPencarian("/cari/", filter({ tipe: "blog_post", term: { region: "kalteng" } })),
      "/cari/?q=banjir&type=blog_post&region=kalteng"
    );
  });

  test("filter kosong menghasilkan jalur telanjang, bukan tanda tanya menggantung", () => {
    assert.equal(jalurPencarian("/cari/", { kueri: "", term: {} }), "/cari/");
  });
});

describe("dengan", () => {
  test("memilih sebuah facet menambahkannya", () => {
    const hasil = dengan(filter(), "channel", "politik");
    assert.deepEqual(hasil.term, { channel: "politik" });
  });

  test("memilih facet yang SEDANG aktif membersihkannya", () => {
    // Tanpa ini, pembaca yang menyempitkan ke satu kanal tidak punya jalan
    // kembali selain menyunting bilah alamat — dan hitungan facet, yang dihitung
    // TANPA filternya sendiri justru supaya jalan kembali itu tetap terlihat,
    // akan menunjuk ke pintu tanpa gagang.
    const aktif = filter({ term: { channel: "politik" } });
    assert.deepEqual(dengan(aktif, "channel", "politik").term, {});
  });

  test("tipe berperilaku sama, dan tidak menyeret facet lain saat dibersihkan", () => {
    const aktif = filter({ tipe: "blog_post", term: { topic: "pemilu" } });
    const setelah = dengan(aktif, "type", "blog_post");

    assert.equal(setelah.tipe, undefined);
    assert.deepEqual(setelah.term, { topic: "pemilu" });
    assert.equal(setelah.kueri, "banjir");
  });

  test("masukan tidak dimutasi", () => {
    // Setiap chip merender `href`-nya dari `dengan(filterSekarang, …)`. Satu
    // mutasi berarti chip kedua dibangun dari keadaan yang sudah diubah chip
    // pertama, dan setiap tautan sesudahnya salah — pada halaman yang tampak
    // benar sampai seseorang mengkliknya.
    const asli = filter({ term: { channel: "politik" } });
    dengan(asli, "topic", "pemilu");
    assert.deepEqual(asli.term, { channel: "politik" });
  });
});

describe("potongSnippet", () => {
  test("teks tanpa sorotan menjadi satu segmen", () => {
    assert.deepEqual(potongSnippet("kabar hari ini"), [
      { teks: "kabar hari ini", sorot: false }
    ]);
  });

  test("sorotan dipisahkan sebagai segmen tersendiri", () => {
    assert.deepEqual(potongSnippet("kabar <mark>banjir</mark> hari ini"), [
      { teks: "kabar ", sorot: false },
      { teks: "banjir", sorot: true },
      { teks: " hari ini", sorot: false }
    ]);
  });

  test("keluarannya TEKS — sebuah tag yang lolos terbaca sebagai karakternya", () => {
    // Inilah alasan berkas ini tidak memakai `innerHTML`. `awcms` meng-escape
    // lebih dulu dan melakukannya dengan benar; aturan repo ini tentang
    // KEBERADAAN jalurnya, bukan tentang isi string hari ini.
    const segmen = potongSnippet("&lt;script&gt;alert(1)&lt;/script&gt;");
    assert.deepEqual(segmen, [{ teks: "<script>alert(1)</script>", sorot: false }]);
  });

  test("ampersand dibaca TERAKHIR, sehingga escape ganda tidak terbuka", () => {
    // `awcms` meng-escape `&` lebih dulu, jadi `&lt;` di dalam konten berangkat
    // sebagai `&amp;lt;`. Membaca `&amp;` lebih dulu akan mengembalikannya
    // menjadi `<` — menghidupkan kembali karakter yang justru dinetralkan
    // escaper itu. Dibaca terakhir, hasilnya teks harfiah `&lt;`.
    assert.deepEqual(potongSnippet("&amp;lt;b&amp;gt;"), [
      { teks: "&lt;b&gt;", sorot: false }
    ]);
  });

  test("sorotan yang tidak ditutup menyorot sampai akhir, bukan hilang", () => {
    assert.deepEqual(potongSnippet("kabar <mark>banjir"), [
      { teks: "kabar ", sorot: false },
      { teks: "banjir", sorot: true }
    ]);
  });

  test("snippet kosong menghasilkan nol segmen, bukan satu segmen kosong", () => {
    assert.deepEqual(potongSnippet(""), []);
  });
});
