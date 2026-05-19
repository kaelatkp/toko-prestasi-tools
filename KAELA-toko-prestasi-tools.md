# TOKO PRESTASI TOOLS — HANDOFF DOCUMENT
> Terakhir diperbarui: 20 Mei 2026 · v2.3 · Ditulis oleh Kaela (AI Architect)

---

## RINGKASAN PROYEK

Aplikasi desktop Windows untuk Toko Prestasi — generator prompt foto AI, dokumen resmi, barcode label, cetak foto, dan screensaver toko. Dibangun dengan Electron (wrapper HTML/CSS/JS), didistribusikan via GitHub Releases, update otomatis via GitHub raw.

**Status:** ✅ Resmi Launch & Approved — v2.3

---

## ARSITEKTUR SISTEM

```
┌─────────────────────────────────────────────────────┐
│  GitHub Repo (kaelatkp/toko-prestasi-tools)         │
│  → app files + version.json (manifest hash)         │
└────────────────────┬────────────────────────────────┘
                     │ git push (Olan)
                     ↓
┌─────────────────────────────────────────────────────┐
│  Electron EXE (installer / portable)                │
│  D:\KAELA PROJECT\ELECTRON-BUILD\                   │
│  → main.js, preload.js (di dalam EXE)               │
│  → app-files/ (extraResources, seed pertama)        │
└────────────────────┬────────────────────────────────┘
                     │ install sekali
                     ↓
┌─────────────────────────────────────────────────────┐
│  AppData (C:\Users\...\AppData\Roaming\             │
│           TokoPrestasiTools\)                       │
│  → app files di-seed dari EXE (pertama kali)        │
│  → update selanjutnya dari GitHub (hash-based)      │
│  → crew/ folder (foto Nexus Forge, selalu di-sync)  │
└─────────────────────────────────────────────────────┘
```

### Alur Update Otomatis
1. Olan edit app files → `node generate-manifest.js` → `git push`
2. App client cek GitHub setiap 4 detik (startup) lalu tiap 5 menit
3. Jika `version.json` di GitHub berbeda → banner UPDATE muncul
4. User klik UPDATE → hanya file yang hash-nya beda yang didownload
5. App reload otomatis — tidak perlu reinstall

---

## STRUKTUR FOLDER

### App Files (GitHub + AppData)
```
TOKO PRESTASI TOOLS/
├── index.html              ← Main app (semua modul di-render di sini)
├── tokens.css              ← Design tokens & CSS global
├── config.js               ← Konfigurasi toko (nama, alamat, kontak)
├── app-core.js             ← Core logic, navigasi, splash screen
├── app-foto.js             ← Generator prompt foto (25 modul)
├── app-dokumen.js          ← Generator dokumen resmi
├── app-barcode.js          ← Generator & cetak barcode label
├── app-screensaver.js      ← Screensaver display toko
├── app-cetak.js            ← Modul cetak foto (queue, layout, PDF)
├── cetak.html              ← Halaman cetak foto (window.open terpisah)
├── icon.png                ← Icon aplikasi
├── version.json            ← Manifest versi + hash semua file
├── crew/                   ← Foto Nexus Forge team (14 PNG ~2MB each)
│   ├── NEXUS_FORGE_OLAN.png
│   ├── NEXUS_FORGE_KAELA.png
│   └── ... (12 file lainnya)
└── generate-manifest.js    ← Script hash generator (jalankan sebelum push)
```

### Electron Build Files (TIDAK di GitHub app repo)
```
D:\KAELA PROJECT\ELECTRON-BUILD\
├── main.js             ← Electron main process
├── preload.js          ← Context bridge (electronAPI)
├── package.json        ← Build config (extraResources, targets)
├── icon.ico            ← Icon EXE
├── icon.png            ← Icon fallback
├── node_modules/       ← Dependencies
└── dist/               ← Output build
    ├── Toko Prestasi Tools Setup 2.1.0.exe
    └── Toko Prestasi Tools-v2.1.0-portable.exe
```

---

## GITHUB

- **Repo:** https://github.com/kaelatkp/toko-prestasi-tools
- **Branch:** main
- **Raw URL:** `https://raw.githubusercontent.com/kaelatkp/toko-prestasi-tools/main`
- **Releases:** https://github.com/kaelatkp/toko-prestasi-tools/releases/tag/v2.1.0
- **Download link client:**
  ```
  https://github.com/kaelatkp/toko-prestasi-tools/releases/download/v2.1.0/Toko.Prestasi.Tools-v2.1.0-portable.exe
  ```

---

## ELECTRON — main.js

