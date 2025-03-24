import React, { useState } from 'react';
import './Modal.css';
import MessagesView from './MessagesView';
import MyListingsView from './MyListingsView';
import CreateListingView from './CreateListingView';
import UserListingsView from './UserListingsView';

const Modal = ({ isOpen, onClose, children, title, loggedIn, onLogout, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState(mode);
  const [activeConversationId, setActiveConversationId] = useState(null);
  
  if (!isOpen) return null;

  const handleLogin = () => {
    // Close the modal to show the login form
    onClose();
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Add search functionality here
    console.log('Searching for:', e.target.value);
  };

  const handleOpenMessages = (conversationId = null) => {
    setCurrentView('messages');
    setActiveConversationId(conversationId);
  };

  const renderView = () => {
    switch (currentView) {
      case 'messages':
        return <MessagesView initialConversationId={activeConversationId} />;
      case 'my-listings':
        return <UserListingsView key={Date.now()} onClose={onClose} />;
      case 'create':
        return <CreateListingView onClose={onClose} />;
      default:
        // Pass the handleOpenMessages function to children
        const childrenWithProps = React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onOpenMessages: handleOpenMessages });
          }
          return child;
        });
        
        return (
          <div className="modal-body">
            {childrenWithProps}
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-header">
          <div className="header-left">
            {loggedIn ? (
              <button className="login-button" onClick={onLogout}>
                Log Out
              </button>
            ) : (
              <button className="login-button" onClick={handleLogin}>
                Log In
              </button>
            )}
          </div>
          <h2 
            className="modal-title" 
            onClick={() => setCurrentView('main')}
            style={{ cursor: 'pointer' }}
          >
            {currentView === 'main' ? title : 'Back to Listings'}
          </h2>
        </div>
        
        {currentView === 'main' && loggedIn && (
          <div className="navigation-buttons">
            <button onClick={() => setCurrentView('my-listings')}>My Listings</button>
            <button onClick={() => setCurrentView('create')}>Create Listings</button>
            <button onClick={() => handleOpenMessages()}>Messages</button>
          </div>
        )}

        {renderView()}
      </div>
    </div>
  );
};

export default Modal; 