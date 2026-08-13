/**
 * Site configuration for an `awcms-astro` site.
 *
 * Everything a deployment changes lives here or in `.env` — no other file
 * should need editing to stand up a new site. The reference implementation
 * this template was extracted from (`web-lalulintasmelayani.com`) hard-coded
 * its own name, tabs, and locales in this file; the point of the template is
 * that those are now inputs.
 */
import { readEnv, readEnvOr } from "../lib/env";

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
 * A tab names a SECTION, and `slug` here must match the `kategori` value stored
 * in each post's `contentJson.awcmsAstro` — that is what `src/lib/content.ts`
 * actually filters on. It is NOT read from awcms's taxonomy terms today, even
 * though a tab maps conceptually onto one (`awcms_blog_terms`, taxonomy
 * `category`); the detail endpoint returns `termIds` but nothing here resolves
 * them yet. Renaming a tab without renaming the stored `kategori` produces an
 * empty section rather than an error, so keep the two in step.
 *
 * `label` is a LAST-RESORT label, not the one readers normally see. Every
 * surface renders `t(locale, 'home.tab.<slug>.title', tab.label)`, so the PO
 * catalogue wins and this only shows up for a tab whose key nobody has written
 * yet. An earlier version rendered a hard-coded uppercase `name` in the tab bar
 * instead, which meant the site's main navigation was the one piece of
 * interface that never translated — in a template whose whole point is being
 * multilingual.
 */
export const tabs = [
  { slug: "panduan", label: "Panduan", urutanSeksi: "manual" },
  { slug: "layanan", label: "Layanan", urutanSeksi: "manual" },
  { slug: "informasi", label: "Informasi", urutanSeksi: "manual" }
] as const satisfies readonly TabDef[];

export type TabSlug = (typeof tabs)[number]["slug"];

/**
 * How a section is ORDERED, which is also what decides whether it reads as a
 * reference section or as a news section (ADR-0033).
 *
 * - `"manual"` — the editor's `urutan` decides, lowest first. A guide section:
 *   step 1 before step 2, forever, and a three-year-old page stays at the top
 *   because that is where it belongs.
 * - `"terbaru"` — `publishedAt` decides, newest first. This is the ordering
 *   awcms's own public blog routes use (`ORDER BY published_at DESC`), and the
 *   only one that makes sense for content whose value decays. `urutan` is
 *   ignored in such a section: asking an editor to renumber the whole section
 *   on every publish is asking them to maintain by hand the one thing the
 *   timestamp already knows.
 *
 * A section declared `"terbaru"` also changes what its cards show (a date, not
 * an article number) and what its articles claim to be (`NewsArticle`, not
 * `Article`). One declaration, because those three things are one decision.
 */
export type UrutanSeksi = "manual" | "terbaru";

/**
 * The shape of one entry in `tabs`.
 *
 * `urutanSeksi` is written out on EVERY tab rather than defaulted when absent,
 * and that is not verbosity. A heterogeneous `as const` array — the field on
 * one entry and missing from the others — does not merely read badly, it fails
 * `astro check`: the element type becomes a union, and `tab.urutanSeksi` is
 * then a property that does not exist on some members of it.
 */
export type TabDef = { slug: string; label: string; urutanSeksi: UrutanSeksi };

/**
 * How a section is ordered, by slug.
 *
 * A slug that names no configured tab falls back to `"manual"`. That is
 * reachable — `ArtikelLayout` resolves the section from an article's stored
 * `kategori`, which is a free string in `contentJson` and can name a tab that
 * was renamed or removed — and `"manual"` is the honest answer for it: an
 * unknown section is not a news section.
 */
export function urutanSeksiTab(slug: string): UrutanSeksi {
  return tabs.find((tab) => tab.slug === slug)?.urutanSeksi ?? "manual";
}

