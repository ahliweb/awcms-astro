---
tipe: struktur
dampak: internal
---

# Gerbang permukaan kilau — dokumen yang meminta pemeriksanya sendiri, lalu menyimpang persis seperti yang ia ramalkan

`ui-ux-design-system.md` menyebut daftar permukaan kilau "kontrak, bukan
kumpulan kebetulan", menunjuk penanda di `src/styles/global.css`, dan menutup
paragrafnya dengan pengakuan:

> di `awcms-astro` pemeriksa itu **belum ada**, jadi kesesuaiannya saat ini
> dijaga mata pembaca kode — dan itu berarti ia akan menyimpang

Ia sudah menyimpang. Tabelnya mendaftarkan **`.wilayah-filter-btn`**, tombol
filter wilayah milik repo rujukan yang tidak pernah ada di template ini — tidak
di CSS, tidak di satu komponen pun. Sebuah baris yang menjanjikan permukaan
berkilau pada tombol yang tidak ada tidak akan pernah terlihat salah oleh
siapa pun yang membaca dokumennya saja.

## Yang mendarat

`bun run audit:dokumen` mendapat gerbang keempat: daftar selector di antara
`kilau:permukaan:mulai`/`:selesai` pada `global.css` dibandingkan **dua arah**
dengan tabel bertanda di dokumen. Permukaan baru yang lupa dicatat memerahkan CI
sama seperti baris tabel yang permukaannya tidak ada.

Tiga keadaan yang sengaja **tidak** lewat diam-diam:

- **Penanda tidak lengkap** — bukan "tidak ada yang dibandingkan", melainkan
  pelanggaran. Penanda yang hilang adalah cara termudah mematikan gerbang ini
  tanpa terlihat.
- **Satu sisi hilang sementara pasangannya ada** — kontrak yang salah satu
  sisinya lenyap bukan kontrak yang terpenuhi.
- **Kedua sisi tidak ada** — situs yang menghapus dokumen design system-nya
  dilewati, dan gerbangnya **mengatakannya**.

Enam kasus tes, tiap arah cacat merah saat cacatnya ada dan hijau saat tidak.

## Dua koreksi yang ikut

- **`.wilayah-filter-btn` dilepas dari tabel.** Diverifikasi ke kode, bukan ke
  ingatan: string itu tidak muncul di mana pun di `src/`.
- **Seksi Gambar berhenti mengklaim `astro:assets`.** Ia berbunyi "`<Image>`
  dari `astro:assets`, tidak pernah `<img>` mentah" — sementara
  [ADR-0024](../docs/adr/0024-seni-lokal-di-src-assets.md) memilih `<img>` di
  atas URL hasil `import.meta.glob`, dan `astro:assets` tidak dipakai satu kali
  pun di repo ini. Sekarang ia menyebut keputusannya beserta konsekuensi yang
  diterima (tanpa `srcset`, raster tidak di-encode ulang) dan apa yang menutup
  celah pemotongan (`object-fit: cover` + gerbang rasio `audit:konten`).

## Satu hint yang akhirnya bersih

`tests/keluaran-csp.test.mjs` mendestrukturisasi `nama` yang tak pernah dipakai,
sehingga setiap `astro check` — di setiap PR, sejak berkas itu ditulis —
melaporkan satu hint. `bun run check` kini **0 errors, 0 warnings, 0 hints**:
keluaran yang bersih adalah keluaran yang orang masih baca saat baris pertama
muncul di sana.
