import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { formatDateDDMMYYYY } from '../utils/dateFormatter';
import '../styles/AdminUserManager.css';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [subscriptions, setSubscriptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedUsers, setExpandedUsers] = useState({}); // Track which users are expanded

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // The backend returns a plain array, not { users: [...] }
      const userData = Array.isArray(res.data) ? res.data : (res.data.users || []);
      setUsers(userData);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setMessage('Failed to fetch users');
    }
  };

  const fetchSubscriptions = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/subscriptions/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptions(prevSubs => ({ ...prevSubs, [userId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
      setMessage('Failed to fetch subscriptions');
    }
  };

  const deleteUserHandler = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      const errorMsg = err.response?.data?.error || 'Failed to delete user';
      setMessage(`Failed to delete user: ${errorMsg}`);
    }
  };

  const createSubscriptionHandler = async (userId, subscriptionType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/subscriptions`, 
        { user_id: userId, type: subscriptionType }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`${subscriptionType} subscription created successfully!`);
      fetchSubscriptions(userId);
    } catch (err) {
      console.error("Error creating subscription:", err);
      const errorMsg = err.response?.data?.error || 'Failed to create subscription';
      setMessage(`Failed to create subscription: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriptionsHandler = async (userId) => {
    if (!window.confirm('Delete all subscriptions and session entries for this user?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/subscriptions/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('All subscriptions and session entries deleted successfully!');
      setSubscriptions(prev => ({ ...prev, [userId]: [] }));
    } catch (err) {
      console.error("Error deleting subscriptions:", err);
      const errorMsg = err.response?.data?.error || 'Failed to delete subscriptions';
      setMessage(`Failed to delete subscriptions: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSessionBlockingPermission = async (userId, user) => {
    const newPermission = !user.can_block_sessions;
    const confirmMessage = newPermission 
      ? `Grant session blocking permission to ${user.email}?`
      : `Remove session blocking permission from ${user.email}?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    console.log('🚀 Starting session blocking permission update...');
    console.log('📊 User ID:', userId, 'Type:', typeof userId);
    console.log('👤 User object:', user);
    console.log('🔄 New permission:', newPermission);
    console.log('🌐 API_BASE:', API_BASE);
    console.log('🔗 Full URL:', `${API_BASE}/users/${userId}/session-blocking-permission`);
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const requestData = { can_block_sessions: newPermission };
      console.log('📤 Request data:', requestData);
      
      const response = await axios.put(`${API_BASE}/users/${userId}/session-blocking-permission`, 
        requestData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      
      const actionText = newPermission ? 'granted' : 'removed';
      setMessage(`Session blocking permission ${actionText} successfully!`);
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error('❌ Full error object:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error response status:', err.response?.status);
      console.error('❌ Error response data:', err.response?.data);
      console.error('❌ Error config:', err.config);
      
      const errorMsg = err.response?.data?.error || 'Failed to update permission';
      console.error('❌ Final error message:', errorMsg);
      setMessage(`Failed to update permission: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpansion = (userId) => {
    console.log('🔄 Toggling user expansion for ID:', userId, 'Type:', typeof userId);
    console.log('🔄 Current users:', users.map(u => ({ id: u.id, email: u.email })));
    setExpandedUsers(prev => {
      const newState = {
        ...prev,
        [userId]: !prev[userId]
      };
      console.log('📊 Previous state:', prev);
      console.log('📊 New expanded state:', newState);
      return newState;
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Debug: log users and filteredUsers
  const filteredUsers = users.filter(u =>
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="admin-user-manager">
      <h2>ניהול משתמשים</h2>
      
      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <h3 className="user-list-label">משתמשים רשומים:</h3>
      <input
        type="text"
        className="user-search"
        placeholder="חפש משתמש..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{marginBottom: '0.5rem', width: '90%'}}
      />
      
      <ul className="user-list scrollable-user-list">
        {filteredUsers.length === 0 ? (
          <li className="no-users">No users found</li>
        ) : (
          filteredUsers.map((u, i) => {
            const userId = u.id; // Use the actual user ID from the object
            return (
              <li key={i} className="user-item">
                <div className="user-header" onClick={() => toggleUserExpansion(userId)}>
                  <div className="user-info">
                    {u.email || 'No email'} ({u.role || 'No role'})
                  </div>
                  <div className={`arrow ${expandedUsers[userId] ? 'expanded' : ''}`}>
                    ▼
                  </div>
                </div>

                {expandedUsers[userId] && (
                  <div className="user-actions">
                    <h3 style={{margin: '0 0 15px 0', color: '#2d3748', fontSize: '18px', fontWeight: '600'}}>User Management Options:</h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      width: '100%'
                    }}>
                      <button 
                        onClick={() => fetchSubscriptions(userId)}
                        disabled={loading}
                        className="view-details"
                      >
                        🔍 View Details
                      </button>
                      <button 
                        onClick={() => createSubscriptionHandler(userId, 'monthly')}
                        disabled={loading}
                        className="create-subscription monthly"
                      >
                        Create Monthly Subscription
                      </button>
                      <button 
                        onClick={() => createSubscriptionHandler(userId, 'one-time')}
                        disabled={loading}
                        className="create-subscription one-time"
                      >
                        Create One-Time Entry
                      </button>
                      <button 
                        onClick={() => createSubscriptionHandler(userId, '5-entries')}
                        disabled={loading}
                        className="create-subscription five-entries"
                      >
                        Create 5 Entries
                      </button>
                      <button 
                        onClick={() => createSubscriptionHandler(userId, '10-entries')}
                        disabled={loading}
                        className="create-subscription ten-entries"
                      >
                        Create 10 Entries
                      </button>
                      <button 
                        onClick={() => deleteSubscriptionsHandler(userId)}
                        disabled={loading}
                        className="delete-subscriptions-btn"
                      >
                        Delete Subscriptions Options
                      </button>
                      <button 
                        onClick={() => deleteUserHandler(userId)}
                        disabled={loading}
                        className="delete-user-btn"
                      >
                        🗑️ Delete User
                      </button>
                      <button 
                        onClick={() => toggleSessionBlockingPermission(userId, u)}
                        disabled={loading}
                        className={`create-subscription ${u.can_block_sessions ? 'monthly' : ''}`}
                        style={{
                          backgroundColor: u.can_block_sessions ? undefined : '#6c757d'
                        }}
                      >
                        {u.can_block_sessions ? '✅ Can Block Sessions' : '🚫 Enable Session Blocking'}
                      </button>
                      {subscriptions[userId] && (
                        <div className="subscription-details">
                          <h4>Subscriptions:</h4>
                          <ul className="subscription-list">
                            {subscriptions[userId].map((sub, j) => (
                              <li key={j} className="subscription-item">
                                <strong>{sub.type}</strong>
                                <span className="subscription-info">
                                  Started: {formatDateDDMMYYYY(sub.start_time)}
                                  {sub.end_time && ` | Expires: ${formatDateDDMMYYYY(sub.end_time)}`}
                                  {sub.remaining_entries && ` | Remaining: ${sub.remaining_entries}`}
                                  {sub.is_active ? ' | Active' : ' | Inactive'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })
        )}
      </ul>
    </div>
  );
}

