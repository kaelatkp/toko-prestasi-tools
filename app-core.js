/* ════════════════════════════════════
   APP-CORE.JS — Shared State & Utilities
   Dimuat pertama sebelum app-foto.js & app-dokumen.js
════════════════════════════════════ */

/* ── SHARED STATE ── */
let currentMode    = 'foto';   // 'foto' | 'dokumen' | 'barcode'
let generatedPrompt = '';

/* ── CHANGELOG ── */
const GITHUB_RAW = 'https://raw.githubusercontent.com/kaelatkp/toko-prestasi-tools/main';

/* ── CHANGELOG ── */
const CL_SEEN_KEY = 'tp_cl_seen_v2.3';
let _clData = null;

async function loadChangelog() {
  try {
    const r = await fetch(GITHUB_RAW + '/changelog.json?t=' + Date.now());
    _clData = await r.json();
  } catch (_) { _clData = null; }

  // Auto-show popup jika belum pernah lihat versi ini
  if (!localStorage.getItem(CL_SEEN_KEY)) openChangelog();
}

function openChangelog() {
  if (document.getElementById('cl-modal')) return;

  const items = _clData?.updates?.slice(0, 20) || [];
  const content = items.length
    ? items.map(u => `
        <div class="cl-item">
          <div class="cl-item-header">
            <span class="cl-ver">v${u.version}</span>
            <span class="cl-date">${u.date}</span>
          </div>
          <ul class="cl-notes">${u.notes.map(n => `<li>${n}</li>`).join('')}</ul>
        </div>`).join('')
    : '<div style="color:#8db0a0;font-size:12px;text-align:center;padding:20px">Memuat riwayat update...</div>';

  const modal = document.createElement('div');
  modal.id = 'cl-modal';
  modal.innerHTML = `
    <div class="cl-modal-backdrop" onclick="closeChangelog()"></div>
    <div class="cl-modal-card">
      <div class="cl-modal-header">
        <div class="cl-modal-title">📋 Riwayat Update</div>
        <button class="cl-modal-close" onclick="closeChangelog()">✕</button>
      </div>
      <div class="cl-modal-body">${content}</div>
      <div class="cl-modal-footer">
        <button class="cl-modal-btn" onclick="closeChangelog()">Tutup</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
  localStorage.setItem(CL_SEEN_KEY, '1');
}

function closeChangelog() {
  const modal = document.getElementById('cl-modal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.addEventListener('transitionend', () => modal.remove(), { once: true });
}

/* ════════════════════════════════════
   EVENT THEME SYSTEM
════════════════════════════════════ */
let _activeEventId = null;
let _themesData    = null;

const _THEMES_FALLBACK = {
  events: [
    {
      id: 'idul-adha-1447', name: 'Idul Adha 1447H', emoji: '🐑',
      date: { year: 2026, month: 5, day: 27 },
      window: { before: 1, after: 1 },
      marquee: '🐑 Selamat Hari Raya Idul Adha 1447H · Taqabbalallahu Minna Wa Minkum · Semoga amal ibadah qurban kita diterima Allah SWT · Toko Prestasi mengucapkan Selamat Idul Adha 1447H · Minal Aidin Wal Faizin 🐑',
      banner: 'Selamat Hari Raya Idul Adha 1447H',
      banner_sub: 'Taqabbalallahu Minna Wa Minkum · Semoga ibadah qurban kita diterima Allah SWT',
      colors: { '--green':'#c8960c','--green-dark':'#8b6205','--green-dim':'#6b4c04','--green-light':'#fdf8e8','--green-mid':'#f0d080','--green-glow':'rgba(200,150,12,0.18)' },
      banner_bg: 'linear-gradient(135deg,#7a4f02 0%,#c8960c 60%,#e8b84b 100%)',
      banner_text: '#fff8e1'
    },
    {
      id: 'pancasila-2026', name: 'Hari Lahir Pancasila', emoji: '🦅',
      date: { year: 2026, month: 6, day: 1 },
      window: { before: 1, after: 1 },
      marquee: '🦅 Selamat Hari Lahir Pancasila · 1 Juni 2026 · Pancasila adalah fondasi kita bersama · Bhinneka Tunggal Ika · Toko Prestasi mengucapkan Selamat Hari Lahir Pancasila 🇮🇩',
      banner: 'Selamat Hari Lahir Pancasila',
      banner_sub: '1 Juni 2026 · Bhinneka Tunggal Ika · Toko Prestasi',
      colors: { '--green':'#e8192c','--green-dark':'#b01020','--green-dim':'#8a0c18','--green-light':'#fff0f2','--green-mid':'#ffc0c8','--green-glow':'rgba(232,25,44,0.18)' },
      banner_bg: 'linear-gradient(135deg,#8a0c18 0%,#e8192c 60%,#ff5566 100%)',
      banner_text: '#fff0f2'
    },
    {
      id: 'tahun-baru-islam-1448', name: 'Tahun Baru Islam 1448H', emoji: '🌙',
      date: { year: 2026, month: 6, day: 16 },
      window: { before: 1, after: 1 },
      marquee: '🌙 Selamat Tahun Baru Islam 1448 Hijriah · 1 Muharram 1448H · Semoga tahun baru ini membawa keberkahan dan kebaikan · Toko Prestasi mengucapkan Selamat Tahun Baru Islam 🌙',
      banner: 'Selamat Tahun Baru Islam 1448 Hijriah',
      banner_sub: '1 Muharram 1448H · Semoga dipenuhi keberkahan · Toko Prestasi',
      colors: { '--green':'#1a7fa0','--green-dark':'#0f5a72','--green-dim':'#084560','--green-light':'#e8f6fc','--green-mid':'#90d0e8','--green-glow':'rgba(26,127,160,0.18)' },
      banner_bg: 'linear-gradient(135deg,#083d52 0%,#1a7fa0 60%,#2ab0d8 100%)',
      banner_text: '#e8f8ff'
    },
    {
      id: 'hari-anak-2026', name: 'Hari Anak Nasional', emoji: '👶',
      date: { year: 2026, month: 7, day: 23 },
      window: { before: 1, after: 1 },
      marquee: '👶 Selamat Hari Anak Nasional · 23 Juli 2026 · Anak adalah generasi penerus bangsa · Tumbuh sehat, cerdas, dan bahagia · Toko Prestasi menyapa semua anak-anak hebat Indonesia 🌟',
      banner: 'Selamat Hari Anak Nasional',
      banner_sub: '23 Juli 2026 · Generasi Emas Indonesia · Toko Prestasi',
      colors: { '--green':'#f59e0b','--green-dark':'#d97706','--green-dim':'#b45309','--green-light':'#fffbeb','--green-mid':'#fde68a','--green-glow':'rgba(245,158,11,0.18)' },
      banner_bg: 'linear-gradient(135deg,#b45309 0%,#f59e0b 60%,#fcd34d 100%)',
      banner_text: '#fffbeb'
    },
    {
      id: 'hut-ri-2026', name: 'HUT RI ke-81', emoji: '🇮🇩',
      date: { year: 2026, month: 8, day: 17 },
      window: { before: 1, after: 1 },
      marquee: '🇮🇩 Dirgahayu Republik Indonesia ke-81 · 17 Agustus 2026 · Merdeka! · Sekali Merdeka Tetap Merdeka · Toko Prestasi mengucapkan Selamat HUT RI ke-81 🇮🇩',
      banner: 'Dirgahayu Republik Indonesia ke-81',
      banner_sub: '17 Agustus 2026 · Merdeka! · Toko Prestasi',
      colors: { '--green':'#dc2626','--green-dark':'#b91c1c','--green-dim':'#991b1b','--green-light':'#fef2f2','--green-mid':'#fca5a5','--green-glow':'rgba(220,38,38,0.18)' },
      banner_bg: 'linear-gradient(135deg,#991b1b 0%,#dc2626 40%,#ef4444 70%,#dc2626 100%)',
      banner_text: '#fff0f0'
    },
    {
      id: 'natal-2026', name: 'Hari Natal', emoji: '🎄',
      date: { year: 2026, month: 12, day: 25 },
      window: { before: 1, after: 1 },
      marquee: '🎄 Selamat Hari Natal 2026 · Damai di Bumi Damai di Hati · Semoga hari Natal membawa sukacita dan berkat · Toko Prestasi mengucapkan Selamat Natal 🎄',
      banner: 'Selamat Hari Natal 2026',
      banner_sub: 'Damai di Bumi Damai di Hati · Toko Prestasi',
      colors: { '--green':'#16a34a','--green-dark':'#15803d','--green-dim':'#166534','--green-light':'#f0fdf4','--green-mid':'#86efac','--green-glow':'rgba(22,163,74,0.18)' },
      banner_bg: 'linear-gradient(135deg,#14532d 0%,#16a34a 60%,#22c55e 100%)',
      banner_text: '#f0fff4'
    },
    {
      id: 'hari-ibu-2026', name: 'Hari Ibu', emoji: '💐',
      date: { year: 2026, month: 12, day: 22 },
      window: { before: 1, after: 1 },
      marquee: '💐 Selamat Hari Ibu · 22 Desember 2026 · Terima kasih untuk setiap kasih sayang dan pengorbanan Ibu · Toko Prestasi mengucapkan Selamat Hari Ibu 💐',
      banner: 'Selamat Hari Ibu',
      banner_sub: '22 Desember 2026 · Terima kasih, Ibu · Toko Prestasi',
      colors: { '--green':'#db2777','--green-dark':'#be185d','--green-dim':'#9d174d','--green-light':'#fdf2f8','--green-mid':'#f9a8d4','--green-glow':'rgba(219,39,119,0.18)' },
      banner_bg: 'linear-gradient(135deg,#831843 0%,#db2777 60%,#f472b6 100%)',
      banner_text: '#fdf2f8'
    },
    {
      id: 'tahun-baru-2027', name: 'Tahun Baru 2027', emoji: '🎊',
      date: { year: 2027, month: 1, day: 1 },
      window: { before: 1, after: 1 },
      marquee: '🎊 Selamat Tahun Baru 2027! · Happy New Year · Semoga tahun 2027 penuh berkah, rezeki, dan kebahagiaan · Toko Prestasi mengucapkan Selamat Tahun Baru 2027 🎉',
      banner: 'Selamat Tahun Baru 2027!',
      banner_sub: 'Happy New Year · Semoga 2027 penuh berkah · Toko Prestasi',
      colors: { '--green':'#7c3aed','--green-dark':'#6d28d9','--green-dim':'#5b21b6','--green-light':'#f5f3ff','--green-mid':'#c4b5fd','--green-glow':'rgba(124,58,237,0.18)' },
      banner_bg: 'linear-gradient(135deg,#4c1d95 0%,#7c3aed 50%,#a78bfa 100%)',
      banner_text: '#f5f3ff'
    },
    {
      id: 'kartini-2027', name: 'Hari Kartini', emoji: '🌸',
      date: { year: 2027, month: 4, day: 21 },
      window: { before: 1, after: 1 },
      marquee: '🌸 Selamat Hari Kartini · 21 April 2027 · Habis Gelap Terbitlah Terang · Semangat Kartini menginspirasi setiap perempuan Indonesia · Toko Prestasi mengucapkan Selamat Hari Kartini 🌸',
      banner: 'Selamat Hari Kartini',
      banner_sub: '21 April 2027 · Habis Gelap Terbitlah Terang · Toko Prestasi',
      colors: { '--green':'#ec4899','--green-dark':'#db2777','--green-dim':'#be185d','--green-light':'#fdf2f8','--green-mid':'#fbcfe8','--green-glow':'rgba(236,72,153,0.18)' },
      banner_bg: 'linear-gradient(135deg,#9d174d 0%,#ec4899 60%,#f9a8d4 100%)',
      banner_text: '#fff0f8'
    },
    {
      id: 'idul-fitri-1448', name: 'Idul Fitri 1448H', emoji: '🕌',
      date: { year: 2027, month: 3, day: 10 },
      window: { before: 1, after: 2 },
      marquee: '🕌 Selamat Hari Raya Idul Fitri 1448H · Minal Aidin Wal Faizin · Mohon Maaf Lahir dan Batin · Taqabbalallahu Minna Wa Minkum · Toko Prestasi mengucapkan Selamat Lebaran 🕌',
      banner: 'Selamat Hari Raya Idul Fitri 1448H',
      banner_sub: 'Minal Aidin Wal Faizin · Mohon Maaf Lahir dan Batin · Toko Prestasi',
      colors: { '--green':'#059669','--green-dark':'#047857','--green-dim':'#065f46','--green-light':'#ecfdf5','--green-mid':'#6ee7b7','--green-glow':'rgba(5,150,105,0.18)' },
      banner_bg: 'linear-gradient(135deg,#064e3b 0%,#059669 60%,#34d399 100%)',
      banner_text: '#ecfdf5'
    }
  ]
};

async function loadEventTheme(forceId) {
  if (!_themesData) {
    try {
      const r = await fetch(GITHUB_RAW + '/themes.json?t=' + Date.now());
      _themesData = await r.json();
    } catch (_) {
      _themesData = _THEMES_FALLBACK;
    }
  }
  applyEventTheme(forceId || null);
}

function applyEventTheme(forceId) {
  if (!_themesData?.events?.length) return;
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let event = null;
  if (forceId) {
    event = _themesData.events.find(e => e.id === forceId) || null;
  } else {
    for (const ev of _themesData.events) {
      const d      = ev.date;
      const evDay  = new Date(d.year, d.month - 1, d.day);
      const before = ev.window?.before ?? 1;
      const after  = ev.window?.after  ?? 1;
      const start  = new Date(evDay.getTime() - before * 86400000);
      const end    = new Date(evDay.getTime() + after  * 86400000);
      if (today >= start && today <= end) { event = ev; break; }
    }
  }

  if (!event) { clearEventTheme(); return; }
  _activeEventId = event.id;

  // CSS variable overrides
  let styleEl = document.getElementById('event-theme-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'event-theme-style';
    document.head.appendChild(styleEl);
  }
  const vars = Object.entries(event.colors || {}).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  styleEl.textContent = `:root {\n${vars}\n  --event-banner-bg: ${event.banner_bg || 'var(--green-dark)'};\n  --event-banner-text: ${event.banner_text || '#fff'};\n}`;

  // Event banner in beranda
  const banner = document.getElementById('event-banner');
  if (banner) {
    banner.innerHTML = `
      <span class="event-banner-emoji">${event.emoji}</span>
      <div class="event-banner-text">${event.banner}</div>
      <div class="event-banner-sub">${event.banner_sub || ''}</div>`;
    banner.classList.add('active');
  }

  // Marquee text (same for beranda + tool)
  const marqHtml = `<span class="marquee-track">${event.marquee} &nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp; ${event.marquee} &nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp; ${event.marquee}</span>`;

  const marq = document.getElementById('event-marquee');
  if (marq) { marq.innerHTML = marqHtml; marq.classList.add('active'); }

  const toolMarq = document.getElementById('tool-marquee');
  if (toolMarq) { toolMarq.innerHTML = marqHtml; toolMarq.classList.add('active'); }

  // Sembunyikan daily marquee saat event aktif
  document.getElementById('daily-marquee')?.classList.remove('active');
}

function clearEventTheme() {
  _activeEventId = null;
  document.getElementById('event-theme-style')?.remove();
  document.getElementById('event-banner')?.classList.remove('active');
  document.getElementById('event-marquee')?.classList.remove('active');
  document.getElementById('tool-marquee')?.classList.remove('active');
  // Tampilkan kembali daily marquee
  const theme = DAILY_THEMES[new Date().getDay()];
  if (theme) _renderDailyMarquee(theme);
}

/* ════════════════════════════════════
   DAILY THEME SYSTEM — Beranda 7 Hari
════════════════════════════════════ */
const DAILY_THEMES = {
  0: { // Minggu — Ungu Lavender — OLZ
    colors: { '--green':'#7c3aed','--green-dark':'#6d28d9','--green-dim':'#5b21b6','--green-light':'#f5f3ff','--green-mid':'#ddd6fe','--green-glow':'rgba(124,58,237,0.18)' },
    bg: '#f8f5ff',
    hero: { title: 'Recharge, syukur, <span>siap besok!</span>', sub: 'Nikmati hari Minggu — besok kita mulai lagi dengan segar' },
    featured: 1,
    messages: [
      { name: 'OLZ', msg: 'Hari Minggu adalah waktu bersyukur atas semua yang sudah kita lalui bersama. Istirahat yang cukup adalah bekal semangat terbaik untuk hari Senin.' }
    ]
  },
  1: { // Senin — Biru Navy — KAELA + SEIRA
    colors: { '--green':'#2563eb','--green-dark':'#1d4ed8','--green-dim':'#1e3a8a','--green-light':'#eff6ff','--green-mid':'#bfdbfe','--green-glow':'rgba(37,99,235,0.18)' },
    bg: '#f0f5ff',
    hero: { title: 'Semangat awal pekan — <span>siap melayani!</span>', sub: 'Mulai hari Senin dengan tulus dan penuh semangat' },
    featured: 1,
    messages: [
      { name: 'KAELA', msg: 'Setiap pelanggan yang datang membawa harapan. Layani dengan tulus hari ini — mereka akan selalu ingat bagaimana kamu membuat mereka merasa dihargai.' },
      { name: 'SEIRA', msg: 'Dengarkan pelanggan dengan sungguh-sungguh hari ini. Kadang solusi terbaik lahir dari pertanyaan sederhana yang belum mereka ungkapkan.' }
    ]
  },
  2: { // Selasa — Teal/Cyan — CIPHER + NOVA
    colors: { '--green':'#0891b2','--green-dark':'#0e7490','--green-dim':'#164e63','--green-light':'#ecfeff','--green-mid':'#a5f3fc','--green-glow':'rgba(8,145,178,0.18)' },
    bg: '#f0fafe',
    hero: { title: 'Fokus, teliti, <span>profesional hari ini.</span>', sub: 'Selasa yang produktif dimulai dari pelayanan terbaik' },
    featured: 0,
    messages: [
      { name: 'CIPHER', msg: 'Pelanggan yang merasa dihargai memiliki kemungkinan jauh lebih besar untuk kembali. Konsistensi bukan pilihan — itu adalah strategi bisnis paling cerdas.' },
      { name: 'NOVA', msg: 'Pelayanan terbaikmu hari ini sedang menulis reputasi toko untuk masa depan. Setiap interaksi adalah halaman baru dalam cerita Toko Prestasi.' }
    ]
  },
  3: { // Rabu — Oranye — LYRA + REED
    colors: { '--green':'#ea580c','--green-dark':'#c2410c','--green-dim':'#9a3412','--green-light':'#fff7ed','--green-mid':'#fed7aa','--green-glow':'rgba(234,88,12,0.18)' },
    bg: '#fffaf5',
    hero: { title: 'Energi penuh, <span>pertengahan pekan!</span>', sub: 'Rabu kreatif — temukan solusi terbaik untuk pelanggan' },
    featured: 3,
    messages: [
      { name: 'LYRA', msg: 'Di tengah pekan seperti ini, sebuah senyum tulus bisa jadi titik balik hari seseorang yang lelah. Jaga energimu — kamu lebih berpengaruh dari yang kamu kira.' },
      { name: 'REED', msg: 'Catat ini baik-baik: pelanggan yang sabar kamu layani hari ini adalah pelanggan setia yang akan kembali esok, lusa, dan seterusnya.' }
    ]
  },
  4: { // Kamis — Hijau Default — RAVEN + PRISM
    colors: { '--green':'#00C853','--green-dark':'#009c3e','--green-dim':'#007a30','--green-light':'#edfbf3','--green-mid':'#b6f0cc','--green-glow':'rgba(0,200,83,0.18)' },
    bg: '#f0f9f3',
    hero: { title: 'Konsisten, sabar, <span>tetap tenang.</span>', sub: 'Kamis membuktikan — keistiqomahan pelayanan itu nyata' },
    featured: 0,
    messages: [
      { name: 'RAVEN', msg: 'Kerja keras bukan soal seberapa cepat, tapi seberapa benar dan tulus. Kamis ini, satu langkah lagi menuju akhir pekan yang memuaskan.' },
      { name: 'PRISM', msg: 'Semua angka menunjukkan satu hal — pelayanan yang jujur dan konsisten selalu menghasilkan kepercayaan yang nilainya melampaui diskon apapun.' }
    ]
  },
  5: { // Jumat — Emas/Amber — ZANE + MARCUS
    colors: { '--green':'#d97706','--green-dark':'#b45309','--green-dim':'#92400e','--green-light':'#fffbeb','--green-mid':'#fde68a','--green-glow':'rgba(217,119,6,0.18)' },
    bg: '#fffdf0',
    hero: { title: 'Akhir pekan mendekat — <span>jangan kendur!</span>', sub: 'Pelanggan terakhir hari ini juga berhak dapat yang terbaik' },
    featured: 2,
    messages: [
      { name: 'ZANE', msg: 'Jumat! Weekend hampir tiba — tapi jangan kendur dulu. Pelanggan yang kamu layani dengan semangat penuh hari ini adalah yang paling akan kamu kenang.' },
      { name: 'MARCUS', msg: 'Jaga standar pelayananmu sampai menit terakhir. Konsistensi adalah tameng terkuat — tidak ada yang bisa merusak reputasi yang dibangun dengan jujur.' }
    ]
  },
  6: { // Sabtu — Merah Coral — DRAKE + VECTOR
    colors: { '--green':'#e11d48','--green-dark':'#be123c','--green-dim':'#9f1239','--green-light':'#fff1f2','--green-mid':'#fecdd3','--green-glow':'rgba(225,29,72,0.18)' },
    bg: '#fff5f6',
    hero: { title: 'Hari paling ramai — <span>tetap sabar!</span>', sub: 'Sabtu adalah kesempatan emas tunjukkan pelayanan prima' },
    featured: 0,
    messages: [
      { name: 'DRAKE', msg: 'Sabtu memang ramai dan kadang menguras tenaga. Tapi ingat — di balik setiap pelanggan ada cerita dan kebutuhan yang berbeda. Sabar adalah kekuatan sejati.' },
      { name: 'VECTOR', msg: 'Layani satu per satu, jangan terburu-buru. Sabtu yang produktif bukan yang paling banyak transaksinya, tapi yang paling sedikit pelanggan yang kecewa.' }
    ]
  }
};

function applyDailyTheme() {
  const day   = new Date().getDay();
  const theme = DAILY_THEMES[day];
  if (!theme) return;

  // 1. CSS color vars — event-theme-style (ditambah setelah ini) akan override secara alami
  let styleEl = document.getElementById('daily-theme-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'daily-theme-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `:root {\n${Object.entries(theme.colors).map(([k,v]) => `  ${k}: ${v};`).join('\n')}\n}`;

  // 2. Beranda background
  const beranda = document.getElementById('beranda');
  if (beranda) beranda.style.background = theme.bg;

  // 3. Hero text
  const heroTitle = document.querySelector('.brnd-hero-title');
  const heroSub   = document.querySelector('.brnd-hero-sub');
  if (heroTitle) heroTitle.innerHTML    = theme.hero.title;
  if (heroSub)   heroSub.textContent   = theme.hero.sub;

  // 4. Spotlight card (hanya 1 yang di-featured per hari)
  document.querySelectorAll('.brnd-tool-card').forEach((c, i) =>
    c.classList.toggle('brnd-tool-card--spotlight', i === theme.featured)
  );

  // 5. Daily marquee
  _renderDailyMarquee(theme);
}

function _renderDailyMarquee(theme) {
  const el = document.getElementById('daily-marquee');
  if (!el) return;
  const msgs = theme.messages
    .map(m => `💬 <strong>${m.name}</strong> &nbsp;·&nbsp; <em>"${m.msg}"</em>`)
    .join(' &nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;&nbsp; ');
  const content = `${msgs} &nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;&nbsp; ${msgs}`;
  el.innerHTML = `<span class="marquee-track daily-track">${content}</span>`;
  el.classList.toggle('active', !_activeEventId);
}

/* ── DEV: Theme Preview Panel (Ctrl+Shift+T) ── */
function _buildDevThemePanel() {
  if (document.getElementById('dev-theme-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'dev-theme-panel';
  document.body.appendChild(panel);
  _refreshDevThemePanel();
}

function _refreshDevThemePanel() {
  const panel = document.getElementById('dev-theme-panel');
  if (!panel) return;
  const events = (_themesData || _THEMES_FALLBACK).events;
  const btns = events.map(ev => `
    <button class="dtp-btn${_activeEventId === ev.id ? ' active' : ''}" onclick="_previewTheme('${ev.id}')">${ev.emoji} ${ev.name}</button>
  `).join('');
  panel.innerHTML = `
    <div class="dtp-title">⚡ DEV — THEME PREVIEW</div>
    <button class="dtp-btn-default${!_activeEventId ? ' active' : ''}" onclick="_previewTheme(null)">🌿 Default (Tanpa Tema)</button>
    ${btns}
    <div class="dtp-hint">Ctrl+Shift+T untuk tutup</div>`;
}

function _previewTheme(id) {
  if (id) {
    if (!_themesData) _themesData = _THEMES_FALLBACK;
    applyEventTheme(id);
  } else {
    clearEventTheme();
  }
  _refreshDevThemePanel();
}

/* ── PLATFORM URLS ── */
const PLATFORM_URLS = {
  claude:  'https://claude.ai/new',
  gemini:  'https://gemini.google.com/app',
  chatgpt: 'https://chat.openai.com/',
};

/* ════════════════════════════════════
   MODE SWITCHER
════════════════════════════════════ */
function switchMode(mode) {
  if (currentMode === mode) return;
  currentMode = mode;

  // Tab buttons
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Layout class — barcode mode uses 1/3 sidebar + 2/3 preview
  document.querySelector('.app')?.classList.toggle('app--barcode', mode === 'barcode');

  // Sidebar scroll panels
  const fScroll = document.getElementById('sidebar-foto-scroll');
  const dScroll = document.getElementById('sidebar-dok-scroll');
  const bScroll = document.getElementById('sidebar-barcode-scroll');
  const bFooter = document.getElementById('bc-print-footer');
  if (fScroll) fScroll.style.display = mode === 'foto'     ? '' : 'none';
  if (dScroll) dScroll.style.display = mode === 'dokumen'  ? '' : 'none';
  if (bScroll) bScroll.style.display = mode === 'barcode'  ? '' : 'none';
  if (bFooter) bFooter.style.display = mode === 'barcode'  ? '' : 'none';

  // Welcome screens
  const wFoto    = document.getElementById('welcome');
  const wDok     = document.getElementById('welcome-dok');
  const wBarcode = document.getElementById('welcome-barcode');
  if (wFoto)    wFoto.style.display    = mode === 'foto'    ? '' : 'none';
  if (wDok)     wDok.style.display     = mode === 'dokumen' ? '' : 'none';
  if (wBarcode) wBarcode.style.display = mode === 'barcode' ? '' : 'none';

  // Hide workspace (not used in barcode mode)
  document.getElementById('workspace')?.classList.remove('show');

  // Tombol Cetak Foto shortcut — hanya tampil di mode foto
  const btnCetak = document.querySelector('.btn-cetak-shortcut');
  if (btnCetak) btnCetak.style.display = mode === 'foto' ? '' : 'none';

  // Sidebar search bar — hide in barcode mode (not relevant)
  const searchWrap = document.querySelector('.sidebar-search');
  if (searchWrap) searchWrap.style.display = mode === 'barcode' ? 'none' : '';

  // Sidebar head labels
  const headLabel = document.querySelector('.sidebar-head-label');
  const headTitle = document.querySelector('.sidebar-head-title');
  if (headLabel) headLabel.textContent = mode === 'barcode' ? 'Generator Barcode' : mode === 'foto' ? 'Semua Layanan' : 'Generator Dokumen';
  if (headTitle) headTitle.textContent = mode === 'barcode' ? 'Data & Layout'     : mode === 'foto' ? 'Pilih Layanan' : 'Pilih Jenis Dokumen';

  // Brand badge & subtitle
  const badge = document.querySelector('.brand-badge');
  const sub   = document.querySelector('.brand-sub');
  if (badge) badge.textContent = mode === 'foto' ? 'FOTO' : mode === 'barcode' ? 'BARCODE' : 'DOK';
  if (sub)   sub.textContent   = mode === 'barcode'
    ? 'Cetak Label & Barcode Toko'
    : mode === 'foto'
      ? 'Generator Prompt Foto AI'
      : 'Generator Surat & Dokumen ATK';

  // Search placeholder
  const searchEl = document.getElementById('mod-search');
  if (searchEl) searchEl.placeholder = mode === 'foto'
    ? '🔍 Cari modul...'
    : '🔍 Cari jenis dokumen...';

  // Reset active cards
  document.querySelectorAll('.mod-card').forEach(c => c.classList.remove('active'));

  // Reset mode-specific state
  generatedPrompt = '';
  if (mode === 'foto') {
    if (typeof currentMod !== 'undefined') currentMod = null;
  } else if (mode === 'dokumen') {
    if (typeof currentModDok !== 'undefined') currentModDok = null;
  }

  // Re-init groups for new sidebar (not barcode — it has no groups)
  if (mode !== 'barcode' && typeof initGroupsForMode === 'function') initGroupsForMode(mode);
}

/* ════════════════════════════════════
   SPLASH SCREEN — LOADING ANIMATION
════════════════════════════════════ */
function startSplashLoading() {
  const fill      = document.getElementById('spl-fill');
  const pctEl     = document.getElementById('spl-pct');
  const termBody  = document.getElementById('spl-term-body');
  const tipEl     = document.getElementById('spl-tip');
  const mainEl    = document.getElementById('spl-main');
  const prebootEl = document.getElementById('spl-preboot');
  if (!fill) return;

  const r  = (a, b) => a + Math.random() * (b - a);
  const rI = (a, b) => Math.floor(r(a, b + 1));

  /* ══ FASE 1: Particle canvas background ══ */
  const canvas = document.getElementById('spl-particles');
  if (canvas) {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const pts = Array.from({ length: 50 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  0.6 + Math.random() * 2,
      vy: 0.12 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      o:  0.06 + Math.random() * 0.25,
    }));
    let paf;
    (function drawPts() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,200,83,${p.o})`;
        ctx.fill();
        p.y -= p.vy; p.x += p.vx;
        if (p.y < -6) { p.y = canvas.height + 6; p.x = Math.random() * canvas.width; }
        if (p.x < -6 || p.x > canvas.width + 6) p.x = Math.random() * canvas.width;
      }
      paf = requestAnimationFrame(drawPts);
    })();
    window._cancelSplashRain = () => cancelAnimationFrame(paf);
  } else {
    window._cancelSplashRain = () => {};
  }

  /* ══ FASE 2: langsung ke main (BIOS dihapus) ══ */
  const BIOS = [
    { t: 'sep',    s: '══════════════════════════════════════════════════════════════' },
    { t: 'bright', s: '  TOKO PRESTASI TOOLS  ::  BIOS v2.3  (C) 2024 NEXUS FORGE TEAM' },
    { t: 'sep',    s: '══════════════════════════════════════════════════════════════' },
    { t: '',       s: '' },
    { t: 'dim',    s: '  CPU   : NEXUS-CORE x8 @ 3.60GHz ................. [OK]' },
    { t: 'dim',    s: '  RAM   : 16384 MB DDR4 ............................ [OK]' },
    { t: 'dim',    s: '  DISK  : SSD 512 GB ............................... [OK]' },
    { t: 'dim',    s: '  DISP  : 1920x1080 60Hz ........................... [OK]' },
    { t: 'dim',    s: '  NET   : ETHERNET ................................. [CHECKING...]' },
    { t: '',       s: '' },
    { t: '',       s: '  Memindai modul sistem...' },
    { t: 'bright', s: '  FOTO MODULE   [25] : ████████████████████ LOADED' },
    { t: 'bright', s: '  DOKUMEN MODULE[28] : ████████████████████ LOADED' },
    { t: 'bright', s: '  BARCODE ENGINE     : ████████████████████ LOADED' },
    { t: 'bright', s: '  PROMPT ENGINE v2.3 : ████████████████████ LOADED' },
    { t: 'bright', s: '  WAJAH_RULE         : ████████████████████ ACTIVE' },
    { t: '',       s: '' },
    { t: 'bright', s: '  Memulai Toko Prestasi Tools...' },
  ];

  if (prebootEl) {
    prebootEl.innerHTML = '';
    let bi = 0;
    function showBiosLine() {
      if (bi >= BIOS.length) {
        // Preboot selesai — fade out, tampilkan main
        setTimeout(() => {
          prebootEl.classList.add('fade-out');
          setTimeout(() => {
            prebootEl.style.display = 'none';
            if (mainEl) {
              requestAnimationFrame(() => requestAnimationFrame(() => mainEl.classList.add('visible')));
            }
            startMainPhase();
          }, 560);
        }, 280);
        return;
      }
      const { t: type, s: text } = BIOS[bi++];
      const el = document.createElement('div');
      el.className = 'spl-pb-line' + (type ? ' ' + type : '');
      el.textContent = text || ' ';
      prebootEl.appendChild(el);
      requestAnimationFrame(() => el.classList.add('v'));
      // Delay: separator cepat, bright sedikit lebih lama, kosong sangat cepat
      const delay = type === 'sep' ? 35 : !text ? 55 : type === 'bright' ? 130 : 75;
      setTimeout(showBiosLine, delay);
    }
    setTimeout(showBiosLine, 180);
  } else {
    // No preboot element — langsung main
    if (mainEl) mainEl.classList.add('visible');
    startMainPhase();
  }

  /* ══ FASE 3: Main loading (velocity engine + ads + terminal) ══ */
  function startMainPhase() {
    const TARGET_MS = r(8500, 11200);

    // Status messages — tampil di spl-tip (status line di card)
    const ADS = [
      'Memuat 25 modul foto — pasfoto, wisuda, couple, produk & lebih banyak lagi...',
      'Mendaftarkan 28 jenis dokumen ATK — surat, CV, nota, perjanjian, undangan...',
      'Mengaktifkan WAJAH_RULE — identitas wajah terlindungi di setiap proses...',
      'Menyiapkan barcode engine CODE128A v3.11 — cetak label produk A4 / F4...',
      'Menghubungkan ke Claude AI · Gemini · ChatGPT — tanpa API key...',
      'Zero API mode aktif — tidak ada biaya tersembunyi, tidak ada batas kuota...',
      'Mengaktifkan auto-fill tanggal & kota — hemat waktu setiap generate...',
      'Prompt engine v2.3 siap — output terstruktur dan konsisten...',
      'CROP_RULE aktif — canvas margin +15% untuk hasil crop optimal...',
      'Toko Prestasi · Jl. Poros Sp 4, Kongbeng, Kutai-Timur · 07:00–21:00',
      'Dibangun oleh Nexus Forge Team — kritik & saran: 0812-99-303-888',
      'Foto dokumen: KTP · SIM · Paspor · SKCK · CPNS · KUA · Wisuda · Lamaran...',
    ];
    let adIdx = Math.floor(r(0, ADS.length));
    if (tipEl) { tipEl.textContent = ADS[adIdx % ADS.length]; adIdx++; tipEl.style.opacity = '1'; }
    const adTimer = setInterval(() => {
      if (!tipEl) return;
      tipEl.style.opacity = '0';
      setTimeout(() => { tipEl.textContent = ADS[adIdx % ADS.length]; adIdx++; tipEl.style.opacity = '1'; }, 340);
    }, 2900);

    // Terminal messages
    const MSGS = [
      ['BOOT', 'Menginisialisasi Toko Prestasi Tools v2.3...'],
      ['LOAD', 'Memuat komponen antarmuka utama...'],
      ['MOD ', 'Mendaftarkan 25 modul foto ke sistem...'],
      ['MOD ', 'Mendaftarkan 28 jenis dokumen ATK...'],
      ['RULE', 'Mengaktifkan WAJAH_RULE — proteksi identitas ON'],
      ['ENG ', 'Menginisialisasi prompt engine v2.3...'],
      ['SYNC', 'Menyinkronkan preset chips & template dokumen...'],
      ['CODE', 'Memuat barcode engine CODE128A v3.11...'],
      ['NET ', 'Menghubungkan: Claude AI · Gemini · ChatGPT...'],
      ['DONE', 'Semua sistem beroperasi — masuk otomatis...'],
    ];
    function addLine(prefix, txt) {
      if (!termBody) return;
      const el = document.createElement('div');
      el.className = 'spl-term-line';
      const ok = prefix.trim() === 'DONE';
      const pc = ok ? '#00e676' : 'rgba(0,200,83,0.38)';
      const tc = ok ? '#00e676' : 'rgba(0,200,83,0.82)';
      el.innerHTML = `<span class="spl-term-prefix" style="color:${pc}">[${prefix}]</span> <span style="color:${tc}">${txt}</span>`;
      termBody.appendChild(el);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
      const all = termBody.querySelectorAll('.spl-term-line');
      if (all.length > 6) Array.from(all).slice(0, all.length - 6).forEach(l => { l.style.opacity = '0.2'; });
      if (all.length > 9) all[0].remove();
      termBody.scrollTop = termBody.scrollHeight;
    }
    MSGS.forEach(([p, t], i) => setTimeout(() => addLine(p, t), 300 + (TARGET_MS / MSGS.length) * i));

    // Velocity curve (random walk → normalisasi ke TARGET_MS)
    function buildCurve() {
      const pts = [{ t: 0, p: 0 }];
      let t = 0, p = 0;
      while (p < 100) {
        const roll = Math.random();
        let speed, dur;
        if      (roll < 0.10) { speed = 0;        dur = r(0.5, 1.5); }  // macet
        else if (roll < 0.28) { speed = r(2, 7);  dur = r(0.4, 0.9); }  // lambat
        else if (roll < 0.68) { speed = r(10, 20);dur = r(0.25, 0.65); }// normal
        else                  { speed = r(25, 45); dur = r(0.12, 0.38); }// burst
        t += dur;
        p = Math.min(p + speed * dur, 100);
        pts.push({ t, p });
      }
      const scale = (TARGET_MS / 1000) / pts[pts.length - 1].t;
      return pts.map(pt => ({ t: pt.t * scale, p: pt.p }));
    }
    const curve = buildCurve();
    let st = null, cp = 0, af;
    function tick(now) {
      if (!st) st = now;
      const el = (now - st) / 1000;
      while (cp < curve.length - 1 && el >= curve[cp + 1].t) cp++;
      let pct;
      if (cp >= curve.length - 1) {
        pct = 100;
      } else {
        const { t: t0, p: p0 } = curve[cp], { t: t1, p: p1 } = curve[cp + 1];
        const seg = t1 - t0, a = seg > 0 ? Math.min((el - t0) / seg, 1) : 1;
        pct = p0 + (p1 - p0) * a * a * (3 - 2 * a); // smoothstep
      }
      fill.style.width = pct + '%';
      if (pctEl) pctEl.textContent = Math.floor(pct) + '%';
      if (pct < 100) {
        af = requestAnimationFrame(tick);
      } else {
        clearInterval(adTimer);
        fill.style.width = '100%';
        if (pctEl) pctEl.textContent = '100%';
        setTimeout(appMasuk, 750);
      }
    }
    requestAnimationFrame(tick);
  }
}

