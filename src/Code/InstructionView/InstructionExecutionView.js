import React, { useState, useEffect } from 'react';
import InstructionSummaryHeader from './InstructionSummaryHeader';
import InstructionStepText from './InstructionStepText';
import InstructionSummaryFooter from './InstructionSummaryFooter';
import InstructionStepFooter from './InstructionFooter';
import InstructionStepNavigation from './InstructionStepNavigation';
import HeaderOptionsMenu from './HeaderOptionsMenu';
import { useInstructions } from '../../Context/InstructionsContext';
import LoadingSpinner from '../LoadingSpinner';

const InstructionExecutionView = () => {
  const {
    currentStepData,
    isLoading,
    orderName,
    productName,
    handleDownloadBatchReport,
    instruction,
    language,
    totalSteps,
    currentStepIndex,
    goToStep,
    goToCurrentStep,
  } = useInstructions();

  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [stepNumber, setStepNumber] = useState(currentStepIndex);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setStepNumber(currentStepIndex);
  }, [currentStepIndex]);


  if (isLoading || !currentStepData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid fixed-top p-0 m-0 d-flex flex-column vh-100">
      {/* Top Command Bar */}
      <div
        className="command-view fixed-top m-0 p-0 w-100"
        style={{
          height: isMobileOrTablet ? 'auto' : '85px',
          top: '60px',
          boxShadow: isMobileOrTablet ? 0 : '0px 4px 6px rgba(0, 0, 0, 0.1)',
          padding: isMobileOrTablet ? '10px 15px' : '10px 15px',
        }}
      >
        {isMobileOrTablet ? (
          <div className="d-flex flex-column w-100">
            <div className="d-flex justify-content-between align-items-start w-100">
              <div className="flex-grow-1"> 
                <InstructionSummaryHeader
                  orderName={orderName}
                  productName={productName}
                  isMobileOrTablet={isMobileOrTablet}
                />
              </div>

              {/* Header Options Menu (Right) */}
              <div style={{ marginRight: '10px'}}>
                <HeaderOptionsMenu
                  onDownloadBatchReport={handleDownloadBatchReport}
                  totalSteps={totalSteps}
                  currentStepIndex={currentStepIndex}
                  onGoToStep={goToStep}
                  onGoToCurrentStep={goToCurrentStep}
                  stepNumber={stepNumber}
                  setStepNumber={setStepNumber}
                />
              </div>
            </div>

            <div className="text-center mt-1">
              <h3 className="fw-bold mb-0">
                {instruction?.instruction_name?.[language]}
              </h3>
            </div>
          </div>
        ) : (
          // Desktop Header Layout: Side-by-side (remains unchanged)
          <div className="command-top d-flex justify-content-between align-items-center w-100 px-4 h-100">
            <div className="top-info-wrapper flex-grow-1 me-sm-4 mb-3 mb-sm-0">
              <InstructionSummaryHeader
                orderName={orderName}
                productName={productName}
                isMobileOrTablet={isMobileOrTablet}
              />
            </div>

            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <h3 className="fw-bold mb-2 text-center">
                { instruction?.instruction_name?.[language]}
              </h3>
            </div>

            <div className="command-actions d-flex align-items-center gap-2 h-100">
              <button
                className="btn btn-success"
                style={{ height: '40px', width: '200px' }}
                onClick={handleDownloadBatchReport}
              >
                Download Batch Report
              </button>
              <InstructionStepNavigation />
            </div>
          </div>
        )}
      </div>

      <div className="instruction-text-container justify-content-center p-0">
        <InstructionStepText />
      </div>

      {/* Info Bar */}
      <InstructionSummaryFooter />

      {/* Footer */}
      <div className="footer-bar">
        <div className="footer-container d-flex flex-column p-3 mt-auto bg-light border-top">
          <InstructionStepFooter />
        </div>
      </div>
    </div>
  );
};

export default InstructionExecutionView;