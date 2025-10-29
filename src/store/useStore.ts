import { create } from 'zustand'
import type { VocaList, Word, VocaFolder } from '../types/electron'

interface AppState {
  // Current view
  currentView: 'home' | 'tab'
  currentVocaListId: number | null

  // Data
  folders: VocaFolder[]
  allVocaLists: VocaList[]
  openTabs: VocaList[]
  words: Word[]

  // Actions
  setCurrentView: (view: 'home' | 'tab') => void
  setCurrentVocaList: (vocaListId: number | null) => void

  setFolders: (folders: VocaFolder[]) => void
  setAllVocaLists: (vocaLists: VocaList[]) => void
  setOpenTabs: (tabs: VocaList[]) => void
  setWords: (words: Word[]) => void

  // Folder operations
  addFolder: (folder: VocaFolder) => void
  removeFolder: (folderId: number) => void

  // VocaList operations
  addVocaList: (vocaList: VocaList) => void
  removeVocaList: (vocaListId: number) => void
  updateVocaList: (vocaList: VocaList) => void

  // Open tab operations
  addOpenTab: (tab: VocaList) => void
  removeOpenTab: (vocaListId: number) => void

  // Word operations
  addWord: (word: Word) => void
  updateWord: (word: Word) => void
  removeWord: (wordId: number) => void
}

export const useStore = create<AppState>((set) => ({
  currentView: 'home',
  currentVocaListId: null,
  folders: [],
  allVocaLists: [],
  openTabs: [],
  words: [],

  setCurrentView: (view) => set({ currentView: view }),
  setCurrentVocaList: (vocaListId) => set({ currentVocaListId: vocaListId, currentView: vocaListId ? 'tab' : 'home' }),

  setFolders: (folders) => set({ folders }),
  setAllVocaLists: (vocaLists) => set({ allVocaLists: vocaLists }),
  setOpenTabs: (tabs) => set({ openTabs: tabs }),
  setWords: (words) => set({ words }),

  addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder].sort((a, b) => a.name.localeCompare(b.name)) })),
  removeFolder: (folderId) => set((state) => ({ folders: state.folders.filter((f) => f.id !== folderId) })),

  addVocaList: (vocaList) => set((state) => ({ allVocaLists: [...state.allVocaLists, vocaList].sort((a, b) => a.name.localeCompare(b.name)) })),
  removeVocaList: (vocaListId) => set((state) => ({
    allVocaLists: state.allVocaLists.filter((v) => v.id !== vocaListId),
    openTabs: state.openTabs.filter((v) => v.id !== vocaListId)
  })),
  updateVocaList: (vocaList) => set((state) => ({
    allVocaLists: state.allVocaLists.map((v) => v.id === vocaList.id ? vocaList : v).sort((a, b) => a.name.localeCompare(b.name)),
    openTabs: state.openTabs.map((v) => v.id === vocaList.id ? vocaList : v)
  })),

  addOpenTab: (tab) => set((state) => ({ openTabs: [...state.openTabs, tab] })),
  removeOpenTab: (vocaListId) => set((state) => ({ openTabs: state.openTabs.filter((v) => v.id !== vocaListId) })),

  addWord: (word) => set((state) => ({ words: [...state.words, word] })),
  updateWord: (word) => set((state) => ({
    words: state.words.map((w) => w.id === word.id ? word : w)
  })),
  removeWord: (wordId) => set((state) => ({
    words: state.words.filter((w) => w.id !== wordId)
  })),
}))