function appMasuk() {
  const el = document.documentElement;
  (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen)?.call(el);
  // Stop canvas rain
  if (typeof window._cancelSplashRain === 'function') window._cancelSplashRain();
  const splash = document.getElementById('app-splash');
  if (splash) {
    splash.classList.add('hiding');
    setTimeout(() => { splash.style.display = 'none'; }, 520);
  }
}

/* ════════════════════════════════════
   TOOL LOADING — 5 detik saat masuk tool
════════════════════════════════════ */
const TOOL_LOAD_MSGS = {
  foto: [
    ['INIT',  'Memuat generator prompt foto...'],
    ['LOAD',  'Memuat 25 modul foto...'],
    ['BUILD', 'Menyusun WAJAH_RULE & CROP_RULE...'],
    ['SYNC',  'Mengaktifkan preset chips & template...'],
    ['OK',    'Generator foto siap digunakan'],
  ],
  dokumen: [
    ['INIT',  'Memuat generator dokumen...'],
    ['LOAD',  'Memuat 28 jenis dokumen ATK...'],
    ['BUILD', 'Menyusun template surat & CV...'],
    ['SYNC',  'Auto-fill tanggal & kota aktif...'],
    ['OK',    'Generator dokumen siap digunakan'],
  ],
  barcode: [
    ['INIT',  'Memuat barcode engine...'],
    ['LOAD',  'Memuat CODE128A v3.11...'],
    ['BUILD', 'Mengkalibrasi grid layout A4/F4...'],
    ['SYNC',  'Menyiapkan sistem cetak label...'],
    ['OK',    'Barcode generator siap digunakan'],
  ],
};

