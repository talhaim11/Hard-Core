import React, { useState } from 'react';

const MAX_MONTHS_AHEAD = 3;
const frequencies = [
  { value: 'once', label: 'פעם אחת' },
  { value: 'daily', label: 'כל יום' },
  { value: 'weekly', label: 'כל שבוע' },
];

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
  const [frequency, setFrequency] = useState('once');
  const [endDate, setEndDate] = useState('');

  // Calculate max end date (3 months from selected start date)
  const maxEndDate = date ? new Date(new Date(date).setMonth(new Date(date).getMonth() + MAX_MONTHS_AHEAD)).toISOString().slice(0, 10) : '';

  const generateDates = () => {
    if (frequency === 'once' || !endDate) return [new Date(`${date}T${time}`)];
    const start = new Date(`${date}T${time}`);
    const end = new Date(`${endDate}T${time}`);
    let dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      if (frequency === 'daily') current.setDate(current.getDate() + 1);
      else if (frequency === 'weekly') current.setDate(current.getDate() + 7);
    }
    return dates;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) return;
    const dates = generateDates().map(dt => dt.toISOString());
    onSubmit({ title, dates, location });
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
      <label>חזרתיות
        <select value={frequency} onChange={e => setFrequency(e.target.value)}>
          {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </label>
      {frequency !== 'once' && (
        <label>עד תאריך (מקסימום 3 חודשים)
          <input type="date" value={endDate} min={date} max={maxEndDate} onChange={e => setEndDate(e.target.value)} required />
        </label>
      )}
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
