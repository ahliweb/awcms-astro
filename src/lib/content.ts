/**
 * The content adapter — the seam between awcms and every component.
 *
 * `LocalizedArticle` and `getArticles()` are the CONTRACT. They are unchanged
 * from the markdown-backed reference implementation this template was extracted
 * from: components receive data through props and never fetch it themselves, so
 * swapping the source touched this file and nothing else. Keep it that way.
 *
 * ## The four rules this adapter must not break
 *
 * These are not implementation preferences. Each one exists because breaking it
 * produces a specific, reader-visible defect:
 *
 * 1. **The slug set is decided by the default locale.** Every article whose
 *    `locale` is `defaultLocale` and whose status is `published` defines the
 *    page set; other locales are matched onto it through `translationGroupId`.
 *    Querying per locale instead would give each language a different page
 *    count and bring back cross-language 404s.
 * 2. **`isFallback` is computed here, never in a component.** A component that
 *    decided this itself would decide it differently on the next page.
 * 3. **Order comes from an explicit order field, never from the order the API
 *    happened to return.** A database's natural order is not stable. Which
 *    field is explicit is a property of the SECTION, not of this file: a guide
 *    section orders by the editor's `urutan`, a news section orders by
 *    `publishedAt` descending. Both are named fields read from the SOURCE post,
 *    and both carry a tiebreaker — see `urutkanArtikel` below, and ADR-0033.
 * 4. **Only a post that awcms itself would serve publicly is ever built.**
 *    `status === 'published'`, `visibility === 'public'`, and a `publishedAt`
 *    that exists. Drafts and scheduled posts must not leak into a static
 *    output, where they would stay published until the next build regardless
 *    of what the CMS later says.
 *
 * ## How it reads awcms
 *
 * One traversal: `GET /api/v1/blog/posts?view=full&order=created_at`, followed
 * page by page through `nextCursor` until it is null. That endpoint is awcms's
 * admin list; `view=full` is the build feed mode, and it returns whole posts
 * rather than the summaries the default returns.
 *
 * It used to take two round trips per post — walk the list, then fetch each
 * post again by id — because the list carried no `contentJson`. That was N+1
 * requests per build against an admin endpoint on every publish, and it is gone
 * now that awcms ships the feed. ADR-0018 records the decision and what it
 * replaced.
 *
 * ## The gate that stays
 *
 * Rule 1 pairs locales through `translationGroupId`, which awcms now returns.
 * `assertTranslationsArePairable` below still refuses to build a site whose
 * translations cannot be paired — it asserts over the DATA, not over an awcms
 * version, so it passes silently when the field is there and fails loudly if a
 * deployment ever serves posts without it. Publishing every language in the
 * source language with a "not translated" notice is dropping content, not
 * degrading gracefully.
 */
import { awcmsGet } from "./awcms/client";
import { resolveObjekMedia, type ObjekMedia } from "./awcms/media";
import { resetTaksonomiCacheForTests, termMenurutId } from "./awcms/taksonomi";
import { renderContentBlocks } from "./content-blocks";
import {
  idGaleriPortableText,
  renderPortableText,
  type PortableTextDocument
} from "./portable-text";
import {
  defaultLocale,
  locales,
  siteConfig,
  tabs,
  urutanSeksiTab,
  type Locale,
  type TabSlug,
  type UrutanSeksi
} from "../config/site";

/**
 * What `GET /api/v1/blog/posts` returns for each row — a SUMMARY, and nothing
 * more. This list is `BlogPostSummary` on the awcms side: no `contentJson`, no
 * `excerpt`, no `metaDescription`, no `canonicalUrl`, no `translationGroupId`.
 *
 * That is the whole reason this adapter fetches twice. An earlier version of
 * this file declared the FULL post shape here and read `contentJson` straight
 * off the list, which produced a build that succeeded and published a site
 * where every article body was empty and every section was empty too — the
 * section an article belongs to is read from `contentJson`, so with that field
 * missing, no article matched any tab. Nothing failed anywhere.
 */
type AwcmsBlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  visibility: "public" | "private" | "unlisted";
  locale: string;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

/**
 * What `GET /api/v1/blog/posts/{id}` returns.
 *
 * `translationGroupId` is declared OPTIONAL on purpose: awcms accepts it on
 * write but no read endpoint returns it today. Declaring it required would make
 * the type say something the API does not, and the code below would read
 * `undefined` while the type promised a value. The gate in
 * `assertTranslationsArePairable` is what turns that gap into a failed build
 * instead of a site that quietly shows every language in the source language.
 */
type AwcmsBlogPost = AwcmsBlogPostSummary & {
  excerpt: string | null;
  contentJson?: Record<string, unknown>;
  contentText?: string;
  metaDescription: string | null;
  canonicalUrl: string | null;
  translationGroupId?: string | null;
  /**
   * Id of the article's featured image, resolved to a URL in one batch below.
   *
   * OPTIONAL for the same reason `translationGroupId` is: it rides on the full
   * row, and a summary response has none. Declaring it required would make the
   * type promise something a summary cannot deliver — and this file has already
   * shipped one defect of exactly that shape (ADR-0018).
   */
  featuredMediaId?: string | null;
  /**
   * Explicit "use this image for the social/SEO preview" override.
   *
   * awcms declares it as taking **priority over `featuredMediaId`**, and its own
   * `seo-facts-port-adapter.ts` resolves exactly `seo_image_media_id ??
   * featured_media_id`. That precedence is mirrored here rather than reinvented:
   * a site whose share card disagreed with the CMS's own SEO surface would be
   * two answers to one question, and only one of them visible to the editor.
   */
  seoImageMediaId?: string | null;
  /**
   * The post's category/tag/channel/topic assignments, as awcms ids.
   *
   * OPTIONAL for the same reason the two above are: it rides on the full row
   * and a summary response has none. It is also the field an older awcms omits
   * entirely — it only joined `?view=full` in awcms Issue #649 — so the archive
   * pages built from it simply do not exist against an instance that predates
   * that, rather than the build failing.
   */
  termIds?: string[];
  /**
   * The CANONICAL article body since `awcms` v10.0.0 (its ADR-0100).
   *
   * OPTIONAL for the same reason `termIds` is — it rides on the full row, a
   * summary response has none, and an awcms predating ADR-0100 omits it
   * entirely. An EMPTY array is a different thing from an absent field and both
   * occur: absent means "this awcms has no such column", empty means "this row
   * has not been backfilled yet". `renderBodyHtml` treats them the same on
   * purpose, because in both cases the words are in `contentJson.blocks`.
   */
  bodyPortableText?: PortableTextDocument;
  /**
   * The author's OPT-IN public byline, or `null` — awcms ADR-0109.
   *
   * `null` is the NORMAL state and is not a missing value: it means the article
   * keeps the organisation-level attribution, which is what every article
   * published before that ADR has and what every author who never opted in
   * keeps. So the absence of a name here is a decision, and a consumer that
   * substituted something for it would be publishing a person's name against
   * their choice.
   *
   * It is deliberately NOT the author's account display name. awcms refused to
   * publish that field (its Issue #649, then ADR-0109): an internal account
   * name becoming public the moment somebody presses Publish is a PII surface
   * nobody opted into, and in a newsroom the byline is frequently not the
   * account name anyway.
   *
   * OPTIONAL for the same reason `termIds` is — it rides on the full row, a
   * summary response has none, and an awcms that predates ADR-0109 simply omits
   * it. That instance builds a site with no individual bylines rather than a
   * build that fails.
   */
  authorByline?: string | null;
};

