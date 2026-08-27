/**
 * Kosakata tenant, dibaca saat build (`awcms` #597 butir 1, ADR-0104).
 *
 * ## Apa yang ini buka
 *
 * Sampai sekarang situs ini tidak punya arsip kategori maupun arsip tag. Sebuah
 * artikel termasuk salah satu tab yang dikonfigurasi di `src/config/site.ts`,
 * dan tidak ada halaman mana pun yang mengagregasi "semua yang berada di
 * Politik". Redaksi memfilekan artikel ke sebuah kategori di CMS, `awcms`
 * menyimpannya, dan pembaca tidak pernah bisa melihatnya.
 *
 * Dua hal yang menghalanginya diperbaiki di `awcms` lebih dulu: feed build kini
 * membawa `termIds` (#649), dan daftar term kini bisa ditelusuri sampai habis
 * (#647). Berkas ini adalah paruh konsumennya.
 *
 * ## Kenapa TRAVERSAL, tidak pernah daftar bawaannya
 *
 * `GET /api/v1/blog/terms` tanpa parameter mengembalikan seratus entri pertama
 * MENURUT ABJAD, tanpa cursor, dan tanpa satu pun field yang menyatakan masih
 * ada lagi. Untuk kategori itu tak berbahaya — sebuah redaksi punya belasan.
 * Untuk tag pada arsip 23.906 artikel (`awcms` #599) artinya kosakata yang
 * diam-diam terpotong di sekitar huruf B: situs membangun seratus halaman
 * arsip dari ribuan, hijau, dan setiap artikel yang berada di tag berabjad
 * belakang menaut ke halaman yang tak pernah dibangkitkan siapa pun.
 *
 * Maka pembacaan di sini SELALU `?order=created_at` dengan `nextCursor`
 * diikuti sampai `null`. `created_at` bukan pilihan gaya: sebuah term bisa
 * diganti namanya, dan cursor di atas urutan abjad melewatkan atau mengulang
 * baris tanpa ada yang bisa mendeteksinya.
 *
 * ## Penolakan bukan build gagal; kegagalan iya (ADR-0104)
 *
 * Pemisahan yang sama seperti `profil.ts`, dengan satu perbedaan yang layak
 * disebut. Di sana fallback berarti situs memakai namanya sendiri; di sini
 * fallback berarti situs tidak membangkitkan halaman arsip apa pun — dan
 * **kosakata kosong adalah keadaan yang sah**. Redaksi yang tidak memakai
 * kategori tidak sedang rusak, dan jawaban kosong yang jujur menghasilkan
 * halaman yang persis sama dengan fallback.
 *
 * Justru itulah sebabnya cabang kegagalan harus tetap terpisah. Dengan `catch`
 * menyeluruh, "CMS Anda mati" dan "redaksi ini tidak memakai kategori" menjadi
 * peristiwa yang sama, dan build akan menerbitkan situs yang diam-diam
 * kehilangan setiap arsip yang dimilikinya kemarin.
 *
 * ## Hanya `category` dan `tag`
 *
 * `awcms` punya empat kosakata; `channel` dan `topic` (PRD §8.5/§12.4) sengaja
 * TIDAK dibangkitkan arsipnya di sini. Keduanya adalah navigasi primer dan
 * label lintas-kanal, dan permukaan pembacanya adalah mega menu di `awcms`
 * #597 butir 6 — membangkitkan arsip telanjang untuk keduanya sekarang akan
 * mendahului desain itu. Mereka tetap dibaca dan diabaikan secara EKSPLISIT,
 * bukan tersaring diam-diam oleh sebuah filter yang tampak seperti detail.
 */
import { AwcmsApiError, awcmsGet } from "./client";

/** Kosakata yang situs ini terbitkan arsipnya. Lihat header berkas. */
export const JENIS_ARSIP = ["category", "tag"] as const;

export type JenisArsip = (typeof JENIS_ARSIP)[number];

/** Satu term `awcms`, dipangkas ke field yang dipakai sebuah halaman arsip. */
export type Term = {
  id: string;
  taxonomyType: JenisArsip;
  name: string;
  slug: string;
};

type TermAwcms = {
  id: string;
  taxonomyType: string;
  name: string;
  slug: string;
};

/**
 * Batas halaman yang `awcms` terapkan pada endpoint ini (`MAX_TERM_LIST_LIMIT`).
 * Ditulis di sini agar angkanya dinyatakan, bukan ditemukan.
 */
const UKURAN_HALAMAN = 200;

/**
 * Pengaman putaran liar, bukan batas isi. Ia duduk jauh di atas kosakata mana
 * pun yang masuk akal (40.000 term) dan ia MELEMPAR alih-alih mengembalikan apa
 * yang sudah didapat — karena satu hal yang tidak boleh dilakukan berkas ini
 * adalah mengembalikan daftar pendek yang tampak lengkap.
 */
const MAKS_HALAMAN = 200;

function jenisArsipValid(value: string): value is JenisArsip {
  return (JENIS_ARSIP as readonly string[]).includes(value);
}

function penolakanYangDiharapkan(error: unknown): error is AwcmsApiError {
  return (
    error instanceof AwcmsApiError &&
    (error.status === 403 || error.status === 404)
  );
}

