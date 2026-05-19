// ════════════════════════════════════════════════════════════
// Setup.gs — Foto Prestasi
// Jalankan sekali: Run → setupSheet()
// Setelah selesai buka Logs (Ctrl+Enter) → copy Spreadsheet ID
// ════════════════════════════════════════════════════════════

function setupSheet() {
  const ss = SpreadsheetApp.create('foto-prestasi-config');
  const id = ss.getId();

  _setupConfig(ss);
  _setupMods(ss);
  _setupBgColors(ss);
  _setupOptions(ss);

  // Hapus sheet default "Sheet1" jika masih ada
  const def = ss.getSheetByName('Sheet1');
  if (def) ss.deleteSheet(def);

  Logger.log('════════════════════════════════════');
  Logger.log('✅ Sheet berhasil dibuat!');
  Logger.log('📋 Spreadsheet ID: ' + id);
  Logger.log('🔗 URL: ' + ss.getUrl());
  Logger.log('════════════════════════════════════');
  Logger.log('Copy ID di atas → paste ke KAELA untuk lanjut ke Code.gs');
}

// ─── TAB: config ─────────────────────────────────────────────
function _setupConfig(ss) {
  const sh = ss.insertSheet('config');
  sh.getRange('A1:B1').setValues([['key', 'value']]);
  sh.getRange('A2:B3').setValues([
    ['GEMINI_API_KEY', ''],
    ['APP_VERSION',    '1.0.0'],
  ]);
  _styleHeader(sh, 2);
}

// ─── TAB: mods ───────────────────────────────────────────────
function _setupMods(ss) {
  const sh = ss.insertSheet('mods');
  sh.getRange('A1:F1').setValues([[
    'key', 'label', 'title', 'desc', 'slots', 'options'
  ]]);

  const rows = [
    [
      'pasfoto',
      'Foto Dokumen',
      'Pas Foto Resmi',
      'Ganti background & rapikan penampilan untuk dokumen resmi (KTP, SIM, paspor, dll)',
      'main',
      'bg,extra',
    ],
    [
      'lamaran',
      'Foto Dokumen',
      'Foto Lamaran Kerja',
      'Foto formal profesional dengan jas/kemeja formal, background sesuai standar HRD',
      'main',
      'bg,gender,extra',
    ],
    [
      'kua',
      'Foto Dokumen',
      'Foto KUA / Pernikahan',
      'Rapikan foto pasangan untuk dokumen pernikahan resmi',
      'main',
      'bg,extra',
    ],
    [
      'beasiswa',
      'Foto Dokumen',
      'Foto Beasiswa / CPNS',
      'Foto formal sesuai standar pendaftaran beasiswa dan CPNS',
      'main',
      'bg,gender,extra',
    ],
    [
      'enhance',
      'Peningkatan Kualitas',
      'Perjelas & Perindah Foto',
      'Tingkatkan kualitas, ketajaman, pencahayaan, dan detail foto',
      'main',
      'enhance_level,extra',
    ],
    [
      'restore',
      'Peningkatan Kualitas',
      'Restorasi Foto Lama',
      'Pulihkan foto lama yang rusak, pudar, buram, atau tergores',
      'main',
      'restore_mode,extra',
    ],
    [
      'colorize',
      'Peningkatan Kualitas',
      'Kolorisasi Foto Hitam Putih',
      'Tambahkan warna natural pada foto hitam putih atau sepia',
      'main',
      'colorize_style,extra',
    ],
    [
      'background',
      'Kreatif',
      'Ganti Background',
      'Ganti latar belakang foto dengan background warna solid atau deskripsi custom',
      'main',
      'bg,bg_preset,extra',
    ],
    [
      'outfit',
      'Kreatif',
      'Ganti Pakaian Formal',
      'Ubah pakaian menjadi jas, kemeja formal, seragam, atau pakaian resmi lainnya',
      'main',
      'outfit_type,gender,extra',
    ],
  ];

  sh.getRange(2, 1, rows.length, 6).setValues(rows);
  _styleHeader(sh, 6);
}

// ─── TAB: bg_colors ──────────────────────────────────────────
function _setupBgColors(ss) {
  const sh = ss.insertSheet('bg_colors');
  sh.getRange('A1:B1').setValues([['hex', 'name']]);
  sh.getRange('A2:B7').setValues([
    ['#FF0000', 'Merah'],
    ['#0000FF', 'Biru'],
    ['#FFFFFF', 'Putih'],
    ['#808080', 'Abu-abu'],
    ['#000080', 'Biru Navy'],
    ['#2d5a27', 'Hijau Tua'],
  ]);
  _styleHeader(sh, 2);
}

// ─── TAB: options ────────────────────────────────────────────
function _setupOptions(ss) {
  const sh = ss.insertSheet('options');
  sh.getRange('A1:C1').setValues([['group', 'value', 'label']]);

  const rows = [
    // gender
    ['gender', 'pria',   'Pria'],
    ['gender', 'wanita', 'Wanita'],

    // enhance_level
    ['enhance_level', 'standard', 'Standard — perbaikan natural'],
    ['enhance_level', 'high',     'High Definition — tajam & jernih'],
    ['enhance_level', 'ultra',    'Ultra HD — maksimal, sangat detail'],

    // restore_mode
    ['restore_mode', 'standard',  'Standard — perbaikan umum'],
    ['restore_mode', 'heavy',     'Heavy — kerusakan parah'],
    ['restore_mode', 'colorize',  'Restore + Kolorisasi'],

    // colorize_style
    ['colorize_style', 'natural',  'Natural — warna realistis'],
    ['colorize_style', 'vivid',    'Vivid — warna cerah & kuat'],
    ['colorize_style', 'vintage',  'Vintage — hangat & klasik'],

    // outfit_type
    ['outfit_type', 'jas formal hitam dengan dasi',      'Jas formal + dasi'],
    ['outfit_type', 'kemeja putih formal berkerah',       'Kemeja putih formal'],
    ['outfit_type', 'kemeja batik formal',                'Kemeja batik formal'],
    ['outfit_type', 'seragam CPNS / ASN',                 'Seragam CPNS/ASN'],
    ['outfit_type', 'kebaya formal wanita',               'Kebaya formal'],
    ['outfit_type', 'baju wisuda toga',                   'Toga wisuda'],

    // bg_preset
    ['bg_preset', '',                                                       '— Gunakan warna di atas —'],
    ['bg_preset', 'studio profesional dengan pencahayaan lembut',           'Studio foto profesional'],
    ['bg_preset', 'perpustakaan modern dengan rak buku',                    'Perpustakaan modern'],
    ['bg_preset', 'taman bunga yang indah di luar ruangan',                 'Taman bunga'],
    ['bg_preset', 'ruang kantor modern yang rapi',                          'Kantor modern'],
    ['bg_preset', 'pantai dengan langit biru cerah',                        'Pantai & langit biru'],
    ['bg_preset', 'ruang belajar dengan buku-buku',                         'Ruang belajar'],
  ];

  sh.getRange(2, 1, rows.length, 3).setValues(rows);
  _styleHeader(sh, 3);
}

// ─── HELPER: style header row ────────────────────────────────
function _styleHeader(sh, colCount) {
  const header = sh.getRange(1, 1, 1, colCount);
  header.setFontWeight('bold');
  header.setBackground('#f3f3f3');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, colCount);
}
