# AGENTS.md — kontrak kerja `awcms-astro`

Berlaku untuk manusia maupun agen AI yang bekerja di repo ini. Kalau sebuah
aturan di sini bertabrakan dengan kebiasaan umum, aturan di sini yang menang —
setiap butir ditulis karena pelanggarannya pernah atau pasti menimbulkan cacat
yang terlihat pembaca.

## Apa repo ini

Template keluarga AWCMS di Astro dengan
[`ahliweb/awcms`](https://github.com/ahliweb/awcms) sebagai backend konten dan
system of record. Situs publiknya **statis**: konten ditarik saat **build**,
bukan saat request. Repo ini **bukan** rumah layar admin — seluruhnya tinggal di
`awcms` (§Peran repo ini). Satu-satunya permukaan terautentikasi yang
direncanakan di sini adalah BFF portal Jualanku (ADR-0014), dan ia belum ada.

## Peran repo ini (berlaku 2 Agustus 2026 — ADR-0020)

**Repo ini tidak memikul layar admin.** Kalau kamu ke sini untuk membangun
layar operator platform atau layar internal, kamu berada di repo yang salah:
`awcms` ADR-0051 memusatkan **seluruh** layar admin — tenant maupun
owner/internal/platform — di `awcms`, di bawah satu shell `/admin/*`.

| Repo          | Peran frontend                             | Audiens                                     |
| ------------- | ------------------------------------------ | ------------------------------------------- |
| `awcms`       | frontend publik + **SELURUH** admin        | pengunjung, admin tenant, operator platform |
| `awcms-astro` | situs publik statis + experience layer/BFF | pembaca anonim, pengguna Jualanku           |

Aturan sebelumnya (ADR-0017, 31 Juli 2026) menaruh layar owner/internal di sini.
Ia **di-supersede** — bukan karena jalurnya buntu, melainkan karena memindahkan
layar tidak pernah menjadi kontrol keamanan yang diklaimkan: izin tidak ikut
pindah, jadi risikonya juga tidak. Alasan lengkapnya di
[ADR-0020](docs/adr/0020-layar-admin-kembali-ke-awcms.md).

Satu permukaan terautentikasi tetap direncanakan di sini, dan ia bukan admin:
**BFF portal Jualanku** (ADR-0014, `awcms` ADR-0045). Empat aturan berikut
mengikatnya — dipindahkan utuh dari ADR-0017 karena keempatnya menyangkut
permukaan terautentikasi apa pun, bukan khusus layar admin:

1. **`awcms` tetap system of record.** Repo ini tanpa basis data; datanya datang
   dari `/api/v1/*` lewat BFF. Browser tidak pernah memanggil `awcms` langsung
   dan tidak pernah memegang kredensialnya.
2. **Izin tidak pindah bersama layar** — RBAC/ABAC default-deny milik `awcms`
   tetap yang memutuskan. Permukaan di sini bukan jalur kedua yang lebih longgar.
3. **Tidak ada cache bersama** antara permukaan publik dan permukaan
   terautentikasi.
4. Setiap penambahan di permukaan terautentikasi dinilai sebagai **permukaan
   keamanan**, bukan sekadar halaman.

Dua kontrak yang dulu memblokir permukaan itu — header tenant dan kredensial
mesin yang bisa dipegang BFF — **sudah mendarat** di `awcms` (ADR-0049 dan
ADR-0050, 1 Agustus 2026). Yang belum: implementasinya di sini, dengan
prasyarat di [`04-kesiapan.md`](docs/awcms-astro/jualanku/04-kesiapan.md).

## Di mana pekerjaan boleh mendarat (berlaku 31 Juli 2026)

`ahliweb/awcms-mini` dan `ahliweb/awcms-micro` **dibekukan sebagai REFERENSI**.
Sementara ini keduanya tidak dikembangkan: dibaca boleh, disalin polanya boleh,
di-port keluar boleh — **mengirim perubahan ke sana tidak.** Pekerjaan mendarat
langsung di `awcms-astro` dan `awcms`.

Konsekuensi yang paling mudah terlewat, dan alasan aturan ini ditulis di sini
alih-alih hanya diucapkan: `awcms/AGENTS.md` mensyaratkan **"fitur fondasi
diuji lebih dulu di awcms-mini, baru di-port"**, dan menyatakan `awcms` "bukan
tempat merintis fitur fondasi dari nol". Selama pembekuan ini berlaku, jalur itu
**tidak bisa ditempuh** — tidak ada hulu yang menerima perubahan. Fitur fondasi
karena itu dirintis langsung di `awcms`, dan syarat yang digantikannya (review
keamanan untuk modul auth/access, ADR, gate `family:conformance:check`) tetap
berlaku penuh. Menghapus satu rute bukan menghapus penjagaannya.

Pembekuan ini **sementara**. Saat dicabut, keputusan pertama yang harus diambil
adalah bagaimana perubahan yang sudah mendarat di `awcms` dipulangkan ke hulu —
karena setiap fitur fondasi yang dirintis selama pembekuan adalah divergence
sengaja yang belum tercatat di `awcms-family-compatibility.yaml`.

## Alur kerja wajib

1. Satu iterasi = satu scope atomic. Selesaikan dan validasi sebelum pindah.
2. Buat branch dari `main` sebelum menyentuh kode. Jangan commit langsung ke
   `main`.
3. `bun run build` harus bersih sebelum pekerjaan dinyatakan selesai. `build`
   sudah mencakup `astro check`; melewatinya adalah penyebab tersering "hijau
   lokal, merah di CI".
4. Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
5. Perubahan yang mengubah perilaku wajib memperbarui dokumen yang menjelaskan
   perilaku itu — di repo ini dokumentasi adalah bagian dari produk, bukan
   pelengkap.

## Aturan yang tidak bisa dilanggar

### Sumber data

- **`src/lib/awcms/client.ts` adalah satu-satunya berkas yang boleh menghubungi
  awcms.** Komponen menerima data lewat props dan tidak pernah mengambilnya
  sendiri. Inilah yang membuat sumber data bisa diganti tanpa menyentuh satu
  komponen pun — dan itu bukan teori: repo asalnya membaca markdown dari disk,
  dan lapisan rendernya tidak berubah sedikit pun saat pindah ke API.
- **Empat aturan di `src/lib/content.ts` tidak boleh dilonggarkan**: kumpulan
  slug ditentukan locale default, `isFallback` dihitung adapter, urutan dari
  field urutan, dan hanya `status = 'published'` yang masuk build. Masing-masing
  menjaga satu cacat spesifik tetap mustahil; alasannya ditulis di berkas itu.
- **Diam-diam memotong data adalah kegagalan, bukan optimasi.** Adapter
  menyusuri SELURUH daftar dengan cursor keyset; batas halaman bukan batas
  konten. Kalau sesuatu menghalangi kelengkapan — cursor yang tidak maju,
  terjemahan yang tidak bisa dipasangkan — **lempar error**, jangan bangun situs
  yang terlihat berhasil sambil kehilangan artikel.
- **Daftar post awcms mengembalikan RINGKASAN kecuali diminta `view=full`.**
  `contentJson`, `excerpt`, `metaDescription`, `canonicalUrl`, dan
  `translationGroupId` hanya ikut pada `view=full` (yang mensyaratkan
  `order=created_at`). Membaca salah satunya dari respons ringkasan tidak
  error — ia `undefined`, dan karena `kategori` tinggal di dalam
  `contentJson`, seluruh seksi situs menjadi kosong dengan build tetap hijau.
  Itu pernah terjadi di repo ini (ADR-0018), jadi jangan melepas parameter itu
  "karena daftarnya toh sudah jalan".
- **Tenant datang dari token, dan `AWCMS_TENANT_ID` adalah assertion.**
  Jangan mengembalikannya menjadi rantai resolusi, dan jangan mengirim header
  tenant: awcms menurunkan tenant dari kredensial mesin dan mengabaikan header
  yang berbeda. Yang dijaga assertion itu bukan "build menebak tenant" —
  melainkan token tenant lain yang terpasang di situs ini, yang tampak persis
  seperti build yang sehat.

### Keamanan

- **Tidak ada jalur HTML mentah dari CMS.** `src/lib/content-blocks.ts` menyusun
  setiap elemen dari teks ter-escape dan tag tetap. Menambahkan tipe blok
  `html`/`raw`/`embed` membatalkan seluruh jaminannya.
- **`set:html` hanya boleh menerima keluaran `renderContentBlocks`.** Jangan
  pernah memberinya string dari sumber lain.
- **Token build tidak pernah ber-prefix `PUBLIC_`.** Astro hanya menyisipkan
  variabel ber-prefix itu ke keluaran klien; token di bundel statis adalah token
  yang diterbitkan ke setiap pembaca.
- **Tidak ada skrip pihak ketiga.** Tanpa SDK, widget, piksel, atau tombol
  berbagi milik penyedia sosial. Berbagi memakai tautan biasa.
- **Tidak ada pengumpulan data pribadi pembaca.** Tanpa form, tanpa analytics
  yang mengikat identitas.
- **Jangan pernah mengiklankan aset yang tidak diterbitkan build ini.**
  `og:image`, `twitter:image`, dan `ImageObject` JSON-LD adalah KLAIM, dan
  klaim yang menunjuk 404 lebih buruk daripada tag yang tidak ada: pratinjau
  tanpa gambar jatuh ke kartu teks yang rapi, pratinjau dengan gambar rusak
  tidak jatuh ke mana pun. Template ini pernah memasang ketiganya di setiap
  halaman, menunjuk `/social/<slug>.png` yang dibangkitkan skrip yang tidak
  pernah ikut ke repo ini. Aset opsional dinyatakan lewat env dan **dilepas
  seluruhnya saat kosong**, bukan diberi nilai default yang menebak.
- **Tidak ada lambang, logo, atau atribut resmi instansi negara** — termasuk di
  dalam ilustrasi.
- **Tidak ada dokumen, kuitansi, nomor registrasi, identitas, atau antarmuka
  aplikasi pemerintah yang direkayasa**, dalam bentuk apa pun termasuk
  ilustrasi. Pembaca bisa menyimpulkan itu rupa yang asli, dan kesimpulan itu
  memudahkan penipuan.

### Penyajian

- **`server/penyaji.mjs` adalah satu-satunya tempat header respons ditentukan**
  (ADR-0016). Lima header keamanan — termasuk `Content-Security-Policy` dan
  `Permissions-Policy` sejak ADR-0019, keduanya disamakan dengan postur `awcms`
  — dua aturan `Cache-Control`, dan kompresi
  tinggal di sana dan tidak boleh tersebar ke tempat lain — di nginx aturan
  serupa harus di-`include` ulang di setiap `location`, dan melupakannya
  menghasilkan halaman tanpa satu pun header keamanan tanpa ada yang gagal.
- **Jangan menulis penyaji berkas sendiri.** Penerjemahan URL menjadi path
  berkas tetap milik adapter `@astrojs/node`. Setiap baris yang melakukannya
  sendiri adalah baris yang bisa keliru menjadi pembacaan berkas arbitrer —
  `..`, path ter-encode ganda, dan symlink adalah kelas cacat yang sudah
  selesai bertahun-tahun lalu di pustaka yang dipakai adapter, dan kegagalannya
  bukan halaman jelek.
- **HTML tidak pernah di-cache lama; aset `/_astro/` selalu `immutable`.**
  Keduanya berperilaku benar secara diam-diam ketika salah: situs tetap tayang,
  hanya rebuild yang sukses tidak pernah terlihat pembaca. Karena itu perubahan
  apa pun pada penyajian wajib lewat `tests/penyaji.test.mjs`.
- **Yang menilai "ini aset atau bukan" harus menormalkan path lebih dulu.**
  `/_astro/../index.html` menyajikan halaman depan; menilainya dari prefiks
  mentah akan menempelkan cache satu tahun pada berkas yang berubah setiap
  rebuild.
- **CSP dilonggarkan di `server/penyaji.mjs`, dan tidak di tempat kedua mana
  pun.** Bukan lewat variabel env, bukan lewat header tambahan di Traefik, bukan
  lewat `<meta http-equiv>`. Yang paling mungkin perlu dilonggarkan sebuah situs
  adalah `img-src` (gambar artikel dari host media awcms) — lakukan di sana,
  lalu perbarui `tests/penyaji.test.mjs`. Dua sumber kebijakan yang saling
  menimpa adalah cara paling sunyi untuk berakhir tanpa kebijakan sama sekali.

### Antarmuka

- **Setiap fungsi inti bekerja tanpa JavaScript.** Navigasi, pengalih bahasa,
  accordion, dan seluruh isi halaman. Yang benar-benar butuh JS disembunyikan
  saat JS mati — kontrol yang diam saat diklik lebih buruk daripada kontrol yang
  tidak ada.
- **Aksesibilitas WCAG 2.1 AA** adalah batas, bukan target: kontras cukup di
  kedua tema, fokus terlihat, navigasi keyboard penuh, `prefers-reduced-motion`
  dihormati. Animasi dekoratif **dimatikan** saat itu diminta, bukan dipercepat
  — aturan `*` global hanya memangkas durasi, dan animasi 0,01 md tetap
  berkedip. Umpan balik hover juga aktif pada `:focus-visible`, sehingga
  pengguna keyboard tidak mendapat versi yang lebih miskin.
- **Mobile-first dari 360px.**
- **String antarmuka lewat katalog PO**, tidak pernah ditulis langsung di
  komponen. Ini berlaku juga bagi label yang datang dari konfigurasi: navigasi
  utama pernah merender nilai HURUF BESAR dari `src/config/site.ts`, sehingga
  permukaan paling terlihat di situs justru satu-satunya yang tidak pernah
  ikut berganti bahasa.
- **Rantai fallback `t()` berujung di NAMA KEY, dan nama key di layar bukan
  "halaman terbaca".** Karena itu setiap key yang mungkin belum ada di katalog
  mana pun — key yang dirangkai dari slug tab, dari kategori biaya, dari apa pun
  yang ditentukan konfigurasi atau redaksi — **wajib** dipanggil dengan argumen
  fallback yang layak dibaca: `t(locale, key, tab.label)`. Repo ini pernah
  menerbitkan `translation.notice.label`, `biaya.jenis.pnbp`, `tab.articleNo`,
  dan `tab.readMoreCta` sebagai teks yang dibaca pembaca, di kedua bahasa,
  dengan `astro check` bersih dan build hijau. `tests/katalog-po.test.mjs`
  sekarang menolak key literal tanpa fallback yang tidak ada di katalog — tetapi
  ia tidak bisa melihat key dinamis, dan di sanalah aturan ini bekerja.
- **Token desain, bukan nilai lepas.** Tidak ada gaya sekali pakai; komponen
  baru memakai token yang sudah ada di `src/styles/global.css`.
- **Tidak ada atribut `style=""`, dan tidak ada blok `<style>` di dalam HTML.**
  Gaya tinggal di `src/styles/global.css` (bila dipakai lebih dari satu
  komponen) atau di `<style>` scoped milik komponen — yang Astro terbitkan
  sebagai berkas CSS terpisah, bukan disisipkan ke halaman. Keduanya diblokir
  CSP `style-src 'self'`, dan kegagalannya adalah halaman tanpa tata letak
  tanpa satu pun error di build. `build.inlineStylesheets: "never"` yang
  menjaga jalur kedua; `tests/keluaran-csp.test.mjs` memeriksa keluarannya.
  Nilai dinamis yang dulu dikirim lewat `style="--var: …"` ditulis sebagai
  kelas — lihat warna kanal berbagi di `global.css`.
- **Tidak ada JavaScript di dalam HTML** (ADR-0019). Sejak penyaji mengirim
  `script-src 'self'` tanpa `'unsafe-inline'`, skrip inline bukan "kurang rapi"
  — ia mati di browser pembaca. Dua jalur memasukkannya, dan yang kedua tidak
  terlihat di `src/` sama sekali:
  1. `<script is:inline>` berisi kode. Skrip yang harus jalan sebelum paint
     pertama menjadi berkas di `public/` yang dimuat `<script src>` klasik —
     lihat `public/tema.js`. Bundel Astro selalu `type="module"` dan modul
     selalu ditunda, jadi ia bukan pengganti untuk kasus itu.
  2. `<script>` biasa di komponen, yang Astro bundel lalu **sisipkan kembali**
     ke HTML bila chunk-nya lebih kecil dari `assetsInlineLimit`.
     `vite.build.assetsInlineLimit: 0` di `astro.config.mjs` yang menutupnya,
     dan tanpa setelan itu sebuah komponen berhenti patuh hanya karena kodenya
     mengecil — persis pola yang membuat `inlineStylesheets: "never"` perlu.

  Dikecualikan tepat satu: `<script type="application/ld+json">`. Ia blok data,
  bukan skrip — browser tidak pernah mengeksekusinya sehingga `script-src` tidak
  berlaku atasnya, dan memindahkannya ke berkas eksternal hanya membuat mesin
  pencari berhenti membacanya.

### Gambar

Template ini belum membawa satu pun ilustrasi, tetapi bingkainya sudah ada dan
aturan di bawah berlaku sejak gambar pertama dimasukkan situs yang memakainya.

- **Satu rasio untuk seluruh situs, dipakai bingkai maupun sumber.** Nilainya
  `--ratio-visual` di `src/styles/global.css`, saat ini 16∶9. Bingkai memakai
  `object-fit: cover`, jadi sumber berasio lain **tidak** diperkecil — ia
  dipotong, diam-diam, di setiap ukuran layar. Sumber 1∶1 pada bingkai 16∶9
  kehilangan 22% teratas dan 22% terbawah, dan judul gambar hampir selalu ada di
  sana. Repo rujukan kehilangan judul pada sebelas banner sekaligus sebelum ada
  yang menyadarinya, dan tidak ada satu pun build yang gagal karenanya.
- **Mengubah `--ratio-visual` berarti membangkitkan ulang seluruh seni.**
  Mengubahnya hanya di CSS memindahkan potongannya, bukan menghilangkannya.
- **Format dibaca dari isi berkas, bukan dari ekstensinya.** Sebelas berkas di
  repo rujukan ber-ekstensi `.png` padahal isinya JPEG.
- **SVG wajib XML valid.** Satu `&` telanjang membuat browser diam-diam gagal
  merender gambarnya — tanpa satu pun pesan error.
- **Teks di dalam gambar hanya label topik.** Tanpa nominal, tanggal, nomor
  registrasi, nama orang, dokumen tiruan, atau antarmuka aplikasi pemerintah.
  Angka di dalam gambar tidak bisa membawa sumber dan dasar hukumnya, sehingga
  ia lolos dari aturan yang menjaga seluruh angka lain — dan ia tidak ikut
  diperbarui saat tarifnya berubah.
- **Tanpa lambang, logo, atau atribut instansi negara — termasuk di dalam
  ilustrasi.** Situs dari template ini adalah portal independen, dan lambang
  negara di halamannya membantah pernyataan itu dalam satu pandangan.
- **Teks terkecil di dalam SVG minimal 22px pada kanvas 800px.** Pada kartu
  selebar 328px — viewport 360px — kanvas 800px tampil pada skala 0,41, jadi di
  bawah ambang itu teksnya tampil di bawah 9px dan praktis tidak terbaca.
- **`src: undefined` adalah keadaan yang didukung.** Setiap pemanggil merender
  `.visual-placeholder`. Ilustrasi yang hilang tidak boleh menjadi halaman yang
  hilang — maupun bingkai setinggi nol.

Dua aturan isi di atas — teks gambar dan lambang instansi — **tidak bisa
diperiksa mesin**. Katakan itu terus terang alih-alih membiarkannya tampak
terjaga; aturan yang tampak terjaga padahal tidak lebih berbahaya daripada
aturan yang jelas-jelas manual.

### Konfigurasi

- **`src/config/site.ts` dan `.env` adalah satu-satunya tempat konfigurasi.**
  Menstandarkan situs baru tidak boleh menuntut penyuntingan komponen. Aturan
  ini yang paling sering dilanggar tanpa disadari, karena pelanggarannya tidak
  pernah gagal — ia hanya menerbitkan identitas situs lain. Yang pernah
  ditemukan tertanam harfiah di kode template ini: nama situs repo rujukan di
  setiap `<title>`, emoji instansi dan lencana wilayah di header, `'id'`
  sebagai `hreflang="x-default"`, peta lima nama tab repo rujukan, nama
  provinsi di pembangun JSON-LD, dan bendera Merah Putih untuk setiap locale
  yang bukan `en`. **Sebelum menulis nilai apa pun yang khas satu situs,
  tanyakan apa yang terjadi bila situs berikutnya memakainya.**
- **Nilai bawaan yang khas satu situs lebih buruk daripada nilai kosong.**
  `SITE_MARK` dan `SITE_SOCIAL_IMAGE` kosong secara bawaan, dan kedua keadaan
  kosong itu dirender penuh.
- **Setiap variabel env yang dibaca kode wajib ada di `.env.example`**, disertai
  penjelasan konsekuensi salah isi — bukan sekadar nama.
- **Bun adalah runtime dan package manager repo ini** (ADR-0015), termasuk di
  produksi: sejak ADR-0016 keluaran build disajikan proses Bun, bukan nginx.
  Versinya dipin di TIGA tempat yang wajib bergerak bersama: `packageManager` +
  `engines.bun` di `package.json`, `bun-version` di `.github/workflows/ci.yml`,
  dan tag image di `Dockerfile` — yang kini muncul DUA kali di berkas itu, stage
  `build` dan stage `runtime`. Menaikkan salah satu saja membuat build lokal,
  CI, dan image berbeda perilaku — diam-diam.
- **`bun.lock` wajib merupakan pernyataan tentang repo ini**, dan wajib
  di-commit. `bun run check:lockfile` memeriksanya sebelum install: nama
  workspace harus milik repo ini (lockfile hasil salinan repo lain persis
  dikenali dari sini) dan blok dependency harus sama persis dengan
  `package.json`. Install di CI dan di image selalu
  `bun install --frozen-lockfile`.
- **Regenerasi lockfile penuh**: `rm -rf node_modules bun.lock && bun install`.
- **Jangan menamai script sama dengan biner yang dipanggilnya.** `bun run`
  menyelesaikan nama ke script `package.json` **sebelum** `node_modules/.bin`,
  jadi sebuah script `"astro": "bun --bun astro"` membuat setiap script lain
  yang memanggil `astro` masuk rekursi tak terbatas — dan matinya berbunyi
  `E2BIG: Argument list too long`, yang tidak menyebut sebabnya sama sekali.
  Untuk perintah Astro sekali pakai: `bunx astro <perintah>`.
- **`bun install` TIDAK menolak peer-dependency mismatch** seperti npm — ia
  memperingatkan lalu memasang. Karena itu batas peer yang penting (mis. pin
  `typescript` untuk `@astrojs/check`) ditulis eksplisit di
  `.github/dependabot.yml`; tanpa itu bump yang tidak didukung terpasang mulus
  dan gagal jauh dari sebabnya.
- **Baca env lewat `src/lib/env.ts`**, bukan `import.meta.env` langsung.
  Variabel non-`PUBLIC_` bisa terbaca `undefined` di dalam chunk prerender
  meskipun nilainya ada di `.env`, dan kegagalannya menyamar jadi masalah lain.

## Definition of Done

- [ ] `bun run build` bersih (termasuk `astro check`).
- [ ] `bun test` hijau — termasuk gerbang katalog `tests/katalog-po.test.mjs`.
- [ ] Halaman baru bekerja dengan JavaScript dimatikan.
- [ ] String antarmuka baru masuk ke SELURUH katalog locale.
- [ ] Key yang dirangkai dari konfigurasi atau data redaksi dipanggil dengan
      argumen fallback yang layak dibaca.
- [ ] Tidak ada `any` pada props komponen yang menerima `LocalizedArticle`.
      `entry: any` di `ArtikelLayout` menyembunyikan empat field yang tidak
      pernah ada dan satu baris metadata yang selalu kosong; menggantinya
      dengan tipe kontraknya menemukan seluruhnya dalam satu kali typecheck.
- [ ] Locale default dan locale berprefiks menghasilkan jumlah halaman yang sama.
- [ ] Gambar baru berasio `--ratio-visual`, ekstensinya sesuai isi berkas, tanpa
      lambang instansi maupun data tiruan, dan teksnya terbaca pada lebar 360px.
- [ ] Perubahan pada penyajian — header, CSP, `Cache-Control`, kompresi, port —
      dibuktikan `tests/penyaji.test.mjs`, bukan diperiksa dengan mata.
- [ ] Keluaran build tidak membawa gaya maupun skrip di dalam HTML-nya.
      `bun test` setelah `bun run build` menjalankan `tests/keluaran-csp.test.mjs`
      atas `dist/client/` — tanpa hasil build, gerbang itu MELEWATI dirinya dan
      mengatakannya. Melihat "59 pass" tanpa membaca barisnya bukan pembuktian.
- [ ] Variabel env baru terdokumentasi di `.env.example`, termasuk variabel
      RUNTIME yang dibaca `server/penyaji.mjs`.
- [ ] Dokumen yang menjelaskan perilaku yang berubah ikut diperbarui.

## Berpindah ke SSR

`output: 'static'` adalah premis template ini, bukan default yang kebetulan.
Mengubahnya ke `'server'` menarik kembali runtime, dependensi basis data yang
hidup, dan seluruh kontrol operasional keluarga AWCMS. Keputusan itu ditulis
sebagai ADR lebih dulu, bukan diambil lewat satu baris di `astro.config.mjs`.

**Satu ADR seperti itu sudah ada:**
[ADR-0014](docs/adr/0014-rendering-campuran-dan-bff-portal.md) (Jualanku.info)
memutuskan pola **static-by-default dengan rute on-demand** — adapter dipasang,
`output` **tetap** `static`, dan hanya `/penjual/**`, `/affiliate/**` (selain
landing), serta `/_portal-api/**` yang menyatakan `export const prerender = false`.
Rancangannya di [`docs/awcms-astro/jualanku/`](docs/awcms-astro/jualanku/README.md).

Tiga hal yang perlu dibaca sebelum menyentuh area itu:

- **Belum ada implementasinya.** Rute portal dan `_portal-api` belum ada, dan
  tidak ada satu pun rute yang menyatakan `prerender = false`. Adapternya
  **sudah** terpasang sejak ADR-0016 — tetapi untuk MENYAJIKAN hasil build,
  bukan untuk merender saat request; `output` tetap `static`. Jangan membaca
  kehadirannya sebagai tanda prasyarat portal sudah lewat: prasyaratnya ada di
  [`04-kesiapan.md`](docs/awcms-astro/jualanku/04-kesiapan.md) dan belum
  berubah.
- **BFF tidak memutuskan apa pun yang punya konsekuensi bisnis.** Kepemilikan,
  entitlement, dan transisi status diputuskan `awcms`. Aturan yang hanya hidup di
  repo ini adalah aturan yang tidak ada.
- **Aksesibilitas permukaan Jualanku bertarget WCAG 2.2 AA**, naik dari 2.1 AA di
  atas. Aturan lain di dokumen ini tetap berlaku penuh.
