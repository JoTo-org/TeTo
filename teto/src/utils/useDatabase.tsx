import { useState, useCallback } from 'react';
import { deleteEntity, getAllEntities, confirmDelete, type EntityType, type DeleteResult } from './database';

export interface UseDatabaseReturn<T> {
  loading: boolean;
  error: string | null;
  handleDelete: (id: number, entityName?: string) => Promise<boolean>;
  handleRefresh: () => Promise<void>;
  entities: T[];
  setEntities: React.Dispatch<React.SetStateAction<T[]>>;
}

/**
 * Custom hook for database operations
 */
export const useDatabase = <T extends { [key: string]: any }>(
  entityType: EntityType,
  initialEntities: T[] = []
): UseDatabaseReturn<T> => {
  const [entities, setEntities] = useState<T[]>(initialEntities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle entity deletion with confirmation
   */
  const handleDelete = useCallback(async (id: number, entityName?: string): Promise<boolean> => {
    try {
      // Show confirmation dialog
      if (!confirmDelete(entityType, entityName)) {
        return false;
      }

      setLoading(true);
      setError(null);

      // Perform deletion
      const result: DeleteResult = await deleteEntity(entityType, id);

      if (result.success) {
        // Remove from local state
        setEntities(prev => prev.filter(entity => {
          const idField = getIdField(entityType);
          return entity[idField] !== id;
        }));
        
        // Show success message (optional)
        console.log(result.message);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete operation failed';
      setError(errorMessage);
      console.error('Delete error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  /**
   * Refresh entities from database
   */
  const handleRefresh = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const freshEntities = await getAllEntities(entityType);
      setEntities(freshEntities);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
      setError(errorMessage);
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  return {
    loading,
    error,
    handleDelete,
    handleRefresh,
    entities,
    setEntities
  };
};

// Helper function to get ID field name for each entity type
const getIdField = (entityType: EntityType): string => {
  const idFields = {
    teacher: 'TeacherID',
    student: 'StudentID', 
    course: 'CourseID',
    department: 'DepartmentID',
    lesson: 'LessonID'
  };
  return idFields[entityType];
};