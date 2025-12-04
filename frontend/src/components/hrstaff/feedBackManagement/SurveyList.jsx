import React from "react";
import { Link } from "react-router-dom";

export default function SurveyList({ surveys = [], onDelete }) {
  if (!surveys.length) return <div className="text-[#9B9B9B]">No surveys yet</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {surveys.map((s) => (
        <div key={s.id} className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#333333]">{s.title}</h3>
              <p className="text-sm text-[#9B9B9B]">{s.description}</p>
              <div className="text-xs text-[#9B9B9B] mt-2">From {s.start_date} to {s.end_date}</div>
            </div>
            <div className="flex flex-col gap-2">
              <Link to={`/hr_staff/feedback/${s.id}`} className="text-sm px-3 py-1 border rounded hover:bg-[#F1FDF9]">View</Link>
              <button onClick={() => onDelete(s.id)} className="text-sm px-3 py-1 border rounded text-red-600">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
