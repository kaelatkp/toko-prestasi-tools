/* ════════════════════════════════════
   APP-SCREENSAVER.JS — Idle Screensaver
   Tema: sistem operasi, data stream, matrix
   Idle 1 menit → screensaver tampil
   Call: initScreensaver() setelah DOM ready
════════════════════════════════════ */

function initScreensaver() {
  const IDLE_LIMIT = 60 * 1000;
  const IDLE_WARN  = 40 * 1000;
  let lastActive = Date.now();
  let ssActive = false;
  let rafId = 0;
  let ivals = [];

  /* ── Idle UI update ── */
  const dot   = document.getElementById('idle-dot');
  const label = document.getElementById('idle-label');

  setInterval(() => {
    const elapsed = Date.now() - lastActive;
    const secs = Math.floor(elapsed / 1000);
    if (elapsed < IDLE_WARN) {
      if (dot) dot.className = 'idle-dot';
      if (label) label.textContent = 'Aktif';
    } else if (elapsed < IDLE_LIMIT) {
      if (dot) dot.className = 'idle-dot warn';
      const rem = Math.ceil((IDLE_LIMIT - elapsed) / 1000);
      if (label) label.textContent = 'Idle ' + secs + 'd — SS ' + rem + 'd';
    } else {
      if (dot) dot.className = 'idle-dot danger';
      if (label) label.textContent = 'Screensaver';
    }
    if (!ssActive && Date.now() - lastActive >= IDLE_LIMIT) showSS();
  }, 1000);

  ['mousemove','mousedown','keydown','scroll','touchstart','click','wheel']
    .forEach(ev => document.addEventListener(ev, resetTimer, { passive: true }));

  function resetTimer() { lastActive = Date.now(); if (ssActive) hideSS(); }

  /* ── Character / message pools ── */
  const RAIN_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEF░▒▓│┼╔╗╚╝═║›‹→←⊕⊗∴∵∩∪';
  const RAIN_WORDS = ['foto','dok ','pmt ','bcd ','wjh ','rule','api ','llm ','fn()','let ','var ','null','init','sync','load','true'];
  const TERM_MSGS = [
    '> system.startup: COMPLETE',
    '> modul_foto[25]: all loaded [OK]',
    '> wajah_lock: ENABLED — identitas aman',
    '> modul_dokumen[28]: all loaded [OK]',
    '> barcode_engine: CODE128A v3.11 [READY]',
    '> prompt_engine: v2.3 [ACTIVE]',
    '> crop_rule: +15% canvas expansion ON',
    '> zero_api_mode: billing=false quota=false',
    '> nexus_forge.build: PASSING',
    '> clipboard.api: navigator.clipboard [READY]',
    '> platform.claude.ai: [CONNECTED]',
    '> platform.gemini.google: [CONNECTED]',
    '> platform.chatgpt.com: [CONNECTED]',
    '> session.idle: monitoring active',
    '> modul.pasfoto: WAJAH_RULE loaded',
    '> modul.enhance: damage profiles loaded',
    '> modul.background: 6 presets active',
    '> dokumen.lamaran: ultra_analysis ON',
    '> dokumen.cv: html_template READY',
    '> integrity.check: all modules PASS',
    '> toko_prestasi.status: ONLINE',
    '> alamat: Jl. Poros Sp 4, Kongbeng, Kutai-Timur',
    '> operasional: 07:00 - 21:00 WIB',
    '> developer: Nexus Forge Team',
    '> mem.allocation: optimal',
    '> render.engine: RequestAnimationFrame ACTIVE',
    '> fonts: Sora + DM Mono loaded',
    '> storage: localStorage READY',
    '> sys.uptime: running...',
  ];
  const TERM_MSGS_OFFLINE = [
    '> net.ping 8.8.8.8: Request Timeout (RTO)',
    '> net.ping 8.8.8.8: Destination Host Unreachable',
    '> route.check: No default gateway found',
    '> dns.resolve: Server timeout — NXDOMAIN',
    '> connection.status: OFFLINE / NO ROUTE',
    '> watchdog.net: retry... [FAILED]',
    '> platform.claude.ai: [UNREACHABLE]',
    '> platform.gemini.google: [UNREACHABLE]',
    '> platform.chatgpt.com: [UNREACHABLE]',
    '> net.link: cable detected, no internet route',
    '> isp.status: menunggu koneksi pulih...',
    '> net.reconnect: attempt #1... [TIMEOUT]',
    '> sys.status: sistem lokal OK — internet DOWN',
    '> net.watchdog: monitoring koneksi setiap 5s',
  ];
  const FLOAT_FRAGS = [
    '📸 pasfoto','✨ enhance','🎨 colorize','🖼️ restore',
    '📦 foto_produk','💑 foto_couple','🎓 foto_wisuda','🏷️ barcode',
    '📄 lamaran','📋 cv_template','📝 surat_izin','🤝 perjanjian',
    'buildPrompt()','renderWorkspace()','WAJAH_RULE','CROP_RULE',
    'applyPreset()','generatePrompt()','initGroups()',
    'claude.ai','gemini.google','chatgpt.com',
    '✓ ZERO API','✓ NO QUOTA','✓ OFFLINE READY',
    'Nexus Forge','v2.3','CODE128A',
    '25 Modul Foto','28 Dokumen',
  ];
  const STATUS_ITEMS = [
    ['SISTEM ONLINE', '#00C853', 0.8],
    ['ZERO API MODE', '#00e676', 1.0],
    ['WAJAH LOCK ON', '#00C853', 0.7],
    ['PROMPT ENGINE', '#00e676', 0.9],
    ['NEXUS FORGE  ', '#00b853', 0.7],
  ];

  /* ── CSS injection ── */
  if (!document.getElementById('ss-keyframes')) {
    const s = document.createElement('style');
    s.id = 'ss-keyframes';
    s.textContent = `
      @keyframes ss-pulse {0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.65)}}
      @keyframes ss-float {
        0%  {transform:translate(0,0) rotate(0deg)}
        20% {transform:translate(7px,-11px) rotate(.4deg)}
        45% {transform:translate(-9px,8px) rotate(-.5deg)}
        70% {transform:translate(11px,5px) rotate(.3deg)}
        100%{transform:translate(0,0) rotate(0deg)}
      }
      @keyframes ss-blink {0%,100%{opacity:1} 50%{opacity:0}}
      @keyframes ss-slidein {from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)}}
      @keyframes ss-scanline {0%{top:0} 100%{top:100%}}
      @keyframes ss-code-scroll {from{transform:translateY(0)} to{transform:translateY(-50%)}}
    `;
    document.head.appendChild(s);
  }

  /* ── DOM references ── */
  const ss = document.getElementById('fp-screensaver');
  if (!ss) return;

  let canvas, ctx, columns = [];
  let scanEl, termBody, termIdx = 0, termLineEls = [];
  let hexEl, clockEl, netPillEl, netPillDot, centerErrEl;
  let frameCount = 0;
  let scanYPos = 0;
  let lastNetStatus = null;

  /* ── Helpers ── */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function rndI(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
  function randHex(n) { let s=''; for(let i=0;i<n;i++) s+='0123456789ABCDEF'[rndI(0,15)]; return s; }
  function pickChar() {
    if (Math.random() < 0.12) return RAIN_WORDS[rndI(0, RAIN_WORDS.length-1)];
    return RAIN_CHARS[rndI(0, RAIN_CHARS.length-1)];
  }

  /* ══ Layer 1: Code-typing scrolling background ══ */
  const SS_CODE = [
    '// Toko Prestasi Tools v2.3 — Nexus Forge',
    'import { FotoModule } from "./modules/foto";',
    'const WAJAH_RULE = { strict: true, version: "2.1" };',
    'function generatePrompt(config) {',
    '  const { preset, options } = config;',
    '  return engine.render(preset, options);',
    '}',
    'class PromptEngine {',
    '  constructor(mods) { this.mods = mods; }',
    '  run(input) { return this.applyRules(input); }',
    '}',
    'await fotoEngine.initialize();',
    'const modules = { foto: 25, dokumen: 28 };',
    'barcode.generate({ type: "CODE128A" });',
    'initGroups(); loadPresets();',
    'navigator.clipboard.writeText(result);',
    '// Build: PASSING | Tests: OK',
    'platforms.forEach(p => checkConnection(p));',
    'requestAnimationFrame(updateDisplay);',
    'if (!apiKey) console.log("Zero API ON");',
    'preset.chips.forEach(c => renderChip(c));',
    'const v = smoothstep(progress);',
    'localStorage.setItem("visited", "1");',
    'export default applyPreset;',
    '// modul.pasfoto: WAJAH_RULE loaded',
    '> session.idle: monitoring active',
    '> integrity.check: all modules PASS',
    'dokEngine.autoFill({ tanggal: now });',
    'renderWorkspace(); switchMode(mode);',
  ];
  function initCodeBg() {
    const bg = document.createElement('div');
    bg.style.cssText = 'position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none;';
    const offline = (window._netStatus === 'error');
    const COL_W = 270, numCols = Math.ceil(window.innerWidth / COL_W) + 1;
    for (let c = 0; c < numCols; c++) {
      const col = document.createElement('div');
      const left = c * COL_W + (c % 2 ? -35 : 0);
      const topOff = -Math.floor(Math.random() * 400);
      col.style.cssText = `position:absolute;left:${left}px;top:${topOff}px;width:${COL_W}px;font-family:'DM Mono',monospace;font-size:10px;line-height:16px;white-space:nowrap;overflow:hidden;`;
      const shuffled = [...SS_CODE].sort(() => Math.random() - 0.5);
      shuffled.forEach(line => {
        const el = document.createElement('div');
        const alpha = (0.09 + Math.random() * 0.14).toFixed(3);
        el.style.color = offline ? `rgba(248,113,113,${alpha})` : `rgba(0,200,83,${alpha})`;
        el.textContent = line;
        col.appendChild(el);
      });
      bg.appendChild(col);
    }
    ss.appendChild(bg);
  }

  /* ══ Layer 2: Scan line ══ */
  function initScan() {
    scanEl = document.createElement('div');
    const offline = (window._netStatus === 'error');
    const scanColor = offline ? 'rgba(248,80,80,0.5)' : 'rgba(0,200,83,0.5)';
    scanEl.style.cssText = `position:absolute;left:0;right:0;height:2px;top:0;background:linear-gradient(90deg,transparent 5%,${scanColor} 50%,transparent 95%);pointer-events:none;z-index:12;`;
    ss.appendChild(scanEl);
  }

  /* ══ Layer 3: Status pills top-left ══ */
  function initStatus() {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;top:20px;left:20px;display:flex;flex-direction:column;gap:5px;z-index:30;pointer-events:none;';
    STATUS_ITEMS.forEach(([txt, color, glow], i) => {
      const p = document.createElement('div');
      p.style.cssText = `display:flex;align-items:center;gap:8px;background:rgba(2,12,6,0.85);border:1px solid rgba(0,200,83,0.28);border-radius:6px;padding:4px 12px;font-family:"DM Mono",monospace;font-size:9px;color:${color};letter-spacing:1.5px;opacity:0;transition:opacity .6s;text-shadow:0 0 8px ${color}${Math.floor(glow*64).toString(16)};`;
      p.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block;box-shadow:0 0 6px ${color};animation:ss-pulse ${0.7+i*0.18}s ease-in-out infinite;"></span>${txt}`;
      wrap.appendChild(p);
      setTimeout(() => { p.style.opacity = '1'; }, i * 320 + 300);
    });
    // Net status pill — dinamis, warna berubah sesuai koneksi
    const netIsErr = (window._netStatus === 'error');
    netPillEl = document.createElement('div');
    netPillEl.style.cssText = `display:flex;align-items:center;gap:8px;background:rgba(2,12,6,0.85);border:1px solid ${netIsErr ? 'rgba(248,113,113,0.35)' : 'rgba(0,200,83,0.28)'};border-radius:6px;padding:4px 12px;font-family:"DM Mono",monospace;font-size:9px;color:${netIsErr ? '#f87171' : '#00C853'};letter-spacing:1.5px;opacity:0;transition:opacity .6s,color .4s,border-color .4s;`;
    netPillDot = document.createElement('span');
    netPillDot.style.cssText = `width:6px;height:6px;border-radius:50%;background:${netIsErr ? '#f87171' : '#00C853'};display:inline-block;box-shadow:0 0 6px ${netIsErr ? '#f87171' : '#00C853'};animation:ss-pulse 1.1s ease-in-out infinite;flex-shrink:0;transition:background .4s;`;
    netPillEl.appendChild(netPillDot);
    netPillEl.appendChild(document.createTextNode(netIsErr ? 'NET  ERROR  ' : 'NET  ONLINE '));
    wrap.appendChild(netPillEl);
    setTimeout(() => { netPillEl.style.opacity = '1'; }, STATUS_ITEMS.length * 320 + 300);
    ss.appendChild(wrap);
  }

  function updateNetPill() {
    if (!netPillEl || !netPillDot) return;
    const err = (window._netStatus === 'error');
    if (err === lastNetStatus) return;
    lastNetStatus = err;
    const color = err ? '#f87171' : '#00C853';
    const border = err ? 'rgba(248,113,113,0.35)' : 'rgba(0,200,83,0.28)';
    netPillEl.style.color = color;
    netPillEl.style.borderColor = border;
    netPillDot.style.background = color;
    netPillDot.style.boxShadow = `0 0 6px ${color}`;
    // Update label text node
    const textNode = netPillEl.lastChild;
    if (textNode && textNode.nodeType === 3) textNode.nodeValue = err ? 'NET  ERROR  ' : 'NET  ONLINE ';
    // Flash effect saat transisi
    netPillEl.style.opacity = '0.4';
    setTimeout(() => { if (netPillEl) netPillEl.style.opacity = '1'; }, 180);
  }

  /* ══ Layer 4: Clock top-right ══ */
  function initClock() {
    clockEl = document.createElement('div');
    clockEl.style.cssText = 'position:absolute;top:20px;right:20px;font-family:"DM Mono",monospace;font-size:10px;color:rgba(0,200,83,0.45);text-align:right;z-index:30;pointer-events:none;line-height:2;letter-spacing:.8px;';
    ss.appendChild(clockEl);
    updateClock();
  }
  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const p = n => String(n).padStart(2,'0');
    const days = ['MIN','SEN','SEL','RAB','KAM','JUM','SAB'];
    const ms = String(now.getMilliseconds()).padStart(3,'0');
    clockEl.innerHTML = `${days[now.getDay()]} ${p(now.getDate())}/${p(now.getMonth()+1)}/${now.getFullYear()}<br><span style="font-size:22px;color:rgba(0,200,83,0.7);letter-spacing:3px;">${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}</span><br><span style="font-size:9px;color:rgba(0,200,83,0.3);">.${ms}</span>`;
  }

  /* ══ Layer 5: Terminal bottom-left ══ */
  function initTerminal() {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;bottom:80px;left:22px;width:430px;background:rgba(1,8,4,0.9);border:1px solid rgba(0,200,83,0.18);border-radius:12px;overflow:hidden;z-index:30;pointer-events:none;';
    const head = document.createElement('div');
    head.style.cssText = 'background:rgba(0,200,83,0.08);border-bottom:1px solid rgba(0,200,83,0.15);padding:7px 14px;display:flex;align-items:center;gap:10px;font-family:"DM Mono",monospace;font-size:8.5px;color:rgba(0,200,83,0.5);letter-spacing:2px;';
    head.innerHTML = '<span style="display:flex;gap:5px;flex-shrink:0;"><span style="width:9px;height:9px;border-radius:50%;background:#e74c3c;"></span><span style="width:9px;height:9px;border-radius:50%;background:#f39c12;"></span><span style="width:9px;height:9px;border-radius:50%;background:#00C853;animation:ss-pulse 1.1s ease-in-out infinite;box-shadow:0 0 5px #00C853;"></span></span>TOKO PRESTASI :: SYSTEM LOG';
    wrap.appendChild(head);
    const body = document.createElement('div');
    body.style.cssText = 'padding:9px 14px 6px;';
    termBody = body;
    wrap.appendChild(body);
    const cursor = document.createElement('div');
    cursor.style.cssText = 'padding:0 14px 9px;font-family:"DM Mono",monospace;font-size:11px;color:rgba(0,200,83,0.4);animation:ss-blink 1s step-end infinite;';
    cursor.textContent = '█';
    wrap.appendChild(cursor);
    ss.appendChild(wrap);
  }

  function addTermLine() {
    if (!termBody) return;
    // Saat offline: tampilkan error messages, diselingi sesekali status normal
    const pool = (window._netStatus === 'error')
      ? (Math.random() < 0.75 ? TERM_MSGS_OFFLINE : TERM_MSGS)
      : TERM_MSGS;
    const txt = pool[termIdx % pool.length]; termIdx++;
    const isErrLine = (window._netStatus === 'error') && pool === TERM_MSGS_OFFLINE;
    const lineColor = isErrLine ? 'rgba(248,113,113,0.82)' : 'rgba(0,200,83,0.72)';
    const el = document.createElement('div');
    el.style.cssText = `font-family:"DM Mono",monospace;font-size:10px;line-height:1.75;color:${lineColor};opacity:0;transform:translateY(3px);transition:opacity .28s,transform .28s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
    el.textContent = txt;
    termBody.appendChild(el);
    termLineEls.push(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1'; el.style.transform = 'translateY(0)';
    }));
    if (termLineEls.length > 6) {
      const old = termLineEls.shift();
      old.style.opacity = '0';
      setTimeout(() => old.remove(), 280);
    }
  }

  /* ══ Layer 6: Hex dump bottom-right ══ */
  function initHex() {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;bottom:80px;right:22px;width:320px;background:rgba(1,8,4,0.9);border:1px solid rgba(0,200,83,0.18);border-radius:12px;padding:10px 14px;z-index:30;pointer-events:none;';
    const head = document.createElement('div');
    head.style.cssText = 'font-family:"DM Mono",monospace;font-size:8px;color:rgba(0,200,83,0.4);letter-spacing:2px;margin-bottom:8px;';
    head.textContent = 'MEM DUMP :: PROMPT ENGINE v2.3';
    wrap.appendChild(head);
    hexEl = document.createElement('div');
    hexEl.style.cssText = 'font-family:"DM Mono",monospace;font-size:9px;color:rgba(0,200,83,0.5);line-height:1.8;letter-spacing:.6px;';
    wrap.appendChild(hexEl);
    ss.appendChild(wrap);
  }

  function updateHex() {
    if (!hexEl) return;
    const base = rndI(0x1000, 0xEFF0);
    let out = '';
    for (let r = 0; r < 8; r++) {
      const addr = (base + r * 16).toString(16).toUpperCase().padStart(4,'0');
      let bytes = '';
      for (let c = 0; c < 8; c++) bytes += randHex(2) + ' ';
      const ascii = Array.from({length:8}, () => {
        const c = rndI(33, 126);
        return String.fromCharCode(c).replace(/[<>&]/g,'.');
      }).join('');
      out += `<span style="color:rgba(0,200,83,0.25)">${addr}</span>  ${bytes} <span style="color:rgba(0,200,83,0.3)">${ascii}</span><br>`;
    }
    hexEl.innerHTML = out;
  }

  /* ══ Layer 7: Floating fragments ══ */
  function initFragments() {
    FLOAT_FRAGS.forEach(text => {
      const el = document.createElement('div');
      const size = rnd(9, 13.5);
      const alpha = rnd(0.06, 0.2);
      const dur = rnd(10, 20);
      const delay = rnd(-15, 0);
      el.style.cssText = `position:absolute;font-family:"DM Mono",monospace;font-size:${size}px;color:rgba(0,200,83,${alpha});pointer-events:none;white-space:nowrap;left:${rnd(5,82)}%;top:${rnd(10,78)}%;animation:ss-float ${dur}s ease-in-out ${delay}s infinite;z-index:8;`;
      el.textContent = text;
      ss.appendChild(el);
    });
  }

  /* ══ Layer 8: Data stream columns ══ */
  function initDataStreams() {
    for (let i = 0; i < 4; i++) {
      const el = document.createElement('div');
      const leftPct = 22 + i * 18;
      const alpha = rnd(0.04, 0.10);
      el.style.cssText = `position:absolute;top:8%;left:${leftPct}%;width:2px;height:80%;z-index:6;pointer-events:none;overflow:hidden;`;
      const inner = document.createElement('div');
      let streamTxt = '';
      for (let j=0;j<80;j++) streamTxt += randHex(2) + (j%4===3 ? '\n' : ' ');
      inner.style.cssText = `font-family:"DM Mono",monospace;font-size:8px;color:rgba(0,200,83,${alpha});writing-mode:vertical-rl;text-orientation:mixed;animation:ss-float ${14+i*5}s linear ${-i*4}s infinite;white-space:pre;`;
      inner.textContent = streamTxt;
      el.appendChild(inner);
      ss.appendChild(el);
    }
  }

  /* ══ Layer 9: Center info block ══ */
  function initCenterInfo() {
    const offline = (window._netStatus === 'error');
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;z-index:15;pointer-events:none;';
    if (offline) {
      el.innerHTML = `
        <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(248,113,113,0.25);letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;">Toko Prestasi Tools</div>
        <div style="font-size:52px;opacity:.12;animation:ss-float 8s ease-in-out infinite;">📡</div>
        <div style="font-family:'DM Mono',monospace;font-size:11px;color:rgba(248,113,113,0.3);letter-spacing:2px;margin-top:14px;">KONEKSI TERPUTUS</div>
        <div style="font-family:'DM Mono',monospace;font-size:8px;color:rgba(248,113,113,0.15);letter-spacing:1.5px;margin-top:6px;">Sistem lokal aktif — internet tidak tersedia</div>
        <div style="font-family:'DM Mono',monospace;font-size:8px;color:rgba(248,113,113,0.12);letter-spacing:1px;margin-top:4px;">Gerakkan mouse untuk lanjut</div>
      `;
    } else {
      el.innerHTML = `
        <div style="font-family:'DM Mono',monospace;font-size:10px;color:rgba(0,200,83,0.15);letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">Toko Prestasi Tools</div>
        <div style="font-size:52px;opacity:.08;animation:ss-float 12s ease-in-out infinite;">📸</div>
        <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(0,200,83,0.12);letter-spacing:2px;margin-top:12px;">Sistem Aktif • Gerakkan mouse untuk lanjut</div>
      `;
    }
    centerErrEl = el;
    ss.appendChild(el);
  }

  /* ══ Layer 10: Bottom watermark ══ */
  function initWatermark() {
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-family:"DM Mono",monospace;font-size:9px;color:rgba(0,200,83,0.28);letter-spacing:2.5px;text-transform:uppercase;white-space:nowrap;z-index:30;pointer-events:none;text-align:center;';
    el.innerHTML = '▸ &nbsp;TOKO PRESTASI &nbsp;·&nbsp; NEXUS FORGE &nbsp;·&nbsp; JL. POROS SP 4, KONGBENG, KUTAI-TIMUR &nbsp;·&nbsp; 07:00–21:00 &nbsp; ◂';
    ss.appendChild(el);
  }

  /* ══ RAF main loop ══ */
  function loop() {
    frameCount++;
    // Background handled by CSS animation — only update dynamic overlays here
    scanYPos = (scanYPos + 1.6) % window.innerHeight;
    if (scanEl) scanEl.style.top = scanYPos + 'px';
    if (frameCount % 55 === 0) updateClock();
    if (frameCount % 90 === 0) updateNetPill();
    rafId = requestAnimationFrame(loop);
  }

  /* ══ Show / Hide ══ */
  function showSS() {
    if (ssActive) return;
    ssActive = true;
    ss.innerHTML = '';
    ss.style.display = 'block';
    ss.style.background = '#000';
    frameCount = 0; scanYPos = 0; termLineEls = []; termIdx = 0;
    netPillEl = null; netPillDot = null; centerErrEl = null; lastNetStatus = null;

    initCodeBg();
    initScan();
    initStatus();
    initClock();
    initTerminal();
    initHex();
    initFragments();
    initDataStreams();
    initCenterInfo();
    initWatermark();

    updateHex();
    for (let i = 0; i < 5; i++) setTimeout(addTermLine, i * 140);

    ivals.push(setInterval(addTermLine, 820));
    ivals.push(setInterval(updateHex, 220));

    rafId = requestAnimationFrame(loop);
  }

  function hideSS() {
    if (!ssActive) return;
    ssActive = false;
    cancelAnimationFrame(rafId);
    ivals.forEach(clearInterval); ivals = [];
    ss.style.display = 'none';
    ss.innerHTML = '';
    canvas = null; ctx = null; columns = []; // legacy refs cleared
    scanEl = null; termBody = null; hexEl = null; clockEl = null;
    netPillEl = null; netPillDot = null; centerErrEl = null;
  }
}
