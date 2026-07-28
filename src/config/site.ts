/**
 * Site configuration for an `awcms-astro` site.
 *
 * Everything a deployment changes lives here or in `.env` — no other file
 * should need editing to stand up a new site. The reference implementation
 * this template was extracted from (`web-lalulintasmelayani.com`) hard-coded
 * its own name, tabs, and locales in this file; the point of the template is
 * that those are now inputs.
 */
import { readEnvOr } from "../lib/env";

/**
 * The locale whose article set is the SOURCE OF TRUTH.
 *
 * This is not cosmetic. Every other locale's page set is derived from this
 * one (see `src/lib/content.ts`), which is what guarantees every language has
 * the same number of pages and no cross-language link ever 404s. Changing it
 * changes which language a missing translation falls back to.
 */
export const defaultLocale = "id" as const;

/**
 * Order here is the order in the language switcher.
 *
 * A locale needs an ISO 639-1 two-letter code for `hreflang` to be honoured by
 * search engines. Three-letter ISO 639-3 codes (regional languages that have
 * no two-letter code) are still worth carrying — the document's `lang`
 * attribute stays correct for screen readers, which is a real reader-facing
 * win even when crawlers ignore the alternate link.
 */
export const localeMeta = {
  id: { htmlLang: "id-ID", nama: "Bahasa Indonesia", iso: "id" },
  en: { htmlLang: "en-US", nama: "English", iso: "en" }
} as const;

export const locales = Object.keys(localeMeta) as Array<keyof typeof localeMeta>;
export type Locale = keyof typeof localeMeta;

/** Locales other than the default; drives the `[lang]` route's `getStaticPaths`. */
export const prefixedLocales = locales.filter((l) => l !== defaultLocale);

export const localeHtmlLang = Object.fromEntries(
  locales.map((l) => [l, localeMeta[l].htmlLang])
) as Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Top-level sections, in a FIXED order.
 *
 * A tab is a taxonomy category in awcms (`awcms_blog_terms`, taxonomy
 * `category`) — `slug` here must match the term slug there, because that is
 * what `src/lib/content.ts` queries on. Renaming a tab without renaming the
 * term produces an empty section rather than an error, so keep the two in step.
 */
export const tabs = [
  { slug: "panduan", name: "PANDUAN", label: "Panduan" },
  { slug: "layanan", name: "LAYANAN", label: "Layanan" },
  { slug: "informasi", name: "INFORMASI", label: "Informasi" }
] as const;

export type TabSlug = (typeof tabs)[number]["slug"];

/**
 * `SITE_URL` is read at BUILD time and must be the canonical absolute origin —
 * it is what canonical links, `hreflang` alternates, Open Graph URLs, the
 * sitemap, and `robots.txt` are all built from. A wrong value here does not
 * break the build; it publishes a site that points every crawler somewhere
 * else, which is why it has no silent default in production.
 */
const siteUrl = readEnvOr("SITE_URL", "http://localhost:4321").replace(
  /\/+$/,
  ""
);

export const siteConfig = {
  name: readEnvOr("SITE_NAME", "AWCMS Astro"),
  description: readEnvOr(
    "SITE_DESCRIPTION",
    "Public information site built on the awcms-astro family template."
  ),
  siteUrl,
  domain: new URL(siteUrl).host,
  tabs
};

export function getSiteUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.siteUrl}${cleanPath}`;
}

/**
 * The default locale stays at the root (`/panduan/`); every other locale is
 * prefixed with its code (`/en/panduan/`). Indexed URLs in the default
 * language therefore never change when a language is added.
 */
export function localePath(locale: Locale, path: string = "/"): string {
  const clean = `/${path.replace(/^\/+/, "")}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}/` : `/${locale}${clean}`;
}

/** Resolves the locale from a pathname, so components need no prop chain. */
export function getLocaleFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && isLocale(first) && first !== defaultLocale
    ? first
    : defaultLocale;
}

/** Strips the locale prefix, leaving a locale-neutral path. */
export function stripLocale(pathname: string): string {
  const current = getLocaleFromPath(pathname);
  if (current === defaultLocale) return pathname || "/";
  return pathname.replace(new RegExp(`^/${current}(?=/|$)`), "") || "/";
}

/** The same path in another locale — for the language switcher and `hreflang`. */
export function swapLocalePath(pathname: string, target: Locale): string {
  return localePath(target, stripLocale(pathname));
}
