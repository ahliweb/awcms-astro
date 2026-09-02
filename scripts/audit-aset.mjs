/**
 * audit-aset.mjs — berapa byte yang diunduh seorang pembaca, dan plafonnya.
 *
 * ## Kenapa gerbang ini ada
 *
 * `awcms` ADR-0101 membelah anggaran aset kliennya per AUDIENS dan menggerbangi
 * hasilnya: `READER_BUDGET_BYTES` = 24.000 untuk pengunjung artikel publik,
 * terukur 21.415 B, sengaja ketat.
 *
 * Menurut `awcms` ADR-0070, repo INI yang memikul permukaan publik keluarga.
 * Jadi repo dengan anggaran pembaca yang ketat adalah repo yang permukaan
 * pembacanya sebuah aplikasi admin, dan repo yang benar-benar melayani pembaca
 * tidak punya anggaran sama sekali.
 *
 * Yang ada di sini `lighthouserc.json` — LCP, CLS, TBT — dan itu nyata tetapi
 * mengerjakan hal lain: ia mengambil SAMPEL halaman, hanya berjalan bila
 * `vars.AWCMS_API_URL` terisi (jadi **tidak pernah untuk repo template ini
 * sendiri**), dan tidak bisa menyebut BERKAS mana yang membesar. Regresi 8 KB
 * duduk nyaman di bawah LCP 2500 ms pada runner cepat, dan tetap terasa di
 * ponsel pada jaringan 3G.
 *
 * ## Dua lapis, karena `dist/` tidak selalu ada
 *
 * Bentuknya mengikuti `audit-konten.mjs`, dan bukan karena kerapian: repo
 * template ini tidak punya sumber konten, jadi gerbang yang HANYA membaca
 * `dist/client` tidak pernah berjalan di satu-satunya tempat kode ini ditinjau.
 *
 *   1. **Sumber — selalu jalan.** Blok `<script>` di `src/**` dan berkas di
 *      `public/**`. Angka sumber selalu >= angka terbit karena bundler
 *      memperkecil — kotak cari 10.054 B di `src/` dan 4.808 B setelah build,
 *      rasio sekitar 2,1x. Karena itu lapis ini punya PLAFONNYA SENDIRI yang
 *      lebih longgar; menerapkan plafon terbit pada sumber akan menuduh berkas
 *      yang sebenarnya patuh. Yang dijaganya bukan byte yang dikirim melainkan
 *      satu berkas yang tumbuh di luar proporsi tetangganya.
 *   2. **Keluaran — bila `dist/client` ada.** Yang benar-benar ditarik satu
 *      halaman: skrip dan stylesheet yang dirujuk HTML-nya, plus skrip inline.
 *      Inilah angka yang sebenarnya, dan ia menyebut berkasnya.
 *
 * Lapis yang dilewati MENGATAKANNYA di keluarannya, seperti tetangganya —
 * "tidak berjalan" tidak boleh menyamar jadi "lulus".
 *
 * ## Angkanya diukur, dan pengukurannya ditulis di sebelahnya
 *
 * Diukur pada 27 Agustus 2026 atas hasil build sungguhan:
 *
 *     halaman artikel        29.510 B total   (skrip 5.809 B, gaya 23.701 B)
 *     halaman cari           32.358 B total   (skrip 9.963 B, gaya 22.395 B)
 *     berkas terbesar        20.408 B         (BaseLayout.css)
 *     skrip terbit terbesar   4.808 B         (kotak cari)
 *     skrip SUMBER terbesar  10.054 B         (kotak cari, pra-minifikasi)
 *
 * Angka pertama yang ditulis untuk anggaran skrip adalah 9.000, dari hitungan
 * tangan yang MELEWATKAN sebagian skrip inline. Gerbang ini sendiri yang
 * mengoreksinya pada jalan pertamanya, dan itu alasan sebuah anggaran harus
 * diukur oleh alat yang menegakkannya alih-alih oleh orang yang menulisnya.
 *
 * Plafonnya diturunkan dari situ, bukan disalin dari `awcms`: 24.000 miliknya
 * adalah irisan pembaca dari bundle ADMIN, dan angka itu tidak mengatakan apa
 * pun tentang template ini.
 *
 * Jalankan: `bun run audit:aset`.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";

import { createReporter } from "./lib/reporter.mjs";

/* ------------------------------------------------------------- anggarannya */

