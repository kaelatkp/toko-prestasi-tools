/* ════════════════════════════════════
   APP-DOKUMEN.JS — Generator Surat & Dokumen ATK
   Requires: app-core.js dimuat lebih dulu
════════════════════════════════════ */

/* ── STATE ── */
let currentModDok = null;

/* ── TANGGAL & KOTA UTILITIES ── */
const KOTA_KEY = 'fp_kota';
function getTanggalHariIni() {
  const hari  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const d = new Date();
  return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}
function getKota()     { return localStorage.getItem(KOTA_KEY) || ''; }
function saveKota(val) { if (val) localStorage.setItem(KOTA_KEY, val); }

/* ── GROUPS (null = HOT langsung tampil, string = nama grup) ── */
const MOD_GROUPS_DOK = {
  lamaran:        null,
  cv:             null,
  izin:           null,
  referensi:      'karir',
  keterangan:     'karir',
  resign:         'karir',
  jb_kendaraan:  'jualbeli',
  jb_tanah:      'jualbeli',
  sewa:          'jualbeli',
  hutang:        'perjanjian',
  kerjasama:     'perjanjian',
  kontrak_kerja: 'perjanjian',
  kuasa:         'kuasa',
  pernyataan:    'kuasa',
  domisili:      'kuasa',
  pengantar:     'kuasa',
  dispensasi:    'karir',
  kenaikan_gaji: 'karir',
  sktm:          'kuasa',
  penawaran:     'bisnis',
  berita_acara:  'bisnis',
  teguran:       'bisnis',
  undangan:      'bisnis',
  nota:          'bisnis',
  undangan_nikah:    'undangan',
  undangan_khitanan: 'undangan',
  undangan_aqiqah:   'undangan',
  undangan_ultah:    'undangan',
};

/* ── MODUL DEFINISI ── */
const MODS_DOK = {
  // ── HOT
  lamaran:       { label:'HOT', icon:'✉️',  title:'Surat Lamaran Kerja',           desc:'Dari toko kecil hingga BUMN — tone otomatis disesuaikan', options:renderOpsiLamaran,     prompt:buildPromptLamaran },
  cv:            { label:'HOT', icon:'📋',  title:'CV / Riwayat Hidup',            desc:'Berbagai format: modern, kreatif, akademis, fresh graduate', options:renderOpsiCV,          prompt:buildPromptCV },
  izin:          { label:'HOT', icon:'🏖️', title:'Surat Izin / Cuti',              desc:'Izin tidak masuk kerja atau sekolah — sakit, keperluan keluarga, cuti', options:renderOpsiIzin, prompt:buildPromptIzin },
  // ── Karir
  referensi:     { label:'Karir', icon:'🏅', title:'Surat Referensi / Rekomendasi', desc:'Dari atasan atau rekan untuk mendukung lamaran atau studi', options:()=>renderOpsiGeneric('ref'),  prompt:()=>buildPromptGeneric('referensi') },
  keterangan:    { label:'Karir', icon:'📄', title:'Surat Keterangan Kerja',        desc:'Bukti resmi masih aktif bekerja di perusahaan',             options:()=>renderOpsiGeneric('ket'),  prompt:()=>buildPromptGeneric('keterangan') },
  resign:        { label:'Karir', icon:'🚪', title:'Surat Pengunduran Diri',        desc:'Keluar dengan baik — profesional & tidak membakar jembatan', options:()=>renderOpsiGeneric('rsn'),  prompt:()=>buildPromptGeneric('resign') },
  dispensasi:    { label:'Karir', icon:'📋', title:'Surat Dispensasi',               desc:'Dispensasi dari sekolah atau kerja untuk kegiatan khusus di luar jam normal', options:()=>renderOpsiGeneric('dsp'),  prompt:()=>buildPromptGeneric('dispensasi') },
  kenaikan_gaji: { label:'Karir', icon:'💹', title:'Surat Permohonan Kenaikan Gaji', desc:'Ajukan kenaikan gaji secara profesional — berdasarkan kinerja & kontribusi',  options:()=>renderOpsiGeneric('kgj'),  prompt:()=>buildPromptGeneric('kenaikan_gaji') },
  // ── Jual Beli & Sewa
  jb_kendaraan:  { label:'Jual Beli', icon:'🚗', title:'Jual Beli Kendaraan',      desc:'Motor / mobil — kwitansi + surat pernyataan bawah tangan',  options:()=>renderOpsiGeneric('jbk'),  prompt:()=>buildPromptGeneric('jb_kendaraan') },
  jb_tanah:      { label:'Jual Beli', icon:'🏠', title:'Jual Beli Tanah / Rumah',  desc:'Bawah tangan — sebelum proses notaris / AJB',               options:()=>renderOpsiGeneric('jbt'),  prompt:()=>buildPromptGeneric('jb_tanah') },
  sewa:          { label:'Jual Beli', icon:'🔑', title:'Perjanjian Sewa',           desc:'Rumah, kos, kontrakan, ruko — hak & kewajiban kedua pihak', options:()=>renderOpsiGeneric('sew'),  prompt:()=>buildPromptGeneric('sewa') },
  // ── Perjanjian
  hutang:        { label:'Perjanjian', icon:'💰', title:'Perjanjian Hutang Piutang',desc:'Pinjaman pribadi / usaha — nominal, tenor, & konsekuensi',  options:()=>renderOpsiGeneric('hut'),  prompt:()=>buildPromptGeneric('hutang') },
  kerjasama:     { label:'Perjanjian', icon:'🤝', title:'Perjanjian Kerjasama Usaha',desc:'Bagi hasil, hak, kewajiban, dan klausul keluar',           options:()=>renderOpsiGeneric('ksm'),  prompt:()=>buildPromptGeneric('kerjasama') },
  kontrak_kerja: { label:'Perjanjian', icon:'📑', title:'Kontrak Kerja / PKWT',     desc:'Perjanjian kerja waktu tertentu — hak & kewajiban karyawan', options:()=>renderOpsiGeneric('ktk'),  prompt:()=>buildPromptGeneric('kontrak_kerja') },
  // ── Kuasa & Pernyataan
  kuasa:         { label:'Kuasa', icon:'🖊️', title:'Surat Kuasa',                  desc:'Kuasa umum / khusus — pengurusan, pengambilan, perwakilan', options:()=>renderOpsiGeneric('kua'),  prompt:()=>buildPromptGeneric('kuasa') },
  pernyataan:    { label:'Kuasa', icon:'📜', title:'Surat Pernyataan',              desc:'Pernyataan kesanggupan, kejujuran, ahli waris, dll',         options:()=>renderOpsiGeneric('pny'),  prompt:()=>buildPromptGeneric('pernyataan') },
  domisili:      { label:'Kuasa', icon:'🏠', title:'Surat Keterangan Domisili',     desc:'Keterangan tempat tinggal dari RT/RW atau kelurahan',        options:()=>renderOpsiGeneric('dom'),  prompt:()=>buildPromptGeneric('domisili') },
  pengantar:     { label:'Kuasa', icon:'📮', title:'Surat Pengantar RT/RW',          desc:'Pengantar ke kelurahan/instansi untuk buat KTP, BPJS, surat nikah, dll', options:()=>renderOpsiGeneric('pgn'),  prompt:()=>buildPromptGeneric('pengantar') },
  sktm:          { label:'Kuasa', icon:'📋', title:'SKTM — Surat Keterangan Tidak Mampu', desc:'Dari RT/RW atau kelurahan — untuk beasiswa, keringanan biaya, atau bantuan sosial', options:()=>renderOpsiGeneric('sktm'), prompt:()=>buildPromptGeneric('sktm') },
  // ── Bisnis & Usaha
  penawaran:     { label:'Bisnis', icon:'📊', title:'Surat Penawaran / Proposal',   desc:'Penawaran produk, jasa, atau kerjasama untuk klien',        options:()=>renderOpsiGeneric('pen'),  prompt:()=>buildPromptGeneric('penawaran') },
  berita_acara:  { label:'Bisnis', icon:'📋', title:'Berita Acara Serah Terima',    desc:'BA pekerjaan, barang, jabatan — ditandatangani kedua pihak', options:()=>renderOpsiGeneric('ba'),   prompt:()=>buildPromptGeneric('berita_acara') },
  teguran:       { label:'Bisnis', icon:'⚠️',  title:'Surat Teguran / SP',          desc:'SP1 / SP2 / SP3 karyawan — dasar hukum & tindak lanjut',   options:()=>renderOpsiGeneric('tgr'),  prompt:()=>buildPromptGeneric('teguran') },
  undangan:      { label:'Bisnis', icon:'📩', title:'Undangan Rapat / Acara',       desc:'Undangan rapat, sosialisasi, atau acara resmi perusahaan',   options:()=>renderOpsiGeneric('und'),  prompt:()=>buildPromptGeneric('undangan') },
  nota:          { label:'Bisnis', icon:'🧾', title:'Nota / Kwitansi Pembayaran',   desc:'Bukti bayar transaksi toko, jasa, sewa, atau pinjaman pribadi', options:()=>renderOpsiGeneric('not'),  prompt:()=>buildPromptGeneric('nota') },
  // ── Undangan & Desain
  undangan_nikah:    { label:'Undangan', icon:'💍', title:'Desain Undangan Pernikahan',       desc:'Cover + halaman detail — dual prompt siap pakai, 7 template pilihan', options:renderOpsiUndanganNikah,    prompt:buildPromptUndanganNikah },
  undangan_khitanan: { label:'Undangan', icon:'🤲', title:'Desain Undangan Khitanan',          desc:'Undangan tasyakuran khitanan — 7 template, data keluarga & acara',   options:renderOpsiUndanganKhitanan, prompt:buildPromptUndanganKhitanan },
  undangan_aqiqah:   { label:'Undangan', icon:'👶', title:'Desain Undangan Aqiqah / Syukuran', desc:'Aqiqah, syukuran, tasyakuran — 7 template desain pilihan',           options:renderOpsiUndanganAqiqah,   prompt:buildPromptUndanganAqiqah },
  undangan_ultah:    { label:'Undangan', icon:'🎂', title:'Desain Undangan Ulang Tahun',       desc:'Birthday invitation — anak-anak hingga sweet 17 & dewasa formal',   options:renderOpsiUndanganUltah,    prompt:buildPromptUndanganUltah },
};

const MOD_INFO_DOK = {
  lamaran:      { title:'Surat Lamaran Kerja',           desc:'Prompt cerdas 4-tahap: AI analisis → tulis → revisi → PDF. Dari toko kecil hingga BUMN.' },
  cv:           { title:'CV / Riwayat Hidup',            desc:'AI buat CV lengkap, revisi loop, finalisasi PDF siap cetak dengan frame rapi.' },
  izin:         { title:'Surat Izin / Cuti',             desc:'Surat izin tidak masuk kerja atau sekolah — sakit, keperluan keluarga, cuti tahunan.' },
  referensi:    { title:'Surat Referensi / Rekomendasi', desc:'Surat dari atasan/kolega yang merekomendasikan seseorang untuk pekerjaan atau studi.' },
  keterangan:   { title:'Surat Keterangan Kerja',        desc:'Surat resmi perusahaan yang menyatakan seseorang masih aktif sebagai karyawan.' },
  resign:       { title:'Surat Pengunduran Diri',        desc:'Surat resign profesional — keluar dengan baik, jaga reputasi, sesuai notice period.' },
  jb_kendaraan: { title:'Jual Beli Kendaraan',           desc:'Kwitansi + surat pernyataan bawah tangan jual beli motor/mobil. Bukan pengganti BPKB.' },
  jb_tanah:     { title:'Jual Beli Tanah / Rumah',       desc:'Surat jual beli bawah tangan sebelum proses AJB notaris. Perlu 2 saksi + materai.' },
  sewa:         { title:'Perjanjian Sewa',               desc:'Perjanjian sewa rumah, kos, kontrakan, atau ruko — hak, kewajiban, denda, & pembatalan.' },
  hutang:       { title:'Perjanjian Hutang Piutang',     desc:'Surat perjanjian pinjaman pribadi/usaha — nominal, bunga (jika ada), tenor, konsekuensi.' },
  kerjasama:    { title:'Perjanjian Kerjasama Usaha',    desc:'MOU/PKS sederhana — bagi hasil, hak & kewajiban, durasi, klausul keluar.' },
  kontrak_kerja:{ title:'Kontrak Kerja / PKWT',          desc:'Perjanjian kerja waktu tertentu — gaji, jam kerja, hak karyawan, PHK.' },
  kuasa:        { title:'Surat Kuasa',                   desc:'Kuasa khusus (mengurus 1 hal) atau umum. Berlaku dengan tanda tangan + materai.' },
  pernyataan:   { title:'Surat Pernyataan',              desc:'Pernyataan kesanggupan, tidak sedang melamar di tempat lain, ahli waris, dll.' },
  domisili:     { title:'Surat Keterangan Domisili',     desc:'Surat keterangan tempat tinggal resmi dari RT/RW atau kelurahan untuk berbagai keperluan administrasi.' },
  pengantar:    { title:'Surat Pengantar RT/RW',         desc:'Surat pengantar dari RT/RW kepada kelurahan atau instansi untuk pengurusan KTP, akta, BPJS, surat nikah, dan keperluan administrasi lainnya.' },
  dispensasi:   { title:'Surat Dispensasi',              desc:'Surat izin tidak mengikuti kegiatan normal (sekolah/kerja) karena ada kegiatan khusus yang disetujui — lomba, acara keluarga, keperluan resmi.' },
  kenaikan_gaji:{ title:'Surat Permohonan Kenaikan Gaji', desc:'Surat formal permohonan kenaikan gaji kepada atasan atau HRD — berbasis kinerja, kontribusi, dan masa kerja.' },
  sktm:         { title:'SKTM — Surat Keterangan Tidak Mampu', desc:'Surat resmi dari RT/RW atau kelurahan yang menerangkan kondisi ekonomi pemohon — untuk beasiswa, keringanan biaya sekolah, atau bantuan sosial.' },
  penawaran:    { title:'Surat Penawaran / Proposal',    desc:'Penawaran produk, jasa, atau kerjasama ke calon klien atau instansi.' },
  berita_acara: { title:'Berita Acara Serah Terima',     desc:'BA pekerjaan, barang, jabatan, atau aset — ditandatangani kedua belah pihak.' },
  teguran:      { title:'Surat Teguran / SP',            desc:'Surat Peringatan SP1/SP2/SP3 karyawan sesuai UU Ketenagakerjaan.' },
  undangan:     { title:'Undangan Rapat / Acara',        desc:'Undangan rapat rutin, sosialisasi, atau acara formal perusahaan/organisasi.' },
  nota:             { title:'Nota / Kwitansi Pembayaran',       desc:'Bukti pembayaran resmi untuk transaksi toko, jasa, atau pinjaman. Bisa 1 lembar atau format buku nota.' },
  undangan_nikah:    { title:'Desain Undangan Pernikahan',       desc:'Generate 2 prompt desain: halaman depan (cover) & halaman belakang (detail acara). Kirim ke Gemini atau ChatGPT untuk generate gambarnya.' },
  undangan_khitanan: { title:'Desain Undangan Khitanan',          desc:'Prompt desain undangan tasyakuran khitanan. 7 template pilihan dari islami tradisional hingga minimalist modern.' },
  undangan_aqiqah:   { title:'Desain Undangan Aqiqah / Syukuran', desc:'Prompt desain undangan aqiqah, syukuran kelahiran, atau tasyakuran. Template bisa disesuaikan dengan tema.' },
  undangan_ultah:    { title:'Desain Undangan Ulang Tahun',       desc:'Prompt desain undangan ulang tahun — dari tema anak-anak (princess, superhero) hingga dewasa formal & sweet 17.' },
};

/* ════════════════════════════════════
   SHARED PDF FRAME & FLOW TEMPLATE
════════════════════════════════════ */
const PDF_FRAME_INSTRUCTION = `
════════════════════════════════════════════════════════════════════
FORMAT OUTPUT FINAL — KETIKA USER KETIK "finalize"
════════════════════════════════════════════════════════════════════

Ketika user mengucapkan: "finalize", "final", "siap cetak", "jadi pdf", "pdf", "selesai", "cetak":

OUTPUT berupa kode HTML lengkap yang siap dicetak / disimpan sebagai PDF.

INSTRUKSI WAJIB:
1. Tulis kode HTML lengkap mulai dari <!DOCTYPE html> hingga </html>, dengan CSS embedded di <style>
2. Pilih desain yang SESUAI jenis dokumen:

   • Surat resmi (lamaran, keterangan, kuasa, pengantar, domisili, resign, referensi, dispensasi, izin):
     - Layout A4, margin 2.5cm, font serif (Georgia atau 'Times New Roman')
     - Kop surat area di atas (placeholder nama instansi / perorangan)
     - Garis bawah kop, nomor surat, tanggal, body teks rapi, bagian tanda tangan di bawah

   • CV / Riwayat Hidup:
     - Header modern dengan nama besar, info kontak, warna aksen gelap
     - Section: Profil, Pengalaman, Pendidikan, Keahlian — rapi dengan ikon atau bullet
     - Font sans-serif bersih (Arial atau system-ui)

   • Nota / Kwitansi:
     - Layout compact, border tipis, tabel item (Nama · Qty · Harga · Subtotal)
     - Total di bawah tabel, terbilang, kolom tanda tangan

   • Perjanjian / Kontrak / Hutang:
     - Formal, nomor pasal (Pasal 1, Pasal 2...), baris tanda tangan PARA PIHAK
     - Kolom tanda tangan kiri-kanan untuk dua pihak

   • Berita Acara / Surat Pernyataan:
     - Header dengan nomor surat, badan teks formal, saksi + tanda tangan

3. Sertakan tombol cetak di atas: <button onclick="window.print()" style="...">🖨️ Cetak / Simpan PDF</button>
4. @media print { button { display:none } } — tombol hilang saat dicetak
5. Dokumen harus terlihat SEPERTI dokumen nyata — bukan plain text, tapi visual yang bersih dan profesional
6. Isi semua placeholder dengan data yang sudah diberikan. Gunakan [.......] hanya jika data memang kosong.
7. Setelah output HTML, tulis 1 baris: "✅ Klik tombol Cetak di atas → Simpan sebagai PDF"

LANGSUNG output kode HTML — tanpa penjelasan, tanpa komentar, tanpa markdown code block.
════════════════════════════════════════════════════════════════════`;

function getHTMLTemplateGuide(type) {
  const guides = {
    surat:      'TEMPLATE: Surat Resmi A4 — font serif (Times New Roman), margin 2.5cm, kop surat, nomor surat, body justify, kolom TTD di bawah.',
    cv:         'TEMPLATE: CV Modern — font sans-serif, header besar (nama+profesi+kontak), sections: Profil · Pengalaman · Pendidikan · Keahlian, warna aksen 1 warna.',
    nota:       'TEMPLATE: Nota/Kwitansi — font Arial, tabel item (Nama|Qty|Harga Satuan|Subtotal), baris TOTAL bold, TERBILANG, kolom TTD kanan bawah.',
    perjanjian: 'TEMPLATE: Perjanjian — font serif, judul center + NOMOR, PARA PIHAK, Pasal-pasal bernomor, TTD 2 kolom (Pihak I | Pihak II), saksi opsional di bawah.',
    bisnis:     'TEMPLATE: Surat Bisnis — font sans-serif, kop perusahaan + garis tebal, nomor+tanggal+perihal, body justify, TTD jabatan kanan bawah.',
  };
  return guides[type] ? `\n${guides[type]}` : '';
}

function promptFlowFooter(saranList, templateType) {
  return `
[TAHAP 3 — TAWARAN PERBAIKAN]
Setelah dokumen selesai, tambahkan blok ini:
---
💬 **Mau direvisi atau disesuaikan?**
${saranList.map((s,i) => `${i+1}. ${s}`).join('\n')}

Ketik revisi yang diinginkan, atau ketik **"finalize"** untuk menghasilkan dokumen HTML siap cetak / simpan PDF.
---

[TAHAP 4 — FINALISASI]
${PDF_FRAME_INSTRUCTION}${getHTMLTemplateGuide(templateType)}

Mulai sekarang dengan Tahap 1.`;
}

