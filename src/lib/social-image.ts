/**
 * Kartu share Open Graph — dan kenapa template ini biasanya tidak punya satu pun.
 *
 * Versi sebelumnya berkas ini mengembalikan `${SITE_URL}/social/<nama>.png`
 * untuk SETIAP halaman, dan menyebut `scripts/kartu-share.mjs` sebagai
 * pembangkitnya. Skrip itu tidak pernah ikut ke template ini — ia tinggal di
 * repo rujukan bersama seni dan data domainnya, dan README sendiri
 * mendaftarkannya di "Yang belum ada". Akibatnya bukan kartu yang jelek,
 * melainkan kartu yang BOHONG: setiap halaman memasang `og:image`,
 * `twitter:image`, dan `ImageObject` JSON-LD berukuran 1200×630 yang menunjuk
 * berkas 404 — sementara build tetap hijau dan tidak ada satu pun yang gagal.
 * Pratinjau tanpa gambar jatuh ke kartu teks yang rapi; pratinjau dengan gambar
 * rusak tidak jatuh ke mana pun.
 *
 * Jadi sekarang hanya ada satu kartu, opsional, dinyatakan `SITE_SOCIAL_IMAGE`,
 * dan halaman yang tidak punya kartu tidak memasang tag gambar sama sekali.
 *
 * Begitu sebuah situs benar-benar membangkitkan kartu per halaman, tambahkan
 * pembangkitnya lebih dulu lalu perluas berkas ini — bukan sebaliknya.
 */
import { siteConfig } from '../config/site';

/** Ukuran baku kartu share Open Graph dan Twitter/X. */
export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;

/**
 * Kartu share situs ini, atau `undefined` bila belum ada.
 *
 * `undefined` adalah keadaan yang DIDUKUNG, bukan yang rusak: `BaseLayout`
 * melepas seluruh tag gambar saat nilainya kosong. URL-nya wajib absolut —
 * crawler membaca metadata di luar konteks halaman dan tidak bisa
 * menyelesaikan path relatif — dan `src/config/site.ts` yang menjadikannya
 * absolut.
 */
export const SITE_SOCIAL_IMAGE: string | undefined = siteConfig.socialImage;

/**
 * Satu kartu share, dengan seluruh metadata yang mendeskripsikannya.
 *
 * ## Kenapa satu objek, bukan lima prop terpisah
 *
 * Selama `ogImage` dan `ogImageAlt` adalah dua prop, keduanya bisa berasal dari
 * dua gambar BERBEDA — dan memang begitu yang terjadi: halaman seksi memasang
 * `og:image` kartu situs dengan `og:image:alt` yang memerikan hero seksinya,
 * dan halaman artikel melakukan hal yang sama dengan alt hero artikelnya.
 * Pembaca layar di lini masa sosial karena itu mendengar deskripsi gambar yang
 * TIDAK sedang ditampilkan kepadanya, dan tak satu pun gerbang bisa melihatnya:
 * kedua tag ada, keduanya terisi, dan keduanya masuk akal dibaca sendiri.
 *
 * Digabung menjadi satu objek, cacat itu berhenti bisa ditulis. `alt` tidak
 * punya jalan untuk berpisah dari `src` yang dijelaskannya.
 */
export type KartuShare = {
  src: string;
  alt: string;
  /** MIME sebenarnya. Kartu situs dikontrakkan PNG; media awcms membawa miliknya. */
  type: string;
  width: number | null;
  height: number | null;
};

/**
 * Kartu situs sebagai kartu halaman, atau `undefined` bila tidak ada.
 *
 * Ukuran dan MIME-nya konstanta, dan itu SAH di sini justru karena ia kontrak:
 * `.env.example` menyuruh siapa pun yang mengisi `SITE_SOCIAL_IMAGE` memakai
 * PNG 1200×630. Yang tidak sah adalah memakai konstanta yang sama untuk gambar
 * yang tidak pernah menandatangani kontrak itu — lihat ADR-0026.
 */
export function kartuSitus(alt: string): KartuShare | undefined {
  if (!SITE_SOCIAL_IMAGE) return undefined;

  return {
    src: SITE_SOCIAL_IMAGE,
    alt,
    type: 'image/png',
    width: SOCIAL_IMAGE_WIDTH,
    height: SOCIAL_IMAGE_HEIGHT,
  };
}
