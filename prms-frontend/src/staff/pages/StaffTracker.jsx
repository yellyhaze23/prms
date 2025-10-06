import React, { useEffect, useState } from 'react';
import api from '../../lib/api/axios';

export default function StaffTracker() {
  const [data, setData] = useState({ patients: [], stats: { total: 0, sick: 0, healthy: 0 }});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/staff/tracker')
      .then((r)=> setData(r.data?.data || { patients: [], stats: { total: 0, sick: 0, healthy: 0 }}))
      .finally(()=> setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Disease Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-slate-500 text-sm">Total</div>
          <div className="text-2xl font-bold">{data.stats.total}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-slate-500 text-sm">Sick</div>
          <div className="text-2xl font-bold text-red-600">{data.stats.sick}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-slate-500 text-sm">Healthy</div>
          <div className="text-2xl font-bold text-green-600">{data.stats.healthy}</div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 min-h-[300px]">
        <div className="font-medium text-slate-700 mb-2">Map (placeholder)</div>
        <div className="h-64 bg-slate-100 rounded flex items-center justify-center">
          {loading ? 'Loading map...' : 'Map coming soon'}
        </div>
      </div>
    </div>
  );
}
