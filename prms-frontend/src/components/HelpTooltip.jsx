import React, { useState, useRef, useEffect } from 'react';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';

const HelpTooltip = ({ 
  content, 
  position = "top", 
  size = "sm",
  trigger = "hover",
  className = "",
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const positions = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  };

  const sizes = {
    sm: "text-xs max-w-xs",
    md: "text-sm max-w-sm",
    lg: "text-base max-w-md"
  };

  const handleMouseEnter = () => {
    if (trigger === "hover" && !isPinned) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover" && !isPinned) {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === "click") {
      setIsVisible(!isVisible);
      setIsPinned(!isPinned);
    }
  };

  const handlePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsVisible(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsPinned(false);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        if (trigger === "click") {
          setIsVisible(false);
          setIsPinned(false);
        }
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, trigger]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Element */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-help"
      >
        {children || (
          <FaQuestionCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
        )}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 bg-gray-900 text-white rounded-lg shadow-lg p-3 ${positions[position]} ${sizes[size]} ${
            position === 'top' ? 'arrow-down' : 
            position === 'bottom' ? 'arrow-up' : 
            position === 'left' ? 'arrow-right' : 'arrow-left'
          }`}
        >
          {/* Close button for pinned tooltips */}
          {isPinned && (
          <button
            onClick={handleClose}
            className="absolute top-1 right-1 p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaTimes className="w-3 h-3" />
          </button>
          )}

          {/* Pin/Unpin button */}
          <button
            onClick={handlePin}
            className={`absolute top-1 ${isPinned ? 'right-8' : 'right-1'} p-1 hover:bg-gray-700 rounded-full transition-colors`}
            title={isPinned ? "Unpin tooltip" : "Pin tooltip"}
          >
            📌
          </button>

          {/* Content */}
          <div className="pr-6">
            {typeof content === 'string' ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              content
            )}
          </div>

          {/* Arrow */}
          <div className={`absolute w-0 h-0 ${
            position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900' :
            position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900' :
            position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900' :
            'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
          }`} />
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;

