/**
 * Renders awcms's CANONICAL article body — Portable Text — to HTML at build time.
 *
 * ## Why this exists beside `content-blocks.ts` rather than replacing it
 *
 * `awcms` ADR-0100 made Portable Text the canonical body on 19 August 2026 and
 * shipped it in v10.0.0. The old six-type `ContentBlock` union survives over
 * there as `content_json.blocks` — a DERIVED PROJECTION, kept alive explicitly
 * so this repo would not go blank on the day of the cutover, and **lossy by
 * construction**: the old vocabulary has no marks, so every bold, italic, code
 * span and inline link an editor writes flattens to plain text on the way
 * across.
 *
 * That projection is what this site rendered until now. Every article it has
 * ever published has been unstyled prose, and no editor could have changed that.
 *
 * `content-blocks.ts` stays because a row that has not been backfilled yet still
 * arrives with an empty `bodyPortableText` and a populated `blocks`. See
 * `renderBodyHtml` at the bottom for the exact fallback rule and the condition
 * for deleting it.
 *
 * ## The rule that does not relax, and did not need to
 *
 * **There is no raw-HTML node type, and adding one would defeat the whole
 * arrangement.** Every string below reaches the output through `escapeHtml` and
 * a fixed tag. An editor cannot inject markup, script, or an iframe through any
 * path here, no matter what they type — exactly as with the old renderer.
 *
 * Portable Text does not weaken that. `awcms` keeps its vocabulary **CLOSED**
 * (ADR-0100 decision 2): every node type, block style, list kind, decorator and
 * annotation type is enumerated over there and anything else is refused at
 * WRITE time rather than merely failing to render. The gain is inline
 * structure, not extensibility.
 *
 * ## Two details carried over rather than re-derived
 *
 * - **A link `href` is scheme-checked by `URL` parsing over there, at write
 *   time, and escaped here at render time.** The check is not repeated with a
 *   regex: a regex over the raw string is how `java\nscript:` and
 *   `JaVaScRiPt:` get through, and `URL` normalises both. This file reuses
 *   `safeHref` below, which parses.
 * - **`underline` is deliberately NOT a decorator.** An underlined span that is
 *   not a link is a usability defect, and offering it guarantees it gets used
 *   for emphasis. Do not add it because a CMS elsewhere has one.
 *
 * ## `videoNews` is a LINK here, and that is a recorded divergence
 *
 * `awcms` ADR-0110 lets ITS operator admit `youtube-nocookie.com` to
 * `frame-src`. This repo refuses an embed on every deployment with no switch —
 * [ADR-0046](../../docs/adr/0046-a-video-embed-is-refused-here-and-that-is-a-divergence-not-an-omission.md).
 * The rendering is delegated to `content-blocks.ts` so the two body formats
 * cannot drift into two different answers about it.
 *
 * ## The vocabulary is PINNED, because this file has been wrong before
 *
 * `content-blocks.ts`'s header records what happened the first time this repo
 * re-derived awcms's block vocabulary from prose: it invented an
 * `ordered_list` type, and silently dropped `gallery` and `video_news` because
 * neither carries a `text` field. **The two block types that carried media were
 * the two that vanished from the page.** Nothing failed.
 *
 * awcms's own `portable-text.ts` now welds each of its five vocabularies to its
 * union with a mutual-assignability assertion for that exact reason. The five
 * constants below mirror them and are held to those values by
 * `tests/portable-text.test.mjs`.
 */
import {
  escapeHtml,
  renderGallery,
  renderPlaceholder,
  renderVideoNews,
  type Block,
  type MediaTerresolusi
} from "./content-blocks";

/* ------------------------------------------------------- the vocabularies */

/** awcms `PORTABLE_TEXT_NODE_TYPES`. */
export const PORTABLE_TEXT_NODE_TYPES: readonly string[] = [
  "block",
  "gallery",
  "videoNews"
];

/** awcms `PORTABLE_TEXT_BLOCK_STYLES`. */
export const PORTABLE_TEXT_BLOCK_STYLES: readonly string[] = [
  "normal",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote"
];

