/**
 * A stand-in for `awcms`, for the browser accessibility gate (ADR-0056).
 *
 * ## What it is for, and what it is NOT
 *
 * `bun run build` pulls every page from `awcms`, and this template repo has no
 * instance (the `build` job in CI is conditioned on `vars.AWCMS_API_URL` for
 * exactly that reason). The accessibility gate must run in the template repo
 * itself, so it needs a build — and a build needs something to answer.
 *
 * This file answers the nine requests a build and the search page make, with a
 * small fixed corpus whose only job is to put every KIND of markup this
 * template renders in front of axe: an article with a fee table, steps, an FAQ
 * and a legal basis; rich body text (heading, list, quote, link, bold, code);
 * category and tag chips; a footer menu and widgets; the newsletter form; the
 * search page with results and facets; and both locales.
 *
 * It does NOT prove the template can talk to a real `awcms` — that is what the
 * conditioned `build` job and `tests/kontrak-awcms.test.mjs` are for, and the
 * CI comment on option 2 ("give the build a fake backend so it is always
 * green") still applies to THAT claim. This server is honest about being fake
 * in one more way: the gate that uses it asserts accessibility of the markup,
 * and says nothing about the content being real.
 *
 * Read-only by construction: every route is a GET, and nothing is stored.
 */

/** Machine-credential shape `src/lib/awcms/tenant.ts` accepts: 32 hex + 43 chars. */
export const TOKEN_UJI = `awcmsm_${"0123456789abcdef".repeat(2)}_${"A".repeat(43)}`;

const SEKARANG = Date.parse("2026-01-15T08:00:00.000Z");

function amplop(data, status = 200) {
  return { status, body: { success: true, data } };
}

function galat(status, code) {
  return {
    status,
    body: { success: false, error: { code, message: `tiruan: ${code}` } }
  };
}

/** One article, in both locales, sharing a translation group. */
function artikel({ id, slug, tab, urutan, judul, ringkas, terms, isi, ...sisa }) {
  const kelompok = `grup-${id}`;
  const dasar = {
    status: "published",
    visibility: "public",
    publishedAt: new Date(SEKARANG - urutan * 86_400_000).toISOString(),
    updatedAt: new Date(SEKARANG - urutan * 43_200_000).toISOString(),
    createdAt: new Date(SEKARANG - urutan * 86_400_000).toISOString(),
    canonicalUrl: null,
    featuredMediaId: null,
    seoImageMediaId: null,
    authorByline: null,
    translationGroupId: kelompok,
    termIds: terms
  };

  const blok = {
    awcmsAstro: {
      schemaVersion: 1,
      urutan,
      kategori: tab,
      syaratDokumen: ["KTP asli", "Kartu Keluarga", "Surat pengantar RT/RW"],
      langkah: ["Siapkan berkas", "Datang ke loket", "Ambil dokumen"],
      biaya: [
        {
          item: "Biaya administrasi",
          nominal: "Rp 0",
          jenis: "gratis",
          sumber: "Peraturan daerah"
        },
        {
          item: "Legalisasi",
          nominal: "Rp 10.000",
          jenis: "tetap",
          sumber: "Peraturan daerah"
        }
      ],
      dasarHukum: ["Undang-Undang Contoh Nomor 1 Tahun 2020"],
      faq: [
        { q: "Apakah ada biaya?", a: "Biaya administrasi tidak dipungut." },
        { q: "Berapa lama prosesnya?", a: "Satu sampai tiga hari kerja." }
      ],
      estimasiWaktu: "1-3 hari kerja",
      reviewDueDate: "2026-12-31",
      ...sisa
    },
    blocks: []
  };

  const teks = (kode) => ({
    id: kode === "id" ? id : `${id}-en`,
    slug,
    locale: kode,
    title: kode === "id" ? judul : `${judul} (English)`,
    excerpt: kode === "id" ? ringkas : `${ringkas} (English)`,
    metaDescription: ringkas,
    contentJson: blok,
    bodyPortableText: isi(kode),
    ...dasar
  });

  return [teks("id"), teks("en")];
}

const span = (text, marks = []) => ({ _type: "span", text, marks });

const blokTeks = (style, ...children) => ({
  _type: "block",
  style,
  markDefs: [],
  children
});

function isiRicher(kode) {
  const en = kode === "en";
  return [
    blokTeks("normal", span(en ? "An introduction to the process." : "Pengantar proses.")),
    blokTeks("h2", span(en ? "Before you come" : "Sebelum datang")),
    {
      _type: "block",
      style: "normal",
      markDefs: [{ _key: "t1", _type: "link", href: "https://contoh.example/info" }],
      children: [
        span(en ? "Read the " : "Baca "),
        span(en ? "official notice" : "pengumuman resmi", ["t1"]),
        span(en ? " and keep " : " dan simpan "),
        span(en ? "every receipt" : "setiap tanda terima", ["strong"]),
        span(en ? ", the code is " : ", kodenya "),
        span("A-100", ["code"])
      ]
    },
    {
      _type: "block",
      style: "normal",
      listItem: "bullet",
      level: 1,
      markDefs: [],
      children: [span(en ? "First item" : "Butir pertama")]
    },
    {
      _type: "block",
      style: "normal",
      listItem: "bullet",
      level: 1,
      markDefs: [],
      children: [span(en ? "Second item" : "Butir kedua")]
    },
    blokTeks("h3", span(en ? "Good to know" : "Perlu diketahui")),
    blokTeks(
      "blockquote",
      span(en ? "Bring the originals." : "Bawa berkas aslinya.", ["em"])
    )
  ];
}

