/**
 * Parser katalog PO.
 *
 * Dipisahkan dari `src/lib/po.ts` supaya bisa diuji: `po.ts` memuat katalognya
 * lewat impor `?raw` milik Vite, yang tidak ada di luar build Astro — jadi
 * selama parser tinggal di sana, tidak satu pun tes bisa menyentuhnya. Berkas
 * ini murni fungsi atas string.
 */

export type Catalog = Record<string, string>;

/**
 * Batas entri ditentukan kemunculan `msgid`, bukan baris kosong.
 *
 * Versi sebelumnya memecah katalog per blok yang dipisah baris kosong lalu
 * mengambil pasangan msgid/msgstr pertama tiap blok. Akibatnya satu baris
 * kosong yang lupa ditulis membuat entri berikutnya lenyap tanpa error apa pun
 * — key-nya tampil mentah di halaman, dan gerbang audit tidak melihatnya karena
 * berkasnya sendiri terlihat benar. Parsing per `msgid` membuat pemisah antar
 * entri menjadi tidak relevan.
 */
export function parsePo(raw: string): Catalog {
  const catalog: Catalog = {};
  let msgid: string | undefined;
  let msgstr: string | undefined;
  let lanjutan: 'msgid' | 'msgstr' | undefined;

  const simpan = () => {
    if (msgid && msgstr !== undefined) catalog[msgid] = msgstr;
    msgid = undefined;
    msgstr = undefined;
    lanjutan = undefined;
  };

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();

    if (line.startsWith('msgid ')) {
      simpan();
      msgid = readQuoted(line);
      lanjutan = 'msgid';
    } else if (line.startsWith('msgstr ')) {
      msgstr = readQuoted(line);
      lanjutan = 'msgstr';
    } else if (line.startsWith('"') && lanjutan) {
      // String multibaris: hanya baris berkutip yang langsung berurutan.
      if (lanjutan === 'msgid') msgid = (msgid ?? '') + readQuoted(line);
      else msgstr = (msgstr ?? '') + readQuoted(line);
    } else {
      // Baris kosong, komentar, atau direktif lain memutus rangkaian kutipan.
      lanjutan = undefined;
    }
  }
  simpan();
  return catalog;
}

function readQuoted(line: string): string {
  const match = line.match(/"([\s\S]*)"/);
  if (!match) return '';
  return match[1]
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}
