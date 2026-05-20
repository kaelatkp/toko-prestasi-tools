/* ═══════════════════════════════════════════
   app-cetak.js — Cetak Foto Prestasi Tools
   ═══════════════════════════════════════════ */

/* ── PRESET SIZES — sorted kecil → besar per group ── */
const ALL_SIZES = {
  // ── Pasfoto / ID ──
  '2x3':      { label: '2×3',        wMM: 20,    hMM: 30  },
  '3x4':      { label: '3×4',        wMM: 30,    hMM: 40  },
  '4x6':      { label: '4×6',        wMM: 40,    hMM: 60  },
  // ── Dokumen Khusus ──
  'ktpsim':   { label: 'KTP/SIM',    wMM: 85.6,  hMM: 54  },  // landscape, ISO 7810
  'kartunama':{ label: 'Kartu Nama', wMM: 90,    hMM: 55  },  // landscape, bisnis
  'stnk':     { label: 'STNK',       wMM: 230,   hMM: 75  },  // landscape, standar Indonesia
  // ── Foto R-Size ──
  '2r':       { label: '2R',         wMM: 64,    hMM: 89  },
  '3r':       { label: '3R',         wMM: 89,    hMM: 127 },
  'postcard': { label: 'Postcard',   wMM: 100,   hMM: 148 },
  '4r':       { label: '4R',         wMM: 102,   hMM: 152 },
  '5r':       { label: '5R',         wMM: 127,   hMM: 178 },
  '6r':       { label: '6R',         wMM: 152,   hMM: 203 },
  '8r':       { label: '8R',         wMM: 203,   hMM: 254 },
  '8r+':      { label: '8R+',        wMM: 203,   hMM: 305 },
  '10r':      { label: '10R',        wMM: 254,   hMM: 305 },
  '10r+':     { label: '10R+',       wMM: 254,   hMM: 381 },
  // ── Kertas Standar ──
  'a5':       { label: 'A5',         wMM: 148,   hMM: 210 },
  'a4':       { label: 'A4',         wMM: 210,   hMM: 297 },
  'f4':       { label: 'F4',         wMM: 215,   hMM: 330 },
};

const PAPER_SIZES = {
  'A4':  { w: 210, h: 297, label: 'A4 — 210×297mm' },
  'F4':  { w: 215, h: 330, label: 'F4 — 215×330mm' },
};
const PAPER_MARGIN_MM = 3;
function getPaperW() { return PAPER_SIZES[printSettings.paperSize]?.w || 210; }
function getPaperH() { return PAPER_SIZES[printSettings.paperSize]?.h || 297; }

/* ── PRINT SETTINGS ── */
const printSettings = {
  gap: 2,
  fillMode: 'fill',
  autoRotate: false,
  cellBorder: false,
  cutLines: true,
  paperSize: 'A4',
};

/* ── GRID MODE STATE ── */
let cetakMode = 'ukuran'; // 'ukuran' | 'grid'
const gridSettings = { cols: 2, rows: 2 };

/* ── STATE ── */
const state = {
  originalImage: null,
  rotate: 0,        // 0 | 90 | 180 | 270
  angle: 0,         // fine -15..+15
  brightness: 0,    // -100..100
  contrast: 0,      // -100..100
  saturation: 0,    // -100..100
  centerGuideX: 0.5,// 0..1 posisi garis tengah
  flipH: false,
  displayScale: 1,
  selectedSize: null,   // { label, wMM, hMM }
  isLandscape: false,   // portrait (default) or landscape
  cropBox: null,        // { x, y, w, h } in canvas CSS pixels
  croppedPending: null, // { dataURL, label, wMM, hMM }
  queue: [],            // [{ id, dataURL, label, wMM, hMM, qty }]
  drag: null,           // { mode: 'move'|corner, startX, startY, startBox }
  nextId: 1,
};

/* ── DOM REFS ── */
const $  = id => document.getElementById(id);
const importZone   = $('importZone');
const fileInput    = $('fileInput');
const canvasWrap   = $('canvasWrap');
const canvasEmpty  = $('canvasEmpty');
const canvas       = $('previewCanvas');
const ctx          = canvas.getContext('2d');
const cropOverlay  = $('cropOverlay');
const cropBox      = $('cropBox');
const canvasHint   = $('canvasHint');
const editSection   = $('editSection');
const sizeSection   = $('sizeSection');
const btnAddQueue   = $('btnAddQueue');
const btnPrint      = $('btnPrint');
const queueList     = $('queueList');
const queueEmpty    = $('queueEmpty');
const queueBadge    = $('queueBadge');
const btnClearQueue = $('btnClearQueue');
const toast         = $('toast');
// Edit modal
const editModalBackdrop = $('editModalBackdrop');
const editPreviewCanvas = $('editPreviewCanvas');
const editPreviewCtx    = editPreviewCanvas.getContext('2d');
let toastTimer;

/* ─────────────────────────────────── INIT ── */
(function init() {
  buildSizeChips();
  bindImport();
  bindEditModal();
  bindEditControls();
  bindSizeChips();
  bindCropDrag();
  bindQueueActions();
  bindPrintSettings();
  bindLayoutModal();
  bindGridControls();
})();

/* ── BUILD SIZE DROPDOWN — options sudah di HTML, tidak perlu inject ── */
function buildSizeChips() { /* no-op: dropdown options hardcoded di HTML */ }

/* ─────────────────────────────── IMPORT ── */
function bindImport() {
  importZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => {
    if (e.target.files[0]) loadFile(e.target.files[0]);
  });
  importZone.addEventListener('dragover', e => {
    e.preventDefault(); importZone.classList.add('dragover');
  });
  importZone.addEventListener('dragleave', () => importZone.classList.remove('dragover'));
  importZone.addEventListener('drop', e => {
    e.preventDefault(); importZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadFile(file);
  });
}

function loadFile(file) {
  if (file.size > 20 * 1024 * 1024) { showToast('File terlalu besar (maks 20MB)', 'red'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      state.originalImage = img;
      state.selectedSize = null;
      state.croppedPending = null;
      btnAddQueue.disabled = true;
      $('sizeSelect').value = '';
      $('customMmRow').style.display = 'none';
      $('customW').value = '';
      $('customH').value = '';
      resetEdit();
      showCanvas();
      drawCanvas();
      editSection.style.display = '';
      const modeToggle = $('modeCetakToggle');
      if (modeToggle) modeToggle.style.display = '';
      if (cetakMode === 'ukuran') {
        sizeSection.style.display = '';
      } else {
        // grid mode — auto-init crop box dengan rasio grid
        const cell = getGridCellSize();
        selectSize({ label: `1/${gridSettings.cols * gridSettings.rows} kertas`, wMM: cell.wMM, hMM: cell.hMM });
        updateGridInfo();
      }
      showToast('Foto dimuat ✓', 'green');
    };
    img.onerror = () => showToast('Gagal memuat foto — format tidak didukung atau file rusak', 'red');
    img.src = e.target.result;
  };
  reader.onerror = () => showToast('Gagal membaca file', 'red');
  reader.readAsDataURL(file);
}

function showCanvas() {
  canvasEmpty.style.display = 'none';
  canvasWrap.style.display = '';
}

/* ─────────────────────────────── DRAW CANVAS ── */
function drawCanvas() {
  const img = state.originalImage;
  if (!img) return;

  const { rotate, angle, flipH, brightness, contrast } = state;
  const isRot90 = rotate % 180 !== 0;
  const baseW = isRot90 ? img.height : img.width;
  const baseH = isRot90 ? img.width  : img.height;

  // Fit to available space
  const maxW = canvasWrap.parentElement.clientWidth  - 48;
  const maxH = canvasWrap.parentElement.clientHeight - 48;
  const fineRad = angle * Math.PI / 180;
  // Extra space for fine angle rotation
  const extra = Math.abs(Math.sin(fineRad)) * 0.15 + 1;
  const scale = Math.min(maxW / (baseW * extra), maxH / (baseH * extra)) * 0.92;

  canvas.width  = Math.round(baseW * scale);
  canvas.height = Math.round(baseH * scale);
  state.displayScale = scale;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (brightness !== 0 || contrast !== 0) {
    const b = (100 + brightness) / 100;
    const c = contrast >= 0
      ? (100 + contrast * 2) / 100
      : (100 + contrast) / 100;
    ctx.filter = `brightness(${b}) contrast(${c})`;
  } else {
    ctx.filter = 'none';
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotate + angle) * Math.PI / 180);
  if (flipH) ctx.scale(-1, 1);
  ctx.drawImage(img, -img.width * scale / 2, -img.height * scale / 2,
    img.width * scale, img.height * scale);
  ctx.restore();

  // Reposition crop box if active
  if (state.selectedSize && state.cropBox) {
    clampCropBox();
    renderCropBox();
  }
}

