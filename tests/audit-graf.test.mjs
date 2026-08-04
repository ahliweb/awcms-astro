/**
 * Gerbang atas gerbangnya sendiri — `scripts/audit-graf.mjs`.
 *
 * ## Kenapa gerbang ini butuh tesnya sendiri
 *
 * Ia lahir dari cacat yang tak satu pun gerbang lain bisa lihat: 60 dari 101
 * label komunitas menempel pada komunitas yang salah, di dalam JSON yang sah,
 * di sebelah laporan yang rapi. Sebuah pemeriksa yang menjawab "bersih" untuk
 * artefak secacat itu mengulang cacatnya satu tingkat lebih tinggi — kali ini
 * dengan tanda centang di sampingnya, yang lebih buruk daripada tidak ada
 * pemeriksa sama sekali.
 *
 * Jadi tiap gerbang di bawah dibuktikan **dua arah**: MERAH saat cacatnya ada,
 * HIJAU saat tidak. Fixture-nya pohon berkas sungguhan di direktori sementara —
 * termasuk repo git sungguhan untuk gerbang yang memang bertanya kepada git —
 * bukan string yang di-mock. Skripnya membaca disk dan memanggil `git`, jadi
 * yang diuji harus disk dan git.
 *
 * Kasus terakhir menjalankannya atas repo ini sendiri. Itu yang membuat tes ini
 * ikut menjaga `graphify-out/`, bukan hanya menjaga skripnya.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SKRIP = "scripts/audit-graf.mjs";

/** @type {string[]} */
const sementara = [];

afterEach(() => {
  while (sementara.length) rmSync(sementara.pop(), { recursive: true, force: true });
});

/** Pohon fixture: `{ "graphify-out/graph.json": "isi" }` → direktori sungguhan. */
function pohon(berkas) {
  const akar = mkdtempSync(join(tmpdir(), "audit-graf-"));
  sementara.push(akar);

  for (const [jalur, isi] of Object.entries(berkas)) {
    const penuh = join(akar, jalur);
    mkdirSync(join(penuh, ".."), { recursive: true });
    writeFileSync(penuh, typeof isi === "string" ? isi : JSON.stringify(isi));
  }

  return akar;
}

function jalankan(akar) {
  const hasil = Bun.spawnSync(["bun", SKRIP, akar]);
  return {
    kode: hasil.exitCode,
    keluaran: hasil.stdout.toString() + hasil.stderr.toString()
  };
}

/**
 * Node graf minimal. `community_name` sengaja wajib disebut pemanggil: yang
 * diuji gerbang ini adalah nama, jadi tidak boleh ada nilai default yang
 * diam-diam membuat kasus lulus.
 */
function node(id, community, community_name, source_file = "src/a.ts") {
  return { id, label: id, community, community_name, source_file };
}

function graf(nodes, tambahan = {}) {
  return JSON.stringify({
    nodes,
    links: [],
    built_at_commit: "0".repeat(40),
    ...tambahan
  });
}

/**
 * Laporan minimal: baris Summary yang dibaca gerbang, plus heading komunitas
 * bila kasusnya menguji kesepakatan nama antar-artefak.
 */
function laporan({ node: n, edge = 0, komunitas, heading = [] }) {
  return [
    "# Graph Report - fixture",
    "",
    "## Summary",
    `- ${n} nodes · ${edge} edges · ${komunitas} communities`,
    "",
    ...heading.map(([id, nama]) => `### Community ${id} - "${nama}"`),
    ""
  ].join("\n");
}

/** Pohon paling sederhana yang LULUS — dasar tiap kasus negatif di bawah. */
function pohonBersih(nodes, opsi = {}) {
  return pohon({
    "graphify-out/graph.json": graf(nodes),
    "graphify-out/GRAPH_REPORT.md": laporan({
      node: nodes.length,
      komunitas: new Set(nodes.map((n) => n.community)).size,
      ...opsi
    })
  });
}

