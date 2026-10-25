// Sengaja gagal: membuktikan ruleset main menolak merge saat CI merah (#137). Tidak untuk di-merge.
import { test, expect } from 'bun:test';
test('probe ruleset: harus gagal', () => { expect(1).toBe(2); });
