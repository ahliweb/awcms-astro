/**
 * Gerbang ADR-0038: kebutuhan backend menjadi MODUL di `awcms`, dan repo ini
 * tetap tanpa backend.
 *
 * Aturannya sudah berlaku secara moral sejak ADR-0020 dan tidak punya satu
 * pemeriksa pun selama itu — sementara bentuk pelanggarannya bukan
 * pembangkangan melainkan langkah paling masuk akal yang tersedia: sebuah situs
 * turunan butuh formulir kontak yang tersimpan atau langganan buletin, dan yang
 * paling dekat dari tempat orang itu berdiri adalah satu rute di sini plus satu
 * tabel "sementara". Setiap gerbang lain tetap hijau saat itu terjadi:
 * `tests/peran-situs.test.mjs` hanya menuntut rute on-demand DINYATAKAN (bukan
 * bahwa ia tidak memiliki data), dan `bun run audit:konten` membaca keluaran
 * build, tempat sebuah tabel tidak muncul.
 *
 * Empat asersi, dan masing-masing menjaga cacat yang berbeda:
 *
 *   1. **Dependency kelas backend.** Satu `bun add` adalah seluruh jarak antara
 *      template ini dan sebuah backend. Tidak ada gerbang lain di repo ini yang
 *      membaca `package.json` menurut KELAS paketnya.
 *   2. **Jalur tulis ke `awcms`.** Sampai `awcms` ADR-0092, "build ini tidak
 *      bisa menulis" adalah sifat KELAS kredensial mesin. Sejak kelas tulis ada
 *      di sana, ia properti yang harus dijaga sendiri — di sisi penerbitan token
 *      (ADR-0018) dan di sisi kode, yaitu di sini.
 *   3. **Artefak persistensi.** Skema yang mendarat sebelum kodenya, lalu
 *      "sudah terlanjur ada" menjadi argumen.
 *   4. **Kontrak kerja yang menua menjadi salah.** `AGENTS.md` pernah menyuruh
 *      membangun layar admin di sini selama satu hari penuh setelah
 *      keputusannya dicabut (ADR-0020 §Konsekuensi).
 *
 * Yang gerbang ini TIDAK lihat, dan disebut supaya tidak dikira terjaga: ia
 * memeriksa BENTUK, bukan niat. Situs yang menyimpan datanya di layanan pihak
 * ketiga lewat `GET` ke API mereka lolos keempat asersi.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const paket = JSON.parse(readFileSync("package.json", "utf8"));

/**
 * Denylist per KELAS, bukan daftar-izin.
 *
 * Alasannya di ADR-0038 §Ditolak: sebuah allowlist menjadikan tiap paket sah
 * yang baru sebagai pekerjaan, dan gerbang yang merepotkan pada hal yang benar
 * akan dimatikan. Daftar di bawah menyatakan apa yang dilarang beserta
 * alasannya, dan tetap diam untuk seluruh sisanya — `compression` di
 * `dependencies` hari ini adalah contohnya: ia middleware penyaji berkas
 * statis, bukan kemampuan backend.
 *
 * Menambah baris: sebutkan KELASNYA, jangan menambah paket ke kelas yang salah
 * demi memerahkan sesuatu. Yang menentukan bukan nama paketnya melainkan
 * kemampuan yang ia bawa masuk.
 */
const KELAS_BACKEND = [
  {
    kelas: "driver basis data",
    paket: [
      "pg",
      "postgres",
      "mysql",
      "mysql2",
      "mariadb",
      "sqlite3",
      "better-sqlite3",
      "mongodb",
      "oracledb",
      "mssql",
      "cassandra-driver",
      "@neondatabase/serverless",
      "@vercel/postgres"
    ]
  },
  {
    kelas: "ORM, query builder, atau alat migrasi",
    paket: [
      "prisma",
      "@prisma/client",
      "drizzle-orm",
      "drizzle-kit",
      "typeorm",
      "sequelize",
      "@mikro-orm/core",
      "kysely",
      "knex",
      "mongoose",
      "node-pg-migrate",
      "db-migrate",
      "umzug"
    ]
  },
  {
    kelas: "framework server atau router HTTP",
    paket: [
      "express",
      "fastify",
      "hono",
      "koa",
      "restify",
      "polka",
      "@hapi/hapi",
      "@nestjs/core",
      "@trpc/server"
    ]
  },
  {
    kelas: "antrean, penjadwal, atau cache berbagi",
    paket: [
      "bullmq",
      "bull",
      "agenda",
      "amqplib",
      "kafkajs",
      "nats",
      "redis",
      "ioredis",
      "node-cron",
      "node-schedule"
    ]
  },
  {
    kelas: "sesi, kata sandi, atau penerbitan token",
    paket: [
      "express-session",
      "cookie-session",
      "iron-session",
      "passport",
      "next-auth",
      "@auth/core",
      "lucia",
      "jsonwebtoken",
      "jose",
      "bcrypt",
      "bcryptjs",
      "argon2",
      "@node-rs/argon2",
      "otplib",
      "speakeasy"
    ]
  }
];

