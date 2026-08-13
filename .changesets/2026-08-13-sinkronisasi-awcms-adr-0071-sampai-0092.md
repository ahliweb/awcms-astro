---
tipe: struktur
dampak: internal
---

# Dokumen dan skill disamakan dengan keadaan `awcms` per 13 Agustus 2026, dan satu premis keamanan yang gugur diberi nama

Sinkronisasi terakhir menyerap keadaan `awcms` sampai ADR-0071 (8 Agustus 2026).
Sejak itu sisi sana melanjutkan sampai ADR-0092 — dua puluh satu keputusan dalam
lima hari — dan sebagian di antaranya membuat kalimat di repo ini berhenti
benar. Yang paling mahal bukan yang usang melainkan **empat kalimat yang
menyuruh pembacanya melakukan hal yang salah**, dan keempatnya diperbaiki lebih
dulu.

## Empat kalimat yang menyesatkan, dan akibatnya

- **Scope token build ditulis satu kunci, padahal butuh dua.** `README.md`
  menuntut `blog_content.posts.read` saja; `.env.example` sudah menuntut
  `media_library.media.read` juga. Yang mengikuti README akan membangun situs
  pertamanya sampai **setiap halaman selesai dirender**, lalu gagal 403 di
  `scripts/asal-media.mjs` — langkah terakhir `bun run build` — dengan pesan
  yang terbaca seperti deployment rusak, bukan izin kurang.
- **`awcms-micro` direkomendasikan sebagai jalan keluar** untuk kebutuhan
  publikasi seketika, padahal ia **arsip** sejak 2 Agustus 2026 — dinyatakan
  dua kali di berkas yang sama. Penggantinya: permukaan publik `awcms` sendiri
  di `/blog/{tenantCode}/**`.
- **Checklist repo baru menyarankan menyajikan `/news/**` dari `awcms`.** Rute
  itu **dihapus** di sana pada 8 Agustus 2026 dan kini 301 ke
  `/blog/{tenantCode}/**`; menyarankannya sekaligus melanggar
  [ADR-0036](../docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)
  repo ini sendiri.
- **Tabel design token menyebut webfont Inter dan Outfit** yang tidak ada di
  `src/styles/global.css` — satu-satunya temuan yang bisa membuat orang
  **menambah** dua origin ke jalur render kritis situsnya atas dasar dokumen.

## Premis keamanan yang gugur, dan diberi nama alih-alih ditambal

`awcms` ADR-0092 (13 Agustus 2026) membuka kelas kredensial mesin yang boleh
**menulis**. Sampai hari itu "kredensial mesin tidak bisa menulis" adalah sifat
KELAS, dan tiga berkas di sini mengutipnya sebagai dasar kenapa scope token build
boleh dipercaya.

Token build repo ini tetap tidak bisa mengubah apa pun — tetapi karena ia
diterbitkan tanpa satu pun aksi tulis, yaitu properti **barisnya**, bukan
kelasnya. Menjaganya begitu kini keputusan penerbitan yang harus dipertahankan.
Dinyatakan di `.env.example`, di `README.md`, dan sebagai banner pada
[ADR-0018](../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md) —
banner, karena badan sebuah ADR adalah rekaman dan menyuntingnya akan
memalsukannya.

Satu penolakan `awcms` yang baru juga mendapat nama, karena ia menggagalkan build
**total** sambil terbaca persis seperti token dicabut, dan tidak bisa diperbaiki
dari repo situs: `403 TENANT_SUSPENDED` (ADR-0073 di sana; kini mengenai
kredensial mesin, dan `inactive` diperlakukan sama dengan `suspended`).
`403 ENTITLEMENT_REQUIRED` (ADR-0084) dicatat sebagai kosakata, **bukan** sebagai
mode kegagalan: entitlement diputuskan per modul, dan tidak satu pun modul di
balik ketiga permukaan yang dipanggil build mendeklarasikannya hari ini —
menuliskannya sebagai sebab yang mungkin akan mengirim orang mencari masalah yang
tidak ada.

## Peran kedua repo ini akhirnya punya dokumennya

