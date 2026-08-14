/**
 * Gerbang peran repo: PUBLIK secara bawaan, admin hanya bila DINYATAKAN.
 *
 * Aturan ini sudah tertulis di `AGENTS.md` dan di ADR-0034, dan tulisan saja
 * tidak pernah cukup untuk kelas cacat yang dijaganya. Ketiganya sama-sama
 * mendarat tanpa satu pun kegagalan build:
 *
 *   1. **Permukaan terautentikasi yang muncul tanpa dinyatakan.** Satu berkas
 *      rute dengan `export const prerender = false` sudah cukup: build tetap
 *      hijau, situs tetap terbit, dan sebuah halaman login berdiri di domain
 *      yang pemiliknya tidak pernah memutuskan untuk memilikinya.
 *   2. **`owner` masuk ke daftar peran.** Ia satu kata di berkas konfigurasi,
 *      dan ia mengubah situs publik menjadi pintu kedua ke seluruh platform.
 *   3. **Deklarasi separuh.** Rute tanpa peran, atau peran tanpa rute. Yang
 *      pertama permukaan yang tidak bisa dimasuki siapa pun; yang kedua izin
 *      yang tidak menuju ke mana-mana tetapi terbaca seperti permukaan yang
 *      ada.
 *
 * Jalankan dengan `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  locales,
  permukaanAdmin,
  situsPublikSaja,
  tabs,
  PERAN_DILARANG
} from "../src/config/site.ts";

/**
 * Prefiks rute on-demand yang sudah dibolehkan SEBELUM ADR-0034, dan tetap
 * dibolehkan olehnya: BFF portal Jualanku (ADR-0014).
 *
 * Ia ada di sini karena gerbang di bawah menuntut setiap rute on-demand punya
 * izinnya, dan izin Jualanku datang dari ADR-nya sendiri alih-alih dari
 * `permukaanAdmin` — ia bukan permukaan admin, ia portal pengguna.
 */
const PREFIKS_ADR_0014 = ["/penjual", "/affiliate", "/_portal-api"];

/** Setiap rute di `src/pages/` yang menyatakan `prerender = false`. */
function ruteOnDemand() {
  const ditemukan = [];

  for (const nama of new Bun.Glob("**/*.{astro,ts}").scanSync("src/pages")) {
    const isi = readFileSync(`src/pages/${nama}`, "utf8")
      // Komentar dibuang lebih dulu: berkas di repo ini MEMERIKAN aturan jauh
      // lebih sering daripada melanggarnya, dan gerbang yang menghitung
      // docblock akan merah atas kalimat yang justru menjelaskannya.
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

    if (/export\s+const\s+prerender\s*=\s*false/.test(isi)) {
      ditemukan.push(`/${nama}`);
    }
  }

  return ditemukan;
}

describe("peran repo: publik secara bawaan", () => {
  test("template ini TIDAK menyatakan satu pun permukaan admin", () => {
    // Bawaan yang berubah diam-diam adalah bawaan yang berhenti menjadi
    // bawaan. Setiap situs turunan mewarisi berkas ini apa adanya.
    assert.deepEqual([...permukaanAdmin.prefiks], []);
    assert.deepEqual([...permukaanAdmin.peran], []);
    assert.equal(situsPublikSaja(), true);
  });

  test("template ini tidak punya satu pun rute on-demand", () => {
    // Konsekuensi langsung dari tes di atas, diperiksa dari KODE dan bukan
    // dari konfigurasi — keduanya bisa berselisih, dan yang menentukan apa
    // yang benar-benar disajikan adalah kode.
    assert.deepEqual(ruteOnDemand(), []);
  });
});

