/**
 * Menu navigasi dan widget tenant, dibaca saat build (`awcms` #597 butir 6,
 * ADR-0104 saudaranya, ADR-0105 di `awcms`).
 *
 * ## Apa yang ini buka
 *
 * `awcms` sudah memegang menu dan widget sejak issue #542, lengkap dengan layar
 * admin untuk keduanya, dan **tidak ada yang pernah merendernya**. Seorang
 * editor menambahkan tautan footer, CMS menyimpannya, dan tidak ada pembaca
 * yang pernah melihatnya. Bentuknya sama persis dengan arsip taksonomi sebelum
 * `taksonomi.ts` ada.
 *
 * ## Yang TIDAK dilakukan berkas ini
 *
 * Ia tidak menggantikan bilah tab. Itu keputusan ADR-0105 di `awcms`, dan
 * alasannya hanya terlihat di bahasa kedua: bilah tab merender labelnya lewat
 * katalog PO, sedangkan **sebuah item menu `awcms` membawa SATU label** — tidak
 * ada label per-locale di skemanya. Menjadikan navigasi utama digerakkan CMS
 * berarti mengembalikan antarmuka primer situs ke satu bahasa, yang persis
 * cacat yang dicatat komentar `src/config/site.ts` tentang navigasi sebagai
 * "satu-satunya bagian antarmuka yang tidak pernah diterjemahkan".
 *
 * Jadi menu CMS adalah wilayah SEKUNDER, dan bilah tab tidak tersentuh.
 *
 * ## Dua permintaan, bukan satu
 *
 * Menu dan widget diambil terpisah dan penolakannya ditangani terpisah, karena
 * sebuah tenant bisa memegang `blog_content.menus.read` tanpa
 * `blog_content.widgets.read`. Satu `Promise.all` yang gagal bersama akan
 * membuat satu 403 menghapus keduanya.
 *
 * ## Penolakan bukan build gagal; kegagalan iya
 *
 * Pemisahan yang sama seperti `profil.ts` dan `taksonomi.ts`: 403/404 berarti
 * `awcms` BERKATA TIDAK dan situs terbangun tanpa wilayah itu — yaitu situs
 * sebagaimana adanya sebelum perubahan ini. Selain itu berarti `awcms` rusak,
 * dan membangun menembusnya menerbitkan situs yang diam-diam kehilangan
 * navigasi yang dimilikinya kemarin.
 */
import { AwcmsApiError, awcmsGet } from "./client";

/** Satu item menu, apa adanya dari `awcms`. */
export type ItemMenu = {
  id: string;
  parentItemId: string | null;
  label: string;
  linkType: "post" | "page" | "url";
  targetId: string | null;
  url: string | null;
  sortOrder: number;
};

/** Satu menu navigasi. `key` yang stabil, `name` yang boleh berganti. */
export type Menu = {
  id: string;
  key: string;
  name: string;
  items: ItemMenu[];
};

export type PosisiWidget =
  | "header"
  | "sidebar"
  | "footer"
  | "content_before"
  | "content_after";

export type Widget = {
  id: string;
  position: PosisiWidget;
  title: string;
  /** TEKS BIASA. `awcms` menolak markup saat tulis; ia di-escape saat render. */
  bodyText: string;
  isActive: boolean;
  sortOrder: number;
};

const POSISI_WIDGET: readonly PosisiWidget[] = [
  "header",
  "sidebar",
  "footer",
  "content_before",
  "content_after"
];

const TIPE_TAUTAN: readonly ItemMenu["linkType"][] = ["post", "page", "url"];

function penolakanYangDiharapkan(error: unknown): error is AwcmsApiError {
  return (
    error instanceof AwcmsApiError &&
    (error.status === 403 || error.status === 404)
  );
}

function peringatkan(
  error: AwcmsApiError,
  permission: string,
  akibat: string
): void {
  const sebab =
    error.status === 403
      ? `the build credential does not hold \`${permission}\`. Grant it to ` +
        `the machine credential's role in awcms.`
      : `this awcms does not serve that endpoint.`;

  console.warn(
    `[awcms] ${akibat} not read: ${sebab}\n` +
      `        The site builds and every other page is correct — it just ` +
      `renders nothing for that region.`
  );
}

let cacheMenu: Promise<Menu[]> | undefined;
let cacheWidget: Promise<Widget[]> | undefined;

/** Setiap menu tenant ini, diambil sekali per build. */
export function daftarMenu(): Promise<Menu[]> {
  cacheMenu ??= ambilMenu();
  return cacheMenu;
}

/** Setiap widget tenant ini, diambil sekali per build — TERMASUK yang nonaktif. */
export function daftarWidget(): Promise<Widget[]> {
  cacheWidget ??= ambilWidget();
  return cacheWidget;
}

async function ambilMenu(): Promise<Menu[]> {
  try {
    const { menus } = await awcmsGet<{ menus: unknown }>("/api/v1/blog/menus");
    return bacaMenu(menus);
  } catch (error) {
    if (penolakanYangDiharapkan(error)) {
      peringatkan(error, "blog_content.menus.read", "navigation menus");
      return [];
    }

    throw error;
  }
}