/**
 * The USER-level admin surface this site carries — **empty by default**.
 *
 * A site built from this template is a PUBLIC site. It may also carry an admin
 * surface, and only if it SAYS SO here: an admin surface that appears because
 * someone added a route is exactly the failure this declaration exists to
 * prevent — a login form on a domain whose owner never decided to have one, on
 * a repo whose whole premise is that the container never talks to a database.
 *
 * ## Admin for a USER, never the MAIN admin
 *
 * That distinction is the whole rule, not a nuance of it. What may live here is
 * a surface a signed-in USER uses to do their own work on THIS site — write a
 * post, submit it for review, manage their own profile. What may never live
 * here is the main admin console: the screens that manage the SYSTEM — modules,
 * roles, tenants, audit trail, anything platform-scoped — which stay in awcms's
 * own `/admin/*` (ADR-0034, awcms ADR-0051).
 *
 * `peran` therefore lists awcms role codes BELOW the owner. **`owner` is
 * refused**, and the refusal is mechanical rather than advisory: the owner is
 * the full-system super manager, and a site that could sign one in here would
 * be a second door to the whole platform, drawn on a template.
 *
 * ## What declaring it does NOT do
 *
 * It does not move a single permission. awcms's default-deny RBAC/ABAC still
 * decides every request, and the surface here is never a looser second path —
 * the rule ADR-0017 wrote and ADR-0020 kept. Declaring a role here draws a
 * button; it does not grant anything, and a role that awcms refuses is refused
 * with the button on screen.
 *
 * ## Nothing here may exist ONLY here
 *
 * Every feature a user reaches through this surface must ALSO be manageable by
 * `owner` in awcms's `/admin/*`. It is the mirror of the rule above and it
 * closes the same door from the other side: the refusal of `owner` stops the
 * platform being reachable FROM here, and this stops anything here escaping the
 * place that is supposed to hold full control. A derived site that grew a
 * capability nobody could see, audit, or switch off would be that second door,
 * entered backwards.
 *
 * So the surface here is a PROJECTION of what awcms already does — the data,
 * the permission decision, and the audit trail all stay there — and the work
 * order follows from it: **awcms first, always.** A feature that lands here
 * before its owner screen exists is a feature nobody can turn off.
 *
 * ## The public site stays the PRIMARY function
 *
 * Declaring this does not turn the site into an admin app with a public
 * brochure attached. The public pages remain what this site is for, and the
 * admin surface sits BESIDE them — which is why `prefiks` may never be `/`,
 * never a locale prefix, and never a tab slug. Any of those would put a public
 * section behind a login, and the site would still build green: the pages are
 * all there, and every one of them now asks the reader to sign in.
 *
 * `tests/peran-situs.test.mjs` refuses all three.
 *
 * ## Both fields move together
 *
 * A half-declaration — routes with no roles, or roles with no routes — is a
 * misconfiguration rather than a smaller version of the feature, and the same
 * test refuses it. Routes without roles is an authenticated surface nobody may
 * enter; roles without routes is a permission grant that leads nowhere, which
 * reads like a surface that exists.
 */
export const permukaanAdmin = {
  /** Route prefixes allowed to opt out of static rendering, e.g. `["/redaksi"]`. */
  prefiks: [] as readonly string[],
  /** awcms role codes allowed in. Never `owner`. */
  peran: [] as readonly string[]
};

/**
 * The one role code that may never appear in `permukaanAdmin.peran`.
 *
 * Stated as a constant so the gate and the docblock above cannot drift apart,
 * and matched case-insensitively because awcms stores it as `role_code`
 * (`sql/085_awcms_platform_scoped_permissions.sql` and friends) while a site
 * config is hand-written.
 */
export const PERAN_DILARANG = "owner" as const;

/** True when this site is public-only — the template's own state. */
export function situsPublikSaja(): boolean {
  return permukaanAdmin.prefiks.length === 0 && permukaanAdmin.peran.length === 0;
}

/** The PO key carrying a tab's reader-facing name, paired with its fallback. */
export function tabTitleKey(slug: string): string {
  return `home.tab.${slug}.title`;
}

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

/**
 * The share card, or nothing.
 *
 * This template ships no card generator, so the honest default is **no
 * `og:image` at all**. The previous version pointed every page at
 * `/social/<slug>.png` — files produced by a script that only ever existed in
 * the reference implementation. Nothing failed: the build was green, the tag
 * was present, and every share preview on every page 404'd, while the
 * `ImageObject` in the page's JSON-LD claimed a 1200×630 image that was not
 * there. A missing card degrades to a text preview; a card that lies degrades
 * to a broken one.
 *
 * Set `SITE_SOCIAL_IMAGE` to an absolute URL, or to a site-relative path for a
 * file you have actually placed in `public/`.
 */
const socialImageRaw = readEnv("SITE_SOCIAL_IMAGE");

export const siteConfig = {
  name: readEnvOr("SITE_NAME", "AWCMS Astro"),
  description: readEnvOr(
    "SITE_DESCRIPTION",
    "Public information site built on the awcms-astro family template."
  ),
  /**
   * An optional glyph shown before the site name in the header. Empty by
   * default and rendered `aria-hidden` when set — it is decoration, and the
   * accessible name of the header link is the site name alone.
   *
   * Do NOT put a state emblem, official logo, or institutional insignia here.
   * A site built from this template is independent, and AGENTS.md §Keamanan
   * rules that out; the reference implementation's police-car glyph was
   * hard-coded into this header and is exactly what this field replaces.
   */
  mark: readEnv("SITE_MARK") ?? "",
  siteUrl,
  domain: new URL(siteUrl).host,
  socialImage: socialImageRaw
    ? socialImageRaw.startsWith("http")
      ? socialImageRaw
      : `${siteUrl}/${socialImageRaw.replace(/^\/+/, "")}`
    : undefined,
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
