import React, { useEffect, useState } from 'react';
import {
  fetchSessions,
  createSession,
  updateSession,
  deleteSession
} from './api';
import SessionForm from './SessionForm';
import '../styles/AdminPage.css';
import '../styles/SessionForm.css';

const SessionTable = ({ token, showNotification }) => {
  const [sessions, setSessions] = useState([]);
  const [activeDay, setActiveDay] = useState(new Date().getDay()); // 0=Sunday, 1=Monday, ...
  // Hebrew days of week, starting from Sunday
  const daysOfWeek = [
    { key: 0, label: 'ראשון' },
    { key: 1, label: 'שני' },
    { key: 2, label: 'שלישי' },
    { key: 3, label: 'רביעי' },
    { key: 4, label: 'חמישי' },
    { key: 5, label: 'שישי' },
    { key: 6, label: 'שבת' },
  ];

  // Group sessions by day of week
  const sessionsByDay = daysOfWeek.reduce((acc, day) => {
    acc[day.key] = [];
    return acc;
  }, {});
  sessions.forEach(session => {
    if (session.date) {
      const d = new Date(session.date);
      // JS: 0=Sunday, 6=Saturday
      const dayIdx = d.getDay();
      if (sessionsByDay[dayIdx]) sessionsByDay[dayIdx].push(session);
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // session object or null
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await fetchSessions();
      setSessions(Array.isArray(data) ? data : data.sessions || []);
      setError(null);
    } catch (e) {
      setError('Error fetching sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [token]);

  const handleCreate = async (sessionData) => {
    try {
      await createSession(sessionData);
      showNotification('Session created!', 'success');
      setShowForm(false);
      loadSessions();
    } catch (e) {
      showNotification('Failed to create session', 'error');
    }
  };

  const handleEdit = (session) => {
    setEditing(session);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleUpdate = async (sessionData) => {
    try {
      await updateSession(editing.id, sessionData);
      showNotification('Session updated!', 'success');
      setShowForm(false);
      setEditing(null);
      loadSessions();
    } catch (e) {
      showNotification('Failed to update session', 'error');
    }
  };

  const handleDelete = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      showNotification('Session deleted!', 'success');
      loadSessions();
    } catch (e) {
      showNotification('Failed to delete session', 'error');
    }
  };

  if (loading) return <div>טוען מפגשים...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="session-table-container">
      <button className="create-session-btn" onClick={() => { setFormMode('create'); setEditing(null); setShowForm(true); }}>הוסף מפגש</button>
      {showForm && (
        <SessionForm
          initial={formMode === 'edit' ? editing : null}
          onSubmit={formMode === 'edit' ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      {/* Day-of-week tabs */}
      <div className="day-tabs" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        margin: '1rem 0', 
        flexWrap: 'wrap', 
        gap: '4px',
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
        {daysOfWeek.map(day => (
          <button
            key={day.key}
            className={`day-tab-btn${activeDay === day.key ? ' active' : ''}`}
            style={{ 
              padding: '6px 8px', 
              borderRadius: 6, 
              border: activeDay === day.key ? '2px solid #1e90ff' : '1px solid #ccc', 
              background: activeDay === day.key ? '#1e90ff' : '#fff', 
              color: activeDay === day.key ? '#fff' : '#222', 
              cursor: 'pointer',
              fontSize: '14px',
              minWidth: '60px',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setActiveDay(day.key)}
          >
            {day.label}
          </button>
        ))}
      </div>
      <table className="session-table">
        <thead>
          <tr>
            <th>תאריך</th>
            <th>שעות</th>
            <th>שם אימון</th>
            <th>נרשמים</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {sessionsByDay[activeDay] && sessionsByDay[activeDay].length > 0 ? (
            sessionsByDay[activeDay].map(session => (
              <tr key={session.id} className="session-row">
                <td>{session.date ? new Date(session.date).toLocaleDateString() : ''}</td>
                <td>{session.start_time && session.end_time ? `${session.start_time} - ${session.end_time}` : ''}</td>
                <td>{session.title}</td>
                <td>{session.participants}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(session)}>ערוך</button>
                  <button className="delete-btn" onClick={() => handleDelete(session.id)}>מחק</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>אין מפגשים ליום זה</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SessionTable;
