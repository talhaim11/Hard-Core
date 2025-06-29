import React, { useState } from 'react';

const MAX_MONTHS_AHEAD = 3;
const frequencies = [
  { value: 'once', label: 'פעם אחת' },
  { value: 'daily', label: 'כל יום' },
  { value: 'weekly', label: 'כל שבוע' },
];

const SessionForm = ({ initial, onSubmit, onCancel }) => {
  // Split initial data into separate fields if available
  let initialDate = '', initialStartTime = '', initialEndTime = '';
  if (initial) {
    initialDate = initial.date || '';
    initialStartTime = initial.start_time || '';
    initialEndTime = initial.end_time || '';
  }
  
  const [title, setTitle] = useState(initial?.title || '');
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [frequency, setFrequency] = useState('once');
  const [endDate, setEndDate] = useState('');

  // Calculate max end date (3 months from selected start date)
  const maxEndDate = date ? new Date(new Date(date).setMonth(new Date(date).getMonth() + MAX_MONTHS_AHEAD)).toISOString().slice(0, 10) : '';

  const generateDates = () => {
    if (frequency === 'once' || !endDate) return [date];
    const start = new Date(date);
    const end = new Date(endDate);
    let dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      if (frequency === 'daily') current.setDate(current.getDate() + 1);
      else if (frequency === 'weekly') current.setDate(current.getDate() + 7);
    }
    return dates;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !title) return;
    const dates = generateDates();
    onSubmit({ title, dates, start_time: startTime, end_time: endTime });
  };

  return (
    <form className="session-form" onSubmit={handleSubmit} dir="rtl">
      <label>שם אימון
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </label>
      <label>תאריך
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </label>
      <label>שעת התחלה
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
      </label>
      <label>שעת סיום
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
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
      <div className="form-actions">
        <button type="submit">שמור</button>
        <button type="button" onClick={onCancel}>ביטול</button>
      </div>
    </form>
  );
};

export default SessionForm;
