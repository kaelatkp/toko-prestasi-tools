/* ════════════════════════════════════
   APP-CORE.JS — Shared State & Utilities
   Dimuat pertama sebelum app-foto.js & app-dokumen.js
════════════════════════════════════ */

/* ── SHARED STATE ── */
let currentMode    = 'foto';   // 'foto' | 'dokumen' | 'barcode'
let generatedPrompt = '';

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

  /* ══ FASE 1: Code-typing scrolling background ══ */
  const codeBg = document.getElementById('spl-code-bg');
  if (codeBg) {
    const CODE_LINES = [
      '// Toko Prestasi Tools v2.1 — Nexus Forge Team',
      'import { FotoModule } from "./modules/foto";',
      'import { DokumenModule } from "./modules/dokumen";',
      'const WAJAH_RULE = { strict: true, protect: "identity", version: "2.1" };',
      'const CROP_RULE  = { margin: "15%", removeWatermark: true };',
      'function generatePrompt(config) {',
      '  const { preset, options, mode } = config;',
      '  return engine.render(preset, options);',
      '}',
      'class PromptEngine {',
      '  constructor(modules) {',
      '    this.version = "2.1";',
      '    this.modules = modules;',
      '  }',
      '  generate(input) { return this.applyRules(input); }',
      '}',
      '// Modul Foto [25]: pasfoto, wisuda, couple, produk...',
      'const fotoEngine = new FotoModule({ rules: WAJAH_RULE });',
      'await fotoEngine.initialize();',
      '// Modul Dokumen [28]: surat, CV, nota, perjanjian...',
      'const dokEngine = new DokumenModule({ autoFill: true });',
      'export async function applyPreset(name, data) {',
      '  const preset = presets.find(p => p.name === name);',
      '  if (!preset) throw new Error("Preset not found");',
      '  return preset.transform(data);',
      '}',
      'const modules = { foto: 25, dokumen: 28, barcode: 1 };',
      'if (!process.env.API_KEY) { console.log("[OK] Zero API Mode"); }',
      'barcode.generate({ type: "CODE128A", data: item.code });',
      'initGroups(); loadPresets(); renderWorkspace();',
      'navigator.clipboard.writeText(promptResult);',
      'localStorage.setItem("tp_tools_visited", "1");',
      'document.querySelector(".workspace").classList.add("show");',
      '// Build: PASSING | Modules: OK | Deploy: READY',
      'const platforms = ["claude.ai", "gemini.google", "chatgpt.com"];',
      'platforms.forEach(p => checkConnection(p));',
      'function smoothstep(t) { return t * t * (3 - 2 * t); }',
      'requestAnimationFrame(updateDisplay);',
      'preset.chips.forEach(chip => renderChip(chip, container));',
      'if (wajahRule.active) protectIdentity(subject);',
      'const result = await promptEngine.run(selectedPreset);',
    ];
    function lineColor(l) {
      const t = l.trim();
      if (t.startsWith('//') || t.startsWith('#')) return 'rgba(148,163,184,';
      if (t.includes('"') || t.includes("'"))       return 'rgba(251,191,36,';
      if (/^(import|export|const|let|function|class|async|await|if|return|new)\b/.test(t))
        return 'rgba(34,211,238,';
      return 'rgba(0,200,83,';
    }
    const COL_W = 300, numCols = Math.ceil(window.innerWidth / COL_W) + 1;
    for (let c = 0; c < numCols; c++) {
      const col = document.createElement('div');
      col.className = 'spl-code-col';
      const leftOff = c * COL_W + (c % 2 ? -40 : 0);
      const dur     = 28 + c * 6; // different speed per column
      col.style.left      = leftOff + 'px';
      col.style.width     = COL_W + 'px';
      col.style.animation = `spl-code-scroll ${dur}s linear infinite`;
      // Two copies for seamless CSS loop
      for (let rep = 0; rep < 2; rep++) {
        const shuffled = [...CODE_LINES].sort(() => Math.random() - 0.5);
        shuffled.forEach(line => {
          const el = document.createElement('div');
          const alpha = (0.04 + Math.random() * 0.1).toFixed(2);
          el.style.color   = lineColor(line) + alpha + ')';
          el.style.overflow = 'hidden';
          el.textContent   = line;
          col.appendChild(el);
        });
      }
      codeBg.appendChild(col);
    }
    window._cancelSplashRain = () => {}; // CSS animation, nothing to cancel
  }

  /* ══ FASE 2: BIOS Pre-boot sequence ══ */
  const BIOS = [
    { t: 'sep',    s: '══════════════════════════════════════════════════════════════' },
    { t: 'bright', s: '  TOKO PRESTASI TOOLS  ::  BIOS v2.1  (C) 2024 NEXUS FORGE TEAM' },
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
    { t: 'bright', s: '  PROMPT ENGINE v2.1 : ████████████████████ LOADED' },
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

    // Rotating ads
    const ADS = [
      '[ SYS ] WAJAH_RULE aktif — identitas wajah terlindungi 100% di setiap proses',
      '[ MOD ] 25 modul foto — pasfoto, wisuda, couple, produk, event & lebih banyak lagi',
      '[ MOD ] 28 dokumen ATK — surat, CV, nota, perjanjian, undangan, dan lainnya',
      '[ TOOL] Barcode CODE128A v3.11 — cetak label produk langsung A4 / F4',
      '[ NET ] Kompatibel: Claude AI · Gemini · ChatGPT — tidak perlu API key apapun',
      '[ SEC ] Zero API mode — tidak ada biaya tersembunyi, tidak ada batas kuota',
      '[ OPS ] Auto-fill tanggal & kota — hemat waktu di setiap pembuatan dokumen',
      '[ ENG ] Prompt engine v2.1 — output terstruktur dan konsisten setiap generate',
      '[ RULE] CROP_RULE aktif — canvas margin +15% untuk crop watermark yang optimal',
      '[ LOC ] Jl. Poros Sp 4, Marga Mulia, Kongbeng, Kutai-Timur · Buka 07:00–21:00',
      '[ DEV ] Dibangun oleh Nexus Forge Team — hubungi: 0812-99-303-888',
      '[ TIP ] Setelah dapat hasil AI → download → crop sisi foto untuk hapus watermark',
      '[ SYS ] Semua prompt foto pakai WAJAH_RULE ultra-strict — identitas tidak berubah',
      '[ INFO] Foto dokumen: KTP · SIM · Paspor · SKCK · CPNS · KUA · Wisuda · Lamaran',
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
      ['BOOT', 'Menginisialisasi Toko Prestasi Tools v2.1...'],
      ['LOAD', 'Memuat komponen antarmuka utama...'],
      ['MOD ', 'Mendaftarkan 25 modul foto ke sistem...'],
      ['MOD ', 'Mendaftarkan 28 jenis dokumen ATK...'],
      ['RULE', 'Mengaktifkan WAJAH_RULE — proteksi identitas ON'],
      ['ENG ', 'Menginisialisasi prompt engine v2.1...'],
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
  const msg = `🐛 Bug Report — Toko Prestasi Tools\n\nModul: ${namaModul}\nVersi: v2.1\n\nDeskripsi bug:\n`;
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
