🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md)

<!-- i18n-source-hash: sha256:d676a06e1535d31ff2ee0bfeb98d73bae89a5fdc2de809b742a14c52df819def -->

# ADR-0035 — Feed Atom per seksi berita, dan gerbang atas setiap `.xml` di keluaran

- **Status:** Accepted
- **Tanggal:** 8 Agustus 2026
- **Menindaklanjuti:** [ADR-0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md) §Yang TIDAK dibangun
- **Berlaku bersama:** [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md), [ADR-0032](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md)

## Konteks

[ADR-0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)
menurunkan seksi berita dan menunda feed. Yang menarik dari penundaan itu bukan
keputusannya melainkan **alasannya**, yang ditulis sebagai temuan alih-alih
sebagai biaya:

> satu-satunya `.xml` yang dibaca gerbang mana pun adalah `sitemap*.xml` — dan
> bahkan gerbang itu melewati setiap `<loc>` berakhiran `.xml` tanpa suara.
> Berkas `.xml` bernama lain tidak dibaca siapa pun: pemindai halaman hanya
> mengambil `**/*.html`.

Kalimat itu diperiksa ulang ke kode sebelum ADR ini ditulis, dan ia benar
seluruhnya. Konsekuensinya: sebuah feed yang menunjuk artikel yang sudah
dicabut, memuat nama key PO mentah sebagai judul, membawa URL relatif (ilegal
di Atom maupun RSS), atau menyatakan dirinya diperbarui pada jam build akan
**lolos kelima gerbang repo ini dengan build hijau**. Itu keadaan yang persis
dilarang [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md).

Jadi yang menentukan bukan "apakah feed berguna" — ia berguna, dan seksi berita
tanpa feed adalah seksi berita yang hanya bisa diikuti dengan membuka situsnya
setiap hari. Yang menentukan adalah bahwa menerbitkannya menuntut keluarga
gerbang baru seukuran seluruh ADR ini. Keluarga itulah yang mendarat di sini,
dan feed-nya menumpang di atasnya.

## Keputusan

### 1. Sebuah seksi berita menerbitkan feed Atom, dan hanya bila ia punya isi

Dua syarat, keduanya di `seksiPunyaFeed()`:

- **Hanya seksi `"terbaru"`.** Seksi `"manual"` diurutkan posisi redaksi, dan
  "yang terbaru" di dalamnya tidak berarti apa-apa. Langkah 1 sebuah panduan
  akan terdorong ke setiap pelanggan setiap kali panduannya disunting, dan
  halaman berumur tiga tahun yang memang milik puncak seksi akan sampai sebagai
  kabar hari ini.
- **Hanya seksi yang berisi artikel.** Atom mewajibkan `<updated>` pada feed,
  dan satu-satunya nilai yang tersedia untuk seksi kosong adalah **jam build** —
  angka yang repo ini sudah tolak untuk `lastmod` sitemap, dengan alasan yang
  sama persis: memberi tahu perayap bahwa segalanya berubah pada tiap deploy itu
  tidak benar, dan mereka berhenti mempercayainya. Seksi kosong karena itu tidak
  menerbitkan berkas sama sekali, dan halamannya tidak memasang tautan
  penemuan-otomatis ke berkas yang tidak ada.

URL-nya `/{tab}/feed.xml` di locale default dan `/{lang}/{tab}/feed.xml` di
locale berprefiks — bentuk yang sama dengan setiap rute lain, jadi ia tidak
mengubah bentuk rute yang sudah ada. `feed.xml` adalah segmen statis sementara
`[...slug]` di direktori yang sama adalah parameter rest, jadi rute feed menang
tanpa perlu diurutkan. Artikel yang benar-benar ber-slug `feed.xml` pun tidak
bertabrakan: format build `directory` menulisnya ke `{tab}/feed.xml/index.html`.

### 2. Atom 1.0, bukan RSS 2.0 — karena yang diwajibkan spesifikasi adalah yang bisa digerbangi

Bukan karena Atom "lebih modern". Yang menentukan: **RSS 2.0 nyaris tidak
mewajibkan apa pun.** Judul opsional, tanggal opsional, `guid` opsional, tautan
boleh relatif. Sebuah feed RSS yang rusak tetap "valid", dan gerbang atasnya
hanya bisa memeriksa hal-hal yang kebetulan ada — yang berarti gerbang yang
diamnya tidak bisa dibedakan dari kelulusan.

Atom mewajibkan `id`, `title`, dan `updated` pada feed maupun pada setiap entry,
dan mewajibkan setiap IRI absolut. Setiap kalimat di §4 di bawah adalah tuntutan
yang sudah ada di spesifikasinya; tidak satu pun aturan dikarang repo ini.

