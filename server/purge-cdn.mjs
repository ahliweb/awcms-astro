#!/usr/bin/env bun
/**
 * purge-cdn.mjs — purge the CDN for this site's hostname after a deploy.
 *
 * ADR-0054: HTML carries `s-maxage`, so a CDN may hold a page for a few minutes.
 * This step is what keeps a rebuild prompt: it runs after the new build is live
 * (the platform's post-deployment command) and asks the CDN to drop what it has
 * for this hostname. The short `s-maxage` is the backstop when it does not run.
 *
 * Usage:
 *   bun server/purge-cdn.mjs               purge, exit 0 even if it fails
 *   bun server/purge-cdn.mjs --dry-run     print the request, send nothing
 *   bun server/purge-cdn.mjs --strict      exit 1 if the purge did not happen
 *
 * Environment (runtime variables, the token marked secret):
 *   CLOUDFLARE_API_TOKEN   token scoped to Cache Purge on ONE zone
 *   CLOUDFLARE_ZONE_ID     the zone's id
 *   CDN_PURGE_HOSTS        comma-separated hostnames to purge; defaults to the
 *                          host of SITE_URL when that is set
 *
 * Deliberate properties:
 *   - Zero dependencies and no imports from `src/`, so it runs from the runtime
 *     image, which carries no `node_modules`.
 *   - The token is never printed, not even in dry-run, and not in an error.
 *   - Purges by HOSTNAME, never the whole zone: other sites sharing the zone are
 *     untouched.
 *   - It talks to the CDN only. It never calls `awcms`.
 */

export const API_BASE_BAWAAN = "https://api.cloudflare.com/client/v4";
const MAKS_PERCOBAAN = 3;
const MAKS_TUNGGU_MS = 30_000;
const MAKS_HOST_PER_PERMINTAAN = 30;

const POLA_ZONA = /^[0-9a-f]{32}$/i;
const POLA_HOST =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/**
 * Reads and validates the configuration. Returns `{ hilang }` (names of missing
 * variables) or `{ salah }` (a value present but unusable), or the configuration.
 *
 * @param {Record<string, string | undefined>} env
 */
export function bacaKonfigurasi(env) {
  const token = (env.CLOUDFLARE_API_TOKEN ?? "").trim();
  const zona = (env.CLOUDFLARE_ZONE_ID ?? "").trim();
  const hilang = [];
  if (!token) hilang.push("CLOUDFLARE_API_TOKEN");
  if (!zona) hilang.push("CLOUDFLARE_ZONE_ID");

  let mentah = (env.CDN_PURGE_HOSTS ?? "").trim();
  if (!mentah && (env.SITE_URL ?? "").trim()) {
    try {
      mentah = new URL(env.SITE_URL.trim()).hostname;
    } catch {
      return { salah: "SITE_URL is not a valid URL" };
    }
  }
  if (!mentah) hilang.push("CDN_PURGE_HOSTS (or SITE_URL)");

  if (hilang.length > 0) return { hilang };

  if (!POLA_ZONA.test(zona)) {
    return { salah: "CLOUDFLARE_ZONE_ID is not a 32-character hex id" };
  }

  const hosts = [
    ...new Set(
      mentah
        .split(",")
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean)
    )
  ];
  const buruk = hosts.filter((h) => !POLA_HOST.test(h));
  if (buruk.length > 0) {
    return {
      salah: `CDN_PURGE_HOSTS has an invalid hostname: ${buruk.join(", ")} (hostnames only, no scheme or path)`
    };
  }
  if (hosts.length > MAKS_HOST_PER_PERMINTAAN) {
    return { salah: `CDN_PURGE_HOSTS has more than ${MAKS_HOST_PER_PERMINTAAN} hostnames` };
  }

  return { token, zona, hosts };
}

/** @param {string[]} hosts */
export function badanPurge(hosts) {
  return { hosts };
}

/** @param {string} base @param {string} zona */
export function urlPurge(base, zona) {
  return `${base.replace(/\/+$/, "")}/zones/${zona}/purge_cache`;
}

