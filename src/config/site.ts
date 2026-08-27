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
import { asalPencarian } from "../lib/pencarian";

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
  { slug: "panduan", label: "Panduan", urutanSeksi: "manual", termSlugs: ["panduan"] },
  { slug: "layanan", label: "Layanan", urutanSeksi: "manual", termSlugs: ["layanan"] },
  { slug: "informasi", label: "Informasi", urutanSeksi: "manual", termSlugs: ["informasi"] }
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
export type TabDef = {
  slug: string;
  label: string;
  urutanSeksi: UrutanSeksi;
  /**
   * Slug term `awcms` yang menempatkan sebuah artikel di seksi ini.
   *
   * ## Kenapa field ini ada, dan kenapa ia bukan kenyamanan
   *
   * Sebelum ini, seksi sebuah artikel HANYA dibaca dari
   * `contentJson.awcmsAstro.kategori` — sebuah sidecar milik repo ini yang
   * jalur authoring `awcms` tidak pernah menulisnya. Satu-satunya penulisnya di
   * seluruh CMS adalah `blog:legacy:import --section-map`, sebuah CLI sekali
   * jalan. Akibatnya: setiap artikel yang ditulis editor di layar admin `awcms`
   * TIDAK PERNAH TERBIT di situs ini. Bukan salah render — tidak dibangun sama
   * sekali, dengan build hijau.
   *
   * Term taksonomi adalah klasifikasi yang benar-benar bisa disetel editor, dan
   * repo ini sudah membacanya untuk arsip kategori/tag (`/api/v1/blog/terms`).
   * Field ini menghubungkan keduanya.
   *
   * ## Ditulis di SETIAP tab, seperti `urutanSeksi`
   *
   * Alasannya sama persis dengan tetangganya di atas, dan bukan kerapian: array
   * `as const` yang heterogen — field ada di satu entri dan hilang di entri lain
   * — membuat tipe elemennya menjadi union, dan `tab.termSlugs` lalu menjadi
   * properti yang tidak ada pada sebagian anggotanya. `astro check` merah.
   *
   * ## Bawaannya adalah slug tab itu sendiri, dan itu tetap DITULIS
   *
   * Sebuah situs yang kategorinya dinamai sama dengan seksinya menulis
   * `termSlugs: ["panduan"]` — terlihat mubazir, dan tidak. Sebuah situs yang
   * seksinya `berita` sementara kategori redaksinya `berita-daerah` dan
   * `berita-kota` menulis keduanya, dan tanpa field ini ia tidak punya tempat
   * untuk menyatakannya selain mengubah nama kategori di CMS.
   *
   * Beberapa tab boleh menyebut slug yang sama; yang menang adalah tab yang
   * lebih dulu dideklarasikan di `tabs`. Lihat `src/lib/content.ts`.
   */
  termSlugs: readonly string[];
};

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
 * The route segment that carries a section's page number: `/panduan/halaman/2/`.
 *
 * A CONSTANT rather than a literal in four route files, because it is also what
 * `tests/paginasi.test.mjs` refuses an article slug from colliding with — a post
 * slugged `halaman` would be shadowed by the pagination route, and the symptom
 * is one article that 404s while every gate stays green.
 *
 * Indonesian, like `feed.xml` is not: this is a reader-facing URL segment in a
 * template whose default locale is Indonesian, and translating it per locale
 * would make the same article set live at two different paths.
 */
export const SEGMEN_HALAMAN = "halaman" as const;

/**
 * The route segments the taxonomy archives live under (`awcms` #597 item 1).
 *
 * Two words rather than one shared prefix (`/arsip/kategori/…`): these are the
 * URLs a reader shares and a search engine indexes, and `/kategori/politik/` is
 * what both expect from a news site. The cost is one route directory per
 * vocabulary, which is the same cost `[tab]/` already pays.
 *
 * Indonesian for the same reason `SEGMEN_HALAMAN` is, and NOT translated per
 * locale for the same reason either: the same article set must not live at two
 * different paths.
 *
 * They sit beside `SEGMEN_HALAMAN` because they answer the same question —
 * which words this template reserves at the top of a path — and because an
 * article slugged `kategori` would otherwise be shadowed by this route,
 * producing exactly one article that 404s while every gate stays green.
 */
export const SEGMEN_KATEGORI = "kategori" as const;
export const SEGMEN_TAG = "tag" as const;

