import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSurveys, deleteSurvey } from "../../../api/feedbackService.js";
import SurveyList from "../../../components/hrstaff/feedBackManagement/SurveyList.jsx";
import { FaPlus } from "react-icons/fa";

export default function FeedBackManagement() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const orgUuid = "org-uuid-001"; // replace with real org from session/auth

  useEffect(() => {
    setLoading(true);
    listSurveys(orgUuid)
      .then((data) => setSurveys(data || []))
      .catch((err) => console.error("List error", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this survey?")) return;
    try {
      await deleteSurvey(orgUuid, id);
      setSurveys((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">Employee Feedback</h1>
          <p className="text-[#9B9B9B]">Create and manage feedback surveys</p>
        </div>
        <div>
          <Link to="/hr_staff/feedback/create" className="flex items-center gap-2 bg-[#02C39A] text-white px-4 py-2 rounded-lg hover:bg-[#1ED292]">
           <FaPlus /> Create Survey
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? <div>Loading...</div> : <SurveyList surveys={surveys} onDelete={handleDelete} />}
      </div>
    </div>
  );
}
