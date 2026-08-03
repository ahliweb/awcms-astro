#!/usr/bin/env bun
/**
 * Gerbang audit dokumen — memeriksa markdown di repo ini, bukan keluaran build.
 *
 * ## Kenapa berkas ini ada
 *
 * `docs/adr/README.md` mendaftarkan **enam** ADR yang tidak pernah ada di repo
 * ini dan melewatkan **sembilan** yang ada. Ia mendarat sudah salah — bersama
 * ADR-0014/0015 — dan bertahan sembilan ADR berikutnya tanpa satu pun gerbang
 * berbunyi. Salah satu barisnya bahkan membantah kode ("Satu bahasa, tanpa
 * mesin i18n", sementara repo ini menyajikan dua locale).
 *
 * Tidak ada yang bisa menangkapnya, dan itu bukan kelalaian melainkan celah
 * bentuk: `audit-konten.mjs` memeriksa tautan mati pada `dist/client/**`, dan
 * markdown tidak pernah ikut dibangun. Dokumen di repo ini adalah **kontrak
 * kerja** — `AGENTS.md`, ADR, changeset — jadi tautan mati di dalamnya
 * mengirim pembaca ke keputusan yang tidak ada, bukan sekadar memburukkan
 * tampilan.
 *
 * ## Yang diperiksa
 *
 *   1. **Tautan relatif mati.** Setiap tautan markdown ke berkas di repo ini
 *      harus benar-benar ada. Tautan diselesaikan dari letak berkas yang
 *      memuatnya — yang membuat aturan `.changesets/` ("tautan ditulis dari
 *      sudut pandang `.changesets/`") ikut terjaga tanpa pengecualian khusus.
 *   2. **Indeks ADR lengkap dua arah.** Setiap `docs/adr/NNNN-*.md` harus
 *      tercatat di tabel `docs/adr/README.md`, dan setiap baris tabel harus
 *      menunjuk berkas yang ada. Satu arah saja tidak cukup: cacat 3 Agustus
 *      2026 melanggar KEDUANYA sekaligus.
 *   3. **Status di tabel setuju dengan status di ADR-nya.** Tabel yang menulis
 *      "Diterima" untuk ADR yang sudah `Superseded` lebih berbahaya daripada
 *      tabel yang tidak menyebut status sama sekali — ia dibaca sebagai
 *      keputusan yang masih berlaku. Status yang tidak dikenal DILAPORKAN,
 *      bukan dilewati diam-diam.
 *   4. **Daftar permukaan kilau sama persis di CSS dan di dokumen.**
 *      `ui-ux-design-system.md` menyebut daftar itu "kontrak, bukan kumpulan
 *      kebetulan", menunjuk penanda di `src/styles/global.css`, dan mengakui
 *      terus terang bahwa pemeriksanya belum ada — "jadi kesesuaiannya saat ini
 *      dijaga mata pembaca kode, dan itu berarti ia akan menyimpang". Ia sudah
 *      menyimpang: tabelnya mendaftarkan `.wilayah-filter-btn`, permukaan repo
 *      rujukan yang tidak pernah ada di sini. Gerbang ini yang diminta dokumen
 *      itu sendiri.
 *   5. **Jalur berkas yang disebut dokumen harus ada.** Bukan tautan — span
 *      kode seperti `` `src/lib/content.ts` ``. Dokumen di sini memerikan
 *      berkas jauh lebih sering daripada menautkannya, dan repo ini sudah
 *      menemukan empat kali dokumen yang menyatakan sesuatu yang tidak ada
 *      dalam satu hari. Jalur milik `awcms` dan repo rujukan **wajib** ada di
 *      `JALUR_DIKECUALIKAN` beserta alasan yang menyebut miliknya siapa.
 *      Pengecualian yang membusuk — tidak lagi disebut dokumen mana pun —
 *      menutupi jalur yang kelak benar-benar hilang, jadi ia ikut dijaga; tetapi
 *      di `tests/audit-dokumen.test.mjs`, bukan di sini, karena daftarnya milik
 *      repo ini sementara gerbang ini harus tetap benar atas pohon mana pun.
 *
 * ## Yang sengaja TIDAK diperiksa
 *
 *   - **URL eksternal.** Memeriksanya butuh jaringan, dan gerbang yang gagal
 *     karena situs pihak ketiga sedang mati adalah gerbang yang orang belajar
 *     mengabaikan.
 *   - **Anchor (`#bagian`).** Slugifikasi heading berbeda antar renderer, jadi
 *     memeriksanya berarti menebak aturan GitHub. Bagian berkas dari sebuah
 *     tautan ber-anchor TETAP diperiksa; anchor-nya dibuang.
 *
 * Jalankan: `bun run audit:dokumen`. Tidak butuh build, tidak butuh jaringan,
 * tidak butuh `awcms` — ia berjalan di job `check` CI.
 *
 * Argumen opsional pertama adalah akar yang diperiksa (default `.`); itu yang
 * membuat `tests/audit-dokumen.test.mjs` bisa menjalankannya atas pohon fixture
 * dan membuktikan tiap gerbang benar-benar MERAH saat cacatnya dikembalikan.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { posix } from "node:path";

const AKAR = process.argv[2] ?? ".";

/** Direktori yang tidak pernah dibaca: bukan sumber, atau bukan milik repo ini. */
const LEWATI = new Set([
  "node_modules",
  ".git",
  ".astro",
  "dist",
  "graphify-out"
]);

