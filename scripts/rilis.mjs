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
// Build menuntut sumber konten yang hidup, dan `AWCMS_API_URL` KOSONG adalah
// keadaan normal untuk repo TEMPLATE ini sendiri — sebuah SITUS yang dibangun
// darinya selalu mengisinya. `.github/workflows/ci.yml` sudah memutuskan apa
// yang benar untuk keadaan itu, beserta alasan menolak dua alternatifnya:
// membiarkan build gagal selamanya membuat merah permanen berhenti dibaca, dan
// memberi build sebuah awcms tiruan membuat gerbangnya lulus tanpa pernah
// membuktikan template ini bisa bicara dengan sumber kontennya. Perilis
// mengikuti keputusan yang sama, bukan keputusan kedua.
//
// Sampai baris ini ada, perilis menuntut sesuatu yang repo template ini secara
// struktural TIDAK BISA penuhi — CI melewatinya, perilis tidak — dan selisih itu
// adalah alasan puluhan changeset menumpuk tanpa satu pun rilis.
const sumberKonten = (process.env.AWCMS_API_URL ?? '').trim();

if (sumberKonten) {
  console.log('\nAWCMS_API_URL terisi — menjalankan bun run build ...');
  execSync('bun run build', { stdio: 'inherit' });
  // Setelah build, bukan sebelum: gerbang keluaran audit konten membaca
  // `dist/client`, dan tanpa hasil build ia melewati dirinya sendiri.
  // Menjalankan keduanya dalam urutan ini adalah satu-satunya cara rilis
  // benar-benar memeriksa apa yang akan terbit, bukan hanya sumber gambarnya.
  console.log('Menjalankan bun run audit:konten ...');
  execSync('bun run audit:konten', { stdio: 'inherit' });
} else {
  // Dinyatakan keras, dan ikut masuk catatan rilis di bawah. Sebuah gerbang yang
  // dilewati diam-diam adalah gerbang yang dibaca sebagai gerbang yang lulus —
  // dan pembacanya adalah orang yang menarik tag ini enam bulan lagi.
  console.log('\n' + '='.repeat(72));
  console.log('AWCMS_API_URL KOSONG — build integrasi DILEWATI, bukan LULUS.');
  console.log('Konsekuensinya, tiga gerbang tidak berjalan pada rilis ini:');
  console.log('  - bun run build         (template tak punya sumber konten)');
  console.log('  - bun run audit:konten  (membaca dist/client, yang tak ada)');
  console.log('  - lapis penyaji + CSP di bun test (keduanya self-skip tanpa dist)');
  console.log('Ini normal untuk repo TEMPLATE. Sebuah SITUS mengisi AWCMS_API_URL,');
  console.log('jadi di sana ketiganya selalu berjalan. Fakta ini ditulis ke');
  console.log('CHANGELOG.md supaya tidak hilang bersama keluaran terminal ini.');
  console.log('='.repeat(72) + '\n');
}

// SEBELUM changeset dilipat, dan itu bukan urutan yang bebas dipilih: tautan
// relatif di `.changesets/` ditulis dari sudut pandang direktori itu, jadi
// begitu isinya dilipat ke CHANGELOG.md dan berkasnya dihapus, gerbang ini
// kehilangan satu-satunya kesempatan memeriksanya pada bentuk yang ditulis
// penulisnya.
console.log('Menjalankan bun run audit:dokumen ...');
execSync('bun run audit:dokumen', { stdio: 'inherit' });

// Bersebelahan dengan audit dokumen karena syaratnya sama — tanpa build, tanpa
// jaringan, tanpa awcms — dan karena keduanya menjaga berkas yang IKUT DIRILIS.
// `graphify-out/` terlacak, jadi ia masuk tag rilis; artefak yang salah menamai
// komunitasnya sendiri akan dibaca sebagai peta oleh setiap orang dan agen yang
// menarik tag itu. Melewati dirinya bila `graphify-out/` tidak ada, dan
// mengatakannya — keadaan sah untuk situs turunan.
console.log('Menjalankan bun run audit:graf ...');
execSync('bun run audit:graf', { stdio: 'inherit' });

// SESUDAH build, dan itu satu-satunya urutan yang berarti: dua lapis `bun test`
// — gerbang penyajian (`tests/penyaji.test.mjs`) dan gerbang keluaran CSP
// (`tests/keluaran-csp.test.mjs`) — MELEWATI DIRINYA tanpa `dist/`, dan
// mengatakannya. Menjalankannya sebelum build berarti merilis tanpa satu pun
// dari keduanya pernah berjalan.
//
// Ia tidak ada di sini sampai 4 Agustus 2026, dan ketiadaannya persis kelas
// cacat yang repo ini bangun empat gerbang untuk menangkap: `AGENTS.md`
// §Definition of Done, `CONTRIBUTING.md`, templat PR, dan checklist repo baru
// KEEMPATNYA menuntut `bun test` hijau sebelum rilis, sementara skrip yang
// benar-benar merilis tidak pernah menjalankannya. Aturan yang tampak terjaga
// padahal tidak.
console.log('Menjalankan bun test (setelah build, sehingga lapis penyaji ikut jalan) ...');
execSync('bun test', { stdio: 'inherit' });

// `bun audit` (kerentanan dependency) dan `bun run audit:konten` (isi situs)
// adalah dua hal berbeda; namanya sengaja tidak dibuat mirip.
//
// `standar-teknis.md` §Keamanan menyatakan "`bun audit` wajib nol sebelum
// rilis" — sebuah kalimat yang, sampai baris ini ada, tidak dijalankan oleh apa
// pun yang merilis.
//
// `--audit-level=low` menyamai CI. Ambang yang lebih longgar di sini akan
// membuat rilis meloloskan advisory yang PR-nya sendiri tolak, dan selisih itu
// hanya terlihat oleh orang yang membandingkan dua berkas.
console.log('Menjalankan bun audit ...');
execSync('bun audit --audit-level=low', { stdio: 'inherit' });

// ── SBOM rilis (ADR-0031) ────────────────────────────────────────────────────
// SSDF PS.2 / celah 9 ADR-0028: konsumen hilir menjawab "apakah rilis ini
// terdampak advisory X" dari tag-nya, tanpa membangun ulang. Ditulis SEBELUM
// commit rilis sehingga sbom.cdx.json ikut di dalam tag, dan deterministik
// (tanpa timestamp) sehingga siapa pun bisa memverifikasi SBOM sebuah tag
// memang diturunkan dari bun.lock di sebelahnya. `tests/sbom.test.mjs` menjaga
// generatornya benar DAN baris ini tidak hilang diam-diam.
console.log('Menulis sbom.cdx.json (CycloneDX, dari bun.lock) ...');
execSync('bun run sbom', { stdio: 'inherit' });

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
// Catatan integrasi masuk ke catatan rilis, bukan hanya ke terminal: yang
// membaca CHANGELOG enam bulan lagi tidak punya akses ke keluaran perilis.
const catatanIntegrasi = sumberKonten
  ? ''
  : '> **Build integrasi tidak berjalan pada rilis ini.** `AWCMS_API_URL` kosong,\n' +
    '> yang normal untuk repo template ini sendiri — jadi `bun run build`,\n' +
    '> `bun run audit:konten`, dan lapis penyaji/CSP di `bun test` DILEWATI, bukan\n' +
    '> lulus. Sebuah situs yang dibangun dari template ini mengisi variabel itu dan\n' +
    '> menjalankan ketiganya.\n\n';
const entry = `\n## [${next}] — ${today}\n\n${catatanIntegrasi}${body || '_Tidak ada changeset; lihat riwayat git._'}\n`;
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
