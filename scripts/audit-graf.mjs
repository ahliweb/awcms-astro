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
 *
 * ---------------------------------------------------------------------------
 * English addendum (issue #113 — knowledge/Obsidian export)
 * ---------------------------------------------------------------------------
 *
 * Two checks were added after the Indonesian docblock above was written, and
 * they change what "Yang diperiksa" / "Yang sengaja TIDAK diperiksa" mean —
 * both are amended here in English (new code in this repo is English,
 * post-ADR-0039; the existing Indonesian gates above are not translated).
 *
 * **Now also checked:**
 *
 *   5. **`knowledge/generated/` is never tracked, and neither is any
 *      `.obsidian/` path anywhere in the repo.** `knowledge:obsidian:export`
 *      writes an Obsidian vault of roughly 1,500 files into
 *      `knowledge/generated/graphify/`. This repo already refuses to commit
 *      comparably-sized generated output for the same reason — see
 *      `graph.html` and `redesign/` in `.gitignore`'s own comments: "a
 *      committed copy rots silently, and its size doubles every rebuild's
 *      load on history". A vault of ~1,500 files fails that precedent
 *      harder than either of them. This check is fail-closed by design: it
 *      is the enforcement that makes ADR-0051 (`knowledge/generated/` gitignored,
 *      never tracked) a real property of the repo rather than a sentence in
 *      an ADR nobody re-reads after the first export. `.obsidian/` (the
 *      Obsidian app's own workspace/session state — window layout, plugin
 *      settings, per-machine caches) is checked everywhere, not only under
 *      `knowledge/`, because nothing stops a developer opening the vault
 *      from a different working directory.
 *   6. **Bounded content staleness is now BOUNDED, not merely reported.**
 *      `checkStaleness` (further down) already existed here as
 *      `catatKesegaran` — a commit-distance NOTE that never reddens the
 *      gate, and that check stays exactly as it was: `built_at_commit` vs.
 *      `HEAD` says how long ago a rebuild happened, but says nothing about
 *      whether the tree actually changed. A repo that changed nothing in 200
 *      commits is not stale by any definition that matters, and the old
 *      check could not tell those two situations apart — it can only count
 *      commits, not content.
 *
 *      The new check, `diffManifestStaleness` (`scripts/lib/graf-staleness.mjs`),
 *      answers the question the old one could not: does `graphify-out/manifest.json`
 *      still describe the CURRENT bytes of the tree? It reproduces graphify's
 *      own per-file MD5 (`ast_hash`) with `node:crypto` — no `graphify`
 *      install needed, which matters because CI has none on `PATH` — and
 *      counts files changed, added, or removed since the graph was last
 *      built. Below or at `MAX_STALE_FILES` (40) it is still only a NOTE:
 *      that bound exists so ordinary day-to-day drift (a docs typo fix, one
 *      new script) never forces an unrelated PR to carry a multi-megabyte
 *      rebuild — the same reasoning the old `catatKesegaran` note gives for
 *      never failing on commit distance. Past the bound it becomes a
 *      VIOLATION, because at that size the graph's community structure and
 *      names have almost certainly drifted from what the tree now contains,
 *      and nothing else in this repo would ever notice — every other gate is
 *      green precisely because none of them reads `graphify-out/`. Both
 *      checks are kept side by side on purpose: one measures TIME since the
 *      last rebuild (informational — a stale-looking timestamp can still
 *      describe an unchanged tree), the other measures CONTENT drift
 *      (enforced past a bound — because content drift is the thing that
 *      actually makes the graph wrong).
 *
 * **Still deliberately NOT checked**, unchanged from the Indonesian section
 * above, plus one addition: this staleness bound is an UNDER-approximation
 * by construction. Candidates are git-tracked files whose extension the
 * manifest has already indexed at least once — a brand-new file whose
 * extension `graphify` has never seen here is not a staleness candidate at
 * all (there is nothing in the manifest to compare it against, and
 * reimplementing graphify's own file-type/noise-dir/secret-file
 * classification here would mean keeping a second copy of logic this repo
 * does not own in sync with a tool versioned independently of it). That
 * trade — perfect parity with graphify's own scan, for a rule this module
 * can state, test, and keep correct on its own — is the same one the
 * reference implementation this was ported from made, for the same reason.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gitLines, gitRun } from "./lib/git.mjs";
import { diffManifestStaleness } from "./lib/graf-staleness.mjs";
import { createReporter } from "./lib/reporter.mjs";

const AKAR = process.argv[2] ?? ".";
const KELUARAN = "graphify-out";

