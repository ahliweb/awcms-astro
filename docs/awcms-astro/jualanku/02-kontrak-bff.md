# 02 — Kontrak BFF `/_portal-api/**`

> Rencana. Lihat [README](README.md) untuk status.

## 1. Batas keras

BFF **boleh**: memegang sesi portal, menukarnya menjadi kredensial `awcms`
server-side, menetapkan tenant dari host, memverifikasi CSRF/Origin, memasang
header cache privat, memvalidasi bentuk input secukupnya untuk UX, memanggil
`awcms`, dan membentuk view model.

BFF **tidak boleh**: memutuskan kepemilikan merchant, entitlement paket,
kelayakan payout, transisi status, perhitungan komisi, atau kebijakan moderasi.
Semua itu diputuskan `awcms` dan diperiksa ulang di sana **untuk setiap
panggilan** — termasuk panggilan yang BFF yakin sudah divalidasi.

Uji sederhana untuk setiap baris kode baru di sini: _kalau seseorang memanggil
`awcms` langsung dari jaringan internal tanpa melewati BFF, apakah hasilnya masih
benar?_ Kalau tidak, aturannya salah tempat.

## 2. Alur sesi

```
1. POST /_portal-api/auth/login
     BFF → awcms POST /api/v1/auth/login  (tenant dari host, bukan dari klien)
     ← token + expiresAt
     BFF menyimpan token server-side, menyetel cookie portal (HttpOnly, Secure,
     SameSite, Path=/), lalu MEROTASI id sesi portal.

2. Setiap request halaman on-demand
     BFF membaca cookie portal → token → awcms GET introspeksi sesi
     ← safe claims (identityId, roles, assurance, scope merchant/affiliate)
     Halaman dirender dari claims itu; tidak ada klaim yang datang dari klien.

3. Mutasi (POST/PATCH/DELETE)
     Verifikasi CSRF + Origin/Referer → panggil awcms → proyeksikan hasil.

4. POST /_portal-api/auth/logout
     awcms logout (revokasi) LEBIH DULU → baru cookie portal dihapus.
```

Urutan pada langkah 4 tidak bisa dibalik: menghapus cookie lebih dulu lalu gagal
memanggil `awcms` meninggalkan sesi hidup yang tidak lagi terlihat siapa pun.

## 3. Aturan cookie & CSRF

| Aspek                 | Ketentuan                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Nama cookie           | Terpisah untuk merchant dan affiliate bila audience-nya berbeda; jangan berbagi satu cookie.  |
| Atribut               | `HttpOnly`, `Secure`, `SameSite=Lax` (naik ke `Strict` bila alur tidak butuh redirect lintas-site), `Path=/`. |
| Isi                   | Referensi sesi buram. **Bukan** token `awcms`, bukan data pengguna.                          |
| Umur                  | Mengikuti `expiresAt` dari `awcms`; BFF tidak memperpanjang sendiri.                          |
| CSRF                  | Token synchronizer/double-submit **dan** Origin/Referer check. Dua-duanya.                    |
| Form tanpa JavaScript | Token CSRF disematkan sebagai hidden field, sehingga alur kritis tetap bekerja tanpa JS.      |
| Rotasi                | Setelah login, setelah step-up/perubahan privilege, setelah recovery.                         |

## 4. Inventaris endpoint BFF

