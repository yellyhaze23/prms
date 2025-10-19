import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaFilter, FaSearch, FaUser, FaClock, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaTimes, FaFileAlt, FaMapMarkerAlt } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import AuditLogDetailsModal from '../components/AuditLogDetailsModal';
import FilterControl from '../components/FilterControl';
import axios from 'axios';
// Animation variants
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  listItemVariants,
  buttonVariants,
  hoverScale 
} from '../utils/animations';

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user_type: '',
    action: '',
    date_from: '',
    date_to: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Modal state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modern controls options
  const userTypeOptions = [
    { value: '', label: 'All Users' },
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staff' },
    { value: 'system', label: 'System' }
  ];
  

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, itemsPerPage, filters]);


  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      });

      const response = await axios.get(`http://localhost/prms/prms-backend/get_audit_logs.php?${params}`);

      if (response.data.success) {
        setAuditLogs(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'success':
        return <FaCheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <FaTimes className="h-4 w-4 text-red-500" />;
      case 'error':
        return <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FaClock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };


  const handlePageChange = (page, newItemsPerPage) => {
    setCurrentPage(page);
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };



  const handleUserTypeFilter = (userType) => {
    setFilters(prev => ({ ...prev, user_type: userType }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header with Controls */}
        <motion.div 
          className="mb-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div variants={cardVariants}>
              <h1 className="text-3xl font-bold text-blue-600">Audit Logs</h1>
              <p className="text-gray-700 mt-2">Monitor all system activities and user actions</p>
            </motion.div>
            
             {/* Modern Controls */}
             <div className="flex flex-wrap items-center gap-4">
               {/* Modern User Type Filter */}
               <FilterControl
                 label="User Type"
                 value={filters.user_type}
                 options={userTypeOptions}
                 onChange={handleUserTypeFilter}
               />

               {/* Date Range Filters */}
               <div className="flex items-center gap-2">
                 <span className="text-sm font-medium text-gray-700">From:</span>
                 <input
                   type="date"
                   value={filters.date_from}
                   onChange={(e) => handleFilterChange('date_from', e.target.value)}
                   className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                 />
               </div>

               <div className="flex items-center gap-2">
                 <span className="text-sm font-medium text-gray-700">To:</span>
                 <input
                   type="date"
                   value={filters.date_to}
                   onChange={(e) => handleFilterChange('date_to', e.target.value)}
                   className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                 />
               </div>

            </div>
          </div>
        </motion.div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-blue-600" />
                    Timestamp
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    User
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-blue-600" />
                    Action
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaFileAlt className="text-blue-600" />
                    Entity
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600" />
                    Result
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-600" />
                    IP Address
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaShieldAlt className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">No audit logs found</p>
                      <p className="text-sm text-gray-500">Try adjusting your filters or check back later</p>
                    </div>
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, index) => (
                  <motion.tr 
                    key={index} 
                    onClick={() => handleViewDetails(log)}
                    className="hover:bg-blue-50 hover:shadow-sm cursor-pointer transition-all duration-200 group"
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={hoverScale}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaClock className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.username || 'Unknown'}</div>
                          <div className="text-sm text-gray-500 capitalize">{log.user_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entity_type && log.entity_id ? (
                        <span className="text-gray-900">
                          {log.entity_type} #{log.entity_id}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getResultIcon(log.result)}
                        <span className={`ml-2 inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getResultColor(log.result)}`}>
                          {log.result}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-mono">
                        {log.ip_address || 'Unknown'}
                      </code>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalRecords}
            showPageSizeSelector={true}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        )}
      </div>

      {/* Audit Log Details Modal */}
      <AuditLogDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        logData={selectedLog}
      />
    </motion.div>
  );
};

export default AuditLogs;