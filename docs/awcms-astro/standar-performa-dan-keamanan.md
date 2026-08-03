# awcms-astro — Standar Performa dan Keamanan

Peta antara kontrol yang benar-benar berjalan di repo ini dan **standar
internasional yang menamainya**, beserta daftar celah yang jujur.

Dokumen ini tidak menambah satu pun aturan baru. Aturannya sudah ada — di
[`AGENTS.md`](../../AGENTS.md), [`standar-teknis.md`](standar-teknis.md), dan
tiga belas ADR. Yang belum ada adalah **nama luar** bagi aturan-aturan itu, dan
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
| Core Web Vitals | LCP · INP · CLS | Performa yang dirasakan pembaca | §Performa |
| RFC 9111 | HTTP Caching | Semantik `Cache-Control` | [`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs) |
| WCAG | 2.1 AA (2.2 AA untuk permukaan Jualanku) | Aksesibilitas | [`standar-teknis.md`](standar-teknis.md#aksesibilitas) |

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
| `Strict-Transport-Security` | **tidak dikirim** | `max-age=31536000; includeSubDomains`, digerbangi produksi | Wajib |
| `Cross-Origin-Opener-Policy` | tidak dikirim | tidak dikirim | Dianjurkan |
| `Cross-Origin-Resource-Policy` | tidak dikirim | tidak dikirim | Dianjurkan |

**Klaim "lima header keamanan, disamakan dengan postur `awcms`" karena itu tidak
lagi akurat, dan koreksinya bukan kosmetik.** Kelima yang ada memang identik
nilainya. Yang tidak identik adalah **jumlahnya**: `awcms` mengirim keenam di
produksi, dengan `Strict-Transport-Security` digerbangi `isProduction` di
`src/lib/security/security-headers.ts`. Repo ini mengirim lima, di setiap
lingkungan.

Alasan HSTS tidak ada di sini terbaca masuk akal — TLS diterminasi Traefik, jadi
"itu urusan lapisan di depan". Alasan itu tidak bertahan diperiksa: Traefik tidak
memasang HSTS tanpa middleware yang dinyatakan, jadi yang terjadi bukan
"dipasang di tempat lain" melainkan **tidak dipasang di mana pun**. Dan
`AGENTS.md` sudah melarang solusinya ditaruh di Traefik — header respons
ditentukan di satu berkas, bukan dua.

Menutupnya adalah pekerjaan kode, bukan dokumen, dan ia **mengubah postur
keamanan** sehingga butuh ADR-nya sendiri (kriteria di
[`docs/adr/README.md`](../adr/README.md)). Ia terdaftar di §Celah di bawah.

## OWASP Top 10 (2021) → permukaan repo ini

Situs dari template ini **statis**: tanpa basis data, tanpa sesi, tanpa form,
tanpa mutasi. Sebagian besar kategori karena itu tidak berlaku — dan menuliskan
"tidak berlaku" beserta **alasannya** lebih berguna daripada menghilangkan
barisnya, karena alasan itulah yang berhenti benar begitu sebuah situs menambah
permukaan terautentikasi.

| # | Kategori | Keadaan di sini | Bukti / catatan |
| --- | --- | --- | --- |
| A01 | Broken Access Control | Tidak berlaku pada permukaan publik | Tidak ada objek per-pengguna. Yang tersisa: kebocoran **antar tenant** saat build — dijaga asersi tenant di [`src/lib/awcms/tenant.ts`](../../src/lib/awcms/tenant.ts) |
| A02 | Cryptographic Failures | Sebagian | TLS milik Traefik; token build tidak pernah masuk keluaran (tanpa prefiks `PUBLIC_`). **HSTS belum ada** — lihat §Celah |
| A03 | Injection | Terpenuhi | Tidak ada jalur HTML mentah: [`src/lib/content-blocks.ts`](../../src/lib/content-blocks.ts) menyusun tiap elemen dari teks ter-escape dan tag tetap; `set:html` hanya menerima keluarannya. Dijaga [`tests/content-blocks.test.mjs`](../../tests/content-blocks.test.mjs) |
| A04 | Insecure Design | Terpenuhi | Static-by-default adalah keputusan ber-ADR ([ADR-0014](../adr/0014-rendering-campuran-dan-bff-portal.md)), bukan default yang kebetulan. Pemotongan konten diam-diam diperlakukan sebagai **kegagalan** di [`src/lib/content.ts`](../../src/lib/content.ts) |
| A05 | Security Misconfiguration | Sebagian | Lima header + CSP ketat dikirim penyaji ([ADR-0019](../adr/0019-csp-ketat-dikirim-penyaji.md)); tanpa secret di repo; image non-root. **HSTS dan header `Server`/`X-Powered-By` belum digerbangi** — §Celah |
| A06 | Vulnerable Components | Terpenuhi | `bun audit --audit-level=low` di job `check` CI; Dependabot mingguan; `bun install --frozen-lockfile` di CI dan di image; gerbang lockfile `bun run check:lockfile` |
| A07 | Identification & Auth Failures | Tidak berlaku | Tidak ada login. Kredensial build adalah kredensial **mesin** yang ditolak bila berbentuk token sesi manusia — [`src/lib/awcms/tenant.ts`](../../src/lib/awcms/tenant.ts) |
| A08 | Software & Data Integrity | Sebagian | `bun.lock` di-commit dan digerbangi dua lapis. **Action GitHub dipin ke tag, bukan SHA commit; image dasar dipin ke tag, bukan digest** — §Celah |
| A09 | Logging & Monitoring | Di luar cakupan | Proses penyaji tidak menulis log permintaan dan **tidak boleh** mulai menulisnya tanpa ADR: log akses berisi IP pembaca, dan larangan mengumpulkan data pribadi pembaca berlaku penuh |
| A10 | SSRF | Tidak berlaku | Satu-satunya URL keluar adalah `AWCMS_API_URL` dari env tepercaya, dipakai hanya saat build. Tidak ada input pembaca yang menjadi URL |

## OWASP ASVS 4.0.3 — kategori yang benar-benar punya permukaan di sini

| Kategori | Butir yang relevan | Keadaan |
| --- | --- | --- |
| V5 Validation & Encoding | Output encoding pada tiap sink | Terpenuhi. Astro meng-escape secara bawaan; satu-satunya `set:html` menerima keluaran `renderContentBlocks` dan tidak pernah string dari sumber lain |
| V9 Communications | TLS di produksi | Sebagian — TLS ada, **HSTS tidak** |
| V14.4 HTTP Security Headers | CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | Terpenuhi dan **dibuktikan tes**, bukan diperiksa mata |
| V14.4 | Header yang membocorkan teknologi (`Server`, `X-Powered-By`) | **Belum diverifikasi gerbang mana pun** — §Celah |
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

## Celah yang belum ditutup

Diurutkan menurut akibat, bukan menurut usaha. Kolom terakhir menyebut apa yang
harus ikut mendarat — di repo ini **aturan tanpa pemeriksanya adalah aturan yang
akan dilanggar**, dan itu berlaku juga untuk aturan yang datang dari standar
luar.

| # | Celah | Akibat bila dibiarkan | Butuh ADR? | Pemeriksa yang harus ikut |
| --- | --- | --- | --- | --- |
| 1 | `Strict-Transport-Security` tidak dikirim | Permintaan HTTP pertama seorang pembaca bisa dibajak sebelum redirect ke HTTPS terjadi. `awcms` menutup ini; repo ini tidak | **Ya** — mengubah postur keamanan | Asersi di `tests/penyaji.test.mjs`, termasuk bahwa ia **tidak** dikirim saat bukan produksi (HSTS di localhost mengunci `bun run serve` di browser pengembang selama setahun) |
| 2 | `fetchpriority="high"` tidak ada pada gambar di atas lipatan | [`standar-teknis.md`](standar-teknis.md#performa) mewajibkannya; [`src/components/Ilustrasi.astro`](../../src/components/Ilustrasi.astro) memasang `loading="eager"` saja. LCP menunggu penemuan gambar oleh preload scanner alih-alih diprioritaskan | Tidak | Gerbang keluaran di `scripts/audit-konten.mjs`: gambar `eager` pertama tiap halaman wajib membawa `fetchpriority` |
| 3 | Anggaran gambar tidak punya pemeriksa | Angka 250 KB / 100 KB sudah tertulis sejak repo rujukan dan **tidak pernah diukur satu kali pun** | Tidak | `scripts/audit-konten.mjs` sudah membaca `dist/client` — menjumlahkan byte aset per halaman adalah gerbang yang datanya sudah ada di tangannya |
| 4 | `awcmsGet` tanpa batas waktu | `awcms` yang menggantung menggantungkan build sampai batas waktu job CI (15 menit) atau selamanya di mesin lokal, dengan pesan yang tidak menyebut sebabnya | Tidak | Tiruan di `tests/kontrak-awcms.test.mjs` yang tidak pernah menjawab, dan asersi bahwa build menyerah dengan pesan yang menyebut `AWCMS_API_URL` |
| 5 | Header pembocor teknologi tidak diverifikasi | ASVS V14.4 menuntut `Server`/`X-Powered-By` tidak membocorkan versi. Keduanya kemungkinan besar memang tidak dikirim — tetapi "kemungkinan besar" bukan yang dijanjikan gerbang di repo ini | Tidak | Satu asersi negatif di `tests/penyaji.test.mjs` |
| 6 | Action GitHub dipin ke tag, image dasar dipin ke tag | Tag bisa dipindahkan. SSDF PS.2 dan OpenSSF Scorecard sama-sama menuntut pin ke SHA commit / digest | Tidak | Dependabot sudah mengelola keduanya bila dipin ke SHA; gerbang tambahan tidak perlu |
| 7 | Tidak ada analisis statik | `awcms` menjalankan CodeQL dan punya skill triase-nya. Repo ini tidak punya padanannya, dan permukaannya memang jauh lebih kecil — tetapi "lebih kecil" bukan "nol" | Tidak | Workflow CodeQL terjadwal, bukan per-PR (permukaannya tidak membenarkan biaya per-PR) |
| 8 | Core Web Vitals tidak diukur | Target di §Performa adalah klaim tanpa bukti sampai ada yang mengukurnya | Tidak | Lighthouse CI atas `dist/client` di job `build` — hanya berjalan bila situs punya sumber konten, sama seperti gerbang keluaran lain |
| 9 | Tidak ada SBOM pada rilis | SSDF PS.2. Konsumen hilir tidak bisa menjawab "apakah rilis ini terdampak advisory X" tanpa membangun ulang | Tidak | Langkah di `scripts/rilis.mjs` |

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