/** @type {Array<{ gerbang: string, berkas: string, pesan: string }>} */
const temuan = [];
/** Dicetak apa pun hasilnya — gerbang yang diam saat tidak jalan tidak ada. */
const catatan = [];

function langgar(gerbang, berkas, pesan) {
  temuan.push({ gerbang, berkas, pesan });
}

function gabung(...bagian) {
  return posix.join(...bagian);
}

/** Seluruh `.md` di bawah `AKAR`, jalur relatif terhadapnya. */
function berkasMarkdown(dir = "") {
  const absolut = dir ? gabung(AKAR, dir) : AKAR;
  /** @type {string[]} */
  const hasil = [];

  // Direktori bertitik TIDAK dilewati begitu saja: `.changesets/` dan
  // `.github/` sama-sama memuat markdown ber-tautan, dan `.changesets/` justru
  // punya aturan tautan sendiri yang perlu dijaga.
  for (const entri of readdirSync(absolut, { withFileTypes: true })) {
    if (LEWATI.has(entri.name)) continue;

    const relatif = dir ? gabung(dir, entri.name) : entri.name;

    if (entri.isDirectory()) hasil.push(...berkasMarkdown(relatif));
    else if (entri.name.endsWith(".md")) hasil.push(relatif);
  }

  return hasil;
}

/**
 * Tautan markdown di sebuah berkas.
 *
 * Dua bentuk ditangkap, karena keduanya dipakai repo ini: inline `[teks](jalur)`
 * — termasuk gambar `![alt](jalur)` — dan definisi rujukan `[label]: jalur`.
 * Blok kode dibuang lebih dulu: `docs/` memuat contoh perintah dan cuplikan
 * konfigurasi yang bentuknya menyerupai tautan tanpa pernah menjadi tautan.
 */
