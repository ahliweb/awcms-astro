#!/usr/bin/env bun
/**
 * Memastikan `bun.lock` benar-benar milik `package.json` di repo ini.
 *
 * ## Kenapa gerbang ini ada
 *
 * Repo ini lahir dari menyalin repo lain: `package.json`-nya ditulis ulang
 * sementara lockfile-nya ikut terbawa apa adanya, dan setiap CI run memasang
 * `sharp` serta `@astrojs/markdown-remark` yang tidak dideklarasi siapa pun —
 * dengan exit 0, karena `npm ci` menolak lockfile yang KURANG tetapi menerima
 * lockfile yang BERLEBIH tanpa sepatah kata pun.
 *
 * Sejak ADR-0015 repo ini memakai Bun, dan `bun install --frozen-lockfile`
 * memang lebih ketat daripada `npm ci`. Gerbang ini tetap dipertahankan karena
 * tiga hal yang tidak dijawab perintah itu:
 *
 *   1. Ia berjalan **sebelum** dependency dipasang dan tanpa jaringan, sehingga
 *      kegagalannya terbaca "lockfile menyimpang" — bukan kegagalan install
 *      yang harus ditebak sebabnya.
 *   2. Ia memeriksa **identitas** lockfile (`workspaces[""].name`). Lockfile
 *      hasil salinan repo lain persis dikenali dari sini, dan itu justru cacat
 *      yang benar-benar pernah terjadi di repo ini.
 *   3. Ia menyatakan aturannya sebagai kode yang bisa dibaca, bukan sebagai
 *      perilaku implisit sebuah flag yang bisa berubah antar versi Bun.
 *
 * ## Apa yang diperiksa
 *
 * Nama workspace root dan SELURUH blok dependency di entri root lockfile harus
 * sama persis dengan `package.json`. Murni pembacaan berkas — tanpa jaringan,
 * tanpa `node_modules`, jadi aman dijalankan sebelum `bun install`.
 *
 * ## Yang SENGAJA tidak diperiksa
 *
 * Isi pohon di luar entri root, dan **versi proyek**: `bun.lock` tidak merekam
 * `version` sama sekali (berbeda dari `package-lock.json` yang menyimpannya di
 * dua tempat). Karena itu menaikkan versi rilis tidak lagi bisa membuat
 * lockfile hanyut — satu kelas cacat yang hilang dengan sendirinya setelah
 * pindah ke Bun.
 *
 * Regenerasi lockfile: `rm -rf node_modules bun.lock && bun install`.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * `bun.lock` adalah JSONC: ia memakai trailing comma, yang ditolak `JSON.parse`.
 * Menghapusnya dengan regex sederhana salah — koma di dalam string ("a, b")
 * bisa ikut termakan. Pemindai di bawah melacak keadaan string dan escape, lalu
 * hanya membuang koma yang benar-benar di luar string dan diikuti `}` atau `]`.
 *
 * @param {string} teks
 * @returns {string}
 */
function buangTrailingComma(teks) {
  let hasil = "";
  let diDalamString = false;
  let terescape = false;

  for (let i = 0; i < teks.length; i += 1) {
    const c = teks[i];

    if (diDalamString) {
      hasil += c;
      if (terescape) terescape = false;
      else if (c === "\\") terescape = true;
      else if (c === '"') diDalamString = false;
      continue;
    }

    if (c === '"') {
      diDalamString = true;
      hasil += c;
      continue;
    }

    if (c === ",") {
      let j = i + 1;
      while (j < teks.length && /\s/.test(teks[j])) j += 1;
      if (teks[j] === "}" || teks[j] === "]") continue;
    }

    hasil += c;
  }

  return hasil;
}

/** @param {string} namaBerkas */
function bacaJsonc(namaBerkas) {
  const jalur = join(repoRoot, namaBerkas);
  try {
    return JSON.parse(buangTrailingComma(readFileSync(jalur, "utf8")));
  } catch (error) {
    console.error(`Tidak bisa membaca ${namaBerkas}: ${error.message}`);
    process.exit(1);
  }
}

const pkg = bacaJsonc("package.json");
const lock = bacaJsonc("bun.lock");
const akar = lock.workspaces?.[""];

const masalah = [];

if (!akar) {
  masalah.push(
    'bun.lock tidak punya entri workspace root (workspaces[""]). Regenerasi lockfile.'
  );
}

if (lock.lockfileVersion === undefined) {
  masalah.push(
    "bun.lock tidak menyatakan lockfileVersion — kemungkinan besar bukan lockfile Bun."
  );
}

if (akar && akar.name !== pkg.name) {
  masalah.push(
    `Entri root lockfile name = ${JSON.stringify(akar.name)}, package.json name = ${JSON.stringify(pkg.name)}. Lockfile ini milik proyek lain.`
  );
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
      masalah.push(
        `${blok}: "${nama}" ada di package.json tetapi tidak di bun.lock.`
      );
    } else if (diLock[nama] !== rentang) {
      masalah.push(
        `${blok}: "${nama}" diminta ${rentang} di package.json, tetapi bun.lock mencatat ${diLock[nama]}.`
      );
    }
  }

  for (const nama of Object.keys(diLock)) {
    if (!(nama in diManifest)) {
      masalah.push(
        `${blok}: "${nama}" ada di bun.lock tetapi TIDAK dideklarasi package.json — ia tetap terpasang di setiap install.`
      );
    }
  }
}

if (masalah.length > 0) {
  console.error("bun.lock tidak sinkron dengan package.json:\n");
  for (const baris of masalah) {
    console.error(`  - ${baris}`);
  }
  console.error("\nPerbaiki dengan regenerasi penuh:");
  console.error("\n  rm -rf node_modules bun.lock && bun install\n");
  process.exit(1);
}

console.log("bun.lock sinkron dengan package.json.");
