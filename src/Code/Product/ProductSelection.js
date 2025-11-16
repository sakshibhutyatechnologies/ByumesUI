import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import configuration from '../../configuration';
import PageWrapper from '../pageWrapper.js';
import { useAppContext } from '../../Context/AppContext';

function ProductSelection({
  products,
  setSelectedProduct,
  selectedOrder,
  selectedOrderName,
}) {
  const [message, setMessage] = useState('');
  const [productOptions, setProductOptions] = useState([]);
  const navigate = useNavigate();
  const { user } = useAppContext();
  const userId = user?.userName;
  const userRole = user?.role;
  const language = user?.language || 'en';

  useEffect(() => {
    getProductOptions();
  }, [products, userRole]);

  const checkInstructionCompletion = async (instructionId) => {
    try {
      const [stepRes, qaStepRes, totalStepsRes] = await Promise.all([
        fetch(`${configuration.API_BASE_URL}instructions/${instructionId}/current-step`),
        fetch(`${configuration.API_BASE_URL}instructions/${instructionId}/current-qa-step`),
        fetch(`${configuration.API_BASE_URL}instructions/${instructionId}/total-steps`)
      ]);

      if (!stepRes.ok || !qaStepRes.ok || !totalStepsRes.ok) throw new Error('Fetch error');

      const { current_step } = await stepRes.json();
      const { current_qa_step } = await qaStepRes.json();
      const { totalSteps } = await totalStepsRes.json();

      return userRole === 'qa'
        ? current_qa_step === totalSteps
        : current_step === totalSteps;
    } catch (err) {
      console.error('Error checking instruction completion:', err);
      return false;
    }
  };

  const getProductOptions = async () => {
    const options = await Promise.all(products.map(async product => {
      const complete = await checkInstructionCompletion(product.instruction_id);
      return {
        value: product._id,
        label: product.product_name,
        color: userRole === 'QA' ? (complete ? 'gray' : 'green') : (complete ? 'blue' : 'green')
      };
    }));
    setProductOptions(options);
  };

  const handleProductChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProd = products.find(p => p._id === selectedOption.value);
      if (selectedProd) {
        setSelectedProduct(selectedProd);
        navigate('/instructions');
      } else {
        setMessage('Product not found.');
      }
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}reports/downloadPDFForOrder/${selectedOrder}/${language}/${userId}/${userRole}`);
      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Order-${selectedOrder}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Download Error:', err);
    }
  };

  const handleBackToOrders = () => {
    navigate('/orderSelection'); // adjust as needed
  };

  return (
    <PageWrapper>
      {/* Container wrapping buttons and card */}
      <div className="container mt-4">
        {/* Row for back and download buttons at top of the card */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <button className="btn btn-outline-primary" onClick={handleBackToOrders}>
            ← Back to Orders
          </button>
          <button
            className="btn btn-primary"
            onClick={downloadPDF}
            disabled={!selectedOrder}
          >
            Download Batch Report
          </button>
        </div>

        {/* Centered card */}
        <div className="d-flex justify-content-center align-items-center">
          <div className="bg-white shadow rounded-4 p-4 w-100" style={{ maxWidth: '600px' }}>
            <label htmlFor="productDropdown" className="form-label fw-semibold">
              Select a product for order: <strong>{selectedOrderName}</strong>
            </label>
            <Select
              id="productDropdown"
              options={productOptions}
              onChange={handleProductChange}
              placeholder="-- Select Product --"
              isDisabled={!selectedOrder}
              filterOption={(option, input) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              styles={{
                option: (provided, state) => ({
                  ...provided,
                  color: state.data.color
                })
              }}
            />
            {message && <div className="alert alert-warning mt-3">{message}</div>}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default ProductSelection;