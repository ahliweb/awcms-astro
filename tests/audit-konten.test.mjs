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
