import { app } from 'electron';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// Database connection
let db: sqlite3.Database;

/**
 * Initialize the database connection
 */
export const initDatabase = async (): Promise<sqlite3.Database> => {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'teto-data.db');
    
    // Ensure the directory exists
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    
    return new Promise((resolve, reject) => {
        // SQLite will automatically create the database file if it doesn't exist
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
            console.error('Database opening error: ', err);
            reject(err);
            return;
            }
            
            console.log('Connected to the SQLite database');
            createTables()
                .then(() => resolve(db))
                .catch(reject);
        });
    });
};

/**
 * Create database tables if they don't exist
 */
export const createTables = async (): Promise<void> => {
    const queries = [
        `CREATE TABLE IF NOT EXISTS Department (
            DepartmentID INTEGER PRIMARY KEY AUTOINCREMENT,
            DepartmentName TEXT NOT NULL,
            HeadOfDepartmentID INTEGER,
            FOREIGN KEY (HeadOfDepartmentID) REFERENCES Teacher (TeacherID)
        )`,
        
        `CREATE TABLE IF NOT EXISTS Teacher (
            TeacherID INTEGER PRIMARY KEY AUTOINCREMENT,
            FirstName TEXT NOT NULL,
            LastName TEXT NOT NULL,
            Email TEXT UNIQUE,
            Phone TEXT,
            HireDate DATE,
            DepartmentID INTEGER,
            FOREIGN KEY (DepartmentID) REFERENCES Department (DepartmentID)
        )`,
        
        `CREATE TABLE IF NOT EXISTS Student (
            StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
            FirstName TEXT NOT NULL,
            LastName TEXT NOT NULL,
            DateOfBirth DATE,
            Gender TEXT,
            Email TEXT UNIQUE,
            Phone TEXT,
            Address TEXT,
            EnrollmentDate DATE DEFAULT CURRENT_DATE
        )`,
        
        `CREATE TABLE IF NOT EXISTS Course (
            CourseID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseName TEXT NOT NULL,
            Description TEXT,
            Credits INTEGER,
            DepartmentID INTEGER,
            FOREIGN KEY (DepartmentID) REFERENCES Department (DepartmentID)
        )`,
        
        `CREATE TABLE IF NOT EXISTS Classroom (
            ClassroomID INTEGER PRIMARY KEY AUTOINCREMENT,
            RoomNumber TEXT NOT NULL,
            Building TEXT,
            Capacity INTEGER
        )`,
        
        `CREATE TABLE IF NOT EXISTS Schedule (
            ScheduleID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseID INTEGER,
            TeacherID INTEGER,
            ClassroomID INTEGER,
            StartTime TIME,
            EndTime TIME,
            DayOfWeek TEXT,
            FOREIGN KEY (CourseID) REFERENCES Course (CourseID),
            FOREIGN KEY (TeacherID) REFERENCES Teacher (TeacherID),
            FOREIGN KEY (ClassroomID) REFERENCES Classroom (ClassroomID)
        )`,
        
        `CREATE TABLE IF NOT EXISTS Enrollment (
            EnrollmentID INTEGER PRIMARY KEY AUTOINCREMENT,
            StudentID INTEGER,
            CourseID INTEGER,
            EnrollmentDate DATE DEFAULT CURRENT_DATE,
            FinalGrade TEXT,
            FOREIGN KEY (StudentID) REFERENCES Student (StudentID),
            FOREIGN KEY (CourseID) REFERENCES Course (CourseID)
        )`,
        
        `CREATE TABLE IF NOT EXISTS Guardian (
            GuardianID INTEGER PRIMARY KEY AUTOINCREMENT,
            StudentID INTEGER,
            Name TEXT NOT NULL,
            Relationship TEXT,
            Phone TEXT,
            Email TEXT,
            FOREIGN KEY (StudentID) REFERENCES Student (StudentID)
        )`,

        `CREATE TABLE IF NOT EXISTS Lesson (
            LessonID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseID INTEGER NOT NULL,
            Title TEXT,
            Description TEXT,
            Notes TEXT,
            ContentURL TEXT,
            OrderNumber INTEGER,
            Duration INTEGER,
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (CourseID) REFERENCES Course (CourseID)
        )`
    ];
    
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            for (const query of queries) {
                db.run(query, (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        console.error('Error creating table:', err);
                        reject(err);
                    }
                });
            }
            
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Error committing transaction:', err);
                    reject(err);
                    return;
                }
                
                // Check if data should be populated (development environment)
                if (process.env.NODE_ENV === 'development' || process.env.POPULATE_TEST_DATA === 'true') {
                    populateDummyData()
                        .then(() => resolve())
                        .catch((err) => {
                            console.error('Error populating dummy data:', err);
                            reject(err);
                        });
                } else {
                    resolve();
                }
            });
        });
    });
};

