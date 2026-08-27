🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](README.md)

<!-- i18n-source-hash: sha256:3f93285340acb1aa74344789d0bcc56836a340712dc280005b7fca180b9a1f11 -->

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

## Backlog-nya punya dua batas ([ADR-0048](../docs/adr/0048-a-release-is-cut-when-the-backlog-crosses-a-bound.id.md))

`bump` menentukan seberapa besar sebuah rilis; ia tidak pernah menentukan **kapan**. Itu diserahkan ke siapa pun yang teringat, dan pada 28 Agustus 2026 ada tiga puluh entri menunggu di sini — dua puluh hari di belakang `v0.2.0`, dua di antaranya perbaikan keamanan yang tidak punya versi terbit untuk ditarik operator situs.

Maka `bun run audit:rilis` membatasi direktori ini, dan ia berjalan di CI bersama gerbang lainnya:

| Batas | Nilai | Kenapa angkanya |
| --- | --- | --- |
| Berkas yang menunggu | **12** | Kira-kira delapan hari kerja pada laju terukur repo ini sendiri — tiga puluh entri dalam dua puluh hari |
| Usia yang tertua | **14 hari** | Waktu terlama sebuah situs turunan pantas menunggu sebelum bisa menarik perbaikan keamanan |

Nama berkaslah yang memikul usianya, jadi `YYYY-MM-DD-` sekarang **diwajibkan, bukan sekadar didokumentasikan**: nama yang tidak bisa ditanggali gerbangnya tidak pernah menua, dan ia akan duduk di sini tak terlihat oleh satu-satunya pemeriksa yang dibangun untuk melihatnya. Tanggal yang tidak ada di kalender (`2026-02-31`) ditolak, begitu juga tanggal yang lebih dari sehari di depan mesin yang memeriksanya — satu hari kelonggaran, karena penulis menamai berkasnya dalam zonanya sendiri sementara CI memegang UTC.

Melewati batas bukan kesalahan yang perlu diminta maaf — ia sinyal bahwa `bun run release --apply` sudah waktunya. Skrip rilis tidak menjalankan gerbang ini, karena melipat changeset justru tindakan yang membersihkannya.

## Catatan

Berkas di sini dilipat ke [`CHANGELOG.md`](../CHANGELOG.md) oleh `bun run release`, lalu dihapus. Judulnya diturunkan dua tingkat agar bersarang rapi di bawah heading versi.

**Aturan ini kini dijaga.** `bun run audit:dokumen` menyelesaikan setiap tautan dari letak berkas yang memuatnya, jadi `../docs/adr/x.md` di sini lolos dan `docs/adr/x.md` merah — tanpa aturan khusus untuk direktori ini. Ia berjalan di CI dan, pada `bun run release`, tepat sebelum changeset dilipat.

**Tautan relatif ditulis dari sudut pandang `.changesets/`.** Skrip rilis menulis ulang jalurnya ke sudut pandang akar repo saat melipat — `../docs/adr/x.md` menjadi `docs/adr/x.md`. Sebelum itu ada, setiap tautan relatif meleset satu tingkat begitu dilipat, dan cacatnya baru terlihat di CI: gerbang audit berjalan **sebelum** changeset dilipat, jadi berkas yang rusak belum ada saat audit melihatnya.

Changeset sendiri **tidak** dicerminkan ke bahasa Indonesia, berbeda dari dokumen lain di sini ([ADR-0039](../docs/adr/0039-english-is-the-source-language.md)): ia fana sejak lahir — dilipat ke changelog lalu dihapus saat rilis — jadi cerminnya akan hidup lebih lama daripada sumbernya persis satu rilis. README ini dokumen biasa, dan ia dicerminkan.
