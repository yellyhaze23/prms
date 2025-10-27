import { useState, useMemo } from 'react';

export const useInstantSearch = (data, searchFields = []) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    clearSearch: () => setSearchTerm('')
  };
};

