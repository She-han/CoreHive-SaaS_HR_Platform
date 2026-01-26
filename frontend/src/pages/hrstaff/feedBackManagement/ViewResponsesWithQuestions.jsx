import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSurveyDetails,
  getResponsesWithEmployees
} from "../../../api/feedbackService";
import { FiArrowLeft, FiUser, FiHelpCircle, FiEye, FiDownload } from "react-icons/fi";
import Modal from "../../../components/common/Modal";
import * as XLSX from 'xlsx';

const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
};

export default function ViewResponsesWithQuestions() {
  const token =
    localStorage.getItem("corehive_token") ||
    sessionStorage.getItem("corehive_token");
  const { id } = useParams(); // surveyId from route params

  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getSurveyDetails(id, token), getResponsesWithEmployees(id, token)])
      .then(([surveyData, responseData]) => {
        setSurvey(surveyData || null);
        setResponses(responseData || []);
      })
      .catch((err) => console.error("Error fetching survey/responses:", err))
      .finally(() => setLoading(false));
  }, [id, token]);

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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
    setIsModalOpen(true);
  };

  const exportToExcel = () => {
    if (!responses || responses.length === 0) {
      alert('No responses to export');
      return;
    }

    const exportData = [];
    
    responses.forEach(resp => {
      const baseRow = {
        'Response ID': resp.responseId,
        'Submitted At': formatDateTime(resp.submittedAt),
      };
      
      // Add employee details only if not anonymous
      if (!survey.isAnonymous) {
        baseRow['Employee Code'] = resp.employeeCode || 'N/A';
        baseRow['Employee Name'] = resp.employeeName || 'N/A';
      }
      
      // Add all answers as columns
      resp.answers.forEach((ans, idx) => {
        const answer = ans.questionType === 'RATING' 
          ? getRatingText(parseInt(ans.selectedOption))
          : ans.answerText || ans.selectedOption || 'Not answered';
        baseRow[`Q${idx + 1}: ${ans.questionText.substring(0, 50)}...`] = answer;
      });
      
      exportData.push(baseRow);
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Survey Responses');
    
    // Auto-size columns
    const maxWidth = exportData.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => String(v).length)), 10);
    worksheet['!cols'] = Object.keys(exportData[0] || {}).map(() => ({ wch: Math.min(maxWidth, 50) }));
    
    XLSX.writeFile(workbook, `survey_${id}_responses_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!survey) return <div className="p-8 text-red-500">Survey not found.</div>;

  return (
    <div className="flex flex-col h-screen bg-[#F7FAFC]">
      {/* HEADER */}
      <div className="p-6 bg-white shadow-sm border-b sticky top-0 z-20">
        <Link
          to="/hr_staff/FeedBackManagement"
          className="flex items-center gap-2 text-[#05668D] hover:text-[#0C397A] transition"
        >
          <FiArrowLeft size={18} /> Back
        </Link>

        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#333333]">
              {survey.title}
            </h1>
            <p className="text-[#6B7280] text-sm mt-1">{survey.description}</p>
            {survey.isAnonymous && (
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                Anonymous Survey
              </span>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-4 text-[#333333]">
          Responses ({responses.length})
        </h2>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6">
        {responses.length === 0 && (
          <p className="text-center text-[#9B9B9B] mt-10 text-lg">
            No responses submitted yet.
          </p>
        )}

        {responses.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Export Button */}
            <div className="flex justify-end p-4 border-b">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-[#02C39A] text-white rounded-lg hover:bg-[#1ED292] transition"
              >
                <FiDownload /> Export to Excel
              </button>
            </div>

            {/* Responses Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response ID
                    </th>
                    {!survey.isAnonymous && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee Name
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {responses.map((resp) => (
                    <tr key={resp.responseId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{resp.responseId}
                      </td>
                      {!survey.isAnonymous && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {resp.employeeCode || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {resp.employeeName || 'N/A'}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(resp.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewResponse(resp)}
                          className="flex items-center gap-2 px-3 py-2 bg-[#05668D] text-white rounded-lg hover:bg-[#0C397A] transition"
                        >
                          <FiEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedResponse(null);
        }}
        title={`Response #${selectedResponse?.responseId}`}
        size="xl"
      >
        {selectedResponse && (
          <div className="space-y-6">
            {/* Response Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                {!survey.isAnonymous && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">Employee Code</p>
                      <p className="font-medium">{selectedResponse.employeeCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Employee Name</p>
                      <p className="font-medium">{selectedResponse.employeeName || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-xs text-gray-500">Submitted At</p>
                  <p className="font-medium">{formatDateTime(selectedResponse.submittedAt)}</p>
                </div>
              </div>
            </div>

            {/* Answers */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: THEME.dark }}>Responses</h3>
              {selectedResponse.answers.map((ans, idx) => (
                <div
                  key={ans.questionId}
                  className="bg-gray-50 p-5 rounded-lg border border-gray-200"
                >
                  <p className="font-semibold flex items-center gap-2 text-[#333333] mb-3">
                    <FiHelpCircle className="text-[#02C39A]" size={18} />
                    {idx + 1}. {ans.questionText}
                  </p>

                  {/* RATING */}
                  {ans.questionType === "RATING" && ans.selectedOption && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        {getRatingText(parseInt(ans.selectedOption))} ({ans.selectedOption}/5)
                      </span>
                    </div>
                  )}

                  {/* TEXT ANSWER */}
                  {ans.questionType === "TEXT" && ans.answerText && (
                    <p className="mt-2 text-[#333333] bg-white p-3 rounded border">
                      {ans.answerText}
                    </p>
                  )}

                  {/* MCQ */}
                  {ans.questionType === "MCQ" && ans.selectedOption && (
                    <p className="mt-2 text-[#333333]">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {ans.selectedOption}
                      </span>
                    </p>
                  )}

                  {/* NOT ANSWERED */}
                  {!ans.answerText && !ans.selectedOption && (
                    <p className="mt-2 text-red-500 italic">Not answered</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
