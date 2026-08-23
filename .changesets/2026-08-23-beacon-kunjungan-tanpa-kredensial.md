---
bump: minor
tipe: konten
dampak: publik
---

# Sebuah situs boleh menghitung kunjungannya, dan itu tidak menaruh apa pun di perangkat pembacanya

`awcms` #597 butir 9 terhalang bukan oleh pekerjaan melainkan oleh sebuah
keputusan: apakah template ini boleh memanggil beacon pengunjung sama sekali.
[ADR-0044](../docs/adr/0044-what-a-page-view-may-cost-a-reader.md) menjawabnya —
**boleh, hanya bila situs menyatakannya, dan selalu tanpa kredensial** — dan ini
implementasinya.

## Keputusannya ternyata lebih kecil daripada "analitik: ya atau tidak"

Karena `fetch` lintas-origin **tanpa** `credentials` tidak mengirim maupun
menyimpan cookie, repo ini sudah memegang sakelarnya tanpa satu pun perubahan di
`awcms`. Cookie 30 hari `awcms_visitor_key` yang dipasang endpoint itu **dibuang
peramban**, jadi tidak ada apa pun yang persisten mendarat di perangkat pembaca —
dan kalimat `AGENTS.md` §Keamanan, *"tanpa analitik yang mengikat identitas"*,
selamat kata demi kata alih-alih ditafsirkan ulang.

Karena itu pula **tidak ada banner persetujuan**, dan itu bukan kelalaian
melainkan konsekuensi: tidak ada yang perlu disetujui.

Yang dilepas disebutkan alih-alih dilewati: **hitungan pengunjung unik**. Setiap
kunjungan tampak sebagai kunjungan pertama, dan "12.000 kunjungan" berhenti bisa
diubah menjadi "berapa orang".

## Dinyatakan dengan menamai kode tenant, dan tidak ada sakelar kedua

`SITE_BEACON_TENANT_CODE` kosong secara bawaan; mengisinya adalah deklarasinya.
Sebuah sakelar terpisah plus sebuah nilai adalah pasangan yang separuh terisi,
dan keadaan separuh terisi di sini adalah situs yang melaporkan kunjungan ke
tenant mana pun yang kebetulan dinamai kode basi.

Ia **bukan** `AWCMS_TENANT_CODE` yang sudah dipensiunkan dan MELEMPAR: yang itu
dulu memilih tenant mana yang dibangun build dan bisa diam-diam berselisih dengan
token. Yang ini tidak memilih apa pun.

Satu hal yang repo ini **tidak bisa** periksa dinyatakan alih-alih dipura-purakan
terjaga: apakah tenant `awcms` itu menyalakan `rawIpEnabled`, yang membuatnya
menyimpan alamat IP pembaca dan bukan hanya hash ber-salt. Peringatannya tinggal
di `.env.example`, tempat orang yang bisa melihatnya membacanya.

## Aturannya KEBALIKAN dari kotak pencarian, dan keduanya harus tetap berbeda

Pencarian tidak boleh membawa header apa pun, karena `awcms` sengaja tidak
menyajikan `OPTIONS` di belakangnya. Beacon ini **harus** membawa satu:
`security.checkOrigin` di sana menolak POST lintas-origin yang tipe isinya mirip
form, jadi hanya `application/json` yang lolos — dan handler `OPTIONS` yang
dipasang `awcms` #637 ada justru untuk preflight yang menyusul.
`navigator.sendBeacon` karena itu tidak bisa dipakai: ia mengirim `text/plain`.

Menyeragamkan keduanya, ke arah mana pun, mematikan salah satunya di peramban dan
tidak di log mana pun.

## Gerbang "repo ini tidak menulis" diamandemen, dan amandemennya MEMBELI dua jaminan

`tests/tanpa-backend.test.mjs` menolak `fetch` ber-`method` selain `GET`, dan
pesannya sendiri sudah mengantisipasi kasus ini. Pengecualiannya **satu berkas**,
bukan sebuah pola — dan aturan yang dilonggarkannya bukan aturan yang
dijaganya: gerbang itu melindungi kredensial mesin baca-saja milik build, dan
panggilan ini tidak menyentuhnya sama sekali.

Di sebelahnya berdiri dua asersi baru: berkas beacon tidak boleh membawa
`credentials` maupun header otorisasi, dan pengecualiannya harus menamai berkas
yang ADA dan benar-benar mem-POST.

## Halaman privasi ikut, karena ADR-nya menjanjikannya

`/privasi/` dan `/en/privasi/` dikirimkan template, bukan diserahkan ke tiap
situs untuk ditulis tangan: teksnya harus menyatakan apa yang benar-benar
dilakukan build ini, dan hanya build ini yang tahu apakah situsnya menyatakan
beacon. Isinya bercabang pada satu nilai, dan pada tidak ada nilai lain.

## Verifikasi

Terhadap Chrome sungguhan, di atas keluaran build dan penyaji yang sebenarnya,
dengan stub yang mengirim `Set-Cookie` yang sah persis seperti `awcms`:

- satu POST per kunjungan, `content-type: application/json`, muatan hanya
  `tenantCode` + `path`;
- permintaannya **tidak membawa header cookie**;
- **nol cookie tersimpan** meski server mengirimnya — inilah keseluruhan ADR-0044,
  dan satu-satunya cara membuktikannya adalah menjalankannya;
- kunjungan kedua juga tanpa cookie, jadi setiap kunjungan memang tampak pertama;
- nol pelanggaran CSP, nol galat konsol.

Build tanpa deklarasi diverifikasi terpisah: tidak ada simpul `[data-beacon]`,
tidak ada permintaan, dan halaman privasinya berbunyi "tidak menghitung
kunjungan". Bundel skripnya tetap ikut terbit (588 byte) karena Astro membundel
berdasarkan impor, bukan render — ia inert, dan sebuah tes menjaganya tetap
begitu.