/* ─────────────────────────────── EDIT MODAL ── */
function bindEditModal() {
  // Open
  $('btnOpenEdit').addEventListener('click', openEditModal);
  // Close buttons
  $('btnModalClose').addEventListener('click', closeEditModal);
  $('btnModalDone').addEventListener('click',  closeEditModal);
  // Close on backdrop click
  editModalBackdrop.addEventListener('click', e => {
    if (e.target === editModalBackdrop) closeEditModal();
  });
  // Esc key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && editModalBackdrop.style.display !== 'none') closeEditModal();
  });
}

function openEditModal() {
  if (!state.originalImage) { showToast('Import foto dulu', 'red'); return; }
  editModalBackdrop.style.display = 'flex';
  drawEditPreview();
}

function closeEditModal() {
  editModalBackdrop.style.display = 'none';
}

function drawEditPreview() {
  const img = state.originalImage;
  if (!img) return;
  const { rotate, angle, flipH, brightness, contrast, saturation } = state;
  const isRot90 = rotate % 180 !== 0;
  const natW = isRot90 ? img.height : img.width;
  const natH = isRot90 ? img.width  : img.height;

  // Fit to preview area (max 680px), maintain aspect ratio
  const maxPx = 680;
  const scale = Math.min(maxPx / natW, maxPx / natH);
  editPreviewCanvas.width  = Math.round(natW * scale);
  editPreviewCanvas.height = Math.round(natH * scale);

  const W = editPreviewCanvas.width;
  const H = editPreviewCanvas.height;

  editPreviewCtx.clearRect(0, 0, W, H);

  // ── Draw image ──
  const b = (100 + brightness) / 100;
  const c = contrast >= 0 ? (100 + contrast * 2) / 100 : (100 + contrast) / 100;
  const s = (100 + saturation) / 100;
  editPreviewCtx.filter = (brightness !== 0 || contrast !== 0 || saturation !== 0)
    ? `brightness(${b}) contrast(${c}) saturate(${s})`
    : 'none';
  editPreviewCtx.save();
  editPreviewCtx.translate(W / 2, H / 2);
  editPreviewCtx.rotate((rotate + angle) * Math.PI / 180);
  if (flipH) editPreviewCtx.scale(-1, 1);
  editPreviewCtx.drawImage(img, -img.width * scale / 2, -img.height * scale / 2, img.width * scale, img.height * scale);
  editPreviewCtx.restore();

  // ── Grid overlay — rule of thirds ──
  editPreviewCtx.filter = 'none';
  editPreviewCtx.save();

  const thirdX1 = Math.round(W / 3);
  const thirdX2 = Math.round(W * 2 / 3);
  const thirdY1 = Math.round(H / 3);
  const thirdY2 = Math.round(H * 2 / 3);

  // Shadow hitam dulu (outline garis supaya kontras di foto terang)
  editPreviewCtx.strokeStyle = 'rgba(0,0,0,0.55)';
  editPreviewCtx.lineWidth = 2.5;
  editPreviewCtx.setLineDash([]);
  editPreviewCtx.beginPath();
  editPreviewCtx.moveTo(thirdX1, 0); editPreviewCtx.lineTo(thirdX1, H);
  editPreviewCtx.moveTo(thirdX2, 0); editPreviewCtx.lineTo(thirdX2, H);
  editPreviewCtx.moveTo(0, thirdY1); editPreviewCtx.lineTo(W, thirdY1);
  editPreviewCtx.moveTo(0, thirdY2); editPreviewCtx.lineTo(W, thirdY2);
  editPreviewCtx.stroke();

  // Garis putih di atas shadow
  editPreviewCtx.strokeStyle = 'rgba(255,255,255,0.75)';
  editPreviewCtx.lineWidth = 1;
  editPreviewCtx.beginPath();
  editPreviewCtx.moveTo(thirdX1 + 0.5, 0); editPreviewCtx.lineTo(thirdX1 + 0.5, H);
  editPreviewCtx.moveTo(thirdX2 + 0.5, 0); editPreviewCtx.lineTo(thirdX2 + 0.5, H);
  editPreviewCtx.moveTo(0, thirdY1 + 0.5); editPreviewCtx.lineTo(W, thirdY1 + 0.5);
  editPreviewCtx.moveTo(0, thirdY2 + 0.5); editPreviewCtx.lineTo(W, thirdY2 + 0.5);
  editPreviewCtx.stroke();

  // Outer border
  editPreviewCtx.strokeStyle = 'rgba(255,255,255,0.5)';
  editPreviewCtx.lineWidth = 1.5;
  editPreviewCtx.strokeRect(0.5, 0.5, W - 1, H - 1);

  // Titik persimpangan — shadow + isi
  [[thirdX1, thirdY1],[thirdX2, thirdY1],[thirdX1, thirdY2],[thirdX2, thirdY2]].forEach(([x, y]) => {
    // shadow dot
    editPreviewCtx.fillStyle = 'rgba(0,0,0,0.6)';
    editPreviewCtx.beginPath();
    editPreviewCtx.arc(x, y, 5.5, 0, Math.PI * 2);
    editPreviewCtx.fill();
    // white dot
    editPreviewCtx.fillStyle = 'rgba(255,255,255,0.95)';
    editPreviewCtx.beginPath();
    editPreviewCtx.arc(x, y, 3.5, 0, Math.PI * 2);
    editPreviewCtx.fill();
  });

  editPreviewCtx.restore();

  // ── Garis tengah draggable (cyan) ──
  const gx = Math.round(W * state.centerGuideX);
  editPreviewCtx.save();
  editPreviewCtx.setLineDash([6, 4]);
  // Shadow
  editPreviewCtx.strokeStyle = 'rgba(0,0,0,0.5)';
  editPreviewCtx.lineWidth = 3;
  editPreviewCtx.beginPath();
  editPreviewCtx.moveTo(gx, 0); editPreviewCtx.lineTo(gx, H);
  editPreviewCtx.stroke();
  // Garis cyan
  editPreviewCtx.strokeStyle = 'rgba(0, 220, 195, 0.95)';
  editPreviewCtx.lineWidth = 1.5;
  editPreviewCtx.beginPath();
  editPreviewCtx.moveTo(gx + 0.5, 0); editPreviewCtx.lineTo(gx + 0.5, H);
  editPreviewCtx.stroke();
  editPreviewCtx.setLineDash([]);
  // Handle di tengah (circle grab)
  editPreviewCtx.fillStyle = 'rgba(0,0,0,0.45)';
  editPreviewCtx.beginPath(); editPreviewCtx.arc(gx, H / 2, 11, 0, Math.PI * 2); editPreviewCtx.fill();
  editPreviewCtx.fillStyle = 'rgba(0, 220, 195, 1)';
  editPreviewCtx.beginPath(); editPreviewCtx.arc(gx, H / 2, 9, 0, Math.PI * 2); editPreviewCtx.fill();
  editPreviewCtx.fillStyle = '#fff';
  editPreviewCtx.font = 'bold 11px sans-serif';
  editPreviewCtx.textAlign = 'center';
  editPreviewCtx.textBaseline = 'middle';
  editPreviewCtx.fillText('⟺', gx, H / 2);
  editPreviewCtx.restore();
}

