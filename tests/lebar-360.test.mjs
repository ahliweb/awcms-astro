/**
 * Gerbang lantai 360px: lebar bersih `.container` dihitung dari CSS-nya
 * sendiri, dan tak ada track grid atau lebar tetap di `src/styles/global.css`
 * yang boleh melebihinya tanpa jalan keluar.
 *
 * ## Asal cacatnya — bukan hipotesis
 *
 * `AGENTS.md` §Antarmuka menulis "Mobile-first from 360px" sebagai lantai
 * dukungan repo ini. `.container` (`src/styles/global.css`) memasang
 * `padding: 0 1.25rem` — 20px tiap sisi, 40px total — sehingga di lantai itu
 * ruang bersihnya PERSIS 320px. Sebelum berkas ini ada, `.grid-cards` menulis:
 *
 *     grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
 *
 * Sebuah track selebar 320px di ruang 320px pas TANPA sisa sama sekali.
 * `box-sizing: border-box` menyelamatkannya hari ini, tapi pembulatan
 * sub-piksel, atau border/outline/shadow yang kelak ditambahkan ke `.card`,
 * mendorong gulir mendatar persis di lebar yang dijanjikan repo ini untuk
 * didukung — dan sebelum berkas ini, tidak ada satu gerbang pun yang akan
 * memerah karenanya. `.grid-cards` sudah diperbaiki
 * (`minmax(min(320px, 100%), 1fr)`, ADR yang sama dengan berkas ini); yang
 * berikut adalah supaya baris kedua yang sama tidak mendarat tanpa ada yang
 * sadar.
 *
 * ## Kenapa dihitung, bukan ditulis ulang sebagai angka tetap
 *
 * 360 adalah keputusan produk — lantai dukungan yang didokumentasikan
 * `AGENTS.md`, bukan nilai yang muncul di CSS mana pun — jadi ia di-hardcode
 * SATU kali di bawah, dengan rujukan ke dokumen itu. Padding sisi
 * `.container`, sebaliknya, ADALAH nilai CSS, dan itulah yang benar-benar
 * bisa hanyut tanpa alarm: `.header-top` pernah menghapus padding container
 * lewat shorthand tanpa satu gerbang pun memerah (§Responsive di
 * `ui-ux-design-system.md`). Berkas ini karena itu MEMBACA padding dari
 * `.container`, bukan menulis ulang "320" sebagai angka lepas — kalau padding
 * itu berubah, lebar bersih yang dihitung di bawah berubah bersamanya, dan
 * tes kedua di bawah gagal dengan pesan yang menunjuk balik ke angka
 * dokumentasi yang harus ikut diperbarui (persis cacat kedua di audit yang
 * melahirkan berkas ini: `AGENTS.md` dan `ui-ux-design-system.md` menyebut
 * "kartu 328px … skala 0.41" — aritmetika untuk padding 1rem yang sudah lama
 * tidak sama dengan padding 1.25rem yang sungguh berlaku).
 *
 * ## Kenapa berkas baru, bukan perluasan `tests/analisis-statik.test.mjs`
 *
 * Seluruh isi `analisis-statik.test.mjs` adalah satu subjek sempit: workflow
 * CodeQL menyatakan cakupannya dan dipin ke SHA (celah 7 ADR-0028). Lebar
 * layar tidak punya hubungan dengan itu selain sama-sama "aturan tertulis
 * yang butuh gerbang" (ADR-0030) — menumpangkannya ke sana membuat siapa pun
 * yang mencari "kenapa CodeQL merah" harus menyaring asersi CSS yang tidak
 * relevan, dan sebaliknya. Pola repo ini adalah satu berkas per subjek
 * (`tests/versi-toolchain.test.mjs`, `tests/documented-counts.test.mjs`,
 * `tests/analisis-statik.test.mjs` sendiri) — berkas ini mengikutinya.
 *
 * ## Apa yang TIDAK diperiksa — batas gerbang ini, dinyatakan terus terang
 *
 * Ini gerbang STATIK atas teks CSS. Ia TIDAK BISA membuktikan keamanan
 * render sungguhan: pembulatan sub-piksel, metrik font nyata (lebar
 * karakter berbeda per platform), dan scrollbar sungguhan (yang mencuri
 * ruang horizontal di sebagian browser desktop) semuanya butuh browser
 * sungguhan untuk diukur, bukan sebuah regex atas berkas sumber. Yang AKAN
 * membuktikannya: sebuah pemeriksaan headless-browser yang mengasersikan
 * `document.documentElement.scrollWidth <= 360` pada halaman-halaman kunci
 * setelah `bun run build` — yang berarti butuh build dan `awcms` backend
 * yang hidup untuk mengisinya, bukan sekadar `src/styles/global.css` yang
 * dibaca sebagai teks. Ketiadaan pemeriksaan itu di repo ini adalah batas
 * yang dinyatakan, bukan yang disembunyikan.
 *
 * Gerbang ini juga tidak menilai apakah 320px "cukup" untuk desain manapun —
 * hanya bahwa CSS yang ada tidak mengaku menopang lebih dari yang bisa ia
 * tampung tanpa gulir.
 */
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const CSS = readFileSync("src/styles/global.css", "utf8");
const AGENTS = readFileSync("AGENTS.md", "utf8");

