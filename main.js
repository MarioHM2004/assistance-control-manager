const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

function createWindow () {
  const mainWindow = new BrowserWindow({
    title: 'ocm',
    width: 1000,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
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

app.whenReady().then(createWindow)
