// ════════════════════════════════════════════════════════════
// Code.gs — Foto Prestasi · GAS Web App
// Sheet-driven sepenuhnya. Tidak ada hardcode.
// Deploy: Deploy → New deployment → Web App → Anyone
// ════════════════════════════════════════════════════════════

const SPREADSHEET_ID = '1n7jv1bBsrKH9UBhIT8cLToO93EyBHQvzKSTRn2VNIF0';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent';

// ─── SHEET HELPERS ───────────────────────────────────────────

function _ss() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function _sheetToObj(tabName) {
  const data = _ss().getSheetByName(tabName).getDataRange().getValues();
  const [headers, ...rows] = data;
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

function _configMap() {
  const rows = _sheetToObj('config');
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

function _setConfig(key, value) {
  const sh = _ss().getSheetByName('config');
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) { sh.getRange(i + 1, 2).setValue(value); return; }
  }
  sh.appendRow([key, value]);
}

// ─── doGet — serve bundle.html ke crew ───────────────────────

function doGet() {
  const tpl = HtmlService.createHtmlOutputFromFile('bundle');
  tpl.setTitle('Foto Prestasi — Toko Prestasi');
  tpl.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return tpl;
}

// ─── doPost — router semua action ────────────────────────────

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'generate')    return _respond(_actionGenerate(body));
    if (action === 'sync')        return _respond(_actionSync(body));
    if (action === 'version')     return _respond(_actionVersion());
    if (action === 'get-config')  return _respond(_actionGetConfig());

    return _respond({ error: 'Unknown action: ' + action }, 400);
  } catch (err) {
    return _respond({ error: err.message }, 500);
  }
}

function _respond(data, code) {
  const out = ContentService.createTextOutput(JSON.stringify(data));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

// ─── ACTION: generate ────────────────────────────────────────

function _actionGenerate(body) {
  const cfg = _configMap();
  const apiKey = cfg['GEMINI_API_KEY'];
  if (!apiKey) return { error: 'API Key belum diset. Hubungi owner untuk sync.' };

  const parts = [{ text: body.prompt }];
  (body.images || []).forEach(img => {
    parts.push({ inline_data: { mime_type: img.mimeType, data: img.data } });
  });

  const resp = UrlFetchApp.fetch(GEMINI_ENDPOINT + '?key=' + apiKey, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { responseModalities: ['image', 'text'], temperature: 0.7 },
    }),
    muteHttpExceptions: true,
  });

  const result = JSON.parse(resp.getContentText());
  if (resp.getResponseCode() !== 200) {
    return { error: result?.error?.message || 'Gemini error' };
  }

  let imgData = null, imgMime = 'image/png';
  for (const cand of (result?.candidates || [])) {
    for (const part of (cand?.content?.parts || [])) {
      if (part?.inline_data?.data) {
        imgData = part.inline_data.data;
        imgMime = part.inline_data.mime_type || 'image/png';
        break;
      }
    }
    if (imgData) break;
  }

  if (!imgData) {
    const msg = result?.candidates?.[0]?.content?.parts
      ?.filter(p => p.text)?.map(p => p.text)?.join(' ') || '';
    return { error: 'Tidak ada hasil gambar.' + (msg ? ' Info: ' + msg.slice(0, 200) : '') };
  }

  return { data: imgData, mimeType: imgMime, version: _configMap()['APP_VERSION'] || '1.0.0' };
}

// ─── ACTION: sync (terima push dari server) ──────────────────

function _actionSync(body) {
  // config
  if (body.config) {
    Object.entries(body.config).forEach(([k, v]) => _setConfig(k, v));
  }

  // mods
  if (body.mods) {
    const sh = _ss().getSheetByName('mods');
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    sh.getRange(2, 1, sh.getLastRow(), sh.getLastColumn()).clearContent();
    const rows = body.mods.map(m => headers.map(h => m[h] ?? ''));
    if (rows.length) sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  // bg_colors
  if (body.bg_colors) {
    const sh = _ss().getSheetByName('bg_colors');
    sh.getRange(2, 1, sh.getLastRow(), 2).clearContent();
    const rows = body.bg_colors.map(c => [c.hex, c.name]);
    if (rows.length) sh.getRange(2, 1, rows.length, 2).setValues(rows);
  }

  // options
  if (body.options) {
    const sh = _ss().getSheetByName('options');
    sh.getRange(2, 1, sh.getLastRow(), 3).clearContent();
    const rows = body.options.map(o => [o.group, o.value, o.label]);
    if (rows.length) sh.getRange(2, 1, rows.length, 3).setValues(rows);
  }

  return { success: true, version: _configMap()['APP_VERSION'] || '1.0.0' };
}

// ─── ACTION: version ─────────────────────────────────────────

function _actionVersion() {
  return { version: _configMap()['APP_VERSION'] || '1.0.0' };
}

// ─── ACTION: get-config (bundle ambil semua data dari Sheet) ──

function _actionGetConfig() {
  return {
    mods:      _sheetToObj('mods'),
    bg_colors: _sheetToObj('bg_colors'),
    options:   _sheetToObj('options'),
    version:   _configMap()['APP_VERSION'] || '1.0.0',
  };
}
