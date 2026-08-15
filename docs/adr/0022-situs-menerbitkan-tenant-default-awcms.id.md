🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0022-situs-menerbitkan-tenant-default-awcms.md)

<!-- i18n-source-hash: sha256:98a08a144d47cdc674aba9ded82ffbc24da91d8d4bb32cebe272e6a2a2d3599b -->

# ADR-0022 — Situs ini menerbitkan tenant DEFAULT (owner) `awcms`

- **Status:** Accepted
- **Tanggal:** 2 Agustus 2026
- **Aturan pemilik:** 2 Agustus 2026 — "untuk repo `ahliweb/awcms-astro` juga merujuk ke default tenant (owner) pada repo `ahliweb/awcms`."
- **Menyempurnakan:** [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) — tenant tetap datang dari token mesin; ADR ini menyatakan tenant MANA yang boleh dirujuk, dan bagaimana pernyataan itu dibuat bisa diperiksa.
- **Terkait:** [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) (penahanan pengembangan — tetap berlaku), `awcms` [ADR-0053](https://github.com/ahliweb/awcms/blob/main/docs/adr/0053-platform-scoped-permissions.md) (tenant platform & permission ber-scope platform), `awcms` [ADR-0054](https://github.com/ahliweb/awcms/blob/main/docs/adr/0054-tenant-provisioning.md) (provisioning tenant), `awcms` [ADR-0055](https://github.com/ahliweb/awcms/blob/main/docs/adr/0055-development-confined-to-awcms-and-awcms-astro.md) (pengembangan hanya di dua repo ini)

## Konteks

ADR-0018 menutup pertanyaan **bagaimana** tenant ditentukan: token mesin membawanya (`awcmsm_<32 hex tenant id>_<secret>`), dan `AWCMS_TENANT_ID` adalah **asersi** yang menggagalkan build bila keduanya berbeda. Itu benar dan tidak berubah.

Yang belum pernah dinyatakan adalah tenant **mana**. Selama `awcms` hanya bisa punya satu tenant, pertanyaannya tidak berarti apa-apa — dan memang begitu keadaannya sampai 2 Agustus 2026, karena `POST /api/v1/setup/initialize` meng-klaim singleton `awcms_setup_state` sehingga sukses tepat sekali.

Dua perubahan di `awcms` pada hari yang sama membuat pertanyaan itu punya arti:

- **ADR-0053** memperkenalkan **tenant platform** — tenant yang memegang wewenang lintas-tenant, di-resolve `PLATFORM_TENANT_ID` → `PUBLIC_DEFAULT_TENANT_ID` → `PUBLIC_DEFAULT_TENANT_CODE` → `awcms_setup_state.tenant_id`. Ia juga menurunkan **mode ketenanan** `single`/`multi` dari jumlah tenant aktif.
- **ADR-0054** membuat tenant kedua **bisa ada**.

Sejak itu, "tenant mana yang situs ini terbitkan" adalah pertanyaan dengan lebih dari satu jawaban yang mungkin.

## Keputusan

**Situs yang dibangun dari repo ini menerbitkan tenant DEFAULT (owner) `awcms`** — tenant yang sama yang `awcms` resolusi sebagai tenant platform.

Mekanismenya **tidak berubah**, dan itu disengaja:

1. Token mesin (`AWCMS_API_TOKEN`) **diterbitkan dari tenant default itu**, dan tetap menjadi satu-satunya hal yang memilih tenant.
2. `AWCMS_TENANT_ID` diisi dengan uuid tenant tersebut, sehingga build gagal saat token dan asersi tidak cocok.

Yang ADR ini tambahkan adalah **cara memastikannya**: layar `/admin/tenants` di `awcms` (ADR-0054) menandai tenant platform dengan badge `platform`, dan uuid-nya ada di baris yang sama. Itu sumber yang benar untuk `AWCMS_TENANT_ID` — bukan tebakan, bukan tenant yang kebetulan token-nya ada di clipboard.

### Kenapa TIDAK diverifikasi lewat jaringan

Kandidat yang jelas adalah build menanyakan `awcms` "apakah tenant saya tenant platform?". Itu **ditolak**, dan alasannya milik `awcms`, bukan kenyamanan:

- `GET /api/v1/auth/session` **menolak kredensial mesin dengan 401 yang sama seperti token tak dikenal** (`awcms` ADR-0049 §Anti-oracle). Membuatnya menjawab kredensial mesin akan mengubah endpoint itu menjadi pengklasifikasi bearer yang sedang dipegang seseorang.
- Endpoint baru yang menjawabnya berarti **melebarkan izin token build**, yang hari ini `["blog_content.posts.read"]` dan tidak lebih. Token build yang bocor tidak boleh bisa membaca postur platform.

Asersi build-time sudah menangkap kesalahan yang benar-benar terjadi — **token yang salah ditempel** — dan menangkapnya tanpa menambah satu pun permukaan.

## Konsekuensi

- **Positif:**
  - Pertanyaan "tenant mana" punya jawaban tertulis sebelum `awcms` benar-benar multi-tenant, bukan sesudah situs pertama menerbitkan artikel milik pihak lain.
  - Nol perubahan kode dan nol permukaan baru: mekanismenya sudah ada sejak ADR-0018.
- **Negatif / trade-off yang diterima:**
  - `AWCMS_TENANT_ID` **opsional**, jadi deployment yang mengosongkannya tidak memeriksa apa pun. Itu tetap pilihan yang sah (ADR-0018 §Asersi) — tetapi begitu `awcms` masuk mode `multi`, mengosongkannya berarti menerima bahwa token yang salah tidak akan terlihat sampai seseorang membaca artikelnya.
  - Bila `awcms` kelak sengaja memisahkan tenant landing-page dari tenant platform (`PLATFORM_TENANT_ID` diisi terpisah — `awcms` ADR-0053 §Konsekuensi), ADR ini harus dibaca ulang: "default" dan "platform" berhenti menjadi tenant yang sama, dan repo ini harus memilih salah satunya secara eksplisit.
- **Netral:**
  - [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) tetap berlaku. Ini dokumen, bukan pengembangan fitur.

## Alternatif yang dipertimbangkan

- **Endpoint `awcms` yang menyatakan tenant platform** — ditolak; lihat §Kenapa TIDAK diverifikasi lewat jaringan.
- **Mewajibkan `AWCMS_TENANT_ID`** — ditolak untuk sekarang: ADR-0018 sengaja membuatnya opsional supaya deployment percobaan bisa jalan tanpa menyalin uuid. Mewajibkannya adalah perubahan yang wajar begitu ada deployment `multi` nyata, dan pantas mendapat ADR-nya sendiri saat itu.
- **Menyimpulkan tenant default dari `AWCMS_API_URL`** — ditolak: origin tidak memberi tahu apa pun tentang tenant, dan menyimpulkan yang tidak diketahui adalah persis pola "nilai yang terbaca seperti konfigurasi dan tidak memutuskan apa pun" yang repo ini berulang kali menulis aturan untuk melawannya.
