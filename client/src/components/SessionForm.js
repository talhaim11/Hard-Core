import React, { useState } from 'react';

const SessionForm = ({ initial, onSubmit, onCancel }) => {
  // Split initial date_time into date and time if available
  let initialDate = '', initialTime = '';
  if (initial?.date_time) {
    const dt = new Date(initial.date_time);
    initialDate = dt.toISOString().slice(0, 10);
    initialTime = dt.toTimeString().slice(0, 5);
  }
  const [title, setTitle] = useState(initial?.title || '');
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [location, setLocation] = useState(initial?.location || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) return;
    // Combine date and time into ISO string
    const date_time = new Date(`${date}T${time}`).toISOString();
    onSubmit({ title, date_time, location });
  };

  return (
    <form className="session-form" onSubmit={handleSubmit} dir="rtl">
      <label>שם אימון
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </label>
      <label>תאריך
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </label>
      <label>שעה
        <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
      </label>
      <label>מיקום
        <input value={location} onChange={e => setLocation(e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="submit">שמור</button>
        <button type="button" onClick={onCancel}>ביטול</button>
      </div>
    </form>
  );
};

export default SessionForm;
