# ADR-0017 — Repo ini memikul halaman admin OWNER/INTERNAL, di samping situs publiknya

- **Status:** Superseded by [ADR-0020](0020-layar-admin-kembali-ke-awcms.md)
  — `awcms` [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md)
  memusatkan SELURUH layar admin di `awcms` dan men-supersede ADR-0048, pasangan
  ADR ini. Empat aturan di §Keputusan tetap mengikat permukaan BFF Jualanku dan
  dipindahkan ke `AGENTS.md`; yang gugur hanya penempatan layarnya.
- **Tanggal:** 31 Juli 2026
- **Aturan pemilik:** 31 Juli 2026 — "kerjakan semua langsung di `awcms-astro` sesuai peran frontend halaman admin owner/internal, dan `awcms` sesuai peran frontend publik / admin publik."
- **Pasangan di `awcms`:** [ADR-0048](https://github.com/ahliweb/awcms/blob/main/docs/adr/0048-frontend-role-split-awcms-astro-internal-admin.md) — sisi lain dari keputusan yang sama, dicatat di repo yang memiliki datanya.
- **Terkait:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (rendering campuran + BFF), [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) (runtime Bun), `awcms` [ADR-0047](https://github.com/ahliweb/awcms/blob/main/docs/adr/0047-mini-micro-frozen-foundation-built-here.md) (pembekuan mini/micro, dan dua kontrak yang masih buntu).

## Konteks

Sampai hari ini repo ini adalah **situs publik statis**: konten ditarik saat build, tidak ada basis data, tidak ada permukaan terautentikasi. ADR-0014 sudah membuka satu pengecualian terukur (rute on-demand + BFF portal Jualanku), tetapi kerangkanya tetap "publik".

Aturan pemilik 31 Juli 2026 menambahkan peran kedua yang tidak bisa diturunkan dari dokumen mana pun yang ada: **halaman admin owner/internal dibangun di sini**, sementara `awcms` memegang frontend publik dan admin milik tenant.

Kenapa ini butuh ADR alih-alih satu baris di AGENTS.md: peran baru itu mengubah **kelas repo ini dari "publik" menjadi "publik + terautentikasi"**, dan sejumlah keputusan lama ditulis dengan asumsi kelas yang lama.

## Keputusan

Repo ini memikul **dua** permukaan yang dipisahkan tegas:

| Permukaan | Audiens | Sifat |
| --- | --- | --- |
| Situs publik (hari ini) | pengunjung anonim | statis, di-build, boleh di-cache agresif |
| **Admin owner/internal (baru)** | operator platform, staf internal | on-demand, terautentikasi, **tidak pernah di-cache bersama** |

Aturan yang mengikat keduanya:

1. **`awcms` tetap system of record.** Repo ini tidak punya basis data, tidak punya tabel, dan tidak pernah menyentuh PostgreSQL `awcms`. Setiap data admin internal datang dari `/api/v1/*` lewat **BFF** repo ini (ADR-0014) — browser internal tidak pernah memanggil `awcms` langsung dan tidak pernah memegang kredensialnya.
2. **Izin tidak pindah bersama layar.** Setiap aksi tetap dievaluasi oleh RBAC/ABAC default-deny milik `awcms`. Layar di sini tidak boleh menjadi jalur kedua yang lebih longgar; kalau sebuah aksi butuh permission, ia butuh permission dari sini juga.
3. **Jangan ada cache bersama antara permukaan publik dan permukaan admin.** Cache yang melayani pengunjung anonim tidak boleh menyentuh respons terautentikasi — itu bentuk kebocoran yang paling mudah dibuat dan paling sulit dilihat.
4. **Setiap penambahan di permukaan admin dinilai sebagai permukaan keamanan**, bukan sekadar halaman: apa yang dirender, apa yang di-log, apa yang tersimpan di cookie/localStorage, dan apa yang terjadi saat sesi kedaluwarsa.

## Yang memblokir layar internal pertama (nyata, bukan hipotetis)

`awcms` ADR-0047 sudah mencatat dua kontrak yang **belum ada**, dan keduanya berdiri persis di jalur ini:

1. **Header tenant tidak cocok.** `awcms` membaca `x-awcms-tenant-id`; repo ini mengirim `X-Tenant-Code`/`X-Tenant-Id`.
2. **Tidak ada kredensial yang bisa dipegang layanan.** Bearer yang diterima `awcms` adalah session token ter-hash milik pengguna; belum ada kredensial mesin/sesi internal yang bisa dipegang BFF.

Konsekuensinya jujur: **layar admin internal pertama tidak bisa dibangun sampai kedua kontrak itu mendarat di `awcms`.** ADR ini menetapkan **di mana** layar itu tinggal dan **aturan apa** yang mengikatnya — bukan mengklaim jalannya sudah terbuka.

## Konsekuensi

**Positif**

- "Layar ini seharusnya di mana?" punya jawaban tertulis di kedua repo, dengan alasan yang sama, sebelum kode pertama ditulis.
- Permukaan publik tetap bisa dioptimalkan untuk pengunjung anonim tanpa berkompromi dengan kebutuhan layar internal.

**Negatif / biaya yang diterima**

- Repo ini berhenti menjadi "hanya situs statis". Setiap ADR lama yang bersandar pada premis itu harus dibaca ulang saat disentuh — ADR-0016 (penyajian oleh Bun) sudah kompatibel karena Bun menjalankan proses, tetapi premisnya berubah.
- Kontrak API lintas-repo harus dijaga sinkron; itu beban nyata dan alasan repo ini wajib memanggil `/api/v1` alih-alih menumbuhkan jalur datanya sendiri.
