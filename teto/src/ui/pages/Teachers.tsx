import React, { useEffect, useState } from 'react';
import { TeacherTile } from '../components/TeacherTile';
import { useDatabase } from '../../utils/useDatabase';
import type { Teacher } from '../../types/electron';
import './Teachers.css';


export const TeachersPage: React.FC = () => {
  const {
    entities: teachers,
    loading,
    error,
    handleDelete,
    handleRefresh,
    setEntities: setTeachers
  } = useDatabase<Teacher>('teacher');

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTeacherData, setNewTeacherData] = useState<Teacher>({
    FirstName: 'New',        // Changed from 'new' to 'New'
    LastName: 'Teacher',     // Changed from 'teacher' to 'Teacher'
    Email: '',
    Phone: '',
    HireDate: '',
    DepartmentID: undefined
  });

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        if (!window.electronAPI) {
          throw new Error('electronAPI is not available');
        }
        
        const teacherList = await window.electronAPI.getAllTeachers();
        setTeachers(teacherList);
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
    };

    loadTeachers();
  }, [setTeachers]);

  const handleTeacherClick = (teacher: Teacher) => {
    console.log('Teacher clicked:', teacher);
    // Navigate to teacher detail page
  };

  const handleTeacherEdit = (teacher: Teacher) => {
    console.log('Edit teacher:', teacher);
  };

  const handleTeacherDelete = async (teacherId: number, teacherName: string): Promise<boolean> => {
    return await handleDelete(teacherId, teacherName);
  };

  const handleSaveTeacher = async (updatedTeacher: Teacher) => {
    try {
      if (!window.electronAPI) {
        throw new Error('Cannot update teacher: missing data');
      }

      console.log('Saving teacher:', updatedTeacher);
      
      if (updatedTeacher.TeacherID) {
        // Update existing teacher
        await window.electronAPI.updateEntity('teacher', updatedTeacher.TeacherID, updatedTeacher);
        
        // Update the local state
        setTeachers(prev => 
          prev.map(teacher => 
            teacher.TeacherID === updatedTeacher.TeacherID ? updatedTeacher : teacher
          )
        );
      } else {
        // Create new teacher
        const newTeacherId = await window.electronAPI.createEntity('teacher', updatedTeacher);
        const newTeacher = { ...updatedTeacher, TeacherID: newTeacherId };
        
        // Add to local state
        setTeachers(prev => [...prev, newTeacher]);
        
        // Exit creation mode
        setIsCreatingNew(false);
        setNewTeacherData({
          FirstName: '',
          LastName: '',
          Email: '',
          Phone: '',
          HireDate: '',
          DepartmentID: undefined
        });
      }

      console.log('Teacher saved successfully');
    } catch (error) {
      console.error('Error saving teacher:', error);
      throw error;
    }
  };

  const handleAddNewTeacher = () => {
    setIsCreatingNew(true);
    setNewTeacherData({
      FirstName: 'New',      // Changed from '' to 'New'
      LastName: 'Teacher',   // Changed from '' to 'Teacher'
      Email: '',
      Phone: '',
      HireDate: new Date().toISOString().split('T')[0], // Set today's date as default
      DepartmentID: undefined
    });
  };

  const handleCancelNewTeacher = () => {
    setIsCreatingNew(false);
    setNewTeacherData({
      FirstName: 'New',      // Changed from '' to 'New'
      LastName: 'Teacher',   // Changed from '' to 'Teacher'
      Email: '',
      Phone: '',
      HireDate: '',
      DepartmentID: undefined
    });
  };

  if (loading) return <div className="loading">Loading teachers...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Teachers Management</h1>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Refresh
          </button>
          <button 
            onClick={handleAddNewTeacher} 
            className="add-teacher-btn"
            disabled={isCreatingNew}
          >
            ➕ Add New Teacher
          </button>
        </div>
      </div>
      
      <div className="teachers-container">
        <h2>All Teachers ({teachers.length}{isCreatingNew ? + 1 : ''})</h2>
        
        <div className="teachers-grid">
          {/* New teacher tile - shows first when creating */}
          {isCreatingNew && (
            <TeacherTile
              key="new-teacher"
              teacher={newTeacherData}
              onSave={handleSaveTeacher}
              onCancel={handleCancelNewTeacher}
              showActions={true}
              isCreating={true}
              className="creating-new"
            />
          )}
          
          {/* Existing teachers */}
          {teachers.length === 0 && !isCreatingNew ? (
            <div className="empty-state">
              <p>No teachers found in the database.</p>
              <button onClick={handleAddNewTeacher} className="add-teacher-btn">
                Add Your First Teacher
              </button>
            </div>
          ) : (
            teachers.map((teacher) => (
              <TeacherTile
                key={teacher.TeacherID}
                teacher={teacher}
                onClick={handleTeacherClick}
                onEdit={handleTeacherEdit}
                onDelete={handleTeacherDelete}
                onSave={handleSaveTeacher}
                showActions={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};