---
bump: patch
tipe: dependency
dampak: internal
---

# Override `fast-uri` naik ke `^3.1.7`, menutup empat advisory sekaligus

`bun audit --audit-level=low` mulai merah lagi meski override sudah ada:
`^3.1.5` di `package.json` tetap resolve ke `fast-uri@3.1.5`, dan versi itu
sendiri yang dinamai empat advisory `high` —
[GHSA-5jgf-p345-68v8](https://github.com/advisories/GHSA-5jgf-p345-68v8),
[GHSA-f65p-4m7j-42xc](https://github.com/advisories/GHSA-f65p-4m7j-42xc),
[GHSA-fph4-wmhf-6fwf](https://github.com/advisories/GHSA-fph4-wmhf-6fwf), dan
[GHSA-jqff-g426-hqxp](https://github.com/advisories/GHSA-jqff-g426-hqxp) —
yang rentangnya (`>=3.0.0 <3.1.6`, `>=3.1.2 <3.1.6`, `>=3.1.3 <3.1.6`) semuanya
masih mencakup `3.1.5`. Rantainya sama seperti override sebelumnya:

```
@astrojs/check › @astrojs/language-server › volar-service-yaml
  › yaml-language-server › ajv-i18n › ajv › fast-uri
```

`ajv` menyatakan `fast-uri: ^3.0.1`, jadi `3.1.7` — rilis patch 3.x terbaru,
dan pertama yang menutup keempat advisory di atas — masih di dalam rentang
yang dinyatakan `ajv` sendiri. `overrides` dinaikkan ke **`^3.1.7`, bukan
`^4.x`**: 4.x melompati mayor pada pustaka parsing URI yang tidak diminta
`ajv` maupun advisory-nya, dan sebuah override yang memaksakan mayor yang
tak teruji lintas dependency transitif adalah risiko baru untuk masalah yang
sudah selesai di 3.x.

Lockfile diregenerasi penuh (`rm -rf node_modules bun.lock && bun install`)
sesuai aturan repo, bukan disunting sebagian. Regenerasi penuh ikut menaikkan
beberapa dependency tak terkait ke versi terbaru yang masih di dalam rentang
`^` masing-masing di `package.json` (a.l. `astro` resolve ke `7.3.1`,
`@astrojs/node` ke `11.1.5`, `@astrojs/sitemap` ke `3.7.4`) — bukan perubahan
kontrak, karena rentang `^` di `package.json` sendiri tidak berubah, dan
`bun run check` + `bun test` tetap hijau sesudahnya.
