import React from 'react'
import StatsCard from '../../components/hrstaff/StatCard.jsx';
import EmployeeTable from '../../components/hrstaff/employeemanagement/EmployeeTable.jsx';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';

function HRDashboard() {
  return (
     <div className="space-y-6 m-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Welcome to CoreHive</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Employees" value="120" color="bg-[#0C397A]" />
        <StatsCard title="Active" value="95" color="bg-[#05668D]" />
        <StatsCard title="Inactive" value="25" color="bg-[#1ED292]" />
      </div>
    </div>
  )
}

export default HRDashboard