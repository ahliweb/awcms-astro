🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0047-this-origin-answers-its-own-content-redirects-and-the-edge-keeps-the-rest.md)

<!-- i18n-source-hash: sha256:e44209f270b851c219d9dd11dd2e5b8a362a0168cd5b6fc7853834c279360f4f -->

# ADR-0047 — Origin ini menjawab pengalihan kontennya sendiri, dan edge memegang sisanya

- **Status:** Diterima
- **Tanggal:** 27 Agustus 2026
- **Terkait:** `awcms` ADR-0114 (edge memegang 301 legacy), `awcms` ADR-0111 (redirect persis milik tenant mengalahkan rewrite keluarga yang dipensiunkan), `awcms` ADR-0071 (kosakata URL publik dibelah per repo), `awcms` PRD §9.2 (tidak ada rantai lebih panjang dari satu lompatan), [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.id.md), [ADR-0032](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.id.md), Isu #77

## Konteks

### Origin ini tidak bisa menjawab satu pun pengalihan, dan itu diukur

Bukan "belum dikonfigurasi" — **tidak ada kodenya**. `astro.config.mjs` memakai
`output: "static"` tanpa kunci `redirects`, tidak ada berkas middleware, dan
`server/penyaji.mjs` tidak memuat satu pun kemunculan `301` atau `Location`.

`awcms` tidak menduganya; ia mengukurnya. ADR-0114-nya memutar-ulang **67 aturan
redirect yang sudah di-commit terhadap server hasil build repo ini dan mendapat
404 pada setiap satunya, dengan nol header `Location`.**

Aturan-aturan itu ditulis ke `awcms_seo_redirects`, yang diterapkan di satu
tempat saja — `src/middleware.ts` di aplikasi **itu** — sementara targetnya
`/kategori/**`, rute yang dilayani **di sini**. Aturan yang ditulis di sana tidak
pernah dikonsultasi untuk permintaan yang tidak pernah tiba di sana. ADR-0071
membelah kosakata URL publik satu keluarga per repo; kemampuan redirect-nya tidak
pernah ikut dibelah.

### Kewajibannya ditarik; celahnya tidak

`awcms` ADR-0116 menarik kewajiban memigrasikan arsip legacy 25.029 artikel,
jadi cutover spesifik yang menyingkap ini tidak lagi dikerjakan. Yang secara
eksplisit **tidak** ditarik ADR-0116 adalah mekanikanya: *"ADR-0114 — edge
memegang 301-nya; sebuah artikel diselesaikan lewat digit awalnya. Tidak
berubah."*

Jadi ini tidak lagi mendesak, dan celah polosnya tetap ada: sebuah situs yang
dibangun dari template ini **tidak punya jawaban apa pun** untuk URL yang dulu
bekerja — tab yang diganti nama, artikel yang di-slug ulang, seksi yang digabung
ke seksi lain. Hari ini itu adalah 404 milik pembaca dan peringkat yang hilang,
tanpa mekanisme selain infrastruktur yang tidak dijelaskan repo ini.

### Dan pilihannya dibuat di repo lain, tentang repo ini

`awcms` ADR-0114 memilih edge, dengan alasan hanya edge yang bisa meruntuhkan
`http→https` + `www→apex` + `legacy→baru` menjadi satu lompatan yang dituntut
PRD §9.2. Penalaran itu benar dan tidak dibantah di sini.

Yang hilang adalah bahwa **tidak ada apa pun di sini yang mengatakannya.**
`docs/deploy-coolify.md` menjelaskan seluruh jalur deploy dan tidak menyebut satu
lapis redirect pun. Operator yang mengikuti dokumentasi template ini sendiri
tidak tahu ke mana redirect mereka seharusnya.

## Keputusan

**Tanggung jawabnya dibelah, dan tiap separuhnya diletakkan di tempat ia bisa
dibuktikan.**

### 1. ORIGIN menjawab pengalihan konten

Slug yang diganti, seksi yang digabung, halaman yang pindah. Repo ini tahu
tentang perubahan itu karena repo ini yang membuatnya.

`src/config/pengalihan.mjs` memegang peta jalur persis; `server/penyaji.mjs`
menjawab `301` darinya **sebelum** kompresi dan sebelum handler aplikasi.
Keduanya ada di repositori ini, yang berarti keduanya ditinjau, diversikan, dan
**digerbangi** — dan itulah separuh yang memikul beban keputusan ini. Prinsip
ADR-0032 berlaku langsung: gerbang yang tidak bisa dibuktikan di tempat ia
ditulis akan membusuk. Konfigurasi edge tidak bisa diuji `bun test`.

