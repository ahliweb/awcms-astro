# awcms-astro — Standar Performa dan Keamanan

Peta antara kontrol yang benar-benar berjalan di repo ini dan **standar
internasional yang menamainya**, beserta daftar celah yang jujur.

Dokumen ini tidak menambah satu pun aturan baru. Aturannya sudah ada — di
[`AGENTS.md`](../../AGENTS.md), [`standar-teknis.md`](standar-teknis.md), dan
enam belas ADR. Yang belum ada adalah **nama luar** bagi aturan-aturan itu, dan
ketiadaan nama itu punya dua akibat yang nyata:

1. Sebuah situs yang dibangun dari template ini tidak bisa menjawab
   "kontrol mana yang sudah Anda penuhi?" saat ditanya auditor, pengadaan, atau
   calon mitra — padahal jawabannya sebagian besar "sudah".
2. Sebuah celah yang belum ditutup tidak punya tempat untuk **terlihat**.
   Repo ini sudah menemukan lima dokumen yang menyatakan sesuatu yang tidak ada
   ([`awcms-astro-gerbang`](../../.claude/skills/awcms-astro-gerbang/SKILL.md));
   kebalikannya sama berbahayanya — kontrol yang tidak ada dan tidak pernah
   dicatat sebagai tidak ada.

**Status tiap baris di bawah diverifikasi ke berkas, bukan diasumsikan.** Baris
yang tidak bisa diverifikasi ditulis `belum diukur`, bukan `terpenuhi`.

## Standar yang diikat

| Standar | Edisi yang dipakai | Mengatur | Mengikat di sini lewat |
| --- | --- | --- | --- |
| OWASP Top 10 | 2021 | Kategori risiko aplikasi web | Matriks di bawah |
| OWASP ASVS | 4.0.3 (L1/L2) | Verifikasi kontrol per kategori | V5, V9, V14 di bawah |
| OWASP Secure Headers Project | berjalan | Header respons HTTP | [`server/penyaji.mjs`](../../server/penyaji.mjs) |
| ISO/IEC 27001 | 2022, Annex A | Kontrol yang menyentuh kode | Matriks di bawah |
| NIST SSDF | SP 800-218 v1.1 | Praktik rantai pasok perangkat lunak | `.github/`, `bun.lock`, `Dockerfile` |
| OWASP API Security Top 10 | 2023 | Risiko khas API | **Tidak berlaku** — repo ini tidak MENYAJIKAN API. Disebut supaya paritas dengan `awcms` bisa dibaca, bukan ditebak |
| ISO/IEC 25010 | 2023 | Model mutu produk (performa, kompatibilitas, keandalan) | Kompatibilitas/interoperabilitas: gerbang permukaan di §Hubungan dengan `awcms` |
| Core Web Vitals | LCP · INP · CLS | Performa yang dirasakan pembaca | §Performa |
| RFC 9111 (+ RFC 5861) | HTTP Caching, `stale-while-revalidate` | Semantik `Cache-Control` | [`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs) |
| WCAG | 2.1 AA (2.2 AA untuk permukaan Jualanku) | Aksesibilitas | [`standar-teknis.md`](standar-teknis.md#aksesibilitas) |

**Daftar ini sengaja disamakan dengan penilaian `ahliweb/awcms` 4 Agustus 2026** (`docs/awcms/repo-assessment-2026-08-04.md`), yang mengukur dirinya terhadap ISO/IEC 25010, RFC 9111/5861, Core Web Vitals, OWASP Top 10 2021, OWASP API Security Top 10 2023, ASVS 4.0, dan ISO/IEC 27001:2022 Annex A. Dua di antaranya tidak ada di daftar sini sampai hari ini, dan satu (API Security Top 10) tidak berlaku di sini — ia tetap dicatat, karena baris "tidak berlaku, dan ini alasannya" adalah yang membuat dua matriks keluarga bisa dijumlahkan.

**RFC 5861 (`stale-while-revalidate`) sengaja TIDAK dipakai.** Ia bernilai bagi cache BERSAMA; situs ini disajikan satu proses Bun di belakang Traefik tanpa cache bersama, sehingga direktif itu hanya akan menambah satu janji yang tak ada yang menepati. Sebuah situs yang menaruh CDN di depannya punya alasan berbeda — dan itu keputusan situs, bukan template.

**Edisi OWASP Top 10 dan ASVS sengaja disamakan dengan `ahliweb/awcms`**, yang
memetakan kontrolnya ke Top 10 2021 dan ASVS 4.0.x di skill
`awcms-security-hardening`. Berpindah edisi adalah keputusan **tingkat
keluarga**: dua repo yang memetakan diri ke dua edisi berbeda menghasilkan dua
matriks yang tidak bisa dijumlahkan, dan yang membacanya akan mengira selisihnya
adalah celah. Bila `awcms` naik edisi, repo ini mengikutinya — bukan
mendahuluinya.

## Header respons — dan satu selisih nyata dari `awcms`

Yang benar-benar dikirim [`server/penyaji.mjs`](../../server/penyaji.mjs), dan
dibuktikan [`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs):

