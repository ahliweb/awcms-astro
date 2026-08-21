/**
 * Arsip kategori dan tag (`awcms` #597 butir 1, ADR-0104).
 *
 * ## Arsip dibangun dari term yang DIPAKAI, bukan dari kosakatanya
 *
 * Ini keputusan utama berkas ini. `awcms` bisa menyimpan ribuan tag, dan
 * sebagian besarnya — pada arsip mana pun yang tumbuh bertahun-tahun — tidak
 * melekat pada satu pun artikel yang terbit hari ini. Membangkitkan satu
 * halaman per term dalam kosakata berarti menerbitkan ribuan halaman kosong:
 * grid tanpa isi bagi pembaca, dan halaman tipis bagi perayap, yang keduanya
 * merugikan justru situs yang paling banyak menerbitkannya.
 *
 * Jadi kosakata hanya menjawab satu pertanyaan — nama dan slug sebuah id — dan
 * himpunan artikelnya yang menentukan halaman mana yang ada. Sebuah term tanpa
 * artikel terbit tidak punya URL, dan itu bukan kegagalan yang perlu
 * dilaporkan: ia term yang belum dipakai.
 *
 * ## Kenapa arsip diurutkan tanggal, selalu
 *
 * Sebuah seksi punya `urutanSeksi` sendiri (`manual` atau `terbaru`,
 * ADR-0033), dan itu tepat karena seksi adalah keputusan redaksi. Sebuah arsip
 * MELINTASI seksi: satu tag bisa memuat artikel dari seksi bernomor tangan dan
 * seksi berita sekaligus, dan `urutan` dari dua seksi berbeda tidak
 * dibandingkan terhadap apa pun — "Artikel 3" di satu seksi tidak berada
 * sebelum atau sesudah "Artikel 3" di seksi lain. Tanggal terbit adalah
 * satu-satunya kunci yang berarti sama di seluruh seksi, dan ia juga yang
 * dilihat pembaca pada kartunya.
 *
 * Slug sumber tetap menjadi pemutus seri, dengan alasan yang persis sama
 * seperti di `content.ts`: penerbitan massal menstempel satu `now()` ke setiap
 * baris yang disentuhnya, dan `Array#sort` yang stabil akan menyerahkan
 * sisanya kepada urutan yang kebetulan dikembalikan API.
 */
import {
  localePath,
  SEGMEN_HALAMAN,
  SEGMEN_KATEGORI,
  SEGMEN_TAG,
  siteConfig,
  type Locale
} from "../config/site";
import { getArticles, type LocalizedArticle } from "./content";
import { daftarTerm, type JenisArsip, type Term } from "./awcms/taksonomi";

/** The route segment each vocabulary lives under. */
export const SEGMEN_JENIS: Readonly<Record<JenisArsip, string>> = {
  category: SEGMEN_KATEGORI,
  tag: SEGMEN_TAG
};

/**
 * Jalur satu halaman arsip. Halaman 1 adalah jalur arsipnya sendiri.
 *
 * Aturan yang sama persis dengan `jalurHalaman` untuk seksi, dan disengaja:
 * `/kategori/politik/halaman/1/` akan memberi satu halaman dua URL dan
 * memindahkan alamat yang sudah terindeks — untuk arsip yang mendapat halaman
 * kedua hanya karena seseorang menerbitkan artikel ke-13 ke dalamnya.
 */
export function jalurArsip(
  locale: Locale,
  jenis: JenisArsip,
  slug: string,
  nomor: number = 1
): string {
  const dasar = `/${SEGMEN_JENIS[jenis]}/${slug}/`;

  return nomor <= 1
    ? localePath(locale, dasar)
    : localePath(locale, `${dasar}${SEGMEN_HALAMAN}/${nomor}/`);
}

/** Satu arsip: term-nya, dan artikel yang berada di dalamnya, sudah terurut. */
export type ArsipTerm = {
  term: Term;
  artikel: LocalizedArticle[];
};

/**
 * Setiap artikel di situs ini untuk satu locale, dari seluruh seksi.
 *
 * `getArticles` berbasis seksi karena setiap halaman lain di situs ini juga
 * begitu. Sebuah arsip adalah satu-satunya permukaan yang melintasinya, jadi
 * penggabungannya hidup di sini alih-alih melebarkan kontrak `content.ts`.
 */
export async function artikelSemuaSeksi(
  locale: Locale
): Promise<LocalizedArticle[]> {
  const semua: LocalizedArticle[] = [];

  for (const tab of siteConfig.tabs) {
    semua.push(...(await getArticles(tab.slug, locale)));
  }

  return semua;
}

/**
 * Membangun arsip untuk satu jenis kosakata, dari artikel yang diberikan.
 *
 * Murni: tidak mengambil apa pun, sehingga aturan "term dipakai" dan urutannya
 * bisa diuji dengan objek biasa alih-alih lewat sebuah build.
 */
