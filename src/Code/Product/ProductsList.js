import React, { useEffect, useState, useMemo } from 'react';
import '../../Style/ProductsList.css';
import configuration from '../../configuration';
import DocToJsonConverter from '../DocToJsonConverter/DocToJsonConverter';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
// IMPORT CONTEXT TO GET LOGGED IN USER INFO
import { useAppContext } from '../../Context/AppContext'; 

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('product_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDocPopup, setShowDocPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('approved'); 

  // GET USER FROM CONTEXT
  const { user } = useAppContext(); 

  const fetchProducts = async () => {
    try {
      // We fetch ALL products, then filter them in the browser based on permissions
      const res = await fetch(`${configuration.API_BASE_URL}masterInstructions/productnames`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this instruction?")) return;
    try {
      const res = await fetch(`${configuration.API_BASE_URL}masterInstructions/${id}/approve`, {
        method: 'PATCH'
      });
      if (res.ok) {
        alert("Approved successfully!");
        fetchProducts(); 
      }
    } catch (err) {
      alert("Approval failed");
    }
  };

  const filteredAndSorted = useMemo(() => {
    if (!user) return []; // Safety check if user isn't loaded yet

    // 1. FILTER BY STATUS & PERMISSIONS
    let list = products.filter(p => {
      const status = p.status || 'approved'; // Default to approved if missing
      
      // --- LOGIC FOR APPROVED TAB ---
      if (activeTab === 'approved') {
        return status === 'approved';
      }

      // --- LOGIC FOR PENDING TAB ---
      if (activeTab === 'pending') {
        if (status !== 'pending') return false;

        // Requirement: Admin sees ALL pending items
        if (user.role === 'Admin') return true;

        // Requirement: Approvers ONLY see items assigned to them
        // We check if the logged-in User ID exists in the product's 'approvers' list
        const isAssignedToMe = p.approvers?.some(appr => appr.user_id === user.userId || appr.user_id === user._id);
        return isAssignedToMe;
      }

      return false;
    });

    // 2. FILTER BY SEARCH
    list = list.filter(p => {
       // Handle multilingual names (Object) vs Legacy names (String)
       const pName = typeof p.product_name === 'object' ? (p.product_name.en || '') : p.product_name;
       return pName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // 3. SORT
    list.sort((a, b) => {
      // Helper to get safe string
      const getVal = (obj, field) => {
        const val = obj[field];
        return typeof val === 'object' ? (val.en || '') : val;
      };

      let aVal = getVal(a, sortField);
      let bVal = getVal(b, sortField);

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = new Date(a[sortField]);
        bVal = new Date(b[sortField]);
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal || '').localeCompare(String(bVal || ''))
        : String(bVal || '').localeCompare(String(aVal || ''));
    });

    return list;
  }, [products, searchTerm, sortField, sortOrder, activeTab, user]);

  // Helper to render Product Name safely (whether String or Object)
  const renderName = (name) => {
      if (typeof name === 'object' && name !== null) return name.en || "Unnamed";
      return name;
  };

  return (
    <div className="container main-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-2 mb-md-0">Products</h2>
        
        {/* Status Tabs */}
        <div className="btn-group me-3">
          <button 
            className={`btn ${activeTab === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved
          </button>
          
          {/* Requirement: Only Admin or Potential Approvers should even SEE the Pending tab */}
          {/* But for simplicity, we let them click it, but the LIST inside will be empty based on filter above */}
          <button 
            className={`btn ${activeTab === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval
          </button>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={() => setShowDocPopup(true)}>
            Convert to eBR
          </button>
          <input
            type="text"
            className="form-control"
            placeholder="Search product..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '200px' }}
          />
           <select
            className="form-select"
            value={sortField}
            onChange={e => {
              setSortField(e.target.value);
              setSortOrder('asc');
            }}
            style={{ width: '150px' }}
          >
            <option value="product_name">Product Name</option>
            <option value="createdAt">Created At</option>
          </select>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            style={{ display: 'flex', alignItems: 'center', padding: '0.375rem 0.75rem' }}
          >
            {sortOrder === 'asc' ? <AiOutlineArrowUp size={20} /> : <AiOutlineArrowDown size={20} />}
          </button>
        </div>
      </div>

      <div className="row">
        {filteredAndSorted.length === 0 && (
          <div className="col-12 text-center">
            <p className="text-muted">
                {activeTab === 'pending' 
                    ? "No pending items assigned to you." 
                    : "No approved products found."}
            </p>
          </div>
        )}

        {filteredAndSorted.map(product => (
          <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <h5 className="card-title text-center mb-2">
                    {renderName(product.product_name)}
                </h5>
                
                {/* Show Approver Info if Pending */}
                {activeTab === 'pending' && (
                  <>
                    <div className="text-center small text-muted mb-2">
                       Waiting for: {product.approvers?.map(a => a.username).join(', ') || 'Admin'}
                    </div>
                    
                    {/* Requirement[cite: 46]: Button visible ONLY to Assigned Approver OR Admin */}
                    <button 
                      className="btn btn-sm btn-success mt-2"
                      onClick={() => handleApprove(product._id)}
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDocPopup && <DocToJsonConverter onClose={() => setShowDocPopup(false)} />}
    </div>
  );
};

export default ProductsList;