const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

function createWindow () {
  const mainWindow = new BrowserWindow({
    title: 'ocm',
    width: 1000,
    height: 600,
    webPreferences: {
      webSecurity: false
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
