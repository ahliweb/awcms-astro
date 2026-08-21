---
bump: minor
tipe: struktur
dampak: publik
---

# Sebuah seksi berhenti merender seluruh sejarahnya ke dalam satu dokumen

PRD FR-DSC-006 meminta arsip BERBATAS sebelum volume produksi, dan volume yang
membuatnya mendesak nyata: target migrasi SeputarBorneo adalah **23.906
artikel**. Sampai perubahan ini setiap halaman seksi merender seluruhnya —
sebuah respons HTML tunggal berisi setiap judul yang pernah diterbitkan sebuah
redaksi, yang tidak digulir pembaca mana pun dan tidak diperlakukan perayap
sebagai indeks yang berguna.

Halaman 1 tetap di `/panduan/`; halaman 2..N di `/panduan/halaman/N/`.
`SITE_POSTS_PER_PAGE` mengaturnya, bawaannya 12, dan nilai yang cacat
MENGGAGALKAN build alih-alih diabaikan — aturan yang sama dengan
`AWCMS_API_TIMEOUT_MS`.

## Tiga keputusan yang salah dalam diam

**Halaman 1 tidak punya kembaran `/halaman/1/`, dan rutenya tidak pernah
dibangkitkan.** Menerbitkan keduanya memberi satu halaman dua URL dan
memindahkan alamat yang sudah terindeks — karena ada orang menerbitkan artikel
ke-13.

**Setiap halaman kanonik ke DIRINYA.** Mengarahkan halaman 2..N ke halaman 1
adalah kebiasaan umum, dan ia akan menyembunyikan seluruh arsip dari indeks:
untuk 23.906 artikel, setiap URL setelah dua belas yang pertama menjadi tak
terjangkau kecuali dengan mengklik — persis akibat yang FR-DSC-006 ada untuk
mencegahnya.

**Judul halaman 2..N membawa nomornya.** Judul identik di seluruh arsip adalah
duplikat bagi perayap, dan satu-satunya pembeda yang terbawa ke hasil pencarian.

## Feed ikut dibatasi, karena itu cacat yang sama dilihat mesin

`isiFeed` memancarkan SETIAP artikel sebuah seksi. Pada target migrasi itu
berarti dokumen Atom berisi 23.906 entry, dibangun ulang setiap build dan
diunduh ulang seluruhnya oleh setiap pembaca feed pada setiap polling.
Dibatasi `artikelPerFeed` (50), sengaja BUKAN angka yang sama dengan batas
halaman: sebuah halaman adalah satuan penjelajahan dan sebuah feed adalah
jendela polling, dan menyatukannya berarti situs yang menampilkan 6 kartu per
halaman juga melupakan segalanya yang lebih tua dari 6 posting terakhirnya di
antara dua polling.

## Yang TIDAK berubah

Navigasinya tautan biasa dengan `rel="prev"`/`rel="next"` — situs ini harus
terbaca dengan JavaScript dimatikan, dan arsip yang hanya bisa ditelusuri skrip
juga tidak bisa ditelusuri perayap. Syarat feed dibaca dari SEKSI dan bukan dari
halaman yang sedang dirender, supaya pengumuman feed tidak lenyap di halaman 2.

Halaman `/sitemap/` masih mendaftar setiap artikel per seksi. Itu permukaan
dengan pertimbangannya sendiri — mendaftar segalanya bisa dibilang memang
tugasnya — dan membatasinya adalah keputusan desain tersendiri, bukan bagian
dari butir ini.
