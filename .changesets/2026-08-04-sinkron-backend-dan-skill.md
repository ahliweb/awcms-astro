---
tipe: dokumentasi
dampak: internal
---

# Penahanan ADR-0021 selesai, dan template mendapat skill-nya sendiri

## Kedua indikator ADR-0021 terpenuhi

ADR-0021 menahan pengembangan repo ini "sampai fondasi `awcms` selesai" dengan
dua indikator, dan menuliskan risikonya sendiri: *"kalau keduanya sudah nol dan
penahanan masih berlaku, itu pertanyaan yang layak diajukan."*

Keduanya nol. Indikator pertama terpenuhi 3 Agustus; yang kedua 4 Agustus lewat
`awcms` ADR-0059 (rute konten host-resolved `/news/**`) dan ADR-0060 (penyedia
business-scope resolver, yang sebelumnya NO-OP fail-closed).

Yang menutupnya bukan pembacaan dari sini: `awcms` menganalisis kesiapan repo ini
**ke kode**, menemukan bahwa repo ini hanya menyentuh lima permukaan dan
kelimanya lengkap, menutup satu-satunya gap nyata (`GET /api/v1/media/public-origin`),
lalu menulis **"Yang tersisa DAN milik repo ini: nol."**

[ADR-0027](../docs/adr/0027-penahanan-adr-0021-selesai.md) mencatatnya dan
men-supersede ADR-0021. **Uji ADR-0023 tidak ikut dicabut** — ia tidak pernah
tentang kesiapan `awcms`, melainkan tentang apakah repo template ini bisa
MEMBUKTIKAN sebuah panggilan benar. Ia tetap tidak punya instans.

## Dokumen yang disinkronkan dengan backend

- **ADR-0021 §Kapan dicabut** — catatan "BELUM, per 3 Agustus" dikoreksi; dua
  dari tiga butirnya ditutup dan yang ketiga (`newsletter`,
  `social-publishing`, `src/components/ui/`) ternyata tidak pernah memblokir
  repo ini.
- **Backlog BFF portal** — fondasinya kini lengkap di `awcms`. Yang menahannya
  bukan lagi kontrak yang hilang melainkan uji ADR-0023, plus satu ADR admission
  di sisi sana untuk bentuk scope merchant Jualanku.
- **`04-kesiapan.md`** — butir 3 (kontrak sesi) ditandai selesai, dan tabelnya
  diberi konteks supaya tidak terbaca sebagai "tinggal butir 4–7".

## Template mendapat skill

Repo ini menyuruh setiap situs turunannya mengisi `.claude/skills/` sementara ia
sendiri tidak punya satu pun — kelas cacat yang sama dengan lima yang sudah
ditemukan minggu ini. Tiga skill mendarat, ditulis untuk template dan karena itu
tetap benar di situs turunan mana pun:

| Skill | Isi |
| --- | --- |
| `awcms-astro-integrasi` | Lima permukaan `awcms`, penolakan yang wajib ditiru tiruan tes, gambar/kartu share, `img-src` yang ditanyakan |
| `awcms-astro-gerbang` | Empat gerbang, apa yang TIDAK ditangkap, dan aturan "aturan baru wajib membawa pemeriksanya" |
| `awcms-astro-situs-baru` | "Use this template" → situs: yang dikosongkan, urutan kontrak→konten→tampilan, jebakan |

**Tiga, bukan lima puluh.** `awcms` punya 54 skill karena ia punya 21 modul
domain; repo ini punya satu tanggung jawab. Skill yang memerikan sesuatu yang
tidak ada di sini lebih berbahaya daripada skill yang tidak ada.

Ketiganya tunduk pada gerbang yang sama dengan dokumen lain: `.claude/` tidak
dikecualikan `audit:dokumen`, jadi 16 jalur berkas yang mereka sebut diperiksa
benar-benar ada.
