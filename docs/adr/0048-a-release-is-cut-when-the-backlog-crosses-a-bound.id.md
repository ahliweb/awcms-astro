🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0048-a-release-is-cut-when-the-backlog-crosses-a-bound.md)

<!-- i18n-source-hash: sha256:ab4102a8fab51d08f241d575e8f8dcd716f7625804372a0c2ed4e5b4ad025568 -->

# ADR-0048 — Rilis dipotong saat backlog melewati batas, bukan saat ada yang teringat

- **Status:** Diterima
- **Tanggal:** 28 Agustus 2026
- **Terkait:** [ADR-0040](0040-changeset-menyatakan-bump-semver.id.md) (changeset menyatakan bump-nya sendiri — keputusan ini adalah separuh lainnya), [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.id.md) (rilis menulis SBOM), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.id.md) (aturan yang hanya tertulis adalah aturan yang hanyut), [ADR-0039](0039-english-is-the-source-language.id.md) (buku besar yang hanya boleh menyusut, bentuk batas yang sama), Isu #80

## Konteks

### Backlog-nya terukur, dan tidak ada yang bisa melihatnya

`v0.2.0` ditandai **8 Agustus 2026**. Pada **28 Agustus 2026** — dua puluh hari
kemudian — ada **tiga puluh changeset** menunggu di belakangnya. Sembilan di
antaranya `minor`, masing-masing kemampuan yang dilihat pembaca:

- sebuah situs menyatakan identitasnya sendiri dari CMS
- arsip kategori dan tag
- sebuah seksi berhenti merender seluruh riwayatnya ke satu dokumen — paginasi
- pembaca bisa mencari dan menyaring
- byline penulis yang opt-in
- artikel yang selesai menawarkan sesuatu berikutnya
- menu dan widget yang dikonfigurasi editor
- galeri berhenti tampil sebagai placeholder
- beacon kunjungan yang tidak meninggalkan apa pun di perangkat pembaca

Di antara entri `patch` ada dua perbaikan keamanan: **HSTS tidak pernah
benar-benar terkirim di produksi**, dan **advisory nanoid** yang ditutup lewat
override. Operator situs yang menjalankan `v0.2.0` tidak punya versi terbit yang
memuat satu pun dari keduanya.

Setiap gerbang di repo ini hijau sepanjang dua puluh hari itu. Itu bukan gerbang
yang gagal; itu ketiadaan gerbang. `audit:dokumen` membuka `.changesets/` untuk
menyelesaikan tautan, `bun test` membuka tiap berkas untuk memvalidasi
frontmatter-nya, dan tidak satu pun pernah bisa menanyakan **berapa yang
menunggu, dan sejak kapan**.

### ADR-0040 menjawab "seberapa besar", dan menyerahkan "kapan" ke ingatan

Sebelum ADR-0040 tingkat rilis diketik di baris perintah oleh siapa pun yang
menjalankan skripnya. Keputusan itu memindahkan penilaian ke penulisnya, pada
saat ia bisa menilai, dan rilis kini menurunkan versinya dari `bump` terbesar
yang menunggu. Itu separuh masalah yang memang benar diselesaikan lebih dulu.

Separuh yang ia tinggalkan adalah penjadwalan, dan penjadwalan diserahkan ke
siapa pun yang teringat. Ingatan bukan mekanisme, dan kegagalannya terlihat
persis seperti semuanya baik-baik saja — kelas cacat yang justru
[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.id.md) ada untuk
menamainya.

### Ini lebih buruk bagi template daripada bagi aplikasi

Repo ini adalah **template**. Situs diturunkan darinya lewat "Use this template"
lalu menyimpang; mereka tidak mengikuti `main`. Situs yang dimulai pada Agustus
mendapat `v0.2.0` dan tidak punya jalur naik bertag ke pencarian, ke arsip, ke
paginasi, atau ke perbaikan HSTS. `docs/awcms-astro/checklist-repo-baru.md`
menuntun operator menurunkan sebuah situs, dan selama dua puluh hari tidak ada
versi terbit yang memuat satu pun dari itu.

Sebuah aplikasi men-deploy dari `main` dan penggunanya tidak pernah melihat
nomor versi. Nomor versi sebuah template adalah satu-satunya yang dipunyai
konsumennya.

## Keputusan

**Backlog yang menunggu punya dua batas, dan melewati salah satunya adalah yang
menyatakan sebuah rilis sudah waktunya. `bun run audit:rilis` memeriksa
keduanya, dan ia berjalan di job `check` CI seperti setiap gerbang lain yang
tidak butuh build dan tidak butuh jaringan.**

### 1. Paling banyak dua belas changeset boleh menunggu

Dua belas diturunkan dari laju terukur repo ini sendiri, bukan dipilih karena
bulat: tiga puluh changeset mendarat dalam dua puluh hari setelah `v0.2.0`, jadi
dua belas kira-kira delapan hari kerja pada laju yang menghasilkan backlog yang
hendak dicegah batas ini.

