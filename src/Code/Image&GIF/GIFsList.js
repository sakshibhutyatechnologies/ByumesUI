import React, { useState, useEffect } from 'react';
import '../../Style/GIFsList.css';
import configuration from '../../configuration';
import { FiLink } from 'react-icons/fi';

const GIFsList = () => {
  const [gifs, setGifs] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [newGif, setNewGif] = useState({ name: '', description: '', gif_file: null });
  const [errorMessage, setErrorMessage] = useState('');

  const fetchGIFs = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}gifs`);
      const data = await response.json();
      setGifs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch GIFs', error);
      setGifs([]);
    }
  };

  useEffect(() => {
    fetchGIFs();
  }, []);

  const handleGifChange = (e) => {
    setNewGif({ ...newGif, gif_file: e.target.files[0] });
  };

  const handleDescriptionChange = (e) => {
    setNewGif({ ...newGif, description: e.target.value });
  };

  const handleNameChange = (e) => {
    setNewGif({ ...newGif, name: e.target.value });
  };

  const resetForm = () => {
    setNewGif({ name: '', description: '', gif_file: null });
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    if (!newGif.gif_file || !newGif.description.trim() || !newGif.name.trim()) {
      setErrorMessage('Please provide a name, description, and GIF file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newGif.name);
      formData.append('description', newGif.description);
      formData.append('gif', newGif.gif_file);

      const response = await fetch(`${configuration.API_BASE_URL}gifs`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save GIF');
      }

      await response.json();
      resetForm();
      setPopupOpen(false);
      fetchGIFs();
    } catch (error) {
      console.error('Error in saving GIF:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const isSubmitDisabled = !newGif.description.trim() || !newGif.gif_file || !newGif.name.trim();

  return (
    <div className="container main-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-0">GIFs</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setPopupOpen(true); }}>
          Create New GIF
        </button>
      </div>

      {/* Modal */}
      {isPopupOpen && (
        <>
          <div className="modal-backdrop-custom"></div>

          <div className="custom-modal">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Create New GIF</h4>
              <button className="btn-close" onClick={() => { resetForm(); setPopupOpen(false); }}></button>
            </div>

            <div className="mb-3">
              <label className="form-label">GIF Name</label>
              <input
                type="text"
                className="form-control"
                value={newGif.name}
                onChange={handleNameChange}
                placeholder="Enter GIF name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">GIF Description</label>
              <input
                type="text"
                className="form-control"
                value={newGif.description}
                onChange={handleDescriptionChange}
                placeholder="Enter GIF description"
                required
              />
            </div>

            {errorMessage && <div className="text-danger mb-2">{errorMessage}</div>}

            <div className="mb-3">
              <label className="form-label">Upload GIF</label>
              <input
                type="file"
                accept="image/gif"
                className="form-control"
                onChange={handleGifChange}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                Save GIF
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  resetForm();
                  setPopupOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* GIF Cards */}
      <div className="row">
        {gifs.map((gif) => (
          <div key={gif._id} className="col-md-6 col-lg-4 mb-3">
            <div className="card shadow-sm border h-100">
              <img
                src={`${configuration.API_BASE_URL}gifs/${gif._id}`}
                alt={gif.name}
                className="card-img-bottom"
                style={{ objectFit: 'cover', height: '250px' }}
              />
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="mb-0">{gif.name}</h6>
                  <button
                    className="btn btn-link p-0 m-0"
                    onClick={() => {
                      const gifUrl = `${configuration.API_BASE_URL}gifs/${gif._id}`;
                      navigator.clipboard.writeText(gifUrl);
                      alert('GIF link copied!');
                    }}
                    title="Copy GIF link"
                  >
                    <FiLink size={20} />
                  </button>
                </div>
                <p className="card-text mt-2">{gif.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GIFsList;