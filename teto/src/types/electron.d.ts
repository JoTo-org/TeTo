// Entity interfaces
export interface Teacher {
  TeacherID?: number;
  FirstName: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  HireDate?: string;
  DepartmentID?: number;
}

export interface Student {
  StudentID?: number;
  FirstName: string;
  LastName: string;
  DateOfBirth?: string;
  Gender?: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  EnrollmentDate?: string;
}

export interface Course {
  CourseID?: number;
  CourseName: string;
  Description?: string;
  Credits?: number;
  DepartmentID?: number;
}

export type EntityType = 'teacher' | 'student' | 'course' | 'department' | 'classroom' | 'schedule' | 'enrollment' | 'guardian' | 'lesson';

// ElectronAPI interface
export interface ElectronAPI {
  getAllTeachers: () => Promise<Teacher[]>;
  getAllStudents: () => Promise<Student[]>;
  getAllCourses: () => Promise<Course[]>;
  deleteEntity: (entityType: EntityType, id: number) => Promise<boolean>;
  updateEntity: (entityType: EntityType, id: number, data: any) => Promise<boolean>;
  createEntity: (entityType: EntityType, data: any) => Promise<number>;
  getEntityById: (entityType: EntityType, id: number) => Promise<any>;
}

// Global declaration - ONLY HERE
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}