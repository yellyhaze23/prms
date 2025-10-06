import React from 'react';

export default function Header({ title = 'Staff Portal', subtitle }) {
  return (
    <header className="bg-white border-b border-slate-200/70 py-4 px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
        </div>
        <div className="text-xs text-slate-500">
          <span className="hidden sm:inline">Last updated:</span> {new Date().toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
}
