import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // Database operations
  db: {
    getTabs: () => ipcRenderer.invoke('db:getTabs'),
    createTab: (name: string) => ipcRenderer.invoke('db:createTab', name),
    deleteTab: (id: number) => ipcRenderer.invoke('db:deleteTab', id),
    getWords: (tabId: number) => ipcRenderer.invoke('db:getWords', tabId),
    createWord: (word: any) => ipcRenderer.invoke('db:createWord', word),
    updateWord: (word: any) => ipcRenderer.invoke('db:updateWord', word),
    deleteWord: (id: number) => ipcRenderer.invoke('db:deleteWord', id),
  },
  // Export operations
  export: {
    toPDF: (tabId: number) => ipcRenderer.invoke('export:pdf', tabId),
    toExcel: (tabId: number) => ipcRenderer.invoke('export:excel', tabId),
  },
})
