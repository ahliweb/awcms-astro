---
bump: minor
tipe: struktur
dampak: publik
---

# Plafon build ada di bawah korpus yang sudah diukur keluarga ini sendiri

`MAX_PAGES = 400` × `PAGE_SIZE = 50` membatasi traversal di **20.000 post**, dan
komentarnya berbunyi bahwa angka itu "duduk jauh di atas situs mana pun yang
masuk akal". Itu tebakan.

Pada 26 Agustus 2026 tebakan itu berhenti benar: `awcms` mengukur arsip rujukan
keluarga ini dan mendapat **25.029 artikel** — ADR-0114-nya, yang juga mencatat
bahwa angka 23.906 dikutip berminggu-minggu sebelum ada yang menghitungnya.

Plafonnya, dengan kata lain, ada **di bawah** korpus yang sudah diukur keluarga
ini. Kegagalannya jujur — ia MELEMPAR alih-alih memotong diam-diam, dan itu
setengah yang benar — tetapi ia menyala pada situs yang sekadar besar alih-alih
pada sebuah bug.

## Diukur, bukan dinaikkan

Menaikkan konstantanya saja akan mengulang kesalahan yang sama satu tingkat
lebih tinggi. `bun run ukur:skala` adalah cara mendapatkan angkanya:

| artikel | halaman | traversal | +render | heap korpus | RSS puncak |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1.000 | 20 | 8 ms | 27 ms | 0,0 MiB | 52 MiB |
| 5.000 | 100 | 25 ms | 68 ms | 24,2 MiB | 127 MiB |
| 25.000 | 500 | 102 ms | 355 ms | 170,0 MiB | 605 MiB |

Yang dikatakan pengukurannya, dan tidak dikatakan sebelumnya:

- **Waktu bukan batasnya.** Seluruh adapter memakan di bawah setengah detik
  untuk 25.000 artikel. Build sebesar itu didominasi 500 permintaan HTTP
  berurutan dan penulisan satu berkas per halaman per locale oleh Astro —
  keduanya bukan putaran ini.
- **Memori batasnya, dan ia linear.** Setiap baris menahan badan kanoniknya DAN
  proyeksi turunannya sekaligus, karena itulah yang dikirim awcms.

Plafonnya kini **1.200 halaman, 60.000 post** — sekitar 1,5 GiB RSS puncak pada
kemiringan yang terukur, dan 2,4× korpus terbesar yang pernah dihitung keluarga
ini.

## Pesan gagalnya menyebut apa yang harus dilakukan

Pesan lama menyebut kedua sebabnya ada dan berhenti di situ. Yang baru
memisahkan keduanya, karena jawabannya berbeda: cursor yang macet terlihat dari
jumlah post yang kelipatan `PAGE_SIZE` dengan slug kembar; situs yang benar-benar
sebesar itu perlu `ukur:skala` dijalankan di mesin yang akan membangunnya.

Dan ia menolak jalan keluar yang menggoda secara eksplisit: mengembalikan apa
yang sudah terkumpul menerbitkan daftar pendek yang tampak lengkap — situs yang
kehilangan artikel TERBARUNYA, dengan setiap gerbang hijau.

## Yang TIDAK dilakukan, dan disebut

Refactor streaming supaya memori berhenti tumbuh linear **tidak dikerjakan**.
Pengukurannya menjelaskan kenapa: pada 25.000 artikel biayanya 605 MiB, yang
selamat di runner CI mana pun, jadi pekerjaannya belum dibayar oleh apa pun yang
bisa diukur hari ini. Kalau ada situs yang mendekati plafon barunya, angkanya
ada dan keputusannya bisa diambil dengan data alih-alih dengan firasat.

Harness-nya juga tidak dijalankan di CI, dan itu keputusan: gerbang yang
membangun 25.000 artikel pada setiap PR akan dimatikan orang dalam sepekan.
