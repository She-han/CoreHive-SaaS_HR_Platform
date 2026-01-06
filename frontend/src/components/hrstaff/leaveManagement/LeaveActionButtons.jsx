import React from "react";
import { approveLeaveRequest } from "../../../api/leaveRequestApi";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { Check, X } from "lucide-react";

export default function LeaveActionButtons({ leave, reload }) {
  const user = useSelector(selectUser);
  const token = user?.token;

  const handleAction = async (approve) => {
    const actionType = approve ? "approve" : "reject";
    const confirmMsg = `Are you sure you want to ${actionType} this leave request?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await approveLeaveRequest(leave.requestId, approve, token);
      reload();
    } catch (error) {
      const message =
    error?.message || "Unable to process leave request";
    alert(message); // shows real reason
    }
  };

  // If status is not PENDING, show a neutral "Processed" label
  if (leave.status !== "PENDING") {
    return (
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100">
        Processed
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {/* APPROVE BUTTON */}
      <button
        onClick={() => handleAction(true)}
        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#02C39A] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#1ED292] transition-all shadow-sm hover:shadow-md active:scale-95"
        title="Approve Leave"
      >
        <Check size={14} strokeWidth={3} className="transition-transform group-hover:scale-110" />
        Approve
      </button>

      {/* REJECT BUTTON */}
      <button
        onClick={() => handleAction(false)}
        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95"
        title="Reject Leave"
      >
        <X size={14} strokeWidth={3} className="transition-transform group-hover:rotate-90" />
        Reject
      </button>
    </div>
  );
}