| Fungsi | Keterangan |
|--------|-----------|
| `seedAppDir()` | Copy app files + crew/ dari EXE ke AppData saat pertama install |
| `checkUpdate()` | Fetch version.json dari GitHub, bandingkan hash, kirim IPC ke renderer |
| `apply-update` IPC | Download hanya file yang hash-nya beda, reload window |
| `do-print` IPC | `event.sender.printToPDF()` → simpan ke temp → buka di PDF viewer |
| `setWindowOpenHandler` | Child windows (cetak.html, dll) dapat preload.js yang sama |
| `did-create-window` | Context menu klik kanan di popup (Simpan Gambar, dll) |

**PENTING:** `main.js` dan `preload.js` ada di dalam EXE. Setiap perubahan wajib **rebuild EXE** dan **upload ulang ke GitHub Release**.

---

## PRELOAD — preload.js

```javascript
window.electronAPI = {
  onUpdateAvailable(cb)  // callback saat update tersedia
  onUpdateProgress(cb)   // callback progress download per file
  applyUpdate()          // trigger download + reload
  doPrint()              // printToPDF → buka di PDF viewer sistem
}
```

---

## CARA UPDATE APP (Olan)

### Update app files (HTML/JS/CSS) — TANPA rebuild EXE:
```cmd
cd "D:\KAELA PROJECT\#APLIKASIKU\TOKO PRESTASI TOOLS"
node generate-manifest.js
# Masukkan versi baru (misal: 2.4)
git add . && git commit -m "v2.4: deskripsi perubahan" && git push
```
Client akan dapat notif UPDATE dalam 5 menit.

### Update Electron (main.js / preload.js) — WAJIB rebuild:
```cmd
cd "D:\KAELA PROJECT\ELECTRON-BUILD"
npm run build
```
Lalu buka GitHub Release → edit → replace file EXE lama dengan yang baru dari `dist/`.

### Kapan wajib rebuild EXE:
- Perubahan di `main.js` atau `preload.js`
- Tambah folder/file baru ke `extraResources`
- Perubahan `package.json` build config

### Kapan TIDAK perlu rebuild:
- Edit HTML, CSS, JS app files
- Tambah modul baru di app-foto.js / app-dokumen.js
- Fix bug di app-cetak.js, app-barcode.js, dll

---

## CARA BUILD EXE

Buka **CMD** (BUKAN PowerShell — npm tidak jalan di PowerShell):
```cmd
cd "D:\KAELA PROJECT\ELECTRON-BUILD"
npm run build
```

Output di `dist/`:
- `Toko Prestasi Tools Setup 2.1.0.exe` — NSIS installer (untuk distribusi)
- `Toko Prestasi Tools-v2.1.0-portable.exe` — portable

---

## DISTRIBUSI KE KOMPUTER TOKO

1. Client download EXE dari GitHub Release link
2. Jalankan installer — **tidak perlu uninstall** versi lama
3. Install sekali → update otomatis selamanya via tombol UPDATE di app

---

## FILE REGISTRY

| File | Update via | Keterangan |
|------|-----------|-----------|
| `index.html` | git push | Main app shell + update banner |
| `tokens.css` | git push | Design system |
| `config.js` | git push | Data toko (nama, alamat, kontak, jam) |
| `app-core.js` | git push | Core, navigasi, splash, Nexus Forge modal |
| `app-foto.js` | git push | 25 modul foto, cari referensi |
| `app-dokumen.js` | git push | Generator dokumen resmi |
| `app-barcode.js` | git push | Generator barcode + cetak |
| `app-screensaver.js` | git push | Screensaver toko |
| `app-cetak.js` | git push | Cetak foto — queue, layout, PDF print |
| `cetak.html` | git push | Halaman cetak (window terpisah) |
| `version.json` | generate-manifest.js | Auto-generated, jangan edit manual |
| `crew/*.png` | rebuild EXE | Foto Nexus Forge — di-sync dari EXE ke AppData |

---

## MODUL APLIKASI

| Modul | File | Keterangan |
|-------|------|-----------|
| Generator Foto | `app-foto.js` | 25 modul: pasfoto, wisuda, couple, produk, event, dll |
| Generator Dokumen | `app-dokumen.js` | KTP, SIM, Paspor, SKCK, CPNS, KUA, dll |
| Barcode | `app-barcode.js` | Generate + cetak label barcode produk toko |
| Cetak Foto | `app-cetak.js` + `cetak.html` | Queue cetak, layout A4/F4/10R, PDF preview |
| Screensaver | `app-screensaver.js` | Display promosi toko |
| Nexus Forge | `app-core.js` | Modal info tim AI + foto crew |

---

## PRINT SYSTEM

### Kenapa PDF bukan dialog print langsung?
Windows Electron tidak support print preview via `window.print()`. Solusi: generate PDF → buka di Adobe/Edge PDF viewer → user print dari sana.

### Cetak Foto (cetak.html)
- `app-cetak.js` → `window.electronAPI.doPrint()` → IPC `do-print`
- `main.js` → `event.sender.printToPDF({ preferCSSPageSize: true })` → buka temp PDF
- Fallback: `window.print()` jika bukan EXE (dev mode browser)

