#!/usr/bin/env node
/**
 * Memastikan `package-lock.json` benar-benar milik `package.json` di repo ini.
 *
 * ## Kenapa gerbang ini ada
 *
 * `npm ci` TIDAK menangkap kelas cacat ini. Ia menolak lockfile yang KURANG —
 * dependency di manifest yang tidak ada di lock — tetapi menerima lockfile yang
 * BERLEBIH tanpa sepatah kata pun. Repo ini lahir dari menyalin repo lain, dan
 * `package.json`-nya ditulis ulang sementara lockfile-nya ikut terbawa apa
 * adanya. Hasilnya lolos `npm ci` dengan exit 0: setiap CI run dan setiap
 * clone memasang `sharp` dan `@astrojs/markdown-remark` yang tidak dideklarasi
 * siapa pun, sementara lockfile-nya masih mengaku bernama
 * `web-lalulintasmelayani.com@1.7.0`.
 *
 * `npm ls` juga tidak bisa dipakai sebagai gerbang: ia MENCETAK "extraneous"
 * lalu keluar dengan status 0 — hijau sambil melaporkan masalahnya.
 *
 * Yang berbahaya bukan `sharp`-nya. Yang berbahaya adalah lockfile berhenti
 * menjadi pernyataan tentang proyek ini: audit dependency memeriksa pohon yang
 * salah, dan versi terpasang tidak lagi bisa dibaca dari manifest.
 *
 * ## Apa yang diperiksa
 *
 * Identitas (name, version) dan SELURUH blok dependency di entri root lockfile
 * harus sama persis dengan `package.json`. Murni pembacaan berkas — tanpa
 * jaringan, tanpa `node_modules`, jadi aman dijalankan sebelum `npm ci`.
 *
 * ## Yang SENGAJA tidak diperiksa
 *
 * Isi pohon di luar entri root. Memverifikasinya menuntut penyelesaian ulang
 * dependency, dan cara termurah untuk itu — `npm install --package-lock-only` —
 * menghasilkan lockfile yang MENGHILANGKAN paket biner opsional lintas
 * platform (`@esbuild/*`, `@astrojs/compiler-binding-*`, `fsevents`). Gerbang
 * yang menuntut keluaran itu justru akan memaksa lockfile yang membuat
 * `npm ci` gagal di macOS dan Windows. Regenerasi lockfile WAJIB lewat
 * `npm install` penuh.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function bacaJson(namaBerkas) {
  const jalur = join(repoRoot, namaBerkas);
  try {
    return JSON.parse(readFileSync(jalur, "utf8"));
  } catch (error) {
    console.error(`Tidak bisa membaca ${namaBerkas}: ${error.message}`);
    process.exit(1);
  }
}

const pkg = bacaJson("package.json");
const lock = bacaJson("package-lock.json");
const akar = lock.packages?.[""];

const masalah = [];

if (!akar) {
  masalah.push(
    'package-lock.json tidak punya entri root (packages[""]). Butuh lockfileVersion 2 atau lebih.'
  );
}

if (lock.lockfileVersion < 3) {
  masalah.push(
    `lockfileVersion ${lock.lockfileVersion} — repo ini menuntut 3 (npm >= 10, sesuai "engines").`
  );
}

for (const bidang of ["name", "version"]) {
  if (lock[bidang] !== pkg[bidang]) {
    masalah.push(
      `package-lock.json ${bidang} = ${JSON.stringify(lock[bidang])}, package.json ${bidang} = ${JSON.stringify(pkg[bidang])}.`
    );
  }
  if (akar && akar[bidang] !== pkg[bidang]) {
    masalah.push(
      `Entri root lockfile ${bidang} = ${JSON.stringify(akar[bidang])}, package.json ${bidang} = ${JSON.stringify(pkg[bidang])}.`
    );
  }
}

const BLOK_DEPENDENCY = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies"
];

for (const blok of BLOK_DEPENDENCY) {
  const diManifest = pkg[blok] ?? {};
  const diLock = akar?.[blok] ?? {};

  for (const [nama, rentang] of Object.entries(diManifest)) {
    if (!(nama in diLock)) {
      masalah.push(`${blok}: "${nama}" ada di package.json tetapi tidak di lockfile.`);
    } else if (diLock[nama] !== rentang) {
      masalah.push(
        `${blok}: "${nama}" diminta ${rentang} di package.json, tetapi lockfile mencatat ${diLock[nama]}.`
      );
    }
  }

  for (const nama of Object.keys(diLock)) {
    if (!(nama in diManifest)) {
      masalah.push(
        `${blok}: "${nama}" ada di lockfile tetapi TIDAK dideklarasi package.json — ia tetap terpasang di setiap npm ci.`
      );
    }
  }
}

if (masalah.length > 0) {
  console.error("package-lock.json tidak sinkron dengan package.json:\n");
  for (const baris of masalah) {
    console.error(`  - ${baris}`);
  }
  console.error("\nPerbaiki dengan regenerasi PENUH (bukan --package-lock-only):");
  console.error("\n  rm -rf node_modules package-lock.json && npm install\n");
  process.exit(1);
}

console.log("package-lock.json sinkron dengan package.json.");