async function ambilWidget(): Promise<Widget[]> {
  try {
    const { widgets } = await awcmsGet<{ widgets: unknown }>(
      "/api/v1/blog/widgets"
    );
    return bacaWidget(widgets);
  } catch (error) {
    if (penolakanYangDiharapkan(error)) {
      peringatkan(error, "blog_content.widgets.read", "widgets");
      return [];
    }

    throw error;
  }
}

/**
 * Membaca payload menu, dan MEMBUANG apa yang tidak bisa dirender.
 *
 * Diperiksa ulang di sini alih-alih dipercaya karena baris yang ditulis sebelum
 * validator `awcms` yang sekarang tetaplah baris — dan yang dirender di sini
 * adalah `<a href>` di setiap halaman situs. `javascript:` di sebuah href
 * adalah satu-satunya muatan yang "server sudah memvalidasinya" bukan alasan
 * cukup untuk berhenti bertanya. Postur yang sama persis diambil
 * `bacaTautanSosial` di `profil.ts`.
 */
export function bacaMenu(raw: unknown): Menu[] {
  if (!Array.isArray(raw)) return [];

  const hasil: Menu[] = [];

  for (const entri of raw) {
    if (typeof entri !== "object" || entri === null) continue;

    const { id, key, name, items } = entri as Record<string, unknown>;

    if (typeof id !== "string" || typeof key !== "string") continue;
    if (key.trim().length === 0) continue;

    hasil.push({
      id,
      key: key.trim(),
      name: typeof name === "string" ? name : key,
      items: bacaItem(items)
    });
  }

  return hasil;
}

function bacaItem(raw: unknown): ItemMenu[] {
  if (!Array.isArray(raw)) return [];

  const hasil: ItemMenu[] = [];

  for (const entri of raw) {
    if (typeof entri !== "object" || entri === null) continue;

    const { id, parentItemId, label, linkType, targetId, url, sortOrder } =
      entri as Record<string, unknown>;

    if (typeof id !== "string") continue;
    if (typeof label !== "string" || label.trim().length === 0) continue;
    if (
      typeof linkType !== "string" ||
      !(TIPE_TAUTAN as readonly string[]).includes(linkType)
    ) {
      continue;
    }

    hasil.push({
      id,
      parentItemId: typeof parentItemId === "string" ? parentItemId : null,
      label: label.trim(),
      linkType: linkType as ItemMenu["linkType"],
      targetId: typeof targetId === "string" ? targetId : null,
      url: typeof url === "string" ? url : null,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0
    });
  }

  // `awcms` sudah mengurutkannya; diurutkan ulang di sini supaya urutan yang
  // dirender adalah properti berkas INI, bukan sesuatu yang benar sampai
  // seseorang mengubah `ORDER BY` di sana.
  return hasil.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Membaca payload widget. Nonaktif IKUT — pemanggil yang menyaring. */
export function bacaWidget(raw: unknown): Widget[] {
  if (!Array.isArray(raw)) return [];

  const hasil: Widget[] = [];

  for (const entri of raw) {
    if (typeof entri !== "object" || entri === null) continue;

    const { id, position, title, bodyText, isActive, sortOrder } =
      entri as Record<string, unknown>;

    if (typeof id !== "string") continue;
    if (
      typeof position !== "string" ||
      !(POSISI_WIDGET as readonly string[]).includes(position)
    ) {
      continue;
    }
    if (typeof title !== "string") continue;

    hasil.push({
      id,
      position: position as PosisiWidget,
      title,
      bodyText: typeof bodyText === "string" ? bodyText : "",
      // Nilai yang bukan boolean diperlakukan NONAKTIF. Sebuah widget yang
      // muncul karena field-nya hilang adalah teks yang terbit tanpa ada yang
      // menyalakannya; kebalikannya hanya teks yang tidak terbit.
      isActive: isActive === true,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0
    });
  }

  return hasil.sort((a, b) => a.sortOrder - b.sortOrder);
}

const sudahDiperingatkan = new Set<string>();

/**
 * Memperingatkan SEKALI per build, bukan sekali per halaman.
 *
 * Item menu yang tidak bisa dirender diketahui saat render, dan sebuah situs
 * merender ratusan halaman — jadi peringatan yang naif akan mencetak pesan yang
 * sama seratus kali dan menenggelamkan log build yang justru menjadi
 * satu-satunya tempat pesan itu sampai ke editornya. Diukur: 108 halaman, 108
 * salinan pesan yang identik.
 *
 * De-duplikasinya tinggal di sini alih-alih di `lib/menu.ts` karena berkas itu
 * murni, dan kemurniannya yang membuat resolusinya bisa diuji tanpa build.
 */
export function peringatkanSekali(kunci: string, pesan: string): void {
  if (sudahDiperingatkan.has(kunci)) return;

  sudahDiperingatkan.add(kunci);
  console.warn(pesan);
}

/** Test seam: membuang pengambilan yang di-memoise per-build. */
export function resetNavigasiCacheForTests(): void {
  cacheMenu = undefined;
  cacheWidget = undefined;
  sudahDiperingatkan.clear();
}