### 2. EDGE memegang normalisasi protokol dan host, serta migrasi domain legacy

`http→https`, `www→apex`, dan memindahkan seluruh domain terindeks ke domain
baru. Hanya edge yang melihat ketiganya, dan hanya edge yang bisa meruntuhkannya
menjadi satu lompatan. Ini tidak membantah `awcms` ADR-0114 — ia justru sepakat
dengannya tentang KELAS redirect yang sedang diputuskan ADR itu.

### 3. Jalur persis, tidak pernah pola

Sebuah pola bisa mengalihkan halaman yang masih hidup, dan penulisnya tidak akan
tahu sampai ada pembaca yang gagal sampai. `sql/060` di `awcms` mengambil
keputusan yang sama untuk tabelnya, dengan alasan yang sama.

Prefiks locale ditulis eksplisit. Menurunkannya berarti menebak locale mana yang
pernah menerbitkan halaman lama itu, dan tebakan yang salah menerbitkan
pengalihan menuju 404 yang pasti.

### 4. Tiga aturan atas peta, masing-masing dengan pemeriksanya

`tests/pengalihan.test.mjs` menolak:

- **Rantai.** Target yang juga menjadi kunci berarti dua lompatan. Mesin
  pencari membagi ekuitas tiap lompatan dan sebagian berhenti mengikuti setelah
  beberapa.
- **Putaran.** `/a/` → `/a/` adalah tab browser yang menggantung.
- **Target atau kunci non-kanonik.** Build ini memancarkan
  `{tab}/{slug}/index.html`; sitemap-nya mendaftarkan bentuk berakhiran garis
  miring dan setiap `<link rel="canonical">` menamainya. Mengalihkan ke ejaan
  non-kanonik menukar satu 404 dengan halaman yang menyangkal dirinya sendiri,
  dan KUNCI non-kanonik sama sekali tidak pernah cocok — aturan yang penulisnya
  kira bekerja.

### 5. Peta template ini sendiri KOSONG

Sebuah template tidak punya sejarah URL, jadi tidak punya apa pun untuk
dialihkan. Contoh yang ditinggalkan di sini akan tersalin ke setiap situs turunan
sebagai pengalihan **hidup** menuju halaman yang tidak pernah ada.

## Konsekuensi

- Sebuah situs bisa mengganti nama seksi tanpa meninggalkan setiap tautan dan
  setiap peringkat yang dimilikinya.
- `301`, bukan `308`: yang dipertaruhkan adalah ekuitas pencarian, dan `301`
  adalah kode yang dipahami setiap crawler. Pelestarian metode milik `308` tidak
  berarti apa-apa untuk situs statis yang menjawab `GET` dan `HEAD`.
- **Query dibawa serta.** Pembaca yang tiba dari kampanye tidak kehilangan
  atribusinya karena halamannya pindah.
- Sebuah pengalihan tetap respons, jadi header keamanan tetap berlaku padanya —
  diasersi, karena celah header di jalur yang jarang diuji adalah celah yang
  tidak dilihat siapa pun.
- Tidak ada berkas baru yang wajib disalin `Dockerfile`. Petanya modul yang
  di-inline `bun build` ke `dist/server/penyaji.mjs`, sengaja berbeda dari
  `asal-media.json`: yang itu membawa nilai yang diambil dari awcms saat build
  dan tidak bisa di-inline, dan Dockerfile yang melupakannya adalah jebakan yang
  sudah didokumentasikan repo ini.

## Ditolak

- **Edge saja, mengikuti `awcms` ADR-0114 persis.** Benar untuk kelas redirect yang
  diputuskan ADR itu, dan salah sebagai jawaban umum untuk sebuah template: ia
  menaruh satu kemampuan yang paling sering dibutuhkan sebuah situs ke dalam
  lapis yang tidak bisa diuji, tidak bisa diversikan, dan tidak dijelaskan repo
  ini.
- **Origin saja.** Edge memang satu-satunya tempat yang bisa meruntuhkan
  protokol + host + path menjadi satu lompatan. Mengklaim sebaliknya di sini akan
  membuat PRD §9.2 mustahil dicapai dan membantah pengukuran yang sudah diambil
  `awcms`.
- **Aturan pola atau regex.** Lihat keputusan 3.
- **Mengalihkan jalur tak cocok ke `/`.** Ia akan menghapus sinyal 404 dan
  membuat setiap tautan mati terlihat seperti tautan hidup.
