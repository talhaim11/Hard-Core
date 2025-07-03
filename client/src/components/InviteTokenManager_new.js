import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import '../styles/InviteTokenManager.css';

const InviteTokenManager = () => {
  const [tokens, setTokens] = useState([]);
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTokens = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/invite-tokens`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTokens(res.data.tokens || []);
    } catch (e) {
      setError('שגיאה בטעינת טוקנים');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const deleteToken = async (tokenId) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את הטוקן הזה?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/invite-tokens/${tokenId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('הטוקן נמחק בהצלחה');
      fetchTokens();
      fetchUsers();
    } catch (e) {
      setError('שגיאה במחיקת הטוקן');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/invite-tokens`, { email, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`נוצר טוקן בהצלחה`);
      setEmail('');
      setRole('user');
      fetchTokens();
    } catch (e) {
      setError('שגיאה ביצירת טוקן');
    }
  };

  useEffect(() => {
    fetchTokens();
    fetchUsers();
  }, []);

  return (
    <div className="invite-token-manager" dir="rtl">
      <h2>ניהול טוקנים להזמנה</h2>
      
      <form onSubmit={handleCreate} className="token-form">
        <div className="form-group">
          <label>שם משתמש:</label>
          <input 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="username" 
          />
        </div>
        <div className="form-group">
          <label>הרשאה:</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="create-btn">צור טוקן</button>
      </form>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">טוען...</div>
      ) : (
        <div className="token-table-container">
          <table className="token-table">
            <thead>
              <tr>
                <th>טוקן</th>
                <th>משתמש</th>
                <th>הרשאה</th>
                <th>סטטוס</th>
                <th>תאריך</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(t => {
                const userExists = users.find(u => u.email === t.email);
                const getStatus = () => {
                  if (t.used && userExists) return { text: 'פעיל', color: '#28a745' };
                  if (t.used && !userExists) return { text: 'יתום', color: '#ff6b6b' };
                  if (!t.used && t.email) return { text: 'ממתין', color: '#ffc107' };
                  return { text: 'חופשי', color: '#6c757d' };
                };
                const status = getStatus();
                
                return (
                  <tr key={t.id}>
                    <td className="token-cell">{t.token}</td>
                    <td>
                      {t.email || '-'}
                      {userExists && <span className="check-mark">✓</span>}
                    </td>
                    <td>{t.role}</td>
                    <td style={{ color: status.color, fontWeight: 'bold' }}>
                      {status.text}
                    </td>
                    <td className="date-cell">
                      {new Date(t.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td>
                      <button
                        onClick={() => deleteToken(t.id)}
                        className="delete-btn"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InviteTokenManager;
