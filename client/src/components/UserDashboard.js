import React, { useEffect, useState } from 'react';
import { fetchUserSessions, getUserProfile, fetchSessions, registerSession, cancelSession, updateUserProfile } from './api';
import { API_BASE } from '../config';
import axios from 'axios';
import '../styles/UserDashboard.css';

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

const UserDashboard = () => {
  // Week picker state
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({ name: '', email: '', password: '' });
  const [achievements, setAchievements] = useState([]);
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  // Helper: get current week (Sun-Sat) and next week
  function getCurrentAndNextWeek(date) {
    const curr = new Date(date);
    const day = curr.getDay();
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - day);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    const nextSunday = new Date(sunday);
    nextSunday.setDate(sunday.getDate() + 7);
    const nextSaturday = new Date(nextSunday);
    nextSaturday.setDate(nextSunday.getDate() + 6);
    return [ [sunday, saturday], [nextSunday, nextSaturday] ];
  }

  const today = new Date();
  const weeksToShow = getCurrentAndNextWeek(today);
  // Filter allSessions by selected week
  const sessionsInWeek = allSessions.filter(session => {
    if (!session.date) return false;
    const d = new Date(session.date);
    const [weekStart, weekEnd] = weeksToShow[selectedWeek];
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const sessionData = await fetchUserSessions();
        setSessions(sessionData.sessions || []);
        const profileData = await getUserProfile();
        setProfile(profileData);
        setEditProfile({ name: profileData.name || '', email: profileData.email || '', password: '' });
        const all = await fetchSessions();
        setAllSessions(all.sessions || []);
        
        // Fetch subscription status
        const token = localStorage.getItem('token');
        const subResponse = await axios.get(`${API_BASE}/user/subscription-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubscriptionStatus(subResponse.data);
        
        // Simulate notifications and achievements (replace with API calls if available)
        setNotifications([
          { id: 1, message: 'אימון חדש נוסף למערכת!', date: '2025-06-24' },
          { id: 2, message: 'זכית בתג "נוכחות 10"!', date: '2025-06-20' }
        ]);
        setAchievements([
          { id: 1, label: '10 אימונים', achieved: sessionData.sessions.length >= 10 },
          { id: 2, label: 'רצף 5 ימים', achieved: maxStreak >= 5 }
        ]);
      } catch (e) {
        console.error('Error loading data:', e);
        setSessions([]);
        setProfile(null);
        setAllSessions([]);
        setNotifications([]);
        setAchievements([]);
        setSubscriptionStatus(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  // Attendance streak calculation
  const attendanceDates = sessions.map(s => s.date_time && s.date_time.slice(0, 10)).filter(Boolean).sort();
  let streak = 0, maxStreak = 0, prevDate = null;
  attendanceDates.forEach(dateStr => {
    const date = new Date(dateStr);
    if (prevDate) {
      const diff = (date - prevDate) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else streak = 1;
    } else {
      streak = 1;
    }
    if (streak > maxStreak) maxStreak = streak;
    prevDate = date;
  });

  // Session registration/cancellation
  const handleRegister = async (sessionId) => {
    try {
      await registerSession(sessionId);
      setMessage('נרשמת בהצלחה!');
      // Refresh sessions
      const sessionData = await fetchUserSessions();
      setSessions(sessionData.sessions || []);
    } catch {
      setMessage('שגיאה בהרשמה');
    }
  };
  const handleCancel = async (sessionId) => {
    try {
      await cancelSession(sessionId);
      setMessage('ביטלת את ההרשמה');
      const sessionData = await fetchUserSessions();
      setSessions(sessionData.sessions || []);
    } catch {
      setMessage('שגיאה בביטול הרשמה');
    }
  };

  // Profile editing
  const handleProfileEdit = () => setEditMode(true);
  const handleProfileSave = async () => {
    try {
      await updateUserProfile(editProfile);
      setMessage('הפרופיל עודכן!');
      setEditMode(false);
      const profileData = await getUserProfile();
      setProfile(profileData);
    } catch {
      setMessage('שגיאה בעדכון פרופיל');
    }
  };

  if (loading) return <div>טוען נתונים...</div>;

  const handleLogout = () => {
    // Remove token/localStorage and redirect to site root
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="user-dashboard">
      <div className="welcome-message">No pain, no gain.</div>
      <h2 style={{textAlign:'center', marginBottom:'2rem'}}>הדשבורד שלי</h2>
      
      {/* Subscription Status */}
      {subscriptionStatus && (
        <div className="subscription-status-box">
          <h4>סטטוס מנוי</h4>
          {subscriptionStatus.has_valid_subscription ? (
            <div className="valid-subscription">
              <div className="status-indicator valid">✅ מנוי פעיל</div>
              {subscriptionStatus.subscriptions.map((sub, index) => (
                sub.is_valid && (
                  <div key={index} className="subscription-detail">
                    <strong>{sub.status_text}</strong>
                    {sub.days_remaining !== undefined && (
                      <div className="days-remaining">
                        נותרו {sub.days_remaining} ימים
                      </div>
                    )}
                    {sub.remaining_entries !== undefined && (
                      <div className="entries-remaining">
                        נותרו {sub.remaining_entries} אימונים
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="no-subscription">
              <div className="status-indicator invalid">❌ אין מנוי פעיל</div>
              <p>אנא פנה למנהל כדי להפעיל מנוי</p>
            </div>
          )}
        </div>
      )}
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-box">
          <h4>הודעות</h4>
          <ul>
            {notifications.map(n => (
              <li key={n.id}>{n.message} <span style={{fontSize:'0.8em',color:'#888'}}>({n.date})</span></li>
            ))}
          </ul>
        </div>
      )}
      {/* Profile */}
      {profile && !editMode && (
        <div className="profile-box">
          <div>שם משתמש: {profile.email}</div>
          <div>שם: {profile.name || '-'}</div>
          <button onClick={handleProfileEdit}>ערוך פרופיל</button>
        </div>
      )}
      {editMode && (
        <div className="profile-edit-box">
          <label>שם: <input value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} /></label><br />
          <label>שם משתמש: <input value={editProfile.email} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} /></label><br />
          <label>סיסמה חדשה: <input type="password" value={editProfile.password} onChange={e => setEditProfile({ ...editProfile, password: e.target.value })} /></label><br />
          <button onClick={handleProfileSave}>שמור</button>
          <button onClick={() => setEditMode(false)} style={{marginLeft:8}}>ביטול</button>
        </div>
      )}
      <div className="stats-section">
        <h3>הסטטיסטיקות שלי</h3>
        <div className="stats-box">
          <div>סה"כ מפגשים שנכחת: {sessions.length}</div>
          <div>רצף נוכחות מקסימלי: {maxStreak}</div>
        </div>
      </div>
      {/* Achievements */}
      <div className="attendance-section">
        <h3>הישגים</h3>
        <ul className="achievements-list">
          {achievements.map(a => (
            <li key={a.id} style={{color: a.achieved ? 'green' : '#aaa'}}>
              {a.label} {a.achieved ? '🏅' : ''}
            </li>
          ))}
        </ul>
      </div>
      <div className="sessions-section">
        <h3>המפגשים שלי</h3>
        {sessions.length === 0 ? (
          <div>אין מפגשים רשומים</div>
        ) : (
          <ul className="sessions-list">
            {sessions.map(s => (
              <li key={s.id}>
                <span>{s.title} - {s.date ? new Date(s.date).toLocaleDateString() : ''} {s.start_time && s.end_time ? `(${s.start_time} - ${s.end_time})` : ''}</span>
                <button onClick={() => handleCancel(s.id)}>בטל הרשמה</button>
              </li>
            ))}
          </ul>
        )}
        <h3 style={{marginTop:'2rem'}}>הרשמה למפגשים</h3>
        <input
          type="text"
          placeholder="חפש לפי שם אימון..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{marginBottom:8}}
        />
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
        <ul className="register-list">
          {sessionsByDay[activeDay] && sessionsByDay[activeDay].length > 0 ? (
            sessionsByDay[activeDay].filter(s => !filter || (s.title && s.title.toLowerCase().includes(filter.toLowerCase()))).map(s => (
              <li key={s.id} style={{ 
                opacity: s.session_type === 'blocked' ? 0.8 : 1,
                background: s.session_type === 'blocked' ? '#fff3e0' : 'transparent',
                color: s.session_type === 'blocked' ? '#e65100' : 'inherit',
                padding: '8px',
                borderRadius: '4px',
                margin: '4px 0'
              }}>
                <span>
                  {s.session_type === 'blocked' && '🚫 '}
                  {s.title} - {s.date ? new Date(s.date).toLocaleDateString() : ''} {s.start_time && s.end_time ? `(${s.start_time} - ${s.end_time})` : ''}
                  {s.session_type === 'blocked' ? ' - זמן חסום' : ` | משתתפים: ${s.participants}`}
                </span>
                {s.session_type === 'blocked' ? (
                  <span style={{color:'#666',marginRight:8,fontStyle:'italic'}}>לא ניתן להירשם</span>
                ) : sessions.some(us => us.id === s.id) ? (
                  <span style={{color:'green',marginRight:8}}>נרשמת</span>
                ) : (
                  <button onClick={() => handleRegister(s.id)}>הירשם</button>
                )}
              </li>
            ))
          ) : (
            <li style={{ textAlign: 'center' }}>אין מפגשים ליום זה</li>
          )}
        </ul>
        {message && <div style={{color:'blue',marginTop:8}}>{message}</div>}
      </div>
      {/* Logout button at the bottom */}
      <button className="logout-btn" onClick={handleLogout}>התנתק</button>
    </div>
  );
};

export default UserDashboard;