/* ─────────────────────────────── EDIT CONTROLS ── */
function bindEditControls() {
  $('btnRotateL').addEventListener('click', () => { state.rotate = (state.rotate - 90 + 360) % 360; redraw(); drawEditPreview(); });
  $('btnRotateR').addEventListener('click', () => { state.rotate = (state.rotate + 90) % 360; redraw(); drawEditPreview(); });
  $('btnFlipH').addEventListener('click',   () => { state.flipH = !state.flipH; redraw(); drawEditPreview(); });
  $('btnReset').addEventListener('click', resetEdit);
  $('btnResetGuide').addEventListener('click', () => { state.centerGuideX = 0.5; drawEditPreview(); });

  $('slAngle').addEventListener('input',    function() { state.angle      = +this.value; $('valAngle').textContent    = this.value + '°'; redraw(); drawEditPreview(); });
  $('slBright').addEventListener('input',   function() { state.brightness = +this.value; $('valBright').textContent   = this.value;       redraw(); drawEditPreview(); });
  $('slContrast').addEventListener('input', function() { state.contrast   = +this.value; $('valContrast').textContent = this.value;       redraw(); drawEditPreview(); });
  $('slSat').addEventListener('input',      function() { state.saturation = +this.value; $('valSat').textContent      = this.value;       redraw(); drawEditPreview(); });

  // ── Drag garis tengah ──
  let draggingGuide = false;
  const cvs = editPreviewCanvas;
  cvs.addEventListener('mousedown', e => {
    const rect = cvs.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (cvs.width / rect.width);
    const gx = cvs.width * state.centerGuideX;
    if (Math.abs(x - gx) <= 18) { draggingGuide = true; cvs.style.cursor = 'ew-resize'; }
  });
  cvs.addEventListener('mousemove', e => {
    const rect = cvs.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (cvs.width / rect.width);
    if (draggingGuide) {
      state.centerGuideX = Math.max(0.01, Math.min(0.99, x / cvs.width));
      drawEditPreview();
    } else {
      const gx = cvs.width * state.centerGuideX;
      cvs.style.cursor = Math.abs(x - gx) <= 18 ? 'ew-resize' : 'default';
    }
  });
  cvs.addEventListener('mouseup',    () => { draggingGuide = false; cvs.style.cursor = 'default'; });
  cvs.addEventListener('mouseleave', () => { draggingGuide = false; });
}

function resetEdit() {
  state.rotate = 0; state.angle = 0;
  state.brightness = 0; state.contrast = 0; state.saturation = 0; state.flipH = false;
  state.centerGuideX = 0.5;
  $('slAngle').value    = 0; $('valAngle').textContent    = '0°';
  $('slBright').value   = 0; $('valBright').textContent   = '0';
  $('slContrast').value = 0; $('valContrast').textContent = '0';
  $('slSat').value      = 0; $('valSat').textContent      = '0';
  if (state.originalImage) { redraw(); drawEditPreview(); }
}

function redraw() {
  drawCanvas();
  if (state.selectedSize) initCropBox(getEffectiveSize(), false);
}

/* ── Effective size (portrait / landscape) ── */
function getEffectiveSize() {
  if (!state.selectedSize) return null;
  const { label, wMM, hMM } = state.selectedSize;
  // Tentukan apakah perlu swap: isLandscape = user paksa landscape, atau ukuran natural landscape
  const naturalLandscape = wMM > hMM;
  const needSwap = state.isLandscape ? !naturalLandscape : naturalLandscape;
  if (!needSwap) return { label, wMM, hMM };
  return { label: label + ' ↔', wMM: hMM, hMM: wMM };
}

// Orientasi toggle sudah dihapus — smart orientation handle otomatis saat drag.
// Fungsi ini dipanggil setiap kali isLandscape berubah → update hint saja.
function updateOrientationUI() {
  const eff = getEffectiveSize();
  if (eff) setHint(`${eff.label}  ${eff.wMM}×${eff.hMM}mm — seret untuk atur posisi crop`);
}

/* ─────────────────────────────── SIZE DROPDOWN ── */
function bindSizeChips() {
  const sel      = $('sizeSelect');
  const customRow = $('customMmRow');

  sel.addEventListener('change', () => {
    const val = sel.value;
    if (!val) return;

    // Tampil/hidden custom row
    customRow.style.display = val === 'custom' ? '' : 'none';

    if (val === 'custom') {
      // Tunggu user isi manual, jangan langsung selectSize
      $('customW').focus();
      return;
    }

    const size = ALL_SIZES[val];
    if (size) selectSize(size);
  });

  $('btnCustomApply').addEventListener('click', () => {
    const w = parseFloat($('customW').value);
    const h = parseFloat($('customH').value);
    if (!w || !h || w < 5 || h < 5) { showToast('Masukkan ukuran valid (min 5mm)', 'red'); return; }
    selectSize({ label: `${w}×${h}mm`, wMM: w, hMM: h });
  });

  // Enter key di custom inputs → langsung apply
  [$('customW'), $('customH')].forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') $('btnCustomApply').click(); });
  });
}


/* ─────────────────────────────── GRID MODE ── */
function getGridCellSize() {
  const { cols, rows } = gridSettings;
  const GAP    = printSettings.gap;
  const margin = PAPER_MARGIN_MM;
  const pw     = getPaperW();
  const ph     = getPaperH();
  const cw     = (pw - margin * 2 - (cols - 1) * GAP) / cols;
  const ch     = (ph - margin * 2 - (rows - 1) * GAP) / rows;
  return { wMM: Math.round(cw * 10) / 10, hMM: Math.round(ch * 10) / 10 };
}

function updateGridInfo() {
  const { cols, rows } = gridSettings;
  const cell  = getGridCellSize();
  const total = cols * rows;
  const el    = $('gridInfoChip');
  if (el) el.innerHTML = `1/${total} kertas per foto  ·  ${cell.wMM} × ${cell.hMM}mm`;
}

function packGrid(items) {
  const { cols, rows } = gridSettings;
  const GAP    = printSettings.gap;
  const margin = PAPER_MARGIN_MM;
  const cellW  = (getPaperW() - margin * 2 - (cols - 1) * GAP) / cols;
  const cellH  = (getPaperH() - margin * 2 - (rows - 1) * GAP) / rows;
  const perPage = cols * rows;

  const pages = [];
  let pageItems = [];

  for (const item of items) {
    const idx  = pageItems.length;
    const col  = idx % cols;
    const row  = Math.floor(idx / cols);
    pageItems.push({
      item,
      x: margin + col * (cellW + GAP),
      y: margin + row * (cellH + GAP),
      w: cellW, h: cellH,
      rotated: false,
    });
    if (pageItems.length >= perPage) {
      pages.push(pageItems);
      pageItems = [];
    }
  }
  if (pageItems.length > 0) pages.push(pageItems);
  return pages;
}

function setCetakMode(mode) {
  cetakMode = mode;
  const btnUkuran = $('modeBtnUkuran');
  const btnGrid   = $('modeBtnGrid');
  const sizeSec   = $('sizeSection');
  const gridSec   = $('gridSection');

  if (mode === 'grid') {
    if (btnUkuran) btnUkuran.classList.remove('active');
    if (btnGrid)   btnGrid.classList.add('active');
    if (sizeSec)   sizeSec.style.display = 'none';
    if (gridSec)   gridSec.style.display = '';
    updateGridInfo();
    // Auto-init crop box dengan rasio grid cell jika sudah ada gambar
    if (state.originalImage) {
      const cell = getGridCellSize();
      selectSize({ label: `1/${gridSettings.cols * gridSettings.rows} kertas`, wMM: cell.wMM, hMM: cell.hMM });
    }
  } else {
    if (btnGrid)   btnGrid.classList.remove('active');
    if (btnUkuran) btnUkuran.classList.add('active');
    if (gridSec)   gridSec.style.display = 'none';
    if (sizeSec)   sizeSec.style.display = state.originalImage ? '' : 'none';
    // Reset crop jika ada gambar
    if (state.originalImage) {
      state.selectedSize = null;
      $('sizeSelect').value = '';
      cropBox.style.display = 'none';
      cropOverlay.classList.remove('active');
      btnAddQueue.disabled = true;
    }
  }
  scheduleLayoutPreview();
}

