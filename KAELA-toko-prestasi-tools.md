# TOKO PRESTASI TOOLS — HANDOFF DOCUMENT
> Terakhir diperbarui: 20 Mei 2026 · v2.5 · Ditulis oleh Kaela (AI Architect)

---

## RINGKASAN PROYEK

Aplikasi desktop Windows untuk Toko Prestasi — generator prompt foto AI, dokumen resmi, barcode label, cetak foto, dan screensaver toko. Dibangun dengan Electron (wrapper HTML/CSS/JS), didistribusikan via GitHub Releases, update otomatis via GitHub raw.

**Status:** ✅ Aktif & Live — v2.5

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
├── app-core.js             ← Core logic, navigasi, splash screen, daily theme
├── app-foto.js             ← Generator prompt foto (25 modul)
├── app-dokumen.js          ← Generator dokumen resmi
├── app-barcode.js          ← Generator & cetak barcode label
├── app-screensaver.js      ← Screensaver display toko
├── app-cetak.js            ← Modul cetak foto (queue, layout, PDF)
├── cetak.html              ← Halaman cetak foto (window.open terpisah)
├── themes.json             ← Data event themes (Idul Adha, HUT RI, dll)
├── changelog.json          ← Riwayat update — edit manual, entry terbaru di atas
├── icon.png                ← Icon aplikasi
├── version.json            ← Manifest versi + hash semua file (auto-generated)
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
# Masukkan versi baru (misal: 2.5)
git add . && git commit -m "v2.5: deskripsi perubahan" && git push
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
- Fix bug, tambah fitur beranda, daily theme, event theme, dll

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
| `index.html` | git push | Main app shell + update banner + daily-marquee div |
| `tokens.css` | git push | Design system + daily theme CSS + spotlight card CSS |
| `config.js` | git push | Data toko (nama, alamat, kontak, jam) |
| `app-core.js` | git push | Core, navigasi, splash, event theme, **daily theme system** |
| `app-foto.js` | git push | 25 modul foto, cari referensi |
| `app-dokumen.js` | git push | Generator dokumen resmi |
| `app-barcode.js` | git push | Generator barcode + cetak |
| `app-screensaver.js` | git push | Screensaver toko |
| `app-cetak.js` | git push | Cetak foto — queue, layout, PDF print |
| `cetak.html` | git push | Halaman cetak (window terpisah) |
| `themes.json` | git push | Data event themes — edit untuk tambah event baru |
| `changelog.json` | git push | Riwayat update — edit manual, tambah entry di atas array |
| `version.json` | generate-manifest.js | Auto-generated, jangan edit manual |
| `crew/*.png` | rebuild EXE | Foto Nexus Forge — di-sync dari EXE ke AppData |

---

## MODUL APLIKASI

| Modul | File | Keterangan |
|-------|------|-----------|
| Generator Foto | `app-foto.js` | 25 modul: pasfoto, wisuda, couple, produk, event, dll |
| Generator Dokumen | `app-dokumen.js` | KTP, SIM, Paspor, SKCK, CPNS, KUA, dll |
| Barcode | `app-barcode.js` + `barcode.html` | Generate + cetak label barcode — buka di window terpisah via `window.open('barcode.html','_blank')` |
| Cetak Foto | `app-cetak.js` + `cetak.html` | Queue cetak, layout A4/F4/10R, PDF preview |
| Screensaver | `app-screensaver.js` | Display promosi toko |
| Nexus Forge | `app-core.js` | Modal info tim AI + foto crew |
| **Daily Theme** | `app-core.js` + `tokens.css` | **Beranda ganti otomatis setiap hari** |
| Event Theme | `app-core.js` + `themes.json` | Tema khusus hari besar (Idul Adha, HUT RI, dll) |
| **Edit Foto** | `app-cetak.js` + `cetak.html` | Modal edit di Cetak Foto — putar, cermin, kemiringan, kecerahan, kontras, saturasi, garis tengah draggable |

---

## SISTEM DAILY THEME (v2.5) — BARU

### Cara kerja:
- `applyDailyTheme()` dipanggil saat app init, sebelum `loadEventTheme()`
- Membaca `new Date().getDay()` → load data dari `DAILY_THEMES` di `app-core.js`
- **Priority:** Event theme > Daily theme. Saat event aktif → daily marquee sembunyi otomatis

