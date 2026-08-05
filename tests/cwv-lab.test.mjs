/**
 * Gerbang pengukuran Core Web Vitals lab (celah 8 ADR-0028, ditutup ADR-0032):
 * ambang di `lighthouserc.json` SAMA dengan target yang dokumen standar tulis,
 * dan langkah CI-nya tidak bisa hilang atau kehilangan syaratnya diam-diam.
 *
 * ## Kenapa angka diasersi dua kali
 *
 * Target CWV hidup di dua tempat: dokumen standar (LCP <= 2,5 detik, CLS <=
 * 0,1) dan konfigurasi Lighthouse. Dua salinan satu angka sepakat sampai salah
 * satunya disunting — dan yang disunting hampir pasti konfigurasinya, oleh
 * orang yang sedang menghijaukan CI. Tes ini memaku konfigurasi ke angka
 * dokumen, sehingga melonggarkan ambang menuntut mengubah TES ini — perubahan
 * yang terlihat di review, bukan di balik berkas JSON yang tak ada yang baca.
 *
 * ## INP tidak ada di sini, dan itu bukan lupa
 *
 * INP butuh interaksi pengguna nyata — ia metrik lapangan, dan pengukuran
 * lapangan (RUM) DITOLAK repo ini karena mengumpulkan data pembaca. Total
 * Blocking Time 200 ms dipakai sebagai proksi lab-nya, dan disebut sebagai
 * proksi: halaman yang nyaris tanpa JS seharusnya mendekati nol, jadi TBT
 * tinggi adalah sinyal JS menyelinap masuk — persis yang ambang INP jaga.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const konfigurasi = JSON.parse(readFileSync("lighthouserc.json", "utf8"));
const asersi = konfigurasi.ci?.assert?.assertions ?? {};
const ci = readFileSync(".github/workflows/ci.yml", "utf8");

describe("ambang lighthouserc.json terpaku ke target dokumen standar", () => {
  test("LCP <= 2500 ms, dan levelnya error — warn adalah teater", () => {
    assert.deepEqual(asersi["largest-contentful-paint"], [
      "error",
      { maxNumericValue: 2500 }
    ]);
  });

  test("CLS <= 0.1", () => {
    assert.deepEqual(asersi["cumulative-layout-shift"], [
      "error",
      { maxNumericValue: 0.1 }
    ]);
  });

  test("TBT <= 200 ms sebagai proksi lab INP", () => {
    assert.deepEqual(asersi["total-blocking-time"], [
      "error",
      { maxNumericValue: 200 }
    ]);
  });

  test("yang diaudit adalah KELUARAN build, bukan dev server", () => {
    assert.equal(konfigurasi.ci?.collect?.staticDistDir, "./dist/client");
  });
});

describe("cakupan penemuan halaman adalah PILIHAN, bukan bawaan yang diam", () => {
  // Review adversarial menemukan bawaan @lhci/cli: maksimal 5 URL terdangkal,
  // kedalaman 2 — sehingga halaman artikel berlokal (kedalaman 3+) tidak
  // pernah diukur sementara dokumen berbunyi "atas dist/client". Ketiga nilai
  // di bawah membuat batasnya DIPILIH dan TERTULIS; menghapusnya mengembalikan
  // bawaan yang diam-diam menyempitkan cakupan.
  const collect = konfigurasi.ci?.collect ?? {};

  test("kedalaman penemuan menjangkau halaman artikel berlokal (/{lang}/{tab}/{slug}/)", () => {
    assert.ok(
      Number(collect.staticDirFileDiscoveryDepth) >= 4,
      `staticDirFileDiscoveryDepth=${collect.staticDirFileDiscoveryDepth} — bawaan 2 tidak pernah menemukan halaman kedalaman 3`
    );
  });

  test("jumlah URL sampel dinyatakan eksplisit", () => {
    assert.ok(
      Number(collect.maxAutodiscoverUrls) >= 10,
      `maxAutodiscoverUrls=${collect.maxAutodiscoverUrls} — bawaan 5 menghabiskan cakupan pada halaman terdangkal`
    );
  });

  test("404.html tidak memakan slot sampel", () => {
    assert.ok(
      (collect.autodiscoverUrlBlocklist ?? []).includes("/404.html"),
      "tanpa blocklist, satu dari sedikit slot sampel diaudit atas halaman 404"
    );
  });
});

describe("langkah CI-nya", () => {
  // Langkah dicari dari `uses:`-nya, bukan dari nama tampilannya: nama boleh
  // dirapikan tanpa satu pun tes merah, dan anchor "langkah berikutnya" gagal
  // DIAM-DIAM saat langkah tetangga di-rename (indexOf -1 membuat slice meluas
  // ke hampir seluruh berkas). Batas blok = boundary langkah YAML berikutnya.
  const langkahSemua = ci.split(/\n(?=\s{6}- name:)/);
  const blok = langkahSemua.find((l) => l.includes("treosh/lighthouse-ci-action")) ?? "";

  test("ada di job build, terkondisi sumber konten — pola gerbang keluaran lainnya", () => {
    assert.ok(blok.length > 0, "langkah lighthouse-ci-action tidak ditemukan di ci.yml");
    assert.match(
      blok,
      /if:\s*vars\.AWCMS_API_URL\s*!=\s*''/,
      "tanpa syarat itu, repo template mencoba mengaudit dist/ yang tidak pernah dibangun"
    );
  });

  test("action dipin ke SHA commit dengan komentar versi (ADR-0030)", () => {
    assert.match(blok, /treosh\/lighthouse-ci-action@[0-9a-f]{40}\s*#\s*v\d/);
  });

  test("membaca konfigurasi yang diasersi berkas ini, bukan konfigurasi lain", () => {
    assert.match(blok, /configPath:\s*lighthouserc\.json/);
  });
});
