import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isDev = !app.isPackaged

// Remove menu bar
Menu.setApplicationMenu(null)

// Database setup
const dbPath = path.join(app.getPath('userData'), 'worder.db')
const db = new Database(dbPath)

// Initialize database
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS voca_folder (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS voca_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      voca_folder_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (voca_folder_id) REFERENCES voca_folder(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS word (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voca_list_id INTEGER NOT NULL,
      english TEXT NOT NULL,
      korean TEXT NOT NULL,
      example TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (voca_list_id) REFERENCES voca_list(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS open_tabs (
      voca_list_id INTEGER PRIMARY KEY,
      position INTEGER NOT NULL,
      FOREIGN KEY (voca_list_id) REFERENCES voca_list(id) ON DELETE CASCADE
    );
  `)
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs')
  console.log('Preload path:', preloadPath)
  console.log('__dirname:', __dirname)

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// IPC Handlers
function setupIpcHandlers() {
  // Folders
  ipcMain.handle('db:getFolders', () => {
    return db.prepare('SELECT * FROM voca_folder ORDER BY name COLLATE NOCASE').all()
  })

  ipcMain.handle('db:createFolder', (_, name: string) => {
    const result = db.prepare('INSERT INTO voca_folder (name) VALUES (?)').run(name)
    return { id: result.lastInsertRowid, name, created_at: new Date().toISOString() }
  })

  ipcMain.handle('db:deleteFolder', (_, id: number) => {
    db.prepare('DELETE FROM voca_folder WHERE id = ?').run(id)
    return { id }
  })

  // Voca Lists (단어장)
  ipcMain.handle('db:getVocaLists', () => {
    return db.prepare('SELECT * FROM voca_list ORDER BY name COLLATE NOCASE').all()
  })

  ipcMain.handle('db:createVocaList', (_, name: string, folderId: number | null) => {
    const result = db.prepare('INSERT INTO voca_list (name, voca_folder_id) VALUES (?, ?)').run(name, folderId)
    return { id: result.lastInsertRowid, name, voca_folder_id: folderId, created_at: new Date().toISOString() }
  })

  ipcMain.handle('db:updateVocaList', (_, id: number, name: string, folderId: number | null) => {
    db.prepare('UPDATE voca_list SET name = ?, voca_folder_id = ? WHERE id = ?').run(name, folderId, id)
    return { id, name, voca_folder_id: folderId }
  })

  ipcMain.handle('db:deleteVocaList', (_, id: number) => {
    db.prepare('DELETE FROM voca_list WHERE id = ?').run(id)
    return { id }
  })

  // Open tabs
  ipcMain.handle('db:getOpenTabs', () => {
    return db.prepare(`
      SELECT v.*, ot.position
      FROM voca_list v
      JOIN open_tabs ot ON v.id = ot.voca_list_id
      ORDER BY ot.position
    `).all()
  })

  ipcMain.handle('db:addOpenTab', (_, vocaListId: number) => {
    const maxPos = db.prepare('SELECT MAX(position) as max FROM open_tabs').get() as { max: number | null }
    const position = (maxPos.max || 0) + 1
    db.prepare('INSERT OR IGNORE INTO open_tabs (voca_list_id, position) VALUES (?, ?)').run(vocaListId, position)
    return { vocaListId, position }
  })

  ipcMain.handle('db:removeOpenTab', (_, vocaListId: number) => {
    db.prepare('DELETE FROM open_tabs WHERE voca_list_id = ?').run(vocaListId)
    return { vocaListId }
  })

  // Words
  ipcMain.handle('db:getWords', (_, vocaListId: number) => {
    return db.prepare('SELECT * FROM word WHERE voca_list_id = ? ORDER BY created_at DESC').all(vocaListId)
  })

  ipcMain.handle('db:createWord', (_, word: any) => {
    const result = db.prepare('INSERT INTO word (voca_list_id, english, korean, example) VALUES (?, ?, ?, ?)').run(
      word.voca_list_id,
      word.english,
      word.korean,
      word.example || ''
    )
    return { id: result.lastInsertRowid, ...word, created_at: new Date().toISOString() }
  })

  ipcMain.handle('db:updateWord', (_, word: any) => {
    db.prepare('UPDATE word SET english = ?, korean = ?, example = ? WHERE id = ?').run(
      word.english,
      word.korean,
      word.example || '',
      word.id
    )
    return word
  })

  ipcMain.handle('db:deleteWord', (_, id: number) => {
    db.prepare('DELETE FROM word WHERE id = ?').run(id)
    return { id }
  })
}

app.whenReady().then(() => {
  initDatabase()
  setupIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
