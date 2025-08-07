export interface ElectronAPI {
  getAllTeachers: () => Promise<Teacher[]>;
  getAllStudents: () => Promise<Student[]>;
  getAllCourses: () => Promise<Course[]>;
  // Add other database functions as needed
}

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
  Email?: string;
  Phone?: string;
  DateOfBirth?: string;
  Gender?: string;
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

declare global {
  interface Window {
    electronAPI: {
      getAllTeachers: () => Promise<Teacher[]>;
      getAllStudents: () => Promise<Student[]>;
      getAllCourses: () => Promise<Course[]>;
    };
  }
}