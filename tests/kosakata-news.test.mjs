/**
 * Gerbang kosakata `/news/` (ADR-0036, mengikuti ADR-0030).
 *
 * ADR-0036 menyatakan `/news/` sebagai kosakata URL repo ini, dan bentuknya
 * **sebuah tab bernama `news` yang menyatakan `urutanSeksi: "terbaru"`**.
 * Aturan itu bisa dilanggar secara diam-diam dengan satu kata: menamai tab
 * `news` lalu membiarkannya `"manual"`.
 *
 * Yang terjadi kalau itu lolos tidak terlihat seperti kegagalan. Build hijau,
 * `/news` terbit, dan setiap halamannya salah dengan cara yang sama:
 *
 *   - urutannya dari `urutan` yang diketik editor, bukan dari `publishedAt`,
 *     jadi artikel terbaru muncul di mana pun editor terakhir menaruhnya;
 *   - kartunya menampilkan nomor artikel, bukan tanggal;
 *   - artikelnya mengaku `Article` kepada mesin pencari, bukan `NewsArticle`.
 *
 * Sebuah permukaan yang mengaku berita di alamatnya dan membantahnya di setiap
 * detailnya. Tidak ada gerbang lain yang melihatnya: `urutanSeksi` adalah nilai
 * yang sah untuk tab mana pun, dan `astro check` hanya memeriksa tipenya.
 *
 * Gerbang ini SENGAJA tidak menuntut tab `news` ada. ADR-0036 §2 menyatakan
 * `news` bukan kata yang dipesan — template ini mengirimkan tiga tab dan nol di
 * antaranya berita, dan itu benar.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";

import { tabs } from "../src/config/site.ts";

/** Slug yang ADR-0036 ikat pada semantik seksi berita. */
const SLUG_BERITA = "news";

/** Nilai `urutanSeksi` yang menjadikan sebuah seksi benar-benar seksi berita (ADR-0033). */
const URUTAN_BERITA = "terbaru";

/**
 * Putuskan apakah konfigurasi tab menghormati kosakata ADR-0036.
 *
 * Murni terhadap daftar tab yang disuntikkan, supaya cacatnya bisa diumpankan
 * langsung tanpa menulis `src/config/site.ts`.
 */
export function periksaKosakataNews(daftarTab) {
  const beritanya = daftarTab.filter((tab) => tab.slug === SLUG_BERITA);

  if (beritanya.length === 0) {
    // Tidak punya tab `news` adalah keadaan yang sah — ADR-0036 §2.
    return { lolos: true, masalah: [] };
  }

  const masalah = [];

  if (beritanya.length > 1) {
    masalah.push(
      `Ada ${beritanya.length} tab ber-slug "${SLUG_BERITA}". Slug adalah alamat; ` +
        "dua tab yang sama berarti satu URL yang isinya bergantung pada urutan array."
    );
  }

  for (const tab of beritanya) {
    if (tab.urutanSeksi !== URUTAN_BERITA) {
      masalah.push(
        `Tab "${SLUG_BERITA}" menyatakan urutanSeksi: "${tab.urutanSeksi}", ` +
          `wajib "${URUTAN_BERITA}" (ADR-0036 §1). Prefiks /news/ adalah kosakata ` +
          "berita repo ini; sebuah seksi di alamat itu yang diurutkan manual akan " +
          "menampilkan artikel terbaru di mana pun editor terakhir menaruhnya, " +
          "berkartu nomor artikel alih-alih tanggal, dan mengaku Article alih-alih " +
          "NewsArticle. Kalau seksinya memang bukan berita, beri ia slug lain."
      );
    }
  }

  return { lolos: masalah.length === 0, masalah };
}

describe("ADR-0036 — /news/ adalah kosakata repo ini", () => {
  test("konfigurasi tab repo ini menghormati kosakatanya", () => {
    const hasil = periksaKosakataNews([...tabs]);
    assert.deepEqual(hasil.masalah, []);
    assert.equal(hasil.lolos, true);
  });

  test("template ini sendiri tidak mengirimkan tab news — dan itu benar (§2)", () => {
    assert.equal(
      tabs.some((tab) => tab.slug === SLUG_BERITA),
      false,
      "Template mengirimkan tab `news`. ADR-0036 §2 menyatakan `news` bukan kata " +
        "yang dipesan dan template ini tidak mewajibkan satu pun situs punya berita; " +
        "kalau itu berubah, ia butuh keputusannya sendiri."
    );
  });

  // --- Mutasi: tiap aturan diberi cacat yang wajib ia tangkap. ---

  test("MERAH bila tab news diurutkan manual", () => {
    const hasil = periksaKosakataNews([
      { slug: "panduan", label: "Panduan", urutanSeksi: "manual" },
      { slug: "news", label: "Berita", urutanSeksi: "manual" }
    ]);
    assert.equal(hasil.lolos, false);
    assert.match(hasil.masalah.join(" "), /wajib "terbaru"/);
  });

  test("MERAH bila ada dua tab ber-slug news", () => {
    const hasil = periksaKosakataNews([
      { slug: "news", label: "Berita", urutanSeksi: "terbaru" },
      { slug: "news", label: "Warta", urutanSeksi: "terbaru" }
    ]);
    assert.equal(hasil.lolos, false);
    assert.match(hasil.masalah.join(" "), /dua tab yang sama/);
  });

  test("HIJAU bila tab news diurutkan terbaru", () => {
    const hasil = periksaKosakataNews([
      { slug: "news", label: "Berita", urutanSeksi: "terbaru" },
      { slug: "panduan", label: "Panduan", urutanSeksi: "manual" }
    ]);
    assert.equal(hasil.lolos, true);
  });

  test("HIJAU bila tidak ada tab news sama sekali (§2)", () => {
    const hasil = periksaKosakataNews([
      { slug: "panduan", label: "Panduan", urutanSeksi: "manual" }
    ]);
    assert.equal(hasil.lolos, true);
  });

  test("HIJAU bila seksi berita memakai slug lain — aturannya soal alamat, bukan isi", () => {
    const hasil = periksaKosakataNews([
      { slug: "warta", label: "Warta", urutanSeksi: "terbaru" }
    ]);
    assert.equal(hasil.lolos, true);
  });
});