/**
 * Populate the database with dummy data for development and testing
 */
export const populateDummyData = async (): Promise<void> => {
    console.log('Checking if database needs to be populated...');
    
    // Check if there's already data in the Department table
    const hasData = await getOne<{count: number}>('SELECT COUNT(*) as count FROM Department');
    
    if (hasData && hasData.count > 0) {
        console.log('Database already has data, skipping population');
        return;
    }
    
    console.log('Populating database with dummy data...');
    
    // Insert dummy departments
    const departmentQueries = [
        `INSERT OR IGNORE INTO Department (DepartmentName) VALUES ('Mathematics')`,
        `INSERT OR IGNORE INTO Department (DepartmentName) VALUES ('Science')`,
        `INSERT OR IGNORE INTO Department (DepartmentName) VALUES ('Computer Science')`,
        `INSERT OR IGNORE INTO Department (DepartmentName) VALUES ('Literature')`,
        `INSERT OR IGNORE INTO Department (DepartmentName) VALUES ('History')`
    ];
    
    // Insert dummy teachers
    const teacherQueries = [
        `INSERT OR IGNORE INTO Teacher (FirstName, LastName, Email, Phone, HireDate, DepartmentID) 
         VALUES ('John', 'Smith', 'john.smith@school.edu', '555-1234', '2018-08-15', 1)`,
        `INSERT OR IGNORE INTO Teacher (FirstName, LastName, Email, Phone, HireDate, DepartmentID) 
         VALUES ('Sarah', 'Johnson', 'sarah.johnson@school.edu', '555-2345', '2019-06-10', 2)`,
        `INSERT OR IGNORE INTO Teacher (FirstName, LastName, Email, Phone, HireDate, DepartmentID) 
         VALUES ('Michael', 'Brown', 'michael.brown@school.edu', '555-3456', '2017-09-01', 3)`,
        `INSERT OR IGNORE INTO Teacher (FirstName, LastName, Email, Phone, HireDate, DepartmentID) 
         VALUES ('Emily', 'Davis', 'emily.davis@school.edu', '555-4567', '2020-01-15', 4)`,
        `INSERT OR IGNORE INTO Teacher (FirstName, LastName, Email, Phone, HireDate, DepartmentID) 
         VALUES ('Robert', 'Wilson', 'robert.wilson@school.edu', '555-5678', '2016-11-20', 5)`
    ];
    
    // Insert dummy students
    const studentQueries = [
        `INSERT OR IGNORE INTO Student (FirstName, LastName, DateOfBirth, Gender, Email, Phone, Address, EnrollmentDate) 
         VALUES ('Alice', 'Thompson', '2005-03-12', 'Female', 'alice.t@student.edu', '555-9876', '123 Main St', '2021-09-01')`,
        `INSERT OR IGNORE INTO Student (FirstName, LastName, DateOfBirth, Gender, Email, Phone, Address, EnrollmentDate) 
         VALUES ('Brian', 'Miller', '2004-07-25', 'Male', 'brian.m@student.edu', '555-8765', '456 Oak Ave', '2020-09-01')`,
        `INSERT OR IGNORE INTO Student (FirstName, LastName, DateOfBirth, Gender, Email, Phone, Address, EnrollmentDate) 
         VALUES ('Chloe', 'Garcia', '2005-11-08', 'Female', 'chloe.g@student.edu', '555-7654', '789 Pine Blvd', '2021-09-01')`,
        `INSERT OR IGNORE INTO Student (FirstName, LastName, DateOfBirth, Gender, Email, Phone, Address, EnrollmentDate) 
         VALUES ('David', 'Martinez', '2004-05-17', 'Male', 'david.m@student.edu', '555-6543', '101 Cedar Ln', '2020-09-01')`,
        `INSERT OR IGNORE INTO Student (FirstName, LastName, DateOfBirth, Gender, Email, Phone, Address, EnrollmentDate) 
         VALUES ('Emma', 'Rodriguez', '2005-09-30', 'Female', 'emma.r@student.edu', '555-5432', '202 Elm St', '2021-09-01')`
    ];
    
    // Insert dummy courses
    const courseQueries = [
        `INSERT OR IGNORE INTO Course (CourseName, Description, Credits, DepartmentID) 
         VALUES ('Algebra I', 'Introduction to algebraic concepts', 3, 1)`,
        `INSERT OR IGNORE INTO Course (CourseName, Description, Credits, DepartmentID) 
         VALUES ('Biology', 'Study of living organisms', 4, 2)`,
        `INSERT OR IGNORE INTO Course (CourseName, Description, Credits, DepartmentID) 
         VALUES ('Introduction to Programming', 'Basics of computer programming', 3, 3)`,
        `INSERT OR IGNORE INTO Course (CourseName, Description, Credits, DepartmentID) 
         VALUES ('World Literature', 'Survey of global literary traditions', 3, 4)`,
        `INSERT OR IGNORE INTO Course (CourseName, Description, Credits, DepartmentID) 
         VALUES ('World History', 'Overview of global historical events', 3, 5)`
    ];
    
    // Insert dummy classrooms
    const classroomQueries = [
        `INSERT OR IGNORE INTO Classroom (RoomNumber, Building, Capacity) VALUES ('101', 'Main Building', 30)`,
        `INSERT OR IGNORE INTO Classroom (RoomNumber, Building, Capacity) VALUES ('203', 'Science Wing', 25)`,
        `INSERT OR IGNORE INTO Classroom (RoomNumber, Building, Capacity) VALUES ('305', 'Computer Lab', 20)`,
        `INSERT OR IGNORE INTO Classroom (RoomNumber, Building, Capacity) VALUES ('102', 'Main Building', 30)`,
        `INSERT OR IGNORE INTO Classroom (RoomNumber, Building, Capacity) VALUES ('201', 'History Wing', 25)`
    ];
    
    // Insert dummy schedules
    const scheduleQueries = [
        `INSERT OR IGNORE INTO Schedule (CourseID, TeacherID, ClassroomID, StartTime, EndTime, DayOfWeek) 
         VALUES (1, 1, 1, '09:00', '10:30', 'Monday')`,
        `INSERT OR IGNORE INTO Schedule (CourseID, TeacherID, ClassroomID, StartTime, EndTime, DayOfWeek) 
         VALUES (2, 2, 2, '11:00', '12:30', 'Tuesday')`,
        `INSERT OR IGNORE INTO Schedule (CourseID, TeacherID, ClassroomID, StartTime, EndTime, DayOfWeek) 
         VALUES (3, 3, 3, '13:00', '14:30', 'Wednesday')`,
        `INSERT OR IGNORE INTO Schedule (CourseID, TeacherID, ClassroomID, StartTime, EndTime, DayOfWeek) 
         VALUES (4, 4, 4, '09:00', '10:30', 'Thursday')`,
        `INSERT OR IGNORE INTO Schedule (CourseID, TeacherID, ClassroomID, StartTime, EndTime, DayOfWeek) 
         VALUES (5, 5, 5, '11:00', '12:30', 'Friday')`
    ];
    
    // Insert dummy enrollments
    const enrollmentQueries = [
        `INSERT OR IGNORE INTO Enrollment (StudentID, CourseID, EnrollmentDate, FinalGrade) 
         VALUES (1, 1, '2021-09-01', 'A')`,
        `INSERT OR IGNORE INTO Enrollment (StudentID, CourseID, EnrollmentDate, FinalGrade) 
         VALUES (2, 2, '2021-09-01', 'B+')`,
        `INSERT OR IGNORE INTO Enrollment (StudentID, CourseID, EnrollmentDate, FinalGrade) 
         VALUES (3, 3, '2021-09-01', 'A-')`,
        `INSERT OR IGNORE INTO Enrollment (StudentID, CourseID, EnrollmentDate, FinalGrade) 
         VALUES (4, 4, '2021-09-01', 'B')`,
        `INSERT OR IGNORE INTO Enrollment (StudentID, CourseID, EnrollmentDate, FinalGrade) 
         VALUES (5, 5, '2021-09-01', 'A+')`
    ];
    
    // Insert dummy guardians
    const guardianQueries = [
        `INSERT OR IGNORE INTO Guardian (StudentID, Name, Relationship, Phone, Email) 
         VALUES (1, 'Thomas Thompson', 'Father', '555-1111', 'thomas.t@email.com')`,
        `INSERT OR IGNORE INTO Guardian (StudentID, Name, Relationship, Phone, Email) 
         VALUES (2, 'Jennifer Miller', 'Mother', '555-2222', 'jennifer.m@email.com')`,
        `INSERT OR IGNORE INTO Guardian (StudentID, Name, Relationship, Phone, Email) 
         VALUES (3, 'Carlos Garcia', 'Father', '555-3333', 'carlos.g@email.com')`,
        `INSERT OR IGNORE INTO Guardian (StudentID, Name, Relationship, Phone, Email) 
         VALUES (4, 'Maria Martinez', 'Mother', '555-4444', 'maria.m@email.com')`,
        `INSERT OR IGNORE INTO Guardian (StudentID, Name, Relationship, Phone, Email) 
         VALUES (5, 'Eduardo Rodriguez', 'Father', '555-5555', 'eduardo.r@email.com')`
    ];
    
    // Insert dummy lessons
    const lessonQueries = [
        `INSERT OR IGNORE INTO Lesson (CourseID, Title, Description, Notes, ContentURL, OrderNumber, Duration) 
         VALUES (1, 'Introduction to Variables', 'Learn about algebraic variables', 'Important foundational concept', '/content/algebra/variables.pdf', 1, 60)`,
        `INSERT OR IGNORE INTO Lesson (CourseID, Title, Description, Notes, ContentURL, OrderNumber, Duration) 
         VALUES (2, 'Cell Structure', 'Examining the basic components of cells', 'Remember to discuss organelles', '/content/biology/cells.pdf', 1, 90)`,
        `INSERT OR IGNORE INTO Lesson (CourseID, Title, Description, Notes, ContentURL, OrderNumber, Duration) 
         VALUES (3, 'Variables and Data Types', 'Understanding programming fundamentals', 'Cover strings, integers, and booleans', '/content/programming/variables.pdf', 1, 60)`,
        `INSERT OR IGNORE INTO Lesson (CourseID, Title, Description, Notes, ContentURL, OrderNumber, Duration) 
         VALUES (4, 'Shakespeare Introduction', 'Overview of Shakespeare\'s works', 'Focus on historical context', '/content/literature/shakespeare.pdf', 1, 75)`,
        `INSERT OR IGNORE INTO Lesson (CourseID, Title, Description, Notes, ContentURL, OrderNumber, Duration) 
         VALUES (5, 'Ancient Civilizations', 'Exploring early human societies', 'Cover Mesopotamia, Egypt, and Indus Valley', '/content/history/ancient.pdf', 1, 75)`
    ];
    
    // Execute all queries within a transaction
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            const allQueries = [
                ...departmentQueries,
                ...teacherQueries,
                ...studentQueries,
                ...courseQueries,
                ...classroomQueries,
                ...scheduleQueries,
                ...enrollmentQueries,
                ...guardianQueries,
                ...lessonQueries
            ];
            
            for (const query of allQueries) {
                db.run(query, (err) => {
                    if (err) {
                        console.error('Error inserting dummy data:', err);
                        db.run('ROLLBACK');
                        reject(err);
                    }
                });
            }
            
            // Update department heads after teachers are created
            db.run(`UPDATE Department SET HeadOfDepartmentID = 1 WHERE DepartmentID = 1`, (err) => {
                if (err) {
                    console.error('Error updating department head:', err);
                    db.run('ROLLBACK');
                    reject(err);
                }
            });
            
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Error committing dummy data transaction:', err);
                    reject(err);
                    return;
                }
                console.log('Dummy data populated successfully');
                resolve();
            });
        });
    });
};

