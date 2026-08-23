/**
 * Pembangun feed Atom 1.0, sebagai fungsi murni.
 *
 * ## Kenapa ia fungsi murni dan bukan isi sebuah endpoint
 *
 * Alasan yang sama yang mengangkat `urutkanArtikel` keluar dari `getArticles`
 * (ADR-0033), dan di sini ia lebih tajam: template ini menyatakan NOL seksi
 * berita, jadi tidak ada satu pun berkas feed yang lahir dari `bun run build`
 * di repo tempat berkas ini ditulis. Di dalam sebuah endpoint, seluruh isi
 * berkas ini akan menjadi kode yang pertama kali dieksekusi di build produksi
 * sebuah situs turunan — persis keadaan yang ADR-0032 larang dan yang celah 10
 * catat. Di sini ia bisa dijalankan `bun test` dengan objek biasa.
 *
 * ## Kenapa Atom 1.0, dan bukan RSS 2.0
 *
 * Bukan karena Atom "lebih modern". Yang menentukan: **RSS 2.0 nyaris tidak
 * mewajibkan apa pun.** Judul opsional, tanggal opsional, `guid` opsional,
 * tautan boleh relatif — sehingga feed yang rusak tetap "valid", dan sebuah
 * gerbang atasnya hanya bisa memeriksa hal-hal yang kebetulan ada. Atom
 * mewajibkan `id`, `title`, dan `updated` pada feed maupun tiap entry, dan
 * mewajibkan setiap IRI absolut. Yang diwajibkan spesifikasi adalah yang bisa
 * dituntut gerbang tanpa mengarang aturan sendiri.
 *
 * Alasan kedua, lebih kecil tetapi nyata di repo ini: tanggal Atom adalah
 * RFC 3339 — string `toISOString()` yang PERSIS sama dengan yang sudah
 * dipancarkan JSON-LD dan `article:published_time`. Satu representasi tanggal
 * di seluruh build, bukan dua yang bisa menyimpang.
 *
 * ## Apa yang TIDAK dibawa feed ini
 *
 * Isi artikel. Yang dikirim `<summary>`, yaitu `description` yang sama dengan
 * `meta name="description"` halamannya. Mengirim `bodyHtml` penuh berarti
 * menerbitkan markup — `<img>`, tautan, atribut — ke sebuah permukaan yang
 * tidak dilewati CSP mana pun, tidak dibaca gerbang aset mana pun, dan
 * dirender ulang oleh pembaca feed dengan aturannya masing-masing. Feed ini
 * menunjuk artikelnya; artikelnya tempat gambar, data terstruktur, dan CSP
 * hidup. Konsekuensinya dinyatakan, bukan disamarkan: pelanggan feed membaca
 * ringkasan lalu mengklik, bukan membaca artikel penuh di pembacanya.
 */

/** Satu entry feed. Seluruh tanggal `Date`, seluruh URL absolut. */
export type ButirFeed = {
  judul: string;
  /** URL absolut halaman artikelnya — juga dipakai sebagai `<id>`. */
  url: string;
  ringkasan: string;
  terbit: Date;
  diubah: Date;
  /**
   * Byline OPT-IN penulis butir ini (`awcms` ADR-0109), atau `undefined`.
   *
   * `undefined` berarti butir ini TIDAK memancarkan `<author>` sendiri, dan
   * Atom sudah punya jawaban yang benar untuk itu: RFC 4287 §4.2.1 menyatakan
   * `<author>` tingkat feed berlaku bagi setiap entry yang tidak punya sendiri.
   * Jadi butir tanpa byline tetap beratribusi organisasi tanpa satu baris pun
   * ditulis untuknya — bukan tanpa penulis.
   */
  penulis?: string;
};

/** Satu berkas feed, yaitu satu seksi berita dalam satu locale. */
export type BerkasFeed = {
  judul: string;
  ringkasan: string;
  /** URL absolut indeks seksi yang diwakili feed ini. */
  url: string;
  /** URL absolut berkas feed itu sendiri — `<link rel="self">` Atom. */
  urlDiri: string;
  /** `xml:lang`, mis. `id-ID`. */
  bahasa: string;
  /** Nama penerbit, yaitu nama situs. Tingkat organisasi, bukan byline editor. */
  penerbit: string;
  butir: readonly ButirFeed[];
};

/**
 * Lima karakter yang harus dilepas, dan alasan `'` ikut meski tidak wajib.
 *
 * XML hanya mewajibkan `&` dan `<` di dalam teks, ditambah `"` di dalam nilai
 * atribut ber-kutip-ganda. Kelimanya dilepas di sini karena satu fungsi yang
 * dipakai di dua tempat lebih sulit salah daripada dua fungsi yang masing-masing
 * benar untuk satu tempat — dan yang salah tidak akan terlihat: sebuah `&` pada
 * judul artikel membuat pembaca feed menolak SELURUH berkas sebagai XML yang
 * tidak berbentuk, bukan hanya entry itu.
 */
const LEPAS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;"
};

