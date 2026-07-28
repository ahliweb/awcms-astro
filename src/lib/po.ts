import { defaultLocale, locales, type Locale } from '../config/site';
import idMessages from '../locales/id/messages.po?raw';
import enMessages from '../locales/en/messages.po?raw';

type Catalog = Record<string, string>;

const rawCatalogs: Record<Locale, string> = {
  id: idMessages,
  en: enMessages,
};

const catalogs = Object.fromEntries(
  Object.entries(rawCatalogs).map(([locale, raw]) => [locale, parsePo(raw)])
) as Record<Locale, Catalog>;

/**
 * Mengambil terjemahan dengan rantai fallback:
 *   locale yang diminta -> Bahasa Indonesia -> `fallback` (default: nama key).
 *
 * Fallback ke Bahasa Indonesia penting untuk keempat bahasa daerah yang
 * katalognya masih menunggu penutur asli: halaman tetap terbaca penuh, bukan
 * menampilkan potongan kosong atau nama key.
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
 * Belum dipakai halaman mana pun; disediakan untuk laporan progres terjemahan
 * dan dibaca `npm run audit` saat melaporkan cakupan katalog per locale.
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

/**
 * Batas entri ditentukan kemunculan `msgid`, bukan baris kosong.
 *
 * Versi sebelumnya memecah katalog per blok yang dipisah baris kosong lalu
 * mengambil pasangan msgid/msgstr pertama tiap blok. Akibatnya satu baris
 * kosong yang lupa ditulis membuat entri berikutnya lenyap tanpa error apa pun
 * — key-nya tampil mentah di halaman, dan gerbang audit tidak melihatnya karena
 * berkasnya sendiri terlihat benar. Parsing per `msgid` membuat pemisah antar
 * entri menjadi tidak relevan.
 */
function parsePo(raw: string): Catalog {
  const catalog: Catalog = {};
  let msgid: string | undefined;
  let msgstr: string | undefined;
  let lanjutan: 'msgid' | 'msgstr' | undefined;

  const simpan = () => {
    if (msgid && msgstr !== undefined) catalog[msgid] = msgstr;
    msgid = undefined;
    msgstr = undefined;
    lanjutan = undefined;
  };

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();

    if (line.startsWith('msgid ')) {
      simpan();
      msgid = readQuoted(line);
      lanjutan = 'msgid';
    } else if (line.startsWith('msgstr ')) {
      msgstr = readQuoted(line);
      lanjutan = 'msgstr';
    } else if (line.startsWith('"') && lanjutan) {
      // String multibaris: hanya baris berkutip yang langsung berurutan.
      if (lanjutan === 'msgid') msgid = (msgid ?? '') + readQuoted(line);
      else msgstr = (msgstr ?? '') + readQuoted(line);
    } else {
      // Baris kosong, komentar, atau direktif lain memutus rangkaian kutipan.
      lanjutan = undefined;
    }
  }
  simpan();
  return catalog;
}

function readQuoted(line: string): string {
  const match = line.match(/"([\s\S]*)"/);
  if (!match) return '';
  return match[1]
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}
