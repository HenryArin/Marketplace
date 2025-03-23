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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: files }));
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      
      // Append each image file
      formData.images.forEach((image, index) => {
        formDataToSend.append('images[]', image);
      });

      console.log('Submitting form data...');
      
      // Use a simpler fetch approach
      const response = await fetch('http://localhost:8000/src/create_listing.php', {
        method: 'POST',
        body: formDataToSend,
      });

      // Add debug output
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      // Get the response text first
      const responseText = await response.text();
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Server returned invalid JSON response');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      // Clear form and close modal
      setFormData({ title: '', price: '', description: '', images: [] });
      setPreviewImages([]);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListingView; 