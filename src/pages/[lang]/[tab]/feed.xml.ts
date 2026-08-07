/**
 * Feed seksi berita di locale BERPREFIKS (`/en/berita/feed.xml`).
 *
 * Lihat `src/pages/[tab]/feed.xml.ts` untuk alasan bentuknya; berkas ini hanya
 * menukar sumber locale-nya dari konstanta menjadi parameter rute.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { defaultLocale, type Locale, type TabSlug } from "../../../config/site";
import { daftarFeed, isiFeed } from "../../../lib/feed-seksi";

export const getStaticPaths: GetStaticPaths = async () =>
  (await daftarFeed())
    .filter(({ locale }) => locale !== defaultLocale)
    .map(({ locale, tab }) => ({
      params: { lang: locale, tab },
      props: { lang: locale, tab }
    }));

export const GET: APIRoute = async ({ props }) =>
  new Response(await isiFeed(props.lang as Locale, props.tab as TabSlug), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" }
  });