/**
 * The reader's search page (`awcms` #607, `awcms` #597 item 3).
 *
 * Reserved for the same reason and with the same cost as the two above: a tab
 * slugged `cari` would declare a section index at the URL the search page
 * already occupies, Astro would build both, and one would win silently.
 *
 * Indonesian, like `kategori` and `tag` — and NOT translated per locale, so a
 * reader who switches language keeps the search they were looking at rather
 * than landing on a path that does not exist.
 */
export const SEGMEN_CARI = "cari" as const;

/**
 * The privacy page (ADR-0044).
 *
 * Reserved for the same reason as its neighbours, and SHIPPED rather than left
 * to each site to write: the page's text has to say what this build actually
 * does, and only this build knows whether it declared a beacon. A page a site
 * is told to write by hand is a page that describes what somebody assumed.
 */
export const SEGMEN_PRIVASI = "privasi" as const;

/**
 * Every word this template claims at the top of a path.
 *
 * `[tab]/index.astro` matches `/kategori/` and `[tab]/[...slug].astro` matches
 * `/kategori/politik/`, so a site that configures a tab slugged `kategori`
 * declares two different pages at one URL. Astro builds both and one wins —
 * the section index or the archive, silently, with every gate green and one
 * whole part of the site unreachable.
 */
export const SEGMEN_TERPESAN = [
  SEGMEN_KATEGORI,
  SEGMEN_TAG,
  SEGMEN_HALAMAN,
  SEGMEN_CARI,
  SEGMEN_PRIVASI
] as const;

/**
 * Refuses a tab whose slug collides with a reserved segment.
 *
 * Pure and exported so `tests/arsip-taksonomi.test.mjs` can prove it REFUSES
 * rather than only that the shipped configuration happens to pass — a check
 * that has never seen a failing input is a check nobody has tested.
 */
export function tabBentrokSegmen(
  daftar: readonly { slug: string }[] = tabs
): string[] {
  return daftar
    .map((tab) => tab.slug)
    .filter((slug) => (SEGMEN_TERPESAN as readonly string[]).includes(slug));
}

// Thrown at import time, like the `SITE_POSTS_PER_PAGE` check above and for the
// same reason: a configuration this template cannot serve correctly must fail
// where it is written, not produce a site that is quietly missing pages.
{
  const bentrok = tabBentrokSegmen();

  if (bentrok.length > 0) {
    throw new Error(
      `siteConfig.tabs uses ${bentrok.map((s) => `"${s}"`).join(", ")}, ` +
        `which this template reserves for its own routes ` +
        `(${SEGMEN_TERPESAN.join(", ")}). A section and an archive would ` +
        `declare the same URL, and only one of them would be built. Rename ` +
        `the section.`
    );
  }
}

/**
 * The `awcms` origin the READER's browser may call for search, or `undefined`.
 *
 * Derived from `AWCMS_API_URL` — the same variable the build already reads —
 * rather than from a second setting, because two settings for one address is
 * one of them being edited and the other not. Reduced to its origin here so
 * exactly one string reaches both places that need it: the search box (as a
 * `data-` attribute rendered at build time) and the `connect-src` directive in
 * `server/penyaji.mjs` (through `dist/server/asal-pencarian.json`).
 *
 * `undefined` — a template with no CMS configured — means NO SEARCH BOX. Not a
 * box that fails, and not a box that calls the site's own origin: a control
 * that does nothing when used is worse than a control that is not there
 * (`AGENTS.md` §Interface).
 *
 * It is deliberately NOT a `PUBLIC_` variable. Nothing is inlined into the
 * client bundle by Vite; the origin travels as a rendered attribute, which is
 * also what stops a second site's build from inheriting it.
 */
export const asalPencarianSitus = asalPencarian(readEnv("AWCMS_API_URL"));

/** Whether this build can render a working search box at all. */
export const pencarianAktif = asalPencarianSitus !== undefined;