const TOOL_ICONS = { foto: '📸', dokumen: '📄', barcode: '🏷️' };
const TOOL_NAMES = { foto: 'Generator Foto', dokumen: 'Generator Dokumen', barcode: 'Barcode Generator' };

const _VISITED_KEY = 'tp_tools_visited';
function _isFirstVisit(mode) {
  try {
    const v = JSON.parse(localStorage.getItem(_VISITED_KEY) || '{}');
    if (v[mode]) return false;
    v[mode] = true;
    localStorage.setItem(_VISITED_KEY, JSON.stringify(v));
    return true;
  } catch(e) { return false; }
}

function showToolLoading(mode, onDone) {
  // First visit only — sesudahnya langsung instan
  if (!_isFirstVisit(mode)) {
    onDone && onDone();
    return;
  }

  const overlay = document.getElementById('tool-loading');
  if (!overlay) { onDone && onDone(); return; }

  const iconEl  = overlay.querySelector('.tl-icon-area');
  const titleEl = overlay.querySelector('.tl-title');
  const fillEl  = overlay.querySelector('.tl-pbar-fill');
  const pctEl   = overlay.querySelector('.tl-pct');
  const msgEl   = overlay.querySelector('.tl-msg');

  if (iconEl)  iconEl.textContent = TOOL_ICONS[mode] || '⚡';
  if (titleEl) titleEl.innerHTML  = 'Memuat <span>' + (TOOL_NAMES[mode] || mode) + '</span>...';
  if (fillEl)  fillEl.style.width = '0%';
  if (pctEl)   pctEl.textContent  = '0%';
  if (msgEl)   msgEl.textContent  = '';

  overlay.classList.remove('hiding');
  overlay.classList.add('show');

  const r    = (a, b) => a + Math.random() * (b - a);
  const msgs = TOOL_LOAD_MSGS[mode] || TOOL_LOAD_MSGS.foto;
  const TARGET_MS = r(4200, 5800);

  // Pesan terdistribusi merata
  msgs.forEach(([prefix, txt], i) => {
    setTimeout(() => {
      if (msgEl) msgEl.textContent = '[' + prefix + '] ' + txt;
    }, 200 + (TARGET_MS / msgs.length) * i);
  });

  // Velocity curve — sama seperti splash, tapi lebih pendek
  function buildCurve() {
    const pts = [{ t: 0, p: 0 }];
    let t = 0, p = 0;
    while (p < 100) {
      const roll = Math.random();
      let speed, dur;
      if (roll < 0.08) {
        speed = 0; dur = r(0.3, 0.9);
      } else if (roll < 0.28) {
        speed = r(3, 8); dur = r(0.3, 0.7);
      } else if (roll < 0.70) {
        speed = r(12, 22); dur = r(0.2, 0.55);
      } else {
        speed = r(28, 50); dur = r(0.1, 0.3);
      }
      t += dur;
      p = Math.min(p + speed * dur, 100);
      pts.push({ t, p });
    }
    const scale = (TARGET_MS / 1000) / pts[pts.length - 1].t;
    return pts.map(pt => ({ t: pt.t * scale, p: pt.p }));
  }

  const curve = buildCurve();
  let startTime = null, curPt = 0, af;

  function tick(now) {
    if (!startTime) startTime = now;
    const elapsed = (now - startTime) / 1000;
    while (curPt < curve.length - 1 && elapsed >= curve[curPt + 1].t) curPt++;

    let pct;
    if (curPt >= curve.length - 1) {
      pct = 100;
    } else {
      const { t: t0, p: p0 } = curve[curPt];
      const { t: t1, p: p1 } = curve[curPt + 1];
      const seg = t1 - t0;
      const alpha = seg > 0 ? Math.min((elapsed - t0) / seg, 1) : 1;
      const eased = alpha * alpha * (3 - 2 * alpha);
      pct = p0 + (p1 - p0) * eased;
    }

    if (fillEl) fillEl.style.width = pct + '%';
    if (pctEl)  pctEl.textContent  = Math.floor(pct) + '%';

    if (pct < 100) {
      af = requestAnimationFrame(tick);
    } else {
      if (fillEl) fillEl.style.width = '100%';
      if (pctEl)  pctEl.textContent  = '100%';
      setTimeout(() => {
        overlay.classList.add('hiding');
        setTimeout(() => {
          overlay.classList.remove('show', 'hiding');
          onDone && onDone();
        }, 380);
      }, 320);
    }
  }

  requestAnimationFrame(tick);
}

