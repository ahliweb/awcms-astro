---
tipe: struktur
dampak: publik
---

# Bun menyajikan hasil build; nginx dilepas dari image

Implementasi [ADR-0016](../docs/adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md).
Stage runtime image berhenti memakai `nginxinc/nginx-unprivileged` dan berganti
menjadi proses Bun yang menjalankan keluaran adapter `@astrojs/node`. Dengan itu
"Bun adalah runtime repo ini" berlaku di development, build, dan produksi tanpa
pengecualian — sebelumnya produksi adalah satu-satunya tempat pernyataan itu
tidak benar.

`output` **tidak** berubah: seluruh halaman tetap diprerender, tidak ada satu pun
rute menyatakan `prerender = false`, dan container tetap tidak pernah menghubungi
awcms. Yang berpindah hanya siapa yang membaca berkas dari disk.

## Yang berubah bagi pembaca

Tidak ada, dan itu memang targetnya. Lima perilaku nginx berpindah utuh: `try_files`
ke `index.html` direktori, `immutable` untuk aset ber-hash, HTML yang tidak boleh
di-cache lama, tiga header keamanan, dan penolakan berkas ber-titik plus halaman
404. Semuanya sekarang dijaga `tests/penyaji.test.mjs` — sebelumnya tidak satu
pun punya pemeriksa, dan seluruhnya berperilaku benar secara diam-diam saat
hilang: situs tetap tayang, hanya rebuild yang sukses tidak pernah terlihat.

Satu selisih yang ditemukan saat memindahkannya dan langsung ditutup: adapter
memasang `immutable` dari event yang **tidak pernah terjadi pada HEAD**, sehingga
`curl -I` melaporkan `max-age=0` untuk berkas yang sama yang GET-nya `immutable`.
Perintah verifikasi setelah deploy di `docs/deploy-coolify.md` memakai `curl -sI`,
jadi header yang benar akan terbaca salah oleh orang yang memeriksanya. Penyaji
menetapkan header sebelum berkasnya dibuka, jadi GET dan HEAD tidak bisa
berselisih.

## Yang berubah bagi yang mengembangkan

- `dist/` sekarang punya dua bagian: `dist/client/` (situsnya) dan `dist/server/`
  (entrypoint adapter + penyaji yang sudah dibundel). Apa pun yang menyalin
  `dist/` perlu tahu itu.
- `bun run build` menambah satu langkah: membundel penyaji menjadi satu berkas.
  Bundel itu yang membuat image produksi tidak perlu `node_modules` sama sekali —
  pohon dependency `astro` berukuran ratusan megabyte dan tidak satu pun barisnya
  dibutuhkan untuk menyajikan berkas.
- `bun run preview` dan `bun run start` sekarang menjalankan penyaji produksi,
  bukan `astro preview` / `astro dev`. `bun run start` yang dulu menyalakan server
  pengembangan adalah perangkap begitu repo ini punya penyaji produksi sungguhan.
- `bun run serve` adalah nama barunya; `PORT` dan `HOST` didokumentasikan di
  `.env.example` sebagai satu-satunya variabel yang dibaca setelah build.

`bun run dev` **belum** mengirim header yang sama — ia tetap server pengembangan
Astro. Itu selisih yang diakui di catatan implementasi ADR-0016, bukan yang
diam-diam dianggap selesai.
