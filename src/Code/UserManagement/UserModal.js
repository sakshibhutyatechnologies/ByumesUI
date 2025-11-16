import React from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const UserModal = ({
  showModal,
  handleModalClose,
  editingUser,
  formData,
  showPassword,
  setShowPassword,
  handleInputChange,
  handleSubmit,
  enums,
  companies,
  isFormChanged
}) => {
  if (!showModal) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{editingUser ? 'Edit User' : 'Create User'}</h5>
            <button className="btn-close" onClick={handleModalClose}></button>
          </div>
          <div className="modal-body">
            <form>
              {['loginId', 'full_name', 'email'].map((field, idx) => (
                <div className="mb-2" key={idx}>
                  <label className="form-label">
                    {field === 'loginId' ? 'Login ID' : field === 'full_name' ? 'Full Name' : 'Email'}
                    <span className="text-danger"> *</span>
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    className="form-control"
                    value={formData[field]}
                    onChange={handleInputChange}
                    disabled={field === 'email' && editingUser}
                  />
                </div>
              ))}

              {!editingUser && (
                <div className="mb-2">
                  <label className="form-label">Password<span className="text-danger"> *</span></label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword(p => !p);
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              )}

              {['role', 'language', 'timezone'].map(key => (
                <div className="mb-2" key={key}>
                  <label className="form-label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <select
                    className="form-select"
                    name={key}
                    value={formData[key]}
                    onChange={handleInputChange}
                  >
                    {enums[key + 's']?.map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="mb-2">
                <label className="form-label">Company</label>
                <select
                  className="form-select"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Company --</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleModalClose}>Cancel</button>
            <button
              className="btn btn-primary"
              disabled={editingUser && !isFormChanged}
              onClick={() => {
                handleSubmit();
                handleModalClose();
              }}
            >
              {editingUser ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;