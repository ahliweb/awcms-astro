---
bump: minor
tipe: struktur
dampak: publik
---

# HTML bisa di-cache CDN, dengan purge pada setiap deploy (ADR-0054)

HTML kini dikirim `Cache-Control: public, max-age=0, s-maxage=300,
must-revalidate`: browser tetap selalu memvalidasi ulang, sedangkan cache bersama
(CDN) boleh menyimpan halaman lima menit sehingga origin tidak melayani setiap
tampilan. `/_astro/*` tetap `immutable`. Setiap deploy mem-purge CDN per nama host
lewat `server/purge-cdn.mjs` (post-deployment command, `--dry-run` dan `--strict`
tersedia), jadi rebuild tetap cepat terlihat; bila kredensial tidak diatur, ia
hanya memberi peringatan dan `s-maxage` membatasi kebasian.

- Pembaca situs tidak melihat perbedaan selain halaman yang lebih cepat bila CDN
  dikonfigurasi menyimpan HTML.
- Operator: variabel runtime `CLOUDFLARE_API_TOKEN` (secret, hanya Cache Purge
  satu zona), `CLOUDFLARE_ZONE_ID`, dan opsional `CDN_PURGE_HOSTS`; langkah
  lengkap di `docs/deploy-coolify.md`.
- Mengamandemen aturan HTML ADR-0016 (keputusan 5). Mirror Indonesia dan tabel
  indeks ADR diperbarui.
