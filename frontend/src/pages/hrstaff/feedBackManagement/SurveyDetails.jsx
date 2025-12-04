// src/pages/hrstaff/SurveyDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSurvey, getResponses } from "../../../api/feedbackService.js";

export default function SurveyDetails() {
  const { id } = useParams();
  const orgUuid = "ORG-ABC-123";
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getSurvey(orgUuid, id), getResponses(orgUuid, id)])
      .then(([s, r]) => { setSurvey(s); setResponses(r || []); })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!survey) return <div>Survey not found</div>;

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold">{survey.title}</h2>
      <p className="text-[#9B9B9B]">{survey.description}</p>

      <div className="mt-6">
        <h3 className="font-semibold">Responses ({responses.length})</h3>
        {responses.map((resp, idx) => (
          <div key={idx} className="p-3 border rounded mt-2">
            <div className="text-sm text-[#9B9B9B]">Submitted: {resp.submitted_at} {resp.employee_id ? `• Employee: ${resp.employee_id}` : '• Anonymous'}</div>
            <div className="mt-2">
              {resp.answers.map((a) => (
                <div key={a.question_id} className="mb-2">
                  <div className="text-sm font-medium">{survey.questions.find(q => q.id === a.question_id)?.question_text}</div>
                  <div className="text-sm text-[#333333]">{a.answer_text || a.selected_option}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