### Yang berubah per hari:
| Elemen | Keterangan |
|--------|-----------|
| Warna aksen | Override CSS vars `--green`, `--green-dark`, dll via `<style id="daily-theme-style">` |
| Background beranda | `#beranda` style.background |
| Hero title + subtitle | `.brnd-hero-title` / `.brnd-hero-sub` |
| Spotlight card | `.brnd-tool-card--spotlight` — badge "★ Hari Ini" di card featured |
| Daily marquee | `#daily-marquee` — pesan berjalan dari anggota Nexus Forge |

### Data 7 hari:
| Hari | Warna | Speaker | Featured Card |
|------|-------|---------|--------------|
| Minggu (0) | Ungu Lavender | OLZ | Dokumen |
| Senin (1) | Biru Navy | KAELA + SEIRA | Dokumen |
| Selasa (2) | Teal/Cyan | CIPHER + NOVA | Foto |
| Rabu (3) | Oranye | LYRA + REED | Cetak Foto |
| Kamis (4) | Hijau (default) | RAVEN + PRISM | Foto |
| Jumat (5) | Emas/Amber | ZANE + MARCUS | Barcode |
| Sabtu (6) | Merah Coral | DRAKE + VECTOR | Foto |

### Format pesan marquee:
```
💬 NAMA · "Pesan motivasi tentang pelayanan, kesabaran, kejujuran..."
```

### Catatan penting:
- Data pesan ada di `DAILY_THEMES` const di `app-core.js` — edit di sana untuk ganti pesan
- OLZ (Minggu) hanya pakai inisial — bukan nama Olan
- Kamis = warna hijau default agar tidak terasa "ganti" dari tampilan normal

---

## SISTEM EVENT THEME

### Data event ada di dua tempat:
1. **`themes.json`** (GitHub) — sumber utama, bisa diupdate tanpa rebuild
2. **`_THEMES_FALLBACK`** di `app-core.js` — fallback kalau themes.json tidak bisa di-fetch

### Event yang sudah ada (di fallback):
| Event | Tanggal | Emoji |
|-------|---------|-------|
| Idul Adha 1447H | 27 Mei 2026 | 🐑 |
| Hari Lahir Pancasila | 1 Jun 2026 | 🦅 |
| Tahun Baru Islam 1448H | 16 Jun 2026 | 🌙 |
| Hari Anak Nasional | 23 Jul 2026 | 👶 |
| HUT RI ke-81 | 17 Agt 2026 | 🇮🇩 |
| Natal 2026 | 25 Des 2026 | 🎄 |
| Hari Ibu | 22 Des 2026 | 💐 |
| Tahun Baru 2027 | 1 Jan 2027 | 🎊 |
| Hari Kartini 2027 | 21 Apr 2027 | 🌸 |
| Idul Fitri 1448H | 10 Mar 2027 | 🕌 |

### Dev tool: Ctrl+Shift+T
Tampilkan panel preview theme di beranda — bisa preview semua event tanpa nunggu tanggalnya.

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

## EDIT FOTO SISTEM (v2.5)

Modal edit di dalam `cetak.html` — dibuka dari Cetak Foto workspace.

### State (`state` object di `app-cetak.js`):
| Property | Default | Range | Keterangan |
|----------|---------|-------|-----------|
| `rotate` | 0 | 0/90/180/270 | Putar 90° |
| `angle` | 0 | -15..+15 | Kemiringan halus |
| `flipH` | false | bool | Cermin horizontal |
| `brightness` | 0 | -100..100 | Kecerahan |
| `contrast` | 0 | -100..100 | Kontras |
| `saturation` | 0 | -100..100 | Saturasi warna |
| `centerGuideX` | 0.5 | 0..1 | Posisi garis tengah (0=kiri, 1=kanan) |

### Garis Tengah Draggable:
- Garis cyan putus-putus di atas foto — tarik kiri/kanan untuk cocokkan hidung
- Digambar di canvas `drawEditPreview()` — **bukan** bagian dari hasil crop/export
- Handle circle di `H/2` dengan ikon `⟺`
- Hit zone: ±18px dari posisi garis → cursor berubah `ew-resize`
- Tombol "⊕ Reset ke Tengah" → `state.centerGuideX = 0.5`

### Filter CSS:
```javascript
// Diterapkan ke editPreviewCanvas (preview) dan offCanvas (export)
`brightness(${b}) contrast(${c}) saturate(${s})`
// b = (100 + brightness) / 100
// c = contrast >= 0 ? (100 + contrast*2)/100 : (100 + contrast)/100
// s = (100 + saturation) / 100
```

### Grid:
- Rule-of-thirds 3×3 — digambar setelah gambar, sebelum garis tengah
- Titik persimpangan: white dot radius 3.5px di atas shadow 5.5px
- Outer border: rgba(255,255,255,0.5)

