import { useEffect, useState } from "react";
import LeaveRequestTable from "../../../components/hrstaff/leaveManagement/LeaveRequestTable";
import { getAllLeaveRequests } from "../../../api/leaveRequestApi";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";

export default function LeaveManagement() {
  const user = useSelector(selectUser);
  const token = user?.token;

  const [leaveRequests, setLeaveRequests] = useState([]);

  // Load leave requests
  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    const data = await getAllLeaveRequests(token);
    setLeaveRequests(data);
  };

  return (
    <div
      style={{ backgroundColor: "#F1FDF9" }}
      className="w-full h-screen shadow-md flex flex-col p-8"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">
            Leave Management
          </h1>
          <p className="text-[#9B9B9B] font-medium">
            Review & approve employee leave requests
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-y-auto">
        <LeaveRequestTable
          leaveRequests={leaveRequests}
          reload={loadLeaves}
        />
      </div>
    </div>
  );
}
