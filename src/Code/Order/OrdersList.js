import React, { useEffect, useState, useMemo, useCallback } from 'react';
import configuration from '../../configuration';
import '../../Style/OrdersList.css';
import { useAppContext } from '../../Context/AppContext';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    order_name: '',
    selectedMasterInstructions: [],
  });
  const [masterInstructions, setMasterInstructions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [sortField, setSortField] = useState('order_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [errorMessage, setErrorMessage] = useState('');

  const { user } = useAppContext();
  const currentUserEmail = user?.email;
  const token = localStorage.getItem('token'); 

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}orders`, {
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      const productIds = [...new Set(data.flatMap(order => order.products))];

      if (productIds.length === 0) {
        setOrders(data);
        return;
      }

      const productsResponse = await fetch(`${configuration.API_BASE_URL}products/bulk`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ productIds }),
      });
      if (!productsResponse.ok) throw new Error('Failed to fetch bulk products');
      const productsData = await productsResponse.json();

      const productMap = {};
      productsData.forEach(product => {
        productMap[product._id] = product.product_name;
      });

      const ordersWithNames = data.map(order => ({
        ...order,
        productNames: order.products.map(id => productMap[id] || 'Unknown Product'),
      }));

      setOrders(ordersWithNames);
    } catch (error) {
      console.error('Failed to fetch orders or products', error);
    }
  }, [token]); 

  const fetchMasterInstructionByProductName = useCallback(async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}masterInstructions/approved-products`, {
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (response.ok) {
        const data = await response.json();
        setMasterInstructions(data);
      } else {
        setMasterInstructions([]);
      }
    } catch (error) {
      console.error('Failed to fetch approved products', error);
      setMasterInstructions([]);
    }
  }, [token]); 

  const fetchMasterInstructionByID = useCallback(async (id) => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}masterInstructions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (!response.ok) throw new Error('Failed to fetch instruction by ID');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch master instruction by ID', error);
      return null;
    }
  }, [token]); 

  useEffect(() => {
    if (token) fetchOrders();
  }, [token, fetchOrders]); 

  useEffect(() => {
    if (isPopupOpen && token) {
      fetchMasterInstructionByProductName();
    }
  }, [isPopupOpen, token, fetchMasterInstructionByProductName]); 

  const handleMasterInstructionChange = (instructionId) => {
    const selected = newOrder.selectedMasterInstructions.includes(instructionId)
      ? newOrder.selectedMasterInstructions.filter(id => id !== instructionId)
      : [...newOrder.selectedMasterInstructions, instructionId];

    setNewOrder({ ...newOrder, selectedMasterInstructions: selected });
  };

  const handleSubmit = useCallback(async () => {
    try {
      const masterInstructionSavePromises = newOrder.selectedMasterInstructions.map(async (instructionId) => {
        const masterInstruction = await fetchMasterInstructionByID(instructionId);
        if (!masterInstruction) throw new Error(`Failed to fetch master instruction with ID: ${instructionId}`);

        const instructionData = {
          instruction_name: masterInstruction.instruction_name,
          instructions: masterInstruction.instructions
        };

        const newInstructionResponse = await fetch(`${configuration.API_BASE_URL}instructions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(instructionData)
        });

        if (!newInstructionResponse.ok) throw new Error('Failed to save master instruction');
        const newInstruction = await newInstructionResponse.json();
        if (!newInstruction?.instruction_id) throw new Error('No instruction ID returned');

        const productData = {
          product_name: masterInstruction.product_name,
          instruction_id: newInstruction.instruction_id,
          effective: true,
          version: 1,
          start_date: new Date().toISOString(),
          end_date: null,
          created_by: currentUserEmail,
          status: 'active'
        };

        const productResponse = await fetch(`${configuration.API_BASE_URL}products`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(productData)
        });

        if (!productResponse.ok) throw new Error('Failed to save product');
        const savedProduct = await productResponse.json();
        if (!savedProduct?.product_id) throw new Error('No product ID returned'); 

        return savedProduct;
      });

      const savedProducts = await Promise.all(masterInstructionSavePromises);
      if (!savedProducts.length) throw new Error('No products were saved');

      const orderData = {
        order_name: newOrder.order_name,
        products: savedProducts.map(product => product.product_id),
        created_by: currentUserEmail,
        status: 'active'
      };

      const orderResponse = await fetch(`${configuration.API_BASE_URL}orders`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) throw new Error('Failed to save order');
      const newOrderResponse = await orderResponse.json();
      if (!newOrderResponse?.order_id) throw new Error('No order ID returned');

      setPopupOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error in saving order:', error);
     alert(`Error: ${error.message}`);
    }
  }, [newOrder, currentUserEmail, fetchMasterInstructionByID, fetchOrders, token]); 

  const filteredMasterInstructions = useMemo(() => {
    if (!Array.isArray(masterInstructions)) return []; 
    return masterInstructions.filter(instruction =>
      instruction.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [masterInstructions, searchTerm]);

  const isOrderNameDuplicate = useMemo(() => {
    if (!Array.isArray(orders)) return false; 
    const duplicate = orders.some(order => order.order_name.trim() === newOrder.order_name.trim());
    setErrorMessage(duplicate ? 'Order name already exists' : '');
    return duplicate;
  }, [newOrder.order_name, orders]);
  
  const isSubmitDisabled = !newOrder.order_name.trim() || isOrderNameDuplicate || newOrder.selectedMasterInstructions.length === 0;

  const filteredAndSortedOrders = useMemo(() => {
    if (!Array.isArray(orders)) return []; 
    const filtered = orders.filter(order =>
      order.order_name.toLowerCase().includes(orderSearchTerm.toLowerCase())
     );
    return filtered.slice().sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
        const diff = aVal - bVal;
        return sortOrder === 'asc' ? diff : -diff;
      }
      const cmp = String(aVal || '').localeCompare(String(bVal || ''));
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [orders, orderSearchTerm, sortField, sortOrder]);

  return (
    <div className="container main-container">
      {/* Header Row */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <h2 className="mb-3 mb-md-0">Orders</h2>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>Create New Order</button>
          <input
            type="text"
            className="form-control"
            placeholder="Search orders..."
            value={orderSearchTerm}
            onChange={(e) => setOrderSearchTerm(e.target.value)}
            style={{ width: '200px' }}
          />
          <select
            className="form-select"
           value={sortField}
            onChange={(e) => {
              setSortField(e.target.value);
              setSortOrder('asc');
            }}
            style={{ width: '180px' }}
          >
            <option value="order_name">Order Name</option>
            <option value="created_by">Created By</option>
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
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

      {/* Popup Form */}
      {isPopupOpen && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop-custom"></div>

          {/* Modal Popup */}
          <div className="custom-modal p-4 rounded shadow-lg">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Create New Order</h4>
              <button
                className="btn-close"
                aria-label="Close"
                onClick={() => setPopupOpen(false)}
              ></button>
            </div>

            <input
              type="text"
              className="form-control mb-2"
              placeholder="Order Name"
              value={newOrder.order_name}
              onChange={(e) => setNewOrder({ ...newOrder, order_name: e.target.value })}
           />
            {errorMessage && <div className="text-danger mb-2">{errorMessage}</div>}

            <div className="mb-3">
              <h5>Select Products</h5>
              <input
           type="text"
                className="form-control mb-2"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredMasterInstructions.length > 0 ? (
                  filteredMasterInstructions.map((instruction) => (
                    // Use Bootstrap's flex utilities for alignment
                    <div key={instruction._id} className="d-flex align-items-center mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input" 
                        id={instruction._id}
                        checked={newOrder.selectedMasterInstructions.includes(instruction._id)}
                        onChange={() => handleMasterInstructionChange(instruction._id)}
                      />
                      <label htmlFor={instruction._id} className="ms-2"> 
                        {instruction.product_name}
                      </label>
                    </div>
                  ))
                ) : (
                 <p className="text-muted">No approved products found.</p>
                )}
           </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
            <button className="btn btn-success" onClick={handleSubmit} disabled={isSubmitDisabled}>Save Order</button>
            <button className="btn btn-secondary" onClick={() => setPopupOpen(false)}>Cancel</button>
            </div>
          </div>
        </>
     )}

      {/* Orders Grid */}
      <div className="row mt-4">
       {filteredAndSortedOrders.map(order => (
          <div key={order._id} className="col-12 col-sm-6 col-lg-4 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Order Name: {order.order_name}</h5>
                {/* <p className="card-text"><strong>Products:</strong> {order.productNames.join(', ')}</p> */}
              </div>
      </div>
          </div>
        ))}
      </div>
  </div>
  );
};

export default OrdersList;