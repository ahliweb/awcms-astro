🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0038-kebutuhan-backend-menjadi-modul-di-awcms.md)

<!-- i18n-source-hash: sha256:1988d8f9743cfc66b74f06ba5a758d74aef350848cc34aa85d518c2df5b3778e -->

# ADR-0038 — Kebutuhan backend menjadi MODUL di `awcms`, dan repo ini tetap tanpa backend

- **Status:** Accepted
- **Tanggal:** 14 Agustus 2026
- **Terkait:** [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) (siapa yang boleh punya LAYAR di sini), [ADR-0020](0020-layar-admin-kembali-ke-awcms.md) (layar admin kembali ke `awcms`), [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (token build kelas baca), [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (rute on-demand yang dinyatakan, dan BFF), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (aturan tertulis wajib membawa pemeriksanya), `awcms` [ADR-0070](https://github.com/ahliweb/awcms/blob/main/docs/adr/0070-peran-keluarga-awcms-astro-memikul-publik-dan-admin-user.md) (peran keluarga), `awcms` [ADR-0012](https://github.com/ahliweb/awcms/blob/main/docs/adr/0012-module-admission-and-trusted-registry-boundary.md) (admission modul), `awcms` [ADR-0092](https://github.com/ahliweb/awcms/blob/main/docs/adr/0092-machine-credentials-may-write.md) (kredensial mesin boleh menulis), `awcms` [ADR-0094](https://github.com/ahliweb/awcms/blob/main/docs/adr/0094-a-data-subject-is-answered-per-tenant.md) (tiap tabel menjawab pertanyaan subjek data)

## Konteks

Bahwa `awcms` adalah backend repo ini tertulis di mana-mana: di baris pertama
[`README.md`](../../README.md), di §Apa repo ini pada
[`AGENTS.md`](../../AGENTS.md), di tabel peran keluarga, dan di `role` manifest
keluarga sisi `awcms` yang berbunyi repo ini "never being a source of truth".

Semua kalimat itu **negatif**, dan negatif tidak pernah memberi alamat. Tidak
satu pun mengatakan apa **satuan** sebuah kebutuhan backend, ke mana ia pergi,
atau bagaimana seseorang tahu ia sedang membangun satu.

[ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) menjawab
pertanyaan yang berdekatan tetapi bukan yang ini: ia memutuskan **siapa yang
boleh punya layar di sini** — publik sebagai fungsi utama, admin USER bila
dinyatakan, admin SISTEM tidak pernah. Ia tidak menjawab **di mana sebuah
kemampuan baru dibangun**, dan pertanyaan itu datang lebih dulu: sebuah layar
menggambar sesuatu yang sudah ada.

### Kenapa ini butuh keputusan, bukan sekadar dianggap jelas

Karena bentuk pelanggarannya bukan pembangkangan; ia langkah paling masuk akal
yang tersedia.

Sebuah situs turunan butuh formulir kontak yang tersimpan, langganan buletin,
direktori anggota, atau penghitung unduhan. Kebutuhannya nyata dan tampak kecil.
Yang paling dekat dari tempat orang itu berdiri adalah satu rute di sini plus
satu tabel "sementara" di suatu tempat — dan **setiap gerbang repo ini tetap
hijau**: tidak satu pun memeriksa kelas dependency,
[`tests/peran-situs.test.mjs`](../../tests/peran-situs.test.mjs) hanya menuntut
rute on-demand **dinyatakan** (bukan bahwa ia tidak memiliki data), dan
`bun run audit:konten` membaca keluaran build, tempat sebuah tabel tidak muncul.

Biayanya bukan kerapian arsitektur. Data yang lahir di sini lahir **di luar**
seluruh mesin yang keluarga ini bangun untuknya: di luar RLS, di luar katalog
izin, di luar jejak audit dan atribusi dua sisinya, di luar deskriptor retensi,
dan — sejak 13 Agustus 2026 — di luar deskriptor subjek data yang `awcms`
gerbangi lewat `subject-data:coverage:check` (`awcms` ADR-0094). Sebuah tabel
yang tidak pernah lewat admission modul adalah tabel yang **tidak bisa menjawab
"apa yang kalian simpan tentang saya"**, dan tidak seorang pun akan tahu ia
tidak bisa: gerbang kelengkapan di sana hanya melihat tabel yang ada di sana.

## Keputusan

### 1. Satuan sebuah kebutuhan backend adalah MODUL di `awcms`

Bukan folder di sini, bukan "servis kecil di sebelah", bukan tabel di basis data
yang kebetulan sudah ada.

Alamatnya konkret dan sudah punya tata kelolanya: modul mendarat di `src/modules/`
milik `awcms`, didaftarkan di registry-nya, lewat admission modul (`awcms`
ADR-0012 dan
[21_module_admission_governance.md](https://github.com/ahliweb/awcms/blob/main/docs/awcms/21_module_admission_governance.md)
di sana).

**Kenapa alamatnya yang menentukan, bukan sekadar "di repo sebelah":** kewajiban
keluarga menempel pada **modul**, bukan pada kode. Sebuah modul membawa
deskriptornya, izinnya di katalog, tabelnya di bawah RLS, jejak auditnya,
deskriptor retensinya, dan sejak `awcms` ADR-0094 juga deskriptor subjek
data-nya. Tidak satu pun dari kewajiban itu punya tempat untuk menempel pada kode
yang tinggal di repo ini — bukan karena dilarang, melainkan karena mesinnya tidak
ada di sini dan tidak akan dibangun di sini.

Konsekuensi urutan kerjanya sudah tertulis dan tidak berubah: **`awcms` dulu,
selalu** ([ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
§4).

### 2. Apa yang dihitung "backend", dan apa yang tetap boleh di sini

Definisi yang bisa dipakai memutuskan, bukan slogan. Sebuah pekerjaan adalah
backend bila ia melakukan salah satu dari ini:

- **menyimpan atau menjadi otoritas** atas data yang bukan berkas di repo ini;
- **memutuskan izin** — siapa boleh apa;
- **menjalankan aturan bisnis** yang benarnya tidak boleh bergantung pada situs
  mana yang memanggilnya;
- menyentuh apa pun yang **lintas-tenant**;
- menyediakan permukaan yang dipanggil **pihak selain situs ini sendiri**.

Yang **tetap** di sini, dan bukan pengecualian melainkan hal yang berbeda:

| Tetap di sini | Kenapa ia bukan backend |
| --- | --- |
| [`server/penyaji.mjs`](../../server/penyaji.mjs) | Menyajikan berkas statis dan mengirim header. Ia tidak memiliki data, tidak memutuskan izin, dan mati-hidupnya tidak mengubah kebenaran apa pun |
| Pembacaan saat build ([`src/lib/awcms/client.ts`](../../src/lib/awcms/client.ts)) | Menyalin apa yang sudah benar di `awcms` ke berkas statis. Salinannya kedaluwarsa, dan itu memang sifat yang dinyatakan (ADR-0018) |
| BFF portal Jualanku ([ADR-0014](0014-rendering-campuran-dan-bff-portal.md)) | **Merangkai** panggilan `awcms` untuk layar situs ini sendiri. Ia tidak memiliki satu baris data pun, dan tidak boleh mulai memilikinya |

Baris ketiga adalah yang paling mudah bergeser, jadi batasnya ditulis sekali
lagi dengan kata lain: BFF boleh **memanggil, merangkai, dan menyembunyikan
kredensial**; ia tidak boleh **menyimpan, memutuskan, atau menjadi rujukan
terakhir**. Cache tulis adalah kepemilikan data dengan nama lain.

### 3. Repo ini MEMBACA `awcms`; ia tidak menulis

Sampai 13 Agustus 2026 kalimat itu tidak perlu dijaga siapa pun: kredensial mesin
tidak bisa menulis, titik. `awcms` ADR-0092 mencabut sifat kelas itu — kelas
tulis kini ada — sehingga "build ini tidak bisa mengubah apa pun" berubah dari
jaminan yang diwarisi menjadi **properti yang harus dijaga di dua sisi**:

- di sisi `awcms`, saat **penerbitan** token (banner
  [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md), dan
  [`.env.example`](../../.env.example) yang menyebut dua kunci baca dan tidak
  satu pun aksi tulis);
- di sisi **kode**, oleh gerbang §4 di bawah.

Satu konsekuensi disengaja dan disebut sekarang supaya tidak terbaca sebagai
cacat kelak: **hari BFF ADR-0014 mendarat, gerbang itu merah.** Jalur tulis dari
repo ini adalah keputusan yang harus **dinyatakan** — kredensialnya kelas yang
berbeda, dengan CIDR wajib, penolakan fail-closed saat alamat pemanggil tidak
diketahui, dan umur maksimum 30 hari (`awcms` ADR-0092). Merahnya gerbang itu
yang memaksa keputusannya ditulis alih-alih diselundupkan sebagai satu opsi
`fetch`.

### 4. Pemeriksanya mendarat bersama aturannya

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) berlaku penuh.
[`tests/tanpa-backend.test.mjs`](../../tests/tanpa-backend.test.mjs), empat
asersi, masing-masing dibuktikan merah lewat mutasi sebelum mendarat:

| Asersi | Cacat yang dijaganya |
| --- | --- |
| Tidak ada dependency **kelas backend** di [`package.json`](../../package.json) — driver basis data, ORM/query builder/alat migrasi, framework server, klien antrean/cache berbagi, dan pustaka sesi/kata sandi/penerbitan token | Satu `bun add` adalah seluruh jarak antara template ini dan sebuah backend. Tidak ada gerbang lain di repo ini yang membaca dependency menurut KELASNYA |
| Tidak ada `fetch` ber-`method` selain `GET` di `src/` dan `scripts/` | §3 — jalur tulis yang mendarat tanpa dinyatakan |
| Tidak ada artefak persistensi: berkas `.sql`, direktori migrasi, konfigurasi ORM | Skema yang mendarat sebelum kodenya, lalu "sudah terlanjur ada" menjadi argumen |
| `AGENTS.md` masih menyebut aturan ini | Kontrak kerja yang menua menjadi salah adalah yang membuat pekerjaan berikutnya mendarat di repo yang keliru — pola yang sama dengan `tests/peran-situs.test.mjs` butir 5, dan itu sudah pernah terjadi di sini (ADR-0020 §Konsekuensi) |

**Yang gerbang ini TIDAK lihat**, dinyatakan supaya tidak dikira terjaga: ia
memeriksa **bentuk**, bukan niat. Sebuah situs turunan yang menyimpan datanya di
layanan pihak ketiga lewat `GET` ke API mereka lolos setiap asersi di atas. Yang
bisa dilakukan sebuah template adalah menutup jalan yang paling mungkin ditempuh
— dan mengatakan mana yang tidak tertutup.

## Ditolak

- **"Backend kecil, khusus situs ini."** Kemampuan yang dipakai lebih dari satu
  situs tinggal di `awcms` **sekali** (`AGENTS.md` §Peran repo ini). Dua salinan
  adalah dua tempat yang harus ditambal, dan yang kedua biasanya tidak ikut
  ditambal. Yang membuat penolakan ini bukan kekakuan: situs "khusus" adalah
  status yang bertahan sampai situs kedua membutuhkan hal yang sama, dan tidak
  ada yang menandai hari itu.
- **Proxy yang "menyimpan sedikit".** Lihat §2: cache tulis adalah kepemilikan
  data dengan nama lain, dan ia menjadi rujukan terakhir pada hari pertama
  `awcms` tidak bisa dihubungi.
- **Membiarkannya sebagai prosa.** Aturan ini sudah berlaku secara moral sejak
  ADR-0020, dan tetap tidak punya satu pemeriksa pun selama itu. Prosa tidak
  memerah.
- **Menggerbanginya lewat daftar-izin (allowlist) dependency.** Setiap paket sah
  yang baru akan menjadi pekerjaan, dan gerbang yang merepotkan pada hal yang
  benar akan dimatikan. Denylist per **kelas** menyatakan apa yang dilarang
  beserta alasannya, dan tetap diam untuk seluruh sisanya.

## Konsekuensi

- Sebuah situs turunan yang butuh kemampuan baru menempuh urutan yang sudah
  tertulis di [`permukaan-admin-user.md`](../awcms-astro/permukaan-admin-user.md)
  §7: pastikan kemampuannya punya modul dan layar pengelolanya di `awcms` lebih
  dulu, sepakati kontraknya di sana, baru gambar layarnya di sini.
- Repo ini menjadi **lebih membosankan dengan sengaja**. Itu tujuannya: sebuah
  template yang bisa menumbuhkan backend adalah template yang setiap turunannya
  menumbuhkan backend yang berbeda.
- **Bukan pembalikan** ADR-0014 maupun ADR-0034. Permukaan terautentikasi tetap
  boleh ada bila dinyatakan; yang diputuskan di sini adalah apa yang boleh ada
  **di belakangnya**.
- Menambah permukaan `awcms` yang dipanggil tetap memerahkan
  [`tests/kontrak-awcms.test.mjs`](../../tests/kontrak-awcms.test.mjs), dan
  keduanya bekerja ke arah yang sama: yang satu menjaga repo ini tidak menumbuhkan
  backend, yang lain menjaga ia tidak memanggil backend sebelah tanpa kontrak.

## Hubungan dengan `awcms`

Keputusan ini **tidak** menciptakan divergence baru, jadi tidak ada entri yang
perlu diminta di manifest keluarga sana (`awcms` ADR-0068). Manifest itu sudah
menuliskan repo ini "never being a source of truth" pada `role`-nya sejak
`awcms` ADR-0070.

Yang baru bukan kalimatnya, melainkan bahwa kalimat itu akhirnya punya **alamat**
(modul, lewat admission `awcms` ADR-0012) dan **pemeriksa** di sisi ini.
