# Changesets

Satu berkas per perubahan, ditulis pada iterasi yang sama dengan perubahannya. Tujuannya sederhana: saat rilis diberi versi, catatan perubahannya sudah ada dan ditulis orang yang paling paham konteksnya — bukan direkonstruksi dari `git log` berbulan-bulan kemudian.

## Kapan wajib

Perubahan yang memengaruhi konten publik, struktur, dependency, atau deployment. Perbaikan typo tanpa perubahan makna tidak perlu.

## Format

Nama berkas: `YYYY-MM-DD-ringkasan-kebab-case.md`.

```markdown
---
tipe: konten | struktur | perbaikan | dependency | dokumentasi
dampak: publik | internal
---

# Judul singkat

Apa yang berubah dan **mengapa**. Bagian "mengapa" yang paling bernilai —
"apa" bisa dibaca dari diff, "mengapa" tidak.

- Poin perubahan yang terlihat pembaca situs.
- Poin perubahan yang hanya terasa saat mengembangkan.
```

## Catatan

Berkas di sini dilipat ke [`CHANGELOG.md`](../CHANGELOG.md) oleh `bun run release`, lalu dihapus. Judulnya diturunkan dua tingkat agar bersarang rapi di bawah heading versi.

**Aturan ini kini dijaga.** `bun run audit:dokumen` menyelesaikan setiap tautan dari letak berkas yang memuatnya, jadi `../docs/adr/x.md` di sini lolos dan `docs/adr/x.md` merah — tanpa aturan khusus untuk direktori ini. Ia berjalan di CI dan, pada `bun run release`, tepat sebelum changeset dilipat.

**Tautan relatif ditulis dari sudut pandang `.changesets/`.** Skrip rilis menulis ulang jalurnya ke sudut pandang akar repo saat melipat — `../docs/adr/x.md` menjadi `docs/adr/x.md`. Sebelum itu ada, setiap tautan relatif meleset satu tingkat begitu dilipat, dan cacatnya baru terlihat di CI: gerbang audit berjalan **sebelum** changeset dilipat, jadi berkas yang rusak belum ada saat audit melihatnya.
