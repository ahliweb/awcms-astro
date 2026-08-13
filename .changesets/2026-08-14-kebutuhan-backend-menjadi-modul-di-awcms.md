---
tipe: struktur
dampak: internal
---

# Kebutuhan backend mendapat ALAMAT beserta pemeriksanya, dan keadaan `awcms` 13 Agustus 2026 malam diserap

Peran repo ini sudah tertulis di enam berkas, dan seluruhnya dalam bentuk
**negatif**: "tak pernah sumber kebenaran", "tanpa basis data", "seluruh API di
`awcms`". Negatif tidak pernah memberi alamat. Tidak satu pun mengatakan apa
**satuan** sebuah kebutuhan backend, ke mana ia pergi, atau bagaimana seseorang
tahu ia sedang membangun satu.

## Satu keputusan baru, dengan pemeriksanya

[ADR-0038](../docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md) —
**satuan sebuah kebutuhan backend adalah MODUL di `awcms`**, lewat admission
modul di sana, bukan folder di sini.

Yang membuat alamat itu menentukan bukan kerapian: **kewajiban keluarga menempel
pada MODUL, bukan pada kode.** Modul membawa deskriptornya, izinnya di katalog,
tabelnya di bawah RLS, jejak auditnya, deskriptor retensinya, dan sejak `awcms`
ADR-0094 deskriptor subjek datanya. Data yang lahir di repo ini lahir di luar
semuanya — dan sebuah tabel yang tidak pernah lewat admission modul adalah tabel
yang tidak bisa menjawab "apa yang kalian simpan tentang saya", tanpa seorang pun
tahu ia tidak bisa.

Bentuk pelanggarannya bukan pembangkangan melainkan langkah paling masuk akal
yang tersedia: sebuah situs butuh formulir kontak yang tersimpan, dan yang
terdekat adalah satu rute di sini plus satu tabel "sementara" — dengan **setiap
gerbang tetap hijau**, karena tidak satu pun membaca `package.json` menurut kelas
paketnya.

Pemeriksanya mendarat bersamanya (ADR-0030):
[`tests/tanpa-backend.test.mjs`](../tests/tanpa-backend.test.mjs), empat asersi,
keempatnya dibuktikan merah lewat mutasi — dependency kelas backend, `fetch`
ber-`method` selain `GET` di `src/`/`scripts/`, artefak persistensi, dan
hilangnya aturan ini dari `AGENTS.md`. Asersi kedua sekaligus menutup celah yang
sinkronisasi 13 Agustus tinggalkan terbuka: sejak `awcms` ADR-0092 membuka kelas
kredensial mesin yang boleh MENULIS, "build ini tidak bisa mengubah apa pun"
berhenti menjadi sifat kelas dan menjadi properti yang harus dijaga — dan sampai
sekarang ia hanya dijaga sebuah kalimat. Konsekuensi yang disengaja: **hari BFF
ADR-0014 mendarat, gerbang itu merah**, karena jalur tulis dari repo ini adalah
keputusan yang harus dinyatakan.

Yang gerbang itu **tidak** lihat, dan ditulis alih-alih dibiarkan tersirat: ia
memeriksa bentuk, bukan niat. Situs yang menyimpan datanya di layanan pihak
ketiga lewat `GET` lolos keempat asersi.

## Keadaan `awcms` sesudah sinkronisasi sebelumnya, pada hari yang sama

Sinkronisasi 13 Agustus 2026 berhenti di `awcms` ADR-0092. Sisi sana melanjutkan
sampai ADR-0094 pada malam yang sama.

- **`403 PARTNER_SUSPENDED` (`awcms` ADR-0093) — mode kegagalan build BERSYARAT,
  dan yang pertama yang bergantung pada siapa MENERBITKAN token.** Ia menolak
  aktor **terdelegasi** di chokepoint, per permintaan. Kredensial mesin mewarisi
  `principal_kind` akun layanannya, dan tidak ada apa pun di jalur penerbitan
  sana yang melarang akun layanan itu berupa tenant user terdelegasi — bentuk
  yang persis muncul saat sebuah agensi membangun situs pelanggannya. Aturannya
  karena itu operasional: **terbitkan token build atas akun layanan milik tenant
  situs.** Diagnosisnya sengaja dipersulit oleh keputusan yang benar di sana:
  suspensi membuat grant **tidak berlaku, bukan tidak ada**, jadi memeriksa
  daftar grant tidak menunjukkan sesuatu yang hilang. Diserap di `AGENTS.md`
  §Sumber data, tabel diagnosis [`deploy-coolify.md`](../docs/deploy-coolify.md),
  `.env.example`, dan docblock [`src/lib/awcms/tenant.ts`](../src/lib/awcms/tenant.ts).
- **`awcms` ADR-0094 — subjek data dijawab PER TENANT.** Nol pekerjaan adapter,
  satu kewajiban yang harus dinyatakan: situs statis memegang **salinan**, jadi
  anonimisasi di sana tidak menjangkau berkas yang sudah terbit sampai build
  berikutnya — dan salinan yang tersebar bisa hidup lebih lama lagi (cache CDN,
  riwayat git `dist/`). Yang membuat itu tidak menjadi masalah hari ini adalah
  **keputusan, bukan kebetulan**: template ini menerbitkan nol data per-orang —
  `author` JSON-LD `Organization` (digerbangi `tests/schema.test.mjs`) dan
  `<author>` feed nama situs (keputusan di `src/lib/feed.ts` yang **tidak**
  digerbangi, dan dicatat begitu). Situs yang menambah byline, avatar, atau komentar
  mengambil kewajibannya, dan jalur penghapusannya berakhir di sebuah rebuild.
- **Layar `/admin/*` `awcms` menjadi 40 tingkat atas dari 42** (`business-scope`
  dan `subject-requests` mendarat sesudah sinkronisasi sebelumnya). Dua di
  antaranya menyentuh operasi situs secara langsung dan karena itu disebut
  namanya: `/admin/machine-credentials` — menerbitkan **dan mencabut** token
  build kini sebuah layar, bukan `POST` yang harus diingat seseorang saat token
  bocor — dan `/admin/subject-requests`.
- `moduleDescriptorContractVersion` keluarga **4.0.0** (dari 3.1.0). Nol
  pekerjaan di sini: repo ini tidak mendeklarasikan satu deskriptor modul pun.

## Satu pesan galat yang menyuruh pembacanya melakukan hal yang salah

Sinkronisasi sebelumnya memperbaiki scope token "satu kunci" di `README.md`,
`.env.example`, dan `deploy-coolify.md`, tetapi tidak menyentuh **kode**.
`src/lib/awcms/tenant.ts` masih menyuruh menerbitkan token "scoped to
`blog_content.posts.read` **and nothing else**" — persis resep yang gagal 403 di
langkah TERAKHIR `bun run build`, setelah setiap halaman selesai dirender.
Diperbaiki, sekaligus menunjuk layar penerbitnya dan kelas baca yang wajib
dipertahankan.

## Gerbang

Kelima hijau: `check` (0 error atas 79 berkas), `bun test` (362 lulus, 20
berkas), `audit:konten`, `audit:dokumen` (973 kutipan ADR, 317 ditandai milik
repo lain), `audit:graf`.