### Cetak Barcode (app-barcode.js)
- `bcCetak()` → `window.electronAPI.doPrint()`
- Berjalan dari main window (bukan popup), electronAPI langsung tersedia

### Kenapa cetak.html perlu setWindowOpenHandler?
`cetak.html` dibuka via `window.open()` — child window tidak otomatis dapat preload.js. `setWindowOpenHandler` di `main.js` memastikan semua child window inject preload yang sama.

---

## RIWAYAT VERSI

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| v2.1 | — | Versi EXE awal — basis distribusi ke komputer toko |
| v2.2 | 19 Mei 2026 | Fix foto Nexus Forge, fix klik kanan popup, fix print PDF (cetak foto + barcode), fix footer tercetak |
| v2.3 | 20 Mei 2026 | Hapus ikon gunting ✂ dari garis potong cetak foto & barcode, garis potong lebih kontrast (#555) |

---

## BUG YANG SUDAH DIPERBAIKI

| # | Bug | Fix | Versi |
|---|-----|-----|-------|
| 1 | Foto Nexus Forge tidak tampil di EXE | Tambah `crew/**` ke extraResources + seed crew di main.js | v2.2 |
| 2 | Klik kanan tidak bisa di popup referensi | `did-create-window` context menu handler | v2.2 |
| 3 | Print preview "This app doesn't support" | `printToPDF` via IPC + buka PDF viewer | v2.2 |
| 4 | Print cetak foto → mencetak halaman index | Ganti `mainWindow` → `event.sender` di IPC handler | v2.2 |
| 5 | Footer ikut tercetak (jadi 2 halaman) | `footer { display: none }` di `@media print` cetak.html | v2.2 |
| 6 | Print barcode tidak support preview | Ganti `window.print()` → `electronAPI.doPrint()` | v2.2 |
| 7 | cetak.html tidak dapat electronAPI | `setWindowOpenHandler` inject preload ke child window | v2.2 |
| 8 | Ikon gunting ✂ menumpuki foto di cetak foto | Hapus `<text>✂</text>` dari SVG + `fillText('✂')` dari canvas preview di `app-cetak.js` | v2.3 |
| 9 | Ikon gunting ✂ menumpuki label di cetak barcode | Hapus `<text>✂</text>` dari SVG di `app-barcode.js` | v2.3 |
| 10 | Garis potong terlalu pudar (#bbb/#aaa) | Ganti ke `stroke:#555` di SVG & canvas — cetak foto dan barcode | v2.3 |

---

## KNOWN LIMITATIONS

- **Foto crew tidak bisa update via GitHub push** — disimpan di `resources/` dalam EXE. Untuk update foto crew, wajib rebuild EXE.
- **Versi EXE (2.1.0) berbeda dari versi app (2.3)** — normal. EXE version di `package.json`, app version di `version.json`.
- **Icon warning saat build** (`default Electron icon is used`) — tidak mempengaruhi hasil build.
- **PDF viewer tergantung sistem** — jika client tidak punya PDF viewer, file PDF tidak akan terbuka otomatis.

---

## ENVIRONMENT

| Item | Detail |
|------|--------|
| Platform | Windows 11 x64 |
| Electron | v31.7.7 |
| electron-builder | v24.13.3 |
| GitHub Account | kaelatkp |
| AppData path | `C:\Users\[user]\AppData\Roaming\TokoPrestasiTools\` |
| Electron Build | `D:\KAELA PROJECT\ELECTRON-BUILD\` |
| App Source | `D:\KAELA PROJECT\#APLIKASIKU\TOKO PRESTASI TOOLS\` |

---

## NEXUS FORGE TEAM

| Role | Nama | Tugas |
|------|------|-------|
| Project Director | OLAN | Owner, decision maker |
| Lead AI Architect | KAELA | Command Center, Dispatch |
| Business Analyst | CIPHER | BRD, Acceptance Criteria |
| UX/Design | LYRA | Wireframe, Design Spec |
| Senior Backend Dev | RAVEN | Web Engine, Data Pipeline |
| Frontend Dev | ZANE | HTML/CSS/JS, Rendering |
| Security Review | MARCUS | Security audit |
| Debug Specialist | DRAKE | Root Cause Analysis |
| QA Tester | VECTOR | Functional testing |
| Data QA | PRISM | Kalkulasi bisnis |
| Documentation | NOVA | README, User Guide |
| Patch Archive | REED | Bug Registry, Session State |
| Brainstorm | SEIRA | Eksplorasi konsep, ChatGPT |

---

## KONTAK TOKO

- **Nama:** Toko Prestasi
- **Lokasi:** Jl. Poros Sp 4, Marga Mulia, Kongbeng, Kutai Timur, Kalimantan Timur
- **WA:** 0813-6248-6065
- **Jam:** 07:00 – 21:00

---

*Nexus Forge Team · Toko Prestasi Tools v2.3 · 20 Mei 2026*
