import React, { useState, useRef, useEffect } from 'react';

function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutside();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onOutside]);
}

// Modern sort control with popover menu and arrow toggle
export default function SortControl({
  value,
  order = 'asc',
  options,
  onChange,
  onToggleOrder
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  useOutsideClick(containerRef, () => setOpen(false));

  const active = options.find(o => o.value === value);

  return (
    <div className="relative z-10" ref={containerRef}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-gray-700 text-sm whitespace-nowrap">{active ? active.label : 'Sort'}</span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.187l3.71-3.956a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0l-4.24-4.52a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onToggleOrder}
          className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          title={order === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
        >
          {order === 'asc' ? (
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 11h6m-6 4h2m7-7v10m0 0l-3-3m3 3l3-3" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 11h6m-6 4h2m7 7V9m0 0l3 3m-3-3l-3 3" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
        >
          {options.map(opt => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${opt.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                role="option"
                aria-selected={opt.value === value}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