/**
 * The structured, namespaced payload an `awcms-astro` site stores inside
 * `contentJson`. awcms validates the envelope, not this — see
 * `docs/awcms-astro/integrasi-awcms.md` on why `schemaVersion` is load-bearing
 * rather than decorative.
 */
export type AwcmsAstroBlock = {
  schemaVersion: number;
  urutan?: number;
  kategori?: string;
  syaratDokumen?: string[];
  langkah?: string[];
  biaya?: { item: string; nominal: string; jenis: string; sumber: string }[];
  dasarHukum?: string[];
  faq?: { q: string; a: string }[];
  estimasiWaktu?: string;
  reviewDueDate?: string;
};

/**
 * The shape every component consumes. Identical to the markdown-backed original.
 *
 * The list-shaped fields are NOT optional here even though they are optional in
 * `AwcmsAstroBlock`: `toArticle()` defaults every one of them to `[]`, so a
 * component never has to ask whether a list exists before mapping it. Declaring
 * them optional anyway would push a `?? []` into every call site — and the one
 * that forgets it is a build error in a component rather than a defaulted value
 * in the adapter, which is the wrong place for that decision to live.
 */
export interface LocalizedArticle {
  slug: string;
  entry: {
    id: string;
    data: {
      title: string;
      description: string;
      /**
       * When this post was PUBLISHED, and never a stand-in for anything else.
       *
       * It is non-optional because the adapter refuses to build a post without
       * it (see `fetchPublishedPosts`), which is what lets every reader take it
       * as a `Date` rather than checking for `null` at each call site.
       *
       * `publishedDate` and `updatedDate` are read from the SAME awcms row —
       * the one whose words this page shows. Reading one from the source post
       * and the other from its translation would pair two rows that have no
       * ordering relationship at all: a source article published in August
       * whose Indonesian translation was last edited in July would claim
       * `dateModified` BEFORE `datePublished`, which crawlers discard. awcms
       * reads both from one row for the same reason.
       */
      publishedDate: Date;
      /**
       * When this post was last WRITTEN TO in awcms — every write, including a
       * pure status transition, moves it.
       *
       * It used to be `publishedAt ?? updatedAt` under this same name, which
       * meant the article page's "Diperbarui" line and the JSON-LD's
       * `dateModified` both showed the PUBLISH date and no page ever reported
       * a correction. Splitting the two is ADR-0033.
       */
      updatedDate: Date;
      urutan: number;
      kategori: string;
      canonicalUrl?: string;
    } & Required<
      Pick<
        AwcmsAstroBlock,
        "syaratDokumen" | "langkah" | "biaya" | "dasarHukum" | "faq"
      >
    > &
      Pick<AwcmsAstroBlock, "estimasiWaktu" | "reviewDueDate">;
    bodyHtml: string;
  };
  /** True when this locale has no translation and the default-locale article is shown. */
  isFallback: boolean;
  /**
   * The awcms term ids this article is filed under, read from the SOURCE post.
   *
   * Not optional, and never `undefined`: `toArticle` defaults it to `[]` for
   * the same reason the list-shaped `entry.data` fields are defaulted — a
   * component must not have to ask whether the field exists before mapping it,
   * and "this article has no categories" is a state, not a missing value.
   *
   * From the SOURCE for the same reason `urutan` and `kategori` are (see
   * `toArticle`): a translator who leaves the classification blank on their row
   * would otherwise drop that article out of every archive in their language
   * alone — every page still there, the archives quietly shorter, and nothing
   * failing anywhere.
   */
  termIds: string[];
  /**
   * The byline this article is published under, when its author opted into one
   * (awcms ADR-0109). `undefined` means organisation-level attribution.
   *
   * Read from the TRANSLATED post rather than from the source, unlike
   * `termIds`/`urutan`/`kategori` above — and the difference is not an
   * inconsistency. Those three are CLASSIFICATION, which must be identical
   * across a translation group or an article drops out of one language's
   * archives alone. A byline is authorship of the words on this page: a
   * translated article is frequently written by somebody else, and taking the
   * source author's name for it would credit a person for text they did not
   * write. `publishedDate`, `updatedDate` and `gambar` are read from the same
   * row for the same reason.
   *
   * `undefined` rather than `null` so a component can test it with `&&` like
   * every other optional field here; `toArticle` folds awcms's `null` into it,
   * because "no byline" and "field absent" mean the same thing to a renderer
   * and two spellings of one state is how one of them ends up unhandled.
   */
  authorByline?: string;
  /**
   * The article's image, resolved from awcms media ONCE PER BUILD.
   *
   * It lands here rather than in `article-images.ts` because that module is
   * synchronous and components must never fetch (`AGENTS.md`). Resolving it
   * there would mean either an async component or one HTTP request per rendered
   * card — for a site with 300 articles across two locales, hundreds of
   * requests for data a single batch already holds.
   *
   * `undefined` is a supported state and stays common: an article with no
   * featured image, a deployment that serves no public media, or an id that no
   * longer resolves. The caller falls back to local art (ADR-0024) and then to
   * the styled placeholder.
   */
  gambar?: {
    src: string;
    alt: string;
    width: number | null;
    height: number | null;
  };
  /**
   * The article's own share card, when awcms has one for it.
   *
   * It carries its OWN `type`/`width`/`height` and that is the whole point.
   * `SITE_SOCIAL_IMAGE` is declared to every crawler as `image/png` at
   * 1200×630 — a contract with whoever set it (`.env.example` says so). A media
   * object is whatever the editor uploaded: WebP at 1600×900, most likely.
   * Reusing the site card's constants for it would publish three claims that
   * are false on every article page, and a scraper that trusts them either
   * letterboxes the card or drops it.
   */
  kartuShare?: {
    src: string;
    alt: string;
    type: string;
    width: number | null;
    height: number | null;
  };
}

