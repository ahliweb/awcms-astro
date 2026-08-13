---
name: awcms-astro-integrasi
description: Kontrak integrasi awcms-astro ↔ awcms — tenant dari token mesin, traversal build feed (view=full + cursor), resolusi media + asal media untuk img-src, dan penolakan yang WAJIB ditiru. Gunakan saat menyentuh src/lib/content.ts, src/lib/awcms/**, scripts/asal-media.mjs, atau saat sebuah build menerbitkan situs yang tampak benar tetapi isinya kurang.
---

# awcms-astro — kontrak integrasi dengan `awcms`

Repo ini **mengonsumsi** `awcms`; ia tidak menyajikan API. `src/lib/awcms/client.ts`
adalah satu-satunya berkas yang menghubungi `awcms`, dan `src/lib/content.ts`
satu-satunya tempat komponen menyentuh hasilnya.

## Aturan yang tidak boleh dilanggar

| Aturan | Yang terjadi bila dilanggar |
| --- | --- |
| Komponen **tidak pernah** mengambil datanya sendiri | Satu permintaan HTTP per kartu yang dirender, atau komponen async |
| Traversal memakai `view=full` **dan** `order=created_at` | Daftar mengembalikan RINGKASAN; `contentJson` `undefined`, badan artikel kosong, seksi kosong, **build tetap hijau** |
| Seluruh halaman disusuri lewat `nextCursor` | Situs terbit dengan artikel hilang — dan yang hilang justru yang terbaru |
| Tenant datang dari **token**, tidak pernah dari header | `awcms` menurunkan tenant dari kredensial mesin dan mengabaikan header yang berbeda |
| Post `published` tanpa `publishedAt` **tidak diterbitkan** | `awcms` menjawab 404 untuk post itu di `/blog/{tenantCode}/**`-nya sendiri; situs statis menerbitkannya — dua permukaan tidak sepakat tentang apa yang tayang |
| Urutan dari field yang **dinyatakan seksinya**, berakhir pada slug SUMBER | Comparator yang mengembalikan 0 menyerahkan pasangannya pada urutan API. Memecah seri dengan judul membuat seksi berjalan dalam urutan berbeda di setiap bahasa |
| `publishedDate` dan `updatedDate` dibaca dari **satu baris** | Dipasangkan lintas baris → `dateModified` mendahului `datePublished` pada konten yang sah, dan crawler membuang seluruh bloknya |
| Diam-diam memotong data = **kegagalan**, bukan optimasi | Lihat seluruh baris di atas |

## Permukaan — TIGA yang dipanggil, dua yang tidak

Bedanya penting, dan pernah salah ditulis di berkas ini sebagai "lima permukaan
yang dipakai". Penilaian `awcms` 4 Agustus 2026 sempat mencatat ENAM, dan
ADR-0065 di sana — yang mendarat hari itu juga — masih menulis "6 path"; ia
tidak pernah disunting, dan tidak seharusnya. Yang meluruskan angkanya adalah
commit sehari kemudian yang memecah `CONSUMER_PATHS` menjadi **tiga** path
CONSUMED (dipanggil hari ini) dan **dua** COMMITTED (dijanjikan lewat ADR,
sengaja dibekukan sebelum ada pemanggil: `/auth/session`,
`/access/machine-credentials`). `GET /blog/posts/{id}` yang dihapus ADR-0018
tidak ikut dibekukan. Gerbang di sana hari ini mencetak "OK — 5 consumer paths"
beserta 16 komponen yang terjangkau lewat closure `$ref`.

Perubahan non-aditif pada bentuk respons karena itu merah di CI `awcms` lebih
dulu. **Yang mewajibkan berkas ini ikut berubah adalah regenerasi yang menyentuh
path CONSUMED**, bukan setiap regenerasi: fixture di sana di-regenerate pada
13 Agustus 2026 dan yang tersentuh hanya path COMMITTED — **bukan** seluruhnya
aditif: `summary` beserta tiga `description` yang sudah beku ikut ditulis ulang,
dan itu justru sebabnya fixture-nya HARUS di-regenerate alih-alih lolos apa
adanya (komparatornya membandingkan skalar dengan kesetaraan). Aturan yang
ditulis lebih luas dari "regenerasi yang menyentuh path CONSUMED" akan terbaca
sebagai janji yang sudah dilanggar.

Daftar di bawah karena itu **digerbangi**, bukan ditulis tangan:
`tests/kontrak-awcms.test.mjs` mengekstrak jalur `/api/v1/…` dari kode sumber
`src/` dan menolak bila daftar ini menyimpang darinya, dua arah. Ia yang membuat
permukaan keempat tidak bisa mendarat tanpa berkas ini ikut berubah.

<!-- permukaan:dipanggil:mulai -->
| Permukaan yang benar-benar dipanggil build | Dipanggil dari |
| --- | --- |
| `/api/v1/blog/posts` | `src/lib/content.ts` — traversal build feed, `view=full` + `order=created_at` + cursor |
| `/api/v1/media/objects` | `src/lib/awcms/media.ts` — resolusi media, maks 100 id per permintaan |
| `/api/v1/media/public-origin` | `src/lib/awcms/media.ts` — asal media untuk `img-src` |
<!-- permukaan:dipanggil:selesai -->

```
TIDAK DIPANGGIL (3)
GET /api/v1/blog/posts/{id}    hidrasi satu post — DIHAPUS oleh ADR-0018.
                               Ia dulu N+1: satu permintaan per post, per build,
                               ke endpoint admin, pada setiap publish. Build feed
                               menggantikannya. Jangan menghidupkannya kembali
                               "untuk satu field yang kurang" — field itu ada di
                               `view=full`.
GET /api/v1/auth/session       introspeksi sesi — milik BFF portal, yang belum ada.
                               `awcms` menolak kredensial mesin di sini dengan 401
                               yang sama seperti token tak dikenal (anti-oracle,
                               ADR-0049), jadi ia BUKAN cara memeriksa token build.
POST /api/v1/access/machine-credentials
                               cara MANUSIA menerbitkan token build, sekali, di
                               luar build. Dibekukan sebagai COMMITTED di sana,
                               bukan karena repo ini memanggilnya. Sejak
                               13 Agustus 2026 permukaan ini juga menerbitkan
                               kredensial kelas TULIS — jangan pernah memakainya
                               untuk token build.
```

Ketiganya di luar blok bertanda di atas, dan **blok pagar `TIDAK DIPANGGIL (3)`
ini** yang tidak digerbangi — tabel bertanda di atasnya justru digerbangi dua
arah terhadap kode. Yang menjaga blok ini hanya mata pembaca. Bila salah satunya
mulai dipanggil `src/`, tabel di atas yang akan merah lebih dulu.

## Penolakan `awcms` yang WAJIB ditiru di tiruan tes

Tes yang tiruannya lebih longgar daripada `awcms` asli akan hijau untuk kode
yang gagal di produksi. `tests/kontrak-awcms.test.mjs` meniru ketiganya:

- `view=full` tanpa `order=created_at` → **400**, bukan diabaikan.
- Tanpa `view=full` → daftar memberi **ringkasan**, bukan baris penuh.
- `ids` lebih dari 100 → **400**, bukan dipotong diam-diam.
- Id media yang tak resolve dilaporkan di `unresolved`, **tidak dibuang**.

## Gambar dan kartu share

Diresolusi **sekali per build** di `src/lib/content.ts`, hasilnya di
`LocalizedArticle.gambar` dan `LocalizedArticle.kartuShare` (ADR-0025/0026).

- Urutan kartu share `seoImageMediaId ?? featuredMediaId` — **milik `awcms`**,
  jangan disusun ulang di sini.
- Media `awcms` menang atas seni lokal `src/assets/` — spesifik mengalahkan
  generik (ADR-0024/0025).
- **Satu id hilang** → placeholder, build lanjut. **Nol dari N** → build gagal;
  itu token tanpa `media.read`, `awcms` lebih tua, atau media tak dikonfigurasi.
- Kartu membawa MIME dan ukurannya **sendiri**. Konstanta 1200×630 hanya berlaku
  untuk `SITE_SOCIAL_IMAGE`, dan hanya karena `.env.example` mengontrakkannya.

## `img-src` ditanyakan, tidak disalin

`scripts/asal-media.mjs` menanyakan asal media saat build dan menulis
`dist/server/asal-media.json`; `server/penyaji.mjs` membacanya dan melebarkan
`img-src`. **Jangan** menyalin `NEWS_MEDIA_R2_PUBLIC_BASE_URL` ke sini — dua
salinan satu nilai yang sepakat sampai salah satunya disunting, dengan kegagalan
yang tak menyebut sebabnya: gambar diblokir diam-diam oleh kebijakan yang tampak
baik-baik saja.

`Dockerfile` **wajib** menyalin berkas itu. Tanpa itu penyaji jatuh ke
`img-src 'self'` dan setiap gambar artikel diblokir, pada image yang build-nya
hijau.

## Sebelum menambah permukaan keempat

Uji [ADR-0023](../../../docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md):
**apakah perubahan ini ditulis ulang bila `awcms` berubah?** Bila ya, ia butuh
instans `awcms` untuk dibuktikan — dan **"endpoint-nya sudah ada" bukan jawaban
"tidak"**. Repo template ini tidak punya instans; CI-nya mengondisikan build
atas `vars.AWCMS_API_URL` justru karena itu.

Uji itu **tidak** ikut dicabut saat penahanan ADR-0021 selesai
([ADR-0027](../../../docs/adr/0027-penahanan-adr-0021-selesai.md)). Premisnya
yang berubah, batasnya tidak.

## Keputusan `awcms` yang mengubah apa yang benar di sini

Periksa ini saat `awcms` merilis ADR baru — bukan setiap kali, tetapi setiap kali
sebuah ADR menyentuh konten publik, media, atau kredensial.

| `awcms` | Akibatnya di sini |
| --- | --- |
| ADR-0049/0050 — kredensial mesin + serah-terima sesi BFF | **Sudah diserap.** Tenant dari token, tanpa header tenant |
| ADR-0056 §B — objek media boleh di-purge, rujukannya jadi inert | **Sudah diserap.** Satu id hilang → placeholder; NOL dari N → build gagal |
| ADR-0071 — kosakata URL dibelah; men-supersede ADR-0059 | **Sudah diserap** ([ADR-0036](../../../docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)). Keempat rute `/news/**` **dihapus** di `awcms` pada 8 Agustus 2026 dan kini 301 ke `/blog/{tenantCode}/**` — **kecuali** untuk tenant ber-`legacyTenantRouteEnabled: false`, yang sudah mematikan seluruh permukaan konten publiknya dan karena itu tetap dijawab 404 alih-alih diberi 301 menuju 404 yang pasti (`awcms` ADR-0071 §4 butir 3); `publicRouteMode` dan `withHostResolvedBlogTenant` dicabut bersamanya. `/blog/**` kini kosakata permanen `awcms` — **path-scoped**, bukan host-resolved — dan `/news/**` kosakata repo ini, berbentuk sebuah tab. Kalimat lama "keduanya host-resolved, jadi satu domain hanya bisa dilayani salah satunya" tidak lagi menggambarkan apa pun dan sudah dihapus dari baris ini |
| Predikat publik `published_at` pada rute berita `awcms` | **Diserap sejak 7 Agustus 2026** (ADR-0033). `IS NOT NULL` ditiru persis; `<= now()` ditiru dengan toleransi condong jam 15 menit, karena kedua stempel datang dari dua mesin dan jalur normalnya terbit → webhook → build. `visibility` sengaja tetap LEBIH KETAT: keluaran statis tidak punya keadaan "hanya lewat tautan langsung" |
| ADR-0061 — permukaan host-resolved boleh di-cache di tepi | Tidak berlaku: situs ini tidak lewat Varnish, dan tidak punya cabang 404 yang membedakan tenant |
| ADR-0062 — skill digerbangi terhadap kodenya | **Diserap penuh sejak 5 Agustus 2026.** `bun run audit:dokumen` memeriksa jalur berkas yang disebut berkas ini DAN kutipan `ADR-NNNN` — yang tidak resolve ke `docs/adr/` dan tidak ditandai milik repo lain adalah pelanggaran |
| ADR-0065 — kontrak konsumen `awcms-astro` dibekukan | **Batas dijaga dua arah.** Tabel bertanda di atas digerbangi di sini (ADR-0030); bentuk respons kelima path-nya dibekukan di sana (subset aditif, closure `$ref`). Saat fixture di sana di-regenerate menyentuh path CONSUMED, adapter di sini ikut berubah — serentak |
| ADR-0070 — peran keluarga: repo ini memikul publik + admin USER | **Sudah diserap** ([ADR-0034](../../../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)). Bukan pekerjaan adapter, tetapi ia yang menentukan bahwa permukaan keempat kelak **mungkin** ada. Syaratnya dicatat di sana: penyempitan itu berlaku selama `owner` tetap ditolak gerbang di sini |
| ADR-0073 — `suspended` adalah status LAYANAN | **Mode kegagalan build BARU.** Tenant `suspended` **atau** `inactive` dijawab `403 TENANT_SUSPENDED` (`matchedPolicy: "tenant_suspended"`), dan sejak ADR itu penolakannya mengenai **kredensial mesin** juga. Diputuskan sebelum permission dicari, jadi tidak ada scope token yang memperbaikinya. Build gagal total, nol berkas terbit — dan terbaca persis seperti token dicabut |
| ADR-0084 — sebuah entitlement MENOLAK, ia tidak pernah memberi | **Kosakata penolakan baru, tetapi BELUM bisa mengenai build ini.** `403 ENTITLEMENT_REQUIRED` punya bentuk yang sama dengan `TENANT_SUSPENDED` — di atas pembacaan grant — tetapi entitlement diputuskan per MODUL, dan satu-satunya modul `awcms` yang mendeklarasikannya hari ini adalah `tenant_domain` (`custom_domain`, di paket DEFAULT, menolak nol tenant). Build ini hanya memanggil `blog_content` dan `media_library`. Dicatat karena bentuknya, bukan karena ia sudah muncul di log. ADR yang sama menaikkan `moduleDescriptorContractVersion` keluarga ke **3.1.0** (field opsional `requiresEntitlement`) — penambahan murni, nol pekerjaan di sini |
| ADR-0083 — template `awcms` men-deploy ke SATU environment | **Kosakata keluarga menyempit.** Anggota `"staging"` **dihapus** dari union profil deployment modul (kini `development | production | offline-lan`), jadi contoh maupun dokumen di sini tidak boleh lagi menarasikan "token staging" sebagai lingkungan sejajar produksi |
| ADR-0092 — kredensial mesin boleh MENULIS | **Premis lama gugur, dan ia premis keamanan.** "Kredensial mesin tidak bisa menulis" berhenti menjadi sifat KELAS: kelas tulis ada, dengan plafon aksi `create`/`update` **di kode** (bukan kolom), wajib terikat CIDR, **DITOLAK bila `clientIp` tidak diketahui** (fail-closed), umur maksimum 30 hari (CHECK basis data 31) alih-alih 365, dan sentinel penolakan `machine_credential_write_forbidden`. Setiap kredensial yang terbit sebelum migrasinya tetap baca-saja tanpa backfill. **Token build repo ini WAJIB tetap di kelas baca** — kini keputusan penerbitan yang dipertahankan, bukan sifat yang diwarisi. Diserap di [`.env.example`](../../../.env.example) dan banner [ADR-0018](../../../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md) |

**Gelombang ADR `awcms` 0072–0092 (9–13 Agustus 2026) sudah dibaca seluruhnya,
dan yang tidak muncul di tabel di atas tidak relevan di sini — bukan belum
diperiksa.** Yang tidak relevan beserta alasannya, supaya diamnya bisa
dibedakan: 0072 (retensi log keputusan), 0074/0077 (outbox dan sync pull),
0075 (SSE), 0076 (deskriptor retensi tabel infrastruktur), 0078–0082
(bentuk grant, grup pengguna, undangan), 0085–0088 (identitas, lockout, MFA,
pemilihan tenant), 0089–0091 (partner, akses terdelegasi, atribusi) — seluruhnya
menyentuh permukaan **terautentikasi** dan tidak satu pun menyentuh jalur build
statis. **Tiga gugus terakhir** (0078–0082, 0085–0088, 0089–0091) tetap penting bagi repo ini, tetapi tempatnya
[`permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md),
bukan berkas ini: mereka membentuk permukaan admin USER, bukan adapter konten.

## Batas waktu: ada, dan TIDAK sama dengan retry

`awcmsGet` memasang `AbortSignal.timeout` — bawaan 30 detik, diubah lewat
`AWCMS_API_TIMEOUT_MS`. Ia tidak bertabrakan dengan aturan "tanpa retry" di atas,
dan bedanya perlu dipegang: **tanpa-retry memutuskan apa yang terjadi saat
`awcms` menjawab buruk; batas waktu memutuskan apa yang terjadi saat ia tidak
pernah menjawab sama sekali.** Keduanya berakhir sama — build gagal, nol berkas
terbit.

Yang dijaganya bukan kelambatan melainkan **kesenyapan**: koneksi yang diterima
lalu tidak pernah dijawab, bentuk kegagalan paling umum dari basis data yang
kehabisan koneksi. `fetch` tidak punya batas waktu bawaan, jadi sebelum ini build
menggantung sampai batas job CI membunuhnya — dengan pesan yang menyebut nama
job, bukan `awcms`.

Dua hal yang jangan diubah tanpa membaca alasannya:

- **Batasnya longgar (30 detik), dan itu disengaja.** `view=full` membawa
  `contentJson` utuh; tenant besar di basis data dingin bisa sah-sah saja lambat.
  Menyetelnya ke nilai "jalur permintaan sehat" mengubah build lambat menjadi
  build gagal — kebalikan dari gunanya.
- **Nilai yang cacat DITOLAK, termasuk `0`.** `0` terlihat seperti "tanpa batas"
  dan justru mengembalikan gantungan yang gerbang ini ada untuk mencegah.

## Rujukan

- [`docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md`](../../../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md)
- [`docs/adr/0025-gambar-artikel-dari-media-awcms.md`](../../../docs/adr/0025-gambar-artikel-dari-media-awcms.md)
- [`docs/adr/0027-penahanan-adr-0021-selesai.md`](../../../docs/adr/0027-penahanan-adr-0021-selesai.md)
- [`docs/awcms-astro/integrasi-awcms.md`](../../../docs/awcms-astro/integrasi-awcms.md)
- [`AGENTS.md`](../../../AGENTS.md) §Sumber data
