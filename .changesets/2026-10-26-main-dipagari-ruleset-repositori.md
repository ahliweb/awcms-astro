---
bump: patch
tipe: dokumentasi
dampak: internal
---

# `main` dipagari ruleset repositori, dan dokumen berhenti mengklaim lebih dari itu (#137)

Audit 24 Oktober 2026 menemukan `main` tidak terlindungi sama sekali, padahal baris SSDF PS.1 di dokumen standar berbunyi "Terpenuhi — branch protection + review" dan `AGENTS.md` hanya mengandalkan kebiasaan. Pada 26 Oktober 2026 ruleset `main-protection` diterapkan di pengaturan GitHub dan diverifikasi: penghapusan dan force push ditolak, pull request wajib, `Check`, `Build`, dan `Analyze (javascript-typescript)` wajib hijau pada branch yang mutakhir, tanpa bypass actor (admin termasuk), dan branch yang sudah di-merge dihapus otomatis. Push langsung dan force push ke `main` sama-sama ditolak `GH013`, dan PR uji dengan tes yang sengaja gagal tidak bisa di-merge.

Yang berubah di repo ini hanya dokumentasi: ADR-0053 mencatat keputusannya beserta alasan approval wajib `0` (akun User dengan satu maintainer tak bisa menyetujui PR-nya sendiri, dan bypass actor akan membuka kembali push langsung). ADR itu juga menyatakan terang-terangan apa yang tidak dicakup: tag tidak dilindungi; ruleset hidup di pengaturan GitHub sehingga tak ada gerbang yang memerahkan bila ia dicabut, jadi ia diverifikasi manual dengan `gh api repos/ahliweb/awcms-astro/rules/branches/main`; `Build` memiliki `needs: Check` sehingga bukan pagar yang berdiri sendiri, dan di template ini ia melewati langkah integrasinya saat `vars.AWCMS_API_URL` kosong.

- `AGENTS.md`, `CONTRIBUTING.md`, dan `GOVERNANCE.md` menjelaskan jalur sebenarnya sebuah perubahan sampai ke `main`.
- Baris SSDF PS.1 dan PW.7 diturunkan menjadi "Terpenuhi sebagian" dengan alasannya, karena review manusia tidak ditegakkan.
- `checklist-repo-baru.md` meminta situs turunan menerapkan ruleset setara dan memeriksa ulang nama konteks pemeriksaannya sendiri.
- Pembaca situs tidak melihat perubahan apa pun.
