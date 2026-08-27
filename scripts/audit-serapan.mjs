/**
 * audit-serapan.mjs — gerbang atas keputusan `awcms` yang BELUM dibaca siapa pun
 * di repo ini.
 *
 * ## Pertanyaan yang tidak punya pemeriksa sampai sekarang
 *
 * `audit:dokumen` memeriksa bahwa sebuah kutipan `ADR-NNNN` **resolve** — bahwa
 * keputusan yang disebut memang ada dan ditandai milik repo lain bila memang
 * begitu. Itu pertanyaan yang berguna, dan ia bukan pertanyaan yang mahal.
 *
 * Pertanyaan yang mahal adalah kebalikannya: **adakah keputusan di `awcms` yang
 * TIDAK dikutip apa pun di sini?** Tidak ada gerbang yang bisa menanyakannya,
 * dan jawabannya hanyut selama dua belas keputusan — dari ADR-0100 sampai
 * ADR-0116, diterima dalam sembilan hari, dan repo ini mengutip lima.
 *
 * Dua di antara yang terlewat bukan hal kecil. ADR-0100 §5 menyebut sebuah pull
 * request DI REPO INI sebagai syarat `awcms` menghapus compatibility writer yang
 * masih ia pikul. ADR-0114 memutar-ulang 67 aturan redirect terhadap server hasil
 * build repo ini dan mendapat 404 pada setiap satunya.
 *
 * Kelas cacatnya persis yang hendak diakhiri ADR-0030: aturan yang hanya
 * tertulis adalah aturan yang hanyut. Tabel serapan di
 * `.claude/skills/awcms-astro-integrasi/SKILL.md` dirawat dengan tangan,
 * sementara tabel permukaan beberapa baris di atasnya sudah digerbangi sejak
 * hari ia lahir.
 *
 * ## Apa yang diperiksa gerbang ini
 *
 * Sebuah blok bertanda di skill itu mendaftarkan SETIAP ADR `awcms`
 * dari lantai yang dinyatakan ke atas, masing-masing dengan satu vonis:
 *
 *   - `diserap`   — konsekuensinya tercatat di sebuah dokumen di repo ini.
 *   - `diperiksa` — dibaca, tidak menyentuh jalur build statis, alasannya ditulis.
 *   - `belum`     — belum ada yang membacanya di sini.
 *
 * Tiga pemeriksaan:
 *
 *   1. **Cakupan.** Tidak boleh ada nomor yang bolong antara lantai dan puncak
 *      yang didaftarkan. Sebuah baris yang hilang adalah keputusan yang tak
 *      terbaca yang menyamar sebagai keputusan yang tak relevan.
 *   2. **Kesegaran terhadap `awcms` sendiri.** Daftar `docs/adr/` di
 *      `ahliweb/awcms` diambil lewat API GitHub. Nomor yang ada di sana dan
 *      tidak di blok ini MEMERAHKAN gerbang. Inilah satu-satunya pemeriksaan
 *      yang bisa menangkap "`awcms` menerbitkan ADR-0117 dan tidak ada yang
 *      melihatnya".
 *   3. **Buku besar hanya boleh MENYUSUT.** Jumlah `belum` yang dinyatakan di
 *      kepala blok adalah plafon. Ia boleh turun; ia tidak boleh naik. Pola yang
 *      sama dipakai buku besar terjemahan ADR-0039, dan dengan alasan yang sama:
 *      sebuah daftar utang yang boleh bertambah bukan daftar utang.
 *
 * ## Kenapa pemeriksaan 2 boleh DILEWATI, dan kenapa ia mengatakannya
 *
 * Jaringan tidak selalu ada — runner tanpa keluar-jaringan, `gh` tanpa
 * kredensial, GitHub sedang mati. Sebuah gerbang yang MEMERAH karena jaringan
 * mati adalah gerbang yang dimatikan orang dalam sepekan; sebuah gerbang yang
 * HIJAU diam-diam karena jaringan mati lebih buruk lagi, karena ia berbohong ke
 * arah yang nyaman.
 *
 * Jadi ia dilewati dan MENGATAKANNYA di keluarannya, persis seperti job `build`
 * di `ci.yml` mengatakan bahwa ia dilewati saat `AWCMS_API_URL` kosong. Dua
 * pemeriksaan lain tidak butuh jaringan dan selalu jalan.
 *
 * Jalankan: `bun run audit:serapan`.
 */
import { readFileSync } from "node:fs";

import { createReporter } from "./lib/reporter.mjs";

