import React, { useState, useEffect } from 'react';
import '../../Style/ImagesList.css';
import configuration from '../../configuration';
import { FiLink } from 'react-icons/fi';

const ImagesList = () => {
  const [images, setImages] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [newImage, setNewImage] = useState({ name: '', description: '', image_file: null });
  const [errorMessage, setErrorMessage] = useState('');

  const fetchImages = async () => {
    try {
      const response = await fetch(`${configuration.API_BASE_URL}images`);
      const data = await response.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch images', error);
      setImages([]);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage({ ...newImage, image_file: file });
  };

  const handleDescriptionChange = (e) => {
    setNewImage({ ...newImage, description: e.target.value });
  };

  const handleNameChange = (e) => {
    setNewImage({ ...newImage, name: e.target.value });
  };

  const resetForm = () => {
    setNewImage({ name: '', description: '', image_file: null });
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    if (!newImage.image_file || !newImage.description.trim() || !newImage.name.trim()) {
      setErrorMessage('Please provide an image, description, and image name.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('description', newImage.description);
      formData.append('name', newImage.name);
      formData.append('image', newImage.image_file);

      const response = await fetch(`${configuration.API_BASE_URL}images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save image');
      }

      await response.json();
      resetForm();
      setPopupOpen(false);
      fetchImages();
    } catch (error) {
      console.error('Error in saving image:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  const isSubmitDisabled = !newImage.description.trim() || !newImage.image_file || !newImage.name.trim();

  return (
    <div className="container main-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-0">Images</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setPopupOpen(true);
          }}
        >
          Create New Image
        </button>
      </div>

      {/* Modal */}
      {isPopupOpen && (
        <>
          <div className="modal-backdrop-custom"></div>

          <div className="custom-modal">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Create New Image</h4>
              <button className="btn-close" onClick={() => { resetForm(); setPopupOpen(false); }}></button>
            </div>

            <div className="mb-3">
              <label className="form-label">Image Name</label>
              <input
                type="text"
                className="form-control"
                value={newImage.name}
                onChange={handleNameChange}
                placeholder="Enter image name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Image Description</label>
              <input
                type="text"
                className="form-control"
                value={newImage.description}
                onChange={handleDescriptionChange}
                placeholder="Enter image description"
              />
            </div>

            {errorMessage && <div className="text-danger mb-2">{errorMessage}</div>}

            <div className="mb-3">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleImageChange}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                Save Image
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

      <div className="row">
        {images.map((image) => (
          <div key={image._id} className="col-md-6 col-lg-4 mb-3">
            <div className="card shadow-sm border h-100">
              <img
                src={`${configuration.API_BASE_URL}images/${image._id}`}
                alt={image.description}
                className="card-img-top"
                style={{ objectFit: 'cover', height: '250px' }}
              />
              <div className="card-body">
                {/* First line: image name left, link icon right */}
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="mb-0">{image.name}</h6>
                  <button
                    className="btn btn-link p-0 m-0"
                    onClick={() => {
                      const imageUrl = `${configuration.API_BASE_URL}images/${image._id}`;
                      navigator.clipboard.writeText(imageUrl);
                      alert('Image link copied!');
                    }}
                    title="Copy image link"
                  >
                    <FiLink size={20} />
                  </button>
                </div>
                {/* Second line: description */}
                <p className="card-text mt-2">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagesList;