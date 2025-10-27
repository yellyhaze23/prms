import React, { useState } from 'react';

export default function AddPatientModal({ onClose, onSaved }) {
  const [full_name, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [address, setAddress] = useState('');
  const [contact_number, setContactNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isValid = () => {
    if (!full_name.trim()) return 'Full Name is required';
    if (!age || isNaN(Number(age)) || Number(age) < 0) return 'Valid Age is required';
    if (!sex) return 'Sex is required';
    if (!address.trim()) return 'Address is required';
    return null;
  };

  const handleSave = async () => {
    const msg = isValid();
    if (msg) { setError(msg); return; }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('http://localhost/prms-backend/api/staff/patients/add.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ full_name, age: Number(age), sex, address, contact_number }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Failed to add patient');
      }
      onSaved && onSaved(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Patient</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={full_name} onChange={(e)=>setFullName(e.target.value)} placeholder="Enter full name" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={age} onChange={(e)=>setAge(e.target.value)} placeholder="e.g. 20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sex</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={sex} onChange={(e)=>setSex(e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea className="w-full border rounded px-3 py-2 text-sm" rows={3} value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Enter address" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={contact_number} onChange={(e)=>setContactNumber(e.target.value)} placeholder="e.g. 09123456789" />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

