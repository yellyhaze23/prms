import { FaTachometerAlt, FaRegFileAlt, FaUser, FaMapMarkerAlt, FaChartBar, FaCog, FaHistory } from 'react-icons/fa';

export const staffNav = [
  { to: '/staff/dashboard', label: 'Dashboard', Icon: FaTachometerAlt },
  { to: '/staff/patients', label: 'Patients', Icon: FaUser },
  { to: '/staff/records', label: 'Records', Icon: FaRegFileAlt },
  { to: '/staff/tracking', label: 'Tracking', Icon: FaMapMarkerAlt },
  { to: '/staff/reports', label: 'Reports', Icon: FaChartBar },
  { to: '/staff/audit-logs', label: 'Audit Logs', Icon: FaHistory },
  { to: '/staff/profile', label: 'Profile', Icon: FaUser },
  { to: '/staff/settings', label: 'Settings', Icon: FaCog },
];

export default staffNav;
