const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
});

contextBridge.exposeInMainWorld('electronAPI', {
  loadVariables: (simulation) => ipcRenderer.invoke('load:variables', simulation),
  submitForm: (data) => ipcRenderer.send('submitForm', data)
});