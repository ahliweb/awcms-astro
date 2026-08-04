#!/usr/bin/env bun
/**
 * Gerbang audit graf — memeriksa artefak `graphify-out/` yang repo ini LACAK.
 *
 * ## Kenapa berkas ini ada
 *
 * Repo ini melacak empat keluaran graphify (`graph.json`, `GRAPH_REPORT.md`,
 * `manifest.json`, `cost.json`) dan sengaja tidak melacak sisanya — tiga aturan
 * ber-alasan di `.gitignore`, ditulis setelah sebuah run meninggalkan
 * `graphify-out/cache/` sebagai direktori untracked. Ketiganya **tidak punya
 * pemeriksa**, dan ADR-0030 menyebut kondisi itu dengan namanya: aturan yang
 * hanya tertulis akan dilanggar cepat atau lambat.
 *
 * Yang membuatnya mendesak bukan hipotesis. Saat gerbang ini ditulis, **60 dari
 * 101 label komunitas di `graph.json` menempel pada komunitas yang salah** —
 * warisan clustering lama yang tak pernah divalidasi. Komunitas 6 bernama
 * `content-blocks.ts` sementara isinya seluruhnya dari
 * `standar-performa-dan-keamanan.md`; komunitas 22 bernama
 * `Kontrak BFF /_portal-api/**` sementara pusatnya `Pedoman Perilaku`. Tiga
 * komunitas berbeda sama-sama bernama `BaseLayout.astro`.
 *
 * Tidak ada yang bisa menangkapnya. Artefaknya JSON yang sah, laporannya rapi,
 * dan setiap gerbang lain hijau — karena tidak satu pun dari mereka membaca
 * `graphify-out/`. Nama komunitas bukan hiasan: itu yang dibaca `graphify
 * query`, konsumen GraphRAG, dan siapa pun yang memakai graf ini untuk mencari
 * jalan. Graf yang salah menamai dirinya sendiri lebih buruk daripada tidak ada
 * graf, karena ia menjawab dengan percaya diri.
 *
 * ## Yang diperiksa
 *
 *   1. **Hanya empat artefak bersama yang terlacak.** `git ls-files
 *      graphify-out` harus mengembalikan persis `GRAPH_REPORT.md`,
 *      `cost.json`, `graph.json`, `manifest.json`. Ini yang menegakkan ketiga
 *      aturan `.gitignore` tadi — cache, berkas ber-titik, salinan bertanggal,
 *      dan `graph.html` masing-masing punya alasan tertulis untuk tidak
 *      terlacak, dan sekarang punya pemeriksanya.
 *   2. **Laporan dan graf berasal dari run yang sama.** Baris Summary di
 *      `GRAPH_REPORT.md` menyebut jumlah node, edge, dan komunitas; `graph.json`
 *      memuat ketiganya. Bila berbeda, salah satunya basi — dan pembaca tidak
 *      punya cara tahu yang mana.
 *   3. **Setiap komunitas punya nama yang benar-benar dipilih.** Empat aturan,
 *      masing-masing karena melanggarnya menghasilkan graf yang terbaca benar
 *      dan ternavigasi salah:
 *        - bukan nama berkas (`client.ts`, `BaseLayout.astro`) — itu keluaran
 *          `label_communities_by_hub`, penamaan otomatis yang gratis dan tidak
 *          pernah membaca komunitasnya;
 *        - bukan placeholder `Community N`;
 *        - tidak ada dua komunitas bernama sama — nama kembar membuat keduanya
 *          tak terbedakan oleh setiap konsumen hilir;
 *        - nama di `graph.json` sama dengan nama di `GRAPH_REPORT.md` untuk
 *          komunitas yang sama.
 *   4. **Yang dikecualikan tetap dikecualikan.** Tidak ada node yang
 *      `source_file`-nya berada di bawah entri `.graphifyignore`. Sebuah rebuild
 *      yang dijalankan tanpa berkas itu — atau dari direktori lain — memasukkan
 *      kembali apa yang sengaja dibuang, dan diam-diam menggelembungkan graf.
 *
 * ## Yang sengaja TIDAK diperiksa
 *
 *   - **Kesegaran sebagai pelanggaran.** Selisih antara `built_at_commit` dan
 *     `HEAD` DILAPORKAN sebagai catatan, tidak pernah memerahkan gerbang.
 *     Memerahkannya berarti setiap PR yang menyentuh berkas terindeks wajib
 *     membawa rebuild bermegabyte, dan gerbang semahal itu akan dilonggarkan
 *     dalam sebulan — persis yang §Gerbang mutu larang. Yang dijaga di sini
 *     adalah **kebenaran internal** artefaknya; kapan ia dibangun ulang adalah
 *     keputusan sadar, dan catatannya membuat keputusan itu terlihat.
 *   - **Kualitas nama di luar bentuknya.** Gerbang ini bisa membuktikan sebuah
 *     label BUKAN nama berkas; ia tidak bisa menilai apakah "Kontrak BFF" nama
 *     yang baik untuk komunitasnya. Penamaan tetap pekerjaan pembaca — yang
 *     dijaga di sini hanya bahwa pekerjaan itu benar-benar dilakukan.
 *   - **Pola glob di `.graphifyignore`.** Hanya entri berbentuk direktori atau
 *     jalur yang ditegakkan. Pola ber-`*`/`?`/`[` DILAPORKAN sebagai tidak
 *     ditegakkan, bukan dilewati diam-diam — pengecualian yang tampak terjaga
 *     padahal tidak lebih berbahaya daripada yang jelas-jelas manual.
 *
 * Jalankan: `bun run audit:graf`. Tidak butuh build, tidak butuh jaringan,
 * tidak butuh `awcms`, tidak butuh graphify terpasang — ia hanya membaca
 * artefak yang sudah ada di repo, jadi ia berjalan di job `check` CI.
 *
 * Repo tanpa `graphify-out/` LULUS dengan catatan. Itu keadaan sah untuk situs
 * turunan: `docs/awcms-astro/checklist-repo-baru.md` menyuruh menghapusnya.
 *
 * Argumen opsional pertama adalah akar yang diperiksa (default `.`); itu yang
 * membuat `tests/audit-graf.test.mjs` bisa menjalankannya atas pohon fixture
 * dan membuktikan tiap gerbang benar-benar MERAH saat cacatnya dikembalikan.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const AKAR = process.argv[2] ?? ".";
const KELUARAN = "graphify-out";

/**
 * Artefak graphify yang repo ini lacak, dan hanya itu.
 *
 * Daftarnya diambil dari `.gitignore`, yang menulis alasan tiap pengecualian:
 * keluaran bersama bernama tanpa titik, sementara cache, berkas ber-titik,
 * salinan bertanggal, dan `graph.html` masing-masing punya alasan sendiri untuk
 * tinggal di luar riwayat.
 */
