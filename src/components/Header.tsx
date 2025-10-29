import { Home, X } from 'lucide-react';
import { Button } from './ui/button';
import { useStore } from '../store/useStore';

export function Header() {
  const {
    currentView,
    currentVocaListId,
    openTabs,
    setCurrentVocaList,
    removeOpenTab,
  } = useStore();

  const handleCloseTab = async (e: React.MouseEvent, vocaListId: number) => {
    e.stopPropagation();
    if (!window.electron) return;

    const currentIndex = openTabs.findIndex(tab => tab.id === vocaListId);
    await window.electron.db.removeOpenTab(vocaListId);
    removeOpenTab(vocaListId);

    // If closing the current tab, move to next/previous tab
    if (currentVocaListId === vocaListId) {
      if (openTabs.length > 1) {
        if (currentIndex < openTabs.length - 1) {
          // Move to next tab
          setCurrentVocaList(openTabs[currentIndex + 1].id);
        } else {
          // Move to previous tab (when closing last tab)
          setCurrentVocaList(openTabs[currentIndex - 1].id);
        }
      } else {
        // No more tabs, go to home
        setCurrentVocaList(null);
      }
    }
  };

  return (
    <>
      <header className="border-b bg-background">
        <div className="flex items-center h-14 px-4 gap-2">
          <Button
            variant={currentView === 'home' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setCurrentVocaList(null)}
          >
            <Home className="h-4 w-4" />
          </Button>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {openTabs.map((vocaList) => (
              <div
                key={vocaList.id}
                className={`
                  group flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
                  hover:bg-accent hover:text-accent-foreground
                  ${
                    currentVocaListId === vocaList.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }
                `}
                onClick={() => setCurrentVocaList(vocaList.id)}
              >
                <span>{vocaList.name}</span>
                <button
                  onClick={(e) => handleCloseTab(e, vocaList.id)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-background/50 rounded p-0.5 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
