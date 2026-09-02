---
name: awcms-astro-performa-keamanan
description: Pemeriksaan performa dan keamanan awcms-astro terhadap standar yang disebut namanya (OWASP Top 10 2021, ASVS 4.0.3, Secure Headers, ISO 27001 Annex A, NIST SSDF, Core Web Vitals) — apa yang sudah terpenuhi dengan buktinya, sepuluh celah bernomor yang seluruhnya tertutup beserta dua batas yang tetap dinyatakan (.astro tak teranalisis statik; CWV diukur lab, bukan kunjungan nyata), dan lima kontrol yang sengaja DITOLAK. Gunakan sebelum rilis, sebelum go-live sebuah situs turunan, saat menyentuh server/penyaji.mjs atau anggaran performa, atau saat menjawab pertanyaan kepatuhan.
---

🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](SKILL.md)

<!-- i18n-source-hash: sha256:fc2714082ecc8050469a950dd180cb29bb0cf9ec8060bba3fa7f9c08873594ed -->

# awcms-astro — performa dan keamanan

Sumber kebenaran: [`docs/awcms-astro/standar-performa-dan-keamanan.md`](../../../docs/awcms-astro/standar-performa-dan-keamanan.md)
([ADR-0028](../../../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md)).
Skill ini prosedurnya; dokumen itu matriksnya.

**Aturan pertama, dan ia yang paling sering dilanggar saat menjawab pertanyaan
kepatuhan: jangan menjawab dari ingatan.** Tiap baris "Terpenuhi" di dokumen itu
menyebut berkasnya. Buka berkasnya. Repo ini sudah mencatat sebelas dokumen yang
menyatakan sesuatu yang tidak ada, dan sebuah matriks kepatuhan adalah bentuk
dokumen yang paling mudah menjadi nomor dua belas — kolom "Keadaan"-nya **tidak
bisa digerbangi mesin**.

## Yang dijawab lima menit

```bash
bun run check             # tipe + lockfile
bun test                  # katalog PO, kontrak awcms, peran situs, kosakata news, penyaji, CSP keluaran, toolchain
bun run audit:konten      # sumber gambar; setelah build sembilan keluarga keluaran + dua gerbang performa
bun run audit:dokumen     # tautan, indeks ADR, permukaan kilau, jalur yang disebut dokumen
bun run audit:translation # cermin basi, dan dokumen mana yang belum punya cermin sama sekali
bun run audit:graf        # artefak graphify-out/ — nama komunitas yang benar-benar dipilih
bun audit --audit-level=low   # kerentanan rantai dependency — WAJIB nol sebelum rilis
```

`bun run release <tingkat> --apply` menjalankan **enam dari ketujuhnya**, dalam
urutan yang berarti — `bun test` dan `bun run audit:konten` SESUDAH build, karena
tiga lapisnya melewati diri tanpa `dist/`. Sampai 4 Agustus 2026 perilis
melewatkan `bun test` dan `bun audit` sepenuhnya, sementara empat dokumen
menuntut keduanya ([ADR-0030](../../../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)).
Yang ketujuh, `audit:translation`, berjalan di CI pada tiap push tetapi **tidak**
di perilis — jadi cermin yang basi tertangkap sebelum merge, bukan saat rilis,
dan selisih itu lebih baik diketahui daripada dikira.

`bun audit` (kerentanan dependency) dan `bun run audit:konten` (isi situs) adalah
dua hal berbeda; namanya sengaja tidak dibuat mirip.

**Di repo template, dua lapis melewati dirinya** karena tidak ada sumber konten,
dan keduanya mengatakannya di keluaran. **Di sebuah SITUS, "melewati" berarti
tidak berjalan** — jalankan `bun run build` lebih dulu, lalu `bun test` dan
`bun run audit:konten` lagi.

## Header — periksa jumlahnya, bukan hanya nilainya

`server/penyaji.mjs` adalah **satu-satunya** tempat header respons ditentukan
(ADR-0016). Lima dikirim di setiap lingkungan, dan kelimanya bernilai sama
dengan `awcms`:

```
Content-Security-Policy    default-src 'self'; script-src 'self'; style-src 'self'; …
X-Content-Type-Options     nosniff
X-Frame-Options            DENY
Referrer-Policy            strict-origin-when-cross-origin
Permissions-Policy         geolocation=(), camera=(), microphone=(), payment=()
```

Yang keenam **hanya di produksi** (ADR-0029):

