---
bump: patch
tipe: struktur
dampak: internal
---

# Buletin ada di `awcms` dan tidak bisa dijangkau pembaca — dua sebabnya, keduanya diukur

`awcms` mengapalkan modul `newsletter` pada 21 Agustus 2026 (ADR-0103-nya):
`POST /api/v1/newsletter/subscribe` yang anonim, dibatasi per-IP, double opt-in,
dengan **jawaban NETRAL untuk setiap hasil**. Tidak ada pembaca di situs yang
dibangun dari template ini yang bisa mencapainya.

Caller-nya kini ditulis dan diuji. Ia **tidak memanggil apa pun**, dan itu bukan
kelalaian — dua hal harus mendarat di `awcms` lebih dulu, dan keduanya dibaca
dari sumbernya alih-alih disimpulkan dari tetangganya:

1. **Jalurnya belum dibekukan.** `CONSUMER_PATHS` di sana memuat sepuluh jalur
   yang dikonsumsi dan dua yang dijanjikan; tidak ada jalur buletin di antaranya.
   Setiap permukaan sejak `/site-profile/composed` mengikuti urutan yang sama —
   `awcms` membekukan bentuknya sebagai COMMITTED dulu, baru repo ini
   memanggilnya.

2. **Tidak ada handler `OPTIONS`, jadi preflight-nya tidak bisa dijawab.** Ini
   detail yang akan salah kalau disalin dari tetangga. Dua jalur pencarian TIDAK
   membawa header sama sekali; beacon HARUS membawa `application/json`, dan
   `analytics/collect.ts` mengekspor `OPTIONS` justru untuk preflight yang
   ditimbulkannya. `newsletter/subscribe.ts` **tidak mengekspor `OPTIONS`**,
   sementara kontraknya menuntut content type yang sama.

   Jadi endpoint itu, hari ini, tidak bisa dijangkau situs statis di domainnya
   sendiri. Itu temuan tentang `awcms`, bukan keterbatasan berkas di sini.

## Dua gerbang diperluas, bukan dihindari

Menulis caller ini menabrak dua gerbang, dan keduanya benar. Menyembunyikan
kodenya dari mereka — menyusun jalurnya dari potongan string, menyimpan verb-nya
di variabel — adalah bypass yang sudah disebut ADR-0038 §4 sebagai batas yang
diketahui. Jadi keduanya diperluas secara terbuka:

- **Kontrak permukaan** kini punya blok kedua, `dijanjikan`, meniru pemisahan
  CONSUMED/COMMITTED milik `awcms` sendiri beserta alasannya: sebuah janji dan
  sebuah ketergantungan sama-sama layak stabil tetapi gagal dengan cara berbeda.
  Sebuah jalur yang ada di sumber dan tidak ada di kedua blok tetap MERAH, jadi
  permukaan masih tidak bisa mendarat diam-diam — yang kini bisa dilakukannya
  adalah mendarat sebagai janji alih-alih sebagai kebohongan tentang apa yang
  dipanggil build. Dijaga dua arah, plus penolakan tumpang tindih.
- **Aturan "repo ini membaca, ia tidak menulis"** mendapat pengecualian KEDUA,
  dan ia dibayar tiga jaminan alih-alih dua: tanpa kredensial, tanpa header
  otorisasi, **dan** flag-nya mati. Jaminan ketiga memerah begitu seseorang
  menyalakannya, sehingga dua yang pertama dibaca ulang sebelum dimatikan.

## Yang paling penting tidak dilakukan konsumen ini

`awcms` menjawab **badan yang sama** untuk alamat baru, alamat yang sudah aktif,
yang di-suppress, dan host yang tidak memetakan ke tenant mana pun. Caller ini
merender jawaban itu apa adanya dan tidak menambah apa pun. "Alamat itu sudah
terdaftar" di sisi klien akan membangun ulang oracle enumerasi yang ditolak
endpoint itu — dari satu tempat yang tidak akan terpikir dicari siapa pun.

Diuji: alamat BARU dan alamat yang SUDAH ADA harus menghasilkan hasil yang
identik.

## Yang sengaja BELUM dibangun

Rute konfirmasi dan berhenti-langganan. Tautannya datang dari surel yang dikirim
`awcms`, dan URL yang ditulisnya belum diputuskan — membangun rute untuk alamat
yang belum disepakati siapa pun adalah menebak.
