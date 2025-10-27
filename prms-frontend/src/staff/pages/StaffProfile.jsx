import React, { useEffect, useState } from 'react';
import api from '../../lib/api/axios';

export default function StaffProfile() {
  const [profile, setProfile] = useState({ username: '', name: '', email: '', phone: '' });
  const [pwd, setPwd] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    api.get('/me.php').then((r)=>{
      const me = r.data?.data || r.data || {};
      setProfile((p)=>({ ...p, username: me.username || p.username }));
    });
    api.get('/profile.php').then((r)=>{
      const p = r.data?.data || r.data || {};
      setProfile((cur)=>({ ...cur, ...p }));
    });
  },[]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/profile.php', profile);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pwd.new_password || pwd.new_password !== pwd.confirm_password) return;
    setSaving(true);
    try {
      await api.put('/profile_password.php', pwd);
      setPwd({ old_password: '', new_password: '', confirm_password: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">User Profile</h1>

      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-slate-700">
            Username
            <input value={profile.username} onChange={(e)=>setProfile({...profile, username: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            Name
            <input value={profile.name} onChange={(e)=>setProfile({...profile, name: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            Email
            <input value={profile.email} onChange={(e)=>setProfile({...profile, email: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            Phone
            <input value={profile.phone} onChange={(e)=>setProfile({...profile, phone: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
        </div>
        <div className="mt-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="text-sm text-slate-700">
            Old Password
            <input type="password" value={pwd.old_password} onChange={(e)=>setPwd({...pwd, old_password: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            New Password
            <input type="password" value={pwd.new_password} onChange={(e)=>setPwd({...pwd, new_password: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            Confirm Password
            <input type="password" value={pwd.confirm_password} onChange={(e)=>setPwd({...pwd, confirm_password: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
        </div>
        <div className="mt-3">
          <button className="bg-slate-700 text-white px-4 py-2 rounded" onClick={changePassword} disabled={saving}>{saving ? 'Saving...' : 'Change Password'}</button>
        </div>
      </div>
    </div>
  );
}