---

## RIWAYAT VERSI

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| v2.1 | — | Versi EXE awal — basis distribusi ke komputer toko |
| v2.2 | 19 Mei 2026 | Fix foto Nexus Forge, fix klik kanan popup, fix print PDF (cetak foto + barcode), fix footer tercetak |
| v2.3 | 20 Mei 2026 | Hapus ikon gunting ✂ dari garis potong cetak foto & barcode, garis potong lebih kontrast (#555) |
| v2.4 | 20 Mei 2026 | Fix semua label versi tertinggal (v2.1→v2.3), tambah panel Riwayat Update di beranda, tambah changelog.json |
| **v2.5** | **20 Mei 2026** | **Daily theme, barcode jadi window terpisah (barcode.html), fix print count bug, edit foto: garis tengah + saturasi, changelog popup after splash, fix marquee, fix Ctrl+Shift+T** |

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
| 11 | Label versi tertinggal v2.1 di banyak tempat | Replace all v2.1 → v2.3 di index.html, app-core.js, app-screensaver.js, cetak.html | v2.4 |
| 12 | Daily marquee text wrapping vertikal bukan scroll horizontal | `.marquee-track` dan `.daily-track` tidak punya `white-space: nowrap`; `#daily-marquee` tidak ada `height` fixed | v2.5 |
| 13 | `Ctrl+Shift+T` dev panel tidak muncul | `e.key === 'T'` tidak match karena Chromium kirim lowercase `'t'`; fix ke `.toUpperCase()`; z-index 9998 dinaikkan ke 999999 | v2.5 |
| 14 | Changelog popup tidak muncul setelah splash | `loadChangelog()` dipanggil saat page init → modal muncul di balik splash → key localStorage langsung ter-set. Fix: pindah ke dalam `appMasuk()` (400ms setelah splash hilang); key baru di-set saat user klik Tutup, bukan saat modal dibuka | v2.5 |
| 15 | Changelog popup tidak muncul karena key sudah ter-set di run sebelumnya | Key `tp_cl_seen_vX` di-set terlalu dini (saat `openChangelog()` bukan saat `closeChangelog()`). Root cause: modal muncul di balik splash → user tidak lihat tapi key sudah set. Fix: key di-set di `closeChangelog()` + skip popup kalau data gagal dimuat | v2.5 |
| 16 | Barcode tercetak kurang dari jumlah yang diminta | `#bc-paper-scaler` punya `transform:scale(0.75)` saat zoom 75% — tidak di-reset saat print → PDF ikut scaled, halaman terpotong. Fix: tambah `#bc-paper-scaler{transform:scale(1)!important;}` ke print CSS di `bcCetak()` | v2.5 |

---

## CARA BUKA APP VIA COMPUTER-USE (AI Session)

```
# request_access dulu:
request_access: ["toko prestasi tools.exe"]
# lalu open:
open_application("Toko prestasi tools")
```

**JANGAN** buka "Barcode Generator Toko Prestasi" — itu app lama, sudah dimerger ke Prestasi Tools.

EXE yang benar: `D:\KAELA PROJECT\ELECTRON-BUILD\dist\win-unpacked\Toko Prestasi Tools.exe`
App files yang running: `C:\Users\Hype G12\AppData\Roaming\TokoPrestasiTools\`

Setelah edit source file, perlu:
1. `git push`
2. Copy file ke AppData (agar langsung efektif tanpa nunggu UPDATE)
3. Restart app

---

## KNOWN LIMITATIONS

- **Foto crew tidak bisa update via GitHub push** — disimpan di `resources/` dalam EXE. Untuk update foto crew, wajib rebuild EXE.
- **Versi EXE (2.1.0) berbeda dari versi app (2.5)** — normal. EXE version di `package.json`, app version di `version.json`.
- **Icon warning saat build** (`default Electron icon is used`) — tidak mempengaruhi hasil build.
- **PDF viewer tergantung sistem** — jika client tidak punya PDF viewer, file PDF tidak akan terbuka otomatis.

---

## IDE / TOOLS YANG DIPAKAI

- **Claude Code** — AI coding assistant (editor utama semua file)
- **VS Code** — terlihat di taskbar, untuk review manual
- **Git Bash / Terminal** — git push, generate-manifest
- **Node.js** — untuk `generate-manifest.js`

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

*Nexus Forge Team · Toko Prestasi Tools v2.5 · 20 Mei 2026*
