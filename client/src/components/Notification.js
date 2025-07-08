import React from 'react';
import '../styles/Notification.css';

const Notification = ({ message, type = 'info', onClose }) => {
  if (!message) return null;
  return (
    <div className={`notification ${type}`}> 
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
};

export default Notification;
