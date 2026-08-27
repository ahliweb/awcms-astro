/**
 * Gerbang atas gerbangnya sendiri — `scripts/audit-rilis.mjs`.
 *
 * Alasannya sama dengan `tests/audit-serapan.test.mjs`: `audit:rilis` adalah
 * pemeriksa yang jawaban NORMALNYA hijau, dan pemeriksa semacam itu bisa
 * berhenti memeriksa apa pun tanpa satu orang pun menyadarinya. Sebuah regex
 * yang bergeser satu karakter atau sebuah `continue` yang salah tempat akan
 * membuatnya melaporkan "tidak ada pelanggaran" atas backlog yang tidak pernah
 * ia hitung — persis keadaan yang membuat tiga puluh changeset menunggu dua
 * puluh hari dengan setiap gerbang hijau.
 *
 * Setiap batas dibuktikan DUA ARAH — merah satu berkas di atasnya, hijau tepat
 * PADA-nya. Arah kedua yang menahan biaya terbesar: sebuah pemeriksa yang
 * memerahkan segalanya lulus uji "ia menangkap cacat ini" tanpa berguna sama
 * sekali, dan sebuah batas yang meleset satu (`>=` alih-alih `>`) hanya terlihat
 * dari sisi itu.
 *
 * Waktu dipasok lewat `RELEASE_TODAY`, bukan dibaca dari jam dinding. Sebuah uji
 * yang menghitung tanggal fixture-nya dari jam yang sama dengan yang dibaca
 * skripnya hanya membuktikan bahwa pengurangan bekerja.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SKRIP = resolve("scripts/audit-rilis.mjs");

/** Hari yang dipakai seluruh kasus, sehingga umur di bawah bisa dihitung tangan. */
const HARI_INI = "2026-08-28";

/** @type {string[]} */
const sementara = [];

afterEach(() => {
  while (sementara.length) rmSync(sementara.pop(), { recursive: true, force: true });
});

/**
 * Pohon fixture dengan `.changesets/` berisi nama-nama yang diminta.
 *
 * ISI berkasnya tidak pernah dibaca gerbang ini — yang ditanya hanya namanya —
 * jadi fixture-nya sengaja tidak memuat frontmatter yang sah. Kalau suatu hari
 * gerbang ini mulai membaca isi, kasus-kasus di bawah akan memerah dan
 * memberitahu.
 *
 * @param {string[] | null} nama - null berarti direktorinya tidak dibuat sama sekali
 */
function pohon(nama) {
  const akar = mkdtempSync(join(tmpdir(), "audit-rilis-"));
  sementara.push(akar);

  if (nama === null) return akar;

  const direktori = join(akar, ".changesets");
  mkdirSync(direktori, { recursive: true });
  for (const berkas of nama) writeFileSync(join(direktori, berkas), "# fixture\n");

  return akar;
}

/** `n` changeset yang semuanya bertanggal `tanggal`. */
function sebanyak(n, tanggal = HARI_INI) {
  return Array.from({ length: n }, (_, i) => `${tanggal}-perubahan-ke-${i + 1}.md`);
}

async function jalankan(akar, env = {}) {
  const anak = Bun.spawn(["bun", SKRIP], {
    cwd: akar,
    env: { ...process.env, RELEASE_TODAY: HARI_INI, ...env },
    stdout: "pipe",
    stderr: "pipe"
  });

  const [keluar, galat] = await Promise.all([
    new Response(anak.stdout).text(),
    new Response(anak.stderr).text()
  ]);

  return { kode: await anak.exited, keluaran: keluar + galat };
}

describe("jumlah yang menunggu", () => {
  test("dua belas changeset — tepat pada batas — hijau", async () => {
    const { kode, keluaran } = await jalankan(pohon(sebanyak(12)));

    expect(keluaran).toContain("Tidak ada pelanggaran");
    expect(kode).toBe(0);
  });

  test("tiga belas merah, dan jumlah beserta batasnya disebut", async () => {
    const { kode, keluaran } = await jalankan(pohon(sebanyak(13)));

    expect(keluaran).toContain("13 changeset menunggu, batasnya 12");
    expect(keluaran).toContain("bun run release --apply");
    expect(kode).toBe(1);
  });

  test("README direktori itu sendiri tidak terhitung changeset", async () => {
    // Cacat yang PERNAH terjadi di `rilis.mjs`: penyaringnya membandingkan
    // dengan satu nama persis, sehingga `README.id.md` terhitung menunggu.
    // Di sini akibatnya lebih tenang dan lebih buruk — dua berkas hantu yang
    // menggeser hitungan tanpa satu pun perubahan pernah ditulis.
    const akar = pohon([...sebanyak(12), "README.md", "README.id.md"]);
    const { kode, keluaran } = await jalankan(akar);

    expect(keluaran).toContain("12 changeset menunggu");
    expect(kode).toBe(0);
  });
});

