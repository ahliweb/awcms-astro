# Changelog

Seluruh perubahan yang layak diketahui pencatat rilis, terbaru di atas.

Versi memakai format `MAJOR.MINOR.PATCH` dan ditandai di git sebagai `vX.Y.Z`. Arti setiap angka ditetapkan di [`docs/awcms-astro/standar-teknis.md`](docs/awcms-astro/standar-teknis.md#versioning) — semver dirancang untuk library ber-API, jadi artinya untuk sebuah situs perlu didefinisikan ulang.

Berkas ini diisi `bun run release <level>` dengan melipat seluruh changeset di [`.changesets/`](.changesets/README.md). Jangan menambahkan bagian versi dengan tangan; tulis changeset-nya, dan biarkan skrip rilis yang melipat.

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
