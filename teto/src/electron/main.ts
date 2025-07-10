import {  app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { createTables, populateDummyData } from './datautil.js';

app.on('ready', () => {
// Initialize database
createTables();

const { width, height } = screen.getPrimaryDisplay().workAreaSize;
const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    },
});
mainWindow.maximize();

  if (isDev()) {
    populateDummyData();
    mainWindow.loadURL('http://localhost:3000');
    // Open the DevTools (optional)
    mainWindow.webContents.openDevTools();
  }else {   // Load the React app
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }
});