/* ════════════════════════════════════
   PING WIDGET — Real-time internet latency
   Draggable, floating, selalu tampil
════════════════════════════════════ */
function initPingWidget() {
  const container = document.getElementById('footer-ping');
  if (!container) return;
  const w = document.createElement('div');
  w.id = 'ping-widget';
  w.innerHTML = `
    <span class="pw-dot" id="pw-dot"></span>
    <span class="pw-label">PING</span>
    <span class="pw-num" id="pw-num">--</span>
    <span class="pw-unit">ms</span>
    <span class="pw-status" id="pw-status">INIT</span>
    <div class="pw-bars">
      <span class="pw-bar" id="pw-b1"></span>
      <span class="pw-bar" id="pw-b2"></span>
      <span class="pw-bar" id="pw-b3"></span>
      <span class="pw-bar" id="pw-b4"></span>
    </div>
    <span class="pw-stat" id="pw-stats" title="Statistik Ping">--</span>`;
  container.appendChild(w);

  const dotEl    = document.getElementById('pw-dot');
  const numEl    = document.getElementById('pw-num');
  const statusEl = document.getElementById('pw-status');
  const statsEl  = document.getElementById('pw-stats');
  const barEls   = [1,2,3,4].map(i => document.getElementById('pw-b' + i));
  let minP = Infinity, maxP = 0;
  window._netStatus  = 'checking';
  window._lastPingMs = null;

  // Smooth animated counter — counts from displayed value to new value
  let _pwShown = null, _pwCountRaf = null;
  function animatePwNum(target) {
    if (_pwCountRaf) cancelAnimationFrame(_pwCountRaf);
    const from = _pwShown === null ? target : _pwShown;
    if (from === target) { if (numEl) numEl.textContent = target; _pwShown = target; return; }
    const dist = Math.abs(target - from);
    const duration = Math.min(Math.max(dist * 6, 200), 900); // 200-900ms proportional
    const t0 = performance.now();
    function step(now) {
      const prog = Math.min((now - t0) / duration, 1);
      const ease = prog < 0.5 ? 2 * prog * prog : -1 + (4 - 2 * prog) * prog; // easeInOut
      const val = Math.round(from + (target - from) * ease);
      if (numEl) numEl.textContent = val;
      _pwShown = val;
      if (prog < 1) _pwCountRaf = requestAnimationFrame(step);
      else { if (numEl) numEl.textContent = target; _pwShown = target; }
    }
    _pwCountRaf = requestAnimationFrame(step);
  }

  function applyState(ms) {
    let color, label, bars, dotAnim, numAnim;
    if (ms === null) {
      color = '#f43f5e'; label = 'OFFLINE'; bars = 0;
      dotAnim = 'pw-blink 0.5s step-end infinite';
      numAnim = 'pw-blink 0.5s step-end infinite';
    } else if (ms < 60) {
      color = '#00ff88'; label = 'FAST'; bars = 4;
      dotAnim = 'pw-pulse-fast 1.1s ease-in-out infinite';
      numAnim = 'pw-numglow 1.1s ease-in-out infinite';
    } else if (ms < 150) {
      color = '#22d3ee'; label = 'STABLE'; bars = 3;
      dotAnim = 'pw-pulse-slow 2s ease-in-out infinite';
      numAnim = 'pw-numglow 2s ease-in-out infinite';
    } else if (ms < 300) {
      color = '#fbbf24'; label = 'SLOW'; bars = 2;
      dotAnim = 'pw-flicker 3s linear infinite';
      numAnim = 'pw-flicker 3s linear infinite';
    } else {
      color = '#f97316'; label = 'HIGH LAG'; bars = 1;
      dotAnim = 'pw-blink 0.7s step-end infinite';
      numAnim = 'pw-blink 0.7s step-end infinite';
    }

    w.style.setProperty('--pw-c', color);
    w.style.borderColor = color;

    if (statusEl) statusEl.textContent = label;
    // Smooth animated number transition
    if (ms !== null) {
      animatePwNum(ms);
    } else {
      if (_pwCountRaf) cancelAnimationFrame(_pwCountRaf);
      if (numEl) numEl.textContent = '--';
      _pwShown = null;
    }
    if (dotEl) dotEl.style.animation = dotAnim;
    if (numEl) numEl.style.animation = numAnim;
    barEls.forEach((b, i) => { if (b) b.classList.toggle('active', i < bars); });
  }

  async function doPing() {
    const t0 = performance.now();
    try {
      await fetch('https://www.google.com/generate_204', {
        mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(4000)
      });
      const p = Math.round(performance.now() - t0);
      minP = Math.min(minP === Infinity ? p : minP, p);
      maxP = Math.max(maxP, p);
      if (statsEl) statsEl.textContent = 'min ' + minP + ' · max ' + maxP;
      applyState(p);
      window._netStatus  = 'ok';
      window._lastPingMs = p;
    } catch(e) {
      if (statsEl) statsEl.textContent = 'koneksi terputus';
      applyState(null);
      window._netStatus  = 'error';
      window._lastPingMs = null;
    }
    setTimeout(doPing, 2500);
  }

  setTimeout(doPing, 1200);
}