/**
 * awcms bounds `view=full` at 50 rows per page (`MAX_FULL_LIST_LIMIT`) because
 * those rows carry `contentJson`. Asking for more is silently bounded there, so
 * the number is stated here rather than discovered.
 */
const PAGE_SIZE = 50;

/**
 * A runaway-loop backstop, not a content limit — and a number that is MEASURED
 * rather than assumed.
 *
 * ## Why it moved
 *
 * This was 400, with a comment saying it sat "far above any plausible site
 * (20 000 posts)". That number was a guess, and on 26 August 2026 it stopped
 * being true: `awcms` measured this family's own reference archive and got
 * **25 029 articles** (its ADR-0114, which also records that 23 906 was quoted
 * for weeks before anyone counted). The backstop was therefore BELOW a corpus
 * the family had already measured, and its failure — honest, because it throws
 * rather than truncating — fired on a site that was merely large.
 *
 * Raising the constant on its own would repeat the same mistake one level up.
 * `bun run ukur:skala` is how the number is obtained now, and here is what it
 * reported on this hardware:
 *
 *     artikel   halaman   traversal   +render   heap korpus   RSS puncak
 *       1 000        20        8 ms     27 ms       0.0 MiB      52 MiB
 *       5 000       100       25 ms     68 ms      24.2 MiB     127 MiB
 *      25 000       500      102 ms    355 ms     170.0 MiB     605 MiB
 *
 * ## What the measurement actually says
 *
 * **Time is not the constraint.** The whole adapter costs under half a second
 * for 25 000 articles; a build that size is dominated by the 500 sequential
 * HTTP requests and by Astro writing one file per page per locale, neither of
 * which is this loop.
 *
 * **Memory is the constraint, and it is linear.** Every row holds its canonical
 * body AND the derived projection at once, because that is what awcms sends. At
 * the measured slope, 60 000 articles is roughly 1.5 GiB of peak RSS — real,
 * survivable on a CI runner, and close enough to the edge that going further
 * should be a decision somebody takes with numbers in hand rather than by
 * editing a constant.
 *
 * So: **1 200 pages, 60 000 posts.** That is 2.4× the largest corpus this
 * family has measured. Anyone who needs more should re-run the harness on the
 * hardware that will do the build, and change this comment along with the
 * number — a ceiling whose justification is stale is the state this file was
 * just in.
 */
const MAX_PAGES = 1200;

/**
 * Test seam over the two numbers above.
 *
 * Exported rather than re-declared in the suite: a test that writes `25029 <
 * 60000` proves only that somebody typed two numbers, and would stay green on
 * the day the constant moved back down.
 */
export const MAX_PAGES_UNTUK_UJI = MAX_PAGES;
export const PAGE_SIZE_UNTUK_UJI = PAGE_SIZE;

/**
 * A post this build is willing to publish: everything `AwcmsBlogPost` carries,
 * plus the guarantee that `publishedAt` is a real timestamp.
 *
 * The narrowing has to live in a TYPE rather than in a comment, and the cache
 * below has to carry the narrowed type, because an explicit
 * `Promise<AwcmsBlogPost[]>` annotation would widen `publishedAt` straight back
 * to `string | null` for every caller downstream. That matters more than it
 * looks: the obvious way to silence the resulting error is `publishedAt!` or
 * `as string`, and **`new Date(null)` is not an Invalid Date — it is
 * 1970-01-01T00:00:00.000Z**. It serialises fine, it compares fine, and it
 * publishes every affected article dated 1 January 1970 while sinking it to the
 * bottom of any newest-first section, with every gate green.
 */
type PostTerbit = AwcmsBlogPost & { publishedAt: string };

/**
 * How far a `publishedAt` may sit in the builder's future and still be built.
 *
 * The normal content path is publish → webhook → build, seconds apart
 * (`.github/workflows/rebuild.yml`), and the two timestamps being compared come
 * from two different machines: awcms stamps `published_at` from the DATABASE
 * clock, this comparison runs on the BUILDER clock. Without slack, a builder
 * whose clock trails by a minute silently drops the article that was just
 * published — and because Rule 1 makes the default-locale post the source of
 * the page set, it drops it in every locale at once. In a newest-first section
 * that article is the FIRST card.
 *
 * The check is still worth having as defence in depth against a `published_at`
 * set outside awcms's own write path, but what it is defending against is a
 * post dated days or weeks ahead, never one dated ninety seconds ahead. Fifteen
 * minutes is far above any plausible NTP drift and far below any plausible
 * editorial embargo.
 */
const TOLERANSI_CONDONG_JAM_MS = 15 * 60 * 1000;

let postsCache: Promise<PostTerbit[]> | undefined;
let mediaCache: Promise<Map<string, ObjekMedia>> | undefined;

/**
 * Every featured image referenced by the feed, resolved in one batch per build.
 *
 * ## Why one id failing and ALL ids failing are treated differently
 *
 * A `featuredMediaId` that does not resolve has two very different causes, and
 * collapsing them would hide the one that matters:
 *
 *   - **One id missing** is an operator action. awcms lets an object be purged
 *     and decided, in its own ADR-0056 §B, that references to it go inert
 *     rather than blocking the purge. Failing the build here would put this
 *     repo in the position of vetoing that decision — a site that cannot
 *     publish because someone deleted one picture. It renders the placeholder.
 *   - **Every id missing** is not an operator action. It is a build credential
 *     without `media_library.media.read`, an awcms too old to serve the
 *     endpoint, or a deployment whose media is not configured at all. All three
 *     publish a site where EVERY article lost its image at once, and none of
 *     them fail anything — the exact shape of the ADR-0018 defect this file was
 *     rewritten to end.
 *
 * So: zero resolved out of N requested throws; anything else proceeds.
 */
/**
 * Every `mediaObjectId` a post's gallery blocks reference.
 *
 * Deliberately tolerant of shape: `contentJson` arrives from jsonb and a body
 * written before a validator was tightened must not throw inside a build. Any
 * node that is not what it claims contributes nothing, exactly as the renderer
 * treats it.
 */
function idGaleri(contentJson: Record<string, unknown> | undefined): string[] {
  const blocks = contentJson?.blocks;
  if (!Array.isArray(blocks)) return [];

  const ids: string[] = [];

  for (const block of blocks) {
    if (typeof block !== "object" || block === null) continue;

    const { type, items } = block as { type?: unknown; items?: unknown };
    if (type !== "gallery" || !Array.isArray(items)) continue;

    for (const item of items) {
      if (typeof item !== "object" || item === null) continue;
      const { mediaObjectId } = item as { mediaObjectId?: unknown };
      if (typeof mediaObjectId === "string" && mediaObjectId !== "") {
        ids.push(mediaObjectId);
      }
    }
  }

  return ids;
}

