🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](README.md)

<!-- i18n-source-hash: sha256:6d60b7382b515b1da36f33f08796be6ebdf53f6d4a30874ef7bf6e5b5b9a1226 -->

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
| [0020](0020-layar-admin-kembali-ke-awcms.md) | Layar admin kembali ke `awcms`; repo ini murni publik + BFF — **dipersempit** [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) menjadi layar admin SISTEM saja | Diterima |
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
| [0035](0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md) | Feed Atom per seksi berita, dan gerbang atas SETIAP `.xml` di keluaran | Diterima |
| [0036](0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md) | `/news/` adalah kosakata URL repo ini dan `/blog/` kosakata `awcms`; bentuknya sebuah tab bernama `news` ber-`urutanSeksi: "terbaru"`, bukan keluarga rute baru | Diterima |
| [0037](0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md) | Pin TypeScript 6.x adalah syarat hidupnya gerbang `astro check`; menaikkannya keputusan tingkat keluarga, dan gerbangnya mendarat bersamanya | Diterima |
| [0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.md) | Satuan sebuah kebutuhan backend adalah MODUL di `awcms`; repo ini membaca dan tidak menulis, dan keempat batasnya digerbangi | Diterima |
| [0039](0039-english-is-the-source-language.md) | Inggris adalah bahasa sumber di jalur telanjang, Indonesia cerminnya di `<nama>.id.md`; buku besar yang hanya boleh menyusut, dan tiga gerbang yang bergerak lebih dulu | Diterima |
| [0040](0040-changeset-menyatakan-bump-semver.md) | Sebuah changeset menyatakan `bump`-nya sendiri, dan rilis menurunkan `vX.Y.Z` dari yang terbesar di antara yang menunggu; penguraian ketat mengakhiri tag yang berbunyi `v0.2.NaN` | Diterima |
| [0041](0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md) | Locale default tetap memegang AKAR — prefiks `awcms` ADR-0098 tidak diadopsi, karena build statis tidak punya apa pun yang bisa dikelirukan cache bersama; yang DISERAP adalah penolakannya atas `Vary: Cookie` dan `Vary: Accept-Language`, dan `/blog/**` akhirnya mendapat pemeriksa yang tak pernah dimiliki ADR-0036 | Diterima |
| [0042](0042-a-byline-is-the-first-per-person-data-this-template-publishes.md) | Byline dirender pada ketiga permukaan yang menyebut penulis, yang tidak ada tetap tidak ada alih-alih jatuh ke nama penerbit, simpul `Person` membawa nama dan tidak lebih, dan properti "nol data per-orang" yang dinyatakan tiga dokumen dipensiunkan demi kewajiban di baliknya | Diterima |
| [0043](0043-the-readers-browser-calls-awcms-and-nothing-else-changes.md) | Peramban pembaca memanggil pencarian `awcms` langsung — tanpa header, tanpa kredensial, tenant dari `Origin`; snippet tidak pernah menjadi HTML dan tidak ada markup yang dirakit di JavaScript; nilai facet tanpa label yang bisa dibaca tidak merender chip; `connect-src` menempuh jalan yang sama dengan `img-src` | Diterima |
| [0044](0044-what-a-page-view-may-cost-a-reader.md) | Sebuah situs boleh memanggil beacon pengunjung hanya bila ia menyatakannya, dan selalu TANPA kredensial — sehingga cookie `awcms_visitor_key` tidak pernah tersimpan, "tanpa analitik yang mengikat identitas" selamat kata demi kata, dan tidak ada yang perlu diberi banner persetujuan | Diterima |
| [0045](0045-a-section-comes-from-the-cms-vocabulary-not-from-a-sidecar-only-we-write.md) | Seksi sebuah artikel diselesaikan dari taksonomi tenant, dengan `contentJson.awcmsAstro` dipertahankan sebagai penimpa eksplisit — karena sidecar itu ditulis SATU CLI migrasi dan bukan oleh jalur authoring mana pun, sehingga setiap artikel yang ditulis editor di awcms terbuang dari build tanpa satu pun kegagalan | Diterima |
| [0046](0046-a-video-embed-is-refused-here-and-that-is-a-divergence-not-an-omission.md) | Embed video ditolak di sini pada setiap deployment tanpa saklar — `awcms` ADR-0110 memberi operatornya sebuah origin `frame-src`, sementara operator template ini adalah organisasi pemilik domain, dan perbedaan yang tak dicatat terbaca sebagai satu sisi yang belum sempat mengerjakannya | Diterima |

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
> **Dan tuntutan yang sama berlaku atas BERKAS INI**, cermin Indonesia indeks
> itu, sejak [ADR-0039](0039-english-is-the-source-language.md). Hash terjemahan
> menjaga sebuah cermin tetap SEUSIA sumbernya; ia tidak menjaganya tetap BENAR
> terhadap isi direktori ini — jadi cermin yang tertinggal satu keputusan akan
> lolos dengan hash yang cocok. Karena alasan yang sama kolom Status menerima
> kedua bahasa: pertanyaannya apakah tabel setuju dengan berkas ADR-nya, bukan
> tabel ini berbahasa apa.
>
> Sebelumnya tidak ada yang memeriksanya: `bun run audit:konten` membaca tautan
> pada **keluaran build**, dan markdown tidak ikut dibangun. Gerbangnya sempat
> ditahan [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md), lalu
> mendarat begitu [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)
> menyempitkan penahanan itu ke pekerjaan yang benar-benar membutuhkan `awcms`.