/* ════════════════════════════════════
   BERANDA NAVIGATION
════════════════════════════════════ */
function openTool(mode) {
  const beranda = document.getElementById('beranda');
  if (beranda) {
    beranda.classList.add('hiding');
    setTimeout(() => { beranda.style.display = 'none'; beranda.classList.remove('hiding'); }, 280);
  }
  const appEl = document.querySelector('.app');
  if (appEl) appEl.style.display = '';
  setTimeout(() => { currentMode = null; switchMode(mode); }, 10);
}

function goHome() {
  const beranda = document.getElementById('beranda');
  const appEl   = document.querySelector('.app');
  if (appEl) appEl.style.display = 'none';
  if (beranda) {
    beranda.style.display = '';
    beranda.classList.remove('hiding');
  }
  generatedPrompt = '';
  document.getElementById('workspace')?.classList.remove('show');
}

function laporkanBug() {
  const modeLabel = currentMode === 'foto' ? 'Foto' : currentMode === 'dokumen' ? 'Dokumen' : currentMode === 'barcode' ? 'Barcode' : 'Beranda';
  const aktifEl = currentMode === 'foto'
    ? document.querySelector('.tool-btn.active')
    : currentMode === 'dokumen'
      ? document.querySelector('.dok-btn.active')
      : null;
  const namaModul = aktifEl ? (aktifEl.title || aktifEl.textContent.trim()) : modeLabel;
  const msg = `🐛 Bug Report — Toko Prestasi Tools\n\nModul: ${namaModul}\nVersi: v2.3\n\nDeskripsi bug:\n`;
  window.open('https://wa.me/6281299303888?text=' + encodeURIComponent(msg), '_blank');
}

