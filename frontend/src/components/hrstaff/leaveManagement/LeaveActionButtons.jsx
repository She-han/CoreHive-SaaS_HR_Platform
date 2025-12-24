import { approveLeaveRequest } from "../../../api/leaveRequestApi";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { Check, X } from "lucide-react";

export default function LeaveActionButtons({ leave, reload }) {
  const user = useSelector(selectUser);
  const token = user?.token;

  const handleAction = async (approve) => {
    const confirmMsg = approve
      ? "Approve this leave request?"
      : "Reject this leave request?";

    if (!window.confirm(confirmMsg)) return;

    await approveLeaveRequest(leave.requestId, approve, token);
    reload();
  };

  // Already processed
  if (leave.status !== "PENDING") {
    return (
      <span className="text-xs text-[#9B9B9B] italic">
        No action
      </span>
    );
  }

  return (
    <div className="flex gap-2 justify-center">
      {/* APPROVE */}
      <button
        onClick={() => handleAction(true)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg
          bg-[#02C39A] text-white text-xs font-semibold
          hover:bg-[#1ED292] transition"
        title="Approve Leave"
      >
        <Check size={14} />
        Approve
      </button>

      {/* REJECT */}
      <button
        onClick={() => handleAction(false)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg
          bg-[#0C397A] text-white text-xs font-semibold
          hover:bg-[#05668D] transition"
        title="Reject Leave"
      >
        <X size={14} />
        Reject
      </button>
    </div>
  );
}
