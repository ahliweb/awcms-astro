/**
 * Gerbang atas gerbangnya sendiri — `scripts/audit-konten.mjs`.
 *
 * ## Kenapa berkas ini ada
 *
 * `audit-konten.mjs` adalah skrip gerbang terbesar repo ini (879 baris) dan
 * satu-satunya yang tidak punya tesnya sendiri: `audit-dokumen.mjs` dan
 * `audit-graf.mjs` masing-masing sudah dijaga sejak hari mereka lahir.
 *
 * Yang membuat selisih itu mahal bukan jumlah barisnya, melainkan **kapan**
 * baris-baris itu berjalan. Seluruh keluarga keluaran — SEO, hreflang, aset
 * yang dijanjikan metadata, tautan mati, sitemap, nama key bocor, dan KEDUA
 * gerbang performa — berada di belakang `if (existsSync("dist/client"))`, dan
 * `dist/client` lahir dari `bun run build` yang butuh sumber konten `awcms`.
 * Repo template ini tidak punya instans, jadi sampai berkas ini ada, ~330
 * baris pemeriksa **tidak pernah dieksekusi satu kali pun di repo tempat ia
 * ditulis** — tidak di CI, tidak di `bun test`, tidak di mana pun.
 *
 * Akibatnya bukan hipotetis. Dua baris di tabel celah
 * `docs/awcms-astro/standar-performa-dan-keamanan.md` — celah 2
 * (`fetchpriority` pada gambar eager) dan celah 3 (anggaran gambar) —
 * menyebut fungsi di dalam berkas ini sebagai pemeriksanya, dan berbunyi
 * **DITUTUP**. Sebuah `sed` yang salah, satu regex yang berhenti cocok, atau
 * satu `continue` yang tergeser akan membuat keduanya diam-diam berhenti
 * memeriksa apa pun, dan tidak ada satu gerbang pun di repo ini yang akan
 * merah. Itu keadaan yang persis dilarang ADR-0032: gerbang yang tidak bisa
 * dibuktikan di tempat ia ditulis akan membusuk.
 *
 * ## Cara berkas ini menjawabnya
 *
 * Skripnya tidak diubah supaya bisa diuji — ia dijalankan **apa adanya**, dari
 * direktori kerja lain. Fixture-nya pohon berkas sungguhan di direktori
 * sementara: `src/config/site.ts` dan `src/styles/global.css` yang benar-benar
 * dibaca skripnya, plus `dist/client/**` yang bentuknya sama dengan keluaran
 * Astro. Yang diuji harus disk, karena yang dibaca skripnya adalah disk.
 *
 * Tiap gerbang dibuktikan **dua arah**: MERAH saat cacatnya ada, HIJAU saat
 * tidak. Arah kedua yang menahan biaya terbesar — sebuah pemeriksa yang
 * memerahkan segalanya lulus uji "ia menangkap cacat ini" tanpa berguna sama
 * sekali. Beberapa kasus sengaja menguji **pengecualian yang disengaja**
 * (judul kembar antar locale, rasio di `public/`, `srcset` yang sama dihitung
 * sekali), karena pengecualian yang tidak diuji adalah pengecualian yang akan
 * dihapus orang berikutnya yang membaca kodenya sebagai kelalaian.
 *
 * Kasus terakhir menjalankan skripnya atas repo ini sendiri.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SKRIP = resolve("scripts/audit-konten.mjs");

/** @type {string[]} */
const sementara = [];

afterEach(() => {
  while (sementara.length) rmSync(sementara.pop(), { recursive: true, force: true });
});

/**
 * Pohon fixture: `{ "dist/client/index.html": "…" }` → direktori sungguhan.
 *
 * @param {Record<string, string | Uint8Array>} berkas
 */
function pohon(berkas) {
  const akar = mkdtempSync(join(tmpdir(), "audit-konten-"));
  sementara.push(akar);

  for (const [jalur, isi] of Object.entries(berkas)) {
    const penuh = join(akar, jalur);
    mkdirSync(join(penuh, ".."), { recursive: true });
    writeFileSync(penuh, isi);
  }

  return akar;
}

/**
 * Skripnya membaca dari direktori kerja, bukan dari argumen. Menjalankannya
 * dengan `cwd` fixture karena itu menguji jalur yang sama persis dengan
 * `bun run audit:konten` di sebuah situs — bukan mode uji yang hanya ada di
 * sini.
 */
function jalankan(akar) {
  const hasil = Bun.spawnSync(["bun", SKRIP], { cwd: akar });
  return {
    kode: hasil.exitCode,
    keluaran: hasil.stdout.toString() + hasil.stderr.toString()
  };
}

/**
 * Dua berkas sumber yang dibaca skripnya sebelum gerbang mana pun jalan.
 * Keduanya sengaja tidak di-mock: locale dan rasio dibaca dari konfigurasi
 * situs justru supaya tidak ada angka kedua yang bisa menyimpang.
 */
const SUMBER = {
  "src/config/site.ts":
    'export const defaultLocale = "id" as const;\n\n' +
    "export const localeMeta = {\n" +
    '  id: { htmlLang: "id-ID", iso: "id" },\n' +
    '  en: { htmlLang: "en-US", iso: "en" }\n' +
    "} as const;\n",
  "src/styles/global.css": ":root {\n  --ratio-visual: 16 / 9;\n}\n"
};

/**
 * Satu halaman keluaran yang LULUS seluruh gerbang. Tiap kasus merah di bawah
 * merusak tepat satu hal darinya, sehingga yang diuji adalah gerbang itu dan
 * bukan kelengkapan fixture-nya.
 *
 * `null` pada sebuah bidang berarti tag itu tidak dipancarkan sama sekali —
 * bedanya dengan string kosong penting: keduanya cacat, dan skripnya harus
 * menangkap keduanya.
 */
