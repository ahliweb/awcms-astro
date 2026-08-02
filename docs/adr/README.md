# Architecture Decision Records

Catatan keputusan beserta alasannya. Ditulis supaya usulan yang sama tidak
muncul lagi enam bulan kemudian tanpa ada yang ingat kenapa ia ditolak dulu.

Sebuah perubahan butuh ADR bila ia:

- mengubah bentuk keluaran (statis ↔ server, struktur route);
- mengubah postur keamanan (CSP, header, origin yang diizinkan);
- menambah dependency runtime atau layanan pihak ketiga;
- mengubah dari mana konten atau aset berasal;
- membalik salah satu keputusan di bawah.

Yang **tidak** butuh ADR: menyunting salinan halaman, menambah seksi,
menyesuaikan gaya, menambah tes.

| # | Keputusan | Status |
| --- | --- | --- |
| [0001](0001-statis-di-atas-awcms-astro.md) | Statis di atas template `awcms-astro`, bukan WordPress | Diterima |
| [0002](0002-tanpa-mesin-i18n.md) | Satu bahasa, tanpa mesin i18n | Diterima |
| [0003](0003-konten-verbatim-di-satu-berkas.md) | Konten verbatim di satu berkas data | Diterima |
| [0004](0004-aset-di-r2-bukan-astro-assets.md) | Aset di Cloudflare R2, bukan `astro:assets` | Diterima |
| [0005](0005-mode-konstruksi-variabel-build.md) | Mode konstruksi sebagai variabel build | Diterima |
| [0006](0006-animasi-dekoratif-dengan-keadaan-diam.md) | Animasi dekoratif dengan keadaan diam yang lengkap | Diterima |
