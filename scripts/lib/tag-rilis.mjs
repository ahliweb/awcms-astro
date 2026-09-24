/**
 * tag-rilis.mjs — the pure half of the "every remote tag has a GitHub Release"
 * check, kept apart from the network call that feeds it.
 *
 * ## Why this is separate from `audit-rilis.mjs`
 *
 * `scripts/lib/git.mjs` already draws this line for the shell boundary; the
 * same reasoning applies to the comparison itself. A test that has to reach
 * the network to prove "a missing tag is reported, a matching one is not" is a
 * test that cannot run offline and cannot run deterministically — exactly the
 * trap `tests/audit-rilis.test.mjs`'s own docblock names for the age bound.
 * Factoring the comparison out means it is proven with two plain arrays, the
 * same way `scripts/lib/semver.mjs` proves version arithmetic without a git
 * process anywhere nearby.
 *
 * ## The tag pattern, and why it is this strict
 *
 * `vX.Y.Z` — exactly what `scripts/lib/semver.mjs`'s own `TAG_PATTERN` accepts,
 * duplicated here rather than imported: that module is about the version
 * `bun run release` is ABOUT to cut, and importing it here would let a change
 * meant for the releaser's forward-looking arithmetic silently reach backward
 * into what this gate accepts as release HISTORY. The two are allowed to drift
 * on purpose. No `v` inside the numbers, no prerelease, no build metadata, no
 * leading zeros — the same refusals `semver.mjs` documents, for the same
 * reason: a tag this gate cannot parse is a tag this gate cannot know is
 * missing a Release, and silently skipping it is worse than being strict about
 * what counts as "one of this repo's release tags" at all.
 */

/** `vX.Y.Z` — exactly three dot-separated non-negative integers, no leading zeros, nothing else. */
const POLA_TAG_RILIS = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/**
 * Is `tag` one of this repo's strict release tags?
 *
 * @param {string} tag
 * @returns {boolean}
 */
export function tagRilisSah(tag) {
  return typeof tag === "string" && POLA_TAG_RILIS.test(tag);
}

/**
 * Tags present on the remote that have no matching GitHub Release, sorted.
 *
 * Pure set difference — no assumption that either list is sorted or
 * deduplicated going in, because `git ls-remote` and the GitHub Releases API
 * make neither promise.
 *
 * @param {readonly string[]} tagRemote - strict `vX.Y.Z` tags found on the remote
 * @param {readonly string[]} namaRilis - tag names carried by existing GitHub Releases
 * @returns {string[]}
 */
export function tagTanpaRilis(tagRemote, namaRilis) {
  const punyaRilis = new Set(namaRilis);
  return [...new Set(tagRemote)]
    .filter((tag) => !punyaRilis.has(tag))
    .sort();
}