const ARTEFAK_TERLACAK = new Set([
  "GRAPH_REPORT.md",
  "cost.json",
  "graph.json",
  "manifest.json"
]);

/**
 * Akhiran yang membuat sebuah label komunitas ketahuan sebagai nama berkas.
 *
 * Sengaja daftar akhiran, bukan tebakan pintar: sebuah nama bahasa manusia yang
 * kebetulan diakhiri `.md` praktis tidak ada, sementara heuristik yang lebih
 * longgar akan memerahkan nama yang sah dan mengajari orang mengabaikan gerbang
 * ini.
 */
const AKHIRAN_BERKAS =
  /\.(ts|tsx|js|mjs|cjs|jsx|astro|json|jsonc|md|mdx|ya?ml|toml|css|scss|html|py|sh|lock)$/i;

/** @type {Array<{ gerbang: string, berkas: string, pesan: string }>} */
const temuan = [];
/** Dicetak apa pun hasilnya — gerbang yang diam saat tidak jalan tidak ada. */
const catatan = [];

function langgar(gerbang, berkas, pesan) {
  temuan.push({ gerbang, berkas, pesan });
}

function bacaJson(jalur) {
  return JSON.parse(readFileSync(jalur, "utf8"));
}

function git(...argumen) {
  const hasil = Bun.spawnSync(["git", "-C", AKAR, ...argumen], {
    stderr: "pipe",
    stdout: "pipe"
  });
  if (hasil.exitCode !== 0) return null;
  return hasil.stdout.toString();
}

// ---------------------------------------------------------------------------
// 1. Hanya empat artefak bersama yang terlacak
// ---------------------------------------------------------------------------