/** Nomor baris 1-based dari sebuah indeks karakter — untuk pesan galat yang bisa ditelusuri. */
function nomorBaris(teks, indeks) {
  return teks.slice(0, indeks).split("\n").length;
}

/**
 * Lantai dukungan yang didokumentasikan (`AGENTS.md` §Antarmuka —
 * "Mobile-first from 360px"). SATU-SATUNYA angka hardcode di berkas ini:
 * tidak ada literal "360" di CSS manapun untuk dibaca balik — lihat docblock
 * di atas untuk kenapa itu bukan cacat yang sama dengan padding di bawah.
 */
const LANTAI_DUKUNGAN_PX = 360;

/**
 * Padding sisi `.container`, dibaca dari CSS-nya sendiri — bukan ditulis
 * ulang sebagai angka tetap. Diasumsikan `1rem` root = 16px, yaitu bawaan
 * browser; `html`/`:root` di berkas ini tidak menimpa `font-size`
 * (diperiksa saat berkas ini ditulis). Kalau itu berubah, asumsi ini adalah
 * bagian dari batas "font nyata butuh browser" yang docblock di atas sudah
 * nyatakan, bukan sesuatu yang gerbang statik ini bisa lihat sendiri.
 */
const BLOK_CONTAINER = CSS.match(/\.container\s*\{([^}]*)\}/);
const PADDING_COCOK = BLOK_CONTAINER?.[1]?.match(/padding:\s*0\s+([0-9.]+)(px|rem)\s*;/) ?? null;
const PADDING_PX = PADDING_COCOK
  ? Number(PADDING_COCOK[1]) * (PADDING_COCOK[2] === "rem" ? 16 : 1)
  : null;

/** Lebar bersih di dalam `.container` pada lantai 360px — DIHITUNG, bukan ditulis ulang. */
const LEBAR_BERSIH_PX = PADDING_PX === null ? null : LANTAI_DUKUNGAN_PX - PADDING_PX * 2;

/**
 * Rentang `[mulai, akhir)` dari setiap blok `@media (min-width: …)` —
 * peningkatan khusus layar lebar, jadi sah melebihi lebar bersih 360px.
 * `@media (max-width: …)` TIDAK dikecualikan: kondisi itu masih berlaku PADA
 * dan DI BAWAH 360px, jadi isinya tetap diperiksa.
 */
function zonaMediaDesktop(teks) {
  const zona = [];
  const pola = /@media\s*\(([^)]*)\)\s*\{/g;
  let m;
  while ((m = pola.exec(teks))) {
    if (!/min-width/.test(m[1])) continue;
    let kedalaman = 1;
    let i = m.index + m[0].length;
    while (kedalaman > 0 && i < teks.length) {
      if (teks[i] === "{") kedalaman++;
      else if (teks[i] === "}") kedalaman--;
      i++;
    }
    zona.push([m.index, i]);
  }
  return zona;
}

const ZONA_DESKTOP = zonaMediaDesktop(CSS);
const dalamZonaDesktop = (indeks) => ZONA_DESKTOP.some(([a, b]) => indeks >= a && indeks < b);

