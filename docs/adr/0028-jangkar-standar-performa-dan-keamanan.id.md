🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0028-jangkar-standar-performa-dan-keamanan.md)

<!-- i18n-source-hash: sha256:c48da9febdb3abf3145fa2eabddffa3d623a75b7c3c27c2c0ed520eb44c35404 -->

# ADR-0028 — Postur performa dan keamanan diikat ke standar yang disebut namanya

- **Status:** Accepted
- **Tanggal:** 4 Agustus 2026
- **Aturan pemilik:** 4 Agustus 2026 — "analisis seluruh isi repo ini, beri rekomendasi berdasarkan standar pengembangan awcms dan kaitannya dengan repo ahliweb/awcms, standar internasional aturan performa dan standar internasional aturan keamanan."
- **Terkait:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (CSP dikirim penyaji, disamakan dengan `awcms`), [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) (penyaji satu-satunya pemilik header), [ADR-0024](0024-seni-lokal-di-src-assets.md) (biaya performa yang diterima sadar), [ADR-0027](0027-penahanan-adr-0021-selesai.md) (penahanan selesai — ADR ini pekerjaan pertama sesudahnya), `awcms` [ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md) (skill digerbangi terhadap kodenya)

## Konteks

### 1. Aturannya sudah ada; namanya yang tidak

Repo ini punya CSP ketat yang benar-benar dikirim, lima header keamanan yang
dibuktikan tes, larangan HTML mentah dari CMS yang ditegakkan renderer, tenant
yang diverifikasi silang, dan empat gerbang di CI. Hampir seluruhnya memetakan
rapi ke kontrol yang sudah punya nama di luar sana — OWASP Top 10, ASVS,
Secure Headers Project, ISO/IEC 27001 Annex A, NIST SSDF.

Tidak satu pun nama itu pernah disebut di repo ini. Akibatnya dua, dan keduanya
nyata:

- Sebuah situs turunan yang ditanya "kontrol mana yang sudah dipenuhi?" tidak
  punya jawaban yang bisa dikirimkan, padahal jawabannya sebagian besar "sudah".
- Sebuah kontrol yang **tidak** dipenuhi tidak punya tempat untuk terlihat. Repo
  ini sudah mencatat lima dokumen yang menyatakan sesuatu yang tidak ada;
  kebalikannya — sesuatu yang tidak ada dan tidak pernah dicatat sebagai tidak
  ada — tidak punya satu pun pemeriksa, karena ia bukan pernyataan.

### 2. Satu selisih dari `awcms` yang ditemukan justru oleh pemetaan itu

Empat berkas di repo ini menyatakan bahwa penyaji mengirim "lima header
keamanan … disamakan dengan postur `awcms`". Kelimanya memang identik nilainya.
Yang tidak identik adalah jumlahnya: `awcms` mengirim **enam** di produksi —
`buildSecurityHeaders` di `src/lib/security/security-headers.ts` menambahkan
`Strict-Transport-Security: max-age=31536000; includeSubDomains` di balik gerbang
`isProduction`.

Repo ini tidak mengirim HSTS di lingkungan mana pun. Alasan yang terbaca masuk
akal — "TLS diterminasi Traefik, jadi itu urusan lapisan di depan" — tidak
bertahan diperiksa: Traefik tidak memasang HSTS tanpa middleware yang dinyatakan,
sehingga yang terjadi bukan "dipasang di tempat lain" melainkan **tidak dipasang
di mana pun**. Dan [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)
sudah melarang penyelesaiannya ditaruh di Traefik.

Selisih ini tidak ditemukan oleh review kode. Ia ditemukan saat kedua postur
diletakkan berdampingan di satu tabel — yang sebelum ADR ini tidak ada.

### 3. Anggaran yang tidak pernah diukur, dan target yang tidak pernah ditulis

`standar-teknis.md` menetapkan anggaran gambar (beranda ≤ 250 KB, halaman konten
≤ 100 KB) yang dibawa dari repo rujukan dan **tidak pernah diukur satu kali pun
di sini**. Ia juga mewajibkan `fetchpriority="high"` pada gambar di atas
lipatan; `src/components/Ilustrasi.astro` memasang `loading="eager"` saja.

Sementara itu tidak ada satu pun target **hasil** — LCP, INP, CLS. Anggaran byte
dan pengalaman membaca bukan hal yang sama: sebuah halaman bisa memenuhi
anggaran gambarnya dan tetap punya LCP buruk karena gambar terbesarnya diunduh
dengan prioritas rendah. Itu persis keadaan repo ini hari ini.

## Keputusan

### §A — Jangkar standar dinyatakan, dengan edisinya

[`docs/awcms-astro/standar-performa-dan-keamanan.md`](../awcms-astro/standar-performa-dan-keamanan.md)
menjadi peta antara kontrol di repo ini dan standar yang menamainya. Edisi tiap
standar ditulis eksplisit, dan **edisi OWASP disamakan dengan `awcms`** (Top 10
2021, ASVS 4.0.3), yang memetakan dirinya ke edisi itu di skill
`awcms-security-hardening`.

Menyamakan edisi bukan kerapian. Dua repo keluarga yang memetakan diri ke dua
edisi berbeda menghasilkan dua matriks yang tidak bisa dijumlahkan, dan yang
membacanya akan membaca selisih penomoran sebagai celah kontrol. Naik edisi
karena itu adalah keputusan **tingkat keluarga**: repo ini mengikuti `awcms`,
tidak mendahuluinya.

### §B — Target performa yang bisa diperiksa, ditulis sebagai target

