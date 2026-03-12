import React from "react";
import { approveLeaveRequest } from "../../../api/leaveRequestApi";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlice";
import { Check, X } from "lucide-react";
import Swal from "sweetalert2";

export default function LeaveActionButtons({ leave, reload }) {
  const user = useSelector(selectUser);
  const token = user?.token;

  const handleAction = async (approve) => {
    const actionType = approve ? "approve" : "reject";
    
    const result = await Swal.fire({
      icon: 'warning',
      title: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Leave Request?`,
      text: `Are you sure you want to ${actionType} this leave request for ${leave.employeeName}?`,
      showCancelButton: true,
      confirmButtonColor: approve ? '#02C39A' : '#d33',
      cancelButtonColor: '#9B9B9B',
      confirmButtonText: `Yes, ${actionType}!`,
      cancelButtonText: 'Cancel'
    });
    
    if (!result.isConfirmed) return;

    try {
      await approveLeaveRequest(leave.id || leave.requestId, approve, token);
      await Swal.fire({
        icon: 'success',
        title: `Leave ${approve ? 'Approved' : 'Rejected'}!`,
        text: `The leave request has been ${approve ? 'approved' : 'rejected'} successfully.`,
        confirmButtonColor: '#02C39A',
        timer: 2000,
        showConfirmButton: false
      });
      reload();
    } catch (error) {
      const message = error?.message || "Unable to process leave request";
      await Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: message,
        confirmButtonColor: '#02C39A'
      });
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
        <Check
          size={14}
          strokeWidth={3}
          className="transition-transform group-hover:scale-110"
        />
        Approve
      </button>

      {/* REJECT BUTTON */}
      <button
        onClick={() => handleAction(false)}
        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95"
        title="Reject Leave"
      >
        <X
          size={14}
          strokeWidth={3}
          className="transition-transform group-hover:rotate-90"
        />
        Reject
      </button>
    </div>
  );
}
