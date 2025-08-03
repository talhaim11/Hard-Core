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
      if (!token) {
        setError('אין אישור כניסה. אנא התחבר מחדש.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching tokens with token:', token.substring(0, 20) + '...');
      const res = await axios.get(`${API_BASE}/invite-tokens`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Tokens response:', res.data);
      setTokens(res.data.tokens || []);
    } catch (e) {
      console.error('Error fetching tokens:', e);
      if (e.response?.status === 401) {
        setError('אישור הכניסה לא תקין. אנא התחבר מחדש.');
        localStorage.removeItem('token');
      } else if (e.response?.status === 403) {
        setError('אין הרשאה לצפות בטוקנים. נדרשות הרשאות מנהל.');
      } else {
        setError('שגיאה בטעינת טוקנים: ' + (e.response?.data?.error || e.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token available for fetching users');
        return;
      }
      
      console.log('Fetching users with token:', token.substring(0, 20) + '...');
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Users response:', res.data);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetching users:', e);
      if (e.response?.status === 401) {
        console.warn('Token invalid when fetching users');
      }
    }
  };

  const cleanupTokens = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך לנקות טוקנים לא משומשים ויתומים?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/invite-tokens/cleanup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`נוקו ${res.data.deleted_count} טוקנים. נותרו ${res.data.remaining_count} טוקנים.`);
      fetchTokens();
    } catch (e) {
      setError('שגיאה בניקוי טוקנים');
    }
  };

  const deleteToken = async (tokenId, tokenEmail) => {
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

  const deleteUserAndAllTokens = async (email) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את המשתמש "${email}" וכל הטוקנים שלו?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { email: email }
      });
      setSuccess(`המשתמש "${email}" וכל הטוקנים נמחקו בהצלחה`);
      fetchTokens();
      fetchUsers();
    } catch (e) {
      setError('שגיאה במחיקת המשתמש והטוקנים');
    }
  };

  useEffect(() => { 
    fetchTokens(); 
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
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
      <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.8rem', fontWeight: '700' }}>
        ניהול טוקנים להזמנה
      </h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="token-form">
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
          <div className="form-group">
            <label>שם משתמש (לא חובה):</label>
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
      </div>
      
      <div style={{ 
        marginBottom: '1rem', 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '600', margin: 0 }}>
          כל הטוקנים
        </h3>
        <button 
          onClick={cleanupTokens}
          className="delete-btn"
          style={{ fontSize: '14px' }}
        >
          🧹 נקה טוקנים יתומים
        </button>
        <button 
          onClick={() => { fetchTokens(); fetchUsers(); }}
          className="create-btn"
          style={{ 
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            fontSize: '14px',
            padding: '0.5rem 1rem'
          }}
        >
          🔄 רענן
        </button>
      </div>

      {loading ? <div className="loading">טוען טוקנים...</div> : (
        <div className="token-table-container">
          <table className="token-table" style={{ direction: 'rtl' }}>
            <thead>
              <tr>
                <th>טוקן</th>
                <th>שם משתמש</th>
                <th>הרשאה</th>
                <th>סטטוס</th>
                <th>נוצר בתאריך</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(t => {
                const userExists = users.find(u => u.email === t.email);
                const getStatus = () => {
                  if (t.used && userExists) return { text: 'משתמש קיים', color: '#28a745' };
                  if (t.used && !userExists) return { text: 'יתום', color: '#ff6b6b' };
                  if (!t.used && t.email) return { text: 'לא משומש', color: '#ffc107' };
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
                        onClick={() => deleteToken(t.id, t.email)} 
                        className="delete-btn"
                      >
                        מחק
                      </button>
                      {t.used && userExists && (
                        <button 
                          onClick={() => deleteUserAndAllTokens(t.email)}
                          className="delete-btn"
                          style={{ marginRight: '0.5rem', fontSize: '11px' }}
                        >
                          מחק משתמש
                        </button>
                      )}
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
