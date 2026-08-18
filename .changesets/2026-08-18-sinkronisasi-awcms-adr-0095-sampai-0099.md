---
bump: minor
tipe: struktur
dampak: internal
---

# Keadaan `awcms` per 15 Agustus 2026 diserap, dan dua aturan yang selama ini hanya tertulis akhirnya punya pemeriksa

Sinkronisasi terakhir menyerap `awcms` sampai ADR-0092 (13 Agustus 2026). Sejak
itu sisi sana melanjutkan sampai ADR-0099. Lima keputusan, dan hanya **satu**
yang menyentuh repo ini — tetapi yang satu itu mengubah bentuk sebuah URL publik
yang dinamai enam berkas di sini sebagai fakta.

Yang **tidak** berubah dinyatakan lebih dulu, karena itu yang paling sering
salah diduga: **adapter tidak disentuh sama sekali.** Ketiga permukaan yang
dipanggil build tetap tiga, dan fixture kontrak konsumen di sana terakhir
diregenerasi 13 Agustus 2026 (ADR-0092) — tidak ada regenerasi yang menyentuh
permukaan DIPANGGIL sejak itu, jadi `tests/kontrak-awcms.test.mjs` hijau tanpa
satu baris pun berpindah.

## Satu URL publik berpindah bentuk, dan enam berkas menyebutnya

`awcms` ADR-0098 memindahkan locale permukaan konten publiknya ke dalam PATH.
Alamat kanoniknya kini `/{locale}/blog/{tenantCode}/**`; path telanjang tidak
merender apa pun dan menjawab `307`, `private, no-store`. Akibat yang paling
mudah terlewat bukan URL-nya melainkan **rantainya**: tautan `/news/**` yang
dipensiunkan pada 8 Agustus 2026 kini dua lompatan — `301` ke path telanjang,
lalu `307` ke yang berprefiks — karena penulisan ulang `Location` di sana hanya
membawa locale yang sudah dimiliki pembacanya.

Yang diperbaiki karena itu adalah kalimat yang **menyuruh pembacanya melakukan
hal yang salah**: `README.md` dan `docs/awcms-astro/checklist-repo-baru.md`
sama-sama menyarankan menyajikan pembaca dari permukaan publik `awcms` sendiri,
dan keduanya mencetak alamat yang kini me-redirect. Sisanya —
`AGENTS.md`, skill integrasi, `standar-performa-dan-keamanan.md` — menyebutnya
sebagai fakta, dan fakta yang menua adalah cara pekerjaan berikutnya mendarat di
tempat yang keliru.

## Repo ini TIDAK ikut memberi prefiks, dan itu keputusan, bukan kelalaian

[ADR-0041](../docs/adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md).
Locale default tetap memegang akar (`/panduan/`, bukan `/id/panduan/`).

Alasannya bukan selera melainkan premis: kegagalan yang menjadi alasan
keberadaan `awcms` ADR-0098 — satu URL publik yang badannya dipilih cookie, di bawah
kunci cache `(host, url)` — **secara struktural tidak tersedia** pada build
statis. `server/penyaji.mjs` membaca `req.url` dan tidak ada yang lain. Mengikuti
prefiks itu berarti menjawab setiap URL locale default dengan redirect demi
properti yang sudah dimiliki, dan menurut kosakata ADR-0040 sendiri itu `major`.

Tanpa ADR ini, perbedaan itu terbaca sebagai ketertinggalan dan akan
"diperbaiki" seseorang. Ia divergence keluarga dan butuh entrinya sendiri di
`awcms-family-compatibility.yaml` sana — repo ini tidak bisa menuliskannya, dan
karena itu menyatakannya.

## Yang DISERAP dari `awcms` ADR-0098, beserta pemeriksanya

Keputusan 2-nya: `Vary: Cookie` dan `Vary: Accept-Language` **DITOLAK** pada
setiap respons publik — ditolak, bukan dibuang, karena membuangnya meng-cache
badan yang penulisnya baru saja menyatakan bervariasi.

Aturannya tinggal di `server/penyaji.mjs` sebagai `VARY_DILARANG`, sebentuk
dengan `PERAN_DILARANG`. Pemeriksanya `tests/penyaji.test.mjs`, tiga asersi,
masing-masing dibuktikan merah oleh mutasinya sendiri: respons sungguhan pada
permintaan yang membawa cookie DAN `Accept-Language`, sumber penyaji yang tidak
menulis `Vary` apa pun, dan daftar terlarang yang tepat dua nama. Asersi tengah
sengaja lebih ketat daripada aturannya, dan tesnya menyatakan itu alih-alih
menyamarkannya.

Godaannya nyata dan berbentuk gamblang: cara membuat situs ini memilih bahasa
pembacanya tanpa rebuild adalah menegosiasikan `Accept-Language` di penyaji.
Setiap respons di sini `public`, jadi yang menerima akibatnya bukan yang
menyunting melainkan orang asing, beberapa menit kemudian, pada halaman yang
tidak bisa dirender ulang siapa pun.

## Separuh ADR-0036 yang tidak dibaca apa pun

`AGENTS.md` menulis "Jangan bangun `/blog/**` di sini" sejak 8 Agustus 2026 dan
tidak ada satu perintah pun yang merah bila dilanggar — bentuk yang persis sama
dengan lima aturan yang skill gerbang sudah daftarkan.

`awcms` ADR-0098-lah yang mengubahnya dari celah laten menjadi celah hidup: URL kanonik
sebelah kini `/{locale}/blog/{tenantCode}/…`, huruf per huruf sama dengan bentuk
yang dihasilkan `src/pages/[lang]/[tab]/…` di sini. `tests/kosakata-news.test.mjs`
kini menolak tiga bentuk — tab yang mengklaim slug `blog`, entri
`permukaanAdmin.prefiks` di bawah `/blog`, dan berkas rute yang menuliskan
segmennya secara harfiah — masing-masing dibuktikan merah dengan memutasi repo
ini, bukan hanya sebuah fixture. Asersi keempat memastikan pemindaian rutenya
benar-benar membaca sesuatu, sehingga ia tidak bisa lolos karena tidak menemukan
apa pun.

## Selebihnya

- Tiga ADR sisanya membentuk permukaan TERAUTENTIKASI dan tempatnya
  `docs/awcms-astro/permukaan-admin-user.md` §5, bukan skill adapter: preferensi
  bahasa milik **principal** dan global (ADR-0095 — jadi "bahasa situs ini"
  salah memerikan apa yang dilakukannya), rute swalayan **tidak butuh izin** dan
  mengarang satu justru mendarat sebagai 403 universal lewat jebakan ADR-0058 §E
  (ADR-0096), dan alamat sign-in adalah **pemulihan akun** yang statusnya masih
  Accepted tanpa implementasi (ADR-0099 — hari ini layar profil menampilkannya
  baca-saja dan menyebut alasannya).
- `awcms` ADR-0097 adalah keputusan yang sama dengan ADR-0039 di sini, dicapai
  mandiri. Satu hal yang perlu diketahui sebelum membaca dokumen di sana: buku
  besarnya dibuka pada 253 dokumen tertunggak, jadi `<nama>.md` telanjang di
  `awcms` masih lebih sering berbahasa Indonesia daripada tidak.
- §3 `permukaan-admin-user.md` bertambah satu baris: permukaan admin adalah hal
  pertama yang punya cookie layak divariasikan, dan halaman publik di sebelahnya
  masih `public`. Jawabannya sama dengan jawaban `awcms` — `private, no-store`,
  bukan `Vary`.
