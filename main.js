const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const mysql = require('mysql2/promise');
const { handleEmployees } = require('./database/ipcEmployees');
const { handleAbsenceTypes } = require('./database/ipcAbsenceTypes');
const { handleAbsences } = require('./database/ipcAbsences');
const { handleExportation } = require('./exportation/ipcExcel');
const { handleLoginAdmin } = require('./database/ipcAdmins');

let dbConnection;

const isDev = !app.isPackaged;

// this should be moved to an .env file
async function connectToDatabase() {
  try {
    dbConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'acm_user',
      password: 'acm_password',
      database: 'acm',
    });
    console.log('Connection to SQL stablished.');
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
    app.quit();
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'react_build', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const startUrl = url.format({
      pathname: path.join(__dirname, 'react_build', 'index.html'),
      protocol: 'file:',
    });
    mainWindow.loadURL(startUrl);
    mainWindow.webContents.closeDevTools();
  }
}

app.whenReady().then(async () => {
  await connectToDatabase();
  createWindow();

  handleLoginAdmin(dbConnection);
  handleEmployees(dbConnection);
  handleAbsenceTypes(dbConnection);
  handleAbsences(dbConnection);
  handleExportation();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (dbConnection) dbConnection.end();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
