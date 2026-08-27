/**
 * The canonical body renderer — `src/lib/portable-text.ts`.
 *
 * Two things can go wrong here and neither raises an error, which is exactly
 * what happened to this file's older sibling:
 *
 *   1. **Drift.** The vocabulary is defined in awcms and re-implemented here.
 *      `content-blocks.ts` got it wrong three ways at once the first time —
 *      it invented an `ordered_list` type, and silently dropped `gallery` and
 *      `video_news` because neither carries a `text` field, so the two block
 *      types that carried MEDIA were the two that vanished from the page.
 *      Nothing failed. awcms now welds each of its five vocabularies to its
 *      union with a mutual-assignability assertion for that reason; this file
 *      is the equivalent on this side.
 *   2. **Injection.** Every guarantee this renderer makes rests on the claim
 *      that nothing reaches the output except through `escapeHtml` and a fixed
 *      tag. That claim needs adversarial input, not sunny-day input.
 *
 * A third thing is new to this format and has no counterpart in the old one:
 * **inline structure**. A run of list items is a FLAT sequence of blocks with
 * no container node, so rebuilding `<ul>` is the consumer's job — and getting
 * it wrong produces one `<ul>` per bullet, which is valid HTML, looks almost
 * right, and is read aloud as "list of one item" once per line.
 *
 * Run with `bun test`.
 */
import { test, describe } from "bun:test";
import assert from "node:assert/strict";

import {
  PORTABLE_TEXT_ALLOWED_LINK_SCHEMES,
  PORTABLE_TEXT_ANNOTATION_TYPES,
  PORTABLE_TEXT_BLOCK_STYLES,
  PORTABLE_TEXT_DECORATORS,
  PORTABLE_TEXT_LIST_ITEMS,
  PORTABLE_TEXT_NODE_TYPES,
  idGaleriPortableText,
  renderPortableText
} from "../src/lib/portable-text.ts";

let kunci = 0;

/** One span. `marks` names decorators and/or annotation `_key`s, as Portable Text does. */
function span(text, marks = []) {
  kunci += 1;
  return { _type: "span", _key: `s${kunci}`, text, marks };
}

/** One prose block. */
function blok(children, extra = {}) {
  kunci += 1;
  return {
    _type: "block",
    _key: `b${kunci}`,
    style: "normal",
    children: Array.isArray(children) ? children : [span(children)],
    markDefs: [],
    ...extra
  };
}

describe("vocabulary", () => {
  test("matches awcms's five closed vocabularies exactly", () => {
    // Pinned to awcms's `blog-content/domain/portable-text.ts`. If awcms adds a
    // node type, a style, a list kind, a decorator or an annotation, this fails
    // and someone teaches the renderer about it — rather than the addition
    // quietly rendering as a placeholder on a live site.
    assert.deepEqual([...PORTABLE_TEXT_NODE_TYPES], ["block", "gallery", "videoNews"]);
    assert.deepEqual(
      [...PORTABLE_TEXT_BLOCK_STYLES],
      ["normal", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"]
    );
    assert.deepEqual([...PORTABLE_TEXT_LIST_ITEMS], ["bullet", "number"]);
    assert.deepEqual([...PORTABLE_TEXT_DECORATORS], ["strong", "em", "code"]);
    assert.deepEqual([...PORTABLE_TEXT_ANNOTATION_TYPES], ["link"]);
    assert.deepEqual(
      [...PORTABLE_TEXT_ALLOWED_LINK_SCHEMES],
      ["http:", "https:", "mailto:", "tel:"]
    );
  });

  test("`underline` is NOT a decorator, and that is a decision", () => {
    // An underlined span that is not a link is a usability defect, and offering
    // it guarantees it gets used for emphasis. awcms rejected it explicitly;
    // this asserts the refusal rather than leaving it to be re-litigated.
    assert.ok(!PORTABLE_TEXT_DECORATORS.includes("underline"));

    const html = renderPortableText([blok([span("digarisbawahi", ["underline"])])]);
    assert.equal(html, "<p>digarisbawahi</p>");
  });
});

describe("inline structure — the whole reason this format exists", () => {
  test("bold, italic and code render as marks rather than flattening", () => {
    // The deficit this file closes. Under the old projection all three of these
    // came out as plain text, because the vocabulary it rendered had no place
    // for a mark at all.
    const html = renderPortableText([
      blok([
        span("Biasa "),
        span("tebal", ["strong"]),
        span(" dan "),
        span("miring", ["em"]),
        span(" dan "),
        span("kode", ["code"])
      ])
    ]);

    assert.equal(
      html,
      "<p>Biasa <strong>tebal</strong> dan <em>miring</em> dan <code>kode</code></p>"
    );
  });

  test("marks nest in a FIXED order, so one span always renders the same bytes", () => {
    // Iterating `marks` in its own order would make the output depend on the
    // order an editor happened to click two buttons — a diff in `dist/` with no
    // change in the content.
    const a = renderPortableText([blok([span("x", ["strong", "em", "code"])])]);
    const b = renderPortableText([blok([span("x", ["code", "em", "strong"])])]);

    assert.equal(a, b);
    assert.equal(a, "<p><strong><em><code>x</code></em></strong></p>");
  });

  test("an inline link renders, and carries rel on the way out", () => {
    kunci += 1;
    const node = blok([span("Baca "), span("aturannya", ["k1"])], {
      markDefs: [{ _type: "link", _key: "k1", href: "https://contoh.test/a" }]
    });

    const html = renderPortableText([node]);
    assert.equal(
      html,
      '<p>Baca <a href="https://contoh.test/a" rel="noopener noreferrer">aturannya</a></p>'
    );
  });

  test("a link WRAPS its decorators rather than the reverse", () => {
    const node = blok([span("tebal dan tertaut", ["strong", "k1"])], {
      markDefs: [{ _type: "link", _key: "k1", href: "/panduan/" }]
    });

    assert.equal(
      renderPortableText([node]),
      '<p><a href="/panduan/" rel="noopener noreferrer"><strong>tebal dan tertaut</strong></a></p>'
    );
  });
});

describe("links that must not render", () => {
  for (const jahat of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java\nscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)"
  ]) {
    test(`\`${jahat.slice(0, 24).replace(/\n/g, "\\n")}\` renders as plain text`, () => {
      const node = blok([span("klik", ["k1"])], {
        markDefs: [{ _type: "link", _key: "k1", href: jahat }]
      });

      const html = renderPortableText([node]);

      // The words survive; the link does not. Dropping the text too would lose
      // content because of an editor's mistake.
      assert.equal(html, "<p>klik</p>");
      assert.doesNotMatch(html, /<a /);
    });
  }

  test("mailto and tel DO render — a newsroom's contact line needs them", () => {
    for (const href of ["mailto:redaksi@contoh.test", "tel:+6281234567890"]) {
      const node = blok([span("hubungi", ["k1"])], {
        markDefs: [{ _type: "link", _key: "k1", href }]
      });

      // `toContain`, not a RegExp: `tel:+62…` carries a `+`, which a regex
      // reads as a quantifier — the assertion would then pass or fail for a
      // reason that has nothing to do with the renderer.
      assert.ok(
        renderPortableText([node]).includes(`href="${href}"`),
        `href tidak muncul apa adanya untuk ${href}`
      );
    }
  });
});

