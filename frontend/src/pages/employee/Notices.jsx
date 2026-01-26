import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import { getAllNotices } from "../../api/NoticeApi";
import { Bell, Calendar, Clock, AlertCircle } from "lucide-react";

export default function NoticePage() {
  const [notices, setNotices] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchNotices();
  }, [currentPage]);

  const fetchNotices = async () => {
    try {
      setPageLoading(true);
      const response = await getAllNotices(currentPage, PAGE_SIZE);
      
      // Filter only published and non-expired notices
      const today = new Date();
      const activeNotices = (response.content || []).filter(notice => {
        const publishDate = new Date(notice.publishAt);
        const expireDate = notice.expireAt ? new Date(notice.expireAt) : null;
        return notice.status === 'PUBLISHED' && 
               publishDate <= today && 
               (!expireDate || expireDate >= today);
      });
      
      setNotices(activeNotices);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Error fetching notices:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load notices",
        confirmButtonColor: "#02C39A",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (pageLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto animate-fade-in space-y-6">

        {/* PAGE HEADER */}
        <div className="flex items-center gap-3 mb-6">
          
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Notices & Announcements
            </h1>
            <p className="text-sm text-gray-500">Stay updated with important information</p>
          </div>
        </div>

        {/* NOTICE LIST */}
        {notices.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-[#f1f5f9]">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No active notices available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-[var(--color-background-white)] rounded-xl p-6 border border-[#f1f5f9] shadow-sm hover:shadow-md transition-all animate-slide-up"
              >
                {/* Header with Priority */}
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex-1">
                    {notice.title}
                  </h2>
                  {notice.priority && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getPriorityColor(notice.priority)}`}>
                      {notice.priority}
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                  {notice.content}
                </p>

                {/* Dates */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#02C39A]" />
                    <span className="font-medium text-gray-700">Published:</span>
                    <span>{formatDate(notice.publishAt)}</span>
                  </div>
                  {notice.expireAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#05668D]" />
                      <span className="font-medium text-gray-700">Expires:</span>
                      <span>{formatDate(notice.expireAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