function bindGridControls() {
  const colsInput = $('gridCols');
  const rowsInput = $('gridRows');
  if (!colsInput || !rowsInput) return;

  function onGridChange() {
    const c = Math.max(1, Math.min(50, parseInt(colsInput.value) || 1));
    const r = Math.max(1, Math.min(50, parseInt(rowsInput.value) || 1));
    colsInput.value = c;
    rowsInput.value = r;
    gridSettings.cols = c;
    gridSettings.rows = r;
    updateGridInfo();
    if (state.originalImage && cetakMode === 'grid') {
      const cell = getGridCellSize();
      selectSize({ label: `1/${c * r} kertas`, wMM: cell.wMM, hMM: cell.hMM });
    }
    scheduleLayoutPreview();
  }

  colsInput.addEventListener('input', onGridChange);
  rowsInput.addEventListener('input', onGridChange);
  colsInput.addEventListener('change', onGridChange);
  rowsInput.addEventListener('change', onGridChange);
}

function selectSize(size) {
  if (!state.originalImage) { showToast('Import foto dulu', 'red'); return; }
  state.selectedSize = size;
  state.isLandscape  = false;  // reset ke natural orientation tiap ganti ukuran
  updateOrientationUI();
  initCropBox(getEffectiveSize(), true);
  setHint(`${size.label}  ${size.wMM}×${size.hMM}mm — seret untuk atur posisi crop`);
}

/* ─────────────────────────────── CROP BOX ── */
function initCropBox(size, center) {
  const cw = canvas.width;
  const ch = canvas.height;
  const ratio = size.wMM / size.hMM;

  let bw, bh;
  if (cw / ch > ratio) {
    bh = ch;
    bw = bh * ratio;
  } else {
    bw = cw;
    bh = bw / ratio;
  }

  if (center || !state.cropBox) {
    state.cropBox = {
      x: (cw - bw) / 2,
      y: (ch - bh) / 2,
      w: bw,
      h: bh,
    };
  } else {
    // keep position, update size to new ratio
    const old = state.cropBox;
    state.cropBox.w = bw;
    state.cropBox.h = bh;
    clampCropBox();
  }

  cropBox.style.display = '';
  cropOverlay.classList.add('active');
  renderCropBox();

  state.croppedPending = null;
  btnAddQueue.disabled = false;
}

function renderCropBox() {
  const { x, y, w, h } = state.cropBox;
  cropBox.style.left   = x + 'px';
  cropBox.style.top    = y + 'px';
  cropBox.style.width  = w + 'px';
  cropBox.style.height = h + 'px';
}

function clampCropBox() {
  const b = state.cropBox;
  const eff = getEffectiveSize();
  const ratio = eff ? eff.wMM / eff.hMM : b.w / b.h;
  const CW = canvas.width, CH = canvas.height;

  // 1. Cap SIZE — tidak boleh lebih besar dari canvas
  if (b.w > CW) { b.w = CW; b.h = b.w / ratio; }
  if (b.h > CH) { b.h = CH; b.w = b.h * ratio; }
  if (b.w > CW) { b.w = CW; b.h = b.w / ratio; } // re-check setelah h-clamp

  // 2. Cap POSISI — tidak boleh keluar dari tepi foto
  b.x = Math.max(0, Math.min(b.x, CW - b.w));
  b.y = Math.max(0, Math.min(b.y, CH - b.h));
}

/* ─────────────────────────────── CROP DRAG ── */
function bindCropDrag() {
  cropOverlay.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove',  onPointerMove);
  window.addEventListener('pointerup',    onPointerUp);
}

function onPointerDown(e) {
  if (!state.cropBox) return;
  e.preventDefault();

  const rect  = cropOverlay.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  const { x, y, w, h } = state.cropBox;

  // Check corner handles (16px hit area)
  const hit = 14;
  let corner = null;
  if (px >= x - hit && px <= x + hit     && py >= y - hit     && py <= y + hit)     corner = 'nw';
  if (px >= x+w-hit && px <= x+w+hit     && py >= y - hit     && py <= y + hit)     corner = 'ne';
  if (px >= x - hit && px <= x + hit     && py >= y+h-hit     && py <= y+h+hit)     corner = 'sw';
  if (px >= x+w-hit && px <= x+w+hit     && py >= y+h-hit     && py <= y+h+hit)     corner = 'se';
  // Top-center and bottom-center handles
  const mx = x + w / 2;
  if (!corner && px >= mx-hit && px <= mx+hit && py >= y-hit   && py <= y+hit)   corner = 'tc';
  if (!corner && px >= mx-hit && px <= mx+hit && py >= y+h-hit && py <= y+h+hit) corner = 'bc';

  // Check interior (move)
  const inside = px > x && px < x+w && py > y && py < y+h;

  if (!corner && !inside) return;

  cropOverlay.setPointerCapture(e.pointerId);
  state.drag = {
    mode: corner || 'move',
    startX: px, startY: py,
    startBox: { ...state.cropBox },
  };
}

function onPointerMove(e) {
  if (!state.drag) return;
  const rect = cropOverlay.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  const dx = px - state.drag.startX;
  const dy = py - state.drag.startY;
  const sb  = state.drag.startBox;
  const MIN = 30;
  let b = state.cropBox;
  const CW = canvas.width, CH = canvas.height;
  const mode = state.drag.mode;

  if (mode === 'move') {
    b.x = sb.x + dx;
    b.y = sb.y + dy;
    clampCropBox();

  } else {
    // ── SMART ORIENTATION RESIZE ──
    // 1. Raw unconstrained dimensions dari posisi cursor
    const rawW = Math.max(MIN, (mode === 'se' || mode === 'ne') ? sb.w + dx : sb.w - dx);
    const rawH = Math.max(MIN, (mode === 'se' || mode === 'sw') ? sb.h + dy : sb.h - dy);

    // 2. Auto-detect orientasi dari arah drag — rawW > rawH = landscape
    const goLandscape = rawW > rawH;
    if (goLandscape !== state.isLandscape) {
      state.isLandscape = goLandscape;
      updateOrientationUI();   // update tombol Portrait / Landscape
    }

    // 3. Ratio dari effective size setelah orientasi diupdate
    const eff   = getEffectiveSize();
    const ratio = eff.wMM / eff.hMM;  // >1 landscape, <1 portrait

    // 4. Dominant dimension mengikuti cursor, dimension lain snap ke ratio
    //    landscape → width dominan; portrait → height dominan (dikonversi ke nw)
    let nw = goLandscape ? rawW : rawH * ratio;
    nw = Math.max(MIN, nw);

    // 5. Hard-cap ke batas foto + set posisi corner
    if (mode === 'se') {
      nw = Math.min(nw, CW - sb.x, (CH - sb.y) * ratio);
      b.w = nw; b.h = nw / ratio;
      b.x = sb.x; b.y = sb.y;

    } else if (mode === 'sw') {
      nw = Math.min(nw, sb.x + sb.w, (CH - sb.y) * ratio);
      b.w = nw; b.h = nw / ratio;
      b.x = sb.x + sb.w - nw; b.y = sb.y;

    } else if (mode === 'ne') {
      nw = Math.min(nw, CW - sb.x, (sb.y + sb.h) * ratio);
      b.w = nw; b.h = nw / ratio;
      b.x = sb.x; b.y = sb.y + sb.h - b.h;

    } else if (mode === 'nw') {
      nw = Math.min(nw, sb.x + sb.w, (sb.y + sb.h) * ratio);
      b.w = nw; b.h = nw / ratio;
      b.x = sb.x + sb.w - nw; b.y = sb.y + sb.h - b.h;

    } else if (mode === 'tc' || mode === 'bc') {
      // Top/bottom center: resize by height, ratio locked, box stays centered horizontally
      const fixedRatio = sb.w / sb.h;
      const centerX = sb.x + sb.w / 2;
      const newH = Math.max(MIN, mode === 'tc' ? sb.h - dy : sb.h + dy);
      const newW = newH * fixedRatio;
      // Cap so box stays within canvas from center outward
      const maxWfromCenter = Math.min(centerX, CW - centerX) * 2;
      const cappedW = Math.min(newW, maxWfromCenter, CW);
      const cappedH = cappedW / fixedRatio;
      b.w = cappedW;
      b.h = cappedH;
      b.x = centerX - cappedW / 2;
      b.y = mode === 'tc' ? sb.y + sb.h - cappedH : sb.y;
      clampCropBox();
    }
  }

  renderCropBox();
}

