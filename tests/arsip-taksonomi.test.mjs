/**
 * Gerbang arsip kategori dan tag (`awcms` #597 butir 1, ADR-0104).
 *
 * ## Apa yang dipertaruhkan
 *
 * Sampai perubahan ini situs ini tidak punya arsip kategori maupun tag: redaksi
 * memfilekan artikel ke sebuah kategori di CMS, `awcms` menyimpannya, dan
 * pembaca tidak pernah bisa melihatnya.
 *
 * Yang diuji di sini bukan perakitannya — melainkan keputusan yang salah DALAM
 * DIAM, karena masing-masing menghasilkan situs yang tetap terbangun, tetap
 * hijau, dan tetap salah:
 *
 *   1. **Arsip dibangun dari term yang DIPAKAI, bukan dari kosakatanya.** Satu
 *      halaman per term dalam kosakata berarti ribuan grid kosong pada arsip
 *      mana pun yang tumbuh bertahun-tahun.
 *   2. **Arsip diurutkan TANGGAL, selalu.** Ia melintasi seksi, dan `urutan`
 *      dari dua seksi berbeda tidak dibandingkan terhadap apa pun.
 *   3. **`termIds` dibaca dari post SUMBER.** Dibaca dari terjemahan, seorang
 *      penerjemah yang mengosongkannya menjatuhkan artikel itu dari setiap
 *      arsip di bahasanya sendiri — setiap halaman tetap ada, arsipnya
 *      diam-diam lebih pendek.
 *   4. **Slug seksi tidak boleh menabrak segmen arsip.** Sebuah tab bernama
 *      `kategori` mendeklarasikan dua halaman berbeda pada satu URL.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  jalurArsip,
  susunArsip,
  termArtikel,
  urutkanArsip
} from "../src/lib/arsip-taksonomi.ts";
import { saringJenisArsip } from "../src/lib/awcms/taksonomi.ts";
import { SEGMEN_HALAMAN, tabBentrokSegmen } from "../src/config/site.ts";

/** Artikel minimal — hanya field yang dibaca perakit arsip. */
function buatArtikel(slug, terbit, termIds, kategori = "panduan") {
  return {
    slug,
    entry: {
      id: slug,
      data: {
        title: slug,
        description: "",
        publishedDate: new Date(terbit),
        updatedDate: new Date(terbit),
        urutan: 99,
        kategori,
        syaratDokumen: [],
        langkah: [],
        biaya: [],
        dasarHukum: [],
        faq: []
      },
      bodyHtml: ""
    },
    isFallback: false,
    termIds
  };
}

const TERM = [
  { id: "t-politik", taxonomyType: "category", name: "Politik", slug: "politik" },
  { id: "t-ekonomi", taxonomyType: "category", name: "Ekonomi", slug: "ekonomi" },
  { id: "t-apbd", taxonomyType: "tag", name: "APBD", slug: "apbd" }
];

describe("kosakata disaring, bukan dipercaya", () => {
  test("channel dan topic dibuang — keduanya belum punya arsip di sini", () => {
    const hasil = saringJenisArsip([
      { id: "1", taxonomyType: "category", name: "Politik", slug: "politik" },
      { id: "2", taxonomyType: "channel", name: "Olahraga", slug: "olahraga" },
      { id: "3", taxonomyType: "topic", name: "Korupsi", slug: "korupsi" },
      { id: "4", taxonomyType: "tag", name: "APBD", slug: "apbd" }
    ]);

    assert.deepEqual(
      hasil.map((t) => t.id),
      ["1", "4"]
    );
  });

  test("term tanpa slug atau tanpa nama dibuang, bukan dibangun jadi `/kategori//`", () => {
    const hasil = saringJenisArsip([
      { id: "1", taxonomyType: "category", name: "Politik", slug: "   " },
      { id: "2", taxonomyType: "category", name: "", slug: "kosong" },
      { id: "3", taxonomyType: "category", name: " Ekonomi ", slug: " ekonomi " }
    ]);

    assert.equal(hasil.length, 1);
    assert.equal(hasil[0].name, "Ekonomi");
    assert.equal(hasil[0].slug, "ekonomi");
  });
});

