# ADR-0018 — Kontrak build terhadap awcms: tenant dari token mesin, traversal cursor + hidrasi, dan gerbang terjemahan

- **Status:** Accepted
- **Tanggal:** 1 Agustus 2026
- **Menindaklanjuti:** `awcms` [ADR-0049](https://github.com/ahliweb/awcms/blob/main/docs/adr/0049-machine-credentials-and-session-introspection.md) (kredensial mesin + introspeksi sesi), yang menutup dua kontrak yang ADR-0047 catat sebagai penahan repo ini
- **Terkait:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (BFF), [ADR-0017](0017-peran-admin-owner-internal.md) (permukaan admin internal — di-supersede [ADR-0020](0020-layar-admin-kembali-ke-awcms.md); kredensial mesin di bawah tidak terpengaruh, ia dipakai token BUILD)

## Konteks

Repo ini menarik konten saat build lewat `GET /api/v1/blog/posts`. Tiga hal
tentang panggilan itu ternyata tidak sesuai kenyataan, dan **ketiganya gagal
tanpa menggagalkan build**:

### 1. Header tenant yang tidak pernah dibaca siapa pun

`src/lib/awcms/tenant.ts` mengirim `X-Tenant-Code`/`X-Tenant-Id`. awcms membaca
`x-awcms-tenant-id`, dan ADR-0049 §4 menolak menambahkan alias — ejaan yang
dipakai repo ini tidak pernah ada di sisi sana. Untuk token mesin header itu
diabaikan (tenant datang dari token); untuk bearer lain hasilnya
`400 TENANT_REQUIRED`.

Rantai resolusi tiga tingkat (`AWCMS_TENANT_CODE` → `AWCMS_TENANT_ID` →
`AWCMS_DEFAULT_TENANT_CODE`) karena itu menjawab pertanyaan yang sudah tidak
ditanyakan siapa pun.

### 2. Daftar post tidak memuat isinya

`GET /api/v1/blog/posts` mengembalikan **ringkasan** (`BlogPostSummary` di sisi
awcms): `id`, `title`, `slug`, `status`, `visibility`, `locale`, `publishedAt`,
`updatedAt`, `createdAt`. Tidak ada `contentJson`, `excerpt`,
`metaDescription`, `canonicalUrl`, maupun `translationGroupId`.

Adapter di repo ini mendeklarasikan bentuk post PENUH untuk respons itu dan
membaca `contentJson` langsung darinya. Akibatnya bukan error: `contentJson`
terbaca `undefined`, badan setiap artikel kosong — dan karena **`kategori` juga
tinggal di dalam `contentJson`**, tidak ada satu pun artikel yang cocok dengan
tab mana pun. Build sukses, situs terbit, seluruh seksi kosong.

### 3. Batas 100 baris yang dijaga dengan `throw`

Adapter meminta 100 (batas atas awcms) dan melempar bila respons kembali tepat
di batas itu. Itu keputusan yang benar saat ditulis — memotong diam-diam lebih
buruk — tetapi sejak awcms menambahkan traversal keyset (`?order=created_at`
dengan `nextCursor`), melempar berarti menolak membangun situs yang sebenarnya
bisa dibangun utuh.

## Keputusan

### 1. Token menentukan tenant; konfigurasi menjadi ASSERTION

`AWCMS_API_TOKEN` wajib berupa kredensial mesin
(`awcmsm_<32 hex tenant>_<43 char rahasia>`). Tenant diturunkan dari token,
dan **tidak ada header tenant yang dikirim** — mengirimnya berarti memasang
nilai yang tampak menentukan padahal diabaikan.

`AWCMS_TENANT_ID` dipertahankan, tetapi berpindah peran: dari **sumber**
menjadi **pernyataan yang diverifikasi**. Bila diisi dan berbeda dari tenant
token, build gagal.

Ini bukan pelemahan penjagaan, melainkan pemindahannya ke tempat kebocoran
sebenarnya bisa terjadi. Rantai lama menjaga "build menebak tenant" — keadaan
yang tidak mungkin lagi. Yang mungkin, dan tidak terlihat oleh apa pun
sebelumnya, adalah **token tenant lain terpasang di konfigurasi situs ini**:
build hijau, situs penuh, isinya milik orang lain. Sebuah rantai tidak bisa
melihat itu; sebuah assertion bisa.

`AWCMS_TENANT_CODE` dan `AWCMS_DEFAULT_TENANT_CODE` **ditolak, bukan
diabaikan.** Nilai yang terbaca seperti konfigurasi tetapi tidak menentukan
apa pun adalah kelas cacat yang sama dengan yang ADR ini perbaiki.

### 2. Traversal cursor, lalu hidrasi per post

1. Susuri seluruh daftar dengan cursor keyset `?order=created_at` — satu-satunya
   urutan yang awcms mau paginasi, karena `updated_at` bergerak setiap kali post
   disunting sehingga sebuah baris bisa melompati batas halaman.
2. Buang yang bukan `published` + `public` **sebelum** hidrasi, sehingga draft
   tidak pernah memakan satu permintaan pun.
3. Ambil setiap sisanya utuh dari `GET /api/v1/blog/posts/{id}`.

Langkah 3 adalah N+1 permintaan per build. Biayanya diterima dan dinyatakan,
tidak disembunyikan: **benar-tapi-lambat mengalahkan cepat-tapi-kosong.**
Perbaikan sebenarnya tetap sama seperti yang sudah dicatat adapter sejak awal —
sebuah **build feed** di sisi awcms yang mengembalikan baris penuh,
ber-paginasi keyset dan sadar locale. ADR ini tidak menggantikan kebutuhan itu;
ia membuat repo ini bisa berjalan benar sebelum feed itu ada.

Batas `MAX_PAGES` (200 halaman ≈ 20.000 post) adalah penahan loop liar, bukan
batas konten: ia **melempar**, tidak mengembalikan yang sudah terkumpul.

### 3. Terjemahan yang tidak bisa dipasangkan MENGGAGALKAN build

`translationGroupId` diterima awcms saat menulis dan **tidak dikembalikan satu
pun endpoint baca**. Aturan 1 adapter ini memasangkan locale lewat field itu.

Melanjutkan tanpa field itu tidak terlihat seperti kegagalan: setiap locale
non-default jatuh ke bahasa sumber, masing-masing membawa penanda "belum
diterjemahkan", dan situs menerbitkan terjemahan yang ADA sebagai halaman yang
tidak diterjemahkan. Itu membuang konten diam-diam, dan repo ini
memperlakukannya sebagai kegagalan.

Gerbangnya ditulis sebagai assertion atas **data**, bukan pemeriksaan versi
awcms: situs satu-locale tetap membangun hari ini, dan begitu awcms
mengembalikan field-nya, gerbang itu lewat sendiri tanpa ada yang perlu diubah
di sini.

## Konsekuensi

**Build sebuah situs berubah dari "hijau tetapi kosong" menjadi benar, atau
gagal dengan sebab yang tertulis.** Tidak ada keadaan ketiga.

**Konfigurasi deployment yang sudah ada akan gagal sekali, dengan sengaja.**
Setiap situs yang memasang `AWCMS_TENANT_CODE`/`AWCMS_DEFAULT_TENANT_CODE` atau
token non-mesin berhenti membangun sampai variabelnya diperbaiki. Alternatifnya
adalah menerima keduanya diam-diam dan membiarkan operator percaya sesuatu yang
tidak berlaku.

**Kredensialnya harus diterbitkan dengan cakupan tersempit.**
`POST /api/v1/access/machine-credentials`, `allowed_permission_keys` berisi
tepat `blog_content.posts.read`. ADR-0049 §3 sudah menolak aksi selain `read`
untuk kredensial mesin, jadi token yang bocor tidak bisa mengubah apa pun —
tetapi ia tetap bisa MEMBACA data tenant, jadi kedaluwarsanya wajib dan
pencabutannya berlaku pada permintaan berikutnya.

**Beban ke awcms naik.** Satu build sekarang N+1 permintaan, bukan satu.
Untuk situs 500 artikel itu 500-an permintaan baca per rebuild, dan rebuild
dipicu setiap publish. Ini alasan tambahan build feed layak dikerjakan di sisi
sana, dan alasan `HYDRATION_CONCURRENCY` dibatasi 8.

## Catatan implementasi (1 Agustus 2026, sore)

Keputusan 2 di atas menyebut build feed sebagai "perbaikan sebenarnya" yang
ditunda. Ia **tidak jadi ditunda** — ia mendarat di `awcms` pada hari yang sama
([PR build feed](https://github.com/ahliweb/awcms/pulls)), jadi bagian
"N+1 permintaan per build" dari ADR ini hanya sempat berlaku beberapa jam.

Yang berubah dari yang tertulis di atas:

- **`GET /api/v1/blog/posts?view=full&order=created_at`** mengembalikan baris
  penuh dengan cursor keyset yang sama. Adapter menyusuri satu traversal; tidak
  ada lagi permintaan per-post. `tests/kontrak-awcms.test.mjs` menegaskan
  permintaan per-id itu **tidak** kembali — kalau ia kembali, ia kembali
  diam-diam.
- **`translationGroupId` kini dikembalikan** oleh `view=full` maupun endpoint
  detail. Gerbang di Keputusan 3 karena itu tidak lagi menggagalkan situs
  multi-locale; ia tetap ada dan tetap menjaga keadaannya, persis karena ia
  ditulis sebagai assertion atas data alih-alih pemeriksaan versi.
- **Ukuran halaman turun ke 50**, batas yang awcms terapkan untuk `view=full`
  karena barisnya membawa `contentJson`.

Akar masalahnya juga tercatat di sisi sana, dan layak diulang di sini: kontrak
OpenAPI `awcms` menyatakan endpoint ini mengembalikan `BlogPost`, sementara
implementasinya mengembalikan ringkasan. Adapter repo ini ditulis dari dokumen
itu — komentar tipenya menyebut `openapi/awcms-public-api.openapi.yaml` — jadi
cacat "situs kosong yang build hijau" lahir dari dokumen yang menjanjikan lebih
daripada yang dikirim kode. Bentuk ringkasannya kini punya skemanya sendiri
(`BlogPostSummary`).

## Alternatif yang ditimbang

**Membaca `contentText` dari daftar dan berhenti di situ.** Tidak mungkin:
daftar tidak memuatnya juga. Tidak ada bentuk apa pun dari halaman artikel yang
bisa dibangun dari ringkasan.

**Memasangkan terjemahan lewat kesamaan `slug`.** Ditolak. Slug dilokalkan —
itu justru alasan `translationGroupId` ada. Aturan pemasangan yang hanya hidup
di repo ini adalah aturan yang tidak ada, dan salah pasang menerbitkan artikel
yang keliru di bawah judul yang benar.

**Membangun feed-nya sekarang di `awcms`.** Ditunda, bukan ditolak: ia
perubahan di repo lain, dengan ADR dan review keamanannya sendiri. Yang ADR ini
putuskan adalah bagaimana repo ini berperilaku benar sementara feed itu belum
ada.

**Menerima token sesi manusia sebagai kredensial build.** Ditolak, dan
alasannya ada di ADR-0049 §Konteks: sesi kedaluwarsa, reset password mencabut
seluruh sesi identitas itu, dan step-up MFA merotasinya. Build akan mati pada
saat yang tidak bisa diprediksi siapa pun, jauh dari sebabnya.
