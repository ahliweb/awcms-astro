---
tingkat: minor
tanggal: 2026-08-04
---

# Postur performa dan keamanan punya nama, dan celahnya punya nomor

Repo ini sudah punya CSP ketat yang benar-benar dikirim, lima header keamanan
yang dibuktikan tes, larangan HTML mentah yang ditegakkan renderer, dan empat
gerbang di CI. Yang tidak ada adalah **nama luar** bagi semua itu — dan
ketiadaan nama membuat dua hal mustahil: menjawab pertanyaan kepatuhan, dan
melihat apa yang belum ada.

[`docs/awcms-astro/standar-performa-dan-keamanan.md`](../docs/awcms-astro/standar-performa-dan-keamanan.md)
sekarang memetakan tiap kontrol ke standar yang menamainya — OWASP Top 10 2021,
ASVS 4.0.3, Secure Headers Project, ISO/IEC 27001:2022 Annex A, NIST SSDF
SP 800-218, Core Web Vitals, RFC 9111 — dengan edisi OWASP **disamakan dengan
`awcms`**, karena dua repo keluarga pada dua edisi berbeda menghasilkan dua
matriks yang tidak bisa dijumlahkan.
[ADR-0028](../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md) mencatat
keputusannya, dan `awcms-astro-performa-keamanan` menjadikannya prosedur.

## Satu selisih nyata dari `awcms` yang ditemukan justru oleh pemetaan itu

Empat berkas menyatakan penyaji mengirim "lima header keamanan … disamakan
dengan postur `awcms`". Kelimanya memang identik **nilainya**. Jumlahnya tidak:
`awcms` mengirim enam di produksi, dan yang keenam `Strict-Transport-Security`.

Alasan yang selama ini terbaca masuk akal — "TLS diterminasi Traefik" — tidak
bertahan diperiksa. Traefik tidak memasang HSTS tanpa middleware yang
dinyatakan, jadi yang terjadi bukan "dipasang di tempat lain" melainkan **tidak
dipasang di mana pun**. Ia sekarang celah bernomor 1 dari sembilan, masing-masing
dengan pemeriksa yang harus ikut mendarat saat ia ditutup.

Selisih ini tidak ditemukan oleh review kode. Ia ditemukan saat kedua postur
diletakkan berdampingan di satu tabel — yang sebelum ini tidak ada.

## Enam dokumen yang menyatakan sesuatu yang tidak ada

Repo ini sudah mencatat lima; pembacaan hari ini menemukan enam lagi, dan
kelimanya punya bentuk yang sama — kalimat yang **benar saat ditulis**, lalu
sebuah ADR mengubah kodenya, lalu kalimatnya tidak ikut:

- `AGENTS.md`, `README.md`, dan `CONTRIBUTING.md` masih menyatakan pengembangan
  **DITAHAN**, tiga jam setelah ADR-0027 mengakhirinya. Yang menggantikannya
  bukan "bebas": uji ADR-0023 tetap berlaku, dengan premis baru yang tidak akan
  kedaluwarsa.
- `integrasi-awcms.md` berbunyi "Adapter belum ada" sementara 120 baris di
  bawahnya berbunyi "perpindahan itu sudah terjadi". Yang salah adalah yang
  dibaca lebih dulu.
- `standar-teknis.md` mewajibkan `<Image>` dari `astro:assets` dan melarang
  `<img>` mentah — dibantah ADR-0024 **dan oleh tabel di berkas yang sama**.
- `standar-teknis.md` mewajibkan kartu share PNG dan melarang WebP — dibantah
  ADR-0026, yang membuat kartu artikel membawa MIME-nya sendiri.
- `standar-teknis.md` dan `ui-ux-design-system.md` menyebut tema dipasang skrip
  **inline** sebelum paint. Sejak ADR-0019 skrip inline justru mati di browser
  pembaca; yang benar `public/tema.js`.
- `standar-teknis.md` mewajibkan tiga dokumen yang repo rujukan standar itu —
  repo ini sendiri — tidak membawa satu pun. Ketiganya kini ditandai opsional
  beserta **siapa yang memikul perannya di sini**, bukan dihapus.

Dan satu yang sudah digerbangi tetapi lolos lewat bentuk lain:
`.wilayah-filter-btn` dihapus dari tabel bertanda pada 3 Agustus, sementara
salinannya di paragraf tiga puluh baris di atas tabel itu bertahan sampai
sekarang. **Gerbang membaca struktur; prosa lolos seluruhnya** — itu kini ditulis
sebagai batas gerbangnya, bukan dibiarkan tampak lebih luas.

## Skill

Keempatnya diselaraskan, dan yang keempat baru. `awcms-astro-integrasi` berhenti
menyebut "lima permukaan yang dipakai": tiga yang benar-benar dipanggil,
`GET /api/v1/blog/posts/{id}` **dihapus ADR-0018** karena ia N+1 per build, dan
`GET /api/v1/auth/session` milik BFF yang belum ada. Ia juga membawa tabel
keputusan `awcms` yang mengubah apa yang benar di sini — termasuk ADR-0059,
ADR-0061, dan ADR-0062 yang mendarat di sana tanpa satu pun berkas di sini
menyebutnya.

## Nol perubahan perilaku

Tidak satu header pun ditambahkan, tidak satu gerbang pun dilonggarkan, tidak
satu dependency pun ditambahkan. Sembilan celah tetap terbuka dan **terbaca
terbuka** — menutupnya diam-diam bersama ADR yang menamainya akan membuat
pekerjaan ini tidak bisa dibedakan dari pekerjaan yang mengklaim lebih dari yang
dilakukannya.

Satu berkas non-dokumen ikut berubah: alasan sebuah pengecualian di
`scripts/audit-dokumen.mjs` diperlebar, karena `docs/PROJECT_STATE.md` kini
disebut dalam dua arti dan gerbang itu menuntut alasannya menyebut milik siapa.
