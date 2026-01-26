import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import * as feedbackApi from "../../api/feedbackApi";
import Swal from "sweetalert2";

const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
};

const Feedback = () => {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);

  /* ---------------- FEEDBACK FORM ---------------- */
  const [feedbackForm, setFeedbackForm] = useState({
    feedbackType: "",
    rating: "",
    message: "",
  });

  /* ---------------- FETCH FEEDBACKS ---------------- */
  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      const response = await feedbackApi.getOwnFeedbacks();
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  /* ---------------- FEEDBACK ---------------- */
  const handleFeedbackChange = (e) => {
    setFeedbackForm({ ...feedbackForm, [e.target.name]: e.target.value });
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await feedbackApi.submitFeedback({
        ...feedbackForm,
        rating: Number(feedbackForm.rating),
      });

      Swal.fire({
        icon: "success",
        title: "Feedback Submitted",
        text: "Your feedback has been submitted successfully",
        confirmButtonColor: THEME.primary,
      });

      setFeedbackForm({ feedbackType: "", rating: "", message: "" });
      loadFeedbacks(); // Reload feedbacks
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.response?.data?.message || "Failed to submit feedback",
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackTypeColor = (type) => {
    switch (type) {
      case 'COMPLAINT': return 'bg-red-100 text-red-700';
      case 'APPRECIATION': return 'bg-green-100 text-green-700';
      case 'WORK_ENVIRONMENT': return 'bg-blue-100 text-blue-700';
      case 'MANAGEMENT': return 'bg-purple-100 text-purple-700';
      case 'SYSTEM_ISSUE': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatFeedbackType = (type) => {
    return type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRatingText = (rating) => {
    const ratings = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };
    return ratings[rating] || 'N/A';
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* ================= FEEDBACK FORM ================= */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: THEME.dark }}>
            Submit Feedback
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            You can submit up to 3 feedbacks per month. Share your thoughts with us!
          </p>

          <form onSubmit={submitFeedback} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Type <span className="text-red-500">*</span>
              </label>
              <select 
                name="feedbackType" 
                value={feedbackForm.feedbackType} 
                onChange={handleFeedbackChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
              >
                <option value="">Select Feedback Type</option>
                <option value="COMPLAINT">Complaint</option>
                <option value="APPRECIATION">Appreciation</option>
                <option value="WORK_ENVIRONMENT">Work Environment</option>
                <option value="MANAGEMENT">Management</option>
                <option value="SYSTEM_ISSUE">System Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <select 
                name="rating" 
                value={feedbackForm.rating} 
                onChange={handleFeedbackChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
              >
                <option value="">Select Rating</option>
                <option value="1">Very Poor</option>
                <option value="2">Poor</option>
                <option value="3">Average</option>
                <option value="4">Good</option>
                <option value="5">Excellent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="message" 
                value={feedbackForm.message} 
                onChange={handleFeedbackChange} 
                rows="5" 
                required 
                placeholder="Share your feedback here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={loading} 
                className="px-8 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: THEME.primary }}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= LATEST FEEDBACKS ================= */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-6" style={{ color: THEME.dark }}>
            My Feedback History
          </h2>

          {feedbacksLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No feedbacks submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div 
                  key={feedback.id} 
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(feedback.feedbackType)}`}>
                        {formatFeedbackType(feedback.feedbackType)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        {getRatingText(feedback.rating)}
                      </span>
                      {feedback.markedAsRead && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          ✓ Read by Admin
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{feedback.message}</p>

                  {feedback.reply && (
                    <div className="mt-4 p-4 rounded-lg border-l-4 border-[#02C39A]" style={{ backgroundColor: '#f0fdf9' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium" style={{ color: THEME.dark }}>
                          Admin Reply:
                        </span>
                        <span className="text-xs text-gray-500">
                          {feedback.repliedByName} • {new Date(feedback.repliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{feedback.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Feedback;