async function fetchMedia(
  posts: AwcmsBlogPost[]
): Promise<Map<string, ObjekMedia>> {
  const ids = [
    ...new Set(
      posts
        // Both ids, one batch. They overlap on most posts (an article with only
        // a featured image uses it for both surfaces), and `resolveObjekMedia`
        // dedupes — so asking for the union costs nothing and asking twice
        // would double the round trips for no answer that differs.
        // Gallery ids join the SAME batch (Issue #597 item 7). Before this,
        // every gallery an editor placed rendered as a row of grey
        // placeholders on a site whose article images worked — because
        // `content-blocks.ts` said resolving an id "needs a media endpoint this
        // site does not call", a sentence that stopped being true when
        // `awcms/media.ts` landed and that nothing re-read.
        .flatMap((post) => [
          post.featuredMediaId,
          post.seoImageMediaId,
          ...idGaleri(post.contentJson),
          // The canonical body carries its OWN gallery nodes. Collecting only
          // from the projection would resolve every gallery an un-backfilled
          // row has and none that a backfilled one has — a site whose galleries
          // work until the day its content is migrated.
          ...idGaleriPortableText(post.bodyPortableText)
        ])
        .filter((id): id is string => typeof id === "string" && id !== "")
    )
  ];

  if (ids.length === 0) return new Map();

  const resolved = await resolveObjekMedia(ids);

  if (resolved.size === 0) {
    throw new Error(
      `awcms resolved NONE of the ${ids.length} featured images this feed ` +
        `references. One missing image is an operator having purged it; all of ` +
        `them missing is not — it is a build token without ` +
        `media_library.media.read, an awcms that predates ` +
        `GET /api/v1/media/objects, or media that is not configured on this ` +
        `deployment. Building anyway would publish every article with its ` +
        `image silently replaced by a placeholder.`
    );
  }

  return resolved;
}

/**
 * Every published post, in full, fetched once per build.
 *
 * Astro calls `getStaticPaths` for every route, so without memoisation a
 * six-locale, three-tab site would repeat this whole traversal dozens of times.
 */
async function fetchPublishedPosts(): Promise<PostTerbit[]> {
  postsCache ??= (async () => {
    const posts = await listPublishedPosts();

    // Rule 4, enforced here rather than trusted from the query: a `status`
    // filter is a request, and this is the last place that can tell the
    // difference between "the API honoured it" and "the API ignored it".
    //
    // `visibility === "public"` is deliberately STRICTER than awcms's own
    // detail route, which also serves `unlisted` so a direct link keeps
    // working. A static build has no direct-link-only state: everything it
    // emits is in the sitemap and crawlable, so an unlisted post published
    // here would stop being unlisted.
    const terlihat = posts.filter(
      (post) => post.status === "published" && post.visibility === "public"
    );

    // The same floor the publish-date filter gets below, for the same reason
    // and one step earlier. A feed that answers with rows but none of them
    // `published`/`public` is a `status` parameter that awcms ignored or a
    // tenant whose posts are all drafts — both publish an empty site, and
    // without this the two assertions underneath would then pass vacuously.
    if (terlihat.length === 0 && posts.length > 0) {
      throw new Error(
        `awcms returned ${posts.length} post(s) and NOT ONE of them is both ` +
          `published and public. Either the status filter was ignored, or ` +
          `this tenant has nothing published yet. Building anyway would ` +
          `publish a site whose every section is empty.`
      );
    }

    // These two run BEFORE the publish-date filter, over the wider set, and
    // that ordering is load-bearing. Both assertions pass vacuously on an empty
    // array — so running them after a filter that can empty the list would turn
    // "awcms answered with summaries" into "nothing to check", silently.
    assertFeedReturnedFullRows(terlihat);
    assertTranslationsArePairable(terlihat);

    const terbit = terlihat.filter(sudahTerbit);

    // A filter that can only ever REMOVE needs a floor, for the same reason
    // `fetchMedia` has one: one post held back is an editorial state, all of
    // them held back is not. Zero survivors out of a non-empty published set is
    // an awcms that does not stamp `published_at`, a clock that is wrong by
    // more than the tolerance above, or a feed shape that changed — and all
    // three publish a site with every section empty, with nothing failing.
    if (terbit.length === 0 && terlihat.length > 0) {
      throw new Error(
        `awcms returned ${terlihat.length} published, public post(s) and NOT ` +
          `ONE of them carries a usable publishedAt. One post held back is an ` +
          `editorial state and builds fine; all of them held back is not — it ` +
          `is an awcms that never stamps published_at, a builder clock wrong ` +
          `by more than ${TOLERANSI_CONDONG_JAM_MS} ms, or a feed whose shape ` +
          `changed. Building anyway would publish a site whose every section ` +
          `is empty, with nothing failing anywhere.`
      );
    }

    return terbit;
  })();

  return postsCache;
}

/**
 * Whether awcms would serve this post publicly today — the `published_at` half
 * of its own public predicate (`published_at IS NOT NULL AND published_at <=
 * now()`, `public-blog-directory.ts`), mirrored here so a static site and
 * awcms's own public `/blog/{tenantCode}/**` routes never disagree about what is
 * live.
 *
 * An UNPARSEABLE date throws instead of returning `false`. The difference
 * matters: `false` means "not published yet", which is a normal state that
 * silently drops one article, while a `publishedAt` that is not a date at all
 * means the response shape changed underneath this adapter. `Date.parse`
 * returns `NaN` for those, and every comparison against `NaN` is `false` — so
 * without this branch a feed that started sending, say, epoch seconds would
 * drop EVERY article and read as "nothing published yet".
 */
function sudahTerbit(post: AwcmsBlogPost): post is PostTerbit {
  if (post.publishedAt === null || post.publishedAt === undefined) return false;

  const stempel = Date.parse(post.publishedAt);

  if (Number.isNaN(stempel)) {
    throw new Error(
      `awcms sent publishedAt=${JSON.stringify(post.publishedAt)} for post ` +
        `"${post.slug}" (${post.locale}), which is not a date this build can ` +
        `parse. That is a changed response shape, not an unpublished post — ` +
        `treating it as "not published yet" would drop every article at once ` +
        `and read as an empty CMS.`
    );
  }

  return stempel <= Date.now() + TOLERANSI_CONDONG_JAM_MS;
}

/**
 * Walks the whole build feed with a keyset cursor.
 *
 * Two query parameters carry the weight here, and both are refusals on the
 * awcms side rather than preferences on this one:
 *
 *   - `view=full` asks for whole posts. Without it the list returns SUMMARIES,
 *     and this adapter would read `contentJson` as `undefined` — a site that
 *     builds green with every article body empty and, because the section an
 *     article belongs to also lives in `contentJson`, every section empty too.
 *     That is not hypothetical: it is what this file did until awcms shipped
 *     this parameter.
 *   - `order=created_at` is the only ordering awcms will paginate over, and
 *     `view=full` requires it. The default `updated_at` moves whenever a post
 *     is edited, so a row can cross a page boundary between two requests and be
 *     skipped or returned twice — surfacing months later as "a few articles are
 *     missing", with nothing able to detect it.
 */
