/**
 * Where a site's identity actually comes from, field by field.
 *
 * ## Why this is one module and not a few `??` in two files
 *
 * Every field below has TWO sources — what awcms's `site_profile` says, and
 * what this template falls back to — and three consumers: the masthead, the
 * footer, and the `Organization`/`WebSite` JSON-LD. Written inline, the same
 * fallback would appear in `BaseLayout.astro` and again in `schema.ts`, and the
 * first time one of them changed, a site would publish a masthead and a
 * structured-data node that disagree about its own name. Crawlers read the
 * second one; readers read the first; nothing fails.
 *
 * So the precedence lives here, once, and both consumers call it.
 *
 * ## The fallbacks are not placeholders
 *
 * They are what every site built from this template runs on today, and a tenant
 * that has not filled its profile in is in a supported state rather than a
 * broken one. That is why nothing here throws and nothing warns: the profile
 * being EMPTY is normal. The profile being unreadable is what warns, and that
 * is decided in `lib/awcms/profil.ts`, at the point where the reason is known.
 */
import { siteConfig } from "../config/site";
import type { Locale } from "../config/site";
import { t } from "./po";
import type { ProfilSitus } from "./awcms/profil";

/**
 * The name in the masthead, in `<title>`, and in `og:site_name`.
 *
 * `siteName` is `seo_distribution`'s field, which is deliberate on awcms's
 * side: it is what crawlers are told the site is called, and a site whose
 * masthead and `og:site_name` disagree is a site with two names.
 */
export function namaSitus(profil: ProfilSitus): string {
  return profil.siteName ?? siteConfig.name;
}

/**
 * The line under the masthead.
 *
 * The PO catalogue is the fallback rather than an empty string, because
 * `header.tagline` is an interface string every locale already carries — a
 * tenant that sets no tagline keeps a translated one instead of losing the
 * line entirely.
 */
export function taglineSitus(profil: ProfilSitus, locale: Locale): string {
  return profil.tagline ?? t(locale, "header.tagline");
}

/**
 * The PUBLISHER — the `Organization` node, which is not always the site name.
 *
 * A newsroom is published by a company, and awcms keeps the two apart for that
 * reason. Falling back to the site name is right when nobody has said
 * otherwise: a publisher named `null` would be worse structured data than a
 * publisher named after its own site.
 */
export function namaPenerbit(profil: ProfilSitus): string {
  return profil.organizationName ?? namaSitus(profil);
}

/**
 * The footer's bottom line, whole.
 *
 * `copyrightNotice` replaces the composed line RATHER than joining it. A
 * newsroom that writes "© 2019–2026 PT Lentera Kalteng" means those words: a
 * composition would print its year twice and its name twice, and there is no
 * way to write a notice that avoids that.
 *
 * Without one, the composed line keeps the behaviour this template already had,
 * including the build-time year — the site is rebuilt at least daily, so it
 * does not fall behind, and a start year would be the reference implementation's
 * rather than this site's.
 */
export function barisCopyright(
  profil: ProfilSitus,
  locale: Locale,
  tahun: number
): string {
  return (
    profil.copyrightNotice ??
    `© ${tahun} ${namaSitus(profil)}. ${t(locale, "footer.copyright")}`
  );
}

/** True when the footer has an editorial address or any way to make contact. */
export function adaKontak(profil: ProfilSitus): boolean {
  return Boolean(
    profil.editorialAddress ??
      profil.contactEmail ??
      profil.contactPhone ??
      profil.whatsappNumber
  );
}

/**
 * A `wa.me` link, or `null`.
 *
 * `wa.me` wants digits only — no `+`, no spaces, no dashes — and an editor
 * writes `+62 812-3456-7890` because that is how a phone number looks. Stripping
 * here rather than asking the editor to type a URL keeps the admin field a
 * PHONE NUMBER, which is what the awcms screen labels it.
 *
 * `null` when nothing is left after stripping: a link to `https://wa.me/` opens
 * WhatsApp's home page, which reads as a broken contact rather than a missing
 * one.
 */
export function tautanWhatsapp(nomor: string | null): string | null {
  if (!nomor) return null;

  const digit = nomor.replace(/\D+/g, "");
  return digit.length > 0 ? `https://wa.me/${digit}` : null;
}

/** A `mailto:`/`tel:` pair is built the same way, and both are trivially safe — the values are plain text awcms validated on write. */
export function tautanTelepon(nomor: string | null): string | null {
  if (!nomor) return null;

  // `tel:` tolerates the human formatting `wa.me` does not, but not spaces.
  const bersih = nomor.replace(/[^\d+]/g, "");
  return bersih.length > 0 ? `tel:${bersih}` : null;
}
