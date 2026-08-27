🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0049-a-reader-may-subscribe-and-the-first-write-from-a-strangers-browser.md)

<!-- i18n-source-hash: sha256:8a8971a16bf8ba38694c02caa44f4313ae623e215eeb069a8d6591b2b21d9888 -->

# ADR-0049 — Pembaca boleh berlangganan, dan itu TULISAN pertama dari peramban orang asing

- **Status:** Diterima
- **Tanggal:** 28 Agustus 2026
- **Terkait:** [ADR-0043](0043-the-readers-browser-calls-awcms-and-nothing-else-changes.id.md) (kelas panggilan peramban-pembaca), [ADR-0044](0044-what-a-page-view-may-cost-a-reader.id.md) (berapa ongkos satu kunjungan bagi pembaca), [ADR-0042](0042-a-byline-is-the-first-per-person-data-this-template-publishes.id.md) (data per-orang pertama yang DITERBITKAN template ini; ini yang pertama DIKUMPULKANNYA), `awcms` ADR-0103 (modulnya dan jawaban netralnya), `awcms` ADR-0118 (kebijakan lintas-origin yang membuatnya terjangkau), `awcms` PRD §30, Isu #79, Isu `awcms` #745

## Konteks

`awcms` menerbitkan modul `newsletter` pada 21 Agustus 2026 dengan tiga endpoint
publik anonim. Pembaca sebuah situs yang dibangun dari template ini tidak bisa
mencapai satu pun: tidak ada formulir, tidak ada halaman konfirmasi, tidak ada
halaman berhenti berlangganan.

Caller-nya mendarat di sini pada 27 Agustus di belakang `newsletterAktif =
false` yang di-hard-code, karena membaca sumber `awcms` alih-alih menduganya
menemukan **empat** hal yang membuat endpoint-nya tak terjangkau dari situs
statis — tanpa `OPTIONS` untuk preflight yang dipaksa kontrak JSON-nya sendiri,
tanpa `Access-Control-Allow-Origin`, tenant yang diselesaikan dari HOST yang
adalah CMS-nya alih-alih dari `Origin` situs, dan tautan konfirmasi yang
dibangun di origin CMS tempat halamannya tidak ada. Yang keempat berarti double
opt-in tidak pernah bekerja untuk siapa pun: `consent_at` tidak bisa ditulis,
jadi tidak ada pelanggan yang bisa menjadi `active`.

ADR-0118 `awcms` menutup keempatnya dan membekukan ketiga jalurnya sebagai
COMMITTED. Keputusan ini adalah apa yang dilakukan repo ini dengan itu.

## Keputusan

**Sebuah situs boleh menerbitkan buletin, dan menyatakannya dengan
`SITE_NEWSLETTER=true`.**

### 1. Tiga permukaan, satu deklarasi

Formulir di footer, `/newsletter/confirm`, dan `/newsletter/unsubscribe` muncul
bersama atau tidak sama sekali. Memecahnya menjadi saklar terpisah membuka
keadaan setengah-menyala yang paling berbahaya: formulir yang tautan
konfirmasinya tidak menuju ke mana-mana.

Flag-nya baru berlaku bila `AWCMS_API_URL` terisi. Ketiganya panggilan ke
`awcms` dari peramban pembaca, dan beacon memasangkan dua syarat yang sama
dengan alasan yang sama: deklarasi tanpa origin di belakangnya menerbitkan
permukaan yang tidak bisa berbuat apa-apa.

### 2. Kedua jalur halaman BUKAN milik repo ini untuk dipilih

`awcms` merangkai tautan yang ia kirim dari `NEWSLETTER_CONFIRM_PATH` dan
`NEWSLETTER_UNSUBSCRIBE_PATH` yang disambung ke origin situs. Jadi halamannya
duduk persis di `/newsletter/confirm` dan `/newsletter/unsubscribe` — bahasa
Inggris, tanpa prefiks locale, di situs yang rute lainnya bukan keduanya.
Menggantinya berarti mematikan tautan yang sudah ada di kotak masuk seseorang
dan tidak bisa ditarik kembali.

Konsekuensinya dinyatakan alih-alih disembunyikan: kedua halaman itu dirender
dalam locale BAWAAN situs. `awcms` menyimpan locale pelanggan dan mengirim
suratnya dalam bahasa itu, tetapi tidak menaruhnya di URL — jadi situs dwibahasa
mengirim pembaca berbahasa Inggrisnya ke halaman berbahasa Indonesia.
Memperbaikinya menuntut `awcms` mengubah bentuk tautannya, dan itu keputusan
repo sana.

### 3. Token dikirim saat DIKLIK, tidak pernah saat halaman dimuat