const DOKUMEN = ".claude/skills/awcms-astro-integrasi/SKILL.md";
const MULAI = "<!-- serapan:adr-awcms:mulai -->";
const SELESAI = "<!-- serapan:adr-awcms:selesai -->";

/**
 * Daftar isi direktori ADR `awcms`, dibaca tanpa kredensial.
 *
 * `ahliweb/awcms` publik, jadi endpoint ini menjawab 200 untuk siapa pun. Kalau
 * ia berhenti publik, pemeriksaan ini dilewati dengan menyebut sebabnya —
 * bukan memerah, dan bukan pula diam.
 */
const INDEKS_AWCMS =
  process.env.AWCMS_ADR_INDEX_URL ??
  "https://api.github.com/repos/ahliweb/awcms/contents/docs/adr";

/** Batas waktu pengambilan indeks. Bukan "permintaan sehat" — sekadar bukan menggantung. */
const BATAS_MS = Number(process.env.AWCMS_ADR_INDEX_TIMEOUT_MS ?? 15000);

const pelapor = createReporter("audit serapan");

/**
 * Isi blok bertanda, atau `null`.
 *
 * Blok yang HILANG adalah pelanggaran dan bukan alasan untuk melewati gerbang:
 * ia adalah cara termudah untuk mematikan pemeriksaan ini tanpa ada yang
 * menyadarinya.
 */
function bacaBlok(isi) {
  const mulai = isi.indexOf(MULAI);
  const selesai = isi.indexOf(SELESAI);

  if (mulai === -1 || selesai === -1 || selesai < mulai) {
    pelapor.violation(
      "blok",
      DOKUMEN,
      `tidak memuat blok bertanda ${MULAI} … ${SELESAI} — buku besar serapan ` +
        `tidak bisa dibaca, jadi tidak ada yang bisa diperiksa`
    );
    return null;
  }

  return isi.slice(mulai + MULAI.length, selesai);
}

/** `"0100"` → 100. `"0074–0082"` (en dash ATAU hyphen) → [74…82]. */
function nomorDari(sel) {
  const rentang = sel.match(/^(\d{4})\s*[–-]\s*(\d{4})$/);

  if (rentang) {
    const [awal, akhir] = [Number(rentang[1]), Number(rentang[2])];
    if (akhir < awal) return null;
    return Array.from({ length: akhir - awal + 1 }, (_, i) => awal + i);
  }

  const tunggal = sel.match(/^(\d{4})$/);
  return tunggal ? [Number(tunggal[1])] : null;
}

const VONIS = new Set(["diserap", "diperiksa", "belum"]);

/**
 * Baris tabel di dalam blok → `{ nomor, vonis }[]`.
 *
 * Baris pemisah (`| --- |`) dan kepala tabel dilewati dengan menuntut kolom
 * pertama benar-benar berbentuk nomor ADR, bukan dengan menghitung baris.
 */
