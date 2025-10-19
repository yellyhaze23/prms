import React, { useEffect, useState } from 'react';
import api from '../../lib/api/axios';
import SearchInput from '../../components/SearchInput';
import FilterControl from '../../components/FilterControl';
import SortControl from '../../components/SortControl';

export default function StaffLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [actionFilter, setActionFilter] = useState('');

  // Modern controls options
  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date' },
    { value: 'action', label: 'Action' },
    { value: 'entity_type', label: 'Entity' },
    { value: 'result', label: 'Result' }
  ];

  useEffect(() => {
    setLoading(true);
    api.get('/logs.php')
      .then((r)=> {
        const data = r.data?.data || r.data || [];
        setLogs(data);
        setFilteredLogs(data);
      })
      .finally(()=> setLoading(false));
  }, []);

  // Filter and sort logs
  useEffect(() => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.result?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      
      if (sortBy === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, sortBy, sortOrder]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSort = (field) => {
    setSortBy(field);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleActionFilter = (action) => {
    setActionFilter(action);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-slate-600 mt-1">Monitor your activity logs</p>
        </div>
      </div>

      {/* Modern Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Modern Search Input */}
          <SearchInput
            placeholder="Search logs..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-80"
          />

          {/* Modern Action Filter */}
          <FilterControl
            label="Action"
            value={actionFilter}
            options={actionOptions}
            onChange={handleActionFilter}
          />

          {/* Modern Sort Control */}
          <SortControl
            value={sortBy}
            order={sortOrder}
            options={sortOptions}
            onChange={handleSort}
            onToggleOrder={handleSortOrderToggle}
          />
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
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
            ) : filteredLogs.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={5}>No logs found.</td></tr>
            ) : (
              filteredLogs.map((l, idx) => (
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