| Endpoint                                   | Meneruskan ke `awcms`                              | Catatan                        |
| ------------------------------------------ | -------------------------------------------------- | ------------------------------- |
| `POST /_portal-api/auth/login`             | `/api/v1/auth/login`                                | Rate-limited, respons seragam   |
| `POST /_portal-api/auth/logout`            | `/api/v1/auth/logout`                               | Revokasi dulu, cookie kemudian  |
| `GET  /_portal-api/auth/session`           | endpoint introspeksi sesi                           | Hanya safe claims               |
| `GET/PATCH /_portal-api/merchant/profile`  | `/api/v1/jualanku/portal/merchant/profile`          | ETag diteruskan                 |
| `GET/POST/PATCH /_portal-api/merchant/catalog` | `.../portal/merchant/offerings`                 | Idempotency-Key diteruskan      |
| `GET/POST /_portal-api/merchant/promotions`| `.../portal/merchant/promotions`                    | —                               |
| `GET  /_portal-api/merchant/leads`         | `.../portal/merchant/leads`                         | PII sudah masked dari `awcms`   |
| `POST /_portal-api/merchant/verification`  | `.../portal/merchant/verification`                  | Upload lewat presigned media    |
| `GET  /_portal-api/affiliate/summary`      | `.../portal/affiliate/summary`                      | Saldo dari ledger               |
| `GET/POST /_portal-api/affiliate/links`    | `.../portal/affiliate/links`                        | —                               |
| `POST /_portal-api/affiliate/payouts`      | `.../portal/affiliate/payouts`                      | **Idempotency wajib**           |
| `POST /_portal-api/interactions`           | `/api/v1/jualanku/public/interactions`              | Publik, minim data, ber-rate-limit |

**Tidak ada passthrough generik.** Tidak ada `/_portal-api/[...path].ts` yang
meneruskan apa saja ke `awcms`; setiap endpoint didaftarkan eksplisit. Proxy
generik mengubah BFF menjadi deputi yang bingung dan membatalkan seluruh alasan
`awcms` tidak menghadap publik.

## 5. Unggah berkas

Bukti verifikasi dan gambar katalog **tidak** melewati BFF sebagai byte:

1. BFF meminta URL presigned ke `awcms` (`media_library`).
2. Browser mengunggah langsung ke penyimpanan objek.
3. BFF memanggil finalize; `awcms` memverifikasi MIME lewat magic byte + SHA-256.

Portal tidak pernah mengirim URL gambar bebas — jalur itu persis yang
enforcement managed-media di `awcms` ada untuk menutupnya.

## 6. Header dan cache

| Permukaan          | `Cache-Control`                           | Tambahan                                        |
| ------------------ | ------------------------------------------ | ------------------------------------------------ |
| Publik prerender   | `public, max-age=…` sesuai jenis aset      | Aset ber-hash boleh `immutable`                  |
| `/cari`            | `public, max-age` pendek                   | Tidak pernah memuat data personal                |
| Portal on-demand   | `private, no-store`                        | `X-Robots-Tag: noindex`, tidak masuk sitemap     |
| `/_portal-api/**`  | `no-store`                                 | `Vary` yang benar bila ada negosiasi             |

Security header (CSP, frame-ancestors, referrer-policy, permissions-policy)
diterapkan di [`server/penyaji.mjs`](../../../server/penyaji.mjs) — satu-satunya
tempat header respons ditentukan sejak
[ADR-0016](../../adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md),
menggantikan snippet nginx yang dirujuk versi awal dokumen ini. CSP portal tidak
boleh melonggar dibanding CSP publik.

Satu hal yang perlu diselesaikan di situ saat portal dibangun: penyaji hari ini
memasang satu set header untuk SELURUH respons, sementara tabel di atas menuntut
`private, no-store` khusus permukaan portal. Aturan per-permukaan itu belum ada,
dan ia bukan pekerjaan yang bisa ditumpangkan diam-diam — cache yang melayani
pengunjung anonim tidak boleh menyentuh respons terautentikasi.

## 7. Penanganan error

- Envelope `awcms` (`{ success, data }` / `{ success: false, error }`)
  diterjemahkan menjadi view model; kode error internal tidak bocor apa adanya ke
  halaman.
- `correlationId` dari `awcms` dicatat di log BFF dan ditampilkan sebagai
  referensi singkat pada halaman error, sehingga keluhan pengguna bisa
  ditelusuri.
- `awcms` tidak tersedia → halaman error jujur + status HTTP yang benar. Jangan
  pernah merender halaman kosong yang tampak berhasil.
- 401 dari `awcms` → bersihkan sesi portal lalu arahkan ke halaman masuk; jangan
  mengulang permintaan diam-diam (itu melahirkan login loop).