function baris(blok) {
  const hasil = [];

  for (const teks of blok.split("\n")) {
    const kolom = teks.split("|").map((k) => k.trim());
    if (kolom.length < 4) continue;

    const nomor = nomorDari(kolom[1] ?? "");
    if (!nomor) continue;

    const vonis = (kolom[2] ?? "").replace(/[*`]/g, "").trim();

    if (!VONIS.has(vonis)) {
      pelapor.violation(
        "vonis",
        DOKUMEN,
        `baris "${kolom[1]}" memakai vonis "${vonis}" yang bukan salah satu ` +
          `dari ${[...VONIS].join(", ")}`
      );
      continue;
    }

    for (const n of nomor) hasil.push({ nomor: n, vonis });
  }

  return hasil;
}

/** Angka yang dinyatakan di kepala blok, mis. `lantai: 0049`. */
function angkaKepala(blok, nama) {
  const cocok = blok.match(new RegExp(`${nama}:\\s*(\\d+)`));
  return cocok ? Number(cocok[1]) : null;
}

const isi = readFileSync(DOKUMEN, "utf8");
const blok = bacaBlok(isi);

if (blok) {
  const lantai = angkaKepala(blok, "lantai");
  const plafonBelum = angkaKepala(blok, "plafon-belum");

  if (lantai === null || plafonBelum === null) {
    pelapor.violation(
      "kepala",
      DOKUMEN,
      "blok serapan harus menyatakan `lantai: NNNN` (ADR awcms terendah yang " +
        "dilacak) dan `plafon-belum: N` (jumlah `belum` yang tidak boleh naik)"
    );
  }

  const daftar = baris(blok);
  const vonisMenurutNomor = new Map(daftar.map(({ nomor, vonis }) => [nomor, vonis]));

  const ganda = daftar.length - vonisMenurutNomor.size;
  if (ganda > 0) {
    pelapor.violation(
      "ganda",
      DOKUMEN,
      `${ganda} nomor ADR muncul lebih dari sekali — dua vonis untuk satu ` +
        `keputusan berarti salah satunya tidak pernah dibaca lagi`
    );
  }

  if (lantai !== null && vonisMenurutNomor.size > 0) {
    const puncak = Math.max(...vonisMenurutNomor.keys());
    const bolong = [];

    for (let n = lantai; n <= puncak; n += 1) {
      if (!vonisMenurutNomor.has(n)) bolong.push(String(n).padStart(4, "0"));
    }

    if (bolong.length > 0) {
      pelapor.violation(
        "cakupan",
        DOKUMEN,
        `tidak punya baris untuk ADR awcms ${bolong.join(", ")} — sebuah baris ` +
          `yang hilang adalah keputusan yang tak terbaca yang menyamar sebagai ` +
          `keputusan yang tak relevan`
      );
    }

    pelapor.note(
      `  cakupan: ${vonisMenurutNomor.size} ADR awcms bervonis, lantai ${String(lantai).padStart(4, "0")}, puncak ${String(puncak).padStart(4, "0")}`
    );
  }

  const belum = daftar.filter(({ vonis }) => vonis === "belum").length;

  if (plafonBelum !== null) {
    if (belum > plafonBelum) {
      pelapor.violation(
        "buku besar",
        DOKUMEN,
        `${belum} ADR bervonis \`belum\` sementara plafonnya ${plafonBelum}. ` +
          `Buku besar ini hanya boleh MENYUSUT — sebuah daftar utang yang boleh ` +
          `bertambah bukan daftar utang. Baca ADR-nya, atau turunkan plafonnya ` +
          `hanya setelah membacanya.`
      );
    } else if (belum < plafonBelum) {
      pelapor.violation(
        "buku besar",
        DOKUMEN,
        `${belum} ADR bervonis \`belum\` sementara plafonnya masih ${plafonBelum}. ` +
          `Turunkan plafonnya menjadi ${belum}, atau plafon itu berhenti menjaga ` +
          `apa pun sampai seseorang menaikkan utangnya lagi.`
      );
    } else {
      pelapor.note(`  buku besar: ${belum} \`belum\`, tepat pada plafonnya`);
    }
  }

  // ── Pemeriksaan 2: kesegaran terhadap `awcms` sendiri ─────────────────────
  if (lantai !== null) {
    let muatan = null;

    try {
      const respons = await fetch(INDEKS_AWCMS, {
        headers: { accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(BATAS_MS)
      });

      if (respons.ok) {
        muatan = await respons.json();
      } else {
        pelapor.note(
          `  kesegaran: DILEWATI — indeks ADR awcms menjawab HTTP ${respons.status}. ` +
            `Dua pemeriksaan lain tetap jalan; yang ini tidak berjalan sama sekali.`
        );
      }
    } catch (galat) {
      pelapor.note(
        `  kesegaran: DILEWATI — indeks ADR awcms tidak bisa diambil (${galat.message}). ` +
          `Ini normal di runner tanpa keluar-jaringan. Yang ini tidak berjalan sama sekali.`
      );
    }

    if (Array.isArray(muatan)) {
      const adrAwcms = new Set();

      for (const entri of muatan) {
        const cocok = String(entri?.name ?? "").match(/^(\d{4})-.*(?<!\.id)\.md$/);
        if (cocok) adrAwcms.add(Number(cocok[1]));
      }

      const takBervonis = [...adrAwcms]
        .filter((n) => n >= lantai && !vonisMenurutNomor.has(n))
        .sort((a, b) => a - b)
        .map((n) => String(n).padStart(4, "0"));

      if (takBervonis.length > 0) {
        pelapor.violation(
          "kesegaran",
          DOKUMEN,
          `ahliweb/awcms punya ADR ${takBervonis.join(", ")} yang tidak dikutip ` +
            `apa pun di repo ini. Baca masing-masing, lalu beri barisnya di blok ` +
            `serapan — termasuk bila jawabannya "tidak menyentuh jalur build ` +
            `statis", karena kesenyapan yang tidak dijelaskan tidak bisa ` +
            `dibedakan dari kelalaian.`
        );
      } else {
        pelapor.note(
          `  kesegaran: ${adrAwcms.size} ADR di ahliweb/awcms, semua yang >= lantai sudah bervonis`
        );
      }
    }
  }
}

pelapor.finish();
