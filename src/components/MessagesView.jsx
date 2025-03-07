import React from 'react';
import './Modal.css';

const MessagesView = () => {
  return (
    <div className="modal-body messages-view">
      <div className="messages-container">
        <div className="message-list">
          {/* Sample messages */}
          {[1, 2, 3].map((message) => (
            <div key={message} className="message-item">
              <div className="message-avatar">User {message}</div>
              <div className="message-content">
                <div className="message-sender">John Doe {message}</div>
                <div className="message-preview">Interested in your item...</div>
              </div>
              <div className="message-time">2h ago</div>
            </div>
          ))}
        </div>
        <div className="message-detail">
          <div className="message-header">Selected Conversation</div>
          <div className="message-chat">
            Select a conversation to view messages
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesView; 