import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SessionList = ({ token }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [token]);

  const handleRegister = async (sessionId) => {
    try {
      await axios.post(`/sessions/${sessionId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // רענון אחרי הרשמה
      const updated = await axios.get('/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(updated.data);
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleCancel = async (sessionId) => {
    try {
      await axios.delete(`/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // רענון אחרי ביטול
      const updated = await axios.get('/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(updated.data);
    } catch (error) {
      console.error('Error cancelling:', error);
    }
  };

  return (
    <div>
      <h2>לוח אימונים</h2>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <strong>{new Date(session.date_time).toLocaleDateString()}</strong> –{' '}
            {new Date(session.date_time).toLocaleTimeString()}
            <br />
            אימון: {session.title}
            <br />
            מספר נרשמים: {session.participants}
            <br />
            {session.is_registered ? (
              <button onClick={() => handleCancel(session.id)}>בטל הרשמה</button>
            ) : (
              <button onClick={() => handleRegister(session.id)}>הירשם</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionList;
