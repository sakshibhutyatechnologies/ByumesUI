// HeaderOptionsMenu.js
import React from 'react';
import { Dropdown, Form, Button } from 'react-bootstrap';
import { FaEllipsisV } from 'react-icons/fa';

const HeaderOptionsMenu = ({
  onDownloadBatchReport,
  totalSteps,
  currentStepIndex,
  onGoToStep,
  onGoToCurrentStep,
  stepNumber,
  setStepNumber
}) => {
  const handleGoClick = () => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      onGoToStep(stepNumber);
    }
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="header-dropdown-basic">
        <FaEllipsisV />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={onDownloadBatchReport}>Download Batch Report</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item as="div" onClick={(e) => e.stopPropagation()}> {/* Stop propagation here */}
          <Form className="d-flex align-items-center p-2">
            <Form.Control
              type="number"
              min="1"
              max={totalSteps}
              value={stepNumber}
              onChange={(e) => setStepNumber(Number(e.target.value))}
              className="w-auto me-2"
              style={{ width: '70px' }}
              // Add onClick to input to stop propagation too, just in case
              onClick={(e) => e.stopPropagation()}
            />
            <Button variant="primary" onClick={handleGoClick} size="sm">Go</Button>
          </Form>
        </Dropdown.Item>
        <Dropdown.Item onClick={onGoToCurrentStep}>Go to Current Step</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default HeaderOptionsMenu;