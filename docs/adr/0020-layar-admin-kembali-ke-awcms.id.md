🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0020-layar-admin-kembali-ke-awcms.md)

<!-- i18n-source-hash: sha256:2159cb80be927aa900b9aaeaaad1b6e8f8ccb6854ffcf08316ea985e5c0eab71 -->

# ADR-0020 — Layar admin owner/internal kembali ke `awcms`; repo ini kembali murni publik + BFF

- **Status:** Accepted
- **Dipersempit:** [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
  (8 Agustus 2026) — kalimat "**Repo ini tidak memikul layar admin**" di
  §Keputusan berlaku untuk layar admin **SISTEM**. Sebuah situs boleh membawa
  permukaan admin **USER** bila ia menyatakannya lewat `permukaanAdmin`, dengan
  `owner` ditolak gerbang. ADR ini **tidak** di-supersede: alasan intinya —
  memindahkan layar tidak pernah menjadi kontrol keamanan — tidak dibantah, dan
  tidak satu pun gerbangnya dilonggarkan. `awcms` menjawab dari sisinya dengan
  [ADR-0070](https://github.com/ahliweb/awcms/blob/main/docs/adr/0070-peran-keluarga-awcms-astro-memikul-publik-dan-admin-user.md),
  yang mempersempit ADR-0051 di sana dengan cara yang sama. Kalimat di bawah
  **tidak ditulis ulang**; ia benar pada 2 Agustus 2026, dan menyuntingnya akan
  memalsukan rekaman.
- **Tanggal:** 2 Agustus 2026
- **Men-supersede:** [ADR-0017](0017-peran-admin-owner-internal.md) (repo ini memikul halaman admin owner/internal)
- **Pasangan di `awcms`:** [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md) — keputusan yang sama, diambil di repo yang memiliki datanya, men-supersede `awcms` ADR-0048
- **Terkait:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (rendering campuran + BFF Jualanku — **tidak berubah**), `awcms` [ADR-0045](https://github.com/ahliweb/awcms/blob/main/docs/adr/0045-jualanku-porting-awcms-system-of-record-astro-bff.md) (peran repo ini sebagai experience layer + BFF), `awcms` [ADR-0049](https://github.com/ahliweb/awcms/blob/main/docs/adr/0049-machine-credentials-and-session-introspection.md)/[ADR-0050](https://github.com/ahliweb/awcms/blob/main/docs/adr/0050-bff-session-handoff-code.md)

## Konteks

ADR-0017 memberi repo ini peran kedua: **halaman admin owner/internal**. Ia adalah
sisi lokal dari `awcms` ADR-0048, dan ditulis jujur — termasuk pengakuan bahwa layar
pertamanya belum bisa dibangun karena dua kontrak di `awcms` belum ada.

Sejak itu dua hal terjadi di `awcms`, dan keduanya bergerak berlawanan arah dengan
ADR-0017.

**Pertama, penghalangnya hilang.** Kedua kontrak yang ADR-0017 sebut sebagai blocker
mendarat di `awcms` pada 1 Agustus 2026: kredensial mesin baca-saja (ADR-0049) dan handoff sesi
BFF (ADR-0050). Jadi jalur ADR-0017 terbuka.

**Kedua, dan justru karena itu, `awcms` menutup jalur itu secara sadar.**
ADR-0051 men-supersede ADR-0048 dan memutuskan **seluruh layar admin — tenant maupun
owner/internal/platform — dibangun di `awcms`**, di bawah satu shell `/admin/*`.
Alasannya ada tiga, dan ketiganya menyangkut repo ini:

1. **Aturan lama tidak pernah diikuti kode yang sudah ada.** `/admin/*` di `awcms`
   sudah bercampur tenant dan platform sejak sebelum ADR-0048; aturan itu karena
   itu hanya mengikat layar **baru**, menciptakan dua kelas layar yang dibedakan
   oleh tanggal lahirnya, bukan oleh sifatnya.
2. **Biayanya adalah modul tanpa layar sama sekali.** Audit permukaan admin
   `awcms` (1 Agustus 2026) menemukan **13 dari 21 modul tanpa satu pun layar** —
   125 berkas route yang hanya bisa dipakai lewat `curl`. Sebagian menunggu repo
   ini, yang belum punya satu pun layar admin.
3. **Memindahkan layar tidak pernah menjadi kontrol keamanan.** Ini butir yang
   membatalkan premis ADR-0017, bukan sekadar melemahkannya. ADR-0017 §Keputusan
   butir 2 sudah menuliskannya sendiri — "izin tidak pindah bersama layar" — tanpa
   menarik kesimpulannya: kalau izin tidak pindah, **risikonya juga tidak pindah**.
   `awcms` membuktikannya dengan kasus nyata: permission aktivasi dataset wilayah
   di-seed ke role `owner` SETIAP tenant, sehingga owner tenant biasa memegang izin
   mengganti data yang dilayani ke seluruh tenant — persis risiko yang pemisahan
   repo itu klaim cegah. Yang menahannya adalah gerbang otorisasi, bukan alamat
   repo tempat tombolnya digambar.

Keputusan itu sudah dijalankan, bukan sekadar ditulis: sembilan PR layar admin
mendarat di `awcms` pada 1–2 Agustus 2026 (`/admin/audit-trail`,
`/admin/form-drafts`, `/admin/site-search`, `/admin/theming`, `/admin/seo`,
`/admin/data-lifecycle`, dan lainnya).

## Keputusan

**Repo ini tidak memikul layar admin.** ADR-0017 di-supersede.

Perannya kembali persis ke `awcms` ADR-0045, yang tidak pernah berubah:
**experience layer + satu-satunya BFF** untuk permukaan publik dan Jualanku. Yang
dicabut hanya perannya sebagai rumah layar admin internal.

| Repo          | Peran frontend                                | Audiens                          |
| ------------- | --------------------------------------------- | -------------------------------- |
| `awcms`       | frontend publik + **SELURUH** admin           | pengunjung, admin tenant, operator platform |
| `awcms-astro` | situs publik statis + experience layer/BFF    | pembaca anonim, pengguna Jualanku |

Yang **tetap berlaku** dan tidak boleh ikut terhapus bersama ADR-0017:

- **ADR-0014 tidak berubah.** Rute on-demand + BFF portal Jualanku (`/penjual/**`,
  `/affiliate/**`, `/_portal-api/**`) adalah peran ADR-0045, bukan peran admin.
  Prasyaratnya tetap di [`04-kesiapan.md`](../awcms-astro/jualanku/04-kesiapan.md).
- **Empat aturan ADR-0017 tetap mengikat permukaan BFF Jualanku**, karena
  keempatnya menyangkut permukaan terautentikasi apa pun: `awcms` tetap system of
  record; izin diputuskan `awcms` dan permukaan di sini bukan jalur kedua yang
  lebih longgar; tidak ada cache bersama antara permukaan publik dan
  terautentikasi; dan setiap penambahan dinilai sebagai permukaan keamanan.
  Keempatnya dipindahkan ke `AGENTS.md` §Peran repo ini agar tidak hilang bersama
  ADR yang di-supersede.
- **Kredensial mesin ADR-0049 tetap terpakai**, untuk hal yang memang dipakainya di
  sini: token build yang menarik konten (ADR-0018). Itu tidak pernah bergantung
  pada peran admin.

## Konsekuensi

- **Repo ini kembali ke kelas "publik".** ADR-0017 §Konsekuensi mencatat sebagai
  biaya bahwa repo ini "berhenti menjadi hanya situs statis"; biaya itu dibatalkan.
  Premis `output: 'static'` beserta seluruh ADR yang bersandar padanya kembali utuh
  — dengan satu pengecualian yang sudah ada sebelumnya dan tetap ada: rute
  on-demand Jualanku ADR-0014.
- **Tidak ada kode yang perlu dihapus.** Layar admin di sini tidak pernah ada;
  ADR-0017 sendiri menyatakan layar pertamanya diblokir. Yang berubah hanya
  dokumen — dan itu justru alasan ADR ini perlu ditulis sekarang: kontrak kerja
  yang menyuruh agen membangun layar admin di sini akan diikuti oleh agen
  berikutnya, dan pekerjaannya akan mendarat di repo yang salah.
- **Layar platform yang dulu direncanakan di sini dikerjakan di `awcms`**, tunduk
  pada gerbang platform-scoped yang ADR-0051 §Keputusan wajibkan. Itu gerbang yang
  tidak pernah bisa disediakan repo ini, karena katalog permission tinggal di
  `awcms`.
- **Postur CSP kedua repo tetap sebanding**, dan sekarang bisa dibandingkan
  langsung karena keduanya publik-plus-terautentikasi di sisi masing-masing. Lihat
  [ADR-0019](0019-csp-ketat-dikirim-penyaji.md); kebijakan repo ini lebih ketat
  pada `script-src` karena tidak ada satu pun skrip inline yang perlu di-hash.
- **Pembekuan `awcms-mini`/`awcms-micro` tidak tersentuh.** Ia keputusan `awcms`
  ADR-0047, dan ADR-0051 tidak mengubahnya.