| Header | Nilai di sini | Nilai di `awcms` | Rekomendasi OWASP Secure Headers |
| --- | --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; `script-src`/`style-src` tanpa `'unsafe-inline'`; `img-src` + origin media | sama, plus hash skrip tema dan origin Turnstile bila aktif | Wajib |
| `X-Content-Type-Options` | `nosniff` | `nosniff` | Wajib |
| `X-Frame-Options` | `DENY` | `DENY` | Wajib (bersama `frame-ancestors`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | sama | Wajib |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), payment=()` | sama persis | Wajib |
| `Strict-Transport-Security` | `max-age=31536000`, digerbangi produksi | `max-age=31536000; includeSubDomains`, digerbangi produksi | Wajib |
| `Server` / `X-Powered-By` | **dihapus**, dan ketiadaannya diasersi | — | Wajib tidak membocorkan versi |
| `Cross-Origin-Opener-Policy` | tidak dikirim | tidak dikirim | Dianjurkan |
| `Cross-Origin-Resource-Policy` | tidak dikirim | tidak dikirim | Dianjurkan |

**Sampai 4 Agustus 2026 repo ini mengirim LIMA, dan empat berkas menyebutnya
"disamakan dengan postur `awcms`".** Kelimanya memang identik nilainya; yang
tidak identik adalah jumlahnya. Alasan yang terbaca masuk akal — TLS diterminasi
Traefik, jadi "itu urusan lapisan di depan" — tidak bertahan diperiksa: Traefik
tidak memasang HSTS tanpa middleware yang dinyatakan, jadi yang terjadi bukan
"dipasang di tempat lain" melainkan **tidak dipasang di mana pun**.

[ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)
menutupnya. Dua hal di dalamnya yang perlu diketahui sebelum menyentuh baris
itu:

- **Gerbang produksinya bukan kerapian.** HSTS tidak bisa dibatalkan dari sisi
  situs, dan ia berlaku untuk HOST — bukan untuk situs. Di `localhost` yang
  terkunci bukan hanya pratinjau ini melainkan setiap proyek lain yang
  dikembangkan pemilik mesin di `http://localhost:<port>`, selama setahun.
  Asersi yang menjaganya karena itu **terbalik arah**: yang diuji adalah HSTS
  TIDAK dikirim di luar produksi.
- **`includeSubDomains` sengaja tidak ikut, berbeda dari `awcms`.** `awcms` satu
  deployment yang operatornya tahu subdomainnya; template ini berjalan di domain
  milik organisasi yang hampir pasti punya layanan lain di subdomain lain, dan
  direktif itu memaksa semuanya HTTPS-saja selama setahun. Sebuah situs yang
  subdomainnya memang seluruhnya HTTPS boleh menambahkannya — di penyaji, lalu
  perbarui tesnya.

## OWASP Top 10 (2021) → permukaan repo ini

