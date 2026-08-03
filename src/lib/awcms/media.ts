/**
 * Media awcms: asal publiknya, dan resolusi id menjadi URL.
 *
 * ## Dua panggilan, dan keduanya dibutuhkan pada waktu yang berbeda
 *
 *   - `asalMediaPublik()` dipanggil **sebelum** satu objek pun diambil, karena
 *     `img-src` harus menyebut host media di dalam kebijakan yang ditulis lebih
 *     dulu. Membaca origin dari `publicUrl` yang dikembalikan tidak menutupnya:
 *     build yang kebetulan tidak memuat satu gambar pun akan menghasilkan
 *     kebijakan tanpa `img-src` sama sekali, dan build berikutnya rusak.
 *   - `resolveObjekMedia()` dipanggil sekali per build untuk SELURUH id
 *     sekaligus, bukan sekali per artikel.
 *
 * ## Kenapa tidak menyalin `NEWS_MEDIA_R2_PUBLIC_BASE_URL`
 *
 * Itu yang dilakukan sebelum `awcms` membuka `GET /api/v1/media/public-origin`,
 * dan itu dua salinan satu nilai yang sepakat sampai salah satunya disunting.
 * Kegagalannya tidak menyebut sebabnya di mana pun: gambar diblokir diam-diam
 * oleh kebijakan yang tampak baik-baik saja.
 *
 * Keduanya digerbangi `media_library.media.read` — izin yang kredensial build
 * memang sudah pegang, jadi tidak ada wewenang baru yang ditambahkan.
 */
import { awcmsGet } from "./client";

/**
 * Batas `ids` per permintaan yang `awcms` terapkan.
 *
 * Ditulis di sini karena ia menentukan pemecahan batch di bawah. Melampauinya
 * dijawab 400, bukan dipotong diam-diam — jadi kelebihan satu id akan
 * menggagalkan build alih-alih menerbitkan situs yang sebagian gambarnya hilang.
 */
const MAKS_ID_PER_PERMINTAAN = 100;

export type AsalMediaPublik = {
  /** `false` saat deployment ini memang tidak menyajikan media publik. */
  configured: boolean;
  /** Skema + host + port, bentuk yang dipakai `img-src`. */
  origin: string | null;
  /** Base lengkap termasuk path — bentuk yang lebih ketat, tanpa trailing slash. */
  baseUrl: string | null;
};

export type ObjekMedia = {
  id: string;
  publicUrl: string;
  altText: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
};

/**
 * Asal media deployment ini.
 *
 * `configured: false` adalah **keadaan**, bukan kegagalan: profil LAN/offline
 * tidak menyajikan media publik sama sekali. Pemanggil menghilangkan entri
 * `img-src`-nya alih-alih menambahkan yang rusak, dan tetap bisa membedakannya
 * dari permintaan yang gagal — yang terakhir melempar.
 */
export async function asalMediaPublik(): Promise<AsalMediaPublik> {
  return awcmsGet<AsalMediaPublik>("/api/v1/media/public-origin");
}

/**
 * Id media → objeknya, dalam batch sebesar yang `awcms` izinkan.
 *
 * ## Yang TIDAK ada di hasil, dan artinya
 *
 * `awcms` mengembalikan `unresolved` untuk id yang tidak ada, milik tenant
 * lain, atau berstatus tidak aman dirujuk publik — ia melaporkannya alih-alih
 * membuangnya, justru supaya pemanggil bisa membedakan "tidak ada gambar" dari
 * "gambar ini hilang". Fungsi ini meneruskan pembedaan itu: id yang tidak
 * resolve tidak muncul di peta.
 *
 * Yang memutuskan apa artinya bukan di sini — lihat `content.ts`, tempat satu
 * id hilang menjadi placeholder sementara SELURUH id hilang menggagalkan build.
 */
export async function resolveObjekMedia(
  ids: readonly string[]
): Promise<Map<string, ObjekMedia>> {
  const unik = [...new Set(ids)];
  const hasil = new Map<string, ObjekMedia>();

  for (let i = 0; i < unik.length; i += MAKS_ID_PER_PERMINTAAN) {
    const batch = unik.slice(i, i + MAKS_ID_PER_PERMINTAAN);

    const respons = await awcmsGet<{
      items: ObjekMedia[];
      unresolved: string[];
    }>("/api/v1/media/objects", { ids: batch.join(",") });

    for (const objek of respons.items) hasil.set(objek.id, objek);
  }

  return hasil;
}
