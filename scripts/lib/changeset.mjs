/**
 * changeset.mjs — reading a `.changesets/*.md` entry and its frontmatter.
 *
 * ## Why this file exists
 *
 * Until this module, every field a changeset declared was **write-only**.
 * `.changesets/README.md` documented `tipe` and `dampak`, ten changesets filled
 * them in, and nothing on earth read them: `rilis.mjs` stripped the whole
 * frontmatter block with one regex and threw it away, and no gate looked at
 * `.changesets/` for anything except dead links. A field nobody reads is a field
 * that is wrong as often as it is right, and nobody finds out.
 *
 * At the same time the thing that actually decided the release — `major`,
 * `minor` or `patch` — was typed on the command line at release time by whoever
 * ran the script, months after the change was written and by someone who might
 * not be its author. The person who knew whether a change broke public URLs had
 * no way to record it, and the person who chose the number had no way to know.
 *
 * So `bump` joins the frontmatter, and it is the field the release reads. The
 * size of a release becomes a consequence of what went into it.
 *
 * ## Why the vocabulary stays Indonesian while the code is English
 *
 * `AGENTS.md` §Language governs code — identifiers, comments, gate messages —
 * and this file obeys it. `tipe: dokumentasi` and `dampak: publik` are neither:
 * they are CONTENT, the same as the prose under them, in files a human writes by
 * hand and a reader reads. Renaming them would rewrite ten existing changesets
 * and both READMEs to no reader's benefit.
 *
 * `bump` is new, and it takes semver's own word with semver's own values, so it
 * needs no translation in either direction.
 */

import { BUMP_LEVELS } from "./semver.mjs";

/** @typedef {{ file: string, message: string }} Problem */

/**
 * `tipe` — what kind of change it was. Documented in `.changesets/README.md`.
 *
 * Kept as a closed list because an open one is not a vocabulary: the value's
 * whole purpose is to group entries, and a set of near-synonyms
 * (`docs`/`dokumentasi`/`doc`) groups nothing.
 */
export const CHANGESET_TYPES = Object.freeze([
  "konten",
  "struktur",
  "perbaikan",
  "dependency",
  "dokumentasi"
]);

/** `dampak` — whether a site's reader could see it. */
export const CHANGESET_IMPACTS = Object.freeze(["publik", "internal"]);

/**
 * Frontmatter is CRLF-tolerant on purpose.
 *
 * `.gitattributes` carries exactly one line and it is not `text=auto eol=lf`, so
 * a `core.autocrlf=true` checkout leaves CRLF in the working tree. A pattern
 * anchored on bare `\n` then fails to match, the block is not stripped, and the
 * raw YAML lands in `CHANGELOG.md` — where a stray `---` after a text line
 * renders as a setext heading and nothing goes red.
 */
const FRONTMATTER_PATTERN = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/;

/**
 * Split a changeset into its declared fields and its prose.
 *
 * @param {string} text - the whole file
 * @returns {{ fields: Record<string, string>, body: string } | null} null when
 *   there is no frontmatter block at all
 */
export function parseChangeset(text) {
  const match = text.match(FRONTMATTER_PATTERN);
  if (!match) return null;

  /** @type {Record<string, string>} */
  const fields = {};

  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;

    const key = trimmed.slice(0, colon).trim();
    // Quotes stripped so `bump: "patch"` and `bump: patch` are the same
    // declaration — the difference is invisible to a reader and would otherwise
    // fail a comparison for a reason nobody could see.
    const value = trimmed
      .slice(colon + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (key) fields[key] = value;
  }

  return { fields, body: text.slice(match[0].length) };
}

/**
 * Strip the frontmatter, leaving the prose that is folded into `CHANGELOG.md`.
 *
 * @param {string} text
 * @returns {string}
 */
export function changesetBody(text) {
  return text.replace(FRONTMATTER_PATTERN, "");
}

/**
 * Is this a changeset entry, as opposed to the directory's own README?
 *
 * @param {string} name - a bare filename inside `.changesets/`
 * @returns {boolean}
 */
export function isChangesetFile(name) {
  return name.endsWith(".md") && !name.startsWith("README");
}

/**
 * Everything wrong with one changeset, as a list rather than a first failure.
 *
 * Reporting all of them at once is the difference between one round trip and
 * three: a contributor who forgot the frontmatter has usually also not chosen a
 * `bump`, and telling them one thing at a time wastes both.
 *
 * @param {string} name - repo-relative path, used in messages
 * @param {string} text
 * @returns {Problem[]}
 */
export function validateChangeset(name, text) {
  /** @type {Problem[]} */
  const problems = [];
  const parsed = parseChangeset(text);

  if (!parsed) {
    problems.push({
      file: name,
      message:
        "tanpa blok frontmatter `---` — sebuah changeset harus menyatakan " +
        `bump, tipe, dan dampak (lihat .changesets/README.md)`
    });
    return problems;
  }

  const { fields } = parsed;

  if (!("bump" in fields)) {
    problems.push({
      file: name,
      message:
        "tanpa `bump:` — inilah yang menentukan besar rilis, dan tanpanya " +
        `keputusan itu kembali diambil di baris perintah saat rilis, ` +
        `berbulan-bulan setelah perubahannya ditulis`
    });
  } else if (!BUMP_LEVELS.includes(fields.bump)) {
    problems.push({
      file: name,
      message: `bump: "${fields.bump}" tidak dikenal — pilih ${BUMP_LEVELS.join(" | ")}`
    });
  }

  if (!("tipe" in fields)) {
    problems.push({ file: name, message: "tanpa `tipe:`" });
  } else if (!CHANGESET_TYPES.includes(fields.tipe)) {
    problems.push({
      file: name,
      message: `tipe: "${fields.tipe}" tidak dikenal — pilih ${CHANGESET_TYPES.join(" | ")}`
    });
  }

  if (!("dampak" in fields)) {
    problems.push({ file: name, message: "tanpa `dampak:`" });
  } else if (!CHANGESET_IMPACTS.includes(fields.dampak)) {
    problems.push({
      file: name,
      message: `dampak: "${fields.dampak}" tidak dikenal — pilih ${CHANGESET_IMPACTS.join(" | ")}`
    });
  }

  return problems;
}
