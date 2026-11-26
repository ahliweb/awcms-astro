/**
 * Gerbang analisis statik (celah 7 ADR-0028): workflow `keamanan.yml` ada,
 * dipin ke SHA, tanpa upload SARIF, dan MENYATAKAN cakupannya. Menggantikan
 * `analisis-statik.test.mjs` yang menjaga CodeQL (standar lintas-portofolio
 * internal DL-098; ADR-0059).
 *
 * Yang dijaga adalah hal yang bisa hilang diam-diam saat seseorang merapikan
 * workflow: pin SHA diganti tag (ADR-0030), langkah pernyataan cakupan dihapus
 * (syarat kejujuran ADR-0032 §A), gitleaks kembali memindai seluruh riwayat,
 * dan CodeQL kembali masuk.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const keamanan = readFileSync(".github/workflows/keamanan.yml", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

describe("workflow keamanan — celah 7 ADR-0028, pengganti CodeQL (ADR-0059)", () => {
  test("setiap action dipin ke SHA commit dengan komentar versi", () => {
    const dipakai = [...keamanan.matchAll(/uses:\s*(\S+)(.*)$/gm)];
    assert.ok(dipakai.length >= 3, "diharapkan checkout + setup-bun + cache");

    for (const [, rujukan, sisa] of dipakai) {
      assert.match(rujukan, /@[0-9a-f]{40}$/, `${rujukan} tidak dipin ke SHA commit (ADR-0030)`);
      assert.match(sisa, /#\s*v\d/, `${rujukan} tanpa komentar versi yang Dependabot baca`);
    }
  });

  test("izin hanya baca, tanpa upload hasil ke code scanning", () => {
    assert.match(keamanan, /^permissions:\s*\n\s+contents:\s*read\s*$/m);
    assert.doesNotMatch(keamanan, /security-events:\s*write/);
    assert.doesNotMatch(keamanan, /upload-sarif/);
  });

  test("tanpa filter paths: check wajib selalu dilaporkan", () => {
    assert.doesNotMatch(keamanan, /^\s+paths(-ignore)?:/m);
  });

  test("nama job sama dengan konteks check wajib", () => {
    assert.match(keamanan, /name: keamanan \/ sast-rahasia-dependensi/);
  });

  test("gitleaks memindai rentang commit, dengan --redact", () => {
    assert.match(keamanan, /--redact/);
    assert.match(keamanan, /--log-opts=/);
    assert.match(keamanan, /PR_BASE\}\.\.\$\{PR_HEAD/);
  });

  test("berkas workflow adalah YAML yang sah", () => {
    // Nama langkah ber-`: ` tanpa kutip pernah membuat berkas ini tidak terurai,
    // dan GitHub baru menyatakannya saat run, bukan saat tinjau.
    const doc = Bun.YAML.parse(keamanan);
    assert.equal(doc.jobs.keamanan.name, "keamanan / sast-rahasia-dependensi");
  });

  test("OpenGrep dijalankan lewat skrip dengan baseline", () => {
    assert.match(keamanan, /tools\/ci\/sast\/opengrep-scan\.ts/);
    assert.ok(existsSync("tools/ci/sast/baseline.json"), "baseline.json hilang");
    assert.ok(existsSync("tools/ci/sast/rules/SUMBER.md"), "aturan tersalin hilang");
  });

  test("bun-version sama dengan packageManager", () => {
    const versi = pkg.packageManager.replace(/^bun@/, "");
    const dipakai = [...keamanan.matchAll(/bun-version:\s*"([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(dipakai, [versi]);
  });

  test("CodeQL tidak kembali", () => {
    assert.equal(existsSync(".github/workflows/codeql.yml"), false);
    assert.doesNotMatch(keamanan, /github\/codeql-action/);
  });

  // Blok langkah ringkasan, dari namanya sampai akhir berkas, bukan seluruh berkas.
  const blok = keamanan.slice(keamanan.indexOf("name: Nyatakan cakupan"));

  test("cakupan DINYATAKAN di ringkasan run, termasuk batas .astro", () => {
    assert.ok(blok.length > 0 && keamanan.includes("name: Nyatakan cakupan"));
    assert.match(blok, /GITHUB_STEP_SUMMARY/);
    assert.match(blok, /TIDAK dianalisis.*\.astro|\.astro.*TIDAK dianalisis/s);
  });

  test("jumlah dihitung dari berkas TERLACAK, bukan daftar tulisan tangan", () => {
    assert.match(blok, /git ls-files '\*\.astro'/);
    assert.match(blok, /git ls-files '\*\.ts' '\*\.mjs' '\*\.js'/);
  });
});
