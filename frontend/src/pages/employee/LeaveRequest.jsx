import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getCurrentEmployeeProfile } from "../../api/employeeApi";
import { submitLeaveRequest, getEmployeeLeaveRequests, getLeaveTypes } from "../../api/leaveApi";
import Swal from "sweetalert2";

export default function LeaveRequest() {
  const [employeeId, setEmployeeId] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [form, setForm] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setPageLoading(true);
      
      // Fetch employee profile
      const profileResponse = await getCurrentEmployeeProfile();
      if (profileResponse.success && profileResponse.data) {
        const empId = profileResponse.data.id;
        setEmployeeId(empId);
        
        // Fetch leave types and history in parallel
        const [leaveTypesResponse, historyResponse] = await Promise.all([
          getLeaveTypes(),
          getEmployeeLeaveRequests(empId)
        ]);

        if (leaveTypesResponse.success) {
          setLeaveTypes(leaveTypesResponse.data);
        }

        if (historyResponse.success) {
          setHistory(historyResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load leave request data',
        confirmButtonColor: '#02C39A'
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitLeave = async () => {
    // Validation
    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#02C39A'
      });
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Dates',
        text: 'End date cannot be before start date',
        confirmButtonColor: '#02C39A'
      });
      return;
    }

    try {
      setLoading(true);

      const leaveRequestData = {
        employeeId: employeeId,
        leaveTypeId: parseInt(form.leaveTypeId),
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason
      };

      const response = await submitLeaveRequest(leaveRequestData);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your leave request has been submitted successfully',
          confirmButtonColor: '#02C39A'
        });

        // Reset form
        setForm({
          leaveTypeId: "",
          startDate: "",
          endDate: "",
          reason: "",
        });

        // Refresh history
        const historyResponse = await getEmployeeLeaveRequests(employeeId);
        if (historyResponse.success) {
          setHistory(historyResponse.data);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: response.message || 'Failed to submit leave request',
          confirmButtonColor: '#02C39A'
        });
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
        confirmButtonColor: '#02C39A'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (pageLoading) {
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
      <div className="p-8 max-w-6xl mx-auto animate-fade-in space-y-8">

        {/* PAGE HEADER */}
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
          Leave Request Portal
        </h1>

        {/* APPLY FOR LEAVE CARD */}
        <div className="bg-[var(--color-background-white)] rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)] border border-[#f1f5f9] animate-slide-up">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Apply for Leave
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                name="leaveTypeId"
                value={form.leaveTypeId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-1 outline-none"
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>{lt.name}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-1 outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                min={form.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-1 outline-none"
              />
            </div>

            {/* Reason */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                rows="3"
                value={form.reason}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-1 outline-none"
                placeholder="Explain the reason for your leave..."
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="mt-6">
            <button
              onClick={submitLeave}
              disabled={loading}
              className="bg-[var(--color-primary-500)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out hover:bg-[var(--color-primary-600)] hover:-translate-y-[1px] hover:shadow-[0_4px_6px_-1px_rgba(2,195,154,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Leave Request'
              )}
            </button>
          </div>
        </div>

        {/* LEAVE HISTORY CARD */}
        <div className="bg-[var(--color-background-white)] rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)] border border-[#f1f5f9] animate-slide-up">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-5">Leave Request History</h2>

          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-4 text-sm font-semibold text-gray-600">Type</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Start</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">End</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Days</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  history.map((row, index) => (
                    <tr key={index} className="transition even:bg-gray-50 hover:bg-[var(--color-primary-50)]">
                      <td className="p-4 text-sm border-t">{row.leaveTypeName}</td>
                      <td className="p-4 text-sm border-t">{formatDate(row.startDate)}</td>
                      <td className="p-4 text-sm border-t">{formatDate(row.endDate)}</td>
                      <td className="p-4 text-sm border-t">{row.totalDays}</td>
                      <td className="p-4 border-t">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          row.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : row.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
