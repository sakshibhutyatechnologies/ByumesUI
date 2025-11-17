import React, { useState, useEffect } from 'react';
import '../../Style/DocToJsonConverter.css';
import configuration from '../../configuration';
import { useAppContext } from '../../Context/AppContext'; // Import Context to check Role

const DocToJsonConverter = ({ onClose }) => {
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [convertedJson, setConvertedJson] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [debugError, setDebugError] = useState(null);

  // GET CURRENT USER
  const { user } = useAppContext();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    async function fetchUsers() {
      const url = `${configuration.API_BASE_URL}users`; 
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Server Error: ${res.status}`);
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
            setUsers(data);

            // --- NEW LOGIC: AUTO-ASSIGN IF NOT ADMIN ---
            if (!isAdmin) {
                // If I am QA/Operator, I cannot choose. 
                // The system automatically assigns ALL 'Admin' users as approvers.
                const adminUsers = data.filter(u => u.role === 'Admin');
                const adminIds = adminUsers.map(u => u._id);
                setSelectedApprovers(adminIds);
            }
        }
      } catch (err) {
        setDebugError(err.message);
      }
    }
    fetchUsers();
  }, [isAdmin]);

  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setUploadedDoc(file);
      convertToJson(file);
    } else {
      alert('Please upload a .doc or .docx file.');
    }
  };

  const convertToJson = async (file) => {
    const formData = new FormData();
    formData.append('doc', file);
    try {
      const response = await fetch(`${configuration.API_BASE_URL}docToJson/convert`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error();
      const json = await response.json();
      setConvertedJson(json);
    } catch {
      alert('Error converting document to JSON.');
    }
  };

  const handleCheckboxChange = (userId) => {
    // Only Admins can change selection
    if (!isAdmin) return; 

    setSelectedApprovers(prev => {
      if (prev.includes(userId)) return prev.filter(id => id !== userId);
      return [...prev, userId];
    });
  };

  const handleUploadToDB = async () => {
    if (!convertedJson) return;

    // Map selected IDs back to full user objects
    const approversList = selectedApprovers.map(userId => {
        const u = users.find(user => user._id === userId);
        return { user_id: u._id, username: u.full_name || u.loginId };
    });

    // Handle Multilingual Names (Safe Check)
    let safeInstructionName = convertedJson.instruction_name;
    let safeProductName = convertedJson.product_name;
    
    // If your DB schema is NOT updated to Mixed, uncomment lines below to force String:
    // if (typeof safeInstructionName === 'object') safeInstructionName = safeInstructionName.en;
    // if (typeof safeProductName === 'object') safeProductName = safeProductName.en;

    const payload = {
      ...convertedJson,
      instruction_name: safeInstructionName,
      product_name: safeProductName,
      status: 'pending',
      approvers: approversList
    };

    try {
      const response = await fetch(`${configuration.API_BASE_URL}masterInstructions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error();
      alert('eBR Converted & Sent for Approval successfully!');
      onClose();
    } catch {
      alert('Error converting eBR to database.');
    }
  };

  return (
    <div className="doc-popup-overlay">
      <div className="doc-popup">
        <div className="popup-header">
          <h2>Upload DOC to DB</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="popup-content">
          
          {debugError && <div className="alert alert-danger">{debugError}</div>}

          {/* --- APPROVER SECTION --- */}
          <div className="mb-3" style={{marginTop: '15px'}}>
            <label className="form-label" style={{fontWeight: 'bold'}}>
                {isAdmin ? "Select Approver(s):" : "Assigned Approver:"}
            </label>
            
            {isAdmin ? (
                // --- VIEW FOR ADMIN: CHECKBOX LIST ---
                <div className="approver-list" style={{border: '1px solid #ccc', padding: '10px', maxHeight: '150px', overflowY: 'auto'}}>
                  {users.map(u => (
                    <div key={u._id}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedApprovers.includes(u._id)}
                          onChange={() => handleCheckboxChange(u._id)}
                          style={{ marginRight: '8px' }}
                        />
                        {u.full_name} ({u.role})
                      </label>
                    </div>
                  ))}
                </div>
            ) : (
                // --- VIEW FOR QA/OTHERS: READ ONLY TEXT ---
                <div className="p-2 bg-light border rounded text-muted">
                    All Admins will be auto-assigned for approval.
                </div>
            )}
          </div>

          <div className="template-download-top">
             <a href="/eBR_Template.docx" download>
              <button className="action-btn">Download Word Template</button>
            </a>
          </div>

          <div className="upload-section">
            <label className="upload-label">
              Upload DOC:
              <input type="file" accept=".doc,.docx" onChange={handleDocUpload} />
            </label>
            {uploadedDoc && <p className="filename">File: {uploadedDoc.name}</p>}
          </div>

          <div className="center-controls">
            <button
              className="action-btn"
              disabled={!convertedJson || selectedApprovers.length === 0}
              onClick={handleUploadToDB}
              style={{ opacity: (!convertedJson || selectedApprovers.length === 0) ? 0.5 : 1 }}
            >
              {selectedApprovers.length === 0 ? 'Loading Admins...' : 'Upload to DB'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocToJsonConverter;