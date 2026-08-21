/**
 * Who this site IS, read from awcms at build time (awcms Issue #596, ADR-0102).
 *
 * ## What this replaces
 *
 * Everything a reader uses to tell one site from another — the masthead, the
 * logo, the favicon, the tagline, the copyright line, the editorial address,
 * the contact details, the social profiles, and the `Organization` node every
 * page publishes — could only be set by editing `src/config/site.ts` or the
 * deployment's `.env`. That is the failure awcms Issue #596 names: a second
 * tenant is impossible without a fork, and identity lives in frontend source
 * rather than in the CMS the newsroom actually uses.
 *
 * One endpoint answers all of it. awcms deliberately SPLIT ownership — what
 * crawlers see belongs to `seo_distribution`, what people read belongs to
 * `site_profile` — and then composed the two on the read side precisely so a
 * template like this one never learns the split exists.
 *
 * ## Why a refusal is not a failed build, and a 500 is
 *
 * `src/lib/content.ts` states the rule this repo builds on: partial content is
 * the failure worth preventing, because it looks like a successful deploy. That
 * rule is about CONTENT. Identity is different in one specific way — this
 * template has always had working fallbacks for every field, and they are what
 * every existing site is running on today.
 *
 * So the split is by CAUSE, not by convenience:
 *
 *   - **403** — the build credential does not hold `site_profile.profile.read`.
 *     Real and expected: awcms seeds permissions per tenant at creation, so a
 *     tenant that predates the module is silently missing the grant (awcms's
 *     own permission backfill exists for exactly this). Falling back is right,
 *     and the warning names the permission so the fix is one sentence.
 *   - **404** — this awcms predates the endpoint. Same answer, different
 *     sentence.
 *   - **anything else** — a 500, a timeout, an unreachable host. That is awcms
 *     being broken, not awcms saying no, and building through it would publish
 *     a site that quietly reverted to template defaults. It throws.
 *
 * The distinction matters because the two look identical in a build log and
 * need opposite responses. A blanket `catch` would turn "your CMS is down" into
 * "your site is now called AWCMS Astro".
 *
 * ## Media ids, not URLs
 *
 * awcms returns `logoMediaId`/`faviconMediaId` as IDS, and says why: a URL
 * baked into this payload would be a second path to the bytes that no
 * managed-media enforcement governs. They are resolved here through the same
 * `resolveObjekMedia` an article image goes through — one batch, three ids, one
 * request.
 */
import { AwcmsApiError, awcmsGet } from "./client";
import { resolveObjekMedia, type ObjekMedia } from "./media";

/** One social profile link. `platform` is a free label; `url` is rendered as an `<a href>`. */
export type TautanSosial = { platform: string; url: string };

/** The endpoint's payload, exactly as awcms names it. */
type ProfilTerkomposisi = {
  tagline: string | null;
  copyrightNotice: string | null;
  logoMediaId: string | null;
  faviconMediaId: string | null;
  editorialAddress: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  socialLinks: unknown;
  siteName: string | null;
  organizationName: string | null;
  organizationLogoMediaId: string | null;
  defaultSocialMediaId: string | null;
};

export type ProfilSitus = {
  /**
   * `false` when awcms REFUSED (403) or does not serve the endpoint (404), and
   * every field below is therefore empty.
   *
   * Kept as a field rather than inferred from "everything is null", because a
   * tenant that simply has not filled the profile in is a legitimate state that
   * looks identical — and the two need different sentences in a build log.
   */
  tersedia: boolean;
  tagline: string | null;
  copyrightNotice: string | null;
  logo: ObjekMedia | null;
  favicon: ObjekMedia | null;
  editorialAddress: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  socialLinks: TautanSosial[];
  siteName: string | null;
  organizationName: string | null;
  organizationLogo: ObjekMedia | null;
};

const PROFIL_KOSONG: ProfilSitus = {
  tersedia: false,
  tagline: null,
  copyrightNotice: null,
  logo: null,
  favicon: null,
  editorialAddress: null,
  contactEmail: null,
  contactPhone: null,
  whatsappNumber: null,
  socialLinks: [],
  siteName: null,
  organizationName: null,
  organizationLogo: null
};

