import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
// import { getEmployeeNotices } from "../../api/noticeApi"; // example API

export default function NoticePage() {
  const [notices, setNotices] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setPageLoading(true);

      // 🔹 Replace this with real API call
      // const response = await getEmployeeNotices();

      // MOCK DATA (safe to remove later)
      const response = {
        success: true,
        data: [
          {
            id: 1,
            title: "System Maintenance",
            description: "The system will be unavailable on Sunday from 2AM–4AM.",
            publishedDate: "2026-01-10",
            expiryDate: "2026-01-20",
          },
          {
            id: 2,
            title: "New Leave Policy",
            description: "Updated leave policy effective from February 1st.",
            publishedDate: "2026-01-05",
            expiryDate: "2026-02-01",
          },
        ],
      };

      if (response.success) {
        setNotices(response.data);
      }
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
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Notices
        </h1>

        {/* NOTICE LIST */}
        {notices.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
            No notices available
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-[var(--color-background-white)] rounded-xl p-6 border border-[#f1f5f9] shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)] animate-slide-up space-y-3"
            >
              {/* TITLE */}
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                {notice.title}
              </h2>

              {/* DETAILS */}
              <p className="text-gray-700 leading-relaxed">
                {notice.description}
              </p>

              {/* DATES */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 pt-2">
                <div>
                  <span className="font-medium text-gray-700">Published:</span>{" "}
                  {formatDate(notice.publishedDate)}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Expires:</span>{" "}
                  {formatDate(notice.expiryDate)}
                </div>
              </div>
            </div>
          ))
        )}

      </div>
    </DashboardLayout>
  );
}
