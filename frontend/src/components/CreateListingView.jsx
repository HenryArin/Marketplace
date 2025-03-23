import React, { useState } from 'react';
import './Modal.css';

const CreateListingView = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    images: []
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: files }));
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to create a listing');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      
      // Append each image to form data
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });

      const response = await fetch('http://localhost:8000/src/create_listing.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      setSuccess('Listing created successfully!');
      // Reset form
      setFormData({
        title: '',
        price: '',
        description: '',
        images: []
      });
      setPreviewImages([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-body create-listing-view">
      <form onSubmit={handleSubmit} className="create-listing-form">
        <div className="form-group">
          <label>Title</label>
          <textarea
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Enter item title"
            rows="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <textarea
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="Enter price"
            rows="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Enter item description"
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Images</label>
          <div className="image-upload-container">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="file-input"
              id="image-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload" className="upload-button">
              Upload Images
            </label>
            <div className="upload-preview">
              {previewImages.length > 0 ? (
                <div className="preview-grid">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = [...formData.images];
                          newFiles.splice(index, 1);
                          setFormData(prev => ({ ...prev, images: newFiles }));
                          const newPreviews = [...previewImages];
                          newPreviews.splice(index, 1);
                          setPreviewImages(newPreviews);
                        }}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                'No images uploaded yet'
              )}
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting || loading}
        >
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListingView; 