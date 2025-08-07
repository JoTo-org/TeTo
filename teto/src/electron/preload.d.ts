import type { Teacher, Student, Course } from '../types/electron';
declare global {
    interface Window {
        electronAPI: {
            getAllTeachers: () => Promise<Teacher[]>;
            getAllStudents: () => Promise<Student[]>;
            getAllCourses: () => Promise<Course[]>;
        };
    }
}