/**
 * SKRIP yang ditarik satu halaman pembaca — berkas `.js` plus blok inline.
 *
 * Terukur: **5.809 B** pada halaman artikel, **9.963 B** pada halaman cari.
 * 13.000 memberi ruang sekitar 3 KB di atas halaman terberat, dan itu memang
 * yang dituju: tiga fitur klien mendarat dalam dua hari pada 22–23 Agustus 2026
 * (cari, beacon, bagikan) tanpa satu pun plafon. Akresi satu layar demi satu
 * layar persis yang hendak ditangkap anggaran ini.
 *
 * Angka pertama versi berkas ini adalah 9.000, ditulis dari hitungan tangan yang
 * MELEWATKAN sebagian skrip inline. Gerbangnya sendiri yang mengoreksinya pada
 * jalan pertama — yang merupakan alasan sebuah anggaran harus diukur oleh alat
 * yang menegakkannya, bukan oleh orang yang menulisnya.
 */
const ANGGARAN_SKRIP = 13000;

/**
 * TOTAL yang ditarik satu halaman pembaca — skrip, stylesheet, dan inline.
 *
 * Terukur 29.497 B (artikel) dan 32.358 B (cari), yang 20.408 B di antaranya
 * satu berkas: `BaseLayout.css`. CSS dipisahkan dari skrip alih-alih dijumlah
 * menjadi satu angka karena biayanya berbeda — CSS menahan render, JS menahan
 * DAN dieksekusi — dan satu angka gabungan akan membuat 4 KB skrip baru tampak
 * sama murahnya dengan 4 KB CSS.
 *
 * ## 36.000 → 40.000, 2 September 2026
 *
 * Redesign beranda memindahkan halaman TERBERAT dari `/cari/` ke `/`: hero
 * dengan panel artikel terbaru, pita statistik, blok sorotan, dan kisi prinsip
 * bernomor. Terukur **38.136 B** (skrip 5.999 + gaya 32.137), yang 9.560 B di
 * antaranya `Home.css` — gaya yang HANYA ditarik beranda.
 *
 * Dua hal dilakukan lebih dulu, dan keduanya karena gerbang inilah yang
 * menemukannya:
 *
 *   1. Gaya hero dipindahkan dari `src/styles/global.css` ke `<style>`
 *      `Home.astro`. Ia dipakai satu komponen sementara berkas global dimuat
 *      setiap halaman, jadi selama ia di sana `/cari/` membayar gaya sebuah
 *      elemen yang tidak pernah direndernya. Itu memulangkan 1.853 B ke SETIAP
 *      halaman, bukan hanya ke yang melanggar.
 *   2. Bingkai seni beranda tidak lagi merender placeholder saat situs belum
 *      punya seninya.
 *
 * Yang TIDAK dilakukan, dan disebut supaya ia tidak hilang: `BaseLayout.css`
 * masih 22.577 B dan masih membawa gaya badan artikel (`.content-body`,
 * `.galeri`, `.video-berita`), tabel biaya, dan akordeon ke setiap halaman yang
 * tidak punya satu pun di antaranya. Memindahkannya akan memulangkan beberapa
 * kilobyte kepada setiap pembaca setiap halaman — pekerjaan tersendiri, dengan
 * risikonya sendiri pada badan artikel, dan bukan pekerjaan sebuah redesign
 * beranda.
 *
 * 40.000 memberi ruang 1.864 B di atas halaman terberat hari ini. Sengaja
 * sempit: plafon yang dinaikkan dengan kelegaan besar berhenti menangkap akresi
 * berikutnya, dan menangkap akresi persis yang dilakukannya di sini.
 */
const ANGGARAN_TOTAL = 40000;

/**
 * Satu berkas skrip TERBIT. Terbesar hari ini 4.808 B (kotak cari).
 *
 * Berlaku atas `dist/`, bukan atas sumber, dan pemisahan itu bukan kelonggaran:
 * sumber belum diperkecil. Blok `<script>` kotak cari 10.054 B di `src/` dan
 * 4.808 B setelah build — menerapkan satu plafon pada keduanya menuduh berkas
 * yang sebenarnya patuh.
 */
const ANGGARAN_PER_SKRIP = 8000;

/**
 * Satu blok `<script>` SUMBER, sebelum minifikasi.
 *
 * Terukur 10.054 B (kotak cari), dan rasio minifikasinya di berkas ini sekitar
 * 2,1x. 14.000 kira-kira sepadan dengan plafon terbit di atas.
 *
 * Plafon ini lebih longgar dan HARUS begitu; yang dijaganya bukan byte yang
 * dikirim melainkan satu berkas yang tumbuh sendirian di luar proporsi
 * tetangganya. Itulah yang bisa dilihat repo template ini tanpa `dist/`.
 */
const ANGGARAN_PER_SKRIP_SUMBER = 14000;

