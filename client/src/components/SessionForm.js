import React, { useState, useEffect, useRef } from 'react';

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
  const [sessionType, setSessionType] = useState(initial?.session_type || 'regular');
  
  // Refs for time inputs to force 24-hour format
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  // Force 24-hour format on time inputs
  useEffect(() => {
    const force24Hour = (input) => {
      if (input) {
        // Set attributes to force 24-hour format
        input.setAttribute('step', '60');
        input.setAttribute('data-format', '24');
        
        // Try to force locale that uses 24-hour format
        try {
          if (input.showPicker) {
            input.addEventListener('focus', () => {
              // Force 24-hour format by setting locale
              document.documentElement.setAttribute('lang', 'en-GB');
            });
          }
        } catch (e) {
          console.log('Browser does not support showPicker');
        }
        
        // Hide AM/PM with more aggressive CSS
        const style = document.createElement('style');
        style.textContent = `
          input[type="time"]::-webkit-datetime-edit-ampm-field {
            display: none !important;
            width: 0 !important;
            visibility: hidden !important;
          }
        `;
        if (!document.head.querySelector('style[data-time-24h]')) {
          style.setAttribute('data-time-24h', 'true');
          document.head.appendChild(style);
        }
      }
    };

    force24Hour(startTimeRef.current);
    force24Hour(endTimeRef.current);
  }, []);

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
    onSubmit({ title, dates, start_time: startTime, end_time: endTime, session_type: sessionType });
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
        <input 
          ref={startTimeRef}
          type="time" 
          value={startTime} 
          onChange={e => setStartTime(e.target.value)} 
          step="60" 
          required 
          className="admin-time-input"
          data-format="24"
        />
      </label>
      <label>שעת סיום
        <input 
          ref={endTimeRef}
          type="time" 
          value={endTime} 
          onChange={e => setEndTime(e.target.value)} 
          step="60" 
          required 
          className="admin-time-input"
          data-format="24"
        />
      </label>
      <label>סוג אימון
        <select value={sessionType} onChange={e => setSessionType(e.target.value)}>
          <option value="regular">אימון רגיל</option>
          <option value="blocked">זמן חסום (מאמן אישי)</option>
        </select>
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