const TERMS = [
  { id: "t-kat-1", taxonomyType: "category", name: "Dokumen", slug: "dokumen" },
  { id: "t-tag-1", taxonomyType: "tag", name: "Gratis", slug: "gratis" }
];

const POSTS = [
  ...artikel({
    id: "p1",
    slug: "paspor",
    tab: "panduan",
    urutan: 1,
    judul: "Mengurus paspor",
    ringkas: "Langkah mengurus paspor.",
    terms: ["t-kat-1", "t-tag-1"],
    isi: isiRicher
  }),
  ...artikel({
    id: "p2",
    slug: "akta-kelahiran",
    tab: "layanan",
    urutan: 2,
    judul: "Akta kelahiran",
    ringkas: "Layanan akta kelahiran.",
    terms: ["t-kat-1"],
    isi: isiRicher
  }),
  ...artikel({
    id: "p3",
    slug: "jam-layanan",
    tab: "informasi",
    urutan: 3,
    judul: "Jam layanan",
    ringkas: "Jam buka loket.",
    terms: ["t-tag-1"],
    isi: isiRicher
  })
];

const MENU = [
  {
    id: "m1",
    key: "footer",
    name: "Footer",
    items: [
      {
        id: "mi1",
        parentItemId: null,
        label: "Pengumuman",
        linkType: "url",
        targetId: null,
        url: "https://contoh.example/pengumuman",
        sortOrder: 1
      },
      {
        id: "mi2",
        parentItemId: null,
        label: "Peta situs",
        linkType: "url",
        targetId: null,
        url: "/sitemap/",
        sortOrder: 2
      }
    ]
  }
];

const WIDGET = [
  {
    id: "w1",
    position: "footer",
    title: "Kontak",
    bodyText: "Loket buka Senin sampai Jumat.",
    isActive: true,
    sortOrder: 1
  },
  {
    id: "w2",
    position: "header",
    title: "Pengumuman",
    bodyText: "Layanan libur pada hari besar.",
    isActive: true,
    sortOrder: 1
  }
];

const HASIL_CARI = {
  items: [
    {
      resourceType: "post",
      resourceId: "p1",
      url: "/panduan/paspor/",
      title: "Mengurus paspor",
      snippet: "Langkah <mark>paspor</mark> lengkap dengan biaya &amp; waktu.",
      locale: "id"
    },
    {
      resourceType: "post",
      resourceId: "p2",
      url: "/layanan/akta-kelahiran/",
      title: "Akta kelahiran",
      snippet: "Layanan akta kelahiran dan <mark>paspor</mark> bayi.",
      locale: "id"
    }
  ],
  nextCursor: null,
  facets: {
    resourceTypes: [{ value: "post", count: 2 }],
    terms: { channel: [{ value: "umum", count: 2, label: "Umum" }] }
  },
  query: "paspor",
  locale: "id"
};

/** Resolves one request to `{status, body}`. Pure, so it is testable. */
export function jawab(url) {
  const { pathname, searchParams } = url;

  if (pathname === "/api/v1/blog/posts") {
    return amplop({ posts: POSTS, nextCursor: null });
  }
  if (pathname === "/api/v1/blog/terms") {
    return amplop({ terms: TERMS, nextCursor: null });
  }
  if (pathname === "/api/v1/blog/menus") return amplop({ menus: MENU });
  if (pathname === "/api/v1/blog/widgets") return amplop({ widgets: WIDGET });
  if (pathname === "/api/v1/media/public-origin") {
    return amplop({ configured: false, origin: null, baseUrl: null });
  }
  if (pathname === "/api/v1/site-search/query") {
    const kueri = searchParams.get("q") ?? "";
    return amplop(kueri ? { ...HASIL_CARI, query: kueri } : { ...HASIL_CARI, items: [] });
  }
  if (pathname === "/api/v1/site-search/suggest") {
    return amplop({ suggestions: [] });
  }

  // Everything else is "this awcms does not serve it" — a state the template
  // handles on purpose (site profile, for one) and warns about at build time.
  return galat(404, "NOT_FOUND");
}

/**
 * Starts the server and returns it. `port: 0` takes a free port, which is what
 * the runner uses so a busy host never collides with another session.
 */
export function mulaiAwcmsTiruan(port = 0) {
  return Bun.serve({
    port,
    hostname: "127.0.0.1",
    fetch(request) {
      if (request.method !== "GET") {
        return new Response("method not allowed", { status: 405 });
      }

      const { status, body } = jawab(new URL(request.url));

      return new Response(JSON.stringify(body), {
        status,
        headers: {
          "content-type": "application/json",
          // The search page calls this origin from the READER's browser, which
          // is a different origin from the site: a response without this is
          // blocked there, silently, and the page would show its error state.
          "access-control-allow-origin": "*"
        }
      });
    }
  });
}