describe("lebar bersih .container di lantai 360px dihitung dari CSS-nya sendiri (asal: .grid-cards)", () => {
  test("padding sisi .container terbaca dari CSS, bukan diasumsikan", () => {
    assert.notEqual(
      PADDING_PX,
      null,
      "tidak menemukan `padding: 0 <N>rem;` di dalam blok `.container` " +
        "src/styles/global.css. Kalau shorthand paddingnya ditulis ulang " +
        "(mis. empat nilai, atau `padding-inline`), perbarui regex gerbang " +
        "ini SEBELUM mempercayai angka lebar bersih yang ia hasilkan"
    );
  });

  test("lebar bersih di 360px kini 320px — kalau ini berubah, dua dokumen ikut berbohong", () => {
    assert.equal(
      LEBAR_BERSIH_PX,
      320,
      `.container memberi padding ${PADDING_PX}px tiap sisi hari ini, jadi ` +
        `lebar bersih pada lantai 360px yang terhitung adalah ${LEBAR_BERSIH_PX}px, ` +
        "bukan 320px. Kalau `.container` memang sengaja diubah, perbarui juga " +
        "angka kartu dan skala di AGENTS.md, AGENTS.id.md, " +
        "docs/awcms-astro/ui-ux-design-system.md, dan .id.md-nya — itu " +
        "persis cacat yang membuat berkas ini ditulis (kartu 328px/skala " +
        "0.41 yang sudah lama tidak cocok dengan padding 1.25rem yang " +
        "sungguh berlaku)"
    );
  });
});