/** awcms `PORTABLE_TEXT_LIST_ITEMS`. */
export const PORTABLE_TEXT_LIST_ITEMS: readonly string[] = ["bullet", "number"];

/** awcms `PORTABLE_TEXT_DECORATORS`. `underline` is absent on purpose — see the header. */
export const PORTABLE_TEXT_DECORATORS: readonly string[] = [
  "strong",
  "em",
  "code"
];

/** awcms `PORTABLE_TEXT_ANNOTATION_TYPES`. */
export const PORTABLE_TEXT_ANNOTATION_TYPES: readonly string[] = ["link"];

/** awcms `PORTABLE_TEXT_ALLOWED_LINK_SCHEMES`. */
export const PORTABLE_TEXT_ALLOWED_LINK_SCHEMES: readonly string[] = [
  "http:",
  "https:",
  "mailto:",
  "tel:"
];

/**
 * The empty resolution map, so `media` is never `undefined` at a call site.
 *
 * A `ReadonlyMap` for the same reason `content-blocks.ts` uses one: an id that
 * is not here is one awcms reported as unresolved, and inventing an entry would
 * turn "this image is gone" into a broken `<img>`.
 */
const TANPA_MEDIA: MediaTerresolusi = new Map();

/* -------------------------------------------------------------- the types */

export type PortableTextSpan = {
  _type?: string;
  text?: unknown;
  marks?: unknown;
};

export type PortableTextNode = {
  _type?: string;
  style?: unknown;
  listItem?: unknown;
  level?: unknown;
  children?: unknown;
  markDefs?: unknown;
  [key: string]: unknown;
};

/** The whole body: a bare array. The envelope lives elsewhere (`content_json`). */
export type PortableTextDocument = PortableTextNode[];

/* ------------------------------------------------------------ the mapping */

/**
 * `h1`–`h6` clamped into `h2`–`h4`, the same window `content-blocks.ts` allows.
 *
 * An article BODY must not emit `h1`: the page title owns it, and a second one
 * makes the document outline claim there are two articles on the page. `h5`/`h6`
 * collapse to `h4` rather than rendering, because a heading level nobody styles
 * reads as body text with a different font size.
 */
const TAG_JUDUL: Record<string, string> = {
  h1: "h2",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h4",
  h6: "h4"
};

/**
 * `href` that may go into the output, or `null`.
 *
 * PARSED, never pattern-matched. awcms performs the same check at write time
 * with `URL`, and its own comment says why: a regex over the raw string is how
 * `java\nscript:` and `JaVaScRiPt:` get through, and `URL` normalises both.
 *
 * A relative or root-relative URL is allowed and is the common case for an
 * internal link, so parsing is attempted against a base before being refused.
 */
