// components/hrstaff/notices/NoticeGrid.jsx
import { useEffect, useState } from "react";
import NoticeCard from "./NoticeCard";
import { getAllNotices, deleteNotice } from "../../../api/NoticeApi";

export default function NoticeGrid() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadNotices();
  }, [page]);

  const loadNotices = async () => {
    setLoading(true);
    const data = await getAllNotices(page, 6);
    setNotices(data.content);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    await deleteNotice(id);
    loadNotices();
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          className="btn-outline"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="btn-primary"
        >
          Next
        </button>
      </div>
    </>
  );
}