/* ════════════════════════════════════
   GENERIC FORM CONFIG — per modul
════════════════════════════════════ */
const DOK_FORM_CONFIG = {
  ref: {
    wajib: [
      { id:'ref-pemberi',  label:'Nama Pemberi Referensi', placeholder:'cth: Budi Hartono (HRD Manager)' },
      { id:'ref-jabatan',  label:'Jabatan / Posisi Pemberi', placeholder:'cth: HRD Manager, Direktur, Supervisor' },
      { id:'ref-perusahaan', label:'Nama Perusahaan', placeholder:'cth: PT. Maju Bersama' },
      { id:'ref-penerima', label:'Nama yang Direkomendasikan', placeholder:'cth: Siti Rahayu' },
    ],
    opsional: [
      { id:'ref-posisi-penerima', label:'Posisi Penerima saat Bekerja', placeholder:'cth: Staff Akuntansi' },
      { id:'ref-lama', label:'Lama Bekerja Bersama', placeholder:'cth: 3 tahun (2021–2024)' },
      { id:'ref-tujuan', label:'Tujuan Referensi', placeholder:'cth: melamar kerja di perusahaan lain, melanjutkan studi S2' },
      { id:'ref-catatan', label:'Catatan Khusus', placeholder:'cth: kelebihan yang ingin ditonjolkan, prestasi spesifik' },
    ],
    gaya: true, bahasa: true,
  },
  ket: {
    wajib: [
      { id:'ket-nama',      label:'Nama Karyawan', placeholder:'cth: Ahmad Fauzi' },
      { id:'ket-jabatan',   label:'Jabatan / Posisi', placeholder:'cth: Staff Administrasi, Kasir' },
      { id:'ket-perusahaan',label:'Nama Perusahaan', placeholder:'cth: CV. Toko Sejahtera' },
      { id:'ket-pembuat',   label:'Nama & Jabatan Pembuat Surat', placeholder:'cth: Dewi Sari — HRD Manager' },
    ],
    opsional: [
      { id:'ket-tgl-masuk', label:'Tanggal Mulai Bekerja', placeholder:'cth: 1 Maret 2021' },
      { id:'ket-keperluan', label:'Keperluan Surat', placeholder:'cth: persyaratan KPR, melamar kerja, pembuatan NPWP' },
      { id:'ket-catatan',   label:'Catatan Tambahan', placeholder:'cth: karyawan berprestasi, pernah menjabat...' },
    ],
    gaya: false, bahasa: true,
  },
  rsn: {
    wajib: [
      { id:'rsn-nama',      label:'Nama Karyawan', placeholder:'cth: Reza Pratama' },
      { id:'rsn-jabatan',   label:'Jabatan saat Ini', placeholder:'cth: Staff Marketing' },
      { id:'rsn-perusahaan',label:'Nama Perusahaan', placeholder:'cth: PT. Sinar Abadi' },
      { id:'rsn-atasan',    label:'Nama Atasan / HRD', placeholder:'cth: Bapak/Ibu Hendra' },
    ],
    opsional: [
      { id:'rsn-tgl-terakhir', label:'Tanggal Hari Terakhir Kerja', placeholder:'cth: 30 Juni 2025' },
      { id:'rsn-alasan',       label:'Alasan Resign (opsional)', placeholder:'cth: mendapatkan kesempatan yang lebih baik, alasan keluarga' },
      { id:'rsn-catatan',      label:'Catatan Khusus', placeholder:'cth: siap membantu proses serah terima, tidak perlu disebutkan alasan spesifik' },
    ],
    gaya: false, bahasa: true,
  },
  jbk: {
    wajib: [
      { id:'jbk-penjual',   label:'Nama Penjual (lengkap)', placeholder:'cth: Agus Setiawan' },
      { id:'jbk-pembeli',   label:'Nama Pembeli (lengkap)', placeholder:'cth: Rina Wahyuni' },
      { id:'jbk-kendaraan', label:'Jenis Kendaraan', placeholder:'cth: Honda Beat 2019 warna hitam' },
      { id:'jbk-nopol',     label:'Nomor Polisi', placeholder:'cth: B 1234 ABC' },
      { id:'jbk-harga',     label:'Harga Kesepakatan', placeholder:'cth: Rp 8.500.000' },
    ],
    opsional: [
      { id:'jbk-noka',    label:'Nomor Rangka / Mesin', placeholder:'cth: MH1JF...' },
      { id:'jbk-thn',     label:'Tahun Kendaraan', placeholder:'cth: 2019' },
      { id:'jbk-kondisi', label:'Kondisi Kendaraan', placeholder:'cth: kondisi baik, minus cat kecil di spakbor kiri' },
      { id:'jbk-catatan', label:'Catatan Khusus', placeholder:'cth: pembayaran tunai, BPKB menyusul, sudah termasuk helm' },
    ],
    gaya: false, bahasa: false,
  },
  jbt: {
    wajib: [
      { id:'jbt-penjual', label:'Nama Penjual (lengkap)', placeholder:'cth: Hendra Gunawan' },
      { id:'jbt-pembeli', label:'Nama Pembeli (lengkap)', placeholder:'cth: Yuni Pratiwi' },
      { id:'jbt-objek',   label:'Objek yang Dijual', placeholder:'cth: tanah dan bangunan rumah di Jl. Mawar No. 5 Kelurahan Cempaka' },
      { id:'jbt-luas',    label:'Luas Tanah / Bangunan', placeholder:'cth: 120 m² / 80 m²' },
      { id:'jbt-harga',   label:'Harga Jual Kesepakatan', placeholder:'cth: Rp 350.000.000' },
    ],
    opsional: [
      { id:'jbt-sertifikat', label:'Nomor Sertifikat / SHM', placeholder:'cth: SHM No. 1234/Cempaka' },
      { id:'jbt-dp',         label:'Uang Muka / DP', placeholder:'cth: DP Rp 50.000.000, sisa dibayar 30 hari' },
      { id:'jbt-catatan',    label:'Catatan Khusus', placeholder:'cth: bangunan dalam kondisi apa adanya, surat akan diproses ke notaris' },
    ],
    gaya: false, bahasa: false,
  },
  sew: {
    wajib: [
      { id:'sew-pemilik',  label:'Nama Pemilik / Pihak Pertama', placeholder:'cth: Bambang Suharto' },
      { id:'sew-penyewa',  label:'Nama Penyewa / Pihak Kedua', placeholder:'cth: Dina Rahayu' },
      { id:'sew-objek',    label:'Objek yang Disewa', placeholder:'cth: rumah tinggal di Jl. Kenanga No. 12 Bandung' },
      { id:'sew-harga',    label:'Harga Sewa', placeholder:'cth: Rp 1.500.000/bulan atau Rp 15.000.000/tahun' },
      { id:'sew-mulai',    label:'Tanggal Mulai Sewa', placeholder:'cth: 1 Juli 2025' },
      { id:'sew-durasi',   label:'Durasi Sewa', placeholder:'cth: 1 tahun, 6 bulan, sampai 30 Juni 2026' },
    ],
    opsional: [
      { id:'sew-dp',      label:'Uang Deposit / Jaminan', placeholder:'cth: deposit 1 bulan sewa = Rp 1.500.000' },
      { id:'sew-aturan',  label:'Aturan Khusus', placeholder:'cth: tidak boleh pelihara hewan, listrik tanggungan penyewa, dll' },
      { id:'sew-catatan', label:'Catatan Tambahan', placeholder:'cth: pembayaran tiap tanggal 1, denda keterlambatan 1%' },
    ],
    gaya: false, bahasa: false,
  },
  hut: {
    wajib: [
      { id:'hut-pemberi',  label:'Nama Pemberi Pinjaman (Kreditur)', placeholder:'cth: Slamet Riyadi' },
      { id:'hut-penerima', label:'Nama Penerima Pinjaman (Debitur)', placeholder:'cth: Wahyu Hidayat' },
      { id:'hut-nominal',  label:'Jumlah Pinjaman', placeholder:'cth: Rp 5.000.000' },
      { id:'hut-tenor',    label:'Jangka Waktu Pengembalian', placeholder:'cth: 3 bulan, 12 bulan, paling lambat 31 Desember 2025' },
    ],
    opsional: [
      { id:'hut-bunga',    label:'Bunga (jika ada)', placeholder:'cth: 2% per bulan, tanpa bunga' },
      { id:'hut-cicilan',  label:'Cara Pembayaran', placeholder:'cth: sekaligus lunas, cicilan Rp 500.000/bulan' },
      { id:'hut-jaminan',  label:'Jaminan / Agunan (jika ada)', placeholder:'cth: BPKB motor Honda Beat 2020' },
      { id:'hut-catatan',  label:'Catatan Khusus', placeholder:'cth: denda jika telat, konsekuensi gagal bayar' },
    ],
    gaya: false, bahasa: false,
  },
  ksm: {
    wajib: [
      { id:'ksm-pihak1',   label:'Nama Pihak Pertama', placeholder:'cth: Eko Santoso (sebagai investor/pemodal)' },
      { id:'ksm-pihak2',   label:'Nama Pihak Kedua', placeholder:'cth: Fitri Handayani (sebagai pengelola)' },
      { id:'ksm-usaha',    label:'Jenis Usaha / Kerjasama', placeholder:'cth: usaha warung makan, toko online, jasa laundry' },
      { id:'ksm-bagi',     label:'Pembagian Hasil / Modal', placeholder:'cth: 60% pihak pertama, 40% pihak kedua' },
    ],
    opsional: [
      { id:'ksm-durasi',   label:'Durasi Kerjasama', placeholder:'cth: 1 tahun, berlaku mulai 1 Agustus 2025' },
      { id:'ksm-modal',    label:'Modal Awal', placeholder:'cth: Rp 10.000.000 dari Pihak Pertama' },
      { id:'ksm-tugas',    label:'Tugas Masing-masing Pihak', placeholder:'cth: pihak pertama sediakan modal, pihak kedua kelola operasional' },
      { id:'ksm-catatan',  label:'Klausul Khusus', placeholder:'cth: kondisi keluar dari kerjasama, larangan kompetitor' },
    ],
    gaya: false, bahasa: false,
  },
  ktk: {
    wajib: [
      { id:'ktk-perusahaan', label:'Nama Perusahaan / Pemberi Kerja', placeholder:'cth: CV. Karya Mandiri' },
      { id:'ktk-karyawan',   label:'Nama Karyawan', placeholder:'cth: Putri Maharani' },
      { id:'ktk-jabatan',    label:'Jabatan / Posisi', placeholder:'cth: Staff Administrasi' },
      { id:'ktk-gaji',       label:'Gaji / Upah', placeholder:'cth: Rp 3.500.000/bulan (gross), UMR Kota Bandung' },
      { id:'ktk-durasi',     label:'Durasi Kontrak', placeholder:'cth: 6 bulan (1 Agustus – 31 Januari 2026), atau tidak ditentukan' },
    ],
    opsional: [
      { id:'ktk-jam',     label:'Jam Kerja', placeholder:'cth: Senin–Sabtu 08.00–17.00, 5 hari kerja' },
      { id:'ktk-fasilitas', label:'Fasilitas / Tunjangan', placeholder:'cth: BPJS Kesehatan, makan siang, THR' },
      { id:'ktk-catatan', label:'Ketentuan Tambahan', placeholder:'cth: masa percobaan 3 bulan, notice resign 1 bulan' },
    ],
    gaya: false, bahasa: false,
  },
  kua: {
    wajib: [
      { id:'kua-pemberi',  label:'Nama Pemberi Kuasa', placeholder:'cth: Hadi Susanto' },
      { id:'kua-penerima', label:'Nama Penerima Kuasa', placeholder:'cth: Rina Dewi (istri / anak / rekan)' },
      { id:'kua-keperluan',label:'Keperluan / Hal yang Dikuasakan', placeholder:'cth: mengambil BPKB di Leasing XYZ, mengurus KTP, menghadiri sidang' },
    ],
    opsional: [
      { id:'kua-identitas-pemberi',  label:'NIK / KTP Pemberi Kuasa', placeholder:'cth: 3201xxxxxxxxxx' },
      { id:'kua-identitas-penerima', label:'NIK / KTP Penerima Kuasa', placeholder:'cth: 3201xxxxxxxxxx' },
      { id:'kua-batas',   label:'Batas Waktu Berlaku', placeholder:'cth: berlaku 30 hari sejak tanggal ditandatangani, atau tidak dibatasi' },
      { id:'kua-catatan', label:'Catatan Khusus', placeholder:'cth: perlu materai Rp 10.000, kuasa terbatas hanya untuk hal ini' },
    ],
    gaya: false, bahasa: false,
  },
  pny: {
    wajib: [
      { id:'pny-nama',   label:'Nama yang Membuat Pernyataan', placeholder:'cth: Doni Setiawan' },
      { id:'pny-isi',    label:'Isi / Hal yang Dinyatakan', placeholder:'cth: menyatakan tidak sedang terlibat kasus hukum, sanggup menyelesaikan pekerjaan, adalah ahli waris sah' },
    ],
    opsional: [
      { id:'pny-nik',      label:'NIK / KTP', placeholder:'cth: 3201xxxxxxxxxx' },
      { id:'pny-tujuan',   label:'Ditujukan Kepada', placeholder:'cth: PT. Maju Bersama, Kelurahan Cempaka, Kepala Sekolah SMA Negeri 1' },
      { id:'pny-konsekuensi', label:'Konsekuensi Jika Tidak Benar', placeholder:'cth: bersedia menerima sanksi sesuai hukum yang berlaku' },
      { id:'pny-saksi',    label:'Nama Saksi (jika ada)', placeholder:'cth: Agus Riyanto (tetangga)' },
      { id:'pny-catatan',  label:'Catatan Tambahan', placeholder:'cth: dibuat bermaterai, perlu tanda tangan RT/RW' },
    ],
    gaya: false, bahasa: false,
  },
  pen: {
    wajib: [
      { id:'pen-pengirim', label:'Nama Pengirim / Perusahaan', placeholder:'cth: Toko Sumber Rejeki / CV. Karya Prima' },
      { id:'pen-penerima', label:'Ditujukan Kepada', placeholder:'cth: Bapak/Ibu Kepala Sekolah SD Nusantara, PT. Bangunan Maju' },
      { id:'pen-produk',   label:'Produk / Jasa yang Ditawarkan', placeholder:'cth: alat tulis kantor, jasa catering, jasa cleaning service' },
    ],
    opsional: [
      { id:'pen-harga',   label:'Kisaran Harga / Paket', placeholder:'cth: Rp 50.000/rim kertas HVS, paket mulai dari Rp 500.000' },
      { id:'pen-keunggulan', label:'Keunggulan / Kelebihan', placeholder:'cth: berpengalaman 10 tahun, harga grosir, antar ke lokasi, garansi' },
      { id:'pen-catatan', label:'Catatan / Syarat & Ketentuan', placeholder:'cth: harga belum termasuk ongkos kirim, berlaku 30 hari, hubungi 08xxx' },
    ],
    gaya: true, bahasa: true,
  },
  ba: {
    wajib: [
      { id:'ba-pihak1', label:'Pihak Yang Menyerahkan', placeholder:'cth: Budi Santoso — Kontraktor CV. Maju Karya' },
      { id:'ba-pihak2', label:'Pihak Yang Menerima', placeholder:'cth: Rina Wijaya — Pemilik Toko Sejahtera' },
      { id:'ba-objek',  label:'Yang Diserahterimakan', placeholder:'cth: renovasi ruang kantor lantai 2, 5 unit komputer, jabatan Kepala Gudang' },
    ],
    opsional: [
      { id:'ba-kondisi', label:'Kondisi Saat Serah Terima', placeholder:'cth: dalam kondisi baik dan berfungsi, sesuai spesifikasi kontrak' },
      { id:'ba-catatan', label:'Catatan / Kekurangan (jika ada)', placeholder:'cth: cat tembok 1 bagian belum selesai, akan diselesaikan 3 hari kerja' },
      { id:'ba-saksi',   label:'Nama Saksi', placeholder:'cth: Agus Riyanto (staf administrasi)' },
    ],
    gaya: false, bahasa: false,
  },
  tgr: {
    wajib: [
      { id:'tgr-perusahaan', label:'Nama Perusahaan', placeholder:'cth: CV. Maju Bersama' },
      { id:'tgr-karyawan',   label:'Nama Karyawan', placeholder:'cth: Joko Widodo' },
      { id:'tgr-jabatan',    label:'Jabatan Karyawan', placeholder:'cth: Staff Gudang' },
      { id:'tgr-pelanggaran',label:'Pelanggaran / Masalah', placeholder:'cth: sering terlambat tanpa keterangan, tidak mencapai target, tidak sopan kepada atasan' },
    ],
    opsional: [
      { id:'tgr-level',    label:'Level Surat Peringatan', select: [
        { value:'', label:'🤖 Saran AI sesuaikan' },
        { value:'SP1 (Surat Peringatan Pertama)', label:'SP1 — Surat Peringatan Pertama' },
        { value:'SP2 (Surat Peringatan Kedua)', label:'SP2 — Surat Peringatan Kedua' },
        { value:'SP3 (Surat Peringatan Ketiga / Terakhir)', label:'SP3 — Terakhir sebelum PHK' },
      ]},
      { id:'tgr-tindak', label:'Tindak Lanjut Jika Terulang', placeholder:'cth: akan dilanjutkan ke SP2, dapat dikenakan PHK sesuai UU' },
      { id:'tgr-pembuat', label:'Nama & Jabatan Pembuat Surat', placeholder:'cth: Hendra Gunawan — HRD Manager' },
    ],
    gaya: false, bahasa: false,
  },
  und: {
    wajib: [
      { id:'und-pengirim', label:'Nama Perusahaan / Organisasi', placeholder:'cth: CV. Karya Mandiri, Koperasi Sejahtera RT 05' },
      { id:'und-penerima', label:'Ditujukan Kepada', placeholder:'cth: seluruh karyawan, Bapak/Ibu Ketua RT, anggota koperasi' },
      { id:'und-acara',    label:'Nama Acara / Agenda', placeholder:'cth: Rapat Evaluasi Bulanan, Sosialisasi Peraturan Baru, Arisan Keluarga' },
      { id:'und-waktu',    label:'Waktu & Tempat', placeholder:'cth: Senin 5 Agustus 2025, pukul 14.00 WIB, di Ruang Meeting Lantai 2' },
    ],
    opsional: [
      { id:'und-agenda',   label:'Agenda / Susunan Acara', placeholder:'cth: 1. Pembukaan 2. Laporan bulan lalu 3. Rencana bulan depan 4. Penutup' },
      { id:'und-dresscode',label:'Dress Code / Ketentuan', placeholder:'cth: pakaian formal, hadir tepat waktu, membawa bahan presentasi' },
      { id:'und-kontak',   label:'Konfirmasi Kehadiran ke', placeholder:'cth: Ibu Sari (08123456789) paling lambat 3 Agustus 2025' },
    ],
    gaya: false, bahasa: false,
  },
  not: {
    wajib: [
      { id:'not-penjual',  label:'Nama Penjual / Toko / Penerima Bayar', placeholder:'cth: Toko Sumber Jaya, Budi Santoso, CV. Karya Prima' },
      { id:'not-pembeli',  label:'Nama Pembeli / Pihak yang Membayar', placeholder:'cth: Rina Wahyuni, Ibu RT 05, PT. Maju Bersama' },
      { id:'not-keterangan', label:'Keterangan Barang / Jasa / Keperluan', placeholder:'cth: 2 rim kertas HVS, jasa servis laptop, sewa kamar bulan Juli' },
      { id:'not-total',    label:'Jumlah / Total Pembayaran', placeholder:'cth: Rp 150.000, Rp 1.500.000' },
    ],
    opsional: [
      { id:'not-nomor',   label:'Nomor Nota (jika ada)', placeholder:'cth: 001/VII/2025, atau kosongkan untuk auto' },
      { id:'not-tanggal', label:'Tanggal Transaksi', placeholder:'cth: 5 Agustus 2025' },
      { id:'not-rincian', label:'Rincian Item (jika perlu)', placeholder:'cth: 2 rim HVS Rp 50.000/rim, 1 pak amplop Rp 50.000' },
      { id:'not-bayar',   label:'Cara Pembayaran', placeholder:'cth: tunai, transfer BCA, DP Rp 500.000' },
      { id:'not-catatan', label:'Catatan Khusus', placeholder:'cth: lunas, kurang Rp 50.000, barang sudah diterima' },
    ],
    gaya: false, bahasa: false,
  },
  dom: {
    wajib: [
      { id:'dom-nama',    label:'Nama Lengkap', placeholder:'cth: Budi Santoso' },
      { id:'dom-alamat',  label:'Alamat Domisili', placeholder:'cth: Jl. Mawar No. 5 RT 03/RW 07 Kel. Cempaka Kec. Ciputat Kota Tangerang Selatan' },
    ],
    opsional: [
      { id:'dom-nik',       label:'NIK / No. KTP', placeholder:'cth: 3201xxxxxxxxxx' },
      { id:'dom-keperluan', label:'Keperluan Surat', placeholder:'cth: pembuatan NPWP, keperluan bank, pendaftaran sekolah, BPJS' },
      { id:'dom-pejabat',   label:'Nama & Jabatan Pembuat Surat', placeholder:'cth: Ahmad Hasan — Ketua RT 03/RW 07, atau Lurah Cempaka' },
      { id:'dom-catatan',   label:'Catatan Khusus', placeholder:'cth: sudah berdomisili sejak 2020, perlu tanda tangan RT + RW + kelurahan' },
    ],
    gaya: false, bahasa: false,
  },
  pgn: {
    wajib: [
      { id:'pgn-nama',      label:'Nama yang Dibuatkan Surat', placeholder:'cth: Budi Santoso' },
      { id:'pgn-keperluan', label:'Keperluan / Tujuan Surat Pengantar', placeholder:'cth: pembuatan KTP baru, pengurusan akta kelahiran, pendaftaran nikah di KUA, BPJS Kesehatan' },
    ],
    opsional: [
      { id:'pgn-nik',       label:'NIK / No. KTP', placeholder:'cth: 3201xxxxxxxxxx' },
      { id:'pgn-alamat',    label:'Alamat Lengkap', placeholder:'cth: Jl. Anggrek No. 10 RT 02/RW 05 Kel. Melati' },
      { id:'pgn-ditujukan', label:'Ditujukan Kepada', placeholder:'cth: Kepala Kelurahan Melati, Kepala Dinas Dukcapil, KUA Kecamatan Ciputat' },
      { id:'pgn-pejabat',   label:'Nama & Jabatan Pembuat Surat', placeholder:'cth: Hendra — Ketua RT 02/RW 05, atau Sekretaris RW 05' },
      { id:'pgn-catatan',   label:'Catatan Khusus', placeholder:'cth: sudah warga setempat sejak 2018, perlu tanda tangan lurah juga' },
    ],
    gaya: false, bahasa: false,
  },
  dsp: {
    wajib: [
      { id:'dsp-nama',      label:'Nama yang Meminta Dispensasi', placeholder:'cth: Rizky Pratama (siswa kelas XI IPA 2)' },
      { id:'dsp-keperluan', label:'Keperluan Dispensasi', placeholder:'cth: mengikuti lomba olimpiade sains tingkat kota, acara pernikahan saudara, keperluan kesehatan' },
      { id:'dsp-tanggal',   label:'Tanggal / Periode Dispensasi', placeholder:'cth: Senin 11 Agustus 2025, atau 11–13 Agustus 2025' },
    ],
    opsional: [
      { id:'dsp-institusi',  label:'Nama Sekolah / Instansi', placeholder:'cth: SMA Negeri 3 Bandung, CV. Karya Mandiri' },
      { id:'dsp-ditujukan',  label:'Ditujukan Kepada', placeholder:'cth: Bapak/Ibu Kepala Sekolah, HRD Manager' },
      { id:'dsp-pemohon',    label:'Nama Pemohon (jika beda)', placeholder:'cth: Ibu Dewi — orang tua siswa, atau Reza Pratama sendiri' },
      { id:'dsp-catatan',    label:'Catatan Tambahan', placeholder:'cth: akan melampirkan undangan lomba, siap menyelesaikan tugas yang tertinggal' },
    ],
    gaya: false, bahasa: false,
  },
  kgj: {
    wajib: [
      { id:'kgj-nama',       label:'Nama Pemohon', placeholder:'cth: Budi Santoso' },
      { id:'kgj-jabatan',    label:'Jabatan / Posisi Saat Ini', placeholder:'cth: Staff Administrasi, Kasir, Operator' },
      { id:'kgj-perusahaan', label:'Nama Perusahaan / Instansi', placeholder:'cth: CV. Toko Prestasi, PT. Maju Bersama' },
      { id:'kgj-ditujukan',  label:'Ditujukan Kepada', placeholder:'cth: HRD Manager, Direktur, Bapak/Ibu Pimpinan' },
    ],
    opsional: [
      { id:'kgj-lama-kerja',      label:'Lama Bekerja', placeholder:'cth: 3 tahun (bergabung sejak Januari 2022)' },
      { id:'kgj-gaji-sekarang',   label:'Gaji Saat Ini', placeholder:'cth: Rp 3.500.000/bulan (opsional, jika ingin disebut)' },
      { id:'kgj-target-kenaikan', label:'Kenaikan yang Diminta', placeholder:'cth: Rp 500.000 (menjadi Rp 4.000.000), atau 15%' },
      { id:'kgj-alasan',          label:'Alasan / Prestasi', placeholder:'cth: konsisten hadir, target terpenuhi, tambahan tanggung jawab, harga kebutuhan naik' },
      { id:'kgj-catatan',         label:'Catatan Khusus', placeholder:'cth: sudah pernah diminta pimpinan untuk evaluasi gaji, ingin tone yang sopan dan tidak agresif' },
    ],
    gaya: true, bahasa: true,
  },
  sktm: {
    wajib: [
      { id:'sktm-nama',      label:'Nama Pemohon', placeholder:'cth: Siti Rahayu' },
      { id:'sktm-keperluan', label:'Keperluan SKTM', placeholder:'cth: permohonan beasiswa, keringanan biaya sekolah, bantuan sosial PKH, BPJS PBI' },
    ],
    opsional: [
      { id:'sktm-nik',        label:'NIK / No. KTP', placeholder:'cth: 3201xxxxxxxxxx' },
      { id:'sktm-alamat',     label:'Alamat Lengkap', placeholder:'cth: Jl. Flamboyan No. 3 RT 05/RW 02 Kel. Harapan Jaya' },
      { id:'sktm-pekerjaan',  label:'Pekerjaan / Penghasilan', placeholder:'cth: petani, buruh harian, tidak tetap, penghasilan ±Rp 1.500.000/bulan' },
      { id:'sktm-tanggungan', label:'Tanggungan Keluarga', placeholder:'cth: 4 orang (suami + 3 anak), anak sekolah semua' },
      { id:'sktm-pejabat',    label:'Nama & Jabatan Pembuat Surat', placeholder:'cth: Bapak Hendra — Ketua RT 05/RW 02, atau Lurah Harapan Jaya' },
      { id:'sktm-catatan',    label:'Catatan Khusus', placeholder:'cth: untuk beasiswa SD anaknya yang bernama Andi, perlu cap kelurahan' },
    ],
    gaya: false, bahasa: false,
  },
};

