# Permukaan admin USER — bentuk, prasyarat, dan batasnya

Repo ini punya **dua** peran. Yang pertama — halaman publik — dijelaskan seluruh
dokumen lain di direktori ini. Yang kedua adalah berkas ini.

Sejak [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
sebuah situs yang lahir dari template ini **boleh** membawa permukaan admin untuk
seorang **USER** — penulis, peninjau, kontributor — di sebelah halaman publiknya.
Template ini sendiri tidak membawanya, dan sebagian besar situs tidak akan
membutuhkannya. Dokumen ini untuk yang membutuhkannya.

> **Berkas ini menyatakan ulang ADR-0034 beserta fakta `awcms` yang
> membentuknya.** Pemeriksa yang sudah ada —
> [`tests/peran-situs.test.mjs`](../../tests/peran-situs.test.mjs) dan
> [`tests/kontrak-awcms.test.mjs`](../../tests/kontrak-awcms.test.mjs) —
> menegakkan bagian yang bisa ditegakkan mesin: deklarasi `permukaanAdmin`, rute
> on-demand, dan daftar permukaan yang dipanggil build.
>
> **Satu hal di sini MELEBARKAN aturan yang sudah ada alih-alih menyatakannya
> ulang**, dan itu disebut supaya tidak lolos sebagai restatement: target WCAG
> 2.2 AA di §3 kini berlaku untuk setiap permukaan terautentikasi, bukan hanya
> Jualanku (ADR-0014). ADR-0034 tidak menyebut aksesibilitas sama sekali. Ia
> **belum punya pemeriksa** — seperti aksesibilitas di repo ini secara umum —
> jadi ia penilaian manusia pada review, bukan gerbang. Untuk aturan baru
> selebihnya, [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)
> berlaku penuh: gerbangnya wajib mendarat dalam commit yang sama.

## 1. Batasnya APA YANG DIKELOLA, bukan siapa yang memakainya

Ini kalimat yang menentukan, dan ia sengaja tidak menyebut jabatan:

| | Boleh di sini | Tempatnya |
| --- | --- | --- |
| Seorang pengguna mengerjakan **bagiannya sendiri di situs ini** — menulis artikel, mengajukannya untuk ditinjau, mengurus profilnya | **Ya**, bila situsnya menyatakannya | repo ini |
| Mengelola **SISTEM** — modul, peran, tenant, jejak audit, apa pun yang lintas-tenant | **Tidak pernah** | `/admin/*` milik `awcms` |

Ukurannya **apa yang diubah layarnya**, bukan siapa yang membukanya. Seorang
`owner` yang menulis artikel sedang melakukan pekerjaan USER; seorang penulis
yang bisa menyunting daftar peran tidak sedang melakukan pekerjaan USER, apa pun
nama jabatannya.

Sumbu itu bukan pilihan repo ini sendirian: `awcms` memindahkannya dari AUDIENS
ke APA YANG DIKELOLA lewat ADR-0070, yang mempersempit ADR-0051 di sana alih-alih
men-supersede-nya. Selisihnya tercatat sebagai divergence keluarga bernama
`admin-user-surface-in-awcms-astro` dengan `reviewDate` 2027-02-04 — dan yang
ditinjau pada tanggal itu bukan apakah admin USER boleh di sini, melainkan
**apakah batasnya masih di tempat yang sama**. Permukaan yang tumbuh satu layar
per kuartal adalah cara paling wajar sebuah "admin USER" berubah menjadi admin
sistem tanpa ada yang memutuskannya.

## 2. Cara menyatakannya

Satu pintu, di [`src/config/site.ts`](../../src/config/site.ts), kosong secara
bawaan:

```ts
export const permukaanAdmin = {
  prefiks: [] as readonly string[],
  peran: [] as readonly string[]
};
```

Kosong berarti situs ini publik saja. Keduanya bergerak bersama: rute tanpa peran
adalah permukaan terautentikasi yang tidak bisa dimasuki siapa pun, dan peran
tanpa rute adalah izin yang tidak menuju ke mana-mana sambil terbaca seperti
permukaan yang ada.

Lima hal yang **memerahkan `bun test`** lewat `tests/peran-situs.test.mjs`:

1. `owner` di `permukaanAdmin.peran`, apa pun kapitalisasinya. Ia super-manajer
   sistem lengkap; situs yang bisa memasukkannya adalah pintu kedua ke seluruh
   platform, digambar di atas sebuah template.
2. Prefiks yang **menelan permukaan publik**: `/`, prefiks locale, atau slug
   sebuah tab. Ketiganya menaruh bagian publik di belakang login sementara
   situsnya tetap terbangun hijau — seluruh halamannya ada, dan setiap satu di
   antaranya kini meminta pembacanya masuk lebih dulu.
3. Deklarasi separuh — prefiks tanpa peran, atau peran tanpa prefiks.
4. Sebuah rute ber-`export const prerender = false` yang prefiksnya tidak ada di
   `permukaanAdmin.prefiks` maupun di prefiks BFF Jualanku
   ([ADR-0014](../adr/0014-rendering-campuran-dan-bff-portal.md)). Inilah yang
   membuat "publik secara bawaan" menjadi keadaan yang **ditegakkan**: satu
   berkas rute sudah cukup untuk menegakkan permukaan terautentikasi di domain
   yang pemiliknya tidak pernah memutuskan untuk memilikinya, dengan build hijau.
5. `AGENTS.md` yang berhenti menyebut `permukaanAdmin` dan peran yang dilarang.
   Kontrak kerja yang menua menjadi salah adalah yang membuat pekerjaan
   berikutnya mendarat di repo yang keliru, dan itu sudah pernah terjadi di sini.

Konfigurasi dan kode diperiksa **terpisah**, karena keduanya bisa berselisih dan
yang menentukan apa yang benar-benar disajikan adalah kode.

## 3. Apa yang berubah begitu satu rute keluar dari `output: 'static'`

Menyatakan permukaan admin bukan mengubah mode render — ia pengecualian yang
DINYATAKAN, bentuk yang sama dengan ADR-0014. Tetapi ia memindahkan situs ini
dari kelas "publik" ke kelas "publik + terautentikasi", dan sejumlah premis yang
dipegang dokumen lain gugur bersamaan:

| Yang berubah | Kenapa |
| --- | --- |
| **Sesi dan CSRF menjadi milikmu** | Situs yang menyalakan `permukaanAdmin` memikul sesi dan CSRF-nya sendiri. Itu biaya yang [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) nyatakan eksplisit supaya **dipilih, bukan diwarisi** |
| **Cache publik dan cache terautentikasi WAJIB dipisah** | Cache yang melayani pengunjung anonim tidak boleh menyentuh respons terautentikasi — bentuk kebocoran yang paling mudah dibuat dan paling sulit dilihat |
| **Postur CSP berlaku di jalur yang membawa kredensial** | [ADR-0019](../adr/0019-csp-ketat-dikirim-penyaji.md) ditulis untuk halaman publik; kebijakan yang sama kini menjaga halaman yang membawa sesi |
| **A01, A07, dan A09 OWASP kembali berlaku** | Matriks di [`standar-performa-dan-keamanan.md`](standar-performa-dan-keamanan.md) menulis "tidak berlaku" untuk sebagian besar kategori, **beserta alasannya** — dan alasan itulah yang berhenti benar di sini |
| **Target aksesibilitas naik ke WCAG 2.2 AA** | Permukaan berkontrol membawa fokus yang berpindah dan target sentuh; lihat [`ui-ux-design-system.md`](ui-ux-design-system.md) |
| **Postur header lintas-origin wajib ditinjau ULANG** | Alasan resmi repo ini tidak mengirim COOP/CORP adalah "tidak punya sesi untuk dipagari", dan alasan penolakan SRI adalah "tidak ada sumber daya lintas-origin". Keduanya premis, bukan prinsip, dan keduanya gugur di sini |

Empat aturan yang mengikat **setiap** permukaan terautentikasi di repo ini — BFF
maupun admin situs — ada di [`AGENTS.md`](../../AGENTS.md) §Peran repo ini.
Ringkasnya: `awcms` tetap system of record, izin tidak pindah bersama layar,
tidak ada cache bersama, dan setiap penambahan dinilai sebagai permukaan
keamanan.

## 4. Kontrak ke `awcms` yang BELUM ada

Ini bagian yang paling sering diremehkan, dan ia menentukan urutan kerja.

Kontrak konsumen antara kedua repo **dibekukan di sisi `awcms`** (ADR-0065):
lima path, dengan tiga di antaranya benar-benar dipanggil build ini dan dua
dijanjikan lebih dulu lewat ADR. **Tidak satu pun di antaranya adalah jalur auth
untuk permukaan admin.** Bentuknya belum diputuskan siapa pun, dan itu dinyatakan
terus terang di ADR-0070 §5 sisi sana: mekanisme untuk menjanjikan sebuah
permukaan lebih dulu memang ada, yang belum ada adalah bentuk yang bisa
dijanjikan.

Akibat praktisnya, dan ia mekanis: `tests/kontrak-awcms.test.mjs` mengeraskan
permukaan yang dipanggil build menjadi **tepat tiga**, dua arah terhadap tabel
bertanda di skill integrasi. Sebuah fitur admin USER pasti menambah permukaan
keempat — jadi ia **tidak bisa mendarat diam-diam**: gerbang itu merah, dan
penulisnya dipaksa menyatakan apa yang ia tambahkan. Merahnya bukan gangguan; ia
yang memaksa kontraknya disepakati serentak di kedua repo alih-alih ditemukan
sebagai build yang rusak berhari-hari kemudian.

## 5. Model identitas `awcms` yang harus DITIRU, bukan ditebak

Permukaan admin USER memanggil `awcms` di **setiap permintaan runtime**, bukan
sekali per build. Bentuknya karena itu ditentukan respons `awcms` pada tiap
permintaan — dan sisi sana bergerak cepat pada Agustus 2026. Yang berikut ini
bukan latar belakang; masing-masing mengubah layar yang akan kamu gambar:

| Fakta `awcms` | Akibatnya pada layar di sini |
| --- | --- |
| **Peran bisa datang dari GRUP** (ADR-0081): sebuah grup pengguna adalah SUBJEK yang memberi peran | Peran seseorang bisa berubah **tanpa satu pun perubahan pada baris orangnya**. Jangan meng-cache peran, dan jangan menyimpulkan peran dari data profil |
| **Sebuah grant membawa scope-nya sendiri** (ADR-0078, ADR-0080), dan hanya mencakup apa yang diberikan perannya | Jangan menurunkan "boleh apa" dari nama peran di sisi ini. Tanyakan, jangan simpulkan |
| **Satu manusia, satu kredensial, banyak tenant** (ADR-0085) | Pengguna situsmu mungkin juga pengguna situs lain di instans `awcms` yang sama. Layar yang berbunyi "akun situs ini" salah menggambarkan apa yang ia punya |
| **Penghitung lockout GLOBAL** (ADR-0086) | Salinan UI yang menulis "percobaan login hanya dihitung untuk situs ini" akan **berbohong**. Kegagalan di situs lain ikut mengunci di sini |
| **MFA milik principal** (ADR-0087) | Reset oleh admin tenant LAIN ikut menonaktifkan authenticator pengguna situs ini. Layar profil yang menyiratkan MFA-nya lokal salah |
| **Login tanpa tenant terpilih dijawab `409 MEMBERSHIP_SELECTION_REQUIRED`** beserta token seleksi **sekali pakai berumur 120 detik** (ADR-0088) | Alur login butuh langkah kedua, dan langkah itu punya jam. Token seleksi bukan sesi |
| **Respons `409` itu SENGAJA tidak membawa daftar keanggotaan** (ADR-0088 §"`409` TIDAK membawa daftar keanggotaan") | **Jangan merancang layar "Anda anggota tenant mana saja"** — datanya tidak akan pernah dikirim, dan permintaan agar ia dikirim adalah permintaan membangun oracle enumerasi. Pemanggil menyebutkan tenant yang ia mau |
| **Sesi ber-`origin_auth` `sso` atau `handoff` TIDAK BOLEH berpindah tenant** (ADR-0088) | `handoff` persis bentuk sesi yang ADR-0050 ciptakan untuk BFF di sini. Pengalih tenant di permukaan yang memakainya akan ditolak, dan penolakannya benar |
| **Aktor terdelegasi hanya MEMBACA di `identity_access`** (ADR-0090) | Yang ditolak 403 adalah otoritas access-control — memberi peran, membuat grup, menyetel kebijakan — **bukan** setiap layar terautentikasi. Gerbangnya menyebut satu modul dan hanya satu. Layar "urus profilmu sendiri" hidup di modul `profile_identity` dan tidak terkena. Jangan menulis pesan error untuk penolakan yang tidak akan datang, dan jangan lupa menulisnya untuk yang akan |
| **Atribusi dua sisi** (ADR-0091) | Tindakan mencatat siapa yang bertindak DAN atas nama siapa. Jangan menampilkannya sebagai satu nama |
| **Tenant `suspended` atau `inactive` → `403 TENANT_SUSPENDED`**, dan entitlement yang kurang → `403 ENTITLEMENT_REQUIRED` (ADR-0073, ADR-0084) | Keduanya diputuskan **sebelum** izin dicari. Layar yang menerjemahkannya menjadi "sesi kadaluwarsa, silakan login ulang" mengirim orang berputar-putar |

Seluruh baris di atas adalah keadaan `awcms` per 13 Agustus 2026. **Periksa
ulang sebelum membangun** — daftar ini akan menua, dan tidak ada gerbang di repo
ini yang bisa memberitahumu kapan.

## 6. Yang tidak pernah dibangun di sini

Bukan karena sulit, melainkan karena ia mengelola SISTEM:

- **Tampilan jejak audit atau log keputusan.** Itu permukaan lintas-tenant, dan
  `awcms` sudah memilikinya lengkap dengan atribusi dua sisinya.
- **Layar peran, izin, grup pengguna, atau kebijakan ABAC.** Katalognya tinggal
  di sana, dan menggambar tombolnya di sini tidak memindahkan satu izin pun —
  ia hanya membuat orang mengira izinnya berpindah.
- **Apa pun yang berbau "peran partner" atau "scope partner".** Di `awcms`
  sebuah partner adalah **tenant biasa** dan jangkauannya adalah DATA, bukan
  permission (ADR-0089). Kosakata izin keluarga tidak tumbuh untuk itu, dan
  membangun kosakata tandingan di sini adalah cara tercepat kedua repo berhenti
  sepakat.
- **Konsumsi permukaan `/api/v1/partner/**`.** Bukan milik situs.

Aturan cerminnya, dan ia berlawanan arah dengan seluruh daftar di atas: **tidak
ada fitur yang HANYA ada di sini.** Setiap fitur yang dipakai user di permukaan
admin situsmu wajib **juga** bisa dikelola `owner` lewat `/admin/*` milik
`awcms`. Yang pertama menjaga platform tidak bisa dicapai dari sini; yang kedua
menjaga tidak ada yang lepas ke sini.

## 7. Urutan kerja: `awcms` dulu, selalu

Bukan birokrasi. Fitur yang mendarat di sini lebih dulu adalah **fitur yang untuk
sementara tidak bisa dimatikan siapa pun** — dan "sementara" pada praktiknya
berarti sampai seseorang mengingatnya.

1. Pastikan kemampuannya sudah punya layar pengelolanya di `awcms`. Daftar layar
   `/admin/*` yang tersedia hari ini ada di
   [`integrasi-awcms.md`](integrasi-awcms.md) §Layar `/admin/*` awcms.
2. Sepakati bentuk permukaan barunya di `awcms` dan bekukan kontraknya di sana
   (ADR-0065). Sampai itu terjadi, `tests/kontrak-awcms.test.mjs` merah — dan
   itu memang gunanya.
3. Nyatakan `permukaanAdmin` di situsmu, lalu bangun layarnya.
4. Tinjau ulang postur header, cache, dan aksesibilitas menurut §3.

Satu hal yang **tidak** bisa diverifikasi mesin dari repo ini, dan karena itu
ditulis alih-alih digerbangi: apakah kemampuan di balik permukaanmu benar-benar
punya layar `owner` di `awcms`. Katalog permission dan registry layar tinggal di
sana, dan repo template ini tidak punya instans untuk menanyakannya. Itu
penilaian manusia pada saat review, dan menuliskannya sebagai "digerbangi" akan
menjadi klaim yang tidak bisa dipertanggungjawabkan.

## Rujukan

- [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) — publik sebagai fungsi utama; admin USER hanya bila dinyatakan
- [ADR-0014](../adr/0014-rendering-campuran-dan-bff-portal.md) — static-by-default + rute on-demand, pola yang dipakai ulang di sini
- [ADR-0023](../adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) — uji "ditulis ulang bila `awcms` berubah?", yang masih menahan implementasinya
- [`AGENTS.md`](../../AGENTS.md) §Peran repo ini — empat aturan permukaan terautentikasi
- [`integrasi-awcms.md`](integrasi-awcms.md) — kontrak build, penolakan yang ditiru, dan daftar layar `awcms`