/**
 * Whether this build publishes a newsletter subscription form — ADR-0049.
 *
 * **A site turns it on by declaring `SITE_NEWSLETTER=true`, and it takes effect
 * only where there is an origin to post to.** The second half is not a
 * courtesy: the form, the confirmation page and the unsubscribe page are all
 * calls to `awcms` from a reader's browser, and a declaration with no origin
 * would publish three surfaces that can do nothing. The beacon pairs the same
 * two conditions for the same reason.
 *
 * ## It stayed hard-coded `false` until 28 August 2026, and that was right
 *
 * `awcms` shipped the module on 21 August (its ADR-0103) with an anonymous,
 * double-opt-in `POST /api/v1/newsletter/subscribe`. Reading its source rather
 * than assuming found FOUR things that made the endpoint unreachable from a
 * static site — no `OPTIONS` for the preflight its own JSON contract forces, no
 * `Access-Control-Allow-Origin`, a tenant resolved from a HOST that is the CMS
 * rather than from the site's `Origin`, and a confirmation link built on the
 * CMS's own origin where no such page exists. All four are fixed by `awcms`
 * ADR-0118, and the three paths are frozen in its `COMMITTED_PATHS` — the order
 * that repo's own contract file requires, and the reason this flag could not
 * simply have been an env var from the start. A switch a site could flip while
 * any of the four stood would have published a promise to a reader that nothing
 * could keep.
 *
 * ## What this build still cannot check, and says instead of pretending
 *
 * Whether the `awcms` tenant has the `newsletter` module ENABLED. A disabled
 * module answers the same neutral body as a successful subscription — that is
 * ADR-0103's anti-enumeration decision working as designed — so a site can
 * publish a form that quietly collects nothing. Nothing here can see the
 * difference, and nothing here should try: the check belongs in the CMS's own
 * admin screen, where the person who can act on it is looking.
 */
export const newsletterAktif =
  readEnv("SITE_NEWSLETTER") === "true" && asalPencarianSitus !== undefined;

/**
 * The visitor beacon this site sends, or `undefined` — ADR-0044.
 *
 * **Off by default, and a site turns it on by NAMING ITS TENANT CODE.** There
 * is no separate boolean: a switch and a value that must both be set is a pair
 * that gets half-set, and the half-set state here would be a site sending page
 * views nowhere or, worse, into whichever tenant a stale code happens to name.
 *
 * `SITE_BEACON_TENANT_CODE` is **not** the retired `AWCMS_TENANT_CODE`, and
 * the difference is worth stating because the two look alike and one of them
 * THROWS. That one used to SELECT which tenant the build published — a
 * selection that could silently disagree with the token, which is why
 * `src/lib/awcms/tenant.ts` refuses it rather than ignoring it. This one
 * selects nothing: it is the public code `awcms` needs in the beacon's body to
 * know whose page view this is, the same code that already appears in that
 * repo's own public URLs. It cannot change what this site builds.
 *
 * It also requires `asalPencarianSitus`, because the beacon is posted to the
 * same origin the search box calls, named in the same `connect-src` directive.
 * A tenant code with no origin to send it to is a declaration that does nothing,
 * so it produces no beacon rather than a broken one.
 *
 * **What this repo CANNOT check, and says so instead of pretending:** whether
 * that `awcms` tenant has `rawIpEnabled` switched on, which makes it store
 * readers' IP addresses rather than only a salted hash. ADR-0044 refuses the
 * declaration in that case, and the refusal lives with the person who can see
 * it — `.env.example` and the privacy page — because nothing here can read it.
 */
export const beaconKunjungan = (() => {
  const tenantCode = readEnv("SITE_BEACON_TENANT_CODE");

  if (!tenantCode || !asalPencarianSitus) return undefined;

  return { tenantCode, asal: asalPencarianSitus };
})();

/**
 * How many article cards one section page carries.
 *
 * PRD FR-DSC-006 asks for a BOUNDED archive before production volume, and the
 * volume that made it urgent is real: a 23,906-article migration renders its
 * entire history into one document without this. That page is not merely slow —
 * it is a single HTML response holding every headline the newsroom has ever
 * published, which no reader scrolls and no crawler treats as a useful index.
 *
 * A malformed value THROWS rather than falling back, the same rule
 * `AWCMS_API_TIMEOUT_MS` follows in `lib/awcms/client.ts`: a setting that
 * silently ignores what an operator wrote is a value that reads like
 * configuration and decides nothing.
 */
export const artikelPerHalaman = (() => {
  const raw = readEnv("SITE_POSTS_PER_PAGE");
  if (raw === undefined) return 12;

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(
      `SITE_POSTS_PER_PAGE is not a positive whole number of articles: ` +
        `${JSON.stringify(raw)}. Remove it to use the default of 12.`
    );
  }

  return parsed;
})();

/**
 * How many entries one section feed carries.
 *
 * A feed is the RECENT items, not the archive — and until this cap existed
 * `isiFeed` emitted every article a section had, which on the migration target
 * is a 23,906-entry Atom document produced on every build and re-downloaded by
 * every subscriber's reader on every poll. The pagination this constant sits
 * beside bounds the same history for a human; this bounds it for a machine.
 *
 * Deliberately not the same number as `artikelPerHalaman`: a page is a browsing
 * unit and a feed is a polling window, and tying them would mean a site that
 * shows 6 cards per page also forgets everything older than its last 6 posts
 * between two polls.
 */
export const artikelPerFeed = 50;

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
