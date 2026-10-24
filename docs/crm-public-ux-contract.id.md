🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](crm-public-ux-contract.md)

<!-- i18n-source-hash: sha256:3c561da21740638f2aba7db2604ab2ca1efd7a31ea5b2eb0f531b9c6f4f57541 -->

# AWCMS-Astro — UI/UX form lead publik, consent dan konsumen real-time v1.0

**Dokumentasi desain usulan, 24 Oktober 2026** · [issue #127](https://github.com/ahliweb/awcms-astro/issues/127). Repo ini memiliki **situs publik Astro**, dengan admin USER/BFF opsional jika dinyatakan; bukan SYSTEM admin AWCMS, database CRM, pengirim provider maupun pengelola host OMES. Patuhi [AGENTS.md](../AGENTS.md), [ADR Bun](adr/0050-bun-is-this-repos-only-runtime-and-a-gate-finally-says-so.id.md), [batas realtime #123](https://github.com/ahliweb/awcms-astro/issues/123), serta [UI/UX CRM AWCMS-One #472](https://github.com/ahliweb/awcms-one/issues/472).

## 1. Kondisi tersedia dan rencana

| Permukaan | Kondisi | Keputusan UX |
| --- | --- | --- |
| Halaman publik Astro, navigasi, SEO, sitemap, media | SUDAH ADA; isi tergantung profil/site | Pertahankan halaman static-first dan aksesibilitas |
| Admin USER/BFF | Boleh hanya jika site menyatakan | Jangan munculkan SYSTEM owner controls |
| Form lead ke modul CRM generik | RENCANA, menunggu AWCMS #1163/#1166 | Hanya aktif setelah kontrak API dan privasi disetujui |
| Tautan sosial share/follow | Bisa berupa tautan biasa | Bukan bukti koneksi API sosial |
| Preferensi consent dan Web Push customer | RENCANA sesuai produk, One #430–#432 | Baru aktif bila endpoint dan Service Worker siap |
| Klien progres SSE/WS | RENCANA setelah AWCMS #1168/#1171 | SSE Bun satu arah lebih diutamakan, polling fallback |
| Worker broadcast email/WA/Telegram/sosial | BUKAN MILIK REPO INI | Backend AWCMS dan worker Bun upstream |
| Runtime | Saat ini bun@1.4.2, terbaru terverifikasi 1.4.4 | Upgrade atomic [#125](https://github.com/ahliweb/awcms-astro/issues/125), audit library [#126](https://github.com/ahliweb/awcms-astro/issues/126) |

## 2. Alur UI dan wireframe

Header publik menampilkan logo, navigasi, pencarian, CTA kontak yang jelas, tautan sosial, konten/tawaran dan footer privasi. Tautan akun Instagram/WhatsApp bukan jaminan kemampuan inbox/broadcast API. Untuk produk yang memakai CRM, form lead dapat ditempatkan di kontak atau detail layanan. Desktop: kolom formulir dan penjelasan privasi; mobile: form bertumpuk dan CTA tetap jelas tanpa menutupi legal notice.

### Web-F1 Form permintaan informasi (rencana)
Field: nama (hanya bila diperlukan), kontak email/telepon terverifikasi formatnya, pertanyaan/minat layanan, pilihan kanal balasan bila didukung, source/UTM yang ditangkap server, **opt-in email marketing terpisah dari opt-in WhatsApp marketing**, dan informasi privasi yang sah. Jangan gabungkan consent pemasaran opsional dengan kebutuhan layanan. Proteksi antispam/CSRF berasal dari server; tidak menerima file bebas. State: kosong, mengisi, invalid, terkirim, pending, timeout, offline, rate-limited dan retry. Tampilkan referensi permintaan tanpa mengklaim sudah menjadi customer/konversi valid. Error terhubung aria-describedby, nilai tetap ada saat retry, jangan bocorkan diagnostic backend kepada anonim.

### Web-F2 Pengaturan privasi/notifikasi (rencana)
Untuk pelanggan terautentikasi saja: tampilkan status persetujuan per tujuan/kanal, waktu/sumber opt-in, perubahan dan konfirmasi opt-out, tautan ekspor/hapus data. Web Push hanya diminta setelah klik sadar dan layar menerangkan manfaatnya; iPhone dapat memerlukan instruksi instalasi Home Screen sesuai kemampuan browser. Tanpa backend, tampilkan fitur belum tersedia, bukan toggle yang pura-pura tersimpan. Browser ditutup tidak menjalankan SSE/WS terus-menerus.

### Web-F3 Tautan sosial situs
Ikon Facebook, IG, TikTok, YouTube, LinkedIn, Telegram dan lainnya berupa tautan eksternal dengan label aksesibel dan kebijakan rel/target aman. Tidak menyimpulkan lead conversion dari klik tanpa callback tepercaya. Tombol wa.me adalah tautan yang dimulai pengguna, bukan backend StarSender atau Meta Cloud API. Sosial login, DM, inbox multi-account adalah fitur berbeda dan memerlukan izin provider.

### Web-F4 Status admin USER opsional (rencana)
Jika suatu situs secara eksplisit memiliki USER admin dan backend memberikan izin, badge progres dapat mengambil **SSE Bun** satu arah setelah ADR AWCMS #1168; WS native Bun hanya bila perlu dua arah. Gunakan tiket audience singkat, pengecekan Origin, CSP connect-src, tenant/site scoped data, reconnect cursor/snapshot dan fallback polling. Jangan tampilkan token/API key/PII pada frame atau URL. Status teks Unknown/Stale/Queued/Accepted/Verified Delivered. Tidak ada feed privat pada halaman publik anonim.

## 3. Komponen, responsif dan aksesibilitas

Gunakan komponen/token Astro yang sudah dipakai: InputField, ConsentCheckbox, PrivacyHint, FormStep, FeedbackBanner, SocialLink, ConnectionStatus yang terotorisasi, NotificationToggle setelah API, RetryAction dan StatusTable berlabel. Keyboard Tab/Enter/Escape, focus yang tampak, reduced motion, WCAG 2.2 AA, target sentuh praktis ≥44px bila relevan dan informasi error aria-live. Desktop ≥1200px boleh dua kolom, tablet 768–1199px bantuan dilipat, mobile ≤767px satu kolom. Breakpoint perlu disesuaikan token proyek. Jangan membocorkan data customer ke HTML statis/build-time. SEO, sitemap, canonical, robots dan CSP tetap berfungsi.

## 4. Keamanan dan privasi
AWCMS upstream mengonfirmasi validasi form, kepemilikan tenant/domain, CSRF/antibot/rate limit, idempotensi lead serta asal persetujuan. Browser tidak melakukan pencocokan identitas sosial lintas akun. Jangan mengirim PII kontak lewat analitik publik/UTM tanpa dasar yang sah, tidak menaruh secret di bundle, HTML, localStorage atau log. Gunakan HTTPS dan validasi URL redirect/outbound. Pengirim email/WA/Web Push tetap backend.

## 5. Acceptance dan dependensi
**AT-W1** keyboard/mobile 360px, error/retry; **AT-W2** consent terpisah dan dapat dicabut; **AT-W3** 2 tenant/cross-site form ditolak; **AT-W4** Web Push browser ditutup bukan WebSocket; **AT-W5** SEO/sitemap/robots/CSP dan batas admin USER; **AT-W6** ikon sosial bukan koneksi API; **AT-W7** upgrade Bun stabil melalui staging, tanpa Node runtime. Pengujian bun test, bun run check, bun run build, bun run audit:translation, asset/SEO dan dokumentasi. Persyaratan producer mengikuti AWCMS #1168/#1166. **PR dokumentasi tidak membuat route atau API baru.**
