import React from 'react';
import StatsCard from '../../components/hrstaff/StatCard.jsx';
import EmployeeTable from '../../components/hrstaff/employeemanagement/EmployeeTable.jsx';
import { NavLink, Link } from 'react-router-dom';

function HRDashboard() {
  return (
    <div style={{ backgroundColor: '#F1FDF9' }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to CoreHive
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              HR Staff Dashboard
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Total Employees"
            value="120"
            color="bg-[#0C397A]"
          />
          <StatsCard
            title="Active"
            value="95"
            color="bg-[#05668D]"
          />
          <StatsCard
            title="Inactive"
            value="25"
            color="bg-[#1ED292]"
          />
        </div>

      </div>
    </div>
  );
}

export default HRDashboard;
