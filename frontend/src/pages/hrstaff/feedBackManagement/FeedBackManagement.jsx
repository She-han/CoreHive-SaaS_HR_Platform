import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSurveys, deleteSurvey } from "../../../api/feedbackService.js";
import SurveyList from "../../../components/hrstaff/feedBackManagement/SurveyList.jsx";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

export default function FeedBackManagement() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);

  const token =
    localStorage.getItem("corehive_token") ||
    sessionStorage.getItem("corehive_token");

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      try {
        const data = await listSurveys(token);
        setSurveys(data || []);
      } catch (err) {
        console.error("Failed to fetch surveys:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load surveys',
          confirmButtonColor: '#02C39A',
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSurveys();
  }, [token]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Survey?',
      text: 'Are you sure you want to delete this survey? This action cannot be undone.',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#02C39A',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteSurvey(id, token);
      setSurveys((prev) => prev.filter((s) => s.id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Survey deleted successfully',
        confirmButtonColor: '#02C39A',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete survey: ' + err.message,
        confirmButtonColor: '#02C39A',
      });
    }
  };

  const handleStatusChange = (surveyId, updatedSurvey) => {
    setSurveys((prev) => 
      prev.map((s) => s.id === surveyId ? { ...s, status: updatedSurvey.status } : s)
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F1FDF9] p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">
            Surveys
          </h1>
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
      <div>
        {loading ? (
          <div className="text-[#333333] font-medium">Loading surveys...</div>
        ) : (
          <SurveyList 
            surveys={surveys} 
            onDelete={handleDelete} 
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
