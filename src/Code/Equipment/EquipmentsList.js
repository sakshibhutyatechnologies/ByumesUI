import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../Style/Equipment.css';
import configuration from '../../configuration';
import { AiOutlineClose, AiOutlineArrowLeft } from 'react-icons/ai';

const EquipmentsList = () => {
  const { equipmentTypeId } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentTypeName, setEquipmentTypeName] = useState('');
  const [properties, setProperties] = useState([{ name: '', value: '' }]);
  const [defaultProperties, setDefaultProperties] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);

  useEffect(() => {
    fetchEquipment();
    fetchEquipmentTypeName();
    fetchDefaultProperties();
  }, [equipmentTypeId]);

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}equipments/equipment-type/${equipmentTypeId}`);
      const data = await response.json();
      setEquipment(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setEquipment([]);
    }
  };

  const fetchEquipmentTypeName = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}equipmentTypes/${equipmentTypeId}/equipmentTypeName`);
      const data = await response.json();
      setEquipmentTypeName(data);
    } catch (error) {
      console.error('Error fetching equipment type name:', error);
    }
  };

  const fetchDefaultProperties = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}equipmentTypes/${equipmentTypeId}/properties`);
      const data = await response.json();
      setDefaultProperties(data.map(prop => ({ name: prop.name, value: prop.value })));
    } catch (error) {
      console.error('Error fetching equipment type properties:', error);
      setDefaultProperties([]);
    }
  };

  const handlePropertyChange = (index, key, value) => {
    const updated = [...properties];
    updated[index][key] = value;
    setProperties(updated);
  };

  const addPropertyField = () => {
    const allFilled = properties.every(prop => prop.name.trim() && prop.value.trim());
    if (!allFilled) return;
    setProperties([...properties, { name: '', value: '' }]);
  };

  const removePropertyField = (index) => {
    if (properties.length === 1) return;
    const updated = [...properties];
    updated.splice(index, 1);
    setProperties(updated);
  };

  const handleEdit = (item) => {
    setEquipmentName(item.equipment_name);
    setProperties(item.equipment_properties);
    setEditingEquipmentId(item._id);
    setPopupOpen(true);
  };

  const handleCreateNew = () => {
    setEditingEquipmentId(null);
    setEquipmentName('');
    setProperties(defaultProperties.length > 0 ? [...defaultProperties] : [{ name: '', value: '' }]);
    setPopupOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${configuration.API_BASE_URL}equipments/${id}`, { method: 'DELETE' });
      fetchEquipment();
      alert('Equipment deleted successfully');
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipmentName.trim() || properties.some(prop => !prop.name.trim() || !prop.value.trim())) {
      alert('Please provide valid inputs.');
      return;
    }

    const payload = {
      equipment_type_id: equipmentTypeId,
      equipment_name: equipmentName,
      equipment_properties: properties,
    };

    try {
      setIsSubmitting(true);
      const url = editingEquipmentId
        ? `${configuration.API_BASE_URL}equipments/${editingEquipmentId}`
        : `${configuration.API_BASE_URL}equipments`;
      const method = editingEquipmentId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save equipment');
      fetchEquipment();
      setPopupOpen(false);
    } catch (error) {
      console.error('Error saving equipment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = Boolean(editingEquipmentId);

  return (
    <div className="container main-container">
      <div className="d-flex justify-content-start mb-3">
        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate('/equipmentTypes')}>
          <AiOutlineArrowLeft className="me-1" /> Back to Equipment Types
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-0 me-3">Equipments for {equipmentTypeName}</h2>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          Create New Equipment
        </button>
      </div>

      <div className="row">
        {equipment.map(item => (
          item.effective && (
            <div key={item._id} className="col-md-6 col-lg-4 mb-3">
              <div className="card shadow-sm border h-100">
                <div className="card-body">
                  <h5 className="card-title">{item.equipment_name}</h5>
                  <ul className="mb-3">
                    {item.equipment_properties.map((prop, idx) => (
                      <li key={idx}><strong>{prop.name}:</strong> {prop.value}</li>
                    ))}
                  </ul>
                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {isPopupOpen && (
        <>
          <div className="modal-backdrop-custom"></div>
          <div className="custom-modal p-4 rounded shadow-lg">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">{isEditMode ? 'Edit Equipment' : 'Create New Equipment'}</h4>
              <button className="btn-close" onClick={() => setPopupOpen(false)} aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Equipment Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={equipmentName}
                  onChange={e => setEquipmentName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <h6>Equipment Properties</h6>
                {properties.map((prop, idx) => {
                  const isDefault = !isEditMode && defaultProperties[idx] &&
                    defaultProperties[idx].name === prop.name && defaultProperties[idx].value === prop.value;
                  return (
                    <div key={idx} className="row g-2 mb-2 align-items-center" style={isDefault ? { backgroundColor: '#e9f7ef', padding: '8px', borderRadius: '4px' } : {}}>
                      <div className="col">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Property Name"
                          value={prop.name}
                          onChange={e => handlePropertyChange(idx, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Property Value"
                          value={prop.value}
                          onChange={e => handlePropertyChange(idx, 'value', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-auto">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => removePropertyField(idx)}
                          disabled={properties.length === 1}
                          aria-label="Remove property"
                        >
                          <AiOutlineClose size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm mt-2"
                  onClick={addPropertyField}
                  disabled={properties.some(prop => !prop.name.trim() || !prop.value.trim())}
                >
                  Add Property
                </button>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isSubmitting || !equipmentName.trim() || properties.some(prop => !prop.name.trim() || !prop.value.trim())}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPopupOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default EquipmentsList;