import React, { useState, useEffect } from 'react';
import './ListingDetailView.css';

const ListingDetailView = ({ listing, onClose, onOpenMessages }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [isLoadingSeller, setIsLoadingSeller] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showModal, setShowModal] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const currentUserId = localStorage.getItem('userID');
    setIsLoggedIn(loggedIn);
    setUserId(currentUserId);
  }, []);
  
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
  
  const fetchSellerInfo = async (listingId) => {
    setIsLoadingSeller(true);
    try {
      const response = await fetch(`http://localhost:8000/get_listing_seller.php?listing_id=${listingId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log('Seller info retrieved:', data);
      setSellerInfo(data.seller);
      return data.seller;
    } catch (err) {
      console.error('Error getting seller info:', err);
      return null;
    } finally {
      setIsLoadingSeller(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!userId) {
      alert("Please login to send a message.");
      return;
    }

    if (userId === listing.listerID) {
      alert("You cannot send a message to yourself.");
      return;
    }

    setIsSending(true);
    
    try {
      // First, ensure we have seller information
      let seller;
      if (sellerInfo) {
        seller = sellerInfo;
      } else {
        seller = await fetchSellerInfo(listing.listingID);
        if (!seller) {
          throw new Error('Could not retrieve seller information');
        }
      }

      console.log('Sending message to seller:', seller);
      
      // First, test CORS connectivity
      try {
        const testResponse = await fetch('http://localhost:8000/test.php');
        const testData = await testResponse.json();
        console.log('CORS test successful:', testData);
      } catch (corsError) {
        console.error('CORS test failed:', corsError);
      }
      
      // Now attempt to start the conversation
      const response = await fetch('http://localhost:8000/start_conversation.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: parseInt(userId),
          receiver_id: parseInt(seller.id),
          listing_id: parseInt(listing.listingID),
          initial_message: `Hi, I'm interested in your listing "${listing.title}"`
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Conversation started:', data);
      
      // Redirect to MessagesView if we have the function
      if (onOpenMessages) {
        onOpenMessages(data.conversation_id);
      } else {
        alert("Message sent successfully! Check your messages to view the conversation.");
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert(`Error sending message: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };
  
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
            <p>Contact the seller through our messaging system</p>
            
            {isLoggedIn && (
              <button 
                className="send-message-btn"
                onClick={handleSendMessage}
                disabled={isSending}
              >
                {isSending ? 'Sending...' : (
                  <><i className="message-icon">✉️</i> Message Seller</>
                )}
              </button>
            )}
            
            {!isLoggedIn && (
              <p className="login-prompt">Please log in to contact the seller</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailView; 