function tautanDi(isi) {
  const tanpaKode = isi
    .replace(/```[\s\S]*?```/g, "")
    .replace(/(^|[^`])`[^`\n]*`/g, "$1");

  /** @type {string[]} */
  const hasil = [];

  for (const cocok of tanpaKode.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    hasil.push(cocok[1]);
  }
  for (const cocok of tanpaKode.matchAll(/^\[[^\]]+\]:\s*(\S+)/gm)) {
    hasil.push(cocok[1]);
  }

  return hasil;
}

/** true untuk apa pun yang bukan jalur berkas di repo ini. */
function eksternal(tautan) {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(tautan) || tautan.startsWith("#") || tautan === ""
  );
}

function beradaDi(jalur) {
  const penuh = gabung(AKAR, jalur);
  return existsSync(penuh);
}

// ---------------------------------------------------------------------------
// 1. Tautan relatif mati
// ---------------------------------------------------------------------------

function auditTautan(berkas) {
  let jumlah = 0;

  for (const nama of berkas) {
    const isi = readFileSync(gabung(AKAR, nama), "utf8");

    for (const tautan of new Set(tautanDi(isi))) {
      if (eksternal(tautan)) continue;

      // Anchor dibuang; bagian berkasnya tetap diperiksa. Tautan yang HANYA
      // anchor sudah tersaring `eksternal`.
      const jalurSaja = decodeURI(tautan.split("#")[0]);
      if (jalurSaja === "") continue;

      jumlah += 1;

      // `/docs/x.md` di markdown GitHub berarti akar repo, bukan akar disk.
      const target = jalurSaja.startsWith("/")
        ? jalurSaja.slice(1)
        : posix.normalize(gabung(posix.dirname(nama), jalurSaja));

      if (target.startsWith("..")) {
        langgar("tautan-mati", nama, `${tautan} keluar dari akar repo`);
        continue;
      }

      if (!beradaDi(target)) {
        langgar("tautan-mati", nama, `menunjuk ${tautan} yang tidak ada`);
      }
    }
  }

  catatan.push(`${berkas.length} berkas markdown, ${jumlah} tautan internal diperiksa`);
}

// ---------------------------------------------------------------------------
// 2 & 3. Indeks ADR
// ---------------------------------------------------------------------------

/** `- **Status:** Accepted` → `Accepted`; baris pertama saja. */
function statusAdr(isi) {
  return isi.match(/^-\s+\*\*Status:\*\*\s*(.+)$/m)?.[1]?.trim() ?? "";
}

/**
 * Status di berkas ADR → kata yang harus muncul di kolom Status tabel.
 *
 * Dipetakan alih-alih dibandingkan mentah karena berkas ADR menulis status
 * dalam bahasa Inggris sementara tabelnya berbahasa Indonesia — itu keadaan
 * yang ada hari ini, dan gerbang yang menuntut keseragaman bahasa akan menolak
 * setiap ADR yang sudah mendarat.
 */
const PADANAN = [
  { awalan: "accepted", kata: "Diterima" },
  { awalan: "proposed", kata: "Diusulkan" },
  { awalan: "superseded", kata: "Digantikan" },
  { awalan: "deprecated", kata: "Usang" },
  { awalan: "rejected", kata: "Ditolak" }
];

function auditIndeksAdr() {
  const dirAdr = "docs/adr";
  const indeks = gabung(dirAdr, "README.md");

  if (!existsSync(gabung(AKAR, dirAdr)) || !existsSync(gabung(AKAR, indeks))) {
    catatan.push(`adr: ${indeks} tidak ada — gerbang indeks ADR DILEWATI`);
    return;
  }

  const berkasAdr = readdirSync(gabung(AKAR, dirAdr))
    .filter((nama) => /^\d{4}-.+\.md$/.test(nama))
    .sort();

  const isiIndeks = readFileSync(gabung(AKAR, indeks), "utf8");

  /** @type {Map<string, { nomor: string, status: string }>} */
  const baris = new Map();

  for (const cocok of isiIndeks.matchAll(
    /^\|\s*\[(\d{4})\]\(([^)]+)\)\s*\|([^|]*)\|([^|]*)\|/gm
  )) {
    baris.set(cocok[2].trim(), { nomor: cocok[1], status: cocok[4].trim() });
  }

  // Arah 1: tiap baris tabel menunjuk berkas yang ada, dan nomornya cocok.
  for (const [target, { nomor }] of baris) {
    if (!berkasAdr.includes(target)) {
      langgar(
        "indeks-adr",
        indeks,
        `baris ${nomor} menunjuk ${target} yang tidak ada di ${dirAdr}/`
      );
      continue;
    }
    if (!target.startsWith(nomor)) {
      langgar("indeks-adr", indeks, `baris ${nomor} menunjuk ${target}`);
    }
  }

  // Arah 2: tiap ADR yang ada tercatat di tabel.
  for (const nama of berkasAdr) {
    if (!baris.has(nama)) {
      langgar("indeks-adr", indeks, `${nama} tidak tercatat di tabel`);
    }
  }

  // 3. Status tabel setuju dengan status di berkasnya.
  for (const nama of berkasAdr) {
    const dicatat = baris.get(nama);
    if (!dicatat) continue;

    const status = statusAdr(readFileSync(gabung(AKAR, dirAdr, nama), "utf8"));

    if (status === "") {
      langgar("status-adr", `${dirAdr}/${nama}`, "tanpa baris `- **Status:**`");
      continue;
    }

    const padanan = PADANAN.find(({ awalan }) =>
      status.toLowerCase().startsWith(awalan)
    );

    if (!padanan) {
      langgar(
        "status-adr",
        `${dirAdr}/${nama}`,
        `status "${status}" tidak dikenal — tambahkan padanannya di scripts/audit-dokumen.mjs`
      );
      continue;
    }

    if (!dicatat.status.includes(padanan.kata)) {
      langgar(
        "status-adr",
        indeks,
        `${nama} berstatus "${status}" tetapi tabel menulis "${dicatat.status}"`
      );
    }
  }

  catatan.push(`adr: ${berkasAdr.length} berkas, ${baris.size} baris tabel`);
}

// ---------------------------------------------------------------------------
// 4. Daftar permukaan kilau — CSS vs dokumen
// ---------------------------------------------------------------------------

const CSS_KILAU = "src/styles/global.css";
const DOK_KILAU = "docs/awcms-astro/ui-ux-design-system.md";

