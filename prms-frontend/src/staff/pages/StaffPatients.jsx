import React, { useEffect, useState } from 'react';
import api from '../../lib/api/axios';
import AddPatientModal from '../components/AddPatientModal';
import Toast from '../../components/Toast';

export default function StaffPatients() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/patients.php', { params: { page, q } })
      .then((r) => {
        const data = r.data?.data || [];
        const meta = r.data?.meta || { page: page, pageSize: 10, total: data.length };
        setList(data);
        setMeta(meta);
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || err.message || 'Failed to load patients';
        setError(msg);
        setList([]);
        setMeta({ page, pageSize: 10, total: 0 });
      })
      .finally(() => setLoading(false));
  }, [page, q, reload]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Patients</h1>
          <p className="text-slate-500 text-sm">Assigned to you</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patients..."
            className="border rounded px-3 py-2 text-sm"
          />
          <button className="bg-blue-600 text-white text-sm px-3 py-2 rounded" onClick={() => setPage(1)}>Search</button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow text-sm"
            onClick={() => setShowAdd(true)}
          >
            Add Patient
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-slate-500 uppercase">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Sex</th>
              <th className="px-4 py-2">Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={5}>Loading...</td></tr>
            ) : error ? (
              <tr><td className="px-4 py-6 text-red-600" colSpan={5}>{error}</td></tr>
            ) : list.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={5}>No patients found.</td></tr>
            ) : (
              list.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.full_name}</td>
                  <td className="px-4 py-2">{p.age ?? '-'}</td>
                  <td className="px-4 py-2">{p.sex ?? '-'}</td>
                  <td className="px-4 py-2">{p.address ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        {(() => {
          const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.pageSize || 10)));
          return (
            <>
              <div>Page {page} of {totalPages}</div>
              <div className="space-x-2">
                <button className="px-3 py-1 border rounded" disabled={page<=1 || loading} onClick={() => setPage((p)=>Math.max(1,p-1))}>Prev</button>
                <button className="px-3 py-1 border rounded" disabled={page>=totalPages || loading} onClick={() => setPage((p)=>p+1)}>Next</button>
              </div>
            </>
          );
        })()}
      </div>

      {showAdd && (
        <AddPatientModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            setToast({ message: 'Patient added successfully', type: 'success' });
            setReload((n) => n + 1);
          }}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
