import React, { useState, useEffect } from 'react';
import configuration from '../../configuration'; 

const AssignUserModal = ({ instruction, onClose, onAssign }) => {
  const [users, setUsers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${configuration.API_BASE_URL}masterInstructions/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsers();
  }, [token]);

  const toggleReviewer = (userId) => {
    setSelectedReviewers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleApprover = (userId) => {
    setSelectedApprovers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (selectedReviewers.length === 0) return alert('Please select at least one reviewer.');
    if (selectedApprovers.length === 0) return alert('Please select at least one approver.');
    
    const reviewerObjects = selectedReviewers.map(id => {
      const user = users.find(u => u._id === id);
      return { user_id: user._id, username: user.full_name };
    });
    
    const approverObjects = selectedApprovers.map(id => {
      const user = users.find(u => u._id === id);
      return { user_id: user._id, username: user.full_name };
    });

    try {
      const res = await fetch(`${configuration.API_BASE_URL}masterInstructions/${instruction._id}/assign-workflow`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviewers: reviewerObjects, approvers: approverObjects })
      });
      if (!res.ok) throw new Error('Assignment failed');
      onAssign(); 
      onClose();
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  // Filter users by role
  const reviewerList = users.filter(u => u.role === 'Reviewer');
  const approverList = users.filter(u => u.role === 'Approver');

  return (
    <div className="doc-popup-overlay">
      <div className="doc-popup" style={{ maxWidth: '800px' }}>
        <div className="popup-header">
          <h2>Assign Workflow for "{instruction.product_name}"</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="popup-content">
          <div className="row">
            
            {/* --- MULTI-SELECT FOR REVIEWERS --- */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Select Reviewer(s)</label>
              <div className="border rounded p-2" style={{ maxHeight: '250px', overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
                {reviewerList.length > 0 ? reviewerList.map(user => (
                  <div key={user._id} className="d-flex align-items-center mb-2">
                    <input 
                      type="checkbox" 
                      id={`rev-${user._id}`}
                      className="me-2"
                      checked={selectedReviewers.includes(user._id)}
                      onChange={() => toggleReviewer(user._id)}
                    />
                    <label htmlFor={`rev-${user._id}`} className="mb-0" style={{ cursor: 'pointer' }}>
                      {user.full_name}
                    </label>
                  </div>
                )) : <p className="text-muted small">No users with role "Reviewer" found.</p>}
              </div>
            </div>

            {/* --- MULTI-SELECT FOR APPROVERS --- */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Select Approver(s)</label>
              <div className="border rounded p-2" style={{ maxHeight: '250px', overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
                {approverList.length > 0 ? approverList.map(user => (
                  <div key={user._id} className="d-flex align-items-center mb-2">
                    <input 
                      type="checkbox" 
                      id={`app-${user._id}`}
                      className="me-2"
                      checked={selectedApprovers.includes(user._id)}
                      onChange={() => toggleApprover(user._id)}
                    />
                    <label htmlFor={`app-${user._id}`} className="mb-0" style={{ cursor: 'pointer' }}>
                      {user.full_name}
                    </label>
                  </div>
                )) : <p className="text-muted small">No users with role "Approver" found.</p>}
              </div>
            </div>

          </div>

          <div className="center-controls mt-4">
            <button className="action-btn" onClick={handleSubmit}>Assign Workflow</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignUserModal;