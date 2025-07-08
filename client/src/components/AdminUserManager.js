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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // The backend returns a plain array, not { users: [...] }
      setUsers(Array.isArray(res.data) ? res.data : (res.data.users || []));
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
  console.log('All users:', users);
  const filteredUsers = users.filter(u =>
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  );
  console.log('Filtered users:', filteredUsers);

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
        {filteredUsers.map((u, i) => (
          <li key={i} className="user-item">
            <div className="user-info">{u.email} ({u.role})</div>
            <div className="user-actions">
              <button 
                className="view-details" 
                onClick={() => fetchSubscriptions(u.id)}
                disabled={loading}
              >
                View Details
              </button>
              <button 
                className="create-subscription monthly" 
                onClick={() => createSubscriptionHandler(u.id, 'monthly')}
                disabled={loading}
              >
                Create Monthly Subscription
              </button>
              <button 
                className="create-subscription one-time" 
                onClick={() => createSubscriptionHandler(u.id, 'one-time')}
                disabled={loading}
              >
                Create One-Time Entry
              </button>
              <button 
                className="create-subscription five-entries" 
                onClick={() => createSubscriptionHandler(u.id, '5-entries')}
                disabled={loading}
              >
                Create 5 Entries
              </button>
              <button 
                className="create-subscription ten-entries" 
                onClick={() => createSubscriptionHandler(u.id, '10-entries')}
                disabled={loading}
              >
                Create 10 Entries
              </button>
              <button 
                className="delete-subscriptions-btn" 
                onClick={() => deleteSubscriptionsHandler(u.id)}
                disabled={loading}
              >
                Delete Subscriptions Options
              </button>
              <button 
                className="delete-user-btn" 
                onClick={() => deleteUserHandler(u.id)}
                disabled={loading}
              >
                🗑️ Delete User
              </button>
            </div>
            {subscriptions[u.id] && (
              <div className="subscription-details">
                <h4>Subscriptions:</h4>
                <ul className="subscription-list">
                  {subscriptions[u.id].map((sub, j) => (
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
          </li>
        ))}
      </ul>
    </div>
  );
}

