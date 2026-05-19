const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

const FOLDER_NAME = 'TOKO PRESTASI TOOLS';

/* ── Cari folder app di Google Drive ── */
function findAppFolder() {
  // Dev mode: pakai folder ini sendiri
  if (!app.isPackaged) return __dirname;

  // Cek semua drive letter — Google Drive biasanya G: H: dst
  for (const letter of 'GHIJKLMNOPQRSTUVWXYZ'.split('')) {
    const candidate = path.join(`${letter}:\\`, 'My Drive', FOLDER_NAME);
    if (fs.existsSync(path.join(candidate, 'index.html'))) return candidate;
  }

  // Fallback: home folder
  for (const sub of ['Google Drive', 'My Drive', 'GoogleDrive']) {
    const candidate = path.join(os.homedir(), sub, FOLDER_NAME);
    if (fs.existsSync(path.join(candidate, 'index.html'))) return candidate;
  }

  return null;
}

/* ── Baca versi dari version.json ── */
function readVersion(folder) {
  try {
    const vpath = path.join(folder, 'version.json');
    if (fs.existsSync(vpath)) return JSON.parse(fs.readFileSync(vpath, 'utf8')).version || null;
  } catch (e) {}
  return null;
}

let mainWindow   = null;
let appFolder    = null;
let runningVer   = null;

/* ── Cek update setiap 30 detik ── */
function startVersionWatcher() {
  runningVer = readVersion(appFolder);
  setInterval(() => {
    const latest = readVersion(appFolder);
    if (latest && runningVer && latest !== runningVer) {
      mainWindow?.webContents.send('update-available', latest);
    }
  }, 30_000);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800,
    minWidth: 900, minHeight: 600,
    title: 'Toko Prestasi Tools',
    icon: path.join(appFolder, 'icon.png'),
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.once('ready-to-show', () => { mainWindow.show(); mainWindow.maximize(); });
  mainWindow.loadFile(path.join(appFolder, 'index.html'));
  Menu.setApplicationMenu(null);
}

/* ── Reload saat user klik tombol update ── */
ipcMain.on('do-reload', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    runningVer = readVersion(appFolder);
    mainWindow.reload();
  }
});

app.whenReady().then(() => {
  appFolder = findAppFolder();

  if (!appFolder) {
    dialog.showErrorBox(
      'Folder tidak ditemukan',
      `Folder "${FOLDER_NAME}" tidak ditemukan di Google Drive.\n` +
      'Pastikan Google Drive sudah sync dan folder tersedia.'
    );
    app.quit();
    return;
  }

  createWindow();
  startVersionWatcher();
});

app.on('window-all-closed', () => app.quit());
