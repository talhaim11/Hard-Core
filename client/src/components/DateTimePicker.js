import React, { useState } from 'react';
import './DateTimePicker.css';

const DateTimePicker = ({ 
  selectedDate, 
  startTime, 
  endTime, 
  onDateChange, 
  onStartTimeChange, 
  onEndTimeChange,
  className = ''
}) => {
  const [showTimePicker, setShowTimePicker] = useState(null); // 'start' or 'end'

  const openTimePicker = (type) => {
    setShowTimePicker(type);
  };

  const selectTime = (hours, minutes = 0) => {
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    if (showTimePicker === 'start') {
      onStartTimeChange({ target: { value: formattedTime } });
    } else {
      onEndTimeChange({ target: { value: formattedTime } });
    }
    // Immediately close the picker after selection
    setShowTimePicker(null);
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // Handle date input click to ensure native picker opens
  const handleDateClick = (e) => {
    // Force focus and trigger click on the input to open date picker
    e.target.focus();
    if (e.target.showPicker) {
      e.target.showPicker();
    }
  };

  return (
    <div className={`datetime-picker ${className}`}>
      {/* Date Section */}
      <label>תאריך
        <input 
          type="date" 
          value={selectedDate} 
          onChange={onDateChange} 
          onClick={handleDateClick}
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
              {showTimePicker === 'start' ? formatTime(startTime) : formatTime(endTime)}
            </div>
            
            <div className="clock-container">
              <div className="clock-face">
                {/* Hour markers - 1 to 24 */}
                {Array.from({ length: 24 }, (_, i) => {
                  const hourValue = i + 1; // Display 1-24 instead of 0-23
                  const currentTime = showTimePicker === 'start' ? startTime : endTime;
                  const currentHour = currentTime ? parseInt(currentTime.split(':')[0]) : null;
                  const isActive = currentHour === hourValue;
                  
                  // Calculate position using polar coordinates
                  const angle = ((i * 15) - 90) * (Math.PI / 180); // Convert to radians, start from top
                  const radius = 140; // Distance from center
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={`hour-${hourValue}`}
                      className={`hour-marker ${isActive ? 'active' : ''}`}
                      style={{
                        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
                      }}
                      onClick={() => {
                        selectTime(hourValue, 0); // Always set minutes to 0
                      }}
                    >
                      {hourValue}
                    </div>
                  );
                })}
                
                {/* Center dot */}
                <div className="clock-center"></div>
                
                {/* Hour hand */}
                {(showTimePicker === 'start' ? startTime : endTime) && (
                  <div 
                    className="clock-hand hour-hand"
                    style={{ 
                      transform: `rotate(${
                        parseInt((showTimePicker === 'start' ? startTime : endTime).split(':')[0]) * 15 - 90
                      }deg)` 
                    }}
                  ></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
