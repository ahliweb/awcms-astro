🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md)

<!-- i18n-source-hash: sha256:a5315c84f9b4ebd8f8f8f7422fb768f08881ae1fc4979e9471df266312158b7d -->

# ADR-0037 — Pin TypeScript 6.x adalah syarat hidupnya gerbang `astro check`

- **Status:** Accepted
- **Tanggal:** 13 Agustus 2026
- **Terkait:** [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) (toolchain keluarga), [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (jangkar standar), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (aturan tertulis wajib membawa pemeriksanya), `awcms` [ADR-0068](https://github.com/ahliweb/awcms/blob/main/docs/adr/0068-family-standards-posture-editions-and-recorded-divergences.md) (mekanisme pencatatan divergence keluarga)

## Konteks

`bun run check` menjalankan `astro check`, dan tabel gerbang mutu di
[`standar-teknis.md`](../awcms-astro/standar-teknis.md) mendaftarkannya sebagai
gerbang **Type check** dengan kolom "Ada di `awcms-astro`?" berbunyi **Ya**.
Itu benar. Yang tidak tertulis di mana pun sampai hari ini adalah **kenapa** ia
masih bisa berjalan.

`@astrojs/check` menuntut API programatik TypeScript **6.x**. Repo ini ada di
`typescript: "^6.0.3"`, jadi gerbangnya jalan.

`awcms` tidak. Repo itu ada di `^7.0.2`, dan kompiler nativenya tidak
menyediakan API tersebut — sehingga seluruh berkas `.astro` di sana **tidak
punya pemeriksa tipe sama sekali**. Selisih itu sudah dicatat di sisi sana
sebagai divergence keluarga bernama `astro-files-not-type-checked`, dengan
pemilik `@ahliweb` dan `reviewDate` 2027-02-04. Kalimat yang menentukan ada di
dalam entri itu, dan ia menyebut repo ini secara langsung:

> `@astrojs/check` requires the TypeScript 6.x programmatic API; this repo is on
> TypeScript 7.0.2, whose native compiler does not ship it … awcms-astro is on
> `^6.0.3`, **which is the only reason its gate runs**.

Jadi keadaan hari ini bukan "repo ini kebetulan belum naik versi". Ia adalah
**satu-satunya sisi keluarga yang masih punya type-check `.astro`**, dan catatan
divergence di sisi sana menyandarkan diri pada kenyataan itu.

### Kenapa ini butuh keputusan, bukan sekadar dibiarkan

Karena bentuk kegagalannya adalah pemeliharaan rutin yang tampak benar.

Menaikkan `typescript` ke `^7` adalah tindakan yang setiap agen dan setiap
pengembang akan baca sebagai kebersihan dependency — Dependabot pun akan
mengusulkannya. Yang terjadi setelahnya: `@astrojs/check` berhenti bisa
berjalan, dan **gerbang `Type check` mati**. Tabel gerbang mutu tetap berbunyi
"Ya", tabel itu tidak digerbangi siapa pun, dan tidak ada satu perintah pun yang
berubah merah. Repo ini sudah mengumpulkan sebelas dokumen yang menyatakan
sesuatu yang tidak ada; ini calon nomor dua belas, dengan biaya yang lebih besar
karena yang hilang adalah pemeriksanya sendiri.

Dan akibatnya tidak berhenti di sini: catatan divergence `awcms` akan menjadi
salah pada hari itu juga, tanpa ada yang menyentuh berkasnya.

## Keputusan

**`dependencies.typescript` di repo ini tetap di rentang `^6.x`.**

Menaikkannya ke 7.x adalah keputusan tingkat **KELUARGA**, bukan tingkat repo,
dan ia menuntut dua hal lebih dulu:

1. **Pengganti bagi type-check `.astro`.** Bila `@astrojs/check` sudah
   mendukung TypeScript 7.x, itu penggantinya dan ADR ini bisa dicabut dengan
   satu baris. Bila belum, kenaikan versi berarti repo ini **kehilangan** sebuah
   gerbang — dan gerbang yang hilang wajib dinyatakan sebagai celah di
   [`standar-performa-dan-keamanan.md`](../awcms-astro/standar-performa-dan-keamanan.md),
   bukan dibiarkan menghilang dari tabel.
2. **Pembaruan entri `astro-files-not-type-checked`** di manifest kompatibilitas
   keluarga `awcms`. Repo ini tidak bisa menulisnya sendiri; yang bisa dilakukan
   di sini adalah tidak membatalkan premisnya diam-diam.

Yang **tidak** diputuskan ADR ini: versi `astro` dan `@astrojs/node`. Pada hari
ini ditulis keduanya tertinggal satu minor dari pin `awcms`, dan itu murni belum
dikerjakan — bukan keputusan, dan tidak mengikat siapa pun. Dependabot menutup
ketertinggalan itu pada 23 Agustus 2026.

Angkanya sendiri sengaja **tidak** diulang di sini. Paragraf ini dulu
membawanya, dan ia adalah salinan yang basi sementara pin-nya bergerak di
bawahnya: sebuah ADR bertanggal, sebuah versi tidak, dan catatan keputusan
adalah tempat terburuk untuk menyimpan nilai yang berubah. Angkanya tinggal di
[`standar-teknis.md`](../awcms-astro/standar-teknis.md) §Stack — satu-satunya
tabel yang dibaca pemeriksa.

## Pemeriksanya mendarat bersama aturannya

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) berlaku penuh, dan
aturan ini adalah contoh persis yang ADR itu tulis: sebuah kalimat tegas membuat
orang mengira ada yang memeriksanya. Karena itu
[`tests/versi-toolchain.test.mjs`](../../tests/versi-toolchain.test.mjs)
mendapat dua asersi:

1. `dependencies.typescript` wajib cocok `^6.` — dan **pesan gagalnya menyebut
   sebabnya**, bukan hanya angkanya. Sebuah gerbang yang berbunyi "harus ^6"
   akan dilonggarkan oleh orang berikutnya yang tidak tahu apa yang mati bila ia
   melakukannya.
2. `@astrojs/check` wajib masih terdaftar sebagai dependency. Tanpa asersi
   kedua, asersi pertama menjaga sesuatu yang sudah tidak ada: melepas
   `@astrojs/check` membuat pin TypeScript berhenti menjaga apa pun, sementara
   gerbangnya tetap hijau.

Keduanya ditaruh di berkas yang sama dengan gerbang versi Bun karena
pertanyaannya sama — **nilai mana yang wajib bergerak bersama, dan apa yang
diam-diam mati bila salah satunya bergerak sendiri.**

## Konsekuensi

- **Positif:**
  - Gerbang `Type check` berhenti bergantung pada kebetulan. Ia kini punya
    alasan tertulis dan pemeriksa yang menegakkannya.
  - Pembaruan Dependabot yang menaikkan TypeScript ke 7.x akan **merah**, dan
    merahnya menjelaskan diri. Itu perbedaan antara keputusan yang ditinjau dan
    keputusan yang terjadi.
  - Catatan divergence `awcms` berhenti bersandar pada keadaan yang tak
    seorang pun di repo ini tahu sedang ia pikul.
- **Negatif / trade-off yang diterima:**
  - **Repo ini tertahan di TypeScript 6.x sampai `@astrojs/check` menyusul**,
    termasuk dari fitur bahasa dan perbaikan kompiler 7.x. Itu biaya nyata, dan
    ia dipilih: setiap komponen `.astro` di `src/`, beserta layout dan
    halamannya, tanpa pemeriksa tipe adalah harga yang lebih mahal — dan repo
    ini sudah pernah membayarnya sekali, `entry: any` di `ArtikelLayout`
    menyembunyikan empat field yang tidak pernah ada. Paragraf ini dulu
    mematoknya di "28 berkas `.astro`"; pada 28 Agustus 2026 jumlahnya 50, dan
    angka itu tidak mengerjakan apa pun yang argumennya belum kerjakan tanpanya.
  - **Keluarga menjadi tidak seragam pada satu nilai toolchain**, setelah
    ADR-0015 justru menutup divergence runtime. Bedanya: yang ini **tercatat di
    kedua sisi** beserta tanggal tinjaunya, bukan ditemukan orang berikutnya.
- **Netral:**
  - **Nol perubahan pada kode berjalan.** `package.json` sudah berada di
    `^6.0.3` hari ini; yang mendarat adalah alasannya dan gerbangnya.

## Alternatif yang dipertimbangkan

- **Menaikkan ke TypeScript 7.x sekarang, menyamakan diri dengan `awcms`** —
  ditolak. Ia menukar sebuah gerbang yang berjalan dengan keseragaman versi, dan
  keseragaman itu tidak membeli apa pun: kedua repo tidak berbagi satu berkas
  TypeScript pun.
- **Menurunkan `awcms` ke 6.x supaya keluarganya seragam** — ditolak, dan
  bukan oleh repo ini: entri divergence di sana sudah menolaknya dengan alasan
  yang bisa diperiksa — itu akan meregresi toolchain di bawah 33 gerbang dan
  ~156.000 baris yang hari ini dijaga bersih `tsc --noEmit`.
- **Menuliskannya sebagai satu baris di `AGENTS.md` tanpa ADR** — ditolak.
  Aturan yang mengubah sebuah pin dependency dari pemeliharaan rutin menjadi
  keputusan tingkat keluarga adalah keputusan, dan indeks ADR repo ini adalah
  tempat orang membaca keputusan mana yang berlaku.
- **Menggerbanginya dengan memeriksa bahwa `astro check` benar-benar berjalan**,
  alih-alih memeriksa versinya — ditolak karena tidak bisa dibedakan dari
  kegagalan lain: `astro check` yang gagal karena API-nya hilang dan yang gagal
  karena ada kesalahan tipe sama-sama keluar bukan-nol, dan gerbang yang tidak
  bisa menyebut sebabnya adalah gerbang yang dimatikan orang saat buru-buru.