// Type definitions for entities
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

// Generic CRUD operations

/**
 * Execute a database query with promise interface
 */
const runQuery = <T>(query: string, params: any[] = []): Promise<T> => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ id: this.lastID } as unknown as T);
        });
    });
};

/**
 * Get single row from database
 */
const getOne = <T>(query: string, params: any[] = []): Promise<T | null> => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve((row as T) || null);
        });
    });
};

/**
 * Get multiple rows from database
 */
const getAll = <T>(query: string, params: any[] = []): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve((rows as T[]) || []);
        });
    });
};

// Department CRUD
export const createDepartment = (department: Department): Promise<{ id: number }> => {
    return runQuery(
        'INSERT INTO Department (DepartmentName, HeadOfDepartmentID) VALUES (?, ?)',
        [department.DepartmentName, department.HeadOfDepartmentID]
    );
};

export const getDepartmentById = (id: number): Promise<Department | null> => {
    return getOne<Department>('SELECT * FROM Department WHERE DepartmentID = ?', [id]);
};

export const getAllDepartments = (): Promise<Department[]> => {
    return getAll<Department>('SELECT * FROM Department');
};

export const updateDepartment = (id: number, department: Department): Promise<{ id: number }> => {
    return runQuery(
        'UPDATE Department SET DepartmentName = ?, HeadOfDepartmentID = ? WHERE DepartmentID = ?',
        [department.DepartmentName, department.HeadOfDepartmentID, id]
    );
};