Alasan kedua, lebih kecil tetapi nyata di sini: tanggal Atom adalah RFC 3339,
yaitu string `toISOString()` yang **persis sama** dengan yang sudah dipancarkan
JSON-LD dan `article:published_time`. Satu representasi tanggal di seluruh
build, bukan dua yang bisa menyimpang. RSS menuntut RFC 822, yang akan menjadi
pemformat kedua di repo yang locale bawaannya bukan bahasa Inggris.

### 3. Feed membawa RINGKASAN, bukan isi artikel

`<summary type="text">` berisi `description` yang sama dengan
`meta name="description"` halamannya. Mengirim `bodyHtml` penuh berarti
menerbitkan markup — `<img>`, tautan, atribut — ke permukaan yang tidak dilewati
CSP mana pun ([ADR-0019](0019-csp-ketat-dikirim-penyaji.md)), tidak dibaca
gerbang aset mana pun, dan dirender ulang oleh setiap pembaca feed dengan aturan
sanitasinya masing-masing.

**Konsekuensinya dinyatakan, bukan disamarkan:** pelanggan feed membaca ringkasan
lalu mengklik, dan tidak bisa membaca artikel penuh di dalam pembacanya.

`<author>` adalah nama organisasi, sama dengan `author` pada JSON-LD artikel
(ADR-0033 §5). Byline seorang editor tidak ada di sini karena `awcms` menolaknya
lebih dulu sebagai permukaan PII — bukan karena Atom tidak punya tempatnya.

### 4. Keluarga gerbang atas SETIAP `.xml` di keluaran, bukan atas `feed.xml`

Ini bagian yang paling penting, dan alasannya bukan kelengkapan. Yang ditemukan
ADR-0033 bukan "feed tidak diperiksa" melainkan **"berkas `.xml` bernama lain
tidak dibaca siapa pun"**. Sebuah gerbang yang hanya mencari `feed.xml` akan
mengulangi celah yang sama persis pada nama berikutnya.

`scripts/audit-konten.mjs` karena itu memindai `**/*.xml` di `dist/client`,
mengecualikan `sitemap*.xml` yang sudah punya gerbangnya, dan **setiap sisanya
wajib berupa feed Atom yang sah** — atau dilaporkan sebagai berkas yang tidak
dibaca gerbang mana pun. Yang terakhir itu temuannya sendiri, bukan kelalaian
yang didiamkan.

Yang dituntut, masing-masing beserta bentuk kegagalannya bila tidak dituntut:

| Tuntutan | Yang terjadi tanpa ia |
| --- | --- |
| `<id>`, `<title>`, `<updated>` pada feed | Feed yang kehilangan judulnya sendiri lulus karena entry-nya punya judul |
| `<link rel="self">` berbunyi alamat feed itu sendiri | Setiap pelanggan baru disimpan ke alamat lain, yang mungkin tidak ada |
| Sedikitnya satu `<entry>` | Berkas feed yang mengumumkan seksi kosong sebagai langganan |
| Setiap `href` dan `<id>` absolut | Ilegal di Atom; tiap pembaca menyelesaikannya terhadap basis berbeda, sebagian menyerah |
| Tanggal berbentuk **RFC 3339**, bukan "apa pun yang `new Date` terima" | `2026-08-01` sah di JavaScript, melanggar Atom, dan entry-nya dibuang sebagian pembaca **tanpa satu pesan pun** |
| `<updated>` entry tidak mendahului `<published>` | Sebagian pembaca mengurutkan dengan `updated`; entry itu menetap di puncak selamanya |
| Entry terurut dari yang terbaru | Sebagian pembaca menampilkan apa adanya, dan entry lama terbaca sebagai kabar terbaru |
| `<updated>` feed = `<updated>` entry terbaru | Jam build; pelanggan berhenti memercayai stempelnya sama sekali |
| Tautan entry menunjuk halaman yang ADA di keluaran | Artikel yang dicabut redaksi tetap tinggal di feed, menunjuk 404, di pembaca setiap orang yang sudah menerimanya |
| Nama key PO tidak bocor ke judul/ringkasan | Kelas cacat yang sama dengan di HTML — hanya saja di sini tidak ada satu mata manusia pun yang akan melihatnya |
| Feed diumumkan sedikitnya satu halaman | Langganan yang hanya bisa ditemukan dengan menebak URL-nya |
| Tautan penemuan-otomatis membawa `title` | Pembaca feed menampilkan URL mentah, atau judul HALAMAN, sebagai nama langganan |
| Tautan feed menunjuk berkas yang benar-benar feed | Gerbang tautan mati tidak bisa melihat ini: berkasnya ADA, ia hanya bukan feed |
| Feed TIDAK terdaftar di sitemap | Lihat §5 |

