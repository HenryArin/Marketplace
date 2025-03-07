import React from 'react';
import './Modal.css';

const MyListingsView = () => {
  return (
    <div className="modal-body my-listings-view">
      <div className="listing-detail">
        <div className="listing-images">
          <div className="main-image">Product Image</div>
          <div className="image-thumbnails">
            {[1, 2, 3].map((img) => (
              <div key={img} className="thumbnail">
                Image {img}
              </div>
            ))}
          </div>
        </div>
        <div className="listing-actions">
          <button className="action-button edit-button">Edit</button>
          <button className="action-button error-button">Report Error</button>
          <button className="action-button delete-button">Delete</button>
        </div>
      </div>
      <div className="listings-sidebar">
        <div className="my-listings-grid">
          {[1, 2, 3, 4].map((listing) => (
            <div key={listing} className="my-listing-item">
              <div className="listing-image">Item {listing}</div>
              <div className="listing-details">
                <div className="listing-name">Item Name {listing}</div>
                <div className="listing-price">${listing}00</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyListingsView; 