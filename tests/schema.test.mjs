/**
 * Gerbang structured data.
 *
 * Setiap klaim di berkas ini dibaca MESIN, tidak pernah manusia — dan itu yang
 * membuatnya butuh tes alih-alih review. Sebuah `datePublished` yang salah tidak
 * terlihat di halaman, tidak menggagalkan build, dan tidak muncul di satu pun
 * gerbang lain; ia hanya membuat crawler mempercayai sesuatu yang tidak benar,
 * berbulan-bulan, sampai ada yang menempelkan URL-nya ke penguji Google.
 *
 * Dua cacat yang persis pernah hidup di repo ini dan dijaga di sini:
 *
 *   1. **Satu nilai mengisi dua klaim.** `datePublished` dan `dateModified`
 *      keduanya dibaca dari `updatedDate`, sehingga tidak ada satu pun halaman
 *      yang pernah melaporkan koreksi (ADR-0033).
 *   2. **`ImageObject` yang menjanjikan berkas yang tidak ada.** Properti
 *      `image` dulu selalu dipasang, menunjuk kartu yang tidak pernah
 *      dibangkitkan siapa pun.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";

import { articleSchema, tipeArtikelSeksi } from "../src/lib/schema.ts";

const TERBIT = new Date("2026-08-01T02:00:00.000Z");
const DIUBAH = new Date("2026-08-05T09:30:00.000Z");

function buatMasukan(tambahan = {}) {
  return {
    locale: "id",
    canonicalUrl: "https://contoh.test/news/kabar-pertama/",
    title: "Kabar pertama",
    description: "Ringkasan kabar pertama.",
    imageAlt: "Foto kabar pertama",
    publishedDate: TERBIT,
    modifiedDate: DIUBAH,
    section: "Berita",
    tipe: "NewsArticle",
    ...tambahan
  };
}

describe("articleSchema", () => {
  test("tipe artikel datang dari pemanggil, bukan ditebak dari isinya", () => {
    assert.equal(articleSchema(buatMasukan())["@type"], "NewsArticle");
    assert.equal(articleSchema(buatMasukan({ tipe: "Article" }))["@type"], "Article");
  });

  test("datePublished dan dateModified adalah DUA nilai, bukan satu dipasang dua kali", () => {
    // Cacat yang ditutup ADR-0033. Ia tidak bisa dilihat typecheck (kedua field
    // bertipe Date), tidak terlihat di halaman, dan tidak menggagalkan apa pun.
    const skema = articleSchema(buatMasukan());

    assert.equal(skema.datePublished, TERBIT.toISOString());
    assert.equal(skema.dateModified, DIUBAH.toISOString());
    assert.notEqual(skema.datePublished, skema.dateModified);
  });

  test("tanggal diteruskan APA ADANYA, tidak dijepit", () => {
    // Menjepit `modifiedDate` ke `max(modified, published)` akan membuat
    // gerbang urutan tanggal di `audit:konten` mustahil merah — dan dengan itu
    // menyembunyikan data yang tidak konsisten alih-alih menampilkannya.
    // ADR-0033 §Alternatif menolaknya; tes ini yang menguncinya, karena
    // penjepitan adalah tiga karakter yang lolos typecheck.
    const terbalik = articleSchema(
      buatMasukan({ publishedDate: DIUBAH, modifiedDate: TERBIT })
    );

    assert.equal(terbalik.datePublished, DIUBAH.toISOString());
    assert.equal(terbalik.dateModified, TERBIT.toISOString());
  });

  test("author selalu ada, dan ia ORGANISASI — tidak pernah nama seorang editor", () => {
    // Paritas dengan awcms, yang memancarkan byline tingkat organisasi dan
    // mencatat alasannya: identitas pengguna internal di structured data publik
    // adalah permukaan PII baru. `NewsArticle` tanpa author sekaligus lebih
    // miskin daripada `Article` yang digantikannya.
    const { author } = articleSchema(buatMasukan());

    assert.equal(author["@type"], "Organization");
    assert.equal(typeof author.name, "string");
    assert.ok(author.name.length > 0, "author.name kosong");
  });

  test("author ditulis INLINE, bukan sebagai rujukan @id", () => {
    // Pembaca structured data yang tidak menyelesaikan `@id` akan membaca
    // artikel tanpa penulis sama sekali — persis keadaan yang author ini ada
    // untuk mengakhirinya.
    const { author } = articleSchema(buatMasukan());
    assert.equal("@id" in author, false);
  });

  test("properti image hanya muncul bila gambarnya benar-benar ada", () => {
    assert.equal("image" in articleSchema(buatMasukan()), false);

    const dengan = articleSchema(
      buatMasukan({
        image: "https://media.contoh.test/kartu.webp",
        imageWidth: 1600,
        imageHeight: 900
      })
    );

    assert.equal(dengan.image["@type"], "ImageObject");
    assert.equal(dengan.image.width, 1600);
    assert.equal(dengan.image.height, 900);
  });

  test("ukuran gambar yang dilaporkan sumbernya menang atas konstanta kartu situs", () => {
    // Konstanta 1200x630 hanya berlaku untuk SITE_SOCIAL_IMAGE, yang
    // `.env.example` kontrakkan sebagai PNG seukuran itu. Kartu per artikel dari
    // media awcms adalah apa pun yang diunggah editor.
    const dengan = articleSchema(
      buatMasukan({ image: "https://media.contoh.test/kartu.webp", imageWidth: 1600, imageHeight: 900 })
    );
    assert.notEqual(dengan.image.width, 1200);
  });

  test("headline dipotong 110 karakter", () => {
    const panjang = "a".repeat(200);
    assert.equal(articleSchema(buatMasukan({ title: panjang })).headline.length, 110);
  });
});

describe("tipeArtikelSeksi", () => {
  // Keputusan ini pernah berupa ekspresi terner di dalam `ArtikelLayout.astro`,
  // tempat `astro check` tidak menjangkaunya dan tidak ada tes yang bisa
  // memanggilnya — jadi ia bisa dibalik tanpa satu gerbang pun berubah warna.
  test("seksi manual dan seksi tak dikenal menghasilkan Article", () => {
    assert.equal(tipeArtikelSeksi("panduan"), "Article");
    assert.equal(tipeArtikelSeksi("tab-yang-tidak-pernah-ada"), "Article");
    assert.equal(tipeArtikelSeksi(""), "Article");
  });

  test("setiap tab template ini menghasilkan Article — tak satu pun seksi berita", async () => {
    // Pasangan wajib dari tes di atas: ia yang membuktikan template TIDAK
    // diam-diam mengubah perilaku ketiga tab yang sudah ada.
    const { tabs } = await import("../src/config/site.ts");

    for (const tab of tabs) {
      assert.equal(tipeArtikelSeksi(tab.slug), "Article", tab.slug);
      assert.equal(tab.urutanSeksi, "manual", tab.slug);
    }
  });
});
