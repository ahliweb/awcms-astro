#!/usr/bin/env bun
/**
 * Menaikkan versi, melipat changeset ke CHANGELOG.md, dan menandai rilis `vX.Y.Z`.
 *
 * Menulis catatan rilis adalah pekerjaan yang paling mudah ditunda sampai lupa.
 * Skrip ini memindahkan yang mekanis (hitung versi, gabung berkas, buat tag) ke
 * mesin, sehingga yang tersisa untuk manusia hanya menilai besar perubahannya.
 *
 * Pemakaian:
 *   bun run release patch            # pratinjau: tidak menyentuh berkas
 *   bun run release minor --apply    # tulis package.json + CHANGELOG.md
 *   bun run release minor --apply --commit   # sekalian commit dan tag
 *
 * Tanpa --apply skrip hanya melapor. Tanpa --commit berkas ditulis tetapi
 * commit dan tag diserahkan ke tangan manusia; perintah persisnya dicetak.
 */
import fs from 'node:fs';
import path from 'node:path';
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
console.log('\nMenjalankan bun run build ...');
execSync('bun run build', { stdio: 'inherit' });
// Gerbang audit konten belum ada di template ini (lihat README, "Yang belum
// ada"). Memanggilnya tanpa syarat membuat setiap rilis gagal di langkah yang
// tidak ada isinya; menjalankannya begitu ia ditulis adalah yang diinginkan.
if (pkg.scripts?.audit) {
  console.log('Menjalankan bun run audit ...');
  execSync('bun run audit', { stdio: 'inherit' });
}

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
      // Tautan relatif ditulis dari sudut pandang `.changesets/`, tetapi
      // CHANGELOG.md tinggal di akar repo. Menyalinnya apa adanya membuat
      // setiap tautan meleset satu tingkat — dan itu baru ketahuan di CI,
      // karena gerbang audit berjalan sebelum changeset dilipat.
      .replace(/\]\((?!https?:|mailto:|#)([^)]+)\)/g, (_, target) => {
        const [jalur, anchor] = target.split('#');
        const akar = path.posix.normalize(path.posix.join('.changesets', jalur));
        return `](${akar}${anchor ? `#${anchor}` : ''})`;
      })
      .trim()
  )
  .join('\n\n');

const changelog = fs.existsSync('CHANGELOG.md') ? fs.readFileSync('CHANGELOG.md', 'utf8') : '';
if (changelog.includes(`\n## [${next}]`)) {
  console.error(`CHANGELOG.md sudah memuat bagian untuk ${next}. Rapikan dulu sebelum merilis.`);
  process.exit(1);
}
// Sebelum rilis pertama belum ada satu pun heading versi. `indexOf` menjawab -1
// untuk keadaan itu, dan `slice(0, -1)` diam-diam memotong karakter terakhir
// preambul alih-alih menyisipkan di belakangnya.
const marker = '\n## [';
const ketemu = changelog.indexOf(marker);
const at = ketemu === -1 ? changelog.length : ketemu;
const entry = `\n## [${next}] — ${today}\n\n${body || '_Tidak ada changeset; lihat riwayat git._'}\n`;
fs.writeFileSync('CHANGELOG.md', changelog.slice(0, at) + entry + changelog.slice(at));

for (const f of pending) fs.unlinkSync(`.changesets/${f}`);

pkg.version = next;
fs.writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);

// Tidak ada lockfile yang perlu disentuh di sini. `package-lock.json` dulu
// menyimpan versi proyek di DUA tempat, dan keduanya hanyut diam-diam setiap
// kali hanya package.json yang dinaikkan. `bun.lock` tidak merekam versi sama
// sekali (hanya nama workspace + rentang dependency), jadi kelas cacat itu
// hilang bersama perpindahan ke Bun — lihat scripts/cek-lockfile.mjs.

console.log(`\nCHANGELOG.md dan package.json diperbarui ke ${next}.`);

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