describe("arsip dibangun dari term yang DIPAKAI", () => {
  test("term tanpa artikel tidak menghasilkan halaman", () => {
    // Gerbang utama berkas ini. `Ekonomi` ada di kosakata dan tidak ada di
    // satu pun artikel; sebuah halaman untuknya adalah grid kosong.
    const arsip = susunArsip(
      [buatArtikel("a", "2026-01-01", ["t-politik"])],
      TERM,
      "category"
    );

    assert.deepEqual(
      arsip.map((entri) => entri.term.slug),
      ["politik"]
    );
  });

  test("jenis lain tidak bocor ke dalam arsip kategori", () => {
    const arsip = susunArsip(
      [buatArtikel("a", "2026-01-01", ["t-politik", "t-apbd"])],
      TERM,
      "category"
    );

    assert.deepEqual(
      arsip.map((entri) => entri.term.slug),
      ["politik"]
    );
  });

  test("id yang tidak ada di kosakata dilewati tanpa menggagalkan apa pun", () => {
    // Term yang dihapus lunak di `awcms` setelah artikelnya difilekan adalah
    // keadaan normal, dan tidak ada yang bisa ditindaklanjuti sebuah build.
    const arsip = susunArsip(
      [buatArtikel("a", "2026-01-01", ["sudah-dihapus", "t-politik"])],
      TERM,
      "category"
    );

    assert.equal(arsip.length, 1);
    assert.equal(arsip[0].artikel.length, 1);
  });

  test("satu artikel bisa berada di beberapa arsip sekaligus", () => {
    const arsip = susunArsip(
      [buatArtikel("a", "2026-01-01", ["t-politik", "t-ekonomi"])],
      TERM,
      "category"
    );

    assert.deepEqual(
      arsip.map((entri) => entri.term.slug),
      ["ekonomi", "politik"]
    );
  });

  test("urutan arsipnya sendiri deterministik menurut slug", () => {
    // Supaya diff sebuah build bisa dibaca: daftar yang berpindah urutan di
    // setiap build membuat setiap build terlihat mengubah segalanya.
    const arsip = susunArsip(
      [buatArtikel("a", "2026-01-01", ["t-politik", "t-ekonomi"])],
      TERM,
      "category"
    );

    assert.deepEqual(
      arsip.map((entri) => entri.term.slug),
      [...arsip.map((entri) => entri.term.slug)].sort()
    );
  });
});

describe("arsip diurutkan tanggal, melintasi seksi", () => {
  test("terbaru dulu, apa pun seksinya", () => {
    const hasil = urutkanArsip([
      buatArtikel("lama", "2025-01-01", [], "panduan"),
      buatArtikel("baru", "2026-06-01", [], "informasi"),
      buatArtikel("tengah", "2025-09-01", [], "layanan")
    ]);

    assert.deepEqual(
      hasil.map((a) => a.slug),
      ["baru", "tengah", "lama"]
    );
  });

  test("seri dipecah slug, bukan diserahkan pada urutan API", () => {
    // Penerbitan massal menstempel satu `now()` ke setiap baris yang
    // disentuhnya, dan `Array#sort` yang stabil akan menyerahkan sisanya pada
    // urutan yang kebetulan dikembalikan API.
    const satuInstan = "2026-03-03T04:05:06.000Z";
    const hasil = urutkanArsip([
      buatArtikel("zebra", satuInstan, []),
      buatArtikel("alpha", satuInstan, []),
      buatArtikel("mango", satuInstan, [])
    ]);

    assert.deepEqual(
      hasil.map((a) => a.slug),
      ["alpha", "mango", "zebra"]
    );
  });

  test("artikel di dalam sebuah arsip sudah terurut saat disusun", () => {
    const arsip = susunArsip(
      [
        buatArtikel("lama", "2025-01-01", ["t-politik"]),
        buatArtikel("baru", "2026-01-01", ["t-politik"])
      ],
      TERM,
      "category"
    );

    assert.deepEqual(
      arsip[0].artikel.map((a) => a.slug),
      ["baru", "lama"]
    );
  });
});

describe("klasifikasi satu artikel", () => {
  const katalog = new Map(TERM.map((t) => [t.id, t]));

  test("hanya jenis yang diminta, terurut menurut nama", () => {
    const hasil = termArtikel(
      ["t-politik", "t-apbd", "t-ekonomi"],
      katalog,
      "category"
    );

    assert.deepEqual(
      hasil.map((t) => t.name),
      ["Ekonomi", "Politik"]
    );
  });

  test("id yang tak dikenal tidak menghasilkan tautan ke halaman yang tak ada", () => {
    assert.deepEqual(termArtikel(["entah"], katalog, "tag"), []);
  });

  test("artikel tanpa klasifikasi menghasilkan daftar kosong", () => {
    assert.deepEqual(termArtikel([], katalog, "category"), []);
  });
});

