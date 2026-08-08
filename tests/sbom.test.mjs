/**
 * Gerbang SBOM (ADR-0031): generatornya benar, dan langkah rilisnya tidak bisa
 * hilang diam-diam.
 *
 * ## Dua hal yang dijaga, dan kenapa keduanya
 *
 * 1. **`susunSbom` memerikan lockfile dengan lengkap dan tepat.** SBOM yang
 *    diam-diam melewatkan paket lebih buruk daripada tidak ada SBOM: konsumen
 *    yang memeriksa advisory terhadap daftar yang tidak lengkap menyimpulkan
 *    "tidak terdampak" dengan percaya diri. Tes di bawah membuktikan arah
 *    merahnya atas lockfile buatan — bukan hanya "jalan tanpa error" atas
 *    lockfile asli.
 *
 * 2. **`scripts/rilis.mjs` menjalankannya SEBELUM commit rilis.** Empat dokumen
 *    pernah menuntut `bun test` sebelum rilis sementara perilis tidak pernah
 *    menjalankannya (ADR-0030); kelas cacat yang sama menunggu langkah SBOM.
 *    Asersi struktural atas sumber perilis menutupnya — pola yang sama dengan
 *    `tests/versi-toolchain.test.mjs` membaca `ci.yml`.
 *
 * ## Yang SENGAJA tidak dijaga
 *
 * Kesegaran `sbom.cdx.json` di pohon kerja. SBOM memerikan RILIS; di antara dua
 * rilis ia boleh tertinggal dari `bun.lock`, dan gerbang yang menuntut keduanya
 * selalu sinkron akan memerahkan setiap PR bump dependency — gerbang semahal
 * itu akan dilonggarkan dalam sebulan, persis yang §Gerbang mutu larang.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

import { buangTrailingComma, susunPurl, susunSbom } from "../scripts/sbom.mjs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(buangTrailingComma(readFileSync("bun.lock", "utf8")));

describe("susunSbom atas lockfile repo ini", () => {
  const sbom = susunSbom(pkg, lock);

  test("setiap id unik di lockfile menjadi tepat satu komponen", () => {
    const idUnik = new Set(
      Object.values(lock.packages).map((entri) => entri[0])
    );
    assert.equal(
      sbom.components.length,
      idUnik.size,
      "jumlah komponen menyimpang dari jumlah paket di bun.lock — SBOM yang " +
        "tidak lengkap menjawab 'tidak terdampak' dengan percaya diri"
    );
  });

  test("akar SBOM adalah repo ini, dengan versi dari package.json", () => {
    assert.equal(sbom.metadata.component.name, pkg.name);
    assert.equal(sbom.metadata.component.version, pkg.version);
    assert.equal(sbom.bomFormat, "CycloneDX");
  });

  test("komponen membawa purl dan versi persis dari lockfile", () => {
    const astroDiLock = lock.packages.astro?.[0];
    assert.ok(astroDiLock, "astro tidak ada di bun.lock — tes ini perlu ditinjau");
    const versi = astroDiLock.slice(astroDiLock.lastIndexOf("@") + 1);

    const astroDiSbom = sbom.components.find((k) => k.name === "astro");
    assert.ok(astroDiSbom, "astro ada di lockfile tetapi hilang dari SBOM");
    assert.equal(astroDiSbom.version, versi);
    assert.equal(astroDiSbom.purl, `pkg:npm/astro@${versi}`);
  });

  test("deterministik: dua kali susun, byte yang sama, tanpa timestamp", () => {
    // Regenerasi pada tag yang sama wajib menghasilkan byte identik — itu yang
    // membuat SBOM di sebuah tag bisa DIVERIFIKASI, bukan hanya dipercaya.
    const dua = susunSbom(pkg, lock);
    assert.equal(JSON.stringify(sbom), JSON.stringify(dua));
    assert.ok(!JSON.stringify(sbom).includes("timestamp"));
  });
});

describe("susunSbom atas lockfile buatan — arah merahnya dibuktikan", () => {
  test("paket ber-scope diurai pada '@' terakhir, bukan yang pertama", () => {
    const hasil = susunSbom(
      { name: "x", version: "1.0.0" },
      { packages: { "@scope/nama": ["@scope/nama@2.1.0", "", {}, "sha512-AAAA"] } }
    );
    const satu = hasil.components[0];
    assert.equal(satu.name, "@scope/nama");
    assert.equal(satu.version, "2.1.0");
    assert.equal(satu.purl, "pkg:npm/%40scope/nama@2.1.0");
  });

  test("integrity base64 dikonversi ke hex, bukan disalin", () => {
    // "AAAA" base64 = tiga byte nol; CycloneDX menuntut hex. Salinan mentah
    // akan lolos pembacaan mata dan gagal di setiap pemindai.
    const hasil = susunSbom(
      { name: "x", version: "1.0.0" },
      { packages: { a: ["a@1.0.0", "", {}, "sha512-AAAA"] } }
    );
    assert.deepEqual(hasil.components[0].hashes, [
      { alg: "SHA-512", content: "000000" }
    ]);
  });

  test("dua jalur resolusi untuk paket yang sama = satu komponen", () => {
    const hasil = susunSbom(
      { name: "x", version: "1.0.0" },
      {
        packages: {
          a: ["a@1.0.0", "", {}, "sha512-AAAA"],
          "b/a": ["a@1.0.0", "", {}, "sha512-AAAA"]
        }
      }
    );
    assert.equal(hasil.components.length, 1);
  });

  test("entri lockfile yang bentuknya tidak dikenali DITOLAK, bukan dilewati", () => {
    // Melewati yang tidak dikenali adalah cara SBOM menjadi tidak lengkap
    // tanpa ada yang tahu — bentuk kegagalan yang berkas ini ada untuk cegah.
    assert.throws(() =>
      susunSbom({ name: "x", version: "1.0.0" }, { packages: { a: [42] } })
    );
    assert.throws(() =>
      susunSbom({ name: "x", version: "1.0.0" }, { packages: { a: ["tanpa-versi"] } })
    );
  });

  test("susunPurl meng-encode scope sesuai spesifikasi purl", () => {
    assert.equal(susunPurl("biasa", "1.0.0"), "pkg:npm/biasa@1.0.0");
    assert.equal(susunPurl("@a/b", "2.0.0"), "pkg:npm/%40a/b@2.0.0");
  });
});

describe("langkah rilis", () => {
  const rilis = readFileSync("scripts/rilis.mjs", "utf8");

  test("perilis menjalankan generator SBOM", () => {
    assert.match(
      rilis,
      /bun run sbom/,
      "scripts/rilis.mjs tidak lagi menjalankan `bun run sbom` — celah 9 " +
        "ADR-0028 terbuka kembali tanpa satu pun dokumen berubah"
    );
  });

  test("SBOM ditulis SEBELUM commit rilis, sehingga ia ikut di dalam tag", () => {
    const posisiSbom = rilis.indexOf("bun run sbom");
    const posisiCommit = rilis.indexOf("git add -A");
    assert.ok(posisiCommit > -1, "langkah commit tidak ditemukan di perilis");
    assert.ok(
      posisiSbom > -1 && posisiSbom < posisiCommit,
      "langkah SBOM harus mendahului commit rilis — sesudahnya, tag terbit " +
        "tanpa SBOM dan tidak ada yang gagal"
    );
  });

  test("script `sbom` terdaftar di package.json", () => {
    assert.equal(pkg.scripts?.sbom, "bun scripts/sbom.mjs");
  });
});

describe("sbom.cdx.json yang ter-commit, bila sudah lahir", () => {
  // Berkas ini lahir pada rilis pertama. Sebelum itu, tidak ada yang diperiksa
  // — dan sesudahnya pun yang diperiksa hanya IDENTITAS, bukan kesegaran
  // (lihat docblock di atas).
  test("bila ada, ia CycloneDX yang memerikan repo ini", () => {
    if (!existsSync("sbom.cdx.json")) return;
    const isi = JSON.parse(readFileSync("sbom.cdx.json", "utf8"));
    assert.equal(isi.bomFormat, "CycloneDX");
    assert.equal(isi.metadata.component.name, pkg.name);
  });
});

describe("SBOM ditulis SESUDAH versi dinaikkan (ADR-0031)", () => {
  const perilis = readFileSync("scripts/rilis.mjs", "utf8");

  /**
   * Cacat yang ditutupnya, dan ia sudah benar-benar terjadi sekali.
   *
   * `sbom.mjs` membaca versi dari `package.json`. Selama enam minggu perilis
   * menjalankannya SEBELUM menaikkan versi, sehingga SBOM yang masuk tag
   * `vX.Y.Z` menamai dirinya versi SEBELUMNYA — versi yang, untuk rilis pertama,
   * tidak pernah punya tag sama sekali. Konsumen hilir yang menjawab "apakah
   * rilis ini terdampak advisory X" dari tag-nya (persis tujuan ADR-0031)
   * mendapat artefak yang tidak cocok dengan tag tempat ia ditemukan.
   *
   * Yang membuatnya bertahan selama itu: perilis tidak pernah dijalankan
   * sekali pun sejak ADR-0031 ditulis, jadi tidak ada satu pun SBOM nyata untuk
   * dibandingkan dengan tagnya. Gerbang ini menggantikan pengamatan itu.
   */
  test("`bun run sbom` dipanggil setelah `pkg.version = next`", () => {
    const naikVersi = perilis.indexOf("pkg.version = next");
    const tulisSbom = perilis.indexOf("bun run sbom");

    assert.notEqual(naikVersi, -1, "scripts/rilis.mjs tidak lagi menaikkan pkg.version.");
    assert.notEqual(tulisSbom, -1, "scripts/rilis.mjs tidak lagi menulis SBOM.");
    assert.ok(
      naikVersi < tulisSbom,
      "`bun run sbom` dipanggil SEBELUM `pkg.version = next`. SBOM akan menamai " +
        "dirinya versi lama di dalam tag versi baru — persis cacat yang membuat " +
        "rilis pertama menghasilkan `pkg:npm/awcms-astro@0.1.0` di tag v0.2.0."
    );
  });

  test("keduanya tetap SEBELUM commit rilis, syarat ADR-0031 utuh", () => {
    const tulisSbom = perilis.indexOf("bun run sbom");
    // Baris yang benar-benar meng-commit, bukan baris yang MENCETAK perintahnya
    // untuk disalin manusia — keduanya memuat teks `git commit`.
    const commitRilis = perilis.indexOf("execSync(`git commit");

    assert.notEqual(commitRilis, -1, "scripts/rilis.mjs tidak lagi membuat commit rilis.");
    assert.ok(
      tulisSbom < commitRilis,
      "SBOM ditulis SESUDAH commit rilis, jadi ia tidak ikut di dalam tag — " +
        "syarat ADR-0031 yang paling dasar."
    );
  });
});
