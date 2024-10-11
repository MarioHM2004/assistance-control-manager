const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const Database = require('better-sqlite3')
const dbPath = path.join(__dirname, 'sqlite.db')
const { handleEmployees } = require('./database/ipcEmployees');
let db

function createDatabase() {
  try {
    db = new Database(dbPath, { verbose: console.log });
    console.log('Database connected');
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  }

}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '/app/public/diselLogo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.webContents.openDevTools()

  const startUrl = url.format({
    pathname: path.join(__dirname, './app/build/index.html'),
    protocol: 'file:',
  })

  mainWindow.loadURL(startUrl)
}

app.whenReady().then(() => {
  createDatabase();
  createWindow();
  handleEmployees(db);
})