export const deleteDepartment = (id: number): Promise<{ id: number }> => {
    return runQuery('DELETE FROM Department WHERE DepartmentID = ?', [id]);
};

// Teacher CRUD
export const createTeacher = (teacher: Teacher): Promise<{ id: number }> => {
    return runQuery(
        'INSERT INTO Teacher (FirstName, LastName, Email, Phone, HireDate, DepartmentID) VALUES (?, ?, ?, ?, ?, ?)',
        [teacher.FirstName, teacher.LastName, teacher.Email, teacher.Phone, teacher.HireDate, teacher.DepartmentID]
    );
};

export const getTeacherById = (id: number): Promise<Teacher | null> => {
    return getOne<Teacher>('SELECT * FROM Teacher WHERE TeacherID = ?', [id]);
};

export const getAllTeachers = (): Promise<Teacher[]> => {
    return getAll<Teacher>('SELECT * FROM Teacher');
};

export const updateTeacher = (id: number, teacher: Teacher): Promise<{ id: number }> => {
    return runQuery(
        'UPDATE Teacher SET FirstName = ?, LastName = ?, Email = ?, Phone = ?, HireDate = ?, DepartmentID = ? WHERE TeacherID = ?',
        [teacher.FirstName, teacher.LastName, teacher.Email, teacher.Phone, teacher.HireDate, teacher.DepartmentID, id]
    );
};

