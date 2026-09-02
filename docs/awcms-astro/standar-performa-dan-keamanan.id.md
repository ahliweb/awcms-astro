🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](standar-performa-dan-keamanan.md)

<!-- i18n-source-hash: sha256:628726c172dafaf5d4a14f53fa3d6a4347168b7a1300087b05bcaaec271a5440 -->

# awcms-astro — Standar Performa dan Keamanan

Peta antara kontrol yang benar-benar berjalan di repo ini dan **standar
internasional yang menamainya**, beserta daftar celah yang jujur.

Dokumen ini tidak menambah satu pun aturan baru. Aturannya sudah ada — di
[`AGENTS.md`](../../AGENTS.md), [`standar-teknis.md`](standar-teknis.md), dan
dua puluh empat ADR. Yang belum ada adalah **nama luar** bagi aturan-aturan itu, dan
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
| WCAG | 2.1 AA (2.2 AA untuk setiap permukaan terautentikasi: BFF Jualanku maupun admin USER) | Aksesibilitas | [`standar-teknis.md`](standar-teknis.md#accessibility) |

**Daftar ini sengaja disamakan dengan penilaian `ahliweb/awcms` 4 Agustus 2026** (`docs/awcms/repo-assessment-2026-08-04.md`), yang mengukur dirinya terhadap ISO/IEC 25010, RFC 9111/5861, Core Web Vitals, OWASP Top 10 2021, OWASP API Security Top 10 2023, ASVS 4.0, dan ISO/IEC 27001:2022 Annex A. Dua di antaranya tidak ada di daftar sini sampai hari ini, dan satu (API Security Top 10) tidak berlaku di sini — ia tetap dicatat, karena baris "tidak berlaku, dan ini alasannya" adalah yang membuat dua matriks keluarga bisa dijumlahkan.

**RFC 5861 (`stale-while-revalidate`) sengaja TIDAK dipakai.** Ia bernilai bagi cache BERSAMA; situs ini disajikan satu proses Bun di belakang Traefik tanpa cache bersama, sehingga direktif itu hanya akan menambah satu janji yang tak ada yang menepati. Sebuah situs yang menaruh CDN di depannya punya alasan berbeda — dan itu keputusan situs, bukan template.

**Edisi OWASP Top 10 dan ASVS sengaja disamakan dengan `ahliweb/awcms`** —
dan sejak 4 Agustus 2026 pin itu punya alamat: `awcms` ADR-0068 menuliskannya
sebagai keputusan keluarga (Top 10 2021, ASVS 4.0.3, API Security 2023,
ISO 27001:2022, SSDF v1.1 — kelimanya ditinjau ulang 2027-02-04; ISO/IEC
25010:2023 dipakai kedua repo tetapi TIDAK termasuk pin itu), menggantikan keadaan sebelumnya di mana pin hanya hidup di skill
`awcms-security-hardening` tanpa ADR, tanpa tanggal tinjau, tanpa pemilik.
Berpindah edisi adalah keputusan **tingkat keluarga**: dua repo yang memetakan
diri ke dua edisi berbeda menghasilkan dua matriks yang tidak bisa dijumlahkan,
dan yang membacanya akan mengira selisihnya adalah celah. Bila `awcms` naik
edisi lewat ADR penggantinya, repo ini mengikutinya — bukan mendahuluinya.

## Header respons — dan satu selisih nyata dari `awcms`

Yang benar-benar dikirim [`server/penyaji.mjs`](../../server/penyaji.mjs), dan
dibuktikan [`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs):

| Header | Nilai di sini | Nilai di `awcms` | Rekomendasi OWASP Secure Headers |
| --- | --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; `script-src`/`style-src` tanpa `'unsafe-inline'`; `img-src` + origin media; `connect-src` + origin `awcms` bila kotak pencarian diterbitkan (ADR-0043) | sama, plus hash skrip tema dan origin Turnstile bila aktif | Wajib |
| `X-Content-Type-Options` | `nosniff` | `nosniff` | Wajib |
| `X-Frame-Options` | `DENY` | `DENY` | Wajib (bersama `frame-ancestors`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | sama | Wajib |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), payment=()` | sama persis | Wajib |
| `Strict-Transport-Security` | `max-age=31536000`, digerbangi produksi | `max-age=31536000; includeSubDomains`, digerbangi produksi | Wajib |
| `Server` / `X-Powered-By` | **dihapus**, dan ketiadaannya diasersi | — | Wajib tidak membocorkan versi |
| `Cross-Origin-Opener-Policy` | tidak dikirim | `same-origin` (sejak 4 Agustus 2026) | Dianjurkan |
| `Cross-Origin-Resource-Policy` | tidak dikirim | `same-origin` (sejak 4 Agustus 2026) | Dianjurkan |

Dua baris terakhir adalah selisih baru dan **disengaja di kedua sisi**: `awcms`
memasang keduanya untuk memagari sesi admin terautentikasinya, dan komentar di
kodenya sendiri (`src/lib/security/security-headers.ts`) menyatakan alasan itu
TIDAK menular ke template ini — situs publik statis yang gambarnya justru boleh
disematkan situs lain, dan yang tidak punya sesi untuk dipagari COOP. Rincian
penolakannya di §"Yang sengaja TIDAK diadopsi". Sejak 5 Agustus 2026 selisih
ini **bukan lagi sekadar dua dokumen yang kebetulan sepakat**: `awcms` ADR-0069
mencatatnya sebagai divergence bernama ber-`reviewDate` 2027-02-04 di manifest
kompatibilitas keluarganya, satu kohort dengan divergence HSTS repo ini —
artinya ia kembali ke meja pada tanggal itu alih-alih membusuk, dan tidak ada
yang akan "memperbaikinya" ke arah paritas tanpa membaca alasannya lebih dulu.

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

**Pemicunya punya nama, dan ia bisa dibaca dari satu berkas.** Seluruh baris
"tidak berlaku" di bawah bersandar pada `permukaanAdmin` yang KOSONG di
[`src/config/site.ts`](../../src/config/site.ts) dan nol rute `prerender = false`.
Sebuah situs yang menyatakan permukaan admin USER
([ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md))
membatalkan premis itu, dan A01/A07/A09 kembali berlaku bersama CSRF, sesi, dan
pemisahan cache. Itu berlaku untuk permukaan Jualanku maupun permukaan admin
USER — nama permukaannya tidak menentukan apa pun; yang menentukan adalah
apakah ada jalur yang membawa kredensial. Daftar lengkapnya di
[`permukaan-admin-user.md`](permukaan-admin-user.md) §3.

| # | Kategori | Keadaan di sini | Bukti / catatan |
| --- | --- | --- | --- |
| A01 | Broken Access Control | Tidak berlaku pada permukaan publik | Tidak ada objek per-pengguna. Yang tersisa: kebocoran **antar tenant** saat build — dijaga asersi tenant di [`src/lib/awcms/tenant.ts`](../../src/lib/awcms/tenant.ts) |
| A02 | Cryptographic Failures | Terpenuhi | TLS milik Traefik; token build tidak pernah masuk keluaran (tanpa prefiks `PUBLIC_`); **HSTS dikirim di produksi** sejak [ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md) |
| A03 | Injection | Terpenuhi | Tidak ada jalur HTML mentah: [`src/lib/content-blocks.ts`](../../src/lib/content-blocks.ts) menyusun tiap elemen dari teks ter-escape dan tag tetap; `set:html` hanya menerima keluarannya. Dijaga [`tests/content-blocks.test.mjs`](../../tests/content-blocks.test.mjs) |
| A04 | Insecure Design | Terpenuhi | Static-by-default adalah keputusan ber-ADR ([ADR-0014](../adr/0014-rendering-campuran-dan-bff-portal.md)), bukan default yang kebetulan. Pemotongan konten diam-diam diperlakukan sebagai **kegagalan** di [`src/lib/content.ts`](../../src/lib/content.ts) |
| A05 | Security Misconfiguration | Terpenuhi | Enam header di produksi, CSP ketat dikirim penyaji ([ADR-0019](../adr/0019-csp-ketat-dikirim-penyaji.md), [ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)); `Server`/`X-Powered-By` dihapus; tanpa secret di repo; image non-root |
| A06 | Vulnerable Components | Terpenuhi | `bun audit --audit-level=low` di job `check` CI; Dependabot mingguan; `bun install --frozen-lockfile` di CI dan di image; gerbang lockfile `bun run check:lockfile` |
| A07 | Identification & Auth Failures | Tidak berlaku | Tidak ada login. Kredensial build adalah kredensial **mesin** yang ditolak bila berbentuk token sesi manusia — [`src/lib/awcms/tenant.ts`](../../src/lib/awcms/tenant.ts) |
| A08 | Software & Data Integrity | Terpenuhi | `bun.lock` di-commit dan digerbangi dua lapis; **action GitHub dipin ke SHA commit dan image dasar dipin ke digest** sejak [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md), dijaga `tests/versi-toolchain.test.mjs`. Yang tersisa dari kategori ini: SBOM rilis (celah 9) |
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
| A.8.25 Secure development lifecycle | ADR untuk keputusan; changeset per iterasi; enam gerbang di CI |
| A.8.28 Secure coding | [`AGENTS.md`](../../AGENTS.md) §Keamanan, dengan tiap aturan menyebut cacat yang dijaganya |
| A.8.31 Pemisahan lingkungan | Asersi `AWCMS_TENANT_ID` menggagalkan build saat **token tenant LAIN** terpasang — kelas kesalahan yang kontrol ini ada untuk mencegah, dan satu-satunya yang benar-benar bisa dicegah dari sini. Contoh "token staging di deployment produksi" sengaja tidak dipakai lagi: `awcms` ADR-0083 menghapus `"staging"` dari union profil deployment keluarga, jadi ia menamai lingkungan yang tidak ada |
| A.5.7 / A.8.16 Threat intelligence & monitoring | **Tidak dipenuhi, dan sebagian sengaja.** Log akses berisi IP pembaca; lihat A09 di atas |

## NIST SSDF (SP 800-218 v1.1) — praktik yang berlaku untuk template

| Praktik | Keadaan |
| --- | --- |
| PS.1 Lindungi seluruh bentuk kode | Terpenuhi — branch protection + review; tidak ada commit langsung ke `main` |
| PS.2 Sediakan mekanisme verifikasi integritas rilis | Terpenuhi — SBOM CycloneDX deterministik ikut di setiap tag sejak [ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md); regenerasi pada tag yang sama menghasilkan byte identik, jadi SBOM-nya bisa **diverifikasi**, bukan hanya dipercaya |
| PW.4 Gunakan komponen pihak ketiga yang aman | Terpenuhi — lockfile di-commit, install ter-freeze, audit di CI |
| PW.7 Review kode | Terpenuhi — PR + CI wajib hijau |
| PW.8 Uji kode yang dieksekusi | Terpenuhi — enam gerbang, dan tiap gerbang yang **melewati dirinya mengatakannya** |
| RV.1 Identifikasi kerentanan secara berkelanjutan | Terpenuhi — Dependabot + `bun audit` + CodeQL terjadwal atas permukaan JS/TS sejak [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md), dengan cakupannya (dan batas `.astro`-nya) dinyatakan di tiap ringkasan run |

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

**Sejak [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md)
LCP dan CLS diasersi LAB di CI** — pada setiap PR sebuah situs yang punya
sumber konten; di repo template langkah itu tidak berjalan karena tidak ada
yang bisa dibangun. TIGA batasnya wajib ikut dibaca, dan ketiganya dinyatakan:
(1) lab mengukur halaman, bukan pembaca — angka p75 kunjungan nyata di tabel
di atas TETAP tidak diukur karena RUM ditolak; (2) INP tidak terukur di lab
dan diwakili proksinya, Total Blocking Time ≤ 200 ms; (3) yang diaudit adalah
**sampel** halaman — hingga 10 URL sampai kedalaman 4, angka yang DIPILIH di
`lighthouserc.json` (bawaan lhci diam-diam berhenti di 5 URL terdangkal dan
tidak pernah mencapai halaman artikel berlokal) dan dijaga `tests/cwv-lab.test.mjs`;
situs yang butuh cakupan lebih menaikkannya di berkas itu.
**Jangan menulis "memenuhi Core Web Vitals" dari hasil lab.** Rinciannya di
§Celah baris 8.

### Yang sudah benar, dan kenapa

| Keputusan | Akibat performa | Di mana |
| --- | --- | --- |
| Tanpa webfont — `system-ui` sebagai `--font-sans` | Nol permintaan font, nol FOIT/FOUT, nol kontribusi ke CLS. Ia dicatat sebagai keputusan **privasi** di [`src/styles/global.css`](../../src/styles/global.css); ia juga keputusan performa | `src/styles/global.css` |
| Tanpa framework UI, tanpa framework CSS | JS terkirim mendekati nol pada sebagian besar halaman | [`standar-teknis.md`](standar-teknis.md#the-stack) |
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
[`standar-teknis.md`](standar-teknis.md#performance) adalah tempat pertama
kelebihannya akan terlihat.

## Celah: kesepuluhnya ditutup — dan barisnya tetap di sini

Diurutkan menurut akibat, bukan menurut usaha. **Enam ditutup pada 4 Agustus
2026** — lima di pagi hari, yang keenam (pin rantai pasok) menyusul siangnya
lewat [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) — dan
**tiga berikutnya pada 5 Agustus 2026**: SBOM lewat
[ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md), analisis
statik dan Core Web Vitals lab lewat
[ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) —
masing-masing bersama pemeriksanya. **Yang kesepuluh ditemukan dan ditutup pada
6 Agustus 2026**, dan ia bukan kontrol yang hilang melainkan dua baris di tabel
ini sendiri: pemeriksa celah 2 dan 3 tidak pernah dieksekusi satu kali pun di
repo tempat ia ditulis. Di repo ini aturan tanpa pemeriksanya adalah aturan yang
akan dilanggar, dan itu berlaku juga untuk aturan yang datang dari standar luar
— **dan juga untuk pemeriksa itu sendiri.**

Baris yang tertutup **tetap di tabel**. Dihapus, ia akan diusulkan lagi sebagai
temuan baru enam bulan kemudian, dan pemeriksanya akan dilonggarkan oleh orang
yang tidak tahu kenapa ia ada.

| # | Celah | Keadaan | Pemeriksa |
| --- | --- | --- | --- |
| 1 | `Strict-Transport-Security` tidak dikirim | **DITUTUP** — [ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md): digerbangi produksi, tanpa `includeSubDomains`. **Sempat terbuka kembali tanpa terlihat 6–14 Agustus 2026**: bundler melipat `process.env.NODE_ENV` bertitik, jadi artefak yang tayang memuat `produksi = false` dan header keenam tidak pernah terkirim meski `NODE_ENV=production` terpasang | Tiga asersi di `tests/penyaji.test.mjs` atas SUMBER, **mutation-proven** — arahnya terbalik dan itu yang terpenting: HSTS **tidak** dikirim di luar produksi, dan gerbang yang hanya memeriksa "header ada" akan hijau pada versi yang mengunci setiap `localhost` pengembang selama setahun. Sejak 14 Agustus 2026 ada asersi keempat yang menjalankan **artefaknya** (`dist/server/penyaji.mjs`, dua kali, `production` dan bukan) — dan ia berjalan di dalam `docker build`, karena ketiga asersi pertama membaca sumber, tempat gerbangnya memang selalu benar |
| 2 | `fetchpriority="high"` tidak ada pada gambar di atas lipatan | **DITUTUP** — [`Ilustrasi.astro`](../../src/components/Ilustrasi.astro) memasangnya saat `hero`. `loading="eager"` saja tidak cukup: prioritas bawaan sebuah `<img>` tetap Low sampai layout membuktikan ia di viewport | Gerbang `performa` di `scripts/audit-konten.mjs`: setiap `<img loading="eager">` di `dist/client` wajib membawa `fetchpriority="high"`. Diperiksa di KELUARAN, sehingga `<img>` yang tidak lewat komponen ikut tertangkap |
| 3 | Anggaran gambar tidak punya pemeriksa | **DITUTUP** — 250 KB beranda, 100 KB halaman konten, diukur untuk pertama kalinya sejak angka itu ditulis | Gerbang `performa`: menjumlahkan byte gambar yang benar-benar DITERBITKAN build ini, per halaman. Media `awcms` tidak ada di `dist/client` sehingga tidak ikut tertimbang — batas yang disengaja, dan disebut di skripnya |
| 4 | `awcmsGet` tanpa batas waktu | **DITUTUP** — `AbortSignal.timeout`, bawaan 30 detik, diubah lewat `AWCMS_API_TIMEOUT_MS` | Dua asersi di `tests/kontrak-awcms.test.mjs`, **mutation-proven**: tiruan yang menerima koneksi lalu tidak pernah menjawab (melepas sinyalnya membuat tes itu menggantung, persis cacat aslinya), dan nilai batas cacat yang DITOLAK alih-alih diam-diam jatuh ke bawaan |
| 5 | Header pembocor teknologi tidak diverifikasi | **DITUTUP** — `Server` dan `X-Powered-By` dihapus `pasangHeader`, bukan sekadar diasersi: "tidak dikirim hari ini" dan "tidak akan dikirim" adalah dua hal berbeda | Asersi negatif atas tiga kelas respons di `tests/penyaji.test.mjs`, **mutation-proven** |
| 6 | Action GitHub dipin ke tag, image dasar dipin ke tag | **DITUTUP** — [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md): empat action dipin ke SHA commit dengan komentar `# vX.Y.Z` yang Dependabot baca, image dasar dipin ke digest | `tests/versi-toolchain.test.mjs`, **mutation-proven**. Ia menutup kelas cacat yang justru DITAMBAHKAN pin digest: saat tag dan digest sama-sama ada, digest yang dipatuhi Docker dan tag hanya jadi komentar |
| 7 | Tidak ada analisis statik | **DITUTUP** — [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) §A: `.github/workflows/codeql.yml` terjadwal mingguan + pada perubahan, atas permukaan JS/TS. Syarat kejujurannya persis yang kolom ini resepkan sejak awal: langkah `Nyatakan cakupan` menulis ke ringkasan run berapa berkas dianalisis dan berapa `.astro` TIDAK — dihitung `find` saat run, bukan ditulis tangan | `tests/analisis-statik.test.mjs`: seluruh action ber-SHA + komentar versi, jadwal ada, dan langkah pernyataan cakupan — beserta sebutan `.astro`-nya — tidak bisa dihapus diam-diam |
| 8 | Core Web Vitals tidak diukur | **DITUTUP** — [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) §B: Lighthouse CI atas **sampel** `dist/client` (hingga 10 URL, kedalaman 4 — batas yang dipilih, bukan bawaan lhci yang diam-diam berhenti di 5 URL terdangkal) di job `build`, terkondisi sumber konten seperti gerbang keluaran lainnya — di repo template ia tidak berjalan, di setiap SITUS ia berjalan pada tiap PR. LCP ≤ 2500 ms dan CLS ≤ 0,1 level `error`; INP tidak terukur di lab, jadi TBT ≤ 200 ms dipakai sebagai proksi dan DISEBUT proksi | `tests/cwv-lab.test.mjs`, berjalan di repo template: ambang `lighthouserc.json` TERPAKU ke angka dokumen ini dan ketiga batas cakupannya (kedalaman, jumlah sampel, blocklist 404) diasersi eksplisit — melonggarkan salah satunya menuntut mengubah tes, yang terlihat di review; langkah CI-nya terkondisi dan dipin SHA |
| 9 | Tidak ada SBOM pada rilis | **DITUTUP** — [ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md): `scripts/sbom.mjs` menurunkan CycloneDX 1.5 dari `bun.lock` — deterministik, tanpa dependency baru — dan perilis menulisnya SEBELUM commit rilis sehingga `sbom.cdx.json` ikut di dalam tag | `tests/sbom.test.mjs`, **mutation-proven** atas lockfile buatan: paket ber-scope, konversi hash base64→hex, dedup jalur resolusi, dan entri tak dikenal DITOLAK alih-alih dilewati — SBOM yang diam-diam tidak lengkap menjawab "tidak terdampak" dengan percaya diri. Langkah perilisnya diasersi struktural supaya tidak hilang diam-diam |
| 10 | Pemeriksa celah 2 dan 3 tidak pernah dieksekusi di repo tempat ia ditulis | **DITUTUP** — `tests/audit-konten.test.mjs`. Seluruh keluarga keluaran `scripts/audit-konten.mjs` — termasuk kedua gerbang performa di atas — berada di belakang `if (existsSync("dist/client"))`, dan `dist/client` lahir dari build yang butuh sumber konten. Di repo template itu berarti ~330 baris pemeriksa yang **tidak pernah jalan**: tidak di CI, tidak di `bun test`, tidak di mana pun. Baris 2 dan 3 berbunyi DITUTUP di atas dasar kode yang belum pernah dijalankan siapa pun | 86 kasus atas pohon fixture sungguhan, dijalankan dengan `cwd` fixture sehingga skripnya diuji **apa adanya**, tanpa mode uji yang hanya ada di tes. Tiap gerbang dibuktikan dua arah dan **mutation-proven**: mencabut tuntutan `fetchpriority`, menyamakan anggaran halaman konten dengan anggaran beranda, mencabut dedup `src`, mencabut resiprositas hreflang, mengabaikan namespace katalog, memperlakukan dimensi tak terbaca sebagai lulus, atau menghapus catatan "DILEWATI" — masing-masing memerahkan tes yang berbeda |
| 11 | Tanpa anggaran byte aset klien — permukaan pembaca keluarga adalah satu-satunya repo yang tidak punya | **DITUTUP** — `scripts/audit-aset.mjs`. `awcms` ADR-0101 menggerbangi pembacanya di 24.000 B; menurut ADR-0070-nya repo INI yang memikul permukaan publik keluarga, jadi repo dengan anggaran pembaca yang ketat adalah repo yang permukaan pembacanya sebuah aplikasi admin. `lighthouserc.json` nyata dan mengerjakan hal lain: ia mengambil SAMPEL, hanya berjalan bila sumber konten terkonfigurasi (jadi **tidak pernah untuk repo template sendiri**), dan tidak bisa menyebut BERKAS mana yang membesar — regresi 8 KB duduk nyaman di bawah LCP 2500 ms pada runner cepat dan tetap terasa di ponsel pada 3G. Dua lapis, mengikuti `audit-konten.mjs`: sumber selalu, keluaran bila `dist/client` ada, dan lapis yang dilewati MENGATAKANNYA. Anggarannya diturunkan dari pengukuran — artikel 29.510 B (skrip 5.809); cari 32.358 B (skrip 9.963) — bukan disalin dari `awcms`, yang 24.000-nya adalah irisan pembaca dari bundle ADMIN. **Plafon totalnya berpindah 36.000 → 40.000 pada 2 September 2026**, dan perpindahannya adalah pengukuran, bukan kelonggaran: redesign beranda menjadikan `/` halaman terberat pada 38.136 B (skrip 5.999 + gaya 32.137). Gerbangnya dibiarkan menggigit lebih dulu — ia menemukan gaya hero duduk di `global.css` sementara satu komponen memakainya, dan memindahkan blok itu memulangkan 1.853 B ke setiap halaman — dan kelebihan yang tersisa benar-benar permukaan baru (panel artikel terbaru, pita statistik, blok sorotan). Ruang 1.864 B di atasnya sengaja sempit, dan apa yang TIDAK dikerjakan ditulis di dalam skripnya: `BaseLayout.css` masih mengirim gaya badan artikel, tabel biaya, dan akordeon ke halaman yang tidak punya satu pun di antaranya | `tests/audit-aset.test.mjs`, 14 kasus atas pohon fixture sungguhan, dua arah. Registri `public/` ditegakkan DUA ARAH (berkas tak terdaftar DAN entri yang berkasnya hilang). Byte `<script>` inline diasersi ikut terhitung — anggaran pertama gerbang ini 9.000, dari hitungan tangan yang MELEWATKANNYA, dan gerbangnya sendiri mengoreksinya pada jalan pertama; pelanggaran skrip diasersi TIDAK menyebut berkas CSS, yang dilakukan versi pertamanya |

**Tidak ada yang terbuka hari ini — dan kalimat itu punya batas yang harus
ikut dibaca.** Celah 7 dan 8 lama ditahan justru karena penutupan yang mudah
adalah penutupan yang bohong; keduanya akhirnya ditutup dalam bentuk yang tabel
ini resepkan sendiri, dengan syarat kejujurannya dijaga tes yang **berjalan di
repo template** — keberatan lama "gerbang yang tidak bisa dibuktikan di tempat
ia ditulis akan membusuk" dijawab, bukan diabaikan
([ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md)).
Batasnya: `.astro` tetap tidak teranalisis statik (dan ringkasan run CodeQL
mengatakannya pada setiap jalan), p75 kunjungan nyata tetap tidak diukur (RUM
tetap ditolak — lab mengukur halaman, bukan pembaca), dan kolom Keadaan tabel
ini tetap **tidak bisa digerbangi mesin**. Sepuluh dari sepuluh bukan
"selesai selamanya"; ia berarti setiap celah yang DIKETAHUI punya pemeriksa,
dan temuan berikutnya masuk tabel ini sebagai nomor sebelas — bukan
menggantikan baris lama.

**Celah 10 adalah bukti bahwa kalimat itu berlaku untuk tabel ini sendiri.**
Ia ditemukan pada 6 Agustus 2026 dengan satu pertanyaan yang seharusnya
ditanyakan pada hari celah 2 dan 3 ditutup — *pemeriksanya sendiri pernah
dijalankan siapa?* — dan jawabannya "tidak pernah, di repo ini". Dua batasnya
ikut dinyatakan, karena penutupan yang lebih besar daripada kenyataannya persis
kelas cacat yang tabel ini lawan:

- **Fixture bukan situs.** 86 kasus itu membuktikan LOGIKA gerbangnya atas
  keluaran buatan yang berbentuk seperti keluaran Astro. Ia tidak membuktikan
  bahwa `astro build` sungguhan memancarkan bentuk yang sama — itu hanya bisa
  dibuktikan sebuah SITUS, dan di sana `bun run audit:konten` setelah build
  memang berjalan pada tiap PR.
- **Satu baris di skripnya tetap tidak bergerbang, dan itu ditulis di tesnya.**
  Penyaring `mailto:|tel:|data:|javascript:` tidak bisa dimutasi dari luar —
  `internal()` sudah menolak skema itu lebih dulu, jadi mencabutnya tidak
  mengubah satu pun hasil. Tesnya menjaga perilakunya, bukan barisnya, dan
  selisih itu disebut di sana alih-alih dihitung sebagai cakupan.

Konteks keluarganya, per 5 Agustus 2026: `awcms` **sudah** mengukur Core Web
Vitals di lab pada hari yang sama (Opsi D ADR-0067 di sana — LCP+CLS halaman
`/login`, nol data pengunjung), jadi kedua repo kini mengukur LAB dan tidak
satu pun mengukur lapangan. **Status ADR-0067 di sana kini `Accepted (belum
diimplementasikan)`**: bagian RUM-nya diputuskan 8 Agustus 2026 — Opsi B,
agregasi di titik masuk tanpa baris mentah per kunjungan — dan belum dibangun;
di sini RUM sudah ditolak sebagai postur. Selisih yang tersisa karena itu punya
tanggal kedaluwarsa yang sudah diketahui: begitu Opsi B mendarat, satu repo
mengukur lapangan secara agregat dan repo ini tidak.

## Yang sengaja TIDAK diadopsi

Sama pentingnya untuk ditulis: sebuah kontrol yang direkomendasikan standar dan
**ditolak dengan alasan** tidak akan diusulkan lagi enam bulan kemudian sebagai
temuan baru.

> **Dua dari lima penolakan di bawah ditolak dengan alasan yang punya tanggal
> kedaluwarsa, dan tanggalnya bukan di kalender.** CORP/COOP ditolak karena repo
> ini "tidak punya sesi untuk dipagari", dan SRI karena "tidak ada sumber daya
> lintas-origin". Keduanya **premis, bukan prinsip** — dan premis pertama gugur
> di situs pertama yang menyalakan `permukaanAdmin`
> ([ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)).
> Situs seperti itu wajib meninjau ulang keduanya sebelum tayang; lihat
> [`permukaan-admin-user.md`](permukaan-admin-user.md) §3. Yang tiga lainnya —
> pelaporan CSP, RUM, dan analytics yang melacak individu — ditolak atas
> **prinsip** (larangan mengumpulkan data pembaca) dan tidak berubah oleh
> permukaan apa pun.

- **Pelaporan CSP (`report-to` / `report-uri`).** Ia mengirim laporan berisi URL
  yang sedang dibuka pembaca ke sebuah pengumpul. Repo ini melarang mengumpulkan
  data pembaca, dan larangan itu tidak punya pengecualian "tapi ini untuk
  keamanan". Sebuah situs yang punya pengumpul miliknya sendiri boleh
  menambahkannya lewat ADR di repo situsnya.
- **`Cross-Origin-Resource-Policy: same-origin` menyeluruh.** Ia akan memblokir
  situs lain menyematkan gambar dari situs ini — perilaku yang mungkin diinginkan
  sebagian situs dan pasti tidak diinginkan sebagian yang lain. Ia bukan default
  yang aman untuk sebuah **template**, dan menaruhnya di sini berarti memutuskan
  untuk situs yang belum ada. `awcms` kini mengirimkannya (bersama
  `Cross-Origin-Opener-Policy`) untuk memagari sesi admin-nya, dan komentar di
  kodenya sendiri menyatakan alasan itu tidak menular ke sini: repo ini tidak
  punya sesi untuk dipagari, dan halaman HTML adalah navigasi — yang CORP memang
  tidak atur. Penolakan ini kini **tercatat di kedua sisi**: `awcms` ADR-0069
  menjadikannya divergence bernama ber-`reviewDate` 2027-02-04, jadi ia tidak
  akan diusulkan ulang sebagai temuan enam bulan lagi.
- **Subresource Integrity.** Tidak ada satu pun sumber daya lintas-origin yang
  dimuat halaman ini. SRI tanpa sumber daya eksternal adalah atribut yang tidak
  menjaga apa pun.
- **Analytics berbasis RUM untuk mengukur Core Web Vitals.** Ia mengumpulkan data
  pembaca. Celah 8 di atas karena itu ditutup lewat pengukuran **lab** di CI, dan
  keterbatasannya dinyatakan: lab mengukur halaman, bukan pembaca.
- **Rate limiting dan WAF.** Milik Traefik/Coolify, bukan milik proses penyaji.
  Menaruhnya di sini berarti dua tempat yang memutuskan hal yang sama.

## Hubungannya dengan `ahliweb/awcms`

> **Dua repo, dua angka — dan selisihnya kini selesai, di kedua sisi.**
> Penilaian `awcms` 4 Agustus 2026 (`docs/awcms/repo-assessment-2026-08-04.md`
> §4) mencatat repo ini memanggil **enam** permukaannya; kenyataannya repo ini
> memanggil **tiga**, dan sejak
> [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) daftar di
> sisi sini diekstrak dari kode dan digerbangi dua arah.
>
> `awcms` menjawabnya pada hari yang sama dengan ADR-0065: kontrak konsumen
> dibekukan di sisi sana (`bun run api:consumer-contract:check`, masuk rantai
> `check`-nya), dengan daftar yang **diturunkan dari mem-grep repo ini** — tiga
> path yang benar-benar dipanggil build (`/blog/posts`, `/media/objects`,
> `/media/public-origin`) dipisah dari dua yang baru DIJANJIKAN ADR
> (`/auth/session` untuk BFF yang belum ada, `/access/machine-credentials` cara
> manusia menerbitkan token build — dan sejak 13 Agustus 2026 permukaan itu
> punya layar `/admin/machine-credentials` di sana, sekaligus bisa menerbitkan
> kredensial kelas TULIS yang **tidak boleh** dipakai untuk token build),
> dan `GET /blog/posts/{id}` yang dihapus
> ADR-0018 tidak ikut dibekukan. (Prosa ADR-0065 menyebut "6 path"; fixture-nya
> membekukan LIMA — angka di sini mengikuti kode.) Pembekuannya menelusuri
> closure `$ref` sehingga schema yang dirujuk ikut beku, aturannya subset
> aditif: menambah field opsional
> lolos, menghapus atau mengubah tipe merah — di CI `awcms`, sebelum build repo
> ini sempat rusak. Regenerasi fixture di sana adalah sinyal bahwa repo ini
> wajib ikut berubah **dalam napas yang sama**.

Repo ini **mengonsumsi** `awcms` dan tidak menyajikan API apa pun, jadi sebagian
besar kontrol keluarga — RLS, ABAC default-deny, idempotency, audit trail, HMAC
sinkronisasi — ditegakkan di sana dan tidak punya padanan di sini. Yang
**bukan** berarti tidak relevan: keputusan `awcms` mengubah apa yang benar di
sini. Empat baris tengah tabel ini datang dari gelombang ADR 4 Agustus 2026
sisi sana (0065–0068); tiga baris terbawah dari putaran 5 Agustus 2026, saat
kedua repo menutup celah lintas-repo terakhirnya masing-masing dan berhenti
menyimpan versi berbeda dari fakta yang sama.

| Keputusan `awcms` | Akibatnya di repo ini |
| --- | --- |
| ADR-0049/0050 — kredensial mesin + serah-terima sesi BFF | Sudah diserap: tenant dari token, tanpa header tenant ([ADR-0018](../adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md)) |
| ADR-0071 — kosakata URL publik dibelah; **men-supersede ADR-0059** | **Sudah diserap** ([ADR-0036](../adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)). Baris ini sebelumnya berbunyi "belum diserap" dan memerikan keluarga rute `/news/**` di `awcms` — keempatnya **dihapus** di sana pada 8 Agustus 2026 dan kini 301 ke `/blog/{tenantCode}/**` — **kecuali** untuk tenant ber-`legacyTenantRouteEnabled: false`, yang sudah mematikan seluruh permukaan konten publiknya dan karena itu tetap dijawab 404 alih-alih diberi 301 menuju 404 yang pasti (`awcms` ADR-0071 §4 butir 3). Kosakata kini satu keluarga per repo: `/blog/**` milik `awcms` (path-scoped, kosakata permanennya), `/news/**` milik repo ini berbentuk sebuah tab. Pertanyaan "kapan memakai `awcms-astro` alih-alih permukaan publik `awcms`" tetap nyata dan tetap dijawab [`README.md`](README.md#when-to-choose-awcms-astro) — yang dipilih di sini adalah **nol panggilan ke CMS saat pembaca meminta halaman**, bukan bentuk URL-nya |
| ADR-0061 — permukaan host-resolved boleh di-cache di tepi | Tidak berlaku langsung: situs ini tidak melewati Varnish. Yang **berlaku** adalah alasannya — 404 yang bisa di-cache adalah kanal observasi kedua. Repo ini tidak punya cabang 404 yang membedakan tenant, jadi kelas cacat itu tidak bisa terjadi di sini |
| ADR-0062 — skill digerbangi terhadap kode yang dijelaskannya | **Diserap penuh sejak 5 Agustus 2026.** `bun run audit:dokumen` memeriksa jalur berkas yang disebut `.claude/skills/` persis seperti `docs/`, dan kini juga aturan 2-nya: setiap kutipan `ADR-NNNN` wajib resolve ke berkasnya, kecuali ditandai milik repo lain di paragraf yang sama. Gerbang pertamanya langsung menemukan sebelas kutipan tanpa penanda |
| ADR-0065 — kontrak konsumen `awcms-astro` dibekukan di sana | **Batas antar-repo kini dijaga dari dua arah.** Sisi sini menggerbangi daftar permukaan yang dipanggil (ADR-0030); sisi sana membekukan bentuknya (lima path + closure `$ref`-nya, subset aditif). Perubahan non-aditif pada permukaan yang dipakai build merah di CI `awcms` lebih dulu — dan regenerasi fixture-nya adalah undangan eksplisit agar repo ini diperbarui serentak |
| ADR-0067 — pengumpulan Core Web Vitals (`Accepted (belum diimplementasikan)` sejak 8 Agustus 2026) | **Paritas lab tetap, tetapi kalimat "tinggal siapa memikul keputusan lapangan" sudah terjawab — dan jawabannya divergence postur BARU.** `awcms` mendarat Opsi D-nya pada hari yang sama dengan celah 8 di sini (5 Agustus 2026): LCP+CLS diukur di lab, nol data pengunjung, INP tidak diklaim. Pada 8 Agustus 2026 sisi sana **memutuskan Opsi B** — agregasi di titik masuk, bucket per-(tenant, pola rute, hari), tanpa satu pun baris mentah per kunjungan — dan belum membangunnya. Artinya kalimat keluarga "kedua repo mengukur LAB dan tidak satu pun mengukur lapangan" punya **tanggal kedaluwarsa yang sudah diketahui**: begitu Opsi B dibangun, satu repo mengukur lapangan secara agregat dan repo ini tidak, karena RUM di sini **ditolak permanen** ([ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) §B). Selisih itu **belum punya entri** di manifest keluarga sana; ia pantas mendapatkannya saat Opsi B mendarat, dan repo ini tidak bisa menulisnya sendiri |
| ADR-0068 — postur standar keluarga: edisi dipin, divergence dicatat | **Kalimat "mengikuti edisi `awcms`" akhirnya punya alamat.** Pin edisi (Top 10 2021, ASVS 4.0.3, API Security 2023, ISO 27001:2022, SSDF v1.1 — **lima**, dan ISO/IEC 25010:2023 bukan salah satunya) kini keputusan ber-ADR dengan tanggal tinjau 2027-02-04, dan HSTS tanpa `includeSubDomains` di sini (ADR-0029) tercatat sebagai divergence bernama di `awcms-family-compatibility.yaml` sisi sana — dengan `reviewDate` yang memerahkan CI `awcms` saat jatuh tempo, bukan catatan yang membusuk diam-diam. **Entrinya LIMA, bukan dua**, dan yang kelima belum pernah disebut di repo ini: `astro-files-not-type-checked`. Arahnya berlawanan dari dugaan — `astro check` berjalan **di sini** dan tidak di sana, karena `@astrojs/check` menuntut API programatik TypeScript 6.x sementara `awcms` sudah di 7.0.2. Catatan divergence-nya menyandarkan diri secara eksplisit pada repo ini masih berada di `^6.0.3`, sehingga menaikkan TypeScript di sini **mematikan gerbang `Type check`** dan membatalkan setengah catatan sana sekaligus. Itu kini keputusan ber-ADR di repo ini: [ADR-0037](../adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md), dengan pemeriksanya di `tests/versi-toolchain.test.mjs` |
| ADR-0069 — selisih COOP/CORP dicatat sebagai divergence keluarga | **Penolakan CORP di sini berhenti terbaca sebagai kelalaian.** `awcms` mengirim COOP+CORP `same-origin` untuk memagari sesi adminnya; repo ini tidak mengirim keduanya, dan kedua sisi kini menuliskan alasannya: CORP ditolak sebagai keputusan template (memutuskan penyematan gambar untuk situs yang belum ada), COOP tak punya sesi untuk dipagari karena seluruh halaman di sini adalah navigasi publik. Entri `coop-corp-cross-origin-isolation` ber-`reviewDate` 2027-02-04 di manifest sana yang menjaganya kembali ke meja. **Arah paritas tidak diubah**: situs turunan yang butuh keduanya memutuskannya lewat ADR di repo situsnya, bukan dengan menyalin nilai `awcms` ke template ini |
| Celah C3 sana ditutup — kompresi yang diwarisi kini WAJIB dinyatakan | Selisih kepemilikan tetap ada dan berhenti tak terlihat: penyaji repo ini mengompresi sendiri (Brotli/gzip ter-negosiasi, `server/penyaji.mjs`), sedangkan `awcms` mewarisinya dari Cloudflare — dan `bun run security:readiness` di sana kini menuntut blok bertanda yang menyebut tier pengompresi beserta akibatnya di luar CDN. Yang perlu dibaca situs turunan: kata "terkompresi" berarti dua hal berbeda di dua repo — di sini milik proses yang repo kirim, di sana milik lapisan yang operator sewa |
| ADR-0070 — peran keluarga: repo ini memikul publik **dan admin USER** | **Permintaan terbuka [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) §Hubungan akhirnya dijawab.** ADR itu menyatakan ketegangannya dengan `awcms` ADR-0051 ("seluruh layar admin … dibangun di repo `awcms`") lalu menutupnya dengan kalimat "repo ini tidak bisa menulisnya sendiri". `awcms` ADR-0070 **MEMPERSEMPIT** ADR-0051 alih-alih men-supersede-nya: sumbu bergeser dari AUDIENS ke **apa yang dikelola**, admin SISTEM tetap di sana, admin USER boleh di sini bila situsnya menyatakannya, dan **ketiga gerbang pengganti ADR-0051 tidak dilonggarkan sedikit pun**. Entri `admin-user-surface-in-awcms-astro` ber-`reviewDate` 2027-02-04 masuk manifest sana — dan yang ditinjau pada tanggal itu **bukan** apakah admin USER boleh di sini, melainkan apakah **batasnya** masih di tempat yang sama. Yang harus dibaca situs turunan: menyalakan `permukaanAdmin` memikul sesi, CSRF, dan cache yang wajib dipisah — biaya yang dipilih, bukan diwarisi |
| Aset statis sana sempat keluar TANPA header — dan perbaikannya bentuk penyaji repo ini | **Pola sisi sini diadopsi di sana, dan ia layak dibaca sebagai peringatan.** Pada 10 Agustus 2026 `awcms` menemukan adapter `@astrojs/node` menyusun handler-nya sebagai `staticHandler(req, res, () => appHandler(req, res))` — handler statis jalan **lebih dulu**, dan `appHandler` (satu-satunya yang menjalankan middleware) hanya fallback saat berkasnya tidak ada. Akibatnya setiap berkas `dist/client` di sana keluar tanpa CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, maupun COOP/CORP; terukur pada build nyata, bukan disimpulkan. Perbaikannya memasang header sebagai **LANTAI sebelum mendelegasi** — persis bentuk [`server/penyaji.mjs`](../../server/penyaji.mjs) sejak [ADR-0016](../adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md). **Jangan pernah "menyederhanakan" penyaji di sini dengan memanggil handler adapter langsung**: itu persis cacat yang baru saja dibayar sisi sana, dan ia hijau di setiap gerbang yang tidak mengukur respons sungguhan |
| ADR-0073 — `suspended` adalah status LAYANAN, bukan status login | **Mode kegagalan build BARU, dan ia bukan pekerjaan kode.** Tenant `suspended` **atau** `inactive` dijawab `403 TENANT_SUSPENDED`, dan penolakannya kini mengenai **kredensial mesin** — bukan hanya sesi manusia. Diputuskan sebelum permission dicari, jadi tidak ada scope token yang memperbaikinya: build gagal total, nol berkas terbit. Diserap sebagai penolakan bernama di [`integrasi-awcms.md`](integrasi-awcms.md) dan [`AGENTS.md`](../../AGENTS.md) §Sumber data, supaya ia tidak salah didiagnosis sebagai token dicabut |
| ADR-0084 — sebuah entitlement MENOLAK, ia tidak pernah memberi | Bentuk penolakan yang sama (`403 ENTITLEMENT_REQUIRED`, di atas pembacaan grant), tetapi **belum bisa mengenai build ini**: entitlement diputuskan per MODUL, dan satu-satunya modul `awcms` yang mendeklarasikannya hari ini `tenant_domain` (`custom_domain`, di paket DEFAULT). Build ini hanya memanggil `blog_content` dan `media_library`. ADR yang sama menaikkan `moduleDescriptorContractVersion` keluarga ke **3.1.0** lewat field opsional `requiresEntitlement` — penambahan murni, nol pekerjaan di sini |
| ADR-0083 — template `awcms` men-deploy ke SATU environment | **Kosakata keluarga menyempit.** Anggota `"staging"` **dihapus** dari union profil deployment modul (kini `development \| production \| offline-lan`) — penarikan kemampuan, karena itu MAJOR. Akibatnya di sini murni redaksional dan sudah dikerjakan: dokumen ini tidak lagi menarasikan "token staging" sebagai lingkungan sejajar produksi |
| ADR-0092 — kredensial mesin boleh MENULIS | **Sebuah premis keamanan repo ini gugur, dan ia dikutip di tiga berkas.** "Kredensial mesin tidak bisa menulis" berhenti menjadi sifat KELAS: plafon aksi `create`/`update` di kode (bukan kolom), wajib terikat CIDR, **ditolak bila `clientIp` tidak diketahui**, umur maksimum 30 hari alih-alih 365. Kredensial yang terbit sebelum migrasinya tetap baca-saja tanpa backfill. Token build repo ini tetap tidak bisa mengubah apa pun — tetapi karena `allowed_write_actions`-nya kosong, yaitu properti **barisnya**. Diserap di [`.env.example`](../../.env.example), banner [ADR-0018](../adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md), dan [`README.md`](../../README.md) |
| ADR-0093 — partner yang di-suspend BERHENTI menjangkau | **Mode kegagalan build BERSYARAT, dan syaratnya adalah siapa yang menerbitkan token.** `403 PARTNER_SUSPENDED` menolak aktor **terdelegasi** di chokepoint, per permintaan. Kredensial mesin mewarisi `principal_kind` akun layanannya, dan tidak ada apa pun di jalur penerbitan sana yang melarang akun layanan berupa tenant user terdelegasi — bentuk yang muncul saat sebuah agensi membangun situs pelanggannya. Aturannya operasional, bukan kode: terbitkan token build atas akun layanan milik tenant **situs**. Diserap di [`AGENTS.md`](../../AGENTS.md) §Sumber data dan tabel diagnosis [`deploy-coolify.md`](../deploy-coolify.md) |
| ADR-0094 — seorang subjek data dijawab PER TENANT | **Nol pekerjaan kode, satu kewajiban yang harus dinyatakan.** Situs statis memegang **salinan**: penghapusan atau anonimisasi yang dijalankan di `awcms` tidak menyentuh berkas yang sudah terbit sampai build berikutnya, dan salinan yang sudah tersebar bisa hidup lebih lama (cache CDN, riwayat git `dist/` bila situs meng-commit keluarannya). **Kewajiban itu kini HIDUP**, dan kalimat yang dulu berdiri di sini — *"template ini menerbitkan nol data per-orang"* — dipensiunkan [ADR-0042](../adr/0042-a-byline-is-the-first-per-person-data-this-template-publishes.md). Sejak `awcms` ADR-0109 seorang penulis boleh memilih punya byline publik, dan template ini merendernya pada ketiga permukaan yang menyebut penulis: halaman artikel, `author` JSON-LD (kini `Person` bila ada), dan entry Atom artikel itu. Yang membatasinya adalah opt-in itu dan ADR-0042 Keputusan 3: satu-satunya data per-orang yang terbit adalah nama yang seseorang pilih untuk diterbitkan, tanpa `@id`, `url`, `sameAs`, `<uri>`, maupun `<email>` — digerbangi `tests/schema.test.mjs` dan `tests/feed.test.mjs`. Artikel yang penulisnya tidak memilih byline tetap beratribusi organisasi, dan ketiadaannya dirender sebagai tanpa baris byline, bukan sebagai nama penerbit. Jadi **situs yang menerbitkan byline harus bisa memicu rebuild**, dan itu dinyatakan alih-alih digerbangi: tidak ada apa pun di repo ini yang bisa mengamati penghapusan di `awcms`. Kontrak deskriptor modul keluarga naik ke **4.0.0** — nol pekerjaan di sini, repo ini tidak mendeklarasikan deskriptor modul |
| ADR-0098 — kunci cache membawa locale, di PATH | **Keputusan caching di sana, dan keputusan postur di sini — dengan keduanya sengaja berlawanan arah.** `awcms` memindahkan URL konten publiknya ke `/{locale}/blog/{tenantCode}/**` karena `vcl_hash` berkunci `(host, url)` dan badan yang dipilih cookie di bawah satu kunci menyilangkan jawaban antar pembaca. Repo ini **tidak** mengadopsi prefiks itu: build statis menulis satu berkas per URL dan `server/penyaji.mjs` membaca `req.url` dan tidak ada yang lain, jadi kuncinya dan badannya sudah sepakat, dan prefiks itu akan mematahkan setiap URL locale default yang sudah terindeks demi properti yang sudah dimiliki. Yang **diadopsi** adalah keputusan 2 ADR tersebut — `Vary: Cookie` dan `Vary: Accept-Language` DITOLAK pada setiap respons, ditolak alih-alih dibuang — kini menjadi [ADR-0041](../adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md) dengan pemeriksanya di `tests/penyaji.test.mjs`. **Sebuah divergence keluarga yang butuh entri** di `awcms-family-compatibility.yaml` sana, dan repo ini tidak bisa menuliskannya |
| Gelombang ADR 0072–0099 lainnya | **Dibaca seluruhnya, dan tidak relevan bagi jalur build statis** — 0072 (retensi log keputusan), 0074/0077 (outbox, sync pull), 0075 (SSE), 0076 (deskriptor retensi), 0078–0082 (grant, grup pengguna, undangan), 0085–0091 (identitas, lockout, MFA, pemilihan tenant, partner, akses terdelegasi, atribusi), dan dari ekor 14–15 Agustus 2026: 0095/0096/0099 (bahasa pembaca, permukaan akun swalayan, alamat sign-in). Seluruhnya menyentuh permukaan **terautentikasi**, dan justru karena itu penting bagi peran KEDUA repo ini: akibatnya dicatat di [`permukaan-admin-user.md`](permukaan-admin-user.md) §5, bukan di sini. 0097 (Inggris sebagai bahasa sumber) adalah keputusan yang sama yang diambil repo ini sebagai [ADR-0039](../adr/0039-english-is-the-source-language.md), dicapai secara mandiri dan dengan mekanisme yang sama. Diamnya baris ini karena itu berarti "diperiksa dan tidak relevan", bukan "belum diperiksa" |
| Celah C16 sana ditutup — CodeQL berhenti mengklaim `.astro` | Pola pernyataan cakupan yang [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) §A tetapkan di sini diadopsi di sana: komentar workflow-nya sempat menyebut "TypeScript/Astro source" padahal CodeQL tak punya ekstraktor Astro. Postur keluarga karena itu kini satu kalimat yang sama di dua repo: **`.astro` tidak teranalisis statik di mana pun, dan masing-masing repo mengatakannya di ringkasan run-nya sendiri** — bukan dibiarkan disimpulkan pembaca |

Celah `awcms` ADR-0062 itu ditutup 5 Agustus 2026, persis semurah yang
diperkirakan: gerbangnya memang sudah membaca seluruh markdown repo ini dan
sudah punya indeks ADR. Pemeriksanya dibuktikan dua arah di
`tests/audit-dokumen.test.mjs`, dan jalan pertamanya menemukan sebelas kutipan
yang pembacanya tidak bisa tahu milik siapa. Pekerjaannya tercatat di
[ADR-0028](../adr/0028-jangkar-standar-performa-dan-keamanan.md) §E.

## Cara memakai dokumen ini di sebuah situs turunan

Tiga baris berubah artinya begitu template ini menjadi sebuah situs:

1. **Setiap "belum diukur" menjadi pertanyaan yang harus dijawab.** Di repo
   template, gerbang keluaran melewati dirinya karena tidak ada sumber konten.
   Di sebuah situs itu berarti gerbangnya **tidak berjalan**.
2. **HSTS sudah dikirim penyaji di produksi** ([ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md))
   — yang menjadi milik situsmu adalah memastikan `NODE_ENV=production`
   terpasang (image `Dockerfile` menyetelnya; deployment yang tidak lewat image
   itu menyetelnya sendiri) dan **tidak memasang kebijakan HSTS kedua di
   Traefik**: dua sumber kebijakan yang saling menimpa adalah cara paling sunyi
   berakhir tanpa kebijakan. `includeSubDomains` tetap keputusan situsmu, bukan
   template — alasannya di ADR-0029, dan selisih ini tercatat sebagai divergence
   bernama di manifest keluarga `awcms` (ADR-0068 §B di sana).
3. **Setiap permukaan terautentikasi mengubah matriks ini, dan ada DUA pintu
   menuju ke sana.** Permukaan berkredensial bertarget WCAG 2.2 AA dan membawa
   kembali seluruh kategori OWASP yang di atas ditulis "tidak berlaku" — A01,
   A07, dan A09 khususnya — beserta sesi, CSRF, pemisahan cache, dan peninjauan
   ulang postur COOP/CORP dan SRI. Pintu pertama BFF Jualanku, prasyaratnya di
   [`jualanku/04-kesiapan.md`](jualanku/04-kesiapan.md); pintu kedua
   `permukaanAdmin` untuk admin USER, dan seluruh akibatnya di
   [`permukaan-admin-user.md`](permukaan-admin-user.md). Yang menentukan bukan
   nama permukaannya melainkan adanya jalur yang membawa kredensial.
