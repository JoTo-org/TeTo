import React, {useEffect, useState} from 'react';
import './Teachers.css';
import { type Teacher } from '../../types/electron';


export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        
        // Check if electronAPI is available
        if (!window.electronAPI) {
          throw new Error('electronAPI is not available. Preload script may not have loaded.');
        }
        
        console.log('electronAPI is available:', !!window.electronAPI);
        const teacherList = await window.electronAPI.getAllTeachers();
        console.log('Teachers loaded:', teacherList);
        setTeachers(teacherList);
        setError(null);
      } catch (error) {
        console.error('Error loading teachers:', error);
        setError(error instanceof Error ? error.message : 'Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <h1>Teachers Management</h1>
      <div className="teachers-container">
        <h2>All Teachers ({teachers.length})</h2>
        <div className="teachers-grid">
          {teachers.map((teacher) => (
            <div key={teacher.TeacherID} className="teacher-card">
              <h3>{teacher.FirstName} {teacher.LastName}</h3>
              <div className="teacher-details">
                <p><strong>Email:</strong> {teacher.Email}</p>
                <p><strong>Phone:</strong> {teacher.Phone}</p>
                <p><strong>Hire Date:</strong> {teacher.HireDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};