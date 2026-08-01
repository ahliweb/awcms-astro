/**
 * Which awcms tenant does this site's content come from?
 *
 * ## The token decides — this file only CHECKS
 *
 * It used to be a three-step resolution chain (`AWCMS_TENANT_CODE` →
 * `AWCMS_TENANT_ID` → `AWCMS_DEFAULT_TENANT_CODE`), sent to awcms as an
 * `X-Tenant-Code`/`X-Tenant-Id` header. Both halves of that are now wrong, and
 * awcms ADR-0049 says so explicitly:
 *
 *   - A build credential is a **machine credential**, and its token embeds the
 *     tenant: `awcmsm_<32 hex = tenant uuid without dashes>_<secret>`. awcms
 *     derives the tenant from the token BEFORE any lookup, and if a tenant
 *     header disagrees, the token wins and the header is discarded — it is
 *     unauthenticated input.
 *   - `X-Tenant-Code`/`X-Tenant-Id` were never spellings awcms accepted. The
 *     canonical header is `x-awcms-tenant-id`, and ADR-0049 §4 refuses to add
 *     aliases. Everything this file used to send was therefore ignored on a
 *     good day and a `400 TENANT_REQUIRED` on a bad one.
 *
 * So the chain answers a question nobody asks anymore. What replaces it is not
 * "nothing": the configured tenant is kept as an **assertion**, because the
 * cross-tenant leak the old chain was written to prevent has moved. It is no
 * longer "the build guesses a tenant" — it is **the wrong token pasted into
 * this site's configuration**, and that mistake looks like a perfectly healthy
 * build that publishes another tenant's articles under this domain.
 *
 * A chain cannot catch that. An assertion can: state which tenant this site is
 * supposed to publish, and let the build fail when the token disagrees.
 *
 * ## What this is NOT
 *
 * This is not authorization. awcms enforces row-level security and evaluates
 * the credential's permissions itself; a token that could read another tenant's
 * rows would be an awcms bug, not something this file could cause or prevent.
 * What this file prevents is the honest mistake — a staging token in a
 * production deployment — being invisible.
 */

export type TenantResolution = {
  /** Canonical dashed uuid, taken from the token. */
  tenantId: string;
  /** True when `AWCMS_TENANT_ID` was set and matched — i.e. it was verified. */
  asserted: boolean;
};

export class TenantNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantNotConfiguredError";
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Mirrors awcms `src/lib/auth/machine-credential-token.ts`. Deliberately as
 * strict as the original: a prefix that parses "nearly" is refused here rather
 * than sent, so the failure names the malformed token instead of arriving as an
 * opaque 401 in the middle of a build.
 */
const MACHINE_TOKEN_PATTERN = /^awcmsm_([0-9a-f]{32})_([A-Za-z0-9_-]{43})$/;
const MACHINE_TOKEN_PREFIX = "awcmsm_";

/** `<32 hex>` → canonical dashed uuid. */
function toUuid(hex: string): string {
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join("-");
}

/**
 * The tenant this build will read, plus every check that can be made without a
 * network call.
 *
 * `env` is a parameter rather than a direct `import.meta.env` read so each
 * failure mode is testable without a build — and every branch below is a
 * failure mode somebody will hit exactly once, at the worst moment.
 */
export function resolveTenant(
  env: Record<string, string | undefined>
): TenantResolution {
  const token = env.AWCMS_API_TOKEN?.trim();

  if (!token) {
    throw new TenantNotConfiguredError(
      "AWCMS_API_TOKEN is not set. Since awcms ADR-0049 this single variable " +
        "carries BOTH the credential and the tenant, so a build has nothing to " +
        "read and no tenant to read it for. Issue one with " +
        "POST /api/v1/access/machine-credentials, scoped to " +
        "blog_content.posts.read and nothing else."
    );
  }

  if (!token.startsWith(MACHINE_TOKEN_PREFIX)) {
    throw new TenantNotConfiguredError(
      "AWCMS_API_TOKEN is not a machine credential (it does not start with " +
        `"${MACHINE_TOKEN_PREFIX}"). A build cannot hold a human session ` +
        "token: sessions expire, a password reset revokes every session of " +
        "that identity, and an MFA step-up rotates the token — each of which " +
        "would kill this build at a moment nobody can predict. Issue a machine " +
        "credential with POST /api/v1/access/machine-credentials instead."
    );
  }

  const match = MACHINE_TOKEN_PATTERN.exec(token);

  if (!match?.[1]) {
    throw new TenantNotConfiguredError(
      "AWCMS_API_TOKEN looks like a machine credential but is malformed. The " +
        "shape is awcmsm_<32 hex tenant id>_<43 char secret>; a truncated " +
        "copy-paste is the usual cause. It is never repairable by hand — the " +
        "plaintext is shown once at issuance, so issue a new one."
    );
  }

  const tenantId = toUuid(match[1]);

  refuseRetiredVariables(env);

  const declared = env.AWCMS_TENANT_ID?.trim();

  if (!declared) {
    return { tenantId, asserted: false };
  }

  if (!UUID_PATTERN.test(declared)) {
    throw new TenantNotConfiguredError(
      `AWCMS_TENANT_ID is not a uuid: ${JSON.stringify(declared)}. It is an ` +
        "assertion about which tenant this site publishes, and an assertion " +
        "that cannot be evaluated is worse than none — it reads as a check " +
        "that passed."
    );
  }

  if (declared.toLowerCase() !== tenantId) {
    throw new TenantNotConfiguredError(
      `Tenant mismatch. AWCMS_TENANT_ID declares ${declared.toLowerCase()}, ` +
        `but AWCMS_API_TOKEN belongs to ${tenantId}. The token decides what ` +
        "awcms returns, so this build would publish the token's tenant under " +
        "this site's domain. That is the worst failure a multi-tenant CMS " +
        "has, and it does not look like a failure — the build stays green and " +
        "the site fills up with somebody else's articles. Fix whichever of " +
        "the two is wrong; do not delete the assertion to make this pass."
    );
  }

  return { tenantId, asserted: true };
}

/**
 * The old chain's variables no longer resolve anything.
 *
 * Ignoring them silently is the failure this repo keeps writing rules against:
 * a value that looks like configuration, reads as configuration, and decides
 * nothing. An operator who pins `AWCMS_TENANT_CODE=produksi` and gets a staging
 * token's content has no way to see which of the two was believed.
 */
function refuseRetiredVariables(env: Record<string, string | undefined>): void {
  const retired = ["AWCMS_TENANT_CODE", "AWCMS_DEFAULT_TENANT_CODE"].filter(
    (name) => Boolean(env[name]?.trim())
  );

  if (retired.length === 0) return;

  throw new TenantNotConfiguredError(
    `${retired.join(" and ")} no longer decide anything and are refused ` +
      "rather than ignored: since awcms ADR-0049 the tenant comes from " +
      "AWCMS_API_TOKEN, and awcms never accepted the X-Tenant-Code header " +
      "this repo used to send. Remove them. To keep stating which tenant this " +
      "site publishes — recommended — set AWCMS_TENANT_ID to the tenant's " +
      "uuid instead; the build then verifies it against the token."
  );
}