describe("usia yang tertua", () => {
  test("empat belas hari — tepat pada batas — hijau", async () => {
    const { kode, keluaran } = await jalankan(pohon(["2026-08-14-cukup-tua.md"]));

    expect(keluaran).toContain("14 hari (batas 14)");
    expect(keluaran).toContain("Tidak ada pelanggaran");
    expect(kode).toBe(0);
  });

  test("lima belas hari merah, dan berkas tertua yang disebut", async () => {
    const akar = pohon(["2026-08-13-paling-tua.md", "2026-08-27-yang-baru.md"]);
    const { kode, keluaran } = await jalankan(akar);

    expect(keluaran).toContain("2026-08-13-paling-tua.md");
    expect(keluaran).toContain("menunggu 15 hari sejak 2026-08-13, batasnya 14");
    // Yang muda tidak ikut dituduh: yang diukur backlog-nya, bukan tiap berkas.
    expect(keluaran).not.toContain("2026-08-27-yang-baru.md: menunggu");
    expect(kode).toBe(1);
  });

  test("changeset bertanggal masa depan merah alih-alih berumur negatif", async () => {
    // Tanpa pemeriksaan ini, `2026-09-30-` adalah satu-satunya cara memarkir
    // sebuah changeset di backlog selamanya: umurnya negatif, jadi ia tidak
    // pernah melewati batas mana pun, dan namanya terbaca seperti salah ketik.
    const { kode, keluaran } = await jalankan(pohon(["2026-09-30-belum-tiba.md"]));

    expect(keluaran).toContain("bertanggal 2026-09-30, yang belum tiba");
    expect(kode).toBe(1);
  });
});

describe("nama yang tidak bisa ditanggali", () => {
  test("tanpa awalan tanggal merah", async () => {
    const { kode, keluaran } = await jalankan(pohon(["perbaikan-cepat.md"]));

    expect(keluaran).toContain("perbaikan-cepat.md");
    expect(keluaran).toContain("tidak diawali tanggal `YYYY-MM-DD-` yang sah");
    expect(kode).toBe(1);
  });

  test("tanggal yang tidak ada di kalender merah, bukan digulung ke bulan berikutnya", async () => {
    // `new Date("2026-02-31")` menjawab 3 Maret tanpa mengeluh. Sebuah tanggal
    // yang menggulung adalah tanggal yang tidak ditulis penulisnya, dan
    // menerimanya berarti gerbang ini menghitung umur dari hari yang tidak ada.
    const { kode, keluaran } = await jalankan(pohon(["2026-02-31-tanggal-hantu.md"]));

    expect(keluaran).toContain("2026-02-31-tanggal-hantu.md");
    expect(keluaran).toContain("tidak diawali tanggal `YYYY-MM-DD-` yang sah");
    expect(kode).toBe(1);
  });

  test("yang tak tertanggali tidak menyembunyikan yang tua di belakangnya", async () => {
    // Arah yang gampang salah: sebuah `continue` yang menghentikan seluruh
    // pemeriksaan pada berkas cacat pertama akan membuat backlog setua dua
    // pekan lewat tanpa terlihat, dan gerbangnya tetap merah — jadi cacatnya
    // tidak akan pernah ketahuan dari kode keluarnya saja.
    const akar = pohon(["tanpa-tanggal.md", "2026-08-01-sangat-tua.md"]);
    const { kode, keluaran } = await jalankan(akar);

    expect(keluaran).toContain("tanpa-tanggal.md");
    expect(keluaran).toContain("menunggu 27 hari sejak 2026-08-01");
    expect(kode).toBe(1);
  });
});

describe("keadaan kosong", () => {
  test("backlog kosong hijau dan menyebut kedua batas yang berlaku", async () => {
    const { kode, keluaran } = await jalankan(pohon([]));

    expect(keluaran).toContain("Tidak ada changeset menunggu");
    expect(keluaran).toContain("12 berkas");
    expect(keluaran).toContain("14 hari");
    expect(kode).toBe(0);
  });

  test("tanpa direktori `.changesets/` hijau, dan MENGATAKAN ia tidak membaca apa pun", async () => {
    // Keadaan sah untuk situs turunan yang membuang mesin rilis template ini.
    // Yang tidak boleh adalah diam: sebuah gerbang yang tidak membaca apa pun
    // dan sebuah gerbang yang membaca dan tidak menemukan apa pun mencetak
    // vonis yang sama persis.
    const { kode, keluaran } = await jalankan(pohon(null));

    expect(keluaran).toContain(".changesets/ tidak ada");
    expect(kode).toBe(0);
  });
});

describe("jam dinding", () => {
  test("tanpa RELEASE_TODAY umur dihitung dari hari ini, bukan dari nol", async () => {
    // Membuktikan jalur bawaannya benar-benar membaca kalender: tanggal
    // fixture-nya jauh di masa lalu, jadi ia harus melewati batas usia berapa
    // pun hari ini dijalankan.
    const { kode, keluaran } = await jalankan(pohon(["2020-01-01-purba.md"]), {
      RELEASE_TODAY: ""
    });

    expect(keluaran).toContain("2020-01-01-purba.md");
    expect(keluaran).toContain("batasnya 14");
    expect(kode).toBe(1);
  });
});
