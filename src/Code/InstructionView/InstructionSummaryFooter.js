import React from 'react';
import { useInstructions } from '../../Context/InstructionsContext';

const InstructionSummaryFooter = () => {
  const { currentStepData } = useInstructions();
  const operator = currentStepData?.operator_execution;
  const qa = currentStepData?.qa_execution;

  return (
    <div
      className="info-container d-flex justify-content-end align-items-center"
      style={{
        position: 'fixed',
        bottom: '90px',
        left: '0',
        width: '100%',
        fontSize: '0.85rem',
        padding: '6px 12px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        zIndex: 1000
      }}
    >
      {operator?.executed && (
        <div className="info-item d-flex flex-column text-end ms-3">
          <p className="mb-0"><strong>Executed by:</strong> {operator.executed_by}</p>
          <p className="mb-0"><strong>Executed at:</strong> {operator.executed_at}</p>
        </div>
      )}

      {qa?.qa_executed && (
        <div className="info-item d-flex flex-column text-end ms-4">
          <p className="mb-0"><strong>Quality Assurance by:</strong> {qa.qa_executed_by}</p>
          <p className="mb-0"><strong>Quality Assurance at:</strong> {qa.qa_executed_at}</p>
        </div>
      )}
    </div>
  );
};

export default InstructionSummaryFooter;