---
tipe: dokumentasi
dampak: internal
---

# Layar admin kembali ke `awcms`: ADR-0017 di-supersede ADR-0020

`awcms` [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md)
(1 Agustus 2026) memutuskan **seluruh layar admin — tenant maupun
owner/internal/platform — dibangun di `awcms`**, dan men-supersede ADR-0048 yang
merupakan pasangan ADR-0017 repo ini. Keputusan itu sudah dijalankan: sembilan PR
layar admin mendarat di `awcms` pada 1–2 Agustus 2026.

Sampai perubahan ini, `AGENTS.md` repo ini menyatakan hal yang berlawanan —
"repo ini memikul halaman admin owner/internal", lengkap dengan tabel dua
permukaan dan instruksi bahwa layar platform dibangun di sini. Itu bukan
ketidakrapian dokumen: `AGENTS.md` adalah kontrak kerja yang dibaca agen
berikutnya sebelum menulis baris pertama, dan yang ia perintahkan akan mendarat
di repo yang salah.

## Kenapa keputusannya dibalik, dan kenapa bukan karena buntu

Yang menarik: dua kontrak yang ADR-0017 sebut sebagai blocker — header tenant dan
kredensial mesin yang bisa dipegang BFF — justru **sudah mendarat** (ADR-0049 dan
ADR-0050). Jalurnya terbuka, lalu ditutup secara sadar.

Alasan yang menentukan adalah butir yang sudah ditulis ADR-0017 sendiri tanpa
ditarik kesimpulannya: *"izin tidak pindah bersama layar."* Betul — dan karena
itu **risikonya juga tidak pindah**. `awcms` menemukannya sebagai kasus nyata:
permission aktivasi dataset wilayah di-seed ke role `owner` setiap tenant,
sehingga owner tenant biasa memegang izin mengganti data yang dilayani ke seluruh
tenant. Yang menahan aksi lintas-tenant adalah gerbang otorisasi, bukan alamat
repo tempat tombolnya digambar.

Dua alasan lain dari sisi `awcms`: aturan lama hanya mengikat layar **baru**
(sehingga `/admin/*` punya dua kelas layar yang dibedakan tanggal lahirnya), dan
biayanya adalah **13 dari 21 modul tanpa satu pun layar** — 125 berkas route yang
hanya bisa dipakai lewat `curl`, sebagian menunggu repo ini.

## Yang berubah, dan yang sengaja tidak

Tidak ada kode yang dihapus: layar admin di sini tidak pernah ada, dan ADR-0017
sendiri menyatakan layar pertamanya diblokir.

Yang **tetap** berlaku:

- **ADR-0014 tidak tersentuh.** Rute on-demand + BFF portal Jualanku adalah peran
  `awcms` ADR-0045, bukan peran admin, dan ADR-0045 tidak berubah.
- **Empat aturan ADR-0017 dipindahkan utuh ke `AGENTS.md`**, karena keempatnya
  menyangkut permukaan terautentikasi apa pun: `awcms` tetap system of record;
  izin diputuskan `awcms`; tanpa cache bersama; setiap penambahan dinilai sebagai
  permukaan keamanan. Aturan yang hilang bersama ADR yang di-supersede adalah
  aturan yang tidak ada.
- **Kredensial mesin tetap terpakai** untuk hal yang memang dipakainya di sini:
  token build yang menarik konten (ADR-0018).

Repo ini karena itu kembali ke kelas "publik", dan biaya yang ADR-0017 catat —
"berhenti menjadi hanya situs statis" — dibatalkan.

## Satu klaim lain yang berhenti benar

Pembacaan `awcms` yang sama menemukan bahwa
[`src/lib/article-images.ts`](../src/lib/article-images.ts) dan README masih
menyatakan gambar artikel menunggu "endpoint resolusi media di sisi awcms".
**Endpoint itu sudah ada**: `GET /api/v1/media/objects?ids=…` batch-resolve media
id menjadi `{ publicUrl, altText, mimeType, width, height }`, melaporkan id yang
tak teresolusi alih-alih membuangnya, dan digerbangi
`media_library.media.read` — permission baca-saja yang boleh dipegang kredensial
mesin. Docstring-nya di `awcms` menyebut berkas repo ini sebagai alasan ia
dibuat, dan feed build sudah membawa `featuredMediaId` di setiap baris penuh.

Sisa pekerjaannya berpindah ke repo ini dan berubah sifat: bukan lagi kontrak
yang buntu, melainkan dua keputusan — di mana gambar hasil resolusi tinggal
(`LocalizedArticle`, di-resolve sekali per build; bukan modul sinkron yang
dipanggil komponen), dan apa yang diizinkan `img-src` (host media ber-origin
lain, jadi CSP ADR-0019 memblokirnya sampai origin itu dinyatakan). Keduanya
ditulis di kedua berkas itu, sehingga yang membacanya berikutnya tidak mengira
jalurnya masih tertutup.
