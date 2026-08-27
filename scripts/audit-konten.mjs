#!/usr/bin/env bun
/**
 * Gerbang audit konten — memeriksa apa yang benar-benar TERBIT, bukan apa yang
 * tertulis di `src/`.
 *
 * ## Kenapa berkas ini ada
 *
 * README repo ini mendaftarkan gerbang audit sebagai butir backlog pertama, dan
 * menyebutnya sebagai "yang membuat standar ini punya gigi". Alasannya bukan
 * kelengkapan: setiap kelas cacat di bawah **tidak menggagalkan apa pun** saat
 * terjadi. `astro check` bersih, `bun test` hijau, build sukses, situs terbit —
 * dan pembaca mendapat halaman dengan judul kosong, tautan yang mati, pratinjau
 * sosial yang menunjuk 404, atau nama key mentah sebagai teks.
 *
 * Yang berikut ini benar-benar pernah terjadi di template ini, semuanya dengan
 * build hijau: `og:image` menunjuk `/social/<slug>.png` yang tidak pernah
 * dibangkitkan siapa pun, dan `translation.notice.label` beserta
 * `biaya.jenis.pnbp` tampil sebagai teks yang dibaca pembaca di kedua bahasa.
 *
 * ## Yang diperiksa, dan atas apa
 *
 * Dua keluarga, dengan sumber yang berbeda:
 *
 *   1. **Keluaran build** (`dist/client/**`) — metadata SEO, resiprositas
 *      hreflang, aset yang dijanjikan metadata, tautan mati, sitemap, feed Atom
 *      beserta penemuan-otomatisnya, dan nama key yang bocor ke layar. Butuh
 *      hasil build; tanpa itu keluarga ini DILEWATI dan mengatakannya.
 *   2. **Sumber gambar** (`src/assets/**`, `public/**`) — rasio, format dibaca
 *      dari isi berkas alih-alih ekstensinya, XML SVG, dan ukuran teks
 *      terkecil di dalam SVG. Tidak butuh build, jadi selalu jalan.
 *
 * ## Yang TIDAK bisa diperiksa berkas ini, dan disebut supaya tidak dikira
 * ## terjaga
 *
 * Dua aturan gambar di `AGENTS.md` — teks di dalam gambar hanya label topik,
 * dan tanpa lambang instansi negara — **tidak bisa diperiksa mesin**. Keduanya
 * tetap manual. Aturan yang tampak terjaga padahal tidak lebih berbahaya
 * daripada aturan yang jelas-jelas manual.
 *
 * HTML di sini dibaca dengan ekspresi reguler, bukan parser DOM. Itu keputusan
 * sadar: keluarannya dibangkitkan Astro dan bentuknya stabil, sementara sebuah
 * parser menambah dependency pada gerbang yang justru harus bisa dipercaya
 * tanpa syarat. Konsekuensinya, pemeriksaan di bawah ditulis untuk menerima
 * bentuk yang wajar dan MELAPOR saat ia tidak yakin — tidak ada satu pun yang
 * diam-diam melewati sesuatu yang tidak dikenalinya.
 *
 * Jalankan: `bun run audit:konten` (setelah `bun run build` agar keluarga
 * pertama ikut jalan).
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { posix } from "node:path";
import { createReporter } from "./lib/reporter.mjs";

const KELUARAN = "dist/client";

/**
 * Unlike its two siblings this gate takes no root argument — every caller
 * (`package.json`, `ci.yml`, the `Dockerfile` under an explicit WORKDIR) runs
 * it from the repo root, and routing ~15 literal paths through a join in a
 * 1300-line gate buys diagnostics rather than correctness.
 *
 * What it DID need is this guard. Run from anywhere else the first read threw
 * ENOENT and the gate exited **1** — the very code it reserves for "N
 * violations" — so "cannot run here" and "your content is broken" were
 * indistinguishable to any caller reading the exit code. Exit 2 is what the
 * siblings already use for an unusable root.
 */
if (!existsSync("src/config/site.ts")) {
  console.error(
    "src/config/site.ts tidak ada — audit konten harus dijalankan dari akar repo"
  );
  process.exit(2);
}

const pelapor = createReporter("audit konten");

/**
 * @param {string} gerbang
 * @param {string} berkas
 * @param {string} pesan
 */
function langgar(gerbang, berkas, pesan) {
  pelapor.violation(gerbang, berkas, pesan);
}

/** @param {string} baris */
function catat(baris) {
  pelapor.note(baris);
}

// ---------------------------------------------------------------------------
// Pembacaan berkas sumber yang dipakai beberapa gerbang
// ---------------------------------------------------------------------------

/** Locale default, dibaca dari konfigurasi alih-alih ditebak. */
function bacaLocaleDefault() {
  const isi = readFileSync("src/config/site.ts", "utf8");
  return isi.match(/export const defaultLocale\s*=\s*["']([^"']+)["']/)?.[1] ?? "id";
}

/**
 * Daftar locale berprefiks, dibaca dari `localeMeta` di konfigurasi.
 *
 * Dipakai untuk memisahkan halaman per locale saat memeriksa judul kembar:
 * `/panduan/` dan `/en/panduan/` BOLEH berjudul sama — artikel yang belum
 * diterjemahkan memang tampil dalam bahasa sumbernya. Dua halaman berbeda di
 * locale yang SAMA tidak boleh.
 */
function bacaLocale() {
  const isi = readFileSync("src/config/site.ts", "utf8");
  const blok = isi.match(/localeMeta\s*=\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  return [...blok.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]);
}

/**
 * Namespace key katalog PO — segmen pertama setiap `msgid`.
 *
 * Inilah yang membuat pemeriksaan "nama key bocor ke layar" presisi alih-alih
 * menebak. Tanpa daftar ini, sebuah teks `example.com` atau `index.html` di
 * dalam kalimat akan terbaca sebagai key; dengan daftar ini, hanya teks yang
 * benar-benar berbentuk key dari namespace yang dipakai situs ini yang ditandai.
 */
function bacaNamespaceKey(localeDefault) {
  const jalur = `src/locales/${localeDefault}/messages.po`;
  if (!existsSync(jalur)) return new Set();

  const namespaces = new Set();
  for (const [, key] of readFileSync(jalur, "utf8").matchAll(/^msgid\s+"([^"]+)"/gm)) {
    const segmen = key.split(".");
    if (segmen.length > 1) namespaces.add(segmen[0]);
  }
  return namespaces;
}

/** `--ratio-visual` dari `global.css`, sebagai angka. */
function bacaRasioVisual() {
  const isi = readFileSync("src/styles/global.css", "utf8");
  const cocok = isi.match(/--ratio-visual:\s*([\d.]+)\s*\/\s*([\d.]+)/);

  if (!cocok) {
    throw new Error(
      "--ratio-visual tidak ditemukan di src/styles/global.css. Gerbang rasio " +
        "gambar membaca nilainya dari sana, bukan dari angka yang ditulis ulang " +
        "di skrip ini — dua sumber untuk satu rasio adalah cara termudah " +
        "membuat keduanya berbeda tanpa ada yang menyadarinya."
    );
  }

  return { teks: `${cocok[1]}∶${cocok[2]}`, nilai: Number(cocok[1]) / Number(cocok[2]) };
}

// ---------------------------------------------------------------------------
// Keluarga 1 — keluaran build
// ---------------------------------------------------------------------------

/** Semua halaman HTML hasil build. */
function bacaHalaman() {
  return [...new Bun.Glob("**/*.html").scanSync(KELUARAN)].map((nama) => ({
    nama,
    isi: readFileSync(`${KELUARAN}/${nama}`, "utf8")
  }));
}

/**
 * URL yang dilayani sebuah berkas hasil build.
 *
 * `build.format: 'directory'`, jadi `panduan/index.html` dilayani `/panduan/`.
 * `404.html` adalah kekecualian yang dilayani host apa adanya.
 */
function urlDari(nama) {
  if (nama === "404.html") return "/404.html";
  return `/${nama.replace(/index\.html$/, "")}`;
}

/**
 * Menyelesaikan sebuah path situs menjadi berkas di `dist/client`.
 *
 * Mengembalikan `undefined` bila tidak ada berkas yang akan dilayani. Tiga
 * bentuk diterima karena ketiganya benar-benar dipakai: direktori berakhiran
 * `/`, berkas dengan ekstensi, dan path tanpa keduanya.
 *
 * @param {string} path
 * @returns {string | undefined}
 */
function berkasUntuk(path) {
  const bersih = posix.normalize(decodeURI(path.split("#")[0].split("?")[0]));
  if (!bersih.startsWith("/")) return undefined;

  const kandidat = bersih.endsWith("/")
    ? [`${bersih}index.html`]
    : [bersih, `${bersih}.html`, `${bersih}/index.html`];

  return kandidat
    .map((k) => `${KELUARAN}${k}`)
    .find((jalur) => existsSync(jalur) && !jalur.endsWith("/"));
}

/** Setiap atribut `href`/`src` pada sebuah halaman, apa adanya. */
function tautanDi(isi) {
  return [...isi.matchAll(/\s(?:href|src)=["']([^"']*)["']/gi)].map((m) => m[1]);
}

/** Isi setiap blok JSON-LD, sudah di-parse; blok yang tidak valid dilaporkan. */
function jsonLdDi(nama, isi) {
  const hasil = [];

  for (const [, mentah] of isi.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      hasil.push(JSON.parse(mentah));
    } catch (error) {
      // JSON-LD yang rusak tidak menggagalkan apa pun: crawler mengabaikannya
      // diam-diam, dan seluruh data terstruktur halaman itu hilang tanpa jejak.
      langgar("json-ld", nama, `blok JSON-LD tidak bisa di-parse: ${error.message}`);
    }
  }

  return hasil;
}

/**
 * Setiap simpul `Article`/`NewsArticle` di dalam struktur JSON-LD, sedalam apa
 * pun.
 *
 * Sedalam apa pun, karena halaman ini membungkus skemanya dalam `@graph` dan
 * sebuah pemindai yang hanya melihat akar akan melewatkan seluruhnya —
 * melaporkan nol pelanggaran atas nol simpul yang diperiksa, yang terbaca
 * persis seperti lulus.
 */
function artikelDiJsonLd(simpul, keluaran = []) {
  if (Array.isArray(simpul)) {
    for (const anak of simpul) artikelDiJsonLd(anak, keluaran);
    return keluaran;
  }

  if (!simpul || typeof simpul !== "object") return keluaran;

  if (simpul["@type"] === "Article" || simpul["@type"] === "NewsArticle") {
    keluaran.push(simpul);
  }

  for (const nilai of Object.values(simpul)) artikelDiJsonLd(nilai, keluaran);

  return keluaran;
}

/** Setiap nilai `image`/`url` di dalam struktur JSON-LD, sedalam apa pun. */
function gambarDiJsonLd(simpul, keluaran = []) {
  if (Array.isArray(simpul)) {
    for (const anak of simpul) gambarDiJsonLd(anak, keluaran);
    return keluaran;
  }

  if (!simpul || typeof simpul !== "object") return keluaran;

  for (const [kunci, nilai] of Object.entries(simpul)) {
    if (kunci === "image" && typeof nilai === "string") keluaran.push(nilai);
    if (simpul["@type"] === "ImageObject" && kunci === "url" && typeof nilai === "string") {
      keluaran.push(nilai);
    }
    gambarDiJsonLd(nilai, keluaran);
  }

  return keluaran;
}

/**
 * Teks yang benar-benar dibaca pembaca — tanpa markup, tanpa skrip, tanpa gaya.
 *
 * Blok JSON-LD sengaja dibuang lebih dulu: isinya penuh nilai bertitik yang
 * bukan teks layar sama sekali, dan membiarkannya masuk akan membuat gerbang
 * nama key menemukan "pelanggaran" di setiap halaman.
 *
 * ## Bentuk tag penutup yang diterima, dan kenapa namanya diberi `\b`
 *
 * HTML tidak hanya menerima `</script>`. Sebuah tag penutup boleh membawa
 * apa pun setelah nama tag-nya — `</script >`, `</script foo=bar>`, bahkan
 * `</script\t\n bar>` — dan browser menutup blok skrip di ketiganya. Karena itu
 * penutupnya ditulis `<\/script(?:\s[^>]*)?>`: nama tag, lalu SATU spasi-putih
 * yang menjadi syarat, lalu sisa apa pun sampai `>`.
 *
 * Spasi-putih itu syarat dan bukan hiasan. `<\/script[^>]*>` — bentuk yang
 * lebih longgar dan menggoda — akan menerima `</scripture>` sebagai penutup
 * skrip, padahal HTML tidak. Yang ditulis di atas menolaknya, dan itu diuji.
 *
 * Regex yang menuntut `</script>` persis TIDAK berhenti di sana, dan
 * akibatnya BERBEDA tergantung apa yang ada di bawahnya. Keduanya diukur, bukan
 * dikira-kira (`tests/audit-konten.test.mjs`):
 *
 *   - **Ada skrip kedua.** Pencarian lanjut sampai `</script>` MILIK SKRIP ITU,
 *     dan seluruh isi di antaranya ikut terbuang sebagai "skrip". Sebuah
 *     halaman dengan judul dan paragraf di antara dua skrip menyusut menjadi
 *     satu baris.
 *   - **Tidak ada skrip kedua.** Regex tidak cocok sama sekali, lalu
 *     `<[^>]*>` di bawah hanya membuang tag-nya — sehingga SOURCE JAVASCRIPT-nya
 *     masuk sebagai teks layar.
 *
 * Arah kegagalan keduanya sama dan itulah yang mahal: tidak ada error. Yang ada
 * hanyalah `teksLayar` yang salah, sehingga enam pemeriksaan yang membacanya
 * memeriksa sesuatu yang bukan halamannya.
 *
 * `\b` menutup sisi yang sama diamnya. Tanpa itu `<scripture>` terbaca sebagai
 * pembuka `<script`, dan penutup yang dicarinya adalah `</script>` nyata jauh di
 * bawah — pada fixture uji, seluruh teks halaman lenyap menjadi larik kosong.
 *
 * Ditemukan oleh CodeQL (`js/bad-tag-filter`), yang berjalan pada setiap PR —
 * jadi kelas ini sudah punya pemeriksanya dan tidak perlu gerbang kedua.
 */
function teksLayar(isi) {
  return isi
    .replace(/<script\b[\s\S]*?<\/script(?:\s[^>]*)?>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style(?:\s[^>]*)?>/gi, " ")
    .replace(/<[^>]*>/g, "\n")
    .split("\n")
    .map((baris) => baris.trim())
    .filter(Boolean);
}

