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
// Jalankan
// ---------------------------------------------------------------------------

if (!existsSync(AKAR) || !statSync(AKAR).isDirectory()) {
  console.error(`akar "${AKAR}" bukan direktori`);
  process.exit(2);
}

auditTautan(berkasMarkdown());
auditIndeksAdr();

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
