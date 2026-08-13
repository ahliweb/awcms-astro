# ADR-0029 — HSTS dikirim penyaji, digerbangi produksi, tanpa `includeSubDomains`

- **Status:** Accepted
- **Tanggal:** 4 Agustus 2026
- **Aturan pemilik:** 4 Agustus 2026 — "kerjakan sesuai rekomendasi terbaikmu."
- **Terkait:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (celah 1 dan 5 yang ditutup di sini), [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (CSP dikirim penyaji), [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) (penyaji satu-satunya pemilik header)
- **Sumber pembanding di `awcms`:** `src/lib/security/security-headers.ts` (`buildSecurityHeaders`, Issue #437). Ia **bukan** ADR di sana — postur header `awcms` mendarat lewat issue, jadi tidak ada nomor ADR yang bisa dirujuk. Baris ini ditulis begitu alih-alih menebak sebuah nomor: draf pertama ADR ini mengutip `awcms` ADR-0035, yang ternyata tentang repositioning ERP/SaaS. Itu persis aturan 2 `awcms` [ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md) — kutipan ADR yang pembacanya juga tidak bisa periksa — dan celah yang ADR-0028 catat belum digerbangi di sini.

> **Banner (14 Agustus 2026) — keputusan ini BENAR dan tetap berlaku, tetapi
> selama delapan hari ia tidak pernah sampai ke pembaca.**
>
> Badan ADR ini adalah rekaman dan tidak disunting. Yang ditemukan saat
> verifikasi deploy produksi pertama: `bun build --target=bun` **melipat**
> `process.env.NODE_ENV` bertitik menjadi literal saat bundling, sehingga
> `dist/server/penyaji.mjs` yang tayang memuat `headerKeamanan(produksi = false)`.
> Container berjalan dengan `NODE_ENV=production`, dan respons sungguhannya tetap
> **tanpa** `Strict-Transport-Security`.
>
> Setiap gerbang hijau selama itu, dan alasannya persis kelas cacat yang repo ini
> berulang kali tulis aturannya: keduanya membaca `server/penyaji.mjs`, tempat
> gerbang produksi memang masih benar — bukan **bundel** yang dikirim.
>
> Perbaikannya satu bentuk akses (`process.env["NODE_ENV"]`, yang tidak dilipat),
> dan pemeriksanya menjalankan **artefaknya**: `tests/penyaji.test.mjs`
> menyalakan `dist/server/penyaji.mjs` dua kali dan menuntut HSTS ada di
> `production` sekaligus absen di luar itu. Ia berjalan di dalam `docker build`,
> jadi sebuah image yang kehilangan header keenam berhenti bisa dibangun.

## Konteks

### 1. Header keenam yang tidak dipasang di mana pun

[ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) mencatat satu selisih
postur dari `awcms` sebagai celah bernomor 1: `awcms` mengirim
`Strict-Transport-Security` di produksi, repo ini tidak mengirimkannya di
lingkungan mana pun.

Alasan yang terbaca masuk akal selama dua bulan — "TLS diterminasi Traefik, jadi
itu urusan lapisan di depan" — tidak bertahan diperiksa. Traefik tidak memasang
HSTS tanpa middleware yang dinyatakan, sehingga yang terjadi bukan "dipasang di
tempat lain" melainkan **tidak dipasang di mana pun**. Dan
[ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) sudah melarang
penyelesaiannya ditaruh di Traefik: header respons ditentukan di
`server/penyaji.mjs`, bukan di dua tempat yang bisa saling menimpa.

Yang dijaga HSTS bukan permintaan yang sudah HTTPS. Yang dijaganya adalah
permintaan **pertama** seorang pembaca — `contoh.go.id` diketik tanpa skema,
browser mencoba HTTP, dan redirect ke HTTPS adalah respons yang bisa diganti
siapa pun yang duduk di jalur itu. Sebuah situs informasi publik yang pembacanya
berada di jaringan yang tidak dapat diandalkan adalah persis konteks tempat
serangan itu murah.

### 2. Kenapa keputusan ini tidak bisa diambil di satu baris

Dua sifat HSTS membuatnya berbeda dari empat header lain di berkas itu, dan
keduanya mengarah ke bahaya yang **tidak terlihat saat perubahannya ditulis**:

- **Ia tidak bisa dibatalkan dari sisi situs.** Sekali sebuah browser
  menerimanya, ia menolak berbicara HTTP ke host itu selama `max-age`.
  Mengirimkannya lalu menyesal berarti menunggu satu tahun, bukan men-deploy
  perbaikan.
- **Ia berlaku untuk HOST, bukan untuk situs.** Pada `localhost`, yang terkunci
  bukan hanya pratinjau ini melainkan **setiap proyek lain** yang dikembangkan
  pemilik mesin di `http://localhost:<port>`. `bun run serve` dan
  `bun run preview` menjalankan berkas yang sama dengan produksi — jadi tanpa
  gerbang, satu pratinjau lokal merusak mesin yang menjalankannya, dan tidak ada
  satu pun yang gagal saat itu terjadi.

### 3. `includeSubDomains` benar untuk `awcms` dan salah untuk sebuah template

`awcms` mengirim `max-age=31536000; includeSubDomains`. Itu benar di sana:
`awcms` adalah SATU deployment yang operatornya tahu persis apa saja
subdomainnya.

`awcms-astro` adalah **template**. Ia berjalan di domain yang belum ada saat
baris ini ditulis, milik organisasi yang hampir pasti punya layanan lain di
subdomain lain. `includeSubDomains` dari `contoh.go.id` memaksa
`mail.contoh.go.id` dan setiap subdomain lainnya menjadi HTTPS-saja selama
setahun, di browser setiap orang yang pernah membuka situsnya — dan yang
menanggung akibatnya bukan situs ini melainkan layanan-layanan itu, yang
pemiliknya tidak pernah ikut memutuskan.

Menyalin nilai `awcms` apa adanya karena itu bukan "paritas keluarga". Ia
memindahkan sebuah keputusan yang bergantung konteks ke tempat yang tidak punya
konteksnya.

## Keputusan

### §A — HSTS dikirim, digerbangi `NODE_ENV === "production"`

`server/penyaji.mjs` mengekspor `HSTS` dan `headerKeamanan(produksi)`. Yang
kedua mengembalikan lima header di luar produksi dan enam di dalamnya.
`pasangHeader` memakainya.

`NODE_ENV` dipakai karena stage runtime `Dockerfile` **sudah** menyetelnya
`production`, jadi tidak ada tempat kedua yang perlu diingat saat men-deploy.
Yang membuat gerbang ini aman adalah asimetri akibatnya: kesalahan ke arah
"lupa" hanya kehilangan HSTS, sementara kesalahan ke arah "terlalu awal"
mengunci mesin pengembang selama setahun. **Bawaannya karena itu mati.**

### §B — `max-age=31536000`, tanpa `includeSubDomains`, tanpa `preload`

Satu tahun adalah nilai yang direkomendasikan OWASP Secure Headers Project dan
sama dengan `awcms`. Dua direktif lainnya tidak ikut:

- **`includeSubDomains`** — alasan §3. Sebuah situs yang subdomainnya memang
  seluruhnya HTTPS **boleh** menambahkannya, di `server/penyaji.mjs` dan bukan
  di tempat kedua, lalu memperbarui `tests/penyaji.test.mjs`. Aturannya sama
  dengan melebarkan `img-src`.
- **`preload`** — ia menuntut `includeSubDomains`, dan pendaftaran ke daftar
  preload browser praktis tidak bisa ditarik. Sebuah template tidak boleh
  membuat komitmen permanen atas domain yang belum ada.

Divergence dari `awcms` ini **sempit dan disengaja**, dan ia menutup celah
ADR-0028 nomor 1 sepenuhnya: yang dicatat di sana adalah header yang tidak
dikirim sama sekali, bukan direktif yang lebih pendek.

### §C — Tiga asersi, dan yang terpenting arahnya terbalik

`tests/penyaji.test.mjs` bertambah tiga, dan ketiganya **mutation-proven** —
tiap satunya sudah dibuktikan MERAH saat kontrolnya dicabut, lalu hijau lagi:

1. **HSTS TIDAK dikirim di luar produksi.** Ini asersi yang benar-benar menjaga
   sesuatu. Sebuah gerbang yang hanya memeriksa "header ada" akan hijau pada
   versi yang mengunci setiap `localhost` pengembang.
2. **HSTS dikirim di produksi, tanpa `includeSubDomains` dan tanpa `preload`**,
   dan kelima header lain tidak hilang saat yang keenam ditambahkan.
3. **`Server` dan `X-Powered-By` tidak ada** pada tiap kelas respons — celah
   ADR-0028 nomor 5, ASVS V14.4.

Kehadiran HSTS diuji lewat fungsi murni `headerKeamanan(true)`, bukan dengan
menyetel `NODE_ENV` di dalam proses tes: menyetelnya akan bocor ke berkas tes
lain di proses yang sama, dan kegagalannya muncul jauh dari sebabnya.

### §D — `Server`/`X-Powered-By` dihapus, bukan sekadar diasersi

Keduanya memang tidak dikirim Node hari ini. `pasangHeader` tetap memanggil
`removeHeader` atas keduanya, karena **"tidak dikirim hari ini" dan "tidak akan
dikirim" adalah dua hal berbeda** — sebuah middleware yang ditambahkan kelak
(proxy, logging, kompresi lain) bisa memasangnya tanpa siapa pun memutuskannya.
`removeHeader` atas header yang tidak ada adalah no-op.

## Konsekuensi

**Yang didapat.** Permintaan pertama seorang pembaca berhenti bisa dibajak
setelah kunjungan pertamanya. Selisih jumlah header dari `awcms` tertutup, dan
selisih yang tersisa (`includeSubDomains`) kini **tertulis sebagai keputusan**
alih-alih terbaca sebagai kelalaian.

**Yang dibayar.** Sebuah situs yang men-deploy tanpa `NODE_ENV=production`
tidak mendapat HSTS dan **tidak ada yang mengatakannya**. Itu diterima sadar:
gerbang yang sebaliknya — memperingatkan saat HSTS tidak terkirim — hanya bisa
berjalan di runtime, dan peringatan runtime pada penyaji statis akan menjadi
baris log pertama yang orang belajar abaikan. `Dockerfile` menyetelnya, dan itu
jalur deploy yang didokumentasikan.

**Yang TIDAK dilakukan.** Tidak ada variabel env yang mengatur HSTS. Menambahkan
`HSTS_MAX_AGE` atau `HSTS_INCLUDE_SUBDOMAINS` akan memindahkan kebijakan
keamanan keluar dari berkas yang ADR-0016 tetapkan sebagai satu-satunya
pemiliknya — dan sebuah nilai yang salah di sana tidak gagal, ia hanya mengunci
domain orang lain selama setahun.

## Alternatif yang dipertimbangkan

- **Memasang HSTS di Traefik/Coolify.** Ditolak: ADR-0016 melarangnya, dan
  alasan larangan itu justru terbukti di sini — selama dua bulan semua orang
  mengira ia dipasang di sana.
- **Mengirim HSTS di setiap lingkungan.** Ditolak: ia mengunci `localhost`
  setiap pengembang, termasuk untuk proyek yang tidak ada hubungannya dengan
  repo ini, selama setahun dan tanpa cara mencabutnya dari sisi situs.
- **Menyalin nilai `awcms` apa adanya**, `includeSubDomains` dan semua.
  Ditolak dengan alasan §3: ia memindahkan keputusan yang bergantung konteks ke
  tempat yang tidak punya konteksnya, dan yang menanggung akibatnya pihak yang
  tidak ikut memutuskan.
- **`max-age` pendek dulu (mis. 300 detik) lalu dinaikkan bertahap.** Ini saran
  yang benar untuk sebuah SITUS yang belum yakin seluruh permukaannya HTTPS —
  dan salah untuk template, yang tidak bisa tahu di tahap mana sebuah situs
  turunan berada. Sebuah situs yang ingin menaikkannya bertahap menyunting
  `HSTS` di penyajinya; nilai bawaan template adalah nilai untuk situs yang
  sudah HTTPS penuh, yang merupakan prasyarat men-deploy di belakang Traefik.
