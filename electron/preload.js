const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getStakingStatus: () => ipcRenderer.invoke('getStakingStatus'),
  getAccountAddress: () => ipcRenderer.invoke('getAccountAddress'),
  delegateStake: async (params) => ipcRenderer.invoke('delegateStake', params)
});

console.log('✅ preload.js loaded');