/** Isi di antara sepasang penanda, atau `undefined` bila penandanya tak lengkap. */
function antaraPenanda(isi, mulai, selesai) {
  const awal = isi.indexOf(mulai);
  const akhir = isi.indexOf(selesai);
  if (awal === -1 || akhir === -1 || akhir < awal) return undefined;
  return isi.slice(awal + mulai.length, akhir);
}

/**
 * Daftar selector di depan `{` pada blok CSS bertanda.
 *
 * Dibaca sampai `{` pertama, bukan seluruh blok: yang menjadi kontrak adalah
 * daftar permukaannya, bukan properti yang diberikan kepadanya.
 */
function permukaanCss(blok) {
  const daftar = blok.split("{")[0];
  return daftar
    .split(",")
    .map((bagian) => bagian.trim())
    .filter(Boolean);
}

/** Kolom pertama tiap baris tabel markdown bertanda, tanpa backtick. */
function permukaanDokumen(blok) {
  /** @type {string[]} */
  const hasil = [];

  for (const baris of blok.split("\n")) {
    const kolom = baris.match(/^\|([^|]+)\|/)?.[1]?.trim();
    if (!kolom) continue;
    if (/^-+$/.test(kolom) || kolom === "Permukaan") continue;
    hasil.push(kolom.replace(/`/g, "").trim());
  }

  return hasil;
}

function auditPermukaanKilau() {
  const adaCss = existsSync(gabung(AKAR, CSS_KILAU));
  const adaDok = existsSync(gabung(AKAR, DOK_KILAU));

  if (!adaCss && !adaDok) {
    catatan.push("kilau: berkas CSS maupun dokumennya tidak ada — gerbang permukaan DILEWATI");
    return;
  }

  // Satu ada, satu tidak, adalah keadaan yang TIDAK boleh lewat diam-diam:
  // kontrak yang salah satu sisinya hilang bukan kontrak yang terpenuhi.
  if (!adaCss || !adaDok) {
    langgar(
      "permukaan-kilau",
      adaCss ? DOK_KILAU : CSS_KILAU,
      "hilang sementara pasangannya ada — daftar permukaan tidak bisa dibandingkan"
    );
    return;
  }

  const blokCss = antaraPenanda(
    readFileSync(gabung(AKAR, CSS_KILAU), "utf8"),
    "/* kilau:permukaan:mulai */",
    "/* kilau:permukaan:selesai */"
  );
  const blokDok = antaraPenanda(
    readFileSync(gabung(AKAR, DOK_KILAU), "utf8"),
    "<!-- kilau:permukaan:mulai -->",
    "<!-- kilau:permukaan:selesai -->"
  );

  if (blokCss === undefined || blokDok === undefined) {
    langgar(
      "permukaan-kilau",
      blokCss === undefined ? CSS_KILAU : DOK_KILAU,
      "penanda `kilau:permukaan:mulai`/`:selesai` tidak lengkap"
    );
    return;
  }

  const dariCss = permukaanCss(blokCss);
  const dariDok = permukaanDokumen(blokDok);

  for (const permukaan of dariCss) {
    if (!dariDok.includes(permukaan)) {
      langgar("permukaan-kilau", DOK_KILAU, `\`${permukaan}\` ada di CSS tetapi tidak di tabel`);
    }
  }

  for (const permukaan of dariDok) {
    if (!dariCss.includes(permukaan)) {
      langgar("permukaan-kilau", DOK_KILAU, `tabel mendaftarkan \`${permukaan}\` yang tidak ada di CSS`);
    }
  }

  catatan.push(`kilau: ${dariCss.length} permukaan di CSS, ${dariDok.length} baris tabel`);
}

// ---------------------------------------------------------------------------
// 5. Jalur berkas yang disebut dokumen harus ada
// ---------------------------------------------------------------------------

/**
 * Jalur yang boleh disebut walau tidak ada di repo ini, beserta alasannya.
 *
 * Daftar ini yang membedakan gerbang dari gangguan. Sebagian besar jalur yang
 * hilang **bukan** cacat: dokumen di sini membandingkan diri dengan `awcms` dan
 * dengan repo rujukan, dan perbandingan itu justru isinya. Tanpa pengecualian
 * ber-alasan, gerbang ini akan memerahkan tiap kalimat yang menyebut berkas
 * repo lain — lalu orang akan mematikannya, dan bersamanya cacat yang nyata.
 *
 * Aturan menambah baris: **alasannya wajib menyebut MILIK SIAPA jalur itu.**
 * "Belum dibuat" bukan alasan — itu justru yang gerbang ini cari.
 */
