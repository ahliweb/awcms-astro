#!/usr/bin/env bun
/**
 * check-docs-translation.mjs — documentation translation gates (ADR-0039).
 *
 * ENGLISH at the bare path is the source; Indonesian at `<name>.id.md` is the
 * mirror, and the mirror records the hash of the English it was translated from.
 * The mechanism is `awcms` ADR-0097's, adopted whole; what differs here is the
 * scope (see `isInScope` in `lib/docs-i18n-checks.mjs`) and the ledger below.
 *
 * Two questions, kept separate on purpose (see `lib/docs-i18n-checks.mjs`):
 * whether an existing mirror is CURRENT, and which documents have NO mirror yet.
 *
 * Pure logic lives in `scripts/lib/docs-i18n-checks.mjs`; this file does I/O and
 * exit codes. Run: `bun run audit:translation`.
 *
 * The script name is English while its three siblings are not (`audit:konten`,
 * `audit:dokumen`, `audit:graf`). That is deliberate rather than careless: code
 * written after ADR-0039 is written in English, and naming this one `terjemahan`
 * would add a fourth entry to the debt the same ADR schedules for removal.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import {
  checkMirrorCoverage,
  checkTranslationPair,
  deriveSourcePath,
  isInScope
} from "./lib/docs-i18n-checks.mjs";

const ROOT = resolve(import.meta.dirname, "..");

/** @typedef {import("./lib/docs-i18n-checks.mjs").Problem} Problem */

/**
 * Documents still awaiting their Indonesian mirror.
 *
 * **This list may only SHRINK.** Removing an entry is how the migration records
 * progress; the gate rejects an entry whose mirror now exists, so the ledger
 * cannot overstate the debt and quietly stop being believed. Nothing new may be
 * added: a document written after ADR-0039 is written in English and mirrored in
 * the same change — ADR-0039 itself is the first, and it is deliberately not on
 * this list.
 *
 * It starts at 52 — every document in scope on the day the policy landed, since
 * this repo had no mirrored pair before it.
 */
export const DOCS_AWAITING_MIRROR = [
  ".changesets/README.md",
  ".claude/skills/README.md",
  ".claude/skills/awcms-astro-gerbang/SKILL.md",
  ".claude/skills/awcms-astro-integrasi/SKILL.md",
  ".claude/skills/awcms-astro-performa-keamanan/SKILL.md",
  ".claude/skills/awcms-astro-situs-baru/SKILL.md",
  "AGENTS.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "GOVERNANCE.md",
  "README.md",
  "SECURITY.md",
  "SUPPORT.md",
  "docs/adr/0014-rendering-campuran-dan-bff-portal.md",
  "docs/adr/0015-runtime-bun-menutup-divergence-keluarga.md",
  "docs/adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md",
  "docs/adr/0017-peran-admin-owner-internal.md",
  "docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md",
  "docs/adr/0019-csp-ketat-dikirim-penyaji.md",
  "docs/adr/0020-layar-admin-kembali-ke-awcms.md",
  "docs/adr/0021-tahan-pengembangan-menunggu-fondasi-awcms.md",
  "docs/adr/0022-situs-menerbitkan-tenant-default-awcms.md",
  "docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md",
  "docs/adr/0024-seni-lokal-di-src-assets.md",
  "docs/adr/0025-gambar-artikel-dari-media-awcms.md",
  "docs/adr/0026-kartu-share-per-artikel-dari-media-awcms.md",
  "docs/adr/0027-penahanan-adr-0021-selesai.md",
  "docs/adr/0028-jangkar-standar-performa-dan-keamanan.md",
  "docs/adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md",
  "docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md",
  "docs/adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md",
  "docs/adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md",
  "docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md",
  "docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md",
  "docs/adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md",
  "docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md",
  "docs/adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md",
  "docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md",
  "docs/adr/README.md",
  "docs/awcms-astro/README.md",
  "docs/awcms-astro/checklist-repo-baru.md",
  "docs/awcms-astro/integrasi-awcms.md",
  "docs/awcms-astro/jualanku/01-arsitektur-experience.md",
  "docs/awcms-astro/jualanku/02-kontrak-bff.md",
  "docs/awcms-astro/jualanku/03-peta-rute-dan-ui.md",
  "docs/awcms-astro/jualanku/04-kesiapan.md",
  "docs/awcms-astro/jualanku/README.md",
  "docs/awcms-astro/permukaan-admin-user.md",
  "docs/awcms-astro/standar-performa-dan-keamanan.md",
  "docs/awcms-astro/standar-teknis.md",
  "docs/awcms-astro/ui-ux-design-system.md",
  "docs/deploy-coolify.md"
];

/**
 * Every tracked-or-new markdown path, from git.
 *
 * `--others --exclude-standard` so a document added in THIS change is judged
 * before it is committed. Plain `git ls-files` sees only tracked files, so a
 * brand-new document would pass unexamined and fail for whoever ran the gate
 * next.
 *
 * @param {string} pattern
 * @returns {string[]}
 */
function gitList(pattern) {
  return execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", pattern],
    { cwd: ROOT, encoding: "utf8" }
  )
    .split("\n")
    .filter(Boolean);
}

/** @returns {string[]} English documents in scope. */
function listSources() {
  return gitList("*.md").filter(isInScope);
}

/**
 * @returns {string[]} `.id.md` mirrors present on disk.
 *
 * Untracked mirrors included, for the same reason as `listSources`: a pair
 * created in this change must be judged now. Enumerating sources one way and
 * mirrors the other would be worse than either — the coverage check would then
 * report a brand-new document as unmirrored while its mirror sat right there.
 */
function listMirrors() {
  return gitList("*.id.md");
}

/**
 * Read a file, or return null when it is not there.
 *
 * Deliberately not `existsSync` + `readFileSync`: that pair is a
 * time-of-check/time-of-use race, and this gate runs over a tree that git, an
 * editor, and `docs-i18n-stamp.mjs` may all be touching.
 *
 * @param {string} path
 * @returns {string | null}
 */
function readFileIfPresent(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      /** @type {NodeJS.ErrnoException} */ (error).code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

/** @returns {Problem[]} */
export function runChecks() {
  /** @type {Problem[]} */
  const problems = [];
  const mirrors = listMirrors();

  for (const mirrorPath of mirrors) {
    const sourcePath = deriveSourcePath(mirrorPath);
    if (!sourcePath) continue;

    const mirrorContent = readFileIfPresent(join(ROOT, mirrorPath));
    if (mirrorContent === null) continue;

    problems.push(
      ...checkTranslationPair(
        sourcePath,
        readFileIfPresent(join(ROOT, sourcePath)),
        mirrorPath,
        mirrorContent
      )
    );
  }

  problems.push(
    ...checkMirrorCoverage(listSources(), new Set(mirrors), DOCS_AWAITING_MIRROR)
  );

  return problems;
}

if (import.meta.main) {
  const problems = runChecks();

  if (problems.length > 0) {
    console.error(`audit:translation FAILED — ${problems.length} finding(s):`);
    for (const p of problems) console.error(`  - ${p.file}: ${p.message}`);
    process.exit(1);
  }

  const mirrored = listMirrors().length;
  console.log(
    `audit:translation OK — ${mirrored} mirror(s) current against their English ` +
      `source; ${DOCS_AWAITING_MIRROR.length} document(s) on the shrink-only ` +
      `translation ledger.`
  );
}
