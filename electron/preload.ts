const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script is running!')

contextBridge.exposeInMainWorld('electron', {
  db: {
    // Folders
    getFolders: () => ipcRenderer.invoke('db:getFolders'),
    createFolder: (name: string) => ipcRenderer.invoke('db:createFolder', name),
    deleteFolder: (id: number) => ipcRenderer.invoke('db:deleteFolder', id),

    // Voca Lists
    getVocaLists: () => ipcRenderer.invoke('db:getVocaLists'),
    createVocaList: (name: string, folderId: number | null) => ipcRenderer.invoke('db:createVocaList', name, folderId),
    updateVocaList: (id: number, name: string, folderId: number | null) => ipcRenderer.invoke('db:updateVocaList', id, name, folderId),
    deleteVocaList: (id: number) => ipcRenderer.invoke('db:deleteVocaList', id),

    // Open tabs
    getOpenTabs: () => ipcRenderer.invoke('db:getOpenTabs'),
    addOpenTab: (vocaListId: number) => ipcRenderer.invoke('db:addOpenTab', vocaListId),
    removeOpenTab: (vocaListId: number) => ipcRenderer.invoke('db:removeOpenTab', vocaListId),

    // Words
    getWords: (vocaListId: number) => ipcRenderer.invoke('db:getWords', vocaListId),
    createWord: (word: any) => ipcRenderer.invoke('db:createWord', word),
    updateWord: (word: any) => ipcRenderer.invoke('db:updateWord', word),
    deleteWord: (id: number) => ipcRenderer.invoke('db:deleteWord', id),
  },
  export: {
    toPDF: (vocaListId: number) => ipcRenderer.invoke('export:pdf', vocaListId),
    toExcel: (vocaListId: number) => ipcRenderer.invoke('export:excel', vocaListId),
  },
})
