import { Plus, Book, Folder, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useStore } from '../store/useStore'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'

export function HomePage() {
  const { folders, allVocaLists, setCurrentVocaList } = useStore()
  const [isVocaListDialogOpen, setIsVocaListDialogOpen] = useState(false)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [newVocaListName, setNewVocaListName] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [draggedVocaListId, setDraggedVocaListId] = useState<number | null>(null)

  // 폴더에 속하지 않은 단어장들 (이름순 정렬)
  const unfoldered = allVocaLists.filter((v) => !v.voca_folder_id).sort((a, b) => a.name.localeCompare(b.name))

  const handleOpenVocaList = async (vocaListId: number) => {
    if (!window.electron) return
    await window.electron.db.addOpenTab(vocaListId)
    const openTabs = await window.electron.db.getOpenTabs()
    useStore.getState().setOpenTabs(openTabs)
    setCurrentVocaList(vocaListId)
  }

  const handleCreateVocaList = async () => {
    const trimmedName = newVocaListName.trim()
    if (!trimmedName || !window.electron) return

    try {
      const vocaList = await window.electron.db.createVocaList(trimmedName, null)
      await window.electron.db.addOpenTab(vocaList.id)

      const openTabs = await window.electron.db.getOpenTabs()
      const allVocaLists = await window.electron.db.getVocaLists()
      useStore.getState().setOpenTabs(openTabs)
      useStore.getState().setAllVocaLists(allVocaLists)

      setNewVocaListName('')
      setIsVocaListDialogOpen(false)
    } catch (error) {
      console.error('Failed to create voca list:', error)
    }
  }

  const handleCreateFolder = async () => {
    const trimmedName = newFolderName.trim()
    if (!trimmedName || !window.electron) return

    try {
      await window.electron.db.createFolder(trimmedName)
      const folders = await window.electron.db.getFolders()
      useStore.getState().setFolders(folders)

      setNewFolderName('')
      setIsFolderDialogOpen(false)
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  const handleDragStart = (vocaListId: number) => {
    setDraggedVocaListId(vocaListId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnFolder = async (folderId: number) => {
    if (!draggedVocaListId || !window.electron) return

    const vocaList = allVocaLists.find(v => v.id === draggedVocaListId)
    if (!vocaList) return

    await window.electron.db.updateVocaList(draggedVocaListId, vocaList.name, folderId)

    const updatedVocaLists = await window.electron.db.getVocaLists()
    useStore.getState().setAllVocaLists(updatedVocaLists)
    setDraggedVocaListId(null)
  }

  const handleDropOutsideFolder = async () => {
    if (!draggedVocaListId || !window.electron) return

    const vocaList = allVocaLists.find(v => v.id === draggedVocaListId)
    if (!vocaList) return

    await window.electron.db.updateVocaList(draggedVocaListId, vocaList.name, null)

    const updatedVocaLists = await window.electron.db.getVocaLists()
    useStore.getState().setAllVocaLists(updatedVocaLists)
    setDraggedVocaListId(null)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              WordER
            </h1>
            <p className="text-xl text-muted-foreground">
              단어 암기 프로그램
            </p>
          </div>

          <div className="flex gap-4 justify-center mb-8">
            <Button size="lg" className="gap-2" onClick={() => setIsVocaListDialogOpen(true)}>
              <Plus className="h-5 w-5" />
              새 단어장 만들기
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setIsFolderDialogOpen(true)}>
              <Folder className="h-5 w-5" />
              새 폴더 만들기
            </Button>
          </div>

          {/* 폴더들 */}
          {folders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">폴더</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map((folder) => {
                  const vocaListsInFolder = allVocaLists
                    .filter((v) => v.voca_folder_id === folder.id)
                    .sort((a, b) => a.name.localeCompare(b.name))

                  return (
                    <Card
                      key={folder.id}
                      className="hover:shadow-lg transition-shadow"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnFolder(folder.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FolderOpen className="h-5 w-5 text-amber-500" />
                          {folder.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-2">
                          {vocaListsInFolder.length}개 단어장
                        </div>
                        <div className="space-y-1">
                          {vocaListsInFolder.map((vocaList) => (
                            <div
                              key={vocaList.id}
                              draggable
                              onDragStart={() => handleDragStart(vocaList.id)}
                              onClick={() => handleOpenVocaList(vocaList.id)}
                              className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer text-sm"
                            >
                              <Book className="h-4 w-4" />
                              <span>{vocaList.name}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* 단어장들 */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropOutsideFolder}
            className={unfoldered.length === 0 && folders.length > 0 ? 'min-h-[200px] border-2 border-dashed border-muted rounded-lg flex items-center justify-center' : ''}
          >
            {unfoldered.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold mb-4">단어장</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unfoldered.map((vocaList) => (
                    <Card
                      key={vocaList.id}
                      draggable
                      onDragStart={() => handleDragStart(vocaList.id)}
                      className="hover:shadow-lg transition-shadow cursor-move"
                    >
                      <CardHeader onClick={() => handleOpenVocaList(vocaList.id)} className="cursor-pointer">
                        <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                          <Book className="h-5 w-5" />
                          {vocaList.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">단어 개수</span>
                          <span className="font-semibold">0개</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : folders.length === 0 ? (
              <Card className="max-w-md mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Book className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">아직 단어장이 없습니다</p>
                  <p className="text-sm text-muted-foreground">
                    새 단어장을 만들어 단어 학습을 시작하세요
                  </p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-muted-foreground text-center">
                폴더에서 단어장을 여기로 드래그하세요
              </p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isVocaListDialogOpen} onOpenChange={setIsVocaListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 단어장 만들기</DialogTitle>
            <DialogDescription>
              새로운 단어장의 이름을 입력하세요
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="단어장 이름"
            value={newVocaListName}
            onChange={(e) => setNewVocaListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newVocaListName.trim()) {
                handleCreateVocaList()
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVocaListDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateVocaList} disabled={!newVocaListName.trim()}>
              만들기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 폴더 만들기</DialogTitle>
            <DialogDescription>
              새로운 폴더의 이름을 입력하세요
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="폴더 이름"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newFolderName.trim()) {
                handleCreateFolder()
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              만들기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
