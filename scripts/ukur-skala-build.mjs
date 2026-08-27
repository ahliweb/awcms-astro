/**
 * ukur-skala-build.mjs — berapa biaya sebuah korpus, diukur alih-alih ditebak.
 *
 * ## Kenapa berkas ini ada
 *
 * `MAX_PAGES = 400` di `src/lib/content.ts` dulu berkomentar bahwa ia "duduk
 * jauh di atas situs mana pun yang masuk akal (20.000 post)". Angka itu bukan
 * hasil pengukuran, dan pada 26 Agustus 2026 ia berhenti benar: `awcms`
 * mengukur arsip rujukan keluarga ini dan mendapat **25.029 artikel**
 * (ADR-0114-nya, yang juga mencatat bahwa angka 23.906 dikutip berminggu-minggu
 * sebelum ada yang menghitungnya).
 *
 * Jadi plafonnya ada DI BAWAH korpus yang sudah diukur keluarga ini sendiri, dan
 * kegagalannya — yang jujur, karena ia MELEMPAR alih-alih memotong diam-diam —
 * menyala pada situs yang sekadar besar alih-alih pada sebuah bug.
 *
 * Menaikkan konstantanya saja akan mengulang kesalahan yang sama satu tingkat
 * lebih tinggi. Berkas ini adalah cara mendapatkan angkanya.
 *
 * ## Apa yang diukur, dan apa yang TIDAK
 *
 * Yang diukur: waktu tembok dan puncak RSS untuk menelusuri korpus sintetis
 * berukuran N, lalu merender badan setiap artikelnya. Itu dua sumber daya yang
 * benar-benar membatasi build di runner CI.
 *
 * Yang TIDAK diukur, dan disebut supaya angkanya tidak dibaca lebih jauh
 * daripada yang ia klaim:
 *
 *   - **Latensi jaringan.** Server tiruannya lokal, jadi 501 permintaan
 *     berurutan ke `awcms` sungguhan akan LEBIH LAMBAT — berapa lambatnya
 *     bergantung pada RTT dan pada suhu database di sana.
 *   - **Biaya penulisan `dist/`.** Astro menulis satu berkas per halaman per
 *     locale; itu di luar adapter dan di luar berkas ini.
 *   - **Bentuk badan sungguhan.** Badan sintetisnya seragam; korpus nyata punya
 *     ekor panjang artikel yang jauh lebih besar dari median.
 *
 * ## Cara memakainya
 *
 *     bun scripts/ukur-skala-build.mjs                  # 1.000 / 5.000 / 25.000
 *     bun scripts/ukur-skala-build.mjs 1000 50000       # ukuran sendiri
 *
 * Ia TIDAK dijalankan di CI. Ini alat untuk memilih sebuah angka dan untuk
 * memeriksanya lagi saat seseorang menduga angka itu sudah basi — bukan gerbang.
 * Gerbang yang membangun 25.000 artikel pada setiap PR akan dimatikan orang
 * dalam sepekan.
 */
import { renderPortableText } from "../src/lib/portable-text.ts";

const UKURAN_BAWAAN = [1000, 5000, 25000];

/** Sama dengan `MAX_FULL_LIST_LIMIT` di awcms; dinyatakan, bukan ditemukan. */
const UKURAN_HALAMAN = 50;

/**
 * Satu badan artikel sintetis.
 *
 * Panjangnya dipilih untuk menyerupai berita menengah — sekitar 2,5 KB teks di
 * enam paragraf, dengan mark inline supaya renderer-nya benar-benar bekerja
 * alih-alih menyalin string.
 */
function badanSintetis(indeks) {
  const paragraf = (n) => ({
    _type: "block",
    _key: `b${indeks}-${n}`,
    style: n === 0 ? "h2" : "normal",
    children: [
      { _type: "span", _key: `s${n}a`, text: `Bagian ${n} dari artikel ${indeks}. `, marks: [] },
      { _type: "span", _key: `s${n}b`, text: "Angka penting", marks: ["strong"] },
      {
        _type: "span",
        _key: `s${n}c`,
        text: " disebut dalam dokumen yang bisa dibaca lengkap di lampiran, dan ringkasannya diulang di sini supaya pembaca tidak perlu membuka berkas lain hanya untuk memahami satu kalimat.",
        marks: []
      },
      { _type: "span", _key: `s${n}d`, text: " Rujukannya", marks: ["k1"] }
    ],
    markDefs: [{ _type: "link", _key: "k1", href: "https://contoh.test/rujukan" }]
  });

  return Array.from({ length: 6 }, (_, n) => paragraf(n));
}

