import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
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
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/users/${userId}/session-blocking-permission`, 
        { can_block_sessions: newPermission }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const actionText = newPermission ? 'granted' : 'removed';
      setMessage(`Session blocking permission ${actionText} successfully!`);
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("Error updating session blocking permission:", err);
      const errorMsg = err.response?.data?.error || 'Failed to update permission';
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
            console.log('🔍 User object:', u);
            console.log('🔍 User ID:', userId);
            console.log('🔍 Expanded users state:', expandedUsers);
            console.log('🔍 Is this user expanded?', expandedUsers[userId]);
            return (
              <li key={i} className="user-item">
                <div className="user-header" onClick={() => toggleUserExpansion(userId)} style={{backgroundColor: '#f8f9fa', border: '1px solid #ddd'}}>
                  <div className="user-info" style={{color: '#000', fontSize: '16px', fontWeight: 'bold'}}>
                    {u.email || 'No email'} ({u.role || 'No role'})
                  </div>
                  <div className={`arrow ${expandedUsers[userId] ? 'expanded' : ''}`} style={{color: '#000', fontSize: '18px'}}>
                    ▼
                  </div>
                </div>
                
                {/* DEBUG: Always show this for testing */}
                <div style={{backgroundColor: 'yellow', padding: '10px', margin: '5px'}}>
                  <p>DEBUG: This should always be visible for user {userId}</p>
                  <p>expandedUsers[{userId}] = {String(expandedUsers[userId])}</p>
                </div>

                {expandedUsers[userId] && (
                  <div style={{
                    width: '100%',
                    backgroundColor: '#ff0000',
                    border: '5px solid #000000',
                    padding: '20px',
                    margin: '10px 0 20px 0',
                    borderRadius: '8px',
                    display: 'block',
                    minHeight: '200px',
                    boxSizing: 'border-box'
                  }}>
                    <h3 style={{margin: '0 0 15px 0', color: '#ffffff', fontSize: '18px'}}>User Management Options:</h3>
                    <p style={{color: 'white', fontSize: '16px'}}>DEBUG: Expanded section is visible!</p>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      width: '100%',
                      minHeight: '100px'
                    }}>
                      <button 
                        onClick={() => fetchSubscriptions(userId)}
                        disabled={loading}
                        style={{
                          all: 'unset',
                          display: 'block',
                          visibility: 'visible',
                          opacity: '1',
                          backgroundColor: '#007bff',
                          color: 'white',
                          padding: '12px 16px',
                          border: '2px solid white',
                          borderRadius: '6px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          minHeight: '50px',
                          margin: '5px 0',
                          textAlign: 'center',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        🔍 View Details (DEBUG)
                      </button>
                      <button 
                        onClick={() => createSubscriptionHandler(userId, 'monthly')}
                        disabled={loading}
                        className="admin-management-button monthly"
                        style={{
                          display: 'block',
                          visibility: 'visible',
                          opacity: '1',
                          backgroundColor: '#28a745',
                          color: 'white',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          minHeight: '44px',
                          margin: '5px'
                        }}
                      >
                        Create Monthly Subscription
                      </button>
                      <button 
                        onClick={() => createSubscriptionHandler(userId, 'one-time')}
                        disabled={loading}
                        className="admin-management-button one-time"
                        style={{
                          display: 'block',
                          visibility: 'visible',
                          opacity: '1',
                          backgroundColor: '#ffc107',
                          color: 'black',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          minHeight: '44px',
                          margin: '5px'
                        }}
                      >
                        Create One-Time Entry
                      </button>
                      <button 
                        onClick={() => createSubscriptionHandler(userId, '5-entries')}
                        disabled={loading}
                        className="admin-management-button entries-5"
                        style={{
                          display: 'block',
                          visibility: 'visible',
                          opacity: '1',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          minHeight: '44px',
                          margin: '5px'
                        }}
                      >
                        Create 5 Entries
                      </button>
                      <button 
                        onClick={() => createSubscriptionHandler(userId, '10-entries')}
                        disabled={loading}
                        className="admin-management-button entries-10"
                        style={{
                          display: 'block',
                          visibility: 'visible',
                          opacity: '1',
                          backgroundColor: '#6f42c1',
                          color: 'white',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          minHeight: '44px',
                          margin: '5px'
                        }}
                      >
                        Create 10 Entries
                      </button>
                      <button 
                        onClick={() => deleteSubscriptionsHandler(userId)}
                        disabled={loading}
                        className="admin-management-button delete-subs"
                        style={{
                          display: 'block',
                          visibility: 'visible',
                          opacity: '1',
                          backgroundColor: '#fd7e14',
                          color: 'white',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          minHeight: '44px',
                          margin: '5px'
                        }}
                      >
                        Delete Subscriptions Options
                      </button>
                      <button 
                        onClick={() => deleteUserHandler(userId)}
                        disabled={loading}
                        className="admin-management-button delete-user"
                        style={{
                          display: 'block',
                          visibility: 'visible',
                          opacity: '1',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          minHeight: '44px',
                          margin: '5px'
                        }}
                      >
                        🗑️ Delete User
                      </button>
                      <button 
                        onClick={() => toggleSessionBlockingPermission(userId, u)}
                        disabled={loading}
                        className="admin-management-button session-blocking"
                        style={{
                          display: 'block',
                          visibility: 'visible',
                          opacity: '1',
                          backgroundColor: u.can_block_sessions ? '#28a745' : '#6c757d',
                          color: 'white',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          minHeight: '44px',
                          margin: '5px'
                        }}
                      >
                        {u.can_block_sessions ? '✅ Can Block Sessions' : '🚫 Enable Session Blocking'}
                      </button>
                      {subscriptions[userId] && (
                        <div className="subscription-details" style={{gridColumn: '1 / -1', marginTop: '15px'}}>
                          <h4>Subscriptions:</h4>
                          <ul className="subscription-list">
                            {subscriptions[userId].map((sub, j) => (
                              <li key={j} className="subscription-item">
                                <strong>{sub.type}</strong>
                                <span className="subscription-info">
                                  Started: {new Date(sub.start_time).toLocaleDateString()}
                                  {sub.end_time && ` | Expires: ${new Date(sub.end_time).toLocaleDateString()}`}
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