```
Strict-Transport-Security  max-age=31536000        ← NODE_ENV=production saja
```

Dua hal yang paling sering salah dipahami tentang baris itu:

- **Gerbang produksinya bukan kerapian.** HSTS tidak bisa dibatalkan dari sisi
  situs dan berlaku untuk HOST, bukan untuk situs. `bun run serve` menjalankan
  berkas yang sama dengan produksi — sekali ia mengirim HSTS di `localhost`,
  SETIAP proyek lain di `http://localhost:<port>` ikut terkunci selama setahun,
  tanpa cara mencabutnya selain menyunting internal browser. Asersi yang
  menjaganya karena itu **terbalik arah**: yang diuji adalah HSTS TIDAK dikirim
  di luar produksi.
- **`includeSubDomains` sengaja tidak ada, berbeda dari `awcms`.** `awcms` satu
  deployment yang operatornya tahu subdomainnya; template ini berjalan di domain
  milik organisasi yang hampir pasti punya layanan lain di subdomain lain.
  Menambahkannya adalah keputusan sebuah SITUS yang subdomainnya memang
  seluruhnya HTTPS — di penyaji, lalu perbarui `tests/penyaji.test.mjs`.

`Server` dan `X-Powered-By` dihapus `pasangHeader`, dan ketiadaannya diasersi.

Melonggarkan atau menambah header **wajib** lewat `tests/penyaji.test.mjs`, dan
bila ia mengubah postur keamanan, lewat ADR lebih dulu.

## Performa — target, bukan hanya anggaran

Core Web Vitals pada **p75 kunjungan nyata**:

| Metrik | Ambang | Yang bisa merusaknya di template ini |
| --- | --- | --- |
| LCP | ≤ 2,5 detik | Ilustrasi artikel tanpa `fetchpriority="high"` (celah 2), atau foto raster tanpa `srcset` (ADR-0024) |
| INP | ≤ 200 milidetik | JS yang menyelinap masuk. Situs ini nyaris tanpa JS, jadi INP buruk **adalah sinyal**, bukan sekadar angka |
| CLS | ≤ 0,1 | Webfont yang ditambahkan tanpa `font-display`, atau bingkai gambar yang kehilangan `aspect-ratio` |

**LCP dan CLS diasersi LAB di CI sejak ADR-0032** — Lighthouse di job `build`,
hanya pada situs yang punya sumber konten; di repo template langkah itu tidak
berjalan. INP tidak terukur di lab, jadi TBT ≤ 200 ms dipakai sebagai proksi
dan disebut proksi. Yang diaudit **sampel**: hingga 10 URL sampai kedalaman 4
— batas yang DIPILIH di `lighthouserc.json` dan diasersi `tests/cwv-lab.test.mjs`;
bawaan lhci diam-diam berhenti di 5 URL terdangkal dan tidak pernah mencapai
halaman artikel berlokal. **Jangan menulis "memenuhi Core Web Vitals" dari
hasil lab** — lab mengukur halaman, bukan pembaca, dan p75 kunjungan nyata
tetap tidak diukur karena RUM ditolak.

Anggaran: **beranda ≤ 250 KB gambar, halaman konten ≤ 100 KB.** Sejak 4 Agustus
2026 ia **diukur** `bun run audit:konten` atas `dist/client`, per halaman — yang
ditimbang hanya gambar yang benar-benar diterbitkan build ini, karena media
`awcms` tidak ada di sana.

**Anggaran byte untuk skrip dan stylesheet adalah gerbang lain**, `bun run
audit:aset`, dan plafonnya tinggal di `scripts/audit-aset.mjs`: **13.000 B skrip
dan 40.000 B total per halaman**, ditambah 8.000 B untuk satu berkas skrip
terbit. Setiap angkanya adalah PENGUKURAN berikut ruang di atasnya, bukan angka
bulat yang disukai seseorang — plafon skrip mula-mula ditulis 9.000 dari hitungan
tangan yang melewatkan sebagian blok inline, dan gerbangnya mengoreksinya pada
jalan pertama.

Totalnya berpindah 36.000 → 40.000 pada 2 September 2026, saat redesign beranda
menjadikan `/` halaman terberat pada 38.136 B. Baca apa yang terjadi sebelum
mengutip angka barunya: gerbangnya dibiarkan menggigit lebih dulu, dan yang
ditemukannya adalah CSS hero yang duduk di `src/styles/global.css` sementara satu
komponen memakainya — setiap halaman artikel, seksi, dan pencarian mengunduhnya.
Memindahkan blok itu memulangkan 1.853 B ke setiap halaman, dan yang tersisa
untuk membenarkan kenaikan hanyalah permukaan yang benar-benar baru.
**`audit:aset` yang merah adalah pertanyaan tentang aturan ini ada di berkas mana
sebelum ia menjadi pertanyaan tentang plafon.**

