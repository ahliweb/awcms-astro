---
bump: patch
tipe: perbaikan
dampak: publik
---

# HSTS tidak pernah terkirim di produksi, dan gerbangnya kini membaca ARTEFAK alih-alih sumber

Ditemukan saat memverifikasi deploy produksi pertama, 14 Agustus 2026:
`awcms-astro.ahlikoding.com` menjawab `200` dengan lima header keamanannya —
dan **tanpa `Strict-Transport-Security`**, meski `NODE_ENV=production`
terpasang di container.

## Sebabnya bukan konfigurasi

`bun build --target=bun` **melipat** `process.env.NODE_ENV` bertitik menjadi
literal saat bundling. `dist/server/penyaji.mjs` yang tayang karena itu memuat:

```js
headerKeamanan(produksi = false)
```

Nilainya dibekukan pada saat build, bukan dibaca saat proses berjalan — jadi
tidak ada nilai `NODE_ENV` di container yang bisa menyalakannya kembali.

## Kenapa tak satu gerbang pun melihatnya

Ketiga asersi HSTS yang ada mengimpor `server/penyaji.mjs` — **sumbernya** —
tempat gerbang produksi memang masih benar. Yang dikirim ke pembaca adalah
bundelnya. Ini persis kelas cacat yang repo ini berulang kali tulis aturannya,
kali ini mengenai repo ini sendiri: hijau di setiap gerbang yang tidak mengukur
respons sungguhan.

## Perbaikan, dan pemeriksanya

Satu bentuk akses: `process.env["NODE_ENV"]`. Bentuk bracket, `Bun.env`, dan
`globalThis.process.env` ketiganya **selamat** dari pelipatan; yang bertitik
tidak.

Pemeriksanya menjalankan **artefaknya**: `tests/penyaji.test.mjs` menyalakan
`dist/server/penyaji.mjs` dua kali dan menuntut HSTS **ada** pada
`NODE_ENV=production` sekaligus **absen** di luar itu — dua arah, karena satu
pratinjau lokal yang mengirimkannya mengunci setiap proyek di `localhost`
selama setahun ([ADR-0029](../docs/adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)).

Ia dibuktikan merah terhadap artefak **yang sedang tayang** sebelum
perbaikannya mendarat, bukan terhadap mutasi buatan. Karena `Dockerfile`
menjalankan `bun test tests/penyaji.test.mjs` sesudah `bun run build`, sebuah
image yang kehilangan header keenam kini berhenti bisa dibangun.
