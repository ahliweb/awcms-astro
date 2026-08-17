---
bump: patch
tipe: dependency
dampak: internal
---

# Advisory `nanoid` ditutup lewat override, dan gerbang `bun audit` hijau lagi

`bun audit --audit-level=low` di job `check` mulai merah untuk **setiap** PR,
tanpa satu pun berkas repo ini berubah: advisory
[GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8)
(`high`) terbit untuk `nanoid < 3.3.18`, dan rantainya
`astro › vite › postcss › nanoid` menahan `^3.3.16` — yang resolve ke `3.3.17`.

Itu bentuk kegagalan yang paling mudah salah dibaca: gerbangnya merah pada PR
dokumen yang tidak menyentuh satu dependency pun, sehingga penulisnya mencari
sebabnya di tempat yang salah.

`postcss` belum melonggarkan rentangnya, jadi menaikkan `astro` tidak
memperbaikinya — PR Dependabot yang menaikkan `astro` ke 7.2.0 membawa
`nanoid@3.3.17` yang sama. Yang menutupnya adalah **override**, pola yang sudah
dipakai repo ini untuk `fast-uri`: satu baris di `package.json`, dan lockfile
yang menuliskannya.

`3.3.18` adalah rilis patch murni dari cacat yang sama (`nanoid(0)` bisa
berputar tanpa henti pada generator kustom), jadi tidak ada permukaan API yang
berubah.
