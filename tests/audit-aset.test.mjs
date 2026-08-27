/**
 * Gerbang atas gerbangnya sendiri — `scripts/audit-aset.mjs`.
 *
 * Anggaran aset adalah pemeriksa yang jawabannya HIJAU pada keadaan normal, dan
 * pemeriksa semacam itu bisa berhenti memeriksa apa pun tanpa satu orang pun
 * menyadarinya. Yang khas untuk gerbang INI: regex yang salah membuat sebuah
 * halaman tampak tidak menarik skrip apa pun, dan hasilnya bukan merah palsu
 * melainkan HIJAU palsu.
 *
 * Skripnya dijalankan APA ADANYA dari direktori kerja lain, seperti
 * `tests/audit-konten.test.mjs`. Yang diuji harus disk, karena yang dibaca
 * skripnya adalah disk.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SKRIP = resolve("scripts/audit-aset.mjs");

/** @type {string[]} */
const sementara = [];

afterEach(() => {
  while (sementara.length) rmSync(sementara.pop(), { recursive: true, force: true });
});

function pohon(berkas) {
  const akar = mkdtempSync(join(tmpdir(), "audit-aset-"));
  sementara.push(akar);

  for (const [jalur, isi] of Object.entries(berkas)) {
    const penuh = join(akar, jalur);
    mkdirSync(join(penuh, ".."), { recursive: true });
    writeFileSync(penuh, isi);
  }

  return akar;
}

async function jalankan(akar) {
  const anak = Bun.spawn(["bun", SKRIP], { cwd: akar, stdout: "pipe", stderr: "pipe" });
  const [keluar, galat] = await Promise.all([
    new Response(anak.stdout).text(),
    new Response(anak.stderr).text()
  ]);

  return { kode: await anak.exited, keluaran: keluar + galat };
}

/** Registri `public/` yang lengkap — tiap kasus di bawah merusak tepat satu hal. */
const PUBLIC_LENGKAP = {
  "public/favicon.svg": "<svg xmlns='http://www.w3.org/2000/svg'></svg>",
  "public/tema.js": "// pemilih tema\n"
};

/** Satu halaman terbit yang lulus. */
function halaman({ skrip = [], gaya = [], inline = "" } = {}) {
  const tag = [
    ...gaya.map((u) => `<link rel="stylesheet" href="${u}">`),
    ...skrip.map((u) => `<script src="${u}"></script>`),
    inline ? `<script>${inline}</script>` : ""
  ].join("");

  return `<!doctype html><html><head>${tag}</head><body><p>Halaman</p></body></html>`;
}

describe("registri public/ ditegakkan DUA ARAH", () => {
  test("registri yang cocok hijau", async () => {
    const { kode, keluaran } = await jalankan(pohon(PUBLIC_LENGKAP));
    expect(keluaran).toContain("Tidak ada pelanggaran");
    expect(kode).toBe(0);
  });

  test("berkas yang TIDAK didaftarkan merah", async () => {
    // Byte yang tidak diklasifikasikan siapa pun adalah byte yang tidak
    // dianggarkan siapa pun.
    const akar = pohon({ ...PUBLIC_LENGKAP, "public/analitik-pihak-ketiga.js": "x" });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("tidak dideklarasikan di AUDIENS_PUBLIC");
    expect(kode).toBe(1);
  });

  test("entri yang berkasnya HILANG juga merah", async () => {
    // Arah yang mudah dilupakan, dan yang membuat daftarnya tidak membusuk:
    // entri yang menamai berkas yang tidak dipancarkan build berhenti menangkap
    // apa pun sementara tetap terlihat seperti perlindungan.
    const akar = pohon({ "public/favicon.svg": "<svg/>" });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("tidak ada di disk");
    expect(kode).toBe(1);
  });
});

