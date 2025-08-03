import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  fetchSessions,
  createSession,
  updateSession,
  deleteSession
} from './api';
import { formatDateDDMMYYYY } from '../utils/dateFormatter';
import SessionForm from './SessionForm';
import DateTimePicker from './DateTimePicker';
import '../styles/AdminPage.css';
import '../styles/SessionForm.css';

const SessionTable = ({ token, showNotification }) => {
  const [showUsersPopup, setShowUsersPopup] = useState(false);
  const [popupUsers, setPopupUsers] = useState([]);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState("");
  const [popupSessionTitle, setPopupSessionTitle] = useState("");

  const handleShowUsers = async (session) => {
    setShowUsersPopup(true);
    setPopupUsers([]);
    setPopupLoading(true);
    setPopupError("");
    setPopupSessionTitle(session.title || "");
    console.log('[DEBUG] handleShowUsers called for session:', session);
    try {
      // Always use the correct API base from config.js
      const { API_BASE } = require('../config');
      const url = `${API_BASE}/sessions/${session.id}/users`;
      console.log('[DEBUG] Fetching users from:', url);
      const res = await axios.get(url);
      console.log('[DEBUG] Response from /sessions/:id/users:', res.data);
      setPopupUsers(res.data.users || []);
    } catch (err) {
      console.error('[DEBUG] Error fetching users:', err);
      setPopupError("שגיאה בטעינת רשימת הנרשמים");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowUsersPopup(false);
    setPopupUsers([]);
    setPopupError("");
    setPopupSessionTitle("");
  };
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
  // Helper: get current week (Sun-Sat) and next week
  function getCurrentAndNextWeek(date) {
    // Find the Sunday of the current week
    const curr = new Date(date);
    const day = curr.getDay();
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - day);
    sunday.setHours(0, 0, 0, 0); // Ensure midnight for Sunday
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999); // Ensure end of day for Saturday

    // Next week
    const nextSunday = new Date(sunday);
    nextSunday.setDate(sunday.getDate() + 7);
    nextSunday.setHours(0, 0, 0, 0);
    const nextSaturday = new Date(nextSunday);
    nextSaturday.setDate(nextSunday.getDate() + 6);
    nextSaturday.setHours(23, 59, 59, 999);

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
      
      // Debug logging for Sunday sessions
      if (dayIdx === 0) {
        console.log('🔍 DEBUG: Found Sunday session:', {
          session: session,
          date: session.date,
          parsedDate: d,
          dayIdx: dayIdx,
          sessionsByDayHasSunday: !!sessionsByDay[dayIdx]
        });
      }
      
      // Additional debug logging for Sunday sessions
      console.log('🔍 DEBUG: Checking session.date format:', {
        sessionDate: session.date,
        parsedDate: d,
        isValidDate: !isNaN(d.getTime()),
      });
      
      if (sessionsByDay[dayIdx]) sessionsByDay[dayIdx].push(session);
    }
  });
  
  // Debug logging after grouping
  console.log('🔍 DEBUG: sessionsByDay after grouping:', {
    sunday: sessionsByDay[0]?.length || 0,
    monday: sessionsByDay[1]?.length || 0,
    tuesday: sessionsByDay[2]?.length || 0,
    wednesday: sessionsByDay[3]?.length || 0,
    thursday: sessionsByDay[4]?.length || 0,
    friday: sessionsByDay[5]?.length || 0,
    saturday: sessionsByDay[6]?.length || 0,
  });

  // Additional debug logging for sessionsByDay initialization
  console.log('🔍 DEBUG: Initializing sessionsByDay:', {
    daysOfWeek,
    sessionsByDay,
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


  // --- Bulk Delete State ---
  const [bulkStartDate, setBulkStartDate] = useState("");
  const [bulkEndDate, setBulkEndDate] = useState("");
  const [bulkType, setBulkType] = useState("");
  const [bulkTrainer, setBulkTrainer] = useState("");
  const [bulkSeries, setBulkSeries] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Quick add session state
  const [quickAddDay, setQuickAddDay] = useState(null); // day index (0-6) or null
  const [quickAddTitle, setQuickAddTitle] = useState("");
  const [quickAddDate, setQuickAddDate] = useState(""); // Add date state
  const [quickAddStart, setQuickAddStart] = useState("");
  const [quickAddEnd, setQuickAddEnd] = useState("");
  const [quickAddType, setQuickAddType] = useState("regular");
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  const { deleteSessionsBulk, deleteOldSessions } = require("./api");

  // Bulk delete by range/filter
  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const criteria = {};
      if (bulkStartDate) criteria.start_date = bulkStartDate;
      if (bulkEndDate) criteria.end_date = bulkEndDate;
      if (bulkType) criteria.session_type = bulkType;
      if (bulkTrainer) criteria.trainer = bulkTrainer;
      if (bulkSeries) criteria.series = bulkSeries;
      const res = await deleteSessionsBulk(criteria);
      showNotification(res.message, 'success');
      loadSessions();
    } catch (e) {
      showNotification('מחיקת מפגשים נכשלה', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  // Delete all sessions older than 6 months
  const handleDeleteOld = async () => {
    setBulkLoading(true);
    try {
      const res = await deleteOldSessions();
      showNotification(res.message, 'success');
      loadSessions();
    } catch (e) {
      showNotification('מחיקת מפגשים ישנים נכשלה', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  // Quick add session for a specific day
  const handleQuickAdd = async (dayIdx) => {
    setQuickAddLoading(true);
    try {
      // Use the quickAddDate if provided, otherwise calculate from dayIdx
      let dateStr = quickAddDate;
      if (!dateStr) {
        const week = weeksToShow[selectedWeek];
        const date = new Date(week[0]);
        date.setDate(date.getDate() + dayIdx);
        dateStr = date.toISOString().slice(0, 10);
      }
      
      await handleCreate({
        title: quickAddTitle,
        dates: [dateStr],
        start_time: quickAddStart,
        end_time: quickAddEnd,
        session_type: quickAddType
      });
      setQuickAddDay(null);
      setQuickAddTitle("");
      setQuickAddDate("");
      setQuickAddStart("");
      setQuickAddEnd("");
      setQuickAddType("regular");
    } catch (e) {
      showNotification('יצירת מפגש נכשלה', 'error');
    } finally {
      setQuickAddLoading(false);
    }
  };

  if (loading) return <div>טוען מפגשים...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="session-table-container">
      <button className="create-session-btn" onClick={() => { setFormMode('create'); setEditing(null); setShowForm(true); }}>הוסף מפגש</button>
      {/* Bulk Delete Controls - Collapsible */}
      <div style={{margin: '1rem 0', padding: '0.5rem', border: '1px solid #eee', borderRadius: 8, background: '#fafbfc', maxWidth: 600}}>
        <button onClick={()=>setBulkOpen(!bulkOpen)} style={{background:'#e53935',color:'#fff',border:'none',padding:'6px 16px',borderRadius:6,cursor:'pointer',fontWeight:600,marginBottom:bulkOpen?8:0}}>
          {bulkOpen ? 'הסתר מחיקת מפגשים מרובה' : 'הצג מחיקת מפגשים מרובה'}
        </button>
        {bulkOpen && (
          <form style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginTop:8}} onSubmit={e=>{e.preventDefault();handleBulkDelete();}}>
            <label style={{display:'flex',flexDirection:'column',fontWeight:500}}>מתאריך
              <input type="date" value={bulkStartDate} onChange={e=>setBulkStartDate(e.target.value)} style={{minWidth:110}} />
            </label>
            <label style={{display:'flex',flexDirection:'column',fontWeight:500}}>עד תאריך
              <input type="date" value={bulkEndDate} onChange={e=>setBulkEndDate(e.target.value)} style={{minWidth:110}} />
            </label>
            <label style={{display:'flex',flexDirection:'column',fontWeight:500}}>סוג
              <input type="text" placeholder="סוג אימון" value={bulkType} onChange={e=>setBulkType(e.target.value)} style={{minWidth:90}} />
            </label>
            <label style={{display:'flex',flexDirection:'column',fontWeight:500}}>מאמן
              <input type="text" placeholder="מאמן" value={bulkTrainer} onChange={e=>setBulkTrainer(e.target.value)} style={{minWidth:90}} />
            </label>
            <label style={{display:'flex',flexDirection:'column',fontWeight:500}}>סדרה
              <input type="text" placeholder="סדרה" value={bulkSeries} onChange={e=>setBulkSeries(e.target.value)} style={{minWidth:90}} />
            </label>
            <button type="submit" disabled={bulkLoading} style={{background:'#e53935',color:'#fff',border:'none',padding:'8px 16px',borderRadius:6,cursor:'pointer',fontWeight:600}}>
              {bulkLoading ? 'מוחק...' : 'מחק לפי טווח/פילטר'}
            </button>
            <button type="button" onClick={handleDeleteOld} disabled={bulkLoading} style={{background:'#ff9800',color:'#fff',border:'none',padding:'8px 16px',borderRadius:6,cursor:'pointer',fontWeight:600}}>
              {bulkLoading ? 'מוחק...' : 'מחק מפגשים ישנים (חצי שנה+)'}
            </button>
          </form>
        )}
      </div>
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
              {`${formatDateDDMMYYYY(start)} - ${formatDateDDMMYYYY(end)}`}
              {idx === 0 ? ' (השבוע הנוכחי)' : ' (שבוע הבא)'}
            </option>
          ))}
        </select>
      </div>
      {/* Day-of-week tabs with quick add */}
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
          <div key={day.key} style={{display:'flex',flexDirection:'column',alignItems:'center',margin:'0 2px'}}>
            <button
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
                whiteSpace: 'nowrap',
                marginBottom:2
              }}
              onClick={() => setActiveDay(day.key)}
            >
              {day.label}
            </button>
            <button
              style={{fontSize:12,padding:'2px 8px',borderRadius:4,background:'#4caf50',color:'#fff',border:'none',cursor:'pointer'}}
              onClick={()=>setQuickAddDay(day.key)}
            >הוסף מפגש</button>
            {/* Quick add form for this day */}
            {quickAddDay === day.key && (
              <form style={{background:'#fff',border:'1px solid #eee',borderRadius:8,padding:8,marginTop:4,boxShadow:'0 2px 8px #0001',zIndex:10,minWidth:280}} onSubmit={e=>{e.preventDefault();handleQuickAdd(day.key);}}>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <input placeholder="שם אימון" value={quickAddTitle} onChange={e=>setQuickAddTitle(e.target.value)} required style={{fontSize:13,padding:4,borderRadius:4,border:'1px solid #ccc'}} />
                  <div style={{fontSize:12,marginTop:4}}>
                    <DateTimePicker
                      selectedDate={quickAddDate}
                      startTime={quickAddStart}
                      endTime={quickAddEnd}
                      onDateChange={e => setQuickAddDate(e.target.value)}
                      onStartTimeChange={e => setQuickAddStart(e.target.value)}
                      onEndTimeChange={e => setQuickAddEnd(e.target.value)}
                      className="compact"
                    />
                  </div>
                  <select value={quickAddType} onChange={e=>setQuickAddType(e.target.value)} style={{fontSize:13,padding:4,borderRadius:4,border:'1px solid #ccc'}}>
                    <option value="regular">אימון רגיל</option>
                    <option value="blocked">זמן חסום</option>
                  </select>
                  <div style={{display:'flex',gap:4,marginTop:4}}>
                    <button type="submit" disabled={quickAddLoading} style={{background:'#4caf50',color:'#fff',border:'none',padding:'4px 10px',borderRadius:4,cursor:'pointer',fontWeight:600}}>{quickAddLoading ? 'שומר...' : 'שמור'}</button>
                    <button type="button" onClick={()=>setQuickAddDay(null)} style={{background:'#eee',color:'#333',border:'none',padding:'4px 10px',borderRadius:4,cursor:'pointer',fontWeight:600}}>ביטול</button>
                  </div>
                </div>
              </form>
            )}
          </div>
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
                <td>{session.date ? formatDateDDMMYYYY(session.date) : ''}</td>
                <td>{session.start_time && session.end_time ? `${session.start_time} - ${session.end_time}` : ''}</td>
                <td>
                  {(session.session_type === 'blocked') && '🚫 '}
                  {session.title}
                  {(session.session_type === 'blocked') && ' (זמן חסום)'}
                </td>
                <td>
                  {(session.session_type === 'blocked') ? 'לא רלוונטי' : (
                    <span
                      style={{
                        color: session.participants > 0 ? '#1e90ff' : '#333',
                        textDecoration: session.participants > 0 ? 'underline' : 'none',
                        cursor: session.participants > 0 ? 'pointer' : 'default',
                        fontWeight: 500
                      }}
                      onClick={() => session.participants > 0 && handleShowUsers(session)}
                    >
                      {session.participants}
                    </span>
                  )}
                </td>
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
      {/* Users popup */}
      {showUsersPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            minWidth: 320,
            maxWidth: 400,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            textAlign: 'center',
            fontFamily: 'inherit',
            position: 'relative'
          }}>
            <button onClick={handleClosePopup} style={{position:'absolute',top:12,right:16,fontSize:20,background:'none',border:'none',cursor:'pointer',color:'#1e90ff'}}>×</button>
            <h2 style={{marginBottom:16}}>נרשמים לאימון</h2>
            <div style={{fontWeight:600,marginBottom:8}}>{popupSessionTitle}</div>
            {popupLoading ? (
              <div>טוען...</div>
            ) : popupError ? (
              <div style={{color:'red'}}>{popupError}</div>
            ) : popupUsers.length === 0 ? (
              <div>אין נרשמים</div>
            ) : (
              <ul style={{listStyle:'none',padding:0,margin:0}}>
                {popupUsers.map(u => (
                  <li key={u.id} style={{padding:'8px 0',borderBottom:'1px solid #eee',fontSize:17}}>
                    <span style={{color:'#222',fontWeight:500}}>{u.email || u.name || '---'}</span>
                    {u.role === 'admin' && <span style={{color:'#888',fontSize:13,marginRight:8}}>(מנהל)</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTable;