/**
 * Social links, re-checked here rather than trusted.
 *
 * awcms REFUSES a non-http(s) URL at write time and says so in its own module
 * header — but a row written before that validator existed is still a row, and
 * these are rendered as `<a href>` on every page of the site. `javascript:` in
 * an href is the one payload where "the server already validated it" is not a
 * good enough reason to skip asking. Anything unrecognised is DROPPED, which
 * matches what awcms's own reader does with the same column.
 */
export function bacaTautanSosial(raw: unknown): TautanSosial[] {
  if (!Array.isArray(raw)) return [];

  const hasil: TautanSosial[] = [];

  for (const entri of raw) {
    if (typeof entri !== "object" || entri === null) continue;

    const { platform, url } = entri as Record<string, unknown>;

    if (typeof platform !== "string" || platform.trim().length === 0) continue;
    if (typeof url !== "string") continue;

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue;

    hasil.push({ platform: platform.trim(), url });
  }

  return hasil;
}

/**
 * True for the two answers that mean "awcms said no", as opposed to "awcms is
 * broken".
 */
function penolakanYangDiharapkan(error: unknown): error is AwcmsApiError {
  return (
    error instanceof AwcmsApiError &&
    (error.status === 403 || error.status === 404)
  );
}

function peringatkan(error: AwcmsApiError): void {
  const sebab =
    error.status === 403
      ? "the build credential does not hold `site_profile.profile.read`. " +
        "Grant it to the machine credential's role in awcms — a tenant created " +
        "before the site_profile module exists is missing the seed."
      : "this awcms does not serve GET /api/v1/site-profile/composed. It " +
        "landed in awcms Issue #616; upgrade the instance to use it.";

  console.warn(
    `[awcms] site identity not read: ${sebab}\n` +
      `        Falling back to SITE_NAME / SITE_MARK / the PO catalogue for ` +
      `every identity field. The site builds and is correct — it just cannot ` +
      `be re-branded from the CMS yet.`
  );
}

let cacheProfil: Promise<ProfilSitus> | undefined;

/**
 * This site's identity, fetched once per build.
 *
 * Memoised for the same reason `content.ts` memoises its feed: every page in
 * every locale renders the masthead and the footer, so without this a
 * six-locale site would ask awcms who it is several hundred times.
 */
export function profilSitus(): Promise<ProfilSitus> {
  cacheProfil ??= ambilProfil();
  return cacheProfil;
}

async function ambilProfil(): Promise<ProfilSitus> {
  let payload: ProfilTerkomposisi;

  try {
    payload = await awcmsGet<ProfilTerkomposisi>(
      "/api/v1/site-profile/composed"
    );
  } catch (error) {
    if (penolakanYangDiharapkan(error)) {
      peringatkan(error);
      return PROFIL_KOSONG;
    }

    throw error;
  }

  // One batch for all three. They overlap on most tenants — a newsroom's logo
  // is usually also its Organization logo — and `resolveObjekMedia` dedupes, so
  // asking for the union costs one request and asking separately would cost
  // three.
  const ids = [
    payload.logoMediaId,
    payload.faviconMediaId,
    payload.organizationLogoMediaId
  ].filter((id): id is string => typeof id === "string" && id !== "");

  const media = ids.length > 0 ? await resolveObjekMedia(ids) : new Map();

  /**
   * An id that does not resolve renders NOTHING rather than a broken `<img>`.
   *
   * Unlike the article feed — where zero-of-N resolving throws, because that
   * means the credential lacks `media_library.media.read` and every article
   * lost its picture at once — a site has at most three of these, and "the
   * operator purged the logo" is a normal thing to have happened. The header
   * degrades to the site name, which is what it looked like before this
   * existed.
   */
  const objek = (id: string | null): ObjekMedia | null =>
    id ? (media.get(id) ?? null) : null;

  return {
    tersedia: true,
    tagline: payload.tagline,
    copyrightNotice: payload.copyrightNotice,
    logo: objek(payload.logoMediaId),
    favicon: objek(payload.faviconMediaId),
    editorialAddress: payload.editorialAddress,
    contactEmail: payload.contactEmail,
    contactPhone: payload.contactPhone,
    whatsappNumber: payload.whatsappNumber,
    socialLinks: bacaTautanSosial(payload.socialLinks),
    siteName: payload.siteName,
    organizationName: payload.organizationName,
    organizationLogo: objek(payload.organizationLogoMediaId)
  };
}

/** Test seam: drops the per-build memoised fetch. */
export function resetProfilCacheForTests(): void {
  cacheProfil = undefined;
}