const JALUR_DIKECUALIKAN = new Map([
  ["docs/PROJECT_STATE.md", "milik `awcms` (indikator pencabutan ADR-0021 dibaca di sana) DAN bentuk standar keluarga yang repo ini sengaja tidak bawa — `standar-teknis.md` §Dokumentasi menyebut siapa yang memikul perannya di sini"],
  ["tests/admin-navigation-registry.test.ts", "milik `awcms` — gerbang yang menegakkan kriteria 1"],
  ["docs/awcms/14_ui_ux_design_system.md", "milik `awcms` — sumber standar UI keluarga"],
  ["src/lib/security/security-headers.ts", "milik `awcms` — asal `BASE_CSP_DIRECTIVES` yang ADR-0019 selaraskan"],
  ["scripts/kartu-share.mjs", "milik repo rujukan — disebut PERSIS karena tidak ada di sini"],
  ["src/content.config.ts", "bentuk konten-di-repo yang repo ini gantikan — disebut untuk menjelaskan penggantinya"],
  ["docs/ARCHITECTURE.md", "dokumen yang checklist minta DIBUAT situs turunan, bukan yang template ini bawa"],
  ["docs/adr/x.md", "placeholder contoh di `.changesets/README.md`, bukan jalur sungguhan"]
]);

/** Awalan yang menandai sebuah span kode sebagai jalur berkas repo. */
const AWALAN_JALUR = ["src/", "scripts/", "server/", "tests/", "public/", "docs/", "infra/"];

function auditJalurDisebut(berkas) {
  let diperiksa = 0;
  const dipakai = new Set();

  for (const nama of berkas) {
    const isi = readFileSync(gabung(AKAR, nama), "utf8").replace(/```[\s\S]*?```/g, "");

    for (const cocok of isi.matchAll(/`([A-Za-z0-9_./*-]+)`/g)) {
      const jalur = cocok[1];

      if (!AWALAN_JALUR.some((awalan) => jalur.startsWith(awalan))) continue;

      // Jalur berakhiran `/` memerikan BENTUK standar keluarga (blok "Struktur
      // wajib"), bukan berkas repo ini; `*` adalah pola, bukan jalur. Keduanya
      // dilewati, dan itu disebut supaya tidak dikira terjaga.
      if (jalur.endsWith("/") || jalur.includes("*")) continue;

      if (JALUR_DIKECUALIKAN.has(jalur)) {
        dipakai.add(jalur);
        continue;
      }

      diperiksa += 1;

      if (!beradaDi(jalur)) {
        langgar("jalur-disebut", nama, `menyebut \`${jalur}\` yang tidak ada di repo ini`);
      }
    }
  }

  // Pengecualian yang tidak lagi dipakai adalah pengecualian yang membusuk: ia
  // berhenti dibaca, lalu menutupi jalur yang kelak benar-benar hilang. Yang
  // menegakkannya `tests/audit-dokumen.test.mjs`, BUKAN gerbang ini — daftarnya
  // milik repo ini, sementara gerbang ini harus tetap benar saat dijalankan
  // atas pohon mana pun (fixture tes, dan situs turunan yang dokumennya lain).
  catatan.push(
    `jalur: ${diperiksa} span diperiksa, ${dipakai.size}/${JALUR_DIKECUALIKAN.size} pengecualian terpakai`
  );
}

// ---------------------------------------------------------------------------
// Jalankan
// ---------------------------------------------------------------------------

if (!existsSync(AKAR) || !statSync(AKAR).isDirectory()) {
  console.error(`akar "${AKAR}" bukan direktori`);
  process.exit(2);
}

const dokumen = berkasMarkdown();

auditTautan(dokumen);
auditIndeksAdr();
auditPermukaanKilau();
auditJalurDisebut(dokumen);

console.log("── audit dokumen ──");
for (const baris of catatan) console.log(`  ${baris}`);

if (temuan.length === 0) {
  console.log("\n✓ Tidak ada pelanggaran.");
  process.exit(0);
}

console.log(`\n✗ ${temuan.length} pelanggaran:\n`);

/** @type {Map<string, Array<{ berkas: string, pesan: string }>>} */
const perGerbang = new Map();
for (const t of temuan) {
  perGerbang.set(t.gerbang, [...(perGerbang.get(t.gerbang) ?? []), t]);
}

for (const [gerbang, daftar] of perGerbang) {
  console.log(`  [${gerbang}] ${daftar.length}`);
  for (const { berkas, pesan } of daftar) console.log(`    ${berkas}: ${pesan}`);
  console.log("");
}

process.exit(1);
