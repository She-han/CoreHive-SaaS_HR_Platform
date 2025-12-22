import React, { useState, useEffect } from "react";
import { getSurveyQuestions, updateSurveyQuestions } from "../../../api/feedbackService";

export default function QuestionEditor({ surveyId, onSaved }) {
  const token = localStorage.getItem('corehive_token') || sessionStorage.getItem('corehive_token');
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState("TEXT");
  const [opts, setOpts] = useState(""); // options typed as "Yes|No|Maybe"

  // Load survey questions from API
  useEffect(() => {
    if (!token || !surveyId) return;
    getSurveyQuestions(surveyId, token)
      .then((res) => {
        const mapped = res.map((q) => ({
          id: q.id,
          question_text: q.questionText, 
          question_type: q.questionType,
          options: q.options ? JSON.parse(q.options) : [],
        }));
        setQuestions(mapped);
      })
      .catch((err) => alert("Failed to load questions: " + err.message));
  }, [surveyId, token]);

  // Add new question
  const handleAdd = () => {
    if (!text.trim()) return alert("Enter question text");
    const q = {
      question_text: text,
      question_type: type,
      options: type === "MCQ" ? opts.split("|").map(s => s.trim()).filter(Boolean) : type === "RATING" ? ["1","2","3","4","5"] : [],
      id: null
    };
    setQuestions([...questions, q]);
    setText(""); 
    setOpts("");
  };

  // Remove question
  const handleRemove = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  // Save to backend
  const handleSave = async () => {
    if (!token || !surveyId) return alert("Token or survey ID missing.");
    try {
      await updateSurveyQuestions(surveyId, { questions }, token);
      alert("Questions saved successfully!");
      if (onSaved) onSaved(); // optional callback
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  return (
    <div className="border p-3 rounded">
      <div className="mb-2 font-semibold text-[#333333]">Questions</div>

      {/* New Question Input */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Question text"
        className="w-full p-2 border rounded mb-2"
      />

      <div className="flex gap-2 items-center">
        <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
          <option value="TEXT">Text</option>
          <option value="RATING">Rating (1-5)</option>
          <option value="MCQ">Multiple Choice</option>
        </select>

        {type === "MCQ" && (
          <input
            value={opts}
            onChange={(e) => setOpts(e.target.value)}
            placeholder="Options: Yes|No|Maybe"
            className="p-2 border rounded flex-1"
          />
        )}

        <button type="button" onClick={handleAdd} className="bg-[#02C39A] text-white px-3 py-1 rounded">
          Add
        </button>
      </div>

      {/* Question List */}
      <div className="mt-3">
        {questions.map((q, i) => (
          <div key={i} className="flex justify-between py-1">
            <div>
              <div className="text-sm font-medium">{i + 1}. {q.question_text}</div>
              <div className="text-xs text-[#9B9B9B]">
                {q.question_type}{q.options?.length ? ` • ${q.options.join(", ")}` : ""}
              </div>
            </div>
            <button onClick={() => handleRemove(i)} className="text-red-600">Remove</button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button onClick={handleSave} className="mt-3 w-full bg-[#05668D] text-white p-2 rounded">
        Save Questions
      </button>
    </div>
  );
}
