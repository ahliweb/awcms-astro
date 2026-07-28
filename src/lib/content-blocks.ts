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
 * The block vocabulary matches awcms's own whitelist. If awcms adds a type,
 * this renderer will pass it through as an escaped paragraph rather than
 * dropping it silently — a visible, plain rendering of unknown content beats a
 * page that quietly loses a section.
 */

type Block = {
  type?: string;
  text?: string;
  level?: number;
  items?: unknown[];
  [key: string]: unknown;
};

const ALLOWED_HEADING_LEVELS = new Set([2, 3, 4]);

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderList(block: Block, ordered: boolean): string {
  const items = Array.isArray(block.items) ? block.items : [];
  const tag = ordered ? "ol" : "ul";
  const rendered = items
    .map((item) => `<li>${escapeHtml(String(item ?? ""))}</li>`)
    .join("");
  return `<${tag}>${rendered}</${tag}>`;
}

function renderBlock(block: Block): string {
  const text = escapeHtml(String(block.text ?? ""));

  switch (block.type) {
    case "heading": {
      // An out-of-range level is clamped rather than trusted. `<h1>` belongs to
      // the page title alone; a content-authored `<h1>` would give the document
      // two top-level headings and break the outline for screen readers.
      const level =
        typeof block.level === "number" && ALLOWED_HEADING_LEVELS.has(block.level)
          ? block.level
          : 2;
      return `<h${level}>${text}</h${level}>`;
    }
    case "list":
      return renderList(block, false);
    case "ordered_list":
      return renderList(block, true);
    case "quote":
      return `<blockquote><p>${text}</p></blockquote>`;
    case "paragraph":
    default:
      // Unknown types land here deliberately — see this file's header.
      return text ? `<p>${text}</p>` : "";
  }
}

/**
 * `contentJson` -> HTML string, ready for `set:html`.
 *
 * `set:html` is safe here precisely because every character above came out of
 * `escapeHtml`. Do not feed this function's output anything it did not build.
 */
export function renderContentBlocks(
  contentJson: Record<string, unknown> | undefined
): string {
  const blocks = contentJson?.blocks;

  if (!Array.isArray(blocks)) {
    return "";
  }

  return blocks
    .map((block) => renderBlock((block ?? {}) as Block))
    .filter(Boolean)
    .join("\n");
}
