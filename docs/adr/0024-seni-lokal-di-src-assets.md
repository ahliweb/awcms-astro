# ADR-0024 — Seni lokal di `src/assets/`, di-resolve `import.meta.glob` sebagai URL

- **Status:** Accepted
- **Tanggal:** 3 Agustus 2026
- **Terkait:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (`img-src 'self'`), [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) §Titik lanjut butir 1, [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (yang membuat pekerjaan ini boleh mendarat)

## Konteks

`src/lib/article-images.ts` sejak awal mendeskripsikan **dua** sumber seni dan
mengimplementasikan **nol** — `getArticleImage` mengembalikan `src: undefined`
tanpa syarat, dan ketiga pemanggilnya bahkan tidak membaca `src`: mereka
merender `.visual-placeholder` apa pun isinya.

Akibatnya lebih dari "belum ada gambar":

- **Empat bingkai CSS punya aturan `img` yang tidak pernah dipakai siapa pun.**
  `.feature-hero-img img`, `.card-img-wrapper img`, `.hero-visual-frame img`,
  `.article-hero-frame img` — semuanya sudah benar, dan tak satu pun pernah
  diuji terhadap sebuah `<img>` sungguhan.
- **Gerbang rasio `audit:konten` tidak punya apa pun untuk diperiksa.** Ia
  melaporkan "src/assets/ belum ada — dilewati" di setiap run, yaitu gerbang
  yang tampak jalan tanpa pernah menjawab satu pertanyaan pun.

Sumber kedua — media `awcms` lewat `featuredMediaId` — **tetap ditahan**
(ADR-0021, dipersempit ADR-0023): kodenya adalah kode yang bentuknya ditentukan
respons `awcms`, dan repo template ini tidak punya instans untuk membuktikan
panggilannya benar.

## Keputusan

**Seni lokal tinggal di `src/assets/` dan di-resolve `import.meta.glob` menjadi
URL string.**

Konvensi nama, relatif terhadap `src/assets/` dan **tanpa ekstensi**:

| Kunci | Dipakai |
| --- | --- |
| `hero` | Hero beranda |
| `tab/<tab>` | Hero seksi |
| `artikel/<tab>/<slug>` | Satu artikel |

Ekstensi apa pun dari `EKSTENSI_SENI` berlaku, sehingga mengganti `.svg`
menjadi `.webp` tidak menyentuh satu baris kode pun.

### `query: "?url"`, bukan `astro:assets`

`astro:assets` akan meng-encode ulang dan memancarkan `srcset`, dan itu nyata
lebih baik untuk raster. Ia **ditolak untuk sekarang** karena harganya bukan
performa melainkan bentuk:

- Ia mengembalikan `ImageMetadata`, bukan string — jadi `ArticleVisual.src`
  berubah bentuk, dan keempat bingkai harus berpindah dari `<img>` ke komponen
  `<Image>`.
- Ia memperlakukan SVG berbeda dari raster, sementara SVG justru format yang
  gerbang repo ini ditulis untuk membaca (`viewBox`, ukuran teks terkecil).
- **Pemotongan tidak hilang tanpanya.** Bingkai memotong di CSS, dan
  `audit:konten` sudah menolak sumber yang bukan 16∶9 sebelum ia sempat terbit.

Satu bentuk untuk setiap format yang gerbangnya terima lebih berharga daripada
`srcset` pada template yang hari ini membawa nol gambar.

### Tanpa fallback dari artikel ke seni seksinya

Sebuah artikel tanpa berkas seni merender placeholder, **bukan** gambar
seksinya. Fallback akan membuat seluruh artikel satu seksi memakai gambar yang
sama sambil tampak — di setiap pemanggil — persis seperti gambar yang dipilih
untuk artikel itu. Placeholder jujur; fallback tidak.

### Dua berkas bernama sama = build gagal

`hero.svg` dan `hero.png` bersamaan adalah **error**, bukan pilihan diam-diam.
Memilih salah satunya berarti situs menerbitkan seni yang bukan hasil suntingan
terakhir penulisnya, dan tidak ada cara melihatnya selain membuka setiap
halaman.

### Percabangan gambar/placeholder tinggal di satu komponen

`src/components/Ilustrasi.astro`. Ditulis empat kali di empat bingkai, ia akan
menyimpang empat kali — dan bentuk penyimpangan yang paling mungkin adalah
`alt` yang hilang atau `role="img"` yang tertinggal pada elemen yang sudah
menjadi `<img>`: dua cacat yang hanya terasa oleh pembaca yang tidak melihat
layarnya.

## Konsekuensi

- **`img-src 'self'` cukup, CSP tidak berubah.** Vite memancarkan aset ke
  `/_astro/<nama>.<hash>.<ext>` di origin situs sendiri. Ini **kontras** dengan
  sumber kedua: media `awcms` tinggal di origin lain dan akan menuntut ADR-0019
  dilebarkan.
- **Gerbang rasio berhenti kosong.** Diverifikasi dua arah pada saat mendarat:
  sumber 16∶9 lolos, sumber 1∶1 memerahkan `audit:konten` dengan menyebut
  pemotongannya.
- **Daftar ekstensi kini hidup di tiga tempat** — konstanta `EKSTENSI_SENI`,
  pola literal `import.meta.glob` (Vite menuntutnya literal), dan
  `EKSTENSI_GAMBAR` di `scripts/audit-konten.mjs`. Menyimpang, ia menghasilkan
  cacat diam ke dua arah: ekstensi yang diserap tetapi tidak diperiksa
  menerbitkan seni berasio salah; yang diperiksa tetapi tidak diserap membuat
  berkas yang lulus audit tidak pernah muncul. `tests/seni-lokal.test.mjs`
  membandingkan ketiganya sebagai teks.
- **Logikanya diuji tanpa build**, karena build repo template ini butuh `awcms`.
  `src/lib/seni-lokal.ts` memisahkan seluruh pemetaan dari `import.meta.glob`
  supaya `bun test` bisa menjangkaunya; yang tersisa di `article-images.ts`
  hanya glob dan tiga pemanggilan.
- **Risiko yang diterima:** raster besar tidak di-encode ulang, jadi situs yang
  memakai foto alih-alih ilustrasi menanggung berkas penuh. Bila itu terjadi,
  pindah ke `astro:assets` adalah perubahan yang wajar dan pantas mendapat
  ADR-nya sendiri — bentuk `ArticleVisual` yang akan berubah, bukan konvensi
  namanya.

## Alternatif yang dipertimbangkan

- **`astro:assets` sekarang** — lihat di atas; ditolak karena bentuk, bukan
  karena kualitas.
- **Registry manual (peta slug → berkas di sebuah `.ts`)** — ditolak: dua tempat
  yang harus bergerak bersama untuk setiap gambar, dan yang kedua akan lupa
  digerakkan. Konvensi nama tidak bisa lupa.
- **Menaruh seni di `public/`** — ditolak: `public/` tidak di-hash, jadi
  penggantian gambar tertahan cache pembaca; dan `audit:konten` sengaja **tidak**
  memeriksa rasio di sana karena isinya perkakas situs (favicon, ikon), bukan
  ilustrasi.
