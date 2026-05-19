# KAELA-toko-prestasi-tools.md — Handoff Proyek
> Upload file ini BERSAMA `KAELA-CAPSUL.md` untuk melanjutkan proyek.
> Jangan upload tanpa capsul — KAELA butuh keduanya.

---

## 🧠 KONTEKS PROYEK

**Nama proyek:** Toko Prestasi Tools
**Deskripsi:** Web app tools untuk toko foto & ATK — generator prompt foto AI, generator surat/dokumen, dan barcode label printer
**Tipe proyek:** HTML murni (tidak ada framework)
**Stack:**
- UI: HTML + CSS (tokens.css) + Sora / DM Mono font
- Logic: Vanilla JS modular (app-core, app-foto, app-dokumen, app-barcode, app-screensaver, app-cetak)
- Data: Hardcoded di JS (tidak ada sheet/API) — sudah sesuai karena ini tools offline
- Deploy: File lokal → Google Drive sync → Electron EXE di komputer toko

**CONFIG_SOURCE:** `config.js` (saat ini hanya berisi placeholder Gemini API key — sudah di-stub, tidak aktif)
**STYLE_SOURCE:** `tokens.css`
**DATA_SOURCE:** Modul data inline di `app-foto.js` (MODS) dan `app-dokumen.js` (MODS_DOK)

---

## 🏗️ ARSITEKTUR SISTEM

```
[G:\My Drive\TOKO PRESTASI TOOLS\]   ← Olan edit di sini
         │
         ▼
   Google Drive Sync (otomatis)
         │
         ▼
[Komputer Toko 1 & 2]
   Electron EXE (shell) ──► load index.html dari Google Drive
         │
         └── Cek version.json tiap 30 detik
                  │
                  └── Versi beda → banner "Update tersedia → klik reload"
```

**Folder build Electron (di luar Google Drive):**
```
D:\KAELA PROJECT\ELECTRON-BUILD\
  ├── main.js
  ├── preload.js
  ├── package.json
  ├── icon.png
  ├── node_modules\
  └── dist\
       ├── Toko Prestasi Tools Setup 2.1.0.exe   ← installer
       └── Toko Prestasi Tools-v2.1.0-portable.exe ← portable
```

---

## 📁 FILE REGISTRY

| File | Status | Fungsi Tunggal |
|------|--------|----------------|
| `index.html` | ✅ DONE | Shell HTML utama, layout, mode tabs, splash screen |
| `tokens.css` | ✅ DONE | Semua CSS variables / design tokens |
| `config.js` | ✅ DONE | API key placeholder (Gemini — sudah di-stub) |
| `app-core.js` | ✅ DONE | Shared state, mode switcher, toast, loading bar, ping widget, history |
| `app-foto.js` | ✅ DONE | 25 modul generator prompt foto AI |
| `app-dokumen.js` | ✅ DONE | 28 modul generator surat & dokumen ATK |
| `app-barcode.js` | ✅ DONE | Generator barcode CODE128A, layout A4/F4 |
| `app-screensaver.js` | ✅ DONE | Screensaver idle |
| `app-cetak.js` | ✅ DONE | Modul cetak foto |
| `cetak.html` | ✅ DONE | Halaman cetak terpisah |
| `version.json` | ✅ DONE | Penanda versi untuk sistem auto-update |
| `main.js` | ✅ DONE | Electron main process — cari Google Drive, load app, watch version |
| `preload.js` | ✅ DONE | Context bridge Electron ↔ renderer (electronAPI) |
| `package.json` | ✅ DONE | Electron build config (nsis + portable, x64) |
| `icon.png` | ✅ DONE | Icon app |
| `crew/` | ✅ DONE | Foto karakter Nexus Forge Team |

---

## 📦 KONTRAK ANTAR FILE

