import React from 'react';

const InstructionSummaryHeader = ({ orderName, productName, isMobileOrTablet }) => {
  return (
    <div className="d-flex flex-column" style={{ padding: isMobileOrTablet ? '0 10px' : '0' }}>
      <div className="d-flex align-items-baseline">
        <div className={`me-1 text-nowrap ${isMobileOrTablet ? 'small' : ''}`}><strong>Order Name:</strong></div>
        <div className={`text-truncate ${isMobileOrTablet ? 'small' : ''}`}>{orderName}</div>
      </div>
      <div className="d-flex align-items-baseline">
        <div className={`me-1 text-nowrap ${isMobileOrTablet ? 'small' : ''}`}><strong>Product Name:</strong></div>
        <div className={`text-truncate ${isMobileOrTablet ? 'small' : ''}`}>{productName}</div>
      </div>
    </div>
  );
};

export default InstructionSummaryHeader;