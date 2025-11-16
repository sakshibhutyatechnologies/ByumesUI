import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import configuration from '../../configuration.js';
import PageWrapper from '../pageWrapper.js';

const ELogOrderSelection = ({ setSelectedELogOrder, setELogOrders }) => {
  const navigate = useNavigate();
  const [localElogOrders, setLocalElogOrders] = useState([]);

  useEffect(() => {
    const fetchELogOrders = async () => {
      try {
        const res = await fetch(`${configuration.API_BASE_URL}eLogOrders`);
        const data = await res.json();
        setLocalElogOrders(data);
        setELogOrders(data);
      } catch (err) {
        console.error('Error fetching eLog orders:', err);
      }
    };
    fetchELogOrders();
  }, []);

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedELogOrder(selectedOption.value);
      navigate('/eLogProductSelection');
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  const options = localElogOrders
    .sort((a, b) => a.eLogOrder_name.localeCompare(b.eLogOrder_name))
    .map(o => ({ value: o._id, label: o.eLogOrder_name }));

  return (
    <PageWrapper>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <button className="btn btn-outline-primary" onClick={handleBackHome}>
            ← Back to Home
          </button>
        </div>

        <div className="d-flex justify-content-center align-items-center">
          <div className="bg-white shadow rounded-4 p-4 w-100" style={{ maxWidth: '600px' }}>
            <h4 className="fw-bold mb-3 text-center">Select an eLog Order</h4>
            <Select
              options={options}
              onChange={handleChange}
              placeholder="-- Select eLog Order --"
              filterOption={(option, inputValue) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              }
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ELogOrderSelection;