import React, { useEffect, useState } from 'react';
import api from '../../lib/api/axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './StaffTracker.css';

export default function StaffTracker() {
  const [heatmap, setHeatmap] = useState([]);
  const [summary, setSummary] = useState({ total_barangays: 0, total_patients: 0, total_sick: 0, overall_sick_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');
  const [sortBy, setSortBy] = useState('Patient Count');

  useEffect(() => {
    setLoading(true);
    api.get('/heatmap.php')
      .then((r)=> {
        const d = r.data?.data || [];
        const s = r.data?.summary || { total_barangays: 0, total_patients: 0, total_sick: 0, overall_sick_rate: 0 };
        setHeatmap(d);
        setSummary(s);
      })
      .finally(()=> setLoading(false));
  }, []);

  // Filter and sort heatmap data
  const getFilteredHeatmap = () => {
    let filtered = [...heatmap];
    
    // Apply risk filter
    if (riskFilter !== 'All Risk Levels') {
      const riskRanges = {
        'Very High (80%+)': (rate) => rate >= 80,
        'High (60-79%)': (rate) => rate >= 60 && rate < 80,
        'Medium-High (40-59%)': (rate) => rate >= 40 && rate < 60,
        'Medium (20-39%)': (rate) => rate >= 20 && rate < 40,
        'Low (10-19%)': (rate) => rate >= 10 && rate < 20,
        'Very Low (<10%)': (rate) => rate < 10
      };
      
      if (riskRanges[riskFilter]) {
        filtered = filtered.filter(b => riskRanges[riskFilter](b.sick_rate || 0));
      }
    }
    
    // Apply sorting
    if (sortBy === 'Patient Count') {
      filtered.sort((a, b) => (b.total_patients || 0) - (a.total_patients || 0));
    } else if (sortBy === 'Disease Rate') {
      filtered.sort((a, b) => (b.sick_rate || 0) - (a.sick_rate || 0));
    } else if (sortBy === 'Barangay Name') {
      filtered.sort((a, b) => (a.barangay || '').localeCompare(b.barangay || ''));
    }
    
    return filtered;
  };

  const clearFilters = () => {
    setRiskFilter('All Risk Levels');
    setSortBy('Patient Count');
  };

  // Map Legend Component
  const MapLegend = () => {
    const map = useMap();
    
    useEffect(() => {
      const legend = L.control({ position: 'topright' });
      
      legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
          <h4>Disease Hotspots</h4>
          <div><span style="background: rgba(255,0,0,0.8)"></span> Very High (80%+)</div>
          <div><span style="background: rgba(255,100,0,0.8)"></span> High (60-79%)</div>
          <div><span style="background: rgba(255,165,0,0.8)"></span> Medium-High (40-59%)</div>
          <div><span style="background: rgba(255,255,0,0.8)"></span> Medium (20-39%)</div>
          <div><span style="background: rgba(0,255,0,0.8)"></span> Low (10-19%)</div>
          <div><span style="background: rgba(0,0,255,0.8)"></span> Very Low (<10%)</div>
          <div class="legend-note">Size = Patient Count | Color = Disease Rate</div>
        `;
        return div;
      };
      
      legend.addTo(map);
      
      return () => {
        legend.remove();
      };
    }, [map]);
    
    return null;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Disease Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-slate-500 text-sm">Total Barangays</div>
          <div className="text-2xl font-bold">{summary.total_barangays}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-slate-500 text-sm">Total Patients</div>
          <div className="text-2xl font-bold">{summary.total_patients}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-slate-500 text-sm">High Risk Areas</div>
          <div className="text-2xl font-bold text-red-600">{heatmap.filter(b => (b.sick_rate || 0) >= 60).length}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-slate-500 text-sm">Overall Sick Rate</div>
          <div className="text-2xl font-bold text-orange-600">{summary.overall_sick_rate}%</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Risk Level:</label>
            <select 
              value={riskFilter} 
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Risk Levels">All Risk Levels</option>
              <option value="Very High (80%+)">Very High (80%+)</option>
              <option value="High (60-79%)">High (60-79%)</option>
              <option value="Medium-High (40-59%)">Medium-High (40-59%)</option>
              <option value="Medium (20-39%)">Medium (20-39%)</option>
              <option value="Low (10-19%)">Low (10-19%)</option>
              <option value="Very Low (<10%)">Very Low (10%)</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Patient Count">Patient Count</option>
              <option value="Disease Rate">Disease Rate</option>
              <option value="Barangay Name">Barangay Name</option>
            </select>
          </div>
          
          <button
            onClick={clearFilters}
            className="px-4 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 min-h-[300px]">
        <div className="font-medium text-slate-700 mb-2">Disease Hotspot Tracker (Staff Patients)</div>
        <div className="h-[500px] w-full">
          {loading ? (
            <div className="h-full bg-slate-100 rounded flex items-center justify-center">Loading map...</div>
          ) : (
            <MapContainer center={[14.1706, 121.2436]} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <MapLegend />
              {getFilteredHeatmap().filter(b => b.latitude && b.longitude).map((b, idx) => {
                const size = Math.max(25, Math.min(80, (b.total_patients || 0) / 3));
                const rate = Number(b.sick_rate || 0);
                const color = rate >= 80 ? 'rgba(255,0,0,0.8)'
                  : rate >= 60 ? 'rgba(255,100,0,0.8)'
                  : rate >= 40 ? 'rgba(255,165,0,0.8)'
                  : rate >= 20 ? 'rgba(255,255,0,0.8)'
                  : rate >= 10 ? 'rgba(0,255,0,0.8)'
                  : 'rgba(0,0,255,0.8)';
                return (
                  <Marker
                    key={`b-${b.id}-${idx}`}
                    position={[Number(b.latitude), Number(b.longitude)]}
                    icon={L.divIcon({
                      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background: radial-gradient(circle, ${color} 0%, ${color.replace('0.8','0.3')} 70%, transparent 100%);box-shadow:0 0 20px ${color.replace('0.8','0.5')};animation:pulse 2s infinite;"></div>`,
                      className: '',
                      iconSize: L.point(size, size),
                      iconAnchor: [size/2, size/2]
                    })}
                  >
                    <Popup>
                      <div className="space-y-1 text-sm">
                        <div className="font-semibold text-gray-900">{(b.barangay || '').split(',')[0]}</div>
                        <div>Total Patients: {b.total_patients || 0}</div>
                        <div>Sick Patients: {b.sick_patients || 0}</div>
                        <div>Disease Rate: {rate}%</div>
                        {b.diseases && <div className="pt-2 border-t text-xs text-gray-600">Diseases: {b.diseases}</div>}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
