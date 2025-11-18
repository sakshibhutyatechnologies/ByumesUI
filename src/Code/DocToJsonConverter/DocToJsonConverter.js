import React, { useState, useEffect } from 'react';
import '../../Style/DocToJsonConverter.css';
import configuration from '../../configuration';

const DocToJsonConverter = ({ onClose, onUploadSuccess }) => {
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [convertedJson, setConvertedJson] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token'); // This is correct
        const response = await fetch(`${configuration.API_BASE_URL}masterInstructions/users`, {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });

        // --- THIS IS THE FIX ---
        if (response.ok) {
          setUsers(await response.json());
        } else {
          // If the request fails, log the error and set an empty array
          console.error('Failed to fetch users:', await response.json());
          setUsers([]); 
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]); // Also set to empty array on network error
      }
    }
    fetchUsers();
  }, []);

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setUploadedDoc(file);
      const formData = new FormData();
      formData.append('doc', file);
      try {
        const response = await fetch(`${configuration.API_BASE_URL}docToJson/convert`, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Conversion failed');
        setConvertedJson(await response.json());
      } catch {
        alert('Error converting document to JSON.');
      }
    } else {
      alert('Please upload a .doc or .docx file.');
    }
  };

  const handleUploadToDB = async () => {
    if (!convertedJson) return;
    if (selectedApprovers.length === 0) {
      alert('Please select at least one approver.');
      return;
    }
    setIsUploading(true);
    const approverDetails = selectedApprovers.map(userId => {
        const user = users.find(u => u._id === userId);
        return { user_id: userId, username: user ? user.full_name : 'Unknown' };
    });
    const body = { ...convertedJson, approvers: approverDetails };

    try {
      const token = localStorage.getItem('token'); // This is correct
      const response = await fetch(`${configuration.API_BASE_URL}masterInstructions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Upload failed');
      alert('eBR sent for approval successfully!');
      onUploadSuccess();
      onClose();
    } catch {
      alert('Error uploading eBR to database.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproverChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedApprovers(selected);
  };

  return (
    <div className="doc-popup-overlay">
      <div className="doc-popup">
        <div className="popup-header">
          <h2>Upload DOC to DB</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="popup-content">
          <p>Download the template, fill in your details, and upload the completed document.</p>
          <a href="/eBR_Template.docx" download>
            <button className="action-btn">Download Word Template</button>
          </a>
          <div className="upload-section">
            <label className="upload-label">
              Upload DOC:
              <input type="file" accept=".doc,.docx" onChange={handleDocUpload} />
            </label>
            {uploadedDoc && <p className="filename">File: {uploadedDoc.name}</p>}
          </div>
          <div className="approver-section">
            <label htmlFor="approvers">Select Approver(s):</label>
            <select id="approvers" multiple className="form-select" value={selectedApprovers} onChange={handleApproverChange} disabled={!convertedJson}>
              {/* This line is now safe because 'users' will always be an array */}
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.full_name}</option>
              ))}
            </select>
          </div>
          <div className="center-controls">
            <button className="action-btn" disabled={!convertedJson || isUploading} onClick={handleUploadToDB}>
              {isUploading ? 'Uploading...' : 'Upload to DB'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocToJsonConverter;