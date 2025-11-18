import React, { useState, useEffect } from 'react';
import configuration from '../../configuration';

const AssignUserModal = ({ mode, instruction, onClose, onAssign }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedApprovers, setSelectedApprovers] = useState([]);

  const isReviewMode = mode === 'reviewer';
  const title = isReviewMode ? 'Assign Reviewer' : 'Assign Approver(s)';

  // Fetch all users for the dropdown
  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${configuration.API_BASE_URL}masterInstructions/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const allUsers = await res.json();
          // Filter users if necessary (e.g., only QA/Admins for approval)
          if (isReviewMode) {
            setUsers(allUsers); // Anyone can be a reviewer
          } else {
            setUsers(allUsers.filter(u => u.role === 'Admin' || u.role === 'QA'));
          }
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsers();
  }, [isReviewMode]);

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    let url = '';
    let body = {};

    if (isReviewMode) {
      if (!selectedUser) return alert('Please select a reviewer.');
      const user = users.find(u => u._id === selectedUser);
      url = `${configuration.API_BASE_URL}masterInstructions/${instruction._id}/assign-reviewer`;
      body = { userId: user._id, username: user.full_name };
    } else {
      if (selectedApprovers.length === 0) return alert('Please select at least one approver.');
      const approverDetails = selectedApprovers.map(userId => {
        const user = users.find(u => u._id === userId);
        return { user_id: userId, username: user.full_name };
      });
      url = `${configuration.API_BASE_URL}masterInstructions/${instruction._id}/assign-approver`;
      body = { approvers: approverDetails };
    }

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Assignment failed');
      onAssign(); // Refresh the main list
      onClose();
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleMultiSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedApprovers(selected);
  };

  return (
    <div className="doc-popup-overlay">
      <div className="doc-popup">
        <div className="popup-header">
          <h2>{title} for "{instruction.product_name}"</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="popup-content">
          <div className="approver-section">
            <label htmlFor="user-select">{isReviewMode ? 'Select Reviewer:' : 'Select Approver(s):'}</label>
            {isReviewMode ? (
              <select id="user-select" className="form-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="" disabled>Select a user...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.full_name} ({user.role})</option>
                ))}
              </select>
            ) : (
              <select id="user-select" multiple className="form-select" value={selectedApprovers} onChange={handleMultiSelect} style={{ height: '150px' }}>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.full_name} ({user.role})</option>
                ))}
              </select>
            )}
          </div>
          <div className="center-controls mt-4">
            <button className="action-btn" onClick={handleSubmit}>Assign</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignUserModal;