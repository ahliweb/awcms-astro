# ADR-0033 — Seksi berita: urutan datang dari tanggal, dan dua tanggal berhenti dilipat menjadi satu

- **Status:** Accepted
- **Tanggal:** 7 Agustus 2026
- **Aturan pemilik:** 7 Agustus 2026 — "cek dan analisis kesiapan untuk pengelolaan website berita menggunakan modul blog dengan prefix `/news/`", lalu "lanjut kerjakan mengikuti alur awcms."
- **Terkait:** [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (build feed, dan bentuk cacat "build hijau, situs kosong" yang jadi rujukan berulang di sini), [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (uji "ditulis ulang bila `awcms` berubah?"), [ADR-0026](0026-kartu-share-per-artikel-dari-media-awcms.md) (paritas urutan `seoImageMediaId ?? featuredMediaId` yang ditiru, bukan ditemukan ulang), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (setiap aturan baru wajib membawa pemeriksanya), `awcms` [ADR-0044](https://github.com/ahliweb/awcms/blob/main/docs/adr/0044-merge-news-portal-into-blog-content.md) (portal berita melebur ke `blog_content`), `awcms` [ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md) (rute publik `/news/**` host-resolved di sana)

## Konteks

Pertanyaannya spesifik: **apakah template ini siap mengelola situs berita di
prefix `/news/`?** Jawabannya, sebelum ADR ini: prefiksnya siap, modelnya tidak.

Menambahkan `/news/` secara mekanis memang sepele — rute `[tab]` sudah generik,
jadi satu baris di `src/config/site.ts` melahirkan `/news/` dan
`/news/<slug>/`. Yang tidak siap adalah apa yang terjadi SESUDAH prefiks itu
ada.

### 1. Seksi berita akan terurut menurut abjad

`src/lib/content.ts` mengurutkan setiap seksi dari `urutan` — bilangan yang
ditulis redaksi di `contentJson`, dengan bawaan **99** bagi artikel yang tidak
pernah dinomori. Di seksi berita tidak ada yang menomori apa pun, jadi setiap
artikel bernilai 99 dan pemecah serinya mengambil alih: **seksi terurut menurut
judul.** Berita terbaru terkubur di antara huruf.

Ironisnya `awcms` sudah menjawab ini di sisinya. Build feed dikembalikan
`created_at DESC`, dan rute publik `/news/**` miliknya sendiri memakai
`ORDER BY published_at DESC`. Adapter di sini membuang keduanya lalu mengurutkan
ulang dari field yang tidak diisi siapa pun.

### 2. Tidak ada satu halaman pun yang bisa melaporkan koreksi

`LocalizedArticle` membawa SATU tanggal, diisi `publishedAt ?? updatedAt`, dan
tiga permukaan membacanya:

- `src/lib/schema.ts` memasangnya pada `datePublished` **dan** `dateModified`;
- `src/layouts/BaseLayout.astro` memasangnya pada `article:published_time`
  **dan** `article:modified_time`;
- `src/layouts/ArtikelLayout.astro` menampilkannya berlabel "Diperbarui".

Akibatnya bertingkat. Yang paling ringan: label di halaman berbohong — nilai
yang tampil sebenarnya tanggal TERBIT. Yang paling berat: begitu `publishedAt`
terisi, `updatedAt` tidak pernah dibaca lagi, sehingga `dateModified` membeku di
tanggal terbit **selamanya**. Sebuah artikel yang dikoreksi tiga kali tetap
menyatakan dirinya tidak pernah disentuh. Untuk panduan layanan itu sudah
sayang; untuk berita, kebaruan justru satu-satunya sinyal yang dibaca.

Komentar di `src/lib/schema.ts` membela keadaan itu dengan kalimat yang benar
saat ditulis dan tidak lagi benar: *"Repo tidak menyimpan tanggal terbit
terpisah."* Repo memang tidak; `awcms` menyimpannya, di dua kolom, dan
mengembalikan keduanya di baris yang sama. Yang perlu dilakukan hanya berhenti
melipatnya.

### 3. Sebuah artikel bisa terbit di sini padahal `awcms` menyembunyikannya

Permukaan yang dipanggil build — `GET /api/v1/blog/posts?view=full` — dilayani
`listBlogPostsFullPage`, yang menyaring tenant, `deleted_at`, `status`, dan
`locale`. **Tidak ada `published_at` di sana sama sekali.** Rute publik `awcms`
sendiri menyaring `published_at IS NOT NULL AND published_at <= now()`. Jadi
sebuah post ber-`status='published'` tanpa `published_at` dijawab 404 oleh
`awcms` dan **diterbitkan** oleh situs statis — dua jawaban untuk satu
pertanyaan, dan yang salah justru yang punya URL publik.

Ini pertahanan berlapis, bukan kebocoran yang bisa didemonstrasikan: lewat jalur
tulis `awcms` hari ini sebuah baris `published` selalu membawa `published_at`
(INSERT selalu `draft`; transisi menyetel `now()`; publikasi terjadwal memakai
`COALESCE`). Menuliskannya sebagai "menutup kebocoran" akan menjadi klaim yang
tidak bisa dipertanggungjawabkan — persis kelas kesalahan yang komentar di
`src/lib/schema.ts` di atas contohkan.

### 4. Persimpangan yang harus dinyatakan, bukan dilewati

`awcms` **sudah** menyajikan `/news/**` sendiri: indeks berpaginasi, halaman
kategori, halaman tag, feed RSS/Atom/JSON di akar host, pencarian, iklan, dan
terbit-langsung-tayang tanpa rebuild. Karena keduanya host-resolved, satu domain
hanya bisa dilayani salah satunya.

Yang dipilih repo ini tidak berubah dan bukan bentuk URL-nya: **nol panggilan ke
CMS saat pembaca meminta halaman.** ADR ini tidak memindahkan pilihan itu; ia
membuat sisi statisnya benar-benar bisa dipakai untuk berita.

## Keputusan

### 1. Sebuah tab MENYATAKAN dirinya seksi berita

`src/config/site.ts` memberi setiap tab `urutanSeksi: "manual" | "terbaru"`.

Satu deklarasi, tiga akibat, karena ketiganya satu keputusan: urutannya
(`publishedAt` menurun), isi lencana kartunya (tanggal, bukan "Artikel 99"), dan
apa yang diklaim artikelnya (`NewsArticle`, bukan `Article`).

Field itu ditulis pada **setiap** tab, bukan hanya yang membutuhkannya. Bukan
karena verbose lebih baik: `as const` atas array heterogen membuat tipe
elemennya menjadi union, dan `tab.urutanSeksi` lalu menjadi properti yang tidak
ada pada sebagian anggotanya — `astro check` merah.

### 2. Urutan tetap dari field eksplisit; FIELD-nya milik seksi

Aturan ke-3 di `src/lib/content.ts` tidak dilonggarkan, ia diperjelas. Yang
dilarang aturan itu adalah bergantung pada urutan yang kebetulan dikembalikan
API. `publishedAt` adalah field eksplisit, sama seperti `urutan`.

**Yang dibaca `"terbaru"` adalah `publishedAt` artikel yang DITAMPILKAN, bukan
post sumbernya**, dan itu berbeda dari `urutan`. Alasannya: indeks seksi
menampilkan tanggal di setiap kartu, jadi mengurutkan dari kolom yang tidak
ditampilkan kartu menghasilkan daftar yang tanggalnya naik-turun tanpa sebab
yang terlihat — di `/en/`, artikel yang terjemahannya terbit Juli akan duduk di
atas artikel yang terjemahannya terbit Agustus, karena versi Indonesianya terbit
sebaliknya. Kolom yang diurutkan wajib kolom yang dilihat pembaca.

Alasan `urutan` dibaca dari SUMBER tidak berpindah ke sini: seorang penerjemah
bisa membiarkan `urutan` kosong dan diam-diam mengurutkan ulang seluruh
bahasanya, sedangkan `publishedAt` tidak pernah bisa kosong — §3 menolak
membangun post tanpanya. Yang dilepas adalah jaminan bahwa dua locale
mengurutkan seksinya sama persis; itu jujur, karena jadwal terbit keduanya
memang berbeda.

Keduanya berakhir pada **slug sumber** sebagai pemecah seri terakhir, dan itu
bukan hiasan. `Array#sort` stabil, jadi comparator yang mengembalikan 0
menyerahkan pasangannya pada urutan API — persis yang aturan ke-3 larang.
Kunci sebelumnya tidak cukup sendirian: `"terbaru"` bisa seri pada stempel yang
sama (publikasi massal menstempel satu `now()` ke setiap baris), dan `"manual"`
bisa seri pada `urutan` **dan** judul sekaligus. Slug adalah satu-satunya kunci
yang unik per artikel sekaligus identik di setiap locale, jadi sebuah seri tidak
pernah pecah ke arah yang berbeda di Bahasa Indonesia dan di English.

Comparator-nya diekspor sebagai fungsi murni (`urutkanArtikel`). Alasannya bukan
kerapian: `getArticles` memilih cabangnya dari `siteConfig.tabs`, setiap tab yang
dibawa template ini bernilai `"manual"`, dan repo template tidak punya instans
`awcms` untuk membangun apa pun. Ditulis inline, cabang `"terbaru"` akan menjadi
kode yang tidak pernah dieksekusi di repo yang memilikinya — eksekusi pertamanya
terjadi di build produksi sebuah situs turunan.

### 3. Predikat terbit `awcms` ditiru — dengan satu penyimpangan yang dinyatakan

Adapter menyaring `publishedAt !== null` di atas `status`/`visibility` yang sudah
ada. Yang **tidak** ditiru harfiah:

| Predikat `awcms` | Di sini | Alasan |
| --- | --- | --- |
| `published_at IS NOT NULL` | Ditiru persis | Post tanpa tanggal terbit dijawab 404 oleh `awcms`; menerbitkannya membuat dua permukaan tidak sepakat |
| `published_at <= now()` | Ditiru **dengan toleransi 15 menit** | Kedua stempel datang dari dua mesin: `awcms` menstempel dari jam SISI SANA — `now()` basis data pada transisi manual, jam proses aplikasi pada publikasi terjadwal — sementara perbandingan ini berjalan di jam builder. Jalur normalnya terbit → webhook → build, berjarak detik. Tanpa toleransi, builder yang tertinggal semenit membuang artikel yang baru terbit — dan di seksi berita itu kartu PERTAMA. Yang benar-benar dijaga adalah post bertanggal berhari-hari ke depan, tidak pernah yang sembilan puluh detik ke depan |
| `visibility IN ('public','unlisted')` | **Sengaja lebih ketat** | Itu predikat DETAIL `awcms`, longgar supaya tautan langsung ke post unlisted tetap hidup. Keluaran statis tidak punya keadaan "hanya lewat tautan langsung": semuanya masuk sitemap dan bisa dirayapi, jadi post unlisted yang diterbitkan di sini berhenti menjadi unlisted |
| `deleted_at IS NULL` | Tidak perlu | Build feed sudah menyaringnya di sisi `awcms` |

Penyaring yang hanya bisa MENGURANGI mendapat lantainya, bentuk yang sama dengan
gerbang media di [ADR-0025](0025-gambar-artikel-dari-media-awcms.md): satu post
tertahan adalah keadaan redaksi dan build lanjut; **nol dari sekian** bukan — itu
`awcms` yang tidak pernah menstempel `published_at`, jam yang salah melampaui
toleransi, atau bentuk respons yang berubah, dan ketiganya menerbitkan situs
yang setiap seksinya kosong tanpa ada yang gagal.

Dua urutan operasi ikut dikunci karena keduanya bisa menghijaukan kekosongan:

- Assertion `view=full` dan pemasangan terjemahan berjalan **sebelum** penyaring
  tanggal, di atas himpunan yang lebih luas. Keduanya lolos hampa pada array
  kosong, jadi menjalankannya sesudah penyaring akan mengubah "`awcms` menjawab
  ringkasan" menjadi "tidak ada yang perlu diperiksa".
- `publishedAt` yang **tidak bisa diurai** melempar, bukan mengembalikan
  `false`. Setiap perbandingan terhadap `NaN` bernilai false, jadi memperlakukan
  tanggal-yang-bukan-tanggal sebagai "belum waktunya terbit" akan membuang
  SETIAP artikel sekaligus dan terbaca seperti CMS yang masih kosong.

### 4. Dua tanggal, dari SATU baris

`LocalizedArticle` membawa `publishedDate` dan `updatedDate`, keduanya dibaca
dari post yang kata-katanya ditampilkan halaman itu.

"Satu baris" adalah bagian yang menentukan. Memasangkan tanggal terbit dari post
SUMBER dengan tanggal ubah dari TERJEMAHAN menghasilkan `dateModified`
mendahului `datePublished` pada konten yang sepenuhnya normal — artikel sumber
yang baru terbit bulan ini, terjemahannya tidak disentuh sejak bulan lalu — dan
crawler membuang blok yang menyatakan itu. `awcms` membaca keduanya dari satu
baris; repo ini ikut.

Urutan tidak terpengaruh, karena urutan tidak pernah membaca field ini: ia
membaca post sumber langsung.

`ArticleSchemaInput.updatedDate` **diganti namanya**, bukan ditemani field baru.
Menambah field opsional akan membiarkan setiap pemanggil lama tetap hijau sambil
terus memancarkan `datePublished` yang sebenarnya tanggal ubah — cacat yang
justru ada untuk ditutup. Penggantian nama itu yang memaksa `astro check`
menemukan pemanggilnya.

Sejauh mana typecheck benar-benar membantu di sini perlu dinyatakan, karena
mudah dikira lebih jauh: `articleSchema` hanya punya SATU pemanggil, dan itu
yang dimerahkannya. Permukaan kedua (`articleMeta` di `BaseLayout`) merah karena
field barunya dinyatakan wajib, bukan karena penggantian nama. Permukaan
ketiga — pembacaan `LocalizedArticle.updatedDate` yang berubah ARTI tanpa
berubah tipe — tidak bisa ditemukan typecheck sama sekali; ia ditemukan dengan
membaca, dan dijaga oleh tes.

Baris "Diperbarui" di halaman artikel kini tampil **hanya bila artikel memang
diubah setelah terbit**, dibandingkan KETAT atas nilai mentah
(`pernahDiubahSetelahTerbit`). Ketat sudah cukup karena kedua jalur terbit
`awcms` menulis `published_at` dan `updated_at` dalam SATU pernyataan dengan
nilai yang sama, sehingga artikel yang baru terbit membawa dua stempel yang
PERSIS sama — bukan yang berselisih beberapa milidetik. Membandingkan pada
tingkat tanggal justru menyembunyikan koreksi yang dilakukan di hari yang sama
dengan penerbitan, dan di situs berita koreksi jenis itulah yang paling sering
terjadi.

### 5. `NewsArticle` dengan penulis tingkat ORGANISASI

Artikel di seksi `"terbaru"` memancarkan `NewsArticle`; selainnya tetap
`Article`. Tipenya datang dari pemanggil dan tidak pernah ditebak dari isinya:
yang menentukan sebuah halaman berita atau bukan adalah seksi tempat ia
tinggal — konfigurasi situs, bukan sesuatu yang bisa disimpulkan dari judul.

`author` ikut ditambahkan, dan itu bagian dari keputusan ini, bukan pelengkap.
Mengganti string `@type` saja justru MEMISKINKAN keluaran: sampai sekarang
`articleSchema` di sini tidak punya `author` sama sekali, jadi `NewsArticle`
tanpa penulis akan lebih miskin daripada `Article` yang digantikannya. Byline
tingkat organisasi yang ditiru datang dari simpul `NewsArticle` `awcms`
(`structured-data-rendering.ts`), yang mengisinya dari nama tenant.

Ia ditulis INLINE, bukan sebagai rujukan `@id` ke simpul Organization halaman,
karena pembaca yang tidak menyelesaikan `@id` akan membaca artikel tanpa penulis
sama sekali. `publisher` **tetap** rujukan `@id`, dan itu bukan inkonsistensi
yang terlewat: ia sudah begitu sebelum ADR ini, simpul yang ditunjuknya ada di
`@graph` yang sama halaman itu juga, dan mengubahnya bukan bagian dari keputusan
ini. Yang membuat `author` berbeda adalah bahwa ia BARU — tidak ada perilaku
lama yang perlu dipertahankan — dan bahwa `author` kosong pada `NewsArticle`
adalah persis keadaan yang §5 ini ada untuk mengakhirinya.

Byline tingkat **orang** tetap tidak ada, dan alasannya milik `awcms`: repo itu
menolaknya lebih dulu, dengan catatan bahwa menaruh identitas pengguna internal
di structured data publik membuka permukaan PII baru. Kolom
`authorTenantUserId` memang ada pada baris post; meresolusinya menjadi nama
butuh permukaan `awcms` keempat, dan `tests/kontrak-awcms.test.mjs` mengeraskan
daftar tiga permukaan justru supaya penambahan seperti itu merah.

### 6. Pemeriksanya mendarat bersama aturannya

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) berlaku penuh, dan
"penuh" di sini berarti KETIGA permukaan §2 — bukan satu.

- **JSON-LD.** Keluarga baru di `scripts/audit-konten.mjs` membaca setiap simpul
  `Article`/`NewsArticle` di keluaran — sedalam apa pun di dalam `@graph`, karena
  pemindai yang hanya melihat akar akan melaporkan nol pelanggaran atas nol
  simpul dan itu terbaca persis seperti lulus — dan menuntut: kedua tanggal ada,
  keduanya bisa diurai, `dateModified` tidak mendahului `datePublished`, dan
  `author.name` terbaca.
- **Open Graph.** Keluarga kedua menuntut `article:published_time` dan
  `article:modified_time` berpasangan, terurai, dan tidak terbalik urutannya.
  Ia keluarga tersendiri karena permukaannya bukan JSON-LD dan pemasangannya
  hidup di `.astro` — yang tidak dijangkau `astro check` maupun tes mana pun,
  sehingga pelipatan yang ADR ini tutup bisa dipasang kembali di sana dengan
  kelima gerbang tetap hijau.
- **Baris tanggal di halaman.** Predikatnya diangkat keluar dari `.astro`
  menjadi `pernahDiubahSetelahTerbit` di `src/lib/tanggal.ts`, dan diuji
  langsung. Begitu juga pemilihan `Article`/`NewsArticle`, yang menjadi
  `tipeArtikelSeksi` di `src/lib/schema.ts`. Keputusan yang tinggal sebagai
  ekspresi terner di dalam `.astro` adalah keputusan yang bisa dibalik tanpa
  satu gerbang pun berubah warna.

Dua tanggal yang IDENTIK tetap hijau di kedua keluarga. Artikel yang belum
pernah dikoreksi memang membawa dua stempel yang sama, dan aturan yang bisa
dilanggar konten yang sah adalah aturan yang akan dilonggarkan orang berikutnya.

Batas yang tetap dinyatakan: kedua keluarga keluaran itu hanya berjalan SESUDAH
`bun run build`, yang di repo template tidak bisa dijalankan sama sekali. Yang
membuktikannya di sini adalah fixture dua arah di `tests/audit-konten.test.mjs`,
dan `audit:konten` menyebut setiap keluarga yang dilewatinya alih-alih diam.

## Yang TIDAK dibangun, dan kenapa

Keempatnya diperiksa ke kode lebih dulu; tidak satu pun ditolak karena "belum
sempat".

- **Feed RSS/Atom/JSON.** Ditunda, dan butuh ADR-nya sendiri. Alasan yang
  menentukan bukan biayanya melainkan bahwa **satu-satunya `.xml` yang dibaca
  gerbang mana pun adalah `sitemap*.xml`** — dan bahkan gerbang itu melewati
  setiap `<loc>` berakhiran `.xml` tanpa suara. Berkas `.xml` bernama lain tidak
  dibaca siapa pun: pemindai halaman hanya mengambil `**/*.html`. Feed
  yang menunjuk artikel yang tidak terbit, memuat nama key mentah, atau membawa
  URL relatif (ilegal di RSS) akan lolos SELURUH gerbang dengan build hijau —
  persis yang ADR-0030 larang. Menutupnya berarti keluarga gerbang baru seukuran
  seluruh ADR ini. Ditambah satu hal yang tidak bisa disiasati: header respons
  endpoint dibuang pada build statis, jadi `Content-Type: application/rss+xml`
  ditentukan ekstensi berkas oleh adapter, bukan oleh kode.
- **Paginasi indeks seksi.** Ditunda; ia mengubah BENTUK RUTE, yang menurut
  kriteria di `docs/adr/README.md` adalah kelas keputusan yang butuh ADR
  tersendiri. Ia juga menuntut hal-hal yang tidak dituntut apa pun di atas:
  judul berbeda per halaman (gerbang judul-kembar memerahkan yang sama, dan
  pelarian bakunya — `noindex` + canonical ke halaman satu — dilarang mutlak
  oleh gerbang "dua sinyal yang bertabrakan"), jumlah halaman yang wajib identik
  di setiap locale agar hreflang tetap resiprokal, dan sampel Lighthouse yang
  ikut bergeser. **Konsekuensinya dinyatakan, bukan disamarkan: sampai itu
  mendarat, indeks seksi berita merender SELURUH artikelnya dalam satu
  halaman.**
- **Arsip tag dan kategori.** Diblokir di sisi `awcms`, dan itu keputusan yang
  dinyatakan di sana: `listBlogPostsFullPage` sengaja mengeluarkan `termIds`
  karena keduanya satu query tambahan per post, yang akan mengembalikan N+1 yang
  ADR-0018 hapus. Ini keputusan performa, bukan kelalaian — jadi penolakannya
  tahan lama dan bisa diperiksa ulang pembaca berikutnya.
- **Byline seorang editor.** Lihat §5.

## Konsekuensi

- **Ketiga tab yang dibawa template ini tidak berubah perilakunya.** Semuanya
  `"manual"`, dan cabang manualnya identik dengan yang sebelumnya kecuali satu
  pemecah seri terakhir yang hanya aktif saat `urutan` DAN judul sama-sama seri
  — keadaan yang hari ini berakhir pada urutan sembarang.
- **Satu baris metadata di setiap halaman artikel berubah arti**, termasuk di
  tab lama: yang dulu berlabel "Diperbarui" sebenarnya tanggal terbit, dan kini
  benar-benar ada dua baris dengan yang kedua bersyarat.
- **Template TIDAK menambahkan tab `news`.** Repo ini cetakan, bukan situs;
  menambah tab keempat mengubah situs yang setiap turunan warisi dan menuntut
  dua belas entri katalog serta seni 16:9 untuk seksi tanpa satu artikel pun.
  Yang mendarat adalah kemampuannya. Cara sebuah situs menyatakan `/news/`
  ditulis di `docs/awcms-astro/checklist-repo-baru.md`.
- **Sebuah situs turunan yang menyatakan `"terbaru"` mewarisi batas §Yang tidak
  dibangun**: tanpa paginasi, seksi dengan ratusan artikel adalah satu halaman
  besar, dan itu harus jadi pertimbangan sebelum menyalakannya.
- **Uji ADR-0023 lolos untuk seluruh isi ADR ini.** Tidak ada permukaan `awcms`
  baru; setiap field yang dibaca sudah ada di respons `view=full` dan dibekukan
  di sisi sana. Yang butuh instans `awcms` justru yang ditolak di atas.

## Alternatif yang dipertimbangkan

- **Mengurutkan dari `createdAt` alih-alih `publishedAt`** — ditolak. Build feed
  memang dipaginasi atas `created_at` (satu-satunya urutan yang aman untuk
  cursor keyset), tetapi yang dibaca pembaca adalah kapan artikel TERBIT. Draf
  yang ditulis Januari dan diterbitkan Agustus akan muncul di bawah pada urutan
  `createdAt`. Rute publik `awcms` sendiri memakai `published_at`.
- **Menyimpulkan seksi berita dari datanya** (mis. "tab yang tak satu pun
  artikelnya punya `urutan`") — ditolak. Ia berubah diam-diam saat satu editor
  mengisi satu field, dan tidak ada halaman yang menyebutkan kenapa seluruh
  seksi tiba-tiba terurut ulang.
- **Menjadikan `urutanSeksi` opsional dengan bawaan `"manual"`** — ditolak oleh
  `astro check`; lihat §1.
- **Menjepit `updatedDate` ke `max(updatedAt, publishedAt)`** agar gerbang
  urutan tanggal tidak pernah bisa merah — ditolak. Ia menyembunyikan data yang
  tidak konsisten alih-alih menampilkannya, dan dengan kedua tanggal dibaca dari
  satu baris, keadaan yang dijepitnya tidak bisa dihasilkan jalur tulis `awcms`.
- **Membiarkan `<= now()` tanpa toleransi**, atau membuangnya sama sekali —
  keduanya ditolak; lihat tabel §3. Tanpa toleransi ia membuang artikel terbaru
  pada selisih jam yang wajar; tanpa perbandingan sama sekali, satu-satunya
  pertahanan terhadap `published_at` yang disetel di luar jalur tulis `awcms`
  ikut hilang.
- **Menyajikan berita dari `/news/**` milik `awcms` dan tidak membangun apa pun
  di sini** — tetap pilihan yang sah, dan untuk banyak situs pilihan yang lebih
  murah: di sana paginasi, arsip tag, feed, dan pencarian sudah ada, dan terbit
  langsung tayang. Ia tidak dipilih di sini karena ia menukar premis template
  ini — nol panggilan ke CMS saat pembaca meminta halaman — dengan kelengkapan.
  Yang benar adalah menyatakan persimpangannya, bukan berpura-pura hanya ada
  satu jalan.
