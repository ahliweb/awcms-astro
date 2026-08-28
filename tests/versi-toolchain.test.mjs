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

/**
 * Pin TypeScript, dan apa yang diam-diam mati bila ia bergerak sendiri.
 *
 * Bentuknya sama dengan gerbang Bun di atas — dua nilai yang wajib bergerak
 * bersama — tetapi kelas cacatnya lebih sunyi. Menaikkan versi Bun yang tidak
 * sepakat menghasilkan perilaku runtime yang aneh; menaikkan TypeScript ke 7.x
 * menghasilkan **gerbang yang berhenti ada**, dengan setiap perintah tetap
 * hijau dan tabel gerbang mutu tetap berbunyi "Ya".
 *
 * `@astrojs/check` menuntut API programatik TypeScript 6.x. `awcms` sudah di
 * 7.0.2 dan karena itu kehilangan type-check seluruh berkas `.astro`-nya —
 * tercatat di manifest kompatibilitas keluarganya sebagai divergence
 * `astro-files-not-type-checked`, yang menyandarkan diri secara eksplisit pada
 * repo INI masih berada di `^6.0.3` ("which is the only reason its gate runs").
 *
 * Alasannya ditulis di ADR-0037, dan pesan gagal di bawah menyebutnya: sebuah
 * gerbang yang hanya berbunyi "harus ^6" akan dilonggarkan oleh orang
 * berikutnya yang tidak tahu apa yang ia matikan.
 */
describe("pin TypeScript menjaga gerbang astro check tetap ada (ADR-0037)", () => {
  const SEBAB =
    "`@astrojs/check` menuntut API programatik TypeScript 6.x. Menaikkannya ke 7.x " +
    "membuat `astro check` — gerbang `Type check` di rantai `bun run check` — berhenti " +
    "berjalan, TANPA satu pun perintah berubah merah. Itu keputusan tingkat keluarga " +
    "(ADR-0037), bukan pemeliharaan dependency: `awcms` sudah kehilangan type-check " +
    ".astro-nya karena berada di 7.x, dan catatan divergence di sana bersandar pada " +
    "repo ini masih di 6.x.";

  test("dependencies.typescript tetap di rentang ^6.x", () => {
    const versi = pkg.dependencies?.typescript;

    assert.ok(versi, `typescript hilang dari dependencies. ${SEBAB}`);
    assert.match(versi, /^\^6\./, `typescript dipin "${versi}", bukan ^6.x. ${SEBAB}`);
  });

  test("@astrojs/check masih terpasang — tanpanya pin di atas tidak menjaga apa pun", () => {
    // Asersi pertama sendirian bisa hijau atas repo yang sudah melepas
    // pemeriksanya: pin TypeScript-nya benar, dan yang dijaganya tidak ada lagi.
    // Keduanya karena itu satu paket, persis seperti tag dan digest di atas.
    assert.ok(
      pkg.dependencies?.["@astrojs/check"],
      "`@astrojs/check` tidak lagi terdaftar di dependencies — pin TypeScript ^6.x " +
        "berhenti menjaga apa pun, dan gerbang `Type check` berhenti ada. Bila " +
        "pelepasannya disengaja, ia mencabut ADR-0037 dan wajib dicatat sebagai celah " +
        "di docs/awcms-astro/standar-performa-dan-keamanan.md"
    );
  });
});

/**
 * The version-difference table, and the five days it was wrong.
 *
 * `standar-teknis.md` §Stack carries a table of the versions this repo pins
 * beside the ones `awcms` pins, introduced with a sentence explaining its whole
 * purpose: the difference is written down "so they are not rediscovered as
 * findings". Three documents repeated the same two numbers.
 *
 * On 23 August 2026 Dependabot #60 raised `astro` and `@astrojs/node`. The pins
 * moved; none of the three documents did. For the next five days the table
 * announced a one-minor lag that no longer existed, `astro check` and 741 tests
 * stayed green throughout, and the paragraph promising the difference would not
 * be rediscovered as a finding was itself the finding.
 *
 * That is the shape ADR-0030 names: a written rule that nothing reads. The fix
 * is not a corrected number — the number was correct once too. It is that the
 * `this repo` column now has to prove itself against `package.json` on every
 * run, in BOTH language mirrors, and cannot go stale without something failing.
 *
 * ## What is deliberately NOT checked
 *
 * **The `awcms` column.** It names another repository, and reading it would put
 * the network inside a gate that must run offline and before `bun install`. It
 * is a hand-written note and the document now says so in as many words. The
 * asymmetry is the point: one column is a claim about this repo, which can be
 * proved here; the other is a claim about a repo that is not here.
 *
 * **Which version is right.** Nothing here argues that matching `awcms` is
 * good — ADR-0037 pins `typescript` at `^6.x` precisely BECAUSE it must differ.
 * The gate checks that the table reports the pins truthfully, not what they are.
 */
