import React from "react";
import { FaArrowLeft } from "react-icons/fa";

function Return({ onBack }) {
  return (
    <div className="mb-6">
      <button 
        className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        onClick={onBack}
      >
        <FaArrowLeft className="h-4 w-4 mr-2" />
        Return
      </button>
    </div>
  );
}

export default Return;
