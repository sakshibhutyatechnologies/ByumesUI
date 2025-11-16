import React, { useEffect, useState, useMemo } from 'react';
import '../../Style/ProductsList.css';
import configuration from '../../configuration';
import DocToJsonConverter from '../DocToJsonConverter/DocToJsonConverter';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('product_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDocPopup, setShowDocPopup] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${configuration.API_BASE_URL}masterInstructions/productnames`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    }
    fetchProducts();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = products.filter(p =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === 'asc'
        ? String(aVal || '').localeCompare(String(bVal || ''))
        : String(bVal || '').localeCompare(String(aVal || ''));
    });

    return list;
  }, [products, searchTerm, sortField, sortOrder]);

  return (
    <div className="container main-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-2 mb-md-0">Products</h2>
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
              setSortOrder('asc');
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
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            style={{ display: 'flex', alignItems: 'center', padding: '0.375rem 0.75rem' }}
          >
            {sortOrder === 'asc' ? <AiOutlineArrowUp size={20} /> : <AiOutlineArrowDown size={20} />}
          </button>
        </div>
      </div>

      <div className="row">
        {filteredAndSorted.map(product => (
          <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-center mb-0">{product.product_name}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDocPopup && <DocToJsonConverter onClose={() => setShowDocPopup(false)} />}
    </div>
  );
};

export default ProductsList;