export const deleteTeacher = (id: number): Promise<{ id: number }> => {
    return runQuery('DELETE FROM Teacher WHERE TeacherID = ?', [id]);
};

// Student CRUD
export const createStudent = (student: Student): Promise<{ id: number }> => {
    return runQuery(
        'INSERT INTO Student (FirstName, LastName, DateOfBirth, Gender, Email, Phone, Address, EnrollmentDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [student.FirstName, student.LastName, student.DateOfBirth, student.Gender, student.Email, student.Phone, student.Address, student.EnrollmentDate]
    );
};

export const getStudentById = (id: number): Promise<Student | null> => {
    return getOne<Student>('SELECT * FROM Student WHERE StudentID = ?', [id]);
};

export const getAllStudents = (): Promise<Student[]> => {
    return getAll<Student>('SELECT * FROM Student');
};

export const updateStudent = (id: number, student: Student): Promise<{ id: number }> => {
    return runQuery(
        'UPDATE Student SET FirstName = ?, LastName = ?, DateOfBirth = ?, Gender = ?, Email = ?, Phone = ?, Address = ?, EnrollmentDate = ? WHERE StudentID = ?',
        [student.FirstName, student.LastName, student.DateOfBirth, student.Gender, student.Email, student.Phone, student.Address, student.EnrollmentDate, id]
    );
};

export const deleteStudent = (id: number): Promise<{ id: number }> => {
    return runQuery('DELETE FROM Student WHERE StudentID = ?', [id]);
};