describe("jalur arsip", () => {
  test("halaman 1 adalah jalur arsipnya sendiri, tanpa segmen", () => {
    assert.equal(jalurArsip("id", "category", "politik"), "/kategori/politik/");
    assert.equal(jalurArsip("id", "tag", "apbd"), "/tag/apbd/");
    // Nol dan negatif ikut, karena keduanya berarti "halaman pertama".
    assert.equal(jalurArsip("id", "category", "politik", 0), "/kategori/politik/");
  });

  test("halaman 2..N membawa segmen, dan prefiks locale-nya", () => {
    assert.equal(
      jalurArsip("id", "category", "politik", 2),
      `/kategori/politik/${SEGMEN_HALAMAN}/2/`
    );
    assert.equal(
      jalurArsip("en", "tag", "apbd", 3),
      `/en/tag/apbd/${SEGMEN_HALAMAN}/3/`
    );
    assert.equal(jalurArsip("en", "category", "politik"), "/en/kategori/politik/");
  });
});

describe("segmen yang dipesan template", () => {
  test("konfigurasi yang dikirim template ini tidak bentrok", () => {
    assert.deepEqual(tabBentrokSegmen(), []);
  });

  test("tab bernama `kategori`, `tag`, atau `halaman` DITOLAK", () => {
    // Diuji dengan masukan yang gagal, bukan hanya dengan konfigurasi yang
    // kebetulan lolos: pemeriksaan yang belum pernah melihat masukan gagal
    // adalah pemeriksaan yang belum pernah diuji siapa pun.
    assert.deepEqual(tabBentrokSegmen([{ slug: "kategori" }]), ["kategori"]);
    assert.deepEqual(tabBentrokSegmen([{ slug: "tag" }]), ["tag"]);
    assert.deepEqual(tabBentrokSegmen([{ slug: "halaman" }]), ["halaman"]);
    assert.deepEqual(tabBentrokSegmen([{ slug: "panduan" }]), []);
  });
});

describe("keputusan yang hanya bisa dibaca dari sumber", () => {
  const TAKSONOMI = readFileSync("src/lib/awcms/taksonomi.ts", "utf8");
  const LAYOUT = readFileSync("src/layouts/ArtikelLayout.astro", "utf8");
  const CONTENT = readFileSync("src/lib/content.ts", "utf8");

  test("kosakata dibaca lewat TRAVERSAL, bukan list abjad bawaannya", () => {
    // List bawaannya memotong pada seratus entri pertama menurut abjad dan
    // tidak mengatakannya. Untuk kosakata tag pada arsip migrasi, itu situs
    // yang membangun seratus halaman dari ribuan, hijau.
    assert.ok(TAKSONOMI.includes('order: "created_at"'));
    assert.ok(TAKSONOMI.includes("nextCursor"));
  });

  test("403 dan 404 saja yang jatuh ke fallback; sisanya melempar", () => {
    // `catch` menyeluruh menjadikan "CMS Anda mati" dan "redaksi ini tidak
    // memakai kategori" peristiwa yang sama.
    assert.ok(TAKSONOMI.includes("error.status === 403"));
    assert.ok(TAKSONOMI.includes("error.status === 404"));
    assert.ok(TAKSONOMI.includes("throw error;"));
  });

  test("peringatannya menyebut NAMA permission-nya", () => {
    // Supaya perbaikannya satu kalimat, bukan sebuah penyelidikan.
    assert.ok(TAKSONOMI.includes("blog_content.taxonomies.read"));
  });

  test("`termIds` dibaca dari post SUMBER", () => {
    assert.ok(CONTENT.includes("termIds: source.termIds ?? []"));
  });

  test("halaman artikel MENAUT ke arsipnya", () => {
    // Tanpa ini setiap halaman arsip hanya bisa ditemukan lewat sitemap —
    // halaman yang ada, terindeks, dan tidak ditaut satu pun halaman yang
    // isinya.
    assert.ok(LAYOUT.includes("jalurArsip(locale, baris.jenis, term.slug)"));
  });
});
