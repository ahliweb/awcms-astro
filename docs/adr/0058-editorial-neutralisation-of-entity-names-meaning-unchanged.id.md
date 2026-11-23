🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0058-editorial-neutralisation-of-entity-names-meaning-unchanged.md)

<!-- i18n-source-hash: sha256:dc2d4d661dce801c47db1af6d0ead40475b981597b32b70a03bb88970be76dbe -->

# ADR-0058 — Netralisasi editorial nama entitas; maknanya tidak berubah

- **Status:** Accepted
- **Tanggal:** 23 November 2026 (diusulkan dan diterima pada hari yang sama, atas keputusan pemilik)
- **Mengamandemen, hanya secara editorial:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.id.md), [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.id.md), [ADR-0017](0017-peran-admin-owner-internal.id.md), [ADR-0019](0019-csp-ketat-dikirim-penyaji.id.md), [ADR-0020](0020-layar-admin-kembali-ke-awcms.id.md), [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.id.md), [ADR-0027](0027-penahanan-adr-0021-selesai.id.md), [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.id.md), [ADR-0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.id.md), [ADR-0051](0051-a-knowledge-tree-points-at-the-code-and-owns-none-of-it.id.md), [ADR-0055](0055-reading-preferences-are-a-native-same-origin-panel-not-an-overlay-widget.id.md) dan [ADR-0056](0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.id.md). Tidak ada keputusan di dalamnya yang berubah.
- **Terkait:** [ADR-0039](0039-english-is-the-source-language.id.md) (aturan cerminan yang juga mengikat ADR ini)

**Hanya dokumen dan tata kelola.** ADR ini tidak menambah kode, rute, dependency, endpoint, basis data, atau perubahan gerbang. Ia mencatat bagaimana dua belas ADR yang diterima dibaca sekarang setelah repo ini tidak lagi menyebut pihak di luar keluarga AWCMS dalam prosanya.

## Konteks

Repo ini publik dan merupakan template. ADR-ADR awalnya ditulis ketika beberapa pihak konkret menjadi alasan tiap keputusan, dan ADR-ADR itu menyebut pihak-pihak tersebut: sebuah portal marketplace klien yang BFF-nya melatarbelakangi keputusan rendering campuran, repo produk konsumen saudara yang desainnya menjadi acuan atau tempat berdivergensi, dan sebuah produk control-plane sisi operator yang cakupannya disinggung sekilas dalam keputusan pemilik.

Template publik tidak seharusnya mengidentifikasi pihak-pihak itu. Dokumen hidupnya sudah dinetralkan; yang tersisa adalah ADR yang diterima, yang merupakan catatan keputusan dan tidak disunting sesuka hati.

Dua hal harus benar bersamaan. Catatan harus tetap menyatakan apa yang diputuskan, dan repo harus berhenti menyebut pihak yang tidak pantas ada di template publik. Menyunting penalaran sebuah ADR yang diterima demi yang kedua akan membahayakan yang pertama.

## Keputusan

### 1. Nama diganti kategori, dan tidak ada yang lain yang bergeser

Di mana pun sebuah ADR yang diterima menyebut salah satu pihak ini, bacaan yang dimaksud adalah **kategorinya**:

| Yang disebut ADR | Bacalah sebagai |
| --- | --- |
| sebuah portal marketplace klien | "portal marketplace" — portal dengan permukaan merchant, afiliasi, dan interaksi publik, dilayani lewat BFF |
| sebuah repo saudara yang menanam `awcms` dan menambah commerce | "repo produk konsumen" |
| sebuah produk control-plane sisi operator, beserta situsnya | "produk sisi operator" |
| sebuah situs berita klien atau instansi klien | "situs klien" |

Kategori itu membawa setiap fakta yang diandalkan keputusan: bahwa sebuah portal butuh sesi, bahwa sebuah repo konsumen melacak direktori ter-generate yang tidak dilacak repo ini, bahwa produk kendali host punya repo dan pelacaknya sendiri. Tak satu pun fakta itu bergantung pada nama pihaknya.

### 2. Apa yang disunting di ADR yang diterima, dan apa yang tidak

Penalaran, keputusan, opsi yang dipertimbangkan, dan konsekuensi setiap ADR yang diterima **tidak disentuh**. Satu-satunya suntingan pada berkas ADR yang diterima oleh perubahan ini adalah **target tautan**: direktori yang memuat blueprint portal diganti namanya menjadi `docs/awcms-astro/portal-bff/`, dan empat tautan di tiga pasang ADR akan menunjuk ke jalur yang sudah tidak ada, yang ditolak `bun run audit:dokumen`. Teks tautan dan prosa tidak diubah. Indeks ADR (`docs/adr/README.md` dan cerminannya) bukan ADR dan dinetralkan langsung.

Artinya sebagian ADR yang diterima masih membawa nama di isi atau judulnya. Itu disengaja dan merupakan sisa yang dijelaskan ADR ini: aturan membaca pada §1 adalah amandemennya, bukan suntingan.

### 3. Yang tidak terjangkau

- Riwayat git, pesan commit lampau, dan entri `CHANGELOG.md` historis tetap seperti ditulis; changelog adalah catatan apa yang dikatakan pada waktunya. Satu-satunya pengecualian adalah satu target tautan di `CHANGELOG.md`, diperbaiki untuk direktori yang diganti namanya agar tidak menjadi tautan mati.
- Isu, pull request, label, dan milestone GitHub berada di luar berkas repo dan tidak ditulis ulang di sini.
- Identifier yang menamai rute atau modul hulu adalah nama teknis milik `awcms`, bukan prosa, dan tidak diganti dari sini.

### 4. Mulai sekarang

ADR, dokumen, komentar, fixture, dan changeset baru menggambarkan pihak semacam itu dengan kategori sejak awal. Tidak ada gerbang yang ditambahkan; gerbang repo tidak bisa tahu nama mana yang sensitif, dan daftar nama di dalam sebuah gerbang justru akan menjadi kebocorannya.

## Konsekuensi

- Pembaca yang menemui sebuah nama di ADR yang diterima punya satu tempat yang menyatakan cara membacanya, dan pembaca yang tidak menemuinya tidak kehilangan apa pun.
- Direktori blueprint yang diganti namanya menjaga setiap tautan internal tetap berfungsi; pasangan cerminan tetap mutakhir (`bun run audit:translation`).
- Sisanya kecil, disebut per nomor di atas, dan hanya menyusut bila pemilik kelak memutuskan sebuah ADR yang diterima boleh ditulis ulang, yang tidak diputuskan ADR ini.
