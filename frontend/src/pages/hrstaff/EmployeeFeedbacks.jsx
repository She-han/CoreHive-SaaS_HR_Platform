import React, { useState, useEffect } from 'react';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import * as feedbackApi from '../../api/feedbackApi';
import Swal from 'sweetalert2';
import { FaCheck, FaReply, FaSearch } from 'react-icons/fa';

const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
};

const EmployeeFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [replyModal, setReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedbacks, searchTerm, filterType, filterStatus]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.getAllFeedbacks();
      setFeedbacks(response.data || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load feedbacks',
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedbacks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(f => f.feedbackType === filterType);
    }

    // Status filter
    if (filterStatus === 'READ') {
      filtered = filtered.filter(f => f.markedAsRead);
    } else if (filterStatus === 'UNREAD') {
      filtered = filtered.filter(f => !f.markedAsRead);
    } else if (filterStatus === 'REPLIED') {
      filtered = filtered.filter(f => f.reply);
    }

    setFilteredFeedbacks(filtered);
  };

  const handleMarkAsRead = async (feedbackId) => {
    try {
      await feedbackApi.markFeedbackAsRead(feedbackId);
      Swal.fire({
        icon: 'success',
        title: 'Marked as Read',
        showConfirmButton: false,
        timer: 1500,
      });
      loadFeedbacks();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to mark as read',
        confirmButtonColor: THEME.primary,
      });
    }
  };

  const openReplyModal = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.reply || '');
    setReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Reply',
        text: 'Please enter a reply message',
        confirmButtonColor: THEME.primary,
      });
      return;
    }

    try {
      setSubmitting(true);
      await feedbackApi.replyToFeedback(selectedFeedback.id, replyText);
      Swal.fire({
        icon: 'success',
        title: 'Reply Submitted',
        showConfirmButton: false,
        timer: 1500,
      });
      setReplyModal(false);
      setReplyText('');
      setSelectedFeedback(null);
      loadFeedbacks();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit reply',
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getFeedbackTypeColor = (type) => {
    switch (type) {
      case 'COMPLAINT': return 'bg-red-100 text-red-700';
      case 'APPRECIATION': return 'bg-green-100 text-green-700';
      case 'WORK_ENVIRONMENT': return 'bg-blue-100 text-blue-700';
      case 'MANAGEMENT': return 'bg-purple-100 text-purple-700';
      case 'SYSTEM_ISSUE': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatFeedbackType = (type) => {
    return type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

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

  if (loading) {  
    return (
      
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      
    );
  }

  return (
    
      <div className="p-8 max-w-7xl mx-auto ">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: THEME.dark }}>
            Employee Feedbacks
          </h1>
          <p className="text-gray-600">
            View and respond to employee feedback submissions
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-1 border-blue-800">
            <p className="text-gray-600 text-sm">Total Feedbacks</p>
            <p className="text-2xl font-bold" style={{ color: THEME.dark }}>{feedbacks.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-1 border-orange-500">
            <p className="text-gray-600 text-sm">Unread</p>
            <p className="text-2xl font-bold text-red-600">
              {feedbacks.filter(f => !f.markedAsRead).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-1 border-green-500">
            <p className="text-gray-600 text-sm">Replied</p>
            <p className="text-2xl font-bold text-emerald-600">
              {feedbacks.filter(f => f.reply).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-1 border-purple-500">
            <p className="text-gray-600 text-sm">Read</p>
            <p className="text-2xl font-bold text-purple-600">
              {feedbacks.filter(f => f.markedAsRead).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, code, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
            >
              <option value="ALL">All Types</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="APPRECIATION">Appreciation</option>
              <option value="WORK_ENVIRONMENT">Work Environment</option>
              <option value="MANAGEMENT">Management</option>
              <option value="SYSTEM_ISSUE">System Issue</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
            </select>
          </div>
        </div>



        {/* Feedbacks List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No feedbacks found matching your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className={`border-2 rounded-lg p-6 transition-all hover:shadow-lg ${
                    !feedback.markedAsRead ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg" style={{ color: THEME.dark }}>
                          {feedback.employeeName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({feedback.employeeCode})
                        </span>
                        {feedback.departmentName && (
                          <span className="text-sm text-gray-500">
                            • {feedback.departmentName}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(feedback.feedbackType)}`}>
                          {formatFeedbackType(feedback.feedbackType)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          {getRatingText(feedback.rating)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!feedback.markedAsRead && (
                        <button
                          onClick={() => handleMarkAsRead(feedback.id)}
                          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors flex items-center gap-2"
                          title="Mark as Read"
                        >
                          <FaCheck /> Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => openReplyModal(feedback)}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                        style={{ backgroundColor: THEME.primary }}
                        title={feedback.reply ? 'Edit Reply' : 'Reply'}
                      >
                        <FaReply /> {feedback.reply ? 'Edit Reply' : 'Reply'}
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 pl-1">{feedback.message}</p>

                  {feedback.reply && (
                    <div className="mt-4 p-4 rounded-lg border-l-4 border-[#02C39A]" style={{ backgroundColor: '#f0fdf9' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium" style={{ color: THEME.dark }}>
                          Your Reply:
                        </span>
                        <span className="text-xs text-gray-500">
                          {feedback.repliedByName} • {new Date(feedback.repliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{feedback.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Modal */}
        <Modal
          isOpen={replyModal}
          onClose={() => {
            setReplyModal(false);
            setReplyText('');
            setSelectedFeedback(null);
          }}
          title={selectedFeedback?.reply ? 'Edit Reply' : 'Reply to Feedback'}
          size="md"
        >
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Employee: {selectedFeedback.employeeName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Type: {formatFeedbackType(selectedFeedback.feedbackType)} | Rating: {getRatingText(selectedFeedback.rating)}
                </p>
                <p className="text-sm text-gray-700">{selectedFeedback.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="5"
                  placeholder="Type your reply here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setReplyModal(false);
                    setReplyText('');
                    setSelectedFeedback(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyText.trim()}
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: THEME.primary }}
                >
                  {submitting ? 'Submitting...' : 'Submit Reply'}
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
   
  );
};

export default EmployeeFeedbacks;