import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import configuration from '../../configuration';
import PageWrapper from '../pageWrapper.js';

const OrderSelection = ({ setSelectedOrder, setOrders }) => {
  const navigate = useNavigate();
  const [localOrders, setLocalOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${configuration.API_BASE_URL}orders`);
        const data = await res.json();
        setLocalOrders(data);
        setOrders(data);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    fetchOrders();
  }, []);

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedOrder(selectedOption.value);
      navigate('/productSelection');
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  const options = localOrders
    .sort((a, b) => a.order_name.localeCompare(b.order_name))
    .map(o => ({ value: o._id, label: o.order_name }));

  return (
    <PageWrapper>
      {/* Back button above the main box */}
     <div className="mb-3">
        <button className="btn btn-outline-primary" onClick={handleBackHome}>
          ← Back to Home
        </button>
      </div>

      {/* Main selection box */}
      <div className="bg-white shadow rounded-4 p-4">
        <h4 className="fw-bold mb-3 text-center">Select an Order</h4>
        <Select
          options={options}
          onChange={handleChange}
          placeholder="-- Select Order --"
          filterOption={(option, inputValue) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          }
        />
      </div>
    </PageWrapper>
  );
};

export default OrderSelection;