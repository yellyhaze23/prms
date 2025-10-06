import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaPlus } from "react-icons/fa";

function SettingsToolbar({ onSearch, onSort, sortOrder, onToggleSortOrder, onAdd, disableAdd }) {
  const [selectedSort, setSelectedSort] = useState("");
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickAway = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClickAway);
    return () => document.removeEventListener("click", onClickAway);
  }, []);

  const handleSortChange = (value) => {
    setSelectedSort(value);
    onSort(value);
    setOpen(false);
  };

  const sortLabel = selectedSort === "username" ? "Username" : selectedSort === "id" ? "ID" : "None";

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* Search */}
      <div className="relative w-full md:max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          aria-label="Search users"
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          placeholder="Search users..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2" ref={menuRef}>
        <button
          onClick={onToggleSortOrder}
          className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          title="Toggle sort order"
        >
          {sortOrder === "asc" ? (
            <><FaSortAmountUp className="mr-2" /> Asc</>
          ) : (
            <><FaSortAmountDown className="mr-2" /> Desc</>
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            Sort by: <span className="ml-1 font-medium">{sortLabel}</span>
          </button>
          {open && (
            <div className="absolute z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => handleSortChange("id")}>ID</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => handleSortChange("username")}>Username</button>
            </div>
          )}
        </div>
      </div>

      {/* Add */}
      <div className="flex md:ml-auto">
        <button
          className={`inline-flex items-center px-4 py-2 rounded-lg shadow ${disableAdd ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          onClick={!disableAdd ? onAdd : undefined}
          disabled={disableAdd}
        >
          <FaPlus className="mr-2" /> Add User
        </button>
      </div>
    </div>
  );
}

export default SettingsToolbar;