Apa yang masih salah dan sengaja tidak diperbaiki di sana dicatat di dalam
skripnya: `BaseLayout.css` berukuran 22.577 B dan masih mengirim gaya badan
artikel, tabel biaya, dan akordeon ke halaman yang tidak punya satu pun di
antaranya.

## Sepuluh celah — seluruhnya tertutup, dua batas tetap dinyatakan

Kesepuluhnya (1 HSTS, 2 `fetchpriority`, 3 anggaran gambar, 4 batas waktu
`awcmsGet`, 5 header pembocor, 6 pin SHA/digest, 7 analisis statik, 8 Core Web
Vitals lab, 9 SBOM rilis, dan **10** pemeriksa celah 2 dan 3 yang tidak pernah
dieksekusi satu kali pun di repo tempat keduanya ditulis — ditutup 6 Agustus
2026 oleh `tests/audit-konten.test.mjs` yang menjalankan skripnya atas pohon
fixture) **tetap tercatat di tabel dokumen standar** beserta
pemeriksanya masing-masing. Jangan hapus barisnya: dihapus, celahnya akan
diusulkan lagi sebagai temuan baru enam bulan kemudian, dan pemeriksanya akan
dilonggarkan oleh orang yang tidak tahu kenapa ia ada.

Dua penutupan terakhir (ADR-0032) membawa **syarat kejujuran** yang harus ikut
disebut setiap kali menjawab pertanyaan kepatuhan:

| Klaim yang benar | Klaim yang TERLALU BESAR — jangan tulis |
| --- | --- |
| "Permukaan JS/TS dianalisis CodeQL terjadwal; `.astro` tidak, dan ringkasan tiap run menyatakannya" | "Repo ini dianalisis statik" tanpa menyebut batas `.astro` |
| "LCP dan CLS diasersi LAB di CI situs atas sampel ≤10 halaman (TBT 200 ms sebagai proksi INP)" | "Memenuhi Core Web Vitals" — itu klaim p75 kunjungan nyata, yang tidak diukur karena RUM ditolak; dan "diukur atas dist/client" tanpa kata SAMPEL |

## Lima kontrol yang DITOLAK — jangan usulkan lagi tanpa membaca alasannya

Ditulis di dokumen standar §"Yang sengaja TIDAK diadopsi", dan tiga di antaranya
ditolak oleh aturan yang sama:

| Kontrol | Kenapa ditolak |
| --- | --- |
| Pelaporan CSP (`report-to`) | Mengirim URL yang sedang dibuka pembaca ke sebuah pengumpul. Larangan mengumpulkan data pembaca **tidak punya pengecualian "tapi ini untuk keamanan"** |
| RUM untuk mengukur Core Web Vitals | Alasan yang sama. Celah 8 karena itu diarahkan ke pengukuran **lab** di CI, dengan keterbatasannya dinyatakan |
| `Cross-Origin-Resource-Policy: same-origin` menyeluruh | Memblokir situs lain menyematkan gambar dari situs ini — keputusan yang bukan milik sebuah TEMPLATE. `awcms` mengirimnya (bersama COOP) untuk memagari sesi adminnya; sejak 5 Agustus 2026 selisih itu tercatat sebagai divergence ber-`reviewDate` di manifest keluarga sana (ADR-0069 di sana), jadi **jangan "perbaiki" ke arah paritas** — situs yang membutuhkannya memutuskannya lewat ADR di repo situs itu |
| Subresource Integrity | Tidak ada satu pun sumber daya lintas-origin. SRI tanpa sumber daya eksternal tidak menjaga apa pun |
| Rate limiting / WAF di penyaji | Milik Traefik/Coolify. Dua tempat yang memutuskan hal yang sama adalah cara paling sunyi berakhir tanpa keputusan |

## Sebelum go-live sebuah situs turunan

