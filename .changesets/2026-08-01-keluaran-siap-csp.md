---
tipe: perbaikan
dampak: publik
---

# Keluaran build berhenti membawa gaya di dalam HTML

52 atribut `style=""` yang diwarisi repo rujukan berpindah ke kelas: pola lintas
komponen ke `src/styles/global.css`, sisanya ke `<style>` scoped milik masing
-masing komponen. Nilainya dipertahankan persis — ini pemindahan, bukan
kesempatan mendesain ulang diam-diam.

Kenapa ini bukan kerapian: di belakang CSP ketat (`style-src 'self'` tanpa
`'unsafe-inline'`, postur yang dipakai `awcms` sendiri) setiap atribut gaya
**diblokir browser**, dan halaman kehilangan tata letaknya **tanpa satu pun
error di build**. Selama gaya itu ada, tidak ada situs dari template ini yang
bisa disajikan di belakang CSP semacam itu.

## Jalur kedua yang sama berbahayanya, dan lebih mudah terlewat

Astro menyisipkan stylesheet apa pun di bawah ~4 kB sebagai `<style>` di dalam
HTML (`build.inlineStylesheets: 'auto'`, bawaannya). `<style>` diblokir CSP
persis seperti `style=""`. Perilaku itu bergantung pada UKURAN, jadi keluaran
hari ini kebetulan patuh — dan akan berhenti patuh pada hari CSS-nya mengecil
atau sebuah komponen membawa stylesheet kecilnya sendiri, tanpa ada yang
mengubah aturan apa pun.

Sekarang `inlineStylesheets` disetel `"never"`.

## Warna kanal berbagi

Satu-satunya gaya inline yang benar-benar dinamis adalah
`style="--share-color: …"` di ShareButtons. Daftar kanalnya tetap dan tiap kanal
sudah punya kelasnya sendiri, jadi warnanya pindah ke `global.css` bersama
seluruh aturan yang memakainya. Menambah kanal berarti menambah satu baris di
sana; tanpa itu tombolnya jatuh ke `--accent-primary`, bukan ke keadaan tanpa
warna.

## Gerbang

[`tests/keluaran-csp.test.mjs`](../tests/keluaran-csp.test.mjs) memindai
`dist/client/**/*.html`: nol atribut `style=`, nol blok `<style>`, dan — supaya
"nol" tidak bisa berarti "gayanya lenyap" — setiap halaman wajib menautkan
stylesheet eksternal.

Yang **belum** bersih dan sengaja disebut: dua `<script is:inline>` (pengalih
tema dan JSON-LD), sehingga `script-src` ketat belum bisa diklaim.