function postSintetis(indeks) {
  const badan = badanSintetis(indeks);

  return {
    id: `00000000-0000-4000-8000-${String(indeks).padStart(12, "0")}`,
    title: `Artikel ${indeks}`,
    slug: `artikel-${indeks}`,
    excerpt: null,
    status: "published",
    visibility: "public",
    locale: "id",
    metaDescription: `Ringkasan artikel ${indeks} untuk hasil pencarian.`,
    canonicalUrl: null,
    publishedAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
    createdAt: "2026-07-01T00:00:00.000Z",
    termIds: ["term-panduan"],
    bodyPortableText: badan,
    // Proyeksi turunannya ikut, karena itulah yang benar-benar dikirim awcms
    // dan biayanya nyata: ia menggandakan badan setiap baris di memori.
    contentJson: {
      awcmsAstro: { schemaVersion: 1, kategori: "panduan", urutan: indeks },
      blocks: badan.map((blok) => ({
        type: "paragraph",
        text: blok.children.map((s) => s.text).join("")
      }))
    }
  };
}

/** MiB, satu desimal. */
function mib(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

/**
 * Satu pengukuran.
 *
 * Traversalnya ditirukan alih-alih dijalankan lewat HTTP: yang sedang diukur
 * adalah biaya MENAHAN dan MERENDER korpus, dan menambahkan server lokal hanya
 * akan mengukur loopback. Bentuk paginasinya tetap ditirukan supaya jumlah
 * halamannya nyata.
 */
async function ukur(jumlah) {
  Bun.gc(true);
  const awalHeap = process.memoryUsage().heapUsed;
  const mulai = Bun.nanoseconds();

  const halaman = Math.ceil(jumlah / UKURAN_HALAMAN);
  const posts = [];

  for (let h = 0; h < halaman; h += 1) {
    const batas = Math.min(UKURAN_HALAMAN, jumlah - posts.length);
    for (let i = 0; i < batas; i += 1) posts.push(postSintetis(posts.length));
  }

  const setelahTraversal = process.memoryUsage().heapUsed;
  const waktuTraversal = (Bun.nanoseconds() - mulai) / 1e6;

  let bytesHtml = 0;
  for (const post of posts) {
    bytesHtml += renderPortableText(post.bodyPortableText).length;
  }

  const total = (Bun.nanoseconds() - mulai) / 1e6;
  const puncak = process.memoryUsage();

  return {
    jumlah,
    halaman,
    waktuTraversal,
    waktuTotal: total,
    heapKorpus: setelahTraversal - awalHeap,
    rss: puncak.rss,
    bytesHtml
  };
}

const ukuran = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n) && n > 0);
const daftar = ukuran.length > 0 ? ukuran : UKURAN_BAWAAN;

console.log("── ukur skala build ──");
console.log(
  "Yang diukur: biaya MENAHAN korpus di memori dan MERENDER setiap badannya."
);
console.log(
  "TIDAK diukur: latensi jaringan ke awcms, penulisan dist/, dan ekor panjang artikel besar.\n"
);

const hasil = [];
for (const n of daftar) hasil.push(await ukur(n));

const kolom = [
  ["artikel", (r) => String(r.jumlah)],
  ["halaman", (r) => String(r.halaman)],
  ["traversal", (r) => `${r.waktuTraversal.toFixed(0)} ms`],
  ["+render", (r) => `${(r.waktuTotal - r.waktuTraversal).toFixed(0)} ms`],
  ["heap korpus", (r) => mib(r.heapKorpus)],
  ["RSS puncak", (r) => mib(r.rss)],
  ["HTML", (r) => mib(r.bytesHtml)]
];

const lebar = kolom.map(([nama, ambil]) =>
  Math.max(nama.length, ...hasil.map((r) => ambil(r).length))
);

console.log(kolom.map(([nama], i) => nama.padStart(lebar[i])).join("  "));
console.log(lebar.map((w) => "-".repeat(w)).join("  "));
for (const r of hasil) {
  console.log(kolom.map(([, ambil], i) => ambil(r).padStart(lebar[i])).join("  "));
}

console.log(
  "\nHeap korpus tumbuh LINEAR terhadap jumlah artikel: setiap baris menahan badan\n" +
    "kanoniknya DAN proyeksi turunannya sekaligus, karena itulah yang dikirim awcms.\n" +
    "Itu yang harus dibaca sebelum menaikkan MAX_PAGES lagi — plafonnya membatasi\n" +
    "jumlah post, sementara yang sebenarnya terbatas adalah memori."
);