async function listPublishedPosts(): Promise<AwcmsBlogPost[]> {
  const posts: AwcmsBlogPost[] = [];
  let cursor: string | undefined;

  for (let page = 1; ; page += 1) {
    const response = await awcmsGet<{
      posts: AwcmsBlogPost[];
      nextCursor: string | null;
    }>("/api/v1/blog/posts", {
      status: "published",
      order: "created_at",
      view: "full",
      limit: PAGE_SIZE,
      cursor
    });

    posts.push(...response.posts);

    if (!response.nextCursor) return posts;

    if (page >= MAX_PAGES) {
      throw new Error(
        `Stopped after ${MAX_PAGES} pages (${posts.length} posts) and awcms ` +
          `still returned a cursor.\n\n` +
          `This backstop is set at ${MAX_PAGES * PAGE_SIZE} posts, measured — not ` +
          `assumed — as roughly 1.5 GiB of peak memory on the machine that ` +
          `chose it, and 2.4x the largest corpus this family has counted ` +
          `(awcms ADR-0114: 25,029 articles).\n\n` +
          `Two causes, and they need different answers:\n` +
          `  - The cursor is not advancing. awcms would have to be returning the ` +
          `same page forever; the post count above tells you which, because it ` +
          `would be a multiple of ${PAGE_SIZE} with duplicate slugs.\n` +
          `  - This site really is that large. Then run ` +
          `\`bun run ukur:skala ${MAX_PAGES * PAGE_SIZE} ${MAX_PAGES * PAGE_SIZE * 2}\` ` +
          `on the machine that will do the build, read the peak RSS, and raise ` +
          `MAX_PAGES together with the measurement recorded beside it.\n\n` +
          `What is NOT an answer is returning what has been collected so far: a ` +
          `short list that looks complete publishes a site missing its newest ` +
          `articles, with every gate green.`
      );
    }

    cursor = response.nextCursor;
  }
}

/**
 * Refuses to build from a response that is not actually the full feed.
 *
 * `view=full` is a request, and an awcms that predates it does not reject the
 * parameter — it ignores it and answers with summaries. Every field this
 * adapter needs then reads `undefined`, and the result is the exact failure the
 * traversal above was rewritten to end: a green build publishing empty articles
 * in empty sections, with no error anywhere.
 *
 * `contentJson` is the discriminator because awcms declares it non-nullable on
 * a full row: present means full, absent means the request was ignored.
 */
function assertFeedReturnedFullRows(posts: AwcmsBlogPost[]): void {
  const ringkasan = posts.filter((post) => post.contentJson === undefined);

  if (ringkasan.length === 0) return;

  throw new Error(
    `awcms answered ${ringkasan.length} of ${posts.length} posts without ` +
      `contentJson, which means it ignored ?view=full and returned summaries. ` +
      `That is an awcms older than the build feed. Building anyway would ` +
      `publish every article with an empty body and — because a post's section ` +
      `is stored inside contentJson — every section empty too, with nothing ` +
      `failing anywhere. Upgrade awcms.`
  );
}

/**
 * Refuses to build a site whose translations cannot be paired.
 *
 * Rule 1 pairs locales through `translationGroupId`. awcms returns it now, so
 * this gate is quiet on a healthy deployment — it fires when a post in another
 * locale arrives without one, which is either an editorial mistake or an awcms
 * that predates the field being readable at all.
 *
 * The consequence of continuing would not look like a failure. Every non-default
 * locale would fall back to the source language, each page carrying the "not
 * translated yet" notice, and the site would publish translations that exist —
 * as untranslated pages. That is silently dropping content, and this repo
 * treats that as a failure rather than a degradation.
 *
 * It is written as an assertion over the DATA, not a version check against
 * awcms — which is why nothing here changed when awcms started returning the
 * field, and why nothing here needs to change if a deployment stops.
 */
function assertTranslationsArePairable(posts: AwcmsBlogPost[]): void {
  const unpairable = posts.filter(
    (post) => post.locale !== defaultLocale && !post.translationGroupId
  );

  if (unpairable.length === 0) return;

  const contoh = unpairable
    .slice(0, 3)
    .map((post) => `${post.locale}/${post.slug}`)
    .join(", ");

  throw new Error(
    `${unpairable.length} published post(s) are in a locale other than ` +
      `"${defaultLocale}" but carry no translationGroupId, so this build ` +
      `cannot tell which source article they translate (e.g. ${contoh}). ` +
      `Either the translation was never grouped with its source in awcms, or ` +
      `this awcms predates the field being returned at all. Building anyway ` +
      `would publish every one of these pages in ${defaultLocale} with a ` +
      `"not translated" notice, which looks like a site whose translations ` +
      `were never written rather than one whose translations were dropped.`
  );
}

function readBlock(post: AwcmsBlogPost): AwcmsAstroBlock {
  const raw = (post.contentJson ?? {}) as Record<string, unknown>;
  const block = raw.awcmsAstro;
  return block && typeof block === "object"
    ? (block as AwcmsAstroBlock)
    : { schemaVersion: 1 };
}

/**
 * Which section every published post belongs to, decided ONCE per build.
 *
 * ## The defect this replaces
 *
 * This used to be one expression inside `getArticles`:
 *
 *     readBlock(post).kategori === tab
 *
 * `contentJson.awcmsAstro` is **this repo's own sidecar**, and awcms's
 * authoring path never writes it. Grepping `ahliweb/awcms` for the key returns
 * the legacy importer and some envelope-preservation comments and nothing else
 * — there is no field for it on the admin screen. The only writer in the entire
 * CMS is `bun run blog:legacy:import --section-map` (awcms ADR-0115 §2), a
 * one-off CLI.
 *
 * So **every article an editor wrote in awcms was dropped**: `undefined === tab`
 * for every configured tab, no page built, no archive entry, no error. The one
 * classification an editor can actually set — the taxonomy terms this repo
 * ALREADY reads for its category and tag archives — decided nothing.
 *
 * Nothing here could see it either. `buatPost` in `tests/kontrak-awcms.test.mjs`
 * wrote the sidecar on every fixture row, so the suite had never once produced
 * a post without one.
 *
 * ## The order, and why the sidecar still wins
 *
 * 1. **The sidecar, when present.** It is an explicit instruction from the one
 *    tool that writes it, and awcms ADR-0115 §4 REFUSES to import a row its
 *    `--section-map` cannot place. Letting taxonomy override that would make a
 *    migration land somewhere its operator did not choose.
 * 2. **Otherwise the taxonomy.** The first tab in `tabs` DECLARATION ORDER
 *    whose `termSlugs` name one of the post's terms.
 *
 * Declaration order is the tiebreak on purpose, and it has to be *some* stated
 * rule: an article filed under two categories that both map to tabs would
 * otherwise land in whichever one a hash map happened to yield first, and a
 * section's contents would reshuffle between builds that changed nothing.
 *
 * ## What happens when nothing places a post
 *
 * Both outcomes are reported, and they are deliberately not the same event:
 *
 * - **Some posts unplaced** — a misconfiguration of one article, or a category
 *   nobody mapped. Named in the build output, build continues. Failing here
 *   would let one mistyped category stop a newsroom from publishing.
 * - **EVERY post unplaced, out of N > 0** — not an article-level mistake. It is
 *   `termSlugs` naming a vocabulary this tenant does not use, a build credential
 *   without `blog_content.taxonomies.read`, or tabs that were renamed and
 *   nothing else was. All three publish an EMPTY SITE from a green build, which
 *   is the exact defect this function was rewritten to end. It throws.
 *
 * Same shape as the media rule above — one id missing is an operator action,
 * zero out of N is not — and for the same reason.
 */
