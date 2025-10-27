import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api/axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './StaffTracker.css';
import { FaBuilding, FaUserInjured, FaShieldAlt, FaPercentage } from 'react-icons/fa';
import SearchInput from '../../components/SearchInput';
import FilterControl from '../../components/FilterControl';
import SortControl from '../../components/SortControl';
import ModernToast from '../../components/ModernToast';
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  buttonVariants,
  hoverScale 
} from '../../utils/animations';

export default function StaffTracker() {
  const [heatmap, setHeatmap] = useState([]);
  const [summary, setSummary] = useState({ total_barangays: 0, total_patients: 0, total_sick: 0, overall_sick_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('patients');
  const [sortOrder, setSortOrder] = useState('desc');

  // Sort options for SortControl
  const sortOptions = [
    { value: 'patients', label: 'Patient Count' },
    { value: 'sick-rate', label: 'Disease Rate' },
    { value: 'name', label: 'Barangay Name' }
  ];

  // Filter options for FilterControl
  const filterOptions = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'very-high', label: 'Very High (80%+)' },
    { value: 'high', label: 'High (60-79%)' },
    { value: 'medium-high', label: 'Medium-High (40-59%)' },
    { value: 'medium', label: 'Medium (20-39%)' },
    { value: 'low', label: 'Low (10-19%)' },
    { value: 'very-low', label: 'Very Low (<10%)' }
  ];

  useEffect(() => {
    setLoading(true);
    api.get('/heatmap.php')
      .then((r)=> {
        console.log('Heatmap API Response:', r.data);
        const d = r.data?.data || [];
        const s = r.data?.summary || { total_barangays: 0, total_patients: 0, total_sick: 0, overall_sick_rate: 0 };
        console.log('Heatmap data:', d);
        console.log('Summary:', s);
        setHeatmap(d);
        setSummary(s);
      })
      .catch((err) => {
        console.error('Heatmap API Error:', err);
        setToast({
          type: 'error',
          message: 'Failed to load heatmap data. Please try again.'
        });
      })
      .finally(()=> setLoading(false));
  }, []);

  // Filter and sort heatmap data
  const getFilteredHeatmap = () => {
    let filtered = [...heatmap];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(b =>
        (b.barangay || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply risk filter
    if (riskFilter !== 'all') {
      const riskRanges = {
        'very-low': (rate) => rate < 10,
        'low': (rate) => rate >= 10 && rate < 20,
        'medium': (rate) => rate >= 20 && rate < 40,
        'medium-high': (rate) => rate >= 40 && rate < 60,
        'high': (rate) => rate >= 60 && rate < 80,
        'very-high': (rate) => rate >= 80
      };
      
      if (riskRanges[riskFilter]) {
        filtered = filtered.filter(b => riskRanges[riskFilter](b.sick_rate || 0));
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'patients':
          comparison = (b.total_patients || 0) - (a.total_patients || 0);
          break;
        case 'sick-rate':
          comparison = (b.sick_rate || 0) - (a.sick_rate || 0);
          break;
        case 'name':
          comparison = (a.barangay || '').localeCompare(b.barangay || '');
          break;
        default:
          return 0;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });
    
    return filtered;
  };

  // Handler functions for controls
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleRiskFilter = (filter) => {
    setRiskFilter(filter);
  };

  const handleSort = (sort) => {
    setSortBy(sort);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRiskFilter('all');
    setSortBy('patients');
    setSortOrder('desc');
  };

  // Map Legend Component
  const MapLegend = () => {
    const map = useMap();
    
    useEffect(() => {
      const legend = L.control({ position: 'topright' });
      
      legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
          <h4 style="margin: 0 0 12px 0; font-weight: bold; font-size: 14px; text-align: left;">Disease Hotspots</h4>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px; align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
              <span style="display: inline-block; width: 12px; height: 12px; background: rgba(255,0,0,0.8); border-radius: 50%; flex-shrink: 0;"></span>
              <span style="white-space: nowrap; text-align: left;">Very High Risk (80%+)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
              <span style="display: inline-block; width: 12px; height: 12px; background: rgba(255,100,0,0.8); border-radius: 50%; flex-shrink: 0;"></span>
              <span style="white-space: nowrap; text-align: left;">High Risk (60-79%)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
              <span style="display: inline-block; width: 12px; height: 12px; background: rgba(255,165,0,0.8); border-radius: 50%; flex-shrink: 0;"></span>
              <span style="white-space: nowrap; text-align: left;">Medium-High (40-59%)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
              <span style="display: inline-block; width: 12px; height: 12px; background: rgba(255,255,0,0.8); border-radius: 50%; flex-shrink: 0;"></span>
              <span style="white-space: nowrap; text-align: left;">Medium (20-39%)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
              <span style="display: inline-block; width: 12px; height: 12px; background: rgba(0,255,0,0.8); border-radius: 50%; flex-shrink: 0;"></span>
              <span style="white-space: nowrap; text-align: left;">Low (10-19%)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
              <span style="display: inline-block; width: 12px; height: 12px; background: rgba(0,0,255,0.8); border-radius: 50%; flex-shrink: 0;"></span>
              <span style="white-space: nowrap; text-align: left;">Very Low (&lt;10%)</span>
            </div>
          </div>
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 10px; color: #666; text-align: left;">
            Size = Patient Count | Color = Disease Rate
          </div>
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
    <motion.div 
      className="space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Modern Header - Enhanced like Admin Portal */}
      <motion.div 
        className="mb-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div variants={cardVariants}>
            <h1 className="text-3xl font-bold text-blue-600">Disease Hotspot Tracker</h1>
            <p className="text-gray-700 mt-2">Monitor disease distribution across your assigned patients' barangays</p>
          </motion.div>
          
          {/* Monitor count on the right */}
          <motion.div 
            className="flex items-center space-x-4"
            variants={cardVariants}
          >
            <div className="text-gray-600 text-sm flex items-center">
              <span className="inline mr-1">🗺️</span>
              {getFilteredHeatmap().length} areas monitored
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Total Barangays Card */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          variants={cardVariants}
          whileHover={hoverScale}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg">
                <FaBuilding className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Barangays</p>
                <p className="text-3xl font-semibold text-gray-900">{summary.total_barangays}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total Patients Card */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          variants={cardVariants}
          whileHover={hoverScale}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                <FaUserInjured className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-semibold text-gray-900">{summary.total_patients}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* High Risk Areas Card */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          variants={cardVariants}
          whileHover={hoverScale}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shadow-lg">
                <FaShieldAlt className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">High Risk Areas</p>
                <p className="text-3xl font-semibold text-red-600">
                  {heatmap.filter(b => (b.sick_rate || 0) >= 60).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overall Sick Rate Card */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          variants={cardVariants}
          whileHover={hoverScale}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center shadow-lg">
                <FaPercentage className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Overall Sick Rate</p>
                <p className="text-3xl font-semibold text-orange-600">{summary.overall_sick_rate}%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Modern Controls */}
      <div className="mb-8 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Map Controls</h3>
            <p className="text-sm text-gray-600">Filter and sort barangay data for better analysis</p>
          </div>
          
          {/* Modern Controls */}
          <div className="flex items-center space-x-4">
            {/* Modern Search Input */}
            <SearchInput
              placeholder="Search by barangay name..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-80"
            />

            {/* Modern Filter Control */}
            <FilterControl
              label="Risk Level"
              value={riskFilter}
              options={filterOptions}
              onChange={handleRiskFilter}
            />

            {/* Modern Sort Control */}
            <SortControl
              value={sortBy}
              order={sortOrder}
              options={sortOptions}
              onChange={handleSort}
              onToggleOrder={handleSortOrderToggle}
            />

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow relative z-0">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-medium text-gray-900">
            Barangay Disease Hotspots ({getFilteredHeatmap().filter(b => b.latitude && b.longitude).length} areas)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Pulsing dots show disease intensity. Larger dots = more patients. Red = high risk.
          </p>
        </div>
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="h-[600px] w-full">
            {loading ? (
              <div className="h-full bg-slate-100 rounded flex items-center justify-center">Loading map...</div>
            ) : heatmap.length === 0 ? (
              <div className="h-full bg-slate-100 rounded flex items-center justify-center flex-col gap-2">
              <p className="text-slate-600">No barangay data available</p>
              <p className="text-sm text-slate-500">Make sure patients have barangay assignments with coordinates</p>
            </div>
          ) : (
            <MapContainer center={[14.1706, 121.2436]} zoom={12} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <MapLegend />
              {(() => {
                const filtered = getFilteredHeatmap().filter(b => b.latitude && b.longitude);
                console.log('Filtered markers to render:', filtered.length, filtered);
                return filtered.map((b, idx) => {
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
              })})()}
            </MapContainer>
          )}
          </div>
        </div>
      </div>

      {/* Modern Toast Notification */}
      {toast && (
        <ModernToast
          isVisible={true}
          title={toast.type === 'success' ? 'Success!' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </motion.div>
  );
}