describe("escaping", () => {
  test("markup in span text is escaped in every block style", () => {
    const payload = '</p><script>alert(1)</script>';

    for (const style of PORTABLE_TEXT_BLOCK_STYLES) {
      const html = renderPortableText([blok([span(payload)], { style })]);

      assert.doesNotMatch(html, /<\s*\/?\s*script/i, `unescaped in ${style}`);
      assert.match(html, /&lt;script&gt;/);
    }
  });

  test("markup in a link href is escaped in the attribute", () => {
    const node = blok([span("x", ["k1"])], {
      markDefs: [{ _type: "link", _key: "k1", href: 'https://contoh.test/"><img src=x' }]
    });

    const html = renderPortableText([node]);
    assert.doesNotMatch(html, /<img/);
    assert.match(html, /&quot;/);
  });
});

describe("headings", () => {
  test("h1 is clamped to h2 — the page title owns the only h1", () => {
    assert.equal(renderPortableText([blok("Judul", { style: "h1" })]), "<h2>Judul</h2>");
  });

  test("h5 and h6 collapse to h4 rather than rendering unstyled", () => {
    assert.equal(renderPortableText([blok("A", { style: "h5" })]), "<h4>A</h4>");
    assert.equal(renderPortableText([blok("B", { style: "h6" })]), "<h4>B</h4>");
  });

  test("blockquote wraps a paragraph, so its inner spans stay markable", () => {
    assert.equal(
      renderPortableText([blok("Kutipan", { style: "blockquote" })]),
      "<blockquote><p>Kutipan</p></blockquote>"
    );
  });
});

