/**
 * Pengalihan permanen yang dijawab origin ini sendiri.
 *
 * ## Kenapa berkas ini ada
 *
 * Sampai ADR-0047 repo ini tidak bisa menjawab satu pun pengalihan. Bukan
 * "belum dikonfigurasi" — tidak ada kodenya: `astro.config.mjs` memakai
 * `output: "static"` tanpa kunci `redirects`, tidak ada berkas middleware, dan
 * `server/penyaji.mjs` tidak memuat satu pun kemunculan `301` atau `Location`.
 *
 * `awcms` mengukurnya alih-alih menduganya. ADR-0114-nya memutar-ulang **67
 * aturan redirect terhadap server hasil build repo ini: 404 pada setiap
 * satunya, nol header `Location`.** Aturan-aturan itu ditulis ke tabel
 * `awcms_seo_redirects`, yang diterapkan di satu tempat saja —
 * `src/middleware.ts` MILIK REPO ITU — sementara targetnya `/kategori/**`, rute
 * yang dilayani DI SINI. Aturan yang ditulis di sana tidak pernah dikonsultasi
 * untuk permintaan yang tidak pernah tiba di sana.
 *
 * ## Yang dijawab berkas ini, dan yang bukan urusannya
 *
 * ADR-0047 membelah tanggung jawabnya, dan pembelahannya bukan kompromi:
 *
 *   - **Origin (berkas ini)** menjawab pengalihan KONTEN — slug yang diganti,
 *     seksi yang digabung, halaman yang pindah. Repo ini tahu tentang
 *     perubahan itu karena repo ini yang membuatnya, dan repo ini punya
 *     gerbang. Sebuah konfigurasi edge tidak.
 *   - **Edge** menjawab normalisasi PROTOKOL dan HOST — `http`→`https`,
 *     `www`→apex — dan migrasi domain legacy. Hanya edge yang bisa meruntuhkan
 *     ketiganya menjadi satu lompatan, dan itu alasan `awcms` ADR-0114 memilih
 *     edge untuk cutover-nya. Keputusan itu tidak dibantah di sini.
 *
 * ## Aturan yang dijaga gerbang, bukan hanya ditulis
 *
 * `tests/pengalihan.test.mjs` menolak tiga hal, dan ketiganya menghasilkan
 * kegagalan yang tidak berbunyi:
 *
 *   1. **Rantai.** Sebuah target yang juga menjadi kunci berarti dua lompatan.
 *      PRD §9.2 keluarga ini melarang rantai lebih panjang dari satu, dan
 *      alasannya bukan estetika: mesin pencari membagi ekuitas tiap lompatan,
 *      dan sebagian berhenti mengikuti setelah beberapa.
 *   2. **Putaran.** `/a/` → `/b/` → `/a/` adalah tab browser yang menggantung.
 *   3. **Bentuk non-kanonik.** Build ini memancarkan `{tab}/{slug}/index.html`,
 *      sitemap-nya mendaftarkan bentuk berakhiran garis miring, dan setiap
 *      `<link rel="canonical">` menamai bentuk itu. Mengalihkan ke ejaan yang
 *      BUKAN kanonik menukar satu 404 dengan satu halaman yang menyangkal
 *      dirinya sendiri.
 *
 * ## Bentuknya sengaja jalur PERSIS, bukan pola
 *
 * Sebuah pola bisa mengalihkan halaman yang masih hidup, dan penulisnya tidak
 * akan tahu sampai ada pembaca yang tidak sampai. `sql/060` di `awcms`
 * mengambil keputusan yang sama untuk tabelnya, dengan alasan yang sama.
 *
 * Prefiks locale ditulis EKSPLISIT bila diperlukan. Menurunkannya otomatis
 * berarti menebak locale mana yang pernah menerbitkan halaman lama itu, dan
 * tebakan yang salah menerbitkan pengalihan menuju 404 yang pasti.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const PENGALIHAN = Object.freeze({
  // Sengaja KOSONG di repo template.
  //
  // Sebuah template tidak punya sejarah URL, jadi ia tidak punya apa pun untuk
  // dialihkan. Contoh yang ditinggalkan di sini akan tersalin ke setiap situs
  // turunan sebagai pengalihan yang hidup menuju halaman yang tidak pernah ada.
  //
  // Sebuah SITUS mengisinya seperti ini:
  //
  //     "/panduan/izin-lama/": "/layanan/izin-usaha/",
  //     "/en/panduan/old-permit/": "/en/layanan/business-permit/"
});

/**
 * Bentuk sebuah jalur untuk dicocokkan ke peta di atas.
 *
 * Query dan fragmen dibuang, path dinormalkan, dan garis miring penutup
 * DIPAKSAKAN — karena bentuk kanonik build ini memilikinya, dan sebuah peta
 * yang cocok pada `/a` tetapi tidak pada `/a/` adalah peta yang bekerja
 * separuh waktu tanpa ada yang tahu separuh yang mana.
 *
 * @param {string} jalur
 * @returns {string}
 */
export function kunciPengalihan(jalur) {
  if (typeof jalur !== "string" || jalur.length === 0) return "/";

  const tanpaFragmen = jalur.includes("#") ? jalur.slice(0, jalur.indexOf("#")) : jalur;
  const [path] = tanpaFragmen.split("?");

  let dekode = path ?? "/";
  try {
    dekode = decodeURI(dekode);
  } catch {
    // Jalur yang tidak bisa di-decode tidak akan cocok apa pun, dan itu benar:
    // ia dijawab oleh handler di bawah seperti sebelumnya.
  }

  const mulaiGarisMiring = dekode.startsWith("/") ? dekode : `/${dekode}`;

  // Normalisasi `..` dan `//` SEBELUM mencocokkan. Tanpa ini
  // `/panduan/../panduan/izin-lama/` melewati peta sepenuhnya.
  const normal = mulaiGarisMiring
    .replace(/\/{2,}/g, "/")
    .split("/")
    .reduce((tumpukan, bagian) => {
      if (bagian === "" || bagian === ".") return tumpukan;
      if (bagian === "..") {
        tumpukan.pop();
        return tumpukan;
      }
      tumpukan.push(bagian);
      return tumpukan;
    }, /** @type {string[]} */ ([]));

  return normal.length === 0 ? "/" : `/${normal.join("/")}/`;
}

/**
 * Target pengalihan untuk sebuah jalur, atau `undefined`.
 *
 * @param {string} jalur
 * @param {Readonly<Record<string, string>>} [peta]
 * @returns {string | undefined}
 */
export function targetPengalihan(jalur, peta = PENGALIHAN) {
  return peta[kunciPengalihan(jalur)];
}