export function susunArsip(
  artikel: readonly LocalizedArticle[],
  terms: readonly Term[],
  jenis: JenisArsip
): ArsipTerm[] {
  const termJenisIni = new Map(
    terms.filter((term) => term.taxonomyType === jenis).map((t) => [t.id, t])
  );

  const perTerm = new Map<string, LocalizedArticle[]>();

  for (const item of artikel) {
    for (const termId of item.termIds) {
      // Sebuah id yang tidak ada di kosakata dilewati DIAM-DIAM, dan itu
      // disengaja: id semacam itu berarti term-nya bertaksonomi lain (`channel`
      // atau `topic`, yang memang tidak punya arsip di sini) atau ia sudah
      // dihapus lunak di `awcms` setelah artikelnya difilekan. Keduanya normal;
      // tidak ada satu pun yang bisa ditindaklanjuti sebuah build.
      if (!termJenisIni.has(termId)) continue;

      const daftar = perTerm.get(termId);
      if (daftar) daftar.push(item);
      else perTerm.set(termId, [item]);
    }
  }

  const hasil: ArsipTerm[] = [];

  for (const [termId, isi] of perTerm) {
    hasil.push({ term: termJenisIni.get(termId)!, artikel: urutkanArsip(isi) });
  }

  // Arsipnya sendiri diurutkan menurut slug: apa pun yang mengonsumsi daftar
  // ini (`getStaticPaths`, dan indeks arsip bila suatu saat ada) menghasilkan
  // urutan yang sama pada setiap build, sehingga diff sebuah build bisa dibaca.
  return hasil.sort((a, b) => a.term.slug.localeCompare(b.term.slug));
}

/** Terbaru dulu, dengan slug sumber sebagai pemutus seri. Lihat header berkas. */
export function urutkanArsip(
  artikel: readonly LocalizedArticle[]
): LocalizedArticle[] {
  return [...artikel].sort(
    (a, b) =>
      b.entry.data.publishedDate.getTime() -
        a.entry.data.publishedDate.getTime() ||
      a.slug.localeCompare(b.slug)
  );
}

const cacheArsip = new Map<string, Promise<ArsipTerm[]>>();

/**
 * Arsip satu jenis untuk satu locale — bentuk yang dipakai rute.
 *
 * Di-memoise per `(jenis, locale)`, dan itu bukan optimasi mikro. Setiap
 * halaman arsip memanggilnya, `getStaticPaths` memanggilnya lagi untuk
 * membangkitkan daftarnya, dan sebuah arsip tag pada situs migrasi berjumlah
 * ribuan halaman — tanpa ini, seluruh himpunan artikel disusun ulang sekali per
 * halaman yang dirender.
 */
export async function arsipUntuk(
  jenis: JenisArsip,
  locale: Locale
): Promise<ArsipTerm[]> {
  const kunci = `${jenis}:${locale}`;
  let tersimpan = cacheArsip.get(kunci);

  if (!tersimpan) {
    tersimpan = (async () => {
      const [terms, artikel] = await Promise.all([
        daftarTerm(),
        artikelSemuaSeksi(locale)
      ]);

      return susunArsip(artikel, terms, jenis);
    })();

    cacheArsip.set(kunci, tersimpan);
  }

  return tersimpan;
}

/** Test seam: membuang arsip yang di-memoise per-build. */
export function resetArsipCacheForTests(): void {
  cacheArsip.clear();
}

/**
 * Arsip satu term menurut slug, atau `undefined`.
 *
 * `undefined` di sebuah rute berarti halaman itu tidak dibangkitkan sama
 * sekali — `getStaticPaths` membangun daftarnya dari fungsi yang sama, jadi
 * keduanya tidak bisa menyimpang.
 */
export async function arsipMenurutSlug(
  jenis: JenisArsip,
  locale: Locale,
  slug: string
): Promise<ArsipTerm | undefined> {
  return (await arsipUntuk(jenis, locale)).find(
    (entri) => entri.term.slug === slug
  );
}

/**
 * Klasifikasi satu artikel yang PUNYA arsip, untuk dirender sebagai tautan.
 *
 * Menerima `termIds` apa adanya alih-alih sebuah `LocalizedArticle`: yang
 * dibutuhkannya hanya itu, dan pemanggilnya adalah sebuah layout yang menerima
 * field terurai lewat props. Murni, dan peta term datang dari pemanggil karena
 * sebuah halaman artikel sudah memegang katalognya.
 *
 * Id yang tidak ada di peta dilewati: ia term `channel`/`topic` (yang memang
 * tidak punya arsip di sini) atau term yang dihapus lunak di `awcms` setelah
 * artikelnya difilekan. Keduanya normal, dan sebuah tautan ke halaman yang
 * tidak dibangkitkan jauh lebih buruk daripada satu label yang hilang.
 */
export function termArtikel(
  termIds: readonly string[],
  term: ReadonlyMap<string, Term>,
  jenis: JenisArsip
): Term[] {
  const hasil: Term[] = [];

  for (const id of termIds) {
    const ditemukan = term.get(id);
    if (ditemukan && ditemukan.taxonomyType === jenis) hasil.push(ditemukan);
  }

  return hasil.sort((a, b) => a.name.localeCompare(b.name));
}
