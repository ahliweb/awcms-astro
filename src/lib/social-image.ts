import { getSiteUrl } from '../config/site';

/** Ukuran baku kartu share Open Graph dan Twitter/X. */
export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;

/**
 * URL absolut kartu share sebuah halaman.
 *
 * Berkasnya PNG, dibangkitkan `scripts/kartu-share.mjs` ke `public/social/`
 * sebelum setiap build. Tiga alasan berkasnya tidak lewat `astro:assets`:
 * pengunduh pratinjau sosial tidak seragam mendukung SVG (dan mayoritas gambar
 * artikel di sini SVG), PNG hasil `astro:assets` terlalu besar untuk pratinjau
 * WhatsApp, dan cache kartu sosial dikunci per URL sehingga nama berkas
 * ber-hash menerbitkan URL baru setiap build.
 *
 * URL wajib absolut: crawler membaca metadata di luar konteks halaman dan tidak
 * bisa menyelesaikan path relatif.
 */
export function socialImage(name: string): string {
  return getSiteUrl(`/social/${name}.png`);
}

/** Kartu untuk halaman yang tidak punya gambar sendiri. */
export const DEFAULT_SOCIAL_IMAGE = getSiteUrl('/og-image.png');
