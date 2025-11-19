import React, { useEffect, useState, useMemo, useCallback } from 'react';
import '../../Style/ProductsList.css';
import configuration from '../../configuration'; 
import DocToJsonConverter from '../DocToJsonConverter/DocToJsonConverter';
import AssignUserModal from '../UserManagement/AssignUserModel'; 
import RejectModal from '../Product/RejectModal'; 
import { useAppContext } from '../../Context/AppContext'; 
import { jwtDecode } from 'jwt-decode'; 

const ProductsList = () => {
  const [instructions, setInstructions] = useState([]);
  const [showDocPopup, setShowDocPopup] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState(null);
  const [modalMode, setModalMode] = useState('reviewer');
  
  const [notesInput, setNotesInput] = useState({});
  
  const { user, logout } = useAppContext(); 
  const token = localStorage.getItem('token');
  const [refetch, setRefetch] = useState(0);

  const fetchInstructions = useCallback(async () => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}masterInstructions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setInstructions(data);
        
        const initialNotes = {};
        data.forEach(item => {
            if (item.review_note) initialNotes[item._id] = item.review_note;
        });
        setNotesInput(prev => ({ ...prev, ...initialNotes }));

      } else {
        if (res.status === 401) {
          const errorData = await res.json();
          alert(errorData.message); 
          if (user && user.email) logout(user.email);
          else logout(); 
        }
        setInstructions([]);
      }
    } catch (err) {
      setInstructions([]);
    }
  }, [token, user, logout]); 

  useEffect(() => { 
    if (token && user?.userId) {
      fetchInstructions(); 
    }
  }, [token, fetchInstructions, refetch, user]); 

  const handleRefresh = () => setRefetch(count => count + 1);

  const handleAssignWorkflow = (instruction) => {
    setSelectedInstruction(instruction);
    setModalMode('reviewer');
    setShowAssignModal(true);
  };
  
  const handleSubmitReview = async (instructionId) => {
    if (!window.confirm('Confirm review complete? This moves it to "Pending for approval".')) return;
    await fetch(`${configuration.API_BASE_URL}masterInstructions/${instructionId}/submit-review`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    handleRefresh();
  };
  
  const handleApprove = async (instructionId) => {
    if (!window.confirm('Approve this instruction? It will be moved to "Approved".')) return;
    await fetch(`${configuration.API_BASE_URL}masterInstructions/${instructionId}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    handleRefresh();
  };
  
  const handleReject = (instruction) => {
    setSelectedInstruction(instruction);
    setShowRejectModal(true);
  };

  const handleSaveNote = async (instructionId) => {
    const noteText = notesInput[instructionId] || '';
    try {
      const res = await fetch(`${configuration.API_BASE_URL}masterInstructions/${instructionId}/save-note`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ note: noteText })
      });
      if(res.ok) alert("Note saved successfully!");
      else alert("Failed to save note.");
    } catch (err) {
      alert("Error saving note.");
    }
  };

  const handleNoteChange = (id, text) => {
    setNotesInput(prev => ({ ...prev, [id]: text }));
  };

  const groupedInstructions = useMemo(() => {
    const groups = { Created: [], UnderReview: [], PendingForApproval: [], Approved: [] };
    if (Array.isArray(instructions)) {
      instructions.forEach(item => {
        if (item.status === 'Created') groups.Created.push(item);
        else if (item.status === 'Under Review') groups.UnderReview.push(item);
        else if (item.status === 'Pending for approval') groups.PendingForApproval.push(item);
        else if (item.status === 'Approved') groups.Approved.push(item);
      });
    }
    return groups;
  }, [instructions]);
  
  const getUserInfo = () => {
    if (!token) return { role: null, id: null };
    try {
      const decoded = jwtDecode(token);
      return { role: decoded.role, id: decoded.userId.toString() };
    } catch (e) { return { role: null, id: null }; }
  };

  const { role: userRole, id: currentUserId } = getUserInfo();

  const renderInstructionCard = (item) => {
    if (!user || !user.userId) return null; 
    if (!userRole || !currentUserId) return null;
    
    const isReviewer = item.reviewers && item.reviewers.some(r => String(r.user_id) === String(currentUserId)); 
    const isApprover = item.approvers && item.approvers.some(a => String(a.user_id) === String(currentUserId));
    
    return (
      <div key={item._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5 className="card-title text-center mb-2">{item.product_name}</h5>
            
            {/* --- DISPLAY REJECTION INFO --- */}
            {item.status === 'Created' && item.rejection_info && (
              <div className="alert alert-danger p-2 small mb-2">
                <strong>Rejected By:</strong> {item.rejection_info.rejected_by}<br/>
                <strong>Date:</strong> {new Date(item.rejection_info.rejected_at).toLocaleString()}<br/>
                <hr className="my-1"/>
                <strong>Reason:</strong> {item.rejection_info.reason}
              </div>
            )}

            {item.reviewers && item.reviewers.length > 0 && (
                <p className="card-text text-muted text-center small mb-1">
                    <strong>Reviewers:</strong> {item.reviewers.map(r => r.username).join(', ')}
                </p>
            )}
            {item.approvers && item.approvers.length > 0 && (
                <p className="card-text text-muted text-center small mb-2">
                    <strong>Approvers:</strong> {item.approvers.map(a => a.username).join(', ')}
                </p>
            )}

            {(isReviewer || isApprover || userRole === 'Admin') && item.status !== 'Approved' && (
                <div className="mt-3 pt-2 border-top">
                    <label className="form-label small text-muted mb-1">Notes / Progress:</label>
                    <textarea 
                        className="form-control form-control-sm mb-1" 
                        rows="2"
                        value={notesInput[item._id] || ''}
                        onChange={(e) => handleNoteChange(item._id, e.target.value)}
                        placeholder="Add a note..."
                    />
                    <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => handleSaveNote(item._id)}>Save Note</button>
                </div>
            )}
          </div>

          <div className="card-footer">
            {item.status === 'Created' && userRole === 'Admin' && (
              <button className="btn btn-info w-100" onClick={() => handleAssignWorkflow(item)}>Assign Workflow</button>
            )}
            
            {item.status === 'Under Review' && isReviewer && (
              <div className="d-flex gap-2">
                <button className="btn btn-primary w-100" onClick={() => handleSubmitReview(item._id)}>Submit</button>
                <button className="btn btn-danger w-100" onClick={() => handleReject(item)}>Reject</button>
              </div>
            )}
            
            {item.status === 'Pending for approval' && (isApprover || userRole === 'Admin') && (
              <div className="d-flex gap-2">
                <button className="btn btn-success w-100" onClick={() => handleApprove(item._id)}>Approve</button>
                <button className="btn btn-danger w-100" onClick={() => handleReject(item)}>Reject</button>
              </div>
            )}

            {item.status === 'Approved' && (
              <p className="text-success text-center mb-0 fw-bold">Approved</p>
            )}
            
            {item.original_doc_path && (
              <a 
                href={`${configuration.API_BASE_URL.replace(/\/$/, '')}/${item.original_doc_path.replace(/\\/g, '/')}`} 
                className="btn btn-secondary w-100 mt-2"
                target="_blank" rel="noopener noreferrer"
              >
                Download Document
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!user || !user.userId) return <div className="container p-5">Loading...</div>;

  return (
    <div className="container main-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-2 mb-md-0">Products</h2>
        {userRole === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowDocPopup(true)}>Convert to eBR</button>
        )}
      </div>

      <div className="mb-5">
        <h3>Created ({groupedInstructions.Created.length})</h3> <hr/>
        <div className="row">{groupedInstructions.Created.map(renderInstructionCard)}</div>
      </div>
      <div className="mb-5">
        <h3>Under Review ({groupedInstructions.UnderReview.length})</h3> <hr/>
        <div className="row">{groupedInstructions.UnderReview.map(renderInstructionCard)}</div>
      </div>
      <div className="mb-5">
        <h3>Pending for approval ({groupedInstructions.PendingForApproval.length})</h3> <hr/>
        <div className="row">{groupedInstructions.PendingForApproval.map(renderInstructionCard)}</div>
      </div>
      <div>
        <h3>Approved ({groupedInstructions.Approved.length})</h3> <hr/>
        <div className="row">{groupedInstructions.Approved.map(renderInstructionCard)}</div>
      </div>

      {showDocPopup && <DocToJsonConverter onClose={() => setShowDocPopup(false)} onUploadSuccess={handleRefresh} />}
      {showAssignModal && <AssignUserModal instruction={selectedInstruction} onClose={() => setShowAssignModal(false)} onAssign={handleRefresh} />}
      {showRejectModal && <RejectModal instruction={selectedInstruction} onClose={() => setShowRejectModal(false)} onReject={handleRefresh} />}
    </div>
  );
};

export default ProductsList;