🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)

<!-- i18n-source-hash: sha256:4928bb6a0d598289252a689f5605c7d3091c4c74dd82e582dee196cfa29a6baf -->

# ADR-0034 — Publik sebagai fungsi utama; admin USER hanya bila dinyatakan, admin utama tidak pernah

- **Status:** Accepted
- **Tanggal:** 8 Agustus 2026
- **Aturan pemilik:** 8 Agustus 2026 — "repo ini merupakan default … sebagai halaman publik kecuali dinyatakan juga sebagai halaman admin", dipertajam dua kali dalam percakapan yang sama: "hanya boleh menjadi halaman admin untuk user, bukan admin utama (owner)" dan "selain fungsi utamanya sebagai halaman publik".
- **Mempersempit:** [ADR-0020](0020-layar-admin-kembali-ke-awcms.md) (repo ini tidak memikul layar admin sama sekali) — **tidak** men-supersede-nya; lihat §Hubungan dengan ADR-0020
- **Terkait:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (static-by-default + rute on-demand — polanya dipakai ulang di sini), [ADR-0017](0017-peran-admin-owner-internal.md) (empat aturan permukaan terautentikasi yang tetap berlaku), [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (uji "ditulis ulang bila `awcms` berubah?"), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (aturan baru wajib membawa pemeriksanya), `awcms` [ADR-0045](https://github.com/ahliweb/awcms/blob/main/docs/adr/0045-jualanku-porting-awcms-system-of-record-astro-bff.md), `awcms` [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md) (seluruh layar admin dipusatkan di sana)

## Konteks

`AGENTS.md` §Peran repo ini berbunyi, sejak ADR-0020: **"Repo ini tidak memikul
layar admin."** Kalimat itu mutlak, dan kemutlakannya menjawab pertanyaan yang
salah.

Yang benar-benar diputuskan ADR-0020 adalah bahwa **layar admin SISTEM** —
modul, peran, tenant, jejak audit, apa pun yang lintas-tenant — dibangun di
`awcms`, karena memindahkan layar tidak pernah menjadi kontrol keamanan yang
diklaimkan. Alasan itu masih benar hari ini, dan ADR ini tidak menyentuhnya.

Yang tidak pernah ditanyakan ADR-0020: **apakah seorang PENGGUNA situs boleh
mengerjakan bagiannya sendiri di situs itu.** Seorang penulis yang mengarang
artikel untuk sebuah situs berita bukan operator platform. Ia tidak mengelola
modul, tidak menyentuh tenant lain, dan tidak butuh satu pun layar yang `awcms`
ADR-0051 pusatkan. Ia butuh satu tempat untuk menulis, mengirim untuk ditinjau,
dan mengurus profilnya — di domain situs yang ia isi.

Kalimat mutlak itu melarangnya, dan tidak ada satu pun alasan ADR-0020 yang
sebenarnya berlaku padanya.

### Kenapa ini butuh keputusan, bukan sekadar dibolehkan

Karena bentuk kegagalannya senyap, dan ia bentuk yang sudah dikenal repo ini.

`output: 'static'` adalah premis template ini: kontainer tidak pernah
menghubungi basis data, dan seluruh postur keamanannya bersandar pada itu. Satu
berkas rute dengan `export const prerender = false` sudah cukup untuk
membatalkannya — dan **tidak ada yang gagal**. Build hijau, situs terbit, dan
sebuah permukaan terautentikasi berdiri di domain yang pemiliknya tidak pernah
memutuskan untuk memilikinya.

Sebuah aturan yang membolehkan permukaan admin karena itu harus datang bersama
cara MENYATAKANNYA, dan cara menolak yang tidak dinyatakan.

## Keputusan

### 1. Publik adalah fungsi UTAMA, bukan sekadar bawaan

Repo ini, dan setiap situs yang lahir darinya, adalah **halaman publik**. Itu
keadaan asalnya dan tetap keadaan utamanya sekalipun sebuah permukaan admin
dinyatakan.

Konsekuensi yang ditegakkan, bukan sekadar ditulis: `permukaanAdmin.prefiks`
**tidak boleh** `/`, tidak boleh prefiks locale, dan tidak boleh slug sebuah
tab. Ketiganya menaruh bagian publik di belakang login — dan situsnya tetap
terbangun hijau. Seluruh halamannya ada; setiap satu di antaranya kini meminta
pembacanya masuk lebih dulu.

### 2. Admin hanya bila DINYATAKAN, lewat satu pintu

`permukaanAdmin` di [`src/config/site.ts`](../../src/config/site.ts), kosong
secara bawaan:

```ts
export const permukaanAdmin = {
  prefiks: [] as readonly string[],
  peran: [] as readonly string[]
};
```

Kosong berarti situs ini publik saja. Keduanya bergerak bersama: rute tanpa
peran adalah permukaan terautentikasi yang tidak bisa dimasuki siapa pun, dan
peran tanpa rute adalah izin yang tidak menuju ke mana-mana sambil terbaca
seperti permukaan yang ada.

### 3. Admin untuk USER, tidak pernah ADMIN UTAMA

Ini batasnya, dan ia bukan nuansa dari butir sebelumnya.

| | Boleh di sini | Tempatnya |
| --- | --- | --- |
| Seorang pengguna mengerjakan bagiannya sendiri di situs ini — menulis, mengirim untuk ditinjau, mengurus profilnya | **Ya**, bila dinyatakan | `awcms-astro` |
| Mengelola SISTEM — modul, peran, tenant, jejak audit, apa pun yang platform-scoped | **Tidak pernah** | `/admin/*` milik `awcms` |

`owner` karena itu **ditolak** dari `permukaanAdmin.peran`. Ia super-manajer
sistem lengkap; sebuah situs yang bisa memasukkannya di sini adalah pintu kedua
ke seluruh platform, digambar di atas sebuah template. Penolakannya mekanis —
`bun test` merah — bukan imbauan.

### 4. Tidak ada fitur yang HANYA ada di sini

Template ini memang dimaksudkan tumbuh menjadi **banyak variasi** — tiap situs
turunan punya permukaan publiknya sendiri dan, bila dinyatakan, permukaan admin
user-nya sendiri, sesuai kebutuhan pengelolaan fitur penggunanya. Yang tidak
boleh ikut bervariasi adalah satu hal:

> **Setiap fitur yang dipakai user di permukaan admin situs ini WAJIB juga bisa
> dikelola `owner` lewat `/admin/*` milik `awcms`.**

Aturan ini berlawanan arah dengan §3 dan justru karena itu melengkapinya. §3
menjaga `owner` tidak bisa MASUK ke sini; butir ini menjaga tidak ada apa pun di
sini yang LEPAS dari `owner`. Tanpa yang kedua, situs turunan bisa menumbuhkan
kemampuan yang tidak terlihat, tidak teraudit, dan tidak bisa dicabut dari
tempat yang seharusnya memegang kendali penuh — persis "pintu kedua" yang §3
tutup, hanya masuk dari arah sebaliknya.

Konsekuensi praktisnya, dan ini yang menentukan urutan kerja:

- **Permukaan user di sini adalah PROYEKSI dari kemampuan yang sudah ada di
  `awcms`, bukan kemampuan baru.** Datanya tetap di sana, izinnya tetap
  diputuskan di sana, dan jejak auditnya tetap tercatat di sana.
- **Bila sebuah fitur belum bisa dikelola `owner` di `awcms`, ia belum boleh
  muncul di sini.** Urutannya `awcms` dulu, selalu — bukan karena birokrasi,
  melainkan karena fitur yang mendarat di sini lebih dulu adalah fitur yang
  untuk sementara tidak bisa dimatikan siapa pun.
- **"Variasi" berarti bentuk permukaannya, bukan kumpulan kemampuannya.** Dua
  situs turunan boleh sangat berbeda dalam apa yang mereka tampilkan dan
  bagaimana; keduanya tetap berdiri di atas kemampuan yang sama, yang dimiliki
  dan dikendalikan `awcms`.

**Sejauh mana ini bisa digerbangi, dan sejauh mana tidak** — dinyatakan karena
[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) menuntutnya:

`tests/kontrak-awcms.test.mjs` mengeraskan daftar permukaan `awcms` yang
dipanggil repo ini menjadi tepat tiga, dan menuntutnya sama dua arah dengan
tabel bertanda di skill integrasi. Sebuah fitur admin user yang baru **pasti**
menambah permukaan keempat, jadi ia tidak bisa mendarat diam-diam: gerbang itu
merah, dan penulisnya dipaksa menyatakan apa yang ia tambahkan.

Yang **tidak** bisa diverifikasi mesin dari repo ini: apakah kemampuan di balik
permukaan itu benar-benar punya layar `owner` di `awcms`. Katalog permission dan
registry layar tinggal di sana, dan repo ini tidak punya instans untuk
menanyakannya. Itu penilaian manusia pada saat review, dan menuliskannya sebagai
"digerbangi" akan menjadi klaim yang tidak bisa dipertanggungjawabkan.

### 5. Satu `awcms`, banyak situs

Topologinya searah dan perlu dinyatakan, karena setiap butir di atas berubah
maknanya bila dibaca seolah hanya ada satu situs:

> Sebuah instans `awcms` boleh memiliki **banyak** repo situs — masing-masing
> dengan halaman publiknya sendiri dan, bila dinyatakan, halaman admin user-nya
> sendiri. Semuanya tetap merujuk `awcms` yang sama sebagai **backend** dan
> sebagai **admin utama (`owner`)**.

Sebuah repo turunan karena itu bukan "sistemnya"; ia satu wajah dari satu
sistem. Yang mengikuti dari situ:

- **Sebuah situs tidak pernah boleh mengandaikan dirinya satu-satunya.** Tenant
  datang dari token build-nya sendiri, dengan `AWCMS_TENANT_ID` sebagai asersi
  silang ([ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md));
  itu sudah menjadi jalur yang benar untuk topologi ini, dan tidak berubah.
- **`owner` mengelola SEMUANYA dari satu tempat.** Itu justru yang hilang bila
  §4 dilanggar: kemampuan yang hanya ada di satu situs membuat kendali owner
  berlubang tepat di situs itu, dan lubangnya tidak terlihat dari `/admin/*`
  mana pun.
- **Kemampuan yang dipakai beberapa situs tinggal di `awcms` SEKALI**, bukan
  disalin per situs. Dua salinan satu kemampuan adalah dua tempat yang harus
  ditambal saat satu di antaranya salah — dan yang kedua biasanya tidak ikut
  ditambal.
- **"Banyak variasi" karena itu berarti banyak PERMUKAAN di atas satu fondasi**,
  bukan banyak fondasi yang mirip.

### 6. Menyatakannya tidak memindahkan satu izin pun

Butir ADR-0017 yang ADR-0020 pertahankan, dan ia yang membuat ADR ini bukan
pembalikan: **RBAC/ABAC default-deny `awcms` tetap yang memutuskan setiap
permintaan.** Deklarasi di sini menggambar tombol; ia tidak memberi apa pun, dan
peran yang ditolak `awcms` tetap ditolak dengan tombolnya terpampang.

Tiga aturan ADR-0017 lainnya ikut berlaku penuh atas permukaan ini, sama seperti
atas BFF Jualanku: `awcms` tetap system of record dan repo ini tanpa basis data;
tidak ada cache bersama antara permukaan publik dan terautentikasi; dan setiap
penambahan dinilai sebagai **permukaan keamanan**, bukan sekadar halaman.

### 7. Pemeriksanya mendarat bersama aturannya

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) berlaku penuh.
`tests/peran-situs.test.mjs` menegakkan seluruh butir di atas atas KODE, bukan
atas dokumen:

- template menyatakan nol permukaan admin, dan benar-benar tidak punya satu pun
  rute on-demand — dua pemeriksaan terpisah, karena konfigurasi dan kode bisa
  berselisih dan yang menentukan apa yang disajikan adalah kode;
- setiap rute ber-`prerender = false` wajib berada di bawah prefiks yang
  dinyatakan `permukaanAdmin` **atau** di bawah prefiks BFF Jualanku ADR-0014 —
  ini yang membuat "publik secara bawaan" menjadi keadaan yang ditegakkan;
- `owner` ditolak, apa pun kapitalisasinya;
- prefiks yang menelan permukaan publik ditolak;
- deklarasi separuh ditolak;
- `AGENTS.md` wajib menyebut `permukaanAdmin` dan peran yang dilarang — kontrak
  kerja yang menua menjadi salah adalah yang membuat pekerjaan berikutnya
  mendarat di repo yang keliru, dan itu sudah pernah terjadi di sini
  (ADR-0020 §Konsekuensi).

## Hubungan dengan ADR-0020, dan dengan `awcms` ADR-0051

ADR ini **mempersempit** ADR-0020; ia tidak men-supersede-nya. Yang tetap utuh:
seluruh layar admin SISTEM dibangun di `awcms`, dan alasannya — memindahkan
layar bukan kontrol keamanan — tidak dibantah di mana pun di atas.

Ketegangan dengan `awcms` ADR-0051 ada, dan menuliskannya lebih berguna daripada
merapikannya: ADR itu memutuskan **"seluruh layar admin AWCMS — tenant maupun
owner/internal/platform — dibangun di repo `awcms`"**. Kata "seluruh" mencakup
layar tenant, dan permukaan USER yang ADR ini bolehkan berada di dekat batas
itu.

Yang membuat keduanya bisa hidup bersama adalah gerbang pengganti yang ADR-0051
sendiri wajibkan, dan yang justru menjadi alasannya: **repo bukan lagi pembatas
audiens, jadi pembatasnya dinyatakan di tempat yang menegakkannya.** Aksi
lintas-tenant wajib punya gerbang platform-scoped di `awcms`, dan izinnya tidak
boleh di-seed ke role tenant. Selama itu berlaku, permukaan USER di sini tidak
bisa menjadi jalur yang lebih longgar — ia tunduk pada gerbang yang sama, dan
`owner` tidak bisa lewat sama sekali.

> **Yang harus dilakukan di sisi sana — SUDAH, pada 8 Agustus 2026.** Selisih ini
> pantas dicatat sebagai divergence keluarga di `awcms-family-compatibility.yaml`
> milik `awcms`, mengikuti pola `awcms` ADR-0068 — dengan pemilik dan
> `reviewDate`, sehingga ia kembali ke meja alih-alih ditemukan ulang sebagai
> temuan. Repo ini tidak bisa menulisnya sendiri; yang bisa dilakukan di sini
> adalah tidak berpura-pura selisih itu tidak ada.
>
> **`awcms` menjawabnya dengan ADR-0070** ("Peran keluarga: `awcms-astro`
> memikul halaman publik dan permukaan admin USER"), yang **MEMPERSEMPIT**
> ADR-0051 di sana alih-alih men-supersede-nya: sumbu pembagian layar bergeser
> dari AUDIENS menjadi **apa yang dikelola**, admin SISTEM tetap di sana, dan
> ketiga gerbang pengganti ADR-0051 tidak dilonggarkan sedikit pun. Entri
> `admin-user-surface-in-awcms-astro` masuk manifest keluarganya dengan
> `reviewDate` 2027-02-04 — dan yang ditinjau pada tanggal itu bukan apakah
> admin USER boleh di sini, melainkan **apakah batasnya masih di tempat yang
> sama**. Ketegangan di §ini karena itu berhenti menjadi selisih yang tidak
> tercatat di mana pun, dan menjadi selisih yang punya berkas, pemilik, dan
> tanggal.

## Konsekuensi

- **Tidak ada kode permukaan admin yang mendarat hari ini.** Yang mendarat
  aturannya, deklarasinya, dan gerbangnya. Template tetap publik saja, dan
  `bun test` yang membuktikannya.
- **Implementasinya masih ditahan uji ADR-0023**, persis seperti BFF Jualanku
  dan karena alasan yang sama: permukaan terautentikasi memanggil `awcms` di
  SETIAP permintaan runtime, jadi bentuknya ditentukan respons `awcms` pada tiap
  permintaan — dan repo template ini tidak punya instans untuk membuktikannya.
  Yang dibuka ADR ini adalah izinnya, bukan penahanannya.
- **`output: 'static'` tetap premis.** Permukaan admin adalah pengecualian yang
  DINYATAKAN, bentuk yang sama dengan ADR-0014, bukan perubahan mode render.
- **Sebuah situs yang menyatakan permukaan admin memikul biaya yang situs publik
  tidak punya**: sesi, CSRF, cache yang harus dipisah, dan seluruh postur
  ADR-0019 di jalur yang kini membawa kredensial. Itu sebabnya deklarasinya
  eksplisit — supaya biaya itu dipilih, bukan diwarisi.
- **Yang paling mungkin salah dipahami**, dan karena itu ditulis di sini: ADR ini
  **bukan** izin membangun kembali layar admin `awcms` di repo ini dengan nama
  lain. Ukurannya bukan siapa yang memakainya melainkan apa yang dikelolanya —
  bila layarnya mengubah sesuatu di luar isi situs ini, ia milik `awcms`.

## Alternatif yang dipertimbangkan

- **Membiarkan aturan mutlak ADR-0020 apa adanya** — ditolak. Ia melarang hal
  yang tidak satu pun alasannya berlaku padanya, dan larangan yang lebih luas
  daripada alasannya adalah larangan yang akan dilanggar diam-diam.
- **Membolehkan permukaan admin tanpa deklarasi**, mengandalkan review — ditolak.
  Bentuk kegagalannya adalah build hijau dengan permukaan terautentikasi yang
  tidak pernah diputuskan siapa pun; review tidak melihat berkas yang tidak
  diubah.
- **Membolehkan `owner` bila situsnya "kecil"** — ditolak. Ukuran situs tidak
  mengubah apa yang bisa dilakukan owner, dan pengecualian yang bersandar pada
  kata sifat adalah pengecualian tanpa gerbang.
- **Mendaftarkan peran yang DIBOLEHKAN alih-alih menolak `owner`** — ditolak:
  daftar putih atas katalog peran yang tinggal di `awcms` akan menua setiap kali
  `awcms` menambah peran, dan menuanya berbentuk situs yang menolak peran yang
  sah. Yang stabil justru satu larangan.