function onPointerUp() {
  state.drag = null;
}

/* ─────────────────────────────── CROP EXTRACT ── */
function extractCrop() {
  const img = state.originalImage;
  const { rotate, angle, flipH, brightness, contrast, saturation, cropBox: cb, displayScale } = state;

  // Build high-res offscreen canvas (original image dimensions after rotation)
  const isRot90 = rotate % 180 !== 0;
  const outW = isRot90 ? img.height : img.width;
  const outH = isRot90 ? img.width  : img.height;

  const offCanvas = document.createElement('canvas');
  offCanvas.width  = outW;
  offCanvas.height = outH;
  const offCtx = offCanvas.getContext('2d');

  if (brightness !== 0 || contrast !== 0 || saturation !== 0) {
    const b = (100 + brightness) / 100;
    const c = contrast >= 0 ? (100 + contrast * 2) / 100 : (100 + contrast) / 100;
    const s = (100 + saturation) / 100;
    offCtx.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
  }

  // Same transform as display canvas but at full resolution
  const qs = 1 / displayScale; // quality scale
  offCtx.save();
  offCtx.translate(outW / 2, outH / 2);
  offCtx.rotate((rotate + angle) * Math.PI / 180);
  if (flipH) offCtx.scale(-1, 1);
  offCtx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
  offCtx.restore();

  // Extract crop at full resolution
  const cw = Math.round(cb.w * qs);
  const ch = Math.round(cb.h * qs);
  const cx = Math.round(cb.x * qs);
  const cy = Math.round(cb.y * qs);

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width  = cw;
  cropCanvas.height = ch;
  cropCanvas.getContext('2d').drawImage(offCanvas, cx, cy, cw, ch, 0, 0, cw, ch);

  return cropCanvas.toDataURL('image/jpeg', 0.95);
}

/* ─────────────────────────────── QUEUE ── */
function bindQueueActions() {
  btnAddQueue.addEventListener('click', addToQueue);
  btnPrint.addEventListener('click', packAndPrint);
  btnClearQueue.addEventListener('click', clearQueue);
}

function addToQueue() {
  if (cetakMode === 'grid') {
    if (!state.cropBox) return;
    const cell  = getGridCellSize();
    const dataURL = extractCrop();
    const { cols, rows } = gridSettings;
    const label = `1/${cols * rows} kertas (${cols}×${rows})`;
    const item  = { id: state.nextId++, dataURL, label, wMM: cell.wMM, hMM: cell.hMM, qty: 1, flipped: false, isGrid: true };
    state.queue.push(item);
    renderQueue();
    showToast(`Grid ${cols}×${rows} — ${cell.wMM}×${cell.hMM}mm per foto ✓`, 'green');
    return;
  }
  if (!state.selectedSize || !state.cropBox) return;
  const dataURL = extractCrop();
  const { label, wMM, hMM } = getEffectiveSize();
  const item = { id: state.nextId++, dataURL, label, wMM, hMM, qty: 1, flipped: false };
  state.queue.push(item);
  renderQueue();
  showToast(`${label} (${wMM}×${hMM}mm) ditambah ✓`, 'green');
}

function renderQueue() {
  const q = state.queue;
  queueBadge.textContent = q.length + ' item';
  queueList.innerHTML = '';

  if (q.length === 0) {
    queueList.appendChild(queueEmpty);
    queueEmpty.style.display = '';
    btnPrint.disabled = true;
    btnClearQueue.style.display = 'none';
    $('totalItems').textContent = '0';
    $('totalPages').textContent = '0';
    scheduleLayoutPreview();
    return;
  }

  queueEmpty.style.display = 'none';
  btnPrint.disabled = false;
  btnClearQueue.style.display = '';

  [...q].reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'queue-item';
    const effW = item.flipped ? item.hMM : item.wMM;
    const effH = item.flipped ? item.wMM : item.hMM;
    const flipLabel = item.flipped ? '▭' : '▯';
    const flipTitle = item.flipped ? 'Landscape (klik → Portrait)' : 'Portrait (klik → Landscape)';
    div.innerHTML = `
      <img class="qi-thumb" src="${item.dataURL}" alt="${item.label}"
           style="transform:rotate(${item.flipped ? 90 : 0}deg); object-fit:cover;">
      <div class="qi-info">
        <div class="qi-size">${item.label}</div>
        <div class="qi-mm">${effW}×${effH}mm</div>
      </div>
      <div class="qi-controls">
        <button class="btn-flip${item.flipped ? ' active' : ''}" data-id="${item.id}" title="${flipTitle}">${flipLabel}</button>
        <button class="btn-qty" data-id="${item.id}" data-act="minus">−</button>
        <span class="qi-qty" id="qty-${item.id}">${item.qty}</span>
        <button class="btn-qty" data-id="${item.id}" data-act="plus">+</button>
        <button class="btn-del" data-id="${item.id}" title="Hapus">✕</button>
      </div>`;
    queueList.appendChild(div);
  });

  queueList.querySelectorAll('.btn-flip').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = state.queue.find(i => i.id === +btn.dataset.id);
      if (!item) return;
      item.flipped = !item.flipped;
      renderQueue();
    });
  });

  queueList.querySelectorAll('.btn-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id;
      const item = state.queue.find(i => i.id === id);
      if (!item) return;
      if (btn.dataset.act === 'plus') item.qty = Math.min(99, (item.qty || 1) + 1);
      else item.qty = Math.max(1, (item.qty || 1) - 1);
      $(`qty-${id}`).textContent = item.qty;
      updateQueueSummary();
    });
  });
  queueList.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', () => {
      state.queue = state.queue.filter(i => i.id !== +btn.dataset.id);
      renderQueue();
    });
  });

  updateQueueSummary();
}

function updateQueueSummary() {
  const totalItems = state.queue.reduce((s, i) => s + i.qty, 0);
  const pages = estimatePages();
  $('totalItems').textContent = totalItems;
  $('totalPages').textContent = pages;
  scheduleLayoutPreview();
}

function clearQueue() {
  state.queue = [];
  renderQueue();
  showToast('Antrian dikosongkan');
}

/* ─────────────────────────────── PACK & PRINT ── */

// Estimate number of pages needed based on selected paper size
function estimatePages() {
  const items = expandQueue();
  return packItems(items).length;
}

// Expand queue items by qty
function expandQueue() {
  const items = [];
  state.queue.forEach(item => {
    for (let i = 0; i < item.qty; i++) {
      items.push({ dataURL: item.dataURL, label: item.label, wMM: item.wMM, hMM: item.hMM, flipped: item.flipped });
    }
  });
  return items;
}

