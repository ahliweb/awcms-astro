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
 *    happened to return.** A database's natural order is not stable.
 * 4. **Only `status === 'published'` is ever built.** Drafts and scheduled
 *    posts must not leak into a static output, where they would stay published
 *    until the next build regardless of what the CMS later says.
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
import { renderContentBlocks } from "./content-blocks";
import { defaultLocale, type Locale, type TabSlug } from "../config/site";

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
 * A runaway-loop backstop, not a content limit. It sits far above any plausible
 * site (20 000 posts) and it THROWS rather than returning what it has — because
 * the one thing this file must never do is return a short list that looks
 * complete.
 */
const MAX_PAGES = 400;

let postsCache: Promise<AwcmsBlogPost[]> | undefined;
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
        .flatMap((post) => [post.featuredMediaId, post.seoImageMediaId])
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
async function fetchPublishedPosts(): Promise<AwcmsBlogPost[]> {
  postsCache ??= (async () => {
    const posts = await listPublishedPosts();

    // Rule 4, enforced here rather than trusted from the query: a `status`
    // filter is a request, and this is the last place that can tell the
    // difference between "the API honoured it" and "the API ignored it".
    const visible = posts.filter(
      (post) => post.status === "published" && post.visibility === "public"
    );

    assertFeedReturnedFullRows(visible);
    assertTranslationsArePairable(visible);
    return visible;
  })();

  return postsCache;
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
          `still returned a cursor. Either this site is far larger than this ` +
          `backstop assumes, or the cursor is not advancing. Both are worth ` +
          `looking at before publishing; neither is worth shipping a site that ` +
          `is missing articles nobody counted.`
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
 */
function toArticle(
  post: AwcmsBlogPost,
  source: AwcmsBlogPost,
  isFallback: boolean,
  media: Map<string, ObjekMedia>
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
        updatedDate: new Date(post.publishedAt ?? post.updatedAt),
        urutan: sourceBlock.urutan ?? 99,
        kategori: sourceBlock.kategori ?? "",
        canonicalUrl: post.canonicalUrl ?? undefined,
        syaratDokumen: block.syaratDokumen ?? [],
        langkah: block.langkah ?? [],
        biaya: block.biaya ?? [],
        dasarHukum: block.dasarHukum ?? [],
        faq: block.faq ?? [],
        estimasiWaktu: block.estimasiWaktu,
        reviewDueDate: block.reviewDueDate
      },
      // Rendered here, once, from the SAME structured blocks awcms stores —
      // never from a raw-HTML field, because there is not one.
      bodyHtml: renderContentBlocks(post.contentJson)
    },
    isFallback,
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
  const sources = posts.filter(
    (post) =>
      post.locale === defaultLocale && readBlock(post).kategori === tab
  );

  const byGroup = new Map<string, AwcmsBlogPost>();
  for (const post of posts) {
    if (post.locale === locale && post.translationGroupId) {
      byGroup.set(post.translationGroupId, post);
    }
  }

  return sources
    .map((source) => {
      const translated = source.translationGroupId
        ? byGroup.get(source.translationGroupId)
        : undefined;

      // Rule 2: the adapter decides fallback, the component only reads it. A
      // translation that exists but carries a DIFFERENT slug still renders at
      // the source slug — the slug is the page's identity across locales, and
      // localising it would break every cross-language link. `toArticle` takes
      // the source post for exactly that reason.
      return toArticle(
        translated ?? source,
        source,
        !translated && locale !== defaultLocale,
        media
      );
    })
    // Rule 3: explicit order field, then title as a stable tiebreaker.
    .sort(
      (a, b) =>
        a.entry.data.urutan - b.entry.data.urutan ||
        a.entry.data.title.localeCompare(b.entry.data.title)
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

/** Test seam: drops the per-build memoised fetch. */
export function resetContentCacheForTests(): void {
  mediaCache = undefined;
  postsCache = undefined;
}
