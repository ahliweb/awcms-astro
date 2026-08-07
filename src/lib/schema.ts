/**
 * Pembangun structured data schema.org.
 *
 * Dikumpulkan di satu berkas supaya klaim yang dibuat situs ini ke mesin
 * pencari bisa dibaca sekali jalan. Aturan kepatuhan repo berlaku penuh di
 * sini: tidak ada satu pun properti yang boleh menyiratkan situs ini kanal
 * resmi instansi negara.
 */
import { siteConfig, getSiteUrl, localeHtmlLang, urutanSeksiTab, type Locale } from '../config/site';
import { t } from './po';
import { SITE_SOCIAL_IMAGE, SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH } from './social-image';

type Schema = Record<string, unknown>;

/**
 * Tipe schema.org untuk artikel di sebuah seksi.
 *
 * Fungsi murni, di `src/lib/`, dan bukan ekspresi terner di dalam sebuah
 * `.astro` — karena `.astro` tidak dijangkau `tsc --noEmit` maupun tes mana
 * pun di repo ini, sehingga keputusan yang tinggal di sana bisa dibalik tanpa
 * satu gerbang pun berubah warna. Aturan ADR-0030 berlaku pada keputusan ini
 * seperti pada aturan lainnya (ADR-0033).
 *
 * `kategori` yang tidak menamai tab mana pun jatuh ke `Article`, karena
 * `urutanSeksiTab` menjawab `"manual"` untuknya: seksi yang tidak dikenal
 * bukan seksi berita.
 */
export function tipeArtikelSeksi(kategori: string): 'Article' | 'NewsArticle' {
  return urutanSeksiTab(kategori) === 'terbaru' ? 'NewsArticle' : 'Article';
}

const WEBSITE_ID = getSiteUrl('/#website');
const PUBLISHER_ID = getSiteUrl('/#publisher');

/**
 * Identitas situs, dipasang di setiap halaman.
 *
 * `Organization` di sini adalah penerbit situsnya sendiri, bukan instansi
 * layanan. Namanya nama situs dan tidak pernah nama satuan kepolisian.
 */
export function siteSchema(locale: Locale, canonicalUrl: string): Schema[] {
  return [
    {
      '@type': 'Organization',
      '@id': PUBLISHER_ID,
      name: siteConfig.name,
      url: getSiteUrl('/'),
      description: t(locale, 'footer.about.body'),
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: siteConfig.name,
      url: getSiteUrl('/'),
      inLanguage: localeHtmlLang[locale],
      publisher: { '@id': PUBLISHER_ID },
    },
    {
      '@type': 'WebPage',
      '@id': canonicalUrl,
      url: canonicalUrl,
      isPartOf: { '@id': WEBSITE_ID },
      inLanguage: localeHtmlLang[locale],
    },
  ];
}

export interface ArticleSchemaInput {
  locale: Locale;
  canonicalUrl: string;
  title: string;
  description: string;
  /** URL absolut kartu share, atau `undefined` bila situs ini belum punya. */
  image?: string;
  imageAlt: string;
  /**
   * Ukuran nyata gambarnya. Dihilangkan berarti "kartu situs", yang memang
   * 1200×630 menurut kontrak `.env.example`. Untuk gambar apa pun yang BUKAN
   * itu — kartu per artikel dari media awcms — mengisinya wajib: structured
   * data yang salah lebih buruk daripada yang tidak lengkap, karena ia diklaim.
   */
  imageWidth?: number | null;
  imageHeight?: number | null;
  /**
   * Kapan artikel ini TERBIT, dan kapan ia terakhir DIUBAH.
   *
   * Keduanya wajib, dan `updatedDate` yang dulu berdiri sendiri di sini sengaja
   * DIGANTI NAMANYA alih-alih ditemani field baru: satu nilai yang mengisi dua
   * klaim adalah cacat yang tidak bisa dilihat typecheck, dan menambah field
   * opsional di sebelahnya akan membiarkan setiap pemanggil lama tetap hijau
   * sambil terus memancarkan `datePublished` yang sebenarnya tanggal ubah.
   * Mengganti nama adalah yang memaksa setiap pemanggil dibaca ulang.
   */
  publishedDate: Date;
  modifiedDate: Date;
  section: string;
  /**
   * `NewsArticle` untuk seksi ber-`urutanSeksi: "terbaru"`, `Article` untuk
   * selainnya (ADR-0033).
   *
   * Ia datang dari pemanggil dan bukan ditebak dari isinya: yang menentukan
   * sebuah halaman berita atau bukan adalah seksi tempat ia tinggal, dan itu
   * konfigurasi situs — bukan sesuatu yang bisa disimpulkan dari judul.
   */
  tipe: 'Article' | 'NewsArticle';
}

