import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Tracker.css";
import { FaBuilding, FaUserInjured, FaShieldAlt, FaPercentage } from 'react-icons/fa';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Legend Control Component
function LegendControl() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "topright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.innerHTML = `
        <h4 style="margin: 0 0 10px 0; font-weight: bold;">Disease Hotspots</h4>
        <div style="font-size: 12px; line-height: 1.4;">
          <div style="margin: 2px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; background: rgba(255,0,0,0.8); border-radius: 50%; margin-right: 5px;"></span>
            Very High Risk (80%+)
          </div>
          <div style="margin: 2px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; background: rgba(255,100,0,0.8); border-radius: 50%; margin-right: 5px;"></span>
            High Risk (60-79%)
          </div>
          <div style="margin: 2px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; background: rgba(255,165,0,0.8); border-radius: 50%; margin-right: 5px;"></span>
            Medium-High (40-59%)
          </div>
          <div style="margin: 2px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; background: rgba(255,255,0,0.8); border-radius: 50%; margin-right: 5px;"></span>
            Medium (20-39%)
          </div>
          <div style="margin: 2px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; background: rgba(0,255,0,0.8); border-radius: 50%; margin-right: 5px;"></span>
            Low (10-19%)
          </div>
          <div style="margin: 2px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; background: rgba(0,0,255,0.8); border-radius: 50%; margin-right: 5px;"></span>
            Very Low (<10%)
          </div>
        </div>
        <div style="margin-top: 8px; font-size: 10px; color: #666;">
          Size = Patient Count | Color = Disease Rate
        </div>
      `;
      return div;
    };

    legend.addTo(map);
    return () => legend.remove();
  }, [map]);

  return null;
}

function Tracker() {
  const [barangayData, setBarangayData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("patients");

  useEffect(() => {
    const fetchBarangayHeatmap = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost/prms/prms-backend/get_barangay_heatmap.php');
        const data = await response.json();
        
        if (data.success) {
          setBarangayData(data.data);
          setFilteredData(data.data);
          setSummary(data.summary);
        } else {
          setError(data.error || 'Failed to load barangay data');
        }
      } catch (err) {
        console.error('Error loading barangay heatmap:', err);
        setError('Failed to load barangay data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBarangayHeatmap();
  }, []);

  // Filter and sort data
  useEffect(() => {
    let filtered = [...barangayData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(barangay =>
        barangay.barangay.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk filter
    if (riskFilter !== "all") {
      if (riskFilter === "very-low") {
        filtered = filtered.filter(barangay => barangay.sick_rate < 10);
      } else if (riskFilter === "low") {
        filtered = filtered.filter(barangay => barangay.sick_rate >= 10 && barangay.sick_rate < 20);
      } else if (riskFilter === "medium") {
        filtered = filtered.filter(barangay => barangay.sick_rate >= 20 && barangay.sick_rate < 40);
      } else if (riskFilter === "medium-high") {
        filtered = filtered.filter(barangay => barangay.sick_rate >= 40 && barangay.sick_rate < 60);
      } else if (riskFilter === "high") {
        filtered = filtered.filter(barangay => barangay.sick_rate >= 60 && barangay.sick_rate < 80);
      } else if (riskFilter === "very-high") {
        filtered = filtered.filter(barangay => barangay.sick_rate >= 80);
      }
    }

    // Sort data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "patients":
          return b.total_patients - a.total_patients;
        case "sick-rate":
          return b.sick_rate - a.sick_rate;
        case "name":
          return a.barangay.localeCompare(b.barangay);
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
  }, [barangayData, searchTerm, riskFilter, sortBy]);

  // Helper functions for heatmap visualization
  const getHotspotColor = (sickRate) => {
    if (sickRate >= 80) return 'rgba(255,0,0,0.8)'; // Red - Very high risk
    if (sickRate >= 60) return 'rgba(255,100,0,0.8)'; // Orange-red - High risk
    if (sickRate >= 40) return 'rgba(255,165,0,0.8)'; // Orange - Medium-high risk
    if (sickRate >= 20) return 'rgba(255,255,0,0.8)'; // Yellow - Medium risk
    if (sickRate >= 10) return 'rgba(0,255,0,0.8)'; // Green - Low risk
    return 'rgba(0,0,255,0.8)'; // Blue - Very low risk
  };

  const getMarkerSize = (patientCount) => {
    return Math.max(25, Math.min(80, patientCount / 3)); // Size based on patient count
  };

  const getRiskLevel = (sickRate) => {
    if (sickRate >= 80) return { level: 'Very High', emoji: '🔴', color: 'text-red-600' };
    if (sickRate >= 60) return { level: 'High', emoji: '🟠', color: 'text-orange-600' };
    if (sickRate >= 40) return { level: 'Medium-High', emoji: '🟡', color: 'text-yellow-600' };
    if (sickRate >= 20) return { level: 'Medium', emoji: '🟢', color: 'text-green-600' };
    if (sickRate >= 10) return { level: 'Low', emoji: '🔵', color: 'text-blue-600' };
    return { level: 'Very Low', emoji: '⚪', color: 'text-gray-600' };
  };

  // Calculate statistics for display
  const highRiskBarangays = filteredData.filter(barangay => barangay.sick_rate >= 60).length;
  const totalPatients = filteredData.reduce((sum, barangay) => sum + parseInt(barangay.total_patients), 0);
  const totalSick = filteredData.reduce((sum, barangay) => sum + parseInt(barangay.sick_patients), 0);
  const overallSickRate = totalPatients > 0 ? Math.round((totalSick / totalPatients) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading barangay hotspots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* Modern Header with Controls */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Disease Hotspot Tracker</h1>
              <p className="text-gray-700 mt-2">Real-time barangay-level disease monitoring across Los Baños</p>
            </div>
            
            {/* Controls on the right */}
            <div className="flex items-center space-x-4">
              <div className="text-gray-600 text-sm flex items-center">
                <span className="inline mr-1">🗺️</span>
                {filteredData.length} areas monitored
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Barangays Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg">
                  <FaBuilding className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Barangays</p>
                  <p className="text-3xl font-bold text-gray-900">{filteredData.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Patients Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                  <FaUserInjured className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPatients.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* High Risk Areas Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shadow-lg">
                  <FaShieldAlt className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">High Risk Areas</p>
                  <p className="text-3xl font-bold text-gray-900">{highRiskBarangays}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Sick Rate Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center shadow-lg">
                  <FaPercentage className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Overall Sick Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{overallSickRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Map Controls</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Barangays
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by barangay name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Risk Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Risk Level
                </label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="very-high">🔴 Very High (80%+)</option>
                  <option value="high">🟠 High (60-79%)</option>
                  <option value="medium-high">🟡 Medium-High (40-59%)</option>
                  <option value="medium">🟢 Medium (20-39%)</option>
                  <option value="low">🔵 Low (10-19%)</option>
                  <option value="very-low">⚪ Very Low (&lt;10%)</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="patients">Patient Count</option>
                  <option value="sick-rate">Disease Rate</option>
                  <option value="name">Barangay Name</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setRiskFilter("all");
                    setSortBy("patients");
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-medium text-gray-900">
              Barangay Disease Hotspots ({filteredData.length} areas)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Pulsing dots show disease intensity. Larger dots = more patients. Red = high risk.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="h-[600px] w-full">
              <MapContainer
                center={[14.1706, 121.2436]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                
                {filteredData.map((barangay, index) => {
                  const size = getMarkerSize(barangay.total_patients);
                  const color = getHotspotColor(barangay.sick_rate);
                  const riskLevel = getRiskLevel(barangay.sick_rate);
                  
                  return (
                    <Marker
                      key={`barangay-${index}`}
                      position={[barangay.latitude, barangay.longitude]}
                      icon={L.divIcon({
                        html: `
                          <div class="barangay-hotspot" style="
                            width: ${size}px; 
                            height: ${size}px; 
                            background: radial-gradient(circle, ${color} 0%, ${color.replace('0.8', '0.3')} 70%, transparent 100%);
                            border-radius: 50%;
                            animation: pulse 2s infinite;
                            box-shadow: 0 0 20px ${color.replace('0.8', '0.5')};
                          "></div>
                        `,
                        className: "barangay-hotspot-wrapper",
                        iconSize: L.point(size, size),
                        iconAnchor: [size/2, size/2]
                      })}
                    >
                      <Popup>
                        <div className="p-3 min-w-[250px]">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">
                            {barangay.barangay.split(',')[0]}
                          </h3>
                          
                          {/* Patient Statistics */}
                          <div className="space-y-1 mb-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Total Patients:</span> {barangay.total_patients}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Sick Patients:</span> {barangay.sick_patients}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Disease Rate:</span> {barangay.sick_rate}%
                            </p>
                          </div>

                          {/* Disease Information */}
                          {barangay.diseases && barangay.diseases.trim() !== '' && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-800 mb-1">Diseases Detected:</h4>
                              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                                {barangay.diseases}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {barangay.disease_types} disease type{barangay.disease_types !== 1 ? 's' : ''} detected
                              </p>
                            </div>
                          )}

                          {/* Risk Level */}
                          <div className="pt-2 border-t border-gray-200">
                            {barangay.sick_rate >= 70 && <p className="text-sm text-red-600 font-medium">🔴 High Risk</p>}
                            {barangay.sick_rate >= 50 && barangay.sick_rate < 70 && <p className="text-sm text-orange-600 font-medium">🟠 Medium-High Risk</p>}
                            {barangay.sick_rate >= 30 && barangay.sick_rate < 50 && <p className="text-sm text-yellow-600 font-medium">🟡 Medium Risk</p>}
                            {barangay.sick_rate >= 10 && barangay.sick_rate < 30 && <p className="text-sm text-green-600 font-medium">🟢 Low Risk</p>}
                            {barangay.sick_rate < 10 && <p className="text-sm text-blue-600 font-medium">🔵 Very Low Risk</p>}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                
                <LegendControl />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tracker;