/* ════════════════════════════════════
   DRAWER (mobile)
════════════════════════════════════ */
function openDrawer() {
  document.querySelector('.sidebar').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('show');
}
function closeDrawer() {
  document.querySelector('.sidebar').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('show');
}

/* ════════════════════════════════════
   TOAST
════════════════════════════════════ */
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

/* ════════════════════════════════════
   LOADING BAR (shared — both modes)
════════════════════════════════════ */
function showLoadingBar(onComplete, messages) {
  const wsBody    = document.getElementById('ws-body');
  const promptOut = document.getElementById('prompt-output');

  let wrap = document.getElementById('prompt-loading-wrap');
  if (wrap) wrap.remove();

  wrap = document.createElement('div');
  wrap.id = 'prompt-loading-wrap';
  wrap.className = 'prompt-loading-wrap';
  wrap.innerHTML = `
    <div class="prompt-loading-track"><div class="prompt-loading-fill" id="plf"></div></div>
    <div class="prompt-loading-txt" id="plt">Membaca data...</div>`;
  (promptOut?.parentNode || wsBody).insertBefore(wrap, promptOut);

  const fill = wrap.querySelector('#plf');
  const txt  = wrap.querySelector('#plt');
  const msgs = messages || ['Membaca data...', 'Menyusun instruksi...', 'Mengunci detail...', 'Finalisasi...'];

  const total = 4000 + Math.floor(Math.random() * 2001);
  const p1 = 48 + Math.floor(Math.random() * 17);
  const p2 = p1 + 14 + Math.floor(Math.random() * 12);
  const p3 = Math.min(p2 + 7 + Math.floor(Math.random() * 9), 95);
  const t1 = Math.floor(total * 0.28);
  const t2 = Math.floor(total * 0.27);
  const t3 = Math.floor(total * 0.30);
  const t4 = total - t1 - t2 - t3;

  function step(pct, dur, ease, msg) {
    fill.style.transition = `width ${dur}ms ${ease}`;
    fill.style.width = pct + '%';
    if (msg && txt) txt.textContent = msg;
  }

  requestAnimationFrame(() => step(p1, t1, 'cubic-bezier(0.22,1,0.36,1)', msgs[0]));
  setTimeout(() => step(p2, t2, 'cubic-bezier(0.4,0,0.6,1)',   msgs[1]), t1);
  setTimeout(() => step(p3, t3, 'cubic-bezier(0.65,0,0.35,1)', msgs[2]), t1 + t2);
  setTimeout(() => step(100, t4, 'cubic-bezier(0.22,1,0.36,1)', msgs[3]), t1 + t2 + t3);

  setTimeout(() => {
    wrap.style.opacity = '0';
    setTimeout(() => { wrap.remove(); onComplete(); }, 300);
  }, total + 100);
}