let penempatanCache: Promise<Map<string, TabSlug>> | undefined;

function slugTab(): ReadonlySet<string> {
  return new Set<string>(tabs.map((tab) => tab.slug));
}

async function petaPenempatan(): Promise<Map<string, TabSlug>> {
  const posts = await fetchPublishedPosts();
  const sumber = posts.filter((post) => post.locale === defaultLocale);

  // An empty vocabulary is a LEGITIMATE state, not a failure: `taksonomi.ts`
  // warns and returns an empty list for a 403/404, because "your CMS is down"
  // and "this newsroom uses no categories" must not be the same event. A site
  // in that state keeps working exactly as it did before this function existed
  // — placement falls through to the sidecar alone.
  const term = await termMenurutId();
  const namaTab = slugTab();

  const penempatan = new Map<string, TabSlug>();
  const takTertempatkan: { post: PostTerbit; sebab: string }[] = [];

  for (const post of sumber) {
    const sidecar = readBlock(post).kategori?.trim();

    if (sidecar) {
      if (namaTab.has(sidecar)) {
        penempatan.set(post.id, sidecar as TabSlug);
      } else {
        takTertempatkan.push({
          post,
          sebab: `contentJson.awcmsAstro.kategori is "${sidecar}", which names no configured tab`
        });
      }

      continue;
    }

    const slugTerm = new Set(
      (post.termIds ?? [])
        .map((id) => term.get(id)?.slug)
        .filter((slug): slug is string => typeof slug === "string")
    );

    const cocok = tabs.find((tab) => tab.termSlugs.some((slug) => slugTerm.has(slug)));

    if (cocok) {
      penempatan.set(post.id, cocok.slug);
    } else {
      takTertempatkan.push({
        post,
        sebab:
          slugTerm.size === 0
            ? "carries no awcms taxonomy term and no sidecar"
            : `terms [${[...slugTerm].join(", ")}] are named by no tab's termSlugs`
      });
    }
  }

  laporkanTakTertempatkan(sumber.length, penempatan.size, takTertempatkan);

  return penempatan;
}

/** See `petaPenempatan`'s header for why these two outcomes differ. */
function laporkanTakTertempatkan(
  total: number,
  ditempatkan: number,
  takTertempatkan: { post: PostTerbit; sebab: string }[]
): void {
  if (takTertempatkan.length === 0) return;

  if (total > 0 && ditempatkan === 0) {
    const contoh = takTertempatkan
      .slice(0, 3)
      .map(({ post, sebab }) => `  ${post.slug} — ${sebab}`)
      .join("\n");

    throw new Error(
      `All ${total} published post(s) belong to no section, so this build ` +
        `would publish a site with zero articles — every section index empty, ` +
        `every archive empty, and every gate green.\n\n` +
        `A section is resolved from the post's awcms taxonomy terms, matched ` +
        `against the "termSlugs" declared on each tab in src/config/site.ts. ` +
        `Zero out of ${total} matching is not an editing mistake; the usual ` +
        `causes are termSlugs naming a vocabulary this tenant does not use, a ` +
        `build credential without blog_content.taxonomies.read (the term list ` +
        `then arrives empty and warns above this line), or tabs that were ` +
        `renamed while site.ts was not.\n\n` +
        `First ${Math.min(3, takTertempatkan.length)}:\n${contoh}`
    );
  }

  const contoh = takTertempatkan
    .slice(0, 10)
    .map(({ post, sebab }) => `  ${post.slug} — ${sebab}`)
    .join("\n");
  const sisa =
    takTertempatkan.length > 10 ? `\n  … and ${takTertempatkan.length - 10} more` : "";

  console.warn(
    `[awcms] ${takTertempatkan.length} of ${total} published post(s) belong to ` +
      `no section and will NOT be published. They are not rendered wrongly — no ` +
      `page is built for them at all.\n${contoh}${sisa}\n` +
      `        Give the tab a matching "termSlugs" entry in src/config/site.ts, ` +
      `or file the article under a category that is already mapped.`
  );
}

/**
 * The article body, from the CANONICAL column when there is one.
 *
 * ## Two sources, and why the fallback is not permanent
 *
 * `awcms` ADR-0100 made Portable Text the canonical body and kept
 * `content_json.blocks` alive as a DERIVED PROJECTION — explicitly so this repo
 * would not go blank on the day of the cutover. That projection is **lossy by
 * construction**: the old vocabulary has no marks, so every bold, italic, code
 * span and inline link an editor writes flattens to plain text on the way
 * across. Rendering it is what made every article this site has ever published
 * unstyled prose.
 *
 * So the canonical column wins whenever it carries anything.
 *
 * ## When the fallback still fires, and what deletes it
 *
 * `bodyPortableText` arrives ABSENT from an awcms that predates ADR-0100, and
 * arrives EMPTY from a row `bun run blog:portable-text:backfill` has not
 * reached yet. Both mean the words are in the projection, so both take the same
 * branch.
 *
 * **The condition for deleting this function and calling `renderPortableText`
 * directly is stated rather than left to judgement:** every row of the tenant
 * is backfilled AND the deployment is on awcms v10.0.0 or later. Until then a
 * site that removed the fallback would publish blank articles for exactly the
 * rows nobody has migrated — the failure ADR-0100 §4 exists to prevent, arriving
 * from the other direction.
 *
 * ADR-0100 §5 is the mirror of this: `awcms` deletes its compatibility WRITER
 * when this repo reads the canonical column, which it now does. The two
 * deletions are not the same event and must not be done together.
 */
