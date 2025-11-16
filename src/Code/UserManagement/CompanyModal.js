import React from 'react';

const CompanyModal = ({
  showCompanyModal,
  handleCompanyModalClose,
  newCompany,
  setNewCompany,
  handleAddCompany
}) => {
  if (!showCompanyModal) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Company</h5>
            <button className="btn-close" onClick={handleCompanyModalClose}></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="mb-2">
                <label className="form-label">Company Name<span className="text-danger"> *</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Industry</label>
                <input
                  type="text"
                  className="form-control"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Subscription Plan</label>
                <select
                  className="form-select"
                  value={newCompany.subscription_plan}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, subscription_plan: e.target.value }))}
                >
                  {['free', 'pro', 'enterprise'].map(plan => (
                    <option key={plan} value={plan}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleCompanyModalClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { handleAddCompany(); handleCompanyModalClose(); }}>
              Add Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;