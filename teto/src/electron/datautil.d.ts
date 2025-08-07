import sqlite3 from 'sqlite3';
/**
 * Initialize the database connection
 */
export declare const initDatabase: () => Promise<sqlite3.Database>;
/**
 * Create database tables if they don't exist
 */
export declare const createTables: () => Promise<void>;
/**
 * Populate the database with dummy data for development and testing
 */
export declare const populateDummyData: () => Promise<void>;
export interface Department {
    DepartmentID?: number;
    DepartmentName: string;
    HeadOfDepartmentID?: number;
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
export interface Classroom {
    ClassroomID?: number;
    RoomNumber: string;
    Building?: string;
    Capacity?: number;
}
export interface Schedule {
    ScheduleID?: number;
    CourseID: number;
    TeacherID: number;
    ClassroomID: number;
    StartTime?: string;
    EndTime?: string;
    DayOfWeek?: string;
}
export interface Enrollment {
    EnrollmentID?: number;
    StudentID: number;
    CourseID: number;
    EnrollmentDate?: string;
    FinalGrade?: string;
}
export interface Guardian {
    GuardianID?: number;
    StudentID: number;
    Name: string;
    Relationship?: string;
    Phone?: string;
    Email?: string;
}
export interface Lesson {
    LessonID?: number;
    CourseID: number;
    Title?: string;
    Description?: string;
    Notes?: string;
    ContentURL?: string;
    OrderNumber?: number;
    Duration?: number;
    CreatedAt?: string;
    UpdatedAt?: string;
}
export declare const createDepartment: (department: Department) => Promise<{
    id: number;
}>;
export declare const getDepartmentById: (id: number) => Promise<Department | null>;
export declare const getAllDepartments: () => Promise<Department[]>;
export declare const updateDepartment: (id: number, department: Department) => Promise<{
    id: number;
}>;
export declare const deleteDepartment: (id: number) => Promise<{
    id: number;
}>;
export declare const createTeacher: (teacher: Teacher) => Promise<{
    id: number;
}>;
export declare const getTeacherById: (id: number) => Promise<Teacher | null>;
export declare const getAllTeachers: () => Promise<Teacher[]>;
export declare const updateTeacher: (id: number, teacher: Teacher) => Promise<{
    id: number;
}>;
export declare const deleteTeacher: (id: number) => Promise<{
    id: number;
}>;
export declare const createStudent: (student: Student) => Promise<{
    id: number;
}>;
export declare const getStudentById: (id: number) => Promise<Student | null>;
export declare const getAllStudents: () => Promise<Student[]>;
export declare const updateStudent: (id: number, student: Student) => Promise<{
    id: number;
}>;
export declare const deleteStudent: (id: number) => Promise<{
    id: number;
}>;
export declare const createCourse: (course: Course) => Promise<{
    id: number;
}>;
export declare const getCourseById: (id: number) => Promise<Course | null>;
export declare const getAllCourses: () => Promise<Course[]>;
export declare const updateCourse: (id: number, course: Course) => Promise<{
    id: number;
}>;
export declare const deleteCourse: (id: number) => Promise<{
    id: number;
}>;
export declare const createClassroom: (classroom: Classroom) => Promise<{
    id: number;
}>;
export declare const getClassroomById: (id: number) => Promise<Classroom | null>;
export declare const getAllClassrooms: () => Promise<Classroom[]>;
export declare const updateClassroom: (id: number, classroom: Classroom) => Promise<{
    id: number;
}>;
export declare const deleteClassroom: (id: number) => Promise<{
    id: number;
}>;
export declare const createSchedule: (schedule: Schedule) => Promise<{
    id: number;
}>;
export declare const getScheduleById: (id: number) => Promise<Schedule | null>;
export declare const getAllSchedules: () => Promise<Schedule[]>;
export declare const updateSchedule: (id: number, schedule: Schedule) => Promise<{
    id: number;
}>;
export declare const deleteSchedule: (id: number) => Promise<{
    id: number;
}>;
export declare const createEnrollment: (enrollment: Enrollment) => Promise<{
    id: number;
}>;
export declare const getEnrollmentById: (id: number) => Promise<Enrollment | null>;
export declare const getAllEnrollments: () => Promise<Enrollment[]>;
export declare const updateEnrollment: (id: number, enrollment: Enrollment) => Promise<{
    id: number;
}>;
export declare const deleteEnrollment: (id: number) => Promise<{
    id: number;
}>;
export declare const createGuardian: (guardian: Guardian) => Promise<{
    id: number;
}>;
export declare const getGuardianById: (id: number) => Promise<Guardian | null>;
export declare const getAllGuardians: () => Promise<Guardian[]>;
export declare const updateGuardian: (id: number, guardian: Guardian) => Promise<{
    id: number;
}>;
export declare const deleteGuardian: (id: number) => Promise<{
    id: number;
}>;
export declare const createLesson: (lesson: Lesson) => Promise<{
    id: number;
}>;
export declare const getLessonById: (id: number) => Promise<Lesson | null>;
export declare const getAllLessons: () => Promise<Lesson[]>;
export declare const getLessonsByCourse: (courseId: number) => Promise<Lesson[]>;
export declare const updateLesson: (id: number, lesson: Lesson) => Promise<{
    id: number;
}>;
export declare const deleteLesson: (id: number) => Promise<{
    id: number;
}>;
/**
 * Close the database connection
 */
export declare const closeDatabase: () => Promise<void>;
/**
 * Get database instance
 */
export declare const getDatabase: () => sqlite3.Database;
