import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminPage.css'; // Reuse card/table styles for consistency

const SessionList = ({ token }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.sessions || [];
        setSessions(data);
      } catch (error) {
        setError('שגיאה בטעינת מפגשים');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [token]);

  const handleRegister = async (sessionId) => {
    try {
      await axios.post(`/sessions/${sessionId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = await axios.get('/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(updated.data)
        ? updated.data
        : updated.data.sessions || [];
      setSessions(data);
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleCancel = async (sessionId) => {
    try {
      await axios.delete(`/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = await axios.get('/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(updated.data)
        ? updated.data
        : updated.data.sessions || [];
      setSessions(data);
    } catch (error) {
      console.error('Error cancelling:', error);
    }
  };

  return (
    <div className="session-table-container">
      <h2 style={{textAlign: 'center'}}>לוח אימונים</h2>
      {loading && <div>טוען מפגשים...</div>}
      {error && <div className="error-msg">{error}</div>}
      {!loading && !error && sessions.length === 0 && (
        <div className="no-sessions">אין מפגשים זמינים</div>
      )}
      {!loading && !error && sessions.length > 0 && (
        <table className="session-table">
          <thead>
            <tr>
              <th>תאריך</th>
              <th>שעה</th>
              <th>שם אימון</th>
              <th>נרשמים</th>
              <th>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.date_time ? new Date(session.date_time).toLocaleDateString() : ''}</td>
                <td>{session.date_time ? new Date(session.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                <td>{session.title}</td>
                <td>{session.participants}</td>
                <td>
                  {session.is_registered ? (
                    <button className="logout-btn" style={{background:'#dc3545'}} onClick={() => handleCancel(session.id)}>בטל הרשמה</button>
                  ) : (
                    <button className="logout-btn" onClick={() => handleRegister(session.id)}>הירשם</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SessionList;
