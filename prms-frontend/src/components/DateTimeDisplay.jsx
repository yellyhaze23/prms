import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (date) => {
    const options = {
      timeZone: 'Asia/Manila',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date) => {
    const options = {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };

    return date.toLocaleTimeString('en-US', options);
  };

  const handleCalendarClick = (e) => {
    e.stopPropagation();
    setShowCalendar(!showCalendar);
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Time Display - Just Icon and Time */}
      <div className="flex items-center space-x-2">
        <FaClock className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-800 font-semibold">
          {formatTime(currentDateTime)}
        </span>
      </div>

      {/* Clickable Calendar Icon */}
      <div className="relative" ref={calendarRef}>
        <button
          onClick={handleCalendarClick}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Click to view calendar"
        >
          <FaCalendarAlt className="w-5 h-5" />
        </button>

        {/* Calendar Dropdown */}
        {showCalendar && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[99999]" style={{zIndex: 99999}}>
            <div className="p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Calendar</h3>
                <p className="text-sm text-gray-600">{formatDate(currentDateTime)}</p>
              </div>
              
              {/* Simple Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Days of week */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-xs font-medium text-gray-500">{day}</div>
                ))}
                
                {/* Calendar days - simplified version */}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 6; // Adjust for first week
                  const isCurrentMonth = day > 0 && day <= 31;
                  const isToday = day === new Date().getDate();
                  
                  return (
                    <button
                      key={i}
                      className={`p-2 text-xs rounded hover:bg-blue-100 transition-colors ${
                        isCurrentMonth 
                          ? isToday 
                            ? 'bg-blue-500 text-white font-semibold' 
                            : 'text-gray-700 hover:text-blue-600'
                          : 'text-gray-300'
                      }`}
                    >
                      {isCurrentMonth ? day : ''}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Current time: {formatTime(currentDateTime)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeDisplay;
