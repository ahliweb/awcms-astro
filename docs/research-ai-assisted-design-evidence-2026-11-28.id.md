🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](research-ai-assisted-design-evidence-2026-11-28.md)

<!-- i18n-source-hash: sha256:7fb2b2ca305efc70425fa41f813b23daeb5a98daf2eba1fb6a7ed61fcf33d8ad -->

# Bukti desain dan spesifikasi berbantuan AI — permukaan publik dan admin USER

## Kendali dokumen

- **Versi:** v0.2.0
- **Tanggal:** 2026-11-28
- **Status:** Hanya usulan riset. Bukan perubahan normatif, bukan implementasi, bukan keputusan gerbang. Setiap butir desain, kontrol, ID sementara, dan pemetaan proyek di bawah ini adalah **usulan**.
- **Isu pemilik:** [#210](https://github.com/ahliweb/awcms-astro/issues/210) (tetap terbuka).
- **Snapshot bukti:** `AGENTS.md` di `main` adalah blob git `3debbf7ad824` dan kepala `main` adalah `3a693d5` saat catatan ini diambil alih (2026-11-28). Awalan blob bukan SHA commit; kunci SHA sebenarnya sebelum pilot apa pun.
- **Asal-usul:** disusun sesi AI lain sebagai pull request draf; diambil alih, dikoreksi, dan diperiksa rujukannya pada 2026-11-28 oleh sesi AI terorkestrasi atas pilihan pemilik. Pengambilalihan bukan persetujuan merge.
- **Document Changeset:** Revisi pengambilalihan: nama dan klaim vendor dihapus, klaim rujukan dikoreksi atau ditandai belum terverifikasi, kalimat uji spike dihapus, bagian GitHub Projects tetap sebagai usulan.

## Metode riset dan bukti

Tinjauan cepat atas sumber publik primer. Ini bukan tinjauan sistematis dan bukan uji produk. Riset ini dipicu uraian publik produk komersial perencanaan dan desain berbantuan AI; ia hanya memakai konsep fungsional umum dan standar terbuka. Uraian fitur vendor adalah klaim, bukan bukti efektivitas, dan tidak dikutip di sini.

| Sumber | Pemakaian dalam catatan ini | Status saat pengambilalihan |
| --- | --- | --- |
| Cui dkk., eksperimen lapangan ([halaman penerbit](https://doi.org/10.1287/mnsc.2025.00535)) | Bukti lapangan tentang tugas selesai | **Belum terverifikasi saat pengambilalihan.** Halaman penerbit menolak akses; tahun, jumlah peserta, dan besar efek tidak diperiksa dan tidak ditulis di sini |
| [METR 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | Studi acak dengan 16 developer berpengalaman atas 246 isu; developer memakan waktu 19% lebih lama | Diperiksa. Halaman itu sendiri menandai hasilnya tidak lagi mutakhir |
| [Pembaruan METR, 2026-02-24](https://metr.org/blog/2026-02-24-uplift-update/) | Perubahan desain studi dan efek seleksi | Diperiksa. "Jangan menggabungkan atau menjanjikan penghematan" adalah simpulan catatan ini, bukan kutipan |
| [Perry dkk.](https://arxiv.org/abs/2211.03622) | Peserta dengan asisten AI lebih cenderung percaya kodenya aman | Diperiksa (parafrasa temuan) |
| [ISO 12207](https://www.iso.org/standard/90219.html) | Proses siklus hidup perangkat lunak | **Belum terverifikasi saat pengambilalihan.** Halaman katalog menolak akses; nomor, judul, dan tahun edisi tidak diperiksa, dan tidak ada tahun yang ditulis |
| [ISO 9241-210](https://www.iso.org/standard/77520.html) | Desain berpusat pada manusia untuk sistem interaktif | **Belum terverifikasi saat pengambilalihan.** Halaman katalog mengembalikan 403; tahun edisi tidak ditulis |
| [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/format/) | Format pertukaran token desain | Diperiksa. Final Community Group Report bertanggal 28 Okt 2025, bukan Rekomendasi W3C |
| [Deskripsi format DESIGN.md terbitan vendor](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/) | Rujukan interoperabilitas saja, bukan alat wajib | Diperiksa: bertanggal 21 Apr 2026; yang dibaca adalah draf spesifikasi |
| [NIST SSDF](https://csrc.nist.gov/projects/ssdf/publications) | Kerangka pengembangan aman | Diperiksa: v1.1 final (2022); v1.2 adalah draf publik awal rilis 2025-12-17 |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Lantai aksesibilitas | Diperiksa: Rekomendasi W3C, 12 Desember 2024 |
| [UU PDP Indonesia](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) | Konteks data pribadi, bila berlaku | Diperiksa sebagian: halaman berisi metadata, abstrak, dan putusan pengadilan; teks pasal **belum terverifikasi saat pengambilalihan** |
| [UU Hak Cipta Indonesia](https://peraturan.bpk.go.id/Details/38690/uu-no-28-tahun-2014) | Konteks hak cipta, bila berlaku | Diperiksa: UU 28/2014 tentang Hak Cipta, berstatus berlaku; teks pasal tidak dibaca |

Hasil antarstudi berbeda; jangan digabungkan dan jangan menjanjikan penghematan.

## Batas dan validasi yang diusulkan

Situs publik Astro statis; permukaan admin USER mengikuti kontrak yang dideklarasikan ([ADR-0034](adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.id.md)). Tidak ada permukaan terautentikasi yang diklaim sudah terimplementasi. Diverifikasi terhadap `main` saat pengambilalihan: `AGENTS.md` menyatakan template ini mendeklarasikan nol permukaan terautentikasi, dan admin USER serta BFF portal belum ada kodenya.

- Inventarisasi token, komponen, dan gerbang aksesibilitas yang sudah ada.
- Satu irisan publik sintetis dengan perilaku responsif dan keyboard/fokus. Bila permukaan pengguna terautentikasi diusulkan, ikat mock-nya ke kontrak yang ada dan izin backend, dan dokumentasikan N/A untuk layar yang tidak ada.
- SSG tetap statis; tidak ada admin SYSTEM generik dan tidak ada SSR tanpa ADR.

## Kontrak bukti (usulan)

- Langkah 2 dan 4: kebutuhan dan kriteria penerimaan, ID layar, konteks tinjauan, dan prototipe sintetis.
- Langkah 5–8: data, izin, dan operasi yang eksplisit; mock yang dihasilkan dari kontrak bila berlaku.
- Gerbang 9: deteksi tautan yang hilang atau bertentangan; koreksi kembali ke spesifikasi asalnya.
- Langkah 11: uji per irisan hanya setelah persetujuan yang berlaku.
- Langkah 12: baseline visual deterministik ditambah pemeriksaan WCAG 2.2 manual dan otomatis; otomasi saja tidak membuktikan aksesibilitas.
- Catat butir teramati, disetujui, disimpulkan, tidak diketahui, dan diusulkan secara terpisah, dan kunci SHA sumber sebenarnya sebelum pilot. Bila UI tidak ada, tandai N/A. Pakai artefak kanonis yang ada; jangan menduplikasinya.
- Ukur waktu termasuk tinjauan dan pengerjaan ulang, lolosnya cacat, keberhasilan tugas, dan biaya terhadap baseline yang sepadan.
- Tanpa uji, UAT, atau CI rekaan.

## Keamanan dan lisensi

Adopsi mandiri berbasis konsep saja. Tidak menyalin aset atau sumber berhak milik, tidak ada kode, aset, API, teks, atau aturan produk pihak ketiga, dan tidak ada rekayasa balik atasnya. Tidak ada data rahasia ke penyedia yang tidak disetujui; pakai fixture sintetis, hak akses minimum, redaksi, dan tinjauan lisensi. Tidak ada sertifikasi kepatuhan atau hasil kinerja yang diklaim.

## Keputusan berikutnya

Isu #210 memegang inspeksi lebih dalam (ADR, dokumen, kode sebenarnya, CI, dan tumpang-tindih), usulan terbatas, dan keputusan peninjau. Catatan ini tidak mengizinkan implementasi, dependensi, rilis, atau persetujuan gerbang.

## GitHub Projects — koordinasi siklus hidup (usulan, 2026-11-28)

Arahan yang tercatat dalam draf: koordinasikan langkah siklus hidup yang berlaku lewat GitHub Projects (v2), terintegrasi dengan manajemen proyek yang ada, bukan menambah papan kedua atau menggantikan otoritas repositori. Pekerjaan yang ada: #210. Hulu publik dan admin USER; SSG, tanpa permukaan terautentikasi atau UAT fiktif; catat keberlakuan. Bagian ini usulan; keanggotaan proyek tidak diperiksa dan tidak diubah.

- Langkah 1–8: lacak keluaran riset dan spesifikasi, ketergantungan, peninjau, kriteria penerimaan, dan URL bukti; tidak ada isu implementasi sebelum Gerbang 9 yang berlaku. Langkah 9: pelacak gerbang merujuk keputusan yang tercatat dan tidak pernah disimpulkan dari tahap papan.
- Langkah 10–12: satu isu kanonis per unit S/M, relasi induk/sub-isu dan diblokir-oleh bawaan bila didukung, milestone, prioritas, dan assignee dipertahankan; PR merujuk isu dan bukti CI. Langkah 13–15: lacak staging/UAT hanya bila berlaku, bukti kesiapan rilis, dan keputusan. Langkah 16–18: deployment, validasi, pemantauan, dan tindak lanjut dengan bukti rilis atau insiden.
- Pakai ulang proyek yang disetujui dan kolom yang ada (misalnya Tahap, Pelaksana, Prioritas, Mulai, Target). Pemetaan status yang diusulkan: Rencana = backlog, Siap = definisi siap yang berlaku, Berjalan = diklaim, Menunggu = ketergantungan, tinjauan, atau persetujuan, Selesai = hasil terverifikasi, Batal = dibatalkan dengan alasan. Langkah siklus hidup adalah kolom terpisah atau metadata isu yang ada, tidak pernah disimpulkan dari tahap. Penolakan gerbang tetap tercatat walau pelacak ditutup. PR ditutup tanpa merge, isu duplikat atau tidak direncanakan, atau bukti yang hilang tidak pernah otomatis ditandai Selesai. Pertahankan pemilik, assignee, dan target; jangan mengarang tenggat.
- Perubahan keanggotaan atau kolom proyek: temukan pemilik, nomor, akses, dan ID kolom yang hidup; pakai URL atau node ID isu sebenarnya, penambahan idempoten, diff dry-run, baca ulang, dan rekonsiliasi; pertahankan satu isu kanonis dan bedakan butir PR dari hitungan pekerjaan. Tanpa kartu draf bersama atau konteks rahasia; tinjau izin; hindari pengisian massal atau bentrok dengan otomasi status; jangan pernah memindahkan butir melintasi batas visibilitas secara otomatis. Papan hanya untuk koordinasi, bukan otoritas merge atau deploy.

Rujukan (tiap halaman dibuka saat pengambilalihan dan ada): [Planning and tracking with Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects); [Using the API to manage Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects); [Creating issue dependencies](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies); [About issue statuses](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issue-statuses).

## Verifikasi rujukan saat pengambilalihan (2026-11-28)

Pemeriksaan halaman baca-saja pada 2026-11-28. Ringkasan halaman bukan salinan mentah, dan halaman yang tidak dapat dibuka tidak dianggap benar.

- **Didukung:** 8 dari 12 baris tabel, ditambah empat halaman GitHub di bagian Projects (12 dari 16 rujukan seluruhnya). Satu lagi (UU PDP) hanya diperiksa sebagian.
- **Belum terverifikasi saat pengambilalihan:** Cui dkk. (penerbit menolak akses; tidak ada angka ditulis), ISO 12207 dan ISO 9241-210 (katalog menolak akses; tidak ada tahun edisi ditulis), dan teks pasal UU PDP.
- **Koreksi yang dilakukan:** METR menghitung 246 isu, bukan tugas, dan halamannya menandai hasilnya tidak mutakhir; temuan kode aman ditulis sebagai parafrasa yang didukung sumber; DTCG 2025.10 adalah Community Group Report, bukan Rekomendasi W3C; nama produk vendor, uraian fitur, dan angka dari sumber yang belum terverifikasi dihapus.
- **Klaim spike rujukan:** sebuah sesi riset melaporkan spike rujukan berisi 19 uji sintetis di Node, dijalankan di luar repositori ini. Ia tidak dijalankan di repositori ini dan bukan bukti implementasi apa pun; tidak ada klaim uji dibuat di sini.
- **Klaim repositori yang diperiksa terhadap `main`:** awalan blob `AGENTS.md`, pernyataan nol permukaan terautentikasi, isu #210 sebagai isu pemilik, dan ADR-0034.
