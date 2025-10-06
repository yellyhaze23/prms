import React, { useState } from 'react';

export default function StaffRecords() {
  const [patientId, setPatientId] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Medical Records</h1>
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-slate-700">
            Patient ID
            <input value={patientId} onChange={(e)=>setPatientId(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="Enter patient ID" />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Notes
            <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 min-h-[120px]" placeholder="Enter visit notes..." />
          </label>
        </div>
        <div className="mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled>Save Record (placeholder)</button>
        </div>
      </div>
    </div>
  );
}