### 5. Feed keluar dari sitemap, dan itu bukan kerapian

Sebuah sitemap mendaftarkan **halaman**; feed adalah representasi kedua dari
halaman seksi yang sudah terdaftar sendiri. Yang membuatnya bukan sekadar
selera: gerbang sitemap melewati setiap `<loc>` berakhiran `.xml` tanpa suara —
ia menganggapnya indeks sitemap — sehingga entri feed yang salah akan tidak
terlihat di satu-satunya tempat yang memeriksa sitemap.

Karena itu dua sisi: `astro.config.mjs` menyaringnya keluar, dan gerbang feed
menuntutnya tidak ada di sana.

### 6. `Content-Type` dipasang penyaji — dan klaim "tidak bisa disiasati" dikoreksi

ADR-0033 menutup daftar penundaannya dengan satu kalimat yang berbunyi mutlak:

> Ditambah satu hal yang tidak bisa disiasati: header respons endpoint dibuang
> pada build statis, jadi `Content-Type: application/rss+xml` ditentukan
> ekstensi berkas oleh adapter, bukan oleh kode.

**Bagian pertamanya benar dan tetap benar.** Bagian keduanya tidak lengkap: di
repo ini yang menyajikan berkas adalah `server/penyaji.mjs`
([ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)), jadi
lapisan yang membuang header itu justru lapisan yang kita miliki — dan
ADR-0016 sudah memutuskan bahwa header respons ditentukan di berkas itu, bukan
di dua tempat. `tipeIsi()` memasang `application/atom+xml; charset=utf-8` untuk
setiap path berakhiran `/feed.xml`.

Yang hilang tanpa itu bukan kompatibilitas — setiap pembaca feed menerima
`application/xml` yang dikirim adapter — melainkan **pernyataan**: `application/xml`
tidak memberi tahu siapa pun bahwa berkas itu langganan, sehingga browser dan
perkakas yang memutuskan dari tipe memperlakukannya sebagai XML sembarang.

**Batasnya dinyatakan:** yang menjamin tipe ini hanyalah penyajian oleh
`server/penyaji.mjs`. Situs turunan yang menaruh `dist/client` di belakang CDN
atau host statis orang lain kembali mendapat `application/xml` dari host itu,
dan tidak ada yang bisa dilakukan repo ini soal itu selain mengatakannya.

### 7. Pemeriksanya mendarat bersama aturannya, dan di sini itu menuntut dua sisi

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) berlaku penuh, dan
keluarga ini memikul beban yang sama dengan celah 10: **template menyatakan nol
seksi berita**, jadi `bun run build` di repo ini tidak akan pernah menghasilkan
satu berkas feed pun — bahkan seandainya ia punya sumber konten. Gerbang feed
karena itu tidak pernah menemukan berkas untuk diperiksa di repo tempat ia
ditulis.

Tiga berkas menjawabnya dari tiga sisi, dan ketiganya perlu:

- **`tests/feed.test.mjs`** — pembangunnya sebagai fungsi murni: bentuk yang
  dihasilkan, dan enam penolakan yang membuatnya melempar alih-alih menerbitkan
  feed cacat.
- **`tests/audit-konten.test.mjs`** — gerbangnya atas pohon fixture sungguhan,
  tiap tuntutan dibuktikan **dua arah**. **Mutation-proven: 16 mutasi
  dijalankan satu per satu, 16 memerahkan tes yang berbeda.**
- **`tests/kontrak-awcms.test.mjs`** — **sambungannya**. Pembangun dan pemeriksa
  yang keduanya benar tidak menjamin apa pun bila perekatnya mengirim kolom yang
  salah; blok baru di sana merakit feed dari respons `awcms` tiruan dan menuntut
  URL absolut, kedua stempel tanggal terpisah, dan ringkasan yang datang dari
  `metaDescription`. Kedua **rute** ikut dipanggil langsung — `getStaticPaths`
  dan `GET` — karena keduanya hanya berjalan saat `astro build` menemukan seksi
  berita, yang tidak pernah terjadi di sini.

`tests/penyaji.test.mjs` menutup sisi header: `tipeIsi()` dua arah (feed
mendapat tipenya, sitemap dan halaman tidak), dan satu respons sungguhan yang
membuktikan nilai itu MENANG atas tipe yang ditulis handler — tanpa itu seluruh
fungsinya benar dan tidak berpengaruh apa pun.

## Yang TIDAK dibangun, dan kenapa

- **Feed RSS 2.0 dan JSON Feed di samping Atom.** Ditolak, bukan ditunda. Format
  kedua berarti keluarga gerbang kedua dengan tuntutan yang berbeda, untuk
  audiens yang sama — setiap pembaca feed arus utama membaca Atom. Yang
  bertambah cuma permukaan yang bisa menyimpang dari saudaranya.
