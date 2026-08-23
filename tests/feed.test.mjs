/**
 * Gerbang atas pembangun feed Atom, `src/lib/feed.ts`.
 *
 * ## Kenapa berkas ini menanggung beban yang tidak biasa
 *
 * Template ini menyatakan NOL seksi berita (`urutanSeksi: "manual"` pada
 * ketiga tabnya), jadi `bun run build` di repo ini tidak menghasilkan satu
 * berkas feed pun — dan `dist/client` sendiri tidak pernah ada di sini karena
 * build-nya butuh sumber konten `awcms`. Artinya keluarga gerbang feed di
 * `scripts/audit-konten.mjs` **tidak pernah menemukan berkas untuk diperiksa**
 * di repo tempat ia ditulis, persis keadaan yang celah 10 catat dan yang
 * ADR-0032 larang dibiarkan.
 *
 * Dua berkas menjawabnya dari dua sisi: `tests/audit-konten.test.mjs`
 * membuktikan gerbangnya atas pohon fixture, dan berkas ini membuktikan bahwa
 * yang DIBANGKITKAN repo ini adalah bentuk yang gerbang itu terima. Keduanya
 * perlu — sebuah pembangun dan sebuah pemeriksa yang sama-sama salah dengan
 * cara yang sama akan saling meluluskan.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";

import {
  NAMA_BERKAS_FEED,
  bangunFeedAtom,
  lepasXml,
  seksiPunyaFeed
} from "../src/lib/feed.ts";

/** Feed sah yang setiap kasus merah di bawah merusak tepat satu hal darinya. */
function feed(ubah = {}) {
  return {
    judul: "Berita — Situs Contoh",
    ringkasan: "Kabar terbaru dari Situs Contoh.",
    url: "https://contoh.test/berita/",
    urlDiri: `https://contoh.test/berita/${NAMA_BERKAS_FEED}`,
    bahasa: "id-ID",
    penerbit: "Situs Contoh",
    butir: [
      {
        judul: "Artikel kedua",
        url: "https://contoh.test/berita/kedua/",
        ringkasan: "Ringkasan artikel kedua.",
        terbit: new Date("2026-08-02T03:00:00.000Z"),
        diubah: new Date("2026-08-02T03:00:00.000Z")
      },
      {
        judul: "Artikel pertama",
        url: "https://contoh.test/berita/pertama/",
        ringkasan: "Ringkasan artikel pertama.",
        terbit: new Date("2026-08-01T03:00:00.000Z"),
        diubah: new Date("2026-08-03T09:00:00.000Z")
      }
    ],
    ...ubah
  };
}

describe("seksiPunyaFeed", () => {
  test("seksi berita yang berisi artikel menerbitkan feed", () => {
    assert.equal(seksiPunyaFeed("terbaru", 3), true);
  });

  test("seksi manual TIDAK menerbitkan feed, berapa pun isinya", () => {
    // Bukan optimasi: langkah 1 sebuah panduan akan terdorong ke setiap
    // pelanggan setiap kali panduannya disunting.
    assert.equal(seksiPunyaFeed("manual", 50), false);
  });

  test("seksi berita KOSONG tidak menerbitkan feed", () => {
    // Atom mewajibkan `<updated>` pada feed, dan satu-satunya nilai yang
    // tersedia untuk seksi kosong adalah jam build — angka yang repo ini sudah
    // tolak untuk `lastmod` sitemap.
    assert.equal(seksiPunyaFeed("terbaru", 0), false);
  });
});

describe("lepasXml", () => {
  test("kelima karakter dilepas", () => {
    assert.equal(lepasXml(`&<>"'`), "&amp;&lt;&gt;&quot;&apos;");
  });

  test("ampersand dilepas SEKALI, bukan berlapis", () => {
    // `replace` dengan satu kelas karakter memeriksa string ASLI, jadi `&`
    // hasil pelepasan tidak dilepas lagi. Sebuah implementasi yang merantai
    // lima `replace` berurutan akan menghasilkan `&amp;lt;` di sini.
    assert.equal(lepasXml("a & b"), "a &amp; b");
    assert.equal(lepasXml("<b>"), "&lt;b&gt;");
  });
});