// Bin-pack items into 10R pages (shelf algorithm, sort by height desc)
function packItems(items) {
  const GAP      = printSettings.gap;
  const usableW  = getPaperW() - PAPER_MARGIN_MM * 2;
  const usableH  = getPaperH() - PAPER_MARGIN_MM * 2;

  // Sort by height descending (tallest first for max efficiency)
  const sorted = [...items].sort((a, b) => b.hMM - a.hMM);

  const pages = []; // each page: [{ item, x, y, w, h, rotated }]
  let pageItems = [];
  let curX = 0, curY = 0, rowH = 0;

  function newPage() {
    if (pageItems.length > 0) pages.push(pageItems);
    pageItems = [];
    curX = 0; curY = 0; rowH = 0;
  }

  for (const item of sorted) {
    // item.flipped = user paksa rotate 90° manual via tombol di antrian
    const baseW = item.flipped ? item.hMM : item.wMM;
    const baseH = item.flipped ? item.wMM : item.hMM;
    let iw = Math.min(baseW, usableW);
    let ih = Math.min(baseH, usableH);
    let rotated = item.flipped || false;

    // ── AUTO ROTATE (tambahan otomatis jika belum di-flip manual) ──
    if (printSettings.autoRotate && !item.flipped) {
      const rw = Math.min(item.hMM, usableW);
      const rh = Math.min(item.wMM, usableH);
      const gapOrig = curX > 0 ? GAP : 0;
      const fitsOrig = curX + gapOrig + iw <= usableW;
      const fitsRot  = rw <= usableW && rh <= usableH && curX + gapOrig + rw <= usableW;
      if ((!fitsOrig && fitsRot) || (fitsOrig && fitsRot && rw < iw)) {
        iw = rw; ih = rh; rotated = true;
      }
    }

    if (ih > usableH) continue; // item too tall even for full page — skip

    // Check if fits in current row
    const rowGap1 = curX > 0 ? GAP : 0;
    if (curX + rowGap1 + iw > usableW) {
      // Move to next row
      curY += rowH + GAP;
      curX = 0; rowH = 0;
    }

    // Check if fits on current page
    if (curY + ih > usableH) {
      newPage();
    }

    const rowGap2 = curX > 0 ? GAP : 0;
    pageItems.push({
      item,
      x: PAPER_MARGIN_MM + curX + rowGap2,
      y: PAPER_MARGIN_MM + curY,
      w: iw, h: ih, rotated,
    });
    curX += rowGap2 + iw;
    rowH = Math.max(rowH, ih);
  }

  if (pageItems.length > 0) pages.push(pageItems);
  return pages;
}

// Rotate a dataURL 90° clockwise (used when autoRotate places item landscape)
function rotateDataURL90(dataURL) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.height; c.height = img.width;
      const cx = c.getContext('2d');
      cx.translate(c.width / 2, c.height / 2);
      cx.rotate(Math.PI / 2);
      cx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(c.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () => resolve(dataURL); // fallback: return original if rotation fails
    img.src = dataURL;
  });
}

async function packAndPrint() {
  if (state.queue.length === 0) return;

  const items = expandQueue();
  const pages = cetakMode === 'grid' ? packGrid(items) : packItems(items);

  if (pages.length === 0) { showToast('Tidak ada item yang bisa dicetak', 'red'); return; }

  // Pre-rotate dataURLs for cells that need rotation (deduped by src)
  const rotCache = new Map();
  for (const page of pages) {
    for (const cell of page) {
      if (cell.rotated && !rotCache.has(cell.item.dataURL)) {
        rotCache.set(cell.item.dataURL, await rotateDataURL90(cell.item.dataURL));
      }
    }
  }

  // Inject @page CSS sesuai ukuran kertas yang dipilih
  const pw = getPaperW(), ph = getPaperH();
  let psEl = document.getElementById('_print_page_css');
  if (!psEl) { psEl = document.createElement('style'); psEl.id = '_print_page_css'; document.head.appendChild(psEl); }
  psEl.textContent = `@media print { @page { size: ${pw}mm ${ph}mm; margin: 0; } .print-page { width: ${pw}mm !important; height: ${ph}mm !important; } }`;

  // object-fit CSS dari fillMode setting
  const objFit = { fill: 'cover', fit: 'contain', stretch: 'fill' }[printSettings.fillMode] || 'cover';

  const printArea = $('print-area');
  printArea.innerHTML = '';

  pages.forEach(pageItems => {
    const page = document.createElement('div');
    page.className = 'print-page';

    pageItems.forEach(({ item, x, y, w, h, rotated }) => {
      const photo = document.createElement('div');
      photo.className = 'print-photo';
      photo.style.cssText = `left:${x}mm; top:${y}mm; width:${w}mm; height:${h}mm;`;
      if (printSettings.cellBorder) photo.style.outline = '0.4mm solid #333';

      const img = document.createElement('img');
      img.src = rotated ? (rotCache.get(item.dataURL) || item.dataURL) : item.dataURL;
      img.alt = item.label;
      img.style.cssText = `width:100%; height:100%; display:block; object-fit:${objFit};`;
      photo.appendChild(img);
      page.appendChild(photo);
    });

    // Cut lines: per-baris — garis vertikal terbatas pada tinggi baris masing-masing
    // Aman untuk campuran ukuran berbeda dalam 1 kertas (e.g. 3 besar + 6 kecil)
    if (printSettings.cutLines) {
      const GAP = printSettings.gap;
      const dashSt = 'stroke:#555;stroke-width:0.4;stroke-dasharray:4,3;fill:none;';
      let svgLines = '';
      // Kelompokkan foto per baris (Y sama = 1 baris, toleransi 0.1mm)
      const rowMap = new Map();
      pageItems.forEach(it => {
        const key = Math.round(it.y * 10);
        if (!rowMap.has(key)) rowMap.set(key, []);
        rowMap.get(key).push(it);
      });
      [...rowMap.values()].sort((a, b) => a[0].y - b[0].y).forEach(rowItems => {
        const yTop = +(Math.min(...rowItems.map(it => it.y))       - GAP/2).toFixed(4);
        const yBot = +(Math.max(...rowItems.map(it => it.y + it.h)) + GAP/2).toFixed(4);
        const xMin = +(Math.min(...rowItems.map(it => it.x))       - GAP/2).toFixed(4);
        const xMax = +(Math.max(...rowItems.map(it => it.x + it.w)) + GAP/2).toFixed(4);
        // Garis horizontal atas & bawah baris ini
        svgLines += `<line x1="${xMin}mm" y1="${yTop}mm" x2="${xMax}mm" y2="${yTop}mm" style="${dashSt}"/>`;
        svgLines += `<line x1="${xMin}mm" y1="${yBot}mm" x2="${xMax}mm" y2="${yBot}mm" style="${dashSt}"/>`;
        // Garis vertikal per kolom, terbatas tinggi baris ini
        new Set(rowItems.flatMap(it => [
          +(it.x - GAP/2).toFixed(4), +(it.x + it.w + GAP/2).toFixed(4)
        ])).forEach(cx => {
          svgLines += `<line x1="${cx}mm" y1="${yTop}mm" x2="${cx}mm" y2="${yBot}mm" style="${dashSt}"/>`;
        });
      });
      const svgWrap = document.createElement('div');
      svgWrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:visible;';
      svgWrap.innerHTML = `<svg width="${pw}mm" height="${ph}mm" overflow="visible" xmlns="http://www.w3.org/2000/svg">${svgLines}</svg>`;
      page.appendChild(svgWrap);
    }

    printArea.appendChild(page);
  });

  // Wait for images to render fully, then print
  setTimeout(() => {
    if (window.electronAPI?.doPrint) window.electronAPI.doPrint();
    else window.print();
  }, 300);
}

/* ─────────────────────────────── LAYOUT PREVIEW ── */

// Cache Image objects supaya tidak decode ulang tiap render
const imgLoadCache = new Map();
function loadImg(dataURL) {
  const cached = imgLoadCache.get(dataURL);
  if (cached && cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => { imgLoadCache.set(dataURL, img); resolve(img); };
    img.onerror = () => resolve(null);
    img.src = dataURL;
    imgLoadCache.set(dataURL, img);
  });
}

let _previewTimer, _previewRunning = false, _previewDirty = false;
function scheduleLayoutPreview() {
  clearTimeout(_previewTimer);
  if (_previewRunning) { _previewDirty = true; return; }
  _previewTimer = setTimeout(renderLayoutPreview, 100);
}

