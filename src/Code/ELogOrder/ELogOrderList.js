import React, { useEffect, useState, useMemo } from 'react';
import configuration from '../../configuration'; 
import '../../Style/OrdersList.css';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

const ELogOrderList = () => {
  const [elogOrders, setELogOrders] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [newELogOrder, setNewELogOrder] = useState({
    order_number: '',
    selectedEquipment: null, 
    selectedMasterActivities: [], 
  });
  const [masterActivities, setMasterActivities] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [sortField, setSortField] = useState('eLogOrder_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchELogOrders = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}elogOrders`);
      const data = await response.json();
      setELogOrders(data);
    } catch (error) {
      console.error('Failed to fetch eLog orders', error);
    }
  };

  const fetchMasterEquipmentActivities = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}masterEquipmentActivities`);
      const data = await response.json();
      setMasterActivities(data);
    } catch (error) {
      console.error('Failed to fetch master equipment activities', error);
    }
  };

  const fetchEquipments = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}equipments`);
      const data = await response.json();
      setEquipments(data);
    } catch (error) {
      console.error('Failed to fetch equipment', error);
    }
  };

  useEffect(() => {
    fetchELogOrders();
  }, []);

  useEffect(() => {
    if (isPopupOpen) {
      fetchMasterEquipmentActivities();
      fetchEquipments();
    }
  }, [isPopupOpen]);

  const handleActivityChange = (activityId) => {
    setNewELogOrder(prev => ({
      ...prev,
      selectedMasterActivities: prev.selectedMasterActivities.includes(activityId)
        ? prev.selectedMasterActivities.filter(id => id !== activityId)
        : [...prev.selectedMasterActivities, activityId],
    }));
  };

  const handleEquipmentChange = (equipmentId) => {
    setNewELogOrder(prev => ({ ...prev, selectedEquipment: equipmentId }));
  };

  const handleSubmit = async () => {
    try {
      if (!newELogOrder.selectedEquipment) throw new Error('Please select an equipment.');

      const activitySavePromises = newELogOrder.selectedMasterActivities.map(async (activityId) => {
        const masterActivity = await fetch(`${configuration.API_BASE_URL}masterEquipmentActivities/${activityId}`).then(res => res.json());
        const activityData = {
          product_name: masterActivity.product_name,
          activity_name: masterActivity.activity_name,
          activities: masterActivity.activities,
        };

        const newActivityRes = await fetch(`${configuration.API_BASE_URL}equipmentActivities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activityData),
        });

        if (!newActivityRes.ok) throw new Error('Failed to save equipment activity');
        return newActivityRes.json();
      });

      const savedActivities = await Promise.all(activitySavePromises);

      const productPromises = savedActivities.map(async ({ activity_id }) => {
        const activity = await fetch(`${configuration.API_BASE_URL}equipmentActivities/${activity_id}`).then(res => res.json());

        const product = {
          eLog_product_name: activity.activity_name.en,
          equipment_activities_id: activity_id,
          effective: true,
          version: 1,
          start_date: new Date().toISOString(),
          end_date: null,
        };

        const productRes = await fetch(`${configuration.API_BASE_URL}eLogProducts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });

        if (!productRes.ok) throw new Error('Failed to save product');
        return productRes.json();
      });

      const savedProducts = await Promise.all(productPromises);

      const equipment = await fetch(`${configuration.API_BASE_URL}equipments/${newELogOrder.selectedEquipment}`).then(res => res.json());

      const eLogOrderData = {
        eLogOrder_name: newELogOrder.order_number,
        eLogProducts: savedProducts.map(p => p.product_id),
        equipmentInfo: {
          equipment_id: equipment._id,
          equipment_type_id: equipment.equipment_type_id,
          equipment_name: equipment.equipment_name
        }
      };

      const orderRes = await fetch(`${configuration.API_BASE_URL}eLogOrders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eLogOrderData),
      });

      if (!orderRes.ok) throw new Error('Failed to save eLog order');

      setPopupOpen(false);
      setNewELogOrder({ order_number: '', selectedEquipment: null, selectedMasterActivities: [] });
      fetchELogOrders();

    } catch (error) {
      console.error('Error in saving eLog order:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredMasterActivities = masterActivities.filter(activity =>
    activity.activity_name.en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEquipments = equipments.filter(e =>
    e.equipment_name.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  const isOrderNumberDuplicate = useMemo(() => {
    const duplicate = elogOrders.some(order => order.eLogOrder_name.trim() === newELogOrder.order_number.trim());
    setErrorMessage(duplicate ? 'Order number already exists' : '');
    return duplicate;
  }, [newELogOrder.order_number, elogOrders]);

  const isSubmitDisabled = !newELogOrder.order_number.trim() || isOrderNumberDuplicate || !newELogOrder.selectedEquipment || newELogOrder.selectedMasterActivities.length === 0;

  const filteredAndSortedELogOrders = useMemo(() => {
    const filtered = elogOrders.filter(order =>
      order.eLogOrder_name.toLowerCase().includes(orderSearchTerm.toLowerCase())
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
  }, [elogOrders, orderSearchTerm, sortField, sortOrder]);

  return (
    <div className="container main-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <h2 className="mb-3 mb-md-0">eLog Orders</h2>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>Create New eLog Order</button>
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
            <option value="eLogOrder_name">Order Number</option>
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

      {isPopupOpen && (
        <>
          <div className="modal-backdrop-custom"></div>
          <div className="custom-modal p-4 rounded shadow-lg">
            <h4>Create New eLog Order</h4>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Order Number"
              value={newELogOrder.order_number}
              onChange={(e) => setNewELogOrder(prev => ({ ...prev, order_number: e.target.value }))}
            />
            {errorMessage && <p className="text-danger mb-2">{errorMessage}</p>}

            <div className="mb-3">
              <h5>Select Equipment</h5>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Search equipment..."
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
              />
              <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {filteredEquipments.map(equipment => (
                  <div key={equipment._id} className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      id={equipment._id}
                      name="equipment"
                      checked={newELogOrder.selectedEquipment === equipment._id}
                      onChange={() => handleEquipmentChange(equipment._id)}
                    />
                    <label className="form-check-label" htmlFor={equipment._id}>{equipment.equipment_name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <h5>Select Equipment Activities</h5>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Search equipment activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {filteredMasterActivities.map(activity => (
                  <div key={activity._id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={activity._id}
                      checked={newELogOrder.selectedMasterActivities.includes(activity._id)}
                      onChange={() => handleActivityChange(activity._id)}
                    />
                    <label className="form-check-label" htmlFor={activity._id}>{activity.activity_name.en}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-success" onClick={handleSubmit} disabled={isSubmitDisabled}>Save eLog Order</button>
              <button className="btn btn-secondary" onClick={() => setPopupOpen(false)}>Cancel</button>
            </div>
          </div>
        </>
      )}

      <div className="row mt-4">
        {filteredAndSortedELogOrders.map(order => (
          <div key={order._id} className="col-12 col-sm-6 col-lg-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">eLog Order Name: {order.eLogOrder_name}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ELogOrderList;