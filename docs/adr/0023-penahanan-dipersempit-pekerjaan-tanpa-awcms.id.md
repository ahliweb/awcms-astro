🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)

<!-- i18n-source-hash: sha256:892a881186e582cfd88f7d8fa0c215b82d978b93867f8c955a1c218342d93a04 -->

# ADR-0023 — Penahanan ADR-0021 dipersempit: pekerjaan yang tidak membutuhkan `awcms` boleh mendarat

- **Status:** Accepted
- **Tanggal:** 3 Agustus 2026
- **Aturan pemilik:** 3 Agustus 2026 — "lanjut kerjakan dulu yang bisa dilakukan tanpa repo `ahliweb/awcms`."
- **Menyempurnakan:** [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) — penahanan tetap ada; ADR ini menyempitkan apa yang ditahannya.
- **Terkait:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (CSP yang membatasi asal gambar), [ADR-0022](0022-situs-menerbitkan-tenant-default-awcms.md)

## Konteks

ADR-0021 menahan pengembangan repo ini dengan alasan yang spesifik dan masih
benar: **fitur yang dibangun di atas kontrak `awcms` yang belum stabil harus
ditulis dua kali**, dan repo ini sudah membayarnya sekali (adapter konten
ditulis untuk daftar ringkasan, lalu ditulis ulang saat build feed mendarat —
ADR-0018).

Yang ADR-0021 asumsikan, dan tulis terus terang di §Konteks, adalah bahwa
**seluruh** sisa backlog menunggu `awcms`. Asumsi itu tidak bertahan satu hari:

- **Butir pertama §Titik lanjut membantahnya sendiri.** "Gambar artikel — tidak
  lagi diblokir `awcms`", dengan dua keputusan yang keduanya milik repo ini.
- **Cacat yang ditemukan 3 Agustus 2026 tidak menyentuh `awcms` sama sekali.**
  `docs/adr/README.md` mendaftarkan enam ADR yang tak pernah ada di repo ini dan
  melewatkan sembilan yang ada, sejak berkasnya mendarat. Tidak ada gerbang yang
  bisa menangkapnya, dan gerbang itu — pemeriksa tautan atas markdown — tidak
  punya satu pun ketergantungan pada `awcms`.

Menahan pekerjaan **karena** ia ada di repo ini adalah salah baca terhadap
alasan penahanannya. Yang mahal bukan "mengerjakan repo ini"; yang mahal adalah
menebak kontrak yang belum ada.

## Keputusan

**Pekerjaan yang tidak membutuhkan repo `ahliweb/awcms` boleh mendarat.**
Penahanan ADR-0021 tetap berlaku untuk segala sesuatu yang membutuhkannya.

Ujinya satu pertanyaan, dan sengaja dibuat bisa dijawab tanpa berdebat:

> **Apakah perubahan ini akan ditulis ulang bila `awcms` berubah?**

- **Tidak** → boleh mendarat. Contoh: gerbang atas berkas repo ini sendiri,
  gaya dan aksesibilitas, koreksi dokumen, jalur ilustrasi lokal
  (`src/assets/`), perkakas build yang tidak bicara ke jaringan.
- **Ya** → ditahan. Contoh: apa pun yang membentuk permintaan ke `awcms`,
  membaca bentuk responsnya, atau berdiri di atas endpoint yang belum ada —
  termasuk resolusi `featuredMediaId` lewat `/api/v1/media/objects`, dan BFF
  portal (ADR-0014) yang memanggil `awcms` di setiap permintaannya.

**Batas yang perlu dinyatakan supaya uji ini tidak melar:** "sudah ada
endpoint-nya" **bukan** jawaban "tidak". `GET /api/v1/media/objects` memang
sudah ada, tetapi kode yang memanggilnya adalah kode yang bentuknya ditentukan
respons `awcms` — dan repo template ini tidak punya instans `awcms` untuk
membuktikan panggilannya benar (CI-nya mengondisikan build atas
`vars.AWCMS_API_URL` justru karena itu). Menulisnya sekarang berarti menulis
integrasi yang tidak bisa dijalankan siapa pun sampai penahanan dicabut.

### Yang TIDAK berubah

- **Kriteria pencabutan penuh** ADR-0021 §Kapan penahanan ini dicabut, beserta
  kedua indikatornya. Per 3 Agustus 2026: kriteria 1 sudah nol, kriteria 2
  belum.
- **Seluruh gerbang** tetap berlaku: `bun run check`, `bun test`,
  `bun run audit:konten`, changeset bila perilakunya berubah, ADR bila
  keputusannya masuk daftar `docs/adr/README.md`.
- **Patch keamanan dan bump dependency** tetap boleh mendarat — ADR ini
  menambah kelas ketiga, bukan menggantikan dua yang ada.

## Konsekuensi

- **Positif:** backlog yang blokirnya ada di sini berhenti menunggu sesuatu yang
  tidak pernah memblokirnya. Gerbang yang seharusnya menangkap cacat 3 Agustus
  bisa dibangun sekarang, bukan berbulan-bulan kemudian saat cacat berikutnya
  dari kelas yang sama sudah mendarat.
- **Negatif / trade-off yang diterima:** ujinya butuh penilaian, dan penilaian
  bisa melar. Contoh yang disebut eksplisit di atas — "sudah ada endpoint-nya"
  bukan jawaban "tidak" — adalah tempat pelebaran itu paling mungkin terjadi,
  jadi ia ditulis sebagai batas, bukan diserahkan pada niat baik.
- **Netral:** ADR-0021 tidak di-supersede. Ia tetap keputusan yang berlaku;
  yang berubah adalah cakupannya.

## Alternatif yang dipertimbangkan

- **Cabut penahanan seluruhnya.** Ditolak: kriteria 2 ADR-0021 belum terpenuhi,
  dan alasan aslinya — kontrak yang belum keras ditulis dua kali — masih persis
  berlaku untuk gambar artikel dan BFF portal.
- **Perlakukan setiap butir sebagai pengecualian ad-hoc tanpa ADR.** Ditolak:
  penahanan yang dilonggarkan per-PR tanpa aturan tertulis berhenti menjadi
  penahanan setelah PR ketiga, dan tak seorang pun bisa menunjuk kapan itu
  terjadi.
- **Definisikan uji lewat daftar butir yang boleh, bukan lewat pertanyaan.**
  Ditolak: daftar semacam itu basi pada butir pertama yang tak terpikirkan saat
  menulisnya, dan repo ini sudah punya contoh dokumen yang basi tanpa ada yang
  merah.
