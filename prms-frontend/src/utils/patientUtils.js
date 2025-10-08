/**
 * Format Patient ID to 4-digit string with leading zeros
 * @param {number|string} id - The patient ID to format
 * @returns {string} - Formatted ID (e.g., "0001", "0025", "1000")
 */
export const formatPatientID = (id) => {
  if (!id) return '0000';
  return id.toString().padStart(4, '0');
};

/**
 * Generate next Patient ID based on the latest patient record
 * @param {Array} patients - Array of existing patients
 * @returns {string} - Next formatted Patient ID
 */
export const generateNextPatientID = (patients) => {
  if (!patients || patients.length === 0) {
    return '0001';
  }
  
  // Find the highest existing ID
  const maxId = Math.max(...patients.map(p => parseInt(p.id) || 0));
  const nextId = maxId + 1;
  
  return formatPatientID(nextId);
};
