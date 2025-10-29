export interface VocaFolder {
  id: number
  name: string
  created_at: string
}

export interface VocaList {
  id: number
  name: string
  voca_folder_id: number | null
  created_at: string
}

export interface Word {
  id: number
  voca_list_id: number
  english: string
  korean: string
  example: string
  created_at: string
}

export interface ElectronAPI {
  db: {
    getFolders: () => Promise<VocaFolder[]>
    createFolder: (name: string) => Promise<VocaFolder>
    deleteFolder: (id: number) => Promise<{ id: number }>
    getVocaLists: () => Promise<VocaList[]>
    createVocaList: (name: string, folderId: number | null) => Promise<VocaList>
    updateVocaList: (id: number, name: string, folderId: number | null) => Promise<VocaList>
    deleteVocaList: (id: number) => Promise<{ id: number }>
    getOpenTabs: () => Promise<VocaList[]>
    addOpenTab: (vocaListId: number) => Promise<{ vocaListId: number; position: number }>
    removeOpenTab: (vocaListId: number) => Promise<{ vocaListId: number }>
    getWords: (vocaListId: number) => Promise<Word[]>
    createWord: (word: Omit<Word, 'id' | 'created_at'>) => Promise<Word>
    updateWord: (word: Word) => Promise<Word>
    deleteWord: (id: number) => Promise<{ id: number }>
  }
  export: {
    toPDF: (vocaListId: number) => Promise<void>
    toExcel: (vocaListId: number) => Promise<void>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
