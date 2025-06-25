import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
// import '../styles/WorkoutBoard.css'; // Assuming you have a CSS file for styling

const WorkoutBoard = ({ token }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
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
    fetchSessions();
  }, [token]);

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="workout-board">
      <h2>לוח אימונים</h2>
      <ul>
        {(sessions || []).map((session) => (
          <li key={session.id} className="session-item">
            <div><strong>{session.date_time || session.date || ''}</strong></div>
            <div>שם אימון: {session.title || ''}</div>
            <div>מספר נרשמים: {session.participants}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkoutBoard;
