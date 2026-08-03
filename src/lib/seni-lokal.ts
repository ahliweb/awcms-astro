/**
 * Pemetaan seni lokal — bagian `article-images.ts` yang bisa diuji tanpa build.
 *
 * ## Kenapa dipisah dari `article-images.ts`
 *
 * Berkas itu memanggil `import.meta.glob`, yang hanya ada setelah Vite
 * mentransformasinya. `bun test` tidak menjalankan Vite, jadi seluruh logika di
 * bawah akan menjadi kode yang tidak pernah diuji seandainya ia tinggal di sana
 * — persis kelas kode yang paling mahal salah, karena kegagalannya berbentuk
 * "gambarnya tidak muncul" dan tidak ada satu pun yang merah.
 *
 * Di sini logikanya menerima hasil glob sebagai ARGUMEN. `article-images.ts`
 * memanggilnya dengan hasil yang sebenarnya; tes memanggilnya dengan peta yang
 * dibuat tangan.
 */

/**
 * Ekstensi yang boleh menjadi seni.
 *
 * **Daftar ini harus sama dengan `EKSTENSI_GAMBAR` di
 * `scripts/audit-konten.mjs`**, dan itu bukan kerapian: gerbang audit hanya
 * memeriksa rasio berkas yang cocok dengan daftarnya sendiri, sementara pola
 * glob di `article-images.ts` hanya menyerap yang cocok dengan daftar ini. Dua
 * daftar yang menyimpang menghasilkan salah satu dari dua cacat diam:
 *
 *   - ekstensi yang diserap glob tetapi tidak diperiksa gerbang → seni berasio
 *     salah terbit tanpa satu pun peringatan;
 *   - ekstensi yang diperiksa gerbang tetapi tidak diserap glob → berkas yang
 *     lulus audit tidak pernah muncul di halaman, dan penulisnya mengira
 *     namanya yang salah.
 *
 * `tests/seni-lokal.test.mjs` membandingkan keduanya sebagai teks sehingga
 * penyimpangan itu memerahkan CI alih-alih menunggu ditemukan.
 */
export const EKSTENSI_SENI = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "svg"
] as const;

/**
 * Hasil `import.meta.glob` → indeks "jalur tanpa ekstensi" → URL.
 *
 * Kunci glob berbentuk `../assets/artikel/pajak/pbb.svg`; `awalan` yang dibuang
 * membuat indeksnya berbunyi `artikel/pajak/pbb`, yaitu bentuk yang dipakai
 * pemanggil. Ekstensi dibuang supaya sebuah situs bisa mengganti `.svg` menjadi
 * `.webp` tanpa menyentuh satu baris kode pun.
 *
 * **Dua berkas dengan nama sama dan ekstensi berbeda adalah ERROR, bukan
 * pilihan.** Memilih salah satunya diam-diam berarti situs menerbitkan seni
 * yang bukan hasil suntingan terakhir penulisnya, dan tidak ada cara melihatnya
 * selain membuka halamannya satu per satu. Build gagal dengan kedua jalurnya
 * disebut.
 */
export function indeksSeni(
  modul: Record<string, string>,
  awalan: string
): Map<string, string> {
  const indeks = new Map<string, string>();
  /** Jalur asal tiap kunci, hanya untuk menyusun pesan error yang berguna. */
  const asal = new Map<string, string>();

  for (const [jalur, url] of Object.entries(modul)) {
    const relatif = jalur.startsWith(awalan) ? jalur.slice(awalan.length) : jalur;
    const kunci = relatif.replace(/\.[^./]+$/, "");

    const sebelumnya = asal.get(kunci);
    if (sebelumnya !== undefined) {
      throw new Error(
        `Dua berkas seni bernama sama: "${sebelumnya}" dan "${relatif}". ` +
          `Ekstensi tidak menjadi pembeda — hapus salah satunya, karena yang ` +
          `mana yang terbit tidak bisa dilihat dari halamannya.`
      );
    }

    asal.set(kunci, relatif);
    indeks.set(kunci, url);
  }

  return indeks;
}

/**
 * URL seni pertama yang ada di antara kandidat, atau `undefined`.
 *
 * `undefined` adalah keadaan yang DIDUKUNG dan bergaya — pemanggilnya merender
 * blok bertoken. Template ini tidak membawa satu pun ilustrasi, jadi
 * `undefined` justru jawaban yang benar sampai sebuah situs mengisi
 * `src/assets/`.
 */
export function cariSeni(
  indeks: Map<string, string>,
  ...kandidat: string[]
): string | undefined {
  for (const kunci of kandidat) {
    const url = indeks.get(kunci);
    if (url !== undefined) return url;
  }
  return undefined;
}

/**
 * Slug menjadi teks yang layak dibaca screen reader.
 *
 * `alt` sengaja tidak pernah kosong. Kosong-dekoratif akan benar seandainya ini
 * hiasan, tetapi gambar-gambar ini duduk di kepala artikel sebagai identitas
 * visualnya — pembaca dengan screen reader berhak tahu ia sedang di artikel
 * yang mana.
 */
export function manusiawi(slug: string): string {
  return slug
    .split("-")
    .map((bagian) => bagian.charAt(0).toUpperCase() + bagian.slice(1))
    .join(" ");
}
