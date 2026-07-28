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
import {
  resolveTenantSelector,
  tenantHeaders,
  type TenantSelector
} from "./tenant";

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

let cachedSelector: TenantSelector | undefined;

function selector(): TenantSelector {
  cachedSelector ??= resolveTenantSelector(envSource());
  return cachedSelector;
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
 * One GET against awcms, unwrapped.
 *
 * Deliberately has no retry loop. A static build is not a request path: if
 * awcms is down, the correct outcome is a failed build that ships nothing, not
 * a slow build that ships a site with some sections silently empty. Partial
 * content is the failure mode worth preventing here — it looks like a
 * successful deploy.
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

  const headers: Record<string, string> = {
    accept: "application/json",
    ...tenantHeaders(selector())
  };

  const token = readEnv("AWCMS_API_TOKEN");
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

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
  const resolved = selector();
  return `${resolved.kind}=${resolved.value} (from ${resolved.source})`;
}