/* ════════════════════════════════════
   LAUNCH PLATFORM
════════════════════════════════════ */
function launchPlatform(platform) {
  if (!generatedPrompt) { showToast('Generate prompt terlebih dahulu.', 'error'); return; }
  const url = PLATFORM_URLS[platform];
  if (!url) return;
  const labels = { claude: 'Claude', gemini: 'Gemini', chatgpt: 'ChatGPT' };
  const label = labels[platform] || platform;
  navigator.clipboard.writeText(generatedPrompt)
    .then(() => {
      const isUndanganMod = typeof currentModDok !== 'undefined' && currentModDok &&
        ['undangan_nikah','undangan_khitanan','undangan_aqiqah','undangan_ultah'].includes(currentModDok);
      const tipMsg = currentMode !== 'dokumen'
        ? `Prompt tersalin! Upload foto di ${label}, lalu paste prompt.`
        : platform === 'claude'
          ? `Prompt tersalin! Paste ke Claude — minta output DOCX, PDF, atau HTML siap cetak.`
          : isUndanganMod
            ? `Prompt tersalin! Paste ke ${label} dan generate gambar desain undangan.`
            : `Prompt tersalin! Paste ke ${label} untuk output berupa gambar / desain dokumen.`;
      showToast(tipMsg, 'success');
      const sl = document.getElementById('wss-launch');
      if (sl) { sl.classList.remove('ws-step--active'); sl.classList.add('ws-step--done'); }
      setTimeout(() => window.open(url, '_blank'), 400);
    })
    .catch(() => window.open(url, '_blank'));
}

