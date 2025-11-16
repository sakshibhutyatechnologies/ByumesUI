import React, { useState, useEffect, useRef } from 'react';
import configuration from '../configuration';

const UserProfile = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(o => !o);

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setShowChangePw(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getInitials = name => name.split(' ').map(p => p[0].toUpperCase()).join('');
  const initials = getInitials(user.full_name);
  const roleColors = { Admin: '#ff5733', Operator: '#33ff57', QA: '#3357ff', Supervisor: '#ff33a1' };
  const bg = roleColors[user.role] || '#cccccc';

  const handleChangePassword = async () => {
    const loginId = user.loginId;
    setPwError('');
    if (!oldPassword || !newPassword) {
      setPwError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    try {
      const res = await fetch(
        `${configuration.API_BASE_URL}users/change-password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ loginId ,oldPassword, newPassword })
        }
      );
      if (res.ok) {
        setShowChangePw(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        alert('Password changed successfully');
        onLogout();
      } else {
        const err = await res.json();
        setPwError(err.message || 'Failed to change password');
      }
    } catch (e) {
      setPwError('Error changing password');
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn d-flex align-items-center gap-2 p-0"
        onClick={toggleDropdown}
        id="userDropdown"
        aria-expanded={dropdownOpen}
      >
        <div
          className="rounded-circle text-white d-flex justify-content-center align-items-center"
          style={{ width: '40px', height: '40px', backgroundColor: bg, fontWeight: 'bold' }}
        >
          {initials}
        </div>
        <span className="dropdown-toggle text-white"></span>
      </button>

      {dropdownOpen && (
        <ul
          className="dropdown-menu dropdown-menu-end show mt-2 shadow-lg rounded"
          aria-labelledby="userDropdown"
          style={{ right: 0, left: 'auto', position: 'absolute', minWidth: '200px', zIndex: 1050 }}
        >
          <li className="dropdown-item">Username: {user.full_name}</li>
          <li className="dropdown-item">Login ID: {user.loginId}</li>
          <li className="dropdown-item">Language: {user.language}</li>
          <li className="dropdown-item">Role: {user.role}</li>
          <li className="dropdown-item">
            <button
              className="btn btn-link p-0"
              onClick={() => setShowChangePw(true)}
            >
              Change Password
            </button>
          </li>
          <li className="w-100">
            <button
              className="btn btn-danger w-100 py-2"
              onClick={onLogout}
            >
              Logout
            </button>
          </li>
        </ul>
      )}

      {showChangePw && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1060
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
              style={{ maxWidth: '400px', width: '90%' }}
            >
              <div className="modal-content" style={{ position: 'relative' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                  <h5 className="modal-title">Change Password</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowChangePw(false)}
                    style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label className="form-label">Old Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {pwError && <div className="text-danger mb-3">{pwError}</div>}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowChangePw(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleChangePassword}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;