Repo ini memikul dua peran sejak
[ADR-0034](../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md),
dan keenam dokumen di `docs/awcms-astro/` seluruhnya ditulis untuk peran
pertama. Bahan peran kedua terserak di ADR — format rekaman keputusan, bukan
panduan.

`docs/awcms-astro/permukaan-admin-user.md` mengumpulkannya: batas "apa yang
dikelola" alih-alih audiens, cara menyatakannya beserta lima penolakan
`tests/peran-situs.test.mjs`, apa yang berubah begitu satu rute keluar dari
`output: 'static'`, kontrak ke `awcms` yang **belum** ada, dan sebelas fakta
model identitas `awcms` yang harus ditiru alih-alih ditebak — di antaranya
lockout yang kini GLOBAL (salinan UI yang menulis "hanya untuk situs ini" akan
berbohong), MFA yang pindah ke principal, dan `409` seleksi tenant yang
**sengaja** tidak membawa daftar keanggotaan sehingga layar "Anda anggota tenant
mana saja" tidak boleh dirancang.

Ia sengaja **dokumen, bukan skill**: hari ini `permukaanAdmin` kosong di
template dan tidak ada satu baris kode permukaan terautentikasi, jadi sebuah
skill akan memerikan prosedur atas kode yang belum ada — persis yang
`.claude/skills/README.md` larang.

## Satu keputusan baru, dengan pemeriksanya

[ADR-0037](../docs/adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md)
— pin TypeScript 6.x adalah syarat hidupnya gerbang `astro check`.
`@astrojs/check` menuntut API programatik TypeScript 6.x; `awcms` sudah di 7.0.2
dan karena itu **kehilangan** type-check seluruh berkas `.astro`-nya, tercatat di
manifest keluarganya sebagai divergence yang menyandarkan diri secara eksplisit
pada repo ini masih berada di `^6.0.3` — "which is the only reason its gate
runs".

Tanpa ADR ini, menaikkan TypeScript ke 7.x terbaca sebagai pemeliharaan rutin,
dan yang terjadi adalah gerbang `Type check` **berhenti ada** dengan setiap
perintah tetap hijau. Pemeriksanya mendarat bersamanya di
`tests/versi-toolchain.test.mjs`, dua asersi (pin, dan keberadaan
`@astrojs/check` — tanpa yang kedua, yang pertama menjaga sesuatu yang sudah
tidak ada), keduanya dibuktikan merah lewat mutasi.

## Selebihnya

- Paragraf pembuka `AGENTS.md` berhenti membantah §Peran repo ini di berkas yang
  sama; kolom "Audiens" pada tabel peran diganti "apa yang dikelola" — sumbu yang
  justru dicabut `awcms` ADR-0070.
- Kosakata URL yang dibelah, kontrak konsumen yang beku, dan dua gerbang peran
  (`tests/peran-situs.test.mjs`, `tests/kosakata-news.test.mjs`) masuk kontrak
  kerja dan Definition of Done — ketiganya sebelumnya tidak disebut satu baris
  pun di sana.
- Tabel "Keputusan `awcms`" di skill integrasi disegarkan: baris ADR-0059
  dicabut (ia memerikan rute yang sudah tidak ada), enam baris baru masuk, dan
  tujuh belas ADR yang **tidak** relevan disebut namanya, dikelompokkan menjadi
  tujuh gugus — supaya diamnya tabel bisa
  dibedakan dari "belum diperiksa".
- Hitungan celah `sembilan` → `sepuluh` di enam berkas; celah 10 sudah ditutup
  6 Agustus 2026 dan hanya dokumen standarnya yang mencatatnya.
- Cacat `awcms` 10 Agustus 2026 yang layak dibaca sebagai peringatan di sini:
  handler statis `@astrojs/node` berjalan sebelum middleware, sehingga setiap
  berkas `dist/client` di sana keluar tanpa satu pun header keamanan.
  Perbaikannya persis bentuk `server/penyaji.mjs` — header sebagai LANTAI
  sebelum mendelegasi — jadi jangan pernah "menyederhanakan" penyaji di sini
  dengan memanggil handler adapter langsung.
