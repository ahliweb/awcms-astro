/**
 * Which awcms tenant does this site's content come from?
 *
 * ## Why a resolution CHAIN and not one variable
 *
 * An `awcms-astro` site is a single public site, but the awcms instance behind
 * it is multi-tenant. Every content request therefore has to name a tenant, and
 * "no tenant" is not an answer a build can shrug at — it would produce a site
 * with zero pages that still builds green.
 *
 * So the chain always terminates in something usable, and mirrors the one awcms
 * itself already implements server-side for its own host-resolved public routes
 * (`src/lib/tenant/public-host-tenant-resolver.ts` there):
 *
 *   1. `AWCMS_TENANT_CODE`  — an explicit tenant code. Pin this per environment.
 *   2. `AWCMS_TENANT_ID`    — an explicit tenant UUID, for deployments that key
 *                             on ids rather than codes.
 *   3. `AWCMS_DEFAULT_TENANT_CODE` — the fallback tenant. This is the answer to
 *                             "what if this site names no tenant at all".
 *
 * If none is set the build FAILS, loudly, at the first content fetch. That is
 * deliberate: a default that silently invents a tenant would publish one
 * tenant's content under another tenant's domain, which is the single worst
 * failure mode a multi-tenant CMS has. A missing configuration value is a
 * five-second fix; a cross-tenant content leak discovered by a reader is not.
 *
 * ## What this is NOT
 *
 * This is not authorization. The tenant named here only decides which PUBLIC,
 * PUBLISHED content is fetched. awcms resolves the tenant server-side from the
 * request and enforces row-level security regardless of what this file sends —
 * a build credential that could read another tenant's rows would be an awcms
 * bug, not something this file could cause or prevent.
 */

export type TenantSelector =
  | { kind: "code"; value: string; source: string }
  | { kind: "id"; value: string; source: string };

export class TenantNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantNotConfiguredError";
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Walks the chain above and returns the first configured selector.
 *
 * `env` is a parameter rather than a direct `import.meta.env` read so the
 * chain's ORDER is testable without a build. Order is the whole behaviour here;
 * a chain that resolves correctly only for the values someone happened to try
 * is not a chain.
 */
export function resolveTenantSelector(
  env: Record<string, string | undefined>
): TenantSelector {
  const code = env.AWCMS_TENANT_CODE?.trim();
  if (code) {
    return { kind: "code", value: code, source: "AWCMS_TENANT_CODE" };
  }

  const id = env.AWCMS_TENANT_ID?.trim();
  if (id) {
    // A malformed id falls THROUGH to the default rather than being sent as-is.
    // awcms would reject it, but the failure would arrive as an opaque 400 in
    // the middle of a build rather than as the misconfiguration it is.
    if (UUID_PATTERN.test(id)) {
      return { kind: "id", value: id, source: "AWCMS_TENANT_ID" };
    }
  }

  const fallback = env.AWCMS_DEFAULT_TENANT_CODE?.trim();
  if (fallback) {
    return {
      kind: "code",
      value: fallback,
      source: "AWCMS_DEFAULT_TENANT_CODE"
    };
  }

  throw new TenantNotConfiguredError(
    "No awcms tenant is configured. Set AWCMS_TENANT_CODE (preferred), " +
      "AWCMS_TENANT_ID, or AWCMS_DEFAULT_TENANT_CODE. This build cannot " +
      "guess a tenant: guessing would risk publishing one tenant's content " +
      "under another tenant's domain."
  );
}

/**
 * The request headers that carry the tenant to awcms.
 *
 * `X-Tenant-Code`/`X-Tenant-Id` are hints, not credentials — awcms resolves and
 * enforces the tenant itself. Sending both would let the two disagree, so
 * exactly one is sent.
 */
export function tenantHeaders(selector: TenantSelector): Record<string, string> {
  return selector.kind === "code"
    ? { "X-Tenant-Code": selector.value }
    : { "X-Tenant-Id": selector.value };
}
