/**
 * Perekat antara `feed.ts` (murni, tanpa `awcms`) dan rute yang menerbitkannya.
 *
 * Ia terpisah dari `feed.ts` supaya berkas itu tetap bisa diuji dengan objek
 * biasa, dan terpisah dari kedua rute supaya keduanya tidak menjadi dua salinan
 * dari satu keputusan. Kedua rute — `/[tab]/feed.xml` dan
 * `/[lang]/[tab]/feed.xml` — memanggil `daftarFeed()` yang sama, jadi seksi
 * yang menerbitkan feed di locale default tidak bisa diam-diam berbeda dengan
 * yang menerbitkannya di locale berprefiks.
 */
import {
  artikelPerFeed,
  defaultLocale,
  getSiteUrl,
  localeHtmlLang,
  localePath,
  prefixedLocales,
  siteConfig,
  tabTitleKey,
  urutanSeksiTab,
  type Locale,
  type TabSlug
} from "../config/site";
import { getArticles } from "./content";
import { t } from "./po";
import { profilSitus } from "./awcms/profil";
import { namaSitus } from "./identitas";
import { NAMA_BERKAS_FEED, bangunFeedAtom, seksiPunyaFeed } from "./feed";

/** Path situs berkas feed sebuah seksi, mis. `/en/berita/feed.xml`. */
export function jalurFeed(locale: Locale, tab: string): string {
  return localePath(locale, `/${tab}/${NAMA_BERKAS_FEED}`);
}

/**
 * Setiap pasangan (locale, tab) yang menerbitkan feed.
 *
 * Ia MEMBACA artikelnya — bukan sekadar membaca konfigurasi — karena syarat
 * kedua `seksiPunyaFeed` adalah "punya artikel", dan seksi berita yang belum
 * berisi apa pun tidak boleh menghasilkan berkas. Biayanya nol: `getArticles`
 * memoisasi seluruh pengambilan per build, jadi ini membaca cache yang sama
 * dengan yang dipakai halaman-halamannya.
 */
export async function daftarFeed(): Promise<
  Array<{ locale: Locale; tab: TabSlug }>
> {
  const hasil: Array<{ locale: Locale; tab: TabSlug }> = [];

  for (const locale of [defaultLocale, ...prefixedLocales] as Locale[]) {
    for (const tab of siteConfig.tabs) {
      const jumlah = (await getArticles(tab.slug, locale)).length;
      if (seksiPunyaFeed(urutanSeksiTab(tab.slug), jumlah)) {
        hasil.push({ locale, tab: tab.slug });
      }
    }
  }

  return hasil;
}

/** Isi berkas feed satu seksi, siap dikirim sebagai respons. */
export async function isiFeed(locale: Locale, tab: TabSlug): Promise<string> {
  const articles = await getArticles(tab, locale);

  const tabFallback =
    siteConfig.tabs.find((entry) => entry.slug === tab)?.label ?? tab;
  const tabLabel = t(locale, tabTitleKey(tab), tabFallback);

  // Nama situs datang dari `site_profile` (`awcms` #596), sama seperti masthead.
  // Sebuah feed yang menamai situsnya berbeda dari halamannya adalah langganan
  // yang salah nama di daftar langganan pembaca — dan tidak ada gerbang yang
  // bisa melihatnya, karena kedua nama ada dan keduanya masuk akal dibaca
  // sendiri. Persis alasan `judul` feed dikirim sebagai satu objek bersama
  // `href`-nya di `BaseLayout`.
  const nama = namaSitus(await profilSitus());

  return bangunFeedAtom({
    // Judul feed membawa nama situs, bukan nama seksi saja. Pembaca feed
    // menampilkan judul ini di daftar langganan, tempat "Berita" saja tidak
    // memberi tahu siapa pun berita milik siapa.
    judul: `${tabLabel} — ${nama}`,
    ringkasan: t(locale, `tab.${tab}.metaDesc`, siteConfig.description),
    url: getSiteUrl(localePath(locale, `/${tab}/`)),
    urlDiri: getSiteUrl(jalurFeed(locale, tab)),
    bahasa: localeHtmlLang[locale],
    penerbit: nama,
    // Dibatasi `artikelPerFeed`. Sebuah feed adalah jendela TERBARU, bukan
    // arsip: tanpa batas ini seksi target migrasi memancarkan 23.906 entry di
    // setiap build, dan setiap pembaca feed mengunduh ulang seluruhnya pada
    // setiap polling. Pemotongan dilakukan SETELAH `getArticles`, yang sudah
    // mengurutkan seksi menurut aturannya sendiri, sehingga yang tersisa benar
    // benar yang terbaru dan bukan sekadar yang pertama datang dari API.
    butir: articles.slice(0, artikelPerFeed).map(({ entry, slug }) => ({
      judul: entry.data.title,
      url: getSiteUrl(localePath(locale, `/${tab}/${slug}/`)),
      ringkasan: entry.data.description,
      terbit: entry.data.publishedDate,
      diubah: entry.data.updatedDate
    }))
  });
}
