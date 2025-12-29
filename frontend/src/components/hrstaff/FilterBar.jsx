import React from "react";

const FilterBar = ({ onFilterChange }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Job Role"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#02C39A]"
          onChange={(e) => onFilterChange("role", e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#02C39A]"
          onChange={(e) => onFilterChange("status", e.target.value)}
        >
          <option value="">Status</option>
          <option value="Open">Open</option>
          <option value="Draft">Draft</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <button className="bg-[#1ED292] text-white px-4 py-2 rounded-lg hover:bg-[#02C39A] transition font-medium">
        + Add Job Post
      </button>
    </div>
  );
};

export default FilterBar;