| Dari | Ke | Data |
|------|----|------|
| `main.js` | `preload.js` | IPC: `update-available` (string versi), `do-reload` |
| `preload.js` | `index.html` | `window.electronAPI.onUpdateAvailable(cb)`, `window.electronAPI.doReload()` |
| `index.html` | `app-core.js` | `showToast()`, `showLoadingBar()`, `switchMode()`, `generatedPrompt` |
| `app-core.js` | `app-foto.js` | `currentMod`, `MODS`, `setMod()` |
| `app-core.js` | `app-dokumen.js` | `currentModDok`, `MODS_DOK`, `setModDok()` |
| `version.json` | `main.js` | `{ "version": "x.x", "notes": "" }` |

---

## 📍 POSISI SEKARANG

**Sprint aktif:** Distribusi & Auto-Update
**Status:** EXE sudah berhasil di-build. Belum ditest di komputer toko.

**Sudah selesai:**
- ✅ Seluruh fitur app (foto, dokumen, barcode)
- ✅ Setup Google Drive sync (folder dipindah ke `G:\My Drive\TOKO PRESTASI TOOLS\`)
- ✅ Sistem auto-update: `version.json` + `main.js` watcher + banner notif di `index.html`
- ✅ EXE berhasil di-build: installer + portable di `D:\KAELA PROJECT\ELECTRON-BUILD\dist\`

**Belum dilakukan:**
- ⬜ Test EXE di laptop Olan
- ⬜ Setup Google Drive di komputer toko 1
- ⬜ Setup Google Drive di komputer toko 2
- ⬜ Test alur update end-to-end (bump version → sync → banner muncul → reload)

**Blocker aktif:** Belum ada — tinggal eksekusi di komputer toko

---

## 📋 ANTRIAN TUGAS

| No | Task | Status | Catatan |
|----|------|--------|---------|
| 1 | Test EXE di laptop Olan | ⬜ TODO | Jalankan `dist/portable.exe`, pastikan app terbuka dari Google Drive |
| 2 | Setup Google Drive komputer toko 1 | ⬜ TODO | Install Drive, login akun sama, tunggu sync |
| 3 | Setup Google Drive komputer toko 2 | ⬜ TODO | Sama seperti toko 1 |
| 4 | Test auto-update end-to-end | ⬜ TODO | Bump `version.json` → cek banner muncul di 30 detik |
| 5 | Buat shortcut desktop di komputer toko | ⬜ TODO | Klik kanan EXE → Send to Desktop |

---

## 📐 ATURAN TAMBAHAN PROYEK INI

1. **Build Electron di luar Google Drive** — jangan `npm install` di folder `G:\My Drive\` karena Google Drive konflik dengan penulisan `node_modules`
2. **Folder kerja Olan** = `G:\My Drive\TOKO PRESTASI TOOLS\` — semua edit file app di sini
3. **Folder build** = `D:\KAELA PROJECT\ELECTRON-BUILD\` — hanya untuk `npm install` + `npm run build`
4. **EXE tidak perlu di-rebuild** saat update app — cukup edit file HTML/JS di Google Drive + bump `version.json`
5. **Rebuild EXE hanya diperlukan** jika ada perubahan di `main.js` atau `preload.js`
6. **Cara bump versi:** buka `version.json`, ganti angka versi → save → Google Drive sync → komputer toko dapat notif dalam 30 detik

---

## 🔐 ATURAN KEAMANAN

- Tidak ada API key aktif di kode — Gemini API key sudah di-stub (fungsi kosong)
- Tidak ada credential yang perlu dijaga saat ini
- Google Drive login menggunakan akun Google pribadi Olan

---

## 🗂️ RIWAYAT SELESAI

| Tanggal | Task | Modul | File | Catatan |
|---------|------|-------|------|---------|
| 2026-05-19 | Setup distribusi Google Drive | MOD-STACK-WEB | — | Folder dipindah ke `G:\My Drive\TOKO PRESTASI TOOLS\` |
| 2026-05-19 | Buat sistem auto-update Electron | MOD-PACK-EXE | `main.js`, `preload.js`, `version.json`, `index.html` | EXE load dari Google Drive, cek versi tiap 30 detik |
| 2026-05-19 | Build EXE berhasil | MOD-PACK-EXE | `package.json` | Output: installer + portable v2.1.0 di `D:\KAELA PROJECT\ELECTRON-BUILD\dist\` |
