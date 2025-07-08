import React, { useState, useEffect } from 'react';

const CustomTimeInput = ({ value, onChange, required, className, style }) => {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  // Parse the initial value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h || '');
      setMinutes(m || '');
    }
  }, [value]);

  // Update parent when hours or minutes change
  useEffect(() => {
    if (hours && minutes) {
      const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      onChange({ target: { value: formattedTime } });
    }
  }, [hours, minutes, onChange]);

  const handleHoursChange = (e) => {
    const val = e.target.value;
    if (val === '' || (val >= 0 && val <= 23)) {
      setHours(val);
    }
  };

  const handleMinutesChange = (e) => {
    const val = e.target.value;
    if (val === '' || (val >= 0 && val <= 59)) {
      setMinutes(val);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '4px',
      background: '#ffffff',
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '0.5rem',
      ...style 
    }}>
      <input
        type="number"
        value={hours}
        onChange={handleHoursChange}
        placeholder="שעה"
        min="0"
        max="23"
        required={required}
        style={{
          width: '50px',
          border: 'none',
          background: 'transparent',
          color: '#000',
          textAlign: 'center',
          fontSize: 'inherit'
        }}
      />
      <span style={{ color: '#000', fontWeight: 'bold' }}>:</span>
      <input
        type="number"
        value={minutes}
        onChange={handleMinutesChange}
        placeholder="דקה"
        min="0"
        max="59"
        required={required}
        style={{
          width: '50px',
          border: 'none',
          background: 'transparent',
          color: '#000',
          textAlign: 'center',
          fontSize: 'inherit'
        }}
      />
    </div>
  );
};

export default CustomTimeInput;