/** Berkas kode yang gerbang ini baca — bukan `server/`, yang MENYAJIKAN. */
function berkasKode() {
  const ditemukan = [];

  for (const dir of ["src", "scripts"]) {
    for (const nama of new Bun.Glob("**/*.{astro,ts,mjs,js}").scanSync(dir)) {
      ditemukan.push(`${dir}/${nama}`);
    }
  }

  return ditemukan;
}

/**
 * Komentar dibuang lebih dulu. Berkas di repo ini MEMERIKAN aturan jauh lebih
 * sering daripada melanggarnya — `src/lib/awcms/tenant.ts` menyebut
 * `POST /api/v1/access/machine-credentials` dalam docblock justru untuk
 * menjelaskan cara menerbitkan token yang benar — dan gerbang yang menghitung
 * docblock akan merah atas kalimat yang menjelaskannya.
 */
function tanpaKomentar(isi) {
  return isi
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
}

describe("tidak ada kemampuan backend yang masuk lewat dependency", () => {
  test("package.json tidak memuat satu pun paket kelas backend", () => {
    const terpasang = new Set([
      ...Object.keys(paket.dependencies ?? {}),
      ...Object.keys(paket.devDependencies ?? {})
    ]);

    const pelanggaran = [];

    for (const { kelas, paket: daftar } of KELAS_BACKEND) {
      for (const nama of daftar) {
        if (terpasang.has(nama)) pelanggaran.push(`${nama} (${kelas})`);
      }
    }

    assert.deepEqual(
      pelanggaran,
      [],
      "paket ini membawa kemampuan backend ke repo yang seluruh posturnya " +
        "bersandar pada tidak adanya backend (ADR-0038). Bila kebutuhannya " +
        "nyata, ia sebuah MODUL di `awcms` — lewat admission modul di sana — " +
        "bukan dependency di sini."
    );
  });
});

describe("repo ini membaca awcms, ia tidak menulis", () => {
  test("tidak ada permintaan ber-`method` selain GET di src/ dan scripts/", () => {
    // Literal, bukan variabel: sebuah verb yang disimpan di variabel lolos, dan
    // itu disebut di ADR-0038 §4 sebagai batas yang diketahui. Yang dijaga di
    // sini adalah bentuk yang benar-benar akan ditulis orang saat menambah satu
    // panggilan tulis — `method: "POST"` di dalam opsi `fetch`.
    const pelanggaran = [];

    for (const nama of berkasKode()) {
      const isi = tanpaKomentar(readFileSync(nama, "utf8"));

      for (const cocok of isi.matchAll(
        /method\s*:\s*["'`](POST|PUT|PATCH|DELETE)["'`]/gi
      )) {
        pelanggaran.push(`${nama}: method: "${cocok[1]}"`);
      }
    }

    assert.deepEqual(
      pelanggaran,
      [],
      "sebuah jalur TULIS ke awcms mendarat tanpa dinyatakan (ADR-0038 §3). " +
        "Token build repo ini diterbitkan tanpa satu pun aksi tulis, dan sejak " +
        "`awcms` ADR-0092 itu properti barisnya — bukan sifat kelasnya. Bila " +
        "jalur tulis memang disengaja (BFF ADR-0014), ia butuh kredensial " +
        "kelas tulis di sana dan amandemen ADR di sini."
    );
  });
});

describe("tidak ada artefak persistensi di repo ini", () => {
  test("tidak ada berkas .sql maupun direktori migrasi", () => {
    const artefak = [];

    for (const dir of ["src", "scripts", "server", "tests", "public"]) {
      for (const nama of new Bun.Glob("**/*.sql").scanSync(dir)) {
        artefak.push(`${dir}/${nama}`);
      }
    }

    for (const jalur of [
      "sql",
      "migrations",
      "prisma",
      "drizzle.config.ts",
      "drizzle.config.js",
      "drizzle.config.mjs",
      "knexfile.ts",
      "knexfile.js",
      "ormconfig.json"
    ]) {
      if (existsSync(jalur)) artefak.push(jalur);
    }

    assert.deepEqual(
      artefak,
      [],
      "artefak persistensi mendarat di repo tanpa basis data (ADR-0038). " +
        "Skema yang mendarat sebelum kodenya adalah cara sebuah backend masuk " +
        "tanpa pernah diputuskan: berikutnya, 'sudah terlanjur ada' menjadi " +
        "argumennya."
    );
  });
});

describe("dokumen menyatakan aturan yang sama dengan kodenya", () => {
  test("AGENTS.md menyebut bahwa kebutuhan backend menjadi modul di awcms", () => {
    const isi = readFileSync("AGENTS.md", "utf8");

    assert.match(
      isi,
      /ADR-0038/,
      "AGENTS.md tidak menyebut ADR-0038 — kontrak kerja adalah yang dibaca " +
        "agen berikutnya sebelum menyentuh apa pun"
    );
    assert.match(
      isi,
      /kebutuhan backend[\s\S]{0,200}?modul/i,
      "AGENTS.md tidak lagi menyatakan bahwa sebuah kebutuhan backend menjadi " +
        "MODUL di `awcms`. Tanpa kalimat itu, pekerjaan berikutnya mendarat di " +
        "repo yang keliru — dan itu sudah pernah terjadi di sini (ADR-0020)"
    );
  });
});
