/**
 * Pembangun structured data schema.org.
 *
 * Dikumpulkan di satu berkas supaya klaim yang dibuat situs ini ke mesin
 * pencari bisa dibaca sekali jalan. Aturan kepatuhan repo berlaku penuh di
 * sini: tidak ada satu pun properti yang boleh menyiratkan situs ini kanal
 * resmi instansi negara.
 */
import { siteConfig, getSiteUrl, localeHtmlLang, type Locale } from '../config/site';
import { t } from './po';
import { SITE_SOCIAL_IMAGE, SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH } from './social-image';

type Schema = Record<string, unknown>;

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
  updatedDate: Date;
  section: string;
}

/** Artikel panduan. `isAccessibleForFree` menegaskan tidak ada dinding bayar. */
export function articleSchema(input: ArticleSchemaInput): Schema {
  return {
    '@type': 'Article',
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
    // Sumber tanggal hanya satu: `updatedDate`. Repo tidak menyimpan tanggal
    // terbit terpisah, dan mengarang `datePublished` yang berbeda akan menjadi
    // klaim yang tidak bisa dipertanggungjawabkan.
    datePublished: input.updatedDate.toISOString(),
    dateModified: input.updatedDate.toISOString(),
    inLanguage: localeHtmlLang[input.locale],
    articleSection: input.section,
    isPartOf: { '@id': WEBSITE_ID },
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
