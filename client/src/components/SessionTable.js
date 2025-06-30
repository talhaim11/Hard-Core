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
  // Week picker state
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week
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
  // ...existing code...

  // Helper: get current week (Sun-Sat) and next week
  function getCurrentAndNextWeek(date) {
    // Find the Sunday of the current week
    const curr = new Date(date);
    const day = curr.getDay();
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - day);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    // Next week
    const nextSunday = new Date(sunday);
    nextSunday.setDate(sunday.getDate() + 7);
    const nextSaturday = new Date(nextSunday);
    nextSaturday.setDate(nextSunday.getDate() + 6);
    return [ [sunday, saturday], [nextSunday, nextSaturday] ];
  }

  // --- Week filtering logic (must be after sessions and daysOfWeek are defined) ---
  const today = new Date();
  const weeksToShow = getCurrentAndNextWeek(today);
  // Filter sessions by selected week
  const sessionsInWeek = sessions.filter(session => {
    if (!session.date) return false;
    const d = new Date(session.date);
    const [weekStart, weekEnd] = weeksToShow[selectedWeek];
    // Only sessions in the selected week
    return d >= weekStart && d <= weekEnd;
  });
  // Group filtered sessions by day of week
  const sessionsByDay = daysOfWeek.reduce((acc, day) => {
    acc[day.key] = [];
    return acc;
  }, {});
  sessionsInWeek.forEach(session => {
    if (session.date) {
      const d = new Date(session.date);
      const dayIdx = d.getDay();
      if (sessionsByDay[dayIdx]) sessionsByDay[dayIdx].push(session);
    }
  });
  // ...existing code...

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
      const response = await createSession(sessionData);
      
      // Show detailed feedback
      let message = `Created ${response.created?.length || 0} sessions`;
      if (response.skipped?.length > 0) {
        message += `, skipped ${response.skipped.length} (conflicts)`;
      }
      if (response.deleted?.length > 0) {
        message += `, deleted ${response.deleted.length} overlapping sessions`;
      }
      
      showNotification(message, response.skipped?.length > 0 ? 'warning' : 'success');
      setShowForm(false);
      loadSessions();
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Failed to create session';
      showNotification(errorMsg, 'error');
    }
  };

  const handleEdit = (session) => {
    setEditing(session);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleUpdate = async (sessionData) => {
    try {
      const response = await updateSession(editing.id, sessionData);
      
      let message = 'Session updated!';
      if (response.deleted?.length > 0) {
        message += ` (deleted ${response.deleted.length} overlapping sessions)`;
      }
      
      showNotification(message, 'success');
      setShowForm(false);
      setEditing(null);
      loadSessions();
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Failed to update session';
      showNotification(errorMsg, 'error');
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
      {/* Week picker */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(Number(e.target.value))}
          style={{ fontSize: '16px', padding: '4px 8px', borderRadius: 6 }}
        >
          {weeksToShow.map(([start, end], idx) => (
            <option key={idx} value={idx}>
              {`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`}
              {idx === 0 ? ' (השבוע הנוכחי)' : ' (שבוע הבא)'}
            </option>
          ))}
        </select>
      </div>
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
              <tr key={session.id} className="session-row" style={{
                backgroundColor: (session.session_type === 'blocked') ? '#fff3e0' : 'transparent',
                color: (session.session_type === 'blocked') ? '#e65100' : '#333'
              }}>
                <td>{session.date ? new Date(session.date).toLocaleDateString() : ''}</td>
                <td>{session.start_time && session.end_time ? `${session.start_time} - ${session.end_time}` : ''}</td>
                <td>
                  {(session.session_type === 'blocked') && '🚫 '}
                  {session.title}
                  {(session.session_type === 'blocked') && ' (זמן חסום)'}
                </td>
                <td>{(session.session_type === 'blocked') ? 'לא רלוונטי' : session.participants}</td>
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
