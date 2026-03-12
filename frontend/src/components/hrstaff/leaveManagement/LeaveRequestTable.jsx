import React, { useState, useEffect } from "react";
import LeaveActionButtons from "./LeaveActionButtons";
import { Calendar, User, Clock, Search, Filter } from "lucide-react";

export default function LeaveRequestTable({ leaveRequests, reload }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    applyFilters();
  }, [leaveRequests, searchTerm, filterStatus]);

  const applyFilters = () => {
    let filtered = [...leaveRequests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leaveTypeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    setFilteredRequests(filtered);
  };

  return (
    <div className="w-full space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by employee name, code, leave type, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* HEADER */}
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Employee
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Leave Type
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Schedule
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">
                Days
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">
                Status
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-slate-400 italic font-medium"
                >
                  {searchTerm || filterStatus !== 'ALL' ? 'No matching leave requests found' : 'No leave requests found'}
                </td>
              </tr>
            ) : (
              filteredRequests.map((leave) => (
                <tr
                  key={leave.id || leave.requestId}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F1FDF9] border border-[#02C39A]/20 flex items-center justify-center text-[#0C397A] font-bold text-xs">
                        {leave.employeeName?.charAt(0) || "E"}
                      </div>
                      <span className="font-semibold text-slate-700 tracking-tight">
                        {leave.employeeName}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-[#05668D] border border-blue-100 uppercase tracking-tight">
                      {leave.leaveTypeName || leave.leaveType || 'N/A'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{new Date(leave.startDate || leave.fromDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 ml-4">
                        <span>to {new Date(leave.endDate || leave.toDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {leave.totalDays}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        leave.status === "PENDING"
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : leave.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-rose-50 text-rose-600 border-rose-200"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <LeaveActionButtons leave={leave} reload={reload} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
