const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getStakingStatus: () => ipcRenderer.invoke('getStakingStatus')
});

console.log('✅ preload.js loaded');



