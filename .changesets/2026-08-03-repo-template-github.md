---
tipe: struktur
dampak: internal
---

# `awcms-astro` menjadi template repository GitHub — dan dokumennya dibuat benar untuk itu

Setelan repo diubah (`is_template: true`), jadi tombol **"Use this template"**
membuat repo baru berisi seluruh kerangkanya dengan riwayat commit yang bersih —
bukan fork.

Setelan itu bagian termudahnya. Yang penting: **dokumen yang pertama dibaca
orang yang menekan tombol itu ternyata memerikan repo yang lain.**

## Yang ditemukan di `checklist-repo-baru.md`

Ia dibuka dengan "Salin kerangka: ambil dari repo rujukan …" — cara lama, dan
persis cara repo ini sendiri pernah mewarisi indeks ADR milik repo lain. Lalu ia
menyuruh pembacanya menyiapkan lima hal yang **tidak ada di repo ini**:
`src/content.config.ts`, `src/data/`, `src/content/`, `src/assets/images/`, dan
`docs/workflows/` — semuanya bentuk konten-di-repo yang ADR-0018 gantikan saat
konten pindah ke `awcms`. Satu butir lagi menyuruh "isi peta
`src/lib/article-images.ts`", peta yang ADR-0024 ganti dengan konvensi nama.

§1 kini menyebut tombolnya, lalu mendaftarkan yang **harus dikosongkan sebelum
commit pertama** karena isinya riwayat template dan bukan riwayat situs
pembacanya: `.changesets/`, `CHANGELOG.md`, `docs/adr/`, identitas
`package.json`, dan `graphify-out/`.

## Dua dokumen standar yang membantah kode

- `standar-teknis.md` menulis "Kontrak frontmatter ada di `src/content.config.ts`
  dan merupakan **satu-satunya acuan**", dan mendaftarkan `astro:assets` sebagai
  penanganan gambar. Keduanya bertentangan dengan repo ini — dan yang kedua
  bertentangan dengan ADR-0024 yang mendarat hari ini juga.
- `docs/awcms-astro/README.md` menyebut kontrak repo ini "frontmatter
  (`content.config.ts`)" padahal kontraknya `LocalizedArticle` di
  `src/lib/content.ts`, dijaga `tests/kontrak-awcms.test.mjs`.

Keduanya dikoreksi dengan menyebut standar keluarga **dan** simpangan repo ini,
bukan dengan menghapus standarnya — skema itu tetap yang harus dipenuhi sisi
`awcms` supaya situs seperti ini punya jaminan yang sama.

## Gerbang kelima: jalur yang disebut dokumen harus ada

Empat cacat dari kelas yang sama ditemukan dalam satu hari, jadi kelasnya
digerbangi. `bun run audit:dokumen` kini memeriksa **span kode** — bukan tautan —
yang berbentuk jalur repo: 144 span, 8 pengecualian ber-alasan.

Daftar pengecualian itu yang membedakan gerbang dari gangguan: dokumen di sini
membandingkan diri dengan `awcms` dan repo rujukan, dan perbandingan itu justru
isinya. Tiap baris pengecualian **wajib menyebut milik siapa jalur itu**;
"belum dibuat" bukan alasan, karena itu justru yang gerbang ini cari.

Pengecualian yang membusuk — tidak lagi disebut dokumen mana pun — menutupi
jalur yang kelak benar-benar hilang, jadi ia ikut dijaga. Tetapi di tesnya,
bukan di skripnya: daftarnya milik repo ini, sementara gerbangnya harus tetap
benar saat dijalankan atas pohon fixture maupun atas situs turunan yang
dokumennya lain sama sekali.
