import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import InstructionCommentSection from './InstructionCommentSection';
import { useInstructions } from '../../Context/InstructionsContext';

const InstructionFooter = () => {
  const {
    currentStepIndex,
    totalSteps,
    userRole,
    currentStepData,
    goToStep,
    handleSignAndComplete,
    handleReviewAndComplete,
    isCurrentStep,
  } = useInstructions();

  const [isCompleted, setIsCompleted] = useState(false);

  const handleBack = async () => {
    if (currentStepIndex > 0) {
      await goToStep(currentStepIndex - 1);
    }
  };

  const operatorExecuted = currentStepData?.operator_execution?.executed;
  const qaExecuted = currentStepData?.qa_execution?.qa_executed;

  return (
    <footer
      className="bg-dark text-white border-top"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '90px',
        zIndex: 1000,
        padding: '0 15px',
      }}
    >
      <div className="container-fluid h-100 d-flex justify-content-between align-items-center">
          <div style={{ minWidth: 'auto', flexShrink: 0 }}>
          <InstructionCommentSection />
        </div>

        <div className="d-flex justify-content-end align-items-center gap-3 p-3"> 
          <button
            className="btn btn-outline-light"
            onClick={handleBack}
            disabled={currentStepIndex <= 1}
          >
            <FaArrowLeft />
          </button>

          {userRole !== 'QA' && (
            <button
              className="btn btn-success"
              onClick={handleSignAndComplete}
              disabled={operatorExecuted || !isCurrentStep || isCompleted}
            >
              {currentStepIndex === totalSteps ? 'Sign and Complete' : 'Sign and Next'}
            </button>
          )}

          {userRole === 'QA' && (
            <button
              className="btn btn-primary"
              onClick={handleReviewAndComplete}
              disabled={!isCurrentStep || !operatorExecuted || qaExecuted || isCompleted}
            >
              {currentStepIndex === totalSteps ? 'Review and Complete' : 'Review and Sign'}
            </button>
          )}

          <button
            className="btn btn-outline-light"
            onClick={async () => {
              if (currentStepIndex < totalSteps) {
                await goToStep(currentStepIndex + 1);
              }
            }}
            disabled={currentStepIndex >= totalSteps}
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default InstructionFooter;