import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AttendanceBoard.css';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6:00 to 20:00
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDatesForTwoWeeks(startDate) {
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(new Date(d));
  }
  return dates;
}

export default function AttendanceBoard({ token, isAdmin }) {
  const [attendance, setAttendance] = useState({});
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState({});

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      const res = await axios.get('/attendance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data.attendance);
      // Calculate dates for 2 weeks
      const start = new Date(res.data.start);
      setDates(getDatesForTwoWeeks(start));
      setLoading(false);
    };
    fetchAttendance();
  }, [token]);

  const handleCellClick = (date, hour, myAttendance) => {
    setSelected({ date, hour });
    setNote(myAttendance ? myAttendance.note : '');
  };

  const handleSave = async () => {
    if (!selected.date || selected.hour == null) return;
    await axios.post('/attendance', {
      date: selected.date,
      hour: selected.hour,
      note,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSelected({});
    setNote('');
    // Refresh
    const res = await axios.get('/attendance', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAttendance(res.data.attendance);
  };

  if (loading) return <div>Loading attendance...</div>;

  return (
    <div className="attendance-board">
      <h2>Gym Attendance (2 Weeks)</h2>
      <div className="calendar-grid">
        <div className="calendar-header">
          <div className="calendar-cell hour-label"></div>
          {dates.map((date, idx) => (
            <div key={idx} className="calendar-cell day-label">
              {WEEKDAYS[date.getDay()]}<br />
              {date.toLocaleDateString()}
            </div>
          ))}
        </div>
        {HOURS.map(hour => (
          <div className="calendar-row" key={hour}>
            <div className="calendar-cell hour-label">{hour}:00</div>
            {dates.map((date, idx) => {
              const dateStr = date.toISOString().slice(0, 10);
              const slot = (attendance[dateStr] && attendance[dateStr][hour]) || [];
              const myAttendance = slot.find(u => u.email === localStorage.getItem('email'));
              return (
                <div
                  key={idx}
                  className={`calendar-cell slot-cell ${myAttendance ? 'my-slot' : ''}`}
                  onClick={() => handleCellClick(dateStr, hour, myAttendance)}
                >
                  {slot.length > 0 && (
                    <div className="slot-users">
                      {slot.map(u => (
                        <div key={u.user_id} className="slot-user">
                          {u.email} {u.note && <span className="slot-note">({u.note})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {myAttendance && <span className="slot-mine">✔</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {selected.date && (
        <div className="attendance-form">
          <h3>Update Attendance for {selected.date} at {selected.hour}:00</h3>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            rows={2}
            style={{ width: '100%' }}
          />
          <br />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setSelected({})} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
