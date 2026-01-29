import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  Bug,
  MessageCircle,
  FileText,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  createSupportTicket,
  getMyTickets,
} from "../../api/supportTicketApi";

const RequestSupportOrBugReport = () => {
  console.log("🟢 RequestSupportOrBugReport component rendering");
  
  const { user } = useSelector((state) => state.auth);
  console.log("🟢 RequestSupportOrBugReport - user from Redux:", user);
  
  const [activeTab, setActiveTab] = useState("SUPPORT_REQUEST");
  const [loading, setLoading] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const [formData, setFormData] = useState({
    priority: "MEDIUM",
    subject: "",
    description: "",
  });

  const tabs = [
    {
      id: "SUPPORT_REQUEST",
      label: "Request Support",
      icon: MessageCircle,
      color: "#02C39A",
      description: "Need help with a feature or have questions?",
    },
    {
      id: "BUG_REPORT",
      label: "Report Bug",
      icon: Bug,
      color: "#EF4444",
      description: "Found something that's not working correctly?",
    },
    {
      id: "SYSTEM_FEEDBACK",
      label: "System Feedback",
      icon: FileText,
      color: "#05668D",
      description: "Share your suggestions to improve the system",
    },
  ];

  useEffect(() => {
    console.log("=== RequestSupportOrBugReport mounted ===");
    console.log("Current user:", user);
    if (user) {
      fetchMyTickets();
    }
  }, [user]);

  const fetchMyTickets = async () => {
    console.log("=== Fetching My Tickets ===");
    setLoadingTickets(true);
    try {
      const response = await getMyTickets();
      console.log("My Tickets Response:", response);
      console.log("Response data:", response.data);
      console.log("Data type:", typeof response.data);
      console.log("Is array:", Array.isArray(response.data));
      
      if (response.status === "success") {
        const ticketsData = Array.isArray(response.data) ? response.data : [];
        console.log("My Tickets Data (final):", ticketsData);
        console.log("Number of tickets:", ticketsData.length);
        setMyTickets(ticketsData);
      } else {
        console.log("Response status not success:", response.status);
        setMyTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      console.error("Error details:", error.response?.data || error.message);
      setMyTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Subject Required",
        text: "Please enter a subject for your ticket",
        confirmButtonColor: "#02C39A",
      });
      return;
    }

    if (!formData.description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Description Required",
        text: "Please provide a detailed description",
        confirmButtonColor: "#02C39A",
      });
      return;
    }

    setLoading(true);
    try {
      const ticketData = {
        ticketType: activeTab,
        priority: formData.priority,
        subject: formData.subject,
        description: formData.description,
      };

      await createSupportTicket(ticketData);
      {
        Swal.fire({
          icon: "success",
          title: "Ticket Submitted!",
          text: `Your ${tabs
            .find((t) => t.id === activeTab)
            .label.toLowerCase()} has been submitted successfully. Our team will review it shortly.`,
          confirmButtonColor: "#02C39A",
          timer: 3000,
        });

        // Reset form
        setFormData({
          priority: "MEDIUM",
          subject: "",
          description: "",
        });

        // Refresh tickets list
        fetchMyTickets();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.message || "Failed to submit ticket. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "LOW":
        return "bg-blue-100 text-blue-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4" />;
      case "CLOSED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const activeTabData = tabs.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0C397A]">
            Support & Feedback Center
          </h1>
          <p className="text-gray-600 mt-2">
            We're here to help! Report issues, request support, or share your
            feedback.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                    activeTab === tab.id
                      ? "border-b-2 text-[#0C397A]"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{
                    borderBottomColor:
                      activeTab === tab.id ? tab.color : "transparent",
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div
              className="flex items-center gap-3 mb-6 p-4 rounded-lg"
              style={{ backgroundColor: `${activeTabData.color}15` }}
            >
              {(() => {
                const Icon = activeTabData.icon;
                return (
                  <Icon className="w-6 h-6" style={{ color: activeTabData.color }} />
                );
              })()}
              <div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: activeTabData.color }}
                >
                  {activeTabData.label}
                </h3>
                <p className="text-gray-600 text-sm">
                  {activeTabData.description}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                >
                  <option value="LOW">Low - General inquiry</option>
                  <option value="MEDIUM">Medium - Needs attention</option>
                  <option value="HIGH">High - Important issue</option>
                  <option value="CRITICAL">Critical - Urgent problem</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your request"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please provide detailed information..."
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#02C39A] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#029c7f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit {activeTabData.label}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* My Tickets Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0C397A]">My Tickets</h2>
              <p className="text-gray-600 text-sm mt-1">
                Track your submitted requests and their status
              </p>
            </div>
            <button
              onClick={fetchMyTickets}
              disabled={loadingTickets}
              className="flex items-center gap-2 px-4 py-2 text-[#02C39A] border border-[#02C39A] rounded-lg hover:bg-[#F1FDF9] transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingTickets ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <div className="p-6">
            {loadingTickets ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-[#02C39A] animate-spin" />
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No tickets submitted yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Your submitted tickets will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-[#0C397A]">
                            {ticket.subject}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status.replace("_", " ")}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {ticket.ticketType.replace("_", " ")}
                      </span>
                      {!ticket.isRead && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                          Unread
                        </span>
                      )}
                    </div>

                    {/* Admin Reply */}
                    {ticket.adminReply && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Admin Response
                          </span>
                          {ticket.repliedBy && (
                            <span className="text-xs text-green-600">
                              by {ticket.repliedBy}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-green-900 mt-2">
                          {ticket.adminReply}
                        </p>
                        {ticket.repliedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            {new Date(ticket.repliedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestSupportOrBugReport;