/* ════════════════════════════════════
   GENERIC FORM RENDERER
════════════════════════════════════ */
function renderOpsiGeneric(cfgKey) {
  const cfg = DOK_FORM_CONFIG[cfgKey];
  if (!cfg) return '<div class="dok-form"><p>Form belum tersedia.</p></div>';

  const savedKota = getKota();
  let html = '<div class="dok-form">';
  html += `<div class="dok-section-label">✦ Info Dokumen</div>
  <div class="opt-group">
    <div class="opt-label">Kota / Tempat Pembuatan <span class="kota-note">(tersimpan otomatis)</span></div>
    <input class="opt-input" id="gen-kota" type="text" placeholder="cth: Jakarta, Bandung, Surabaya" value="${savedKota}" oninput="saveKota(this.value)">
  </div>`;
  html += '<div class="dok-section-label">✦ Data Wajib</div>';

  cfg.wajib.forEach(f => {
    html += `<div class="opt-group">
      <div class="opt-label">${f.label} <span class="req-star">*</span></div>
      <input class="opt-input" id="${f.id}" type="text" placeholder="${f.placeholder}" oninput="checkReadyDok()">
    </div>`;
  });

  if (cfg.opsional && cfg.opsional.length) {
    html += '<div class="dok-section-label">✦ Data Tambahan (Opsional)</div>';
    cfg.opsional.forEach(f => {
      if (f.select) {
        html += `<div class="opt-group">
          <div class="opt-label">${f.label}</div>
          <select class="opt-select" id="${f.id}">
            ${f.select.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
          </select>
        </div>`;
      } else if (f.textarea) {
        html += `<div class="opt-group">
          <div class="opt-label">${f.label}</div>
          <textarea class="opt-textarea" id="${f.id}" rows="3" placeholder="${f.placeholder}"></textarea>
        </div>`;
      } else {
        html += `<div class="opt-group">
          <div class="opt-label">${f.label}</div>
          <input class="opt-input" id="${f.id}" type="text" placeholder="${f.placeholder}">
        </div>`;
      }
    });
  }

  if (cfg.gaya) {
    html += `<div class="opt-group">
      <div class="opt-label">Gaya / Tone Surat</div>
      <select class="opt-select" id="gen-gaya">
        <option value="ai-auto">🤖 Saran AI — sesuaikan dari konteks</option>
        <option value="formal-profesional">Formal Profesional</option>
        <option value="formal-ramah">Formal Ramah</option>
        <option value="semi-formal">Semi-Formal</option>
      </select>
    </div>`;
  }
  if (cfg.bahasa) {
    html += `<div class="opt-group">
      <div class="opt-label">Bahasa</div>
      <select class="opt-select" id="gen-bahasa">
        <option value="ai-auto">🤖 Saran AI</option>
        <option value="Indonesia formal">Indonesia Formal</option>
        <option value="Indonesia + Istilah Inggris">Indonesia + Istilah Inggris</option>
        <option value="English">English</option>
      </select>
    </div>`;
  }

  html += `<div class="opt-group">
    <div class="opt-label">Catatan Tambahan</div>
    <textarea class="opt-textarea" id="gen-catatan" rows="2" placeholder="Hal lain yang perlu disampaikan ke AI..."></textarea>
  </div>`;

  html += '</div>';
  return html;
}

/* ════════════════════════════════════
   VALIDASI GENERIC
════════════════════════════════════ */
const DOK_REQUIRED = {
  lamaran: ['lam-nama','lam-posisi','lam-perusahaan'],
  cv:      ['cv-nama','cv-profesi'],
  izin:    ['izin-nama','izin-tujuan','izin-tanggal'],
  domisili:   ['dom-nama','dom-alamat'],
  pengantar:  ['pgn-nama','pgn-keperluan'],
  dispensasi:    ['dsp-nama','dsp-keperluan','dsp-tanggal'],
  kenaikan_gaji: ['kgj-nama','kgj-jabatan','kgj-perusahaan','kgj-ditujukan'],
  sktm:          ['sktm-nama','sktm-keperluan'],
  referensi:     ['ref-pemberi','ref-jabatan','ref-perusahaan','ref-penerima'],
  keterangan:    ['ket-nama','ket-jabatan','ket-perusahaan','ket-pembuat'],
  resign:        ['rsn-nama','rsn-jabatan','rsn-perusahaan','rsn-atasan'],
  jb_kendaraan:  ['jbk-penjual','jbk-pembeli','jbk-kendaraan','jbk-nopol','jbk-harga'],
  jb_tanah:      ['jbt-penjual','jbt-pembeli','jbt-objek','jbt-luas','jbt-harga'],
  sewa:          ['sew-pemilik','sew-penyewa','sew-objek','sew-harga','sew-mulai','sew-durasi'],
  hutang:        ['hut-pemberi','hut-penerima','hut-nominal','hut-tenor'],
  kerjasama:     ['ksm-pihak1','ksm-pihak2','ksm-usaha','ksm-bagi'],
  kontrak_kerja: ['ktk-perusahaan','ktk-karyawan','ktk-jabatan','ktk-gaji','ktk-durasi'],
  kuasa:         ['kua-pemberi','kua-penerima','kua-keperluan'],
  pernyataan:    ['pny-nama','pny-isi'],
  penawaran:     ['pen-pengirim','pen-penerima','pen-produk'],
  berita_acara:  ['ba-pihak1','ba-pihak2','ba-objek'],
  teguran:       ['tgr-perusahaan','tgr-karyawan','tgr-jabatan','tgr-pelanggaran'],
  undangan:      ['und-pengirim','und-penerima','und-acara','und-waktu'],
  nota:              ['not-penjual','not-pembeli','not-keterangan','not-total'],
  undangan_nikah:    ['un-template','un-pria-nama','un-wanita-nama','un-akad-tanggal','un-akad-tempat'],
  undangan_khitanan: ['unk-template','unk-nama-anak','unk-tanggal','unk-tempat'],
  undangan_aqiqah:   ['unq-template','unq-nama-bayi','unq-tanggal','unq-tempat'],
  undangan_ultah:    ['unu-template','unu-nama','unu-tanggal','unu-tempat'],
};

function isReadyDok() {
  if (!currentModDok) return false;
  const required = DOK_REQUIRED[currentModDok] || [];
  return required.every(id => dokVal(id));
}

function getMissingHintDok() {
  const required = DOK_REQUIRED[currentModDok] || [];
  for (const id of required) {
    if (!dokVal(id)) {
      const label = document.getElementById(id)?.previousElementSibling?.textContent
        ?.replace('*','').trim() || id;
      return `⚠️ ${label} wajib diisi`;
    }
  }
  return 'Isi data wajib lalu klik Generate Prompt';
}

function checkReadyDok() {
  const btn  = document.querySelector('.btn-proses');
  const hint = document.getElementById('action-hint');
  if (!btn) return;
  const ok = isReadyDok();
  btn.disabled = !ok;
  if (hint) {
    hint.textContent = ok ? 'Siap — klik Generate Prompt' : getMissingHintDok();
    hint.style.color = ok ? '' : 'var(--red)';
    hint.style.fontWeight = ok ? '' : '600';
  }
}

function dokVal(id) { return (document.getElementById(id)?.value?.trim() || '') !== ''; }
function dokGet(id) { return document.getElementById(id)?.value?.trim() || ''; }

/* ════════════════════════════════════
   REVISI QUICK-ACTION
════════════════════════════════════ */
const REVISI_PROMPTS = {
  formal:   'Revisi: Tingkatkan formalitas dan kesan profesional dokumen ini. Gunakan diksi yang lebih resmi, hindari kalimat informal, pastikan setiap paragraf berbobot dan otoritatif.',
  singkat:  'Revisi: Persingkat dokumen ini — hapus pengulangan dan kalimat tidak esensial. Target: 30% lebih ringkas, tetap lengkap dan tidak kehilangan poin penting.',
  prestasi: 'Revisi: Perkuat bagian kunci dengan menambahkan detail konkret — pencapaian spesifik, angka, fakta yang bisa diverifikasi — agar pembaca lebih terkesan.',
  inggris:  'Revisi: Terjemahkan dan adaptasikan ke Bahasa Inggris profesional. Sesuaikan terminologi dengan standar bisnis/hukum internasional, jaga tone formal.',
};

function copyRevisi(type) {
  const text = REVISI_PROMPTS[type];
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => showToast('Instruksi revisi tersalin — paste ke chat AI.', 'success'))
    .catch(() => showToast('Gagal menyalin.', 'error'));
}

function renderRevisiActions() {
  const wrap = document.getElementById('result-actions-wrap');
  if (!wrap || !generatedPrompt) return;
  document.getElementById('revisi-actions')?.remove();
  const div = document.createElement('div');
  div.id = 'revisi-actions';
  div.className = 'revisi-actions';
  div.innerHTML = `
    <div class="revisi-label">✏️ Revisi Cepat — Salin &amp; Paste ke Chat AI:</div>
    <div class="revisi-btns">
      <button class="btn-revisi" onclick="copyRevisi('formal')">🎩 Lebih Formal</button>
      <button class="btn-revisi" onclick="copyRevisi('singkat')">✂️ Persingkat</button>
      <button class="btn-revisi" onclick="copyRevisi('prestasi')">📈 Tambah Detail</button>
      <button class="btn-revisi" onclick="copyRevisi('inggris')">🇬🇧 Versi Inggris</button>
    </div>`;
  wrap.after(div);
}

