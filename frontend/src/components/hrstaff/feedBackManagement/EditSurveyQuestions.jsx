import React, { useEffect, useState } from "react";
import { getSurveyQuestions, updateSurveyQuestions } from "../../../api/feedbackService";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiArrowLeft } from "react-icons/fi";

export default function EditSurveyQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const token = localStorage.getItem('corehive_token') || sessionStorage.getItem('corehive_token');

    // Load survey questions
  useEffect(() => {
    if (!token) return; // prevent call if token not available
    getSurveyQuestions(id, token)
      .then((res) => {
        const mapped = res.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options ? JSON.parse(q.options) : [],
          position: q.position,
        }));
        setQuestions(mapped);
      })
      .catch((err) => {
        alert("Failed to load questions: " + err.message);
      });
  }, [id, token]);

  // Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: null,
        questionText: "",
        questionType: "TEXT",
        options: [],
        position: questions.length + 1,
      },
    ]);
  };

  // Remove question with confirmation
  const removeQuestion = (index) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Question ${index + 1}?`
    );

    if (!confirmDelete) return;

    let updated = [...questions];
    updated.splice(index, 1);
    updated = updated.map((q, i) => ({ ...q, position: i + 1 }));
    setQuestions(updated);
  };

  // Update question fields
  const updateField = (index, key, value) => {
    const updated = [...questions];
    updated[index][key] = value;

    if (key === "questionType") {
      if (value === "RATING") {
        updated[index].options = ["1", "2", "3", "4", "5"];
      } else if (value === "TEXT") {
        updated[index].options = [];
      } else if (value === "MCQ") {
        updated[index].options = [];
      }
    }

    setQuestions(updated);
  };

  // Save all changes
  const saveChanges = async () => {
    if (!token) return alert("Token not found. Please login again.");

    try {
      await updateSurveyQuestions(id, { questions }, token); // pass token here
      alert("Survey updated successfully!");
      navigate("/hr_staff/FeedBackManagement");
    } catch (err) {
      alert("Failed to save changes: " + err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7FAFC]">

      {/* HEADER */}
      <div className="p-6 bg-white border-b shadow-sm flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          <FiArrowLeft /> Back
        </button>

        <h1 className="text-2xl font-bold text-[#0D2847] ml-4">
          Edit Survey Questions
        </h1>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6">

        {questions.map((q, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6 hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0D2847]">
                Question {index + 1}
              </h3>
              <button
                className="text-red-600 hover:text-red-800 transition"
                onClick={() => removeQuestion(index)}
              >
                <FiTrash2 size={20} />
              </button>
            </div>

            {/* Question Text */}
            <input
              type="text"
              placeholder="Edit question..."
              className="w-full p-3 border rounded-lg mb-3 shadow-sm"
              value={q.questionText}
              onChange={(e) => updateField(index, "questionText", e.target.value)}
            />

            {/* Question Type */}
            <select
              className="w-full p-3 border rounded-lg mb-3 shadow-sm"
              value={q.questionType}
              onChange={(e) => updateField(index, "questionType", e.target.value)}
            >
              <option value="TEXT">Text Answer</option>
              <option value="MCQ">Multiple Choice</option>
              <option value="RATING">Rating (1–5)</option>
            </select>

            {/* MCQ Options */}
            {q.questionType === "MCQ" && (
              <input
                type="text"
                placeholder="Enter MCQ options (comma separated)"
                className="w-full p-3 border rounded-lg shadow-sm"
                value={q.options.join(", ")}
                onChange={(e) =>
                  updateField(index, "options", e.target.value.split(",").map((o) => o.trim()))
                }
              />
            )}

            {/* Rating Info */}
            {q.questionType === "RATING" && (
              <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                ⭐ Rating scale is automatically set to <b>1 - 5</b>.
              </div>
            )}
          </div>
        ))}

        {/* ADD QUESTION BUTTON */}
        <button
          onClick={addQuestion}
          className="mt-4 px-6 py-3 bg-[#02C39A] text-white rounded-xl shadow-lg 
                     flex items-center gap-2 hover:bg-[#029575] transition-all"
        >
          <FiPlus /> Add Question
        </button>

        {/* SAVE BUTTON */}
        <button
          onClick={saveChanges}
          className="mt-6 w-full bg-[#05668D] text-white p-4 rounded-xl
                     text-lg font-semibold shadow-lg hover:bg-[#044d6a] transition-all"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
