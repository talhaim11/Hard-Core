import React, { useState, useEffect, useRef } from 'react';
import CustomTimeInput from './CustomTimeInput';

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
        
        // Force the browser to use 24-hour format
        const observer = new MutationObserver(() => {
          const ampmField = input.shadowRoot?.querySelector('[part="ampm-field"]') || 
                          document.querySelector('input[type="time"]::-webkit-datetime-edit-ampm-field');
          if (ampmField) {
            ampmField.style.display = 'none';
            ampmField.style.width = '0';
            ampmField.style.visibility = 'hidden';
          }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Override the value setter to ensure 24-hour format
        const originalSetValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        const newSetValue = function(val) {
          if (val && val.includes('M')) {
            // Convert AM/PM format to 24-hour
            const time = val.replace(/\s*(AM|PM)/i, '');
            const [hours, minutes] = time.split(':');
            let hour24 = parseInt(hours);
            
            if (val.toUpperCase().includes('PM') && hour24 !== 12) {
              hour24 += 12;
            } else if (val.toUpperCase().includes('AM') && hour24 === 12) {
              hour24 = 0;
            }
            
            val = `${hour24.toString().padStart(2, '0')}:${minutes}`;
          }
          originalSetValue.call(this, val);
        };
        
        Object.defineProperty(input, 'value', {
          get: Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').get,
          set: newSetValue
        });
        
        // Add event listeners to force format
        input.addEventListener('input', (e) => {
          if (e.target.value && e.target.value.includes('M')) {
            const time = e.target.value.replace(/\s*(AM|PM)/i, '');
            const [hours, minutes] = time.split(':');
            let hour24 = parseInt(hours);
            
            if (e.target.value.toUpperCase().includes('PM') && hour24 !== 12) {
              hour24 += 12;
            } else if (e.target.value.toUpperCase().includes('AM') && hour24 === 12) {
              hour24 = 0;
            }
            
            e.target.value = `${hour24.toString().padStart(2, '0')}:${minutes}`;
          }
        });
        
        // Additional CSS injection
        const style = document.createElement('style');
        style.textContent = `
          input[type="time"]::-webkit-datetime-edit-ampm-field {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
            visibility: hidden !important;
            position: absolute !important;
            left: -9999px !important;
            opacity: 0 !important;
            overflow: hidden !important;
            pointer-events: none !important;
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
        <CustomTimeInput
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          required
        />
      </label>
      <label>שעת סיום
        <CustomTimeInput
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          required
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
