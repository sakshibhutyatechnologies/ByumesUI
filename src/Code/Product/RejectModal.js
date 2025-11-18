import React, { useState } from 'react';
import configuration from '../../configuration';

const RejectModal = ({ instruction, onClose, onReject }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${configuration.API_BASE_URL}masterInstructions/${instruction._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reason })
      });

      if (!res.ok) throw new Error('Failed to reject');

      alert('Instruction rejected and sent back to "Created".');
      onReject(); // Refresh the main list
      onClose();
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="doc-popup-overlay">
      <div className="doc-popup">
        <div className="popup-header">
          <h2>Reject "{instruction.product_name}"</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="popup-content">
          <div className="approver-section">
            <label htmlFor="rejection-reason">Rejection Reason:</label>
            <textarea
              id="rejection-reason"
              className="form-control"
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this is being rejected..."
            ></textarea>
          </div>
          <div className="center-controls mt-4">
            <button className="btn btn-danger" onClick={handleSubmit}>Submit Rejection</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;