describe("bangunFeedAtom — bentuk yang dihasilkan", () => {
  const xml = bangunFeedAtom(feed());

  test("deklarasi XML dan namespace Atom", () => {
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>\n'));
    assert.ok(xml.includes('<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="id-ID">'));
  });

  test("feed membawa id, title, updated, dan link self", () => {
    assert.ok(xml.includes("<id>https://contoh.test/berita/</id>"));
    assert.ok(xml.includes("<title>Berita — Situs Contoh</title>"));
    assert.ok(
      xml.includes(
        '<link rel="self" type="application/atom+xml" href="https://contoh.test/berita/feed.xml"/>'
      )
    );
  });

  test("id feed adalah URL SEKSI, bukan URL berkas feed", () => {
    // Sebuah situs yang kelak menambahkan format feed kedua tidak boleh membuat
    // setiap pelanggan melihat seluruh arsipnya sebagai entry baru.
    assert.ok(!xml.includes(`<id>https://contoh.test/berita/${NAMA_BERKAS_FEED}</id>`));
  });

  test("entry terurut dari yang TERBARU meski masukannya tidak", () => {
    const urutan = [...xml.matchAll(/<title>([^<]+)<\/title>/g)].map((m) => m[1]);
    assert.deepEqual(urutan, ["Berita — Situs Contoh", "Artikel kedua", "Artikel pertama"]);
  });

  test("published dan updated adalah dua nilai yang berbeda saat artikel dikoreksi", () => {
    // Ini ADR-0033 dilihat dari sisi feed: sebelum ADR itu, keduanya dilipat
    // menjadi satu dan tidak ada halaman yang bisa melaporkan koreksi.
    assert.ok(xml.includes("<published>2026-08-01T03:00:00.000Z</published>"));
    assert.ok(xml.includes("<updated>2026-08-03T09:00:00.000Z</updated>"));
  });

  test("updated feed adalah entry TERBARU, bukan jam build", () => {
    const kepala = xml.slice(0, xml.indexOf("<entry>"));
    assert.ok(kepala.includes("<updated>2026-08-03T09:00:00.000Z</updated>"));
  });

  test("penulis feed adalah organisasi, dan butir tanpa byline tidak memancarkan author sendiri", () => {
    // Bukan dua pernyataan yang kebetulan bersebelahan. Atom (RFC 4287 §4.2.1)
    // menetapkan `<author>` tingkat feed berlaku bagi setiap entry yang tidak
    // punya sendiri, jadi butir tanpa byline SUDAH beratribusi organisasi —
    // menuliskannya sekali lagi di setiap entry hanya menambah byte.
    assert.ok(xml.includes("<name>Situs Contoh</name>"));

    const entri = xml.slice(xml.indexOf("<entry>"));
    assert.equal(entri.includes("<author>"), false, "entry tanpa byline tidak boleh punya author");
  });

  test("byline penulis muncul pada ENTRY-nya sendiri, bukan menggantikan penulis feed", () => {
    // `awcms` ADR-0109. Ketiga permukaan yang menyebut penulis sebuah artikel —
    // halaman, JSON-LD, dan feed — harus menyebut orang yang sama; sebuah feed
    // yang mengkredit organisasi sementara halamannya mengkredit seseorang
    // adalah dua jawaban atas satu pertanyaan, dan pelanggan feed hanya melihat
    // salah satunya.
    const xmlByline = bangunFeedAtom(
      feed({
        butir: [
          {
            judul: "Artikel berbyline",
            url: "https://contoh.test/berita/berbyline/",
            ringkasan: "Ringkasan.",
            terbit: new Date("2026-08-02T03:00:00.000Z"),
            diubah: new Date("2026-08-02T03:00:00.000Z"),
            penulis: "Sari Wulandari"
          }
        ]
      })
    );

    const kepala = xmlByline.slice(0, xmlByline.indexOf("<entry>"));
    const entri = xmlByline.slice(xmlByline.indexOf("<entry>"));

    assert.ok(kepala.includes("<name>Situs Contoh</name>"), "penulis feed tetap organisasi");
    assert.ok(entri.includes("<name>Sari Wulandari</name>"));
  });

  test("byline entry membawa NAMA saja — tidak pernah uri atau email", () => {
    // Atom mengizinkan `<uri>` dan `<email>` di dalam `<author>`. Alamat surel
    // seorang editor adalah data pribadi yang tidak pernah diminta, dan sebuah
    // feed adalah tempat yang paling mudah disalin ulang oleh siapa pun.
    const xmlByline = bangunFeedAtom(
      feed({
        butir: [
          {
            judul: "Artikel berbyline",
            url: "https://contoh.test/berita/berbyline/",
            ringkasan: "Ringkasan.",
            terbit: new Date("2026-08-02T03:00:00.000Z"),
            diubah: new Date("2026-08-02T03:00:00.000Z"),
            penulis: "Sari Wulandari"
          }
        ]
      })
    );

    assert.equal(xmlByline.includes("<email>"), false);
    assert.equal(xmlByline.includes("<uri>"), false);
  });

  test("byline dilepas seperti setiap teks lain", () => {
    // Sebuah `&` pada nama penulis membuat pembaca feed menolak SELURUH berkas
    // sebagai XML yang tidak berbentuk, bukan hanya entry itu.
    const xmlAmp = bangunFeedAtom(
      feed({
        butir: [
          {
            judul: "Artikel",
            url: "https://contoh.test/berita/a/",
            ringkasan: "Ringkasan.",
            terbit: new Date("2026-08-02T03:00:00.000Z"),
            diubah: new Date("2026-08-02T03:00:00.000Z"),
            penulis: "Tim R&D"
          }
        ]
      })
    );

    assert.ok(xmlAmp.includes("<name>Tim R&amp;D</name>"));
  });

  test("teks dilepas, sehingga satu ampersand tidak merusak SELURUH berkas", () => {
    const xmlAmp = bangunFeedAtom(
      feed({
        butir: [
          {
            judul: "Bea & Cukai",
            url: "https://contoh.test/berita/bea/",
            ringkasan: "Tanda < dan > juga.",
            terbit: new Date("2026-08-01T00:00:00.000Z"),
            diubah: new Date("2026-08-01T00:00:00.000Z")
          }
        ]
      })
    );

    assert.ok(xmlAmp.includes("<title>Bea &amp; Cukai</title>"));
    assert.ok(xmlAmp.includes("Tanda &lt; dan &gt; juga."));
  });

  test("isi artikel TIDAK ikut — yang dikirim ringkasan", () => {
    assert.ok(xml.includes('<summary type="text">Ringkasan artikel pertama.</summary>'));
    assert.ok(!xml.includes("<content"));
  });
});

describe("bangunFeedAtom — yang ditolaknya", () => {
  test("seksi tanpa artikel", () => {
    assert.throws(() => bangunFeedAtom(feed({ butir: [] })), /tidak menerbitkan feed/);
  });

  test("URL entry yang relatif", () => {
    // Kelas cacat yang ADR-0033 sebut namanya: ilegal di Atom, diselesaikan
    // berbeda oleh tiap pembaca feed, dan tidak merusak XML-nya sama sekali.
    assert.throws(
      () =>
        bangunFeedAtom(
          feed({
            butir: [
              {
                judul: "Relatif",
                url: "/berita/relatif/",
                ringkasan: "…",
                terbit: new Date("2026-08-01T00:00:00.000Z"),
                diubah: new Date("2026-08-01T00:00:00.000Z")
              }
            ]
          })
        ),
      /bukan URL absolut/
    );
  });

  test("URL seksi yang relatif", () => {
    assert.throws(() => bangunFeedAtom(feed({ url: "/berita/" })), /bukan URL absolut/);
  });

  test("skema yang bukan http/https", () => {
    assert.throws(
      () => bangunFeedAtom(feed({ urlDiri: "ftp://contoh.test/berita/feed.xml" })),
      /bukan http\/https/
    );
  });

  test("tanggal yang tidak sah", () => {
    assert.throws(
      () =>
        bangunFeedAtom(
          feed({
            butir: [
              {
                judul: "Tanpa tanggal",
                url: "https://contoh.test/berita/x/",
                ringkasan: "…",
                terbit: new Date("bukan tanggal"),
                diubah: new Date("2026-08-01T00:00:00.000Z")
              }
            ]
          })
        ),
      /bukan tanggal yang sah/
    );
  });

  test("entry yang diubah SEBELUM terbit", () => {
    // Sebagian pembaca feed mengurutkan dengan `updated`; sebuah entry seperti
    // ini menetap di puncak daftar orang selamanya.
    assert.throws(
      () =>
        bangunFeedAtom(
          feed({
            butir: [
              {
                judul: "Terbalik",
                url: "https://contoh.test/berita/terbalik/",
                ringkasan: "…",
                terbit: new Date("2026-08-05T00:00:00.000Z"),
                diubah: new Date("2026-07-01T00:00:00.000Z")
              }
            ]
          })
        ),
      /diubah sebelum terbit/
    );
  });
});