Inilah keputusan yang ongkos salahnya paling mahal, dan ia bukan soal gaya.
Pemindai tautan di klien email dan proxy antivirus mengambil setiap URL di dalam
pesan sebelum penerimanya melihatnya. Halaman yang mengirim tokennya saat dimuat
akan mencatat berhenti berlangganan yang tidak diminta siapa pun — dan, di
halaman konfirmasi, mencatat **persetujuan yang tidak pernah diberikan manusia**.
Persetujuan yang dicatat tanpa tindakan manusia bukan persetujuan, dan itulah
satu-satunya hal yang hendak dihasilkan double opt-in.

### 4. Jawaban netral dirender apa adanya, di ketiga permukaan

`awcms` menjawab kalimat yang sama untuk alamat baru, alamat yang sudah aktif,
yang di-suppress, token yang sudah terpakai, dan token yang tidak pernah ada.
Repo ini merender kalimat itu dan tidak menambahkan apa pun. Sebuah "alamat itu
sudah terdaftar" di sisi klien akan membangun ulang oracle yang ditolak
endpoint-nya, dari satu tempat yang tidak akan terpikir untuk diperiksa siapa
pun.

Dua respons tetap punya makna sendiri, dan keduanya pernyataan tentang
PERMINTAAN alih-alih tentang langganan mana pun: `400` (alamat cacat, tautan
yang terpotong) dan `429` (jaringan ini sudah terlalu sering mencoba).

### 5. Halaman privasi bertambah satu bagian saat, dan hanya saat, formulirnya ada

Alamat surel adalah data per-orang pertama yang DIMINTA situs ini dari pembaca —
ADR-0042 mencakup yang pertama diterbitkannya. Halaman privasi yang tidak
menyebutnya salah pada bagian yang paling perlu benar. Bagian itu bersyarat
dengan alasan yang sama seperti bagian beacon: situs yang tidak meminta apa pun
tidak boleh terbaca seakan meminta.

## Konsekuensi

- **Kelas peramban-pembaca tumbuh dari tiga menjadi empat, dan yang keempat
  MENULIS.** Pencarian, saran, dan beacon membaca atau menghitung; yang ini
  membuat `awcms` mengirim surat ke alamat yang diketik seseorang. Bentuk yang
  salah di sini tidak sekadar membuat halaman kosong — ia mengirimkan sesuatu,
  atau diam-diam berhenti mengirim, kepada orang yang memintanya.
- **Formulirnya dikunci selama permintaan berjalan.** Tanpa itu satu klik ganda
  menghabiskan dua dari lima slot limiter per-IP, dan yang kedua ditolak dengan
  kalimat yang tidak bisa dibedakan pembaca dari kegagalan.
- **Footer membawa satu skrip tambahan di setiap halaman.** Ia kecil, dan ia
  diukur `audit:aset` seperti segala hal lain yang diunduh pembaca.
- **Sebuah situs bisa menerbitkan formulir yang diam-diam tidak mengumpulkan
  apa-apa.** Bila tenant `awcms`-nya mematikan modul itu, endpoint-nya menjawab
  badan netral yang sama dengan keberhasilan. Tidak ada yang bisa melihat
  bedanya dari sini, dan tidak seharusnya ada yang mencoba: pemeriksaannya ada
  di layar admin CMS, tempat orang yang bisa bertindak sedang melihat.
- **Template ini sendiri tidak menerbitkan satu pun dari ini.**
  `SITE_NEWSLETTER` tidak diisi di sini, dan itu yang ditegakkan
  `tests/kontrak-awcms.test.mjs`.

## Ditolak

- **Merender formulir tanpa JavaScript.** Situsnya statis; sebuah `<form>` tanpa
  `action` yang tampil sebelum skripnya adalah kontrol yang diam saat ditekan,
  yang `AGENTS.md` §Antarmuka sebut lebih buruk daripada tidak ada kontrol sama
  sekali. Ia tersembunyi di sumber, skripnya yang membukanya, dan `<noscript>`
  mengatakannya.
- **Mengirim token saat halaman dimuat.** Lihat keputusan 3. Ia adalah beda
  antara mencatat persetujuan dan mencatat pemindai surat.
- **Memberi tahu pembaca bahwa sebuah alamat sudah terdaftar**, atau bahwa
  sebuah tautan sudah terpakai. Keduanya membangun ulang oracle enumerasi dari
  sisi klien.
- **Halaman konfirmasi berprefiks locale.** Tautannya dirangkai `awcms` tanpa
  locale; halaman berprefiks akan 404 untuk setiap pelanggan.
- **Mengirim alamat surel bersama token berhenti berlangganan.** PRD §30
  membuat keluar sebagai satu-satunya tindakan yang tidak boleh menuntut
  pembuktian identitas, dan konsumen yang "membantu" dengan menambahkan
  alamatnya justru mengembalikan tuntutan itu.
- **Formulir di dalam badan artikel.** Ia akan menyela apa yang sedang dibaca
  seseorang dan menuntut satu keputusan tata letak per jenis halaman. Footer ada
  di setiap halaman dan tidak menyela apa pun.
