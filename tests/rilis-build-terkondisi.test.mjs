/**
 * Gerbang atas syarat build di `scripts/rilis.mjs` (ADR-0030).
 *
 * ## Cacat yang ditutupnya, dan ia sudah terjadi
 *
 * `.github/workflows/ci.yml` memutuskan, dengan alasannya ditulis panjang di
 * sana, bahwa build integrasi jalan **kalau dan hanya kalau** `AWCMS_API_URL`
 * diisi — karena repo TEMPLATE ini tidak punya sumber konten, dan dua
 * alternatifnya lebih buruk: merah permanen berhenti dibaca orang, dan awcms
 * tiruan membuat gerbangnya lulus tanpa pernah membuktikan apa pun.
 *
 * `scripts/rilis.mjs` tidak ikut memutuskan itu. Ia menjalankan `bun run build`
 * tanpa syarat, sehingga **perilis menuntut sesuatu yang repo ini secara
 * struktural tidak bisa penuhi**. Akibatnya bukan CI merah — perilis tidak
 * berjalan di CI — melainkan sesuatu yang jauh lebih sunyi: 44 changeset
 * menumpuk selama enam minggu, tag `v*` tak pernah ada satu pun, dan jalur SBOM
 * ADR-0031 tidak pernah dieksekusi sekali pun sejak ditulis.
 *
 * Dua berkas yang menyatakan aturan yang sama dan tidak sepakat adalah kelas
 * cacat yang repo ini sudah kenal; yang membuat yang ini mahal adalah bahwa
 * ketidaksepakatannya tidak memerahkan apa pun.
 *
 * ## Kenapa asersi struktural, bukan menjalankan perilisnya
 *
 * `rilis.mjs` menulis `package.json`, `CHANGELOG.md`, dan membuat tag.
 * Menjalankannya di test berarti merilis. Pola yang dipakai di sini sama dengan
 * `tests/sbom.test.mjs`, yang menjaga langkah SBOM di berkas yang sama dengan
 * membaca sumbernya: cukup untuk menangkap penghapusan diam-diam, dan tidak
 * berpura-pura menjalankan hal yang tidak bisa dijalankan.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const perilis = readFileSync("scripts/rilis.mjs", "utf8");
const ci = readFileSync(".github/workflows/ci.yml", "utf8");

describe("rilis.mjs: build integrasi terkondisi (ADR-0030)", () => {
  test("perilis membaca AWCMS_API_URL alih-alih mengasumsikannya ada", () => {
    assert.match(
      perilis,
      /process\.env\.AWCMS_API_URL/,
      "scripts/rilis.mjs tidak lagi membaca AWCMS_API_URL. Tanpa itu ia kembali " +
        "menuntut build yang repo template ini tidak bisa jalankan, dan changeset " +
        "akan menumpuk lagi tanpa satu pun rilis."
    );
  });

  test("`bun run build` tidak pernah dipanggil tanpa syarat", () => {
    // Baris pemanggilnya harus berindentasi — yaitu berada di dalam sebuah blok
    // — bukan di kolom nol. Ini asersi kasar dan disengaja: ia menangkap
    // pengembalian ke bentuk tanpa syarat tanpa menuntut bentuk `if` tertentu.
    const tanpaSyarat = /^execSync\('bun run build'/m.test(perilis);
    assert.equal(
      tanpaSyarat,
      false,
      "`execSync('bun run build')` berada di kolom nol, artinya ia berjalan tanpa " +
        "syarat lagi. Repo template tidak punya sumber konten; perilis akan gagal " +
        "selamanya di sini."
    );
  });

  test("`audit:konten` ikut terkondisi — ia membaca dist/client", () => {
    const tanpaSyarat = /^execSync\('bun run audit:konten'/m.test(perilis);
    assert.equal(
      tanpaSyarat,
      false,
      "`audit:konten` dipanggil tanpa syarat. Tanpa build ia melewati dirinya " +
        "sendiri, jadi memanggilnya di luar cabang build hanya menambah langkah " +
        "yang selalu kosong — dan terbaca seolah ia memeriksa sesuatu."
    );
  });

  test("dilewati DINYATAKAN, tidak diam-diam", () => {
    assert.match(
      perilis,
      /DILEWATI, bukan LULUS/,
      "Cabang tanpa sumber konten tidak lagi menyatakan bahwa gerbangnya " +
        "DILEWATI. Gerbang yang dilewati diam-diam dibaca sebagai gerbang yang " +
        "lulus — ini prinsip yang sama dengan langkah `report` di ci.yml."
    );
  });

  test("faktanya masuk CHANGELOG, bukan hanya terminal", () => {
    assert.match(
      perilis,
      /catatanIntegrasi/,
      "Catatan 'build integrasi tidak berjalan' tidak lagi ditulis ke catatan " +
        "rilis. Yang membaca CHANGELOG enam bulan lagi tidak punya keluaran " +
        "terminal perilis."
    );
    assert.match(
      perilis,
      /\$\{catatanIntegrasi\}/,
      "`catatanIntegrasi` ada tetapi tidak disisipkan ke entri CHANGELOG."
    );
  });

  test("awcms tiruan tetap ditolak, dan alasannya ikut tertulis", () => {
    assert.match(
      perilis,
      /awcms tiruan/,
      "Alasan menolak awcms tiruan hilang dari perilis. Itu pilihan yang paling " +
        "menggoda saat build gagal, dan ci.yml menamainya paling berbahaya — " +
        "alasannya harus berada di tempat orang berada saat tergoda."
    );
  });
});

describe("perilis dan CI menyatakan syarat yang SAMA", () => {
  test("ci.yml masih menggantungkan build-nya pada AWCMS_API_URL", () => {
    assert.match(
      ci,
      /vars\.AWCMS_API_URL/,
      "ci.yml tidak lagi menggantungkan build pada vars.AWCMS_API_URL. Kalau " +
        "syaratnya berubah di sana, perilis harus ikut — dua berkas yang " +
        "menyatakan aturan sama dan tidak sepakat adalah cacat yang melahirkan " +
        "gerbang ini."
    );
  });

  test("ci.yml masih menolak awcms tiruan secara tertulis", () => {
    assert.match(
      ci,
      /awcms tiruan/,
      "Alasan tertulis di ci.yml hilang. Perilis merujuk pada keputusan itu; " +
        "kalau ia lenyap, rujukannya jadi menggantung."
    );
  });
});
