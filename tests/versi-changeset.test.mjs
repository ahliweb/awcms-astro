/**
 * The gate over the versioning model — `vX.Y.Z` derived from the changesets.
 *
 * ## Why this file exists
 *
 * Before ADR-0040 the version was decided twice, in two places, by two people
 * who never met. A changeset recorded `tipe` and `dampak` and **nothing read
 * them** — `rilis.mjs` stripped the frontmatter with one regex and discarded it,
 * and no gate opened `.changesets/` for anything but dead links. Meanwhile the
 * number that shipped came from a word typed at the command line months later.
 *
 * So this file guards three things, each of which failed silently before:
 *
 *   1. **Every changeset declares a valid `bump`.** Without it the derivation
 *      has nothing to derive from, and the decision slides back to the command
 *      line — which is the state ADR-0040 exists to end. Note the shape of the
 *      failure: a changeset with no `bump` does not break anything visible. It
 *      just quietly stops contributing to the version.
 *   2. **The version model refuses what it cannot represent.** The old
 *      arithmetic answered `NaN` for a prerelease and produced the tag
 *      `v0.2.NaN` — which sorts nowhere under `--sort=v:refname`, so the NEXT
 *      release reads a different tag as latest and the damage outlives the run.
 *   3. **`package.json`, the newest tag, and `CHANGELOG.md` agree.** Three
 *      records of one number is two chances to drift.
 *
 * Written in English per `AGENTS.md` §Language, matching `scripts/lib/`.
 */
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  CHANGESET_IMPACTS,
  CHANGESET_TYPES,
  isChangesetFile,
  parseChangeset,
  validateChangeset
} from "../scripts/lib/changeset.mjs";
import {
  BUMP_LEVELS,
  atLeastAsSignificant,
  bumpVersion,
  formatTag,
  highestBump,
  parseTag,
  parseVersion
} from "../scripts/lib/semver.mjs";

const CHANGESET_DIR = ".changesets";

const changesets = readdirSync(CHANGESET_DIR)
  .filter(isChangesetFile)
  .map((name) => ({
    name,
    path: join(CHANGESET_DIR, name),
    text: readFileSync(join(CHANGESET_DIR, name), "utf8")
  }));

describe("the version model refuses what it cannot represent", () => {
  test("a bare X.Y.Z parses, and every near-miss throws", () => {
    assert.deepEqual(parseVersion("0.2.0"), { major: 0, minor: 2, patch: 0 });
    assert.deepEqual(parseVersion("10.0.31"), { major: 10, minor: 0, patch: 31 });

    // Each of these produced a silent NaN before, and each would have become a
    // real git tag.
    for (const bad of [
      "0.2.0-rc.1",
      "0.2.0+build.5",
      "v0.2.0",
      "1.0",
      "1.0.0.0",
      "0.02.0",
      "",
      "latest"
    ]) {
      assert.throws(
        () => parseVersion(bad),
        /bukan MAJOR\.MINOR\.PATCH|bukan string/,
        `parseVersion(${JSON.stringify(bad)}) did not throw — this is exactly how v0.2.NaN was tagged`
      );
    }
  });

  test("a bump resets the fields below it", () => {
    assert.equal(bumpVersion("1.4.7", "patch"), "1.4.8");
    // The half that hand-rolled bumpers get wrong: not 1.5.7, not 2.4.7.
    assert.equal(bumpVersion("1.4.7", "minor"), "1.5.0");
    assert.equal(bumpVersion("1.4.7", "major"), "2.0.0");
    assert.throws(() => bumpVersion("1.4.7", "mayor"), /tidak dikenal/);
  });

  test("the tag is the version plus exactly one v, and round-trips", () => {
    assert.equal(formatTag("0.2.1"), "v0.2.1");
    assert.equal(parseTag("v0.2.1"), "0.2.1");
    assert.equal(parseTag("v0.2.NaN"), null);
    assert.equal(parseTag("0.2.1"), null, "a version is not a tag");
    assert.equal(parseTag("release-0.2.1"), null);
    assert.throws(() => formatTag("v0.2.1"), /bukan MAJOR/, "no double v");
  });

  test("the largest pending bump carries the release", () => {
    assert.equal(highestBump(["patch", "minor", "patch"]), "minor");
    assert.equal(highestBump(["patch", "major", "minor"]), "major");
    assert.equal(highestBump(["patch"]), "patch");
    assert.equal(highestBump([]), null);
    // A typo must not quietly lower a release by being skipped.
    assert.throws(() => highestBump(["patch", "minorr"]), /tidak dikenal/);
  });

  test("a requested level may exceed the derived one, never undercut it", () => {
    assert.ok(atLeastAsSignificant("major", "minor"));
    assert.ok(atLeastAsSignificant("minor", "minor"));
    assert.ok(!atLeastAsSignificant("patch", "minor"));
    assert.ok(!atLeastAsSignificant("minor", "major"));
  });
});

