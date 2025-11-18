import React, { useEffect, useState, useMemo } from 'react';
import '../../Style/ProductsList.css';
import configuration from '../../configuration'; 
import DocToJsonConverter from '../DocToJsonConverter/DocToJsonConverter';
import AssignUserModal from '../UserManagement/AssignUserModel'; 
import RejectModal from './RejectModal'; // Import the new reject modal
import { useAppContext } from '../../Context/AppContext'; 
import { jwtDecode } from 'jwt-decode'; 

const ProductsList = () => {
  const [instructions, setInstructions] = useState([]);
  const [showDocPopup, setShowDocPopup] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [modalMode, setModalMode] = useState('reviewer'); 
  const [selectedInstruction, setSelectedInstruction] = useState(null);
  
  const { user } = useAppContext(); 
  const token = localStorage.getItem('token');

  const fetchInstructions = async () => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}masterInstructions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInstructions(await res.json());
      } else {
        setInstructions([]);
      }
    } catch (err) {
      setInstructions([]);
    }
  };

  useEffect(() => { 
    if (token) {
      fetchInstructions(); 
    }
  }, [token]); 

  const handleAssignReviewer = (instruction) => {
    setSelectedInstruction(instruction);
    setModalMode('reviewer');
    setShowAssignModal(true);
  };
  
  const handleSubmitReview = async (instructionId) => {
    if (!window.confirm('Are you sure you want to submit this review? This will move it to "Pending for approval".')) return;
    await fetch(`${configuration.API_BASE_URL}masterInstructions/${instructionId}/submit-review`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchInstructions();
  };
  
  const handleAssignApprover = (instruction) => {
    setSelectedInstruction(instruction);
    setModalMode('approver');
    setShowAssignModal(true);
  };

  const handleApprove = async (instructionId) => {
    if (!window.confirm('Are you sure you want to approve this instruction?')) return;
    await fetch(`${configuration.API_BASE_URL}masterInstructions/${instructionId}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchInstructions();
  };
  
  const handleReject = (instruction) => {
    setSelectedInstruction(instruction);
    setShowRejectModal(true);
  };

  const groupedInstructions = useMemo(() => {
    const groups = {
      Created: [],
      UnderReview: [],
      PendingForApproval: [],
      Approved: []
    };
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
    } catch (e) {
      return { role: null, id: null };
    }
  };

  const { role: userRole, id: currentUserId } = getUserInfo();

  const renderInstructionCard = (item) => {
    if (!userRole || !currentUserId) {
      return null; 
    }
    
    const isReviewer = item.reviewer && item.reviewer.user_id === currentUserId;
    const isApprover = item.approvers.some(a => a.user_id === currentUserId);
    console.log("Product:", item.product_name, "Path:", item.original_doc_path);
    return (
      <div key={item._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5 className="card-title text-center mb-2">{item.product_name}</h5>
            
            {item.status === 'Created' && item.rejection_reason && (
              <p className="card-text text-danger text-center small">
                <strong>Rejected:</strong> {item.rejection_reason}
              </p>
            )}

            {item.reviewer && <p className="card-text text-muted text-center small">Reviewer: {item.reviewer.username}</p>}
            {item.approvers.length > 0 && <p className="card-text text-muted text-center small">Approvers: {item.approvers.map(a => a.username).join(', ')}</p>}
          </div>
          <div className="card-footer">
            {item.status === 'Created' && userRole === 'Admin' && (
              <button className="btn btn-info w-100" onClick={() => handleAssignReviewer(item)}>Assign Reviewer</button>
            )}
            
            {item.status === 'Under Review' && isReviewer && (
              <div className="d-flex gap-2">
                <button className="btn btn-warning w-100" onClick={() => handleSubmitReview(item._id)}>Submit</button>
                <button className="btn btn-danger w-100" onClick={() => handleReject(item)}>Reject</button>
              </div>
            )}
            
            {item.status === 'Pending for approval' && item.approvers.length === 0 && userRole === 'Admin' && (
              <button className="btn btn-info w-100" onClick={() => handleAssignApprover(item)}>Assign Approver</button>
            )}

            {item.status === 'Pending for approval' && item.approvers.length > 0 && (isApprover || userRole === 'Admin') && (
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
                Download
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

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
        <div className="row">
          {groupedInstructions.Created.map(renderInstructionCard)}
        </div>
      </div>
      
      <div className="mb-5">
        <h3>Under Review ({groupedInstructions.UnderReview.length})</h3> <hr/>
        <div className="row">
          {groupedInstructions.UnderReview.map(renderInstructionCard)}
        </div>
      </div>

      <div className="mb-5">
        <h3>Pending for approval ({groupedInstructions.PendingForApproval.length})</h3> <hr/>
        <div className="row">
          {groupedInstructions.PendingForApproval.map(renderInstructionCard)}
        </div>
      </div>

      <div>
        <h3>Approved ({groupedInstructions.Approved.length})</h3> <hr/>
        <div className="row">
          {groupedInstructions.Approved.map(renderInstructionCard)}
        </div>
      </div>

      {showDocPopup && <DocToJsonConverter onClose={() => setShowDocPopup(false)} onUploadSuccess={fetchInstructions} />}
      {showAssignModal && <AssignUserModal mode={modalMode} instruction={selectedInstruction} onClose={() => setShowAssignModal(false)} onAssign={fetchInstructions} />}
      {showRejectModal && <RejectModal instruction={selectedInstruction} onClose={() => setShowRejectModal(false)} onReject={fetchInstructions} />}
    </div>
  );
};

export default ProductsList;