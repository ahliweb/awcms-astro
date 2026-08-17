#!/usr/bin/env bun
/**
 * Menurunkan SBOM CycloneDX dari `bun.lock`, ditulis ke `sbom.cdx.json` pada
 * setiap rilis (ADR-0031; celah 9 ADR-0028; NIST SSDF PS.2).
 *
 * ## Kenapa berkas ini ada
 *
 * Tanpa SBOM, konsumen hilir yang membaca advisory baru tidak bisa menjawab
 * "apakah rilis vX.Y.Z terdampak?" tanpa meng-checkout tag-nya lalu membangun
 * ulang pohon dependency-nya sendiri. `bun.lock` sudah memuat seluruh jawaban —
 * nama, versi persis, dan integrity hash setiap paket — tetapi dalam bentuk
 * yang tidak dibaca satu pun pemindai SBOM. Skrip ini menerjemahkannya ke
 * format yang dibaca semuanya.
 *
 * ## Tiga keputusan bentuk, dan alasannya
 *
 *   1. **CycloneDX, bukan SPDX.** Postur keamanan repo ini berjangkar ke OWASP
 *      (Top 10, ASVS, Secure Headers — ADR-0028); CycloneDX adalah format OWASP
 *      dan dirancang untuk SBOM aplikasi. Satu keluarga rujukan, bukan dua.
 *   2. **Ditulis sendiri dari `bun.lock`, bukan memanggil generator pihak
 *      ketiga.** Generator npm yang ada membaca `package-lock.json` — yang repo
 *      ini tidak punya — dan menambah dependency justru pada langkah yang
 *      tugasnya MENGINVENTARISASI dependency. Seluruh data sudah di lockfile;
 *      yang dibutuhkan hanya penerjemahan bentuk.
 *   3. **Deterministik: tanpa timestamp, tanpa serialNumber, komponen terurut.**
 *      Regenerasi pada tag yang sama wajib menghasilkan byte yang identik,
 *      supaya siapa pun bisa memverifikasi `sbom.cdx.json` di sebuah tag memang
 *      diturunkan dari `bun.lock` di sebelahnya — properti yang hilang begitu
 *      ada satu field yang berubah setiap kali skrip dijalankan.
 *
 * ## Kapan ia berjalan
 *
 * `scripts/rilis.mjs` menjalankannya SEBELUM commit rilis, sehingga
 * `sbom.cdx.json` ikut di dalam tag. Di antara dua rilis berkasnya boleh
 * tertinggal dari `bun.lock` — SBOM memerikan RILIS, bukan pohon kerja, dan
 * gerbang yang menuntut keduanya selalu sinkron akan memerahkan setiap PR bump
 * dependency sampai seseorang melonggarkannya (persis pola yang §Gerbang mutu
 * larang). Yang dijaga `tests/sbom.test.mjs` adalah generatornya benar dan
 * langkah rilisnya tidak hilang diam-diam.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// Re-exported: tests/sbom.test.mjs imports the scanner from this module, and the
// SBOM is the artifact whose correctness depends on the lockfile parsing right.
export { buangTrailingComma } from "./lib/lockfile.mjs";
import { buangTrailingComma } from "./lib/lockfile.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");


/**
 * `pkg:npm/...` sesuai spesifikasi purl: namespace scoped di-percent-encode
 * (`@astrojs` → `%40astrojs`), nama dan versi menyusul apa adanya.
 *
 * @param {string} nama nama paket, mungkin ber-scope (`@scope/nama`)
 * @param {string} versi
 * @returns {string}
 */
export function susunPurl(nama, versi) {
  if (nama.startsWith("@")) {
    const [scope, sisa] = nama.split("/", 2);
    return `pkg:npm/${encodeURIComponent(scope)}/${sisa}@${versi}`;
  }
  return `pkg:npm/${nama}@${versi}`;
}

/**
 * Menyusun dokumen CycloneDX dari isi `package.json` dan `bun.lock` yang sudah
 * ter-parse. Murni: tanpa I/O, tanpa waktu — supaya bisa dibuktikan tes dua
 * arah atas lockfile buatan, dan supaya keluarannya deterministik.
 *
 * @param {{ name?: string, version?: string }} pkg
 * @param {{ packages?: Record<string, unknown[]> }} lock
 * @returns {Record<string, unknown>}
 */
export function susunSbom(pkg, lock) {
  /** @type {Map<string, Record<string, unknown>>} */
  const komponen = new Map();

  for (const [kunci, entri] of Object.entries(lock.packages ?? {})) {
    if (!Array.isArray(entri) || typeof entri[0] !== "string") {
      throw new Error(
        `Entri lockfile "${kunci}" tidak berbentuk [id, ...] — format bun.lock berubah, dan SBOM yang menebak lebih buruk daripada yang gagal.`
      );
    }

    // `@scope/nama@1.2.3` — pemisah nama/versi adalah '@' TERAKHIR, karena
    // scope juga memakai '@'.
    const id = entri[0];
    const batas = id.lastIndexOf("@");
    if (batas <= 0) {
      throw new Error(`Entri lockfile "${kunci}" tanpa versi: ${JSON.stringify(id)}`);
    }
    const nama = id.slice(0, batas);
    const versi = id.slice(batas + 1);

    // Satu paket bisa muncul di beberapa kunci (jalur nested untuk resolusi
    // versi ganda). SBOM menginventarisasi PAKET, bukan jalur resolusinya —
    // id yang sama = satu komponen.
    if (komponen.has(id)) continue;

    /** @type {Record<string, unknown>} */
    const satu = {
      type: "library",
      name: nama,
      version: versi,
      purl: susunPurl(nama, versi)
    };

    // Elemen terakhir entri adalah integrity `sha512-<base64>` untuk paket
    // registry. CycloneDX menuntut hex, bukan base64 — dikonversi, bukan
    // disalin. Paket tanpa integrity (mis. workspace) tetap masuk tanpa hash:
    // menghilangkan barisnya berarti SBOM yang diam-diam tidak lengkap.
    const buntut = entri[entri.length - 1];
    if (typeof buntut === "string" && buntut.startsWith("sha512-")) {
      satu.hashes = [
        {
          alg: "SHA-512",
          content: Buffer.from(buntut.slice("sha512-".length), "base64").toString("hex")
        }
      ];
    }

    komponen.set(id, satu);
  }

  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    version: 1,
    metadata: {
      component: {
        type: "application",
        name: pkg.name ?? "tanpa-nama",
        version: pkg.version ?? "0.0.0",
        purl: susunPurl(pkg.name ?? "tanpa-nama", pkg.version ?? "0.0.0")
      }
    },
    components: [...komponen.values()].sort((a, b) =>
      String(a.purl).localeCompare(String(b.purl))
    )
  };
}

if (import.meta.main) {
  const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
  const lock = JSON.parse(
    buangTrailingComma(readFileSync(join(repoRoot, "bun.lock"), "utf8"))
  );

  const sbom = susunSbom(pkg, lock);
  const tujuan = join(repoRoot, "sbom.cdx.json");
  writeFileSync(tujuan, `${JSON.stringify(sbom, null, 2)}\n`);

  console.log(
    `sbom.cdx.json: ${sbom.components.length} komponen dari ${Object.keys(lock.packages ?? {}).length} entri lockfile (${pkg.name}@${pkg.version}).`
  );
}
