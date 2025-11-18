import React, { useEffect, useState, useMemo } from 'react';
import '../../Style/ProductsList.css';
import configuration from '../../configuration';
import DocToJsonConverter from '../DocToJsonConverter/DocToJsonConverter';

const ProductsList = () => {
  const [instructions, setInstructions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocPopup, setShowDocPopup] = useState(false);

 


  const fetchInstructions = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the token from storage
      
      const res = await fetch(`${configuration.API_BASE_URL}masterInstructions`, {
        headers: {
          'Authorization': `Bearer ${token}` // Send the token
        }
      });

      if (res.ok) {
        setInstructions(await res.json());
      } else {
        // If the request fails, log the error and set an empty array
        console.error('Failed to fetch instructions:', await res.json());
        setInstructions([]); 
      }
    } catch (err) {
      console.error('Failed to fetch instructions', err);
      setInstructions([]);
    }
  };

  useEffect(() => {
    fetchInstructions();
  }, []);

  const handleApprove = async (instructionId) => {
    if (!window.confirm('Are you sure you want to approve this instruction?')) return;
    try {
      const token = localStorage.getItem('token'); // Get the token again
      
      const res = await fetch(`${configuration.API_BASE_URL}masterInstructions/${instructionId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}` // Send the token
        }
      });

      if (!res.ok) throw new Error("Approval failed");
      alert('Instruction approved!');
      fetchInstructions();
    } catch (err) {
      alert('Approval failed. Please try again.');
    }
  };

  const { pendingInstructions, approvedInstructions } = useMemo(() => {
    // This check makes your component safer
    const list = Array.isArray(instructions)
      ? instructions.filter(p =>
          p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : []; // If instructions is not an array, use an empty array

    return {
      pendingInstructions: list.filter(item => item.status === 'pending'),
      approvedInstructions: list.filter(item => item.status !== 'pending'),
    };
  }, [instructions, searchTerm]);

 


  return (
    <div className="container main-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-2 mb-md-0">Products</h2>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={() => setShowDocPopup(true)}>Convert to eBR</button>
          <input type="text" className="form-control" placeholder="Search product..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '200px' }}/>
        </div>
      </div>

      <div className="mb-5">
        <h3>Pending Approval ({pendingInstructions.length})</h3>
        <hr/>
        <div className="row">
          {pendingInstructions.length > 0 ? pendingInstructions.map(item => (
            <div key={item._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card shadow-sm h-100 card-pending">
                <div className="card-body">
                  <h5 className="card-title text-center mb-2">{item.product_name}</h5>
                  <p className="card-text text-muted text-center small">
                    Approvers: {item.approvers.map(a => a.username).join(', ')}
                  </p>
                </div>
                <div className="card-footer">
                    <button className="btn btn-success w-100" onClick={() => handleApprove(item._id)}>Approve</button>
                </div>
              </div>
            </div>
          )) : <p>No items are currently pending approval.</p>}
        </div>
      </div>

      <div>
        <h3>Approved ({approvedInstructions.length})</h3>
        <hr/>
        <div className="row">
          {approvedInstructions.map(item => (
            <div key={item._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex align-items-center justify-content-center">
                  <h5 className="card-title text-center mb-0">{item.product_name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDocPopup && <DocToJsonConverter onClose={() => setShowDocPopup(false)} onUploadSuccess={fetchInstructions} />}
    </div>
  );
};

export default ProductsList;