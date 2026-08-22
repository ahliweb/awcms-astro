---
name: awcms-astro-integrasi
description: Kontrak integrasi awcms-astro ↔ awcms — tenant dari token mesin, traversal build feed (view=full + cursor), resolusi media + asal media untuk img-src, dan penolakan yang WAJIB ditiru. Gunakan saat menyentuh src/lib/content.ts, src/lib/awcms/**, scripts/asal-media.mjs, atau saat sebuah build menerbitkan situs yang tampak benar tetapi isinya kurang.
---

🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](SKILL.md)

<!-- i18n-source-hash: sha256:2fb736a036ba047cbd463d6eea8985c6ccf7cce8614b2998d2d95af622c0ffdb -->

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
| Post `published` tanpa `publishedAt` **tidak diterbitkan** | `awcms` menjawab 404 untuk post itu di permukaan publiknya sendiri (`/{locale}/blog/{tenantCode}/**` sejak ADR-0098 di sana); situs statis menerbitkannya — dua permukaan tidak sepakat tentang apa yang tayang |
| Urutan dari field yang **dinyatakan seksinya**, berakhir pada slug SUMBER | Comparator yang mengembalikan 0 menyerahkan pasangannya pada urutan API. Memecah seri dengan judul membuat seksi berjalan dalam urutan berbeda di setiap bahasa |
| `publishedDate` dan `updatedDate` dibaca dari **satu baris** | Dipasangkan lintas baris → `dateModified` mendahului `datePublished` pada konten yang sah, dan crawler membuang seluruh bloknya |
| Diam-diam memotong data = **kegagalan**, bukan optimasi | Lihat seluruh baris di atas |

## Permukaan — TUJUH yang dipanggil, dua yang tidak

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
permukaan baru tidak bisa mendarat tanpa berkas ini ikut berubah.

**Permukaan keempat mendarat 22 Agustus 2026** — `/api/v1/site-profile/composed`
(`awcms` #596, ADR-0102), tempat identitas situs ini sendiri berasal. Ia melewati
gerbang ini dalam urutan yang diwajibkan Definition of Done, dan urutan itu layak
dibaca sekali karena justru itulah inti sebuah kontrak lintas-repo: `awcms`
membekukan bentuknya LEBIH DULU, memasukkannya sebagai **COMMITTED** — sebuah
janji, karena belum ada yang memanggil — dan baru setelah itu repo ini mulai
memanggilnya, saat mana entri itu berpindah ke CONSUMED di sana. Urutan
sebaliknya akan menaruh build ini di atas bentuk yang belum disanggupi repo
sebelah, persis kegagalan yang dipindahkan fixture itu ke tempat yang bisa
dilihat orang.

**Yang kelima mendarat dengan cara yang sama** — `/api/v1/blog/terms` (`awcms`
#597 butir 1, ADR-0104), kosakata tenant, yang membuat arsip kategori atau tag
mungkin sama sekali. Dua hal tentangnya tidak opsional:

- **Selalu `?order=created_at` dengan `nextCursor`, tidak pernah list
  bawaannya.** List itu `name ASC` dengan `LIMIT` berbatas dan mengembalikan
  array telanjang — tidak ada apa pun di dalamnya yang bisa berkata "masih ada
  lagi". Kosakata tag yang tumbuh di atas arsip 23.906 artikel akan terpotong di
  sekitar huruf B, dan situs akan membangun seratus halaman arsip dari ribuan
  dengan setiap gerbang hijau.
- **Role kredensial build butuh `blog_content.taxonomies.read`.** Kredensial
  yang dicetak sebelum ADR-0104 di `awcms` memilikinya hanya bila role-nya
  memang sudah. 403 atau 404 memperingatkan dan membangun tanpa arsip; selain
  itu melempar — kosakata kosong adalah keadaan yang sah, jadi `catch`
  menyeluruh akan menjadikan "CMS Anda mati" dan "redaksi ini tidak memakai
  kategori" peristiwa yang sama.

**Yang keenam dan ketujuh mendarat bersama** — `/api/v1/blog/menus` dan
`/api/v1/blog/widgets` (`awcms` #597 butir 6, ADR-0105 di `awcms`). Keduanya
baru bisa dibekukan SETELAH `awcms` #652 memberi kedua responsnya skema
sungguhan: sebelum itu masing-masing mendeklarasikan array `object` telanjang,
yang bukan bentuk yang salah melainkan tanpa bentuk, dan membekukannya sama
dengan membekukan janji yang tidak bisa gagal terhadap apa pun.

Dua aturan atas keduanya, dan tak satu pun opsional:

- **Menu CMS TIDAK menggantikan bilah tab.** Item menu `awcms` membawa SATU
  label — tidak ada label per-locale di skemanya — jadi navigasi primer yang
  digerakkan CMS akan mengembalikan antarmuka utama situs ini ke satu bahasa.
  Bilah tab merender lewat katalog PO dan tetap tinggal; menu CMS adalah wilayah
  sekunder di footer.
- **`bodyText` di-escape, tidak pernah dirender sebagai HTML.** Jalur tulis di
  sana MENOLAK markup alih-alih menyanitasinya, jadi merendernya sebagai HTML
  akan memberikan kepercayaan yang justru ditolak jalur itu.

Item menu bertipe `page` dibuang dengan peringatan yang menyebutnya: template
ini tidak punya rute page, dan tautan mati yang terbit adalah masalah pembaca
sementara peringatannya sampai ke editor yang bisa memperbaikinya.

<!-- permukaan:dipanggil:mulai -->
| Permukaan yang benar-benar dipanggil build | Dipanggil dari |
| --- | --- |
| `/api/v1/blog/posts` | `src/lib/content.ts` — traversal build feed, `view=full` + `order=created_at` + cursor |
| `/api/v1/media/objects` | `src/lib/awcms/media.ts` — resolusi media, maks 100 id per permintaan |
| `/api/v1/media/public-origin` | `src/lib/awcms/media.ts` — asal media untuk `img-src` |
| `/api/v1/site-profile/composed` | `src/lib/awcms/profil.ts` — identitas situs: masthead, footer, kontak, tautan sosial, `Organization` |
| `/api/v1/blog/terms` | `src/lib/awcms/taksonomi.ts` — kosakata tenant untuk arsip kategori/tag, `order=created_at` + cursor (tidak pernah list abjad bawaannya, yang memotong diam-diam) |
| `/api/v1/blog/menus` | `src/lib/awcms/navigasi.ts` — menu navigasi tenant, dirender sebagai wilayah SEKUNDER di footer; bilah tab yang terlokalkan TIDAK diganti |
| `/api/v1/blog/widgets` | `src/lib/awcms/navigasi.ts` — widget di posisi yang dinyatakannya; `bodyText` teks biasa dan di-escape, tidak pernah dirender sebagai HTML |
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
| ADR-0071 — kosakata URL dibelah; men-supersede ADR-0059 | **Sudah diserap** ([ADR-0036](../../../docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)). Keempat rute `/news/**` **dihapus** di `awcms` pada 8 Agustus 2026 dan kini 301 ke `/blog/{tenantCode}/**` — **kecuali** untuk tenant ber-`legacyTenantRouteEnabled: false`, yang sudah mematikan seluruh permukaan konten publiknya dan karena itu tetap dijawab 404 alih-alih diberi 301 menuju 404 yang pasti (`awcms` ADR-0071 §4 butir 3); `publicRouteMode` dan `withHostResolvedBlogTenant` dicabut bersamanya. `/blog/**` kini kosakata permanen `awcms` — **path-scoped**, bukan host-resolved — dan `/news/**` kosakata repo ini, berbentuk sebuah tab. Kalimat lama "keduanya host-resolved, jadi satu domain hanya bisa dilayani salah satunya" tidak lagi menggambarkan apa pun dan sudah dihapus dari baris ini. **BENTUK kosakata itu bergerak lagi pada 15 Agustus 2026** — lihat baris ADR-0098 di bawah; pembelahan kepemilikan yang diputuskannya tidak |
| Predikat publik `published_at` pada rute berita `awcms` | **Diserap sejak 7 Agustus 2026** (ADR-0033). `IS NOT NULL` ditiru persis; `<= now()` ditiru dengan toleransi condong jam 15 menit, karena kedua stempel datang dari dua mesin dan jalur normalnya terbit → webhook → build. `visibility` sengaja tetap LEBIH KETAT: keluaran statis tidak punya keadaan "hanya lewat tautan langsung" |
| ADR-0061 — permukaan host-resolved boleh di-cache di tepi | Tidak berlaku: situs ini tidak lewat Varnish, dan tidak punya cabang 404 yang membedakan tenant |
| ADR-0062 — skill digerbangi terhadap kodenya | **Diserap penuh sejak 5 Agustus 2026.** `bun run audit:dokumen` memeriksa jalur berkas yang disebut berkas ini DAN kutipan `ADR-NNNN` — yang tidak resolve ke `docs/adr/` dan tidak ditandai milik repo lain adalah pelanggaran |
| ADR-0065 — kontrak konsumen `awcms-astro` dibekukan | **Batas dijaga dua arah.** Tabel bertanda di atas digerbangi di sini (ADR-0030); bentuk respons kelima path-nya dibekukan di sana (subset aditif, closure `$ref`). Saat fixture di sana di-regenerate menyentuh path CONSUMED, adapter di sini ikut berubah — serentak |
| ADR-0070 — peran keluarga: repo ini memikul publik + admin USER | **Sudah diserap** ([ADR-0034](../../../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)). Bukan pekerjaan adapter, tetapi ia yang menentukan bahwa permukaan keempat kelak **mungkin** ada. Syaratnya dicatat di sana: penyempitan itu berlaku selama `owner` tetap ditolak gerbang di sini |
| ADR-0073 — `suspended` adalah status LAYANAN | **Mode kegagalan build BARU.** Tenant `suspended` **atau** `inactive` dijawab `403 TENANT_SUSPENDED` (`matchedPolicy: "tenant_suspended"`), dan sejak ADR itu penolakannya mengenai **kredensial mesin** juga. Diputuskan sebelum permission dicari, jadi tidak ada scope token yang memperbaikinya. Build gagal total, nol berkas terbit — dan terbaca persis seperti token dicabut |
| ADR-0084 — sebuah entitlement MENOLAK, ia tidak pernah memberi | **Kosakata penolakan baru, tetapi BELUM bisa mengenai build ini.** `403 ENTITLEMENT_REQUIRED` punya bentuk yang sama dengan `TENANT_SUSPENDED` — di atas pembacaan grant — tetapi entitlement diputuskan per MODUL, dan satu-satunya modul `awcms` yang mendeklarasikannya hari ini adalah `tenant_domain` (`custom_domain`, di paket DEFAULT, menolak nol tenant). Build ini hanya memanggil `blog_content` dan `media_library`. Dicatat karena bentuknya, bukan karena ia sudah muncul di log. ADR yang sama menaikkan `moduleDescriptorContractVersion` keluarga ke **3.1.0** (field opsional `requiresEntitlement`) — penambahan murni, nol pekerjaan di sini |
| ADR-0083 — template `awcms` men-deploy ke SATU environment | **Kosakata keluarga menyempit.** Anggota `"staging"` **dihapus** dari union profil deployment modul (kini `development | production | offline-lan`), jadi contoh maupun dokumen di sini tidak boleh lagi menarasikan "token staging" sebagai lingkungan sejajar produksi |
| ADR-0093 — partner yang di-suspend BERHENTI menjangkau | **Mode kegagalan build BERSYARAT — yang pertama yang bergantung pada siapa MENERBITKAN token.** `403 PARTNER_SUSPENDED` (`matchedPolicy: "partner_suspended"`) menolak setiap aktor **terdelegasi** yang partnernya tidak lagi `active`, di chokepoint, per permintaan. Kredensial mesin mewarisi `principal_kind` akun layanannya, dan tidak ada apa pun di jalur penerbitan `awcms` yang melarang akun layanan itu berupa tenant user **terdelegasi**: pemilih akun layanan mendaftar setiap tenant user tanpa menyaring jenisnya. Yang keliru memilih pasti admin tenant situs — agensinya sendiri tidak bisa menerbitkan apa pun di `identity_access` (`awcms` ADR-0090). Aturannya karena itu operasional: terbitkan token build atas akun layanan milik tenant **situs**. Dan diagnosisnya sengaja dipersulit oleh keputusan yang benar di sana: suspensi membuat grant **tidak berlaku, bukan tidak ada**, jadi memeriksa daftar grant tidak akan menunjukkan sesuatu yang hilang |
| ADR-0094 — seorang subjek data dijawab PER TENANT | **Nol pekerjaan adapter, dan justru itu yang harus dicatat.** Build ini menerbitkan **salinan statis**, jadi anonimisasi seorang subjek di `awcms` tidak menjangkau satu pun berkas yang sudah terbit sampai build berikutnya — dan salinan yang sudah tersebar bisa hidup lebih lama lagi (cache CDN, riwayat git `dist/` bila sebuah situs meng-commit keluarannya). Yang membuat itu **tidak** menjadi masalah hari ini adalah sebuah keputusan, bukan kebetulan: template ini menerbitkan **nol data per-orang** — `author` JSON-LD adalah `Organization` ([`src/lib/schema.ts`](../../../src/lib/schema.ts), digerbangi [`tests/schema.test.mjs`](../../../tests/schema.test.mjs)) dan `<author>` feed adalah nama situs ([`src/lib/feed.ts`](../../../src/lib/feed.ts), keputusan yang **tidak** digerbangi — `tests/feed.test.mjs` tidak memeriksanya, jadi jangan membacanya sebagai terjaga). Situs yang menambah byline, avatar penulis, atau komentar **mengambil kewajiban itu**, dan jalur penghapusannya berakhir di sebuah rebuild. ADR yang sama menaikkan `moduleDescriptorContractVersion` keluarga ke **4.0.0** (union `SubjectDataErasure` melebar, `tenantColumn` menjadi `string \| null`) — nol pekerjaan di sini, karena repo ini tidak mendeklarasikan satu deskriptor modul pun |
| ADR-0092 — kredensial mesin boleh MENULIS | **Premis lama gugur, dan ia premis keamanan.** "Kredensial mesin tidak bisa menulis" berhenti menjadi sifat KELAS: kelas tulis ada, dengan plafon aksi `create`/`update` **di kode** (bukan kolom), wajib terikat CIDR, **DITOLAK bila `clientIp` tidak diketahui** (fail-closed), umur maksimum 30 hari (CHECK basis data 31) alih-alih 365, dan sentinel penolakan `machine_credential_write_forbidden`. Setiap kredensial yang terbit sebelum migrasinya tetap baca-saja tanpa backfill. **Token build repo ini WAJIB tetap di kelas baca** — kini keputusan penerbitan yang dipertahankan, bukan sifat yang diwarisi. Diserap di [`.env.example`](../../../.env.example) dan banner [ADR-0018](../../../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md) |
| ADR-0098 — kunci cache membawa locale, dan membawanya di PATH | **Keputusan `awcms` pertama sejak ADR-0071 yang mengubah BENTUK sebuah URL publik, dan yang pertama sejak lama yang tidak menyentuh apa pun di adapter.** Sejak 15 Agustus 2026 URL konten publik kanonik di sana adalah `/{locale}/blog/{tenantCode}/**`; path telanjang tidak merender apa pun dan menjawab `307`, `private, no-store`. Dua akibat di sini, dan keduanya dokumentasi, bukan kode. **Pertama:** setiap kalimat di repo ini yang mengarahkan pembaca ke permukaan publik `awcms` sendiri menyebut URL yang kini me-redirect, dan tautan `/news/**` yang dipensiunkan kini **dua lompatan** — `301` ke path telanjang, lalu `307` ke yang berprefiks — karena penulisan ulang `Location` di sana hanya membawa locale yang sudah dimiliki pembacanya. **Kedua, dan inilah yang layak dipegang:** repo ini **tidak** mengikuti prefiks itu. Locale defaultnya tetap memegang akar (`/panduan/`, bukan `/id/panduan/`), karena kegagalan yang menjadi alasan keberadaan ADR-0098 secara struktural tidak tersedia pada build statis — `server/penyaji.mjs` membaca `req.url` dan tidak ada yang lain, jadi kunci cache dan badannya sudah sepakat. Yang DISERAP adalah keputusan 2 ADR itu: `Vary: Cookie` dan `Vary: Accept-Language` DITOLAK pada setiap respons di sini. Dicatat beserta pemeriksanya di [ADR-0041](../../../docs/adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md) |
| ADR-0097 — Inggris bahasa sumber, Indonesia cerminnya | **Penyelarasan keluarga, dan repo ini sampai lebih dulu.** Keputusan yang sama mendarat di sini sebagai [ADR-0039](../../../docs/adr/0039-english-is-the-source-language.md) dengan mekanisme yang sama — penanda pindah ke cermin, gerbangnya MENDETEKSI penyimpangan dan tidak pernah menerjemahkan, dan buku besarnya hanya boleh menyusut. Satu-satunya perbedaan adalah ukurannya, dan itu perlu diketahui sebelum membaca apa pun di sana: buku besar repo itu dibuka pada **253** dokumen tertunggak, jadi **`<nama>.md` telanjang di `awcms` masih jauh lebih sering berbahasa Indonesia daripada tidak**. Jangan membaca jalur sebuah dokumen `awcms` sebagai janji tentang bahasanya, belum |
| ADR-0095/0096/0099 — bahasa pembaca, permukaan akun swalayan, dan alamat login | **Nol untuk adapter — dan tempatnya bukan berkas ini.** Ketiganya membentuk permukaan TERAUTENTIKASI: di mana preferensi bahasa tinggal (di PRINCIPAL, global, tanpa `tenant_id`), apa yang boleh diubah seseorang tentang dirinya sendiri tanpa izin apa pun, dan bukti apa yang dituntut sebuah pemindahan alamat. Ketiganya penting bagi peran KEDUA repo ini dan akibatnya dicatat di [`permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md) §5. Disebut di sini semata supaya ketiadaannya di tabel ini terbaca "diperiksa, tempatnya di tempat lain" alih-alih "belum dibaca" |

**Gelombang ADR `awcms` 0072–0099 (9–15 Agustus 2026) sudah dibaca seluruhnya,
dan yang tidak muncul di tabel di atas tidak relevan di sini — bukan belum
diperiksa.** Yang tidak relevan beserta alasannya, supaya diamnya bisa
dibedakan: 0072 (retensi log keputusan), 0074/0077 (outbox dan sync pull),
0075 (SSE), 0076 (deskriptor retensi tabel infrastruktur), 0078–0082
(bentuk grant, grup pengguna, undangan), 0085–0088 (identitas, lockout, MFA,
pemilihan tenant), 0089–0091 (partner, akses terdelegasi, atribusi) — seluruhnya
menyentuh permukaan **terautentikasi** dan tidak satu pun menyentuh jalur build
statis. **Tiga gugus terakhir** (0078–0082, 0085–0088, 0089–0091) tetap penting bagi repo ini, tetapi tempatnya
[`permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md),
bukan berkas ini: mereka membentuk permukaan admin USER, bukan adapter konten —
begitu pula 0095, 0096, dan 0099, yang punya baris di atas justru karena itu.

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
