/**
 * audit-rilis.mjs — the gate over the changesets that are still WAITING.
 *
 * ## The question nothing could ask until now
 *
 * Since ADR-0040 a changeset declares its own `bump`, so the SIZE of a release
 * is derived from its contents and no longer typed at the command line. That
 * decision left exactly one thing to human memory: **when**.
 *
 * Memory lost. `v0.2.0` was tagged on 8 August 2026; on 28 August 2026 there
 * were thirty changesets waiting behind it — nine `minor` entries a reader
 * would see (archives, pagination, search, byline, menus, galleries, the visit
 * beacon) and, among the `patch` entries, two security fixes: HSTS was never
 * actually sent in production, and the nanoid advisory was closed through an
 * override. Every gate in this repo was green for those twenty days, because
 * not one of them reads `.changesets/` for anything but dead links.
 *
 * That matters more here than it would in an application. This repo is a
 * TEMPLATE: sites are derived from it with "Use this template" and then
 * diverge. A site started in August got `v0.2.0` and had no tagged upgrade path
 * to search, to archives, or to the HSTS fix. The longer the tag lags, the less
 * the version number means to the people versioning exists for.
 *
 * ## What this gate checks
 *
 * Three things, all of them from file names and none of them needing a build, a
 * network, or awcms:
 *
 *   1. **A changeset can be aged at all.** Its name must begin `YYYY-MM-DD-`
 *      with a real calendar date, which `.changesets/README.md` has always
 *      required and nothing has ever checked. A file this gate cannot date is a
 *      file that never ages, and it would sit in the backlog invisible to the
 *      one check built to notice it.
 *   2. **The backlog has a ceiling.** At most {@link MAX_WAITING} changesets may
 *      wait. This bound moves when a pull request is merged, so the person who
 *      sees it go red is the person whose merge crossed it.
 *   3. **The backlog has a deadline.** The oldest waiting changeset may be at
 *      most {@link MAX_AGE_DAYS} days old.
 *
 * ## Why the age bound is allowed to redden a run nobody caused
 *
 * `audit:graf` deliberately REFUSES to go red on staleness, and the reasoning
 * is recorded: turning red would force every pull request touching an indexed
 * file to carry a multi-megabyte rebuild, and a gate that expensive gets
 * loosened within a month. The cost here is the opposite shape. This red asks
 * the contributor who sees it for **nothing** — it is cleared by a maintainer
 * running one command — and `main` carries no required checks, so a red run
 * informs without blocking anyone's merge. What it costs is a red mark; what it
 * buys is that a backlog cannot be a silence.
 *
 * ## Why the releaser does NOT run this
 *
 * `bun run release` folds every waiting changeset and deletes it — it is the
 * act that clears this backlog. Running the gate inside the releaser would
 * refuse the one operation that fixes what the gate is complaining about, on
 * every release large enough to matter.
 *
 * Comments and identifiers are English per `AGENTS.md` §Language. The findings
 * are Indonesian, like every sibling gate's and like the summary lines
 * `scripts/lib/reporter.mjs` prints under them; mixing the two inside one
 * report would make the output worse in both languages.
 *
 * Run: `bun run audit:rilis`.
 */
import { existsSync, readdirSync } from "node:fs";

import { isChangesetFile } from "./lib/changeset.mjs";
import { createReporter } from "./lib/reporter.mjs";

const DIRECTORY = ".changesets";

/**
 * At most this many changesets may wait for a release.
 *
 * Derived from this repo's own measured rate rather than chosen for roundness:
 * thirty changesets landed in the twenty days after `v0.2.0`, so twelve is
 * about eight days of work at the pace that produced the backlog this bound
 * exists to prevent.
 */
const MAX_WAITING = 12;

/**
 * The oldest waiting changeset may be at most this many days old.
 *
 * Two weeks is the longest a derived site should wait to be able to PULL a
 * security fix — the HSTS fix sat unreleased for fourteen days before this
 * bound existed, and the nanoid advisory for fourteen. A site operator who
 * cannot upgrade has no way to act on either.
 */
const MAX_AGE_DAYS = 14;

/**
 * How far ahead of this machine's own date a changeset may be dated.
 *
 * Not zero, and the reason is a defect this gate produced on its first CI run.
 * The author writes the name in their own zone — WIB here — and the runner
 * keeps UTC, so for the seven hours after midnight in Jakarta every changeset
 * written that day is dated "tomorrow" as far as the runner is concerned. The
 * gate reddened a correctly named file and named the author's own calendar as
 * the fault.
 *
 * One day covers it. No zone on earth is more than one calendar day ahead of
 * UTC, which is what CI runs in, and a checker running in the author's own zone
 * needs no slack at all. What the check exists to catch survives: a changeset
 * dated a month out, whose negative age would keep it below every deadline
 * forever.
 */
const MAX_FUTURE_DAYS = 1;

/** `YYYY-MM-DD-` at the head of a changeset's name. */
const DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})-/;

const reporter = createReporter("audit rilis");