/**
 * Artikel. `isAccessibleForFree` menegaskan tidak ada dinding bayar.
 *
 * ## `author` adalah ORGANISASI, dan itu keputusan yang ditiru
 *
 * Byline di sini adalah nama situs, tidak pernah nama seorang editor — sama
 * seperti `awcms`, yang memancarkan `authorName` dari nama tenant dan mencatat
 * alasannya di `structured-data-rendering.ts`: menaruh identitas pengguna
 * internal di structured data publik membuka permukaan PII baru. Kolom
 * `authorTenantUserId` memang ada pada baris post, tetapi meresolusinya menjadi
 * nama butuh permukaan `awcms` KEEMPAT, dan `tests/kontrak-awcms.test.mjs`
 * mengeraskan daftar tiga permukaan justru supaya penambahan seperti itu merah.
 *
 * Ia ditulis INLINE, bukan sebagai rujukan `@id` ke simpul Organization
 * halaman, karena pembaca structured data yang tidak menyelesaikan `@id` akan
 * membaca artikel tanpa penulis sama sekali — dan `author` yang kosong pada
 * `NewsArticle` adalah persis yang membuat tipe itu lebih miskin daripada
 * `Article` yang digantikannya.
 */
export function articleSchema(input: ArticleSchemaInput): Schema {
  return {
    '@type': input.tipe,
    '@id': `${input.canonicalUrl}#article`,
    mainEntityOfPage: { '@id': input.canonicalUrl },
    headline: input.title.slice(0, 110),
    description: input.description,
    // Properti `image` hanya muncul bila gambarnya benar-benar ada. Sebelumnya
    // ia selalu ada dan selalu menyatakan ImageObject 1200×630 di URL yang
    // tidak pernah dibangkitkan siapa pun — structured data yang salah lebih
    // buruk daripada structured data yang tidak lengkap, karena ia diklaim.
    ...(input.image
      ? {
          image: imageObject(
            input.image,
            input.imageAlt,
            input.imageWidth,
            input.imageHeight
          )
        }
      : {}),
    // Dua tanggal, dua kolom `awcms`, dua klaim yang berbeda. Sampai ADR-0033
    // keduanya diisi SATU nilai — `publishedAt ?? updatedAt` — dengan komentar
    // di sini yang menyatakan repo tidak menyimpan tanggal terbit terpisah.
    // Repo memang tidak menyimpannya; `awcms` menyimpannya, dan adapter tinggal
    // berhenti melipat keduanya. Akibat lipatan itu: tidak ada satu pun halaman
    // yang pernah melaporkan sebuah koreksi, karena `dateModified` membeku di
    // tanggal terbit selamanya.
    datePublished: input.publishedDate.toISOString(),
    dateModified: input.modifiedDate.toISOString(),
    inLanguage: localeHtmlLang[input.locale],
    articleSection: input.section,
    isPartOf: { '@id': WEBSITE_ID },
    author: { '@type': 'Organization', name: siteConfig.name },
    publisher: { '@id': PUBLISHER_ID },
    isAccessibleForFree: true,
  };
}

/** Halaman index tab: daftar artikel di dalamnya, berurutan. */
export function collectionSchema(name: string, description: string, items: Array<{ name: string; url: string }>): Schema {
  return {
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: getSiteUrl(item.url),
    })),
  };
}

// `wilayahSchema()` pernah ada di sini: pembangun `CollectionPage` yang
// menanamkan "Provinsi Kalimantan Tengah" dan `addressRegion` repo rujukan
// langsung di dalam kodenya. Tidak satu pun halaman template ini memanggilnya,
// dan seandainya ada yang memanggil, ia akan menerbitkan klaim wilayah milik
// situs lain. Dihapus, bukan digeneralisasi — sebuah situs yang benar-benar
// butuh skema wilayah menulisnya dari datanya sendiri, bukan dari sisa data
// situs lain.

function imageObject(
  url: string,
  alt: string,
  width?: number | null,
  height?: number | null
): Schema {
  return {
    '@type': 'ImageObject',
    url,
    // Ukuran yang dilaporkan sumbernya, dan HANYA jatuh ke konstanta kartu
    // situs saat pemanggil tidak menyebutkan apa pun. Sebelumnya konstanta itu
    // dipakai tanpa syarat, sehingga kartu per artikel dari media awcms —
    // WebP 1600×900, umumnya — akan diklaim 1200×630 di structured data yang
    // dibaca mesin, bukan manusia yang bisa melihat selisihnya.
    width: width ?? SOCIAL_IMAGE_WIDTH,
    height: height ?? SOCIAL_IMAGE_HEIGHT,
    caption: alt,
  };
}

/** Kartu share situs ini, atau `undefined` bila belum ada. */
export const defaultSocialImage = SITE_SOCIAL_IMAGE;
