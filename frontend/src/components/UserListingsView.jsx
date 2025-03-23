import React, { useState, useEffect } from 'react';
import './Modal.css';

const UserListingsView = ({ onClose }) => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user listings
  const fetchUserListings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user listings...');
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to view your listings');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/src/get_user_listings.php', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      console.log('Listings received:', data);
      setListings(data.listings || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch listings when component mounts
  useEffect(() => {
    fetchUserListings();
    
    // Uncomment this if you want to periodically refresh listings
    // const intervalId = setInterval(fetchUserListings, 10000); // Refresh every 10 seconds
    // return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  const handleDeleteListing = async (listingID) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to delete a listing');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/src/delete_listing.php?id=${listingID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete listing');
      }

      // Remove the deleted listing from state
      setListings(listings.filter(listing => listing.listingID !== listingID));
      
      console.log(`Successfully deleted listing ${listingID}`);
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError(err.message || 'Failed to delete listing');
    } finally {
      setIsLoading(false);
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
    <div className="user-listings">
      <h2>My Listings</h2>
      {error && <div className="error">{error}</div>}
      
      {listings.length === 0 ? (
        <div className="no-listings">You haven't created any listings yet.</div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.listingID} className="listing-card">
              <div className="listing-image">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={`http://localhost:8000/img/listings/${listing.images[0]}`} 
                    alt={listing.title}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjMjEyNTI5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                ) : (
                  <img 
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjMjEyNTI5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=" 
                    alt="No image available" 
                  />
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