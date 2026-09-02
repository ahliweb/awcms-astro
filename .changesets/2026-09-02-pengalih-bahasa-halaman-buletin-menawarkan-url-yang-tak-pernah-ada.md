---
bump: patch
tipe: perbaikan
dampak: publik
---

# Pengalih bahasa di kedua halaman buletin menawarkan URL yang tidak pernah dibangun siapa pun

`/newsletter/confirm` dan `/newsletter/unsubscribe` WAJIB berada persis di situ,
tanpa prefiks locale: `awcms` yang merangkai tautannya dari
`NEWSLETTER_CONFIRM_PATH` dan `NEWSLETTER_UNSUBSCRIBE_PATH`, dan tautan itu sudah
berada di kotak masuk orang. Itu sudah tertulis di docblock komponennya.

Yang tidak ikut ditulis adalah akibatnya bagi pengalih bahasa. Ia menukar locale
pada path halaman yang sedang dibuka, jadi di kedua halaman itu ia menawarkan
`/en/newsletter/confirm/` dan `/en/newsletter/unsubscribe/` — dua URL yang tidak
pernah dibangun siapa pun. Setiap situs dwibahasa yang menyalakan buletin
menerbitkan dua tautan mati, di halaman yang justru dibuka orang yang baru saja
mengeklik tautan dari email.

`langSwitchPath="/"` mengarahkannya ke beranda tiap locale — pola dan alasan yang
sama persis dengan `NotFound.astro`, satu-satunya halaman lain di repo ini yang
path-nya bukan URL yang bisa ditukar locale-nya.

## Kenapa ia bertahan selama ini

Gerbang tautan mati di `bun run audit:konten` membaca `dist/client`, dan repo
template tidak punya sumber konten — jadi build integrasinya DILEWATI di CI, dan
lapisan yang bisa melihat cacat ini tidak pernah berjalan di sana. Yang
menemukannya adalah `bun run release`: ia membangun lebih dulu, lalu menjalankan
gerbang itu atas hasilnya, lalu **menolak merilis**. Urutan itu bukan kerapian —
ia satu-satunya alasan cacat ini tidak ikut terbit di v0.5.0.
