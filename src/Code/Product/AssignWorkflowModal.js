import React, { useState, useEffect } from 'react';
import configuration from '../../configuration';

const AssignWorkflowModal = ({ product, onClose, onAssignmentSaved }) => {
  const [users, setUsers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]); 
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [debugError, setDebugError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${configuration.API_BASE_URL}users`);
        if (!res.ok) throw new Error(`Server Error: ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      } catch (err) {
        setDebugError(err.message);
      }
    }
    fetchUsers();
  }, []);

  const availableReviewers = users.filter(u => u.role === 'Reviewer');
  const availableApprovers = users.filter(u => u.role === 'Approver');

  const toggleReviewer = (id) => setSelectedReviewers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleApprover = (id) => setSelectedApprovers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAssign = async () => {
    // Map IDs to Objects
    const mapUsers = (ids) => ids.map(id => {
        const u = users.find(user => user._id === id);
        return { user_id: u._id, username: u.full_name || u.loginId };
    });

    // --- STEP 2: STATUS = UNDER_REVIEW ---
    const payload = {
      reviewers: mapUsers(selectedReviewers),
      approvers: mapUsers(selectedApprovers)
      // The backend route '/:id/assign' sets status to 'under_review' automatically
    };

    try {
      const response = await fetch(`${configuration.API_BASE_URL}masterInstructions/${product._id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to assign");
      }
      
      alert('Workflow Assigned! Product moved to "Under Review".');
      onAssignmentSaved();
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="doc-popup-overlay" style={{backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top:0, left:0, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000}}>
      <div className="bg-white rounded shadow-lg" style={{ width: '800px', maxWidth: '95%', maxHeight:'90vh', display:'flex', flexDirection:'column' }}>
        
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h4 className="m-0 text-primary">Assign Workflow</h4>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="p-4 overflow-auto">
          {debugError && <div className="alert alert-danger">{debugError}</div>}
          
          <div className="row g-4">
            {/* REVIEWERS COLUMN */}
            <div className="col-md-6">
                <div className="card h-100 border-primary shadow-sm">
                    <div className="card-header bg-primary text-white fw-bold">1. Select Reviewer(s)</div>
                    <div className="card-body p-0 overflow-auto" style={{height: '200px'}}>
                        {availableReviewers.map(u => (
                            <label key={u._id} className="list-group-item list-group-item-action d-flex align-items-center p-2 border-bottom" style={{cursor:'pointer'}}>
                                <input type="checkbox" className="form-check-input me-2" checked={selectedReviewers.includes(u._id)} onChange={() => toggleReviewer(u._id)} />
                                {u.full_name}
                            </label>
                        ))}
                        {availableReviewers.length === 0 && <div className="p-3 text-muted text-center">No Reviewers found.</div>}
                    </div>
                </div>
            </div>

            {/* APPROVERS COLUMN */}
            <div className="col-md-6">
                <div className="card h-100 border-success shadow-sm">
                    <div className="card-header bg-success text-white fw-bold">2. Select Approver(s)</div>
                    <div className="card-body p-0 overflow-auto" style={{height: '200px'}}>
                        {availableApprovers.map(u => (
                            <label key={u._id} className="list-group-item list-group-item-action d-flex align-items-center p-2 border-bottom" style={{cursor:'pointer'}}>
                                <input type="checkbox" className="form-check-input me-2" checked={selectedApprovers.includes(u._id)} onChange={() => toggleApprover(u._id)} />
                                {u.full_name}
                            </label>
                        ))}
                         {availableApprovers.length === 0 && <div className="p-3 text-muted text-center">No Approvers found.</div>}
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-top d-flex justify-content-end bg-light">
            <button className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
            <button className="btn btn-success px-4" 
                disabled={selectedReviewers.length === 0 || selectedApprovers.length === 0}
                onClick={handleAssign}
            >
                Start Workflow
            </button>
        </div>
      </div>
    </div>
  );
};
export default AssignWorkflowModal;