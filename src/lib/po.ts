import { defaultLocale, locales, type Locale } from '../config/site';
import { parsePo, type Catalog } from './po-parse';
import idMessages from '../locales/id/messages.po?raw';
import enMessages from '../locales/en/messages.po?raw';

const rawCatalogs: Record<Locale, string> = {
  id: idMessages,
  en: enMessages,
};

const catalogs = Object.fromEntries(
  Object.entries(rawCatalogs).map(([locale, raw]) => [locale, parsePo(raw)])
) as Record<Locale, Catalog>;

/**
 * Mengambil terjemahan dengan rantai fallback:
 *   locale yang diminta -> locale default -> `fallback`.
 *
 * `fallback` default-nya nama key, dan itu bukan nilai yang baik untuk
 * ditampilkan — ia hanya lebih baik daripada halaman kosong. Untuk key yang
 * mungkin memang belum ada di katalog mana pun (nama tab yang ditentukan
 * konfigurasi, kategori biaya yang ditentukan redaksi), pemanggil WAJIB
 * mengirim fallback yang layak dibaca. Repo ini pernah menampilkan
 * "biaya.jenis.pnbp" dan "translation.notice.label" kepada pembaca justru
 * karena fallback itu dibiarkan default.
 */
export function t(locale: Locale, key: string, fallback = key): string {
  return catalogs[locale]?.[key] || catalogs[defaultLocale]?.[key] || fallback;
}

/** Apakah key sudah punya terjemahan asli pada locale ini (bukan hasil fallback). */
export function hasTranslation(locale: Locale, key: string): boolean {
  return Boolean(catalogs[locale]?.[key]);
}

/**
 * Persentase key yang sudah diterjemahkan pada satu locale.
 *
 * Belum dipakai halaman mana pun; disediakan untuk laporan progres terjemahan.
 * Paritas key antar katalog sendiri dijaga `tests/katalog-po.test.mjs`, yang
 * gagal bila sebuah katalog tertinggal — angka di sini melaporkan, tes itu
 * yang menghentikan.
 */
export function translationCoverage(locale: Locale): number {
  const total = Object.keys(catalogs[defaultLocale] ?? {}).length;
  if (!total) return 0;
  const done = Object.keys(catalogs[locale] ?? {}).length;
  return Math.round((done / total) * 100);
}

export function allLocales(): Locale[] {
  return [...locales];
}
