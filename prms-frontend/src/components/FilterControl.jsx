import React, { useEffect, useRef, useState } from 'react';

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

export default function FilterControl({
  label = 'Filter',
  value,
  options,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const active = options.find(o => o.value === value);

  return (
    <div className="relative z-10" ref={ref}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{label}:</span>
        <button
          type="button"
          onClick={() => setOpen(p => !p)}
          className="inline-flex items-center justify-between min-w-[10rem] px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate text-sm">{active ? active.label : 'All'}</span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.187l3.71-3.956a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0l-4.24-4.52a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {open && (
        <ul role="listbox" className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {options.map(opt => (
            <li key={opt.value}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
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


