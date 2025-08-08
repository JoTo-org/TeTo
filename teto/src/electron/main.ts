import { app, BrowserWindow, screen, ipcMain } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { isDev } from './util.js';
import { 
  initDatabase, 
  createTables, 
  populateDummyData, 
  getAllTeachers, 
  getAllStudents, 
  getAllCourses,
  deleteTeacher,
  deleteStudent, 
  deleteCourse,
  deleteDepartment,
  deleteClassroom,
  deleteSchedule,
  deleteEnrollment,
  deleteGuardian,
  deleteLesson,
  updateTeacher,
  updateStudent,
  updateCourse,
  updateDepartment,
  updateClassroom,
  updateSchedule,
  updateEnrollment,
  updateGuardian,
  updateLesson,
  createTeacher,
  createStudent,
  createCourse,
  createDepartment,
  createClassroom,
  createSchedule,
  createEnrollment,
  createGuardian,
  createLesson,
  getTeacherById,
  getStudentById,
  getCourseById,
  getDepartmentById,
  getClassroomById,
  getScheduleById,
  getEnrollmentById,
  getGuardianById,
  getLessonById
} from './datautil.js';

app.on('ready', async () => {
  // Initialize database
  await initDatabase();
  await createTables();

  // Existing specific handlers
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

  // Add the missing generic handlers
  ipcMain.handle('delete-entity', async (event, entityType: string, id: number) => {
    try {
      console.log(`Deleting ${entityType} with ID: ${id}`);
      
      switch (entityType) {
        case 'teacher':
          return await deleteTeacher(id);
        case 'student':
          return await deleteStudent(id);
        case 'course':
          return await deleteCourse(id);
        case 'department':
          return await deleteDepartment(id);
        case 'classroom':
          return await deleteClassroom(id);
        case 'schedule':
          return await deleteSchedule(id);
        case 'enrollment':
          return await deleteEnrollment(id);
        case 'guardian':
          return await deleteGuardian(id);
        case 'lesson':
          return await deleteLesson(id);
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error);
      throw error;
    }
  });

  ipcMain.handle('update-entity', async (event, entityType: string, id: number, data: any) => {
    try {
      console.log(`Updating ${entityType} with ID: ${id}`, data);
      
      switch (entityType) {
        case 'teacher':
          return await updateTeacher(id, data);
        case 'student':
          return await updateStudent(id, data);
        case 'course':
          return await updateCourse(id, data);
        case 'department':
          return await updateDepartment(id, data);
        case 'classroom':
          return await updateClassroom(id, data);
        case 'schedule':
          return await updateSchedule(id, data);
        case 'enrollment':
          return await updateEnrollment(id, data);
        case 'guardian':
          return await updateGuardian(id, data);
        case 'lesson':
          return await updateLesson(id, data);
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
    } catch (error) {
      console.error(`Error updating ${entityType}:`, error);
      throw error;
    }
  });

  ipcMain.handle('create-entity', async (event, entityType: string, data: any) => {
    try {
      console.log(`Creating ${entityType}:`, data);
      
      switch (entityType) {
        case 'teacher':
          return await createTeacher(data);
        case 'student':
          return await createStudent(data);
        case 'course':
          return await createCourse(data);
        case 'department':
          return await createDepartment(data);
        case 'classroom':
          return await createClassroom(data);
        case 'schedule':
          return await createSchedule(data);
        case 'enrollment':
          return await createEnrollment(data);
        case 'guardian':
          return await createGuardian(data);
        case 'lesson':
          return await createLesson(data);
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
    } catch (error) {
      console.error(`Error creating ${entityType}:`, error);
      throw error;
    }
  });

  ipcMain.handle('get-entity-by-id', async (event, entityType: string, id: number) => {
    try {
      console.log(`Getting ${entityType} with ID: ${id}`);
      
      switch (entityType) {
        case 'teacher':
          return await getTeacherById(id);
        case 'student':
          return await getStudentById(id);
        case 'course':
          return await getCourseById(id);
        case 'department':
          return await getDepartmentById(id);
        case 'classroom':
          return await getClassroomById(id);
        case 'schedule':
          return await getScheduleById(id);
        case 'enrollment':
          return await getEnrollmentById(id);
        case 'guardian':
          return await getGuardianById(id);
        case 'lesson':
          return await getLessonById(id);
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
    } catch (error) {
      console.error(`Error getting ${entityType}:`, error);
      throw error;
    }
  });

  // Rest of your app setup code...
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  console.log('Current directory path:', __dirname);
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  if (isDev()) {
    await populateDummyData();
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist-react/index.html'));
  }
});