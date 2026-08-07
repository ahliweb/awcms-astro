/**
 * Feed seksi berita di locale DEFAULT, di akar (`/berita/feed.xml`).
 *
 * Kembarannya di `[lang]/[tab]/feed.xml.ts` menerbitkan locale berprefiks.
 * Keduanya tipis dengan sengaja: keputusan apa pun yang ada di sini akan
 * menjadi dua salinan, jadi seluruhnya tinggal di `src/lib/feed-seksi.ts`.
 *
 * `feed.xml` adalah segmen statis dan `[...slug].astro` di direktori yang sama
 * adalah parameter rest, jadi rute ini menang tanpa perlu diurutkan. Sebuah
 * artikel yang benar-benar ber-slug `feed.xml` pun tidak bertabrakan: format
 * build `directory` menulisnya ke `berita/feed.xml/index.html`, bukan ke berkas
 * yang sama.
 *
 * `Content-Type` di sini berlaku pada `bun run dev`, tempat endpoint ini
 * benar-benar dijalankan. Pada build statis header respons dibuang dan yang
 * menentukan tipe adalah ekstensi berkas — di produksi `server/penyaji.mjs`
 * yang memasangnya kembali, dan `tests/penyaji.test.mjs` yang membuktikannya.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { defaultLocale, type TabSlug } from "../../config/site";
import { daftarFeed, isiFeed } from "../../lib/feed-seksi";

export const getStaticPaths: GetStaticPaths = async () =>
  (await daftarFeed())
    .filter(({ locale }) => locale === defaultLocale)
    .map(({ tab }) => ({ params: { tab }, props: { tab } }));

export const GET: APIRoute = async ({ props }) =>
  new Response(await isiFeed(defaultLocale, props.tab as TabSlug), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" }
  });
