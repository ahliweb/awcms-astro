---
tipe: dokumen
dampak: internal
---

# Keluarga dinyatakan dua repo, dan permintaan terbuka ADR-0034 akhirnya dijawab

[ADR-0034](../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
§Hubungan ditutup dengan satu kalimat yang menunggu jawaban dari repo lain:
selisih dengan `awcms` ADR-0051 ("seluruh layar admin … dibangun di repo
`awcms`") pantas dicatat sebagai divergence keluarga di sana, **"repo ini tidak
bisa menulisnya sendiri"**.

`awcms` menjawabnya pada 8 Agustus 2026 dengan **ADR-0070**, yang
**MEMPERSEMPIT** ADR-0051 alih-alih men-supersede-nya. Changeset ini menyusulkan
akibatnya ke dokumen repo ini — dan sekalian membereskan tiga kalimat yang sudah
salah sejak `awcms` ADR-0055 mendarat 2 Agustus 2026 tanpa pernah disusul di
sini.

- **Keluarga dinyatakan dua repo, dan pasangan keduanya adalah pengganti
  multiguna ketiga template lama** — bukan salah satunya sendirian. Tabel peran
  di `README.md` dan `docs/awcms-astro/README.md` kini menyatakan pembagiannya
  menurut **apa yang dikelola**, bukan menurut audiens: admin SISTEM di `awcms`,
  permukaan admin USER boleh di sini bila situsnya menyatakannya.
- **`awcms-mini` dan `awcms-micro` berhenti disebut "dibekukan" dan menjadi
  ARSIP.** Selisihnya bukan kata: pembekuan 31 Juli membolehkan port KELUAR dan
  menyatakan dirinya sementara; ADR-0055 menutup jalur itu dan tidak menjanjikan
  pencabutan.
- **[ADR-0034](../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
  §Hubungan berhenti berbunyi "belum".** Ia sekarang menyebut
  ADR-0070 beserta entri `admin-user-surface-in-awcms-astro` ber-`reviewDate`
  2027-02-04 — dan menuliskan apa yang ditinjau pada tanggal itu: **bukan**
  apakah admin USER boleh di sini, melainkan apakah **batasnya** masih di tempat
  yang sama.
- **Tabel §Konteks keluarga di `standar-performa-dan-keamanan.md` mendapat baris
  ADR-0070**, sejajar dengan baris ADR-0068 dan ADR-0069 yang sudah ada.

Yang hanya terasa saat mengembangkan:

- **`AGENTS.md` §"Di mana pekerjaan boleh mendarat" memuat tiga klaim yang sudah
  tidak benar**, dan ketiganya ditulis ulang sebagai kutipan-yang-dicabut
  alih-alih dihapus diam-diam: (1) "di-port keluar boleh"; (2) "pembekuan ini
  **sementara**"; (3) "`awcms/AGENTS.md` mensyaratkan fitur fondasi diuji dulu di
  `awcms-mini`" — aturan mini-first itu **dicabut**, bukan ditangguhkan. Yang
  ketiga paling mahal: ia membuat pembaca di sini mengira ada hulu yang menunggu.
- Judul seksi itu berubah dari "berlaku 31 Juli 2026" menjadi "berlaku 2 Agustus
  2026", jadi tautan berjangkar dari `README.md` ikut diperbarui.
- **Nol perubahan kode.** Tidak ada permukaan admin yang mendarat, tidak ada
  gerbang yang berubah, dan `permukaanAdmin` tetap kosong di template. Yang
  berubah adalah dokumen yang menyatakan siapa memikul apa.

Sisi `awcms` mendapat perubahan pasangannya di PR tersendiri: ADR-0070, entri
manifest, dan pembersihan sisa mini/micro di sana.
