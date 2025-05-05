const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getStakingStatus: () => ipcRenderer.invoke('getStakingStatus'),
  getAccountAddress: async (params) => ipcRenderer.invoke('getAccountAddress', params),
  delegateStake: async (params) => ipcRenderer.invoke('delegateStake', params),
  sendToAddress: async (params) => ipcRenderer.invoke('sendToAddress', params)
});

console.log('✅ preload.js loaded');



