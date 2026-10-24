---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Batas kepemilikan frontend Astro vs Control Center OMES didokumentasikan

Menambah bagian 6 di [`docs/crm-public-ux-contract.md`](../docs/crm-public-ux-contract.md) (dengan cerminan Indonesia): matriks permukaan antara landing publik Astro OMES-Web, Control Center SYSTEM OMES di `awcms` (`/admin/omes`), dan host native/Hermes di repo `omes`, beserta status rute sekarang vs rencana. Hanya dokumentasi; tidak ada rute, UI, kode control-plane, atau kontrak eksternal baru (issue #136, OMES #350, omes-web#21).

Alasannya: menunjuk template ini sebagai rujukan situs OMES bisa terbaca sebagai "salin juga adminnya", padahal admin SYSTEM hanya hidup di `awcms`.

- Pembaca situs tidak melihat perubahan apa pun.
- Pengembang mendapat batas tegas: tidak ada rute `/admin/omes` di repo ini, dan OMES-Web mengadopsi pola tanpa dependensi kode ke repo ini.
