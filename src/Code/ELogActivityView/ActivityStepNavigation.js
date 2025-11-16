import React, { useState, useEffect } from 'react';
import { FaRedo } from 'react-icons/fa';
import { useELogActivities } from '../../Context/ELogActivitiesContext';;

const ActivityStepNavigation = () => {
  const {
    totalSteps,
    currentStepIndex,
    goToStep,
    goToCurrentStep,
  } = useELogActivities();

  const [stepNumber, setStepNumber] = useState(currentStepIndex);

  useEffect(() => {
    setStepNumber(currentStepIndex);
  }, [currentStepIndex]);

  const handleGoToStep = () => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      goToStep(stepNumber);
    }
  };

  return (
    <div className="d-flex flex-wrap flex-sm-nowrap justify-content-end align-items-center gap-2">
      <input
        type="number"
        min="1"
        max={totalSteps}
        value={stepNumber}
        onChange={(e) => setStepNumber(Number(e.target.value))}
        className="form-control text-center"
        style={{ width: '70px', maxWidth: '80px' }}
      />
      <button
        onClick={handleGoToStep}
        className="btn btn-primary min-w-100"
      >
        Go
      </button>
      <button
        onClick={goToCurrentStep}
        className="btn btn-outline-secondary d-flex justify-content-center align-items-center"
        style={{ width: '50px', height: '40px' }}
        title="Click to go to the current step"
      >
        <FaRedo size={20} color="black" />
      </button>
    </div>
  );
};

export default ActivityStepNavigation;