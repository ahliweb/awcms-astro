# ADR-0027 — Penahanan ADR-0021 selesai: kedua indikatornya terpenuhi

- **Status:** Accepted
- **Tanggal:** 4 Agustus 2026
- **Aturan pemilik:** 4 Agustus 2026 — "lanjut analisis dan kerjakan rekomendasi, sinkronkan dengan repo backend `ahliweb/awcms`."
- **Men-supersede:** [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md)
- **Terkait:** [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (uji yang tetap berlaku), `awcms` [ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md), `awcms` [ADR-0060](https://github.com/ahliweb/awcms/blob/main/docs/adr/0060-business-scope-hierarchy-provided-by-tenant-admin.md)

## Konteks

ADR-0021 menahan pengembangan repo ini "sampai fondasi `awcms` selesai" dan —
karena "selesai" tidak punya definisi formal — menuliskan **dua indikator yang
bisa diperiksa** beserta risiko yang diterimanya: *"penahanan ini bisa
berlangsung lebih lama daripada yang dimaksudkan tanpa ada yang menyadarinya.
Kalau keduanya sudah nol dan penahanan masih berlaku, itu pertanyaan yang layak
diajukan, bukan keadaan yang dibiarkan."*

Keduanya kini nol.

| Indikator | Keadaan | Bukti |
| --- | --- | --- |
| Tiap modul `awcms` punya layar | **Terpenuhi** 3 Agt 2026 | `grep -L 'navigation:' src/modules/*/module.ts` → nol baris |
| §4 `PROJECT_STATE` "yang belum" habis | **Terpenuhi** 4 Agt 2026 | ADR-0059 (rute host-resolved), ADR-0060 (penyedia business-scope) |

Yang menutup indikator kedua bukan pembacaan dari sini. `awcms` menganalisis
kesiapan repo ini ke KODE — bukan ke daftarnya — dan menyimpulkan bahwa repo itu
hanya menyentuh **lima permukaan**, kelimanya lengkap, lalu menutup satu-satunya
gap nyata yang ditemukannya (`GET /api/v1/media/public-origin`, #370). Kalimat
penutupnya: **"Yang tersisa DAN milik repo ini: nol."**

Sisa `awcms-micro` yang belum diserap — `newsletter`, `social-publishing`,
pustaka `src/components/ui/` — tetap belum ada, dan **tidak satu pun memblokir
repo ini**. Itu juga kesimpulan `awcms`, bukan penilaian dari sini.

## Keputusan

**Penahanan ADR-0021 selesai.** Ia tidak dicabut lebih awal dan tidak
dibiarkan menggantung: kriteria yang ia tulis sendiri terpenuhi.

### Yang menggantikannya: uji ADR-0023, tanpa perubahan

ADR-0023 sudah menyempitkan penahanan menjadi satu pertanyaan, dan pertanyaan
itu **tetap berlaku sesudah ADR ini**:

> **Apakah perubahan ini akan ditulis ulang bila `awcms` berubah?**

Yang berubah hanya premisnya. Selama ADR-0021 berlaku, "ya" berarti *ditahan
sampai fondasi selesai*. Sekarang "ya" berarti *butuh instans `awcms` untuk
membuktikan panggilannya benar sebelum mendarat* — batas yang sama, alasan yang
berbeda, dan alasan yang kedua tidak akan pernah kedaluwarsa.

Batas eksplisit ADR-0023 juga tidak berubah: **"endpoint-nya sudah ada" bukan
jawaban "tidak".**

### Yang masih ditahan, dan oleh apa

**BFF portal Jualanku (ADR-0014).** Bukan oleh ADR-0021 — oleh uji ADR-0023: ia
memanggil `awcms` **di setiap permintaan runtime**, bukan sekali per build, jadi
bentuknya ditentukan respons `awcms` pada setiap permintaan. Kontrak sesinya
sudah mendarat (`awcms` ADR-0049/0050) dan business-scope resolver kini punya
penyedia (ADR-0060), tetapi bentuk scope merchant Jualanku sendiri masih butuh
ADR admission di `awcms`.

### Yang TIDAK berubah

- Seluruh gerbang: `bun run check`, `bun test`, `bun run audit:konten`,
  `bun run audit:dokumen`, changeset, dan ADR untuk keputusan yang masuk daftar
  [`docs/adr/README.md`](README.md).
- Patch keamanan dan bump dependency tetap mendarat, seperti selama penahanan.
- ADR-0021 tetap dibaca sebagai catatan sejarah — ia menjelaskan kenapa repo ini
  diam selama dua hari, dan alasannya benar saat ditulis.

## Konsekuensi

- **Backlog berhenti menunggu sesuatu.** Yang tersisa di
  [`README.md`](../../README.md) tinggal dua, dan keduanya menunggu **keputusan**
  bukan kontrak: kartu share yang dibangkitkan (dependency encoder gambar → ADR
  sendiri) dan BFF portal (di atas).
- **Risiko yang diterima ADR-0021 tidak terjadi.** Penahanan berlangsung dua
  hari, bukan berbulan-bulan, dan yang mengakhirinya adalah indikator yang ia
  tulis sendiri — bukan seseorang yang kebetulan ingat.
- **Risiko baru yang diterima:** "kontraknya lengkap" adalah kesimpulan `awcms`
  per 4 Agustus 2026, bukan properti permanen. Permukaan keenam yang kelak
  dipanggil repo ini bisa saja belum ada di sana; uji ADR-0023 yang menangkapnya,
  dan itu sebabnya uji itu tidak ikut dicabut.

## Alternatif yang dipertimbangkan

- **Membiarkan ADR-0021 berlaku sampai `awcms` benar-benar menyelesaikan seluruh
  §4-nya** — ditolak: §4 memuat program penyerapan `awcms-micro` dan trajektori
  e-commerce yang tidak pernah menjadi kontrak repo ini. Menunggunya berarti
  menunggu pekerjaan yang tidak pernah memblokir apa pun di sini, dan itu persis
  risiko yang ADR-0021 tulis sebagai kekhawatirannya sendiri.
- **Mencabut sekalian uji ADR-0023** — ditolak: uji itu tidak pernah tentang
  kesiapan `awcms`, melainkan tentang apakah repo template ini bisa MEMBUKTIKAN
  sebuah panggilan benar. Ia tetap tidak punya instans.
- **Menyatakan penahanan dicabut tanpa ADR** — ditolak: ADR-0021 adalah keputusan
  tertulis, dan keputusan tertulis dicabut secara tertulis. Enam bulan lagi
  "kenapa repo ini berhenti dua hari lalu jalan lagi" harus punya jawaban yang
  bisa dibaca.