Situs dari template ini **statis**: tanpa basis data, tanpa sesi, tanpa form,
tanpa mutasi. Sebagian besar kategori karena itu tidak berlaku — dan menuliskan
"tidak berlaku" beserta **alasannya** lebih berguna daripada menghilangkan
barisnya, karena alasan itulah yang berhenti benar begitu sebuah situs menambah
permukaan terautentikasi.

| # | Kategori | Keadaan di sini | Bukti / catatan |
| --- | --- | --- | --- |
| A01 | Broken Access Control | Tidak berlaku pada permukaan publik | Tidak ada objek per-pengguna. Yang tersisa: kebocoran **antar tenant** saat build — dijaga asersi tenant di [`src/lib/awcms/tenant.ts`](../../src/lib/awcms/tenant.ts) |
| A02 | Cryptographic Failures | Terpenuhi | TLS milik Traefik; token build tidak pernah masuk keluaran (tanpa prefiks `PUBLIC_`); **HSTS dikirim di produksi** sejak [ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md) |
| A03 | Injection | Terpenuhi | Tidak ada jalur HTML mentah: [`src/lib/content-blocks.ts`](../../src/lib/content-blocks.ts) menyusun tiap elemen dari teks ter-escape dan tag tetap; `set:html` hanya menerima keluarannya. Dijaga [`tests/content-blocks.test.mjs`](../../tests/content-blocks.test.mjs) |
| A04 | Insecure Design | Terpenuhi | Static-by-default adalah keputusan ber-ADR ([ADR-0014](../adr/0014-rendering-campuran-dan-bff-portal.md)), bukan default yang kebetulan. Pemotongan konten diam-diam diperlakukan sebagai **kegagalan** di [`src/lib/content.ts`](../../src/lib/content.ts) |
| A05 | Security Misconfiguration | Terpenuhi | Enam header di produksi, CSP ketat dikirim penyaji ([ADR-0019](../adr/0019-csp-ketat-dikirim-penyaji.md), [ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)); `Server`/`X-Powered-By` dihapus; tanpa secret di repo; image non-root |
| A06 | Vulnerable Components | Terpenuhi | `bun audit --audit-level=low` di job `check` CI; Dependabot mingguan; `bun install --frozen-lockfile` di CI dan di image; gerbang lockfile `bun run check:lockfile` |
| A07 | Identification & Auth Failures | Tidak berlaku | Tidak ada login. Kredensial build adalah kredensial **mesin** yang ditolak bila berbentuk token sesi manusia — [`src/lib/awcms/tenant.ts`](../../src/lib/awcms/tenant.ts) |
| A08 | Software & Data Integrity | Sebagian | `bun.lock` di-commit dan digerbangi dua lapis. **Action GitHub dipin ke tag, bukan SHA commit; image dasar dipin ke tag, bukan digest** — §Celah |
| A09 | Logging & Monitoring | Di luar cakupan | Proses penyaji tidak menulis log permintaan dan **tidak boleh** mulai menulisnya tanpa ADR: log akses berisi IP pembaca, dan larangan mengumpulkan data pribadi pembaca berlaku penuh |
| A10 | SSRF | Tidak berlaku | Satu-satunya URL keluar adalah `AWCMS_API_URL` dari env tepercaya, dipakai hanya saat build. Tidak ada input pembaca yang menjadi URL |

## OWASP ASVS 4.0.3 — kategori yang benar-benar punya permukaan di sini

| Kategori | Butir yang relevan | Keadaan |
| --- | --- | --- |
| V5 Validation & Encoding | Output encoding pada tiap sink | Terpenuhi. Astro meng-escape secara bawaan; satu-satunya `set:html` menerima keluaran `renderContentBlocks` dan tidak pernah string dari sumber lain |
| V9 Communications | TLS di produksi | Terpenuhi — TLS milik Traefik, HSTS dikirim penyaji di produksi (ADR-0029) |
| V14.4 HTTP Security Headers | CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | Terpenuhi dan **dibuktikan tes**, bukan diperiksa mata |
| V14.4 | Header yang membocorkan teknologi (`Server`, `X-Powered-By`) | Terpenuhi — dihapus `pasangHeader`, dan ketiadaannya diasersi atas tiga kelas respons |
| V14.5 Validate HTTP Request Header | Tidak berlaku | Permintaan tidak dipetakan ke berkas oleh kode repo ini — itu milik adapter `@astrojs/node`, dan [`AGENTS.md`](../../AGENTS.md) melarang menulisnya ulang justru karena kelas cacat traversal sudah selesai di sana |