function renderBodyHtml(
  post: PostTerbit,
  media: Map<string, ObjekMedia>
): string {
  const kanonik = post.bodyPortableText;

  if (Array.isArray(kanonik) && kanonik.length > 0) {
    return renderPortableText(kanonik, media);
  }

  // Never from a raw-HTML field, because there is not one — in either format.
  return renderContentBlocks(post.contentJson, media);
}

/**
 * `post` supplies the words; `source` supplies the article's IDENTITY.
 *
 * They are the same object for the default locale and differ for a translated
 * one. Splitting them matters for two fields:
 *
 *   - `urutan` decides the order of the section index. Read from the
 *     translation, a translator who left the field blank silently reorders that
 *     language's whole section — the pages are all there, in a different order,
 *     and nothing fails. Rule 3 in this file's header says order comes from an
 *     explicit field; it has to be the SAME explicit field in every locale.
 *   - `kategori` decides which tab the article belongs to. It was already
 *     chosen by the default-locale post in `getArticles()`; re-reading it from
 *     the translation would let a mistyped category there build a page whose
 *     own breadcrumb points at a different section.
 *   - `termIds` decides which archives list the article. Read from the
 *     translation, a translator who left the classification blank drops that
 *     article out of every archive in their language alone: every page still
 *     present, the archives quietly shorter, nothing failing. The same argument
 *     as `urutan`, one dimension over.
 *
 * The two DATES go the other way, and deliberately: both come from `post`, the
 * row whose words this page shows. They are a matched pair describing one
 * revision history, and pairing a publish date from one row with a modified
 * date from another produces `dateModified` earlier than `datePublished` on
 * perfectly ordinary content — a source article published today whose
 * translation has not been touched since last month. awcms reads both from one
 * row (`news-article-seo-metadata.ts`), and so does this.
 *
 * Ordering is unaffected by that choice, because ordering never reads these
 * fields: it reads the SOURCE post directly, in `getArticles`.
 */
function toArticle(
  post: PostTerbit,
  source: PostTerbit,
  isFallback: boolean,
  media: Map<string, ObjekMedia>,
  kategori: TabSlug
): LocalizedArticle {
  const block = readBlock(post);
  const sourceBlock = readBlock(source);

  return {
    slug: source.slug,
    entry: {
      id: post.id,
      data: {
        title: post.title,
        description: post.metaDescription ?? post.excerpt ?? "",
        publishedDate: new Date(post.publishedAt),
        updatedDate: new Date(post.updatedAt),
        urutan: sourceBlock.urutan ?? 99,
        // The tab this article was PLACED in, passed down from
        // `petaPenempatan` — not `sourceBlock.kategori`, which is empty for
        // every article awcms's own editor wrote. Reading the sidecar here
        // would give a taxonomy-placed article an empty section: its breadcrumb
        // would name nothing, `urutanSeksiTab("")` would answer `"manual"`, and
        // a news section would silently render as a reference one.
        kategori,
        canonicalUrl: post.canonicalUrl ?? undefined,
        syaratDokumen: block.syaratDokumen ?? [],
        langkah: block.langkah ?? [],
        biaya: block.biaya ?? [],
        dasarHukum: block.dasarHukum ?? [],
        faq: block.faq ?? [],
        estimasiWaktu: block.estimasiWaktu,
        reviewDueDate: block.reviewDueDate
      },
      bodyHtml: renderBodyHtml(post, media)
    },
    isFallback,
    termIds: source.termIds ?? [],
    // Trimmed, and an all-whitespace value treated as absent: awcms bounds the
    // length of this field but a byline of spaces would still render as an
    // empty "Ditulis oleh" line — a metadata row that says a person wrote this
    // and then names nobody.
    authorByline: post.authorByline?.trim() || undefined,
    // The TRANSLATED post's image, not the source's: an editor who gave a
    // locale its own artwork meant it for that locale. Falling back to the
    // source's image is correct and automatic — a fallback article IS the
    // source post, so `post` already is it.
    //
    // `altText` from awcms wins over the article title because it was written
    // for the image; the title is the honest second choice, and it is at least
    // in the reader's language. An empty string is treated as absent — a blank
    // `alt` on a content image tells a screen reader the image is decorative,
    // which this one is not.
    gambar: gambarUntuk(post, media),
    kartuShare: kartuShareUntuk(post, media)
  };
}

/**
 * `LocalizedArticle["kartuShare"]` for one post, or `undefined`.
 *
 * Precedence is awcms's, not this repo's: `seoImageMediaId ?? featuredMediaId`.
 * An article with neither falls through to `SITE_SOCIAL_IMAGE` at the call
 * site, and a site with neither publishes no image tag at all — a supported
 * state that renders as a clean text card, unlike a broken image which renders
 * as nothing.
 */
function kartuShareUntuk(
  post: AwcmsBlogPost,
  media: Map<string, ObjekMedia>
): LocalizedArticle["kartuShare"] {
  const id = post.seoImageMediaId || post.featuredMediaId;
  const objek = id ? media.get(id) : undefined;

  if (!objek) return undefined;

  return {
    src: objek.publicUrl,
    alt: objek.altText?.trim() || post.title,
    type: objek.mimeType,
    width: objek.width,
    height: objek.height
  };
}

/** `LocalizedArticle["gambar"]` for one post, or `undefined`. */
function gambarUntuk(
  post: AwcmsBlogPost,
  media: Map<string, ObjekMedia>
): LocalizedArticle["gambar"] {
  const objek = post.featuredMediaId
    ? media.get(post.featuredMediaId)
    : undefined;

  if (!objek) return undefined;

  return {
    src: objek.publicUrl,
    alt: objek.altText?.trim() || post.title,
    width: objek.width,
    height: objek.height
  };
}

/**
 * Every article in one tab, for one locale.
 *
 * See the four rules in this file's header — this function is where all four
 * live, and each is annotated inline at the point it takes effect.
 */
