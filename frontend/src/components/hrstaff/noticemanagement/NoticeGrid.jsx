// components/hrstaff/notices/NoticeGrid.jsx
import { useEffect, useState } from "react";
import NoticeCard from "./NoticeCard";
import NoticeFormModal from "./NoticeFormModal";
import { getAllNotices, deleteNotice } from "../../../api/NoticeApi";
import { FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";

export default function NoticeGrid() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Constants for pagination
  const PAGE_SIZE = 6;

  useEffect(() => {
    loadNotices();
  }, [page]);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const data = await getAllNotices(page, PAGE_SIZE);
      // Adjust according to your API response structure
      setNotices(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Failed to load notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await deleteNotice(id);
      loadNotices();
    } catch (error) {
      alert("Failed to delete notice");
    }
  };

  const handleEdit = (notice) => {
    setSelectedNotice(notice);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <FiLoader className="animate-spin text-[#02C39A]" size={40} />
        <p className="text-sm font-medium text-[#9B9B9B]">Loading notices...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-[#9B9B9B]">No notices found.</p>
          </div>
        )}
      </div>

      {/* Modern Compact Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-12">
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="p-2 rounded-xl border border-gray-200 text-[#333333] hover:bg-[#F1FDF9] hover:text-[#02C39A] hover:border-[#02C39A] disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Previous Page"
            >
              <FiChevronLeft size={20} />
            </button>

            {/* Page Number Display */}
            <div className="flex items-center px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-[#333333] uppercase tracking-wider">
                Page <span className="text-[#0C397A] ml-1">{page + 1}</span>
                <span className="mx-2 text-gray-300">/</span>
                <span className="text-[#9B9B9B]">{totalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-xl border border-gray-200 text-[#333333] hover:bg-[#F1FDF9] hover:text-[#02C39A] hover:border-[#02C39A] disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Next Page"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
          
          {/* Subtle total indicator */}
          <p className="text-[10px] text-[#9B9B9B] font-bold uppercase tracking-[0.2em]">
            Showing {notices.length} Notices
          </p>
        </div>
      )}

      {/* Edit Modal (Compact version from previous step) */}
      <NoticeFormModal
        isOpen={!!selectedNotice}
        mode="edit"
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
        onSuccess={loadNotices}
      />
    </div>
  );
}