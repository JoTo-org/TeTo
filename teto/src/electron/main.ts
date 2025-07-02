import {  app, BrowserWindow, screen } from 'electron';
import path from 'path';

app.on('ready', () => {
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

  // Load the React app
  mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));

  // Open the DevTools (optional)
  mainWindow.webContents.openDevTools();
});