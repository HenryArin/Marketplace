import React, { useState } from 'react';
import './Modal.css';

const CreateListingView = () => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    location: '',
    images: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="modal-body create-listing-view">
      <form onSubmit={handleSubmit} className="create-listing-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Enter item title"
          />
        </div>
        
        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="Enter price"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Enter item description"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Enter location"
          />
        </div>

        <div className="form-group">
          <label>Images</label>
          <div className="image-upload-container">
            <button type="button" className="upload-button">
              Upload Images
            </button>
            <div className="upload-preview">
              No images uploaded yet
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Create Listing
        </button>
      </form>
    </div>
  );
};

export default CreateListingView; 