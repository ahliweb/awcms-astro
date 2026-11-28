🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](independent-intelligence-reference-2026-11-28.md)

<!-- i18n-source-hash: sha256:8398a18eb7221773fbfc85edcdd2fec7b7c2416b9027b64ce870de5471b0e5b3 -->

# Riset kapabilitas intelligence mandiri

## Kendali dokumen

- **Versi:** v1.3.0
- **Terakhir diperbarui:** 2026-11-28
- **Status:** Hanya riset dan rujukan. Semua butir desain, kontrol, ID uji, dan ID kebutuhan di bawah ini adalah **usulan**. Tidak ada kode produk, tidak ada dependensi yang disetujui, tidak ada keputusan Gerbang 9 atau Gerbang 15, dan tidak ada izin untuk mengimplementasikan.
- **Pelacak:** [#212](https://github.com/ahliweb/awcms-astro/issues/212) (tetap terbuka).
- **Snapshot bukti:** di `main` saat pengambilalihan (kepala `3a693d5`), `AGENTS.md` adalah blob git `3debbf7ad824` dan `README.md` adalah blob git `1875c568e0b5`. Awalan blob bukan SHA commit. Audit penuh atas kode, migrasi, status isu, dan CI masih tertunda.
- **Asal-usul:** disusun sesi AI lain sebagai pull request draf; diambil alih, dikoreksi, dan diperiksa rujukannya pada 2026-11-28 oleh sesi AI terorkestrasi atas pilihan pemilik. Pengambilalihan bukan persetujuan merge.
- **Document Changeset:** Revisi pengambilalihan: nama produk komersial, harga, jam layanan, dan penilaian atas klaim vendor dihapus; klaim rujukan dikoreksi atau ditandai belum terverifikasi; kalimat uji spike dikoreksi; bagian verifikasi rujukan ditambahkan.

## Bukti dan kekayaan intelektual

Riset ini dipicu uraian publik produk komersial di bidang fusi data, penilaian keamanan, dan akuntansi berbantuan AI; ia hanya memakai konsep fungsional umum dan standar terbuka. Uraian oleh vendor adalah laporan diri, tidak diuji atau disertifikasi secara independen, dan tidak ada yang diandalkan di sini. Tidak ada lisensi untuk mereproduksi produk apa pun yang telah ditetapkan.

Pakai hanya konsep fungsional publik, kebutuhan orisinal, serta spesifikasi, desain, dan implementasi orisinal. Tidak ada kode, UI, aset, teks, dataset, merek, SDK proprietari, aturan, atau rekayasa balik produk pihak ketiga mana pun; tidak ada pengujian tanpa izin. UU 28/2014 tentang Hak Cipta ([halaman BPK](https://peraturan.bpk.go.id/Details/38690/uu-no-28-tahun-2014)) dirujuk untuk pembedaan antara ekspresi program yang dilindungi dan gagasan atau metode (pasal 40 dan 41); halaman yang dibuka saat pengambilalihan hanya menampilkan judul dan status berlaku, sehingga pembacaan pasalnya **belum terverifikasi saat pengambilalihan**. Tinjauan paten, merek dagang, rahasia dagang, dan kontrak tetap diperlukan. Tidak ada dependensi yang diperkenalkan; setiap dependensi, model, atau sumber data yang diusulkan membutuhkan versi atau SHA, lisensi dan pengenal SPDX, hak komersial atau SaaS, pemberitahuan, SBOM transitif, persetujuan pemilik, dan rencana keluar sebelum dipakai. Jangan mereproduksi teks standar berlisensi.

## Disposisi repositori (usulan)

Hanya presentasi yang dapat dipakai ulang: agregat publik yang disetujui untuk dipublikasikan saat build, dan admin USER opsional yang dideklarasikan. Admin SYSTEM dan backend tetap di `awcms`. Tidak ada rute terautentikasi baru tanpa ADR. Ini selaras dengan `AGENTS.md` di `main` saat pengambilalihan (halaman publik adalah fungsi utama; nol permukaan terautentikasi dideklarasikan; kebutuhan backend menjadi modul di `awcms`).

## Kontrol, validasi, dan bukti (usulan)

Operasi keyboard, label pembaca layar, padanan tabel, kontras, dan WCAG 2.2 AA; pemindaian rahasia dan PII pada keluaran build, mock yang terikat tenant, dan tanpa permukaan owner. Tidak ada API atau state ganda, dan tidak ada ekspor publik atas bukti privat.

Catat kebutuhan dan ancaman, lalu kontrol, kontrak berversi, uji sintetis yang dapat direproduksi, bukti, dan SOP atau pemantauan. Baseline dan ambang adalah hipotesis sampai diukur. Pakai hak akses minimum, RBAC/ABAC default-deny dan RLS paksa bila berlaku, tanpa kepercayaan pada tenant yang diberikan klien, tanpa rahasia atau PII di log, persetujuan teraudit, dan pemulihan. Tidak ada target vendor, pelanggan, atau publik hidup yang diuji. Verifikasi tujuan data, retensi, dasar hukum, dan peran pengendali atau pemroses. Tidak ada berbagi data lintas tenant tanpa pemberian akses eksplisit yang terbatas.

## Daftar rujukan profesional

Kolom status adalah hasil pemeriksaan halaman baca-saja pada 2026-11-28 ("belum terverifikasi saat pengambilalihan" berarti halaman tidak dapat dibuka atau tidak menampilkan isi yang dapat dipakai; itu bukan temuan bahwa rujukannya salah). Tidak ada rujukan yang ditambahkan saat pengambilalihan.

| Rujukan | Status saat pengambilalihan |
| --- | --- |
| Hall dan Llinas (1997), IEEE, fusi data ([DOI](https://doi.org/10.1109/5.554205)) | **Belum terverifikasi saat pengambilalihan** (DOI dialihkan ke halaman penerbit tanpa isi yang dapat dibaca) |
| Lewis dkk. (2020), NeurIPS, retrieval-augmented generation ([halaman makalah](https://papers.nips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html)) | Diperiksa |
| W3C PROV-O ([TR](https://www.w3.org/TR/prov-o/)) | Diperiksa: Rekomendasi W3C, 30 April 2013 |
| NIST AI RMF 1.0 ([DOI](https://doi.org/10.6028/NIST.AI.100-1)) | **Belum terverifikasi saat pengambilalihan** (menuju PDF yang judul dan tanggalnya tidak dapat dibaca) |
| NIST Cybersecurity Framework 2.0 ([halaman](https://www.nist.gov/cyberframework)) | Halaman menyebut CSF 2.0; tahun rilisnya tidak ditampilkan dan tidak ditulis di sini |
| NIST SSDF 1.1 ([SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final)) | Diperiksa: final, Februari 2022. Revisi 1 (v1.2) adalah draf publik awal yang dirilis 17 Desember 2025 ([halaman draf](https://csrc.nist.gov/pubs/sp/800/218/r1/ipd)), belum final |
| NIST SP 800-218A, profil AI ([halaman](https://csrc.nist.gov/pubs/sp/800/218/a/final)) | Diperiksa: final, Juli 2024 |
| NIST SP 800-61 Rev. 3, respons insiden ([halaman](https://csrc.nist.gov/pubs/sp/800/61/r3/final)) | Diperiksa: final, April 2025, profil CSF 2.0 |
| OASIS STIX 2.1 ([spesifikasi](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html)) | Diperiksa: OASIS Standard, 10 Juni 2021 |
| OWASP ASVS 5.0.0 ([halaman proyek](https://owasp.org/projects/asvs)) | Diperiksa: tercantum 5.0.0 (stabil); tanggal rilis tidak ditampilkan dan tidak ditulis |
| WCAG 2.2 ([TR](https://www.w3.org/TR/WCAG22/)) | Diperiksa: Rekomendasi W3C, 12 Desember 2024 |
| FIRST CVSS v4.0 FAQ ([halaman](https://www.first.org/cvss/faq)) | Diperiksa: skor dasar bukan risiko |
| FIRST EPSS ([halaman](https://www.first.org/epss/), [riset](https://www.first.org/epss/research)) | Diperiksa: probabilitas sebuah CVE yang dipublikasikan dieksploitasi di dunia nyata dalam 30 hari ke depan |
| Jacobs dkk. (2021), EPSS ([DOI](https://doi.org/10.1145/3436242)) | **Belum terverifikasi saat pengambilalihan** (penerbit menolak akses) |
| CISA [katalog KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) dan [SSVC](https://www.cisa.gov/ssvc) | Halaman ada; isi tidak dibaca selain judul |
| NIST SP 800-115 ([halaman](https://csrc.nist.gov/pubs/sp/800/115/final)) | Diperiksa: final, September 2008 |
| NIST SP 800-52 Rev. 2, TLS ([halaman](https://csrc.nist.gov/pubs/sp/800/52/r2/final)) | Diperiksa: Agustus 2019 |
| NIST SP 800-92, manajemen log ([halaman](https://csrc.nist.gov/pubs/sp/800/92/final)) | Diperiksa: final, 13 September 2006. Revisi 1 masih draf; tanggal drafnya tidak ditampilkan |
| NIST SP 800-137 ([halaman](https://csrc.nist.gov/pubs/sp/800/137/final)) | Diperiksa: final, September 2011 |
| NIST SP 800-53 Rev. 5, Release 5.2.0 ([halaman](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)) | Diperiksa sebagian: halaman memuat Rev. 5 (final 2020, pembaruan 1) dan mencatat Release 5.2.0 bertanggal 27 Agustus 2025 sebagai rilis terbaru; Release 5.2.0 bukan versi yang dijelaskan halaman itu sendiri |
| NIST SP 800-124 Rev. 2 ([halaman](https://csrc.nist.gov/pubs/sp/800/124/r2/final)) | Diperiksa: final, 17 Mei 2023 |
| NIST SP 800-101 Rev. 1 ([halaman](https://csrc.nist.gov/pubs/sp/800/101/r1/final)) | Diperiksa: final, Mei 2014 |
| RFC 5424, syslog ([halaman](https://www.rfc-editor.org/info/rfc5424/)) | Diperiksa: Maret 2009 |
| Model data log OpenTelemetry ([halaman](https://opentelemetry.io/docs/specs/otel/logs/data-model/)) | Diperiksa: halaman ada |
| RFC 9846, TLS 1.3 ([info](https://www.rfc-editor.org/info/rfc9846/)) | Diperiksa: Juli 2026; menggantikan RFC 8446 |
| BCP 195 ([info](https://www.rfc-editor.org/info/bcp195/)) | Diperiksa: BCP 195 terdiri dari RFC 8996, RFC 9325, dan RFC 9852 (Juli 2026, memperbarui RFC 9325). RFC 9325 juga diperbarui RFC 10015 (Juli 2026, mencabut metode pertukaran kunci TLS 1.2 usang), yang **bukan** bagian dari BCP 195 |
| RFC 9525, identitas layanan dalam TLS ([halaman](https://www.rfc-editor.org/rfc/rfc9525.html)) | Diperiksa: November 2023; menggantikan RFC 6125 |
| Denning (1987), IEEE TSE ([DOI](https://doi.org/10.1109/TSE.1987.232894)) | **Belum terverifikasi saat pengambilalihan** (pengalihan DOI tanpa isi yang dapat dibaca) |
| Entri katalog ISO/IEC: 27001, 27002, 27005, 27017, 27018, 27034-1, 27701, 15408-1, 20000-1, 22301, 42001, 23894, 25010, 27035, 27036-3, 27037 ([katalog ISO](https://www.iso.org/standard/iso-iec-27000-family)) | **Belum terverifikasi saat pengambilalihan** (katalog menolak akses). Tahun edisi dari draf tidak ditulis di sini; periksa tiap edisi di katalog sebelum dipakai. Hanya metadata katalog publik; tidak ada klaim sertifikasi, kepatuhan, atau audit klausul penuh |
| UU PDP 27/2022 ([halaman BPK](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)) | Diperiksa sebagian: halaman menampilkan metadata, abstrak, dan putusan pengadilan; teks pasal (termasuk jangka waktu pemberitahuan yang dikaitkan dengan pasal 46) **belum terverifikasi saat pengambilalihan** |
| Peraturan Pemerintah 71/2019 ([halaman](https://jdih.komdigi.go.id/produk_hukum/view/id/695/t/common)) | Diperiksa: hanya judul dan nomor |
| Peraturan Presiden 82/2022 tentang pelindungan infrastruktur informasi vital ([halaman](https://peraturan.bpk.go.id/Details/211029/perpres-no-82-tahun-2022)) | Diperiksa: hanya judul dan nomor |
| UU 28/2014 tentang Hak Cipta, salinan WIPO ([halaman](https://www.wipo.int/wipolex/en/legislation/details/15600)) | Diperiksa: hanya judul; pasal 41 tidak dibaca |

Tinjau UU ITE yang berlaku, undang-undang sektoral, dan aturan pelaksana terkini sebelum rilis.

## Gerbang berikutnya

Ikuti siklus hidup 18 langkah lintas-portofolio internal: penemuan dan UX, model privasi dan ancaman, data dan otorisasi, algoritma dan kontrak sebelum Gerbang 9. Hanya isu riset yang diizinkan saat ini. Validasi CI, indeks, changeset, serta papan proyek, milestone, dan ketergantungan khusus repositori saat tinjauan; UAT konsumen dan Gerbang 15 mendahului produksi. Rollback adalah penghapusan dokumen ini (tanpa efek runtime); fitur di masa depan membutuhkan pemulihan atau rollback teruji dan pemantauan. Tidak ada eksekusi CI atau uji yang diklaim untuk riset ini.

## Riset lanjutan kapabilitas keamanan (2026-11-28)

Status: hanya riset; tanpa gerbang implementasi, tanpa IP pihak ketiga, dan tanpa penerimaan dependensi. Halaman produk sebuah penawaran komersial dirujuk saat penyusunan draf; revisi ini hanya mempertahankan konsep fungsionalnya dan membuang nama, harga, jam layanan, dan klaim vendor itu. Konsep yang dipakai: pemeriksaan kepemilikan sebelum penilaian, penilaian versus pemantauan, triase dan uji ulang, respons insiden terkendali, penilaian privasi, dan pelaporan oleh pemegang hak. Ini hanya konsep fungsional; tidak ada salinan UI, kode, rumus skor, teks, API proprietari, aset, templat pemindaian, atau data; tidak ada akun, tidak ada pengujian target, dan tidak ada pengunduhan internal vendor mana pun. Pemantauan otomatis tidak berarti ada layanan analis yang bertugas. Pernyataan residensi data oleh siapa pun bukan bukti lokasi seluruh pemrosesan; tinjau subpemroses, transfer, penghapusan, dan kontrak secara terpisah. Kesiapan PDP bukan sertifikasi.

### Daftar penerimaan lisensi (teramati di branch bawaan, bukan rilis yang dipin)

Diperiksa dengan membuka berkas lisensi atau README pada 2026-11-28; ini bukan persetujuan rilis apa pun.

| Kandidat | Bukti dan disposisi yang diusulkan |
| --- | --- |
| ZAP | Apache-2.0 ([LICENSE](https://github.com/zaproxy/zaproxy/blob/main/LICENSE)); kandidat; periksa add-on dan NOTICE |
| Nuclei | MIT ([LICENSE](https://github.com/projectdiscovery/nuclei/blob/dev/LICENSE.md)); kandidat, tanpa dependensi baru |
| Templat Nuclei | Koleksi resmi MIT ([LICENSE](https://github.com/projectdiscovery/nuclei-templates/blob/main/LICENSE.md)); tinjau asal-usul, tanda tangan, dan keamanan secara terpisah; tanpa templat pihak ketiga yang tidak dikenal |
| testssl.sh | GPL-2.0 ([repositori](https://github.com/testssl/testssl.sh)); tahan sampai tinjauan distribusi dan integrasi |
| Wazuh | Campuran ([README](https://github.com/wazuh/wazuh/blob/main/README.md)): engine AGPL-3.0-or-later, pustaka bersama tertentu GPL-2.0-only OR AGPL-3.0-or-later, sisanya GPLv2; periksa semua paket, indexer, dashboard, agen, dan rilis sebenarnya; HOLD |
| MVT | Lisensi khusus bersyarat persetujuan, MVT License 1.1 ([LICENSE](https://github.com/mvt-project/mvt/blob/main/LICENSE)); HOLD; mensyaratkan persetujuan pemilik data yang eksplisit, berinformasi, dan tanpa paksaan; lisensi IOC terpisah |

Tidak ada alat yang disetujui, dipasang, atau dibundel. Sebelum ADR: pin rilis atau tag atau SHA, digest, SBOM transitif, kewajiban lisensi dan NOTICE, ketentuan distribusi dan penggunaan jaringan, ketentuan dataset dan feed, dukungan, rencana keluar, dan tinjauan hukum. Pemisahan proses tidak menghapus kewajiban lisensi. Utamakan fondasi native yang disetujui; adaptor eksternal hanya setelah gerbang. Tidak ada rekayasa balik API vendor mana pun.

### Metode ilmiah dan profesional

- CVSS v4.0: keparahan dasar bukan risiko bisnis. EPSS: skor terkini memperkirakan eksploitasi di dunia nyata dalam 30 hari ke depan, bukan probabilitas kompromi sebuah aset tertentu; makalah EPSS asli memakai horizon berbeda, jadi jangan dicampur (makalah itu belum terverifikasi saat pengambilalihan). CISA KEV (eksploitasi yang diketahui) dan SSVC (keputusan spesifik pemangku kepentingan). Catat tanggal dan versi feed; data tidak diketahui atau basi dinyatakan tidak diketahui dan tidak pernah diberi skor nol. Keputusan risiko menggabungkan paparan terverifikasi, dampak aset, kontrol, bukti eksploitasi, dan tinjauan manusia; tanpa rumus produksi karangan dan tanpa penutupan otomatis. Evaluasi pada dataset sintetis atau historis berizin yang dibagi menurut waktu: cakupan dan efisiensi, presisi dan recall, kalibrasi (skor Brier), dan beban analis terhadap baseline hanya-keparahan. Tidak ada hasil terukur yang diklaim.
- NIST SP 800-115 untuk perencanaan penilaian; SP 800-61 Rev. 3 untuk respons insiden yang terintegrasi dengan CSF 2.0; ASVS 5.0.0; PROV-O; WCAG 2.2. Standar proses insiden, rantai pasok, dan bukti ISO (27035-1, 27035-2, 27036-3, 27037; belum terverifikasi saat pengambilalihan) melengkapi pemetaan kontrol ISO yang ada; bukan sertifikasi atau reproduksi teks berlisensi.
- UU PDP, pasal 46: draf mengaitkannya dengan jangka waktu pemberitahuan untuk kegagalan yang memenuhi syarat (ditulis di sana sebagai 3x24 jam); hal ini **belum terverifikasi saat pengambilalihan**. Validasi manusia dan hukum atas pemicu dan penerima diperlukan; tanpa pelaporan otomatis. Nomor peraturan dan tanggal Januari 2027 yang diambil dari pernyataan vendor dihapus karena tidak diautentikasi secara independen; tidak ada yang dikodekan keras sebagai aturan. Tinjauan hukum mencakup dasar hukum, DPIA, transfer data, persyaratan penyelenggara sistem elektronik dan sektoral, UU ITE, PP 71/2019, Perpres 82/2022, dan IP menurut UU 28/2014.

### Uji keselamatan dan penerimaan yang diusulkan

Semua ID bersifat sementara dan harus direkonsiliasi dengan pengenal CAP/REQ yang ada; setiap uji di bawah ini adalah usulan dan tidak ada CI yang dijalankan.

- SEC-001: aset terverifikasi dan pemberian cakupan bertanda tangan; kedaluwarsa dan pencabutan; periksa ulang sebelum setiap pekerjaan. Bukti DNS atau berkas saja bukan izin menyeluruh; hosting pihak ketiga atau bersama diotorisasi terpisah.
- SEC-002: tolak tujuan yang tidak disetujui, pengalihan, perubahan DNS, SSRF, dan target privat atau link-local; tanpa uji luas atau mengganggu, tanpa eksploitasi, tanpa pengumpulan kredensial, tanpa callback eksternal; sandbox dengan fixture sintetis, anggaran sumber daya terbatas, sakelar henti, dan identitas worker independen.
- SEC-003: penerimaan, SBOM, dan versi atau tanda tangan; tanpa templat atau shell sembarang dari pengguna.
- SEC-004: hash temuan dan bukti, keluaran teredaksi, akses terbatas per tenant, penanda basi, audit, uji ulang, dan alur positif palsu.
- SEC-005: keputusan risiko yang dapat dijelaskan dengan asal-usul dan ketidakpastian.
- SEC-008: bukti GRC dan tinjauan hukum. SEC-009: kronologi insiden, tenggat pemberitahuan yang dapat dikonfigurasi, persetujuan, dan latihan pemulihan. SEC-010: retensi dan penghapusan bukti terbatas, audit akses.
- SEC-011: isu GitHub hanya setelah otorisasi terbatas dan redaksi; tanpa aksi otomatis.
- SEC-012: AI hanya boleh membuat draf, tanpa rahasia atau telemetri pelanggan mentah; uji prompt-injection dan egress; sitasi dan abstain.
- SEC-013: pemantauan endpoint hanya metadata, bila diotorisasi. SEC-014: hanya laporan pemegang hak yang sah, dengan tinjauan manusia dan tanpa tindakan balasan. SEC-015: persetujuan pemilik perangkat, tanpa membaca komunikasi, tanpa jaminan forensik.
- Tidak ada aset atau data pelanggan nyata dalam riset ini.

### Hasil riset lokal (#212, usulan)

Presentasi risiko, temuan, dan bukti yang orisinal dan aksesibel; SSG publik hanya untuk konten agregat yang disetujui, admin USER hanya bila dideklarasikan; admin SYSTEM dan alur risiko tetap di backend. Uji mock dengan keyboard dan fokus, keparahan yang tidak hanya berbasis warna, padanan teks untuk grafik, status basi, tidak tersedia, dan keyakinan, tabel laporan yang aksesibel, dan WCAG 2.2 AA. Verifikasi bahwa tidak ada PII, rincian kerentanan, pengenal tenant, atau URL bukti bertanda tangan di artefak build statis. Tanpa backend dan tanpa data privat di bundel klien publik.

## Arahan rekonstruksi mandiri (2026-11-28, usulan)

Arahan yang tercatat dalam draf: pakai kapabilitas orisinal, bukan dependensi yang belum disetujui. Ini menggantikan HOLD-sebagai-kandidat sebelumnya untuk testssl.sh (GPL-2.0), Wazuh (engine AGPL-3.0-or-later, pustaka manajer dan bersama campuran), dan MVT (lisensi khusus, persetujuan). Jangan memasang, menautkan, memvendor, memporting, menerjemahkan, atau menyalin sumber, struktur, UI, aturan, templat, IOC, atau dataset alat-alat ini maupun produk komersial mana pun; jangan memakainya sebagai oracle; jangan merekayasa baliknya. GPL dan AGPL bukan larangan komersial; implementasi mandiri adalah pilihan bisnis dan arsitektur, bukan pengecualian hukum. Persetujuan pemilik perangkat yang berinformasi dan tanpa paksaan dipertahankan apa pun implementasinya. ZAP dan Nuclei tetap kandidat yang belum disetujui; tanpa penerimaan dependensi. Pakai uraian fungsional publik dan standar independen saja; wajibkan asal-usul atau atestasi kontributor, daftar sumber, kebutuhan independen, peninjau, pemeriksaan kemiripan, pemeriksaan dependensi dan SBOM, serta versi, SHA, lisensi, pemberitahuan, paten, ketentuan data, dan rencana keluar yang dipin. Tidak ada klaim clean-room formal atau kepatuhan. Untuk dasar hak cipta lihat daftar di atas (pembacaan pasal belum terverifikasi saat pengambilalihan). Tinjau IP dan kontrak lainnya. Tanpa materi terbatas di prompt agent.

### Standar independen dan cakupan

- TLS: RFC 9846 (Juli 2026) menggantikan RFC 8446; BCP 195 terdiri dari RFC 8996, 9325, dan 9852, dan RFC 9325 juga diperbarui RFC 10015 di luar BCP 195; RFC 9525 untuk identitas layanan; NIST SP 800-52 Rev. 2. Pakai API TLS runtime yang disetujui dan jangan pernah kriptografi baru; catat hanya versi, rantai, identitas, dan kedaluwarsa yang dinegosiasikan; tidak diketahui bukan lulus. Mengamati TLS 1.2 bukan kepatuhan BCP; tanpa uji paritas atau eksploit.
- Log dan pemantauan: Denning (1987, belum terverifikasi saat pengambilalihan); NIST SP 800-92 (Revisi 1 masih draf) dan SP 800-137; SP 800-53 Rev. 5 (Release 5.2.0, 27 Agustus 2025) kontrol AU-6, SI-7, dan SI-4; RFC 5424; model data log OpenTelemetry hanya sebagai rujukan.
- Mobile: NIST SP 800-124 Rev. 2 dan SP 800-101 Rev. 1 sebagai batas cakupan, bukan akuisisi forensik.
- Pengembangan aman: SSDF 1.1 final; v1.2 adalah draf publik awal dan belum final.
- Petakan standar ISO/IEC yang tercantum di daftar (belum terverifikasi saat pengambilalihan; tanpa tahun edisi) sebagai bukti, bukan sertifikasi. UU PDP, UU ITE, PP 71/2019, tujuan, retensi, persetujuan, dan tinjauan hukum.

ID kebutuhan sementara (usulan): IND-01 postur TLS (worker konsumen); IND-02 metadata host (komponen sisi host, akan diputuskan); IND-03 normalisasi dan korelasi peristiwa (kontrak `awcms` dan ringkasan sisi host); IND-04 bukti integritas (komponen sisi host); IND-05 postur mobile (penemuan produk); IND-06 risiko, bukti, dan kasus (`awcms` dan konsumen). Tidak ada klaim SIEM, XDR, forensik, atau deteksi spyware penuh. Pemberian cakupan eksplisit, kedaluwarsa dan pencabutan, worker independen, data sintetis, tanpa I/O tanpa izin atau data privat, dan tanpa aksi tanpa persetujuan. Rekonsiliasi CAP/REQ, asal-usul sumber, ADR, dan Gerbang 9 dan 15; tanpa kode produk atau deployment baru.

Sebuah spike rujukan, yang dilaporkan sesi riset sebagai uji lokal luring di Node v22.16.0 dengan 19 uji sintetis lulus, dijalankan di luar repositori ini. Ia tidak dijalankan di sini, hanya mencakup keputusan murni atas observasi yang diberikan, dan bukan bukti implementasi apa pun di repositori ini. Tidak ada uji Bun, CI, TLS nyata, perangkat, RLS, atau produksi yang dijalankan.

### Kebutuhan dan penerimaan lokal (usulan)

IND-06: hanya visualisasi laporan independen. Tampilkan terobservasi-baik, tinjau, tidak diketahui, dan ditolak secara eksplisit; tanpa pernyataan aman menyeluruh dan tanpa kesimpulan yang hanya berbasis warna; tampilkan kesegaran dan versi bukti; alternatif teks, operasi keyboard, dan WCAG 2.2 AA. SSG publik hanya untuk agregat yang disetujui; tanpa bukti tenant privat, tanpa URL bertanda tangan, dan tanpa backend. Hanya permukaan USER yang dideklarasikan; admin SYSTEM tetap di `awcms`.

## Verifikasi rujukan saat pengambilalihan (2026-11-28)

Pemeriksaan halaman baca-saja pada 2026-11-28; ringkasan halaman bukan salinan mentah, dan halaman yang tidak dapat dibuka tidak dianggap benar.

- **Didukung:** 24 dari 33 entri daftar bertanda "Diperiksa" (sebagian hanya untuk judul, tanggal, atau status); dua diperiksa sebagian (SP 800-53 Rev. 5 release 5.2.0 dan halaman UU PDP); dua halaman hanya dipastikan ada (CSF 2.0 dan halaman CISA); lima belum terverifikasi (lihat butir berikutnya).
- **Belum terverifikasi saat pengambilalihan:** Hall dan Llinas, Denning, Jacobs dkk., NIST AI RMF 1.0, entri katalog ISO beserta tahun edisinya, serta teks pasal UU PDP (termasuk pasal 46) dan UU 28/2014 (pasal 40 dan 41). Semuanya tetap tercantum dan ditandai, dan tidak ada angka atau tahun edisi dari sumber itu yang ditulis sebagai fakta.
- **Koreksi yang dilakukan:** RFC 10015 bukan anggota BCP 195; SP 800-53 dirujuk sebagai Rev. 5, Release 5.2.0 (27 Agustus 2025); perbandingan harga vendor, jam layanan, klaim alat pemindai, dan klaim tanggal peraturan dihapus; klaim "19/19 uji sintetis di Node" dinyatakan ulang sebagai spike rujukan eksternal; tahun rilis CSF dan tanggal rilis ASVS dibuang karena halaman yang dibuka tidak menampilkannya.
- **Klaim repositori yang diperiksa terhadap `main`:** awalan blob `AGENTS.md` dan `README.md`, pernyataan nol permukaan terautentikasi, dan isu #212 sebagai pelacak.
