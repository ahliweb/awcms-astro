# ADR-0016 — Penyajian oleh Bun di belakang Traefik/Coolify; nginx dilepas dari stack

- **Status:** Accepted
- **Tanggal:** 31 Juli 2026
- **Mengamandemen:** [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) §7
  (pengecualian "stage runtime tetap nginx unprivileged selama keluarannya statis")
- **Terkait:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (adapter untuk
  rute on-demand), [`docs/deploy-coolify.md`](../deploy-coolify.md)

## Konteks

Aturan pemilik, 31 Juli 2026: **pada development, staging, dan production
stack-nya adalah Coolify dan Traefik — bukan nginx.**

Keadaan hari ini tidak seragam terhadap aturan itu:

| Lingkungan | Penyaji sekarang | Patuh? |
| --- | --- | --- |
| Development | `bun --bun astro dev` | ya, tanpa perubahan |
| Staging & production | stage akhir `nginxinc/nginx-unprivileged:1.29-alpine` menyajikan `dist/` di `:8080`, di belakang Traefik | **tidak** |

Jadi yang berubah hanya jalur image. Development sudah patuh secara konstruksi.

### Traefik tidak bisa menggantikan nginx secara langsung

Ini fakta yang menentukan bentuk keputusan ini, dan mudah terlewat: **Traefik
adalah reverse proxy, bukan static file server.** Ia tidak punya padanan `root`
+ `try_files`. "Hapus nginx, biarkan Traefik yang menyajikan" bukan pilihan yang
tersedia — menghapus nginx menuntut penggantinya, dan penggantinya harus sesuatu
yang menjalankan proses.

Satu-satunya jawaban yang konsisten dengan [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md)
adalah **Bun**. Itu sekaligus menutup celah yang ADR-0015 §7 catat dengan jujur
sebagai pengecualian: sampai hari ini runtime produksi repo ini bukan Bun,
melainkan nginx, meskipun repo ini menyatakan diri Bun-only.

### Apa yang sebenarnya dikerjakan nginx di sini

`ops/nginx-situs.conf` (dihapus oleh implementasi ADR ini; isinya ada di riwayat
git sampai commit terakhir sebelum penyaji Bun) bukan boilerplate. Setiap
aturannya punya alasan yang tertulis, dan **semuanya berperilaku benar secara
diam-diam ketika hilang** — tidak ada yang gagal, halamannya tetap tampil:

1. `try_files $uri $uri/ $uri/index.html` — Astro memakai
   `build.format: 'directory'`, jadi `/panduan/` adalah `/panduan/index.html`.
   Tanpa ini **setiap halaman 404**.
2. `Cache-Control: public, max-age=31536000, immutable` untuk `/_astro/` — aset
   ber-hash; satu-satunya cara rebuild tidak memaksa pembaca mengunduh ulang
   seluruh CSS.
3. `Cache-Control: public, max-age=0, must-revalidate` untuk HTML — komentarnya
   menyatakan taruhannya: cache HTML membatalkan seluruh premis rebuild lewat
   webhook, dan situs akan terlihat "belum ter-rebuild" padahal rebuild-nya
   sukses.
4. Tiga header keamanan dari `ops/nginx-header-keamanan.conf`,
   di-`include` ulang di setiap `location` karena `add_header` nginx **tidak**
   menurun begitu sebuah `location` punya `add_header` sendiri. Berkas itu
   mencatat bahwa jebakan tersebut ditemukan lewat pengujian, bukan lewat
   membaca konfigurasi.
5. `error_page 404 /404.html`, penolakan berkas ber-titik, gzip, dan
   `HEALTHCHECK` berbasis `wget`.

Butir 2–4 adalah yang paling berbahaya bila hilang: situs tetap tayang, terlihat
normal, dan salah.

## Keputusan

1. **Bun menyajikan keluaran build** pada staging dan production. Traefik tetap
   memegang TLS dan routing; Coolify tetap memegang orkestrasi, build, dan
   variabel.
2. **nginx dilepas dari repo ini**: stage runtime di [`Dockerfile`](../../Dockerfile)
   beserta `ops/nginx-situs.conf` dan `ops/nginx-header-keamanan.conf`.
3. **Penyajiannya memakai adapter Astro yang dijalankan Bun, bukan server
   berkas statis tulisan tangan.** Alasannya keamanan, bukan kenyamanan: server
   berkas buatan sendiri berarti menulis sendiri penanganan path traversal,
   normalisasi URL ter-encode, dan symlink — kelas cacat yang nginx sudah
   selesaikan bertahun-tahun lalu dan yang kegagalannya adalah pembacaan berkas
   arbitrer, bukan halaman jelek.
4. **`output: "static"` TIDAK berubah.** Adapter dipasang, seluruh halaman tetap
   diprerender, dan tidak ada satu pun rute menyatakan `prerender = false` dalam
   perubahan ini. Yang berpindah hanyalah **siapa yang menyajikan** berkas yang
   sudah dibangun — bukan kapan halaman dirender. Ini menjaga ADR-0014 tetap
   utuh: rute on-demand tetap menunggu PoC dan prasyarat P0-nya.