describe("lists — the container this format does not carry", () => {
  test("a run of bullets becomes ONE ul, not one per item", () => {
    // The defect this guards: one `<ul>` per bullet is valid HTML, looks almost
    // right, and is read aloud as "list of one item" once per line.
    const html = renderPortableText([
      blok("Satu", { listItem: "bullet", level: 1 }),
      blok("Dua", { listItem: "bullet", level: 1 }),
      blok("Tiga", { listItem: "bullet", level: 1 })
    ]);

    assert.equal(html, "<ul><li>Satu</li><li>Dua</li><li>Tiga</li></ul>");
  });

  test("`number` produces ol — the field decides, not a separate node type", () => {
    const html = renderPortableText([
      blok("Satu", { listItem: "number", level: 1 }),
      blok("Dua", { listItem: "number", level: 1 })
    ]);

    assert.equal(html, "<ol><li>Satu</li><li>Dua</li></ol>");
  });

  test("a deeper level nests INSIDE the item above it", () => {
    // Appending a nested run as a SIBLING renders almost identically and is
    // invisible to assistive technology, which is why this is asserted on the
    // exact bytes.
    const html = renderPortableText([
      blok("Induk", { listItem: "bullet", level: 1 }),
      blok("Anak", { listItem: "bullet", level: 2 }),
      blok("Induk lagi", { listItem: "bullet", level: 1 })
    ]);

    assert.equal(
      html,
      "<ul><li>Induk<ul><li>Anak</li></ul></li><li>Induk lagi</li></ul>"
    );
  });

  test("a bullet run and a number run at one level do not merge", () => {
    const html = renderPortableText([
      blok("A", { listItem: "bullet", level: 1 }),
      blok("B", { listItem: "number", level: 1 })
    ]);

    assert.equal(html, "<ul><li>A</li></ul><ol><li>B</li></ol>");
  });

  test("a paragraph after a list ends the list", () => {
    const html = renderPortableText([
      blok("A", { listItem: "bullet", level: 1 }),
      blok("Prosa")
    ]);

    assert.equal(html, "<ul><li>A</li></ul><p>Prosa</p>");
  });

  test("list marks render inside the item", () => {
    const html = renderPortableText([
      blok([span("penting", ["strong"])], { listItem: "bullet", level: 1 })
    ]);

    assert.equal(html, "<ul><li><strong>penting</strong></li></ul>");
  });
});

describe("object blocks are delegated, so the two formats cannot disagree", () => {
  test("videoNews renders as a LINK, never an iframe (ADR-0046)", () => {
    const html = renderPortableText([
      {
        _type: "videoNews",
        _key: "v1",
        provider: "youtube",
        videoId: "dQw4w9WgXcQ",
        title: "Rekaman sidang"
      }
    ]);

    assert.doesNotMatch(html, /<iframe/i);
    assert.match(html, /youtube\.com\/watch\?v=dQw4w9WgXcQ/);
    assert.match(html, /Rekaman sidang/);
  });

  test("a gallery item resolves through the SAME media map as an article image", () => {
    const media = new Map([
      [
        "m1",
        { publicUrl: "https://media.test/a.webp", altText: "Foto", width: 800, height: 450 }
      ]
    ]);

    const html = renderPortableText(
      [{ _type: "gallery", _key: "g1", items: [{ mediaObjectId: "m1" }] }],
      media
    );

    assert.match(html, /https:\/\/media\.test\/a\.webp/);
    assert.match(html, /alt="Foto"/);
  });

  test("an unresolvable gallery item renders a labelled placeholder, not nothing", () => {
    const html = renderPortableText([
      { _type: "gallery", _key: "g1", items: [{ mediaObjectId: "hilang" }] }
    ]);

    assert.notEqual(html.trim(), "");
    assert.doesNotMatch(html, /<img/);
  });
});

describe("shapes that must not throw", () => {
  test("a non-array document renders empty rather than throwing", () => {
    for (const buruk of [undefined, null, "", 0, {}, { blocks: [] }]) {
      assert.equal(renderPortableText(buruk), "");
    }
  });

  test("an unknown node type renders something VISIBLE", () => {
    // Cannot normally reach here — awcms refuses an unknown `_type` at write
    // time — so this is defence against an awcms newer than this renderer. A
    // body that silently loses a block is the defect its sibling shipped once.
    const html = renderPortableText([{ _type: "kalenderRapat", _key: "x" }]);

    assert.notEqual(html.trim(), "");
    assert.match(html, /kalenderRapat/);
  });

  test("a block with no children contributes nothing rather than an empty tag", () => {
    assert.equal(renderPortableText([blok([])]), "");
  });

  test("a malformed list run still terminates", () => {
    // A guard against the loop that does not advance. If `renderDaftar` ever
    // returns without consuming an item, this hangs instead of failing — so it
    // is asserted with a body that produces no items at all.
    const html = renderPortableText([
      blok([], { listItem: "bullet", level: 1 }),
      blok([], { listItem: "bullet", level: 1 }),
      blok("Setelahnya")
    ]);

    assert.match(html, /Setelahnya/);
  });
});

describe("gallery ids for the build's single media batch", () => {
  test("ids are collected from the CANONICAL body, not only the projection", () => {
    // Collecting only from `contentJson.blocks` would resolve every gallery an
    // un-backfilled row has and none that a backfilled one has — a site whose
    // galleries work until the day its content is migrated.
    const ids = idGaleriPortableText([
      { _type: "gallery", _key: "g1", items: [{ mediaObjectId: "a" }, { url: "https://x/y.png" }] },
      blok("prosa"),
      { _type: "gallery", _key: "g2", items: [{ mediaObjectId: "b" }] }
    ]);

    assert.deepEqual(ids, ["a", "b"]);
  });

  test("a malformed document yields no ids rather than throwing", () => {
    for (const buruk of [undefined, null, {}, [null], [{ _type: "gallery", items: "x" }]]) {
      assert.deepEqual(idGaleriPortableText(buruk), []);
    }
  });
});
