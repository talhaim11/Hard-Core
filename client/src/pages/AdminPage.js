import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionTable from '../components/SessionTable';
import Notification from '../components/Notification';
import AdminStats from '../components/AdminStats';
import InviteTokenManager from '../components/InviteTokenManager';
import AdminUserManager from '../components/AdminUserManager';
import AdminMessageManager from '../components/AdminMessageManager';
import '../styles/AdminPage.css';

const weightliftingSVG = (
  <svg className="admin-logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="32" fill="#222"/>
    <rect x="10" y="29" width="44" height="6" rx="3" fill="#1e90ff"/>
    <rect x="14" y="22" width="4" height="20" rx="2" fill="#fff"/>
    <rect x="46" y="22" width="4" height="20" rx="2" fill="#fff"/>
    <rect x="24" y="26" width="16" height="12" rx="6" fill="#00c6fb"/>
    <circle cx="32" cy="32" r="4" fill="#fff"/>
  </svg>
);

const TABS = [
  { key: 'stats', label: 'סטטיסטיקות' },
  { key: 'sessions', label: 'לוח מפגשים' },
  { key: 'users', label: 'ניהול משתמשים' },
  { key: 'tokens', label: 'ניהול טוקנים' },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: 'info' });
  const [activeTab, setActiveTab] = useState('stats');
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!storedToken || role !== 'admin') {
      navigate('/');
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: 'info' }), 4000);
  };

  return (
    <div className="admin-page">
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'info' })} />
      <div className="admin-content-card">
        {weightliftingSVG}
        <h1 style={{ textAlign: 'center' }}>Progress, not perfection.</h1>
        <div className="admin-header">
          <button className="logout-btn" onClick={handleLogout}>התנתק</button>
          <button 
            className="messages-btn" 
            onClick={() => setShowMessagesModal(true)}
            title="הודעות מערכת"
          >
            הודעות
          </button>
        </div>
        <div className="admin-tabs" dir="rtl">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`admin-tab-btn${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="admin-tab-content" dir="rtl">
          {activeTab === 'stats' && (
            <div className="admin-section" style={{ textAlign: 'right' }}>
              <h2>סטטיסטיקות</h2>
              <AdminStats />
            </div>
          )}
          {activeTab === 'users' && (
            <div className="admin-section" style={{ textAlign: 'right' }}>
              <AdminUserManager />
            </div>
          )}
          {activeTab === 'sessions' && (
            <div className="admin-section" style={{ textAlign: 'right' }}>
              <h2>לוח מפגשים</h2>
              {token && <SessionTable token={token} showNotification={showNotification} />}
            </div>
          )}
          {activeTab === 'tokens' && (
            <div className="admin-section" style={{ textAlign: 'right' }}>
              <h2>ניהול טוקנים</h2>
              <InviteTokenManager />
            </div>
          )}
        </div>
      </div>
      
      {/* Messages Modal */}
      {showMessagesModal && (
        <div className="modal-overlay" onClick={() => setShowMessagesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>הודעות מערכת</h2>
              <button className="modal-close-btn" onClick={() => setShowMessagesModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <AdminMessageManager showNotification={showNotification} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

