import React, { useState } from 'react';
import apiClient from '../services/apiClient';

const AssignTaskModal = ({ task, project, onClose, onTaskUpdated }) => {
  // Pre-select existing assignees
  const [selectedAssignees, setSelectedAssignees] = useState(
    task.assignees ? task.assignees.map(u => u._id) : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Gather all unique members (Creator + Team)
  const allMembersMap = new Map();
  if (project.projectCreator) {
    allMembersMap.set(project.projectCreator._id, project.projectCreator);
  }
  if (project.teamMembers) {
    project.teamMembers.forEach(member => {
      allMembersMap.set(member._id, member);
    });
  }
  const allMembers = Array.from(allMembersMap.values());

  // 2. Handle Checkbox Toggles
  const handleCheckboxChange = (userId) => {
    setSelectedAssignees(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // 3. Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiClient(`/api/tasks/${task._id}`, {
        method: 'PUT',
        data: { assignees: selectedAssignees }
      });

      alert('Assignees updated successfully.');
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Error assigning task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Assign Task: {task.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Team Members:</label>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #555', padding: '10px', borderRadius: '5px' }}>
              {allMembers.map(user => (
                <div key={user._id} className="checkbox-item" style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'normal' }}>
                    <input
                      type="checkbox"
                      value={user._id}
                      checked={selectedAssignees.includes(user._id)}
                      onChange={() => handleCheckboxChange(user._id)}
                      style={{ marginRight: '10px' }}
                    />
                    {user.name} ({user.email})
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="button-primary">
              {isSubmitting ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskModal;