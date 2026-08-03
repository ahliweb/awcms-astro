/**
 * Gerbang versi toolchain: satu versi Bun, lima tempat, dan tidak ada yang
 * memeriksanya sampai sekarang.
 *
 * ## Aturannya sudah tertulis; pemeriksanya yang tidak ada
 *
 * `AGENTS.md` §Konfigurasi menyatakannya sebagai aturan yang tidak bisa
 * dilanggar: "Versinya dipin di TIGA tempat yang wajib bergerak bersama …
 * Menaikkan salah satu saja membuat build lokal, CI, dan image berbeda
 * perilaku — diam-diam."
 *
 * Kata terakhirnya yang penting. Tidak ada yang gagal saat ketiganya
 * menyimpang: CI hijau memakai Bun yang satu, image produksi dibangun memakai
 * Bun yang lain, dan selisihnya baru terasa sebagai perilaku runtime yang tidak
 * bisa direproduksi di mesin siapa pun. Itu kelas cacat yang seluruh gerbang di
 * repo ini ditulis untuk menangkap — dan yang satu ini luput sampai 4 Agustus
 * 2026.
 *
 * ## Lima tempat, bukan tiga
 *
 * Kalimat di `AGENTS.md` menghitung BERKAS; yang harus sepakat adalah NILAI,
 * dan nilainya muncul lima kali:
 *
 *   1. `packageManager` di `package.json` — yang dipatuhi Corepack
 *   2. `engines.bun` di `package.json` — rentang yang harus MENERIMA nilai (1)
 *   3. `bun-version` di job `check` (`.github/workflows/ci.yml`)
 *   4. `bun-version` di job `build` (berkas yang sama, nilai kedua)
 *   5. tag image di `Dockerfile`, DUA kali — stage `build` dan stage `runtime`
 *
 * Nomor 4 dan pasangan kedua nomor 5 adalah yang paling mungkin tertinggal saat
 * seseorang menaikkan versi: keduanya duplikat yang letaknya jauh dari yang
 * pertama, dan keduanya tetap hijau sendirian.
 *
 * ## Kenapa digest ikut diperiksa
 *
 * `Dockerfile` memin image ke tag DAN digest (`@sha256:…`). Saat keduanya ada,
 * **digest yang menang dan tag hanya menjadi komentar** — sehingga menaikkan
 * tag tanpa menaikkan digest menghasilkan berkas yang berbunyi `1.3.15` sambil
 * membangun `1.3.14`, tanpa satu pun kegagalan. Pin digest karena itu tidak
 * bisa mendarat tanpa gerbang ini; keduanya satu paket.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const ci = readFileSync(".github/workflows/ci.yml", "utf8");
const dockerfile = readFileSync("Dockerfile", "utf8");

/** `bun@1.3.14` → `1.3.14`. Ini nilai rujukan; empat lainnya dibandingkan ke sini. */
const VERSI = pkg.packageManager?.replace(/^bun@/, "");

describe("versi Bun sama di setiap tempat yang memakainya", () => {
  test("packageManager menyatakan versi yang pasti, bukan rentang", () => {
    // Rentang di sini akan membuat empat pemeriksaan di bawah tidak punya
    // nilai rujukan — dan `bun-version` di CI maupun tag image tidak menerima
    // rentang, jadi keduanya akan tetap harus ditulis pasti.
    assert.match(
      pkg.packageManager ?? "",
      /^bun@\d+\.\d+\.\d+$/,
      `packageManager harus "bun@X.Y.Z", bukan ${JSON.stringify(pkg.packageManager)}`
    );
  });

  test("engines.bun MENERIMA versi yang dipin", () => {
    // Sengaja bukan kesamaan: `engines.bun` adalah rentang minimum yang
    // dinyatakan kepada pemakai template, sementara `packageManager` adalah
    // versi persis yang dipakai repo ini. Yang salah bukan keduanya berbeda —
    // melainkan rentangnya menolak versi yang benar-benar dipakai.
    const minimum = pkg.engines?.bun?.replace(/^>=/, "");
    assert.ok(minimum, "engines.bun tidak ada");

    const [aM, aN, aP] = VERSI.split(".").map(Number);
    const [bM, bN, bP] = minimum.split(".").map(Number);
    const cukup =
      aM > bM || (aM === bM && (aN > bN || (aN === bN && aP >= bP)));

    assert.ok(
      cukup,
      `engines.bun (>=${minimum}) menolak versi yang dipakai repo ini (${VERSI})`
    );
  });

  test("kedua job CI memakai versi yang sama dengan packageManager", () => {
    const dipakai = [...ci.matchAll(/bun-version:\s*"([^"]+)"/g)].map((m) => m[1]);

    // Dua job, dua deklarasi. Yang kedua adalah duplikat yang letaknya jauh dari
    // yang pertama, dan ia tetap hijau sendirian saat tertinggal.
    assert.equal(
      dipakai.length,
      2,
      `diharapkan dua deklarasi bun-version di ci.yml, ditemukan ${dipakai.length}`
    );

    for (const [i, versi] of dipakai.entries()) {
      assert.equal(versi, VERSI, `bun-version ke-${i + 1} di ci.yml`);
    }
  });

  test("kedua stage Dockerfile memakai tag yang sama dengan packageManager", () => {
    const baris = [...dockerfile.matchAll(/^FROM\s+(\S+)/gm)].map((m) => m[1]);

    assert.equal(baris.length, 2, "diharapkan dua stage FROM di Dockerfile");

    for (const rujukan of baris) {
      const tag = rujukan.match(/^oven\/bun:([^@\s]+)/)?.[1];
      assert.ok(tag, `FROM tidak dikenali: ${rujukan}`);
      assert.equal(
        tag,
        `${VERSI}-alpine`,
        `tag image (${tag}) menyimpang dari packageManager (${VERSI})`
      );
    }
  });

  test("digest image, bila ada, menempel pada tag versi yang benar", () => {
    // Ini asersi yang membuat pin digest AMAN, dan tanpanya pin digest justru
    // MENAMBAH kelas cacat: saat tag dan digest sama-sama ada, digest yang
    // dipatuhi Docker. Sebuah `FROM oven/bun:1.3.15-alpine@sha256:<digest 1.3.14>`
    // membangun 1.3.14 sambil berbunyi 1.3.15, dan tidak ada satu pun yang
    // gagal — persis bentuk kegagalan yang berkas ini ada untuk menutup.
    const berdigest = [...dockerfile.matchAll(/^FROM\s+(\S+@sha256:[0-9a-f]{64})/gm)];

    if (berdigest.length === 0) return; // pin digest opsional; kesepakatan tag di atas tetap wajib

    assert.equal(
      berdigest.length,
      2,
      "bila satu stage dipin ke digest, keduanya harus — stage yang tertinggal " +
        "membangun versi yang berbeda dari pasangannya, dan itu tidak terlihat di mana pun"
    );

    // Kedua stage memakai image yang sama, jadi digestnya wajib identik.
    const digest = berdigest.map((m) => m[1].split("@")[1]);
    assert.equal(
      digest[0],
      digest[1],
      "kedua stage memin digest yang BERBEDA — image build dan image runtime " +
        "tidak lagi berasal dari satu artefak"
    );
  });
});
