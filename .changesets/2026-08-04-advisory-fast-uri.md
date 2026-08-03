---
tipe: dependency
dampak: internal
---

# Advisory `fast-uri` ditutup lewat override

`bun audit --audit-level=low` mulai merah di **setiap** PR, dan bukan karena PR
itu: advisory [GHSA-7p8r-x3mc-p8w7](https://github.com/advisories/GHSA-7p8r-x3mc-p8w7)
(high — host confusion lewat backslash sebagai pengenal authority) terbit untuk
`fast-uri >=3.0.0 <3.1.5`, dan `main` sama merahnya.

Ia transitif enam tingkat, seluruhnya di bawah satu devDependency:

```
@astrojs/check › @astrojs/language-server › volar-service-yaml
  › yaml-language-server › ajv-i18n › ajv › fast-uri
```

Tidak ada satu pun paket di rantai itu yang bisa dinaikkan untuk menutupnya —
`bun update` tidak menyentuhnya karena tiap tingkat sudah pada versi terbarunya.
Jadi `overrides` yang dipakai, dan **`^3.1.5`, bukan `>=3.1.5`**: yang terakhir
menarik `fast-uri@4.1.2` — lompatan mayor pada pustaka parsing URI, ditukar
untuk masalah yang sudah selesai di `3.1.5`. Advisory menuntut `>=3.1.5`;
override menuntut persis itu dan tidak lebih.

Lockfile diregenerasi penuh (`rm -rf node_modules bun.lock && bun install`)
sesuai aturan repo, bukan disunting sebagian.
