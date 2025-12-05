// src/pages/hrstaff/CreateSurvey.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionEditor from "../../../components/hrstaff/feedBackManagement/QuestionEditor.jsx";
import { createSurvey } from "../../../api/feedbackService.js";

export default function CreateSurvey() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const orgUuid = "org-uuid-001";

  const addQuestion = (q) => setQuestions((prev) => [...prev, q]);
  const removeQuestion = (i) => setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title required");

    const payload = {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      is_anonymous: isAnonymous ? 1 : 0,
      target_type: "ALL",
      questions: questions.map((q, idx) => ({ ...q, position: idx + 1 })),
    };

    try {
      await createSurvey(orgUuid, payload);
      navigate("/hr_staff/FeedBackManagement");
    } catch (err) {
      alert("Create failed: " + err.message);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Survey</h2>

      {/* Card Container */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <form onSubmit={submit} className="space-y-6">

          {/* Survey Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Survey Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02C39A] outline-none"
              placeholder="Enter survey title"
            />
          </div>

          {/* Survey Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02C39A] outline-none"
              placeholder="Enter a short description"
              rows={3}
            />
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02C39A] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#02C39A] outline-none"
              />
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4"
            />
            <label className="text-sm text-gray-700">
              Allow Anonymous Responses
            </label>
          </div>

          {/* Question Editor */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Survey Questions
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Add multiple questions with different types.
            </p>

            <QuestionEditor questions={questions} onAdd={addQuestion} onRemove={removeQuestion} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-[#02C39A] text-white px-6 py-3 rounded-lg hover:bg-[#1ED292] transition"
            >
              Create Survey
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      </div>
  );
}
