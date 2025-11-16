import React, { useState, useEffect } from 'react';
import '../../Style/EquipmentType.css';
import configuration from '../../configuration';
import { AiOutlineClose } from 'react-icons/ai';

const EquipmentTypesList = () => {
  const [equipmentName, setEquipmentName] = useState('');
  const [properties, setProperties] = useState([{ name: '', value: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);

  const fetchEquipmentTypes = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}equipmentTypes`);
      const data = await response.json();
      setEquipmentTypes(data);
    } catch (error) {
      setEquipmentTypes([]);
    }
  };

  useEffect(() => {
    fetchEquipmentTypes();
  }, []);

  const handlePropertyChange = (index, field, value) => {
    const newProperties = [...properties];
    newProperties[index][field] = value;
    setProperties(newProperties);
  };

  const addPropertyField = () => {
    const allFilled = properties.every(p => p.name.trim() && p.value.trim());
    if (!allFilled) return;
    setProperties([...properties, { name: '', value: '' }]);
  };

  const removePropertyField = (index) => {
    if (properties.length === 1) return;
    const newProps = [...properties];
    newProps.splice(index, 1);
    setProperties(newProps);
  };

  const resetForm = () => {
    setEquipmentName('');
    setProperties([{ name: '', value: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validProperties = properties.filter(
      (prop) => prop.name.trim() !== '' && prop.value.trim() !== ''
    );

    if (equipmentName.trim() === '' || validProperties.length === 0) {
      alert('Please provide a valid equipment name and at least one property.');
      return;
    }

    const newEquipment = {
      equipment_type_name: equipmentName,
      equipment_type_properties: validProperties,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${configuration.API_BASE_URL}equipmentTypes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEquipment),
      });

      if (!response.ok) throw new Error('Failed to save equipment type');

      await response.json();
      fetchEquipmentTypes();
      resetForm();
      setPopupOpen(false);
    } catch (error) {
      console.error('Error saving equipment type:', error);
      alert('Failed to save equipment type');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container main-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-0 me-3">Equipment Types</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setPopupOpen(true);
          }}
        >
          Create New Equipment Type
        </button>
      </div>

      <div className="row">
        {equipmentTypes.map((equipment_type) => (
          <div key={equipment_type._id} className="col-md-6 col-lg-4 mb-3">
            <div className="card shadow-sm border h-100">
              <div className="card-body">
                <h5 className="card-title">
                  <a href={`/equipment/${equipment_type._id}`} className="text-decoration-none">
                    {equipment_type.equipment_type_name}
                  </a>
                </h5>
                <ul className="mb-0">
                  {equipment_type.equipment_type_properties.map((property, idx) => (
                    <li key={idx}>
                      <strong>{property.name}:</strong> {property.value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isPopupOpen && (
        <>
          <div className="modal-backdrop-custom"></div>

          <div className="custom-modal">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Create New Equipment Type</h4>
              <button
                className="btn-close"
                onClick={() => {
                  resetForm();
                  setPopupOpen(false);
                }}
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Equipment Type Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="Enter equipment type name"
                  required
                />
              </div>

              <div className="mb-3">
                <h6>Properties</h6>
                {properties.map((property, index) => (
                  <div key={index} className="row g-2 mb-2 align-items-center">
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Property Name"
                        value={property.name}
                        onChange={(e) => handlePropertyChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Property Value"
                        value={property.value}
                        onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => removePropertyField(index)}
                        disabled={properties.length === 1}
                        aria-label="Remove property"
                      >
                        <AiOutlineClose size={16} />
                      </button>
                    </div>
                  </div>
                ))}

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
                  disabled={
                    isSubmitting ||
                    equipmentName.trim() === '' ||
                    properties.length === 0 ||
                    properties.some(prop => !prop.name.trim() || !prop.value.trim())
                  }
                >
                  {isSubmitting ? 'Saving...' : 'Save Equipment Type'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    resetForm();
                    setPopupOpen(false);
                  }}
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

export default EquipmentTypesList;