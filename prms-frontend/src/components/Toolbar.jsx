import React, { useState } from "react";
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaPlus, FaChevronDown } from "react-icons/fa";

function Toolbar({ onSearch, onSort, onAdd, sortOrder, onToggleSortOrder, disableAdd }) {
  const [selectedSort, setSelectedSort] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSortChange = (value) => {
    setSelectedSort(value);
    onSort(value);
    setDropdownOpen(false);
  };

  const sortLabel = selectedSort
    ? selectedSort === "id"
      ? "ID"
      : selectedSort === "full_name"
      ? "Name"
      : selectedSort === "age"
      ? "Age"
      : selectedSort === "sex"
      ? "Gender"
      : selectedSort === "address"
      ? "Address"
      : selectedSort
    : "None";

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search patients by name, contact, or address..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onToggleSortOrder}
              title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              {sortOrder === "asc" ? <FaSortAmountUp className="h-4 w-4" /> : <FaSortAmountDown className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Sort by: {sortLabel}
              <FaChevronDown className="ml-2 h-4 w-4" />
            </button>

            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleSortChange("id")}
                      >
                        ID
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleSortChange("full_name")}
                      >
                        Name
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleSortChange("age")}
                      >
                        Age
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleSortChange("sex")}
                      >
                        Gender
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleSortChange("address")}
                      >
                        Address
                      </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Button */}
        <button
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            disableAdd 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={!disableAdd ? onAdd : undefined}
          disabled={disableAdd}
        >
          <FaPlus className="h-4 w-4 mr-2" />
          Add Patient
        </button>
      </div>
    </div>
  );
}

export default Toolbar;

