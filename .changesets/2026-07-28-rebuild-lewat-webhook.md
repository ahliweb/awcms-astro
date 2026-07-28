---
tipe: struktur
dampak: publik
---

# Situs dari template ini bisa di-deploy, dan konten barunya memicu rebuild sendiri

Template ini sebelumnya tidak punya jalur deploy sama sekali. `ci.yml` membangun
lalu mengunggah artifact, dan di situ ceritanya berhenti — tidak ada image, tidak
ada penyajian, tidak ada cara konten baru di awcms sampai ke pembaca selain
seseorang teringat menekan tombol.

## Image produksi

`Dockerfile` multi-stage: build dengan Node (versi dikunci ke `.nvmrc`), sajikan
dengan nginx unprivileged di port 8080. `npm run build` dijalankan di dalam
image, jadi gerbang lockfile dan `astro check` ikut berjalan setiap deploy —
deploy adalah tempat terakhir yang pantas melewati gerbang.

**Konten ditarik saat `docker build`, bukan saat container start.** Ini
konsekuensi `output: 'static'` dan sumber kebingungan paling sering pada deploy
pertama: variabel awcms wajib tersedia sebagai build argument. Diisi sebagai
runtime environment saja, build gagal dengan pesan yang jelas — bukan
menghasilkan situs yang diam-diam kosong.

`AWCMS_API_TOKEN` hanya hidup di stage `build`. Bahwa ia tidak ikut ke image
akhir sekarang **terverifikasi, bukan diasumsikan**: build uji menghasilkan image
yang bersih pada `docker history`, pada seluruh isi filesystem-nya, dan pada
environment container yang berjalan.

## Penyajian

`ops/nginx-situs.conf` menangani keluaran `build.format: 'directory'` Astro,
memisahkan cache aset ber-hash (immutable, satu tahun) dari HTML (harus
divalidasi ulang). HTML yang di-cache lama membatalkan seluruh premis rebuild
cepat — situs terlihat belum ter-rebuild padahal rebuild-nya sukses.

Header keamanan dipisah ke snippet tersendiri dan di-include ulang di setiap
`location`. Itu bukan gaya penulisan: `add_header` nginx **membuang** seluruh
warisan dari blok induk begitu sebuah `location` punya `add_header` sendiri.
Versi pertama konfigurasi ini menyajikan setiap halaman tanpa satu pun header
keamanan, dan tidak ada yang gagal — ditemukan pengujian, bukan pembacaan.
Pengujian yang sama menemukan `Cache-Control` ganda pada aset, akibat `expires`
dan `add_header` sama-sama menulis header itu.

## Pemicu rebuild

Jalur utama tidak melewati GitHub: awcms memicu deploy Coolify langsung, Coolify
menarik repo dan membangun ulang commit yang sama dengan konten terbaru.
`.github/workflows/rebuild.yml` menambahkan dua hal yang tidak dijawab jalur itu
— tombol "rebuild sekarang", dan jadwal harian sebagai jaring pengaman. Webhook
yang hilang tidak menimbulkan kegagalan apa pun; yang terjadi justru tidak ada
yang terjadi, dan situs bisa basi berhari-hari tanpa satu pun sinyal.

Rantai lengkap, pengaturan Coolify, dan cara rollback ada di
[`docs/deploy-coolify.md`](../docs/deploy-coolify.md).

Sisi pengirim di awcms **belum diimplementasikan**; kontraknya ditetapkan di
dokumen yang sama. Ia wajib mengikuti pola `email` — baris antrean se-transaksi
dengan publish, lalu worker terpisah yang memanggil webhook — dan **bukan**
consumer `domain-event-runtime`, yang tipenya menyatakan dirinya hanya untuk
handler DB-only di dalam transaksi.
