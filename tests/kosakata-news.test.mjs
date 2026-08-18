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

import { permukaanAdmin, tabs } from "../src/config/site.ts";

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

// ---------------------------------------------------------------------------
// The OTHER half of ADR-0036, which had no checker until 18 August 2026.
// ---------------------------------------------------------------------------

/**
 * The segment that belongs to `awcms` and may not be built here.
 *
 * ADR-0036 splits the vocabulary in BOTH directions — `/news/` is this repo's,
 * `/blog/` is `awcms`'s — and `AGENTS.md` writes the second half as an
 * imperative ("Do not build `/blog/**` here"). Only the first half was gated,
 * which is the shape the gate skill calls "a rule that is correct and that
 * nobody ever checked".
 *
 * What makes it worth closing NOW rather than one day is `awcms` ADR-0098
 * (15 August 2026): its public content surface moved the locale into the PATH,
 * so its canonical URL is `/{locale}/blog/{tenantCode}/…`. That is the same
 * shape this repo's own routes produce — `src/pages/[lang]/[tab]/…` — so a tab
 * whose slug is `blog` would publish `/en/blog/…` and `/id/blog/…` here: not a
 * near-miss of the other repo's vocabulary but a character-for-character
 * collision with it, on a build that stays green and a site that looks right.
 */
const SEGMEN_MILIK_AWCMS = "blog";

/**
 * Every literal path segment `src/pages/` puts into a URL.
 *
 * Dynamic segments (`[lang]`, `[tab]`, `[...slug]`) are skipped: they are
 * filled from configuration, and the configuration side is checked separately
 * below. What is left is exactly what a route file HARD-CODES into the URL,
 * which is the only thing a file name can decide on its own.
 */
function segmenLiteralRute() {
  const ditemukan = new Set();

  for (const nama of new Bun.Glob("**/*.{astro,ts}").scanSync("src/pages")) {
    for (const segmen of nama.split("/")) {
      const tanpaEkstensi = segmen.replace(/\.(astro|ts)$/, "");

      if (!tanpaEkstensi.startsWith("[")) {
        ditemukan.add(tanpaEkstensi);
      }
    }
  }

  return [...ditemukan];
}

/**
 * Decide whether a configuration claims the segment that belongs to `awcms`.
 *
 * Pure over its arguments so the defect can be fed in directly, the same shape
 * as `periksaKosakataNews` above.
 */
export function periksaKosakataBlog(daftarTab, prefiksAdmin, segmenRute) {
  const masalah = [];

  for (const tab of daftarTab) {
    if (tab.slug === SEGMEN_MILIK_AWCMS) {
      masalah.push(
        `Tab ber-slug "${SEGMEN_MILIK_AWCMS}" akan menerbitkan /${SEGMEN_MILIK_AWCMS}/ ` +
          `dan /{lang}/${SEGMEN_MILIK_AWCMS}/ dari repo ini. Sejak awcms ADR-0098 ` +
          `alamat kanonik permukaan publiknya persis berbentuk itu ` +
          `(/{locale}/blog/{tenantCode}/…), jadi ini bukan kemiripan melainkan ` +
          `tabrakan huruf per huruf. ADR-0036: /blog/ milik awcms, /news/ milik repo ini.`
      );
    }
  }

  for (const prefiks of prefiksAdmin) {
    if (
      prefiks === `/${SEGMEN_MILIK_AWCMS}` ||
      prefiks.startsWith(`/${SEGMEN_MILIK_AWCMS}/`)
    ) {
      masalah.push(
        `permukaanAdmin.prefiks memuat "${prefiks}" — ia meletakkan permukaan ` +
          `terautentikasi di kosakata URL milik awcms (ADR-0036).`
      );
    }
  }

  if (segmenRute.includes(SEGMEN_MILIK_AWCMS)) {
    masalah.push(
      `Ada berkas rute di src/pages/ yang menuliskan segmen "${SEGMEN_MILIK_AWCMS}" ` +
        `secara harfiah. AGENTS.md: jangan bangun /blog/** di sini — modulnya sama, ` +
        `layar pengelolanya sama, yang dibelah adalah URL-nya.`
    );
  }

  return { lolos: masalah.length === 0, masalah };
}

describe("ADR-0036 — /blog/ BUKAN kosakata repo ini", () => {
  test("repo ini tidak mengklaim satu pun bentuk /blog/", () => {
    const hasil = periksaKosakataBlog(
      [...tabs],
      [...permukaanAdmin.prefiks],
      segmenLiteralRute()
    );
    assert.deepEqual(hasil.masalah, []);
  });

  test("rute repo ini memang dibaca — bukan daftar kosong yang selalu hijau", () => {
    // Without this the route check above would pass just as happily if the
    // glob stopped matching anything, which is how a gate quietly stops
    // gating. `robots.txt` is a literal segment that has been there since the
    // first build and is not going anywhere.
    assert.ok(segmenLiteralRute().includes("robots.txt"));
  });

  // --- Mutasi: tiap aturan diberi cacat yang wajib ia tangkap. ---

  test("MERAH bila sebuah tab mengklaim slug blog", () => {
    const hasil = periksaKosakataBlog(
      [{ slug: "blog", label: "Blog", urutanSeksi: "terbaru" }],
      [],
      []
    );
    assert.equal(hasil.lolos, false);
    assert.match(hasil.masalah.join(" "), /tabrakan huruf per huruf/);
  });

  test("MERAH bila prefiks admin masuk ke /blog", () => {
    const hasil = periksaKosakataBlog([], ["/blog/redaksi"], []);
    assert.equal(hasil.lolos, false);
    assert.match(hasil.masalah.join(" "), /permukaanAdmin\.prefiks/);
  });

  test("MERAH bila ada berkas rute bernama blog", () => {
    const hasil = periksaKosakataBlog([], [], ["robots.txt", "blog"]);
    assert.equal(hasil.lolos, false);
    assert.match(hasil.masalah.join(" "), /secara harfiah/);
  });

  test("HIJAU untuk slug yang hanya MEMUAT kata blog", () => {
    // The rule is about the address, not about the word: `/blog-panduan/` is
    // this repo's own URL and collides with nothing.
    const hasil = periksaKosakataBlog(
      [{ slug: "blog-panduan", label: "Blog Panduan", urutanSeksi: "manual" }],
      ["/blogger"],
      ["blog-panduan"]
    );
    assert.equal(hasil.lolos, true);
  });
});
