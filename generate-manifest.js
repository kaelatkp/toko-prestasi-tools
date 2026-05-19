/**
 * generate-manifest.js
 * Jalankan ini sebelum git push:  node generate-manifest.js
 * Script ini hitung hash semua file app lalu update version.json
 */
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const readline = require('readline');

const APP_FILES = [
  'index.html', 'tokens.css', 'config.js',
  'app-core.js', 'app-foto.js', 'app-dokumen.js',
  'app-barcode.js', 'app-screensaver.js', 'app-cetak.js', 'cetak.html'
];

// Baca versi sekarang
let current = { version: '2.1' };
try { current = JSON.parse(fs.readFileSync('version.json', 'utf8')); } catch (_) {}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question(`Versi sekarang: ${current.version}\nVersi baru (Enter = skip): `, (input) => {
  const newVer = input.trim() || current.version;

  const files = {};
  for (const f of APP_FILES) {
    try {
      const content = fs.readFileSync(path.join(__dirname, f));
      files[f] = crypto.createHash('sha256').update(content).digest('hex');
    } catch (e) {
      console.warn(`  SKIP: ${f} (tidak ditemukan)`);
    }
  }

  const manifest = { version: newVer, files };
  fs.writeFileSync('version.json', JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\n✅ version.json diperbarui → v${newVer}`);
  console.log(`   ${Object.keys(files).length} file di-hash`);
  console.log('\nSekarang jalankan:');
  console.log('  git add . && git commit -m "Update v' + newVer + '" && git push');
  rl.close();
});
