/**
 * Menu `awcms` menjadi tautan yang bisa dirender (`awcms` #597 butir 6,
 * ADR-0105 di `awcms`).
 *
 * ## Kenapa murni, dan kenapa terpisah dari `awcms/navigasi.ts`
 *
 * Berkas ini tidak mengambil apa pun. Yang bisa salah di sini bukan
 * permintaannya melainkan RESOLUSINYA, dan setiap kesalahan resolusi
 * menghasilkan halaman yang tetap terbangun:
 *
 *   - sebuah item `page` yang dirender akan menjadi tautan mati di setiap
 *     halaman situs, karena template ini tidak punya konsep page sama sekali;
 *   - sebuah item `post` yang targetnya tidak terbit akan sama;
 *   - sebuah URL non-http yang lolos akan menjadi `<a href>` yang dapat
 *     dieksekusi, di footer setiap halaman.
 *
 * Semuanya bisa diuji dengan objek biasa, dan `tests/menu-widget.test.mjs`
 * melakukannya.
 *
 * ## Apa yang DIBUANG, dan kenapa dibuang berbicara
 *
 * `awcms` sengaja TIDAK memeriksa `targetId` terhadap tabel post saat tulis:
 * sebuah menu boleh menunjuk artikel yang belum terbit. Jadi target yang tidak
 * meresolusi adalah keadaan normal di permukaan ini, bukan error, dan
 * membuangnya adalah jawaban yang benar.
 *
 * Yang tidak benar adalah membuangnya DIAM-DIAM. Seorang editor yang menambah
 * item lalu tidak melihatnya di situs akan menyimpulkan menunya rusak dan
 * menambahkannya lagi. Maka setiap pembuangan menyebut label itemnya di log
 * build — tempat orang yang bisa bertindak sedang melihat, tidak seperti
 * tautan mati yang hanya dilihat pembaca.
 */
import { localePath, type Locale } from "../config/site";
import type { ItemMenu, Menu } from "./awcms/navigasi";

/** Satu tautan siap render. */
export type TautanMenu = {
  label: string;
  href: string;
  anak: TautanMenu[];
};

/**
 * Post yang dipegang build, dipangkas ke yang dibutuhkan resolusi menu.
 *
 * Sebuah objek biasa dan bukan `LocalizedArticle`, karena satu-satunya yang
 * dibutuhkan berkas ini adalah "id ini ada di seksi apa, dengan slug apa" —
 * dan menerima bentuk penuhnya akan mengikat modul murni ini pada adapter.
 */
export type IndeksPost = ReadonlyMap<string, { tab: string; slug: string }>;

/** Alasan sebuah item tidak dirender. Dipakai pemanggil untuk memperingatkan. */
export type ItemTerbuang = {
  label: string;
  sebab: "page" | "post-tak-ditemukan" | "url-tidak-aman" | "target-kosong";
};

export type HasilMenu = {
  tautan: TautanMenu[];
  terbuang: ItemTerbuang[];
};

function urlAman(nilai: string): boolean {
  let parsed: URL;

  try {
    parsed = new URL(nilai);
  } catch {
    return false;
  }

  return parsed.protocol === "http:" || parsed.protocol === "https:";
}

function resolusiSatu(
  item: ItemMenu,
  post: IndeksPost,
  locale: Locale
): { href: string } | { sebab: ItemTerbuang["sebab"] } {
  if (item.linkType === "url") {
    if (!item.url) return { sebab: "target-kosong" };
    // Diperiksa ulang meski `awcms` menolaknya saat tulis: baris yang ditulis
    // sebelum validator itu tetaplah baris, dan ini dirender sebagai `<a href>`
    // di setiap halaman. Postur yang sama seperti `bacaTautanSosial`.
    if (!urlAman(item.url)) return { sebab: "url-tidak-aman" };
    return { href: item.url };
  }

  if (item.linkType === "page") {
    // Bukan kegagalan `awcms`: page adalah resource nyata di sana. Template ini
    // yang tidak punya rute untuknya, dan itu dicatat ADR-0105.
    return { sebab: "page" };
  }

  if (!item.targetId) return { sebab: "target-kosong" };

  const ditemukan = post.get(item.targetId);
  if (!ditemukan) return { sebab: "post-tak-ditemukan" };

  return { href: localePath(locale, `/${ditemukan.tab}/${ditemukan.slug}/`) };
}

/**
 * Menyusun satu menu menjadi pohon tautan satu tingkat.
 *
 * `awcms` menolak lebih dari satu tingkat sarang saat tulis, jadi bentuk ini
 * lengkap dan bukan penyederhanaan.
 *
 * **Anak yang induknya terbuang ikut terbuang.** Menaikkannya menjadi item
 * tingkat atas akan mengubah menu yang disusun editor menjadi menu lain yang
 * tampak disengaja — dan pembacanya tidak punya cara tahu bedanya.
 */
export function susunMenu(
  menu: Menu,
  post: IndeksPost,
  locale: Locale
): HasilMenu {
  const terbuang: ItemTerbuang[] = [];
  const tautanInduk = new Map<string, TautanMenu>();
  const tautan: TautanMenu[] = [];

  for (const item of menu.items) {
    if (item.parentItemId !== null) continue;

    const hasil = resolusiSatu(item, post, locale);

    if ("sebab" in hasil) {
      terbuang.push({ label: item.label, sebab: hasil.sebab });
      continue;
    }

    const simpul: TautanMenu = { label: item.label, href: hasil.href, anak: [] };
    tautanInduk.set(item.id, simpul);
    tautan.push(simpul);
  }

  for (const item of menu.items) {
    if (item.parentItemId === null) continue;

    const induk = tautanInduk.get(item.parentItemId);

    if (!induk) {
      // Induknya sendiri terbuang, atau menunjuk item yang tidak ada.
      terbuang.push({ label: item.label, sebab: "post-tak-ditemukan" });
      continue;
    }

    const hasil = resolusiSatu(item, post, locale);

    if ("sebab" in hasil) {
      terbuang.push({ label: item.label, sebab: hasil.sebab });
      continue;
    }

    induk.anak.push({ label: item.label, href: hasil.href, anak: [] });
  }

  return { tautan, terbuang };
}

/** Menu menurut `key` — bentuk stabilnya. `name` boleh berganti kapan saja. */
export function menuDenganKey(
  daftar: readonly Menu[],
  key: string
): Menu | undefined {
  return daftar.find((menu) => menu.key === key);
}

/** Satu kalimat per item terbuang, untuk log build. */
export function pesanTerbuang(
  menuKey: string,
  terbuang: readonly ItemTerbuang[]
): string | null {
  if (terbuang.length === 0) return null;

  const rinci = terbuang
    .map((item) => {
      const sebab =
        item.sebab === "page"
          ? "links to an awcms PAGE, which this template has no route for"
          : item.sebab === "post-tak-ditemukan"
            ? "links to a post this build did not publish"
            : item.sebab === "url-tidak-aman"
              ? "carries a URL that is not absolute http(s)"
              : "carries no target at all";

      return `          - "${item.label}" — ${sebab}`;
    })
    .join("\n");

  return (
    `[awcms] ${terbuang.length} item(s) of menu "${menuKey}" were NOT ` +
    `rendered:\n${rinci}\n` +
    `        They are dropped rather than published as dead links. Fix them ` +
    `in /admin/blog-presentation, or remove them.`
  );
}
