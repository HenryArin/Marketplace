import React, { useState, useEffect } from 'react';
import './Modal.css';
import MessagesView from './MessagesView';
import MyListingsView from './MyListingsView';
import CreateListingView from './CreateListingView';

const Modal = ({ isOpen, onClose, children, title, loggedIn, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('main'); // main, messages, myListings, createListing
  
  // Initialize dark mode from localStorage or default to false
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Save dark mode preference whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  
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

  // Function to explicitly set to default/light mode
  const setDefaultMode = () => {
    setIsDarkMode(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const renderView = () => {
    switch (currentView) {
      case 'messages':
        return <MessagesView />;
      case 'myListings':
        return <MyListingsView />;
      case 'createListing':
        return <CreateListingView />;
      default:
        return (
          <div className="modal-body">
            {children}
          </div>
        );
    }
  };

  return (
    <div className={`modal-overlay ${isDarkMode ? 'dark-mode' : ''}`}>
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
            <button 
              className="theme-toggle" 
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
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
            <button onClick={() => setCurrentView('myListings')}>My Listings</button>
            <button onClick={() => setCurrentView('createListing')}>Create Listings</button>
            <button onClick={() => setCurrentView('messages')}>Messages</button>
          </div>
        )}

        {renderView()}
      </div>
    </div>
  );
};

export default Modal; 