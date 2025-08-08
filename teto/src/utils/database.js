// Entity configuration mapping
const ENTITY_CONFIG = {
    teacher: {
        tableName: 'Teacher',
        idField: 'TeacherID',
        displayName: 'Teacher',
        ipcPrefix: 'teacher'
    },
    student: {
        tableName: 'Student',
        idField: 'StudentID',
        displayName: 'Student',
        ipcPrefix: 'student'
    },
    course: {
        tableName: 'Course',
        idField: 'CourseID',
        displayName: 'Course',
        ipcPrefix: 'course'
    },
    department: {
        tableName: 'Department',
        idField: 'DepartmentID',
        displayName: 'Department',
        ipcPrefix: 'department'
    },
    lesson: {
        tableName: 'Lesson',
        idField: 'LessonID',
        displayName: 'Lesson',
        ipcPrefix: 'lesson'
    }
};
/**
 * Generic delete function for any entity type
 */
export const deleteEntity = async (entityType, id) => {
    try {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        const config = ENTITY_CONFIG[entityType];
        // Call the appropriate IPC method
        await window.electronAPI.deleteEntity(entityType, id);
        return {
            success: true,
            message: `${config.displayName} deleted successfully`,
            deletedId: id
        };
    }
    catch (error) {
        console.error(`Error deleting ${entityType}:`, error);
        return {
            success: false,
            message: error instanceof Error ? error.message : `Failed to delete ${entityType}`
        };
    }
};
/**
 * Generic get all function for any entity type
 */
export const getAllEntities = async (entityType) => {
    try {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        const methodName = `getAll${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s`;
        return await window.electronAPI[methodName]();
    }
    catch (error) {
        console.error(`Error fetching ${entityType}s:`, error);
        throw error;
    }
};
/**
 * Generic confirmation dialog
 */
export const confirmDelete = (entityType, entityName) => {
    const config = ENTITY_CONFIG[entityType];
    const name = entityName || `this ${config.displayName.toLowerCase()}`;
    return window.confirm(`Are you sure you want to delete ${name}?\n\nThis action cannot be undone.`);
};