/* ════════════════════════════════════
   GENERIC PROMPT BUILDER
════════════════════════════════════ */
const PROMPT_CONFIGS = {
  referensi: {
    judul: 'Surat Referensi / Rekomendasi',
    peran: 'HR professional dan penulis surat rekomendasi profesional Indonesia',
    dataFn: () => {
      const lines = [
        `• Pemberi referensi: ${dokGet('ref-pemberi')} — ${dokGet('ref-jabatan')} di ${dokGet('ref-perusahaan')}`,
        `• Nama yang direkomendasikan: ${dokGet('ref-penerima')}`,
      ];
      if (dokGet('ref-posisi-penerima')) lines.push(`• Posisi saat bekerja: ${dokGet('ref-posisi-penerima')}`);
      if (dokGet('ref-lama'))            lines.push(`• Lama bekerja bersama: ${dokGet('ref-lama')}`);
      if (dokGet('ref-tujuan'))          lines.push(`• Tujuan referensi: ${dokGet('ref-tujuan')}`);
      if (dokGet('ref-catatan'))         lines.push(`• Catatan: ${dokGet('ref-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Tulis surat referensi dari perspektif pemberi referensi (orang pertama). Tonjolkan karakter, kemampuan profesional, dan alasan merekomendasikan. Hindari klise berlebihan.`,
    panjang: '300–400 kata',
    templateType: 'surat',
    saran: [
      'Tambahkan pencapaian spesifik yang lebih konkret dan berkesan',
      'Perkuat bagian alasan rekomendasi agar lebih meyakinkan',
      'Sesuaikan tone dengan bidang/industri tujuan (akademik vs korporat)',
    ],
  },
  keterangan: {
    judul: 'Surat Keterangan Kerja',
    peran: 'HRD profesional Indonesia',
    dataFn: () => {
      const lines = [
        `• Nama karyawan: ${dokGet('ket-nama')}`,
        `• Jabatan: ${dokGet('ket-jabatan')}`,
        `• Perusahaan: ${dokGet('ket-perusahaan')}`,
        `• Pembuat surat: ${dokGet('ket-pembuat')}`,
      ];
      if (dokGet('ket-tgl-masuk'))  lines.push(`• Tanggal mulai bekerja: ${dokGet('ket-tgl-masuk')}`);
      if (dokGet('ket-keperluan'))  lines.push(`• Keperluan surat: ${dokGet('ket-keperluan')}`);
      if (dokGet('ket-catatan'))    lines.push(`• Catatan: ${dokGet('ket-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Tulis surat keterangan kerja resmi dari perusahaan. Format formal, singkat, dan jelas. Nyatakan dengan tegas bahwa karyawan masih aktif bekerja. Sertakan nomor surat dengan placeholder [No. xxxx/HRD/xx/2025].`,
    panjang: '150–250 kata',
    templateType: 'surat',
    saran: [
      'Tambahkan kalimat tentang perilaku/kinerja karyawan jika diperlukan',
      'Sesuaikan keperluan surat di akhir paragraf',
      'Tambahkan stempel perusahaan dan kolom tanda tangan',
    ],
  },
  resign: {
    judul: 'Surat Pengunduran Diri',
    peran: 'career coach dan penulis surat profesional Indonesia',
    dataFn: () => {
      const lines = [
        `• Nama karyawan: ${dokGet('rsn-nama')}`,
        `• Jabatan: ${dokGet('rsn-jabatan')}`,
        `• Perusahaan: ${dokGet('rsn-perusahaan')}`,
        `• Ditujukan kepada: ${dokGet('rsn-atasan')}`,
      ];
      if (dokGet('rsn-tgl-terakhir')) lines.push(`• Hari terakhir kerja: ${dokGet('rsn-tgl-terakhir')}`);
      if (dokGet('rsn-alasan'))       lines.push(`• Alasan resign: ${dokGet('rsn-alasan')}`);
      if (dokGet('rsn-catatan'))      lines.push(`• Catatan: ${dokGet('rsn-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Tulis surat pengunduran diri yang profesional. Tone: sopan, positif, tidak membakar jembatan. Ucapkan terima kasih atas kesempatan yang diberikan. Tawarkan membantu transisi jika diperlukan. Jika alasan resign tidak disebutkan, cukup tulis "karena alasan pribadi" tanpa penjelasan lebih.`,
    panjang: '200–300 kata',
    templateType: 'surat',
    saran: [
      'Tambahkan kenangan positif atau pencapaian selama bekerja',
      'Perjelas penawaran serah terima pekerjaan',
      'Sesuaikan notice period jika berbeda dari default (1 bulan)',
    ],
  },
  jb_kendaraan: {
    judul: 'Surat Jual Beli Kendaraan',
    peran: 'notaris muda dan penulis dokumen legal Indonesia',
    dataFn: () => {
      const lines = [
        `• Penjual: ${dokGet('jbk-penjual')}`,
        `• Pembeli: ${dokGet('jbk-pembeli')}`,
        `• Kendaraan: ${dokGet('jbk-kendaraan')}`,
        `• Nomor Polisi: ${dokGet('jbk-nopol')}`,
        `• Harga jual: ${dokGet('jbk-harga')}`,
      ];
      if (dokGet('jbk-noka'))    lines.push(`• No. Rangka/Mesin: ${dokGet('jbk-noka')}`);
      if (dokGet('jbk-thn'))     lines.push(`• Tahun: ${dokGet('jbk-thn')}`);
      if (dokGet('jbk-kondisi')) lines.push(`• Kondisi: ${dokGet('jbk-kondisi')}`);
      if (dokGet('jbk-catatan')) lines.push(`• Catatan: ${dokGet('jbk-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat surat jual beli kendaraan bawah tangan yang valid. Harus mencakup: identitas penjual & pembeli, deskripsi kendaraan lengkap, harga, pernyataan kerelaan kedua pihak, tanggal, kolom tanda tangan 2 saksi. Tambahkan klausul bahwa kendaraan dijual dalam kondisi apa adanya dan pembeli sudah memeriksa. Sertakan kwitansi sederhana sebagai bagian terpisah.`,
    panjang: '250–350 kata (surat) + kwitansi terpisah',
    templateType: 'perjanjian',
    saran: [
      'Tambahkan detail nomor rangka dan mesin untuk keamanan',
      'Perjelas klausul jika ada masalah hukum terkait kendaraan sebelum tanggal jual',
      'Sarankan untuk legalisir ke notaris jika nilai tinggi',
    ],
  },
  jb_tanah: {
    judul: 'Surat Jual Beli Tanah / Rumah (Bawah Tangan)',
    peran: 'notaris muda dan penulis dokumen legal properti Indonesia',
    dataFn: () => {
      const lines = [
        `• Penjual: ${dokGet('jbt-penjual')}`,
        `• Pembeli: ${dokGet('jbt-pembeli')}`,
        `• Objek: ${dokGet('jbt-objek')}`,
        `• Luas: ${dokGet('jbt-luas')}`,
        `• Harga: ${dokGet('jbt-harga')}`,
      ];
      if (dokGet('jbt-sertifikat')) lines.push(`• Sertifikat: ${dokGet('jbt-sertifikat')}`);
      if (dokGet('jbt-dp'))         lines.push(`• DP & pembayaran: ${dokGet('jbt-dp')}`);
      if (dokGet('jbt-catatan'))    lines.push(`• Catatan: ${dokGet('jbt-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat surat perjanjian jual beli tanah/rumah bawah tangan. Harus mencakup: identitas para pihak, deskripsi lengkap objek, harga & cara pembayaran, pernyataan jual beli sukarela, klausul penyerahan dokumen, kolom tanda tangan saksi 2 orang. Tambahkan catatan bahwa surat ini bersifat sementara dan perlu dilanjutkan ke AJB notaris untuk keabsahan penuh.`,
    panjang: '350–500 kata',
    templateType: 'perjanjian',
    saran: [
      'Tambahkan klausul jika pembeli gagal bayar sisa',
      'Perjelas timeline penyerahan sertifikat asli',
      'Ingatkan bahwa dokumen ini perlu materai dan legalisir notaris untuk kekuatan hukum penuh',
    ],
  },
  sewa: {
    judul: 'Perjanjian Sewa',
    peran: 'penulis kontrak dan perjanjian sewa Indonesia',
    dataFn: () => {
      const lines = [
        `• Pemilik (Pihak I): ${dokGet('sew-pemilik')}`,
        `• Penyewa (Pihak II): ${dokGet('sew-penyewa')}`,
        `• Objek sewa: ${dokGet('sew-objek')}`,
        `• Harga sewa: ${dokGet('sew-harga')}`,
        `• Mulai sewa: ${dokGet('sew-mulai')}`,
        `• Durasi: ${dokGet('sew-durasi')}`,
      ];
      if (dokGet('sew-dp'))      lines.push(`• Deposit: ${dokGet('sew-dp')}`);
      if (dokGet('sew-aturan'))  lines.push(`• Aturan khusus: ${dokGet('sew-aturan')}`);
      if (dokGet('sew-catatan')) lines.push(`• Catatan: ${dokGet('sew-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat perjanjian sewa yang lengkap. Harus mencakup: identitas para pihak, deskripsi objek sewa, harga dan cara pembayaran, hak & kewajiban masing-masing pihak, aturan penggunaan, kondisi pemutusan kontrak lebih awal, denda keterlambatan, kondisi pengembalian deposit, kolom tanda tangan. Gunakan Pasal-Pasal untuk memudahkan referensi.`,
    panjang: '400–600 kata (dengan pasal-pasal)',
    templateType: 'perjanjian',
    saran: [
      'Tambahkan klausul tentang biaya utilitas (listrik, air, internet)',
      'Perjelas kondisi renovasi/modifikasi oleh penyewa',
      'Tambahkan klausul force majeure',
    ],
  },
  hutang: {
    judul: 'Surat Perjanjian Hutang Piutang',
    peran: 'penulis dokumen legal dan perjanjian keuangan Indonesia',
    dataFn: () => {
      const lines = [
        `• Pemberi pinjaman (Kreditur): ${dokGet('hut-pemberi')}`,
        `• Penerima pinjaman (Debitur): ${dokGet('hut-penerima')}`,
        `• Jumlah pinjaman: ${dokGet('hut-nominal')}`,
        `• Jangka waktu: ${dokGet('hut-tenor')}`,
      ];
      if (dokGet('hut-bunga'))   lines.push(`• Bunga: ${dokGet('hut-bunga')}`);
      if (dokGet('hut-cicilan')) lines.push(`• Cara bayar: ${dokGet('hut-cicilan')}`);
      if (dokGet('hut-jaminan')) lines.push(`• Jaminan: ${dokGet('hut-jaminan')}`);
      if (dokGet('hut-catatan')) lines.push(`• Catatan: ${dokGet('hut-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat surat perjanjian hutang piutang yang mengikat. Harus mencakup: identitas kedua pihak, jumlah pinjaman dalam angka dan huruf, jangka waktu, bunga (atau keterangan tanpa bunga), cara pembayaran, konsekuensi gagal bayar/telat, jaminan (jika ada), kolom tanda tangan 2 saksi. Nominal dalam huruf wajib ada untuk menghindari sengketa.`,
    panjang: '300–450 kata',
    templateType: 'perjanjian',
    saran: [
      'Tambahkan klausul denda keterlambatan yang spesifik (misal: 2%/bulan)',
      'Perjelas mekanisme jika debitur meninggal dunia atau bangkrut',
      'Sarankan untuk bermaterai Rp 10.000 agar kuat secara hukum',
    ],
  },
  kerjasama: {
    judul: 'Perjanjian Kerjasama Usaha',
    peran: 'penulis kontrak bisnis dan perjanjian usaha Indonesia',
    dataFn: () => {
      const lines = [
        `• Pihak Pertama: ${dokGet('ksm-pihak1')}`,
        `• Pihak Kedua: ${dokGet('ksm-pihak2')}`,
        `• Jenis usaha: ${dokGet('ksm-usaha')}`,
        `• Pembagian hasil: ${dokGet('ksm-bagi')}`,
      ];
      if (dokGet('ksm-durasi'))  lines.push(`• Durasi: ${dokGet('ksm-durasi')}`);
      if (dokGet('ksm-modal'))   lines.push(`• Modal: ${dokGet('ksm-modal')}`);
      if (dokGet('ksm-tugas'))   lines.push(`• Pembagian tugas: ${dokGet('ksm-tugas')}`);
      if (dokGet('ksm-catatan')) lines.push(`• Klausul khusus: ${dokGet('ksm-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat MOU/PKS kerjasama usaha sederhana. Harus mencakup: identitas para pihak, ruang lingkup usaha, modal dan pembagiannya, tugas dan tanggung jawab masing-masing pihak, pembagian keuntungan & kerugian, durasi dan perpanjangan, mekanisme keluar dari kerjasama, penyelesaian sengketa, kolom tanda tangan. Gunakan pasal-pasal.`,
    panjang: '400–600 kata',
    templateType: 'perjanjian',
    saran: [
      'Tambahkan klausul non-kompetisi selama kerjasama berlangsung',
      'Perjelas prosedur audit dan pelaporan keuangan',
      'Tambahkan klausul kerahasiaan (confidentiality)',
    ],
  },
  kontrak_kerja: {
    judul: 'Surat Perjanjian Kerja / PKWT',
    peran: 'HRD profesional dan penulis kontrak kerja Indonesia sesuai UU Ketenagakerjaan',
    dataFn: () => {
      const lines = [
        `• Perusahaan (Pihak I): ${dokGet('ktk-perusahaan')}`,
        `• Karyawan (Pihak II): ${dokGet('ktk-karyawan')}`,
        `• Jabatan: ${dokGet('ktk-jabatan')}`,
        `• Gaji: ${dokGet('ktk-gaji')}`,
        `• Durasi kontrak: ${dokGet('ktk-durasi')}`,
      ];
      if (dokGet('ktk-jam'))       lines.push(`• Jam kerja: ${dokGet('ktk-jam')}`);
      if (dokGet('ktk-fasilitas')) lines.push(`• Fasilitas/tunjangan: ${dokGet('ktk-fasilitas')}`);
      if (dokGet('ktk-catatan'))   lines.push(`• Ketentuan tambahan: ${dokGet('ktk-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat PKWT (Perjanjian Kerja Waktu Tertentu) yang sesuai dengan UU No. 13 Tahun 2003 jo UU Cipta Kerja. Harus mencakup: identitas para pihak, jabatan & deskripsi pekerjaan, gaji & tunjangan, jam kerja & istirahat, hak & kewajiban karyawan, cuti & hari libur, tata tertib, mekanisme PHK dan peringatan, masa percobaan (jika ada), kolom tanda tangan. Gunakan pasal-pasal.`,
    panjang: '500–700 kata',
    templateType: 'perjanjian',
    saran: [
      'Tambahkan pasal tentang kerahasiaan informasi perusahaan',
      'Perjelas prosedur lembur dan kompensasinya',
      'Tambahkan klausul perpanjangan kontrak',
    ],
  },
  kuasa: {
    judul: 'Surat Kuasa',
    peran: 'notaris muda dan penulis dokumen legal Indonesia',
    dataFn: () => {
      const lines = [
        `• Pemberi kuasa: ${dokGet('kua-pemberi')}`,
        `• Penerima kuasa: ${dokGet('kua-penerima')}`,
        `• Hal yang dikuasakan: ${dokGet('kua-keperluan')}`,
      ];
      if (dokGet('kua-identitas-pemberi'))  lines.push(`• NIK pemberi: ${dokGet('kua-identitas-pemberi')}`);
      if (dokGet('kua-identitas-penerima')) lines.push(`• NIK penerima: ${dokGet('kua-identitas-penerima')}`);
      if (dokGet('kua-batas'))   lines.push(`• Masa berlaku: ${dokGet('kua-batas')}`);
      if (dokGet('kua-catatan')) lines.push(`• Catatan: ${dokGet('kua-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat surat kuasa yang valid secara hukum. Harus mencakup: identitas lengkap pemberi & penerima kuasa (nama, NIK jika ada, alamat), hal spesifik yang dikuasakan dengan jelas, batas waktu berlaku, pernyataan bahwa pemberi kuasa bertanggung jawab atas tindakan penerima dalam lingkup kuasa ini, tempat & tanggal, kolom tanda tangan. Gunakan bahasa hukum yang tepat namun mudah dipahami.`,
    panjang: '200–300 kata',
    templateType: 'surat',
    saran: [
      'Perjelas cakupan kuasa — apa yang boleh dan tidak boleh dilakukan',
      'Tambahkan klausul pembatalan kuasa jika diperlukan',
      'Ingatkan bahwa surat kuasa yang bermaterai lebih kuat secara hukum',
    ],
  },
  pernyataan: {
    judul: 'Surat Pernyataan',
    peran: 'penulis dokumen legal dan administrasi Indonesia',
    dataFn: () => {
      const lines = [`• Yang membuat pernyataan: ${dokGet('pny-nama')}`, `• Isi pernyataan: ${dokGet('pny-isi')}`];
      if (dokGet('pny-nik'))          lines.push(`• NIK: ${dokGet('pny-nik')}`);
      if (dokGet('pny-tujuan'))       lines.push(`• Ditujukan kepada: ${dokGet('pny-tujuan')}`);
      if (dokGet('pny-konsekuensi'))  lines.push(`• Konsekuensi: ${dokGet('pny-konsekuensi')}`);
      if (dokGet('pny-saksi'))        lines.push(`• Saksi: ${dokGet('pny-saksi')}`);
      if (dokGet('pny-catatan'))      lines.push(`• Catatan: ${dokGet('pny-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat surat pernyataan yang tegas dan jelas. Format: judul "SURAT PERNYATAAN", identitas yang membuat pernyataan, isi pernyataan yang spesifik dan tegas (dalam poin jika lebih dari satu), konsekuensi jika pernyataan tidak benar, tempat & tanggal, kolom tanda tangan (dan saksi jika ada). Bahasa formal hukum namun mudah dipahami.`,
    panjang: '150–250 kata',
    templateType: 'surat',
    saran: [
      'Perjelas setiap butir pernyataan agar tidak ambigu',
      'Tambahkan kalimat "dibuat dengan sadar tanpa paksaan dari pihak manapun"',
      'Sarankan untuk bermaterai dan diketahui RT/RW jika diperlukan',
    ],
  },
  penawaran: {
    judul: 'Surat Penawaran',
    peran: 'business writer dan marketing professional Indonesia',
    dataFn: () => {
      const lines = [
        `• Pengirim: ${dokGet('pen-pengirim')}`,
        `• Ditujukan ke: ${dokGet('pen-penerima')}`,
        `• Produk/jasa yang ditawarkan: ${dokGet('pen-produk')}`,
      ];
      if (dokGet('pen-harga'))       lines.push(`• Harga/paket: ${dokGet('pen-harga')}`);
      if (dokGet('pen-keunggulan'))  lines.push(`• Keunggulan: ${dokGet('pen-keunggulan')}`);
      if (dokGet('pen-catatan'))     lines.push(`• Syarat & ketentuan: ${dokGet('pen-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat surat penawaran yang menarik namun tetap profesional. Harus mencakup: salam pembuka, perkenalan singkat perusahaan, deskripsi produk/jasa yang ditawarkan dengan jelas, keunggulan, harga (jika ada), ajakan untuk menghubungi/bertemu, salam penutup. Tone: percaya diri, benefit-focused, tidak terlalu agresif.`,
    panjang: '250–350 kata',
    templateType: 'bisnis',
    saran: [
      'Tambahkan testimoni atau referensi klien jika ada',
      'Perjelas call-to-action (apa yang harus dilakukan penerima)',
      'Sesuaikan pendekatan untuk penerima institusi vs perorangan',
    ],
  },
  berita_acara: {
    judul: 'Berita Acara Serah Terima',
    peran: 'penulis dokumen administratif dan legal Indonesia',
    dataFn: () => {
      const lines = [
        `• Pihak yang menyerahkan: ${dokGet('ba-pihak1')}`,
        `• Pihak yang menerima: ${dokGet('ba-pihak2')}`,
        `• Yang diserahterimakan: ${dokGet('ba-objek')}`,
      ];
      if (dokGet('ba-kondisi')) lines.push(`• Kondisi: ${dokGet('ba-kondisi')}`);
      if (dokGet('ba-catatan')) lines.push(`• Catatan/kekurangan: ${dokGet('ba-catatan')}`);
      if (dokGet('ba-saksi'))   lines.push(`• Saksi: ${dokGet('ba-saksi')}`);
      return lines.join('\n');
    },
    instruksi: `Buat Berita Acara Serah Terima (BAST) yang formal. Harus mencakup: judul "BERITA ACARA SERAH TERIMA", tanggal dan tempat, identitas para pihak, deskripsi apa yang diserahterimakan (dengan detail/nomor seri jika ada), kondisi saat serah terima, pernyataan serah terima berjalan baik/dengan catatan, kolom tanda tangan kedua pihak dan saksi. Gunakan nomor BA dengan placeholder.`,
    panjang: '200–300 kata',
    templateType: 'bisnis',
    saran: [
      'Lampirkan daftar barang terpisah jika yang diserahkan banyak item',
      'Tambahkan klausul bahwa penerima bertanggung jawab penuh setelah BA ditandatangani',
      'Buat 2 rangkap untuk masing-masing pihak',
    ],
  },
  teguran: {
    judul: 'Surat Teguran / Surat Peringatan',
    peran: 'HRD profesional Indonesia yang memahami UU Ketenagakerjaan',
    dataFn: () => {
      const lines = [
        `• Perusahaan: ${dokGet('tgr-perusahaan')}`,
        `• Karyawan: ${dokGet('tgr-karyawan')}`,
        `• Jabatan: ${dokGet('tgr-jabatan')}`,
        `• Pelanggaran: ${dokGet('tgr-pelanggaran')}`,
      ];
      if (dokGet('tgr-level'))  lines.push(`• Level SP: ${dokGet('tgr-level')}`);
      if (dokGet('tgr-tindak')) lines.push(`• Tindak lanjut: ${dokGet('tgr-tindak')}`);
      if (dokGet('tgr-pembuat'))lines.push(`• Pembuat surat: ${dokGet('tgr-pembuat')}`);
      return lines.join('\n');
    },
    instruksi: `Buat surat peringatan (SP) yang sesuai prosedur HR dan UU Ketenagakerjaan. Harus mencakup: nomor surat, identitas karyawan, uraian pelanggaran yang dilakukan (spesifik, faktual, tidak opini), referensi peraturan perusahaan yang dilanggar (atau aturan umum jika tidak disebutkan), tindak lanjut jika terulang, tanda tangan HRD dan atasan, kolom tanda tangan penerimaan karyawan.`,
    panjang: '250–350 kata',
    templateType: 'bisnis',
    saran: [
      'Pastikan pelanggaran dideskripsikan spesifik dengan tanggal kejadian jika ada',
      'Tambahkan pasal peraturan perusahaan yang dilanggar',
      'Sarankan karyawan menandatangani sebagai bukti telah menerima SP',
    ],
  },
  undangan: {
    judul: 'Surat Undangan Rapat / Acara',
    peran: 'sekretaris profesional dan penulis surat dinas Indonesia',
    dataFn: () => {
      const lines = [
        `• Pengirim: ${dokGet('und-pengirim')}`,
        `• Ditujukan kepada: ${dokGet('und-penerima')}`,
        `• Acara: ${dokGet('und-acara')}`,
        `• Waktu & tempat: ${dokGet('und-waktu')}`,
      ];
      if (dokGet('und-agenda'))    lines.push(`• Agenda: ${dokGet('und-agenda')}`);
      if (dokGet('und-dresscode')) lines.push(`• Dress code/ketentuan: ${dokGet('und-dresscode')}`);
      if (dokGet('und-kontak'))    lines.push(`• Konfirmasi kehadiran: ${dokGet('und-kontak')}`);
      return lines.join('\n');
    },
    instruksi: `Buat surat undangan rapat/acara yang formal dan jelas. Harus mencakup: nomor surat (placeholder), salam pembuka, maksud & tujuan undangan, detail acara (waktu, tempat, agenda jika ada), permintaan konfirmasi kehadiran, salam penutup. Format: singkat, padat, semua informasi penting tersedia. Tidak perlu bertele-tele.`,
    panjang: '150–250 kata',
    templateType: 'bisnis',
    saran: [
      'Tambahkan peta lokasi atau link Google Maps jika venue tidak umum dikenal',
      'Perjelas apakah ada konsumsi/akomodasi yang disediakan',
      'Sesuaikan formalitas — rapat internal vs undangan ke pihak luar berbeda tone-nya',
    ],
  },
  nota: {
    judul: 'Nota / Kwitansi Pembayaran',
    peran: 'administrasi toko dan penulis bukti transaksi profesional Indonesia',
    dataFn: () => {
      const lines = [
        `• Penjual / Penerima bayar: ${dokGet('not-penjual')}`,
        `• Pembeli / Pembayar: ${dokGet('not-pembeli')}`,
        `• Keterangan: ${dokGet('not-keterangan')}`,
        `• Total: ${dokGet('not-total')}`,
      ];
      if (dokGet('not-nomor'))   lines.push(`• No. Nota: ${dokGet('not-nomor')}`);
      if (dokGet('not-tanggal')) lines.push(`• Tanggal: ${dokGet('not-tanggal')}`);
      if (dokGet('not-rincian')) lines.push(`• Rincian: ${dokGet('not-rincian')}`);
      if (dokGet('not-bayar'))   lines.push(`• Cara bayar: ${dokGet('not-bayar')}`);
      if (dokGet('not-catatan')) lines.push(`• Catatan: ${dokGet('not-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Buat nota/kwitansi pembayaran yang rapi dan profesional. Harus mencakup: nomor nota, tanggal, identitas penjual dan pembeli, tabel rincian item (nama barang/jasa, jumlah, harga satuan, subtotal), total pembayaran dalam angka dan huruf, cara pembayaran, status (lunas/DP/sisa), kolom tanda tangan penerima bayar. Format: bersih, mudah dibaca, siap cetak. Nominal dalam huruf wajib ada.`,
    panjang: '1 halaman ringkas (nota siap cetak)',
    templateType: 'nota',
    saran: [
      'Tambahkan kolom "terbilang" di bawah total untuk kejelasan nominal',
      'Pisahkan kolom Qty × Harga Satuan = Subtotal agar lebih terstruktur',
      'Tambahkan footer "Terima kasih atas kepercayaan Anda" dan nomor kontak toko',
    ],
  },
  domisili: {
    judul: 'Surat Keterangan Domisili',
    peran: 'petugas administrasi RT/RW atau kelurahan Indonesia',
    dataFn: () => {
      const lines = [
        `• Nama: ${dokGet('dom-nama')}`,
        `• Alamat domisili: ${dokGet('dom-alamat')}`,
      ];
      if (dokGet('dom-nik'))       lines.push(`• NIK/KTP: ${dokGet('dom-nik')}`);
      if (dokGet('dom-keperluan')) lines.push(`• Keperluan: ${dokGet('dom-keperluan')}`);
      if (dokGet('dom-pejabat'))   lines.push(`• Pembuat surat: ${dokGet('dom-pejabat')}`);
      if (dokGet('dom-catatan'))   lines.push(`• Catatan: ${dokGet('dom-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Tulis surat keterangan domisili resmi. Format formal kelurahan/RT-RW Indonesia: kop surat dengan placeholder, nomor surat [No. xxx/Kel-xxx/xx/2025], isi menerangkan bahwa yang bersangkutan benar-benar berdomisili di alamat tersebut, keperluan surat, tanda tangan + stempel pejabat. Singkat dan formal.`,
    panjang: '150–200 kata (1 halaman ringkas)',
    templateType: 'surat',
    saran: [
      'Tambahkan nomor surat dengan format kelurahan yang lebih spesifik',
      'Perjelas apakah perlu tanda tangan RT saja, RT+RW, atau hingga kelurahan',
      'Tambahkan keterangan "berlaku selama xx hari" jika diperlukan',
    ],
  },
  pengantar: {
    judul: 'Surat Pengantar RT/RW',
    peran: 'Ketua RT atau Sekretaris RW yang membuat surat pengantar resmi Indonesia',
    dataFn: () => {
      const lines = [
        `• Nama yang dibuatkan surat: ${dokGet('pgn-nama')}`,
        `• Keperluan: ${dokGet('pgn-keperluan')}`,
      ];
      if (dokGet('pgn-nik'))       lines.push(`• NIK/KTP: ${dokGet('pgn-nik')}`);
      if (dokGet('pgn-alamat'))    lines.push(`• Alamat: ${dokGet('pgn-alamat')}`);
      if (dokGet('pgn-ditujukan')) lines.push(`• Ditujukan kepada: ${dokGet('pgn-ditujukan')}`);
      if (dokGet('pgn-pejabat'))   lines.push(`• Pembuat surat: ${dokGet('pgn-pejabat')}`);
      if (dokGet('pgn-catatan'))   lines.push(`• Catatan: ${dokGet('pgn-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Tulis surat pengantar RT/RW yang singkat, resmi, dan langsung ke tujuan. Format standar Indonesia: kop surat dengan placeholder, nomor surat [No. xxx/RT-xx/xx/2025], paragraf "Yang bertanda tangan di bawah ini...", pernyataan bahwa yang bersangkutan adalah warga setempat dan layak mendapat pelayanan yang dimohon, tanda tangan dan stempel RT/RW. Singkat, padat, formal.`,
    panjang: '120–180 kata (1 halaman singkat)',
    templateType: 'surat',
    saran: [
      'Tambahkan keterangan sudah berapa lama menjadi warga setempat',
      'Perjelas apakah perlu 1 tanda tangan RT saja atau juga perlu diketahui RW / kelurahan',
      'Tambahkan kalimat "tidak berkeberatan" jika keperluan menyangkut izin dari pihak setempat',
    ],
  },
  dispensasi: {
    judul: 'Surat Dispensasi',
    peran: 'administrasi sekolah atau HRD kantor Indonesia',
    dataFn: () => {
      const lines = [
        `• Nama: ${dokGet('dsp-nama')}`,
        `• Keperluan dispensasi: ${dokGet('dsp-keperluan')}`,
        `• Tanggal / periode: ${dokGet('dsp-tanggal')}`,
      ];
      if (dokGet('dsp-institusi'))  lines.push(`• Sekolah / instansi: ${dokGet('dsp-institusi')}`);
      if (dokGet('dsp-ditujukan'))  lines.push(`• Ditujukan kepada: ${dokGet('dsp-ditujukan')}`);
      if (dokGet('dsp-pemohon'))    lines.push(`• Pemohon: ${dokGet('dsp-pemohon')}`);
      if (dokGet('dsp-catatan'))    lines.push(`• Catatan: ${dokGet('dsp-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Tulis surat permohonan dispensasi yang sopan dan meyakinkan. Format formal: salam hormat, pengantar singkat, isi permohonan (nama, kelas/jabatan, keperluan, tanggal), komitmen tanggung jawab (siap menyelesaikan kewajiban yang tertinggal), dan penutup yang memohon persetujuan. Nada: hormat, tidak memohon berlebihan, cukup meyakinkan.`,
    panjang: '150–220 kata',
    templateType: 'surat',
    saran: [
      'Tambahkan lampiran pendukung yang akan disertakan (surat undangan lomba, keterangan dokter, dll)',
      'Perkuat komitmen — pastikan isi kegiatan tertinggal atau akan mengikuti ujian susulan',
      'Sesuaikan nada — dispensasi ke kepala sekolah lebih formal dibanding ke HRD kantor kecil',
    ],
  },
  kenaikan_gaji: {
    judul: 'Surat Permohonan Kenaikan Gaji',
    peran: 'HR consultant dan penulis surat profesional Indonesia',
    dataFn: () => {
      const lines = [
        `• Nama pemohon: ${dokGet('kgj-nama')}`,
        `• Jabatan: ${dokGet('kgj-jabatan')}`,
        `• Perusahaan / instansi: ${dokGet('kgj-perusahaan')}`,
        `• Ditujukan kepada: ${dokGet('kgj-ditujukan')}`,
      ];
      if (dokGet('kgj-lama-kerja'))      lines.push(`• Lama bekerja: ${dokGet('kgj-lama-kerja')}`);
      if (dokGet('kgj-gaji-sekarang'))   lines.push(`• Gaji saat ini: ${dokGet('kgj-gaji-sekarang')}`);
      if (dokGet('kgj-target-kenaikan')) lines.push(`• Kenaikan yang diminta: ${dokGet('kgj-target-kenaikan')}`);
      if (dokGet('kgj-alasan'))          lines.push(`• Alasan / prestasi: ${dokGet('kgj-alasan')}`);
      if (dokGet('kgj-catatan'))         lines.push(`• Catatan: ${dokGet('kgj-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Tulis surat permohonan kenaikan gaji yang profesional, sopan, dan meyakinkan. Format: salam pembuka, pengantar singkat (jabatan & lama bekerja), isi permohonan (alasan & kontribusi konkret yang mendukung kenaikan), nominal atau persentase yang diminta (jika ada), penutup yang positif dan tidak memaksa. Nada: percaya diri tapi rendah hati, berbasis fakta kinerja, bukan kebutuhan pribadi.`,
    panjang: '180–250 kata',
    templateType: 'surat',
    saran: [
      'Perkuat dengan pencapaian spesifik — angka penjualan, proyek selesai, tanggung jawab tambahan',
      'Bandingkan dengan standar gaji pasar jika relevan — tunjukkan pemohon tahu nilainya',
      'Usulkan evaluasi berkala — tunjukkan fleksibilitas dan komitmen jangka panjang',
    ],
  },
  sktm: {
    judul: 'SKTM — Surat Keterangan Tidak Mampu',
    peran: 'pejabat RT/RW atau staf administrasi kelurahan Indonesia',
    dataFn: () => {
      const lines = [
        `• Nama pemohon: ${dokGet('sktm-nama')}`,
        `• Keperluan SKTM: ${dokGet('sktm-keperluan')}`,
      ];
      if (dokGet('sktm-nik'))        lines.push(`• NIK: ${dokGet('sktm-nik')}`);
      if (dokGet('sktm-alamat'))     lines.push(`• Alamat: ${dokGet('sktm-alamat')}`);
      if (dokGet('sktm-pekerjaan'))  lines.push(`• Pekerjaan / penghasilan: ${dokGet('sktm-pekerjaan')}`);
      if (dokGet('sktm-tanggungan')) lines.push(`• Tanggungan keluarga: ${dokGet('sktm-tanggungan')}`);
      if (dokGet('sktm-pejabat'))    lines.push(`• Pembuat surat: ${dokGet('sktm-pejabat')}`);
      if (dokGet('sktm-catatan'))    lines.push(`• Catatan: ${dokGet('sktm-catatan')}`);
      return lines.join('\n');
    },
    instruksi: `Tulis SKTM (Surat Keterangan Tidak Mampu) resmi dari RT/RW atau kelurahan. Format: kop surat (RT/RW/Kelurahan), nomor surat, judul "SURAT KETERANGAN TIDAK MAMPU", isi keterangan (identitas lengkap pemohon, kondisi ekonomi, keperluan SKTM), klausul "menerangkan dengan sesungguhnya", tanda tangan pejabat RT/RW dan/atau Lurah. Bahasa resmi, netral, dan faktual — bukan narasi berlebihan.`,
    panjang: '150–200 kata',
    templateType: 'surat',
    saran: [
      'Tambahkan keterangan kondisi rumah / aset jika ingin surat lebih kuat (untuk beasiswa)',
      'Sebutkan jumlah anak yang masih sekolah jika keperluan adalah keringanan biaya pendidikan',
      'Minta cap RT + RW + kelurahan — semakin banyak pejabat yang mengesahkan, semakin kuat surat ini',
    ],
  },
};

function buildPromptGeneric(modKey) {
  const cfg = PROMPT_CONFIGS[modKey];
  if (!cfg) return `Buat ${modKey} berdasarkan data yang ada.`;

  const gaya   = dokGet('gen-gaya')   || 'ai-auto';
  const bahasa = dokGet('gen-bahasa') || 'ai-auto';
  const catatan = dokGet('gen-catatan') || '';

  const gayaInstr = gaya === 'ai-auto' || !gaya
    ? 'GAYA: Sesuaikan gaya otomatis berdasarkan konteks dokumen dan pihak yang terlibat.'
    : `GAYA: ${gaya}`;
  const bahasaInstr = bahasa === 'ai-auto' || !bahasa
    ? 'BAHASA: Gunakan Bahasa Indonesia formal.'
    : `BAHASA: ${bahasa}`;

  const kota    = dokGet('gen-kota') || getKota() || '';
  const tanggal = getTanggalHariIni();
  const dataSection = cfg.dataFn();
  const metaInfo = `• Tanggal: ${tanggal}${kota ? `\n• Kota / tempat pembuatan: ${kota}` : ''}`;

  return `Kamu adalah ${cfg.peran}. Bantu buat ${cfg.judul} berdasarkan data berikut melalui alur ini:

═══════════════════════════════════════════════════════
DATA
═══════════════════════════════════════════════════════
${dataSection}${catatan ? `\n• Catatan tambahan: ${catatan}` : ''}
${metaInfo}

${gayaInstr}
${bahasaInstr}

═══════════════════════════════════════════════════════
ALUR KERJA
═══════════════════════════════════════════════════════

[TAHAP 1 — AUDIT KUALITAS DATA]
Audit data secara cepat (maks. 4 baris). Gunakan marker:
✓ Data lengkap & cukup  ⚠ Ada kekurangan kritis  💡 Bisa diperkuat

Aturan: Jika data sudah cukup untuk dokumen berkualitas → LANGSUNG ke Tahap 2.
Jika ada 1 hal yang benar-benar tidak bisa ditebak AI → tanya 1 pertanyaan saja.
Tujuan: dokumen terbaik dari data yang ada, bukan menunggu data sempurna.

[TAHAP 2 — TULIS DOKUMEN LENGKAP]
${cfg.instruksi}
Panjang: ${cfg.panjang}.
Tulis langsung — percaya diri, jangan terlalu banyak disclaimer.

${promptFlowFooter(cfg.saran, cfg.templateType)}`;
}

/* ════════════════════════════════════
   FORM & PROMPT: LAMARAN KERJA
════════════════════════════════════ */
function renderOpsiLamaran() {
  return `
  <div class="dok-form">
    <div class="dok-section-label">✦ Info Dokumen</div>
    <div class="opt-group">
      <div class="opt-label">Kota / Tempat Pembuatan <span class="kota-note">(tersimpan otomatis)</span></div>
      <input class="opt-input" id="gen-kota" type="text" placeholder="cth: Jakarta, Bandung, Samarinda" value="${getKota()}" oninput="saveKota(this.value)">
    </div>
    <div class="dok-section-label">✦ Data Wajib</div>
    <div class="opt-group">
      <div class="opt-label">Nama Lengkap <span class="req-star">*</span></div>
      <input class="opt-input" id="lam-nama" type="text" placeholder="cth: Budi Santoso" oninput="checkReadyDok()">
    </div>
    <div class="opt-group">
      <div class="opt-label">Posisi yang Dilamar <span class="req-star">*</span></div>
      <input class="opt-input" id="lam-posisi" type="text" placeholder="cth: Staff Kasir, Manajer Pemasaran, Guru SD" oninput="checkReadyDok()">
    </div>
    <div class="opt-group">
      <div class="opt-label">Nama Perusahaan / Toko / Instansi <span class="req-star">*</span></div>
      <input class="opt-input" id="lam-perusahaan" type="text" placeholder="cth: Toko Maju Bersama, PT. Sinar Abadi" oninput="checkReadyDok()">
    </div>
    <div class="dok-section-label">✦ Data Diri</div>
    <div style="display:flex;gap:8px">
      <div class="opt-group" style="flex:1">
        <div class="opt-label">Usia</div>
        <input class="opt-input" id="lam-usia" type="number" min="15" max="65" placeholder="cth: 24">
      </div>
      <div class="opt-group" style="flex:2">
        <div class="opt-label">Jenis Kelamin</div>
        <select class="opt-select" id="lam-gender">
          <option value="">Tidak disebutkan</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>
    </div>
    <div class="dok-section-label">✦ Latar Belakang — Makin Lengkap, Makin Personal</div>
    <div class="opt-group">
      <div class="opt-label">Pendidikan Terakhir</div>
      <select class="opt-select" id="lam-pendidikan">
        <option value="">🤖 Biarkan AI sesuaikan</option>
        <option value="SD">SD</option><option value="SMP">SMP</option>
        <option value="SMA/SMK">SMA / SMK</option><option value="D1/D2/D3">D1 / D2 / D3</option>
        <option value="S1/D4">S1 / D4</option><option value="S2 (Magister)">S2 — Magister</option>
        <option value="S3 (Doktor)">S3 — Doktor</option>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Pengalaman Kerja</div>
      <select class="opt-select" id="lam-pengalaman">
        <option value="">🤖 Biarkan AI sesuaikan</option>
        <option value="fresh graduate, belum memiliki pengalaman kerja formal">Fresh Graduate</option>
        <option value="pengalaman kerja kurang dari 1 tahun">Kurang dari 1 Tahun</option>
        <option value="pengalaman kerja 1–2 tahun">1–2 Tahun</option>
        <option value="pengalaman kerja 3–5 tahun">3–5 Tahun</option>
        <option value="pengalaman kerja lebih dari 5 tahun">Lebih dari 5 Tahun</option>
        <option value="pengalaman kerja lebih dari 10 tahun">Lebih dari 10 Tahun</option>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Bidang / Pengalaman Sebelumnya</div>
      <input class="opt-input" id="lam-bidang" type="text" placeholder="cth: pernah kerja di minimarket, toko baju, kantor">
    </div>
    <div class="opt-group">
      <div class="opt-label">Keahlian / Kelebihan Utama</div>
      <input class="opt-input" id="lam-keahlian" type="text" placeholder="cth: komunikatif, komputer, memasak, administrasi">
    </div>
    <div class="dok-section-label">✦ Info Lamaran</div>
    <div class="opt-group">
      <div class="opt-label">Sumber Info Lowongan</div>
      <select class="opt-select" id="lam-sumber">
        <option value="">🤖 Biarkan AI sesuaikan</option>
        <option value="media sosial (Instagram/Facebook/LinkedIn)">Media Sosial</option>
        <option value="website perusahaan">Website Perusahaan</option>
        <option value="job portal online (Jobstreet, Karir.com, dll)">Job Portal Online</option>
        <option value="rekomendasi kenalan / kolega">Rekomendasi / Kenalan</option>
        <option value="papan pengumuman / brosur">Papan Pengumuman / Brosur</option>
        <option value="langsung datang (walk-in)">Langsung / Walk-In</option>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Ketersediaan Mulai Kerja</div>
      <select class="opt-select" id="lam-tersedia">
        <option value="">Tidak disebutkan</option>
        <option value="segera / dapat langsung bergabung">Segera / Langsung</option>
        <option value="dalam 1–2 minggu ke depan">1–2 Minggu</option>
        <option value="dalam 1 bulan ke depan">1 Bulan</option>
        <option value="setelah menyelesaikan pekerjaan / kontrak sebelumnya">Setelah Kontrak Selesai</option>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Gaji yang Diharapkan</div>
      <input class="opt-input" id="lam-gaji" type="text" placeholder="cth: Rp 3.500.000 / sesuai UMR / negotiable">
    </div>
    <div class="opt-group">
      <div class="opt-label">Lampiran yang Disertakan</div>
      <input class="opt-input" id="lam-lampiran" type="text" placeholder="cth: CV, ijazah, transkrip nilai, SKCK, sertifikat, portofolio">
    </div>
    <div class="dok-section-label">✦ Preferensi Penulisan</div>
    <div class="opt-group">
      <div class="opt-label">Gaya / Tone Surat</div>
      <select class="opt-select" id="lam-gaya">
        <option value="ai-auto">🤖 Saran AI — sesuaikan dari nama perusahaan &amp; posisi</option>
        <option value="formal-profesional">Formal Profesional — BUMN, perusahaan besar, pemerintah</option>
        <option value="formal-ramah">Formal Ramah — toko, UKM, sekolah, yayasan</option>
        <option value="semi-formal">Semi-Formal — startup, agency kreatif, tech company</option>
        <option value="singkat-padat">Singkat &amp; Padat — 1 halaman ketat, langsung ke inti</option>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Bahasa</div>
      <select class="opt-select" id="lam-bahasa">
        <option value="ai-auto">🤖 Saran AI — pilih bahasa paling sesuai</option>
        <option value="Indonesia formal">Indonesia Formal</option>
        <option value="Indonesia dengan campuran istilah profesional Inggris">Indonesia + Istilah Inggris</option>
        <option value="English (formal professional)">English</option>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Catatan Khusus</div>
      <textarea class="opt-textarea" id="lam-catatan" rows="2" placeholder="cth: bersedia lembur, domisili dekat lokasi, punya SIM A/C, bersedia ditempatkan di luar kota..."></textarea>
    </div>
  </div>`;
}

function buildPromptLamaran() {
  const nama      = dokGet('lam-nama'), posisi = dokGet('lam-posisi'), perusahaan = dokGet('lam-perusahaan');
  const pendidikan = dokGet('lam-pendidikan'), pengalaman = dokGet('lam-pengalaman');
  const bidang    = dokGet('lam-bidang'), keahlian = dokGet('lam-keahlian');
  const usia      = dokGet('lam-usia'), gender = dokGet('lam-gender');
  const sumber    = dokGet('lam-sumber'), tersedia = dokGet('lam-tersedia');
  const gaji      = dokGet('lam-gaji'), lampiran = dokGet('lam-lampiran');
  const gaya      = dokGet('lam-gaya'), bahasa = dokGet('lam-bahasa');
  const catatan   = dokGet('lam-catatan');

  const gayaMap = {
    'formal-profesional': 'Formal profesional — bahasa baku EYD ketat, kalimat panjang-terstruktur, cocok BUMN/pemerintah/korporasi besar. Hindari kontraksi, gunakan "saya" bukan "aku".',
    'formal-ramah':       'Formal ramah — bahasa baku tapi hangat, kalimat lebih ringkas, cocok toko/UKM/sekolah/yayasan. Sedikit lebih personal tanpa kehilangan profesionalisme.',
    'semi-formal':        'Semi-formal — bahasa bersih, sedikit lebih ekspresif, cocok startup/agency/tech. Boleh pakai kalimat pendek yang impactful, hindari kaku berlebihan.',
    'singkat-padat':      'Singkat & padat — setiap kata harus earn its place. Max 1 halaman A4. Kalimat singkat, langsung ke inti, tidak ada basa-basi panjang.',
  };
  const gayaInstr = gaya === 'ai-auto' || !gaya
    ? `GAYA: Analisis nama perusahaan "${perusahaan}" dan posisi "${posisi}" — tentukan gaya yang paling tepat (formal-profesional / formal-ramah / semi-formal) dan terapkan konsisten.`
    : `GAYA: ${gayaMap[gaya] || gaya}`;
  const bahasaInstr = bahasa === 'ai-auto' || !bahasa
    ? `BAHASA: Pilih bahasa paling sesuai berdasarkan nama perusahaan dan posisi.`
    : `BAHASA: ${bahasa}`;

  const kota    = dokGet('gen-kota') || getKota() || '';
  const tanggal = getTanggalHariIni();
  const dataLines = [`• Nama: ${nama}`, `• Posisi: ${posisi}`, `• Perusahaan: ${perusahaan}`];
  if (usia)       dataLines.push(`• Usia: ${usia} tahun`);
  if (gender)     dataLines.push(`• Jenis kelamin: ${gender}`);
  if (pendidikan) dataLines.push(`• Pendidikan: ${pendidikan}`);
  if (pengalaman) dataLines.push(`• Pengalaman: ${pengalaman}`);
  if (bidang)     dataLines.push(`• Bidang sebelumnya: ${bidang}`);
  if (keahlian)   dataLines.push(`• Keahlian: ${keahlian}`);
  if (sumber)     dataLines.push(`• Sumber info lowongan: ${sumber}`);
  if (tersedia)   dataLines.push(`• Ketersediaan mulai kerja: ${tersedia}`);
  if (gaji)       dataLines.push(`• Gaji yang diharapkan: ${gaji}`);
  if (lampiran)   dataLines.push(`• Lampiran disertakan: ${lampiran}`);
  if (catatan)    dataLines.push(`• Info tambahan: ${catatan}`);
  dataLines.push(`• Tanggal: ${tanggal}`);
  if (kota)       dataLines.push(`• Kota / tempat pembuatan: ${kota}`);

  const isSingkat = gaya === 'singkat-padat';
  const lampiranPenutup = lampiran
    ? `Sebutkan lampiran "${lampiran}" di paragraf penutup sebagai bagian dari kalimat penutup (jangan list terpisah).`
    : `Tuliskan "bersama surat ini turut saya lampirkan beberapa dokumen pendukung" sebagai transisi ke penutup.`;
  const gajiNote = gaji
    ? `Jika gaya memungkinkan (bukan formal-profesional ketat), sisipkan ekspektasi gaji "${gaji}" di paragraf penutup secara elegan — bukan di tengah surat.`
    : '';
  const tersediaNote = tersedia
    ? `Sebutkan ketersediaan "${tersedia}" di paragraf penutup secara singkat dan positif.`
    : '';

  return `Kamu adalah HR professional dan copywriter spesialis surat lamaran kerja Indonesia. Buat surat lamaran terbaik untuk ${nama}:

═══════════════════════════════════════════════════════
DATA PELAMAR
═══════════════════════════════════════════════════════
${dataLines.join('\n')}

${gayaInstr}
${bahasaInstr}

═══════════════════════════════════════════════════════
ALUR KERJA
═══════════════════════════════════════════════════════

[TAHAP 1 — AUDIT PROFIL & STRATEGI]
Evaluasi cepat (maks. 4 baris):
✓ Kekuatan utama pelamar untuk posisi ini
⚠ Gap yang perlu disiasati (jika ada)
💡 Angle terbaik untuk menonjolkan kandidat ini

Tentukan hook terkuat untuk paragraf pembuka. Langsung ke Tahap 2.

[TAHAP 2 — TULIS SURAT LENGKAP]
Struktur wajib:
① HEADER: tempat, tanggal, Kepada Yth. (nama HRD/pimpinan jika diketahui, atau "Tim Rekrutmen"), perihal lamaran
② PARAGRAF PEMBUKA (2–3 kalimat): dari mana tahu lowongan → posisi yang dilamar → 1 kalimat hook kuat tentang diri (bukan klise "saya tertarik")
③ PARAGRAF ISI (3–5 kalimat): hubungkan pengalaman/keahlian konkret ke kebutuhan posisi ini — gunakan action verb, bukan list kualitas abstrak. Minimal 1 kalimat spesifik ke perusahaan/posisi ini
④ PARAGRAF PENUTUP (2–3 kalimat): ${lampiranPenutup} ${tersediaNote} ${gajiNote} Harapan kesempatan wawancara + terima kasih
⑤ SALAM PENUTUP + tanda tangan + nama lengkap

Panjang target: ${isSingkat ? '250–320 kata (ketat, setiap kalimat harus earn its place)' : '380–500 kata'}. Percaya diri, bukan sombong. Natural, bukan kaku.
LARANGAN: jangan buka dengan "Dengan hormat, saya..." sebagai kalimat pertama — buat lebih kuat. Jangan list keahlian dengan bullet point.

${promptFlowFooter([
    'Perkuat paragraf pembuka — buat lebih spesifik dan personal ke perusahaan ini',
    'Tajamkan paragraf isi — tambahkan 1 pencapaian konkret dengan angka/hasil nyata',
    'Optimalkan tone — sesuaikan register bahasa lebih pas ke skala & industri perusahaan ini',
  ], 'surat')}`;
}

/* ════════════════════════════════════
   FORM & PROMPT: CV
════════════════════════════════════ */
function renderOpsiCV() {
  return `
  <div class="dok-form">
    <div class="dok-section-label">✦ Info Dokumen</div>
    <div class="opt-group">
      <div class="opt-label">Kota / Tempat Pembuatan <span class="kota-note">(tersimpan otomatis)</span></div>
      <input class="opt-input" id="gen-kota" type="text" placeholder="cth: Jakarta, Bandung, Surabaya" value="${getKota()}" oninput="saveKota(this.value)">
    </div>

    <div class="dok-section-label">✦ Data Wajib</div>
    <div class="opt-group">
      <div class="opt-label">Nama Lengkap <span class="req-star">*</span></div>
      <input class="opt-input" id="cv-nama" type="text" placeholder="cth: Siti Rahayu" oninput="checkReadyDok()">
    </div>
    <div class="opt-group">
      <div class="opt-label">Profesi / Target Posisi <span class="req-star">*</span></div>
      <input class="opt-input" id="cv-profesi" type="text" placeholder="cth: Akuntan, Desainer Grafis, Guru Matematika" oninput="checkReadyDok()">
    </div>

    <div class="dok-section-label">✦ Data Diri</div>
    <div class="opt-group" style="display:flex;gap:10px;">
      <div style="flex:1;">
        <div class="opt-label">Usia</div>
        <input class="opt-input" id="cv-usia" type="number" min="16" max="65" placeholder="cth: 24">
      </div>
      <div style="flex:1;">
        <div class="opt-label">Jenis Kelamin</div>
        <select class="opt-select" id="cv-gender">
          <option value="">— Opsional —</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>
    </div>
    <div class="opt-group">
      <div class="opt-label">Kontak</div>
      <input class="opt-input" id="cv-kontak" type="text" placeholder="cth: 08123456789 | email@gmail.com | Kota Bandung">
    </div>
    <div class="opt-group">
      <div class="opt-label">LinkedIn / Portfolio / Website</div>
      <input class="opt-input" id="cv-portfolio" type="text" placeholder="cth: linkedin.com/in/nama | behance.net/nama | github.com/nama">
    </div>

    <div class="dok-section-label">✦ Riwayat &amp; Keahlian</div>
    <div class="opt-group">
      <div class="opt-label">Ringkasan Profil Singkat</div>
      <textarea class="opt-textarea" id="cv-ringkasan" rows="2" placeholder="cth: Lulusan Akuntansi 2022 dengan pengalaman 2 tahun di keuangan, spesialis laporan konsolidasi..."></textarea>
    </div>
    <div class="opt-group">
      <div class="opt-label">Pendidikan</div>
      <textarea class="opt-textarea" id="cv-pendidikan" rows="3" placeholder="cth: S1 Ekonomi — Universitas Gadjah Mada (2018–2022) IPK 3.7&#10;SMA Negeri 1 Yogyakarta (2015–2018)"></textarea>
    </div>
    <div class="opt-group">
      <div class="opt-label">Pengalaman Kerja</div>
      <textarea class="opt-textarea" id="cv-pengalaman" rows="4" placeholder="cth: Staff Keuangan — PT. Maju Jaya (2022–sekarang)&#10;- laporan bulanan, rekonsiliasi bank, mengelola invoice 200+ transaksi/bulan"></textarea>
    </div>
    <div class="opt-group">
      <div class="opt-label">Keahlian</div>
      <textarea class="opt-textarea" id="cv-keahlian" rows="2" placeholder="cth: Microsoft Excel (advanced), SAP, komunikasi lintas tim, bahasa Inggris aktif"></textarea>
    </div>
    <div class="opt-group">
      <div class="opt-label">Organisasi / Penghargaan / Sertifikasi</div>
      <textarea class="opt-textarea" id="cv-lainnya" rows="2" placeholder="cth: Ketua BEM 2021, Sertifikat TOEFL 580, Juara 2 Olimpiade Akuntansi"></textarea>
    </div>
    <div class="opt-group">
      <div class="opt-label">Hobi / Minat <span style="font-size:0.78em;opacity:.6;">(opsional — bantu ATS industri kreatif)</span></div>
      <input class="opt-input" id="cv-hobi" type="text" placeholder="cth: fotografi, menulis konten, coding side project, desain UI">
    </div>

    <div class="dok-section-label">✦ Target &amp; Preferensi</div>
    <div class="opt-group">
      <div class="opt-label">Target Industri / Perusahaan</div>
      <input class="opt-input" id="cv-target" type="text" placeholder="cth: startup teknologi, BUMN, perbankan, agency kreatif, PT. XYZ">
    </div>
    <div class="opt-group">
      <div class="opt-label">Foto di CV</div>
      <select class="opt-select" id="cv-foto">
        <option value="ai-auto">🤖 Saran AI — sesuaikan dengan industri &amp; format</option>
        <option value="ya-formal">Ya — Foto Formal (jas/blazer, latar polos)</option>
        <option value="ya-profesional">Ya — Foto Profesional Santai (smart casual)</option>
        <option value="tidak">Tidak — Tanpa Foto</option>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Format CV</div>
      <select class="opt-select" id="cv-format">
        <option value="ai-auto">🤖 Saran AI — pilihkan format terbaik sesuai profil</option>
        <option value="profesional-modern">Profesional Modern — ATS-friendly, semua industri</option>
        <option value="kreatif-visual">Kreatif / Visual — desain, marketing, konten</option>
        <option value="akademis">Akademis — guru, dosen, peneliti</option>
        <option value="entry-level">Entry Level / Fresh Graduate</option>
        <option value="senior-executive">Senior / Eksekutif — manajer ke atas</option>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Bahasa</div>
      <select class="opt-select" id="cv-bahasa">
        <option value="ai-auto">🤖 Saran AI — sesuaikan dengan profil &amp; target</option>
        <option value="Indonesia">Indonesia</option>
        <option value="Inggris (English)">English</option>
        <option value="Bilingual Indonesia + Inggris">Bilingual Indonesia + Inggris</option>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Catatan Khusus</div>
      <textarea class="opt-textarea" id="cv-catatan" rows="2" placeholder="cth: maksimal 1 halaman A4, sertakan kolom referensi, highlight proyek tertentu..."></textarea>
    </div>
  </div>`;
}

function buildPromptCV() {
  const nama      = dokGet('cv-nama'),      profesi   = dokGet('cv-profesi');
  const kontak    = dokGet('cv-kontak'),    portfolio = dokGet('cv-portfolio');
  const usia      = dokGet('cv-usia'),      gender    = dokGet('cv-gender');
  const ringkasan = dokGet('cv-ringkasan'), target    = dokGet('cv-target');
  const pendidikan= dokGet('cv-pendidikan'),pengalaman= dokGet('cv-pengalaman');
  const keahlian  = dokGet('cv-keahlian'), lainnya   = dokGet('cv-lainnya');
  const hobi      = dokGet('cv-hobi'),     catatan   = dokGet('cv-catatan');
  const format    = dokGet('cv-format'),   bahasa    = dokGet('cv-bahasa');
  const foto      = dokGet('cv-foto');

  const formatMap = {
    'profesional-modern': 'Profesional Modern — ATS-friendly, section jelas, bullet point ringkas, hindari tabel/kolom karena rawan gagal parse ATS',
    'kreatif-visual':     'Kreatif/Visual — boleh dua kolom, highlight proyek/portofolio, kreativitas & personal branding diutamakan',
    'akademis':           'Akademis — pendidikan, riset, publikasi, prestasi akademik di atas pengalaman kerja; gunakan judul section formal',
    'entry-level':        'Entry Level/Fresh Graduate — prioritaskan pendidikan, organisasi, prestasi; kompensasi pengalaman tipis dengan potensi & semangat',
    'senior-executive':   'Senior/Eksekutif — pencapaian impactful dengan angka bisnis nyata, kepemimpinan, ringkas tapi berbobot; max 2 halaman',
  };
  const formatInstr = format === 'ai-auto' || !format
    ? `FORMAT: Pilih format terbaik untuk profil ${nama} (${profesi}${target ? ', target: ' + target : ''}) secara otomatis, jelaskan alasanmu dalam 1 kalimat.`
    : `FORMAT: ${formatMap[format] || format}`;

  const bahasaInstr = bahasa === 'ai-auto' || !bahasa
    ? `BAHASA: Pilih bahasa paling sesuai berdasarkan profil dan target industri/perusahaan ini.`
    : `BAHASA: ${bahasa}`;

  const fotoMap = {
    'ya-formal':       'FOTO: Sertakan placeholder/instruksi foto formal (jas/blazer, latar polos putih/abu) di header CV.',
    'ya-profesional':  'FOTO: Sertakan placeholder/instruksi foto profesional santai (smart casual, ekspresi ramah) di header CV.',
    'tidak':           'FOTO: Tanpa foto — jangan sediakan space untuk foto.',
    'ai-auto':         'FOTO: Rekomendasikan ada/tidak foto berdasarkan industri target (fintech/startup besar → biasanya tanpa foto; BUMN/PNS/perbankan → foto formal dianjurkan).',
  };
  const fotoInstr = fotoMap[foto] || fotoMap['ai-auto'];

  const kota    = dokGet('gen-kota') || getKota() || '';
  const sections = [`• Nama: ${nama}`, `• Profesi/Target: ${profesi}`];
  if (usia)       sections.push(`• Usia: ${usia} tahun`);
  if (gender)     sections.push(`• Jenis kelamin: ${gender}`);
  if (kontak)     sections.push(`• Kontak: ${kontak}`);
  if (portfolio)  sections.push(`• LinkedIn/Portfolio: ${portfolio}`);
  if (target)     sections.push(`• Target industri/perusahaan: ${target}`);
  if (ringkasan)  sections.push(`• Ringkasan (input user): ${ringkasan}`);
  if (pendidikan) sections.push(`• Pendidikan:\n${pendidikan}`);
  if (pengalaman) sections.push(`• Pengalaman kerja:\n${pengalaman}`);
  if (keahlian)   sections.push(`• Keahlian: ${keahlian}`);
  if (lainnya)    sections.push(`• Org/Penghargaan/Sertifikasi: ${lainnya}`);
  if (hobi)       sections.push(`• Hobi/Minat: ${hobi}`);
  if (catatan)    sections.push(`• Catatan khusus: ${catatan}`);
  if (kota)       sections.push(`• Kota / domisili: ${kota}`);

  const atsNote = target
    ? `ATS KEYWORDS: Identifikasi 5–8 kata kunci relevan untuk industri/posisi "${target}" dan pastikan kata kunci tersebut muncul secara natural di section PROFIL dan PENGALAMAN.`
    : `ATS KEYWORDS: Identifikasi kata kunci relevan berdasarkan profesi "${profesi}" dan pastikan muncul di PROFIL dan PENGALAMAN.`;

  const portfolioNote = portfolio
    ? `Di HEADER, tampilkan link "${portfolio}" setelah kontak.`
    : '';

  return `Kamu adalah career coach dan HR professional spesialis CV Indonesia. Bantu ${nama} membuat CV terbaik mereka:

═══════════════════════════════════════════════════════
DATA KANDIDAT
═══════════════════════════════════════════════════════
${sections.join('\n')}

${formatInstr}
${bahasaInstr}
${fotoInstr}

═══════════════════════════════════════════════════════
ALUR KERJA
═══════════════════════════════════════════════════════

[TAHAP 1 — AUDIT PROFIL & STRATEGI]
Evaluasi cepat (maks. 4 baris):
✓ Kekuatan profil yang layak ditonjolkan
⚠ Gap atau data penting yang kosong (beri placeholder [isi])
💡 Angle terbaik: sudut pandang apa yang paling menjual kandidat ini ke target tersebut
📌 Format & bahasa yang dipilih + alasan 1 kalimat

Langsung ke Tahap 2 — tanya hanya jika ada 1 hal kritis yang tidak bisa ditebak.

[TAHAP 2 — BUAT CV LENGKAP]
Susun section berikut (urutan sesuai format):

① HEADER: Nama (prominent) · profesi/target posisi · kontak lengkap${portfolio ? ' · link portfolio/LinkedIn' : ''} · ${foto === 'tidak' ? 'tanpa foto' : 'placeholder foto sesuai instruksi di atas'}

② PROFIL (3 kalimat, bukan paragraf generik):
   — Kalimat 1 (hook): identitas profesional + angka/fakta paling kuat (tahun pengalaman / IPK / pencapaian utama)
   — Kalimat 2 (value prop): apa yang bisa kamu bawa ke perusahaan — konkret, bukan sifat abstrak
   — Kalimat 3 (intent): arah karir / mengapa tertarik ke industri/posisi ini

③ PENGALAMAN KERJA: Setiap posisi → nama perusahaan, jabatan, periode · 2–4 bullet point per posisi dengan pola: [Action verb kuat] + [objek/scope] + [hasil terukur jika ada]. Jangan pakai "bertanggung jawab untuk" atau "membantu".

④ PENDIDIKAN: Institusi · jurusan · tahun · IPK (jika > 3.0 atau fresh grad) · prestasi akademik relevan

⑤ KEAHLIAN: Kategorikan menjadi Technical Skills dan Soft Skills · sebutkan level (dasar/menengah/mahir) untuk skill teknis

⑥ ORGANISASI / SERTIFIKASI / PENGHARGAAN (jika ada): Singkat, relevan, dengan dampak nyata

${hobi ? `⑦ HOBI/MINAT: Tuliskan "${hobi}" — pilih 2–3 yang relevan ke industri target sebagai pembuktian kultur fit` : ''}

${atsNote}
${portfolioNote}

ATURAN GLOBAL: Max 1 halaman A4 (400–550 kata) kecuali format senior/akademis · jangan mengarang fakta · tulis [isi] untuk data yang tidak diberikan · percaya diri, bukan berlebihan

${promptFlowFooter([
    'Tajamkan section PROFIL — buat hook kalimat pertama lebih kuat dan spesifik',
    'Perkuat bullet PENGALAMAN — tambahkan angka/hasil konkret di tiap poin',
    `Optimalkan ATS — sesuaikan kata kunci lebih pas ke industri${target ? ' "' + target + '"' : ' target'}`,
  ], 'cv')}`;
}

/* ════════════════════════════════════
   IZIN / CUTI — render + build
════════════════════════════════════ */
function renderOpsiIzin() {
  return `<div class="dok-form">
    <div class="dok-section-label">✦ Info Dokumen</div>
    <div class="opt-group">
      <div class="opt-label">Kota / Tempat Pembuatan <span class="kota-note">(tersimpan otomatis)</span></div>
      <input class="opt-input" id="gen-kota" type="text" placeholder="cth: Jakarta, Bandung, Surabaya" value="${getKota()}" oninput="saveKota(this.value)">
    </div>
    <div class="dok-section-label">✦ Data Wajib</div>
    <div class="opt-group">
      <div class="opt-label">Nama Lengkap <span class="req-star">*</span></div>
      <input class="opt-input" id="izin-nama" type="text" placeholder="cth: Budi Santoso" oninput="checkReadyDok()">
    </div>
    <div class="opt-group">
      <div class="opt-label">Jenis Izin <span class="req-star">*</span></div>
      <select class="opt-select" id="izin-tujuan" onchange="checkReadyDok()">
        <option value="">— Pilih jenis izin —</option>
        <optgroup label="Izin Kerja">
          <option value="izin tidak masuk kerja karena sakit">Sakit</option>
          <option value="izin tidak masuk kerja karena ada keperluan keluarga mendesak">Keperluan Keluarga Mendesak</option>
          <option value="izin tidak masuk kerja karena menghadiri acara keluarga (pernikahan/duka)">Acara Keluarga (Pernikahan/Duka)</option>
          <option value="cuti tahunan">Cuti Tahunan</option>
          <option value="cuti melahirkan / cuti istri melahirkan">Cuti Melahirkan</option>
          <option value="izin terlambat masuk kerja">Izin Terlambat</option>
        </optgroup>
        <optgroup label="Izin Sekolah">
          <option value="izin tidak hadir ke sekolah karena sakit">Izin Sekolah — Sakit</option>
          <option value="izin tidak hadir ke sekolah karena keperluan keluarga">Izin Sekolah — Keperluan Keluarga</option>
          <option value="izin tidak hadir ke sekolah karena mengikuti perlombaan atau kegiatan resmi luar sekolah">Izin Sekolah — Perlombaan / Kegiatan Resmi</option>
        </optgroup>
      </select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Tanggal Izin <span class="req-star">*</span></div>
      <input class="opt-input" id="izin-tanggal" type="text" placeholder="cth: Senin 5 Agustus 2025, atau 5–7 Agustus 2025" oninput="checkReadyDok()">
    </div>
    <div class="dok-section-label">✦ Data Tambahan (Opsional)</div>
    <div class="opt-group">
      <div class="opt-label">Ditujukan Kepada</div>
      <input class="opt-input" id="izin-kepada" type="text" placeholder="cth: Bapak HRD PT. Maju Bersama, Ibu Wali Kelas 9A SMP Negeri 5">
    </div>
    <div class="opt-group">
      <div class="opt-label">Alasan / Keterangan Tambahan</div>
      <input class="opt-input" id="izin-alasan" type="text" placeholder="cth: demam dan batuk sejak kemarin, saudara kandung menikah di luar kota">
    </div>
    <div class="opt-group">
      <div class="opt-label">Hubungan Pengirim (jika mewakili)</div>
      <input class="opt-input" id="izin-hubungan" type="text" placeholder="cth: orang tua dari [nama anak], dibuat sendiri oleh yang bersangkutan">
    </div>
    <div class="opt-group">
      <div class="opt-label">Catatan Khusus</div>
      <textarea class="opt-textarea" id="izin-catatan" rows="2" placeholder="cth: akan melampirkan surat dokter, mohon pekerjaan bisa didelegasikan ke rekan"></textarea>
    </div>
  </div>`;
}

function buildPromptIzin() {
  const nama     = dokGet('izin-nama');
  const tujuan   = dokGet('izin-tujuan');
  const tanggal  = dokGet('izin-tanggal');
  const kepada   = dokGet('izin-kepada');
  const alasan   = dokGet('izin-alasan');
  const hubungan = dokGet('izin-hubungan');
  const catatan  = dokGet('izin-catatan');

  const kota      = dokGet('gen-kota') || getKota() || '';
  const tglHariIni = getTanggalHariIni();
  const lines = [
    `• Nama: ${nama}`,
    `• Jenis izin: ${tujuan}`,
    `• Tanggal izin: ${tanggal}`,
  ];
  if (kepada)   lines.push(`• Ditujukan kepada: ${kepada}`);
  if (alasan)   lines.push(`• Alasan / keterangan: ${alasan}`);
  if (hubungan) lines.push(`• Pengirim surat: ${hubungan}`);
  if (catatan)  lines.push(`• Catatan: ${catatan}`);
  lines.push(`• Tanggal pembuatan surat: ${tglHariIni}`);
  if (kota)     lines.push(`• Kota / tempat pembuatan: ${kota}`);

  return `Kamu adalah penulis surat resmi Indonesia. Bantu buat Surat Izin / Cuti berdasarkan data berikut melalui alur ini:

═══════════════════════════════════════════════════════
DATA
═══════════════════════════════════════════════════════
${lines.join('\n')}

BAHASA: Bahasa Indonesia formal dan sopan.

═══════════════════════════════════════════════════════
ALUR KERJA
═══════════════════════════════════════════════════════

[TAHAP 1 — CEK DATA]
Data sudah lengkap? → Langsung tulis. Ada 1 hal kritis yang tidak bisa ditebak? → Tanya sekali saja.

[TAHAP 2 — TULIS SURAT IZIN]
Tulis surat izin yang singkat, jelas, dan sopan. Sertakan: salam pembuka, maksud surat, alasan, tanggal yang dimohonkan, permohonan maaf dan penyesalan atas ketidakhadiran, dan salam penutup. Jaga nada hormat namun tidak berlebihan.
Panjang: 100–180 kata.

${promptFlowFooter([
    'Tambahkan kalimat yang lebih memperkuat alasan atau urgensi',
    'Sesuaikan nada — lebih formal untuk kantor perusahaan besar, lebih hangat untuk sekolah/toko kecil',
    'Tambahkan kalimat tentang siapa yang akan menggantikan tugas selama absen',
  ], 'surat')}`;
}

/* ════════════════════════════════════
   NAVIGATION
════════════════════════════════════ */
function setModDok(key) {
  currentModDok = key;
  generatedPrompt = '';
  document.querySelectorAll('.mod-card-dok').forEach(c => c.classList.remove('active'));
  document.getElementById('moddok-' + key)?.classList.add('active');

  const groupId = MOD_GROUPS_DOK[key];
  if (groupId) {
    const items = document.getElementById('group-dok-' + groupId);
    if (items && (items.style.maxHeight === '0px' || items.style.maxHeight === '')) {
      toggleGroupDok(groupId);
    }
    setTimeout(() => {
      document.getElementById('moddok-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 380);
  }

  document.getElementById('welcome-dok').style.display = 'none';
  document.getElementById('workspace').classList.add('show');
  renderWorkspaceDok(MODS_DOK[key]);
  closeDrawer();
  document.querySelector('.main')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function goWelcomeDok() {
  document.getElementById('workspace').classList.remove('show');
  document.getElementById('welcome-dok').style.display = '';
  currentModDok = null;
  generatedPrompt = '';
  document.querySelectorAll('.mod-card-dok').forEach(c => c.classList.remove('active'));
}

function toggleGroupDok(id) {
  const label = document.querySelector(`.mod-group-label-dok[data-group="${id}"]`);
  const items = document.getElementById('group-dok-' + id);
  if (!label || !items) return;
  const isExpanded = items.style.maxHeight !== '0px' && items.style.maxHeight !== '';
  label.classList.toggle('collapsed', isExpanded);
  if (isExpanded) {
    items.style.overflow = 'hidden';
    items.style.maxHeight = items.scrollHeight + 'px';
    requestAnimationFrame(() => { items.style.maxHeight = '0px'; items.style.opacity = '0'; });
  } else {
    items.style.overflow = 'hidden';
    items.style.maxHeight = items.scrollHeight + 'px';
    items.style.opacity = '1';
    setTimeout(() => {
      if (items.style.maxHeight !== '0px') { items.style.maxHeight = 'none'; items.style.overflow = 'visible'; }
    }, 350);
  }
}

function initGroupsDok() {
  document.querySelectorAll('[id^="group-dok-"]').forEach(el => {
    el.style.maxHeight = '0px'; el.style.opacity = '0';
  });
  document.querySelectorAll('.mod-group-label-dok').forEach(l => l.classList.add('collapsed'));
}

/* ════════════════════════════════════
   WORKSPACE RENDER
════════════════════════════════════ */
function renderWorkspaceDok(mod) {
  const body = document.getElementById('ws-body');
  const optsHtml = mod.options ? mod.options() : '';
  body.innerHTML = `
  <div class="ws-cols">
    <div class="ws-col-left">
      <div class="ws-header ws-header--dokumen" id="ws-header">
        <div class="ws-header-row1">
          <button class="btn-back-welcome" onclick="goWelcomeDok()">← Beranda</button>
          <div class="ws-header-label">${mod.label}</div>
        </div>
        <div class="ws-header-title">${mod.icon} ${mod.title}</div>
        <div class="ws-header-desc">${mod.desc}</div>
      </div>
      <div class="ws-steps" id="ws-steps">
        <span class="ws-step ws-step--done">✓ Pilih</span>
        <span class="ws-step-sep">›</span>
        <span class="ws-step ws-step--active" id="wss-atur">Isi Form</span>
        <span class="ws-step-sep">›</span>
        <span class="ws-step" id="wss-gen">Generate</span>
        <span class="ws-step-sep">›</span>
        <span class="ws-step" id="wss-launch">Chat AI</span>
      </div>
      <div class="dok-flow-tip">
        <span class="dok-flow-icon">🔄</span>
        <span>AI akan <strong>analisis → tulis → revisi</strong> bersamamu. Ketik <strong>"finalize"</strong> untuk dokumen HTML siap cetak — langsung klik Print → Simpan PDF.</span>
      </div>
      ${optsHtml ? `<div class="section-card"><div class="section-head">Isi Data</div><div class="section-body">${optsHtml}</div></div>` : ''}
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <button class="btn-proses" onclick="generatePromptDok()" disabled>✨ Generate Prompt</button>
        <button class="btn-reset" onclick="resetWorkspaceDok()">Reset</button>
        <span class="action-hint" id="action-hint"></span>
      </div>
    </div>
    <div class="ws-col-right">
      <div class="section-card" id="prompt-output" style="display:none">
        <div class="section-head">✦ Prompt Siap — Paste ke AI</div>
        <div class="section-body">
          <div class="note-box" style="margin-bottom:10px;">
            <span class="note-icon">💡</span>
            <span>Klik <strong>Claude</strong> untuk hasil terbaik — prompt otomatis tersalin. Paste, biarkan AI menulis &amp; revisi bersamamu. Ketik <em>"finalize"</em> → AI generate dokumen HTML siap cetak, klik Print → Simpan PDF.</span>
          </div>
          <pre id="prompt-text" style="white-space:pre-wrap;font-size:11px;line-height:1.8;font-family:'DM Mono',monospace;background:var(--bg);border:1.5px solid var(--border);border-radius:8px;padding:12px 14px;overflow-y:visible;color:var(--text);"></pre>
        </div>
      </div>
      <div class="result-actions-sticky" id="result-actions-wrap" style="display:none">
        <div class="result-actions" id="result-actions-inner">
          <!-- platform buttons injected by refreshDokPlatformButtons() -->
          <button class="btn-retry btn-copy-prompt" onclick="copyPrompt()">📋 Salin Prompt</button>
          <button class="btn-whatsapp" onclick="shareToWhatsApp()">📲 WA</button>
          <button class="btn-download-prompt" onclick="downloadPrompt()">💾 Simpan</button>
        </div>
      </div>
      <div id="history-panel"></div>
    </div>
  </div>`;
  body.onchange = () => checkReadyDok();
  body.oninput  = () => checkReadyDok();
  checkReadyDok();
}

function resetWorkspaceDok() {
  generatedPrompt = '';
  if (currentModDok) setModDok(currentModDok);
}

/* ════════════════════════════════════
   PLATFORM BUTTONS — DINAMIS PER TIPE
════════════════════════════════════ */
const MOD_UNDANGAN = ['undangan_nikah','undangan_khitanan','undangan_aqiqah','undangan_ultah'];

function refreshDokPlatformButtons() {
  const ra = document.getElementById('result-actions-inner');
  if (!ra) return;
  ra.querySelectorAll('.btn-plat-dyn').forEach(b => b.remove());

  const isDesain = MOD_UNDANGAN.includes(currentModDok);
  const ref = ra.querySelector('.btn-copy-prompt');

  function mkBtn(html, bg, onclick, extraClass) {
    const b = document.createElement('button');
    b.className = 'btn-download btn-plat-dyn' + (extraClass ? ' ' + extraClass : '');
    b.style.background = bg;
    b.innerHTML = html;
    b.onclick = onclick;
    ra.insertBefore(b, ref);
    return b;
  }

  if (isDesain) {
    mkBtn('💬 ChatGPT <span class="btn-rec-badge">⭐ Gambar</span>', 'var(--text)', () => launchPlatform('chatgpt'));
    mkBtn('✨ Gemini <span class="btn-rec-badge" style="background:rgba(255,255,255,0.2)">🖼 Gambar</span>', '#1a73e8', () => launchPlatform('gemini'));
  } else {
    mkBtn('🤖 Claude <span class="btn-rec-badge">⭐ DOCX/PDF</span>', '', () => launchPlatform('claude'), 'btn-claude-rec');
    mkBtn('💬 ChatGPT <span class="btn-rec-badge" style="background:rgba(255,255,255,0.2)">🖼 Gambar</span>', 'var(--text)', () => launchPlatform('chatgpt'));
    mkBtn('✨ Gemini <span class="btn-rec-badge" style="background:rgba(255,255,255,0.2)">🖼 Gambar</span>', '#1a73e8', () => launchPlatform('gemini'));
  }
}

/* ════════════════════════════════════
   GENERATE PROMPT DOKUMEN
════════════════════════════════════ */
function generatePromptDok() {
  if (!currentModDok) { showToast('Pilih jenis dokumen terlebih dahulu.', 'error'); return; }
  const builtPrompt = MODS_DOK[currentModDok].prompt();
  if (!builtPrompt) { showToast('Lengkapi semua data terlebih dahulu.', 'error'); return; }
  const btn = document.querySelector('.btn-proses');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Menyusun...'; }
  showLoadingBar(() => {
    generatedPrompt = builtPrompt;
    if (btn) { btn.disabled = false; btn.innerHTML = '✨ Generate Prompt'; }
    const outputPanel = document.getElementById('prompt-output');
    const promptText  = document.getElementById('prompt-text');
    if (outputPanel && promptText) {
      promptText.textContent = generatedPrompt;
      outputPanel.style.display = '';
      document.getElementById('result-actions-wrap').style.display = '';
    }
    document.getElementById('wss-atur')?.classList.remove('ws-step--active');
    document.getElementById('wss-atur')?.classList.add('ws-step--done');
    document.getElementById('wss-gen')?.classList.add('ws-step--done');
    document.getElementById('wss-launch')?.classList.add('ws-step--active');
    refreshDokPlatformButtons();
    // Dual-copy buttons untuk semua modul undangan
    if (MOD_UNDANGAN.includes(currentModDok)) {
      const resultActions = document.getElementById('result-actions-inner');
      if (resultActions) {
        resultActions.querySelectorAll('.btn-dual-depan,.btn-dual-belakang').forEach(b => b.remove());
        const b1 = document.createElement('button');
        b1.className = 'btn-retry btn-dual-depan';
        b1.innerHTML = '📋 Salin Halaman Depan';
        b1.title = 'Salin prompt cover / halaman depan — lampirkan foto bersama prompt';
        b1.onclick = () => {
          const [d] = generatedPrompt.split('\n\n[COPY SEPARATOR]\n\n');
          navigator.clipboard.writeText(d || generatedPrompt)
            .then(() => showToast('Prompt halaman depan tersalin! Lampirkan 1 foto ke ChatGPT/Gemini.', 'success'));
        };
        const b2 = document.createElement('button');
        b2.className = 'btn-retry btn-dual-belakang';
        b2.innerHTML = '📋 Salin Halaman Belakang';
        b2.title = 'Salin prompt halaman detail / belakang';
        b2.onclick = () => {
          const parts = generatedPrompt.split('\n\n[COPY SEPARATOR]\n\n');
          navigator.clipboard.writeText(parts[1] || generatedPrompt)
            .then(() => showToast('Prompt halaman belakang tersalin!', 'success'));
        };
        resultActions.appendChild(b1);
        resultActions.appendChild(b2);
      }
      showToast('2 prompt siap! Lampirkan 1 foto → Salin Depan/Belakang → ChatGPT atau Gemini.', 'success');
    } else {
      showToast('Prompt siap! Buka Claude untuk DOCX/PDF — atau ChatGPT/Gemini untuk output gambar.', 'success');
    }
    saveToHistory(currentModDok, MODS_DOK[currentModDok].title, generatedPrompt);
    renderHistoryPanel();
    renderRevisiActions();
  }, ['Membaca data...', 'Merancang alur AI...', 'Menyusun instruksi...', 'Finalisasi prompt...']);
}

/* ════════════════════════════════════
   FILTER & INIT
════════════════════════════════════ */
function filterModsDok(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.mod-card-dok').forEach(card => {
    const name = card.querySelector('.mod-name')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('.mod-desc')?.textContent.toLowerCase() || '';
    card.style.display = (!q || name.includes(q) || desc.includes(q)) ? '' : 'none';
  });
}

function initGroupsForMode(mode) {
  if (mode === 'foto') { if (typeof initGroups === 'function') initGroups(); }
  else { initGroupsDok(); }
}

function initDok() {
  document.querySelectorAll('.mod-card-dok .mod-info-btn').forEach(btn => {
    const match = btn.getAttribute('onclick')?.match(/'([^']+)'/);
    if (!match) return;
    const key = match[1];
    btn.addEventListener('mouseenter', e => showModInfoDok(e, key));
    btn.addEventListener('mouseleave', () => document.getElementById('mod-tooltip')?.classList.remove('show'));
  });
  initGroupsDok();
}

function showModInfoDok(e, key) {
  e.stopPropagation();
  if (e.type === 'click' && window.innerWidth > 768) return;
  const tip = document.getElementById('mod-tooltip');
  const info = MOD_INFO_DOK[key];
  if (!tip || !info) return;
  tip.innerHTML = `<div class="tooltip-title">${info.title}</div><div class="tooltip-desc">${info.desc}</div>`;
  const rect = e.currentTarget.getBoundingClientRect();
  tip.style.top  = (rect.bottom + 8 + window.scrollY) + 'px';
  tip.style.left = Math.min(rect.left, window.innerWidth - 260) + 'px';
  tip.classList.add('show');
}

function initDokPanel() { initDok(); }

/* ════════════════════════════════════
   UNDANGAN & DESAIN — Shared Helpers
════════════════════════════════════ */
const TEMPLATE_UNDANGAN_DESC = {
  'islami-tradisional': 'Islamic traditional style: intricate arabesque geometric patterns, Islamic calligraphy ornamental accents, deep emerald green and navy blue with gold accents, ornate geometric border frames, elegant serif and Arabic-inspired decorative typography',
  'batik-jawa':         'Javanese batik traditional style: authentic batik parang or kawung motifs as texture, warm earth tones (cream, dark brown, forest green) with gold accent lines, traditional Javanese ornamental frames, dignified classical Indonesian cultural aesthetic',
  'floral-garden':      'Romantic floral garden style: hand-painted watercolor flowers (roses, peonies, eucalyptus leaves, baby breath), soft pastel color palette (blush pink, sage green, ivory white), delicate botanical border illustrations, light airy romantic composition with elegant script and serif typography',
  'minimalist-modern':  'Clean minimalist modern style: simple thin geometric line ornaments, maximum two-color palette (suggest: white + deep navy, or blush + champagne, or sage + ivory), modern clean sans-serif typography mixed with elegant thin-line decorative accents, generous white space, contemporary sophisticated look',
  'vintage-romantis':   'Vintage romantic style: aged watercolor paper texture, dusty rose and warm sepia tones, vintage pressed botanical flower illustrations, classic ornate serif typography, delicate lace-like border details, nostalgic warm charm with romantic atmosphere',
  'royal-elegan':       'Royal luxury style: deep burgundy or rich navy background with metallic gold foil effect ornamental flourishes and ornate border frames, opulent baroque or damask pattern accents, formal serif typography in gold, ultra-luxurious prestigious aesthetic suitable for formal weddings',
  'tropical-segar':     'Fresh tropical style: lush tropical botanical leaves (monstera deliciosa, palm fronds, birds of paradise flower), vibrant emerald green with coral, turquoise, or golden yellow accents, natural organic feel with tropical botanical frame border, energetic fresh aesthetic suitable for outdoor garden or beach venue',
};

const TEMPLATE_UNDANGAN_OPTS = [
  { value:'islami-tradisional', label:'🕌 Islami Tradisional — arabesque, emas, navy/hijau' },
  { value:'batik-jawa',         label:'🎎 Batik Jawa Klasik — earth tones, motif parang/kawung' },
  { value:'floral-garden',      label:'🌸 Floral Garden — bunga cat air, pastel lembut' },
  { value:'minimalist-modern',  label:'◻ Minimalist Modern — clean, geometric, 2 warna' },
  { value:'vintage-romantis',   label:'🎞 Vintage Romantis — watercolor, dusty rose' },
  { value:'royal-elegan',       label:'👑 Royal Elegan — burgundy/navy, gold foil mewah' },
  { value:'tropical-segar',     label:'🌿 Tropical Segar — monstera, emerald, fresh' },
  { value:'custom',             label:'✏️ Custom — ketik deskripsi sendiri' },
];

function renderOpsiTemplate(prefix) {
  const opts = TEMPLATE_UNDANGAN_OPTS
    .map(t => `<option value="${t.value}">${t.label}</option>`).join('');
  return `
  <div class="dok-section-label">✦ Gaya Desain</div>
  <div class="opt-group">
    <div class="opt-label">Template Desain <span class="req-star">*</span></div>
    <select class="opt-select" id="${prefix}-template" onchange="renderTemplateCustom('${prefix}')">
      <option value="">— Pilih template —</option>
      ${opts}
    </select>
  </div>
  <div id="${prefix}-template-custom"></div>
  <div class="opt-group">
    <div class="opt-label">Warna Dominan (opsional)</div>
    <input class="opt-input" id="${prefix}-warna" type="text" placeholder="cth: emas &amp; navy, hijau sage &amp; putih, dusty rose &amp; champagne">
  </div>
  <div class="opt-group">
    <div class="opt-label">Ukuran Undangan</div>
    <select class="opt-select" id="${prefix}-ukuran">
      <option value="A5 portrait (148 × 210 mm)">A5 Portrait — paling umum (148×210mm)</option>
      <option value="A5 landscape (210 × 148 mm)">A5 Landscape (210×148mm)</option>
      <option value="A6 portrait (105 × 148 mm)">A6 Portrait — lebih kecil (105×148mm)</option>
      <option value="square 148 × 148 mm">Square / Kotak (148×148mm)</option>
    </select>
  </div>`;
}

function renderTemplateCustom(prefix) {
  const val = document.getElementById(prefix + '-template')?.value;
  const container = document.getElementById(prefix + '-template-custom');
  if (!container) return;
  container.innerHTML = val === 'custom'
    ? `<div class="opt-group">
        <div class="opt-label">Deskripsi Desain Kustom <span class="req-star">*</span></div>
        <textarea class="opt-textarea" id="${prefix}-custom-desc" rows="3" placeholder="Contoh: desain modern bunga mawar putih dan emas, font elegan kursif, background krem lembut, kesan mewah tapi simpel..." oninput="checkReadyDok()"></textarea>
      </div>`
    : '';
  checkReadyDok();
}

function getTemplateDesc(prefix) {
  const val = dokGet(prefix + '-template');
  if (val === 'custom') return dokGet(prefix + '-custom-desc') || 'elegant and beautiful custom design';
  return TEMPLATE_UNDANGAN_DESC[val] || 'elegant, beautiful, and professional invitation design';
}

/* ════════════════════════════════════
   UNDANGAN NIKAH
════════════════════════════════════ */
function renderOpsiUndanganNikah() {
  return `<div class="dok-form">
  ${renderOpsiTemplate('un')}

  <div class="dok-section-label">✦ Mempelai Pria</div>
  <div class="opt-group">
    <div class="opt-label">Nama Lengkap Mempelai Pria <span class="req-star">*</span></div>
    <input class="opt-input" id="un-pria-nama" type="text" placeholder="cth: Ahmad Rizki Pratama, S.T." oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Panggilan Pria <span style="font-size:10px;color:var(--text-3)">(tampil besar di cover)</span></div>
    <input class="opt-input" id="un-pria-panggilan" type="text" placeholder="cth: Rizki">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Bapak Mempelai Pria</div>
    <input class="opt-input" id="un-pria-bapak" type="text" placeholder="cth: Drs. H. Suharto">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Ibu Mempelai Pria</div>
    <input class="opt-input" id="un-pria-ibu" type="text" placeholder="cth: Hj. Sri Wahyuni">
  </div>

  <div class="dok-section-label">✦ Mempelai Wanita</div>
  <div class="opt-group">
    <div class="opt-label">Nama Lengkap Mempelai Wanita <span class="req-star">*</span></div>
    <input class="opt-input" id="un-wanita-nama" type="text" placeholder="cth: Siti Rahma Dewi, S.Pd." oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Panggilan Wanita <span style="font-size:10px;color:var(--text-3)">(tampil besar di cover)</span></div>
    <input class="opt-input" id="un-wanita-panggilan" type="text" placeholder="cth: Rahma">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Bapak Mempelai Wanita</div>
    <input class="opt-input" id="un-wanita-bapak" type="text" placeholder="cth: H. Budi Santoso">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Ibu Mempelai Wanita</div>
    <input class="opt-input" id="un-wanita-ibu" type="text" placeholder="cth: Hj. Siti Aminah">
  </div>

  <div class="dok-section-label">✦ Akad Nikah</div>
  <div class="opt-group">
    <div class="opt-label">Tanggal Akad <span class="req-star">*</span></div>
    <input class="opt-input" id="un-akad-tanggal" type="text" placeholder="cth: Sabtu, 14 Juni 2025" oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Waktu Akad</div>
    <input class="opt-input" id="un-akad-waktu" type="text" placeholder="cth: 08.00 WIB — selesai">
  </div>
  <div class="opt-group">
    <div class="opt-label">Tempat Akad <span class="req-star">*</span></div>
    <input class="opt-input" id="un-akad-tempat" type="text" placeholder="cth: Masjid Al-Ikhlas, Jl. Mawar No. 5, Jakarta Selatan" oninput="checkReadyDok()">
  </div>

  <div class="dok-section-label">✦ Resepsi / Walimah</div>
  <div class="opt-group">
    <div class="opt-label">Tanggal Resepsi <span style="font-size:10px;color:var(--text-3)">(kosongkan jika sama dengan akad)</span></div>
    <input class="opt-input" id="un-res-tanggal" type="text" placeholder="cth: Sabtu, 14 Juni 2025">
  </div>
  <div class="opt-group">
    <div class="opt-label">Waktu Resepsi</div>
    <input class="opt-input" id="un-res-waktu" type="text" placeholder="cth: 11.00–14.00 WIB">
  </div>
  <div class="opt-group">
    <div class="opt-label">Tempat Resepsi</div>
    <input class="opt-input" id="un-res-tempat" type="text" placeholder="cth: Gedung Serbaguna RW 05, Jl. Kenanga No. 10">
  </div>

  <div class="dok-section-label">✦ Detail Tambahan (Opsional)</div>
  <div class="opt-group">
    <div class="opt-label">Dress Code</div>
    <input class="opt-input" id="un-dresscode" type="text" placeholder="cth: Batik / Kebaya, Formal — hindari putih, Casual Elegant">
  </div>
  <div class="opt-group">
    <div class="opt-label">Hashtag Pernikahan</div>
    <input class="opt-input" id="un-hashtag" type="text" placeholder="cth: #RizkiRahma2025">
  </div>
  <div class="opt-group">
    <div class="opt-label">Catatan Tambahan</div>
    <textarea class="opt-textarea" id="un-catatan" rows="2" placeholder="cth: info RSVP, no amplop, konfirmasi kehadiran via WA..."></textarea>
  </div>
  <div class="note-box" style="border-color:#f59e0b;background:#fffbeb;">
    <span class="note-icon">📸</span>
    <span><strong>Siapkan 1 foto pasangan</strong> sebelum generate. Setelah salin prompt, lampirkan foto ke <strong>ChatGPT / Gemini</strong> — AI akan memasukkan foto ke desain undangan secara otomatis.</span>
  </div>
  <div class="note-box">
    <span class="note-icon">💡</span>
    <span>Generate menghasilkan <strong>2 prompt terpisah</strong> — cover halaman depan &amp; halaman detail belakang. Gunakan tombol <em>"Salin Halaman Depan"</em> / <em>"Salin Halaman Belakang"</em> yang muncul setelah generate.</span>
  </div>
  </div>`;
}

function buildPromptUndanganNikah() {
  const tmplDesc  = getTemplateDesc('un');
  const warna     = dokGet('un-warna');
  const ukuran    = dokGet('un-ukuran') || 'A5 portrait (148 × 210 mm)';
  const priaNama  = dokGet('un-pria-nama');
  const priaPanel = dokGet('un-pria-panggilan') || priaNama.split(' ')[0];
  const priaBapak = dokGet('un-pria-bapak');
  const priaIbu   = dokGet('un-pria-ibu');
  const wntNama   = dokGet('un-wanita-nama');
  const wntPanel  = dokGet('un-wanita-panggilan') || wntNama.split(' ')[0];
  const wntBapak  = dokGet('un-wanita-bapak');
  const wntIbu    = dokGet('un-wanita-ibu');
  const akadTgl   = dokGet('un-akad-tanggal');
  const akadWkt   = dokGet('un-akad-waktu');
  const akadTmp   = dokGet('un-akad-tempat');
  const resTgl    = dokGet('un-res-tanggal') || akadTgl;
  const resWkt    = dokGet('un-res-waktu');
  const resTmp    = dokGet('un-res-tempat');
  const dress     = dokGet('un-dresscode');
  const hashtag   = dokGet('un-hashtag');
  const catatan   = dokGet('un-catatan');
  const warnaLine = warna ? `\nColor palette preference: ${warna} (prioritize over template defaults)` : '';

  const pihakPria   = [priaBapak && 'Bapak ' + priaBapak, priaIbu && 'Ibu ' + priaIbu].filter(Boolean).join(' & ');
  const pihakWanita = [wntBapak && 'Bapak ' + wntBapak, wntIbu && 'Ibu ' + wntIbu].filter(Boolean).join(' & ');

  const depan = `You are a professional graphic designer. Create a WEDDING INVITATION FRONT COVER card design.

══════════════════════
DESIGN BRIEF — HALAMAN DEPAN (FRONT COVER)
══════════════════════

Art direction: ${tmplDesc}${warnaLine}
Card size: ${ukuran} — print-ready, 300 DPI equivalent

Content to place on this cover (keep it minimal & elegant):
▸ Main headline: "Undangan Pernikahan" or "The Wedding of" (choose language that fits the style)
▸ Couple names — MOST PROMINENT element: ${priaPanel} & ${wntPanel}
▸ Date: ${akadTgl}
▸ Optional short tagline or Bismillah/blessing (if fitting the template style)

Design rules:
1. The couple names must be the visual focal point — the largest, most decorated typographic element
2. Keep text minimal on this cover — NO addresses or full event details here
3. Apply the art direction throughout every element: background, ornaments, borders, typography
4. Maintain minimum 8mm print margins on all sides
5. A PHOTO of the couple is uploaded together with this prompt — place it prominently on the cover inside an elegant decorative frame fitting the template style
6. The result must feel like a premium, print-ready wedding invitation cover — fully rendered, no placeholder boxes`;

  const belakang = `You are a professional graphic designer. Create a WEDDING INVITATION BACK PAGE (detail page) design.

══════════════════════
DESIGN BRIEF — HALAMAN BELAKANG (DETAIL / BACK PAGE)
══════════════════════

Art direction: Same style as the front cover — ${tmplDesc.split(':')[0] || 'matching style'} — but with a LIGHTER background to ensure all text is clearly readable.${warnaLine}
Card size: ${ukuran} — print-ready, 300 DPI equivalent

ALL of the following content MUST appear clearly on this page:

${pihakPria ? `👨 Keluarga Mempelai Pria:\nPutra ${pihakPria}\n${priaNama}` : `👨 Mempelai Pria: ${priaNama}`}

${pihakWanita ? `👩 Keluarga Mempelai Wanita:\nPutri ${pihakWanita}\n${wntNama}` : `👩 Mempelai Wanita: ${wntNama}`}

📍 AKAD NIKAH
   Tanggal : ${akadTgl}${akadWkt ? '\n   Waktu   : ' + akadWkt : ''}
   Tempat  : ${akadTmp}
${resTmp || resWkt ? `
📍 RESEPSI / WALIMATUL URUSY
   Tanggal : ${resTgl}${resWkt ? '\n   Waktu   : ' + resWkt : ''}
   Tempat  : ${resTmp || '(menyusul)'}` : ''}
${dress   ? '\n👗 Dress Code : ' + dress   : ''}
${hashtag ? '\n# Hashtag     : ' + hashtag : ''}
${catatan ? '\nℹ️ Info tambahan: ' + catatan : ''}

Design elements to include:
▸ Closing blessing text (Bahasa Indonesia): "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan doa restu"
▸ Couple names in smaller decorative text: ${priaPanel} & ${wntPanel}
▸ A clearly labeled placeholder box/area for QR Code (label: "Lokasi / Maps") — place at bottom right corner

Design rules:
1. Text contrast is paramount — all text listed above must be clearly legible
2. Organize in clear visual hierarchy: family names → akad → resepsi → info tambahan
3. Apply decorative ornaments consistently with the front cover but more subtle — content first
4. Optionally reuse the couple's photo (smaller, as a subtle accent element) if it fits without compromising readability
5. DO NOT omit any information listed above
6. The result must be a complete, print-ready back page design — fully rendered`;

  return depan + '\n\n[COPY SEPARATOR]\n\n' + belakang;
}

/* ════════════════════════════════════
   UNDANGAN KHITANAN
════════════════════════════════════ */
function renderOpsiUndanganKhitanan() {
  return `<div class="dok-form">
  ${renderOpsiTemplate('unk')}

  <div class="dok-section-label">✦ Data Anak & Keluarga</div>
  <div class="opt-group">
    <div class="opt-label">Nama Anak <span class="req-star">*</span></div>
    <input class="opt-input" id="unk-nama-anak" type="text" placeholder="cth: Muhammad Farhan" oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Ayah</div>
    <input class="opt-input" id="unk-nama-ayah" type="text" placeholder="cth: Bapak Hendra Gunawan">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Ibu</div>
    <input class="opt-input" id="unk-nama-ibu" type="text" placeholder="cth: Ibu Sri Rahayu">
  </div>

  <div class="dok-section-label">✦ Detail Acara</div>
  <div class="opt-group">
    <div class="opt-label">Tanggal Acara <span class="req-star">*</span></div>
    <input class="opt-input" id="unk-tanggal" type="text" placeholder="cth: Ahad, 20 Juli 2025" oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Waktu</div>
    <input class="opt-input" id="unk-waktu" type="text" placeholder="cth: 09.00 WIB — selesai">
  </div>
  <div class="opt-group">
    <div class="opt-label">Tempat / Lokasi <span class="req-star">*</span></div>
    <input class="opt-input" id="unk-tempat" type="text" placeholder="cth: Kediaman keluarga, Jl. Melati No. 3, Yogyakarta" oninput="checkReadyDok()">
  </div>

  <div class="dok-section-label">✦ Detail Tambahan (Opsional)</div>
  <div class="opt-group">
    <div class="opt-label">Catatan / Info Tambahan</div>
    <textarea class="opt-textarea" id="unk-catatan" rows="2" placeholder="cth: sekaligus pengajian, doorprize, konfirmasi kehadiran..."></textarea>
  </div>
  <div class="note-box" style="border-color:#f59e0b;background:#fffbeb;">
    <span class="note-icon">📸</span>
    <span><strong>Siapkan 1 foto anak</strong> sebelum generate. Lampirkan foto bersama prompt ke <strong>ChatGPT / Gemini</strong> — AI akan memasukkan foto ke desain undangan.</span>
  </div>
  <div class="note-box">
    <span class="note-icon">💡</span>
    <span>Generate menghasilkan <strong>2 prompt terpisah</strong> — cover &amp; halaman detail. Gunakan tombol <em>"Salin Halaman Depan"</em> / <em>"Salin Halaman Belakang"</em> setelah generate.</span>
  </div>
  </div>`;
}

function buildPromptUndanganKhitanan() {
  const tmplDesc  = getTemplateDesc('unk');
  const warna     = dokGet('unk-warna');
  const ukuran    = dokGet('unk-ukuran') || 'A5 portrait (148 × 210 mm)';
  const namaAnak  = dokGet('unk-nama-anak');
  const namaAyah  = dokGet('unk-nama-ayah');
  const namaIbu   = dokGet('unk-nama-ibu');
  const tanggal   = dokGet('unk-tanggal');
  const waktu     = dokGet('unk-waktu');
  const tempat    = dokGet('unk-tempat');
  const catatan   = dokGet('unk-catatan');
  const warnaLine = warna ? `\nColor palette preference: ${warna}` : '';
  const keluarga  = [namaAyah, namaIbu].filter(Boolean).join(' & ');

  const depan = `You are a professional graphic designer. Create a KHITAN (circumcision) invitation FRONT COVER card design.

══════════════════════
DESIGN BRIEF — HALAMAN DEPAN (FRONT COVER)
══════════════════════

Art direction: ${tmplDesc}${warnaLine}
Card size: ${ukuran} — print-ready, 300 DPI equivalent

Content for this cover (keep it minimal & celebratory):
▸ Main headline: "Tasyakuran Khitanan" or "Walimatul Khitan"
▸ Opening: Bismillahirrahmanirrahim (Arabic calligraphy if Islamic template)
▸ Child's name — MOST PROMINENT: ${namaAnak}
▸ Date: ${tanggal}
▸ A PHOTO of the child is uploaded with this prompt — place it prominently inside a decorative frame

Design rules:
1. Keep text minimal — NO addresses or family detail lists here
2. Child's name and photo are the visual focal points
3. Apply the art direction consistently: background, ornaments, borders, typography
4. Warm, joyful, celebratory atmosphere — fitting for a child's milestone ceremony
5. Maintain 8mm print margins on all sides
6. Output: fully rendered, print-ready cover — no placeholder boxes`;

  const belakang = `You are a professional graphic designer. Create a KHITAN invitation BACK PAGE (detail page) design.

══════════════════════
DESIGN BRIEF — HALAMAN BELAKANG (DETAIL PAGE)
══════════════════════

Art direction: Same style as front cover — ${tmplDesc.split(':')[0] || 'matching style'} — lighter background for legibility.${warnaLine}
Card size: ${ukuran} — print-ready, 300 DPI equivalent

ALL content below MUST appear clearly:

👨‍👩‍👦 Keluarga${keluarga ? ': ' + keluarga : ''}
🌟 Nama Anak: ${namaAnak}

📍 DETAIL ACARA
   Tanggal : ${tanggal}
   Waktu   : ${waktu || 'Pukul ........... WIB'}
   Tempat  : ${tempat}
${catatan ? '\nℹ️ Info tambahan: ' + catatan : ''}

▸ Closing text: "Dengan segala kerendahan hati kami mengundang Bapak/Ibu/Saudara/i untuk hadir"
▸ QR code placeholder (label: "Lokasi / Maps") — bottom corner

Design rules:
1. All text above must be clearly legible — content-first
2. Decorative elements consistent with front cover but more subtle
3. Child's name in smaller decorative accent — not as dominant as on cover
4. Output: fully rendered, print-ready back page — no placeholder boxes`;

  return depan + '\n\n[COPY SEPARATOR]\n\n' + belakang;
}

/* ════════════════════════════════════
   UNDANGAN AQIQAH / SYUKURAN
════════════════════════════════════ */
function renderOpsiUndanganAqiqah() {
  return `<div class="dok-form">
  ${renderOpsiTemplate('unq')}

  <div class="opt-group">
    <div class="opt-label">Jenis Acara</div>
    <select class="opt-select" id="unq-jenis">
      <option value="Aqiqah">Aqiqah</option>
      <option value="Syukuran Kelahiran">Syukuran Kelahiran</option>
      <option value="Tasyakuran Aqiqah">Tasyakuran Aqiqah</option>
      <option value="Akikah & Pemberian Nama">Akikah &amp; Pemberian Nama</option>
    </select>
  </div>

  <div class="dok-section-label">✦ Data Bayi & Keluarga</div>
  <div class="opt-group">
    <div class="opt-label">Nama Bayi / Anak <span class="req-star">*</span></div>
    <input class="opt-input" id="unq-nama-bayi" type="text" placeholder="cth: Aisyah Putri Salsabila" oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Tanggal Lahir Bayi</div>
    <input class="opt-input" id="unq-tgl-lahir" type="text" placeholder="cth: Jumat, 6 Juni 2025">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Ayah</div>
    <input class="opt-input" id="unq-nama-ayah" type="text" placeholder="cth: Bapak Fauzi Rahman">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Ibu</div>
    <input class="opt-input" id="unq-nama-ibu" type="text" placeholder="cth: Ibu Nur Azizah">
  </div>

  <div class="dok-section-label">✦ Detail Acara</div>
  <div class="opt-group">
    <div class="opt-label">Tanggal Acara <span class="req-star">*</span></div>
    <input class="opt-input" id="unq-tanggal" type="text" placeholder="cth: Sabtu, 21 Juni 2025" oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Waktu</div>
    <input class="opt-input" id="unq-waktu" type="text" placeholder="cth: 09.00 WIB — selesai">
  </div>
  <div class="opt-group">
    <div class="opt-label">Tempat / Lokasi <span class="req-star">*</span></div>
    <input class="opt-input" id="unq-tempat" type="text" placeholder="cth: Kediaman keluarga, Jl. Dahlia No. 7, Bandung" oninput="checkReadyDok()">
  </div>

  <div class="dok-section-label">✦ Tambahan (Opsional)</div>
  <div class="opt-group">
    <div class="opt-label">Catatan / Info Tambahan</div>
    <textarea class="opt-textarea" id="unq-catatan" rows="2" placeholder="cth: sekaligus pengajian, pembacaan doa, doorprize..."></textarea>
  </div>
  <div class="note-box" style="border-color:#f59e0b;background:#fffbeb;">
    <span class="note-icon">📸</span>
    <span><strong>Siapkan 1 foto bayi / keluarga</strong> sebelum generate. Lampirkan foto bersama prompt ke <strong>ChatGPT / Gemini</strong> — AI akan memasukkan foto ke desain undangan.</span>
  </div>
  <div class="note-box">
    <span class="note-icon">💡</span>
    <span>Generate menghasilkan <strong>2 prompt terpisah</strong> — cover &amp; halaman detail. Gunakan tombol <em>"Salin Halaman Depan"</em> / <em>"Salin Halaman Belakang"</em> setelah generate.</span>
  </div>
  </div>`;
}

function buildPromptUndanganAqiqah() {
  const tmplDesc  = getTemplateDesc('unq');
  const warna     = dokGet('unq-warna');
  const ukuran    = dokGet('unq-ukuran') || 'A5 portrait (148 × 210 mm)';
  const jenis     = dokGet('unq-jenis') || 'Aqiqah';
  const namaBayi  = dokGet('unq-nama-bayi');
  const tglLahir  = dokGet('unq-tgl-lahir');
  const namaAyah  = dokGet('unq-nama-ayah');
  const namaIbu   = dokGet('unq-nama-ibu');
  const tanggal   = dokGet('unq-tanggal');
  const waktu     = dokGet('unq-waktu');
  const tempat    = dokGet('unq-tempat');
  const catatan   = dokGet('unq-catatan');
  const warnaLine = warna ? `\nColor palette preference: ${warna}` : '';
  const keluarga  = [namaAyah, namaIbu].filter(Boolean).join(' & ');

  const depan = `You are a professional graphic designer. Create an ${jenis} invitation FRONT COVER card design.

══════════════════════
DESIGN BRIEF — HALAMAN DEPAN (FRONT COVER) — ${jenis.toUpperCase()}
══════════════════════

Art direction: ${tmplDesc}${warnaLine}
Card size: ${ukuran} — print-ready, 300 DPI equivalent

Content for this cover (minimal & beautiful):
▸ Main headline: "Undangan ${jenis}"
▸ Opening: Bismillahirrahmanirrahim (Arabic calligraphy if Islamic template)
▸ Baby's name — MOST PROMINENT & BEAUTIFULLY DECORATED: ${namaBayi}
${tglLahir ? '▸ Date of birth (small accent): ' + tglLahir : ''}
▸ A PHOTO of the baby / family is uploaded with this prompt — place it prominently inside a soft decorative frame

Design rules:
1. Keep text minimal — no event detail lists here
2. Baby's name and photo are the visual focal points
3. Warm, soft, and blessed atmosphere — celebrate new life
4. Apply art direction throughout: background, ornaments, typography
5. Output: fully rendered, print-ready cover — no placeholder boxes`;

  const belakang = `You are a professional graphic designer. Create an ${jenis} invitation BACK PAGE (detail page) design.

══════════════════════
DESIGN BRIEF — HALAMAN BELAKANG (DETAIL PAGE) — ${jenis.toUpperCase()}
══════════════════════

Art direction: Same style as front cover — ${tmplDesc.split(':')[0] || 'matching style'} — lighter background for legibility.${warnaLine}
Card size: ${ukuran} — print-ready, 300 DPI equivalent

ALL content below MUST appear clearly:

👶 Nama Bayi: ${namaBayi}
${tglLahir ? '📅 Lahir: ' + tglLahir : ''}
👨‍👩‍👧 Orang Tua${keluarga ? ': ' + keluarga : ''}

📍 DETAIL ACARA
   Tanggal : ${tanggal}
   Waktu   : ${waktu || 'Pukul ........... WIB'}
   Tempat  : ${tempat}
${catatan ? '\nℹ️ Info tambahan: ' + catatan : ''}

▸ Closing text: "Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara syukuran kami"
▸ QR code placeholder (label: "Lokasi / Maps") — bottom corner

Design rules:
1. All text above must be clearly legible — content-first
2. Decorative elements consistent with front cover but more subtle
3. Soft, warm color palette — new life celebration
4. Output: fully rendered, print-ready back page — no placeholder boxes`;

  return depan + '\n\n[COPY SEPARATOR]\n\n' + belakang;
}

/* ════════════════════════════════════
   UNDANGAN ULANG TAHUN
════════════════════════════════════ */
function renderOpsiUndanganUltah() {
  return `<div class="dok-form">
  <div class="opt-group">
    <div class="opt-label">Tema Pesta / Target Usia</div>
    <select class="opt-select" id="unu-tema-jenis" onchange="renderUltahTemaCustom()">
      <option value="">— Pilih tema —</option>
      <optgroup label="Anak-anak (0–12 tahun)">
        <option value="princess-pink">👸 Princess / Putri — pink, tiara, castle</option>
        <option value="superhero">🦸 Superhero — bold colors, action, Marvel/DC style</option>
        <option value="dinosaur">🦕 Dinosaurus — adventure, jungle green</option>
        <option value="unicorn">🦄 Unicorn — rainbow pastel, magical</option>
        <option value="space-galaxy">🚀 Luar Angkasa — galaxy, bintang, astronaut</option>
        <option value="under-the-sea">🐠 Bawah Laut — ocean, fish, coral reef</option>
        <option value="cars-wheels">🏎 Mobil / Otomotif — racing, bold primary colors</option>
      </optgroup>
      <optgroup label="Remaja & Dewasa">
        <option value="sweet-seventeen">🌸 Sweet 17 — elegant, floral, romantic pastel</option>
        <option value="tropical-party">🌴 Tropical Party — vibrant, beach, summer vibes</option>
        <option value="elegant-adult">✨ Elegan Dewasa — sophisticated, minimalist, formal</option>
        <option value="retro-vintage">📻 Retro / Vintage — 70s–90s aesthetic, warm tones</option>
        <option value="garden-party">🌿 Garden Party — botanical, fresh, outdoor aesthetic</option>
        <option value="black-gold">🖤 Black &amp; Gold — luxurious, dramatic, glamorous</option>
      </optgroup>
      <option value="custom-tema">✏️ Tema Custom — ketik sendiri</option>
    </select>
  </div>
  <div id="unu-tema-custom-wrap"></div>

  ${renderOpsiTemplate('unu')}

  <div class="dok-section-label">✦ Data Acara</div>
  <div class="opt-group">
    <div class="opt-label">Nama yang Berulang Tahun <span class="req-star">*</span></div>
    <input class="opt-input" id="unu-nama" type="text" placeholder="cth: Bintang Cahaya / Muhammad Rafi" oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Ulang Tahun ke- / Usia</div>
    <input class="opt-input" id="unu-usia" type="text" placeholder="cth: 7, 17, 25, 30">
  </div>
  <div class="opt-group">
    <div class="opt-label">Tanggal Acara <span class="req-star">*</span></div>
    <input class="opt-input" id="unu-tanggal" type="text" placeholder="cth: Minggu, 13 Juli 2025" oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Waktu</div>
    <input class="opt-input" id="unu-waktu" type="text" placeholder="cth: 15.00–18.00 WIB">
  </div>
  <div class="opt-group">
    <div class="opt-label">Tempat / Lokasi <span class="req-star">*</span></div>
    <input class="opt-input" id="unu-tempat" type="text" placeholder="cth: Rumah keluarga / Aula Serbaguna, Jl. Flamboyan No. 8" oninput="checkReadyDok()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Dress Code / Tema Pakaian (opsional)</div>
    <input class="opt-input" id="unu-dresscode" type="text" placeholder="cth: Pink & White, Casual, Hawaiian, Formal">
  </div>
  <div class="opt-group">
    <div class="opt-label">Catatan Tambahan (opsional)</div>
    <textarea class="opt-textarea" id="unu-catatan" rows="2" placeholder="cth: RSVP before, ada games & doorprize, bawa kado..."></textarea>
  </div>
  <div class="note-box" style="border-color:#f59e0b;background:#fffbeb;">
    <span class="note-icon">📸</span>
    <span><strong>Siapkan 1 foto</strong> yang berulang tahun sebelum generate. Lampirkan foto bersama prompt ke <strong>ChatGPT / Gemini</strong> — AI akan memasukkan foto ke desain undangan.</span>
  </div>
  <div class="note-box">
    <span class="note-icon">💡</span>
    <span>Generate menghasilkan <strong>2 prompt terpisah</strong> — cover &amp; halaman detail. Gunakan tombol <em>"Salin Halaman Depan"</em> / <em>"Salin Halaman Belakang"</em> setelah generate.</span>
  </div>
  </div>`;
}

function renderUltahTemaCustom() {
  const val = document.getElementById('unu-tema-jenis')?.value;
  const wrap = document.getElementById('unu-tema-custom-wrap');
  if (!wrap) return;
  wrap.innerHTML = val === 'custom-tema'
    ? `<div class="opt-group">
        <div class="opt-label">Deskripsi Tema <span class="req-star">*</span></div>
        <input class="opt-input" id="unu-custom-tema" type="text" placeholder="cth: tema K-pop, Harry Potter, One Piece, Bollywood...">
      </div>`
    : '';
}

const ULTAH_TEMA_DESC = {
  'princess-pink':   'Princess birthday party theme: pastel pink and lavender, tiara/crown motifs, fairy tale castle silhouettes, sparkle and glitter accents, elegant script typography, magical and dreamy atmosphere',
  'superhero':       'Superhero birthday theme: bold primary colors (red, blue, yellow), comic book style elements, action burst effects, strong typography, exciting and energetic atmosphere',
  'dinosaur':        'Dinosaur birthday theme: jungle green and earthy tones, cute cartoon dinosaur illustrations, tropical foliage, adventurous and playful atmosphere',
  'unicorn':         'Unicorn birthday theme: rainbow pastel gradient, unicorn horn and stars, magical sparkles and clouds, whimsical and colorful atmosphere',
  'space-galaxy':    'Space/galaxy birthday theme: deep navy and purple galaxy background, stars, planets, rocket and astronaut elements, futuristic glow effects',
  'under-the-sea':   'Under the sea birthday theme: ocean blue and teal, cute fish, coral reef, bubbles, sea shells, playful and colorful underwater atmosphere',
  'cars-wheels':     'Racing cars birthday theme: bold red and black, racing checkered flag, speed lines, trophy, energetic and exciting atmosphere',
  'sweet-seventeen': 'Sweet 17 birthday theme: romantic floral with roses and peonies, soft pink and gold, elegant script typography, feminine and sophisticated atmosphere',
  'tropical-party':  'Tropical party theme: vibrant tropical leaves, hibiscus flowers, bright coral and teal, summer beach atmosphere, fresh and energetic',
  'elegant-adult':   'Elegant adult birthday theme: minimalist sophisticated design, monochrome or deep navy with gold accents, clean serif typography, refined and classy',
  'retro-vintage':   'Retro vintage theme: warm amber and brown tones, vintage patterns, retro typography with halftone effects, nostalgic 70s-90s aesthetic',
  'garden-party':    'Garden party theme: soft botanical illustrations, sage green and blush pink, pressed flower aesthetics, outdoor nature atmosphere, fresh and elegant',
  'black-gold':      'Black and gold luxury theme: dramatic black background with metallic gold ornaments, glamorous and sophisticated, perfect for milestone birthdays',
};

function buildPromptUndanganUltah() {
  const temajenis = dokGet('unu-tema-jenis');
  const temaDesc  = temajenis === 'custom-tema'
    ? (dokGet('unu-custom-tema') || 'fun and festive birthday theme')
    : (ULTAH_TEMA_DESC[temajenis] || '');
  const tmplDesc  = getTemplateDesc('unu');
  const warna     = dokGet('unu-warna');
  const ukuran    = dokGet('unu-ukuran') || 'A5 portrait (148 × 210 mm)';
  const nama      = dokGet('unu-nama');
  const usia      = dokGet('unu-usia');
  const tanggal   = dokGet('unu-tanggal');
  const waktu     = dokGet('unu-waktu');
  const tempat    = dokGet('unu-tempat');
  const dress     = dokGet('unu-dresscode');
  const catatan   = dokGet('unu-catatan');
  const warnaLine = warna ? `\nColor palette preference: ${warna}` : '';

  const artDir = temaDesc
    ? `Party theme: ${temaDesc}\nDesign style: ${tmplDesc}`
    : `Art direction: ${tmplDesc}`;

  const depan = `You are a professional graphic designer. Create a BIRTHDAY PARTY invitation FRONT COVER design.

══════════════════════
DESIGN BRIEF — HALAMAN DEPAN (FRONT COVER) — UNDANGAN ULANG TAHUN
══════════════════════

${artDir}${warnaLine}
Card size: ${ukuran} — print-ready, 300 DPI equivalent

Content for this cover (visual-first, minimal text):
▸ Main headline: "Undangan Ulang Tahun" / "You're Invited!" / "Birthday Party" (choose style fitting the theme)
${usia ? `▸ Age milestone — BIG & PROMINENT: ${usia} Tahun` : ''}
▸ Birthday person's name — MOST PROMINENT: ${nama}
▸ Date: ${tanggal}
▸ A PHOTO of the birthday person is uploaded with this prompt — place it prominently inside a decorative frame matching the party theme

Design rules:
1. The party theme must be IMMEDIATELY evident — every visual element screams the theme
2. Name${usia ? ' and age' : ''} are the focal points — bold, celebratory, largest text
3. Keep event details minimal — NO full address here
4. Photo placement should feel like the star of the cover
5. Output: fully rendered, vibrant, festive cover — no placeholder boxes`;

  const belakang = `You are a professional graphic designer. Create a BIRTHDAY PARTY invitation BACK PAGE (detail page) design.

══════════════════════
DESIGN BRIEF — HALAMAN BELAKANG (DETAIL PAGE) — UNDANGAN ULANG TAHUN
══════════════════════

${artDir.split('\n')[0]} — same theme as front cover but with lighter/cleaner background for legibility.${warnaLine}
Card size: ${ukuran} — print-ready, 300 DPI equivalent

ALL content below MUST appear clearly:

🎂 ${nama}${usia ? ' — ' + usia + ' Tahun' : ''}

📍 DETAIL ACARA
   Tanggal : ${tanggal}
   Waktu   : ${waktu || 'Pukul ........... WIB'}
   Tempat  : ${tempat}
${dress ? '\n👗 Dress Code: ' + dress : ''}
${catatan ? '\nℹ️ Info tambahan: ' + catatan : ''}

▸ Closing text matching the theme energy (e.g. "See you there!", "Ayo datang ya!", "Don't miss the fun!")
▸ QR code placeholder (label: "Lokasi / Maps") — bottom corner

Design rules:
1. All text above must be clearly legible — even against themed backgrounds
2. Keep the festive energy from the front cover — consistent style, lighter execution
3. Birthday person's name as a smaller decorative accent — not as dominant as cover
4. Output: fully rendered, print-ready back page — no placeholder boxes`;

  return depan + '\n\n[COPY SEPARATOR]\n\n' + belakang;
}
