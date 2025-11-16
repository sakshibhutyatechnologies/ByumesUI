import React, { useState } from 'react';
import '../../Style/DocToJsonConverter.css';
import configuration from '../../configuration';

const DocToJsonConverterForElog = ({ onClose }) => {
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [convertedJson, setConvertedJson] = useState(null);

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
      const response = await fetch(`${configuration.API_BASE_URL}docToJsonForElog/convert`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error();
      const json = await response.json();
      setConvertedJson(JSON.stringify(json));
    } catch {
      alert('Error converting document to JSON.');
    }
  };

  const handleUploadToDB = async () => {
    if (!convertedJson) return;
    try {
      const response = await fetch(`${configuration.API_BASE_URL}masterEquipmentActivities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: convertedJson
      });
      if (!response.ok) throw new Error();
      alert('eBR Converted successfully!');
    } catch {
      alert('Error converting eBR to database.');
    }
  };

  return (
    <div className="doc-popup-overlay">
      <div className="doc-popup">
        <div className="popup-header">
          <h2>Upload DOC to DB</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">✖</button>
        </div>
        <div className="popup-content">
          <div className="template-download-top">
            <p className="template-info">
              Download the template, fill in your details, and upload the completed document.
            </p>
            <a href="/eBR_Template_For_Elog.docx" download>
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
              disabled={!convertedJson}
              onClick={handleUploadToDB}
            >
              Upload to DB
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocToJsonConverterForElog;