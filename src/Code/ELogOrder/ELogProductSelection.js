import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import configuration from '../../configuration';
import PageWrapper from '../pageWrapper.js';
import { useAppContext } from '../../Context/AppContext';
import { useELogActivities } from '../../Context/ELogActivitiesContext';

function ELogProductSelection({
  eLogProducts,
  setSelectedElogProduct,
  selectedElogOrder,
  selectedELogOrderName
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
  }, [eLogProducts, userRole]);

  const checkInstructionCompletion = async (activityId) => {
    try {
      const [currentStepRes, currentQaStepRes, totalStepsRes] = await Promise.all([
        fetch(`${configuration.API_BASE_URL}equipmentActivities/${activityId}/current-step`),
        fetch(`${configuration.API_BASE_URL}equipmentActivities/${activityId}/current-qa-step`),
        fetch(`${configuration.API_BASE_URL}equipmentActivities/${activityId}/total-steps`)
      ]);

      if (!currentStepRes.ok || !currentQaStepRes.ok || !totalStepsRes.ok) {
        throw new Error('Error fetching instruction data');
      }

      const { current_step } = await currentStepRes.json();
      const { current_qa_step } = await currentQaStepRes.json();
      const { totalSteps } = await totalStepsRes.json();

      return userRole === 'qa' ? current_qa_step === totalSteps : current_step === totalSteps;
    } catch (error) {
      console.error('Error checking instruction completion:', error);
      return false;
    }
  };

  const getProductOptions = async () => {
    if (!Array.isArray(eLogProducts)) return;

    const options = await Promise.all(
      eLogProducts.map(async (product) => {
        const isComplete = await checkInstructionCompletion(product.equipment_activities_id);
        let color = userRole === 'QA' ? (isComplete ? 'gray' : 'green') : (isComplete ? 'blue' : 'green');

        return {
          value: product._id,
          label: product.eLog_product_name,
          color
        };
      })
    );

    setProductOptions(options);
  };

  const handleElogProductChange = async (selectedOption) => {
    if (selectedOption) {
      const selectedProd = eLogProducts.find(p => p._id === selectedOption.value);
      if (selectedProd) {
        setSelectedElogProduct(selectedProd);
        navigate('/eLogInstructions');
      } else {
        setMessage('Product not found.');
      }
    } else {
      setMessage('No product selected.');
    }
  };

  const handleDownloadBatchReport = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}eLogReports/downloadPDFForOrder/${selectedElogOrder}/${language}/${userId}/${userRole}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/pdf' }
      });

      if (!response.ok) throw new Error(`Error fetching PDF: ${response.statusText}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ELogOrder-${selectedElogOrder}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleBackToOrders = () => {
    navigate('/eLogOrderSelection');
  };

  return (
    <PageWrapper>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <button className="btn btn-outline-primary" onClick={handleBackToOrders}>
            ← Back to eLog Orders
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDownloadBatchReport}
            disabled={!selectedElogOrder}
          >
            Download Batch Report
          </button>
        </div>

        <div className="d-flex justify-content-center align-items-center">
          <div className="bg-white shadow rounded-4 p-4 w-100" style={{ maxWidth: '600px' }}>
            <label htmlFor="elogProductDropdown" className="form-label fw-semibold">
              Select an activity for eLog Order: <strong>{selectedELogOrderName}</strong>
            </label>
            <Select
              id="elogProductDropdown"
              options={productOptions}
              onChange={handleElogProductChange}
              placeholder="-- Select eLog Activity --"
              isDisabled={!selectedElogOrder}
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

export default ELogProductSelection;