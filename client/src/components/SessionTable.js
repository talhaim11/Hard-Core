import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminPage.css';

const SessionTable = ({ token }) => {
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
        setError('Error fetching sessions');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [token]);

  if (loading) return <div>טוען מפגשים...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!sessions.length) return <div className="no-sessions">אין מפגשים להצגה</div>;

  return (
    <div className="session-table-container">
      <table className="session-table">
        <thead>
          <tr>
            <th>תאריך</th>
            <th>שעה</th>
            <th>שם אימון</th>
            <th>נרשמים</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session.id}>
              <td>{session.date_time ? new Date(session.date_time).toLocaleDateString() : ''}</td>
              <td>{session.date_time ? new Date(session.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
              <td>{session.title}</td>
              <td>{session.participants}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionTable;