function safeHref(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;

  const raw = value.trim();

  // A root-relative or relative link never carries a scheme, so it cannot carry
  // a dangerous one. Parsed against a dummy base only to reject a value that is
  // not a URL at all.
  if (raw.startsWith("/") || raw.startsWith("#") || raw.startsWith("?")) {
    try {
      new URL(raw, "https://contoh.invalid");
      return raw;
    } catch {
      return null;
    }
  }

  try {
    const url = new URL(raw);
    return PORTABLE_TEXT_ALLOWED_LINK_SCHEMES.includes(url.protocol) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * One span, with its decorators and annotations wrapped around it.
 *
 * `marks` names decorators (`strong`) AND annotation `_key`s in one array,
 * which is what Portable Text does. Anything in it that is neither is DROPPED —
 * the closed vocabulary is enforced at awcms's write time, and rendering an
 * unknown mark as a tag here would be this repo re-opening what that closure
 * bought.
 */
function renderSpan(span: PortableTextSpan, anotasi: Map<string, string>): string {
  const teks = escapeHtml(typeof span.text === "string" ? span.text : "");
  if (teks.length === 0) return "";

  const marks = Array.isArray(span.marks) ? span.marks : [];
  let keluaran = teks;

  // Decorators innermost, in a FIXED order, so the same span always produces
  // the same bytes. Iterating `marks` in its own order would make the output
  // depend on the order an editor happened to click two buttons.
  if (marks.includes("code")) keluaran = `<code>${keluaran}</code>`;
  if (marks.includes("em")) keluaran = `<em>${keluaran}</em>`;
  if (marks.includes("strong")) keluaran = `<strong>${keluaran}</strong>`;

  // The link wraps the decorators, never the reverse: a link inside a <strong>
  // and a <strong> inside a link render identically, but only one of them keeps
  // the whole phrase clickable when two adjacent spans share the annotation.
  for (const mark of marks) {
    if (typeof mark !== "string") continue;

    const href = anotasi.get(mark);
    if (href === undefined) continue;

    // `rel` on every outbound link, for the same reason `ShareButtons` carries
    // it: a target this repo does not control must not get a `window.opener`.
    return `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${keluaran}</a>`;
  }

  return keluaran;
}

/** `markDefs` → `_key` → a safe href. An annotation whose href is refused is simply absent. */
function petaAnotasi(node: PortableTextNode): Map<string, string> {
  const peta = new Map<string, string>();
  const defs = Array.isArray(node.markDefs) ? node.markDefs : [];

  for (const def of defs) {
    if (!def || typeof def !== "object") continue;

    const rec = def as Record<string, unknown>;
    if (rec._type !== "link") continue;
    if (typeof rec._key !== "string") continue;

    const href = safeHref(rec.href);
    if (href !== null) peta.set(rec._key, href);
  }

  return peta;
}

/** Every child span of one block, concatenated. */
function isiBlok(node: PortableTextNode): string {
  const anotasi = petaAnotasi(node);
  const children = Array.isArray(node.children) ? node.children : [];

  return children
    .filter((c): c is PortableTextSpan => Boolean(c) && typeof c === "object")
    .map((c) => renderSpan(c, anotasi))
    .join("");
}

/**
 * A run of consecutive list items at one nesting level, as `<ul>` or `<ol>`.
 *
 * Portable Text models a list as a FLAT run of blocks that each carry
 * `listItem` and `level` — there is no list container node. Rebuilding the
 * container is therefore the consumer's job, and getting it wrong produces one
 * `<ul>` per bullet: valid HTML, visually almost right, and read aloud by a
 * screen reader as "list of one item" once per line.
 */
function renderDaftar(
  nodes: PortableTextNode[],
  mulai: number
): { html: string; berikutnya: number } {
  const jenis = nodes[mulai]!.listItem === "number" ? "ol" : "ul";
  const level = tingkat(nodes[mulai]!);

  // Item inner-HTML WITHOUT its `<li>` wrapper, so a nested run can still be
  // appended INSIDE the item it belongs to. Wrapping as we go produced
  // `<li>Induk</li><ul>…</ul>` — a sibling list, which renders almost
  // identically and is invisible to assistive technology.
  const butir: string[] = [];
  let i = mulai;

  while (i < nodes.length) {
    const node = nodes[i]!;
    if (node._type !== "block" || !isListItem(node)) break;

    const jenisIni = node.listItem === "number" ? "ol" : "ul";
    const levelIni = tingkat(node);

    // A shallower item, or a different kind at the same depth, ends this list.
    if (levelIni < level || (levelIni === level && jenisIni !== jenis)) break;

    if (levelIni > level) {
      const bersarang = renderDaftar(nodes, i);

      if (butir.length > 0) {
        butir[butir.length - 1] += bersarang.html;
      } else {
        // A run that opens deeper than its parent has no item to nest into.
        // Kept as its own item rather than dropped: the words are the part
        // that matters, and the shape is the editor's mistake, not the
        // reader's.
        butir.push(bersarang.html);
      }

      i = bersarang.berikutnya > i ? bersarang.berikutnya : i + 1;
      continue;
    }

    butir.push(isiBlok(node));
    i += 1;
  }

  if (butir.length === 0) return { html: "", berikutnya: i };

  const isi = butir.map((b) => `<li>${b}</li>`).join("");
  return { html: `<${jenis}>${isi}</${jenis}>`, berikutnya: i };
}

function isListItem(node: PortableTextNode): boolean {
  return (
    typeof node.listItem === "string" &&
    PORTABLE_TEXT_LIST_ITEMS.includes(node.listItem)
  );
}

/** `level`, 1-based, defaulting to 1. A non-number is treated as absent, not as 0. */
function tingkat(node: PortableTextNode): number {
  return typeof node.level === "number" && Number.isFinite(node.level) && node.level >= 1
    ? Math.floor(node.level)
    : 1;
}

/** One prose block — paragraph, heading, or blockquote. */
function renderBlok(node: PortableTextNode): string {
  const isi = isiBlok(node);
  if (isi.length === 0) return "";

  const style = typeof node.style === "string" ? node.style : "normal";

  if (style === "blockquote") return `<blockquote><p>${isi}</p></blockquote>`;

  const tag = TAG_JUDUL[style];
  if (tag) return `<${tag}>${isi}</${tag}>`;

  // `normal`, and anything the closed vocabulary does not name. An unknown
  // style renders its TEXT as a paragraph rather than vanishing: the words an
  // editor wrote are the part that matters, and a body that silently loses a
  // paragraph is the failure `content-blocks.ts` already shipped once.
  return `<p>${isi}</p>`;
}

/**
 * Render a Portable Text document to HTML.
 *
 * `media` maps `mediaObjectId` to a resolved object, built once per build in
 * `content.ts`. This module stays PURE — it renders what it is given and
 * performs no I/O — which is what lets the whole vocabulary be tested without a
 * network.
 */
export function renderPortableText(
  document: unknown,
  media: MediaTerresolusi = TANPA_MEDIA
): string {
  if (!Array.isArray(document)) return "";

  const nodes = document.filter(
    (n): n is PortableTextNode => Boolean(n) && typeof n === "object" && !Array.isArray(n)
  );

  const keluaran: string[] = [];
  let i = 0;

  while (i < nodes.length) {
    const node = nodes[i]!;

    if (node._type === "block" && isListItem(node)) {
      const daftar = renderDaftar(nodes, i);
      keluaran.push(daftar.html);
      // A run that produced nothing must still advance, or this loop spins.
      i = daftar.berikutnya > i ? daftar.berikutnya : i + 1;
      continue;
    }

    i += 1;

    if (node._type === "block") {
      keluaran.push(renderBlok(node));
      continue;
    }

    // Both object blocks are delegated, so the two body formats cannot drift
    // into two different answers about a gallery placeholder or about whether a
    // video is embedded (ADR-0046). Their payloads are byte-identical to the
    // old union's by awcms's own design.
    if (node._type === "gallery") {
      keluaran.push(renderGallery(node as unknown as Block, media));
      continue;
    }

    if (node._type === "videoNews") {
      keluaran.push(renderVideoNews(node as unknown as Block));
      continue;
    }

    // An unknown `_type` cannot normally reach here — awcms refuses it at write
    // time — so this is defence against an awcms newer than this renderer. It
    // renders something VISIBLE rather than nothing, because a body that
    // silently loses a block is exactly the defect this file's sibling shipped.
    keluaran.push(
      renderPlaceholder(
        `Blok "${typeof node._type === "string" ? node._type : "tanpa tipe"}" belum bisa ditampilkan.`
      )
    );
  }

  return keluaran.filter(Boolean).join("");
}

/**
 * Every `mediaObjectId` a document's gallery nodes reference.
 *
 * Deliberately tolerant of shape, like its `content-blocks.ts` counterpart:
 * this arrives from jsonb, and a body written before a validator was tightened
 * must not throw inside a build.
 */
export function idGaleriPortableText(document: unknown): string[] {
  if (!Array.isArray(document)) return [];

  const ids: string[] = [];

  for (const node of document) {
    if (!node || typeof node !== "object") continue;

    const rec = node as Record<string, unknown>;
    if (rec._type !== "gallery" || !Array.isArray(rec.items)) continue;

    for (const item of rec.items) {
      if (!item || typeof item !== "object") continue;

      const id = (item as Record<string, unknown>).mediaObjectId;
      if (typeof id === "string" && id.length > 0) ids.push(id);
    }
  }

  return ids;
}
