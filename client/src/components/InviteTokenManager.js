import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

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
      await axios.delete(`${API_BASE}/admin/users-with-tokens`, {
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
        <label>שם משתמש (לא חובה):
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="username" />
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
      
      <div style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <h3>כל הטוקנים</h3>
        <button 
          onClick={cleanupTokens}
          style={{ 
            backgroundColor: '#ff6b6b', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🧹 נקה טוקנים יתומים
        </button>
        <button 
          onClick={() => { fetchTokens(); fetchUsers(); }}
          style={{ 
            backgroundColor: '#4ecdc4', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 רענן
        </button>
      </div>
      {loading ? <div>טוען...</div> : (
        <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8 }}>
          <table style={{ 
            width: '100%', 
            direction: 'rtl',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            wordBreak: 'break-all'
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
                }}>שם משתמש</th>
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
                }}>סטטוס</th>
                <th style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  backgroundColor: '#e9e9e9',
                  color: '#333',
                  fontWeight: 'bold'
                }}>נוצר בתאריך</th>
                <th style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  backgroundColor: '#e9e9e9',
                  color: '#333',
                  fontWeight: 'bold'
                }}>מחק טוקן</th>
                <th style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  backgroundColor: '#e9e9e9',
                  color: '#333',
                  fontWeight: 'bold'
                }}>מחק משתמש+טוקנים</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(t => {
                const userExists = users.find(u => u.email === t.email);
                const getStatus = () => {
                  if (t.used && userExists) return { text: 'משתמש קיים', color: '#28a745' };
                  if (t.used && !userExists) return { text: 'יתום', color: '#ff6b6b' };
                  if (!t.used && t.email) return { text: 'לא שומש', color: '#ffc107' };
                  return { text: 'חופשי', color: '#6c757d' };
                };
                const status = getStatus();
                
                return (
                <tr key={t.id} style={{ 
                  backgroundColor: userExists ? '#f0f8ff' : (t.used ? '#ffe6e6' : '#fff'),
                  '&:hover': { backgroundColor: '#f9f9f9' }
                }}>
                  <td style={{ 
                    fontFamily: 'monospace', 
                    padding: '10px', 
                    border: '1px solid #ddd',
                    color: '#333',
                    fontSize: '12px',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{t.token}</td>
                  <td style={{ 
                    padding: '10px', 
                    border: '1px solid #ddd',
                    color: userExists ? '#333' : '#999',
                    fontWeight: userExists ? 'bold' : 'normal'
                  }}>
                    {t.email || '-'}
                    {userExists && <span style={{ color: '#28a745', marginRight: 5 }}>✓</span>}
                  </td>
                  <td style={{ 
                    padding: '10px', 
                    border: '1px solid #ddd',
                    color: '#333'
                  }}>{t.role}</td>
                  <td style={{ 
                    padding: '10px', 
                    border: '1px solid #ddd',
                    color: status.color,
                    fontWeight: 'bold'
                  }}>{status.text}</td>
                  <td style={{ 
                    padding: '10px', 
                    border: '1px solid #ddd',
                    color: '#333'
                  }}>{new Date(t.created_at).toLocaleString()}</td>
                  
                  {/* Delete Token Column */}
                  <td style={{ 
                    padding: '10px', 
                    border: '1px solid #ddd',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => deleteToken(t.id, t.email)}
                      style={{
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ מחק טוקן
                    </button>
                  </td>

                  {/* Delete User+Tokens Column */}
                  <td style={{ 
                    padding: '10px', 
                    border: '1px solid #ddd',
                    textAlign: 'center'
                  }}>
                    {t.email && t.email.trim() !== '' ? (
                      <button
                        onClick={() => deleteUserAndAllTokens(t.email)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        � מחק הכל
                      </button>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        אין משתמש
                      </span>
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
