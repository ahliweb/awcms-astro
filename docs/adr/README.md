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
| [0014](0014-rendering-campuran-dan-bff-portal.md) | Rendering campuran (static-by-default + rute on-demand) dan BFF portal Jualanku | Diterima |
| [0015](0015-runtime-bun-menutup-divergence-keluarga.md) | Runtime Bun, menutup divergence runtime dari keluarga AWCMS | Diterima |
| [0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) | Penyajian oleh Bun di belakang Traefik/Coolify; nginx dilepas | Diterima |
| [0017](0017-peran-admin-owner-internal.md) | Repo ini memikul halaman admin OWNER/INTERNAL | Digantikan [ADR-0020](0020-layar-admin-kembali-ke-awcms.md) |
| [0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) | Kontrak build terhadap `awcms`: tenant dari token mesin, traversal cursor, gerbang terjemahan | Diterima |
| [0019](0019-csp-ketat-dikirim-penyaji.md) | CSP ketat dikirim penyaji; skrip tidak lagi tinggal di dalam HTML | Diterima |
| [0020](0020-layar-admin-kembali-ke-awcms.md) | Layar admin kembali ke `awcms`; repo ini murni publik + BFF | Diterima |
| [0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) | Pengembangan repo ini ditahan sampai fondasi `awcms` selesai | Diterima |
| [0022](0022-situs-menerbitkan-tenant-default-awcms.md) | Situs ini menerbitkan tenant DEFAULT (owner) `awcms` | Diterima |

> **Kenapa penomoran mulai dari 0014.** ADR di repo ini melanjutkan urutan repo
> rujukan yang identitasnya dilepas di [#11](https://github.com/ahliweb/awcms-astro/pull/11);
> keputusan 0001–0013 milik repo itu, bukan repo ini.
>
> **Dan tabel ini pernah memuat enam keputusan yang tak satu pun ada di sini.**
> Berkas ini mendarat bersama ADR-0014/0015 (commit `52baf90`) dengan tabel repo
> rujukan masih di dalamnya, lalu sembilan ADR mendarat tanpa satu pun tercatat —
> `git log --diff-filter=A -- docs/adr/` menunjukkan keenam berkasnya tidak pernah
> ada, jadi setiap tautannya mati sejak hari pertama. Satu barisnya, "Satu bahasa,
> tanpa mesin i18n", bahkan **membantah kode di sini**: repo ini menyajikan dua
> locale lewat katalog PO. Indeks yang salah lebih buruk daripada tidak ada
> indeks, karena ia dibaca sebagai daftar keputusan yang berlaku.
>
> Tidak ada gerbang yang memeriksa tabel ini — `bun run audit:konten` memeriksa
> tautan pada **keluaran build**, dan berkas markdown tidak ikut dibangun.
> Menambah gerbangnya ditahan [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md);
> ia layak jadi butir pertama saat penahanan dicabut.