function auditKeluaran(halaman, { localeDefault, locales, namespaceKey }) {
  const asal = halaman
    .map(({ isi }) => isi.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1])
    .filter(Boolean)
    .map((url) => {
      try {
        return new URL(url).origin;
      } catch {
        return undefined;
      }
    })
    .find(Boolean);

  if (!asal) {
    langgar(
      "seo",
      KELUARAN,
      "tidak ada satu pun canonical absolut di seluruh keluaran — " +
        "tanpa itu gerbang ini tidak bisa membedakan tautan internal dari eksternal"
    );
    return;
  }

  catat(`origin situs terbaca dari canonical: ${asal}`);

  /** `true` bila URL menunjuk situs ini sendiri. */
  const internal = (url) =>
    url.startsWith("/") ? !url.startsWith("//") : url.startsWith(`${asal}/`) || url === asal;

  /** Bentuk path dari URL internal apa pun. */
  const pathDari = (url) => (url.startsWith("/") ? url : new URL(url).pathname);

  const judulPerLocale = new Map();
  const alternatePerUrl = new Map();
  /** Path feed → halaman yang mengumumkannya. */
  const feedDideklarasikan = new Map();

  for (const { nama, isi } of halaman) {
    const url = urlDari(nama);
    const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(isi);

    // -- metadata SEO --------------------------------------------------------
    const judul = isi.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    if (!judul) {
      langgar("seo", nama, "tanpa <title> atau judulnya kosong");
    }

    const deskripsi = isi
      .match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
      ?.trim();
    if (!deskripsi) {
      // Deskripsi kosong tidak merusak halaman; ia merusak setiap tempat
      // halaman itu muncul di luar dirinya sendiri — hasil pencarian dan
      // pratinjau tautan, yang keduanya tidak pernah dilihat penulisnya.
      langgar("seo", nama, "tanpa meta description atau isinya kosong");
    }

    const canonical = isi.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
    )?.[1];

    if (!canonical && !noindex) {
      langgar("seo", nama, "tanpa canonical, dan tidak dinyatakan noindex");
    }

    if (canonical && noindex) {
      langgar("seo", nama, "noindex tetapi memasang canonical — dua sinyal yang bertabrakan");
    }

    if (judul) {
      const locale =
        locales.find((kode) => kode !== localeDefault && url.startsWith(`/${kode}/`)) ??
        localeDefault;
      const dipakai = judulPerLocale.get(locale) ?? new Map();
      const sebelumnya = dipakai.get(judul);

      if (sebelumnya) {
        // Judul kembar di dalam SATU locale berarti dua halaman berbeda
        // bersaing untuk kata kunci yang sama, dan mesin pencari memilih salah
        // satunya sendiri. Antar locale itu justru wajar — artikel yang belum
        // diterjemahkan tampil dalam bahasa sumbernya.
        langgar("seo", nama, `judul kembar dengan ${sebelumnya} di locale "${locale}": ${judul}`);
      } else {
        dipakai.set(judul, nama);
        judulPerLocale.set(locale, dipakai);
      }
    }

    // -- klaim artikel di JSON-LD --------------------------------------------
    //
    // Setiap nilai di sini dibaca MESIN dan tidak pernah manusia, jadi tidak
    // satu pun dari cacatnya terlihat di halaman: sebuah `datePublished` yang
    // sebenarnya tanggal ubah tampak persis seperti yang benar. Sebelum
    // ADR-0033 kedua tanggal memang dipasang dari SATU nilai — tidak ada satu
    // halaman pun yang bisa melaporkan koreksi — dan tidak ada gerbang di sini
    // yang pernah membaca `Article`, jadi keadaan itu bisa kembali diam-diam.
    for (const artikel of jsonLdDi(nama, isi).flatMap((blok) => artikelDiJsonLd(blok))) {
      const jenis = artikel["@type"];

      const stempel = {};

      for (const kunci of ["datePublished", "dateModified"]) {
        const nilai = artikel[kunci];

        if (typeof nilai !== "string" || nilai.trim() === "") {
          langgar("json-ld", nama, `${jenis} tanpa ${kunci}`);
          continue;
        }

        if (Number.isNaN(Date.parse(nilai))) {
          langgar("json-ld", nama, `${jenis} ber-${kunci} yang bukan tanggal: ${nilai}`);
          continue;
        }

        stempel[kunci] = Date.parse(nilai);
      }

      // Urutan yang terbalik bukan sekadar aneh: crawler membuang blok yang
      // menyatakan sebuah artikel diubah SEBELUM ia terbit, sehingga seluruh
      // data terstruktur halaman itu hilang tanpa jejak di mana pun.
      if (
        stempel.datePublished !== undefined &&
        stempel.dateModified !== undefined &&
        stempel.dateModified < stempel.datePublished
      ) {
        langgar(
          "json-ld",
          nama,
          `${jenis} menyatakan dateModified (${artikel.dateModified}) ` +
            `mendahului datePublished (${artikel.datePublished})`
        );
      }

      // `author` wajib ada dan wajib punya nama yang terbaca. `NewsArticle`
      // tanpa penulis lebih miskin daripada `Article` yang digantikannya, dan
      // rujukan `@id` tanpa `name` inline terbaca sebagai tanpa penulis oleh
      // pembaca yang tidak menyelesaikan rujukan.
      const penulis = artikel.author;
      const namaPenulis =
        penulis && typeof penulis === "object" && !Array.isArray(penulis)
          ? penulis.name
          : undefined;

      if (typeof namaPenulis !== "string" || namaPenulis.trim() === "") {
        langgar("json-ld", nama, `${jenis} tanpa author.name yang terbaca`);
      }
    }

    // -- pasangan tanggal Open Graph -----------------------------------------
    //
    // Permukaan KEDUA yang membawa kedua tanggal, dan ia bukan JSON-LD, jadi
    // gerbang di atas tidak bisa melihatnya. Keduanya pernah dipasang dari SATU
    // nilai di sini, dan pemasangannya hidup di `.astro` — yang tidak dijangkau
    // `astro check` maupun tes mana pun. Tanpa gerbang ini, pelipatan yang
    // ADR-0033 tutup bisa dipasang kembali dengan kelima gerbang tetap hijau.
    const ogTanggal = {};

    for (const kunci of ["published_time", "modified_time"]) {
      const nilai = isi.match(
        new RegExp(
          `<meta[^>]+property=["']article:${kunci}["'][^>]+content=["']([^"']*)["']`,
          "i"
        )
      )?.[1];

      if (nilai === undefined) continue;

      if (nilai.trim() === "" || Number.isNaN(Date.parse(nilai))) {
        langgar("og", nama, `article:${kunci} bukan tanggal: ${JSON.stringify(nilai)}`);
        continue;
      }

      ogTanggal[kunci] = Date.parse(nilai);
    }

    const ogAda = Object.keys(ogTanggal).length;

    if (ogAda === 1) {
      langgar(
        "og",
        nama,
        "memasang salah satu dari article:published_time / article:modified_time saja — " +
          "keduanya berpasangan, dan yang sendirian terbaca sebagai artikel tanpa riwayat"
      );
    }

    if (
      ogTanggal.published_time !== undefined &&
      ogTanggal.modified_time !== undefined &&
      ogTanggal.modified_time < ogTanggal.published_time
    ) {
      langgar(
        "og",
        nama,
        "article:modified_time mendahului article:published_time"
      );
    }

    // -- aset yang dijanjikan metadata ---------------------------------------
    //
    // Aturan AGENTS.md: jangan pernah mengiklankan aset yang tidak diterbitkan
    // build ini. Pratinjau tanpa gambar jatuh ke kartu teks yang rapi;
    // pratinjau dengan gambar rusak tidak jatuh ke mana pun.
    const dijanjikan = [
      ...[...isi.matchAll(/<meta[^>]+property=["']og:image[^"']*["'][^>]+content=["']([^"']+)["']/gi)],
      ...[...isi.matchAll(/<meta[^>]+name=["']twitter:image[^"']*["'][^>]+content=["']([^"']+)["']/gi)]
    ]
      .map((m) => m[1])
      .concat(jsonLdDi(nama, isi).flatMap((blok) => gambarDiJsonLd(blok)));

    for (const aset of new Set(dijanjikan)) {
      if (!internal(aset)) continue;
      if (!berkasUntuk(pathDari(aset))) {
        langgar("aset-dijanjikan", nama, `metadata menunjuk ${aset} yang tidak ada di keluaran`);
      }
    }

    // -- tautan mati ---------------------------------------------------------
    for (const tautan of new Set(tautanDi(isi))) {
      if (!tautan || tautan.startsWith("#")) continue;
      if (/^(mailto:|tel:|data:|javascript:)/i.test(tautan)) continue;
      if (!internal(tautan)) continue;
      if (!berkasUntuk(pathDari(tautan))) {
        langgar("tautan-mati", nama, `menunjuk ${tautan} yang tidak ada di keluaran`);
      }
    }

    // -- nama key yang bocor ke layar ----------------------------------------
    //
    // `tests/katalog-po.test.mjs` menolak key LITERAL yang tidak ada di
    // katalog. Yang tidak bisa dilihatnya adalah key yang dirangkai saat build
    // — dari slug tab, dari kategori biaya, dari apa pun yang ditentukan
    // konfigurasi atau redaksi. Di keluaran, key seperti itu tidak lagi
    // dinamis: ia teks biasa, dan bisa dilihat.
    const kandidat = [
      ...teksLayar(isi),
      ...[...isi.matchAll(/\s(?:alt|title|aria-label)=["']([^"']*)["']/gi)].map((m) => m[1].trim())
    ];

    for (const teks of new Set(kandidat)) {
      const cocok = /^([a-z][a-zA-Z0-9]*)((?:\.[a-zA-Z0-9]+)+)$/.exec(teks);
      if (cocok && namespaceKey.has(cocok[1])) {
        langgar("key-bocor", nama, `nama key tampil sebagai teks: ${teks}`);
      }
    }

    // -- penemuan-otomatis feed ----------------------------------------------
    //
    // Dikumpulkan di sini, dinilai setelah seluruh halaman terbaca: sebuah
    // tautan feed hanya bisa dinilai lengkap bila diketahui juga berkas feed
    // mana saja yang benar-benar ada — dan sebaliknya, berkas feed yang tidak
    // diumumkan satu halaman pun adalah langganan yang tidak bisa ditemukan
    // siapa pun tanpa menebak URL-nya.
    for (const [, atribut] of isi.matchAll(/<link([^>]*\brel=["']alternate["'][^>]*)>/gi)) {
      if (!/\btype=["']application\/atom\+xml["']/i.test(atribut)) continue;

      const href = atribut.match(/\shref=["']([^"']*)["']/i)?.[1];
      const judulFeed = atribut.match(/\stitle=["']([^"']*)["']/i)?.[1]?.trim();

      if (!href) {
        langgar("feed", nama, "tautan penemuan-otomatis feed tanpa href");
        continue;
      }

      if (!judulFeed) {
        // Pembaca feed menampilkan `title` ini sebagai nama langganan. Tanpa
        // ia, sebagian menampilkan URL mentah dan sebagian menampilkan judul
        // HALAMAN — jadi dua situs yang berlangganan sama-sama benar bisa
        // muncul dengan nama yang sama sekali berbeda di daftar yang sama.
        langgar("feed", nama, `tautan feed ${href} tanpa title`);
      }

      if (!internal(href)) {
        langgar("feed", nama, `tautan feed menunjuk luar situs: ${href}`);
        continue;
      }

      const jalurFeed = pathDari(href);
      feedDideklarasikan.set(jalurFeed, [
        ...(feedDideklarasikan.get(jalurFeed) ?? []),
        nama
      ]);
    }

    // -- hreflang ------------------------------------------------------------
    const alternate = [
      ...isi.matchAll(
        /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["']/gi
      )
    ].map(([, hreflang, href]) => ({ hreflang, href }));

    if (!noindex) {
      if (alternate.length === 0) {
        langgar("hreflang", nama, "tanpa satu pun link alternate");
      }

      if (!alternate.some(({ hreflang }) => hreflang === "x-default")) {
        langgar("hreflang", nama, "tanpa x-default");
      }

      for (const { hreflang, href } of alternate) {
        if (!internal(href)) {
          langgar("hreflang", nama, `alternate ${hreflang} menunjuk luar situs: ${href}`);
          continue;
        }
        if (!berkasUntuk(pathDari(href))) {
          langgar("hreflang", nama, `alternate ${hreflang} menunjuk ${href} yang tidak ada`);
        }
      }

      if (canonical) alternatePerUrl.set(pathDari(canonical), alternate);
    }
  }

  // -- resiprositas hreflang, setelah seluruh halaman terbaca ----------------
  //
  // Alternate satu arah adalah kelas cacat yang paling sulit dilihat dengan
  // mata: setiap halaman tampak benar sendirian, dan yang salah hanya
  // hubungannya. Mesin pencari mengabaikan kelompok hreflang yang tidak saling
  // menunjuk — jadi seluruh sinyal multi-bahasa situs itu hilang tanpa satu pun
  // halaman yang terlihat rusak.
  for (const [path, alternate] of alternatePerUrl) {
    for (const { hreflang, href } of alternate) {
      if (hreflang === "x-default") continue;

      const tujuan = pathDari(href);
      if (tujuan === path) continue;

      const balik = alternatePerUrl.get(tujuan);
      if (!balik) continue; // halaman tujuan noindex atau di luar daftar; sudah dilaporkan di atas

      if (!balik.some((alt) => pathDari(alt.href) === path)) {
        langgar("hreflang", path, `alternate ke ${tujuan} tidak dibalas — kelompok hreflang pincang`);
      }
    }
  }

  catat(`${halaman.length} halaman diperiksa (SEO, hreflang, aset, tautan, nama key)`);

  // -- sitemap ---------------------------------------------------------------
  const sitemap = [...new Bun.Glob("sitemap*.xml").scanSync(KELUARAN)];
  /** Setiap `<loc>` apa adanya, TERMASUK yang berakhiran `.xml`. */
  const locSitemap = new Set();

  if (sitemap.length === 0) {
    catat("sitemap: tidak ada berkas sitemap di keluaran — dilewati");
  } else {
    let jumlahLoc = 0;

    for (const nama of sitemap) {
      const isi = readFileSync(`${KELUARAN}/${nama}`, "utf8");
      for (const [, loc] of isi.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        // Dicatat SEBELUM `continue` di bawah. Baris berikutnya melewati setiap
        // `.xml` karena sebuah indeks sitemap memang menunjuk sitemap lain —
        // dan justru itu yang membuat entri feed yang salah tak terlihat di
        // satu-satunya tempat yang membaca sitemap. Gerbang feed membacanya
        // dari sini.
        locSitemap.add(loc);
        if (loc.endsWith(".xml")) continue; // indeks menunjuk sitemap lain
        jumlahLoc += 1;
        if (internal(loc) && !berkasUntuk(pathDari(loc))) {
          langgar("sitemap", nama, `mendaftarkan ${loc} yang tidak ada di keluaran`);
        }
      }
    }

    catat(`${jumlahLoc} URL sitemap diperiksa di ${sitemap.length} berkas`);
  }

  auditFeed({ asal, internal, pathDari, namespaceKey, locSitemap, feedDideklarasikan });
  auditPrioritasGambar(halaman);
  auditAnggaranGambar(halaman, { internal, pathDari });
}

// ---------------------------------------------------------------------------
// Keluarga feed (ADR-0035)
// ---------------------------------------------------------------------------

/** Kebalikan `lepasXml` di `src/lib/feed.ts`, untuk lima entitas yang sama. */
function bacaXml(nilai) {
  return nilai
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Isi setiap `<nama>…</nama>` di dalam sebuah potongan XML, sudah dibaca. */
function elemen(blok, nama) {
  return [...blok.matchAll(new RegExp(`<${nama}(?:\\s[^>]*)?>([\\s\\S]*?)</${nama}>`, "g"))].map(
    (m) => bacaXml(m[1]).trim()
  );
}

/** Nilai atribut `href` pada `<link>` ber-`rel` tertentu. */
function hrefLink(blok, rel) {
  const cocok = blok.match(
    new RegExp(`<link[^>]*\\brel=["']${rel}["'][^>]*>`, "i")
  );
  return cocok ? bacaXml(cocok[0].match(/\shref=["']([^"']*)["']/i)?.[1] ?? "") : undefined;
}

/**
 * RFC 3339, yang Atom tuntut — dan bukan "apa pun yang `new Date` mau terima".
 *
 * Selisihnya nyata: `new Date("2026-08-08")` sah di JavaScript dan menghasilkan
 * tanggal yang benar, sementara `2026-08-08` sebagai isi `<updated>` melanggar
 * Atom dan ditolak sebagian pembaca feed diam-diam — entry-nya hilang dari
 * daftar tanpa satu pesan pun. Memeriksa hanya "bisa di-parse" akan meluluskan
 * persis kelas cacat itu.
 */
const RFC_3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * Gerbang atas setiap berkas `.xml` di keluaran yang bukan sitemap.
 *
 * ## Kenapa keluarga ini ada
 *
 * [ADR-0033](../docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)
 * menunda feed dan menuliskan alasannya sebagai temuan, bukan sebagai biaya:
 * **satu-satunya `.xml` yang dibaca gerbang mana pun adalah `sitemap*.xml`**,
 * dan bahkan gerbang itu melewati setiap `<loc>` berakhiran `.xml` tanpa suara.
 * Pemindai halaman hanya mengambil `**\/*.html`. Sebuah feed yang menunjuk
 * artikel yang tidak terbit, memuat nama key mentah, atau membawa URL relatif
 * — ilegal di Atom maupun RSS — akan lolos SELURUH gerbang dengan build hijau.
 * Berkas ini yang menutupnya.
 *
 * ## Kenapa ia memindai `**\/*.xml` dan bukan `**\/feed.xml`
 *
 * Karena yang ditemukan ADR-0033 bukan "feed tidak diperiksa" melainkan
 * "**berkas `.xml` bernama lain tidak dibaca siapa pun**". Gerbang yang hanya
 * mencari `feed.xml` akan mengulangi celah itu pada nama berikutnya. Setiap
 * `.xml` yang bukan sitemap karena itu WAJIB berupa feed Atom yang sah, atau
 * dilaporkan sebagai berkas yang tidak dibaca gerbang mana pun — yang merupakan
 * temuannya sendiri, bukan kelalaian yang didiamkan.
 */
function auditFeed({ asal, internal, pathDari, namespaceKey, locSitemap, feedDideklarasikan }) {
  const berkas = [...new Bun.Glob("**/*.xml").scanSync(KELUARAN)].filter(
    (nama) => !/^sitemap[^/]*\.xml$/.test(nama)
  );

  const ditemukan = new Set();
  let jumlahEntry = 0;

  for (const nama of berkas) {
    const isi = readFileSync(`${KELUARAN}/${nama}`, "utf8");
    const url = urlDari(nama);
    const urlPenuh = `${asal}${url}`;

    if (!/<feed[^>]*\bxmlns=["']http:\/\/www\.w3\.org\/2005\/Atom["']/.test(isi)) {
      langgar(
        "feed",
        nama,
        "berkas .xml yang bukan sitemap dan bukan feed Atom — tidak ada gerbang " +
          "di repo ini yang bisa membacanya. Jadikan ia feed Atom, atau beri ia " +
          "gerbangnya sendiri sebelum menerbitkannya (ADR-0030)."
      );
      continue;
    }

    ditemukan.add(url);

    const entryMentah = [...isi.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
    // Kepala feed adalah berkasnya TANPA entry. Tanpa pemisahan ini, `<title>`
    // feed dan `<title>` entry pertama tidak bisa dibedakan sama sekali, dan
    // sebuah feed yang kehilangan judulnya sendiri akan lulus karena entry-nya
    // punya judul.
    const kepala = isi.replace(/<entry>[\s\S]*?<\/entry>/g, "");

    // -- kelengkapan yang Atom WAJIBKAN pada feed ------------------------------
    for (const wajib of ["id", "title", "updated"]) {
      if (elemen(kepala, wajib).filter(Boolean).length === 0) {
        langgar("feed", nama, `feed tanpa <${wajib}> — Atom mewajibkannya`);
      }
    }

    const diri = hrefLink(kepala, "self");
    if (!diri) {
      langgar("feed", nama, 'feed tanpa <link rel="self">');
    } else if (diri !== urlPenuh) {
      // Sebuah agregator memakai `rel="self"` untuk menyimpan alamat langganan.
      // Yang salah di sini tidak merusak berkas ini; ia mengirim setiap
      // pelanggan baru ke alamat lain — yang mungkin tidak ada.
      langgar("feed", nama, `<link rel="self"> berbunyi ${diri}, seharusnya ${urlPenuh}`);
    }

    if (entryMentah.length === 0) {
      langgar(
        "feed",
        nama,
        "feed tanpa satu pun <entry> — seksi kosong tidak menerbitkan berkas feed"
      );
    }

    // -- setiap IRI wajib absolut ---------------------------------------------
    //
    // Kelas cacat yang ADR-0033 sebut namanya. Ia tidak merusak XML-nya, jadi
    // tidak ada yang gagal: berkasnya terbit, sebagian pembaca menyelesaikan
    // URL-nya terhadap `xml:base`, sebagian terhadap URL feed, sebagian
    // menyerah dan entry-nya menjadi tautan mati di daftar bacaan orang.
    for (const [, href] of isi.matchAll(/<link[^>]*\shref=["']([^"']*)["']/gi)) {
      if (!/^https?:\/\//i.test(bacaXml(href))) {
        langgar("feed", nama, `href tidak absolut: ${href}`);
      }
    }

    for (const id of elemen(isi, "id")) {
      if (!/^[a-z][a-z0-9+.-]*:/i.test(id)) {
        langgar("feed", nama, `<id> bukan IRI absolut: ${id}`);
      }
    }

    // -- entry ------------------------------------------------------------------
    const stempel = [];

    for (const blok of entryMentah) {
      jumlahEntry += 1;
      const judul = elemen(blok, "title")[0] ?? "";
      const label = judul || "(tanpa judul)";

      for (const wajib of ["id", "title", "updated", "published"]) {
        if (elemen(blok, wajib).filter(Boolean).length === 0) {
          langgar("feed", nama, `entry ${label} tanpa <${wajib}>`);
        }
      }

      const terbit = elemen(blok, "published")[0];
      const diubah = elemen(blok, "updated")[0];

      for (const [namaTanggal, nilai] of [
        ["published", terbit],
        ["updated", diubah]
      ]) {
        if (nilai && !RFC_3339.test(nilai)) {
          langgar("feed", nama, `entry ${label}: <${namaTanggal}> bukan RFC 3339: ${nilai}`);
        }
      }

      if (terbit && diubah && RFC_3339.test(terbit) && RFC_3339.test(diubah)) {
        const t = Date.parse(terbit);
        const d = Date.parse(diubah);
        if (d < t) {
          langgar("feed", nama, `entry ${label}: <updated> mendahului <published>`);
        }
        stempel.push(d);
      }

      // Tautan entry wajib menunjuk halaman yang BENAR-BENAR ada di keluaran.
      // Inilah "feed yang menunjuk artikel yang tidak terbit": sebuah artikel
      // yang dicabut redaksi hilang dari indeks seksinya dan dari sitemap, dan
      // tanpa gerbang ini ia tetap tinggal di feed — di pembaca setiap orang
      // yang sudah menerimanya, menunjuk 404.
      const tujuan = hrefLink(blok, "alternate") ?? elemen(blok, "id")[0];
      if (tujuan && internal(tujuan) && !berkasUntuk(pathDari(tujuan))) {
        langgar("feed", nama, `entry ${label} menunjuk ${tujuan} yang tidak ada di keluaran`);
      }

      // Nama key yang bocor, diperiksa dengan daftar namespace yang sama dengan
      // halaman HTML. Judul dan ringkasan feed datang dari katalog PO lewat
      // jalur yang sama, jadi kelas cacatnya identik — yang berbeda hanya bahwa
      // di sini tidak ada satu pun mata manusia yang akan melihatnya.
      for (const teks of [judul, ...elemen(blok, "summary")]) {
        const cocok = /^([a-z][a-zA-Z0-9]*)((?:\.[a-zA-Z0-9]+)+)$/.exec(teks);
        if (cocok && namespaceKey.has(cocok[1])) {
          langgar("feed", nama, `nama key tampil sebagai teks: ${teks}`);
        }
      }
    }

    // -- urutan, dan `<updated>` feed -----------------------------------------
    const menurun = stempel.every((nilai, i) => i === 0 || stempel[i - 1] >= nilai);
    if (!menurun) {
      langgar("feed", nama, "entry tidak terurut dari yang terbaru");
    }

    const updatedFeed = elemen(kepala, "updated")[0];
    if (updatedFeed && stempel.length > 0) {
      const terbaru = Math.max(...stempel);
      if (Date.parse(updatedFeed) !== terbaru) {
        // Yang paling mungkin terjadi di sini adalah jam build, dan itu
        // penolakan yang sama dengan `lastmod` sitemap: memberi tahu setiap
        // pelanggan bahwa seksinya berubah pada tiap deploy membuat mereka
        // berhenti mempercayai stempelnya sama sekali.
        langgar(
          "feed",
          nama,
          `<updated> feed (${updatedFeed}) bukan <updated> entry terbaru ` +
            `(${new Date(terbaru).toISOString()})`
        );
      }
    }

    // -- feed tidak boleh masuk sitemap ---------------------------------------
    if (locSitemap.has(urlPenuh)) {
      langgar(
        "feed",
        nama,
        "terdaftar di sitemap. Sitemap mendaftarkan halaman; feed adalah " +
          "representasi kedua dari halaman seksi yang sudah terdaftar sendiri — " +
          "dan gerbang sitemap melewati setiap <loc> .xml tanpa suara, sehingga " +
          "entri yang salah tidak akan terlihat di sana."
      );
    }

    // -- feed wajib bisa ditemukan --------------------------------------------
    if (!feedDideklarasikan.has(url)) {
      langgar(
        "feed",
        nama,
        "tidak diumumkan satu halaman pun — tanpa <link rel=\"alternate\" " +
          'type="application/atom+xml"> ia hanya bisa ditemukan dengan menebak URL-nya'
      );
    }
  }

  // -- arah sebaliknya: tautan yang menjanjikan feed yang tidak ada -----------
  //
  // Gerbang tautan mati sudah menangkap href yang tidak menyelesaikan ke berkas
  // apa pun. Yang TIDAK bisa dilihatnya adalah href yang menyelesaikan ke
  // berkas yang ADA tetapi bukan feed — sebuah halaman HTML, misalnya, yang
  // diumumkan sebagai langganan.
  for (const [jalur, halamanPengumum] of feedDideklarasikan) {
    if (!ditemukan.has(jalur)) {
      langgar(
        "feed",
        halamanPengumum[0],
        `mengumumkan feed ${jalur} yang bukan feed Atom di keluaran` +
          (halamanPengumum.length > 1 ? ` (dan ${halamanPengumum.length - 1} halaman lain)` : "")
      );
    }
  }

  if (berkas.length === 0) {
    catat(
      "feed: tidak ada berkas .xml selain sitemap di keluaran — dilewati. " +
        "Template ini menyatakan nol seksi berita, jadi itu keadaan yang benar."
    );
  } else {
    catat(
      `${ditemukan.size} feed diperiksa, ${jumlahEntry} entry, ` +
        `${feedDideklarasikan.size} tautan penemuan-otomatis`
    );
  }
}

/**
 * Gambar `eager` wajib membawa `fetchpriority="high"` (ADR-0028 celah 2).
 *
 * `standar-teknis.md` sudah mewajibkannya sejak dokumen itu ditulis, sementara
 * `Ilustrasi.astro` hanya memasang `loading="eager"` — aturan yang tertulis
 * selama berbulan-bulan tanpa pemeriksa, lalu dilanggar tanpa satu pun yang
 * merah. Ini pemeriksanya.
 *
 * Kenapa keduanya perlu, dan kenapa selisihnya tidak terlihat dari kode:
 * `loading="eager"` hanya berarti "jangan tunda". Prioritas bawaan sebuah
 * `<img>` di Chromium tetap **Low** sampai layout membuktikan ia di viewport —
 * jadi elemen LCP mengantre di belakang setiap gambar lain yang ditemukan lebih
 * dulu, dan halamannya tetap terbit dengan benar. Yang berubah hanya angka LCP,
 * yang tidak dilihat siapa pun di dalam build.
 *
 * Diperiksa di KELUARAN, bukan di komponen: sebuah situs turunan boleh menulis
 * `<img>`-nya sendiri, dan gerbang yang hanya membaca `Ilustrasi.astro` akan
 * hijau untuk halaman yang tidak pernah melewatinya.
 */
function auditPrioritasGambar(halaman) {
  let eager = 0;

  for (const { nama, isi } of halaman) {
    for (const [tag] of isi.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\bloading=["']eager["']/i.test(tag)) continue;

      eager += 1;
      if (/\bfetchpriority=["']high["']/i.test(tag)) continue;

      const src = tag.match(/\bsrc=["']([^"']*)["']/i)?.[1] ?? "(tanpa src)";
      langgar(
        "performa",
        nama,
        `gambar eager tanpa fetchpriority="high": ${src} — ia hampir pasti ` +
          `elemen LCP halaman ini, dan prioritas bawaannya Low sampai layout selesai`
      );
    }
  }

  catat(`performa: ${eager} gambar eager diperiksa prioritasnya`);
}

/**
 * Anggaran berat gambar per halaman (ADR-0028 celah 3).
 *
 * Angkanya sudah tertulis di `standar-teknis.md` sejak dibawa dari repo
 * rujukan — beranda ≤ 250 KB, halaman konten ≤ 100 KB — dan **tidak pernah
 * diukur satu kali pun**. Datanya selama ini sudah ada di tangan gerbang ini:
 * ia sudah membaca setiap halaman dan sudah bisa menyelesaikan path menjadi
 * berkas.
 *
 * Tiga batas yang disengaja, dan disebut supaya tidak dikira lebih luas:
 *
 *   - **Hanya gambar yang benar-benar DITERBITKAN build ini** yang dihitung.
 *     Gambar dari host media `awcms` tidak ada di `dist/client`, jadi ia tidak
 *     bisa ditimbang di sini — anggaran ini karena itu memeriksa seni lokal,
 *     bukan seluruh berat halaman.
 *   - **Byte di disk, bukan byte di kabel.** Penyaji mengompresi respons, tetapi
 *     format gambar sudah terkompresi sehingga selisihnya kecil; angka ini
 *     konservatif ke arah yang benar.
 *   - **Hanya `<img src>` dan `srcset` pertama.** CSS `background-image` tidak
 *     ikut, karena gerbang ini tidak mengurai CSS.
 */
const ANGGARAN_BERANDA = 250 * 1024;
const ANGGARAN_HALAMAN = 100 * 1024;

function auditAnggaranGambar(halaman, { internal, pathDari }) {
  let terberat = 0;
  let namaTerberat = "";

  for (const { nama, isi } of halaman) {
    const url = urlDari(nama);
    // Beranda locale default DAN beranda tiap locale berprefiks: keduanya
    // halaman depan bagi pembacanya masing-masing.
    const beranda = /^\/([a-z]{2}(-[A-Za-z]+)?\/)?$/.test(url);
    const anggaran = beranda ? ANGGARAN_BERANDA : ANGGARAN_HALAMAN;

    let byte = 0;
    const dihitung = new Set();

    for (const [tag] of isi.matchAll(/<img\b[^>]*>/gi)) {
      const src = tag.match(/\bsrc=["']([^"']*)["']/i)?.[1];
      if (!src || !internal(src)) continue;

      const path = pathDari(src);
      if (dihitung.has(path)) continue; // satu berkas dua kali tetap satu unduhan
      dihitung.add(path);

      const berkas = berkasUntuk(path);
      if (berkas) byte += statSync(berkas).size;
    }

    if (byte > terberat) {
      terberat = byte;
      namaTerberat = nama;
    }

    if (byte > anggaran) {
      langgar(
        "performa",
        nama,
        `gambar terbitan halaman ini ${(byte / 1024).toFixed(0)} KB, ` +
          `melampaui anggaran ${(anggaran / 1024).toFixed(0)} KB ` +
          `(${beranda ? "beranda" : "halaman konten"}). Pembacanya di jaringan ` +
          `yang tidak dapat diandalkan, dan ADR-0024 berarti tidak ada srcset ` +
          `yang menolongnya di layar kecil`
      );
    }
  }

  catat(
    terberat > 0
      ? `performa: halaman terberat ${namaTerberat} — ${(terberat / 1024).toFixed(0)} KB gambar terbitan`
      : "performa: tidak ada gambar terbitan yang bisa ditimbang (media awcms tidak ada di dist/)"
  );
}

// ---------------------------------------------------------------------------
// Keluarga 2 — sumber gambar
// ---------------------------------------------------------------------------

const EKSTENSI_GAMBAR = ["png", "jpg", "jpeg", "gif", "webp", "avif", "svg"];

/**
 * Format sebenarnya sebuah berkas, dibaca dari ISINYA.
 *
 * Ekstensi adalah klaim penulisnya, bukan fakta. Sebelas berkas di repo rujukan
 * ber-ekstensi `.png` padahal isinya JPEG — dan itu tidak menggagalkan apa pun,
 * hanya membuat setiap perkakas yang mempercayai ekstensinya salah menebak.
 *
 * @param {Buffer} buf
 * @returns {string | undefined}
 */
function formatDariIsi(buf) {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 4).toString("latin1") === "GIF8") return "gif";
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") {
    return "webp";
  }
  if (buf.subarray(4, 8).toString("latin1") === "ftyp") {
    const merek = buf.subarray(8, 12).toString("latin1");
    if (merek.startsWith("avif") || merek.startsWith("avis") || merek.startsWith("mif1")) return "avif";
  }

  const awal = buf.subarray(0, 512).toString("utf8").trimStart();
  if (awal.startsWith("<?xml") || awal.startsWith("<svg") || awal.startsWith("<!--")) {
    if (/<svg[\s>]/i.test(buf.subarray(0, 4096).toString("utf8"))) return "svg";
  }

  return undefined;
}

/** Ekstensi dinormalkan ke nama format, supaya `.jpg` dan `.jpeg` sama. */
function formatDariEkstensi(nama) {
  const ext = nama.split(".").pop().toLowerCase();
  return ext === "jpg" ? "jpeg" : ext;
}

/**
 * Dimensi piksel, atau `undefined` bila format ini belum bisa dibaca.
 *
 * `undefined` DIPERLAKUKAN SEBAGAI PELANGGARAN oleh pemanggilnya, bukan sebagai
 * lulus. Sebuah gerbang yang melewati format yang tidak dikenalnya adalah
 * gerbang yang bisa dilewati dengan mengganti format.
 *
 * @param {Buffer} buf
 * @param {string} format
 */
function dimensi(buf, format) {
  if (format === "png") {
    return { lebar: buf.readUInt32BE(16), tinggi: buf.readUInt32BE(20) };
  }

  if (format === "gif") {
    return { lebar: buf.readUInt16LE(6), tinggi: buf.readUInt16LE(8) };
  }

  if (format === "jpeg") {
    // Menyusuri marker sampai menemukan SOF. Tidak semua SOF adalah SOFn yang
    // membawa dimensi: DHT/DAC/RST punya nomor di rentang yang sama.
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      const panjang = buf.readUInt16BE(i + 2);
      const sof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (sof) return { tinggi: buf.readUInt16BE(i + 5), lebar: buf.readUInt16BE(i + 7) };
      i += 2 + panjang;
    }
    return undefined;
  }

  if (format === "webp") {
    const jenis = buf.subarray(12, 16).toString("latin1");
    if (jenis === "VP8 ") {
      return { lebar: buf.readUInt16LE(26) & 0x3fff, tinggi: buf.readUInt16LE(28) & 0x3fff };
    }
    if (jenis === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { lebar: (bits & 0x3fff) + 1, tinggi: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (jenis === "VP8X") {
      const baca24 = (offset) => buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16);
      return { lebar: baca24(24) + 1, tinggi: baca24(27) + 1 };
    }
    return undefined;
  }

  return undefined;
}

/**
 * Membuang komentar XML, DIULANG sampai berhenti berubah.
 *
 * Sekali jalan tidak cukup karena pembuangan itu sendiri bisa MENYATUKAN sisa
 * kiri dan kanannya menjadi komentar baru yang utuh. Bentuk yang diukur ada di
 * `tests/audit-konten.test.mjs`:
 *
 *     <!<!-- x -->-- draf & catatan -->
 *
 * Lintasan pertama membuang `<!-- x -->` yang berada di TENGAH. Sisanya, `<!`
 * dan `-- draf & catatan -->`, menyatu menjadi `<!-- draf & catatan -->` —
 * komentar utuh yang baru lahir dan tidak pernah diperiksa lagi. `&` di
 * dalamnya lalu dilaporkan sebagai pelanggaran pada berkas yang sah. Diukur: 1
 * pelanggaran palsu sebelum, 0 sesudah.
 *
 * Yang dipertaruhkan searah dengan seluruh gerbang ini: `&` telanjang DI DALAM
 * komentar bukan pelanggaran, karena browser tidak pernah mem-parse isinya.
 * Pemeriksa yang berbohong ke arah mana pun berhenti dibaca orang.
 *
 * **Satu hal yang TIDAK diperbaiki, dan sengaja disebut.** Komentar tak
 * berpenutup — `<!-- draf & catatan` tanpa `-->` — tetap lolos, dan
 * pengulangan tidak menolong sama sekali karena tidak ada yang berubah pada
 * lintasan kedua. Itu bukan kelalaian: berkas seperti itu bukan XML yang sah,
 * jadi `&`-nya memang layak dilaporkan.
 *
 * Ditemukan oleh CodeQL (`js/incomplete-multi-character-sanitization`).
 */
function tanpaKomentarXml(isi) {
  let hasil = isi;
  let sebelum;

  do {
    sebelum = hasil;
    hasil = hasil.replace(/<!--[\s\S]*?-->/g, "");
  } while (hasil !== sebelum);

  return hasil;
}

/**
 * Memeriksa satu SVG: XML yang sah, `viewBox`, dan ukuran teks terkecil.
 *
 * Satu `&` telanjang membuat browser diam-diam gagal merender gambarnya, tanpa
 * satu pun pesan error di mana pun. Itu bukan XML yang "agak longgar" — itu
 * gambar yang hilang.
 */
function auditSvg(jalur, isi, rasio, { periksaRasio }) {
  const tanpaKomentar = tanpaKomentarXml(isi);
  const ampersandTelanjang = [
    ...tanpaKomentar.matchAll(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g)
  ];

  if (ampersandTelanjang.length > 0) {
    langgar(
      "gambar",
      jalur,
      `${ampersandTelanjang.length} "&" telanjang — browser gagal merender SVG ini tanpa satu pun pesan error`
    );
  }

  const viewBox = isi.match(/viewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);

  if (!viewBox) {
    langgar("gambar", jalur, "tanpa viewBox — rasionya tidak bisa dinyatakan maupun diperiksa");
    return;
  }

  const lebar = Number(viewBox[1]);
  const tinggi = Number(viewBox[2]);

  if (periksaRasio) bandingkanRasio(jalur, lebar, tinggi, rasio);

  // Teks terkecil: ambang 22px berlaku pada kanvas 800px, jadi ia diskalakan
  // terhadap lebar viewBox. Pada kartu selebar 328px — viewport 360px — kanvas
  // 800px tampil pada skala 0,41; di bawah ambang itu teksnya tampil di bawah
  // 9px dan praktis tidak terbaca.
  const ambang = 22 * (lebar / 800);
  const ukuran = [...isi.matchAll(/font-size\s*[:=]\s*["']?\s*([\d.]+)/gi)].map((m) => Number(m[1]));

  if (/<text[\s>]/i.test(isi) && ukuran.length === 0) {
    langgar("gambar", jalur, "memuat <text> tanpa satu pun font-size eksplisit — ukurannya tidak bisa diperiksa");
  }

  const terkecil = Math.min(...ukuran);
  if (ukuran.length > 0 && terkecil < ambang) {
    langgar(
      "gambar",
      jalur,
      `teks terkecil ${terkecil} di bawah ambang ${ambang.toFixed(1)} ` +
        `(setara 22px pada kanvas 800px; viewBox ini ${lebar})`
    );
  }
}

function bandingkanRasio(jalur, lebar, tinggi, rasio) {
  if (!tinggi) {
    langgar("gambar", jalur, "tinggi nol — rasionya tidak bisa dihitung");
    return;
  }

  const nilai = lebar / tinggi;
  const selisih = Math.abs(nilai - rasio.nilai) / rasio.nilai;

  if (selisih > 0.01) {
    langgar(
      "gambar",
      jalur,
      `rasio ${lebar}∶${tinggi} (${nilai.toFixed(3)}) bukan ${rasio.teks} — ` +
        "bingkai memakai object-fit: cover, jadi sumber ini DIPOTONG di setiap ukuran layar, bukan diperkecil"
    );
  }
}

function auditGambar(rasio) {
  const pola = `**/*.{${EKSTENSI_GAMBAR.join(",")}}`;

  /**
   * Dua akar dengan aturan yang berbeda, dan perbedaannya disebut terus terang.
   *
   * `src/assets/` adalah tempat ILUSTRASI tinggal — seluruh isinya masuk
   * bingkai ber-`--ratio-visual`, jadi rasionya diperiksa. `public/` adalah
   * perkakas situs: favicon wajib bujur sangkar, kartu share punya ukuran
   * bakunya sendiri (1200×630). Memaksa rasio tunggal di sana akan menolak
   * berkas yang justru benar, jadi yang diperiksa hanya format, XML, dan
   * ukuran teks.
   */
  const akar = [
    { dir: "src/assets", periksaRasio: true },
    { dir: "public", periksaRasio: false }
  ];

  let jumlah = 0;

  for (const { dir, periksaRasio } of akar) {
    if (!existsSync(dir)) {
      catat(`gambar: ${dir}/ belum ada — dilewati`);
      continue;
    }

    const berkas = [...new Bun.Glob(pola).scanSync(dir)];
    jumlah += berkas.length;
    catat(
      `gambar: ${berkas.length} berkas di ${dir}/ ` +
        `(rasio ${periksaRasio ? "diperiksa" : "TIDAK diperiksa — perkakas situs, bukan ilustrasi"})`
    );

    for (const nama of berkas) {
      const jalur = `${dir}/${nama}`;
      const buf = readFileSync(jalur);
      const diklaim = formatDariEkstensi(nama);
      const sebenarnya = formatDariIsi(buf);

      if (!sebenarnya) {
        langgar("gambar", jalur, "isinya bukan format gambar yang dikenali gerbang ini");
        continue;
      }

      if (sebenarnya !== diklaim) {
        langgar(
          "gambar",
          jalur,
          `ekstensinya .${diklaim} tetapi isinya ${sebenarnya} — ekstensi adalah klaim, bukan fakta`
        );
      }

      if (sebenarnya === "svg") {
        auditSvg(jalur, buf.toString("utf8"), rasio, { periksaRasio });
        continue;
      }

      if (!periksaRasio) continue;

      const ukuran = dimensi(buf, sebenarnya);

      if (!ukuran) {
        // Bukan "lewat": format yang tidak bisa dibaca berarti rasionya tidak
        // diperiksa siapa pun, dan itu keadaan yang harus terlihat.
        langgar(
          "gambar",
          jalur,
          `dimensi ${sebenarnya} belum bisa dibaca gerbang ini, jadi rasionya tidak terperiksa — ` +
            "tambahkan pembacanya di scripts/audit-konten.mjs atau pakai format yang sudah didukung"
        );
        continue;
      }

      bandingkanRasio(jalur, ukuran.lebar, ukuran.tinggi, rasio);
    }
  }

  if (jumlah === 0) {
    catat(
      "gambar: template ini belum membawa satu pun ilustrasi — gerbangnya jalan, " +
        "yang diperiksanya nol. Aturannya berlaku sejak gambar pertama masuk."
    );
  }
}

// ---------------------------------------------------------------------------
// Jalankan
// ---------------------------------------------------------------------------

const localeDefault = bacaLocaleDefault();
const locales = bacaLocale();
const rasio = bacaRasioVisual();

catat(`locale default "${localeDefault}", locale terdaftar: ${locales.join(", ") || "—"}`);
catat(`--ratio-visual dibaca dari global.css: ${rasio.teks}`);

auditGambar(rasio);

if (existsSync(KELUARAN)) {
  auditKeluaran(bacaHalaman(), {
    localeDefault,
    locales,
    namespaceKey: bacaNamespaceKey(localeDefault)
  });
} else {
  catat(
    `keluaran: ${KELUARAN} belum ada — SELURUH gerbang keluaran DILEWATI ` +
      "(SEO, klaim artikel JSON-LD, tanggal Open Graph, hreflang, aset " +
      "dijanjikan, tautan mati, sitemap, feed Atom, nama key bocor)."
  );
  catat(
    "  Ia lahir dari `bun run build`, yang butuh sumber konten awcms. Di repo " +
      "template ini itu normal; di sebuah SITUS, jalankan audit ini lagi setelah build."
  );
}

pelapor.finish();