export async function getArticles(
  tab: TabSlug,
  locale: Locale
): Promise<LocalizedArticle[]> {
  const posts = await fetchPublishedPosts();
  mediaCache ??= fetchMedia(posts);
  const media = await mediaCache;

  // Rule 1: the default locale defines the page set.
  //
  // The section comes from `petaPenempatan`, computed once for the whole build,
  // never from `readBlock(post).kategori` at this call site. That expression is
  // what dropped every article awcms's own editor produced — see that
  // function's header.
  penempatanCache ??= petaPenempatan();
  const penempatan = await penempatanCache;

  const sources = posts.filter(
    (post) => post.locale === defaultLocale && penempatan.get(post.id) === tab
  );

  const byGroup = new Map<string, PostTerbit>();
  for (const post of posts) {
    if (post.locale === locale && post.translationGroupId) {
      byGroup.set(post.translationGroupId, post);
    }
  }

  // Rule 3: the keys the section is ordered by are collected HERE, and one of
  // them — `slugSumber` — cannot be recovered from a `LocalizedArticle` at all.
  //
  // `terbit` is deliberately the DISPLAYED article's publish date, not the
  // source post's. A section index shows a date on every card, so ordering by
  // a date the card does not show produces a list whose dates run up and down
  // for no visible reason: on `/en/` an article whose translation landed in
  // July would sit above one whose translation landed in August, because the
  // Indonesian originals were published the other way round. The two must be
  // the same column, and the reader-facing one is the one that has to win.
  //
  // The reason `urutan` is read from the SOURCE does not transfer here: a
  // translator can leave `urutan` blank and silently reorder a whole language,
  // but `publishedAt` can never be blank — `sudahTerbit` refuses to build a
  // post without one. What is lost is that two locales may order a section
  // differently; that is honest, because their publication timelines differ.
  // What is NOT lost is determinism, which the slug tiebreak still carries.
  const berkunci = sources.map((source) => {
    const translated = source.translationGroupId
      ? byGroup.get(source.translationGroupId)
      : undefined;

    // Rule 2: the adapter decides fallback, the component only reads it. A
    // translation that exists but carries a DIFFERENT slug still renders at
    // the source slug — the slug is the page's identity across locales, and
    // localising it would break every cross-language link. `toArticle` takes
    // the source post for exactly that reason.
    const article = toArticle(
      translated ?? source,
      source,
      !translated && locale !== defaultLocale,
      media,
      tab
    );

    return {
      article,
      urutan: article.entry.data.urutan,
      judul: article.entry.data.title,
      terbit: article.entry.data.publishedDate.getTime(),
      slugSumber: source.slug
    };
  });

  return urutkanArtikel(berkunci, urutanSeksiTab(tab)).map(
    (item) => item.article
  );
}

/** The keys a section may be ordered by. Deliberately small — see `urutkanArtikel`. */
export type KunciUrut = {
  /** The editor's explicit position, read from the SOURCE post. 99 when unset. */
  urutan: number;
  /** The title as DISPLAYED, i.e. the translation's. Only `"manual"` reads it. */
  judul: string;
  /** The DISPLAYED article's `publishedAt`, in milliseconds — the date its card shows. */
  terbit: number;
  /** The SOURCE post's slug — identical in every locale, which is why it breaks ties. */
  slugSumber: string;
};

/**
 * Rule 3, as a pure function: every section orders by an explicit field, and
 * WHICH field is a property of the section.
 *
 * It is exported and takes plain keys rather than living inline in
 * `getArticles` for one reason that is not tidiness: `getArticles` reads its
 * branch from `siteConfig.tabs`, every tab this template ships is `"manual"`,
 * and a template repo has no awcms instance to build against. Inline, the
 * `"terbaru"` branch would be code that never executes anywhere in the repo
 * that owns it — first run in a derived site's production build. Here it is
 * reachable from `bun test` with four plain objects.
 *
 * Both branches END on the SOURCE slug, and that last step is not decoration.
 * `Array#sort` is stable, so a comparator that returns 0 leaves the pair in
 * whatever order the API happened to return them — exactly what Rule 3 forbids.
 * The earlier keys are not enough on their own: `"terbaru"` can tie on the
 * timestamp (a bulk publish stamps one `now()` across every row it touches),
 * and `"manual"` can tie on both `urutan` and title at once — an unnumbered
 * section where every article defaults to 99, with two locales of the same
 * article carrying the same words. The slug is the one key that is unique per
 * article AND identical in every locale, so it settles both cases the same way
 * in every language — which is what keeps a tie from resolving one way in
 * Indonesian and the other way in English.
 */
export function urutkanArtikel<T extends KunciUrut>(
  items: readonly T[],
  urutanSeksi: UrutanSeksi
): T[] {
  return [...items].sort(
    (a, b) =>
      (urutanSeksi === "terbaru"
        ? b.terbit - a.terbit
        : a.urutan - b.urutan || a.judul.localeCompare(b.judul)) ||
      a.slugSumber.localeCompare(b.slugSumber)
  );
}

/** One article by slug, or `undefined`. Same rules — it reuses `getArticles`. */
export async function getArticle(
  tab: TabSlug,
  locale: Locale,
  slug: string
): Promise<LocalizedArticle | undefined> {
  const articles = await getArticles(tab, locale);
  return articles.find((article) => article.slug === slug);
}

let indeksPostCache: Promise<Map<string, { tab: string; slug: string }>>
  | undefined;

/**
 * Which page an awcms POST ID lives at (`awcms` #597 item 6).
 *
 * A menu item of type `post` carries a post id, and the only thing that can
 * turn it into a URL is this feed — so the adapter answers it rather than
 * letting a component reach for the raw posts.
 *
 * ## Every locale's ids, mapping to ONE page
 *
 * The map is keyed by every post id the build saw, in every locale, and each
 * one maps to the SOURCE article's tab and slug. That is not redundancy: an
 * editor who points a menu at the Indonesian original and an editor who points
 * it at the English translation both mean the same page, and the page's address
 * is the source slug in every language (`toArticle` takes the source for
 * exactly that reason).
 *
 * Keying only the default locale's ids would resolve one of those two and drop
 * the other — and it would drop it in one language only, which is the kind of
 * difference nobody finds by looking at the site they built.
 *
 * The tab and slug are locale-independent, so this is memoised once per build
 * rather than once per locale.
 */
export async function indeksPost(): Promise<
  ReadonlyMap<string, { tab: string; slug: string }>
> {
  indeksPostCache ??= (async () => {
    const indeks = new Map<string, { tab: string; slug: string }>();

    for (const locale of locales) {
      for (const tab of siteConfig.tabs) {
        for (const article of await getArticles(tab.slug, locale)) {
          indeks.set(article.entry.id, {
            tab: article.entry.data.kategori,
            slug: article.slug
          });
        }
      }
    }

    return indeks;
  })();

  return indeksPostCache;
}

/** Test seam: drops the per-build memoised fetch. */
export function resetContentCacheForTests(): void {
  mediaCache = undefined;
  postsCache = undefined;
  indeksPostCache = undefined;
  // Reset with its neighbours or a test's placement leaks into the next one —
  // the map is keyed by post id, and two fixtures reuse ids by construction.
  penempatanCache = undefined;
  // The vocabulary is memoised in ITS module, and placement now reads it. A
  // test that seeds terms would otherwise hand them to the next test, which is
  // the failure mode where a suite passes in order and fails in isolation.
  resetTaksonomiCacheForTests();
}
