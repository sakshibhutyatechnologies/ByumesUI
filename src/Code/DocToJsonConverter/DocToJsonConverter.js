import React, { useState } from 'react';
import '../../Style/DocToJsonConverter.css';
import configuration from '../../configuration';

const DocToJsonConverter = ({ onClose, onUploadSuccess }) => {
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [convertedJson, setConvertedJson] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDocUpload = async (e) => {
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
        body: formData,
      });
      if (!response.ok) throw new Error('Conversion failed');
      setConvertedJson(await response.json());
    } catch {
      alert('Error converting document to JSON.');
    }
  };

  const handleUploadToDB = async () => {
    if (!convertedJson || !uploadedDoc) {
      alert("Error: Converted JSON and original file are both required.");
      return;
    }
    setIsUploading(true);

    const formData = new FormData();
    formData.append('original_doc', uploadedDoc); 
    formData.append('jsonData', JSON.stringify(convertedJson));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${configuration.API_BASE_URL}masterInstructions`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData, 
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      alert('eBR created successfully!'); 
      onUploadSuccess();
      onClose();
    } catch {
      alert('Error uploading eBR to database.');
    } finally {
      setIsUploading(false);
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
          <div className="template-download-top">
            <p className="template-info">
              Download the template, fill in your details, and upload the completed document.
            </p>
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