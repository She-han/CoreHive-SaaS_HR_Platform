import React from "react";
import LeaveActionButtons from "./LeaveActionButtons";
import { Calendar, User, Clock } from "lucide-react";

export default function LeaveRequestTable({ leaveRequests, reload }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* HEADER */}
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Leave Type</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Schedule</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Days</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-slate-100">
            {leaveRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic font-medium">
                  No pending leave requests found
                </td>
              </tr>
            ) : (
              leaveRequests.map((leave) => (
                <tr
                  key={leave.requestId}
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
                      {leave.leaveType}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{leave.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 ml-4">
                        <span>to {leave.endDate}</span>
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
                    <LeaveActionButtons
                      leave={leave}
                      reload={reload}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}