# ADR-0019 — CSP ketat dikirim penyaji, dan skrip tidak lagi tinggal di dalam HTML

- **Status:** Accepted
- **Tanggal:** 2 Agustus 2026
- **Berlaku untuk:** situs publik `awcms-astro` (permukaan admin ADR-0017 belum ada)
- **Terkait:** ADR-0016 (penyaji Bun memegang header), ADR-0018 (keluaran siap CSP untuk gaya)

## Konteks

ADR-0018 membersihkan seluruh **gaya** inline dari keluaran build dan
menerbitkan `tests/keluaran-csp.test.mjs` yang menjaganya. Yang ditinggalkannya
disebut terus terang di README: `script-src` ketat belum bisa diklaim, karena
keluarannya masih membawa skrip di dalam HTML.

Setelah dihitung ulang atas keluaran build yang sebenarnya, jumlahnya bukan dua
melainkan **tiga jalur**, dan yang ketiga tidak terlihat dari `src/` sama sekali:

1. `<script is:inline>` pengalih tema di `BaseLayout.astro` — dua blok, satu di
   `<head>` untuk memasang `data-theme` sebelum paint, satu di akhir `<body>`
   untuk memasang listener tombol.
2. `<script is:inline type="application/ld+json">` — JSON-LD di BaseLayout,
   Breadcrumb, dan FaqAccordion.
3. **`<script type="module">` yang tidak ditulis siapa pun.** `ShareButtons.astro`
   memakai `<script>` biasa, yang dibundel Astro. Bundel tanpa impor yang lebih
   kecil dari `assetsInlineLimit` Vite (4 kB secara bawaan) **disisipkan kembali
   ke dalam HTML** alih-alih diterbitkan sebagai berkas. Ini pola yang sama
   persis dengan `inlineStylesheets: 'auto'` yang ADR-0018 matikan untuk CSS:
   bergantung UKURAN, jadi sebuah situs bisa patuh hari ini dan berhenti patuh
   besok karena seseorang menghapus tiga baris dari sebuah komponen.

Sementara itu `server/penyaji.mjs` mengirim tiga header keamanan dan **tidak**
mengirim CSP sama sekali. Jadi keadaannya: repo menyatakan keluarannya "siap
CSP", tanpa satu pun pembaca yang pernah menerima CSP.

## Keputusan

**1. Pengalih tema pindah ke `public/tema.js`, dimuat sebagai skrip klasik.**

Ia harus jalan sebelum paint pertama — `data-theme` yang terpasang setelah
halaman terlukis berarti kedipan putih di setiap perpindahan halaman bagi
pembaca yang memilih tema gelap. Skrip yang dibundel Astro menjadi
`type="module"`, dan modul **selalu** ditunda sampai dokumen selesai diurai,
sehingga jalur itu tertutup. Yang tersisa adalah berkas di `public/` yang dimuat
`<script src="/tema.js">` tanpa `defer`/`async` di dalam `<head>`.

Konsekuensi yang diterima: berkas itu tidak ber-hash pada namanya, jadi ia
disajikan `must-revalidate` seperti HTML, bukan `immutable` seperti `/_astro/`.
Itu benar dan disengaja — perbaikan pada pengalih tema harus sampai ke pembaca
lama pada rebuild berikutnya, bukan setahun kemudian.

**2. `vite.build.assetsInlineLimit: 0` di `astro.config.mjs`.**

Menutup jalur ketiga di atas — sekaligus menghentikan gambar dan font kecil
diterbitkan sebagai `data:` URI, yang adalah satu-satunya alasan `img-src 'self'`
dan `font-src 'self'` di bawah bisa ditulis tanpa `data:`.

**3. JSON-LD TETAP inline, dan itu bukan pengecualian yang dilonggarkan.**

`<script type="application/ld+json">` bukan skrip melainkan **blok data**: tipe
yang bukan MIME JavaScript membuat browser berhenti sebelum langkah mana pun
yang mengeksekusi kode, sehingga `script-src` tidak berlaku atasnya. Memindahkan
JSON-LD ke berkas eksternal — yang sempat dicatat README sebagai jalan keluar —
justru merugikan tanpa menambah keamanan apa pun: mesin pencari membaca JSON-LD
dari halamannya, dan JSON-LD di berkas terpisah adalah data yang tidak dibaca
siapa pun.

Yang menjaga isinya tetap bukan CSP melainkan kontraknya: seluruh JSON-LD
dirangkai `JSON.stringify` atas objek yang dibangun `src/lib/schema.ts`, tidak
ada satu pun string HTML yang lewat.

**4. `server/penyaji.mjs` mengirim `Content-Security-Policy`**, sebagai header
keamanan keempat:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self';
font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none';
base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

Kebijakan ini hidup di berkas yang sama dengan tiga header lain karena ADR-0016
sudah memutuskan header respons ditentukan di satu tempat. Menambahkannya di
Traefik alih-alih di sini akan membuat dua sumber kebijakan yang saling menimpa
— dan cara paling sunyi untuk berakhir tanpa kebijakan sama sekali.

Dua hal yang **tidak** dipasang, beserta alasannya:

- **`upgrade-insecure-requests`** — TLS diterminasi Traefik dan seluruh URL
  situs relatif atau ber-origin `SITE_URL`. Yang ditambahkannya di produksi nol,
  sementara di `bun run serve` atas `http://localhost` ia hanya menyulitkan
  pratinjau yang README justru minta dipakai.
- **nonce atau hash per halaman** — keduanya menuntut HTML yang berbeda per
  request atau daftar hash yang berubah setiap build. Situs ini statis; solusi
  yang benar adalah tidak punya skrip inline sama sekali, dan itulah yang
  dikerjakan tiga butir di atas.

## Konsekuensi

- **Melonggarkan CSP butuh menyunting `server/penyaji.mjs` dan `tests/penyaji.test.mjs`.**
  Yang paling mungkin perlu: `img-src` bagi situs yang menyajikan gambar artikel
  dari host media awcms. Itu disengaja — kebijakan yang bisa dilonggarkan lewat
  variabel env adalah kebijakan yang dilonggarkan tanpa siapa pun membacanya.
- **`tests/keluaran-csp.test.mjs` naik dari saran menjadi penjaga produksi.**
  Sebelum ADR ini, gagalnya berarti "keluaran belum siap CSP". Sekarang berarti
  sebuah halaman akan kehilangan fungsinya di produksi: gerbangnya menolak
  skrip inline apa pun selain blok data JSON-LD, menolak sumber lintas-origin
  dan `data:` URI, lalu **membuktikan JS-nya tidak ikut hilang** — `/tema.js` di
  setiap halaman dan sedikitnya satu bundel `/_astro/*.js`.
- **Skrip pihak ketiga kini gagal keras.** AGENTS.md sudah melarangnya; sejak
  sekarang browser yang menegakkannya, bukan hanya review.
- **Permukaan admin ADR-0017 mewarisi kebijakan ini sebagai LANTAI.** Dokumen
  BFF Jualanku sudah menyatakan "CSP portal tidak boleh melonggar dibanding CSP
  publik"; sejak ADR ini pernyataan itu punya nilai yang bisa dibandingkan.
