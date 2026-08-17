🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](README.md)

<!-- i18n-source-hash: sha256:79e39e38b691bf705e4a5cf28502a0b7ab6742c07d3683186689174de0684af3 -->

# Changesets

Satu berkas per perubahan, ditulis pada iterasi yang sama dengan perubahannya. Tujuannya sederhana: saat rilis diberi versi, catatan perubahannya sudah ada dan ditulis orang yang paling paham konteksnya — bukan direkonstruksi dari `git log` berbulan-bulan kemudian.

## Kapan wajib

Perubahan yang memengaruhi konten publik, struktur, dependency, atau deployment. Perbaikan typo tanpa perubahan makna tidak perlu.

## Format

Nama berkas: `YYYY-MM-DD-ringkasan-kebab-case.md`.

```markdown
---
bump: major | minor | patch
tipe: konten | struktur | perbaikan | dependency | dokumentasi
dampak: publik | internal
---

# Judul singkat

Apa yang berubah dan **mengapa**. Bagian "mengapa" yang paling bernilai —
"apa" bisa dibaca dari diff, "mengapa" tidak.

- Poin perubahan yang terlihat pembaca situs.
- Poin perubahan yang hanya terasa saat mengembangkan.
```

## `bump` menentukan versinya ([ADR-0040](../docs/adr/0040-changeset-menyatakan-bump-semver.md))

Inilah bidang yang dibaca rilis. Versi berikutnya adalah bump **terbesar** di antara changeset yang menunggu: satu `minor` di samping sembilan `patch` membuat seluruh rilis menjadi `minor`.

| `bump` | Untuk sebuah situs, artinya | Contoh |
| ------- | ---------------------------- | ------- |
| `major` | sebuah URL publik, struktur konten, atau kontrak frontmatter **putus** | slug sebuah tab berubah, sehingga setiap tautan ke sana jadi 404 |
| `minor` | pembaca mendapat sesuatu: artikel, tab, locale, atau fitur baru | sebuah seksi `news` muncul |
| `patch` | perbaikan yang tidak mengubah bentuk situs | typo, gaya, dependency, dokumentasi, header respons yang dibetulkan |

Pilih **sambil menulis perubahannya**, satu-satunya saat ketika ada orang yang tahu jawabannya. Sebelum ADR-0040 tingkatnya diketik di baris perintah saat rilis, oleh siapa pun yang kebetulan menjalankan skripnya — sering berbulan-bulan kemudian, sering bukan penulisnya, dan selalu dari daftar nama berkas alih-alih dari perubahannya sendiri.

Dua aturan lahir dari `bump` yang memikul beban, dan keduanya digerbangi `tests/versi-changeset.test.mjs`:

- **Changeset tanpa `bump` yang sah memerahkan gerbang.** Bukan karena bidangnya administrasi wajib, melainkan karena kegagalan yang dicegahnya tidak terlihat: changeset yang tidak bisa dibaca rilis berhenti menyumbang ke versi, dan tidak ada yang tampak salah.
- **`bun run release` boleh disebutkan tingkatnya, dan hanya boleh yang LEBIH BESAR.** Perilis yang tahu perubahannya lebih besar daripada yang diakui changeset-nya boleh mengatakannya; yang lebih kecil ditolak, karena itu menerbitkan sesuatu yang putus di balik nomor yang menjanjikan sebaliknya.

Versi memakai `MAJOR.MINOR.PATCH`, ditandai `vX.Y.Z`. Repo ini masih `0.x`, di mana semver sendiri tidak menjanjikan kompatibilitas apa pun — `bump` mencatat niat sekarang supaya catatannya sudah benar saat `1.0.0` membuatnya mengikat.

## Catatan

Berkas di sini dilipat ke [`CHANGELOG.md`](../CHANGELOG.md) oleh `bun run release`, lalu dihapus. Judulnya diturunkan dua tingkat agar bersarang rapi di bawah heading versi.

**Aturan ini kini dijaga.** `bun run audit:dokumen` menyelesaikan setiap tautan dari letak berkas yang memuatnya, jadi `../docs/adr/x.md` di sini lolos dan `docs/adr/x.md` merah — tanpa aturan khusus untuk direktori ini. Ia berjalan di CI dan, pada `bun run release`, tepat sebelum changeset dilipat.

**Tautan relatif ditulis dari sudut pandang `.changesets/`.** Skrip rilis menulis ulang jalurnya ke sudut pandang akar repo saat melipat — `../docs/adr/x.md` menjadi `docs/adr/x.md`. Sebelum itu ada, setiap tautan relatif meleset satu tingkat begitu dilipat, dan cacatnya baru terlihat di CI: gerbang audit berjalan **sebelum** changeset dilipat, jadi berkas yang rusak belum ada saat audit melihatnya.

Changeset sendiri **tidak** dicerminkan ke bahasa Indonesia, berbeda dari dokumen lain di sini ([ADR-0039](../docs/adr/0039-english-is-the-source-language.md)): ia fana sejak lahir — dilipat ke changelog lalu dihapus saat rilis — jadi cerminnya akan hidup lebih lama daripada sumbernya persis satu rilis. README ini dokumen biasa, dan ia dicerminkan.
