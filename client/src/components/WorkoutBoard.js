import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
// import '../styles/WorkoutBoard.css'; // Assuming you have a CSS file for styling

const WorkoutBoard = ({ token }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(response.data.sessions || []);
    } catch (error) {
      setError('Error fetching sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line
  }, [token]);

  if (loading) return <div>Loading sessions...</div>;
  if (error) return (
    <div>
      {error}
      <button onClick={fetchSessions} style={{ marginLeft: '10px' }}>Retry</button>
    </div>
  );

  return (
    <div className="workout-board">
      <h2>לוח אימונים</h2>
      {sessions.length === 0 ? (
        <div>No sessions available.</div>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session.id} className="session-item">
              <div><strong>{session.date_time || session.date || ''}</strong></div>
              <div>שם אימון: {session.title || ''}</div>
              <div>מספר נרשמים: {session.participants}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkoutBoard;
