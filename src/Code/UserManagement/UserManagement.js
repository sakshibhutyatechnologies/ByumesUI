import React, { useState, useEffect } from 'react';
import configuration from '../../configuration';
import { FaEdit, FaSort } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import UserModal from './UserModal';
import CompanyModal from './CompanyModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('full_name');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [enums, setEnums] = useState({ roles: [], languages: [], timezones: [] });
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    loginId: '',
    full_name: '',
    email: '',
    password: '',
    role: 'Operator',
    language: 'en',
    timezone: 'UTC',
    companyId: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    subscription_plan: 'free',
  });

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
    fetchEnums();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${configuration.API_BASE_URL}users`);
    const data = await res.json();
    setUsers(data);
    setFilteredUsers(data);
  };

  const fetchCompanies = async () => {
    const res = await fetch(`${configuration.API_BASE_URL}companies`);
    const data = await res.json();
    setCompanies(data);
  };

  const fetchEnums = async () => {
    const res = await fetch(`${configuration.API_BASE_URL}users/enums`);
    const data = await res.json();
    setEnums(data);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const result = users.filter(user =>
      user.full_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(result);
  };

  const handleSort = (key) => {
    const sorted = [...filteredUsers].sort((a, b) => {
      if (key === 'created_at') return new Date(b.created_at) - new Date(a.created_at);
      return a[key].localeCompare(b[key]);
    });
    setSortBy(key);
    setFilteredUsers(sorted);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      ...user,
      password: '',
      companyId: typeof user.companyId === 'object' ? user.companyId._id : user.companyId || '',
    });
    setShowPassword(false);
    setIsFormChanged(false);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      const changed = Object.keys(updated).some(
        key => updated[key] !== (editingUser?.[key] || '')
      );
      setIsFormChanged(changed);
      return updated;
    });
  };

  const validateUser = () => {
    const requiredFields = ['loginId', 'full_name', 'email'];
    const hasRequired = requiredFields.every(field => formData[field]?.trim());
    const passwordCheck = editingUser ? true : formData.password?.trim();
    return hasRequired && passwordCheck;
  };

  const handleSubmit = async () => {
    if (!validateUser()) return alert('Please fill all required fields.');
    if (!isFormChanged && !formData.password) return;

    setLoading(true);
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const endpoint = editingUser
        ? `${configuration.API_BASE_URL}users/${editingUser._id}`
        : `${configuration.API_BASE_URL}users/register`;

      const normalizedFormData = {
        ...formData,
        companyId: typeof formData.companyId === 'object' ? formData.companyId._id : formData.companyId,
      };

      const body = editingUser
        ? normalizedFormData
        : { ...normalizedFormData, requesterRole: 'Admin' };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Error saving user');
        return;
      }

      setShowModal(false);
      fetchUsers();
      setEditingUser(null);
      setFormData({
        loginId: '',
        full_name: '',
        email: '',
        password: '',
        role: 'Operator',
        language: 'en',
        timezone: 'UTC',
        companyId: '',
      });
      setIsFormChanged(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyModalClose = () => {
    setShowCompanyModal(false);
    setNewCompany({ name: '', industry: '', subscription_plan: 'free' });
  };

  const handleAddCompany = async () => {
    if (!newCompany.name.trim()) return alert('Company name is required.');
    setLoading(true);

    const res = await fetch(`${configuration.API_BASE_URL}companies/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompany),
    });

    setLoading(false);
    if (res.ok) {
      setShowCompanyModal(false);
      setNewCompany({ name: '', industry: '', subscription_plan: 'free' });
      fetchCompanies();
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch(`${configuration.API_BASE_URL}users/password/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, requesterRole: 'Admin' })
      });

      if (res.ok) {
        alert('Password updated successfully');
        setIsPasswordModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.message || 'Password update failed');
      }
    } catch (err) {
      alert('Network error or unexpected issue');
      console.error(err);
    }
  };

  return (
    <div className={`container main-container position-relative ${showModal || showCompanyModal ? 'modal-open-blur' : ''}`}>
      {loading && <LoadingSpinner />}
      <h3 className="mb-3">User Management</h3>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create User</button>
          <button className="btn btn-secondary" onClick={() => setShowCompanyModal(true)}>+ Add Company</button>
        </div>
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <input
            className="form-control"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button className="btn btn-outline-secondary" onClick={() => handleSort(sortBy)}>
            <FaSort className="me-2" />Sort
          </button>
        </div>
      </div>

      <div className="row">
        {filteredUsers.map(user => (
          <div key={user._id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm position-relative">
              <button className="btn btn-sm btn-light position-absolute top-0 end-0 m-2" onClick={() => handleEditClick(user)}>
                <FaEdit />
              </button>
              <button className="btn btn-sm btn-warning position-absolute top-0 end-0 m-2 me-5" onClick={() => {
                setSelectedUserId(user._id);
                setNewPassword('');
                setConfirmPassword('');
                setIsPasswordModalOpen(true);
              }}>
                🔒
              </button>
              <div className="card-body pt-4">
                <h5 className="card-title">{user.full_name}</h5>
                <h6 className="card-subtitle text-muted">{user.email}</h6>
                <p className="mb-1"><strong>Login ID:</strong> {user.loginId}</p>
                <p className="mb-1"><strong>Role:</strong> {user.role}</p>
                <p className="mb-0"><strong>Company:</strong> {user.companyId?.name || user.companyId}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isPasswordModalOpen && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button className="btn-close" onClick={() => setIsPasswordModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  disabled={!newPassword || newPassword !== confirmPassword}
                  onClick={handlePasswordUpdate}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <UserModal
        showModal={showModal}
        handleModalClose={() => setShowModal(false)}
        editingUser={editingUser}
        formData={formData}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        enums={enums}
        companies={companies}
        isFormChanged={isFormChanged}
      />

      <CompanyModal
        showCompanyModal={showCompanyModal}
        handleCompanyModalClose={handleCompanyModalClose}
        newCompany={newCompany}
        setNewCompany={setNewCompany}
        handleAddCompany={handleAddCompany}
      />
    </div>
  );
};

export default UserManagement;