- [ ] Keenam gerbang hijau **setelah** `bun run build`, bukan sebelum.
- [ ] `bun audit` nol.
- [ ] **Bila situs itu menyatakan `permukaanAdmin`, checklist ini belum cukup.**
      Begitu ada satu rute yang meminta pembacanya masuk, ada sesi, ada form,
      ada CSRF; cache publik dan cache terautentikasi WAJIB dipisah; postur
      ADR-0019 berlaku di jalur yang membawa kredensial; target aksesibilitas
      naik ke WCAG 2.2 AA; dan A01/A07/A09 OWASP kembali berlaku. Yang paling
      mudah terlewat: **dua dari lima kontrol yang ditolak di tabel di bawah
      ditolak dengan alasan yang berhenti berlaku persis di situs seperti itu**
      — COOP ("tidak punya sesi untuk dipagari") dan SRI ("tidak ada sumber daya
      lintas-origin"). Keduanya premis, bukan prinsip. Daftar lengkapnya di
      [`docs/awcms-astro/permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md) §3.
- [ ] `bun run serve`, lalu periksa header yang benar-benar terkirim —
      `curl -sI` dan `curl -s -o /dev/null -D -` harus melaporkan hal yang sama
      (paritas GET/HEAD adalah cacat yang sudah pernah terjadi di sini).
- [ ] `NODE_ENV=production` terpasang, sehingga penyaji mengirim HSTS
      (ADR-0029; image `Dockerfile` menyetelnya). **Jangan pasang kebijakan
      HSTS kedua di Traefik** — dua sumber kebijakan yang saling menimpa adalah
      cara paling sunyi berakhir tanpa kebijakan; kalau proxy-mu telanjur
      memasangnya, pilih satu sumber dan catat di ADR situsmu.
- [ ] `AWCMS_TENANT_ID` terisi. Ia opsional dan tidak memilih apa pun; yang ia
      cegah adalah token tenant lain membangun situs penuh berisi artikel milik
      orang lain, dengan build hijau.
- [ ] `SITE_SOCIAL_IMAGE` kosong **atau** menunjuk berkas yang benar-benar ada.
      Kosong adalah keadaan yang didukung; menunjuk 404 tidak.
- [ ] Kontras token diaudit terukur bila token warnanya diubah — repo ini
      **belum** pernah menjalankan audit itu atas token bawaannya.

## Rujukan

- [`docs/awcms-astro/standar-performa-dan-keamanan.md`](../../../docs/awcms-astro/standar-performa-dan-keamanan.md)
- [`docs/adr/0028-jangkar-standar-performa-dan-keamanan.md`](../../../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md)
- [`docs/adr/0019-csp-ketat-dikirim-penyaji.md`](../../../docs/adr/0019-csp-ketat-dikirim-penyaji.md)
- [`docs/adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md`](../../../docs/adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)
- [`AGENTS.md`](../../../AGENTS.md) §Keamanan, §Penyajian, §Standar luar
- [`docs/awcms-astro/permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md) — apa yang berubah begitu sebuah situs menyatakan permukaan admin USER
- Di sisi `awcms`: ADR-0068 (pin edisi standar keluarga — Top 10 2021, ASVS
  4.0.3, API Security 2023, ISO 27001:2022, SSDF v1.1 — kelimanya ditinjau
  ulang 2027-02-04; ISO/IEC 25010:2023 dipakai kedua repo tetapi TIDAK termasuk
  pin itu — dengan **lima** entri divergence, termasuk HSTS
  repo ini dan `astro-files-not-type-checked` yang menyandarkan diri pada pin
  TypeScript 6.x di sini), ADR-0065 (kontrak konsumen `awcms-astro` dibekukan dan
  digerbangi di sana), ADR-0092 (kredensial mesin boleh MENULIS — premis
  "baca-saja" berhenti menjadi sifat kelas), skill `awcms-security-hardening`
  (matriks OWASP/ASVS/ISO yang edisinya disamakan di sini), dan
  `awcms-performance` (pola akses data — tidak berlaku di repo ini, yang tidak
  punya basis data)
- **Status ADR-0067 di sisi `awcms` sudah berubah**, dan kalimat keluarga
  "kedua repo mengukur LAB dan tidak satu pun mengukur lapangan" punya tanggal
  kedaluwarsa yang sudah diketahui: ADR itu kini `Accepted (belum
  diimplementasikan)` dengan **Opsi B** diputuskan 8 Agustus 2026 — agregasi di
  titik masuk, tanpa baris mentah per kunjungan. Begitu ia dibangun, satu repo
  mengukur lapangan dan repo ini tidak, karena RUM di sini ditolak permanen
  (ADR-0032 §B)
