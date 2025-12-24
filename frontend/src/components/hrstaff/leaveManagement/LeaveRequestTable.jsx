import LeaveActionButtons from "./LeaveActionButtons";

export default function LeaveRequestTable({ leaveRequests, reload }) {
  return (
    <div className="bg-[#FFFFFF] rounded-xl shadow border border-gray-100">
      <table className="w-full text-sm">
        {/* TABLE HEADER */}
        <thead className="bg-[#F1FDF9] border-b border-gray-200">
          <tr className="text-[#333333] uppercase text-xs tracking-wide">
            <th className="p-4 text-left">Employee</th>
            <th className="p-4 text-left">Leave Type</th>
            <th className="p-4 text-center">From</th>
            <th className="p-4 text-center">To</th>
            <th className="p-4 text-center">Days</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Action</th>
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody>
          {leaveRequests.length === 0 && (
            <tr>
              <td
                colSpan="7"
                className="p-6 text-center text-[#9B9B9B]"
              >
                No leave requests found
              </td>
            </tr>
          )}

          {leaveRequests.map((leave) => (
            <tr
              key={leave.requestId}
              className="border-b last:border-none hover:bg-[#F1FDF9] transition"
            >
              <td className="p-4 font-medium text-[#333333]">
                {leave.employeeName}
              </td>

              <td className="p-4 text-[#05668D] font-medium">
                {leave.leaveType}
              </td>

              <td className="p-4 text-center text-[#333333]">
                {leave.startDate}
              </td>

              <td className="p-4 text-center text-[#333333]">
                {leave.endDate}
              </td>

              <td className="p-4 text-center font-semibold text-[#333333]">
                {leave.totalDays}
              </td>

              {/* STATUS */}
              <td className="p-4 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      leave.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : leave.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {leave.status}
                </span>
              </td>

              {/* ACTION */}
              <td className="p-4 text-center">
                <LeaveActionButtons
                  leave={leave}
                  reload={reload}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
