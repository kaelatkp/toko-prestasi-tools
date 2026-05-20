/* ════════════════════════════════════
   app-barcode.js — Barcode Generator
   Modul ke-3 Prestasi Tools
   Semua fungsi diawali bc* untuk hindari konflik nama
════════════════════════════════════ */

const BC_ZOOM_STEPS = [25, 33, 50, 67, 75, 90, 100, 110, 125, 150, 175, 200];
const BC_PAPER = { A4: { w: 210, h: 297 }, F4: { w: 215, h: 330 } };
const BC_MM = 3.7795;

let bcProducts = [], bcNextId = 1, bcCurrentOrient = 'landscape', bcZoomIdx = 4;

function bcX(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── CRUD Produk ── */
function bcTambahProduk() {
  bcProducts.push({ id: bcNextId++, nama: '', harga: '', kode: '', jumlah: '' });
  bcRenderForm();
  bcRenderPreview();
}

function bcHapusProduk(id) {
  if (bcProducts.length === 1) return;
  bcProducts = bcProducts.filter(p => p.id !== id);
  bcRenderForm();
  bcRenderPreview();
}

/* ── Lock states update tanpa re-render form ── */
function bcUpdateLocks(id) {
  const p = bcProducts.find(p => p.id === id);
  if (!p) return;
  const v        = bcValidateKode(p.kode);
  const namaOk   = p.nama.trim().length > 0;
  const kodeOk   = v.state === 'ok';
  const hargaOk  = p.harga !== '' && parseInt(p.harga) > 0;
  const jumlahOk = p.jumlah !== '' && parseInt(p.jumlah) >= 1;

  const kodeInput   = document.querySelector(`[data-bckode="${id}"]`);
  const hargaInput  = document.querySelector(`[data-bcharga="${id}"]`);
  const jumlahInput = document.querySelector(`[data-bcjumlah="${id}"]`);
  const addBtn      = document.querySelector(`[data-bcadd="${id}"]`);

  function applyLock(input, locked) {
    if (!input) return;
    const field = input.closest ? input.closest('.bc-field') : input.parentElement;
    if (field) field.classList.toggle('bc-field-locked', locked);
    input.disabled = locked;
  }

  applyLock(kodeInput,   !namaOk);
  applyLock(hargaInput,  !kodeOk);
  applyLock(jumlahInput, !hargaOk);
  if (addBtn) addBtn.disabled = !(namaOk && kodeOk && hargaOk && jumlahOk);
}

function bcUpd(id, field, val) {
  const p = bcProducts.find(p => p.id === id);
  if (!p) return;
  if (field === 'jumlah') {
    const n = parseInt(val);
    p[field] = (isNaN(n) || n < 1) ? '' : Math.min(999, n);
  } else if (field === 'kode') {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    p[field] = clean;
    const inputEl = document.querySelector(`[data-bckode="${id}"]`);
    if (inputEl && inputEl.value !== clean) {
      const pos = inputEl.selectionStart;
      inputEl.value = clean;
      try { inputEl.setSelectionRange(pos, pos); } catch(e) {}
    }
    bcUpdKodeUI(id, clean);
    bcUpdateLocks(id);
    bcRenderPreview();
    return;
  } else {
    p[field] = (field === 'nama') ? val.toUpperCase() : val;
  }
  bcUpdateLocks(id);
  bcRenderPreview();
}

function bcValidateKode(kode) {
  const v = (kode || '').trim().toUpperCase();
  const clean = v.replace(/[^A-Z0-9]/g, '');
  if (v !== clean) return { state: 'err', msg: '⚠ Hanya huruf & angka, tanpa simbol' };
  if (v.length === 0) return { state: 'empty', msg: '' };
  if (v.length < 6) return { state: 'warn', msg: `⚠ Terlalu pendek — ${v.length}/6 karakter minimum` };
  return { state: 'ok', msg: `✓ Valid — ${v.length} karakter` };
}

function bcUpdKodeUI(id, kode) {
  const v = bcValidateKode(kode);
  const stateClass   = v.state === 'ok' ? 'kode-ok' : v.state === 'warn' ? 'kode-warn' : v.state === 'err' ? 'kode-err' : '';
  const statusIcon   = v.state === 'ok' ? '✓' : v.state === 'warn' ? '!' : v.state === 'err' ? '✕' : '';
  const statusColor  = v.state === 'ok' ? 'var(--green-dark)' : v.state === 'warn' ? '#d97706' : v.state === 'err' ? 'var(--red)' : 'transparent';
  const inputEl = document.querySelector(`[data-bckode="${id}"]`);
  if (inputEl) {
    inputEl.className = stateClass;
    const statusEl = inputEl.parentElement.querySelector('.kode-status');
    if (statusEl) { statusEl.textContent = statusIcon; statusEl.style.color = statusColor; }
  }
  const hintEl = document.querySelector(`[data-bccodehint="${id}"]`);
  if (hintEl) {
    if (v.msg) {
      hintEl.textContent = v.msg;
      hintEl.className = `kode-hint ${v.state}`;
      hintEl.style.display = '';
    } else if (v.state === 'empty') {
      hintEl.innerHTML = 'A–Z &amp; 0–9 &nbsp;·&nbsp; angka <b>0</b> ≠ huruf O';
      hintEl.className = 'kode-hint';
      hintEl.style.color = 'var(--text-muted)';
      hintEl.style.display = '';
    } else {
      hintEl.style.display = 'none';
    }
  }
}

function bcRenderForm() {
  const wrap = document.getElementById('bc-entries-wrap');
  if (!wrap) return;
  wrap.innerHTML = bcProducts.map((p, i) => {
    const v = bcValidateKode(p.kode);
    const stateClass  = v.state === 'ok' ? 'kode-ok' : v.state === 'warn' ? 'kode-warn' : v.state === 'err' ? 'kode-err' : '';
    const statusIcon  = v.state === 'ok' ? '✓' : v.state === 'warn' ? '!' : v.state === 'err' ? '✕' : '';
    const statusColor = v.state === 'ok' ? 'var(--green-dark)' : v.state === 'warn' ? '#d97706' : v.state === 'err' ? 'var(--red)' : 'transparent';

    // Progressive unlock state
    const namaOk   = p.nama.trim().length > 0;
    const kodeOk   = v.state === 'ok';
    const hargaOk  = p.harga && parseInt(p.harga) > 0;
    const jumlahOk = p.jumlah && parseInt(p.jumlah) >= 1;

    const lockKode   = !namaOk;
    const lockHarga  = !kodeOk;
    const lockJumlah = !hargaOk;
    const lockAdd    = !jumlahOk;

    const lk = 'bc-field-locked';
    return `
    <div class="bc-entry-card">
      <div class="bc-entry-head">
        <span class="bc-entry-num">#${String(i + 1).padStart(2, '0')}</span>
        ${bcProducts.length > 1 ? `<button class="bc-btn-del" onclick="bcHapusProduk(${p.id})">✕ Hapus</button>` : ''}
      </div>

      <!-- 1. Nama Barang -->
      <div class="bc-field">
        <label>Nama Barang</label>
        <input type="text" placeholder="Contoh: BUKU TULIS A5" value="${bcX(p.nama)}"
          oninput="bcUpd(${p.id},'nama',this.value.toUpperCase())"
          style="text-transform:uppercase;">
      </div>

      <!-- 2. Kode | Harga | Jml | + (urutan isi kiri ke kanan) -->
      <div class="bc-field-row" style="align-items:flex-end;">

        <div class="bc-field ${lockKode ? lk : ''}" style="flex:0 0 122px;min-width:0">
          <label>Kode <span style="font-size:8px;color:var(--text-muted);font-weight:500;">(6–8)</span></label>
          <div class="kode-wrap" style="position:relative;">
            <input type="text" placeholder="BK12345" value="${bcX(p.kode)}"
              oninput="bcUpd(${p.id},'kode',this.value)"
              maxlength="8" data-bckode="${p.id}" class="${stateClass}"
              ${lockKode ? 'disabled' : ''}
              style="font-family:'DM Mono',monospace;font-weight:700;font-size:14px;letter-spacing:1.5px;padding-right:26px;text-transform:uppercase;width:100%;box-sizing:border-box;">
            <span class="kode-status" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:700;color:${statusColor};">${statusIcon}</span>
          </div>
        </div>

        <div class="bc-field ${lockHarga ? lk : ''}" style="flex:1;min-width:0">
          <label>Harga (Rp)</label>
          <input type="text" inputmode="numeric" placeholder="0" value="${bcFmtHargaInput(p.harga)}" maxlength="9"
            data-bcharga="${p.id}" oninput="bcUpdHarga(${p.id},this)"
            ${lockHarga ? 'disabled' : ''}
            style="text-align:right;font-family:'DM Mono',monospace;">
        </div>

        <div class="bc-field bc-field-qty ${lockJumlah ? lk : ''}">
          <label>Jml</label>
          <input type="number" value="${p.jumlah}" min="1" max="999" oninput="bcUpd(${p.id},'jumlah',this.value)"
            data-bcjumlah="${p.id}" ${lockJumlah ? 'disabled' : ''}
            style="text-align:center;font-family:'DM Mono',monospace;font-weight:700;color:var(--green-dark);">
        </div>

        <button class="bc-btn-add-inline" onclick="bcTambahProduk()" title="Tambah produk baru"
          data-bcadd="${p.id}" ${lockAdd ? 'disabled' : ''}>＋</button>
      </div>
      ${v.msg
        ? `<div class="kode-hint ${v.state}" data-bccodehint="${p.id}">${v.msg}</div>`
        : `<div class="kode-hint" data-bccodehint="${p.id}" style="color:var(--text-muted);font-size:9px;">A–Z &amp; 0–9 &nbsp;·&nbsp; angka <b>0</b> ≠ huruf O</div>`
      }
    </div>`;
  }).join('');
}

/* ── Harga ── */
function bcFmtRp(v) {
  if (v === '' || v === null || v === undefined) return '';
  return 'Rp ' + Number(v).toLocaleString('id-ID');
}
function bcFmtHargaInput(v) {
  if (v === '' || v === null || v === undefined || v === 0 || v === '0') return '';
  const n = parseInt(String(v).replace(/[^\d]/g, '')) || 0;
  return n ? n.toLocaleString('id-ID') : '';
}
function bcUpdHarga(id, inputEl) {
  const raw = inputEl.value.replace(/[^\d]/g, '').slice(0, 7);
  const n = parseInt(raw) || 0;
  const p = bcProducts.find(p => p.id === id);
  if (!p) return;
  p.harga = n || '';
  const formatted = n ? n.toLocaleString('id-ID') : '';
  const oldLen = inputEl.value.length;
  const curPos = inputEl.selectionStart;
  inputEl.value = formatted;
  const diff = formatted.length - oldLen;
  const newPos = Math.max(0, curPos + diff);
  try { inputEl.setSelectionRange(newPos, newPos); } catch(e) {}
  bcUpdateLocks(id);
  bcRenderPreview();
}

/* ── Orientasi ── */
function bcSetOrient(o) {
  bcCurrentOrient = o;
  document.getElementById('bc-btn-portrait')?.classList.toggle('active', o === 'portrait');
  document.getElementById('bc-btn-landscape')?.classList.toggle('active', o === 'landscape');
  bcRenderPreview();
}

/* ── Barcode Image ── */
function bcMakeBarcodeImg(kode, cellW, barcodeH) {
  const canvas = document.getElementById('bc-canvas');
  if (!canvas || typeof JsBarcode === 'undefined') return null;
  const trimmed = (kode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const safe = trimmed || '000000';
  const bw = Math.max(1.2, cellW / 90);
  try {
    JsBarcode(canvas, safe, { format: 'CODE128A', width: bw, height: barcodeH, displayValue: false, margin: 2, background: '#ffffff', lineColor: '#000000' });
    return { url: canvas.toDataURL('image/png'), invalid: trimmed.length < 6 || trimmed.length > 8 };
  } catch (e) {
    try {
      JsBarcode(canvas, '000000', { format: 'CODE128A', width: bw, height: barcodeH, displayValue: false, margin: 2 });
      return { url: canvas.toDataURL('image/png'), err: true };
    } catch (e2) { return null; }
  }
}

/* ── Render Preview ── */
function bcRenderPreview() {
  const paperSize = document.getElementById('bc-paper-size')?.value || 'A4';
  const cols      = Math.max(1, parseInt(document.getElementById('bc-cols')?.value)   || 6);
  const rows      = Math.max(1, parseInt(document.getElementById('bc-rows')?.value)   || 12);
  const gapMm     = parseFloat(document.getElementById('bc-gap')?.value)    || 1;
  const marginMm  = parseFloat(document.getElementById('bc-margin')?.value) || 1;
  const namaToko  = (document.getElementById('bc-nama-toko')?.value  || 'Toko Prestasi').trim();
  const createdBy = (document.getElementById('bc-created-by')?.value || '').trim();

  const pw = BC_PAPER[paperSize]?.w || 210, ph = BC_PAPER[paperSize]?.h || 297;
  const isLandscape = bcCurrentOrient === 'landscape';
  // Paper stays portrait — orientation controls LABEL rotation, not paper

  const pxW  = Math.round(pw * BC_MM), pxH = Math.round(ph * BC_MM);
  const mgPx = Math.round(marginMm * BC_MM), gpPx = Math.round(gapMm * BC_MM);
  const usableW = pxW - 2 * mgPx - gpPx * (cols - 1);
  const usableH = pxH - 2 * mgPx - gpPx * (rows - 1);
  const cellW = Math.floor(usableW / cols), cellH = Math.floor(usableH / rows);
  // Label card dimensions: swapped when landscape
  const cardW = isLandscape ? cellH : cellW;
  const cardH = isLandscape ? cellW : cellH;

  let allItems = [];
  for (const p of bcProducts) {
    for (let i = 0; i < Math.max(1, p.jumlah || 1); i++) allItems.push(p);
  }

  const totalBarcode = allItems.length;
  const countEl = document.getElementById('bc-total-count');
  const pagesEl = document.getElementById('bc-total-pages');
  const wrap    = document.getElementById('bc-paper-wrap');
  if (countEl) countEl.textContent = totalBarcode.toLocaleString('id-ID') + ' barcode';
  if (!wrap) return;

  if (totalBarcode === 0) {
    wrap.innerHTML = '<div class="bc-empty-msg">Isi data produk di panel kiri untuk melihat preview</div>';
    if (pagesEl) pagesEl.textContent = '0 halaman';
    return;
  }

  const fsNama   = Math.min(8, Math.max(5, Math.round(cardW / 16)));
  const fsHarga  = Math.min(8, Math.max(5, Math.round(cardW / 16)));
  const fsKode   = Math.min(9, Math.max(6, Math.round(cardW / 16)));
  const fsBy     = Math.min(6, Math.max(4, Math.round(cardW / 24)));
  const padH     = Math.max(3, Math.round(cardW * 0.04));
  const padV     = Math.max(1, Math.round(cardH * 0.02));
  const stripH   = Math.max(9, Math.round(cardH * 0.115));
  const reserved = fsNama * 1.4 + Math.max(fsHarga, fsKode) * 1.6 + padV * 5;
  const bcH      = Math.max(16, cardH - stripH - reserved);

  const perPage = cols * rows;
  const pages   = Math.ceil(totalBarcode / perPage);
  if (pagesEl) pagesEl.textContent = pages + ' halaman';

  let html = '';
  for (let pg = 0; pg < pages; pg++) {
    const pageItems = allItems.slice(pg * perPage, (pg + 1) * perPage);
    const bcData    = pageItems.map(p => bcMakeBarcodeImg(p.kode, cardW - padH * 2, bcH));

    const cards = pageItems.map((p, i) => {
      const bd    = bcData[i];
      const nama  = bcX(p.nama || '');
      const kode  = bcX((p.kode || '').trim().toUpperCase());
      const harga = bcFmtRp(p.harga);
      const tw    = cardW - padH * 2;
      const bcImg = bd && bd.url
        ? `<div style="position:relative;display:inline-block;">
            <img src="${bd.url}" style="width:${tw}px;height:${bcH}px;object-fit:fill;display:block;image-rendering:pixelated;${bd.invalid ? 'opacity:0.35;filter:grayscale(1);' : ''}">
            ${bd.invalid ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#c00;background:rgba(255,255,255,0.7);border:1px dashed #e53935;border-radius:2px;">KODE TIDAK VALID</div>` : ''}
           </div>`
        : `<div style="width:${tw}px;height:${bcH}px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:8px;color:#aaa;">no barcode</div>`;

      const innerCard = `<div style="width:${cardW}px;height:${cardH}px;background:#fff;border:0.8px solid #d0d0d0;display:flex;flex-direction:column;overflow:hidden;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
        <div style="background:#fff;height:${stripH}px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 ${padH}px;gap:3px;border-bottom:1.5px solid #00C853;">
          <span style="font-size:${fsBy + 1}px;font-weight:800;color:#0f1f14;letter-spacing:0.6px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;">${bcX(namaToko)}</span>
          ${createdBy ? `<span style="font-size:${fsBy}px;font-weight:700;color:#2e7d50;letter-spacing:0.3px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0;max-width:45%;">${bcX(createdBy)}</span>` : ''}
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:${padV}px ${padH}px;gap:0;min-height:0;overflow:hidden;">
          ${nama ? `<div style="font-size:${fsNama}px;font-weight:700;color:#1a1a1a;text-align:center;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;letter-spacing:-0.2px;flex-shrink:0;">${nama}</div>` : ''}
          <div style="flex-shrink:0;">${bcImg}</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:4px;flex-shrink:0;width:100%;">
            ${harga ? `<span style="font-size:${fsHarga}px;font-weight:700;color:#1a7a3c;line-height:1.2;letter-spacing:0.2px;white-space:nowrap;">${harga}</span>` : ''}
            ${(harga && kode) ? `<span style="font-size:${fsKode}px;color:#bbb;line-height:1;">·</span>` : ''}
            ${kode ? `<span style="font-size:${fsKode}px;font-weight:700;color:#1a2e22;background:#e8f5ec;border:0.8px solid #b6e8cc;border-radius:2px;padding:1px ${Math.round(padH * 0.6)}px;line-height:1.4;letter-spacing:1.5px;font-family:'Courier New',monospace;white-space:nowrap;">${kode}</span>` : ''}
          </div>
        </div>
      </div>`;

      if (!isLandscape) return innerCard;

      // Landscape: rotate label 90° inside the same grid cell footprint
      const offX = Math.round((cellW - cardW) / 2);
      const offY = Math.round((cellH - cardH) / 2);
      return `<div style="width:${cellW}px;height:${cellH}px;overflow:hidden;position:relative;flex-shrink:0;box-sizing:border-box;">
        <div style="position:absolute;left:${offX}px;top:${offY}px;transform:rotate(90deg);transform-origin:center center;">
          ${innerCard}
        </div>
      </div>`;
    }).join('');

    let cutLines = '';
    if (totalBarcode > 1) {
      const dashStyle = 'stroke:#555;stroke-width:0.5;stroke-dasharray:4,3;';
      let lines = '';
      const itemCount   = pageItems.length;
      const filledRows  = Math.ceil(itemCount / cols);
      const lastRowCols = itemCount % cols === 0 ? cols : itemCount % cols;
      const contentBottom = mgPx + filledRows * (cellH + gpPx) - gpPx;
      const contentRight  = mgPx + cols * (cellW + gpPx) - gpPx;
      const lastRowRight  = mgPx + lastRowCols * (cellW + gpPx) - gpPx;

      for (let c = 1; c < cols; c++) {
        const cx  = mgPx + c * (cellW + gpPx) - gpPx / 2;
        const yEnd = c < lastRowCols ? contentBottom : contentBottom - (cellH + gpPx);
        if (yEnd <= mgPx) continue;
        lines += `<line x1="${cx}" y1="${mgPx}" x2="${cx}" y2="${yEnd}" style="${dashStyle}"/>`;
      }
      for (let r = 1; r < filledRows; r++) {
        const cy  = mgPx + r * (cellH + gpPx) - gpPx / 2;
        const xEnd = r === filledRows - 1 ? lastRowRight : contentRight;
        lines += `<line x1="${mgPx}" y1="${cy}" x2="${xEnd}" y2="${cy}" style="${dashStyle}"/>`;
      }
      cutLines = `<svg style="position:absolute;inset:0;pointer-events:none;" width="${pxW}" height="${pxH}" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`;
    }

    html += `<div class="bc-paper-page" style="width:${pxW}px;height:${pxH}px;">
      <div style="position:absolute;top:${mgPx}px;left:${mgPx}px;display:grid;grid-template-columns:repeat(${cols},${cellW}px);grid-auto-rows:${cellH}px;gap:${gpPx}px;">${cards}</div>
      ${cutLines}
    </div>`;
  }

  const z = BC_ZOOM_STEPS[bcZoomIdx];
  wrap.innerHTML = `<div id="bc-paper-scaler" style="transform:scale(${z / 100});transform-origin:top center;transition:transform .18s ease;display:flex;flex-direction:column;align-items:center;gap:20px;">${html}</div>`;
}

/* ── Cetak ── */
function bcCetak() {
  const toko = document.getElementById('bc-nama-toko')?.value.trim();
  if (!toko) { document.getElementById('bc-nama-toko')?.focus(); return; }
  const invalidCount = bcProducts.filter(p => {
    const k = (p.kode || '').trim();
    return k.length < 6 || k.length > 8;
  }).length;
  if (invalidCount > 0) {
    const ok = confirm(`${invalidCount} produk memiliki kode tidak valid (kosong atau kurang dari 6 karakter).\nBarcode placeholder akan dicetak.\n\nLanjutkan cetak?`);
    if (!ok) return;
  }
  const ps = document.getElementById('bc-paper-size')?.value || 'A4';
  const w = BC_PAPER[ps]?.w || 210, h = BC_PAPER[ps]?.h || 297;
  // Paper always portrait — label rotation is visual only, no page size change
  let st = document.getElementById('_bc_ps');
  if (!st) { st = document.createElement('style'); st.id = '_bc_ps'; document.head.appendChild(st); }
  st.textContent = `@media print{@page{size:${w}mm ${h}mm;margin:0;}.sidebar,.bc-stat-bar,.bc-form-area,#welcome,#welcome-dok,#workspace,.app-footer,.bc-win-header,.bc-win-sidebar,.bc-win-footer{display:none!important;}#welcome-barcode{display:flex!important;}.bc-win-wrap,.bc-win-body,.bc-win-main{display:block!important;overflow:visible!important;height:auto!important;}.bc-paper-wrap{overflow:visible!important;padding:0!important;background:none!important;}#bc-paper-scaler{transform:scale(1)!important;}}`;
  if (window.electronAPI?.doPrint) window.electronAPI.doPrint();
  else window.print();
}

/* ── Reset Layout ── */
function bcResetLayoutDefault() {
  const defaults = { 'bc-cols': 10, 'bc-rows': 10, 'bc-gap': 2, 'bc-margin': 2 };
  for (const [id, val] of Object.entries(defaults)) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }
  const ps = document.getElementById('bc-paper-size');
  if (ps) ps.value = 'A4';
  bcSetOrient('landscape');
  bcRenderPreview();
}

/* ── Zoom ── */
function bcApplyZoom() {
  const z = BC_ZOOM_STEPS[bcZoomIdx];
  const label = document.getElementById('bc-zoom-label');
  if (label) label.textContent = z + '%';
  const scaler = document.getElementById('bc-paper-scaler');
  if (scaler) scaler.style.transform = `scale(${z / 100})`;
}
function bcZoomIn()    { if (bcZoomIdx < BC_ZOOM_STEPS.length - 1) { bcZoomIdx++; bcApplyZoom(); } }
function bcZoomOut()   { if (bcZoomIdx > 0) { bcZoomIdx--; bcApplyZoom(); } }
function bcZoomReset() { bcZoomIdx = 4; bcApplyZoom(); }

/* ── Init ── */
function initBarcode() {
  bcTambahProduk();

  const wrap = document.getElementById('bc-paper-wrap');
  if (!wrap) return;

  wrap.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); e.deltaY < 0 ? bcZoomIn() : bcZoomOut(); }
  }, { passive: false });

  let isDragging = false, startX = 0, startY = 0, scrollLeft = 0, scrollTop = 0;
  wrap.addEventListener('mousedown', e => {
    if (e.button !== 0 || ['INPUT', 'BUTTON', 'SELECT'].includes(e.target.tagName)) return;
    isDragging = true; wrap.style.cursor = 'grabbing';
    startX = e.pageX - wrap.offsetLeft; startY = e.pageY - wrap.offsetTop;
    scrollLeft = wrap.scrollLeft;       scrollTop  = wrap.scrollTop;
  });
  wrap.addEventListener('mousemove', e => {
    if (!isDragging) return; e.preventDefault();
    wrap.scrollLeft = scrollLeft - (e.pageX - wrap.offsetLeft - startX);
    wrap.scrollTop  = scrollTop  - (e.pageY - wrap.offsetTop  - startY);
  });
  ['mouseup', 'mouseleave'].forEach(ev => wrap.addEventListener(ev, () => { isDragging = false; wrap.style.cursor = ''; }));
}
