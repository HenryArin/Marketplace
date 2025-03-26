import React, { useState } from 'react';
import './Modal.css';

const CreateListingView = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'other',
    images: []
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding new files would exceed the limit
    if (formData.images.length + files.length > 3) {
      setError('Maximum 3 images allowed');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Add new files to existing ones
    const newFiles = [...formData.images, ...files].slice(0, 3);
    setFormData(prev => ({ ...prev, images: newFiles }));
    
    // Create preview URLs for all images
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    // Clean up old preview URLs to prevent memory leaks
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setPreviewImages(newPreviews);
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
      formDataToSend.append('category', formData.category);
      
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
        category: 'other',
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
          <label>Category</label>
          <select 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="category-select"
            required
          >
            <option value="books">Books</option>
            <option value="clothing">Clothing</option>
            <option value="collectibles">Collectibles</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="gaming">Gaming</option>
            <option value="home">Home & Garden</option>
            <option value="other">Other</option>
            <option value="sports">Sports</option>
            <option value="technology">Technology</option>
            <option value="toys">Toys</option>
            <option value="vehicles">Vehicles</option>
          </select>
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
          <label>Images (Max 3)</label>
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
            <label htmlFor="image-upload" className={`upload-button ${formData.images.length >= 3 ? 'disabled' : ''}`}>
              Upload Images ({formData.images.length}/3)
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
                          
                          // Clean up the removed preview URL
                          URL.revokeObjectURL(previewImages[index]);
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
                  {/* Add empty slots for remaining images */}
                  {[...Array(3 - previewImages.length)].map((_, index) => (
                    <div key={`empty-${index}`} className="preview-item empty">
                      <div className="empty-slot">+</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="preview-grid">
                  {[...Array(3)].map((_, index) => (
                    <div key={`empty-${index}`} className="preview-item empty">
                      <div className="empty-slot">+</div>
                    </div>
                  ))}
                </div>
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