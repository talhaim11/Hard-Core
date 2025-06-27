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
        <table style={{ width: '100%', direction: 'rtl' }}>
          <thead>
            <tr>
              <th>טוקן</th>
              <th>אימייל</th>
              <th>הרשאה</th>
              <th>שומש?</th>
              <th>נוצר בתאריך</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.id} style={{ background: t.used ? '#eee' : '#fff' }}>
                <td style={{ fontFamily: 'monospace' }}>{t.token}</td>
                <td>{t.email || '-'}</td>
                <td>{t.role}</td>
                <td>{t.used ? 'כן' : 'לא'}</td>
                <td>{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InviteTokenManager;
