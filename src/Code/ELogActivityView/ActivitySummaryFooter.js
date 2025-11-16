import React from 'react';
import { useELogActivities } from '../../Context/ELogActivitiesContext';;

const ActivitySummaryFooter = () => {
  const { currentStepData } = useELogActivities();

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
        <div className='info-item d-flex flex-column text-end ms-3'>
          <p><b>Executed by:</b> {operator.executed_by}</p>
          <p><b>Executed at:</b> {operator.executed_at}</p>
        </div>
      )}
      {qa?.qa_executed && (
        <div className='info-item d-flex flex-column text-end ms-4'>
          <p><b>Quality Assurance by:</b> {qa.qa_executed_by}</p>
          <p><b>Quality Assurance at:</b> {qa.qa_executed_at}</p>
        </div>
      )}
    </div>
  );
};

export default ActivitySummaryFooter;