/**
 * "Lainnya di seksi ini" — apa yang dibaca seseorang setelah selesai
 * (`awcms` #597 butir 5).
 *
 * ## Kenapa namanya bukan "artikel terkait"
 *
 * Karena ia bukan itu, dan mengklaimnya akan menjadi kebohongan kecil yang
 * dibaca pembaca sebagai janji. Keterkaitan yang sebenarnya butuh taksonomi —
 * `termIds` memang dikembalikan `awcms`, tetapi tidak ada yang meresolusinya di
 * repo ini hari ini (lihat butir 1 issue yang sama, yang menuntut permukaan
 * `awcms` baru). Yang BISA dijawab sekarang, dari data yang sudah ditarik build,
 * adalah "apa lagi yang ada di seksi ini" — dan itulah yang ditulis di judulnya.
 *
 * Ketika taksonomi mendarat, blok ini menjadi tempat keterkaitan sungguhan
 * tinggal, dan judulnya berubah bersama datanya. Sampai saat itu ia tidak
 * menjanjikan apa pun yang tidak dipenuhinya.
 *
 * ## Dua aturan dari SATU deklarasi yang sudah ada
 *
 * Seksi yang diurutkan `"terbaru"` menawarkan yang TERBARU: nilainya meluruh,
 * dan pembaca berita mencari kabar berikutnya. Seksi `"manual"` menawarkan
 * TETANGGA menurut `urutan`: langkah 4 setelah langkah 3, karena itulah yang
 * sedang dikerjakan pembacanya.
 *
 * Keduanya dibaca dari `urutanSeksi` — deklarasi yang sama yang sudah memutuskan
 * apa yang ditampilkan kartu dan tipe schema.org apa yang diklaim artikel. Satu
 * deklarasi, karena ketiganya satu keputusan.
 *
 * Murni: tidak ada I/O, tidak ada DOM. Ia menerima daftar yang SUDAH terurut
 * menurut aturan seksinya (`getArticles`), jadi ia tidak pernah mengurutkan
 * ulang apa pun — dua tempat yang mengurutkan seksi adalah dua urutan seksi.
 */
import type { UrutanSeksi } from "../config/site";

/** Seberapa banyak yang ditawarkan. Tiga cukup untuk sebuah baris kartu dan tidak menggeser artikelnya sendiri keluar layar. */
export const MAKS_LAINNYA = 3;

type PunyaSlug = { slug: string };

/**
 * Artikel lain di seksi ini, paling banyak `maks`.
 *
 * `semua` datang dari `getArticles(tab, locale)` dan karenanya sudah berada
 * dalam urutan seksinya. Artikel yang sedang dibaca dibuang menurut SLUG, bukan
 * menurut posisi: posisi hanya benar bila pemanggil menemukannya lebih dulu,
 * dan pemanggil yang salah menemukan akan menawarkan artikel yang sedang dibuka
 * sebagai bacaan berikutnya.
 */
export function artikelLainnya<T extends PunyaSlug>(
  semua: readonly T[],
  slugIni: string,
  urutan: UrutanSeksi,
  maks: number = MAKS_LAINNYA
): T[] {
  const lain = semua.filter((artikel) => artikel.slug !== slugIni);

  if (lain.length === 0) return [];

  if (urutan === "terbaru") {
    // `semua` sudah terbaru-dulu, jadi ini benar-benar yang terbaru.
    return lain.slice(0, maks);
  }

  const posisi = semua.findIndex((artikel) => artikel.slug === slugIni);

  // Slug yang tidak ada di seksinya — sebuah artikel yang `kategori`-nya
  // menamai tab yang sudah diganti nama — jatuh ke awal daftar alih-alih
  // mengembalikan potongan dari indeks -1, yang akan diam-diam menawarkan
  // artikel TERAKHIR seksi itu.
  if (posisi === -1) return lain.slice(0, maks);

  // Tetangga: sesudah lebih dulu (langkah berikutnya), lalu sebelum. Diambil
  // dari `semua` supaya jaraknya dihitung terhadap posisi sebenarnya, lalu
  // disaring — mengambil dari `lain` akan menggeser setiap indeks setelah
  // artikel ini satu langkah dan menawarkan tetangga yang salah.
  const sesudah = semua.slice(posisi + 1);
  const sebelum = semua.slice(0, posisi).reverse();

  return [...sesudah, ...sebelum]
    .filter((artikel) => artikel.slug !== slugIni)
    .slice(0, maks);
}
