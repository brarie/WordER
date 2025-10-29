import { useEffect, useState, useRef, KeyboardEvent } from 'react'
import { useStore } from '../store/useStore'
import { Button } from './ui/button'
import { Plus, FileText } from 'lucide-react'
import type { Word } from '../types/electron'

interface CellPosition {
  row: number
  col: number
}

export function TabPage() {
  const { currentVocaListId, openTabs, words, setWords, addWord, updateWord, removeWord } = useStore()
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null)
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null)
  const [editValue, setEditValue] = useState('')
  const [columnWidths, setColumnWidths] = useState({ english: 200, korean: 200, example: 300 })
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentVocaList = openTabs.find((v) => v.id === currentVocaListId)

  // Load words when tab changes
  useEffect(() => {
    async function loadWords() {
      if (!window.electron || !currentVocaListId) return
      try {
        const loadedWords = await window.electron.db.getWords(currentVocaListId)
        setWords(loadedWords)
      } catch (error) {
        console.error('Failed to load words:', error)
      }
    }
    loadWords()
  }, [currentVocaListId, setWords])

  // Focus input when editing
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const getFieldName = (col: number): keyof Word => {
    if (col === 0) return 'english'
    if (col === 1) return 'korean'
    return 'example'
  }

  const startEditing = (row: number, col: number) => {
    const word = words[row]
    if (!word) return

    const field = getFieldName(col)
    setEditingCell({ row, col })
    setSelectedCell({ row, col })
    setEditValue(word[field] || '')
  }

  const stopEditing = async (save: boolean = true) => {
    if (!editingCell) return

    if (save && editValue !== undefined) {
      const word = words[editingCell.row]
      if (word) {
        const field = getFieldName(editingCell.col)
        const updatedWord = { ...word, [field]: editValue }

        try {
          await window.electron.db.updateWord(updatedWord)
          updateWord(updatedWord)
        } catch (error) {
          console.error('Failed to update word:', error)
        }
      }
    }

    setEditingCell(null)
    setEditValue('')
  }

  const handleCellClick = (row: number, col: number) => {
    if (editingCell) {
      stopEditing(true)
    }
    startEditing(row, col)
  }

  const handleCellDoubleClick = (row: number, col: number) => {
    startEditing(row, col)
  }

  const moveSelection = (deltaRow: number, deltaCol: number) => {
    if (!selectedCell && words.length > 0) {
      setSelectedCell({ row: 0, col: 0 })
      return
    }

    if (!selectedCell) return

    const newRow = Math.max(0, Math.min(words.length - 1, selectedCell.row + deltaRow))
    const newCol = Math.max(0, Math.min(2, selectedCell.col + deltaCol))

    setSelectedCell({ row: newRow, col: newCol })
  }

  const handleKeyDown = async (e: KeyboardEvent) => {
    // F2: Start editing
    if (e.key === 'F2' && selectedCell && !editingCell) {
      e.preventDefault()
      startEditing(selectedCell.row, selectedCell.col)
      return
    }

    // Escape: Cancel editing
    if (e.key === 'Escape' && editingCell) {
      e.preventDefault()
      stopEditing(false)
      return
    }

    // Enter: Save and move down
    if (e.key === 'Enter' && editingCell) {
      e.preventDefault()
      await stopEditing(true)
      moveSelection(1, 0)
      return
    }

    // Tab: Save and move right (Shift+Tab: move left)
    if (e.key === 'Tab' && editingCell) {
      e.preventDefault()
      await stopEditing(true)
      moveSelection(0, e.shiftKey ? -1 : 1)
      return
    }

    // Arrow keys when not editing
    if (!editingCell) {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        moveSelection(-1, 0)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        moveSelection(1, 0)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        moveSelection(0, -1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        moveSelection(0, 1)
      } else if (e.key === 'Tab') {
        e.preventDefault()
        moveSelection(0, e.shiftKey ? -1 : 1)
      }
    }

    // Ctrl+N: Add new row
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault()
      handleAddRow()
    }

    // Delete: Delete current row
    if (e.key === 'Delete' && selectedCell && !editingCell) {
      e.preventDefault()
      const word = words[selectedCell.row]
      if (word && window.confirm('이 단어를 삭제하시겠습니까?')) {
        try {
          await window.electron.db.deleteWord(word.id)
          removeWord(word.id)
          if (selectedCell.row >= words.length - 1) {
            setSelectedCell(words.length > 1 ? { row: words.length - 2, col: selectedCell.col } : null)
          }
        } catch (error) {
          console.error('Failed to delete word:', error)
        }
      }
    }
  }

  const handleAddRow = async () => {
    if (!window.electron || !currentVocaListId) return

    try {
      const newWord = await window.electron.db.createWord({
        voca_list_id: currentVocaListId,
        english: '',
        korean: '',
        example: '',
      })
      addWord(newWord)
      setSelectedCell({ row: words.length, col: 0 })
      setTimeout(() => {
        if (words.length >= 0) {
          startEditing(words.length, 0)
        }
      }, 10)
    } catch (error) {
      console.error('Failed to create word:', error)
    }
  }

  const startResizing = (column: string, e: React.MouseEvent) => {
    e.preventDefault()
    setResizingColumn(column)

    const startX = e.pageX
    const startWidth = columnWidths[column as keyof typeof columnWidths]

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.pageX - startX
      const newWidth = Math.max(100, startWidth + diff)
      setColumnWidths(prev => ({ ...prev, [column]: newWidth }))
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleHeaderDoubleClick = (column: string) => {
    // Auto-fit column width based on content
    const field = column as keyof Word
    const maxLength = Math.max(
      column.length * 10,
      ...words.map(w => (w[field]?.toString() || '').length * 8)
    )
    setColumnWidths(prev => ({ ...prev, [column]: Math.min(500, Math.max(100, maxLength + 40)) }))
  }

  if (!currentVocaList) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">단어장을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header with test button */}
      <div className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{currentVocaList.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            테스트 시작
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto" ref={tableRef}>
        <div className="min-w-full inline-block">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                <th
                  className="border-r border-b p-0 relative group"
                  style={{ width: columnWidths.english }}
                  onDoubleClick={() => handleHeaderDoubleClick('english')}
                >
                  <div className="px-4 py-3 font-semibold text-left">English</div>
                  <div
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => startResizing('english', e)}
                  />
                </th>
                <th
                  className="border-r border-b p-0 relative group"
                  style={{ width: columnWidths.korean }}
                  onDoubleClick={() => handleHeaderDoubleClick('korean')}
                >
                  <div className="px-4 py-3 font-semibold text-left">Meaning</div>
                  <div
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => startResizing('korean', e)}
                  />
                </th>
                <th
                  className="border-b p-0 relative group"
                  style={{ width: columnWidths.example }}
                  onDoubleClick={() => handleHeaderDoubleClick('example')}
                >
                  <div className="px-4 py-3 font-semibold text-left">Example</div>
                  <div
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => startResizing('example', e)}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {words.map((word, rowIndex) => (
                <tr key={word.id} className="group hover:bg-muted/50">
                  {[0, 1, 2].map((colIndex) => {
                    const field = getFieldName(colIndex)
                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
                    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex

                    return (
                      <td
                        key={colIndex}
                        className={`border-r border-b p-0 relative ${
                          isSelected ? 'ring-2 ring-primary ring-inset' : ''
                        } ${colIndex === 2 ? 'border-r-0' : ''}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => stopEditing(true)}
                            className="w-full h-full px-4 py-2 outline-none bg-background"
                          />
                        ) : (
                          <div className="px-4 py-2 min-h-[40px] cursor-text">
                            {word[field] || ''}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}

              {/* Add new row button */}
              <tr>
                <td colSpan={3} className="border-b p-0">
                  <button
                    onClick={handleAddRow}
                    className="w-full px-4 py-3 text-left text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>새 행 추가</span>
                    <span className="text-xs ml-auto">Ctrl+N</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
