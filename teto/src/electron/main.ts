import { app, BrowserWindow, screen, ipcMain} from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { isDev } from './util.js';
import { initDatabase, createTables, populateDummyData, getAllTeachers, getAllStudents, getAllCourses } from './datautil.js';

app.on('ready', async () => {
  // Initialize database
  await initDatabase();
  await createTables();

  // Set up IPC handlers
  ipcMain.handle('get-all-teachers', async () => {
    try {
      return await getAllTeachers();
    } catch (error) {
      console.error('Error getting teachers:', error);
      throw error;
    }
  });

  ipcMain.handle('get-all-students', async () => {
    try {
      return await getAllStudents();
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  });

  ipcMain.handle('get-all-courses', async () => {
    try {
      return await getAllCourses();
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  console.log('Current directory path:', __dirname);
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: false, // Security: disable node integration
      contextIsolation: true, // Security: enable context isolation

      preload: join(__dirname, 'preload.js'), // Load the preload script
    },
  });

  if (isDev()) {
    await populateDummyData();
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(app.getAppPath(), '/dist-react/index.html'));
  }
});