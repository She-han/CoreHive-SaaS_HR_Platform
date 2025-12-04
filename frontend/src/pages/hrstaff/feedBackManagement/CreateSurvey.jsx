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
  const orgUuid = "ORG-ABC-123";

  const addQuestion = (q) => setQuestions((p) => [...p, q]);
  const removeQuestion = (i) => setQuestions((p) => p.filter((_, idx) => idx !== i));

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
    <div className="w-full p-8">
      <h2 className="text-xl font-semibold text-[#333333] mb-4">Create Survey</h2>
      <form onSubmit={submit} className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border rounded" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border rounded" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          Anonymous Responses
        </label>

        <QuestionEditor questions={questions} onAdd={addQuestion} onRemove={removeQuestion} />

        <div className="flex gap-2">
          <button type="submit" className="bg-[#02C39A] text-white px-4 py-2 rounded hover:bg-[#1ED292]">Create</button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