// Course CRUD
export const createCourse = (course: Course): Promise<{ id: number }> => {
    return runQuery(
        'INSERT INTO Course (CourseName, Description, Credits, DepartmentID) VALUES (?, ?, ?, ?)',
        [course.CourseName, course.Description, course.Credits, course.DepartmentID]
    );
};

export const getCourseById = (id: number): Promise<Course | null> => {
    return getOne<Course>('SELECT * FROM Course WHERE CourseID = ?', [id]);
};

export const getAllCourses = (): Promise<Course[]> => {
    return getAll<Course>('SELECT * FROM Course');
};

export const updateCourse = (id: number, course: Course): Promise<{ id: number }> => {
    return runQuery(
        'UPDATE Course SET CourseName = ?, Description = ?, Credits = ?, DepartmentID = ? WHERE CourseID = ?',
        [course.CourseName, course.Description, course.Credits, course.DepartmentID, id]
    );
};

export const deleteCourse = (id: number): Promise<{ id: number }> => {
    return runQuery('DELETE FROM Course WHERE CourseID = ?', [id]);
};

// Classroom CRUD
export const createClassroom = (classroom: Classroom): Promise<{ id: number }> => {
    return runQuery(
        'INSERT INTO Classroom (RoomNumber, Building, Capacity) VALUES (?, ?, ?)',
        [classroom.RoomNumber, classroom.Building, classroom.Capacity]
    );
};

export const getClassroomById = (id: number): Promise<Classroom | null> => {
    return getOne<Classroom>('SELECT * FROM Classroom WHERE ClassroomID = ?', [id]);
};

export const getAllClassrooms = (): Promise<Classroom[]> => {
    return getAll<Classroom>('SELECT * FROM Classroom');
};

export const updateClassroom = (id: number, classroom: Classroom): Promise<{ id: number }> => {
    return runQuery(
        'UPDATE Classroom SET RoomNumber = ?, Building = ?, Capacity = ? WHERE ClassroomID = ?',
        [classroom.RoomNumber, classroom.Building, classroom.Capacity, id]
    );
};

export const deleteClassroom = (id: number): Promise<{ id: number }> => {
    return runQuery('DELETE FROM Classroom WHERE ClassroomID = ?', [id]);
};

// Schedule CRUD
export const createSchedule = (schedule: Schedule): Promise<{ id: number }> => {
    return runQuery(
        'INSERT INTO Schedule (CourseID, TeacherID, ClassroomID, StartTime, EndTime, DayOfWeek) VALUES (?, ?, ?, ?, ?, ?)',
        [schedule.CourseID, schedule.TeacherID, schedule.ClassroomID, schedule.StartTime, schedule.EndTime, schedule.DayOfWeek]
    );
};

export const getScheduleById = (id: number): Promise<Schedule | null> => {
    return getOne<Schedule>('SELECT * FROM Schedule WHERE ScheduleID = ?', [id]);
};

export const getAllSchedules = (): Promise<Schedule[]> => {
    return getAll<Schedule>('SELECT * FROM Schedule');
};

export const updateSchedule = (id: number, schedule: Schedule): Promise<{ id: number }> => {
    return runQuery(
        'UPDATE Schedule SET CourseID = ?, TeacherID = ?, ClassroomID = ?, StartTime = ?, EndTime = ?, DayOfWeek = ? WHERE ScheduleID = ?',
        [schedule.CourseID, schedule.TeacherID, schedule.ClassroomID, schedule.StartTime, schedule.EndTime, schedule.DayOfWeek, id]
    );
};

export const deleteSchedule = (id: number): Promise<{ id: number }> => {
    return runQuery('DELETE FROM Schedule WHERE ScheduleID = ?', [id]);
};

// Enrollment CRUD
export const createEnrollment = (enrollment: Enrollment): Promise<{ id: number }> => {
    return runQuery(
        'INSERT INTO Enrollment (StudentID, CourseID, EnrollmentDate, FinalGrade) VALUES (?, ?, ?, ?)',
        [enrollment.StudentID, enrollment.CourseID, enrollment.EnrollmentDate, enrollment.FinalGrade]
    );
};