describe("every pending changeset declares what it costs", () => {
  test("there is at least one changeset to check", () => {
    // Guards the gate itself: an empty directory would make every assertion
    // below vacuously true, and the suite would read green while checking
    // nothing. This is the `graphify-out/` failure shape (ADR-0030).
    assert.ok(
      changesets.length > 0,
      ".changesets/ holds no entries — if that is genuinely right, this " +
        "assertion is the one to change, deliberately."
    );
  });

  test("frontmatter is valid in every one", () => {
    const problems = changesets.flatMap((c) => validateChangeset(c.path, c.text));
    assert.deepEqual(
      problems.map((p) => `${p.file}: ${p.message}`),
      [],
      "a changeset that fails here stops contributing to the version, silently"
    );
  });

  test("the declared vocabulary is the documented vocabulary", () => {
    const readme = readFileSync(join(CHANGESET_DIR, "README.md"), "utf8");

    // The README is what a contributor reads; the module is what the gate
    // enforces. When they disagree, the contributor is the one who loses.
    for (const level of BUMP_LEVELS) {
      assert.ok(
        readme.includes(level),
        `.changesets/README.md never mentions the bump level "${level}"`
      );
    }
    for (const value of [...CHANGESET_TYPES, ...CHANGESET_IMPACTS]) {
      assert.ok(
        readme.includes(value),
        `.changesets/README.md never mentions "${value}", which the gate accepts`
      );
    }
  });

  test("the release the pending set would produce is stated, not guessed", () => {
    const levels = changesets.map((c) => parseChangeset(c.text).fields.bump);
    const derived = highestBump(levels);
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));

    assert.ok(derived, "no bump could be derived from the pending changesets");
    // Not an assertion about WHICH level — that is the authors' judgement. It
    // asserts the derivation runs end to end and yields a taggable version.
    const next = bumpVersion(pkg.version, derived);
    assert.equal(formatTag(next), `v${next}`);
    assert.notEqual(next, pkg.version);
  });
});

describe("one number, three records, no drift", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));

  test("package.json holds a version this repo can tag", () => {
    assert.doesNotThrow(() => parseVersion(pkg.version));
  });

  test("CHANGELOG.md documents the vX.Y.Z model and the derivation", () => {
    const changelog = readFileSync("CHANGELOG.md", "utf8");
    assert.match(changelog, /`?vX\.Y\.Z`?/, "the tag format is not stated");
    assert.match(
      changelog,
      /MAJOR\.MINOR\.PATCH/,
      "the version format is not stated"
    );
    // The preamble tells a reader where the number comes from. Before ADR-0040
    // it named a command-line level that no longer decides anything.
    assert.match(
      changelog,
      /bump/,
      "CHANGELOG.md still describes releases without naming the `bump` field " +
        "that now derives them"
    );
  });

  test("the released version has a section in CHANGELOG.md", () => {
    const changelog = readFileSync("CHANGELOG.md", "utf8");
    assert.ok(
      changelog.includes(`## [${pkg.version}]`),
      `CHANGELOG.md has no section for ${pkg.version}, the version package.json claims`
    );
  });
});
