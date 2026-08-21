/**
 * Renders awcms `contentJson` blocks to HTML at build time.
 *
 * ## Why this exists here and not on the awcms side
 *
 * awcms has its own renderer (`content-block-rendering.ts`) for the pages it
 * serves itself. This site does not go through those pages — it fetches the
 * structured blocks and renders them into its own layout, with its own design
 * tokens. Rendering twice with one shared vocabulary is the point of storing
 * structure rather than HTML.
 *
 * ## The rule that must not be relaxed
 *
 * **There is no raw-HTML block type, and adding one would defeat the whole
 * arrangement.** Content comes from a CMS, so it is authored by people who are
 * not necessarily the people who review this repo. Every block below is
 * constructed from escaped text and a fixed tag — an editor cannot inject
 * markup, script, or an iframe through any path here, no matter what they type.
 *
 * ## The vocabulary, and why the previous version of this file got it wrong
 *
 * awcms's whitelist is exactly six types (`ContentBlock` in
 * `blog-content/domain/content-block-rendering.ts`):
 *
 *     paragraph  heading  list  quote  gallery  video_news
 *
 * The first version of this file was written against a guess rather than
 * against that type, and disagreed with it in three ways that all failed
 * SILENTLY:
 *
 *   1. It handled an `ordered_list` type. awcms has no such type — it emits
 *      `{ type: "list", ordered: true }`. So every numbered list an editor
 *      wrote came out bulleted. No error, no warning, just wrong.
 *   2. `gallery` and `video_news` fell through to the paragraph branch, which
 *      returns `""` when the block has no `text` field — and neither of those
 *      blocks has one. **The two block types that carry media were the two
 *      that vanished from the page entirely.**
 *   3. This header claimed unknown types render "as an escaped paragraph …
 *      rather than dropping it silently". Because of (2) that claim was false
 *      for precisely the blocks it mattered for.
 *
 * The vocabulary is now pinned by `tests/content-blocks.test.mjs`, and the
 * unknown-type fallback really does render something visible.
 *
 * ## Media, and what this renderer cannot resolve
 *
 * A gallery item is either `{ url }` (a direct URL) or `{ mediaObjectId }` (an
 * id in awcms's media registry). BOTH render now.
 *
 * This paragraph used to read "only the first can be rendered here: resolving
 * an id needs a media endpoint this site does not call". That stopped being
 * true when `src/lib/awcms/media.ts` landed — the build has resolved featured
 * images and share cards through `GET /api/v1/media/objects` ever since — and
 * nothing re-read the sentence. So every gallery an editor placed rendered as a
 * row of grey placeholders on a site whose article images worked, with no gate
 * able to see it: the placeholder IS the documented behaviour for an
 * unresolvable item, and it looked like one.
 *
 * The resolution happens in `content.ts`, in the SAME batch as the featured
 * images, and arrives here as a map. This module stays pure: it renders what it
 * is given and performs no I/O, which is what lets the whole vocabulary be
 * tested without a network.
 *
 * An item that genuinely cannot be resolved — an id awcms reports as
 * unresolved, or a URL that failed the scheme check — still renders as a
 * labelled placeholder rather than nothing, so a missing image shows up in a
 * page review instead of being discovered by a reader.
 *
 * `video_news` is rendered as a LINK, never an embed — deliberately, and not
 * because embedding is harder. An embedded player is a third-party surface that
 * sees the reader before the reader has chosen to watch anything, which is
 * exactly what this repo's no-third-party rule exists to prevent (`AGENTS.md`
 * §Keamanan). awcms's own renderer embeds because it serves a different product
 * with a different posture; this one links.
 */

type Block = {
  type?: string;
  text?: string;
  level?: number;
  ordered?: boolean;
  items?: unknown[];
  [key: string]: unknown;
};

/**
 * `mediaObjectId` -> the registry object, built by `content.ts` from one batch
 * per build. A `ReadonlyMap` because this module must not be able to add to it:
 * an id that is not here is one awcms reported as unresolved, and inventing an
 * entry would turn "this image is gone" into a broken `<img>`.
 */
export type MediaTerresolusi = ReadonlyMap<
  string,
  { publicUrl: string; altText: string | null; width: number | null; height: number | null }
>;

const TANPA_MEDIA: MediaTerresolusi = new Map();

type GalleryItem = {
  mediaType?: string;
  url?: string;
  mediaObjectId?: string;
  caption?: string;
};

/**
 * awcms's `ContentBlock` union as a runtime value, so a test can hold it to
 * awcms's documented whitelist. A vocabulary that drifts is the failure this
 * file already had once, and it is invisible from either side.
 */
export const AWCMS_BLOCK_TYPES: readonly string[] = [
  "paragraph",
  "heading",
  "list",
  "quote",
  "gallery",
  "video_news"
];

const ALLOWED_HEADING_LEVELS = new Set([2, 3, 4]);

/** Providers whose watch URL this renderer knows how to build. */
const VIDEO_WATCH_URL_BUILDERS: Record<string, (id: string) => string> = {
  youtube: (id) => `https://www.youtube.com/watch?v=${id}`
};

/** Matches awcms's own `YOUTUBE_VIDEO_ID_PATTERN` — an id outside it never goes into a URL. */
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Only `http(s)`, and only absolute. A `javascript:` or `data:` value in
 * `src`/`href` is script execution, and escaping does not stop it — escaping
 * protects the attribute's syntax, not its scheme.
 */
function safeAbsoluteUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? value
      : null;
  } catch {
    return null;
  }
}

function renderPlaceholder(label: string): string {
  return `<p class="blok-tak-tersedia"><em>${escapeHtml(label)}</em></p>`;
}

