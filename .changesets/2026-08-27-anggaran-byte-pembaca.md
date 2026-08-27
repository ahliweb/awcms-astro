---
bump: minor
tipe: struktur
dampak: internal
---

# Permukaan pembaca keluarga ini adalah satu-satunya repo yang tidak punya anggaran pembaca

`awcms` ADR-0101 menggerbangi apa yang diunduh pengunjung artikel publik di
**24.000 byte** dan menggagalkan build-nya bila terlampaui. Menurut ADR-0070-nya,
repo **ini** yang memikul permukaan publik keluarga.

Jadi repo dengan anggaran pembaca yang ketat adalah repo yang permukaan
pembacanya sebuah aplikasi admin, dan repo yang benar-benar melayani pembaca
tidak punya anggaran sama sekali.

`lighthouserc.json` nyata, dan ia mengerjakan hal lain: ia mengambil SAMPEL
halaman, hanya berjalan bila `vars.AWCMS_API_URL` terisi — jadi **tidak pernah
untuk repo template ini sendiri** — dan tidak bisa menyebut berkas mana yang
membesar. Regresi 8 KB duduk nyaman di bawah LCP 2500 ms pada runner cepat, dan
tetap terasa di ponsel pada jaringan 3G.

## Dua lapis, karena `dist/` tidak selalu ada

Bentuknya mengikuti `audit-konten.mjs`: sumber **selalu** jalan, keluaran jalan
bila `dist/client` ada, dan lapis yang dilewati **mengatakannya**. Gerbang yang
hanya membaca `dist/client` tidak pernah berjalan di satu-satunya tempat kode
klien ini ditinjau.

## Angkanya diukur, bukan disalin

| | total | skrip | gaya |
| --- | ---: | ---: | ---: |
| halaman artikel | 29.510 B | 5.809 B | 23.701 B |
| halaman cari | 32.358 B | 9.963 B | 22.395 B |

Skrip dipisahkan dari gaya alih-alih dijumlah, karena biayanya berbeda — CSS
menahan render, JS menahan **dan** dieksekusi — dan satu angka gabungan akan
membuat 4 KB skrip baru tampak sama murahnya dengan 4 KB CSS.

Plafon sumber sengaja lebih longgar dari plafon terbit: kotak cari 10.054 B di
`src/` dan 4.808 B setelah build. Menerapkan satu plafon pada keduanya menuduh
berkas yang sebenarnya patuh.

Angka 24.000 milik `awcms` tidak disalin. Itu irisan pembaca dari bundle ADMIN,
dan ia tidak mengatakan apa pun tentang template ini.

## Dua kesalahan yang ditangkap gerbangnya sendiri

Anggaran skrip pertama ditulis **9.000**, dari hitungan tangan yang melewatkan
sebagian skrip inline. Gerbangnya sendiri yang mengoreksinya pada jalan pertama —
alasan sebuah anggaran harus diukur oleh alat yang menegakkannya, bukan oleh
orang yang menulisnya.

Versi pertamanya juga menyebut `BaseLayout.css` sebagai penyumbang terbesar
sebuah pelanggaran **skrip**, yang mengirim pembacanya memperkecil berkas yang
tidak ada hubungannya dengan angka yang merah. Keduanya kini punya tesnya.

## Registri `public/` ditegakkan dua arah

Berkas yang tidak didaftarkan merah, **dan** entri yang berkasnya tidak ada juga
merah. Arah kedua itu yang membuat daftarnya tidak membusuk — bentuk yang sama
dipakai `awcms` ADR-0101, dengan alasan yang sama.

Empat belas tes atas pohon fixture sungguhan, dua arah. Berjalan di job `check`,
bukan di belakang build bersyarat: anggaran aset adalah properti sumber repo ini
sendiri. Dicatat sebagai celah 11 di `standar-performa-dan-keamanan.md`.
