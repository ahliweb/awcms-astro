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
 * ## A known ceiling, stated rather than hidden
 *
 * `GET /api/v1/blog/posts` is awcms's ADMIN list endpoint: it has no locale or
 * category filter and caps `limit` at 100. This adapter therefore fetches the
 * cap and filters client-side, and THROWS when the response comes back at the
 * cap — because the alternative is a site that builds green while silently
 * missing articles, which is the one failure mode a static build must never
 * have. A dedicated build-feed endpoint on the awcms side (locale-filtered,
 * keyset-paginated) is the real fix; until it exists this ceiling is real and
 * this is where you will find out about it.
 */
import { awcmsGet } from "./awcms/client";
import { renderContentBlocks } from "./content-blocks";
import { defaultLocale, type Locale, type TabSlug } from "../config/site";

/** Mirrors awcms's `BlogPost` schema (`openapi/awcms-public-api.openapi.yaml`). */
type AwcmsBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentJson?: Record<string, unknown>;
  contentText?: string;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  visibility: "public" | "private" | "unlisted";
  metaDescription: string | null;
  canonicalUrl: string | null;
  locale: string;
  translationGroupId: string | null;
  publishedAt: string | null;
  updatedAt: string;
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

const POSTS_LIMIT = 100;

let postsCache: Promise<AwcmsBlogPost[]> | undefined;

/**
 * Fetched once per build. Astro calls `getStaticPaths` for every route, and
 * without memoisation a six-locale, three-tab site would issue the same request
 * dozens of times.
 */
async function fetchPublishedPosts(): Promise<AwcmsBlogPost[]> {
  postsCache ??= (async () => {
    const { posts } = await awcmsGet<{ posts: AwcmsBlogPost[] }>(
      "/api/v1/blog/posts",
      { status: "published", limit: POSTS_LIMIT }
    );

    if (posts.length >= POSTS_LIMIT) {
      throw new Error(
        `awcms returned ${posts.length} posts, which is the API's per-request ` +
          `cap (${POSTS_LIMIT}). More articles almost certainly exist and this ` +
          `build would silently omit them. Add a paginated build feed on the ` +
          `awcms side before publishing this site.`
      );
    }

    // Rule 4, enforced here rather than trusted from the query: a `status`
    // filter is a request, and this is the last place that can tell the
    // difference between "the API honoured it" and "the API ignored it".
    return posts.filter(
      (post) => post.status === "published" && post.visibility === "public"
    );
  })();

  return postsCache;
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
