/**
 * Gerbang atas gerbangnya sendiri — `scripts/audit-serapan.mjs`.
 *
 * Berkas ini ada karena alasan yang sama dengan `tests/audit-graf.test.mjs`:
 * `audit:serapan` adalah pemeriksa yang JAWABANNYA HIJAU pada keadaan normal,
 * dan pemeriksa semacam itu bisa berhenti memeriksa apa pun tanpa satu orang
 * pun menyadarinya. Sebuah regex yang salah, sebuah `continue` yang tergeser,
 * atau sebuah `fetch` yang gagal diam-diam akan membuatnya melaporkan
 * "tidak ada pelanggaran" atas buku besar yang tidak pernah ia baca.
 *
 * Setiap pemeriksaan dibuktikan DUA ARAH — merah saat cacatnya ada, hijau saat
 * tidak. Arah kedua yang menahan biaya terbesar: pemeriksa yang memerahkan
 * segalanya lulus uji "ia menangkap cacat ini" tanpa berguna sama sekali.
 *
 * Skripnya dijalankan APA ADANYA dari direktori kerja lain, seperti
 * `tests/audit-konten.test.mjs` menjalankan tetangganya. Yang diuji harus disk,
 * karena yang dibaca skripnya adalah disk.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SKRIP = resolve("scripts/audit-serapan.mjs");
const LIB = resolve("scripts/lib");
const DOKUMEN = ".claude/skills/awcms-astro-integrasi/SKILL.md";

/**
 * URL yang dijamin gagal cepat, supaya pemeriksaan kesegaran DILEWATI di
 * kasus-kasus yang tidak sedang mengujinya.
 *
 * Port 1 pada loopback tidak pernah mendengarkan, jadi koneksinya ditolak dalam
 * milidetik alih-alih menunggu batas waktu.
 */
const TANPA_JARINGAN = "http://127.0.0.1:1/adr";

/** @type {string[]} */
const sementara = [];

afterEach(() => {
  while (sementara.length) rmSync(sementara.pop(), { recursive: true, force: true });
});

/** Pohon fixture dengan skrip + lib yang ikut disalin, supaya impor relatifnya resolve. */
function pohon(isiSkill) {
  const akar = mkdtempSync(join(tmpdir(), "audit-serapan-"));
  sementara.push(akar);

  const penuh = join(akar, DOKUMEN);
  mkdirSync(join(penuh, ".."), { recursive: true });
  writeFileSync(penuh, isiSkill);

  return akar;
}

/**
 * ASINKRON, dan itu bukan gaya.
 *
 * `Bun.spawnSync` memblokir thread JS sampai anak prosesnya selesai, jadi
 * `Bun.serve` yang dipakai kasus kesegaran di bawah tidak pernah sempat
 * menjawab: prosesnya menunggu server yang menunggu prosesnya. Ketiga kasus itu
 * timeout pada 5 detik sebelum ini diubah.
 */
async function jalankan(akar, env = {}) {
  const anak = Bun.spawn(["bun", SKRIP], {
    cwd: akar,
    env: { ...process.env, AWCMS_ADR_INDEX_URL: TANPA_JARINGAN, ...env },
    stdout: "pipe",
    stderr: "pipe"
  });

  const [keluar, galat] = await Promise.all([
    new Response(anak.stdout).text(),
    new Response(anak.stderr).text()
  ]);

  return { kode: await anak.exited, keluaran: keluar + galat };
}

/**
 * Buku besar yang LULUS, dengan lantai kecil supaya fixture-nya tetap terbaca.
 *
 * Tiap kasus merah di bawah merusak tepat satu hal darinya, sehingga yang diuji
 * adalah pemeriksaannya dan bukan kelengkapan fixture-nya.
 */
function bukuBesar({
  lantai = "0049",
  plafon = "0",
  baris = ["| 0049 | diserap | Tenant dari token |", "| 0050 | diperiksa | Tidak menyentuh build |"]
} = {}) {
  return [
    "# Skill",
    "",
    "<!-- serapan:adr-awcms:mulai -->",
    "",
    `    lantai: ${lantai}`,
    `    plafon-belum: ${plafon}`,
    "",
    "| ADR | Vonis | Di mana |",
    "| --- | --- | --- |",
    ...baris,
    "",
    "<!-- serapan:adr-awcms:selesai -->",
    ""
  ].join("\n");
}

