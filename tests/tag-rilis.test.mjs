/**
 * Gerbang atas pemeriksaan keempat `audit-rilis.mjs`: setiap tag rilis DI
 * REMOTE punya GitHub Release.
 *
 * ## Kenapa dua lapis, bukan satu
 *
 * `scripts/lib/tag-rilis.mjs` memisahkan bagian MURNI — pola tag yang sah, dan
 * selisih antara tag remote dan nama Release — dari panggilan jaringan yang
 * memberinya makan. Alasannya sama dengan `scripts/lib/git.mjs` memisahkan diri
 * dari `rilis.mjs`: sebuah tes yang harus mencapai GitHub untuk membuktikan
 * "tag yang hilang dilaporkan, yang cocok tidak" adalah tes yang tidak bisa
 * jalan offline dan tidak bisa deterministik — perangkap yang sama yang dicatat
 * docblock `tests/audit-rilis.test.mjs` sendiri untuk batas usia.
 *
 * Kelas kedua adalah asersi STRUKTURAL atas `scripts/rilis.mjs`: pola yang
 * dipakai `tests/sbom.test.mjs` untuk membuktikan langkah SBOM tidak bisa
 * hilang diam-diam dari perilis, dipakai ulang di sini untuk langkah
 * `gh release create`.
 *
 * Jalankan dengan `bun test`.
 */
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { tagRilisSah, tagTanpaRilis } from "../scripts/lib/tag-rilis.mjs";

describe("tagRilisSah — pola tag rilis yang ketat", () => {
  test("vX.Y.Z diterima", () => {
    assert.equal(tagRilisSah("v1.2.3"), true);
    assert.equal(tagRilisSah("v0.6.0"), true);
  });

  test("angka ber-nol-depan ditolak", () => {
    assert.equal(tagRilisSah("v01.2.3"), false);
    assert.equal(tagRilisSah("v1.02.3"), false);
    assert.equal(tagRilisSah("v1.2.03"), false);
  });

  test("prerelease ditolak", () => {
    assert.equal(tagRilisSah("v1.2.3-rc1"), false);
  });

  test("metadata build ditolak", () => {
    assert.equal(tagRilisSah("v1.2.3+build"), false);
  });

  test("tanpa awalan `v` ditolak — itu ejaan tag git, bukan versi", () => {
    assert.equal(tagRilisSah("1.2.3"), false);
  });

  test("bukan string ditolak, bukan dilempar", () => {
    assert.equal(tagRilisSah(undefined), false);
    assert.equal(tagRilisSah(null), false);
    assert.equal(tagRilisSah(123), false);
  });
});

describe("tagTanpaRilis — selisih tag remote terhadap nama Release", () => {
  test("tag tanpa Release yang cocok dilaporkan", () => {
    const hilang = tagTanpaRilis(["v0.2.0", "v0.3.0"], ["v0.2.0"]);
    assert.deepEqual(hilang, ["v0.3.0"]);
  });

  test("setiap tag punya Release yang cocok — tidak ada yang dilaporkan", () => {
    const hilang = tagTanpaRilis(["v0.2.0", "v0.3.0"], ["v0.2.0", "v0.3.0", "v9.9.9"]);
    assert.deepEqual(hilang, []);
  });

  test("tidak ada tag sama sekali — tidak ada yang dilaporkan", () => {
    assert.deepEqual(tagTanpaRilis([], ["v0.2.0"]), []);
  });

  test("hasil terurut dan tanpa duplikat, apa pun urutan masukannya", () => {
    const hilang = tagTanpaRilis(["v0.3.0", "v0.3.0", "v0.2.0"], []);
    assert.deepEqual(hilang, ["v0.2.0", "v0.3.0"]);
  });
});

