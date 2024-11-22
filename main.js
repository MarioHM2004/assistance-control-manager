const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const url = require('url');
const { handleEmployees } = require('./database/ipcEmployees');
const { handleAbsenceTypes } = require('./database/ipcAbsenceTypes');
const { handleAbsences } = require('./database/ipcAbsences');
const { handleExportation } = require('./exportation/ipcExcel');

let db;

const isDev = !app.isPackaged;

const initialDbPath = isDev
  ? path.join(__dirname, 'sqlite.db')
  : path.join(process.resourcesPath, 'sqlite.db');

function copyDatabaseToUserData() {
  const userDbPath = path.join(app.getPath('userData'), 'sqlite.db');
  console.log('Expected route for initial database:', initialDbPath);
  console.log('Destination route in userData:', userDbPath);

  try {
    if (!fs.existsSync(initialDbPath)) {
      throw new Error(`The initial file sqlite.db is not in: ${initialDbPath}`);
    }
    const initialStats = fs.statSync(initialDbPath);
    console.log('Initial size of sqlite.db:', initialStats.size, 'bytes');
    if (initialStats.size === 0) {
      throw new Error(`The initial file sqlite.db is empty: ${initialDbPath}`);
    }

    if (fs.existsSync(userDbPath)) {
      const userStats = fs.statSync(userDbPath);
      if (userStats.size > 0) {
        console.log('The database already exists in userData and is not empty. Size:', userStats.size, 'bytes');
        return userDbPath;
      } else {
        console.warn('Database in userData is empty. Overwriting...');
      }
    }
    console.log('Copying database to userData directory...');
    fs.copyFileSync(initialDbPath, userDbPath);
    console.log('Database copied to userData:', userDbPath);

    const copiedStats = fs.statSync(userDbPath);
    console.log('Size of file copied to userData:', copiedStats.size, 'bytes');
    if (copiedStats.size === 0) {
      throw new Error('The file copied to userData is empty.');
    }
  } catch (error) {
    console.error('Error copying database:', error.message);
  }

  return userDbPath;
}

function createDatabase() {
  const dbPath = copyDatabaseToUserData();
  try {
    db = new Database(dbPath, { verbose: console.log });
    console.log('Database initialized successfully from:', dbPath);
  } catch (error) {
    console.error('Error initializing database:', error.message);
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
  }
}

app.whenReady().then(() => {
  createDatabase();
  createWindow();
  handleEmployees(db);
  handleAbsenceTypes(db);
  handleAbsences(db);
  handleExportation();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
