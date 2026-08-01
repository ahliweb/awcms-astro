---
tipe: struktur
dampak: publik
---

# Gerbang audit konten: memeriksa yang TERBIT, bukan yang tertulis

`scripts/audit-konten.mjs` dan `bun run audit:konten`. README mendaftarkan
gerbang ini sebagai butir backlog pertama dan menyebutnya "yang membuat standar
ini punya gigi"; butir gerbang rasio gambar menunggunya. Keduanya selesai di
sini.

Alasannya bukan kelengkapan. Setiap kelas cacat di bawah **tidak menggagalkan
apa pun** saat terjadi: `astro check` bersih, `bun test` hijau, build sukses,
situs terbit — dan pembacanya mendapat halaman yang rusak dengan cara yang tidak
dilihat penulisnya.

## Keluaran build (`dist/client/**`)

| Gerbang | Yang tidak gagal sendiri |
| --- | --- |
| `seo` | Halaman tanpa `<title>` atau meta description; canonical hilang pada halaman yang bukan `noindex`; `noindex` yang tetap memasang canonical; judul kembar di dalam SATU locale |
| `hreflang` | Alternate yang menunjuk halaman tidak ada, `x-default` hilang, dan **kelompok yang pincang** — A menunjuk B, B tidak menunjuk balik. Mesin pencari mengabaikan kelompok semacam itu, jadi seluruh sinyal multi-bahasa hilang tanpa satu pun halaman terlihat rusak |
| `aset-dijanjikan` | `og:image`, `twitter:image`, dan `ImageObject` JSON-LD yang menunjuk berkas yang tidak diterbitkan build ini |
| `tautan-mati` | `href`/`src` internal yang tidak menyelesaikan ke berkas mana pun |
| `sitemap` | `<loc>` yang mendaftarkan halaman yang tidak dibangun |
| `key-bocor` | Nama key mentah yang tampil sebagai teks layar |
| `json-ld` | Blok JSON-LD yang tidak bisa di-parse — crawler mengabaikannya diam-diam, dan seluruh data terstruktur halaman itu hilang |

Dua di antaranya bukan hipotesis. Template ini pernah memasang `og:image` ke
`/social/<slug>.png` yang tidak pernah dibangkitkan siapa pun, di setiap
halaman; dan pernah menerbitkan `translation.notice.label` serta
`biaya.jenis.pnbp` sebagai teks yang dibaca pembaca, di kedua bahasa.

`key-bocor` melengkapi `tests/katalog-po.test.mjs`, tidak menggantikannya. Tes
itu menolak key LITERAL yang tidak ada di katalog dan tidak bisa melihat key
yang dirangkai saat build. Di keluaran, key dinamis tidak lagi dinamis — ia teks
biasa. Presisinya datang dari namespace: hanya teks berbentuk key dari namespace
yang benar-benar dipakai katalog situs ini yang ditandai, sehingga `example.com`
di dalam kalimat tidak ikut terjaring.

## Sumber gambar (`src/assets/**`, `public/**`)

Rasio terhadap `--ratio-visual` — dibaca dari `global.css`, bukan ditulis ulang
di skrip — termasuk `viewBox` SVG. Format dibaca dari **isi** berkas: sebelas
berkas di repo rujukan ber-ekstensi `.png` padahal isinya JPEG. `&` telanjang di
SVG, yang membuat browser gagal merender tanpa satu pun pesan error. Dan ukuran
teks terkecil, dengan ambang 22px pada kanvas 800px yang diskalakan terhadap
lebar `viewBox`.

Format yang dimensinya belum bisa dibaca gerbang ini **dilaporkan sebagai
pelanggaran**, bukan dilewati. Gerbang yang melewati apa yang tidak dikenalinya
bisa dilewati dengan mengganti format.

`public/` sengaja tidak diperiksa rasionya dan skripnya mengatakan itu setiap
kali berjalan: favicon wajib bujur sangkar dan kartu share punya ukuran bakunya
sendiri (1200×630). Memaksa rasio tunggal di sana akan menolak berkas yang
justru benar.

## Yang tetap manual, dan disebut terus terang

Teks di dalam gambar hanya label topik, dan tanpa lambang atau atribut instansi
negara. Tidak ada pemeriksa yang bisa menilai keduanya. Aturan yang tampak
terjaga padahal tidak lebih berbahaya daripada aturan yang jelas-jelas manual.

## Di mana ia berjalan

CI job `check` menjalankannya tanpa `dist/` — hanya gerbang gambar yang jalan,
dan skripnya menyatakan sisanya dilewati. Job `build` menjalankannya lagi
setelah build, dan `Dockerfile` menjalankannya di dalam image, tempat `dist/`
selalu ada. Gerbang yang diam saat tidak berjalan adalah gerbang yang tidak ada,
jadi skrip ini selalu mencetak apa yang diperiksanya dan apa yang tidak.