function auditArtefakTerlacak() {
  const keluaran = git("ls-files", "--", KELUARAN);

  // Bukan repo git (pohon fixture, tarball) — gerbang ini tidak bisa dijawab.
  // Ia MENGATAKAN begitu; gerbang yang lolos diam-diam saat tidak bisa jalan
  // adalah tanda centang palsu.
  if (keluaran === null) {
    catatan.push("terlacak: DILEWATI — bukan repo git, `git ls-files` tak bisa dijalankan");
    return;
  }

  const terlacak = keluaran.split("\n").filter(Boolean);

  if (terlacak.length === 0) {
    catatan.push(`terlacak: tidak ada berkas ${KELUARAN}/ yang terlacak`);
    return;
  }

  let sah = 0;
  for (const jalur of terlacak) {
    const nama = jalur.slice(`${KELUARAN}/`.length);

    if (ARTEFAK_TERLACAK.has(nama)) {
      sah += 1;
      continue;
    }

    // Pesannya menyebut aturan yang dilanggar, bukan sekadar "tidak boleh":
    // yang dibaca orang saat gerbang merah adalah barisnya, bukan `.gitignore`.
    const alasan = nama.startsWith(".")
      ? "berkas ber-titik adalah intermediate/penanda, tidak pernah keluaran bersama"
      : nama.startsWith("cache/")
        ? "cache spesifik mesin, tidak pernah masuk riwayat"
        : /^\d{4}-\d{2}-\d{2}\//.test(nama)
          ? "salinan bertanggal adalah duplikat penuh artefak hidup di sebelahnya"
          : nama === "graph.html"
            ? "graph.html berhenti dipancarkan di atas batas node dan lalu membusuk diam-diam"
            : "bukan salah satu dari empat artefak bersama";

    langgar("terlacak", jalur, `terlacak padahal ${alasan}`);
  }

  const hilang = [...ARTEFAK_TERLACAK].filter(
    (nama) => !terlacak.includes(`${KELUARAN}/${nama}`)
  );
  for (const nama of hilang) {
    langgar("terlacak", `${KELUARAN}/${nama}`, "artefak bersama tidak terlacak");
  }

  catatan.push(`terlacak: ${sah}/${ARTEFAK_TERLACAK.size} artefak bersama, ${terlacak.length} berkas terlacak`);
}

// ---------------------------------------------------------------------------
// 2. Laporan dan graf berasal dari run yang sama
// ---------------------------------------------------------------------------

/** Jumlah yang diklaim baris Summary `GRAPH_REPORT.md`, atau `null`. */
function ringkasanLaporan(isi) {
  const cocok = isi.match(/^- (\d+) nodes · (\d+) edges · (\d+) communities/m);
  if (!cocok) return null;
  return { node: +cocok[1], edge: +cocok[2], komunitas: +cocok[3] };
}

function auditLaporanSepakat(graf, laporan) {
  const diklaim = ringkasanLaporan(laporan);

  if (!diklaim) {
    langgar(
      "laporan-sepakat",
      `${KELUARAN}/GRAPH_REPORT.md`,
      "tidak punya baris Summary `- N nodes · N edges · N communities`"
    );
    return;
  }

  const nyata = {
    node: graf.nodes.length,
    edge: (graf.links ?? []).length,
    komunitas: new Set(
      graf.nodes.map((n) => n.community).filter((c) => c !== undefined && c !== null)
    ).size
  };

  for (const [bidang, label] of [
    ["node", "node"],
    ["edge", "edge"],
    ["komunitas", "komunitas"]
  ]) {
    if (diklaim[bidang] !== nyata[bidang]) {
      langgar(
        "laporan-sepakat",
        `${KELUARAN}/GRAPH_REPORT.md`,
        `menyebut ${diklaim[bidang]} ${label}, graph.json memuat ${nyata[bidang]}`
      );
    }
  }

  catatan.push(
    `sepakat: laporan ${diklaim.node}/${diklaim.edge}/${diklaim.komunitas} vs graf ${nyata.node}/${nyata.edge}/${nyata.komunitas} (node/edge/komunitas)`
  );
}

// ---------------------------------------------------------------------------
// 3. Setiap komunitas punya nama yang benar-benar dipilih
// ---------------------------------------------------------------------------

