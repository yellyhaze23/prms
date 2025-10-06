import React, { useEffect, useState } from 'react';
import api from '../../lib/api/axios';

export default function StaffLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/logs.php')
      .then((r)=> setLogs(r.data?.data || r.data || []))
      .finally(()=> setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Audit Logs</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-slate-500 uppercase">
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Entity</th>
              <th className="px-4 py-2">Entity ID</th>
              <th className="px-4 py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={5}>Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={5}>No logs found.</td></tr>
            ) : (
              logs.map((l, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{l.created_at || '-'}</td>
                  <td className="px-4 py-2">{l.action}</td>
                  <td className="px-4 py-2">{l.entity_type}</td>
                  <td className="px-4 py-2">{l.entity_id}</td>
                  <td className="px-4 py-2">{l.result}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