describe("permukaanAdmin: yang tidak boleh dinyatakan", () => {
  test("`owner` DITOLAK, apa pun kapitalisasinya", () => {
    // Owner adalah super-manajer sistem lengkap. Layar yang mengelola sistem
    // sebagai keseluruhan tinggal di `/admin/*` milik awcms; sebuah situs yang
    // bisa memasukkan owner di sini adalah pintu kedua ke seluruh platform,
    // digambar di atas sebuah template.
    const dilarang = permukaanAdmin.peran.filter(
      (peran) => peran.trim().toLowerCase() === PERAN_DILARANG
    );

    assert.deepEqual(
      dilarang,
      [],
      `permukaanAdmin.peran memuat "${PERAN_DILARANG}" — peran itu memakai ` +
        `/admin/* milik awcms, tidak pernah situs ini`
    );
  });

  test("peran ditulis sebagai kode yang tidak kosong", () => {
    for (const peran of permukaanAdmin.peran) {
      assert.equal(typeof peran, "string");
      assert.ok(peran.trim().length > 0, "kode peran kosong");
    }
  });

  test("prefiks ditulis absolut dan tanpa garis miring di ujung", () => {
    // `redaksi` dan `/redaksi/` sama-sama terbaca benar oleh manusia dan
    // sama-sama tidak cocok dengan `startsWith("/redaksi")` yang dipakai
    // gerbang di bawah — pencocokan yang meleset menghasilkan gerbang yang
    // hijau untuk rute yang justru tidak dideklarasikan.
    for (const prefiks of permukaanAdmin.prefiks) {
      assert.ok(prefiks.startsWith("/"), `prefiks "${prefiks}" tidak absolut`);
      assert.ok(
        prefiks === "/" || !prefiks.endsWith("/"),
        `prefiks "${prefiks}" berakhir dengan garis miring`
      );
    }
  });

  test("prefiks admin tidak boleh menelan situs publiknya", () => {
    // Fungsi UTAMA situs ini tetap halaman publik; permukaan admin duduk di
    // SEBELAHNYA. Prefiks `/`, prefiks locale, atau slug sebuah tab akan
    // menaruh bagian publik di belakang login — dan situsnya tetap terbangun
    // hijau: seluruh halamannya ada, dan setiap satu di antaranya kini meminta
    // pembacanya masuk lebih dulu.
    const terlarang = new Set([
      "/",
      ...locales.map((kode) => `/${kode}`),
      ...tabs.map((tab) => `/${tab.slug}`)
    ]);

    for (const prefiks of permukaanAdmin.prefiks) {
      assert.equal(
        terlarang.has(prefiks),
        false,
        `prefiks admin "${prefiks}" menelan permukaan publik — situs ini ` +
          `halaman publik lebih dulu, dan admin hanya di sebelahnya`
      );
    }
  });

  test("deklarasi separuh ditolak — prefiks dan peran bergerak bersama", () => {
    const adaPrefiks = permukaanAdmin.prefiks.length > 0;
    const adaPeran = permukaanAdmin.peran.length > 0;

    assert.equal(
      adaPrefiks,
      adaPeran,
      adaPrefiks
        ? "ada prefiks admin tanpa satu pun peran yang boleh masuk — permukaan terautentikasi yang tidak bisa dimasuki siapa pun"
        : "ada peran admin tanpa satu pun prefiks — izin yang tidak menuju ke mana-mana, terbaca seperti permukaan yang ada"
    );
  });
});

describe("setiap rute on-demand punya izinnya", () => {
  test("tidak ada rute `prerender = false` yang tidak dideklarasikan", () => {
    // Inilah gerbang yang membuat "publik secara bawaan" menjadi keadaan yang
    // ditegakkan alih-alih kalimat. `output: "static"` adalah premis template
    // ini; satu rute yang melepaskan diri darinya tanpa dinyatakan adalah
    // permukaan runtime di repo yang seluruh posturnya bersandar pada tidak
    // adanya runtime.
    const diizinkan = [...permukaanAdmin.prefiks, ...PREFIKS_ADR_0014];

    const liar = ruteOnDemand().filter(
      (rute) => !diizinkan.some((prefiks) => rute.startsWith(prefiks))
    );

    assert.deepEqual(
      liar,
      [],
      "rute ini menyatakan `prerender = false` tanpa prefiksnya ada di " +
        "`permukaanAdmin.prefiks` (ADR-0034) maupun di prefiks BFF Jualanku " +
        "(ADR-0014). Nyatakan permukaannya, atau jadikan rutenya statis."
    );
  });
});

/**
 * Kontrak kerja dibaca dalam DUA bahasa sejak ADR-0039, jadi kedua berkasnya
 * diperiksa — masing-masing dalam bahasanya sendiri.
 *
 * Kata bahasanya dicari pada PROSA, bukan di mana pun di berkas. Tanpa
 * pembuangan tautan lebih dulu, `/publik/i` cocok dengan nama berkas
 * `0034-publik-secara-bawaan-...md` di dalam sebuah tautan — jadi gerbang ini
 * akan tetap hijau setelah seluruh prosanya dihapus, asalkan tautannya
 * tertinggal. Ia sempat begitu persis pada hari AGENTS.md diterjemahkan.
 */
describe("dokumen menyatakan aturan yang sama dengan kodenya", () => {
  const kontrak = [
    { berkas: "AGENTS.md", bahasa: "Inggris", bawaanPublik: /\bpublic\b/i },
    { berkas: "AGENTS.id.md", bahasa: "Indonesia", bawaanPublik: /\bpublik\b/i }
  ];

  for (const { berkas, bahasa, bawaanPublik } of kontrak) {
    test(`${berkas} menyebut bawaan publik DAN larangan owner`, () => {
      // Kontrak kerja adalah yang dibaca agen berikutnya sebelum menyentuh apa
      // pun. Ia pernah menyuruh membangun layar admin di sini selama satu hari
      // penuh setelah keputusannya dicabut (ADR-0020 §Konsekuensi), dan
      // pekerjaan yang lahir dari kalimat itu akan mendarat di repo yang salah.
      const isi = readFileSync(berkas, "utf8");

      // Tautan markdown dibuang: yang harus menyatakan aturannya adalah
      // kalimatnya, bukan nama berkas yang kebetulan memuat katanya.
      const prosa = isi.replace(/\[[^\]]*\]\([^)]*\)/g, "");

      assert.match(
        prosa,
        bawaanPublik,
        `${berkas} (${bahasa}) tidak lagi menyatakan bawaan publiknya dalam prosa`
      );
      assert.match(
        isi,
        /permukaanAdmin/,
        `${berkas} tidak menyebut \`permukaanAdmin\`, deklarasi yang menentukan aturan ini`
      );
      assert.match(
        isi,
        new RegExp(PERAN_DILARANG, "i"),
        `${berkas} tidak menyebut peran yang dilarang`
      );
    });
  }
});