describe("rilis.mjs: langkah `gh release create` tidak hilang diam-diam", () => {
  const perilis = readFileSync("scripts/rilis.mjs", "utf8");

  test("perilis menulis catatan rilis ke berkas non-repo (`--notes-file`)", () => {
    assert.match(
      perilis,
      /os\.tmpdir\(\)/,
      "scripts/rilis.mjs tidak lagi menulis catatan rilis ke direktori temp " +
        "sistem — periksa apakah ia diam-diam menaruhnya di repo ini"
    );
  });

  test("perintah `gh release create` disebut, dengan --verify-tag dan --notes-file", () => {
    assert.match(perilis, /gh release create \$\{tag\}/);
    assert.match(perilis, /--verify-tag/);
    assert.match(perilis, /--notes-file/);
  });

  test("`--latest` ditulis EKSPLISIT (`awcms` ADR-0119), bukan diwarisi dari bawaan `gh`", () => {
    assert.match(
      perilis,
      /gh release create[^\n]*--latest/,
      "`--latest` hilang dari perintah — ini persis pola yang ADR-0119 " +
        "`awcms` vonis `diperiksa`, dicatat harus dibaca ulang begitu repo ini " +
        "punya alur rilis sendiri"
    );
  });

  test("perilis TIDAK menjalankan `gh release create` sendiri — hanya mencetaknya", () => {
    // `--verify-tag` menolak tag yang belum ada di remote, dan perilis ini
    // sengaja tidak pernah mendorong apa pun. Menjalankannya (bukan
    // mencetaknya) berarti melanggar batas itu pada setiap rilis. Tidak ada
    // `execSync`/`gitRunInherit` atas `gh release create` di mana pun di berkas
    // ini — satu-satunya bentuk yang boleh ada adalah `console.log` (langsung
    // atau lewat `gilirGhRelease`).
    assert.doesNotMatch(
      perilis,
      /(execSync|gitRunInherit)\([^)]*gh release create/s,
      "scripts/rilis.mjs tampak MENJALANKAN gh release create, bukan sekadar " +
        "mencetaknya — ini melanggar batas perilis yang tidak pernah mendorong"
    );
  });

  test("langkah tercetak di KEDUA cabang — dengan dan tanpa --commit", () => {
    // `gilirGhRelease` didefinisikan sekali, sebelum percabangan `if
    // (!commit)`, dan dipanggil sekali di setiap cabang — periksa keduanya
    // secara terpisah lewat baris commit-nya masing-masing.
    const posisiPushTanpaCommit = perilis.indexOf(
      "console.log(`  git push && git push origin ${tag}`);"
    );
    const posisiExitTanpaCommit = perilis.indexOf("process.exit(0);", posisiPushTanpaCommit);
    assert.ok(posisiPushTanpaCommit > -1, "cabang tanpa --commit tidak lagi mencetak git push");
    assert.ok(
      perilis.slice(posisiPushTanpaCommit, posisiExitTanpaCommit).includes("gilirGhRelease"),
      "cabang TANPA --commit tidak lagi mencetak langkah gh release create"
    );

    const posisiCommitDibuat = perilis.indexOf("gitRunInherit('.', 'commit'");
    assert.ok(posisiCommitDibuat > -1, "cabang --commit tidak lagi membuat commit rilis");
    assert.match(
      perilis.slice(posisiCommitDibuat),
      /gilirGhRelease/,
      "cabang DENGAN --commit tidak lagi mencetak langkah gh release create"
    );
  });

  test("langkah gh release create dicetak SESUDAH `git push origin <tag>` di kedua cabang", () => {
    const posisiPushTanpaCommit = perilis.indexOf(
      "console.log(`  git push && git push origin ${tag}`);"
    );
    const posisiGhTanpaCommit = perilis.indexOf("gilirGhRelease(", posisiPushTanpaCommit);
    assert.ok(posisiPushTanpaCommit > -1 && posisiGhTanpaCommit > posisiPushTanpaCommit);

    const posisiPushCommit = perilis.indexOf(
      "console.log(`\\n${tag} dibuat. Dorong dengan: git push && git push origin ${tag}`);"
    );
    const posisiGhCommit = perilis.indexOf("gilirGhRelease(", posisiPushCommit);
    assert.ok(posisiPushCommit > -1 && posisiGhCommit > posisiPushCommit);
  });
});