/** `{ id → label }` dari heading `### Community N - "label"` di laporan. */
function namaDiLaporan(isi) {
  /** @type {Map<number, string>} */
  const peta = new Map();
  for (const baris of isi.split("\n")) {
    const cocok = baris.match(/^### Community (\d+) - "(.*)"\s*$/);
    if (cocok) peta.set(+cocok[1], cocok[2]);
  }
  return peta;
}

function auditLabelKomunitas(graf, laporan) {
  /** @type {Map<number, string|undefined>} */
  const namaDiGraf = new Map();
  for (const node of graf.nodes) {
    const id = node.community;
    if (id === undefined || id === null) continue;
    if (!namaDiGraf.has(id)) namaDiGraf.set(id, node.community_name);
  }

  if (namaDiGraf.size === 0) {
    catatan.push("label: tidak ada komunitas di graph.json");
    return;
  }

  const dariLaporan = namaDiLaporan(laporan);

  /** @type {Map<string, number[]>} */
  const pemakai = new Map();

  for (const [id, nama] of [...namaDiGraf].sort((a, b) => a[0] - b[0])) {
    const berkas = `${KELUARAN}/graph.json`;

    if (nama === undefined || nama === null || nama === "") {
      langgar("label", berkas, `komunitas ${id} tanpa community_name`);
      continue;
    }

    if (nama === `Community ${id}`) {
      langgar("label", berkas, `komunitas ${id} masih placeholder "${nama}"`);
    } else if (AKHIRAN_BERKAS.test(nama)) {
      langgar(
        "label",
        berkas,
        `komunitas ${id} bernama "${nama}" — itu nama berkas (keluaran penamaan hub), bukan nama yang dipilih`
      );
    }

    pemakai.set(nama, [...(pemakai.get(nama) ?? []), id]);

    // Laporan hanya memuat komunitas yang cukup tebal untuk ditampilkan; yang
    // tipis sengaja dihilangkan. Jadi ketidakhadiran BUKAN pelanggaran —
    // ketidaksepakatan yang iya.
    const diLaporan = dariLaporan.get(id);
    if (diLaporan !== undefined && diLaporan !== nama) {
      langgar(
        "label",
        `${KELUARAN}/GRAPH_REPORT.md`,
        `komunitas ${id} bernama "${diLaporan}" di laporan tetapi "${nama}" di graph.json`
      );
    }
  }

  for (const [nama, ids] of pemakai) {
    if (ids.length > 1) {
      langgar(
        "label",
        `${KELUARAN}/graph.json`,
        `nama "${nama}" dipakai ${ids.length} komunitas sekaligus (${ids.join(", ")})`
      );
    }
  }

  catatan.push(`label: ${namaDiGraf.size} komunitas, ${pemakai.size} nama berbeda`);
}

// ---------------------------------------------------------------------------
// 4. Yang dikecualikan tetap dikecualikan
// ---------------------------------------------------------------------------

function auditPengecualian(graf) {
  const berkasIgnore = join(AKAR, ".graphifyignore");

  if (!existsSync(berkasIgnore)) {
    catatan.push("pengecualian: tidak ada .graphifyignore");
    return;
  }

  /** @type {string[]} */
  const awalan = [];
  /** @type {string[]} */
  const takDitegakkan = [];

  for (const baris of readFileSync(berkasIgnore, "utf8").split("\n")) {
    const pola = baris.trim();
    if (!pola || pola.startsWith("#")) continue;

    // Negasi mengembalikan berkas ke dalam korpus. graphify sendiri tidak
    // memakainya di berkas ini (ia hanya bisa mengecualikan lebih), jadi
    // menemukannya berarti berkasnya salah paham — katakan, jangan tebak.
    if (pola.startsWith("!")) {
      takDitegakkan.push(pola);
      continue;
    }

    if (/[*?[\]]/.test(pola)) {
      takDitegakkan.push(pola);
      continue;
    }

    awalan.push(pola.replace(/^\/+/, "").replace(/\/+$/, ""));
  }

  // Dihitung per pengecualian, bukan per node. Satu rebuild yang lupa
  // `.graphifyignore` melanggar SEKALI dan menyeret ratusan node ikut; mencetak
  // ratusan baris untuk satu sebab mengubur gerbang lain di bawahnya. Yang
  // dibutuhkan pembaca adalah entri mana, berapa node, dan satu contoh.
  /** @type {Map<string, { jumlah: number, berkas: Set<string>, contoh: string }>} */
  const pelanggar = new Map();

  for (const node of graf.nodes) {
    const sumber = node.source_file;
    if (typeof sumber !== "string" || sumber === "") continue;

    for (const awal of awalan) {
      if (sumber === awal || sumber.startsWith(`${awal}/`)) {
        const sebelumnya = pelanggar.get(awal);
        if (sebelumnya) {
          sebelumnya.jumlah += 1;
          sebelumnya.berkas.add(sumber);
        } else {
          pelanggar.set(awal, { jumlah: 1, berkas: new Set([sumber]), contoh: sumber });
        }
        break;
      }
    }
  }

  for (const [awal, { jumlah, berkas, contoh }] of pelanggar) {
    langgar(
      "pengecualian",
      `${KELUARAN}/graph.json`,
      `${jumlah} node dari ${berkas.size} berkas di bawah pengecualian \`${awal}\` (mis. ${contoh}) — graf dibangun ulang tanpa .graphifyignore?`
    );
  }

  catatan.push(
    `pengecualian: ${awalan.length} entri ditegakkan` +
      (takDitegakkan.length
        ? `, ${takDitegakkan.length} TIDAK ditegakkan (${takDitegakkan.join(", ")})`
        : "")
  );
}

// ---------------------------------------------------------------------------
// Catatan kesegaran — dilaporkan, tidak pernah memerahkan gerbang
// ---------------------------------------------------------------------------

function catatKesegaran(graf) {
  const dibangunDi = graf.built_at_commit;

  if (typeof dibangunDi !== "string" || dibangunDi === "") {
    catatan.push("kesegaran: graph.json tidak menyebut built_at_commit");
    return;
  }

  const pendek = dibangunDi.slice(0, 8);
  const jumlah = git("rev-list", "--count", `${dibangunDi}..HEAD`);

  if (jumlah === null) {
    catatan.push(`kesegaran: dibangun dari ${pendek}, selisih ke HEAD tak terbaca`);
    return;
  }

  const tertinggal = Number.parseInt(jumlah.trim(), 10);
  catatan.push(
    tertinggal === 0
      ? `kesegaran: dibangun dari ${pendek}, sama dengan HEAD`
      : `kesegaran: dibangun dari ${pendek}, tertinggal ${tertinggal} commit dari HEAD — pertimbangkan \`/graphify . --update\``
  );
}

// ---------------------------------------------------------------------------
// Jalankan
// ---------------------------------------------------------------------------

if (!existsSync(AKAR) || !statSync(AKAR).isDirectory()) {
  console.error(`akar "${AKAR}" bukan direktori`);
  process.exit(2);
}

console.log("── audit graf ──");

const dirKeluaran = join(AKAR, KELUARAN);

if (!existsSync(dirKeluaran)) {
  // Keadaan sah untuk situs turunan: checklist-repo-baru.md menyuruh
  // menghapusnya. Gerbang ini menjaga artefak yang ADA, bukan mewajibkannya.
  console.log(`  ${KELUARAN}/ tidak ada — tidak ada artefak graf untuk diperiksa`);
  console.log("\n✓ Tidak ada pelanggaran.");
  process.exit(0);
}

const jalurGraf = join(dirKeluaran, "graph.json");
const jalurLaporan = join(dirKeluaran, "GRAPH_REPORT.md");

auditArtefakTerlacak();

if (!existsSync(jalurGraf)) {
  langgar("artefak", `${KELUARAN}/graph.json`, "tidak ada padahal graphify-out/ ada");
} else if (!existsSync(jalurLaporan)) {
  langgar("artefak", `${KELUARAN}/GRAPH_REPORT.md`, "tidak ada padahal graph.json ada");
} else {
  /** @type {{ nodes: Array<Record<string, unknown>>, links?: unknown[], built_at_commit?: string }} */
  let graf;
  try {
    graf = bacaJson(jalurGraf);
  } catch (galat) {
    langgar("artefak", `${KELUARAN}/graph.json`, `tidak bisa dibaca sebagai JSON: ${galat.message}`);
    graf = null;
  }

  if (graf && !Array.isArray(graf.nodes)) {
    langgar("artefak", `${KELUARAN}/graph.json`, "tidak punya array `nodes`");
    graf = null;
  }

  if (graf) {
    const laporan = readFileSync(jalurLaporan, "utf8");
    auditLaporanSepakat(graf, laporan);
    auditLabelKomunitas(graf, laporan);
    auditPengecualian(graf);
    catatKesegaran(graf);
  }
}

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