// Validated before the reporter is built, so an unusable root still exits 2
// with only its own message — the header belongs to a gate that is actually
// going to run.
if (!existsSync(AKAR) || !statSync(AKAR).isDirectory()) {
  console.error(`akar "${AKAR}" bukan direktori`);
  process.exit(2);
}

const pelapor = createReporter("audit graf");

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

function langgar(gerbang, berkas, pesan) {
  pelapor.violation(gerbang, berkas, pesan);
}

function catat(baris) {
  pelapor.note(baris);
}

function bacaJson(jalur) {
  return JSON.parse(readFileSync(jalur, "utf8"));
}

function git(...argumen) {
  return gitRun(AKAR, ...argumen);
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
    catat("terlacak: DILEWATI — bukan repo git, `git ls-files` tak bisa dijalankan");
    return;
  }

  const terlacak = keluaran.split("\n").filter(Boolean);

  if (terlacak.length === 0) {
    catat(`terlacak: tidak ada berkas ${KELUARAN}/ yang terlacak`);
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

  catat(`terlacak: ${sah}/${ARTEFAK_TERLACAK.size} artefak bersama, ${terlacak.length} berkas terlacak`);
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

  catat(
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
    catat("label: tidak ada komunitas di graph.json");
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

  catat(`label: ${namaDiGraf.size} komunitas, ${pemakai.size} nama berbeda`);
}

// ---------------------------------------------------------------------------
// 4. Yang dikecualikan tetap dikecualikan
// ---------------------------------------------------------------------------

function auditPengecualian(graf) {
  const berkasIgnore = join(AKAR, ".graphifyignore");

  if (!existsSync(berkasIgnore)) {
    catat("pengecualian: tidak ada .graphifyignore");
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

  catat(
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
    catat("kesegaran: graph.json tidak menyebut built_at_commit");
    return;
  }

  const pendek = dibangunDi.slice(0, 8);
  const jumlah = git("rev-list", "--count", `${dibangunDi}..HEAD`);

  if (jumlah === null) {
    catat(`kesegaran: dibangun dari ${pendek}, selisih ke HEAD tak terbaca`);
    return;
  }

  const tertinggal = Number.parseInt(jumlah.trim(), 10);
  catat(
    tertinggal === 0
      ? `kesegaran: dibangun dari ${pendek}, sama dengan HEAD`
      : `kesegaran: dibangun dari ${pendek}, tertinggal ${tertinggal} commit dari HEAD — pertimbangkan \`/graphify . --update\``
  );
}

// ---------------------------------------------------------------------------
// 5. knowledge/generated/ and .obsidian/ are never tracked (English — issue #113)
// ---------------------------------------------------------------------------

/**
 * Fail-closed check backing ADR-0051: `knowledge/generated/` (the
 * `knowledge:obsidian:export` sync target) must never be a git-tracked
 * path, and neither must any `.obsidian/` path anywhere in the repo (the
 * Obsidian app's own workspace/session state).
 *
 * Runs unconditionally, even when `graphify-out/` does not exist — it is a
 * property of the repo's git history, not of the graph artefact.
 */
function auditKnowledgeGeneratedUntracked() {
  const semuaTerlacak = git("ls-files");

  if (semuaTerlacak === null) {
    catat("knowledge-generated-untracked: SKIPPED — not a git repo, `git ls-files` could not run");
    return;
  }

  const terlacak = gitLines(semuaTerlacak);
  let pelanggar = 0;

  for (const jalur of terlacak) {
    if (jalur === "knowledge/generated" || jalur.startsWith("knowledge/generated/")) {
      langgar(
        "knowledge-generated-untracked",
        jalur,
        "tracked under knowledge/generated/ — that directory is generated Obsidian export output and must never enter history (ADR-0051); a full export of this graph runs to roughly 1,500 files, and this repo's own graph.html and redesign/ precedents (see .gitignore) already refuse far less than that"
      );
      pelanggar += 1;
      continue;
    }

    const segmen = jalur.split("/");
    if (segmen.includes(".obsidian")) {
      langgar(
        "knowledge-generated-untracked",
        jalur,
        "tracked and contains a .obsidian path segment — Obsidian's own app workspace/session state, never generated content, must never enter history"
      );
      pelanggar += 1;
    }
  }

  catat(
    pelanggar === 0
      ? "knowledge-generated-untracked: nothing tracked under knowledge/generated/ or any .obsidian/ path"
      : `knowledge-generated-untracked: ${pelanggar} tracked path(s) that ADR-0051 forbids in history`
  );
}

// ---------------------------------------------------------------------------
// 6. Bounded content staleness (English — issue #113)
// ---------------------------------------------------------------------------

/** How many changed/added/removed files, since the graph was last built, this gate tolerates as a NOTE before it becomes a VIOLATION. See the English addendum above for why this bound exists and why it is a violation past it. */
const MAX_STALE_FILES = 40;

/** Path prefixes that are never staleness candidates, regardless of `.graphifyignore`: the graph's own output directory (a rebuild changing its own artefacts must never count as the source drifting away from the graph that describes it) and the two directories this workflow's own tooling writes into. */
const STALENESS_OUT_OF_SCOPE_PREFIXES = ["graphify-out/", ".changesets/", "knowledge/generated/"];

/** The file-extension vocabulary `manifest.json` already contains, lower-cased — see `scripts/lib/graf-staleness.mjs`'s docblock for why this, rather than reimplementing graphify's own file classification, decides what is a staleness candidate. */
function ekstensiManifest(manifest) {
  const ekstensi = new Set();
  for (const jalur of Object.keys(manifest)) {
    const titik = jalur.lastIndexOf(".");
    const garis = jalur.lastIndexOf("/");
    if (titik > garis) ekstensi.add(jalur.slice(titik + 1).toLowerCase());
  }
  return ekstensi;
}

/** Every currently git-tracked path this gate considers a staleness candidate — see `scripts/lib/graf-staleness.mjs`'s `diffManifestStaleness` docblock for the contract this feeds. */
function kandidatDalamCakupan(terlacak, ekstensi) {
  return terlacak
    .filter((jalur) => {
      if (jalur.endsWith(".id.md")) return false;
      if (STALENESS_OUT_OF_SCOPE_PREFIXES.some((awalan) => jalur === awalan.slice(0, -1) || jalur.startsWith(awalan))) {
        return false;
      }

      const titik = jalur.lastIndexOf(".");
      const garis = jalur.lastIndexOf("/");
      const ext = titik > garis ? jalur.slice(titik + 1).toLowerCase() : "";
      return ekstensi.has(ext);
    })
    .sort();
}

/**
 * @param {Record<string, { ast_hash?: string }>} manifest
 */
function auditKesegaranTerbatas(manifest) {
  const semuaTerlacak = git("ls-files");

  if (semuaTerlacak === null) {
    catat("staleness: SKIPPED — not a git repo, `git ls-files` could not run");
    return;
  }

  const kandidat = kandidatDalamCakupan(gitLines(semuaTerlacak), ekstensiManifest(manifest));

  const diff = diffManifestStaleness({
    manifest,
    candidatePaths: kandidat,
    readFileBytes: (jalur) => {
      try {
        return readFileSync(join(AKAR, jalur));
      } catch {
        return null;
      }
    }
  });

  const total = diff.changed.length + diff.added.length + diff.removed.length;

  if (total > MAX_STALE_FILES) {
    langgar(
      "staleness",
      `${KELUARAN}/manifest.json`,
      `${total} file(s) changed/added/removed since the graph was last built, bound is ${MAX_STALE_FILES} ` +
        `(${diff.changed.length} changed, ${diff.added.length} added, ${diff.removed.length} removed) — ` +
        "run `bun run knowledge:graph:update`"
    );
    return;
  }

  catat(
    `staleness: ${total}/${MAX_STALE_FILES} file(s) changed/added/removed since the graph was last built ` +
      `(${diff.changed.length} changed, ${diff.added.length} added, ${diff.removed.length} removed)`
  );
}

// ---------------------------------------------------------------------------
// Jalankan
// ---------------------------------------------------------------------------

auditKnowledgeGeneratedUntracked();

const dirKeluaran = join(AKAR, KELUARAN);

if (!existsSync(dirKeluaran)) {
  // Keadaan sah untuk situs turunan: checklist-repo-baru.md menyuruh
  // menghapusnya. Gerbang ini menjaga artefak yang ADA, bukan mewajibkannya.
  catat(`${KELUARAN}/ tidak ada — tidak ada artefak graf untuk diperiksa`);
  pelapor.finish();
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

    const jalurManifest = join(dirKeluaran, "manifest.json");
    if (!existsSync(jalurManifest)) {
      catat("staleness: SKIPPED — graphify-out/manifest.json does not exist");
    } else {
      let manifest;
      try {
        manifest = bacaJson(jalurManifest);
      } catch (galat) {
        langgar("staleness", `${KELUARAN}/manifest.json`, `tidak bisa dibaca sebagai JSON: ${galat.message}`);
        manifest = null;
      }
      if (manifest) auditKesegaranTerbatas(manifest);
    }
  }
}

pelapor.finish();
