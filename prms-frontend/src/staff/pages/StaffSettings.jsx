import React, { useEffect, useState } from 'react';
import api from '../../lib/api/axios';

export default function StaffSettings() {
  const [settings, setSettings] = useState({ theme: 'system', notifications: true });
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    api.get('/settings.php').then((r)=>{
      const s = r.data?.data || r.data || {};
      setSettings((cur)=>({ ...cur, ...s }));
    });
  },[]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/settings.php', settings);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Settings</h1>
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-slate-700">
            Theme
            <select value={settings.theme} onChange={(e)=>setSettings({...settings, theme: e.target.value})} className="mt-1 w-full border rounded px-3 py-2">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="text-sm text-slate-700 flex items-end gap-2">
            <input type="checkbox" checked={settings.notifications} onChange={(e)=>setSettings({...settings, notifications: e.target.checked})} />
            Enable notifications
          </label>
        </div>
        <div className="mt-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </div>
    </div>
  );
}
