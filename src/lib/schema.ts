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
import { DEFAULT_SOCIAL_IMAGE, SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH } from './social-image';

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
  image: string;
  imageAlt: string;
  updatedDate: Date;
  section: string;
  tags: string[];
}

/** Artikel panduan. `isAccessibleForFree` menegaskan tidak ada dinding bayar. */
export function articleSchema(input: ArticleSchemaInput): Schema {
  return {
    '@type': 'Article',
    '@id': `${input.canonicalUrl}#article`,
    mainEntityOfPage: { '@id': input.canonicalUrl },
    headline: input.title.slice(0, 110),
    description: input.description,
    image: imageObject(input.image, input.imageAlt),
    // Sumber tanggal hanya satu: `updatedDate`. Repo tidak menyimpan tanggal
    // terbit terpisah, dan mengarang `datePublished` yang berbeda akan menjadi
    // klaim yang tidak bisa dipertanggungjawabkan.
    datePublished: input.updatedDate.toISOString(),
    dateModified: input.updatedDate.toISOString(),
    inLanguage: localeHtmlLang[input.locale],
    articleSection: input.section,
    keywords: input.tags.join(', '),
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

/**
 * Halaman wilayah: cakupan layanan yang dijelaskan halaman ini.
 *
 * `areaServed` dipasang pada halamannya, bukan pada penerbit situs — yang
 * melayani wilayah adalah unit layanan yang didaftar, bukan situs ini.
 */
export function wilayahSchema(canonicalUrl: string, nama: string, ibukota: string, jumlahUnit: number): Schema {
  return {
    '@type': 'CollectionPage',
    '@id': `${canonicalUrl}#wilayah`,
    mainEntityOfPage: { '@id': canonicalUrl },
    name: nama,
    about: {
      '@type': 'AdministrativeArea',
      name: nama,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Provinsi Kalimantan Tengah',
        containedInPlace: { '@type': 'Country', name: 'Indonesia' },
      },
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: nama,
      address: {
        '@type': 'PostalAddress',
        addressLocality: ibukota,
        addressRegion: 'Kalimantan Tengah',
        addressCountry: 'ID',
      },
    },
    numberOfItems: jumlahUnit,
  };
}

function imageObject(url: string, alt: string): Schema {
  return {
    '@type': 'ImageObject',
    url,
    width: SOCIAL_IMAGE_WIDTH,
    height: SOCIAL_IMAGE_HEIGHT,
    caption: alt,
  };
}

/** Kartu share baku, dipakai halaman tanpa gambar sendiri. */
export const defaultSocialImage = DEFAULT_SOCIAL_IMAGE;
