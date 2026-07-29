import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

/**
 * `SITE_URL` is the canonical origin and must be absolute. Astro needs it at
 * config time — before `src/config/site.ts` runs — so it is read here directly
 * from the process environment rather than through that module.
 *
 * The localhost default keeps `bun run dev` working out of the box. It is NOT a
 * safe production value: a build that ships with it publishes a sitemap and a
 * set of canonical links pointing at a machine nobody can reach.
 */
const SITE = (process.env.SITE_URL ?? "http://localhost:4321").replace(
  /\/+$/,
  ""
);

const LOCALE_PREFIXES = (process.env.SITE_LOCALES ?? "en")
  .split(",")
  .map((code) => code.trim())
  .filter(Boolean);

/** Strips the locale prefix so the same page in different languages can be matched. */
function neutralPath(url) {
  const pattern = new RegExp(`^/(${LOCALE_PREFIXES.join("|")})(?=/|$)`);
  return new URL(url).pathname.replace(pattern, "").replace(/^\/|\/$/g, "");
}

export default defineConfig({
  site: SITE,

  /**
   * Static output is the whole premise of this template (see
   * `docs/awcms-astro/README.md`): content is fetched from awcms at BUILD time
   * and served as flat files, so a reader never waits on the CMS and the CMS
   * never faces the public internet. Switching this to `server` pulls a
   * runtime, a live database dependency, and the family's whole operational
   * contract back in — make that decision in an ADR, not in a config edit.
   *
   * That ADR now exists, and it did NOT flip this value: ADR-0014 keeps
   * `output: "static"` and reaches on-demand rendering through an adapter plus
   * `export const prerender = false` on the few genuinely personal routes. If
   * you are here to type `"server"`, read
   * `docs/adr/0014-rendering-campuran-dan-bff-portal.md` first — the whole-site
   * variant was considered and rejected there.
   */
  output: "static",

  /**
   * Astro compresses HTML with JSX whitespace rules by default, which drops
   * spaces between adjacent inline elements. Localised copy is routinely built
   * from several adjacent `t()` fragments, so HTML-style compression is kept.
   */
  compressHTML: true,

  integrations: [
    sitemap({
      filter: (page) => !page.includes("robots.txt") && !page.includes("/404"),

      /**
       * Priority states relative importance WITHIN this site — it is not a
       * claim about other sites, and search engines treat it as a weak hint at
       * best. Default-locale pages rank above prefixed ones because translated
       * pages frequently fall back to the source language.
       *
       * `lastmod` is deliberately NOT stamped with the build time. Telling
       * crawlers that every page changed on every deploy is untrue, and they
       * stop believing it. Set it from real content timestamps or leave it off.
       */
      serialize(item) {
        const path = neutralPath(item.url);
        const isPrefixed = new RegExp(
          `^https?://[^/]+/(${LOCALE_PREFIXES.join("|")})(/|$)`
        ).test(item.url);

        if (path === "") item.priority = 1.0;
        else if (path === "sitemap") item.priority = 0.3;
        else if (!path.includes("/")) item.priority = 0.9;
        else item.priority = 0.7;

        if (isPrefixed) {
          item.priority = Math.round((item.priority - 0.2) * 10) / 10;
        }

        item.changefreq = path === "" ? "weekly" : "monthly";
        return item;
      }
    })
  ]
});
