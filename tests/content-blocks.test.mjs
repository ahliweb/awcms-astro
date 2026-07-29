/**
 * The block renderer is the one place where content authored by someone else,
 * in another repo, becomes HTML on this site. Two things can go wrong there and
 * neither raises an error:
 *
 *   1. **Drift.** The vocabulary is defined in awcms and re-implemented here.
 *      When they disagree, a block renders wrongly or not at all — and the
 *      build is green either way. This file already shipped with three such
 *      disagreements (see `content-blocks.ts`'s header); these tests exist
 *      because reviewing the code did not catch them.
 *   2. **Injection.** Every guarantee this renderer makes rests on the claim
 *      that nothing reaches the output except through `escapeHtml` and a fixed
 *      tag. That claim needs adversarial input, not sunny-day input.
 *
 * Run with `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";

import {
  AWCMS_BLOCK_TYPES,
  escapeHtml,
  renderContentBlocks
} from "../src/lib/content-blocks.ts";

function render(...blocks) {
  return renderContentBlocks({ blocks });
}

describe("vocabulary", () => {
  test("matches awcms's ContentBlock union exactly", () => {
    // Pinned to awcms's `blog-content/domain/content-block-rendering.ts`. If
    // awcms adds a type, this fails and someone teaches the renderer about it —
    // rather than the type quietly rendering as a placeholder on a live site.
    assert.deepEqual([...AWCMS_BLOCK_TYPES].sort(), [
      "gallery",
      "heading",
      "list",
      "paragraph",
      "quote",
      "video_news"
    ]);
  });

  test("every declared type renders something non-empty", () => {
    // The bug this catches is the one that shipped: `gallery` and `video_news`
    // fell through to the paragraph branch, which returns "" for a block with
    // no `text` field — so the two block types carrying media were the two that
    // disappeared. A type in the vocabulary that renders nothing is a hole.
    const samples = {
      paragraph: { type: "paragraph", text: "Halo" },
      heading: { type: "heading", level: 2, text: "Judul" },
      list: { type: "list", items: ["satu"] },
      quote: { type: "quote", text: "Kutipan" },
      gallery: { type: "gallery", items: [{ url: "https://x.test/a.jpg" }] },
      video_news: {
        type: "video_news",
        provider: "youtube",
        videoId: "abcdefghijk"
      }
    };

    for (const type of AWCMS_BLOCK_TYPES) {
      assert.ok(samples[type], `no sample for declared type "${type}"`);
      assert.notEqual(render(samples[type]), "", `"${type}" rendered nothing`);
    }
  });
});

describe("list", () => {
  test("ordering is a FIELD, not a separate type", () => {
    // awcms emits `{ type: "list", ordered: true }`. The first version of this
    // renderer looked for a `ordered_list` type that awcms never emits, so
    // every numbered list came out bulleted with nothing to indicate it.
    assert.match(render({ type: "list", ordered: true, items: ["a"] }), /^<ol>/);
    assert.match(
      render({ type: "list", ordered: false, items: ["a"] }),
      /^<ul>/
    );
    assert.match(render({ type: "list", items: ["a"] }), /^<ul>/);
  });

  test("a type awcms never emits is not silently treated as a list", () => {
    const html = render({ type: "ordered_list", items: ["a"] });
    assert.doesNotMatch(html, /<ol>/);
    assert.match(html, /belum didukung/);
  });

  test("empty and non-string items are dropped, not rendered as blanks", () => {
    assert.equal(render({ type: "list", items: [] }), "");
    assert.equal(render({ type: "list", items: ["  ", null, 42] }), "");
  });
});

describe("gallery", () => {
  test("an item with a direct URL renders an image", () => {
    const html = render({
      type: "gallery",
      items: [{ url: "https://media.test/a.jpg", caption: "Keterangan" }]
    });

    assert.match(html, /<img src="https:\/\/media\.test\/a\.jpg"/);
    assert.match(html, /alt="Keterangan"/);
    assert.match(html, /<figcaption>Keterangan<\/figcaption>/);
  });

  test("an unresolvable registry id renders a visible placeholder, not nothing", () => {
    // This site cannot resolve a `mediaObjectId` — that needs a media endpoint
    // it does not call. Rendering nothing would make the gap invisible until a
    // reader found it; a placeholder makes it a page-review finding.
    const html = render({
      type: "gallery",
      items: [{ mediaObjectId: "11111111-1111-1111-1111-111111111111" }]
    });

    assert.match(html, /blok-tak-tersedia/);
    assert.notEqual(html, "");
  });

  test("a javascript: URL never reaches src", () => {
    const html = render({
      type: "gallery",
      items: [{ url: "javascript:alert(1)" }]
    });

    assert.doesNotMatch(html, /javascript:/);
    assert.match(html, /blok-tak-tersedia/);
  });

  test("a data: URL never reaches src", () => {
    const html = render({
      type: "gallery",
      items: [{ url: "data:text/html,<script>alert(1)</script>" }]
    });

    assert.doesNotMatch(html, /data:/);
    assert.doesNotMatch(html, /<script>/);
  });

  test("an empty gallery says so rather than collapsing", () => {
    assert.match(render({ type: "gallery", items: [] }), /Galeri kosong/);
  });
});

describe("video_news", () => {
  test("renders a link, never an embed", () => {
    // An embedded player is a third-party surface that sees the reader before
    // the reader chose to watch anything — the exact thing AGENTS.md §Keamanan
    // rules out. awcms embeds because it serves a different product.
    const html = render({
      type: "video_news",
      provider: "youtube",
      videoId: "dQw4w9WgXcQ",
      title: "Judul video"
    });

    assert.doesNotMatch(html, /<iframe/);
    assert.match(html, /<a href="https:\/\/www\.youtube\.com\/watch\?v=dQw4w9WgXcQ"/);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.match(html, />Judul video</);
  });

  test("an unknown provider is not guessed at", () => {
    const html = render({
      type: "video_news",
      provider: "vimeo",
      videoId: "123456",
      title: "Judul"
    });

    assert.doesNotMatch(html, /<a href/);
    assert.match(html, /blok-tak-tersedia/);
  });

  test("a malformed video id never goes into a URL", () => {
    // The id lands inside an href. An unvalidated one is a link to somewhere
    // nobody chose — and `../` or a full URL in that field would leave the
    // intended host entirely.
    for (const videoId of [
      "short",
      "../../evil",
      "https://evil.test/x",
      "abcdefghijk!"
    ]) {
      const html = render({
        type: "video_news",
        provider: "youtube",
        videoId
      });

      assert.doesNotMatch(html, /<a href/, `id "${videoId}" produced a link`);
    }
  });
});

describe("escaping", () => {
  test("markup in text is escaped everywhere text appears", () => {
    const payload = '<script>alert("x")</script>';

    for (const block of [
      { type: "paragraph", text: payload },
      { type: "heading", level: 2, text: payload },
      { type: "quote", text: payload },
      { type: "list", items: [payload] }
    ]) {
      const html = render(block);
      assert.doesNotMatch(html, /<script>/, `unescaped in ${block.type}`);
      assert.match(html, /&lt;script&gt;/);
    }
  });

  test("markup in a gallery caption is escaped in BOTH the alt attribute and the figcaption", () => {
    const html = render({
      type: "gallery",
      items: [{ url: "https://media.test/a.jpg", caption: '"><img onerror=x>' }]
    });

    assert.doesNotMatch(html, /onerror=x>/);
    assert.match(html, /&quot;&gt;&lt;img/);
  });

  test("markup in a video title is escaped", () => {
    const html = render({
      type: "video_news",
      provider: "youtube",
      videoId: "dQw4w9WgXcQ",
      title: '</a><script>alert(1)</script>'
    });

    assert.doesNotMatch(html, /<script>/);
  });

  test("escapeHtml covers every character the renderer relies on it for", () => {
    assert.equal(
      escapeHtml(`&<>"'`),
      "&amp;&lt;&gt;&quot;&#39;"
    );
  });
});

describe("shape tolerance", () => {
  test("missing or malformed contentJson yields an empty string, never a throw", () => {
    assert.equal(renderContentBlocks(undefined), "");
    assert.equal(renderContentBlocks({}), "");
    assert.equal(renderContentBlocks({ blocks: null }), "");
    assert.equal(renderContentBlocks({ blocks: "not an array" }), "");
  });

  test("a null block does not take the whole article down", () => {
    const html = renderContentBlocks({
      blocks: [null, { type: "paragraph", text: "Selamat" }]
    });

    assert.match(html, /Selamat/);
  });

  test("a heading level outside 2-4 is clamped, never emitted raw", () => {
    // `<h1>` belongs to the page title alone; a content-authored one gives the
    // document two top-level headings and breaks the outline for screen readers.
    for (const level of [1, 5, 6, 0, -1, 99, "2"]) {
      const html = render({ type: "heading", level, text: "Judul" });
      assert.match(html, /^<h[234]>/, `level ${level} was not clamped`);
    }
  });
});
