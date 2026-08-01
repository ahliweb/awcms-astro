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
 * ## How it reads awcms, and what that costs
 *
 * `GET /api/v1/blog/posts` is awcms's ADMIN list endpoint. It has no locale or
 * category filter, caps `limit` at 100, and — the part that decides the shape
 * of everything below — returns SUMMARIES, not posts. So the traversal is:
 *
 *   1. page the whole list with a keyset cursor (`order=created_at`), which is
 *      the only ordering awcms will paginate over soundly;
 *   2. drop everything that is not published + public;
 *   3. fetch each survivor in full from `/api/v1/blog/posts/{id}`.
 *
 * Step 3 is N+1 requests per build, stated rather than hidden. The real fix is
 * a build feed on the awcms side that returns full rows, keyset-paginated and
 * locale-aware; until it exists, correct-and-slow beats fast-and-empty. The
 * decision and its alternatives are in ADR-0018.
 *
 * ## The contract gap this file refuses to paper over
 *
 * Rule 1 pairs locales through `translationGroupId`, and **no awcms read
 * endpoint returns that field**. A site with translations therefore cannot be
 * built correctly today, and `assertTranslationsArePairable` below fails the
 * build instead of publishing every language in the source language with a
 * "not translated" notice. A single-locale site is unaffected.
 */
import { awcmsGet } from "./awcms/client";
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
}

/** awcms caps `limit` at 100 (`MAX_LIST_LIMIT`); asking for more is silently bounded. */
const PAGE_SIZE = 100;

/**
 * A runaway-loop backstop, not a content limit. It sits far above any plausible
 * site (20 000 posts) and it THROWS rather than returning what it has — because
 * the one thing this file must never do is return a short list that looks
 * complete.
 */
const MAX_PAGES = 200;

/** Hydration is one request per post; this keeps a large site from opening hundreds at once. */
const HYDRATION_CONCURRENCY = 8;

let postsCache: Promise<AwcmsBlogPost[]> | undefined;

/**
 * Every published post, in full, fetched once per build.
 *
 * Astro calls `getStaticPaths` for every route, so without memoisation a
 * six-locale, three-tab site would repeat this whole traversal dozens of times.
 *
 * ## Why two round trips per post
 *
 * The list endpoint returns summaries (see `AwcmsBlogPostSummary`), and this
 * adapter needs the body, the excerpt, the meta description, and the section —
 * all of which live on the detail endpoint. Fetching N+1 times is a real cost
 * and it is stated rather than hidden: the fix is a build feed on the awcms
 * side that returns full rows, keyset-paginated and locale-aware. Until that
 * exists, correct-and-slow beats fast-and-empty.
 */
async function fetchPublishedPosts(): Promise<AwcmsBlogPost[]> {
  postsCache ??= (async () => {
    const summaries = await listPublishedSummaries();

    // Rule 4, enforced here rather than trusted from the query: a `status`
    // filter is a request, and this is the last place that can tell the
    // difference between "the API honoured it" and "the API ignored it".
    // Filtering BEFORE hydration also means drafts never cost a request.
    const visible = summaries.filter(
      (post) => post.status === "published" && post.visibility === "public"
    );

    const posts = await hydrate(visible);
    assertTranslationsArePairable(posts);
    return posts;
  })();

  return postsCache;
}

/**
 * Walks the whole list with a keyset cursor.
 *
 * `order=created_at` is not a preference. awcms refuses `cursor` on any other
 * ordering, and says why: the default `updated_at` moves whenever a post is
 * edited, so a row can cross a page boundary between two requests and be
 * skipped or returned twice — which would surface months later as "a few
 * articles are missing from the site", with nothing able to detect it.
 */
async function listPublishedSummaries(): Promise<AwcmsBlogPostSummary[]> {
  const summaries: AwcmsBlogPostSummary[] = [];
  let cursor: string | undefined;

  for (let page = 1; ; page += 1) {
    const response = await awcmsGet<{
      posts: AwcmsBlogPostSummary[];
      nextCursor: string | null;
    }>("/api/v1/blog/posts", {
      status: "published",
      order: "created_at",
      limit: PAGE_SIZE,
      cursor
    });

    summaries.push(...response.posts);

    if (!response.nextCursor) return summaries;

    if (page >= MAX_PAGES) {
      throw new Error(
        `Stopped after ${MAX_PAGES} pages (${summaries.length} posts) and ` +
          `awcms still returned a cursor. Either this site is far larger than ` +
          `this backstop assumes, or the cursor is not advancing. Both are ` +
          `worth looking at before publishing; neither is worth shipping a ` +
          `site that is missing articles nobody counted.`
      );
    }

    cursor = response.nextCursor;
  }
}

/** Fetches full rows for `summaries`, bounded concurrency, order preserved. */
async function hydrate(
  summaries: AwcmsBlogPostSummary[]
): Promise<AwcmsBlogPost[]> {
  const posts = new Array<AwcmsBlogPost>(summaries.length);
  let next = 0;

  async function worker(): Promise<void> {
    for (let index = next++; index < summaries.length; index = next++) {
      const summary = summaries[index]!;
      posts[index] = await awcmsGet<AwcmsBlogPost>(
        `/api/v1/blog/posts/${summary.id}`
      );
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(HYDRATION_CONCURRENCY, summaries.length) },
      worker
    )
  );

  return posts;
}

/**
 * Refuses to build a site whose translations cannot be paired.
 *
 * Rule 1 pairs locales through `translationGroupId`. awcms accepts that field
 * on write but returns it from no read endpoint, so for any site that actually
 * has translations this adapter sees a set of unrelated posts.
 *
 * The consequence of continuing would not look like a failure. Every non-default
 * locale would fall back to the source language, each page carrying the "not
 * translated yet" notice, and the site would publish translations that exist —
 * as untranslated pages. That is silently dropping content, and this repo
 * treats that as a failure rather than a degradation.
 *
 * This is written as an assertion over the DATA, not a version check against
 * awcms: a single-locale site builds today, and the day awcms returns the field
 * this gate passes on its own with nothing here to change.
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
      `awcms accepts translationGroupId on write and returns it from no read ` +
      `endpoint — the gap is on that side, not in the data. Building anyway ` +
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
  isFallback: boolean
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
    isFallback
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
        !translated && locale !== defaultLocale
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
  postsCache = undefined;
}