describe("cakupan", () => {
  test("buku besar tanpa nomor bolong hijau", async () => {
    const { kode, keluaran } = await jalankan(pohon(bukuBesar()));
    expect(keluaran).toContain("Tidak ada pelanggaran");
    expect(kode).toBe(0);
  });

  test("nomor yang bolong merah, dan namanya disebut", async () => {
    // 0049 lalu 0052: dua keputusan di antaranya tidak pernah dibaca siapa pun,
    // dan tanpa pemeriksaan ini ketiadaannya terbaca seperti ketidakrelevanan.
    const akar = pohon(
      bukuBesar({
        baris: ["| 0049 | diserap | a |", "| 0052 | diperiksa | b |"]
      })
    );

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("tidak punya baris untuk ADR awcms 0050, 0051");
    expect(kode).toBe(1);
  });

  test("rentang dimekarkan, sehingga `0049–0052` menutup empat nomor", async () => {
    // Rentang membuat buku besarnya bisa dibaca manusia. Kalau ia tidak
    // dimekarkan, ia justru menjadi cara termudah menyembunyikan nomor bolong.
    const akar = pohon(bukuBesar({ baris: ["| 0049–0052 | diperiksa | satu blok |"] }));

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("Tidak ada pelanggaran");
    expect(keluaran).toContain("4 ADR awcms bervonis");
    expect(kode).toBe(0);
  });

  test("vonis yang tidak dikenal merah alih-alih diabaikan", async () => {
    const akar = pohon(bukuBesar({ baris: ['| 0049 | mungkin | entah |'] }));

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain('memakai vonis "mungkin"');
    expect(kode).toBe(1);
  });

  test("nomor ganda merah — dua vonis untuk satu keputusan", async () => {
    const akar = pohon(
      bukuBesar({ baris: ["| 0049 | diserap | a |", "| 0049 | diperiksa | b |"] })
    );

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("muncul lebih dari sekali");
    expect(kode).toBe(1);
  });
});

describe("blok bertanda", () => {
  test("blok yang HILANG merah, bukan dilewati", async () => {
    // Menghapus bloknya adalah cara termudah mematikan gerbang ini tanpa ada
    // yang menyadarinya, jadi ia harus memerah dan bukan menghijau.
    const { kode, keluaran } = await jalankan(pohon("# Skill\n\ntanpa blok apa pun\n"));
    expect(keluaran).toContain("tidak memuat blok bertanda");
    expect(kode).toBe(1);
  });

  test("kepala tanpa `lantai`/`plafon-belum` merah", async () => {
    const akar = pohon(
      [
        "<!-- serapan:adr-awcms:mulai -->",
        "| 0049 | diserap | a |",
        "<!-- serapan:adr-awcms:selesai -->"
      ].join("\n")
    );

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("harus menyatakan");
    expect(kode).toBe(1);
  });
});

describe("buku besar hanya menyusut", () => {
  test("`belum` melebihi plafonnya merah", async () => {
    const akar = pohon(
      bukuBesar({ plafon: "0", baris: ["| 0049 | belum | belum dibaca |"] })
    );

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("hanya boleh MENYUSUT");
    expect(kode).toBe(1);
  });

  test("`belum` DI BAWAH plafonnya juga merah — plafon basi berhenti menjaga", async () => {
    // Arah yang mudah dilupakan. Sebuah plafon yang ditinggalkan di angka lama
    // memberi ruang bagi utang baru tanpa satu pun gerbang berbunyi, yang
    // persis kebalikan dari gunanya buku besar ini.
    const akar = pohon(bukuBesar({ plafon: "3" }));

    const { kode, keluaran } = await jalankan(akar);
    expect(keluaran).toContain("Turunkan plafonnya menjadi 0");
    expect(kode).toBe(1);
  });
});