describe("anggaran per halaman terbit", () => {
  test("halaman yang ramping hijau", async () => {
    const akar = pohon({
      ...PUBLIC_LENGKAP,
      "dist/client/index.html": halaman({ skrip: ["/a.js"], gaya: ["/a.css"] }),
      "dist/client/a.js": "x".repeat(1000),
      "dist/client/a.css": "y".repeat(1000)
    });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("1 halaman diperiksa");
    expect(kode).toBe(0);
  });

  test("skrip yang melampaui anggaran merah, dan pesannya menyebut SKRIP saja", async () => {
    // Versi pertama gerbang ini menyebut `BaseLayout.css` sebagai penyumbang
    // terbesar sebuah pelanggaran SKRIP — mengirim pembacanya memperkecil
    // berkas yang tidak ada hubungannya dengan angka yang merah.
    const akar = pohon({
      ...PUBLIC_LENGKAP,
      "dist/client/index.html": halaman({ skrip: ["/berat.js"], gaya: ["/besar.css"] }),
      "dist/client/berat.js": "x".repeat(14000),
      "dist/client/besar.css": "y".repeat(30000)
    });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("B skrip melampaui");
    expect(keluaran).toMatch(/Skrip terbesar: \/berat\.js/);
    // CSS tidak boleh muncul sebagai penyumbang pelanggaran SKRIP.
    const barisSkrip = keluaran
      .split("\n")
      .filter((b) => b.includes("B skrip melampaui"))
      .join(" ");
    expect(barisSkrip).not.toContain("besar.css");
    expect(kode).toBe(1);
  });

  test("skrip INLINE ikut dihitung", async () => {
    // Yang paling mudah luput: sebuah blok inline tidak punya berkas, jadi
    // gerbang yang hanya menjumlah berkas melaporkan halaman berat sebagai
    // ramping. Anggaran pertama gerbang ini salah persis karena ini.
    const akar = pohon({
      ...PUBLIC_LENGKAP,
      "dist/client/index.html": halaman({ inline: "z".repeat(14000) })
    });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("B skrip melampaui");
    expect(kode).toBe(1);
  });

  test("blok <script src=…> tidak dihitung DUA KALI", async () => {
    // Ia rujukan, bukan muatan. Menghitung isinya sebagai inline akan
    // menjumlahkan berkasnya plus tag kosongnya.
    const akar = pohon({
      ...PUBLIC_LENGKAP,
      "dist/client/index.html": halaman({ skrip: ["/a.js"] }),
      "dist/client/a.js": "x".repeat(5000)
    });

    const { keluaran } = await jalankan(akar);
    expect(keluaran).toMatch(/terberat 5000 B \(skrip 5000\)/);
  });

  test("total yang melampaui anggaran merah walau skripnya patuh", async () => {
    // CSS dipisahkan dari skrip justru supaya kasus ini punya namanya sendiri:
    // sebuah halaman bisa patuh pada skrip dan tetap terlalu berat.
    const akar = pohon({
      ...PUBLIC_LENGKAP,
      "dist/client/index.html": halaman({ gaya: ["/besar.css"] }),
      "dist/client/besar.css": "y".repeat(40000)
    });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("melampaui 36000 B");
    expect(keluaran).not.toContain("B skrip melampaui");
    expect(kode).toBe(1);
  });

  test("satu berkas skrip yang melampaui plafon per-berkas merah", async () => {
    const akar = pohon({
      ...PUBLIC_LENGKAP,
      "dist/client/index.html": halaman({ skrip: ["/gemuk.js"] }),
      "dist/client/gemuk.js": "x".repeat(8500)
    });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("melampaui plafon per-skrip");
    expect(kode).toBe(1);
  });
});

describe("lapis sumber, yang selalu berjalan", () => {
  test("tanpa dist/ ia MENGATAKAN apa yang dilewatinya", async () => {
    // "Tidak berjalan" tidak boleh menyamar jadi "lulus" — kondisi normal repo
    // template ini, yang tidak punya sumber konten.
    const { kode, keluaran } = await jalankan(pohon(PUBLIC_LENGKAP));

    expect(keluaran).toContain("keluaran: DILEWATI");
    expect(keluaran).toContain("tidak ada dist/client");
    expect(kode).toBe(0);
  });

  test("blok <script> sumber yang raksasa merah tanpa perlu build", async () => {
    const akar = pohon({
      ...PUBLIC_LENGKAP,
      "src/components/Raksasa.astro": `---\n---\n<div></div>\n<script>${"x".repeat(15000)}</script>`
    });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("melampaui plafon sumber");
    expect(kode).toBe(1);
  });

  test("plafon sumber lebih LONGGAR dari plafon terbit, dan itu disengaja", async () => {
    // Kotak cari 10.054 B di `src/` dan 4.808 B setelah build. Menerapkan satu
    // plafon pada keduanya akan menuduh berkas yang sebenarnya patuh — arah
    // hijau yang menahan biaya kasus di atasnya.
    const akar = pohon({
      ...PUBLIC_LENGKAP,
      "src/components/Cari.astro": `---\n---\n<script>${"x".repeat(10054)}</script>`
    });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("Tidak ada pelanggaran");
    expect(kode).toBe(0);
  });

  test("berkas .js di public/ TIDAK diperkecil, jadi plafon terbit berlaku padanya", async () => {
    const akar = pohon({
      "public/favicon.svg": "<svg/>",
      "public/tema.js": "x".repeat(9000)
    });

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("TIDAK diperkecil bundler");
    expect(kode).toBe(1);
  });
});

describe("repo ini sendiri", () => {
  test("lolos gerbangnya sendiri", async () => {
    const anak = Bun.spawn(["bun", SKRIP], {
      cwd: resolve("."),
      stdout: "pipe",
      stderr: "pipe"
    });
    const keluaran =
      (await new Response(anak.stdout).text()) + (await new Response(anak.stderr).text());
    const kode = await anak.exited;

    if (kode !== 0) console.log(keluaran);
    expect(kode).toBe(0);
  });
});
