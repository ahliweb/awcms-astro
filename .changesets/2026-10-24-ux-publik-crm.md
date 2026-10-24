---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Kontrak UX publik untuk lead dan consent CRM didokumentasikan

Menambah [`docs/crm-public-ux-contract.md`](../docs/crm-public-ux-contract.md) (dengan cerminan Indonesia) dan menautkannya dari README: peta antara yang **sudah ada** di situs publik Astro ini dan yang baru **direncanakan** — form lead, opt-in per kanal, preferensi notifikasi, dan status klien realtime Bun. Ini usulan dokumentasi; tidak ada rute, API, atau pengirim kampanye yang dikirim.

Alasannya: tanpa label status yang jujur, "direncanakan" mudah terbaca sebagai "sudah ada", dan sebuah situs turunan bisa mengklaim inbox sosial terhubung hanya karena ada tautan profil.

- Pembaca situs tidak melihat perubahan apa pun.
- Pengembang mendapat batas tegas: pengiriman email/WhatsApp/Telegram tetap milik `awcms`, dan admin SYSTEM tidak pernah hidup di repo ini.
