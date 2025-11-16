import React, { useState } from 'react';
import '../../Style/EquipmentType.css';  // Add your CSS for styling

const EquipmentTypeForm = () => {
  const [equipmentName, setEquipmentName] = useState('');
  const [properties, setProperties] = useState(Array(100).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle change in properties
  const handlePropertyChange = (index, event) => {
    const newProperties = [...properties];
    newProperties[index] = event.target.value;
    setProperties(newProperties);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validProperties = properties.filter(prop => prop.trim() !== ''); // Only non-empty properties
    
    if (equipmentName.trim() === '' || validProperties.length === 0) {
      alert("Please provide a valid equipment name and at least one property.");
      return;
    }

    const newEquipment = {
      equipment_name: equipmentName,
      equipment_properties: validProperties
    };

    try {
      setIsSubmitting(true);
      const response = await fetch('API_BASE_URL/equipmentTypes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEquipment),
      });

      if (!response.ok) {
        throw new Error('Failed to save equipment type');
      }

      const data = await response.json();
      console.log('New Equipment Type saved:', data);
      // Handle success, perhaps clear the form or navigate away
    } catch (error) {
      console.error('Error saving equipment type:', error);
      alert('Failed to save equipment type');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="equipment-type-form">
      <h3>Create New Equipment Type</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Equipment Name:
          <input 
            type="text"
            value={equipmentName}
            onChange={(e) => setEquipmentName(e.target.value)}
            placeholder="Enter equipment name"
            required
          />
        </label>

        <div className="property-inputs">
          {properties.map((property, index) => (
            <div key={index} className="property-input">
              <label>Property {index + 1}:</label>
              <input
                type="text"
                value={property}
                onChange={(e) => handlePropertyChange(index, e)}
                placeholder={`Enter property ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Equipment Type'}
        </button>
      </form>
    </div>
  );
};

export default EquipmentTypeForm;
