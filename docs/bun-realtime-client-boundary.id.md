🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](bun-realtime-client-boundary.md)

<!-- i18n-source-hash: sha256:7c7d8110f5b31bdb7297b8aa2239fd58de4f2c18b62263a3280625d0972b5f1a -->

# Batas konsumen real-time Bun-only untuk AWCMS-Astro (usulan)

> **Hanya rancangan dan dokumentasi.** [Issue #123](https://github.com/ahliweb/awcms-astro/issues/123) · ADR realtime upstream [AWCMS #1168](https://github.com/ahliweb/awcms/issues/1168) · 24 Oktober 2026. Tidak berarti rute realtime atau server WebSocket sudah ada.

## Kondisi yang sudah berjalan
Repo ini merupakan situs publik Astro dan USER admin/BFF opsional dengan runtime Bun. `package.json` memin `bun@1.4.4`, `bun run serve` menjalankan server ter-bundle Bun, dan ADR-0050 melarang **runtime Node.js** meski kode kompatibel Bun memakai `node:*` atau `@astrojs/node` di atas Bun. `ahliweb/awcms` tetap menjadi backend sumber kebenaran serta SYSTEM admin. **Belum terverifikasi adanya server WebSocket atau engine broadcast provider di frontend ini.**

## Kontrak integrasi ke depan

1. **Tidak boleh ada antrean/pengirim kedua.** Email/Mailketing, WhatsApp StarSender/Meta, Telegram dan Web Push dikirim oleh worker Bun dan API HTTP provider milik upstream AWCMS; perkakas host dan runtime agent sisi operator di luar tanggung jawab ini.
2. Setelah [AWCMS #1168](https://github.com/ahliweb/awcms/issues/1168) menyetujui protokol, halaman USER/admin dapat memakai **SSE Bun** untuk progres kampanye/inbox/notifikasi satu arah; **WebSocket native Bun** hanya untuk kebutuhan dua arah yang tervalidasi. Polling terautentikasi tetap fallback. API `EventSource` dan `WebSocket` di browser **bukan runtime server Node.js**.
3. Bila rute streaming BFF diperlukan dan diadmit, jalankan di bawah **Bun versi repo**, bukan Node.js, runtime npm/pnpm/yarn, sidecar Socket.IO berbasis Node atau pengirim provider langsung. Halaman publik/USER admin tetap sesuai arsitektur, tidak membuka SYSTEM admin owner.
4. Verifikasi tenant/site/user/role, Origin dan CSP `connect-src`, token/tiket pendek dibatasi audience (tanpa bearer panjang pada query), rekoneksi/cursor/snapshot, redaksi payload, kuota/backpressure. Nama topik tenant dan token provider bukan input bebas klien.
5. Browser seluler yang ditutup/ditangguhkan tidak mempertahankan SSE/WS. Gunakan Web Push yang didaftarkan secara eksplisit bila didukung.
6. Pengujian mendatang: dua tenant, percobaan topik ilegal, Origin berbeda, tiket kedaluwarsa, replay, kanal lintas-brand, gangguan provider, browser terputus lama, WCAG, XSS/CSRF, `bun test`, `bun run build` dan audit terjemahan.

## Referensi lintas repo
- [AWCMS #1167](https://github.com/ahliweb/awcms/issues/1167) standar worker, [#1168](https://github.com/ahliweb/awcms/issues/1168) desain real-time, serta README modul email, WhatsApp dan push upstream.
- Repo produk konsumen yang diturunkan dari keluarga AWCMS melacak sendiri pekerjaan runtime CRM, kampanye, Telegram, Mailketing dan Web Push di pelacaknya masing-masing; tidak ada yang dilacak di sini.
- Worker host sisi operator yang menarik lewat HTTPS keluar bertanda tangan tidak berubah dan di luar cakupan di sini.

Referensi Bun: https://bun.com/docs/runtime/http/websockets dan https://bun.com/guides/http/sse. Selalu uji kompatibilitas dengan versi Bun yang dipin.
