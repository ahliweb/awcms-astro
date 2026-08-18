🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](AGENTS.md)

<!-- i18n-source-hash: sha256:aa50e9a3820e6d5553f10d09688ffaca28f3718fdf6dbb614896703f5ed7e7e2 -->

# AGENTS.md — kontrak kerja `awcms-astro`

Berlaku untuk manusia maupun agen AI yang bekerja di repo ini. Kalau sebuah
aturan di sini bertabrakan dengan kebiasaan umum, aturan di sini yang menang —
setiap butir ditulis karena pelanggarannya pernah atau pasti menimbulkan cacat
yang terlihat pembaca.

## Apa repo ini

Template keluarga AWCMS di Astro dengan
[`ahliweb/awcms`](https://github.com/ahliweb/awcms) sebagai backend konten dan
system of record. Situs publiknya **statis**: konten ditarik saat **build**,
bukan saat request. Yang tinggal seluruhnya di `awcms` adalah layar admin
**SISTEM** — modul, peran, tenant, jejak audit, apa pun yang lintas-tenant —
bukan setiap layar yang meminta pembacanya masuk (§Peran repo ini).

Permukaan terautentikasi yang direncanakan di sini karena itu ada **dua pintu**,
dan keduanya belum ada kodenya: BFF portal Jualanku (ADR-0014), dan permukaan
admin USER yang sebuah situs nyatakan lewat `permukaanAdmin`
([ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)).
Template ini sendiri menyatakan nol permukaan terautentikasi, dan `bun test`
yang membuktikannya.

Dan sebuah layar selalu menggambar sesuatu yang **sudah ada**, jadi ada satu
pertanyaan yang datang lebih dulu daripada §Peran repo ini: di mana sebuah
kemampuan baru dibangun. Jawabannya
[ADR-0038](docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md) —
**kebutuhan backend menjadi MODUL di `awcms`**, tidak pernah folder di sini.

## Peran repo ini (berlaku 8 Agustus 2026 — ADR-0034)

**Fungsi UTAMA repo ini — dan setiap situs yang lahir darinya — adalah HALAMAN
PUBLIK.** Itu keadaan asalnya dan tetap keadaan utamanya: template ini
menyatakan nol permukaan terautentikasi, dan `bun test` merah kalau ada rute
yang menyelinap ke luar dari `output: 'static'` tanpa dinyatakan.

**Selain fungsi utama itu, sebuah situs boleh MENYATAKAN dirinya juga membawa
halaman admin untuk USER.** Sejak
[ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
itu diperbolehkan, lewat satu pintu: `permukaanAdmin` di
[`src/config/site.ts`](src/config/site.ts). Kosong berarti publik saja.

**Admin untuk USER, bukan ADMIN UTAMA.** Ini batasnya, dan ia bukan nuansa.
Yang boleh tinggal di sini adalah permukaan yang dipakai seorang pengguna
untuk mengerjakan bagiannya sendiri di situs INI — menulis artikel,
mengirimnya untuk ditinjau, mengurus profilnya. Yang tidak pernah boleh
tinggal di sini adalah **admin utama**: layar yang mengelola SISTEM — modul,
peran, tenant, jejak audit, apa pun yang platform-scoped — dan itu tetap di
`/admin/*` milik `awcms` (`awcms` ADR-0051 **sebagaimana dipersempit** `awcms`
ADR-0070).

**`owner` karena itu tidak pernah ada di sini.** Ia super-manajer sistem
lengkap. Yang boleh dinyatakan hanya peran **di bawah** owner.

Kolom kedua tabel di bawah adalah **apa yang dikelola**, bukan siapa yang
memakainya. Sumbu itu dipilih `awcms` ADR-0070 justru untuk menggantikan sumbu
audiens, dan bedanya menentukan: seorang `owner` yang menulis artikel sedang
melakukan pekerjaan USER, sementara seorang penulis yang bisa menyunting daftar
peran tidak — apa pun nama jabatannya.

| Repo          | Peran frontend                                                     | Apa yang dikelola di sana                                |
| ------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| `awcms`       | frontend publik + **admin utama** sistem lengkap, termasuk `owner`   | SISTEM: modul, peran, tenant, jejak audit, apa pun lintas-tenant |
| `awcms-astro` | **halaman publik sebagai fungsi utama**; opsional admin USER di sebelahnya + BFF | isi SATU situs: menulis, mengajukan tinjauan, profil sendiri |

Lima aturan yang membuat pengecualian itu bukan lubang — bernomor dari 0 karena
yang pertama bukan syarat tambahan melainkan keadaan yang keempat lainnya jaga:

0. **Publik tetap fungsi utamanya.** Menyatakan permukaan admin tidak mengubah
   situs ini menjadi aplikasi admin dengan brosur publik menempel padanya.
   `permukaanAdmin.prefiks` karena itu tidak boleh `/`, tidak boleh prefiks
   locale, dan tidak boleh slug sebuah tab — ketiganya menaruh bagian publik di
   belakang login, dan situsnya tetap terbangun hijau: seluruh halamannya ada,
   dan setiap satu di antaranya kini meminta pembacanya masuk lebih dulu.

1. **Ia harus DINYATAKAN, tidak boleh muncul.** Satu berkas rute dengan
   `export const prerender = false` sudah cukup untuk menegakkan permukaan
   terautentikasi di domain yang pemiliknya tidak pernah memutuskan untuk
   memilikinya — dengan build hijau. `tests/peran-situs.test.mjs` menolak rute
   on-demand yang prefiksnya tidak ada di `permukaanAdmin.prefiks` maupun di
   prefiks BFF Jualanku ADR-0014.
2. **Menyatakannya tidak memindahkan satu izin pun.** RBAC/ABAC default-deny
   `awcms` tetap yang memutuskan setiap permintaan. Deklarasi di sini menggambar
   tombol; ia tidak memberi apa pun, dan peran yang ditolak `awcms` tetap
   ditolak dengan tombolnya terpampang. Ini butir ADR-0017 yang ADR-0020
   pertahankan, dan ia yang membuat ADR-0034 bukan pembalikan ADR-0020:
   **yang memindahkan risiko adalah gerbang otorisasi, bukan alamat repo tempat
   tombolnya digambar.**
3. **`owner` ditolak gerbang, bukan hanya oleh kalimat ini.** `permukaanAdmin.peran`
   yang memuatnya memerahkan `bun test`.
4. **Tidak ada fitur yang HANYA ada di sini.** Setiap fitur yang dipakai user di
   permukaan admin situs ini **wajib juga bisa dikelola `owner`** lewat
   `/admin/*` milik `awcms`. Aturan ini berlawanan arah dengan butir 3 dan
   justru karena itu melengkapinya: butir 3 menjaga `owner` tidak bisa MASUK ke
   sini, butir ini menjaga tidak ada apa pun di sini yang LEPAS dari `owner`.
   Konsekuensinya menentukan urutan kerja — **`awcms` dulu, selalu.** Fitur yang
   mendarat di sini lebih dulu adalah fitur yang untuk sementara tidak bisa
   dimatikan siapa pun.

**Template ini memang dimaksudkan tumbuh menjadi banyak variasi.** Tiap situs
turunan punya permukaan publiknya sendiri dan, bila dinyatakan, permukaan admin
user-nya sendiri, sesuai kebutuhan pengelolaan fitur penggunanya. Yang
bervariasi adalah **bentuk permukaannya**, bukan kumpulan kemampuannya: dua
situs boleh sangat berbeda dalam apa yang mereka tampilkan dan bagaimana, dan
keduanya tetap berdiri di atas kemampuan yang sama — yang dimiliki, diizinkan,
diaudit, dan bisa dicabut oleh `awcms`.

**Satu `awcms`, banyak situs.** Sebuah instans `awcms` boleh memiliki banyak
repo situs sekaligus, masing-masing dengan halaman publiknya sendiri dan
opsional halaman admin user-nya sendiri; semuanya tetap merujuk `awcms` yang
sama sebagai **backend** dan sebagai **admin utama (`owner`)**. Repo yang sedang
kamu sunting karena itu bukan "sistemnya" — ia satu wajah dari satu sistem.
Jangan pernah menulis kode yang mengandaikan situs ini satu-satunya, dan jangan
menyalin sebuah kemampuan ke beberapa situs: kemampuan yang dipakai lebih dari
satu situs tinggal di `awcms` SEKALI. Dua salinan adalah dua tempat yang harus
ditambal, dan yang kedua biasanya tidak ikut ditambal.

Aturan sebelumnya (ADR-0017, 31 Juli 2026) menaruh layar owner/internal di sini.
Ia **di-supersede** ADR-0020 — bukan karena jalurnya buntu, melainkan karena
memindahkan layar tidak pernah menjadi kontrol keamanan yang diklaimkan. Batas
itu **tidak dicabut** ADR-0034: yang dibuka hanya admin SITUS untuk peran
non-owner; admin SISTEM tetap milik `awcms`.

Satu permukaan terautentikasi lain tetap direncanakan di sini, dan ia bukan
admin: **BFF portal Jualanku** (ADR-0014, `awcms` ADR-0045). Empat aturan
berikut mengikat **setiap** permukaan terautentikasi di repo ini — BFF maupun
admin situs — dan dipindahkan utuh dari ADR-0017 karena keempatnya menyangkut
permukaan terautentikasi apa pun, bukan khusus layar admin:

1. **`awcms` tetap system of record.** Repo ini tanpa basis data; datanya datang
   dari `/api/v1/*` lewat BFF. Browser tidak pernah memanggil `awcms` langsung
   dan tidak pernah memegang kredensialnya.
2. **Izin tidak pindah bersama layar** — RBAC/ABAC default-deny milik `awcms`
   tetap yang memutuskan. Permukaan di sini bukan jalur kedua yang lebih longgar.
3. **Tidak ada cache bersama** antara permukaan publik dan permukaan
   terautentikasi.
4. Setiap penambahan di permukaan terautentikasi dinilai sebagai **permukaan
   keamanan**, bukan sekadar halaman.

Butir 4 punya satu akibat yang pantas disebut namanya, karena ia berbentuk
premis yang gugur alih-alih aturan yang dilanggar: **alasan resmi repo ini tidak
mengirim `Cross-Origin-Opener-Policy` dan `Cross-Origin-Resource-Policy` adalah
"tidak punya sesi untuk dipagari"** (`awcms` ADR-0069, dicatat sebagai
divergence keluarga ber-`reviewDate` 2027-02-04). Situs pertama yang menyalakan
`permukaanAdmin` membatalkan premis itu, dan bersamanya alasan penolakan SRI —
"tidak ada sumber daya lintas-origin". Keduanya wajib ditinjau ulang di
[`server/penyaji.mjs`](server/penyaji.mjs) sebelum permukaan itu tayang. Repo
template ini tidak bisa menggerbanginya: ia tidak punya situs yang menyalakannya,
dan menuliskannya sebagai "digerbangi" akan menjadi klaim yang tidak bisa
dipertanggungjawabkan.

Dua kontrak yang dulu memblokir permukaan itu — header tenant dan kredensial
mesin yang bisa dipegang BFF — **sudah mendarat** di `awcms` (ADR-0049 dan
ADR-0050, 1 Agustus 2026). Yang belum: implementasinya di sini, dengan
prasyarat di [`04-kesiapan.md`](docs/awcms-astro/jualanku/04-kesiapan.md).

**Dan kontrak sesi itu bergerak lagi sejak 12 Agustus 2026, jadi jangan
membangun di atas ingatan.** Perubahan `awcms` yang menentukan bentuk permukaan
mana pun yang meminta orang masuk: satu manusia kini punya SATU kredensial
untuk banyak tenant dan penghitung lockout-nya **global** (ADR-0085, ADR-0086),
faktor MFA pindah ke principal sehingga reset oleh admin tenant lain ikut
mematikan authenticator pengguna situs ini (ADR-0087), dan login tanpa tenant
terpilih dijawab `409` beserta token seleksi berumur pendek alih-alih sesi
(ADR-0088). Dua endpoint pemilihan/perpindahan tenant itu **di luar** kontrak
konsumen beku `awcms` ADR-0065 — memanggilnya berarti menyepakati kontraknya
lebih dulu di sana, bukan menambahkannya di sini. Sesi hasil serah-terima
(`handoff`) — persis mekanisme BFF ADR-0050 — **dilarang** berpindah tenant.

## Kebutuhan backend menjadi MODUL di `awcms` (berlaku 14 Agustus 2026 — ADR-0038)

§Peran repo ini menjawab **siapa yang boleh punya layar** di sini. Bagian ini
menjawab pertanyaan yang datang lebih dulu — **di mana sebuah kemampuan
dibangun** — dan jawabannya satu kalimat:
[ADR-0038](docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md) memutuskan
bahwa **satuan sebuah kebutuhan backend adalah MODUL di `awcms`**: mendarat di
direktori modul repo itu, terdaftar di registry-nya, lewat admission modul
(`awcms` [ADR-0012](https://github.com/ahliweb/awcms/blob/main/docs/adr/0012-module-admission-and-trusted-registry-boundary.md)).
Bukan folder di sini, bukan "servis kecil di sebelah".

Yang membuat alamatnya menentukan: **kewajiban keluarga menempel pada modul,
bukan pada kode.** Modul membawa deskriptornya, izinnya di katalog, tabelnya di
bawah RLS, jejak auditnya, deskriptor retensinya, dan sejak `awcms` ADR-0094
juga deskriptor subjek datanya — kelengkapan yang digerbangi di sana. Tidak satu
pun kewajiban itu punya tempat menempel pada kode yang tinggal di repo ini.

Sebuah pekerjaan adalah **backend** bila ia menyimpan atau menjadi otoritas atas
data yang bukan berkas repo ini, memutuskan izin, menjalankan aturan bisnis,
menyentuh apa pun yang lintas-tenant, atau menyediakan permukaan yang dipanggil
pihak selain situs ini sendiri. Yang **tetap** di sini dan bukan pengecualian
melainkan hal yang berbeda: [`server/penyaji.mjs`](server/penyaji.mjs)
(menyajikan berkas dan mengirim header — tidak memiliki data), pembacaan saat
build, dan BFF ADR-0014 yang **merangkai** panggilan `awcms` untuk layar situs
ini sendiri tanpa memiliki satu baris data pun. Cache tulis adalah kepemilikan
data dengan nama lain.

**Repo ini membaca `awcms`; ia tidak menulis.** Sampai 13 Agustus 2026 itu sifat
KELAS kredensial mesin; sejak `awcms` ADR-0092 membuka kelas tulis, ia properti
yang harus dijaga sendiri — di sisi penerbitan token (ADR-0018) dan di sisi kode
oleh [`tests/tanpa-backend.test.mjs`](tests/tanpa-backend.test.mjs). Gerbang itu
menolak dependency kelas backend di `package.json`, `fetch` ber-`method` selain
`GET` di `src/` dan `scripts/`, artefak persistensi, dan hilangnya aturan ini
dari berkas yang sedang kamu baca. Ia memeriksa **bentuk, bukan niat**: situs
yang menyimpan datanya di layanan pihak ketiga lewat `GET` lolos seluruhnya.

## Satu uji sebelum memulai apa pun (berlaku 4 Agustus 2026 — ADR-0027)

**Penahanan ADR-0021 SELESAI.** Kedua indikator yang ADR itu tulis sendiri
terpenuhi pada 3–4 Agustus 2026, dan ia di-supersede
[ADR-0027](docs/adr/0027-penahanan-adr-0021-selesai.md). Fitur, gerbang, dan
dokumen baru boleh mendarat lagi. ADR-0021 tetap dibaca sebagai catatan sejarah
— ia menjelaskan kenapa repo ini diam selama dua hari, dan alasannya benar saat
ditulis.

Yang **menggantikannya** adalah satu pertanyaan, diambil utuh dari
[ADR-0023](docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) dan
tidak berubah sedikit pun:

> **Apakah perubahan ini akan ditulis ulang bila `awcms` berubah?**

Yang berubah hanya premisnya. Selama ADR-0021 berlaku, "ya" berarti *ditahan
sampai fondasi selesai*. Sekarang "ya" berarti *butuh instans `awcms` untuk
membuktikan panggilannya benar sebelum mendarat* — batas yang sama, alasan yang
berbeda, dan alasan yang kedua tidak akan pernah kedaluwarsa. Repo template ini
tidak punya instans; itu sebabnya job `build` di CI dikondisikan pada terisinya
`vars.AWCMS_API_URL`.

Batas eksplisit ADR-0023 juga tidak berubah: **"endpoint-nya sudah ada" bukan
jawaban "tidak".**

Yang masih ditahan oleh uji itu, dan oleh apa: **BFF portal Jualanku**
(ADR-0014) memanggil `awcms` di SETIAP permintaan runtime, bukan sekali per
build, jadi bentuknya ditentukan respons `awcms` pada tiap permintaan.

Alasan yang membuat uji ini mahal untuk dilanggar tidak berubah: membangun di
atas kontrak yang belum stabil berarti menulisnya dua kali, dan repo ini sudah
membayarnya sekali — adapter kontennya ditulis untuk daftar ringkasan, lalu
ditulis ulang saat `awcms` mengirimkan build feed (ADR-0018), dan versi
pertamanya menerbitkan situs yang setiap artikelnya kosong dengan build hijau.

## Di mana pekerjaan boleh mendarat (berlaku 2 Agustus 2026)

**Keluarga AWCMS adalah dua repo, dan hanya dua** (`awcms` ADR-0055):

| Repo                  | Peran                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `ahliweb/awcms`       | **System of record** — seluruh permukaan otorisasi, seluruh API, dan seluruh layar admin **SISTEM** (`awcms` ADR-0051 + ADR-0070) |
| `ahliweb/awcms-astro` | **Halaman publik sebagai fungsi utama**, dan **permukaan admin USER** bila situsnya menyatakannya ([ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md), `awcms` ADR-0070); tetap experience layer + BFF, dan **tak pernah sumber kebenaran** |

Pasangan keduanya adalah **pengganti multiguna** dari ketiga template lama —
bukan salah satunya sendirian.

**Kosakata URL publik dibelah, satu keluarga rute per repo** — dan pembelahan
itu berlaku dua arah, jadi ia juga aturan tentang apa yang TIDAK boleh dibangun
di sini:

| Kosakata   | Repo yang melayani | Bentuknya di sana                                                                       |
| ---------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `/blog/**` | `ahliweb/awcms`    | `/{locale}/blog/{tenantCode}/**` sejak ADR-0098 di sana — path-scoped, dengan locale DAN kode tenant di dalam path. `/blog/{tenantCode}/**` telanjang tidak merender apa pun dan menjawab `307` |
| `/news/**` | repo ini           | sebuah **tab** ber-slug `news` yang menyatakan `urutanSeksi: "terbaru"` — bukan keluarga rute baru |

Baris pertama itulah sebabnya separuh kedua aturan ini akhirnya punya pemeriksa.
URL publik kanonik `awcms` kini berbentuk persis seperti `/{lang}/{tab}/…` milik
repo ini sendiri, jadi tab ber-slug `blog` bukan sekadar mirip dengan kosakata
repo sebelah — ia bertabrakan huruf per huruf dengannya, pada build yang hijau.
[`tests/kosakata-news.test.mjs`](tests/kosakata-news.test.mjs) menolak tiga
bentuk: tab yang mengklaim slug itu, entri `permukaanAdmin.prefiks` di bawah
`/blog`, dan berkas rute yang menuliskan segmennya secara harfiah
([ADR-0041](docs/adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md)).
Aturannya soal alamat, bukan soal katanya — `/blog-panduan/` adalah URL milik
repo ini sendiri dan tidak bertabrakan dengan apa pun.

Jangan membangun `/blog/**` di sini, dan jangan mengandaikan `awcms` masih
melayani `/news/**`: keempat rutenya **dihapus** di sana pada 8 Agustus 2026 dan
kini 301 ke `/blog/{tenantCode}/**` — **kecuali** untuk tenant ber-`legacyTenantRouteEnabled: false`, yang sudah mematikan seluruh permukaan konten publiknya dan karena itu tetap dijawab 404 alih-alih diberi 301 menuju 404 yang pasti (`awcms` ADR-0071 §4 butir 3)
([ADR-0036](docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md),
`awcms` ADR-0071 yang men-supersede `awcms` ADR-0059). Sejak 15 Agustus 2026
301 itu adalah **lompatan pertama dari dua**: ia mendarat di
`/blog/{tenantCode}/…` telanjang, yang menjawab `307` ke URL berprefiks locale.
Yang dibelah adalah **URL**, bukan kepemilikan konten: modulnya sama, layar pengelolanya sama, dan
repo ini tetap tidak menyimpan satu pun artikel.

`news` di sini **bukan** kata yang dipesan — ia slug tab yang dipilih situs, dan
template ini tidak membawanya. Gerbangnya
[`tests/kosakata-news.test.mjs`](tests/kosakata-news.test.mjs): sebuah tab
ber-slug `news` yang dibiarkan `urutanSeksi: "manual"` memerahkan `bun test`.

**`ahliweb/awcms-mini` dan `ahliweb/awcms-micro` adalah ARSIP.** Bukan standar,
bukan sumber port, bukan template keluarga. Boleh dibaca sebagai referensi
sejarah — sama seperti membaca commit lama — tetapi **tidak ada pekerjaan yang
dijadwalkan "di-port dari" sana**, dan tidak ada yang dijadwalkan "di-port
keluar" ke sana. Kemampuan yang diinginkan **dibangun** di repo yang memilikinya,
dengan ADR-nya sendiri.

> **Ini menggantikan pembekuan 31 Juli 2026, dan tiga kalimatnya yang sudah
> tidak berlaku layak disebut supaya tidak dipakai lagi:**
>
> - "di-port keluar boleh" — jalur itu **ditutup** `awcms` ADR-0055 §1, yang
>   men-supersede `awcms` ADR-0047.
> - "pembekuan ini **sementara**" — ia tidak sementara. Tidak ada rencana
>   pencabutan, dan tidak ada repatriasi ke hulu yang menunggu diputuskan.
> - "`awcms/AGENTS.md` mensyaratkan fitur fondasi diuji dulu di `awcms-mini`" —
>   aturan mini-first **dicabut**, bukan ditangguhkan (`awcms` ADR-0055 §1).
>   Fitur fondasi dirintis langsung di `awcms`, dan itu kini jalur yang benar
>   alih-alih pengecualian.
>
> Yang **tetap** berlaku dari aturan lama: menghapus satu rute bukan menghapus
> penjagaannya. Review keamanan untuk modul auth/access, ADR untuk perubahan
> standar, dan gate `family:conformance:check` di sana semuanya utuh.

**Selisih antar-repo dicatat, bukan diingat.** Sebuah keputusan di sini yang
menyimpang dari kontrak `awcms` masuk ke `awcms-family-compatibility.yaml` sana
sebagai entri ber-`owner` dan ber-`reviewDate` (`awcms` ADR-0068). Repo ini tidak
bisa menulisnya sendiri — yang bisa dilakukan di sini adalah **menyatakan
selisihnya di ADR-nya dan mengatakan bahwa ia perlu dicatat di sana**, persis
yang [ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
§Hubungan lakukan dan yang `awcms` ADR-0070 jawab.

## Alur kerja wajib

1. Satu iterasi = satu scope atomic. Selesaikan dan validasi sebelum pindah.
2. Buat branch dari `main` sebelum menyentuh kode. Jangan commit langsung ke
   `main`.
3. `bun run build` harus bersih sebelum pekerjaan dinyatakan selesai. `build`
   sudah mencakup `astro check`; melewatinya adalah penyebab tersering "hijau
   lokal, merah di CI".
4. Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
5. Perubahan yang mengubah perilaku wajib memperbarui dokumen yang menjelaskan
   perilaku itu — di repo ini dokumentasi adalah bagian dari produk, bukan
   pelengkap.

## Aturan yang tidak bisa dilanggar

### Sumber data

- **`src/lib/awcms/client.ts` adalah satu-satunya berkas yang boleh menghubungi
  awcms.** Komponen menerima data lewat props dan tidak pernah mengambilnya
  sendiri. Inilah yang membuat sumber data bisa diganti tanpa menyentuh satu
  komponen pun — dan itu bukan teori: repo asalnya membaca markdown dari disk,
  dan lapisan rendernya tidak berubah sedikit pun saat pindah ke API.
- **Empat aturan di `src/lib/content.ts` tidak boleh dilonggarkan**: kumpulan
  slug ditentukan locale default, `isFallback` dihitung adapter, urutan dari
  field yang dinyatakan, dan hanya post yang awcms sendiri sajikan publik yang
  masuk build. Masing-masing menjaga satu cacat spesifik tetap mustahil;
  alasannya ditulis di berkas itu.
- **Urutan seksi datang dari field EKSPLISIT, dan field mana adalah milik
  seksinya** (ADR-0033). `urutanSeksi: "manual"` membaca `urutan` yang ditulis
  redaksi; `"terbaru"` membaca `publishedAt` menurun, paritas dengan
  `ORDER BY published_at DESC` pada rute publik awcms. Keduanya berakhir pada
  slug sumber sebagai pemecah seri — comparator yang mengembalikan 0 menyerahkan
  pasangannya pada urutan yang kebetulan dikembalikan API, dan itu persis yang
  aturan ini larang. Jangan mengurutkan dari nilai yang dibaca post TERJEMAHAN:
  seksi yang sama akan berjalan dalam urutan berbeda di setiap bahasa.
- **`publishedDate` dan `updatedDate` adalah dua klaim, dibaca dari SATU baris
  awcms** (ADR-0033). Keduanya pernah dilipat menjadi `publishedAt ?? updatedAt`
  di bawah satu nama, sehingga `dateModified` membeku di tanggal terbit
  selamanya dan tidak ada satu halaman pun yang bisa melaporkan koreksi. Jangan
  memasangkan tanggal terbit post sumber dengan tanggal ubah terjemahannya:
  hasilnya `dateModified` mendahului `datePublished` pada konten yang sah, dan
  crawler membuang blok yang menyatakan itu.
- **Diam-diam memotong data adalah kegagalan, bukan optimasi.** Adapter
  menyusuri SELURUH daftar dengan cursor keyset; batas halaman bukan batas
  konten. Kalau sesuatu menghalangi kelengkapan — cursor yang tidak maju,
  terjemahan yang tidak bisa dipasangkan — **lempar error**, jangan bangun situs
  yang terlihat berhasil sambil kehilangan artikel.
- **Daftar post awcms mengembalikan RINGKASAN kecuali diminta `view=full`.**
  `contentJson`, `excerpt`, `metaDescription`, `canonicalUrl`, dan
  `translationGroupId` hanya ikut pada `view=full` (yang mensyaratkan
  `order=created_at`). Membaca salah satunya dari respons ringkasan tidak
  error — ia `undefined`, dan karena `kategori` tinggal di dalam
  `contentJson`, seluruh seksi situs menjadi kosong dengan build tetap hijau.
  Itu pernah terjadi di repo ini (ADR-0018), jadi jangan melepas parameter itu
  "karena daftarnya toh sudah jalan".
- **Tenant datang dari token, dan `AWCMS_TENANT_ID` adalah assertion.**
  Jangan mengembalikannya menjadi rantai resolusi, dan jangan mengirim header
  tenant: awcms menurunkan tenant dari kredensial mesin dan mengabaikan header
  yang berbeda. Yang dijaga assertion itu bukan "build menebak tenant" —
  melainkan token tenant lain yang terpasang di situs ini, yang tampak persis
  seperti build yang sehat.
- **Satu penolakan awcms diputuskan SEBELUM izin dicari, jadi memperluas scope
  token tidak menolong sama sekali.** `403 TENANT_SUSPENDED` (dengan
  `matchedPolicy: "tenant_suspended"`) mengenai tenant ber-status `suspended`
  **maupun** `inactive`, dan sejak `awcms` ADR-0073 ia berlaku untuk kredensial
  mesin juga — bukan hanya sesi manusia. Ia menggagalkan build **total** — nol
  berkas terbit — dan terbaca persis seperti token yang dicabut. Bedanya
  menentukan apa yang harus dikerjakan: token dicabut diperbaiki dengan
  menerbitkan token baru, sementara penolakan ini tidak bisa diperbaiki dari
  repo ini sama sekali. `403 ENTITLEMENT_REQUIRED` (`awcms` ADR-0084) punya
  bentuk yang sama tetapi **belum bisa mengenai build ini**: entitlement
  diputuskan per modul, dan tidak satu pun modul di balik ketiga permukaan yang
  dipanggil build mendeklarasikannya.
- **Dan sejak 13 Agustus 2026 ada penolakan kedua yang bentuknya sama, tetapi
  yang ini BISA mengenai build — bergantung pada siapa yang menerbitkan
  tokennya.** `403 PARTNER_SUSPENDED` (`matchedPolicy: "partner_suspended"`,
  `awcms` ADR-0093) menolak setiap aktor **terdelegasi** yang partnernya tidak
  lagi `active`, dievaluasi di chokepoint pada tiap permintaan. Kredensial mesin
  mewarisi `principal_kind` akun layanannya, dan tidak ada apa pun di jalur
  penerbitan `awcms` yang melarang akun layanan itu berupa **tenant user
  terdelegasi** — pemilih akun layanannya mendaftar setiap tenant user tanpa
  menyaring jenisnya. Yang memilih pasti admin tenant situs, bukan agensinya
  sendiri: aktor terdelegasi tidak bisa menulis apa pun di modul
  `identity_access` (`awcms` ADR-0090), termasuk menerbitkan kredensial. Karena
  itu aturannya operasional, bukan kode: **terbitkan token
  build atas akun layanan milik tenant SITUS**, bukan atas aktor terdelegasi
  seorang partner. Yang kedua berhenti membangun pada hari kemitraannya
  disuspend, dengan pesan yang terbaca persis seperti token dicabut — dan grant
  yang memberinya akses tetap ada, jadi tidak ada yang tampak hilang.
- **Permukaan KEEMPAT keluar dari kontrak sampai sisi awcms menyepakatinya.**
  `awcms` ADR-0065 membekukan bentuk respons permukaan yang repo ini panggil,
  dan daftarnya diturunkan dengan mem-grep repo ini — bukan dari ingatan. Karena
  itu menambah satu panggilan `/api/v1/...` di sini memerahkan
  [`tests/kontrak-awcms.test.mjs`](tests/kontrak-awcms.test.mjs), dan itu
  bekerja sebagaimana mestinya: permukaan yang belum dibekukan di sana adalah
  permukaan yang bentuknya boleh berubah tanpa CI mana pun berbunyi.

### Keamanan

- **Tidak ada jalur HTML mentah dari CMS.** `src/lib/content-blocks.ts` menyusun
  setiap elemen dari teks ter-escape dan tag tetap. Menambahkan tipe blok
  `html`/`raw`/`embed` membatalkan seluruh jaminannya.
- **`set:html` hanya boleh menerima keluaran `renderContentBlocks`.** Jangan
  pernah memberinya string dari sumber lain.
- **Token build tidak pernah ber-prefix `PUBLIC_`.** Astro hanya menyisipkan
  variabel ber-prefix itu ke keluaran klien; token di bundel statis adalah token
  yang diterbitkan ke setiap pembaca.
- **Tidak ada skrip pihak ketiga.** Tanpa SDK, widget, piksel, atau tombol
  berbagi milik penyedia sosial. Berbagi memakai tautan biasa.
- **Tidak ada pengumpulan data pribadi pembaca.** Tanpa form, tanpa analytics
  yang mengikat identitas.
- **Jangan pernah mengiklankan aset yang tidak diterbitkan build ini.**
  `og:image`, `twitter:image`, dan `ImageObject` JSON-LD adalah KLAIM, dan
  klaim yang menunjuk 404 lebih buruk daripada tag yang tidak ada: pratinjau
  tanpa gambar jatuh ke kartu teks yang rapi, pratinjau dengan gambar rusak
  tidak jatuh ke mana pun. Template ini pernah memasang ketiganya di setiap
  halaman, menunjuk `/social/<slug>.png` yang dibangkitkan skrip yang tidak
  pernah ikut ke repo ini. Aset opsional dinyatakan lewat env dan **dilepas
  seluruhnya saat kosong**, bukan diberi nilai default yang menebak.
- **Tidak ada lambang, logo, atau atribut resmi instansi negara** — termasuk di
  dalam ilustrasi.
- **Tidak ada dokumen, kuitansi, nomor registrasi, identitas, atau antarmuka
  aplikasi pemerintah yang direkayasa**, dalam bentuk apa pun termasuk
  ilustrasi. Pembaca bisa menyimpulkan itu rupa yang asli, dan kesimpulan itu
  memudahkan penipuan.

### Penyajian

- **`server/penyaji.mjs` adalah satu-satunya tempat header respons ditentukan**
  (ADR-0016). Lima header keamanan — termasuk `Content-Security-Policy` dan
  `Permissions-Policy` sejak ADR-0019 — dua aturan `Cache-Control`, dan kompresi
  tinggal di sana dan tidak boleh tersebar ke tempat lain — di nginx aturan
  serupa harus di-`include` ulang di setiap `location`, dan melupakannya
  menghasilkan halaman tanpa satu pun header keamanan tanpa ada yang gagal.

  **Yang keenam, `Strict-Transport-Security`, dikirim HANYA di produksi**
  (ADR-0029) dan gerbangnya bukan kerapian: HSTS tidak bisa dibatalkan dari sisi
  situs dan berlaku untuk HOST, jadi satu pratinjau `bun run serve` yang
  mengirimkannya mengunci setiap proyek lain di `http://localhost:<port>` selama
  setahun. Asersi yang menjaganya karena itu **terbalik arah** — yang diuji
  adalah ia TIDAK dikirim di luar produksi. `includeSubDomains` sengaja tidak
  ikut, berbeda dari `awcms`; alasannya di ADR-0029, dan menambahkannya adalah
  keputusan sebuah SITUS, bukan template.

  `Server` dan `X-Powered-By` dihapus di jalur yang sama. Keduanya memang tidak
  dikirim Node hari ini — tetapi "tidak dikirim hari ini" dan "tidak akan
  dikirim" adalah dua hal berbeda.
- **Jangan menulis penyaji berkas sendiri.** Penerjemahan URL menjadi path
  berkas tetap milik adapter `@astrojs/node`. Setiap baris yang melakukannya
  sendiri adalah baris yang bisa keliru menjadi pembacaan berkas arbitrer —
  `..`, path ter-encode ganda, dan symlink adalah kelas cacat yang sudah
  selesai bertahun-tahun lalu di pustaka yang dipakai adapter, dan kegagalannya
  bukan halaman jelek.
- **HTML tidak pernah di-cache lama; aset `/_astro/` selalu `immutable`.**
  Keduanya berperilaku benar secara diam-diam ketika salah: situs tetap tayang,
  hanya rebuild yang sukses tidak pernah terlihat pembaca. Karena itu perubahan
  apa pun pada penyajian wajib lewat `tests/penyaji.test.mjs`.
- **Yang menilai "ini aset atau bukan" harus menormalkan path lebih dulu.**
  `/_astro/../index.html` menyajikan halaman depan; menilainya dari prefiks
  mentah akan menempelkan cache satu tahun pada berkas yang berubah setiap
  rebuild.
- **CSP dilonggarkan di `server/penyaji.mjs`, dan tidak di tempat kedua mana
  pun.** Bukan lewat variabel env, bukan lewat header tambahan di Traefik, bukan
  lewat `<meta http-equiv>`. Yang paling mungkin perlu dilonggarkan sebuah situs
  adalah `img-src` (gambar artikel dari host media awcms) — lakukan di sana,
  lalu perbarui `tests/penyaji.test.mjs`. Dua sumber kebijakan yang saling
  menimpa adalah cara paling sunyi untuk berakhir tanpa kebijakan sama sekali.

### Antarmuka

- **Setiap fungsi inti bekerja tanpa JavaScript.** Navigasi, pengalih bahasa,
  accordion, dan seluruh isi halaman. Yang benar-benar butuh JS disembunyikan
  saat JS mati — kontrol yang diam saat diklik lebih buruk daripada kontrol yang
  tidak ada.
- **Aksesibilitas WCAG 2.1 AA** adalah batas, bukan target: kontras cukup di
  kedua tema, fokus terlihat, navigasi keyboard penuh, `prefers-reduced-motion`
  dihormati. Animasi dekoratif **dimatikan** saat itu diminta, bukan dipercepat
  — aturan `*` global hanya memangkas durasi, dan animasi 0,01 md tetap
  berkedip. Umpan balik hover juga aktif pada `:focus-visible`, sehingga
  pengguna keyboard tidak mendapat versi yang lebih miskin.
- **Mobile-first dari 360px.**
- **String antarmuka lewat katalog PO**, tidak pernah ditulis langsung di
  komponen. Ini berlaku juga bagi label yang datang dari konfigurasi: navigasi
  utama pernah merender nilai HURUF BESAR dari `src/config/site.ts`, sehingga
  permukaan paling terlihat di situs justru satu-satunya yang tidak pernah
  ikut berganti bahasa.
- **Rantai fallback `t()` berujung di NAMA KEY, dan nama key di layar bukan
  "halaman terbaca".** Karena itu setiap key yang mungkin belum ada di katalog
  mana pun — key yang dirangkai dari slug tab, dari kategori biaya, dari apa pun
  yang ditentukan konfigurasi atau redaksi — **wajib** dipanggil dengan argumen
  fallback yang layak dibaca: `t(locale, key, tab.label)`. Repo ini pernah
  menerbitkan `translation.notice.label`, `biaya.jenis.pnbp`, `tab.articleNo`,
  dan `tab.readMoreCta` sebagai teks yang dibaca pembaca, di kedua bahasa,
  dengan `astro check` bersih dan build hijau. `tests/katalog-po.test.mjs`
  sekarang menolak key literal tanpa fallback yang tidak ada di katalog — tetapi
  ia tidak bisa melihat key dinamis, dan di sanalah aturan ini bekerja.
  Lapis terakhirnya ada di keluaran: `scripts/audit-konten.mjs` menandai teks
  layar yang berbentuk key dari namespace katalog situs ini. Di `dist/` sebuah
  key dinamis tidak lagi dinamis — ia teks biasa, dan bisa dilihat.
- **Token desain, bukan nilai lepas.** Tidak ada gaya sekali pakai; komponen
  baru memakai token yang sudah ada di `src/styles/global.css`.
- **Tidak ada atribut `style=""`, dan tidak ada blok `<style>` di dalam HTML.**
  Gaya tinggal di `src/styles/global.css` (bila dipakai lebih dari satu
  komponen) atau di `<style>` scoped milik komponen — yang Astro terbitkan
  sebagai berkas CSS terpisah, bukan disisipkan ke halaman. Keduanya diblokir
  CSP `style-src 'self'`, dan kegagalannya adalah halaman tanpa tata letak
  tanpa satu pun error di build. `build.inlineStylesheets: "never"` yang
  menjaga jalur kedua; `tests/keluaran-csp.test.mjs` memeriksa keluarannya.
  Nilai dinamis yang dulu dikirim lewat `style="--var: …"` ditulis sebagai
  kelas — lihat warna kanal berbagi di `global.css`.
- **Tidak ada JavaScript di dalam HTML** (ADR-0019). Sejak penyaji mengirim
  `script-src 'self'` tanpa `'unsafe-inline'`, skrip inline bukan "kurang rapi"
  — ia mati di browser pembaca. Dua jalur memasukkannya, dan yang kedua tidak
  terlihat di `src/` sama sekali:
  1. `<script is:inline>` berisi kode. Skrip yang harus jalan sebelum paint
     pertama menjadi berkas di `public/` yang dimuat `<script src>` klasik —
     lihat `public/tema.js`. Bundel Astro selalu `type="module"` dan modul
     selalu ditunda, jadi ia bukan pengganti untuk kasus itu.
  2. `<script>` biasa di komponen, yang Astro bundel lalu **sisipkan kembali**
     ke HTML bila chunk-nya lebih kecil dari `assetsInlineLimit`.
     `vite.build.assetsInlineLimit: 0` di `astro.config.mjs` yang menutupnya,
     dan tanpa setelan itu sebuah komponen berhenti patuh hanya karena kodenya
     mengecil — persis pola yang membuat `inlineStylesheets: "never"` perlu.

  Dikecualikan tepat satu: `<script type="application/ld+json">`. Ia blok data,
  bukan skrip — browser tidak pernah mengeksekusinya sehingga `script-src` tidak
  berlaku atasnya, dan memindahkannya ke berkas eksternal hanya membuat mesin
  pencari berhenti membacanya.

### Gambar

Template ini belum membawa satu pun ilustrasi, tetapi bingkainya sudah ada dan
aturan di bawah berlaku sejak gambar pertama dimasukkan situs yang memakainya.

**Dua sumber, dan yang lebih spesifik menang.** `featuredMediaId` di `awcms`
adalah pilihan editor untuk artikel ITU dan dipakai lebih dulu (ADR-0025);
berkas di `src/assets/` adalah cadangan tingkat template. Gambar media
di-resolve **sekali per build** di `content.ts` dan tinggal di
`LocalizedArticle.gambar` — jangan pernah memanggilnya dari komponen.

**Cara memasukkan seni lokal: taruh berkasnya di `src/assets/`, tidak ada
langkah kedua.** Konvensi namanya — relatif terhadap `src/assets/`, tanpa ekstensi —
`hero`, `tab/<tab>`, dan `artikel/<tab>/<slug>`; ekstensi apa pun dari
`EKSTENSI_SENI` berlaku, jadi mengganti `.svg` menjadi `.webp` tidak menyentuh
satu baris kode pun. **Tidak ada fallback dari artikel ke seni seksinya**
(ADR-0024): fallback membuat seluruh artikel satu seksi memakai gambar yang
sama sambil tampak seperti gambar yang dipilih untuknya. Berkas yang tidak ada
merender `.visual-placeholder`, dan itu jujur.

- **Satu rasio untuk seluruh situs, dipakai bingkai maupun sumber.** Nilainya
  `--ratio-visual` di `src/styles/global.css`, saat ini 16∶9. Bingkai memakai
  `object-fit: cover`, jadi sumber berasio lain **tidak** diperkecil — ia
  dipotong, diam-diam, di setiap ukuran layar. Sumber 1∶1 pada bingkai 16∶9
  kehilangan 22% teratas dan 22% terbawah, dan judul gambar hampir selalu ada di
  sana. Repo rujukan kehilangan judul pada sebelas banner sekaligus sebelum ada
  yang menyadarinya, dan tidak ada satu pun build yang gagal karenanya.
- **Mengubah `--ratio-visual` berarti membangkitkan ulang seluruh seni.**
  Mengubahnya hanya di CSS memindahkan potongannya, bukan menghilangkannya.
- **Format dibaca dari isi berkas, bukan dari ekstensinya.** Sebelas berkas di
  repo rujukan ber-ekstensi `.png` padahal isinya JPEG.
- **SVG wajib XML valid.** Satu `&` telanjang membuat browser diam-diam gagal
  merender gambarnya — tanpa satu pun pesan error.
- **Teks di dalam gambar hanya label topik.** Tanpa nominal, tanggal, nomor
  registrasi, nama orang, dokumen tiruan, atau antarmuka aplikasi pemerintah.
  Angka di dalam gambar tidak bisa membawa sumber dan dasar hukumnya, sehingga
  ia lolos dari aturan yang menjaga seluruh angka lain — dan ia tidak ikut
  diperbarui saat tarifnya berubah.
- **Tanpa lambang, logo, atau atribut instansi negara — termasuk di dalam
  ilustrasi.** Situs dari template ini adalah portal independen, dan lambang
  negara di halamannya membantah pernyataan itu dalam satu pandangan.
- **Teks terkecil di dalam SVG minimal 22px pada kanvas 800px.** Pada kartu
  selebar 328px — viewport 360px — kanvas 800px tampil pada skala 0,41, jadi di
  bawah ambang itu teksnya tampil di bawah 9px dan praktis tidak terbaca.
- **`src: undefined` adalah keadaan yang didukung.** Setiap pemanggil merender
  `.visual-placeholder`. Ilustrasi yang hilang tidak boleh menjadi halaman yang
  hilang — maupun bingkai setinggi nol.

Empat aturan di atas kini **diperiksa** `scripts/audit-konten.mjs` atas seluruh
sumber di `src/assets/`: rasio (termasuk `viewBox` SVG), format dibaca dari isi
berkas, `&` telanjang di SVG, dan ukuran teks terkecil. Format yang dimensinya
belum bisa dibaca gerbang itu **dilaporkan sebagai pelanggaran**, bukan
dilewati — gerbang yang melewati apa yang tidak dikenalinya bisa dilewati
dengan mengganti format. Berkas di `public/` sengaja tidak diperiksa rasionya:
favicon wajib bujur sangkar dan kartu share punya ukuran bakunya sendiri.

Dua aturan isi di atas — teks gambar dan lambang instansi — **tidak bisa
diperiksa mesin**. Katakan itu terus terang alih-alih membiarkannya tampak
terjaga; aturan yang tampak terjaga padahal tidak lebih berbahaya daripada
aturan yang jelas-jelas manual.

### Konfigurasi

- **`src/config/site.ts` dan `.env` adalah satu-satunya tempat konfigurasi.**
  Menstandarkan situs baru tidak boleh menuntut penyuntingan komponen. Aturan
  ini yang paling sering dilanggar tanpa disadari, karena pelanggarannya tidak
  pernah gagal — ia hanya menerbitkan identitas situs lain. Yang pernah
  ditemukan tertanam harfiah di kode template ini: nama situs repo rujukan di
  setiap `<title>`, emoji instansi dan lencana wilayah di header, `'id'`
  sebagai `hreflang="x-default"`, peta lima nama tab repo rujukan, nama
  provinsi di pembangun JSON-LD, dan bendera Merah Putih untuk setiap locale
  yang bukan `en`. **Sebelum menulis nilai apa pun yang khas satu situs,
  tanyakan apa yang terjadi bila situs berikutnya memakainya.**
- **Nilai bawaan yang khas satu situs lebih buruk daripada nilai kosong.**
  `SITE_MARK` dan `SITE_SOCIAL_IMAGE` kosong secara bawaan, dan kedua keadaan
  kosong itu dirender penuh.
- **Setiap variabel env yang dibaca kode wajib ada di `.env.example`**, disertai
  penjelasan konsekuensi salah isi — bukan sekadar nama.
- **Bun adalah runtime dan package manager repo ini** (ADR-0015), termasuk di
  produksi: sejak ADR-0016 keluaran build disajikan proses Bun, bukan nginx.
  Versinya dipin di tiga BERKAS dan **lima NILAI** yang wajib bergerak bersama:
  `packageManager` + `engines.bun` di `package.json`, `bun-version` di DUA job
  `.github/workflows/ci.yml`, dan tag image di DUA stage `Dockerfile`.
  Menaikkan salah satu saja membuat build lokal, CI, dan image berbeda perilaku
  — diam-diam.

  Sejak ADR-0030 aturan ini punya pemeriksa: `tests/versi-toolchain.test.mjs`.
  Sebelum itu ia aturan tertulis tanpa gerbang, dan `grep` atas `tests/` maupun
  `scripts/` mengembalikan nol baris — persis bentuk "aturan yang tampak terjaga
  padahal tidak" yang dokumen ini larang di tempat lain.

  **Image dasar juga dipin ke digest**, dan tag tetap ditulis di depannya. Saat
  keduanya ada, digest yang dipatuhi Docker dan tag hanya menjadi komentar —
  jadi menaikkan tag tanpa digest membangun versi lama sambil berbunyi versi
  baru. Gerbang di atas memeriksanya secara khusus.

- **Action GitHub dipin ke SHA commit, bukan ke tag**, dengan komentar
  `# vX.Y.Z` yang Dependabot baca. Tag bisa dipindahkan, dan action berjalan
  dengan akses ke token workflow serta seluruh isi checkout (ADR-0030).
- **`bun.lock` wajib merupakan pernyataan tentang repo ini**, dan wajib
  di-commit. `bun run check:lockfile` memeriksanya sebelum install: nama
  workspace harus milik repo ini (lockfile hasil salinan repo lain persis
  dikenali dari sini) dan blok dependency harus sama persis dengan
  `package.json`. Install di CI dan di image selalu
  `bun install --frozen-lockfile`.
- **Regenerasi lockfile penuh**: `rm -rf node_modules bun.lock && bun install`.
- **Jangan menamai script sama dengan biner yang dipanggilnya.** `bun run`
  menyelesaikan nama ke script `package.json` **sebelum** `node_modules/.bin`,
  jadi sebuah script `"astro": "bun --bun astro"` membuat setiap script lain
  yang memanggil `astro` masuk rekursi tak terbatas — dan matinya berbunyi
  `E2BIG: Argument list too long`, yang tidak menyebut sebabnya sama sekali.
  Untuk perintah Astro sekali pakai: `bunx astro <perintah>`.
- **`bun install` TIDAK menolak peer-dependency mismatch** seperti npm — ia
  memperingatkan lalu memasang. Karena itu batas peer yang penting (mis. pin
  `typescript` untuk `@astrojs/check`) ditulis eksplisit di
  `.github/dependabot.yml`; tanpa itu bump yang tidak didukung terpasang mulus
  dan gagal jauh dari sebabnya.
- **Baca env lewat `src/lib/env.ts`**, bukan `import.meta.env` langsung.
  Variabel non-`PUBLIC_` bisa terbaca `undefined` di dalam chunk prerender
  meskipun nilainya ada di `.env`, dan kegagalannya menyamar jadi masalah lain.

## Standar luar yang mengikat repo ini (ADR-0028)

Aturan di dokumen ini sebagian besar memetakan ke kontrol yang sudah punya nama
di luar sana. Petanya — beserta **daftar celah yang jujur** — ada di
[`docs/awcms-astro/standar-performa-dan-keamanan.md`](docs/awcms-astro/standar-performa-dan-keamanan.md).
Empat hal yang perlu diketahui sebelum menyentuh header, cache, atau anggaran
performa:

- **Edisi standar disamakan dengan `awcms`**, dan bukan hanya OWASP: Top 10
  2021, ASVS 4.0.3, API Security 2023, ISO/IEC 27001:2022, NIST SSDF v1.1 —
  **kelimanya** dipin `awcms` ADR-0068 §A dengan tanggal tinjau bersama
  2027-02-04. ISO/IEC 25010:2023 dipakai kedua repo sebagai model mutu produk
  tetapi **tidak** termasuk pin itu; ia tidak punya tanggal tinjau keluarga, dan
  menagihkannya ke `awcms` berarti menagih janji yang tidak pernah dibuat. Naik
  edisi adalah keputusan tingkat keluarga, bukan tingkat repo — dua matriks pada
  dua edisi berbeda tidak bisa dijumlahkan, dan selisih penomorannya akan dibaca
  sebagai celah kontrol.
- **Selisih repo ini dari `awcms` dicatat di manifest keluarganya, dan jumlahnya
  LIMA** — bukan dua, dan bukan hanya yang lahir di sini. Ketiga yang sudah
  dikenal: HSTS tanpa `includeSubDomains` (ADR-0029 di sini), COOP/CORP yang
  tidak dikirim (`awcms` ADR-0069), dan permukaan admin USER (`awcms` ADR-0070).
  **Dua yang belum pernah disebut di repo ini.** Yang pertama
  `owasp-edition-pin-owned-here`: pin edisi OWASP dipegang `awcms` justru karena
  ADR-0028 di sini menyatakan secara tertulis bahwa repo ini mengikuti edisi
  sana, sehingga naik edisi menuntut ADR di sana — bukan suntingan tabel di
  sini. Yang kedua `astro-files-not-type-checked` —
  `awcms` kehilangan type-check berkas `.astro`-nya karena berada di TypeScript
  7.x, dan catatan divergence-nya menyandarkan diri secara eksplisit pada
  kenyataan bahwa repo ini masih di `^6.0.3`. Itu bukan trivia versi: ia
  menjadikan pin TypeScript di sini syarat hidupnya gerbang `astro check`, dan
  karena itu ia kini punya ADR-nya sendiri
  ([ADR-0037](docs/adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md)).
  Kelimanya ber-`reviewDate` 2027-02-04, satu kohort, supaya seluruh postur
  keluarga ditinjau dalam satu duduk.
- **Target performa adalah Core Web Vitals pada p75**: LCP ≤ 2,5 detik, INP ≤ 200
  milidetik, CLS ≤ 0,1. INP menggantikan FID sejak Maret 2024 — dokumen yang
  masih menyebut FID sudah basi, bukan sedang memakai alternatif. **Sejak
  ADR-0032, LCP dan CLS diasersi LAB di CI situs yang punya sumber konten**,
  atas sampel halaman yang batasnya dipilih dan tertulis di `lighthouserc.json`
  (di repo template langkah itu tidak berjalan). INP tidak terukur di lab —
  TBT ≤ 200 ms dipakai sebagai proksinya — dan p75 kunjungan NYATA tetap tidak
  diukur karena RUM ditolak; keduanya ditulis apa adanya alih-alih dibiarkan
  tampak terjaga. Jangan menulis "memenuhi Core Web Vitals" dari hasil lab.
- **Kesepuluh celah kini tertutup** (enam pada 4 Agustus 2026; SBOM, analisis
  statik, dan Core Web Vitals lab menyusul 5 Agustus — ADR-0031/ADR-0032; yang
  kesepuluh ditemukan dan ditutup 6 Agustus 2026, dan ia bukan kontrol yang
  hilang melainkan dua pemeriksa yang tidak pernah dieksekusi di repo tempat
  keduanya ditulis), **dan baris yang tertutup TETAP di tabel.**
  Tiap satunya menyebut pemeriksanya, dan baris yang tertutup TETAP di tabel:
  dihapus, ia akan diusulkan lagi sebagai temuan baru, dan pemeriksanya akan
  dilonggarkan oleh orang yang tidak tahu kenapa ia ada. Menutup sebuah celah
  tanpa pemeriksanya berarti memindahkannya dari "diketahui terbuka" ke "dikira
  tertutup", dan yang kedua lebih buruk.

## Definition of Done

- [ ] `bun run build` bersih (termasuk `astro check`).
- [ ] `bun test` hijau — termasuk gerbang katalog `tests/katalog-po.test.mjs`.
- [ ] `bun run audit:konten` hijau **setelah** build. Sebelum build ia hanya
      memeriksa sumber gambar dan mengatakan bahwa gerbang keluarannya
      dilewati; membaca keluaran itu adalah bagian dari menjalankannya.
- [ ] `bun run audit:dokumen` hijau. Ia tidak butuh build: tautan markdown mati,
      indeks ADR yang tidak lengkap dua arah, dan kutipan `ADR-NNNN` yang tidak
      resolve ke berkasnya — kutipan ADR repo lain ditulis dengan penanda
      (`awcms`, "repo rujukan", atau tautan github) di paragraf yang sama.
      **Menambah ADR berarti menambah barisnya di `docs/adr/README.md`** —
      indeks itu pernah mendaftarkan enam keputusan yang tak pernah ada di repo
      ini sambil melewatkan sembilan yang ada, dan bertahan sembilan ADR tanpa
      terlihat.
- [ ] `bun run audit:graf` hijau. Ia juga tidak butuh build: artefak
      `graphify-out/` yang terlacak di luar keempat keluaran bersama, dan nama
      komunitas yang tidak dipilih — nama berkas warisan penamaan otomatis,
      placeholder, kembar, atau berbeda antara `graph.json` dan
      `GRAPH_REPORT.md`. Ia lahir dari 60 dari 101 label yang menempel pada
      komunitas yang salah, di dalam JSON yang sah, dengan setiap gerbang lain
      hijau karena tidak satu pun dari mereka membaca `graphify-out/`.
- [ ] `bun run audit:translation` hijau. Ia juga tidak butuh build: cermin
      Indonesia yang basi terhadap sumber Inggris yang hash-nya ia catat, dan
      dokumen yang belum punya cermin sama sekali. **Dokumen yang ditulis setelah
      [ADR-0039](docs/adr/0039-english-is-the-source-language.md) ditulis dalam
      bahasa Inggris dan dicerminkan pada perubahan yang sama** — buku besar
      dokumen tertunggak hanya boleh MENYUSUT, dan tidak ada yang boleh
      ditambahkan padanya.
- [ ] Halaman baru bekerja dengan JavaScript dimatikan.
- [ ] String antarmuka baru masuk ke SELURUH katalog locale.
- [ ] Key yang dirangkai dari konfigurasi atau data redaksi dipanggil dengan
      argumen fallback yang layak dibaca.
- [ ] Tidak ada `any` pada props komponen yang menerima `LocalizedArticle`.
      `entry: any` di `ArtikelLayout` menyembunyikan empat field yang tidak
      pernah ada dan satu baris metadata yang selalu kosong; menggantinya
      dengan tipe kontraknya menemukan seluruhnya dalam satu kali typecheck.
- [ ] Locale default dan locale berprefiks menghasilkan jumlah halaman yang sama.
- [ ] Gambar baru berasio `--ratio-visual`, ekstensinya sesuai isi berkas, tanpa
      lambang instansi maupun data tiruan, dan teksnya terbaca pada lebar 360px.
- [ ] Perubahan pada penyajian — header, CSP, `Cache-Control`, kompresi, port —
      dibuktikan `tests/penyaji.test.mjs`, bukan diperiksa dengan mata. **Sebuah
      `Vary` termasuk di dalamnya**: `Cookie` dan `Accept-Language` ditolak
      langsung
      ([ADR-0041](docs/adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md)),
      dan gerbang yang sama menolak setiap `Vary` lain yang ditulis dari berkas
      itu, jadi nilai ketiga adalah sebuah ADR, bukan sebuah suntingan.
- [ ] Perubahan yang menyentuh header, cache, kompresi, atau anggaran performa
      ikut memperbarui barisnya di
      `docs/awcms-astro/standar-performa-dan-keamanan.md`. Kolom "Keadaan" di
      sana **tidak bisa digerbangi mesin** — sebuah baris bisa berbunyi
      "Terpenuhi" setelah kontrolnya dicabut, dan tidak ada yang akan merah.
- [ ] Keluaran build tidak membawa gaya maupun skrip di dalam HTML-nya.
      `bun test` setelah `bun run build` menjalankan `tests/keluaran-csp.test.mjs`
      atas `dist/client/` — tanpa hasil build, gerbang itu MELEWATI dirinya dan
      mengatakannya. Membaca ringkasan `N pass` tanpa membaca baris yang
      dilewati bukan pembuktian; angkanya hijau justru karena gerbangnya tidak
      jalan.
- [ ] Menyentuh `src/config/site.ts` berarti membaca ulang dua gerbang yang
      menjaga PERAN repo ini, karena keduanya menilai konfigurasi dan bukan
      prosa: `tests/peran-situs.test.mjs` (ADR-0034 — `owner` ditolak, prefiks
      yang menelan permukaan publik ditolak, deklarasi separuh ditolak, dan
      setiap rute `prerender = false` wajib berada di bawah prefiks yang
      dinyatakan) dan `tests/kosakata-news.test.mjs` (ADR-0036 — tab ber-slug
      `news` wajib `urutanSeksi: "terbaru"`, dan **tidak ada** tab, prefiks
      admin, atau berkas rute yang boleh mengklaim `blog`, yang milik `awcms`).
- [ ] Menambah panggilan ke `awcms` berarti menyepakati kontraknya di SANA lebih
      dulu. `tests/kontrak-awcms.test.mjs` mengeraskan permukaan yang dipanggil
      build menjadi tepat tiga dan menuntutnya sama dua arah dengan tabel
      bertanda di skill integrasi; permukaan keempat memerahkannya sampai
      `awcms` membekukan bentuk responsnya (`awcms` ADR-0065).
- [ ] Menambah dependency berarti bertanya lebih dulu apakah ia membawa
      kemampuan **backend** — basis data, ORM, framework server, antrean, sesi.
      Bila ya, kebutuhannya sebuah MODUL di `awcms`, bukan paket di sini
      ([ADR-0038](docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md));
      `tests/tanpa-backend.test.mjs` menolaknya menurut kelas, dan gerbang yang
      sama menolak jalur TULIS ke `awcms` dari `src/` maupun `scripts/`.
- [ ] Variabel env baru terdokumentasi di `.env.example`, termasuk variabel
      RUNTIME yang dibaca `server/penyaji.mjs`.
- [ ] Dokumen yang menjelaskan perilaku yang berubah ikut diperbarui.

## Berpindah ke SSR

`output: 'static'` adalah premis template ini, bukan default yang kebetulan.
Mengubahnya ke `'server'` menarik kembali runtime, dependensi basis data yang
hidup, dan seluruh kontrol operasional keluarga AWCMS. Keputusan itu ditulis
sebagai ADR lebih dulu, bukan diambil lewat satu baris di `astro.config.mjs`.

**Satu ADR seperti itu sudah ada:**
[ADR-0014](docs/adr/0014-rendering-campuran-dan-bff-portal.md) (Jualanku.info)
memutuskan pola **static-by-default dengan rute on-demand** — adapter dipasang,
`output` **tetap** `static`, dan hanya `/penjual/**`, `/affiliate/**` (selain
landing), serta `/_portal-api/**` yang menyatakan `export const prerender = false`.
Rancangannya di [`docs/awcms-astro/jualanku/`](docs/awcms-astro/jualanku/README.md).

**Dan sejak ADR-0034 ada KELAS KEDUA rute on-demand yang sah**, dengan bentuk
yang sama persis: prefiks yang dinyatakan situs di `permukaanAdmin.prefiks`.
`tests/peran-situs.test.mjs` menerima keduanya dan **hanya** keduanya — sebuah
rute `prerender = false` yang prefiksnya tidak ada di salah satu dari dua daftar
itu memerahkan `bun test`. Itu yang membuat "publik secara bawaan" menjadi
keadaan yang ditegakkan alih-alih kebiasaan: menambahkan satu berkas rute
terautentikasi tidak bisa lagi terjadi tanpa seseorang menuliskannya.

Tiga hal yang perlu dibaca sebelum menyentuh area itu:

- **Belum ada implementasinya.** Rute portal dan `_portal-api` belum ada, dan
  tidak ada satu pun rute yang menyatakan `prerender = false`. Adapternya
  **sudah** terpasang sejak ADR-0016 — tetapi untuk MENYAJIKAN hasil build,
  bukan untuk merender saat request; `output` tetap `static`. Jangan membaca
  kehadirannya sebagai tanda prasyarat portal sudah lewat: prasyaratnya ada di
  [`04-kesiapan.md`](docs/awcms-astro/jualanku/04-kesiapan.md) dan belum
  berubah.
- **BFF tidak memutuskan apa pun yang punya konsekuensi bisnis.** Kepemilikan,
  entitlement, dan transisi status diputuskan `awcms`. Aturan yang hanya hidup di
  repo ini adalah aturan yang tidak ada.
- **Setiap permukaan TERAUTENTIKASI bertarget WCAG 2.2 AA**, naik dari 2.1 AA di
  atas — BFF Jualanku (ADR-0014) maupun permukaan admin USER yang sebuah situs
  nyatakan lewat `permukaanAdmin` (ADR-0034). Yang menentukan bukan nama
  permukaannya melainkan adanya kontrol, formulir, dan fokus yang berpindah.
  Aturan lain di dokumen ini tetap berlaku penuh.

## Bahasa

Inggris di jalur telanjang adalah sumber yang berwenang; Indonesia di
`<nama>.id.md` adalah cerminnya, mencatat hash Inggris yang diterjemahkannya
([ADR-0039](docs/adr/0039-english-is-the-source-language.md)). Sumber dokumen
ini [`AGENTS.md`](AGENTS.md). Kode — komentar, nama, pesan gerbang — berbahasa
Inggris dan tunggal; ia tidak dicerminkan.
