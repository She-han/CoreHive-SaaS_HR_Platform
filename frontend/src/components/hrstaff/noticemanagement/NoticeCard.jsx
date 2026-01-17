// components/hrstaff/notices/NoticeCard.jsx
import { FiEdit3, FiTrash2, FiCalendar, FiClock, FiAlertCircle } from "react-icons/fi";

export default function NoticeCard({ notice, onEdit, onDelete }) {
  
  /* ================= Custom Palette Mapping ================= */
  // Primary Blue: #0C397A | Primary Teal: #02C39A | Vibrant Green: #1ED292
  // Neutral Dark: #333333 | Neutral Gray: #9B9B9B | BG Mint: #F1FDF9
  
  const priorityStyles = {
    HIGH: "bg-[#0C397A] text-white", // High contrast for high priority
    MEDIUM: "bg-[#05668D] text-white",
    LOW: "bg-[#02C39A] text-white",
  };

  const statusStyles = {
    DRAFT: "bg-gray-100 text-[#333333] border-gray-200",
    PUBLISHED: "bg-[#F1FDF9] text-[#02C39A] border-[#1ED292]/30",
    EXPIRED: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="group relative bg-[#FFFFFF] border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[#05668D]/10 hover:-translate-y-1 flex flex-col h-full">
      
      {/* ================= Header & Priority ================= */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="font-bold text-[#333333] text-lg leading-tight group-hover:text-[#0C397A] transition-colors">
          {notice.title}
        </h3>
        <span className={`text-[10px] uppercase tracking-[0.05em] px-2.5 py-1 rounded-md font-bold shrink-0 ${priorityStyles[notice.priority]}`}>
          {notice.priority}
        </span>
      </div>

      {/* ================= Status Badge ================= */}
      <div className="mb-4">
        <span className={`text-[11px] px-3 py-0.5 rounded-full border font-semibold ${statusStyles[notice.status]}`}>
          {notice.status}
        </span>
      </div>

      {/* ================= Content ================= */}
      <div className="flex-grow">
        <p className="text-sm text-[#9B9B9B] leading-relaxed line-clamp-3">
          {notice.content}
        </p>
      </div>

      {/* ================= Modern Dates Section ================= */}
      <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#9B9B9B]">
            <FiCalendar size={14} className="text-[#02C39A]" />
            <span className="text-xs font-medium">
              <span className="opacity-70">Pub:</span> {new Date(notice.publishAt).toLocaleDateString()}
            </span>
          </div>
          
          {notice.expireAt && (
            <div className="flex items-center gap-2 text-[#9B9B9B]">
              <FiClock size={14} className="text-[#05668D]" />
              <span className="text-xs font-medium">
                <span className="opacity-70">Exp:</span> {new Date(notice.expireAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* ================= Action Buttons ================= */}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(notice)}
            className="p-2.5 text-[#0C397A] hover:bg-[#F1FDF9] rounded-xl transition-all active:scale-95"
            title="Edit"
          >
            <FiEdit3 size={18} />
          </button>

          <button
            onClick={() => onDelete(notice.id)}
            className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all active:scale-95"
            title="Delete"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {/* Subtle bottom accent line that glows on hover */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1ED292] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl origin-left" />
    </div>
  );
}