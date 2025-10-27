import { FaTachometerAlt, FaRegFileAlt, FaUser, FaMapMarkerAlt, FaChartBar, FaStethoscope, FaChartLine } from 'react-icons/fa';

export const staffNav = [
  { to: '/staff/dashboard', label: 'Dashboard', Icon: FaTachometerAlt },
  { to: '/staff/patients', label: 'Patients', Icon: FaUser },
  { to: '/staff/records', label: 'Records', Icon: FaRegFileAlt },
  { to: '/staff/diseases', label: 'Diseases', Icon: FaStethoscope },
  { to: '/staff/tracking', label: 'Tracking', Icon: FaMapMarkerAlt },
  { to: '/staff/forecasts', label: 'Forecasts', Icon: FaChartLine },
  { to: '/staff/reports', label: 'Reports', Icon: FaChartBar },
];

export default staffNav;

