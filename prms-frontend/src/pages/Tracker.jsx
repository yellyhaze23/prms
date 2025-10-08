import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./Tracker.css";
import { FaFilter, FaSearch, FaMapMarkerAlt, FaUsers, FaExclamationTriangle, FaCheckCircle, FaStethoscope } from "react-icons/fa";
import { formatPatientID } from "../utils/patientUtils";

const individualRedIcon = L.divIcon({
  html: `<div class="pulsating-marker"></div>`,
  className: "pulsating-marker-wrapper",
  iconSize: L.point(30, 30),
  iconAnchor: [15, 25],
});

const individualGreenIcon = L.divIcon({
  html: `<div class="pulsating-marker green"></div>`,
  className: "pulsating-marker-wrapper",
  iconSize: L.point(30, 30),
  iconAnchor: [15, 25],
});

const createClusterCustomIcon = (cluster) => {
  const markers = cluster.getAllChildMarkers();
  const redMarkers = markers.filter((m) => m.options?.isRed);
  const redCount = redMarkers.length;

  const isAllGreen = redCount === 0;

  return L.divIcon({
    html: `<div class="cluster-marker ${isAllGreen ? "green" : ""}">
             ${isAllGreen ? "" : redCount}
           </div>`,
    className: "cluster-marker-wrapper",
    iconSize: L.point(50, 50),
    iconAnchor: [25, 25],
  });
};

function LegendControl() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "topright" });

    legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    div.innerHTML = `
      <h4>Legend</h4>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-icon red"></span>
          <span>Patient with Illness</span>
        </div>
        <div class="legend-item">
          <span class="legend-icon green"></span>
          <span>Healthy Patients</span>
        </div>
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
}

function Tracker() {
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, sick, healthy
  const [selectedDisease, setSelectedDisease] = useState("all");
  const [showStats, setShowStats] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState(null);

  useEffect(() => {
    // Fetch patients
    fetch("http://localhost/prms/prms-backend/tracker.php")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch(console.error);

    // Fetch diseases
    fetch("http://localhost/prms/prms-backend/get_diseases.php")
      .then((res) => res.json())
      .then((data) => setDiseases(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchGeocodes = async () => {
      if (patients.length === 0) return;
      
      setGeocoding(true);
      setGeocodingError(null);
      
      try {
        const results = await Promise.all(
          patients.map(async (patient) => {
            try {
              const response = await fetch(
                `http://localhost/prms/prms-backend/geocode.php?address=${encodeURIComponent(
                  patient.address
                )}`
              );
              const geo = await response.json();
              
              if (geo.success && geo.lat && geo.lon) {
                return {
                  ...patient,
                  lat: geo.lat,
                  lon: geo.lon,
                };
              }
              return null;
            } catch (error) {
              console.warn(`Failed to geocode address: ${patient.address}`, error);
              return null;
            }
          })
        );
        const validLocations = results.filter((r) => r !== null);
        setLocations(validLocations);
        setFilteredLocations(validLocations);
        
        if (validLocations.length === 0) {
          setGeocodingError('No locations could be geocoded. Please check patient addresses.');
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
        setGeocodingError('Failed to load map locations. Please try again.');
      } finally {
        setGeocoding(false);
      }
    };

    fetchGeocodes();
  }, [patients]);

  // Filter locations based on search, filter type, and disease
  useEffect(() => {
    let filtered = [...locations]; // Create a new array to avoid mutations

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.disease && patient.disease.toLowerCase().includes(searchTerm.toLowerCase())) ||
        formatPatientID(patient.patient_id).includes(searchTerm)
      );
    }

    // Filter by type
    if (filterType === "sick") {
      filtered = filtered.filter(patient => patient.disease);
    } else if (filterType === "healthy") {
      filtered = filtered.filter(patient => !patient.disease);
    }

    // Filter by specific disease
    if (selectedDisease !== "all") {
      if (selectedDisease === "healthy") {
        filtered = filtered.filter(patient => !patient.disease);
      } else {
        filtered = filtered.filter(patient => 
          patient.disease && patient.disease.toLowerCase().trim() === selectedDisease.toLowerCase().trim()
        );
      }
    }


    setFilteredLocations(filtered);
  }, [locations, searchTerm, filterType, selectedDisease]);

  // Calculate statistics
  const stats = {
    total: locations.length,
    sick: locations.filter(p => p.disease).length,
    healthy: locations.filter(p => !p.disease).length,
    sickPercentage: locations.length > 0 ? Math.round((locations.filter(p => p.disease).length / locations.length) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white">Communicable Disease Tracker</h1>
          <p className="text-blue-100 mt-2">Monitor and track patient locations with disease status</p>
        </div>

        {/* Controls and Stats */}
        <div className="mb-6 space-y-6">
          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaFilter className="mr-2 text-blue-600" />
              Search & Filter Controls
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by address, disease, or Patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Patient Type Filter */}
              <div>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Patients</option>
                  <option value="sick">Sick Patients Only</option>
                  <option value="healthy">Healthy Patients Only</option>
                </select>
              </div>

              {/* Disease Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaStethoscope className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedDisease}
                  onChange={(e) => setSelectedDisease(e.target.value)}
                >
                  <option value="all">All Diseases</option>
                  <option value="healthy">Healthy Patients</option>
                  {diseases.map((disease) => (
                    <option key={disease.id} value={disease.name}>
                      {disease.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stats Toggle */}
              <div className="flex items-end">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors duration-200"
                >
                  <FaFilter className="h-4 w-4 mr-2" />
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Patients</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Sick Patients</p>
                    <p className="text-2xl font-semibold text-red-600">{stats.sick}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaCheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Healthy Patients</p>
                    <p className="text-2xl font-semibold text-green-600">{stats.healthy}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FaMapMarkerAlt className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Sick Rate</p>
                    <p className="text-2xl font-semibold text-orange-600">{stats.sickPercentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Container - KEEPING EXISTING FUNCTIONALITY */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-600" />
              Patient Location Map
            </h3>
            <div className="text-sm text-gray-600 mt-1">
              {geocoding ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading patient locations...
                </span>
              ) : geocodingError ? (
                <span className="text-red-600">{geocodingError}</span>
              ) : (
                `Showing ${filteredLocations.length} patient${filteredLocations.length !== 1 ? 's' : ''} on the map`
              )}
            </div>
          </div>
          
          <MapContainer
            center={[14.1706, 121.2436]}
            zoom={13}
            className="tracker-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <MarkerClusterGroup
              key={`cluster-${filteredLocations.length}-${searchTerm}-${filterType}-${selectedDisease}`}
              chunkedLoading
              iconCreateFunction={createClusterCustomIcon}
            >
              {filteredLocations.map((patient, i) => {
                // Show red markers for sick patients, green for healthy patients
                const isRed = !!patient.disease;
                const icon = isRed ? individualRedIcon : individualGreenIcon;
                const uniqueKey = `marker-${patient.patient_id}-${i}`;

                return (
                  <Marker
                    key={uniqueKey}
                    position={[patient.lat, patient.lon]}
                    icon={icon}
                    ref={(marker) => {
                      if (marker) {
                        marker.options.isRed = isRed;
                        marker.options.patientId = patient.patient_id;
                      }
                    }}
                  >
                    <Popup className="custom-popup">
                      <strong>Patient ID: #{formatPatientID(patient.patient_id)}</strong>
                      <br />
                      <em>{patient.disease || "No illness reported."}</em>
                      <br />
                      {patient.address}
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>

            <LegendControl />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default Tracker;
