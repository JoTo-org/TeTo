import { contextBridge, ipcRenderer } from 'electron';
import type { Teacher, Student, Course, EntityType, ElectronAPI } from '../types/electron';

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
    
  // New generic methods
  deleteEntity: (entityType: EntityType, id: number): Promise<boolean> => 
    ipcRenderer.invoke('delete-entity', entityType, id),
  
  updateEntity: (entityType: EntityType, id: number, data: any): Promise<boolean> => 
    ipcRenderer.invoke('update-entity', entityType, id, data),
    
  createEntity: (entityType: EntityType, data: any): Promise<number> => 
    ipcRenderer.invoke('create-entity', entityType, data),
    
  getEntityById: (entityType: EntityType, id: number): Promise<any> => 
    ipcRenderer.invoke('get-entity-by-id', entityType, id),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
console.log('electronAPI exposed to main world'); // Add this debug line