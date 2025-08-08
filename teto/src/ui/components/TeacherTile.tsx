import React, { useState } from 'react';
import type { Teacher } from '../../types/electron';
import './TeacherTile.css';

interface TeacherTileProps {
  teacher: Teacher;
  onClick?: (teacher: Teacher) => void;
  onEdit?: (teacher: Teacher) => void;
  onDelete?: (teacherId: number, teacherName: string) => Promise<boolean>;
  onSave?: (updatedTeacher: Teacher) => Promise<void>;
  onCancel?: () => void; // Add this line
  showActions?: boolean;
  isCreating?: boolean;
  className?: string;
}

export const TeacherTile: React.FC<TeacherTileProps> = ({
  teacher,
  onClick,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  showActions = false,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Teacher>(teacher);
  const [isLoading, setIsLoading] = useState(false);

  const handleCardClick = () => {
    if (!isEditing && onClick) {
      onClick(teacher);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditData(teacher);
    setIsEditing(true);
    if (onEdit) {
      onEdit(teacher);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSave) return;

    setIsLoading(true);
    try {
      await onSave(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving teacher:', error);
      // You could add error state here if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditData(teacher); // Reset to original data
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && teacher.TeacherID) {
      const teacherName = `${teacher.FirstName} ${teacher.LastName}`;
      await onDelete(teacher.TeacherID, teacherName);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === 'DepartmentID' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  return (
    <div 
      className={`teacher-tile ${className} ${onClick && !isEditing ? 'clickable' : ''} ${isEditing ? 'editing' : ''}`}
      onClick={handleCardClick}
    >
      <div className="teacher-tile-header">
        {isEditing ? (
          <div className="edit-name-fields">
            <input
              type="text"
              name="FirstName"
              value={editData.FirstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className="edit-input name-input"
              onClick={(e) => e.stopPropagation()}
              required
            />
            <input
              type="text"
              name="LastName"
              value={editData.LastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className="edit-input name-input"
              onClick={(e) => e.stopPropagation()}
              required
            />
          </div>
        ) : (
          <h3>{teacher.FirstName} {teacher.LastName}</h3>
        )}

        {showActions && !isEditing && (
          <div className="teacher-tile-actions">
            <button 
              onClick={handleEdit}
              className="action-btn edit-btn"
              title="Edit Teacher"
            >
              ✏️
            </button>
            {onDelete && (
              <button 
                onClick={handleDelete}
                className="action-btn delete-btn"
                title="Delete Teacher"
              >
                🗑️
              </button>
            )}
          </div>
        )}

        {isEditing && (
          <div className="teacher-tile-actions">
            <button 
              onClick={handleSave}
              className="action-btn save-btn"
              title="Save Changes"
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '💾'}
            </button>
            <button 
              onClick={handleCancel}
              className="action-btn cancel-btn"
              title="Cancel"
              disabled={isLoading}
            >
              ❌
            </button>
          </div>
        )}
      </div>
      
      <div className="teacher-tile-details">
        <div className="detail-item">
          <span className="detail-label">📧 Email:</span>
          {isEditing ? (
            <input
              type="email"
              name="Email"
              value={editData.Email || ''}
              onChange={handleInputChange}
              placeholder="Email"
              className="edit-input"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="detail-value">{teacher.Email || 'Not provided'}</span>
          )}
        </div>
        
        <div className="detail-item">
          <span className="detail-label">📞 Phone:</span>
          {isEditing ? (
            <input
              type="tel"
              name="Phone"
              value={editData.Phone || ''}
              onChange={handleInputChange}
              placeholder="Phone"
              className="edit-input"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="detail-value">{teacher.Phone || 'Not provided'}</span>
          )}
        </div>
        
        <div className="detail-item">
          <span className="detail-label">📅 Hire Date:</span>
          {isEditing ? (
            <input
              type="date"
              name="HireDate"
              value={editData.HireDate || ''}
              onChange={handleInputChange}
              className="edit-input"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="detail-value">
              {teacher.HireDate ? new Date(teacher.HireDate).toLocaleDateString('de-DE') : 'Not specified'}
            </span>
          )}
        </div>
        
        {(teacher.DepartmentID || isEditing) && (
          <div className="detail-item">
            <span className="detail-label">🏢 Department:</span>
            {isEditing ? (
              <input
                type="number"
                name="DepartmentID"
                value={editData.DepartmentID || ''}
                onChange={handleInputChange}
                placeholder="Department ID"
                className="edit-input"
                onClick={(e) => e.stopPropagation()}
                min="1"
              />
            ) : (
              <span className="detail-value">Dept. {teacher.DepartmentID}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};