export const getEnrollmentById = (id: number): Promise<Enrollment | null> => {
    return getOne<Enrollment>('SELECT * FROM Enrollment WHERE EnrollmentID = ?', [id]);
};

export const getAllEnrollments = (): Promise<Enrollment[]> => {
    return getAll<Enrollment>('SELECT * FROM Enrollment');
};

export const updateEnrollment = (id: number, enrollment: Enrollment): Promise<{ id: number }> => {
    return runQuery(
        'UPDATE Enrollment SET StudentID = ?, CourseID = ?, EnrollmentDate = ?, FinalGrade = ? WHERE EnrollmentID = ?',
        [enrollment.StudentID, enrollment.CourseID, enrollment.EnrollmentDate, enrollment.FinalGrade, id]
    );
};

export const deleteEnrollment = (id: number): Promise<{ id: number }> => {
    return runQuery('DELETE FROM Enrollment WHERE EnrollmentID = ?', [id]);
};

// Guardian CRUD
export const createGuardian = (guardian: Guardian): Promise<{ id: number }> => {
    return runQuery(
        'INSERT INTO Guardian (StudentID, Name, Relationship, Phone, Email) VALUES (?, ?, ?, ?, ?)',
        [guardian.StudentID, guardian.Name, guardian.Relationship, guardian.Phone, guardian.Email]
    );
};

export const getGuardianById = (id: number): Promise<Guardian | null> => {
    return getOne<Guardian>('SELECT * FROM Guardian WHERE GuardianID = ?', [id]);
};

export const getAllGuardians = (): Promise<Guardian[]> => {
    return getAll<Guardian>('SELECT * FROM Guardian');
};

export const updateGuardian = (id: number, guardian: Guardian): Promise<{ id: number }> => {
    return runQuery(
        'UPDATE Guardian SET StudentID = ?, Name = ?, Relationship = ?, Phone = ?, Email = ? WHERE GuardianID = ?',
        [guardian.StudentID, guardian.Name, guardian.Relationship, guardian.Phone, guardian.Email, id]
    );
};

export const deleteGuardian = (id: number): Promise<{ id: number }> => {
    return runQuery('DELETE FROM Guardian WHERE GuardianID = ?', [id]);
};

// Lesson CRUD
export const createLesson = (lesson: Lesson): Promise<{ id: number }> => {
    return runQuery(
        'INSERT INTO Lesson (CourseID, Title, Description, Notes, ContentURL, OrderNumber, Duration) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [lesson.CourseID, lesson.Title, lesson.Description, lesson.Notes, lesson.ContentURL, lesson.OrderNumber, lesson.Duration]
    );
};

export const getLessonById = (id: number): Promise<Lesson | null> => {
    return getOne<Lesson>('SELECT * FROM Lesson WHERE LessonID = ?', [id]);
};

export const getAllLessons = (): Promise<Lesson[]> => {
    return getAll<Lesson>('SELECT * FROM Lesson');
};

export const getLessonsByCourse = (courseId: number): Promise<Lesson[]> => {
    return getAll<Lesson>('SELECT * FROM Lesson WHERE CourseID = ? ORDER BY OrderNumber', [courseId]);
};

export const updateLesson = (id: number, lesson: Lesson): Promise<{ id: number }> => {
    return runQuery(
        'UPDATE Lesson SET CourseID = ?, Title = ?, Description = ?, Notes = ?, ContentURL = ?, OrderNumber = ?, Duration = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE LessonID = ?',
        [lesson.CourseID, lesson.Title, lesson.Description, lesson.Notes, lesson.ContentURL, lesson.OrderNumber, lesson.Duration, id]
    );
};

export const deleteLesson = (id: number): Promise<{ id: number }> => {
    return runQuery('DELETE FROM Lesson WHERE LessonID = ?', [id]);
};

/**
 * Close the database connection
 */
export const closeDatabase = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                    reject(err);
                    return;
                }
                console.log('Database connection closed');
                resolve();
            });
        } else {
            resolve();
        }
    });
};

/**
 * Get database instance
 */
export const getDatabase = (): sqlite3.Database => {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase first.');
    }
    return db;
};

/**
 * Encrypt sensitive data
 */
const encryptSensitiveData = (data: string): string => {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.DB_PASSWORD!, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
};