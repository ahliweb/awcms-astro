---
tipe: perbaikan
dampak: internal
---

# CI dan image berhenti mengirim variabel tenant yang sudah ditolak

ADR-0018 memensiunkan `AWCMS_TENANT_CODE` dan `AWCMS_DEFAULT_TENANT_CODE`, dan
membuat build **menolak** keduanya alih-alih mengabaikannya. Dokumentasi ikut
berpindah. Dua tempat yang benar-benar membangun situs tidak ikut:
`.github/workflows/ci.yml` dan `Dockerfile` masih meneruskan keduanya.

Akibatnya berlawanan arah dengan maksud ADR-0018. Sebuah situs yang menyimpan
`vars.AWCMS_TENANT_CODE` — nilai yang dokumentasi versi sebelumnya justru
menyuruh mengisinya — mendapat build yang **gagal** di CI dan di image, dengan
pesan yang tidak menyebut langkah mana yang mengirimkannya. Penolakan itu
dirancang untuk menangkap konfigurasi yang tidak menentukan apa-apa; yang
terjadi adalah ia menembak pemakainya sendiri.

## Arah sebaliknya, dan ini yang lebih mahal

`AWCMS_TENANT_ID` **tidak pernah diteruskan CI sama sekali**. Ia assertion yang
menangkap satu keadaan yang tidak terlihat oleh apa pun: token tenant lain
terpasang di situs ini — build hijau, situs penuh, isinya milik orang lain.
Selama baris itu tidak ada, assertion tersebut tidak pernah berjalan di
satu-satunya tempat sebuah situs membangun sebelum deploy. `Dockerfile` sudah
meneruskannya; CI belum.

## Gerbang

`tests/kontrak-awcms.test.mjs` membaca `ci.yml` dan `Dockerfile` sebagai berkas:
tidak ada baris non-komentar yang menyebut variabel pensiun, dan
`AWCMS_TENANT_ID` wajib ada di keduanya. Komentar boleh menyebut namanya —
justru di sanalah alasannya ditulis.

Pasangannya yang sudah ada memeriksa sisi kode (`resolveTenant` menolak variabel
itu). Menolak sebuah variabel hanya bermanfaat bila tidak ada yang mengirimnya,
jadi kedua sisi butuh gerbangnya masing-masing.

## Untuk situs yang sudah berjalan

Hapus `AWCMS_TENANT_CODE` dan `AWCMS_DEFAULT_TENANT_CODE` dari repository
variables GitHub dan dari build variable Coolify, lalu isi `AWCMS_TENANT_ID`
dengan uuid tenant situs itu.
