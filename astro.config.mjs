import { defineConfig } from "astro/config";
import node from "@astrojs/node";
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
   * The adapter is here to SERVE the build, not to render pages on demand.
   *
   * ADR-0016 replaced the nginx runtime stage with a Bun process, and the file
   * lookup it needs — URL to path, directory index, traversal, symlinks — comes
   * from this adapter rather than from a hand-written static server. `output`
   * above stays `"static"`: every page is still prerendered at build time, no
   * route declares `prerender = false`, and the container still never talks to
   * awcms. What changed is only WHO reads the files off disk.
   *
   * Two consequences worth knowing before touching this line:
   *
   *   - The build output moves. With an adapter, `astro build` writes
   *     `dist/client/` (the site) and `dist/server/` (the entrypoint) instead
   *     of a flat `dist/`. Anything that copies or deploys `dist/` must know
   *     that — see the Dockerfile and docs/deploy-coolify.md.
   *   - Removing the adapter does NOT just undo a config line. The production
   *     image runs `dist/server/penyaji.mjs`, which is built from that
   *     entrypoint; without it the image has nothing to serve.
   *
   * Response headers and caching are NOT set here. They live in
   * `server/penyaji.mjs` and are proven by `tests/penyaji.test.mjs`.
   */
  adapter: node({ mode: "standalone" }),

  /**
   * Astro compresses HTML with JSX whitespace rules by default, which drops
   * spaces between adjacent inline elements. Localised copy is routinely built
   * from several adjacent `t()` fragments, so HTML-style compression is kept.
   */
  compressHTML: true,

  build: {
    /**
     * Never inline a stylesheet into a `<style>` tag.
     *
     * Astro's default (`'auto'`) inlines any stylesheet under ~4 kB. That is a
     * size-dependent behaviour, and it decides whether this site can be served
     * behind a strict CSP: `style-src 'self'` without `'unsafe-inline'` blocks
     * an inline `<style>` exactly as it blocks a `style=""` attribute, and the
     * page loses its layout with nothing failing in the build.
     *
     * Today's output happens to be above the threshold, so it is already
     * external — which is precisely the problem with leaving it to the default:
     * it would silently start inlining the day the CSS got smaller, or the day
     * a component shipped its own small stylesheet. `tests/keluaran-csp.test.mjs`
     * checks the built output; this line is what makes that check pass by
     * construction rather than by luck.
     */
    inlineStylesheets: "never"
  },

  /**
   * Never inline a bundled script into the page either.
   *
   * `build.inlineStylesheets: 'never'` above only covers CSS. Astro applies the
   * SAME size-dependent trick to hoisted `<script>` blocks: a bundled chunk with
   * no imports and no dynamic imports is written straight into the HTML as
   * `<script type="module">…</script>` when it is smaller than Vite's
   * `assetsInlineLimit` (4 kB by default). That is how `ShareButtons.astro` —
   * a component whose source contains no inline script at all — used to ship an
   * inline script on every page.
   *
   * The failure mode is the same one that made the stylesheet rule necessary,
   * only louder: `script-src 'self'` without `'unsafe-inline'` blocks the block
   * outright, the copy-link button stops working, and nothing fails in the
   * build. And it is size-dependent, so a site can be compliant until the day
   * someone deletes three lines from a component.
   *
   * Zero also stops small images and fonts from being emitted as `data:` URIs,
   * which is what keeps `img-src 'self'` and `font-src 'self'` honest — see the
   * policy in `server/penyaji.mjs`.
   */
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  },

  integrations: [
    sitemap({
      /**
       * `feed.xml` keluar dari sitemap dengan alasan yang tidak sama dengan
       * `robots.txt` dan `/404` di sebelahnya, jadi ia layak disebut: sebuah
       * sitemap mendaftarkan HALAMAN, dan feed bukan halaman — ia representasi
       * kedua dari halaman seksi yang sudah terdaftar sendiri. Yang membuatnya
       * berbahaya bila dibiarkan masuk adalah gerbangnya: `audit:konten`
       * melewati setiap `<loc>` berakhiran `.xml` tanpa suara (ia menganggapnya
       * indeks sitemap), sehingga entri feed yang salah akan tak terlihat di
       * satu-satunya tempat yang memeriksa sitemap. Lihat ADR-0035.
       */
      filter: (page) =>
        !page.includes("robots.txt") &&
        !page.includes("/404") &&
        !page.endsWith("/feed.xml"),

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