5. **Kelima perilaku di atas wajib berpindah, dan wajib dibuktikan test.**
   Khususnya butir 2 dan 3: satu test yang menegaskan HTML **tidak** ber-cache
   panjang dan aset `/_astro/` **ber-**`immutable`. Aturan yang pindah tanpa
   pembuktian adalah aturan yang hilang.

## Konsekuensi

**Aturan runtime jadi benar-benar seragam.** Setelah ini "Bun adalah runtime
repo ini" berlaku di development, build, staging, dan production tanpa
pengecualian — dan ADR-0015 §7 tidak lagi perlu mencatat perkecualian yang
melemahkannya.

**Header keamanan dan aturan cache naik ke lapisan yang sama di semua
lingkungan.** Selama ini keduanya hanya ada di image produksi; `bun run dev`
tidak pernah mengirim satu pun header keamanan. Setelah pindah, development
menyajikan header yang sama — yang berarti pelanggarannya terlihat saat
dikembangkan, bukan saat dideploy.

**Permukaan runtime berubah bentuk, bukan menghilang.** Perlu dinyatakan jujur:
mengganti nginx dengan proses Bun bukan berarti "tanpa runtime". Klaim repo ini
yang sebenarnya — dan yang tetap benar — adalah **tidak ada basis data dan tidak
ada panggilan ke awcms saat request**. Situs tetap tayang saat awcms mati.

**Biaya yang diterima.** Proses Bun memakai memori lebih besar daripada nginx
statis untuk beban yang sama, dan menyajikan berkas statis memang bukan hal yang
paling efisien dilakukan sebuah runtime JavaScript. Untuk situs sebesar ini,
selisihnya tidak menentukan apa pun — dan analisis beban terpisah sudah
menunjukkan bahwa bottleneck situs statis di belakang Traefik + Cloudflare
adalah penanganan koneksi, bukan kerja penyajian.

**Coolify dan healthcheck ikut berubah.** Port, perintah start, dan
`HEALTHCHECK` di Dockerfile berganti; [`docs/deploy-coolify.md`](../deploy-coolify.md)
ikut diperbarui dalam PR implementasinya.

## Catatan implementasi (1 Agustus 2026)

Keputusan di atas sudah diimplementasikan. Tiga hal yang berbeda dari, atau
lebih spesifik daripada, yang tertulis di atas — dicatat di sini supaya ADR ini
tidak menjanjikan sesuatu yang tidak dikirim implementasinya:

1. **Adapternya `@astrojs/node` mode `standalone`, dijalankan Bun**, dibungkus
   [`server/penyaji.mjs`](../../server/penyaji.mjs) setebal beberapa puluh baris
   yang hanya memasang header dan kompresi. Pencarian berkas — `..`, path
   ter-encode, symlink, `index.html` direktori — tetap milik adapter, sesuai
   keputusan 3.
2. **Kompresi tidak ditulis sendiri**, dengan alasan yang sama seperti penyajian
   berkas: negosiasi `Accept-Encoding`, pembuangan `Content-Length`, dan `Vary`
   adalah tiga tempat yang salahnya menghasilkan respons rusak. Ia memakai
   pustaka `compression`.
3. **Development belum menyajikan header yang sama.** Bagian "Konsekuensi" di
   atas menyatakan bahwa setelah perpindahan ini development ikut mengirim
   header keamanan yang sama; itu belum benar. `bun run dev` tetap server
   pengembangan Astro, yang tidak melewati penyaji ini sama sekali. Yang
   dikerjakan implementasinya adalah memetakan `bun run preview` ke penyaji
   produksi, sehingga header dan cache bisa dilihat lokal dengan satu perintah —
   tetapi selama halaman dikerjakan lewat `bun run dev`, pelanggarannya masih
   tidak terlihat sampai seseorang menjalankan `serve`.

Keputusan 5 dipenuhi [`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs).
Perlu diketahui bahwa gerbang itu berlapis dua dan **lapis integrasinya
dilewati di CI repo template ini**, karena repo template tidak punya sumber
konten sehingga tidak pernah punya hasil build; ia dijalankan di dalam
`docker build` dan di CI sebuah situs. Lapis yang menguji aturan header dan
cache berjalan di mana pun.

## Alternatif yang ditimbang

**Traefik menyajikan berkas statis sendiri.** Ditolak karena tidak mungkin: fitur
itu tidak ada padanya.

**Menulis server statis kecil dengan `Bun.serve` sendiri.** Ditolak. Ia terlihat
sepele — beberapa puluh baris — dan justru di situ masalahnya: setiap baris yang
menerjemahkan URL menjadi path berkas adalah baris yang bisa keliru menjadi
pembacaan berkas arbitrer. Repo ini sudah memilih sikap yang sama di tempat lain
(lihat `src/lib/content-blocks.ts`: tidak ada jalur HTML mentah karena jalur itu
tidak bisa dijaga). Kalaupun nanti dipakai, ia harus datang bersama test
adversarial untuk `..`, path ter-encode ganda, dan symlink.

**Tetap memakai nginx.** Ditolak: melanggar aturan yang menjadi konteks ADR ini,
dan mempertahankan satu-satunya tempat repo ini tidak Bun-only.

**Caddy atau penyaji statis lain.** Ditolak: menambah runtime ketiga ke stack
yang aturannya justru sedang disederhanakan menjadi Coolify + Traefik + Bun.