describe("artefak yang terlacak git", () => {
  /** Repo git sungguhan; `git ls-files` membaca index, jadi commit tak perlu. */
  function repo(berkas, dilacak) {
    const akar = pohon(berkas);
    Bun.spawnSync(["git", "-C", akar, "init", "-q"]);
    Bun.spawnSync(["git", "-C", akar, "add", "-f", ...dilacak]);
    return akar;
  }

  const empatArtefak = {
    "graphify-out/graph.json": graf([node("a", 0, "Konten Terstruktur")]),
    "graphify-out/GRAPH_REPORT.md": laporan({ node: 1, komunitas: 1 }),
    "graphify-out/manifest.json": "{}",
    "graphify-out/cost.json": "{}"
  };

  test("hanya empat artefak bersama lolos", () => {
    const akar = repo(empatArtefak, [
      "graphify-out/graph.json",
      "graphify-out/GRAPH_REPORT.md",
      "graphify-out/manifest.json",
      "graphify-out/cost.json"
    ]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("terlacak: 4/4 artefak bersama");
    expect(kode).toBe(0);
  });

  test("graph.html yang terlacak memerahkan gerbang", () => {
    const akar = repo(
      { ...empatArtefak, "graphify-out/graph.html": "<html></html>" },
      ["graphify-out/graph.json", "graphify-out/GRAPH_REPORT.md", "graphify-out/graph.html"]
    );

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("graph.html");
    expect(keluaran).toContain("membusuk diam-diam");
    expect(kode).toBe(1);
  });

  test("cache yang terlacak memerahkan gerbang", () => {
    const akar = repo({ ...empatArtefak, "graphify-out/cache/x.json": "{}" }, [
      "graphify-out/graph.json",
      "graphify-out/GRAPH_REPORT.md",
      "graphify-out/cache/x.json"
    ]);

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("cache spesifik mesin");
    expect(kode).toBe(1);
  });

  test("berkas ber-titik yang terlacak memerahkan gerbang", () => {
    const akar = repo({ ...empatArtefak, "graphify-out/.graphify_root": "/x" }, [
      "graphify-out/graph.json",
      "graphify-out/GRAPH_REPORT.md",
      "graphify-out/.graphify_root"
    ]);

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("intermediate/penanda");
    expect(kode).toBe(1);
  });

  test("salinan bertanggal yang terlacak memerahkan gerbang", () => {
    const akar = repo({ ...empatArtefak, "graphify-out/2026-08-04/graph.json": "{}" }, [
      "graphify-out/graph.json",
      "graphify-out/GRAPH_REPORT.md",
      "graphify-out/2026-08-04/graph.json"
    ]);

    const { keluaran, kode } = jalankan(akar);
    expect(keluaran).toContain("duplikat penuh");
    expect(kode).toBe(1);
  });

  test("bukan repo git: DILEWATI dengan suara, bukan lulus diam-diam", () => {
    const akar = pohonBersih([node("a", 0, "Konten Terstruktur")]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("terlacak: DILEWATI");
    expect(kode).toBe(0);
  });
});

describe("laporan sepakat dengan graf", () => {
  test("jumlah yang sama lolos", () => {
    const akar = pohonBersih([node("a", 0, "Konten Terstruktur"), node("b", 1, "Gerbang Mutu")]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("sepakat: laporan 2/0/2 vs graf 2/0/2");
    expect(kode).toBe(0);
  });

  test("jumlah node yang berbeda memerahkan gerbang", () => {
    const nodes = [node("a", 0, "Konten Terstruktur")];
    const akar = pohon({
      "graphify-out/graph.json": graf(nodes),
      "graphify-out/GRAPH_REPORT.md": laporan({ node: 99, komunitas: 1 })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("menyebut 99 node, graph.json memuat 1");
    expect(kode).toBe(1);
  });

  test("jumlah komunitas yang berbeda memerahkan gerbang", () => {
    const nodes = [node("a", 0, "Konten Terstruktur")];
    const akar = pohon({
      "graphify-out/graph.json": graf(nodes),
      "graphify-out/GRAPH_REPORT.md": laporan({ node: 1, komunitas: 7 })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("menyebut 7 komunitas, graph.json memuat 1");
    expect(kode).toBe(1);
  });

  test("laporan tanpa baris Summary memerahkan gerbang", () => {
    const akar = pohon({
      "graphify-out/graph.json": graf([node("a", 0, "Konten Terstruktur")]),
      "graphify-out/GRAPH_REPORT.md": "# Graph Report\n\ntanpa ringkasan\n"
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tidak punya baris Summary");
    expect(kode).toBe(1);
  });
});

describe("label komunitas", () => {
  test("nama bahasa manusia yang unik lolos", () => {
    const akar = pohonBersih([
      node("a", 0, "Konten Terstruktur"),
      node("b", 1, "Gerbang Mutu"),
      node("c", 2, "Penyajian Bun")
    ]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("label: 3 komunitas, 3 nama berbeda");
    expect(kode).toBe(0);
  });

  test("nama berkas memerahkan gerbang", () => {
    const akar = pohonBersih([node("a", 0, "client.ts"), node("b", 1, "Gerbang Mutu")]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain('komunitas 0 bernama "client.ts"');
    expect(keluaran).toContain("nama berkas");
    expect(kode).toBe(1);
  });

  test("nama berkas .astro dan .md juga tertangkap", () => {
    const akar = pohonBersih([
      node("a", 0, "BaseLayout.astro"),
      node("b", 1, "0020-layar-admin-kembali-ke-awcms.md")
    ]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("BaseLayout.astro");
    expect(keluaran).toContain("0020-layar-admin-kembali-ke-awcms.md");
    expect(kode).toBe(1);
  });

  test("placeholder Community N memerahkan gerbang", () => {
    const akar = pohonBersih([node("a", 0, "Community 0"), node("b", 1, "Gerbang Mutu")]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("masih placeholder");
    expect(kode).toBe(1);
  });

  test("komunitas tanpa nama memerahkan gerbang", () => {
    const akar = pohonBersih([node("a", 0, undefined), node("b", 1, "Gerbang Mutu")]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("komunitas 0 tanpa community_name");
    expect(kode).toBe(1);
  });

  test("dua komunitas bernama sama memerahkan gerbang", () => {
    const akar = pohonBersih([
      node("a", 0, "Gerbang Mutu"),
      node("b", 1, "Gerbang Mutu"),
      node("c", 2, "Konten Terstruktur")
    ]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain('nama "Gerbang Mutu" dipakai 2 komunitas sekaligus (0, 1)');
    expect(kode).toBe(1);
  });

  test("nama yang berbeda antara laporan dan graf memerahkan gerbang", () => {
    const nodes = [node("a", 0, "Konten Terstruktur")];
    const akar = pohon({
      "graphify-out/graph.json": graf(nodes),
      "graphify-out/GRAPH_REPORT.md": laporan({
        node: 1,
        komunitas: 1,
        heading: [[0, "Sesuatu Yang Lain"]]
      })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain('bernama "Sesuatu Yang Lain" di laporan tetapi "Konten Terstruktur" di graph.json');
    expect(kode).toBe(1);
  });

  test("komunitas tipis yang tidak muncul di laporan bukan pelanggaran", () => {
    // Laporan sengaja menghilangkan komunitas tipis. Ketidakhadiran BUKAN
    // ketidaksepakatan — memerahkannya akan menghukum perilaku normal graphify.
    const nodes = [node("a", 0, "Konten Terstruktur"), node("b", 1, "Gerbang Mutu")];
    const akar = pohon({
      "graphify-out/graph.json": graf(nodes),
      "graphify-out/GRAPH_REPORT.md": laporan({
        node: 2,
        komunitas: 2,
        heading: [[0, "Konten Terstruktur"]]
      })
    });

    expect(jalankan(akar).kode).toBe(0);
  });
});

describe("pengecualian .graphifyignore", () => {
  test("korpus yang menghormati pengecualian lolos", () => {
    const nodes = [node("a", 0, "Konten Terstruktur", "src/lib/content.ts")];
    const akar = pohon({
      ".graphifyignore": "# alasan\n.changesets/\n",
      "graphify-out/graph.json": graf(nodes),
      "graphify-out/GRAPH_REPORT.md": laporan({ node: 1, komunitas: 1 })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("pengecualian: 1 entri ditegakkan");
    expect(kode).toBe(0);
  });

  test("node dari direktori yang dikecualikan memerahkan gerbang", () => {
    const nodes = [
      node("a", 0, "Konten Terstruktur", "src/lib/content.ts"),
      node("b", 0, "Konten Terstruktur", ".changesets/0001-x.md"),
      node("c", 0, "Konten Terstruktur", ".changesets/0002-y.md")
    ];
    const akar = pohon({
      ".graphifyignore": ".changesets/\n",
      "graphify-out/graph.json": graf(nodes),
      "graphify-out/GRAPH_REPORT.md": laporan({ node: 3, komunitas: 1 })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("2 node dari 2 berkas di bawah pengecualian `.changesets`");
    expect(kode).toBe(1);
  });

  test("pola glob dilaporkan sebagai TIDAK ditegakkan, bukan dilewati diam-diam", () => {
    const nodes = [node("a", 0, "Konten Terstruktur", "vendor/x/y.ts")];
    const akar = pohon({
      ".graphifyignore": "vendor/**/*.ts\n",
      "graphify-out/graph.json": graf(nodes),
      "graphify-out/GRAPH_REPORT.md": laporan({ node: 1, komunitas: 1 })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("TIDAK ditegakkan (vendor/**/*.ts)");
    expect(kode).toBe(0);
  });

  test("tanpa .graphifyignore: dikatakan, bukan didiamkan", () => {
    const akar = pohonBersih([node("a", 0, "Konten Terstruktur")]);

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("pengecualian: tidak ada .graphifyignore");
    expect(kode).toBe(0);
  });
});

describe("artefak yang tidak ada atau rusak", () => {
  test("repo tanpa graphify-out/ lolos dengan catatan", () => {
    const akar = pohon({ "README.md": "# situs turunan" });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tidak ada artefak graf untuk diperiksa");
    expect(kode).toBe(0);
  });

  test("graphify-out/ tanpa graph.json memerahkan gerbang", () => {
    const akar = pohon({ "graphify-out/cost.json": "{}" });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tidak ada padahal graphify-out/ ada");
    expect(kode).toBe(1);
  });

  test("graph.json yang bukan JSON memerahkan gerbang", () => {
    const akar = pohon({
      "graphify-out/graph.json": "{ rusak",
      "graphify-out/GRAPH_REPORT.md": laporan({ node: 0, komunitas: 0 })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tidak bisa dibaca sebagai JSON");
    expect(kode).toBe(1);
  });

  test("graph.json tanpa array nodes memerahkan gerbang", () => {
    const akar = pohon({
      "graphify-out/graph.json": '{"links":[]}',
      "graphify-out/GRAPH_REPORT.md": laporan({ node: 0, komunitas: 0 })
    });

    const { kode, keluaran } = jalankan(akar);
    expect(keluaran).toContain("tidak punya array `nodes`");
    expect(kode).toBe(1);
  });
});

test("repo ini sendiri lolos", () => {
  const { kode, keluaran } = jalankan(".");
  if (kode !== 0) console.log(keluaran);
  expect(kode).toBe(0);
});
