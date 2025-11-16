import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Code/Login/LoginView';
import OrderSelection from './Code/Order/OrderSelection';
import ProductSelection from './Code/Product/ProductSelection';
import OrdersList from './Code/Order/OrdersList';
import ProductsList from './Code/Product/ProductsList';
import EquipmentTypesList from './Code/EquipmentType/EquipmentTypesList';
import Equipment from './Code/Equipment/EquipmentsList';
import Navbar from './Code/Navbar';
import configuration from './configuration';
import HomePage from './Code/HomePage';
import ImagesList from './Code/Image&GIF/ImagesList';
import GIFsList from './Code/Image&GIF/GIFsList';
import RequireAuth from './Code/Login/RequireAuth';
import UserManagement from './Code/UserManagement/UserManagement';
import ELogOrderSelection from './Code/ELogOrder/ELogOrderSelection';
import ELogProductSelection from './Code/ELogOrder/ELogProductSelection';
import ELogOrderList from './Code/ELogOrder/ELogOrderList';
import EquipmentActivitiesList from './Code/ELogOrder/EquipmentActivitiesList';
import InstructionExecutionView from './Code/InstructionView/InstructionExecutionView';
import ActivityExecutionView from './Code/ELogActivityView/ActivityExecutionView';

import { useAppContext } from './Context/AppContext';
import { InstructionsProvider } from './Context/InstructionsContext';
import { ELogActivitiesProvider } from './Context/ELogActivitiesContext';


function App() {
  const { user, isLoggedIn } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [eLogOrders, setELogOrders] = useState([]);
  const [eLogProducts, setELogProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedELogOrder, setSelectedELogOrder] = useState(null);
  const [selectedOrderName, setSelectedOrderName] = useState('');
  const [selectedELogOrderName, setSelectedELogOrderName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedELogProduct, setSelectedELogProduct] = useState(null);
  const [equipmentName, setEquipmentName] = useState(null);

  const fetchProducts = async (orderId) => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}orders/${orderId}`);
      const order = await res.json();
      if (!order?.products) return;

      const bulkRes = await fetch(`${configuration.API_BASE_URL}products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: order.products }),
      });
      const data = await bulkRes.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchELogProducts = async (eLogOrderId) => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}eLogOrders/${eLogOrderId}`);
      const eLogOrder = await res.json();
      if (!eLogOrder?.eLogProducts) return;

      const bulkRes = await fetch(`${configuration.API_BASE_URL}eLogProducts/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: eLogOrder.eLogProducts }),
      });
      const data = await bulkRes.json();
      setELogProducts(data);
    } catch (err) {
      console.error('Error fetching eLog products:', err);
    }
  };

  const findOrderName = (id) => orders.find(o => o._id === id)?.order_name || 'Unknown';
  const findELogOrderName = (id) => eLogOrders.find(o => o._id === id)?.eLogOrder_name || 'Unknown';
  const findEquipmentName = (id) => eLogOrders.find(o => o._id === id)?.equipmentInfo?.equipment_name || 'Unknown';

  useEffect(() => {
    if (selectedOrder) {
      fetchProducts(selectedOrder);
      setSelectedOrderName(findOrderName(selectedOrder));
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (selectedELogOrder) {
      fetchELogProducts(selectedELogOrder);
      setSelectedELogOrderName(findELogOrderName(selectedELogOrder));
      setEquipmentName(findEquipmentName(selectedELogOrder));
    }
  }, [selectedELogOrder]);

  return (
    <Router>
      <div className="container-fluid min-vh-100 d-flex flex-column p-0">
        {isLoggedIn && <Navbar />}
        <main className="flex-grow-1 p-3">
          <Routes>
            {!isLoggedIn ? (
              <Route path="/" element={<Login />} />
            ) : (
              <>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
                <Route path="/orderSelection" element={<OrderSelection setOrders={setOrders} setSelectedOrder={setSelectedOrder} />} />
                <Route path="/eLogOrderSelection" element={<ELogOrderSelection setELogOrders={setELogOrders} setSelectedELogOrder={setSelectedELogOrder} />} />
                <Route path="/productSelection" element={
                  <ProductSelection
                    products={products}
                    setSelectedProduct={setSelectedProduct}
                    selectedOrder={selectedOrder}
                    selectedOrderName={selectedOrderName}
                  />
                } />
                <Route path="/eLogProductSelection" element={
                  <ELogProductSelection
                    eLogProducts={eLogProducts}
                    setSelectedElogProduct={setSelectedELogProduct}
                    selectedElogOrder={selectedELogOrder}
                    selectedELogOrderName={selectedELogOrderName}
                  />
                } />
                <Route path="/orders" element={<OrdersList />} />
                <Route path="/products" element={<ProductsList />} />
                <Route path="/equipmentTypes" element={<EquipmentTypesList />} />
                <Route path="/equipmentActivities" element={<EquipmentActivitiesList />} />
                <Route path="/eLogOrders" element={<ELogOrderList />} />
                <Route path="/instructions" element={
                    selectedProduct ? (
                      <InstructionsProvider
                        data={selectedProduct}
                        orderNumber={selectedOrder}
                        user={user}
                        orderName={selectedOrderName}
                        productName={selectedProduct?.product_name}
                        productNumber={selectedProduct?._id}
                      >
                        <InstructionExecutionView />
                      </InstructionsProvider>
                    ) : (
                      <Navigate to="/productSelection" />
                    )
                  } />
                <Route path="/eLogInstructions" element={
                  selectedELogProduct ? (
                  <ELogActivitiesProvider
                      data={selectedELogProduct}
                      user={user}
                      eLogOrderName={selectedELogOrderName}
                      eLogOrderNumber={selectedELogOrder}
                      eLogProductName={selectedELogProduct?.eLog_product_name}
                      eLogProductNumber={selectedELogProduct?._id}
                      equipmentName={equipmentName}
                    >
                      <ActivityExecutionView />
                    </ELogActivitiesProvider> 
                  ) : (
                    <Navigate to="/eLogProductSelection" />
                  )
                } />
                <Route path="/equipment/:equipmentTypeId" element={<Equipment />} />
                <Route path="/images" element={<ImagesList />} />
                <Route path="/gifs" element={<GIFsList />} />
                <Route path="/userManagement" element={<UserManagement />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;