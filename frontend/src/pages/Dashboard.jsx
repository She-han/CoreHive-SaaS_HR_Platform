import React from 'react'
import StatsCard from '../components/StatCard.jsx';
import EmployeeTable from '../components/EmployeeTable.jsx';

function Dashboard() {
  return (
     <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button className="bg-[#0C397A] text-white px-4 py-2 rounded-md hover:bg-[#05668D]">
          + Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Employees" value="120" color="bg-[#0C397A]" />
        <StatsCard title="Active" value="95" color="bg-[#05668D]" />
        <StatsCard title="Inactive" value="25" color="bg-[#1ED292]" />
      </div>

      <EmployeeTable />
    </div>
  )
}

export default Dashboard