describe("tidak ada minmax(<N>px|rem, …) di src/styles/global.css yang melebihi lebar bersih 360px", () => {
  test("setiap track grid berbasis angka tetap pas di lebar bersih, dibungkus min(…, 100%), atau khusus layar lebar", () => {
    const pelanggar = [];
    const pola = /minmax\(\s*([0-9.]+)(px|rem)\b/g;
    let m;
    while ((m = pola.exec(CSS))) {
      const nilaiPx = Number(m[1]) * (m[2] === "rem" ? 16 : 1);
      // `>=`, bukan `>`: sebuah track PERSIS selebar lebar bersih adalah
      // kasus asal cacat ini — 320px di ruang 320px pas TANPA sisa sama
      // sekali. Itu bukan batas aman, itu adalah pelanggarannya.
      if (nilaiPx < LEBAR_BERSIH_PX) continue;
      if (dalamZonaDesktop(m.index)) continue;
      pelanggar.push(`baris ${nomorBaris(CSS, m.index)}: \`${m[0]}…\` (${nilaiPx}px)`);
    }
    assert.deepEqual(
      pelanggar,
      [],
      `ditemukan minmax(<N>, …) yang track minimalnya (${pelanggar.join("; ")}) ` +
        `melebihi ${LEBAR_BERSIH_PX}px bersih di layar 360px, di luar @media ` +
        "(min-width: …) — ini persis bentuk overflow tanpa sisa yang membuat " +
        "gerbang ini ditulis (kasus asalnya: `.grid-cards`). Bungkus dengan " +
        "`min(<N>px, 100%)` seperti `.grid-cards` sekarang, atau taruh di " +
        "dalam `@media (min-width: …)` kalau ia memang khusus layar lebar"
    );
  });
});

/** Blok selektor+isi yang memuat indeks karakter `indeks` — rule CSS tidak bersarang,
 *  jadi `}` pertama setelah `indeks` selalu menutup rule yang sama. */
function blokAturan(teks, indeks) {
  const mulaiKurung = teks.lastIndexOf("{", indeks);
  const akhirKurung = teks.indexOf("}", indeks);
  const tutupSebelumnya = teks.lastIndexOf("}", mulaiKurung);
  return {
    selektor: teks.slice(tutupSebelumnya + 1, mulaiKurung).trim(),
    isi: teks.slice(mulaiKurung + 1, akhirKurung)
  };
}

/**
 * Kelas selektor yang sah melebihi lebar bersih 360px: menu/dropdown yang
 * terbuka MENGAMBANG di atas isi (bukan bagian dari alur utama), dan target
 * sentuh minimalnya yang selalu jauh di bawah 320px di repo ini tetapi tetap
 * didaftar untuk jujur soal niatnya.
 */
const SELEKTOR_DIKECUALIKAN = /menu|dropdown|switcher|tooltip|popover|scrollbar|target/i;

describe("tidak ada width/min-width tetap di alur konten utama src/styles/global.css tanpa jalan keluar", () => {
  test("setiap deklarasi width/min-width piksel tetap pas, adalah menu/dropdown/target, khusus layar lebar, atau punya overflow-x sendiri", () => {
    const pelanggar = [];
    const pola = /^[ \t]*(min-width|width)\s*:\s*([0-9.]+)(px|rem)\s*;/gm;
    let m;
    while ((m = pola.exec(CSS))) {
      const nilaiPx = Number(m[2]) * (m[3] === "rem" ? 16 : 1);
      if (nilaiPx < LEBAR_BERSIH_PX) continue;
      if (dalamZonaDesktop(m.index)) continue;

      const { selektor, isi } = blokAturan(CSS, m.index);
      if (SELEKTOR_DIKECUALIKAN.test(selektor)) continue;
      if (/overflow(-x)?\s*:\s*(auto|scroll)/.test(isi)) continue;

      pelanggar.push(
        `baris ${nomorBaris(CSS, m.index)} (\`${selektor || "?"}\`): \`${m[0].trim()}\` (${nilaiPx}px)`
      );
    }
    assert.deepEqual(
      pelanggar,
      [],
      `ditemukan width/min-width tetap yang lebih lebar dari ${LEBAR_BERSIH_PX}px ` +
        `bersih di layar 360px, tanpa jalan keluar: ${pelanggar.join("; ")}. Ini ` +
        "kelas cacat yang sama dengan tabel `min-width: 34rem` yang pernah " +
        "menggulirkan seluruh halaman mendatar di 360px (lihat catatan " +
        "`.content-body table` di ui-ux-design-system.md) — beri elemen ini " +
        "`overflow-x: auto` pada dirinya sendiri, pindahkan ke `@media " +
        "(min-width: …)` kalau memang khusus layar lebar, atau jelaskan di " +
        "sini kenapa ia aman"
    );
  });
});

describe("aritmetika kartu/skala di AGENTS.md sinkron dengan lebar bersih yang dihitung di atas", () => {
  test("AGENTS.md menyebut lebar kartu dan skala yang cocok dengan .container hari ini", () => {
    // Hanya sumber Inggris yang dibaca: `audit:translation` menjaga cermin
    // `.id.md` tetap SEUMUR dengan sumbernya lewat hash, bukan berkas ini —
    // membaca kedua bahasa di sini akan menduplikasi pemeriksaan itu, dan
    // salah satu akan menjadi berkas yang "kebetulan" tidak diperbarui.
    const cocok = AGENTS.match(
      /card\s+([0-9.]+)px wide.*?canvas appears at ([0-9.]+) scale/s
    );
    assert.notEqual(
      cocok,
      null,
      "tidak menemukan kalimat 'On a card <N>px wide … appears at <N> scale' " +
        "di AGENTS.md. Kalau kalimatnya ditulis ulang, gerbang ini perlu " +
        "regex baru SEBELUM ia bisa lagi menjaga angka itu tetap sinkron"
    );
    if (cocok === null) return;

    const [, lebarDitulis, skalaDitulis] = cocok;
    assert.equal(
      Number(lebarDitulis),
      LEBAR_BERSIH_PX,
      `AGENTS.md menyebut kartu ${lebarDitulis}px, sementara .container hari ` +
        `ini memberi lebar bersih ${LEBAR_BERSIH_PX}px pada lantai 360px — ` +
        "persis cacat asal berkas ini (328px yang tidak pernah cocok dengan " +
        "padding 1.25rem yang sungguh berlaku)"
    );
    assert.equal(
      Number(skalaDitulis),
      Number((LEBAR_BERSIH_PX / 800).toFixed(2)),
      `AGENTS.md menyebut skala ${skalaDitulis}, sementara ${LEBAR_BERSIH_PX}px ` +
        "dibagi kanvas 800px menghasilkan angka yang berbeda"
    );
  });
});
