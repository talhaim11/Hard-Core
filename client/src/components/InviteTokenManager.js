import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

const InviteTokenManager = () => {
  const [tokens, setTokens] = useState([]);
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

  useEffect(() => { fetchTokens(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/invite-tokens`, { email, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`נוצר טוקן: ${res.data.token}`);
      setEmail('');
      setRole('user');
      fetchTokens();
    } catch (e) {
      setError('שגיאה ביצירת טוקן');
    }
  };

  return (
    <div className="invite-token-manager" dir="rtl">
      <h2>ניהול טוקנים להזמנה</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <label>אימייל (לא חובה):
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
        </label>
        <label>הרשאה:
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button type="submit">צור טוקן</button>
      </form>
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h3>כל הטוקנים</h3>
      {loading ? <div>טוען...</div> : (
        <table style={{ 
          width: '100%', 
          direction: 'rtl',
          borderCollapse: 'collapse',
          border: '1px solid #ddd'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ 
                padding: '12px', 
                border: '1px solid #ddd', 
                backgroundColor: '#e9e9e9',
                color: '#333',
                fontWeight: 'bold'
              }}>טוקן</th>
              <th style={{ 
                padding: '12px', 
                border: '1px solid #ddd', 
                backgroundColor: '#e9e9e9',
                color: '#333',
                fontWeight: 'bold'
              }}>אימייל</th>
              <th style={{ 
                padding: '12px', 
                border: '1px solid #ddd', 
                backgroundColor: '#e9e9e9',
                color: '#333',
                fontWeight: 'bold'
              }}>הרשאה</th>
              <th style={{ 
                padding: '12px', 
                border: '1px solid #ddd', 
                backgroundColor: '#e9e9e9',
                color: '#333',
                fontWeight: 'bold'
              }}>שומש?</th>
              <th style={{ 
                padding: '12px', 
                border: '1px solid #ddd', 
                backgroundColor: '#e9e9e9',
                color: '#333',
                fontWeight: 'bold'
              }}>נוצר בתאריך</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.id} style={{ 
                backgroundColor: t.used ? '#f0f8ff' : '#fff',
                '&:hover': { backgroundColor: '#f9f9f9' }
              }}>
                <td style={{ 
                  fontFamily: 'monospace', 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  color: '#333'
                }}>{t.token}</td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  color: '#333'
                }}>{t.email || '-'}</td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  color: '#333'
                }}>{t.role}</td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  color: t.used ? '#007bff' : '#28a745',
                  fontWeight: 'bold'
                }}>{t.used ? 'כן' : 'לא'}</td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  color: '#333'
                }}>{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InviteTokenManager;
