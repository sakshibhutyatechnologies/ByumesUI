import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div 
      className="container-fluid d-flex justify-content-center align-items-center" 
      style={{ height: 'calc(100vh - 60px)' }}
    >
      <div className="text-center w-75">
        <h1 className="mb-5 display-4 fw-bold text-dark">Order Management</h1>
        <div className="d-flex justify-content-center gap-4">
          <button
            onClick={() => handleNavigate('/orderSelection')}
            className="btn btn-primary btn-lg px-5 py-4 shadow"
          >
            <strong>Orders</strong>
          </button>
          <button
            onClick={() => handleNavigate('/eLogOrderSelection')}
            className="btn btn-primary btn-lg px-5 py-4 shadow"
          >
            <strong>eLog Orders</strong>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;