#!/usr/bin/env node
/**
 * Menaikkan versi, melipat changeset ke CHANGELOG.md, dan menandai rilis `vX.Y.Z`.
 *
 * Menulis catatan rilis adalah pekerjaan yang paling mudah ditunda sampai lupa.
 * Skrip ini memindahkan yang mekanis (hitung versi, gabung berkas, buat tag) ke
 * mesin, sehingga yang tersisa untuk manusia hanya menilai besar perubahannya.
 *
 * Pemakaian:
 *   npm run release -- patch            # pratinjau: tidak menyentuh berkas
 *   npm run release -- minor --apply    # tulis package.json + CHANGELOG.md
 *   npm run release -- minor --apply --commit   # sekalian commit dan tag
 *
 * Tanpa --apply skrip hanya melapor. Tanpa --commit berkas ditulis tetapi
 * commit dan tag diserahkan ke tangan manusia; perintah persisnya dicetak.
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const level = args.find((a) => ['major', 'minor', 'patch'].includes(a));
const apply = args.includes('--apply');
const commit = args.includes('--commit');

if (!level) {
  console.error('Pilih tingkat rilis: major | minor | patch\n');
  console.error('  major  perubahan yang memutus URL publik, struktur konten, atau kontrak frontmatter');
  console.error('  minor  artikel/tab/locale/fitur baru, atau perubahan konten yang terlihat pembaca');
  console.error('  patch  perbaikan yang tidak mengubah bentuk situs: typo, gaya, dependency, dokumentasi\n');
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: 'pipe' }).toString().trim();

// ── Prasyarat ────────────────────────────────────────────────────────────────
// "Ada yang perlu dirilis" bukan berarti pohon kerja kotor. Pekerjaan yang
// sudah di-commit rapi di branch justru alur yang dianjurkan; memeriksa
// kekotoran saja akan menolak persis kasus itu. Yang menentukan adalah apakah
// ada sesuatu yang belum tercakup tag terakhir.
if (commit) {
  const kotor = run('git status --porcelain') !== '';
  const tagTerakhir = run('git tag --list "v*" --sort=-v:refname').split('\n')[0];
  const commitBaru = tagTerakhir ? run(`git rev-list ${tagTerakhir}..HEAD --count`) !== '0' : true;
  if (!kotor && !commitBaru) {
    console.error(`Tidak ada perubahan untuk dirilis: pohon kerja bersih dan tidak ada commit sejak ${tagTerakhir}.`);
    process.exit(1);
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);
const next = { major: `${major + 1}.0.0`, minor: `${major}.${minor + 1}.0`, patch: `${major}.${minor}.${patch + 1}` }[level];
const tag = `v${next}`;

if (run(`git tag -l ${tag}`)) {
  console.error(`Tag ${tag} sudah ada.`);
  process.exit(1);
}

// ── Changeset yang menunggu ──────────────────────────────────────────────────
const pending = fs.existsSync('.changesets')
  ? fs.readdirSync('.changesets').filter((f) => f.endsWith('.md') && f !== 'README.md').sort()
  : [];

console.log(`${pkg.version} -> ${next}  (tag ${tag})`);
console.log(pending.length ? `Changeset menunggu: ${pending.join(', ')}` : 'Tidak ada changeset menunggu.');

if (!pending.length && level !== 'patch') {
  console.log('\nPeringatan: rilis minor/major tanpa changeset. Perubahannya tidak akan terbaca siapa pun nanti.');
}

if (!apply) {
  console.log('\nPratinjau saja. Tambahkan --apply untuk menulis berkas.');
  process.exit(0);
}

// ── Verifikasi sebelum menulis apa pun ───────────────────────────────────────
console.log('\nMenjalankan npm run build ...');
execSync('npm run build', { stdio: 'inherit' });
console.log('Menjalankan npm run audit ...');
execSync('npm run audit', { stdio: 'inherit' });

// ── Lipat changeset ke CHANGELOG.md ──────────────────────────────────────────
// Tanggal lokal, bukan UTC: merilis malam hari WIB akan tercatat mundur sehari
// bila memakai toISOString().
const today = new Date().toLocaleDateString('sv-SE');
const body = pending
  .map((f) =>
    fs
      .readFileSync(`.changesets/${f}`, 'utf8')
      .replace(/^---\n[\s\S]*?\n---\n/, '')
      // Heading changeset diturunkan dua tingkat agar bersarang rapi di bawah
      // heading versi: judul changeset jadi `###`, sub-bagiannya jadi `####`.
      .replace(/^(#{1,4}) /gm, (_, hashes) => `${'#'.repeat(hashes.length + 2)} `)
      .trim()
  )
  .join('\n\n');

const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
if (changelog.includes(`\n## [${next}]`)) {
  console.error(`CHANGELOG.md sudah memuat bagian untuk ${next}. Rapikan dulu sebelum merilis.`);
  process.exit(1);
}
const marker = '\n## [';
const at = changelog.indexOf(marker);
const entry = `\n## [${next}] — ${today}\n\n${body || '_Tidak ada changeset; lihat riwayat git._'}\n`;
fs.writeFileSync('CHANGELOG.md', changelog.slice(0, at) + entry + changelog.slice(at));

for (const f of pending) fs.unlinkSync(`.changesets/${f}`);

pkg.version = next;
fs.writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);

// package-lock.json menyimpan versi di dua tempat. Bila hanya package.json yang
// dinaikkan, keduanya hanyut diam-diam sampai ada yang kebetulan menjalankan
// `npm install` — dan versi di lock inilah yang terbaca `npm ci` di CI.
const lockPath = 'package-lock.json';
if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  lock.version = next;
  if (lock.packages?.['']) lock.packages[''].version = next;
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

console.log(`\nCHANGELOG.md, package.json, dan package-lock.json diperbarui ke ${next}.`);

// ── Commit dan tag ───────────────────────────────────────────────────────────
if (!commit) {
  console.log('\nLangkah berikutnya:');
  console.log('  git add -A');
  console.log(`  git commit -m "rilis: ${tag}"`);
  console.log(`  git tag -a ${tag} -m "${tag}"`);
  console.log(`  git push && git push origin ${tag}`);
  process.exit(0);
}

execSync('git add -A', { stdio: 'inherit' });
execSync(`git commit -m "rilis: ${tag}"`, { stdio: 'inherit' });
execSync(`git tag -a ${tag} -m "${tag}"`, { stdio: 'inherit' });
console.log(`\n${tag} dibuat. Dorong dengan: git push && git push origin ${tag}`);
