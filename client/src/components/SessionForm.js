import React, { useState } from 'react';

const SessionForm = ({ initial, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [date_time, setDateTime] = useState(initial?.date_time ? initial.date_time.slice(0, 16) : '');
  const [location, setLocation] = useState(initial?.location || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, date_time, location });
  };

  return (
    <form className="session-form" onSubmit={handleSubmit}>
      <label>שם אימון
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </label>
      <label>תאריך ושעה
        <input type="datetime-local" value={date_time} onChange={e => setDateTime(e.target.value)} required />
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
