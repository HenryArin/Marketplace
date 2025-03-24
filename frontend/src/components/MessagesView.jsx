import React, { useState, useEffect } from 'react';
import './Modal.css';

const MessagesView = ({ initialConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchConversations();
  }, []);
  
  // Handle initial conversation selection
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.conversationID === initialConversationId);
      if (conversation) {
        handleSelectConversation(conversation);
      }
    }
  }, [initialConversationId, conversations]);
  
  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Get user ID from localStorage
      const userID = localStorage.getItem('userID');
      
      if (!userID) {
        setError('You must be logged in to view messages');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:8000/conversations.php?user_id=${userID}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setConversations(data.conversations || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:8000/messages.php?conversation_id=${conversationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.messages || [];
    } catch (err) {
      console.error('Error fetching messages:', err);
      return [];
    }
  };
  
  const handleSelectConversation = async (conversation) => {
    try {
      const messages = await fetchMessages(conversation.conversationID);
      setSelectedConversation({
        ...conversation,
        messages
      });
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };
  
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    try {
      const userID = localStorage.getItem('userID');
      
      const response = await fetch('http://localhost:8000/send_message.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: selectedConversation.conversationID,
          sender_id: userID,
          message_text: messageText
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Reset message text
      setMessageText('');
      
      // Refresh messages
      handleSelectConversation(selectedConversation);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };
  
  // Format timestamp to readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    
    // If today, show time only
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString();
  };
  
  if (loading) {
    return (
      <div className="modal-body messages-view">
        <div className="loading-messages">Loading conversations...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="modal-body messages-view">
        <div className="error-messages">{error}</div>
      </div>
    );
  }
  
  // If there are no conversations, show a message
  if (conversations.length === 0) {
    return (
      <div className="modal-body messages-view">
        <div className="empty-conversations">
          <p>You don't have any conversations yet.</p>
          <p>When you message a seller about a listing, it will appear here.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="modal-body messages-view">
      <div className="messages-container">
        <div className="message-list">
          {conversations.map((conversation) => (
            <div 
              key={conversation.conversationID} 
              className={`message-item ${selectedConversation?.conversationID === conversation.conversationID ? 'active' : ''}`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="message-avatar">
                {conversation.otherUserName ? conversation.otherUserName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="message-content">
                <div className="message-sender">{conversation.otherUserName || 'User'}</div>
                <div className="message-preview">{conversation.lastMessage || 'Start a conversation...'}</div>
              </div>
              <div className="message-time">{formatTime(conversation.lastMessageTime)}</div>
            </div>
          ))}
        </div>
        
        <div className="message-detail">
          {selectedConversation ? (
            <>
              <div className="message-header">
                Conversation with {selectedConversation.otherUserName || 'User'}
              </div>
              <div className="message-chat">
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  <div className="message-bubbles">
                    {selectedConversation.messages.map((message) => {
                      const isCurrentUser = message.senderID === parseInt(localStorage.getItem('userID'));
                      return (
                        <div 
                          key={message.messageID} 
                          className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}
                        >
                          <div className="message-text">{message.text}</div>
                          <div className="message-timestamp">
                            {formatTime(message.timestamp)}
                            {isCurrentUser ? ' · Sent' : ` · ${message.senderName || 'User'}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-messages">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
              <div className="message-input-container">
                <input
                  type="text"
                  placeholder="Message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="message-input"
                  autoFocus
                />
                <button 
                  onClick={sendMessage}
                  className="send-message-button"
                  disabled={!messageText.trim()}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="message-placeholder">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesView; 