## ISO/IEC 27001:2022 Annex A — kontrol yang menyentuh kode

Hanya kontrol yang bisa dibuktikan dari repo. Kontrol kebijakan, personel, dan
fisik di luar cakupan sebuah template.

| Kontrol | Bagaimana dipenuhi di sini |
| --- | --- |
| A.8.8 Manajemen kerentanan teknis | `bun audit` di CI + Dependabot; batas peer yang penting ditulis eksplisit di `.github/dependabot.yml` karena `bun install` **memperingatkan** peer mismatch alih-alih menolaknya |
| A.8.9 Manajemen konfigurasi | Satu tempat konfigurasi (`src/config/site.ts` + `.env`); tiap variabel yang dibaca kode wajib ada di `.env.example` beserta konsekuensi salah isi |
| A.8.24 Kriptografi | Di luar cakupan repo (TLS milik Traefik, hashing milik `awcms`) |
| A.8.25 Secure development lifecycle | ADR untuk keputusan; changeset per iterasi; empat gerbang di CI |
| A.8.28 Secure coding | [`AGENTS.md`](../../AGENTS.md) §Keamanan, dengan tiap aturan menyebut cacat yang dijaganya |
| A.8.31 Pemisahan lingkungan | Asersi `AWCMS_TENANT_ID` menggagalkan build saat token staging terpasang di deployment produksi — persis kelas kesalahan yang kontrol ini ada untuk mencegah |
| A.5.7 / A.8.16 Threat intelligence & monitoring | **Tidak dipenuhi, dan sebagian sengaja.** Log akses berisi IP pembaca; lihat A09 di atas |

## NIST SSDF (SP 800-218 v1.1) — praktik yang berlaku untuk template

| Praktik | Keadaan |
| --- | --- |
| PS.1 Lindungi seluruh bentuk kode | Terpenuhi — branch protection + review; tidak ada commit langsung ke `main` |
| PS.2 Sediakan mekanisme verifikasi integritas rilis | **Celah** — rilis bertag tanpa SBOM dan tanpa attestation |
| PW.4 Gunakan komponen pihak ketiga yang aman | Terpenuhi — lockfile di-commit, install ter-freeze, audit di CI |
| PW.7 Review kode | Terpenuhi — PR + CI wajib hijau |
| PW.8 Uji kode yang dieksekusi | Terpenuhi — empat gerbang, dan tiap gerbang yang **melewati dirinya mengatakannya** |
| RV.1 Identifikasi kerentanan secara berkelanjutan | Sebagian — Dependabot + `bun audit`. **Tidak ada analisis statik (CodeQL)**, sementara `awcms` punya |

## Performa

### Target yang sebelumnya tidak pernah ditulis

Repo ini punya anggaran gambar (beranda ≤ 250 KB, halaman konten ≤ 100 KB) tetapi
**tidak satu pun target hasil yang dirasakan pembaca**. Anggaran byte dan
pengalaman membaca bukan hal yang sama: sebuah halaman bisa memenuhi anggaran
gambarnya dan tetap punya LCP buruk karena gambar terbesarnya diunduh dengan
prioritas rendah.

Target Core Web Vitals, diukur pada **p75 kunjungan nyata**, bukan pada satu
jalankan Lighthouse di laptop pengembang:

| Metrik | Ambang "baik" | Kenapa ia yang dipilih untuk situs ini |
| --- | --- | --- |
| LCP — Largest Contentful Paint | ≤ 2,5 detik | Elemen terbesar di halaman ini hampir selalu ilustrasi artikel; pembacanya di jaringan yang tidak dapat diandalkan |
| INP — Interaction to Next Paint | ≤ 200 milidetik | Menggantikan FID sejak Maret 2024. Situs ini nyaris tanpa JS, jadi ambang ini seharusnya terpenuhi dengan lapang — dan bila tidak, itu sinyal ada JS yang menyelinap masuk |
| CLS — Cumulative Layout Shift | ≤ 0,1 | Bingkai gambar sudah `aspect-ratio: var(--ratio-visual)`, jadi ruangnya dipesan sebelum gambar tiba. Yang bisa merusaknya: font yang dimuat belakangan — dan repo ini tidak memuat satu pun |

**Belum ada satu pun dari ketiganya yang diukur.** Menuliskannya sebagai target
tanpa mengatakan itu akan menjadi tepat kelas cacat yang gerbang di repo ini
dibuat untuk menangkap. Rekomendasi pengukurannya di §Celah.

### Yang sudah benar, dan kenapa

| Keputusan | Akibat performa | Di mana |
| --- | --- | --- |
| Tanpa webfont — `system-ui` sebagai `--font-sans` | Nol permintaan font, nol FOIT/FOUT, nol kontribusi ke CLS. Ia dicatat sebagai keputusan **privasi** di [`src/styles/global.css`](../../src/styles/global.css); ia juga keputusan performa | `src/styles/global.css` |
| Tanpa framework UI, tanpa framework CSS | JS terkirim mendekati nol pada sebagian besar halaman | [`standar-teknis.md`](standar-teknis.md#stack) |
| `compressHTML: true` | HTML lebih kecil sebelum kompresi transport | `astro.config.mjs` |
| Kompresi respons memakai pustaka matang | Bukan hanya gzip: `compression` v1.8 menegosiasikan **Brotli** (RFC 7932) saat browser memintanya, dan Brotli mengalahkan gzip sekitar 15–20% pada HTML | [`server/penyaji.mjs`](../../server/penyaji.mjs) |
| `Cache-Control` dua aturan | Aset ber-hash `immutable` satu tahun; HTML `max-age=0, must-revalidate` sehingga rebuild langsung terlihat. Keduanya sesuai RFC 9111, dan keduanya **dibuktikan tes** — termasuk paritas GET/HEAD yang pernah membuat `curl -I` melaporkan nilai yang salah | [`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs) |
| Konten ditarik saat build | Nol panggilan ke CMS saat pembaca meminta halaman; situs tetap tayang saat `awcms` mati | [ADR-0018](../adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md) |
| Media di-resolve **sekali per build** | Situs 300 artikel × 2 locale tidak berubah menjadi ratusan permintaan HTTP saat render | [`src/lib/content.ts`](../../src/lib/content.ts) |

### Biaya yang diterima sadar, dan tidak boleh dibaca sebagai kelalaian

[ADR-0024](../adr/0024-seni-lokal-di-src-assets.md) memilih `import.meta.glob`
dengan `query: "?url"` alih-alih `astro:assets`. Konsekuensinya dinyatakan di
sana dan diulang di sini karena ia biaya **performa**, bukan biaya bentuk kode:
raster tidak di-encode ulang dan **tidak ada `srcset`**, sehingga sebuah ponsel
360px mengunduh berkas yang sama dengan desktop 1920px.

Yang membuatnya bisa diterima: seni lokal template ini SVG, dan gambar artikel
datang dari media `awcms` yang menyajikan berkas yang diunggah editor. Yang
membuatnya **berhenti** bisa diterima: sebuah situs yang mengisi
`src/assets/` dengan foto raster besar. Situs seperti itu perlu menimbang ulang
ADR-0024 untuk dirinya sendiri — dan anggaran gambar di
[`standar-teknis.md`](standar-teknis.md#performa) adalah tempat pertama
kelebihannya akan terlihat.

## Celah: lima ditutup, empat terbuka

Diurutkan menurut akibat, bukan menurut usaha. **Lima ditutup pada 4 Agustus
2026**, masing-masing bersama pemeriksanya — di repo ini aturan tanpa
pemeriksanya adalah aturan yang akan dilanggar, dan itu berlaku juga untuk
aturan yang datang dari standar luar.

Baris yang tertutup **tetap di tabel**. Dihapus, ia akan diusulkan lagi sebagai
temuan baru enam bulan kemudian, dan pemeriksanya akan dilonggarkan oleh orang
yang tidak tahu kenapa ia ada.

| # | Celah | Keadaan | Pemeriksa |
| --- | --- | --- | --- |
| 1 | `Strict-Transport-Security` tidak dikirim | **DITUTUP** — [ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md): digerbangi produksi, tanpa `includeSubDomains` | Tiga asersi di `tests/penyaji.test.mjs`, **mutation-proven**. Yang terpenting arahnya terbalik: HSTS **tidak** dikirim di luar produksi — sebuah gerbang yang hanya memeriksa "header ada" akan hijau pada versi yang mengunci setiap `localhost` pengembang selama setahun |
| 2 | `fetchpriority="high"` tidak ada pada gambar di atas lipatan | **DITUTUP** — [`Ilustrasi.astro`](../../src/components/Ilustrasi.astro) memasangnya saat `hero`. `loading="eager"` saja tidak cukup: prioritas bawaan sebuah `<img>` tetap Low sampai layout membuktikan ia di viewport | Gerbang `performa` di `scripts/audit-konten.mjs`: setiap `<img loading="eager">` di `dist/client` wajib membawa `fetchpriority="high"`. Diperiksa di KELUARAN, sehingga `<img>` yang tidak lewat komponen ikut tertangkap |
| 3 | Anggaran gambar tidak punya pemeriksa | **DITUTUP** — 250 KB beranda, 100 KB halaman konten, diukur untuk pertama kalinya sejak angka itu ditulis | Gerbang `performa`: menjumlahkan byte gambar yang benar-benar DITERBITKAN build ini, per halaman. Media `awcms` tidak ada di `dist/client` sehingga tidak ikut tertimbang — batas yang disengaja, dan disebut di skripnya |
| 4 | `awcmsGet` tanpa batas waktu | **DITUTUP** — `AbortSignal.timeout`, bawaan 30 detik, diubah lewat `AWCMS_API_TIMEOUT_MS` | Dua asersi di `tests/kontrak-awcms.test.mjs`, **mutation-proven**: tiruan yang menerima koneksi lalu tidak pernah menjawab (melepas sinyalnya membuat tes itu menggantung, persis cacat aslinya), dan nilai batas cacat yang DITOLAK alih-alih diam-diam jatuh ke bawaan |
| 5 | Header pembocor teknologi tidak diverifikasi | **DITUTUP** — `Server` dan `X-Powered-By` dihapus `pasangHeader`, bukan sekadar diasersi: "tidak dikirim hari ini" dan "tidak akan dikirim" adalah dua hal berbeda | Asersi negatif atas tiga kelas respons di `tests/penyaji.test.mjs`, **mutation-proven** |
| 6 | Action GitHub dipin ke tag, image dasar dipin ke tag | **DITUTUP** — [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md): empat action dipin ke SHA commit dengan komentar `# vX.Y.Z` yang Dependabot baca, image dasar dipin ke digest | `tests/versi-toolchain.test.mjs`, **mutation-proven**. Ia menutup kelas cacat yang justru DITAMBAHKAN pin digest: saat tag dan digest sama-sama ada, digest yang dipatuhi Docker dan tag hanya jadi komentar |
| 7 | Tidak ada analisis statik | **TERBUKA, dan alasannya lebih tajam daripada "permukaannya kecil"** — CodeQL tidak mengurai `.astro`, jadi ia hanya akan mencakup `src/lib/**.ts`, `scripts/**.mjs`, dan `server/**.mjs`. Menyalakannya lalu menyebut repo ini "dianalisis statik" adalah upacara yang terlihat seperti cakupan — pola yang kedua repo keluarga sudah tolak | Workflow CodeQL terjadwal, dengan cakupannya DINYATAKAN di ringkasan run |
| 8 | Core Web Vitals tidak diukur | **TERBUKA** — target di §Performa masih klaim tanpa bukti. Celah 2 dan 3 menutup dua PENYEBAB LCP buruk; keduanya bukan pengukurannya | Lighthouse CI atas `dist/client` di job `build`, hanya berjalan bila situs punya sumber konten |
| 9 | Tidak ada SBOM pada rilis | **TERBUKA** — konsumen hilir tidak bisa menjawab "apakah rilis ini terdampak advisory X" tanpa membangun ulang | Langkah di `scripts/rilis.mjs` |

**Empat yang tersisa dibiarkan terbuka dengan sadar, bukan karena kehabisan
waktu.** Tiga (6, 7, 9) menyentuh rantai pasok dan menuntut keputusan tooling
yang lebih baik diambil sekali untuk kedua repo keluarga daripada dua kali dengan
hasil berbeda. Celah 8 menuntut Chrome di CI dan hanya berjalan pada situs yang
punya sumber konten — ia **tidak bisa dibuktikan di repo template ini**, dan
gerbang yang tidak bisa dibuktikan di tempat ia ditulis adalah gerbang yang akan
membusuk.

## Yang sengaja TIDAK diadopsi

Sama pentingnya untuk ditulis: sebuah kontrol yang direkomendasikan standar dan
**ditolak dengan alasan** tidak akan diusulkan lagi enam bulan kemudian sebagai
temuan baru.

- **Pelaporan CSP (`report-to` / `report-uri`).** Ia mengirim laporan berisi URL
  yang sedang dibuka pembaca ke sebuah pengumpul. Repo ini melarang mengumpulkan
  data pembaca, dan larangan itu tidak punya pengecualian "tapi ini untuk
  keamanan". Sebuah situs yang punya pengumpul miliknya sendiri boleh
  menambahkannya lewat ADR di repo situsnya.
- **`Cross-Origin-Resource-Policy: same-origin` menyeluruh.** Ia akan memblokir
  situs lain menyematkan gambar dari situs ini — perilaku yang mungkin diinginkan
  sebagian situs dan pasti tidak diinginkan sebagian yang lain. Ia bukan default
  yang aman untuk sebuah **template**, dan menaruhnya di sini berarti memutuskan
  untuk situs yang belum ada.
- **Subresource Integrity.** Tidak ada satu pun sumber daya lintas-origin yang
  dimuat halaman ini. SRI tanpa sumber daya eksternal adalah atribut yang tidak
  menjaga apa pun.
- **Analytics berbasis RUM untuk mengukur Core Web Vitals.** Ia mengumpulkan data
  pembaca. Celah 8 di atas karena itu diarahkan ke pengukuran **lab** di CI, dan
  keterbatasannya dinyatakan: lab mengukur halaman, bukan pembaca.
- **Rate limiting dan WAF.** Milik Traefik/Coolify, bukan milik proses penyaji.
  Menaruhnya di sini berarti dua tempat yang memutuskan hal yang sama.

## Hubungannya dengan `ahliweb/awcms`

> **Dua repo, dua angka — dan yang satu menyusun rencana di atas angka yang
> lain.** Penilaian `awcms` 4 Agustus 2026 (`docs/awcms/repo-assessment-2026-08-04.md`
> §4) mencatat repo ini memanggil **enam** permukaannya, lalu merekomendasikan
> snapshot kontrak konsumen atas keenamnya. Repo ini memanggil **tiga**;
> `GET /api/v1/blog/posts/{id}` dihapus [ADR-0018](../adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md),
> `GET /api/v1/auth/session` milik BFF yang belum ada, dan
> `POST /api/v1/access/machine-credentials` adalah cara MANUSIA menerbitkan
> token — bukan panggilan build.
>
> Selisihnya bukan sekadar angka: kontrak yang membekukan tiga permukaan yang
> tidak dikonsumsi mengikat repo sana pada bentuk yang repo sini tidak pernah
> butuh, sambil membuat "kontraknya terjaga" terasa lebih lengkap daripada
> kenyataannya. Sejak [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)
> daftar di sisi sini **diekstrak dari kode dan digerbangi dua arah**, jadi ia
> bisa dipercaya sebagai sumber — dan permukaan keempat tidak bisa mendarat
> diam-diam.

Repo ini **mengonsumsi** `awcms` dan tidak menyajikan API apa pun, jadi sebagian
besar kontrol keluarga — RLS, ABAC default-deny, idempotency, audit trail, HMAC
sinkronisasi — ditegakkan di sana dan tidak punya padanan di sini. Yang
**bukan** berarti tidak relevan: keputusan `awcms` mengubah apa yang benar di
sini, dan tiga di antaranya baru.

| Keputusan `awcms` | Akibatnya di repo ini |
| --- | --- |
| ADR-0049/0050 — kredensial mesin + serah-terima sesi BFF | Sudah diserap: tenant dari token, tanpa header tenant ([ADR-0018](../adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md)) |
| ADR-0059 — rute konten publik host-resolved (`/news/**`) | **Belum diserap, dan bukan pekerjaan kode.** `awcms` kini bisa menyajikan konten publiknya sendiri di domain tenant. Itu membuat "kapan memakai `awcms-astro` alih-alih rute publik `awcms`" menjadi pertanyaan nyata — dijawab di [`README.md`](README.md#kapan-memilih-awcms-astro), dan jawabannya tidak berubah: yang dipilih di sini adalah **nol panggilan ke CMS saat pembaca meminta halaman**, bukan bentuk URL-nya |
| ADR-0061 — permukaan host-resolved boleh di-cache di tepi | Tidak berlaku langsung: situs ini tidak melewati Varnish. Yang **berlaku** adalah alasannya — 404 yang bisa di-cache adalah kanal observasi kedua. Repo ini tidak punya cabang 404 yang membedakan tenant, jadi kelas cacat itu tidak bisa terjadi di sini |
| ADR-0062 — skill digerbangi terhadap kode yang dijelaskannya | **Sudah sebagian, dan celahnya sekarang bernama.** `bun run audit:dokumen` memeriksa jalur berkas yang disebut `.claude/skills/` persis seperti `docs/`. Yang belum: aturan 2 ADR-0062 — setiap `ADR-NNNN` yang dikutip harus resolve ke berkasnya |

Celah ADR-0062 itu layak ditutup dan murah: gerbangnya sudah membaca seluruh
markdown repo ini, sudah punya indeks ADR, dan sudah tahu membedakan milik repo
ini dari milik repo lain. Ia terdaftar sebagai pekerjaan di
[ADR-0028](../adr/0028-jangkar-standar-performa-dan-keamanan.md).

## Cara memakai dokumen ini di sebuah situs turunan

Tiga baris berubah artinya begitu template ini menjadi sebuah situs:

1. **Setiap "belum diukur" menjadi pertanyaan yang harus dijawab.** Di repo
   template, gerbang keluaran melewati dirinya karena tidak ada sumber konten.
   Di sebuah situs itu berarti gerbangnya **tidak berjalan**.
2. **Celah 1 (HSTS) menjadi milik situsmu**, bukan milik template — sampai
   template menutupnya. Sampai saat itu, pasang HSTS di Traefik situsmu dan
   catat di ADR bahwa kamu melakukannya di sana, supaya penggantinya kelak tidak
   memasang dua sumber kebijakan yang saling menimpa.
3. **Batas Jualanku berbeda.** Permukaan terautentikasi bertarget WCAG 2.2 AA dan
   membawa kembali seluruh kategori OWASP yang di atas ditulis "tidak berlaku" —
   A01, A07, dan A09 khususnya. Prasyaratnya di
   [`jualanku/04-kesiapan.md`](jualanku/04-kesiapan.md).