- **Feed situs-lebar** (`/feed.xml` yang menggabungkan seluruh seksi). Ditunda,
  dan alasannya bukan biaya: sebuah situs yang seksinya campuran — panduan yang
  manual dan berita yang terbaru — akan mengirim setiap suntingan panduan ke
  pelanggan berita. Ia baru masuk akal bila ada situs yang seluruh seksinya
  berita, dan pada hari itu bentuknya bisa diputuskan dari kasus nyata.
- **Paginasi feed** (`rel="next"`/`rel="prev"` Atom). Ditunda bersama paginasi
  indeks seksi, yang masih menunggu ADR-nya sendiri (ADR-0033 §Yang TIDAK
  dibangun). Sampai keduanya mendarat, sebuah feed memuat SELURUH artikel
  seksinya — sama seperti halaman indeksnya.
- **`<content>` penuh.** Lihat §3; itu penolakan, bukan penundaan.
- **WebSub/PubSubHubbub.** Menambah layanan pihak ketiga ke jalur terbit, yang
  menurut `docs/adr/README.md` adalah kelas keputusan yang butuh ADR-nya
  sendiri, dan yang manfaatnya nol sampai ada pelanggan yang memintanya.

## Konsekuensi

- **Template tidak berubah perilakunya.** Ketiga tabnya tetap `"manual"`, jadi
  nol berkas feed lahir dan nol tautan penemuan-otomatis dipasang. Yang mendarat
  kemampuannya — dan gerbangnya, yang berjalan pada setiap `bun test` di sini.
- **Setiap situs turunan yang menyatakan sebuah tab `"terbaru"` mendapat
  feed-nya seketika**, di seluruh locale sekaligus, tanpa menyentuh satu berkas
  pun. Kedua rute membaca `daftarFeed()` yang sama, jadi feed tidak bisa muncul
  di satu locale dan hilang di locale lain.
- **Setiap berkas `.xml` yang kelak diterbitkan siapa pun di repo ini sekarang
  harus melewati sebuah gerbang.** Itu biaya yang disengaja: menerbitkan
  `opensearch.xml` atau sitemap berita menuntut keputusan sadar dan gerbangnya
  sendiri, alih-alih berkas yang mendarat tanpa ada yang memeriksanya.
- **`bun run audit:konten` sekarang menyebut keluarga feed** saat ia melewatinya,
  sama seperti keluarga keluaran lainnya. Gerbang yang diam saat tidak menemukan
  apa pun tidak bisa dibedakan dari gerbang yang lulus.

## Alternatif yang dipertimbangkan

- **Menerbitkan feed tanpa keluarga gerbangnya**, mengandalkan validator luar —
  ditolak. Validator tidak berjalan di CI, tidak tahu artikel mana yang terbit
  di build ini, dan tidak bisa melihat nama key PO yang bocor. Bentuk
  kegagalannya adalah build hijau dengan feed yang salah, yang persis alasan
  ADR-0033 menundanya.
- **Menggerbangi hanya `feed.xml`** — ditolak; ia mengulangi celah yang ditemukan
  ADR-0033 pada nama berkas berikutnya. Lihat §4.
- **Memakai `@astrojs/rss`** — ditolak. Ia menambah dependency untuk merangkai
  tiga puluh baris XML, dan yang dibawanya bukan hanya kode: bentuk keluarannya
  menjadi milik pihak lain, sementara gerbang di sini menuntut bentuk yang
  spesifik. `scripts/sbom.mjs` mendarat tanpa dependency baru dengan alasan yang
  sama ([ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md)).
- **Menerbitkan feed juga untuk seksi `"manual"`** — ditolak. Lihat §1; ia
  mengirim halaman berumur tiga tahun sebagai kabar hari ini setiap kali
  seseorang memperbaiki satu salah ketik.
- **Menerbitkan feed kosong untuk seksi berita yang belum berisi** — ditolak.
  Satu-satunya `<updated>` yang tersedia adalah jam build, dan langganan yang
  tidak pernah membawa apa pun sambil terus mengaku baru diperbarui adalah
  langganan yang dicabut pembacanya.
- **Memasang `Content-Type` lewat penamaan berkas `.atom`** (yang memang
  dipetakan `application/atom+xml` oleh pustaka MIME) — ditolak. Ia memindahkan
  keputusan header ke ekstensi berkas, tempat tidak ada komentar yang bisa
  menjelaskannya, dan `.atom` adalah ekstensi yang lebih jarang dikenali
  perkakas daripada `.xml`. Keputusan header tinggal di `server/penyaji.mjs`,
  tempat ADR-0016 menaruhnya.