/* ════════════════════════════════════
   COPY PROMPT
════════════════════════════════════ */
function copyPrompt() {
  if (!generatedPrompt) return;
  navigator.clipboard.writeText(generatedPrompt)
    .then(() => {
      showToast('Prompt tersalin ke clipboard!', 'success');
      const btn = document.querySelector('.btn-copy-prompt');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Tersalin!';
        btn.classList.add('copy-flash');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copy-flash'); }, 2000);
      }
    })
    .catch(() => showToast('Gagal menyalin — coba salin teks manual.', 'error'));
}

/* ════════════════════════════════════
   SHARE WHATSAPP
════════════════════════════════════ */
function shareToWhatsApp() {
  if (!generatedPrompt) return;
  let label = 'Prompt';
  try {
    if (currentMode === 'foto' && typeof MODS !== 'undefined' && currentMod) {
      label = MODS[currentMod]?.title || 'Foto';
    } else if (currentMode === 'dokumen' && typeof MODS_DOK !== 'undefined' && currentModDok) {
      label = MODS_DOK[currentModDok]?.title || 'Dokumen';
    }
  } catch(e) {}
  const icon = currentMode === 'dokumen' ? '📄' : '📸';
  const msg = `${icon} *${label}* — dari Toko Prestasi:\n\n${generatedPrompt}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ════════════════════════════════════
   HELPER
════════════════════════════════════ */
function getColorName(hex) {
  const map = {
    '#FF0000': 'red', '#FFD700': 'yellow', '#0000FF': 'blue', '#FFFFFF': 'white',
    '#808080': 'gray', '#000080': 'navy blue', '#2D5A27': 'dark green'
  };
  return map[hex?.toUpperCase()] || hex;
}

/* ════════════════════════════════════
   STUBS — legacy refs
════════════════════════════════════ */
function bukaModalApiKey() {}
function tutupModalApiKey() {}
function tutupModalApiKeyLuar() {}
function toggleShowApiKey() {}
function simpanApiKey() {}
function hapusApiKey() {}
function syncConfig() {}

/* ════════════════════════════════════
   PROMPT HISTORY (localStorage)
════════════════════════════════════ */
const HISTORY_KEY = 'fp_prompt_history';
const HISTORY_MAX = 5;

function saveToHistory(modKey, title, prompt) {
  const mode = currentMode;
  let hist = getHistory();
  hist = hist.filter(h => !(h.mode === mode && h.modKey === modKey));
  hist.unshift({ mode, modKey, title, prompt, ts: Date.now() });
  if (hist.length > HISTORY_MAX) hist = hist.slice(0, HISTORY_MAX);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(hist)); } catch(e) {}
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch(e) { return []; }
}

function clearHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch(e) {}
  renderHistoryPanel();
  showToast('Riwayat prompt dihapus.', 'success');
}

function restoreFromHistory(idx) {
  const hist = getHistory();
  const entry = hist[idx];
  if (!entry) return;
  const restoredPrompt = entry.prompt;
  if (entry.mode !== currentMode) switchMode(entry.mode);
  if (entry.mode === 'foto') {
    if (typeof setMod === 'function') setMod(entry.modKey);
  } else {
    if (typeof setModDok === 'function') setModDok(entry.modKey);
  }
  setTimeout(() => {
    generatedPrompt = restoredPrompt;
    const promptText  = document.getElementById('prompt-text');
    const outputPanel = document.getElementById('prompt-output');
    const actionsWrap = document.getElementById('result-actions-wrap');
    if (promptText)  promptText.textContent = restoredPrompt;
    if (outputPanel) outputPanel.style.display = '';
    if (actionsWrap) actionsWrap.style.display = '';
    document.getElementById('wss-atur')?.classList.replace('ws-step--active', 'ws-step--done');
    document.getElementById('wss-gen')?.classList.add('ws-step--done');
    document.getElementById('wss-launch')?.classList.add('ws-step--active');
    renderHistoryPanel();
    showToast('Prompt dipulihkan dari riwayat.', 'success');
  }, 250);
}

function renderHistoryPanel() {
  const container = document.getElementById('history-panel');
  if (!container) return;
  const hist = getHistory();
  if (!hist.length) { container.style.display = 'none'; return; }
  container.style.display = '';
  const modeIcon = { foto: '📸', dokumen: '📄' };
  const rows = hist.map((h, i) => {
    const t = new Date(h.ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const preview = h.prompt.slice(0, 90).replace(/[\n\r]+/g, ' ') + '…';
    return `<div class="hist-row">
      <div class="hist-meta">${modeIcon[h.mode] || '📝'} <strong>${h.title}</strong><span class="hist-time">${t}</span></div>
      <div class="hist-preview">${preview}</div>
      <button class="btn-hist-restore" onclick="restoreFromHistory(${i})">Pakai Lagi</button>
    </div>`;
  }).join('');
  container.innerHTML = `<div class="hist-header"><span>⏱ Riwayat Prompt</span><button class="btn-hist-clear" onclick="clearHistory()">Hapus Semua</button></div>${rows}`;
}

/* ════════════════════════════════════
   DOWNLOAD PROMPT
════════════════════════════════════ */
function downloadPrompt() {
  if (!generatedPrompt) return;
  let label = 'prompt';
  try {
    if (currentMode === 'foto' && typeof MODS !== 'undefined' && currentMod)
      label = (MODS[currentMod]?.title || 'foto').toLowerCase().replace(/[\s/]+/g, '-');
    else if (currentMode === 'dokumen' && typeof MODS_DOK !== 'undefined' && currentModDok)
      label = (MODS_DOK[currentModDok]?.title || 'dokumen').toLowerCase().replace(/[\s/]+/g, '-');
  } catch(e) {}
  const now = new Date();
  const d = now.getFullYear() + ('0'+(now.getMonth()+1)).slice(-2) + ('0'+now.getDate()).slice(-2);
  const filename = `prompt-${label}-${d}.txt`;
  const blob = new Blob([generatedPrompt], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Disimpan: ' + filename, 'success');
}

/* ════════════════════════════════════
   KEYBOARD SHORTCUTS
════════════════════════════════════ */
document.addEventListener('keydown', function(e) {
  // Secret: Ctrl+Shift+T — dev theme preview panel
  if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'T') {
    e.preventDefault();
    const toggle = () => {
      _buildDevThemePanel();
      document.getElementById('dev-theme-panel')?.classList.toggle('show');
    };
    if (!_themesData) { loadEventTheme().then(toggle); } else { toggle(); }
    return;
  }
  if (e.key === 'Escape') {
    if (document.getElementById('workspace')?.classList.contains('show')) {
      if (currentMode === 'foto') { if (typeof goWelcome === 'function') goWelcome(); }
      else { if (typeof goWelcomeDok === 'function') goWelcomeDok(); }
    }
    return;
  }
  if (e.key === 'Enter' && !e.shiftKey) {
    const tag = document.activeElement?.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT' || tag === 'BUTTON') return;
    if (!document.getElementById('workspace')?.classList.contains('show')) return;
    const btn = document.querySelector('.btn-proses:not([disabled])');
    if (btn) { e.preventDefault(); btn.click(); }
  }
});