/**
 * Berkas `public/` dan audiensnya, ditegakkan DUA ARAH.
 *
 * `public/` disalin apa adanya dan tidak punya struktur yang bisa dibaca, jadi
 * satu-satunya cara mengklasifikasikannya adalah mendaftarkannya. Yang membuat
 * daftar itu tidak membusuk adalah penegakan dua arahnya: berkas yang tidak
 * didaftarkan MERAH, dan entri yang berkasnya tidak ada juga MERAH.
 *
 * `awcms` ADR-0101 memakai bentuk yang sama, dan menyebut alasannya: itu yang
 * menghentikan pembusukan `security-headers.ts` terulang.
 */
const AUDIENS_PUBLIC = new Map([
  ["favicon.svg", "pembaca — ikon tab, ditarik sekali dan di-cache selamanya"],
  ["tema.js", "pembaca — pemilih tema, satu-satunya skrip yang TIDAK di-bundle Astro"]
]);

/** Ekstensi yang dihitung sebagai unduhan pembaca. */
const EKSTENSI_SKRIP = new Set([".js", ".mjs"]);
const EKSTENSI_GAYA = new Set([".css"]);

const pelapor = createReporter("audit aset");

/** Semua berkas di bawah `akar`, sebagai jalur relatif POSIX. */
function berkasDi(akar) {
  if (!existsSync(akar)) return [];

  const hasil = [];
  const antre = [akar];

  while (antre.length > 0) {
    const dir = antre.pop();
    for (const entri of readdirSync(dir, { withFileTypes: true })) {
      const penuh = join(dir, entri.name);
      if (entri.isDirectory()) antre.push(penuh);
      else hasil.push(relative(akar, penuh).split(sep).join(posix.sep));
    }
  }

  return hasil.sort();
}

function ekstensi(jalur) {
  const titik = jalur.lastIndexOf(".");
  return titik === -1 ? "" : jalur.slice(titik).toLowerCase();
}

/* ------------------------------------------------- lapis 1: sumber, selalu */

/**
 * Byte skrip inline di sebuah `.astro`.
 *
 * Blok dengan `src=` DILEWATI: ia rujukan, bukan muatan, dan menghitungnya
 * sebagai byte inline akan menghitung berkasnya dua kali.
 */
function skripInline(isi) {
  let jumlah = 0;

  for (const cocok of isi.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script(?:\s[^>]*)?>/gi)) {
    if (/\bsrc\s*=/i.test(cocok[1] ?? "")) continue;
    jumlah += Buffer.byteLength(cocok[2] ?? "", "utf8");
  }

  return jumlah;
}

function auditSumber() {
  const astro = berkasDi("src").filter((f) => f.endsWith(".astro"));
  let totalInline = 0;

  for (const berkas of astro) {
    const byte = skripInline(readFileSync(join("src", berkas), "utf8"));
    if (byte === 0) continue;

    totalInline += byte;

    if (byte > ANGGARAN_PER_SKRIP_SUMBER) {
      pelapor.violation(
        "per-berkas",
        `src/${berkas}`,
        `blok <script> ${byte} B melampaui plafon sumber ${ANGGARAN_PER_SKRIP_SUMBER} B. ` +
          `Plafon ini SENGAJA lebih longgar dari plafon terbit ` +
          `(${ANGGARAN_PER_SKRIP} B) karena sumber belum diperkecil; yang ` +
          `dijaganya adalah satu berkas yang tumbuh di luar proporsi tetangganya`
      );
    }
  }

  pelapor.note(
    `  sumber: ${totalInline} B skrip inline di ${astro.length} berkas .astro`
  );

  // `public/`, dua arah.
  const adaDiDisk = new Set(berkasDi("public"));

  for (const berkas of adaDiDisk) {
    if (!AUDIENS_PUBLIC.has(berkas)) {
      pelapor.violation(
        "registri public",
        `public/${berkas}`,
        `tidak dideklarasikan di AUDIENS_PUBLIC. Setiap berkas di public/ ` +
          `disalin apa adanya ke situs terbit, jadi yang tidak diklasifikasikan ` +
          `adalah byte yang tidak dianggarkan siapa pun`
      );
    }
  }

  for (const [berkas, alasan] of AUDIENS_PUBLIC) {
    if (!adaDiDisk.has(berkas)) {
      pelapor.violation(
        "registri public",
        `public/${berkas}`,
        `dideklarasikan sebagai "${alasan}" tetapi tidak ada di disk. Entri yang ` +
          `menamai berkas yang tidak dipancarkan build adalah entri yang membusuk, ` +
          `dan daftar yang membusuk berhenti menangkap apa pun`
      );
    }
  }

  let bytePublic = 0;
  for (const berkas of adaDiDisk) {
    const byte = statSync(join("public", berkas)).size;
    bytePublic += byte;

    if (EKSTENSI_SKRIP.has(ekstensi(berkas)) && byte > ANGGARAN_PER_SKRIP) {
      pelapor.violation(
        "per-berkas",
        `public/${berkas}`,
        `${byte} B melampaui plafon per-skrip ${ANGGARAN_PER_SKRIP} B. Berkas di ` +
          `public/ TIDAK diperkecil bundler — ia dikirim persis seperti ini`
      );
    }
  }

  pelapor.note(`  public: ${adaDiDisk.size} berkas, ${bytePublic} B, semuanya terdaftar`);
}