/** Melepas teks apa pun menjadi teks XML yang aman di elemen maupun atribut. */
export function lepasXml(nilai: string): string {
  return nilai.replace(/[&<>"']/g, (karakter) => LEPAS[karakter]);
}

/**
 * Apakah sebuah seksi menerbitkan feed.
 *
 * Dua syarat, dan yang kedua bukan optimasi:
 *
 * - Hanya seksi `"terbaru"`. Seksi `"manual"` diurutkan posisi redaksi, dan
 *   "yang terbaru" di dalamnya tidak berarti apa-apa: langkah 1 sebuah panduan
 *   akan terdorong ke setiap pelanggan setiap kali panduannya disunting, dan
 *   halaman berumur tiga tahun yang memang milik puncak seksi akan terbaca
 *   sebagai kabar hari ini.
 * - Hanya seksi yang PUNYA artikel. Atom mewajibkan `<updated>` pada feed, dan
 *   satu-satunya nilai yang tersedia untuk seksi kosong adalah jam build —
 *   angka yang repo ini sudah tolak untuk `lastmod` sitemap dengan alasan yang
 *   sama persis: memberi tahu perayap bahwa segalanya berubah pada tiap deploy
 *   itu tidak benar, dan mereka berhenti mempercayainya. Seksi kosong karena
 *   itu tidak menerbitkan berkas feed sama sekali, dan halamannya tidak
 *   memasang tautan penemuan-otomatis ke berkas yang tidak ada.
 */
export function seksiPunyaFeed(
  urutanSeksi: "manual" | "terbaru",
  jumlahArtikel: number
): boolean {
  return urutanSeksi === "terbaru" && jumlahArtikel > 0;
}

/** Nama berkas feed, di satu tempat karena rute, tautan, dan gerbang membacanya. */
export const NAMA_BERKAS_FEED = "feed.xml";

/**
 * Melempar bila `nilai` bukan URL absolut http(s).
 *
 * Melempar, bukan memperbaiki. IRI relatif ilegal di Atom, dan pembaca feed
 * menyelesaikannya terhadap basis yang tidak sama satu sama lain — sebagian
 * terhadap `xml:base`, sebagian terhadap URL feed, sebagian menyerah. Feed yang
 * "hampir benar" karena itu bukan feed yang lebih baik daripada build yang
 * gagal: ia terbit, tampak wajar di satu pembaca, dan mati di pembaca lain.
 */
function tuntutAbsolut(label: string, nilai: string): void {
  let url: URL;
  try {
    url = new URL(nilai);
  } catch {
    throw new Error(
      `feed: ${label} bukan URL absolut: ${JSON.stringify(nilai)}. ` +
        "Atom menuntut IRI absolut; URL relatif diselesaikan berbeda oleh tiap pembaca feed."
    );
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`feed: ${label} bukan http/https: ${JSON.stringify(nilai)}`);
  }
}

/**
 * Melempar bila `nilai` bukan tanggal yang bisa diserialkan.
 *
 * `new Date("bukan tanggal")` menghasilkan Invalid Date, dan `toISOString()`
 * atasnya MELEMPAR `RangeError` — pesan yang tidak menyebut feed, tidak
 * menyebut artikel mana, dan muncul di tengah build. Yang dilempar di sini
 * menyebut ketiganya.
 */
function tuntutTanggal(label: string, nilai: Date): void {
  if (!(nilai instanceof Date) || Number.isNaN(nilai.getTime())) {
    throw new Error(`feed: ${label} bukan tanggal yang sah`);
  }
}

/**
 * Merangkai satu berkas Atom 1.0.
 *
 * Ia MELEMPAR alih-alih menerbitkan feed yang cacat, dan itu keputusan yang
 * sama dengan `MAX_PAGES` di `content.ts`: satu-satunya hal yang tidak boleh
 * dilakukan berkas ini adalah mengembalikan keluaran yang tampak lengkap.
 * Gerbang `audit:konten` membaca berkas feed di keluaran dan menangkap kelas
 * cacat yang sama dari sisi lain — keduanya perlu, karena gerbang itu hanya
 * berjalan di situs yang sudah di-build, sementara lemparan di sini berlaku
 * pada build itu sendiri.
 */
export function bangunFeedAtom(feed: BerkasFeed): string {
  if (feed.butir.length === 0) {
    throw new Error(
      "feed: seksi tanpa artikel tidak menerbitkan feed — lihat seksiPunyaFeed()"
    );
  }

  tuntutAbsolut("url seksi", feed.url);
  tuntutAbsolut("url feed sendiri", feed.urlDiri);

  // Urutan entry adalah urutan seksinya: terbaru lebih dulu. Ia diurutkan ULANG
  // di sini alih-alih dipercayakan pada pemanggil, karena feed adalah satu-satunya
  // permukaan yang urutannya dibaca MESIN — sebagian pembaca menampilkan apa
  // adanya, dan sebuah entry lama di puncak terbaca sebagai kabar terbaru.
  const butir = [...feed.butir].sort(
    (a, b) => b.terbit.getTime() - a.terbit.getTime() || a.url.localeCompare(b.url)
  );

  for (const item of butir) {
    tuntutAbsolut(`url entry ${JSON.stringify(item.judul)}`, item.url);
    tuntutTanggal(`tanggal terbit entry ${JSON.stringify(item.judul)}`, item.terbit);
    tuntutTanggal(`tanggal ubah entry ${JSON.stringify(item.judul)}`, item.diubah);

    // Kebalikan urutan waktu adalah cacat yang ADR-0033 lahir untuk mencegahnya,
    // dilihat dari sisi feed. Perayap membuang `dateModified` yang mendahului
    // `datePublished`; pembaca feed lebih buruk lagi — sebagian mengurutkan
    // dengan `updated`, jadi artikel itu menetap di puncak selamanya.
    if (item.diubah.getTime() < item.terbit.getTime()) {
      throw new Error(
        `feed: entry ${JSON.stringify(item.judul)} diubah sebelum terbit ` +
          `(${item.diubah.toISOString()} < ${item.terbit.toISOString()})`
      );
    }
  }

  // `<updated>` feed adalah perubahan TERBARU di antara entry-nya, bukan jam
  // build. Itu yang membuat sebuah `HEAD`/conditional request punya arti dan
  // yang membuat pembaca feed berhenti menampilkan ulang seluruh seksi setiap
  // kali situsnya di-deploy ulang tanpa satu artikel pun berubah.
  const diperbarui = new Date(
    Math.max(...butir.map((item) => item.diubah.getTime()))
  );

  const entri = butir
    .map((item) =>
      [
        "  <entry>",
        `    <title>${lepasXml(item.judul)}</title>`,
        `    <id>${lepasXml(item.url)}</id>`,
        `    <link rel="alternate" type="text/html" href="${lepasXml(item.url)}"/>`,
        `    <published>${item.terbit.toISOString()}</published>`,
        `    <updated>${item.diubah.toISOString()}</updated>`,
        `    <summary type="text">${lepasXml(item.ringkasan)}</summary>`,
        // Byline penulis, hanya bila ada. Ketiga permukaan yang menyebut
        // penulis sebuah artikel — halaman, JSON-LD, dan feed ini — harus
        // menyebut orang yang sama; sebuah feed yang mengkredit organisasi
        // sementara halamannya mengkredit seseorang adalah dua jawaban atas
        // satu pertanyaan, dan pembaca feed hanya melihat salah satunya.
        //
        // `<name>` dan tidak lebih: Atom mengizinkan `<uri>` dan `<email>` di
        // dalam `<author>`, dan tidak satu pun boleh muncul di sini. Alamat
        // surel seorang editor adalah data pribadi yang tidak pernah diminta,
        // dan sebuah feed adalah tempat yang paling mudah disalin ulang.
        ...(item.penulis
          ? ["    <author>", `      <name>${lepasXml(item.penulis)}</name>`, "    </author>"]
          : []),
        "  </entry>"
      ].join("\n")
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${lepasXml(feed.bahasa)}">`,
    `  <title>${lepasXml(feed.judul)}</title>`,
    `  <subtitle>${lepasXml(feed.ringkasan)}</subtitle>`,
    // `<id>` feed adalah URL seksinya, bukan URL berkas feed. Keduanya berbeda
    // dan yang dipilih adalah yang menandai SUMBERNYA: sebuah situs yang kelak
    // memindahkan feed-nya (mis. menambahkan format kedua) tidak boleh membuat
    // setiap pelanggan melihat seluruh arsip sebagai entry baru.
    `  <id>${lepasXml(feed.url)}</id>`,
    `  <link rel="self" type="application/atom+xml" href="${lepasXml(feed.urlDiri)}"/>`,
    `  <link rel="alternate" type="text/html" href="${lepasXml(feed.url)}"/>`,
    `  <updated>${diperbarui.toISOString()}</updated>`,
    "  <author>",
    // Penulis tingkat ORGANISASI, sama dengan `author` pada JSON-LD artikel
    // (ADR-0033 §5). Ia BAWAAN feed ini, bukan satu-satunya kemungkinan: sejak
    // `awcms` ADR-0109 sebuah entry boleh membawa `<author>` sendiri, dan Atom
    // menetapkan bahwa yang di sini berlaku bagi setiap entry yang tidak.
    //
    // Kalimat yang dulu berdiri di sini — "byline seorang editor tidak ada di
    // sini karena `awcms` menolaknya lebih dulu sebagai permukaan PII" — sudah
    // tidak benar dan diganti alih-alih dihapus: yang ditolak `awcms` adalah
    // menerbitkan nama AKUN seseorang karena ia menulis artikel, dan itu masih
    // ditolak. Yang boleh terbit adalah nama yang penulisnya sendiri pilih.
    `    <name>${lepasXml(feed.penerbit)}</name>`,
    "  </author>",
    entri,
    "</feed>",
    ""
  ].join("\n");
}
