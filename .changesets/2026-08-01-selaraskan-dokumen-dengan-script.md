---
tipe: dokumentasi
dampak: internal
---

# Dokumen berhenti menyebut gerbang dan berkas yang tidak ada

Dokumen tata kelola repo ini masih dokumen repo rujukan yang disalin: ia
mewajibkan `bun run audit`, menyebut `scripts/audit-konten.mjs` dan
`bun run kartu-share`, menautkan ADR-0001…0013 yang tidak pernah ikut dibawa,
dan meminta kontributor memverifikasi tarif PNBP Kalteng di sebuah repo yang
tidak memuat satu pun artikel.

Yang membuat ini lebih dari kerapian: **gerbang yang disebut tetapi tidak ada
lebih berbahaya daripada gerbang yang jelas-jelas tidak ada.** Definition of Done
yang mewajibkan `bun run audit` melaporkan 0 error tidak pernah bisa dipenuhi —
jadi ia dilewati, dan yang ikut terlewati adalah butir di sebelahnya yang
sebenarnya bisa dijalankan. Checklist yang tidak mungkin dijalankan berhenti
dibaca seluruhnya.

## Yang diperbaiki

- `CONTRIBUTING.md` ditulis ulang untuk repo template: tabel perintah kini
  memuat script yang benar-benar ada di `package.json`, kontribusi yang
  dibutuhkan menunjuk backlog nyata di README, dan aturan kontennya menunjuk
  `AGENTS.md` alih-alih mengulang aturan domain repo rujukan.
- `GOVERNANCE.md`: gerbang rilis menjadi `bun run build + bun test`, pemicu ADR
  memuat penyajian dan `prerender = false`, dan peran "penutur asli bahasa
  daerah" dikembalikan ke repo situs yang memilikinya.
- `SUPPORT.md`: tabel jalur berhenti menjanjikan templat issue yang tidak ada
  (hanya **Laporan bug** yang ada), dan prioritasnya menjadi kelas cacat yang
  tidak menggagalkan build.
- `.github/ISSUE_TEMPLATE/config.yml` menunjuk repo ini, bukan URL repo rujukan
  — jalur pelaporan kerentanan sebelumnya mengarah ke advisories repo lain.
- `.github/PULL_REQUEST_TEMPLATE.md`: bagian verifikasi konten domain diganti
  daftar "yang tidak gagal sendiri", dan `bun run audit` dilepas dari DoD.
- `CHANGELOG.md` menyebut `bun run release`, bukan `npm run release`.
- Seluruh tautan relatif yang mati diperbaiki: rujukan ke ADR-0001…0013 ditulis
  sebagai nomor tanpa tautan, karena berkasnya memang tidak ada di sini.
- `docs/awcms-astro/` menyatakan mana gerbang standar yang **sudah** ada di repo
  ini dan mana yang belum, alih-alih menyebut semuanya seolah berjalan. Klaim
  "tanpa runtime server" juga dikoreksi — sejak ADR-0016 ada proses Bun yang
  menyajikan.

## Yang sengaja TIDAK diubah

Changeset lama. Isinya catatan keadaan pada saat itu, dan merapikannya berarti
menghapus jejak bahwa keadaannya pernah lain.
