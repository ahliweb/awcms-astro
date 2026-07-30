# Architecture Decision Records — `awcms-astro`

Satu keputusan arsitektural = satu berkas `NNNN-judul-kebab.md`. ADR tidak pernah
dihapus; keputusan yang diganti ditandai `Status: Superseded by ADR-XXXX` dan ADR
penggantinya merujuk balik. Status yang sah: `Proposed`, `Accepted`, `Deprecated`,
`Superseded`.

Perubahan pada standar yang mengikat (lihat [`GOVERNANCE.md`](../../GOVERNANCE.md)
dan [`AGENTS.md`](../../AGENTS.md)) **wajib** lewat ADR — termasuk, secara
eksplisit, perpindahan dari `output: 'static'`.

## Catatan penting tentang penomoran

Dokumen di repo ini merujuk ADR-0003, ADR-0004, ADR-0008, ADR-0009, ADR-0012, dan
ADR-0013 (mis. [`docs/awcms-astro/README.md`](../awcms-astro/README.md),
[`standar-teknis.md`](../awcms-astro/standar-teknis.md),
[`GOVERNANCE.md`](../../GOVERNANCE.md)). **Berkas-berkas itu tidak pernah ikut
dibawa** saat standar ini diekstraksi dari repo rujukan
`web-lalulintasmelayani.com`, sehingga tautannya menggantung.

Konsekuensinya untuk penomoran baru: nomor **0001–0013 dianggap terpakai** oleh
keputusan warisan itu, dan ADR baru di repo ini dimulai dari **0014**. Menulis
ulang keputusan warisan (atau memindahkan berkasnya ke sini) adalah pekerjaan
tersendiri; jangan diam-diam memakai ulang nomornya, karena tautan yang sudah ada
akan menunjuk dokumen yang salah.

## Indeks

| ADR                                                        | Judul                                                                          | Status   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| [0014](0014-rendering-campuran-dan-bff-portal.md)          | Rendering campuran (static-by-default + rute on-demand) dan BFF portal Jualanku | Accepted (butir 3 diganti ADR-0015) |
| [0015](0015-runtime-bun-menutup-divergence-keluarga.md)    | Runtime Bun: menutup divergence runtime dari keluarga AWCMS                     | Accepted (§7 diamandemen ADR-0016) |
| [0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) | Penyajian oleh Bun di belakang Traefik/Coolify; nginx dilepas dari stack     | Accepted |
| [0017](0017-peran-admin-owner-internal.md)                  | Repo ini memikul halaman admin owner/internal, di samping situs publiknya      | Accepted |
