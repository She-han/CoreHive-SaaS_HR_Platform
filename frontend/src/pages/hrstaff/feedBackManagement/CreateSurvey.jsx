import React, { useState } from "react";
import { createSurvey } from "../../../api/feedbackService";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiArrowLeft } from "react-icons/fi";

export default function CreateSurvey() {
  const navigate = useNavigate();
  const orgUuid = "org-uuid-001";//For testing purpose. Replace with real org from session/auth

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    is_anonymous: false,
    questions: [],
  });

  // Add Question (use destructuring)
  const addQuestion = () => {
    setForm({
      ...form, 
      questions: [
        ...form.questions,
        {
          question_text: "",
          question_type: "TEXT",
          options: [],
          position: form.questions.length + 1,
        },
      ],
    });
  };

  // Remove Question
  const removeQuestion = (index) => {
    let updated = [...form.questions];//copy the existing questions into a new array called updated.
    updated.splice(index, 1);//This removes 1 item from the array at position index.
    updated = updated.map((q, i) => ({ ...q, position: i + 1 }));//Reassign question positions
    setForm({ ...form, questions: updated });
  };

  // Update Question
  //Index = Which question you are editing(0=first,1=second)
  //key = Which property of the question to update(question_text, question_type, options)
  //value = new value the user entered
  const updateQuestion = (index, key, value) => {
    const updated = [...form.questions]; // Copy the questions array
    updated[index][key] = value;

    if (key === "question_type") {
      if (value === "TEXT") updated[index].options = []; //Remove all options
      if (value === "MCQ") updated[index].options = []; //Remove all options because user must type options manually
      if (value === "RATING") updated[index].options = ["1", "2", "3", "4", "5"];
    }

    setForm({ ...form, questions: updated });
  };

  // 📝 Update MCQ Options
  const updateOptions = (index, value) => {
    const updated = [...form.questions];
    updated[index].options = value.split(",").map((o) => o.trim()); //Split text into array by commas -> trim = Remove extra spaces
    setForm({ ...form, questions: updated });
  };

  // 🚀 Submit
  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("Survey title is required");
    if (form.questions.length === 0)
      return alert("Please add at least one question.");

    try {
      await createSurvey(orgUuid, form);
      alert("Survey created successfully!");
      navigate("/hr_staff/FeedBackManagement");
    } catch (err) {
      alert("Failed to create survey: " + err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#F3F8FA] to-[#E8EEF3]">

      {/* HEADER */}
      <div className="p-6 bg-white/90 backdrop-blur-md border-b shadow-sm sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">Create New Survey</h1>
          <p className="text-[#9B9B9B]">Build a customized survey with multiple question types.</p>
        </div>

        <button
          onClick={() => navigate("/hr_staff/FeedBackManagement")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 
                     rounded-lg shadow-sm transition-all"
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      {/* SCROLLABLE AREA */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* SURVEY DETAILS */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-[#0D2847] mb-4">Survey Details</h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Enter survey title..."
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#02C39A]"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
              placeholder="Enter survey description..."
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#02C39A]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

           <div className="grid grid-cols-2 gap-4">

  {/* Start Date */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-600">
      Start Date
    </label>
    <input
      type="date"
      className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#02C39A]"
      value={form.start_date}
      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
    />
  </div>

  {/* End Date */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-600">
      End Date
    </label>
    <input
      type="date"
      className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#02C39A]"
      value={form.end_date}
      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
    />
  </div>

</div>


            <label className="flex items-center gap-3 text-[#0D2847]">
              <input
                type="checkbox"
                checked={form.is_anonymous}
                onChange={(e) =>
                  setForm({ ...form, is_anonymous: e.target.checked })
                }
                className="h-5 w-5"
              />
              Allow Anonymous Responses
            </label>
          </div>
        </div>

        {/* QUESTIONS SECTION */}
        <div>
          <h2 className="text-2xl font-bold text-[#0D2847] mb-4">Questions</h2>

          {form.questions.map((q, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6 hover:shadow-2xl transition-all"
            >
              {/* Header Row */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#0D2847]">
                  Question {index + 1}
                </h3>

                <button
                  className="text-red-600 hover:text-red-800 transition"
                  onClick={() => removeQuestion(index)}
                >
                  <FiTrash2 size={22} />
                </button>
              </div>

              {/* Question Input */}
              <input
                type="text"
                placeholder="Type your question here..."
                className="w-full p-3 border rounded-lg shadow-sm mb-3"
                value={q.question_text}
                onChange={(e) =>
                  updateQuestion(index, "question_text", e.target.value)
                }
              />

              {/* Question Type */}
              <select
                className="w-full p-3 border rounded-lg shadow-sm mb-3"
                value={q.question_type}
                onChange={(e) =>
                  updateQuestion(index, "question_type", e.target.value)
                }
              >
                <option value="TEXT">Text Answer</option>
                <option value="MCQ">Multiple Choice</option>
                <option value="RATING">Rating (1–5)</option>
              </select>

              {/* MCQ INPUT */}
              {q.question_type === "MCQ" && (
                <input
                  type="text"
                  placeholder="Enter options (comma separated)"
                  className="w-full p-3 border rounded-lg shadow-sm"
                  value={q.options.join(", ")}
                  onChange={(e) => updateOptions(index, e.target.value)}
                />
              )}

              {/* RATING INFO */}
              {q.question_type === "RATING" && (
                <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  ⭐ Rating scale automatically set to: <b>1 → 5</b>
                </div>
              )}
            </div>
          ))}

          {/* ADD QUESTION BUTTON */}
          <button
            onClick={addQuestion}
            className="mt-4 px-6 py-3 bg-[#02C39A] text-white rounded-xl 
                       shadow-lg flex items-center gap-2 hover:bg-[#029575] transition-all"
          >
            <FiPlus /> Add Question
          </button>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            className="mt-6 w-full bg-[#05668D] text-white p-4 rounded-xl text-lg font-semibold
                       shadow-lg hover:bg-[#044d6a] transition-all"
          >
            Create Survey
          </button>
        </div>
      </div>
    </div>
  );
}
