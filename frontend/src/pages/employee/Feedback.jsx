import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getCurrentEmployeeProfile } from "../../api/employeeApi";
import apiClient from "../../api/axios";
import Swal from "sweetalert2";

const Feedback = () => {
  const { user } = useSelector((state) => state.auth);

  const [employeeId, setEmployeeId] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ---------------- FEEDBACK FORM ---------------- */
  const [feedbackForm, setFeedbackForm] = useState({
    feedbackType: "",
    rating: "",
    message: "",
  });

  /* ---------------- SURVEY ---------------- */
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyAnswers, setSurveyAnswers] = useState({});

  // 🔹 MOCK SURVEYS (replace with API)
  const surveys = [
    {
      id: 1,
      title: "Workplace Satisfaction Survey",
      expiresAt: "2025-02-10",
      questions: [
        {
          id: 1,
          type: "MCQ",
          question: "How satisfied are you with your work-life balance?",
          options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"],
        },
        {
          id: 2,
          type: "TEXT",
          question: "What improvements would you suggest?",
        },
      ],
    },
    {
      id: 2,
      title: "HR System Feedback Survey",
      expiresAt: "2025-01-15",
      questions: [
        {
          id: 3,
          type: "MCQ",
          question: "How easy is the HR system to use?",
          options: ["Very Easy", "Easy", "Average", "Difficult"],
        },
      ],
    },
  ];

  /* ---------------- FETCH EMPLOYEE ---------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await getCurrentEmployeeProfile();
        if (res.success) setEmployeeId(res.data.id);
        else throw new Error();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to load employee profile",
          confirmButtonColor: "#02C39A",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ---------------- FEEDBACK ---------------- */
  const handleFeedbackChange = (e) => {
    setFeedbackForm({ ...feedbackForm, [e.target.name]: e.target.value });
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post("/employee/employee-feedback", {
        employeeId,
        ...feedbackForm,
        rating: Number(feedbackForm.rating),
      });

      Swal.fire({
        icon: "success",
        title: "Feedback Submitted",
        confirmButtonColor: "#02C39A",
      });

      setFeedbackForm({ feedbackType: "", rating: "", message: "" });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        confirmButtonColor: "#02C39A",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SURVEY ---------------- */
  const handleSurveyChange = (qid, value) => {
    setSurveyAnswers({ ...surveyAnswers, [qid]: value });
  };

  const submitSurvey = () => {
    Swal.fire({
      icon: "success",
      title: "Survey Submitted",
      confirmButtonColor: "#02C39A",
    });

    console.log("Survey Answers:", surveyAnswers);
    setSelectedSurvey(null);
    setSurveyAnswers({});
  };

  const isExpired = selectedSurvey
    ? new Date(selectedSurvey.expiresAt) < new Date()
    : false;

  if (profileLoading) {
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
      <div className="p-8 max-w-5xl mx-auto space-y-10 animate-fade-in">

        {/* ================= FEEDBACK ================= */}
        <div className="bg-white rounded-xl p-8 shadow border border-[#f1f5f9]">
          <h1 className="text-2xl font-semibold mb-6">Employee Feedback</h1>

          <form onSubmit={submitFeedback} className="space-y-5">
            <select name="feedbackType" value={feedbackForm.feedbackType} onChange={handleFeedbackChange} required className="w-full px-4 py-3 border rounded-lg">
              <option value="">Select Feedback Type</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="APPRECIATION">Appreciation</option>
              <option value="MANAGEMENT">Management</option>
            </select>

            <select name="rating" value={feedbackForm.rating} onChange={handleFeedbackChange} required className="w-full px-4 py-3 border rounded-lg">
              <option value="">Rating</option>
              <option value="1">Very Bad</option>
              <option value="5">Excellent</option>
            </select>

            <textarea name="message" value={feedbackForm.message} onChange={handleFeedbackChange} rows="4" required className="w-full px-4 py-3 border rounded-lg" />

            <div className="flex justify-end">
              <button disabled={loading} className="bg-[var(--color-primary-500)] text-white px-8 py-3 rounded-lg">
                Submit Feedback
              </button>
            </div>
          </form>
        </div>

        {/* ================= SURVEY LIST ================= */}
        {!selectedSurvey && (
          <div className="bg-white rounded-xl p-8 shadow border border-[#f1f5f9]">
            <h2 className="text-xl font-semibold mb-6">HR Surveys</h2>

            {surveys.map((survey) => {
              const expired = new Date(survey.expiresAt) < new Date();
              return (
                <div
                  key={survey.id}
                  onClick={() => setSelectedSurvey(survey)}
                  className="flex justify-between items-center p-4 mb-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium">{survey.title}</p>
                    <p className="text-xs text-gray-500">
                      Expires on {new Date(survey.expiresAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${expired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {expired ? "Expired" : "Active"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= SURVEY DETAILS ================= */}
        {selectedSurvey && (
          <div className="bg-white rounded-xl p-8 shadow border border-[#f1f5f9] animate-slide-up">
            <button onClick={() => setSelectedSurvey(null)} className="text-sm text-blue-600 mb-4">
              ← Back to surveys
            </button>

            <h2 className="text-xl font-semibold mb-2">{selectedSurvey.title}</h2>
            <p className="text-xs text-gray-500 mb-6">
              Expires on {new Date(selectedSurvey.expiresAt).toLocaleDateString()}
            </p>

            {selectedSurvey.questions.map((q, idx) => (
              <div key={q.id} className="mb-6">
                <p className="font-medium mb-2">{idx + 1}. {q.question}</p>

                {q.type === "MCQ" ? (
                  q.options.map((opt, i) => (
                    <label key={i} className="flex gap-2 mb-2">
                      <input type="radio" disabled={isExpired} onChange={() => handleSurveyChange(q.id, opt)} />
                      {opt}
                    </label>
                  ))
                ) : (
                  <textarea rows="3" disabled={isExpired} onChange={(e) => handleSurveyChange(q.id, e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
                )}
              </div>
            ))}

            <div className="flex justify-end">
              <button disabled={isExpired} onClick={submitSurvey} className="bg-[var(--color-primary-500)] text-white px-8 py-3 rounded-lg disabled:opacity-50">
                Submit Survey
              </button>
            </div>

            {isExpired && (
              <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded text-sm text-red-700">
                This survey has expired.
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Feedback;
