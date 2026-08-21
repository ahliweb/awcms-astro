---
bump: patch
tipe: perbaikan
dampak: publik
---

# Setiap galeri merender sebaris placeholder abu-abu di situs yang gambar artikelnya bekerja

`content-blocks.ts` menyatakan, di komentar berkasnya sendiri, bahwa item galeri
ber-`mediaObjectId` tidak bisa dirender karena "resolusi id butuh endpoint media
yang tidak dipanggil situs ini".

Kalimat itu **berhenti benar** saat `src/lib/awcms/media.ts` mendarat: build
sudah meresolusi gambar unggulan dan kartu share lewat
`GET /api/v1/media/objects` sejak saat itu. Tidak ada yang membaca ulang
kalimatnya, jadi setiap galeri yang ditempatkan editor terbit sebagai sebaris
placeholder — di situs yang gambar artikelnya justru bekerja.

## Kenapa tidak ada gerbang yang bisa melihatnya

Placeholder ITU perilaku terdokumentasi untuk item yang tidak bisa diresolusi.
Ia tampak seperti salah satunya. Tidak ada tipe yang salah, tidak ada
permintaan yang gagal, tidak ada tag yang hilang — hanya sebuah kapabilitas
yang sudah ada dan tidak pernah disambungkan.

Ini kelas cacat yang sudah berulang di keluarga repo ini: sebuah kalimat yang
menyatakan ketiadaan menua ke arah yang berlawanan dari koreksi biasa. Klaim
POSITIF pecah begitu kodenya berubah; klaim NEGATIF makin salah dan tidak pernah
gagal sendiri.

## Yang berubah

Id galeri ikut dalam batch media yang SAMA — satu permintaan per build, bukan
satu per galeri — dan renderer menerima petanya sebagai parameter opsional,
sehingga modul itu tetap murni dan tetap bisa diuji tanpa jaringan.

`altText` dari registri menang atas caption sebagai `alt`, dengan alasan yang
sama seperti gambar unggulan: ia ditulis UNTUK gambarnya. Caption tetap menjadi
`<figcaption>` — ia keterangan, bukan alt. Ukurannya ikut supaya peramban
memesan ruang sebelum gambarnya tiba.

Id registri menang atas `url` mentah yang menemaninya, sama seperti renderer
`awcms` sendiri: id adalah rujukan terkelola, dan URL di sebelahnya adalah apa
pun yang ada sebelum objeknya didaftarkan.

Id yang benar-benar tidak resolve tetap placeholder. `awcms` MELAPORKAN id yang
tidak resolve alih-alih membuangnya, justru supaya pemanggil bisa membedakan
"tidak ada gambar" dari "gambar ini hilang", dan perbedaan itu diteruskan sampai
ke halaman.
