---
tipe: struktur
dampak: publik
---

# Build menarik konten yang benar-benar ada, dari tenant yang benar-benar dimaksud

Implementasi [ADR-0018](../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md),
menindaklanjuti `awcms` ADR-0049 yang menutup dua kontrak penahan repo ini.

Tiga hal tentang cara repo ini bicara ke awcms ternyata tidak sesuai kenyataan,
dan **ketiganya gagal tanpa menggagalkan build**.

## 1. Daftar post tidak pernah memuat isinya

`GET /api/v1/blog/posts` mengembalikan RINGKASAN: tanpa `contentJson`,
`excerpt`, `metaDescription`, `canonicalUrl`, maupun `translationGroupId`.
Adapter ini mendeklarasikan bentuk post penuh untuk respons itu dan membaca
`contentJson` langsung darinya.

Akibatnya bukan error. `contentJson` terbaca `undefined`, badan setiap artikel
kosong — dan karena **`kategori` juga tinggal di dalam `contentJson`**, tidak
ada satu pun artikel yang cocok dengan tab mana pun. Build sukses, situs terbit,
seluruh seksi kosong, tidak ada yang gagal di mana pun. Itu keadaan repo ini
sampai hari ini, dan tidak terlihat dari dalam repo mana pun secara terpisah.

Sekarang: susuri daftar dengan cursor keyset, buang yang bukan published+public
**sebelum** hidrasi, lalu ambil setiap sisanya utuh dari
`/api/v1/blog/posts/{id}`. N+1 permintaan per build, dinyatakan dan bukan
disembunyikan; build feed di sisi awcms tetap perbaikan sebenarnya.

## 2. Batas 100 baris berhenti menjadi batas

Adapter dulu meminta 100 dan **melempar** saat respons kembali tepat di batas —
benar saat ditulis, karena memotong diam-diam lebih buruk. awcms kini punya
traversal keyset (`?order=created_at` + `nextCursor`), jadi melempar berarti
menolak membangun situs yang sebenarnya bisa dibangun utuh.

`order=created_at` bukan selera: `updated_at` bergerak setiap kali post
disunting, sehingga sebuah baris bisa melompati batas halaman dan terlewat —
muncul berbulan kemudian sebagai "beberapa artikel hilang", tanpa apa pun yang
bisa mendeteksinya.

## 3. Header tenant yang tidak pernah dibaca siapa pun

Repo ini mengirim `X-Tenant-Code`/`X-Tenant-Id`. awcms membaca
`x-awcms-tenant-id` dan menolak menambahkan alias — ejaan yang dipakai di sini
tidak pernah ada di sana.

Sejak ADR-0049 tenant datang **dari token**: kredensial mesin berbentuk
`awcmsm_<32 hex tenant>_<rahasia>`. Jadi rantai `AWCMS_TENANT_CODE` →
`AWCMS_TENANT_ID` → `AWCMS_DEFAULT_TENANT_CODE` menjawab pertanyaan yang tidak
lagi ditanyakan, dan `AWCMS_TENANT_ID` berpindah peran menjadi **pernyataan yang
diverifikasi**: bila berbeda dari tenant token, build gagal.

Penjagaannya berpindah, bukan hilang. Rantai lama menjaga "build menebak
tenant" — keadaan yang kini mustahil. Yang mungkin, dan tak terlihat oleh apa
pun sebelumnya, adalah **token tenant lain terpasang di konfigurasi situs ini**:
build hijau, situs penuh, isinya milik orang lain.

## Terjemahan: gerbang baru yang sengaja menggagalkan

`translationGroupId` diterima awcms saat menulis dan tidak dikembalikan satu pun
endpoint baca. Field itulah yang memasangkan locale. Melanjutkan tanpa itu tidak
terlihat seperti kegagalan: setiap locale non-default jatuh ke bahasa sumber
dengan penanda "belum diterjemahkan", sehingga situs menerbitkan terjemahan yang
ADA sebagai halaman yang tidak diterjemahkan.

Adapter kini menolak membangun keadaan itu. Gerbangnya assertion atas DATA,
bukan pemeriksaan versi awcms — situs satu-locale tetap membangun hari ini, dan
begitu awcms mengembalikan field-nya, gerbang itu lewat sendiri.

## Yang perlu diubah operator

Konfigurasi deployment yang sudah ada **akan gagal sekali, dengan sengaja**:

- `AWCMS_API_TOKEN` wajib kredensial mesin. Terbitkan dengan
  `POST /api/v1/access/machine-credentials`, `allowed_permission_keys` berisi
  tepat `blog_content.posts.read`. Token sesi manusia ditolak — sesi
  kedaluwarsa, reset password mencabutnya, dan step-up MFA merotasinya.
- `AWCMS_TENANT_CODE` dan `AWCMS_DEFAULT_TENANT_CODE` **ditolak**, bukan
  diabaikan. Hapus; ganti dengan `AWCMS_TENANT_ID` bila ingin tetap menyatakan
  tenant situs ini — build lalu memverifikasinya.

## Gerbang

`tests/kontrak-awcms.test.mjs`: 10 tes atas assertion tenant, traversal 250 post
lintas tiga halaman, draft yang tidak pernah dihidrasi, isi yang benar-benar
datang dari endpoint detail, dan kedua sisi gerbang terjemahan.
