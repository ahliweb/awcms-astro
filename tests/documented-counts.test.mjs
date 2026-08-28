/**
 * Counts a document states that the repo itself decides.
 *
 * ## The defect
 *
 * Four documents told the reader how many gate files `bun test` runs. They said
 * **21**. The real number on 28 August 2026 was 37, and two of the four were the
 * documents a newcomer reads FIRST: the gate skill, and the checklist for
 * deriving a new site.
 *
 * Nothing broke when a gate was added. That is the whole shape of it — the count
 * decayed one file at a time, each addition individually invisible, and every one
 * of the nine gates stayed green through all of it. The same row also promised
 * "three meta-tests that re-run the three audit scripts" while six meta-tests were
 * re-running six of seven.
 *
 * This is the class [ADR-0030](../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)
 * exists to close, and it is worse here than usual for one reason: the drifting
 * sentence lives in `awcms-astro-gerbang/SKILL.md`, the document whose entire
 * subject is which checkers exist. A reader who wants to know what is guarded is
 * handed a number, and the number is the one thing on the page nobody guards.
 *
 * ## Why a count and not a list
 *
 * A list would be gated by its own contents and could not drift; it would also be
 * unreadable, and the row exists to give a reader scale at a glance. So the count
 * stays and gets a checker — which is the trade ADR-0030 always names: keep the
 * firm sentence, and make something read it.
 *
 * ## What is deliberately NOT checked
 *
 * **That the count is the RIGHT size.** Nothing here argues 38 gates is enough,
 * or that a gate earns its place. This file asserts only that the documents
 * report the repo truthfully.
 *
 * **Prose that spells its number in words.** Both mirrors were rewritten to
 * digits so one regex serves them; a future "three" written back in would read as
 * a missing count and fail loudly rather than parse to something wrong. That is
 * the intended direction of the failure.
 */
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

/** Every gate file `bun test` picks up — the number the documents quote. */
const BERKAS_TES = readdirSync("tests").filter((f) => f.endsWith(".test.mjs"));

/** The meta-tests: the ones that re-run an audit script over a fixture tree. */
const META_TES = BERKAS_TES.filter((f) => f.startsWith("audit-"));

/**
 * Where each count is written, and how to read it back out.
 *
 * Both mirrors of both documents are listed. A pair kept in one language only is
 * how a correction lands on the English source and leaves the Indonesian reader
 * with the old number — the exact asymmetry ADR-0039 makes possible by having a
 * mirror at all.
 */
const DOKUMEN = [
  ".claude/skills/awcms-astro-gerbang/SKILL.md",
  ".claude/skills/awcms-astro-gerbang/SKILL.id.md",
  "docs/awcms-astro/checklist-repo-baru.md",
  "docs/awcms-astro/checklist-repo-baru.id.md"
];

/** The skill row is the only place the meta-test count is written. */
const DOKUMEN_META = [
  ".claude/skills/awcms-astro-gerbang/SKILL.md",
  ".claude/skills/awcms-astro-gerbang/SKILL.id.md"
];

/**
 * Reads the gate-file count out of one document.
 *
 * Anchored on the literal `` `bun test` `` followed by the number, which is how
 * both documents write it in both languages ("38 files", "38 berkas",
 * "38 gate files", "38 berkas gerbang"). Anchoring on the surrounding prose
 * instead would need one pattern per language per document — four patterns to
 * keep in step, which is the same maintenance problem one level down.
 */
function hitunganTes(isi) {
  const cocok = isi.match(/`bun test`[^\d\n]{0,12}(\d+)/);
  return cocok ? Number(cocok[1]) : null;
}

/** Reads the meta-test count: a digit immediately before "meta-test"/"meta-tes". */
function hitunganMeta(isi) {
  const cocok = isi.match(/(\d+)\s+meta-tes/);
  return cocok ? Number(cocok[1]) : null;
}

describe("hitungan yang ditulis dokumen sama dengan yang ada di repo (ADR-0030)", () => {
  for (const jalur of DOKUMEN) {
    test(`${jalur} menyebut jumlah berkas gerbang yang benar`, () => {
      const ditulis = hitunganTes(readFileSync(jalur, "utf8"));

      assert.notEqual(
        ditulis,
        null,
        `tidak menemukan hitungan berkas gerbang di ${jalur}. Dicari angka tepat ` +
          "setelah `bun test`. Bila kalimatnya ditulis ulang — termasuk menuliskan " +
          "angkanya sebagai KATA — pindahkan juga gerbang ini; sebuah hitungan yang " +
          "tidak lagi bisa dibaca adalah hitungan yang berhenti dijaga"
      );

      assert.equal(
        ditulis,
        BERKAS_TES.length,
        `${jalur} menyebut ${ditulis} berkas gerbang, sementara tests/ berisi ` +
          `${BERKAS_TES.length}. Yang salah hampir selalu DOKUMENNYA: sebuah gerbang ` +
          "ditambahkan dan tidak ada yang menaikkan angkanya. Perbaiki keempat " +
          "dokumen sekaligus — memperbaiki satu meninggalkan tiga yang lain berbohong"
      );
    });
  }

  for (const jalur of DOKUMEN_META) {
    test(`${jalur} menyebut jumlah meta-tes yang benar`, () => {
      const ditulis = hitunganMeta(readFileSync(jalur, "utf8"));

      assert.notEqual(
        ditulis,
        null,
        `tidak menemukan hitungan meta-tes di ${jalur}. Dicari angka tepat sebelum ` +
          '"meta-tes"/"meta-test"'
      );

      assert.equal(
        ditulis,
        META_TES.length,
        `${jalur} menyebut ${ditulis} meta-tes, sementara tests/ berisi ` +
          `${META_TES.length} berkas audit-*.test.mjs`
      );
    });
  }

  test("kedua mirror menyebut angka yang sama", () => {
    // Asersi di atas sudah mengikat tiap mirror ke repo satu per satu, jadi
    // keduanya tidak bisa berbeda lagi. Yang ini menangkap bentuk gagal yang
    // TERSISA: sebuah dokumen yang kehilangan hitungannya sama sekali lolos
    // asersi kesamaan tetapi gagal di sini bersama pasangannya, dan pesan itu
    // menyebut pasangan mana yang pincang.
    const pasangan = [
      [DOKUMEN[0], DOKUMEN[1]],
      [DOKUMEN[2], DOKUMEN[3]]
    ];

    for (const [en, id] of pasangan) {
      assert.equal(
        hitunganTes(readFileSync(id, "utf8")),
        hitunganTes(readFileSync(en, "utf8")),
        `hitungan berkas gerbang berbeda antara ${en} dan ${id} — satu sisi ` +
          "diperbarui dan cerminnya tidak"
      );
    }
  });
});
