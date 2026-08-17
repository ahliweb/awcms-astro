---
bump: patch
tipe: dokumentasi
dampak: internal
---

# Dua puluh lima ADR menjadi Inggris, dan indeksnya berhenti berbeda bahasa dari isinya

Fase keempat [ADR-0039](../docs/adr/0039-english-is-the-source-language.md), dan
yang terbesar: ADR-0014 sampai ADR-0038 kini berbahasa Inggris di jalur
telanjangnya. Buku besar tunggu menyusut 37 → 12, dan yang tersisa seluruhnya di
[`docs/awcms-astro/`](../docs/awcms-astro/README.md) plus
[`deploy-coolify.md`](../docs/deploy-coolify.md).

- **Indeksnya sudah Inggris sejak fase pertama; isinya belum.**
  [`docs/adr/README.md`](../docs/adr/README.md) mendaftarkan 26 keputusan dengan
  judul Inggris, sementara tiap berkasnya membuka dengan judul Indonesia. Gerbang
  indeks tidak membandingkan judul — ia membandingkan nomor, keberadaan berkas,
  dan kolom status — jadi selisih itu tidak pernah merah dan hanya terlihat oleh
  yang membuka keduanya. Sekarang keduanya sepakat.
- **Label header ADR mengikuti [ADR-0039](../docs/adr/0039-english-is-the-source-language.md),
  yang ditulis Inggris sejak lahir**: `Status`/`Date`/`Related`, ditambah
  `Owner's rule`, `Supersedes`, `Narrows`, `Amends`, dan `Counterpart in awcms`
  sesuai yang dipakai masing-masing. **`- **Status:**` sengaja tidak disentuh** —
  ia satu-satunya baris yang diurai `scripts/audit-dokumen.mjs`, dan kata
  "Status" kebetulan sama di kedua bahasa.
- **Nama berkas ADR TIDAK diterjemahkan**, dan itu keputusan. Ada 843 kutipan
  lokal `ADR-NNNN` beserta ratusan tautan yang menyebut slug Indonesianya; slug
  adalah ALAMAT, bukan prosa, dan menerjemahkannya akan memutus setiap tautan
  lintas-repo yang sudah menunjuk ke sini. Alasan yang sama berlaku untuk
  `permukaanAdmin`, `urutanSeksi: "terbaru"`, dan kosakata konfigurasi lain yang
  dibiarkan apa adanya di dalam prosa Inggris.
- **Badan ADR diterjemahkan, bukan disegarkan.** Beberapa memuat kalimat yang
  sudah berhenti benar dan sengaja dibiarkan — banner ADR-0018 dan ADR-0029,
  butir bercoret di ADR-0015 dan ADR-0021, dan kalimat ADR-0020 yang menyebut
  dirinya "tidak ditulis ulang; ia benar pada 2 Agustus 2026". ADR adalah rekaman
  keputusan pada satu titik waktu; menyunting isinya sambil menerjemahkan akan
  memalsukan rekaman itu, dan setiap ADR yang menyatakannya sendiri kini
  menyatakannya dalam dua bahasa.
- **Peringatan yang tersisa untuk peninjau:** gerbang terjemahan membuktikan
  cermin tidak basi, bukan bahwa terjemahannya setia. ADR-0039 §6 menuntut
  tinjauan manusia atas ADR justru karena selisih "wajib" dan "boleh" memindahkan
  sebuah keputusan. Dua puluh lima berkas ini pantas dibaca sebelum merge.
