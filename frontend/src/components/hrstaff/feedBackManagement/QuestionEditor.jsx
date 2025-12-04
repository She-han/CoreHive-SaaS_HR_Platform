import React, { useState } from "react";

export default function QuestionEditor({ questions = [], onAdd, onRemove }) {
  const [text, setText] = useState("");
  const [type, setType] = useState("TEXT");
  const [opts, setOpts] = useState(""); // options typed as "Yes|No|Maybe"

  const handleAdd = () => {
    if (!text.trim()) return alert("Enter question text");
    const q = { question_text: text, question_type: type, options: type === "MCQ" ? opts.split("|").map(s=>s.trim()).filter(Boolean) : null };
    onAdd(q);
    setText(""); setOpts("");
  };

  return (
    <div className="border p-3 rounded">
      <div className="mb-2 font-semibold text-[#333333]">Questions</div>
      <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Question text" className="w-full p-2 border rounded mb-2" />
      <div className="flex gap-2 items-center">
        <select value={type} onChange={(e)=>setType(e.target.value)} className="p-2 border rounded">
          <option value="TEXT">Text</option>
          <option value="RATING">Rating (1-5)</option>
          <option value="MCQ">Multiple Choice</option>
        </select>
        {type === "MCQ" && <input value={opts} onChange={(e)=>setOpts(e.target.value)} placeholder="Options: Good|Bad|OK" className="p-2 border rounded flex-1" />}
        <button type="button" onClick={handleAdd} className="bg-[#02C39A] text-white px-3 py-1 rounded">Add</button>
      </div>

      <div className="mt-3">
        {questions.map((q, i) => (
          <div key={i} className="flex justify-between py-1">
            <div>
              <div className="text-sm font-medium">{i+1}. {q.question_text}</div>
              <div className="text-xs text-[#9B9B9B]">{q.question_type}{q.options ? ` • ${q.options.join(", ")}` : ""}</div>
            </div>
            <button onClick={() => onRemove(i)} className="text-red-600">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
