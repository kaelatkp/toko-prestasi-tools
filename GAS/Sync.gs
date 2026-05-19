// ════════════════════════════════════════════════════════════
// Sync.gs — Foto Prestasi
// Tidak perlu dijalankan manual.
// Fungsi di sini dipanggil dari doPost action:'sync' di Code.gs
// File ini bagian dari GAS project yang sama dengan Code.gs.
// ════════════════════════════════════════════════════════════

// Semua logic sync sudah ada di Code.gs _actionSync()
// File ini hanya untuk dokumentasi struktur payload yang dikirim
// dari tombol Sync di server (app.js → syncConfig())

/*
PAYLOAD YANG DIKIRIM SERVER → GAS doPost:

{
  action: 'sync',

  config: {
    GEMINI_API_KEY: '...',   // dari localStorage atau config.js
    APP_VERSION: '1.0.0'     // dari APP_VERSION di app.js
  },

  mods: [
    {
      key:     'pasfoto',
      label:   'Foto Dokumen',
      title:   'Pas Foto Resmi',
      desc:    '...',
      slots:   'main',
      options: 'bg,extra'
    },
    // ... 8 modul lainnya
  ],

  bg_colors: [
    { hex: '#FF0000', name: 'Merah' },
    // ...
  ],

  options: [
    { group: 'gender',         value: 'pria',    label: 'Pria' },
    { group: 'enhance_level',  value: 'standard', label: 'Standard — perbaikan natural' },
    // ...
  ]
}

RESPONSE:
{ success: true, version: '1.0.0' }
*/
