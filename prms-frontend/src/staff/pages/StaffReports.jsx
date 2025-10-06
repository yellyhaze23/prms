import React, { useState } from 'react';
import api from '../../lib/api/axios';

export default function StaffReports() {
  const [params, setParams] = useState({ from: '', to: '', disease: '' });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await api.get('/reports.php', { params });
      setData(r.data?.data || r.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Reports</h1>
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm">
            From
            <input type="date" value={params.from} onChange={(e)=>setParams({...params, from: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm">
            To
            <input type="date" value={params.to} onChange={(e)=>setParams({...params, to: e.target.value})} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm md:col-span-2">
            Disease
            <input value={params.disease} onChange={(e)=>setParams({...params, disease: e.target.value})} placeholder="e.g., Dengue" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
        </div>
        <div className="mt-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={generate} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
        </div>
      </div>
      {data && (
        <div className="bg-white border rounded-lg p-4">
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
