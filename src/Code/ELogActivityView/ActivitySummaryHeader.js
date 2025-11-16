import React from 'react';

const ActivitySummaryHeader = ({ orderName, activityName, equipmentName, isMobileOrTablet }) => {
  return (
    <div className="d-flex flex-column gap-1" style={{ padding: isMobileOrTablet ? '0 10px' : '0' }}>
      <div className="d-flex align-items-baseline">
        <div className={`me-1 text-nowrap ${isMobileOrTablet ? 'small' : ''}`}><strong>Order Name:</strong></div>
        <div className="text-truncate" style={{ maxWidth: '600px' }}>{orderName}</div>
      </div>
      <div className="d-flex align-items-baseline">
        <div className={`me-1 text-nowrap ${isMobileOrTablet ? 'small' : ''}`}><strong>Activity Name:</strong></div>
        <div className="text-truncate" style={{ maxWidth: '600px' }}>{activityName}</div>
      </div>
      <div className="d-flex align-items-baseline">
        <div className={`me-1 text-nowrap ${isMobileOrTablet ? 'small' : ''}`}><strong>Equipment Name:</strong></div>
        <div className="text-truncate" style={{ maxWidth: '600px' }}>{equipmentName}</div>
      </div>
    </div>
  );
};

export default ActivitySummaryHeader;