async function renderLayoutPreview() {
  if (_previewRunning) { _previewDirty = true; return; }
  _previewRunning = true;
  _previewDirty = false;
  try {
  const canvas   = $('layoutCanvas');
  const lpEmpty  = $('lpEmpty');
  const lpInfo   = $('lpInfo');
  if (!canvas) return;

  const lctx = canvas.getContext('2d');
  const items = expandQueue();
  const pages = cetakMode === 'grid' ? packGrid(items) : packItems(items);

  // Kosong
  if (pages.length === 0) {
    canvas.style.display = 'none';
    lpEmpty.style.display = '';
    lpInfo.style.display = 'none';
    const btnExp = $('btnLpExpand'); if (btnExp) btnExp.style.display = 'none';
    return;
  }
  lpEmpty.style.display = 'none';
  canvas.style.display = 'block';
  lpInfo.style.display = '';
  const btnExp = $('btnLpExpand'); if (btnExp) btnExp.style.display = '';

  const pw    = getPaperW();
  const ph    = getPaperH();
  const CVSW  = 234;  // fixed canvas width in px
  const scale = CVSW / pw;
  const pageH = Math.round(ph * scale);
  const GAP_PX = 10; // px antar halaman
  const totalH = pages.length * pageH + (pages.length - 1) * GAP_PX;

  canvas.width  = CVSW;
  canvas.height = totalH;

  // Pre-load semua gambar dulu
  const allDataURLs = [...new Set(pages.flat().map(c => c.item.dataURL))];
  await Promise.all(allDataURLs.map(loadImg));

  lctx.clearRect(0, 0, CVSW, totalH);

  let totalUsed = 0;

  pages.forEach((pageItems, pi) => {
    const oY = pi * (pageH + GAP_PX); // offset Y untuk halaman ini

    // Kertas shadow
    lctx.fillStyle = 'rgba(0,0,0,0.35)';
    lctx.fillRect(3, oY + 3, CVSW, pageH);

    // Kertas background
    lctx.fillStyle = '#fff';
    lctx.fillRect(0, oY, CVSW, pageH);

    // Margin dashed
    lctx.save();
    lctx.strokeStyle = 'rgba(0,0,0,0.1)';
    lctx.lineWidth = 0.5;
    lctx.setLineDash([2, 2]);
    lctx.strokeRect(
      PAPER_MARGIN_MM * scale, oY + PAPER_MARGIN_MM * scale,
      (pw - PAPER_MARGIN_MM * 2) * scale, (ph - PAPER_MARGIN_MM * 2) * scale
    );
    lctx.setLineDash([]);
    lctx.restore();

    // Gambar tiap foto
    pageItems.forEach(({ item, x, y, w, h, rotated }) => {
      const px = Math.round(x * scale);
      const py = Math.round(oY + y * scale);
      const pw2 = Math.max(1, Math.round(w * scale));
      const ph2 = Math.max(1, Math.round(h * scale));

      totalUsed += w * h;

      const img = imgLoadCache.get(item.dataURL);
      lctx.save();
      lctx.beginPath();
      lctx.rect(px, py, pw2, ph2);
      lctx.clip();

      if (img && img.complete && img.naturalWidth > 0) {
        if (rotated) {
          // Foto diputar 90° CW untuk mengisi cell landscape
          // Dimensi "canvas" untuk cover-calc adalah ph2×pw2 (pre-rotasi)
          const dw = ph2, dh = pw2;
          const ir = img.naturalWidth / img.naturalHeight;
          const cr = dw / dh;
          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (ir > cr) { sw = sh * cr; sx = (img.naturalWidth - sw) / 2; }
          else         { sh = sw / cr; sy = (img.naturalHeight - sh) / 2; }
          lctx.save();
          lctx.translate(px + pw2 / 2, py + ph2 / 2);
          lctx.rotate(Math.PI / 2);
          lctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
          lctx.restore();
        } else {
          // object-fit: cover — crop tengah
          const ir = img.naturalWidth / img.naturalHeight;
          const cr = pw2 / ph2;
          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (ir > cr) { sw = sh * cr; sx = (img.naturalWidth - sw) / 2; }
          else         { sh = sw / cr; sy = (img.naturalHeight - sh) / 2; }
          lctx.drawImage(img, sx, sy, sw, sh, px, py, pw2, ph2);
        }
      } else {
        // Placeholder hijau
        lctx.fillStyle = '#d0ead8';
        lctx.fillRect(px, py, pw2, ph2);
      }
      lctx.restore();

      // Border cell
      if (printSettings.cellBorder) {
        lctx.strokeStyle = '#222';
        lctx.lineWidth = 1.5;
        lctx.strokeRect(px + 0.5, py + 0.5, pw2 - 1, ph2 - 1);
      } else {
        lctx.strokeStyle = 'rgba(0,0,0,0.12)';
        lctx.lineWidth = 0.5;
        lctx.strokeRect(px + 0.5, py + 0.5, pw2 - 1, ph2 - 1);
      }
    });

    // Cut lines preview — per-baris, garis vertikal terbatas tinggi baris masing-masing
    if (printSettings.cutLines) {
      const GAP = printSettings.gap;
      lctx.save();
      lctx.strokeStyle = '#555';
      lctx.lineWidth = 0.8;
      lctx.setLineDash([4, 3]);
      const rowMap = new Map();
      pageItems.forEach(it => {
        const key = Math.round(it.y * 10);
        if (!rowMap.has(key)) rowMap.set(key, []);
        rowMap.get(key).push(it);
      });
      [...rowMap.values()].sort((a, b) => a[0].y - b[0].y).forEach(rowItems => {
        const yTopMm = Math.min(...rowItems.map(it => it.y))       - GAP/2;
        const yBotMm = Math.max(...rowItems.map(it => it.y + it.h)) + GAP/2;
        const xMinMm = Math.min(...rowItems.map(it => it.x))       - GAP/2;
        const xMaxMm = Math.max(...rowItems.map(it => it.x + it.w)) + GAP/2;
        const yTopPx = Math.round(oY + yTopMm * scale);
        const yBotPx = Math.round(oY + yBotMm * scale);
        const xMinPx = Math.round(xMinMm * scale);
        const xMaxPx = Math.round(xMaxMm * scale);
        // Horizontal atas & bawah
        lctx.beginPath(); lctx.moveTo(xMinPx, yTopPx); lctx.lineTo(xMaxPx, yTopPx); lctx.stroke();
        lctx.beginPath(); lctx.moveTo(xMinPx, yBotPx); lctx.lineTo(xMaxPx, yBotPx); lctx.stroke();
        // Vertikal per kolom, terbatas tinggi baris
        new Set(rowItems.flatMap(it => [
          +(it.x - GAP/2).toFixed(4), +(it.x + it.w + GAP/2).toFixed(4)
        ])).forEach(xmm => {
          const cx = Math.round(xmm * scale);
          lctx.beginPath(); lctx.moveTo(cx, yTopPx); lctx.lineTo(cx, yBotPx); lctx.stroke();
        });
      });
      lctx.setLineDash([]);
      lctx.restore();
    }

    // Nomor halaman (jika > 1)
    if (pages.length > 1) {
      lctx.fillStyle = 'rgba(0,0,0,0.3)';
      lctx.font = `bold 8px 'DM Mono', monospace`;
      lctx.fillText(`${pi + 1} / ${pages.length}`, 4, oY + pageH - 4);
    }
  });

  // Hitung waste %
  const totalPaperArea = pages.length * (pw - PAPER_MARGIN_MM * 2) * (ph - PAPER_MARGIN_MM * 2);
  const wastePercent = totalPaperArea > 0 ? Math.round((1 - totalUsed / totalPaperArea) * 100) : 0;
  $('lpPageCount').textContent = pages.length;
  $('lpWaste').textContent = wastePercent;
  } finally {
    _previewRunning = false;
    if (_previewDirty) scheduleLayoutPreview();
  }
}

/* ─────────────────────────────── LAYOUT PREVIEW MODAL ── */
function bindLayoutModal() {
  $('btnLpExpand').addEventListener('click', openLayoutModal);
  $('btnLpModalClose').addEventListener('click', closeLayoutModal);
  $('btnLpPrint').addEventListener('click', () => { closeLayoutModal(); packAndPrint(); });
  $('lpModalBackdrop').addEventListener('click', e => {
    if (e.target === $('lpModalBackdrop')) closeLayoutModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('lpModalBackdrop').style.display !== 'none') closeLayoutModal();
  });
}

