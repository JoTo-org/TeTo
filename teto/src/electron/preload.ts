import { contextBridge, ipcRenderer } from 'electron';
import type { Teacher, Student, Course } from '../types/electron';

console.log('Preload script is loading...'); // Add this debug line

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI = {
  getAllTeachers: (): Promise<Teacher[]> => 
    ipcRenderer.invoke('get-all-teachers'),
  
  getAllStudents: (): Promise<Student[]> => 
    ipcRenderer.invoke('get-all-students'),
    
  getAllCourses: (): Promise<Course[]> => 
    ipcRenderer.invoke('get-all-courses'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
console.log('electronAPI exposed to main world'); // Add this debug line

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getAllTeachers: () => Promise<Teacher[]>;
      getAllStudents: () => Promise<Student[]>;
      getAllCourses: () => Promise<Course[]>;
    };
  }
}