describe("kesegaran terhadap awcms", () => {
  test("DILEWATI saat indeksnya tak bisa diambil, dan mengatakannya", async () => {
    // Gerbang yang memerah karena jaringan mati akan dimatikan orang; gerbang
    // yang menghijau DIAM-DIAM karena jaringan mati lebih buruk lagi, karena ia
    // berbohong ke arah yang nyaman. Jadi ia melewati DAN menyebutkannya.
    const { kode, keluaran } = await jalankan(pohon(bukuBesar()));
    expect(keluaran).toContain("kesegaran: DILEWATI");
    expect(kode).toBe(0);
  });

  test("ADR awcms yang tak bervonis merah, dan nomornya disebut", async () => {
    // Satu-satunya pemeriksaan yang bisa menangkap "awcms menerbitkan ADR-0117
    // dan tidak ada yang melihatnya". Diuji terhadap server sungguhan, bukan
    // terhadap fungsi yang di-mock: yang bisa rusak adalah bentuk respons dan
    // penyaringan nama berkas, dan tidak satu pun dari keduanya terlihat oleh
    // mock.
    const server = Bun.serve({
      port: 0,
      fetch: () =>
        Response.json([
          { name: "0049-machine-credentials.md" },
          { name: "0050-bff-session.md" },
          { name: "0051-baru-sekali.md" },
          // Cermin `.id.md` HARUS diabaikan, atau setiap ADR terhitung dua kali.
          { name: "0051-baru-sekali.id.md" },
          { name: "README.md" }
        ])
    });

    try {
      const { kode, keluaran } = await jalankan(pohon(bukuBesar()), {
        AWCMS_ADR_INDEX_URL: `http://127.0.0.1:${server.port}/adr`
      });

      expect(keluaran).toContain("punya ADR 0051 yang tidak dikutip");
      expect(kode).toBe(1);
    } finally {
      server.stop(true);
    }
  });

  test("indeks yang sepenuhnya tercakup hijau, dan menghitung apa yang dilihatnya", async () => {
    const server = Bun.serve({
      port: 0,
      fetch: () =>
        Response.json([
          { name: "0049-machine-credentials.md" },
          { name: "0049-machine-credentials.id.md" },
          { name: "0050-bff-session.md" },
          // Di BAWAH lantai — sengaja tidak dituntut bervonis.
          { name: "0012-jauh-di-bawah-lantai.md" }
        ])
    });

    try {
      const { kode, keluaran } = await jalankan(pohon(bukuBesar()), {
        AWCMS_ADR_INDEX_URL: `http://127.0.0.1:${server.port}/adr`
      });

      expect(keluaran).toContain("3 ADR di ahliweb/awcms");
      expect(keluaran).toContain("Tidak ada pelanggaran");
      expect(kode).toBe(0);
    } finally {
      server.stop(true);
    }
  });

  test("indeks yang menjawab non-200 DILEWATI dengan menyebut statusnya", async () => {
    const server = Bun.serve({
      port: 0,
      fetch: () => new Response("nope", { status: 404 })
    });

    try {
      const { kode, keluaran } = await jalankan(pohon(bukuBesar()), {
        AWCMS_ADR_INDEX_URL: `http://127.0.0.1:${server.port}/adr`
      });

      expect(keluaran).toContain("menjawab HTTP 404");
      expect(kode).toBe(0);
    } finally {
      server.stop(true);
    }
  });
});

describe("repo ini sendiri", () => {
  test("buku besar sungguhannya lolos", async () => {
    // Kasus terakhir menjalankan gerbangnya atas repo ini, seperti tetangganya.
    // Jaringan sengaja dimatikan supaya suite ini tidak bergantung pada GitHub
    // hidup — kesegarannya diuji terhadap server lokal di atas.
    const hasil = Bun.spawnSync(["bun", SKRIP], {
      cwd: resolve("."),
      env: { ...process.env, AWCMS_ADR_INDEX_URL: TANPA_JARINGAN }
    });
    const keluaran = hasil.stdout.toString() + hasil.stderr.toString();

    if (hasil.exitCode !== 0) console.log(keluaran);
    expect(hasil.exitCode).toBe(0);
  });
});

// `LIB` dirujuk supaya alasan disalinnya lib tetap terbaca kalau fixture-nya
// berubah: skripnya mengimpor `./lib/reporter.mjs` RELATIF terhadap dirinya
// sendiri, bukan terhadap cwd, sehingga menjalankannya dari direktori lain
// tetap resolve tanpa menyalin apa pun.
void LIB;