Core Web Vitals pada p75 kunjungan nyata: **LCP ≤ 2,5 detik, INP ≤ 200
milidetik, CLS ≤ 0,1**. INP dicatat sebagai pengganti FID sejak Maret 2024
supaya dokumen yang menyebut FID kelak terbaca sebagai basi, bukan sebagai
alternatif.

Ketiganya ditulis **beserta pernyataan bahwa belum satu pun diukur.** Itu bukan
kehati-hatian berlebih: menulis target tanpa mengatakannya belum diukur adalah
persis kelas cacat yang keempat gerbang repo ini dibangun untuk menangkap.

### §C — Sembilan celah dicatat sebagai celah, dengan pemeriksanya masing-masing

Daftarnya di §Celah dokumen itu. Aturan yang mengikat penutupannya diambil utuh
dari repo ini sendiri: **aturan tanpa pemeriksanya adalah aturan yang akan
dilanggar**, dan itu berlaku juga bagi aturan yang datang dari standar luar.
Karena itu tiap baris menyebut pemeriksa yang harus ikut mendarat, dan celah 1
(HSTS) ditandai butuh ADR-nya sendiri karena ia mengubah postur keamanan.

### §D — Yang ditolak, ditolak secara tertulis

Lima kontrol yang direkomendasikan standar dan **tidak** diadopsi — pelaporan
CSP, `Cross-Origin-Resource-Policy` menyeluruh, SRI, RUM untuk mengukur Core Web
Vitals, dan rate limiting di penyaji — ditulis beserta alasannya. Tiga di
antaranya ditolak karena bertabrakan dengan larangan mengumpulkan data pembaca,
satu karena tidak menjaga apa pun tanpa sumber daya eksternal, dan satu karena
memutuskan untuk situs yang belum ada.

Tanpa daftar ini, kelimanya akan diusulkan lagi enam bulan kemudian sebagai
temuan baru — yang persis alasan ADR ada di repo ini.

### §E — Aturan 2 `awcms` ADR-0062 diserap sebagai pekerjaan

`awcms` ADR-0062 menggerbangi skill terhadap kode yang dijelaskannya, lewat tiga
aturan. Repo ini sudah memenuhi ruh aturan 1 dan 3: `bun run audit:dokumen`
memeriksa jalur berkas yang disebut `.claude/skills/` persis seperti `docs/`,
dan daftar pengecualiannya menuntut tiap entri menyebut **milik siapa** jalur itu.

Aturan 2 belum ada di sini: sebuah kutipan `ADR-NNNN` tidak diperiksa resolve ke
berkasnya. Ia terdaftar sebagai celah yang murah ditutup — gerbangnya sudah
membaca seluruh markdown repo ini dan sudah punya indeks ADR.

## Konsekuensi

**Yang didapat.** Satu selisih postur nyata dari `awcms` (HSTS) berhenti tak
terlihat. Delapan celah lain punya nama, akibat, dan pemeriksa. Sebuah situs
turunan punya jawaban yang bisa dikirimkan saat ditanya kepatuhan.

**Yang dibayar.** Sebuah dokumen yang menyatakan status kontrol adalah dokumen
yang bisa menjadi basi — kelas cacat yang repo ini paling sering temukan pada
dirinya sendiri. Yang menahannya sebagian: setiap jalur berkas dan setiap tautan
di dalamnya sudah digerbangi `bun run audit:dokumen`. Yang **tidak** tertahan:
kolom "Keadaan". Sebuah baris bisa berbunyi "Terpenuhi" setelah kontrolnya
dicabut, dan tidak ada gerbang yang bisa melihatnya. Itu dinyatakan di dokumen
itu sendiri alih-alih dibiarkan tampak terjaga.

**Yang TIDAK dilakukan.** Nol perubahan kode. Tidak satu header pun ditambahkan,
tidak satu gerbang pun dilonggarkan, tidak satu dependency pun ditambahkan.
Sembilan celah tetap terbuka dan **terbaca terbuka** — menutupnya diam-diam
bersama ADR yang menamainya akan membuat ADR ini tidak bisa dibedakan dari
pekerjaan yang mengklaim lebih dari yang dilakukannya.

## Alternatif yang dipertimbangkan

- **Menutup celah 1 (HSTS) sekalian di ADR ini.** Ditolak: ia mengubah postur
  keamanan, yang menurut kriteria [`README.md`](README.md) di direktori ini
  membutuhkan ADR-nya sendiri. Menggabungkannya berarti keputusan "kami memakai
  standar X" dan keputusan "kami mengirim header Y dengan `max-age` Z" hidup di
  satu berkas, dan yang kedua akan dicabut atau diubah jauh lebih sering
  daripada yang pertama.
- **Menaruh matriks kepatuhan di `standar-teknis.md`.** Ditolak: berkas itu
  memuat aturan yang **mengikat**, dan matriks kepatuhan memuat **status**.
  Mencampurnya membuat sebuah baris status yang membusuk terbaca sebagai aturan
  yang masih berlaku — cacat yang persis sama dengan indeks ADR yang
  mendaftarkan enam keputusan yang tak pernah ada.
- **Menyalin matriks kepatuhan `awcms` apa adanya.** Ditolak: sebagian besar
  barisnya memerikan kontrol yang tidak punya permukaan di sini (RLS, ABAC,
  idempotency, audit trail). Matriks yang sebagian besar barisnya "tidak
  berlaku" berhenti dibaca, dan bersamanya baris yang benar-benar berlaku.
- **Tidak menulis ADR sama sekali, cukup dokumennya.** Ditolak: §A dan §D adalah
  keputusan — mana edisi standar yang diikuti, dan kontrol mana yang ditolak
  beserta alasannya. Keputusan yang hanya hidup di dalam sebuah tabel akan
  dibongkar oleh orang berikutnya yang membaca tabel itu sebagai daftar
  pekerjaan.
