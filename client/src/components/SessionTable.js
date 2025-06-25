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
    if (!window.confirm('Delete this session?')) return;
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
      <table className="session-table">
        <thead>
          <tr>
            <th>תאריך</th>
            <th>שעה</th>
            <th>שם אימון</th>
            <th>נרשמים</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session.id}>
              <td>{session.date_time ? new Date(session.date_time).toLocaleDateString() : ''}</td>
              <td>{session.date_time ? new Date(session.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
              <td>{session.title}</td>
              <td>{session.participants}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(session)}>ערוך</button>
                <button className="delete-btn" onClick={() => handleDelete(session.id)}>מחק</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionTable;
