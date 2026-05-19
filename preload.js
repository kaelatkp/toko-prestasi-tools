const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (_, ver) => cb(ver)),
  doReload: () => ipcRenderer.send('do-reload')
});
