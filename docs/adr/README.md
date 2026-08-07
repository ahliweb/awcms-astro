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
| [0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) | Pengembangan repo ini ditahan sampai fondasi `awcms` selesai | Digantikan [ADR-0027](0027-penahanan-adr-0021-selesai.md) |
| [0022](0022-situs-menerbitkan-tenant-default-awcms.md) | Situs ini menerbitkan tenant DEFAULT (owner) `awcms` | Diterima |
| [0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) | Penahanan ADR-0021 dipersempit: pekerjaan yang tidak membutuhkan `awcms` boleh mendarat | Diterima |
| [0024](0024-seni-lokal-di-src-assets.md) | Seni lokal di `src/assets/`, di-resolve `import.meta.glob` sebagai URL | Diterima |
| [0025](0025-gambar-artikel-dari-media-awcms.md) | Gambar artikel dari media `awcms`: resolusi sekali per build, `img-src` yang ditanyakan | Diterima |
| [0026](0026-kartu-share-per-artikel-dari-media-awcms.md) | Kartu share per artikel dari media `awcms`, dengan metadata yang ikut berpindah | Diterima |
| [0027](0027-penahanan-adr-0021-selesai.md) | Penahanan ADR-0021 selesai: kedua indikatornya terpenuhi | Diterima |
| [0028](0028-jangkar-standar-performa-dan-keamanan.md) | Postur performa dan keamanan diikat ke standar yang disebut namanya (OWASP, ISO 27001, SSDF, Core Web Vitals) | Diterima |
| [0029](0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md) | HSTS dikirim penyaji, digerbangi produksi, tanpa `includeSubDomains` | Diterima |
| [0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) | Empat aturan yang sudah tertulis mendapat pemeriksanya; rantai pasok dipin ke SHA dan digest | Diterima |
| [0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) | SBOM CycloneDX diturunkan dari `bun.lock` pada setiap rilis, deterministik dan tanpa dependency baru | Diterima |
| [0032](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) | Dua celah terakhir ADR-0028 ditutup: CodeQL dengan cakupan dihitung-dinyatakan, dan CWV lab terkondisi sumber konten | Diterima |
| [0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md) | Seksi berita: urutan dari `publishedAt`, predikat terbit `awcms` ditiru, dan `datePublished`/`dateModified` berhenti dilipat menjadi satu | Diterima |
| [0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) | Publik sebagai fungsi utama; admin USER hanya bila dinyatakan, admin utama (`owner`) tidak pernah | Diterima |

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
> **Tabel ini kini DIJAGA.** `bun run audit:dokumen` menuntutnya lengkap dua
> arah — tiap ADR di direktori ini tercatat, tiap baris menunjuk berkas yang
> ada — dan menuntut kolom Status setuju dengan `- **Status:**` di berkasnya.
> Ia berjalan di job `check` CI, tanpa build dan tanpa jaringan.
>
> Sebelumnya tidak ada yang memeriksanya: `bun run audit:konten` membaca tautan
> pada **keluaran build**, dan markdown tidak ikut dibangun. Gerbangnya sempat
> ditahan [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md), lalu
> mendarat begitu [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)
> menyempitkan penahanan itu ke pekerjaan yang benar-benar membutuhkan `awcms`.
