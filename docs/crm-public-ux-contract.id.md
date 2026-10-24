🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](crm-public-ux-contract.md)

<!-- i18n-source-hash: sha256:3cb83a9a692f898e0352ec29b00f85ec764b34f141a9fa73d4f761f3d6e12dd9 -->

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
| Runtime | Dipin pada bun@1.4.4 (`packageManager`; upgrade [#125](https://github.com/ahliweb/awcms-astro/issues/125) sudah ditutup) | Audit kesegaran dependensi dan library [#126](https://github.com/ahliweb/awcms-astro/issues/126) |

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
**AT-W1** keyboard/mobile 360px, error/retry; **AT-W2** consent terpisah dan dapat dicabut; **AT-W3** 2 tenant/cross-site form ditolak; **AT-W4** Web Push browser ditutup bukan WebSocket; **AT-W5** SEO/sitemap/robots/CSP dan batas admin USER; **AT-W6** ikon sosial bukan koneksi API; **AT-W7** pengujian pada Bun 1.4.4 yang dipin, tanpa Node runtime. Pengujian bun test, bun run check, bun run build, bun run audit:translation, asset/SEO dan dokumentasi. Persyaratan producer mengikuti AWCMS #1168/#1166. **PR dokumentasi tidak membuat route atau API baru.**

## 6. Batas kepemilikan frontend dan penggunaan ulang (OMES Control Center vs repo ini)

**Dokumentasi usulan, 24 Oktober 2026** · [issue #136](https://github.com/ahliweb/awcms-astro/issues/136). Menurut issue #136, keputusan kepemilikan lintas repo ada di OMES [#350](https://github.com/ahliweb/omes/issues/350) (Opsi A, kepemilikan lima repo) dan sisi situs OMES di [omes-web#21](https://github.com/ahliweb/omes-web/issues/21). Bagian ini hanya menyatakan artinya bagi repo **ini**; tidak mengulang atau mengubah apa yang dilakukan `awcms` atau OMES. Setiap klaim tentang repo-repo itu di bawah berbunyi "menurut issue #136 / OMES #350", bukan sesuatu yang diverifikasi dari sini.

Mengapa perlu ditulis: menunjuk template ini sebagai rujukan situs OMES bisa terbaca sebagai "salin juga adminnya". Itu tidak boleh. Repo ini adalah frontend konten publik Astro dengan admin USER opsional yang dinyatakan ([ADR-0034](adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.id.md), `permukaanAdmin` di `src/config/site.ts`); admin SYSTEM ada di `awcms`.

### 6.1 Matriks kepemilikan permukaan

| Permukaan | Berada di | Hubungan dengan repo ini |
| --- | --- | --- |
| Situs web OMES — landing publik Astro | OMES-Web (`ahliweb/omes-web`), situs mandiri turunan situs `landing` AWCMS-One (menurut issue #136) | Boleh **mengadopsi** pola dan kontrak repo ini (di bawah). Tanpa dependensi kode atau runtime ke repo ini; dideploy mandiri |
| CMS OMES — Control Center SYSTEM | `awcms`, rute `/admin/omes`, kanonik menurut issue #136 / OMES #350 | **Bukan di sini, selamanya.** Repo ini tidak mengimplementasikan, mencerminkan, atau mem-proxy-nya |
| Host native OMES / Hermes (poll worker, runtime kirim provider) | repo `omes` (menurut OMES #350) | **Bukan di sini, selamanya.** Tanpa poll-worker host, tanpa runtime kirim provider, tanpa kredensial keduanya |
| Halaman publik situs dari template ini | repo ini dan situs turunannya | Fungsi utama ([ADR-0034](adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.id.md)) |
| Admin USER opsional satu situs | repo ini, hanya bila dinyatakan di `permukaanAdmin` | Kondisi sekarang: **belum ada yang dinyatakan** |

**Tidak ada rute `/admin/omes` ganda di luar `awcms`.** File rute di sini di bawah `/admin/omes` (atau layar SYSTEM `omes` dengan nama lain) akan menjadi salinan kedua Control Center. `tests/peran-situs.test.mjs` sudah menolak rute on-demand yang prefiksnya tidak dinyatakan, dan `owner` ditolak di `permukaanAdmin.peran`; bagian ini menambah aturannya hanya dalam prosa dan **tidak menambah gerbang baru** — tidak diperiksa mesin di luar kedua itu.

### 6.2 Yang dipertahankan dan yang dihindari

Dipertahankan di repo ini: halaman publik `output: 'static'`, SEO (canonical, sitemap, data terstruktur), CSP ketat dan header lain yang hanya diputuskan di [`server/penyaji.mjs`](../server/penyaji.mjs) ([ADR-0016](adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.id.md), [ADR-0019](adr/0019-csp-ketat-dikirim-penyaji.id.md)), komponen branding dan kontak yang aksesibel menurut target WCAG, serta admin USER opsional lewat `permukaanAdmin`.

Tidak diimplementasikan di sini: admin SYSTEM OMES, kredensial host atau provider, poll-worker host, runtime kirim provider, maupun layar lintas tenant.

### 6.3 Adopsi oleh OMES-Web dan primitif generik

OMES-Web boleh mengadopsi pola dan kontrak ini (token, komponen kontak/branding aksesibel, sikap SEO dan CSP) dengan **menyalin atau mengimplementasikan ulang di repo-nya sendiri**, bukan mengimpor dari sini: tiap situs dideploy mandiri, sehingga dependensi ke `awcms-astro` mengikat dua siklus rilis. Primitif visual yang ditambahkan di sini harus tetap generik — dapat dipakai tanpa nama, tema, atau teks OMES di dalamnya; identitas situs berasal dari `src/config/site.ts` dan `.env`, sebagaimana sudah diwajibkan AGENTS.md.

### 6.4 Aksesibilitas, SEO, BFF dan CSP

- **A11y/SEO.** Batas bawah sama dengan §3 di atas: keyboard, fokus terlihat, reduced motion, 360px; permukaan terautentikasi menarget WCAG 2.2 AA. Konten publik tetap dapat diindeks.
- **Peran BFF dan batas tenant.** BFF portal Jualanku ([ADR-0014](adr/0014-rendering-campuran-dan-bff-portal.id.md)) menyusun panggilan `awcms` untuk layar situs ini sendiri dan tidak memutuskan apa pun yang berkonsekuensi bisnis; tenant berasal dari kredensial mesin, bukan dari browser. Ini bukan control plane OMES dan tidak boleh menjadi itu.
- **CSP `connect-src`.** Bila suatu permukaan yang dinyatakan kelak perlu koneksi (misalnya badge SSE di Web-F4), allowlist dilonggarkan di `server/penyaji.mjs` dan tidak di tempat lain, dibuktikan oleh `tests/penyaji.test.mjs`.
- **Runtime.** Hanya Bun; tidak ada runtime Node yang masuk kembali ke repo ini ([ADR-0050](adr/0050-bun-is-this-repos-only-runtime-and-a-gate-finally-says-so.id.md)).

### 6.5 Status rute sekarang vs rencana

| Butir | Kondisi |
| --- | --- |
| Rute on-demand (`prerender = false`) | **Belum ada satu pun.** Adapter terpasang hanya untuk menyajikan keluaran build |
| BFF portal Jualanku (`/penjual/**`, `/_portal-api/**`) | RENCANA, belum diimplementasikan (ADR-0014) |
| Admin USER lewat `permukaanAdmin` | Diizinkan ADR-0034, **nol yang dinyatakan** di template ini |
| `/admin/omes` | **Tidak pernah** direncanakan di sini; hanya `awcms` |
| Landing OMES-Web | Dilacak di omes-web#21; di luar repo ini |

### 6.6 Penerimaan untuk bagian ini

Hanya dokumentasi dan penyelarasan istilah (sumber EN plus cerminan ID): issue #136 **tidak menambah UI aplikasi, rute, kode control-plane, dependensi OMES yang ditanam, maupun kontrak eksternal baru**.
