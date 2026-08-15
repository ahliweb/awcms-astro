🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md)

<!-- i18n-source-hash: sha256:0b9bd4cf0cd165e89414a60ac7a1e4425fafb1bdc8836191326067d1c798e3e2 -->

# ADR-0032 — Dua celah terakhir ADR-0028 ditutup, masing-masing dengan syarat kejujurannya

- **Status:** Accepted
- **Tanggal:** 5 Agustus 2026
- **Aturan pemilik:** 5 Agustus 2026 — "apabila perlu implementasi lakukan semua rekomendasi."
- **Terkait:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (celah 7 dan 8 yang ditutup di sini), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (pin SHA + aturan baru wajib membawa pemeriksanya), [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) (celah 9, pola penutupan yang sama), `awcms` [ADR-0067](https://github.com/ahliweb/awcms/blob/main/docs/adr/0067-core-web-vitals-collection.md) (pengumpulan CWV lapangan masih `Proposed` di sana)

## Konteks

Dua celah ADR-0028 tersisa, dan keduanya ditahan bukan karena sulit melainkan
karena penutupan yang mudah adalah penutupan yang bohong:

- **Celah 7 (analisis statik).** CodeQL tidak mengurai `.astro`. Menyalakannya
  lalu menyebut repo ini "dianalisis statik" adalah upacara yang terlihat
  seperti cakupan — klaim yang lebih besar daripada kenyataannya.
- **Celah 8 (Core Web Vitals).** Pengukuran lapangan (RUM) ditolak karena
  mengumpulkan data pembaca — penolakan yang tidak punya pengecualian "tapi ini
  untuk keamanan/performa". Pengukuran lab butuh Chrome di CI dan hasil build,
  dan repo template tidak punya sumber konten untuk dibangun.

Tabel celah ADR-0028 sendiri sudah meresepkan bentuk penutupan yang jujur untuk
keduanya: "workflow CodeQL terjadwal, **dengan cakupannya DINYATAKAN di
ringkasan run**" dan "Lighthouse CI atas `dist/client` di job `build`, **hanya
berjalan bila situs punya sumber konten**". Yang ditunggu bukan keputusan —
keputusan itu sudah tertulis — melainkan instruksi pemilik untuk membayar
biayanya.

## Keputusan

### §A — Celah 7: CodeQL atas permukaan JS/TS, dengan cakupan yang dihitung, bukan diklaim

`.github/workflows/codeql.yml`: bahasa `javascript-typescript`, terjadwal
mingguan plus pada perubahan (query CodeQL diperbarui GitHub terus-menerus,
jadi kode yang diam pun layak dipindai ulang), seluruh action dipin ke SHA
commit (ADR-0030).

**Syarat kejujurannya:** langkah `Nyatakan cakupan` menulis ke ringkasan run
berapa berkas `.ts`/`.mjs`/`.js` dianalisis dan berapa berkas `.astro` TIDAK —
keduanya **dihitung `find` saat run**, bukan ditulis tangan, karena angka yang
ditulis tangan berhenti benar begitu berkas bertambah. Jalur data berisiko repo
ini (`content-blocks.ts`, `penyaji.mjs`, klien `awcms`, seluruh gerbang)
berada di dalam cakupan; yang di luar adalah markup komponen.

### §B — Celah 8: Core Web Vitals lab, terkondisi sumber konten, dengan proksi yang disebut proksi

Langkah `Core Web Vitals (lab) atas hasil build` di job `build`
(`treosh/lighthouse-ci-action`, dipin SHA), `if: vars.AWCMS_API_URL != ''` —
pola yang sama dengan gerbang penyajian dan audit konten atas hasil build: di
repo template ia tidak berjalan, di setiap SITUS ia berjalan pada setiap PR.

Ambang di `lighthouserc.json` disamakan dengan target dokumen standar: LCP ≤
2500 ms, CLS ≤ 0,1, level `error` — `warn` adalah teater. **INP tidak diukur,
dan itu dinyatakan:** ia metrik lapangan, dan lapangan berarti RUM yang sudah
ditolak. Total Blocking Time ≤ 200 ms dipakai sebagai proksi lab-nya — situs
yang nyaris tanpa JS seharusnya mendekati nol, jadi TBT tinggi adalah sinyal
JS menyelinap masuk, persis yang ambang INP jaga.

**Yang diaudit adalah SAMPEL, dan batasnya dipilih — bukan diwarisi.** Bawaan
`@lhci/cli` berhenti diam-diam di 5 URL terdangkal dengan kedalaman penemuan
2 — pada situs turunan nyata itu berarti TIDAK SATU PUN halaman artikel
berlokal (`/{lang}/{tab}/{slug}/`, kedalaman 3) pernah diukur, sementara
404.html memakan satu slot. Review adversarial pra-merge menemukannya dari
sumber versi yang dipin. Konfigurasi karena itu menyatakan ketiganya:
`staticDirFileDiscoveryDepth: 4`, `maxAutodiscoverUrls: 10`, dan blocklist
`/404.html` — diasersi `tests/cwv-lab.test.mjs` supaya tidak ada yang bisa
mengembalikannya ke bawaan tanpa terlihat. Situs yang butuh cakupan lebih
menaikkan angkanya di `lighthouserc.json`; sepuluh halaman adalah sampel yang
dipilih sadar untuk menjaga waktu CI, bukan klaim cakupan penuh.

### §C — Pemeriksanya (ADR-0030 berlaku untuk penutupan ini juga)

- `tests/analisis-statik.test.mjs`: workflow ada, terjadwal, seluruh action
  ber-SHA + komentar versi, dan langkah pernyataan cakupan — beserta sebutan
  `.astro`-nya dan `find`-nya — tidak bisa dihapus diam-diam.
- `tests/cwv-lab.test.mjs`: ambang konfigurasi TERPAKU ke angka dokumen
  standar (melonggarkannya menuntut mengubah tes — terlihat di review), langkah
  CI-nya terkondisi dan dipin. Kedua tes berjalan di repo template, sehingga
  penutupan ini **bisa dibuktikan di tempat ia ditulis** — keberatan lama
  terhadap gerbang yang membusuk dijawab di sini, bukan diabaikan.

## Konsekuensi

**Yang didapat.** Kesembilan celah ADR-0028 tertutup, masing-masing bersama
pemeriksanya. SSDF RV.1 naik ke Terpenuhi. Sebuah situs turunan mendapat
pengukuran CWV lab atas sampel halamannya pada setiap PR sejak hari pertama,
tanpa satu byte pun data pembacanya dikumpulkan.

**Yang dibayar.** Dua workflow CI bergantung pada dua action pihak ketiga
(dipin SHA, di-bump Dependabot); ringkasan run CodeQL yang jujur harus terus
mengatakan `.astro` tidak dianalisis; dan hasil lab akan berfluktuasi — tiga
run per halaman meredamnya, tidak menghilangkannya.

**Yang TIDAK berubah.** RUM tetap ditolak; "memenuhi Core Web Vitals" tetap
tidak boleh ditulis dari hasil lab (lab mengukur halaman, bukan pembaca); dan
baris celah yang tertutup TETAP di tabel ADR-0028.

**Yang membuka kembali.** Ekstraktor `.astro` untuk CodeQL (atau analisis
statik lain yang mengurainya) menuntut peninjauan §A; keputusan `awcms`
ADR-0067 tidak mengubah apa pun di sini — opsi apa pun yang dipilihnya, postur
repo ini sudah dinyatakan.

## Alternatif yang dipertimbangkan

- **Membiarkan keduanya terbuka.** Sampai hari ini itu keputusan yang benar;
  yang mengubahnya adalah instruksi pemilik. Bentuk penutupannya tidak
  dinegosiasikan ulang — dipakai persis yang tabel celah resepkan.
- **Semgrep/oxlint sebagai ganti CodeQL.** Sama-sama tidak mengurai `.astro`,
  menambah keluarga tooling kedua, dan kehilangan integrasi tab Security.
- **Mengukur CWV dengan RUM.** Ditolak permanen — bukan trade-off teknis
  melainkan larangan mengumpulkan data pembaca.
- **Menjalankan Lighthouse atas halaman fixture di repo template.** Mengukur
  halaman yang tidak akan pernah diterbitkan siapa pun; hijau yang tidak
  membuktikan apa-apa, merah yang tidak berarti apa-apa.
