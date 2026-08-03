---
name: awcms-astro-performa-keamanan
description: Pemeriksaan performa dan keamanan awcms-astro terhadap standar yang disebut namanya (OWASP Top 10 2021, ASVS 4.0.3, Secure Headers, ISO 27001 Annex A, NIST SSDF, Core Web Vitals) — apa yang sudah terpenuhi dengan buktinya, sembilan celah yang terbuka, dan lima kontrol yang sengaja DITOLAK. Gunakan sebelum rilis, sebelum go-live sebuah situs turunan, saat menyentuh server/penyaji.mjs atau anggaran performa, atau saat menjawab pertanyaan kepatuhan.
---

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
bun run check          # tipe + lockfile
bun test               # katalog PO, kontrak awcms, header + cache penyaji, CSP keluaran
bun run audit:konten   # sumber gambar; setelah build juga enam gerbang keluaran
bun run audit:dokumen  # tautan, indeks ADR, permukaan kilau, jalur yang disebut dokumen
bun audit --audit-level=low   # kerentanan rantai dependency — WAJIB nol sebelum rilis
```

`bun audit` (kerentanan dependency) dan `bun run audit:konten` (isi situs) adalah
dua hal berbeda; namanya sengaja tidak dibuat mirip.

**Di repo template, dua lapis melewati dirinya** karena tidak ada sumber konten,
dan keduanya mengatakannya di keluaran. **Di sebuah SITUS, "melewati" berarti
tidak berjalan** — jalankan `bun run build` lebih dulu, lalu `bun test` dan
`bun run audit:konten` lagi.

## Header — periksa jumlahnya, bukan hanya nilainya

`server/penyaji.mjs` adalah **satu-satunya** tempat header respons ditentukan
(ADR-0016). Lima yang dikirim, dan kelimanya bernilai sama dengan `awcms`:

```
Content-Security-Policy    default-src 'self'; script-src 'self'; style-src 'self'; …
X-Content-Type-Options     nosniff
X-Frame-Options            DENY
Referrer-Policy            strict-origin-when-cross-origin
Permissions-Policy         geolocation=(), camera=(), microphone=(), payment=()
```

**`awcms` mengirim ENAM di produksi.** Yang keenam
`Strict-Transport-Security: max-age=31536000; includeSubDomains`, digerbangi
`isProduction`. Repo ini tidak mengirimkannya di lingkungan mana pun.

Jangan menerima "TLS diterminasi Traefik" sebagai jawaban: Traefik tidak
memasang HSTS tanpa middleware yang dinyatakan, jadi yang terjadi bukan
"dipasang di tempat lain" melainkan **tidak dipasang di mana pun**. Dan
`AGENTS.md` sudah melarang penyelesaiannya ditaruh di Traefik untuk repo ini.

Melonggarkan atau menambah header **wajib** lewat `tests/penyaji.test.mjs`, dan
bila ia mengubah postur keamanan, lewat ADR lebih dulu.

## Performa — target, bukan hanya anggaran

Core Web Vitals pada **p75 kunjungan nyata**:

| Metrik | Ambang | Yang bisa merusaknya di template ini |
| --- | --- | --- |
| LCP | ≤ 2,5 detik | Ilustrasi artikel tanpa `fetchpriority="high"` (celah 2), atau foto raster tanpa `srcset` (ADR-0024) |
| INP | ≤ 200 milidetik | JS yang menyelinap masuk. Situs ini nyaris tanpa JS, jadi INP buruk **adalah sinyal**, bukan sekadar angka |
| CLS | ≤ 0,1 | Webfont yang ditambahkan tanpa `font-display`, atau bingkai gambar yang kehilangan `aspect-ratio` |

**Belum satu pun diukur** (celah 8). Jangan menulis "memenuhi Core Web Vitals"
di mana pun sampai ada yang mengukurnya.

Anggaran: **beranda ≤ 250 KB gambar, halaman konten ≤ 100 KB.** Ia dibawa dari
repo rujukan dan **belum pernah diukur satu kali pun di sini** (celah 3).

## Sembilan celah — hafal tiga yang teratas

Daftar lengkap beserta pemeriksa yang harus ikut mendarat ada di dokumen
standar. Tiga yang paling sering ditanyakan:

1. **HSTS tidak dikirim** — butuh ADR, karena ia mengubah postur keamanan.
   Pemeriksanya wajib mencakup asersi bahwa ia **tidak** dikirim di luar
   produksi: HSTS di localhost mengunci `bun run serve` di browser pengembang
   selama setahun.
2. **`fetchpriority="high"` tidak ada** pada gambar di atas lipatan, padahal
   `standar-teknis.md` mewajibkannya.
3. **Anggaran gambar tanpa pemeriksa** — dan `scripts/audit-konten.mjs` sudah
   membaca `dist/client`, jadi datanya sudah di tangannya.

## Lima kontrol yang DITOLAK — jangan usulkan lagi tanpa membaca alasannya

Ditulis di dokumen standar §"Yang sengaja TIDAK diadopsi", dan tiga di antaranya
ditolak oleh aturan yang sama:

| Kontrol | Kenapa ditolak |
| --- | --- |
| Pelaporan CSP (`report-to`) | Mengirim URL yang sedang dibuka pembaca ke sebuah pengumpul. Larangan mengumpulkan data pembaca **tidak punya pengecualian "tapi ini untuk keamanan"** |
| RUM untuk mengukur Core Web Vitals | Alasan yang sama. Celah 8 karena itu diarahkan ke pengukuran **lab** di CI, dengan keterbatasannya dinyatakan |
| `Cross-Origin-Resource-Policy: same-origin` menyeluruh | Memblokir situs lain menyematkan gambar dari situs ini — keputusan yang bukan milik sebuah TEMPLATE |
| Subresource Integrity | Tidak ada satu pun sumber daya lintas-origin. SRI tanpa sumber daya eksternal tidak menjaga apa pun |
| Rate limiting / WAF di penyaji | Milik Traefik/Coolify. Dua tempat yang memutuskan hal yang sama adalah cara paling sunyi berakhir tanpa keputusan |

## Sebelum go-live sebuah situs turunan

- [ ] Keempat gerbang hijau **setelah** `bun run build`, bukan sebelum.
- [ ] `bun audit` nol.
- [ ] `bun run serve`, lalu periksa header yang benar-benar terkirim —
      `curl -sI` dan `curl -s -o /dev/null -D -` harus melaporkan hal yang sama
      (paritas GET/HEAD adalah cacat yang sudah pernah terjadi di sini).
- [ ] HSTS terpasang di proxy situsmu, **dan tercatat di ADR bahwa ia dipasang
      di sana** — supaya penggantimu tidak memasang kebijakan kedua.
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
- Di sisi `awcms`: skill `awcms-security-hardening` (matriks OWASP/ASVS/ISO yang
  edisinya disamakan di sini) dan `awcms-performance` (pola akses data — tidak
  berlaku di repo ini, yang tidak punya basis data)
