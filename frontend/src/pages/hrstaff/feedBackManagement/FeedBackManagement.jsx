import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSurveys, deleteSurvey } from "../../../api/feedbackService.js";
import SurveyList from "../../../components/hrstaff/feedBackManagement/SurveyList.jsx";
import { FaPlus } from "react-icons/fa";


export default function FeedBackManagement() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('corehive_token') || sessionStorage.getItem('corehive_token');

  useEffect(() => {
  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await listSurveys(token);
      setSurveys(data || []);
    } catch (err) {
      console.error("Failed to fetch surveys:", err);
    } finally {
      setLoading(false);
    }
  };

  if (token) fetchSurveys();
}, [token]);


 const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this survey?")) return;

  try {
    await deleteSurvey(id, token);
    setSurveys((prev) => prev.filter((s) => s.id !== id));
    alert("Survey deleted successfully!");
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete survey: " + err.message);
  }
};


  return (
    <div className="w-full h-screen bg-[#F1FDF9] flex flex-col p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">Employee Feedback</h1>
          <p className="text-[#9B9B9B]">Create and manage feedback surveys</p>
        </div>
        <div>
          <Link
            to="/hr_staff/feedback/create"
            className="flex items-center gap-2 bg-[#02C39A] text-white px-4 py-2 rounded-lg hover:bg-[#1ED292]"
          >
            <FaPlus /> Create Survey
          </Link>
        </div>
      </div>

      {/* SURVEYS LIST */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-[#333333] font-medium">Loading surveys...</div>
        ) : (
          <SurveyList surveys={surveys} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
