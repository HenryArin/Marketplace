import React, { useState, useEffect } from 'react';
import './Modal.css';

const UserListingsView = ({ onClose }) => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Please log in to view your listings');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/src/get_user_listings.php', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('authToken');
          throw new Error('Please log in to view your listings');
        }
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      setListings(data.listings);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (listingID) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Please log in to delete listings');
        return;
      }
      
      const response = await fetch(`http://localhost:8000/src/delete_listing.php?id=${listingID}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          throw new Error('Please log in to delete listings');
        }
        throw new Error('Failed to delete listing');
      }

      // Refresh listings after deletion
      fetchUserListings();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditListing = (listing) => {
    // TODO: Implement edit functionality
    console.log('Edit listing:', listing);
  };

  if (isLoading) {
    return (
      <div className="modal-body">
        <div className="loading">Loading your listings...</div>
      </div>
    );
  }

  return (
    <div className="modal-body">
      <h2>My Listings</h2>
      {error && <div className="error-message">{error}</div>}
      
      {listings.length === 0 ? (
        <div className="no-listings">You haven't created any listings yet.</div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.listingID} className="listing-card">
              <div className="listing-images">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={`http://localhost:8000/img/listings/${listing.images[0]}`} 
                    alt={listing.title}
                    className="listing-image"
                  />
                ) : (
                  <div className="no-image">No image</div>
                )}
              </div>
              
              <div className="listing-details">
                <h3>{listing.title}</h3>
                <p className="price">${listing.price}</p>
                <p className="description">{listing.description}</p>
                <p className={`status ${listing.sold ? 'sold' : ''}`}>
                  Status: {listing.sold ? 'Sold' : 'Available'}
                </p>
                <p className="date">
                  Created: {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="listing-actions">
                <button 
                  onClick={() => handleEditListing(listing)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteListing(listing.listingID)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserListingsView; 