function halaman({
  judul = "Beranda",
  deskripsi = "Deskripsi yang layak dibaca di hasil pencarian.",
  canonical = "https://contoh.test/",
  alternate = [
    ["id", "/"],
    ["x-default", "/"]
  ],
  noindex = false,
  kepala = "",
  badan = ""
} = {}) {
  const kepalaTag = [];

  if (judul !== null) kepalaTag.push(`<title>${judul}</title>`);
  if (deskripsi !== null) kepalaTag.push(`<meta name="description" content="${deskripsi}">`);
  if (canonical !== null) kepalaTag.push(`<link rel="canonical" href="${canonical}">`);
  if (noindex) kepalaTag.push('<meta name="robots" content="noindex, nofollow">');

  for (const [hreflang, href] of alternate) {
    kepalaTag.push(`<link rel="alternate" hreflang="${hreflang}" href="${href}">`);
  }

  return (
    '<!doctype html><html lang="id"><head>' +
    kepalaTag.join("") +
    kepala +
    "</head><body>" +
    badan +
    "</body></html>"
  );
}

/** Situs kecil yang hijau, ditambah/ditimpa berkas kasusnya. */
function situs(tambahan = {}) {
  return pohon({ ...SUMBER, "dist/client/index.html": halaman(), ...tambahan });
}

/** Berkas sebesar `kb` kilobyte. Isinya tidak dibaca gerbang anggaran — hanya ukurannya. */
function berat(kb) {
  return "x".repeat(kb * 1024);
}

/** PNG yang hanya membawa IHDR: cukup untuk format dan dimensinya, tidak untuk dirender. */
function png(lebar, tinggi) {
  const buf = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write("IHDR", 12, "latin1");
  buf.writeUInt32BE(lebar, 16);
  buf.writeUInt32BE(tinggi, 20);
  return buf;
}

/** JPEG minimal ber-SOF0, supaya dimensinya benar-benar terbaca penyusur marker. */
function jpeg(lebar, tinggi) {
  const buf = Buffer.alloc(20);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  buf[3] = 0xc0;
  buf.writeUInt16BE(17, 4);
  buf[6] = 8;
  buf.writeUInt16BE(tinggi, 7);
  buf.writeUInt16BE(lebar, 9);
  return buf;
}

/** AVIF: dikenali formatnya, dimensinya BELUM bisa dibaca gerbang ini. Itu yang diuji. */
function avif() {
  const buf = Buffer.alloc(32);
  buf.writeUInt32BE(32, 0);
  buf.write("ftypavif", 4, "latin1");
  return buf;
}

function svg({ viewBox = '0 0 1600 900', isi = "" } = {}) {
  const atribut = viewBox === null ? "" : ` viewBox="${viewBox}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg"${atribut}>${isi}</svg>`;
}

// ---------------------------------------------------------------------------
// Kondisi jalan — yang membuat seluruh berkas ini perlu ada
// ---------------------------------------------------------------------------

