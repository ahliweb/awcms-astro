---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Graf pengetahuan disegarkan dan 55 komunitasnya diberi nama dari anggotanya

`graphify-out/` dibangun ulang dengan `bun run knowledge:graph:update` (graphify 0.9.35, hanya `--code-only`, tanpa LLM dan tanpa kunci API): 1.444 node / 2.753 edge / 95 komunitas menjadi 1.458 / 2.774 / 94. Setelah `design/` dikeluarkan dari cakupan (#138), `bun run audit:graf` berada di 39 dari 40 berkas basi dan satu PR yang menambah dua berkas terindeks akan memerahkannya — batas `MAX_STALE_FILES = 40` memang ada supaya peta tidak membusuk diam-diam, jadi yang benar adalah membangun ulang, bukan menaikkan batasnya.

Partisi baru mengembalikan 48 komunitas ke nama-hub (nama berkas), yang ditolak `audit:graf`. Nama-nama itu tidak dibawa balik membabi buta: setiap komunitas dibaca anggotanya satu per satu, dan nama lama hanya dipakai ulang bila keanggotaannya memang masih sama. Tujuh nama-hub lain yang lolos gerbang tetapi tidak menjelaskan apa pun (`scripts`, `dependencies`, `bun`, `ADR-0028`, `compilerOptions`, `overrides`, `repository`) ikut diganti. Nama diterapkan dengan `bun run knowledge:graph:label`, tanpa memanggil `graphify` lagi, sehingga partisi yang dinamai tidak bergeser.

Staleness turun dari 39 ke 30, bukan ke nol, dan itu batas yang jujur: 30 berkas yang tersisa adalah dokumen Markdown dan YAML yang hanya bisa disegarkan oleh ekstraksi semantik (LLM), yang sengaja tidak pernah dijalankan skrip repo ini. Tidak ada batas, cakupan, atau aturan yang dilonggarkan.

- Pesan penutup `knowledge:graph:update` tidak lagi menyuruh menjalankan ulang `graphify cluster-only .` untuk menerapkan nama — langkah itu mempartisi ulang graf (terbukti lagi di PR ini: 94 → 96 komunitas, 77 kembali bernama hub, tanpa satu berkas kode pun berubah). Pesannya kini menunjuk `bun run knowledge:graph:label`, selaras dengan ADR-0051 dan `knowledge/README.md`.
- Pembaca situs tidak melihat perubahan apa pun.
- Pengembang mendapat peta yang kembali sesuai pohon kode, dengan 94 nama komunitas yang berbeda dan bermakna.
