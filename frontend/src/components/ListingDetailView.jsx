import React, { useState, useEffect } from 'react';
import './ListingDetailView.css';

const ListingDetailView = ({ listing, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Debug output
  useEffect(() => {
    console.log('ListingDetailView rendering with listing:', listing);
  }, [listing]);
  
  if (!listing) {
    console.log('No listing provided to ListingDetailView');
    return null;
  }

  // Ensure images is an array
  let images = [];
  if (listing.images) {
    if (Array.isArray(listing.images)) {
      images = listing.images;
    } else if (typeof listing.images === 'string') {
      try {
        // Try to parse as JSON
        images = JSON.parse(listing.images);
        if (!Array.isArray(images)) {
          images = [listing.images];
        }
      } catch (e) {
        // If not valid JSON, treat as a single image
        images = [listing.images];
      }
    }
  }
  
  console.log('Processed images:', images);
  
  return (
    <div className="listing-detail">
      <div className="listing-detail-header">
        <h2>{listing.title || 'Untitled Listing'}</h2>
        <button className="close-button" onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>×</button>
      </div>
      
      <div className="listing-detail-content">
        <div className="listing-images">
          <div className="main-image">
            <img 
              src={images.length > 0 ? `http://localhost:8000/img/listings/${images[selectedImage]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjMjEyNTI5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
              alt={listing.title || 'Product Image'}
              onError={(e) => {
                console.error('Failed to load image:', e.target.src);
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjMjEyNTI5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="image-gallery">
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className={`gallery-image ${selectedImage === index ? 'selected' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={`http://localhost:8000/img/listings/${image}`}
                    alt={`${listing.title || 'Product'} - Image ${index + 1}`}
                    onError={(e) => {
                      console.error('Failed to load gallery image:', e.target.src);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjMjEyNTI5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="listing-info">
          <div className="price-section">
            <h3>${listing.price || '0.00'}</h3>
            <p className="condition">{listing.condition || 'Used'}</p>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{listing.description || 'No description provided.'}</p>
          </div>

          <div className="details-section">
            <h3>Details</h3>
            <ul>
              <li><strong>Category:</strong> {listing.category || 'General'}</li>
              <li><strong>Location:</strong> {listing.location || 'Not specified'}</li>
              <li><strong>Posted:</strong> {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'Recently'}</li>
            </ul>
          </div>

          <div className="seller-section">
            <h3>Seller Information</h3>
            <p>Contact: {listing.user_email || 'Contact seller through the platform'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailView; 