/* --------------------------------------------- lapis 2: keluaran, bila ada */

/** Aset yang benar-benar ditarik satu halaman. */
function asetHalaman(html, akar) {
  const rujukan = new Set();

  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/gi)) rujukan.add(m[1]);
  for (const m of html.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/gi)) {
    if (/rel=["']stylesheet["']/i.test(m[0])) rujukan.add(m[1]);
  }

  let skrip = skripInline(html);
  let gaya = 0;
  const rinci = [];

  for (const url of [...rujukan].sort()) {
    if (/^https?:/i.test(url)) continue;

    const penuh = join(akar, url.replace(/^\//, ""));
    if (!existsSync(penuh)) continue;

    const byte = statSync(penuh).size;
    const ext = ekstensi(url);

    if (EKSTENSI_SKRIP.has(ext)) skrip += byte;
    else if (EKSTENSI_GAYA.has(ext)) gaya += byte;
    else continue;

    rinci.push({ url, byte, ext });
  }

  return { skrip, gaya, total: skrip + gaya, rinci };
}

function auditKeluaran(akar) {
  const halaman = berkasDi(akar).filter((f) => f.endsWith(".html"));

  if (halaman.length === 0) {
    pelapor.note("  keluaran: dist/client ada tetapi tanpa .html — dilewati");
    return;
  }

  let terberat = null;

  for (const berkas of halaman) {
    const hasil = asetHalaman(readFileSync(join(akar, berkas), "utf8"), akar);

    if (!terberat || hasil.total > terberat.hasil.total) {
      terberat = { berkas, hasil };
    }

    // Disaring per JENIS. Versi pertama menyebut `BaseLayout.css` sebagai
    // penyumbang terbesar sebuah pelanggaran SKRIP, yang mengirim pembacanya
    // memperkecil berkas yang tidak ada hubungannya dengan angka yang merah.
    const sebut = (r, jenis) =>
      r.rinci
        .filter((x) => jenis.has(x.ext))
        .sort((a, b) => b.byte - a.byte)
        .slice(0, 3)
        .map((x) => `${x.url} (${x.byte} B)`)
        .join(", ") || "hanya skrip inline";

    if (hasil.skrip > ANGGARAN_SKRIP) {
      pelapor.violation(
        "anggaran skrip",
        `${akar}/${berkas}`,
        `${hasil.skrip} B skrip melampaui ${ANGGARAN_SKRIP} B. Skrip terbesar: ${sebut(hasil, EKSTENSI_SKRIP)}`
      );
    }

    if (hasil.total > ANGGARAN_TOTAL) {
      pelapor.violation(
        "anggaran total",
        `${akar}/${berkas}`,
        `${hasil.total} B (skrip ${hasil.skrip} + gaya ${hasil.gaya}) melampaui ` +
          `${ANGGARAN_TOTAL} B. Skrip terbesar: ${sebut(hasil, EKSTENSI_SKRIP)}; ` +
          `gaya terbesar: ${sebut(hasil, EKSTENSI_GAYA)}`
      );
    }

    for (const { url, byte, ext } of hasil.rinci) {
      if (EKSTENSI_SKRIP.has(ext) && byte > ANGGARAN_PER_SKRIP) {
        pelapor.violation(
          "per-berkas",
          `${akar}${url}`,
          `${byte} B melampaui plafon per-skrip ${ANGGARAN_PER_SKRIP} B`
        );
      }
    }
  }

  pelapor.note(
    `  keluaran: ${halaman.length} halaman diperiksa; terberat ` +
      `${terberat.hasil.total} B (skrip ${terberat.hasil.skrip}) di ${terberat.berkas}`
  );
}

auditSumber();

const AKAR_KELUARAN = "dist/client";

if (existsSync(AKAR_KELUARAN)) {
  auditKeluaran(AKAR_KELUARAN);
} else {
  pelapor.note(
    "  keluaran: DILEWATI — tidak ada dist/client. Ini normal untuk repo " +
      "template, yang tidak punya sumber konten; lapis sumber di atas tetap jalan."
  );
}

pelapor.finish();