/**
 * Today as `YYYY-MM-DD`, LOCAL — the same clock `scripts/rilis.mjs` stamps the
 * changelog with, so a release cut at 23:00 WIB is not one day older here than
 * it is there.
 *
 * `RELEASE_TODAY` overrides it. A gate whose verdict depends on the wall clock
 * cannot be tested against a fixture without one, and a test that computes its
 * fixture dates from the same clock as the gate proves only that subtraction
 * works.
 */
function today() {
  const override = (process.env.RELEASE_TODAY ?? "").trim();
  if (override) return override;
  return new Date().toLocaleDateString("sv-SE");
}

/**
 * Whole days between two `YYYY-MM-DD` dates.
 *
 * Both are read at UTC midnight, so the answer never moves by an hour of
 * daylight saving in a zone neither date was written in.
 *
 * @param {string} from
 * @param {string} to
 * @returns {number}
 */
function daysBetween(from, to) {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/**
 * The date a changeset's name declares, or `null` when the name declares none
 * that a calendar would accept.
 *
 * `Date.parse` is not asked the question directly: it answers for `2026-02-31`
 * by rolling into March, and a date that rolls is a date the author did not
 * write. Round-tripping the parsed value back to its own string rejects
 * exactly that.
 *
 * @param {string} name - a bare file name inside `.changesets/`
 * @returns {string | null}
 */
function declaredDate(name) {
  const match = name.match(DATE_PREFIX);
  if (!match) return null;

  const iso = `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(`${iso}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10) === iso ? iso : null;
}

if (!existsSync(DIRECTORY)) {
  // A derived site may legitimately have deleted this directory along with the
  // template's release machinery. Saying so is the difference between a gate
  // that found nothing and a gate that read nothing.
  reporter.note(`${DIRECTORY}/ tidak ada — tidak ada backlog rilis untuk diperiksa.`);
  reporter.finish();
}

const pending = readdirSync(DIRECTORY).filter(isChangesetFile).sort();

/** @type {{ file: string, date: string }[]} */
const dated = [];

for (const file of pending) {
  const date = declaredDate(file);

  if (!date) {
    reporter.violation(
      "penamaan",
      `${DIRECTORY}/${file}`,
      "namanya tidak diawali tanggal `YYYY-MM-DD-` yang sah — sebuah changeset " +
        "yang tidak bisa ditanggali tidak pernah menua, jadi ia duduk di backlog " +
        "tak terlihat oleh satu-satunya gerbang yang dibangun untuk melihatnya " +
        "(lihat .changesets/README.md)"
    );
    continue;
  }

  dated.push({ file, date });
}

const todayIso = today();

// Checked before the age bound, and not merged into it: a file dated ahead of
// today has a NEGATIVE age, so it can never cross a deadline — it would be the
// one way to park a changeset in the backlog permanently, and it would look
// like a typo while doing it. `MAX_FUTURE_DAYS` of slack keeps a zone
// difference from being read as that.
for (const { file, date } of dated) {
  if (daysBetween(date, todayIso) < -MAX_FUTURE_DAYS) {
    reporter.violation(
      "tanggal",
      `${DIRECTORY}/${file}`,
      `bertanggal ${date}, lebih dari ${MAX_FUTURE_DAYS} hari di depan hari ini ` +
        `(${todayIso}) — sebuah changeset bertanggal masa depan berumur negatif, ` +
        "jadi ia tidak akan pernah melewati batas usia mana pun"
    );
  }
}

if (dated.length > MAX_WAITING) {
  reporter.violation(
    "jumlah",
    `${DIRECTORY}/`,
    `${dated.length} changeset menunggu, batasnya ${MAX_WAITING} — potong ` +
      "rilisnya dengan `bun run release --apply` (ADR-0048)"
  );
}

const oldest = dated.reduce(
  (oldestSoFar, candidate) =>
    oldestSoFar === null || candidate.date < oldestSoFar.date ? candidate : oldestSoFar,
  /** @type {{ file: string, date: string } | null} */ (null)
);

if (oldest) {
  const ageDays = daysBetween(oldest.date, todayIso);

  if (ageDays > MAX_AGE_DAYS) {
    reporter.violation(
      "usia",
      `${DIRECTORY}/${oldest.file}`,
      `menunggu ${ageDays} hari sejak ${oldest.date}, batasnya ${MAX_AGE_DAYS} — ` +
        "sebuah situs turunan tidak punya versi bertag untuk menarik apa pun di " +
        "belakangnya (ADR-0048)"
    );
  }

  reporter.note(
    `${dated.length} changeset menunggu (batas ${MAX_WAITING}); tertua ` +
      `${oldest.file} — ${ageDays} hari (batas ${MAX_AGE_DAYS}).`
  );
} else {
  reporter.note(
    `Tidak ada changeset menunggu. Batas yang berlaku: ${MAX_WAITING} berkas, ` +
      `${MAX_AGE_DAYS} hari (ADR-0048).`
  );
}

reporter.finish();
