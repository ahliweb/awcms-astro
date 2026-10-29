---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Alur pengembangan produk v2: UX tervalidasi, lalu frontend → backend → integrasi

Menambahkan butir 6 di §"The mandatory workflow" `AGENTS.md` (dan cerminnya
`AGENTS.id.md`): pekerjaan produk mengikuti alur 18 langkah v2.0.0 milik
`ahliweb/personal-coding`, yang diadopsi `awcms` lewat ADR-0156. Untuk repo ini,
layar diuji pengguna sebelum kontrak, dan setiap slice dikerjakan sebagai 11.1
frontend di sini terhadap mock kontrak `awcms` → 11.2 backend sebagai PR di
`awcms` → 11.3 integrasi.

- Hanya memengaruhi cara pekerjaan direncanakan dan diurutkan.
- Tidak mengubah keluaran situs, dependensi, atau deployment.