/** Seconds from a `Retry-After` header, capped; `undefined` if unusable. */
function tungguDariHeader(nilai) {
  if (!nilai) return undefined;
  const detik = Number(nilai);
  if (!Number.isFinite(detik) || detik < 0) return undefined;
  return Math.min(detik * 1000, MAKS_TUNGGU_MS);
}

/** Cloudflare's own error messages, without ever echoing a credential. */
function pesanGalat(json, status) {
  const daftar = Array.isArray(json?.errors) ? json.errors : [];
  const teks = daftar
    .map((e) => `${e?.code ?? "?"}: ${String(e?.message ?? "").slice(0, 200)}`)
    .join("; ");
  return teks || `HTTP ${status}`;
}

/**
 * @param {object} opsi
 * @param {Record<string, string | undefined>} opsi.env
 * @param {boolean} [opsi.dryRun]
 * @param {typeof fetch} [opsi.fetchFn]
 * @param {(ms: number) => Promise<void>} [opsi.tidur]
 * @param {{ info: Function, warn: Function, error: Function }} [opsi.log]
 * @param {string} [opsi.base]
 * @returns {Promise<{ status: "purged" | "dry-run" | "skipped" | "failed", detail?: string }>}
 */
export async function purgeCdn({
  env,
  dryRun = false,
  fetchFn = fetch,
  tidur = (ms) => new Promise((r) => setTimeout(r, ms)),
  log = console,
  base = API_BASE_BAWAAN
}) {
  const konfig = bacaKonfigurasi(env);

  if ("hilang" in konfig) {
    log.warn(
      `[purge-cdn] skipped: ${konfig.hilang.join(", ")} not set. ` +
        "The CDN keeps its copy until HTML's s-maxage runs out (ADR-0054)."
    );
    return { status: "skipped", detail: konfig.hilang.join(", ") };
  }
  if ("salah" in konfig) {
    log.error(`[purge-cdn] not purged: ${konfig.salah}`);
    return { status: "failed", detail: konfig.salah };
  }

  const url = urlPurge(base, konfig.zona);
  const badan = JSON.stringify(badanPurge(konfig.hosts));

  if (dryRun) {
    log.info(`[purge-cdn] dry-run: POST ${url}`);
    log.info(`[purge-cdn] dry-run: body ${badan}`);
    log.info("[purge-cdn] dry-run: nothing was sent");
    return { status: "dry-run" };
  }

  let terakhir = "";
  for (let percobaan = 1; percobaan <= MAKS_PERCOBAAN; percobaan++) {
    let tunggu;
    try {
      const res = await fetchFn(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${konfig.token}`,
          "Content-Type": "application/json"
        },
        body: badan
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success !== false) {
        log.info(`[purge-cdn] purged: ${konfig.hosts.join(", ")}`);
        return { status: "purged" };
      }

      terakhir = pesanGalat(json, res.status);

      if (res.status === 429) {
        tunggu =
          tungguDariHeader(res.headers.get("retry-after")) ?? 2000 * 2 ** (percobaan - 1);
      } else if (res.status >= 500) {
        tunggu = 1000 * 2 ** (percobaan - 1);
      } else {
        // A bad token, wrong zone, or missing permission cannot be fixed by
        // asking again.
        log.error(`[purge-cdn] not purged: ${terakhir}`);
        return { status: "failed", detail: terakhir };
      }
    } catch (galat) {
      terakhir = `network error: ${galat?.name ?? "Error"}`;
      tunggu = 1000 * 2 ** (percobaan - 1);
    }

    if (percobaan < MAKS_PERCOBAAN) {
      log.warn(
        `[purge-cdn] attempt ${percobaan} failed (${terakhir}); retrying in ${Math.round(tunggu / 1000)}s`
      );
      await tidur(tunggu);
    }
  }

  log.error(`[purge-cdn] not purged after ${MAKS_PERCOBAAN} attempts: ${terakhir}`);
  return { status: "failed", detail: terakhir };
}

if (import.meta.main) {
  const args = new Set(process.argv.slice(2));
  const hasil = await purgeCdn({ env: process.env, dryRun: args.has("--dry-run") });
  const gagal = hasil.status === "failed" || hasil.status === "skipped";
  process.exit(args.has("--strict") && gagal ? 1 : 0);
}
