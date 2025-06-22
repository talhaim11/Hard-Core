import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import '../styles/WorkoutBoard.css'; // Assuming you have a CSS file for styling

const WorkoutBoard = ({ token }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessions(response.data.sessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [token]);

  return (
    <div className="workout-board">
      <h2>לוח אימונים</h2>
      <ul>
        {sessions.map((session) => (
          <li key={session.id} className="session-item">
            <div><strong>{session.date}</strong></div>
            <div>שם אימון: {session.title}</div>
            <div>מספר נרשמים: {session.participants}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkoutBoard;
