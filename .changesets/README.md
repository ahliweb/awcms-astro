# Changeset

Satu berkas `.md` per iterasi, ditulis pada iterasi yang sama — bukan dirapel
di akhir. `npm run release -- <major|minor|patch> --apply` melipat seluruh
berkas di sini ke `CHANGELOG.md`, menaikkan versi, dan menandai rilisnya.

Isi berkasnya adalah catatan untuk manusia: apa yang berubah dan **kenapa**.
Daftar file yang tersentuh sudah ada di git; yang tidak ada di git adalah alasan.
