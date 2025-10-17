import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  debounceMs = 300,
  className = ''
}) {
  const [internal, setInternal] = useState(value || '');
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) return;
    setInternal(value || '');
  }, [value]);

  useEffect(() => {
    mounted.current = true;
  }, []);

  const debounced = useMemo(() => {
    let timeout;
    return (val) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => onChange && onChange(val), debounceMs);
    };
  }, [onChange, debounceMs]);

  const handleInput = (e) => {
    const val = e.target.value;
    setInternal(val);
    debounced(val);
  };

  const clear = () => {
    setInternal('');
    onChange && onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={internal}
        onChange={handleInput}
        placeholder={placeholder}
        className="w-80 pl-10 pr-9 py-2 rounded-xl border border-gray-200 bg-white/90 shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
      />
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {internal && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.707-9.293a1 1 0 011.414 0L10 8.586l.293-.293a1 1 0 111.414 1.414L11.414 10l.293.293a1 1 0 01-1.414 1.414L10 11.414l-.293.293a1 1 0 01-1.414-1.414L8.586 10l-.293-.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}


