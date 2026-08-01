---
tipe: struktur
dampak: publik
---

# CSP ketat benar-benar dikirim, dan skrip berhenti tinggal di dalam HTML

Penyaji memasang header keamanan keempat (ADR-0019):

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self';
font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none';
base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

Sebelum ini repo menyatakan keluarannya "siap CSP" tanpa satu pun pembaca yang
pernah menerima CSP. Kesiapannya sendiri baru separuh: changeset sebelumnya
membersihkan gaya inline, dan menyebut dua `<script is:inline>` sebagai sisa.

## Sisanya ternyata tiga jalur, bukan dua

Yang ketiga tidak terlihat dari `src/` sama sekali. `ShareButtons.astro` memakai
`<script>` biasa — tidak ada satu pun skrip inline di sumbernya — dan Astro
membundelnya, lalu **menyisipkan bundel itu kembali ke dalam HTML** karena
chunk-nya lebih kecil dari `assetsInlineLimit` Vite (4 kB secara bawaan). Pola
yang sama persis dengan `inlineStylesheets: 'auto'`: bergantung UKURAN, jadi
sebuah situs bisa patuh hari ini dan berhenti patuh besok karena seseorang
menghapus tiga baris dari sebuah komponen. Sekarang limitnya `0`, yang sekalian
menghentikan gambar dan font kecil terbit sebagai `data:` URI — dan itulah yang
membuat `img-src 'self'` serta `font-src 'self'` bisa ditulis tanpa `data:`.

## Pengalih tema

Kedua bloknya pindah utuh ke [`public/tema.js`](../public/tema.js), dimuat
`<script src="/tema.js">` klasik di dalam `<head>`. Ia harus jalan sebelum paint
pertama — `data-theme` yang terpasang belakangan berarti kedipan putih di setiap
perpindahan halaman bagi pembaca yang memilih tema gelap — dan bundel Astro
selalu `type="module"`, yang selalu ditunda. Karena namanya tidak ber-hash, ia
disajikan `must-revalidate` seperti HTML, bukan `immutable`: perbaikan pada
pengalih tema sampai ke pembaca lama pada rebuild berikutnya.

Perilakunya tidak berubah, termasuk tanpa JavaScript: `data-theme` tidak
terpasang dan tema mengikuti `prefers-color-scheme` lewat media query.

## JSON-LD tetap inline, dan itu bukan pengecualian yang dilonggarkan

`<script type="application/ld+json">` adalah blok data, bukan skrip — tipe yang
bukan MIME JavaScript membuat browser berhenti sebelum langkah mana pun yang
mengeksekusi, jadi `script-src` tidak berlaku atasnya. Memindahkannya ke berkas
eksternal, yang sempat dicatat README sebagai jalan keluar, justru merugikan
tanpa menambah keamanan apa pun: mesin pencari membaca JSON-LD dari halamannya.

## Gerbang

`tests/keluaran-csp.test.mjs` bertambah tiga pemeriksaan atas `dist/client/`:
nol skrip inline yang dieksekusi (tepat `application/ld+json` yang dikecualikan),
setiap `src`/`href` ber-origin sendiri — tidak ada CDN, tidak ada `data:` — dan,
supaya "nol skrip inline" tidak bisa berarti "JS-nya lenyap", `/tema.js` wajib
ada di setiap halaman beserta sedikitnya satu bundel `/_astro/*.js`.

`tests/penyaji.test.mjs` memeriksa ISI kebijakannya, bukan kehadirannya: CSP yang
terpasang tetapi memuat `'unsafe-inline'` adalah keadaan terburuk dari keduanya
— terlihat di `curl -I`, terhitung patuh, dan tetap meloloskan serangan yang
paling ingin dicegahnya.

Gerbang keluaran hanya berjalan bila `dist/` ada. Di repo template ini `bun test`
tanpa build melewatinya dan mengatakannya; di sebuah situs, jalankan `bun test`
lagi setelah `bun run build`.