describe("tabel selisih versi melaporkan package.json apa adanya (ADR-0030)", () => {
  /** The table's row label → the value in `package.json` it must equal. */
  const DIHARAPKAN = {
    Bun: () => pkg.packageManager?.replace(/^bun@/, ""),
    astro: () => pkg.dependencies?.astro,
    "@astrojs/node": () => pkg.dependencies?.["@astrojs/node"],
    typescript: () => pkg.dependencies?.typescript
  };

  const MIRROR = [
    "docs/awcms-astro/standar-teknis.md",
    "docs/awcms-astro/standar-teknis.id.md"
  ];

  /** `| a | b | c |` → `["a", "b", "c"]`. */
  const sel = (baris) =>
    baris
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((s) => s.trim());

  const polos = (s) => s.replace(/`/g, "");

  /**
   * Reads the table out of one mirror as `label → {awcms, sini}`.
   *
   * Anchored on the header cell `` `awcms` `` rather than on the first column's
   * heading, which is the one cell of the header that is spelled identically in
   * English and Indonesian — so a single parser serves both mirrors and neither
   * can drift into being parsed by a rule the other does not share.
   */
  function bacaTabel(jalur) {
    const baris = readFileSync(jalur, "utf8").split("\n");
    const kepala = baris.findIndex(
      (b) => b.startsWith("|") && sel(b)[1] === "`awcms`"
    );
    if (kepala === -1) return null;

    const isi = new Map();
    // +2 skips the header row and the `| --- |` separator beneath it.
    for (let i = kepala + 2; i < baris.length && baris[i].startsWith("|"); i++) {
      const c = sel(baris[i]);
      isi.set(polos(c[0]), { awcms: polos(c[1]), sini: polos(c[2]) });
    }
    return isi;
  }

  for (const jalur of MIRROR) {
    test(`${jalur} mendaftarkan persis nilai yang digerbangi`, () => {
      const tabel = bacaTabel(jalur);
      assert.ok(
        tabel,
        `tabel selisih versi tidak ditemukan di ${jalur} — dicari baris tabel ` +
          "yang sel keduanya `awcms`. Bila tabelnya dipindahkan atau ditulis " +
          "ulang, pindahkan juga gerbang ini; menghapusnya diam-diam " +
          "mengembalikan persis cacat yang ia tutup"
      );

      // Sengaja kesamaan himpunan, bukan subset. Baris BARU yang tidak
      // digerbangi adalah cara berikutnya tabel ini menjadi salah tanpa ada
      // yang gagal — sebuah dependency ditambahkan ke tabel, tidak ke
      // DIHARAPKAN, dan ia hanyut persis seperti dua baris sebelumnya.
      assert.deepEqual(
        [...tabel.keys()].sort(),
        Object.keys(DIHARAPKAN).sort(),
        `baris tabel di ${jalur} tidak sama dengan yang digerbangi di sini. ` +
          "Menambah baris berarti menambah entri di DIHARAPKAN pada berkas ini"
      );
    });

    test(`kolom "repo ini" di ${jalur} sama dengan package.json`, () => {
      const tabel = bacaTabel(jalur);
      assert.ok(tabel, `tabel selisih versi tidak ditemukan di ${jalur}`);

      for (const [label, nilai] of Object.entries(DIHARAPKAN)) {
        const baris = tabel.get(label);
        assert.ok(baris, `baris \`${label}\` hilang dari ${jalur}`);
        assert.equal(
          baris.sini,
          nilai(),
          `${jalur} menuliskan \`${label}\` di repo ini sebagai "${baris.sini}", ` +
            `sementara package.json memin "${nilai()}". Yang salah hampir selalu ` +
            "DOKUMENNYA: sebuah bump menaikkan pin dan tidak ada yang menurunkan " +
            "tabelnya. Perbaiki tabel — jangan pin-nya — kecuali bump itu sendiri " +
            "yang tidak diinginkan"
        );
      }
    });
  }

  test("kedua mirror menuliskan angka yang sama", () => {
    // Asersi di atas mengikat tiap mirror ke package.json satu per satu, jadi
    // kolom "repo ini" sudah tidak bisa berbeda. Kolom `awcms` tidak diikat ke
    // apa pun — ia catatan tangan — sehingga ia satu-satunya tempat sebuah
    // pembaruan sisi tunggal bisa lolos, dan di sinilah ia tertangkap.
    const [en, id] = MIRROR.map(bacaTabel);
    assert.ok(en && id, "salah satu mirror tidak punya tabel selisih versi");

    for (const [label, baris] of en) {
      assert.equal(
        id.get(label)?.awcms,
        baris.awcms,
        `kolom \`awcms\` untuk \`${label}\` berbeda antar mirror: ` +
          `"${baris.awcms}" versus "${id.get(label)?.awcms}". Satu sisi ` +
          "diperbarui dan pasangannya tidak"
      );
    }
  });
});