Batas ini bergerak saat sebuah pull request **di-merge**, jadi yang melihatnya
memerah adalah orang yang merge-nya melewatinya.

### 2. Changeset tertua boleh berumur paling banyak empat belas hari

Dua pekan adalah waktu terlama sebuah situs turunan pantas menunggu sebelum ia
bisa **menarik** perbaikan keamanan. Kedua perbaikan keamanan di atas duduk tak
terbit selama empat belas hari; operator yang tidak bisa naik versi tidak punya
cara bertindak atas satu pun darinya.

### 3. Sebuah changeset harus membawa tanggal yang dinyatakan namanya sendiri

`.changesets/README.md` selalu menuntut `YYYY-MM-DD-ringkasan.md`, dan tidak ada
yang pernah memeriksanya. Gerbang ini sekarang memeriksanya, karena berkas yang
tidak bisa ia tanggali tidak pernah menua: ia akan duduk di backlog tak terlihat
oleh satu-satunya pemeriksa yang dibangun untuk melihatnya. Dua bentuk ditolak
dengan disebut namanya — nama tanpa awalan tanggal, dan tanggal yang tidak ada
di kalender (`2026-02-31`, yang dijawab `new Date` dengan menggulung ke Maret).
Tanggal **masa depan** ditolak juga: umurnya negatif, jadi ia tidak akan pernah
melewati batas mana pun, dan sepanjang itu ia terbaca seperti salah ketik.

### 4. Perilis TIDAK menjalankan gerbang ini

`bun run release` melipat setiap changeset yang menunggu lalu menghapusnya — ia
adalah tindakan yang membersihkan backlog. Menjalankan gerbang ini di dalam
perilis berarti menolak satu-satunya operasi yang memperbaiki apa yang
dikeluhkan gerbangnya, tepat pada rilis-rilis yang cukup besar untuk berarti.

## Konsekuensi

- **Sebuah backlog tidak bisa lagi berupa kesunyian.** Sinyal yang diminta Isu
  #80 — "backlog 22 changeset itu sendirilah sinyalnya" — sekarang dipancarkan
  mesin, bukan disadari orang.
- **Batas usia bisa memerahkan run yang tidak disebabkan siapa pun.** Tidak
  perlu commit untuk melewatinya; satu hari berlalu sudah cukup. Ini diterima di
  sini, dan alasannya adalah ongkosnya: merah itu tidak menuntut apa pun dari
  yang melihatnya, `main` tidak punya check wajib sehingga ia memberi tahu tanpa
  menghalangi merge, dan seorang maintainer membersihkannya dengan satu
  perintah.
- **Batasnya murah dipatuhi dan murah dibaca.** Gerbangnya membaca nama berkas
  di satu direktori. Ia tidak menambah build, panggilan jaringan, atau
  dependency.
- **Rilis menjadi lebih sering dan lebih kecil.** Bagian changelog berisi dua
  belas entri dibaca; yang berisi tiga puluh dilewati dengan scroll.
- **Situs turunan mewarisi batas ini dan boleh menghapusnya.** Gerbangnya
  mengatakannya alih-alih diam: tanpa direktori `.changesets/` ia mencetak bahwa
  ia tidak membaca apa pun — beda antara gerbang yang tidak menemukan apa-apa
  dan gerbang yang tidak melihat apa-apa.

## Ditolak

- **Kadensi kalender — "rilis tiap Senin kedua".** Ia gagal ke dua arah: ia
  memotong rilis kosong pada dua pekan yang sepi, dan ia tidak berkata apa-apa
  saat sembilan fitur mendarat dalam sembilan hari. Yang berarti adalah
  backlog-nya, jadi backlog-nya yang diukur.
- **Workflow terjadwal yang gagal mingguan alih-alih gerbang di `check`.** Ia
  menjaga pull request yang tak berhubungan tetap hijau — itu seluruh daya
  tariknya — dan ia menaruh satu-satunya sinyal di tempat yang harus didatangi
  orang. Kegagalan yang hendak diakhiri keputusan ini justru sinyal yang tidak
  didatangi siapa pun.
- **Batas jumlah saja.** Tiga puluh entri itu berisik, tetapi dua entri `patch`
  yang memuat perbaikan keamanan bisa menunggu sebulan tanpa pernah mencapai
  batas jumlah. Usia yang benar-benar dialami operator.
- **Batas usia saja.** Satu hari saja bisa menghasilkan rilis yang layak
  dipotong; laju terukur di sini satu setengah changeset per hari.
- **Pintu darurat — env var atau berkas penanda untuk membungkam gerbangnya.**
  Sebuah bypass tanpa masa berlaku menjadi konfigurasi, dan sesudah itu
  gerbangnya hijau di atas backlog yang tidak diukur siapa pun. Pintu daruratnya
  adalah memotong rilisnya.
- **Menghalangi merge dengannya.** `main` tidak punya branch protection, dan
  menambahkannya untuk ini akan mengubah sinyal penjadwalan menjadi penghalang
  bagi persis pull request yang akan memperbaikinya. Merah di sini adalah
  informasi.