function renderList(block: Block): string {
  const items = Array.isArray(block.items) ? block.items : [];
  const rendered = items
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .map((item) => `<li>${escapeHtml(item as string)}</li>`)
    .join("");

  if (!rendered) return "";

  // awcms models ordering as a FIELD on `list`, not as a separate type.
  const tag = block.ordered === true ? "ol" : "ul";
  return `<${tag}>${rendered}</${tag}>`;
}

function renderGalleryItem(
  item: GalleryItem,
  media: MediaTerresolusi
): string {
  const caption = typeof item.caption === "string" ? item.caption : "";
  const captionHtml = caption
    ? `<figcaption>${escapeHtml(caption)}</figcaption>`
    : "";

  // The registry id wins over a raw `url` when both are present, matching
  // awcms's own renderer: the id is the managed reference, and the URL beside
  // it is whatever was there before the object was registered.
  const terresolusi =
    typeof item.mediaObjectId === "string"
      ? media.get(item.mediaObjectId)
      : undefined;

  const url = terresolusi
    ? safeAbsoluteUrl(terresolusi.publicUrl)
    : safeAbsoluteUrl(item.url);

  if (!url) {
    // Either a registry id this site cannot resolve, or a URL that failed the
    // scheme check. Both are shown, never skipped.
    return `<figure class="galeri-item">${renderPlaceholder(
      caption || "Gambar tidak tersedia di build ini."
    )}</figure>`;
  }

  if (item.mediaType === "video") {
    return `<figure class="galeri-item"><a href="${escapeHtml(url)}" rel="noopener noreferrer">${escapeHtml(caption || "Tonton video")}</a>${captionHtml}</figure>`;
  }

  // `altText` from the registry was written FOR the image; the caption is the
  // honest second choice. An empty string is treated as absent — a blank `alt`
  // tells a screen reader the image is decorative, which a gallery image is not.
  // Same precedence `content.ts` applies to an article's featured image.
  const alt = terresolusi?.altText?.trim() || caption;
  const ukuran = terresolusi
    ? `${terresolusi.width ? ` width="${terresolusi.width}"` : ""}${terresolusi.height ? ` height="${terresolusi.height}"` : ""}`
    : "";

  return `<figure class="galeri-item"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"${ukuran} loading="lazy">${captionHtml}</figure>`;
}

function renderGallery(block: Block, media: MediaTerresolusi): string {
  const items = Array.isArray(block.items) ? block.items : [];

  const rendered = items
    .filter(
      (item): item is GalleryItem =>
        typeof item === "object" && item !== null && !Array.isArray(item)
    )
    .map((item) => renderGalleryItem(item, media))
    .join("");

  if (!rendered) {
    return renderPlaceholder("Galeri kosong.");
  }

  return `<div class="galeri">${rendered}</div>`;
}

function renderVideoNews(block: Block): string {
  const provider = typeof block.provider === "string" ? block.provider : "";
  const videoId = typeof block.videoId === "string" ? block.videoId : "";
  const title = typeof block.title === "string" ? block.title : "";
  const caption = typeof block.caption === "string" ? block.caption : "";
  const sourceLabel =
    typeof block.sourceLabel === "string" ? block.sourceLabel : "";

  const buildWatchUrl = VIDEO_WATCH_URL_BUILDERS[provider];
  const idLooksValid =
    provider === "youtube" ? YOUTUBE_VIDEO_ID_PATTERN.test(videoId) : false;

  if (!buildWatchUrl || !idLooksValid) {
    // An unknown provider is not guessed at — a URL built from an unvalidated
    // id is a link to somewhere nobody chose.
    return renderPlaceholder(title || caption || "Video tidak tersedia.");
  }

  const label = title || caption || "Tonton video";
  const source = sourceLabel
    ? `<figcaption>${escapeHtml(sourceLabel)}</figcaption>`
    : "";

  return `<figure class="video-berita"><a href="${escapeHtml(buildWatchUrl(videoId))}" rel="noopener noreferrer">${escapeHtml(label)}</a>${source}</figure>`;
}

function renderBlock(block: Block, media: MediaTerresolusi): string {
  const text = escapeHtml(String(block.text ?? ""));

  switch (block.type) {
    case "heading": {
      // An out-of-range level is clamped rather than trusted. `<h1>` belongs to
      // the page title alone; a content-authored `<h1>` would give the document
      // two top-level headings and break the outline for screen readers.
      const level =
        typeof block.level === "number" &&
        ALLOWED_HEADING_LEVELS.has(block.level)
          ? block.level
          : 2;
      return `<h${level}>${text}</h${level}>`;
    }
    case "list":
      return renderList(block);
    case "quote":
      return `<blockquote><p>${text}</p></blockquote>`;
    case "gallery":
      return renderGallery(block, media);
    case "video_news":
      return renderVideoNews(block);
    case "paragraph":
      return text ? `<p>${text}</p>` : "";
    default:
      // A type awcms added that this renderer has not learned yet. Rendering
      // its text keeps the words on the page; when there is no text to show, a
      // placeholder says so rather than leaving a hole nobody notices.
      return text
        ? `<p>${text}</p>`
        : renderPlaceholder(
            `Blok "${String(block.type ?? "tanpa tipe")}" belum didukung.`
          );
  }
}

/**
 * `contentJson` -> HTML string, ready for `set:html`.
 *
 * `set:html` is safe here precisely because every character above came out of
 * `escapeHtml`. Do not feed this function's output anything it did not build.
 */
export function renderContentBlocks(
  contentJson: Record<string, unknown> | undefined,
  media: MediaTerresolusi = TANPA_MEDIA
): string {
  const blocks = contentJson?.blocks;

  if (!Array.isArray(blocks)) {
    return "";
  }

  return blocks
    .map((block) => renderBlock((block ?? {}) as Block, media))
    .filter(Boolean)
    .join("\n");
}
