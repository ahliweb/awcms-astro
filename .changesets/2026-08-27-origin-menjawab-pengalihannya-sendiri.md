---
bump: minor
tipe: struktur
dampak: publik
---

# Origin ini tidak bisa menjawab satu pun pengalihan, dan itu diukur

Bukan "belum dikonfigurasi" — tidak ada kodenya. `astro.config.mjs` memakai
`output: "static"` tanpa kunci `redirects`, tidak ada berkas middleware, dan
`server/penyaji.mjs` tidak memuat satu pun kemunculan `301` atau `Location`.

`awcms` tidak menduganya; ia mengukurnya. ADR-0114-nya memutar-ulang **67 aturan
redirect terhadap server hasil build repo ini dan mendapat 404 pada setiap
satunya, dengan nol header `Location`.** Aturan-aturan itu ditulis ke
`awcms_seo_redirects`, yang diterapkan di satu tempat saja — di aplikasi ITU —
sementara targetnya rute yang dilayani di sini.

Kewajiban cutover-nya sudah ditarik `awcms` ADR-0116. Celahnya tidak: sebuah
situs turunan tetap tidak punya jawaban apa pun untuk URL yang dulu bekerja —
tab yang diganti nama, artikel yang di-slug ulang, seksi yang digabung.

## Tanggung jawabnya dibelah, dan tiap separuh diletakkan di tempat ia bisa dibuktikan

| Pengalihan | Pemilik |
| --- | --- |
| Slug diganti, seksi digabung, halaman pindah | **origin ini** |
| `http`→`https`, `www`→apex | **edge** |
| Memindahkan seluruh domain terindeks | **edge** |

Separuh milik origin tinggal di repositori ini karena ia ditinjau, diversikan,
dan **digerbangi** — dan itulah separuh yang memikul beban keputusannya. Prinsip
ADR-0032 berlaku langsung: gerbang yang tidak bisa dibuktikan di tempat ia
ditulis akan membusuk, dan konfigurasi edge tidak bisa diuji `bun test`.

Separuh milik edge tidak dibantah. Hanya edge yang bisa meruntuhkan protokol +
host + path menjadi satu lompatan yang dituntut PRD §9.2, dan itu persis alasan
`awcms` ADR-0114 memilihnya untuk cutover-nya.

## Tiga aturan yang gagal tanpa berbunyi, masing-masing dengan pemeriksanya

- **Rantai** — target yang juga menjadi kunci berarti dua lompatan.
- **Putaran** — tab browser yang menggantung.
- **Bentuk non-kanonik** — target tanpa garis miring penutup menukar satu 404
  dengan halaman yang menyangkal dirinya sendiri; KUNCI non-kanonik sama sekali
  tidak pernah cocok, sebuah aturan yang penulisnya kira bekerja.

## Yang dibuktikan, bukan hanya ditulis

Tes terpentingnya menjalankan **server sungguhan** dan menegaskan `301`
mendahului handler aplikasi — karena yang selama ini salah bukan logikanya
melainkan bahwa tidak ada yang memanggilnya. Versi pertama tesnya tidak bisa
membuktikan itu (peta template kosong), jadi petanya dibuat bisa disuntik.

Header keamanan ikut diasersi pada 301: sebuah pengalihan tetap respons, dan
celah header di jalur yang jarang diuji adalah celah yang tidak dilihat siapa
pun. Query dibawa serta, supaya pembaca yang tiba dari kampanye tidak kehilangan
atribusinya karena halamannya pindah.

## Peta template ini KOSONG, dan itu keputusan

Sebuah template tidak punya sejarah URL. Contoh yang ditinggalkan di sini akan
tersalin ke setiap situs turunan sebagai pengalihan **hidup** menuju halaman yang
tidak pernah ada.

Tidak ada berkas baru yang wajib disalin `Dockerfile`: petanya modul yang
di-inline `bun build`, sengaja berbeda dari `asal-media.json` — yang itu membawa
nilai dari awcms saat build dan Dockerfile yang melupakannya adalah jebakan yang
sudah didokumentasikan repo ini.

Dicatat sebagai [ADR-0047](../docs/adr/0047-this-origin-answers-its-own-content-redirects-and-the-edge-keeps-the-rest.md),
dan `docs/deploy-coolify.md` akhirnya menyebut lapis redirect-nya.
