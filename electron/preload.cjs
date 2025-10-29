const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script is running!')

contextBridge.exposeInMainWorld('electron', {
  db: {
    // Folders
    getFolders: () => ipcRenderer.invoke('db:getFolders'),
    createFolder: (name) => ipcRenderer.invoke('db:createFolder', name),
    deleteFolder: (id) => ipcRenderer.invoke('db:deleteFolder', id),

    // Voca Lists
    getVocaLists: () => ipcRenderer.invoke('db:getVocaLists'),
    createVocaList: (name, folderId) => ipcRenderer.invoke('db:createVocaList', name, folderId),
    updateVocaList: (id, name, folderId) => ipcRenderer.invoke('db:updateVocaList', id, name, folderId),
    deleteVocaList: (id) => ipcRenderer.invoke('db:deleteVocaList', id),

    // Open tabs
    getOpenTabs: () => ipcRenderer.invoke('db:getOpenTabs'),
    addOpenTab: (vocaListId) => ipcRenderer.invoke('db:addOpenTab', vocaListId),
    removeOpenTab: (vocaListId) => ipcRenderer.invoke('db:removeOpenTab', vocaListId),

    // Words
    getWords: (vocaListId) => ipcRenderer.invoke('db:getWords', vocaListId),
    createWord: (word) => ipcRenderer.invoke('db:createWord', word),
    updateWord: (word) => ipcRenderer.invoke('db:updateWord', word),
    deleteWord: (id) => ipcRenderer.invoke('db:deleteWord', id),
  },
  export: {
    toPDF: (vocaListId) => ipcRenderer.invoke('export:pdf', vocaListId),
    toExcel: (vocaListId) => ipcRenderer.invoke('export:excel', vocaListId),
  },
})