describe("keluarga keluaran hanya jalan bila ada yang bisa diperiksa", () => {
  test("tanpa dist/client ia melewati dirinya DAN menyebut apa yang dilewati", () => {
    const akar = pohon(SUMBER);

    const { kode, keluaran } = jalankan(akar);

    // Bukan sekadar "lulus": gerbang yang diam saat tidak jalan tidak bisa
    // dibedakan dari gerbang yang jalan dan bersih. Nama tiap keluarga wajib
    // ikut disebut, karena itulah satu-satunya jejak yang dibaca manusia.
    expect(keluaran).toContain("SELURUH gerbang keluaran DILEWATI");
    // Keluarga yang dilewati DISEBUT namanya, dan daftarnya ikut bertambah saat
    // keluarga baru mendarat. Daftar yang membeku setelah gerbang keenam
    // ditambahkan berbohong dengan cara yang paling tenang: pembaca menyimpulkan
    // gerbang yang tidak disebut memang berjalan.
    for (const keluarga of ["klaim artikel JSON-LD", "tanggal Open Graph"]) {
      expect(keluaran).toContain(keluarga);
    }
    expect(keluaran).toContain("SEO");
    expect(keluaran).toContain("nama key bocor");
    expect(keluaran).not.toContain("halaman diperiksa");
    expect(kode).toBe(0);
  });

  test("dengan dist/client ia benar-benar berjalan, bukan lulus diam-diam", () => {
    const { kode, keluaran } = jalankan(situs());

    expect(keluaran).toContain("1 halaman diperiksa");
    expect(keluaran).toContain("origin situs terbaca dari canonical: https://contoh.test");
    expect(keluaran).not.toContain("DILEWATI");
    expect(kode).toBe(0);
  });

  test("keluaran tanpa satu pun canonical absolut MERAH, bukan dilewati", () => {
    // Tanpa origin, gerbang ini tidak bisa membedakan tautan internal dari
    // eksternal — dan pemeriksa yang kehilangan kemampuan membedakan harus
    // berhenti, bukan menganggap semuanya eksternal lalu melaporkan bersih.
    const akar = situs({
      "dist/client/index.html": halaman({ canonical: "/", alternate: [["x-default", "/"]] })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tidak ada satu pun canonical absolut");
    expect(kode).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

describe("metadata SEO", () => {
  test("halaman tanpa <title> merah", () => {
    const { kode, keluaran } = jalankan(situs({ "dist/client/index.html": halaman({ judul: null }) }));

    expect(keluaran).toContain("tanpa <title>");
    expect(kode).toBe(1);
  });

  test("<title> yang ada tetapi kosong juga merah", () => {
    const { kode, keluaran } = jalankan(situs({ "dist/client/index.html": halaman({ judul: "   " }) }));

    expect(keluaran).toContain("tanpa <title>");
    expect(kode).toBe(1);
  });

  test("halaman tanpa meta description merah", () => {
    const { kode, keluaran } = jalankan(
      situs({ "dist/client/index.html": halaman({ deskripsi: null }) })
    );

    expect(keluaran).toContain("tanpa meta description");
    expect(kode).toBe(1);
  });

  test("halaman tanpa canonical merah bila ia tidak dinyatakan noindex", () => {
    const akar = situs({
      "dist/client/panduan/index.html": halaman({
        judul: "Panduan",
        canonical: null,
        alternate: [
          ["id", "/panduan/"],
          ["x-default", "/panduan/"]
        ]
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tanpa canonical, dan tidak dinyatakan noindex");
    expect(kode).toBe(1);
  });

  test("halaman noindex tanpa canonical HIJAU — ia memang tidak minta diindeks", () => {
    // Arah kedua yang menahan biaya: sebuah gerbang yang mewajibkan canonical
    // di mana-mana akan memerahkan halaman terima kasih, pratinjau, dan 404 —
    // lalu dilonggarkan seluruhnya oleh orang yang lelah melihatnya merah.
    const akar = situs({
      "dist/client/rahasia/index.html": halaman({
        judul: "Rahasia",
        canonical: null,
        noindex: true,
        alternate: []
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("noindex yang tetap memasang canonical merah — dua sinyal bertabrakan", () => {
    const akar = situs({
      "dist/client/rahasia/index.html": halaman({
        judul: "Rahasia",
        canonical: "https://contoh.test/rahasia/",
        noindex: true,
        alternate: []
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("dua sinyal yang bertabrakan");
    expect(kode).toBe(1);
  });

  test("judul kembar DI DALAM satu locale merah", () => {
    const akar = situs({
      "dist/client/panduan/index.html": halaman({
        judul: "Beranda",
        canonical: "https://contoh.test/panduan/",
        alternate: [
          ["id", "/panduan/"],
          ["x-default", "/panduan/"]
        ]
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("judul kembar");
    expect(kode).toBe(1);
  });

  test("judul yang sama ANTAR locale hijau — terjemahan yang belum ada memang begitu", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        alternate: [
          ["id", "/"],
          ["en", "/en/"],
          ["x-default", "/"]
        ]
      }),
      "dist/client/en/index.html": halaman({
        canonical: "https://contoh.test/en/",
        alternate: [
          ["id", "/"],
          ["en", "/en/"],
          ["x-default", "/"]
        ]
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Aset yang dijanjikan metadata
// ---------------------------------------------------------------------------

describe("klaim artikel di JSON-LD", () => {
  /** Blok JSON-LD berbentuk `@graph`, sama seperti yang dipancarkan BaseLayout. */
  const graf = (artikel) =>
    '<script type="application/ld+json">' +
    JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", "@id": "https://contoh.test/#website" },
        artikel
      ]
    }) +
    "</script>";

  const ARTIKEL = {
    "@type": "NewsArticle",
    "@id": "https://contoh.test/news/kabar/#article",
    headline: "Kabar",
    datePublished: "2026-08-01T02:00:00.000Z",
    dateModified: "2026-08-05T09:30:00.000Z",
    author: { "@type": "Organization", name: "Situs Contoh" }
  };

  test("artikel yang lengkap hijau", () => {
    const akar = situs({ "dist/client/index.html": halaman({ kepala: graf(ARTIKEL) }) });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("simpul artikel ditemukan meski bersarang di dalam @graph", () => {
    // Pemindai yang hanya melihat akar akan melaporkan nol pelanggaran atas nol
    // simpul — terbaca persis seperti lulus. Kasus ini yang membuktikan
    // gerbangnya benar-benar sampai ke dalam.
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: graf({ ...ARTIKEL, author: undefined })
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("NewsArticle tanpa author.name yang terbaca");
    expect(kode).toBe(1);
  });

  test("dateModified yang mendahului datePublished merah", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: graf({
          ...ARTIKEL,
          datePublished: "2026-08-05T00:00:00.000Z",
          dateModified: "2026-07-10T00:00:00.000Z"
        })
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("mendahului datePublished");
    expect(kode).toBe(1);
  });

  test("dua tanggal yang IDENTIK tetap hijau — itu keadaan yang sah", () => {
    // Artikel yang belum pernah dikoreksi memang membawa dua stempel yang sama.
    // Gerbang ini menjaga URUTAN dan KEBERADAAN, bukan memaksa keduanya berbeda:
    // aturan yang dilanggar konten yang sah adalah aturan yang akan dilonggarkan
    // orang berikutnya.
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: graf({ ...ARTIKEL, dateModified: ARTIKEL.datePublished })
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("artikel tanpa datePublished merah", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: graf({ ...ARTIKEL, datePublished: undefined })
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("NewsArticle tanpa datePublished");
    expect(kode).toBe(1);
  });

  test("tanggal yang bukan tanggal merah", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: graf({ ...ARTIKEL, dateModified: "kemarin" })
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("yang bukan tanggal: kemarin");
    expect(kode).toBe(1);
  });

  test("author sebagai rujukan @id tanpa nama merah", () => {
    // Pembaca structured data yang tidak menyelesaikan `@id` membaca artikel ini
    // sebagai tanpa penulis sama sekali.
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: graf({ ...ARTIKEL, author: { "@id": "https://contoh.test/#publisher" } })
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tanpa author.name yang terbaca");
    expect(kode).toBe(1);
  });

  test("Article biasa dijaga aturan yang sama persis dengan NewsArticle", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: graf({ ...ARTIKEL, "@type": "Article", author: undefined })
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("Article tanpa author.name yang terbaca");
    expect(kode).toBe(1);
  });

  test("halaman tanpa simpul artikel sama sekali tetap hijau", () => {
    // Halaman seksi dan beranda memancarkan ItemList, bukan Article. Gerbang ini
    // tidak boleh menuntut mereka membawa tanggal terbit.
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala:
          '<script type="application/ld+json">' +
          JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "ItemList" }] }) +
          "</script>"
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });
});

describe("pasangan tanggal Open Graph", () => {
  const og = (published, modified) =>
    [
      published === null
        ? ""
        : `<meta property="article:published_time" content="${published}">`,
      modified === null
        ? ""
        : `<meta property="article:modified_time" content="${modified}">`
    ].join("");

  test("pasangan yang lengkap dan berurutan hijau", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: og("2026-08-01T02:00:00.000Z", "2026-08-05T09:30:00.000Z")
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("halaman tanpa keduanya hijau — bukan setiap halaman itu artikel", () => {
    const { kode, keluaran } = jalankan(situs());
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("hanya published_time saja merah", () => {
    // Yang sendirian terbaca sebagai artikel tanpa riwayat perubahan.
    const akar = situs({
      "dist/client/index.html": halaman({ kepala: og("2026-08-01T02:00:00.000Z", null) })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("keduanya berpasangan");
    expect(kode).toBe(1);
  });

  test("modified mendahului published merah", () => {
    // Inilah cacat yang tidak bisa dilihat gerbang JSON-LD: permukaan ini
    // hidup di `.astro`, yang tidak dijangkau typecheck maupun tes.
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: og("2026-08-05T00:00:00.000Z", "2026-07-10T00:00:00.000Z")
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("article:modified_time mendahului");
    expect(kode).toBe(1);
  });

  test("tanggal yang bukan tanggal merah", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: og("2026-08-01T02:00:00.000Z", "kemarin")
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("article:modified_time bukan tanggal");
    expect(kode).toBe(1);
  });

  test("dua nilai IDENTIK hijau — artikel yang belum pernah dikoreksi", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: og("2026-08-01T02:00:00.000Z", "2026-08-01T02:00:00.000Z")
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });
});

describe("aset yang dijanjikan metadata", () => {
  const kartu = (href) =>
    `<meta property="og:image" content="${href}">` +
    `<meta name="twitter:image" content="${href}">`;

  test("og:image yang tidak diterbitkan build ini merah", () => {
    // Ini cacat yang benar-benar pernah terjadi di template ini dengan build
    // hijau: `/social/<slug>.png` diiklankan ke setiap pratinjau tautan, dan
    // tidak ada yang pernah membangkitkannya.
    const akar = situs({
      "dist/client/index.html": halaman({ kepala: kartu("/social/beranda.png") })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("metadata menunjuk /social/beranda.png yang tidak ada");
    expect(kode).toBe(1);
  });

  test("og:image yang benar-benar ada hijau", () => {
    const akar = situs({
      "dist/client/index.html": halaman({ kepala: kartu("/social/beranda.png") }),
      "dist/client/social/beranda.png": png(1200, 630)
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("kartu di host lain dilewati — ia bukan milik build ini", () => {
    const akar = situs({
      "dist/client/index.html": halaman({ kepala: kartu("https://media.contoh.test/kartu.png") })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("bidang image JSON-LD yang tidak diterbitkan merah", () => {
    // Bentuk paling lazim, dan yang paling mudah luput: `image` sebagai string
    // di akar sebuah Article.
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      image: "/kartu/artikel.png"
    });

    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: `<script type="application/ld+json">${jsonLd}</script>`
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("metadata menunjuk /kartu/artikel.png yang tidak ada");
    expect(kode).toBe(1);
  });

  test("ImageObject yang bersarang dalam ikut ditelusuri", () => {
    // Dua cabang penelusuran yang berbeda, dan keduanya perlu kasusnya
    // sendiri: `image` sebagai string di atas, `ImageObject.url` di sini.
    // Satu kasus untuk keduanya membuat cabang yang tidak dipakainya bisa
    // dicabut tanpa satu tes pun merah.
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      publisher: { "@type": "Organization", logo: { "@type": "ImageObject", url: "/logo.png" } }
    });

    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: `<script type="application/ld+json">${jsonLd}</script>`
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("metadata menunjuk /logo.png yang tidak ada");
    expect(kode).toBe(1);
  });

  test("JSON-LD yang tidak bisa di-parse merah, bukan diabaikan", () => {
    // Crawler mengabaikannya diam-diam, jadi seluruh data terstruktur halaman
    // itu hilang tanpa satu pun jejak yang bisa dilihat penulisnya.
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala: '<script type="application/ld+json">{ "@type": }</script>'
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("blok JSON-LD tidak bisa di-parse");
    expect(kode).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Tautan mati
// ---------------------------------------------------------------------------

describe("tautan mati", () => {
  test("tautan internal ke halaman yang tidak ada merah", () => {
    const akar = situs({
      "dist/client/index.html": halaman({ badan: '<a href="/panduan/">Panduan</a>' })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("menunjuk /panduan/ yang tidak ada");
    expect(kode).toBe(1);
  });

  /**
   * Catatan kejujuran: baris `mailto:|tel:|data:|javascript:` di skripnya
   * TIDAK bisa dibuktikan dari luar. Mencabutnya tidak mengubah satu pun hasil,
   * karena `internal()` sudah menolak skema itu lebih dulu — ia penyaring
   * kedua untuk keadaan yang sudah tersaring. Kasus di bawah menjaga
   * PERILAKUNYA (surel dan telepon tidak pernah dilaporkan sebagai tautan
   * mati), bukan baris itu, dan selisihnya ditulis di sini supaya tidak ada
   * yang mengira baris itu bergerbang.
   */
  test("tautan ke halaman yang ada, ke luar situs, mailto, tel, dan anchor hijau", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        badan:
          '<a href="/panduan/">Panduan</a>' +
          '<a href="https://lain.test/apa-pun">Luar</a>' +
          '<a href="mailto:halo@contoh.test">Surel</a>' +
          '<a href="tel:+628123">Telepon</a>' +
          '<a href="#isi">Lompat</a>'
      }),
      "dist/client/panduan/index.html": halaman({
        judul: "Panduan",
        canonical: "https://contoh.test/panduan/",
        alternate: [
          ["id", "/panduan/"],
          ["x-default", "/panduan/"]
        ]
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("tautan dengan query dan fragmen diselesaikan ke berkasnya, bukan ditolak mentah", () => {
    const akar = situs({
      "dist/client/index.html": halaman({ badan: '<a href="/panduan/?tab=biaya#isi">Biaya</a>' }),
      "dist/client/panduan/index.html": halaman({
        judul: "Panduan",
        canonical: "https://contoh.test/panduan/",
        alternate: [
          ["id", "/panduan/"],
          ["x-default", "/panduan/"]
        ]
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// hreflang
// ---------------------------------------------------------------------------

describe("hreflang", () => {
  test("halaman terindeks tanpa satu pun alternate merah", () => {
    const akar = situs({ "dist/client/index.html": halaman({ alternate: [] }) });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tanpa satu pun link alternate");
    expect(kode).toBe(1);
  });

  test("alternate tanpa x-default merah", () => {
    const akar = situs({ "dist/client/index.html": halaman({ alternate: [["id", "/"]] }) });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tanpa x-default");
    expect(kode).toBe(1);
  });

  test("alternate ke halaman yang tidak diterbitkan merah", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        alternate: [
          ["id", "/"],
          ["en", "/en/"],
          ["x-default", "/"]
        ]
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("alternate en menunjuk /en/ yang tidak ada");
    expect(kode).toBe(1);
  });

  test("kelompok hreflang yang pincang merah — tiap halaman tampak benar sendirian", () => {
    // Kelas cacat yang paling sulit dilihat dengan mata: tidak ada satu pun
    // halaman yang salah, yang salah hanya HUBUNGANNYA, dan mesin pencari
    // membuang seluruh kelompok tanpa pesan.
    const akar = situs({
      "dist/client/index.html": halaman({
        alternate: [
          ["id", "/"],
          ["en", "/en/"],
          ["x-default", "/"]
        ]
      }),
      "dist/client/en/index.html": halaman({
        judul: "Home",
        canonical: "https://contoh.test/en/",
        alternate: [
          ["en", "/en/"],
          ["x-default", "/en/"]
        ]
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tidak dibalas");
    expect(kode).toBe(1);
  });

  test("alternate ke luar situs merah", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        alternate: [
          ["id", "/"],
          ["en", "https://lain.test/en/"],
          ["x-default", "/"]
        ]
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("menunjuk luar situs");
    expect(kode).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Nama key yang bocor ke layar
// ---------------------------------------------------------------------------

describe("nama key yang bocor ke layar", () => {
  const PO = 'msgid "translation.notice.label"\nmsgstr "Belum diterjemahkan"\n';

  test("key yang dirangkai saat build dan tampil sebagai teks merah", () => {
    // `tests/katalog-po.test.mjs` tidak bisa melihat ini: key-nya tidak pernah
    // ditulis literal di kode, ia dirangkai dari slug atau kategori. Di
    // keluaran ia berhenti dinamis dan menjadi teks yang bisa dilihat.
    const akar = situs({
      "src/locales/id/messages.po": PO,
      "dist/client/index.html": halaman({ badan: "<p>translation.notice.label</p>" })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("nama key tampil sebagai teks: translation.notice.label");
    expect(kode).toBe(1);
  });

  test("key yang bocor lewat alt, title, dan aria-label ikut tertangkap", () => {
    const akar = situs({
      "src/locales/id/messages.po": PO,
      "dist/client/index.html": halaman({
        badan: '<img src="/a.png" alt="translation.notice.label">'
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("nama key tampil sebagai teks");
    expect(kode).toBe(1);
  });

  test("teks bertitik yang BUKAN namespace katalog hijau", () => {
    // Presisi inilah yang membuat gerbang ini bisa dipercaya: tanpa daftar
    // namespace, setiap "contoh.test" dan "index.html" di dalam kalimat akan
    // dilaporkan, dan gerbangnya akan dimatikan dalam sepekan.
    const akar = situs({
      "src/locales/id/messages.po": PO,
      "dist/client/index.html": halaman({
        badan: "<p>contoh.test</p><p>index.html</p><p>berkas.tar.gz</p>"
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("nilai bertitik di dalam JSON-LD tidak dibaca sebagai teks layar", () => {
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "translation.notice.label"
    });

    const akar = situs({
      "src/locales/id/messages.po": PO,
      "dist/client/index.html": halaman({
        kepala: `<script type="application/ld+json">${jsonLd}</script>`
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

describe("sitemap", () => {
  const sitemap = (...loc) =>
    '<?xml version="1.0" encoding="UTF-8"?><urlset>' +
    loc.map((l) => `<url><loc>${l}</loc></url>`).join("") +
    "</urlset>";

  test("URL sitemap yang tidak ada di keluaran merah", () => {
    const akar = situs({
      "dist/client/sitemap-0.xml": sitemap("https://contoh.test/", "https://contoh.test/panduan/")
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("mendaftarkan https://contoh.test/panduan/ yang tidak ada");
    expect(kode).toBe(1);
  });

  test("sitemap yang seluruh URL-nya terbit hijau, dan jumlahnya dilaporkan", () => {
    const akar = situs({ "dist/client/sitemap-0.xml": sitemap("https://contoh.test/") });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("1 URL sitemap diperiksa");
    expect(kode).toBe(0);
  });

  test("indeks sitemap yang menunjuk sitemap lain tidak dihitung sebagai halaman", () => {
    const akar = situs({
      "dist/client/sitemap-index.xml": sitemap("https://contoh.test/sitemap-0.xml"),
      "dist/client/sitemap-0.xml": sitemap("https://contoh.test/")
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("1 URL sitemap diperiksa di 2 berkas");
    expect(kode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Feed Atom (ADR-0035)
//
// Keluarga ini menanggung beban yang tidak dimiliki keluarga lain di berkas
// ini: template menyatakan nol seksi berita, jadi `bun run build` di repo ini
// tidak akan pernah menghasilkan berkas feed — bahkan seandainya ia punya
// sumber konten. Fixture di bawah adalah SATU-SATUNYA tempat gerbang feed
// benar-benar menemukan berkas untuk diperiksa.
// ---------------------------------------------------------------------------

describe("feed Atom", () => {
  const ENTRY = [
    "  <entry>",
    "    <title>Artikel pertama</title>",
    "    <id>https://contoh.test/berita/pertama/</id>",
    '    <link rel="alternate" type="text/html" href="https://contoh.test/berita/pertama/"/>',
    "    <published>2026-08-01T03:00:00.000Z</published>",
    "    <updated>2026-08-03T09:00:00.000Z</updated>",
    '    <summary type="text">Ringkasan artikel pertama.</summary>',
    "  </entry>"
  ].join("\n");

  /** Feed sah; tiap kasus merah merusak tepat satu hal darinya. */
  const feed = ({
    self = '<link rel="self" type="application/atom+xml" href="https://contoh.test/berita/feed.xml"/>',
    id = "<id>https://contoh.test/berita/</id>",
    judul = "<title>Berita — Situs Contoh</title>",
    updated = "<updated>2026-08-03T09:00:00.000Z</updated>",
    entry = ENTRY
  } = {}) =>
    [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="id-ID">',
      `  ${judul}`,
      `  ${id}`,
      `  ${self}`,
      `  ${updated}`,
      "  <author><name>Situs Contoh</name></author>",
      entry,
      "</feed>"
    ]
      .filter((baris) => baris.trim() !== "")
      .join("\n");

  /** Halaman seksi + artikelnya + feed-nya: pohon terkecil yang HIJAU. */
  const situsBerita = (tambahan = {}) =>
    situs({
      "dist/client/berita/index.html": halaman({
        judul: "Berita",
        canonical: "https://contoh.test/berita/",
        alternate: [
          ["id", "/berita/"],
          ["x-default", "/berita/"]
        ],
        kepala:
          '<link rel="alternate" type="application/atom+xml" title="Berita — Situs Contoh" href="/berita/feed.xml">'
      }),
      "dist/client/berita/pertama/index.html": halaman({
        judul: "Artikel pertama",
        canonical: "https://contoh.test/berita/pertama/",
        alternate: [
          ["id", "/berita/pertama/"],
          ["x-default", "/berita/pertama/"]
        ]
      }),
      "dist/client/berita/feed.xml": feed(),
      ...tambahan
    });

  test("feed yang sah, diumumkan, dan menunjuk artikel yang terbit hijau", () => {
    const { kode, keluaran } = jalankan(situsBerita());

    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("1 feed diperiksa, 1 entry, 1 tautan penemuan-otomatis");
    expect(kode).toBe(0);
  });

  test("entry yang menunjuk artikel yang TIDAK terbit merah", () => {
    // Kelas cacat yang menjadi alasan seluruh keluarga ini ada: sebuah artikel
    // yang dicabut redaksi hilang dari indeks seksi dan dari sitemap, dan tanpa
    // gerbang ini ia tetap tinggal di feed menunjuk 404.
    const akar = situsBerita({
      "dist/client/berita/feed.xml": feed({
        entry: ENTRY.replace(/pertama\//g, "dicabut/")
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("yang tidak ada di keluaran");
    expect(kode).toBe(1);
  });

  test("href relatif merah", () => {
    const akar = situsBerita({
      "dist/client/berita/feed.xml": feed({
        entry: ENTRY.replace('href="https://contoh.test/berita/pertama/"', 'href="/berita/pertama/"')
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("href tidak absolut");
    expect(kode).toBe(1);
  });

  test("id yang bukan IRI absolut merah", () => {
    const akar = situsBerita({
      "dist/client/berita/feed.xml": feed({ id: "<id>/berita/</id>" })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("<id> bukan IRI absolut");
    expect(kode).toBe(1);
  });

  test("link self yang menunjuk alamat lain merah", () => {
    const akar = situsBerita({
      "dist/client/berita/feed.xml": feed({
        self: '<link rel="self" type="application/atom+xml" href="https://contoh.test/feed.xml"/>'
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain('<link rel="self"> berbunyi https://contoh.test/feed.xml');
    expect(kode).toBe(1);
  });

  test("feed tanpa elemen yang Atom wajibkan merah", () => {
    const akar = situsBerita({
      "dist/client/berita/feed.xml": feed({ judul: "", self: "" })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("feed tanpa <title>");
    expect(keluaran).toContain('feed tanpa <link rel="self">');
    expect(kode).toBe(1);
  });

  test("feed tanpa satu pun entry merah", () => {
    const akar = situsBerita({
      "dist/client/berita/feed.xml": feed({ entry: "" })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("feed tanpa satu pun <entry>");
    expect(kode).toBe(1);
  });

  test("tanggal yang bukan RFC 3339 merah meski new Date() menerimanya", () => {
    // `2026-08-03` di-parse JavaScript tanpa keluhan dan menghasilkan tanggal
    // yang benar. Ia tetap melanggar Atom, dan sebagian pembaca feed membuang
    // entry-nya diam-diam.
    const akar = situsBerita({
      "dist/client/berita/feed.xml": feed({
        entry: ENTRY.replace(
          "<published>2026-08-01T03:00:00.000Z</published>",
          "<published>2026-08-01</published>"
        )
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("<published> bukan RFC 3339");
    expect(kode).toBe(1);
  });

  test("entry yang updated-nya mendahului published merah", () => {
    const akar = situsBerita({
      "dist/client/berita/feed.xml": feed({
        updated: "<updated>2026-07-01T00:00:00.000Z</updated>",
        entry: ENTRY.replace(
          "<updated>2026-08-03T09:00:00.000Z</updated>",
          "<updated>2026-07-01T00:00:00.000Z</updated>"
        )
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("<updated> mendahului <published>");
    expect(kode).toBe(1);
  });

  test("entry yang tidak terurut dari yang terbaru merah", () => {
    const kedua = ENTRY.replace(/pertama/g, "kedua")
      .replace("2026-08-01T03:00:00.000Z", "2026-08-05T03:00:00.000Z")
      .replace("2026-08-03T09:00:00.000Z", "2026-08-06T09:00:00.000Z");

    const akar = situsBerita({
      "dist/client/berita/kedua/index.html": halaman({
        judul: "Artikel kedua",
        canonical: "https://contoh.test/berita/kedua/",
        alternate: [
          ["id", "/berita/kedua/"],
          ["x-default", "/berita/kedua/"]
        ]
      }),
      "dist/client/berita/feed.xml": feed({
        updated: "<updated>2026-08-06T09:00:00.000Z</updated>",
        entry: `${ENTRY}\n${kedua}`
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("entry tidak terurut dari yang terbaru");
    expect(kode).toBe(1);
  });

  test("updated feed yang bukan entry terbaru — mis. jam build — merah", () => {
    const akar = situsBerita({
      "dist/client/berita/feed.xml": feed({
        updated: "<updated>2026-08-08T12:00:00.000Z</updated>"
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("bukan <updated> entry terbaru");
    expect(kode).toBe(1);
  });

  test("nama key yang bocor ke judul entry merah", () => {
    const akar = situsBerita({
      "src/locales/id/messages.po": 'msgid "tab.berita.title"\nmsgstr "Berita"\n',
      "dist/client/berita/feed.xml": feed({
        entry: ENTRY.replace(
          "<title>Artikel pertama</title>",
          "<title>tab.berita.title</title>"
        )
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("nama key tampil sebagai teks: tab.berita.title");
    expect(kode).toBe(1);
  });

  test("feed yang tidak diumumkan satu halaman pun merah", () => {
    const akar = situsBerita({
      "dist/client/berita/index.html": halaman({
        judul: "Berita",
        canonical: "https://contoh.test/berita/",
        alternate: [
          ["id", "/berita/"],
          ["x-default", "/berita/"]
        ]
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("tidak diumumkan satu halaman pun");
    expect(kode).toBe(1);
  });

  test("tautan feed tanpa title merah", () => {
    const akar = situsBerita({
      "dist/client/berita/index.html": halaman({
        judul: "Berita",
        canonical: "https://contoh.test/berita/",
        alternate: [
          ["id", "/berita/"],
          ["x-default", "/berita/"]
        ],
        kepala:
          '<link rel="alternate" type="application/atom+xml" href="/berita/feed.xml">'
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("tanpa title");
    expect(kode).toBe(1);
  });

  test("halaman yang mengumumkan feed yang bukan feed merah", () => {
    // Gerbang tautan mati tidak bisa melihat ini: berkasnya ADA, ia hanya bukan
    // feed. Sebuah halaman HTML yang diumumkan sebagai langganan.
    const akar = situs({
      "dist/client/index.html": halaman({
        kepala:
          '<link rel="alternate" type="application/atom+xml" title="Berita" href="/berita/">'
      }),
      "dist/client/berita/index.html": halaman({
        judul: "Berita",
        canonical: "https://contoh.test/berita/",
        alternate: [
          ["id", "/berita/"],
          ["x-default", "/berita/"]
        ]
      })
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("yang bukan feed Atom di keluaran");
    expect(kode).toBe(1);
  });

  test("berkas .xml yang bukan sitemap dan bukan feed merah", () => {
    // Ini temuan ADR-0033 apa adanya: berkas .xml bernama lain tidak dibaca
    // gerbang mana pun. Gerbang yang hanya mencari `feed.xml` akan mengulangi
    // celah itu pada nama berikutnya.
    const akar = situs({
      "dist/client/opensearch.xml": '<?xml version="1.0"?><OpenSearchDescription/>'
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("tidak ada gerbang");
    expect(kode).toBe(1);
  });

  test("feed yang terdaftar di sitemap merah", () => {
    const akar = situsBerita({
      "dist/client/sitemap-0.xml":
        '<?xml version="1.0" encoding="UTF-8"?><urlset>' +
        "<url><loc>https://contoh.test/berita/feed.xml</loc></url>" +
        "</urlset>"
    });

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("terdaftar di sitemap");
    expect(kode).toBe(1);
  });

  test("tanpa berkas .xml sama sekali, keluarga ini MENYEBUT bahwa ia dilewati", () => {
    // Keadaan template ini sendiri. Gerbang yang diam saat tidak menemukan apa
    // pun tidak bisa dibedakan dari gerbang yang lulus.
    const { kode, keluaran } = jalankan(situs());

    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("tidak ada berkas .xml selain sitemap");
    expect(kode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Performa — celah 2 (ADR-0028): fetchpriority pada gambar eager
// ---------------------------------------------------------------------------

describe("performa: prioritas gambar eager", () => {
  test("gambar eager tanpa fetchpriority merah", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        badan: '<img src="/seni/hero.png" loading="eager" alt="Hero">'
      }),
      "dist/client/seni/hero.png": png(1600, 900)
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain('gambar eager tanpa fetchpriority="high"');
    expect(kode).toBe(1);
  });

  test("gambar eager BER-fetchpriority hijau", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        badan: '<img src="/seni/hero.png" loading="eager" fetchpriority="high" alt="Hero">'
      }),
      "dist/client/seni/hero.png": png(1600, 900)
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("performa: 1 gambar eager diperiksa prioritasnya");
    expect(kode).toBe(0);
  });

  test("gambar lazy tidak dituntut fetchpriority", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        badan: '<img src="/seni/isi.png" loading="lazy" alt="Isi">'
      }),
      "dist/client/seni/isi.png": png(1600, 900)
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("performa: 0 gambar eager diperiksa prioritasnya");
    expect(kode).toBe(0);
  });

  test("gambar eager di halaman yang TIDAK lewat komponen ikut tertangkap", () => {
    // Alasan gerbang ini membaca keluaran alih-alih `Ilustrasi.astro`: sebuah
    // situs turunan boleh menulis <img> sendiri, dan pemeriksa yang hanya
    // membaca komponen akan hijau untuk halaman yang tidak pernah lewat sana.
    const akar = situs({
      "dist/client/lepas/index.html": halaman({
        judul: "Lepas",
        canonical: "https://contoh.test/lepas/",
        alternate: [
          ["id", "/lepas/"],
          ["x-default", "/lepas/"]
        ],
        badan: '<img src="/seni/lepas.png" loading="eager" alt="Lepas">'
      }),
      "dist/client/seni/lepas.png": png(1600, 900)
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain('gambar eager tanpa fetchpriority="high"');
    expect(kode).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Performa — celah 3 (ADR-0028): anggaran berat gambar per halaman
// ---------------------------------------------------------------------------

describe("performa: anggaran gambar per halaman", () => {
  test("beranda di atas 250 KB merah, dan disebut sebagai beranda", () => {
    const akar = situs({
      "dist/client/index.html": halaman({ badan: '<img src="/seni/besar.png" alt="Besar">' }),
      "dist/client/seni/besar.png": berat(300)
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("melampaui anggaran 250 KB (beranda)");
    expect(kode).toBe(1);
  });

  test("beranda di bawah 250 KB hijau", () => {
    const akar = situs({
      "dist/client/index.html": halaman({ badan: '<img src="/seni/pas.png" alt="Pas">' }),
      "dist/client/seni/pas.png": berat(200)
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("halaman terberat");
    expect(kode).toBe(0);
  });

  test("halaman konten memakai anggaran 100 KB, bukan anggaran beranda", () => {
    // Sebuah versi yang memakai satu anggaran untuk semua halaman LULUS kedua
    // kasus beranda di atas. Kasus inilah yang memisahkan keduanya.
    const akar = situs({
      "dist/client/panduan/index.html": halaman({
        judul: "Panduan",
        canonical: "https://contoh.test/panduan/",
        alternate: [
          ["id", "/panduan/"],
          ["x-default", "/panduan/"]
        ],
        badan: '<img src="/seni/sedang.png" alt="Sedang">'
      }),
      "dist/client/seni/sedang.png": berat(150)
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("melampaui anggaran 100 KB (halaman konten)");
    expect(kode).toBe(1);
  });

  test("beranda locale berprefiks tetap dihitung sebagai beranda", () => {
    const akar = situs({
      "dist/client/index.html": halaman({
        alternate: [
          ["id", "/"],
          ["en", "/en/"],
          ["x-default", "/"]
        ]
      }),
      "dist/client/en/index.html": halaman({
        judul: "Home",
        canonical: "https://contoh.test/en/",
        alternate: [
          ["id", "/"],
          ["en", "/en/"],
          ["x-default", "/"]
        ],
        badan: '<img src="/seni/en.png" alt="Hero">'
      }),
      "dist/client/seni/en.png": berat(200)
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("berkas yang sama dipakai dua kali tetap satu unduhan", () => {
    // Tanpa dedup, 2 × 60 KB terbaca 120 KB dan halaman ini merah palsu.
    const akar = situs({
      "dist/client/panduan/index.html": halaman({
        judul: "Panduan",
        canonical: "https://contoh.test/panduan/",
        alternate: [
          ["id", "/panduan/"],
          ["x-default", "/panduan/"]
        ],
        badan: '<img src="/seni/sama.png" alt="Satu"><img src="/seni/sama.png" alt="Dua">'
      }),
      "dist/client/seni/sama.png": berat(60)
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });

  test("media di host lain tidak ditimbang, dan gerbang mengatakannya", () => {
    // Batas yang disengaja: media `awcms` tidak pernah ada di `dist/client`,
    // jadi anggaran ini menjaga seni lokal dan bukan seluruh berat halaman.
    const akar = situs({
      "dist/client/index.html": halaman({
        badan: '<img src="https://media.contoh.test/besar.png" alt="Media">'
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("tidak ada gambar terbitan yang bisa ditimbang");
    expect(kode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Keluarga sumber gambar — jalan tanpa build, dan di template ia menimbang nol
// ---------------------------------------------------------------------------

describe("sumber gambar", () => {
  test("ekstensi yang berbohong tentang isinya merah", () => {
    const akar = pohon({ ...SUMBER, "src/assets/seni.png": jpeg(1600, 900) });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("ekstensinya .png tetapi isinya jpeg");
    expect(kode).toBe(1);
  });

  test("rasio yang bukan --ratio-visual merah di src/assets", () => {
    const akar = pohon({ ...SUMBER, "src/assets/seni.png": png(1000, 1000) });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("bukan 16∶9");
    expect(kode).toBe(1);
  });

  test("rasio yang benar hijau", () => {
    const akar = pohon({ ...SUMBER, "src/assets/seni.png": png(1600, 900) });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("rasio diperiksa");
    expect(kode).toBe(0);
  });

  test("berkas di public/ TIDAK dituntut rasio — favicon dan kartu share punya ukurannya sendiri", () => {
    const akar = pohon({ ...SUMBER, "public/favicon.png": png(512, 512) });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(keluaran).toContain("rasio TIDAK diperiksa");
    expect(kode).toBe(0);
  });

  test("format yang dikenali tetapi dimensinya belum terbaca MERAH, bukan lolos", () => {
    // Gerbang yang melewati format yang tidak dikenalnya bisa dilewati dengan
    // mengganti format — dan rasionya berhenti diperiksa siapa pun tanpa jejak.
    const akar = pohon({ ...SUMBER, "src/assets/seni.avif": avif() });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("rasionya tidak terperiksa");
    expect(kode).toBe(1);
  });

  test("berkas yang isinya bukan gambar sama sekali merah", () => {
    const akar = pohon({ ...SUMBER, "src/assets/seni.png": "ini bukan gambar" });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("bukan format gambar yang dikenali");
    expect(kode).toBe(1);
  });

  test('SVG dengan "&" telanjang merah — browser gagal merendernya tanpa pesan apa pun', () => {
    const akar = pohon({
      ...SUMBER,
      "src/assets/seni.svg": svg({ isi: "<title>Rambu & Marka</title>" })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain('"&" telanjang');
    expect(kode).toBe(1);
  });

  test("SVG tanpa viewBox merah — rasionya tidak bisa dinyatakan maupun diperiksa", () => {
    const akar = pohon({ ...SUMBER, "src/assets/seni.svg": svg({ viewBox: null }) });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tanpa viewBox");
    expect(kode).toBe(1);
  });

  test("SVG dengan <text> tanpa font-size merah, dan teks terlalu kecil juga", () => {
    const tanpaUkuran = pohon({
      ...SUMBER,
      "src/assets/a.svg": svg({ isi: "<text>Label</text>" })
    });
    expect(jalankan(tanpaUkuran).keluaran).toContain("tanpa satu pun font-size eksplisit");

    const terlaluKecil = pohon({
      ...SUMBER,
      "src/assets/b.svg": svg({ isi: '<text font-size="12">Label</text>' })
    });
    const { kode, keluaran } = jalankan(terlaluKecil);
    expect(keluaran).toContain("di bawah ambang");
    expect(kode).toBe(1);
  });

  test("SVG yang sah, berasio benar, dan teksnya terbaca hijau", () => {
    const akar = pohon({
      ...SUMBER,
      "src/assets/seni.svg": svg({
        isi: "<title>Rambu &amp; Marka</title><text font-size=\"48\">Label</text>"
      })
    });

    const { kode, keluaran } = jalankan(akar);
    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Repo ini sendiri
// ---------------------------------------------------------------------------

test("repo ini sendiri lolos", () => {
  const hasil = Bun.spawnSync(["bun", SKRIP], { cwd: resolve(".") });
  const keluaran = hasil.stdout.toString() + hasil.stderr.toString();

  if (hasil.exitCode !== 0) console.log(keluaran);
  expect(hasil.exitCode).toBe(0);
});