function peringatkan(error: AwcmsApiError): void {
  const sebab =
    error.status === 403
      ? "the build credential does not hold `blog_content.taxonomies.read`. " +
        "Grant it to the machine credential's role in awcms — a credential " +
        "minted before ADR-0104 holds it only if its role already did."
      : "this awcms does not serve the `?order=created_at` traversal of " +
        "GET /api/v1/blog/terms. It landed in awcms Issue #647; upgrade the " +
        "instance to use it.";

  console.warn(
    `[awcms] taxonomy not read: ${sebab}\n` +
      `        No category or tag archive pages will be generated, and no ` +
      `article will show its classifications. The site builds and every ` +
      `other page is correct.`
  );
}

let cacheTerm: Promise<Term[]> | undefined;

/**
 * Setiap term yang situs ini terbitkan arsipnya, diambil sekali per build.
 *
 * Di-memoise dengan alasan yang sama seperti feed di `content.ts`: setiap
 * halaman arsip di setiap locale membutuhkan katalog yang sama, dan tanpa ini
 * situs enam-locale akan menanyakan kosakatanya ratusan kali.
 */
export function daftarTerm(): Promise<Term[]> {
  cacheTerm ??= ambilTerm();
  return cacheTerm;
}

/** Term menurut id — bentuk yang dibutuhkan sebuah post untuk menamai kelasnya. */
export async function termMenurutId(): Promise<Map<string, Term>> {
  return new Map((await daftarTerm()).map((term) => [term.id, term]));
}

async function ambilTerm(): Promise<Term[]> {
  const terkumpul: TermAwcms[] = [];
  let cursor: string | undefined;

  for (let halaman = 1; ; halaman += 1) {
    let respons: { terms: TermAwcms[]; nextCursor: string | null };

    try {
      respons = await awcmsGet<{
        terms: TermAwcms[];
        nextCursor: string | null;
      }>("/api/v1/blog/terms", {
        order: "created_at",
        limit: UKURAN_HALAMAN,
        cursor
      });
    } catch (error) {
      // Penolakan hanya diperlakukan sebagai penolakan pada halaman PERTAMA.
      // Sebuah 403 di tengah traversal berarti sesuatu berubah saat build
      // berjalan, dan mengembalikan separuh kosakata dari situ adalah persis
      // daftar pendek yang tampak lengkap.
      if (halaman === 1 && penolakanYangDiharapkan(error)) {
        peringatkan(error);
        return [];
      }

      throw error;
    }

    // Bentuknya diperiksa, bukan diasumsikan. Sebuah respons `200` tanpa
    // `terms` — awcms yang lebih tua, proxy yang menulis ulang badan, atau
    // sebuah double uji yang belum tahu endpoint ini ada — sebelumnya meledak
    // sebagai `Spread syntax requires ...iterable not be null or undefined`
    // dari dalam berkas ini, sebuah pesan yang tidak menyebut endpoint, tenant,
    // maupun apa yang harus diperbaiki. Kosakata KOSONG tetap keadaan yang sah
    // dan tidak ditolak di sini; yang ditolak adalah field yang tidak ada.
    if (!Array.isArray(respons.terms)) {
      throw new Error(
        `GET /api/v1/blog/terms answered without a "terms" array on page ` +
          `${halaman} (got ${respons.terms === undefined ? "no such field" : typeof respons.terms}). ` +
          `An empty vocabulary is a legitimate state and arrives as [] — this ` +
          `is a response whose SHAPE is wrong, so the site's category and tag ` +
          `archives cannot be built from it.`
      );
    }

    terkumpul.push(...respons.terms);

    if (!respons.nextCursor) break;

    if (halaman >= MAKS_HALAMAN) {
      throw new Error(
        `Berhenti setelah ${MAKS_HALAMAN} halaman (${terkumpul.length} term) ` +
          `dan awcms masih mengembalikan cursor. Entah kosakata situs ini jauh ` +
          `lebih besar daripada yang diasumsikan pengaman ini, atau cursor-nya ` +
          `tidak maju. Keduanya layak diperiksa sebelum menerbitkan; tidak ada ` +
          `yang sepadan dengan menerbitkan situs yang kehilangan arsip tanpa ` +
          `ada yang menghitungnya.`
      );
    }

    cursor = respons.nextCursor;
  }

  return saringJenisArsip(terkumpul);
}

/**
 * Membuang `channel` dan `topic`, dan MEMPERTAHANKAN bentuknya.
 *
 * Diekspor karena ia murni dan karena keputusan "kosakata mana yang punya
 * arsip" adalah satu-satunya hal di berkas ini yang bisa berubah tanpa
 * `awcms` berubah — jadi ia diuji langsung alih-alih lewat sebuah build.
 */
export function saringJenisArsip(terms: readonly TermAwcms[]): Term[] {
  const hasil: Term[] = [];

  for (const term of terms) {
    if (!jenisArsipValid(term.taxonomyType)) continue;

    // Sebuah term tanpa slug tidak bisa punya URL, dan `awcms` menjadikannya
    // wajib — jadi ini bukan pembersihan, melainkan penolakan atas baris yang
    // seharusnya tidak ada. Ia dibuang alih-alih dibangun menjadi `/kategori//`.
    if (typeof term.slug !== "string" || term.slug.trim().length === 0) continue;
    if (typeof term.name !== "string" || term.name.trim().length === 0) continue;

    hasil.push({
      id: term.id,
      taxonomyType: term.taxonomyType,
      name: term.name.trim(),
      slug: term.slug.trim()
    });
  }

  return hasil;
}

/** Test seam: membuang pengambilan yang di-memoise per-build. */
export function resetTaksonomiCacheForTests(): void {
  cacheTerm = undefined;
}
