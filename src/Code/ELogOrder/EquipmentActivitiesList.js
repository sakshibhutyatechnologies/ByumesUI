import React, { useState, useEffect , useMemo } from 'react';
import '../../Style/EquipmentActivities.css';
import configuration from '../../configuration';
import DocToJsonConverterForElog from '../DocToJsonConverterForElog/DocToJsonConverterForElog';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

const EquipmentActivitiesList = () => {
  const [equipmentActivities, setEquipmentActivities] = useState([]);
  const [showDocPopup, setShowDocPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('activity_name');
  const [sortActivities, setSortActivities] = useState('asc');

  const fetchEquipmentActivities = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}masterEquipmentActivities/productnames`);
      const data = await response.json();
      setEquipmentActivities(data);
    } catch (error) {
      console.error('Failed to fetch equipment activities', error);
      setEquipmentActivities([]);
    }
  };

  useEffect(() => {
    fetchEquipmentActivities();
  }, []);

  const filteredAndSorted = useMemo(() => {
      let list = equipmentActivities.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
      list.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
  
        if (sortField === 'createdAt' || sortField === 'updatedAt') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
          return sortActivities === 'asc' ? aVal - bVal : bVal - aVal;
        }
  
        return sortActivities === 'asc'
          ? String(aVal || '').localeCompare(String(bVal || ''))
          : String(bVal || '').localeCompare(String(aVal || ''));
      });
  
      return list;
    }, [equipmentActivities, searchTerm, sortField, sortActivities]);

  return (
    <div className="container main-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-0">Equipment Activities</h2>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={() => setShowDocPopup(true)}>
            Convert to eBR
          </button>
          <input
               type="text"
               className="form-control"
               placeholder="Search product..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               style={{ width: '200px' }}
          />
          <select
               className="form-select"
               value={sortField}
               onChange={e => {
                 setSortField(e.target.value);
                 setSortActivities('asc');
               }}
               style={{ width: '150px' }}
          >
               <option value="product_name">Product Name</option>
               <option value="created_by">Created By</option>
               <option value="createdAt">Created At</option>
               <option value="updatedAt">Updated At</option>
             </select>
             <button
               className="btn btn-outline-secondary"
               onClick={() => setSortActivities(prev => (prev === 'asc' ? 'desc' : 'asc'))}
               style={{ display: 'flex', alignItems: 'center', padding: '0.375rem 0.75rem' }}
             >
               {sortActivities === 'asc' ? <AiOutlineArrowUp size={20} /> : <AiOutlineArrowDown size={20} />}
             </button>
           </div>     
      </div>

      {/* Activities List */}
      <div className="row">
        {filteredAndSorted.map((activity) => (
          <div key={activity._id} className="col-md-6 col-lg-4 mb-3">
            <div className="card shadow-sm border h-100">
              <div className="card-body">
                <h5 className="card-title">{activity.product_name}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showDocPopup && <DocToJsonConverterForElog onClose={() => setShowDocPopup(false)} />}
    </div>
  );
};

export default EquipmentActivitiesList;