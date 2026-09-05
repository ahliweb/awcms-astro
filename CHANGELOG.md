# Changelog

Seluruh perubahan yang layak diketahui pencatat rilis, terbaru di atas.

Versi memakai format `MAJOR.MINOR.PATCH` dan ditandai di git sebagai `vX.Y.Z`. Arti setiap angka ditetapkan di [`docs/awcms-astro/standar-teknis.md`](docs/awcms-astro/standar-teknis.md#versioning) — semver dirancang untuk library ber-API, jadi artinya untuk sebuah situs perlu didefinisikan ulang.

Berkas ini diisi `bun run release` dengan melipat seluruh changeset di [`.changesets/`](.changesets/README.md). Jangan menambahkan bagian versi dengan tangan; tulis changeset-nya, dan biarkan skrip rilis yang melipat.

Sejak [ADR-0040](docs/adr/0040-changeset-menyatakan-bump-semver.md) setiap changeset menyatakan `bump: major | minor | patch`, dan versi berikutnya adalah bump TERBESAR di antara yang menunggu — jadi besar sebuah rilis adalah akibat dari isinya, bukan keputusan terpisah yang diambil saat merilis.

## [0.5.2] — 2026-09-05

> **Build integrasi tidak berjalan pada rilis ini.** `AWCMS_API_URL` kosong,
> yang normal untuk repo template ini sendiri — jadi `bun run build`,
> `bun run audit:konten`, dan lapis penyaji/CSP di `bun test` DILEWATI, bukan
> lulus. Sebuah situs yang dibangun dari template ini mengisi variabel itu dan
> menjalankan ketiganya.

### Lantai dukungan 360px akhirnya punya angka yang jujur dan gerbang yang menjaganya

`.grid-cards` menulis `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`.
Di lantai dukungan 360px yang didokumentasikan repo ini, `.container` (padding
`0 1.25rem` — 20px tiap sisi) menyisakan ruang bersih PERSIS 320px — sebuah track
selebar 320px di ruang 320px pas TANPA sisa sama sekali. `box-sizing: border-box`
menyelamatkannya hari ini, tapi pembulatan sub-piksel atau border/outline/shadow
yang kelak ditambahkan ke `.card` akan mendorong gulir mendatar persis di lebar
yang dijanjikan repo ini untuk didukung, dan tidak ada satu gerbang pun yang akan
memerah karenanya. `.sorotan` di `src/components/views/Home.astro` — sebuah blok
`<style>` komponen, bukan `global.css` — punya cacat yang identik lewat
`minmax(20rem, 1fr)` (20rem = 320px); draf pertama gerbangnya sendiri hanya
membaca `global.css` dan tetap hijau di atasnya, jadi cakupan berkasnya
diperbaiki dulu sebelum PR ini boleh dianggap selesai.

- `src/styles/global.css`: `.grid-cards` kini memakai
  `minmax(min(320px, 100%), 1fr)` — identik hasilnya di setiap lebar di atas
  320px, tapi tidak bisa lagi dipaksa overflow oleh track-nya sendiri.
- `src/components/views/Home.astro`: `.sorotan` kini memakai
  `minmax(min(20rem, 100%), 1fr)` — unit rem dipertahankan, bukan dikonversi
  ke px, karena itulah yang berkas ini pakai di tempat lain.
- `AGENTS.md`, `AGENTS.id.md`, `docs/awcms-astro/ui-ux-design-system.md`, dan
  `.id.md`-nya menulis "kartu 328px … skala 0.41" — aritmetika untuk padding
  1rem yang sudah lama tidak sama dengan padding 1.25rem yang sungguh berlaku
  di `.container`. Angkanya kini 320px dan skala 0.40 (kesimpulannya tidak
  berubah: 22px × 0,40 = 8,8px, tetap di bawah 9px dan praktis tidak terbaca).
- Aturan lantai 360px sebelumnya tidak punya satu pun pemeriksa. Kini ada:
  `tests/lebar-360.test.mjs` membaca padding `.container` dan lantai 360px dari
  `src/styles/global.css`, menurunkan lebar bersihnya dari CSS itu sendiri
  (bukan menulis ulang "320" sebagai angka tetap), lalu menolak
  `minmax(<N>px|rem, …)` atau `width`/`min-width` tetap lain yang mencapai atau
  melebihi lebar itu tanpa jalan keluar `min(…, 100%)`, media query khusus
  layar lebar, `overflow-x` pada dirinya sendiri, atau posisi absolut/fixed di
  luar alur — **diperiksa di `src/styles/global.css` DAN di setiap blok
  `<style>` setiap berkas `.astro` di bawah `src/`** (komponen, layout,
  halaman), bukan hanya `global.css`, supaya kasus kedua di `Home.astro` tidak
  bisa lolos lagi dengan nama lain. Juga menjaga angka kartu/skala di
  `AGENTS.md` tetap sinkron dengan aritmetika CSS yang sebenarnya. Gerbang ini
  statik atas teks CSS: ia tidak bisa membuktikan keamanan render sungguhan
  (pembulatan sub-piksel, metrik font nyata, scrollbar sungguhan) — itu butuh
  pemeriksaan headless-browser `document.documentElement.scrollWidth <= 360`
  atas halaman yang sudah dibangun, terhadap `awcms` backend yang hidup.
- `AGENTS.md`/`.id.md` §Interface, item Definition of Done tentang 360px, dan
  `.claude/skills/awcms-astro-gerbang/SKILL.md`/`.id.md` kini menyebut gerbang
  baru ini dan cakupan berkasnya yang sebenarnya; hitungan `bun test` di
  keenam dokumen yang dijaga `tests/documented-counts.test.mjs` naik dari 39
  ke 40.

## [0.5.1] — 2026-09-05

> **Build integrasi tidak berjalan pada rilis ini.** `AWCMS_API_URL` kosong,
> yang normal untuk repo template ini sendiri — jadi `bun run build`,
> `bun run audit:konten`, dan lapis penyaji/CSP di `bun test` DILEWATI, bukan
> lulus. Sebuah situs yang dibangun dari template ini mengisi variabel itu dan
> menjalankan ketiganya.

### Override `fast-uri` naik ke `^3.1.7`, menutup empat advisory sekaligus

`bun audit --audit-level=low` mulai merah lagi meski override sudah ada:
`^3.1.5` di `package.json` tetap resolve ke `fast-uri@3.1.5`, dan versi itu
sendiri yang dinamai empat advisory `high` —
[GHSA-5jgf-p345-68v8](https://github.com/advisories/GHSA-5jgf-p345-68v8),
[GHSA-f65p-4m7j-42xc](https://github.com/advisories/GHSA-f65p-4m7j-42xc),
[GHSA-fph4-wmhf-6fwf](https://github.com/advisories/GHSA-fph4-wmhf-6fwf), dan
[GHSA-jqff-g426-hqxp](https://github.com/advisories/GHSA-jqff-g426-hqxp) —
yang rentangnya (`>=3.0.0 <3.1.6`, `>=3.1.2 <3.1.6`, `>=3.1.3 <3.1.6`) semuanya
masih mencakup `3.1.5`. Rantainya sama seperti override sebelumnya:

```
@astrojs/check › @astrojs/language-server › volar-service-yaml
  › yaml-language-server › ajv-i18n › ajv › fast-uri
```

`ajv` menyatakan `fast-uri: ^3.0.1`, jadi `3.1.7` — rilis patch 3.x terbaru,
dan pertama yang menutup keempat advisory di atas — masih di dalam rentang
yang dinyatakan `ajv` sendiri. `overrides` dinaikkan ke **`^3.1.7`, bukan
`^4.x`**: 4.x melompati mayor pada pustaka parsing URI yang tidak diminta
`ajv` maupun advisory-nya, dan sebuah override yang memaksakan mayor yang
tak teruji lintas dependency transitif adalah risiko baru untuk masalah yang
sudah selesai di 3.x.

Lockfile diregenerasi penuh (`rm -rf node_modules bun.lock && bun install`)
sesuai aturan repo, bukan disunting sebagian. Regenerasi penuh ikut menaikkan
beberapa dependency tak terkait ke versi terbaru yang masih di dalam rentang
`^` masing-masing di `package.json` (a.l. `astro` resolve ke `7.3.1`,
`@astrojs/node` ke `11.1.5`, `@astrojs/sitemap` ke `3.7.4`) — bukan perubahan
kontrak, karena rentang `^` di `package.json` sendiri tidak berubah, dan
`bun run check` + `bun test` tetap hijau sesudahnya.

### Bun naik dari `1.3.14` ke `1.4.2`, dan `bun.lock` ikut berganti format

Pin Bun repo ini naik di kelima nilai sekaligus — `packageManager` dan
`engines.bun` di `package.json`, `bun-version` di kedua job
`.github/workflows/ci.yml`, dan tag `oven/bun` beserta digestnya di kedua
stage `Dockerfile` — mengikuti aturan lima-nilai-plus-digest yang
`tests/versi-toolchain.test.mjs` gerbangi. `bun.lock` diregenerasi penuh
(`rm -rf node_modules bun.lock && bun install`), bukan disunting sebagian,
sesuai aturan repo.

Regenerasi itu bukan sekadar isi lockfile yang berubah — **formatnya sendiri
berubah**: Bun 1.4 menulis `bun.lock` sebagai `lockfileVersion: 2`, sementara
setiap `bun.lock` yang lebih tua di repo ini adalah `lockfileVersion: 1`. Bun
yang hanya memenuhi `engines.bun` LAMA (`>=1.3.0`) tidak bisa mengurai
`lockfileVersion: 2` sama sekali — `bun install --frozen-lockfile` gagal
dengan `error: Unknown lockfile version at bun.lock:2:22`, sebuah pesan yang
menyebut nama berkas dan bukan versi Bun sama sekali. `engines.bun` karena itu
juga naik ke `>=1.4.0`: batas lama menerima versi yang justru tidak bisa
menginstal repo ini sejak `bun.lock` berformat baru.

- Tidak ada perubahan output publik situs mana pun; ini murni kenaikan
  toolchain.
- **Terasa oleh situs yang diturunkan dari template ini sebelum 5 September
  2026, atau yang belum mengikuti kenaikan ini**: begitu `bun.lock` situs itu
  sendiri diregenerasi oleh siapa pun dengan Bun ≥1.4 terpasang lokal — bukan
  mesti oleh perubahan di template ini — instalasi `--frozen-lockfile`
  berikutnya di CI atau `docker build` di sana gagal dengan pesan yang sama,
  selama kelima nilai pin situs itu belum ikut naik. Gejala, sebab, dan
  perbaikannya (lima nilai plus digest, sama seperti aturan repo ini) ditulis
  di [`docs/deploy-coolify.md`](docs/deploy-coolify.md#a-bun-install---frozen-lockfile-that-names-a-lockfile-not-a-bun-version)
  dan [`docs/awcms-astro/checklist-repo-baru.md`](docs/awcms-astro/checklist-repo-baru.md).

### Gerbang `tests/runtime-bun.test.mjs`: tanpa Node.js runtime, dan itu kini diperiksa

Sebuah audit menemukan aturan "Bun adalah satu-satunya runtime repo ini"
sudah benar di setiap tempat yang berarti — `scripts` di `package.json`,
`.github/workflows/*.yml`, `Dockerfile`, dan shebang `server/penyaji.mjs` —
tetapi tidak ada satu pun pemeriksa yang membuktikannya atau mencegahnya
merosot. Persis bentuk yang diperingatkan
[ADR-0030](docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md): benar
hari ini, tidak tertulis sebagai pemeriksa, dan karena itu bisa berhenti
benar tanpa satu pun perintah berubah merah.

[ADR-0050](docs/adr/0050-bun-is-this-repos-only-runtime-and-a-gate-finally-says-so.md)
mencatat keputusannya dan `tests/runtime-bun.test.mjs` menggerbanginya:
tidak ada `node`/`npm`/`npx`/`yarn`/`pnpm` di `scripts`, tidak ada
`engines.node`, tidak ada lockfile/version-file package manager lain di
akar repo, tidak ada `actions/setup-node` atau `node-version:` di workflow
mana pun, `Dockerfile` hanya membangun dan berjalan di atas `oven/bun`, dan
setiap shebang di `scripts/`/`server/` menyebut `bun`. Dua hal dinyatakan
sebagai keputusan mempertahankan yang disengaja, bukan kealpaan: bawaan
`node:*` (implementasi Bun sendiri, bukan dependency Node.js) dan
`@astrojs/node`/`compression` di `dependencies` (keduanya dijalankan OLEH
Bun — resolusi path URL, negosiasi Brotli).

- Tidak ada perubahan perilaku situs; ini murni gerbang CI baru plus
  dokumentasi yang memperbarui hitungan `bun test` dari 38 menjadi 39
  berkas gerbang.
- Terasa saat mengembangkan: sebuah langkah `node`/`npm`/`npx` yang tanpa
  sengaja ditambahkan ke `package.json` scripts atau ke sebuah workflow kini
  gagal `bun test` alih-alih lolos diam-diam.

### README dan cerminnya menyebut 21 berkas gerbang selagi `tests/` berisi 39, dan tak satu gerbang pun membacanya

`tests/documented-counts.test.mjs` sudah menggerbangi hitungan berkas gerbang
`bun test` di empat dokumen sejak 28 Agustus 2026 — tapi `README.md` dan
`README.id.md` tidak pernah masuk daftar itu. Baris tabelnya masih berbunyi
**21**, angka yang sama persis dengan defek yang diperbaiki bulan lalu di dua
dokumen lain, hanyut satu berkas demi satu berkas sejak itu sampai selisihnya
mencapai 18. Daftar cakupan di baris yang sama juga ketinggalan: ia belum
menyebut runtime Bun (ADR-0050), versi toolchain, atau meta-tes atas skrip
audit — semuanya ditambahkan setelah baris itu terakhir ditulis.

Persis bentuk yang [ADR-0030](docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)
peringatkan: benar sekali waktu, tidak tertulis sebagai pemeriksa, dan karena
itu bisa berhenti benar tanpa satu pun perintah berubah merah — kali ini di
dokumen pertama yang dibaca siapa pun yang membuka repo ini.

- Baris `bun test` di kedua README diperbarui ke 39 berkas, dan daftar
  cakupannya diperluas secukupnya agar tetap jujur tanpa jadi enumerasi 39
  butir.
- `tests/documented-counts.test.mjs` diperluas: `README.md`/`README.id.md`
  kini masuk `DOKUMEN` dan pasangan mirrornya, mengikuti pola yang sudah ada
  persis — tidak ada regex atau pesan baru, hanya dua entri lagi yang diikat
  ke hitungan yang sama.
- Tidak ada perubahan perilaku situs; ini murni dokumentasi plus gerbang yang
  sekarang menjaganya.

## [0.5.0] — 2026-09-02

> **Build integrasi tidak berjalan pada rilis ini.** `AWCMS_API_URL` kosong,
> yang normal untuk repo template ini sendiri — jadi `bun run build`,
> `bun run audit:konten`, dan lapis penyaji/CSP di `bun test` DILEWATI, bukan
> lulus. Sebuah situs yang dibangun dari template ini mengisi variabel itu dan
> menjalankan ketiganya.

### Empat dokumen menghitung gerbang repo ini, dan tak satu pun dihitung ulang

[`awcms-astro-gerbang/SKILL.md`](.claude/skills/awcms-astro-gerbang/SKILL.md)
dan [`checklist-repo-baru.md`](docs/awcms-astro/checklist-repo-baru.md) —
beserta kedua cerminnya — memberi tahu pembaca berapa banyak berkas gerbang yang
dijalankan `bun test`. Keduanya berbunyi **21**. Angka sebenarnya 37. Baris yang
sama juga menjanjikan "tiga meta-tes yang menjalankan ulang ketiga skrip audit",
sementara enam meta-tes menjalankan ulang enam dari tujuh.

Tidak ada yang rusak saat sebuah gerbang ditambahkan, dan itulah seluruh
bentuknya: hitungannya lapuk satu berkas demi satu berkas, tiap penambahan tak
terlihat sendirian, dan kesembilan gerbang hijau sepanjang itu.

Yang membuatnya lebih buruk dari biasa: kalimat yang hanyut itu tinggal di
dokumen yang seluruh subjeknya adalah **pemeriksa mana yang ada**. Pembaca yang
ingin tahu apa yang terjaga diberi sebuah angka, dan angka itu satu-satunya hal
di halaman tersebut yang tidak dijaga siapa pun.

- **`tests/documented-counts.test.mjs` membaca kedua angka itu dari keempat
  dokumen** dan membandingkannya dengan isi `tests/`. Asersinya berjangkar pada
  `` `bun test` `` diikuti angkanya — satu pola untuk kedua bahasa dan kedua
  dokumen.
- **Menuliskan angkanya kembali sebagai KATA ikut merah.** Kegagalannya sengaja
  diarahkan ke sana: hitungan yang tidak bisa dibaca lagi adalah hitungan yang
  berhenti dijaga, dan itu harus berbunyi keras, bukan lolos diam-diam.
- **Cermin yang diperbarui sebelah tertangkap terpisah**, dengan pesan yang
  menyebut pasangan mana yang pincang.
- **Baris "Yang TIDAK ditangkap" ikut dipersempit.** Skill itu menyatakan gerbang
  membaca struktur dan bukan prosa; itu kini punya satu pengecualian yang
  disebutkan, karena sebuah angka adalah satu-satunya klaim dalam kalimat yang
  bisa diselesaikan pemeriksa tanpa memahami kalimatnya. Sebuah dokumen yang
  mendaftar apa yang tidak terjaga harus jujur ke dua arah.
- **ADR-0037 melepas hitungan `.astro`-nya.** Paragraf trade-off-nya mematok "28
  berkas `.astro`"; jumlahnya kini 50. Perlakuannya sama seperti angka versi yang
  baru saja dilepas dari ADR yang sama — argumennya tidak butuh angka itu, dan
  sebuah ADR bertanggal adalah tempat terburuk untuk menyimpan nilai yang
  berubah.

### Tabel selisih versi mendapat pemeriksanya, lima hari setelah ia berhenti benar

[`standar-teknis.md`](docs/awcms-astro/standar-teknis.md) §Stack membawa tabel
versi yang dipin repo ini di sebelah yang dipin `awcms`, diperkenalkan sebuah
kalimat yang menyatakan seluruh maksudnya: selisihnya ditulis "supaya tidak
ditemukan ulang sebagai temuan". Pada 23 Agustus 2026 Dependabot
[#60](https://github.com/ahliweb/awcms-astro/pull/60) menaikkan `astro` ke
`^7.2.4` dan `@astrojs/node` ke `^11.1.4`. Pin-nya bergerak; tabelnya tidak.

Selama lima hari berikutnya tiga dokumen mengumumkan ketertinggalan satu minor
yang sudah tidak ada — dan kedua nilai itu kini justru **cocok persis** dengan
`awcms`. Sembilan gerbang hijau sepanjang waktu itu, karena tidak satu pun dari
mereka membaca tabelnya. Paragraf yang menjanjikan selisih ini tidak akan
ditemukan ulang sebagai temuan adalah temuannya sendiri.

Itu bentuk yang [ADR-0030](docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)
sebut namanya, jadi yang mendarat bukan angka yang dikoreksi — angkanya pernah
benar juga.

- **Kolom `repo ini` kini dibuktikan terhadap `package.json` setiap kali
  `bun test` berjalan**, di KEDUA mirror bahasa, lewat
  [`tests/versi-toolchain.test.mjs`](tests/versi-toolchain.test.mjs).
  Parsernya berjangkar pada sel `` `awcms` `` — satu-satunya sel kepala yang
  dieja sama di kedua bahasa — sehingga satu pemeriksa melayani keduanya dan
  tidak ada mirror yang hanyut ke aturan yang tidak dibagi pasangannya.
- **Baris BARU yang tidak digerbangi ikut merah.** Asersinya kesamaan himpunan,
  bukan subset: menambahkan dependency ke tabel tanpa menambahkannya ke daftar
  yang diperiksa adalah cara berikutnya tabel ini menjadi salah tanpa ada yang
  gagal.
- **Kolom `awcms` sengaja TIDAK digerbangi**, dan dokumennya kini mengatakannya
  dengan kata-kata sebanyak itu. Ia menyebut repo lain, dan membacanya berarti
  menaruh jaringan di dalam gerbang yang wajib jalan luring dan sebelum
  `bun install`. Yang bisa dijaga di sini hanyalah bahwa kedua mirror
  menuliskannya sama.
- **ADR-0037 berhenti membawa salinan kedua angkanya.** Ia paragraf yang basi
  itu; sebuah ADR bertanggal, sebuah versi tidak, dan catatan keputusan adalah
  tempat terburuk untuk menyimpan nilai yang berubah. Pernyataan sejarahnya
  tetap — ketertinggalan itu ada pada hari ADR ditulis, dan ditutup 23 Agustus
  2026 — sementara angkanya kini tinggal di satu tabel yang dibaca pemeriksa.

### `astro` naik ke 7.2.9, dan tabel versinya ikut — karena gerbangnya menolak yang tidak

Dependabot menaikkan `astro` dari `^7.2.4` ke `^7.2.9` (grup `minor-dan-patch`),
dan PR-nya **merah**: `tests/versi-toolchain.test.mjs` membandingkan kolom "repo
ini" di `docs/awcms-astro/standar-teknis.md` dengan `package.json`, dan Dependabot
tidak bisa menyunting prosa. Itu gerbang yang bekerja persis seperti maksudnya —
ia lahir dari tabel yang terus mengatakan hal yang sudah berhenti benar selama
lima hari — jadi yang dikerjakan di sini adalah separuh yang memang harus
dikerjakan manusia.

- **Kedua cermin tabel diperbarui**, dan bukan sekadar angkanya. Baris `astro`
  dulu berbunyi "cocok persis" dengan `awcms`; sejak bump ini repo ini **lima
  patch di depan**, karena Dependabot menaikkan repo ini sendirian. Selisihnya
  DICATAT alih-alih ditutup dengan menahan patch: rentang patch `astro` tidak
  membawa kontrak lintas-repo, dan menahan sebuah patch supaya sebuah tabel tetap
  berbunyi "cocok" adalah tabel yang menyetir kode.
- **Kolom `awcms` dibaca dari repo itu pada 2 September 2026** dan barisnya kini
  mengatakan kapan ia dibaca. Kolom itu sengaja tidak digerbangi — ia menyebut
  repo lain, dan gerbang yang butuh jaringan gagal karena sebabnya sendiri — jadi
  yang bisa dilakukan adalah menyatakan umurnya.

Diverifikasi di luar CI, yang melewati build integrasi karena repo template tidak
punya sumber konten: `bun run build` penuh terhadap feed tiruan, `bun run check`,
kesembilan gerbang, dan `bun audit --audit-level=low` — nol kerentanan atas 382
paket.

### Beranda akhirnya menunjukkan isinya, dan gerbang aset menemukan gaya yang salah alamat

Sampai hari ini, seorang pembaca yang mendarat di beranda tidak bisa melihat
**satu judul artikel pun**. Yang ada di sana adalah hero, tiga kartu kanal, dan
tiga baris prinsip penyusunan — ketiganya tentang situs, tidak satu pun berisi
apa yang ditulis situs itu. Untuk sampai ke sebuah artikel, pembaca harus lebih
dulu menebak kanal mana yang memuatnya.

Redesign ini menata ulang beranda dan kromium yang membingkai setiap halaman,
mengikuti rancangan yang dikerjakan bersama pemilik repo.

#### Yang dilihat pembaca

- **Panel "terbaru" di dalam hero** — tiga artikel terbaru lintas kanal, dengan
  nama kanal dan tanggal terbitnya. Ia hilang seluruhnya pada situs yang belum
  punya artikel, dan hero-nya menjadi satu kolom.
- **Pita statistik** — jumlah kanal, jumlah artikel, dan tanggal tinjauan
  termuda di situs. Ia hanya muncul bila ada artikel; sel tanggalnya dilepas
  bila tanggalnya tidak ada.
- **Blok sorotan** — artikel paling baru, dengan gambarnya sendiri, dan baris
  "diperbarui" yang hanya tampil bila artikelnya benar-benar disunting setelah
  terbit ([ADR-0033](docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)).
- **Sorotan dan panel tidak pernah menampilkan artikel yang sama.** Sorotan
  mengambil yang pertama, panel mengambil tiga berikutnya — dari satu daftar,
  dengan **pemutus seri pada slug**, karena dua artikel yang terbit pada detik
  yang sama akan bertukar tempat antar-build tanpa ada yang berubah.
- **Pita utilitas** di atas masthead memuat tagline, pengalih bahasa, dan
  pengalih tema. Ketiganya bukan navigasi isi, dan memindahkannya ke sana yang
  mengosongkan ruang bagi bilah kanal untuk naik ke baris masthead — sehingga
  halaman tidak lagi dibuka dengan dua baris kromium sebelum satu kata isi pun.
- **Bilah kanal menjadi pil, bukan tab bergaris bawah**, karena garis bawah
  hanya terbaca sebagai "yang ini sedang dibuka" selama bilahnya punya baris
  sendiri.
- **Pencarian berbentuk kotak cari** — kaca pembesar, bidang redam — tetapi
  tetap sebuah **tautan** ke `/cari/`. Bentuknya yang dicari mata; `<input>`-nya
  ditolak karena kotak yang menelan ketikan lalu diam tanpa JavaScript lebih
  buruk daripada tidak ada kotak.
- **Footer menjadi permukaan gelap tetap**, bersama pita utilitas dan hero.
  Ketiganya kini memakai kelompok token `--gelap-*` yang tidak ditimpa blok tema
  mana pun.

#### Yang tidak ikut, dan kenapa

**Angka "Skor Lighthouse 100" dari rancangan.** Tidak ada apa pun di build ini
yang mengukurnya, jadi ia akan menjadi klaim yang dicetak setiap halaman dan
diperiksa tidak seorang pun — kelas cacat yang sama dengan `og:image` yang
menunjuk kartu yang tidak pernah dibangkitkan siapa pun, yang sudah pernah
ditolak repo ini. Tiga angka yang tersisa dihitung dari feed yang membangun
halaman itu juga.

**Pita buletin di badan beranda.** Formulirnya tetap di footer, tempat
[ADR-0049](docs/adr/0049-a-reader-may-subscribe-and-the-first-write-from-a-strangers-browser.md)
menaruhnya: ia ada di setiap halaman tanpa pernah menyela apa yang sedang dibaca
seseorang.

#### Dua cacat yang ditemukan sambil jalan

- **Nama situs menempel di tepi kiri layar pada 360px.** `.header-top` menulis
  `padding: 0.85rem 0` — sebuah *shorthand* — di elemen yang juga membawa
  `.container`, sehingga padding samping containernya menjadi nol. Di layar
  lebar hal itu tidak terlihat sama sekali, karena container sudah mentok
  `--max-width` dan margin otomatisnya yang memberi jarak. Diukur, bukan
  ditaksir dari tangkapan layar: `.brand-logo` berada di `x=0`.
- **Penafian di footer tidak terbaca.** `.disclaimer-footer` adalah pembungkus
  dua `<p>`, dan aturan elemen `p { color: var(--text-secondary) }` menargetkan
  paragraf itu langsung — jadi ia menang atas warna yang diwarisi dari
  pembungkusnya, dan penafiannya tampil `#334155` di atas `#090d16`.

#### Gerbang aset menemukan gaya yang salah alamat

`bun run audit:aset` merah lebih dulu, dan yang ditunjuknya bukan beranda:
halaman `/cari/` melewati plafon 36.000 B karena **gaya hero** yang duduk di
`src/styles/global.css` sementara `Home.astro` satu-satunya pemakainya. Setiap
pembaca setiap halaman artikel, halaman seksi, dan halaman pencarian mengunduhnya
tanpa pernah merendernya. Memindahkan bloknya ke `<style>` komponennya
memulangkan **1.853 B ke setiap halaman**, bukan hanya ke yang merah.

- **Plafon total naik 36.000 → 40.000 B**, sebagai pengukuran dan bukan
  kelonggaran: beranda kini halaman terberat pada 38.136 B, dan kelebihannya
  adalah permukaan yang benar-benar baru. Ruang 1.864 B di atasnya sengaja
  sempit — plafon yang dinaikkan dengan kelegaan besar berhenti menangkap akresi
  berikutnya.
- **Yang TIDAK dikerjakan ditulis di dalam skrip gerbangnya**, supaya ia tidak
  diam-diam menjadi keadaan normal: `BaseLayout.css` masih 22.577 B dan masih
  mengirim gaya badan artikel, tabel biaya, dan akordeon ke setiap halaman yang
  tidak punya satu pun di antaranya.
- `docs/awcms-astro/standar-performa-dan-keamanan.md` baris 11 mencatat
  pengukuran barunya, dan `tests/audit-aset.test.mjs` ikut membuktikan plafon
  yang baru — bukan hanya yang lama diubah angkanya.

#### Katalog dan dokumen

Dua belas string antarmuka baru masuk **kedua** katalog PO. `home.cta` berubah
bunyi dari "Mulai dari panduan" menjadi "Baca kanal": kartu kanal dulu
menyambungnya dengan nama kanal HURUF BESAR, sehingga kartu Panduan berbunyi
"Mulai dari panduan PANDUAN".

`docs/awcms-astro/ui-ux-design-system.md` mendapat empat seksi baru — permukaan
gelap tetap, bingkai halaman, permukaan beranda, dan tempat tinggal gaya sebuah
komponen — beserta cerminnya.

Empat dokumen lain diperbaiki karena redesign ini membuat kalimatnya TIDAK BENAR,
bukan sekadar kurang lengkap:

- **`AGENTS.md` §Gambar** berbunyi "setiap pemanggil merender
  `.visual-placeholder`". Hero beranda kini tidak, dan kekecualian itu ditulis
  beserta alasannya supaya ia tidak menyebar lewat peniruan ke bingkai yang
  memang menahan tata letak.
- **`checklist-repo-baru.md` dan skill `awcms-astro-situs-baru`** menjanjikan
  placeholder untuk setiap nama seni yang berkasnya tidak ada, termasuk `hero`.
- **`AGENTS.md` §Antarmuka** mendapat dua pelajaran yang ditemukan gerbang:
  `global.css` dimuat setiap halaman sehingga aturan milik satu komponen adalah
  byte yang dibayar semua halaman lain, dan shorthand `padding` pada elemen
  ber-`.container` menghapus padding sampingnya tanpa terlihat di layar desktop.
- **`standar-teknis.md` dan skill `awcms-astro-performa-keamanan`** menyebutkan
  anggaran gambar tetapi tidak pernah menyebutkan plafon byte skrip dan
  stylesheet sama sekali; keduanya kini menyebutnya berikut angkanya.

### Pengalih bahasa di kedua halaman buletin menawarkan URL yang tidak pernah dibangun siapa pun

`/newsletter/confirm` dan `/newsletter/unsubscribe` WAJIB berada persis di situ,
tanpa prefiks locale: `awcms` yang merangkai tautannya dari
`NEWSLETTER_CONFIRM_PATH` dan `NEWSLETTER_UNSUBSCRIBE_PATH`, dan tautan itu sudah
berada di kotak masuk orang. Itu sudah tertulis di docblock komponennya.

Yang tidak ikut ditulis adalah akibatnya bagi pengalih bahasa. Ia menukar locale
pada path halaman yang sedang dibuka, jadi di kedua halaman itu ia menawarkan
`/en/newsletter/confirm/` dan `/en/newsletter/unsubscribe/` — dua URL yang tidak
pernah dibangun siapa pun. Setiap situs dwibahasa yang menyalakan buletin
menerbitkan dua tautan mati, di halaman yang justru dibuka orang yang baru saja
mengeklik tautan dari email.

`langSwitchPath="/"` mengarahkannya ke beranda tiap locale — pola dan alasan yang
sama persis dengan `NotFound.astro`, satu-satunya halaman lain di repo ini yang
path-nya bukan URL yang bisa ditukar locale-nya.

#### Kenapa ia bertahan selama ini

Gerbang tautan mati di `bun run audit:konten` membaca `dist/client`, dan repo
template tidak punya sumber konten — jadi build integrasinya DILEWATI di CI, dan
lapisan yang bisa melihat cacat ini tidak pernah berjalan di sana. Yang
menemukannya adalah `bun run release`: ia membangun lebih dulu, lalu menjalankan
gerbang itu atas hasilnya, lalu **menolak merilis**. Urutan itu bukan kerapian —
ia satu-satunya alasan cacat ini tidak ikut terbit di v0.5.0.

### ADR-0119 `awcms` mendapat vonisnya, dan satu hitungan dalam prosa berhenti dihitung dari ingatan

`bun run audit:serapan` merah sejak `awcms` menerbitkan ADR-0119 pada 28 Agustus
2026: sebuah keputusan di repo itu yang belum dibaca siapa pun di sini. Itu
persis satu-satunya pemeriksaan yang MENGHADAP KELUAR di repo ini, dan
kegunaannya habis kalau ia dibiarkan merah.

- **ADR-0119 milik `awcms` divonis `diperiksa`.** Ia memutuskan bahwa lencana
  *GitHub Release* dipilih dengan `--latest` eksplisit alih-alih diwarisi dari
  bawaan tanggal-dan-versi milik `gh` — "latest" KEDUA di alur kerja yang sama,
  yang ADR-0117 `awcms` hanya perbaiki separuhnya, dan yang benar-benar mundur ke
  versi empat rilis terlampaui saat run yang terparkir akhirnya disetujui. Di sini tidak ada
  yang berubah: `bun run release` membuat **tag git saja** — repo ini tidak
  menerbitkan GitHub Release, tidak membangun image, dan tidak menggerakkan
  `:latest` apa pun. Barisnya tetap ditulis karena kesenyapan dan
  ketidakrelevanan terbaca sama, dan ia menyebutkan kapan harus dibaca ulang:
  saat repo ini punya alur rilis sendiri.

- **Ringkasan buku besar berhenti mengutip jumlah persisnya.** Cermin Indonesia
  skill integrasi berbunyi "68 ADR bervonis" sementara gerbangnya menghitung 70 —
  hanyut tanpa ada yang melihat, karena tidak satu pun pemeriksa membaca kalimat
  itu. Ia tidak sekadar dikoreksi menjadi angka baru yang akan hanyut lagi:
  angkanya dilepas, dan pembacanya diarahkan ke keluaran `bun run audit:serapan`,
  yang mencetak cakupan, lantai, dan puncaknya setiap kali ia berjalan. Sebuah
  angka yang dihitung mengalahkan angka yang diingat
  ([ADR-0030](docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)).

## [0.4.0] — 2026-08-28

> **Build integrasi tidak berjalan pada rilis ini.** `AWCMS_API_URL` kosong,
> yang normal untuk repo template ini sendiri — jadi `bun run build`,
> `bun run audit:konten`, dan lapis penyaji/CSP di `bun test` DILEWATI, bukan
> lulus. Sebuah situs yang dibangun dari template ini mengisi variabel itu dan
> menjalankan ketiganya.

### An empty backlog stops reddening `bun test`

`tests/versi-changeset.test.mjs` asserted that `.changesets/` holds at least one
entry. The reasoning was sound — an empty directory makes every assertion under
it vacuously true, and a suite that checks nothing reads exactly like a suite
that found nothing (ADR-0030).

But an empty backlog is the state **a release leaves behind**: `bun run release`
folds every changeset into `CHANGELOG.md` and deletes it. The assertion turned
`main` red for the entire window between a release and the next change to land,
which is precisely the window in which nobody has done anything wrong. It was
written on 17 August 2026 and nothing reached the state it forbade until v0.3.0
was cut — the first release since it existed.

The guard it was really built for survives, asked from the other side: a `.md`
file present in the directory and read by no assertion below. Posing the
question in terms of the directory rather than of `isChangesetFile` means a
future narrowing of that filter shows up here as **files silently excluded from
the version**, rather than as nothing at all.

The end-to-end derivation test now returns early on an empty set, and says why:
the arithmetic itself is proven above over inputs the file supplies, and
`bun run release` already refuses "no changesets, no level" at the command
line — where a person can answer it.

### A reader can finally subscribe, confirm, and leave

`awcms` shipped a `newsletter` module on 21 August 2026 with three anonymous
public endpoints. A reader of a site built from this template could reach none
of them. The caller landed here on 27 August behind a hard-coded
`newsletterAktif = false`, because reading that repo's source rather than
assuming turned up **four** things that made the endpoint unreachable from a
static site.

All four are now closed by `awcms`
[ADR-0118](https://github.com/ahliweb/awcms/pull/748), and the three paths are
frozen in its `COMMITTED_PATHS` — the order both repos' Definition of Done
requires. The fourth blocker is worth naming on its own: the confirmation link
was built on the CMS's own origin, where no such page exists, so **double opt-in
had never worked for anyone at all**.

#### What a site gets

`SITE_NEWSLETTER=true` turns on three surfaces together
([ADR-0049](docs/adr/0049-a-reader-may-subscribe-and-the-first-write-from-a-strangers-browser.md)),
and only where `AWCMS_API_URL` is set:

- a subscribe form in the site footer — present on every page, interrupting
  nothing;
- `/newsletter/confirm`, where the link in the confirmation email lands;
- `/newsletter/unsubscribe`, which asks for one click and nothing else.

Those two page paths are **not this repo's to rename**: `awcms` builds the link
it emails from them, so a renamed page breaks a link already sitting in
somebody's inbox.

#### Three decisions worth reading before touching it

- **The token is posted on a CLICK, never on page load.** Link scanners in mail
  clients fetch every URL in a message before its recipient sees it. A page that
  posted on load would record an unsubscribe nobody asked for — and, on the
  confirmation page, record consent no human ever gave.
- **The neutral answer is rendered as-is.** `awcms` says the same sentence for a
  new address, an already-active one, a spent token and one that never existed.
  A client-side "that address is already subscribed" would rebuild the
  enumeration oracle from the one place nobody would think to look.
- **The privacy page grows a section when, and only when, the form does.** An
  email address is the first per-person data this site asks a reader FOR.

This is the fourth call in this repo made from a reader's browser, and the first
that WRITES: a submission makes `awcms` send mail to an address somebody typed.
`tests/kontrak-awcms.test.mjs` now asserts thirteen called surfaces, and the
promised-but-not-called block is empty for the first time since it existed.

## [0.3.0] — 2026-08-28

> **Build integrasi tidak berjalan pada rilis ini.** `AWCMS_API_URL` kosong,
> yang normal untuk repo template ini sendiri — jadi `bun run build`,
> `bun run audit:konten`, dan lapis penyaji/CSP di `bun test` DILEWATI, bukan
> lulus. Sebuah situs yang dibangun dari template ini mengisi variabel itu dan
> menjalankan ketiganya.

### Dokumen dan skill disamakan dengan keadaan `awcms` per 13 Agustus 2026, dan satu premis keamanan yang gugur diberi nama

Sinkronisasi terakhir menyerap keadaan `awcms` sampai ADR-0071 (8 Agustus 2026).
Sejak itu sisi sana melanjutkan sampai ADR-0092 — dua puluh satu keputusan dalam
lima hari — dan sebagian di antaranya membuat kalimat di repo ini berhenti
benar. Yang paling mahal bukan yang usang melainkan **empat kalimat yang
menyuruh pembacanya melakukan hal yang salah**, dan keempatnya diperbaiki lebih
dulu.

#### Empat kalimat yang menyesatkan, dan akibatnya

- **Scope token build ditulis satu kunci, padahal butuh dua.** `README.md`
  menuntut `blog_content.posts.read` saja; `.env.example` sudah menuntut
  `media_library.media.read` juga. Yang mengikuti README akan membangun situs
  pertamanya sampai **setiap halaman selesai dirender**, lalu gagal 403 di
  `scripts/asal-media.mjs` — langkah terakhir `bun run build` — dengan pesan
  yang terbaca seperti deployment rusak, bukan izin kurang.
- **`awcms-micro` direkomendasikan sebagai jalan keluar** untuk kebutuhan
  publikasi seketika, padahal ia **arsip** sejak 2 Agustus 2026 — dinyatakan
  dua kali di berkas yang sama. Penggantinya: permukaan publik `awcms` sendiri
  di `/blog/{tenantCode}/**`.
- **Checklist repo baru menyarankan menyajikan `/news/**` dari `awcms`.** Rute
  itu **dihapus** di sana pada 8 Agustus 2026 dan kini 301 ke
  `/blog/{tenantCode}/**`; menyarankannya sekaligus melanggar
  [ADR-0036](docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)
  repo ini sendiri.
- **Tabel design token menyebut webfont Inter dan Outfit** yang tidak ada di
  `src/styles/global.css` — satu-satunya temuan yang bisa membuat orang
  **menambah** dua origin ke jalur render kritis situsnya atas dasar dokumen.

#### Premis keamanan yang gugur, dan diberi nama alih-alih ditambal

`awcms` ADR-0092 (13 Agustus 2026) membuka kelas kredensial mesin yang boleh
**menulis**. Sampai hari itu "kredensial mesin tidak bisa menulis" adalah sifat
KELAS, dan tiga berkas di sini mengutipnya sebagai dasar kenapa scope token build
boleh dipercaya.

Token build repo ini tetap tidak bisa mengubah apa pun — tetapi karena ia
diterbitkan tanpa satu pun aksi tulis, yaitu properti **barisnya**, bukan
kelasnya. Menjaganya begitu kini keputusan penerbitan yang harus dipertahankan.
Dinyatakan di `.env.example`, di `README.md`, dan sebagai banner pada
[ADR-0018](docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md) —
banner, karena badan sebuah ADR adalah rekaman dan menyuntingnya akan
memalsukannya.

Satu penolakan `awcms` yang baru juga mendapat nama, karena ia menggagalkan build
**total** sambil terbaca persis seperti token dicabut, dan tidak bisa diperbaiki
dari repo situs: `403 TENANT_SUSPENDED` (ADR-0073 di sana; kini mengenai
kredensial mesin, dan `inactive` diperlakukan sama dengan `suspended`).
`403 ENTITLEMENT_REQUIRED` (ADR-0084) dicatat sebagai kosakata, **bukan** sebagai
mode kegagalan: entitlement diputuskan per modul, dan tidak satu pun modul di
balik ketiga permukaan yang dipanggil build mendeklarasikannya hari ini —
menuliskannya sebagai sebab yang mungkin akan mengirim orang mencari masalah yang
tidak ada.

#### Peran kedua repo ini akhirnya punya dokumennya

Repo ini memikul dua peran sejak
[ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md),
dan keenam dokumen di `docs/awcms-astro/` seluruhnya ditulis untuk peran
pertama. Bahan peran kedua terserak di ADR — format rekaman keputusan, bukan
panduan.

`docs/awcms-astro/permukaan-admin-user.md` mengumpulkannya: batas "apa yang
dikelola" alih-alih audiens, cara menyatakannya beserta lima penolakan
`tests/peran-situs.test.mjs`, apa yang berubah begitu satu rute keluar dari
`output: 'static'`, kontrak ke `awcms` yang **belum** ada, dan sebelas fakta
model identitas `awcms` yang harus ditiru alih-alih ditebak — di antaranya
lockout yang kini GLOBAL (salinan UI yang menulis "hanya untuk situs ini" akan
berbohong), MFA yang pindah ke principal, dan `409` seleksi tenant yang
**sengaja** tidak membawa daftar keanggotaan sehingga layar "Anda anggota tenant
mana saja" tidak boleh dirancang.

Ia sengaja **dokumen, bukan skill**: hari ini `permukaanAdmin` kosong di
template dan tidak ada satu baris kode permukaan terautentikasi, jadi sebuah
skill akan memerikan prosedur atas kode yang belum ada — persis yang
`.claude/skills/README.md` larang.

#### Satu keputusan baru, dengan pemeriksanya

[ADR-0037](docs/adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md)
— pin TypeScript 6.x adalah syarat hidupnya gerbang `astro check`.
`@astrojs/check` menuntut API programatik TypeScript 6.x; `awcms` sudah di 7.0.2
dan karena itu **kehilangan** type-check seluruh berkas `.astro`-nya, tercatat di
manifest keluarganya sebagai divergence yang menyandarkan diri secara eksplisit
pada repo ini masih berada di `^6.0.3` — "which is the only reason its gate
runs".

Tanpa ADR ini, menaikkan TypeScript ke 7.x terbaca sebagai pemeliharaan rutin,
dan yang terjadi adalah gerbang `Type check` **berhenti ada** dengan setiap
perintah tetap hijau. Pemeriksanya mendarat bersamanya di
`tests/versi-toolchain.test.mjs`, dua asersi (pin, dan keberadaan
`@astrojs/check` — tanpa yang kedua, yang pertama menjaga sesuatu yang sudah
tidak ada), keduanya dibuktikan merah lewat mutasi.

#### Selebihnya

- Paragraf pembuka `AGENTS.md` berhenti membantah §Peran repo ini di berkas yang
  sama; kolom "Audiens" pada tabel peran diganti "apa yang dikelola" — sumbu yang
  justru dicabut `awcms` ADR-0070.
- Kosakata URL yang dibelah, kontrak konsumen yang beku, dan dua gerbang peran
  (`tests/peran-situs.test.mjs`, `tests/kosakata-news.test.mjs`) masuk kontrak
  kerja dan Definition of Done — ketiganya sebelumnya tidak disebut satu baris
  pun di sana.
- Tabel "Keputusan `awcms`" di skill integrasi disegarkan: baris ADR-0059
  dicabut (ia memerikan rute yang sudah tidak ada), enam baris baru masuk, dan
  tujuh belas ADR yang **tidak** relevan disebut namanya, dikelompokkan menjadi
  tujuh gugus — supaya diamnya tabel bisa
  dibedakan dari "belum diperiksa".
- Hitungan celah `sembilan` → `sepuluh` di enam berkas; celah 10 sudah ditutup
  6 Agustus 2026 dan hanya dokumen standarnya yang mencatatnya.
- Cacat `awcms` 10 Agustus 2026 yang layak dibaca sebagai peringatan di sini:
  handler statis `@astrojs/node` berjalan sebelum middleware, sehingga setiap
  berkas `dist/client` di sana keluar tanpa satu pun header keamanan.
  Perbaikannya persis bentuk `server/penyaji.mjs` — header sebagai LANTAI
  sebelum mendelegasi — jadi jangan pernah "menyederhanakan" penyaji di sini
  dengan memanggil handler adapter langsung.

### Advisory `nanoid` ditutup lewat override, dan gerbang `bun audit` hijau lagi

`bun audit --audit-level=low` di job `check` mulai merah untuk **setiap** PR,
tanpa satu pun berkas repo ini berubah: advisory
[GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8)
(`high`) terbit untuk `nanoid < 3.3.18`, dan rantainya
`astro › vite › postcss › nanoid` menahan `^3.3.16` — yang resolve ke `3.3.17`.

Itu bentuk kegagalan yang paling mudah salah dibaca: gerbangnya merah pada PR
dokumen yang tidak menyentuh satu dependency pun, sehingga penulisnya mencari
sebabnya di tempat yang salah.

`postcss` belum melonggarkan rentangnya, jadi menaikkan `astro` tidak
memperbaikinya — PR Dependabot yang menaikkan `astro` ke 7.2.0 membawa
`nanoid@3.3.17` yang sama. Yang menutupnya adalah **override**, pola yang sudah
dipakai repo ini untuk `fast-uri`: satu baris di `package.json`, dan lockfile
yang menuliskannya.

`3.3.18` adalah rilis patch murni dari cacat yang sama (`nanoid(0)` bisa
berputar tanpa henti pada generator kustom), jadi tidak ada permukaan API yang
berubah.

### HSTS tidak pernah terkirim di produksi, dan gerbangnya kini membaca ARTEFAK alih-alih sumber

Ditemukan saat memverifikasi deploy produksi pertama, 14 Agustus 2026:
`awcms-astro.ahlikoding.com` menjawab `200` dengan lima header keamanannya —
dan **tanpa `Strict-Transport-Security`**, meski `NODE_ENV=production`
terpasang di container.

#### Sebabnya bukan konfigurasi

`bun build --target=bun` **melipat** `process.env.NODE_ENV` bertitik menjadi
literal saat bundling. `dist/server/penyaji.mjs` yang tayang karena itu memuat:

```js
headerKeamanan(produksi = false)
```

Nilainya dibekukan pada saat build, bukan dibaca saat proses berjalan — jadi
tidak ada nilai `NODE_ENV` di container yang bisa menyalakannya kembali.

#### Kenapa tak satu gerbang pun melihatnya

Ketiga asersi HSTS yang ada mengimpor `server/penyaji.mjs` — **sumbernya** —
tempat gerbang produksi memang masih benar. Yang dikirim ke pembaca adalah
bundelnya. Ini persis kelas cacat yang repo ini berulang kali tulis aturannya,
kali ini mengenai repo ini sendiri: hijau di setiap gerbang yang tidak mengukur
respons sungguhan.

#### Perbaikan, dan pemeriksanya

Satu bentuk akses: `process.env["NODE_ENV"]`. Bentuk bracket, `Bun.env`, dan
`globalThis.process.env` ketiganya **selamat** dari pelipatan; yang bertitik
tidak.

Pemeriksanya menjalankan **artefaknya**: `tests/penyaji.test.mjs` menyalakan
`dist/server/penyaji.mjs` dua kali dan menuntut HSTS **ada** pada
`NODE_ENV=production` sekaligus **absen** di luar itu — dua arah, karena satu
pratinjau lokal yang mengirimkannya mengunci setiap proyek di `localhost`
selama setahun ([ADR-0029](docs/adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)).

Ia dibuktikan merah terhadap artefak **yang sedang tayang** sebelum
perbaikannya mendarat, bukan terhadap mutasi buatan. Karena `Dockerfile`
menjalankan `bun test tests/penyaji.test.mjs` sesudah `bun run build`, sebuah
image yang kehilangan header keenam kini berhenti bisa dibangun.

### Kebutuhan backend mendapat ALAMAT beserta pemeriksanya, dan keadaan `awcms` 13 Agustus 2026 malam diserap

Peran repo ini sudah tertulis di enam berkas, dan seluruhnya dalam bentuk
**negatif**: "tak pernah sumber kebenaran", "tanpa basis data", "seluruh API di
`awcms`". Negatif tidak pernah memberi alamat. Tidak satu pun mengatakan apa
**satuan** sebuah kebutuhan backend, ke mana ia pergi, atau bagaimana seseorang
tahu ia sedang membangun satu.

#### Satu keputusan baru, dengan pemeriksanya

[ADR-0038](docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md) —
**satuan sebuah kebutuhan backend adalah MODUL di `awcms`**, lewat admission
modul di sana, bukan folder di sini.

Yang membuat alamat itu menentukan bukan kerapian: **kewajiban keluarga menempel
pada MODUL, bukan pada kode.** Modul membawa deskriptornya, izinnya di katalog,
tabelnya di bawah RLS, jejak auditnya, deskriptor retensinya, dan sejak `awcms`
ADR-0094 deskriptor subjek datanya. Data yang lahir di repo ini lahir di luar
semuanya — dan sebuah tabel yang tidak pernah lewat admission modul adalah tabel
yang tidak bisa menjawab "apa yang kalian simpan tentang saya", tanpa seorang pun
tahu ia tidak bisa.

Bentuk pelanggarannya bukan pembangkangan melainkan langkah paling masuk akal
yang tersedia: sebuah situs butuh formulir kontak yang tersimpan, dan yang
terdekat adalah satu rute di sini plus satu tabel "sementara" — dengan **setiap
gerbang tetap hijau**, karena tidak satu pun membaca `package.json` menurut kelas
paketnya.

Pemeriksanya mendarat bersamanya (ADR-0030):
[`tests/tanpa-backend.test.mjs`](tests/tanpa-backend.test.mjs), empat asersi,
keempatnya dibuktikan merah lewat mutasi — dependency kelas backend, `fetch`
ber-`method` selain `GET` di `src/`/`scripts/`, artefak persistensi, dan
hilangnya aturan ini dari `AGENTS.md`. Asersi kedua sekaligus menutup celah yang
sinkronisasi 13 Agustus tinggalkan terbuka: sejak `awcms` ADR-0092 membuka kelas
kredensial mesin yang boleh MENULIS, "build ini tidak bisa mengubah apa pun"
berhenti menjadi sifat kelas dan menjadi properti yang harus dijaga — dan sampai
sekarang ia hanya dijaga sebuah kalimat. Konsekuensi yang disengaja: **hari BFF
ADR-0014 mendarat, gerbang itu merah**, karena jalur tulis dari repo ini adalah
keputusan yang harus dinyatakan.

Yang gerbang itu **tidak** lihat, dan ditulis alih-alih dibiarkan tersirat: ia
memeriksa bentuk, bukan niat. Situs yang menyimpan datanya di layanan pihak
ketiga lewat `GET` lolos keempat asersi.

#### Keadaan `awcms` sesudah sinkronisasi sebelumnya, pada hari yang sama

Sinkronisasi 13 Agustus 2026 berhenti di `awcms` ADR-0092. Sisi sana melanjutkan
sampai ADR-0094 pada malam yang sama.

- **`403 PARTNER_SUSPENDED` (`awcms` ADR-0093) — mode kegagalan build BERSYARAT,
  dan yang pertama yang bergantung pada siapa MENERBITKAN token.** Ia menolak
  aktor **terdelegasi** di chokepoint, per permintaan. Kredensial mesin mewarisi
  `principal_kind` akun layanannya, dan tidak ada apa pun di jalur penerbitan
  sana yang melarang akun layanan itu berupa tenant user terdelegasi — bentuk
  yang persis muncul saat sebuah agensi membangun situs pelanggannya. Aturannya
  karena itu operasional: **terbitkan token build atas akun layanan milik tenant
  situs.** Diagnosisnya sengaja dipersulit oleh keputusan yang benar di sana:
  suspensi membuat grant **tidak berlaku, bukan tidak ada**, jadi memeriksa
  daftar grant tidak menunjukkan sesuatu yang hilang. Diserap di `AGENTS.md`
  §Sumber data, tabel diagnosis [`deploy-coolify.md`](docs/deploy-coolify.md),
  `.env.example`, dan docblock [`src/lib/awcms/tenant.ts`](src/lib/awcms/tenant.ts).
- **`awcms` ADR-0094 — subjek data dijawab PER TENANT.** Nol pekerjaan adapter,
  satu kewajiban yang harus dinyatakan: situs statis memegang **salinan**, jadi
  anonimisasi di sana tidak menjangkau berkas yang sudah terbit sampai build
  berikutnya — dan salinan yang tersebar bisa hidup lebih lama lagi (cache CDN,
  riwayat git `dist/`). Yang membuat itu tidak menjadi masalah hari ini adalah
  **keputusan, bukan kebetulan**: template ini menerbitkan nol data per-orang —
  `author` JSON-LD `Organization` (digerbangi `tests/schema.test.mjs`) dan
  `<author>` feed nama situs (keputusan di `src/lib/feed.ts` yang **tidak**
  digerbangi, dan dicatat begitu). Situs yang menambah byline, avatar, atau komentar
  mengambil kewajibannya, dan jalur penghapusannya berakhir di sebuah rebuild.
- **Layar `/admin/*` `awcms` menjadi 40 tingkat atas dari 42** (`business-scope`
  dan `subject-requests` mendarat sesudah sinkronisasi sebelumnya). Dua di
  antaranya menyentuh operasi situs secara langsung dan karena itu disebut
  namanya: `/admin/machine-credentials` — menerbitkan **dan mencabut** token
  build kini sebuah layar, bukan `POST` yang harus diingat seseorang saat token
  bocor — dan `/admin/subject-requests`.
- `moduleDescriptorContractVersion` keluarga **4.0.0** (dari 3.1.0). Nol
  pekerjaan di sini: repo ini tidak mendeklarasikan satu deskriptor modul pun.

#### Satu pesan galat yang menyuruh pembacanya melakukan hal yang salah

Sinkronisasi sebelumnya memperbaiki scope token "satu kunci" di `README.md`,
`.env.example`, dan `deploy-coolify.md`, tetapi tidak menyentuh **kode**.
`src/lib/awcms/tenant.ts` masih menyuruh menerbitkan token "scoped to
`blog_content.posts.read` **and nothing else**" — persis resep yang gagal 403 di
langkah TERAKHIR `bun run build`, setelah setiap halaman selesai dirender.
Diperbaiki, sekaligus menunjuk layar penerbitnya dan kelas baca yang wajib
dipertahankan.

#### Gerbang

Kelima hijau: `check` (0 error atas 79 berkas), `bun test` (362 lulus, 20
berkas), `audit:konten`, `audit:dokumen` (973 kutipan ADR, 317 ditandai milik
repo lain), `audit:graf`.

### Buku besar terjemahan mencapai NOL, dan gerbang permukaan kilau berhenti membaca separuh

Fase kelima dan terakhir [ADR-0039](docs/adr/0039-english-is-the-source-language.md):
dua belas dokumen terakhir — enam di [`docs/awcms-astro/`](docs/awcms-astro/README.md),
lima di [`jualanku/`](docs/awcms-astro/jualanku/README.md), dan
[`deploy-coolify.md`](docs/deploy-coolify.md) — kini berbahasa Inggris di
jalur telanjangnya. **`DOCS_AWAITING_MIRROR` kosong**: 53 cermin, nol utang.
Migrasi 52 dokumen yang ADR-0039 jadwalkan selesai dalam lima commit.

- **Gerbang permukaan kilau membaca SATU berkas, dan tabelnya baru saja punya
  cermin.** `scripts/audit-dokumen.mjs` membandingkan tabel bertanda di
  [`ui-ux-design-system.md`](docs/awcms-astro/ui-ux-design-system.md) dengan
  `src/styles/global.css` dua arah — tetapi hanya di sumbernya. Ia kini membaca
  keduanya, dan dibuktikan dengan mutasi: satu baris dihapus dari cermin → tepat
  satu pelanggaran. Ini kejadian KEDUA dari kelas cacat yang sama dalam lima
  fase (yang pertama tabel permukaan `awcms` di skill integrasi), dan keduanya
  punya bentuk identik: sebuah tabel yang digerbangi terhadap kode, dengan
  cerminnya tidak ikut digerbangi.
- **Kepala tabelnya adalah literal yang dilewati gerbang**, jadi menerjemahkannya
  saja sudah cukup untuk memerahkan berkas yang benar: `permukaanDokumen()`
  melewati kolom bernama `Permukaan`, dan `Surface` akan terbaca sebagai
  selector. Kini keduanya dilewati — pola yang sama dengan kolom status ADR yang
  menerima dua bahasa sejak fase pertama.
- **Tiga klaim yang menua diperbaiki**, seluruhnya di
  [`checklist-repo-baru.md`](docs/awcms-astro/checklist-repo-baru.md): versi
  Bun disebut konsisten di "tiga tempat" — menghitung BERKAS, kesalahan yang
  [ADR-0030](docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) ditulis
  untuk mengakhirinya dan yang sudah diperbaiki di `AGENTS.md` tetapi tidak di
  sini; `bun test` disebut 20 berkas padahal 21; dan anggaran gambar disebut
  "belum punya pemeriksa" padahal ia diukur `audit:konten` sejak 4 Agustus 2026.
- **`audit:translation` masuk ke tiga daftar gerbang** yang sebelumnya menyebut
  lima: checklist repo baru, tabel gerbang mutu
  [`standar-teknis.md`](docs/awcms-astro/standar-teknis.md), dan blok rilis
  pertama.
- **Sembilan tautan ber-anchor diperbarui** karena heading yang diterjemahkan
  memindahkan anchor-nya, dan `audit:dokumen` sengaja tidak memeriksa anchor —
  `#aksesibilitas` → `#accessibility`, `#performa` → `#performance`,
  `#stack` → `#the-stack`, `#kapan-memilih-awcms-astro` →
  `#when-to-choose-awcms-astro`. Sama seperti fase ketiga: hanya membacanya yang
  menemukan ini.

**Yang tetap perlu mata manusia:** ADR-0039 §6 menuntut tinjauan atas ADR dan
atas bagian `docs/awcms-astro/` yang menyatakan kebijakan mengikat. Gerbang
membuktikan cermin tidak basi; ia tidak bisa membuktikan terjemahannya setia,
dan selisih "wajib" versus "boleh" memindahkan sebuah keputusan.

### Dua puluh lima ADR menjadi Inggris, dan indeksnya berhenti berbeda bahasa dari isinya

Fase keempat [ADR-0039](docs/adr/0039-english-is-the-source-language.md), dan
yang terbesar: ADR-0014 sampai ADR-0038 kini berbahasa Inggris di jalur
telanjangnya. Buku besar tunggu menyusut 37 → 12, dan yang tersisa seluruhnya di
[`docs/awcms-astro/`](docs/awcms-astro/README.md) plus
[`deploy-coolify.md`](docs/deploy-coolify.md).

- **Indeksnya sudah Inggris sejak fase pertama; isinya belum.**
  [`docs/adr/README.md`](docs/adr/README.md) mendaftarkan 26 keputusan dengan
  judul Inggris, sementara tiap berkasnya membuka dengan judul Indonesia. Gerbang
  indeks tidak membandingkan judul — ia membandingkan nomor, keberadaan berkas,
  dan kolom status — jadi selisih itu tidak pernah merah dan hanya terlihat oleh
  yang membuka keduanya. Sekarang keduanya sepakat.
- **Label header ADR mengikuti [ADR-0039](docs/adr/0039-english-is-the-source-language.md),
  yang ditulis Inggris sejak lahir**: `Status`/`Date`/`Related`, ditambah
  `Owner's rule`, `Supersedes`, `Narrows`, `Amends`, dan `Counterpart in awcms`
  sesuai yang dipakai masing-masing. **`- **Status:**` sengaja tidak disentuh** —
  ia satu-satunya baris yang diurai `scripts/audit-dokumen.mjs`, dan kata
  "Status" kebetulan sama di kedua bahasa.
- **Nama berkas ADR TIDAK diterjemahkan**, dan itu keputusan. Ada 843 kutipan
  lokal `ADR-NNNN` beserta ratusan tautan yang menyebut slug Indonesianya; slug
  adalah ALAMAT, bukan prosa, dan menerjemahkannya akan memutus setiap tautan
  lintas-repo yang sudah menunjuk ke sini. Alasan yang sama berlaku untuk
  `permukaanAdmin`, `urutanSeksi: "terbaru"`, dan kosakata konfigurasi lain yang
  dibiarkan apa adanya di dalam prosa Inggris.
- **Badan ADR diterjemahkan, bukan disegarkan.** Beberapa memuat kalimat yang
  sudah berhenti benar dan sengaja dibiarkan — banner ADR-0018 dan ADR-0029,
  butir bercoret di ADR-0015 dan ADR-0021, dan kalimat ADR-0020 yang menyebut
  dirinya "tidak ditulis ulang; ia benar pada 2 Agustus 2026". ADR adalah rekaman
  keputusan pada satu titik waktu; menyunting isinya sambil menerjemahkan akan
  memalsukan rekaman itu, dan setiap ADR yang menyatakannya sendiri kini
  menyatakannya dalam dua bahasa.
- **Peringatan yang tersisa untuk peninjau:** gerbang terjemahan membuktikan
  cermin tidak basi, bukan bahwa terjemahannya setia. ADR-0039 §6 menuntut
  tinjauan manusia atas ADR justru karena selisih "wajib" dan "boleh" memindahkan
  sebuah keputusan. Dua puluh lima berkas ini pantas dibaca sebelum merge.

### Empat dokumen pintu depan menjadi Inggris, dan dua gerbang berhenti hijau karena kebetulan

Terjemahan pertama di bawah
[ADR-0039](docs/adr/0039-english-is-the-source-language.md): `README.md`,
`AGENTS.md`, [`docs/adr/README.md`](docs/adr/README.md), dan
[`docs/awcms-astro/README.md`](docs/awcms-astro/README.md) kini berbahasa
Inggris di jalur telanjangnya, dengan cermin Indonesianya di `<nama>.id.md`.
Buku besar tunggu menyusut 52 → 48, dan ia hanya boleh bergerak ke arah itu.

- **Dua gerbang memeriksa AGENTS.md dan keduanya rusak oleh terjemahan** —
  satu dengan berbunyi, satu dengan diam. `tests/tanpa-backend.test.mjs`
  mencari frasa "kebutuhan backend … modul" dan langsung MERAH. Yang kedua
  lebih buruk: `tests/peran-situs.test.mjs` mencari `/publik/i` dan tetap
  hijau — bukan karena prosanya menyatakan bawaan publik, melainkan karena
  nama berkas `0034-publik-secara-bawaan-...md` muncul di sebuah tautan.
  Keduanya kini memeriksa KEDUA berkas, masing-masing dalam bahasanya sendiri,
  dan yang kedua membuang tautan lebih dulu supaya yang dinilai adalah
  kalimatnya. Ini kelas cacat yang akan berulang di tiap fase: gerbang
  terjemahan menjaga cermin tetap SEUSIA sumbernya, bukan tetap MEMUAT apa
  yang sumbernya muat.
- **Klaim "lima gerbang" diperbaiki di empat tempat** yang masih hidup
  (deskripsi skill gerbang, checklist go-live skill performa-keamanan, dan dua
  baris kepatuhan di
  [`standar-performa-dan-keamanan.md`](docs/awcms-astro/standar-performa-dan-keamanan.md)).
  Gerbangnya enam sejak `audit:translation` mendarat. Sebutan "kelima gerbang"
  di ADR dan CHANGELOG sengaja DIBIARKAN: keduanya catatan bertanggal, dan
  benar saat ditulis.
- **Satu tautan ber-anchor diperbaiki di kedua README** — menerjemahkan sebuah
  heading memindahkan anchor-nya, dan `audit:dokumen` sengaja tidak memeriksa
  anchor.

### Enam dokumen akar menjadi Inggris, dan sebuah anchor yang tidak dijaga siapa pun

Fase ketiga [ADR-0039](docs/adr/0039-english-is-the-source-language.md):
[`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md),
[`GOVERNANCE.md`](GOVERNANCE.md), [`SUPPORT.md`](SUPPORT.md),
[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), dan
[`.changesets/README.md`](.changesets/README.md). Buku besar tunggu menyusut 43 → 37.

- **Tautan ber-anchor menyeberangi terjemahan tanpa satu pun gerbang di
  belakangnya.** `SUPPORT.md` menunjuk `CONTRIBUTING.md#terjemahan` dan
  `CONTRIBUTING.md` menunjuk `GOVERNANCE.md#kapan-sebuah-perubahan-butuh-adr`;
  menerjemahkan sebuah heading memindahkan anchor-nya, dan `audit:dokumen`
  sengaja tidak memeriksa anchor (menebak slugifikasi heading GitHub). Keduanya
  diperbaiki ke anchor Inggrisnya. Ini kelas cacat yang hanya bisa ditemukan
  dengan membacanya — sama seperti fase sebelumnya, gerbangnya tidak akan
  memberi tahu.
- **Definition of Done di `CONTRIBUTING.md` tertinggal satu gerbang.** Ia
  menyebut tiga audit sementara [`AGENTS.md`](AGENTS.md) — daftar yang
  mengikat, dan yang dirujuk berkas ini sendiri — sudah menyebut empat sejak
  `audit:translation` mendarat. Klaim "menjalankan kelimanya" juga diganti
  dengan menyebut keenam perintah perilis satu per satu, berikut yang ketujuh
  yang hanya dijalankan CI. Angka yang tidak menyebut isinya adalah angka yang
  menua tanpa ketahuan.
- **§Terjemahan sekarang menyebut kedua arah.** Berkas itu mengatur terjemahan
  katalog PO — antarmuka, locale bawaan `id` — sementara ADR-0039 mengatur
  terjemahan DOKUMEN dengan arah yang berlawanan. Satu berkas yang memuat kata
  "terjemahan" dua kali dengan dua arah yang berbeda adalah tempat paling wajar
  seseorang salah membaca yang mana.
- **Status ADR yang ditolak ditulis `Rejected`, bukan `Ditolak`.** Kosakata
  status di `docs/adr/` seluruhnya Inggris (`Accepted`, `Superseded by`), dan
  nilai yang belum pernah dipakai satu ADR pun lebih baik ikut ke sana
  sekarang daripada dipertahankan sendirian.

### Inggris menjadi bahasa sumber dokumen, dan tiga gerbang bergerak lebih dulu

Repo ini mengadopsi format dwibahasa keluarga AWCMS
([ADR-0039](docs/adr/0039-english-is-the-source-language.md), mengikuti
`awcms` ADR-0097): **Inggris di jalur telanjang `<nama>.md` adalah sumber yang
berwenang, Indonesia di `<nama>.id.md` adalah cerminnya**, dan cerminnya memikul
`<!-- i18n-source-hash: sha256:... -->` yang mencatat hash sumbernya. Gerbangnya
MENDETEKSI penyimpangan; ia tidak pernah menerjemahkan, dan tidak ada panggilan
API terjemahan dari CI.

Yang mendarat sekarang mekanismenya, bukan terjemahannya. Nol prosa berubah:
seluruh 52 dokumen dalam cakupan masuk ke buku besar `DOCS_AWAITING_MIRROR` yang
**hanya boleh menyusut**, dan ADR-0039 sendiri adalah pasangan pertama —
ditulis Inggris, dicerminkan pada perubahan yang sama, sengaja tidak ada di buku
besar itu.

- Gerbang baru `bun run audit:translation`
  ([`scripts/check-docs-translation.mjs`](scripts/check-docs-translation.mjs),
  logika murni di
  [`scripts/lib/docs-i18n-checks.mjs`](scripts/lib/docs-i18n-checks.mjs)),
  berjalan di job `check` CI di sebelah `audit:dokumen`. Ia menjawab **dua**
  pertanyaan yang sengaja dipisah: apakah sebuah cermin masih seusia sumbernya,
  dan dokumen mana yang belum punya cermin sama sekali — digabung, ia akan hijau
  sementara sebagian besar korpus belum diterjemahkan.
- `bun run docs:i18n:stamp` menulis spanduk pemilih bahasa di kedua sisi dan
  menaruh penandanya di cermin. Idempoten, dan ia menghormati frontmatter YAML
  milik berkas skill — spanduk yang mendarat di atas `---` akan diam-diam
  membatalkan frontmatter itu, dan skill-nya kehilangan `name`/`description`
  yang menentukan kapan ia dipilih.
- Tiga cacat di [`scripts/audit-dokumen.mjs`](scripts/audit-dokumen.mjs)
  ditutup lebih dulu, karena berkas `.id.md` pertama akan memerahkannya dengan
  alasan yang bukan cacat: cermin dihitung sebagai ADR tersendiri dan dituntut
  masuk indeks; penanda "milik repo lain" hanya mengenal frasa Indonesia,
  sehingga 325 kutipan yang kini dimaafkan akan melanggar sekaligus begitu
  sebuah dokumen menulis "reference repo"; dan cermin yatim memasok nomor ADR
  yang berkasnya tidak ada. Masing-masing dibuktikan MERAH tanpa perbaikannya di
  [`tests/audit-dokumen.test.mjs`](tests/audit-dokumen.test.mjs).
- Gerbang indeks ADR kini ikut membaca cermin indeksnya bila ada, dan kolom
  status menerima kedua bahasa. Hash terjemahan menjaga cermin tetap SEUSIA
  sumbernya, bukan tetap BENAR terhadap isi `docs/adr/`.
- `*.id.md` dikecualikan dari graf pengetahuan. Sebuah cermin menceritakan ulang
  sumbernya kata demi kata; mengindeks keduanya memasukkan setiap konsep dua
  kali dan menghasilkan dua komunitas bertetangga yang akan diberi nama sama —
  yang sudah ditolak `bun run audit:graf`. Karena ia pola glob, gerbang itu
  melaporkannya sebagai **tidak ditegakkan** alih-alih berpura-pura menjaganya.

### Lima dokumen skill menjadi Inggris, dan sebuah tabel yang digerbangi ternyata hanya digerbangi separuh

Fase kedua [ADR-0039](docs/adr/0039-english-is-the-source-language.md), dan ia
mengambil alasan yang paling kuat di ADR itu lebih dulu: `.claude/skills/**`
adalah instruksi operasional yang **DIIKUTI** agen, bukan sekadar dibaca. Kelima
dokumennya — [`README.md`](.claude/skills/README.md) beserta keempat
`SKILL.md` — kini berbahasa Inggris di jalur telanjangnya, dengan cermin
Indonesianya di `<nama>.id.md`. Buku besar tunggu menyusut 48 → 43.

Blok frontmatter tetap byte pertama tiap `SKILL.md` dan bannernya duduk di
bawahnya, seperti yang sudah diantisipasi `docs-i18n-stamp.mjs`; `SKILL.id.md`
tidak dimuat sebagai skill kedua.

- **Tabel permukaan yang "tidak bisa salah" ternyata bisa salah di separuh
  pembacanya.** `tests/kontrak-awcms.test.mjs` menggerbangi tabel bertanda di
  skill integrasi dua arah terhadap `src/` — tetapi hanya di SATU berkas. Begitu
  cerminnya ada, sebuah baris yang hilang dari cermin lolos seluruh gerbang:
  `audit:translation` menjaga cermin tetap **SEUSIA** sumbernya, bukan tetap
  **MEMUAT** yang sumbernya muat, jadi hash yang cocok tidak membuktikan
  tabelnya utuh. Tesnya kini memeriksa kedua berkas, dan dibuktikan bukan hiasan
  dengan cara yang diminta skill gerbang sendiri: satu baris dihapus dari cermin
  → tepat satu tes merah, yang Inggrisnya tetap hijau. Ini kelanjutan langsung
  dari kelas cacat yang ditemukan fase sebelumnya, dan ia akan berulang di tiap
  fase berikutnya yang cerminnya dibaca sebuah gerbang.
- **Skill gerbang menyatakan LIMA gerbang di badannya** sementara deskripsinya
  sudah berbunyi enam sejak fase sebelumnya — `audit:translation` tidak ada di
  blok perintahnya maupun di tabel "yang ditangkap masing-masing". Keduanya kini
  lengkap, berikut satu butir baru di "yang TIDAK ditangkap": apa yang **dimuat**
  sebuah cermin, dan aturan bahwa gerbang yang membaca prosa wajib menyebut
  berkas yang mana, dalam bahasa berkas itu.
- **Dua angka yang menua diperbaiki di skill yang sama**: `bun test` disebut 20
  berkas padahal 21, dan sebuah tabel berjudul "empat aturan tanpa pemeriksa,
  ditemukan 4 Agustus" sudah punya baris kelima sejak ADR-0038 mendarat
  14 Agustus. Judulnya kini menyebut lima beserta kedua tanggalnya.
- **Perilis TIDAK menjalankan `audit:translation`, dan itu kini tertulis.** CI
  menjalankannya pada tiap push; `scripts/rilis.mjs` tidak. Skill
  performa-keamanan karena itu berbunyi "enam dari ketujuhnya", bukan
  "keenamnya", dan menyebut di mana yang ketujuh berjalan — cermin basi
  tertangkap sebelum merge, bukan saat rilis. Selisihnya dinyatakan alih-alih
  ditutup diam-diam: menambahkannya ke perilis adalah perubahan perilaku, dan
  tempatnya bukan sebuah commit terjemahan.

### Changeset menyatakan bump-nya sendiri, dan tag `v0.2.NaN` berhenti mungkin

Versi berhenti menjadi kata yang diketik saat rilis dan menjadi akibat dari isi
rilisnya ([ADR-0040](docs/adr/0040-changeset-menyatakan-bump-semver.md)).
Setiap changeset kini membawa `bump: major | minor | patch`, dan
[`scripts/rilis.mjs`](scripts/rilis.mjs) mengambil yang **terbesar** di antara
yang menunggu.

- **Dua bidang yang tidak pernah dibaca siapa pun kini divalidasi.** `tipe` dan
  `dampak` sudah didokumentasikan sejak lama dan diisi sepuluh changeset dengan
  setia — sementara `rilis.mjs` membuang seluruh blok frontmatter dengan satu
  regex dan tidak ada gerbang yang pernah membukanya. Bidang yang tidak dibaca
  salah sesering ia benar, dan tidak ada yang tahu.
- **`v0.2.NaN` adalah tag yang benar-benar bisa dibuat sebelum ini.**
  `pkg.version.split('.').map(Number)` menjawab sesuatu untuk setiap string:
  `0.2.0-rc.1` → `v0.2.NaN`, `1.0` → `v1.0.NaN`, `v0.2.0` → `vNaN.2.1`.
  Ketiganya dijalankan, bukan dibayangkan. Tag semacam itu tidak terurut di mana
  pun di bawah `--sort=v:refname`, jadi rilis BERIKUTNYA membaca tag lain sebagai
  yang terbaru — kerusakannya hidup lebih lama daripada run yang membuatnya.
  [`scripts/lib/semver.mjs`](scripts/lib/semver.mjs) kini menolak awalan `v`,
  prerelease, metadata build, dan angka ber-nol-depan dengan menyebut namanya.
- **`README.id.md` terhitung sebagai changeset menunggu.** Penyaringnya
  membandingkan dengan satu nama persis (`f !== 'README.md'`), sehingga rilis
  berikutnya akan melipat README Indonesia milik direktori itu sendiri ke
  `CHANGELOG.md` lalu MENGHAPUS berkasnya. Kini setiap `README*` ditolak.
- **Tingkat yang disebut manusia hanya boleh naik.** Perilis yang tahu rilisnya
  lebih besar daripada yang diakui changeset-nya boleh mengatakannya; yang lebih
  kecil ditolak beserta daftar changeset yang menuntut lebih.
- **Pemeriksanya** [`tests/versi-changeset.test.mjs`](tests/versi-changeset.test.mjs)
  — dua belas asersi, termasuk bahwa kosakata yang diterima gerbang masih sama
  dengan kosakata yang diajarkan [`README`](.changesets/README.md)-nya. Saat keduanya
  berpisah, kontributor yang mengikuti README-lah yang dirugikan, dan tidak ada
  hal lain yang akan menyadarinya.

Rilis pertama yang memakainya menurunkan `patch` dari sebelas changeset yang
menunggu: `0.2.0 → 0.2.1`.

### Keadaan `awcms` per 15 Agustus 2026 diserap, dan dua aturan yang selama ini hanya tertulis akhirnya punya pemeriksa

Sinkronisasi terakhir menyerap `awcms` sampai ADR-0092 (13 Agustus 2026). Sejak
itu sisi sana melanjutkan sampai ADR-0099. Lima keputusan, dan hanya **satu**
yang menyentuh repo ini — tetapi yang satu itu mengubah bentuk sebuah URL publik
yang dinamai enam berkas di sini sebagai fakta.

Yang **tidak** berubah dinyatakan lebih dulu, karena itu yang paling sering
salah diduga: **adapter tidak disentuh sama sekali.** Ketiga permukaan yang
dipanggil build tetap tiga, dan fixture kontrak konsumen di sana terakhir
diregenerasi 13 Agustus 2026 (ADR-0092) — tidak ada regenerasi yang menyentuh
permukaan DIPANGGIL sejak itu, jadi `tests/kontrak-awcms.test.mjs` hijau tanpa
satu baris pun berpindah.

#### Satu URL publik berpindah bentuk, dan enam berkas menyebutnya

`awcms` ADR-0098 memindahkan locale permukaan konten publiknya ke dalam PATH.
Alamat kanoniknya kini `/{locale}/blog/{tenantCode}/**`; path telanjang tidak
merender apa pun dan menjawab `307`, `private, no-store`. Akibat yang paling
mudah terlewat bukan URL-nya melainkan **rantainya**: tautan `/news/**` yang
dipensiunkan pada 8 Agustus 2026 kini dua lompatan — `301` ke path telanjang,
lalu `307` ke yang berprefiks — karena penulisan ulang `Location` di sana hanya
membawa locale yang sudah dimiliki pembacanya.

Yang diperbaiki karena itu adalah kalimat yang **menyuruh pembacanya melakukan
hal yang salah**: `README.md` dan `docs/awcms-astro/checklist-repo-baru.md`
sama-sama menyarankan menyajikan pembaca dari permukaan publik `awcms` sendiri,
dan keduanya mencetak alamat yang kini me-redirect. Sisanya —
`AGENTS.md`, skill integrasi, `standar-performa-dan-keamanan.md` — menyebutnya
sebagai fakta, dan fakta yang menua adalah cara pekerjaan berikutnya mendarat di
tempat yang keliru.

#### Repo ini TIDAK ikut memberi prefiks, dan itu keputusan, bukan kelalaian

[ADR-0041](docs/adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md).
Locale default tetap memegang akar (`/panduan/`, bukan `/id/panduan/`).

Alasannya bukan selera melainkan premis: kegagalan yang menjadi alasan
keberadaan `awcms` ADR-0098 — satu URL publik yang badannya dipilih cookie, di bawah
kunci cache `(host, url)` — **secara struktural tidak tersedia** pada build
statis. `server/penyaji.mjs` membaca `req.url` dan tidak ada yang lain. Mengikuti
prefiks itu berarti menjawab setiap URL locale default dengan redirect demi
properti yang sudah dimiliki, dan menurut kosakata ADR-0040 sendiri itu `major`.

Tanpa ADR ini, perbedaan itu terbaca sebagai ketertinggalan dan akan
"diperbaiki" seseorang. Ia divergence keluarga dan butuh entrinya sendiri di
`awcms-family-compatibility.yaml` sana — repo ini tidak bisa menuliskannya, dan
karena itu menyatakannya.

#### Yang DISERAP dari `awcms` ADR-0098, beserta pemeriksanya

Keputusan 2-nya: `Vary: Cookie` dan `Vary: Accept-Language` **DITOLAK** pada
setiap respons publik — ditolak, bukan dibuang, karena membuangnya meng-cache
badan yang penulisnya baru saja menyatakan bervariasi.

Aturannya tinggal di `server/penyaji.mjs` sebagai `VARY_DILARANG`, sebentuk
dengan `PERAN_DILARANG`. Pemeriksanya `tests/penyaji.test.mjs`, tiga asersi,
masing-masing dibuktikan merah oleh mutasinya sendiri: respons sungguhan pada
permintaan yang membawa cookie DAN `Accept-Language`, sumber penyaji yang tidak
menulis `Vary` apa pun, dan daftar terlarang yang tepat dua nama. Asersi tengah
sengaja lebih ketat daripada aturannya, dan tesnya menyatakan itu alih-alih
menyamarkannya.

Godaannya nyata dan berbentuk gamblang: cara membuat situs ini memilih bahasa
pembacanya tanpa rebuild adalah menegosiasikan `Accept-Language` di penyaji.
Setiap respons di sini `public`, jadi yang menerima akibatnya bukan yang
menyunting melainkan orang asing, beberapa menit kemudian, pada halaman yang
tidak bisa dirender ulang siapa pun.

#### Separuh ADR-0036 yang tidak dibaca apa pun

`AGENTS.md` menulis "Jangan bangun `/blog/**` di sini" sejak 8 Agustus 2026 dan
tidak ada satu perintah pun yang merah bila dilanggar — bentuk yang persis sama
dengan lima aturan yang skill gerbang sudah daftarkan.

`awcms` ADR-0098-lah yang mengubahnya dari celah laten menjadi celah hidup: URL kanonik
sebelah kini `/{locale}/blog/{tenantCode}/…`, huruf per huruf sama dengan bentuk
yang dihasilkan `src/pages/[lang]/[tab]/…` di sini. `tests/kosakata-news.test.mjs`
kini menolak tiga bentuk — tab yang mengklaim slug `blog`, entri
`permukaanAdmin.prefiks` di bawah `/blog`, dan berkas rute yang menuliskan
segmennya secara harfiah — masing-masing dibuktikan merah dengan memutasi repo
ini, bukan hanya sebuah fixture. Asersi keempat memastikan pemindaian rutenya
benar-benar membaca sesuatu, sehingga ia tidak bisa lolos karena tidak menemukan
apa pun.

#### Selebihnya

- Tiga ADR sisanya membentuk permukaan TERAUTENTIKASI dan tempatnya
  `docs/awcms-astro/permukaan-admin-user.md` §5, bukan skill adapter: preferensi
  bahasa milik **principal** dan global (ADR-0095 — jadi "bahasa situs ini"
  salah memerikan apa yang dilakukannya), rute swalayan **tidak butuh izin** dan
  mengarang satu justru mendarat sebagai 403 universal lewat jebakan ADR-0058 §E
  (ADR-0096), dan alamat sign-in adalah **pemulihan akun** yang statusnya masih
  Accepted tanpa implementasi (ADR-0099 — hari ini layar profil menampilkannya
  baca-saja dan menyebut alasannya).
- `awcms` ADR-0097 adalah keputusan yang sama dengan ADR-0039 di sini, dicapai
  mandiri. Satu hal yang perlu diketahui sebelum membaca dokumen di sana: buku
  besarnya dibuka pada 253 dokumen tertunggak, jadi `<nama>.md` telanjang di
  `awcms` masih lebih sering berbahasa Indonesia daripada tidak.
- §3 `permukaan-admin-user.md` bertambah satu baris: permukaan admin adalah hal
  pertama yang punya cookie layak divariasikan, dan halaman publik di sebelahnya
  masih `public`. Jawabannya sama dengan jawaban `awcms` — `private, no-store`,
  bukan `Vary`.

### Sebuah artikel akhirnya bisa ditemukan lewat kategori dan tag-nya

Redaksi memfilekan artikel ke sebuah kategori di CMS, `awcms` menyimpannya, dan
pembaca tidak pernah bisa melihatnya. Situs ini tidak punya arsip kategori
maupun arsip tag: sebuah artikel termasuk salah satu tab yang dikonfigurasi di
`src/config/site.ts`, dan tidak ada halaman mana pun yang mengagregasi "semua
yang berada di Politik". Itu butir pertama yang didaftar `awcms` #597.

Dua hal yang menghalanginya diperbaiki di `awcms` lebih dulu — feed build kini
membawa `termIds`, dan daftar term kini bisa ditelusuri sampai habis. Ini paruh
konsumennya.

#### Yang mendarat

- `/kategori/{slug}/` dan `/tag/{slug}/`, dengan paginasi `halaman/{nomor}/`,
  di locale bawaan maupun locale berprefiks.
- Halaman artikel MENAUT ke arsipnya. Tanpa itu setiap halaman arsip hanya bisa
  ditemukan lewat sitemap — halaman yang ada, terindeks, dan tidak ditaut satu
  pun halaman yang isinya.
- Permukaan `awcms` kelima, `/api/v1/blog/terms`, lewat gerbang kontrak di
  `tests/kontrak-awcms.test.mjs` dan kedua tabel bertanda di skill integrasi.

#### Tiga keputusan yang salahnya senyap

**Arsip dibangun dari term yang DIPAKAI, bukan dari kosakatanya.** `awcms` bisa
menyimpan ribuan tag, dan pada arsip mana pun yang tumbuh bertahun-tahun
sebagian besarnya tidak melekat pada satu pun artikel yang terbit hari ini. Satu
halaman per term dalam kosakata berarti menerbitkan ribuan grid kosong — halaman
tipis bagi perayap, dan tidak ada apa-apa bagi pembaca.

**Kosakata dibaca lewat traversal, tidak pernah lewat list bawaannya.** List itu
`name ASC` dengan `LIMIT` berbatas dan mengembalikan array telanjang: tidak ada
field apa pun di dalamnya yang bisa berkata "masih ada lagi". Kosakata tag di
atas arsip 23.906 artikel akan terpotong di sekitar huruf B, dan situs akan
membangun seratus halaman arsip dari ribuan — hijau, dengan setiap artikel yang
berada di tag berabjad belakang menaut ke halaman yang tak pernah dibangkitkan.

**Arsip diurutkan tanggal, selalu.** Sebuah seksi punya `urutanSeksi` sendiri
karena itu keputusan redaksi; sebuah arsip MELINTASI seksi, dan `urutan` dari
dua seksi berbeda tidak dibandingkan terhadap apa pun. "Artikel 3" di satu seksi
tidak berada sebelum atau sesudah "Artikel 3" di seksi lain.

#### Yang sengaja TIDAK dibangun

`channel` dan `topic` (PRD §8.5/§12.4) tidak mendapat arsip di sini. Keduanya
navigasi primer dan label lintas-kanal, dan permukaan pembacanya adalah mega
menu di `awcms` #597 butir 6 — membangkitkan arsip telanjang untuk keduanya
sekarang akan mendahului desain itu. Keduanya dibaca lalu diabaikan secara
eksplisit, bukan tersaring diam-diam oleh sebuah filter yang tampak seperti
detail.

#### Segmen yang dipesan

`kategori`, `tag`, dan `halaman` kini ditolak sebagai slug seksi, saat impor
konfigurasi. Sebuah tab bernama `kategori` mendeklarasikan dua halaman berbeda
pada satu URL: Astro membangun keduanya dan satu menang, diam-diam, dengan
setiap gerbang hijau dan satu bagian utuh situs tak terjangkau.

#### Penolakan bukan build gagal; kegagalan iya

403 atau 404 memperingatkan dengan menyebut nama permission-nya
(`blog_content.taxonomies.read`) dan membangun tanpa arsip; selain itu melempar.
Bedanya dengan identitas situs layak disebut: **kosakata kosong adalah keadaan
yang sah**, jadi fallback dan jawaban kosong yang jujur menghasilkan halaman
yang sama. Justru itu sebabnya cabang kegagalannya harus tetap terpisah — dengan
`catch` menyeluruh, "CMS Anda mati" dan "redaksi ini tidak memakai kategori"
menjadi peristiwa yang sama.

### Sebuah seksi berhenti merender seluruh sejarahnya ke dalam satu dokumen

PRD FR-DSC-006 meminta arsip BERBATAS sebelum volume produksi, dan volume yang
membuatnya mendesak nyata: target migrasi SeputarBorneo adalah **23.906
artikel**. Sampai perubahan ini setiap halaman seksi merender seluruhnya —
sebuah respons HTML tunggal berisi setiap judul yang pernah diterbitkan sebuah
redaksi, yang tidak digulir pembaca mana pun dan tidak diperlakukan perayap
sebagai indeks yang berguna.

Halaman 1 tetap di `/panduan/`; halaman 2..N di `/panduan/halaman/N/`.
`SITE_POSTS_PER_PAGE` mengaturnya, bawaannya 12, dan nilai yang cacat
MENGGAGALKAN build alih-alih diabaikan — aturan yang sama dengan
`AWCMS_API_TIMEOUT_MS`.

#### Tiga keputusan yang salah dalam diam

**Halaman 1 tidak punya kembaran `/halaman/1/`, dan rutenya tidak pernah
dibangkitkan.** Menerbitkan keduanya memberi satu halaman dua URL dan
memindahkan alamat yang sudah terindeks — karena ada orang menerbitkan artikel
ke-13.

**Setiap halaman kanonik ke DIRINYA.** Mengarahkan halaman 2..N ke halaman 1
adalah kebiasaan umum, dan ia akan menyembunyikan seluruh arsip dari indeks:
untuk 23.906 artikel, setiap URL setelah dua belas yang pertama menjadi tak
terjangkau kecuali dengan mengklik — persis akibat yang FR-DSC-006 ada untuk
mencegahnya.

**Judul halaman 2..N membawa nomornya.** Judul identik di seluruh arsip adalah
duplikat bagi perayap, dan satu-satunya pembeda yang terbawa ke hasil pencarian.

#### Feed ikut dibatasi, karena itu cacat yang sama dilihat mesin

`isiFeed` memancarkan SETIAP artikel sebuah seksi. Pada target migrasi itu
berarti dokumen Atom berisi 23.906 entry, dibangun ulang setiap build dan
diunduh ulang seluruhnya oleh setiap pembaca feed pada setiap polling.
Dibatasi `artikelPerFeed` (50), sengaja BUKAN angka yang sama dengan batas
halaman: sebuah halaman adalah satuan penjelajahan dan sebuah feed adalah
jendela polling, dan menyatukannya berarti situs yang menampilkan 6 kartu per
halaman juga melupakan segalanya yang lebih tua dari 6 posting terakhirnya di
antara dua polling.

#### Yang TIDAK berubah

Navigasinya tautan biasa dengan `rel="prev"`/`rel="next"` — situs ini harus
terbaca dengan JavaScript dimatikan, dan arsip yang hanya bisa ditelusuri skrip
juga tidak bisa ditelusuri perayap. Syarat feed dibaca dari SEKSI dan bukan dari
halaman yang sedang dirender, supaya pengumuman feed tidak lenyap di halaman 2.

Halaman `/sitemap/` masih mendaftar setiap artikel per seksi. Itu permukaan
dengan pertimbangannya sendiri — mendaftar segalanya bisa dibilang memang
tugasnya — dan membatasinya adalah keputusan desain tersendiri, bukan bagian
dari butir ini.

### Artikel yang selesai dibaca akhirnya menawarkan sesuatu berikutnya

Sampai perubahan ini sebuah artikel berakhir di disclaimer, dan pembacanya
keluar. Sekarang ia menutup dengan daftar pendek artikel lain di seksinya.

#### Judulnya "lainnya di seksi ini", bukan "artikel terkait"

Karena ia memang bukan itu. Keterkaitan yang sebenarnya butuh taksonomi —
`termIds` dikembalikan `awcms`, tetapi tidak ada yang meresolusinya di repo ini
hari ini, dan itu butir tersendiri yang menuntut permukaan `awcms` baru. Judul
"artikel terkait" di atas daftar teman-seksi adalah janji yang dibaca pembaca
dan tidak dipenuhi.

Ketika taksonomi mendarat, blok ini menjadi tempat keterkaitan sungguhan
tinggal, dan judulnya berubah bersama datanya.

#### Dua aturan dari SATU deklarasi yang sudah ada

Seksi ber-`urutanSeksi: "terbaru"` menawarkan yang TERBARU: nilainya meluruh,
dan pembaca berita mencari kabar berikutnya. Seksi `"manual"` menawarkan
TETANGGA menurut urutan redaksinya — langkah 4 setelah langkah 3, karena itulah
yang sedang dikerjakan pembacanya. Deklarasi yang sama sudah memutuskan apa yang
ditampilkan kartu dan tipe schema.org apa yang diklaim artikel.

#### Nol permintaan tambahan ke `awcms`

Diturunkan dari feed yang sudah ditarik build (`getArticles` dimemoisasi per
build), bukan dari permukaan baru — yang akan menuntut tarian kontrak
lintas-repo demi sebuah daftar tiga tautan.

#### Dua kesalahan yang menghasilkan blok yang TAMPAK benar

Menawarkan artikel yang sedang dibuka terlihat seperti daftar yang wajar sampai
seseorang mengkliknya dan tidak ke mana-mana; ia karena itu dibuang menurut
SLUG, bukan menurut posisi.

Menghitung tetangga SETELAH artikelnya dibuang menggeser setiap indeks
sesudahnya satu langkah, sehingga "langkah berikutnya" melompati satu artikel —
pada panduan berurutan itu instruksi yang keliru, bukan sekadar tautan keliru.
Posisi karena itu dihitung terhadap seksi utuh.

### Setiap galeri merender sebaris placeholder abu-abu di situs yang gambar artikelnya bekerja

`content-blocks.ts` menyatakan, di komentar berkasnya sendiri, bahwa item galeri
ber-`mediaObjectId` tidak bisa dirender karena "resolusi id butuh endpoint media
yang tidak dipanggil situs ini".

Kalimat itu **berhenti benar** saat `src/lib/awcms/media.ts` mendarat: build
sudah meresolusi gambar unggulan dan kartu share lewat
`GET /api/v1/media/objects` sejak saat itu. Tidak ada yang membaca ulang
kalimatnya, jadi setiap galeri yang ditempatkan editor terbit sebagai sebaris
placeholder — di situs yang gambar artikelnya justru bekerja.

#### Kenapa tidak ada gerbang yang bisa melihatnya

Placeholder ITU perilaku terdokumentasi untuk item yang tidak bisa diresolusi.
Ia tampak seperti salah satunya. Tidak ada tipe yang salah, tidak ada
permintaan yang gagal, tidak ada tag yang hilang — hanya sebuah kapabilitas
yang sudah ada dan tidak pernah disambungkan.

Ini kelas cacat yang sudah berulang di keluarga repo ini: sebuah kalimat yang
menyatakan ketiadaan menua ke arah yang berlawanan dari koreksi biasa. Klaim
POSITIF pecah begitu kodenya berubah; klaim NEGATIF makin salah dan tidak pernah
gagal sendiri.

#### Yang berubah

Id galeri ikut dalam batch media yang SAMA — satu permintaan per build, bukan
satu per galeri — dan renderer menerima petanya sebagai parameter opsional,
sehingga modul itu tetap murni dan tetap bisa diuji tanpa jaringan.

`altText` dari registri menang atas caption sebagai `alt`, dengan alasan yang
sama seperti gambar unggulan: ia ditulis UNTUK gambarnya. Caption tetap menjadi
`<figcaption>` — ia keterangan, bukan alt. Ukurannya ikut supaya peramban
memesan ruang sebelum gambarnya tiba.

Id registri menang atas `url` mentah yang menemaninya, sama seperti renderer
`awcms` sendiri: id adalah rujukan terkelola, dan URL di sebelahnya adalah apa
pun yang ada sebelum objeknya didaftarkan.

Id yang benar-benar tidak resolve tetap placeholder. `awcms` MELAPORKAN id yang
tidak resolve alih-alih membuangnya, justru supaya pemanggil bisa membedakan
"tidak ada gambar" dari "gambar ini hilang", dan perbedaan itu diteruskan sampai
ke halaman.

### Sebuah situs akhirnya bisa menyatakan dirinya sendiri, tanpa menyunting repo ini

Sampai perubahan ini, siapa sebuah situs hanya bisa diubah oleh orang yang bisa
menyunting deployment-nya. Nama, lambang, dan kartu share datang dari `.env`;
tagline dan baris hak cipta dari katalog PO; favicon dari sebuah berkas di
`public/`. Alamat redaksi, email, telepon, WhatsApp, dan tautan profil sosial
tidak punya tempat sama sekali — bukan kosong, **tidak ada** — sehingga
satu-satunya cara menerbitkannya adalah menuliskannya ke dalam template yang
dipakai situs lain.

Itu cacat yang dinamai `awcms` #596: identitas hidup di source frontend, dan
tenant kedua mustahil tanpa fork.

#### Satu permintaan, karena `awcms` sudah menggabungkannya

`GET /api/v1/site-profile/composed` (`awcms` ADR-0102) menjawab keduanya
sekaligus: yang dibaca MANUSIA milik modul `site_profile`, yang dibaca PERAYAP
milik `seo_distribution`. Pemisahan itu benar untuk kepemilikan dan salah untuk
konsumen, jadi `awcms` menyusunnya di sisi baca — dan template ini karena itu
tidak pernah belajar bahwa pemisahannya ada.

Yang berubah di halaman: masthead memakai logo dan nama tenant, `<link
rel="icon">` memakai favicon tenant, tagline dan baris hak cipta datang dari
redaksi, footer menumbuhkan kolom kontak dan kolom profil sosial bila — dan
hanya bila — tenant mengisinya, dan simpul `Organization` di setiap halaman
membawa `logo`, `address`, `email`, `telephone`, serta `sameAs` yang sebenarnya.

#### Urutan mendaratnya adalah inti kontrak lintas-repo

`awcms` membekukan bentuk responsnya LEBIH DULU, sebagai path **COMMITTED** —
sebuah janji, karena belum ada yang memanggil. Baru setelah itu repo ini mulai
memanggil, dan entri di sana berpindah ke CONSUMED. Definition of Done menuntut
urutan itu, dan urutan sebaliknya berarti build di sini bersandar pada bentuk
yang belum disanggupi repo sebelah. Ini permukaan **keempat**;
`tests/kontrak-awcms.test.mjs` mengeraskan daftarnya dari kode sumber, dua arah
terhadap tabel bertanda di skill integrasi, justru supaya penambahan seperti ini
tidak bisa mendarat diam-diam.

#### Dua keputusan yang gagal dalam diam bila salah

**403 dan 404 jatuh ke cadangan; sisanya menggagalkan build.** Keduanya terlihat
sama di log dan menuntut jawaban berlawanan. `403` berarti kredensial build
belum dipegangi `site_profile.profile.read` — nyata dan diharapkan, karena
`awcms` menyemai izin per tenant saat tenant itu dibuat, sehingga tenant lama
diam-diam kehilangan grant-nya. `404` berarti `awcms`-nya lebih tua dari
endpoint-nya. Keduanya adalah "`awcms` bilang tidak", situsnya tetap benar
dengan nilai cadangan, dan peringatannya menyebut izin yang kurang supaya
perbaikannya satu kalimat. Sebuah `500` bukan penolakan: itu CMS yang rusak, dan
membangun terus akan menerbitkan situs yang diam-diam berganti nama menjadi nama
template — yang terlihat persis seperti deploy yang berhasil.

**URL sosial ditolak, bukan disanitasi — dua kali.** `awcms` menolaknya saat
ditulis, dan `lib/awcms/profil.ts` menolaknya lagi saat dibaca. Baris yang
ditulis sebelum validator itu ada tetap sebuah baris, dan nilainya dirender
sebagai `<a href>` di setiap halaman situs.

#### Yang sengaja TIDAK dilakukan

Baris hak cipta tenant **mengganti** baris rakitan, tidak menggabunginya:
redaksi yang menulis "© 2019–2026 PT Lentera Kalteng" memaksudkan kata itu, dan
sebuah gabungan akan mencetak tahunnya dua kali dan namanya dua kali. Logo
tenant **mengganti** `SITE_MARK`, tidak menemaninya: keduanya menempati tempat
yang sama, dan situs yang memasang keduanya menyatakan dua identitas di satu
baris.

### Menu dan widget yang dikonfigurasi redaksi akhirnya muncul di situs

`awcms` sudah memegang menu navigasi dan widget sejak issue #542, lengkap dengan
layar admin untuk keduanya, dan **tidak ada yang pernah merendernya**. Seorang
editor menambahkan tautan footer, CMS menyimpannya, dan tidak ada pembaca yang
pernah melihatnya. Itu `awcms` #597 butir 6.

#### Yang TIDAK dilakukan perubahan ini

Ia tidak mengganti bilah tab, dan itu bukan kelalaian melainkan keputusan
(ADR-0105 di `awcms`). Bilah tab merender labelnya lewat katalog PO; sebuah item
menu `awcms` membawa **satu** label, tanpa varian per-locale. Menjadikan
navigasi utama digerakkan CMS berarti mengembalikan antarmuka primer situs ini
ke satu bahasa — persis cacat yang dicatat komentar `src/config/site.ts`, yang
menyebut navigasi sebagai "satu-satunya bagian antarmuka yang tidak pernah
diterjemahkan, di sebuah template yang seluruh maksudnya multibahasa".

Tab juga menentukan struktur rute, urutan seksi, dan seksi tempat sebuah artikel
berada. Sebuah menu adalah daftar tautan; ia bukan satu pun dari itu.

Jadi menu CMS adalah wilayah **sekunder** di footer, widget dirender di posisi
yang dinyatakannya, dan tenant yang tidak mengonfigurasi keduanya mendapat situs
yang ia punya hari ini.

#### Yang dibuang, dan kenapa pembuangannya berbicara

- **Item `page` dibuang.** Template ini tidak punya rute page sama sekali, jadi
  merendernya berarti tautan mati di setiap halaman situs.
- **Target `post` yang tidak terbit dibuang**, dan itu keadaan NORMAL: `awcms`
  sengaja tidak memeriksa `targetId` saat tulis, karena sebuah menu boleh
  menunjuk artikel yang belum terbit.
- **URL non-http ditolak** meski `awcms` seharusnya sudah menolaknya saat tulis
  — baris yang ditulis sebelum validator itu tetaplah baris, dan yang dirender
  di sini adalah `<a href>` di footer setiap halaman.
- **Anak yang induknya terbuang ikut terbuang**, tidak dinaikkan menjadi item
  tingkat atas: itu akan mengubah menu yang disusun editor menjadi menu lain
  yang tampak disengaja.

Setiap pembuangan menyebut **label** itemnya di log build — tempat orang yang
bisa bertindak sedang melihat, tidak seperti tautan mati yang hanya dilihat
pembaca. Sekali per build, bukan sekali per halaman: build verifikasi mencetak
108 salinan pesan yang identik sebelum de-duplikasinya ada, dan itu
menenggelamkan satu-satunya log tempat pesan ini sampai.

#### `bodyText` di-escape

Badan widget adalah teks biasa. `awcms` **menolak** markup saat tulis alih-alih
menyanitasinya, jadi merendernya sebagai HTML di sini akan memberikan
kepercayaan yang justru ditolak jalur tulis. Diverifikasi di keluaran build:
`Teks <biasa>` terbit sebagai `Teks &lt;biasa&gt;`.

#### Widget nonaktif

`awcms` mengembalikan yang nonaktif dengan sengaja, supaya "dimatikan" dan
"dihapus" bukan jawaban yang sama. Penyaringannya milik situs ini, dan
`isActive` yang bukan boolean diperlakukan **nonaktif**: widget yang muncul
karena field-nya hilang adalah teks yang terbit tanpa ada yang menyalakannya.

#### Verifikasi

Diverifikasi end-to-end terhadap stub `awcms` dengan menu bersarang, item
`page`, target `post` yang hilang, dan widget nonaktif. Hasil: 108 halaman,
`audit:konten` penuh hijau (SEO, hreflang, tautan mati, sitemap), item yang
terbuang tidak terbit, tautan `post` membawa prefiks locale-nya, dan peringatan
tercetak satu kali.

### Masthead memakai nama tenant, judul feed masih memakai nama `.env` — dan tidak ada gerbang yang bisa melihatnya

Ditemukan tepat setelah identitas situs mendarat (`awcms` #596): `BaseLayout`
sudah memasang nama tenant di masthead, `<title>`, dan `og:site_name`,
sementara **judul feed** — `isiFeed`, tautan penemuan-otomatis di halaman seksi,
dan tautan yang sama di halaman artikel — masih merakit namanya dari
`siteConfig.name`, yaitu `SITE_NAME` di `.env`.

#### Kenapa ia tidak terlihat

Kedua nama itu ADA, dan keduanya masuk akal dibaca sendiri. Tidak ada tipe yang
salah, tidak ada tag yang hilang, tidak ada permintaan yang gagal. Yang salah
hanya bahwa dua permukaan menamai situs yang sama dengan dua nama berbeda — dan
yang kedua muncul di daftar langganan pembaca feed, tempat yang justru paling
jarang dibuka ulang setelah dilanggan sekali.

Ini bentuk cacat yang sama persis dengan yang sudah ditulis aturannya di repo
ini untuk `shareCard` dan `feed`: dua nilai yang seharusnya datang dari satu
sumber, dikirim terpisah, lalu diam-diam datang dari sumber yang berbeda.

#### Gerbangnya membaca SUMBER, bukan keluaran

`tests/identitas-situs.test.mjs` menolak `siteConfig.name` di setiap berkas yang
menamai situs, dan menuntutnya tetap ada di `src/lib/identitas.ts` — satu-satunya
tempat urutan jatuhnya boleh tinggal. Ia tidak bisa membaca `dist/`: build penuh
butuh awcms yang hidup dan dilewati di repo template ini, sehingga asersi atas
keluaran tidak akan pernah berjalan di sini.

### Sebuah situs boleh menghitung kunjungannya, dan itu tidak menaruh apa pun di perangkat pembacanya

`awcms` #597 butir 9 terhalang bukan oleh pekerjaan melainkan oleh sebuah
keputusan: apakah template ini boleh memanggil beacon pengunjung sama sekali.
[ADR-0044](docs/adr/0044-what-a-page-view-may-cost-a-reader.md) menjawabnya —
**boleh, hanya bila situs menyatakannya, dan selalu tanpa kredensial** — dan ini
implementasinya.

#### Keputusannya ternyata lebih kecil daripada "analitik: ya atau tidak"

Karena `fetch` lintas-origin **tanpa** `credentials` tidak mengirim maupun
menyimpan cookie, repo ini sudah memegang sakelarnya tanpa satu pun perubahan di
`awcms`. Cookie 30 hari `awcms_visitor_key` yang dipasang endpoint itu **dibuang
peramban**, jadi tidak ada apa pun yang persisten mendarat di perangkat pembaca —
dan kalimat `AGENTS.md` §Keamanan, *"tanpa analitik yang mengikat identitas"*,
selamat kata demi kata alih-alih ditafsirkan ulang.

Karena itu pula **tidak ada banner persetujuan**, dan itu bukan kelalaian
melainkan konsekuensi: tidak ada yang perlu disetujui.

Yang dilepas disebutkan alih-alih dilewati: **hitungan pengunjung unik**. Setiap
kunjungan tampak sebagai kunjungan pertama, dan "12.000 kunjungan" berhenti bisa
diubah menjadi "berapa orang".

#### Dinyatakan dengan menamai kode tenant, dan tidak ada sakelar kedua

`SITE_BEACON_TENANT_CODE` kosong secara bawaan; mengisinya adalah deklarasinya.
Sebuah sakelar terpisah plus sebuah nilai adalah pasangan yang separuh terisi,
dan keadaan separuh terisi di sini adalah situs yang melaporkan kunjungan ke
tenant mana pun yang kebetulan dinamai kode basi.

Ia **bukan** `AWCMS_TENANT_CODE` yang sudah dipensiunkan dan MELEMPAR: yang itu
dulu memilih tenant mana yang dibangun build dan bisa diam-diam berselisih dengan
token. Yang ini tidak memilih apa pun.

Satu hal yang repo ini **tidak bisa** periksa dinyatakan alih-alih dipura-purakan
terjaga: apakah tenant `awcms` itu menyalakan `rawIpEnabled`, yang membuatnya
menyimpan alamat IP pembaca dan bukan hanya hash ber-salt. Peringatannya tinggal
di `.env.example`, tempat orang yang bisa melihatnya membacanya.

#### Aturannya KEBALIKAN dari kotak pencarian, dan keduanya harus tetap berbeda

Pencarian tidak boleh membawa header apa pun, karena `awcms` sengaja tidak
menyajikan `OPTIONS` di belakangnya. Beacon ini **harus** membawa satu:
`security.checkOrigin` di sana menolak POST lintas-origin yang tipe isinya mirip
form, jadi hanya `application/json` yang lolos — dan handler `OPTIONS` yang
dipasang `awcms` #637 ada justru untuk preflight yang menyusul.
`navigator.sendBeacon` karena itu tidak bisa dipakai: ia mengirim `text/plain`.

Menyeragamkan keduanya, ke arah mana pun, mematikan salah satunya di peramban dan
tidak di log mana pun.

#### Gerbang "repo ini tidak menulis" diamandemen, dan amandemennya MEMBELI dua jaminan

`tests/tanpa-backend.test.mjs` menolak `fetch` ber-`method` selain `GET`, dan
pesannya sendiri sudah mengantisipasi kasus ini. Pengecualiannya **satu berkas**,
bukan sebuah pola — dan aturan yang dilonggarkannya bukan aturan yang
dijaganya: gerbang itu melindungi kredensial mesin baca-saja milik build, dan
panggilan ini tidak menyentuhnya sama sekali.

Di sebelahnya berdiri dua asersi baru: berkas beacon tidak boleh membawa
`credentials` maupun header otorisasi, dan pengecualiannya harus menamai berkas
yang ADA dan benar-benar mem-POST.

#### Halaman privasi ikut, karena ADR-nya menjanjikannya

`/privasi/` dan `/en/privasi/` dikirimkan template, bukan diserahkan ke tiap
situs untuk ditulis tangan: teksnya harus menyatakan apa yang benar-benar
dilakukan build ini, dan hanya build ini yang tahu apakah situsnya menyatakan
beacon. Isinya bercabang pada satu nilai, dan pada tidak ada nilai lain.

#### Verifikasi

Terhadap Chrome sungguhan, di atas keluaran build dan penyaji yang sebenarnya,
dengan stub yang mengirim `Set-Cookie` yang sah persis seperti `awcms`:

- satu POST per kunjungan, `content-type: application/json`, muatan hanya
  `tenantCode` + `path`;
- permintaannya **tidak membawa header cookie**;
- **nol cookie tersimpan** meski server mengirimnya — inilah keseluruhan ADR-0044,
  dan satu-satunya cara membuktikannya adalah menjalankannya;
- kunjungan kedua juga tanpa cookie, jadi setiap kunjungan memang tampak pertama;
- nol pelanggaran CSP, nol galat konsol.

Build tanpa deklarasi diverifikasi terpisah: tidak ada simpul `[data-beacon]`,
tidak ada permintaan, dan halaman privasinya berbunyi "tidak menghitung
kunjungan". Bundel skripnya tetap ikut terbit (588 byte) karena Astro membundel
berdasarkan impor, bukan render — ia inert, dan sebuah tes menjaganya tetap
begitu.

### Seorang penulis yang memilih punya byline akhirnya terbaca namanya

`awcms` ADR-0109 menambahkan `authorByline` pada baris post — sebuah nama yang
penulisnya sendiri isi lewat `PATCH /api/v1/auth/profile`, bukan nama akunnya.
Field itu menumpang `GET /api/v1/blog/posts?view=full`, yang **sudah** disusuri
build ini setiap kali, dan sampai perubahan ini tidak ada yang membacanya. Itu
`awcms` #597 butir 4.

Karena tidak ada permukaan baru yang dipanggil, gerbang permukaan di
`tests/kontrak-awcms.test.mjs` tidak berubah warna sedikit pun. Itu yang membuat
perubahan ini murah — dan itu juga yang membuatnya butuh
[ADR-0042](docs/adr/0042-a-byline-is-the-first-per-person-data-this-template-publishes.md):
perubahan yang tidak bisa dilihat gerbang mana pun adalah perubahan yang tidak
dipaksa dibaca siapa pun.

#### Ketiga permukaan, bukan satu

Halaman artikel (`✍️ Ditulis oleh …`), `author` JSON-LD, dan entry artikel itu di
feed Atom. Feed yang mengkredit organisasi sementara halamannya mengkredit
seseorang adalah dua jawaban atas satu pertanyaan, dan pelanggan feed hanya
melihat salah satunya.

#### Yang tidak ada tetap tidak ada

`NULL` — keadaan setiap baris yang terbit sebelum ADR itu — merender **tanpa
baris byline sama sekali**, bukan baris yang membawa nama penerbit di
belakangnya. Penulis yang tidak memilih byline sudah membuat sebuah pilihan, dan
mengisi kekosongan itu dengan nama organisasi akan mencetak atribusi yang
terbaca sebagai nama seseorang. `awcms` yang mendahului ADR-0109 tidak mengirim
field-nya sama sekali, dan situsnya tetap terbangun.

Di feed, ketiadaan itu bahkan tidak perlu ditulis: Atom (RFC 4287 §4.2.1)
menetapkan `<author>` tingkat feed berlaku bagi setiap entry yang tidak punya
sendiri.

#### Nama, dan tidak lebih

Tanpa `@id`, `url`, atau `sameAs` di JSON-LD; tanpa `<uri>` atau `<email>` di
feed. Kedua format punya tempat untuk semuanya, dan menambahkannya kelak adalah
beberapa karakter yang akan lolos setiap gerbang lain — jadi penolakannya
ditegaskan di `tests/schema.test.mjs` dan `tests/feed.test.mjs`.

Byline adalah kredit atas satu tulisan. Pengenal atau tautan profil mengubahnya
menjadi identitas yang bisa diikuti lintas artikel dan lintas situs, sesuatu yang
tidak diminta siapa pun dengan mengisi satu kolom nama.

#### Baris terjemahan, bukan baris sumber

Berbeda dari `termIds`/`urutan`/`kategori`, yang sengaja dibaca dari post sumber
supaya penerjemah yang membiarkan klasifikasinya kosong tidak menjatuhkan artikel
keluar dari arsip satu bahasa saja. Kepenulisan bukan klasifikasi: terjemahan
sering ditulis orang lain, dan mengambil nama penulis sumber untuknya mengkredit
seseorang atas teks yang tidak ia tulis.

Membalik baris itu lolos typecheck dan lolos setiap gerbang lain, jadi ia
dibuktikan lewat mutasi: mengubah `post` menjadi `source` memerahkan tepat satu
tes, dan tes itu ditulis lebih dulu untuk memastikannya bisa merah.

#### Satu klaim yang berhenti benar, di tiga dokumen

`docs/awcms-astro/standar-performa-dan-keamanan.md` dan kedua berkas skill
integrasi menyatakan, sebagai sebuah properti, bahwa template ini menerbitkan
**nol data per-orang**. Dua di antaranya melanjutkan dengan apa yang akan berlaku
bila itu berubah: *"situs yang menambah byline … mengambil kewajibannya, dan
jalur penghapusannya berakhir di sebuah rebuild"*.

Kewajiban itu kini hidup, dan ketiga dokumen dikoreksi alih-alih dibiarkan
berdiri. Sebuah dokumen yang memerikan properti yang tidak lagi dimiliki kode
mengirim pembaca berikutnya mencari cacat, bukan membaca keputusan — kelas
kegagalan yang sudah berulang di keluarga repo ini.

Yang **tidak** berubah: `AGENTS.md` §Keamanan tentang tidak mengumpulkan data
pribadi **pembaca**. Itu aturan yang berbeda, dan byline adalah data tentang
orang yang menulis artikelnya, diterbitkan atas permintaannya sendiri.

### Seorang pembaca akhirnya bisa mencari, dan menyaring apa yang ditemukannya

Mesin pencarian `awcms` sudah lengkap dan matang sejak lama — `tsvector`
berbobot di belakang index GIN, `ts_rank`, snippet yang di-escape di sumbernya,
hitungan facet yang masing-masing dihitung tanpa filternya sendiri, typeahead
trigram, rate limit per-IP, semuanya di dalam batas RLS yang sama dengan
datanya. Yang tidak ada adalah kotaknya, di kedua repo. Itu `awcms` #607 dan
`awcms` #597 butir 3.

Yang mendarat: `/cari/` dan `/en/cari/` — kotak, hasil berperingkat dengan
sorotan, chip facet (jenis konten, kanal, topik, instansi, wilayah), tombol
"muat lebih banyak" ber-cursor, dan autocomplete.

#### Panggilan PERTAMA dari repo ini yang terjadi di peramban seorang asing

Setiap panggilan `awcms` yang sudah ada berjalan saat `astro build`, dari mesin
yang memegang kredensial baca-saja. Dua yang ini berjalan di peramban pembaca,
anonim, lintas-origin, terhadap endpoint yang `awcms` ADR-0107 rancang untuknya.
[ADR-0043](docs/adr/0043-the-readers-browser-calls-awcms-and-nothing-else-changes.md)
menuliskan mengapa itu bukan pelonggaran aturan "peramban tidak pernah memanggil
`awcms` langsung": aturan itu butir 1 dari empat aturan yang mengikat permukaan
TERAUTENTIKASI, dan di sini tidak ada sesi, tidak ada kredensial, dan tidak ada
yang bisa dipegang.

Tiga properti panggilannya masing-masing hanya gagal di tempat yang tidak punya
log dan tidak punya penonton, jadi ketiganya digerbangi dan dibuktikan lewat
mutasi:

- **satu header saja** mengubahnya menjadi permintaan ber-preflight, dan `awcms`
  sengaja tidak menyajikan `OPTIONS`;
- **`credentials: "include"`** membuat responsnya tidak bisa dibaca sama sekali;
- **origin situs harus terdaftar** sebagai domain tenant yang aktif dan
  terverifikasi di sana — kalau tidak, jawabannya payload kosong netral yang
  identik byte demi byte dengan "tidak ada hasil". `.env.example` menyatakan
  konsekuensi ketiga di tempat operator menemuinya, karena ia kesalahan
  konfigurasi dan bukan kesalahan kode.

#### Tidak ada satu pun HTML yang dirakit di JavaScript

Snippet dari `awcms` aman — ia meng-escape seluruh keluaran `ts_headline` lebih
dulu, baru menukar sentinel ASCII menjadi `<mark>`. Menyerahkannya ke
`innerHTML` akan bekerja dengan benar hari ini, dan tetap ditolak: aturan
"tidak ada jalur HTML-mentah dari CMS" bukan pernyataan tentang seberapa
hati-hati sisi sana, melainkan yang menjaga field berikutnya dari endpoint
berikutnya tidak tiba lewat jalur yang sudah ada.

Konsekuensinya meluas ke seluruh komponen: setiap bentuk yang bisa muncul di
layar ditulis sebagai `<template>` di berkas `.astro` dan dikloning skripnya.
Alasan keduanya sama pentingnya — sebuah string yang dirangkai di skrip akan
menjadi satu-satunya teks di situs ini yang tidak pernah melewati katalog PO.

#### Yang ditemukan dengan MENJALANKANNYA

Jalannya yang pertama di Chrome sungguhan merender chip jenis konten berbunyi
`blog_post` dan `blog_page` — pengenal mesin milik registry modul `awcms`, di
layar, dalam kedua bahasa. Persis bentuk yang aturan repo ini larang, dan tidak
ada gerbang yang bisa melihatnya: nilainya ada, tipenya benar, dan halamannya
terbit. Keduanya kini dirender lewat katalog PO, dan nilai tanpa entri tidak
merender chip sama sekali.

#### Kotaknya tidak tampil sebelum bisa dipakai

`/cari/` satu berkas statis; tanpa JavaScript tidak ada yang bisa mengambil
hasil. Form-nya `hidden` di sumber dan skripnya membukanya **sesudah** setiap
simpul yang dibutuhkannya ditemukan, sehingga template yang hilang menghasilkan
tidak ada kotak alih-alih kotak yang menerima ketikan lalu diam. `<noscript>`
mengatakannya.

Itu menuntut `[hidden] { display: none !important }` yang belum dimiliki repo
ini: atribut `hidden` bekerja lewat aturan bawaan peramban yang KALAH dari
aturan `display` penulis mana pun — termasuk `.chip { display: inline-flex }`,
yang dipakai tombol "muat lebih banyak" di halaman yang sama.

#### Verifikasi

Terhadap Chrome sungguhan, di atas keluaran build dan penyaji yang sebenarnya:
kotaknya terbuka, sebuah URL `javascript:` pada hasil dibuang alih-alih
ditautkan, snippet tersorot tanpa `innerHTML`, `<bantuan>` yang ter-escape tetap
teks dan bukan elemen, chip menulis bilah alamat dan bisa dibagikan, daftar
saran terisi, dan konsol melaporkan **nol** pelanggaran CSP. Header yang
benar-benar terkirim diperiksa dengan `curl`:
`connect-src 'self' <origin awcms>`.

`tests/kotak-cari.test.mjs` yang menjaga semuanya tidak diam-diam berubah
sesudahnya — termasuk kelas paling remeh dan paling senyap dari semuanya, sebuah
selektor yang salah ketik: `querySelector` mengembalikan `null`, `!`
membungkamnya di typecheck, dan halamannya terbit dengan kotak yang tidak pernah
menjawab.

### Permukaan pembaca keluarga ini adalah satu-satunya repo yang tidak punya anggaran pembaca

`awcms` ADR-0101 menggerbangi apa yang diunduh pengunjung artikel publik di
**24.000 byte** dan menggagalkan build-nya bila terlampaui. Menurut ADR-0070-nya,
repo **ini** yang memikul permukaan publik keluarga.

Jadi repo dengan anggaran pembaca yang ketat adalah repo yang permukaan
pembacanya sebuah aplikasi admin, dan repo yang benar-benar melayani pembaca
tidak punya anggaran sama sekali.

`lighthouserc.json` nyata, dan ia mengerjakan hal lain: ia mengambil SAMPEL
halaman, hanya berjalan bila `vars.AWCMS_API_URL` terisi — jadi **tidak pernah
untuk repo template ini sendiri** — dan tidak bisa menyebut berkas mana yang
membesar. Regresi 8 KB duduk nyaman di bawah LCP 2500 ms pada runner cepat, dan
tetap terasa di ponsel pada jaringan 3G.

#### Dua lapis, karena `dist/` tidak selalu ada

Bentuknya mengikuti `audit-konten.mjs`: sumber **selalu** jalan, keluaran jalan
bila `dist/client` ada, dan lapis yang dilewati **mengatakannya**. Gerbang yang
hanya membaca `dist/client` tidak pernah berjalan di satu-satunya tempat kode
klien ini ditinjau.

#### Angkanya diukur, bukan disalin

| | total | skrip | gaya |
| --- | ---: | ---: | ---: |
| halaman artikel | 29.510 B | 5.809 B | 23.701 B |
| halaman cari | 32.358 B | 9.963 B | 22.395 B |

Skrip dipisahkan dari gaya alih-alih dijumlah, karena biayanya berbeda — CSS
menahan render, JS menahan **dan** dieksekusi — dan satu angka gabungan akan
membuat 4 KB skrip baru tampak sama murahnya dengan 4 KB CSS.

Plafon sumber sengaja lebih longgar dari plafon terbit: kotak cari 10.054 B di
`src/` dan 4.808 B setelah build. Menerapkan satu plafon pada keduanya menuduh
berkas yang sebenarnya patuh.

Angka 24.000 milik `awcms` tidak disalin. Itu irisan pembaca dari bundle ADMIN,
dan ia tidak mengatakan apa pun tentang template ini.

#### Dua kesalahan yang ditangkap gerbangnya sendiri

Anggaran skrip pertama ditulis **9.000**, dari hitungan tangan yang melewatkan
sebagian skrip inline. Gerbangnya sendiri yang mengoreksinya pada jalan pertama —
alasan sebuah anggaran harus diukur oleh alat yang menegakkannya, bukan oleh
orang yang menulisnya.

Versi pertamanya juga menyebut `BaseLayout.css` sebagai penyumbang terbesar
sebuah pelanggaran **skrip**, yang mengirim pembacanya memperkecil berkas yang
tidak ada hubungannya dengan angka yang merah. Keduanya kini punya tesnya.

#### Registri `public/` ditegakkan dua arah

Berkas yang tidak didaftarkan merah, **dan** entri yang berkasnya tidak ada juga
merah. Arah kedua itu yang membuat daftarnya tidak membusuk — bentuk yang sama
dipakai `awcms` ADR-0101, dengan alasan yang sama.

Empat belas tes atas pohon fixture sungguhan, dua arah. Berjalan di job `check`,
bukan di belakang build bersyarat: anggaran aset adalah properti sumber repo ini
sendiri. Dicatat sebagai celah 11 di `standar-performa-dan-keamanan.md`.

### Tebal, miring, dan tautan dalam kalimat akhirnya sampai ke pembaca

`awcms` menjadikan Portable Text badan kanonik pada 19 Agustus 2026 (ADR-0100)
dan mengapalkannya di v10.0.0. Union enam-tipe yang lama bertahan di sana
sebagai `content_json.blocks` — proyeksi TURUNAN yang sengaja dipertahankan
supaya repo ini tidak menjadi kosong pada hari cutover.

Proyeksi itu **lossy secara konstruksi**: kosakata lama tidak punya mark, jadi
setiap tebal, miring, potongan kode, dan tautan di dalam kalimat merata menjadi
teks polos saat menyeberang. Dan proyeksi itulah yang dirender situs ini sampai
sekarang.

Artinya sederhana dan tidak enak dibaca: **setiap artikel yang pernah
diterbitkan situs ini adalah prosa tanpa format, dan tidak ada editor yang bisa
mengubahnya.** Sebuah berita yang tidak bisa menautkan peraturan yang
dibahasnya, atau menegaskan satu angka yang penting, terbit lebih buruk daripada
bahan yang menjadi sumbernya.

#### Yang berubah

`src/lib/portable-text.ts` membaca `bodyPortableText` dan merendernya. Aturan
yang tidak melonggar sedikit pun: **tidak ada tipe node HTML mentah**, dan setiap
string sampai ke keluaran lewat `escapeHtml` dan tag tetap.

Dua hal dibawa apa adanya alih-alih diturunkan ulang:

- **`href` diperiksa dengan mem-PARSE, bukan mencocokkan pola.** Regex atas
  string mentah adalah cara `java\nscript:` dan `JaVaScRiPt:` lolos; `URL`
  menormalkan keduanya. Lima bentuk berbahaya diuji, dan kata-katanya tetap
  terbit — yang hilang tautannya, bukan kalimatnya.
- **`underline` BUKAN dekorator.** Span bergaris bawah yang bukan tautan adalah
  cacat kegunaan, dan menyediakannya menjamin ia dipakai untuk penegasan.

#### Daftar: wadah yang tidak dibawa formatnya

Portable Text memodelkan daftar sebagai rentetan blok DATAR yang masing-masing
membawa `listItem` dan `level` — tidak ada node wadah. Merakit ulang `<ul>`
adalah tugas konsumen, dan salah merakitnya menghasilkan satu `<ul>` per butir:
HTML yang sah, tampak nyaris benar, dan dibacakan pembaca layar sebagai "daftar
berisi satu butir" sekali per baris.

Bersarangnya diuji atas byte-nya, bukan atas kemiripannya. Versi pertama
implementasi ini menempelkan rentetan bersarang sebagai SAUDARA alih-alih ke
DALAM butir di atasnya — render-nya nyaris identik dan tak terlihat oleh
teknologi bantu. Tesnya menangkapnya.

#### Galeri dan video

Keduanya didelegasikan ke `content-blocks.ts` sehingga dua format badan tidak
bisa menyimpang menjadi dua jawaban berbeda. `videoNews` tetap **tautan, bukan
sematan** ([ADR-0046](docs/adr/0046-a-video-embed-is-refused-here-and-that-is-a-divergence-not-an-omission.md)).

Id galeri kini juga dikumpulkan dari badan kanonik. Mengumpulkannya hanya dari
proyeksi akan menyelesaikan setiap galeri milik baris yang belum di-backfill dan
tidak satu pun milik baris yang sudah — situs yang galerinya bekerja sampai hari
kontennya dimigrasikan.

#### Jatuhan yang punya syarat penghapusan

`bodyPortableText` tiba ABSEN dari awcms yang mendahului ADR-0100, dan KOSONG
dari baris yang belum disentuh `blog:portable-text:backfill`. Keduanya mengambil
cabang proyeksi.

Syarat menghapus jatuhan itu ditulis, bukan diserahkan pada penilaian: setiap
baris tenant sudah di-backfill DAN deployment-nya awcms v10.0.0 atau lebih baru.

**Syarat ADR-0100 §5 kini TERPENUHI** — `awcms` boleh menghapus compatibility
WRITER-nya. Kedua penghapusan itu bukan peristiwa yang sama dan tidak boleh
dilakukan bersamaan.

### Buletin ada di `awcms` dan tidak bisa dijangkau pembaca — dua sebabnya, keduanya diukur

`awcms` mengapalkan modul `newsletter` pada 21 Agustus 2026 (ADR-0103-nya):
`POST /api/v1/newsletter/subscribe` yang anonim, dibatasi per-IP, double opt-in,
dengan **jawaban NETRAL untuk setiap hasil**. Tidak ada pembaca di situs yang
dibangun dari template ini yang bisa mencapainya.

Caller-nya kini ditulis dan diuji. Ia **tidak memanggil apa pun**, dan itu bukan
kelalaian — dua hal harus mendarat di `awcms` lebih dulu, dan keduanya dibaca
dari sumbernya alih-alih disimpulkan dari tetangganya:

1. **Jalurnya belum dibekukan.** `CONSUMER_PATHS` di sana memuat sepuluh jalur
   yang dikonsumsi dan dua yang dijanjikan; tidak ada jalur buletin di antaranya.
   Setiap permukaan sejak `/site-profile/composed` mengikuti urutan yang sama —
   `awcms` membekukan bentuknya sebagai COMMITTED dulu, baru repo ini
   memanggilnya.

2. **Tidak ada handler `OPTIONS`, jadi preflight-nya tidak bisa dijawab.** Ini
   detail yang akan salah kalau disalin dari tetangga. Dua jalur pencarian TIDAK
   membawa header sama sekali; beacon HARUS membawa `application/json`, dan
   `analytics/collect.ts` mengekspor `OPTIONS` justru untuk preflight yang
   ditimbulkannya. `newsletter/subscribe.ts` **tidak mengekspor `OPTIONS`**,
   sementara kontraknya menuntut content type yang sama.

   Jadi endpoint itu, hari ini, tidak bisa dijangkau situs statis di domainnya
   sendiri. Itu temuan tentang `awcms`, bukan keterbatasan berkas di sini.

#### Dua gerbang diperluas, bukan dihindari

Menulis caller ini menabrak dua gerbang, dan keduanya benar. Menyembunyikan
kodenya dari mereka — menyusun jalurnya dari potongan string, menyimpan verb-nya
di variabel — adalah bypass yang sudah disebut ADR-0038 §4 sebagai batas yang
diketahui. Jadi keduanya diperluas secara terbuka:

- **Kontrak permukaan** kini punya blok kedua, `dijanjikan`, meniru pemisahan
  CONSUMED/COMMITTED milik `awcms` sendiri beserta alasannya: sebuah janji dan
  sebuah ketergantungan sama-sama layak stabil tetapi gagal dengan cara berbeda.
  Sebuah jalur yang ada di sumber dan tidak ada di kedua blok tetap MERAH, jadi
  permukaan masih tidak bisa mendarat diam-diam — yang kini bisa dilakukannya
  adalah mendarat sebagai janji alih-alih sebagai kebohongan tentang apa yang
  dipanggil build. Dijaga dua arah, plus penolakan tumpang tindih.
- **Aturan "repo ini membaca, ia tidak menulis"** mendapat pengecualian KEDUA,
  dan ia dibayar tiga jaminan alih-alih dua: tanpa kredensial, tanpa header
  otorisasi, **dan** flag-nya mati. Jaminan ketiga memerah begitu seseorang
  menyalakannya, sehingga dua yang pertama dibaca ulang sebelum dimatikan.

#### Yang paling penting tidak dilakukan konsumen ini

`awcms` menjawab **badan yang sama** untuk alamat baru, alamat yang sudah aktif,
yang di-suppress, dan host yang tidak memetakan ke tenant mana pun. Caller ini
merender jawaban itu apa adanya dan tidak menambah apa pun. "Alamat itu sudah
terdaftar" di sisi klien akan membangun ulang oracle enumerasi yang ditolak
endpoint itu — dari satu tempat yang tidak akan terpikir dicari siapa pun.

Diuji: alamat BARU dan alamat yang SUDAH ADA harus menghasilkan hasil yang
identik.

#### Yang sengaja BELUM dibangun

Rute konfirmasi dan berhenti-langganan. Tautannya datang dari surel yang dikirim
`awcms`, dan URL yang ditulisnya belum diputuskan — membangun rute untuk alamat
yang belum disepakati siapa pun adalah menebak.

### Origin ini tidak bisa menjawab satu pun pengalihan, dan itu diukur

Bukan "belum dikonfigurasi" — tidak ada kodenya. `astro.config.mjs` memakai
`output: "static"` tanpa kunci `redirects`, tidak ada berkas middleware, dan
`server/penyaji.mjs` tidak memuat satu pun kemunculan `301` atau `Location`.

`awcms` tidak menduganya; ia mengukurnya. ADR-0114-nya memutar-ulang **67 aturan
redirect terhadap server hasil build repo ini dan mendapat 404 pada setiap
satunya, dengan nol header `Location`.** Aturan-aturan itu ditulis ke
`awcms_seo_redirects`, yang diterapkan di satu tempat saja — di aplikasi ITU —
sementara targetnya rute yang dilayani di sini.

Kewajiban cutover-nya sudah ditarik `awcms` ADR-0116. Celahnya tidak: sebuah
situs turunan tetap tidak punya jawaban apa pun untuk URL yang dulu bekerja —
tab yang diganti nama, artikel yang di-slug ulang, seksi yang digabung.

#### Tanggung jawabnya dibelah, dan tiap separuh diletakkan di tempat ia bisa dibuktikan

| Pengalihan | Pemilik |
| --- | --- |
| Slug diganti, seksi digabung, halaman pindah | **origin ini** |
| `http`→`https`, `www`→apex | **edge** |
| Memindahkan seluruh domain terindeks | **edge** |

Separuh milik origin tinggal di repositori ini karena ia ditinjau, diversikan,
dan **digerbangi** — dan itulah separuh yang memikul beban keputusannya. Prinsip
ADR-0032 berlaku langsung: gerbang yang tidak bisa dibuktikan di tempat ia
ditulis akan membusuk, dan konfigurasi edge tidak bisa diuji `bun test`.

Separuh milik edge tidak dibantah. Hanya edge yang bisa meruntuhkan protokol +
host + path menjadi satu lompatan yang dituntut PRD §9.2, dan itu persis alasan
`awcms` ADR-0114 memilihnya untuk cutover-nya.

#### Tiga aturan yang gagal tanpa berbunyi, masing-masing dengan pemeriksanya

- **Rantai** — target yang juga menjadi kunci berarti dua lompatan.
- **Putaran** — tab browser yang menggantung.
- **Bentuk non-kanonik** — target tanpa garis miring penutup menukar satu 404
  dengan halaman yang menyangkal dirinya sendiri; KUNCI non-kanonik sama sekali
  tidak pernah cocok, sebuah aturan yang penulisnya kira bekerja.

#### Yang dibuktikan, bukan hanya ditulis

Tes terpentingnya menjalankan **server sungguhan** dan menegaskan `301`
mendahului handler aplikasi — karena yang selama ini salah bukan logikanya
melainkan bahwa tidak ada yang memanggilnya. Versi pertama tesnya tidak bisa
membuktikan itu (peta template kosong), jadi petanya dibuat bisa disuntik.

Header keamanan ikut diasersi pada 301: sebuah pengalihan tetap respons, dan
celah header di jalur yang jarang diuji adalah celah yang tidak dilihat siapa
pun. Query dibawa serta, supaya pembaca yang tiba dari kampanye tidak kehilangan
atribusinya karena halamannya pindah.

#### Peta template ini KOSONG, dan itu keputusan

Sebuah template tidak punya sejarah URL. Contoh yang ditinggalkan di sini akan
tersalin ke setiap situs turunan sebagai pengalihan **hidup** menuju halaman yang
tidak pernah ada.

Tidak ada berkas baru yang wajib disalin `Dockerfile`: petanya modul yang
di-inline `bun build`, sengaja berbeda dari `asal-media.json` — yang itu membawa
nilai dari awcms saat build dan Dockerfile yang melupakannya adalah jebakan yang
sudah didokumentasikan repo ini.

Dicatat sebagai [ADR-0047](docs/adr/0047-this-origin-answers-its-own-content-redirects-and-the-edge-keeps-the-rest.md),
dan `docs/deploy-coolify.md` akhirnya menyebut lapis redirect-nya.

### Plafon build ada di bawah korpus yang sudah diukur keluarga ini sendiri

`MAX_PAGES = 400` × `PAGE_SIZE = 50` membatasi traversal di **20.000 post**, dan
komentarnya berbunyi bahwa angka itu "duduk jauh di atas situs mana pun yang
masuk akal". Itu tebakan.

Pada 26 Agustus 2026 tebakan itu berhenti benar: `awcms` mengukur arsip rujukan
keluarga ini dan mendapat **25.029 artikel** — ADR-0114-nya, yang juga mencatat
bahwa angka 23.906 dikutip berminggu-minggu sebelum ada yang menghitungnya.

Plafonnya, dengan kata lain, ada **di bawah** korpus yang sudah diukur keluarga
ini. Kegagalannya jujur — ia MELEMPAR alih-alih memotong diam-diam, dan itu
setengah yang benar — tetapi ia menyala pada situs yang sekadar besar alih-alih
pada sebuah bug.

#### Diukur, bukan dinaikkan

Menaikkan konstantanya saja akan mengulang kesalahan yang sama satu tingkat
lebih tinggi. `bun run ukur:skala` adalah cara mendapatkan angkanya:

| artikel | halaman | traversal | +render | heap korpus | RSS puncak |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1.000 | 20 | 8 ms | 27 ms | 0,0 MiB | 52 MiB |
| 5.000 | 100 | 25 ms | 68 ms | 24,2 MiB | 127 MiB |
| 25.000 | 500 | 102 ms | 355 ms | 170,0 MiB | 605 MiB |

Yang dikatakan pengukurannya, dan tidak dikatakan sebelumnya:

- **Waktu bukan batasnya.** Seluruh adapter memakan di bawah setengah detik
  untuk 25.000 artikel. Build sebesar itu didominasi 500 permintaan HTTP
  berurutan dan penulisan satu berkas per halaman per locale oleh Astro —
  keduanya bukan putaran ini.
- **Memori batasnya, dan ia linear.** Setiap baris menahan badan kanoniknya DAN
  proyeksi turunannya sekaligus, karena itulah yang dikirim awcms.

Plafonnya kini **1.200 halaman, 60.000 post** — sekitar 1,5 GiB RSS puncak pada
kemiringan yang terukur, dan 2,4× korpus terbesar yang pernah dihitung keluarga
ini.

#### Pesan gagalnya menyebut apa yang harus dilakukan

Pesan lama menyebut kedua sebabnya ada dan berhenti di situ. Yang baru
memisahkan keduanya, karena jawabannya berbeda: cursor yang macet terlihat dari
jumlah post yang kelipatan `PAGE_SIZE` dengan slug kembar; situs yang benar-benar
sebesar itu perlu `ukur:skala` dijalankan di mesin yang akan membangunnya.

Dan ia menolak jalan keluar yang menggoda secara eksplisit: mengembalikan apa
yang sudah terkumpul menerbitkan daftar pendek yang tampak lengkap — situs yang
kehilangan artikel TERBARUNYA, dengan setiap gerbang hijau.

#### Yang TIDAK dilakukan, dan disebut

Refactor streaming supaya memori berhenti tumbuh linear **tidak dikerjakan**.
Pengukurannya menjelaskan kenapa: pada 25.000 artikel biayanya 605 MiB, yang
selamat di runner CI mana pun, jadi pekerjaannya belum dibayar oleh apa pun yang
bisa diukur hari ini. Kalau ada situs yang mendekati plafon barunya, angkanya
ada dan keputusannya bisa diambil dengan data alih-alih dengan firasat.

Harness-nya juga tidak dijalankan di CI, dan itu keputusan: gerbang yang
membangun 25.000 artikel pada setiap PR akan dimatikan orang dalam sepekan.

### Tiga regex penyaring tag membuat gerbang lulus atas halaman yang tak pernah ia baca

CodeQL menandai lima temuan `high` di repo ini, dan keduanya kelas yang sama:
sebuah regex yang ditulis untuk mengenali tag HTML, tetapi mengenali lebih
sedikit — atau lebih banyak — daripada yang dikenali browser. Tidak satu pun
dari kelimanya adalah lubang keamanan pada situs yang terbit; semuanya adalah
**gerbang yang berhenti memeriksa tanpa berbunyi**, yang justru kelas yang
seluruh gerbang di repo ini ditulis untuk menangkap.

#### `teksLayar` di `audit-konten.mjs`

Sebuah tag penutup boleh membawa apa pun setelah nama tag-nya. `</script >`,
`</script foo=bar>` dan `</script\t\n bar>` semuanya menutup blok skrip bagi
browser. Regex lama menuntut `</script>` persis, jadi ia tidak berhenti di
satu pun dari ketiganya. Akibatnya bercabang, dan keduanya diukur atas fixture
sungguhan alih-alih dikira-kira:

- **Ada skrip kedua di bawahnya** — pencarian lanjut sampai penutup milik skrip
  itu, dan judul serta paragraf di antaranya ikut terbuang sebagai "skrip".
  Halaman uji menyusut dari tiga baris menjadi satu.
- **Tidak ada skrip kedua** — regex tidak cocok sama sekali, dan source
  JavaScript-nya masuk sebagai teks layar.

Sisi sebaliknya sama diamnya: tanpa `\b`, `<scripture>` terbaca sebagai pembuka
`<script`, dan penutup yang dicarinya adalah `</script>` nyata jauh di bawahnya.
Pada fixture uji, seluruh teks halaman lenyap menjadi larik kosong — dan enam
gerbang keluaran yang membacanya melaporkan nol pelanggaran atas halaman yang
tidak pernah mereka lihat.

Perbaikannya sengaja **tidak** ditulis `</script[^>]*>`, bentuk longgar yang
paling menggoda saat mengejar `</script foo=bar>`. Bentuk itu akan menerima
`</scripture>` sebagai penutup, padahal HTML tidak — blok skrip hanya berakhir
pada `</script` yang diikuti spasi-putih, `/`, atau `>`. Spasi-putih diwajibkan
setelah nama tag justru supaya gerbang ini sepakat dengan browser, dan kedua
arahnya diuji.

#### Pembuangan komentar di `auditSvg`

Membuang komentar sekali jalan bisa **menyatukan** sisa kiri dan kanannya
menjadi komentar baru yang utuh: pada `<!<!-- x -->-- draf & catatan -->`,
lintasan pertama membuang bagian tengahnya dan yang tersisa membentuk komentar
yang tidak pernah diperiksa lagi. `&` di dalamnya lalu dilaporkan sebagai
pelanggaran pada berkas yang sah — satu tuduhan palsu sebelum, nol sesudah.
Pembuangan kini diulang sampai berhenti berubah.

Satu batas disebut di tempatnya alih-alih didiamkan: komentar **tak
berpenutup** tetap lolos, dan pengulangan tidak menolongnya sama sekali. Berkas
seperti itu bukan XML yang sah, jadi `&`-nya memang layak dilaporkan.

#### Tiga asersi di `tests/content-blocks.test.mjs`

`assert.doesNotMatch(html, /<script>/)` lebih sempit daripada klaim yang
dibuatnya. `<SCRIPT>`, `< script`, dan `<script src=…>` semuanya tag skrip bagi
browser dan tak satu pun cocok. Tesnya lulus selama ini karena renderer-nya
memang meng-escape segalanya — jadi celahnya tak terlihat, dan akan tetap tak
terlihat persis pada hari renderer berhenti meng-escape sesuatu.

#### Empat tes baru, tiga di antaranya merah tanpa perbaikan ini

Dibuktikan dua arah seperti tetangganya: tiga kasus merah sebelum perbaikan dan
hijau sesudahnya, ditambah satu penjaga arah-hijau yang harus lulus di kedua
sisi — isi `<script>` bukan teks layar, dan gerbang yang mulai melaporkannya
akan dimatikan orang dalam sepekan.

Tidak ada gerbang baru yang ditambahkan untuk kelas ini. CodeQL sudah berjalan
pada setiap PR (`.github/workflows/codeql.yml`), jadi ia sendiri pemeriksa
anti-kambuhnya; gerbang kedua hanya akan menjadi salinan yang bisa menyimpang.

### Artikel yang ditulis editor di awcms akhirnya terbit

Seksi sebuah artikel ditentukan oleh satu ekspresi:

```ts
readBlock(post).kategori === tab
```

`readBlock` membaca `contentJson.awcmsAstro` — **sidecar milik repo ini
sendiri**, yang jalur authoring `awcms` tidak pernah menulisnya. Satu-satunya
penulisnya di seluruh CMS adalah `blog:legacy:import --section-map`, sebuah CLI
migrasi sekali jalan.

Jadi untuk artikel yang ditulis dengan cara biasa — seorang editor, di CMS,
menekan Terbitkan — perbandingannya menjadi `undefined === tab` untuk setiap tab,
dan post itu tersaring keluar. Tidak ada halaman artikel, tidak ada entri indeks
seksi, tidak ada entri arsip, **tidak ada error**. Build hijau, situs kosong.

Untuk template yang seluruh premisnya "awcms adalah backend konten", jalur
authoring bawaannya tidak menghasilkan apa pun.

#### Seksi kini datang dari taksonomi

Tiap tab menyatakan `termSlugs` — slug kategori `awcms` yang menempatkan artikel
di dalamnya. Itu klasifikasi yang benar-benar bisa disetel editor, dan repo ini
sudah membacanya untuk arsip kategori/tag sejak `awcms` ADR-0104. Situs ini
membaca klasifikasi nyata dari editor, memakainya membangun arsip, lalu
menentukan seksi artikelnya dari kunci yang tidak bisa dijangkau editor.

Sidecar tetap **menang** bila ada, dan bukan demi kompatibilitas: `awcms`
ADR-0115 §4 MENOLAK mengimpor baris yang tak bisa ditempatkan `--section-map`-nya,
sehingga sidecar adalah instruksi yang disengaja dari satu-satunya alat yang
menulisnya.

#### Yang tak tertempatkan tidak lagi senyap

- **Sebagian post** tak tertempatkan → masing-masing disebut namanya, build
  lanjut. Menggagalkan di sini membuat satu kategori salah ketik menghentikan
  seluruh redaksi menerbitkan.
- **SETIAP post** tak tertempatkan dari N > 0 → build **GAGAL**. Itu bukan
  kesalahan tingkat artikel melainkan `termSlugs` yang menyebut kosakata yang
  salah, kredensial tanpa `blog_content.taxonomies.read`, atau tab yang diganti
  nama — ketiganya menerbitkan situs kosong dari build hijau.

Kosakata KOSONG tetap keadaan yang sah: situs yang menempatkan artikelnya lewat
sidecar terbangun persis seperti sebelumnya.

#### Kenapa tidak ada gerbang yang bisa melihatnya

`buatPost` menulis sidecar pada **setiap** baris fixture, jadi satu-satunya
bentuk yang gagal di produksi adalah satu-satunya bentuk yang tidak pernah
dihasilkan double-nya. Ia kini punya varian tanpa sidecar, dan dua tes yang
membuktikan perbaikan ini terbukti MERAH tanpa perbaikannya.

Satu perbaikan sampingan: respons `/blog/terms` yang cacat — `200` tanpa larik
`terms` — dulu meledak sebagai `Spread syntax requires ...iterable` dari dalam
adapter, pesan yang tidak menyebut endpoint maupun apa yang harus diperbaiki.

Dicatat sebagai [ADR-0045](docs/adr/0045-a-section-comes-from-the-cms-vocabulary-not-from-a-sidecar-only-we-write.md).

### Dua belas keputusan `awcms` hanyut tanpa terserap, dan sekarang ada yang memeriksanya

`audit:dokumen` bertanya apakah kutipan `ADR-NNNN` **resolve** — apakah
keputusan yang disebut memang ada. Pertanyaan yang mahal adalah kebalikannya:
**adakah keputusan di `awcms` yang tidak dikutip apa pun di sini?**

Tidak ada gerbang yang bisa menanyakannya, dan jawabannya hanyut selama dua
belas keputusan. `awcms` menerima ADR-0100 sampai ADR-0116 dalam sembilan hari;
repo ini mengutip lima.

Dua yang terlewat menyebut repo ini secara langsung:

- **ADR-0100 §5** menyebut sebuah pull request DI REPO INI sebagai syarat
  `awcms` menghapus compatibility writer yang masih ia pikul.
- **ADR-0114** memutar-ulang 67 aturan redirect terhadap server hasil build repo
  ini: 404 pada setiap satunya, nol header `Location`.

Kelas cacatnya persis yang hendak diakhiri ADR-0030 — aturan yang hanya tertulis
adalah aturan yang hanyut. Tabel serapan dirawat dengan tangan, sementara tabel
permukaan beberapa baris di atasnya sudah digerbangi sejak hari ia lahir.

#### Buku besar dengan tiga vonis

Setiap ADR `awcms` dari lantainya ke atas kini punya barisnya sendiri — lantai
itu `awcms` ADR-0049, dan ada 68 vonis sampai `awcms` ADR-0116, nol bervonis
`belum`. Vonis tengahnya yang paling penting
— `diperiksa` berarti dibaca, tidak menyentuh jalur build statis, dan alasannya
ditulis. **Kesenyapan harus bisa dibedakan dari kelalaian.**

Lantainya di situ karena di situlah hubungannya bermula. Di bawahnya, ADR
`awcms` 0000–0048 adalah fondasi platform yang mendahului konsumen ini dan repo ini belum
memeriksanya secara sistematis — itu dinyatakan, bukan disiratkan oleh
ketiadaannya.

#### `bun run audit:serapan`

Tiga pemeriksaan, dan yang ketiga adalah satu-satunya gerbang di repo ini yang
melihat ke luar:

1. **Cakupan** — tidak boleh ada nomor bolong antara lantai dan puncak.
2. **Buku besar hanya boleh MENYUSUT** — plafon `belum` boleh turun, tidak boleh
   naik, dan plafon yang tertinggal di angka lama juga memerah karena ia berhenti
   menjaga apa pun.
3. **Kesegaran** — daftar `docs/adr/` milik `ahliweb/awcms` diambil lewat API
   GitHub, dan nomor yang ada di sana tanpa vonis di sini memerahkan gerbang.
   Inilah satu-satunya pemeriksaan yang bisa menangkap "`awcms` menerbitkan
   ADR-0117 dan tidak ada yang melihatnya".

Pemeriksaan ketiga **DILEWATI dan mengatakannya** bila jaringan tidak ada.
Gerbang yang memerah karena GitHub mati akan dimatikan orang dalam sepekan;
gerbang yang menghijau diam-diam karena jaringan mati lebih buruk, karena ia
berbohong ke arah yang nyaman.

Empat belas tes, dibuktikan dua arah, termasuk terhadap server HTTP lokal
sungguhan — bukan terhadap fungsi yang di-mock, karena yang bisa rusak adalah
bentuk respons dan penyaringan cermin `.id.md`, dan tidak satu pun dari keduanya
terlihat oleh mock.

#### Dua divergensi yang akhirnya punya namanya

- **[ADR-0046](docs/adr/0046-a-video-embed-is-refused-here-and-that-is-a-divergence-not-an-omission.md)** —
  `awcms` ADR-0110 memberi operatornya sebuah origin `frame-src`; repo ini
  menolak embed video pada setiap deployment tanpa saklar, karena operator situs
  turunan adalah organisasi pemilik domainnya dan flag itu akan tiba sudah
  terpasang di repo yang mereka salin. Perbedaannya sebelumnya tidak tercatat di
  mana pun, dan perbedaan yang tidak dicatat terbaca sebagai satu sisi yang belum
  sempat mengerjakannya.
- **ADR-0037** kini menyebut `awcms` ADR-0112, yang menyandarkan divergensi
  `astro-files-not-type-checked` pada pin TypeScript 6 repo ini — kutipannya
  selama ini hanya berjalan satu arah, dan sebuah pin yang tidak tahu ia
  disandari adalah pin yang dinaikkan orang yang sedang merapikan daftar
  dependency.

### The release backlog gets a bound, and a checker for it

[ADR-0040](docs/adr/0040-changeset-menyatakan-bump-semver.md) moved **how
big** a release is to the person who could answer it — the author, while writing
the change. It left **when** to whoever remembered.

Memory lost, and it was measured: `v0.2.0` was tagged on 8 August 2026, and
twenty days later thirty changesets were waiting behind it. Nine of them are
capabilities a reader would notice — archives, pagination, search, byline,
menus, galleries, the visit beacon. Two of the `patch` entries are security
fixes: HSTS was never actually sent in production, and the nanoid advisory was
closed through an override. A site operator running `v0.2.0` had no released
version containing either, and every gate in this repo was green for the whole
twenty days.

That is worse for a template than it would be for an application. Sites are
derived from this repo and then diverge; they do not track `main`. The version
number is the only thing they have.

[ADR-0048](docs/adr/0048-a-release-is-cut-when-the-backlog-crosses-a-bound.md)
bounds the backlog instead of scheduling the releaser, and
`bun run audit:rilis` enforces it in CI beside the other gates — no build, no
network, one directory of file names:

- At most **12** changesets may wait — roughly eight days at this repo's own
  measured rate.
- The oldest may be at most **14 days** old — the longest a derived site should
  wait before it can pull a security fix.
- A changeset must carry a real `YYYY-MM-DD-` date in its name.
  `.changesets/README.md` always required it and nothing ever checked it; a file
  the gate cannot date never ages, so it would sit in the backlog invisible to
  the one check built to see it. A calendar date that does not exist
  (`2026-02-31`, which `new Date` answers for by rolling into March) is refused,
  and so is one more than a day ahead of the machine checking it — one day of
  slack, because the author names the file in their own zone while CI keeps UTC,
  and the gate's first CI run reddened a correctly named file over exactly that.

Two things the gate deliberately does not do: the releaser does not run it —
folding the changesets is what clears it — and there is no switch to silence it,
because a bypass with no expiry becomes the configuration.

Crossing a bound is information, not a fault. `main` has no required checks, so
the red informs without blocking a merge, and one command clears it.

## [0.2.0] — 2026-08-08

> **Build integrasi tidak berjalan pada rilis ini.** `AWCMS_API_URL` kosong,
> yang normal untuk repo template ini sendiri — jadi `bun run build`,
> `bun run audit:konten`, dan lapis penyaji/CSP di `bun test` DILEWATI, bukan
> lulus. Sebuah situs yang dibangun dari template ini mengisi variabel itu dan
> menjalankan ketiganya.

Template awal `awcms-astro`, diekstraksi dari `web-lalulintasmelayani.com`.

Yang dibawa: seluruh lapisan render — komponen tanpa JavaScript, design token,
standar interaksi kilau hover, katalog PO, JSON-LD, dan pola `views/` yang
membuat satu badan halaman melayani semua locale.

Yang diganti: sumber datanya. `src/lib/content.ts` dulu membaca markdown lewat
`getCollection`; sekarang ia memanggil awcms dan tetap menghasilkan bentuk
`LocalizedArticle` yang sama persis. Tidak ada satu komponen pun yang berubah
karena itu — yang justru membuktikan aturan "komponen tidak pernah mengambil
datanya sendiri" memang berlaku, bukan sekadar tertulis.

Yang dibuang: seluruh konten dan data khas Kalimantan Tengah, empat katalog
bahasa daerah, sistem gambar artikel yang terikat 30 SVG buatan tangan, dan
gerbang audit konten yang aturannya khas domain.

Yang diperbaiki dibanding asalnya: `@import` Google Fonts dihapus (ia mengirim
IP setiap pembaca ke pihak ketiga sebelum pembaca melakukan apa pun), dan blok
konten dirender dari struktur ter-escape sehingga tidak ada jalur HTML mentah
dari CMS sama sekali.

Pisahkan CI menjadi `check` (selalu jalan) dan `build` (butuh sumber konten).

`main` merah sejak commit pertama, dan alasannya struktural: `npm run build`
menarik konten dari awcms sungguhan, sedangkan repo template ini sendiri tidak
punya instans awcms — ia cetakan, bukan situs.

Godaan yang ditolak: memberi build sebuah awcms tiruan supaya selalu hijau. Itu
membuat gerbangnya lulus tanpa pernah membuktikan template ini bisa bicara
dengan sumber kontennya, sehingga kerusakan integrasi baru ditemukan di
produksi.

Yang dilakukan: `astro check` selalu jalan (ia menangkap sebagian besar cara
template ini bisa rusak dan tidak butuh konten sama sekali), sementara build
penuh jalan bila dan hanya bila `vars.AWCMS_API_URL` diisi — yang di sebuah
SITUS nyata selalu terjadi. Kondisinya ditulis ke ringkasan run, supaya "build
tidak jalan" tidak pernah menyamar sebagai "build lulus".

Sinkronkan `package-lock.json` dengan `package.json`, dan pasang gerbang yang
menjaganya tetap sinkron.

Repo ini lahir dari menyalin `web-lalulintasmelayani.com`. `package.json`-nya
ditulis ulang; lockfile-nya tidak. Sampai perubahan ini, `package-lock.json`
masih mengaku bernama `web-lalulintasmelayani.com@1.7.0` dan mendeklarasi dua
dependency yang tidak ada di manifest — `sharp` dan `@astrojs/markdown-remark`.

Yang membuatnya bertahan: **`npm ci` menerima keadaan itu dengan exit 0.** Ia
menolak lockfile yang KURANG, tetapi lockfile yang BERLEBIH lolos tanpa satu
peringatan pun; `npm ls` malah MENCETAK "extraneous" lalu keluar dengan status
0 juga. Jadi setiap CI run dan setiap clone memasang paket yang tidak
dideklarasi siapa pun, sementara seluruh gerbang tetap hijau.

Yang berbahaya bukan `sharp`-nya — ia memang datang dari `astro` sebagai
dependency transitif, jadi tidak ada yang rusak saat deklarasi hantunya
dicabut. Yang berbahaya adalah lockfile berhenti menjadi pernyataan tentang
proyek ini: `npm audit` memeriksa pohon yang salah, dan versi terpasang tidak
lagi bisa dibaca dari manifest.

- Lockfile diregenerasi penuh: 381 entri, identitas `awcms-astro@0.1.0`.
- `scripts/cek-lockfile.mjs` membandingkan identitas dan SELURUH blok dependency
  di entri root lockfile terhadap `package.json`. Murni baca berkas — tanpa
  jaringan, tanpa `node_modules` — sehingga di CI ia berjalan **sebelum**
  `npm ci`, dan kegagalannya terbaca sebagai "lockfile menyimpang" alih-alih
  sebagai kegagalan typecheck yang tidak ada hubungannya. Gerbangnya diuji
  dengan mengembalikan lockfile lama yang asli, bukan dengan pelanggaran yang
  dikarang.
- Regenerasi WAJIB lewat `npm install` penuh. `npm install --package-lock-only`
  menghasilkan lockfile yang kehilangan 94 paket biner opsional lintas platform
  (`@esbuild/*`, `@astrojs/compiler-binding-*`, `fsevents`) — `npm ci` lalu
  gagal di macOS dan Windows sementara Linux tetap hijau. Ini dicatat di
  `AGENTS.md`, di README, dan di kepala skrip gerbangnya.

Terkait: Dependabot `typescript 5.9.3 → 7.0.2` ditutup, bukan digabung.
`@astrojs/check@0.9.10` — rilis terbaru — menyatakan peer
`typescript@"^5.0.0 || ^6.0.0"`, jadi npm menolak pohonnya dengan ERESOLVE
sebelum satu berkas pun di-typecheck. `.github/dependabot.yml` sekarang
mengabaikan `typescript >=7` supaya PR yang sama tidak lahir ulang tiap minggu;
TypeScript 6 sengaja dibiarkan lewat karena masih di dalam peer range.

Selaraskan renderer blok konten dengan kontrak `ContentBlock` awcms yang
sebenarnya, dan pasang test pertama repo ini.

Versi pertama `src/lib/content-blocks.ts` ditulis terhadap tebakan, bukan
terhadap tipe `ContentBlock` di
`blog-content/domain/content-block-rendering.ts`. Ia berbeda dalam tiga hal,
dan **ketiganya gagal senyap**:

1. Ia menangani tipe `ordered_list`. awcms tidak punya tipe itu — ia
   memancarkan `{ type: "list", ordered: true }`. Jadi setiap daftar bernomor
   yang ditulis editor keluar sebagai daftar berbutir. Tanpa error, tanpa
   peringatan, sekadar salah.
2. `gallery` dan `video_news` jatuh ke cabang paragraf, yang mengembalikan `""`
   bila blok tak punya field `text` — dan keduanya memang tidak punya. **Dua
   tipe blok yang membawa media adalah dua yang hilang total dari halaman.**
3. Header berkasnya mengklaim tipe tak dikenal dirender "sebagai paragraf
   ter-escape … alih-alih dijatuhkan diam-diam". Karena (2), klaim itu justru
   tidak berlaku untuk blok yang paling membutuhkannya.

Yang berubah:

- `list` membaca `ordered` sebagai FIELD; `ordered_list` tidak lagi dikenali
  (awcms tak pernah memancarkannya, dan menerimanya menyiratkan kontrak yang
  tidak ada).
- `gallery` dirender: item ber-`url` menjadi `<img>`; item ber-`mediaObjectId`
  — yang situs ini belum bisa resolve — menjadi placeholder bertanda, bukan
  kekosongan. Gambar hilang jadi temuan review halaman, bukan penemuan pembaca.
- `video_news` dirender sebagai **tautan, bukan embed**. Ini keputusan, bukan
  keterbatasan: pemutar ter-embed adalah permukaan pihak ketiga yang melihat
  pembaca sebelum pembaca memilih menonton apa pun — persis yang dicegah aturan
  tanpa-pihak-ketiga di `AGENTS.md`. awcms meng-embed karena ia melayani produk
  dengan postur berbeda.
- URL dari CMS disaring skemanya (`http`/`https` saja) sebelum masuk `src`/
  `href`. Escaping melindungi sintaks atribut, bukan skemanya — `javascript:`
  yang ter-escape tetap dieksekusi.
- `videoId` divalidasi terhadap pola yang sama dengan awcms sebelum masuk URL.

**Test pertama repo ini** (`npm test`, Node test runner, nol dependensi baru),
20 test. Diuji dengan mengembalikan keempat cacat aslinya: cacat #2 memerahkan
4 test, #1 memerahkan 1, penghapusan filter skema memerahkan 2, penghapusan
validasi `videoId` memerahkan 1.

Kosakata blok sekarang dipatok ke daftar awcms oleh test, sehingga penambahan
tipe di sisi sana memerahkan build di sini alih-alih tayang senyap sebagai
placeholder.

Beri gaya pada kelas blok konten yang lahir di #6.

Kelas `galeri`, `galeri-item`, `video-berita`, dan `blok-tak-tersedia` sengaja
dibiarkan tanpa gaya saat renderer bloknya mendarat, karena #4 sedang menetapkan
standar rasio gambar dan menebak rasionya lebih dulu berarti memotong gambar di
setiap ukuran layar — diam-diam, persis kegagalan yang #4 tulis untuk dicegah.
Sekarang #4 sudah mendarat, jadi galeri memakai `--ratio-visual` seperti setiap
bingkai lain di berkas ini.

Semuanya memakai token yang sudah ada; tidak ada nilai lepas.

`blok-tak-tersedia` sengaja TERLIHAT, bukan disamarkan. Ia menandai lubang di
halaman — gambar yang butuh resolusi media, atau tipe blok yang belum dikenali
renderer — supaya ketahuan saat review, bukan saat dibaca pembaca. Kalau suatu
hari ia terasa mengganggu, jawabannya menutup lubangnya, bukan memudarkan
penandanya.

Pindahkan runtime dan package manager repo ini ke Bun, menutup satu-satunya
divergence runtime yang tersisa dari keluarga AWCMS ([ADR-0015](docs/adr/0015-runtime-bun-menutup-divergence-keluarga.md)).

Sebelum ini repo memakai Node 22 + npm sementara `awcms`, `awcms-mini`, dan
`awcms-micro` memakai Bun. Alasan aslinya masuk akal — keluarannya statis murni,
jadi tidak ada runtime server, dan Node/npm menurunkan hambatan kontributor
konten. Dua hal membatalkannya: [ADR-0014](docs/adr/0014-rendering-campuran-dan-bff-portal.md)
memasukkan runtime server ke repo ini untuk portal Jualanku, dan menjalankan dua
runtime dalam satu keluarga membuat setiap dokumen, gerbang, dan image harus
menjawab "yang mana".

Yang berubah:

- `package.json` — `packageManager: bun@1.3.14`, `engines.bun >= 1.3.0`,
  `engines.node`/`engines.npm` dihapus, seluruh script lewat `bun`/`bun --bun astro`.
- `package-lock.json` dan `.nvmrc` **dihapus**; `bun.lock` menjadi satu-satunya
  lockfile.
- `scripts/cek-lockfile.mjs` ditulis ulang untuk `bun.lock`. Ia tetap berjalan
  sebelum install, dan tetap memeriksa dua hal yang tidak diberikan
  `bun install --frozen-lockfile`: identitas lockfile (`workspaces[""].name` —
  cacat "lockfile milik repo lain" yang nyata pernah terjadi di sini) dan pesan
  gagal yang menunjuk sebabnya sebelum jaringan disentuh. Kedua cabangnya
  dibuktikan gagal pada mutasi nyata, bukan diasumsikan.
- Unit test pindah ke `bun:test` (`bun test`); flag
  `node --experimental-strip-types` tidak lagi diperlukan karena Bun menjalankan
  TypeScript langsung.
- CI memakai `oven-sh/setup-bun` dengan versi dipin, cache
  `~/.bun/install/cache`, `bun install --frozen-lockfile`, `bun test`, dan
  `bun audit`.
- `Dockerfile` membangun dari `oven/bun:1.3.14-alpine`; stage runtime tetap
  nginx unprivileged.
- Dependabot memakai `package-ecosystem: bun`.
- Script rilis berhenti menyinkronkan versi ke lockfile: `bun.lock` tidak
  merekam versi proyek sama sekali, jadi satu kelas cacat hilang dengan
  sendirinya.

Satu jebakan yang tertangkap saat migrasi dan sekarang menjadi aturan di
`AGENTS.md`: script passthrough `"astro": "bun --bun astro"` **dihapus**.
`bun run` menyelesaikan nama ke script `package.json` sebelum
`node_modules/.bin`, sehingga `bun --bun astro check` memanggil script `astro`
yang memanggil dirinya sendiri — rekursi tak terbatas yang mati dengan
`E2BIG: Argument list too long`, pesan yang tidak menyebut sebabnya sama sekali.

Yang **tidak** berubah: `astro.config.mjs`, komponen, kontrak konten, dan
seluruh aturan produk. Migrasi ini menyentuh perkakas, bukan produk.

### Situs dari template ini bisa di-deploy, dan konten barunya memicu rebuild sendiri

Template ini sebelumnya tidak punya jalur deploy sama sekali. `ci.yml` membangun
lalu mengunggah artifact, dan di situ ceritanya berhenti — tidak ada image, tidak
ada penyajian, tidak ada cara konten baru di awcms sampai ke pembaca selain
seseorang teringat menekan tombol.

#### Image produksi

`Dockerfile` multi-stage: build dengan Node (versi dikunci ke `.nvmrc`), sajikan
dengan nginx unprivileged di port 8080. `npm run build` dijalankan di dalam
image, jadi gerbang lockfile dan `astro check` ikut berjalan setiap deploy —
deploy adalah tempat terakhir yang pantas melewati gerbang.

**Konten ditarik saat `docker build`, bukan saat container start.** Ini
konsekuensi `output: 'static'` dan sumber kebingungan paling sering pada deploy
pertama: variabel awcms wajib tersedia sebagai build argument. Diisi sebagai
runtime environment saja, build gagal dengan pesan yang jelas — bukan
menghasilkan situs yang diam-diam kosong.

`AWCMS_API_TOKEN` hanya hidup di stage `build`. Bahwa ia tidak ikut ke image
akhir sekarang **terverifikasi, bukan diasumsikan**: build uji menghasilkan image
yang bersih pada `docker history`, pada seluruh isi filesystem-nya, dan pada
environment container yang berjalan.

#### Penyajian

`ops/nginx-situs.conf` menangani keluaran `build.format: 'directory'` Astro,
memisahkan cache aset ber-hash (immutable, satu tahun) dari HTML (harus
divalidasi ulang). HTML yang di-cache lama membatalkan seluruh premis rebuild
cepat — situs terlihat belum ter-rebuild padahal rebuild-nya sukses.

Header keamanan dipisah ke snippet tersendiri dan di-include ulang di setiap
`location`. Itu bukan gaya penulisan: `add_header` nginx **membuang** seluruh
warisan dari blok induk begitu sebuah `location` punya `add_header` sendiri.
Versi pertama konfigurasi ini menyajikan setiap halaman tanpa satu pun header
keamanan, dan tidak ada yang gagal — ditemukan pengujian, bukan pembacaan.
Pengujian yang sama menemukan `Cache-Control` ganda pada aset, akibat `expires`
dan `add_header` sama-sama menulis header itu.

#### Pemicu rebuild

Jalur utama tidak melewati GitHub: awcms memicu deploy Coolify langsung, Coolify
menarik repo dan membangun ulang commit yang sama dengan konten terbaru.
`.github/workflows/rebuild.yml` menambahkan dua hal yang tidak dijawab jalur itu
— tombol "rebuild sekarang", dan jadwal harian sebagai jaring pengaman. Webhook
yang hilang tidak menimbulkan kegagalan apa pun; yang terjadi justru tidak ada
yang terjadi, dan situs bisa basi berhari-hari tanpa satu pun sinyal.

Rantai lengkap, pengaturan Coolify, dan cara rollback ada di
[`docs/deploy-coolify.md`](docs/deploy-coolify.md).

Sisi pengirim di awcms **belum diimplementasikan**; kontraknya ditetapkan di
dokumen yang sama. Ia wajib mengikuti pola `email` — baris antrean se-transaksi
dengan publish, lalu worker terpisah yang memanggil webhook — dan **bukan**
consumer `domain-event-runtime`, yang tipenya menyatakan dirinya hanya untuk
handler DB-only di dalam transaksi.

### Rasio gambar tunggal, aturan isi ilustrasi, dan skrip rilis yang bisa dijalankan

Menyerap empat perubahan repo rujukan `web-lalulintasmelayani.com` yang terjadi
setelah template ini diekstraksi (`v1.8.0` dan `v1.8.1`), lalu menutup dua hal
yang membuat sebagiannya tidak bisa dipakai di sini.

#### Satu rasio untuk bingkai maupun sumber

Seluruh bingkai gambar memakai `object-fit: cover`, jadi sumber berasio lain
tidak diperkecil — ia **dipotong**, diam-diam, di setiap ukuran layar. Sumber
1∶1 pada bingkai 16∶9 kehilangan 22% teratas dan 22% terbawah, dan judul gambar
hampir selalu ada di sana. Di repo rujukan itu berlaku pada sebelas banner
sekaligus dan tidak ada satu pun build yang gagal karenanya.

Rasionya kini satu token, `--ratio-visual`, dan `.hero-visual-frame`,
`.feature-hero-img`, `.card-img-wrapper`, serta bingkai kepala artikel memakainya
alih-alih tinggi tetap masing-masing.

#### Blok pengganti ilustrasi akhirnya punya gaya

`getArticleImage()` mengembalikan `src: undefined` selama template ini belum
dipasangi seni, dan dokumentasinya menyebut itu keadaan yang didukung: setiap
pemanggil merender blok bertoken. Blok itu tidak pernah ada. `.visual-placeholder`
dirender di empat tempat tanpa satu pun aturan gaya, sehingga tingginya nol dan
bingkai yang seharusnya menahan tata letak ikut hilang.

Bingkai kepala artikel juga berpindah dari `style=""` inline ke
`.article-hero-frame` — satu atribut gaya inline lebih sedikit menjelang CSP
ketat.

#### Aturan isi ilustrasi

Tanpa lambang atau atribut instansi negara, tanpa dokumen dan antarmuka aplikasi
pemerintah yang direkayasa, dan teks di dalam gambar hanya label topik. Angka di
dalam gambar tidak bisa membawa sumber dan dasar hukumnya, sehingga ia lolos dari
aturan yang menjaga seluruh angka lain — dan ia tidak ikut diperbarui saat
tarifnya berubah. Dua aturan terakhir **tidak bisa** diperiksa mesin, dan itu
dinyatakan terus terang alih-alih dibiarkan tampak terjaga.

Ambang keterbacaan ikut ditetapkan: teks terkecil di dalam SVG minimal 22px pada
kanvas 800px, karena pada kartu 328px kanvas itu tampil pada skala 0,41.

#### Skrip rilis

Tautan relatif di changeset ditulis dari sudut pandang `.changesets/`, sementara
`CHANGELOG.md` tinggal di akar repo. Menyalinnya apa adanya membuat setiap tautan
meleset satu tingkat, dan cacatnya baru terlihat di CI — gerbang audit berjalan
**sebelum** changeset dilipat, jadi berkas yang rusak belum ada saat audit
melihatnya. Skrip rilis kini menulis ulang jalurnya saat melipat.

Dua hal yang membuat `npm run release -- <level> --apply` mustahil dijalankan di
repo ini juga ditutup: ia memanggil `npm run audit` yang belum ada di template
(kini hanya dipanggil bila skripnya terdefinisi), dan membaca `CHANGELOG.md`
yang belum ada (kini berkasnya ada, dan sisipan pertama tidak lagi bergantung
pada adanya heading versi sebelumnya).

#### Dokumentasi

`docs/awcms-astro/standar-teknis.md`, `checklist-repo-baru.md`, dan
`ui-ux-design-system.md` disamakan kembali dengan repo rujukan — ketiganya
dokumen standar keluarga dan tidak boleh menyimpang. `.changesets/README.md`
menyusul bentuk penuhnya.

### Lepaskan identitas repo rujukan, dan hentikan nama key yang tampil ke pembaca

Template ini diekstrak dari sebuah situs produksi, dan ekstraksinya berhenti di
tengah jalan. Yang tertinggal bukan kode mati yang tidak berbahaya: sebagian
menerbitkan identitas situs lain di setiap halaman, sebagian menampilkan nama
key mentah kepada pembaca, dan **tidak satu pun dari keduanya pernah gagal** —
`bun run build` hijau, `astro check` bersih nol error, `bun test` lulus. Semua
temuan di bawah ditemukan dengan membaca, bukan dengan gerbang.

#### Identitas situs lain, tertanam harfiah

- **Nama situs repo rujukan di setiap `<title>`.** `BaseLayout` menambahkan
  "— Lalu Lintas Melayani" ke judul halaman apa pun yang belum memuatnya. Setiap
  situs yang lahir dari template ini menerbitkan nama situs orang lain di
  seluruh hasil pencariannya. Sekarang dari `siteConfig.name`.
- **Emoji instansi dan lencana wilayah di header** (`🚔`, "Kalteng"). Yang
  pertama menyalahi larangan atribut instansi negara di AGENTS.md §Keamanan.
  Keduanya dilepas; sebagai gantinya `SITE_MARK` — opsional, kosong secara
  bawaan.
- **`hreflang="x-default"` dipatok ke `'id'`** alih-alih `defaultLocale`.
- **Peta lima nama tab repo rujukan** (`sim`, `stnk`, `bpkb`, …) di
  `ArtikelLayout`. Tidak satu pun cocok dengan tab template ini, jadi setiap
  judul dan breadcrumb diam-diam jatuh ke `kategori.toUpperCase()`.
- **`wilayahSchema()`** menanamkan "Provinsi Kalimantan Tengah" dan
  `addressRegion` repo rujukan di dalam pembangun JSON-LD. Dihapus, bukan
  digeneralisasi.
- **Bendera Merah Putih untuk setiap locale yang bukan `en`.** Locale ketiga apa
  pun — bahasa apa pun, negara mana pun — otomatis mendapatkannya. Sekarang
  locale tanpa bendera mendapat lencana kode ISO-nya.
- **Tahun mulai hak cipta `2023`**, tahun repo rujukan berdiri.
- CSS: `.badge-kalteng`, `.wilayah-filter-btn` (±50 baris untuk komponen yang
  tidak ada), lencana cakupan wilayah, dan `.content-body table { min-width:
  34rem }` yang menyebut pembungkus penggulung "yang disisipkan rehype plugin" —
  pipeline markdown itu sudah tidak ada, jadi yang tersisa hanyalah tabel yang
  menggulingkan halaman di layar 360px.

#### Nama key mentah di layar, di kedua bahasa

Lima kelompok key dipakai komponen tanpa pernah ditulis di katalog mana pun.
Rantai fallback `t()` berujung di nama key, jadi yang tampil kepada pembaca
adalah teks seperti `translation.notice.label` dan `biaya.jenis.pnbp`:

- `translation.notice.label` / `.body` / `.aria` — katalog hanya punya
  `translation.notice`. Terlihat di **setiap artikel yang belum diterjemahkan**,
  yaitu tepat pada pembaca yang paling butuh penjelasannya.
- `tab.articleNo`, `tab.readMoreCta` — terlihat di **setiap kartu artikel di
  setiap halaman indeks tab**.
- `biaya.jenis.*` — terlihat di **setiap baris tabel biaya**.
- `disclaimer.gakkum.*`, `artikel.variasiWilayah` — key hantu untuk kode yang
  tidak pernah bisa tampil di template ini.

Key yang nyata ditambahkan ke kedua katalog; yang hantu dihapus bersama kodenya.
`BiayaTable` sekarang jatuh ke nilai mentah kategorinya, sehingga redaksi bebas
memakai kategori sendiri tanpa lebih dulu menyunting katalog.

**Gerbang barunya:** [`tests/katalog-po.test.mjs`](tests/katalog-po.test.mjs)
menolak key literal tanpa fallback yang tidak ada di katalog, katalog locale
yang tertinggal, `msgstr` kosong, key yatim, dan key tab yang belum ditulis.
Gerbang inilah yang menemukan `tab.articleNo` dan `tab.readMoreCta` — dua yang
lolos dari pembacaan manual. Parser PO dipindahkan ke `src/lib/po-parse.ts`
supaya bisa diuji: selama ia tinggal di `po.ts` bersama impor `?raw` milik Vite,
tidak satu pun tes bisa menyentuhnya.

#### Klaim yang menunjuk berkas yang tidak ada

`socialImage()` mengembalikan `/social/<slug>.png` untuk setiap halaman dan
menyebut `scripts/kartu-share.mjs` sebagai pembangkitnya. Skrip itu tidak pernah
ikut ke repo ini — README sendiri mendaftarkannya di "Yang belum ada". Akibatnya
setiap halaman memasang `og:image`, `twitter:image`, dan `ImageObject` JSON-LD
berukuran 1200×630 yang menunjuk 404: **pratinjau sosial rusak di seluruh
situs**, tanpa satu pun kegagalan build.

Sekarang satu kartu opsional lewat `SITE_SOCIAL_IMAGE`, dan halaman tanpa kartu
melepas seluruh tag gambar — termasuk menurunkan `twitter:card` ke `summary`,
karena `summary_large_image` menjanjikan gambar besar. Pratinjau tanpa gambar
jatuh ke kartu teks yang rapi; pratinjau dengan gambar rusak tidak jatuh ke mana
pun.

#### Cacat perilaku

- **Urutan artikel bisa berbeda antar bahasa.** `urutan` dan `kategori` dibaca
  dari post TERJEMAHAN, bukan dari post sumber. Terjemahan yang field
  `urutan`-nya kosong jatuh ke `99` dan menggeser seluruh bagian bahasa itu —
  halamannya semua ada, urutannya lain, dan tidak ada yang gagal. Ini melanggar
  Rule 3 di `src/lib/content.ts` sendiri. Keduanya kini dari post sumber.
- **Baris "Ditinjau ulang sebelum" tampil tanpa nilai** pada artikel tanpa
  `reviewDueDate` — sebuah janji tinjauan yang tidak pernah dibuat siapa pun.
- **`prefers-reduced-motion` hanya memangkas durasi animasi menjadi 0,01 md**,
  resep yang dilarang eksplisit oleh AGENTS.md §Antarmuka. Animasi 0,01 md tidak
  hilang, ia berkedip — dan kedipan mendadak persis kelas rangsang yang ingin
  dihindari pengguna yang mematikan gerakan. Sekarang `animation: none`.
- **Navigasi utama tidak pernah diterjemahkan.** `TabNav` merender nilai HURUF
  BESAR dari `src/config/site.ts`, sehingga permukaan paling terlihat di situs
  justru satu-satunya yang tidak ikut berganti bahasa.
- **Gambar dari CMS bisa menggulingkan halaman.** Empat kelas yang dipancarkan
  `content-blocks.ts` (`.galeri`, `.galeri-item`, `.video-berita`,
  `.blok-tak-tersedia`) tidak punya satu pun aturan gaya; satu gambar 2000px
  cukup untuk memaksa gulir mendatar di layar 360px, target dukungan terkecil
  repo ini.
- **Penanda terjemahan menyebut bahasa yang salah** — ia menampilkan nama
  bahasa yang sedang dibaca ("belum tersedia dalam English (English)") alih-alih
  bahasa sumbernya, dan memasang `lang="id"` harfiah pada kotak yang isinya
  justru bahasa pembaca, sehingga pembaca layar melafalkan kalimat Inggris
  dengan fonem Indonesia.
- **`entry: any` di `ArtikelLayout`** menyembunyikan empat field yang tidak
  pernah ada di kontrak `LocalizedArticle` (`variasiWilayah`, `unitPelaksana`,
  `tags`, dan `tags` lagi di `articleMeta`). Menggantinya dengan tipe kontraknya
  menemukan seluruhnya dalam satu kali typecheck.

#### Konfigurasi

Dua variabel baru, keduanya opsional dan keduanya kosong secara bawaan —
terdokumentasi di `.env.example`, diteruskan lewat `Dockerfile` dan
`.github/workflows/ci.yml`:

- `SITE_MARK` — glif di depan nama situs di header.
- `SITE_SOCIAL_IMAGE` — satu kartu share untuk seluruh situs.

`graphify-out/` ditambahkan ke `.dockerignore`: artefak analisis bermegabyte
yang ikut ke build context dan membatalkan cache lapisan sumber image setiap
rebuild.

### Keluaran build berhenti membawa gaya di dalam HTML

52 atribut `style=""` yang diwarisi repo rujukan berpindah ke kelas: pola lintas
komponen ke `src/styles/global.css`, sisanya ke `<style>` scoped milik masing
-masing komponen. Nilainya dipertahankan persis — ini pemindahan, bukan
kesempatan mendesain ulang diam-diam.

Kenapa ini bukan kerapian: di belakang CSP ketat (`style-src 'self'` tanpa
`'unsafe-inline'`, postur yang dipakai `awcms` sendiri) setiap atribut gaya
**diblokir browser**, dan halaman kehilangan tata letaknya **tanpa satu pun
error di build**. Selama gaya itu ada, tidak ada situs dari template ini yang
bisa disajikan di belakang CSP semacam itu.

#### Jalur kedua yang sama berbahayanya, dan lebih mudah terlewat

Astro menyisipkan stylesheet apa pun di bawah ~4 kB sebagai `<style>` di dalam
HTML (`build.inlineStylesheets: 'auto'`, bawaannya). `<style>` diblokir CSP
persis seperti `style=""`. Perilaku itu bergantung pada UKURAN, jadi keluaran
hari ini kebetulan patuh — dan akan berhenti patuh pada hari CSS-nya mengecil
atau sebuah komponen membawa stylesheet kecilnya sendiri, tanpa ada yang
mengubah aturan apa pun.

Sekarang `inlineStylesheets` disetel `"never"`.

#### Warna kanal berbagi

Satu-satunya gaya inline yang benar-benar dinamis adalah
`style="--share-color: …"` di ShareButtons. Daftar kanalnya tetap dan tiap kanal
sudah punya kelasnya sendiri, jadi warnanya pindah ke `global.css` bersama
seluruh aturan yang memakainya. Menambah kanal berarti menambah satu baris di
sana; tanpa itu tombolnya jatuh ke `--accent-primary`, bukan ke keadaan tanpa
warna.

#### Gerbang

[`tests/keluaran-csp.test.mjs`](tests/keluaran-csp.test.mjs) memindai
`dist/client/**/*.html`: nol atribut `style=`, nol blok `<style>`, dan — supaya
"nol" tidak bisa berarti "gayanya lenyap" — setiap halaman wajib menautkan
stylesheet eksternal.

Yang **belum** bersih dan sengaja disebut: dua `<script is:inline>` (pengalih
tema dan JSON-LD), sehingga `script-src` ketat belum bisa diklaim.

### Build menarik konten yang benar-benar ada, dari tenant yang benar-benar dimaksud

Implementasi [ADR-0018](docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md),
menindaklanjuti `awcms` ADR-0049 yang menutup dua kontrak penahan repo ini.

Tiga hal tentang cara repo ini bicara ke awcms ternyata tidak sesuai kenyataan,
dan **ketiganya gagal tanpa menggagalkan build**.

#### 1. Daftar post tidak pernah memuat isinya

`GET /api/v1/blog/posts` mengembalikan RINGKASAN: tanpa `contentJson`,
`excerpt`, `metaDescription`, `canonicalUrl`, maupun `translationGroupId`.
Adapter ini mendeklarasikan bentuk post penuh untuk respons itu dan membaca
`contentJson` langsung darinya.

Akibatnya bukan error. `contentJson` terbaca `undefined`, badan setiap artikel
kosong — dan karena **`kategori` juga tinggal di dalam `contentJson`**, tidak
ada satu pun artikel yang cocok dengan tab mana pun. Build sukses, situs terbit,
seluruh seksi kosong, tidak ada yang gagal di mana pun. Itu keadaan repo ini
sampai hari ini, dan tidak terlihat dari dalam repo mana pun secara terpisah.

Sekarang: susuri daftar dengan cursor keyset, buang yang bukan published+public
**sebelum** hidrasi, lalu ambil setiap sisanya utuh dari
`/api/v1/blog/posts/{id}`. N+1 permintaan per build, dinyatakan dan bukan
disembunyikan; build feed di sisi awcms tetap perbaikan sebenarnya.

#### 2. Batas 100 baris berhenti menjadi batas

Adapter dulu meminta 100 dan **melempar** saat respons kembali tepat di batas —
benar saat ditulis, karena memotong diam-diam lebih buruk. awcms kini punya
traversal keyset (`?order=created_at` + `nextCursor`), jadi melempar berarti
menolak membangun situs yang sebenarnya bisa dibangun utuh.

`order=created_at` bukan selera: `updated_at` bergerak setiap kali post
disunting, sehingga sebuah baris bisa melompati batas halaman dan terlewat —
muncul berbulan kemudian sebagai "beberapa artikel hilang", tanpa apa pun yang
bisa mendeteksinya.

#### 3. Header tenant yang tidak pernah dibaca siapa pun

Repo ini mengirim `X-Tenant-Code`/`X-Tenant-Id`. awcms membaca
`x-awcms-tenant-id` dan menolak menambahkan alias — ejaan yang dipakai di sini
tidak pernah ada di sana.

Sejak ADR-0049 tenant datang **dari token**: kredensial mesin berbentuk
`awcmsm_<32 hex tenant>_<rahasia>`. Jadi rantai `AWCMS_TENANT_CODE` →
`AWCMS_TENANT_ID` → `AWCMS_DEFAULT_TENANT_CODE` menjawab pertanyaan yang tidak
lagi ditanyakan, dan `AWCMS_TENANT_ID` berpindah peran menjadi **pernyataan yang
diverifikasi**: bila berbeda dari tenant token, build gagal.

Penjagaannya berpindah, bukan hilang. Rantai lama menjaga "build menebak
tenant" — keadaan yang kini mustahil. Yang mungkin, dan tak terlihat oleh apa
pun sebelumnya, adalah **token tenant lain terpasang di konfigurasi situs ini**:
build hijau, situs penuh, isinya milik orang lain.

#### Terjemahan: gerbang baru yang sengaja menggagalkan

`translationGroupId` diterima awcms saat menulis dan tidak dikembalikan satu pun
endpoint baca. Field itulah yang memasangkan locale. Melanjutkan tanpa itu tidak
terlihat seperti kegagalan: setiap locale non-default jatuh ke bahasa sumber
dengan penanda "belum diterjemahkan", sehingga situs menerbitkan terjemahan yang
ADA sebagai halaman yang tidak diterjemahkan.

Adapter kini menolak membangun keadaan itu. Gerbangnya assertion atas DATA,
bukan pemeriksaan versi awcms — situs satu-locale tetap membangun hari ini, dan
begitu awcms mengembalikan field-nya, gerbang itu lewat sendiri.

#### Yang perlu diubah operator

Konfigurasi deployment yang sudah ada **akan gagal sekali, dengan sengaja**:

- `AWCMS_API_TOKEN` wajib kredensial mesin. Terbitkan dengan
  `POST /api/v1/access/machine-credentials`, `allowed_permission_keys` berisi
  tepat `blog_content.posts.read`. Token sesi manusia ditolak — sesi
  kedaluwarsa, reset password mencabutnya, dan step-up MFA merotasinya.
- `AWCMS_TENANT_CODE` dan `AWCMS_DEFAULT_TENANT_CODE` **ditolak**, bukan
  diabaikan. Hapus; ganti dengan `AWCMS_TENANT_ID` bila ingin tetap menyatakan
  tenant situs ini — build lalu memverifikasinya.

#### Gerbang

`tests/kontrak-awcms.test.mjs`: 10 tes atas assertion tenant, traversal 250 post
lintas tiga halaman, draft yang tidak pernah dihidrasi, isi yang benar-benar
datang dari endpoint detail, dan kedua sisi gerbang terjemahan.

### Satu traversal menggantikan N+1: adapter memakai `view=full`

`awcms` menutup gap yang ADR-0018 catat beberapa jam sebelumnya:
`GET /api/v1/blog/posts?view=full&order=created_at` kini mengembalikan baris
penuh — `contentJson`, `excerpt`, `metaDescription`, `canonicalUrl`, dan
`translationGroupId` — dengan cursor keyset yang sama.

Adapter karena itu berhenti mengambil ulang setiap post lewat
`/api/v1/blog/posts/{id}`. Sebuah situs 500 artikel turun dari ~511 permintaan
per rebuild menjadi 11, dan rebuild dipicu setiap kali redaksi menekan
*publish*.

Yang ikut berubah:

- Ukuran halaman turun ke **50** — batas yang awcms terapkan untuk `view=full`
  karena barisnya membawa `contentJson`.
- Gerbang `translationGroupId` **tetap ada dan tidak berubah satu baris pun**.
  Ia ditulis sebagai assertion atas DATA, bukan pemeriksaan versi awcms, jadi ia
  berhenti menggagalkan situs multi-locale dengan sendirinya begitu field-nya
  benar-benar dikembalikan — dan tetap menjaga keadaan sebaliknya.
- Dua tes baru: satu menegaskan **tidak ada lagi permintaan per-post** (kalau ia
  kembali, ia kembali diam-diam), satu menegaskan adapter benar-benar mengirim
  `view=full` **dan** `order=created_at` — dua parameter yang membedakan "situs
  terbit" dari "situs kosong".

### Bun menyajikan hasil build; nginx dilepas dari image

Implementasi [ADR-0016](docs/adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md).
Stage runtime image berhenti memakai `nginxinc/nginx-unprivileged` dan berganti
menjadi proses Bun yang menjalankan keluaran adapter `@astrojs/node`. Dengan itu
"Bun adalah runtime repo ini" berlaku di development, build, dan produksi tanpa
pengecualian — sebelumnya produksi adalah satu-satunya tempat pernyataan itu
tidak benar.

`output` **tidak** berubah: seluruh halaman tetap diprerender, tidak ada satu pun
rute menyatakan `prerender = false`, dan container tetap tidak pernah menghubungi
awcms. Yang berpindah hanya siapa yang membaca berkas dari disk.

#### Yang berubah bagi pembaca

Tidak ada, dan itu memang targetnya. Lima perilaku nginx berpindah utuh: `try_files`
ke `index.html` direktori, `immutable` untuk aset ber-hash, HTML yang tidak boleh
di-cache lama, tiga header keamanan, dan penolakan berkas ber-titik plus halaman
404. Semuanya sekarang dijaga `tests/penyaji.test.mjs` — sebelumnya tidak satu
pun punya pemeriksa, dan seluruhnya berperilaku benar secara diam-diam saat
hilang: situs tetap tayang, hanya rebuild yang sukses tidak pernah terlihat.

Satu selisih yang ditemukan saat memindahkannya dan langsung ditutup: adapter
memasang `immutable` dari event yang **tidak pernah terjadi pada HEAD**, sehingga
`curl -I` melaporkan `max-age=0` untuk berkas yang sama yang GET-nya `immutable`.
Perintah verifikasi setelah deploy di `docs/deploy-coolify.md` memakai `curl -sI`,
jadi header yang benar akan terbaca salah oleh orang yang memeriksanya. Penyaji
menetapkan header sebelum berkasnya dibuka, jadi GET dan HEAD tidak bisa
berselisih.

#### Yang berubah bagi yang mengembangkan

- `dist/` sekarang punya dua bagian: `dist/client/` (situsnya) dan `dist/server/`
  (entrypoint adapter + penyaji yang sudah dibundel). Apa pun yang menyalin
  `dist/` perlu tahu itu.
- `bun run build` menambah satu langkah: membundel penyaji menjadi satu berkas.
  Bundel itu yang membuat image produksi tidak perlu `node_modules` sama sekali —
  pohon dependency `astro` berukuran ratusan megabyte dan tidak satu pun barisnya
  dibutuhkan untuk menyajikan berkas.
- `bun run preview` dan `bun run start` sekarang menjalankan penyaji produksi,
  bukan `astro preview` / `astro dev`. `bun run start` yang dulu menyalakan server
  pengembangan adalah perangkap begitu repo ini punya penyaji produksi sungguhan.
- `bun run serve` adalah nama barunya; `PORT` dan `HOST` didokumentasikan di
  `.env.example` sebagai satu-satunya variabel yang dibaca setelah build.

`bun run dev` **belum** mengirim header yang sama — ia tetap server pengembangan
Astro. Itu selisih yang diakui di catatan implementasi ADR-0016, bukan yang
diam-diam dianggap selesai.

### Dokumen berhenti menyebut gerbang dan berkas yang tidak ada

Dokumen tata kelola repo ini masih dokumen repo rujukan yang disalin: ia
mewajibkan `bun run audit`, menyebut `scripts/audit-konten.mjs` dan
`bun run kartu-share`, menautkan ADR-0001…0013 yang tidak pernah ikut dibawa,
dan meminta kontributor memverifikasi tarif PNBP Kalteng di sebuah repo yang
tidak memuat satu pun artikel.

Yang membuat ini lebih dari kerapian: **gerbang yang disebut tetapi tidak ada
lebih berbahaya daripada gerbang yang jelas-jelas tidak ada.** Definition of Done
yang mewajibkan `bun run audit` melaporkan 0 error tidak pernah bisa dipenuhi —
jadi ia dilewati, dan yang ikut terlewati adalah butir di sebelahnya yang
sebenarnya bisa dijalankan. Checklist yang tidak mungkin dijalankan berhenti
dibaca seluruhnya.

#### Yang diperbaiki

- `CONTRIBUTING.md` ditulis ulang untuk repo template: tabel perintah kini
  memuat script yang benar-benar ada di `package.json`, kontribusi yang
  dibutuhkan menunjuk backlog nyata di README, dan aturan kontennya menunjuk
  `AGENTS.md` alih-alih mengulang aturan domain repo rujukan.
- `GOVERNANCE.md`: gerbang rilis menjadi `bun run build + bun test`, pemicu ADR
  memuat penyajian dan `prerender = false`, dan peran "penutur asli bahasa
  daerah" dikembalikan ke repo situs yang memilikinya.
- `SUPPORT.md`: tabel jalur berhenti menjanjikan templat issue yang tidak ada
  (hanya **Laporan bug** yang ada), dan prioritasnya menjadi kelas cacat yang
  tidak menggagalkan build.
- `.github/ISSUE_TEMPLATE/config.yml` menunjuk repo ini, bukan URL repo rujukan
  — jalur pelaporan kerentanan sebelumnya mengarah ke advisories repo lain.
- `.github/PULL_REQUEST_TEMPLATE.md`: bagian verifikasi konten domain diganti
  daftar "yang tidak gagal sendiri", dan `bun run audit` dilepas dari DoD.
- `CHANGELOG.md` menyebut `bun run release`, bukan `npm run release`.
- Seluruh tautan relatif yang mati diperbaiki: rujukan ke ADR-0001…0013 ditulis
  sebagai nomor tanpa tautan, karena berkasnya memang tidak ada di sini.
- `docs/awcms-astro/` menyatakan mana gerbang standar yang **sudah** ada di repo
  ini dan mana yang belum, alih-alih menyebut semuanya seolah berjalan. Klaim
  "tanpa runtime server" juga dikoreksi — sejak ADR-0016 ada proses Bun yang
  menyajikan.

#### Yang sengaja TIDAK diubah

Changeset lama. Isinya catatan keadaan pada saat itu, dan merapikannya berarti
menghapus jejak bahwa keadaannya pernah lain.

### CI dan image berhenti mengirim variabel tenant yang sudah ditolak

ADR-0018 memensiunkan `AWCMS_TENANT_CODE` dan `AWCMS_DEFAULT_TENANT_CODE`, dan
membuat build **menolak** keduanya alih-alih mengabaikannya. Dokumentasi ikut
berpindah. Dua tempat yang benar-benar membangun situs tidak ikut:
`.github/workflows/ci.yml` dan `Dockerfile` masih meneruskan keduanya.

Akibatnya berlawanan arah dengan maksud ADR-0018. Sebuah situs yang menyimpan
`vars.AWCMS_TENANT_CODE` — nilai yang dokumentasi versi sebelumnya justru
menyuruh mengisinya — mendapat build yang **gagal** di CI dan di image, dengan
pesan yang tidak menyebut langkah mana yang mengirimkannya. Penolakan itu
dirancang untuk menangkap konfigurasi yang tidak menentukan apa-apa; yang
terjadi adalah ia menembak pemakainya sendiri.

#### Arah sebaliknya, dan ini yang lebih mahal

`AWCMS_TENANT_ID` **tidak pernah diteruskan CI sama sekali**. Ia assertion yang
menangkap satu keadaan yang tidak terlihat oleh apa pun: token tenant lain
terpasang di situs ini — build hijau, situs penuh, isinya milik orang lain.
Selama baris itu tidak ada, assertion tersebut tidak pernah berjalan di
satu-satunya tempat sebuah situs membangun sebelum deploy. `Dockerfile` sudah
meneruskannya; CI belum.

#### Gerbang

`tests/kontrak-awcms.test.mjs` membaca `ci.yml` dan `Dockerfile` sebagai berkas:
tidak ada baris non-komentar yang menyebut variabel pensiun, dan
`AWCMS_TENANT_ID` wajib ada di keduanya. Komentar boleh menyebut namanya —
justru di sanalah alasannya ditulis.

Pasangannya yang sudah ada memeriksa sisi kode (`resolveTenant` menolak variabel
itu). Menolak sebuah variabel hanya bermanfaat bila tidak ada yang mengirimnya,
jadi kedua sisi butuh gerbangnya masing-masing.

#### Untuk situs yang sudah berjalan

Hapus `AWCMS_TENANT_CODE` dan `AWCMS_DEFAULT_TENANT_CODE` dari repository
variables GitHub dan dari build variable Coolify, lalu isi `AWCMS_TENANT_ID`
dengan uuid tenant situs itu.

### CSP ketat benar-benar dikirim, dan skrip berhenti tinggal di dalam HTML

Penyaji memasang header keamanan keempat (ADR-0019):

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self';
font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none';
base-uri 'none'; form-action 'self'; frame-ancestors 'none'
```

Beserta yang kelima, `Permissions-Policy: geolocation=(), camera=(),
microphone=(), payment=()`. Keduanya disamakan dengan postur `awcms`, yang sudah
mengirim CSP sendiri — termasuk `base-uri 'none'`, yang lebih ketat daripada
`'self'`: `'self'` masih mengizinkan sebuah `<base href>` yang disuntikkan
menggeser resolusi setiap tautan relatif di halaman, dan situs statis tidak
pernah memakai `<base>`.

Satu perbedaan tersisa, arahnya menguntungkan repo ini: `awcms` harus menamai
hash SHA-256 skrip theme-init-nya di `script-src` karena skrip itu inline dan
harus jalan sebelum paint. Repo ini tidak butuh hash sama sekali — skrip yang
sama pindah ke `public/tema.js`.

Sebelum ini repo menyatakan keluarannya "siap CSP" tanpa satu pun pembaca yang
pernah menerima CSP. Kesiapannya sendiri baru separuh: changeset sebelumnya
membersihkan gaya inline, dan menyebut dua `<script is:inline>` sebagai sisa.

#### Sisanya ternyata tiga jalur, bukan dua

Yang ketiga tidak terlihat dari `src/` sama sekali. `ShareButtons.astro` memakai
`<script>` biasa — tidak ada satu pun skrip inline di sumbernya — dan Astro
membundelnya, lalu **menyisipkan bundel itu kembali ke dalam HTML** karena
chunk-nya lebih kecil dari `assetsInlineLimit` Vite (4 kB secara bawaan). Pola
yang sama persis dengan `inlineStylesheets: 'auto'`: bergantung UKURAN, jadi
sebuah situs bisa patuh hari ini dan berhenti patuh besok karena seseorang
menghapus tiga baris dari sebuah komponen. Sekarang limitnya `0`, yang sekalian
menghentikan gambar dan font kecil terbit sebagai `data:` URI — dan itulah yang
membuat `img-src 'self'` serta `font-src 'self'` bisa ditulis tanpa `data:`.

#### Pengalih tema

Kedua bloknya pindah utuh ke [`public/tema.js`](public/tema.js), dimuat
`<script src="/tema.js">` klasik di dalam `<head>`. Ia harus jalan sebelum paint
pertama — `data-theme` yang terpasang belakangan berarti kedipan putih di setiap
perpindahan halaman bagi pembaca yang memilih tema gelap — dan bundel Astro
selalu `type="module"`, yang selalu ditunda. Karena namanya tidak ber-hash, ia
disajikan `must-revalidate` seperti HTML, bukan `immutable`: perbaikan pada
pengalih tema sampai ke pembaca lama pada rebuild berikutnya.

Perilakunya tidak berubah, termasuk tanpa JavaScript: `data-theme` tidak
terpasang dan tema mengikuti `prefers-color-scheme` lewat media query.

#### JSON-LD tetap inline, dan itu bukan pengecualian yang dilonggarkan

`<script type="application/ld+json">` adalah blok data, bukan skrip — tipe yang
bukan MIME JavaScript membuat browser berhenti sebelum langkah mana pun yang
mengeksekusi, jadi `script-src` tidak berlaku atasnya. Memindahkannya ke berkas
eksternal, yang sempat dicatat README sebagai jalan keluar, justru merugikan
tanpa menambah keamanan apa pun: mesin pencari membaca JSON-LD dari halamannya.

#### Gerbang

`tests/keluaran-csp.test.mjs` bertambah tiga pemeriksaan atas `dist/client/`:
nol skrip inline yang dieksekusi (tepat `application/ld+json` yang dikecualikan),
setiap `src`/`href` ber-origin sendiri — tidak ada CDN, tidak ada `data:` — dan,
supaya "nol skrip inline" tidak bisa berarti "JS-nya lenyap", `/tema.js` wajib
ada di setiap halaman beserta sedikitnya satu bundel `/_astro/*.js`.

`tests/penyaji.test.mjs` memeriksa ISI kebijakannya, bukan kehadirannya: CSP yang
terpasang tetapi memuat `'unsafe-inline'` adalah keadaan terburuk dari keduanya
— terlihat di `curl -I`, terhitung patuh, dan tetap meloloskan serangan yang
paling ingin dicegahnya.

Gerbang keluaran hanya berjalan bila `dist/` ada. Di repo template ini `bun test`
tanpa build melewatinya dan mengatakannya; di sebuah situs, jalankan `bun test`
lagi setelah `bun run build`.

### Gerbang audit konten: memeriksa yang TERBIT, bukan yang tertulis

`scripts/audit-konten.mjs` dan `bun run audit:konten`. README mendaftarkan
gerbang ini sebagai butir backlog pertama dan menyebutnya "yang membuat standar
ini punya gigi"; butir gerbang rasio gambar menunggunya. Keduanya selesai di
sini.

Alasannya bukan kelengkapan. Setiap kelas cacat di bawah **tidak menggagalkan
apa pun** saat terjadi: `astro check` bersih, `bun test` hijau, build sukses,
situs terbit — dan pembacanya mendapat halaman yang rusak dengan cara yang tidak
dilihat penulisnya.

#### Keluaran build (`dist/client/**`)

| Gerbang | Yang tidak gagal sendiri |
| --- | --- |
| `seo` | Halaman tanpa `<title>` atau meta description; canonical hilang pada halaman yang bukan `noindex`; `noindex` yang tetap memasang canonical; judul kembar di dalam SATU locale |
| `hreflang` | Alternate yang menunjuk halaman tidak ada, `x-default` hilang, dan **kelompok yang pincang** — A menunjuk B, B tidak menunjuk balik. Mesin pencari mengabaikan kelompok semacam itu, jadi seluruh sinyal multi-bahasa hilang tanpa satu pun halaman terlihat rusak |
| `aset-dijanjikan` | `og:image`, `twitter:image`, dan `ImageObject` JSON-LD yang menunjuk berkas yang tidak diterbitkan build ini |
| `tautan-mati` | `href`/`src` internal yang tidak menyelesaikan ke berkas mana pun |
| `sitemap` | `<loc>` yang mendaftarkan halaman yang tidak dibangun |
| `key-bocor` | Nama key mentah yang tampil sebagai teks layar |
| `json-ld` | Blok JSON-LD yang tidak bisa di-parse — crawler mengabaikannya diam-diam, dan seluruh data terstruktur halaman itu hilang |

Dua di antaranya bukan hipotesis. Template ini pernah memasang `og:image` ke
`/social/<slug>.png` yang tidak pernah dibangkitkan siapa pun, di setiap
halaman; dan pernah menerbitkan `translation.notice.label` serta
`biaya.jenis.pnbp` sebagai teks yang dibaca pembaca, di kedua bahasa.

`key-bocor` melengkapi `tests/katalog-po.test.mjs`, tidak menggantikannya. Tes
itu menolak key LITERAL yang tidak ada di katalog dan tidak bisa melihat key
yang dirangkai saat build. Di keluaran, key dinamis tidak lagi dinamis — ia teks
biasa. Presisinya datang dari namespace: hanya teks berbentuk key dari namespace
yang benar-benar dipakai katalog situs ini yang ditandai, sehingga `example.com`
di dalam kalimat tidak ikut terjaring.

#### Sumber gambar (`src/assets/**`, `public/**`)

Rasio terhadap `--ratio-visual` — dibaca dari `global.css`, bukan ditulis ulang
di skrip — termasuk `viewBox` SVG. Format dibaca dari **isi** berkas: sebelas
berkas di repo rujukan ber-ekstensi `.png` padahal isinya JPEG. `&` telanjang di
SVG, yang membuat browser gagal merender tanpa satu pun pesan error. Dan ukuran
teks terkecil, dengan ambang 22px pada kanvas 800px yang diskalakan terhadap
lebar `viewBox`.

Format yang dimensinya belum bisa dibaca gerbang ini **dilaporkan sebagai
pelanggaran**, bukan dilewati. Gerbang yang melewati apa yang tidak dikenalinya
bisa dilewati dengan mengganti format.

`public/` sengaja tidak diperiksa rasionya dan skripnya mengatakan itu setiap
kali berjalan: favicon wajib bujur sangkar dan kartu share punya ukuran bakunya
sendiri (1200×630). Memaksa rasio tunggal di sana akan menolak berkas yang
justru benar.

#### Yang tetap manual, dan disebut terus terang

Teks di dalam gambar hanya label topik, dan tanpa lambang atau atribut instansi
negara. Tidak ada pemeriksa yang bisa menilai keduanya. Aturan yang tampak
terjaga padahal tidak lebih berbahaya daripada aturan yang jelas-jelas manual.

#### Di mana ia berjalan

CI job `check` menjalankannya tanpa `dist/` — hanya gerbang gambar yang jalan,
dan skripnya menyatakan sisanya dilewati. Job `build` menjalankannya lagi
setelah build, dan `Dockerfile` menjalankannya di dalam image, tempat `dist/`
selalu ada. Gerbang yang diam saat tidak berjalan adalah gerbang yang tidak ada,
jadi skrip ini selalu mencetak apa yang diperiksanya dan apa yang tidak.

### Layar admin kembali ke `awcms`: ADR-0017 di-supersede ADR-0020

`awcms` [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md)
(1 Agustus 2026) memutuskan **seluruh layar admin — tenant maupun
owner/internal/platform — dibangun di `awcms`**, dan men-supersede ADR-0048 yang
merupakan pasangan ADR-0017 repo ini. Keputusan itu sudah dijalankan: sembilan PR
layar admin mendarat di `awcms` pada 1–2 Agustus 2026.

Sampai perubahan ini, `AGENTS.md` repo ini menyatakan hal yang berlawanan —
"repo ini memikul halaman admin owner/internal", lengkap dengan tabel dua
permukaan dan instruksi bahwa layar platform dibangun di sini. Itu bukan
ketidakrapian dokumen: `AGENTS.md` adalah kontrak kerja yang dibaca agen
berikutnya sebelum menulis baris pertama, dan yang ia perintahkan akan mendarat
di repo yang salah.

#### Kenapa keputusannya dibalik, dan kenapa bukan karena buntu

Yang menarik: dua kontrak yang ADR-0017 sebut sebagai blocker — header tenant dan
kredensial mesin yang bisa dipegang BFF — justru **sudah mendarat** di `awcms` (ADR-0049 dan
ADR-0050). Jalurnya terbuka, lalu ditutup secara sadar.

Alasan yang menentukan adalah butir yang sudah ditulis ADR-0017 sendiri tanpa
ditarik kesimpulannya: *"izin tidak pindah bersama layar."* Betul — dan karena
itu **risikonya juga tidak pindah**. `awcms` menemukannya sebagai kasus nyata:
permission aktivasi dataset wilayah di-seed ke role `owner` setiap tenant,
sehingga owner tenant biasa memegang izin mengganti data yang dilayani ke seluruh
tenant. Yang menahan aksi lintas-tenant adalah gerbang otorisasi, bukan alamat
repo tempat tombolnya digambar.

Dua alasan lain dari sisi `awcms`: aturan lama hanya mengikat layar **baru**
(sehingga `/admin/*` punya dua kelas layar yang dibedakan tanggal lahirnya), dan
biayanya adalah **13 dari 21 modul tanpa satu pun layar** — 125 berkas route yang
hanya bisa dipakai lewat `curl`, sebagian menunggu repo ini.

#### Yang berubah, dan yang sengaja tidak

Tidak ada kode yang dihapus: layar admin di sini tidak pernah ada, dan ADR-0017
sendiri menyatakan layar pertamanya diblokir.

Yang **tetap** berlaku:

- **ADR-0014 tidak tersentuh.** Rute on-demand + BFF portal Jualanku adalah peran
  `awcms` ADR-0045, bukan peran admin, dan ADR-0045 tidak berubah.
- **Empat aturan ADR-0017 dipindahkan utuh ke `AGENTS.md`**, karena keempatnya
  menyangkut permukaan terautentikasi apa pun: `awcms` tetap system of record;
  izin diputuskan `awcms`; tanpa cache bersama; setiap penambahan dinilai sebagai
  permukaan keamanan. Aturan yang hilang bersama ADR yang di-supersede adalah
  aturan yang tidak ada.
- **Kredensial mesin tetap terpakai** untuk hal yang memang dipakainya di sini:
  token build yang menarik konten (ADR-0018).

Repo ini karena itu kembali ke kelas "publik", dan biaya yang ADR-0017 catat —
"berhenti menjadi hanya situs statis" — dibatalkan.

#### Satu klaim lain yang berhenti benar

Pembacaan `awcms` yang sama menemukan bahwa
[`src/lib/article-images.ts`](src/lib/article-images.ts) dan README masih
menyatakan gambar artikel menunggu "endpoint resolusi media di sisi awcms".
**Endpoint itu sudah ada**: `GET /api/v1/media/objects?ids=…` batch-resolve media
id menjadi `{ publicUrl, altText, mimeType, width, height }`, melaporkan id yang
tak teresolusi alih-alih membuangnya, dan digerbangi
`media_library.media.read` — permission baca-saja yang boleh dipegang kredensial
mesin. Docstring-nya di `awcms` menyebut berkas repo ini sebagai alasan ia
dibuat, dan feed build sudah membawa `featuredMediaId` di setiap baris penuh.

Sisa pekerjaannya berpindah ke repo ini dan berubah sifat: bukan lagi kontrak
yang buntu, melainkan dua keputusan — di mana gambar hasil resolusi tinggal
(`LocalizedArticle`, di-resolve sekali per build; bukan modul sinkron yang
dipanggil komponen), dan apa yang diizinkan `img-src` (host media ber-origin
lain, jadi CSP ADR-0019 memblokirnya sampai origin itu dinyatakan). Keduanya
ditulis di kedua berkas itu, sehingga yang membacanya berikutnya tidak mengira
jalurnya masih tertutup.

### Pengembangan repo ini ditahan sampai fondasi `awcms` selesai

Aturan pemilik 2 Agustus 2026, dicatat sebagai
[ADR-0021](docs/adr/0021-tahan-pengembangan-menunggu-fondasi-awcms.md).

Yang **masih** mendarat selama penahanan, dan hanya ini: patch keamanan, bump
dependency, dan koreksi dokumen yang berhenti benar karena `awcms` berubah.
Selebihnya — fitur, refactor, gerbang baru, dokumen baru — ditahan.

#### Kenapa, dan kenapa bukan karena kekurangan pekerjaan

Empat perubahan mendarat hari ini dan menutup seluruh yang bisa diselesaikan
tanpa `awcms` bergerak lebih dulu. Sisa backlog **semuanya** menunggu `awcms`,
dan itu bukan kebetulan: ADR-0020 baru saja memindahkan seluruh layar admin ke
sana, `awcms` ADR-0047 membekukan `awcms-mini`/`awcms-micro` sehingga fitur
fondasi dirintis langsung di `awcms`, dan gelombang layar admin di sana sedang
berjalan. Pusat gravitasi pekerjaan keluarga ini ada di `awcms`; repo ini
konsumen kontraknya.

Biaya mengembangkan paralel spesifik, bukan sekadar "kurang fokus": **fitur yang
dibangun di atas kontrak yang belum stabil ditulis dua kali.** Repo ini sudah
membayarnya sekali — adapter kontennya ditulis untuk daftar ringkasan, lalu
ditulis ulang saat `awcms` mengirimkan build feed (ADR-0018), dan versi
pertamanya menerbitkan situs yang setiap artikelnya kosong dengan build hijau.

#### Kenapa keamanan dan dependency dikecualikan

Repo ini punya image produksi yang berjalan. Kerentanan tidak ikut membeku
bersama pengembangannya. Dan Dependabot tetap membuka PR selama penahanan —
membiarkannya menumpuk berarti mencabut penahanan ke sebuah tumpukan bump
berbulan-bulan yang dinilai sekaligus, persis keadaan yang paling mungkin
menyelundupkan perubahan perilaku tanpa ada yang membacanya.

#### Kapan dicabut

Saat pemilik menyatakan pengembangan dasar `awcms` selesai. Dua indikator yang
bisa diperiksa hari ini, keduanya di `PROJECT_STATE.md` milik `awcms`: setiap
modul punya layar (kini **7 dari 21** masih tanpa layar, turun dari 13), dan §4
"yang belum" habis. Keduanya indikator, bukan gerbang otomatis.

#### Titik lanjut

ADR-0021 §Titik lanjut mencatat apa yang menunggu beserta alasannya — ditulis
sekarang selagi konteksnya segar, karena daftar yang direkonstruksi dari
`git log` berbulan-bulan kemudian selalu kehilangan alasannya. Yang terpenting:
gambar artikel **tidak lagi diblokir `awcms`** dan tinggal dua keputusan di repo
ini.

#### Dokumen yang ikut dikoreksi

Tabel "Yang paling dibutuhkan" di `CONTRIBUTING.md` masih meminta tiga gerbang
yang hari ini sudah ada, dan pelepasan gaya inline yang sudah selesai. Keduanya
diganti dengan yang benar-benar berharga sekarang: positif palsu dari gerbang
yang sudah jalan, dan komponen baru yang diam-diam mengembalikan skrip inline ke
HTML.

### Gambar artikel dari media `awcms` — dan `img-src` yang ditanyakan, bukan disalin

[ADR-0025](docs/adr/0025-gambar-artikel-dari-media-awcms.md). Butir pertama
§Titik lanjut ADR-0021 — yang paling lama menunggu — selesai.

#### Kenapa sekarang, dan dasarnya bukan dari sini

[ADR-0023](docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)
menahan pekerjaan yang membutuhkan `awcms` dengan satu batas: *"endpoint-nya
sudah ada" bukan jawaban "tidak"*, karena repo template ini tidak punya instans
untuk membuktikan panggilannya benar.

Dua hal dari `awcms` mengubah dasarnya:

- **Analisis kesiapan** (`awcms` #371), diperiksa ke KODE bukan ke daftar:
  **setiap kontrak konten dan sesi yang benar-benar dipanggil `awcms-astro`
  sudah lengkap** — lima permukaan, semuanya mendarat.
- **Satu celah nyata ditutup di gelombang yang sama** (`awcms` #370):
  `GET /api/v1/media/public-origin`, dibuka **persis untuk repo ini**.

#### Yang berubah untuk pembaca situs

Artikel yang punya featured image di `awcms` kini menampilkannya. Sebelumnya
setiap artikel merender blok bertoken, apa pun isi CMS-nya.

Media `awcms` **menang atas seni lokal**, dan itu bukan "remote mengalahkan
lokal" melainkan **spesifik mengalahkan generik**: `featuredMediaId` dipilih
editor untuk artikel itu, `artikel/<tab>/<slug>` kebetulan cocok jalurnya.
Situs yang mau sebaliknya berhenti mengisi featured image — keputusan yang
dibuat di tempat artikelnya tinggal.

#### Tiga keputusan yang menentukan bentuknya

- **Sekali per build, hasilnya di `LocalizedArticle`.** Bukan di
  `article-images.ts`: modul itu sinkron dan komponen tidak boleh mengambil
  datanya sendiri. Menaruhnya di sana berarti komponen async atau satu
  permintaan HTTP per kartu — ratusan permintaan untuk data yang satu batch
  sudah pegang. Batch dipecah per 100 id, batas yang `awcms` terapkan dengan
  400, bukan dengan pemotongan diam-diam.
- **Satu id hilang ≠ semua id hilang.** Satu id yang tidak resolve menjadi
  placeholder: `awcms` mengizinkan objek di-purge dan memutuskan rujukan
  menggantung menjadi inert (ADR-0056 §B), jadi menggagalkan build di sini
  berarti situs tidak bisa terbit karena satu gambar dihapus. **Nol dari N
  menggagalkan build** — itu bukan aksi operator melainkan token tanpa
  `media.read`, `awcms` yang lebih tua, atau media yang tak dikonfigurasi;
  ketiganya menerbitkan situs yang setiap artikelnya kehilangan gambar
  sekaligus, bentuk cacat ADR-0018 yang persis sama.
- **`img-src` ditanyakan, tidak disalin.** Build menanyakan asal media ke
  `awcms` lalu menuliskannya untuk penyaji. Menyalin
  `NEWS_MEDIA_R2_PUBLIC_BASE_URL` dengan tangan adalah dua salinan satu nilai
  yang sepakat sampai salah satunya disunting — dengan kegagalan yang tidak
  menyebut sebabnya di mana pun: gambar diblokir diam-diam oleh kebijakan yang
  tampak baik-baik saja.

#### Kebijakan tetap dirangkai di satu tempat

`server/penyaji.mjs` masih satu-satunya tempat CSP disusun; berkas yang ditulis
build adalah **data, bukan kebijakan kedua** — aturan ADR-0019 tidak berubah.

Nilainya berakhir di dalam sebuah header, jadi ia diperlakukan sebagai masukan
yang tidak dipercaya: JSON rusak, `configured: false`, skema selain
`http`/`https`, dan nilai bukan-string semuanya dibaca sebagai tidak ada, dan
origin dipangkas lewat `new URL(...).origin` sehingga path maupun spasi tidak
bisa menyelundupkan direktif kedua. Satu nilai cacat membuat browser menolak
**seluruh** kebijakan, bersama tiap direktif lain di dalamnya.

#### Satu baris `Dockerfile` yang wajib ikut

Image sebelumnya menyalin `dist/server/penyaji.mjs` saja. Berkas asal media yang
tertinggal di stage build berarti penyaji jatuh ke `img-src 'self'` dan setiap
gambar artikel diblokir browser — pada image yang build-nya hijau, dengan
halaman yang terbit utuh selain gambarnya. Baris `COPY`-nya membawa komentar
yang menyebut akibat itu, karena tidak ada gerbang yang bisa melihatnya.

### Gerbang audit dokumen, dan penahanan yang dipersempit supaya ia bisa mendarat

Changeset sebelumnya menutup indeks ADR yang mendaftarkan enam keputusan yang
tak pernah ada di repo ini, lalu menulis bahwa **gerbangnya** ditahan
[ADR-0021](docs/adr/0021-tahan-pengembangan-menunggu-fondasi-awcms.md).
Gerbang itu mendarat di sini.

#### Kenapa penahanannya dipersempit lebih dulu

[ADR-0023](docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md),
aturan pemilik 3 Agustus 2026: pekerjaan yang tidak membutuhkan repo
`ahliweb/awcms` boleh mendarat.

ADR-0021 menahan pengembangan dengan alasan yang masih benar — fitur di atas
kontrak `awcms` yang belum keras ditulis dua kali — tetapi mengasumsikan
**seluruh** sisa backlog menunggu `awcms`. Asumsi itu tidak bertahan satu hari:
butir pertama §Titik lanjut-nya sendiri berbunyi "tidak lagi diblokir `awcms`",
dan cacat indeks ADR tidak menyentuh `awcms` sama sekali.

Ujinya satu pertanyaan: **apakah perubahan ini akan ditulis ulang bila `awcms`
berubah?** Tidak → mendarat; ya → ditahan. Batasnya dinyatakan supaya tidak
melar: "endpoint-nya sudah ada" bukan jawaban "tidak", karena kode yang
memanggil `awcms` bentuknya tetap ditentukan respons `awcms` — dan repo template
ini tidak punya instans untuk membuktikannya.

#### Apa yang diperiksa gerbangnya

`bun run audit:dokumen` (`scripts/audit-dokumen.mjs`), di job `check` CI — tanpa
build, tanpa jaringan, tanpa `awcms`:

- **Tautan markdown mati**, diselesaikan dari letak berkas yang memuatnya. Itu
  membuat aturan tautan `.changesets/` ikut terjaga tanpa satu pun pengecualian
  khusus. URL eksternal dan anchor sengaja dilewati, dan alasannya ditulis di
  berkasnya — gerbang yang merah karena situs pihak ketiga sedang mati adalah
  gerbang yang orang belajar mengabaikan.
- **Indeks ADR lengkap DUA ARAH.** Tiap ADR tercatat di tabel, tiap baris
  menunjuk berkas yang ada. Satu arah saja tidak cukup: cacat 3 Agustus
  melanggar keduanya sekaligus.
- **Kolom Status setuju dengan `- **Status:**` di berkas ADR-nya.** Tabel yang
  menulis "Diterima" untuk ADR yang sudah `Superseded` dibaca sebagai keputusan
  yang masih berlaku. Status yang tidak dikenal **dilaporkan**, bukan dilewati
  diam-diam.

#### Gerbangnya sendiri dibuktikan dua arah

`tests/audit-dokumen.test.mjs` menjalankan skrip atas pohon fixture sungguhan:
tiap kelas cacat **MERAH** saat cacatnya ada, **HIJAU** saat tidak. Pemeriksa
yang menjawab "bersih" untuk pohon yang cacat mengulang cacat aslinya satu
tingkat lebih tinggi — kali ini dengan tanda centang di sampingnya.

Kasus terakhirnya menjalankan gerbang atas repo ini sendiri, jadi `bun test`
ikut menjaga dokumennya, bukan hanya skripnya.

#### Yang ikut berubah

- `bun run release` menjalankannya **sebelum** changeset dilipat — sesudahnya,
  berkas yang tautannya salah sudah tidak ada untuk diperiksa.
- Definition of Done di `AGENTS.md` menambahkan satu butir: menambah ADR berarti
  menambah barisnya di `docs/adr/README.md`.

### Gerbang permukaan kilau — dokumen yang meminta pemeriksanya sendiri, lalu menyimpang persis seperti yang ia ramalkan

`ui-ux-design-system.md` menyebut daftar permukaan kilau "kontrak, bukan
kumpulan kebetulan", menunjuk penanda di `src/styles/global.css`, dan menutup
paragrafnya dengan pengakuan:

> di `awcms-astro` pemeriksa itu **belum ada**, jadi kesesuaiannya saat ini
> dijaga mata pembaca kode — dan itu berarti ia akan menyimpang

Ia sudah menyimpang. Tabelnya mendaftarkan **`.wilayah-filter-btn`**, tombol
filter wilayah milik repo rujukan yang tidak pernah ada di template ini — tidak
di CSS, tidak di satu komponen pun. Sebuah baris yang menjanjikan permukaan
berkilau pada tombol yang tidak ada tidak akan pernah terlihat salah oleh
siapa pun yang membaca dokumennya saja.

#### Yang mendarat

`bun run audit:dokumen` mendapat gerbang keempat: daftar selector di antara
`kilau:permukaan:mulai`/`:selesai` pada `global.css` dibandingkan **dua arah**
dengan tabel bertanda di dokumen. Permukaan baru yang lupa dicatat memerahkan CI
sama seperti baris tabel yang permukaannya tidak ada.

Tiga keadaan yang sengaja **tidak** lewat diam-diam:

- **Penanda tidak lengkap** — bukan "tidak ada yang dibandingkan", melainkan
  pelanggaran. Penanda yang hilang adalah cara termudah mematikan gerbang ini
  tanpa terlihat.
- **Satu sisi hilang sementara pasangannya ada** — kontrak yang salah satu
  sisinya lenyap bukan kontrak yang terpenuhi.
- **Kedua sisi tidak ada** — situs yang menghapus dokumen design system-nya
  dilewati, dan gerbangnya **mengatakannya**.

Enam kasus tes, tiap arah cacat merah saat cacatnya ada dan hijau saat tidak.

#### Dua koreksi yang ikut

- **`.wilayah-filter-btn` dilepas dari tabel.** Diverifikasi ke kode, bukan ke
  ingatan: string itu tidak muncul di mana pun di `src/`.
- **Seksi Gambar berhenti mengklaim `astro:assets`.** Ia berbunyi "`<Image>`
  dari `astro:assets`, tidak pernah `<img>` mentah" — sementara
  [ADR-0024](docs/adr/0024-seni-lokal-di-src-assets.md) memilih `<img>` di
  atas URL hasil `import.meta.glob`, dan `astro:assets` tidak dipakai satu kali
  pun di repo ini. Sekarang ia menyebut keputusannya beserta konsekuensi yang
  diterima (tanpa `srcset`, raster tidak di-encode ulang) dan apa yang menutup
  celah pemotongan (`object-fit: cover` + gerbang rasio `audit:konten`).

#### Satu hint yang akhirnya bersih

`tests/keluaran-csp.test.mjs` mendestrukturisasi `nama` yang tak pernah dipakai,
sehingga setiap `astro check` — di setiap PR, sejak berkas itu ditulis —
melaporkan satu hint. `bun run check` kini **0 errors, 0 warnings, 0 hints**:
keluaran yang bersih adalah keluaran yang orang masih baca saat baris pertama
muncul di sana.

### Kartu share per artikel — dan tiga klaim yang berhenti berbohong

[ADR-0026](docs/adr/0026-kartu-share-per-artikel-dari-media-awcms.md).

Butir backlog tertua repo ini selalu punya alasan yang sama: template ini tidak
membawa pembangkit kartu. Alasan itu benar untuk kartu yang **dibangkitkan**, dan
tidak pernah benar untuk kartu yang **diunggah** — `awcms` sudah menyimpan tepat
itu di `seoImageMediaId`, override eksplisit yang spesifikasinya sendiri sebut
mengalahkan `featuredMediaId`.

#### Yang berubah untuk pembaca

Tautan artikel yang dibagikan ke WhatsApp, Facebook, atau X kini menampilkan
kartu milik artikel itu, bukan satu kartu situs untuk semuanya. Urutannya
`seoImageMediaId ?? featuredMediaId` — **persis** yang
`seo-facts-port-adapter.ts` di `awcms` selesaikan, karena situs yang kartunya
berbeda dari permukaan SEO CMS-nya sendiri adalah dua jawaban untuk satu
pertanyaan, dan hanya satu yang terlihat editor.

Gambar di badan artikel TIDAK ikut berpindah: yang `awcms` prioritaskan hanya
permukaan pratinjau.

#### Cacat yang sebenarnya ditutup

`BaseLayout` memasang `og:image:type` `image/png` dengan `og:image:width` 1200
dan `og:image:height` 630 untuk gambar **apa pun**, dan `schema.ts` menulis
`ImageObject` dengan konstanta yang sama.

Itu benar untuk `SITE_SOCIAL_IMAGE` — `.env.example` menyatakan kontraknya
kepada siapa pun yang mengisinya. Untuk objek media `awcms` ia salah **tiga
kali sekaligus**: berkasnya WebP 1600×900 pada umumnya. Akibatnya bukan kartu
yang jelek melainkan kartu yang **berbohong kepada mesin** — pengunduh pratinjau
yang memercayai angka itu melebarkan ke kotak yang salah atau menolak kartunya,
dan tidak ada satu pun kegagalan di build. Bentuknya identik dengan cacat yang
melahirkan `social-image.ts`: `og:image` menunjuk berkas 404 dengan build tetap
hijau.

MIME dan ukuran kini mengikuti gambarnya; konstanta kartu situs menjadi
**bawaan**, bukan kebenaran universal.

#### Tiga keadaan, semuanya tetap didukung

| Punya | Yang terbit |
| --- | --- |
| `seoImageMediaId` / `featuredMediaId` | Kartu artikel, dengan MIME dan ukurannya sendiri |
| Hanya `SITE_SOCIAL_IMAGE` | Kartu situs, `image/png` 1200×630 |
| Tidak keduanya | Tanpa tag gambar sama sekali |

Keadaan ketiga yang paling penting dipertahankan: pratinjau tanpa gambar jatuh
ke kartu teks yang rapi; pratinjau dengan gambar rusak tidak jatuh ke mana pun.

#### Nol permintaan tambahan

Kedua id masuk batch media yang sama (ADR-0025) dan dideduplikasi — artikel yang
memakai satu gambar untuk dua permukaan tetap satu id, dan tesnya membuktikan
permintaannya tetap satu.

### `og:image:alt` berhenti memerikan gambar yang lain

Halaman seksi memasang `og:image` **kartu situs** dengan `og:image:alt` yang
memerikan **hero seksinya**. Halaman artikel melakukan hal yang sama dengan alt
hero artikelnya. Dua tag, dua gambar berbeda, satu kartu yang benar-benar
dibagikan.

Yang menanggungnya pembaca dengan pembaca layar di lini masa sosial: mereka
mendengar deskripsi gambar yang **tidak sedang ditampilkan** kepada mereka. Dan
tidak ada satu pun gerbang yang bisa melihatnya — kedua tag ada, keduanya
terisi, dan keduanya masuk akal dibaca sendiri-sendiri.

#### Diperbaiki dengan membuatnya tidak bisa ditulis

`ogImage`, `ogImageAlt`, `ogImageType`, `ogImageWidth`, `ogImageHeight` menjadi
**satu** prop `shareCard` bertipe `KartuShare`. Selama `src` dan `alt` adalah
dua nilai terpisah, keduanya bisa datang dari dua gambar berbeda; digabung, itu
berhenti bisa terjadi.

`BaseLayout` yang jatuh ke kartu situs saat halaman tidak membawa kartunya
sendiri — beserta alt kartu situs, bukan alt gambar lain yang kebetulan ada di
halaman itu. Lima prop menjadi satu, dan satu kelas cacat hilang bersamanya.

#### Yang tidak berubah

Halaman tanpa kartu mana pun tetap tidak memasang tag gambar sama sekali, dan
`twitter:card` tetap turun ke `summary` alih-alih menjanjikan kartu besar yang
tidak ada.

### Koreksi: indeks ADR yang tak pernah benar, dan titik lanjut locale yang berbalik arah

Tiga dokumen berhenti benar, dan [ADR-0021](docs/adr/0021-tahan-pengembangan-menunggu-fondasi-awcms.md)
menyebut kelas ini cacat, bukan pekerjaan baru — jadi ia mendarat selama
penahanan. Tak ada satu baris kode pun yang berubah.

#### Indeks ADR mendaftarkan enam keputusan yang tak pernah ada di sini

[`docs/adr/README.md`](docs/adr/README.md) memuat tabel repo rujukan sejak
hari ia mendarat (commit `52baf90`, bersama ADR-0014/0015). Keenam berkas yang
ditautkannya **tidak pernah ada di repo ini** — `git log --diff-filter=A --
docs/adr/` membuktikannya, tidak ada penghapusan mana pun — sementara sembilan
ADR yang benar-benar mendarat (0014–0022) tak satu pun tercatat.

Satu barisnya membantah kode: "Satu bahasa, tanpa mesin i18n", padahal repo ini
menyajikan dua locale lewat katalog PO. Indeks yang salah lebih buruk daripada
tidak ada indeks — ia dibaca sebagai daftar keputusan yang berlaku.

Tidak ada gerbang yang bisa menangkapnya: `bun run audit:konten` memeriksa
tautan mati pada **keluaran build**, dan markdown tidak ikut dibangun.
Gerbangnya sendiri ditahan ADR-0021 dan dicatat sebagai butir pertama saat
penahanan dicabut.

#### Titik lanjut "filter locale" berbalik arah, bukan sekadar usang

`awcms` [#346](https://github.com/ahliweb/awcms/pull/346) mendarat pada hari
yang sama dengan ADR-0021 dan menutup sisinya: `?locale=` cocok-persis, absen
berarti seluruh locale, kosong dibalas 400.

Yang penting bukan itu, melainkan alasan butirnya yang **salah**: ia menulis
"berlebih untuk situs satu bahasa", padahal template ini menyajikan dua locale
dan memasangkannya lewat `translationGroupId`. Memakai `?locale=id` membuang
setiap baris `en` tanpa satu pun gerbang merah — `assertTranslationsArePairable`
menangkap terjemahan yang tiba tanpa grup, bukan terjemahan yang tidak pernah
ditarik. Hasilnya build hijau yang menerbitkan `/en/**` sebagai bahasa Indonesia
berpenanda "belum diterjemahkan": bentuk kegagalan yang sama persis dengan
ADR-0018 (`view=full` diabaikan → setiap artikel kosong, build hijau).

Butirnya kini menyatakan filter itu hanya bernilai untuk deployment satu-locale,
dan bahwa dua locale berarti dua traversal — bukan satu yang lebih ramping.

#### Indikator pencabutan penahanan: satu dari dua terpenuhi

Kriteria 1 ADR-0021 (setiap modul `awcms` punya layar) **sudah nol** —
diverifikasi dengan `grep -L 'navigation:' src/modules/*/module.ts` di `awcms`,
ke kode dan bukan ke tabel `PROJECT_STATE.md` yang sudah pernah basi tanpa ada
yang merah. Kriteria 2 (§4 "yang belum" habis) **belum**: business-scope
resolver base masih NO-OP, rute konten host-based masih follow-up, dan
`newsletter`/`social-publishing`/pustaka komponen Wave 0/Wave 3 belum diserap.

Penahanan **tetap berlaku** — yang mencabutnya pernyataan pemilik, bukan skor
indikator.

### `awcms-astro` menjadi template repository GitHub — dan dokumennya dibuat benar untuk itu

Setelan repo diubah (`is_template: true`), jadi tombol **"Use this template"**
membuat repo baru berisi seluruh kerangkanya dengan riwayat commit yang bersih —
bukan fork.

Setelan itu bagian termudahnya. Yang penting: **dokumen yang pertama dibaca
orang yang menekan tombol itu ternyata memerikan repo yang lain.**

#### Yang ditemukan di `checklist-repo-baru.md`

Ia dibuka dengan "Salin kerangka: ambil dari repo rujukan …" — cara lama, dan
persis cara repo ini sendiri pernah mewarisi indeks ADR milik repo lain. Lalu ia
menyuruh pembacanya menyiapkan lima hal yang **tidak ada di repo ini**:
`src/content.config.ts`, `src/data/`, `src/content/`, `src/assets/images/`, dan
`docs/workflows/` — semuanya bentuk konten-di-repo yang ADR-0018 gantikan saat
konten pindah ke `awcms`. Satu butir lagi menyuruh "isi peta
`src/lib/article-images.ts`", peta yang ADR-0024 ganti dengan konvensi nama.

§1 kini menyebut tombolnya, lalu mendaftarkan yang **harus dikosongkan sebelum
commit pertama** karena isinya riwayat template dan bukan riwayat situs
pembacanya: `.changesets/`, `CHANGELOG.md`, `docs/adr/`, identitas
`package.json`, dan `graphify-out/`.

#### Dua dokumen standar yang membantah kode

- `standar-teknis.md` menulis "Kontrak frontmatter ada di `src/content.config.ts`
  dan merupakan **satu-satunya acuan**", dan mendaftarkan `astro:assets` sebagai
  penanganan gambar. Keduanya bertentangan dengan repo ini — dan yang kedua
  bertentangan dengan ADR-0024 yang mendarat hari ini juga.
- `docs/awcms-astro/README.md` menyebut kontrak repo ini "frontmatter
  (`content.config.ts`)" padahal kontraknya `LocalizedArticle` di
  `src/lib/content.ts`, dijaga `tests/kontrak-awcms.test.mjs`.

Keduanya dikoreksi dengan menyebut standar keluarga **dan** simpangan repo ini,
bukan dengan menghapus standarnya — skema itu tetap yang harus dipenuhi sisi
`awcms` supaya situs seperti ini punya jaminan yang sama.

#### Gerbang kelima: jalur yang disebut dokumen harus ada

Empat cacat dari kelas yang sama ditemukan dalam satu hari, jadi kelasnya
digerbangi. `bun run audit:dokumen` kini memeriksa **span kode** — bukan tautan —
yang berbentuk jalur repo: 144 span, 8 pengecualian ber-alasan.

Daftar pengecualian itu yang membedakan gerbang dari gangguan: dokumen di sini
membandingkan diri dengan `awcms` dan repo rujukan, dan perbandingan itu justru
isinya. Tiap baris pengecualian **wajib menyebut milik siapa jalur itu**;
"belum dibuat" bukan alasan, karena itu justru yang gerbang ini cari.

Pengecualian yang membusuk — tidak lagi disebut dokumen mana pun — menutupi
jalur yang kelak benar-benar hilang, jadi ia ikut dijaga. Tetapi di tesnya,
bukan di skripnya: daftarnya milik repo ini, sementara gerbangnya harus tetap
benar saat dijalankan atas pohon fixture maupun atas situs turunan yang
dokumennya lain sama sekali.

### Ilustrasi lokal: taruh berkas di `src/assets/`, tidak ada langkah kedua

[ADR-0024](docs/adr/0024-seni-lokal-di-src-assets.md). Butir pertama
§Titik lanjut ADR-0021 punya dua sumber seni; yang **tidak** menyentuh `awcms`
kini bekerja.

#### Yang berubah untuk pembaca situs

Sampai sekarang `getArticleImage` mengembalikan `src: undefined` tanpa syarat,
dan ketiga pemanggilnya bahkan tidak membacanya — mereka merender
`.visual-placeholder` apa pun isinya. Sebuah situs yang menaruh ilustrasi di
`src/assets/` tidak akan melihatnya terbit.

Sekarang: berkas di `src/assets/`, konvensi nama relatif tanpa ekstensi —
`hero`, `tab/<tab>`, `artikel/<tab>/<slug>`. Tidak ada registry yang harus ikut
disunting; ekstensi apa pun dari `EKSTENSI_SENI` berlaku, jadi mengganti `.svg`
menjadi `.webp` tidak menyentuh satu baris kode pun.

Berkas yang tidak ada tetap merender placeholder bergaya. Itu keadaan yang
**didukung**, bukan kegagalan — dan template ini tetap membawa nol ilustrasi.

#### Tiga keputusan yang perlu disebut

- **`query: "?url"`, bukan `astro:assets`.** Yang terakhir mengembalikan
  `ImageMetadata` alih-alih string — bentuk `ArticleVisual` dan keempat bingkai
  ikut berubah — dan memperlakukan SVG berbeda dari raster, padahal SVG justru
  format yang gerbang repo ini ditulis untuk membaca. Pemotongan tidak hilang
  tanpanya: bingkai memotong di CSS dan `audit:konten` menolak sumber yang bukan
  16∶9 lebih dulu.
- **Tanpa fallback dari artikel ke seni seksinya.** Fallback membuat seluruh
  artikel satu seksi memakai gambar yang sama sambil tampak seperti gambar yang
  dipilih untuknya.
- **Dua berkas bernama sama dengan ekstensi berbeda menggagalkan build.**
  Memilih salah satunya diam-diam berarti menerbitkan seni yang bukan suntingan
  terakhir penulisnya, dan itu tidak terlihat selain dengan membuka setiap
  halaman.

#### Yang ikut hidup karenanya

- **Gerbang rasio berhenti kosong.** Ia melaporkan "src/assets/ belum ada —
  dilewati" di setiap run sejak ditulis. Diverifikasi dua arah saat mendarat:
  sumber 16∶9 lolos, sumber 1∶1 memerahkan `audit:konten` sambil menyebut
  pemotongannya.
- **Empat bingkai CSS berhenti menjadi aturan yang tak pernah dipakai.**
  `.feature-hero-img img`, `.card-img-wrapper img`, `.hero-visual-frame img`,
  `.article-hero-frame img` semuanya sudah benar dan tak satu pun pernah diuji
  terhadap `<img>` sungguhan.
- **`alt` seksi kini datang dari katalog PO**, bukan dari slug yang
  dimanusiawikan. Sebelumnya pembaca dengan screen reader mendengar nama seksi
  versi URL — di locale berprefiks, bahkan bukan bahasa yang sedang dibacanya.

#### Media `awcms` TETAP ditahan

Sumber kedua — `featuredMediaId` lewat `GET /api/v1/media/objects` — tidak ikut.
Endpointnya ada, tetapi kode yang memanggilnya bentuknya ditentukan respons
`awcms` dan repo template ini tidak punya instans untuk membuktikan panggilannya
benar. Itu persis batas yang
[ADR-0023](docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)
nyatakan: "endpoint-nya sudah ada" bukan jawaban "tidak".

### Advisory `fast-uri` ditutup lewat override

`bun audit --audit-level=low` mulai merah di **setiap** PR, dan bukan karena PR
itu: advisory [GHSA-7p8r-x3mc-p8w7](https://github.com/advisories/GHSA-7p8r-x3mc-p8w7)
(high — host confusion lewat backslash sebagai pengenal authority) terbit untuk
`fast-uri >=3.0.0 <3.1.5`, dan `main` sama merahnya.

Ia transitif enam tingkat, seluruhnya di bawah satu devDependency:

```
@astrojs/check › @astrojs/language-server › volar-service-yaml
  › yaml-language-server › ajv-i18n › ajv › fast-uri
```

Tidak ada satu pun paket di rantai itu yang bisa dinaikkan untuk menutupnya —
`bun update` tidak menyentuhnya karena tiap tingkat sudah pada versi terbarunya.
Jadi `overrides` yang dipakai, dan **`^3.1.5`, bukan `>=3.1.5`**: yang terakhir
menarik `fast-uri@4.1.2` — lompatan mayor pada pustaka parsing URI, ditukar
untuk masalah yang sudah selesai di `3.1.5`. Advisory menuntut `>=3.1.5`;
override menuntut persis itu dan tidak lebih.

Lockfile diregenerasi penuh (`rm -rf node_modules bun.lock && bun install`)
sesuai aturan repo, bukan disunting sebagian.

### Empat aturan yang sudah tertulis akhirnya punya pemeriksa

Repo ini punya aturan yang mengikat: **aturan baru wajib membawa pemeriksanya.**
Pembacaan menyeluruh menemukan empat aturan yang sudah tertulis — sebagian sejak
berbulan-bulan — dan tidak satu pun punya pemeriksa.

Bentuknya berbeda dari sebelas cacat dokumen yang repo ini sudah catat, dan lebih
sunyi: bukan dokumen yang menyatakan sesuatu yang tidak ada, melainkan **aturan
yang benar dan tidak pernah diperiksa siapa pun.** Ketiganya yang pertama bahkan
ditulis dengan kata **wajib** — dan ketegasan itulah yang membuat semua orang
mengira ada yang memeriksanya.

#### 1. Versi Bun: lima nilai, nol gerbang

`AGENTS.md` menyebutnya aturan yang tidak bisa dilanggar, lengkap dengan kata
"diam-diam". Kalimat itu menghitung **berkas**; yang harus sepakat adalah
**nilai**, dan nilainya muncul lima kali — `packageManager`, `engines.bun`, dua
`bun-version` CI, dan dua tag `Dockerfile`. Duplikat kedua di masing-masing
berkas yang paling mungkin tertinggal: letaknya jauh dari yang pertama, dan
keduanya tetap hijau sendirian.

`grep -rln "packageManager\|bun-version" tests/ scripts/` mengembalikan nol baris.

#### 2. Perilis melewatkan dua gerbang yang empat dokumen tuntut

`AGENTS.md`, `CONTRIBUTING.md`, templat PR, dan checklist repo baru semuanya
menuntut `bun test` hijau dan `bun audit` nol sebelum rilis.
`scripts/rilis.mjs` — skrip yang benar-benar merilis — tidak menjalankan
keduanya.

Yang hilang bukan sekadar dua perintah. Dua lapis `bun test` **melewati dirinya
tanpa `dist/`**, jadi satu-satunya tempat keduanya bisa benar-benar berjalan
adalah sesudah build — persis titik yang dilewati perilis.

#### 3. Dua repo, dua angka, dan yang satu menyusun rencana di atas angka yang lain

Penilaian `ahliweb/awcms` hari ini mencatat repo ini memanggil **enam**
permukaannya, lalu merekomendasikan snapshot kontrak konsumen atas keenamnya.
Repo ini memanggil **tiga**: `/blog/posts/{id}` dihapus ADR-0018,
`/auth/session` milik BFF yang belum ada, dan `/access/machine-credentials`
adalah cara MANUSIA menerbitkan token.

Selisihnya bukan sekadar angka. Kontrak yang membekukan tiga permukaan yang
tidak dikonsumsi mengikat repo sana pada bentuk yang repo sini tidak pernah
butuh, sambil membuat "kontraknya terjaga" terasa lebih lengkap daripada
kenyataannya. Daftar di sisi sini kini **diekstrak dari kode** dan dibandingkan
dua arah dengan tabel bertanda di skill integrasi — jadi ia bisa dipercaya
sebagai sumber, dan permukaan keempat tidak bisa mendarat diam-diam.

#### 4. Celah 6 ADR-0028 — dan kelas cacat yang justru DITAMBAHKAN penutupannya

Empat action dipin ke SHA commit dengan komentar `# vX.Y.Z` yang Dependabot
baca; image dasar dipin ke digest dengan tag dipertahankan di depannya.

Yang perlu diketahui sebelum menyentuhnya: **saat tag dan digest sama-sama ada,
digest yang dipatuhi Docker dan tag hanya menjadi komentar.** Menaikkan tag tanpa
digest menghasilkan `Dockerfile` yang berbunyi `1.3.15` sambil membangun
`1.3.14`, tanpa satu pun kegagalan. Pin digest karena itu **menambah** satu kelas
cacat diam yang hanya gerbang nomor 1 tutup — keduanya satu paket, dan
gerbangnya memeriksanya secara khusus.

#### Cara gerbangnya dibuktikan

Kelima asersi baru **mutation-proven**. Yang paling berarti: menaikkan tag tanpa
digest terbukti merah, dan menambahkan permukaan keempat ke kode terbukti merah
di dua tempat sekaligus.

Gerbang dokumen juga menangkap pelanggaran **penulis changeset ini** — empat
kalimat menyebut berkas milik `awcms` tanpa mendaftarkannya sebagai pengecualian
ber-alasan. Itu bekerja persis sebagaimana mestinya.

#### Selaras dengan penilaian `awcms` hari ini

Daftar standar di `standar-performa-dan-keamanan.md` menyerap dua yang dipakai
`awcms` dan belum ada di sini — **ISO/IEC 25010** dan **RFC 5861** — serta
mencatat **OWASP API Security Top 10 2023** sebagai *tidak berlaku* beserta
alasannya. Baris "tidak berlaku, dan ini alasannya" yang membuat dua matriks
keluarga bisa dijumlahkan.

RFC 5861 (`stale-while-revalidate`) sengaja **tidak** dipakai: ia bernilai bagi
cache bersama, dan situs ini disajikan satu proses Bun tanpa cache bersama.

#### Yang TIDAK dilakukan, dan kenapa rekomendasi sebelumnya dibatalkan

`graphify-out/` **tetap dilacak.** Rekomendasi sebelumnya di sesi yang sama
adalah meng-`gitignore`-nya karena hook menulisinya pada setiap perpindahan
branch. Membaca `.gitignore` membatalkannya: berkas itu sudah memuat tiga aturan
graphify ber-alasan yang sengaja menyisakan keluaran bersama tetap terlacak
sementara intermediate, snapshot bertanggal, dan `graph.html` dibuang. Itu
keputusan yang sudah dipertimbangkan; churn-nya gesekan, bukan cacat.

Celah 7 (analisis statik) tetap terbuka, dengan alasan yang **lebih tajam**
daripada sebelumnya: CodeQL tidak mengurai `.astro`, jadi menyalakannya lalu
menyebut repo ini "dianalisis statik" adalah upacara yang terlihat seperti
cakupan. Celah 8 dan 9 tidak berubah.

### Graf pengetahuan yang salah menamai 60 dari 101 komunitasnya, dan gerbang yang akhirnya membacanya

`graphify-out/` dilacak repo ini. Ia bukan artefak build melainkan **peta** —
yang dibaca orang dan agen yang baru masuk. Sampai hari ini tidak ada satu pun
gerbang yang pernah membukanya.

Yang ditemukan saat pertama kali dibaca: **60 dari 101 label komunitas menempel
pada komunitas yang salah.**

- Komunitas 6 bernama `content-blocks.ts`; isinya seluruhnya dari
  [`standar-performa-dan-keamanan.md`](docs/awcms-astro/standar-performa-dan-keamanan.md).
- Komunitas 22 bernama `Kontrak BFF /_portal-api/**`; pusatnya `Pedoman Perilaku`.
- Tiga komunitas berbeda sama-sama bernama `BaseLayout.astro`.
- 22 dari 87 label yang tampil di laporan adalah nama berkas mentah.

Cacatnya tidak terlihat karena tidak ada yang bisa melihatnya: artefaknya JSON
yang sah, laporannya rapi, dan kelima gerbang lain hijau — karena tidak satu pun
dari mereka membaca `graphify-out/`. Nama komunitas bukan hiasan; itu yang
dibaca `graphify query` dan siapa pun yang memakai graf ini untuk mencari jalan.
Graf yang salah menamai dirinya sendiri lebih berbahaya daripada tidak ada graf,
karena ia menjawab dengan percaya diri.

#### Kenapa label bisa berpindah tanpa ada yang tahu

graphify menamai komunitas otomatis dari **node paling terhubung** di dalamnya.
Penamaan itu deterministik, gratis, dan tidak pernah membaca komunitasnya — ia
menyalin nama berkas terbesar.

Pustakanya punya penjaga untuk ini: sebuah sidecar berisi tanda tangan
keanggotaan tiap komunitas, supaya run berikutnya bisa tahu komunitas mana yang
benar-benar berubah. **Langkah pelabelan tidak pernah menulisnya.** Tanpa
sidecar itu graphify jatuh ke membandingkan *jumlah* komunitas — dan ketika
korpus tumbuh dari 90 ke 101 komunitas, seluruh label dipindahkan ke komunitas
yang berbeda sekaligus.

Penyebabnya ditutup di hulu, di skill graphify itu sendiri: langkah pelabelan
kini menulis sidecar tanda tangan, menolak label yang kembar atau tidak lengkap
sebelum apa pun ditulis, dan menulis ulang `graph.json` dengan label final —
sebelumnya `graph.json` dan `GRAPH_REPORT.md` bisa menyebut nama yang berbeda
untuk komunitas yang sama, dan `graph.json` adalah yang dibaca konsumen.

#### `.changesets/` keluar dari korpus

18% graf adalah prosa rilis: **171 dari 971 node**, dengan 139 edge yang menunjuk
sesama changeset dan hanya 39 yang menyeberang. Banyak node, hampir tanpa
jembatan — gumpalan terpisah yang menaikkan jumlah komunitas, menurunkan
kohesinya, dan mengubur komunitas yang berarti.

Ia juga **menceritakan ulang** dokumen yang dirangkumnya, sehingga isi yang sama
masuk graf dua kali dengan kata berbeda. Itu terlihat langsung sebagai konsep
kunci kembar di laporan: "Deploy dan rebuild lewat webhook (Coolify)", "ADR-0014
— Rendering campuran dan BFF portal Jualanku", dan "Postur performa dan keamanan
punya nama, dan celahnya punya nomor" masing-masing muncul dua kali.

`.graphifyignore` baru mengeluarkannya. Yang hilang: tidak ada — rasional setiap
keputusan tinggal di `docs/adr/`, dan itu tetap diindeks.

Hasil bangun ulang: **971 → 768 node, 101 → 57 komunitas**, dan setiap satunya
bernama bahasa manusia yang dipilih, bukan diwarisi.

#### Gerbang kelima: `bun run audit:graf`

ADR-0030 melarang aturan tertulis tanpa pemeriksa. Tiga aturan graphify
ber-alasan sudah hidup di `.gitignore` sejak 3 Agustus tanpa satu pun. Sekarang
mereka punya, bersama aturan penamaan yang baru:

1. **Hanya empat artefak bersama yang terlacak** — `graph.json`,
   `GRAPH_REPORT.md`, `manifest.json`, `cost.json`. Cache, berkas ber-titik,
   salinan bertanggal, dan `graph.html` masing-masing punya alasan tertulis
   untuk tinggal di luar riwayat, dan sekarang punya penegaknya.
2. **Laporan dan graf berasal dari run yang sama** — jumlah node, edge, dan
   komunitas harus sepakat. Bila tidak, salah satunya basi dan pembaca tidak
   punya cara tahu yang mana.
3. **Setiap komunitas punya nama yang dipilih** — bukan nama berkas, bukan
   placeholder, tidak kembar, dan sama di `graph.json` maupun `GRAPH_REPORT.md`.
4. **Yang dikecualikan tetap dikecualikan** — rebuild yang lupa `.graphifyignore`
   ketahuan.

Kesegaran **dilaporkan, tidak memerahkan gerbang**: memerahkannya berarti tiap
PR yang menyentuh berkas terindeks wajib membawa rebuild bermegabyte, dan
gerbang semahal itu akan dilonggarkan dalam sebulan — persis yang §Gerbang mutu
larang.

`tests/audit-graf.test.mjs` membuktikan tiap gerbang **dua arah** — merah saat
cacatnya ada, hijau saat tidak — atas pohon fixture sungguhan, termasuk repo git
sungguhan untuk gerbang yang memang bertanya kepada git. Kasus terakhirnya
menjalankan gerbang atas repo ini sendiri.

#### Berkas yang berubah

- **Baru:** `.graphifyignore`, `scripts/audit-graf.mjs`, `tests/audit-graf.test.mjs`
- **Standar:** `docs/awcms-astro/standar-teknis.md` — §Graf pengetahuan baru, dan
  baris gerbang kelima di §Gerbang mutu
- **Rantai gerbang:** `package.json`, `.github/workflows/ci.yml`,
  `scripts/rilis.mjs`
- **Dokumen yang akan berbohong bila tidak ikut:** `AGENTS.md`,
  `CONTRIBUTING.md`, `README.md`, `.github/PULL_REQUEST_TEMPLATE.md`,
  `docs/awcms-astro/README.md` ("empat perintah" → lima),
  `docs/awcms-astro/checklist-repo-baru.md`,
  `.claude/skills/awcms-astro-gerbang/SKILL.md`
- **Indeks:** `graphify-out/` dibangun ulang

Situs turunan yang menghapus `graphify-out/` mendapat gerbang yang **melewati
dirinya dan mengatakannya** — keadaan sah, bukan kelalaian.

### Postur performa dan keamanan punya nama, dan celahnya punya nomor

Repo ini sudah punya CSP ketat yang benar-benar dikirim, lima header keamanan
yang dibuktikan tes, larangan HTML mentah yang ditegakkan renderer, dan empat
gerbang di CI. Yang tidak ada adalah **nama luar** bagi semua itu — dan
ketiadaan nama membuat dua hal mustahil: menjawab pertanyaan kepatuhan, dan
melihat apa yang belum ada.

[`docs/awcms-astro/standar-performa-dan-keamanan.md`](docs/awcms-astro/standar-performa-dan-keamanan.md)
sekarang memetakan tiap kontrol ke standar yang menamainya — OWASP Top 10 2021,
ASVS 4.0.3, Secure Headers Project, ISO/IEC 27001:2022 Annex A, NIST SSDF
SP 800-218, Core Web Vitals, RFC 9111 — dengan edisi OWASP **disamakan dengan
`awcms`**, karena dua repo keluarga pada dua edisi berbeda menghasilkan dua
matriks yang tidak bisa dijumlahkan.
[ADR-0028](docs/adr/0028-jangkar-standar-performa-dan-keamanan.md) mencatat
keputusannya, dan `awcms-astro-performa-keamanan` menjadikannya prosedur.

#### Satu selisih nyata dari `awcms` yang ditemukan justru oleh pemetaan itu

Empat berkas menyatakan penyaji mengirim "lima header keamanan … disamakan
dengan postur `awcms`". Kelimanya memang identik **nilainya**. Jumlahnya tidak:
`awcms` mengirim enam di produksi, dan yang keenam `Strict-Transport-Security`.

Alasan yang selama ini terbaca masuk akal — "TLS diterminasi Traefik" — tidak
bertahan diperiksa. Traefik tidak memasang HSTS tanpa middleware yang
dinyatakan, jadi yang terjadi bukan "dipasang di tempat lain" melainkan **tidak
dipasang di mana pun**. Ia sekarang celah bernomor 1 dari sembilan, masing-masing
dengan pemeriksa yang harus ikut mendarat saat ia ditutup.

Selisih ini tidak ditemukan oleh review kode. Ia ditemukan saat kedua postur
diletakkan berdampingan di satu tabel — yang sebelum ini tidak ada.

#### Enam dokumen yang menyatakan sesuatu yang tidak ada

Repo ini sudah mencatat lima; pembacaan hari ini menemukan enam lagi, dan
kelimanya punya bentuk yang sama — kalimat yang **benar saat ditulis**, lalu
sebuah ADR mengubah kodenya, lalu kalimatnya tidak ikut:

- `AGENTS.md`, `README.md`, dan `CONTRIBUTING.md` masih menyatakan pengembangan
  **DITAHAN**, tiga jam setelah ADR-0027 mengakhirinya. Yang menggantikannya
  bukan "bebas": uji ADR-0023 tetap berlaku, dengan premis baru yang tidak akan
  kedaluwarsa.
- `integrasi-awcms.md` berbunyi "Adapter belum ada" sementara 120 baris di
  bawahnya berbunyi "perpindahan itu sudah terjadi". Yang salah adalah yang
  dibaca lebih dulu.
- `standar-teknis.md` mewajibkan `<Image>` dari `astro:assets` dan melarang
  `<img>` mentah — dibantah ADR-0024 **dan oleh tabel di berkas yang sama**.
- `standar-teknis.md` mewajibkan kartu share PNG dan melarang WebP — dibantah
  ADR-0026, yang membuat kartu artikel membawa MIME-nya sendiri.
- `standar-teknis.md` dan `ui-ux-design-system.md` menyebut tema dipasang skrip
  **inline** sebelum paint. Sejak ADR-0019 skrip inline justru mati di browser
  pembaca; yang benar `public/tema.js`.
- `standar-teknis.md` mewajibkan tiga dokumen yang repo rujukan standar itu —
  repo ini sendiri — tidak membawa satu pun. Ketiganya kini ditandai opsional
  beserta **siapa yang memikul perannya di sini**, bukan dihapus.

Dan satu yang sudah digerbangi tetapi lolos lewat bentuk lain:
`.wilayah-filter-btn` dihapus dari tabel bertanda pada 3 Agustus, sementara
salinannya di paragraf tiga puluh baris di atas tabel itu bertahan sampai
sekarang. **Gerbang membaca struktur; prosa lolos seluruhnya** — itu kini ditulis
sebagai batas gerbangnya, bukan dibiarkan tampak lebih luas.

#### Skill

Keempatnya diselaraskan, dan yang keempat baru. `awcms-astro-integrasi` berhenti
menyebut "lima permukaan yang dipakai": tiga yang benar-benar dipanggil,
`GET /api/v1/blog/posts/{id}` **dihapus ADR-0018** karena ia N+1 per build, dan
`GET /api/v1/auth/session` milik BFF yang belum ada. Ia juga membawa tabel
keputusan `awcms` yang mengubah apa yang benar di sini — termasuk ADR-0059,
ADR-0061, dan ADR-0062 yang mendarat di sana tanpa satu pun berkas di sini
menyebutnya.

#### Nol perubahan perilaku

Tidak satu header pun ditambahkan, tidak satu gerbang pun dilonggarkan, tidak
satu dependency pun ditambahkan. Sembilan celah tetap terbuka dan **terbaca
terbuka** — menutupnya diam-diam bersama ADR yang menamainya akan membuat
pekerjaan ini tidak bisa dibedakan dari pekerjaan yang mengklaim lebih dari yang
dilakukannya.

Satu berkas non-dokumen ikut berubah: alasan sebuah pengecualian di
`scripts/audit-dokumen.mjs` diperlebar, karena `docs/PROJECT_STATE.md` kini
disebut dalam dua arti dan gerbang itu menuntut alasannya menyebut milik siapa.

### Penahanan ADR-0021 selesai, dan template mendapat skill-nya sendiri

#### Kedua indikator ADR-0021 terpenuhi

ADR-0021 menahan pengembangan repo ini "sampai fondasi `awcms` selesai" dengan
dua indikator, dan menuliskan risikonya sendiri: *"kalau keduanya sudah nol dan
penahanan masih berlaku, itu pertanyaan yang layak diajukan."*

Keduanya nol. Indikator pertama terpenuhi 3 Agustus; yang kedua 4 Agustus lewat
`awcms` ADR-0059 (rute konten host-resolved `/news/**`) dan ADR-0060 (penyedia
business-scope resolver, yang sebelumnya NO-OP fail-closed).

Yang menutupnya bukan pembacaan dari sini: `awcms` menganalisis kesiapan repo ini
**ke kode**, menemukan bahwa repo ini hanya menyentuh lima permukaan dan
kelimanya lengkap, menutup satu-satunya gap nyata (`GET /api/v1/media/public-origin`),
lalu menulis **"Yang tersisa DAN milik repo ini: nol."**

[ADR-0027](docs/adr/0027-penahanan-adr-0021-selesai.md) mencatatnya dan
men-supersede ADR-0021. **Uji ADR-0023 tidak ikut dicabut** — ia tidak pernah
tentang kesiapan `awcms`, melainkan tentang apakah repo template ini bisa
MEMBUKTIKAN sebuah panggilan benar. Ia tetap tidak punya instans.

#### Dokumen yang disinkronkan dengan backend

- **ADR-0021 §Kapan dicabut** — catatan "BELUM, per 3 Agustus" dikoreksi; dua
  dari tiga butirnya ditutup dan yang ketiga (`newsletter`,
  `social-publishing`, `src/components/ui/`) ternyata tidak pernah memblokir
  repo ini.
- **Backlog BFF portal** — fondasinya kini lengkap di `awcms`. Yang menahannya
  bukan lagi kontrak yang hilang melainkan uji ADR-0023, plus satu ADR admission
  di sisi sana untuk bentuk scope merchant Jualanku.
- **`04-kesiapan.md`** — butir 3 (kontrak sesi) ditandai selesai, dan tabelnya
  diberi konteks supaya tidak terbaca sebagai "tinggal butir 4–7".

#### Template mendapat skill

Repo ini menyuruh setiap situs turunannya mengisi `.claude/skills/` sementara ia
sendiri tidak punya satu pun — kelas cacat yang sama dengan lima yang sudah
ditemukan minggu ini. Tiga skill mendarat, ditulis untuk template dan karena itu
tetap benar di situs turunan mana pun:

| Skill | Isi |
| --- | --- |
| `awcms-astro-integrasi` | Lima permukaan `awcms`, penolakan yang wajib ditiru tiruan tes, gambar/kartu share, `img-src` yang ditanyakan |
| `awcms-astro-gerbang` | Empat gerbang, apa yang TIDAK ditangkap, dan aturan "aturan baru wajib membawa pemeriksanya" |
| `awcms-astro-situs-baru` | "Use this template" → situs: yang dikosongkan, urutan kontrak→konten→tampilan, jebakan |

**Tiga, bukan lima puluh.** `awcms` punya 54 skill karena ia punya 21 modul
domain; repo ini punya satu tanggung jawab. Skill yang memerikan sesuatu yang
tidak ada di sini lebih berbahaya daripada skill yang tidak ada.

Ketiganya tunduk pada gerbang yang sama dengan dokumen lain: `.claude/` tidak
dikecualikan `audit:dokumen`, jadi 16 jalur berkas yang mereka sebut diperiksa
benar-benar ada.

### Lima dari sembilan celah ADR-0028 ditutup, masing-masing bersama pemeriksanya

[ADR-0028](docs/adr/0028-jangkar-standar-performa-dan-keamanan.md) mencatat
sembilan celah dan sengaja tidak menutup satu pun — menutupnya diam-diam bersama
ADR yang menamainya akan membuat pekerjaan itu tidak bisa dibedakan dari
pekerjaan yang mengklaim lebih dari yang dilakukannya. Ini penutupannya, dan
tiap satunya membawa gerbang yang membuktikannya.

#### Celah 1 — `Strict-Transport-Security`, digerbangi produksi

[ADR-0029](docs/adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md).
Permintaan **pertama** seorang pembaca — `contoh.go.id` diketik tanpa skema —
berhenti bisa dibajak setelah kunjungan pertamanya.

Dua keputusan di dalamnya yang tidak terbaca dari diff-nya:

**Gerbang produksinya bukan kerapian.** HSTS tidak bisa dibatalkan dari sisi
situs, dan ia berlaku untuk HOST — bukan untuk situs. `bun run serve`
menjalankan berkas yang sama dengan produksi, jadi sekali ia mengirim HSTS di
`localhost`, **setiap proyek lain** yang dikembangkan pemilik mesin di
`http://localhost:<port>` ikut terkunci selama setahun, tanpa cara mencabutnya
selain menyunting internal browser. Asersi yang menjaganya karena itu terbalik
arah: yang diuji adalah HSTS **TIDAK** dikirim di luar produksi.

**`includeSubDomains` sengaja tidak ikut, berbeda dari `awcms`.** `awcms` satu
deployment yang operatornya tahu persis subdomainnya. Template ini berjalan di
domain milik organisasi yang hampir pasti punya layanan lain di subdomain lain,
dan direktif itu memaksa semuanya HTTPS-saja selama setahun — yang menanggung
akibatnya layanan lain, yang pemiliknya tidak ikut memutuskan.

#### Celah 5 — `Server` dan `X-Powered-By`

Dihapus `pasangHeader`, bukan sekadar diasersi: **"tidak dikirim hari ini" dan
"tidak akan dikirim" adalah dua hal berbeda**, dan sebuah middleware yang
ditambahkan kelak bisa memasangnya tanpa siapa pun memutuskannya.

#### Celah 4 — batas waktu `awcmsGet`

`AbortSignal.timeout`, bawaan 30 detik, diubah lewat `AWCMS_API_TIMEOUT_MS`.

Ia **tidak** bertabrakan dengan aturan "tanpa retry", dan bedanya perlu
dipegang: tanpa-retry memutuskan apa yang terjadi saat `awcms` menjawab buruk;
batas waktu memutuskan apa yang terjadi saat ia **tidak pernah menjawab sama
sekali** — bentuk kegagalan paling umum dari basis data yang kehabisan koneksi.
`fetch` tidak punya batas waktu bawaan, jadi sebelum ini build menggantung
sampai batas job CI membunuhnya, dengan pesan yang menyebut nama job alih-alih
`awcms`.

Batasnya longgar dan itu disengaja: `view=full` membawa `contentJson` utuh, dan
menyetelnya ke nilai "jalur permintaan sehat" mengubah build lambat menjadi
build gagal. Nilai yang cacat **ditolak**, termasuk `0` — yang terlihat seperti
"tanpa batas" dan justru mengembalikan gantungan yang gerbang ini cegah.

#### Celah 2 — `fetchpriority="high"`

`standar-teknis.md` mewajibkannya sejak dokumen itu ditulis; `Ilustrasi.astro`
hanya memasang `loading="eager"`. Aturan tertulis berbulan-bulan tanpa
pemeriksa, lalu dilanggar tanpa satu pun yang merah.

Keduanya dibutuhkan dan tidak saling menggantikan: `eager` hanya berarti "jangan
tunda", sementara prioritas bawaan sebuah `<img>` tetap **Low** sampai layout
membuktikan ia di viewport — jadi elemen LCP mengantre di belakang setiap gambar
lain yang ditemukan lebih dulu, dan halamannya tetap terbit dengan benar. Yang
berubah hanya angka yang tidak dilihat siapa pun di dalam build.

#### Celah 3 — anggaran gambar, diukur untuk pertama kalinya

250 KB beranda / 100 KB halaman konten sudah tertulis sejak dibawa dari repo
rujukan dan **tidak pernah diukur satu kali pun**. Datanya selama ini sudah ada
di tangan `audit:konten`.

Yang ditimbang hanya gambar yang benar-benar **diterbitkan build ini** — media
`awcms` tidak ada di `dist/client`, jadi gerbang ini menjaga seni lokal dan
bukan seluruh berat halaman. Batas itu disebut di skripnya alih-alih dibiarkan
tampak lebih luas.

#### Cara gerbangnya dibuktikan

Kelima asersi baru pada `bun test` **mutation-proven**: tiap satunya dijalankan
dengan kontrolnya dicabut dan terbukti MERAH, lalu hijau lagi setelah dipulihkan.
Yang paling meyakinkan: melepas `AbortSignal.timeout` membuat tesnya
**menggantung sampai batas waktu**, persis cacat yang ia tutup.

Dua gerbang keluaran baru butuh `dist/client`, jadi keduanya dibuktikan atas
pohon fixture sungguhan — merah saat cacatnya ada, hijau saat tidak, dengan
beranda 150 KB LOLOS dan halaman konten 150 KB DITOLAK, membuktikan kedua
anggaran benar-benar dibedakan.

#### Empat celah TETAP terbuka, dengan sadar

Pin action/image ke SHA (6), analisis statik (7), pengukuran Core Web Vitals (8),
dan SBOM rilis (9). Tiga di antaranya menyentuh rantai pasok dan menuntut
keputusan tooling yang lebih baik diambil sekali untuk kedua repo keluarga.
Celah 8 butuh Chrome di CI dan hanya berjalan pada situs yang punya sumber
konten — ia **tidak bisa dibuktikan di repo template ini**, dan gerbang yang
tidak bisa dibuktikan di tempat ia ditulis adalah gerbang yang akan membusuk.

Baris yang **tertutup** tetap di tabel dokumen standar. Dihapus, celahnya akan
diusulkan lagi sebagai temuan baru enam bulan kemudian, dan pemeriksanya akan
dilonggarkan oleh orang yang tidak tahu kenapa ia ada.

#### Variabel env baru

`AWCMS_API_TIMEOUT_MS` — opsional, terdokumentasi di `.env.example` beserta
konsekuensi salah isi, termasuk kenapa `0` ditolak.

### Dua celah terakhir ADR-0028 ditutup — kesembilannya kini punya pemeriksa

Celah 7 (analisis statik) dan 8 (Core Web Vitals) ditutup
[ADR-0032](docs/adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md),
persis dalam bentuk yang tabel celahnya sendiri resepkan — masing-masing
dengan syarat kejujuran yang dijaga tes:

- **CodeQL terjadwal** atas permukaan JS/TS, action dipin SHA. Langkah
  `Nyatakan cakupan` menulis ke ringkasan run berapa berkas dianalisis dan
  berapa `.astro` TIDAK — dihitung `find` saat run, bukan ditulis tangan.
  `tests/analisis-statik.test.mjs` menjaga langkah itu (dan pin-nya) tidak
  hilang diam-diam.
- **Lighthouse CI di job `build`**, terkondisi sumber konten seperti gerbang
  keluaran lain: di template tidak berjalan, di setiap SITUS berjalan pada
  tiap PR. LCP ≤ 2500 ms dan CLS ≤ 0,1 level `error`; INP tidak terukur di
  lab, jadi TBT ≤ 200 ms dipakai sebagai proksi dan disebut proksi.
  `tests/cwv-lab.test.mjs` memaku ambang `lighthouserc.json` ke angka dokumen
  standar — melonggarkannya menuntut mengubah tes, yang terlihat di review.
- Review adversarial pra-merge (19 agen) menemukan bawaan lhci diam-diam
  berhenti di **5 URL terdangkal** — tidak satu pun halaman artikel berlokal
  (kedalaman 3) akan pernah diukur. Batas cakupan karena itu DIPILIH dan
  diasersi: kedalaman 4, 10 URL sampel, 404 di-blocklist — dan kata "sampel"
  masuk ke setiap dokumen yang menyebut pengukuran ini. Hitungan cakupan
  CodeQL juga pindah ke `git ls-files` setelah `find` atas daftar direktori
  terbukti melewatkan `astro.config.mjs` di akar.
- Yang TIDAK berubah: RUM tetap ditolak, "memenuhi Core Web Vitals" tetap
  tidak boleh ditulis dari hasil lab, dan baris celah yang tertutup tetap di
  tabel [standar-performa-dan-keamanan.md](docs/awcms-astro/standar-performa-dan-keamanan.md).

### Kutipan `ADR-NNNN` berhenti bisa menunjuk keputusan yang tidak ada

Aturan 2 `awcms` ADR-0062 — yang sejak ADR-0028 §E tercatat sebagai pekerjaan —
kini berjalan: `bun run audit:dokumen` memeriksa setiap kutipan `ADR-NNNN` di
seluruh markdown repo ini.

- Kutipan yang resolve ke `docs/adr/NNNN-*.md` lolos; kutipan milik repo lain
  lolos bila paragrafnya membawa penanda (`awcms`, "repo rujukan", atau tautan
  github); sisanya pelanggaran — rujukan ke keputusan yang tidak ada adalah
  tautan mati dalam bentuk yang tidak pernah menjadi tautan.
- Jalan pertamanya menemukan **sebelas kutipan** yang pembacanya tidak bisa
  tahu milik siapa — semuanya kutipan ADR `awcms` tanpa penanda, termasuk di
  empat ADR dan satu changeset. Bentuk penulisannya yang diperbaiki, bukan
  gerbangnya yang dilonggarkan.
- Dibuktikan dua arah di `tests/audit-dokumen.test.mjs` atas pohon fixture:
  MERAH saat kutipan tak ber-berkas dan tak bertanda, saat penandanya di
  paragraf lain, dan saat penandanya hanya `awcms-astro` (nama repo ini
  sendiri); HIJAU untuk ketiga bentuk penanda yang sah.
- Label tujuh komunitas graf yang tergeser rebuild inkremental ikut
  dikurasi ulang — termasuk komunitas baru generator SBOM dan ADR-0031.

### Celah 9 ditutup: setiap tag rilis membawa SBOM CycloneDX yang bisa diverifikasi

Konsumen hilir kini bisa menjawab "apakah rilis vX.Y.Z terdampak advisory X"
dari tag-nya, tanpa membangun ulang pohon dependency
([ADR-0031](docs/adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md);
NIST SSDF PS.2, celah 9 ADR-0028).

- `scripts/sbom.mjs` menurunkan CycloneDX 1.5 dari `bun.lock` — tanpa
  dependency baru, karena menambah dependency pada langkah yang tugasnya
  menginventarisasi dependency adalah ironi rantai pasok yang nyata.
- Deterministik: tanpa timestamp, komponen terurut — regenerasi pada tag yang
  sama menghasilkan byte identik, jadi SBOM sebuah tag bisa diverifikasi,
  bukan hanya dipercaya.
- `scripts/rilis.mjs` menulisnya sebelum commit rilis; `tests/sbom.test.mjs`
  menjaga generatornya benar (mutation-proven, termasuk entri lockfile tak
  dikenal yang DITOLAK alih-alih dilewati) dan langkah perilisnya tidak bisa
  hilang diam-diam.
- Kesegaran `sbom.cdx.json` di pohon kerja SENGAJA tidak digerbangi: SBOM
  memerikan rilis, dan gerbang yang menuntut sinkron terus-menerus akan
  memerahkan setiap PR bump dependency sampai dilonggarkan.

### Dokumen berhenti menghitung lima saat tabelnya mencatat enam, dan gelombang ADR `awcms` 0065–0068 diserap

Celah 6 (pin rantai pasok ke SHA/digest) ditutup ADR-0030 pada siang 4 Agustus,
tetapi tujuh berkas yang menghitung celah masih berbunyi "lima ditutup, empat
terbuka" — bentuk cacat yang persis diramalkan gerbang skill: prosa menua tanpa
memerahkan apa pun. Kini seluruh hitungan sepakat dengan tabel sumbernya:
**enam ditutup, tiga terbuka** (analisis statik, Core Web Vitals, SBOM).

- Baris A08 (Software & Data Integrity) naik dari "Sebagian" ke "Terpenuhi" —
  pin SHA/digest-nya sudah terpasang dan dijaga `tests/versi-toolchain.test.mjs`;
  yang tersisa dari kategori itu tinggal SBOM (celah 9).
- "Empat gerbang di CI" menjadi lima — `audit:graf` sudah lahir sebelum kalimat
  itu diperbarui.
- Panduan HSTS untuk situs turunan berhenti menyuruh memasang kebijakan di
  proxy: sejak [ADR-0029](docs/adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)
  penyaji sendiri yang mengirimnya di produksi, dan kebijakan kedua di Traefik
  adalah dua sumber yang saling menimpa.
- Gelombang ADR `awcms` 4 Agustus diserap ke
  [standar-performa-dan-keamanan.md](docs/awcms-astro/standar-performa-dan-keamanan.md)
  §Hubungan dan skill terkait: ADR-0065 (kontrak konsumen repo ini dibekukan di
  sana — lima path, subset aditif; kritik "membekukan yang tidak dikonsumsi"
  selesai), ADR-0067 (Core Web Vitals masih `Proposed` di sana — menguatkan arah
  lab-saja celah 8), ADR-0068 (pin edisi OWASP kini keputusan ber-ADR dengan
  tanggal tinjau, dan divergence HSTS repo ini tercatat bernama di manifest
  keluarga). Matriks header mencatat selisih baru yang disengaja dua sisi:
  `awcms` kini mengirim COOP/CORP `same-origin` untuk sesi admin-nya; repo ini
  tetap tidak, dengan alasan yang kode `awcms` sendiri nyatakan tidak menular.
- Jebakan "anggaran gambar ada, pemeriksanya belum" di skill situs-baru
  dihapus — pemeriksanya sudah ada sejak 4 Agustus; daftar perintah rilis di dua
  skill kini menyebut `bun run audit:graf`.

### Gerbang terbesar repo ini akhirnya punya gerbangnya sendiri

`scripts/audit-konten.mjs` adalah skrip gerbang terbesar di sini (879 baris) dan
satu-satunya yang tidak punya tesnya sendiri — `audit-dokumen.mjs` dan
`audit-graf.mjs` masing-masing dijaga sejak hari mereka lahir. Yang membuat
selisih itu mahal bukan jumlah barisnya melainkan **kapan** barisnya berjalan:
seluruh keluarga keluaran berada di belakang `if (existsSync("dist/client"))`,
dan `dist/client` lahir dari build yang butuh sumber konten `awcms` yang tidak
dimiliki repo template. Akibatnya ~330 baris pemeriksa — SEO, hreflang, aset
yang dijanjikan metadata, tautan mati, sitemap, nama key bocor, dan **kedua
gerbang performa ADR-0028** — tidak pernah dieksekusi satu kali pun di repo
tempat ia ditulis.

Itu bukan soal kelengkapan. Celah 2 dan 3 di tabel
[`standar-performa-dan-keamanan.md`](docs/awcms-astro/standar-performa-dan-keamanan.md)
berbunyi **DITUTUP** dan menyebut kedua fungsi itu sebagai pemeriksanya; satu
regex yang berhenti cocok akan membuat keduanya diam-diam berhenti memeriksa apa
pun, dan tidak ada satu gerbang pun di repo ini yang akan merah. Keadaan yang
persis dilarang ADR-0032 — gerbang yang tidak bisa dibuktikan di tempat ia
ditulis akan membusuk — dan kali ini yang membusuk adalah pemeriksa dari tabel
celah itu sendiri. Ia masuk tabel sebagai **celah 10**, sesuai aturan tabel itu:
temuan baru mendapat nomor, bukan menggantikan baris lama.

- `tests/audit-konten.test.mjs`: 53 kasus atas pohon fixture sungguhan di
  direktori sementara. Skripnya dijalankan **apa adanya** lewat `cwd` fixture —
  tanpa argumen akar, tanpa bendera uji, karena mode yang hanya hidup di tes
  adalah jalur kode yang tidak pernah dipakai situs mana pun.
- Tiap keluarga dibuktikan **dua arah**, dan arah kedua yang menahan biaya
  terbesar: pemeriksa yang memerahkan segalanya lulus uji "ia menangkap cacat
  ini" tanpa berguna sama sekali. Pengecualian yang disengaja ikut diuji —
  judul kembar antar locale, halaman `noindex` tanpa canonical, rasio yang
  TIDAK dituntut di `public/`, dan berkas yang sama dipakai dua kali dihitung
  satu unduhan — supaya tidak dihapus orang berikutnya yang membacanya sebagai
  kelalaian.
- **Mutation-proven.** Tiga belas mutasi dijalankan terhadap skripnya, satu per
  satu, dan **sebelas memerahkan tes yang berbeda**: mencabut tuntutan
  `fetchpriority`, menyamakan anggaran halaman konten dengan anggaran beranda,
  mencabut dedup `src`, mencabut resiprositas hreflang, berhenti melaporkan
  judul kembar, mengabaikan namespace katalog, memperlakukan dimensi yang tak
  terbaca sebagai lulus, mencabut pengecualian rasio `public/`, mencabut
  masing-masing dari dua cabang penelusuran gambar JSON-LD, berhenti memeriksa
  `<loc>` sitemap, dan menghapus catatan "DILEWATI".
- **Dua mutasi selamat, dan keduanya menemukan sesuatu yang nyata.** Yang
  pertama lubang di tes — cabang `image` JSON-LD tidak pernah diuji karena
  kasusnya kebetulan lewat cabang `ImageObject.url`; kini keduanya punya
  kasusnya sendiri. Yang kedua bukan lubang melainkan penyaring
  `mailto:|tel:|data:|javascript:` yang **tidak bisa dimutasi dari luar**:
  `internal()` sudah menolak skema itu lebih dulu. Itu ditulis di tesnya
  sebagai catatan kejujuran alih-alih dihitung sebagai cakupan.

Batas yang ikut dinyatakan: fixture bukan situs. Yang dibuktikan adalah logika
gerbangnya, bukan bahwa `astro build` sungguhan memancarkan bentuk yang sama —
itu hanya bisa dibuktikan sebuah SITUS, di mana `bun run audit:konten` setelah
build memang berjalan pada tiap PR.

### Gerbang di dalam image berhenti menggagalkan setiap build

`RUN bun test` di `Dockerfile` menjalankan SELURUH suite di dalam image. Sebagian
besar suite itu membaca metadata repo yang `.dockerignore` kecualikan dengan
sengaja — `.git/`, `.github/`, `.claude/`, `docs/`, `*.md` — dan `audit-graf`
memanggil biner `git` yang tidak ada di `oven/bun:*-alpine`.

Akibatnya bukan gerbang yang ketat, melainkan gerbang yang mustahil: **image
produksi tidak pernah sekali pun berhasil dibangun.** Kegagalannya sunyi bagi
repo, karena di CI berkas-berkas itu ada dan suite-nya hijau; ia hanya terlihat
oleh yang mencoba men-deploy, sebagai kegagalan build yang menyebut `git` —
sesuatu yang tidak pernah ditulis siapa pun sebagai dependency runtime.

Ditemukan saat men-deploy template ini ke server Coolify rujukan
(`ahliweb/serv-dinkesdocker`), tempat dua aplikasi untuk repo ini terdaftar sejak
29 Juli 2026 dan tidak pernah sekali pun menghasilkan container.

- Yang berjalan di dalam image sekarang hanya gerbang artefak: `penyaji`,
  `keluaran-csp`, `content-blocks`, `seni-lokal`. Semuanya menguji berkas yang
  memang akan disajikan, yang justru alasan langkah ini ada.
- `kontrak-awcms` tetap gerbang CI meski sebagian besar isinya artefak: dua
  tesnya membaca `.github/workflows/ci.yml` dan `.claude/skills/`.
- `AWCMS_*` dilepas khusus untuk langkah tes. Stage `build` menaikkan ARG
  menjadi ENV untuk seluruh stage, sehingga nilai build yang sungguhan bocor ke
  tes yang menyetir env-nya sendiri — 22 dari 31 tes `kontrak-awcms` merah
  karenanya, dan merahnya tidak menyebut env sama sekali.
- `.env.example` dan `docs/deploy-coolify.md` diperbaiki: kredensial mesin butuh
  `media_library.media.read` di samping `blog_content.posts.read`. Tanpa itu
  `build:asal-media` — langkah terakhir `bun run build` — dijawab 403 dan build
  gagal SETELAH seluruh halaman selesai dirender, yang terbaca seperti deployment
  rusak alih-alih izin yang kurang.

Diverifikasi dengan `docker build` penuh terhadap instans awcms sungguhan: 63
tes lolos, 0 gagal, `audit:konten` bersih, container menyajikan seluruh halaman,
dan token build tetap tidak ada di `docker history` maupun di dalam image.

### Sebuah tab boleh menyatakan dirinya seksi berita

Template ini bisa dipakai untuk situs berita, dan sampai sekarang tidak bisa —
bukan karena prefiksnya (`/news/` lahir sendiri dari rute `[tab]` yang sudah
generik) melainkan karena apa yang terjadi sesudahnya. Seksi berita akan
terurut menurut ABJAD, karena urutan dibaca dari `urutan` yang bawaannya 99 dan
pemecah serinya judul. Dan tidak ada satu halaman pun yang bisa melaporkan
koreksi: `datePublished` dan `dateModified` dipasang dari satu nilai yang sama,
sehingga setiap artikel menyatakan dirinya tidak pernah disentuh sejak terbit.

Alasan lengkapnya di
[ADR-0033](docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md).

- Setiap tab menyatakan `urutanSeksi: "manual" | "terbaru"`. Satu deklarasi,
  tiga akibat, karena ketiganya satu keputusan: urutan seksi, isi lencana
  kartunya, dan tipe schema.org artikelnya.
- Seksi `"terbaru"` terurut dari `publishedAt` menurun — paritas dengan
  `ORDER BY published_at DESC` pada rute publik `awcms` sendiri — dan kartunya
  menampilkan tanggal alih-alih "Artikel 99".
- Halaman artikel kini punya dua baris tanggal: **Terbit** selalu, dan
  **Diperbarui** hanya bila artikelnya memang diubah setelah terbit. Yang dulu
  berlabel "Diperbarui" sebenarnya tanggal terbit, di setiap tab.
- Artikel di seksi berita memancarkan `NewsArticle`, dan setiap artikel kini
  memancarkan `author` tingkat organisasi. Byline seorang editor tetap tidak
  ada — `awcms` menolaknya lebih dulu sebagai permukaan PII.
- Post `published` tanpa `publishedAt` berhenti diterbitkan. `awcms` menjawab
  404 untuk post itu di rutenya sendiri, jadi menerbitkannya di sini membuat dua
  permukaan tidak sepakat tentang apa yang sudah tayang.
- Ketiga tab yang dibawa template ini tetap `"manual"` dan tidak berubah
  perilakunya. Template TIDAK menambahkan tab `news`: yang mendarat adalah
  kemampuannya, dan cara menyalakannya ada di `checklist-repo-baru.md`.

Yang hanya terasa saat mengembangkan:

- `urutkanArtikel` adalah fungsi murni yang diekspor, bukan comparator inline.
  Cabang `"terbaru"` tidak akan pernah dieksekusi di repo template — setiap tab
  di sini `"manual"`, dan tidak ada instans `awcms` untuk membangun apa pun —
  jadi inline ia akan pertama kali berjalan di build produksi sebuah situs
  turunan.
- `ArticleSchemaInput.updatedDate` DIGANTI NAMANYA menjadi
  `publishedDate` + `modifiedDate`. Menambah field opsional di sebelahnya akan
  membiarkan setiap pemanggil lama tetap hijau sambil terus memancarkan klaim
  yang salah; penggantian nama yang memaksa `astro check` menemukan ketiganya.
- Dua keluarga gerbang baru di `audit:konten`. Yang pertama membaca setiap
  simpul `Article`/`NewsArticle` di keluaran — sedalam apa pun di dalam
  `@graph` — dan menuntut kedua tanggal ada, bisa diurai, tidak terbalik
  urutannya, serta `author.name` terbaca. Yang kedua menuntut hal yang sama dari
  pasangan `article:published_time`/`article:modified_time`, yang pemasangannya
  hidup di `.astro` dan karena itu tidak dijangkau typecheck maupun tes.
- Dua keputusan diangkat keluar dari `.astro` supaya bisa diuji:
  `tipeArtikelSeksi` (memilih `Article`/`NewsArticle`) dan
  `pernahDiubahSetelahTerbit` (memutuskan baris "Diperbarui" tampil atau tidak).
  Keduanya sebelumnya ekspresi terner di dalam layout — keputusan yang bisa
  dibalik tanpa satu gerbang pun berubah warna.
- Seksi yang diurutkan tanggal mengurutkan dari tanggal terbit artikel yang
  DITAMPILKAN, bukan post sumbernya. Keduanya berbeda pada halaman berbahasa
  lain, dan mengurutkan dari kolom yang tidak ditampilkan kartu menghasilkan
  daftar yang tanggalnya naik-turun tanpa sebab yang terlihat.
- Gerbang urutan menemukan satu cacat yang sudah ada: cabang manual memecah seri
  hanya dengan judul, sehingga dua artikel ber-`urutan` DAN judul sama jatuh ke
  urutan yang kebetulan dikembalikan API. Kedua cabang kini berakhir pada slug
  sumber.

**Yang belum ada, dan sengaja:** feed RSS/Atom dan paginasi indeks seksi.
Keduanya butuh ADR-nya sendiri, dan alasannya ditulis di §"Yang TIDAK dibangun"
ADR-0033 — yang menentukan bukan biayanya, melainkan bahwa tidak satu pun
gerbang di repo ini membaca keluaran `.xml`, dan bahwa paginasi mengubah bentuk
rute. Sampai keduanya mendarat, indeks seksi berita merender seluruh artikelnya
dalam satu halaman.

### Seksi berita bisa dilanggan, dan setiap `.xml` di keluaran akhirnya punya gerbangnya

[ADR-0033](docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)
menunda feed dan menuliskan alasannya sebagai temuan alih-alih sebagai biaya:
**satu-satunya `.xml` yang dibaca gerbang mana pun adalah `sitemap*.xml`**, dan
bahkan gerbang itu melewati setiap `<loc>` berakhiran `.xml` tanpa suara —
pemindai halaman hanya mengambil `**/*.html`. Sebuah feed yang menunjuk artikel
yang sudah dicabut, memuat nama key PO mentah sebagai judul, membawa URL relatif
(ilegal di Atom maupun RSS), atau mengaku diperbarui pada jam build akan lolos
kelima gerbang repo ini dengan build hijau.

Alasan lengkapnya di
[ADR-0035](docs/adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md).
Yang mendarat lebih dulu adalah keluarga gerbangnya; feed-nya menumpang di
atasnya.

- **Sebuah tab yang menyatakan dirinya `urutanSeksi: "terbaru"` menerbitkan feed
  Atom** di `/{tab}/feed.xml`, dan di `/{lang}/{tab}/feed.xml` untuk tiap locale
  berprefiks. Tidak ada yang perlu disunting selain deklarasi tab itu.
- **Seksi `"manual"` tidak menerbitkan feed**, dan itu bukan penghematan: langkah
  1 sebuah panduan akan terdorong ke setiap pelanggan setiap kali panduannya
  disunting, dan halaman berumur tiga tahun akan sampai sebagai kabar hari ini.
- **Seksi berita yang KOSONG juga tidak.** Atom mewajibkan `<updated>` pada
  feed, dan satu-satunya nilai yang tersedia untuk seksi kosong adalah jam build
  — angka yang repo ini sudah tolak untuk `lastmod` sitemap dengan alasan yang
  sama. Halaman seksinya juga tidak memasang tautan ke berkas yang tidak ada.
- **Atom 1.0, bukan RSS 2.0.** RSS nyaris tidak mewajibkan apa pun — judul,
  tanggal, `guid` semuanya opsional dan tautan boleh relatif — sehingga feed yang
  rusak tetap "valid" dan gerbang atasnya hanya bisa memeriksa hal-hal yang
  kebetulan ada. Setiap tuntutan gerbang di bawah adalah tuntutan yang sudah ada
  di spesifikasi Atom; tidak satu pun dikarang repo ini.
- **Feed membawa ringkasan, bukan isi artikel.** Mengirim `bodyHtml` penuh berarti
  menerbitkan markup ke permukaan yang tidak dilewati CSP mana pun dan tidak
  dibaca gerbang aset mana pun. Konsekuensinya dinyatakan: pelanggan membaca
  ringkasan lalu mengklik.
- **Halaman seksi DAN halaman artikel mengumumkan feed-nya** lewat
  `<link rel="alternate" type="application/atom+xml">` — yang terakhir karena di
  sanalah seorang pembaca paling mungkin memutuskan untuk berlangganan.
- **Feed keluar dari sitemap.** Sitemap mendaftarkan halaman; feed adalah
  representasi kedua dari halaman seksi yang sudah terdaftar sendiri. Dan
  gerbang sitemap melewati setiap `<loc>` `.xml` tanpa suara, jadi entri yang
  salah tidak akan terlihat di sana.
- **`Content-Type: application/atom+xml` dipasang `server/penyaji.mjs`.** ADR-0033
  menulis bahwa ini "tidak bisa disiasati" karena build statis membuang header
  endpoint. Bagian itu benar; yang tidak lengkap adalah bahwa lapisan yang
  membuangnya justru lapisan yang kita miliki (ADR-0016). Batasnya tetap
  dinyatakan: situs yang menaruh `dist/client` di belakang host statis orang lain
  kembali mendapat `application/xml` dari host itu.

**Template ini tidak berubah perilakunya.** Ketiga tabnya tetap `"manual"`, jadi
nol berkas feed lahir dan nol tautan penemuan-otomatis dipasang. Yang mendarat
kemampuannya, dan gerbangnya.

Yang hanya terasa saat mengembangkan:

- **`audit:konten` memindai `**\/*.xml`, bukan `**\/feed.xml`.** Yang ditemukan
  ADR-0033 bukan "feed tidak diperiksa" melainkan "berkas `.xml` bernama lain
  tidak dibaca siapa pun" — gerbang yang hanya mencari `feed.xml` akan mengulangi
  celah itu pada nama berikutnya. Setiap `.xml` yang bukan sitemap kini wajib
  berupa feed Atom yang sah, atau dilaporkan sebagai berkas yang tidak dibaca
  gerbang mana pun. Menerbitkan `opensearch.xml` sekarang menuntut keputusan
  sadar dan gerbangnya sendiri.
- **Gerbangnya dibuktikan di tempat ia tidak bisa berjalan.** Template menyatakan
  nol seksi berita, jadi gerbang feed tidak akan pernah menemukan berkas untuk
  diperiksa di sini — beban yang sama dengan celah 10. Tiga berkas menjawabnya
  dari tiga sisi: `tests/feed.test.mjs` (pembangunnya, murni),
  `tests/audit-konten.test.mjs` (gerbangnya atas pohon fixture, dua arah,
  **16 mutasi dijalankan satu per satu dan 16 memerahkan tes yang berbeda**), dan
  `tests/kontrak-awcms.test.mjs` (**sambungannya** — pembangun dan pemeriksa yang
  keduanya benar tidak menjamin apa pun bila perekatnya mengirim kolom yang
  salah; kedua rute ikut dipanggil langsung, karena `getStaticPaths` dan `GET`
  hanya berjalan saat build menemukan seksi berita).
- Tanggal feed diperiksa berbentuk **RFC 3339**, bukan "apa pun yang `new Date`
  terima". Selisihnya nyata: `2026-08-01` sah di JavaScript, melanggar Atom, dan
  entry-nya dibuang sebagian pembaca tanpa satu pesan pun.
- `src/lib/tanggal.ts` kehilangan satu docblock yang tergeser saat ADR-0033
  mendarat — penjelasan `tanggalMesin` menempel pada
  `pernahDiubahSetelahTerbit`. Dikembalikan ke fungsinya.

**Yang belum ada, dan sengaja:** feed situs-lebar, paginasi feed, RSS/JSON Feed
di samping Atom, dan `<content>` penuh. Alasan masing-masing di §"Yang TIDAK
dibangun" ADR-0035 — dua di antaranya penolakan, bukan penundaan.

### `/news/` dinyatakan kosakata repo ini, dan aturannya membawa pemeriksanya

Pertanyaan yang melahirkan [ADR-0033](docs/adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)
sangat spesifik: **apakah template ini siap mengelola situs berita di prefix
`/news/`?** ADR itu memperbaiki modelnya, [ADR-0035](docs/adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md)
memberinya feed. Satu hal tidak pernah dijawab: **siapa yang berhak memakai
prefiks itu.**

`awcms` [ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md)
mendaratkan keluarga `/news/**`-nya sendiri di sana pada 3 Agustus 2026. Jadi
selama lima hari kedua repo boleh melayani berita publik, di alamat yang sama,
dari sumber konten yang sama. Bukan konflik teknis — keduanya bekerja — melainkan
konflik **kosakata**, yang bentuknya adalah pertanyaan yang harus dijawab ulang
setiap kali sebuah deployment dibangun.

[ADR-0036](docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)
menjawabnya, berpasangan dengan `awcms` ADR-0071 yang men-supersede ADR-0059 di
sana: **`/news/` milik repo ini, `/blog/` milik `awcms`, satu keluarga rute per
repo dan tidak pernah keduanya di satu repo.**

- **Bentuknya sebuah tab, bukan keluarga rute baru.** Sebuah situs berita
  menamai tabnya `news` dan menyatakan `urutanSeksi: "terbaru"` — lalu mendapat
  `/news`, `/news/{slug}`, dan `/news/feed.xml` beserta padanan ber-locale-nya
  **tanpa satu baris kode baru**. Mesin tab dan feed per-seksi sudah ada.
- **`news` TETAP bukan kata yang dipesan**, dan ini selisih yang disengaja dengan
  bentuk `awcms`, yang menjadikannya kata dipesan pada host mana pun. Di sini ia
  slug tab yang dipilih situs: situs panduan yang tidak punya berita tidak punya
  `/news` dan tidak perlu menjelaskan kenapa. Template ini sendiri mengirimkan
  tiga tab, dan nol di antaranya berita.
- **Yang dibelah URL, bukan kepemilikan konten.** Keduanya dilayani modul
  `blog_content` yang sama di `awcms`; repo ini membacanya lewat
  `GET /api/v1/blog/posts` (ADR-0018, beku). Karena itu aturan cermin `awcms`
  ADR-0070 §4 — tidak ada kemampuan yang hanya ada di sini — terpenuhi tanpa
  pekerjaan tambahan: yang pindah rendering halamannya, bukan kemampuannya.

Yang hanya terasa saat mengembangkan:

- **Aturannya membawa pemeriksanya** ([ADR-0030](docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)).
  Aturan ini bisa dilanggar diam-diam dengan satu kata: menamai tab `news` lalu
  membiarkannya `"manual"`. Hasilnya `/news` yang mengurutkan berita menurut
  nomor yang diketik editor, berkartu tanpa tanggal, dan mengaku `Article`
  alih-alih `NewsArticle` kepada mesin pencari — permukaan yang mengaku berita di
  alamatnya dan membantahnya di setiap detailnya. `tests/kosakata-news.test.mjs`
  menolaknya, dan **tidak** menuntut tab `news` ada.
- **Arsip kategori/tag di `/news/` dinyatakan TERBUKA, bukan ditolak** (§5). Repo
  ini belum punya taksonomi sama sekali — tidak ada model kategori maupun tag di
  `src/lib/content.ts`, dan seksi ditentukan oleh tab, bukan oleh term. Menjanjikan
  paritas dengan empat rute `awcms` berarti memutuskan lebih dulu apa itu kategori
  di sini; itu ADR-nya sendiri.
- **Nol perubahan kode.** Yang mendarat aturannya, gerbangnya, dan satu baris
  backlog di `README.md`.

Sisi `awcms` mendapat pasangannya: ADR-0071, banner pada ADR-0059/0061, dan
gerbang dua arah atas jendela antara aturan itu dan penghapusan rutenya.

### Keluarga dinyatakan dua repo, dan permintaan terbuka ADR-0034 akhirnya dijawab

[ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
§Hubungan ditutup dengan satu kalimat yang menunggu jawaban dari repo lain:
selisih dengan `awcms` ADR-0051 ("seluruh layar admin … dibangun di repo
`awcms`") pantas dicatat sebagai divergence keluarga di sana, **"repo ini tidak
bisa menulisnya sendiri"**.

`awcms` menjawabnya pada 8 Agustus 2026 dengan **ADR-0070**, yang
**MEMPERSEMPIT** ADR-0051 alih-alih men-supersede-nya. Changeset ini menyusulkan
akibatnya ke dokumen repo ini — dan sekalian membereskan tiga kalimat yang sudah
salah sejak `awcms` ADR-0055 mendarat 2 Agustus 2026 tanpa pernah disusul di
sini.

- **Keluarga dinyatakan dua repo, dan pasangan keduanya adalah pengganti
  multiguna ketiga template lama** — bukan salah satunya sendirian. Tabel peran
  di `README.md` dan `docs/awcms-astro/README.md` kini menyatakan pembagiannya
  menurut **apa yang dikelola**, bukan menurut audiens: admin SISTEM di `awcms`,
  permukaan admin USER boleh di sini bila situsnya menyatakannya.
- **`awcms-mini` dan `awcms-micro` berhenti disebut "dibekukan" dan menjadi
  ARSIP.** Selisihnya bukan kata: pembekuan 31 Juli membolehkan port KELUAR dan
  menyatakan dirinya sementara; ADR-0055 menutup jalur itu dan tidak menjanjikan
  pencabutan.
- **[ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
  §Hubungan berhenti berbunyi "belum".** Ia sekarang menyebut
  ADR-0070 beserta entri `admin-user-surface-in-awcms-astro` ber-`reviewDate`
  2027-02-04 — dan menuliskan apa yang ditinjau pada tanggal itu: **bukan**
  apakah admin USER boleh di sini, melainkan apakah **batasnya** masih di tempat
  yang sama.
- **Tabel §Konteks keluarga di `standar-performa-dan-keamanan.md` mendapat baris
  ADR-0070**, sejajar dengan baris ADR-0068 dan ADR-0069 yang sudah ada.

Yang hanya terasa saat mengembangkan:

- **`AGENTS.md` §"Di mana pekerjaan boleh mendarat" memuat tiga klaim yang sudah
  tidak benar**, dan ketiganya ditulis ulang sebagai kutipan-yang-dicabut
  alih-alih dihapus diam-diam: (1) "di-port keluar boleh"; (2) "pembekuan ini
  **sementara**"; (3) "`awcms/AGENTS.md` mensyaratkan fitur fondasi diuji dulu di
  `awcms-mini`" — aturan mini-first itu **dicabut**, bukan ditangguhkan. Yang
  ketiga paling mahal: ia membuat pembaca di sini mengira ada hulu yang menunggu.
- Judul seksi itu berubah dari "berlaku 31 Juli 2026" menjadi "berlaku 2 Agustus
  2026", jadi tautan berjangkar dari `README.md` ikut diperbarui.
- **Nol perubahan kode.** Tidak ada permukaan admin yang mendarat, tidak ada
  gerbang yang berubah, dan `permukaanAdmin` tetap kosong di template. Yang
  berubah adalah dokumen yang menyatakan siapa memikul apa.

Sisi `awcms` mendapat perubahan pasangannya di PR tersendiri: ADR-0070, entri
manifest, dan pembersihan sisa mini/micro di sana.

### Publik sebagai fungsi utama; admin USER hanya bila dinyatakan

`AGENTS.md` berbunyi mutlak sejak ADR-0020: "Repo ini tidak memikul layar
admin." Kalimat itu menjawab pertanyaan yang salah. Yang benar-benar diputuskan
ADR-0020 adalah bahwa layar admin **sistem** — modul, peran, tenant, jejak
audit — dibangun di `awcms`, dan alasan itu masih berlaku. Yang tidak pernah
ditanyakannya: apakah seorang **pengguna** situs boleh mengerjakan bagiannya
sendiri di situs itu. Seorang penulis yang mengarang artikel bukan operator
platform, dan tidak satu pun alasan ADR-0020 berlaku padanya.

Alasan lengkapnya di
[ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md).

- **Fungsi utama repo ini tetap halaman publik**, dan sekarang itu keadaan yang
  ditegakkan alih-alih kalimat. Template menyatakan nol permukaan
  terautentikasi, dan `bun test` merah bila ada rute yang menyelinap keluar dari
  `output: 'static'` tanpa dinyatakan.
- **Selain itu**, sebuah situs boleh menyatakan permukaan admin untuk **user** —
  penulis, peninjau, kontributor — lewat `permukaanAdmin` di
  `src/config/site.ts`. Kosong berarti publik saja, dan itu bawaannya.
- **Admin utama tidak pernah di sini.** `owner` ditolak gerbang, apa pun
  kapitalisasinya; layar yang mengelola sistem tetap di `/admin/*` milik
  `awcms`.
- **Permukaan admin duduk di SEBELAH halaman publik, tidak menggantikannya.**
  Prefiks `/`, prefiks locale, dan slug tab ditolak — ketiganya menaruh bagian
  publik di belakang login sambil tetap membangun hijau.
- **Menyatakannya tidak memindahkan satu izin pun.** RBAC/ABAC default-deny
  `awcms` tetap yang memutuskan; deklarasi di sini menggambar tombol.
- **Tidak ada fitur yang hanya ada di sini.** Setiap fitur yang dipakai user
  wajib juga bisa dikelola `owner` di `awcms` — aturan yang berlawanan arah
  dengan larangan `owner` dan justru melengkapinya: yang satu menjaga owner tak
  bisa MASUK, yang lain menjaga tak ada yang LEPAS. Urutan kerjanya karena itu
  `awcms` dulu, selalu.
- **Template ini memang dimaksudkan tumbuh menjadi banyak variasi**, dan yang
  bervariasi adalah bentuk permukaannya — bukan kumpulan kemampuannya.
- **Satu `awcms`, banyak situs.** Sebuah instans `awcms` boleh memiliki banyak
  repo situs sekaligus; semuanya merujuk `awcms` yang sama sebagai backend dan
  sebagai admin utama. Konsekuensinya ditulis sebagai aturan: jangan menulis
  kode yang mengandaikan situs ini satu-satunya, dan kemampuan yang dipakai
  lebih dari satu situs tinggal di `awcms` sekali — bukan disalin per situs.

Yang hanya terasa saat mengembangkan:

- `tests/peran-situs.test.mjs` menegakkan seluruh aturan di atas atas KODE,
  bukan atas dokumen — termasuk memindai `src/pages/**` untuk `prerender =
  false` dan menuntut prefiksnya dinyatakan, serta menuntut `AGENTS.md` sendiri
  menyebut deklarasi dan peran yang dilarang.
- Tidak ada kode permukaan admin yang mendarat. Yang mendarat aturannya,
  deklarasinya, dan gerbangnya; implementasinya masih ditahan uji ADR-0023
  persis seperti BFF Jualanku, karena ia memanggil `awcms` di setiap permintaan
  runtime.
- Selisih dengan `awcms` ADR-0051 ("seluruh layar admin dibangun di `awcms`")
  dinyatakan terus terang di ADR-0034 §Hubungan, beserta catatan bahwa ia
  pantas dicatat sebagai divergence keluarga di sisi `awcms` — yang tidak bisa
  ditulis dari repo ini.
