import React, { useState } from 'react';
import './DateTimePicker.css';

const DateTimePicker = ({ 
  selectedDate, 
  startTime, 
  endTime, 
  onDateChange, 
  onStartTimeChange, 
  onEndTimeChange 
}) => {
  const [showTimePicker, setShowTimePicker] = useState(null); // 'start' or 'end'
  const [tempTime, setTempTime] = useState({ hours: 0, minutes: 0 });

  const openTimePicker = (type) => {
    const currentTime = type === 'start' ? startTime : endTime;
    if (currentTime) {
      const [hours, minutes] = currentTime.split(':').map(Number);
      setTempTime({ hours, minutes });
    } else {
      setTempTime({ hours: 9, minutes: 0 });
    }
    setShowTimePicker(type);
  };

  const selectTime = (hours, minutes) => {
    setTempTime({ hours, minutes });
  };

  const confirmTime = () => {
    const formattedTime = `${tempTime.hours.toString().padStart(2, '0')}:${tempTime.minutes.toString().padStart(2, '0')}`;
    if (showTimePicker === 'start') {
      onStartTimeChange({ target: { value: formattedTime } });
    } else {
      onEndTimeChange({ target: { value: formattedTime } });
    }
    setShowTimePicker(null);
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        times.push({ hour: h, minute: m });
      }
    }
    return times;
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="datetime-picker">
      {/* Date Section */}
      <label>תאריך
        <input 
          type="date" 
          value={selectedDate} 
          onChange={onDateChange} 
          required 
          className="date-input"
        />
      </label>

      {/* Time Selection Section */}
      <div className="time-selection-container">
        <div className="time-row">
          <label>זמני האימון</label>
          <div className="time-buttons">
            <button
              type="button"
              className="time-button start-time"
              onClick={() => openTimePicker('start')}
            >
              <span className="time-label">שעת התחלה</span>
              <span className="time-value">{formatTime(startTime)}</span>
            </button>
            
            <div className="time-separator">-</div>
            
            <button
              type="button"
              className="time-button end-time"
              onClick={() => openTimePicker('end')}
            >
              <span className="time-label">שעת סיום</span>
              <span className="time-value">{formatTime(endTime)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clock Time Picker Modal */}
      {showTimePicker && (
        <div className="time-picker-modal">
          <div className="time-picker-content">
            <div className="time-picker-header">
              <h3>{showTimePicker === 'start' ? 'בחר שעת התחלה' : 'בחר שעת סיום'}</h3>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => setShowTimePicker(null)}
              >
                ×
              </button>
            </div>
            
            <div className="digital-time-display">
              {`${tempTime.hours.toString().padStart(2, '0')}:${tempTime.minutes.toString().padStart(2, '0')}`}
            </div>
            
            <div className="clock-container">
              <div className="clock-face">
                {/* Hour markers */}
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={`hour-${i}`}
                    className={`hour-marker ${tempTime.hours === i ? 'active' : ''}`}
                    style={{
                      transform: `rotate(${(i * 15)}deg) translateY(-80px)`,
                      transformOrigin: 'center 80px'
                    }}
                    onClick={() => selectTime(i, tempTime.minutes)}
                  >
                    <span style={{ transform: `rotate(-${i * 15}deg)` }}>
                      {i.toString().padStart(2, '0')}
                    </span>
                  </div>
                ))}
                
                {/* Center dot */}
                <div className="clock-center"></div>
                
                {/* Hour hand */}
                <div 
                  className="clock-hand hour-hand"
                  style={{ transform: `rotate(${tempTime.hours * 15}deg)` }}
                ></div>
              </div>
              
              {/* Minutes slider */}
              <div className="minutes-section">
                <label>דקות: {tempTime.minutes.toString().padStart(2, '0')}</label>
                <input
                  type="range"
                  min="0"
                  max="55"
                  step="5"
                  value={tempTime.minutes}
                  onChange={(e) => setTempTime({ ...tempTime, minutes: parseInt(e.target.value) })}
                  className="minutes-slider"
                />
                <div className="minutes-labels">
                  <span>00</span>
                  <span>15</span>
                  <span>30</span>
                  <span>45</span>
                </div>
              </div>
            </div>
            
            <div className="time-picker-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowTimePicker(null)}
              >
                ביטול
              </button>
              <button 
                type="button" 
                className="confirm-btn"
                onClick={confirmTime}
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
