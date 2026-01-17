import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import NoticeGrid from "../../../components/hrstaff/noticemanagement/NoticeGrid";
import AddNoticeModal from "../../../components/hrstaff/noticemanagement/AddNoticeModal";

export default function NoticeManagement() {
  const [openModal, setOpenModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div
      style={{ backgroundColor: "#F1FDF9" }}
      className="w-full h-screen flex flex-col p-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">
            Notice Management
          </h1>
          <p className="text-[#9B9B9B] font-medium">
            Organization announcements
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 btn-primary mt-4 md:mt-0"
        >
          <FaPlus /> Add Notice
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <NoticeGrid key={refreshKey} />
      </div>

      {/* Modal */}
      <AddNoticeModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
