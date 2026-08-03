/**
 * The awcms REST client — the ONLY file in this repo that talks to awcms.
 *
 * Everything above it (`src/lib/content.ts`, then every component) consumes the
 * shapes this file returns and never a URL, an envelope, or a header. That
 * boundary is what makes the content SOURCE swappable: the reference
 * implementation this template came from read markdown off disk, and the render
 * layer did not change when it moved to an API.
 *
 * ## Envelope
 *
 * awcms answers `{ success: true, data, meta? }` or
 * `{ success: false, error: { code, message } }` — always, including errors, so
 * a non-2xx still parses. This unwraps it once, here, and throws a typed error
 * otherwise. No caller should ever see `success`.
 *
 * ## Credentials
 *
 * `AWCMS_API_TOKEN` is a BUILD-TIME, READ-ONLY token. It is used to fetch
 * published content while `astro build` runs and is never emitted into the
 * output — `import.meta.env` values are only inlined when prefixed `PUBLIC_`,
 * and this one deliberately is not. Do not add a `PUBLIC_` alias for it. A
 * token in a static bundle is a token published to every reader.
 */
import { envSource, readEnv } from "../env";
import { resolveTenant, type TenantResolution } from "./tenant";

export class AwcmsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | undefined,
    readonly path: string
  ) {
    super(message);
    this.name = "AwcmsApiError";
  }
}

type Envelope<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: { code: string; message: string } };

let cachedTenant: TenantResolution | undefined;

function tenant(): TenantResolution {
  cachedTenant ??= resolveTenant(envSource());
  return cachedTenant;
}

function baseUrl(): string {
  const raw = readEnv("AWCMS_API_URL");

  if (!raw) {
    throw new AwcmsApiError(
      "AWCMS_API_URL is not set — this site has no content source. " +
        "Point it at the awcms instance's origin, e.g. https://cms.example.com.",
      0,
      "CONFIG_MISSING",
      ""
    );
  }

  return String(raw).replace(/\/+$/, "");
}

/**
 * How long one request may take before the build gives up.
 *
 * Generous on purpose. `view=full` pages carry whole posts including
 * `contentJson`, and a large tenant on a cold database can legitimately take
 * many seconds — a timeout tuned for a healthy request path would turn a slow
 * build into a failed one, which is the opposite of what this file is for.
 *
 * What it exists to catch is not slowness but SILENCE: a connection that is
 * accepted and never answered. Without a deadline that state hangs the build
 * until the CI job's own limit kills it (15 minutes, with a message that names
 * the job rather than awcms) or, on a workstation, forever.
 *
 * Overridable because the right value is a property of the deployment, not of
 * this template — and a site whose awcms sits behind a slow link should raise
 * it rather than discover this constant by hitting it.
 */
const BATAS_WAKTU_BAKU_MS = 30_000;

/**
 * Read per call, not once at module load — the same shape `baseUrl()` already
 * uses. A module-level constant would freeze whatever the environment happened
 * to hold at import time, which is both wrong under `astro dev` and untestable.
 *
 * A malformed value THROWS rather than falling back to the default. A timeout
 * that silently ignores what an operator wrote is a value that reads like
 * configuration and decides nothing — the failure this repo keeps writing rules
 * against.
 */
function batasWaktuMs(): number {
  const raw = readEnv("AWCMS_API_TIMEOUT_MS");
  if (raw === undefined) return BATAS_WAKTU_BAKU_MS;

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new AwcmsApiError(
      `AWCMS_API_TIMEOUT_MS is not a positive number of milliseconds: ` +
        `${JSON.stringify(raw)}. Remove it to use the ${BATAS_WAKTU_BAKU_MS} ms ` +
        `default; do not set it to 0 to mean "no limit" — a build with no ` +
        `deadline hangs forever on an awcms that accepts the connection and ` +
        `never answers.`,
      0,
      "CONFIG_INVALID",
      ""
    );
  }

  return parsed;
}

/**
 * One GET against awcms, unwrapped.
 *
 * Deliberately has no retry loop. A static build is not a request path: if
 * awcms is down, the correct outcome is a failed build that ships nothing, not
 * a slow build that ships a site with some sections silently empty. Partial
 * content is the failure mode worth preventing here — it looks like a
 * successful deploy.
 *
 * It does have a DEADLINE, and the two are not in tension: no-retry decides
 * what happens when awcms answers badly, the deadline decides what happens
 * when it never answers at all. Both end the same way — a failed build that
 * ships nothing.
 */
export async function awcmsGet<T>(
  path: string,
  query: Record<string, string | number | undefined> = {}
): Promise<T> {
  const url = new URL(`${baseUrl()}${path}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  // Resolving the tenant is what validates the token's shape and checks it
  // against `AWCMS_TENANT_ID`. It runs before the first request rather than
  // after a confusing 401, and its result is memoised.
  tenant();

  // No tenant header. awcms derives the tenant from the machine credential and
  // discards any header that disagrees (ADR-0049 §4) — sending one would be a
  // value that looks like it decides something and does not.
  const headers: Record<string, string> = {
    accept: "application/json",
    authorization: `Bearer ${readEnv("AWCMS_API_TOKEN")}`
  };

  const batas = batasWaktuMs();

  let response: Response;
  try {
    response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(batas)
    });
  } catch (cause) {
    if (cause instanceof AwcmsApiError) throw cause;

    // A timeout and a refused connection both land here, and the message has
    // to name which — "fetch failed" in the middle of a build tells nobody
    // whether awcms is down, unreachable, or merely silent.
    const habis = cause instanceof Error && cause.name === "TimeoutError";

    throw new AwcmsApiError(
      habis
        ? `awcms did not answer ${path} within ${batas} ms. The ` +
          `connection was open the whole time, which is why nothing failed ` +
          `until now. Raise AWCMS_API_TIMEOUT_MS if this deployment is ` +
          `legitimately this slow; otherwise awcms is wedged, not slow.`
        : `awcms could not be reached at ${baseUrl()} (${
            cause instanceof Error ? cause.message : String(cause)
          }). Check AWCMS_API_URL and that the instance is up.`,
      0,
      habis ? "TIMEOUT" : "UNREACHABLE",
      path
    );
  }

  let payload: Envelope<T>;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    throw new AwcmsApiError(
      `awcms returned a non-JSON response (HTTP ${response.status}).`,
      response.status,
      undefined,
      path
    );
  }

  if (!response.ok || !payload.success) {
    const error = payload.success ? undefined : payload.error;
    throw new AwcmsApiError(
      error?.message ?? `awcms request failed (HTTP ${response.status}).`,
      response.status,
      error?.code,
      path
    );
  }

  return payload.data;
}

/** Exposed for diagnostics — `bun`/`node` scripts print which tenant a build resolved. */
export function describeTenantResolution(): string {
  const resolved = tenant();
  return resolved.asserted
    ? `${resolved.tenantId} (dari AWCMS_API_TOKEN, cocok dengan AWCMS_TENANT_ID)`
    : `${resolved.tenantId} (dari AWCMS_API_TOKEN, tanpa AWCMS_TENANT_ID untuk verifikasi silang)`;
}
