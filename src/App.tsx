import { useEffect } from 'react'
import { Header } from './components/Header'
import { HomePage } from './components/HomePage'
import { TabPage } from './components/TabPage'
import { useStore } from './store/useStore'

function App() {
  const { currentView, currentVocaListId, openTabs, setFolders, setAllVocaLists, setOpenTabs, setCurrentVocaList, removeOpenTab } = useStore()

  useEffect(() => {
    // Load data from database
    async function loadData() {
      // Wait for electron to be available (retry up to 10 times)
      let retries = 0
      while (!window.electron && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        retries++
      }

      if (!window.electron) {
        console.error('Electron API not available')
        return
      }

      try {
        const [folders, allVocaLists, openTabs] = await Promise.all([
          window.electron.db.getFolders(),
          window.electron.db.getVocaLists(),
          window.electron.db.getOpenTabs(),
        ])

        setFolders(folders)
        setAllVocaLists(allVocaLists)
        setOpenTabs(openTabs)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [setFolders, setAllVocaLists, setOpenTabs])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // HOME key: Go to home
      if (e.key === 'Home') {
        e.preventDefault()
        setCurrentVocaList(null)
      }

      // Ctrl+W: Close current tab
      if (e.ctrlKey && e.key === 'w' && currentVocaListId && window.electron) {
        e.preventDefault()
        const currentIndex = openTabs.findIndex(tab => tab.id === currentVocaListId)
        await window.electron.db.removeOpenTab(currentVocaListId)
        removeOpenTab(currentVocaListId)

        // Move to next tab (or previous if no next tab exists)
        if (openTabs.length > 1) {
          if (currentIndex < openTabs.length - 1) {
            // Move to next tab
            setCurrentVocaList(openTabs[currentIndex + 1].id)
          } else {
            // Move to previous tab (when closing last tab)
            setCurrentVocaList(openTabs[currentIndex - 1].id)
          }
        } else {
          // No more tabs, go to home
          setCurrentVocaList(null)
        }
      }

      // Ctrl+Tab: Next tab
      if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey && openTabs.length > 0) {
        e.preventDefault()
        const currentIndex = openTabs.findIndex(tab => tab.id === currentVocaListId)
        const nextIndex = (currentIndex + 1) % openTabs.length
        setCurrentVocaList(openTabs[nextIndex].id)
      }

      // Ctrl+Shift+Tab: Previous tab
      if (e.ctrlKey && e.key === 'Tab' && e.shiftKey && openTabs.length > 0) {
        e.preventDefault()
        const currentIndex = openTabs.findIndex(tab => tab.id === currentVocaListId)
        const prevIndex = (currentIndex - 1 + openTabs.length) % openTabs.length
        setCurrentVocaList(openTabs[prevIndex].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentVocaListId, openTabs, setCurrentVocaList, removeOpenTab])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {currentView === 'home' ? <HomePage /> : <TabPage />}
      </main>
    </div>
  )
}

export default App