function openLayoutModal() {
  if (state.queue.length === 0) { showToast('Antrian kosong', 'red'); return; }
  $('lpModalBackdrop').style.display = 'flex';
  // requestAnimationFrame supaya modal sudah ter-render dan clientWidth valid
  requestAnimationFrame(() => requestAnimationFrame(renderLayoutModalFull));
}

function closeLayoutModal() {
  $('lpModalBackdrop').style.display = 'none';
}

async function renderLayoutModalFull() {
  const canvas = $('layoutCanvasFull');
  if (!canvas) return;
  const lctx   = canvas.getContext('2d');
  const items  = expandQueue();
  const pages  = packItems(items);

  if (pages.length === 0) return;

  const pw    = getPaperW();
  const ph    = getPaperH();
  // Canvas mengisi lebar modal body secara dinamis
  const modalBody = $('lpModalBody');
  const CVSW  = Math.min(560, (modalBody ? modalBody.clientWidth - 32 : 480));
  const scale = CVSW / pw;
  const pageH = Math.round(ph * scale);
  const GAP   = 16;
  const totalH = pages.length * pageH + (pages.length - 1) * GAP;

  canvas.width  = CVSW;
  canvas.height = totalH;

  // Pre-load gambar
  const allURLs = [...new Set(pages.flat().map(c => c.item.dataURL))];
  await Promise.all(allURLs.map(loadImg));

  lctx.clearRect(0, 0, CVSW, totalH);

  let totalUsed = 0;

  pages.forEach((pageItems, pi) => {
    const oY = pi * (pageH + GAP);

    // Shadow kertas
    lctx.fillStyle = 'rgba(0,0,0,0.4)';
    lctx.fillRect(5, oY + 5, CVSW, pageH);

    // Kertas putih
    lctx.fillStyle = '#fff';
    lctx.fillRect(0, oY, CVSW, pageH);

    // Margin dashed
    lctx.save();
    lctx.strokeStyle = 'rgba(0,0,0,0.12)';
    lctx.lineWidth = 0.8;
    lctx.setLineDash([3, 3]);
    lctx.strokeRect(
      PAPER_MARGIN_MM * scale,       oY + PAPER_MARGIN_MM * scale,
      (pw - PAPER_MARGIN_MM*2)*scale, (ph - PAPER_MARGIN_MM*2)*scale
    );
    lctx.setLineDash([]);
    lctx.restore();

    pageItems.forEach(({ item, x, y, w, h, rotated }) => {
      const px  = Math.round(x * scale);
      const py  = Math.round(oY + y * scale);
      const pw2 = Math.max(1, Math.round(w * scale));
      const ph2 = Math.max(1, Math.round(h * scale));
      totalUsed += w * h;

      const img = imgLoadCache.get(item.dataURL);
      lctx.save();
      lctx.beginPath(); lctx.rect(px, py, pw2, ph2); lctx.clip();
      if (img && img.complete && img.naturalWidth > 0) {
        if (rotated) {
          // Foto diputar 90° CW untuk mengisi cell landscape
          const dw = ph2, dh = pw2;
          const ir = img.naturalWidth / img.naturalHeight;
          const cr = dw / dh;
          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (ir > cr) { sw = sh * cr; sx = (img.naturalWidth - sw) / 2; }
          else         { sh = sw / cr; sy = (img.naturalHeight - sh) / 2; }
          lctx.save();
          lctx.translate(px + pw2 / 2, py + ph2 / 2);
          lctx.rotate(Math.PI / 2);
          lctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
          lctx.restore();
        } else {
          const ir = img.naturalWidth / img.naturalHeight;
          const cr = pw2 / ph2;
          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (ir > cr) { sw = sh * cr; sx = (img.naturalWidth - sw) / 2; }
          else         { sh = sw / cr; sy = (img.naturalHeight - sh) / 2; }
          lctx.drawImage(img, sx, sy, sw, sh, px, py, pw2, ph2);
        }
      } else {
        lctx.fillStyle = '#d0ead8'; lctx.fillRect(px, py, pw2, ph2);
      }
      lctx.restore();

      // Cell border
      if (printSettings.cellBorder) {
        lctx.strokeStyle = '#222';
        lctx.lineWidth = 1.5;
        lctx.strokeRect(px + 0.5, py + 0.5, pw2 - 1, ph2 - 1);
      } else {
        lctx.strokeStyle = 'rgba(0,0,0,0.12)';
        lctx.lineWidth = 0.5;
        lctx.strokeRect(px + 0.5, py + 0.5, pw2 - 1, ph2 - 1);
      }

      // Label ukuran di sudut foto
      lctx.fillStyle = 'rgba(0,0,0,0.45)';
      lctx.fillRect(px, py + ph2 - 14, pw2, 14);
      lctx.fillStyle = '#fff';
      lctx.font = `bold 9px 'DM Mono', monospace`;
      lctx.fillText(item.label, px + 3, py + ph2 - 4);
    });

    // Nomor halaman
    if (pages.length > 1) {
      lctx.fillStyle = 'rgba(0,0,0,0.25)';
      lctx.fillRect(0, oY + pageH - 18, CVSW, 18);
      lctx.fillStyle = 'rgba(0,0,0,0.7)';
      lctx.font = `bold 10px 'DM Mono', monospace`;
      lctx.textAlign = 'center';
      lctx.fillText(`— Halaman ${pi + 1} / ${pages.length} —`, CVSW / 2, oY + pageH - 5);
      lctx.textAlign = 'left';
    }
  });

  const totalPaper = pages.length * (pw - PAPER_MARGIN_MM*2) * (ph - PAPER_MARGIN_MM*2);
  const waste = totalPaper > 0 ? Math.round((1 - totalUsed / totalPaper) * 100) : 0;
  $('lpModalPages').textContent = pages.length;
  $('lpModalWaste').textContent = waste;
  $('lpModalMeta').textContent = `${pages.length} halaman · sisa ${waste}%`;
}

/* ─────────────────────────────── PRINT SETTINGS ── */
function bindPrintSettings() {
  const header   = $('psHeader');
  const body     = $('psBody');
  const chevron  = $('psChevron');
  const gapInput = $('psGap');
  if (!header || !body || !gapInput) return;

  // Accordion toggle
  header.addEventListener('click', () => {
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : '';
    chevron.textContent = open ? '▸' : '▾';
    chevron.classList.toggle('open', !open);
  });

  // Gap (mm antar foto)
  gapInput.addEventListener('input', () => {
    const v = parseFloat(gapInput.value);
    if (!isNaN(v) && v >= 0) { printSettings.gap = v; scheduleLayoutPreview(); }
  });

  // Fill mode radios
  document.querySelectorAll('input[name="fillMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) { printSettings.fillMode = radio.value; scheduleLayoutPreview(); }
    });
  });

  // Auto rotate
  $('psAutoRotate').addEventListener('change', function() {
    printSettings.autoRotate = this.checked; scheduleLayoutPreview();
  });

  // Cell border
  $('psCellBorder').addEventListener('change', function() {
    printSettings.cellBorder = this.checked; scheduleLayoutPreview();
  });

  // Cut lines
  $('psCutLines').addEventListener('change', function() {
    printSettings.cutLines = this.checked; scheduleLayoutPreview();
  });

  // Paper size
  $('psPaperSize').addEventListener('change', function() {
    printSettings.paperSize = this.value;
    const ps = PAPER_SIZES[this.value];
    const lbl = document.getElementById('lpPaperLabel');
    if (lbl && ps) lbl.textContent = `${this.value} · ${ps.w}×${ps.h}mm`;
    if (cetakMode === 'grid') {
      updateGridInfo();
      if (state.originalImage) {
        const cell = getGridCellSize();
        selectSize({ label: `1/${gridSettings.cols * gridSettings.rows} kertas`, wMM: cell.wMM, hMM: cell.hMM });
      }
    }
    scheduleLayoutPreview();
  });

}

/* ─────────────────────────────── HELPERS ── */
function setHint(text) {
  canvasHint.textContent = text;
  canvasHint.style.display = text ? '' : 'none';
}

function showToast(msg, type = '') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// Redraw on window resize
window.addEventListener('resize', () => {
  if (state.originalImage) drawCanvas();
});
