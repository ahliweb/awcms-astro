---
tingkat: minor
tanggal: 2026-08-04
---

# Empat aturan yang sudah tertulis akhirnya punya pemeriksa

Repo ini punya aturan yang mengikat: **aturan baru wajib membawa pemeriksanya.**
Pembacaan menyeluruh menemukan empat aturan yang sudah tertulis — sebagian sejak
berbulan-bulan — dan tidak satu pun punya pemeriksa.

Bentuknya berbeda dari sebelas cacat dokumen yang repo ini sudah catat, dan lebih
sunyi: bukan dokumen yang menyatakan sesuatu yang tidak ada, melainkan **aturan
yang benar dan tidak pernah diperiksa siapa pun.** Ketiganya yang pertama bahkan
ditulis dengan kata **wajib** — dan ketegasan itulah yang membuat semua orang
mengira ada yang memeriksanya.

## 1. Versi Bun: lima nilai, nol gerbang

`AGENTS.md` menyebutnya aturan yang tidak bisa dilanggar, lengkap dengan kata
"diam-diam". Kalimat itu menghitung **berkas**; yang harus sepakat adalah
**nilai**, dan nilainya muncul lima kali — `packageManager`, `engines.bun`, dua
`bun-version` CI, dan dua tag `Dockerfile`. Duplikat kedua di masing-masing
berkas yang paling mungkin tertinggal: letaknya jauh dari yang pertama, dan
keduanya tetap hijau sendirian.

`grep -rln "packageManager\|bun-version" tests/ scripts/` mengembalikan nol baris.

## 2. Perilis melewatkan dua gerbang yang empat dokumen tuntut

`AGENTS.md`, `CONTRIBUTING.md`, templat PR, dan checklist repo baru semuanya
menuntut `bun test` hijau dan `bun audit` nol sebelum rilis.
`scripts/rilis.mjs` — skrip yang benar-benar merilis — tidak menjalankan
keduanya.

Yang hilang bukan sekadar dua perintah. Dua lapis `bun test` **melewati dirinya
tanpa `dist/`**, jadi satu-satunya tempat keduanya bisa benar-benar berjalan
adalah sesudah build — persis titik yang dilewati perilis.

## 3. Dua repo, dua angka, dan yang satu menyusun rencana di atas angka yang lain

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

## 4. Celah 6 ADR-0028 — dan kelas cacat yang justru DITAMBAHKAN penutupannya

Empat action dipin ke SHA commit dengan komentar `# vX.Y.Z` yang Dependabot
baca; image dasar dipin ke digest dengan tag dipertahankan di depannya.

Yang perlu diketahui sebelum menyentuhnya: **saat tag dan digest sama-sama ada,
digest yang dipatuhi Docker dan tag hanya menjadi komentar.** Menaikkan tag tanpa
digest menghasilkan `Dockerfile` yang berbunyi `1.3.15` sambil membangun
`1.3.14`, tanpa satu pun kegagalan. Pin digest karena itu **menambah** satu kelas
cacat diam yang hanya gerbang nomor 1 tutup — keduanya satu paket, dan
gerbangnya memeriksanya secara khusus.

## Cara gerbangnya dibuktikan

Kelima asersi baru **mutation-proven**. Yang paling berarti: menaikkan tag tanpa
digest terbukti merah, dan menambahkan permukaan keempat ke kode terbukti merah
di dua tempat sekaligus.

Gerbang dokumen juga menangkap pelanggaran **penulis changeset ini** — empat
kalimat menyebut berkas milik `awcms` tanpa mendaftarkannya sebagai pengecualian
ber-alasan. Itu bekerja persis sebagaimana mestinya.

## Selaras dengan penilaian `awcms` hari ini

Daftar standar di `standar-performa-dan-keamanan.md` menyerap dua yang dipakai
`awcms` dan belum ada di sini — **ISO/IEC 25010** dan **RFC 5861** — serta
mencatat **OWASP API Security Top 10 2023** sebagai *tidak berlaku* beserta
alasannya. Baris "tidak berlaku, dan ini alasannya" yang membuat dua matriks
keluarga bisa dijumlahkan.

RFC 5861 (`stale-while-revalidate`) sengaja **tidak** dipakai: ia bernilai bagi
cache bersama, dan situs ini disajikan satu proses Bun tanpa cache bersama.

## Yang TIDAK dilakukan, dan kenapa rekomendasi sebelumnya dibatalkan

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
